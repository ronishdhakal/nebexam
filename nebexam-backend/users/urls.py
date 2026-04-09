from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, LogoutView, ProfileView,
    VerifyEmailView, ResendVerificationView,
    UserListView, UserDetailView, BulkPromoteView,
    ForgotPasswordView, ResetPasswordView, RevealAnswerView,
    SiteSettingsView, AppInstallView, LogStudyView, StudyStatsView,
    MyReferralView, AdminSetPasswordView, AdminClearReferralView,
    ClearCacheView, TriggerBackupView,
)

urlpatterns = [
    path('register/',             RegisterView.as_view(),         name='register'),
    path('verify-email/',         VerifyEmailView.as_view(),      name='verify-email'),
    path('resend-verification/',  ResendVerificationView.as_view(), name='resend-verification'),
    path('login/',                LoginView.as_view(),             name='login'),
    path('logout/',         LogoutView.as_view(),          name='logout'),
    path('token/refresh/',  TokenRefreshView.as_view(),    name='token-refresh'),
    path('profile/',        ProfileView.as_view(),         name='profile'),
    path('all/',            UserListView.as_view(),        name='user-list'),
    path('bulk-promote/',   BulkPromoteView.as_view(),     name='bulk-promote'),
    path('<int:pk>/',             UserDetailView.as_view(),      name='user-detail'),
    path('<int:pk>/set-password/',    AdminSetPasswordView.as_view(),   name='admin-set-password'),
    path('<int:pk>/clear-referral/',  AdminClearReferralView.as_view(), name='admin-clear-referral'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/',  ResetPasswordView.as_view(),  name='reset-password'),
    path('reveal/',          RevealAnswerView.as_view(),   name='reveal-answer'),
    path('site-settings/',   SiteSettingsView.as_view(),   name='site-settings'),
    path('app-install/',     AppInstallView.as_view(),     name='app-install'),
    path('study/log/',       LogStudyView.as_view(),       name='study-log'),
    path('study/stats/',     StudyStatsView.as_view(),     name='study-stats'),
    path('referral/',        MyReferralView.as_view(),     name='my-referral'),
    path('clear-cache/',     ClearCacheView.as_view(),     name='clear-cache'),
    path('trigger-backup/',  TriggerBackupView.as_view(),  name='trigger-backup'),
]
