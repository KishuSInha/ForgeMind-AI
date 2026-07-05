/**
 * api.js — ForgeMind AI frontend API client
 * Tries the Express backend first; falls back to static demo data
 * so the platform works fully on Vercel (no backend).
 */

const BASE = '/api';

// ── Shared phase state for static fallback ────────────────────────────────────
let _staticPhase = 5; // Start at Decision Intelligence — most impressive

// ── Static demo data (mirrors server/data/storyData.js) ──────────────────────
const MACHINE = {
  id: 'CNC-01', name: 'CNC Milling Machine #CNC-01', type: 'CNC Milling',
  plant: 'Tata Motors EV Component Plant', location: 'Line 3 — Pune',
  model: 'DMG Mori NHX 5000', installDate: '2021-09-14',
  operator: 'Rahul Sharma', shift: 'Morning Shift (09:00 – 17:00)', material: 'Cast Iron',
};

const PHASES = [
  { phase:1, label:'Healthy',               timestamp:'09:00', status:'ok',       health_score:98, narrative:'Machine operating within all normal parameters. Bearing replaced 28 Jan. All systems nominal.', ai_decision:'Continue Production', sensors:{ temperature:42.6, vibration:1.25, current:68, rpm:1450, bearing_health:98, lubrication:96, energy:4.8, noise:63 } },
  { phase:2, label:'Early Degradation',     timestamp:'09:30', status:'ok',       health_score:91, narrative:'Machine Memory detects subtle temperature rise (+9°C) and vibration increase. Within normal range but trending upward.', ai_decision:'Continue — Monitor', sensors:{ temperature:55, vibration:2.2, current:71, rpm:1450, bearing_health:94, lubrication:93, energy:5.2, noise:66 } },
  { phase:3, label:'Bearing Wear Detected', timestamp:'10:00', status:'warning',  health_score:82, narrative:'World Model identifies bearing friction increase. Temperature crossed warning threshold (68°C). Vibration matches previous failure signature.', ai_decision:'Bearing Wear Increasing — Monitor Closely', sensors:{ temperature:68, vibration:3.8, current:78, rpm:1450, bearing_health:88, lubrication:82, energy:6.0, noise:71 } },
  { phase:4, label:'World Model Prediction',timestamp:'10:30', status:'warning',  health_score:72, narrative:'Causal chain confirmed: Temperature ↑ → Lubrication ↓ → Bearing Friction ↑ → Motor Load ↑. RUL: 86h. Failure probability: 23%.', ai_decision:'Predictive Alert — Action Recommended', sensors:{ temperature:75, vibration:4.6, current:84, rpm:1450, bearing_health:79, lubrication:73, energy:6.9, noise:77 } },
  { phase:5, label:'Decision Intelligence', timestamp:'11:00', status:'critical', health_score:64, narrative:'Decision Intelligence evaluated 4 engineering actions. Recommended: Reduce RPM by 10%. Savings: ₹21,400. Life extended: 84h.', ai_decision:'RECOMMENDED: Reduce RPM by 10%', sensors:{ temperature:83, vibration:5.7, current:92, rpm:1450, bearing_health:64, lubrication:61, energy:7.8, noise:84 } },
  { phase:6, label:'Post-Action Recovery',  timestamp:'11:45', status:'ok',       health_score:81, narrative:'RPM reduced to 1305. Temperature stabilising. Vibration decreasing. Bearing health trend reversed. Production continues.', ai_decision:'Action Applied — Monitoring Recovery', sensors:{ temperature:62, vibration:2.8, current:72, rpm:1305, bearing_health:72, lubrication:68, energy:6.1, noise:72 } },
];

const SENSOR_UNITS = { temperature:'°C', vibration:'mm/s', current:'%', rpm:'RPM', bearing_health:'%', lubrication:'%', energy:'kWh', noise:'dB' };

