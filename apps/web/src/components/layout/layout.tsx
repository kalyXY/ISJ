"use client";

import React, { type ReactNode, useState } from "react";
import Header from "./header";
import Sidebar from "./sidebar";
import MobileNav from "./mobile-nav";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - visible on all devices */}
      <Header onMenuClick={toggleSidebar} />

      <div className="flex flex-1 relative">
        {/* Sidebar - visible on desktop, hidden on mobile until toggled */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 pt-4 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Navigation - visible only on mobile */}
      <MobileNav />
    </div>
  );
} 