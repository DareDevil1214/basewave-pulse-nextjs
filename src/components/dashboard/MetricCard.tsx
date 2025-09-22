import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string | ReactNode;
  trend?: string;
  loading?: boolean;
  icon?: ReactNode;
  iconColor?: string;
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  loading = false, 
  icon, 
  iconColor = "text-blue-600"
}: MetricCardProps) {
  return (
    <div className="bg-white border border-gray-200/50 rounded-2xl p-6 hover:bg-gray-50 transition-colors shadow-lg">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-normal text-black">{title}</h3>
          {icon && (
            <div className={`${iconColor} p-2 rounded-lg bg-gray-50`}>
              {icon}
            </div>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-normal text-black">{loading ? '—' : value}</span>
          {trend && (
            <span className="text-sm font-normal text-black">
              {trend}
            </span>
          )}
        </div>
        <div className="text-sm text-gray-600">
          {subtitle}
        </div>
      </div>
    </div>
  );
}
