import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  );
}

// Composant de chargement ultra-rapide
export function FastSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-muted via-muted/50 to-muted",
        className
      )}
      style={{
        animationDuration: '0.8s',
        animationTimingFunction: 'ease-in-out'
      }}
      {...props}
    />
  );
}

// Dashboard skeleton components
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <FastSkeleton className="h-8 w-[300px]" />
        <FastSkeleton className="h-4 w-[200px]" />
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <FastSkeleton className="h-4 w-[100px]" />
              <FastSkeleton className="h-4 w-4" />
            </div>
            <div className="space-y-2">
              <FastSkeleton className="h-8 w-[60px]" />
              <FastSkeleton className="h-3 w-[120px]" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts and tables */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-lg border bg-card p-6">
          <div className="space-y-4">
            <FastSkeleton className="h-6 w-[150px]" />
            <FastSkeleton className="h-[300px] w-full" />
          </div>
        </div>
        <div className="col-span-3 rounded-lg border bg-card p-6">
          <div className="space-y-4">
            <FastSkeleton className="h-6 w-[120px]" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <FastSkeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <FastSkeleton className="h-4 w-[100px]" />
                    <FastSkeleton className="h-3 w-[80px]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Table skeleton optimisé
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-4">
      {/* Table header */}
      <div className="flex space-x-4">
        {[...Array(columns)].map((_, i) => (
          <FastSkeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Table rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {[...Array(columns)].map((_, colIndex) => (
            <FastSkeleton key={colIndex} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// User list skeleton optimisé
export function UserListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <FastSkeleton className="h-10 flex-1" />
        <FastSkeleton className="h-10 w-[120px]" />
        <FastSkeleton className="h-10 w-[100px]" />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <TableSkeleton rows={10} columns={6} />
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <FastSkeleton className="h-4 w-[100px]" />
        <div className="flex space-x-2">
          {[...Array(5)].map((_, i) => (
            <FastSkeleton key={i} className="h-8 w-8" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Form skeleton optimisé
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <FastSkeleton className="h-6 w-[150px]" />
        <FastSkeleton className="h-4 w-[250px]" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <FastSkeleton className="h-4 w-[80px]" />
            <FastSkeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      
      <div className="flex justify-end space-x-4">
        <FastSkeleton className="h-10 w-[80px]" />
        <FastSkeleton className="h-10 w-[100px]" />
      </div>
    </div>
  );
}

// Page loading wrapper optimisé
interface PageLoadingProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function PageLoading({ children, title, subtitle }: PageLoadingProps) {
  return (
    <div className="space-y-6">
      {(title || subtitle) && (
        <div className="space-y-2">
          {title && <FastSkeleton className="h-8 w-[300px]" />}
          {subtitle && <FastSkeleton className="h-4 w-[200px]" />}
        </div>
      )}
      {children}
    </div>
  );
}

// Composant de chargement instantané pour les transitions rapides
export function InstantLoading({ message = "Chargement..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
    </div>
  );
}