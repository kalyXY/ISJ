import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface ClassStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'default' | 'destructive';
}

export const ClassStatsCard = ({ title, value, icon: Icon, variant = 'default' }: ClassStatsCardProps) => {
  return (
    <Card className={variant === 'destructive' ? 'border-red-200 bg-red-50' : ''}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${variant === 'destructive' ? 'text-red-600' : ''}`}>
              {value}
            </p>
          </div>
          <Icon className={`h-8 w-8 ${variant === 'destructive' ? 'text-red-600' : 'text-blue-600'}`} />
        </div>
      </CardContent>
    </Card>
  );
};