import base64
import hashlib
import hmac
import json
import uuid
from datetime import timedelta

from django.conf import settings
from django.http import HttpResponseRedirect
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework import status

from .models import Payment, Coupon, SubscriptionPlan, ReferralReward, CheckoutAttempt, PayoutRequest, PLAN_PRICES


def _esewa_signature(message: str) -> str:
    key = settings.ESEWA_SECRET_KEY.encode('utf-8')
    sig = hmac.new(key, message.encode('utf-8'), hashlib.sha256).digest()
    return base64.b64encode(sig).decode('utf-8')


def _get_plan(tier):
    """Return {amount, months} from DB plan, falling back to PLAN_PRICES."""
    try:
        plan = SubscriptionPlan.objects.get(tier=tier)
        return {'amount': plan.amount, 'months': plan.months}
    except SubscriptionPlan.DoesNotExist:
        return PLAN_PRICES.get(tier)


def _resolve_code(code):
    """
    Check code against admin coupons first, then user referral codes.
    Returns (type, obj, discount_percent) where type is 'coupon' or 'referral',
    or (None, None, None) if not found / inactive.
    """
    from django.contrib.auth import get_user_model
    User = get_user_model()

    # Admin coupon
    try:
        coupon = Coupon.objects.get(code=code, is_active=True)
        return 'coupon', coupon, coupon.discount_percent
    except Coupon.DoesNotExist:
        pass

    # User referral code
    try:
        referrer = User.objects.get(referral_code=code, is_active=True)
        return 'referral', referrer, 10
    except User.DoesNotExist:
        pass

    return None, None, None


# ── Plan Pricing ─────────────────────────────────────────────────────────────

class SubscriptionPlanListView(APIView):
    """GET (public) → all plans. PATCH (admin) → update a plan's amount."""

    def get_permissions(self):
        if self.request.method in ('GET', 'HEAD', 'OPTIONS'):
            return [AllowAny()]
        return [IsAdminUser()]

    def get(self, request):
        from django.core.cache import cache
        from nebexam.cache import make_cache_key, CACHE_TTL
        key = make_cache_key(request)
        cached = cache.get(key)
        if cached is not None:
            return Response(cached)
        plans = {p.tier: {'label': p.label, 'amount': p.amount, 'months': p.months}
                 for p in SubscriptionPlan.objects.all()}
        # Merge fallback tiers that may not be in DB yet
        for tier, defaults in PLAN_PRICES.items():
            if tier not in plans:
                plans[tier] = defaults
        cache.set(key, plans, CACHE_TTL)
        return Response(plans)

    def patch(self, request):
        """
        Expects: { "1month": {"amount": 120}, "3month": {"amount": 250}, ... }
        Only updates fields provided.
        """
        from django.core.cache import cache
        updated = []
        for tier, data in request.data.items():
            try:
                plan = SubscriptionPlan.objects.get(tier=tier)
            except SubscriptionPlan.DoesNotExist:
                continue
            if 'amount' in data:
                plan.amount = int(data['amount'])
            if 'months' in data:
                plan.months = int(data['months'])
            if 'label' in data:
                plan.label = data['label']
            plan.save()
            updated.append(tier)
        cache.clear()
        return Response({'updated': updated})


# ── Coupon CRUD ───────────────────────────────────────────────────────────────

