import { Worker, Incident, AuditEvent, DeviceHealth, MineSite, SafetyThresholds, TelemetryReading } from '../types';

export const INITIAL_THRESHOLDS: SafetyThresholds = {
  ch4Warning: 1.0, // 1.0% LEL
  ch4Critical: 1.5, // 1.5% LEL (Lower Explosive Limit)
  coWarning: 25, // 25 ppm
  coCritical: 50, // 50 ppm
  tempWarning: 32.0, // 32 °C
  tempCritical: 38.0, // 38 °C
  humidityMax: 85, // %
  staleTimeoutSec: 25, // device marked stale after 25s of no packet
};

export const MINE_SITES: MineSite[] = [
  {
    id: 'SITE-ALPHA',
    name: 'Deep Ridge Mine — Sector Complex A',
    location: 'Shaft 4 (Sub-level -420m to -650m)',
    activeSectors: [
      'Sector 1 - Extraction Face',
      'Sector 2 - Ventilation Shaft B',
      'Sector 3 - North Haulage Drift',
      'Sector 4 - Blast Zone Alpha',
      'Sector 5 - Primary Crusher'
    ],
    gatewayIp: '192.168.40.10 (LoRa/WiFi Mesh Bridge)',
    gatewayStatus: 'ONLINE'
  },
  {
    id: 'SITE-BETA',
    name: 'Apex Copper Deep Drift',
    location: 'Horizon 3 Sub-Level Decline',
    activeSectors: ['Decline Ramp 1', 'Substation 4', 'Stoping Block C'],
    gatewayIp: '192.168.42.12 (Ethernet Gateway)',
    gatewayStatus: 'ONLINE'
  },
  {
    id: 'SITE-GAMMA',
    name: 'Vanguard Coal Basin — Seam 7',
    location: 'Longwall South - Panel 14',
    activeSectors: ['Longwall Face 14', 'Belt Conveyor 3', 'Intake Bleeder'],
    gatewayIp: '192.168.45.2',
    gatewayStatus: 'DEGRADED'
  }
];

const now = new Date();

