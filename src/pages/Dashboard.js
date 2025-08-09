import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container mt-4">
      {/* Welcome Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-primary text-white">
            <div className="card-body text-center py-5">
              <h1 className="display-4 mb-3">
                <i className="fas fa-map-marked-alt me-3"></i>
                ברוך הבא, {user?.name}!
              </h1>
              <p className="lead mb-0">
                מוכן לתכנן את הטיול הבא שלך? בוא נתחיל!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-12 text-end">
          <h2 className="mb-3">
            <i className="fas fa-bolt me-2 text-warning"></i>
            פעולות מהירות
          </h2>
        </div>
      </div>

      <div className="row g-4 mb-5">
        {/* Plan New Trip */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 border-0 shadow-sm hover-shadow">
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <i className="fas fa-route fa-3x text-primary"></i>
              </div>
              <h5 className="card-title">תכנון טיול חדש</h5>
              <p className="card-text text-muted">
                צור מסלול טיול מותאם אישית עם מפות ותחזית מזג אוויר
              </p>
              <Link to="/plan-trip" className="btn btn-primary btn-lg">
                <i className="fas fa-plus me-2"></i>
                התחל תכנון
              </Link>
            </div>
          </div>
        </div>

        {/* Trip History */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 border-0 shadow-sm hover-shadow">
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <i className="fas fa-history fa-3x text-success"></i>
              </div>
              <h5 className="card-title">היסטוריית טיולים</h5>
              <p className="card-text text-muted">
                צפה במסלולים שתכננת בעבר וטען אותם מחדש
              </p>
              <Link to="/trip-history" className="btn btn-success btn-lg">
                <i className="fas fa-eye me-2"></i>
                צפה בהיסטוריה
              </Link>
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 border-0 shadow-sm hover-shadow">
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <i className="fas fa-user-cog fa-3x text-info"></i>
              </div>
              <h5 className="card-title">ניהול פרופיל</h5>
              <p className="card-text text-muted">
                עדכן את הפרטים האישיים שלך והגדרות החשבון
              </p>
              <Link to="/profile" className="btn btn-info btn-lg">
                <i className="fas fa-cog me-2"></i>
                עדכן פרופיל
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-12 text-end">
          <h2 className="mb-3">
            <i className="fas fa-chart-bar me-2 text-info"></i>
            סטטיסטיקות
          </h2>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-3 col-sm-6">
          <div className="card bg-gradient-primary text-white">
            <div className="card-body text-center">
              <i className="fas fa-map fa-2x mb-2"></i>
              <h3 className="mb-1">0</h3>
              <p className="mb-0">טיולים שתוכננו</p>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card bg-gradient-success text-white">
            <div className="card-body text-center">
              <i className="fas fa-walking fa-2x mb-2"></i>
              <h3 className="mb-1">0</h3>
              <p className="mb-0">ק"מ של טרקים</p>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card bg-gradient-warning text-white">
            <div className="card-body text-center">
              <i className="fas fa-bicycle fa-2x mb-2"></i>
              <h3 className="mb-1">0</h3>
              <p className="mb-0">ק"מ של רכיבה</p>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card bg-gradient-info text-white">
            <div className="card-body text-center">
              <i className="fas fa-globe fa-2x mb-2"></i>
              <h3 className="mb-1">0</h3>
              <p className="mb-0">מדינות שביקרת</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
