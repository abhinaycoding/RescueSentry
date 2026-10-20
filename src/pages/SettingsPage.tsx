import React, { useState } from 'react';
import { useSentry } from '../context/SentryContext';
import { API_CONTRACTS } from '../services/apiContracts';
import { 
  Settings, 
  Volume2, 
  VolumeX, 
  Check, 
  Save
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { 
    thresholds, 
    updateThresholds, 
    mode, 
    setMode, 
    audioAlertsEnabled, 
    setAudioAlertsEnabled 
  } = useSentry();

  const [formValues, setFormValues] = useState({ ...thresholds });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'thresholds' | 'api' | 'audio'>('thresholds');

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    updateThresholds(formValues);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-5 animate-fadeIn font-sans text-[var(--text)]">
      {/* Top Banner */}
      <div className="clay-raised p-5 rounded-[28px] border border-[#D8CEBF]/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="clay-pill-inset p-2 text-[var(--info-ink)]">
              <Settings className="w-5 h-5 text-[var(--info-ink)]" />
            </div>
            <h2 className="text-sm font-extrabold font-mono tracking-wider text-[var(--text)] uppercase">
              Control Room System Settings & Backend Integration
            </h2>
          </div>
          <p className="text-xs text-[var(--text-3)] mt-1.5 font-sans font-medium">
            Calibrate safety trigger thresholds, configure live telemetry integration with Python/Flask backend, and manage notification preferences.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center clay-pill-inset p-1 font-mono text-xs gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('thresholds')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'thresholds' 
                ? 'bg-[#2A2520] text-white shadow-sm' 
                : 'text-[var(--text-3)] hover:text-[var(--text)]'
            }`}
          >
            Safety Thresholds
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('api')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'api' 
                ? 'bg-[#2A2520] text-white shadow-sm' 
                : 'text-[var(--text-3)] hover:text-[var(--text)]'
            }`}
          >
            Flask API Integration
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audio')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'audio' 
                ? 'bg-[#2A2520] text-white shadow-sm' 
                : 'text-[var(--text-3)] hover:text-[var(--text)]'
            }`}
          >
            Alert Audio & Notifications
          </button>
        </div>
      </div>

      {/* Tab 1: Safety Thresholds Form */}
      {activeTab === 'thresholds' && (
        <form onSubmit={handleSaveThresholds} className="clay-raised p-6 rounded-[28px] border border-[#D8CEBF]/60 space-y-6 font-sans">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D8CEBF]/60 pb-3">
            <div>
              <h3 className="text-xs font-extrabold font-mono text-[var(--text)] uppercase tracking-wider">
                Gas & Environmental Trigger Thresholds
              </h3>
              <p className="text-xs text-[var(--text-3)] mt-1 font-medium">
                Exceeding warning limits flags helmets in yellow; exceeding critical limits triggers immediate supervisor alarm escalations.
              </p>
            </div>
            {saveSuccess && (
              <span className="clay-pill px-3 py-1 bg-[#EAF7EE] text-[#1E6B42] border border-emerald-300 text-xs font-extrabold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Parameters Saved & Propagated
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* CH4 Methane */}
            <div className="clay-inset p-4 rounded-[20px] space-y-3">
              <span className="text-xs font-extrabold font-mono text-[#1E6B42] uppercase tracking-wide block">
                Methane CH4 (% LEL)
              </span>
              <div>
                <label className="text-xs text-[var(--text-3)] font-mono font-bold block mb-1">
                  Warning Threshold (% LEL):
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={formValues.ch4Warning}
                  onChange={e => setFormValues({ ...formValues, ch4Warning: Number(e.target.value) })}
                  className="w-full px-3 py-2 clay-input text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-3)] font-mono font-bold block mb-1">
                  Critical Alarm Threshold (% LEL):
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={formValues.ch4Critical}
                  onChange={e => setFormValues({ ...formValues, ch4Critical: Number(e.target.value) })}
                  className="w-full px-3 py-2 clay-input text-xs font-mono font-bold text-[#B52A31]"
                />
              </div>
            </div>

            {/* Carbon Monoxide */}
            <div className="clay-inset p-4 rounded-[20px] space-y-3">
              <span className="text-xs font-extrabold font-mono text-[#8A5500] uppercase tracking-wide block">
                Carbon Monoxide CO (ppm)
              </span>
              <div>
                <label className="text-xs text-[var(--text-3)] font-mono font-bold block mb-1">
                  Warning Threshold (ppm):
                </label>
                <input
                  type="number"
                  step="1"
                  value={formValues.coWarning}
                  onChange={e => setFormValues({ ...formValues, coWarning: Number(e.target.value) })}
                  className="w-full px-3 py-2 clay-input text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-3)] font-mono font-bold block mb-1">
                  Critical Alarm Threshold (ppm):
                </label>
                <input
                  type="number"
                  step="1"
                  value={formValues.coCritical}
                  onChange={e => setFormValues({ ...formValues, coCritical: Number(e.target.value) })}
                  className="w-full px-3 py-2 clay-input text-xs font-mono font-bold text-[#B52A31]"
                />
              </div>
            </div>

            {/* Temperature */}
            <div className="clay-inset p-4 rounded-[20px] space-y-3">
              <span className="text-xs font-extrabold font-mono text-[#B52A31] uppercase tracking-wide block">
                Thermal & Humidity Hazards
              </span>
              <div>
                <label className="text-xs text-[var(--text-3)] font-mono font-bold block mb-1">
                  Temperature Critical (°C):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formValues.tempCritical}
                  onChange={e => setFormValues({ ...formValues, tempCritical: Number(e.target.value) })}
                  className="w-full px-3 py-2 clay-input text-xs font-mono font-bold text-[#B52A31]"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-3)] font-mono font-bold block mb-1">
                  Max Relative Humidity (% RH):
                </label>
                <input
                  type="number"
                  step="1"
                  value={formValues.humidityMax}
                  onChange={e => setFormValues({ ...formValues, humidityMax: Number(e.target.value) })}
                  className="w-full px-3 py-2 clay-input text-xs font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#D8CEBF]/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setFormValues({ ...thresholds })}
              className="clay-button clay-btn-cream h-9 px-4 text-xs font-mono font-bold uppercase"
            >
              Reset
            </button>
            <button
              type="submit"
              className="clay-button clay-btn-amber h-9 px-5 text-xs font-mono font-extrabold uppercase flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Apply Safety Thresholds
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Flask API Integration Contracts */}
      {activeTab === 'api' && (
        <div className="space-y-4 font-sans">
          <div className="clay-raised p-6 rounded-[28px] border border-[#D8CEBF]/60">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D8CEBF]/60 pb-4 mb-4">
              <div>
                <h3 className="text-xs font-extrabold font-mono text-[var(--text)] uppercase tracking-wider">
                  Python / Flask Integration Hub
                </h3>
                <p className="text-xs text-[var(--text-3)] mt-1 font-medium">
                  Configure live REST API connectivity with your ESP32 hardware server bridge.
                </p>
              </div>

              {/* Mode switch */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[var(--text-3)] font-bold">Current Mode:</span>
                <button
                  type="button"
                  onClick={() => setMode(mode === 'demo' ? 'api' : 'demo')}
                  className={`clay-button text-xs font-mono font-bold px-4 h-9 ${
                    mode === 'demo'
                      ? 'clay-btn-cream'
                      : 'clay-btn-green'
                  }`}
                >
                  {mode === 'demo' ? 'DEMO MODE (MOCK DATA)' : 'LIVE FLASK API MODE'}
                </button>
              </div>
            </div>

            <div className="clay-inset p-4 rounded-[20px] text-xs font-mono space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[var(--text-3)] font-bold">Target Base URL:</span>
                <code className="text-[var(--text)] bg-[#EFE7DC] px-2.5 py-1 rounded-lg border border-[#D8CEBF] font-extrabold">
                  {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}
                </code>
              </div>
              <p className="text-xs text-[var(--text-3)] font-sans font-medium">
                Set environment variable <code className="text-[#8A5500] font-bold">VITE_API_BASE_URL</code> in <code className="text-[var(--text)] font-bold">.env</code> to redirect queries to your production Flask / FastAPI server.
              </p>
            </div>
          </div>

          {/* API Contracts Documentation */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold font-mono text-[var(--text-3)] uppercase tracking-wider">
              Documented Endpoint Contracts (Request / Response Schemas)
            </h4>

            {API_CONTRACTS.map((api, idx) => (
              <div key={idx} className="clay-raised p-5 rounded-[24px] border border-[#D8CEBF]/60 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-mono">
                    <span className={`clay-pill px-2.5 py-0.5 text-[10px] font-mono font-extrabold ${
                      api.method === 'GET' 
                        ? 'text-[#1E6B42] bg-[#EAF7EE] border border-emerald-300' 
                        : 'text-[#8A5500] bg-[#FEF3C7] border border-amber-300'
                    }`}>
                      {api.method}
                    </span>
                    <span className="font-extrabold text-[var(--text)]">{api.endpoint}</span>
                  </div>
                  <span className="text-[var(--text-3)] text-xs font-sans font-medium">{api.summary}</span>
                </div>

                <p className="text-[var(--text-2)] font-sans text-xs font-medium">
                  {api.description}
                </p>

                {api.requestBody && (
                  <div>
                    <span className="text-[10px] text-[var(--text-3)] font-mono uppercase tracking-wider block mb-1 font-bold">
                      Expected Request Body (JSON):
                    </span>
                    <pre className="clay-inset p-3 rounded-xl text-xs font-mono text-[var(--text)] overflow-x-auto bg-[#F6F0E8]">
                      {api.requestBody}
                    </pre>
                  </div>
                )}

                <div>
                  <span className="text-[10px] text-[var(--text-3)] font-mono uppercase tracking-wider block mb-1 font-bold">
                    Expected Response Body (JSON):
                  </span>
                  <pre className="clay-inset p-3 rounded-xl text-xs font-mono text-[#1E6B42] font-semibold overflow-x-auto bg-[#F6F0E8]">
                    {api.responseBody}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Audio & Notifications */}
      {activeTab === 'audio' && (
        <div className="clay-raised p-6 rounded-[28px] border border-[#D8CEBF]/60 font-sans space-y-4">
          <div className="border-b border-[#D8CEBF]/60 pb-3">
            <h3 className="text-xs font-extrabold font-mono text-[var(--text)] uppercase tracking-wider">
              Control Room Alarm & Audio Preferences
            </h3>
            <p className="text-xs text-[var(--text-3)] mt-1 font-medium">
              Manage acoustic annunciator sounds for critical SOS events and high-priority threshold crossings.
            </p>
          </div>

          <div className="space-y-3">
            <div className="clay-inset p-4 rounded-[20px] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="clay-pill-inset p-2">
                  {audioAlertsEnabled ? (
                    <Volume2 className="w-5 h-5 text-[#1E6B42]" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-[var(--text-3)]" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-extrabold text-[var(--text)]">
                    Acoustic SOS Emergency Annunciator
                  </div>
                  <div className="text-xs text-[var(--text-3)] font-medium mt-0.5">
                    Plays audio chime when a miner triggers an active SOS distress signal.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAudioAlertsEnabled(!audioAlertsEnabled)}
                className={`clay-button text-xs font-mono font-bold px-4 h-9 ${
                  audioAlertsEnabled 
                    ? 'clay-btn-green' 
                    : 'clay-btn-cream'
                }`}
              >
                {audioAlertsEnabled ? 'ENABLED' : 'MUTED'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
