import api from '@/lib/api';

export const entriesService = {
  getAll: (params) => api.get('/questionbank/entries/', { params }),
  getOne: (slug) => api.get(`/questionbank/entries/${slug}/`),
  create: (data) => api.post('/questionbank/entries/', data),
  update: (slug, data) => api.patch(`/questionbank/entries/${slug}/`, data),
  delete: (slug) => api.delete(`/questionbank/entries/${slug}/`),
};

export const groupsService = {
  getAll: (params) => api.get('/questionbank/groups/', { params }),
  create: (data) => api.post('/questionbank/groups/', data),
  update: (id, data) => api.patch(`/questionbank/groups/${id}/`, data),
  delete: (id) => api.delete(`/questionbank/groups/${id}/`),
};

export const nodesService = {
  getAll: (params) => api.get('/questionbank/nodes/', { params }),
  getOne: (id) => api.get(`/questionbank/nodes/${id}/`),
  create: (data) => api.post('/questionbank/nodes/', data),
  update: (id, data) => api.patch(`/questionbank/nodes/${id}/`, data),
  delete: (id) => api.delete(`/questionbank/nodes/${id}/`),
};