from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'phone', 'profile_picture', 'level', 'stream', 'subscription_tier', 'subscription_expires_at', 'free_answers_used', 'is_staff', 'date_joined', 'referral_code']
        read_only_fields = ['subscription_tier', 'subscription_expires_at', 'free_answers_used', 'is_staff', 'date_joined', 'referral_code']


class AdminUserSerializer(serializers.ModelSerializer):
    last_checkout_at   = serializers.DateTimeField(read_only=True, default=None)
    last_checkout_tier = serializers.CharField(read_only=True, default=None)
    last_paid_at       = serializers.DateTimeField(read_only=True, default=None)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'phone', 'level', 'stream',
            'subscription_tier', 'subscription_expires_at',
            'is_active', 'is_staff', 'date_joined',
            'crm_status',
            'referral_code', 'referral_balance',
            'last_checkout_at', 'last_checkout_tier', 'last_paid_at',
        ]
        read_only_fields = ['id', 'date_joined', 'last_checkout_at', 'last_checkout_tier', 'last_paid_at', 'referral_code', 'referral_balance']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['email', 'name', 'phone', 'password', 'level', 'stream']

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
        user = authenticate(username=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Invalid credentials.')
        if not user.is_active:
            raise serializers.ValidationError('Account is disabled.')
        data['user'] = user
        return data
