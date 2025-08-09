import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Layout/Navbar';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Auth Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Pages
import Dashboard from './pages/Dashboard';
import PlanTrip from './pages/PlanTrip';
import TripHistory from './pages/TripHistory';

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Home Component
const Home = () => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="text-center mb-5">
            <h1 className="display-4 text-primary mb-4">
              <i className="fas fa-map-marked-alt me-3"></i>
              Trip Planner
            </h1>
            <p className="lead text-muted mb-4">
              תכנן את הטיול המושלם שלך עם מפות אינטראקטיביות, תחזית מזג אוויר ומסלולים מותאמים אישית
            </p>
          </div>

          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm hover-shadow">
                <div className="card-body text-center p-4">
                  <i className="fas fa-route fa-3x text-primary mb-3"></i>
                  <h5>מסלולים מותאמים</h5>
                  <p className="text-muted">
                    צור מסלולי טיול מותאמים לטרקים ורכיבה על אופניים
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm hover-shadow">
                <div className="card-body text-center p-4">
                  <i className="fas fa-cloud-sun fa-3x text-warning mb-3"></i>
                  <h5>תחזית מזג אוויר</h5>
                  <p className="text-muted">
                    קבל תחזית מדויקת ל-3 ימים קדימה עבור המסלול שלך
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm hover-shadow">
                <div className="card-body text-center p-4">
                  <i className="fas fa-map fa-3x text-success mb-3"></i>
                  <h5>מפות אינטראקטיביות</h5>
                  <p className="text-muted">
                    צפה במסלולים על מפות מפורטות עם פרטי מרחק וזמן
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link to="/register" className="btn btn-primary btn-lg me-3">
              <i className="fas fa-user-plus me-2"></i>
              הירשם עכשיו
            </Link>
            <Link to="/login" className="btn btn-outline-primary btn-lg">
              <i className="fas fa-sign-in-alt me-2"></i>
              התחבר
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder Components
const Profile = () => (
  <div className="container mt-4">
    <h2>פרופיל</h2>
    <p>בקרוב - ניהול פרטים אישיים!</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/plan-trip" 
                element={
                  <ProtectedRoute>
                    <PlanTrip />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/trip-history" 
                element={
                  <ProtectedRoute>
                    <TripHistory />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />

              {/* 404 Route */}
              <Route 
                path="*" 
                element={
                  <div className="container mt-5 text-center">
                    <h1>404 - דף לא נמצא</h1>
                    <a href="/" className="btn btn-primary">חזור לבית</a>
                  </div>
                } 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;