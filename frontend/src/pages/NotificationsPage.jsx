import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications';

function formatTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function notificationText(n) {
  const name = n.actor?.name ?? 'Someone';
  switch (n.type) {
    case 'PROJECT_LIKED': return <><strong>{name}</strong> liked your project</>;
    case 'NEW_FOLLOWER': return <><strong>{name}</strong> started following you</>;
    case 'PROJECT_CREATED': return <><strong>{name}</strong> created a new project</>;
    default: return <><strong>{name}</strong> did something</>;
  }
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useNotifications(page, 20);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const notifications = data?.notifications ?? [];
  const pagination = data?.pagination;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (isLoading) return <div className="page-spinner"><div className="spinner" /></div>;

  return (
    <div className="page-container page-container--narrow">
      <div className="page-header">
        <h1>Notifications</h1>
        {unreadCount > 0 && (
          <button className="btn btn--secondary btn--sm" onClick={() => markAllAsRead.mutate()}>
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="empty-state">No notifications yet.</p>
      ) : (
        <div className="notif-list">
          {notifications.map((n) => (
            <Link
              key={n.id}
              to={n.entityId ? `/projects/${n.entityId}` : '#'}
              className={`notif-list-item ${n.isRead ? '' : 'notif-list-item--unread'}`}
              onClick={() => { if (!n.isRead) markAsRead.mutate(n.id); }}
            >
              {n.actor?.avatarUrl ? (
                <img src={n.actor.avatarUrl} alt="" className="notif-list-avatar" referrerPolicy="no-referrer" />
              ) : (
                <div className="notif-list-avatar notif-list-avatar--fallback">
                  {n.actor?.name?.charAt(0) ?? '?'}
                </div>
              )}
              <div className="notif-list-content">
                <p>{notificationText(n)}</p>
                <span className="notif-list-time">{formatTime(n.createdAt)}</span>
              </div>
              {!n.isRead && <span className="notif-item-dot" />}
            </Link>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button className="pagination-btn" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>← Previous</button>
          <span className="pagination-info">Page {page} of {pagination.totalPages}</span>
          <button className="pagination-btn" onClick={() => setPage((p) => p + 1)} disabled={page >= pagination.totalPages}>Next →</button>
        </div>
      )}
    </div>
  );
}