const CAUSAL_CHAIN = [
  { step:1, node:'Temperature ↑',      value:'83°C',    status:'critical' },
  { step:2, node:'Lubrication ↓',      value:'61%',     status:'critical' },
  { step:3, node:'Bearing Friction ↑', value:'+38%',    status:'critical' },
  { step:4, node:'Frictional Load ↑',  value:'+24%',    status:'warning'  },
  { step:5, node:'Motor Load ↑',       value:'92%',     status:'critical' },
  { step:6, node:'Energy ↑',           value:'7.8 kWh', status:'warning'  },
  { step:7, node:'Bearing Failure',    value:'~86h',    status:'critical' },
];

const DECISIONS_DATA = [
  { rank:1, action:'Reduce RPM by 10%', description:'Reduce spindle speed from 1450 to 1305 RPM immediately', cost_inr:0, downtime_min:0, energy_change_pct:-8, confidence_pct:96, recommended:true,  outcomes:{ life_extension_hrs:84,  downtime_prevented_hrs:3.2, cost_saved_inr:21400,  energy_saved_pct:9  } },
  { rank:2, action:'Shift Load to CNC-08', description:'Redistribute 40% of workload to adjacent CNC-08', cost_inr:0, downtime_min:5,  energy_change_pct:-11,confidence_pct:95, recommended:false, outcomes:{ life_extension_hrs:112, downtime_prevented_hrs:3.2, cost_saved_inr:18900,  energy_saved_pct:11 } },
  { rank:3, action:'Replace Bearing Now', description:'Immediate planned bearing replacement during next break', cost_inr:7200, downtime_min:45, energy_change_pct:0, confidence_pct:98, recommended:false, outcomes:{ life_extension_hrs:720, downtime_prevented_hrs:0,   cost_saved_inr:-7200,  energy_saved_pct:0  } },
  { rank:4, action:'Continue Operation', description:'No action — monitor every 15 minutes', cost_inr:0, downtime_min:0, energy_change_pct:18, confidence_pct:12, recommended:false, outcomes:{ life_extension_hrs:-86, downtime_prevented_hrs:-3.2, cost_saved_inr:-21400, energy_saved_pct:-18 } },
];

const TIMELINE_DATA = [
  { time:'09:00', event:'Healthy',                          status:'ok',       health:98 },
  { time:'09:30', event:'Temperature Rising',               status:'ok',       health:91 },
  { time:'10:00', event:'Bearing Wear Detected',            status:'warning',  health:82 },
  { time:'10:30', event:'World Model Prediction',           status:'warning',  health:72 },
  { time:'11:00', event:'Decision Intelligence',            status:'critical', health:64 },
  { time:'11:10', event:'Recommendation — RPM Reduced',     status:'action',   health:64 },
  { time:'11:45', event:'Recovery in Progress',             status:'ok',       health:81 },
];

const MEMORY_DATA = {
  total_cycles:153, bearing_replaced:'28 Jan 2024', bearing_life_hours:720,
  current_runtime_hours:682, humidity_at_failure:'72%', material:'Cast Iron',
  previous_failure_pattern:'Similar vibration pattern (3.8–5.2 mm/s over 90 min) preceded bearing failure in Jan 2024.',
  operator_patterns:[
    { shift:'Morning',   avg_load:'62%', incidents:2 },
    { shift:'Afternoon', avg_load:'58%', incidents:1 },
    { shift:'Night',     avg_load:'49%', incidents:0 },
  ],
  historical_alerts:[
    { date:'2024-01-28', type:'Bearing Failure',   action:'Replacement',   downtime_hrs:4.5 },
    { date:'2023-09-12', type:'Overtemperature',   action:'Coolant Flush', downtime_hrs:1.2 },
    { date:'2023-05-03', type:'Vibration Spike',   action:'Lubrication',   downtime_hrs:0.5 },
  ],
};

