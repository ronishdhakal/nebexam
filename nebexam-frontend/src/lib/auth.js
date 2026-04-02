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

/** Returns a persistent device UUID stored in localStorage. Never cleared on logout. */
export const getDeviceId = () => {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('device_id');
  if (!id) {
    id = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('device_id', id);
  }
  return id;
};

// ── Legacy compat ──────────────────────────────────────────────────────────
export const isAdmin    = (user) => user?.is_staff === true;
export const getToken   = getAccessToken;
export const setToken   = (t) => setTokens(t, null);
export const removeToken = removeTokens;
