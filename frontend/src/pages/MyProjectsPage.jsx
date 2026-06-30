import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useMyProjects } from '../hooks/useProjects';
import ProjectFormModal from '../components/ProjectFormModal';
import api from '../api/axiosInstance';

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

  if (isLoading) return <div className="page-spinner"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>My Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn--primary" onClick={openCreate} id="create-project-btn">
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
            <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <h3>No projects yet</h3>
          <p>Showcase your work by creating your first project.</p>
          <button className="btn btn--primary" onClick={openCreate}>Create Project</button>
        </div>
      ) : (
        <div className="my-projects-list">
          {projects.map((p) => (
            <div key={p.id} className="my-project-row">
              <div className="my-project-thumb">
                {p.thumbnailUrl ? (
                  <img src={`${API_URL}${p.thumbnailUrl}`} alt={p.title} />
                ) : (
                  <div className="my-project-thumb-placeholder" />
                )}
              </div>
              <div className="my-project-info">
                <h3>{p.title}</h3>
                <p>{p.description.substring(0, 100)}{p.description.length > 100 ? '...' : ''}</p>
                <span className="my-project-date">
                  {new Date(p.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="my-project-actions">
                <button className="btn btn--secondary btn--sm" onClick={() => openEdit(p)}>Edit</button>
                <button className="btn btn--danger btn--sm" onClick={() => setDeleteTarget(p)}>Delete</button>
              </div>
            </div>
          ))}
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
            <h2>Delete Project</h2>
            <p>Are you sure you want to delete <strong>{deleteTarget.title}</strong>? This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn--secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button
                className="btn btn--danger"
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
