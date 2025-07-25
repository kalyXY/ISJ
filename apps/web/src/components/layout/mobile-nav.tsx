"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, Users, Calendar, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const pathname = usePathname();
  
  // Mobile navigation items (limited to 5 most important)
  const navItems = [
    { href: "/", label: "Accueil", icon: <Home className="h-6 w-6" /> },
    { href: "/dashboard", label: "Tableau", icon: <BarChart3 className="h-6 w-6" /> },
    { href: "/students", label: "Élèves", icon: <Users className="h-6 w-6" /> },
    { href: "/schedule", label: "Emploi", icon: <Calendar className="h-6 w-6" /> },
    { href: "/messages", label: "Messages", icon: <MessageCircle className="h-6 w-6" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border h-16">
      <div className="grid grid-cols-5 h-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
} 