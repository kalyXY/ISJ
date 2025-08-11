"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminSummary } from '@/services/dashboard';

interface QuickStatsProps {
  className?: string;
}

export default function QuickStats({ className }: QuickStatsProps) {
  const { data, isLoading } = useAdminSummary();

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Actions rapides</CardTitle>
          <CardDescription>Statistiques et accès rapides</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-md">
              <p className="text-sm text-blue-600 dark:text-blue-100">Parents en attente</p>
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">
                  {data?.pendingParents || 0}
                </p>
              )}
            </div>
            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-md">
              <p className="text-sm text-green-600 dark:text-green-100">Utilisateurs actifs</p>
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-green-700 dark:text-green-200">
                  {data?.activeUsers || 0}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <a href="/admin/users/create" className="block w-full bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded hover:bg-blue-700 dark:hover:bg-blue-600 text-center transition-colors">
              Ajouter un utilisateur
            </a>
            <a href="/admin/parents/pending" className="block w-full bg-green-600 dark:bg-green-700 text-white py-2 px-4 rounded hover:bg-green-700 dark:hover:bg-green-600 text-center transition-colors">
              Valider les parents
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}