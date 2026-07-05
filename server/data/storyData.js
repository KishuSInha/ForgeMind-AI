/**
 * ForgeMind AI — Story-Driven Demo Data
 * Tata Motors EV Component Plant | CNC-07 | Morning Shift
 *
 * This data tells a complete narrative:
 *   Phase 1 → Healthy      (09:00) normal operation
 *   Phase 2 → Degrading    (09:30) subtle early signs
 *   Phase 3 → Warning      (10:00) bearing wear confirmed
 *   Phase 4 → Critical     (10:30) World Model prediction kicks in
 *   Phase 5 → Decision     (11:00) Decision Intelligence fires
 *   Phase 6 → Recovery     (11:45) post-RPM-reduction, stabilising
 */

// ── Machine identity ──────────────────────────────────────────────────────────
export const MACHINE = {
  id: 'CNC-07',
  name: 'CNC Milling Machine #CNC-07',
  type: 'CNC Milling',
  plant: 'Tata Motors EV Component Plant',
  location: 'Line 3 — Pune',
  model: 'DMG Mori NHX 5000',
  installDate: '2021-09-14',
  operator: 'Rahul Sharma',
  shift: 'Morning Shift (09:00 – 17:00)',
  material: 'Cast Iron',
};

// ── Sensor thresholds ─────────────────────────────────────────────────────────
export const THRESHOLDS = {
  temperature:     { unit: '°C',   normal: [45, 65],  warning: [66, 80],  critical: 80  },
  vibration:       { unit: 'mm/s', normal: [1, 3],    warning: [3, 5],    critical: 5   },
  current:         { unit: 'A',    normal: [8, 12],   warning: [12, 15],  critical: 15  },
  rpm:             { unit: 'RPM',  normal: [1400,1500],warning: [1350,1400],critical: 1350},
  bearing_health:  { unit: '%',    normal: [90, 100],  warning: [70, 89],  critical: 70  },
  lubrication:     { unit: '%',    normal: [90, 100],  warning: [60, 89],  critical: 60  },
  energy:          { unit: 'kWh',  normal: [4.5, 6.5], warning: [6.5, 8], critical: 8   },
  noise:           { unit: 'dB',   normal: [60, 72],   warning: [73, 80],  critical: 80  },
};

// ── The 4 key demo phases ─────────────────────────────────────────────────────
export const DEMO_PHASES = [
  {
    phase: 1,
    label: 'Healthy',
    timestamp: '09:00',
    status: 'ok',
    health_score: 98,
    narrative: 'Machine operating within all normal parameters. Bearing replaced 28 Jan. All systems nominal.',
    ai_decision: 'Continue Production',
    sensors: {
      temperature:    52,
      vibration:      1.9,
      current:        9.8,
      rpm:            1450,
      bearing_health: 98,
      lubrication:    96,
      energy:         4.8,
      noise:          63,
    },
  },
  {
    phase: 2,
    label: 'Early Degradation',
    timestamp: '09:30',
    status: 'ok',
    health_score: 91,
    narrative: 'Machine Memory detects subtle temperature rise (+9°C) and vibration increase (+0.8 mm/s). Within normal range but trending upward. Logged against 153 historical cycles.',
    ai_decision: 'Continue — Monitor',
    sensors: {
      temperature:    61,
      vibration:      2.7,
      current:        10.4,
      rpm:            1450,
      bearing_health: 94,
      lubrication:    93,
      energy:         5.2,
      noise:          66,
    },
  },
  {
    phase: 3,
    label: 'Bearing Wear Detected',
    timestamp: '10:00',
    status: 'warning',
    health_score: 82,
    narrative: 'Industrial World Model identifies bearing friction increase. Temperature has crossed warning threshold (68°C). Vibration pattern matches previous bearing failure signature from Jan 2024.',
    ai_decision: 'Bearing Wear Increasing — Monitor Closely',
    sensors: {
      temperature:    68,
      vibration:      3.8,
      current:        12.1,
      rpm:            1450,
      bearing_health: 88,
      lubrication:    82,
      energy:         6.0,
      noise:          71,
    },
  },
  {
    phase: 4,
    label: 'World Model Prediction',
    timestamp: '10:30',
    status: 'warning',
    health_score: 72,
    narrative: 'World Model causal chain confirmed: Temperature ↑ → Lubrication ↓ → Bearing Friction ↑ → Motor Load ↑ → Current ↑ → Energy ↑ → Failure. RUL estimated at 86 hours. Failure probability: 23%.',
    ai_decision: 'Predictive Alert — Action Recommended',
    sensors: {
      temperature:    75,
      vibration:      4.6,
      current:        13.7,
      rpm:            1450,
      bearing_health: 79,
      lubrication:    73,
      energy:         6.9,
      noise:          77,
    },
  },
  {
    phase: 5,
    label: 'Decision Intelligence',
    timestamp: '11:00',
    status: 'critical',
    health_score: 64,
    narrative: 'Decision Intelligence evaluated 4 engineering actions. Recommended: Reduce RPM by 10%. Estimated savings ₹21,400. Downtime prevented: 3.2 hours. Energy saved: 9%. Machine life extended: 84 hours.',
    ai_decision: 'RECOMMENDED: Reduce RPM by 10%',
    sensors: {
      temperature:    83,
      vibration:      5.7,
      current:        15.3,
      rpm:            1450,
      bearing_health: 64,
      lubrication:    61,
      energy:         7.8,
      noise:          84,
    },
  },
  {
    phase: 6,
    label: 'Post-Action Recovery',
    timestamp: '11:45',
    status: 'ok',
    health_score: 81,
    narrative: 'RPM reduced to 1305. Machine Memory records intervention. Temperature stabilising. Vibration decreasing. Bearing health trend reversed. Production continues uninterrupted.',
    ai_decision: 'Action Applied — Monitoring Recovery',
    sensors: {
      temperature:    71,
      vibration:      3.1,
      current:        11.8,
      rpm:            1305,
      bearing_health: 72,
      lubrication:    68,
      energy:         6.1,
      noise:          72,
    },
  },
];

