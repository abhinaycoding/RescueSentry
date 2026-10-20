import React, { useState, useMemo } from 'react';
import { Worker, SafetyState } from '../../types';
import { SafetyBadge, ConnectionBadge, HelmetWearBadge } from '../common/StatusBadge';
import { formatRelativeTime } from '../../utils/formatters';
import { useSentry } from '../../context/SentryContext';
import { 
  Search, 
  ArrowUpDown, 
  ChevronRight, 
  AlertOctagon, 
  Filter, 
  Activity,
  Radio
} from 'lucide-react';

interface WorkerTableProps {
  workers: Worker[];
  onSelectWorker: (workerId: string) => void;
  selectedWorkerId?: string | null;
}

export const WorkerTable: React.FC<WorkerTableProps> = ({
  workers,
  onSelectWorker,
  selectedWorkerId
}) => {
  const { thresholds } = useSentry();
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [safetyFilter, setSafetyFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'id' | 'name' | 'severity' | 'lastSeen'>('severity');
  const [sortAsc, setSortAsc] = useState(false);

  // Extract unique sectors
  const sectors = useMemo(() => {
    const s = new Set<string>();
    workers.forEach(w => s.add(w.sector));
    return Array.from(s);
  }, [workers]);

  // Strict severity ranking: SOS / Critical (4) > Warning (3) > Offline / Stale (2) > Normal (1)
  const severityWeight = (worker: Worker): number => {
    if (worker.telemetry.sosPressed || worker.safetyState === 'CRITICAL') return 4;
    if (worker.safetyState === 'WARNING') return 3;
    if (worker.connectionStatus === 'STALE' || worker.safetyState === 'STALE') return 2;
    if (worker.connectionStatus === 'OFFLINE' || worker.safetyState === 'OFFLINE') return 1;
    return 0; // Normal
  };

  const filteredWorkers = useMemo(() => {
    return workers
      .filter(w => {
        const matchesSearch = 
          w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.helmetId.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesSector = sectorFilter === 'ALL' || w.sector === sectorFilter;
        const matchesSafety = safetyFilter === 'ALL' || w.safetyState === safetyFilter;

        return matchesSearch && matchesSector && matchesSafety;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'severity') {
          comp = severityWeight(b) - severityWeight(a);
        } else if (sortField === 'name') {
          comp = a.name.localeCompare(b.name);
        } else if (sortField === 'id') {
          comp = a.id.localeCompare(b.id);
        } else if (sortField === 'lastSeen') {
          comp = new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
        }
        return sortAsc ? -comp : comp;
      });
  }, [workers, searchTerm, sectorFilter, safetyFilter, sortField, sortAsc]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="clay-raised overflow-hidden flex flex-col border border-[#D8CEBF]/60 text-[var(--text)]">
      {/* Search & Filter Toolbar */}
      <div className="p-4 border-b border-[#D8CEBF]/60 flex flex-wrap items-center justify-between gap-3 bg-black/[0.02]">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search box */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="w-4 h-4 text-[var(--text-3)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by worker name, ID or helmet..."
              className="w-full pl-10 pr-4 py-2 text-xs clay-input font-mono text-[var(--text)] placeholder-[var(--text-3)]"
            />
          </div>

          {/* Sector filter */}
          <select
            value={sectorFilter}
            onChange={e => setSectorFilter(e.target.value)}
            className="clay-pill-inset px-4 py-2 text-xs font-mono text-[var(--text)] font-semibold cursor-pointer focus:outline-none"
          >
            <option value="ALL">All Underground Sectors ({workers.length})</option>
            {sectors.map(sec => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>

          {/* Safety filter */}
          <select
            value={safetyFilter}
            onChange={e => setSafetyFilter(e.target.value)}
            className="clay-pill-inset px-4 py-2 text-xs font-mono text-[var(--text)] font-semibold cursor-pointer focus:outline-none"
          >
            <option value="ALL">All Safety Classifications</option>
            <option value="CRITICAL">Critical / SOS</option>
            <option value="WARNING">Warning Hazards</option>
            <option value="NORMAL">Normal Safe</option>
            <option value="STALE">Stale Telemetry</option>
            <option value="OFFLINE">Offline Nodes</option>
          </select>
        </div>

        <div className="text-xs font-mono text-[var(--text-3)] flex items-center gap-1.5 font-semibold">
          <span>Displaying:</span>
          <span className="text-[var(--text)] font-extrabold text-sm">{filteredWorkers.length}</span>
          <span>of {workers.length} miners</span>
        </div>
      </div>

      {/* High-Density 48px Row Table with Sticky Header */}
      <div className="overflow-x-auto max-h-[460px]">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#E6DDD0]/70 text-[var(--text-3)] uppercase text-[11px] tracking-wider border-b border-[#D8CEBF]/60 sticky top-0 z-10 select-none font-bold">
            <tr className="h-11">
              <th className="px-4 cursor-pointer hover:text-[var(--text)]" onClick={() => toggleSort('id')}>
                <div className="flex items-center gap-1.5">
                  Worker ID
                  <ArrowUpDown className="w-3.5 h-3.5 text-[var(--text-3)]" />
                </div>
              </th>
              <th className="px-4 cursor-pointer hover:text-[var(--text)]" onClick={() => toggleSort('name')}>
                <div className="flex items-center gap-1.5">
                  Miner Name & Role
                  <ArrowUpDown className="w-3.5 h-3.5 text-[var(--text-3)]" />
                </div>
              </th>
              <th className="px-4">Assigned Sector</th>
              <th className="px-4">Helmet Status</th>
              <th className="px-4">CH4 Methane</th>
              <th className="px-4">CO Gas</th>
              <th className="px-4">Temp / RH</th>
              <th className="px-4">Freshness</th>
              <th className="px-4 cursor-pointer hover:text-[var(--text)]" onClick={() => toggleSort('severity')}>
                <div className="flex items-center gap-1.5">
                  Safety State
                  <ArrowUpDown className="w-3.5 h-3.5 text-[var(--text-3)]" />
                </div>
              </th>
              <th className="px-3 text-right">Inspect</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#D8CEBF]/50">
            {filteredWorkers.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-[var(--text-3)] text-sm font-sans font-medium">
                  No mine workers found matching current search and filter criteria.
                </td>
              </tr>
            ) : (
              filteredWorkers.map(w => {
                const isSelected = selectedWorkerId === w.id;
                const isSos = w.telemetry.sosPressed;
                const isCritical = w.safetyState === 'CRITICAL';
                const isWarning = w.safetyState === 'WARNING';
                const isOffline = w.connectionStatus === 'OFFLINE';
                const isStale = w.connectionStatus === 'STALE';

                // Percentage bar calculations for CH4 & CO
                const ch4Pct = Math.min(100, Math.max(0, (w.telemetry.ch4 / 2.5) * 100));
                const coPct = Math.min(100, Math.max(0, (w.telemetry.co / 80) * 100));

                return (
                  <tr
                    key={w.id}
                    onClick={() => onSelectWorker(w.id)}
                    className={`h-12 cursor-pointer transition-colors text-[var(--text)] ${
                      isSelected
                        ? 'bg-[#FCE7B8]/50 border-l-4 border-l-[#8A5500] font-bold'
                        : isSos
                        ? 'bg-[#F8C9C6]/60 hover:bg-[#F8C9C6]/80 border-l-4 border-l-[#D13A3F] font-semibold'
                        : isCritical
                        ? 'bg-[#F8C9C6]/30 hover:bg-[#F8C9C6]/50'
                        : isWarning
                        ? 'bg-[#FCE7B8]/20 hover:bg-[#FCE7B8]/40'
                        : 'hover:bg-black/[0.03]'
                    }`}
                  >
                    {/* Worker ID */}
                    <td className="px-4 font-bold text-[var(--text)]">
                      <div className="flex items-center gap-1.5">
                        {isSos && <AlertOctagon className="w-4 h-4 text-[#D13A3F] animate-pulse" />}
                        <span>{w.id}</span>
                      </div>
                    </td>

                    {/* Name & Role */}
                    <td className="px-4">
                      <div className="font-sans font-bold text-sm text-[var(--text)]">{w.name}</div>
                      <div className="text-xs text-[var(--text-3)] font-sans">{w.role}</div>
                    </td>

                    {/* Sector */}
                    <td className="px-4 text-[var(--text-2)] font-sans text-xs truncate max-w-[170px] font-semibold">
                      {w.sector}
                    </td>

                    {/* Helmet Wear */}
                    <td className="px-4">
                      <HelmetWearBadge worn={w.helmetWorn} />
                    </td>

                    {/* CH4 Methane with visual value + mini-bar */}
                    <td className="px-4 tabular-nums">
                      {isOffline ? (
                        <span className="text-[var(--text-3)]">--</span>
                      ) : (
                        <div className="flex flex-col gap-1 w-24">
                          <span className={`font-bold text-xs ${
                            w.telemetry.ch4 >= thresholds.ch4Critical
                              ? 'text-[#B52A31] font-extrabold'
                              : w.telemetry.ch4 >= thresholds.ch4Warning
                              ? 'text-[#8A5500]'
                              : 'text-[var(--text)]'
                          }`}>
                            {w.telemetry.ch4.toFixed(2)}% LEL
                          </span>
                          <div className="w-full h-1.5 bg-[#E6DDD0] rounded-full overflow-hidden shadow-inner">
                            <div 
                              className={`h-full rounded-full ${
                                w.telemetry.ch4 >= thresholds.ch4Critical
                                  ? 'bg-[#D13A3F]'
                                  : w.telemetry.ch4 >= thresholds.ch4Warning
                                  ? 'bg-[#F5A524]'
                                  : 'bg-[#2E9E63]'
                              }`} 
                              style={{ width: `${ch4Pct}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </td>

                    {/* CO Gas with visual value + mini-bar */}
                    <td className="px-4 tabular-nums">
                      {isOffline ? (
                        <span className="text-[var(--text-3)]">--</span>
                      ) : (
                        <div className="flex flex-col gap-1 w-24">
                          <span className={`font-bold text-xs ${
                            w.telemetry.co >= thresholds.coCritical
                              ? 'text-[#B52A31] font-extrabold'
                              : w.telemetry.co >= thresholds.coWarning
                              ? 'text-[#8A5500]'
                              : 'text-[var(--text)]'
                          }`}>
                            {w.telemetry.co} ppm
                          </span>
                          <div className="w-full h-1.5 bg-[#E6DDD0] rounded-full overflow-hidden shadow-inner">
                            <div 
                              className={`h-full rounded-full ${
                                w.telemetry.co >= thresholds.coCritical
                                  ? 'bg-[#D13A3F]'
                                  : w.telemetry.co >= thresholds.coWarning
                                  ? 'bg-[#F5A524]'
                                  : 'bg-[#F5A524]'
                              }`} 
                              style={{ width: `${coPct}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Temp / RH */}
                    <td className="px-4 tabular-nums text-[var(--text-2)] text-xs font-semibold">
                      {isOffline ? (
                        <span className="text-[var(--text-3)]">--</span>
                      ) : (
                        <span>
                          {w.telemetry.temperature}°C / {w.telemetry.humidity}%
                        </span>
                      )}
                    </td>

                    {/* Freshness Indicator */}
                    <td className="px-4">
                      {isOffline ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-3)] font-medium">
                          <span className="w-2 h-2 rounded-full bg-[#8C8275]" />
                          Offline
                        </span>
                      ) : isStale ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#8A5500] font-bold">
                          <span className="w-2 h-2 rounded-full bg-[#F5A524]" />
                          Stale ({formatRelativeTime(w.lastSeen)})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#1E6B42] font-semibold">
                          <span className="w-2 h-2 rounded-full bg-[#2E9E63] animate-pulse" />
                          Live ({formatRelativeTime(w.lastSeen)})
                        </span>
                      )}
                    </td>

                    {/* Safety State */}
                    <td className="px-4">
                      <SafetyBadge state={w.safetyState} size="md" />
                    </td>

                    {/* Action */}
                    <td className="px-3 text-right">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onSelectWorker(w.id);
                        }}
                        className="clay-pill-inset p-1.5 text-[var(--text-3)] hover:text-[var(--text)] transition-colors"
                        title="View Live Telemetry Profile"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