// ── Static fallback response builders ────────────────────────────────────────
function staticMachine() {
  const p = PHASES[_staticPhase - 1];
  return { machine:MACHINE, current_phase:p.phase, status:p.status, health_score:p.health_score, timestamp:p.timestamp, narrative:p.narrative, ai_decision:p.ai_decision, dashboard:{ machine_health_pct:p.health_score, rul_hours:86, learning_cycles:153, decisions_evaluated:4, factory_efficiency_pct:94, energy_today_kwh:126, components_produced:98, recommendation_latency_ms:58 } };
}

function staticSensors() {
  const p = PHASES[_staticPhase - 1];
  const readings = Object.entries(p.sensors).map(([sensor, value]) => {
    const status = sensor === 'bearing_health' || sensor === 'lubrication'
      ? (value < 70 ? 'critical' : value < 85 ? 'warning' : 'ok')
      : (sensor === 'temperature' ? (value > 80 ? 'critical' : value > 65 ? 'warning' : 'ok')
      : (sensor === 'vibration'   ? (value > 5  ? 'critical' : value > 3  ? 'warning' : 'ok')
      : (sensor === 'current'     ? (value > 90 ? 'critical' : value > 76 ? 'warning' : 'ok')
      : (sensor === 'noise'       ? (value > 80 ? 'critical' : value > 73 ? 'warning' : 'ok')
      : (sensor === 'energy'      ? (value > 8  ? 'critical' : value > 6.5? 'warning' : 'ok') : 'ok')))));
    return { sensor, value, unit: SENSOR_UNITS[sensor] ?? '', status };
  });
  return { readings, timestamp: PHASES[_staticPhase - 1].timestamp };
}

function staticWorldModel() {
  const p = PHASES[_staticPhase - 1];
  const active = _staticPhase >= 3;
  return {
    rul_hours: active ? [null,null,320,150,86,170][_staticPhase-1] : null,
    failure_probability_pct: [0,2,8,14,23,6][_staticPhase-1],
    world_model_accuracy_pct: 94,
    physics_reasoning: active
      ? 'Bearing race wear causes micro-vibrations that degrade lubricant film. Reduced lubrication raises contact friction, increasing heat generation. Elevated temperature accelerates lubricant viscosity loss (Vogel equation), creating a positive feedback loop. Motor load at 92%, accelerating thermal degradation.'
      : 'World Model monitoring — all parameters within normal bounds. No causal chain escalation detected.',
  };
}

function staticCausalChain() {
  if (_staticPhase < 3) return { causal_chain: [{ step:1, node:'System Nominal', value:'All OK', status:'ok' }] };
  return { causal_chain: CAUSAL_CHAIN };
}

function staticDecisions() {
  const active = _staticPhase >= 5;
  if (!active) return { decisions_active:false, decisions:[], evaluated_count:0, recommendation_latency_ms:58 };
  return {
    decisions_active: true,
    decisions: DECISIONS_DATA,
    evaluated_count: 4,
    recommended_action: { ...DECISIONS_DATA[0], confidence_pct:96, outcomes: DECISIONS_DATA[0].outcomes },
    recommendation_latency_ms: 58,
  };
}

function staticPhases() {
  return { phases: PHASES.map(p => ({ phase:p.phase, label:p.label, timestamp:p.timestamp, status:p.status, health_score:p.health_score, ai_decision:p.ai_decision })), current: _staticPhase };
}

