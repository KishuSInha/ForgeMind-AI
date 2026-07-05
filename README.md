# ForgeMind AI — Industrial Edge Intelligence Platform

> 🏆 **Tata Innovent Hackathon 2026** · Category 3.2.2.3 · Smart Manufacturing & Construction

ForgeMind AI is an industrial edge intelligence platform that brings cognitive AI to the factory floor. It monitors a CNC milling machine in real time, reasons about its physical state, and recommends the optimal engineering action — entirely at the edge, no cloud required.

---

## What It Does

The platform follows a three-stage cognitive architecture:

| Stage | Component | Inspired By |
|---|---|---|
| 01 | **Machine Memory Engine** | Mind Robotics |
| 02 | **Industrial World Model** | AMI / Yann LeCun |
| 03 | **Decision Intelligence Engine** | Project Prometheus |

The live demo simulates CNC-07 at Tata Motors' EV Component Plant (Pune) through a full morning shift — from healthy operation → bearing degradation → critical condition → AI-recommended action → recovery.

---

## Tech Stack

- **Frontend** — Vite 5, Vanilla JS (ES Modules), Three.js 0.168, GSAP 3.12
- **Backend** — Node.js, Express 4.18, Server-Sent Events (SSE)
- **3D / Animation** — Three.js icosphere, torus, particles, node-graph network; GSAP ScrollTrigger
- **Data** — Fully scripted story data (`server/data/storyData.js`) — 6 phases, 8 sensor streams

---

## Project Structure

```
├── index.html          # Landing page
├── login.html          # Login page
├── dashboard.html      # Full dashboard app
├── src/
│   ├── main.js         # Landing page entry — wires Three.js + app + live demo
│   ├── three-scene.js  # 3D hero background scene
│   ├── app.js          # Landing page animations (GSAP ScrollTrigger)
│   ├── demo.js         # Live demo section (injected into landing page)
│   ├── api.js          # Frontend API client (proxied to :3001)
│   ├── styles.css      # Landing page styles
│   ├── auth.css        # Login page styles
│   ├── dashboard.css   # Dashboard styles
│   └── pages/
│       ├── login.js    # Login logic + Three.js background
│       └── dashboard.js# Full dashboard — 8 views, SSE, phase control
├── server/
│   ├── index.js        # Express server — SSE, phase controller, routes
│   ├── routes/
│   │   ├── machine.js  # GET /api/machine — identity, memory, timeline
│   │   ├── sensors.js  # GET /api/sensors — live readings + history
│   │   ├── worldModel.js # GET /api/world-model — RUL, causal chain
│   │   ├── decisions.js  # GET /api/decisions + POST /approve
│   │   └── chat.js     # POST /api/chat — AI assistant
│   └── data/
│       └── storyData.js # All demo data — 6-phase story
└── vite.config.js      # Multi-page build + dev proxy
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install
```bash
npm install
```

### Run (two terminals)

**Terminal 1 — Frontend (Vite dev server)**
```bash
npm run dev
# → http://localhost:5173
```

**Terminal 2 — Backend (Express API + SSE)**
```bash
npm run server
# → http://localhost:3001
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production
```bash
npm run build
npm run preview
```

---

## Demo Walkthrough

### Login
| User | Email | Password |
|---|---|---|
| Plant Engineer | `rahul@tata.com` | `forge2026` |
| Admin | `admin@forgemind.ai` | `admin123` |

### Dashboard Views
1. **Factory Command Center** — KPIs, machine health ring, live sensors, AI recommendation
2. **Machine Intelligence** — Fleet overview (6 machines)
3. **Machine Memory** — 153 learning cycles, repair history, operator patterns
4. **Industrial World Model** — RUL prediction, physics causal chain
5. **Decision Intelligence** — 4 ranked engineering actions with cost/downtime/energy tradeoffs
6. **Fleet Learning** — Collective fleet metrics and hierarchy
7. **Explainable AI** — Sensor contribution scores, reasoning chain
8. **Engineering Copilot** — Chat with the AI about CNC-07

### Phase Selector
Use the phase selector in the dashboard topbar to advance the demo through all 6 phases:

| Phase | Time | Status |
|---|---|---|
| 1 | 09:00 | Healthy — normal operation |
| 2 | 09:30 | Degrading — early signs |
| 3 | 10:00 | Warning — bearing wear confirmed |
| 4 | 10:30 | Critical — World Model predicts failure |
| 5 | 11:00 | Decision — Decision Intelligence fires |
| 6 | 11:45 | Recovery — post-action stabilisation |

---

## API Reference

```
GET  /api/health                   Server health + current phase
GET  /api/stream                   SSE stream — live phase updates
POST /api/phase                    Set demo phase { phase: 1–6 }
GET  /api/machine                  Machine identity + current snapshot
GET  /api/machine/timeline         Full shift timeline
GET  /api/machine/memory           Machine Memory Engine data
GET  /api/machine/phases           All phase definitions
GET  /api/sensors                  Live sensor readings
GET  /api/sensors/history          All 6 phase sensor snapshots
GET  /api/sensors/thresholds       Sensor threshold reference
GET  /api/world-model              RUL, failure probability, reasoning
GET  /api/world-model/causal-chain Progressive causal chain
GET  /api/decisions                Ranked engineering actions
POST /api/decisions/approve        Approve action { action_rank, approved_by }
GET  /api/decisions/history        Approved action log
POST /api/chat                     AI assistant { message: string }
```

---

## Key Numbers

| Metric | Value |
|---|---|
| Uptime Predicted | 99.2% |
| Energy Saved | 40% |
| Decision Latency | 58ms |
| Maintenance Speed | 3× faster |
| Learning Cycles | 153 per machine |
| World Model Accuracy | 94% |
| Decision Confidence | 96% |
| Avg. Cost Saved per Alert | ₹21,400 |

---

## Hackathon Context

Built for **Tata Innovent Hackathon 2026**:

- **Primary Category** — 3.2.2.3: Smart Manufacturing & Construction
- **Secondary Category** — 3.2.1.4: Automotive Digital Twins
- **Tertiary Category** — 3.2.2.2: Sustainable Energy Efficiency

---

*ForgeMind AI — Industrial Edge Intelligence · Not for distribution*
