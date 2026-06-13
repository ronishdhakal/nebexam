import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

export const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl ?? 'https://base.nebexam.com/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer token to every request
client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Queue of requests waiting on a token refresh
let isRefreshing = false;
let waitQueue = [];

const drainQueue = (error, token) => {
  waitQueue.forEach((cb) => (error ? cb.reject(error) : cb.resolve(token)));
  waitQueue = [];
};

// Handle 401 — refresh access token, then replay original request
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // If a refresh is already in-flight, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        waitQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return client(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refresh = await SecureStore.getItemAsync('refreshToken');
      if (!refresh) throw new Error('No refresh token');

      const { data } = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {
        refresh,
      });

      const newAccess = data.access;
      const newRefresh = data.refresh ?? refresh;

      await SecureStore.setItemAsync('accessToken', newAccess);
      await SecureStore.setItemAsync('refreshToken', newRefresh);

      drainQueue(null, newAccess);
      original.headers.Authorization = `Bearer ${newAccess}`;
      return client(original);
    } catch (refreshError) {
      drainQueue(refreshError, null);
      // Trigger logout by clearing tokens; the store listener re-routes to Login
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      // Lazy import avoids a circular dependency
      const { useAuthStore } = await import('../store/authStore');
      useAuthStore.getState().clearSession();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default client;
