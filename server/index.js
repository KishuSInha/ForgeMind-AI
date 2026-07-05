/**
 * ForgeMind AI — Express Backend
 * Serves REST API + Server-Sent Events for live dashboard
 * Port: 3001
 */
import express from 'express';
import cors from 'cors';

import machineRouter from './routes/machine.js';
import sensorsRouter, { setPhaseIndex as setSensorsPhase } from './routes/sensors.js';
import worldModelRouter, { setPhaseIndex as setWmPhase } from './routes/worldModel.js';
import decisionsRouter, { setPhaseIndex as setDecisionsPhase } from './routes/decisions.js';
import chatRouter, { setPhaseIndex as setChatPhase } from './routes/chat.js';
import { DEMO_PHASES, DASHBOARD_CARDS, TIMELINE } from './data/storyData.js';

const app = express();
const PORT = 3001;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

// ── Shared phase state ──────────────────────────────────────────────────────
let currentPhaseIndex = 4; // Start at phase 5 (critical — most impressive on load)

function setAllPhases(idx) {
  currentPhaseIndex = idx;
  setSensorsPhase(idx);
  setWmPhase(idx);
  setDecisionsPhase(idx);
  setChatPhase(idx);
  broadcastPhaseChange(idx);
}

// ── SSE clients list ────────────────────────────────────────────────────────
const sseClients = new Set();

function broadcastPhaseChange(idx) {
  const phase = DEMO_PHASES[idx];
  const payload = JSON.stringify({
    type: 'phase_change',
    phase: phase.phase,
    label: phase.label,
    status: phase.status,
    health_score: phase.health_score,
    timestamp: phase.timestamp,
    narrative: phase.narrative,
    ai_decision: phase.ai_decision,
    sensors: phase.sensors,
  });
  for (const client of sseClients) {
    client.write(`data: ${payload}\n\n`);
  }
}

// ── SSE endpoint — GET /api/stream ──────────────────────────────────────────
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send current state on connect
  const phase = DEMO_PHASES[currentPhaseIndex];
  res.write(`data: ${JSON.stringify({
    type: 'connected',
    phase: phase.phase,
    label: phase.label,
    status: phase.status,
    health_score: phase.health_score,
    timestamp: phase.timestamp,
    narrative: phase.narrative,
    ai_decision: phase.ai_decision,
    sensors: phase.sensors,
    dashboard: DASHBOARD_CARDS,
  })}\n\n`);

  sseClients.add(res);

  // Heartbeat every 25s to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// ── Phase control — POST /api/phase ────────────────────────────────────────
app.post('/api/phase', (req, res) => {
  const { phase } = req.body;
  const idx = parseInt(phase, 10) - 1;
  if (isNaN(idx) || idx < 0 || idx >= DEMO_PHASES.length) {
    return res.status(400).json({ error: `phase must be 1–${DEMO_PHASES.length}` });
  }
  setAllPhases(idx);
  const p = DEMO_PHASES[idx];
  res.json({
    success: true,
    message: `Demo advanced to Phase ${p.phase}: ${p.label}`,
    phase: p.phase,
    label: p.label,
    status: p.status,
    health_score: p.health_score,
    timestamp: p.timestamp,
  });
});

// ── Mount routers ───────────────────────────────────────────────────────────
app.use('/api/machine', machineRouter);
app.use('/api/sensors', sensorsRouter);
app.use('/api/world-model', worldModelRouter);
app.use('/api/decisions', decisionsRouter);
app.use('/api/chat', chatRouter);

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ForgeMind AI Backend',
    version: '1.0.0',
    current_phase: DEMO_PHASES[currentPhaseIndex].phase,
    phase_label: DEMO_PHASES[currentPhaseIndex].label,
    sse_clients: sseClients.size,
    uptime_seconds: Math.floor(process.uptime()),
  });
});

// ── Overview — GET /api ─────────────────────────────────────────────────────
app.get('/api', (req, res) => {
  res.json({
    name: 'ForgeMind AI API',
    description: 'Tata Motors EV Component Plant — CNC-07 Demo Backend',
    endpoints: {
      'GET  /api/health':                  'Server health + current phase',
      'GET  /api/stream':                  'SSE stream — live phase updates',
      'POST /api/phase':                   'Set demo phase { phase: 1–6 }',
      'GET  /api/machine':                 'Machine identity + current snapshot',
      'GET  /api/machine/timeline':        'Full shift timeline',
      'GET  /api/machine/memory':          'Machine Memory Engine data',
      'GET  /api/machine/phases':          'All phase definitions',
      'GET  /api/sensors':                 'Live sensor readings',
      'GET  /api/sensors/history':         'All 6 phase sensor snapshots',
      'GET  /api/sensors/thresholds':      'Sensor threshold reference',
      'GET  /api/world-model':             'RUL, failure probability, reasoning',
      'GET  /api/world-model/causal-chain':'Progressive causal chain',
      'GET  /api/decisions':               'Ranked engineering actions',
      'POST /api/decisions/approve':       'Approve action { action_rank, approved_by }',
      'GET  /api/decisions/history':       'Approved action log',
      'POST /api/chat':                    'AI assistant { message: string }',
    },
    demo_phases: DEMO_PHASES.map(p => `Phase ${p.phase}: ${p.label} (${p.timestamp})`),
    current_phase: DEMO_PHASES[currentPhaseIndex].phase,
  });
});

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🔧 ForgeMind AI Backend running on http://localhost:${PORT}`);
  console.log(`📊 API overview:         http://localhost:${PORT}/api`);
  console.log(`🏥 Health check:         http://localhost:${PORT}/api/health`);
  console.log(`📡 SSE stream:           http://localhost:${PORT}/api/stream`);
  console.log(`\n📍 Demo starts at Phase 5 (Critical — Decision Intelligence)\n`);
});
