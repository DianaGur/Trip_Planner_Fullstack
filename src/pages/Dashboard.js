import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalKilometers: 0,
    hikingKilometers: 0,
    cyclingKilometers: 0,
    countriesVisited: 0
  });
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // טעינת סטטיסטיקות בעליית הרכיב
  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching user statistics...');
      
      const response = await axios.get('/api/trips/stats');
      
      if (response.data.success) {
        setStats(response.data.stats);
        setRecentTrips(response.data.recentTrips || []);
        console.log('✅ Stats loaded:', response.data.stats);
      } else {
        throw new Error('Failed to fetch stats');
      }
      
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      setError('שגיאה בטעינת הסטטיסטיקות');
    } finally {
      setLoading(false);
    }
  };

  // פורמט מספרים לתצוגה יפה
  const formatNumber = (num) => {
    if (num === 0) return '0';
    if (num < 1000) return num.toString();
    return (num / 1000).toFixed(1) + 'K';
  };

  // פורמט תאריך
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

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
            {loading && (
              <span className="spinner-border spinner-border-sm ms-2" role="status"></span>
            )}
          </h2>
        </div>
      </div>

      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-warning" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
              <button 
                className="btn btn-sm btn-outline-warning ms-3"
                onClick={fetchUserStats}
              >
                נסה שוב
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="row g-4 mb-5">
        <div className="col-md-3 col-sm-6">
          <div className="card bg-gradient-primary text-white">
            <div className="card-body text-center">
              <i className="fas fa-map fa-2x mb-2"></i>
              <h3 className="mb-1">{formatNumber(stats.totalTrips)}</h3>
              <p className="mb-0">טיולים שתוכננו</p>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card bg-gradient-success text-white">
            <div className="card-body text-center">
              <i className="fas fa-walking fa-2x mb-2"></i>
              <h3 className="mb-1">{formatNumber(stats.hikingKilometers)}</h3>
              <p className="mb-0">ק"מ של טרקים</p>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card bg-gradient-warning text-white">
            <div className="card-body text-center">
              <i className="fas fa-bicycle fa-2x mb-2"></i>
              <h3 className="mb-1">{formatNumber(stats.cyclingKilometers)}</h3>
              <p className="mb-0">ק"מ של רכיבה</p>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card bg-gradient-info text-white">
            <div className="card-body text-center">
              <i className="fas fa-globe fa-2x mb-2"></i>
              <h3 className="mb-1">{formatNumber(stats.countriesVisited)}</h3>
              <p className="mb-0">מדינות שביקרת</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Trips */}
      {recentTrips.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-light">
                <h5 className="card-title mb-0 text-end">
                  <i className="fas fa-clock me-2"></i>
                  טיולים אחרונים
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {recentTrips.map((trip, index) => (
                    <div key={trip._id} className="col-md-6 col-lg-4 mb-3">
                      <div className="card border-start border-3 border-primary">
                        <div className="card-body py-3">
                          <h6 className="card-title text-end mb-1">{trip.title}</h6>
                          <p className="card-text text-muted text-end mb-2">
                            <i className="fas fa-map-marker-alt me-1"></i>
                            {trip.city}, {trip.country}
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              {formatDate(trip.createdAt)}
                            </small>
                            <div className="text-end">
                              <span className={`badge ${trip.tripType === 'cycling' ? 'bg-warning' : 'bg-success'} me-2`}>
                                <i className={`fas ${trip.tripType === 'cycling' ? 'fa-bicycle' : 'fa-walking'} me-1`}></i>
                                {trip.tripType === 'cycling' ? 'רכיבה' : 'הליכה'}
                              </span>
                              <span className="badge bg-info">
                                {trip.stats?.totalKilometers || 0}ק"מ
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <Link to="/trip-history" className="btn btn-outline-primary">
                    <i className="fas fa-eye me-2"></i>
                    צפה בכל הטיולים
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;