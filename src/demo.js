/**
 * demo.js — ForgeMind AI Live Demo Dashboard
 * Connects to Express backend, renders the full Tata Motors CNC-07 story
 * Injected into the page by main.js after DOMContentLoaded
 */
import { gsap } from 'gsap';
import { api, openStream } from './api.js';

// ─── Status colour map ────────────────────────────────────────────────────────
const STATUS_COLOR = { ok: '#00ff88', warning: '#ff6b35', critical: '#ff3535', action: '#a855f7' };
const STATUS_LABEL = { ok: 'HEALTHY', warning: 'WARNING', critical: 'CRITICAL', action: 'ACTION APPLIED' };

// ─── Sensor display config ────────────────────────────────────────────────────
const SENSOR_CONFIG = {
  temperature:    { label: 'Temperature',    icon: '🌡️', max: 100 },
  vibration:      { label: 'Vibration RMS',  icon: '📳', max: 8   },
  current:        { label: 'Motor Current',  icon: '⚡', max: 18  },
  rpm:            { label: 'Spindle RPM',    icon: '🔄', max: 1600 },
  bearing_health: { label: 'Bearing Health', icon: '⚙️', max: 100 },
  lubrication:    { label: 'Lubrication',    icon: '💧', max: 100 },
  energy:         { label: 'Energy',         icon: '🔋', max: 10  },
  noise:          { label: 'Noise Level',    icon: '🔊', max: 100 },
};

