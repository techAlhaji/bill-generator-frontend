import React from 'react';
import { cn } from '../../lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  description?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  description,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
        {change && (
          <span
            className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-full',
              changeType === 'positive' && 'bg-emerald-50 text-emerald-700',
              changeType === 'negative' && 'bg-rose-50 text-rose-700',
              changeType === 'neutral' && 'bg-slate-100 text-slate-600'
            )}
          >
            {change}
          </span>
        )}
      </div>

      {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
    </div>
  );
};
