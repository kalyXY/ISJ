import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosInstance';

// Interface pour la distribution des utilisateurs par rôle
export interface RoleDistribution {
  [key: string]: number;
}

// Interface pour la distribution des utilisateurs par statut
export interface StatusDistribution {
  [key: string]: number;
}

// Interface pour les utilisateurs récents
export interface RecentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface DashboardData {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  attendanceRate: number;
  totalPayments: number;
  averagePerformance: number;
  pendingParents: number;
  activeUsers: number;
  roleDistribution: RoleDistribution;
  statusDistribution: StatusDistribution;
  recentUsers: RecentUser[];
}

/**
 * Récupère les données pour le tableau de bord
 */
export const fetchDashboardData = async (): Promise<DashboardData> => {
  try {
    const response = await axiosInstance.get('/admin/summary');

    if (response.data?.success) {
      return response.data.data as DashboardData;
    }

    throw new Error('Données du tableau de bord non disponibles');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erreur lors de la récupération des données du tableau de bord:', error);
    throw error;
  }
};

/**
 * Hook React Query optimisé pour les données du dashboard avec mise en cache agressive
 */
export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes - données considérées fraîches plus longtemps
    gcTime: 10 * 60 * 1000,   // 10 minutes - garder en cache plus longtemps
    refetchOnWindowFocus: false, // Éviter les refetch automatiques
    refetchOnMount: false, // Éviter les refetch au montage si données en cache
    refetchInterval: 10 * 60 * 1000, // Refetch toutes les 10 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 1; // Réduire les retries
    },
    // Optimisations de performance
    placeholderData: (previousData) => previousData, // Garder les anciennes données pendant le refetch
    notifyOnChangeProps: ['data', 'error', 'isLoading'], // Réduire les re-renders
  });
};

/**
 * Hook dédié au résumé admin pour unifier la consommation dans le dashboard
 */
export const useAdminSummary = () => {
  return useQuery({
    queryKey: ['admin-summary'],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: 10 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 1;
    },
    placeholderData: (previousData) => previousData,
    notifyOnChangeProps: ['data', 'error', 'isLoading'],
  });
}; 