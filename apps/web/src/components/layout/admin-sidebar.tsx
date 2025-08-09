"use client";

import React, { useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  X, 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  School,
  ClipboardList, 
  Calendar, 
  MessageCircle, 
  Settings,
  UserPlus,
  BookOpen,
  Bell,
  BookText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Prefetch routes for better performance
  const prefetchRoute = useCallback((href: string) => {
    router.prefetch(href);
  }, [router]);
  
  // Prefetch all navigation routes on component mount
  useEffect(() => {
    const routesToPrefetch = [
      "/admin/dashboard",
      "/admin/users", 
      "/admin/users/create",
      "/admin/students",
      "/admin/teachers",
      "/admin/academique"
    ];
    
    // Prefetch routes with a slight delay to avoid blocking initial render
    const timer = setTimeout(() => {
      routesToPrefetch.forEach(route => prefetchRoute(route));
    }, 100);
    
    return () => clearTimeout(timer);
  }, [prefetchRoute]);
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isOpen && e.target instanceof HTMLElement) {
        const sidebar = document.getElementById("admin-sidebar");
        if (sidebar && !sidebar.contains(e.target)) {
          onClose();
        }
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      onClose();
    }
  }, [pathname, onClose]);

  // Admin navigation items with proper structure
  const navItems = [
    { href: "/admin/dashboard", label: "Tableau de bord", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: "/admin/users", label: "Utilisateurs", icon: <Users className="h-5 w-5" /> },
    { href: "/admin/users/create", label: "Créer un utilisateur", icon: <UserPlus className="h-5 w-5" /> },
    { href: "/admin/students", label: "Étudiants", icon: <School className="h-5 w-5" /> },
    { href: "/admin/teachers", label: "Enseignants", icon: <GraduationCap className="h-5 w-5" /> },
    { href: "/admin/academique", label: "Gestion académique", icon: <BookText className="h-5 w-5" /> },
    { href: "/admin/classes", label: "Classes", icon: <BookOpen className="h-5 w-5" /> },
    { href: "/admin/grades", label: "Notes", icon: <ClipboardList className="h-5 w-5" /> },
    { href: "/admin/schedule", label: "Horaires", icon: <Calendar className="h-5 w-5" /> },
    { href: "/admin/notifications", label: "Notifications", icon: <Bell className="h-5 w-5" /> },
    { href: "/admin/messages", label: "Messages", icon: <MessageCircle className="h-5 w-5" /> },
    { href: "/admin/settings", label: "Paramètres", icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        className={cn(
          "fixed md:sticky top-0 md:top-0 z-40 md:z-0",
          "h-screen w-[280px]",
          "bg-background border-r border-border",
          "flex flex-col",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0 shadow-xl" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo and title */}
        <div className="flex items-center h-16 px-4 border-b border-border">
          <Link href="/admin/dashboard" className="flex items-center gap-2 hover:opacity-90">
            <span className="font-heading text-lg font-semibold">
              Institut Saint Joseph
            </span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="absolute right-2 top-2 md:hidden"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="px-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md gap-3",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onMouseEnter={() => {
                    if (!isActive) prefetchRoute(item.href);
                  }}
                  prefetch={true}
                >
                  <span>{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <p className="text-xs text-center text-muted-foreground">
            École Saint Joseph © {new Date().getFullYear()}
          </p>
        </div>
      </aside>
    </>
  );
} 