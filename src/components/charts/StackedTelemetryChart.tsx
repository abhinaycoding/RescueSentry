import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceArea,
  ReferenceDot,
  ReferenceLine
} from 'recharts';
import { useSentry } from '../../context/SentryContext';
import { dataService } from '../../services/dataService';
import { Activity, Radio, Filter, Clock } from 'lucide-react';

interface TelemetryPoint {
  timestamp: string;
  isoTime: string;
  ch4: number;
  co: number;
  temperature: number;
  humidity: number;
  thresholdCh4Warning: number;
  thresholdCh4Critical: number;
  thresholdCoWarning: number;
  thresholdCoCritical: number;
}

export const StackedTelemetryChart: React.FC = () => {
  const { thresholds, selectedSite } = useSentry();
  const [range, setRange] = useState<'15m' | '1h' | '4h' | '24h'>('1h');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [data, setData] = useState<TelemetryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSampleAge, setLastSampleAge] = useState<number>(2);

  // Fetch telemetry based on range
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    dataService.getHistoricalTelemetry(range).then(res => {
      if (mounted) {
        setData(res);
        setLoading(false);
        setLastSampleAge(0);
      }
    });
    return () => {
      mounted = false;
    };
  }, [range, selectedSector]);

  // Last sample age ticking
  useEffect(() => {
    const timer = setInterval(() => {
      setLastSampleAge(prev => (prev < 60 ? prev + 1 : 2));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter or decimate X ticks to at most 6 readable intervals
  const tickIndices = useMemo(() => {
    if (!data.length) return [];
    const count = 5;
    const step = Math.max(1, Math.floor(data.length / (count - 1)));
    const ticks: string[] = [];
    for (let i = 0; i < data.length; i += step) {
      ticks.push(data[i].timestamp);
    }
    if (ticks[ticks.length - 1] !== data[data.length - 1].timestamp) {
      ticks.push(data[data.length - 1].timestamp);
    }
    return ticks;
  }, [data]);

  // Find peak spike point for annotation
  const ch4PeakPoint = useMemo(() => {
    if (!data.length) return null;
    let max = data[0];
    for (const d of data) {
      if (d.ch4 > max.ch4) max = d;
    }
    return max.ch4 >= thresholds.ch4Warning ? max : null;
  }, [data, thresholds.ch4Warning]);

  const coPeakPoint = useMemo(() => {
    if (!data.length) return null;
    let max = data[0];
    for (const d of data) {
      if (d.co > max.co) max = d;
    }
    return max.co >= thresholds.coWarning ? max : null;
  }, [data, thresholds.coWarning]);

  return (
    <div className="clay-raised p-6 flex flex-col justify-between h-full border border-[#D8CEBF]/60 text-[var(--text)]">
      {/* Chart Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#D8CEBF]/60">
        {/* Title and Live Sample Age */}
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-extrabold text-[var(--text)] uppercase tracking-wide font-sans">
              Atmospheric Telemetry Streams
            </h3>
            <span className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#CDEBD9] text-[#1E6B42] text-xs font-mono font-bold border border-emerald-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#2E9E63] animate-pulse" />
              LIVE ({lastSampleAge}s ago)
            </span>
          </div>
          <p className="text-xs text-[var(--text-3)] font-sans mt-0.5 font-medium">
            Synchronized Methane (CH4) & Carbon Monoxide (CO) with safety regulatory zones.
          </p>
        </div>

        {/* Sector and Range Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sector Selector */}
          <div className="flex items-center gap-1.5 clay-pill-inset px-3.5 py-1.5 text-xs font-mono text-[var(--text)]">
            <Filter className="w-3.5 h-3.5 text-[var(--text-2)]" />
            <select
              value={selectedSector}
              onChange={e => setSelectedSector(e.target.value)}
              className="bg-transparent text-[var(--text)] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Sectors Aggregated</option>
              {selectedSite.activeSectors.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Time Range Buttons */}
          <div className="flex items-center clay-pill-inset p-1 text-xs font-mono">
            {(['15m', '1h', '4h', '24h'] as const).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`h-7 px-3 rounded-full uppercase font-bold transition-all ${
                  range === r 
                    ? 'bg-[#2A2520] text-white shadow-sm' 
                    : 'text-[var(--text-3)] hover:text-[var(--text)]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stacked Chart Container */}
      <div className="mt-4 space-y-4">
        {/* Upper Chart: Methane CH4 */}
        <div>
          <div className="flex items-center justify-between text-xs font-mono mb-1.5 text-[var(--text-2)]">
            <span className="font-bold flex items-center gap-2">
              <span className="w-3 h-1.5 bg-[#3B4F8A] rounded-full" />
              CH4 Methane (% LEL)
            </span>
            <span className="text-[var(--text-3)] font-medium">
              Safe &lt; 1.0% | <span className="text-[#8A5500] font-bold">Warn ≥ 1.0%</span> | <span className="text-[#B52A31] font-bold">Danger ≥ 1.5%</span>
            </span>
          </div>

          <div className="h-44 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-[var(--text-3)] font-mono">
                Sampling gas stream...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 15, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D8CEBF" vertical={false} />
                  
                  {/* Warning Zone: 1.0 to 1.5 % LEL */}
                  <ReferenceArea 
                    y1={thresholds.ch4Warning} 
                    y2={thresholds.ch4Critical} 
                    fill="#F5A524" 
                    fillOpacity={0.14} 
                    label={{ value: 'Warning Zone (≥ 1.0% LEL)', fill: '#8A5500', fontSize: 11, position: 'insideTopLeft', fontWeight: 'bold' }}
                  />
                  {/* Danger Zone: >= 1.5 % LEL */}
                  <ReferenceArea 
                    y1={thresholds.ch4Critical} 
                    y2={3.0} 
                    fill="#D13A3F" 
                    fillOpacity={0.16} 
                    label={{ value: 'Critical Danger (≥ 1.5% LEL)', fill: '#B52A31', fontSize: 11, position: 'insideTopLeft', fontWeight: 'bold' }}
                  />

                  <XAxis dataKey="timestamp" hide />
                  <YAxis 
                    stroke="#8C8275" 
                    domain={[0, 2.5]} 
                    tick={{ fontSize: 11, fill: '#5C544B', fontFamily: 'monospace' }} 
                    tickLine={{ stroke: '#D8CEBF' }}
                  />

                  {/* Tooltip */}
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const pt = payload[0].payload as TelemetryPoint;
                        return (
                          <div className="clay-raised p-3 border border-[#D8CEBF]/80 shadow-lg font-mono text-xs z-50">
                            <div className="text-[var(--text-3)] border-b border-[#D8CEBF]/60 pb-1 mb-1.5 font-bold">
                              Sample Time: <strong className="text-[var(--text)]">{label}</strong>
                            </div>
                            <div className="flex items-center justify-between gap-4 py-0.5">
                              <span className="text-[#3B4F8A] font-bold">CH4 Methane:</span>
                              <span className="font-extrabold text-[var(--text)] tabular-nums">{pt.ch4.toFixed(2)}% LEL</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 py-0.5">
                              <span className="text-[#8A5500] font-bold">Carbon Monoxide:</span>
                              <span className="font-extrabold text-[var(--text)] tabular-nums">{pt.co} ppm</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 py-0.5 text-[var(--text-2)] font-semibold">
                              <span>Temperature:</span>
                              <span>{pt.temperature}°C</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  {/* Peak Marker Annotation */}
                  {ch4PeakPoint && (
                    <ReferenceDot 
                      x={ch4PeakPoint.timestamp} 
                      y={ch4PeakPoint.ch4} 
                      r={5} 
                      fill="#D13A3F" 
                      stroke="#FFFFFF" 
                      strokeWidth={2}
                    />
                  )}

                  <Line 
                    type="monotone" 
                    dataKey="ch4" 
                    stroke="#3B4F8A" 
                    strokeWidth={2.5} 
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Lower Chart: Carbon Monoxide (CO) */}
        <div>
          <div className="flex items-center justify-between text-xs font-mono mb-1.5 text-[var(--text-2)]">
            <span className="font-bold flex items-center gap-2">
              <span className="w-3 h-1.5 bg-[#F5A524] rounded-full" />
              CO Carbon Monoxide (ppm)
            </span>
            <span className="text-[var(--text-3)] font-medium">
              Safe &lt; 25 ppm | <span className="text-[#8A5500] font-bold">Warn ≥ 25 ppm</span> | <span className="text-[#B52A31] font-bold">Danger ≥ 50 ppm</span>
            </span>
          </div>

          <div className="h-44 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-[var(--text-3)] font-mono">
                Sampling gas stream...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 15, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D8CEBF" vertical={false} />

                  {/* Warning Zone: 25 to 50 ppm */}
                  <ReferenceArea 
                    y1={thresholds.coWarning} 
                    y2={thresholds.coCritical} 
                    fill="#F5A524" 
                    fillOpacity={0.14} 
                    label={{ value: 'Warning Zone (≥ 25 ppm)', fill: '#8A5500', fontSize: 11, position: 'insideTopLeft', fontWeight: 'bold' }}
                  />
                  {/* Danger Zone: >= 50 ppm */}
                  <ReferenceArea 
                    y1={thresholds.coCritical} 
                    y2={120} 
                    fill="#D13A3F" 
                    fillOpacity={0.16} 
                    label={{ value: 'Critical Danger (≥ 50 ppm)', fill: '#B52A31', fontSize: 11, position: 'insideTopLeft', fontWeight: 'bold' }}
                  />

                  {/* Shared X Axis with at most 6 readable ticks */}
                  <XAxis 
                    dataKey="timestamp" 
                    ticks={tickIndices}
                    stroke="#8C8275" 
                    tick={{ fontSize: 11, fill: '#5C544B', fontFamily: 'monospace' }} 
                    tickLine={{ stroke: '#D8CEBF' }}
                  />
                  <YAxis 
                    stroke="#8C8275" 
                    domain={[0, 80]} 
                    tick={{ fontSize: 11, fill: '#5C544B', fontFamily: 'monospace' }} 
                    tickLine={{ stroke: '#D8CEBF' }}
                  />

                  {/* Tooltip */}
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const pt = payload[0].payload as TelemetryPoint;
                        return (
                          <div className="clay-raised p-3 border border-[#D8CEBF]/80 shadow-lg font-mono text-xs z-50">
                            <div className="text-[var(--text-3)] border-b border-[#D8CEBF]/60 pb-1 mb-1.5 font-bold">
                              Sample Time: <strong className="text-[var(--text)]">{label}</strong>
                            </div>
                            <div className="flex items-center justify-between gap-4 py-0.5">
                              <span className="text-[#8A5500] font-bold">CO Carbon Monoxide:</span>
                              <span className="font-extrabold text-[var(--text)] tabular-nums">{pt.co} ppm</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 py-0.5">
                              <span className="text-[#3B4F8A] font-bold">Methane CH4:</span>
                              <span className="font-extrabold text-[var(--text)] tabular-nums">{pt.ch4.toFixed(2)}% LEL</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  {/* Peak Marker Annotation */}
                  {coPeakPoint && (
                    <ReferenceDot 
                      x={coPeakPoint.timestamp} 
                      y={coPeakPoint.co} 
                      r={5} 
                      fill="#D13A3F" 
                      stroke="#FFFFFF" 
                      strokeWidth={2}
                    />
                  )}

                  <Line 
                    type="monotone" 
                    dataKey="co" 
                    stroke="#F5A524" 
                    strokeWidth={2.5} 
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
