import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => api.getToken());
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  const fetchUser = useCallback(async () => {
    try {
      const userData = await api.get('/auth/me');
      setUser(userData);
    } catch (error) {
      // If fetching user fails, clear auth state
      api.clearToken();
      setToken(null);
      setUser(null);
    }
  }, []);

  // Check token and fetch user on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = api.getToken();
      if (storedToken) {
        setToken(storedToken);
        await fetchUser();
      }
      setIsLoading(false);
    };

    initAuth();
  }, [fetchUser]);

  const login = useCallback(async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = response;

    api.setToken(newToken);
    setToken(newToken);
    setUser(userData);

    return response;
  }, []);

  const register = useCallback(async (email, password, name) => {
    const response = await api.post('/auth/register', { email, password, name });
    const { token: newToken, user: userData } = response;

    api.setToken(newToken);
    setToken(newToken);
    setUser(userData);

    return response;
  }, []);

  const logout = useCallback(() => {
    api.clearToken();
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
