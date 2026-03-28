import api from '@/lib/api';
import { getRefreshToken } from '@/lib/auth';

export const authService = {
  register:       (data) => api.post('/users/register/', data),
  login:          (data) => api.post('/users/login/', data),
  logout:         ()     => api.post('/users/logout/', { refresh: getRefreshToken() }),
  getProfile:     ()     => api.get('/users/profile/'),
  updateProfile:  (data) => api.patch('/users/profile/', data),
  forgotPassword: (email)            => api.post('/users/forgot-password/', { email }),
  resetPassword:  (email, code, password) =>
    api.post('/users/reset-password/', { email, code, password }),
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
};

export const studyService = {
  log:      (data) => api.post('/users/study/log/', data),
  getStats: (period) => api.get('/users/study/stats/', { params: { period } }),
};

export const configService = {
  getSiteSettings:    ()     => api.get('/users/site-settings/'),
  updateSiteSettings: (data) => api.patch('/users/site-settings/', data),
};