class CouponListCreateView(APIView):
    """GET/POST — admin only."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        coupons = Coupon.objects.all()
        data = [
            {
                'id':               c.id,
                'name':             c.name,
                'purpose':          c.purpose,
                'code':             c.code,
                'discount_percent': c.discount_percent,
                'is_active':        c.is_active,
                'created_at':       c.created_at,
                'uses':             c.payments.filter(status=Payment.STATUS_SUCCESS).count(),
            }
            for c in coupons
        ]
        return Response(data)

    def post(self, request):
        code             = request.data.get('code', '').strip().upper()
        name             = request.data.get('name', '').strip()
        purpose          = request.data.get('purpose', '').strip()
        discount_percent = request.data.get('discount_percent')

        if not code or not name or discount_percent is None:
            return Response({'detail': 'code, name and discount_percent are required.'}, status=400)

        try:
            discount_percent = int(discount_percent)
            if not (1 <= discount_percent <= 100):
                raise ValueError
        except (ValueError, TypeError):
            return Response({'detail': 'discount_percent must be 1–100.'}, status=400)

        if Coupon.objects.filter(code=code).exists():
            return Response({'detail': 'A coupon with this code already exists.'}, status=400)

        coupon = Coupon.objects.create(
            code=code, name=name, purpose=purpose,
            discount_percent=discount_percent,
        )
        return Response({
            'id':               coupon.id,
            'name':             coupon.name,
            'purpose':          coupon.purpose,
            'code':             coupon.code,
            'discount_percent': coupon.discount_percent,
            'is_active':        coupon.is_active,
            'created_at':       coupon.created_at,
            'uses':             0,
        }, status=201)


class CouponDetailView(APIView):
    """PATCH / DELETE — admin only."""
    permission_classes = [IsAdminUser]

    def _get(self, pk):
        try:
            return Coupon.objects.get(pk=pk)
        except Coupon.DoesNotExist:
            return None

    def patch(self, request, pk):
        coupon = self._get(pk)
        if not coupon:
            return Response({'detail': 'Not found.'}, status=404)
        for field in ('name', 'purpose', 'is_active'):
            if field in request.data:
                setattr(coupon, field, request.data[field])
        if 'discount_percent' in request.data:
            try:
                dp = int(request.data['discount_percent'])
                if not (1 <= dp <= 100):
                    raise ValueError
                coupon.discount_percent = dp
            except (ValueError, TypeError):
                return Response({'detail': 'discount_percent must be 1–100.'}, status=400)
        coupon.save()
        return Response({'detail': 'Updated.'})

    def delete(self, request, pk):
        coupon = self._get(pk)
        if not coupon:
            return Response({'detail': 'Not found.'}, status=404)
        coupon.delete()
        return Response(status=204)


class ValidateCouponView(APIView):
    """POST {code, tier} → discount info. Handles both admin coupons and user referral codes."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        tier = request.data.get('tier', '')
        if not code:
            return Response({'detail': 'code is required.'}, status=400)

        code_type, obj, discount_percent = _resolve_code(code)
        if code_type is None:
            return Response({'detail': 'Invalid or inactive code.'}, status=400)

        # Prevent using your own referral code
        if code_type == 'referral' and obj == request.user:
            return Response({'detail': 'You cannot use your own referral code.'}, status=400)

        plan = _get_plan(tier)
        if not plan:
            return Response({'detail': 'Invalid plan.'}, status=400)

        original = plan['amount']
        discount  = round(original * discount_percent / 100)
        final     = max(original - discount, 0)
        return Response({
            'valid':            True,
            'type':             code_type,
            'discount_percent': discount_percent,
            'original_amount':  original,
            'discount_amount':  discount,
            'final_amount':     final,
        })


# ── Payment initiation & callbacks ────────────────────────────────────────────

