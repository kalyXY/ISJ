import useSWR, { mutate } from 'swr';
import { api } from '@/lib/api';
import { Student, StudentFilters, StudentFormData, StudentsResponse } from '@/types/student';
import { useState } from 'react';
import { toast } from 'sonner';

// Fonction pour construire l'URL avec les filtres
const buildStudentsUrl = (filters?: StudentFilters) => {
  if (!filters) return '/api/academics/eleves';
  
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.search) params.append('search', filters.search);
  if (filters.class) params.append('class', filters.class);
  if (filters.promotion) params.append('promotion', filters.promotion);
  if (filters.isActive !== null && filters.isActive !== undefined) {
    params.append('isActive', filters.isActive.toString());
  }
  
  return `/api/academics/eleves?${params.toString()}`;
};

// Fetcher pour SWR
const fetcher = async (url: string) => {
  const response = await api.get(url);
  return response.data;
};

// Hook pour récupérer la liste des élèves
export function useStudents(filters?: StudentFilters) {
  const url = buildStudentsUrl(filters);
  const { data, error, isLoading, mutate } = useSWR<StudentsResponse>(url, fetcher);
  
  return {
    students: data?.students || [],
    pagination: data?.pagination,
    filters: data?.filters,
    isLoading,
    isError: error,
    mutate,
  };
}

// Hook pour récupérer un élève par son ID
export function useStudent(id: string) {
  const { data, error, isLoading } = useSWR<Student>(
    id ? `/api/academics/eleves/${id}` : null,
    fetcher
  );
  
  return {
    student: data,
    isLoading,
    isError: error,
  };
}

// Hook pour les opérations CRUD sur les élèves
export function useStudentActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Créer un nouvel élève
  const createStudent = async (data: StudentFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/api/academics/eleves', data);
      await mutate('/api/academics/eleves'); // Invalider le cache
      toast.success('Élève ajouté avec succès');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la création de l\'élève';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Mettre à jour un élève
  const updateStudent = async (id: string, data: StudentFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.put(`/api/academics/eleves/${id}`, data);
      await mutate('/api/academics/eleves'); // Invalider le cache global
      await mutate(`/api/academics/eleves/${id}`); // Invalider le cache spécifique
      toast.success('Élève mis à jour avec succès');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour de l\'élève';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer un élève
  const deleteStudent = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await api.delete(`/api/academics/eleves/${id}`);
      await mutate('/api/academics/eleves'); // Invalider le cache
      toast.success('Élève supprimé avec succès');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la suppression de l\'élève';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createStudent,
    updateStudent,
    deleteStudent,
    isLoading,
    error,
  };
} 