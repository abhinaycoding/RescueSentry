import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { dataService } from '../../services/dataService';
import { useSentry } from '../../context/SentryContext';
import { Flame, Thermometer } from 'lucide-react';

interface TelemetryPoint {
  timestamp: string;
  ch4: number;
  co: number;
  temperature: number;
  humidity: number;
}

export const TelemetryChart: React.FC = () => {
  const { thresholds } = useSentry();
  const [range, setRange] = useState<'15m' | '1h' | '4h' | '24h'>('1h');
  const [chartMode, setChartMode] = useState<'gas' | 'environment'>('gas');
  const [data, setData] = useState<TelemetryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    dataService.getHistoricalTelemetry(range).then(res => {
      if (mounted) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [range]);

  return (
    <div className="clay-raised p-5 rounded-[28px] border border-[#D8CEBF]/60 flex flex-col justify-between font-sans">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D8CEBF]/60">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="clay-pill-inset p-2 text-[var(--info-ink)]">
              {chartMode === 'gas' ? (
                <Flame className="w-4 h-4 text-[#B52A31]" />
              ) : (
                <Thermometer className="w-4 h-4 text-[#8A5500]" />
              )}
            </div>
            <h3 className="text-xs font-extrabold font-mono tracking-wider text-[var(--text)] uppercase">
              {chartMode === 'gas' ? 'Atmospheric Gas Telemetry (CH4 & CO)' : 'Mine Environmental Telemetry (Temp & RH)'}
            </h3>
          </div>

          {/* Toggle Gas vs Environment */}
          <div className="flex items-center clay-pill-inset p-1 font-mono text-xs">
            <button
              type="button"
              onClick={() => setChartMode('gas')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                chartMode === 'gas' 
                  ? 'bg-[#2A2520] text-white shadow-sm' 
                  : 'text-[var(--text-3)] hover:text-[var(--text)]'
              }`}
            >
              Gas Sensors
            </button>
            <button
              type="button"
              onClick={() => setChartMode('environment')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                chartMode === 'environment' 
                  ? 'bg-[#2A2520] text-white shadow-sm' 
                  : 'text-[var(--text-3)] hover:text-[var(--text)]'
              }`}
            >
              Temp & RH
            </button>
          </div>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center gap-1 clay-pill-inset p-1 font-mono text-xs">
          {(['15m', '1h', '4h', '24h'] as const).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`px-2.5 py-0.5 rounded-full uppercase font-bold text-xs transition-all ${
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

      {/* Chart Body */}
      <div className="h-64 mt-4 w-full">
        {loading ? (
          <div className="h-full flex items-center justify-center text-xs text-[var(--text-3)] font-mono">
            Loading telemetry time-series...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8CEBF" vertical={false} />
              <XAxis 
                dataKey="timestamp" 
                stroke="#8C8275" 
                tick={{ fontSize: 10, fill: '#6B6258', fontFamily: 'monospace' }} 
                tickLine={{ stroke: '#D8CEBF' }}
              />
              <YAxis 
                stroke="#8C8275" 
                tick={{ fontSize: 10, fill: '#6B6258', fontFamily: 'monospace' }} 
                tickLine={{ stroke: '#D8CEBF' }}
                domain={chartMode === 'gas' ? [0, 'auto'] : [15, 'auto']}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="clay-raised p-3 rounded-2xl border border-[#D8CEBF] font-mono text-xs shadow-md bg-[#FBF7F2]">
                        <div className="text-[10px] text-[var(--text-3)] mb-1 border-b border-[#D8CEBF] pb-1 font-bold">
                          Time: {label}
                        </div>
                        {payload.map((entry, index) => (
                          <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
                            <span style={{ color: entry.color }} className="font-bold">
                              {entry.name}:
                            </span>
                            <span className="font-extrabold text-[var(--text)] tabular-nums">
                              {entry.value} {entry.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {chartMode === 'gas' ? (
                <>
                  {/* Warning & Critical Reference Lines */}
                  <ReferenceLine 
                    y={thresholds.ch4Warning} 
                    stroke="#F5A524" 
                    strokeDasharray="4 4" 
                    strokeWidth={1.5}
                    label={{ value: `Warn ${thresholds.ch4Warning}%`, fill: '#8A5500', fontSize: 10, position: 'right', fontWeight: 'bold' }} 
                  />
                  <ReferenceLine 
                    y={thresholds.ch4Critical} 
                    stroke="#D13A3F" 
                    strokeDasharray="4 4" 
                    strokeWidth={1.5}
                    label={{ value: `Crit ${thresholds.ch4Critical}%`, fill: '#B52A31', fontSize: 10, position: 'right', fontWeight: 'bold' }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ch4" 
                    name="CH4 Methane" 
                    unit="% LEL"
                    stroke="#2E9E63" 
                    strokeWidth={2.5} 
                    dot={false}
                    activeDot={{ r: 5, fill: '#1E6B42', stroke: '#FBF7F2', strokeWidth: 2 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="co" 
                    name="Carbon Monoxide" 
                    unit="ppm"
                    stroke="#F5A524" 
                    strokeWidth={2} 
                    dot={false} 
                    activeDot={{ r: 5, fill: '#8A5500', stroke: '#FBF7F2', strokeWidth: 2 }} 
                  />
                </>
              ) : (
                <>
                  <ReferenceLine 
                    y={thresholds.tempWarning} 
                    stroke="#F5A524" 
                    strokeDasharray="4 4" 
                    strokeWidth={1.5}
                    label={{ value: `Warn ${thresholds.tempWarning}°C`, fill: '#8A5500', fontSize: 10, position: 'right', fontWeight: 'bold' }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    name="Temperature" 
                    unit="°C"
                    stroke="#D13A3F" 
                    strokeWidth={2.5} 
                    dot={false} 
                    activeDot={{ r: 5, fill: '#B52A31', stroke: '#FBF7F2', strokeWidth: 2 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="humidity" 
                    name="Relative Humidity" 
                    unit="%"
                    stroke="#3B4F8A" 
                    strokeWidth={2} 
                    dot={false} 
                    activeDot={{ r: 5, fill: '#3B4F8A', stroke: '#FBF7F2', strokeWidth: 2 }} 
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Chart Legend Footer */}
      <div className="flex flex-wrap items-center justify-between pt-3 border-t border-[#D8CEBF]/60 text-xs font-mono text-[var(--text-3)]">
        <div className="flex items-center gap-4">
          {chartMode === 'gas' ? (
            <>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="w-3 h-1 rounded-full bg-[#2E9E63]" />
                <span className="text-[var(--text)]">CH4 Methane (% LEL)</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="w-3 h-1 rounded-full bg-[#F5A524]" />
                <span className="text-[var(--text)]">CO Carbon Monoxide (ppm)</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="w-3 h-1 rounded-full bg-[#D13A3F]" />
                <span className="text-[var(--text)]">Ambient Temp (°C)</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="w-3 h-1 rounded-full bg-[#3B4F8A]" />
                <span className="text-[var(--text)]">Humidity (% RH)</span>
              </div>
            </>
          )}
        </div>
        <div className="text-[10px] text-[var(--text-3)] font-medium">
          Source: ESP32 IoT Node Gateway Broadcast
        </div>
      </div>
    </div>
  );
};
