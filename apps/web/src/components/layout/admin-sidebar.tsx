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
  
  // Prefetch important routes on component mount
  useEffect(() => {
    const importantRoutes = [
      "/admin/dashboard",
      "/admin/users",
      "/admin/students",
      "/admin/teachers"
    ];
    
    // Prefetch with a small delay to avoid blocking initial render
    const timer = setTimeout(() => {
      importantRoutes.forEach(route => prefetchRoute(route));
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
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fadeIn"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        className={cn(
          "fixed md:sticky top-0 md:top-0 z-50 md:z-0",
          "h-screen w-[280px]",
          "border-r border-sidebar-border",
          "flex flex-col",
          "transition-all duration-normal ease-out",
          isOpen ? "translate-x-0 shadow-xl" : "-translate-x-full md:translate-x-0"
        )}
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          color: 'var(--sidebar-fg)'
        }}
      >
        {/* Logo and title */}
        <div className="flex items-center h-16 px-6 border-b border-sidebar-border">
          <Link href="/admin/dashboard" className="flex items-center gap-2 transition-all hover:scale-[1.02]">
            <span className="font-heading text-xl font-bold text-sidebar-fg">
              Institut Saint Joseph
            </span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="absolute right-2 top-2 text-sidebar-fg hover:bg-sidebar-hover hover:scale-110 transition-all md:hidden"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6 overflow-y-auto">
          <nav className="px-3 space-y-1">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;
              
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md gap-3 sidebar-item",
                    "transition-all duration-normal",
                    isActive 
                      ? "bg-sidebar-active text-sidebar-active-fg shadow-sm" 
                      : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-fg"
                  )}
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    transform: isActive ? 'translateX(4px)' : 'none'
                  }}
                  onMouseEnter={() => {
                    // Prefetch route on hover for instant navigation
                    if (!isActive) {
                      prefetchRoute(item.href);
                    }
                  }}
                  prefetch={false} // We handle prefetch manually
                >
                  <span className={cn(
                    "transition-transform duration-normal",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-center text-sidebar-muted hover:text-sidebar-fg transition-colors">
            École Saint Joseph © {new Date().getFullYear()}
          </p>
        </div>
      </aside>
    </>
  );
} 