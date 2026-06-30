import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance';

export function useLike(projectId) {
  const queryClient = useQueryClient();

  const like = useMutation({
    mutationFn: () => api.post(`/projects/${projectId}/like`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['project', projectId] });
      const prev = queryClient.getQueryData(['project', projectId]);
      queryClient.setQueryData(['project', projectId], (old) => {
        if (!old) return old;
        return { ...old, hasLiked: true, _count: { ...old._count, likes: (old._count?.likes ?? 0) + 1 } };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['project', projectId], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const unlike = useMutation({
    mutationFn: () => api.delete(`/projects/${projectId}/like`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['project', projectId] });
      const prev = queryClient.getQueryData(['project', projectId]);
      queryClient.setQueryData(['project', projectId], (old) => {
        if (!old) return old;
        return { ...old, hasLiked: false, _count: { ...old._count, likes: Math.max(0, (old._count?.likes ?? 1) - 1) } };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['project', projectId], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return { like, unlike };
}
