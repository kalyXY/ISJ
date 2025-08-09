import React from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

interface NavigationLoadingProps {
  isVisible: boolean;
  currentRoute?: string | null;
  className?: string;
}

export function NavigationLoading({ isVisible, currentRoute, className }: NavigationLoadingProps) {
  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center",
        "transition-all duration-300 ease-out",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label="Chargement du module en cours"
    >
      <div className="bg-card border border-border rounded-xl shadow-2xl p-8 flex flex-col items-center space-y-6 max-w-[300px] text-center animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Logo ou icône de l'école */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <Spinner size="md" color="white" thickness="regular" />
          </div>
        </div>
        
        {/* Message de chargement */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Chargement du module
          </h3>
          <p className="text-sm text-muted-foreground">
            {currentRoute ? `Accès à ${currentRoute}` : 'Préparation de la page...'}
          </p>
        </div>

        {/* Barre de progression animée */}
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full" 
               style={{
                 animation: 'loading-progress 1.5s ease-in-out infinite'
               }} />
        </div>
      </div>
    </div>
  );
}

export default NavigationLoading;