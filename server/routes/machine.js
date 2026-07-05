/**
 * GET /api/machine
 * Returns machine identity, current phase state, and dashboard cards
 */
import { Router } from 'express';
import {
  MACHINE, DEMO_PHASES, DASHBOARD_CARDS, TIMELINE, MACHINE_MEMORY,
} from '../data/storyData.js';

const router = Router();

// Current active phase (kept in sync by server/index.js via setPhaseIndex)
let currentPhaseIndex = 4; // Start at critical (phase 5) for max impact on load

// Called by server/index.js whenever the global phase changes
export function setPhaseIndex(idx) {
  currentPhaseIndex = idx;
}

// GET /api/machine — machine identity + current snapshot
router.get('/', (req, res) => {
  const phase = DEMO_PHASES[currentPhaseIndex];
  res.json({
    machine: MACHINE,
    current_phase: phase.phase,
    status: phase.status,
    health_score: phase.health_score,
    timestamp: phase.timestamp,
    narrative: phase.narrative,
    ai_decision: phase.ai_decision,
    dashboard: DASHBOARD_CARDS,
  });
});

// GET /api/machine/timeline — full shift timeline
router.get('/timeline', (req, res) => {
  res.json({ timeline: TIMELINE });
});

// GET /api/machine/memory — machine memory engine data
router.get('/memory', (req, res) => {
  res.json({ memory: MACHINE_MEMORY });
});

// POST /api/machine/phase — advance to a specific demo phase (1–6)
router.post('/phase', (req, res) => {
  const { phase } = req.body;
  const idx = parseInt(phase, 10) - 1;
  if (isNaN(idx) || idx < 0 || idx >= DEMO_PHASES.length) {
    return res.status(400).json({ error: `phase must be 1–${DEMO_PHASES.length}` });
  }
  currentPhaseIndex = idx;
  const p = DEMO_PHASES[currentPhaseIndex];
  res.json({
    message: `Phase set to ${p.phase}: ${p.label}`,
    phase: p.phase,
    label: p.label,
    status: p.status,
    health_score: p.health_score,
  });
});

// GET /api/machine/phases — all phase definitions (for frontend to list)
router.get('/phases', (req, res) => {
  res.json({
    phases: DEMO_PHASES.map(p => ({
      phase: p.phase,
      label: p.label,
      timestamp: p.timestamp,
      status: p.status,
      health_score: p.health_score,
      ai_decision: p.ai_decision,
    })),
    current: DEMO_PHASES[currentPhaseIndex].phase,
  });
});

export default router;
