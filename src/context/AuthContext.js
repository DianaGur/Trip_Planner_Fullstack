import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // בדיקת סטטוס אותנטיקציה
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      console.log('🔍 Checking authentication status...');
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('❌ No token found');
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      // הגדרת טוקן ב-axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // בדיקת תקינות הטוקן עם השרת
      console.log('📡 Validating token with server...');
      const response = await axios.get('/api/auth/me', {
        timeout: 5000
      });

      if (response.data.success && response.data.data) {
        console.log('✅ Token valid - user authenticated:', response.data.data.name);
        setUser(response.data.data);
        setIsAuthenticated(true);
      } else {
        throw new Error('Invalid response from server');
      }

    } catch (error) {
      console.error('❌ Auth check failed:', error.message);
      
      // אם השרת לא זמין או הטוקן לא תקין - נקה את הסשן
      if (error.code === 'ECONNREFUSED' || 
          error.response?.status === 401 || 
          error.response?.status === 403) {
        console.log('🧹 Clearing invalid session');
        clearAuthData();
      }
    } finally {
      setLoading(false);
    }
  };

  // ניקוי נתוני אותנטיקציה
  const clearAuthData = () => {
    console.log('🧹 Clearing authentication data');
    
    // ניקוי localStorage
    localStorage.removeItem('token');
    
    // ניקוי axios headers
    delete axios.defaults.headers.common['Authorization'];
    
    // ניקוי state
    setUser(null);
    setIsAuthenticated(false);
  };

  // התנתקות
  const logout = async (showMessage = true) => {
    try {
      console.log('👋 Logging out user:', user?.name || 'Unknown');
      
      // נסה להודיע לשרת על ההתנתקות (אופציונלי)
      try {
        await axios.post('/api/auth/logout', {}, {
          timeout: 3000
        });
        console.log('✅ Server notified of logout');
      } catch (serverError) {
        console.log('⚠️ Could not notify server of logout:', serverError.message);
      }
      
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      // תמיד נקה את הנתונים המקומיים
      clearAuthData();
      
      if (showMessage && user?.name) {
        console.log(`👋 ${user.name} logged out successfully`);
      }
    }
  };

  // בדיקת תקינות טוקן בטעינת האפליקציה
  useEffect(() => {
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // הגדרת Axios interceptor לטיפול בטוקנים פגי תוקף
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.log('🔐 Token expired or invalid - logging out');
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // התחברות
  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login for:', email);
      
      const response = await axios.post('/api/auth/login', {
        email: email.trim().toLowerCase(),
        password
      });

      if (response.data.success && response.data.token && response.data.user) {
        const { token, user: userData } = response.data;
        
        // שמירת הטוקן
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // עדכון state
        setUser(userData);
        setIsAuthenticated(true);
        
        console.log('✅ Login successful:', userData.name);
        
        return {
          success: true,
          message: `ברוך הבא, ${userData.name}!`
        };
        
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.error('❌ Login error:', error);
      
      let errorMessage = 'שגיאה בהתחברות';
      
      if (error.response?.status === 401) {
        errorMessage = 'אימייל או סיסמה שגויים';
      } else if (error.response?.status === 429) {
        errorMessage = 'יותר מדי ניסיונות התחברות. נסה שוב מאוחר יותר';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'שרת לא זמין. אנא נסה שוב מאוחר יותר';
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  // הרשמה
  const register = async (name, email, password, confirmPassword) => {
    try {
      console.log('📝 Attempting registration for:', email);
      
      // ולידציה בסיסית
      if (password !== confirmPassword) {
        return {
          success: false,
          message: 'הסיסמאות אינן זהות'
        };
      }

      if (password.length < 6) {
        return {
          success: false,
          message: 'הסיסמה חייבת להיות לפחות 6 תווים'
        };
      }

      const response = await axios.post('/api/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password
      });

      if (response.data.success && response.data.token && response.data.user) {
        const { token, user: userData } = response.data;
        
        // שמירת הטוקן
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // עדכון state
        setUser(userData);
        setIsAuthenticated(true);
        
        console.log('✅ Registration successful:', userData.name);
        
        return {
          success: true,
          message: `ברוך הבא, ${userData.name}! ההרשמה הושלמה בהצלחה`
        };
        
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.error('❌ Registration error:', error);
      
      let errorMessage = 'שגיאה בהרשמה';
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data.message || 'נתונים לא תקינים';
      } else if (error.response?.status === 409) {
        errorMessage = 'משתמש עם אימייל זה כבר קיים';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'שרת לא זמין. אנא נסה שוב מאוחר יותר';
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  // עדכון פרטי משתמש
  const updateUser = (updatedUserData) => {
    console.log('👤 Updating user data:', updatedUserData.name);
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUserData
    }));
  };

  // בדיקה אם המשתמש מחובר
  const isLoggedIn = () => {
    return isAuthenticated && user && localStorage.getItem('token');
  };

  // רענון טוקן (אם נדרש)
  const refreshAuth = async () => {
    if (!isLoggedIn()) {
      return false;
    }
    
    try {
      await checkAuthStatus();
      return true;
    } catch (error) {
      console.error('❌ Failed to refresh auth:', error);
      logout(false);
      return false;
    }
  };

  const value = {
    // State
    user,
    loading,
    isAuthenticated,
    
    // Methods
    login,
    register,
    logout,
    checkAuthStatus,
    updateUser,
    isLoggedIn,
    refreshAuth,
    clearAuthData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };