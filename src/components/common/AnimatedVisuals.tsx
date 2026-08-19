import React, { useEffect, useState } from 'react';

/**
 * AnimatedNumber — Smooth 60fps cubic/exponential count-up animation
 * Inspired by high-end motion design principles with tabular-nums
 */
interface AnimatedNumberProps {
  value: number;
  duration?: number; // duration in ms, default 800ms
  formatter?: (val: number) => string;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 750,
  formatter = (v) => v.toLocaleString('id-ID'),
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let frameId: number;

    const startValue = 0;
    const targetValue = value;

    // Easing: easeOutExpo
    const easeOutExpo = (t: number): number => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);

      const current = Math.round(startValue + (targetValue - startValue) * easedProgress);
      setDisplayValue(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  return (
    <span className={`tabular-nums font-semibold tracking-tight ${className}`}>
      {formatter(displayValue)}
    </span>
  );
};

/**
 * HorizontalBarItem — High-precision clean horizontal bar item
 * inspired by Remotion HorizontalBarChart pattern
 */
interface HorizontalBarItemProps {
  label: string;
  value: number;
  maxValue: number;
  highlighted?: boolean;
  color?: string;
  unit?: string;
}

export const HorizontalBarItem: React.FC<HorizontalBarItemProps> = ({
  label,
  value,
  maxValue,
  highlighted = false,
  color,
  unit = ''
}) => {
  const percentage = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;
  const barColor = color || (highlighted ? '#2563eb' : '#cbd5e1');

  return (
    <div className="space-y-1 group">
      <div className="flex items-center justify-between text-xs">
        <span className={`font-medium truncate ${highlighted ? 'text-blue-900 font-semibold' : 'text-slate-700'}`}>
          {label}
        </span>
        <span className="tabular-nums font-semibold text-slate-900 ml-2 shrink-0">
          {value.toLocaleString('id-ID')} {unit}
          <span className="text-slate-400 font-normal text-[11px] ml-1">({percentage}%)</span>
        </span>
      </div>

      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: barColor
          }}
        />
      </div>
    </div>
  );
};

/**
 * DonutLegendItem — Minimalist clean legend pill with exact percentages
 */
interface DonutLegendItemProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

export const DonutLegendItem: React.FC<DonutLegendItemProps> = ({
  label,
  value,
  total,
  color
}) => {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 hover:bg-slate-100/80 border border-slate-100 transition-colors text-xs">
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="text-slate-700 font-medium truncate">{label}</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 tabular-nums">
        <span className="font-semibold text-slate-900">{value}</span>
        <span className="text-[11px] text-slate-400 font-normal">({percent}%)</span>
      </div>
    </div>
  );
};
