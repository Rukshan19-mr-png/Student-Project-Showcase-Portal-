import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';

export default function FollowingPage() {
  const queryClient = useQueryClient();

  // Fetch following list
  const { data, isLoading, isError } = useQuery({
    queryKey: ['following'],
    queryFn: async () => {
      const { data: resData } = await api.get('/users/following');
      return resData.following;
    },
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: (studentId) => api.delete(`/users/${studentId}/follow`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
    },
  });

  if (isLoading) {
    return <div className="page-spinner"><div className="spinner" /></div>;
  }

  if (isError) {
    return (
      <div className="page-center">
        <p className="empty-state">Failed to load following list.</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>My Following</h1>
          <p className="page-subtitle">Track updates from student innovators you follow</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="empty-state-box animate-fade-in">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.251 0-4.37-.59-6.224-1.625z" />
          </svg>
          <h3>You aren't following anyone yet</h3>
          <p>Discover innovative student projects and follow creators to receive their updates here.</p>
          <Link to="/projects" className="btn btn--primary">Browse Projects</Link>
        </div>
      ) : (
        <div className="following-grid animate-fade-in">
          {data.map((student) => (
            <div key={student.id} className="following-card">
              <div className="following-card-header">
                {student.avatarUrl ? (
                  <img src={student.avatarUrl} alt="" className="following-avatar" referrerPolicy="no-referrer" />
                ) : (
                  <div className="following-avatar following-avatar--fallback">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="following-profile-info">
                  <h3 className="following-name">{student.name}</h3>
                  <a href={`mailto:${student.email}`} className="following-email">
                    {student.email}
                  </a>
                </div>
              </div>

              <div className="following-card-body">
                <div className="following-stats">
                  <span className="following-stats-label">Projects Published</span>
                  <span className="following-stats-value">{student.projectsCount}</span>
                </div>

                {student.recentProjects && student.recentProjects.length > 0 ? (
                  <div className="following-recent-projects">
                    <h4>Latest Submissions</h4>
                    <ul className="following-projects-list">
                      {student.recentProjects.map((p) => (
                        <li key={p.id}>
                          <Link to={`/projects/${p.id}`} className="following-project-link">
                            <span className="following-project-bullet" />
                            <span className="following-project-title">{p.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="following-no-projects">No projects published yet.</p>
                )}
              </div>

              <div className="following-card-actions">
                <button
                  className="btn btn--secondary btn--sm btn--block"
                  onClick={() => unfollowMutation.mutate(student.id)}
                  disabled={unfollowMutation.isPending}
                >
                  {unfollowMutation.isPending ? 'Unfollowing...' : 'Unfollow'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
