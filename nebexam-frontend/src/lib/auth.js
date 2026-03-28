export const getAccessToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
};

export const getRefreshToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
};

export const setTokens = (access, refresh) => {
  localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
};

export const removeTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const isAdmin = (user) => user?.is_staff === true;

// ── Legacy compat (remove once all callers are updated) ──────────────────
export const getToken    = getAccessToken;
export const setToken    = (t) => setTokens(t, null);
export const removeToken = removeTokens;
