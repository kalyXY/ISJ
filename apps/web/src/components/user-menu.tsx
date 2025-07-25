"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { 
  User,
  LogOut,
  Settings,
  UserCog,
  Users,
  FileText,
  School,
  LayoutDashboard
} from "lucide-react";

export default function UserMenu() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  if (!user) {
    return (
      <Button variant="default" size="sm" asChild>
        <Link href="/login">Connexion</Link>
      </Button>
    );
  }

  // Afficher les initiales du nom
  const initials = user.firstName && user.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user.email.substring(0, 2).toUpperCase();

  // Déterminer le nom à afficher
  const displayName = user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}` 
    : user.email.split('@')[0];

  // Gérer la déconnexion
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-9 w-9 rounded-full bg-muted flex items-center justify-center"
        >
          <span className="text-xs font-medium">{initials}</span>
          <span className="sr-only">Menu utilisateur</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {user.role === 'admin' && (
          <>
            <DropdownMenuItem className="flex items-center gap-2" asChild>
              <Link href="/admin/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                <span>Tableau de bord</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2" asChild>
              <Link href="/admin/users">
                <Users className="h-4 w-4" />
                <span>Utilisateurs</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2" asChild>
              <Link href="/admin/students">
                <School className="h-4 w-4" />
                <span>Élèves</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem className="flex items-center gap-2" asChild>
          <Link href="/profile">
            <User className="h-4 w-4" />
            <span>Mon profil</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="flex items-center gap-2" asChild>
          <Link href="/settings">
            <Settings className="h-4 w-4" />
            <span>Paramètres</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
