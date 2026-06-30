import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../hooks/useProjects';
import ProjectCard from '../components/ProjectCard';

export default function HomePage() {
  const { user } = useAuth();
  const { data, isLoading } = useProjects(1, 3);
  const projects = data?.projects ?? [];

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMIN': return 'Administrator';
      case 'RECRUITER': return 'Recruiter';
      default: return 'Student';
    }
  };

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-bg-orb home-hero-bg-orb--1" />
        <div className="home-hero-bg-orb home-hero-bg-orb--2" />

        <div className="home-hero-content">
          <div className="home-welcome-chip">
            <span className="home-welcome-chip-dot" />
            {user ? `Welcome back, ${getRoleLabel(user.role)}` : 'Welcome to Showcase'}
          </div>

          <h1 className="home-hero-title">
            {user ? (
              <>Hello, <span className="home-hero-name">{user.name.split(' ')[0]}</span> 👋</>
            ) : (
              <>Discover Student <span className="home-hero-name">Innovation</span> 🚀</>
            )}
          </h1>

          <p className="home-hero-subtitle">
            {user
              ? user.role === 'RECRUITER'
                ? 'Explore innovative student projects and discover your next hire.'
                : user.role === 'ADMIN'
                ? 'Manage the platform, users, and all project submissions.'
                : 'Share your work with the world. Showcase your projects and get discovered.'
              : 'Explore innovative student projects, or log in to share your own work with the world.'}
          </p>

          <div className="home-hero-actions">
            {!user ? (
              <Link to="/login" className="btn btn--primary" id="login-btn">
                Sign In
              </Link>
            ) : user.role === 'STUDENT' ? (
              <Link to="/my-projects" className="btn btn--primary" id="upload-project-btn">
                <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                My Projects
              </Link>
            ) : null}
            
            <Link to="/projects" className="btn btn--secondary" id="browse-projects-btn">
              <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
              </svg>
              Browse Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Recent projects */}
      <section className="home-section">
        <div className="home-section-header">
          <h2>Recent Projects</h2>
          <Link to="/projects" className="home-section-link">View all →</Link>
        </div>
        {isLoading ? (
          <div className="page-spinner"><div className="spinner" /></div>
        ) : projects.length === 0 ? (
          <p className="empty-state">No projects yet. Be the first to showcase!</p>
        ) : (
          <div className="project-grid project-grid--small">
            {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
