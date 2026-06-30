import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [projectPage, setProjectPage] = useState(1);

  const { data: projectData, isLoading } = useQuery({
    queryKey: ['adminProjects', projectPage],
    queryFn: async () => {
      const { data } = await api.get('/projects', { params: { page: projectPage, limit: 15 } });
      return data;
    },
  });

  const deleteMutation = useMutation({
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
    },
  });

  const projects = projectData?.projects ?? [];
  const pagination = projectData?.pagination;

  if (isLoading) return <div className="page-spinner"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p className="page-subtitle">Manage platform content</p>
      </div>

      <section className="admin-section">
        <h2>All Projects ({pagination?.total ?? 0})</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Thumbnail</th>
                <th>Title</th>
                <th>Student</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="admin-thumb">
                      {p.thumbnailUrl ? (
                        <img src={`${API_URL}${p.thumbnailUrl}`} alt="" />
                      ) : (
                        <div className="admin-thumb-placeholder" />
                      )}
                    </div>
                  </td>
                  <td className="admin-title-cell">{p.title}</td>
                  <td>
                    <div className="admin-student-cell">
                      {p.student?.avatarUrl && (
                        <img src={p.student.avatarUrl} alt="" className="admin-student-avatar" referrerPolicy="no-referrer" />
                      )}
                      {p.student?.name ?? '—'}
                    </div>
                  </td>
                  <td className="admin-date-cell">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn--danger btn--sm"
                      onClick={() => {
                        if (window.confirm(`Delete "${p.title}"?`)) deleteMutation.mutate(p.id);
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr><td colSpan={5} className="admin-empty">No projects found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <button className="pagination-btn" onClick={() => setProjectPage((p) => p - 1)} disabled={projectPage <= 1}>← Previous</button>
            <span className="pagination-info">Page {projectPage} of {pagination.totalPages}</span>
            <button className="pagination-btn" onClick={() => setProjectPage((p) => p + 1)} disabled={projectPage >= pagination.totalPages}>Next →</button>
          </div>
        )}
      </section>
    </div>
  );
}
