import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowUp, Globe, Mail, MapPin, Shield, FileText } from 'lucide-react';

export default function Footer() {
  const { user, isAuthenticated } = useAuth();
  const year = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        {/* Column 1: Brand & About */}
        <div className="site-footer-column site-footer-brand">
          <Link to="/" className="site-footer-logo" aria-label="Showcase home">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
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
          <p className="site-footer-desc">
            Empowering student innovators to showcase their projects, connect with industry recruiters, and track their performance in real-time.
          </p>
        </div>

        {/* Column 2: Explore Links */}
        <div className="site-footer-column">
          <h4>Explore</h4>
          <nav className="site-footer-nav">
            <Link to="/">Home Dashboard</Link>
            <Link to="/projects">Browse Showcase</Link>
            {isAuthenticated && user?.role === 'STUDENT' && <Link to="/my-projects">My Submissions</Link>}
            {isAuthenticated && user?.role === 'RECRUITER' && <Link to="/following">Talent Pipeline</Link>}
            {isAuthenticated && user?.role === 'ADMIN' && <Link to="/admin">Admin Console</Link>}
          </nav>
        </div>

        {/* Column 3: Legal & Resources */}
        <div className="site-footer-column">
          <h4>Resources</h4>
          <nav className="site-footer-nav">
            <Link to="/terms" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={12} />
              <span>Terms of Service</span>
            </Link>
            <Link to="/privacy" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={12} />
              <span>Privacy Policy</span>
            </Link>
            <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={12} />
              <span>Google Cloud Console</span>
            </a>
          </nav>
        </div>

        {/* Column 4: Contact & Socials (Filling the right side) */}
        <div className="site-footer-column site-footer-right">
          <h4>Connect & Support</h4>
          <div className="site-footer-contact">
            <div className="contact-item">
              <Mail size={12} />
              <a href="mailto:support@showcase.edu">support@showcase.edu</a>
            </div>
            <div className="contact-item">
              <MapPin size={12} />
              <span>University Innovation Hub, Building A</span>
            </div>
          </div>
          
          {/* Social Icons using inline SVGs to prevent Lucide version errors */}
          <div className="site-footer-socials" style={{ marginTop: 'var(--space-2)' }}>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-link social-link--github" aria-label="GitHub">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link social-link--linkedin" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link social-link--twitter" aria-label="Twitter">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
            </a>
            <a href="https://google.com" target="_blank" rel="noopener noreferrer" className="social-link social-link--website" aria-label="Website">
              <Globe size={16} />
            </a>
          </div>

          <button onClick={scrollToTop} className="back-to-top-btn" style={{ marginTop: 'var(--space-3)' }}>
            <span>Back to Top</span>
            <ArrowUp size={12} className="back-to-top-icon" />
          </button>
        </div>

        {/* Full Width Bottom Copy */}
        <p className="site-footer-copy">
          &copy; {year} Showcase Portal. Designed for student innovators. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
