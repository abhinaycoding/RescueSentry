import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useSentry } from '../../context/SentryContext';
import { IncidentCategory } from '../../types';

export const IncidentBreakdownChart: React.FC = () => {
  const { incidents } = useSentry();

  const counts: Record<IncidentCategory, number> = {
    SOS_EMERGENCY: 0,
    HAZARDOUS_GAS: 0,
    HELMET_REMOVED: 0,
    ENVIRONMENTAL_WARNING: 0,
    DEVICE_DISCONNECTED: 0
  };

  incidents.forEach(i => {
    if (counts[i.type] !== undefined) {
      counts[i.type]++;
    }
  });

  const data = [
    { name: 'SOS Emergency', value: counts.SOS_EMERGENCY, color: '#D13A3F' },
    { name: 'Hazardous Gas', value: counts.HAZARDOUS_GAS, color: '#F5A524' },
    { name: 'Helmet Removed', value: counts.HELMET_REMOVED, color: '#E67E22' },
    { name: 'Thermal Warning', value: counts.ENVIRONMENTAL_WARNING, color: '#D97706' },
    { name: 'Device Offline', value: counts.DEVICE_DISCONNECTED, color: '#8C8275' }
  ].filter(d => d.value > 0);

  return (
    <div className="clay-raised p-5 rounded-[28px] border border-[#D8CEBF]/60 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-[#D8CEBF]/60">
        <div>
          <h3 className="text-xs font-extrabold font-mono tracking-wider text-[var(--text)] uppercase">
            Incidents by Category
          </h3>
          <p className="text-[11px] text-[var(--text-3)] font-mono font-medium">
            Safety trigger distribution
          </p>
        </div>
      </div>

      <div className="h-52 mt-2 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={50}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`pie-cell-${index}`} fill={entry.color} stroke="#FBF7F2" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0];
                  return (
                    <div className="clay-raised p-2.5 rounded-2xl border border-[#D8CEBF] font-mono text-xs shadow-md bg-[#FBF7F2]">
                      <div className="font-extrabold text-[var(--text)]">{item.name}</div>
                      <div className="text-[var(--text-2)] font-bold mt-0.5">Count: {item.value}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-[#D8CEBF]/60 text-xs font-mono">
        {data.map(item => (
          <div key={item.name} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.color }} />
            <span className="text-[var(--text-3)] truncate font-medium">{item.name}:</span>
            <span className="text-[var(--text)] font-extrabold tabular-nums">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
