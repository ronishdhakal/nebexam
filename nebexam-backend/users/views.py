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

from .models import User, UserSession, PasswordResetOTP, SiteSettings, StudySession, _classify_device
from .serializers import (
    UserSerializer, AdminUserSerializer, RegisterSerializer, LoginSerializer,
)


# ── helpers ────────────────────────────────────────────────────────────────

def _tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return str(refresh), str(refresh.access_token), str(refresh['jti'])


def _register_session(user, jti, user_agent, force=False):
    """
    Create or replace a UserSession slot.
    Returns (session, error_code) where error_code is None on success or
    'device_limit' if the slot is occupied and force=False.
    """
    device_type = _classify_device(user_agent)
    existing = UserSession.objects.filter(user=user, device_type=device_type).first()

    if existing and not force:
        return None, 'device_limit'

    # Replace or create
    UserSession.objects.filter(user=user, device_type=device_type).delete()
    session = UserSession.objects.create(
        user=user, device_type=device_type, jti=jti, user_agent=user_agent
    )
    return session, None


# ── Auth views ─────────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        ua = request.META.get('HTTP_USER_AGENT', '')
        refresh_str, access_str, jti = _tokens_for_user(user)
        _register_session(user, jti, ua, force=True)

        return Response({
            'access':  access_str,
            'refresh': refresh_str,
            'user':    UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user  = serializer.validated_data['user']
        force = request.data.get('force', False)
        ua    = request.META.get('HTTP_USER_AGENT', '')

        refresh_str, access_str, jti = _tokens_for_user(user)
        session, error = _register_session(user, jti, ua, force=bool(force))

        if error == 'device_limit':
            device_type = _classify_device(ua)
            return Response({
                'code':        'device_limit',
                'device_type': device_type,
                'detail':      f'You are already logged in on another {device_type}. '
                               f'Send force=true to log out the other {device_type} and continue.',
            }, status=status.HTTP_403_FORBIDDEN)

        return Response({
            'access':  access_str,
            'refresh': refresh_str,
            'user':    UserSerializer(user).data,
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                jti = token['jti']
                UserSession.objects.filter(user=request.user, jti=jti).delete()
                token.blacklist()
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

        otp.used = True
        otp.save()
        user.set_password(password)
        user.save()
        UserSession.objects.filter(user=user).delete()
        return Response({'detail': 'Password reset successful. Please log in again.'})


# ── Answer reveal tracking ─────────────────────────────────────────────────

FREE_ANSWER_LIMIT = 4

class RevealAnswerView(APIView):
    """Increment free_answers_used for free-tier users and return current count."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        is_paid = user.subscription_tier and user.subscription_tier != 'free'
        if is_paid:
            return Response({'free_answers_used': 0, 'limit': FREE_ANSWER_LIMIT, 'allowed': True})

        if user.free_answers_used >= FREE_ANSWER_LIMIT:
            return Response(
                {'free_answers_used': user.free_answers_used, 'limit': FREE_ANSWER_LIMIT, 'allowed': False},
                status=status.HTTP_403_FORBIDDEN,
            )

        user.free_answers_used = user.free_answers_used + 1
        user.save(update_fields=['free_answers_used'])
        return Response({
            'free_answers_used': user.free_answers_used,
            'limit': FREE_ANSWER_LIMIT,
            'allowed': True,
        })


# ── Admin views ────────────────────────────────────────────────────────────

class UserListView(generics.ListAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'email', 'phone']

    def get_queryset(self):
        qs = User.objects.all().order_by('-date_joined')
        level  = self.request.query_params.get('level')
        stream = self.request.query_params.get('stream')
        tier   = self.request.query_params.get('tier')
        status = self.request.query_params.get('status')
        if level  is not None:
            qs = qs.filter(level=level)
        if stream:
            qs = qs.filter(stream=stream)
        if tier:
            qs = qs.filter(subscription_tier=tier)
        if status == 'active':
            qs = qs.filter(is_active=True)
        elif status == 'disabled':
            qs = qs.filter(is_active=False)
        return qs


class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]


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
            'subscription_required': cfg.subscription_required,
            'esewa_enabled':         cfg.esewa_enabled,
            'contact_email':         cfg.contact_email,
            'contact_phone':         cfg.contact_phone,
            'contact_address':       cfg.contact_address,
            'contact_wa':            cfg.contact_wa,
            'social_facebook':       cfg.social_facebook,
            'social_instagram':      cfg.social_instagram,
        }

    def get(self, request):
        return Response(self._serialize(SiteSettings.get()))

    def patch(self, request):
        cfg = SiteSettings.get()
        changed = []
        if (val := request.data.get('subscription_required')) is not None:
            cfg.subscription_required = bool(val)
            changed.append('subscription_required')
        if (val := request.data.get('esewa_enabled')) is not None:
            cfg.esewa_enabled = bool(val)
            changed.append('esewa_enabled')
        for field in self._CONTACT_FIELDS:
            if (val := request.data.get(field)) is not None:
                setattr(cfg, field, val)
                changed.append(field)
        if changed:
            cfg.save(update_fields=changed)
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
