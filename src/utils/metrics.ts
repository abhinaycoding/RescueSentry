import { Worker, Incident, FleetMetrics } from '../types';

/**
 * Single source of truth calculation for all fleet and safety metrics.
 * Ensures that banner text, KPI cards, sidebar badges, table counters,
 * and incident panel headers can NEVER contradict each other.
 */
export function computeFleetMetrics(workers: Worker[], incidents: Incident[]): FleetMetrics {
  const totalWorkers = workers.length;

  // Active critical workers (workers currently transmitting an active SOS or in critical hazard)
  const criticalWorkersCount = workers.filter(w => 
    w.telemetry.sosPressed || w.safetyState === 'CRITICAL'
  ).length;

  // Warning workers (workers with elevated gas / removed helmet / thermal warning, but NOT in SOS)
  const warningWorkersCount = workers.filter(w => 
    !w.telemetry.sosPressed && w.safetyState === 'WARNING'
  ).length;

  const normalWorkersCount = workers.filter(w => w.safetyState === 'NORMAL').length;
  const offlineWorkersCount = workers.filter(w => w.connectionStatus === 'OFFLINE').length;
  const staleWorkersCount = workers.filter(w => w.connectionStatus === 'STALE').length;
  const totalOfflineOrStale = offlineWorkersCount + staleWorkersCount;

  const onlineHelmetsCount = workers.filter(w => w.connectionStatus === 'ONLINE').length;
  const wornHelmetsCount = workers.filter(w => w.connectionStatus === 'ONLINE' && w.helmetWorn).length;
  const removedHelmetsCount = workers.filter(w => w.connectionStatus === 'ONLINE' && !w.helmetWorn).length;

  // Incidents: Active = all unresolved (acknowledged + unacknowledged)
  const activeIncidents = incidents.filter(i => !i.resolved);
  const activeIncidentsCount = activeIncidents.length;
  const unacknowledgedIncidentsCount = activeIncidents.filter(i => !i.acknowledged).length;
  const acknowledgedActiveCount = activeIncidents.filter(i => i.acknowledged).length;
  const resolvedIncidentsCount = incidents.filter(i => i.resolved).length;
  const criticalSosIncidentsCount = activeIncidents.filter(i => i.type === 'SOS_EMERGENCY').length;

  return {
    totalWorkers,
    criticalWorkersCount,
    warningWorkersCount,
    normalWorkersCount,
    offlineWorkersCount,
    staleWorkersCount,
    totalOfflineOrStale,
    onlineHelmetsCount,
    wornHelmetsCount,
    removedHelmetsCount,
    activeIncidentsCount,
    unacknowledgedIncidentsCount,
    acknowledgedActiveCount,
    resolvedIncidentsCount,
    criticalSosIncidentsCount
  };
}

/**
 * Dev-mode assertion helper.
 * Validates that all counts strictly satisfy mathematical invariants.
 */
export function assertDataIntegrity(
  metrics: FleetMetrics, 
  workers: Worker[], 
  incidents: Incident[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Invariant 1: Total workers
  if (metrics.totalWorkers !== workers.length) {
    errors.push(`Total workers mismatch: metrics has ${metrics.totalWorkers}, workers array has ${workers.length}`);
  }

  // Invariant 2: Active incidents breakdown
  if (metrics.activeIncidentsCount !== metrics.unacknowledgedIncidentsCount + metrics.acknowledgedActiveCount) {
    errors.push(`Active incidents (${metrics.activeIncidentsCount}) does not equal unacknowledged (${metrics.unacknowledgedIncidentsCount}) + acknowledged (${metrics.acknowledgedActiveCount})`);
  }

  // Invariant 3: Online helmets wear breakdown
  if (metrics.onlineHelmetsCount !== metrics.wornHelmetsCount + metrics.removedHelmetsCount) {
    errors.push(`Online helmets (${metrics.onlineHelmetsCount}) does not equal worn (${metrics.wornHelmetsCount}) + removed (${metrics.removedHelmetsCount})`);
  }

  // Invariant 4: Offline + stale
  if (metrics.totalOfflineOrStale !== metrics.offlineWorkersCount + metrics.staleWorkersCount) {
    errors.push(`Offline/stale count mismatch`);
  }

  // Invariant 5: Worker SOS state alignment with SOS incidents
  const workersWithSos = workers.filter(w => w.telemetry.sosPressed).length;
  if (metrics.criticalSosIncidentsCount > 0 && workersWithSos === 0) {
    errors.push(`Warning: ${metrics.criticalSosIncidentsCount} active SOS incident(s) exist, but 0 workers have sosPressed=true in telemetry`);
  }

  if (errors.length > 0 && typeof console !== 'undefined') {
    console.warn('[RescueSentry Data Integrity Warning]:', errors);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Web Audio API synthesized industrial alarm tone.
 * Generates an authentic alternating double-pulse emergency annunciator.
 */
let audioCtx: AudioContext | null = null;

export function playEmergencyAlarm() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    
    // Pulse 1: 880 Hz (A5)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.18);

    // Pulse 2: 660 Hz (E5)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(660, now + 0.22);
    gain2.gain.setValueAtTime(0.18, now + 0.22);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.22);
    osc2.stop(now + 0.42);
  } catch (e) {
    // Audio context may require prior user interaction
  }
}
