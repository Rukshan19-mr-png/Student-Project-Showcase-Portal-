import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { user, isAuthenticated } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <Link to="/" className="site-footer-logo" aria-label="Showcase home">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
              <rect width="40" height="40" rx="10" fill="url(#footerGrad)" />
              <path d="M20 8L31 14v12l-11 6L9 26V14L20 8z" stroke="white" strokeWidth="2" fill="none" />
              <circle cx="20" cy="20" r="4" fill="white" />
              <defs>
                <linearGradient id="footerGrad" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <span>Showcase</span>
          </Link>
          <p>Student Project Portal</p>
        </div>

        <nav className="site-footer-links" aria-label="Footer navigation">
          <Link to="/">Home</Link>
          <Link to="/projects">Projects</Link>
          {isAuthenticated && user?.role === 'STUDENT' && <Link to="/my-projects">My Projects</Link>}
          {isAuthenticated && user?.role === 'ADMIN' && <Link to="/admin">Admin</Link>}
        </nav>

        <p className="site-footer-copy">&copy; {year} Showcase. All rights reserved.</p>
      </div>
    </footer>
  );
}
