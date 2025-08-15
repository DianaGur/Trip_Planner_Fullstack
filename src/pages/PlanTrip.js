import React, { useState, useContext, useEffect } from 'react';
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

const PlanTrip = () => {
  const { user } = useContext(AuthContext); // קבלת פרטי המשתמש
  
  const [formData, setFormData] = useState({
    city: '',
    tripType: 'hiking',
    days: 1
  });
  const [loading, setLoading] = useState(false);
  const [generatedTrip, setGeneratedTrip] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 🖼️ State לתמונת מיקום
  const [locationImage, setLocationImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [showLocationImage, setShowLocationImage] = useState(false);


  // 📸 פונקציה לטעינת תמונה ספציפית של המיקום עם AI
  const fetchLocationImage = async (city, country = '') => {
    if (!city) return;
    
    setImageLoading(true);
    try {
      console.log(`🤖 Fetching AI-powered image for: ${city}, ${country}`);
      
      // קריאה לשרת שלנו שמשתמש ב-AI + Unsplash
      const endpoint = country 
        ? `/api/images/location/${encodeURIComponent(city)}/${encodeURIComponent(country)}`
        : `/api/images/location/${encodeURIComponent(city)}`;
        
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch image from server');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setLocationImage(data.data);
        setShowLocationImage(true);
        console.log('✅ Got AI-powered image:', data.data.alt_description);
        
        if (data.message) {
          console.log('ℹ️', data.message);
        }
      } else {
        throw new Error('Invalid response from server');
      }
      
    } catch (error) {
      console.error('Error fetching AI image:', error);
      // תמונת דמה יפה אם יש בעיה
      setLocationImage(getDemoLocationImage(city));
      setShowLocationImage(true);
    } finally {
      setImageLoading(false);
    }
  };

  // 🎨 תמונת דמה אם API לא עובד
  const getDemoLocationImage = (city) => ({
    id: 'demo-1',
    urls: { 
      small: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', 
      regular: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      full: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200'
    },
    alt_description: `נוף יפה מ${city}`,
    user: { name: 'Travel Collection' },
    description: `תמונה יפה מ${city}`,
    location: { name: city }
  });

  // 🎯 useEffect שמאזין ליצירת טיול חדש
  useEffect(() => {
    if (generatedTrip && generatedTrip.city) {
      // כשנוצר טיול חדש, טען תמונה של העיר
      fetchLocationImage(generatedTrip.city, generatedTrip.country);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatedTrip?.city]);

  // 🖼️ רכיב תמונת המיקום
  const LocationImage = () => {
    if (!showLocationImage || !generatedTrip?.city) return null;

    return (
      <div className="card shadow mt-3">
        <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <i className="fas fa-camera text-white me-2"></i>
            {generatedTrip.city}, {generatedTrip.country}
          </h6>
          <button 
            className="btn btn-outline-light btn-sm"
            onClick={() => setShowLocationImage(false)}
            title="סגור תמונה"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="card-body p-0">
          {imageLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">טוען תמונה...</span>
              </div>
              <p className="mt-3 mb-0">מחפש תמונה יפה של {generatedTrip.city}...</p>
            </div>
          ) : locationImage ? (
            <div className="position-relative">
              <img
                src={locationImage.urls?.regular || locationImage.urls?.small}
                alt={locationImage.alt_description || `נוף מ${generatedTrip.city}`}
                className="img-fluid w-100"
                style={{
                  height: '300px',
                  objectFit: 'cover',
                  borderRadius: '0 0 8px 8px'
                }}
              />
              {/* Overlay עם מידע על התמונה */}
              <div 
                className="position-absolute bottom-0 start-0 end-0 text-white p-3"
                style={{
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  borderRadius: '0 0 8px 8px'
                }}
              >
                <div className="d-flex justify-content-between align-items-end">
                  <div>
                    {locationImage.description && (
                      <h6 className="mb-1">{locationImage.description}</h6>
                    )}
                    <small className="d-flex align-items-center">
                      <i className="fas fa-user me-1"></i>
                      צילום: {locationImage.user?.name || 'צלם לא ידוע'}
                    </small>
                  </div>
                  {locationImage.location?.name && (
                    <small className="badge bg-dark bg-opacity-75">
                      <i className="fas fa-map-marker-alt me-1"></i>
                      {locationImage.location.name}
                    </small>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <i className="fas fa-exclamation-circle text-warning fa-2x mb-3"></i>
              <p className="mb-2">לא ניתן לטעון תמונה של {generatedTrip.city} כרגע.</p>
              <button 
                className="btn btn-outline-success btn-sm"
                onClick={() => fetchLocationImage(generatedTrip.city, generatedTrip.country)}
              >
                <i className="fas fa-refresh me-1"></i>
                נסה שוב
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

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
    setShowLocationImage(false); // סגור גלריה קודמת

    try {
      console.log('🚀 Sending request to generate trip:', formData);
      console.log('👤 Current user:', user?.name || 'Unknown');
      
      const response = await axios.post('/api/trips/generate', {
        city: formData.city.trim(),
        tripType: formData.tripType,
        days: parseInt(formData.days)
      });
      
      console.log('✅ Trip generation response:', response.data);
      
      if (response.data.success && response.data.data) {
        setGeneratedTrip(response.data.data);
        setSuccess('מסלול נוצר בהצלחה!');
        // התמונה תטען אוטומטית דרך useEffect
      } else {
        throw new Error('Invalid response format');
      }
      
    } catch (error) {
      console.error('❌ Error generating trip:', error);
      console.error('Error response:', error.response?.data);
      
      setError(
        error.response?.data?.message || 
        'שגיאה ביצירת המסלול. אנא נסה שוב.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!generatedTrip) {
      setError('אין מסלול לשמירה');
      return;
    }

    if (!user) {
      setError('יש להתחבר כדי לשמור מסלול');
      return;
    }

    const tripName = prompt('הכנס שם למסלול (חובה):');
    if (!tripName || tripName.trim().length === 0) {
      setError('שם המסלול הוא חובה');
      return;
    }

    if (tripName.trim().length < 3) {
      setError('שם המסלול חייב להיות לפחות 3 תווים');
      return;
    }

    const tripDescription = prompt('הכנס תיאור קצר (אופציונלי):') || '';

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('💾 === ULTRA SAFE SAVING ===');
      console.log('👤 User:', user.name, '(ID:', user.userId, ')');
      console.log('📝 Trip name:', tripName.trim());
      
      // 🔍 דיבוג מעמיק של הנתונים המגיעים מהשרת
      console.log('🧐 === DEBUGGING INCOMING DATA ===');
      console.log('generatedTrip type:', typeof generatedTrip);
      console.log('generatedTrip.pointsOfInterest type:', typeof generatedTrip.pointsOfInterest);
      console.log('generatedTrip.pointsOfInterest isArray:', Array.isArray(generatedTrip.pointsOfInterest));
      console.log('generatedTrip.pointsOfInterest value:', generatedTrip.pointsOfInterest);
      
      if (generatedTrip.route?.dailyRoutes) {
        console.log('dailyRoutes type:', typeof generatedTrip.route.dailyRoutes);
        console.log('dailyRoutes isArray:', Array.isArray(generatedTrip.route.dailyRoutes));
        console.log('dailyRoutes length:', generatedTrip.route.dailyRoutes.length);
        
        generatedTrip.route.dailyRoutes.forEach((day, index) => {
          console.log(`Day ${index + 1}:`);
          console.log(`  pointsOfInterest type:`, typeof day.pointsOfInterest);
          console.log(`  pointsOfInterest isArray:`, Array.isArray(day.pointsOfInterest));
          console.log(`  pointsOfInterest value:`, day.pointsOfInterest);
        });
      }

      // 🔧 פונקציית ניקוי אולטימטיבית של POIs
      const cleanPOIsArray = (poisInput, debugName = 'POIs') => {
        console.log(`🧹 Cleaning ${debugName}:`, typeof poisInput, poisInput);
        
        if (!poisInput) {
          console.log(`${debugName}: null/undefined -> empty array`);
          return [];
        }
        
        if (typeof poisInput === 'string') {
          console.log(`${debugName}: string detected, attempting parse...`);
          try {
            // נסה JSON parse
            const parsed = JSON.parse(poisInput);
            if (Array.isArray(parsed)) {
              console.log(`${debugName}: JSON parse successful`);
              return cleanPOIsArray(parsed, `${debugName}_parsed`);
            }
          } catch (e) {
            console.log(`${debugName}: JSON parse failed, trying eval...`);
            try {
              // עדיף להימנע מeval, אבל זה לדיבוג בלבד
              // eslint-disable-next-line no-eval
              const evaluated = eval(poisInput);
              if (Array.isArray(evaluated)) {
                console.log(`${debugName}: eval successful`);
                return cleanPOIsArray(evaluated, `${debugName}_evaled`);
              }
            } catch (e2) {
              console.log(`${debugName}: all parsing failed, returning empty array`);
              return [];
            }
          }
          return [];
        }
        
        if (!Array.isArray(poisInput)) {
          console.log(`${debugName}: not array, converting to empty array`);
          return [];
        }
        
        // נקה כל אלמנט בarray
        const cleaned = poisInput.map((poi, index) => {
          if (!poi || typeof poi !== 'object') {
            console.log(`${debugName}[${index}]: invalid object, skipping`);
            return null;
          }
          
          const cleanPOI = {
            name: String(poi.name || `נקודה ${index + 1}`),
            description: String(poi.description || ''),
            coordinates: {
              lat: Number(poi.coordinates?.lat) || 0,
              lng: Number(poi.coordinates?.lng) || 0
            },
            type: String(poi.type || 'attraction'),
            day: Number(poi.day) || 1
          };
          
          console.log(`${debugName}[${index}]: cleaned to`, cleanPOI);
          return cleanPOI;
        }).filter(poi => poi !== null);
        
        console.log(`${debugName}: final cleaned array length:`, cleaned.length);
        return cleaned;
      };

      
      const cleanPOIs = cleanPOIsArray(generatedTrip.pointsOfInterest, 'Main POIs');
      
      const cleanDailyRoutes = Array.isArray(generatedTrip.route?.dailyRoutes) 
        ? generatedTrip.route.dailyRoutes.map((day, index) => ({
            day: Number(day.day) || (index + 1),
            distance: Number(day.distance) || 0,
            startPoint: {
              name: String(day.startPoint?.name || ''),
              coordinates: {
                lat: Number(day.startPoint?.coordinates?.lat) || 0,
                lng: Number(day.startPoint?.coordinates?.lng) || 0
              }
            },
            endPoint: {
              name: String(day.endPoint?.name || ''),
              coordinates: {
                lat: Number(day.endPoint?.coordinates?.lat) || 0,
                lng: Number(day.endPoint?.coordinates?.lng) || 0
              }
            },
            estimatedDuration: Number(day.estimatedDuration) || 0,
            difficulty: String(day.difficulty || 'moderate'),
            pointsOfInterest: cleanPOIsArray(day.pointsOfInterest, `Day ${index + 1} POIs`), // נקה POIs ליום
            isValidDistance: Boolean(day.isValidDistance),
            targetRange: String(day.targetRange || '')
          }))
        : [];

      // 🔧 בניית נתוני הטיול הסופיים
      const tripData = {
        name: tripName.trim(),
        description: tripDescription.trim(),
        country: String(generatedTrip.country || 'Unknown'),
        city: String(generatedTrip.city || 'Unknown'),
        tripType: String(generatedTrip.tripType || 'hiking'),
        route: {
          coordinates: Array.isArray(generatedTrip.route?.coordinates) ? generatedTrip.route.coordinates : [],
          dailyRoutes: cleanDailyRoutes,
          totalDistance: Number(generatedTrip.route?.totalDistance) || 0,
          totalDays: Number(generatedTrip.route?.totalDays) || 1,
          isBalanced: Boolean(generatedTrip.route?.isBalanced),
          averageDaily: Number(generatedTrip.route?.averageDaily) || 0,
          rules: String(generatedTrip.route?.rules || '')
        },
        pointsOfInterest: cleanPOIs, // POIs נקיים
        image: generatedTrip.image || null,
        tags: Array.isArray(generatedTrip.tags) ? generatedTrip.tags : [generatedTrip.tripType],
        weather: generatedTrip.weather || null,
        aiGenerated: Boolean(generatedTrip.aiGenerated)
      };

      console.log('📤 === FINAL VALIDATION BEFORE SEND ===');
      console.log('🔍 Trip data structure:');
      console.log('- pointsOfInterest type:', typeof tripData.pointsOfInterest);
      console.log('- pointsOfInterest isArray:', Array.isArray(tripData.pointsOfInterest));
      console.log('- pointsOfInterest length:', tripData.pointsOfInterest.length);
      console.log('- route.dailyRoutes type:', typeof tripData.route.dailyRoutes);
      console.log('- route.dailyRoutes isArray:', Array.isArray(tripData.route.dailyRoutes));
      console.log('- route.dailyRoutes length:', tripData.route.dailyRoutes.length);
      
      // בדוק כל dailyRoute
      tripData.route.dailyRoutes.forEach((day, index) => {
        console.log(`Day ${index + 1} validation:`);
        console.log(`  pointsOfInterest type:`, typeof day.pointsOfInterest);
        console.log(`  pointsOfInterest isArray:`, Array.isArray(day.pointsOfInterest));
        console.log(`  pointsOfInterest length:`, day.pointsOfInterest.length);
        
        // בדוק כל POI ביום
        day.pointsOfInterest.forEach((poi, poiIndex) => {
          console.log(`    POI ${poiIndex}: ${typeof poi} - ${poi?.name}`);
          if (typeof poi !== 'object' || Array.isArray(poi)) {
            console.error(`⚠️ DANGER: POI ${poiIndex} is not object!`);
          }
        });
      });

      console.log('📤 Sending ultra-clean trip data...');

      const response = await axios.post('/api/trips', tripData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📥 Server response:', response.data);
      
      if (response.data.success) {
        setSuccess(`המסלול "${tripName.trim()}" נשמר בהצלחה!`);
        console.log('✅ Trip saved successfully with ID:', response.data.data?.id);
        
        if (response.data.userStats) {
          console.log('📊 Updated user stats:', response.data.userStats);
        }
        
        setTimeout(() => setSuccess(''), 5000);
      } else {
        throw new Error(response.data.message || 'Failed to save trip');
      }
      
    } catch (error) {
      console.error('Error saving trip:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'שגיאה בשמירת המסלול. אנא נסה שוב.';
      
      if (error.response?.status === 401) {
        errorMessage = 'אין הרשאה. אנא התחבר מחדש.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.message || 'נתונים לא תקינים.';
      } else if (error.response?.status === 500) {
        errorMessage = 'שגיאת שרת. אנא נסה שוב מאוחר יותר.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateDailyAverage = () => {
    if (!generatedTrip?.route?.totalDistance || !generatedTrip?.route?.totalDays) {
      return 0;
    }
    return Math.round(generatedTrip.route.totalDistance / generatedTrip.route.totalDays * 100) / 100;
  };

  // הכנת נתונים למפה
  const getMapData = () => {
    if (!generatedTrip?.route?.coordinates || generatedTrip.route.coordinates.length === 0) {
      return null;
    }

    const coordinates = generatedTrip.route.coordinates;
    const center = coordinates[0];
    
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

              {/* הודעה אם המשתמש לא מחובר */}
              {!user && (
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>שים לב:</strong> כדי לשמור מסלולים יש להתחבר למערכת
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
                    {loading && !generatedTrip ? (
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

                  {generatedTrip && user && (
                    <button
                      type="button"
                      className="btn btn-success btn-lg"
                      onClick={handleSaveTrip}
                      disabled={loading}
                    >
                      {loading && generatedTrip ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          שומר...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          שמור מסלול
                        </>
                      )}
                    </button>
                  )}

                  {generatedTrip && !user && (
                    <div className="alert alert-warning mb-0">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      <small>
                        <strong>כדי לשמור מסלול יש להתחבר</strong><br />
                        <a href="/login" className="alert-link">התחבר כאן</a>
                      </small>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* פרטי המשתמש */}
          {user && (
            <div className="card shadow mt-3">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">
                  <i className="fas fa-user-circle me-2"></i>
                  פרטי המשתמש
                </h6>
              </div>
              <div className="card-body">
                <p className="mb-1"><strong>שם:</strong> {user.name}</p>
                <p className="mb-1"><strong>אימייל:</strong> {user.email}</p>
                <small className="text-muted">
                  <i className="fas fa-shield-alt me-1"></i>
                  מחובר - ניתן לשמור מסלולים
                </small>
              </div>
            </div>
          )}

          {/* 🖼️ תמונת המיקום */}
          <LocationImage />
        </div>

        {/* תצוגת המסלול */}
        <div className="col-lg-8">
          {!generatedTrip ? (
            <div className="card shadow">
              <div className="card-body text-center py-5">
                <i className="fas fa-map fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">בחר עיר וסוג טיול כדי להתחיל</h5>
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
                    {generatedTrip.aiGenerated && (
                      <small className="ms-2 badge bg-info">
                        <i className="fas fa-robot me-1"></i>
                        נוצר באמצעות AI
                      </small>
                    )}
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>מדינה:</strong> {generatedTrip.country}</p>
                      <p><strong>עיר:</strong> {generatedTrip.city}</p>
                      <p><strong>סוג טיול:</strong> {
                        generatedTrip.tripType === 'hiking' ? 'טרק רגלי' : 'רכיבה על אופניים'
                      }</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>מספר ימים:</strong> {generatedTrip.route.totalDays}</p>
                      <p><strong>מרחק כולל:</strong> {generatedTrip.route.totalDistance || 0} ק"מ</p>
                      <p><strong>ממוצע ליום:</strong> {calculateDailyAverage()} ק"מ</p>
                    </div>
                  </div>
                  
                  {/* נקודות עניין */}
                  {generatedTrip.pointsOfInterest && generatedTrip.pointsOfInterest.length > 0 && (
                    <div className="mt-3">
                      <h6 className="text-primary">
                        <i className="fas fa-map-marker-alt me-2"></i>
                        נקודות עניין ({generatedTrip.pointsOfInterest.length})
                      </h6>
                      <div className="row">
                        {generatedTrip.pointsOfInterest.map((poi, index) => (
                          <div key={index} className="col-md-6 mb-3">
                            <div className="card border-info">
                              <div className="card-body p-2">
                                <h6 className="card-title mb-1 text-info">
                                  <i className="fas fa-map-pin me-1"></i>
                                  {poi.name}
                                </h6>
                                <p className="card-text mb-1">
                                  <small className="text-muted">{poi.description}</small>
                                </p>
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
                  )}
                </div>
              </div>

              {/* המפה */}
              <div className="card shadow mb-4">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-map me-2"></i>
                    מפת המסלול
                    <small className="ms-2 badge bg-light text-dark">
                      {generatedTrip.route.coordinates?.length || 0} נקודות במסלול
                    </small>
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
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Routing by <a href="https://openrouteservice.org">OpenRouteService</a>'
                      />
                      
                      {/* הצגת המסלול */}
                      <Polyline
                        positions={mapData.polylinePositions}
                        color={generatedTrip.tripType === 'cycling' ? '#007bff' : '#28a745'}
                        weight={4}
                        opacity={0.8}
                      />
                      
                      {/* סמנים לנקודות חשובות */}
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
                      {generatedTrip.pointsOfInterest?.map((poi, index) => (
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

              {/* פירוט ימים */}
              <div className="card shadow">
                <div className="card-header bg-warning text-dark">
                  <h5 className="mb-0">
                    <i className="fas fa-calendar-alt me-2"></i>
                    פירוט לפי ימים
                  </h5>
                </div>
                <div className="card-body">
                  {generatedTrip.route.dailyRoutes && generatedTrip.route.dailyRoutes.length > 0 ? (
                    generatedTrip.route.dailyRoutes.map((day, index) => (
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
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted">
                      <i className="fas fa-info-circle me-2"></i>
                      אין פירוט יומי זמין
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* אין צורך יותר ב-Modal כי יש רק תמונה אחת */}
    </div>
  );
};

export default PlanTrip;