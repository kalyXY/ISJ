"use client";

import { ReactNode } from "react";
import { UserRole, useAuth } from "@/lib/auth";

interface RoleBasedProps {
  children: ReactNode;
  roles: UserRole[];
  fallback?: ReactNode;
}

// Composant pour afficher du contenu uniquement pour certains rôles
export function RoleBasedContent({ children, roles, fallback = null }: RoleBasedProps) {
  const { hasRole, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return fallback;
  }
  
  if (hasRole(roles)) {
    return <>{children}</>;
  }
  
  return fallback;
}

// Composant pour afficher du contenu uniquement pour les administrateurs
export function AdminContent({ children, fallback }: Omit<RoleBasedProps, "roles">) {
  return (
    <RoleBasedContent roles={["admin"]} fallback={fallback}>
      {children}
    </RoleBasedContent>
  );
}

// Composant pour afficher du contenu uniquement pour les enseignants
export function TeacherContent({ children, fallback }: Omit<RoleBasedProps, "roles">) {
  return (
    <RoleBasedContent roles={["enseignant"]} fallback={fallback}>
      {children}
    </RoleBasedContent>
  );
}

// Composant pour afficher du contenu uniquement pour les élèves
export function StudentContent({ children, fallback }: Omit<RoleBasedProps, "roles">) {
  return (
    <RoleBasedContent roles={["eleve"]} fallback={fallback}>
      {children}
    </RoleBasedContent>
  );
}

// Composant pour afficher du contenu uniquement pour les parents
export function ParentContent({ children, fallback }: Omit<RoleBasedProps, "roles">) {
  return (
    <RoleBasedContent roles={["parent"]} fallback={fallback}>
      {children}
    </RoleBasedContent>
  );
}

// Composant pour afficher du contenu uniquement pour les administrateurs ou les enseignants
export function AdminOrTeacherContent({ children, fallback }: Omit<RoleBasedProps, "roles">) {
  return (
    <RoleBasedContent roles={["admin", "teacher"]} fallback={fallback}>
      {children}
    </RoleBasedContent>
  );
} 