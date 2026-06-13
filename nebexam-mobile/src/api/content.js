import client from './client';

// Subjects
export const getSubjects = (params) =>
  client.get('/content/subjects/', { params });

export const getSubject = (slug) =>
  client.get(`/content/subjects/${slug}/`);

// Chapters
export const getChapters = (params) =>
  client.get('/content/chapters/', { params });

export const getChapter = (slug) =>
  client.get(`/content/chapters/${slug}/`);

export const getImportantQuestions = (slug) =>
  client.get(`/content/chapters/${slug}/important_questions/`);

// Question bank
export const getQuestionEntries = (params) =>
  client.get('/questionbank/entries/', { params });

export const getQuestionEntry = (slug) =>
  client.get(`/questionbank/entries/${slug}/`);

// News & Blog
export const getNews = (params) =>
  client.get('/news/', { params });

export const getNewsDetail = (slug) =>
  client.get(`/news/${slug}/`);

export const getBlogs = (params) =>
  client.get('/blog/', { params });

export const getBlogDetail = (slug) =>
  client.get(`/blog/${slug}/`);

// Subscription plans
export const getPlans = () =>
  client.get('/payments/plans/');

// Study session
export const logStudySession = (data) =>
  client.post('/users/study/log/', data);

export const getStudyStats = (period = 'weekly') =>
  client.get('/users/study/stats/', { params: { period } });

// Site settings
export const getSiteSettings = () =>
  client.get('/users/site-settings/');
