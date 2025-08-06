/**
 * Performance monitoring utilities
 * Helps identify performance bottlenecks in the application
 */

// Performance measurement utility
export class PerformanceMonitor {
  private static measurements: Map<string, number> = new Map();

  static mark(name: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(name);
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
}

// React Query performance monitoring
export function logQueryPerformance(queryKey: unknown[], duration: number): void {
  if (duration > 1000) {
    console.warn(`🐌 Slow query detected: ${JSON.stringify(queryKey)} took ${duration}ms`);
  } else if (duration > 500) {
    console.log(`⚠️  Moderate query: ${JSON.stringify(queryKey)} took ${duration}ms`);
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
  
  // Use requestIdleCallback or setTimeout as fallback
  const callback = () => {
    const duration = Date.now() - startTime;
    console.log(`🛣️  Route change from ${from} to ${to} took ${duration}ms`);
    
    if (duration > 2000) {
      console.warn(`🐌 Slow route change detected: ${duration}ms`);
    }
  };

  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(callback);
  } else {
    setTimeout(callback, 0);
  }
}

// Memory usage monitoring
export function logMemoryUsage(): void {
  if (typeof window !== 'undefined' && 'memory' in window.performance) {
    const memory = (window.performance as any).memory;
    console.group('💾 Memory Usage');
    console.log(`Used: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Limit: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
    console.groupEnd();
  }
}

// Bundle size monitoring (development only)
export function logBundleInfo(): void {
  if (process.env.NODE_ENV === 'development') {
    console.group('📦 Bundle Information');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('React version:', React.version);
    console.groupEnd();
  }
}

// Core Web Vitals monitoring
export function initWebVitals(): void {
  if (typeof window === 'undefined') return;

  // Largest Contentful Paint
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        console.log('🎯 LCP:', entry.startTime);
      }
    }
  });

  try {
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (error) {
    // Browser doesn't support this metric
  }

  // First Input Delay
  const fidObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'first-input') {
        const fid = (entry as any).processingStart - entry.startTime;
        console.log('⚡ FID:', fid);
      }
    }
  });

  try {
    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch (error) {
    // Browser doesn't support this metric
  }
}

import React from 'react';