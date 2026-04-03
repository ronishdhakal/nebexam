import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, removeTokens } from '@/lib/auth';

// Server-side (SSR/API routes) uses the internal Docker service name so it
// can reach the backend container directly.  Browser requests use the public
// URL baked in at build time via NEXT_PUBLIC_API_URL.
const baseURL =
  typeof window === 'undefined'
    ? (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api')
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api');

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// ── Silent token refresh on 401 ───────────────────────────────────────────
let _refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      !original._retry &&
      typeof window !== 'undefined'
    ) {
      original._retry = true;
      const refresh = getRefreshToken();
      if (refresh) {
        try {
          if (!_refreshing) {
            _refreshing = axios.post(
              `${api.defaults.baseURL}/users/token/refresh/`,
              { refresh }
            ).finally(() => { _refreshing = null; });
          }
          const { data } = await _refreshing;
          setTokens(data.access, data.refresh || refresh);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          // refresh failed — force logout
        }
      }
      removeTokens();
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;
