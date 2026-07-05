/**
 * GET  /api/decisions — ranked engineering action options
 * POST /api/decisions/approve — approve an action (mock execution)
 * GET  /api/decisions/history — past approved actions
 */
import { Router } from 'express';
import { DECISIONS, DEMO_PHASES } from '../data/storyData.js';

const router = Router();
let _currentPhaseIndex = 0;
export function setPhaseIndex(idx) { _currentPhaseIndex = idx; }

// In-memory action log (simulates database)
const actionLog = [];

// GET /api/decisions — available actions for current phase
router.get('/', (req, res) => {
  const phase = DEMO_PHASES[_currentPhaseIndex];
  // Only surface decisions when phase >= 5 (critical) — that's when Decision Intelligence fires
  const active = _currentPhaseIndex >= 4;
  res.json({
    machine_id: 'CNC-01',
    phase: phase.phase,
    decisions_active: active,
    evaluated_count: active ? DECISIONS.length : 0,
    recommendation_latency_ms: 58,
    decisions: active ? DECISIONS : [],
    recommended_action: active ? DECISIONS.find(d => d.recommended) : null,
  });
});

// POST /api/decisions/approve
router.post('/approve', (req, res) => {
  const { action_rank, approved_by } = req.body;
  const rank = parseInt(action_rank, 10);
  const decision = DECISIONS.find(d => d.rank === rank);
  if (!decision) {
    return res.status(404).json({ error: `No decision with rank ${rank}` });
  }

  const entry = {
    id: `ACT-${Date.now()}`,
    timestamp: new Date().toISOString(),
    shift_time: DEMO_PHASES[_currentPhaseIndex].timestamp,
    machine_id: 'CNC-01',
    action: decision.action,
    rank: decision.rank,
    approved_by: approved_by ?? 'Rahul Sharma',
    outcomes: decision.outcomes,
    status: 'executed',
  };
  actionLog.push(entry);

  res.json({
    success: true,
    message: `Action approved: "${decision.action}"`,
    action_id: entry.id,
    action: entry.action,
    expected_outcomes: decision.outcomes,
    next_check_in_minutes: 15,
  });
});

// GET /api/decisions/history
router.get('/history', (req, res) => {
  res.json({
    machine_id: 'CNC-01',
    total_actions: actionLog.length,
    actions: actionLog,
  });
});

export default router;
