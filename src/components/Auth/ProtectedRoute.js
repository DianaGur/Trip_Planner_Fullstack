import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // אם עדיין טוען, הצג spinner
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="mt-3">
            <h5 className="text-muted">טוען...</h5>
          </div>
        </div>
      </div>
    );
  }

  // אם לא מחובר, הפנה להתחברות
  if (!isAuthenticated) {
    // שמור את הדף שניסה לגשת אליו כדי להפנות אליו אחרי התחברות
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // אם מחובר, הצג את הרכיב
  return children;
};

export default ProtectedRoute;