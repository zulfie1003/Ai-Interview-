import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ai_interview_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Restore the saved JWT on page refresh and validate it with the backend.
      const storedToken = localStorage.getItem('ai_interview_token');
      if (storedToken) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          const { data } = await api.get('/auth/me');
          setUser(data.user);
          setToken(storedToken);
        } catch {
          localStorage.removeItem('ai_interview_token');
          delete api.defaults.headers.common['Authorization'];
          setToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    // Password login stores the JWT and attaches it to all future API requests.
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('ai_interview_token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data.user);
    setToken(data.token);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    // Registration immediately signs the user in after account creation.
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('ai_interview_token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data.user);
    setToken(data.token);
    return data;
  }, []);

  const loginWithGoogle = useCallback(async (credential) => {
    // Google login sends the browser credential to the backend for server-side verification.
    const { data } = await api.post('/auth/google', { credential });
    localStorage.setItem('ai_interview_token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data.user);
    setToken(data.token);
    return data;
  }, []);

  const logout = useCallback(() => {
    // Clear local auth state and remove the default Authorization header.
    localStorage.removeItem('ai_interview_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginWithGoogle, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
