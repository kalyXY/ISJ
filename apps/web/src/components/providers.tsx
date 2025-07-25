"use client";

import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/auth";

export default function Providers({
  children
}: {
  children: React.ReactNode
}) {
  // Vérifier l'authentification au chargement de l'application
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const authChecked = useRef(false);
  
  useEffect(() => {
    // Éviter les vérifications multiples
    if (authChecked.current) return;
    
    // Récupérer le token du localStorage ou des cookies (côté client uniquement)
    if (typeof window !== 'undefined') {
      // Vérifier si un token existe dans les cookies
      const hasCookieToken = document.cookie.split(';').some(c => c.trim().startsWith('token='));
      // Vérifier si un token existe dans localStorage
      const localToken = localStorage.getItem('auth-token');
      
      // Vérifier l'authentification si un token existe dans l'un ou l'autre
      if ((hasCookieToken || localToken) && !authChecked.current) {
        console.log("🔒 Token trouvé, vérification de l'authentification...");
        checkAuth();
        authChecked.current = true;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dépendance vide pour n'exécuter qu'au montage du composant
  
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      themes={["light", "dark", "contrast", "system"]}
    >
      {children}
      <Toaster richColors />
    </ThemeProvider>
  );
}
