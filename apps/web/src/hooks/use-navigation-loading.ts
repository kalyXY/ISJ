import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface UseNavigationLoadingOptions {
  /** Délai minimum d'affichage du loader (en ms) */
  minLoadingTime?: number;
  /** Délai avant d'afficher le loader (en ms) */
  delay?: number;
  /** Routes à exclure du loader */
  excludeRoutes?: string[];
}

export function useNavigationLoading(options: UseNavigationLoadingOptions = {}) {
  const {
    minLoadingTime = 500,
    delay = 100,
    excludeRoutes = []
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [targetRoute, setTargetRoute] = useState<string | null>(null);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  
  const router = useRouter();
  const pathname = usePathname();

  // Fonction pour démarrer le chargement
  const startLoading = useCallback((route: string) => {
    // Vérifier si la route doit être exclue
    if (excludeRoutes.some(excluded => route.includes(excluded))) {
      return;
    }

    // Démarrer le timer de délai
    const delayTimer = setTimeout(() => {
      setIsLoading(true);
      setTargetRoute(route);
      setLoadingStartTime(Date.now());
    }, delay);

    // Nettoyer le timer si le composant est démonté rapidement
    return () => clearTimeout(delayTimer);
  }, [delay, excludeRoutes]);

  // Fonction pour arrêter le chargement
  const stopLoading = useCallback(() => {
    const endLoading = () => {
      setIsLoading(false);
      setTargetRoute(null);
      setLoadingStartTime(null);
    };

    // Si on a un temps de début, s'assurer qu'on respecte le temps minimum
    if (loadingStartTime) {
      const elapsed = Date.now() - loadingStartTime;
      const remaining = minLoadingTime - elapsed;
      
      if (remaining > 0) {
        setTimeout(endLoading, remaining);
      } else {
        endLoading();
      }
    } else {
      endLoading();
    }
  }, [loadingStartTime, minLoadingTime]);

  // Fonction de navigation avec loading
  const navigateWithLoading = useCallback((href: string, label?: string) => {
    // Éviter le loading si on navigue vers la même page
    if (href === pathname) {
      return;
    }

    // Démarrer le loading
    const cleanup = startLoading(label || href);
    
    // Effectuer la navigation
    router.push(href);

    return cleanup;
  }, [router, pathname, startLoading]);

  // Écouter les changements de route pour arrêter le loading
  useEffect(() => {
    if (isLoading) {
      // Arrêter le loading quand la route change
      stopLoading();
    }
  }, [pathname]); // Ne pas inclure stopLoading dans les dépendances pour éviter les boucles

  // Nettoyer le loading si le composant est démonté
  useEffect(() => {
    return () => {
      if (isLoading) {
        setIsLoading(false);
        setTargetRoute(null);
        setLoadingStartTime(null);
      }
    };
  }, []);

  return {
    isLoading,
    targetRoute,
    navigateWithLoading,
    startLoading,
    stopLoading
  };
}

export default useNavigationLoading;