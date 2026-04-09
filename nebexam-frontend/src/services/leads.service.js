import api from '@/lib/api';

export const leadsService = {
  submit: (data) => api.post('/leads/study-abroad/', data),
  list:   (params) => api.get('/leads/study-abroad/list/', { params }),
  export: (params = {}) =>
    api.get('/leads/study-abroad/export/', { params, responseType: 'blob' }),
};
