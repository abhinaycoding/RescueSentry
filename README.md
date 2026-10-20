# RescueSentry Enterprise — Underground Mine Safety & Telemetry Control

> **Industrial IoT Smart Safety Helmet Monitoring & Incident Management Platform**  
> Engineered for mission-critical underground mining operations using ESP32 edge microcontrollers, multi-gas sensors (MQ-4 Methane CH4, MQ-7 Carbon Monoxide CO), thermal/humidity probes (SHT31/DHT22), forehead optical helmet-wear proximity detection, and tactile emergency SOS distress switches.

---

## 1. System Overview & Tactile Claymorphism Design

**RescueSentry Enterprise** is a mission-critical operations dashboard engineered specifically for underground mine control room supervisors and safety engineers. The interface incorporates a modern, tactile **Claymorphism** design system with a warm sand / terracotta palette:

- **Tactile Clay Surfaces**:
  - Soft dual-light drop shadows (`.clay-raised`, `.clay-inset`, `.clay-modal`, `.clay-drawer`).
  - Warm sand and clay tokens (`--bg: #EFE7DC`, `--clay: #FBF7F2`, `--clay-well: #F6F0E8`).
  - Tactile action buttons (`.clay-btn-amber`, `.clay-btn-cream`, `.clay-btn-green`, `.clay-btn-red`).
  - 38px touch targets tailored for control room operators.
- **Harmonious Safety Status Tokens**:
  - Critical SOS / Breach: `#D13A3F` / `#B52A31` (`.clay-critical`)
  - Warning Threshold: `#F5A524` / `#8A5500` (`.clay-warning`)
  - Safe / Normal: `#2E9E63` / `#1E6B42` (`.clay-ok`)
  - Info / Secondary: `#3B4F8A`
- **Typography**: Dual-font hierarchy pairing `Nunito` for soft, highly readable labels with `IBM Plex Mono` for high-precision tabular numerals.

---

## 2. Core Functional Modules

### 1. Operations Overview (Command Center)
- **Mine Site Complex Selector**: Multi-site support (`Deep Ridge Mine`, `Apex Copper Deep Drift`, `Vanguard Coal Basin`), wireless LoRa/Wi-Fi mesh bridge status, and live telemetry timestamps.
- **Tiered KPI Section**: Tier 1 (Critical & Unacknowledged Alarms) + Tier 2 (Warnings & Offline Nodes) + Tier 3 (Inline Fleet Telemetry Strip).
- **Dual-State SOS Command Bar**: Slim, reassuring all-clear state vs. prominent critical SOS emergency banner with one-click dispatch and radio calling.
- **Atmospheric Gas & Environmental Telemetry**: Small-multiples time-series charts (Recharts) with threshold marker lines for CH4 warning (`1.0% LEL`) and critical (`1.5% LEL`), CO warning (`25 ppm`) and critical (`50 ppm`), switchable to ambient temperature & relative humidity.
- **Priority Operations Incident Panel**: High-priority safety queue highlighting critical alarms with keyboard navigation shortcuts (`J`/`K` navigation, `A` acknowledge, `R` resolve).
- **Worker Safety Fleet Table**: Dense, sortable table with live gas progress meters, helmet-wear badge, connection status, and click-to-inspect trigger.

### 2. Worker Monitoring & Helmet Provisioning
- **Interactive Helmet Provisioning Modal (`+ Add Miner`)**:
  - Register new underground personnel and pair them to physical ESP32 Smart Helmet hardware IDs.
  - Configure roles (Drill Rig Operator, Blasting Lead, Ventilation Specialist, Haulage Driver, Electrician, Safety Officer), sectors, shifts, blood groups, and emergency contacts.
  - Automatically initializes telemetry heartbeats and registers the node in the hardware diagnostics inventory.
- **Dual View Modes**: High-density operational table vs. tactile visual card grid.
- **Multi-Factor Filtering & Search**: Instant filter by sector, safety state (`CRITICAL`, `WARNING`, `NORMAL`, `STALE`, `OFFLINE`), connection status, and optical helmet-wear status.
- **Worker Profile Drawer**:
  - Complete miner identity, shift lead, emergency VHF radio channel, blood group.
  - Optical wear proximity sensor status (`WORN` vs. `REMOVED`).
  - Inset gas gauges with threshold boundary markers.
  - 15-minute historical gas telemetry mini-chart for that specific worker.
  - Associated violation and incident history.

### 3. Incident Management & Safety Audit Compliance
- **Prioritized Safety Queue**: Categorized into SOS Emergency, Hazardous Gas, Helmet Removal, Thermal Hazard, and Device Disconnect.
- **Acknowledge Workflow**: One-click supervisor acknowledgement logging supervisor identity and audit timestamp without prematurely closing the incident.
- **Formal Resolution Workflow**: Mandatory modal requiring corrective action notes (e.g. ventilation booster adjustment, secondary gas verification) before marking resolved.
- **CSV Audit Export**: Generates exportable incident records conforming to mining safety compliance logs.

### 4. Environmental Analytics
- **Atmospheric Time-Series**: Full multi-range historical analysis (`15m`, `1h`, `4h`, `24h`) with tactile pill toggles.
- **Sector Gas Risk Comparison**: Comparative bar chart identifying underground zones with peak gas exposure.
- **Incident Category Distribution**: Donut breakdown of incident types with interactive tooltips.
- **Historical Safety Events Log**: Complete historical event log with simulated/live source tagging.

