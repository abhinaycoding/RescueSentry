import { Worker, Incident, AuditEvent, DeviceHealth, SafetyThresholds, TelemetryReading } from '../types';
import { 
  INITIAL_WORKERS, 
  INITIAL_INCIDENTS, 
  INITIAL_EVENTS, 
  INITIAL_DEVICES, 
  INITIAL_THRESHOLDS,
  generateHistoricalTelemetry 
} from './mockData';

export type OperatingMode = 'demo' | 'api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class DataService {
  private mode: OperatingMode = 'demo';
  private workers: Worker[] = JSON.parse(JSON.stringify(INITIAL_WORKERS));
  private incidents: Incident[] = JSON.parse(JSON.stringify(INITIAL_INCIDENTS));
  private events: AuditEvent[] = JSON.parse(JSON.stringify(INITIAL_EVENTS));
  private devices: DeviceHealth[] = JSON.parse(JSON.stringify(INITIAL_DEVICES));
  private thresholds: SafetyThresholds = { ...INITIAL_THRESHOLDS };

  public getMode(): OperatingMode {
    return this.mode;
  }

  public setMode(mode: OperatingMode) {
    this.mode = mode;
  }

  public getApiBaseUrl(): string {
    return API_BASE_URL;
  }

  // --- Workers ---
  public async getWorkers(): Promise<Worker[]> {
    if (this.mode === 'api') {
      const res = await fetch(`${API_BASE_URL}/workers`);
      if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
      return await res.json();
    }
    return [...this.workers];
  }

  public async addWorker(workerData: {
    name: string;
    role: string;
    sector: string;
    helmetId: string;
    shift?: string;
    bloodGroup?: string;
    emergencyContact?: string;
    batteryPct?: number;
  }): Promise<Worker> {
    const nextNum = this.workers.length + 101;
    const newId = `WRK-${nextNum}`;
    const nowIso = new Date().toISOString();

    const newWorker: Worker = {
      id: newId,
      name: workerData.name,
      role: workerData.role,
      sector: workerData.sector,
      helmetId: workerData.helmetId,
      helmetWorn: true,
      connectionStatus: 'ONLINE',
      safetyState: 'NORMAL',
      lastSeen: nowIso,
      recentIncidentsCount: 0,
      shift: workerData.shift || 'Shift A (06:00 - 14:00)',
      bloodGroup: workerData.bloodGroup || 'O+',
      emergencyContact: workerData.emergencyContact || '+1 (555) 700-1122',
      telemetry: {
        timestamp: nowIso,
        ch4: 0.08,
        co: 4,
        temperature: 24.0,
        humidity: 62,
        helmetWorn: true,
        sosPressed: false,
        batteryPct: workerData.batteryPct !== undefined ? workerData.batteryPct : 98,
        rssi: -58
      }
    };

    if (this.mode === 'api') {
      const res = await fetch(`${API_BASE_URL}/workers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWorker)
      });
      if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
      const saved = await res.json();
      return saved.worker || saved;
    }

    // Demo mode: prepend to workers list
    this.workers.unshift(newWorker);

    // Also register device in hardware inventory
    const newDevice: DeviceHealth = {
      helmetId: newWorker.helmetId,
      workerId: newWorker.id,
      workerName: newWorker.name,
      sector: newWorker.sector,
      firmwareVersion: 'v2.4.1-esp32s3',
      status: 'ONLINE',
      batteryPct: newWorker.telemetry.batteryPct,
      wifiRssi: newWorker.telemetry.rssi,
      lastPacketTime: nowIso,
      packetLossRate: 0.1,
      sensorsHealth: {
        gasSensor: 'OK',
        tempHumidSensor: 'OK',
        irWearSensor: 'OK',
        sosSwitch: 'OK'
      }
    };
    this.devices.unshift(newDevice);

    // Add audit event log entry
    this.events.unshift({
      id: `EVT-${Date.now()}`,
      timestamp: nowIso,
      category: 'PROVISIONED',
      severity: 'INFO',
      workerId: newWorker.id,
      workerName: newWorker.name,
      sector: newWorker.sector,
      message: `Miner ${newWorker.name} (${newWorker.id}) provisioned with Smart Helmet ${newWorker.helmetId}.`,
      isSimulated: this.mode === 'demo'
    });

    return newWorker;
  }

  // --- Incidents ---
  public async getIncidents(): Promise<Incident[]> {
    if (this.mode === 'api') {
      const res = await fetch(`${API_BASE_URL}/incidents`);
      if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
      return await res.json();
    }
    return [...this.incidents];
  }

  public async acknowledgeIncident(incidentId: string, supervisorName = 'Chief Supervisor Dave Miller'): Promise<Incident> {
    if (this.mode === 'api') {
      const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledgedBy: supervisorName })
      });
      if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
      return await res.json();
    }

    // Demo Mode implementation
    const inc = this.incidents.find(i => i.id === incidentId);
    if (!inc) throw new Error('Incident not found');

    inc.acknowledged = true;
    inc.acknowledgedBy = supervisorName;
    inc.acknowledgedAt = new Date().toISOString();
    inc.timeline.unshift({
      id: `TL-ACK-${Date.now()}`,
      timestamp: new Date().toISOString(),
      event: `Incident acknowledged by supervisor`,
      actor: supervisorName
    });

    this.events.unshift({
      id: `EVT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'ACKNOWLEDGED',
      severity: 'INFO',
      workerId: inc.workerId,
      workerName: inc.workerName,
      sector: inc.sector,
      message: `Incident ${inc.id} (${inc.type}) acknowledged by ${supervisorName}`,
      isSimulated: true
    });

    return { ...inc };
  }

  public async resolveIncident(
    incidentId: string, 
    resolutionNotes: string, 
    supervisorName = 'Chief Supervisor Dave Miller'
  ): Promise<Incident> {
    if (this.mode === 'api') {
      const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolvedBy: supervisorName, resolutionNotes })
      });
      if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
      return await res.json();
    }

    // Demo Mode implementation
    const inc = this.incidents.find(i => i.id === incidentId);
    if (!inc) throw new Error('Incident not found');

    inc.resolved = true;
    inc.resolvedBy = supervisorName;
    inc.resolvedAt = new Date().toISOString();
    inc.resolutionNotes = resolutionNotes;
    inc.timeline.unshift({
      id: `TL-RES-${Date.now()}`,
      timestamp: new Date().toISOString(),
      event: `Incident marked RESOLVED: ${resolutionNotes}`,
      actor: supervisorName
    });

    // Check if worker still has any other active incidents
    const remainingForWorker = this.incidents.filter(i => i.workerId === inc.workerId && !i.resolved && i.id !== incidentId);
    const worker = this.workers.find(w => w.id === inc.workerId);
    if (worker) {
      worker.recentIncidentsCount = remainingForWorker.length;
      if (remainingForWorker.length === 0) {
        if (inc.type === 'SOS_EMERGENCY') {
          worker.telemetry.sosPressed = false;
        }
        if (worker.connectionStatus === 'ONLINE' && worker.helmetWorn) {
          worker.safetyState = worker.telemetry.ch4 >= this.thresholds.ch4Warning || worker.telemetry.co >= this.thresholds.coWarning ? 'WARNING' : 'NORMAL';
        }
      }
    }

    this.events.unshift({
      id: `EVT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'RESOLVED',
      severity: 'INFO',
      workerId: inc.workerId,
      workerName: inc.workerName,
      sector: inc.sector,
      message: `Incident ${inc.id} RESOLVED: ${resolutionNotes}`,
      isSimulated: true
    });

    return { ...inc };
  }

  // --- Audit Events ---
  public async getAuditEvents(): Promise<AuditEvent[]> {
    if (this.mode === 'api') {
      const res = await fetch(`${API_BASE_URL}/events`);
      if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
      return await res.json();
    }
    return [...this.events];
  }

  // --- Device Health ---
  public async getDevices(): Promise<DeviceHealth[]> {
    if (this.mode === 'api') {
      const res = await fetch(`${API_BASE_URL}/health/devices`);
      if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
      return await res.json();
    }
    return [...this.devices];
  }

  // --- Historical Telemetry ---
  public async getHistoricalTelemetry(range: '15m' | '1h' | '4h' | '24h' = '1h') {
    if (this.mode === 'api') {
      const res = await fetch(`${API_BASE_URL}/telemetry/history?range=${range}`);
      if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
      return await res.json();
    }
    const count = range === '15m' ? 15 : range === '1h' ? 30 : range === '4h' ? 60 : 96;
    return generateHistoricalTelemetry(count);
  }

  // --- Thresholds ---
  public getThresholds(): SafetyThresholds {
    return { ...this.thresholds };
  }

  public updateThresholds(newThresholds: Partial<SafetyThresholds>): SafetyThresholds {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    this.recalculateWorkerSafetyStates();
    return { ...this.thresholds };
  }

  // Recalculates safety states for all workers in memory based on thresholds
  private recalculateWorkerSafetyStates() {
    this.workers.forEach(w => {
      if (w.connectionStatus === 'OFFLINE') {
        w.safetyState = 'OFFLINE';
        return;
      }
      if (w.connectionStatus === 'STALE') {
        w.safetyState = 'STALE';
        return;
      }
      if (w.telemetry.sosPressed) {
        w.safetyState = 'CRITICAL';
        return;
      }
      if (w.telemetry.ch4 >= this.thresholds.ch4Critical || w.telemetry.co >= this.thresholds.coCritical || w.telemetry.temperature >= this.thresholds.tempCritical) {
        w.safetyState = 'CRITICAL';
        return;
      }
      if (!w.helmetWorn || w.telemetry.ch4 >= this.thresholds.ch4Warning || w.telemetry.co >= this.thresholds.coWarning || w.telemetry.temperature >= this.thresholds.tempWarning) {
        w.safetyState = 'WARNING';
        return;
      }
      w.safetyState = 'NORMAL';
    });
  }

  // --- Demo Mode Simulation Tick ---
  public simulateTelemetryTick(): { workers: Worker[]; incidents: Incident[]; events: AuditEvent[]; devices: DeviceHealth[] } {
    if (this.mode !== 'demo') {
      return { workers: this.workers, incidents: this.incidents, events: this.events, devices: this.devices };
    }

    const timestamp = new Date().toISOString();

    // Slightly fluctuate readings for online workers
    this.workers = this.workers.map(w => {
      if (w.connectionStatus === 'OFFLINE') return w;

      if (w.connectionStatus === 'STALE') {
        // keep stale
        return w;
      }

      // Small jitter for online helmet
      const ch4Delta = (Math.random() - 0.48) * 0.04;
      const coDelta = Math.floor((Math.random() - 0.48) * 2);
      const tempDelta = (Math.random() - 0.5) * 0.1;
      const humDelta = Math.floor((Math.random() - 0.5) * 2);

      const newCh4 = +(Math.max(0.01, w.telemetry.ch4 + ch4Delta)).toFixed(2);
      const newCo = Math.max(0, w.telemetry.co + coDelta);
      const newTemp = +(w.telemetry.temperature + tempDelta).toFixed(1);
      const newHum = Math.min(99, Math.max(30, w.telemetry.humidity + humDelta));

      const updatedTelemetry: TelemetryReading = {
        ...w.telemetry,
        timestamp,
        ch4: newCh4,
        co: newCo,
        temperature: newTemp,
        humidity: newHum,
        batteryPct: Math.max(5, w.telemetry.batteryPct - (Math.random() < 0.05 ? 1 : 0))
      };

      return {
        ...w,
        lastSeen: timestamp,
        telemetry: updatedTelemetry
      };
    });

    this.recalculateWorkerSafetyStates();

    // Update devices last packet
    this.devices = this.devices.map(d => {
      if (d.status === 'ONLINE') {
        return {
          ...d,
          lastPacketTime: timestamp,
          wifiRssi: Math.min(-45, Math.max(-88, d.wifiRssi + Math.floor((Math.random() - 0.5) * 3)))
        };
      }
      return d;
    });

    return {
      workers: [...this.workers],
      incidents: [...this.incidents],
      events: [...this.events],
      devices: [...this.devices]
    };
  }

  // Inject a simulated emergency or test condition
  public injectSimulatedEvent(type: 'SPURT_GAS' | 'SIMULATE_SOS' | 'DETACH_HELMET' | 'RECONNECT_ALL') {
    const timestamp = new Date().toISOString();

    if (type === 'SIMULATE_SOS') {
      const worker = this.workers.find(w => w.id === 'WRK-105'); // Mateo Cruz
      if (worker) {
        worker.telemetry.sosPressed = true;
        worker.safetyState = 'CRITICAL';
        worker.recentIncidentsCount++;

        const newInc: Incident = {
          id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
          workerId: worker.id,
          workerName: worker.name,
          helmetId: worker.helmetId,
          sector: worker.sector,
          type: 'SOS_EMERGENCY',
          severity: 'CRITICAL',
          timestamp,
          triggerValue: 'Manual Emergency Tactile Switch Pressed',
          currentValue: 'SOS ACTIVE ON MESH',
          acknowledged: false,
          resolved: false,
          timeline: [
            {
              id: `TL-${Date.now()}`,
              timestamp,
              event: `SOS button manually depressed on helmet ${worker.helmetId}`,
              actor: `${worker.name} (Worker)`
            }
          ]
        };

        this.incidents.unshift(newInc);
        this.events.unshift({
          id: `EVT-${Date.now()}`,
          timestamp,
          category: 'SOS_TRIGGERED',
          severity: 'CRITICAL',
          workerId: worker.id,
          workerName: worker.name,
          sector: worker.sector,
          message: `SOS Emergency Signal broadcast from ${worker.helmetId}`,
          isSimulated: true
        });
      }
    } else if (type === 'SPURT_GAS') {
      const worker = this.workers.find(w => w.id === 'WRK-104'); // Liam Gallagher
      if (worker) {
        worker.telemetry.ch4 = 1.68;
        worker.telemetry.co = 38;
        worker.safetyState = 'CRITICAL';
        worker.recentIncidentsCount++;

        const newInc: Incident = {
          id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
          workerId: worker.id,
          workerName: worker.name,
          helmetId: worker.helmetId,
          sector: worker.sector,
          type: 'HAZARDOUS_GAS',
          severity: 'CRITICAL',
          timestamp,
          triggerValue: 'CH4 Exceeded 1.50% LEL (Measured: 1.68%)',
          currentValue: '1.68% LEL CH4',
          acknowledged: false,
          resolved: false,
          timeline: [
            {
              id: `TL-${Date.now()}`,
              timestamp,
              event: `Gas sensor MQ-4 triggered critical threshold`,
              actor: `${worker.helmetId}`
            }
          ]
        };

        this.incidents.unshift(newInc);
        this.events.unshift({
          id: `EVT-${Date.now()}`,
          timestamp,
          category: 'GAS_EXCEEDED',
          severity: 'CRITICAL',
          workerId: worker.id,
          workerName: worker.name,
          sector: worker.sector,
          message: `CH4 spike 1.68% LEL detected in ${worker.sector}`,
          isSimulated: true
        });
      }
    } else if (type === 'DETACH_HELMET') {
      const worker = this.workers.find(w => w.id === 'WRK-106'); // Anya Petrov
      if (worker) {
        worker.helmetWorn = !worker.helmetWorn;
        worker.telemetry.helmetWorn = worker.helmetWorn;
        worker.safetyState = worker.helmetWorn ? 'NORMAL' : 'WARNING';
        
        if (!worker.helmetWorn) {
          const newInc: Incident = {
            id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
            workerId: worker.id,
            workerName: worker.name,
            helmetId: worker.helmetId,
            sector: worker.sector,
            type: 'HELMET_REMOVED',
            severity: 'WARNING',
            timestamp,
            triggerValue: 'IR sensor lost skin proximity',
            currentValue: 'Helmet Detached',
            acknowledged: false,
            resolved: false,
            timeline: [
              {
                id: `TL-${Date.now()}`,
                timestamp,
                event: `Helmet removed in active sector`,
                actor: `${worker.helmetId}`
              }
            ]
          };
          this.incidents.unshift(newInc);
          this.events.unshift({
            id: `EVT-${Date.now()}`,
            timestamp,
            category: 'HELMET_REMOVED',
            severity: 'WARNING',
            workerId: worker.id,
            workerName: worker.name,
            sector: worker.sector,
            message: `Helmet removed: ${worker.name}`,
            isSimulated: true
          });
        }
      }
    } else if (type === 'RECONNECT_ALL') {
      this.workers.forEach(w => {
        w.connectionStatus = 'ONLINE';
        w.telemetry.sosPressed = false;
        w.helmetWorn = true;
        w.telemetry.helmetWorn = true;
        w.telemetry.ch4 = 0.08;
        w.telemetry.co = 4;
        w.safetyState = 'NORMAL';
      });
      this.devices.forEach(d => {
        d.status = 'ONLINE';
        d.lastPacketTime = timestamp;
      });
    }
  }
}

export const dataService = new DataService();
