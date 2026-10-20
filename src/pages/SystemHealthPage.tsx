import React, { useState } from 'react';
import { useSentry } from '../context/SentryContext';
import { ConnectionBadge } from '../components/common/StatusBadge';
import { formatRelativeTime } from '../utils/formatters';
import { 
  Cpu, 
  Battery, 
  Server, 
  HardHat
} from 'lucide-react';

export const SystemHealthPage: React.FC = () => {
  const { devices, thresholds, updateThresholds, setSelectedWorkerId, setActivePage } = useSentry();
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ONLINE' | 'STALE' | 'OFFLINE'>('ALL');
  const [staleTimeoutInput, setStaleTimeoutInput] = useState(thresholds.staleTimeoutSec);

  const total = devices.length;
  const online = devices.filter(d => d.status === 'ONLINE').length;
  const stale = devices.filter(d => d.status === 'STALE').length;
  const offline = devices.filter(d => d.status === 'OFFLINE').length;

  const filteredDevices = devices.filter(d => {
    if (statusFilter === 'ALL') return true;
    return d.status === statusFilter;
  });

  const handleUpdateTimeout = (e: React.FormEvent) => {
    e.preventDefault();
    updateThresholds({ staleTimeoutSec: Number(staleTimeoutInput) });
  };

  return (
    <div className="space-y-5 animate-fadeIn font-sans text-[var(--text)]">
      {/* Top Banner */}
      <div className="clay-raised p-5 rounded-[28px] border border-[#D8CEBF]/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="clay-pill-inset p-2 text-[var(--info-ink)]">
              <Cpu className="w-5 h-5 text-[var(--info-ink)]" />
            </div>
            <h2 className="text-sm font-extrabold font-mono tracking-wider text-[var(--text)] uppercase">
              ESP32 Smart Helmet Device Health & RF Diagnostics
            </h2>
          </div>
          <p className="text-xs text-[var(--text-3)] mt-1.5 font-sans font-medium">
            Hardware status, LoRa/Wi-Fi mesh packet loss, battery levels, and embedded sensor self-tests for underground helmets.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[var(--text-3)] font-semibold">Gateway Uplink:</span>
          <span className="clay-pill px-3 py-1 bg-[#EAF7EE] text-[#1E6B42] border border-emerald-300 flex items-center gap-1.5 font-extrabold">
            <span className="w-2 h-2 rounded-full bg-[#2E9E63] animate-pulse" />
            ONLINE (99.8% Uptime)
          </span>
        </div>
      </div>

      {/* Network & Hardware Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="clay-raised p-4 rounded-[24px] border border-[#D8CEBF]/60">
          <span className="text-[10px] font-mono text-[var(--text-3)] uppercase tracking-wider block font-bold">
            Registered Fleet
          </span>
          <div className="text-2xl font-extrabold font-mono text-[var(--text)] mt-1 tabular-nums">
            {total} <span className="text-xs font-semibold text-[var(--text-3)]">Helmets</span>
          </div>
          <div className="text-[11px] text-[var(--text-3)] mt-1 font-medium">100% Provisioned</div>
        </div>

        <div className="clay-ok p-4 rounded-[24px] border border-emerald-300">
          <span className="text-[10px] font-mono text-[#1E6B42] uppercase tracking-wider block font-extrabold">
            Online Telemetry
          </span>
          <div className="text-2xl font-extrabold font-mono text-[#1E6B42] mt-1 tabular-nums">
            {online} <span className="text-xs font-semibold text-[#1E6B42]/80">Active</span>
          </div>
          <div className="text-[11px] text-[#1E6B42]/80 mt-1 font-medium">Regular packet heartbeats</div>
        </div>

        <div className="clay-warning p-4 rounded-[24px] border border-amber-300">
          <span className="text-[10px] font-mono text-[#8A5500] uppercase tracking-wider block font-extrabold">
            Stale Telemetry Nodes
          </span>
          <div className="text-2xl font-extrabold font-mono text-[#8A5500] mt-1 tabular-nums">
            {stale} <span className="text-xs font-semibold text-[#8A5500]/80">Degraded</span>
          </div>
          <div className="text-[11px] text-[#8A5500]/80 mt-1 font-medium">&gt; {thresholds.staleTimeoutSec}s since last packet</div>
        </div>

        <div className="clay-critical p-4 rounded-[24px] border border-red-300">
          <span className="text-[10px] font-mono text-[#B52A31] uppercase tracking-wider block font-extrabold">
            Disconnected / Offline
          </span>
          <div className="text-2xl font-extrabold font-mono text-[#B52A31] mt-1 tabular-nums">
            {offline} <span className="text-xs font-semibold text-[#B52A31]/80">Offline</span>
          </div>
          <div className="text-[11px] text-[#B52A31]/80 mt-1 font-medium">Out of mesh coverage</div>
        </div>
      </div>

      {/* Gateway & Stale Timeout Config Strip */}
      <div className="clay-raised p-5 rounded-[28px] border border-[#D8CEBF]/60 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="clay-pill-inset p-2 text-[var(--info-ink)]">
            <Server className="w-5 h-5 text-[var(--info-ink)]" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold font-mono text-[var(--text)] uppercase tracking-wide">
              Heartbeat Timeout Configuration
            </h4>
            <p className="text-[11px] text-[var(--text-3)] font-sans font-medium">
              Devices that cease transmitting for longer than this duration are automatically transitioned to STALE and flagged in safety monitoring.
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdateTimeout} className="flex items-center gap-2 font-mono text-xs">
          <label className="text-[var(--text-3)] font-bold">Stale Threshold:</label>
          <input
            type="number"
            min={10}
            max={120}
            value={staleTimeoutInput}
            onChange={e => setStaleTimeoutInput(Number(e.target.value))}
            className="w-16 px-2.5 py-1 clay-input text-center font-bold text-xs"
          />
          <span className="text-[var(--text-3)] font-semibold">seconds</span>
          <button
            type="submit"
            className="clay-button clay-btn-cream h-8 px-4 text-xs font-mono font-bold uppercase"
          >
            Apply
          </button>
        </form>
      </div>

      {/* Device Inventory & Diagnostics Table */}
      <div className="clay-raised rounded-[28px] border border-[#D8CEBF]/60 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-[#D8CEBF]/60 flex flex-wrap items-center justify-between gap-3 bg-[#F6F0E8]/60">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-[var(--text-3)] font-bold">Filter Status:</span>
            <div className="flex items-center clay-pill-inset p-1 font-mono text-xs gap-1">
              {(['ALL', 'ONLINE', 'STALE', 'OFFLINE'] as const).map(st => (
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

          <span className="text-xs text-[var(--text-3)] font-mono font-medium">
            Displaying {filteredDevices.length} of {devices.length} Devices
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#F6F0E8] text-[var(--text-3)] uppercase text-[10px] tracking-wider border-b border-[#D8CEBF]/60 font-bold">
              <tr>
                <th className="py-3 px-4">Helmet Device ID</th>
                <th className="py-3 px-4">Assigned Miner</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4">Firmware</th>
                <th className="py-3 px-4">RF RSSI</th>
                <th className="py-3 px-4">Battery</th>
                <th className="py-3 px-4">Packet Loss</th>
                <th className="py-3 px-4">Sensor Diagnostics</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Packet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8CEBF]/40">
              {filteredDevices.map(d => {
                const isOffline = d.status === 'OFFLINE';

                return (
                  <tr 
                    key={d.helmetId} 
                    className="hover:bg-[#EFE7DC]/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedWorkerId(d.workerId);
                      setActivePage('workers');
                    }}
                  >
                    <td className="py-3 px-4 font-bold text-[var(--text)] flex items-center gap-1.5">
                      <div className="clay-pill-inset p-1 text-[var(--info-ink)]">
                        <HardHat className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-extrabold">{d.helmetId}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-[var(--text)] font-sans font-bold">{d.workerName}</div>
                      <div className="text-[10px] text-[var(--text-3)] font-medium">{d.workerId}</div>
                    </td>

                    <td className="py-3 px-4 font-bold text-[var(--info-ink)]">{d.sector.split(' - ')[0]}</td>

                    <td className="py-3 px-4 text-[var(--text-3)] font-semibold">{d.firmwareVersion}</td>

                    <td className="py-3 px-4 tabular-nums">
                      {isOffline ? (
                        <span className="text-[var(--text-3)]">--</span>
                      ) : (
                        <span className={d.wifiRssi < -85 ? 'text-[#8A5500] font-bold' : 'text-[var(--text-2)] font-semibold'}>
                          {d.wifiRssi} dBm
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 tabular-nums">
                      <div className="flex items-center gap-1.5">
                        <Battery className={`w-3.5 h-3.5 ${d.batteryPct < 20 ? 'text-[#B52A31]' : 'text-[#1E6B42]'}`} />
                        <span className={d.batteryPct < 20 ? 'text-[#B52A31] font-extrabold' : 'text-[var(--text)] font-bold'}>
                          {d.batteryPct}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 tabular-nums">
                      <span className={d.packetLossRate > 5 ? 'text-[#8A5500] font-bold' : 'text-[var(--text-3)] font-semibold'}>
                        {d.packetLossRate.toFixed(1)}%
                      </span>
                    </td>

                    {/* Sensor Subcomponent Self-Tests */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span 
                          title="Gas Sensor MQ-4"
                          className={`px-1.5 py-0.5 rounded-full font-bold ${
                            d.sensorsHealth.gasSensor === 'OK' 
                              ? 'bg-[#EAF7EE] text-[#1E6B42] border border-emerald-300' 
                              : d.sensorsHealth.gasSensor === 'DEGRADED' 
                              ? 'bg-[#FEF3C7] text-[#8A5500] border border-amber-300' 
                              : 'bg-[#FDE8E8] text-[#B52A31] border border-red-300'
                          }`}
                        >
                          GAS:{d.sensorsHealth.gasSensor}
                        </span>
                        <span 
                          title="Optical IR Forehead Wear Proximity Sensor"
                          className={`px-1.5 py-0.5 rounded-full font-bold ${
                            d.sensorsHealth.irWearSensor === 'OK' 
                              ? 'bg-[#EAF7EE] text-[#1E6B42] border border-emerald-300' 
                              : 'bg-[#FDE8E8] text-[#B52A31] border border-red-300'
                          }`}
                        >
                          IR:{d.sensorsHealth.irWearSensor}
                        </span>
                        <span 
                          title="Emergency SOS Pushbutton"
                          className={`px-1.5 py-0.5 rounded-full font-bold ${
                            d.sensorsHealth.sosSwitch === 'OK' 
                              ? 'bg-[#EAF7EE] text-[#1E6B42] border border-emerald-300' 
                              : 'bg-[#FDE8E8] text-[#B52A31] border border-red-300'
                          }`}
                        >
                          SOS:{d.sensorsHealth.sosSwitch}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <ConnectionBadge status={d.status} />
                    </td>

                    <td className="py-3 px-4 text-[var(--text-3)] tabular-nums font-semibold">
                      {formatRelativeTime(d.lastPacketTime)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
