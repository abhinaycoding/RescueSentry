import React, { useState } from 'react';
import { useSentry } from '../context/SentryContext';
import { WorkerTable } from '../components/workers/WorkerTable';
import { WorkerGrid } from '../components/workers/WorkerGrid';
import { ProvisionWorkerModal } from '../components/workers/ProvisionWorkerModal';
import { 
  Users, 
  LayoutGrid, 
  List, 
  ShieldCheck, 
  HardHat, 
  AlertTriangle, 
  Zap, 
  Sparkles,
  RefreshCw,
  UserPlus
} from 'lucide-react';

export const WorkerMonitoringPage: React.FC = () => {
  const { 
    workers, 
    selectedWorkerId, 
    setSelectedWorkerId, 
    triggerSimulation,
    mode 
  } = useSentry();

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);

  const total = workers.length;
  const critical = workers.filter(w => w.safetyState === 'CRITICAL').length;
  const warning = workers.filter(w => w.safetyState === 'WARNING').length;
  const normal = workers.filter(w => w.safetyState === 'NORMAL').length;
  const removed = workers.filter(w => w.connectionStatus === 'ONLINE' && !w.helmetWorn).length;
  const offline = workers.filter(w => w.connectionStatus === 'OFFLINE' || w.connectionStatus === 'STALE').length;

  return (
    <div className="space-y-5 animate-fadeIn text-[var(--text)]">
      {/* Top Banner / Worker Fleet Header */}
      <div className="clay-raised p-5 border border-[#D8CEBF]/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="clay-pill-inset p-2 text-[var(--info-ink)]">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-base font-extrabold font-sans tracking-tight text-[var(--text)] uppercase">
              Worker Telemetry & Smart Helmet Fleet
            </h2>
          </div>
          <p className="text-xs text-[var(--text-3)] mt-1 font-sans font-medium">
            Continuous real-time optical wear proximity, atmospheric gas exposure, and emergency telemetry for all underground personnel.
          </p>
        </div>

        {/* View Mode Toggle & Simulation */}
        <div className="flex flex-wrap items-center gap-3">
          {mode === 'demo' && (
            <div className="hidden sm:flex items-center gap-1.5 clay-pill-inset p-1 font-mono text-[11px]">
              <span className="text-[var(--text-3)] px-2 flex items-center gap-1 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#8A5500]" />
                Simulate:
              </span>
              <button
                type="button"
                onClick={() => triggerSimulation('SPURT_GAS')}
                className="px-2.5 py-1 rounded-full bg-[#FCE7B8] hover:bg-[#FAD785] text-[#8A5500] font-bold transition-all shadow-sm"
                title="Spike Methane gas on Worker 104"
              >
                Gas Spike
              </button>
              <button
                type="button"
                onClick={() => triggerSimulation('DETACH_HELMET')}
                className="px-2.5 py-1 rounded-full bg-[#FCE7B8] hover:bg-[#FAD785] text-[#8A5500] font-bold transition-all shadow-sm"
                title="Toggle helmet optical detachment on Worker 106"
              >
                Detach Helmet
              </button>
              <button
                type="button"
                onClick={() => triggerSimulation('SIMULATE_SOS')}
                className="px-2.5 py-1 rounded-full bg-[#F8C9C6] hover:bg-[#F4A5A0] text-[#B52A31] font-bold transition-all shadow-sm"
                title="Simulate manual SOS button press on Worker 105"
              >
                Trigger SOS
              </button>
              <button
                type="button"
                onClick={() => triggerSimulation('RECONNECT_ALL')}
                className="px-2.5 py-1 rounded-full bg-[#CDEBD9] hover:bg-[#A6DCBA] text-[#1E6B42] font-bold transition-all shadow-sm"
                title="Normalize all helmet states"
              >
                Normalize
              </button>
            </div>
          )}

          <div className="flex items-center clay-pill-inset p-1 font-mono text-xs">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold transition-all ${
                viewMode === 'table' ? 'bg-[#2A2520] text-white shadow-sm' : 'text-[var(--text-3)] hover:text-[var(--text)]'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
              <span className="hidden md:inline">Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold transition-all ${
                viewMode === 'grid' ? 'bg-[#2A2520] text-white shadow-sm' : 'text-[var(--text-3)] hover:text-[var(--text)]'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden md:inline">Cards</span>
            </button>
          </div>
          {/* Add Worker Button */}
          <button
            type="button"
            onClick={() => setIsProvisionModalOpen(true)}
            className="clay-button clay-btn-amber h-9 px-4 text-xs font-mono font-extrabold flex items-center gap-2 shadow-sm transition-all"
            title="Provision new ESP32 smart helmet and register miner"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Miner</span>
          </button>
        </div>
      </div>

      {/* Quick Fleet Health Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 text-xs font-mono">
        <div className="clay-raised p-4 rounded-[22px] border border-[#D8CEBF]/60">
          <span className="text-[10px] text-[var(--text-3)] uppercase tracking-wide block font-bold">Total Miners</span>
          <span className="text-2xl font-extrabold text-[var(--text)] tabular-nums mt-1 block">{total}</span>
        </div>

        <div className="clay-raised p-4 rounded-[22px] border border-emerald-300 bg-[#CDEBD9]/30">
          <span className="text-[10px] text-[#1E6B42] uppercase tracking-wide block font-bold">Safe / Normal</span>
          <span className="text-2xl font-extrabold text-[#1E6B42] tabular-nums mt-1 block">{normal}</span>
        </div>

        <div className="clay-raised p-4 rounded-[22px] border border-amber-300 bg-[#FCE7B8]/30">
          <span className="text-[10px] text-[#8A5500] uppercase tracking-wide block font-bold">Warning Level</span>
          <span className="text-2xl font-extrabold text-[#8A5500] tabular-nums mt-1 block">{warning}</span>
        </div>

        <div className="clay-raised p-4 rounded-[22px] border border-red-300 bg-[#F8C9C6]/30">
          <span className="text-[10px] text-[#B52A31] uppercase tracking-wide block font-bold">Critical Danger</span>
          <span className="text-2xl font-extrabold text-[#B52A31] tabular-nums mt-1 block">{critical}</span>
        </div>

        <div className="clay-raised p-4 rounded-[22px] border border-amber-300 bg-[#FCE7B8]/30">
          <span className="text-[10px] text-[#8A5500] uppercase tracking-wide block font-bold">Helmets Removed</span>
          <span className="text-2xl font-extrabold text-[#8A5500] tabular-nums mt-1 block">{removed}</span>
        </div>

        <div className="clay-raised p-4 rounded-[22px] border border-[#D8CEBF]/60">
          <span className="text-[10px] text-[var(--text-3)] uppercase tracking-wide block font-bold">Offline / Stale</span>
          <span className="text-2xl font-extrabold text-[var(--text-2)] tabular-nums mt-1 block">{offline}</span>
        </div>
      </div>

      {/* Main View: Table or Grid */}
      {viewMode === 'table' ? (
        <WorkerTable
          workers={workers}
          onSelectWorker={setSelectedWorkerId}
          selectedWorkerId={selectedWorkerId}
        />
      ) : (
        <WorkerGrid
          workers={workers}
          onSelectWorker={setSelectedWorkerId}
          selectedWorkerId={selectedWorkerId}
        />
      )}
      {/* Provision Worker Modal */}
      <ProvisionWorkerModal
        isOpen={isProvisionModalOpen}
        onClose={() => setIsProvisionModalOpen(false)}
      />
    </div>
  );
};
