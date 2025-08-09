"use client";

import { type ReactNode, useState } from "react";
import { AdminGuard } from "@/components/auth-guard";
import AdminHeader from "./admin-header";
import AdminSidebar from "./admin-sidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <AdminGuard>
      <div className="min-h-screen flex bg-background">
        {/* Sidebar - visible on desktop, hidden on mobile until toggled */}
        <AdminSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Header - visible on all devices */}
          <AdminHeader onMenuClick={toggleSidebar} />
          
          {/* Main content */}
          <main className="flex-1 p-4 md:p-6 overflow-auto bg-background">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="py-4 px-6 text-center text-xs text-muted-foreground border-t border-border">
            © {new Date().getFullYear()} École Saint Joseph - Tous droits réservés
          </footer>
        </div>
      </div>
    </AdminGuard>
  );
}