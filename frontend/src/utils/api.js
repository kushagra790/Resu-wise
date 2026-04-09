import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request Interceptor: Attach JWT token to all requests
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor: Handle token expiration
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired (401 Unauthorized), clear auth and redirect to login
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.code;
      
      if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'TOKEN_INVALID' || errorCode === 'NO_TOKEN') {
        // Clear authentication
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        
        // Redirect to login only if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
