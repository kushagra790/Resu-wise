import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        // Try to get user info from localStorage or fetch it
        const storedUser = localStorage.getItem('authUser');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await api.post('/api/auth/login', {
        email,
        password
      });

      const { token: newToken, user: userData } = response.data;

      // Store token and user in localStorage
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('authUser', JSON.stringify(userData));

      // Update context state
      setToken(newToken);
      setUser(userData);

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      const errorCode = err.response?.data?.code || 'LOGIN_ERROR';
      const failedAttempts = err.response?.data?.failedAttempts;
      const attemptsRemaining = err.response?.data?.attemptsRemaining;
      const lockTimeMinutes = err.response?.data?.lockTimeMinutes;

      setError({
        message: errorMessage,
        code: errorCode,
        failedAttempts,
        attemptsRemaining,
        lockTimeMinutes
      });

      return { 
        success: false, 
        error: errorMessage,
        details: { failedAttempts, attemptsRemaining, lockTimeMinutes }
      };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password, passwordConfirm) => {
    try {
      setError(null);
      setLoading(true);

      const response = await api.post('/api/auth/signup', {
        name,
        email,
        password,
        passwordConfirm
      });

      const { token: newToken, user: userData } = response.data;

      // Store token and user in localStorage
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('authUser', JSON.stringify(userData));

      // Update context state
      setToken(newToken);
      setUser(userData);

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Signup failed';
      const details = err.response?.data?.details || [];

      setError({
        message: errorMessage,
        details
      });

      return { 
        success: false, 
        error: errorMessage,
        validationErrors: details
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');

    // Clear context state
    setToken(null);
    setUser(null);
    setError(null);
  };

  const isAuthenticated = !!token;

  const value = {
    user,
    token,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated,
    clearError: () => setError(null)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
