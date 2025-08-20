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
import TripView from './pages/TripView';
import Weather from './pages/Weather';

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// New Modern Home Component
const Home = () => {
  return (
    <>
      <style jsx>{`
        .hero-section {
          min-height: 100vh;
          background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), 
                      url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80') center/cover;
          position: relative;
          overflow: hidden;
        }
        
        .hero-content {
          position: relative;
          z-index: 2;
        }
        
        .hero-title {
          background: #ffffff;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: fadeInUp 1s ease-out;
          text-shadow: 2px 2px 4px rgba(15, 14, 14, 0.3);
        }
        
        .hero-subtitle {
          animation: fadeInUp 1s ease-out 0.3s both;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        }
        
        .journey-container {
          animation: fadeInUp 1s ease-out 0.6s both;
        }
        
        .journey-step {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;
        }
        
        .journey-step::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2);
        }
        
        .step-number {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.5rem;
          margin: 0 auto 20px;
          position: relative;
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }
        
        .step-icon {
          font-size: 2rem;
          margin-bottom: 15px;
        }
        
        .step-1 .step-icon { color: #e74c3c; }
        .step-2 .step-icon { color: #3498db; }
        .step-3 .step-icon { color: #f39c12; }
        .step-4 .step-icon { color: #27ae60; }
        
        .journey-line {
          position: relative;
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          margin: 20px 0;
          border-radius: 2px;
          overflow: hidden;
        }
        
        .journey-line::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
          animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        .journey-arrow {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto;
          animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(-50%) translateX(0); }
          40% { transform: translateY(-50%) translateX(-10px); }
          60% { transform: translateY(-50%) translateX(-5px); }
        }
        
        .step-title {
          color: #2c3e50;
          font-weight: 700;
          margin-bottom: 10px;
        }
        
        .step-description {
          color: #5a6c7d;
          line-height: 1.6;
        }
        
        .cta-section {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: fadeInUp 1s ease-out 1.2s both;
        }
        
        .cta-button {
          background: linear-gradient(45deg, #ff6b6b, #ee5a24);
          border: none;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          color: white;
          text-decoration: none;
        }
        
        .cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }
        
        .cta-button:hover::before {
          left: 100%;
        }
        
        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(255, 107, 107, 0.4);
          color: white;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .floating-elements {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .floating-icon {
          position: absolute;
          color: rgba(255, 255, 255, 0.1);
          animation: float 6s ease-in-out infinite;
        }
        
        .floating-icon:nth-child(1) {
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }
        
        .floating-icon:nth-child(2) {
          top: 60%;
          right: 15%;
          animation-delay: 2s;
        }
        
        .floating-icon:nth-child(3) {
          bottom: 30%;
          left: 20%;
          animation-delay: 4s;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @media (max-width: 768px) {
          .journey-arrow {
            display: none;
          }
          
          .journey-line {
            transform: rotate(90deg);
            width: 60px;
            margin: 30px auto;
          }
        }
      `}</style>

      <div className="hero-section d-flex align-items-center">
        {/* Floating components */}
        <div className="floating-elements">
          <i className="fas fa-mountain floating-icon fa-3x"></i>
          <i className="fas fa-compass floating-icon fa-2x"></i>
          <i className="fas fa-camera floating-icon fa-2x"></i>
        </div>

        <div className="container hero-content">
          <div className="row justify-content-center text-center">
            <div className="col-lg-10">
              {/* Main Title*/}
              <div className="mb-5">
                <h1 className="hero-title display-3 fw-bold mb-4">
                  <i className="fas fa-map-marked-alt me-3"></i>
                  Trip Planner
                </h1>
              </div>

              {/* Stesp for creating a trip container*/}
              <div className="journey-container">
                <h2 className="text-white text-center mb-5">
                  <i className="fas fa-route me-2"></i>
                  המסלול שלך לטיול מושלם
                </h2>

                {/* 4 steps ro using the website */}
                <div className="row g-4 align-items-center justify-content-center">
                  {/* Step 1 */}
                  <div className="col-lg-2 col-md-6">
                    <div className="journey-step p-4 rounded-4 text-center h-100 step-1">
                      <div className="step-number">1</div>
                      <i className="fas fa-user-circle step-icon"></i>
                      <h5 className="step-title">התחבר</h5>
                      <p className="step-description small">
                        הירשם או התחבר כדי לשמור את המסלולים שלך
                      </p>
                    </div>
                  </div>

                  {/* Arrow 1 */}
                  <div className="col-lg-1 d-none d-lg-block text-center">
                    <div className="journey-arrow">
                      <i className="fas fa-arrow-right"></i>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="col-lg-2 col-md-6">
                    <div className="journey-step p-4 rounded-4 text-center h-100 step-2">
                      <div className="step-number">2</div>
                      <i className="fas fa-map step-icon"></i>
                      <h5 className="step-title">תכנן מסלול</h5>
                      <p className="step-description small">
                        בחר יעד, סוג טיול ומספר ימים וקבל מסלול מותאם
                      </p>
                    </div>
                  </div>

                  {/* Arrow 2 */}
                  <div className="col-lg-1 d-none d-lg-block text-center">
                    <div className="journey-arrow">
                      <i className="fas fa-arrow-right"></i>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="col-lg-2 col-md-6">
                    <div className="journey-step p-4 rounded-4 text-center h-100 step-3">
                      <div className="step-number">3</div>
                      <i className="fas fa-cloud-sun step-icon"></i>
                      <h5 className="step-title">מזג אוויר</h5>
                      <p className="step-description small">
                        קבל תחזית מפורטת ל-3 ימים ושבוע קדימה
                      </p>
                    </div>
                  </div>

                  {/* Arrow 3 */}
                  <div className="col-lg-1 d-none d-lg-block text-center">
                    <div className="journey-arrow">
                      <i className="fas fa-arrow-right"></i>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="col-lg-2 col-md-6">
                    <div className="journey-step p-4 rounded-4 text-center h-100 step-4">
                      <div className="step-number">4</div>
                      <i className="fas fa-list-alt step-icon"></i>
                      <h5 className="step-title">צפה בטיולים</h5>
                      <p className="step-description small">
                        נהל את כל הטיולים שתכננת במקום אחד ונוח
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Begin section for login or registration */}
              <div className="cta-section p-5 rounded-4 mt-5">
                <h3 className="text-white mb-3">?מוכן להתחיל</h3>
                <p className="text-white-50 mb-4">
                  הצטרף אלינו ותתחיל לתכנן את הטיול הבא שלך 
                </p>
                <Link 
                  to="/register" 
                  className="btn cta-button btn-lg px-5 py-3 rounded-pill fw-bold"
                >
                  <i className="fas fa-rocket me-2"></i>
                  !בואו נתחיל
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

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
                path="/trip/:id" 
                element={
                  <ProtectedRoute>
                    <TripView />
                  </ProtectedRoute>
                } 
              />
            
              <Route 
                path="/weather" 
                element={
                  <ProtectedRoute>
                    <Weather />
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