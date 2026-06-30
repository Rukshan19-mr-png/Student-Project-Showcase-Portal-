import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

/**
 * AuthCallbackPage — route: /auth/callback
 *
 * This page handles edge-cases after the Google OAuth flow:
 *
 * 1. ERROR CASE: Backend redirected here with ?error=auth_failed
 *    → Show the error and redirect to /login
 *
 * 2. SUCCESS CASE: Backend redirected to FRONTEND_URL/ after setting cookie.
 *    If someone lands here without an error, attempt to fetch /auth/me,
 *    set the user, and navigate to /.
 *
 * NOTE: The primary auth callback is handled on the home route by AuthProvider
 * calling /auth/me on mount. This page handles explicit error redirects from
 * the backend (failureRedirect: '/login') and serves as a loading indicator.
 */
export default function AuthCallbackPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const errorParam = searchParams.get('error');
  const hasRun = useRef(false); // prevent double-run in StrictMode

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (errorParam) {
      // Backend returned an error — redirect to login with the error param
      navigate(`/login?error=${errorParam}`, { replace: true });
      return;
    }

    // No error — try to fetch current user (cookie should be set by now)
    const handleCallback = async () => {
      try {
        const { data } = await api.get('/auth/me');
        login(data.user);
        navigate('/', { replace: true });
      } catch {
        navigate('/login?error=auth_failed', { replace: true });
      }
    };

    handleCallback();
  }, [errorParam, login, navigate]);

  return (
    <div className="auth-loading">
      <div className="auth-loading-inner">
        <div className="spinner" />
        <p>Completing sign-in…</p>
      </div>
    </div>
  );
}
