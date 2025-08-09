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
      <div className="min-h-screen flex bg-gray-50/50 dark:bg-slate-950">
        {/* Sidebar - visible on desktop, hidden on mobile until toggled */}
        <AdminSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header - visible on all devices */}
          <AdminHeader onMenuClick={toggleSidebar} />
          
          {/* Main content */}
          <main className="flex-1 p-4 md:p-8 overflow-auto bg-gradient-to-br from-gray-50/50 via-white/50 to-gray-100/50 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-800/30">
            <div className="mx-auto max-w-7xl space-y-8">
              {children}
            </div>
          </main>
          
          {/* Footer */}
          <footer className="py-6 px-8 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2">
              <span className="font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                École Saint Joseph
              </span>
              <span>•</span>
              <span>© {new Date().getFullYear()}</span>
              <span>•</span>
              <span>Tous droits réservés</span>
            </div>
          </footer>
        </div>
      </div>
    </AdminGuard>
  );
}