function staticChat(message) {
  const msg = message.toLowerCase();
  let answer = 'I have analysed CNC-01 across 153 learning cycles. ';
  if (msg.includes('rpm') || msg.includes('reduce'))
    answer += 'Reducing RPM by 10% (1450 → 1305) lowers bearing contact load by 18%, decreases motor load from 92% to ~72%, and extends bearing life by an estimated 84 hours. This avoids ₹21,400 in unplanned downtime costs. Confidence: 96%.';
  else if (msg.includes('rul') || msg.includes('useful life'))
    answer += 'Remaining Useful Life is estimated at 86 hours at current operating conditions. Bearing health is degrading at 0.41%/hr. With RPM reduction, this extends to ~170 hours.';
  else if (msg.includes('temperature') || msg.includes('heat'))
    answer += 'Temperature is at 83°C — above the warning threshold. Root cause: bearing friction increase due to lubrication degradation. The World Model predicts it will reach 91°C within 1 hour without intervention.';
  else if (msg.includes('bearing'))
    answer += 'Bearing health is at 64% — 18 percentage points above the critical failure threshold of 45%. Current degradation rate: 0.41%/hr. Last replaced: 28 Jan 2024 (682 of 720 rated hours used).';
  else if (msg.includes('vibration'))
    answer += 'Vibration is at 5.7 mm/s — above the critical threshold of 5.0 mm/s. This pattern matches the bearing failure event of Jan 2024 with 87% similarity, confirmed by the Machine Memory Engine.';
  else if (msg.includes('failure') || msg.includes('probability'))
    answer += 'Failure probability is currently 23% within 24 hours. Without intervention, this reaches 68% within 6 hours. With RPM reduction applied, the probability drops to 8% within 30 minutes.';
  else
    answer += 'The machine is in a critical condition with bearing health at 64%, vibration at 5.7 mm/s, and temperature at 83°C. I recommend approving the RPM reduction decision immediately to prevent unplanned downtime.';
  return { answer, confidence_pct: 94, latency_ms: 42, source: 'Machine Memory + World Model' };
}

// ── HTTP helpers with fallback ────────────────────────────────────────────────
async function get(path) {
  try {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  } catch {
    return null; // caller handles null → use static
  }
}

async function post(path, body) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  } catch {
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────
export const api = {
  health:          async () => (await get('/health')) ?? { status:'ok', service:'ForgeMind AI (static mode)' },
  machine:         async () => (await get('/machine'))              ?? staticMachine(),
  machineFull:     async () => (await get('/machine'))              ?? staticMachine(),
  timeline:        async () => (await get('/machine/timeline'))     ?? { timeline: TIMELINE_DATA },
  memory:          async () => (await get('/machine/memory'))       ?? { memory: MEMORY_DATA },
  phases:          async () => (await get('/machine/phases'))       ?? staticPhases(),
  sensors:         async () => (await get('/sensors'))              ?? staticSensors(),
  sensorHistory:   async () => (await get('/sensors/history'))      ?? { history: [] },
  thresholds:      async () => (await get('/sensors/thresholds'))   ?? { thresholds: {} },
  worldModel:      async () => (await get('/world-model'))          ?? staticWorldModel(),
  causalChain:     async () => (await get('/world-model/causal-chain')) ?? staticCausalChain(),
  decisions:       async () => (await get('/decisions'))            ?? staticDecisions(),
  decisionHistory: async () => (await get('/decisions/history'))    ?? { history: [] },

  setPhase: async (phase) => {
    _staticPhase = parseInt(phase);
    const res = await post('/phase', { phase });
    return res ?? { success:true, phase: _staticPhase, label: PHASES[_staticPhase-1]?.label };
  },

  approveDecision: async (rank, approvedBy) => {
    const res = await post('/decisions/approve', { action_rank: rank, approved_by: approvedBy });
    const d = DECISIONS_DATA.find(x => x.rank === rank);
    return res ?? { success:true, action: d?.action ?? 'Action approved', message:`Decision ${rank} approved by ${approvedBy}` };
  },

  chat: async (message) => {
    const res = await post('/chat', { message });
    return res ?? staticChat(message);
  },
};

/** SSE stream — gracefully no-ops when backend is unreachable */
export function openStream(onMessage, onError) {
  try {
    const es = new EventSource('http://localhost:3001/api/stream');
    es.onmessage = (e) => { try { onMessage(JSON.parse(e.data)); } catch {} };
    es.onerror = () => { es.close(); }; // silently close if backend is down
    return es;
  } catch {
    return { close: () => {} }; // no-op handle
  }
}
