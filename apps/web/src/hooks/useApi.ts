import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL, getAuthHeaders } from '@/config/api';

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Functions
const fetchUsers = async (page = 1, limit = 10, search = '', role = ''): Promise<PaginatedResponse<User>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(role && { role })
  });

  const response = await axios.get(`${API_URL}/admin/users?${params}`, {
    headers: getAuthHeaders(),
  });

  if (response.data?.success) {
    return response.data;
  }

  throw new Error('Erreur lors de la récupération des utilisateurs');
};

const fetchUser = async (id: string): Promise<User> => {
  const response = await axios.get(`${API_URL}/admin/users/${id}`, {
    headers: getAuthHeaders(),
  });

  if (response.data?.success) {
    return response.data.data;
  }

  throw new Error('Erreur lors de la récupération de l\'utilisateur');
};

// React Query Hooks
export const useUsers = (page = 1, limit = 10, search = '', role = '') => {
  return useQuery({
    queryKey: ['users', page, limit, search, role],
    queryFn: () => fetchUsers(page, limit, search, role),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: (prev) => prev, // Keep previous data while loading new page
    refetchOnWindowFocus: false, // Don't refetch on window focus for user lists
  });
};

export const useUser = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Mutations
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: Partial<User>) => {
      const response = await axios.post(`${API_URL}/admin/users`, userData, {
        headers: getAuthHeaders(),
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // Also invalidate dashboard data as it might contain user counts
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userData }: { id: string; userData: Partial<User> }) => {
      const response = await axios.put(`${API_URL}/admin/users/${id}`, userData, {
        headers: getAuthHeaders(),
      });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      // Invalidate specific user and users list
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`${API_URL}/admin/users/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
    },
  });
};

// Prefetch utilities for better UX
export const usePrefetchUser = () => {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['user', id],
      queryFn: () => fetchUser(id),
      staleTime: 5 * 60 * 1000,
    });
  };
};

export const usePrefetchUsers = () => {
  const queryClient = useQueryClient();

  return (page = 1, limit = 10, search = '', role = '') => {
    queryClient.prefetchQuery({
      queryKey: ['users', page, limit, search, role],
      queryFn: () => fetchUsers(page, limit, search, role),
      staleTime: 3 * 60 * 1000,
    });
  };
};