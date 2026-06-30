import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications';
import { Heart, UserPlus, FolderPlus, Bell, BellOff, CheckCheck, ChevronLeft, ChevronRight } from 'lucide-react';

function formatTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function NotifIcon({ type }) {
  const map = {
    PROJECT_LIKED:   { icon: Heart,       color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
    NEW_FOLLOWER:    { icon: UserPlus,    color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    PROJECT_CREATED: { icon: FolderPlus,  color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  };
  const cfg = map[type] || { icon: Bell, color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' };
  const Icon = cfg.icon;
  return (
    <div style={{
      width: '38px', height: '38px', borderRadius: '10px',
      background: cfg.bg, display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0
    }}>
      <Icon size={17} color={cfg.color} fill={type === 'PROJECT_LIKED' ? cfg.color : 'none'} />
    </div>
  );
}

function notificationText(n) {
  const name = n.actor?.name ?? 'Someone';
  switch (n.type) {
    case 'PROJECT_LIKED':   return <><strong>{name}</strong> liked your project</>;
    case 'NEW_FOLLOWER':    return <><strong>{name}</strong> started following you</>;
    case 'PROJECT_CREATED': return <><strong>{name}</strong> published a new project</>;
    default: return <><strong>{name}</strong> performed an action</>;
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'rgba(99,102,241,0.12)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <Bell size={20} color="#6366f1" />
          </div>
          <div>
            <h1 style={{ margin: 0 }}>Notifications</h1>
            <p className="page-subtitle" style={{ margin: 0 }}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            className="btn btn--secondary btn--sm"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
          >
            <CheckCheck size={14} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state-box">
          <BellOff size={44} strokeWidth={1.5} />
          <h3>No notifications yet</h3>
          <p>When someone likes your project or follows you, it will appear here.</p>
        </div>
      ) : (
        <div className="notif-list">
          {notifications.map((n) => (
            <Link
              key={n.id}
              to={n.entityId ? `/projects/${n.entityId}` : '#'}
              className={`notif-list-item ${n.isRead ? '' : 'notif-list-item--unread'}`}
              onClick={() => { if (!n.isRead) markAsRead.mutate(n.id); }}
            >
              <NotifIcon type={n.type} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
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
              </div>

              {!n.isRead && <span className="notif-item-dot" />}
            </Link>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button className="pagination-btn" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
            <ChevronLeft size={16} /><span>Previous</span>
          </button>
          <span className="pagination-info">Page {page} of {pagination.totalPages}</span>
          <button className="pagination-btn" onClick={() => setPage((p) => p + 1)} disabled={page >= pagination.totalPages}>
            <span>Next</span><ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
