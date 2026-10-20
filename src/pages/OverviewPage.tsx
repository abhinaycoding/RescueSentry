import React, { useState } from 'react';
import { useSentry } from '../context/SentryContext';
import { SosCommandBar } from '../components/overview/SosCommandBar';
import { TieredKpiSection } from '../components/overview/TieredKpiSection';
import { StackedTelemetryChart } from '../components/charts/StackedTelemetryChart';
import { OperationsIncidentPanel } from '../components/incidents/OperationsIncidentPanel';
import { WorkerTable } from '../components/workers/WorkerTable';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Incident } from '../types';
import { Users, HardHat, AlertOctagon } from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { workers, setSelectedWorkerId, resolveIncident } = useSentry();
  const [incidentToResolve, setIncidentToResolve] = useState<Incident | null>(null);

  const handleConfirmResolve = (notes: string) => {
    if (incidentToResolve) {
      resolveIncident(incidentToResolve.id, notes);
      setIncidentToResolve(null);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. SOS Command Bar (Critical Dominates / Slim All-Clear) */}
      <SosCommandBar />

      {/* 2. Tiered Operational KPI Layout */}
      <TieredKpiSection />

      {/* 3. 50/50 Balanced Grid: Small-Multiples Telemetry Chart & Priority Incident Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        {/* Left: Stacked Small-Multiples Gas Telemetry (CH4 & CO) */}
        <div className="min-h-[460px]">
          <StackedTelemetryChart />
        </div>

        {/* Right: Equal-Weight Incident Management Panel */}
        <div className="min-h-[460px]">
          <OperationsIncidentPanel onOpenResolveModal={setIncidentToResolve} />
        </div>
      </div>

      {/* 4. Worker Fleet Safety Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="clay-pill-inset p-1.5 text-[var(--info-ink)]">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-extrabold text-[var(--text)] uppercase tracking-wide font-sans">
              Worker Fleet Telemetry & Safety Ranking
            </h3>
          </div>
          <span className="text-xs text-[var(--text-3)] font-mono font-semibold">
            Sorted severity-first (SOS &gt; Warning &gt; Offline &gt; Normal) • Click row to inspect
          </span>
        </div>

        <WorkerTable
          workers={workers}
          onSelectWorker={setSelectedWorkerId}
        />
      </div>

      {/* Resolution Confirmation Modal */}
      {incidentToResolve && (
        <ConfirmModal
          isOpen={!!incidentToResolve}
          onClose={() => setIncidentToResolve(null)}
          title={`Resolve Incident ${incidentToResolve.id}`}
          description={`Formal incident resolution for ${incidentToResolve.workerName} (${incidentToResolve.sector}). In compliance with underground mine safety regulations, enter corrective actions before closing:`}
          confirmLabel="Confirm Resolution"
          variant="teal"
          requireNotes={true}
          notesPlaceholder="Document actions taken (e.g. secondary gas test confirmed <0.5% LEL; miner accompanied to surface)."
          onConfirm={handleConfirmResolve}
        />
      )}
    </div>
  );
};
