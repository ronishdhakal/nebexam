from django.urls import path
from .views import (
    InitiatePaymentView,
    EsewaSuccessView,
    EsewaFailureView,
    SubscriptionPlanListView,
    CouponListCreateView,
    CouponDetailView,
    ValidateCouponView,
)

urlpatterns = [
    path('initiate/',        InitiatePaymentView.as_view(),      name='payment-initiate'),
    path('esewa/success/',   EsewaSuccessView.as_view(),          name='esewa-success'),
    path('esewa/failure/',   EsewaFailureView.as_view(),          name='esewa-failure'),
    path('plans/',           SubscriptionPlanListView.as_view(),  name='payment-plans'),
    path('coupons/',         CouponListCreateView.as_view(),      name='coupon-list-create'),
    path('coupons/<int:pk>/', CouponDetailView.as_view(),         name='coupon-detail'),
    path('coupons/validate/', ValidateCouponView.as_view(),       name='coupon-validate'),
]
