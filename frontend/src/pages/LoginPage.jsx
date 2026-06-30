import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import { 
  Terminal, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  Info,
  User, 
  Mail, 
  Lock, 
  GraduationCap, 
  Briefcase,
  ExternalLink
} from 'lucide-react';

export default function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const errorParam = searchParams.get('error');

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('STUDENT'); // STUDENT or RECRUITER
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleAuthEnabled, setGoogleAuthEnabled] = useState(null); // null = loading

  // If already logged in, redirect to home
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Sync url errors
  useEffect(() => {
    if (errorParam) {
      if (errorParam === 'auth_failed') {
        setError('Google sign-in failed. Please try again or use email/password.');
      } else if (errorParam === 'session_expired') {
        setError('Your session has expired. Please sign in again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  }, [errorParam]);

  // Check if Google OAuth is configured on the backend
  useEffect(() => {
    api.get('/auth/status')
      .then(({ data }) => setGoogleAuthEnabled(data.googleAuthEnabled))
      .catch(() => setGoogleAuthEnabled(false));
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        // Signup Flow
        const { data } = await api.post('/auth/signup', {
          name: name.trim(),
          email: email.trim(),
          password,
          role
        });
        login(data.user);
        navigate('/', { replace: true });
      } else {
        // Signin Flow
        const { data } = await api.post('/auth/login', {
          email: email.trim(),
          password
        });
        login(data.user);
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error ?? 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-bg-orb login-bg-orb--1" />
      <div className="login-bg-orb login-bg-orb--2" />
      <div className="login-bg-orb login-bg-orb--3" />

      <div className="login-card">
        {/* Logo / brand */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <Terminal size={24} color="white" strokeWidth={2.5} />
          </div>
          <div className="login-logo-text">
            <h1>Showcase</h1>
            <span>Student Project Portal</span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${!isRegistering ? 'auth-tab--active' : ''}`}
            onClick={() => { setIsRegistering(false); setError(''); }}
          >
            <LogIn size={15} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            className={`auth-tab ${isRegistering ? 'auth-tab--active' : ''}`}
            onClick={() => { setIsRegistering(true); setError(''); }}
          >
            <UserPlus size={15} />
            <span>Sign Up</span>
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="login-error animate-fade-in" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="auth-name">
                <User size={14} />
                <span>Full Name</span>
              </label>
              <input
                id="auth-name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">
              <Mail size={14} />
              <span>Email Address</span>
            </label>
            <input
              id="auth-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">
              <Lock size={14} />
              <span>Password</span>
            </label>
            <input
              id="auth-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isRegistering && (
            <div className="form-group">
              <label>Join As</label>
              <div className="role-cards">
                <div
                  className={`role-card ${role === 'STUDENT' ? 'role-card--active' : ''}`}
                  onClick={() => setRole('STUDENT')}
                >
                  <GraduationCap size={20} className="role-card-icon" />
                  <div className="role-card-content">
                    <span className="role-card-title">Student</span>
                    <span className="role-card-desc">Showcase your own innovation</span>
                  </div>
                </div>
                <div
                  className={`role-card ${role === 'RECRUITER' ? 'role-card--active' : ''}`}
                  onClick={() => setRole('RECRUITER')}
                >
                  <Briefcase size={20} className="role-card-icon" />
                  <div className="role-card-content">
                    <span className="role-card-title">Recruiter</span>
                    <span className="role-card-desc">Discover outstanding talent</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn--primary login-submit-btn" disabled={loading}>
            {loading ? <div className="spinner spinner--sm" /> : isRegistering ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="login-divider">
          <span>or continue with</span>
        </div>

        {/* Google OAuth — conditionally rendered based on backend config */}
        {googleAuthEnabled === null ? (
          <div style={{ height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner spinner--sm" />
          </div>
        ) : googleAuthEnabled ? (
          <button
            id="google-login-btn"
            className="login-google-btn"
            onClick={handleGoogleLogin}
            type="button"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        ) : (
          <div className="google-not-configured">
            <Info size={15} color="#f59e0b" />
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '13px', color: '#f59e0b' }}>Google Sign-In not configured</p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--clr-text-muted)' }}>
                Add your real credentials to <code>backend/.env</code> to enable this.{' '}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--clr-primary-light)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                >
                  Google Cloud Console <ExternalLink size={11} />
                </a>
              </p>
            </div>
          </div>
        )}

        <p className="login-footer">
          By signing in, you agree to our{' '}
          <Link to="/terms">Terms of Service</Link> and{' '}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
