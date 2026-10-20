import React from 'react';
import { useSentry } from '../../context/SentryContext';
import { 
  AlertOctagon, 
  Clock, 
  AlertTriangle, 
  WifiOff, 
  Users, 
  HardHat, 
  RadioTower,
  ChevronRight
} from 'lucide-react';

export const TieredKpiSection: React.FC = () => {
  const { metrics, setActivePage } = useSentry();

  const isCriticalNonZero = metrics.criticalWorkersCount > 0 || metrics.criticalSosIncidentsCount > 0;
  const isUnackNonZero = metrics.unacknowledgedIncidentsCount > 0;
  const isWarningNonZero = metrics.warningWorkersCount > 0;
  const isOfflineNonZero = metrics.totalOfflineOrStale > 0;

  return (
    <div className="space-y-4">
      {/* Top Grid: Tier 1 (Large, High-Priority) & Tier 2 (Medium) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tier 1 - Card 1: Critical / SOS */}
        <div
          onClick={() => setActivePage('workers')}
          className={`p-5 rounded-[28px] transition-all cursor-pointer select-none ${
            isCriticalNonZero
              ? 'clay-critical border border-red-300 text-[#B52A31]'
              : 'clay-raised border border-[#D8CEBF]/60 text-[var(--text)] hover:-translate-y-0.5'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wide font-sans flex items-center gap-2">
              <div className="clay-pill-inset p-1.5 text-[#B52A31]">
                <AlertOctagon className="w-4 h-4" />
              </div>
              Critical / SOS Miners
            </span>
            {isCriticalNonZero && (
              <span className="text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-[#D13A3F] text-white uppercase shadow-sm">
                Emergency
              </span>
            )}
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <span className={`text-3xl font-extrabold font-mono tabular-nums ${isCriticalNonZero ? 'text-[#B52A31]' : 'text-[var(--text)]'}`}>
              {metrics.criticalWorkersCount}
            </span>
            <span className="text-xs font-mono text-[var(--text-3)] font-semibold">
              {metrics.criticalSosIncidentsCount} SOS Incident{metrics.criticalSosIncidentsCount === 1 ? '' : 's'}
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#D8CEBF]/60 flex items-center justify-between text-xs font-sans text-[var(--text-3)] font-medium">
            <span>Direct intervention required</span>
            <ChevronRight className="w-4 h-4 text-[var(--text-3)]" />
          </div>
        </div>

        {/* Tier 1 - Card 2: Unacknowledged Incidents */}
        <div
          onClick={() => setActivePage('incidents')}
          className={`p-5 rounded-[28px] transition-all cursor-pointer select-none ${
            isUnackNonZero
              ? 'clay-warning border border-amber-300 text-[#8A5500]'
              : 'clay-raised border border-[#D8CEBF]/60 text-[var(--text)] hover:-translate-y-0.5'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wide font-sans flex items-center gap-2">
              <div className="clay-pill-inset p-1.5 text-[#8A5500]">
                <Clock className="w-4 h-4" />
              </div>
              Unacknowledged Alerts
            </span>
            {isUnackNonZero && (
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#F5A524] text-[#2A2520] uppercase shadow-sm">
                Needs Operator Ack
              </span>
            )}
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <span className={`text-3xl font-extrabold font-mono tabular-nums ${isUnackNonZero ? 'text-[#8A5500]' : 'text-[var(--text)]'}`}>
              {metrics.unacknowledgedIncidentsCount}
            </span>
            <span className="text-xs font-mono text-[var(--text-3)] font-semibold">
              of {metrics.activeIncidentsCount} Active
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#D8CEBF]/60 flex items-center justify-between text-xs font-sans text-[var(--text-3)] font-medium">
            <span>Safety control queue</span>
            <ChevronRight className="w-4 h-4 text-[var(--text-3)]" />
          </div>
        </div>

        {/* Tier 2 - Card 3: Warnings (Medium Weight) */}
        <div
          onClick={() => setActivePage('workers')}
          className="clay-raised p-5 rounded-[28px] border border-[#D8CEBF]/60 transition-all cursor-pointer select-none hover:-translate-y-0.5 text-[var(--text)]"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wide font-sans flex items-center gap-2 text-[var(--text-2)]">
              <div className="clay-pill-inset p-1.5 text-[#8A5500]">
                <AlertTriangle className="w-4 h-4" />
              </div>
              Warning Conditions
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <span className={`text-3xl font-extrabold font-mono tabular-nums ${isWarningNonZero ? 'text-[#8A5500]' : 'text-[var(--text)]'}`}>
              {metrics.warningWorkersCount}
            </span>
            <span className="text-xs text-[var(--text-3)] font-mono font-semibold">
              Gas / Helmet Off
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#D8CEBF]/60 flex items-center justify-between text-xs font-sans text-[var(--text-3)] font-medium">
            <span>{metrics.removedHelmetsCount} detached helmet{metrics.removedHelmetsCount === 1 ? '' : 's'}</span>
            <ChevronRight className="w-4 h-4 text-[var(--text-3)]" />
          </div>
        </div>

        {/* Tier 2 - Card 4: Offline / Stale Nodes (Medium Weight) */}
        <div
          onClick={() => setActivePage('health')}
          className="clay-raised p-5 rounded-[28px] border border-[#D8CEBF]/60 transition-all cursor-pointer select-none hover:-translate-y-0.5 text-[var(--text)]"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wide font-sans flex items-center gap-2 text-[var(--text-2)]">
              <div className="clay-pill-inset p-1.5 text-[var(--text-3)]">
                <WifiOff className="w-4 h-4" />
              </div>
              Offline / Stale Nodes
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <span className={`text-3xl font-extrabold font-mono tabular-nums ${isOfflineNonZero ? 'text-[#6B6258]' : 'text-[var(--text)]'}`}>
              {metrics.totalOfflineOrStale}
            </span>
            <span className="text-xs text-[var(--text-3)] font-mono font-semibold">
              {metrics.offlineWorkersCount} offline • {metrics.staleWorkersCount} stale
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#D8CEBF]/60 flex items-center justify-between text-xs font-sans text-[var(--text-3)] font-medium">
            <span>Mesh telemetry delay</span>
            <ChevronRight className="w-4 h-4 text-[var(--text-3)]" />
          </div>
        </div>
      </div>

      {/* Tier 3: Compact Inline Stat Strip (Muted Routine Operational Telemetry) */}
      <div className="clay-inset p-3.5 px-6 rounded-[22px] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-6">
          {/* Registered Miners */}
          <div className="flex items-center gap-2 text-[var(--text)]">
            <Users className="w-4 h-4 text-[var(--info-ink)]" />
            <span className="text-[var(--text-3)] font-sans font-semibold">Registered Miners:</span>
            <span className="font-extrabold tabular-nums">{metrics.totalWorkers}</span>
          </div>

          {/* Online Helmets */}
          <div className="flex items-center gap-2 text-[var(--text)]">
            <HardHat className="w-4 h-4 text-[#1E6B42]" />
            <span className="text-[var(--text-3)] font-sans font-semibold">Online Helmets:</span>
            <span className="font-extrabold text-[#1E6B42] tabular-nums">
              {metrics.onlineHelmetsCount}
            </span>
            <span className="text-[var(--text-3)] font-medium">
              ({metrics.wornHelmetsCount} worn • {metrics.removedHelmetsCount} removed)
            </span>
          </div>

          {/* Normal Safe Workers */}
          <div className="flex items-center gap-2 text-[var(--text)]">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--ok)]" />
            <span className="text-[var(--text-3)] font-sans font-semibold">All Clear:</span>
            <span className="font-extrabold text-[#1E6B42] tabular-nums">{metrics.normalWorkersCount}</span>
          </div>
        </div>

        {/* Mesh Gateway Status */}
        <div className="flex items-center gap-2 text-[var(--text)]">
          <RadioTower className="w-4 h-4 text-[var(--text-2)]" />
          <span className="text-[var(--text-3)] font-sans font-semibold">Gateway Link:</span>
          <span className="text-[#1E6B42] font-bold">ONLINE</span>
          <span className="text-[var(--text-3)] font-medium">• 99.8% mesh bridge</span>
        </div>
      </div>
    </div>
  );
};
