import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleRoute — protects routes that require a specific role.
 *
 * Props:
 *   allowedRoles: string[]  — e.g. ['ADMIN'] or ['ADMIN', 'RECRUITER']
 *   redirectTo: string      — where to redirect unauthorized users (default: '/')
 *
 * Behaviour:
 * - While loading: show a full-screen spinner (prevents flash redirects)
 * - If not authenticated: redirect to /login
 * - If authenticated but wrong role: redirect to `redirectTo`
 * - If authenticated and role matches: render <Outlet />
 *
 * Usage in App.jsx:
 *   <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
 *     <Route path="/admin" element={<AdminPage />} />
 *   </Route>
 *
 * Roles defined by backend: 'STUDENT' | 'RECRUITER' | 'ADMIN'
 */
export default function RoleRoute({ allowedRoles = [], redirectTo = '/' }) {
  const { isAuthenticated, isLoading, user } = useAuth();

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

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
