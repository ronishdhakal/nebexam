import random
import string
from datetime import timedelta
from collections import defaultdict

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.db import transaction
from django.db.models import Sum
from django.db.models.functions import TruncDate, TruncWeek, TruncMonth
from django.utils import timezone

from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import User, UserSession, PasswordResetOTP, EmailVerificationOTP, PasswordHistory, SiteSettings, StudySession, _classify_device
from .serializers import (
    UserSerializer, AdminUserSerializer, RegisterSerializer, LoginSerializer,
)


# ── helpers ────────────────────────────────────────────────────────────────

def _tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return str(refresh), str(refresh.access_token), str(refresh['jti'])


def _register_session(user, jti, user_agent, device_id=''):
    """
    Create or replace a UserSession slot.
    - Same device (matching device_id) → always allowed, replaces old session.
    - Either side missing a device_id → can't distinguish, allow replacement.
    - Both sides have device_ids but they differ → 'new_device' error.
    Returns (session, error_code).
    """
    device_type = _classify_device(user_agent)
    existing = UserSession.objects.filter(user=user, device_type=device_type).first()

    if existing:
        both_have_ids = device_id and existing.device_id
        different_device = both_have_ids and device_id != existing.device_id
        if different_device:
            return None, 'new_device'
        existing.delete()

    session = UserSession.objects.create(
        user=user, device_type=device_type, jti=jti,
        user_agent=user_agent, device_id=device_id,
    )
    return session, None


# ── Auth views ─────────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        cfg = SiteSettings.get()

        # When email verification is on, check for existing unverified accounts
        # before running the serializer (which would give a generic "already exists" error).
        if cfg.email_verification_enabled:
            email = request.data.get('email', '').strip().lower()
            phone = request.data.get('phone', '').strip()

            if email:
                try:
                    existing = User.objects.get(email=email)
                    if not existing.is_active and not existing.is_email_verified:
                        return Response({
                            'detail': 'This email is registered but not yet verified. Please check your inbox or resend the verification code.',
                            'unverified_email': True,
                            'email': email,
                        }, status=status.HTTP_400_BAD_REQUEST)
                except User.DoesNotExist:
                    pass

            if phone:
                try:
                    existing = User.objects.get(phone=phone)
                    if not existing.is_active and not existing.is_email_verified:
                        return Response({
                            'detail': 'This phone number is linked to an unverified account. Please verify that account first.',
                            'unverified_email': True,
                            'email': existing.email,
                        }, status=status.HTTP_400_BAD_REQUEST)
                except User.DoesNotExist:
                    pass

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        if cfg.email_verification_enabled:
            # Account starts inactive until email is verified
            user.is_active = False
            user.save(update_fields=['is_active'])

            # Send verification OTP
            EmailVerificationOTP.objects.filter(user=user, used=False).delete()
            code = _generate_otp()
            EmailVerificationOTP.objects.create(
                user=user,
                code=code,
                expires_at=timezone.now() + timezone.timedelta(minutes=OTP_EXPIRY_MINUTES),
            )
            _send_verification_email(user, code)

            return Response({
                'email':  user.email,
                'detail': f'A 6-digit verification code has been sent to {user.email}. Please verify your email to activate your account.',
            }, status=status.HTTP_201_CREATED)
        else:
            # No email verification — activate immediately and return tokens
            user.is_email_verified = True
            user.save(update_fields=['is_email_verified'])
            ua        = request.META.get('HTTP_USER_AGENT', '')
            device_id = request.data.get('device_id', '')
            refresh_str, access_str, jti = _tokens_for_user(user)
            _register_session(user, jti, ua, device_id=device_id)
            return Response({
                'access':  access_str,
                'refresh': refresh_str,
                'user':    UserSerializer(user).data,
            }, status=status.HTTP_201_CREATED)


