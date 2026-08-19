import React, { useState } from 'react';
import { LucideIcon, ChevronRight, ChevronDown } from 'lucide-react';

export const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ');

/* ---------------------------------------------------------------------- */
/* Card — clean soft elevated panel                                       */
/* ---------------------------------------------------------------------- */
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...rest }) => (
  <div
    className={cx('bg-white rounded-xl border border-slate-200/80 shadow-xs', className)}
    {...rest}
  >
    {children}
  </div>
);

/* ---------------------------------------------------------------------- */
/* Badge — soft pastel pill                                               */
/* ---------------------------------------------------------------------- */
type BadgeTone = 'neutral' | 'signal' | 'success' | 'warning' | 'danger' | 'dark';

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-600 border-slate-200/60',
  signal: 'bg-blue-50 text-blue-700 border-blue-200/60',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/60',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/60',
  dark: 'bg-slate-800 text-slate-100 border-slate-700'
};

export const Badge: React.FC<{ tone?: BadgeTone; className?: string; children: React.ReactNode }> = ({
  tone = 'neutral',
  className,
  children
}) => (
  <span
    className={cx(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-tight',
      badgeTones[tone],
      className
    )}
  >
    {children}
  </span>
);

/* ---------------------------------------------------------------------- */
/* StatCard — Minimalist Soft KPI Card                                    */
/* ---------------------------------------------------------------------- */
type StatTone = 'neutral' | 'signal' | 'success' | 'warning' | 'danger';

const statToneMap: Record<StatTone, { bg: string; border: string; icon: string; value: string; bar: string }> = {
  neutral: { bg: 'bg-white', border: 'border-slate-200/80', icon: 'bg-slate-100 text-slate-600', value: 'text-slate-900', bar: 'bg-slate-700' },
  signal: { bg: 'bg-white', border: 'border-slate-200/80', icon: 'bg-blue-50 text-blue-600', value: 'text-slate-900', bar: 'bg-blue-600' },
  success: { bg: 'bg-white', border: 'border-slate-200/80', icon: 'bg-emerald-50 text-emerald-600', value: 'text-emerald-700', bar: 'bg-emerald-500' },
  warning: { bg: 'bg-white', border: 'border-slate-200/80', icon: 'bg-amber-50 text-amber-600', value: 'text-amber-700', bar: 'bg-amber-500' },
  danger: { bg: 'bg-white', border: 'border-slate-200/80', icon: 'bg-rose-50 text-rose-600', value: 'text-rose-700', bar: 'bg-rose-500' }
};

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  tone?: StatTone;
  footer?: React.ReactNode;
  onClick?: () => void;
  progress?: number;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  tone = 'neutral',
  footer,
  onClick,
  progress,
  className
}) => {
  const t = statToneMap[tone];
  const containerClasses = cx(
    'text-left p-5 rounded-xl border shadow-xs transition-all duration-200 bg-white relative overflow-hidden w-full',
    t.border,
    onClick && 'cursor-pointer hover:border-slate-300 hover:shadow-sm active:scale-[0.99]',
    className
  );

  const content = (
    <>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 font-sans">{label}</span>
        {Icon && (
          <div className={cx('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', t.icon)}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <h3 className={cx('text-2xl font-bold tracking-tight font-display', t.value)}>{value}</h3>
      {typeof progress === 'number' && (
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className={cx('h-full rounded-full transition-all duration-500', t.bar)}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
      {footer && <div className="text-xs text-slate-500 mt-2.5 flex items-center gap-1 font-sans">{footer}</div>}
      {onClick && (
        <ChevronRight className="w-4 h-4 absolute top-5 right-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={containerClasses}>
        {content}
      </button>
    );
  }

  return <div className={containerClasses}>{content}</div>;
};

/* ---------------------------------------------------------------------- */
/* EmptyState                                                              */
/* ---------------------------------------------------------------------- */
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-12 px-6">
    {Icon && (
      <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5" />
      </div>
    )}
    <p className="text-sm font-semibold text-slate-800">{title}</p>
    {description && <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">{description}</p>}
    {action && <div className="mt-3.5">{action}</div>}
  </div>
);

/* ---------------------------------------------------------------------- */
/* SectionLabel                                                            */
/* ---------------------------------------------------------------------- */
export const SectionLabel: React.FC<{ icon?: LucideIcon; children: React.ReactNode; className?: string }> = ({
  icon: Icon,
  children,
  className
}) => (
  <h3 className={cx('text-sm font-semibold text-slate-900 flex items-center gap-2', className)}>
    {Icon && <Icon className="w-4 h-4 text-blue-600" />}
    {children}
  </h3>
);

/* ---------------------------------------------------------------------- */
/* ExpandableDetail — Hide heavy text blocks with clean dropdown toggle   */
/* ---------------------------------------------------------------------- */
export interface ExpandableDetailProps {
  title?: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}

export const ExpandableDetail: React.FC<ExpandableDetailProps> = ({
  title = 'Tampilkan Detail',
  badge,
  defaultOpen = false,
  children,
  className,
  dark = false
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={cx(
        'rounded-xl transition-all overflow-hidden',
        dark
          ? 'bg-white/5 border border-white/10'
          : 'bg-slate-50/80 border border-slate-200/80',
        className
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cx(
          'w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold transition-colors select-none text-left cursor-pointer',
          dark
            ? 'text-emerald-300 hover:text-white hover:bg-white/5'
            : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100/80'
        )}
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="truncate">{isOpen ? 'Sembunyikan Detail' : title}</span>
          {badge && (
            <span
              className={cx(
                'text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0',
                dark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-100 text-blue-700'
              )}
            >
              {badge}
            </span>
          )}
        </span>
        <ChevronDown
          className={cx(
            'w-4 h-4 shrink-0 transition-transform duration-200',
            isOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cx(
            'px-3.5 pb-3.5 pt-1 text-xs leading-relaxed animate-fade-in border-t',
            dark ? 'border-white/10 text-white/80' : 'border-slate-200/60 text-slate-600'
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};

