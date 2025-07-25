"use client";

import { useState, useEffect } from 'react';
import { Users, GraduationCap, School, Percent, DollarSign, BarChart3 } from 'lucide-react';
import StatsCard from './stats-card';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { toast } from 'sonner';

interface StatsData {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  attendanceRate: number;
  totalPayments: number;
  averagePerformance: number;
  pendingParents: number;
  activeUsers: number;
}

export default function StatsOverview() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('auth-token');
        
        if (!token) {
          throw new Error('Token d\'authentification non trouvé');
        }
        
        const response = await fetch(`http://localhost:3001/api/admin/summary`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Erreur lors de la récupération des statistiques: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setStats(data.data);
        } else {
          throw new Error(data.message || 'Erreur lors de la récupération des statistiques');
        }
      } catch (error: any) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        toast.error('Impossible de charger les statistiques');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatsCard
        title="Élèves inscrits"
        value={stats?.totalStudents || 0}
        icon={Users}
        description="Total des élèves actifs"
        color="blue"
        isLoading={isLoading}
      />
      
      <StatsCard
        title="Enseignants"
        value={stats?.totalTeachers || 0}
        icon={GraduationCap}
        description="Personnel enseignant"
        color="green"
        isLoading={isLoading}
      />
      
      <StatsCard
        title="Classes"
        value={stats?.totalClasses || 0}
        icon={School}
        description="Nombre total de classes"
        color="purple"
        isLoading={isLoading}
      />
      
      <StatsCard
        title="Taux de présence"
        value={stats ? formatPercentage(stats.attendanceRate) : '0%'}
        icon={Percent}
        description="Présence moyenne des élèves"
        trend={stats ? { value: 2.5, isPositive: true } : undefined}
        color="indigo"
        isLoading={isLoading}
      />
      
      <StatsCard
        title="Paiements reçus"
        value={stats ? formatCurrency(stats.totalPayments) : '0 CDF'}
        icon={DollarSign}
        description="Total des frais perçus"
        trend={stats ? { value: 12.5, isPositive: true } : undefined}
        color="orange"
        isLoading={isLoading}
      />
      
      <StatsCard
        title="Performance académique"
        value={stats ? `${stats.averagePerformance}%` : '0%'}
        icon={BarChart3}
        description="Moyenne générale des élèves"
        trend={stats ? { value: 1.2, isPositive: true } : undefined}
        color="blue"
        isLoading={isLoading}
      />
    </div>
  );
}