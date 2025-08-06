"use client";

import { type ReactNode } from "react";
import { type UserRole, useRequireAuth } from "@/lib/auth";
import Spinner from "@/components/ui/spinner";

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  fallback?: ReactNode;
}

export function AuthGuard({ 
  children, 
  allowedRoles = [], 
  fallback
}: AuthGuardProps) {
  const { isLoading, isAuthorized } = useRequireAuth(allowedRoles);

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return fallback || (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size="lg" color="primary" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  // Afficher le contenu si l'utilisateur est autorisé
  if (isAuthorized) {
    return <>{children}</>;
  }

  // Fallback si l'utilisateur n'est pas autorisé (ne devrait pas arriver grâce à useRequireAuth)
  return fallback || null;
}

// Composant spécifique pour le rôle admin
export function AdminGuard({ children, fallback }: Omit<AuthGuardProps, "allowedRoles">) {
  return (
    <AuthGuard allowedRoles={["admin"]} fallback={fallback}>
      {children}
    </AuthGuard>
  );
}

// Composant spécifique pour les parents en attente
export function PendingParentGuard({ children, fallback }: Omit<AuthGuardProps, "allowedRoles">) {
  return (
    <AuthGuard allowedRoles={["parent_attente"]} fallback={fallback}>
      {children}
    </AuthGuard>
  );
}