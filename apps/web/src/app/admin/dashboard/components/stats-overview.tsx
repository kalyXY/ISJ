"use client";

import { Users, GraduationCap, School, Percent, DollarSign, BarChart3 } from 'lucide-react';
import StatsCard from './stats-card';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { useAdminSummary } from '@/services/dashboard';

export default function StatsOverview() {
  const { data: stats, isLoading } = useAdminSummary();

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
        value={stats ? formatPercent(stats.attendanceRate) : '0%'}
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