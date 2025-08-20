import React, { useState, useEffect } from 'react';

/**
 * Weather Component
 * 
 * Comprehensive weather dashboard that displays current weather conditions,
 * 3-day detailed forecast, and weekly forecast. Features city search,
 * automatic location detection, and fallback to demo data.
 * 
 * @component
 * @returns {JSX.Element} Weather dashboard with multiple forecast views
 */
const Weather = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [threeDayForecast, setThreeDayForecast] = useState(null);
  const [weeklyForecast, setWeeklyForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchCity, setSearchCity] = useState('תל אביב');
  const [currentCity, setCurrentCity] = useState('תל אביב');

  const BASE_URL = 'https://api.openweathermap.org/data/2.5';
  const API_KEY = 'e8928d43559be6947280868e1e6be6f9';

  /**
   * Fetches current weather data for specified city
   * 
   * @param {string} city - City name to fetch weather for
   * @returns {Promise<Object>} Current weather data from OpenWeatherMap API
   * @throws {Error} When city is not found or API request fails
   */
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

  /**
   * Fetches 5-day weather forecast for specified city
   * 
   * @param {string} city - City name to fetch forecast for
   * @returns {Promise<Object>} 5-day forecast data from OpenWeatherMap API
   * @throws {Error} When forecast is not available or API request fails
   */
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

  /**
   * Processes 5-day forecast data into 3-day summary
   * Groups forecast data by date and calculates daily min/max temperatures
   * 
   * @param {Object} forecastData - Raw 5-day forecast data from API
   * @returns {Array} Array of 3 daily forecast objects with aggregated data
   */
  const process3DayForecast = (forecastData) => {
    const dailyData = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];
      
      // Only include future days (not today)
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

  /**
   * Processes 5-day forecast data into weekly summary
   * Groups forecast data by date and calculates daily aggregates
   * 
   * @param {Object} forecastData - Raw 5-day forecast data from API
   * @returns {Array} Array of daily forecast objects for the week
   */
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

    return Object.values(dailyData).slice(1, 8).map(day => ({
      date: day.date,
      maxTemp: Math.round(Math.max(...day.temps)),
      minTemp: Math.round(Math.min(...day.temps)),
      condition: day.conditions[0],
      humidity: Math.round(day.humidity.reduce((a, b) => a + b) / day.humidity.length),
      windSpeed: Math.round(day.wind.reduce((a, b) => a + b) / day.wind.length)
    }));
  };

  /**
   * Main function to load weather data for a city
   * Handles both real API calls and fallback to demo data
   * 
   * @param {string} city - City name to load weather data for
   */
  const loadWeatherData = async (city) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fallback to demo data if API key is not available
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

      // Real API calls
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

  // Demo data generators for development/fallback
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

  const getDemo3DayForecast = () => [
    { date: new Date(Date.now() + 86400000), maxTemp: 26, minTemp: 18, condition: 'מעונן חלקית', humidity: 60, windSpeed: 5 },
    { date: new Date(Date.now() + 172800000), maxTemp: 24, minTemp: 16, condition: 'מעונן', humidity: 70, windSpeed: 8 },
    { date: new Date(Date.now() + 259200000), maxTemp: 29, minTemp: 20, condition: 'שמש', humidity: 55, windSpeed: 3 }
  ];

  const getDemoWeeklyForecast = () => {
    const today = new Date();
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i + 1);
      
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

  // Initial data load
  useEffect(() => {
    loadWeatherData(currentCity);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCity.trim()) {
      loadWeatherData(searchCity.trim());
    }
  };

  /**
   * Gets user's current location and fetches weather data
   * Falls back to Tel Aviv if geolocation fails or is denied
   */
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

          {/* City Search */}
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

          {/* Current Weather Display */}
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

          {/* 3-Day Detailed Forecast */}
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

          {/* Weekly Forecast */}
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

          {/* API Demo Mode Notice */}
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