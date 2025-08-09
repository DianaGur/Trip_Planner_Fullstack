import axios from 'axios';

// יצירת instance של axios עם הגדרות בסיסיות
const API = axios.create({
  baseURL: '/api', // בגלל הproxy, זה יפנה ל http://localhost:5000/api
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor להוספת JWT token לכל בקשה
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

// Interceptor לטיפול בתגובות ושגיאות
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // אם JWT פג תוקף, הוצא את המשתמש
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;