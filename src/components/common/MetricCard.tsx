import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'critical' | 'warning' | 'teal' | 'success';
  onClick?: () => void;
  badge?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon,
  variant = 'default',
  onClick,
  badge
}) => {
  const getClayStyle = () => {
    switch (variant) {
      case 'critical':
        return 'clay-critical text-[#B52A31] border border-red-300';
      case 'warning':
        return 'clay-warning text-[#8A5500] border border-amber-300';
      case 'teal':
      case 'success':
        return 'clay-ok text-[#1E6B42] border border-emerald-300';
      default:
        return 'clay-raised text-[var(--text)] border border-[#D8CEBF]/60';
    }
  };

  const getValueColor = () => {
    switch (variant) {
      case 'critical':
        return 'text-[#B52A31]';
      case 'warning':
        return 'text-[#8A5500]';
      case 'teal':
      case 'success':
        return 'text-[#1E6B42]';
      default:
        return 'text-[var(--text)]';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-[28px] transition-all duration-200 ${getClayStyle()} ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-bold tracking-wide uppercase font-sans text-[var(--text-2)]">
          {label}
        </span>
        {badge ? (
          badge
        ) : icon ? (
          <div className="clay-pill-inset p-2 text-[var(--text-2)] flex items-center justify-center">
            {icon}
          </div>
        ) : null}
      </div>

      <div className="flex items-baseline justify-between mt-2">
        <div className={`text-3xl font-extrabold font-mono tracking-tight tabular-nums ${getValueColor()}`}>
          {value}
        </div>
      </div>

      {subtext && (
        <div className="mt-2 text-xs text-[var(--text-3)] flex items-center gap-1.5 font-sans font-medium">
          {subtext}
        </div>
      )}
    </div>
  );
};

