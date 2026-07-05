/**
 * api.js — ForgeMind AI frontend API client
 * All calls go to the Express backend on :3001
 */

// Uses Vite dev proxy → /api → http://localhost:3001/api
const BASE = '/api';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API POST ${path} → ${res.status}`);
  return res.json();
}

export const api = {
  health:          () => get('/health'),
  machine:         () => get('/machine'),
  machineFull:     () => get('/machine'),
  timeline:        () => get('/machine/timeline'),
  memory:          () => get('/machine/memory'),
  phases:          () => get('/machine/phases'),
  setPhase:        (phase) => post('/phase', { phase }),
  sensors:         () => get('/sensors'),
  sensorHistory:   () => get('/sensors/history'),
  thresholds:      () => get('/sensors/thresholds'),
  worldModel:      () => get('/world-model'),
  causalChain:     () => get('/world-model/causal-chain'),
  decisions:       () => get('/decisions'),
  approveDecision: (rank, approvedBy) => post('/decisions/approve', { action_rank: rank, approved_by: approvedBy }),
  decisionHistory: () => get('/decisions/history'),
  chat:            (message) => post('/chat', { message }),
};

/** Open a Server-Sent Events stream for live phase updates */
export function openStream(onMessage, onError) {
  // EventSource needs an absolute URL — backend is on :3001
  const es = new EventSource('http://localhost:3001/api/stream');
  es.onmessage = (e) => {
    try { onMessage(JSON.parse(e.data)); } catch {}
  };
  es.onerror = onError ?? (() => {});
  return es; // caller can call es.close()
}
