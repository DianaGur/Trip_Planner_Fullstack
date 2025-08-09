import React, { useState } from 'react';
import axios from 'axios';
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

const PlanTrip = () => {
  const [formData, setFormData] = useState({
    city: '',
    tripType: 'hiking',
    days: 1
  });
  const [loading, setLoading] = useState(false);
  const [generatedTrip, setGeneratedTrip] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // רשימת מדינות לדוגמה
  const countries = [
    'ישראל', 'ירדן', 'טורקיה', 'יוון', 'איטליה', 
    'ספרד', 'צרפת', 'שוויץ', 'נפאל'
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleGenerateTrip = async (e) => {
    e.preventDefault();
    
    if (!formData.city) {
      setError('אנא הכנס שם עיר');
      return;
    }

    // בדיקת מינימום ימים לרכיבה
    if (formData.tripType === 'cycling' && formData.days < 2) {
      setError('טיול אופניים מינימום 2 ימים');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedTrip(null);

    try {
      const response = await axios.post('/api/trips/generate', {
        city: formData.city,
        tripType: formData.tripType,
        days: parseInt(formData.days)
      });
      
      setGeneratedTrip(response.data.data);
      setSuccess('מסלול נוצר בהצלחה!');
      
    } catch (error) {
      console.error('Error generating trip:', error);
      setError(
        error.response?.data?.message || 
        'שגיאה ביצירת המסלול. אנא נסה שוב.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!generatedTrip) return;

    const tripName = prompt('הכנס שם למסלול:');
    if (!tripName) return;

    const tripDescription = prompt('הכנס תיאור קצר (אופציונלי):') || '';

    setLoading(true);
    setError('');

    try {
      const tripData = {
        name: tripName,
        description: tripDescription,
        country: generatedTrip.country,
        city: generatedTrip.city,
        tripType: generatedTrip.tripType,
        route: generatedTrip.route,
        image: generatedTrip.image,
        tags: generatedTrip.tags || []
      };

      console.log('Saving trip with data:', tripData); // Debug

      const response = await axios.post('/api/trips', tripData);
      
      setSuccess('המסלול נשמר בהצלחה!');
      console.log('Trip saved successfully:', response.data.data);
      
      // ניקוי הודעת הצלחה אחרי 3 שניות
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Error saving trip:', error);
      console.error('Error response:', error.response?.data);
      
      setError(
        error.response?.data?.message || 
        'שגיאה בשמירת המסלול. אנא נסה שוב.'
      );
    } finally {
      setLoading(false);
    }
  };

  // הכנת נתונים למפה
  const getMapData = () => {
    if (!generatedTrip?.route?.coordinates) return null;

    const coordinates = generatedTrip.route.coordinates;
    const center = coordinates.length > 0 ? coordinates[0] : { lat: 31.5, lng: 34.75 };
    
    // קבוצת קואורדינטות לפוליליין
    const polylinePositions = coordinates.map(coord => [coord.lat, coord.lng]);
    
    return {
      center: [center.lat, center.lng],
      coordinates,
      polylinePositions
    };
  };

  const mapData = getMapData();

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">
            <i className="fas fa-route me-2 text-primary"></i>
            תכנון טיול חדש
          </h1>
        </div>
      </div>

      <div className="row">
        {/* טופס יצירת מסלול */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-cog me-2"></i>
                הגדרות הטיול
              </h5>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success">
                  <i className="fas fa-check-circle me-2"></i>
                  {success}
                </div>
              )}

              <form onSubmit={handleGenerateTrip}>
                <div className="mb-3">
                  <label htmlFor="city" className="form-label">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    עיר או אזור *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="הכנס שם עיר (לדוגמה: פריז, רומא, ירושלים)"
                    required
                    disabled={loading}
                  />
                  <small className="form-text text-muted">
                    הכנס שם עיר בכל מקום בעולם
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <i className="fas fa-walking me-2"></i>
                    סוג הטיול *
                  </label>
                  <div>
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="tripType"
                        id="hiking"
                        value="hiking"
                        checked={formData.tripType === 'hiking'}
                        onChange={handleInputChange}
                        disabled={loading}
                      />
                      <label className="form-check-label" htmlFor="hiking">
                        <i className="fas fa-hiking me-2 text-success"></i>
                        טרק רגלי (5-15 ק"מ ליום)
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="tripType"
                        id="cycling"
                        value="cycling"
                        checked={formData.tripType === 'cycling'}
                        onChange={handleInputChange}
                        disabled={loading}
                      />
                      <label className="form-check-label" htmlFor="cycling">
                        <i className="fas fa-bicycle me-2 text-warning"></i>
                        רכיבה על אופניים (20-60 ק"מ ליום)
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="days" className="form-label">
                    <i className="fas fa-calendar-alt me-2"></i>
                    מספר ימים *
                  </label>
                  <select
                    className="form-select"
                    id="days"
                    name="days"
                    value={formData.days}
                    onChange={handleInputChange}
                    disabled={loading}
                  >
                    {formData.tripType === 'hiking' ? (
                      <>
                        <option value={1}>יום אחד</option>
                        <option value={2}>יומיים</option>
                        <option value={3}>שלושה ימים</option>
                        <option value={4}>ארבעה ימים</option>
                        <option value={5}>חמישה ימים</option>
                      </>
                    ) : (
                      <>
                        <option value={2}>יומיים (מינימום)</option>
                        <option value={3}>שלושה ימים</option>
                        <option value={4}>ארבעה ימים</option>
                        <option value={5}>חמישה ימים</option>
                      </>
                    )}
                  </select>
                  <small className="form-text text-muted">
                    {formData.tripType === 'cycling' ? 'רכיבה מינימום 2 ימים' : 'בחר מספר ימים לטרק'}
                  </small>
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        יוצר מסלול...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-magic me-2"></i>
                        צור מסלול
                      </>
                    )}
                  </button>

                  {generatedTrip && (
                    <button
                      type="button"
                      className="btn btn-success btn-lg"
                      onClick={handleSaveTrip}
                      disabled={loading}
                    >
                      <i className="fas fa-save me-2"></i>
                      שמור מסלול
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* תצוגת המסלול */}
        <div className="col-lg-8">
          {!generatedTrip ? (
            <div className="card shadow">
              <div className="card-body text-center py-5">
                <i className="fas fa-map fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">בחר מדינה וסוג טיול כדי להתחיל</h5>
                <p className="text-muted mb-0">המסלול יוצג פה אחרי היצירה</p>
              </div>
            </div>
          ) : (
            <>
              {/* פרטי המסלול */}
              <div className="card shadow mb-4">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-info-circle me-2"></i>
                    פרטי המסלול
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>מדינה:</strong> {generatedTrip.country}</p>
                      {generatedTrip.city && (
                        <p><strong>עיר:</strong> {generatedTrip.city}</p>
                      )}
                      <p><strong>סוג טיול:</strong> {
                        generatedTrip.tripType === 'hiking' ? 'טרק רגלי' : 'רכיבה על אופניים'
                      }</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>מספר ימים:</strong> {generatedTrip.route.totalDays}</p>
                      <p><strong>מרחק כולל:</strong> {generatedTrip.route.totalDistance} ק"מ</p>
                      <p><strong>ממוצע ליום:</strong> {
                        Math.round(generatedTrip.route.totalDistance / generatedTrip.route.totalDays * 100) / 100
                      } ק"מ</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* תחזית מזג אוויר */}
              {generatedTrip?.weather && (
                <div className="card shadow mb-4">
                  <div className="card-header bg-warning text-dark">
                    <h5 className="mb-0">
                      <i className="fas fa-cloud-sun me-2"></i>
                      תחזית מזג אוויר ל-3 ימים הקרובים
                      {generatedTrip.weather.demo && (
                        <small className="ms-2 badge bg-info">דמה</small>
                      )}
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      {generatedTrip.weather.forecast.map((day, index) => (
                        <div key={index} className="col-md-4 mb-3">
                          <div className="card border-warning">
                            <div className="card-body text-center">
                              <h6 className="card-title text-primary">
                                <i className="fas fa-calendar-day me-1"></i>
                                יום {day.day}
                              </h6>
                              <p className="mb-2">
                                <small className="text-muted">{day.date}</small>
                              </p>
                              
                              <img 
                                src={day.icon} 
                                alt={day.description}
                                style={{ width: '50px', height: '50px' }}
                                className="mb-2"
                              />
                              
                              <div className="mb-2">
                                <span className="h4 text-primary">{day.temperature.max}°</span>
                                <span className="text-muted">/{day.temperature.min}°</span>
                              </div>
                              
                              <p className="mb-1">
                                <small>{day.description}</small>
                              </p>
                              
                              <div className="d-flex justify-content-between small text-muted">
                                <span>
                                  <i className="fas fa-tint me-1"></i>
                                  {day.humidity}%
                                </span>
                                <span>
                                  <i className="fas fa-wind me-1"></i>
                                  {day.windSpeed} קמ"ש
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-center text-muted mt-2">
                      <small>
                        <i className="fas fa-info-circle me-1"></i>
                        תחזית עודכנה: {new Date(generatedTrip.weather.updatedAt).toLocaleString('he-IL')}
                      </small>
                    </div>
                  </div>
                </div>
              )}

              {/* המפה */}
              <div className="card shadow mb-4">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-map me-2"></i>
                    מפת המסלול
                  </h5>
                </div>
                <div className="card-body p-0">
                  {mapData && (
                    <MapContainer
                      center={mapData.center}
                      zoom={10}
                      style={{ height: '400px', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      
                      {/* הצגת המסלול */}
                      <Polyline
                        positions={mapData.polylinePositions}
                        color="blue"
                        weight={4}
                        opacity={0.7}
                      />
                      
                      {/* סמנים לנקודות חשובות */}
                      {mapData.coordinates
                        .filter((_, index) => index === 0 || index === mapData.coordinates.length - 1)
                        .map((coord, index) => (
                          <Marker key={index} position={[coord.lat, coord.lng]}>
                            <Popup>
                              {index === 0 ? 'נקודת התחלה' : 'נקודת סיום'}
                            </Popup>
                          </Marker>
                        ))
                      }
                    </MapContainer>
                  )}
                </div>
              </div>

              {/* פירוט ימים */}
              <div className="card shadow">
                <div className="card-header bg-warning text-dark">
                  <h5 className="mb-0">
                    <i className="fas fa-calendar-alt me-2"></i>
                    פירוט לפי ימים
                  </h5>
                </div>
                <div className="card-body">
                  {generatedTrip.route.dailyRoutes.map((day, index) => (
                    <div key={index} className="border-bottom pb-3 mb-3">
                      <h6 className="text-primary">
                        <i className="fas fa-calendar-day me-2"></i>
                        יום {day.day}
                      </h6>
                      <div className="row">
                        <div className="col-md-6">
                          <p className="mb-1">
                            <strong>מרחק:</strong> {day.distance} ק"מ
                          </p>
                          <p className="mb-1">
                            <strong>זמן משוער:</strong> {Math.round(day.estimatedDuration * 100) / 100} שעות
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanTrip;