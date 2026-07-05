/**
 * POST /api/chat — AI engineer assistant
 * Responds with pre-scripted expert answers based on keyword matching
 */
import { Router } from 'express';
import { AI_CHAT_RESPONSES, DEMO_PHASES, WORLD_MODEL, DECISIONS } from '../data/storyData.js';

const router = Router();
let _currentPhaseIndex = 0;
export function setPhaseIndex(idx) { _currentPhaseIndex = idx; }

// Keyword → response key mapping
const KEYWORD_MAP = [
  { keywords: ['reduce rpm', 'why rpm', 'lower rpm', 'decrease rpm', 'rpm'],       key: 'why reduce rpm' },
  { keywords: ['rul', 'remaining useful life', 'how long', 'time left'],           key: 'what is rul' },
  { keywords: ['failure probability', 'chance of failure', '23%', 'probability'],  key: 'failure probability' },
];

// Dynamic answers built from live phase data
function buildDynamicAnswer(question, phase) {
  const sensors = phase.sensors;
  const rec = DECISIONS.find(d => d.recommended);
  const lq = question.toLowerCase();

  if (lq.includes('bearing')) {
    return `Based on Machine Memory (153 cycles), the current bearing shows ${sensors.bearing_health}% health with ${sensors.vibration} mm/s vibration.\n\nThe Industrial World Model has identified a bearing race wear signature matching the January 2024 failure event. At the current degradation rate, bearing health will reach the critical threshold (<45%) in approximately ${WORLD_MODEL.rul_hours} hours.\n\nRecommended action: ${rec?.action} — Confidence: ${rec?.confidence_pct}%`;
  }
  if (lq.includes('temperature') || lq.includes('heat')) {
    return `Current temperature is ${sensors.temperature}°C (critical threshold: >80°C).\n\nThe World Model causal chain shows:\nTemperature ↑ → Lubrication viscosity loss → Bearing friction ↑ → Motor load ↑ → Accelerated wear\n\nThis is the primary indicator of bearing degradation. Reducing RPM by 10% lowers heat generation by ~12%, slowing lubricant breakdown significantly.`;
  }
  if (lq.includes('energy') || lq.includes('power') || lq.includes('kwh')) {
    return `Current energy consumption: ${sensors.energy} kWh (normal: 4.5–6.5 kWh).\n\nThe 68% energy increase from baseline is driven by increased motor current (${sensors.current}A vs baseline 9.8A) due to bearing friction.\n\nApplying RPM reduction will reduce energy consumption by approximately 9%, saving ~₹1,800/shift in electricity costs.`;
  }
  if (lq.includes('shift') || lq.includes('workload') || lq.includes('cnc-08')) {
    return `Shifting 40% of current workload to CNC-08 is Decision Option 2 (Confidence: 95%).\n\nThis requires 5 minutes of reconfiguration but would extend bearing life by 112 hours — 33% more than the RPM reduction option. However, CNC-08 is currently at 71% load, so capacity is available.\n\nDecision Intelligence ranks RPM reduction first because it has zero downtime and is immediately reversible.`;
  }
  if (lq.includes('lubrication') || lq.includes('lubri')) {
    return `Current lubrication level: ${sensors.lubrication}% (warning threshold: <60%, critical: <60%).\n\nLubrication degradation is being driven by elevated temperature (${sensors.temperature}°C). At 83°C, ISO VG 68 spindle oil viscosity drops from 68 cSt to approximately 28 cSt — insufficient for bearing load protection.\n\nA lubrication flush alone would not resolve the root cause. RPM reduction is required to lower the thermal load first.`;
  }

  // Fallback: contextual answer from current phase
  return `Based on the current phase (${phase.label} at ${phase.timestamp}):\n\n${phase.narrative}\n\nMachine Health: ${phase.health_score}% | AI Decision: ${phase.ai_decision}\n\nAsk me about: RPM reduction, bearing health, temperature, lubrication, energy consumption, remaining useful life, or failure probability.`;
}

// POST /api/chat
router.post('/', (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'message is required' });
  }

  const start = Date.now();
  const lq = message.toLowerCase().trim();
  const phase = DEMO_PHASES[_currentPhaseIndex];

  // Check pre-scripted responses first
  let response = null;
  for (const { keywords, key } of KEYWORD_MAP) {
    if (keywords.some(kw => lq.includes(kw))) {
      response = AI_CHAT_RESPONSES[key];
      break;
    }
  }

  const latency = Date.now() - start + Math.floor(Math.random() * 30 + 20); // realistic 20–50ms

  if (response) {
    return res.json({
      question: message,
      answer: response.answer,
      latency_ms: latency,
      source: 'Machine Memory + World Model',
      confidence_pct: 96,
      phase: phase.phase,
    });
  }

  // Dynamic answer
  return res.json({
    question: message,
    answer: buildDynamicAnswer(message, phase),
    latency_ms: latency,
    source: 'Machine Memory + World Model',
    confidence_pct: 88,
    phase: phase.phase,
  });
});

export default router;
