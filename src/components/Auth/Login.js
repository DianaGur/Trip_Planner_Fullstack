import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading, error, isAuthenticated, clearErrors } = useAuth();
  const navigate = useNavigate();

  // אם המשתמש כבר מחובר, הפנה לדף הבית
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // ניקוי שגיאות בעת טעינת הרכיב
  useEffect(() => {
    clearErrors();
  }, [clearErrors]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow">
            <div className="card-header bg-primary text-white text-center position-relative">
              <h3 className="mb-0">
                <i className="fas fa-sign-in-alt me-2"></i>
                התחברות
              </h3>
              <button
                type="button"
                className="btn-close btn-close-white position-absolute"
                style={{ top: '15px', right: '15px' }}
                onClick={() => navigate(-1)}
                title="סגור"
              ></button>
            </div>
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    <i className="fas fa-envelope me-2"></i>
                    כתובת אימייל
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="הכנס את כתובת האימייל שלך"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    <i className="fas fa-lock me-2"></i>
                    סיסמה
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="הכנס את הסיסמה שלך"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading || !formData.email || !formData.password}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        מתחבר...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        התחבר
                      </>
                    )}
                  </button>
                </div>
              </form>

              <hr className="my-4" />

              <div className="text-center">
                <p className="mb-0">
                  אין לך חשבון?{' '}
                  <Link to="/register" className="text-decoration-none">
                    <i className="fas fa-user-plus me-1"></i>
                    הירשם כאן
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Demo credentials */}
          <div className="card mt-3 bg-light">
            <div className="card-body text-center py-2">
              <small className="text-muted">
                <i className="fas fa-info-circle me-1"></i>
                לבדיקה: השתמש בכל אימייל וסיסמה (יצור חשבון אוטומטית בהרשמה)
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;