// ─── Build the demo section HTML ──────────────────────────────────────────────
function buildDemoHTML() {
  return `
  <section class="section demo-section" id="live-demo">
    <div class="container">
      <div class="section-label">Live Demo — Tata Motors EV Component Plant</div>
      <h2 class="section-title">CNC-07 Morning Shift Story</h2>
      <p class="section-desc">Watch the full ForgeMind AI workflow: Machine Memory → World Model → Decision Intelligence — driven by real industrial data.</p>

      <!-- Phase stepper -->
      <div class="demo-stepper glass-card" id="demo-stepper">
        <div class="stepper-label">Demo Phase</div>
        <div class="stepper-phases" id="stepper-phases">
          <!-- injected by JS -->
        </div>
        <div class="stepper-narrative" id="stepper-narrative">Loading…</div>
      </div>

      <!-- Machine identity bar -->
      <div class="machine-bar glass-card" id="machine-bar">
        <div class="mbar-item"><span class="mbar-label">Machine</span><span class="mbar-val" id="mb-machine">CNC-07</span></div>
        <div class="mbar-item"><span class="mbar-label">Plant</span><span class="mbar-val" id="mb-plant">—</span></div>
        <div class="mbar-item"><span class="mbar-label">Operator</span><span class="mbar-val" id="mb-operator">—</span></div>
        <div class="mbar-item"><span class="mbar-label">Shift Time</span><span class="mbar-val" id="mb-time">—</span></div>
        <div class="mbar-item"><span class="mbar-label">Status</span><span class="mbar-val mbar-status" id="mb-status">—</span></div>
        <div class="mbar-item"><span class="mbar-label">Health</span><span class="mbar-val mbar-health" id="mb-health">—</span></div>
      </div>

      <!-- Main 3-column grid -->
      <div class="demo-grid">

        <!-- LEFT: Sensor readings -->
        <div class="demo-col">
          <div class="demo-card glass-card">
            <div class="demo-card-title">📡 Live Sensor Readings</div>
            <div id="sensor-list" class="sensor-list"><!-- injected --></div>
          </div>

          <!-- Machine Memory -->
          <div class="demo-card glass-card">
            <div class="demo-card-title">🧠 Machine Memory Engine</div>
            <div class="demo-card-badge badge-blue">153 Learning Cycles</div>
            <div id="memory-panel" class="memory-panel">
              <div class="mem-row"><span class="mem-key">Bearing Replaced</span><span class="mem-val">28 Jan 2024</span></div>
              <div class="mem-row"><span class="mem-key">Bearing Life</span><span class="mem-val">720 hours</span></div>
              <div class="mem-row"><span class="mem-key">Current Runtime</span><span class="mem-val">682 hours</span></div>
              <div class="mem-row mem-warn"><span class="mem-key">Previous Failure</span><span class="mem-val">Similar vibration pattern</span></div>
              <div class="mem-row"><span class="mem-key">Operator</span><span class="mem-val">Morning Shift</span></div>
              <div class="mem-row"><span class="mem-key">Humidity</span><span class="mem-val">72%</span></div>
              <div class="mem-row"><span class="mem-key">Material</span><span class="mem-val">Cast Iron</span></div>
            </div>
          </div>
        </div>

        <!-- CENTER: World Model + Timeline -->
        <div class="demo-col">
          <div class="demo-card glass-card">
            <div class="demo-card-title">🌐 Industrial World Model</div>
            <div id="wm-summary" class="wm-summary">
              <div class="wm-stat-row">
                <div class="wm-stat"><div class="wm-stat-num" id="wm-rul">—</div><div class="wm-stat-label">Remaining Useful Life (hrs)</div></div>
                <div class="wm-stat"><div class="wm-stat-num" id="wm-fail">—</div><div class="wm-stat-label">Failure Probability</div></div>
                <div class="wm-stat"><div class="wm-stat-num">94%</div><div class="wm-stat-label">Model Accuracy</div></div>
              </div>
            </div>
            <div class="demo-card-sub">Causal Chain</div>
            <div id="causal-chain" class="causal-chain"><!-- injected --></div>
          </div>

          <!-- Timeline -->
          <div class="demo-card glass-card">
            <div class="demo-card-title">⏱ Machine Timeline</div>
            <div id="shift-timeline" class="shift-timeline"><!-- injected --></div>
          </div>
        </div>

        <!-- RIGHT: Decision Intelligence + AI Chat -->
        <div class="demo-col">
          <div class="demo-card glass-card" id="decision-card">
            <div class="demo-card-title">⚡ Decision Intelligence</div>
            <div id="decision-list" class="decision-list"><!-- injected --></div>
            <div id="decision-recommendation" class="decision-recommendation"><!-- injected --></div>
          </div>

          <!-- AI Chat -->
          <div class="demo-card glass-card">
            <div class="demo-card-title">💬 Ask the AI</div>
            <div id="chat-log" class="chat-log">
              <div class="chat-bubble ai-bubble">
                <strong>ForgeMind AI</strong><br/>
                I've analysed CNC-07. Ask me why the vibration is increasing, what the RUL means, or why I recommend reducing RPM.
              </div>
            </div>
            <div class="chat-suggestions" id="chat-suggestions">
              <button class="chat-suggest-btn" data-q="Why should I reduce RPM?">Why reduce RPM?</button>
              <button class="chat-suggest-btn" data-q="What is the Remaining Useful Life?">What is RUL?</button>
              <button class="chat-suggest-btn" data-q="What does 23% failure probability mean?">Failure probability?</button>
              <button class="chat-suggest-btn" data-q="What is causing the temperature rise?">Temperature cause?</button>
            </div>
            <div class="chat-input-row">
              <input type="text" id="chat-input" class="chat-input" placeholder="Ask about CNC-07…" />
              <button id="chat-send" class="chat-send-btn">→</button>
            </div>
          </div>
        </div>

      </div><!-- /demo-grid -->

      <!-- Dashboard summary cards -->
      <div class="demo-cards-row" id="demo-cards-row">
        <div class="dc glass-card"><div class="dc-num" id="dc-health">64%</div><div class="dc-label">Machine Health</div></div>
        <div class="dc glass-card"><div class="dc-num" id="dc-rul">86h</div><div class="dc-label">Remaining Useful Life</div></div>
        <div class="dc glass-card"><div class="dc-num">153</div><div class="dc-label">Learning Cycles</div></div>
        <div class="dc glass-card"><div class="dc-num">4</div><div class="dc-label">Decisions Evaluated</div></div>
        <div class="dc glass-card"><div class="dc-num">94%</div><div class="dc-label">Factory Efficiency</div></div>
        <div class="dc glass-card"><div class="dc-num">126 kWh</div><div class="dc-label">Energy Today</div></div>
        <div class="dc glass-card"><div class="dc-num">98</div><div class="dc-label">Components Produced</div></div>
        <div class="dc glass-card dc-highlight"><div class="dc-num">58ms</div><div class="dc-label">Decision Latency</div></div>
      </div>

    </div>
  </section>`;
}

// ─── Render helpers ───────────────────────────────────────────────────────────