export const INITIAL_WORKERS: Worker[] = [
  {
    id: 'WRK-101',
    name: 'Darius Stone',
    role: 'Blasting Lead',
    sector: 'Sector 4 - Blast Zone Alpha',
    helmetId: 'HLM-ESP32-01',
    helmetWorn: true,
    connectionStatus: 'ONLINE',
    safetyState: 'CRITICAL',
    lastSeen: new Date(now.getTime() - 4000).toISOString(),
    recentIncidentsCount: 2,
    shift: 'Shift A (06:00 - 14:00)',
    bloodGroup: 'O+',
    emergencyContact: '+1 (555) 492-8812',
    telemetry: {
      timestamp: new Date(now.getTime() - 4000).toISOString(),
      ch4: 1.82, // CRITICAL (>1.5% LEL)
      co: 42, // Elevated
      temperature: 34.6, // Warm
      humidity: 78,
      helmetWorn: true,
      sosPressed: true, // SOS ACTIVE!
      batteryPct: 76,
      rssi: -72
    }
  },
  {
    id: 'WRK-102',
    name: 'Elena Rostova',
    role: 'Ventilation Specialist',
    sector: 'Sector 2 - Ventilation Shaft B',
    helmetId: 'HLM-ESP32-02',
    helmetWorn: true,
    connectionStatus: 'ONLINE',
    safetyState: 'WARNING',
    lastSeen: new Date(now.getTime() - 8000).toISOString(),
    recentIncidentsCount: 1,
    shift: 'Shift A (06:00 - 14:00)',
    bloodGroup: 'A+',
    emergencyContact: '+1 (555) 304-9911',
    telemetry: {
      timestamp: new Date(now.getTime() - 8000).toISOString(),
      ch4: 0.45,
      co: 28, // Warning (>25 ppm)
      temperature: 26.2,
      humidity: 82,
      helmetWorn: true,
      sosPressed: false,
      batteryPct: 91,
      rssi: -64
    }
  },
  {
    id: 'WRK-103',
    name: 'Kwame Mensah',
    role: 'Jumbo Drill Operator',
    sector: 'Sector 1 - Extraction Face',
    helmetId: 'HLM-ESP32-03',
    helmetWorn: false, // HELMET REMOVED!
    connectionStatus: 'ONLINE',
    safetyState: 'WARNING',
    lastSeen: new Date(now.getTime() - 11000).toISOString(),
    recentIncidentsCount: 1,
    shift: 'Shift A (06:00 - 14:00)',
    bloodGroup: 'B+',
    emergencyContact: '+1 (555) 831-2094',
    telemetry: {
      timestamp: new Date(now.getTime() - 11000).toISOString(),
      ch4: 0.12,
      co: 8,
      temperature: 25.8,
      humidity: 64,
      helmetWorn: false, // Detached IR
      sosPressed: false,
      batteryPct: 84,
      rssi: -68
    }
  },
  {
    id: 'WRK-104',
    name: 'Liam Gallagher',
    role: 'Haulage Specialist',
    sector: 'Sector 3 - North Haulage Drift',
    helmetId: 'HLM-ESP32-04',
    helmetWorn: true,
    connectionStatus: 'ONLINE',
    safetyState: 'NORMAL',
    lastSeen: new Date(now.getTime() - 5000).toISOString(),
    recentIncidentsCount: 0,
    shift: 'Shift A (06:00 - 14:00)',
    bloodGroup: 'O-',
    emergencyContact: '+1 (555) 234-8712',
    telemetry: {
      timestamp: new Date(now.getTime() - 5000).toISOString(),
      ch4: 0.08,
      co: 4,
      temperature: 23.4,
      humidity: 62,
      helmetWorn: true,
      sosPressed: false,
      batteryPct: 88,
      rssi: -58
    }
  },
  {
    id: 'WRK-105',
    name: 'Mateo Cruz',
    role: 'Roof Bolter Lead',
    sector: 'Sector 1 - Extraction Face',
    helmetId: 'HLM-ESP32-05',
    helmetWorn: true,
    connectionStatus: 'ONLINE',
    safetyState: 'NORMAL',
    lastSeen: new Date(now.getTime() - 7000).toISOString(),
    recentIncidentsCount: 0,
    shift: 'Shift A (06:00 - 14:00)',
    bloodGroup: 'A-',
    emergencyContact: '+1 (555) 745-1234',
    telemetry: {
      timestamp: new Date(now.getTime() - 7000).toISOString(),
      ch4: 0.15,
      co: 6,
      temperature: 25.1,
      humidity: 69,
      helmetWorn: true,
      sosPressed: false,
      batteryPct: 79,
      rssi: -70
    }
  },
  {
    id: 'WRK-106',
    name: 'Anya Petrov',
    role: 'Geotechnical Surveyor',
    sector: 'Sector 2 - Ventilation Shaft B',
    helmetId: 'HLM-ESP32-06',
    helmetWorn: true,
    connectionStatus: 'ONLINE',
    safetyState: 'NORMAL',
    lastSeen: new Date(now.getTime() - 9000).toISOString(),
    recentIncidentsCount: 0,
    shift: 'Shift A (06:00 - 14:00)',
    bloodGroup: 'AB+',
    emergencyContact: '+1 (555) 902-3341',
    telemetry: {
      timestamp: new Date(now.getTime() - 9000).toISOString(),
      ch4: 0.05,
      co: 3,
      temperature: 22.3,
      humidity: 59,
      helmetWorn: true,
      sosPressed: false,
      batteryPct: 95,
      rssi: -61
    }
  },
  {
    id: 'WRK-107',
    name: 'Tariq Al-Mansoor',
    role: 'Substation Electrician',
    sector: 'Sector 5 - Primary Crusher',
    helmetId: 'HLM-ESP32-07',
    helmetWorn: true,
    connectionStatus: 'ONLINE',
    safetyState: 'NORMAL',
    lastSeen: new Date(now.getTime() - 14000).toISOString(),
    recentIncidentsCount: 0,
    shift: 'Shift A (06:00 - 14:00)',
    bloodGroup: 'O+',
    emergencyContact: '+1 (555) 412-7889',
    telemetry: {
      timestamp: new Date(now.getTime() - 14000).toISOString(),
      ch4: 0.02,
      co: 2,
      temperature: 24.8,
      humidity: 55,
      helmetWorn: true,
      sosPressed: false,
      batteryPct: 71,
      rssi: -66
    }
  },
  {
    id: 'WRK-108',
    name: 'Hiroshi Tanaka',
    role: 'Mine Safety Inspector',
    sector: 'Sector 3 - North Haulage Drift',
    helmetId: 'HLM-ESP32-08',
    helmetWorn: true,
    connectionStatus: 'ONLINE',
    safetyState: 'NORMAL',
    lastSeen: new Date(now.getTime() - 3000).toISOString(),
    recentIncidentsCount: 0,
    shift: 'Shift A (06:00 - 14:00)',
    bloodGroup: 'B-',
    emergencyContact: '+1 (555) 678-9900',
    telemetry: {
      timestamp: new Date(now.getTime() - 3000).toISOString(),
      ch4: 0.06,
      co: 5,
      temperature: 23.9,
      humidity: 61,
      helmetWorn: true,
      sosPressed: false,
      batteryPct: 86,
      rssi: -55
    }
  },
  {
    id: 'WRK-109',
    name: 'Chloe Moreau',
    role: 'LHD Loader Operator',
    sector: 'Sector 4 - Blast Zone Alpha',
    helmetId: 'HLM-ESP32-09',
    helmetWorn: true,
    connectionStatus: 'STALE', // Stale!
    safetyState: 'STALE',
    lastSeen: new Date(now.getTime() - 58000).toISOString(), // 58s ago
    recentIncidentsCount: 1,
    shift: 'Shift A (06:00 - 14:00)',
    bloodGroup: 'A+',
    emergencyContact: '+1 (555) 543-2109',
    telemetry: {
      timestamp: new Date(now.getTime() - 58000).toISOString(),
      ch4: 0.35,
      co: 12,
      temperature: 27.4,
      humidity: 71,
      helmetWorn: true,
      sosPressed: false,
      batteryPct: 41,
      rssi: -93 // High packet degradation
    }
  },
  {
    id: 'WRK-110',
    name: 'Viktor Lindqvist',
    role: 'Maintenance Technician',
    sector: 'Sector 5 - Primary Crusher',
    helmetId: 'HLM-ESP32-10',
    helmetWorn: false,
    connectionStatus: 'OFFLINE', // Disconnected
    safetyState: 'OFFLINE',
    lastSeen: new Date(now.getTime() - 920000).toISOString(), // ~15m ago
    recentIncidentsCount: 1,
    shift: 'Shift A (06:00 - 14:00)',
    bloodGroup: 'O+',
    emergencyContact: '+1 (555) 789-0123',
    telemetry: {
      timestamp: new Date(now.getTime() - 920000).toISOString(),
      ch4: 0.0,
      co: 0,
      temperature: 0,
      humidity: 0,
      helmetWorn: false,
      sosPressed: false,
      batteryPct: 12,
      rssi: 0
    }
  }
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-8901',
    workerId: 'WRK-101',
    workerName: 'Darius Stone',
    helmetId: 'HLM-ESP32-01',
    sector: 'Sector 4 - Blast Zone Alpha',
    type: 'SOS_EMERGENCY',
    severity: 'CRITICAL',
    timestamp: new Date(now.getTime() - 3 * 60000).toISOString(),
    triggerValue: 'Manual Emergency Tactile Switch Pressed',
    currentValue: 'SOS Switch Latched ON | CH4: 1.82% LEL',
    acknowledged: false,
    resolved: false,
    timeline: [
      {
        id: 'TL-1',
        timestamp: new Date(now.getTime() - 3 * 60000).toISOString(),
        event: 'Emergency SOS button latched on ESP32 helmet #HLM-ESP32-01',
        actor: 'Darius Stone (Worker Hardware)'
      },
      {
        id: 'TL-2',
        timestamp: new Date(now.getTime() - 2.8 * 60000).toISOString(),
        event: 'Telemetry broadcasted across LoRa/WiFi mesh bridge',
        actor: 'Gateway Mesh 192.168.40.10'
      }
    ]
  },
  {
    id: 'INC-8898',
    workerId: 'WRK-101',
    workerName: 'Darius Stone',
    helmetId: 'HLM-ESP32-01',
    sector: 'Sector 4 - Blast Zone Alpha',
    type: 'HAZARDOUS_GAS',
    severity: 'CRITICAL',
    timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
    triggerValue: 'CH4 Exceeded 1.50% LEL (Measured: 1.82% LEL)',
    currentValue: '1.82% LEL (Safe Threshold: < 1.0% LEL)',
    acknowledged: false,
    resolved: false,
    timeline: [
      {
        id: 'TL-10',
        timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
        event: 'Methane MQ-4 optical gas sensor passed critical ceiling 1.50% LEL',
        actor: 'ESP32 Gas Telemetry Engine'
      }
    ]
  },
  {
    id: 'INC-8894',
    workerId: 'WRK-103',
    workerName: 'Kwame Mensah',
    helmetId: 'HLM-ESP32-03',
    sector: 'Sector 1 - Extraction Face',
    type: 'HELMET_REMOVED',
    severity: 'WARNING',
    timestamp: new Date(now.getTime() - 14 * 60000).toISOString(),
    triggerValue: 'Capacitive/IR Proximity Switch Detached > 30s',
    currentValue: 'Helmet Detached',
    acknowledged: true,
    acknowledgedBy: 'Chief Supervisor Dave Miller',
    acknowledgedAt: new Date(now.getTime() - 10 * 60000).toISOString(),
    resolved: false,
    timeline: [
      {
        id: 'TL-20',
        timestamp: new Date(now.getTime() - 14 * 60000).toISOString(),
        event: 'IR forehead contact sensor broke contact',
        actor: 'HLM-ESP32-03 Microcontroller'
      },
      {
        id: 'TL-21',
        timestamp: new Date(now.getTime() - 10 * 60000).toISOString(),
        event: 'Alert acknowledged. Contacted shift lead on VHF radio channel 4.',
        actor: 'Dave Miller (Supervisor)'
      }
    ]
  },
  {
    id: 'INC-8891',
    workerId: 'WRK-102',
    workerName: 'Elena Rostova',
    helmetId: 'HLM-ESP32-02',
    sector: 'Sector 2 - Ventilation Shaft B',
    type: 'HAZARDOUS_GAS',
    severity: 'WARNING',
    timestamp: new Date(now.getTime() - 25 * 60000).toISOString(),
    triggerValue: 'CO Exceeded 25 ppm (Measured: 28 ppm)',
    currentValue: '28 ppm CO',
    acknowledged: true,
    acknowledgedBy: 'Dave Miller',
    acknowledgedAt: new Date(now.getTime() - 22 * 60000).toISOString(),
    resolved: false,
    timeline: [
      {
        id: 'TL-30',
        timestamp: new Date(now.getTime() - 25 * 60000).toISOString(),
        event: 'Electrochemical CO sensor crossed 25 ppm warning boundary',
        actor: 'HLM-ESP32-02'
      },
      {
        id: 'TL-31',
        timestamp: new Date(now.getTime() - 22 * 60000).toISOString(),
        event: 'Supervision acknowledged; fan auxiliary intake boosted',
        actor: 'Dave Miller'
      }
    ]
  },
  {
    id: 'INC-8882',
    workerId: 'WRK-109',
    workerName: 'Chloe Moreau',
    helmetId: 'HLM-ESP32-09',
    sector: 'Sector 4 - Blast Zone Alpha',
    type: 'DEVICE_DISCONNECTED',
    severity: 'WARNING',
    timestamp: new Date(now.getTime() - 58000).toISOString(),
    triggerValue: 'Heartbeat Timeout (> 25s elapsed, last RSSI: -93dBm)',
    currentValue: 'Heartbeat missing for 58s',
    acknowledged: false,
    resolved: false,
    timeline: [
      {
        id: 'TL-40',
        timestamp: new Date(now.getTime() - 58000).toISOString(),
        event: 'Mesh node dropped communication packet sequence',
        actor: 'Gateway Router'
      }
    ]
  },
  {
    id: 'INC-8870',
    workerId: 'WRK-104',
    workerName: 'Liam Gallagher',
    helmetId: 'HLM-ESP32-04',
    sector: 'Sector 3 - North Haulage Drift',
    type: 'ENVIRONMENTAL_WARNING',
    severity: 'WARNING',
    timestamp: new Date(now.getTime() - 75 * 60000).toISOString(),
    triggerValue: 'Thermal spike 33.2°C near auxiliary hauler exhaust',
    currentValue: 'Resolved - Normal 23.4°C',
    acknowledged: true,
    acknowledgedBy: 'Dave Miller',
    acknowledgedAt: new Date(now.getTime() - 70 * 60000).toISOString(),
    resolved: true,
    resolvedBy: 'Dave Miller',
    resolvedAt: new Date(now.getTime() - 45 * 60000).toISOString(),
    resolutionNotes: 'Hauler passed ventilation intake; ambient temperature returned below 25°C.',
    timeline: [
      {
        id: 'TL-50',
        timestamp: new Date(now.getTime() - 75 * 60000).toISOString(),
        event: 'SHT31 sensor recorded 33.2°C ambient spike',
        actor: 'HLM-ESP32-04'
      },
      {
        id: 'TL-51',
        timestamp: new Date(now.getTime() - 70 * 60000).toISOString(),
        event: 'Acknowledged by Control Room',
        actor: 'Dave Miller'
      },
      {
        id: 'TL-52',
        timestamp: new Date(now.getTime() - 45 * 60000).toISOString(),
        event: 'Incident marked resolved after 30 min of normalized thermal telemetry',
        actor: 'Dave Miller'
      }
    ]
  }
];

