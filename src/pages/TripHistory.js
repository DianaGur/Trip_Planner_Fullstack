import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const TripHistory = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/trips');
      setTrips(response.data.data);
    } catch (error) {
      console.error('Error fetching trips:', error);
      setError('שגיאה בטעינת הטיולים');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את הטיול?')) {
      return;
    }

    try {
      await axios.delete(`/api/trips/${tripId}`);
      setTrips(trips.filter(trip => trip._id !== tripId));
      alert('הטיול נמחק בהצלחה');
    } catch (error) {
      console.error('Error deleting trip:', error);
      alert('שגיאה במחיקת הטיול');
    }
  };

  const openTripModal = (trip) => {
    setSelectedTrip(trip);
    setShowModal(true);
  };

  const closeTripModal = () => {
    setSelectedTrip(null);
    setShowModal(false);
  };

  const getMapData = (trip) => {
    if (!trip?.route?.coordinates) return null;

    const coordinates = trip.route.coordinates;
    const center = coordinates.length > 0 ? coordinates[0] : { lat: 31.5, lng: 34.75 };
    const polylinePositions = coordinates.map(coord => [coord.lat, coord.lng]);
    
    return {
      center: [center.lat, center.lng],
      polylinePositions
    };
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="mt-3">
            <h5 className="text-muted">טוען את הטיולים שלך...</h5>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>
              <i className="fas fa-history me-2 text-primary"></i>
              היסטוריית הטיולים שלי
            </h1>
            <Link to="/plan-trip" className="btn btn-primary">
              <i className="fas fa-plus me-2"></i>
              צור טיול חדש
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {trips.length === 0 ? (
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow text-center">
              <div className="card-body py-5">
                <i className="fas fa-map fa-3x text-muted mb-3"></i>
                <h4 className="text-muted mb-3">אין טיולים שמורים</h4>
                <p className="text-muted mb-4">
                  עדיין לא תכננת אף טיול. התחל לתכנן את הטיול הראשון שלך!
                </p>
                <Link to="/plan-trip" className="btn btn-primary btn-lg">
                  <i className="fas fa-route me-2"></i>
                  תכנן טיול ראשון
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row">
          {trips.map((trip) => (
            <div key={trip._id} className="col-lg-4 col-md-6 mb-4">
              <div className="card shadow-sm hover-shadow h-100">
                {trip.image?.url && (
                  <img
                    src={trip.image.url}
                    className="card-img-top"
                    alt={trip.image.alt || trip.name}
                    style={{ height: '200px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-primary">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    {trip.name}
                  </h5>
                  
                  {trip.description && (
                    <p className="card-text text-muted mb-2">
                      {trip.description.length > 100 
                        ? `${trip.description.substring(0, 100)}...`
                        : trip.description
                      }
                    </p>
                  )}
                  
                  <div className="mb-3">
                    <small className="text-muted d-block">
                      <i className="fas fa-globe me-1"></i>
                      {trip.country} {trip.city && `• ${trip.city}`}
                    </small>
                    <small className="text-muted d-block">
                      <i className={`fas ${trip.tripType === 'hiking' ? 'fa-hiking' : 'fa-bicycle'} me-1`}></i>
                      {trip.tripType === 'hiking' ? 'טרק רגלי' : 'רכיבה על אופניים'}
                    </small>
                    <small className="text-muted d-block">
                      <i className="fas fa-route me-1"></i>
                      {trip.route.totalDistance} ק"מ • {trip.route.totalDays} ימים
                    </small>
                    <small className="text-muted d-block">
                      <i className="fas fa-calendar me-1"></i>
                      נוצר: {new Date(trip.createdAt).toLocaleDateString('he-IL')}
                    </small>
                  </div>

                  <div className="mt-auto">
                    <div className="btn-group w-100" role="group">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => openTripModal(trip)}
                      >
                        <i className="fas fa-eye me-1"></i>
                        צפה
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDeleteTrip(trip._id)}
                      >
                        <i className="fas fa-trash me-1"></i>
                        מחק
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal לצפייה בטיול */}
      {showModal && selectedTrip && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-map-marked-alt me-2"></i>
                  {selectedTrip.name}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeTripModal}
                ></button>
              </div>
              
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="text-primary">פרטי הטיול</h6>
                    <p><strong>מדינה:</strong> {selectedTrip.country}</p>
                    {selectedTrip.city && (
                      <p><strong>עיר:</strong> {selectedTrip.city}</p>
                    )}
                    <p><strong>סוג טיול:</strong> {
                      selectedTrip.tripType === 'hiking' ? 'טרק רגלי' : 'רכיבה על אופניים'
                    }</p>
                    {selectedTrip.description && (
                      <p><strong>תיאור:</strong> {selectedTrip.description}</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-success">סטטיסטיקות</h6>
                    <p><strong>מספר ימים:</strong> {selectedTrip.route.totalDays}</p>
                    <p><strong>מרחק כולל:</strong> {selectedTrip.route.totalDistance} ק"מ</p>
                    <p><strong>ממוצע ליום:</strong> {
                      Math.round(selectedTrip.route.totalDistance / selectedTrip.route.totalDays * 100) / 100
                    } ק"מ</p>
                    <p><strong>נוצר:</strong> {new Date(selectedTrip.createdAt).toLocaleDateString('he-IL')}</p>
                  </div>
                </div>

                {/* המפה */}
                <div className="mb-4">
                  <h6 className="text-info">מפת המסלול</h6>
                  {(() => {
                    const mapData = getMapData(selectedTrip);
                    return mapData ? (
                      <MapContainer
                        center={mapData.center}
                        zoom={10}
                        style={{ height: '300px', width: '100%' }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Polyline
                          positions={mapData.polylinePositions}
                          color="blue"
                          weight={4}
                          opacity={0.7}
                        />
                      </MapContainer>
                    ) : (
                      <div className="text-center text-muted">
                        <i className="fas fa-exclamation-triangle"></i>
                        אין נתוני מפה זמינים
                      </div>
                    );
                  })()}
                </div>

                {/* פירוט ימים */}
                <div>
                  <h6 className="text-warning">פירוט לפי ימים</h6>
                  <div className="row">
                    {selectedTrip.route.dailyRoutes.map((day, index) => (
                      <div key={index} className="col-md-6 mb-3">
                        <div className="card border-start border-primary border-3">
                          <div className="card-body py-2">
                            <h6 className="card-title text-primary mb-1">
                              יום {day.day}
                            </h6>
                            <p className="card-text mb-1">
                              <strong>מרחק:</strong> {day.distance} ק"מ
                            </p>
                            <p className="card-text mb-1">
                              <strong>זמן משוער:</strong> {Math.round(day.estimatedDuration * 100) / 100} שעות
                            </p>
                            <span className={`badge ${
                              day.difficulty === 'easy' ? 'bg-success' :
                              day.difficulty === 'moderate' ? 'bg-warning' : 'bg-danger'
                            }`}>
                              {day.difficulty === 'easy' ? 'קל' :
                               day.difficulty === 'moderate' ? 'בינוני' : 'קשה'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeTripModal}
                >
                  סגור
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripHistory;