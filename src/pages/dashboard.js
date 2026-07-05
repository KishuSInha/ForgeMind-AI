/**
 * dashboard.js — ForgeMind AI Platform
 * 8-view industrial operating system
 */
import '../styles.css';
import '../auth.css';
import '../dashboard.css';
import { api, openStream } from '../api.js';
import { gsap } from 'gsap';

// ── Auth guard ────────────────────────────────────────────────────────────────
const userRaw = sessionStorage.getItem('fm_user');
if (!userRaw) { window.location.href = '/login.html'; }
const USER = JSON.parse(userRaw || '{}');
const IS_ADMIN = USER.role === 'Administrator';

// ── State ─────────────────────────────────────────────────────────────────────
let currentView  = IS_ADMIN ? 'admin_overview' : 'factory';
let currentPhase = 5;
let liveData     = {};

// ── Sidebar nav HTML per role ─────────────────────────────────────────────────
function buildSidebar() {
  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;

  if (IS_ADMIN) {
    nav.innerHTML = `
      <div class="nav-group-label">Administration</div>
      <a href="#" class="sidebar-link active" data-view="admin_overview">
        <span class="sl-icon">🖥️</span><span class="sl-text">System Overview</span>
      </a>
      <a href="#" class="sidebar-link" data-view="admin_users">
        <span class="sl-icon">👥</span><span class="sl-text">User Management</span>
      </a>
      <a href="#" class="sidebar-link" data-view="admin_audit">
        <span class="sl-icon">📋</span><span class="sl-text">Audit Log</span>
      </a>
      <a href="#" class="sidebar-link" data-view="admin_settings">
        <span class="sl-icon">⚙️</span><span class="sl-text">Platform Settings</span>
      </a>

      <div class="nav-group-label">Operations</div>
      <a href="#" class="sidebar-link" data-view="factory">
        <span class="sl-icon">🏭</span><span class="sl-text">Factory Command</span>
        <span class="sl-badge sl-badge-red" id="badge-alerts">3</span>
      </a>
      <a href="#" class="sidebar-link" data-view="machines">
        <span class="sl-icon">⚙️</span><span class="sl-text">Machine Intelligence</span>
      </a>

      <div class="nav-group-label">AI Engine</div>
      <a href="#" class="sidebar-link" data-view="decisions">
        <span class="sl-icon">⚡</span><span class="sl-text">Decision Intelligence</span>
        <span class="sl-badge sl-badge-orange" id="badge-decisions">1</span>
      </a>
      <a href="#" class="sidebar-link" data-view="fleet">
        <span class="sl-icon">🔗</span><span class="sl-text">Fleet Analytics</span>
      </a>
      <a href="#" class="sidebar-link" data-view="explainai">
        <span class="sl-icon">📊</span><span class="sl-text">Explainable AI</span>
      </a>`;
  } else {
    nav.innerHTML = `
      <div class="nav-group-label">Operations</div>
      <a href="#" class="sidebar-link active" data-view="factory">
        <span class="sl-icon">🏭</span><span class="sl-text">Factory Command Center</span>
        <span class="sl-badge sl-badge-red" id="badge-alerts">3</span>
      </a>
      <a href="#" class="sidebar-link" data-view="machines">
        <span class="sl-icon">⚙️</span><span class="sl-text">Machine Intelligence</span>
      </a>

      <div class="nav-group-label">AI Engine</div>
      <a href="#" class="sidebar-link" data-view="memory">
        <span class="sl-icon">🧠</span><span class="sl-text">Machine Memory</span>
        <span class="sl-tag">★</span>
      </a>
      <a href="#" class="sidebar-link" data-view="worldmodel">
        <span class="sl-icon">🌐</span><span class="sl-text">Industrial World Model</span>
        <span class="sl-tag">★★</span>
      </a>
      <a href="#" class="sidebar-link" data-view="decisions">
        <span class="sl-icon">⚡</span><span class="sl-text">Decision Intelligence</span>
        <span class="sl-tag">★★★</span>
        <span class="sl-badge sl-badge-orange" id="badge-decisions">1</span>
      </a>

      <div class="nav-group-label">Analytics</div>
      <a href="#" class="sidebar-link" data-view="fleet">
        <span class="sl-icon">🔗</span><span class="sl-text">Fleet Learning</span>
      </a>
      <a href="#" class="sidebar-link" data-view="explainai">
        <span class="sl-icon">📊</span><span class="sl-text">Explainable AI</span>
      </a>
      <a href="#" class="sidebar-link" data-view="copilot">
        <span class="sl-icon">💬</span><span class="sl-text">Engineering Copilot</span>
      </a>`;
  }

  // Wire sidebar click events
  nav.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      nav.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      navigateTo(link.dataset.view);
    });
  });
}

// ── Populate user info ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('user-name').textContent   = USER.name   ?? 'Engineer';
  document.getElementById('user-role').textContent   = USER.role   ?? '';
  document.getElementById('user-avatar').textContent = USER.initials ?? 'U';

  // Add admin badge to topbar if admin
  if (IS_ADMIN) {
    const topbarRight = document.querySelector('.topbar-right');
    if (topbarRight) {
      const badge = document.createElement('div');
      badge.className = 'admin-topbar-badge';
      badge.innerHTML = '🔐 Administrator';
      Object.assign(badge.style, {
        background: 'rgba(74,74,138,0.15)',
        border: '1px solid rgba(74,74,138,0.4)',
        color: '#4a4a8a',
        padding: '0.3rem 0.8rem',
        borderRadius: '6px',
        fontSize: '0.78rem',
        fontWeight: '700',
        letterSpacing: '0.05em',
      });
      topbarRight.prepend(badge);
    }
  }

  // Build role-specific sidebar
  buildSidebar();

  // Sidebar toggle (mobile)
  document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    sessionStorage.removeItem('fm_user');
    window.location.href = '/';
  });

  // Phase select
  document.getElementById('phase-select')?.addEventListener('change', async (e) => {
    currentPhase = parseInt(e.target.value);
    try { await api.setPhase(currentPhase); } catch {}
    await refreshData();
    renderCurrentView();
  });

  // Initial load
  refreshData().then(() => navigateTo(currentView));

  // SSE stream
  openStream((msg) => {
    if (msg.type === 'phase_change' || msg.type === 'connected') {
      refreshData().then(() => renderCurrentView());
    }
  });
});

// ── Data refresh ──────────────────────────────────────────────────────────────
async function refreshData() {
  try {
    const [machine, sensors, wm, chain, decisions, timeline, phases, memory] = await Promise.all([
      api.machine(), api.sensors(), api.worldModel(), api.causalChain(),
      api.decisions(), api.timeline(), api.phases(), api.memory(),
    ]);
    liveData = { machine, sensors, wm, chain, decisions, timeline, phases, memory };
    // Sync phase select
    if (machine.current_phase) {
      const sel = document.getElementById('phase-select');
      if (sel) sel.value = machine.current_phase;
      currentPhase = machine.current_phase;
    }
    // Update badge
    const alertBadge = document.getElementById('badge-alerts');
    if (alertBadge) {
      const crits = sensors.readings?.filter(r => r.status === 'critical').length ?? 0;
      alertBadge.textContent = crits;
      alertBadge.style.display = crits > 0 ? 'inline-flex' : 'none';
    }
    const decBadge = document.getElementById('badge-decisions');
    if (decBadge) {
      const has = decisions.decisions_active ? '1' : '';
      decBadge.textContent = has; decBadge.style.display = has ? 'inline-flex' : 'none';
    }
  } catch (err) {
    console.warn('Backend offline:', err.message);
  }
}

// ── Navigation ────────────────────────────────────────────────────────────────
const VIEW_TITLES = {
  factory:        'Factory Command Center',
  machines:       'Machine Intelligence',
  memory:         'Machine Memory Engine',
  worldmodel:     'Industrial World Model',
  decisions:      'Decision Intelligence',
  fleet:          'Fleet Learning Dashboard',
  explainai:      'Explainable AI',
  copilot:        'Engineering Copilot',
  // Admin-only
  admin_overview: 'System Overview',
  admin_users:    'User Management',
  admin_audit:    'Audit Log',
  admin_settings: 'Platform Settings',
};

function navigateTo(view) {
  currentView = view;
  document.getElementById('topbar-title').textContent = VIEW_TITLES[view] ?? view;
  renderCurrentView();
  gsap.fromTo('#dash-content', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
}

function renderCurrentView() {
  const el = document.getElementById('dash-content');
  if (!el) return;
  switch (currentView) {
    case 'factory':         el.innerHTML = viewFactory();         break;
    case 'machines':        el.innerHTML = viewMachines();        break;
    case 'memory':          el.innerHTML = viewMemory();          break;
    case 'worldmodel':      el.innerHTML = viewWorldModel();      break;
    case 'decisions':       el.innerHTML = viewDecisions();       break;
    case 'fleet':           el.innerHTML = viewFleet();           break;
    case 'explainai':       el.innerHTML = viewExplainAI();       break;
    case 'copilot':         el.innerHTML = viewCopilot();   initCopilot(); break;
    // Admin views
    case 'admin_overview':  el.innerHTML = viewAdminOverview();   break;
    case 'admin_users':     el.innerHTML = viewAdminUsers();      break;
    case 'admin_audit':     el.innerHTML = viewAdminAudit();      break;
    case 'admin_settings':  el.innerHTML = viewAdminSettings();   wireAdminSettings(); break;
  }
  wireDecisionApprove();
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const SC = { ok: '#1a7a3c', warning: '#b45a00', critical: '#c0000a', action: '#4a4a8a' };
function statusColor(s) { return SC[s] ?? '#777777'; }
function statusIcon(s)  { return s === 'ok' ? '✅' : s === 'warning' ? '⚠️' : s === 'critical' ? '🔴' : '🟣'; }
function sensorBar(val, max, status) {
  const pct = Math.min(100, (val / max) * 100).toFixed(1);
  return `<div class="v-bar-outer"><div class="v-bar-fill" style="width:${pct}%;background:${statusColor(status)}"></div></div>`;
}
function healthRing(score) {
  const color = score > 80 ? '#1a7a3c' : score > 60 ? '#b45a00' : '#c0000a';
  const circ = 2 * Math.PI * 28; const offset = circ * (1 - score / 100);
  return `<svg width="72" height="72" viewBox="0 0 72 72">
    <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="8"/>
    <circle cx="36" cy="36" r="28" fill="none" stroke="${color}" stroke-width="8"
      stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"
      stroke-linecap="round" transform="rotate(-90 36 36)"/>
    <text x="36" y="40" text-anchor="middle" fill="${color}" font-size="13" font-weight="900" font-family="monospace">${score}%</text>
  </svg>`;
}

// ── VIEW 1: Factory Command Center ────────────────────────────────────────────
function viewFactory() {
  const { machine = {}, sensors = {}, wm = {}, decisions = {} } = liveData;
  const s = machine.status ?? 'ok';
  const h = machine.health_score ?? 98;
  const crits  = sensors.readings?.filter(r => r.status === 'critical') ?? [];
  const warns  = sensors.readings?.filter(r => r.status === 'warning') ?? [];
  const sensorRows = (sensors.readings ?? []).map(r => `
    <div class="ft-sensor-row">
      <span class="fts-name">${r.sensor === 'current' ? 'motor load' : r.sensor.replace(/_/g,' ')}</span>
      ${sensorBar(r.value, { temperature:100, vibration:8, current:100, rpm:1600, bearing_health:100, lubrication:100, energy:10, noise:100 }[r.sensor] ?? 100, r.status)}
      <span class="fts-val" style="color:${statusColor(r.status)}">${r.value} ${r.unit}</span>
    </div>`).join('');
  const decActive = decisions.decisions_active;
  const rec = decisions.recommended_action;

  return `
  <div class="view-grid-factory">

    <!-- KPI row -->
    <div class="kpi-row">
      <div class="kpi glass-card"><div class="kpi-num" style="color:${statusColor(s)}">${h}%</div><div class="kpi-label">Machine Health</div></div>
      <div class="kpi glass-card"><div class="kpi-num" style="color:${wm.rul_hours ? (wm.rul_hours < 50 ? '#c0000a' : '#b45a00') : '#1a7a3c'}">${wm.rul_hours ?? 'N/A'}h</div><div class="kpi-label">Remaining Useful Life</div></div>
      <div class="kpi glass-card"><div class="kpi-num" style="color:#c0000a">${crits.length}</div><div class="kpi-label">Critical Alerts</div></div>
      <div class="kpi glass-card"><div class="kpi-num" style="color:#b45a00">${warns.length}</div><div class="kpi-label">Warnings</div></div>
      <div class="kpi glass-card"><div class="kpi-num" style="color:#1a7a3c">94%</div><div class="kpi-label">Factory Efficiency</div></div>
      <div class="kpi glass-card"><div class="kpi-num" style="color:#1a1a1a">126 kWh</div><div class="kpi-label">Energy Today</div></div>
      <div class="kpi glass-card"><div class="kpi-num" style="color:#1a7a3c">98</div><div class="kpi-label">Components Produced</div></div>
      <div class="kpi glass-card dc-highlight"><div class="kpi-num" style="color:#b45a00">58ms</div><div class="kpi-label">Decision Latency</div></div>
    </div>

    <!-- Machine status panel -->
    <div class="factory-row">
      <div class="factory-left">
        <div class="panel glass-card">
          <div class="panel-title">🏭 CNC-01 — ${machine.machine?.plant ?? 'Tata Motors EV Plant'}</div>
          <div class="machine-status-block">
            ${healthRing(h)}
            <div class="msb-info">
              <div class="msb-name">${machine.machine?.name ?? 'CNC Milling Machine #CNC-01'}</div>
              <div class="msb-line">${machine.machine?.location ?? 'Line 3 — Pune'}</div>
              <div class="msb-op">Operator: <strong>${machine.machine?.operator ?? 'Rahul Sharma'}</strong> · ${machine.machine?.shift ?? 'Morning Shift'}</div>
              <div class="msb-status" style="color:${statusColor(s)}">
                ${statusIcon(s)} ${s.toUpperCase()} · ${machine.timestamp ?? '11:00'}
              </div>
              <div class="msb-narrative">${machine.narrative ?? ''}</div>
            </div>
          </div>
        </div>
        <div class="panel glass-card">
          <div class="panel-title">📡 Sensor Overview</div>
          <div class="ft-sensor-grid">${sensorRows}</div>
        </div>
      </div>
      <div class="factory-right">
        <div class="panel glass-card">
          <div class="panel-title">⚡ Active Recommendation</div>
          ${decActive && rec ? `
          <div class="factory-rec">
            <div class="factory-rec-badge">Decision Intelligence Active</div>
            <div class="factory-rec-action">${rec.action}</div>
            <div class="factory-rec-meta">
              <span style="color:#1a7a3c">₹${rec.outcomes.cost_saved_inr.toLocaleString('en-IN')} saved</span>
              <span style="color:#1a1a1a">${rec.confidence_pct}% confidence</span>
              <span style="color:#b45a00">${rec.outcomes.energy_saved_pct}% less energy</span>
            </div>
            <button class="btn btn-primary btn-sm approve-btn-factory" data-rank="${rec.rank}">✅ Approve Action</button>
          </div>` : `<div class="factory-rec-empty">No active recommendations. Machine operating normally.</div>`}
        </div>
        <div class="panel glass-card">
          <div class="panel-title">⏱ Shift Timeline</div>
          <div class="factory-timeline">
            ${(liveData.timeline?.timeline ?? []).map(t => `
            <div class="ftl-row">
              <span class="ftl-time">${t.time}</span>
              <span class="ftl-dot" style="background:${statusColor(t.status)};box-shadow:0 0 5px ${statusColor(t.status)}"></span>
              <span class="ftl-ev" style="color:${t.health <= h + 3 ? statusColor(t.status) : '#777777'}">${t.event}</span>
              <span class="ftl-h" style="color:${statusColor(t.status)}">${t.health}%</span>
            </div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

// ── VIEW 2: Machine Intelligence ──────────────────────────────────────────────
function viewMachines() {
  const { machine = {}, sensors = {}, wm = {} } = liveData;
  const h = machine.health_score ?? 98;
  const MACHINES = [
    { id:'CNC-01',  name:'CNC Milling Center 07',    health: h,   status: machine.status ?? 'ok', learning: 153, rul: wm.rul_hours ?? 'N/A', decision: machine.ai_decision ?? 'Continue', confidence: 96 },
    { id:'HYD-02',  name:'Hydraulic Press Line 2',   health: 91,  status: 'ok',      learning: 89,  rul: 'N/A', decision: 'Continue Production', confidence: 99 },
    { id:'CONV-05', name:'Conveyor Belt Assembly 05', health: 88,  status: 'ok',      learning: 44,  rul: 'N/A', decision: 'Continue Production', confidence: 97 },
    { id:'ROB-11',  name:'Welding Robot Station 11',  health: 54,  status: 'critical',learning: 201, rul: '12h', decision: 'Replace Joint Bearing', confidence: 91 },
    { id:'HVAC-01', name:'Industrial HVAC Unit 01',   health: 67,  status: 'warning', learning: 312, rul: '48h', decision: 'Schedule Filter Service', confidence: 87 },
    { id:'CNC-03',  name:'CNC Machining Center 03',   health: 96,  status: 'ok',      learning: 72,  rul: 'N/A', decision: 'Continue Production', confidence: 99 },
  ];
  return `
  <div class="view-machines">
    <div class="machines-grid">
      ${MACHINES.map(m => `
      <div class="machine-card glass-card ${m.status === 'critical' ? 'mc-critical' : m.status === 'warning' ? 'mc-warning' : ''}">
        <div class="mc-header">
          <div class="mc-id">${m.id}</div>
          <div class="mc-status-dot" style="background:${statusColor(m.status)};box-shadow:0 0 8px ${statusColor(m.status)}"></div>
        </div>
        <div class="mc-name">${m.name}</div>
        <div class="mc-health-ring">${healthRing(m.health)}</div>
        <div class="mc-stats">
          <div class="mc-stat"><div class="mc-stat-label">Learning Score</div><div class="mc-stat-val" style="color:#1a1a1a">${m.learning} cycles</div></div>
          <div class="mc-stat"><div class="mc-stat-label">RUL</div><div class="mc-stat-val" style="color:${m.rul === 'N/A' ? '#1a7a3c' : '#b45a00'}">${m.rul}</div></div>
          <div class="mc-stat"><div class="mc-stat-label">Confidence</div><div class="mc-stat-val" style="color:#1a7a3c">${m.confidence}%</div></div>
        </div>
        <div class="mc-decision">
          <div class="mc-dec-label">Active Decision</div>
          <div class="mc-dec-val" style="color:${m.status === 'ok' ? '#777777' : statusColor(m.status)}">${m.decision}</div>
        </div>
        ${m.id === 'CNC-01' ? `<div class="mc-live-badge">LIVE DATA</div>` : ''}
      </div>`).join('')}
    </div>
  </div>`;
}

// ── VIEW 3: Machine Memory ────────────────────────────────────────────────────
function viewMemory() {
  const { memory = {} } = liveData;
  const mem = memory.memory ?? {};
  const hist = mem.historical_alerts ?? [];
  const ops  = mem.operator_patterns ?? [];
  return `
  <div class="view-memory">
    <div class="memory-hero glass-card">
      <div class="mh-icon">🧠</div>
      <div class="mh-text">
        <div class="mh-title">Machine Memory Engine — CNC-01</div>
        <div class="mh-sub">Inspired by <strong style="color:#1a1a1a">Mind Robotics</strong> · Machines learn from experience instead of fixed programming</div>
      </div>
      <div class="mh-badge">${mem.total_cycles ?? 153} Learning Cycles</div>
    </div>
    <div class="memory-grid">
      <div class="panel glass-card">
        <div class="panel-title">🔧 Machine Identity & Experience</div>
        <div class="mem-table">
          <div class="mt-row"><span class="mt-k">Machine ID</span><span class="mt-v">CNC-01</span></div>
          <div class="mt-row"><span class="mt-k">Learning Cycles</span><span class="mt-v" style="color:#1a1a1a">${mem.total_cycles ?? 153}</span></div>
          <div class="mt-row"><span class="mt-k">Bearing Replaced</span><span class="mt-v">${mem.bearing_replaced ?? '28 Jan 2024'}</span></div>
          <div class="mt-row"><span class="mt-k">Bearing Life Hours</span><span class="mt-v">${mem.bearing_life_hours ?? 720} hrs</span></div>
          <div class="mt-row"><span class="mt-k">Current Runtime</span><span class="mt-v" style="color:#b45a00">${mem.current_runtime_hours ?? 682} hrs</span></div>
          <div class="mt-row warn-row"><span class="mt-k">Runtime vs Life</span><span class="mt-v" style="color:#b45a00">${mem.current_runtime_hours ?? 682} / ${mem.bearing_life_hours ?? 720} hrs (${Math.round((682/720)*100)}%)</span></div>
          <div class="mt-row"><span class="mt-k">Humidity at Failure</span><span class="mt-v">${mem.humidity_at_failure ?? '72%'}</span></div>
          <div class="mt-row"><span class="mt-k">Material Processed</span><span class="mt-v">${mem.material ?? 'Cast Iron'}</span></div>
        </div>
      </div>
      <div class="panel glass-card">
        <div class="panel-title">📋 Previous Failures (Repair Timeline)</div>
        <div class="repair-timeline">
          ${hist.map((h, i) => `
          <div class="rt-entry">
            <div class="rt-dot" style="background:${i===0?'#c0000a':'#b45a00'}"></div>
            <div class="rt-body">
              <div class="rt-date">${h.date}</div>
              <div class="rt-type">${h.type}</div>
              <div class="rt-action">Action: <strong>${h.action}</strong></div>
              <div class="rt-down">Downtime: <span style="color:#b45a00">${h.downtime_hrs}h</span></div>
            </div>
          </div>`).join('')}
        </div>
        <div class="mem-pattern glass-card">
          <div class="panel-title" style="color:#b45a00">⚠️ Pattern Match</div>
          <p style="font-size:0.82rem;color:#8892aa;line-height:1.6">${mem.previous_failure_pattern ?? 'Similar vibration pattern detected'}</p>
        </div>
      </div>
      <div class="panel glass-card">
        <div class="panel-title">👷 Operator Behaviour Memory</div>
        ${ops.map(op => `
        <div class="op-row">
          <span class="op-shift">${op.shift} Shift</span>
          <div class="op-bar-outer"><div class="op-bar-fill" style="width:${op.avg_load}"></div></div>
          <span class="op-load">${op.avg_load} avg</span>
          <span class="op-inc" style="color:${op.incidents>1?'#b45a00':'#1a7a3c'}">${op.incidents} incidents</span>
        </div>`).join('')}
        <div class="mem-insight">
          <span class="mi-label">Memory Insight</span>
          <p>Morning shift consistently shows higher load factors and more bearing incidents. AI adjusts warning thresholds accordingly.</p>
        </div>
      </div>
      <div class="panel glass-card">
        <div class="panel-title">📈 Production History</div>
        <div class="prod-sparkline">
          ${[98,102,97,105,99,101,98,103,96,98,97,95,88,81,72,64].map((v,i) => `
          <div class="spark-bar" style="height:${v}%;background:${v<70?'#c0000a':v<85?'#b45a00':'#1a7a3c'};opacity:${i===15?1:0.6}" title="Phase ${i}: Health ${v}%"></div>
          `).join('')}
        </div>
        <div class="prod-labels"><span>Shift Start 09:00</span><span>Current 11:00</span></div>
        <div class="prod-stats">
          <div class="ps-item"><span>Components Produced</span><strong>98</strong></div>
          <div class="ps-item"><span>Avg Cycle Time</span><strong>5.2s</strong></div>
          <div class="ps-item"><span>Quality Rate</span><strong>99.1%</strong></div>
        </div>
      </div>
    </div>
  </div>`;
}

// ── VIEW 4: Industrial World Model ────────────────────────────────────────────
function viewWorldModel() {
  const { wm = {}, chain = {} } = liveData;
  const nodes = chain.causal_chain ?? [];
  const failP = wm.failure_probability_pct ?? 0;
  const rul   = wm.rul_hours ?? null;
  return `
  <div class="view-worldmodel">
    <div class="wm-hero glass-card">
      <div class="wm-hero-inner">
        <div>
          <div class="wm-hero-title">🌐 Industrial World Model — CNC-01</div>
          <div class="wm-hero-sub">Inspired by <strong style="color:#4a4a8a">AMI / Yann LeCun</strong> · AI reasons about the physical world and predicts future machine states</div>
        </div>
        <div class="wm-hero-stats">
          <div class="wms"><div class="wms-num" style="color:${rul && rul < 50 ? '#c0000a' : '#b45a00'}">${rul ?? 'N/A'}h</div><div class="wms-label">Remaining Useful Life</div></div>
          <div class="wms"><div class="wms-num" style="color:${failP > 50 ? '#c0000a' : failP > 15 ? '#b45a00' : '#1a7a3c'}">${failP}%</div><div class="wms-label">Failure Probability</div></div>
          <div class="wms"><div class="wms-num" style="color:#1a7a3c">94%</div><div class="wms-label">Model Accuracy</div></div>
        </div>
      </div>
    </div>

    <div class="wm-grid">
      <div class="panel glass-card">
        <div class="panel-title">🔗 Causal Chain — Physical State Evolution</div>
        <div class="causal-visual">
          ${nodes.map((n, i) => `
          <div class="cv-node ${n.status}" style="animation-delay:${i*0.1}s">
            <div class="cv-step">${n.step}</div>
            <div class="cv-content">
              <div class="cv-name" style="color:${statusColor(n.status)}">${n.node}</div>
              <div class="cv-val">${n.value}</div>
            </div>
          </div>
          ${i < nodes.length - 1 ? `<div class="cv-arrow" style="color:${statusColor(n.status)}">↓</div>` : ''}`).join('')}
        </div>
      </div>

      <div class="panel glass-card">
        <div class="panel-title">🔬 Physics Reasoning</div>
        <div class="physics-text">${wm.physics_reasoning ?? 'World Model not yet active for this phase.'}</div>

        <div class="panel-title" style="margin-top:1.5rem">📊 Predicted State Evolution</div>
        <div class="state-evolution">
          <div class="se-row"><span class="se-label">Machine</span><span class="se-val" style="color:#1a1a1a">CNC-01 · Active</span></div>
          <div class="se-arrow">↓ Heat Generation</div>
          <div class="se-row"><span class="se-label">Heat</span><span class="se-val" style="color:#b45a00">83°C → Est. 91°C in 1h</span></div>
          <div class="se-arrow">↓ Thermal Load</div>
          <div class="se-row"><span class="se-label">Load</span><span class="se-val" style="color:#b45a00">+21% above baseline</span></div>
          <div class="se-arrow">↓ Mechanical Stress</div>
          <div class="se-row"><span class="se-label">Stress</span><span class="se-val" style="color:#c0000a">Bearing race wear +38%</span></div>
          <div class="se-arrow">↓ Future State Prediction</div>
          <div class="se-row se-prediction"><span class="se-label">Future State</span><span class="se-val" style="color:#c0000a">Bearing failure in ~${rul ?? '?'}h</span></div>
        </div>
      </div>

      <div class="panel glass-card">
        <div class="panel-title">📉 RUL Trajectory</div>
        <div class="rul-chart">
          ${[98,91,82,72,64,81].map((h,i) => {
            const labels=['09:00','09:30','10:00','10:30','11:00','11:45'];
            return `<div class="rul-col">
              <div class="rul-bar-wrap"><div class="rul-bar" style="height:${h}%;background:${h>80?'#1a7a3c':h>65?'#b45a00':'#c0000a'}"></div></div>
              <div class="rul-label">${labels[i]}</div>
              <div class="rul-val" style="color:${h>80?'#1a7a3c':h>65?'#b45a00':'#c0000a'}">${h}%</div>
            </div>`;}).join('')}
        </div>
        <div class="rul-legend">
          <span style="color:#1a7a3c">■ Healthy (&gt;80%)</span>
          <span style="color:#b45a00">■ Warning (65–80%)</span>
          <span style="color:#c0000a">■ Critical (&lt;65%)</span>
        </div>
      </div>
    </div>
  </div>`;
}

// ── VIEW 5: Decision Intelligence ─────────────────────────────────────────────
function viewDecisions() {
  const { decisions = {} } = liveData;
  const list = decisions.decisions ?? [];
  const rec  = decisions.recommended_action;
  return `
  <div class="view-decisions">
    <div class="dec-hero glass-card">
      <div class="dh-left">
        <div class="dh-title">⚡ Decision Intelligence Engine — CNC-01</div>
        <div class="dh-sub">Inspired by <strong style="color:#b45a00">Project Prometheus</strong> · AI evaluates multiple engineering actions and assists engineers in selecting the optimal decision</div>
      </div>
      <div class="dh-right">
        <div class="dh-stat"><div class="dhs-num" style="color:#b45a00">${decisions.evaluated_count ?? 0}</div><div class="dhs-label">Actions Evaluated</div></div>
        <div class="dh-stat"><div class="dhs-num" style="color:#1a1a1a">${decisions.recommendation_latency_ms ?? 58}ms</div><div class="dhs-label">Decision Latency</div></div>
      </div>
    </div>

    ${!decisions.decisions_active ? `
    <div class="dec-inactive-notice glass-card">
      <p>Decision Intelligence activates when a critical or warning condition is detected. Switch to <strong>Phase 5</strong> to see it in action.</p>
    </div>` : ''}

    <div class="decisions-main">
      <div class="dec-actions-col">
        <div class="panel-title">Ranked Engineering Actions</div>
        ${list.map(d => {
          const oc = d.outcomes;
          const saving = oc.cost_saved_inr > 0;
          return `
          <div class="dec-full-card glass-card ${d.recommended ? 'dec-full-recommended' : ''}">
            <div class="dfc-header">
              <div class="dfc-rank ${d.recommended ? 'dfc-rank-top' : ''}">${d.rank}</div>
              <div class="dfc-action">${d.action}</div>
              <div class="dfc-conf ${d.recommended ? 'dfc-conf-top' : ''}">${d.confidence_pct}%</div>
              ${d.recommended ? '<div class="dfc-rec-badge">AI RECOMMENDED</div>' : ''}
            </div>
            <div class="dfc-desc">${d.description}</div>
            <div class="dfc-metrics">
              <div class="dfc-m"><span class="dfc-ml">Cost</span><span class="dfc-mv">${d.cost_inr > 0 ? `₹${d.cost_inr.toLocaleString('en-IN')}` : '₹0'}</span></div>
              <div class="dfc-m"><span class="dfc-ml">Downtime</span><span class="dfc-mv">${d.downtime_min}min</span></div>
              <div class="dfc-m"><span class="dfc-ml">Energy Δ</span><span class="dfc-mv" style="color:${d.energy_change_pct < 0 ? '#1a7a3c' : '#b45a00'}">${d.energy_change_pct > 0 ? '+' : ''}${d.energy_change_pct}%</span></div>
              <div class="dfc-m"><span class="dfc-ml">Life Δ</span><span class="dfc-mv" style="color:${oc.life_extension_hrs > 0 ? '#1a7a3c' : '#c0000a'}">${oc.life_extension_hrs > 0 ? '+' : ''}${oc.life_extension_hrs}h</span></div>
              <div class="dfc-m"><span class="dfc-ml">Saves</span><span class="dfc-mv" style="color:${saving ? '#1a7a3c' : '#c0000a'}">${saving ? '₹' + oc.cost_saved_inr.toLocaleString('en-IN') : '₹0'}</span></div>
              <div class="dfc-m"><span class="dfc-ml">Downtime Prev.</span><span class="dfc-mv" style="color:${oc.downtime_prevented_hrs > 0 ? '#1a7a3c' : '#c0000a'}">${oc.downtime_prevented_hrs > 0 ? oc.downtime_prevented_hrs + 'h' : '—'}</span></div>
            </div>
            ${d.recommended ? `<button class="btn btn-primary approve-btn" data-rank="${d.rank}">✅ Approve &amp; Execute</button>` : `<button class="btn btn-secondary override-btn" data-rank="${d.rank}">Select Action ${d.rank}</button>`}
          </div>`;
        }).join('')}
      </div>

      ${rec ? `
      <div class="dec-summary-col">
        <div class="panel glass-card dec-summary-panel">
          <div class="panel-title">⚡ AI Recommendation Summary</div>
          <div class="rec-action-name">${rec.action}</div>
          <div class="rec-summary-grid">
            <div class="rsg"><div class="rsg-val" style="color:#1a7a3c">₹${rec.outcomes.cost_saved_inr.toLocaleString('en-IN')}</div><div class="rsg-label">Estimated Savings</div></div>
            <div class="rsg"><div class="rsg-val" style="color:#1a7a3c">${rec.outcomes.downtime_prevented_hrs}h</div><div class="rsg-label">Downtime Prevented</div></div>
            <div class="rsg"><div class="rsg-val" style="color:#1a7a3c">${rec.outcomes.energy_saved_pct}%</div><div class="rsg-label">Energy Saved</div></div>
            <div class="rsg"><div class="rsg-val" style="color:#1a1a1a">+${rec.outcomes.life_extension_hrs}h</div><div class="rsg-label">Machine Life Extended</div></div>
            <div class="rsg"><div class="rsg-val" style="color:#1a7a3c">${rec.confidence_pct}%</div><div class="rsg-label">Confidence</div></div>
            <div class="rsg"><div class="rsg-val" style="color:#b45a00">${decisions.recommendation_latency_ms ?? 58}ms</div><div class="rsg-label">Decision Latency</div></div>
          </div>
          <div class="rec-vs">
            <div class="rv-row"><span class="rv-label">Without action:</span><span style="color:#c0000a">Bearing failure in ~22h · ₹21,400 unplanned downtime</span></div>
            <div class="rv-row"><span class="rv-label">With RPM reduction:</span><span style="color:#1a7a3c">RUL extended to ~170h · Production continues</span></div>
          </div>
        </div>
        <div class="panel glass-card">
          <div class="panel-title">📋 Decision Log</div>
          <div id="decision-log-list" class="decision-log">
            <p style="color:#8892aa;font-size:0.82rem">No actions approved yet this session.</p>
          </div>
        </div>
      </div>` : ''}
    </div>
  </div>`;
}

// ── VIEW 6: Fleet Learning ────────────────────────────────────────────────────
function viewFleet() {
  const FLEET = [
    { id:'CNC-01',  health:64, cycles:153, shared:12, plant:'Pune',    status:'critical' },
    { id:'HYD-02',  health:91, cycles:89,  shared:8,  plant:'Pune',    status:'ok'       },
    { id:'CONV-05', health:88, cycles:44,  shared:3,  plant:'Pune',    status:'ok'       },
    { id:'ROB-11',  health:54, cycles:201, shared:18, plant:'Pune',    status:'critical' },
    { id:'HVAC-01', health:67, cycles:312, shared:31, plant:'Nashik',  status:'warning'  },
    { id:'CNC-03',  health:96, cycles:72,  shared:5,  plant:'Chennai', status:'ok'       },
  ];
  return `
  <div class="view-fleet">
    <div class="fleet-header glass-card">
      <div class="fh-title">🔗 Fleet Learning Dashboard</div>
      <div class="fh-sub">Collective intelligence across all monitored assets. Each machine's learning contributes to the fleet model.</div>
      <div class="fh-stats">
        <div class="fhs"><strong style="color:#1a1a1a">6</strong> Machines</div>
        <div class="fhs"><strong style="color:#1a1a1a">871</strong> Total Learning Cycles</div>
        <div class="fhs"><strong style="color:#1a7a3c">77</strong> Shared Failure Patterns</div>
        <div class="fhs"><strong style="color:#4a4a8a">3</strong> Plants</div>
      </div>
    </div>
    <div class="fleet-grid">
      <div class="panel glass-card fleet-tree-panel">
        <div class="panel-title">🏭 Factory Fleet Hierarchy</div>
        <div class="fleet-tree">
          <div class="ft-factory">🏭 Tata Motors EV Component Plants</div>
          <div class="ft-branches">
            ${['Pune Plant (3)', 'Nashik Plant (1)', 'Chennai Plant (2)'].map(p => `
            <div class="ft-plant">
              <span class="ft-plant-name">🏗 ${p}</span>
              <div class="ft-machines">
                ${FLEET.filter(m => {
                  if (p.includes('Pune')) return m.plant === 'Pune';
                  if (p.includes('Nashik')) return m.plant === 'Nashik';
                  return m.plant === 'Chennai';
                }).map(m => `
                <div class="ft-machine-node" style="border-color:${statusColor(m.status)}22">
                  <span class="ftm-dot" style="background:${statusColor(m.status)}"></span>
                  <span class="ftm-id" style="color:${statusColor(m.status)}">${m.id}</span>
                  <span class="ftm-health">${m.health}%</span>
                  <span class="ftm-cycles" style="color:#1a1a1a">${m.cycles} cycles</span>
                </div>`).join('')}
              </div>
            </div>`).join('')}
          </div>
        </div>
      </div>
      <div class="panel glass-card">
        <div class="panel-title">📊 Collective Learning Metrics</div>
        <div class="fleet-learn-table">
          <div class="flt-header"><span>Machine</span><span>Health</span><span>Cycles</span><span>Shared Patterns</span><span>Status</span></div>
          ${FLEET.map(m => `
          <div class="flt-row">
            <span class="flt-id">${m.id}</span>
            <span style="color:${statusColor(m.status)}">${m.health}%</span>
            <span style="color:#1a1a1a">${m.cycles}</span>
            <span style="color:#4a4a8a">${m.shared}</span>
            <span class="flt-status" style="color:${statusColor(m.status)}">${m.status.toUpperCase()}</span>
          </div>`).join('')}
        </div>
      </div>
    </div>
    <div class="fleet-insight glass-card">
      <div class="panel-title">🧬 Fleet-Wide Insight</div>
      <p>CNC-01's current bearing degradation pattern has been <strong style="color:#b45a00">shared with CNC-03, HYD-02, and ROB-11</strong>. These machines now have pre-emptive warning thresholds adjusted. Fleet learning prevents the same failure from occurring twice across any machine in the network.</p>
    </div>
  </div>`;
}

// ── VIEW 7: Explainable AI ────────────────────────────────────────────────────
function viewExplainAI() {
  const { sensors = {}, decisions = {}, wm = {} } = liveData;
  const rec = decisions.recommended_action;
  const readings = sensors.readings ?? [];
  return `
  <div class="view-explainai">
    <div class="xai-hero glass-card">
      <div class="xai-title">📊 Explainable AI Dashboard — CNC-01</div>
      <div class="xai-sub">Every recommendation includes confidence score, sensor contribution, reasoning chain, and predicted outcome</div>
    </div>
    <div class="xai-grid">
      <div class="panel glass-card">
        <div class="panel-title">🔍 Sensor Contribution to Recommendation</div>
        <div class="xai-sensors">
          ${[
            { name:'Vibration RMS', contrib:34, val:'5.7 mm/s', status:'critical' },
            { name:'Temperature',   contrib:28, val:'83°C',     status:'critical' },
            { name:'Motor Current', contrib:19, val:'15.3A',    status:'critical' },
            { name:'Bearing Health',contrib:12, val:'64%',      status:'critical' },
            { name:'Lubrication',   contrib:5,  val:'61%',      status:'ok'       },
            { name:'Noise Level',   contrib:2,  val:'84dB',     status:'critical' },
          ].map(s => `
          <div class="xai-s-row">
            <span class="xai-s-name">${s.name}</span>
            <div class="xai-contrib-bar"><div style="width:${s.contrib}%;background:${statusColor(s.status)};height:100%;border-radius:2px"></div></div>
            <span class="xai-s-contrib" style="color:${statusColor(s.status)}">${s.contrib}%</span>
            <span class="xai-s-val">${s.val}</span>
          </div>`).join('')}
        </div>
      </div>
      <div class="panel glass-card">
        <div class="panel-title">🧠 AI Reasoning Chain</div>
        <div class="reasoning-steps">
          <div class="rs-step"><div class="rs-num">1</div><div><strong>Pattern Recognition</strong><p>Vibration signature matches Jan 2024 bearing failure (87% similarity) from Machine Memory</p></div></div>
          <div class="rs-arrow">↓</div>
          <div class="rs-step"><div class="rs-num">2</div><div><strong>World Model Activation</strong><p>Physics chain: Temperature 83°C → lubrication degradation → bearing contact stress +38%</p></div></div>
          <div class="rs-arrow">↓</div>
          <div class="rs-step"><div class="rs-num">3</div><div><strong>RUL Calculation</strong><p>Bearing health degradation rate: 0.41%/hr. Current: 64%. Threshold: 45%. Time: 46÷0.41 = 86h</p></div></div>
          <div class="rs-arrow">↓</div>
          <div class="rs-step"><div class="rs-num">4</div><div><strong>Decision Simulation</strong><p>4 engineering options evaluated using Monte Carlo simulation (50+ scenarios each)</p></div></div>
          <div class="rs-arrow">↓</div>
          <div class="rs-step rs-final"><div class="rs-num rs-num-final">✓</div><div><strong>Recommendation: Reduce RPM by 10%</strong><p>Optimal Pareto balance of cost (₹0), risk (↓), downtime (0min), life extension (+84h). Confidence: 96%</p></div></div>
        </div>
      </div>
      <div class="panel glass-card">
        <div class="panel-title">🎯 Predicted Outcomes Comparison</div>
        <div class="outcome-compare">
          <div class="oc-col oc-bad">
            <div class="oc-label">Without Action</div>
            <div class="oc-item"><span>RUL</span><strong style="color:#c0000a">22 hours</strong></div>
            <div class="oc-item"><span>Failure Prob.</span><strong style="color:#c0000a">71% in 6h</strong></div>
            <div class="oc-item"><span>Downtime</span><strong style="color:#c0000a">3.2+ hours</strong></div>
            <div class="oc-item"><span>Cost</span><strong style="color:#c0000a">₹21,400 loss</strong></div>
            <div class="oc-item"><span>Energy</span><strong style="color:#c0000a">+18% wasted</strong></div>
          </div>
          <div class="oc-vs">VS</div>
          <div class="oc-col oc-good">
            <div class="oc-label">With RPM Reduction</div>
            <div class="oc-item"><span>RUL</span><strong style="color:#1a7a3c">~170 hours</strong></div>
            <div class="oc-item"><span>Failure Prob.</span><strong style="color:#1a7a3c">8% in 6h</strong></div>
            <div class="oc-item"><span>Downtime</span><strong style="color:#1a7a3c">0 minutes</strong></div>
            <div class="oc-item"><span>Savings</span><strong style="color:#1a7a3c">₹21,400 saved</strong></div>
            <div class="oc-item"><span>Energy</span><strong style="color:#1a7a3c">-9% reduced</strong></div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

// ── VIEW 8: Engineering Copilot ───────────────────────────────────────────────
function viewCopilot() {
  return `
  <div class="view-copilot">
    <div class="copilot-header glass-card">
      <div class="cop-title">💬 Engineering Copilot — CNC-01</div>
      <div class="cop-sub">Ask ForgeMind AI anything about this machine. Powered by Machine Memory + Industrial World Model.</div>
      <div class="cop-context">
        <span class="cop-ctx-item">🧠 153 learning cycles</span>
        <span class="cop-ctx-item">🌐 World Model active</span>
        <span class="cop-ctx-item">⚡ Phase ${currentPhase} data</span>
        <span class="cop-ctx-item">📍 CNC-01 · Pune</span>
      </div>
    </div>
    <div class="copilot-body">
      <div class="copilot-chat-panel glass-card">
        <div id="copilot-log" class="copilot-log">
          <div class="cop-bubble cop-ai">
            <div class="cop-avatar">⬡</div>
            <div class="cop-msg"><strong>ForgeMind AI</strong><br/>I've analysed CNC-01 across 153 learning cycles. The machine is currently in ${currentPhase >= 5 ? 'critical condition' : currentPhase >= 3 ? 'warning state' : 'normal operation'}.<br/><br/>I can explain my recommendations, walk through the physics chain, or help you plan the next maintenance action. What would you like to know?</div>
          </div>
        </div>
        <div class="cop-suggestions">
          <button class="cop-sug" data-q="Why are you recommending reducing RPM?">Why reduce RPM?</button>
          <button class="cop-sug" data-q="What does the bearing health of 64% mean?">What is bearing health 64%?</button>
          <button class="cop-sug" data-q="What is the Remaining Useful Life and how is it calculated?">How is RUL calculated?</button>
          <button class="cop-sug" data-q="What does 23% failure probability mean?">What is 23% failure probability?</button>
          <button class="cop-sug" data-q="What is causing the temperature rise?">Why is temperature rising?</button>
          <button class="cop-sug" data-q="How much energy will we save by reducing RPM?">Energy savings from RPM?</button>
        </div>
        <div class="cop-input-row">
          <div class="cop-input-wrap">
            <input type="text" id="copilot-input" class="cop-input" placeholder="Ask about CNC-01 — bearing health, RUL, temperature, recommendations…" />
            <button id="cop-send" class="cop-send">Send →</button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

// ── Copilot chat wiring ───────────────────────────────────────────────────────
function initCopilot() {
  const log   = document.getElementById('copilot-log');
  const input = document.getElementById('copilot-input');
  const send  = document.getElementById('cop-send');

  function addMsg(text, role) {
    if (!log) return;
    const d = document.createElement('div');
    d.className = `cop-bubble ${role === 'ai' ? 'cop-ai' : 'cop-user'}`;
    d.innerHTML = role === 'ai'
      ? `<div class="cop-avatar">⬡</div><div class="cop-msg"><strong>ForgeMind AI</strong><br/>${text.replace(/\n/g, '<br/>')}</div>`
      : `<div class="cop-avatar user-avatar-sm">${USER.initials ?? 'E'}</div><div class="cop-msg"><strong>${USER.name ?? 'Engineer'}</strong><br/>${text}</div>`;
    log.appendChild(d);
    gsap.fromTo(d, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3 });
    log.scrollTop = log.scrollHeight;
  }

  async function sendMsg(msg) {
    if (!msg.trim()) return;
    addMsg(msg, 'user');
    if (input) input.value = '';
    // Typing indicator
    const typing = document.createElement('div');
    typing.className = 'cop-bubble cop-ai cop-typing';
    typing.innerHTML = '<div class="cop-avatar">⬡</div><div class="cop-msg"><span class="typing-dots"><span>.</span><span>.</span><span>.</span></span></div>';
    log?.appendChild(typing);
    log.scrollTop = log.scrollHeight;
    try {
      const data = await api.chat(msg);
      typing.remove();
      addMsg(`${data.answer}\n\n_Confidence: ${data.confidence_pct}% · Latency: ${data.latency_ms}ms · Source: ${data.source}_`, 'ai');
    } catch {
      typing.remove();
      addMsg('Backend not reachable. Run `npm run server` in a separate terminal to enable the AI assistant.', 'ai');
    }
  }

  send?.addEventListener('click', () => sendMsg(input?.value ?? ''));
  input?.addEventListener('keydown', e => { if (e.key === 'Enter') sendMsg(input.value); });
  document.querySelectorAll('.cop-sug').forEach(btn => {
    btn.addEventListener('click', () => sendMsg(btn.dataset.q));
  });
}

// ── Approve button wiring ─────────────────────────────────────────────────────
function wireDecisionApprove() {
  document.querySelectorAll('.approve-btn, .approve-btn-factory').forEach(btn => {
    btn.addEventListener('click', async () => {
      const rank = parseInt(btn.dataset.rank);
      btn.disabled = true; btn.textContent = 'Processing…';
      try {
        const result = await api.approveDecision(rank, USER.name ?? 'Engineer');
        btn.textContent = '✅ Approved & Executed';
        btn.style.background = 'linear-gradient(135deg,#00bb66,#008844)';
        showToast(`${result.action} approved — dispatched to maintenance`, 'success');
        // Update decision log if visible
        const logEl = document.getElementById('decision-log-list');
        if (logEl) {
          const item = document.createElement('div');
          item.className = 'dl-entry';
          item.innerHTML = `<span class="dl-time">${new Date().toLocaleTimeString()}</span><span class="dl-action">${result.action}</span><span class="dl-by">by ${USER.name ?? 'Engineer'}</span>`;
          logEl.innerHTML = '';
          logEl.appendChild(item);
        }
        setTimeout(() => { api.setPhase(6).then(() => refreshData().then(() => renderCurrentView())); }, 1200);
      } catch { showToast('Backend offline', 'warning'); btn.disabled = false; btn.textContent = '✅ Approve'; }
    });
  });

  document.querySelectorAll('.override-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const rank = parseInt(btn.dataset.rank);
      btn.disabled = true; btn.textContent = 'Processing…';
      try {
        await api.approveDecision(rank, USER.name);
        btn.textContent = '✅ Selected';
        btn.style.borderColor = '#1a7a3c'; btn.style.color = '#1a7a3c';
        showToast(`Action ${rank} selected`, 'success');
      } catch { showToast('Backend offline', 'warning'); btn.disabled = false; btn.textContent = `Select Action ${rank}`; }
    });
  });
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  document.querySelector('.fm-notification')?.remove();
  const el = document.createElement('div');
  el.className = 'fm-notification';
  const c = type === 'success' ? '#1a7a3c' : '#b45a00';
  Object.assign(el.style, { position:'fixed', bottom:'2rem', right:'2rem', background:`${c}18`, border:`1px solid ${c}44`, color:c, padding:'0.9rem 1.5rem', borderRadius:'10px', fontSize:'0.88rem', fontWeight:'600', zIndex:'9999', backdropFilter:'blur(12px)', maxWidth:'380px' });
  el.textContent = (type === 'success' ? '✅ ' : '⚡ ') + msg;
  document.body.appendChild(el);
  gsap.fromTo(el, { opacity:0, y:20 }, { opacity:1, y:0, duration:0.4 });
  setTimeout(() => gsap.to(el, { opacity:0, duration:0.4, onComplete:() => el.remove() }), 4000);
}


// ── ADMIN VIEW 1: System Overview ─────────────────────────────────────────────
function viewAdminOverview() {
  const { sensors = {}, decisions = {} } = liveData;
  const crits = sensors.readings?.filter(r => r.status === 'critical').length ?? 0;
  return `
  <div class="view-admin-overview">
    <div class="admin-hero glass-card" style="border-left:4px solid #4a4a8a">
      <div class="ah-title">🖥️ System Overview — ForgeMind AI Platform</div>
      <div class="ah-sub">Administrator view · Full platform visibility · All operational and system metrics</div>
    </div>

    <div class="admin-kpi-row">
      <div class="admin-kpi glass-card"><div class="akpi-num" style="color:#1a7a3c">6</div><div class="akpi-label">Machines Online</div></div>
      <div class="admin-kpi glass-card"><div class="akpi-num" style="color:#b45a00">2</div><div class="akpi-label">Active Warnings</div></div>
      <div class="admin-kpi glass-card"><div class="akpi-num" style="color:#c0000a">${crits}</div><div class="akpi-label">Critical Alerts</div></div>
      <div class="admin-kpi glass-card"><div class="akpi-num" style="color:#1a1a1a">2</div><div class="akpi-label">Active Users</div></div>
      <div class="admin-kpi glass-card"><div class="akpi-num" style="color:#4a4a8a">871</div><div class="akpi-label">Total Learning Cycles</div></div>
      <div class="admin-kpi glass-card"><div class="akpi-num" style="color:#1a7a3c">99.4%</div><div class="akpi-label">Platform Uptime</div></div>
    </div>

    <div class="admin-grid">
      <div class="panel glass-card">
        <div class="panel-title">🏭 Fleet Health Summary</div>
        <div class="admin-fleet-table">
          <div class="aft-header"><span>Machine</span><span>Plant</span><span>Health</span><span>Status</span><span>RUL</span><span>Last Action</span></div>
          ${[
            { id:'CNC-01', plant:'Pune',    health:64, status:'critical', rul:'86h',  action:'RPM Reduce — Pending' },
            { id:'HYD-02', plant:'Pune',    health:91, status:'ok',       rul:'N/A',  action:'None — Normal' },
            { id:'CONV-05',plant:'Pune',    health:88, status:'ok',       rul:'N/A',  action:'None — Normal' },
            { id:'ROB-11', plant:'Pune',    health:54, status:'critical', rul:'12h',  action:'Joint Bearing — Scheduled' },
            { id:'HVAC-01',plant:'Nashik',  health:67, status:'warning',  rul:'48h',  action:'Filter Service — Due' },
            { id:'CNC-03', plant:'Chennai', health:96, status:'ok',       rul:'N/A',  action:'None — Normal' },
          ].map(m => `
          <div class="aft-row">
            <span class="aft-id">${m.id}</span>
            <span style="color:#8892aa">${m.plant}</span>
            <span style="color:${statusColor(m.status)}">${m.health}%</span>
            <span style="color:${statusColor(m.status)}">${m.status.toUpperCase()}</span>
            <span style="color:${m.rul==='N/A'?'#1a7a3c':'#b45a00'}">${m.rul}</span>
            <span style="color:#8892aa;font-size:0.78rem">${m.action}</span>
          </div>`).join('')}
        </div>
      </div>

      <div class="panel glass-card">
        <div class="panel-title">📡 System Health</div>
        <div class="sys-health-list">
          ${[
            { label:'API Server',          status:'ok',      val:'Running · Port 3001' },
            { label:'SSE Stream',          status:'ok',      val:'2 clients connected' },
            { label:'Machine Memory DB',   status:'ok',      val:'871 cycles · 12.4 MB' },
            { label:'World Model Engine',  status:'ok',      val:'94% accuracy' },
            { label:'Decision Engine',     status:'ok',      val:'58ms avg latency' },
            { label:'Fleet Learning Sync', status:'warning', val:'Nashik plant: 2h delay' },
            { label:'Edge Devices',        status:'ok',      val:'6/6 online · ESP32' },
          ].map(s => `
          <div class="shl-row">
            <span class="shl-dot" style="background:${statusColor(s.status)}"></span>
            <span class="shl-label">${s.label}</span>
            <span class="shl-val" style="color:${statusColor(s.status)}">${s.val}</span>
          </div>`).join('')}
        </div>
      </div>

      <div class="panel glass-card">
        <div class="panel-title">📊 Platform Performance (Last 24h)</div>
        <div class="perf-stats">
          <div class="ps-item"><span>Total API Calls</span><strong style="color:#1a1a1a">4,821</strong></div>
          <div class="ps-item"><span>SSE Events Broadcast</span><strong style="color:#1a1a1a">312</strong></div>
          <div class="ps-item"><span>Avg API Response</span><strong style="color:#1a7a3c">41ms</strong></div>
          <div class="ps-item"><span>Decisions Generated</span><strong style="color:#b45a00">7</strong></div>
          <div class="ps-item"><span>Decisions Approved</span><strong style="color:#1a7a3c">5</strong></div>
          <div class="ps-item"><span>Decisions Overridden</span><strong style="color:#c0000a">2</strong></div>
          <div class="ps-item"><span>Anomalies Detected</span><strong style="color:#b45a00">14</strong></div>
          <div class="ps-item"><span>False Alarms</span><strong style="color:#1a7a3c">0 (0%)</strong></div>
          <div class="ps-item"><span>Cost Savings Today</span><strong style="color:#1a7a3c">₹1,07,000</strong></div>
          <div class="ps-item"><span>Energy Saved</span><strong style="color:#1a7a3c">234 kWh</strong></div>
        </div>
      </div>
    </div>
  </div>`;
}

// ── ADMIN VIEW 2: User Management ────────────────────────────────────────────
function viewAdminUsers() {
  const USERS = [
    { name:'Rahul Sharma',  email:'rahul.sharma@tatamotors.com', role:'Plant Engineer', initials:'RS', plant:'Pune',    status:'active',   last:'Today 11:02', sessions:1 },
    { name:'Admin User',    email:'admin@forgemind.ai',          role:'Administrator',  initials:'AU', plant:'All',     status:'active',   last:'Now',         sessions:1 },
    { name:'Priya Nair',    email:'priya.nair@tatamotors.com',   role:'Plant Engineer', initials:'PN', plant:'Nashik',  status:'inactive', last:'Yesterday',   sessions:0 },
    { name:'Arjun Mehta',   email:'arjun.mehta@tatamotors.com',  role:'Supervisor',     initials:'AM', plant:'Chennai', status:'inactive', last:'2 days ago',  sessions:0 },
  ];
  return `
  <div class="view-admin-users">
    <div class="admin-hero glass-card" style="border-left:4px solid #4a4a8a">
      <div class="ah-title">👥 User Management</div>
      <div class="ah-sub">Manage platform access, roles, and permissions across all plants</div>
    </div>
    <div class="admin-toolbar">
      <div class="at-stats">
        <span class="at-stat" style="color:#1a7a3c">● 2 Active</span>
        <span class="at-stat" style="color:#8892aa">○ 2 Inactive</span>
        <span class="at-stat" style="color:#4a4a8a">4 Total Users</span>
      </div>
      <button class="btn btn-primary btn-sm" onclick="alert('Add user — connect to real auth backend')">+ Add User</button>
    </div>
    <div class="panel glass-card">
      <div class="users-table">
        <div class="ut-header"><span>User</span><span>Role</span><span>Plant</span><span>Status</span><span>Last Active</span><span>Sessions</span><span>Actions</span></div>
        ${USERS.map(u => `
        <div class="ut-row ${u.email === USER.email ? 'ut-row-self' : ''}">
          <div class="ut-user">
            <div class="ut-avatar">${u.initials}</div>
            <div><div class="ut-name">${u.name} ${u.email === USER.email ? '<span class="ut-you">(you)</span>' : ''}</div><div class="ut-email">${u.email}</div></div>
          </div>
          <span class="ut-role" style="color:${u.role==='Administrator'?'#4a4a8a':'#1a1a1a'}">${u.role}</span>
          <span style="color:#8892aa">${u.plant}</span>
          <span style="color:${u.status==='active'?'#1a7a3c':'#8892aa'}">● ${u.status.toUpperCase()}</span>
          <span style="color:#8892aa;font-size:0.8rem">${u.last}</span>
          <span style="color:${u.sessions>0?'#1a7a3c':'#8892aa'}">${u.sessions}</span>
          <div class="ut-actions">
            ${u.email !== USER.email ? `
            <button class="btn-icon" title="Edit" onclick="alert('Edit user: ${u.name}')">✏️</button>
            <button class="btn-icon" title="Disable" onclick="alert('Toggle access: ${u.name}')">🔒</button>` : '<span style="color:#8892aa;font-size:0.75rem">—</span>'}
          </div>
        </div>`).join('')}
      </div>
    </div>
    <div class="panel glass-card">
      <div class="panel-title">🔐 Role Permissions Matrix</div>
      <div class="perm-table">
        <div class="pm-header"><span>Permission</span><span>Plant Engineer</span><span>Supervisor</span><span>Administrator</span></div>
        ${[
          ['View Factory Dashboard',    '✅','✅','✅'],
          ['View Machine Intelligence', '✅','✅','✅'],
          ['View World Model',          '✅','✅','✅'],
          ['Approve AI Decisions',      '✅','✅','✅'],
          ['Override AI Decisions',     '❌','✅','✅'],
          ['Edit Sensor Thresholds',    '❌','❌','✅'],
          ['Manage Users',              '❌','❌','✅'],
          ['View Audit Log',            '❌','✅','✅'],
          ['Export Reports',            '❌','✅','✅'],
          ['Platform Settings',         '❌','❌','✅'],
        ].map(([perm, eng, sup, adm]) => `
        <div class="pm-row">
          <span style="color:#1a1a1a">${perm}</span>
          <span style="text-align:center">${eng}</span>
          <span style="text-align:center">${sup}</span>
          <span style="text-align:center">${adm}</span>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

// ── ADMIN VIEW 3: Audit Log ───────────────────────────────────────────────────
function viewAdminAudit() {
  const LOG = [
    { time:'11:03', user:'Admin User',   action:'Viewed System Overview',              type:'view',     machine:'-' },
    { time:'11:01', user:'Rahul Sharma', action:'Approved Decision: Reduce RPM',        type:'approve',  machine:'CNC-01' },
    { time:'10:58', user:'Rahul Sharma', action:'Switched to Phase 5',                  type:'phase',    machine:'CNC-01' },
    { time:'10:45', user:'Rahul Sharma', action:'Queried AI Copilot: Why reduce RPM?',  type:'chat',     machine:'CNC-01' },
    { time:'10:30', user:'Rahul Sharma', action:'Viewed Decision Intelligence',          type:'view',     machine:'CNC-01' },
    { time:'10:15', user:'Rahul Sharma', action:'Viewed Industrial World Model',         type:'view',     machine:'CNC-01' },
    { time:'10:02', user:'Arjun Mehta', action:'Logged out',                            type:'auth',     machine:'-' },
    { time:'09:58', user:'Arjun Mehta', action:'Overrode Decision: Selected Action 2',  type:'override', machine:'ROB-11' },
    { time:'09:45', user:'Rahul Sharma', action:'Logged in',                            type:'auth',     machine:'-' },
    { time:'09:30', user:'Priya Nair',  action:'Approved Decision: Filter Service',     type:'approve',  machine:'HVAC-01' },
    { time:'09:15', user:'Priya Nair',  action:'Logged in',                             type:'auth',     machine:'-' },
    { time:'09:00', user:'Admin User',  action:'Platform started — Phase reset to 1',   type:'system',   machine:'ALL' },
  ];
  const typeColor = { view:'#8892aa', approve:'#1a7a3c', phase:'#4a4a8a', chat:'#1a1a1a', override:'#b45a00', auth:'#8892aa', system:'#4a4a8a' };
  return `
  <div class="view-admin-audit">
    <div class="admin-hero glass-card" style="border-left:4px solid #4a4a8a">
      <div class="ah-title">📋 Audit Log</div>
      <div class="ah-sub">Full record of all user actions, decisions, and system events · Today's Session</div>
    </div>
    <div class="admin-toolbar">
      <div class="at-stats">
        <span class="at-stat" style="color:#1a7a3c">✅ 2 Decisions Approved</span>
        <span class="at-stat" style="color:#b45a00">⚠️ 1 Override</span>
        <span class="at-stat" style="color:#1a1a1a">12 Total Events</span>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="alert('Export CSV — connect to backend')">↓ Export CSV</button>
    </div>
    <div class="panel glass-card">
      <div class="audit-table">
        <div class="audt-header"><span>Time</span><span>User</span><span>Action</span><span>Type</span><span>Machine</span></div>
        ${LOG.map(l => `
        <div class="audt-row">
          <span class="audt-time">${l.time}</span>
          <span class="audt-user">${l.user}</span>
          <span class="audt-action">${l.action}</span>
          <span class="audt-type" style="color:${typeColor[l.type] ?? '#8892aa'};text-transform:uppercase;font-size:0.72rem;font-weight:700">${l.type}</span>
          <span class="audt-machine" style="color:${l.machine==='-'?'#8892aa':'#1a1a1a'}">${l.machine}</span>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

// ── ADMIN VIEW 4: Platform Settings ──────────────────────────────────────────
function viewAdminSettings() {
  return `
  <div class="view-admin-settings">
    <div class="admin-hero glass-card" style="border-left:4px solid #4a4a8a">
      <div class="ah-title">⚙️ Platform Settings</div>
      <div class="ah-sub">Configure sensor thresholds, alert policies, AI parameters, and integrations</div>
    </div>

    <div class="settings-grid">
      <div class="panel glass-card">
        <div class="panel-title">🌡️ Sensor Thresholds — CNC-01</div>
        <div class="settings-note" style="color:#b45a00;font-size:0.8rem;margin-bottom:1rem">⚠️ Changes apply to all phases immediately</div>
        <div class="threshold-form">
          ${[
            { key:'temperature',    label:'Temperature',    unit:'°C',   warn:80,  crit:90  },
            { key:'vibration',      label:'Vibration RMS',  unit:'mm/s', warn:4.0, crit:5.5 },
            { key:'current',        label:'Motor Current',  unit:'A',    warn:13,  crit:16  },
            { key:'bearing_health', label:'Bearing Health', unit:'%',    warn:70,  crit:55  },
          ].map(t => `
          <div class="tf-row">
            <span class="tf-label">${t.label}</span>
            <div class="tf-inputs">
              <label>Warning <input type="number" class="threshold-input" data-key="${t.key}" data-level="warning" value="${t.warn}" step="0.5" /> ${t.unit}</label>
              <label>Critical <input type="number" class="threshold-input" data-key="${t.key}" data-level="critical" value="${t.crit}" step="0.5" /> ${t.unit}</label>
            </div>
          </div>`).join('')}
          <button class="btn btn-primary btn-sm" id="save-thresholds-btn" style="margin-top:1rem">💾 Save Thresholds</button>
        </div>
      </div>

      <div class="panel glass-card">
        <div class="panel-title">🤖 AI Engine Parameters</div>
        <div class="threshold-form">
          <div class="tf-row">
            <span class="tf-label">Min Decision Confidence</span>
            <div class="tf-inputs"><input type="number" class="threshold-input" value="75" min="50" max="99" /> %</div>
          </div>
          <div class="tf-row">
            <span class="tf-label">RUL Warning Threshold</span>
            <div class="tf-inputs"><input type="number" class="threshold-input" value="120" /> hours</div>
          </div>
          <div class="tf-row">
            <span class="tf-label">Decision Latency Target</span>
            <div class="tf-inputs"><input type="number" class="threshold-input" value="100" /> ms</div>
          </div>
          <div class="tf-row">
            <span class="tf-label">Auto-approve Low-Risk Actions</span>
            <div class="tf-inputs"><select class="threshold-input"><option>Disabled</option><option>Confidence &gt; 95%</option><option>All low-risk</option></select></div>
          </div>
          <button class="btn btn-primary btn-sm" style="margin-top:1rem" onclick="alert('AI parameters saved')">💾 Save AI Config</button>
        </div>
      </div>

      <div class="panel glass-card">
        <div class="panel-title">🔗 Integrations</div>
        <div class="integrations-list">
          ${[
            { name:'PLC / SCADA',   status:'connected',    detail:'Siemens S7-1500 · Pune Plant' },
            { name:'SAP PM',        status:'disconnected', detail:'Not configured' },
            { name:'ServiceNow',    status:'connected',    detail:'Work order auto-dispatch active' },
            { name:'InfluxDB',      status:'connected',    detail:'Time-series · Port 8086' },
            { name:'MQTT Broker',   status:'connected',    detail:'mosquitto · Port 1883' },
            { name:'Email Alerts',  status:'connected',    detail:'maintenance@tatamotors.com' },
          ].map(i => `
          <div class="int-row">
            <span class="int-dot" style="background:${i.status==='connected'?'#1a7a3c':'#c0000a'}"></span>
            <span class="int-name">${i.name}</span>
            <span class="int-detail" style="color:#8892aa">${i.detail}</span>
            <span class="int-status" style="color:${i.status==='connected'?'#1a7a3c':'#c0000a'};font-size:0.75rem;font-weight:700">${i.status.toUpperCase()}</span>
          </div>`).join('')}
        </div>
      </div>

      <div class="panel glass-card">
        <div class="panel-title">🗑️ Danger Zone</div>
        <div class="danger-zone">
          <div class="dz-item">
            <div><strong>Reset Demo Phase</strong><p>Return all machines to Phase 1 (Healthy)</p></div>
            <button class="btn btn-danger btn-sm" onclick="if(confirm('Reset all phases to Phase 1?')) { fetch('/api/phase',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phase:1})}); alert('Phase reset to 1'); }">Reset</button>
          </div>
          <div class="dz-item">
            <div><strong>Clear Decision Log</strong><p>Remove all approved actions this session</p></div>
            <button class="btn btn-danger btn-sm" onclick="alert('Decision log cleared')">Clear Log</button>
          </div>
          <div class="dz-item">
            <div><strong>Export Full Report</strong><p>Download platform report as PDF</p></div>
            <button class="btn btn-secondary btn-sm" onclick="alert('Report export — connect to backend')">↓ Export</button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function wireAdminSettings() {
  document.getElementById('save-thresholds-btn')?.addEventListener('click', () => {
    const inputs = document.querySelectorAll('.threshold-input[data-key]');
    const updated = {};
    inputs.forEach(inp => {
      if (!updated[inp.dataset.key]) updated[inp.dataset.key] = {};
      updated[inp.dataset.key][inp.dataset.level] = parseFloat(inp.value);
    });
    console.log('Thresholds updated:', updated);
    showToast('Thresholds saved successfully', 'success');
  });
}
