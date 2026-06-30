import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import RoleRoute from './routes/RoleRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import HomePage from './pages/HomePage';
import ProjectListPage from './pages/ProjectListPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import MyProjectsPage from './pages/MyProjectsPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="main-content">{children}</main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Public App Routes */}
          <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
          <Route path="/projects" element={<AppLayout><ProjectListPage /></AppLayout>} />
          <Route path="/projects/:id" element={<AppLayout><ProjectDetailPage /></AppLayout>} />

          {/* Protected */}
          <Route element={<PrivateRoute />}>
            <Route path="/notifications" element={<AppLayout><NotificationsPage /></AppLayout>} />
          </Route>

          {/* Student only */}
          <Route element={<RoleRoute allowedRoles={['STUDENT']} redirectTo="/" />}>
            <Route path="/my-projects" element={<AppLayout><MyProjectsPage /></AppLayout>} />
          </Route>

          {/* Admin only */}
          <Route element={<RoleRoute allowedRoles={['ADMIN']} redirectTo="/" />}>
            <Route path="/admin" element={<AppLayout><AdminPage /></AppLayout>} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
