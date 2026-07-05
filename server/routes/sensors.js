/**
 * GET /api/sensors — current sensor readings for active phase
 * GET /api/sensors/history — all phases as time-series
 * GET /api/sensors/thresholds — sensor threshold definitions
 */
import { Router } from 'express';
import {
  DEMO_PHASES, THRESHOLDS, SENSOR_HISTORY,
} from '../data/storyData.js';

const router = Router();

// Server-side phase state (shared — we re-export a setter)
let _currentPhaseIndex = 0;
export function setPhaseIndex(idx) { _currentPhaseIndex = idx; }

// Helper: classify a sensor reading against thresholds
function classify(key, value) {
  const t = THRESHOLDS[key];
  if (!t) return 'ok';
  const isHealthStyle = key === 'bearing_health' || key === 'lubrication' || key === 'rpm';
  if (isHealthStyle) {
    if (value < t.critical) return 'critical';
    if (value < t.warning[0]) return 'warning';
    return 'ok';
  }
  if (value > t.critical) return 'critical';
  if (value > t.warning[0]) return 'warning';
  return 'ok';
}

// GET /api/sensors — live readings from current phase
router.get('/', (req, res) => {
  const phase = DEMO_PHASES[_currentPhaseIndex];
  const readings = Object.entries(phase.sensors).map(([key, value]) => ({
    sensor: key,
    value,
    unit: THRESHOLDS[key]?.unit ?? '',
    status: classify(key, value),
    threshold_warning: THRESHOLDS[key]?.warning ?? null,
    threshold_critical: THRESHOLDS[key]?.critical ?? null,
  }));
  res.json({
    machine_id: 'CNC-01',
    phase: phase.phase,
    timestamp: phase.timestamp,
    readings,
  });
});

// GET /api/sensors/history — all 6 phase snapshots as time-series
router.get('/history', (req, res) => {
  res.json({
    machine_id: 'CNC-01',
    series: SENSOR_HISTORY,
    sensor_keys: Object.keys(DEMO_PHASES[0].sensors),
  });
});

// GET /api/sensors/thresholds — threshold reference
router.get('/thresholds', (req, res) => {
  res.json({ thresholds: THRESHOLDS });
});

export default router;
