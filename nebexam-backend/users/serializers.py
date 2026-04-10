from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, EmailVerificationOTP


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'phone', 'district', 'profile_picture', 'level', 'stream', 'what_after_plus_two', 'subscription_tier', 'subscription_expires_at', 'free_answers_used', 'is_staff', 'date_joined', 'referral_code']
        read_only_fields = ['subscription_tier', 'subscription_expires_at', 'free_answers_used', 'is_staff', 'date_joined', 'referral_code']


class AdminUserSerializer(serializers.ModelSerializer):
    last_checkout_at   = serializers.DateTimeField(read_only=True, default=None)
    last_checkout_tier = serializers.CharField(read_only=True, default=None)
    last_paid_at       = serializers.DateTimeField(read_only=True, default=None)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'phone', 'district', 'level', 'stream', 'what_after_plus_two',
            'subscription_tier', 'subscription_expires_at',
            'is_active', 'is_staff', 'is_email_verified', 'date_joined',
            'crm_status',
            'referral_code', 'referral_balance',
            'last_checkout_at', 'last_checkout_tier', 'last_paid_at',
        ]
        read_only_fields = ['id', 'date_joined', 'last_checkout_at', 'last_checkout_tier', 'last_paid_at', 'referral_code', 'referral_balance', 'is_email_verified']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['email', 'name', 'phone', 'district', 'password', 'level', 'stream', 'what_after_plus_two']

    def validate_phone(self, value):
        if value and User.objects.filter(phone=value).exists():
            raise serializers.ValidationError(
                'An account with this phone number already exists.'
            )
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        # Check for unverified account before calling authenticate (which rejects inactive users)
        try:
            user_obj = User.objects.get(email=data['email'])
            if not user_obj.is_active:
                has_pending_verification = EmailVerificationOTP.objects.filter(
                    user=user_obj, used=False
                ).exists()
                if has_pending_verification:
                    raise serializers.ValidationError(
                        'Please verify your email before logging in. Check your inbox for the verification code.'
                    )
                raise serializers.ValidationError('Account is disabled.')
        except User.DoesNotExist:
            pass

        user = authenticate(username=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Invalid credentials.')
        data['user'] = user
        return data
