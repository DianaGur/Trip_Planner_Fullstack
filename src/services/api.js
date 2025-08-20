import axios from 'axios';

/**
 * Configured Axios Instance for API Communication
 * 
 * Pre-configured axios instance with automatic JWT token handling,
 * authentication interceptors, and error management for unauthorized access.
 * Handles token injection and automatic logout on authentication failure.
 */

// Create axios instance with base configuration
const API = axios.create({
  baseURL: '/api', // Proxy redirects to http://localhost:5000/api
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Automatically attaches JWT token from localStorage to all outgoing requests
 * Ensures authenticated requests include proper Authorization header
 */
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
 * Response Interceptor
 * Handles authentication errors and automatic logout
 * Redirects to login page when JWT token expires or becomes invalid
 */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear authentication data and redirect to login on token expiration
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;