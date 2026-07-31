import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on page load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('doc_editor_token');
      const savedUser = localStorage.getItem('doc_editor_user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Proactively verify the token with backend
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('doc_editor_user', JSON.stringify(res.data));
        } catch (err) {
          console.warn('Failed to verify token on startup. Logging out...', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('doc_editor_token', token);
      localStorage.setItem('doc_editor_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login service error:', error);
      const message = error.response?.data?.error || 'Login failed. Please try again.';
      return { success: false, error: message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('doc_editor_token', token);
      localStorage.setItem('doc_editor_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Registration service error:', error);
      const message = error.response?.data?.error || 'Registration failed. Please try again.';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('doc_editor_token');
    localStorage.removeItem('doc_editor_user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
