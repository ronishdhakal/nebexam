import api from '@/lib/api';

export const areasService = {
  getAll: (params) => api.get('/content/areas/', { params }),
  getOne: (id) => api.get(`/content/areas/${id}/`),
  create: (data) => api.post('/content/areas/', data),
  update: (id, data) => api.patch(`/content/areas/${id}/`, data),
  delete: (id) => api.delete(`/content/areas/${id}/`),
};