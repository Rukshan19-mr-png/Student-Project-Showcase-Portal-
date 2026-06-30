import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PrivateRoute — protects routes that require authentication.
 *
 * Behaviour:
 * - While loading (initial /auth/me check): show a full-screen spinner
 * - If not authenticated: redirect to /login
 * - If authenticated: render the nested routes via <Outlet />
 *
 * Usage in App.jsx:
 *   <Route element={<PrivateRoute />}>
 *     <Route path="/" element={<HomePage />} />
 *   </Route>
 */
export default function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
