"use client";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import { useAuth } from "@/lib/auth";
import { School } from "lucide-react";

export default function Header() {
  const { user } = useAuth();

  // Déterminer dynamiquement la route du tableau de bord selon le rôle
  const dashboardPath = user?.role === "admin"
    ? "/admin/dashboard"
    : user?.role === "pending_parent"
      ? "/pending-account"
      : "/";

  const links = [
    { to: "/", label: "Accueil" },
    { to: dashboardPath, label: "Tableau de bord" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2 mr-4">
          <Link href="/" className="flex items-center space-x-2">
            <School className="h-6 w-6 text-primary" />
            <span className="hidden font-heading font-bold text-lg md:inline-block">
              École Saint Joseph
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 ml-6">
            {links.map(({ to, label }) => (
              <Link 
                key={to} 
                href={to} 
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            ))}
        </nav>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
