import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance';

export function useNotifications(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: async () => {
      const { data } = await api.get('/notifications', { params: { page, limit } });
      return data;
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 1, 100],
    queryFn: async () => {
      const { data } = await api.get('/notifications', { params: { page: 1, limit: 100 } });
      return data;
    },
    select: (data) => data.notifications?.filter((n) => !n.isRead).length ?? 0,
    refetchInterval: 30000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      // optimistically mark the notification as read across all cached pages
      queryClient.setQueriesData({ queryKey: ['notifications'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          notifications: old.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      queryClient.setQueriesData({ queryKey: ['notifications'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          notifications: old.notifications.map((n) => ({ ...n, isRead: true })),
        };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