// ── Machine Memory (153 learning cycles) ─────────────────────────────────────
export const MACHINE_MEMORY = {
  total_cycles: 153,
  bearing_replaced: '2024-01-28',
  bearing_life_hours: 720,
  current_runtime_hours: 682,
  humidity_at_failure: '72%',
  material: 'Cast Iron',
  previous_failure_pattern: 'Similar vibration pattern (3.8–5.2 mm/s over 90 min) preceded bearing failure in Jan 2024',
  operator_patterns: [
    { shift: 'Morning', avg_load: '62%', incidents: 2 },
    { shift: 'Afternoon', avg_load: '58%', incidents: 1 },
    { shift: 'Night', avg_load: '49%', incidents: 0 },
  ],
  historical_alerts: [
    { date: '2024-01-28', type: 'Bearing Failure', action: 'Replacement', downtime_hrs: 4.5 },
    { date: '2023-09-12', type: 'Overtemperature', action: 'Coolant Flush', downtime_hrs: 1.2 },
    { date: '2023-05-03', type: 'Vibration Spike', action: 'Lubrication', downtime_hrs: 0.5 },
  ],
};

// ── World Model causal chain ──────────────────────────────────────────────────
export const WORLD_MODEL = {
  rul_hours: 86,
  failure_probability_pct: 23,
  world_model_accuracy_pct: 94,
  causal_chain: [
    { step: 1, node: 'Temperature ↑',       value: '83°C',   status: 'critical' },
    { step: 2, node: 'Lubrication ↓',       value: '61%',    status: 'critical' },
    { step: 3, node: 'Bearing Friction ↑',  value: '+38%',   status: 'critical' },
    { step: 4, node: 'Motor Load ↑',        value: '+21%',   status: 'warning'  },
    { step: 5, node: 'Current ↑',           value: '15.3A',  status: 'critical' },
    { step: 6, node: 'Energy ↑',            value: '7.8 kWh',status: 'warning'  },
    { step: 7, node: 'Bearing Failure',     value: '~86h',   status: 'critical' },
  ],
  physics_reasoning: 'Bearing race wear causes micro-vibrations that degrade lubricant film. Reduced lubrication raises contact friction, increasing heat generation. Elevated temperature accelerates lubricant viscosity loss (Vogel equation), creating a positive feedback loop. Motor compensates with higher current draw (+21%), accelerating thermal degradation.',
};

