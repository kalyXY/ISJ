"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { cn } from '@/lib/utils';

// Données simulées pour le graphique
const performanceData = [
  { name: '1ère', performance: 72, attendance: 88 },
  { name: '2ème', performance: 68, attendance: 85 },
  { name: '3ème', performance: 75, attendance: 90 },
  { name: '4ème', performance: 80, attendance: 92 },
  { name: '5ème', performance: 78, attendance: 89 },
  { name: '6ème', performance: 82, attendance: 94 },
];

type ChartType = 'performance' | 'attendance';

export default function PerformanceChart() {
  const [chartType, setChartType] = useState<ChartType>('performance');
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Performance par classe</CardTitle>
          <CardDescription>Moyennes académiques et taux de présence</CardDescription>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('performance')}
            className={cn(
              'px-3 py-1 text-sm rounded-md transition-colors',
              chartType === 'performance'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/30 text-secondary-foreground hover:bg-secondary/50'
            )}
          >
            Performance
          </button>
          <button
            onClick={() => setChartType('attendance')}
            className={cn(
              'px-3 py-1 text-sm rounded-md transition-colors',
              chartType === 'attendance'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/30 text-secondary-foreground hover:bg-secondary/50'
            )}
          >
            Présence
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={performanceData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis 
                dataKey="name" 
                className="text-xs fill-foreground"
              />
              <YAxis 
                domain={[0, 100]} 
                className="text-xs fill-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                  borderRadius: '0.375rem',
                }}
              />
              <Legend />
              {chartType === 'performance' ? (
                <Bar 
                  dataKey="performance" 
                  name="Performance académique (%)" 
                  fill="var(--primary)" 
                  radius={[4, 4, 0, 0]} 
                />
              ) : (
                <Bar 
                  dataKey="attendance" 
                  name="Taux de présence (%)" 
                  fill="var(--secondary)" 
                  radius={[4, 4, 0, 0]} 
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}