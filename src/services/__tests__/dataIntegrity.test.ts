declare const process: any;

import { computeFleetMetrics, assertDataIntegrity } from '../../utils/metrics';
import { INITIAL_WORKERS, INITIAL_INCIDENTS } from '../mockData';
import { Worker, Incident } from '../../types';

export function runDataIntegrityTests() {
  console.log('--- Running RescueSentry Data Integrity Test Suite ---');
  
  // Test 1: Baseline mock dataset integrity
  const baselineMetrics = computeFleetMetrics(INITIAL_WORKERS, INITIAL_INCIDENTS);
  const baselineCheck = assertDataIntegrity(baselineMetrics, INITIAL_WORKERS, INITIAL_INCIDENTS);
  
  if (!baselineCheck.valid) {
    throw new Error(`Baseline Data Integrity Failed: ${baselineCheck.errors.join(', ')}`);
  }
  console.log('✓ Test 1 Passed: Baseline mock data passes all mathematical invariants');

  // Test 2: Invariant Check — Active incidents must equal unacknowledged + acknowledged
  if (baselineMetrics.activeIncidentsCount !== baselineMetrics.unacknowledgedIncidentsCount + baselineMetrics.acknowledgedActiveCount) {
    throw new Error('Test 2 Failed: Active incidents count does not match unack + ack sum');
  }
  console.log('✓ Test 2 Passed: Active incidents invariant verified');

  // Test 3: Invariant Check — Online helmets must equal worn + removed
  if (baselineMetrics.onlineHelmetsCount !== baselineMetrics.wornHelmetsCount + baselineMetrics.removedHelmetsCount) {
    throw new Error('Test 3 Failed: Online helmets count does not match worn + removed sum');
  }
  console.log('✓ Test 3 Passed: Helmet wear breakdown invariant verified');

  // Test 4: Dynamic simulated state test
  const modifiedWorkers: Worker[] = JSON.parse(JSON.stringify(INITIAL_WORKERS));
  const modifiedIncidents: Incident[] = JSON.parse(JSON.stringify(INITIAL_INCIDENTS));
  
  // Add a 2nd SOS worker and incident
  modifiedWorkers[1].telemetry.sosPressed = true;
  modifiedWorkers[1].safetyState = 'CRITICAL';
  modifiedIncidents.push({
    id: 'INC-TEST-99',
    workerId: modifiedWorkers[1].id,
    workerName: modifiedWorkers[1].name,
    helmetId: modifiedWorkers[1].helmetId,
    sector: modifiedWorkers[1].sector,
    type: 'SOS_EMERGENCY',
    severity: 'CRITICAL',
    timestamp: new Date().toISOString(),
    triggerValue: 'Test SOS Pushbutton',
    acknowledged: false,
    resolved: false,
    timeline: []
  });

  const dynamicMetrics = computeFleetMetrics(modifiedWorkers, modifiedIncidents);
  const dynamicCheck = assertDataIntegrity(dynamicMetrics, modifiedWorkers, modifiedIncidents);

  if (!dynamicCheck.valid) {
    throw new Error(`Dynamic Data Integrity Failed: ${dynamicCheck.errors.join(', ')}`);
  }
  if (dynamicMetrics.criticalSosIncidentsCount !== 2 || dynamicMetrics.criticalWorkersCount !== 2) {
    throw new Error(`SOS Count Mismatch: expected 2 SOS workers, got ${dynamicMetrics.criticalWorkersCount}`);
  }
  console.log('✓ Test 4 Passed: 2 SOS workers correctly derived as 2 in banner and critical KPI count');

  console.log('All Data Integrity Tests Passed Successfully!');
  return true;
}

// Auto-run if executed directly in node
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' && typeof window === 'undefined') {
  try {
    runDataIntegrityTests();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