// ── Decision Intelligence options ─────────────────────────────────────────────
export const DECISIONS = [
  {
    rank: 1,
    action: 'Reduce RPM by 10%',
    description: 'Reduce spindle speed from 1450 to 1305 RPM immediately',
    cost_inr: 0,
    downtime_min: 0,
    energy_change_pct: -8,
    confidence_pct: 96,
    recommended: true,
    outcomes: {
      life_extension_hrs: 84,
      downtime_prevented_hrs: 3.2,
      cost_saved_inr: 21400,
      energy_saved_pct: 9,
    },
  },
  {
    rank: 2,
    action: 'Shift Load to CNC-08',
    description: 'Redistribute 40% of current workload to adjacent machine CNC-08',
    cost_inr: 0,
    downtime_min: 5,
    energy_change_pct: -11,
    confidence_pct: 95,
    recommended: false,
    outcomes: {
      life_extension_hrs: 112,
      downtime_prevented_hrs: 3.2,
      cost_saved_inr: 18900,
      energy_saved_pct: 11,
    },
  },
  {
    rank: 3,
    action: 'Replace Bearing Now',
    description: 'Immediate planned bearing replacement during next break',
    cost_inr: 7200,
    downtime_min: 45,
    energy_change_pct: 0,
    confidence_pct: 98,
    recommended: false,
    outcomes: {
      life_extension_hrs: 720,
      downtime_prevented_hrs: 0,
      cost_saved_inr: -7200,
      energy_saved_pct: 0,
    },
  },
  {
    rank: 4,
    action: 'Continue Operation',
    description: 'No action — continue at current settings with 15-minute monitoring',
    cost_inr: 0,
    downtime_min: 0,
    energy_change_pct: 18,
    confidence_pct: 12,
    recommended: false,
    outcomes: {
      life_extension_hrs: -86,
      downtime_prevented_hrs: -3.2,
      cost_saved_inr: -21400,
      energy_saved_pct: -18,
    },
  },
];

// ── Dashboard summary cards ───────────────────────────────────────────────────
export const DASHBOARD_CARDS = {
  machine_health_pct: 64,
  rul_hours: 86,
  learning_cycles: 153,
  decisions_evaluated: 4,
  factory_efficiency_pct: 94,
  energy_today_kwh: 126,
  components_produced: 98,
  recommendation_latency_ms: 58,
};

// ── Machine timeline ──────────────────────────────────────────────────────────
export const TIMELINE = [
  { time: '09:00', event: 'Healthy',               status: 'ok',       health: 98 },
  { time: '09:30', event: 'Temperature Rising',    status: 'ok',       health: 91 },
  { time: '10:00', event: 'Bearing Wear Detected', status: 'warning',  health: 82 },
  { time: '10:30', event: 'World Model Prediction',status: 'warning',  health: 72 },
  { time: '11:00', event: 'Decision Intelligence', status: 'critical', health: 64 },
  { time: '11:10', event: 'Recommendation Generated — RPM Reduced', status: 'action', health: 64 },
  { time: '11:45', event: 'Recovery in Progress',  status: 'ok',       health: 81 },
];

// ── AI Chat pre-scripted Q&A ──────────────────────────────────────────────────
export const AI_CHAT_RESPONSES = {
  'why reduce rpm': {
    question: 'Why should I reduce RPM?',
    answer: `Historical operating data from 153 learning cycles indicates that this vibration pattern (3.8–5.7 mm/s over 90 minutes) has previously resulted in bearing failure after approximately 80 operating hours.\n\nReducing spindle speed by 10% (1450 → 1305 RPM):\n• Lowers bearing contact load by ~18%\n• Decreases motor current by approximately 7% (15.3A → 14.2A)\n• Reduces heat generation, slowing lubricant degradation\n• Extends estimated bearing life by 84 hours\n• Avoids estimated ₹21,400 in unplanned downtime costs\n\nConfidence: 96% | Based on 153 historical cycles`,
  },
  'what is rul': {
    question: 'What is the Remaining Useful Life?',
    answer: `Remaining Useful Life (RUL) is currently estimated at 86 hours at present operating conditions.\n\nThis is calculated by the Industrial World Model using:\n• Current bearing health degradation rate: -0.41%/hr\n• Historical failure threshold: bearing_health < 45%\n• Current value: 64% → 19 percentage points to threshold\n• At current rate: 86 hours\n\nIf RPM is reduced by 10%, degradation rate drops to ~0.22%/hr, extending RUL to approximately 170 hours.\n\nWorld Model Accuracy: 94%`,
  },
  'failure probability': {
    question: 'What does 23% failure probability mean?',
    answer: `Failure probability of 23% means that under current operating conditions, there is a 23% chance of bearing failure within the next 24 hours.\n\nThis is calculated using a Weibull survival function applied to:\n• Current bearing health: 64%\n• Degradation velocity: accelerating (+0.8 mm/s vibration per hour)\n• Historical failure pattern match: 87% similar to Jan 2024 event\n• Operating environment: 72% humidity, cast iron material\n\nWithout intervention, this probability reaches 68% within 6 hours.\nWith RPM reduction, probability drops to 8% within 30 minutes.`,
  },
};

// ── Sensor history for sparklines (last 6 data points per sensor) ─────────────
export const SENSOR_HISTORY = DEMO_PHASES.map(p => ({
  timestamp: p.timestamp,
  phase: p.phase,
  label: p.label,
  ...p.sensors,
}));
