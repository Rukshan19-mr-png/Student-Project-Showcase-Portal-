import { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import ProjectCard from '../components/ProjectCard';

export default function ProjectListPage() {
  const [page, setPage] = useState(1);
  const limit = 9;
  const { data, isLoading, isError } = useProjects(page, limit);
  const projects = data?.projects ?? [];
  const pagination = data?.pagination;

  if (isLoading) {
    return <div className="page-spinner"><div className="spinner" /></div>;
  }

  if (isError) {
    return <div className="page-center"><p className="empty-state">Failed to load projects.</p></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>All Projects</h1>
        <p className="page-subtitle">{pagination?.total ?? 0} projects showcased</p>
      </div>

      {projects.length === 0 ? (
        <p className="empty-state">No projects found.</p>
      ) : (
        <div className="project-grid">
          {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            ← Previous
          </button>
          <div className="pagination-pages">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`pagination-page ${p === page ? 'pagination-page--active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            className="pagination-btn"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
