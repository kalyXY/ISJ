import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'accent' | 'white' | 'muted';
  thickness?: 'thin' | 'regular' | 'thick';
  className?: string;
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const colorClasses = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  accent: 'text-accent',
  white: 'text-white',
  muted: 'text-muted-foreground',
};

const thicknessClasses = {
  thin: 'stroke-[2]',
  regular: 'stroke-[3]',
  thick: 'stroke-[4]',
};

export function Spinner({ 
  size = 'md', 
  color = 'primary', 
  thickness = 'regular',
  className 
}: SpinnerProps) {
  return (
    <div role="status" className={cn('inline-block', className)}>
      <svg 
        className={cn(
          'animate-spin', 
          sizeClasses[size], 
          colorClasses[color]
        )} 
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg" 
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth={thickness === 'thin' ? 2 : thickness === 'regular' ? 3 : 4}
        />
        <path 
          className="opacity-75" 
          fill="none"
          strokeLinecap="round"
          stroke="currentColor"
          strokeWidth={thickness === 'thin' ? 2 : thickness === 'regular' ? 3 : 4}
          d="M12 2C6.48 2 2 6.48 2 12"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default Spinner;
