/**
 * GET /api/world-model — causal chain, RUL, failure probability
 * GET /api/world-model/causal-chain — step-by-step physics reasoning
 */
import { Router } from 'express';
import { WORLD_MODEL, DEMO_PHASES } from '../data/storyData.js';

const router = Router();
let _currentPhaseIndex = 0;
export function setPhaseIndex(idx) { _currentPhaseIndex = idx; }

// Scale RUL and failure probability based on current phase
const PHASE_WORLD_MODEL = [
  { rul_hours: null, failure_probability_pct: 0,  active: false, message: 'Machine operating normally. No prediction required.' },
  { rul_hours: null, failure_probability_pct: 3,  active: false, message: 'Early degradation logged. Insufficient data for RUL estimate.' },
  { rul_hours: 320,  failure_probability_pct: 8,  active: true,  message: 'Bearing wear detected. World Model activated. RUL estimate: 320 hours.' },
  { rul_hours: 86,   failure_probability_pct: 23, active: true,  message: 'Causal chain confirmed. RUL: 86 hours. Failure probability: 23%.' },
  { rul_hours: 22,   failure_probability_pct: 71, active: true,  message: 'Critical degradation. RUL: 22 hours. Immediate action required.' },
  { rul_hours: 170,  failure_probability_pct: 8,  active: true,  message: 'RPM reduction applied. RUL extended to 170 hours. Recovery in progress.' },
];

// GET /api/world-model
router.get('/', (req, res) => {
  const phaseWm = PHASE_WORLD_MODEL[_currentPhaseIndex];
  res.json({
    machine_id: 'CNC-01',
    phase: DEMO_PHASES[_currentPhaseIndex].phase,
    active: phaseWm.active,
    message: phaseWm.message,
    rul_hours: phaseWm.rul_hours,
    failure_probability_pct: phaseWm.failure_probability_pct,
    world_model_accuracy_pct: WORLD_MODEL.world_model_accuracy_pct,
    physics_reasoning: WORLD_MODEL.physics_reasoning,
  });
});

// GET /api/world-model/causal-chain
router.get('/causal-chain', (req, res) => {
  const phase = _currentPhaseIndex;
  // Reveal chain nodes progressively based on phase
  const visibleNodes = Math.min(phase + 1, WORLD_MODEL.causal_chain.length);
  res.json({
    machine_id: 'CNC-01',
    causal_chain: WORLD_MODEL.causal_chain.slice(0, visibleNodes),
    chain_complete: visibleNodes === WORLD_MODEL.causal_chain.length,
    phase: DEMO_PHASES[_currentPhaseIndex].phase,
  });
});

export default router;
