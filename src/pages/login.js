/**
 * login.js — ForgeMind AI login page logic
 */
import '../styles.css';
import '../auth.css';
import * as THREE from 'three';

// ── Demo credentials ──────────────────────────────────────────────────────────
const VALID_USERS = [
  { email: 'rahul.sharma@tatamotors.com', password: 'ForgeMind2026', name: 'Rahul Sharma', role: 'Plant Engineer', initials: 'RS' },
  { email: 'admin@forgemind.ai',          password: 'Admin@123',     name: 'Admin User',   role: 'Administrator',   initials: 'AU' },
];

// ── Background Three.js particle scene ───────────────────────────────────────
function initAuthScene() {
  const canvas = document.getElementById('auth-canvas');
  if (!canvas) return;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 80);

  const NODES = 50, SPREAD = 100, CONN = 25;
  const nodes = Array.from({ length: NODES }, () => ({
    x: (Math.random() - 0.5) * SPREAD, y: (Math.random() - 0.5) * SPREAD * 0.6,
    z: (Math.random() - 0.5) * 30,
    vx: (Math.random() - 0.5) * 0.03, vy: (Math.random() - 0.5) * 0.03, vz: 0,
    pulse: Math.random() * Math.PI * 2, pulseSpeed: Math.random() * 0.02 + 0.01,
  }));
  const meshes = nodes.map(n => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.5, 6, 6), new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.6 }));
    m.position.set(n.x, n.y, n.z); scene.add(m); return m;
  });
  const lPos = new Float32Array(NODES * NODES * 6), lCol = new Float32Array(NODES * NODES * 6);
  const lGeo = new THREE.BufferGeometry();
  lGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
  lGeo.setAttribute('color', new THREE.BufferAttribute(lCol, 3));
  const lMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false });
  scene.add(new THREE.LineSegments(lGeo, lMat));

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  (function animate() {
    requestAnimationFrame(animate);
    nodes.forEach((n, i) => {
      n.x += n.vx; n.y += n.vy; n.pulse += n.pulseSpeed;
      if (Math.abs(n.x) > SPREAD / 2) n.vx *= -1;
      if (Math.abs(n.y) > SPREAD * 0.3) n.vy *= -1;
      meshes[i].position.set(n.x, n.y, n.z);
      meshes[i].material.opacity = 0.3 + 0.3 * Math.sin(n.pulse);
    });
    let li = 0;
    for (let i = 0; i < NODES; i++) for (let j = i + 1; j < NODES; j++) {
      const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
      if (d < CONN) {
        const a = (1 - d / CONN) * 0.4;
        lPos[li*6]=nodes[i].x; lPos[li*6+1]=nodes[i].y; lPos[li*6+2]=nodes[i].z;
        lPos[li*6+3]=nodes[j].x; lPos[li*6+4]=nodes[j].y; lPos[li*6+5]=nodes[j].z;
        lCol[li*6]=0*a; lCol[li*6+1]=0.83*a; lCol[li*6+2]=1*a;
        lCol[li*6+3]=0*a; lCol[li*6+4]=0.83*a; lCol[li*6+5]=1*a;
        li++;
      }
    }
    for (let k = li * 6; k < lPos.length; k++) { lPos[k] = 0; lCol[k] = 0; }
    lGeo.attributes.position.needsUpdate = true; lGeo.attributes.color.needsUpdate = true;
    lGeo.setDrawRange(0, li * 2);
    renderer.render(scene, camera);
  })();
}

// ── Login logic ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initAuthScene();

  // Fill demo creds on click
  document.querySelectorAll('.demo-cred-item').forEach(item => {
    item.addEventListener('click', () => {
      document.getElementById('email').value = item.dataset.email;
      document.getElementById('password').value = item.dataset.pass;
      document.querySelectorAll('.demo-cred-item').forEach(d => d.classList.remove('selected'));
      item.classList.add('selected');
    });
  });

  // Password toggle
  document.getElementById('toggle-pw')?.addEventListener('click', () => {
    const pw = document.getElementById('password');
    pw.type = pw.type === 'password' ? 'text' : 'password';
  });

  // Form submit
  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');
    const btnText = document.getElementById('login-btn-text');
    const spinner = document.getElementById('login-spinner');

    errorEl.style.display = 'none';
    btnText.style.display = 'none';
    spinner.style.display = 'inline-block';

    // Simulate network call
    await new Promise(r => setTimeout(r, 900));

    const user = VALID_USERS.find(u => u.email === email && u.password === password);

    if (user) {
      sessionStorage.setItem('fm_user', JSON.stringify(user));
      window.location.href = '/dashboard.html';
    } else {
      btnText.style.display = 'inline';
      spinner.style.display = 'none';
      errorEl.textContent = 'Invalid email or password. Use the demo credentials below.';
      errorEl.style.display = 'block';
      document.getElementById('login-form').classList.add('shake');
      setTimeout(() => document.getElementById('login-form').classList.remove('shake'), 600);
    }
  });
});
