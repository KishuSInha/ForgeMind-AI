/**
 * app.js
 * ForgeMind AI — Black & White Main Application Logic (ES Module)
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Page-level scroll progress bar ────────────────────────────────────────
function initScrollProgress() {
  const bar = document.createElement('div');
  Object.assign(bar.style, {
    position: 'fixed', top: '0', left: '0', height: '2px',
    background: 'rgba(255,255,255,0.6)', zIndex: '9999',
    width: '0%', transition: 'width 0.1s linear', pointerEvents: 'none',
  });
  document.body.appendChild(bar);
  window.addEventListener('scroll', () => {
    const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    bar.style.width = pct + '%';
  }, { passive: true });
}

export function initApp() {
  // Init scroll progress bar
  initScrollProgress();

  // ── Nav scroll effect ──────────────────────────────────────────────────────
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // ── Hero entrance animations ───────────────────────────────────────────────
  gsap.set(['.hero-badge', '.hero-title', '.hero-subtitle', '.hero-tagline', '.hero-ctas', '.hero-stats'], {
    opacity: 0, y: 40,
  });

  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl
    .to('.hero-badge',    { opacity: 1, y: 0, duration: 0.7, delay: 0.4 })
    .to('.hero-title',    { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
    .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.6 }, '-=0.5')
    .to('.hero-tagline',  { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
    .to('.hero-ctas',     { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
    .to('.hero-stats',    { opacity: 1, y: 0, duration: 0.6 }, '-=0.3');

  setTimeout(() => {
    document.querySelectorAll('.hero-stats .stat-num').forEach(el => animateCounter(el));
  }, 1400);

  // ── Hero content parallax on scroll ───────────────────────────────────────
  gsap.to('.hero-content', {
    yPercent: -12,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
  });

  // ── Section heading reveals ────────────────────────────────────────────────
  document.querySelectorAll('.section-label').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' } }
    );
  });

  document.querySelectorAll('.section-title').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 40, skewX: 2 },
      { opacity: 1, y: 0, skewX: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' } }
    );
  });

  document.querySelectorAll('.section-desc').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' } }
    );
  });

  // ── Platform stage cards — staggered slide-up with slight scale ────────────
  gsap.fromTo('.stage-card',
    { opacity: 0, y: 80, scale: 0.96 },
    {
      opacity: 1, y: 0, scale: 1,
      duration: 1, ease: 'power3.out', stagger: 0.18,
      scrollTrigger: { trigger: '.stages-grid', start: 'top 78%' },
    }
  );

  // Stage connector arrows animate in after cards
  gsap.fromTo('.stage-connector',
    { opacity: 0, scaleX: 0 },
    {
      opacity: 1, scaleX: 1,
      duration: 0.5, ease: 'power2.out', stagger: 0.2, delay: 0.4,
      scrollTrigger: { trigger: '.stages-grid', start: 'top 78%' },
    }
  );

  // ── Lineage cards — fan-in from bottom with stagger ───────────────────────
  gsap.fromTo('.lineage-card',
    { opacity: 0, y: 60, rotationX: 8 },
    {
      opacity: 1, y: 0, rotationX: 0,
      duration: 0.85, stagger: 0.15, ease: 'power2.out',
      transformOrigin: 'center top',
      scrollTrigger: { trigger: '.lineage-grid', start: 'top 80%' },
    }
  );

  // ── Use case cards ─────────────────────────────────────────────────────────
  gsap.fromTo('.usecase-card',
    { opacity: 0, y: 70, scale: 0.95 },
    {
      opacity: 1, y: 0, scale: 1,
      duration: 0.95, stagger: 0.18, ease: 'power3.out',
      scrollTrigger: { trigger: '.usecase-grid', start: 'top 80%' },
    }
  );

  // CTA block slide-up
  gsap.fromTo('.landing-cta-block',
    { opacity: 0, y: 50 },
    {
      opacity: 1, y: 0,
      duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: '.landing-cta-block', start: 'top 88%' },
    }
  );

  // ── Metrics counters ───────────────────────────────────────────────────────
  gsap.fromTo('.metric-card',
    { opacity: 0, y: 50 },
    { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out',
      scrollTrigger: { trigger: '.metrics-grid', start: 'top 82%' } }
  );
  ScrollTrigger.create({
    trigger: '.metrics-grid', start: 'top 80%', once: true,
    onEnter: () => {
      document.querySelectorAll('.metrics-grid .counter').forEach(el => animateCounter(el));
    },
  });

  // ── Footer reveal ──────────────────────────────────────────────────────────
  gsap.fromTo('.footer-brand, .footer-col',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out',
      scrollTrigger: { trigger: '.footer', start: 'top 92%' } }
  );

  // ── 3D tilt on glass cards ─────────────────────────────────────────────────
  document.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      gsap.to(card, {
        rotationX: y * -8,
        rotationY: x * 8,
        transformPerspective: 900,
        duration: 0.35,
        ease: 'power1.out',
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    });
  });

  // ── Horizontal scroll-linked line drawing on section dividers ─────────────
  document.querySelectorAll('.section').forEach(section => {
    const line = document.createElement('div');
    Object.assign(line.style, {
      position: 'absolute',
      top: '0', left: '0',
      height: '1px',
      background: 'rgba(255,255,255,0.15)',
      width: '0%',
      pointerEvents: 'none',
    });
    section.style.position = 'relative';
    section.appendChild(line);
    gsap.to(line, {
      width: '100%',
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top 80%', end: 'top 20%', scrub: 0.5 },
    });
  });

  // ── Rotating tagline ───────────────────────────────────────────────────────
  const taglineStrong = document.querySelector('.hero-tagline strong');
  if (taglineStrong) {
    const messages = [
      'We decide what to do next.',
      'We simulate every engineering option.',
      'We give engineers superpowers.',
      'We run at the edge. No cloud needed.',
    ];
    let msgIdx = 0;
    setInterval(() => {
      msgIdx = (msgIdx + 1) % messages.length;
      gsap.to(taglineStrong, {
        opacity: 0, y: -8, duration: 0.3,
        onComplete: () => {
          taglineStrong.textContent = messages[msgIdx];
          gsap.fromTo(taglineStrong, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 });
        },
      });
    }, 3500);
  }

  // ── Active nav links via IntersectionObserver ──────────────────────────────
  const navLinks = document.querySelectorAll('.nav-links a');
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const isActive = link.getAttribute('href') === `#${id}`;
          link.style.color = isActive ? 'rgba(255,255,255,0.9)' : '';
          link.style.fontWeight = isActive ? '700' : '';
        });
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

  // ── Smooth scroll for anchor links ────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Notification helper (white theme) ─────────────────────────────────────
  function showNotification(msg, type) {
    document.querySelector('.fm-notification')?.remove();
    const el = document.createElement('div');
    el.className = 'fm-notification';
    Object.assign(el.style, {
      position: 'fixed', bottom: '2rem', right: '2rem',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.25)',
      color: type === 'success' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.75)',
      padding: '0.9rem 1.5rem', borderRadius: '10px', fontSize: '0.88rem',
      fontWeight: '600', zIndex: '9999', backdropFilter: 'blur(16px)',
      maxWidth: '340px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    });
    el.textContent = (type === 'success' ? '✅ ' : '⚡ ') + msg;
    document.body.appendChild(el);
    gsap.fromTo(el, { opacity: 0, y: 20, x: 20 }, { opacity: 1, y: 0, x: 0, duration: 0.4, ease: 'power2.out' });
    setTimeout(() => {
      gsap.to(el, { opacity: 0, y: 10, duration: 0.4, onComplete: () => el.remove() });
    }, 3500);
  }

  // ── Dashboard approve / override buttons ───────────────────────────────────
  const approveBtn  = document.querySelector('.btn-approve');
  const overrideBtn = document.querySelector('.btn-override');

  if (approveBtn) {
    approveBtn.addEventListener('click', () => {
      approveBtn.textContent = '✅ Approved — Dispatched';
      approveBtn.style.background = '#ffffff';
      approveBtn.style.color = '#000000';
      gsap.fromTo(approveBtn, { scale: 0.93 }, { scale: 1, duration: 0.4, ease: 'elastic.out(1.2, 0.5)' });
      showNotification('Work order dispatched to Maintenance Team A', 'success');
    });
  }
  if (overrideBtn) {
    overrideBtn.addEventListener('click', () =>
      showNotification('Override mode — Select alternative action', 'warning')
    );
  }

  // ── Edge flow particles (white dots) ─────────────────────────────────────
  function createFlowParticles(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.style.position = 'relative';
    container.style.overflow = 'visible';
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      Object.assign(dot.style, {
        position: 'absolute', width: '5px', height: '5px',
        background: 'rgba(255,255,255,0.8)',
        borderRadius: '50%',
        boxShadow: '0 0 6px rgba(255,255,255,0.5)',
        top: '50%',
        transform: 'translateY(-50%)',
        left: '0',
      });
      container.appendChild(dot);
      gsap.to(dot, {
        left: '100%', duration: 1.2 + i * 0.4, ease: 'none', repeat: -1, delay: i * 0.5, opacity: 0,
        onRepeat: function () { gsap.set(this.targets()[0], { left: '0%', opacity: 1 }); },
      });
    }
  }

  ScrollTrigger.create({
    trigger: '.edge-diagram', start: 'top 80%', once: true,
    onEnter: () => {
      createFlowParticles('flow-particles-1');
      createFlowParticles('flow-particles-2');
    },
  });

  // ── Sensor bars animate in on scroll ──────────────────────────────────────
  ScrollTrigger.create({
    trigger: '.sensor-feeds', start: 'top 85%', once: true,
    onEnter: () => {
      document.querySelectorAll('.sensor-fill').forEach(bar => {
        const targetW = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => { bar.style.width = targetW; }, 100);
      });
    },
  });

  // Gauge animation
  ScrollTrigger.create({
    trigger: '.health-gauge', start: 'top 85%', once: true,
    onEnter: () => {
      const path  = document.getElementById('gauge-path');
      const numEl = document.querySelector('.gauge-number');
      if (!path || !numEl) return;
      gsap.fromTo({ v: 251 }, { v: 75 }, {
        duration: 2, ease: 'power2.out',
        onUpdate: function () { path.setAttribute('stroke-dashoffset', Math.round(this.targets()[0].v)); },
      });
      gsap.fromTo({ n: 100 }, { n: 72 }, {
        duration: 2, ease: 'power2.out',
        onUpdate: function () { numEl.textContent = Math.round(this.targets()[0].n); },
      });
    },
  });

  // Dashboard mockup entrance
  gsap.fromTo('.dashboard-mockup',
    { opacity: 0, y: 60, scale: 0.97 },
    { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.dashboard-mockup', start: 'top 82%' } }
  );

  // Action items reveal
  ScrollTrigger.create({
    trigger: '.actions-list', start: 'top 85%', once: true,
    onEnter: () => {
      gsap.fromTo('.action-item',
        { opacity: 0, x: 24 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.12, ease: 'power2.out' }
      );
    },
  });

  // Edge devices
  gsap.fromTo('.edge-device',
    { opacity: 0, scale: 0.8, y: 20 },
    { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'back.out(1.4)',
      scrollTrigger: { trigger: '.edge-diagram', start: 'top 80%' } }
  );
  gsap.fromTo('.edge-stat',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power2.out',
      scrollTrigger: { trigger: '.edge-stats', start: 'top 85%' } }
  );

  // ── Workflow pipeline interaction ──────────────────────────────────────────
  const wfSteps   = document.querySelectorAll('.wf-step');
  const wfDetails = document.querySelectorAll('.wf-detail-card');

  function activateStep(idx) {
    wfSteps.forEach(s => s.classList.remove('active'));
    wfDetails.forEach(d => d.classList.remove('active'));
    const step   = document.querySelector(`.wf-step[data-step="${idx}"]`);
    const detail = document.querySelector(`.wf-detail-card[data-step="${idx}"]`);
    if (step)   step.classList.add('active');
    if (detail) {
      detail.classList.add('active');
      gsap.fromTo(detail, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    }
  }

  wfSteps.forEach(step => {
    step.addEventListener('click', () => activateStep(parseInt(step.dataset.step)));
  });

  let wfInterval = null;
  function startWfCycle() {
    let current = 0;
    wfInterval = setInterval(() => {
      current = (current + 1) % 11;
      activateStep(current);
    }, 2200);
  }
  function stopWfCycle() {
    if (wfInterval) { clearInterval(wfInterval); wfInterval = null; }
  }

  ScrollTrigger.create({
    trigger: '#workflow-pipeline', start: 'top 80%',
    onEnter: () => {
      activateStep(0);
      gsap.fromTo('.wf-step',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power2.out' }
      );
      startWfCycle();
    },
    onLeave:     stopWfCycle,
    onEnterBack: startWfCycle,
    onLeaveBack: stopWfCycle,
  });

  // ── Animated border on new-way card ───────────────────────────────────────
  const newWayCard = document.querySelector('.new-way');
  if (newWayCard) {
    let t = 0;
    setInterval(() => {
      t += 0.04;
      newWayCard.style.borderColor = `rgba(255,255,255,${0.15 + 0.12 * Math.sin(t)})`;
    }, 50);
  }

  // ── Counter animation utility ──────────────────────────────────────────────
  function animateCounter(el) {
    const target  = parseFloat(el.dataset.target || 0);
    const suffix  = el.dataset.suffix || '';
    const prefix  = el.dataset.prefix || '';
    const isFloat = target % 1 !== 0;
    gsap.fromTo({ val: 0 }, { val: target }, {
      duration: 1.8, ease: 'power2.out',
      onUpdate: function () {
        const v = this.targets()[0].val;
        el.textContent = prefix + (isFloat ? v.toFixed(1) : Math.round(v)) + suffix;
      },
      onComplete: function () { el.textContent = prefix + target + suffix; },
    });
  }

  // ── Compare cards ─────────────────────────────────────────────────────────
  gsap.fromTo('.compare-card',
    { opacity: 0, y: 50 },
    { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.25,
      scrollTrigger: { trigger: '.comparison-grid', start: 'top 80%' } }
  );

  // ── Hero stats parallax ────────────────────────────────────────────────────
  gsap.to('.hero-stats', {
    yPercent: -20, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
}
