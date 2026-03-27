/* ===== GAMIFIED PORTFOLIO — SCRIPT ===== */

// ── PARTICLE BACKGROUND ──────────────────────────────────────────────────────
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, stars = [], conns = [];

  const PRIMARY = 'rgba(124,58,237,';
  const ACCENT  = 'rgba(244,63,94,';

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomStar() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.4,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      a: Math.random(),
      color: Math.random() > 0.85 ? ACCENT : PRIMARY,
    };
  }

  function initStars() {
    stars = [];
    const n = Math.floor((W * H) / 9000);
    for (let i = 0; i < n; i++) stars.push(randomStar());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // grid overlay
    ctx.strokeStyle = 'rgba(124,58,237,0.03)';
    ctx.lineWidth = 1;
    const gs = 80;
    for (let x = 0; x < W; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // connections
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.strokeStyle = PRIMARY + (0.08 * (1 - dist / 100)) + ')';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.stroke();
        }
      }
    }

    // stars
    stars.forEach(s => {
      s.x += s.vx; s.y += s.vy;
      if (s.x < 0) s.x = W; if (s.x > W) s.x = 0;
      if (s.y < 0) s.y = H; if (s.y > H) s.y = 0;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color + s.a + ')';
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  resize();
  initStars();
  draw();
  window.addEventListener('resize', () => { resize(); initStars(); });
})();

// ── NAV ──────────────────────────────────────────────────────────────────────
const nav    = document.getElementById('nav');
const burger = document.getElementById('burger');
const menu   = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

burger.addEventListener('click', () => {
  menu.classList.toggle('open');
});

document.querySelectorAll('.mob-link').forEach(l => {
  l.addEventListener('click', () => menu.classList.remove('open'));
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[data-section="${e.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => observer.observe(s));

// ── HERO COUNTERS ─────────────────────────────────────────────────────────────
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  let current = 0;
  const step = Math.max(1, Math.floor(target / 40));
  const interval = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current;
    if (current >= target) clearInterval(interval);
  }, 30);
}

// ── REVEAL ON SCROLL ─────────────────────────────────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('revealed');

      // XP bars
      e.target.querySelectorAll('.xp-bar-fill').forEach(b => b.classList.add('animated'));
      // Progress bars
      e.target.querySelectorAll('.progress-fill').forEach(b => b.classList.add('animated'));
      // XP fill (hero)
      e.target.querySelectorAll('.xp-fill').forEach(b => b.classList.add('animated'));
      // Counters
      e.target.querySelectorAll('[data-count]').forEach(animateCount);

      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

// Hero XP bar on load
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('.xp-fill').forEach(b => b.classList.add('animated'));
    document.querySelectorAll('[data-count]').forEach(animateCount);
  }, 600);
});

// ── PROJECT FILTER ────────────────────────────────────────────────────────────
document.querySelectorAll('.filt').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.quest-card').forEach(card => {
      const match = filter === 'all' || card.dataset.cat === filter;
      card.classList.toggle('hidden', !match);
    });
  });
});

// ── PROJECT EXPAND ────────────────────────────────────────────────────────────
document.querySelectorAll('.quest-more').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.id;
    const detail = document.getElementById(id);
    if (!detail) return;
    const isOpen = detail.classList.contains('open');
    // Close all
    document.querySelectorAll('.quest-details').forEach(d => d.classList.remove('open'));
    document.querySelectorAll('.quest-more').forEach(b => b.classList.remove('open'));
    if (!isOpen) {
      detail.classList.add('open');
      btn.classList.add('open');
    }
  });
});

// ── SMOOTH SCROLL ─────────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    menu.classList.remove('open');
  });
});
