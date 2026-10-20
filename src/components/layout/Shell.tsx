import React, { useState } from 'react';
import { useSentry } from '../../context/SentryContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { OverviewPage } from '../../pages/OverviewPage';
import { WorkerMonitoringPage } from '../../pages/WorkerMonitoringPage';
import { IncidentManagementPage } from '../../pages/IncidentManagementPage';
import { AnalyticsPage } from '../../pages/AnalyticsPage';
import { SystemHealthPage } from '../../pages/SystemHealthPage';
import { SettingsPage } from '../../pages/SettingsPage';
import { WorkerDetailDrawer } from '../workers/WorkerDetailDrawer';
import { IncidentDetailDrawer } from '../incidents/IncidentDetailDrawer';
import { ConfirmModal } from '../common/ConfirmModal';
import { formatTime } from '../../utils/formatters';
import { AlertTriangle, WifiOff, X } from 'lucide-react';

export const Shell: React.FC = () => {
  const { 
    activePage, 
    selectedWorkerId, 
    setSelectedWorkerId,
    selectedIncidentId,
    setSelectedIncidentId,
    apiError,
    mode,
    setMode,
    resolveIncident,
    incidents,
    selectedSite,
    lastSyncTime
  } = useSentry();

  const [incidentToResolve, setIncidentToResolve] = useState<string | null>(null);

  const renderActivePage = () => {
    switch (activePage) {
      case 'overview':
        return <OverviewPage />;
      case 'workers':
        return <WorkerMonitoringPage />;
      case 'incidents':
        return <IncidentManagementPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'health':
        return <SystemHealthPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  const handleOpenResolveFromDrawer = (inc: { id: string }) => {
    setIncidentToResolve(inc.id);
  };

  const handleConfirmResolve = (notes: string) => {
    if (incidentToResolve) {
      resolveIncident(incidentToResolve, notes);
      setIncidentToResolve(null);
    }
  };

  const currentResolvingIncident = incidentToResolve 
    ? incidents.find(i => i.id === incidentToResolve) 
    : null;

  const isGatewayDegraded = selectedSite.gatewayStatus !== 'ONLINE';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <Topbar />

        {/* Gateway Stale / Connection Loss Alert Banner */}
        {isGatewayDegraded && (
          <div className="mx-6 mt-3 px-5 py-3 rounded-2xl bg-[var(--warning-clay)] border border-amber-500/40 flex items-center justify-between text-xs font-mono text-[var(--warning-ink)] shadow-sm">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[var(--warning-ink)] flex-shrink-0" />
              <span>
                <strong>MESH GATEWAY COMMUNICATION INTERRUPTED:</strong> Telemetry data stale since {formatTime(lastSyncTime.toISOString())}. Values in {selectedSite.name} may not reflect live underground atmosphere.
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[var(--warning)] text-[var(--text)] font-bold uppercase text-[11px] shadow-sm">
              Degraded Link
            </span>
          </div>
        )}

        {/* API Error Notification Banner (Shown when API mode fails) */}
        {mode === 'api' && apiError && (
          <div className="mx-6 mt-3 px-5 py-3 rounded-2xl bg-[var(--critical-clay)] border border-red-500/40 flex items-center justify-between text-xs font-mono text-[var(--critical-ink)] shadow-sm">
            <div className="flex items-center gap-2.5">
              <WifiOff className="w-4 h-4 text-[var(--critical-ink)] flex-shrink-0" />
              <span>
                <strong>Flask API Connection Failure:</strong> Unable to connect to backend at{' '}
                <code className="text-[var(--text)] bg-white/70 px-1.5 py-0.5 rounded-md font-bold">
                  {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}
                </code>
                . ({apiError})
              </span>
            </div>
            <button
              onClick={() => setMode('demo')}
              className="px-3 py-1.5 rounded-xl bg-[var(--critical)] hover:bg-red-700 text-white font-bold transition-all shadow-sm uppercase text-xs"
            >
              Switch back to Demo Mode
            </button>
          </div>
        )}

        {/* Scrollable Page Body */}
        <main className={`flex-1 overflow-y-auto p-5 md:p-6 ${isGatewayDegraded ? 'opacity-90' : ''}`}>
          <div className="max-w-[1600px] mx-auto">
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Slide-out Drawers */}
      {selectedWorkerId && (
        <WorkerDetailDrawer
          workerId={selectedWorkerId}
          onClose={() => setSelectedWorkerId(null)}
        />
      )}

      {selectedIncidentId && (
        <IncidentDetailDrawer
          incidentId={selectedIncidentId}
          onClose={() => setSelectedIncidentId(null)}
          onOpenResolve={handleOpenResolveFromDrawer}
        />
      )}

      {/* Global Resolve Incident Modal */}
      {incidentToResolve && currentResolvingIncident && (
        <ConfirmModal
          isOpen={!!incidentToResolve}
          onClose={() => setIncidentToResolve(null)}
          title={`Resolve Incident ${currentResolvingIncident.id}`}
          description={`Formal incident resolution for worker ${currentResolvingIncident.workerName} (${currentResolvingIncident.sector}). Log corrective actions taken:`}
          confirmLabel="Mark Incident Resolved"
          variant="teal"
          requireNotes={true}
          notesPlaceholder="Document actions taken (e.g. checked gas level with secondary handheld detector; cleared sector)."
          onConfirm={handleConfirmResolve}
        />
      )}
    </div>
  );
};
