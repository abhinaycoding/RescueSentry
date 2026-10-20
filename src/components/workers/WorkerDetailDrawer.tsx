import React, { useMemo } from 'react';
import { Worker } from '../../types';
import { useSentry } from '../../context/SentryContext';
import { SafetyBadge, HelmetWearBadge } from '../common/StatusBadge';
import { GasGauge } from '../common/GasGauge';
import { formatTime, formatRelativeTime, formatDateTime } from '../../utils/formatters';
import { generateWorkerHistory } from '../../services/mockData';
import { 
  X, 
  User, 
  HardHat, 
  Battery, 
  Wifi, 
  Radio, 
  Clock, 
  AlertTriangle, 
  PhoneCall, 
  ShieldAlert,
  Ambulance,
  Check
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface WorkerDetailDrawerProps {
  workerId: string | null;
  onClose: () => void;
}

export const WorkerDetailDrawer: React.FC<WorkerDetailDrawerProps> = ({ workerId, onClose }) => {
  const { 
    workers, 
    incidents, 
    setSelectedIncidentId, 
    setActivePage,
    dispatchRescue,
    callWorkerRadio,
    rescueDispatchedWorkerId,
    radioActiveWorkerId
  } = useSentry();

  const worker = useMemo(() => {
    return workers.find(w => w.id === workerId);
  }, [workers, workerId]);

  const workerIncidents = useMemo(() => {
    if (!workerId) return [];
    return incidents.filter(i => i.workerId === workerId);
  }, [incidents, workerId]);

  const historyData = useMemo(() => {
    if (!worker) return [];
    return generateWorkerHistory(worker, 15);
  }, [worker]);

  if (!worker) return null;

  const isOffline = worker.connectionStatus === 'OFFLINE';
  const isStale = worker.connectionStatus === 'STALE';
  const isSos = worker.telemetry.sosPressed;
  const isRescueDispatched = rescueDispatchedWorkerId === worker.id;
  const isRadioActive = radioActiveWorkerId === worker.id;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[520px] clay-drawer bg-[#EFE7DC] border-l border-[#D8CEBF] shadow-2xl z-40 flex flex-col text-xs overflow-hidden animate-slideInRight text-[var(--text)]">
      {/* Drawer Header */}
      <div className="p-5 bg-[#E6DDD0] border-b border-[#D8CEBF] flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shadow-sm ${
            isSos 
              ? 'bg-[#D13A3F] text-white' 
              : 'clay-pill-inset text-[var(--info-ink)]'
          }`}>
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--text)] font-extrabold text-base font-sans">{worker.name}</span>
              <span className="text-[var(--text-2)] text-xs font-mono clay-pill-inset px-2.5 py-0.5 font-bold">
                {worker.id}
              </span>
            </div>
            <div className="text-xs text-[var(--text-3)] font-sans mt-0.5 font-semibold">
              {worker.role} • {worker.shift}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="clay-pill-inset p-2 text-[var(--text-3)] hover:text-[var(--text)] transition-colors"
          title="Close profile drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 font-sans">
        {/* Urgent Alert Banner if SOS or Critical */}
        {isSos && (
          <div className="clay-critical p-4 border border-red-300 text-[#B52A31] flex items-start gap-3.5">
            <ShieldAlert className="w-6 h-6 text-[#B52A31] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-extrabold text-xs uppercase tracking-wide font-mono">
                CRITICAL SOS DISTRESS TRIGGERED
              </div>
              <p className="text-xs text-[var(--text)] mt-1 leading-relaxed font-medium">
                Worker manually activated tactile emergency alarm on ESP32 helmet. Immediate dispatch required in {worker.sector}.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => dispatchRescue(worker.id, worker.sector)}
            className={`clay-button h-11 px-3 text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 ${
              isRescueDispatched
                ? 'clay-btn-green text-white'
                : 'clay-btn-red text-white'
            }`}
          >
            <Ambulance className="w-4 h-4" />
            <span>{isRescueDispatched ? 'Rescue Dispatched' : 'Dispatch Rescue'}</span>
          </button>

          <button
            type="button"
            onClick={() => callWorkerRadio(worker.id)}
            className={`clay-button h-11 px-3 text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 ${
              isRadioActive
                ? 'clay-btn-green text-white'
                : 'clay-btn-cream text-[var(--text)]'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>{isRadioActive ? 'Radio Connected' : 'Call VHF Ch 4'}</span>
          </button>
        </div>

        {/* Status & Wear Diagnostic Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="clay-raised p-4 rounded-[22px] border border-[#D8CEBF]/60">
            <span className="text-xs text-[var(--text-3)] uppercase tracking-wide block mb-1.5 font-bold">
              Safety Classification
            </span>
            <SafetyBadge state={worker.safetyState} size="md" />
          </div>

          <div className="clay-raised p-4 rounded-[22px] border border-[#D8CEBF]/60">
            <span className="text-xs text-[var(--text-3)] uppercase tracking-wide block mb-1.5 font-bold">
              Optical Wear Sensor
            </span>
            <HelmetWearBadge worn={worker.helmetWorn} />
          </div>
        </div>

        {/* Offline / Stale Warning Notice */}
        {(isOffline || isStale) && (
          <div className="clay-warning p-4 border border-amber-300 text-[#8A5500]">
            <div className="flex items-center gap-2 font-bold uppercase text-xs font-mono">
              <AlertTriangle className="w-4 h-4 text-[#8A5500]" />
              <span>{isOffline ? 'Helmet Offline — Unconfirmed Safety' : 'Stale Telemetry Notice'}</span>
            </div>
            <p className="mt-1 text-xs text-[var(--text)] leading-relaxed font-medium">
              {isOffline 
                ? 'Device has ceased RF transmissions. Protocol dictates verifying worker status via mine communication channel.'
                : 'Packet latency exceeds 25 seconds. Sensor measurements may not reflect real-time atmospheric levels.'}
            </p>
          </div>
        )}

        {/* Assigned Hardware & Deployment */}
        <div className="clay-raised p-5 rounded-[24px] border border-[#D8CEBF]/60 space-y-3">
          <span className="text-xs text-[var(--text-2)] uppercase tracking-wide font-extrabold block border-b border-[#D8CEBF]/60 pb-2 font-sans">
            Hardware & Location Profile
          </span>
          <div className="grid grid-cols-2 gap-y-2.5 text-xs">
            <span className="text-[var(--text-3)] font-semibold">Assigned Helmet:</span>
            <span className="text-[var(--text)] font-mono font-bold">{worker.helmetId}</span>

            <span className="text-[var(--text-3)] font-semibold">Assigned Sector:</span>
            <span className="text-[var(--text)] font-bold">{worker.sector}</span>

            <span className="text-[var(--text-3)] font-semibold">Blood Group:</span>
            <span className="text-[var(--text)] font-mono font-bold">{worker.bloodGroup}</span>

            <span className="text-[var(--text-3)] font-semibold">Emergency VHF:</span>
            <span className="text-[var(--text)] font-mono font-bold">{worker.emergencyContact}</span>

            <span className="text-[var(--text-3)] font-semibold">Mesh Signal (RSSI):</span>
            <span className="text-[var(--text)] font-mono font-bold">{worker.telemetry.rssi} dBm</span>

            <span className="text-[var(--text-3)] font-semibold">Battery Level:</span>
            <span className="text-[var(--text)] font-mono font-extrabold">{worker.telemetry.batteryPct}%</span>

            <span className="text-[var(--text-3)] font-semibold">Last Telemetry:</span>
            <span className="text-[var(--text-2)] font-mono">{formatDateTime(worker.lastSeen)}</span>
          </div>
        </div>

        {/* Real-time Atmospheric Gauges */}
        <div className="clay-raised p-5 rounded-[24px] border border-[#D8CEBF]/60 space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#D8CEBF]/60 pb-2">
            <span className="text-xs text-[var(--text-2)] uppercase tracking-wide font-extrabold">
              Atmospheric & Environmental Telemetry
            </span>
            <span className="text-xs text-[var(--text-3)] font-mono font-semibold">
              Sampled {formatRelativeTime(worker.telemetry.timestamp)}
            </span>
          </div>

          <GasGauge
            label="CH4 Methane"
            value={worker.telemetry.ch4}
            unit="% LEL"
            warningThreshold={1.0}
            criticalThreshold={1.5}
            maxScale={2.5}
          />

          <GasGauge
            label="Carbon Monoxide (CO)"
            value={worker.telemetry.co}
            unit="ppm"
            warningThreshold={25}
            criticalThreshold={50}
            maxScale={80}
          />

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="clay-inset p-3 rounded-[18px]">
              <span className="text-xs text-[var(--text-3)] block mb-1 font-semibold">Ambient Temp</span>
              <span className="text-base font-extrabold text-[var(--text)] font-mono tabular-nums">
                {worker.telemetry.temperature}°C
              </span>
            </div>
            <div className="clay-inset p-3 rounded-[18px]">
              <span className="text-xs text-[var(--text-3)] block mb-1 font-semibold">Relative Humidity</span>
              <span className="text-base font-extrabold text-[#1E6B42] font-mono tabular-nums">
                {worker.telemetry.humidity}% RH
              </span>
            </div>
          </div>
        </div>

        {/* 15-Minute Trend Mini Chart */}
        <div className="clay-raised p-5 rounded-[24px] border border-[#D8CEBF]/60 space-y-2">
          <span className="text-xs text-[var(--text-2)] uppercase tracking-wide font-extrabold block border-b border-[#D8CEBF]/60 pb-2 font-sans">
            Gas Trend Telemetry (Past 15 Mins)
          </span>
          <div className="h-40 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D8CEBF" />
                <XAxis dataKey="time" stroke="#8C8275" tick={{ fontSize: 11, fill: '#5C544B', fontFamily: 'monospace' }} />
                <YAxis stroke="#8C8275" tick={{ fontSize: 11, fill: '#5C544B', fontFamily: 'monospace' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="clay-raised p-2.5 rounded-xl border border-[#D8CEBF] font-mono text-xs shadow-md">
                          <div className="text-[#3B4F8A] font-bold">CH4: {payload[0].value}% LEL</div>
                          <div className="text-[#8A5500] font-bold">CO: {payload[1]?.value} ppm</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="ch4" stroke="#3B4F8A" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="co" stroke="#F5A524" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Associated Incidents */}
        <div className="clay-raised p-5 rounded-[24px] border border-[#D8CEBF]/60 space-y-3">
          <div className="flex items-center justify-between border-b border-[#D8CEBF]/60 pb-2">
            <span className="text-xs text-[var(--text-2)] uppercase tracking-wide font-extrabold">
              Related Safety Incidents ({workerIncidents.length})
            </span>
          </div>

          {workerIncidents.length === 0 ? (
            <p className="text-[var(--text-3)] text-xs py-1 font-medium">
              No recorded safety violations or distress calls for this worker.
            </p>
          ) : (
            <div className="space-y-2.5">
              {workerIncidents.map(inc => (
                <div
                  key={inc.id}
                  onClick={() => {
                    setSelectedIncidentId(inc.id);
                    setActivePage('incidents');
                    onClose();
                  }}
                  className="clay-inset p-3 rounded-[16px] hover:brightness-95 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[var(--text)] font-mono">{inc.id}</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase font-mono ${
                      inc.resolved 
                        ? 'text-[#1E6B42] bg-[#CDEBD9]' 
                        : 'text-[#B52A31] bg-[#F8C9C6]'
                    }`}>
                      {inc.resolved ? 'RESOLVED' : inc.acknowledged ? 'ACKNOWLEDGED' : 'ACTION NEEDED'}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--warning-ink)] mt-1 font-mono font-semibold">{inc.triggerValue}</p>
                  <span className="text-xs text-[var(--text-3)] mt-0.5 block font-mono">{formatDateTime(inc.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
