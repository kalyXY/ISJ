'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface UseNavigationLoadingOptions {
  /** Temps minimum d'affichage du loader en ms */
  minLoadingTime?: number;
  /** Délai avant affichage du loader en ms */
  delay?: number;
  /** Routes à exclure du loader */
  excludeRoutes?: string[];
  /** Activer le préchargement intelligent */
  enablePrefetch?: boolean;
}

export function useNavigationLoading(options: UseNavigationLoadingOptions = {}) {
  const {
    minLoadingTime = 300, // Réduit de 500ms à 300ms
    delay = 50, // Réduit de 100ms à 50ms
    excludeRoutes = [],
    enablePrefetch = true
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [targetRoute, setTargetRoute] = useState<string | null>(null);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [prefetchedRoutes, setPrefetchedRoutes] = useState<Set<string>>(new Set());
  
  const router = useRouter();
  const pathname = usePathname();

  // Fonction optimisée pour démarrer le chargement
  const startLoading = useCallback((route: string) => {
    // Vérifier si la route doit être exclue
    if (excludeRoutes.some(excluded => route.includes(excluded))) {
      return;
    }

    // Si la route est déjà préchargée, réduire le délai
    const effectiveDelay = prefetchedRoutes.has(route) ? 0 : delay;

    // Démarrer le timer de délai
    const delayTimer = setTimeout(() => {
      setIsLoading(true);
      setTargetRoute(route);
      setLoadingStartTime(Date.now());
    }, effectiveDelay);

    // Nettoyer le timer si le composant est démonté rapidement
    return () => clearTimeout(delayTimer);
  }, [delay, excludeRoutes, prefetchedRoutes]);

  // Fonction optimisée pour arrêter le chargement
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

  // Fonction de préchargement optimisée
  const prefetchRoute = useCallback((href: string) => {
    if (!enablePrefetch || prefetchedRoutes.has(href)) {
      return;
    }

    // Précharger la route
    router.prefetch(href);
    setPrefetchedRoutes(prev => new Set(prev).add(href));
  }, [router, enablePrefetch, prefetchedRoutes]);

  // Fonction de navigation avec loading optimisée
  const navigateWithLoading = useCallback((href: string, label?: string) => {
    // Éviter le loading si on navigue vers la même page
    if (href === pathname) {
      return;
    }

    // Précharger la route si pas déjà fait
    prefetchRoute(href);

    // Démarrer le loading
    const cleanup = startLoading(label || href);
    
    // Effectuer la navigation
    router.push(href);

    return cleanup;
  }, [router, pathname, startLoading, prefetchRoute]);

  // Préchargement automatique des routes principales
  useEffect(() => {
    if (!enablePrefetch) return;

    const mainRoutes = [
      '/admin/dashboard',
      '/admin/users',
      '/admin/students',
      '/admin/teachers',
      '/admin/academique',
      '/admin/classes/assignment'
    ];

    // Précharger avec un délai pour ne pas bloquer le rendu initial
    const timer = setTimeout(() => {
      mainRoutes.forEach(route => {
        if (!prefetchedRoutes.has(route)) {
          router.prefetch(route);
          setPrefetchedRoutes(prev => new Set(prev).add(route));
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [router, enablePrefetch, prefetchedRoutes]);

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
    stopLoading,
    prefetchRoute,
    prefetchedRoutes: Array.from(prefetchedRoutes)
  };
}

export default useNavigationLoading;