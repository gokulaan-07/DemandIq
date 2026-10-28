import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  badgeType?: 'neutral' | 'success' | 'warning' | 'danger';
  trend?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeType = 'neutral',
  trend
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-slate-500 tracking-wide">{title}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
          {value}
        </div>
        {trend && (
          <span className="text-xs font-mono font-medium text-teal-700">
            {trend}
          </span>
        )}
      </div>

      {(subtitle || badge) && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {subtitle && <span className="truncate">{subtitle}</span>}
          {badge && (
            <span className={`font-mono text-[11px] font-medium ${
              badgeType === 'danger' ? 'text-rose-700' :
              badgeType === 'warning' ? 'text-amber-700' :
              badgeType === 'success' ? 'text-emerald-700' :
              'text-slate-600'
            }`}>
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
