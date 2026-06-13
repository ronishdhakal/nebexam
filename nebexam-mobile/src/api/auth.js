import client from './client';

export const login = (email, password) =>
  client.post('/users/login/', { email, password });

export const register = (payload) =>
  client.post('/users/register/', payload);

export const verifyEmail = (email, code) =>
  client.post('/users/verify-email/', { email, code });

export const resendVerification = (email) =>
  client.post('/users/resend-verification/', { email });

export const forgotPassword = (email) =>
  client.post('/users/forgot-password/', { email });

export const resetPassword = (email, otp, password) =>
  client.post('/users/reset-password/', { email, otp, password });

export const getProfile = () =>
  client.get('/users/profile/');

export const updateProfile = (data) =>
  client.patch('/users/profile/', data);

export const logout = () =>
  client.post('/users/logout/');

export const revealAnswer = () =>
  client.post('/users/reveal/');
