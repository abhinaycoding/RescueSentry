import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Worker, 
  Incident, 
  AuditEvent, 
  DeviceHealth, 
  MineSite, 
  SafetyThresholds, 
  ActivePage,
  FleetMetrics
} from '../types';
import { dataService, OperatingMode } from '../services/dataService';
import { MINE_SITES } from '../services/mockData';
import { computeFleetMetrics, assertDataIntegrity, playEmergencyAlarm } from '../utils/metrics';

interface SentryContextType {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  selectedSite: MineSite;
  setSelectedSite: (site: MineSite) => void;
  mineSites: MineSite[];
  mode: OperatingMode;
  setMode: (mode: OperatingMode) => void;
  simulatedTicksEnabled: boolean;
  setSimulatedTicksEnabled: (val: boolean) => void;
  workers: Worker[];
  incidents: Incident[];
  events: AuditEvent[];
  devices: DeviceHealth[];
  thresholds: SafetyThresholds;
  updateThresholds: (newT: Partial<SafetyThresholds>) => void;
  isLoading: boolean;
  apiError: string | null;
  lastSyncTime: Date;
  syncData: () => Promise<void>;
  selectedWorkerId: string | null;
  setSelectedWorkerId: (id: string | null) => void;
  selectedIncidentId: string | null;
  setSelectedIncidentId: (id: string | null) => void;
  addWorker: (workerData: {
    name: string;
    role: string;
    sector: string;
    helmetId: string;
    shift?: string;
    bloodGroup?: string;
    emergencyContact?: string;
    batteryPct?: number;
  }) => Promise<Worker>;
  acknowledgeIncident: (id: string) => Promise<void>;
  resolveIncident: (id: string, notes: string) => Promise<void>;
  dispatchRescue: (workerId: string, sector: string) => Promise<void>;
  callWorkerRadio: (workerId: string) => void;
  triggerSimulation: (type: 'SPURT_GAS' | 'SIMULATE_SOS' | 'DETACH_HELMET' | 'RECONNECT_ALL') => void;
  
  // Single Source of Truth Fleet Metrics
  metrics: FleetMetrics;
  activeSosIncident: Incident | null;
  activeSosWorker: Worker | null;
  
  audioAlertsEnabled: boolean;
  setAudioAlertsEnabled: (val: boolean) => void;
  rescueDispatchedWorkerId: string | null;
  radioActiveWorkerId: string | null;
}

const SentryContext = createContext<SentryContextType | undefined>(undefined);

