import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const TripHistory = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [trips, setTrips] = useState([]); // 🔧 ודא שזה array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  // טעינת הטיולים מהשרת
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching user trips...');
        
        const response = await axios.get('/api/trips');
        
        if (response.data.success) {
          // 🔧 ודא שה-data הוא array
          const tripsData = Array.isArray(response.data.data) ? response.data.data : [];
          setTrips(tripsData);
          setStats(response.data.userStats);
          
          console.log('✅ Trips loaded successfully:', tripsData.length);
        } else {
          throw new Error('Failed to fetch trips');
        }
        
      } catch (error) {
        console.error('❌ Error fetching trips:', error);
        setError('שגיאה בטעינת הטיולים. אנא נסה שוב.');
        setTrips([]); // 🔧 ודא שזה array גם במקרה של שגיאה
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTrips();
    }
  }, [user]);

  // מחיקת טיול
  const handleDeleteTrip = async (tripId, tripName) => {
    const confirmDelete = window.confirm(`האם אתה בטוח שברצונך למחוק את הטיול "${tripName}"?`);
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`/api/trips/${tripId}`);
      
      if (response.data.success) {
        // הסר את הטיול מהרשימה
        setTrips(prevTrips => prevTrips.filter(trip => trip._id !== tripId));
        alert('הטיול נמחק בהצלחה');
      } else {
        throw new Error('שגיאה במחיקת הטיול');
      }
      
    } catch (error) {
      console.error('❌ Error deleting trip:', error);
      alert('שגיאה במחיקת הטיול. אנא נסה שוב.');
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">טוען...</span>
          </div>
          <p className="mt-2">טוען את הטיולים שלך...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h4>שגיאה</h4>
          <p>{error}</p>
          <button 
            className="btn btn-secondary"
            onClick={() => window.location.reload()}
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* כותרת */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="mb-3">
            <i className="fas fa-history me-2 text-primary"></i>
            היסטוריית הטיולים שלי
          </h1>
          {user && (
            <p className="text-muted">
              ברוך הבא, {user.name}! כאן תוכל לראות את כל הטיולים שיצרת.
            </p>
          )}
        </div>
      </div>

      {/* סטטיסטיקות */}
      {stats && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">
                  <i className="fas fa-chart-bar me-2"></i>
                  הסטטיסטיקות שלך
                </h5>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-md-3">
                    <div className="mb-2">
                      <i className="fas fa-map-marked-alt fa-2x text-primary"></i>
                    </div>
                    <h4 className="text-primary">{stats.totalTrips}</h4>
                    <small className="text-muted">טיולים</small>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-2">
                      <i className="fas fa-route fa-2x text-success"></i>
                    </div>
                    <h4 className="text-success">{stats.totalKilometers?.toFixed(1) || 0}</h4>
                    <small className="text-muted">ק"מ כולל</small>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-2">
                      <i className="fas fa-clock fa-2x text-warning"></i>
                    </div>
                    <h4 className="text-warning">{stats.totalTime?.toFixed(1) || 0}</h4>
                    <small className="text-muted">שעות</small>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-2">
                      <i className="fas fa-globe fa-2x text-info"></i>
                    </div>
                    <h4 className="text-info">{stats.countriesVisited || 0}</h4>
                    <small className="text-muted">מדינות</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* רשימת הטיולים */}
      <div className="row">
        <div className="col-12">
          {/* 🔧 בדיקה בטוחה של trips */}
          {!Array.isArray(trips) ? (
            <div className="alert alert-warning">
              <h4>בעיה בטעינת הנתונים</h4>
              <p>הנתונים לא נטענו בצורה תקינה. אנא רענן את הדף.</p>
              <button 
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                רענן דף
              </button>
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-map fa-4x text-muted mb-3"></i>
              <h3 className="text-muted">אין טיולים עדיין</h3>
              <p className="text-muted mb-4">
                עדיין לא יצרת טיולים. בואי נתחיל!
              </p>
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/plan-trip')}
              >
                <i className="fas fa-plus me-2"></i>
                צור טיול חדש
              </button>
            </div>
          ) : (
            <>
              {/* כותרת רשימה */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>הטיולים שלך ({trips.length})</h4>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/plan-trip')}
                >
                  <i className="fas fa-plus me-2"></i>
                  טיול חדש
                </button>
              </div>

              {/* גריד הטיולים */}
              <div className="row">
                {trips.map((trip, index) => (
                  <div key={trip._id || index} className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100 shadow-sm">
                      <div className="card-body">
                        <h5 className="card-title text-primary">
                          <i className="fas fa-map-marked-alt me-2"></i>
                          {trip.name || 'טיול ללא שם'}
                        </h5>
                        <p className="card-text text-muted mb-2">
                          <i className="fas fa-map-marker-alt me-1"></i>
                          {trip.city || 'עיר לא זמינה'}, {trip.country || 'מדינה לא זמינה'}
                        </p>
                        
                        {/* סטטיסטיקות הטיול */}
                        <div className="row text-center mb-3">
                          <div className="col-4">
                            <small className="text-muted">ימים</small>
                            <div className="fw-bold">{trip.route?.totalDays || 0}</div>
                          </div>
                          <div className="col-4">
                            <small className="text-muted">ק"מ</small>
                            <div className="fw-bold">{trip.stats?.totalKilometers?.toFixed(1) || trip.route?.totalDistance?.toFixed(1) || 0}</div>
                          </div>
                          <div className="col-4">
                            <small className="text-muted">סוג</small>
                            <div className="fw-bold">
                              <i className={`fas ${trip.tripType === 'cycling' ? 'fa-bicycle' : 'fa-walking'}`}></i>
                            </div>
                          </div>
                        </div>
                        
                        {/* סטטוס ופעולות */}
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <span className={`badge ${
                              trip.status === 'completed' ? 'bg-success' :
                              trip.status === 'planned' ? 'bg-primary' :
                              trip.status === 'cancelled' ? 'bg-danger' : 'bg-secondary'
                            }`}>
                              {trip.status === 'completed' ? 'הושלם' :
                               trip.status === 'planned' ? 'מתוכנן' :
                               trip.status === 'cancelled' ? 'בוטל' : 'טיוטה'}
                            </span>
                          </div>
                          <div className="btn-group btn-group-sm">
                            <button 
                              className="btn btn-outline-primary"
                              onClick={() => navigate(`/trip/${trip._id}`)}
                              title="צפה בטיול"
                            >
                              <i className="fas fa-eye"></i>
                              <span className="d-none d-md-inline ms-1">צפה</span>
                            </button>
                            
                            <button 
                              className="btn btn-outline-danger"
                              onClick={() => handleDeleteTrip(trip._id, trip.name)}
                              title="מחק טיול"
                            >
                              <i className="fas fa-trash"></i>
                              <span className="d-none d-md-inline ms-1">מחק</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="card-footer text-muted">
                        <small>
                          <i className="fas fa-calendar me-1"></i>
                          נוצר ב-{trip.createdAt ? new Date(trip.createdAt).toLocaleDateString('he-IL') : 'תאריך לא זמין'}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripHistory;