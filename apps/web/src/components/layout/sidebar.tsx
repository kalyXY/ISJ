"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Home, BarChart3, Users, GraduationCap, BookOpen, ClipboardList, Calendar, MessageCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NavigationLoading } from "@/components/ui/navigation-loading";
import { useNavigationLoading } from "@/hooks/use-navigation-loading";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { isLoading, targetRoute, navigateWithLoading } = useNavigationLoading({
    minLoadingTime: 400,
    delay: 150,
    excludeRoutes: ['/login', '/register']
  });
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isOpen && e.target instanceof HTMLElement) {
        const sidebar = document.getElementById("sidebar");
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
    if (window.innerWidth < 768) {
      onClose();
    }
  }, [pathname, onClose]);

  // Navigation items
  const navItems = [
    { href: "/", label: "Accueil", icon: <Home className="h-5 w-5" /> },
    { href: "/dashboard", label: "Tableau de bord", icon: <BarChart3 className="h-5 w-5" /> },
    { href: "/students", label: "Élèves", icon: <Users className="h-5 w-5" /> },
    { href: "/teachers", label: "Enseignants", icon: <GraduationCap className="h-5 w-5" /> },
    { href: "/classes", label: "Classes", icon: <BookOpen className="h-5 w-5" /> },
    { href: "/grades", label: "Notes", icon: <ClipboardList className="h-5 w-5" /> },
    { href: "/schedule", label: "Emploi du temps", icon: <Calendar className="h-5 w-5" /> },
    { href: "/messages", label: "Messages", icon: <MessageCircle className="h-5 w-5" /> },
    { href: "/settings", label: "Paramètres", icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <>
      {/* Navigation Loading */}
      <NavigationLoading isVisible={isLoading} currentRoute={targetRoute} />
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside
        id="sidebar"
        className={cn(
          "fixed md:sticky top-0 md:top-16 z-50 md:z-0",
          "h-screen md:h-[calc(100vh-4rem)] w-[280px]",
          "bg-sidebar border-r border-sidebar-border",
          "flex flex-col",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Mobile header with close button */}
        <div className="flex items-center justify-between h-16 px-4 md:hidden border-b border-sidebar-border">
          <span className="font-heading text-primary text-lg font-bold">École Saint Joseph</span>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <li key={item.href}>
                  <button
                    onClick={() => navigateWithLoading(item.href, item.label)}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-md gap-3 transition-colors w-full text-left",
                      isActive 
                        ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                        : "hover:bg-sidebar-accent text-sidebar-foreground"
                    )}
                    disabled={isLoading}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer (optional) */}
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-center text-muted-foreground">
            École Saint Joseph © {new Date().getFullYear()}
          </p>
        </div>
      </aside>
    </>
  );
} 