export const INITIAL_EVENTS: AuditEvent[] = [
  {
    id: 'EVT-01',
    timestamp: new Date(now.getTime() - 3 * 60000).toISOString(),
    category: 'SOS_TRIGGERED',
    severity: 'CRITICAL',
    workerId: 'WRK-101',
    workerName: 'Darius Stone',
    sector: 'Sector 4 - Blast Zone Alpha',
    message: 'Manual SOS emergency tactile button pressed on HLM-ESP32-01',
    isSimulated: true
  },
  {
    id: 'EVT-02',
    timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
    category: 'GAS_EXCEEDED',
    severity: 'CRITICAL',
    workerId: 'WRK-101',
    workerName: 'Darius Stone',
    sector: 'Sector 4 - Blast Zone Alpha',
    message: 'Methane CH4 concentration spiked to 1.82% LEL (> 1.50% critical)',
    isSimulated: true
  },
  {
    id: 'EVT-03',
    timestamp: new Date(now.getTime() - 14 * 60000).toISOString(),
    category: 'HELMET_REMOVED',
    severity: 'WARNING',
    workerId: 'WRK-103',
    workerName: 'Kwame Mensah',
    sector: 'Sector 1 - Extraction Face',
    message: 'Optical IR sensor detected helmet removal in active drilling zone',
    isSimulated: true
  },
  {
    id: 'EVT-04',
    timestamp: new Date(now.getTime() - 25 * 60000).toISOString(),
    category: 'GAS_EXCEEDED',
    severity: 'WARNING',
    workerId: 'WRK-102',
    workerName: 'Elena Rostova',
    sector: 'Sector 2 - Ventilation Shaft B',
    message: 'Carbon Monoxide reached 28 ppm (> 25 ppm warning)',
    isSimulated: true
  },
  {
    id: 'EVT-05',
    timestamp: new Date(now.getTime() - 45 * 60000).toISOString(),
    category: 'RESOLVED',
    severity: 'INFO',
    workerId: 'WRK-104',
    workerName: 'Liam Gallagher',
    sector: 'Sector 3 - North Haulage Drift',
    message: 'Thermal warning INC-8870 resolved by Supervisor Dave Miller',
    isSimulated: true
  },
  {
    id: 'EVT-06',
    timestamp: new Date(now.getTime() - 58000).toISOString(),
    category: 'DISCONNECTED',
    severity: 'WARNING',
    workerId: 'WRK-109',
    workerName: 'Chloe Moreau',
    sector: 'Sector 4 - Blast Zone Alpha',
    message: 'HLM-ESP32-09 packet heartbeat missing for over 25 seconds',
    isSimulated: true
  }
];

