import api from '@/lib/api';
import { getRefreshToken, getDeviceId } from '@/lib/auth';

export const authService = {
  register:       (data) => api.post('/users/register/', { ...data, device_id: getDeviceId() }),
  login:          (data) => api.post('/users/login/', { ...data, device_id: getDeviceId() }),
  logout:         ()     => api.post('/users/logout/', { refresh: getRefreshToken() }),
  getProfile:     ()     => api.get('/users/profile/'),
  updateProfile:  (data) => api.patch('/users/profile/', data),
  verifyEmail:          (email, code)           => api.post('/users/verify-email/', { email, code, device_id: getDeviceId() }),
  resendVerification:   (email)                 => api.post('/users/resend-verification/', { email }),
  forgotPassword:       (email)                 => api.post('/users/forgot-password/', { email }),
  resetPassword:        (email, code, password) => api.post('/users/reset-password/', { email, code, password }),
  revealAnswer:   () => api.post('/users/reveal/'),
};

export const paymentService = {
  getPlans:        ()                   => api.get('/payments/plans/'),
  updatePlans:     (data)               => api.patch('/payments/plans/', data),
  initiate:        (tier, couponCode)   => api.post('/payments/initiate/', { tier, coupon_code: couponCode || '' }),
  validateCoupon:  (code, tier)         => api.post('/payments/coupons/validate/', { code, tier }),
  getCoupons:      ()                   => api.get('/payments/coupons/'),
  createCoupon:    (data)               => api.post('/payments/coupons/', data),
  updateCoupon:    (id, data)           => api.patch(`/payments/coupons/${id}/`, data),
  deleteCoupon:    (id)                 => api.delete(`/payments/coupons/${id}/`),
  recordCheckoutVisit: (tier)           => api.post('/payments/checkout-visit/', { tier }),
  setCrmStatus:    (userId, crm_status) => api.patch(`/payments/crm/${userId}/`, { crm_status }),
  getEarnings:     (period, date)       => api.get('/payments/earnings/', { params: { period, date } }),
};

export const studyService = {
  log:      (data) => api.post('/users/study/log/', data),
  getStats: (period) => api.get('/users/study/stats/', { params: { period } }),
};

export const referralService = {
  getMyStats:          ()                   => api.get('/users/referral/'),
  getAdminStats:       ()                   => api.get('/payments/referral-stats/'),
  clearBalance:        (userId)             => api.post(`/users/${userId}/clear-referral/`),
  requestPayout:       (data)               => api.post('/payments/payout-request/', data),
  getPayoutRequests:   (status)             => api.get('/payments/payout-requests/', { params: status ? { status } : {} }),
  actionPayoutRequest: (id, data)           => api.patch(`/payments/payout-requests/${id}/`, data),
};

export const configService = {
  getSiteSettings:    ()     => api.get('/users/site-settings/'),
  updateSiteSettings: (data) => api.patch('/users/site-settings/', data),
  clearCache:         ()     => api.post('/users/clear-cache/'),
  triggerBackup:      ()     => api.post('/users/trigger-backup/'),
};
