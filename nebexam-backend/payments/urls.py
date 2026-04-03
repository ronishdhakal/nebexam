from django.urls import path
from .views import (
    InitiatePaymentView,
    EsewaSuccessView,
    EsewaFailureView,
    SubscriptionPlanListView,
    CouponListCreateView,
    CouponDetailView,
    ValidateCouponView,
    ReferralStatsAdminView,
    CheckoutVisitView,
    AdminCrmStatusView,
    PayoutRequestCreateView,
    AdminPayoutRequestListView,
    AdminPayoutRequestActionView,
    EarningsView,
)

urlpatterns = [
    path('initiate/',                       InitiatePaymentView.as_view(),          name='payment-initiate'),
    path('esewa/success/',                  EsewaSuccessView.as_view(),              name='esewa-success'),
    path('esewa/failure/',                  EsewaFailureView.as_view(),              name='esewa-failure'),
    path('plans/',                          SubscriptionPlanListView.as_view(),      name='payment-plans'),
    path('coupons/',                        CouponListCreateView.as_view(),          name='coupon-list-create'),
    path('coupons/<int:pk>/',               CouponDetailView.as_view(),              name='coupon-detail'),
    path('coupons/validate/',               ValidateCouponView.as_view(),            name='coupon-validate'),
    path('referral-stats/',                 ReferralStatsAdminView.as_view(),        name='referral-stats-admin'),
    path('checkout-visit/',                 CheckoutVisitView.as_view(),             name='checkout-visit'),
    path('crm/<int:pk>/',                   AdminCrmStatusView.as_view(),            name='admin-crm-status'),
    path('payout-request/',                 PayoutRequestCreateView.as_view(),       name='payout-request-create'),
    path('payout-requests/',                AdminPayoutRequestListView.as_view(),    name='payout-request-list'),
    path('payout-requests/<int:pk>/',       AdminPayoutRequestActionView.as_view(),  name='payout-request-action'),
    path('earnings/',                       EarningsView.as_view(),                  name='earnings'),
]
