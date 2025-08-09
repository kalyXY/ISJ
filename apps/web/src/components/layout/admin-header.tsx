"use client";

import React from "react";
import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type ModeToggle } from "@/components/mode-toggle";
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

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 h-16 shadow-sm">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Left section: Menu button (mobile) and Title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-700 dark:text-gray-200"
            onClick={onMenuClick}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <h1 className="text-lg font-medium md:ml-2">{getPageTitle()}</h1>
        </div>

        {/* Center section: Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              type="search" 
              placeholder="Rechercher..." 
              className="pl-10 h-9 bg-gray-100 dark:bg-gray-800 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Right section: Theme toggle, User menu */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
} 