export const INITIAL_DEVICES: DeviceHealth[] = [
  {
    helmetId: 'HLM-ESP32-01',
    workerId: 'WRK-101',
    workerName: 'Darius Stone',
    sector: 'Sector 4 - Blast Zone Alpha',
    firmwareVersion: 'v2.4.1-esp32s3',
    status: 'ONLINE',
    batteryPct: 76,
    wifiRssi: -72,
    lastPacketTime: new Date(now.getTime() - 4000).toISOString(),
    packetLossRate: 1.2,
    sensorsHealth: { gasSensor: 'OK', tempHumidSensor: 'OK', irWearSensor: 'OK', sosSwitch: 'OK' }
  },
  {
    helmetId: 'HLM-ESP32-02',
    workerId: 'WRK-102',
    workerName: 'Elena Rostova',
    sector: 'Sector 2 - Ventilation Shaft B',
    firmwareVersion: 'v2.4.1-esp32s3',
    status: 'ONLINE',
    batteryPct: 91,
    wifiRssi: -64,
    lastPacketTime: new Date(now.getTime() - 8000).toISOString(),
    packetLossRate: 0.4,
    sensorsHealth: { gasSensor: 'OK', tempHumidSensor: 'OK', irWearSensor: 'OK', sosSwitch: 'OK' }
  },
  {
    helmetId: 'HLM-ESP32-03',
    workerId: 'WRK-103',
    workerName: 'Kwame Mensah',
    sector: 'Sector 1 - Extraction Face',
    firmwareVersion: 'v2.4.0-esp32s3',
    status: 'ONLINE',
    batteryPct: 84,
    wifiRssi: -68,
    lastPacketTime: new Date(now.getTime() - 11000).toISOString(),
    packetLossRate: 0.8,
    sensorsHealth: { gasSensor: 'OK', tempHumidSensor: 'OK', irWearSensor: 'OK', sosSwitch: 'OK' }
  },
  {
    helmetId: 'HLM-ESP32-04',
    workerId: 'WRK-104',
    workerName: 'Liam Gallagher',
    sector: 'Sector 3 - North Haulage Drift',
    firmwareVersion: 'v2.4.1-esp32s3',
    status: 'ONLINE',
    batteryPct: 88,
    wifiRssi: -58,
    lastPacketTime: new Date(now.getTime() - 5000).toISOString(),
    packetLossRate: 0.2,
    sensorsHealth: { gasSensor: 'OK', tempHumidSensor: 'OK', irWearSensor: 'OK', sosSwitch: 'OK' }
  },
  {
    helmetId: 'HLM-ESP32-05',
    workerId: 'WRK-105',
    workerName: 'Mateo Cruz',
    sector: 'Sector 1 - Extraction Face',
    firmwareVersion: 'v2.4.1-esp32s3',
    status: 'ONLINE',
    batteryPct: 79,
    wifiRssi: -70,
    lastPacketTime: new Date(now.getTime() - 7000).toISOString(),
    packetLossRate: 1.1,
    sensorsHealth: { gasSensor: 'OK', tempHumidSensor: 'OK', irWearSensor: 'OK', sosSwitch: 'OK' }
  },
  {
    helmetId: 'HLM-ESP32-06',
    workerId: 'WRK-106',
    workerName: 'Anya Petrov',
    sector: 'Sector 2 - Ventilation Shaft B',
    firmwareVersion: 'v2.4.1-esp32s3',
    status: 'ONLINE',
    batteryPct: 95,
    wifiRssi: -61,
    lastPacketTime: new Date(now.getTime() - 9000).toISOString(),
    packetLossRate: 0.1,
    sensorsHealth: { gasSensor: 'OK', tempHumidSensor: 'OK', irWearSensor: 'OK', sosSwitch: 'OK' }
  },
  {
    helmetId: 'HLM-ESP32-07',
    workerId: 'WRK-107',
    workerName: 'Tariq Al-Mansoor',
    sector: 'Sector 5 - Primary Crusher',
    firmwareVersion: 'v2.3.9-esp32s3',
    status: 'ONLINE',
    batteryPct: 71,
    wifiRssi: -66,
    lastPacketTime: new Date(now.getTime() - 14000).toISOString(),
    packetLossRate: 0.9,
    sensorsHealth: { gasSensor: 'OK', tempHumidSensor: 'OK', irWearSensor: 'OK', sosSwitch: 'OK' }
  },
  {
    helmetId: 'HLM-ESP32-08',
    workerId: 'WRK-108',
    workerName: 'Hiroshi Tanaka',
    sector: 'Sector 3 - North Haulage Drift',
    firmwareVersion: 'v2.4.1-esp32s3',
    status: 'ONLINE',
    batteryPct: 86,
    wifiRssi: -55,
    lastPacketTime: new Date(now.getTime() - 3000).toISOString(),
    packetLossRate: 0.3,
    sensorsHealth: { gasSensor: 'OK', tempHumidSensor: 'OK', irWearSensor: 'OK', sosSwitch: 'OK' }
  },
  {
    helmetId: 'HLM-ESP32-09',
    workerId: 'WRK-109',
    workerName: 'Chloe Moreau',
    sector: 'Sector 4 - Blast Zone Alpha',
    firmwareVersion: 'v2.4.0-esp32s3',
    status: 'STALE',
    batteryPct: 41,
    wifiRssi: -93,
    lastPacketTime: new Date(now.getTime() - 58000).toISOString(),
    packetLossRate: 18.4,
    sensorsHealth: { gasSensor: 'DEGRADED', tempHumidSensor: 'OK', irWearSensor: 'OK', sosSwitch: 'OK' }
  },
  {
    helmetId: 'HLM-ESP32-10',
    workerId: 'WRK-110',
    workerName: 'Viktor Lindqvist',
    sector: 'Sector 5 - Primary Crusher',
    firmwareVersion: 'v2.3.8-esp32s3',
    status: 'OFFLINE',
    batteryPct: 12,
    wifiRssi: 0,
    lastPacketTime: new Date(now.getTime() - 920000).toISOString(),
    packetLossRate: 100.0,
    sensorsHealth: { gasSensor: 'ERROR', tempHumidSensor: 'ERROR', irWearSensor: 'ERROR', sosSwitch: 'ERROR' }
  }
];

