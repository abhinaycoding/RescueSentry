import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import { useSentry } from '../../context/SentryContext';

export const SectorGasChart: React.FC = () => {
  const { workers } = useSentry();

  // Aggregate gas readings per sector
  const sectorDataMap: Record<string, { sector: string; avgCh4: number; count: number; maxCo: number }> = {};

  workers.forEach(w => {
    if (w.connectionStatus === 'OFFLINE') return;
    const shortSector = w.sector.split(' - ')[0] || w.sector;
    if (!sectorDataMap[shortSector]) {
      sectorDataMap[shortSector] = { sector: shortSector, avgCh4: 0, count: 0, maxCo: 0 };
    }
    sectorDataMap[shortSector].avgCh4 += w.telemetry.ch4;
    sectorDataMap[shortSector].count += 1;
    sectorDataMap[shortSector].maxCo = Math.max(sectorDataMap[shortSector].maxCo, w.telemetry.co);
  });

  const chartData = Object.values(sectorDataMap).map(d => ({
    sector: d.sector,
    ch4: +(d.avgCh4 / (d.count || 1)).toFixed(2),
    maxCo: d.maxCo
  }));

  return (
    <div className="clay-raised p-5 rounded-[28px] border border-[#D8CEBF]/60 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-[#D8CEBF]/60">
        <div>
          <h3 className="text-xs font-extrabold font-mono tracking-wider text-[var(--text)] uppercase">
            Sector Gas Risk Comparison
          </h3>
          <p className="text-[11px] text-[var(--text-3)] font-mono font-medium">
            Average Methane (% LEL) by underground sector
          </p>
        </div>
        <span className="clay-pill-inset px-2.5 py-1 text-[10px] font-mono font-bold text-[var(--text-3)] uppercase">
          Aggregated Live
        </span>
      </div>

      <div className="h-60 mt-4 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D8CEBF" vertical={false} />
            <XAxis 
              dataKey="sector" 
              stroke="#8C8275" 
              tick={{ fontSize: 10, fill: '#6B6258', fontFamily: 'monospace' }} 
            />
            <YAxis 
              stroke="#8C8275" 
              tick={{ fontSize: 10, fill: '#6B6258', fontFamily: 'monospace' }} 
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="clay-raised p-3 rounded-2xl border border-[#D8CEBF] font-mono text-xs shadow-md bg-[#FBF7F2]">
                      <div className="font-extrabold text-[var(--text)] mb-1.5 border-b border-[#D8CEBF] pb-1">{label}</div>
                      <div className="text-[#3B4F8A] font-bold">Avg CH4: {payload[0].value}% LEL</div>
                      <div className="text-[#8A5500] font-bold">Peak CO: {payload[0].payload.maxCo} ppm</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="ch4" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.ch4 >= 1.5 ? '#D13A3F' : entry.ch4 >= 1.0 ? '#F5A524' : '#3B4F8A'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
