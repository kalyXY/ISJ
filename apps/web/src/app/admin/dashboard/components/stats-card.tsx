"use client";

import { LucideIcon } from "lucide-react";
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'blue' | 'green' | 'orange' | 'purple' | 'indigo';
  isLoading?: boolean;
}

const colorVariants = {
  blue: {
    bgLight: 'bg-blue-50 dark:bg-blue-900',
    textLight: 'text-blue-600 dark:text-blue-100',
    iconBg: 'bg-blue-100 dark:bg-blue-700',
    iconColor: 'text-blue-800 dark:text-blue-200',
  },
  green: {
    bgLight: 'bg-green-50 dark:bg-green-900',
    textLight: 'text-green-600 dark:text-green-100',
    iconBg: 'bg-green-100 dark:bg-green-700',
    iconColor: 'text-green-800 dark:text-green-200',
  },
  orange: {
    bgLight: 'bg-orange-50 dark:bg-orange-900',
    textLight: 'text-orange-600 dark:text-orange-100',
    iconBg: 'bg-orange-100 dark:bg-orange-700',
    iconColor: 'text-orange-800 dark:text-orange-200',
  },
  purple: {
    bgLight: 'bg-purple-50 dark:bg-purple-900',
    textLight: 'text-purple-600 dark:text-purple-100',
    iconBg: 'bg-purple-100 dark:bg-purple-700',
    iconColor: 'text-purple-800 dark:text-purple-200',
  },
  indigo: {
    bgLight: 'bg-indigo-50 dark:bg-indigo-900',
    textLight: 'text-indigo-600 dark:text-indigo-100',
    iconBg: 'bg-indigo-100 dark:bg-indigo-700',
    iconColor: 'text-indigo-800 dark:text-indigo-200',
  },
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color,
  isLoading = false,
}: StatsCardProps) {
  const colorClasses = colorVariants[color];
  
  return (
    <div className={cn(
      'rounded-lg p-6 shadow-md transition-all duration-200',
      colorClasses.bgLight,
      'stats-card',
      color
    )}>
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700 mb-4"></div>
          <div className="h-6 w-24 bg-gray-300 dark:bg-gray-700 mb-2 rounded"></div>
          <div className="h-10 w-20 bg-gray-300 dark:bg-gray-700 mb-2 rounded"></div>
          <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      ) : (
        <>
          <div className={cn(
            'rounded-full w-12 h-12 flex items-center justify-center mb-4',
            colorClasses.iconBg
          )}>
            <Icon className={cn('w-6 h-6', colorClasses.iconColor)} />
          </div>
          <h3 className={cn('text-sm font-medium mb-2', colorClasses.textLight)}>
            {title}
          </h3>
          <p className={cn('text-3xl font-bold', colorClasses.textLight)}>
            {value}
          </p>
          {description && (
            <p className={cn('text-sm mt-2 opacity-80', colorClasses.textLight)}>
              {description}
            </p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              {trend.isPositive ? (
                <svg
                  className="w-4 h-4 text-green-500 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-red-500 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              )}
              <span
                className={cn(
                  'text-xs',
                  trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                )}
              >
                {trend.value}%
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}