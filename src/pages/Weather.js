import React, { useState, useEffect } from 'react';

const Weather = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [threeDayForecast, setThreeDayForecast] = useState(null);
  const [weeklyForecast, setWeeklyForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchCity, setSearchCity] = useState('תל אביב');
  const [currentCity, setCurrentCity] = useState('תל אביב');

  // משתמש ב-API key מהשרת דרך endpoint מיוחד
  const BASE_URL = 'https://api.openweathermap.org/data/2.5';
  const API_KEY = 'e8928d43559be6947280868e1e6be6f9'; // מה-.env שלך

  // פונקציה לקבלת מזג אוויר נוכחי
  const fetchCurrentWeather = async (city) => {
    try {
      const response = await fetch(
        `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric&lang=he`
      );
      
      if (!response.ok) {
        throw new Error('City not found');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  };

  // פונקציה לקבלת תחזית 5 ימים
  const fetchForecast = async (city) => {
    try {
      const response = await fetch(
        `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=he`
      );
      
      if (!response.ok) {
        throw new Error('Forecast not available');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  };

  // עיבוד תחזית 3 ימים מנתוני 5 ימים
  const process3DayForecast = (forecastData) => {
    const dailyData = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];
      
      // רק ימים עתידיים (לא היום)
      if (date >= today) {
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = {
            date: date,
            temps: [],
            conditions: [],
            humidity: [],
            wind: [],
            icons: []
          };
        }
        
        dailyData[dateKey].temps.push(item.main.temp);
        dailyData[dateKey].conditions.push(item.weather[0].description);
        dailyData[dateKey].humidity.push(item.main.humidity);
        dailyData[dateKey].wind.push(item.wind.speed);
        dailyData[dateKey].icons.push(item.weather[0].icon);
      }
    });

    return Object.values(dailyData).slice(0, 3).map(day => ({
      date: day.date,
      maxTemp: Math.round(Math.max(...day.temps)),
      minTemp: Math.round(Math.min(...day.temps)),
      condition: day.conditions[0],
      icon: day.icons[0],
      humidity: Math.round(day.humidity.reduce((a, b) => a + b) / day.humidity.length),
      windSpeed: Math.round(day.wind.reduce((a, b) => a + b) / day.wind.length)
    }));
  };

  // עיבוד תחזית שבועית מנתוני 5 ימים
  const processWeeklyForecast = (forecastData) => {
    const dailyData = {};
    
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: date,
          temps: [],
          conditions: [],
          humidity: [],
          wind: []
        };
      }
      
      dailyData[dateKey].temps.push(item.main.temp);
      dailyData[dateKey].conditions.push(item.weather[0].description);
      dailyData[dateKey].humidity.push(item.main.humidity);
      dailyData[dateKey].wind.push(item.wind.speed);
    });

    return Object.values(dailyData).slice(1, 8).map(day => ({ // דלג על היום הראשון
      date: day.date,
      maxTemp: Math.round(Math.max(...day.temps)),
      minTemp: Math.round(Math.min(...day.temps)),
      condition: day.conditions[0],
      humidity: Math.round(day.humidity.reduce((a, b) => a + b) / day.humidity.length),
      windSpeed: Math.round(day.wind.reduce((a, b) => a + b) / day.wind.length)
    }));
  };

  // טעינת נתוני מזג אוויר
  const loadWeatherData = async (city) => {
    setLoading(true);
    setError(null);
    
    try {
      // אם יש בעיה עם API, השתמש בנתונים דמה
      if (API_KEY === 'demo_key' || !API_KEY) {
        setTimeout(() => {
          setCurrentWeather(getDemoCurrentWeather(city));
          setThreeDayForecast(getDemo3DayForecast());
          setWeeklyForecast(getDemoWeeklyForecast());
          setCurrentCity(city);
          setLoading(false);
        }, 1000);
        return;
      }

      // קריאת API אמיתית
      const [currentData, forecastData] = await Promise.all([
        fetchCurrentWeather(city),
        fetchForecast(city)
      ]);

      setCurrentWeather(currentData);
      setThreeDayForecast(process3DayForecast(forecastData));
      setWeeklyForecast(processWeeklyForecast(forecastData));
      setCurrentCity(currentData.name);
      
    } catch (error) {
      setError(`שגיאה בטעינת נתוני מזג האוויר: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // נתוני דמה לפיתוח
  const getDemoCurrentWeather = (city) => ({
    name: city,
    main: {
      temp: 28,
      feels_like: 31,
      humidity: 65,
      pressure: 1013
    },
    weather: [{
      main: 'Clear',
      description: 'שמש',
      icon: '01d'
    }],
    wind: {
      speed: 3.2
    },
    sys: {
      country: 'IL'
    }
  });

  const getDemoForecast = () => [
    { dt: Date.now() + 10800000, main: { temp: 26 }, weather: [{ description: 'מעונן חלקית', icon: '02d' }] },
    { dt: Date.now() + 21600000, main: { temp: 24 }, weather: [{ description: 'מעונן', icon: '03d' }] },
    { dt: Date.now() + 32400000, main: { temp: 29 }, weather: [{ description: 'שמש', icon: '01d' }] },
    { dt: Date.now() + 43200000, main: { temp: 31 }, weather: [{ description: 'שמש', icon: '01d' }] },
    { dt: Date.now() + 86400000, main: { temp: 27 }, weather: [{ description: 'מעונן חלקית', icon: '02d' }] },
    { dt: Date.now() + 172800000, main: { temp: 25 }, weather: [{ description: 'גשום', icon: '10d' }] }
  ];

  const getDemoWeeklyForecast = () => {
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const today = new Date();
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      return {
        date,
        maxTemp: 28 + Math.floor(Math.random() * 8) - 4,
        minTemp: 18 + Math.floor(Math.random() * 6) - 3,
        condition: ['שמש', 'מעונן חלקית', 'מעונן', 'גשום'][Math.floor(Math.random() * 4)],
        humidity: 50 + Math.floor(Math.random() * 30),
        windSpeed: 2 + Math.floor(Math.random() * 8)
      };
    });
  };

  // טעינה ראשונית
  useEffect(() => {
    loadWeatherData(currentCity);
  }, []);

  // חיפוש עיר חדשה
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCity.trim()) {
      loadWeatherData(searchCity.trim());
    }
  };

  // זיהוי מיקום אוטומטי
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=he`
            );
            
            if (response.ok) {
              const data = await response.json();
              setCurrentCity(data.name);
              loadWeatherData(data.name);
            } else {
              loadWeatherData('תל אביב');
            }
          } catch {
            loadWeatherData('תל אביב');
          }
        },
        () => {
          loadWeatherData('תל אביב');
        }
      );
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('he-IL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const formatDayName = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);

    if (date.toDateString() === tomorrow.toDateString()) {
      return 'מחר';
    } else if (date.toDateString() === dayAfter.toDateString()) {
      return 'מחרתיים';
    } else {
      return date.toLocaleDateString('he-IL', { weekday: 'long' });
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">טוען נתוני מזג אוויר...</span>
          </div>
          <p className="mt-3">טוען נתוני מזג אוויר...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <h5 className="alert-heading">שגיאה!</h5>
          <p>{error}</p>
          <button className="btn btn-outline-danger" onClick={() => loadWeatherData('תל אביב')}>
            נסה שוב עם תל אביב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4 text-center">
            <i className="fas fa-cloud-sun text-warning me-2"></i>
            מזג אוויר
          </h2>

          {/* חיפוש עיר */}
          <div className="card mb-4">
            <div className="card-body">
              <form onSubmit={handleSearch} className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="הכנס שם עיר..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-search"></i>
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={getCurrentLocation}
                  title="זהה מיקום נוכחי"
                >
                  <i className="fas fa-location-arrow"></i>
                </button>
              </form>
            </div>
          </div>

          {/* מזג אוויר נוכחי */}
          {currentWeather && (
            <div className="card mb-4 shadow">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  {currentWeather.name}
                  {currentWeather.sys?.country && `, ${currentWeather.sys.country}`}
                </h4>
              </div>
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <div className="display-1 text-primary me-3">
                        {Math.round(currentWeather.main.temp)}°
                      </div>
                      <div>
                        <h5 className="mb-1">{currentWeather.weather[0].description}</h5>
                        <p className="text-muted mb-0">
                          מרגיש כמו {Math.round(currentWeather.main.feels_like)}°
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="row g-3">
                      <div className="col-6">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-tint text-info me-2"></i>
                          <div>
                            <small className="text-muted">לחות</small>
                            <div>{currentWeather.main.humidity}%</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-wind text-secondary me-2"></i>
                          <div>
                            <small className="text-muted">רוח</small>
                            <div>{Math.round(currentWeather.wind.speed)} קמ"ש</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-thermometer-half text-danger me-2"></i>
                          <div>
                            <small className="text-muted">לחץ אוויר</small>
                            <div>{currentWeather.main.pressure} hPa</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* תחזית 3 ימים */}
          {threeDayForecast && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-calendar-day me-2"></i>
                  תחזית מפורטת - 3 ימים קדימה
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-4">
                  {threeDayForecast.map((day, index) => (
                    <div key={index} className="col-md-4">
                      <div className="card h-100 text-center border-0 shadow-sm">
                        <div className="card-body p-4">
                          <h6 className="card-title text-primary mb-3">
                            {formatDayName(day.date)}
                          </h6>
                          <div className="mb-3">
                            <div className="display-6 text-primary fw-bold mb-1">
                              {day.maxTemp}°
                            </div>
                            <small className="text-muted">
                              {day.minTemp}° - {day.maxTemp}°
                            </small>
                          </div>
                          <p className="card-text mb-3">
                            <strong>{day.condition}</strong>
                          </p>
                          <div className="row g-2 small text-muted">
                            <div className="col-6">
                              <i className="fas fa-tint text-info me-1"></i>
                              {day.humidity}%
                            </div>
                            <div className="col-6">
                              <i className="fas fa-wind text-secondary me-1"></i>
                              {day.windSpeed} קמ"ש
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* תחזית שבועית */}
          {weeklyForecast && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-calendar-week me-2"></i>
                  תחזית שבועית
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {weeklyForecast.map((day, index) => (
                    <div key={index} className="col-md-6 col-lg-4">
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0">{formatDate(day.date)}</h6>
                            <span className="badge bg-primary">
                              {day.maxTemp}° / {day.minTemp}°
                            </span>
                          </div>
                          <p className="card-text mb-3">{day.condition}</p>
                          <div className="row g-2 small text-muted">
                            <div className="col-6">
                              <i className="fas fa-tint me-1"></i>
                              {day.humidity}%
                            </div>
                            <div className="col-6">
                              <i className="fas fa-wind me-1"></i>
                              {day.windSpeed} קמ"ש
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* הודעה על API */}
          {!API_KEY && (
            <div className="alert alert-warning mt-4" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <strong>מצב דמה:</strong> נתוני מזג אוויר דמה - API key לא זמין
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Weather;