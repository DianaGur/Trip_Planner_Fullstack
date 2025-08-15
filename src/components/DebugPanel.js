import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const DebugPanel = () => {
  const { user, isAuthenticated, logout, clearAuthData, checkAuthStatus } = useContext(AuthContext);
  const [showPanel, setShowPanel] = useState(false);

  const handleClearAllData = () => {
    const confirmed = window.confirm(
      'זה ינקה את כל הנתונים המקומיים ויתנתק אותך מהמערכת. האם אתה בטוח?'
    );
    
    if (confirmed) {
      try {
        // נקה localStorage
        localStorage.clear();
        
        // נקה sessionStorage
        sessionStorage.clear();
        
        // נקה auth data
        clearAuthData();
        
        // רענן את הדף
        window.location.reload();
      } catch (error) {
        console.error('Error clearing data:', error);
        // גם אם יש שגיאה, רענן את הדף
        window.location.reload();
      }
    }
  };

  const handleForceLogout = async () => {
    try {
      await logout();
      window.location.reload();
    } catch (error) {
      console.error('Error during logout:', error);
      window.location.reload();
    }
  };

  const handleCheckAuth = async () => {
    try {
      await checkAuthStatus();
    } catch (error) {
      console.error('Error checking auth:', error);
    }
  };

  // הצג את הפאנל רק במצב development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999
    }}>
      {!showPanel ? (
        <button
          onClick={() => setShowPanel(true)}
          className="btn btn-warning btn-sm"
          title="פאנל ניפוי באגים"
        >
          🔧 Debug
        </button>
      ) : (
        <div className="card shadow" style={{ width: '300px' }}>
          <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
            <h6 className="mb-0">🔧 פאנל ניפוי באגים</h6>
            <button
              onClick={() => setShowPanel(false)}
              className="btn btn-sm btn-outline-dark"
            >
              ✕
            </button>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <strong>סטטוס משתמש:</strong>
              <div className="small text-muted">
                <div>מחובר: {isAuthenticated ? '✅ כן' : '❌ לא'}</div>
                <div>שם: {user?.name || 'אין'}</div>
                <div>אימייל: {user?.email || 'אין'}</div>
                <div>טוקן: {localStorage.getItem('token') ? '✅ קיים' : '❌ לא קיים'}</div>
              </div>
            </div>

            <div className="d-grid gap-2">
              <button
                onClick={handleCheckAuth}
                className="btn btn-info btn-sm"
              >
                🔍 בדוק אותנטיקציה
              </button>

              {isAuthenticated && (
                <button
                  onClick={handleForceLogout}
                  className="btn btn-secondary btn-sm"
                >
                  👋 התנתק
                </button>
              )}

              <button
                onClick={handleClearAllData}
                className="btn btn-danger btn-sm"
              >
                🧹 נקה הכל ורענן
              </button>
            </div>

            <div className="mt-3 small text-muted">
              <div><strong>LocalStorage:</strong></div>
              <div>Keys: {Object.keys(localStorage).length}</div>
              <div>
                {Object.keys(localStorage).map(key => (
                  <div key={key}>• {key}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;