import React from 'react';
import { cn } from '../../lib/utils';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  onDismiss?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  className,
  variant = 'info',
  title,
  children,
  onDismiss,
  ...props
}) => {
  const variantStyles = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />,
      closeBtn: 'text-blue-500 hover:bg-blue-100',
    },
    success: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />,
      closeBtn: 'text-emerald-500 hover:bg-emerald-100',
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />,
      closeBtn: 'text-amber-500 hover:bg-amber-100',
    },
    error: {
      container: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />,
      closeBtn: 'text-rose-500 hover:bg-rose-100',
    },
  }[variant];

  return (
    <div
      role="alert"
      className={cn(
        'relative flex items-start gap-3 rounded-xl border p-4 text-sm shadow-sm transition-all',
        variantStyles.container,
        className
      )}
      {...props}
    >
      <div className="mt-0.5">{variantStyles.icon}</div>
      <div className="flex-1 space-y-1">
        {title && <h4 className="font-semibold leading-none">{title}</h4>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={cn('rounded-lg p-1 transition-colors', variantStyles.closeBtn)}
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
