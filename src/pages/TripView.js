import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// תיקון אייקונים של Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const TripView = () => {
  const { id } = useParams(); // קבלת ID מה-URL
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // טעינת הטיול מהשרת
  useEffect(() => {
    const fetchTrip = async () => {
      if (!id) {
        setError('מזהה טיול לא תקין');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 Fetching trip with ID:', id);
        
        const response = await axios.get(`/api/trips/${id}`);
        
        if (response.data.success && response.data.data) {
          setTrip(response.data.data);
          console.log('✅ Trip loaded successfully:', response.data.data.name);
        } else {
          throw new Error('טיול לא נמצא');
        }
        
      } catch (error) {
        console.error('❌ Error fetching trip:', error);
        
        if (error.response?.status === 404) {
          setError('הטיול לא נמצא או שהוסר');
        } else if (error.response?.status === 401) {
          setError('אין הרשאה לצפות בטיול זה');
        } else {
          setError('שגיאה בטעינת הטיול. אנא נסה שוב.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  // מחיקת טיול
  const handleDeleteTrip = async () => {
    if (!trip) return;
    
    const confirmDelete = window.confirm(`האם אתה בטוח שברצונך למחוק את הטיול "${trip.name}"?`);
    if (!confirmDelete) return;

    try {
      setLoading(true);
      
      const response = await axios.delete(`/api/trips/${trip._id}`);
      
      if (response.data.success) {
        alert('הטיול נמחק בהצלחה');
        navigate('/dashboard'); // חזרה לדשבורד
      } else {
        throw new Error('שגיאה במחיקת הטיול');
      }
      
    } catch (error) {
      console.error('❌ Error deleting trip:', error);
      setError('שגיאה במחיקת הטיול. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  // הכנת נתוני המפה
  const getMapData = () => {
    if (!trip?.route?.coordinates || trip.route.coordinates.length === 0) {
      return null;
    }

    const coordinates = trip.route.coordinates;
    const center = coordinates[0];
    
    // קבוצת קואורדינטות לפוליליין
    const polylinePositions = coordinates.map(coord => [coord.lat, coord.lng]);
    
    return {
      center: [center.lat, center.lng],
      coordinates,
      polylinePositions
    };
  };

  // חישוב ממוצע יומי
  const calculateDailyAverage = () => {
    if (!trip?.route?.totalDistance || !trip?.route?.totalDays) {
      return 0;
    }
    return Math.round(trip.route.totalDistance / trip.route.totalDays * 100) / 100;
  };

  const mapData = getMapData();

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">טוען...</span>
          </div>
          <p className="mt-2">טוען את הטיול...</p>
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
            onClick={() => navigate('/dashboard')}
          >
            חזור לדשבורד
          </button>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h4>טיול לא נמצא</h4>
          <p>הטיול המבוקש לא נמצא או שהוסר.</p>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard')}
          >
            חזור לדשבורד
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* כותרת וכפתורי פעולה */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1">
                <i className="fas fa-map-marked-alt me-2 text-primary"></i>
                {trip.name}
              </h1>
              <p className="text-muted mb-0">
                <i className="fas fa-map-marker-alt me-1"></i>
                {trip.city}, {trip.country}
                {trip.aiGenerated && (
                  <span className="badge bg-info ms-2">
                    <i className="fas fa-robot me-1"></i>
                    נוצר באמצעות AI
                  </span>
                )}
              </p>
            </div>
            
            <div className="btn-group">
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigate('/dashboard')}
              >
                <i className="fas fa-arrow-right me-1"></i>
                חזור
              </button>
              
              {user && user.userId === trip.user && (
                <button 
                  className="btn btn-outline-danger"
                  onClick={handleDeleteTrip}
                >
                  <i className="fas fa-trash me-1"></i>
                  מחק
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* מידע כללי על הטיול */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                פרטי המסלול
              </h5>
            </div>
            <div className="card-body">
              {trip.description && (
                <p className="card-text mb-3">
                  <strong>תיאור:</strong> {trip.description}
                </p>
              )}
              
              <div className="row">
                <div className="col-md-6">
                  <p className="mb-2"><strong>סוג טיול:</strong> {
                    trip.tripType === 'hiking' ? 'טרק רגלי' : 'רכיבה על אופניים'
                  }</p>
                  <p className="mb-2"><strong>מספר ימים:</strong> {trip.route.totalDays}</p>
                  <p className="mb-2"><strong>מרחק כולל:</strong> {trip.route.totalDistance || 0} ק"מ</p>
                </div>
                <div className="col-md-6">
                  <p className="mb-2"><strong>ממוצע ליום:</strong> {calculateDailyAverage()} ק"מ</p>
                  <p className="mb-2"><strong>סטטוס:</strong> 
                    <span className={`ms-1 badge ${
                      trip.status === 'completed' ? 'bg-success' :
                      trip.status === 'planned' ? 'bg-primary' :
                      trip.status === 'cancelled' ? 'bg-danger' : 'bg-secondary'
                    }`}>
                      {trip.status === 'completed' ? 'הושלם' :
                       trip.status === 'planned' ? 'מתוכנן' :
                       trip.status === 'cancelled' ? 'בוטל' : 'טיוטה'}
                    </span>
                  </p>
                  <p className="mb-0"><strong>נוצר בתאריך:</strong> {new Date(trip.createdAt).toLocaleDateString('he-IL')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow">
            <div className="card-header bg-info text-white">
              <h6 className="mb-0">
                <i className="fas fa-chart-bar me-2"></i>
                סטטיסטיקות
              </h6>
            </div>
            <div className="card-body">
              <p className="mb-2"><strong>זמן משוער:</strong> {trip.stats?.estimatedTotalTime?.toFixed(1) || 0} שעות</p>
              <p className="mb-2"><strong>צפיות:</strong> {trip.views || 0}</p>
              <p className="mb-0"><strong>לייקים:</strong> {trip.likesCount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* המפה */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">
                <i className="fas fa-map me-2"></i>
                מפת המסלול
                {mapData && (
                  <small className="ms-2 badge bg-light text-dark">
                    {trip.route.coordinates?.length || 0} נקודות במסלול
                  </small>
                )}
              </h5>
            </div>
            <div className="card-body p-0">
              {mapData ? (
                <MapContainer
                  center={mapData.center}
                  zoom={12}
                  style={{ height: '500px', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {/* הצגת המסלול */}
                  <Polyline
                    positions={mapData.polylinePositions}
                    color={trip.tripType === 'cycling' ? '#007bff' : '#28a745'}
                    weight={4}
                    opacity={0.8}
                  />
                  
                  {/* סמנים לנקודות התחלה וסיום */}
                  {mapData.coordinates
                    .filter((_, index) => index === 0 || index === mapData.coordinates.length - 1)
                    .map((coord, index) => (
                      <Marker key={index} position={[coord.lat, coord.lng]}>
                        <Popup>
                          <div style={{ direction: 'rtl', textAlign: 'right' }}>
                            <strong>{index === 0 ? 'נקודת התחלה' : 'נקודת סיום'}</strong><br />
                            יום {coord.day}<br />
                            <small>קואורדינטות: {coord.lat.toFixed(4)}, {coord.lng.toFixed(4)}</small>
                          </div>
                        </Popup>
                      </Marker>
                    ))
                  }
                  
                  {/* סמנים לנקודות עניין */}
                  {trip.pointsOfInterest?.map((poi, index) => (
                    <Marker key={`poi-${index}`} position={[poi.coordinates.lat, poi.coordinates.lng]}>
                      <Popup>
                        <div style={{ direction: 'rtl', textAlign: 'right' }}>
                          <strong>{poi.name}</strong><br />
                          {poi.description}<br />
                          <small>יום {poi.day} • {poi.type}</small>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                  לא ניתן להציג מפה - אין נתוני מסלול
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* פירוט ימים */}
      {trip.route?.dailyRoutes && trip.route.dailyRoutes.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-header bg-warning text-dark">
                <h5 className="mb-0">
                  <i className="fas fa-calendar-alt me-2"></i>
                  פירוט לפי ימים
                </h5>
              </div>
              <div className="card-body">
                {trip.route.dailyRoutes.map((day, index) => (
                  <div key={index} className="border-bottom pb-3 mb-3">
                    <h6 className="text-primary">
                      <i className="fas fa-calendar-day me-2"></i>
                      יום {day.day}
                    </h6>
                    <div className="row">
                      <div className="col-md-6">
                        <p className="mb-1">
                          <strong>מרחק:</strong> {day.distance || 'לא זמין'} ק"מ
                        </p>
                        <p className="mb-1">
                          <strong>זמן משוער:</strong> {day.estimatedDuration || 'לא זמין'} שעות
                        </p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-1">
                          <strong>רמת קושי:</strong> 
                          <span className={`ms-1 badge ${
                            day.difficulty === 'easy' ? 'bg-success' :
                            day.difficulty === 'moderate' ? 'bg-warning' : 'bg-danger'
                          }`}>
                            {day.difficulty === 'easy' ? 'קל' :
                             day.difficulty === 'moderate' ? 'בינוני' : 'קשה'}
                          </span>
                        </p>
                        {day.pointsOfInterest && day.pointsOfInterest.length > 0 && (
                          <p className="mb-1">
                            <strong>נקודות עניין:</strong> {day.pointsOfInterest.length}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* נקודות עניין ליום */}
                    {day.pointsOfInterest && day.pointsOfInterest.length > 0 && (
                      <div className="mt-2">
                        <small className="text-muted">נקודות עניין:</small>
                        <div className="d-flex flex-wrap mt-1">
                          {day.pointsOfInterest.map((poi, poiIndex) => (
                            <span key={poiIndex} className="badge bg-light text-dark me-1 mb-1">
                              {poi.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* נקודות עניין כלליות */}
      {trip.pointsOfInterest && trip.pointsOfInterest.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  נקודות עניין ({trip.pointsOfInterest.length})
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {trip.pointsOfInterest.map((poi, index) => (
                    <div key={index} className="col-md-6 mb-3">
                      <div className="card border-info">
                        <div className="card-body p-3">
                          <h6 className="card-title mb-1 text-info">
                            <i className="fas fa-map-pin me-1"></i>
                            {poi.name}
                          </h6>
                          {poi.description && (
                            <p className="card-text mb-2">
                              <small className="text-muted">{poi.description}</small>
                            </p>
                          )}
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-primary">
                              <i className="fas fa-calendar-day me-1"></i>
                              יום {poi.day}
                            </small>
                            <small className="badge bg-secondary">
                              {poi.type}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripView;