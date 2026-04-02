import api from '@/lib/api';

export const newsCategoriesService = {
  getAll: () => api.get('/news-categories/'),
  getOne: (id) => api.get(`/news-categories/${id}/`),
  create: (data) => api.post('/news-categories/', data),
  update: (id, data) => api.patch(`/news-categories/${id}/`, data),
  delete: (id) => api.delete(`/news-categories/${id}/`),
};

export const newsService = {
  getAll: (params) => api.get('/news/', { params }),
  getOne: (slug) => api.get(`/news/${slug}/`),
  create: (data) => api.post('/news/', data),
  update: (slug, data) => api.patch(`/news/${slug}/`, data),
  uploadFeaturedImage: (slug, file) => {
    const fd = new FormData();
    fd.append('featured_image', file);
    return api.patch(`/news/${slug}/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  removeFeaturedImage: (slug) => api.patch(`/news/${slug}/`, { featured_image: '' }),
  delete: (slug) => api.delete(`/news/${slug}/`),
};

export const blogCategoriesService = {
  getAll: () => api.get('/blog-categories/'),
  getOne: (id) => api.get(`/blog-categories/${id}/`),
  create: (data) => api.post('/blog-categories/', data),
  update: (id, data) => api.patch(`/blog-categories/${id}/`, data),
  delete: (id) => api.delete(`/blog-categories/${id}/`),
};

export const blogService = {
  getAll: (params) => api.get('/blog/', { params }),
  getOne: (slug) => api.get(`/blog/${slug}/`),
  create: (data) => api.post('/blog/', data),
  update: (slug, data) => api.patch(`/blog/${slug}/`, data),
  uploadFeaturedImage: (slug, file) => {
    const fd = new FormData();
    fd.append('featured_image', file);
    return api.patch(`/blog/${slug}/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  removeFeaturedImage: (slug) => api.patch(`/blog/${slug}/`, { featured_image: '' }),
  delete: (slug) => api.delete(`/blog/${slug}/`),
};
