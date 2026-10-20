import React from 'react';
import { useSentry } from '../../context/SentryContext';
import { ActivePage } from '../../types';
import { 
  LayoutDashboard, 
  Users, 
  AlertTriangle, 
  LineChart, 
  Cpu, 
  Settings, 
  ChevronRight,
  Shield,
  Zap,
  RadioTower
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { 
    activePage, 
    setActivePage, 
    metrics,
    mode,
    simulatedTicksEnabled,
    setSimulatedTicksEnabled
  } = useSentry();

  const menuItems: { id: ActivePage; label: string; icon: React.ReactNode; badge?: number; badgeCritical?: boolean }[] = [
    {
      id: 'overview',
      label: 'Operations Overview',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'workers',
      label: 'Worker Monitoring',
      icon: <Users className="w-4 h-4" />
    },
    {
      id: 'incidents',
      label: 'Incident Management',
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: metrics.unacknowledgedIncidentsCount,
      badgeCritical: metrics.criticalSosIncidentsCount > 0
    },
    {
      id: 'analytics',
      label: 'Environmental Analytics',
      icon: <LineChart className="w-4 h-4" />
    },
    {
      id: 'health',
      label: 'System Health',
      icon: <Cpu className="w-4 h-4" />
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: <Settings className="w-4 h-4" />
    }
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-[var(--bg-side)] flex flex-col justify-between select-none h-screen z-20 border-r border-[#D8CEBF]/60">
      {/* Top Brand Section */}
      <div>
        <div className="p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F5A524] flex items-center justify-center text-white flex-shrink-0 shadow-md">
            <Shield className="w-5 h-5 fill-current" />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-[var(--text)] text-lg tracking-tight font-sans leading-none">
              RescueSentry
            </h1>
            <p className="text-xs text-[var(--text-3)] font-sans tracking-wide mt-1 truncate">
              Mine Safety Control
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="px-3.5 space-y-1.5 mt-2">
          {menuItems.map(item => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-150 group ${
                  isActive
                    ? 'bg-[#FBF7F2] text-[var(--text)] shadow-[inset_-2px_-2px_5px_rgba(120,90,60,0.1),inset_2px_2px_5px_rgba(255,255,255,0.9),3px_4px_10px_rgba(120,90,60,0.15)] font-bold'
                    : 'text-[var(--text-2)] hover:bg-black/5 hover:text-[var(--text)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    isActive ? 'bg-[#2E9E63]' : 'bg-[#A89E92]'
                  }`} />
                  <span className="font-sans">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-xs font-mono px-2.5 py-0.5 rounded-full font-bold shadow-sm ${
                        item.badgeCritical
                          ? 'bg-[#F8C9C6] text-[#B52A31] border border-red-300'
                          : 'bg-[#FCE7B8] text-[#8A5500] border border-amber-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 text-[var(--text-3)]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Status / Hardware Telemetry Widget */}
      <div className="p-4 space-y-2">
        <div className="clay-inset p-3.5 space-y-2.5 text-xs font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RadioTower className="w-4 h-4 text-[var(--text-2)]" />
              <span className="text-[var(--text)] font-sans font-bold">
                LoRa Mesh Bridge
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--ok-ink)] font-bold">
              <span className="w-2 h-2 rounded-full bg-[var(--ok)] animate-pulse" />
              ONLINE
            </span>
          </div>

          <div className="text-[11px] text-[var(--text-3)] flex justify-between">
            <span>Protocol: ESP-NOW</span>
            <span>Ch: 6 (Mesh)</span>
          </div>

          {mode === 'demo' && (
            <div className="pt-2 border-t border-[#D8CEBF]/60 flex items-center justify-between">
              <span className="text-[11px] text-[var(--text-2)] flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-[var(--warning)]" />
                Live Ticks
              </span>
              <button
                type="button"
                onClick={() => setSimulatedTicksEnabled(!simulatedTicksEnabled)}
                className={`px-2.5 py-1 text-xs font-mono rounded-xl font-bold transition-all shadow-sm ${
                  simulatedTicksEnabled 
                    ? 'bg-[var(--ok-clay)] text-[var(--ok-ink)] border border-emerald-400' 
                    : 'bg-[var(--clay-well)] text-[var(--text-3)]'
                }`}
              >
                {simulatedTicksEnabled ? 'ACTIVE' : 'PAUSED'}
              </button>
            </div>
          )}
        </div>

        <div className="px-2 text-xs text-[var(--text-3)] font-mono flex items-center justify-between">
          <span>ESP32 Gateway Bridge</span>
          <span className="text-[var(--text-2)] font-semibold">Sec A</span>
        </div>
      </div>
    </aside>
  );
};
