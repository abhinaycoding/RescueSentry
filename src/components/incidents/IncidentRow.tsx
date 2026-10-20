import React from 'react';
import { Incident } from '../../types';
import { getIncidentCategoryDetails, formatDateTime, formatRelativeTime } from '../../utils/formatters';
import { AlertOctagon, Flame, HardHat, Thermometer, WifiOff, CheckCircle, Clock, Check } from 'lucide-react';

interface IncidentRowProps {
  incident: Incident;
  onSelect: (id: string) => void;
  onAcknowledge: (id: string) => void;
  onOpenResolve: (incident: Incident) => void;
  isSelected?: boolean;
}

export const IncidentRow: React.FC<IncidentRowProps> = ({
  incident,
  onSelect,
  onAcknowledge,
  onOpenResolve,
  isSelected
}) => {
  const categoryDetails = getIncidentCategoryDetails(incident.type);
  const isSos = incident.type === 'SOS_EMERGENCY';
  const isCritical = incident.severity === 'CRITICAL';
  const isResolved = incident.resolved;
  const isAcknowledged = incident.acknowledged;

  const getCategoryIcon = () => {
    switch (incident.type) {
      case 'SOS_EMERGENCY':
        return <AlertOctagon className="w-4 h-4 text-red-400 animate-pulse" />;
      case 'HAZARDOUS_GAS':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'HELMET_REMOVED':
        return <HardHat className="w-4 h-4 text-orange-400" />;
      case 'ENVIRONMENTAL_WARNING':
        return <Thermometer className="w-4 h-4 text-yellow-400" />;
      case 'DEVICE_DISCONNECTED':
        return <WifiOff className="w-4 h-4 text-[var(--text-3)]" />;
    }
  };

  return (
    <div
      onClick={() => onSelect(incident.id)}
      className={`p-5 rounded-[24px] border transition-all cursor-pointer select-none text-[var(--text)] ${
        isSelected
          ? 'clay-raised ring-2 ring-[var(--info-ink)] shadow-md'
          : isResolved
          ? 'clay-raised border-[#D8CEBF]/60 opacity-80 hover:opacity-100'
          : isSos
          ? 'clay-critical border-red-300'
          : isCritical
          ? 'clay-critical border-red-300'
          : !isAcknowledged
          ? 'clay-warning border-amber-300'
          : 'clay-raised border-[#D8CEBF]/60 hover:-translate-y-0.5'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 font-mono text-xs">
        {/* Left: ID and Category */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-bold">
            {getCategoryIcon()}
            <span className="font-extrabold tracking-wide text-[var(--text)]">
              {incident.id}
            </span>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-sm ${categoryDetails.badgeBg}`}>
            {categoryDetails.label}
          </span>

          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-sm ${
            isCritical ? 'bg-[#F8C9C6] text-[#B52A31] border border-red-300' : 'bg-[#FCE7B8] text-[#8A5500] border border-amber-300'
          }`}>
            {incident.severity}
          </span>
        </div>

        {/* Right: Timestamp and Status Badges */}
        <div className="flex items-center gap-2.5 font-mono text-xs">
          <span className="text-[var(--text-3)] flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5" />
            {formatRelativeTime(incident.timestamp)}
          </span>

          {isResolved ? (
            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#CDEBD9] text-[#1E6B42] border border-emerald-300 font-bold uppercase text-[10px] shadow-sm">
              <Check className="w-3 h-3" />
              RESOLVED
            </span>
          ) : isAcknowledged ? (
            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#DCE3F7] text-[var(--info-ink)] border border-blue-300 font-bold uppercase text-[10px] shadow-sm">
              <Check className="w-3 h-3" />
              ACKNOWLEDGED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#F8C9C6] text-[#B52A31] border border-red-300 font-extrabold uppercase text-[10px] shadow-sm">
              UNACKNOWLEDGED
            </span>
          )}
        </div>
      </div>

      {/* Middle row: Worker, Sector, Trigger condition */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3 text-xs font-mono">
        <div className="clay-inset p-3 rounded-[16px]">
          <span className="text-[10px] text-[var(--text-3)] uppercase font-bold block mb-0.5 font-sans">Involved Miner</span>
          <span className="text-[var(--text)] font-sans font-extrabold text-sm block">{incident.workerName}</span>
          <span className="text-[var(--text-3)] font-semibold">({incident.workerId} / {incident.helmetId})</span>
        </div>

        <div className="clay-inset p-3 rounded-[16px]">
          <span className="text-[10px] text-[var(--text-3)] uppercase font-bold block mb-0.5 font-sans">Underground Sector</span>
          <span className="text-[var(--info-ink)] font-bold truncate block">{incident.sector}</span>
        </div>

        <div className="clay-inset p-3 rounded-[16px]">
          <span className="text-[10px] text-[var(--text-3)] uppercase font-bold block mb-0.5 font-sans">Trigger Metric</span>
          <span className="text-[#8A5500] font-extrabold truncate block">{incident.triggerValue}</span>
        </div>
      </div>

      {/* Bottom Action Strip */}
      <div className="pt-3 border-t border-[#D8CEBF]/60 flex flex-wrap items-center justify-between gap-3 mt-2">
        <div className="text-xs text-[var(--text-3)] font-mono font-medium">
          {incident.resolved ? (
            <span>Resolved by <strong>{incident.resolvedBy}</strong> • {incident.resolutionNotes}</span>
          ) : incident.acknowledged ? (
            <span>Acknowledged by <strong>{incident.acknowledgedBy}</strong> at {formatDateTime(incident.acknowledgedAt || '')}</span>
          ) : (
            <span className="text-[#B52A31] font-bold">Action required: Operator confirmation required</span>
          )}
        </div>

        <div className="flex items-center gap-2.5" onClick={e => e.stopPropagation()}>
          {!incident.acknowledged && !incident.resolved && (
            <button
              type="button"
              onClick={() => onAcknowledge(incident.id)}
              className="clay-button clay-btn-amber h-8 px-3.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider"
            >
              Acknowledge
            </button>
          )}

          {!incident.resolved && (
            <button
              type="button"
              onClick={() => onOpenResolve(incident)}
              className="clay-button clay-btn-green h-8 px-3.5 rounded-full text-white text-xs font-mono font-bold uppercase tracking-wider"
            >
              Resolve Incident
            </button>
          )}

          <button
            type="button"
            onClick={() => onSelect(incident.id)}
            className="clay-pill-inset px-3 py-1 text-[var(--text-2)] hover:text-[var(--text)] text-xs font-mono font-bold transition-colors"
          >
            Audit History →
          </button>
        </div>
      </div>
    </div>
  );
};
