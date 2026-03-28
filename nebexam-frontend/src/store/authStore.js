import { create } from 'zustand';
import { getAccessToken, getRefreshToken, setTokens, removeTokens } from '@/lib/auth';

const useAuthStore = create((set) => ({
  user:            null,
  accessToken:     getAccessToken(),
  isAuthenticated: !!getAccessToken(),

  login: (access, refresh, user) => {
    setTokens(access, refresh);
    set({ accessToken: access, user, isAuthenticated: true });
  },

  updateAccessToken: (access) => {
    setTokens(access, null);
    set({ accessToken: access });
  },

  logout: () => {
    removeTokens();
    set({ accessToken: null, user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),
}));

export default useAuthStore;
