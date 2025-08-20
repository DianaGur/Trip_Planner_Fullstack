import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// תיקון אייקונים של Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RouteMap = ({ route, tripType, height = '500px', showControls = true }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedDay, setSelectedDay] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const routeLayersRef = useRef([]);

  // intial map setup
  useEffect(() => {
    if (!mapRef.current || !route || !route.coordinates) return;

    console.log('🗺️ Initializing map with route data:', {
      totalCoordinates: route.coordinates.length,
      totalDays: route.totalDays,
      dailyRoutes: route.dailyRoutes?.length
    });

    initializeMap();
    setMapReady(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [route]);

  // update map when selected day changes or map is ready
  useEffect(() => {
    if (mapReady && mapInstanceRef.current) {
      updateMapDisplay();
    }
  }, [selectedDay, mapReady]);

  const initializeMap = () => {
    try {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Calculate the center of the map based on route coordinates
      const center = calculateMapCenter(route.coordinates);
      
      console.log('🎯 Map center calculated:', center);

      // map initialization
      const map = L.map(mapRef.current, {
        center: [center.lat, center.lng],
        zoom: 13,
        zoomControl: true,
        attributionControl: true
      });

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Route by <a href="https://openrouteservice.org">OpenRouteService</a>',
        maxZoom: 18
      }).addTo(map);

      mapInstanceRef.current = map;

    } catch (error) {
      console.error('Error initializing map:', error);
      setError('שגיאה באתחול המפה');
    }
  };

  const updateMapDisplay = () => {
    if (!mapInstanceRef.current || !route.coordinates) return;

    console.log(`🔄 Updating map display for day: ${selectedDay}`);
    setIsLoading(true);
    
    // Clear previous layers
    clearMapLayers();

    try {
      // Filter coordinates based on selected day
      const filteredCoordinates = getFilteredCoordinates();
      
      console.log(`📍 Filtered coordinates: ${filteredCoordinates.length} points`);

      if (filteredCoordinates.length > 0) {
        // Display the route on the map 
        displayDetailedRoute(filteredCoordinates);
        addRouteMarkers(filteredCoordinates);
        addPointsOfInterest();
        
        // Fit map to the coordinates
        fitMapToCoordinates(filteredCoordinates);
      }

    } catch (error) {
      console.error('Error updating map display:', error);
      setError('שגיאה בהצגת המסלול');
    } finally {
      setIsLoading(false);
    }
  };

  const clearMapLayers = () => {
    // Clear all route layers
    routeLayersRef.current.forEach(layer => {
      if (mapInstanceRef.current.hasLayer(layer)) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });
    routeLayersRef.current = [];

    // Clear markers and polylines
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });
  };

  const getFilteredCoordinates = () => {
    if (selectedDay === 'all') {
      return route.coordinates;
    }
    return route.coordinates.filter(coord => coord.day === parseInt(selectedDay));
  };

  // Display the detailed route on the map
  const displayDetailedRoute = (coordinates) => {
    if (coordinates.length < 2) return;

    console.log(`🎨 Drawing detailed route with ${coordinates.length} coordinates`);

    // 
    const latLngs = coordinates.map(coord => [coord.lat, coord.lng]);
    
    const routeColor = tripType === 'cycling' ? '#007bff' : '#28a745';
    
    // Create polyline options
    const polylineOptions = {
      color: routeColor,
      weight: 4,
      opacity: 0.8,
      smoothFactor: 1.0,
      lineJoin: 'round',
      lineCap: 'round'
    };

    const polyline = L.polyline(latLngs, polylineOptions);
    
    polyline.addTo(mapInstanceRef.current);
    routeLayersRef.current.push(polyline);

    const routeInfo = getRouteInfo(coordinates);
    polyline.bindPopup(routeInfo);

    console.log(' Detailed route drawn successfully');
  };

  const addRouteMarkers = (coordinates) => {
    if (coordinates.length === 0) return;

    console.log(` Adding markers for ${coordinates.length} coordinates`);

    // אייקונים מותאמים
    const startIcon = createCustomIcon('#28a745', 'S', 'start-marker');
    const endIcon = createCustomIcon('#dc3545', 'E', 'end-marker');

    // נקודת התחלה
    const startCoord = coordinates[0];
    const startMarker = L.marker([startCoord.lat, startCoord.lng], { icon: startIcon })
      .bindPopup(createMarkerPopup('נקודת התחלה', startCoord, 'start'))
      .addTo(mapInstanceRef.current);
    
    routeLayersRef.current.push(startMarker);

    // if the last coordinate is not the same as the first, add an end marker
    const endCoord = coordinates[coordinates.length - 1];
    if (endCoord.lat !== startCoord.lat || endCoord.lng !== startCoord.lng) {
      const endMarker = L.marker([endCoord.lat, endCoord.lng], { icon: endIcon })
        .bindPopup(createMarkerPopup('נקודת סיום', endCoord, 'end'))
        .addTo(mapInstanceRef.current);
      
      routeLayersRef.current.push(endMarker);
    }

    // Add waypoints at regular intervals
    const waypointInterval = Math.max(Math.floor(coordinates.length / 5), 10);
    const waypointIcon = createCustomIcon('#ffc107', '•', 'waypoint-marker');

    for (let i = waypointInterval; i < coordinates.length - 1; i += waypointInterval) {
      const coord = coordinates[i];
      const waypointMarker = L.marker([coord.lat, coord.lng], { icon: waypointIcon })
        .bindPopup(createMarkerPopup(`נקודה ${Math.floor(i / waypointInterval)}`, coord, 'waypoint'))
        .addTo(mapInstanceRef.current);
      
      routeLayersRef.current.push(waypointMarker);
    }

    console.log(` Added ${routeLayersRef.current.length} markers`);
  };

  const createCustomIcon = (color, text, className) => {
    return L.divIcon({
      html: `<div style="
        background-color: ${color}; 
        color: white; 
        border-radius: 50%; 
        width: 30px; 
        height: 30px; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        font-weight: bold; 
        font-size: 14px;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">${text}</div>`,
      className: className,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  // Create a popup for markers
  const createMarkerPopup = (title, coord, type) => {
    return `
      <div style="direction: rtl; text-align: right; min-width: 150px;">
        <h6 style="margin: 0 0 8px 0; color: #333;">${title}</h6>
        <p style="margin: 0 0 4px 0; font-size: 14px;">יום ${coord.day}</p>
        <small style="color: #666;">
          קואורדינטות: ${coord.lat.toFixed(4)}, ${coord.lng.toFixed(4)}
        </small>
      </div>
    `;
  };

  // Add points of interest to the map
  // This function assumes route.pointsOfInterest is an array of POI objects
  const addPointsOfInterest = () => {
    if (!route.pointsOfInterest) return;

    const poisToShow = selectedDay === 'all' 
      ? route.pointsOfInterest 
      : route.pointsOfInterest.filter(poi => poi.day === parseInt(selectedDay));

    console.log(` Adding ${poisToShow.length} points of interest`);

    const poiIcon = createCustomIcon('#17a2b8', 'POI', 'poi-marker');

    poisToShow.forEach(poi => {
      const poiMarker = L.marker([poi.coordinates.lat, poi.coordinates.lng], { icon: poiIcon })
        .bindPopup(`
          <div style="direction: rtl; text-align: right; min-width: 200px;">
            <h6 style="margin: 0 0 8px 0; color: #17a2b8;">${poi.name}</h6>
            <p style="margin: 0 0 8px 0; font-size: 14px;">${poi.description || ''}</p>
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666;">
              <span>סוג: ${poi.type}</span>
              <span>יום: ${poi.day}</span>
            </div>
          </div>
        `)
        .addTo(mapInstanceRef.current);
      
      routeLayersRef.current.push(poiMarker);
    });
  };

  const fitMapToCoordinates = (coordinates) => {
    if (coordinates.length === 0) return;

    const group = new L.featureGroup(
      coordinates.map(coord => L.marker([coord.lat, coord.lng]))
    );

    mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
  };

  const getRouteInfo = (coordinates) => {
    const dayInfo = route.dailyRoutes?.find(day => day.day === parseInt(selectedDay));
    
    return `
      <div style="direction: rtl; text-align: right; min-width: 250px;">
        <h6 style="margin: 0 0 10px 0; color: #333;">מידע על המסלול</h6>
        <div style="display: grid; gap: 6px; font-size: 14px;">
          <div><strong>סוג:</strong> ${tripType === 'cycling' ? 'רכיבה' : 'הליכה'}</div>
          <div><strong>נקודות במסלול:</strong> ${coordinates.length}</div>
          ${dayInfo ? `
            <div><strong>מרחק:</strong> ${dayInfo.distance} ק"מ</div>
            <div><strong>זמן משוער:</strong> ${dayInfo.estimatedDuration.toFixed(1)} שעות</div>
            <div><strong>רמת קושי:</strong> ${
              dayInfo.difficulty === 'easy' ? 'קל' : 
              dayInfo.difficulty === 'moderate' ? 'בינוני' : 'קשה'
            }</div>
          ` : ''}
        </div>
        <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
          מסלול נוצר באמצעות OpenRouteService
        </div>
      </div>
    `;
  };

  const calculateMapCenter = (coordinates) => {
    const lats = coordinates.map(c => c.lat);
    const lngs = coordinates.map(c => c.lng);
    
    return {
      lat: (Math.min(...lats) + Math.max(...lats)) / 2,
      lng: (Math.min(...lngs) + Math.max(...lngs)) / 2
    };
  };

  const getDayOptions = () => {
    if (!route || !route.totalDays) return [];
    
    const options = [{ value: 'all', label: 'כל הימים' }];
    for (let i = 1; i <= route.totalDays; i++) {
      options.push({ value: i, label: `יום ${i}` });
    }
    return options;
  };

  if (error) {
    return (
      <div className="alert alert-warning d-flex align-items-center" style={{ height }}>
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  if (!route || !route.coordinates || route.coordinates.length === 0) {
    return (
      <div className="alert alert-info d-flex align-items-center" style={{ height }}>
        <i className="fas fa-info-circle me-2"></i>
        אין נתוני מסלול להצגה
      </div>
    );
  }

  return (
    <div className="route-map-container">
      {showControls && route && route.totalDays > 1 && (
        <div className="mb-3 p-3 bg-light rounded">
          <div className="row align-items-center">
            <div className="col-auto">
              <label className="form-label mb-0 fw-bold">בחר יום להצגה:</label>
            </div>
            <div className="col-auto">
              <select 
                className="form-select form-select-sm"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                disabled={isLoading}
              >
                {getDayOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-auto">
              <small className="text-muted">
                <i className={`fas ${tripType === 'cycling' ? 'fa-bicycle' : 'fa-hiking'} me-1`}></i>
                {tripType === 'cycling' ? 'מסלול רכיבה' : 'מסלול הליכה'}
              </small>
            </div>
            {route.pointsOfInterest && (
              <div className="col-auto">
                <small className="text-info">
                  <i className="fas fa-map-marker-alt me-1"></i>
                  {route.pointsOfInterest.length} נקודות עניין
                </small>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="position-relative">
        <div 
          ref={mapRef} 
          style={{ 
            height, 
            width: '100%',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}
        />
        
        {isLoading && (
          <div className="position-absolute top-50 start-50 translate-middle bg-white p-3 rounded shadow">
            <div className="text-center">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">מעדכן מפה...</span>
              </div>
              <div className="mt-2">
                <small className="text-muted">מציייר מסלול...</small>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {route && (
        <div className="mt-3 p-3 bg-light rounded">
          <div className="row text-center">
            <div className="col-3">
              <small className="text-muted d-block">מרחק כולל</small>
              <div className="fw-bold text-primary">{route.totalDistance} ק"מ</div>
            </div>
            <div className="col-3">
              <small className="text-muted d-block">ימי טיול</small>
              <div className="fw-bold text-success">{route.totalDays}</div>
            </div>
            <div className="col-3">
              <small className="text-muted d-block">ממוצע יומי</small>
              <div className="fw-bold text-warning">
                {Math.round((route.totalDistance / route.totalDays) * 10) / 10} ק"מ
              </div>
            </div>
            <div className="col-3">
              <small className="text-muted d-block">נקודות במסלול</small>
              <div className="fw-bold text-info">{route.coordinates.length}</div>
            </div>
          </div>
          
          <div className="text-center mt-2">
            <small className="text-muted">
              <i className="fas fa-route me-1"></i>
              מסלול נוצר באמצעות OpenRouteService - ניתוב אמיתי על כבישים ושבילים
            </small>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteMap;