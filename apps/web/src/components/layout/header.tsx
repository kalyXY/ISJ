"use client";

import React from "react";
import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type ModeToggle } from "@/components/mode-toggle";
import UserMenu from "@/components/user-menu";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-background border-b border-border h-16 px-4 md:px-6">
      <div className="h-full max-w-screen-2xl mx-auto flex items-center justify-between">
        {/* Left section: Menu button (mobile) and Logo */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link href="/" className="flex items-center gap-2">
            <span className="font-heading text-primary text-lg font-bold">École Saint Joseph</span>
          </Link>
        </div>

        {/* Center section: Breadcrumb (optional) */}
        <div className="hidden md:flex items-center">
          {/* Add breadcrumb navigation here if needed */}
        </div>

        {/* Right section: Search, Theme toggle, User menu */}
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" aria-label="Recherche">
            <Search className="h-5 w-5" />
          </Button>

          <ModeToggle />
          
          <UserMenu />
        </div>
      </div>
    </header>
  );
} 