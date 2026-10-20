import React, { useState } from 'react';
import { useSentry } from '../context/SentryContext';
import { TelemetryChart } from '../components/charts/TelemetryChart';
import { SectorGasChart } from '../components/charts/SectorGasChart';
import { IncidentBreakdownChart } from '../components/charts/IncidentBreakdownChart';
import { exportToCSV, formatDateTime } from '../utils/formatters';
import { dataService } from '../services/dataService';
import { 
  LineChart as LineChartIcon, 
  Download, 
  Activity 
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { events, mode } = useSentry();

  // Export full telemetry log
  const handleExportTelemetry = async () => {
    const rawData = await dataService.getHistoricalTelemetry('24h');
    const rows = rawData.map((d: any) => ({
      Timestamp: d.isoTime || d.timestamp,
      Methane_CH4_LEL: d.ch4,
      CarbonMonoxide_CO_ppm: d.co,
      Temperature_C: d.temperature,
      Humidity_RH: d.humidity,
      CH4_Warning_Threshold: d.thresholdCh4Warning,
      CH4_Critical_Threshold: d.thresholdCh4Critical
    }));
    exportToCSV(`RescueSentry-TelemetryLog-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <div className="space-y-5 animate-fadeIn font-sans text-[var(--text)]">
      {/* Top Banner */}
      <div className="clay-raised p-5 rounded-[28px] border border-[#D8CEBF]/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="clay-pill-inset p-2 text-[var(--info-ink)]">
              <LineChartIcon className="w-5 h-5 text-[var(--info-ink)]" />
            </div>
            <h2 className="text-sm font-extrabold font-mono tracking-wider text-[var(--text)] uppercase">
              Underground Atmospheric & Environmental Analytics
            </h2>
          </div>
          <p className="text-xs text-[var(--text-3)] mt-1.5 font-sans font-medium">
            Historical environmental diagnostics, hazardous gas exposure profiles, and incident frequency metrics across all mine sectors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {mode === 'demo' && (
            <span className="clay-pill-inset px-3 py-1.5 text-xs font-mono font-bold text-[var(--info-ink)] uppercase">
              Simulated 24h Telemetry
            </span>
          )}

          <button
            type="button"
            onClick={handleExportTelemetry}
            className="clay-button clay-btn-cream h-9 px-4 text-xs font-mono font-bold flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-[var(--info-ink)]" />
            <span>Export 24h CSV Telemetry</span>
          </button>
        </div>
      </div>

      {/* Main Telemetry Chart */}
      <div>
        <TelemetryChart />
      </div>

      {/* Analytics Breakdown Grid: Sector Risk & Incident Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectorGasChart />
        <IncidentBreakdownChart />
      </div>

      {/* Historical Safety Event Audit Log Table */}
      <div className="clay-raised rounded-[28px] border border-[#D8CEBF]/60 overflow-hidden">
        <div className="p-4 border-b border-[#D8CEBF]/60 flex items-center justify-between bg-[#F6F0E8]/60">
          <div className="flex items-center gap-2.5">
            <div className="clay-pill-inset p-1.5 text-[var(--info-ink)]">
              <Activity className="w-4 h-4 text-[var(--info-ink)]" />
            </div>
            <h3 className="text-xs font-extrabold font-mono tracking-wide text-[var(--text)] uppercase">
              Historical Safety Audit Events Log
            </h3>
          </div>
          <span className="clay-pill-inset px-2.5 py-1 text-[10px] font-mono font-bold text-[var(--text-3)] uppercase">
            Retained Shift Entries: {events.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#F6F0E8] text-[var(--text-3)] uppercase text-[10px] tracking-wider border-b border-[#D8CEBF]/60 font-bold">
              <tr>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4">Details / Description</th>
                <th className="py-3 px-4 text-right">Data Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8CEBF]/40">
              {events.map(evt => (
                <tr key={evt.id} className="hover:bg-[#EFE7DC]/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-[var(--text)]">{evt.id}</td>
                  <td className="py-3 px-4 text-[var(--text-3)] tabular-nums">{formatDateTime(evt.timestamp)}</td>
                  <td className="py-3 px-4 font-extrabold text-[var(--text)]">{evt.category.replace('_', ' ')}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      evt.severity === 'CRITICAL' 
                        ? 'bg-[#FDE8E8] text-[#B52A31] border border-red-300' 
                        : evt.severity === 'WARNING' 
                        ? 'bg-[#FEF3C7] text-[#8A5500] border border-amber-300' 
                        : 'bg-[#EFE7DC] text-[var(--text-3)] border border-[#D8CEBF]'
                    }`}>
                      {evt.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-[var(--info-ink)]">{evt.sector}</td>
                  <td className="py-3 px-4 text-[var(--text-2)] font-sans font-medium">{evt.message}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="clay-pill-inset px-2 py-0.5 text-[10px] text-[var(--text-3)] font-bold">
                      {evt.isSimulated ? 'Simulated' : 'ESP32 Live'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