class InitiatePaymentView(APIView):
    """POST {tier, coupon_code?} → eSewa form params."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        tier        = request.data.get('tier')
        coupon_code = request.data.get('coupon_code', '').strip().upper()

        plan = _get_plan(tier)
        if not plan:
            return Response({'detail': 'Invalid plan.'}, status=status.HTTP_400_BAD_REQUEST)

        amount      = plan['amount']
        coupon      = None
        referred_by = None

        if coupon_code:
            code_type, obj, discount_percent = _resolve_code(coupon_code)
            if code_type is None:
                return Response({'detail': 'Invalid or inactive code.'}, status=400)

            if code_type == 'referral' and obj == request.user:
                return Response({'detail': 'You cannot use your own referral code.'}, status=400)

            discount = round(amount * discount_percent / 100)
            amount   = max(amount - discount, 0)

            if code_type == 'coupon':
                coupon = obj
            else:
                referred_by = obj

        amount_str = str(amount)
        tx_uuid    = str(uuid.uuid4())

        Payment.objects.create(
            user=request.user,
            tier=tier,
            amount=amount,
            coupon=coupon,
            referred_by=referred_by,
            transaction_uuid=tx_uuid,
        )

        backend_url = request.build_absolute_uri('/').rstrip('/')
        success_url = f'{backend_url}/api/payments/esewa/success/'
        failure_url = f'{backend_url}/api/payments/esewa/failure/'

        message = (
            f'total_amount={amount_str},'
            f'transaction_uuid={tx_uuid},'
            f'product_code={settings.ESEWA_PRODUCT_CODE}'
        )

        return Response({
            'url':                      settings.ESEWA_URL,
            'amount':                   amount_str,
            'tax_amount':               '0',
            'total_amount':             amount_str,
            'transaction_uuid':         tx_uuid,
            'product_code':             settings.ESEWA_PRODUCT_CODE,
            'product_service_charge':   '0',
            'product_delivery_charge':  '0',
            'success_url':              success_url,
            'failure_url':              failure_url,
            'signed_field_names':       'total_amount,transaction_uuid,product_code',
            'signature':                _esewa_signature(message),
        })


REFERRAL_REWARD_PERCENT = 10
REFERRAL_REWARD_THRESHOLD = 100  # Rs. — payment must be >= this for reward to release


class EsewaSuccessView(APIView):
    """eSewa redirects here after successful payment with ?data=<base64>."""
    permission_classes = []

    def get(self, request):
        frontend_url = settings.FRONTEND_URL
        encoded = request.query_params.get('data', '')

        try:
            decoded    = base64.b64decode(encoded).decode('utf-8')
            data       = json.loads(decoded)
            tx_uuid    = data.get('transaction_uuid', '')
            esewa_ref  = data.get('transaction_code', '')
            rcv_status = data.get('status', '')

            signed_fields = data.get('signed_field_names', '').split(',')
            message       = ','.join(f'{f}={data[f]}' for f in signed_fields)
            expected_sig  = _esewa_signature(message)

            if data.get('signature') != expected_sig:
                return HttpResponseRedirect(f'{frontend_url}/payment/failure?reason=invalid_signature')

            if rcv_status != 'COMPLETE':
                return HttpResponseRedirect(f'{frontend_url}/payment/failure?reason=not_complete')

            payment = Payment.objects.get(transaction_uuid=tx_uuid, status=Payment.STATUS_PENDING)
        except (Payment.DoesNotExist, Exception):
            return HttpResponseRedirect(f'{frontend_url}/payment/failure?reason=error')

        payment.esewa_ref_id = esewa_ref
        payment.status       = Payment.STATUS_SUCCESS
        payment.verified_at  = timezone.now()
        payment.save()

        # ── Upgrade user subscription ─────────────────────────────────────────
        user   = payment.user
        plan   = _get_plan(payment.tier)
        months = plan['months']
        now    = timezone.now()
        base   = user.subscription_expires_at if (user.subscription_expires_at and user.subscription_expires_at > now) else now
        user.subscription_tier       = payment.tier
        user.subscription_expires_at = base + timedelta(days=30 * months)
        user.save(update_fields=['subscription_tier', 'subscription_expires_at'])

        # ── Issue referral reward if a referral code was used ─────────────────
        if payment.referred_by:
            from decimal import Decimal
            reward_amount = Decimal(payment.amount) * REFERRAL_REWARD_PERCENT / 100
            is_released   = payment.amount >= REFERRAL_REWARD_THRESHOLD
            reward = ReferralReward.objects.create(
                referrer      = payment.referred_by,
                referee       = payment.user,
                payment       = payment,
                reward_amount = reward_amount,
                status        = ReferralReward.STATUS_RELEASED if is_released else ReferralReward.STATUS_PENDING,
                released_at   = timezone.now() if is_released else None,
            )
            if is_released:
                referrer = payment.referred_by
                referrer.referral_balance = (referrer.referral_balance or Decimal(0)) + reward_amount
                referrer.save(update_fields=['referral_balance'])

        return HttpResponseRedirect(f'{frontend_url}/payment/success?tier={payment.tier}')


class EsewaFailureView(APIView):
    """eSewa redirects here after a cancelled/failed payment."""
    permission_classes = []

    def get(self, request):
        return HttpResponseRedirect(f'{settings.FRONTEND_URL}/payment/failure')


# ── Checkout visit tracking ───────────────────────────────────────────────────

class CheckoutVisitView(APIView):
    """POST {tier} — upserts a CheckoutAttempt for the current user."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        tier = request.data.get('tier', '').strip()
        if tier not in ('1month', '3month', '1year'):
            return Response({'detail': 'Invalid tier.'}, status=status.HTTP_400_BAD_REQUEST)
        updated = CheckoutAttempt.objects.filter(user=request.user).update(tier=tier)
        if not updated:
            CheckoutAttempt.objects.create(user=request.user, tier=tier)
        return Response({'recorded': True})


