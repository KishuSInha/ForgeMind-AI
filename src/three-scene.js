/**
 * three-scene.js
 * ForgeMind AI — Black & White 3D Hero Scene with Scroll Animations
 */
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initHeroScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  // ── Renderer ───────────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  // ── Scene & Camera ─────────────────────────────────────────────────────────
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 90);

  // ── Materials — pure white/grey palette ───────────────────────────────────
  const matBright  = () => new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.18 });
  const matMid     = () => new THREE.MeshBasicMaterial({ color: 0xdddddd, wireframe: true, transparent: true, opacity: 0.10 });

  // ── Primary: large rotating icosphere ─────────────────────────────────────
  const sphereGeo  = new THREE.IcosahedronGeometry(28, 2);
  const sphereMesh = new THREE.Mesh(sphereGeo, matBright());
  sphereMesh.position.set(45, 0, -30);
  scene.add(sphereMesh);

  // Inner smaller sphere
  const innerSphere = new THREE.Mesh(
    new THREE.IcosahedronGeometry(16, 1),
    matMid()
  );
  innerSphere.position.copy(sphereMesh.position);
  scene.add(innerSphere);

  // ── Secondary: torus ring ─────────────────────────────────────────────────
  const torusGeo  = new THREE.TorusGeometry(18, 0.6, 8, 60);
  const torusMesh = new THREE.Mesh(torusGeo, matBright());
  torusMesh.position.set(-50, 10, -25);
  torusMesh.rotation.x = Math.PI / 3;
  scene.add(torusMesh);

  // ── Tetrahedron floating left ─────────────────────────────────────────────
  const tetraMesh = new THREE.Mesh(
    new THREE.TetrahedronGeometry(14, 0),
    matMid()
  );
  tetraMesh.position.set(-38, -18, -15);
  scene.add(tetraMesh);

  // ── Octahedron top right ──────────────────────────────────────────────────
  const octaMesh = new THREE.Mesh(
    new THREE.OctahedronGeometry(10, 0),
    matBright()
  );
  octaMesh.position.set(60, 22, -20);
  scene.add(octaMesh);

  // ── Small accent dodecahedron ─────────────────────────────────────────────
  const dodecaMesh = new THREE.Mesh(
    new THREE.DodecahedronGeometry(7, 0),
    matMid()
  );
  dodecaMesh.position.set(20, 28, -10);
  scene.add(dodecaMesh);

  // ── Particle field ────────────────────────────────────────────────────────
  const PARTICLE_COUNT = 200;
  const pPositions = new Float32Array(PARTICLE_COUNT * 3);
  const pSizes     = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    pPositions[i * 3 + 0] = (Math.random() - 0.5) * 220;
    pPositions[i * 3 + 1] = (Math.random() - 0.5) * 140;
    pPositions[i * 3 + 2] = (Math.random() - 0.5) * 80 - 20;
    pSizes[i] = Math.random() * 1.5 + 0.3;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  pGeo.setAttribute('size',     new THREE.BufferAttribute(pSizes, 1));

  const pMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.6,
    transparent: true,
    opacity: 0.35,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // ── Connecting line network (static grid) ─────────────────────────────────
  const gridGroup = new THREE.Group();
  const gridMat   = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.05 });

  // Horizontal grid lines in background
  for (let y = -40; y <= 40; y += 20) {
    const pts = [new THREE.Vector3(-120, y, -60), new THREE.Vector3(120, y, -60)];
    gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
  }
  // Vertical grid lines
  for (let x = -120; x <= 120; x += 30) {
    const pts = [new THREE.Vector3(x, -50, -60), new THREE.Vector3(x, 50, -60)];
    gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
  }
  scene.add(gridGroup);

  // ── Dynamic node-to-node lines ─────────────────────────────────────────────
  const NODE_COUNT   = 60;
  const SPREAD       = 120;
  const CONNECT_DIST = 24;

  const nodes = Array.from({ length: NODE_COUNT }, () => ({
    x: (Math.random() - 0.5) * SPREAD,
    y: (Math.random() - 0.5) * SPREAD * 0.55,
    z: (Math.random() - 0.5) * SPREAD * 0.35,
    vx: (Math.random() - 0.5) * 0.025,
    vy: (Math.random() - 0.5) * 0.025,
    vz: (Math.random() - 0.5) * 0.015,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: Math.random() * 0.02 + 0.008,
  }));

  // Node dots
  const nodeDotGeo = new THREE.BufferGeometry();
  const nodeDotPos = new Float32Array(NODE_COUNT * 3);
  nodes.forEach((n, i) => {
    nodeDotPos[i * 3] = n.x; nodeDotPos[i * 3 + 1] = n.y; nodeDotPos[i * 3 + 2] = n.z;
  });
  nodeDotGeo.setAttribute('position', new THREE.BufferAttribute(nodeDotPos, 3));
  const nodeDots = new THREE.Points(nodeDotGeo, new THREE.PointsMaterial({
    color: 0xffffff, size: 0.8, transparent: true, opacity: 0.6, sizeAttenuation: true
  }));
  scene.add(nodeDots);

  // Connection lines
  const linePositions = new Float32Array(NODE_COUNT * NODE_COUNT * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0.12,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  scene.add(new THREE.LineSegments(lineGeo, lineMat));

  // ── Scroll-driven 3D animation state ─────────────────────────────────────
  ScrollTrigger.create({
    trigger: 'body',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: () => {} // keeps trigger alive for scrub targets
  });

  // Animate main scene objects on scroll
  gsap.to(sphereMesh.position, {
    y: -30, z: -80, ease: 'none',
    scrollTrigger: { trigger: 'body', start: 'top top', end: '30% top', scrub: 1 }
  });
  gsap.to(sphereMesh.material, {
    opacity: 0.04, ease: 'none',
    scrollTrigger: { trigger: 'body', start: 'top top', end: '25% top', scrub: 1 }
  });
  gsap.to(innerSphere.material, {
    opacity: 0.02, ease: 'none',
    scrollTrigger: { trigger: 'body', start: 'top top', end: '25% top', scrub: 1 }
  });

  gsap.to(torusMesh.position, {
    x: -80, y: 30, z: -80, ease: 'none',
    scrollTrigger: { trigger: 'body', start: 'top top', end: '40% top', scrub: 1.5 }
  });
  gsap.to(torusMesh.rotation, {
    x: Math.PI, y: Math.PI / 2, ease: 'none',
    scrollTrigger: { trigger: 'body', start: 'top top', end: '40% top', scrub: 1 }
  });

  gsap.to(tetraMesh.position, {
    x: -60, y: 40, z: -50, ease: 'none',
    scrollTrigger: { trigger: 'body', start: '5% top', end: '35% top', scrub: 1 }
  });

  gsap.to(octaMesh.position, {
    x: 80, y: -20, z: -60, ease: 'none',
    scrollTrigger: { trigger: 'body', start: '10% top', end: '40% top', scrub: 1 }
  });

  gsap.to(gridMat, {
    // grid fades as user scrolls past hero
    opacity: 0, ease: 'none',
    scrollTrigger: { trigger: 'body', start: 'top top', end: '20% top', scrub: 1 }
  });

  // Particles drift upward on scroll
  gsap.to(particles.position, {
    y: 40, ease: 'none',
    scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 2 }
  });

  // ── Mouse parallax ─────────────────────────────────────────────────────────
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;

  document.addEventListener('mousemove', e => {
    targetMouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ── Resize ─────────────────────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ── Animation loop ─────────────────────────────────────────────────────────
  let frame = 0;

  function animate() {
    requestAnimationFrame(animate);
    frame++;

    // Smooth mouse
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // Continuous rotations
    sphereMesh.rotation.x += 0.0025;
    sphereMesh.rotation.y += 0.004;
    innerSphere.rotation.x -= 0.003;
    innerSphere.rotation.z += 0.002;
    torusMesh.rotation.y   += 0.005;
    torusMesh.rotation.z   += 0.002;
    tetraMesh.rotation.x   += 0.008;
    tetraMesh.rotation.y   += 0.005;
    octaMesh.rotation.x    += 0.004;
    octaMesh.rotation.y    += 0.007;
    octaMesh.rotation.z    += 0.003;
    dodecaMesh.rotation.x  += 0.006;
    dodecaMesh.rotation.y  += 0.009;
    particles.rotation.y   += 0.0003;

    // Inner sphere follows outer
    innerSphere.position.copy(sphereMesh.position);

    // Dodecahedron floating bob
    dodecaMesh.position.y = 28 + Math.sin(frame * 0.015) * 4;

    // Update moving nodes
    const nodePosAttr = nodeDotGeo.attributes.position;
    nodes.forEach((n, i) => {
      n.x += n.vx; n.y += n.vy; n.z += n.vz;
      n.pulse += n.pulseSpeed;
      if (Math.abs(n.x) > SPREAD / 2)      n.vx *= -1;
      if (Math.abs(n.y) > SPREAD * 0.28)   n.vy *= -1;
      if (Math.abs(n.z) > SPREAD * 0.18)   n.vz *= -1;
      nodePosAttr.setXYZ(i, n.x, n.y, n.z);
    });
    nodePosAttr.needsUpdate = true;

    // Rebuild connection lines
    let lineIdx = 0;
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dz = nodes[i].z - nodes[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < CONNECT_DIST) {
          linePositions[lineIdx * 6 + 0] = nodes[i].x;
          linePositions[lineIdx * 6 + 1] = nodes[i].y;
          linePositions[lineIdx * 6 + 2] = nodes[i].z;
          linePositions[lineIdx * 6 + 3] = nodes[j].x;
          linePositions[lineIdx * 6 + 4] = nodes[j].y;
          linePositions[lineIdx * 6 + 5] = nodes[j].z;
          lineIdx++;
        }
      }
    }
    for (let k = lineIdx * 6; k < linePositions.length; k++) linePositions[k] = 0;
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.setDrawRange(0, lineIdx * 2);

    // Camera parallax from mouse
    camera.position.x += (mouseX * 5 - camera.position.x) * 0.03;
    camera.position.y += (-mouseY * 3 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();
}