class VerifyEmailView(APIView):
    """POST {email, code} — verifies OTP, activates account, returns tokens."""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        code  = request.data.get('code', '').strip()

        if not email or not code:
            return Response({'detail': 'email and code are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': 'Invalid request.'}, status=status.HTTP_400_BAD_REQUEST)

        otp = (
            EmailVerificationOTP.objects
            .filter(user=user, code=code, used=False, expires_at__gt=timezone.now())
            .first()
        )
        if not otp:
            return Response({'detail': 'The code is incorrect or has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        otp.used = True
        otp.save()
        user.is_active = True
        user.is_email_verified = True
        user.save(update_fields=['is_active', 'is_email_verified'])

        ua        = request.META.get('HTTP_USER_AGENT', '')
        device_id = request.data.get('device_id', '')
        refresh_str, access_str, jti = _tokens_for_user(user)
        _register_session(user, jti, ua, device_id=device_id)

        return Response({
            'access':  access_str,
            'refresh': refresh_str,
            'user':    UserSerializer(user).data,
        })


class ResendVerificationView(APIView):
    """POST {email} — resends email verification OTP for unverified accounts."""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': 'No account found with that email address.'}, status=status.HTTP_404_NOT_FOUND)

        if user.is_active:
            return Response({'detail': 'This account is already verified.'}, status=status.HTTP_400_BAD_REQUEST)

        EmailVerificationOTP.objects.filter(user=user, used=False).delete()
        code = _generate_otp()
        EmailVerificationOTP.objects.create(
            user=user,
            code=code,
            expires_at=timezone.now() + timezone.timedelta(minutes=OTP_EXPIRY_MINUTES),
        )
        _send_verification_email(user, code)

        return Response({'detail': f'A new verification code has been sent to {user.email}.'})


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user      = serializer.validated_data['user']
        ua        = request.META.get('HTTP_USER_AGENT', '')
        device_id = request.data.get('device_id', '')

        refresh_str, access_str, jti = _tokens_for_user(user)
        session, error = _register_session(user, jti, ua, device_id=device_id)

        if error == 'new_device':
            device_type = _classify_device(ua)
            return Response({
                'code':        'new_device',
                'device_type': device_type,
                'detail': (
                    f'Login from a new {device_type} detected. '
                    f'Reset your password to continue — this will log out all other devices.'
                ),
            }, status=status.HTTP_403_FORBIDDEN)

        return Response({
            'access':  access_str,
            'refresh': refresh_str,
            'user':    UserSerializer(user).data,
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Delete session by device type — more reliable than jti lookup
        # (jti may have rotated since login due to silent token refresh).
        ua = request.META.get('HTTP_USER_AGENT', '')
        device_type = _classify_device(ua)
        UserSession.objects.filter(user=request.user, device_type=device_type).delete()

        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except TokenError:
                pass
        return Response({'detail': 'Logged out.'})


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


# ── Password reset via OTP ─────────────────────────────────────────────────

OTP_EXPIRY_MINUTES = 15


def _generate_otp():
    return ''.join(random.choices(string.digits, k=6))


def _send_otp_email(user, code):
    subject = 'Your NEBExam password reset code'
    text_body = (
        f'Hi {user.name},\n\n'
        f'Your password reset code is: {code}\n\n'
        f'This code expires in {OTP_EXPIRY_MINUTES} minutes.\n'
        f'If you did not request this, please ignore this email.\n\n'
        f'— The NEBExam Team'
    )
    html_body = f"""
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

        <!-- Header -->
        <tr><td style="background:#1CA3FD;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
          <p style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">NEBExam</p>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Nepal's NEB Exam Preparation Platform</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:40px 40px 32px;border-radius:0 0 16px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0f172a;">Hi {user.name},</p>
          <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
            We received a request to reset your password. Use the code below to continue.
          </p>

          <!-- OTP Box -->
          <div style="background:#EEF6FF;border:2px dashed #1CA3FD;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#1CA3FD;text-transform:uppercase;letter-spacing:2px;">Your Reset Code</p>
            <p style="margin:0;font-size:42px;font-weight:900;color:#0f172a;letter-spacing:10px;">{code}</p>
            <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">Expires in {OTP_EXPIRY_MINUTES} minutes</p>
          </div>

          <p style="margin:0 0 24px;font-size:13px;color:#94a3b8;line-height:1.6;">
            Enter this code on the NEBExam website to reset your password.
            If you did not request this, you can safely ignore this email — your account is not at risk.
          </p>

          <hr style="border:none;border-top:1px solid #f1f5f9;margin:0 0 20px;">
          <p style="margin:0;font-size:12px;color:#cbd5e1;text-align:center;">
            &copy; NEBExam &nbsp;|&nbsp; Nepal's NEB Exam Platform
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
"""
    msg = EmailMultiAlternatives(subject, text_body, settings.DEFAULT_FROM_EMAIL, [user.email])
    msg.attach_alternative(html_body, 'text/html')
    msg.send(fail_silently=False)


def _send_verification_email(user, code):
    subject = 'Verify your NEBExam account'
    text_body = (
        f'Hi {user.name},\n\n'
        f'Your email verification code is: {code}\n\n'
        f'This code expires in {OTP_EXPIRY_MINUTES} minutes.\n'
        f'If you did not register, please ignore this email.\n\n'
        f'— The NEBExam Team'
    )
    html_body = f"""
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

        <!-- Header -->
        <tr><td style="background:#1CA3FD;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
          <p style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">NEBExam</p>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Nepal's NEB Exam Preparation Platform</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:40px 40px 32px;border-radius:0 0 16px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0f172a;">Hi {user.name},</p>
          <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
            Welcome to NEBExam! Use the code below to verify your email address and activate your account.
          </p>

          <!-- OTP Box -->
          <div style="background:#EEF6FF;border:2px dashed #1CA3FD;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#1CA3FD;text-transform:uppercase;letter-spacing:2px;">Verification Code</p>
            <p style="margin:0;font-size:42px;font-weight:900;color:#0f172a;letter-spacing:10px;">{code}</p>
            <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">Expires in {OTP_EXPIRY_MINUTES} minutes</p>
          </div>

          <p style="margin:0 0 24px;font-size:13px;color:#94a3b8;line-height:1.6;">
            Enter this code on the NEBExam website to activate your account.
            If you did not register, you can safely ignore this email.
          </p>

          <hr style="border:none;border-top:1px solid #f1f5f9;margin:0 0 20px;">
          <p style="margin:0;font-size:12px;color:#cbd5e1;text-align:center;">
            &copy; NEBExam &nbsp;|&nbsp; Nepal's NEB Exam Platform
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
"""
    msg = EmailMultiAlternatives(subject, text_body, settings.DEFAULT_FROM_EMAIL, [user.email])
    msg.attach_alternative(html_body, 'text/html')
    msg.send(fail_silently=False)


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'found': False, 'detail': 'No account found with that email address.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Invalidate old OTPs and create new one
        PasswordResetOTP.objects.filter(user=user, used=False).delete()
        code = _generate_otp()
        PasswordResetOTP.objects.create(
            user=user,
            code=code,
            expires_at=timezone.now() + timezone.timedelta(minutes=OTP_EXPIRY_MINUTES),
        )
        _send_otp_email(user, code)

        return Response({'found': True, 'detail': f'A 6-digit code has been sent to {user.email}.'})


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email    = request.data.get('email', '').strip().lower()
        code     = request.data.get('code', '').strip()
        password = request.data.get('password', '')

        if not email or not code or not password:
            return Response({'detail': 'email, code and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': 'Invalid request.'}, status=status.HTTP_400_BAD_REQUEST)

        otp = (
            PasswordResetOTP.objects
            .filter(user=user, code=code, used=False, expires_at__gt=timezone.now())
            .first()
        )
        if not otp:
            return Response({'detail': 'The code is incorrect or has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 8:
            return Response({'detail': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check against last 3 password hashes
        from django.contrib.auth.hashers import check_password
        recent_hashes = list(
            PasswordHistory.objects.filter(user=user).order_by('-created_at').values_list('password_hash', flat=True)[:3]
        )
        for old_hash in recent_hashes:
            if check_password(password, old_hash):
                return Response(
                    {'detail': 'You cannot reuse one of your last 3 passwords. Please choose a different password.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Save current password to history before overwriting
        if user.password:
            PasswordHistory.objects.create(user=user, password_hash=user.password)
            # Keep only the 3 most recent history entries
            old_ids = list(
                PasswordHistory.objects.filter(user=user).order_by('-created_at').values_list('id', flat=True)[3:]
            )
            if old_ids:
                PasswordHistory.objects.filter(id__in=old_ids).delete()

        otp.used = True
        otp.save()
        user.set_password(password)
        user.save()
        UserSession.objects.filter(user=user).delete()
        return Response({'detail': 'Password reset successful. Please log in again.'})


# ── Answer reveal tracking ─────────────────────────────────────────────────

FREE_ANSWER_LIMIT_DEFAULT = 4

class RevealAnswerView(APIView):
    """Increment free_answers_used for free-tier users and return current count."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        limit = FREE_ANSWER_LIMIT_DEFAULT

        is_paid = (
            user.subscription_tier and
            user.subscription_tier != 'free' and
            (user.subscription_expires_at is None or user.subscription_expires_at > timezone.now())
        )
        if is_paid:
            return Response({'free_answers_used': 0, 'limit': limit, 'allowed': True})

        if user.free_answers_used >= limit:
            return Response(
                {'free_answers_used': user.free_answers_used, 'limit': limit, 'allowed': False},
                status=status.HTTP_403_FORBIDDEN,
            )

        user.free_answers_used = user.free_answers_used + 1
        user.save(update_fields=['free_answers_used'])
        return Response({
            'free_answers_used': user.free_answers_used,
            'limit': limit,
            'allowed': True,
        })


# ── Admin views ────────────────────────────────────────────────────────────

class AdminSetPasswordView(APIView):
    """POST {password} — Admin sets a user's password directly. Clears all their sessions."""
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        password = request.data.get('password', '')
        if len(password) < 8:
            return Response({'detail': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.save(update_fields=['password'])
        UserSession.objects.filter(user=user).delete()
        return Response({'detail': 'Password updated and all sessions cleared.'})


class UserListView(generics.ListAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'email', 'phone']

    def get_queryset(self):
        from django.db.models import OuterRef, Subquery
        from payments.models import Payment, CheckoutAttempt

        # Subquery: latest successful payment date
        paid_sq = (
            Payment.objects
            .filter(user=OuterRef('pk'), status=Payment.STATUS_SUCCESS)
            .order_by('-verified_at')
            .values('verified_at')[:1]
        )
        # Subquery: latest checkout attempt date
        attempt_sq = (
            CheckoutAttempt.objects
            .filter(user=OuterRef('pk'))
            .values('attempted_at')[:1]
        )
        # Subquery: last checkout attempt tier
        attempt_tier_sq = (
            CheckoutAttempt.objects
            .filter(user=OuterRef('pk'))
            .values('tier')[:1]
        )

        qs = (
            User.objects
            .annotate(
                last_paid_at=Subquery(paid_sq),
                last_checkout_at=Subquery(attempt_sq),
                last_checkout_tier=Subquery(attempt_tier_sq),
            )
            .order_by('-last_checkout_at', '-date_joined')
        )

        level           = self.request.query_params.get('level')
        stream          = self.request.query_params.get('stream')
        tier            = self.request.query_params.get('tier')
        acc_status      = self.request.query_params.get('status')
        purchase_status = self.request.query_params.get('purchase_status')
        crm_status      = self.request.query_params.get('crm_status')
        email_verified  = self.request.query_params.get('email_verified')

        if level is not None:
            qs = qs.filter(level=level)
        if stream:
            qs = qs.filter(stream=stream)
        if tier:
            qs = qs.filter(subscription_tier=tier)
        if acc_status == 'active':
            qs = qs.filter(is_active=True)
        elif acc_status == 'disabled':
            qs = qs.filter(is_active=False)
        if crm_status:
            qs = qs.filter(crm_status=crm_status)
        if email_verified == 'true':
            qs = qs.filter(is_email_verified=True)
        elif email_verified == 'false':
            qs = qs.filter(is_email_verified=False)

        if purchase_status == 'active':
            # Has a successful payment
            qs = qs.filter(last_paid_at__isnull=False)
        elif purchase_status == 'attempted':
            # Visited checkout but never paid (still free tier)
            qs = qs.filter(last_checkout_at__isnull=False, subscription_tier='free')
        elif purchase_status == 'never':
            # Never even visited checkout
            qs = qs.filter(last_checkout_at__isnull=True, subscription_tier='free')

        return qs


class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]

    def perform_update(self, serializer):
        from datetime import timedelta
        from payments.views import _get_plan

        new_tier = serializer.validated_data.get(
            'subscription_tier', serializer.instance.subscription_tier
        )
        new_expiry = serializer.validated_data.get(
            'subscription_expires_at', serializer.instance.subscription_expires_at
        )

        # When a paid tier is set but no expiry is provided (or is explicitly null),
        # auto-calculate from today using the plan's duration.
        if new_tier and new_tier != 'free' and new_expiry is None:
            plan = _get_plan(new_tier)
            if plan:
                months = plan['months']
                now = timezone.now()
                base = (
                    serializer.instance.subscription_expires_at
                    if (serializer.instance.subscription_expires_at and
                        serializer.instance.subscription_expires_at > now)
                    else now
                )
                serializer.validated_data['subscription_expires_at'] = (
                    base + timedelta(days=30 * months)
                )

        serializer.save()


class BulkPromoteView(APIView):
    permission_classes = [IsAdminUser]
    VALID_LEVELS = ['10', '11', '12', '']

    def get(self, request):
        counts = {
            '10':   User.objects.filter(level='10').count(),
            '11':   User.objects.filter(level='11').count(),
            '12':   User.objects.filter(level='12').count(),
            'none': User.objects.filter(level='').count(),
        }
        return Response(counts)

    def post(self, request):
        if request.data.get('session'):
            return self._session_promote()

        from_level = request.data.get('from_level', '')
        to_level   = request.data.get('to_level', '')

        if from_level not in self.VALID_LEVELS or to_level not in self.VALID_LEVELS:
            return Response({'error': 'Invalid level value.'}, status=status.HTTP_400_BAD_REQUEST)
        if from_level == to_level:
            return Response({'error': 'from_level and to_level must differ.'}, status=status.HTTP_400_BAD_REQUEST)

        updated = User.objects.filter(level=from_level).update(level=to_level)
        return Response({'updated': updated, 'from_level': from_level, 'to_level': to_level})

    @transaction.atomic
    def _session_promote(self):
        c12 = User.objects.filter(level='12').update(level='')
        c11 = User.objects.filter(level='11').update(level='12')
        c10 = User.objects.filter(level='10').update(level='11')
        return Response({
            'session': True,
            'promoted': {'class_10': c10, 'class_11': c11, 'class_12_graduated': c12},
        })


class SiteSettingsView(APIView):
    """GET (public) returns site settings. PATCH (staff only) updates them."""

    def get_permissions(self):
        if self.request.method in ('GET', 'HEAD', 'OPTIONS'):
            return [AllowAny()]
        return [IsAdminUser()]

    _CONTACT_FIELDS = [
        'contact_email', 'contact_phone', 'contact_address',
        'contact_wa', 'social_facebook', 'social_instagram',
    ]

    def _serialize(self, cfg):
        return {
            'subscription_required':      cfg.subscription_required,
            'esewa_enabled':              cfg.esewa_enabled,
            'email_verification_enabled': cfg.email_verification_enabled,
            'contact_email':              cfg.contact_email,
            'contact_phone':              cfg.contact_phone,
            'contact_address':            cfg.contact_address,
            'contact_wa':                 cfg.contact_wa,
            'social_facebook':            cfg.social_facebook,
            'social_instagram':           cfg.social_instagram,
        }

    def get(self, request):
        from django.core.cache import cache
        from nebexam.cache import make_cache_key, CACHE_TTL
        key = make_cache_key(request)
        cached = cache.get(key)
        if cached is not None:
            return Response(cached)
        data = self._serialize(SiteSettings.get())
        cache.set(key, data, CACHE_TTL)
        return Response(data)

    def patch(self, request):
        from django.core.cache import cache
        cfg = SiteSettings.get()
        changed = []
        if (val := request.data.get('subscription_required')) is not None:
            cfg.subscription_required = bool(val)
            changed.append('subscription_required')
        if (val := request.data.get('esewa_enabled')) is not None:
            cfg.esewa_enabled = bool(val)
            changed.append('esewa_enabled')
        if (val := request.data.get('email_verification_enabled')) is not None:
            cfg.email_verification_enabled = bool(val)
            changed.append('email_verification_enabled')
        for field in self._CONTACT_FIELDS:
            if (val := request.data.get(field)) is not None:
                setattr(cfg, field, val)
                changed.append(field)
        if changed:
            cfg.save(update_fields=changed)
        cache.clear()
        return Response(self._serialize(cfg))


# ── Study Analytics ─────────────────────────────────────────────────────────

class LogStudyView(APIView):
    """POST {chapter_slug, chapter_name, subject_slug, subject_name, duration} to log study time."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        duration = int(request.data.get('duration', 0))
        if duration < 10:
            return Response({'detail': 'Too short.'}, status=status.HTTP_400_BAD_REQUEST)
        StudySession.objects.create(
            user=request.user,
            subject_name=request.data.get('subject_name', ''),
            subject_slug=request.data.get('subject_slug', ''),
            chapter_name=request.data.get('chapter_name', ''),
            chapter_slug=request.data.get('chapter_slug', ''),
            duration=duration,
        )
        return Response({'logged': True})


class StudyStatsView(APIView):
    """GET ?period=daily|weekly|monthly  → bar data + total for the dashboard."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        period = request.query_params.get('period', 'daily')
        now    = timezone.now()

        def day_no_pad(d):
            return str(d.day)

        if period == 'weekly':
            since     = now - timedelta(weeks=4)
            trunc_fn  = TruncWeek
            n_bars    = 4
            fmt       = lambda d: f"Wk {day_no_pad(d)} {d.strftime('%b')}"
            delta     = timedelta(weeks=1)
        elif period == 'monthly':
            since    = now - timedelta(days=180)
            trunc_fn = TruncMonth
            n_bars   = 6
            fmt      = lambda d: d.strftime('%b %Y')
            delta    = timedelta(days=32)
        else:  # daily
            since    = now - timedelta(days=7)
            trunc_fn = TruncDate
            n_bars   = 7
            fmt      = lambda d: f"{d.strftime('%a')} {day_no_pad(d)}"
            delta    = timedelta(days=1)

        qs = (
            StudySession.objects
            .filter(user=request.user, logged_at__gte=since)
            .annotate(period=trunc_fn('logged_at', tzinfo=timezone.get_current_timezone()))
            .values('period', 'subject_name')
            .annotate(seconds=Sum('duration'))
            .order_by('period')
        )

        # Build period buckets
        buckets = {}
        cursor = since.replace(hour=0, minute=0, second=0, microsecond=0)
        while cursor <= now:
            if period == 'daily':
                key = cursor.date()
            elif period == 'weekly':
                key = cursor.date() - timedelta(days=cursor.weekday())
            else:
                key = cursor.replace(day=1).date()
            buckets.setdefault(key, defaultdict(int))
            cursor += delta

        for row in qs:
            p = row['period']
            key = p.date() if hasattr(p, 'date') else p
            if period == 'weekly':
                key = key - timedelta(days=key.weekday())
            elif period == 'monthly':
                key = key.replace(day=1)
            buckets.setdefault(key, defaultdict(int))
            buckets[key][row['subject_name']] += row['seconds']

        bars = []
        for key in sorted(buckets.keys()):
            import datetime
            dt = datetime.datetime.combine(key, datetime.time.min)
            bars.append({
                'label':   fmt(dt),
                'date':    key.isoformat(),
                'subjects': dict(buckets[key]),
                'total':   sum(buckets[key].values()),
            })

        total = sum(s['total'] for s in bars)
        return Response({'period': period, 'total_seconds': total, 'bars': bars[-n_bars:]})


# ── Referral ─────────────────────────────────────────────────────────────────

class AdminClearReferralView(APIView):
    """POST — Admin clears a user's referral balance (marks all as paid)."""
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        from payments.models import ReferralReward
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        ReferralReward.objects.filter(referrer=user, status=ReferralReward.STATUS_PENDING).update(
            status=ReferralReward.STATUS_RELEASED
        )
        cleared = float(user.referral_balance or 0)
        user.referral_balance = 0
        user.save(update_fields=['referral_balance'])
        return Response({'detail': 'Referral balance cleared.', 'cleared_amount': cleared})


class ClearCacheView(APIView):
    """POST — Admin clears the entire server-side file cache."""
    permission_classes = [IsAdminUser]

    def post(self, request):
        from django.core.cache import cache
        cache.clear()
        return Response({'detail': 'Cache cleared successfully.'})


class TriggerBackupView(APIView):
    """POST — Admin triggers an immediate database backup."""
    permission_classes = [IsAdminUser]

    def post(self, request):
        import urllib.request
        import urllib.error
        try:
            req = urllib.request.Request(
                'http://nebexam-db-backup:8080/trigger',
                method='POST',
                data=b'',
            )
            with urllib.request.urlopen(req, timeout=10) as res:
                if res.status == 409:
                    return Response({'detail': 'Backup already in progress.'}, status=409)
                return Response({'detail': 'Backup started successfully.'})
        except urllib.error.URLError as e:
            return Response({'detail': f'Backup service unreachable: {e.reason}'}, status=503)


class MyReferralView(APIView):
    """GET — returns the current user's referral code, balance, and usage list."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from payments.models import Payment, ReferralReward, PayoutRequest

        user = request.user

        # Who used my referral code (successful payments)
        usages = (
            Payment.objects
            .filter(referred_by=user, status=Payment.STATUS_SUCCESS)
            .select_related('user')
            .order_by('-verified_at')
        )

        # My own referral reward status from rewards I earned
        rewards = (
            ReferralReward.objects
            .filter(referrer=user)
            .select_related('referee', 'payment')
            .order_by('-created_at')
        )

        # Did I use someone else's referral code?
        my_usage = (
            Payment.objects
            .filter(user=user, referred_by__isnull=False, status=Payment.STATUS_SUCCESS)
            .select_related('referred_by')
            .order_by('-verified_at')
            .first()
        )

        pending_balance  = float(sum(r.reward_amount for r in rewards if r.status == ReferralReward.STATUS_PENDING))
        released_balance = float(user.referral_balance or 0)

        # Current payout request (if any)
        payout_req = (
            PayoutRequest.objects
            .filter(user=user)
            .order_by('-created_at')
            .first()
        )
        payout_request_info = None
        if payout_req:
            payout_request_info = {
                'id':             payout_req.id,
                'amount':         float(payout_req.amount),
                'payment_method': payout_req.payment_method,
                'payment_detail': payout_req.payment_detail,
                'status':         payout_req.status,
                'admin_note':     payout_req.admin_note,
                'created_at':     payout_req.created_at,
                'paid_at':        payout_req.paid_at,
            }

        return Response({
            'referral_code':    user.referral_code,
            'referral_balance': released_balance,
            'pending_balance':  pending_balance,
            'total_uses':       usages.count(),
            'usages': [
                {
                    'user_id':    p.user.id,
                    'user_name':  p.user.name,
                    'user_email': p.user.email,
                    'tier':       p.tier,
                    'amount':     p.amount,
                    'paid_at':    p.verified_at,
                    'reward_amount':  float(p.referral_reward.reward_amount) if hasattr(p, 'referral_reward') else 0,
                    'reward_status':  p.referral_reward.status if hasattr(p, 'referral_reward') else None,
                }
                for p in usages
            ],
            'my_referral_used': {
                'referrer_name':  my_usage.referred_by.name,
                'referrer_code':  my_usage.referred_by.referral_code,
                'tier':           my_usage.tier,
                'paid_at':        my_usage.verified_at,
            } if my_usage else None,
            'payout_request': payout_request_info,
        })