export const SentryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<ActivePage>('overview');
  const [selectedSite, setSelectedSite] = useState<MineSite>(MINE_SITES[0]);
  const [mode, setModeState] = useState<OperatingMode>(dataService.getMode());
  const [simulatedTicksEnabled, setSimulatedTicksEnabled] = useState<boolean>(true);
  
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [devices, setDevices] = useState<DeviceHealth[]>([]);
  const [thresholds, setThresholds] = useState<SafetyThresholds>(dataService.getThresholds());
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [audioAlertsEnabled, setAudioAlertsEnabled] = useState<boolean>(false);
  const [rescueDispatchedWorkerId, setRescueDispatchedWorkerId] = useState<string | null>(null);
  const [radioActiveWorkerId, setRadioActiveWorkerId] = useState<string | null>(null);

  const prevSosCountRef = useRef<number>(0);

  const setMode = useCallback((newMode: OperatingMode) => {
    dataService.setMode(newMode);
    setModeState(newMode);
  }, []);

  const syncData = useCallback(async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      const [w, inc, ev, dev] = await Promise.all([
        dataService.getWorkers(),
        dataService.getIncidents(),
        dataService.getAuditEvents(),
        dataService.getDevices()
      ]);
      setWorkers(w);
      setIncidents(inc);
      setEvents(ev);
      setDevices(dev);
      setLastSyncTime(new Date());
    } catch (err: any) {
      setApiError(err.message || 'Failed to sync telemetry data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    syncData();
  }, [syncData, mode]);

  // Derived Fleet Metrics (Single Source of Truth)
  const metrics = useMemo(() => {
    return computeFleetMetrics(workers, incidents);
  }, [workers, incidents]);

  // Dev integrity assertion
  useEffect(() => {
    if (workers.length > 0) {
      assertDataIntegrity(metrics, workers, incidents);
    }
  }, [metrics, workers, incidents]);

  // Play audio alert if new unacknowledged SOS arrives
  useEffect(() => {
    if (audioAlertsEnabled && metrics.criticalSosIncidentsCount > prevSosCountRef.current) {
      playEmergencyAlarm();
    }
    prevSosCountRef.current = metrics.criticalSosIncidentsCount;
  }, [metrics.criticalSosIncidentsCount, audioAlertsEnabled]);

  // Active SOS Incident and Worker (prioritized)
  const activeSosIncident = useMemo(() => {
    return incidents.find(i => !i.resolved && i.type === 'SOS_EMERGENCY') || null;
  }, [incidents]);

  const activeSosWorker = useMemo(() => {
    if (activeSosIncident) {
      return workers.find(w => w.id === activeSosIncident.workerId) || null;
    }
    return workers.find(w => w.telemetry.sosPressed) || null;
  }, [activeSosIncident, workers]);

  // Simulated ticks in Demo Mode (or polling in API mode)
  useEffect(() => {
    if (mode === 'demo') {
      if (!simulatedTicksEnabled) return;
      const interval = setInterval(() => {
        const nextState = dataService.simulateTelemetryTick();
        setWorkers(nextState.workers);
        setIncidents(nextState.incidents);
        setEvents(nextState.events);
        setDevices(nextState.devices);
        setLastSyncTime(new Date());
      }, 4000);
      return () => clearInterval(interval);
    } else {
      const interval = setInterval(() => {
        syncData();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [mode, simulatedTicksEnabled, syncData]);

  const updateThresholds = useCallback((newT: Partial<SafetyThresholds>) => {
    const updated = dataService.updateThresholds(newT);
    setThresholds(updated);
    dataService.getWorkers().then(setWorkers);
  }, []);

  const acknowledgeIncident = useCallback(async (id: string) => {
    try {
      const updated = await dataService.acknowledgeIncident(id);
      setIncidents(prev => prev.map(i => i.id === id ? updated : i));
      const evts = await dataService.getAuditEvents();
      setEvents(evts);
    } catch (err: any) {
      alert(`Acknowledgement error: ${err.message}`);
    }
  }, []);

  const resolveIncident = useCallback(async (id: string, notes: string) => {
    try {
      const updated = await dataService.resolveIncident(id, notes);
      setIncidents(prev => prev.map(i => i.id === id ? updated : i));
      const [w, evts] = await Promise.all([
        dataService.getWorkers(),
        dataService.getAuditEvents()
      ]);
      setWorkers(w);
      setEvents(evts);
      // If this worker had rescue dispatched, clear flag
      if (rescueDispatchedWorkerId === updated.workerId) {
        setRescueDispatchedWorkerId(null);
      }
    } catch (err: any) {
      alert(`Resolution error: ${err.message}`);
    }
  }, [rescueDispatchedWorkerId]);

  const addWorker = useCallback(async (workerData: {
    name: string;
    role: string;
    sector: string;
    helmetId: string;
    shift?: string;
    bloodGroup?: string;
    emergencyContact?: string;
    batteryPct?: number;
  }): Promise<Worker> => {
    try {
      const created = await dataService.addWorker(workerData);
      const [w, dev, evts] = await Promise.all([
        dataService.getWorkers(),
        dataService.getDevices(),
        dataService.getAuditEvents()
      ]);
      setWorkers(w);
      setDevices(dev);
      setEvents(evts);
      setSelectedWorkerId(created.id);
      return created;
    } catch (err: any) {
      alert(`Worker registration error: ${err.message}`);
      throw err;
    }
  }, []);

  const dispatchRescue = useCallback(async (workerId: string, sector: string) => {
    setRescueDispatchedWorkerId(workerId);
    // Find incident and acknowledge it if not yet acknowledged
    const inc = incidents.find(i => i.workerId === workerId && !i.resolved);
    if (inc && !inc.acknowledged) {
      await acknowledgeIncident(inc.id);
    }
  }, [incidents, acknowledgeIncident]);

  const callWorkerRadio = useCallback((workerId: string) => {
    setRadioActiveWorkerId(prev => prev === workerId ? null : workerId);
  }, []);

  const triggerSimulation = useCallback((type: 'SPURT_GAS' | 'SIMULATE_SOS' | 'DETACH_HELMET' | 'RECONNECT_ALL') => {
    dataService.injectSimulatedEvent(type);
    dataService.getWorkers().then(setWorkers);
    dataService.getIncidents().then(setIncidents);
    dataService.getAuditEvents().then(setEvents);
    dataService.getDevices().then(setDevices);
    setLastSyncTime(new Date());
    if (type === 'SIMULATE_SOS' && audioAlertsEnabled) {
      playEmergencyAlarm();
    }
  }, [audioAlertsEnabled]);

  return (
    <SentryContext.Provider
      value={{
        activePage,
        setActivePage,
        selectedSite,
        setSelectedSite,
        mineSites: MINE_SITES,
        mode,
        setMode,
        simulatedTicksEnabled,
        setSimulatedTicksEnabled,
        workers,
        incidents,
        events,
        devices,
        thresholds,
        updateThresholds,
        isLoading,
        apiError,
        lastSyncTime,
        syncData,
        selectedWorkerId,
        setSelectedWorkerId,
        selectedIncidentId,
        setSelectedIncidentId,
        addWorker,
        acknowledgeIncident,
        resolveIncident,
        dispatchRescue,
        callWorkerRadio,
        triggerSimulation,
        metrics,
        activeSosIncident,
        activeSosWorker,
        audioAlertsEnabled,
        setAudioAlertsEnabled,
        rescueDispatchedWorkerId,
        radioActiveWorkerId
      }}
    >
      {children}
    </SentryContext.Provider>
  );
};

export const useSentry = () => {
  const context = useContext(SentryContext);
  if (!context) {
    throw new Error('useSentry must be used within a SentryProvider');
  }
  return context;
};
