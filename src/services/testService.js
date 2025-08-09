import API from './api';

// בדיקת חיבור לServer
export const testConnection = async () => {
  try {
    const response = await API.get('/test');
    console.log('✅ Connection successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Connection failed:', error);
    throw error;
  }
};

// בדיקה של route הבסיסי
export const testBasicRoute = async () => {
  try {
    // זה ייקרא ל http://localhost:5000/ (לא /api)
    const response = await fetch('/');
    const data = await response.json();
    console.log('✅ Basic route works:', data);
    return data;
  } catch (error) {
    console.error('❌ Basic route failed:', error);
    throw error;
  }
};