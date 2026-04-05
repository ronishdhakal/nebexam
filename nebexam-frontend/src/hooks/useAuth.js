import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import { authService } from '@/services/users.service';

const useAuth = () => {
  const { user, accessToken, isAuthenticated, login, logout, setUser } = useAuthStore();

  useEffect(() => {
    if (accessToken && !user) {
      authService.getProfile()
        .then((res) => setUser(res.data))
        .catch(() => logout());
    }
  }, [accessToken]);

  const handleLogin = async (credentials) => {
    const res = await authService.login(credentials);
    const { access, refresh, user: userData } = res.data;
    login(access, refresh, userData);
    return res.data;
  };

  const handleLogout = async () => {
    try { await authService.logout(); } finally { logout(); }
  };

  const handleRegister = async (data) => {
    const res = await authService.register(data);
    // Registration now returns {email, detail} — verification required before login
    return res.data;
  };

  const handleVerifyEmail = async (email, code) => {
    const res = await authService.verifyEmail(email, code);
    const { access, refresh, user: userData } = res.data;
    login(access, refresh, userData);
    return res.data;
  };

  return {
    user,
    token: accessToken,
    accessToken,
    isAuthenticated,
    handleLogin,
    handleLogout,
    handleRegister,
    handleVerifyEmail,
  };
};

export default useAuth;