### 5. System Health & ESP32 Diagnostics
- **Helmet Hardware Inventory**: ESP32-S3 firmware versions, Wi-Fi/mesh RSSI (dBm), battery voltage %, and packet loss rates.
- **Sensor Self-Tests**: Live subcomponent diagnostics for MQ-4 gas sensors (`GAS:OK`), optical IR wear switches (`IR:OK`), and tactile SOS buttons (`SOS:OK`).
- **Configurable Stale Heartbeat**: Customizable timeout (e.g. 25 seconds) automatically transitioning non-transmitting helmets to `STALE` and `OFFLINE`.

### 6. Control Room Settings & API Hub
- **Safety Threshold Calibration**: Adjust CH4, CO, Temperature, and Humidity warning/critical alarm levels.
- **Flask API Integration Hub**: Documentation and schema preview for all REST endpoints with live toggle between Demo Mode and Live API Mode.
- **Alarm Annunciator Preferences**: Enable or mute control room acoustic alerts for SOS emergencies.

---

## 3. Physical Device Connection & Python Backend Integration

RescueSentry supports two operational modes:

### A. Demo Mode (Deterministic Simulation)
- Deterministic underground mining scenario with 10 pre-configured miners and helmets.
- Continuous 4-second telemetry heartbeat simulation.
- Simulation control triggers directly in the UI:
  - **Gas Spike**: Injects a 1.68% LEL Methane surge.
  - **Detach Helmet**: Simulates an operator removing their helmet in an active drilling zone.
  - **Trigger SOS**: Simulates emergency pushbutton activation.
  - **Normalize**: Clears alarms and reconnects all devices.

### B. Live Flask API Mode

To connect your physical ESP32 smart helmets to RescueSentry:

1. **Configure Environment Variable**:
   Create a `.env` file in the project root:
   ```bash
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

2. **Run Python/Flask Bridge (`app.py`)**:
   ```python
   from flask import Flask, jsonify, request
   from flask_cors import CORS
   from datetime import datetime

   app = Flask(__name__)
   CORS(app)

   WORKERS = []

   @app.route('/api/workers', methods=['GET', 'POST'])
   def manage_workers():
       if request.method == 'POST':
           new_worker = request.json
           WORKERS.append(new_worker)
           return jsonify({"success": True, "worker": new_worker}), 201
       return jsonify(WORKERS)

   @app.route('/api/telemetry/packet', methods=['POST'])
   def receive_esp32_packet():
       data = request.json
       helmet_id = data.get("helmetId")
       for w in WORKERS:
           if w["helmetId"] == helmet_id:
               w["telemetry"]["ch4"] = data.get("ch4", w["telemetry"]["ch4"])
               w["telemetry"]["co"] = data.get("co", w["telemetry"]["co"])
               w["telemetry"]["temperature"] = data.get("temp", w["telemetry"]["temperature"])
               w["telemetry"]["humidity"] = data.get("hum", w["telemetry"]["humidity"])
               w["telemetry"]["helmetWorn"] = data.get("worn", True)
               w["telemetry"]["sosPressed"] = data.get("sos", False)
               w["telemetry"]["batteryPct"] = data.get("batteryPct", 100)
               w["lastSeen"] = datetime.utcnow().isoformat()
               w["connectionStatus"] = "ONLINE"
               if w["telemetry"]["sosPressed"] or w["telemetry"]["ch4"] > 1.5:
                   w["safetyState"] = "CRITICAL"
               elif w["telemetry"]["ch4"] > 1.0 or not w["telemetry"]["helmetWorn"]:
                   w["safetyState"] = "WARNING"
               else:
                   w["safetyState"] = "NORMAL"
       return jsonify({"status": "acknowledged"})

   if __name__ == '__main__':
       app.run(host='0.0.0.0', port=5000, debug=True)
   ```

3. **ESP32 JSON Broadcast Format**:
   ```json
   {
     "helmetId": "HLM-ESP32-01",
     "ch4": 0.18,
     "co": 12,
     "temp": 26.4,
     "hum": 68.0,
     "worn": true,
     "sos": false,
     "batteryPct": 88,
     "rssi": -65
   }
   ```

#### Documented API Endpoints

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/workers` | `GET`, `POST` | List registered miners and register new miner profiles |
| `/api/telemetry/latest` | `GET` | Fetch latest mesh gateway broadcast |
| `/api/telemetry/history` | `GET` | Historical time-series by range (`?range=1h`) |
| `/api/incidents` | `GET` | Active safety violations and SOS calls |
| `/api/incidents/:id/acknowledge`| `POST`| Acknowledge incident by supervisor |
| `/api/incidents/:id/resolve` | `POST` | Resolve incident with mandatory corrective notes |
| `/api/health/devices` | `GET` | ESP32 hardware diagnostics and sensor self-tests |

---

## 4. Getting Started

### Prerequisites
- **Node.js**: `v18+`, `v20+`, or `v22+`
- **npm**: `v9+` or `v10+`

### Installation & Local Execution

```bash
# 1. Clone the repository
git clone https://github.com/abhinaycoding/RescueSentry.git
cd RescueSentry

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Build production bundle
npm run build

# 5. Preview production build locally
npm run preview
```

Open `http://localhost:5173/` in your browser.

---

## 5. Technology Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Tactile Claymorphism Design System
- **Data Visualization**: Recharts (Custom small-multiples telemetry charts, bar charts, and category donut)
- **Icons**: Lucide React
- **Typography**: Google Fonts (`Nunito` & `IBM Plex Mono`)
