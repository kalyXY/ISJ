"use client";

import { useRequireAuth } from "@/lib/auth";
import Spinner from "@/components/ui/spinner";
import { type DashboardSkeleton } from "@/components/ui/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  UserPlus,
  Check,
  ExternalLink,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboardData } from "@/services/dashboard";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useRequireAuth(["admin"]);
  const router = useRouter();
  
  // Use React Query hook for optimized data fetching
  const { 
    data: dashboardData, 
    isLoading: dataLoading, 
    error: dataError,
    isError 
  } = useDashboardData();

  // Show loading state while authenticating or if no user yet
  if (authLoading || !user) {
    return (
      <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
        <div className="text-center animate-pulse">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-primary font-medium">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  // Show loading state for data with skeleton
  if (dataLoading) {
    return <DashboardSkeleton />;
  }

  // Show error state
  if (isError || dataError) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Erreur de chargement</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {dataError?.message || "Impossible de charger les données du tableau de bord"}
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Activity className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  // Formater les nombres pour l'affichage
  const formatNumber = (value: number): string => {
    return value.toLocaleString('fr-FR');
  };

  // Formater les pourcentages pour l'affichage
  const formatPercent = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Helper pour afficher le rôle
  const renderRole = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrateur";
      case "teacher":
        return "Enseignant";
      case "parent":
        return "Parent";
      case "student":
        return "Étudiant";
      case "pending_parent":
        return "Parent en attente";
      default:
        return role;
    }
  };

  // Helper pour afficher le statut
  const renderStatus = (status: string) => {
    switch (status) {
      case "active":
        return "Actif";
      case "inactive":
        return "Inactif";
      case "pending":
        return "En attente";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Bon retour, {user?.firstName} ! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Voici un aperçu de votre école aujourd'hui
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/users/create')}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Ajouter un utilisateur
            </Button>
            <Button
              onClick={() => router.push('/admin/users')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
            >
              <Users className="h-4 w-4 mr-2" />
              Gérer les utilisateurs
            </Button>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Élèves inscrits" 
          value={dashboardData ? formatNumber(dashboardData.totalStudents) : "0"}
          trend="Élèves actifs" 
          trendPositive={undefined}
          icon={<Users className="h-6 w-6" />}
          iconBg="from-blue-500 to-blue-600"
          iconColor="text-white"
          delay={0}
        />
        <StatCard 
          title="Enseignants" 
          value={dashboardData ? formatNumber(dashboardData.totalTeachers) : "0"} 
          trend="Enseignants actifs" 
          trendPositive={undefined}
          icon={<GraduationCap className="h-6 w-6" />}
          iconBg="from-green-500 to-green-600"
          iconColor="text-white"
          delay={100}
        />
        <StatCard 
          title="Classes" 
          value={dashboardData ? formatNumber(dashboardData.totalClasses) : "0"} 
          trend="Classes actives" 
          trendPositive={undefined}
          icon={<BookOpen className="h-6 w-6" />}
          iconBg="from-purple-500 to-purple-600"
          iconColor="text-white"
          delay={200}
        />
        <StatCard 
          title="Taux d'assiduité" 
          value={dashboardData ? formatPercent(dashboardData.attendanceRate * 100) : "0%"} 
          trend="Moyenne globale" 
          trendPositive={undefined}
          icon={<BarChart3 className="h-6 w-6" />}
          iconBg="from-orange-500 to-orange-600"
          iconColor="text-white"
          delay={300}
        />
      </div>

      {/* Graphiques et données */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Graphique des paiements */}
        <Card className="overflow-hidden border-gray-200/60 dark:border-gray-800/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-b border-gray-200/60 dark:border-gray-800/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Paiements reçus</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ce mois-ci</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {dashboardData ? `${formatNumber(dashboardData.totalPayments)} $` : "0 $"}
                </p>
                <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>+12%</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[280px] w-full bg-gradient-to-br from-blue-50/50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="paymentGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                      <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M0,180 C50,160 100,190 150,170 C200,150 250,190 300,160 C350,130 400,150 400,140 L400,200 L0,200 Z" 
                    fill="url(#paymentGradient)" 
                  />
                  <path 
                    d="M0,180 C50,160 100,190 150,170 C200,150 250,190 300,160 C350,130 400,150 400,140" 
                    fill="none" 
                    stroke="#3B82F6" 
                    strokeWidth="3" 
                    className="animate-draw"
                    style={{
                      strokeDasharray: 1000,
                      strokeDashoffset: 1000,
                      animation: 'draw 2s ease-in-out forwards'
                    }}
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Graphique de performance académique */}
        <Card className="overflow-hidden border-gray-200/60 dark:border-gray-800/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-b border-gray-200/60 dark:border-gray-800/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Performance académique</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Moyenne générale</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {dashboardData ? `${dashboardData.averagePerformance}%` : "0%"}
                </p>
                <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>+5%</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 flex items-center justify-center">
            <div className="relative h-[200px] w-[200px] animate-float">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* Cercle de fond */}
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  className="text-gray-200 dark:text-gray-700"
                />
                
                {/* Segments avec animation - en utilisant les données réelles */}
                {dashboardData && (
                  <circle 
                    cx="50" cy="50" r="40" 
                    fill="transparent" 
                    stroke="url(#performanceGradient)" 
                    strokeWidth="8" 
                    strokeDasharray={`${(dashboardData.averagePerformance / 100) * 251.2} 251.2`} 
                    strokeDashoffset="0" 
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    style={{ 
                      strokeDasharray: `${(dashboardData.averagePerformance / 100) * 251.2} 251.2`,
                      strokeDashoffset: 0,
                      animation: 'draw 2s ease-out forwards'
                    }}
                  />
                )}
                
                <defs>
                  <linearGradient id="performanceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#A855F7" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Texte central */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {dashboardData ? `${dashboardData.averagePerformance}%` : "0%"}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Performance
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Répartition des utilisateurs par rôle */}
      <Card className="border-gray-200/60 dark:border-gray-800/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800/50 dark:to-slate-700/50 border-b border-gray-200/60 dark:border-gray-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Répartition des utilisateurs</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">Par rôle dans le système</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {dashboardData?.roleDistribution ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <RoleCard 
                role="admin" 
                count={dashboardData.roleDistribution.admin || 0} 
                title="Administrateurs" 
                gradient="from-blue-500 to-blue-600"
                icon={<UserCheck className="h-5 w-5" />}
              />
              <RoleCard 
                role="teacher" 
                count={dashboardData.roleDistribution.teacher || 0} 
                title="Enseignants" 
                gradient="from-green-500 to-green-600"
                icon={<GraduationCap className="h-5 w-5" />}
              />
              <RoleCard 
                role="parent" 
                count={dashboardData.roleDistribution.parent || 0} 
                title="Parents" 
                gradient="from-purple-500 to-purple-600"
                icon={<Users className="h-5 w-5" />}
              />
              <RoleCard 
                role="student" 
                count={dashboardData.roleDistribution.student || 0} 
                title="Étudiants" 
                gradient="from-amber-500 to-amber-600"
                icon={<BookOpen className="h-5 w-5" />}
              />
              <RoleCard 
                role="pending_parent" 
                count={dashboardData.roleDistribution.pending_parent || 0} 
                title="En attente" 
                gradient="from-red-500 to-red-600"
                icon={<AlertCircle className="h-5 w-5" />}
              />
            </div>
          ) : (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Aucune donnée disponible</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Utilisateurs récemment ajoutés */}
      <Card className="border-gray-200/60 dark:border-gray-800/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800/50 dark:to-slate-700/50 border-b border-gray-200/60 dark:border-gray-800/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Utilisateurs récents</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">Dernières inscriptions</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/admin/users')}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Voir tous
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {dashboardData?.recentUsers && dashboardData.recentUsers.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-gray-200/60 dark:border-gray-800/60">
              <table className="w-full">
                <thead className="bg-gray-50/80 dark:bg-slate-800/80">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-300">Nom</th>
                    <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-300">Email</th>
                    <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-300">Rôle</th>
                    <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-300">Statut</th>
                    <th className="text-right py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-300">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentUsers.map((user, index) => (
                    <tr 
                      key={user.id} 
                      className="border-t border-gray-200/60 dark:border-gray-800/60 hover:bg-gray-50/60 dark:hover:bg-slate-800/60 transition-all duration-200"
                    >
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-400">{user.email}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                          {renderRole(user.role)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                        }`}>
                          {renderStatus(user.status)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-sm text-gray-500 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Aucun utilisateur récent</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ActionCard 
          title="Parents en attente" 
          value={dashboardData ? dashboardData.pendingParents.toString() : "0"} 
          description="Demandes à valider"
          icon={<UserCheck className="h-6 w-6 text-white" />}
          gradient="from-red-500 to-red-600"
          buttonText="Valider"
          onClick={() => router.push('/admin/users?role=pending_parent&status=en_attente')}
          delay={0}
        />
        <ActionCard 
          title="Utilisateurs actifs" 
          value={dashboardData ? dashboardData.activeUsers.toString() : "0"} 
          description="Comptes utilisateurs"
          icon={<Users className="h-6 w-6 text-white" />}
          gradient="from-green-500 to-green-600"
          buttonText="Voir"
          onClick={() => router.push('/admin/users?status=active')}
          delay={100}
        />
        <ActionCard 
          title="Ajouter un utilisateur" 
          value="+" 
          description="Créer un nouveau compte"
          icon={<UserPlus className="h-6 w-6 text-white" />}
          gradient="from-blue-500 to-blue-600"
          buttonText="Créer"
          onClick={() => router.push('/admin/users/create')}
          delay={200}
        />
        <ActionCard 
          title="Gestion complète" 
          value="✓" 
          description="Tous les utilisateurs"
          icon={<Check className="h-6 w-6 text-white" />}
          gradient="from-purple-500 to-purple-600"
          buttonText="Accéder"
          onClick={() => router.push('/admin/users')}
          delay={300}
        />
      </div>
    </div>
  );
}

// Composant pour les cartes de statistiques modernisé
function StatCard({ title, value, trend, trendPositive, icon, iconBg, iconColor, delay = 0 }: {
  title: string;
  value: string | number;
  trend?: string;
  trendPositive?: boolean;
  icon: any;
  iconBg: string;
  iconColor: string;
  delay?: number;
}) {
  return (
    <Card className="border-gray-200/60 dark:border-gray-800/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group" 
          style={{ animationDelay: `${delay}ms` }}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</p>
            {trend && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {trend}
              </p>
            )}
          </div>
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <div className={iconColor}>
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Composant pour les cartes d'action modernisé
function ActionCard({ title, value, description, icon, gradient, buttonText, onClick, delay = 0 }: {
  title: string;
  value: string | number;
  description: string;
  icon: any;
  gradient: string;
  buttonText: string;
  onClick: () => void;
  delay?: number;
}) {
  return (
    <Card className="border-gray-200/60 dark:border-gray-800/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group" 
          style={{ animationDelay: `${delay}ms` }}>
      <CardContent className="p-6">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-start mb-6">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
              {icon}
            </div>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{description}</p>
          </div>
          <Button 
            className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-0 transition-all hover:scale-105" 
            onClick={onClick}
          >
            {buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Composant pour la répartition des rôles modernisé
function RoleCard({ role, count, title, gradient, icon }: {
  role: string;
  count: number;
  title: string;
  gradient: string;
  icon: any;
}) {
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-gray-800/60 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full bg-gradient-to-r ${gradient} transition-all duration-1000`}
            style={{ width: `${Math.min(100, (count / 50) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
 