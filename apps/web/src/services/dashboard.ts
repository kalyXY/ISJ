import axios from 'axios';
import { API_URL, getAuthHeaders } from '@/config/api';

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
    const response = await axios.get(`${API_URL}/admin/summary`, {
      headers: getAuthHeaders(),
    });
    
    if (response.data?.success) {
      return response.data.data;
    }
    
    throw new Error('Données du tableau de bord non disponibles');
  } catch (error) {
    console.error('Erreur lors de la récupération des données du tableau de bord:', error);
    throw error;
  }
}; 