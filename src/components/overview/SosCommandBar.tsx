import React, { useState, useEffect } from 'react';
import { useSentry } from '../../context/SentryContext';
import { 
  AlertOctagon, 
  ShieldCheck, 
  Radio, 
  Ambulance, 
  Check, 
  Clock, 
  MapPin, 
  HardHat, 
  Flame,
  Volume2
} from 'lucide-react';

export const SosCommandBar: React.FC = () => {
  const { 
    metrics, 
    activeSosIncident, 
    activeSosWorker, 
    acknowledgeIncident, 
    dispatchRescue, 
    callWorkerRadio,
    rescueDispatchedWorkerId,
    radioActiveWorkerId,
    setSelectedIncidentId,
    setActivePage
  } = useSentry();

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [dispatchConfirm, setDispatchConfirm] = useState<boolean>(false);

  // Live timer since SOS trigger
  useEffect(() => {
    if (!activeSosIncident) {
      setElapsedSeconds(0);
      return;
    }

    const calcElapsed = () => {
      const start = new Date(activeSosIncident.timestamp).getTime();
      const diff = Math.max(0, Math.floor((Date.now() - start) / 1000));
      setElapsedSeconds(diff);
    };

    calcElapsed();
    const interval = setInterval(calcElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeSosIncident]);

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  // 1. All-Clear Slim State (When zero SOS active)
  if (metrics.criticalSosIncidentsCount === 0 || !activeSosIncident) {
    return (
      <div className="clay-raised p-5 flex flex-wrap items-center justify-between gap-4 border border-[#D8CEBF]/60 transition-all duration-200">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#CDEBD9] text-[#1E6B42] flex items-center justify-center flex-shrink-0 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-extrabold text-[var(--text)] tracking-tight font-sans">
                ALL UNDERGROUND SECTORS CLEAR
              </span>
              <span className="text-xs font-mono font-bold text-[#1E6B42] bg-[#CDEBD9] px-2.5 py-0.5 rounded-full border border-emerald-300">
                0 SOS Active
              </span>
            </div>
            <p className="text-xs text-[var(--text-3)] font-sans mt-0.5 font-medium">
              Normal operations — All miner emergency tactile switches idle across monitored horizons.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5 text-xs font-mono text-[var(--text-2)]">
          <span className="flex items-center gap-1.5 font-bold text-[#1E6B42]">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--ok)] animate-pulse" />
            LoRa Mesh Active
          </span>
          <span className="text-[var(--text-3)] font-medium">
            {metrics.onlineHelmetsCount} of {metrics.totalWorkers} helmets transmitting
          </span>
        </div>
      </div>
    );
  }

  // 2. High-Priority Critical SOS Command Bar (When SOS is active)
  const isRescueDispatched = rescueDispatchedWorkerId === activeSosIncident.workerId;
  const isRadioActive = radioActiveWorkerId === activeSosIncident.workerId;

  return (
    <div className="clay-critical p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 border border-red-300 animate-subtle-pulse">
      {/* Left: Dominant Critical SOS Info */}
      <div className="flex items-start gap-4 flex-1 min-w-0">
        <div className="w-12 h-12 rounded-2xl bg-[#D13A3F] text-white flex items-center justify-center flex-shrink-0 shadow-md">
          <AlertOctagon className="w-7 h-7" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-[#D13A3F] text-white font-extrabold text-xs uppercase tracking-wide font-mono shadow-sm">
              CRITICAL SOS ACTIVE
            </span>
            <span className="text-xs font-mono font-bold text-[#B52A31] bg-white/70 px-3 py-1 rounded-full border border-red-300 flex items-center gap-1.5 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-[#B52A31]" />
              Triggered {formatElapsed(elapsedSeconds)} ago
            </span>
            {metrics.criticalSosIncidentsCount > 1 && (
              <span className="text-xs font-mono font-bold text-[#8A5500] bg-[#FCE7B8] px-3 py-1 rounded-full border border-amber-300 shadow-sm">
                {metrics.criticalSosIncidentsCount} Total SOS Calls Active
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-1">
            <h2 className="text-lg font-extrabold text-[#B52A31] tracking-tight font-sans">
              {activeSosIncident.workerName}
            </h2>
            <span className="text-xs font-mono text-[var(--text-2)] font-semibold">
              ID: {activeSosIncident.workerId} • Helmet: {activeSosIncident.helmetId}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-[var(--text)]">
            <span className="flex items-center gap-1 font-bold text-[#B52A31]">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              {activeSosIncident.sector}
            </span>
            {activeSosWorker && (
              <span className="text-[var(--text-2)] font-mono font-semibold">
                Gas: <strong className="text-[#B52A31]">{activeSosWorker.telemetry.ch4.toFixed(2)}% LEL</strong> | CO: <strong className="text-[#B52A31]">{activeSosWorker.telemetry.co} ppm</strong> | Temp: <strong>{activeSosWorker.telemetry.temperature}°C</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: High-Contrast Clay Actions */}
      <div className="flex flex-wrap items-center gap-3 flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-red-300/60">
        {/* Action 1: Acknowledge */}
        {activeSosIncident.acknowledged ? (
          <div className="h-11 px-4 rounded-2xl bg-white/80 border border-emerald-400 text-[#1E6B42] flex items-center gap-2 text-xs font-bold font-mono shadow-sm">
            <Check className="w-4 h-4 text-[#1E6B42]" />
            <span>ACKNOWLEDGED ({activeSosIncident.acknowledgedBy?.split(' ')[0] || 'Dave'})</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => acknowledgeIncident(activeSosIncident.id)}
            className="clay-button clay-btn-amber h-11 px-5 text-xs uppercase tracking-wider font-mono flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Acknowledge SOS</span>
          </button>
        )}

        {/* Action 2: Dispatch Rescue */}
        {isRescueDispatched ? (
          <div className="h-11 px-4 rounded-2xl bg-[#CDEBD9] border border-emerald-400 text-[#1E6B42] flex items-center gap-2 text-xs font-bold font-mono shadow-sm">
            <Ambulance className="w-4 h-4 text-[#1E6B42]" />
            <span>RESCUE DISPATCHED</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => dispatchRescue(activeSosIncident.workerId, activeSosIncident.sector)}
            className="clay-button clay-btn-red h-11 px-5 text-xs uppercase tracking-wider font-mono flex items-center gap-2"
          >
            <Ambulance className="w-4 h-4" />
            <span>Dispatch Rescue</span>
          </button>
        )}

        {/* Action 3: Call Worker (VHF Radio Channel) */}
        <button
          type="button"
          onClick={() => callWorkerRadio(activeSosIncident.workerId)}
          className={`clay-button h-11 px-4 text-xs font-mono uppercase tracking-wider flex items-center gap-2 ${
            isRadioActive
              ? 'clay-btn-green text-white'
              : 'clay-btn-cream text-[var(--text)]'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>{isRadioActive ? 'Radio Connected (Ch 4)' : 'Call Worker (VHF)'}</span>
        </button>
      </div>
    </div>
  );
};
