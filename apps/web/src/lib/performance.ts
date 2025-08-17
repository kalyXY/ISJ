/**
 * Performance monitoring utilities
 * Helps identify performance bottlenecks in the application
 */

// Performance measurement utility
export class PerformanceMonitor {
  private static measurements: Map<string, number> = new Map();
  private static marks: Set<string> = new Set();

  static mark(name: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(name);
      this.marks.add(name);
    }
    this.measurements.set(name, Date.now());
  }

  static measure(name: string, startMark: string): number {
    const startTime = this.measurements.get(startMark);
    if (!startTime) {
      console.warn(`Start mark "${startMark}" not found`);
      return 0;
    }

    const duration = Date.now() - startTime;
    
    if (typeof window !== 'undefined' && window.performance) {
      try {
        window.performance.measure(name, startMark);
      } catch (error) {
        console.warn('Performance measurement failed:', error);
      }
    }

    console.log(`🔥 Performance: ${name} took ${duration}ms`);
    return duration;
  }

  static getPerformanceEntries(): PerformanceEntry[] {
    if (typeof window !== 'undefined' && window.performance) {
      return window.performance.getEntriesByType('measure');
    }
    return [];
  }

  static logNavigationTiming(): void {
    if (typeof window === 'undefined' || !window.performance.navigation) {
      return;
    }

    const navigation = window.performance.navigation;
    const timing = window.performance.timing;

    const metrics = {
      'DNS Lookup': timing.domainLookupEnd - timing.domainLookupStart,
      'TCP Connection': timing.connectEnd - timing.connectStart,
      'Request': timing.responseStart - timing.requestStart,
      'Response': timing.responseEnd - timing.responseStart,
      'DOM Processing': timing.domComplete - timing.domLoading,
      'Total Load Time': timing.loadEventEnd - timing.navigationStart,
    };

    console.group('🚀 Navigation Performance');
    Object.entries(metrics).forEach(([name, time]) => {
      console.log(`${name}: ${time}ms`);
    });
    console.groupEnd();
  }

  // Nouvelle méthode pour mesurer le temps de rendu des composants
  static measureComponentRender(componentName: string): () => void {
    const startTime = Date.now();
    const markName = `${componentName}-render-start`;
    
    this.mark(markName);
    
    return () => {
      const duration = Date.now() - startTime;
      console.log(`⚡ Component ${componentName} rendered in ${duration}ms`);
      
      if (duration > 100) {
        console.warn(`⚠️ Slow component render: ${componentName} took ${duration}ms`);
      }
    };
  }

  // Méthode pour mesurer les requêtes API
  static measureApiCall(endpoint: string): () => void {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      console.log(`🌐 API ${endpoint} completed in ${duration}ms`);
      
      if (duration > 2000) {
        console.warn(`⚠️ Slow API call: ${endpoint} took ${duration}ms`);
      }
    };
  }
}

// React Query performance monitoring
export function logQueryPerformance(queryKey: unknown[], duration: number): void {
  if (duration > 1000) {
    console.warn(`🐌 Slow query: ${JSON.stringify(queryKey)} took ${duration}ms`);
  } else {
    console.log(`⚡ Query ${JSON.stringify(queryKey)} completed in ${duration}ms`);
  }
}

// Component render tracking
export function withPerformanceTracking<T extends {}>(
  Component: React.ComponentType<T>,
  componentName: string
): React.ComponentType<T> {
  return function PerformanceTrackedComponent(props: T) {
    React.useEffect(() => {
      PerformanceMonitor.mark(`${componentName}-render-start`);
      return () => {
        PerformanceMonitor.measure(`${componentName}-render`, `${componentName}-render-start`);
      };
    });

    return React.createElement(Component, props);
  };
}

// Route change performance tracking
export function trackRouteChange(from: string, to: string): void {
  const startTime = Date.now();
  
  return () => {
    const duration = Date.now() - startTime;
    console.log(`🔄 Route change: ${from} → ${to} in ${duration}ms`);
    
    if (duration > 500) {
      console.warn(`⚠️ Slow route change: ${from} → ${to} took ${duration}ms`);
    }
  };
}

// Nouveau: Optimisations de performance pour les listes
export function optimizeListRendering<T>(
  items: T[],
  keyExtractor: (item: T, index: number) => string,
  renderItem: (item: T, index: number) => React.ReactNode,
  options: {
    chunkSize?: number;
    delay?: number;
  } = {}
): React.ReactNode[] {
  const { chunkSize = 50, delay = 10 } = options;
  
  return items.map((item, index) => {
    const key = keyExtractor(item, index);
    
    // Utiliser React.memo pour éviter les re-renders inutiles
    const MemoizedItem = React.memo(() => renderItem(item, index));
    
    return (
      <div key={key} style={{ animationDelay: `${(index % chunkSize) * delay}ms` }}>
        <MemoizedItem />
      </div>
    );
  });
}

// Nouveau: Debounce utility pour les recherches
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Nouveau: Throttle utility pour les événements fréquents
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Nouveau: Lazy loading utility
export function createLazyLoader<T>(
  loader: () => Promise<T>,
  options: {
    cacheTime?: number;
    retryCount?: number;
  } = {}
): () => Promise<T> {
  const { cacheTime = 5 * 60 * 1000, retryCount = 2 } = options;
  let cachedData: T | null = null;
  let cacheTimeStamp: number = 0;
  let loadingPromise: Promise<T> | null = null;

  return async (): Promise<T> => {
    // Retourner les données en cache si elles sont encore valides
    if (cachedData && Date.now() - cacheTimeStamp < cacheTime) {
      return cachedData;
    }

    // Si déjà en cours de chargement, retourner la promesse existante
    if (loadingPromise) {
      return loadingPromise;
    }

    // Créer une nouvelle promesse de chargement
    loadingPromise = (async () => {
      let lastError: Error;
      
      for (let i = 0; i <= retryCount; i++) {
        try {
          const data = await loader();
          cachedData = data;
          cacheTimeStamp = Date.now();
          return data;
        } catch (error) {
          lastError = error as Error;
          if (i < retryCount) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      }
      
      throw lastError!;
    })();

    try {
      return await loadingPromise;
    } finally {
      loadingPromise = null;
    }
  };
}

import React from 'react';