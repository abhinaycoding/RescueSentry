export type SafetyState = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE' | 'STALE';

export type ConnectionStatus = 'ONLINE' | 'OFFLINE' | 'STALE';

export type IncidentCategory = 
  | 'SOS_EMERGENCY' 
  | 'HAZARDOUS_GAS' 
  | 'HELMET_REMOVED' 
  | 'ENVIRONMENTAL_WARNING' 
  | 'DEVICE_DISCONNECTED';

export type IncidentSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface TelemetryReading {
  timestamp: string;
  ch4: number; // Methane % LEL (Lower Explosive Limit)
  co: number; // Carbon Monoxide ppm
  temperature: number; // Celsius
  humidity: number; // % RH
  helmetWorn: boolean;
  sosPressed: boolean;
  batteryPct: number;
  rssi: number; // dBm
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  sector: string;
  helmetId: string;
  helmetWorn: boolean;
  connectionStatus: ConnectionStatus;
  safetyState: SafetyState;
  lastSeen: string;
  telemetry: TelemetryReading;
  recentIncidentsCount: number;
  shift: string;
  bloodGroup: string;
  emergencyContact: string;
}

export interface IncidentTimelineEvent {
  id: string;
  timestamp: string;
  event: string;
  actor: string;
  details?: string;
}

export interface Incident {
  id: string;
  workerId: string;
  workerName: string;
  helmetId: string;
  sector: string;
  type: IncidentCategory;
  severity: IncidentSeverity;
  timestamp: string;
  triggerValue: string;
  currentValue?: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  timeline: IncidentTimelineEvent[];
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  category: 'GAS_EXCEEDED' | 'HELMET_REMOVED' | 'HELMET_WORN' | 'SOS_TRIGGERED' | 'DISCONNECTED' | 'RECONNECTED' | 'ACKNOWLEDGED' | 'RESOLVED' | 'PROVISIONED';
  severity: IncidentSeverity;
  workerId?: string;
  workerName?: string;
  sector: string;
  message: string;
  isSimulated: boolean;
}

export interface DeviceHealth {
  helmetId: string;
  workerId: string;
  workerName: string;
  sector: string;
  firmwareVersion: string;
  status: ConnectionStatus;
  batteryPct: number;
  wifiRssi: number;
  lastPacketTime: string;
  packetLossRate: number; // %
  sensorsHealth: {
    gasSensor: 'OK' | 'DEGRADED' | 'ERROR';
    tempHumidSensor: 'OK' | 'ERROR';
    irWearSensor: 'OK' | 'ERROR';
    sosSwitch: 'OK' | 'ERROR';
  };
}

export interface MineSite {
  id: string;
  name: string;
  location: string;
  activeSectors: string[];
  gatewayIp: string;
  gatewayStatus: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
}

export interface SafetyThresholds {
  ch4Warning: number; // % LEL
  ch4Critical: number;
  coWarning: number; // ppm
  coCritical: number;
  tempWarning: number; // °C
  tempCritical: number;
  humidityMax: number; // %
  staleTimeoutSec: number; // seconds
}

export interface FleetMetrics {
  totalWorkers: number;
  criticalWorkersCount: number; // workers with active SOS
  warningWorkersCount: number;  // workers with warning/gas alert, no SOS
  normalWorkersCount: number;   // safe workers
  offlineWorkersCount: number;  // connectionStatus === 'OFFLINE'
  staleWorkersCount: number;    // connectionStatus === 'STALE'
  totalOfflineOrStale: number;  // offline + stale
  onlineHelmetsCount: number;   // connectionStatus === 'ONLINE'
  wornHelmetsCount: number;     // online & helmetWorn
  removedHelmetsCount: number;  // online & !helmetWorn
  
  // Incidents
  activeIncidentsCount: number; // all unresolved incidents (ack + unack)
  unacknowledgedIncidentsCount: number; // unresolved and !acknowledged
  acknowledgedActiveCount: number; // unresolved and acknowledged
  resolvedIncidentsCount: number;
  criticalSosIncidentsCount: number; // unresolved SOS incidents
}

export type ActivePage = 
  | 'overview'
  | 'workers'
  | 'incidents'
  | 'analytics'
  | 'health'
  | 'settings';