function renderSensors(readings) {
  const list = document.getElementById('sensor-list');
  if (!list) return;
  list.innerHTML = readings.map(r => {
    const cfg = SENSOR_CONFIG[r.sensor] ?? { label: r.sensor, icon: '📊', max: 100 };
    const pct = Math.min(100, (r.value / cfg.max) * 100);
    const color = r.status === 'critical' ? '#ff3535' : r.status === 'warning' ? '#ff6b35' : '#00ff88';
    return `
      <div class="sensor-item">
        <div class="sensor-row-top">
          <span class="sensor-icon">${cfg.icon}</span>
          <span class="sensor-name">${cfg.label}</span>
          <span class="sensor-val" style="color:${color}">${r.value} ${r.unit}</span>
          <span class="sensor-badge" style="background:${color}22;color:${color};border-color:${color}44">${r.status.toUpperCase()}</span>
        </div>
        <div class="sensor-bar-outer">
          <div class="sensor-bar-fill" style="width:${pct}%;background:${color};box-shadow:0 0 8px ${color}66"></div>
        </div>
      </div>`;
  }).join('');
}

function renderCausalChain(nodes) {
  const el = document.getElementById('causal-chain');
  if (!el) return;
  el.innerHTML = nodes.map((n, i) => {
    const color = n.status === 'critical' ? '#ff3535' : n.status === 'warning' ? '#ff6b35' : '#00ff88';
    return `
      <div class="chain-node" style="animation-delay:${i * 0.12}s">
        <div class="chain-step-num" style="color:${color}">${n.step}</div>
        <div class="chain-step-content">
          <span class="chain-node-name" style="color:${color}">${n.node}</span>
          <span class="chain-node-val">${n.value}</span>
        </div>
        ${i < nodes.length - 1 ? '<div class="chain-arrow">↓</div>' : ''}
      </div>`;
  }).join('');
  gsap.fromTo('.chain-node', { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' });
}

function renderTimeline(timeline, currentPhase) {
  const el = document.getElementById('shift-timeline');
  if (!el) return;
  el.innerHTML = timeline.map(t => {
    const color = STATUS_COLOR[t.status] ?? '#8892aa';
    const active = t.status === 'action' || (currentPhase && t.health <= currentPhase.health_score + 5);
    return `
      <div class="tl-row ${active ? 'tl-active' : ''}">
        <span class="tl-time">${t.time}</span>
        <span class="tl-dot" style="background:${color};box-shadow:0 0 6px ${color}"></span>
        <span class="tl-event" style="color:${active ? color : '#8892aa'}">${t.event}</span>
        <span class="tl-health" style="color:${color}">${t.health}%</span>
      </div>`;
  }).join('');
}

function renderDecisions(data) {
  const listEl = document.getElementById('decision-list');
  const recEl  = document.getElementById('decision-recommendation');
  if (!listEl) return;

  if (!data.decisions_active || !data.decisions.length) {
    listEl.innerHTML = `<div class="decision-inactive">Decision Intelligence activates when a critical condition is detected.<br/>Advance to Phase 5 to see it in action.</div>`;
    if (recEl) recEl.innerHTML = '';
    return;
  }

  listEl.innerHTML = data.decisions.map(d => {
    const borderColor = d.recommended ? '#00ff88' : 'rgba(255,255,255,0.08)';
    const costStr = d.cost_inr > 0 ? `₹${d.cost_inr.toLocaleString('en-IN')}` : '₹0';
    const energyStr = d.energy_change_pct < 0 ? `${d.energy_change_pct}%` : `+${d.energy_change_pct}%`;
    const energyColor = d.energy_change_pct < 0 ? '#00ff88' : '#ff6b35';
    return `
      <div class="dec-item ${d.recommended ? 'dec-recommended' : ''}" style="border-color:${borderColor}">
        <div class="dec-rank ${d.recommended ? 'dec-rank-top' : ''}">${d.rank}</div>
        <div class="dec-info">
          <div class="dec-action">${d.action}</div>
          <div class="dec-scores">
            <span class="dec-score">Cost: ${costStr}</span>
            <span class="dec-score">Downtime: ${d.downtime_min}min</span>
            <span class="dec-score" style="color:${energyColor}">Energy: ${energyStr}</span>
          </div>
        </div>
        <div class="dec-conf ${d.recommended ? 'dec-conf-top' : ''}">${d.confidence_pct}%</div>
        ${d.recommended ? `<button class="dec-approve-btn" data-rank="${d.rank}">Approve</button>` : ''}
      </div>`;
  }).join('');

  // Recommendation box
  const rec = data.recommended_action;
  if (rec && recEl) {
    recEl.innerHTML = `
      <div class="rec-box">
        <div class="rec-title">⚡ AI Recommendation</div>
        <div class="rec-action">${rec.action}</div>
        <div class="rec-outcomes">
          <div class="rec-out"><span class="rec-out-label">Cost Saved</span><span class="rec-out-val green">₹${rec.outcomes.cost_saved_inr.toLocaleString('en-IN')}</span></div>
          <div class="rec-out"><span class="rec-out-label">Downtime Prevented</span><span class="rec-out-val green">${rec.outcomes.downtime_prevented_hrs}h</span></div>
          <div class="rec-out"><span class="rec-out-label">Energy Saved</span><span class="rec-out-val green">${rec.outcomes.energy_saved_pct}%</span></div>
          <div class="rec-out"><span class="rec-out-label">Life Extended</span><span class="rec-out-val green">+${rec.outcomes.life_extension_hrs}h</span></div>
          <div class="rec-out"><span class="rec-out-label">Confidence</span><span class="rec-out-val blue">${rec.confidence_pct}%</span></div>
        </div>
      </div>`;
  }

  // Wire approve buttons
  document.querySelectorAll('.dec-approve-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const rank = parseInt(btn.dataset.rank);
      try {
        const result = await api.approveDecision(rank, 'Rahul Sharma');
        btn.textContent = '✅ Approved';
        btn.disabled = true;
        btn.style.background = 'linear-gradient(135deg,#00bb66,#008844)';
        showToast(`${result.message} — Dispatched`, 'success');
        // Auto-advance to recovery phase
        setTimeout(() => setPhase(6), 1200);
      } catch (e) {
        showToast('Could not connect to backend', 'warning');
      }
    });
  });
}

