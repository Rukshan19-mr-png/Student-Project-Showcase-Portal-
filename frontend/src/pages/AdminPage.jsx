import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import {
  ShieldCheck, Users, FolderOpen, Heart, Trash2,
  Search, ChevronLeft, ChevronRight, AlertTriangle,
  UserX, GraduationCap, Briefcase, Crown, BarChart3, PieChart
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="dashboard-card" style={{ borderColor: accent ? `${accent}40` : undefined }}>
      <div className="dashboard-card-glow" style={{ background: accent ? `radial-gradient(circle, ${accent}15 0%, transparent 70%)` : undefined }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: accent ? `${accent}20` : 'rgba(99,102,241,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <Icon size={18} color={accent || '#6366f1'} />
        </div>
        <span className="dashboard-card-title" style={{ margin: 0 }}>{label}</span>
      </div>
      <span className="dashboard-card-value">{value}</span>
    </div>
  );
}

function RoleBadge({ role }) {
  const map = {
    ADMIN:    { label: 'Admin',     color: '#ef4444', icon: Crown },
    RECRUITER:{ label: 'Recruiter', color: '#f59e0b', icon: Briefcase },
    STUDENT:  { label: 'Student',   color: '#6366f1', icon: GraduationCap },
  };
  const cfg = map[role] || map.STUDENT;
  const RoleIcon = cfg.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px',
      background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}30`
    }}>
      <RoleIcon size={11} />
      {cfg.label}
    </span>
  );
}

function TopProjectsChart({ projects }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const top5 = [...projects]
    .sort((a, b) => (b._count?.likes ?? 0) - (a._count?.likes ?? 0))
    .slice(0, 5);

  if (top5.length === 0) {
    return (
      <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px', color: 'var(--clr-text-subtle)', flex: 1.5 }}>
        <p>No project metrics available yet.</p>
      </div>
    );
  }

  const maxLikes = Math.max(...top5.map(p => p._count?.likes ?? 0), 1);
  const barHeight = 16;
  const barGap = 16;
  const labelWidth = 110;
  const valueWidth = 40;
  const chartWidth = 340; 

  return (
    <div className="dashboard-card" style={{
      background: 'var(--clr-surface-2)',
      border: '1px solid var(--clr-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-5)',
      boxShadow: 'var(--shadow-sm)',
      flex: 1.5,
      minWidth: '280px',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
        <BarChart3 size={16} color="var(--clr-primary)" />
        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, margin: 0 }}>Top 5 Popular Projects</h3>
      </div>
      <div style={{ width: '100%' }}>
        <svg width="100%" height={top5.length * (barHeight + barGap)} viewBox={`0 0 ${chartWidth} ${top5.length * (barHeight + barGap)}`}>
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
            <linearGradient id="barHoverGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
          </defs>
          {top5.map((p, i) => {
            const y = i * (barHeight + barGap);
            const likes = p._count?.likes ?? 0;
            const barWidthMax = chartWidth - labelWidth - valueWidth;
            const width = (likes / maxLikes) * barWidthMax;
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={p.id}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Project Title Label */}
                <text
                  x="0"
                  y={y + barHeight - 4}
                  fill={isHovered ? 'var(--clr-primary)' : 'var(--clr-text)'}
                  fontSize="11px"
                  fontWeight={isHovered ? '700' : '600'}
                  style={{ transition: 'all 0.2s ease' }}
                >
                  {p.title.length > 16 ? `${p.title.substring(0, 14)}…` : p.title}
                </text>

                {/* Background capsule */}
                <rect
                  x={labelWidth}
                  y={y}
                  width={barWidthMax}
                  height={barHeight}
                  rx="8"
                  fill="var(--clr-bg-2)"
                />

                {/* Filled capsule */}
                <rect
                  x={labelWidth}
                  y={y}
                  width={width}
                  height={barHeight}
                  rx="8"
                  fill={isHovered ? 'url(#barHoverGrad)' : 'url(#barGrad)'}
                  style={{ transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1), fill 0.2s ease' }}
                />

                {/* Likes count */}
                <text
                  x={labelWidth + width + 8}
                  y={y + barHeight - 4}
                  fill={isHovered ? 'var(--clr-accent)' : 'var(--clr-text-muted)'}
                  fontSize="11px"
                  fontWeight="700"
                  style={{ transition: 'all 0.2s ease' }}
                >
                  {likes}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function UserRolesChart({ students, recruiters, admins }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  const total = students + recruiters + admins;
  if (total === 0) {
    return (
      <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px', color: 'var(--clr-text-subtle)', flex: 1 }}>
        <p>No user metrics available yet.</p>
      </div>
    );
  }

  const data = [
    { label: 'Students', count: students, color: '#4f46e5', grad: 'url(#donutStudent)' },
    { label: 'Recruiters', count: recruiters, color: '#06b6d4', grad: 'url(#donutRecruiter)' },
    { label: 'Admins', count: admins, color: '#ef4444', grad: 'url(#donutAdmin)' }
  ].filter(d => d.count > 0);

  const radius = 50;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius; 
  
  let accumulatedPercent = 0;

  return (
    <div className="dashboard-card" style={{
      background: 'var(--clr-surface-2)',
      border: '1px solid var(--clr-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-5)',
      boxShadow: 'var(--shadow-sm)',
      flex: 1,
      minWidth: '280px',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
        <PieChart size={16} color="var(--clr-primary)" />
        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, margin: 0 }}>User Roles Breakdown</h3>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', height: 'calc(100% - 36px)' }}>
        <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
          <svg width="100%" height="100%" viewBox="0 0 130 130" style={{ transform: 'rotate(-90deg)' }}>
            <defs>
              <linearGradient id="donutStudent" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
              <linearGradient id="donutRecruiter" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="donutAdmin" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            {data.map((item, index) => {
              const percent = item.count / total;
              const strokeLength = circumference * percent;
              const strokeOffset = circumference * (1 - accumulatedPercent);
              accumulatedPercent += percent;
              const isHovered = hoveredIndex === index;

              return (
                <circle
                  key={item.label}
                  cx="65"
                  cy="65"
                  r={radius}
                  fill="transparent"
                  stroke={item.grad}
                  strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={`${strokeLength} ${circumference}`}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  style={{
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </svg>
          {/* Center Text */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '9px', color: 'var(--clr-text-subtle)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {hoveredIndex !== null ? data[hoveredIndex].label : 'Total Users'}
            </span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--clr-text)', marginTop: '1px', lineHeight: 1 }}>
              {hoveredIndex !== null ? data[hoveredIndex].count : total}
            </span>
            {hoveredIndex !== null && (
              <span style={{ fontSize: '10px', color: 'var(--clr-primary)', fontWeight: 700, marginTop: '2px' }}>
                {Math.round((data[hoveredIndex].count / total) * 100)}%
              </span>
            )}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '100px' }}>
          {data.map((item, index) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.4,
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: item.color }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--clr-text)' }}>{item.label}</span>
              <span style={{ fontSize: '11px', color: 'var(--clr-text-subtle)', marginLeft: 'auto' }}>
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('projects');
  const [projectPage, setProjectPage] = useState(1);
  const [projectSearch, setProjectSearch] = useState('');

  // ── Projects ─────────────────────────────────────────────
  const { data: projectData, isLoading: projectsLoading } = useQuery({
    queryKey: ['adminProjects', projectPage],
    queryFn: async () => {
      const { data } = await api.get('/projects', { params: { page: projectPage, limit: 12 } });
      return data;
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id) => api.delete(`/projects/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['adminProjects'] });
      queryClient.setQueriesData({ queryKey: ['adminProjects'] }, (old) => {
        if (!old) return old;
        return { ...old, projects: old.projects.filter((p) => p.id !== id) };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProjects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['myProjects'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
    },
  });

  // ── Users ────────────────────────────────────────────────
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data } = await api.get('/users/all');
      return data;
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminProjects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['myProjects'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
    },
  });

  const projects = projectData?.projects ?? [];
  const pagination = projectData?.pagination;
  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
    (p.student?.name ?? '').toLowerCase().includes(projectSearch.toLowerCase())
  );
  const users = usersData?.users ?? [];
  const totalLikes = projects.reduce((acc, p) => acc + (p._count?.likes ?? 0), 0);
  const totalUsers = usersData?.users?.length ?? 0;
  const students = usersData?.users?.filter(u => u.role === 'STUDENT').length ?? 0;
  const recruiters = usersData?.users?.filter(u => u.role === 'RECRUITER').length ?? 0;
  const admins = usersData?.users?.filter(u => u.role === 'ADMIN').length ?? 0;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'rgba(239,68,68,0.15)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <ShieldCheck size={22} color="#ef4444" />
          </div>
          <div>
            <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
            <p className="page-subtitle" style={{ margin: 0 }}>Platform management & moderation</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="dashboard-grid" style={{ marginBottom: 'var(--space-5)' }}>
        <StatCard icon={FolderOpen} label="Total Projects" value={pagination?.total ?? '—'} accent="#6366f1" />
        <StatCard icon={Heart}      label="Total Likes"    value={totalLikes}                  accent="#ec4899" />
        <StatCard icon={Users}      label="Total Users"    value={totalUsers || '—'}           accent="#10b981" />
        <StatCard icon={GraduationCap} label="Students"   value={students || '—'}             accent="#f59e0b" />
      </div>

      {/* Analytics Panel */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-5)',
        marginBottom: 'var(--space-8)',
        flexWrap: 'wrap',
        alignItems: 'stretch'
      }}>
        <TopProjectsChart projects={projects} />
        <UserRolesChart
          students={students}
          recruiters={recruiters}
          admins={admins}
        />
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'projects' ? 'admin-tab--active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <FolderOpen size={15} />
          <span>Projects</span>
          {pagination?.total != null && <span className="admin-tab-badge">{pagination.total}</span>}
        </button>
        <button
          className={`admin-tab ${activeTab === 'users' ? 'admin-tab--active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={15} />
          <span>Users</span>
        </button>
      </div>

      {/* ── Projects Tab ── */}
      {activeTab === 'projects' && (
        <section className="admin-section animate-fade-in">
          {/* Search */}
          <div className="admin-search-wrap">
            <Search size={15} className="admin-search-icon" />
            <input
              className="admin-search-input"
              placeholder="Search by title or student name…"
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
            />
          </div>

          {projectsLoading ? (
            <div className="page-spinner"><div className="spinner" /></div>
          ) : (
            <>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Thumbnail</th>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Likes</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="admin-thumb">
                            {p.thumbnailUrl ? (
                              <img src={`${API_URL}${p.thumbnailUrl}`} alt="" />
                            ) : (
                              <div className="admin-thumb-placeholder">
                                <FolderOpen size={16} strokeWidth={1.5} color="#475569" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="admin-title-cell">{p.title}</td>
                        <td>
                          <div className="admin-student-cell">
                            {p.student?.avatarUrl ? (
                              <img src={p.student.avatarUrl} alt="" className="admin-student-avatar" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="admin-student-avatar admin-student-avatar--fallback">
                                {p.student?.name?.charAt(0) ?? '?'}
                              </div>
                            )}
                            <span>{p.student?.name ?? '—'}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ec4899' }}>
                            <Heart size={13} fill="#ec4899" />
                            {p._count?.likes ?? 0}
                          </span>
                        </td>
                        <td className="admin-date-cell">{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="btn btn--danger btn--sm"
                            onClick={() => {
                              if (window.confirm(`Delete "${p.title}"? This cannot be undone.`)) {
                                deleteProjectMutation.mutate(p.id);
                              }
                            }}
                            disabled={deleteProjectMutation.isPending}
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredProjects.length === 0 && (
                      <tr>
                        <td colSpan={6} className="admin-empty">
                          {projectSearch ? `No projects matching "${projectSearch}"` : 'No projects yet.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="pagination">
                  <button className="pagination-btn" onClick={() => setProjectPage((p) => p - 1)} disabled={projectPage <= 1}>
                    <ChevronLeft size={16} /><span>Prev</span>
                  </button>
                  <span className="pagination-info">Page {projectPage} of {pagination.totalPages}</span>
                  <button className="pagination-btn" onClick={() => setProjectPage((p) => p + 1)} disabled={projectPage >= pagination.totalPages}>
                    <span>Next</span><ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* ── Users Tab ── */}
      {activeTab === 'users' && (
        <section className="admin-section animate-fade-in">
          {usersLoading ? (
            <div className="page-spinner"><div className="spinner" /></div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Projects</th>
                    <th>Followers</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="admin-student-cell">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt="" className="admin-student-avatar" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="admin-student-avatar admin-student-avatar--fallback">
                              {u.name?.charAt(0) ?? '?'}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--clr-text)' }}>{u.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--clr-text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><RoleBadge role={u.role} /></td>
                      <td style={{ color: 'var(--clr-text-muted)', fontSize: '13px' }}>{u._count?.projects ?? 0}</td>
                      <td style={{ color: 'var(--clr-text-muted)', fontSize: '13px' }}>{u._count?.followers ?? 0}</td>
                      <td className="admin-date-cell">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        {u.role !== 'ADMIN' && (
                          <button
                            className="btn btn--danger btn--sm"
                            onClick={() => {
                              if (window.confirm(`Delete user "${u.name}"? All their data will be removed.`)) {
                                deleteUserMutation.mutate(u.id);
                              }
                            }}
                            disabled={deleteUserMutation.isPending}
                          >
                            <UserX size={13} />
                            <span>Remove</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={6} className="admin-empty">No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
