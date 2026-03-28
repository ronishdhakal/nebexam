import api from '@/lib/api';

export const chaptersService = {
  getAll: (params) => api.get('/content/chapters/', { params }),
  getOne: (slug) => api.get(`/content/chapters/${slug}/`),
  create: (data) => api.post('/content/chapters/', data),
  update: (slug, data) => api.patch(`/content/chapters/${slug}/`, data),
  delete: (slug) => api.delete(`/content/chapters/${slug}/`),
  getImportantQuestions: (slug) => api.get(`/content/chapters/${slug}/important_questions/`),
};