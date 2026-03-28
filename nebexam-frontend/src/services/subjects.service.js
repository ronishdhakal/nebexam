import api from '@/lib/api';

export const subjectsService = {
  getAll: (params) => api.get('/content/subjects/', { params }),
  getOne: (slug) => api.get(`/content/subjects/${slug}/`),
  create: (data) => api.post('/content/subjects/', data),
  update: (slug, data) => api.patch(`/content/subjects/${slug}/`, data),
  uploadBook: (slug, file) => {
    const fd = new FormData();
    fd.append('book_pdf', file);
    return api.patch(`/content/subjects/${slug}/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  removeBook: (slug) => api.patch(`/content/subjects/${slug}/`, { book_pdf: '' }),
  delete: (slug) => api.delete(`/content/subjects/${slug}/`),
};