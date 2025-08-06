'use client'

import { useRef, useCallback } from 'react';

/**
 * Create a stable callback that won't change between renders
 * Useful for preventing unnecessary re-renders in child components
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback((...args: any[]) => callbackRef.current(...args), []) as T;
} 