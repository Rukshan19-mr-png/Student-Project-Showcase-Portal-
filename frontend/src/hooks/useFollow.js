import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance';

export function useFollow(userId) {
  const queryClient = useQueryClient();

  const follow = useMutation({
    mutationFn: () => api.post(`/users/${userId}/follow`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['project'] });
      return {};
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const unfollow = useMutation({
    mutationFn: () => api.delete(`/users/${userId}/follow`),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return { follow, unfollow };
}
