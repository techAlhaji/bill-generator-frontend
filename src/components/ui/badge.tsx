import React from 'react';
import { cn } from '../../lib/utils';
import { InvoiceStatus } from '../../types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  status?: InvoiceStatus;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  status,
  children,
  ...props
}) => {
  // If status is provided, map it to semantic colors
  let statusClasses = '';
  let statusText = children;

  if (status) {
    switch (status) {
      case 'PAID':
        statusClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-600/10';
        statusText = statusText || 'Paid';
        break;
      case 'ISSUED':
        statusClasses = 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-600/10';
        statusText = statusText || 'Issued';
        break;
      case 'DRAFT':
        statusClasses = 'bg-slate-100 text-slate-700 border-slate-200 ring-1 ring-slate-600/10';
        statusText = statusText || 'Draft';
        break;
      case 'OVERDUE':
        statusClasses = 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-600/10';
        statusText = statusText || 'Overdue';
        break;
      case 'CANCELLED':
        statusClasses = 'bg-zinc-100 text-zinc-500 border-zinc-200 ring-1 ring-zinc-500/10';
        statusText = statusText || 'Cancelled';
        break;
    }
  } else {
    switch (variant) {
      case 'secondary':
        statusClasses = 'bg-slate-100 text-slate-700 border-slate-200';
        break;
      case 'success':
        statusClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'warning':
        statusClasses = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'danger':
        statusClasses = 'bg-rose-50 text-rose-700 border-rose-200';
        break;
      case 'outline':
        statusClasses = 'border-slate-300 text-slate-700 bg-transparent';
        break;
      default:
        statusClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        break;
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors',
        statusClasses,
        className
      )}
      {...props}
    >
      {status === 'PAID' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
      {status === 'ISSUED' && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
      {status === 'DRAFT' && <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />}
      {status === 'OVERDUE' && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />}
      {status === 'CANCELLED' && <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />}
      {statusText}
    </span>
  );
};