function renderWM(wm) {
  const rulEl  = document.getElementById('wm-rul');
  const failEl = document.getElementById('wm-fail');
  if (rulEl)  rulEl.textContent  = wm.rul_hours   != null ? `${wm.rul_hours}h`  : 'N/A';
  if (failEl) failEl.textContent = wm.rul_hours   != null ? `${wm.failure_probability_pct}%` : 'N/A';
  if (rulEl)  rulEl.style.color  = wm.failure_probability_pct > 50 ? '#ff3535' : wm.failure_probability_pct > 15 ? '#ff6b35' : '#00ff88';
  if (failEl) failEl.style.color = wm.failure_probability_pct > 50 ? '#ff3535' : wm.failure_probability_pct > 15 ? '#ff6b35' : '#00ff88';
}

function renderMachineBar(machine, snapshot) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('mb-machine',  `${machine.id} — ${machine.name}`);
  set('mb-plant',    machine.plant);
  set('mb-operator', machine.operator);
  set('mb-time',     `${snapshot.timestamp}  |  ${machine.shift}`);
  const statusEl = document.getElementById('mb-status');
  const healthEl = document.getElementById('mb-health');
  if (statusEl) {
    statusEl.textContent = STATUS_LABEL[snapshot.status] ?? snapshot.status.toUpperCase();
    statusEl.style.color = STATUS_COLOR[snapshot.status];
  }
  if (healthEl) {
    healthEl.textContent = `${snapshot.health_score}%`;
    healthEl.style.color = snapshot.health_score > 80 ? '#00ff88' : snapshot.health_score > 65 ? '#ff6b35' : '#ff3535';
  }
}

function renderNarrative(phase) {
  const el = document.getElementById('stepper-narrative');
  if (!el) return;
  el.innerHTML = `<strong style="color:${STATUS_COLOR[phase.status]}">[${phase.timestamp}] ${phase.label}</strong> — ${phase.narrative}`;
  gsap.fromTo(el, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5 });
}

function renderStepper(phases, currentPhase) {
  const el = document.getElementById('stepper-phases');
  if (!el) return;
  el.innerHTML = phases.map(p => {
    const active = p.phase === currentPhase;
    const color  = STATUS_COLOR[p.status];
    return `
      <button class="stepper-btn ${active ? 'stepper-active' : ''}"
              data-phase="${p.phase}"
              style="${active ? `border-color:${color};box-shadow:0 0 12px ${color}44;color:${color}` : ''}">
        <span class="stepper-num">${p.phase}</span>
        <span class="stepper-name">${p.label}</span>
        <span class="stepper-time">${p.timestamp}</span>
      </button>`;
  }).join('');

  document.querySelectorAll('.stepper-btn').forEach(btn => {
    btn.addEventListener('click', () => setPhase(parseInt(btn.dataset.phase)));
  });
}

function updateDashboardCards(snapshot) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('dc-health', `${snapshot.health_score}%`);
  const dc = document.getElementById('dc-health');
  if (dc) dc.style.color = snapshot.health_score > 80 ? '#00ff88' : snapshot.health_score > 65 ? '#ff6b35' : '#ff3535';
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
function addChatBubble(text, role) {
  const log = document.getElementById('chat-log');
  if (!log) return;
  const div = document.createElement('div');
  div.className = `chat-bubble ${role === 'ai' ? 'ai-bubble' : 'user-bubble'}`;
  div.innerHTML = role === 'ai'
    ? `<strong>ForgeMind AI</strong><br/>${text.replace(/\n/g, '<br/>')}`
    : `<strong>Engineer</strong><br/>${text}`;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
  gsap.fromTo(div, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3 });
}

