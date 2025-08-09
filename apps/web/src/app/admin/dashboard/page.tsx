"use client";

import { useRequireAuth } from "@/lib/auth";
import Spinner from "@/components/ui/spinner";
import { DashboardSkeleton } from "@/components/ui/loading-skeleton";
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
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboardData } from "@/services/dashboard";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Erreur</h2>
        <p className="text-muted-foreground mb-4">
          {dataError?.message || "Impossible de charger les données du tableau de bord"}
        </p>
        <Button onClick={() => window.location.reload()}>
          Réessayer
        </Button>
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
    <div className="space-y-6 animate-fadeIn">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Élèves inscrits" 
          value={dashboardData ? formatNumber(dashboardData.totalStudents) : "0"}
          trend="Élèves actifs" 
          trendPositive={undefined}
          icon={<Users className="h-6 w-6 text-blue-500" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          delay={0}
        />
        <StatCard 
          title="Enseignants" 
          value={dashboardData ? formatNumber(dashboardData.totalTeachers) : "0"} 
          trend="Enseignants actifs" 
          trendPositive={undefined}
          icon={<GraduationCap className="h-6 w-6 text-green-500" />}
          iconBg="bg-green-100 dark:bg-green-900/30"
          delay={100}
        />
        <StatCard 
          title="Classes" 
          value={dashboardData ? formatNumber(dashboardData.totalClasses) : "0"} 
          trend="Classes actives" 
          trendPositive={undefined}
          icon={<BookOpen className="h-6 w-6 text-purple-500" />}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          delay={200}
        />
        <StatCard 
          title="Taux d'assiduité" 
          value={dashboardData ? formatPercent(dashboardData.attendanceRate * 100) : "0%"} 
          trend="Moyenne globale" 
          trendPositive={undefined}
          icon={<BarChart3 className="h-6 w-6 text-orange-500" />}
          iconBg="bg-orange-100 dark:bg-orange-900/30"
          delay={300}
        />
      </div>

      {/* Graphiques et données */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique des paiements */}
        <Card className="overflow-hidden transition-all duration-normal hover:shadow-hover animate-scaleIn">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Paiements reçus</CardTitle>
            <p className="text-sm text-muted-foreground">
              {dashboardData ? `${formatNumber(dashboardData.totalPayments)} $` : "0 $"}
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[220px] w-full bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                  <path 
                    d="M0,180 C50,160 100,190 150,170 C200,150 250,190 300,160 C350,130 400,150 400,140 L400,200 L0,200 Z" 
                    fill="rgba(37, 99, 235, 0.1)" 
                  />
                  <path 
                    d="M0,180 C50,160 100,190 150,170 C200,150 250,190 300,160 C350,130 400,150 400,140" 
                    fill="none" 
                    stroke="#2563eb" 
                    strokeWidth="2" 
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
        <Card className="overflow-hidden transition-all duration-normal hover:shadow-hover animate-scaleIn" style={{ animationDelay: '100ms' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Performance académique</CardTitle>
            <p className="text-sm text-muted-foreground">
              {dashboardData ? `${dashboardData.averagePerformance}%` : "0%"}
            </p>
          </CardHeader>
          <CardContent className="p-6 flex items-center justify-center">
            <div className="relative h-[180px] w-[180px] animate-float">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Cercle de fond */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e5e7eb" strokeWidth="12" />
                
                {/* Segments avec animation - en utilisant les données réelles */}
                {dashboardData && (
                  <circle 
                    cx="50" cy="50" r="40" fill="transparent" 
                    stroke="#3b82f6" strokeWidth="12" 
                    strokeDasharray={`${dashboardData.averagePerformance * 2.51} 251.2`} strokeDashoffset="0" 
                    transform="rotate(-90 50 50)"
                    className="animate-draw"
                    style={{ 
                      strokeDasharray: 251.2,
                      strokeDashoffset: 251.2,
                      animation: 'draw 1s ease-out forwards',
                      animationDelay: '0.2s'
                    }}
                  />
                )}
                
                {/* Cercle central */}
                <circle cx="50" cy="50" r="30" fill="#111827" className="dark:fill-gray-900" />
              </svg>
              
              {/* Légendes */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Performance</div>
                <div className="text-xl font-bold">
                  {dashboardData ? `${dashboardData.averagePerformance}%` : "0%"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Répartition des utilisateurs par rôle */}
      <Card className="transition-all duration-normal hover:shadow-hover animate-scaleIn" style={{ animationDelay: '200ms' }}>
        <CardHeader>
          <CardTitle>Répartition des utilisateurs par rôle</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData?.roleDistribution ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <RoleCard 
                role="admin" 
                count={dashboardData.roleDistribution.admin || 0} 
                title="Administrateurs" 
                color="bg-blue-500"
              />
              <RoleCard 
                role="teacher" 
                count={dashboardData.roleDistribution.teacher || 0} 
                title="Enseignants" 
                color="bg-green-500"
              />
              <RoleCard 
                role="parent" 
                count={dashboardData.roleDistribution.parent || 0} 
                title="Parents" 
                color="bg-purple-500"
              />
              <RoleCard 
                role="student" 
                count={dashboardData.roleDistribution.student || 0} 
                title="Étudiants" 
                color="bg-amber-500"
              />
              <RoleCard 
                role="pending_parent" 
                count={dashboardData.roleDistribution.pending_parent || 0} 
                title="Parents en attente" 
                color="bg-red-500"
              />
            </div>
          ) : (
            <div className="flex justify-center items-center py-8">
              <p className="text-muted-foreground">Aucune donnée disponible</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Utilisateurs récemment ajoutés */}
      <Card className="transition-all duration-normal hover:shadow-hover animate-scaleIn" style={{ animationDelay: '300ms' }}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Utilisateurs récemment ajoutés</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/admin/users')}
          >
            Voir tous
          </Button>
        </CardHeader>
        <CardContent>
          {dashboardData?.recentUsers && dashboardData.recentUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nom</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Rôle</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Statut</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentUsers.map((user, idx) => (
                    <tr key={user.id} className={cn("border-b transition-colors hover:bg-muted/50", idx % 2 === 0 ? "bg-muted/30" : "bg-transparent") }>
                      <td className="py-3 px-4">
                        <div className="font-medium">{user.firstName} {user.lastName}</div>
                      </td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">{renderRole(user.role)}</td>
                      <td className="py-3 px-4">{renderStatus(user.status)}</td>
                      <td className="py-3 px-4 text-right text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex justify-center items-center py-8">
              <p className="text-muted-foreground">Aucun utilisateur récent</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ActionCard 
          title="Parents en attente" 
          value={dashboardData ? dashboardData.pendingParents.toString() : "0"} 
          description="Demandes à valider"
          icon={<UserCheck className="h-6 w-6 text-white" />}
          bgColor="bg-red-500"
          buttonText="Valider"
          onClick={() => router.push('/admin/users?role=pending_parent&status=en_attente')}
          delay={0}
        />
        <ActionCard 
          title="Utilisateurs actifs" 
          value={dashboardData ? dashboardData.activeUsers.toString() : "0"} 
          description="Comptes utilisateurs"
          icon={<Users className="h-6 w-6 text-white" />}
          bgColor="bg-green-500"
          buttonText="Voir"
          onClick={() => router.push('/admin/users?status=active')}
          delay={100}
        />
        <ActionCard 
          title="Ajouter un utilisateur" 
          value="+" 
          description="Créer un nouveau compte"
          icon={<UserPlus className="h-6 w-6 text-white" />}
          bgColor="bg-blue-500"
          buttonText="Créer"
          onClick={() => router.push('/admin/users/create')}
          delay={200}
        />
        <ActionCard 
          title="Gestion des utilisateurs" 
          value="✓" 
          description="Voir tous les utilisateurs"
          icon={<Check className="h-6 w-6 text-white" />}
          bgColor="bg-amber-500"
          buttonText="Accéder"
          onClick={() => router.push('/admin/users')}
          delay={300}
        />
      </div>
    </div>
  );
}

// Composant pour les cartes de statistiques
function StatCard({ title, value, trend, trendPositive, icon, iconBg, delay = 0 }: {
  title: string;
  value: string | number;
  trend?: string;
  trendPositive?: boolean;
  icon: any;
  iconBg: string;
  delay?: number;
}) {
  return (
    <Card className="transition-all duration-normal hover:shadow-hover hover:-translate-y-1 animate-scaleIn" style={{ animationDelay: `${delay}ms` }}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {trend && (
              <p className={`text-xs mt-1 ${
                trendPositive === true 
                  ? "text-green-600 dark:text-green-400" 
                  : trendPositive === false 
                    ? "text-red-600 dark:text-red-400" 
                    : "text-muted-foreground"
              }`}>
                {trend}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${iconBg} transition-transform hover:scale-110`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Composant pour les cartes d'action
function ActionCard({ title, value, description, icon, bgColor, buttonText, onClick, delay = 0 }: {
  title: string;
  value: string | number;
  description: string;
  icon: any;
  bgColor: string;
  buttonText: string;
  onClick: () => void;
  delay?: number;
}) {
  return (
    <Card className="bg-card dark:bg-card border transition-all duration-normal hover:shadow-hover hover:-translate-y-1 animate-scaleIn" style={{ animationDelay: `${delay}ms` }}>
      <CardContent className="p-6">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-full ${bgColor} transition-transform hover:scale-110 hover:rotate-hover`}>
              {icon}
            </div>
            <span className="text-3xl font-bold">{value}</span>
          </div>
          <h3 className="text-base font-medium mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          <Button 
            className="mt-auto transition-all hover:translate-y-[-2px] hover:shadow-hover active:translate-y-0 active:shadow-active" 
            size="sm"
            onClick={onClick}
          >
            {buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Composant pour la répartition des rôles
function RoleCard({ role, count, title, color }: {
  role: string;
  count: number;
  title: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{title}</p>
        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{count}</p>
      </div>
      <div className={`p-2 rounded-full ${color} text-white text-sm font-medium`}>
        {role}
      </div>
    </div>
  );
}
 