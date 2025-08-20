import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Loading animation while checking authentication
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

  // If the user is not authenticated, redirect to login
  if (!isAuthenticated) {
    // Store the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected children components
  return children;
};

export default ProtectedRoute;