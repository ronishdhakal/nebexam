import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { getProfile } from '../api/auth';

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  // true while the app is loading stored tokens on cold start
  isLoading: true,

  // Called once on app mount to hydrate tokens from SecureStore
  initialize: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');

      if (accessToken && refreshToken) {
        set({ accessToken, refreshToken });

        // Fetch the full user profile so the store has up-to-date data
        try {
          const { data } = await getProfile();
          set({ user: data });
        } catch {
          // Token may be expired — the Axios interceptor will handle refresh;
          // if it fails, clearSession() is called from inside the interceptor.
        }
      }
    } finally {
      set({ isLoading: false });
    }
  },

  // Called after a successful login / register+verify
  setSession: async ({ access, refresh, user }) => {
    await SecureStore.setItemAsync('accessToken', access);
    await SecureStore.setItemAsync('refreshToken', refresh);
    set({ accessToken: access, refreshToken: refresh, user });
  },

  // Called on logout or when refresh token is invalid
  clearSession: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    set({ accessToken: null, refreshToken: null, user: null });
  },

  // Patch the cached user without re-fetching
  updateUser: (patch) =>
    set((state) => ({ user: state.user ? { ...state.user, ...patch } : patch })),

  isAuthenticated: () => Boolean(get().accessToken),
}));

export { useAuthStore };
