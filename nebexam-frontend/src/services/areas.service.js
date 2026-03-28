import api from '@/lib/api';

export const areasService = {
  getAll: (params) => api.get('/content/areas/', { params }),
  getOne: (slug) => api.get(`/content/areas/${slug}/`),
  create: (data) => api.post('/content/areas/', data),
  update: (slug, data) => api.patch(`/content/areas/${slug}/`, data),
  delete: (slug) => api.delete(`/content/areas/${slug}/`),
};