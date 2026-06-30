import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ProjectCard({ project }) {
  const thumb = project.thumbnailUrl
    ? `${API_URL}${project.thumbnailUrl}`
    : null;

  return (
    <Link to={`/projects/${project.id}`} className="project-card" id={`project-card-${project.id}`}>
      <div className="project-card-thumb">
        {thumb ? (
          <img src={thumb} alt={project.title} />
        ) : (
          <div className="project-card-thumb-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
              <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
        )}
      </div>
      <div className="project-card-body">
        <h3 className="project-card-title">{project.title}</h3>
        <div className="project-card-meta">
          <div className="project-card-student">
            {project.student?.avatarUrl ? (
              <img src={project.student.avatarUrl} alt="" className="project-card-student-avatar" referrerPolicy="no-referrer" />
            ) : (
              <div className="project-card-student-avatar project-card-student-avatar--fallback">
                {project.student?.name?.charAt(0) ?? '?'}
              </div>
            )}
            <span>{project.student?.name ?? 'Unknown'}</span>
          </div>
          <div className="project-card-likes">
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
            </svg>
            {project._count?.likes ?? 0}
          </div>
        </div>
      </div>
    </Link>
  );
}
