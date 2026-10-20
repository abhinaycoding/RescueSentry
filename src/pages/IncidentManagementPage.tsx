import React, { useState, useMemo } from 'react';
import { useSentry } from '../context/SentryContext';
import { Incident, IncidentCategory, IncidentSeverity } from '../types';
import { IncidentRow } from '../components/incidents/IncidentRow';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { exportToCSV } from '../utils/formatters';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  Clock, 
  ShieldAlert,
  Flame,
  HardHat,
  WifiOff
} from 'lucide-react';

export const IncidentManagementPage: React.FC = () => {
  const { 
    incidents, 
    selectedIncidentId, 
    setSelectedIncidentId, 
    acknowledgeIncident, 
    resolveIncident,
    metrics
  } = useSentry();

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNRESOLVED' | 'UNACKNOWLEDGED' | 'RESOLVED'>('ALL');

  // Modal state for resolving incident
  const [incidentToResolve, setIncidentToResolve] = useState<Incident | null>(null);

  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const matchesSearch = 
        inc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.workerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.sector.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;
      const matchesCategory = categoryFilter === 'ALL' || inc.type === categoryFilter;

      let matchesStatus = true;
      if (statusFilter === 'UNRESOLVED') {
        matchesStatus = !inc.resolved;
      } else if (statusFilter === 'UNACKNOWLEDGED') {
        matchesStatus = !inc.acknowledged && !inc.resolved;
      } else if (statusFilter === 'RESOLVED') {
        matchesStatus = inc.resolved;
      }

      return matchesSearch && matchesSeverity && matchesCategory && matchesStatus;
    });
  }, [incidents, searchTerm, severityFilter, categoryFilter, statusFilter]);

  const handleOpenResolve = (incident: Incident) => {
    setIncidentToResolve(incident);
  };

  const handleConfirmResolve = (notes: string) => {
    if (incidentToResolve) {
      resolveIncident(incidentToResolve.id, notes);
      setIncidentToResolve(null);
    }
  };

  const handleExport = () => {
    const rows = filteredIncidents.map(i => ({
      IncidentID: i.id,
      WorkerID: i.workerId,
      WorkerName: i.workerName,
      HelmetID: i.helmetId,
      Sector: i.sector,
      Category: i.type,
      Severity: i.severity,
      Timestamp: i.timestamp,
      TriggerValue: i.triggerValue,
      Acknowledged: i.acknowledged ? 'YES' : 'NO',
      AcknowledgedBy: i.acknowledgedBy || '',
      Resolved: i.resolved ? 'YES' : 'NO',
      ResolvedBy: i.resolvedBy || '',
      ResolutionNotes: i.resolutionNotes || ''
    }));
    exportToCSV(`RescueSentry-Incidents-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <div className="space-y-5 animate-fadeIn font-sans text-[var(--text)]">
      {/* Banner / Stat Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="clay-critical p-5 border border-red-300 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-[#B52A31] uppercase tracking-wide font-extrabold">
              Critical SOS Alarms
            </span>
            <div className="text-3xl font-extrabold font-mono text-[#B52A31] mt-1 tabular-nums">
              {metrics.criticalSosIncidentsCount}
            </div>
          </div>
          <div className="clay-pill-inset p-2.5 text-[#B52A31]">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="clay-warning p-5 border border-amber-300 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-[#8A5500] uppercase tracking-wide font-extrabold">
              Unacknowledged Alerts
            </span>
            <div className="text-3xl font-extrabold font-mono text-[#8A5500] mt-1 tabular-nums">
              {metrics.unacknowledgedIncidentsCount}
            </div>
          </div>
          <div className="clay-pill-inset p-2.5 text-[#8A5500]">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="clay-raised p-5 rounded-[28px] border border-[#D8CEBF]/60 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-[var(--text-3)] uppercase tracking-wide font-bold">
              Active Unresolved
            </span>
            <div className="text-3xl font-extrabold font-mono text-[var(--text)] mt-1 tabular-nums">
              {metrics.activeIncidentsCount}
            </div>
          </div>
          <div className="clay-pill-inset p-2.5 text-[var(--text-3)]">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="clay-ok p-5 border border-emerald-300 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-[#1E6B42] uppercase tracking-wide font-extrabold">
              Resolved This Shift
            </span>
            <div className="text-3xl font-extrabold font-mono text-[#1E6B42] mt-1 tabular-nums">
              {metrics.resolvedIncidentsCount}
            </div>
          </div>
          <div className="clay-pill-inset p-2.5 text-[#1E6B42]">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="clay-raised p-4 border border-[#D8CEBF]/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="w-4 h-4 text-[var(--text-3)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search incident ID, miner, or sector..."
              className="w-full pl-10 pr-4 py-2 text-xs clay-input font-mono text-[var(--text)] placeholder-[var(--text-3)]"
            />
          </div>

          {/* Severity filter */}
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="clay-pill-inset px-4 py-2 text-xs font-mono text-[var(--text)] font-semibold cursor-pointer focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="WARNING">Warning Only</option>
            <option value="INFO">Info Only</option>
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="clay-pill-inset px-4 py-2 text-xs font-mono text-[var(--text)] font-semibold cursor-pointer focus:outline-none"
          >
            <option value="ALL">All Incident Types</option>
            <option value="SOS_EMERGENCY">SOS Emergency</option>
            <option value="HAZARDOUS_GAS">Hazardous Gas</option>
            <option value="HELMET_REMOVED">Helmet Removed</option>
            <option value="ENVIRONMENTAL_WARNING">Environmental Warning</option>
            <option value="DEVICE_DISCONNECTED">Device Disconnected</option>
          </select>

          {/* Status filter tabs */}
          <div className="flex items-center clay-pill-inset p-1 font-mono text-xs">
            {(['ALL', 'UNRESOLVED', 'UNACKNOWLEDGED', 'RESOLVED'] as const).map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  statusFilter === st 
                    ? 'bg-[#2A2520] text-white shadow-sm' 
                    : 'text-[var(--text-3)] hover:text-[var(--text)]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Export CSV button */}
        <button
          type="button"
          onClick={handleExport}
          className="clay-button clay-btn-cream h-9 px-4 text-xs font-mono font-bold flex items-center gap-2"
        >
          <Download className="w-3.5 h-3.5 text-[var(--info-ink)]" />
          <span>Export Incidents</span>
        </button>
      </div>

      {/* Incident List */}
      <div className="space-y-3.5">
        {filteredIncidents.length === 0 ? (
          <div className="p-12 text-center clay-inset rounded-[28px]">
            <CheckCircle className="w-10 h-10 text-[#1E6B42] mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-extrabold text-[var(--text)] font-mono">No Incidents Found</h4>
            <p className="text-xs text-[var(--text-3)] mt-1 font-sans font-medium">
              There are no safety incidents matching your current filters and search criteria.
            </p>
          </div>
        ) : (
          filteredIncidents.map(inc => (
            <IncidentRow
              key={inc.id}
              incident={inc}
              isSelected={selectedIncidentId === inc.id}
              onSelect={setSelectedIncidentId}
              onAcknowledge={acknowledgeIncident}
              onOpenResolve={handleOpenResolve}
            />
          ))
        )}
      </div>

      {/* Resolution Confirmation Modal */}
      {incidentToResolve && (
        <ConfirmModal
          isOpen={!!incidentToResolve}
          onClose={() => setIncidentToResolve(null)}
          title={`Resolve Incident ${incidentToResolve.id}`}
          description={`You are marking the ${incidentToResolve.type.replace('_', ' ')} incident for ${incidentToResolve.workerName} (${incidentToResolve.sector}) as formally RESOLVED. In accordance with underground mining health and safety protocols, document the corrective inspection or ventilation response below.`}
          confirmLabel="Mark Incident Resolved"
          variant="teal"
          requireNotes={true}
          notesPlaceholder="e.g. Auxiliary intake boosted; worker confirmed safe on channel 4; gas normalized to 0.08% LEL."
          onConfirm={handleConfirmResolve}
        />
      )}
    </div>
  );
};
