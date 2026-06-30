import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { Users, UserMinus, UserPlus, Mail, Compass } from 'lucide-react';

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
      queryClient.invalidateQueries({ queryKey: ['projects'] });
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
          <Users size={48} strokeWidth={1.5} />
          <h3>You aren't following anyone yet</h3>
          <p>Discover innovative student projects and follow creators to receive their updates here.</p>
          <Link to="/projects" className="btn btn--primary">
            <Compass size={16} />
            <span>Browse Projects</span>
          </Link>
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
                    <Mail size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    <span style={{ verticalAlign: 'middle' }}>{student.email}</span>
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
                  <UserMinus size={14} />
                  <span>{unfollowMutation.isPending ? 'Unfollowing...' : 'Unfollow'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
