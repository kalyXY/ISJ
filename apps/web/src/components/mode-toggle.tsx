"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Monitor } from "lucide-react";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 focus-visible:ring-2 focus-visible:ring-blue-500/20"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-amber-500" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-blue-400" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="min-w-[160px] p-2 border border-gray-200/60 dark:border-gray-800/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl rounded-xl"
      >
        <DropdownMenuItem 
          className="flex items-center gap-3 cursor-pointer px-3 py-3 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200 group"
          onClick={() => setTheme("light")}
        >
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sun className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">Clair</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Mode jour</span>
          </div>
          {theme === "light" && (
            <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex items-center gap-3 cursor-pointer px-3 py-3 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200 group"
          onClick={() => setTheme("dark")}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Moon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">Sombre</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Mode nuit</span>
          </div>
          {theme === "dark" && (
            <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex items-center gap-3 cursor-pointer px-3 py-3 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200 group"
          onClick={() => setTheme("system")}
        >
          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Monitor className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">Système</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Auto</span>
          </div>
          {theme === "system" && (
            <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
