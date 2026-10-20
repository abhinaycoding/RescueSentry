import React from 'react';
import { Incident } from '../../types';
import { useSentry } from '../../context/SentryContext';
import { getIncidentCategoryDetails, formatDateTime, formatRelativeTime, formatTime } from '../../utils/formatters';
import { 
  X, 
  AlertOctagon, 
  ShieldCheck, 
  User, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  HardHat,
  Radio,
  FileText
} from 'lucide-react';

interface IncidentDetailDrawerProps {
  incidentId: string | null;
  onClose: () => void;
  onOpenResolve: (incident: Incident) => void;
}

export const IncidentDetailDrawer: React.FC<IncidentDetailDrawerProps> = ({
  incidentId,
  onClose,
  onOpenResolve
}) => {
  const { incidents, workers, acknowledgeIncident } = useSentry();

  const incident = incidents.find(i => i.id === incidentId);
  const worker = incident ? workers.find(w => w.id === incident.workerId) : null;

  if (!incident) return null;

  const categoryDetails = getIncidentCategoryDetails(incident.type);

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] clay-drawer bg-[#EFE7DC] border-l border-[#D8CEBF] shadow-2xl z-40 flex flex-col font-mono text-xs overflow-hidden animate-slideInRight text-[var(--text)]">
      {/* Header */}
      <div className="p-5 bg-[#E6DDD0] border-b border-[#D8CEBF] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="clay-pill-inset p-2 text-[#B52A31]">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[var(--text)] text-sm font-sans">{incident.id}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                incident.severity === 'CRITICAL' ? 'bg-[#F8C9C6] text-[#B52A31] border border-red-300' : 'bg-[#FCE7B8] text-[#8A5500] border border-amber-300'
              }`}>
                {incident.severity}
              </span>
            </div>
            <div className="text-[11px] text-[var(--text-3)] font-sans font-semibold mt-0.5">
              {categoryDetails.label}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="clay-pill-inset p-2 text-[var(--text-3)] hover:text-[var(--text)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Status card */}
        <div className="clay-raised p-5 rounded-[24px] border border-[#D8CEBF]/60 space-y-3">
          <span className="text-[10px] text-[var(--text-3)] uppercase tracking-wide font-extrabold block border-b border-[#D8CEBF]/60 pb-1.5 font-sans">
            Incident State & Compliance
          </span>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[var(--text-3)] block font-semibold">Status:</span>
              <span className={`font-extrabold ${
                incident.resolved 
                  ? 'text-[#1E6B42]' 
                  : incident.acknowledged 
                  ? 'text-[var(--info-ink)]' 
                  : 'text-[#B52A31]'
              }`}>
                {incident.resolved ? 'RESOLVED' : incident.acknowledged ? 'ACKNOWLEDGED' : 'OPEN / UNACKNOWLEDGED'}
              </span>
            </div>

            <div>
              <span className="text-[var(--text-3)] block font-semibold">Occurred At:</span>
              <span className="text-[var(--text)] font-bold">{formatDateTime(incident.timestamp)}</span>
            </div>

            {incident.acknowledged && (
              <div>
                <span className="text-[var(--text-3)] block font-semibold">Acknowledged By:</span>
                <span className="text-[var(--text)] font-bold">{incident.acknowledgedBy}</span>
              </div>
            )}

            {incident.resolved && (
              <div>
                <span className="text-[var(--text-3)] block font-semibold">Resolved By:</span>
                <span className="text-[#1E6B42] font-bold">{incident.resolvedBy}</span>
              </div>
            )}
          </div>

          {incident.resolutionNotes && (
            <div className="pt-2.5 border-t border-[#D8CEBF]/60">
              <span className="text-[10px] text-[var(--text-3)] uppercase tracking-wide block font-extrabold font-sans">
                Supervisor Corrective Action:
              </span>
              <p className="mt-1.5 text-[var(--text)] font-sans text-xs clay-inset p-3 rounded-[16px]">
                {incident.resolutionNotes}
              </p>
            </div>
          )}
        </div>

        {/* Worker & Hardware Snapshot */}
        <div className="clay-raised p-5 rounded-[24px] border border-[#D8CEBF]/60 space-y-2.5">
          <span className="text-[10px] text-[var(--text-3)] uppercase tracking-wide font-extrabold block border-b border-[#D8CEBF]/60 pb-1.5 font-sans">
            Worker & Hardware Profile
          </span>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--text-3)] font-semibold">Worker:</span>
              <span className="text-[var(--text)] font-extrabold">{incident.workerName} ({incident.workerId})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-3)] font-semibold">Assigned Sector:</span>
              <span className="text-[var(--info-ink)] font-bold">{incident.sector}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-3)] font-semibold">Helmet Device ID:</span>
              <span className="text-[var(--text-2)] font-mono font-bold">{incident.helmetId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-3)] font-semibold">Trigger Condition:</span>
              <span className="text-[#8A5500] font-bold">{incident.triggerValue}</span>
            </div>
          </div>
        </div>

        {/* Current Live Sensor Snapshot of this worker */}
        {worker && (
          <div className="clay-raised p-5 rounded-[24px] border border-[#D8CEBF]/60 space-y-3">
            <span className="text-[10px] text-[var(--text-3)] uppercase tracking-wide font-extrabold block border-b border-[#D8CEBF]/60 pb-1.5 font-sans">
              Live Sensor Readings (Current)
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="clay-inset p-3 rounded-[18px]">
                <span className="text-[var(--text-3)] block text-[10px] font-semibold">CH4 Methane:</span>
                <span className="text-base font-extrabold text-[var(--text)] tabular-nums">
                  {worker.telemetry.ch4.toFixed(2)}% LEL
                </span>
              </div>
              <div className="clay-inset p-3 rounded-[18px]">
                <span className="text-[var(--text-3)] block text-[10px] font-semibold">Carbon Monoxide:</span>
                <span className="text-base font-extrabold text-[#8A5500] tabular-nums">
                  {worker.telemetry.co} ppm
                </span>
              </div>
              <div className="clay-inset p-3 rounded-[18px]">
                <span className="text-[var(--text-3)] block text-[10px] font-semibold">Temperature:</span>
                <span className="text-sm font-extrabold text-[var(--text)]">
                  {worker.telemetry.temperature}°C
                </span>
              </div>
              <div className="clay-inset p-3 rounded-[18px]">
                <span className="text-[var(--text-3)] block text-[10px] font-semibold">Helmet Worn:</span>
                <span className={worker.helmetWorn ? 'text-[#1E6B42] font-bold' : 'text-[#8A5500] font-bold'}>
                  {worker.helmetWorn ? 'IN CONTACT' : 'DETACHED'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Complete Incident Timeline Audit */}
        <div className="clay-raised p-5 rounded-[24px] border border-[#D8CEBF]/60 space-y-3">
          <span className="text-[10px] text-[var(--text-3)] uppercase tracking-wide font-extrabold block border-b border-[#D8CEBF]/60 pb-1.5 font-sans">
            Chronological Audit Timeline
          </span>
          <div className="space-y-3 pt-2">
            {incident.timeline.map((item, index) => (
              <div key={item.id || index} className="relative pl-5 border-l-2 border-[#D8CEBF]">
                <div className="absolute -left-1.5 top-1 w-2.5 h-2.5 rounded-full bg-[#2E9E63] border-2 border-white" />
                <div className="text-[10px] text-[var(--text-3)] flex items-center justify-between font-semibold">
                  <span>{formatTime(item.timestamp)}</span>
                  <span className="text-[var(--text-2)] font-bold">{item.actor}</span>
                </div>
                <p className="text-xs text-[var(--text)] mt-0.5 font-sans font-medium">
                  {item.event}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-[#E6DDD0] border-t border-[#D8CEBF] flex items-center justify-end gap-3">
        {!incident.acknowledged && !incident.resolved && (
          <button
            type="button"
            onClick={() => acknowledgeIncident(incident.id)}
            className="clay-button clay-btn-amber h-10 px-4 text-xs font-mono font-bold uppercase tracking-wider"
          >
            Acknowledge Alert
          </button>
        )}

        {!incident.resolved && (
          <button
            type="button"
            onClick={() => onOpenResolve(incident)}
            className="clay-button clay-btn-green h-10 px-4 text-xs font-mono font-bold uppercase tracking-wider text-white"
          >
            Resolve Incident
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className="clay-button clay-btn-cream h-10 px-4 text-xs font-mono font-bold text-[var(--text)]"
        >
          Close
        </button>
      </div>
    </div>
  );
};
