import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUnreadCount, useNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications';

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

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { data: unreadCount = 0 } = useUnreadCount();
  const { data } = useNotifications(1, 10);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const notifications = data?.notifications ?? [];

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!isAuthenticated) return null;

  const handleNotificationClick = (n) => {
    if (!n.isRead) markAsRead.mutate(n.id);
    setOpen(false);
  };

  return (
    <div className="notif-bell-wrapper" ref={ref}>
      <button className="notif-bell-btn" onClick={() => setOpen((p) => !p)} id="notification-bell">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button className="notif-mark-all" onClick={() => markAllAsRead.mutate()}>
                Mark all read
              </button>
            )}
          </div>
          <div className="notif-dropdown-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  to={n.entityId ? `/projects/${n.entityId}` : '#'}
                  className={`notif-item ${n.isRead ? '' : 'notif-item--unread'}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  {n.actor?.avatarUrl ? (
                    <img src={n.actor.avatarUrl} alt="" className="notif-item-avatar" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="notif-item-avatar notif-item-avatar--fallback">
                      {n.actor?.name?.charAt(0) ?? '?'}
                    </div>
                  )}
                  <div className="notif-item-content">
                    <p>{notificationText(n)}</p>
                    <span className="notif-item-time">{formatTime(n.createdAt)}</span>
                  </div>
                  {!n.isRead && <span className="notif-item-dot" />}
                </Link>
              ))
            )}
          </div>
          <Link to="/notifications" className="notif-dropdown-footer" onClick={() => setOpen(false)}>
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
