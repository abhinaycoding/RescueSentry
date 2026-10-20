import React from 'react';

interface GasGaugeProps {
  label: string;
  value: number;
  unit: string;
  warningThreshold: number;
  criticalThreshold: number;
  maxScale?: number;
}

export const GasGauge: React.FC<GasGaugeProps> = ({
  label,
  value,
  unit,
  warningThreshold,
  criticalThreshold,
  maxScale = 3.0
}) => {
  const percentage = Math.min(100, Math.max(0, (value / maxScale) * 100));
  const warningPct = (warningThreshold / maxScale) * 100;
  const criticalPct = (criticalThreshold / maxScale) * 100;

  const isCritical = value >= criticalThreshold;
  const isWarning = value >= warningThreshold && !isCritical;

  const valueColor = isCritical 
    ? 'text-[#B52A31]' 
    : isWarning 
    ? 'text-[#8A5500]' 
    : 'text-[#2A2520]';

  const barColor = isCritical 
    ? 'bg-[#D13A3F]' 
    : isWarning 
    ? 'bg-[#F5A524]' 
    : 'bg-[#5C544B]';

  return (
    <div className="clay-inset p-3 rounded-[20px]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-sans font-bold text-[#5C544B]">
          {label}
        </span>
        <span className={`text-sm font-mono font-bold tabular-nums ${valueColor}`}>
          {value.toFixed(2)} <span className="text-xs font-normal text-[#6B6258]">{unit}</span>
        </span>
      </div>

      {/* Progress Track */}
      <div className="relative w-full h-2.5 bg-[#E6DDD0] rounded-full overflow-hidden mt-1 shadow-inner">
        <div
          className={`h-full transition-all duration-300 rounded-full ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
        {/* Warning threshold marker */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-[#8A5500] z-10 opacity-70"
          style={{ left: `${warningPct}%` }}
          title={`Warning: ${warningThreshold} ${unit}`}
        />
        {/* Critical threshold marker */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-[#B52A31] z-10 opacity-80"
          style={{ left: `${criticalPct}%` }}
          title={`Critical: ${criticalThreshold} ${unit}`}
        />
      </div>

      <div className="flex justify-between items-center text-xs text-[#6B6258] font-mono mt-1.5">
        <span>0</span>
        <span className="text-[#8A5500] font-medium">Warn {warningThreshold}</span>
        <span className="text-[#B52A31] font-medium">Crit {criticalThreshold}</span>
        <span>{maxScale} {unit}</span>
      </div>
    </div>
  );
};
