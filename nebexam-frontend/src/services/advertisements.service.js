import api from '@/lib/api';

export const advertisementsService = {
  listPopupAds: () => api.get('/advertisements/popup-ads/'),
  getPopupAd: (id) => api.get(`/advertisements/popup-ads/${id}/`),
  getActivePopupAd: () => api.get('/advertisements/active-popup-ad/'),
  createPopupAd: (data) => api.post('/advertisements/popup-ads/', data),
  updatePopupAd: (id, data) => api.patch(`/advertisements/popup-ads/${id}/`, data),
  deletePopupAd: (id) => api.delete(`/advertisements/popup-ads/${id}/`),

  // Text Ads
  listTextAds: () => api.get('/advertisements/text-ads/'),
  getTextAd: (id) => api.get(`/advertisements/text-ads/${id}/`),
  getActiveTextAds: (page) => api.get('/advertisements/active-text-ads/', { params: { page } }),
  createTextAd: (data) => api.post('/advertisements/text-ads/', data),
  updateTextAd: (id, data) => api.patch(`/advertisements/text-ads/${id}/`, data),
  deleteTextAd: (id) => api.delete(`/advertisements/text-ads/${id}/`),
};
