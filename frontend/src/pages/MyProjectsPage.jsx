import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useMyProjects } from '../hooks/useProjects';
import ProjectFormModal from '../components/ProjectFormModal';
import api from '../api/axiosInstance';
import {
  Plus, Edit2, Trash2, FolderPlus, ImageOff,
  Heart, Calendar, GitFork, BarChart2, Eye
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function MyProjectsPage() {
  const { user } = useAuth();
  const { data, isLoading } = useMyProjects(user?.id);
  const projects = data?.projects ?? [];
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProjects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDeleteTarget(null);
    },
  });

  const openCreate = () => { setEditingProject(null); setShowForm(true); };
  const openEdit = (p) => { setEditingProject(p); setShowForm(true); };

  const totalLikes = projects.reduce((sum, p) => sum + (p._count?.likes ?? p.likes?.length ?? 0), 0);

  if (isLoading) return <div className="page-spinner"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>My Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} published</p>
        </div>
        <button className="btn btn--primary" onClick={openCreate} id="create-project-btn">
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {/* Stats row — only visible when there are projects */}
      {projects.length > 0 && (
        <div className="dashboard-grid" style={{ marginBottom: 'var(--space-8)' }}>
          <div className="dashboard-card">
            <div className="dashboard-card-glow" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <BarChart2 size={16} color="var(--clr-primary-light)" />
              <span className="dashboard-card-title" style={{ margin: 0 }}>Projects</span>
            </div>
            <span className="dashboard-card-value">{projects.length}</span>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-card-glow" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Heart size={16} color="#ec4899" />
              <span className="dashboard-card-title" style={{ margin: 0 }}>Total Likes</span>
            </div>
            <span className="dashboard-card-value">{totalLikes}</span>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-card-glow" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Eye size={16} color="#10b981" />
              <span className="dashboard-card-title" style={{ margin: 0 }}>Avg. Likes / Project</span>
            </div>
            <span className="dashboard-card-value">
              {projects.length > 0 ? (totalLikes / projects.length).toFixed(1) : '0'}
            </span>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="empty-state-box">
          <FolderPlus size={48} strokeWidth={1.5} />
          <h3>No projects yet</h3>
          <p>Showcase your work by creating your first project and get discovered by recruiters.</p>
          <button className="btn btn--primary" onClick={openCreate}>
            <Plus size={16} />
            <span>Create your first project</span>
          </button>
        </div>
      ) : (
        <div className="my-projects-list">
          {projects.map((p) => {
            const likeCount = p._count?.likes ?? p.likes?.length ?? 0;
            return (
              <div key={p.id} className="my-project-row">
                <div className="my-project-thumb">
                  {p.thumbnailUrl ? (
                    <img src={`${API_URL}${p.thumbnailUrl}`} alt={p.title} />
                  ) : (
                    <div className="my-project-thumb-placeholder">
                      <ImageOff size={20} strokeWidth={1.5} />
                    </div>
                  )}
                </div>

                <div className="my-project-info">
                  <h3>{p.title}</h3>
                  <p>{p.description.substring(0, 120)}{p.description.length > 120 ? '…' : ''}</p>
                  <div className="my-project-meta">
                    <span className="my-project-meta-item">
                      <Calendar size={12} />
                      {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="my-project-meta-item" style={{ color: '#ec4899' }}>
                      <Heart size={12} fill="#ec4899" />
                      {likeCount} like{likeCount !== 1 ? 's' : ''}
                    </span>
                    {p.repositoryUrl && (
                      <a href={p.repositoryUrl} target="_blank" rel="noopener noreferrer" className="my-project-meta-item my-project-meta-link">
                        <GitFork size={12} />
                        Repository
                      </a>
                    )}
                  </div>
                </div>

                <div className="my-project-actions">
                  <button className="btn btn--secondary btn--sm" onClick={() => openEdit(p)}>
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                  <button className="btn btn--danger btn--sm" onClick={() => setDeleteTarget(p)}>
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <ProjectFormModal
          project={editingProject}
          onClose={() => setShowForm(false)}
        />
      )}

      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'rgba(239,68,68,0.15)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Trash2 size={18} color="#ef4444" />
              </div>
              <h2 style={{ margin: 0 }}>Delete Project</h2>
            </div>
            <p>Are you sure you want to delete <strong>{deleteTarget.title}</strong>? This action cannot be undone and all associated likes will also be removed.</p>
            <div className="modal-actions">
              <button className="btn btn--secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button
                className="btn btn--danger"
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
