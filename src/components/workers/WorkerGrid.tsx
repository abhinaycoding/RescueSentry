import React from 'react';
import { Worker } from '../../types';
import { SafetyBadge, ConnectionBadge, HelmetWearBadge } from '../common/StatusBadge';
import { GasGauge } from '../common/GasGauge';
import { formatRelativeTime } from '../../utils/formatters';
import { Battery, Wifi, AlertOctagon, ChevronRight } from 'lucide-react';

interface WorkerGridProps {
  workers: Worker[];
  onSelectWorker: (workerId: string) => void;
  selectedWorkerId?: string | null;
}

export const WorkerGrid: React.FC<WorkerGridProps> = ({
  workers,
  onSelectWorker,
  selectedWorkerId
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {workers.map(worker => {
        const isSelected = selectedWorkerId === worker.id;
        const isSos = worker.telemetry.sosPressed;
        const isCritical = worker.safetyState === 'CRITICAL';

        return (
          <div
            key={worker.id}
            onClick={() => onSelectWorker(worker.id)}
            className={`p-5 rounded-[28px] border transition-all cursor-pointer ${
              isSelected
                ? 'clay-raised ring-2 ring-[var(--info-ink)] shadow-md'
                : isSos
                ? 'clay-critical border-red-300'
                : isCritical
                ? 'clay-critical border-red-300'
                : 'clay-raised border-[#D8CEBF]/60 hover:-translate-y-0.5'
            }`}
          >
            {/* Worker Header */}
            <div className="flex items-start justify-between gap-2 mb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[var(--text-3)]">
                    {worker.id}
                  </span>
                  <span className="text-[var(--text-3)] font-mono">•</span>
                  <span className="font-mono text-xs text-[var(--info-ink)] font-bold">
                    {worker.helmetId}
                  </span>
                </div>
                <h4 className="text-base font-extrabold font-sans text-[var(--text)] mt-0.5">
                  {worker.name}
                </h4>
                <div className="text-xs text-[var(--text-3)] font-sans font-medium">
                  {worker.role}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <SafetyBadge state={worker.safetyState} />
                <HelmetWearBadge worn={worker.helmetWorn} />
              </div>
            </div>

            {/* Sector Bar */}
            <div className="clay-inset p-2.5 rounded-[16px] text-xs font-mono text-[var(--text-2)] flex items-center justify-between mb-3.5 font-semibold">
              <span className="truncate">{worker.sector}</span>
              <span className="text-[11px] text-[var(--text-3)]">{formatRelativeTime(worker.lastSeen)}</span>
            </div>

            {/* Gauges (CH4 & CO) */}
            <div className="space-y-2.5 mb-3.5">
              <GasGauge
                label="CH4 Methane"
                value={worker.telemetry.ch4}
                unit="% LEL"
                warningThreshold={1.0}
                criticalThreshold={1.5}
                maxScale={2.5}
              />
              <GasGauge
                label="CO Carbon Monoxide"
                value={worker.telemetry.co}
                unit="ppm"
                warningThreshold={25}
                criticalThreshold={50}
                maxScale={100}
              />
            </div>

            {/* Secondary telemetry metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-3 border-t border-[#D8CEBF]/60 text-[var(--text-3)] font-semibold">
              <div className="flex items-center justify-between clay-inset p-2 rounded-[14px]">
                <span>Temp / RH:</span>
                <span className="text-[var(--text)] font-bold tabular-nums">
                  {worker.telemetry.temperature}°C / {worker.telemetry.humidity}%
                </span>
              </div>
              <div className="flex items-center justify-between clay-inset p-2 rounded-[14px]">
                <span className="flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-[var(--text-3)]" />
                  Batt:
                </span>
                <span className="text-[var(--text)] font-bold tabular-nums">
                  {worker.telemetry.batteryPct}%
                </span>
              </div>
            </div>

            {/* Footer action trigger */}
            <div className="mt-3.5 flex items-center justify-between text-xs font-mono">
              <ConnectionBadge status={worker.connectionStatus} />
              <span className="text-[var(--info-ink)] font-bold hover:underline flex items-center gap-1">
                Inspect Profile <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
