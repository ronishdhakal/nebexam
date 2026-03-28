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

from .models import Payment, Coupon, SubscriptionPlan, PLAN_PRICES


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


# ── Plan Pricing ─────────────────────────────────────────────────────────────

class SubscriptionPlanListView(APIView):
    """GET (public) → all plans. PATCH (admin) → update a plan's amount."""

    def get_permissions(self):
        if self.request.method in ('GET', 'HEAD', 'OPTIONS'):
            return [AllowAny()]
        return [IsAdminUser()]

    def get(self, request):
        plans = {p.tier: {'label': p.label, 'amount': p.amount, 'months': p.months}
                 for p in SubscriptionPlan.objects.all()}
        # Merge fallback tiers that may not be in DB yet
        for tier, defaults in PLAN_PRICES.items():
            if tier not in plans:
                plans[tier] = defaults
        return Response(plans)

    def patch(self, request):
        """
        Expects: { "1month": {"amount": 120}, "3month": {"amount": 250}, ... }
        Only updates fields provided.
        """
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
    """POST {code, tier} → discount info. Authenticated users only."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        tier = request.data.get('tier', '')
        if not code:
            return Response({'detail': 'code is required.'}, status=400)
        try:
            coupon = Coupon.objects.get(code=code, is_active=True)
        except Coupon.DoesNotExist:
            return Response({'detail': 'Invalid or inactive coupon code.'}, status=400)

        plan = _get_plan(tier)
        if not plan:
            return Response({'detail': 'Invalid plan.'}, status=400)

        original   = plan['amount']
        discount   = round(original * coupon.discount_percent / 100)
        final      = max(original - discount, 0)
        return Response({
            'valid':            True,
            'discount_percent': coupon.discount_percent,
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

        amount = plan['amount']
        coupon = None

        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code, is_active=True)
                discount = round(amount * coupon.discount_percent / 100)
                amount   = max(amount - discount, 0)
            except Coupon.DoesNotExist:
                return Response({'detail': 'Invalid or inactive coupon code.'}, status=400)

        amount_str = str(amount)
        tx_uuid    = str(uuid.uuid4())

        Payment.objects.create(
            user=request.user,
            tier=tier,
            amount=amount,
            coupon=coupon,
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

        user   = payment.user
        plan   = _get_plan(payment.tier)
        months = plan['months']
        now    = timezone.now()
        base   = user.subscription_expires_at if (user.subscription_expires_at and user.subscription_expires_at > now) else now
        user.subscription_tier       = payment.tier
        user.subscription_expires_at = base + timedelta(days=30 * months)
        user.save(update_fields=['subscription_tier', 'subscription_expires_at'])

        return HttpResponseRedirect(f'{frontend_url}/payment/success?tier={payment.tier}')


class EsewaFailureView(APIView):
    """eSewa redirects here after a cancelled/failed payment."""
    permission_classes = []

    def get(self, request):
        return HttpResponseRedirect(f'{settings.FRONTEND_URL}/payment/failure')
