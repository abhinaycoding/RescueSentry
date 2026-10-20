/**
 * RescueSentry Enterprise — Backend API Contracts & Integration Guide
 * 
 * Proposed integration endpoints for Python/Flask or FastAPI backend.
 * Default Base URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
 */

export interface ApiContractDoc {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  summary: string;
  requestBody?: string;
  responseBody: string;
  description: string;
}

export const API_CONTRACTS: ApiContractDoc[] = [
  {
    endpoint: '/api/workers',
    method: 'GET',
    summary: 'List Registered Mine Workers & Real-time Status',
    description: 'Retrieves all registered miners, their assigned ESP32 helmet ID, safety classification, and latest telemetry packet.',
    responseBody: `[
  {
    "id": "WRK-101",
    "name": "Darius Stone",
    "role": "Blasting Lead",
    "sector": "Sector 4 - Blast Zone Alpha",
    "helmetId": "HLM-ESP32-01",
    "helmetWorn": true,
    "connectionStatus": "ONLINE",
    "safetyState": "CRITICAL",
    "lastSeen": "2026-10-20T10:45:00.000Z",
    "telemetry": {
      "timestamp": "2026-10-20T10:45:00.000Z",
      "ch4": 1.82,
      "co": 42,
      "temperature": 34.6,
      "humidity": 78,
      "helmetWorn": true,
      "sosPressed": true,
      "batteryPct": 76,
      "rssi": -72
    }
  }
]`
  },
  {
    endpoint: '/api/telemetry/latest',
    method: 'GET',
    summary: 'Fetch Latest Sensor Telemetry Packets',
    description: 'Polls or streams the most recent ESP32 sensor broadcasts from all mesh gateway nodes.',
    responseBody: `{
  "timestamp": "2026-10-20T10:45:00.000Z",
  "gatewayId": "GW-MESH-01",
  "activeNodes": 8,
  "readings": [
    { "helmetId": "HLM-ESP32-01", "ch4": 1.82, "co": 42, "temp": 34.6, "hum": 78, "worn": true, "sos": true }
  ]
}`
  },
  {
    endpoint: '/api/telemetry/history',
    method: 'GET',
    summary: 'Historical Environmental Telemetry Time-Series',
    description: 'Queries aggregated gas and environmental telemetry by time range (e.g. ?range=1h&sector=Sector%204).',
    responseBody: `[
  {
    "timestamp": "10:40",
    "ch4": 0.25,
    "co": 8,
    "temperature": 24.2,
    "humidity": 65
  }
]`
  },
  {
    endpoint: '/api/incidents',
    method: 'GET',
    summary: 'Fetch Open & Historical Safety Incidents',
    description: 'Returns incidents flagged by thresholds or manual SOS triggers.',
    responseBody: `[
  {
    "id": "INC-8901",
    "workerId": "WRK-101",
    "type": "SOS_EMERGENCY",
    "severity": "CRITICAL",
    "timestamp": "2026-10-20T10:42:00.000Z",
    "triggerValue": "Manual Emergency Tactile Switch Pressed",
    "acknowledged": false,
    "resolved": false
  }
]`
  },
  {
    endpoint: '/api/incidents/:id/acknowledge',
    method: 'POST',
    summary: 'Acknowledge an Incident by Supervisor',
    description: 'Marks the incident as acknowledged by the logged supervisor without resolving it.',
    requestBody: `{
  "acknowledgedBy": "Dave Miller",
  "notes": "Contacting team lead via radio."
}`,
    responseBody: `{
  "success": true,
  "incidentId": "INC-8901",
  "acknowledgedAt": "2026-10-20T10:45:12.000Z"
}`
  },
  {
    endpoint: '/api/incidents/:id/resolve',
    method: 'POST',
    summary: 'Resolve Incident with Mandatory Corrective Notes',
    description: 'Transitions incident to resolved state and appends resolution audit entry.',
    requestBody: `{
  "resolvedBy": "Dave Miller",
  "resolutionNotes": "Auxiliary ventilation boosted; worker evacuated to fresh air base."
}`,
    responseBody: `{
  "success": true,
  "incidentId": "INC-8901",
  "resolvedAt": "2026-10-20T10:48:30.000Z"
}`
  },
  {
    endpoint: '/api/health/devices',
    method: 'GET',
    summary: 'ESP32 Helmet Hardware Diagnostics',
    description: 'Diagnostics for battery %, packet loss, Wi-Fi/mesh RSSI, and sensor subcomponent status (MQ-4, IR wear sensor, SHT31).',
    responseBody: `[
  {
    "helmetId": "HLM-ESP32-01",
    "firmwareVersion": "v2.4.1-esp32s3",
    "status": "ONLINE",
    "batteryPct": 76,
    "wifiRssi": -72,
    "packetLossRate": 1.2,
    "sensorsHealth": { "gasSensor": "OK", "tempHumidSensor": "OK", "irWearSensor": "OK", "sosSwitch": "OK" }
  }
]`
  }
];
