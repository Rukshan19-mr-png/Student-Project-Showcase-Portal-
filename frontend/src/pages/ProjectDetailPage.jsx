import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import { useLike } from '../hooks/useLike';
import { useFollow } from '../hooks/useFollow';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: project, isLoading, isError } = useProject(id);
  const { like, unlike } = useLike(id);
  const studentId = project?.student?.id;
  const { follow, unfollow } = useFollow(studentId);

  // Track like/follow state locally since the API doesn't return hasLiked/isFollowing
  const [hasLiked, setHasLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (project) {
      setLikeCount(project._count?.likes ?? project.likes?.length ?? 0);
      setHasLiked(project.hasLiked ?? false);
      setIsFollowing(project.isFollowing ?? false);
    }
  }, [project]);

  const handleLike = () => {
    if (hasLiked) {
      setHasLiked(false);
      setLikeCount((c) => Math.max(0, c - 1));
      unlike.mutate(undefined, {
        onError: () => { setHasLiked(true); setLikeCount((c) => c + 1); },
      });
    } else {
      setHasLiked(true);
      setLikeCount((c) => c + 1);
      like.mutate(undefined, {
        onError: () => { setHasLiked(false); setLikeCount((c) => Math.max(0, c - 1)); },
      });
    }
  };

  const handleFollow = () => {
    if (isFollowing) {
      setIsFollowing(false);
      unfollow.mutate(undefined, {
        onError: () => setIsFollowing(true),
      });
    } else {
      setIsFollowing(true);
      follow.mutate(undefined, {
        onError: () => setIsFollowing(false),
      });
    }
  };

  if (isLoading) return <div className="page-spinner"><div className="spinner" /></div>;
  if (isError || !project) return <div className="page-center"><p className="empty-state">Project not found.</p></div>;

  const thumb = project.thumbnailUrl ? `${API_URL}${project.thumbnailUrl}` : null;

  return (
    <div className="page-container">
      <Link to="/projects" className="back-link">← Back to projects</Link>

      <div className="detail-layout">
        <div className="detail-main">
          {thumb && (
            <div className="detail-thumbnail">
              <img src={thumb} alt={project.title} />
            </div>
          )}

          <h1 className="detail-title">{project.title}</h1>
          <p className="detail-description">{project.description}</p>

          {project.repositoryUrl && (
            <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer" className="detail-repo-link">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              View Repository
            </a>
          )}

          <div className="detail-meta">
            <span className="detail-date">
              Posted {new Date(project.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="detail-sidebar">
          {/* Like button */}
          <button
            className={`detail-action-btn ${hasLiked ? 'detail-action-btn--liked' : ''}`}
            onClick={handleLike}
            disabled={!user}
            id="like-button"
          >
            <svg viewBox="0 0 20 20" fill={hasLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" width="20" height="20">
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
            </svg>
            <span>{likeCount}</span>
            <span className="detail-action-label">{hasLiked ? 'Liked' : 'Like'}</span>
          </button>

          {/* Student info */}
          <div className="detail-student-card">
            <div className="detail-student-info">
              {project.student?.avatarUrl ? (
                <img src={project.student.avatarUrl} alt="" className="detail-student-avatar" referrerPolicy="no-referrer" />
              ) : (
                <div className="detail-student-avatar detail-student-avatar--fallback">
                  {project.student?.name?.charAt(0) ?? '?'}
                </div>
              )}
              <div>
                <p className="detail-student-name">{project.student?.name}</p>
                <p className="detail-student-email">{project.student?.email}</p>
              </div>
            </div>

            {user && user.id !== studentId && (
              <button
                className={`btn ${isFollowing ? 'btn--secondary' : 'btn--primary'} detail-follow-btn`}
                onClick={handleFollow}
                id="follow-button"
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
