import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // סגירת dropdown בלחיצה מחוץ לו
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    setIsDropdownOpen(false); // סגירת התפריט
    
    try {
      console.log('User clicking logout');
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActivePage = (path) => {
    return location.pathname === path;
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <i className="fas fa-map-marked-alt me-2"></i>
          Trip Planner
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link
                className={`nav-link ${isActivePage('/') ? 'active' : ''}`}
                to="/"
              >
              </Link>
            </li>

            {isAuthenticated && user && (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActivePage('/dashboard') ? 'active' : ''}`}
                    to="/dashboard"
                  >
                    <i className="fas fa-tachometer-alt me-1"></i>
                    דשבורד
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActivePage('/plan-trip') ? 'active' : ''}`}
                    to="/plan-trip"
                  >
                    <i className="fas fa-route me-1"></i>
                    תכנן טיול
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActivePage('/trip-history') ? 'active' : ''}`}
                    to="/trip-history"
                  >
                    <i className="fas fa-history me-1"></i>
                    היסטוריית טיולים
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActivePage('/weather') ? 'active' : ''}`}
                    to="/weather"
                  >
                    <i className="fas fa-cloud-sun me-1"></i>
                    מזג אוויר
                  </Link>
                </li>
              </>
            )}
          </ul>

          <ul className="navbar-nav">
            {loading ? (
              <li className="nav-item">
                <span className="nav-link">
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  טוען...
                </span>
              </li>
            ) : isAuthenticated && user ? (
              <li className="nav-item position-relative" ref={dropdownRef}>
                <button
                  className="nav-link btn border-0 d-flex align-items-center"
                  onClick={toggleDropdown}
                  style={{ 
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    transition: 'background-color 0.2s ease',
                    backgroundColor: isDropdownOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    if (!isDropdownOpen) e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isDropdownOpen) e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <i className="fas fa-user-circle me-2" style={{ fontSize: '18px' }}></i>
                  <span>{user.name}</span>
                  <i 
                    className={`fas fa-chevron-${isDropdownOpen ? 'up' : 'down'} ms-2`} 
                    style={{ 
                      fontSize: '12px',
                      transition: 'transform 0.2s ease'
                    }}
                  ></i>
                </button>

                {/* התפריט הנפתח */}
                {isDropdownOpen && (
                  <div 
                    className="position-absolute bg-white shadow rounded"
                    style={{
                      top: '100%',
                      right: '0',
                      minWidth: '220px',
                      marginTop: '8px',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      zIndex: 1000,
                      animation: 'fadeIn 0.2s ease-in-out'
                    }}
                  >
                    {/* Header עם פרטי המשתמש */}
                    <div style={{ 
                      padding: '16px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px 8px 0 0',
                      borderBottom: '1px solid #dee2e6'
                    }}>
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-user-circle me-2 text-primary" style={{ fontSize: '20px' }}></i>
                        <strong style={{ fontSize: '15px', color: '#333' }}>{user.name}</strong>
                      </div>
                      <div className="d-flex align-items-center">
                        <i className="fas fa-envelope me-2 text-muted" style={{ fontSize: '12px' }}></i>
                        <small className="text-muted" style={{ fontSize: '13px' }}>{user.email}</small>
                      </div>
                    </div>
                    
                    {/* כפתור התנתקות */}
                    <div style={{ padding: '8px' }}>
                      <button
                        className="btn w-100 d-flex align-items-center justify-content-start text-danger"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        style={{
                          padding: '12px 16px',
                          border: 'none',
                          background: 'none',
                          textAlign: 'right',
                          transition: 'background-color 0.2s ease',
                          fontSize: '14px',
                          borderRadius: '6px'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f8d7da'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        {isLoggingOut ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" style={{ width: '16px', height: '16px' }}></span>
                            <span>מתנתק...</span>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-sign-out-alt me-2" style={{ fontSize: '14px' }}></i>
                            <span>התנתק</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* CSS Animation */}
                <style jsx>{`
                  @keyframes fadeIn {
                    from {
                      opacity: 0;
                      transform: translateY(-10px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }
                `}</style>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActivePage('/login') ? 'active' : ''}`}
                    to="/login"
                  >
                    <i className="fas fa-sign-in-alt me-1"></i>
                    התחבר
                  </Link>
                </li>
                
                <li className="nav-item">
                  <Link
                    className={`btn btn-outline-light btn-sm ms-2 ${isActivePage('/register') ? 'active' : ''}`}
                    to="/register"
                  >
                    <i className="fas fa-user-plus me-1"></i>
                    הירשם
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;