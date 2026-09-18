import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { authAPI } from '../services/api';
import useAutoDismiss from '../hooks/useAutoDismiss';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const getStoredToken = () =>
    localStorage.getItem('token') || sessionStorage.getItem('token');

  const getSavedUser = () => {
    if (!getStoredToken()) {
      return null;
    }
    try {
      const rawUser = localStorage.getItem('user:v1') || localStorage.getItem('user');
      return JSON.parse(rawUser || 'null');
    } catch {
      return null;
    }
  };

  const storedLocalToken = localStorage.getItem('token');
  const storedSessionToken = sessionStorage.getItem('token');
  const tokenRef = useRef(storedLocalToken || storedSessionToken);
  const token = tokenRef.current;
  const [user, setUser] = useState(() => getSavedUser());
  const [loading, setLoading] = useState(() => Boolean(token && !getSavedUser()));
  const [error, setError] = useState(null);

  const persistUser = (nextUser) => {
    if (nextUser) {
      localStorage.setItem('user:v1', JSON.stringify(nextUser));
      setUser(nextUser);
      return;
    }

    localStorage.removeItem('user:v1');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Listen to global 401 logout event
  useEffect(() => {
    const handleAuthLogout = () => {
      persistUser(null);
    };
    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  // Check if saved auth is still valid and sync role from backend profile.
  useEffect(() => {
    const savedToken = token;

    const initializeAuth = async () => {
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.getProfile();
        persistUser(response.data.user);
      } catch (err) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        persistUser(null);
        setError('Saved login session expired. Please sign in again.');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password, rememberMe = true) => {
    try {
      setError(null);
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;

      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      if (rememberMe) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
      persistUser(user);

      return user;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    }
  };

  const verifyEmail = async (email, otp, rememberMe = true) => {
    try {
      setError(null);
      const response = await authAPI.verifyEmail({ email, otp });
      const { token, user } = response.data;
      if (token && user) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        if (rememberMe) {
          localStorage.setItem('token', token);
        } else {
          sessionStorage.setItem('token', token);
        }
        persistUser(user);
      }
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Email verification failed';
      setError(errorMessage);
      throw err;
    }
  };

  const updateUser = (updatedUser) => {
    persistUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    persistUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        verifyEmail,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