# ── Admin CRM status update ────────────────────────────────────────────────────

class AdminCrmStatusView(APIView):
    """PATCH {crm_status} — admin sets the CRM follow-up status for a user."""
    permission_classes = [IsAdminUser]

    VALID = {'none', 'follow_up', 'contacted', 'done'}

    def patch(self, request, pk):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        crm_status = request.data.get('crm_status', '')
        if crm_status not in self.VALID:
            return Response({'detail': f'crm_status must be one of {self.VALID}.'}, status=status.HTTP_400_BAD_REQUEST)

        user.crm_status = crm_status
        user.save(update_fields=['crm_status'])
        return Response({'crm_status': crm_status})


# ── Referral Stats (Admin) ─────────────────────────────────────────────────────

class ReferralStatsAdminView(APIView):
    """GET — admin only. Returns top referral codes with usage details."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        from django.contrib.auth import get_user_model
        from django.db.models import Count, Sum, Q, Subquery, OuterRef, DecimalField
        from django.db.models.functions import Coalesce
        from decimal import Decimal
        User = get_user_model()

        # Subquery for lifetime rewards — avoids join multiplication when combined with Count
        reward_subquery = (
            ReferralReward.objects
            .filter(referrer=OuterRef('pk'))
            .values('referrer')
            .annotate(total=Sum('reward_amount'))
            .values('total')
        )

        referrers = (
            User.objects
            .filter(referral_payments__status=Payment.STATUS_SUCCESS)
            .annotate(
                total_uses=Count('referral_payments', distinct=True, filter=Q(referral_payments__status=Payment.STATUS_SUCCESS)),
                total_reward=Coalesce(Subquery(reward_subquery, output_field=DecimalField()), Decimal(0)),
            )
            .order_by('-total_uses')
        )

        data = []
        for referrer in referrers:
            usages = (
                Payment.objects
                .filter(referred_by=referrer, status=Payment.STATUS_SUCCESS)
                .select_related('user')
                .order_by('-created_at')
            )
            data.append({
                'referrer_id':      referrer.id,
                'referrer_name':    referrer.name,
                'referrer_email':   referrer.email,
                'referrer_phone':   referrer.phone,
                'referral_code':    referrer.referral_code,
                'referral_balance': float(referrer.referral_balance or 0),
                'total_uses':       referrer.total_uses,
                'total_reward':     float(referrer.total_reward or 0),
                'usages': [
                    {
                        'user_id':    p.user.id,
                        'user_name':  p.user.name,
                        'user_email': p.user.email,
                        'user_phone': p.user.phone,
                        'tier':       p.tier,
                        'amount':     p.amount,
                        'paid_at':    p.verified_at,
                    }
                    for p in usages
                ],
            })

        return Response(data)


PAYOUT_MIN_AMOUNT = 100  # Rs.


# ── Payout Requests ────────────────────────────────────────────────────────────

class PayoutRequestCreateView(APIView):
    """POST {payment_method, payment_detail} — student requests a payout."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        balance = float(user.referral_balance or 0)

        if balance < PAYOUT_MIN_AMOUNT:
            return Response(
                {'detail': f'Minimum payout amount is Rs. {PAYOUT_MIN_AMOUNT}. Your balance is Rs. {balance:.0f}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Only one pending request at a time
        if PayoutRequest.objects.filter(user=user, status=PayoutRequest.STATUS_PENDING).exists():
            return Response(
                {'detail': 'You already have a pending payout request. Please wait for it to be processed.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment_method = request.data.get('payment_method', '').strip()
        payment_detail = request.data.get('payment_detail', '').strip()

        if not payment_method or not payment_detail:
            return Response(
                {'detail': 'payment_method and payment_detail are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        req = PayoutRequest.objects.create(
            user=user,
            amount=balance,
            payment_method=payment_method,
            payment_detail=payment_detail,
        )
        return Response({
            'id':             req.id,
            'amount':         float(req.amount),
            'payment_method': req.payment_method,
            'payment_detail': req.payment_detail,
            'status':         req.status,
            'created_at':     req.created_at,
        }, status=status.HTTP_201_CREATED)


class AdminPayoutRequestListView(APIView):
    """GET — admin lists all payout requests, newest first."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        req_status = request.query_params.get('status', '')
        qs = PayoutRequest.objects.select_related('user').order_by('-created_at')
        if req_status in (PayoutRequest.STATUS_PENDING, PayoutRequest.STATUS_APPROVED, PayoutRequest.STATUS_REJECTED):
            qs = qs.filter(status=req_status)

        data = [
            {
                'id':             r.id,
                'user_id':        r.user.id,
                'user_name':      r.user.name,
                'user_email':     r.user.email,
                'user_phone':     r.user.phone,
                'amount':         float(r.amount),
                'payment_method': r.payment_method,
                'payment_detail': r.payment_detail,
                'status':         r.status,
                'admin_note':     r.admin_note,
                'created_at':     r.created_at,
                'paid_at':        r.paid_at,
            }
            for r in qs
        ]
        return Response(data)


class AdminPayoutRequestActionView(APIView):
    """PATCH {status, admin_note?} — admin approves or rejects a payout request."""
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            req = PayoutRequest.objects.select_related('user').get(pk=pk)
        except PayoutRequest.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        if req.status != PayoutRequest.STATUS_PENDING:
            return Response({'detail': 'Only pending requests can be actioned.'}, status=status.HTTP_400_BAD_REQUEST)

        new_status = request.data.get('status', '')
        if new_status not in (PayoutRequest.STATUS_APPROVED, PayoutRequest.STATUS_REJECTED):
            return Response({'detail': 'status must be approved or rejected.'}, status=status.HTTP_400_BAD_REQUEST)

        req.status     = new_status
        req.admin_note = request.data.get('admin_note', req.admin_note)

        if new_status == PayoutRequest.STATUS_APPROVED:
            req.paid_at = timezone.now()
            # Clear the user's referral balance
            user = req.user
            ReferralReward.objects.filter(referrer=user, status=ReferralReward.STATUS_PENDING).update(
                status=ReferralReward.STATUS_RELEASED
            )
            user.referral_balance = 0
            user.save(update_fields=['referral_balance'])

        req.save()
        return Response({
            'id':         req.id,
            'status':     req.status,
            'admin_note': req.admin_note,
            'paid_at':    req.paid_at,
        })
