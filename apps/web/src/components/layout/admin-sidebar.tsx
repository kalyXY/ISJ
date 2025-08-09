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

  // Admin navigation items with proper structure and grouping
  const navGroups = [
    {
      label: "Vue d'ensemble",
      items: [
        { href: "/admin/dashboard", label: "Tableau de bord", icon: <LayoutDashboard className="h-5 w-5" /> },
      ]
    },
    {
      label: "Gestion des utilisateurs",
      items: [
        { href: "/admin/users", label: "Utilisateurs", icon: <Users className="h-5 w-5" /> },
        { href: "/admin/users/create", label: "Créer un utilisateur", icon: <UserPlus className="h-5 w-5" /> },
      ]
    },
    {
      label: "Gestion académique",
      items: [
        { href: "/admin/students", label: "Étudiants", icon: <School className="h-5 w-5" /> },
        { href: "/admin/teachers", label: "Enseignants", icon: <GraduationCap className="h-5 w-5" /> },
        { href: "/admin/academique", label: "Gestion académique", icon: <BookText className="h-5 w-5" /> },
        { href: "/admin/classes", label: "Classes", icon: <BookOpen className="h-5 w-5" /> },
        { href: "/admin/grades", label: "Notes", icon: <ClipboardList className="h-5 w-5" /> },
        { href: "/admin/schedule", label: "Horaires", icon: <Calendar className="h-5 w-5" /> },
      ]
    },
    {
      label: "Communication",
      items: [
        { href: "/admin/notifications", label: "Notifications", icon: <Bell className="h-5 w-5" /> },
        { href: "/admin/messages", label: "Messages", icon: <MessageCircle className="h-5 w-5" /> },
      ]
    },
    {
      label: "Configuration",
      items: [
        { href: "/admin/settings", label: "Paramètres", icon: <Settings className="h-5 w-5" /> },
      ]
    }
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        className={cn(
          "fixed md:sticky top-0 md:top-0 z-50 md:z-0",
          "h-screen w-[300px]",
          "border-r border-gray-200/60 dark:border-gray-800/60",
          "flex flex-col",
          "transition-all duration-300 ease-out",
          "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl",
          "shadow-xl md:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo and title */}
        <div className="flex items-center h-20 px-6 border-b border-gray-200/60 dark:border-gray-800/60 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-slate-800/50 dark:to-slate-700/50">
          <Link href="/admin/dashboard" className="flex items-center gap-3 transition-all hover:scale-[1.02] group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
              <School className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                Saint Joseph
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Administration
              </span>
            </div>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="absolute right-4 top-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
          <nav className="px-4 space-y-8">
            {navGroups.map((group, groupIndex) => (
              <div key={group.label} className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3">
                  {group.label}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item, index) => {
                    const isActive = pathname === item.href;
                    
                    return (
                      <Link 
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center px-3 py-3 rounded-xl gap-3 text-sm font-medium",
                          "transition-all duration-200 group relative",
                          isActive 
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25" 
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white"
                        )}
                        style={{ 
                          animationDelay: `${(groupIndex * 100) + (index * 50)}ms`
                        }}
                        onMouseEnter={() => {
                          // Prefetch route on hover for instant navigation
                          if (!isActive) {
                            prefetchRoute(item.href);
                          }
                        }}
                        prefetch={true}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                        )}
                        
                        <span className={cn(
                          "transition-all duration-200 flex-shrink-0",
                          isActive ? "scale-110 text-white" : "group-hover:scale-110 group-hover:text-blue-600"
                        )}>
                          {item.icon}
                        </span>
                        <span className="flex-1">{item.label}</span>
                        
                        {/* Hover effect */}
                        {!isActive && (
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-200" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200/60 dark:border-gray-800/60 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-slate-800/50 dark:to-slate-700/50">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              École Saint Joseph
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
} 