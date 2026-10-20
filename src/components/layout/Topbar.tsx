import React, { useState } from 'react';
import { useSentry } from '../../context/SentryContext';
import { formatTime } from '../../utils/formatters';
import { 
  Building2, 
  RotateCw, 
  Bell, 
  UserCheck, 
  AlertOctagon, 
  ChevronDown,
  Volume2,
  VolumeX,
  RadioTower
} from 'lucide-react';

export const Topbar: React.FC = () => {
  const { 
    activePage, 
    selectedSite, 
    setSelectedSite, 
    mineSites,
    mode, 
    setMode,
    lastSyncTime, 
    syncData, 
    isLoading,
    incidents,
    metrics,
    setSelectedIncidentId,
    setActivePage,
    audioAlertsEnabled,
    setAudioAlertsEnabled
  } = useSentry();

  const [showAlertMenu, setShowAlertMenu] = useState(false);
  const [showSiteMenu, setShowSiteMenu] = useState(false);

  const getPageTitle = () => {
    switch (activePage) {
      case 'overview':
        return { title: 'Operations Overview', subtitle: 'Underground Safety & Telemetry Control' };
      case 'workers':
        return { title: 'Worker Monitoring', subtitle: 'Miner Helmet Sensor Status & Wear Detection Fleet' };
      case 'incidents':
        return { title: 'Incident Management', subtitle: 'Emergency Distress & Hazardous Gas Incident Queue' };
      case 'analytics':
        return { title: 'Environmental Analytics', subtitle: 'Hazardous Gas Trends, Heat Index & Exposure Diagnostics' };
      case 'health':
        return { title: 'System Health', subtitle: 'ESP32 Helmet Hardware Diagnostics & Mesh Gateway Connectivity' };
      case 'settings':
        return { title: 'System Settings & Integration', subtitle: 'Threshold Configurations, API Endpoints & Operational Parameters' };
      default:
        return { title: 'Dashboard', subtitle: 'Mine Safety System' };
    }
  };

  const { title, subtitle } = getPageTitle();
  const unhandledIncidents = incidents.filter(i => !i.resolved).slice(0, 5);

  return (
    <header className="h-20 bg-[var(--bg)] px-6 flex items-center justify-between z-10 select-none">
      {/* Left: Breadcrumbs & Page Titles */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[var(--text)] tracking-tight font-sans">
            {title}
          </h1>
          <p className="text-xs text-[var(--text-3)] font-sans mt-0.5">
            {selectedSite.name} · {subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls: Inset Clay Pills (38px height, 12px gap) */}
      <div className="flex items-center gap-3">
        {/* Mine Site Selector */}
        <div className="relative">
          <button
            onClick={() => setShowSiteMenu(!showSiteMenu)}
            className="clay-pill-inset h-[38px] px-3.5 flex items-center gap-2 text-xs text-[var(--text)] font-sans font-semibold transition-all hover:brightness-95"
          >
            <Building2 className="w-3.5 h-3.5 text-[var(--text-2)]" />
            <span className="truncate max-w-[140px]">{selectedSite.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-3)]" />
          </button>

          {showSiteMenu && (
            <div className="clay-raised absolute right-0 mt-2 w-64 p-2 z-30 font-sans shadow-lg">
              <div className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-[var(--text-3)] font-bold border-b border-[#D8CEBF]/60">
                Switch Operational Mine Site
              </div>
              <div className="mt-1 space-y-1">
                {mineSites.map(site => (
                  <button
                    key={site.id}
                    onClick={() => {
                      setSelectedSite(site);
                      setShowSiteMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex flex-col transition-all ${
                      selectedSite.id === site.id ? 'bg-[var(--clay-well)] text-[var(--text)] font-bold' : 'text-[var(--text-2)] hover:bg-black/5'
                    }`}
                  >
                    <span className="font-semibold">{site.name}</span>
                    <span className="text-[11px] text-[var(--text-3)]">{site.location}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Global Gateway Status Pill */}
        <div className="hidden lg:flex clay-pill-inset h-[38px] px-3.5 items-center gap-2 text-xs font-sans text-[var(--text)] font-semibold">
          <span className="w-2 h-2 rounded-full bg-[var(--ok)]" />
          <span>Gateway online</span>
        </div>

        {/* Telemetry Sync / Clock Pill */}
        <button
          onClick={syncData}
          disabled={isLoading}
          title="Force Telemetry Sync / Clock"
          className="clay-pill-inset h-[38px] px-3.5 flex items-center gap-2 text-xs font-mono text-[var(--text)] font-bold hover:brightness-95 transition-all disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[var(--info-ink)]' : 'text-[var(--text-3)]'}`} />
          <span className="tabular-nums">{formatTime(lastSyncTime.toISOString())}</span>
        </button>

        {/* Mode Toggle Pill */}
        <button
          onClick={() => setMode(mode === 'demo' ? 'api' : 'demo')}
          title="Click to toggle between Demo Mode and Live API Mode"
          className="clay-pill-inset h-[38px] px-3 flex items-center gap-1.5 text-xs font-mono text-[var(--text-2)] hover:brightness-95 transition-all cursor-pointer font-bold"
        >
          <span className={`w-2 h-2 rounded-full ${mode === 'demo' ? 'bg-[var(--warning)]' : 'bg-[var(--ok)]'}`} />
          <span>{mode === 'demo' ? 'DEMO' : 'API'}</span>
        </button>

        {/* Audio Alert Annunciator Toggle */}
        <button
          onClick={() => setAudioAlertsEnabled(!audioAlertsEnabled)}
          title={`Emergency Audio Annunciator: ${audioAlertsEnabled ? 'ACTIVE (Click to Mute)' : 'MUTED (Click to Enable)'}`}
          className="clay-pill-inset h-[38px] w-[38px] flex items-center justify-center text-[var(--text-2)] hover:brightness-95 transition-all"
        >
          {audioAlertsEnabled ? (
            <Volume2 className="w-4 h-4 text-[var(--ok-ink)]" />
          ) : (
            <VolumeX className="w-4 h-4 text-[var(--text-3)]" />
          )}
        </button>

        {/* Incident Alerts Quick Menu */}
        <div className="relative">
          <button
            onClick={() => setShowAlertMenu(!showAlertMenu)}
            className="clay-pill-inset h-[38px] w-[38px] relative flex items-center justify-center text-[var(--text-2)] hover:brightness-95 transition-all"
            title="Active Safety Alerts"
          >
            <Bell className="w-4 h-4" />
            {metrics.unacknowledgedIncidentsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--critical)] text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center shadow-sm">
                {metrics.unacknowledgedIncidentsCount}
              </span>
            )}
          </button>

          {showAlertMenu && (
            <div className="clay-raised absolute right-0 mt-2 w-80 p-3 z-30 font-sans shadow-xl">
              <div className="pb-2.5 mb-2 border-b border-[#D8CEBF]/60 flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text)] uppercase tracking-wider font-mono">
                  Active Priority Incidents
                </span>
                <span className="text-xs font-mono text-[var(--critical-ink)] bg-[var(--critical-clay)] px-2.5 py-0.5 rounded-full font-bold">
                  {metrics.activeIncidentsCount} Active
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                {unhandledIncidents.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[var(--text-3)]">
                    No active unresolved incidents
                  </div>
                ) : (
                  unhandledIncidents.map(inc => (
                    <div
                      key={inc.id}
                      onClick={() => {
                        setSelectedIncidentId(inc.id);
                        setActivePage('incidents');
                        setShowAlertMenu(false);
                      }}
                      className="clay-inset p-2.5 rounded-2xl cursor-pointer hover:brightness-95 transition-all"
                    >
                      <div className="flex items-center justify-between text-xs mb-1 font-mono">
                        <span className="font-bold text-[var(--critical-ink)] flex items-center gap-1">
                          <AlertOctagon className="w-3.5 h-3.5" />
                          {inc.type.replace('_', ' ')}
                        </span>
                        <span className="text-[var(--text-3)] text-[11px]">{formatTime(inc.timestamp)}</span>
                      </div>
                      <p className="text-xs text-[var(--text)] font-semibold truncate font-sans">
                        {inc.workerName} ({inc.sector})
                      </p>
                      <p className="text-xs text-[var(--warning-ink)] mt-0.5 font-mono truncate">
                        {inc.triggerValue}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2.5 mt-2 border-t border-[#D8CEBF]/60 text-center">
                <button
                  onClick={() => {
                    setActivePage('incidents');
                    setShowAlertMenu(false);
                  }}
                  className="text-xs text-[var(--info-ink)] hover:underline uppercase tracking-wider font-bold font-mono"
                >
                  Open Incident Queue →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Supervisor Profile Pill */}
        <div className="clay-pill-inset h-[38px] px-3.5 flex items-center gap-2 text-xs font-sans text-[var(--text)] font-semibold">
          <UserCheck className="w-4 h-4 text-[var(--text-2)]" />
          <span>Dave Miller · Shift Lead</span>
        </div>
      </div>
    </header>
  );
};
