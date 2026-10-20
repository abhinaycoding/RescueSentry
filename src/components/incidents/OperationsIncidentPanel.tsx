import React, { useState, useEffect, useMemo } from 'react';
import { useSentry } from '../../context/SentryContext';
import { Incident } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Check, 
  Clock, 
  ShieldAlert, 
  ChevronRight, 
  Flame, 
  HardHat, 
  WifiOff,
  Keyboard
} from 'lucide-react';

interface OperationsIncidentPanelProps {
  onOpenResolveModal: (incident: Incident) => void;
}

export const OperationsIncidentPanel: React.FC<OperationsIncidentPanelProps> = ({ onOpenResolveModal }) => {
  const { 
    incidents, 
    acknowledgeIncident, 
    setSelectedIncidentId,
    metrics
  } = useSentry();

  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Active (unresolved) incidents sorted: SOS first, then CRITICAL, then WARNING, then by newest
  const activeIncidents = useMemo(() => {
    return incidents
      .filter(i => !i.resolved)
      .sort((a, b) => {
        // Priority 1: SOS_EMERGENCY
        if (a.type === 'SOS_EMERGENCY' && b.type !== 'SOS_EMERGENCY') return -1;
        if (b.type === 'SOS_EMERGENCY' && a.type !== 'SOS_EMERGENCY') return 1;

        // Priority 2: CRITICAL severity
        if (a.severity === 'CRITICAL' && b.severity !== 'CRITICAL') return -1;
        if (b.severity === 'CRITICAL' && a.severity !== 'CRITICAL') return 1;

        // Priority 3: Unacknowledged before Acknowledged
        if (!a.acknowledged && b.acknowledged) return -1;
        if (a.acknowledged && !b.acknowledged) return 1;

        // Priority 4: Time (newest first)
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
  }, [incidents]);

  // Keyboard navigation: [A] to ack, Arrow keys to navigate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if inside an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(activeIncidents.length - 1, prev + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'a' || e.key === 'A') {
        const current = activeIncidents[selectedIndex];
        if (current && !current.acknowledged) {
          e.preventDefault();
          acknowledgeIncident(current.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIncidents, selectedIndex, acknowledgeIncident]);

  const getCategoryIcon = (type: Incident['type']) => {
    switch (type) {
      case 'SOS_EMERGENCY':
        return <AlertOctagon className="w-4 h-4 text-red-400" />;
      case 'HAZARDOUS_GAS':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'HELMET_REMOVED':
        return <HardHat className="w-4 h-4 text-orange-400" />;
      case 'DEVICE_DISCONNECTED':
        return <WifiOff className="w-4 h-4 text-[var(--text-3)]" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="clay-raised p-6 flex flex-col justify-between h-full border border-[#D8CEBF]/60 text-[var(--text)]">
      {/* Panel Header */}
      <div className="pb-4 border-b border-[#D8CEBF]/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="clay-pill-inset p-2 text-[#B52A31]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text)] uppercase tracking-wide font-sans">
              Active Incident Queue
            </h3>
            <p className="text-xs text-[var(--text-3)] font-sans font-medium mt-0.5">
              {metrics.activeIncidentsCount} Active ({metrics.unacknowledgedIncidentsCount} Unacknowledged)
            </p>
          </div>
        </div>

        {/* Keyboard shortcut helper */}
        <div className="hidden sm:flex items-center gap-2 clay-pill-inset px-3 py-1 text-xs font-mono text-[var(--text-3)] font-semibold">
          <Keyboard className="w-3.5 h-3.5 text-[var(--info-ink)]" />
          <span><kbd className="text-[var(--text)] font-extrabold">[A]</kbd> Ack</span>
          <span>•</span>
          <span><kbd className="text-[var(--text)] font-extrabold">[↑/↓]</kbd> Select</span>
        </div>
      </div>

      {/* Incident Cards Scrollable Area */}
      <div className="my-3 space-y-3 overflow-y-auto max-h-[380px] pr-1">
        {activeIncidents.length === 0 ? (
          <div className="p-8 text-center clay-inset rounded-[24px]">
            <div className="clay-pill-inset w-12 h-12 mx-auto mb-3 flex items-center justify-center text-[#1E6B42]">
              <Check className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-[var(--text)] font-sans block">All Clear</span>
            <p className="text-xs text-[var(--text-3)] font-sans mt-1 font-medium">
              Zero unresolved emergency incidents logged across all mining horizons.
            </p>
          </div>
        ) : (
          activeIncidents.map((inc, idx) => {
            const isSos = inc.type === 'SOS_EMERGENCY';
            const isSelected = selectedIndex === idx;
            const isAcknowledged = inc.acknowledged;

            return (
              <div
                key={inc.id}
                onClick={() => {
                  setSelectedIndex(idx);
                  setSelectedIncidentId(inc.id);
                }}
                className={`p-4 rounded-[22px] transition-all cursor-pointer relative select-none ${
                  isSos
                    ? 'clay-critical border border-red-300'
                    : !isAcknowledged
                    ? 'clay-warning border border-amber-300'
                    : 'clay-raised border border-[#D8CEBF]/80'
                } ${isSelected ? 'ring-2 ring-[var(--info-ink)] shadow-md' : 'hover:-translate-y-0.5'}`}
              >
                {/* Header row: Severity Chip & Live Elapsed Timer */}
                <div className="flex items-center justify-between gap-2 mb-2 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full font-bold uppercase text-[11px] shadow-sm ${
                      isSos 
                        ? 'bg-[#D13A3F] text-white' 
                        : inc.severity === 'CRITICAL'
                        ? 'bg-[#F8C9C6] text-[#B52A31] border border-red-300'
                        : 'bg-[#FCE7B8] text-[#8A5500] border border-amber-300'
                    }`}>
                      {getCategoryIcon(inc.type)}
                      <span>{inc.type.replace('_', ' ')}</span>
                    </span>
                    <span className="text-[var(--text-3)] font-bold">{inc.id}</span>
                  </div>

                  <span className="text-[var(--text-3)] flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {formatRelativeTime(inc.timestamp)}
                  </span>
                </div>

                {/* Worker & Sector Info */}
                <div className="mb-2">
                  <div className="flex items-baseline justify-between">
                    <h4 className="text-sm font-extrabold text-[var(--text)] font-sans">
                      {inc.workerName}
                    </h4>
                    <span className="text-xs font-mono text-[var(--text-3)] font-semibold">
                      ID: {inc.workerId}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-2)] font-sans mt-0.5 font-semibold">
                    {inc.sector}
                  </div>
                </div>

                {/* Trigger Condition */}
                <div className="clay-inset p-2.5 rounded-[14px] text-xs font-mono text-[var(--warning-ink)] mb-3 font-semibold">
                  {inc.triggerValue}
                </div>

                {/* Bottom Action Strip: Solid Colored ACK Button */}
                <div className="flex items-center justify-between pt-2 border-t border-[#D8CEBF]/60">
                  <div className="text-xs font-mono">
                    {isAcknowledged ? (
                      <span className="text-[#1E6B42] font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Ack by {inc.acknowledgedBy?.split(' ')[0] || 'Dave'}
                      </span>
                    ) : (
                      <span className="text-[#8A5500] font-bold">
                        Unacknowledged
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    {!isAcknowledged ? (
                      <button
                        type="button"
                        onClick={() => acknowledgeIncident(inc.id)}
                        className="clay-button clay-btn-amber h-9 px-4 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Acknowledge</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenResolveModal(inc)}
                        className="clay-button clay-btn-green h-9 px-4 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5"
                      >
                        <span>Resolve</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Strip */}
      <div className="pt-3 border-t border-[#D8CEBF]/60 flex items-center justify-between text-xs font-mono text-[var(--text-3)] font-medium">
        <span>
          Showing top {Math.min(5, activeIncidents.length)} prioritized incidents
        </span>
        {activeIncidents.length > 5 && (
          <span className="text-[var(--info-ink)] font-bold">
            +{activeIncidents.length - 5} more in queue
          </span>
        )}
      </div>
    </div>
  );
};
