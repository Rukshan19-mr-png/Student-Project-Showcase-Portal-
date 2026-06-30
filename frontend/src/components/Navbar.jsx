import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN': return 'role-badge role-badge--admin';
      case 'RECRUITER': return 'role-badge role-badge--recruiter';
      default: return 'role-badge role-badge--student';
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" id="navbar-brand-link">
          <div className="navbar-logo">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
              <rect width="40" height="40" rx="10" fill="url(#navGrad)" />
              <path d="M20 8L31 14v12l-11 6L9 26V14L20 8z" stroke="white" strokeWidth="2" fill="none" />
              <circle cx="20" cy="20" r="4" fill="white" />
              <defs>
                <linearGradient id="navGrad" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="navbar-brand-name">Showcase</span>
        </Link>

        <nav className="navbar-links">
          {isAuthenticated && (
            <>
              <Link to="/" className="navbar-link" id="navbar-home-link">Home</Link>
              <Link to="/projects" className="navbar-link" id="navbar-projects-link">Projects</Link>
              {user?.role === 'STUDENT' && (
                <Link to="/my-projects" className="navbar-link" id="navbar-my-projects-link">My Projects</Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="navbar-link" id="navbar-admin-link">Admin</Link>
              )}
            </>
          )}
        </nav>

        <div className="navbar-auth">
          {isAuthenticated ? (
            <div className="navbar-auth-group">
              <NotificationBell />
              <div className="navbar-user" ref={dropdownRef}>
                <button
                  id="navbar-user-menu-btn"
                  className="navbar-user-btn"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="navbar-avatar" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="navbar-avatar navbar-avatar--fallback">
                      {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                    </div>
                  )}
                  <div className="navbar-user-info">
                    <span className="navbar-user-name">{user?.name}</span>
                    <span className={getRoleBadgeClass(user?.role)}>{user?.role ?? 'USER'}</span>
                  </div>
                  <svg
                    className={`navbar-chevron${dropdownOpen ? ' navbar-chevron--open' : ''}`}
                    viewBox="0 0 20 20" fill="currentColor" width="16" height="16"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="navbar-dropdown" role="menu">
                    <div className="navbar-dropdown-header">
                      <p className="navbar-dropdown-name">{user?.name}</p>
                      <p className="navbar-dropdown-email">{user?.email}</p>
                    </div>
                    <div className="navbar-dropdown-divider" />
                    <button
                      id="navbar-logout-btn"
                      className="navbar-dropdown-item navbar-dropdown-item--danger"
                      onClick={handleLogout}
                      role="menuitem"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link to="/login" className="navbar-login-btn" id="navbar-login-link">Sign In</Link>
          )}
        </div>
      </div>
    </header>
  );
}