// Generate deterministic historical telemetry for charts
export function generateHistoricalTelemetry(pointsCount = 30) {
  const points = [];
  const baseTime = Date.now() - pointsCount * 60 * 1000;
  
  for (let i = 0; i < pointsCount; i++) {
    const t = new Date(baseTime + i * 60 * 1000);
    // Gas spike simulated towards the end (last 8 minutes)
    const isSpike = i >= pointsCount - 8;
    const ch4 = isSpike ? +(1.1 + Math.sin(i * 0.5) * 0.5 + 0.3).toFixed(2) : +(0.15 + Math.sin(i * 0.3) * 0.08).toFixed(2);
    const co = isSpike ? Math.round(22 + Math.cos(i * 0.4) * 16) : Math.round(5 + Math.sin(i * 0.2) * 3);
    const temp = +(24.5 + Math.sin(i * 0.1) * 2.2 + (isSpike ? 6.5 : 0)).toFixed(1);
    const humidity = Math.round(65 + Math.cos(i * 0.15) * 8);

    points.push({
      timestamp: t.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      isoTime: t.toISOString(),
      ch4: Math.max(0.01, ch4),
      co: Math.max(1, co),
      temperature: temp,
      humidity: humidity,
      thresholdCh4Warning: 1.0,
      thresholdCh4Critical: 1.5,
      thresholdCoWarning: 25,
      thresholdCoCritical: 50
    });
  }
  return points;
}

// Generate worker specific historical points
export function generateWorkerHistory(worker: Worker, count = 20) {
  const points = [];
  const baseTime = Date.now() - count * 60 * 1000;
  
  for (let i = 0; i < count; i++) {
    const t = new Date(baseTime + i * 60 * 1000);
    const factor = i / count;
    // interpolate towards current reading
    const ch4 = +(worker.telemetry.ch4 * (0.4 + factor * 0.6) + (Math.random() * 0.05 - 0.025)).toFixed(2);
    const co = Math.round(worker.telemetry.co * (0.5 + factor * 0.5));
    const temp = +(worker.telemetry.temperature - (1 - factor) * 1.5).toFixed(1);
    const hum = Math.round(worker.telemetry.humidity + (1 - factor) * 4);

    points.push({
      time: t.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      ch4: Math.max(0, ch4),
      co: Math.max(0, co),
      temp: temp > 0 ? temp : 24.0,
      humidity: hum > 0 ? hum : 60
    });
  }
  return points;
}
