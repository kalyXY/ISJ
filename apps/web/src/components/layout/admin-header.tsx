"use client";

import React from "react";
import Link from "next/link";
import { Menu, Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import UserMenu from "@/components/user-menu";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  
  // Déterminer le titre de la page en fonction du chemin
  const getPageTitle = () => {
    if (pathname === '/admin/dashboard') return 'Tableau de bord';
    if (pathname === '/admin/users') return 'Gestion des utilisateurs';
    if (pathname === '/admin/users/create') return 'Créer un utilisateur';
    if (pathname === '/admin/students') return 'Gestion des élèves';
    if (pathname === '/admin/teachers') return 'Gestion des enseignants';
    if (pathname.includes('/admin/classes')) return 'Gestion des classes';
    if (pathname.includes('/admin/grades')) return 'Gestion des notes';
    if (pathname.includes('/admin/schedule')) return 'Emploi du temps';
    if (pathname.includes('/admin/messages')) return 'Messagerie';
    if (pathname.includes('/admin/settings')) return 'Paramètres';
    return 'Administration';
  };

  // Fonction pour obtenir la description de la page
  const getPageDescription = () => {
    if (pathname === '/admin/dashboard') return 'Vue d\'ensemble de votre école';
    if (pathname === '/admin/users') return 'Gérez les comptes utilisateurs';
    if (pathname === '/admin/users/create') return 'Ajoutez un nouvel utilisateur';
    if (pathname === '/admin/students') return 'Gérez les profils étudiants';
    if (pathname === '/admin/teachers') return 'Gérez les profils enseignants';
    if (pathname.includes('/admin/classes')) return 'Organisez les classes et sections';
    if (pathname.includes('/admin/grades')) return 'Suivez les notes et évaluations';
    if (pathname.includes('/admin/schedule')) return 'Planifiez les cours et activités';
    if (pathname.includes('/admin/messages')) return 'Communication avec la communauté';
    if (pathname.includes('/admin/settings')) return 'Configuration du système';
    return 'Panneau d\'administration';
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60 shadow-sm">
      <div className="h-20 px-4 md:px-8 flex items-center justify-between">
        {/* Left section: Menu button (mobile) and Title */}
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-110"
            onClick={onMenuClick}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {getPageTitle()}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
              {getPageDescription()}
            </p>
          </div>
        </div>

        {/* Center section: Search */}
        <div className="hidden lg:flex flex-1 max-w-lg mx-8">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-blue-500" />
            <Input 
              type="search" 
              placeholder="Rechercher dans l'administration..." 
              className="pl-12 h-12 bg-gray-50/80 dark:bg-gray-800/80 border-gray-200/60 dark:border-gray-700/60 focus:border-blue-500 dark:focus:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/20 rounded-xl transition-all duration-200"
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-focus-within:from-blue-500/5 group-focus-within:to-purple-500/5 transition-all duration-200 pointer-events-none" />
          </div>
        </div>

        {/* Right section: Actions and User menu */}
        <div className="flex items-center gap-3">
          {/* Search button for mobile */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-110"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-110 relative group"
          >
            <Bell className="h-5 w-5" />
            {/* Notification indicator */}
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping" />
          </Button>

          {/* Theme toggle */}
          <div className="hidden sm:block">
            <ModeToggle />
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-600" />

          {/* User menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
} 