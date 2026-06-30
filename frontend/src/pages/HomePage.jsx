import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useMyProjects, useProjects } from '../hooks/useProjects';
import ProjectCard from '../components/ProjectCard';
import api from '../api/axiosInstance';
import { Sparkles, Plus, Compass, LogIn, Award, FolderHeart, Users, CheckCircle, BarChart2 } from 'lucide-react';

function DashboardChart({ data, title, barColor = 'url(#studentGrad)' }) {
  const [hoveredBar, setHoveredBar] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="chart-empty" style={{ padding: '40px', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
        <p>No activity metrics available yet.</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const chartHeight = 140;
  const barWidth = 36;
  const barGap = 24;
  const paddingLeft = 32;
  const paddingBottom = 30;
  const totalWidth = paddingLeft + data.length * (barWidth + barGap);

  return (
    <div className="dashboard-chart-card animate-fade-in" style={{
      background: 'var(--clr-surface-2)',
      border: '1px solid var(--clr-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-6)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-4)', fontWeight: 700 }}>{title}</h3>
      <div className="chart-wrapper" style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${totalWidth} ${chartHeight + paddingBottom}`} className="dashboard-svg" style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* Gradients */}
          <defs>
            <linearGradient id="studentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <linearGradient id="recruiterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
            <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="hoverGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
            <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.1" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = chartHeight - (chartHeight * ratio);
            return (
              <g key={index}>
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={totalWidth} 
                  y2={y} 
                  stroke="rgba(15, 23, 42, 0.06)" 
                  strokeDasharray="4 4"
                />
                <text 
                  x={10} 
                  y={y + 4} 
                  fill="var(--clr-text-subtle)" 
                  fontSize="9px" 
                  textAnchor="start"
                  fontWeight="500"
                >
                  {Math.round(maxValue * ratio)}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((item, i) => {
            const x = paddingLeft + i * (barWidth + barGap) + barGap / 2;
            const barHeight = (item.value / maxValue) * chartHeight;
            const y = chartHeight - barHeight;
            const isHovered = hoveredBar === i;

            return (
              <g 
                key={i} 
                onMouseEnter={() => setHoveredBar(i)} 
                onMouseLeave={() => setHoveredBar(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Bar fill (Capsules) */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={6}
                  fill={isHovered ? 'url(#hoverGrad)' : barColor}
                  opacity={isHovered ? 1 : 0.85}
                  style={{ transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  filter={isHovered ? 'url(#shadowFilter)' : 'none'}
                />

                {/* X Labels */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 18}
                  fill={isHovered ? 'var(--clr-primary)' : 'var(--clr-text-muted)'}
                  fontSize="10px"
                  textAnchor="middle"
                  fontWeight={isHovered ? '700' : '500'}
                  style={{ transition: 'fill 0.2s ease' }}
                >
                  {item.label.substring(0, 8)}{item.label.length > 8 ? '..' : ''}
                </text>

                {/* Tooltip */}
                {isHovered && (
                  <g style={{ pointerEvents: 'none' }}>
                    <rect
                      x={x - 20}
                      y={y - 32}
                      width={barWidth + 40}
                      height={22}
                      rx={6}
                      fill="#0f172a"
                      filter="url(#shadowFilter)"
                    />
                    <text
                      x={x + barWidth / 2}
                      y={y - 18}
                      fill="#ffffff"
                      fontSize="9px"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {item.value} {item.unit || 'likes'}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  
  // Public project list
  const { data: publicData, isLoading: publicLoading } = useProjects(1, 3);
  const recentProjects = publicData?.projects ?? [];

  // Student specific queries
  const { data: studentData, isLoading: studentLoading } = useMyProjects(user?.id);
  const studentProjects = studentData?.projects ?? [];

  // Recruiter specific queries
  const { data: followingList, isLoading: recruiterLoading } = useQuery({
    queryKey: ['following'],
    queryFn: async () => {
      const { data: resData } = await api.get('/users/following');
      return resData.following;
    },
    enabled: user?.role === 'RECRUITER',
  });
  const recruiterFollowing = followingList ?? [];

  // Admin stats
  const { data: adminAllData, isLoading: adminLoading, error: adminError } = useProjects(1, 100);
  const adminAllProjects = adminAllData?.projects ?? [];

  // Debugging log for the browser console
  console.log('[Showcase Debug] Admin Dashboard Query:', {
    adminLoading,
    adminError: adminError?.message || adminError,
    adminAllData,
    projectsFetchedCount: adminAllProjects.length
  });

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMIN': return 'Administrator';
      case 'RECRUITER': return 'Recruiter';
      default: return 'Student';
    }
  };

  const renderDashboard = () => {
    if (user.role === 'STUDENT') {
      if (studentLoading) {
        return (
          <div className="dashboard-grid">
            <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px' }}><div className="spinner" /></div>
            <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px' }}><div className="spinner" /></div>
            <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px' }}><div className="spinner" /></div>
          </div>
        );
      }

      const totalLikes = studentProjects.reduce((acc, curr) => acc + (curr._count?.likes ?? curr.likes?.length ?? 0), 0);
      const chartData = studentProjects.map(p => ({
        label: p.title,
        value: p._count?.likes ?? p.likes?.length ?? 0,
        unit: 'likes'
      }));

      return (
        <div className="student-dashboard animate-fade-in">
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="dashboard-card-glow" />
              <span className="dashboard-card-title">Projects Published</span>
              <span className="dashboard-card-value">{studentProjects.length}</span>
            </div>
            <div className="dashboard-card">
              <div className="dashboard-card-glow" style={{ background: 'radial-gradient(circle, rgba(217, 70, 239, 0.1) 0%, transparent 70%)' }} />
              <span className="dashboard-card-title">Total Project Likes</span>
              <span className="dashboard-card-value">{totalLikes}</span>
            </div>
            <div className="dashboard-card">
              <div className="dashboard-card-glow" style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)' }} />
              <span className="dashboard-card-title">Innovator Status</span>
              <span className="dashboard-card-value" style={{ fontSize: 'var(--text-lg)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={16} color="var(--clr-success)" />
                Active Creator
              </span>
            </div>
          </div>

          <DashboardChart data={chartData} title="Likes Performance Per Project" barColor="url(#studentGrad)" />
        </div>
      );
    }

    if (user.role === 'RECRUITER') {
      if (recruiterLoading) {
        return (
          <div className="dashboard-grid">
            <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px' }}><div className="spinner" /></div>
            <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px' }}><div className="spinner" /></div>
            <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px' }}><div className="spinner" /></div>
          </div>
        );
      }

      const totalFollowedProjects = recruiterFollowing.reduce((acc, curr) => acc + (curr.projectsCount ?? 0), 0);
      const chartData = recruiterFollowing.map(student => ({
        label: student.name,
        value: student.projectsCount ?? 0,
        unit: 'projects'
      }));

      return (
        <div className="recruiter-dashboard animate-fade-in">
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="dashboard-card-glow" />
              <span className="dashboard-card-title">Innovators Followed</span>
              <span className="dashboard-card-value">{recruiterFollowing.length}</span>
            </div>
            <div className="dashboard-card">
              <div className="dashboard-card-glow" style={{ background: 'radial-gradient(circle, rgba(217, 70, 239, 0.1) 0%, transparent 70%)' }} />
              <span className="dashboard-card-title">Tracked Submissions</span>
              <span className="dashboard-card-value">{totalFollowedProjects}</span>
            </div>
            <div className="dashboard-card">
              <div className="dashboard-card-glow" style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)' }} />
              <span className="dashboard-card-title">Pipeline Health</span>
              <span className="dashboard-card-value" style={{ fontSize: 'var(--text-lg)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} color="var(--clr-success)" />
                Connected
              </span>
            </div>
          </div>

          <DashboardChart data={chartData} title="Project Volume Distribution per Creator" barColor="url(#recruiterGrad)" />
        </div>
      );
    }

    if (user.role === 'ADMIN') {
      if (adminLoading) {
        return (
          <div className="dashboard-grid">
            <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px' }}><div className="spinner" /></div>
            <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px' }}><div className="spinner" /></div>
            <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px' }}><div className="spinner" /></div>
          </div>
        );
      }

      const totalLikes = adminAllProjects.reduce((acc, curr) => acc + (curr._count?.likes ?? curr.likes?.length ?? 0), 0);
      const chartData = adminAllProjects.map(p => ({
        label: p.title,
        value: p._count?.likes ?? p.likes?.length ?? 0,
        unit: 'likes'
      })).slice(0, 6);

      return (
        <div className="admin-dashboard animate-fade-in">
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="dashboard-card-glow" />
              <span className="dashboard-card-title">Showcase Size</span>
              <span className="dashboard-card-value">{adminAllData?.pagination?.total ?? adminAllProjects.length}</span>
            </div>
            <div className="dashboard-card">
              <div className="dashboard-card-glow" style={{ background: 'radial-gradient(circle, rgba(217, 70, 239, 0.1) 0%, transparent 70%)' }} />
              <span className="dashboard-card-title">Cumulative Likes</span>
              <span className="dashboard-card-value">{totalLikes}</span>
            </div>
            <div className="dashboard-card">
              <div className="dashboard-card-glow" style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)' }} />
              <span className="dashboard-card-title">Moderation Status</span>
              <span className="dashboard-card-value" style={{ fontSize: 'var(--text-lg)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} color="var(--clr-success)" />
                Healthy Status
              </span>
            </div>
          </div>

          <DashboardChart data={chartData} title="Global Showcase Popularity Index" barColor="url(#adminGrad)" />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-bg-orb home-hero-bg-orb--1" />
        <div className="home-hero-bg-orb home-hero-bg-orb--2" />

        <div className="home-hero-content">
          <div className="home-welcome-chip">
            <Sparkles size={12} className="home-welcome-chip-icon" />
            <span>{user ? `Welcome back, ${getRoleLabel(user.role)}` : 'Welcome to Showcase'}</span>
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
                ? 'Explore innovative student projects, trace student updates, and find your next talent hire.'
                : user.role === 'ADMIN'
                ? 'Manage the showcase platform, curate project lists, and moderate accounts.'
                : 'Share your work with the world. Showcase your projects, track views, and get discovered.'
              : 'Explore innovative student projects, or register to showcase your own creations to industry recruiter networks.'}
          </p>

          <div className="home-hero-actions">
            {!user ? (
              <Link to="/login" className="btn btn--primary" id="login-btn">
                <LogIn size={16} />
                <span>Sign In</span>
              </Link>
            ) : user.role === 'STUDENT' ? (
              <Link to="/my-projects" className="btn btn--primary" id="upload-project-btn">
                <Plus size={16} />
                <span>My Projects</span>
              </Link>
            ) : null}
            
            <Link to="/projects" className="btn btn--secondary" id="browse-projects-btn">
              <Compass size={16} />
              <span>Browse Projects</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Role Dashboard Metrics & SVG Charts */}
      {user && (
        <section className="home-section animate-fade-in" style={{ marginTop: 'var(--space-8)' }}>
          <div className="home-section-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={20} color="var(--clr-primary-light)" />
              Performance Dashboard
            </h2>
          </div>
          {renderDashboard()}
        </section>
      )}

      {/* Recent projects */}
      <section className="home-section">
        <div className="home-section-header">
          <h2>Recent Submissions</h2>
          <Link to="/projects" className="home-section-link">View all →</Link>
        </div>
        {publicLoading ? (
          <div className="page-spinner"><div className="spinner" /></div>
        ) : recentProjects.length === 0 ? (
          <p className="empty-state">No projects yet. Be the first to showcase!</p>
        ) : (
          <div className="project-grid project-grid--small">
            {recentProjects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