async function sendChat(msg) {
  if (!msg.trim()) return;
  addChatBubble(msg, 'user');
  const input = document.getElementById('chat-input');
  if (input) input.value = '';
  try {
    const data = await api.chat(msg);
    addChatBubble(`${data.answer}\n\n_Confidence: ${data.confidence_pct}% | Latency: ${data.latency_ms}ms_`, 'ai');
  } catch {
    addChatBubble('Backend not reachable. Run `npm run server` in a separate terminal.', 'ai');
  }
}

// ─── Phase control ────────────────────────────────────────────────────────────
async function setPhase(phase) {
  try {
    await api.setPhase(phase);
    await refreshAll();
  } catch {
    showToast('Backend not reachable — run npm run server', 'warning');
  }
}

// ─── Main data refresh ────────────────────────────────────────────────────────
async function refreshAll() {
  try {
    const [machineData, sensorData, wmData, chainData, decData, tlData, phasesData] = await Promise.all([
      api.machine(),
      api.sensors(),
      api.worldModel(),
      api.causalChain(),
      api.decisions(),
      api.timeline(),
      api.phases(),
    ]);

    renderMachineBar(machineData.machine, machineData);
    renderNarrative({ timestamp: machineData.timestamp, label: phasesData.phases.find(p => p.phase === machineData.current_phase)?.label ?? '', status: machineData.status, narrative: machineData.narrative });
    renderStepper(phasesData.phases, machineData.current_phase);
    renderSensors(sensorData.readings);
    renderWM(wmData);
    renderCausalChain(chainData.causal_chain);
    renderTimeline(tlData.timeline, machineData);
    renderDecisions(decData);
    updateDashboardCards(machineData);

    // Update dc-rul
    const rulEl = document.getElementById('dc-rul');
    if (rulEl) rulEl.textContent = wmData.rul_hours != null ? `${wmData.rul_hours}h` : 'N/A';

  } catch (err) {
    console.warn('ForgeMind backend not reachable:', err.message);
    showBackendOfflineState();
  }
}

function showBackendOfflineState() {
  const narrative = document.getElementById('stepper-narrative');
  if (narrative) narrative.innerHTML = `<span style="color:#ff6b35">⚠️ Backend offline — run <code>npm run server</code> in a second terminal to see live data</span>`;
}

// ─── Toast notification ───────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  document.querySelector('.fm-notification')?.remove();
  const el = document.createElement('div');
  el.className = 'fm-notification';
  const color = type === 'success' ? '#00ff88' : '#ff6b35';
  Object.assign(el.style, {
    position: 'fixed', bottom: '2rem', right: '2rem',
    background: `${color}18`, border: `1px solid ${color}44`,
    color, padding: '0.9rem 1.5rem', borderRadius: '10px',
    fontSize: '0.88rem', fontWeight: '600', zIndex: '9999',
    backdropFilter: 'blur(12px)', maxWidth: '380px',
  });
  el.textContent = (type === 'success' ? '✅ ' : '⚡ ') + msg;
  document.body.appendChild(el);
  gsap.fromTo(el, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 });
  setTimeout(() => gsap.to(el, { opacity: 0, duration: 0.4, onComplete: () => el.remove() }), 4000);
}

// ─── Public init ──────────────────────────────────────────────────────────────
export function initDemo() {
  // Inject demo section before footer
  const footer = document.querySelector('.footer');
  if (!footer) return;
  footer.insertAdjacentHTML('beforebegin', buildDemoHTML());

  // Initial data load
  refreshAll();

  // SSE stream for live updates
  const stream = openStream((data) => {
    if (data.type === 'phase_change' || data.type === 'connected') {
      refreshAll();
    }
  });

  // Chat wiring
  const sendBtn = document.getElementById('chat-send');
  const inputEl = document.getElementById('chat-input');
  if (sendBtn) sendBtn.addEventListener('click', () => sendChat(inputEl?.value ?? ''));
  if (inputEl) inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(inputEl.value); });
  document.querySelectorAll('.chat-suggest-btn').forEach(btn => {
    btn.addEventListener('click', () => sendChat(btn.dataset.q));
  });

  // Cleanup on page hide
  window.addEventListener('beforeunload', () => stream.close());
}
