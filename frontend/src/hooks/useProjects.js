import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosInstance';

export function useProjects(page = 1, limit = 9) {
  return useQuery({
    queryKey: ['projects', page, limit],
    queryFn: async () => {
      const { data } = await api.get('/projects', { params: { page, limit } });
      return data;
    },
  });
}

export function useMyProjects(userId, page = 1, limit = 50) {
  return useQuery({
    queryKey: ['myProjects', userId, page],
    queryFn: async () => {
      const { data } = await api.get('/projects', { params: { page, limit, studentId: userId } });
      return data;
    },
    enabled: !!userId,
  });
}

export function useProject(id) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${id}`);
      return data;
    },
    enabled: !!id,
  });
}
