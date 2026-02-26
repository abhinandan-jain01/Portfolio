/* ============================================================
   XR PORTFOLIO SCRIPT – Abhinandan Jain
   Three.js 3D Scene + HUD Nav + Scroll Reveals + Counters
   + Skill Bars + Project Filter + Expand Details + Progress
   ============================================================ */
'use strict';

// ─────────────────────────────────────────────
// THREE.JS 3D SCENE
// ─────────────────────────────────────────────
(function init3D() {
    const canvas = document.getElementById('scene3d');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // ---- Particles (points) ----
    const COUNT = 600;
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);

    const c1 = new THREE.Color('#00e5ff');
    const c2 = new THREE.Color('#b388ff');
    const c3 = new THREE.Color('#00e676');

    for (let i = 0; i < COUNT; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 80;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 80;

        const color = Math.random() < 0.5 ? c1 : Math.random() < 0.5 ? c2 : c3;
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        sizes[i] = Math.random() * 2.5 + 0.5;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const vertexShader = `
    attribute float size;
    varying vec3 vColor;
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;
    const fragmentShader = `
    varying vec3 vColor;
    void main() {
      float dist = length(gl_PointCoord - vec2(0.5));
      if (dist > 0.5) discard;
      float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
      gl_FragColor = vec4(vColor, alpha * 0.6);
    }
  `;

    const mat = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
    });

    const points = new THREE.Points(geom, mat);
    scene.add(points);

    // ---- Wireframe icosahedrons ----
    const icoGeom = new THREE.IcosahedronGeometry(6, 1);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.08 });
    const ico = new THREE.Mesh(icoGeom, wireMat);
    scene.add(ico);

    const icoGeom2 = new THREE.IcosahedronGeometry(10, 0);
    const wireMat2 = new THREE.MeshBasicMaterial({ color: 0xb388ff, wireframe: true, transparent: true, opacity: 0.04 });
    const ico2 = new THREE.Mesh(icoGeom2, wireMat2);
    scene.add(ico2);

    // ---- Torus ring ----
    const torusGeom = new THREE.TorusGeometry(14, 0.15, 8, 80);
    const torusMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.12 });
    const torus = new THREE.Mesh(torusGeom, torusMat);
    torus.rotation.x = Math.PI / 3;
    scene.add(torus);

    // ---- Grid lines ----
    const gridGeom = new THREE.PlaneGeometry(120, 120, 30, 30);
    const gridMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.03 });
    const grid = new THREE.Mesh(gridGeom, gridMat);
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = -20;
    scene.add(grid);

    // ---- Mouse tracking ----
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // ---- Scroll tracking ----
    let scrollY = 0;
    window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

    // ---- Resize ----
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ---- Animate ----
    function animate() {
        requestAnimationFrame(animate);

        const t = performance.now() * 0.0001;

        // rotate particles slowly
        points.rotation.y = t * 0.5 + mouseX * 0.15;
        points.rotation.x = Math.sin(t * 0.3) * 0.3 + mouseY * 0.1;

        // rotate wireframes
        ico.rotation.y = t * 1.2;
        ico.rotation.x = t * 0.8;
        ico2.rotation.y = -t * 0.6;
        ico2.rotation.z = t * 0.4;

        torus.rotation.z = t * 0.3;

        // camera follow scroll
        camera.position.y = -scrollY * 0.003;
        camera.position.x = mouseX * 2;
        camera.position.z = 30 + Math.sin(t) * 2;
        camera.lookAt(0, camera.position.y, 0);

        renderer.render(scene, camera);
    }
    animate();
})();


// ─────────────────────────────────────────────
// HUD NAV
// ─────────────────────────────────────────────
const nav = document.getElementById('nav');
function updateNav() {
    nav.classList.toggle('scrolled', window.scrollY > 30);
    const sections = ['hero', 'about', 'skills', 'projects', 'ongoing', 'contact'];
    let current = 'hero';
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) current = id;
    });
    document.querySelectorAll('.hud-link').forEach(l => {
        l.classList.toggle('active', l.dataset.section === current);
    });
}
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// Hamburger
const burger = document.getElementById('burger');
const mobileOverlay = document.getElementById('mobileOverlay');
burger.addEventListener('click', () => {
    mobileOverlay.classList.toggle('open');
    const spans = burger.querySelectorAll('span');
    const isOpen = mobileOverlay.classList.contains('open');
    spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px, 5px)' : '';
    spans[1].style.opacity = isOpen ? '0' : '1';
    spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px, -5px)' : '';
});
document.querySelectorAll('.mob-link').forEach(link => {
    link.addEventListener('click', () => {
        mobileOverlay.classList.remove('open');
        burger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = '1'; });
    });
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
});


// ─────────────────────────────────────────────
// SCROLL REVEAL
// ─────────────────────────────────────────────
const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 100);
            revealObs.unobserve(entry.target);
        }
    });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('[data-reveal]').forEach(el => revealObs.observe(el));


// ─────────────────────────────────────────────
// STAT COUNTERS
// ─────────────────────────────────────────────
function animateCount(el, target, dur = 1600) {
    const suffix = el.dataset.suffix || '';
    let start;
    const step = ts => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * target);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
    };
    requestAnimationFrame(step);
}
const statObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            animateCount(el, parseInt(el.dataset.count));
            statObs.unobserve(el);
        }
    });
}, { threshold: 0.3 });
document.querySelectorAll('.hm-val[data-count]').forEach(el => statObs.observe(el));


// ─────────────────────────────────────────────
// SKILL BARS
// ─────────────────────────────────────────────
const barObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.bar-fill').forEach((b, i) => {
                setTimeout(() => b.classList.add('animated'), i * 150);
            });
            barObs.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });
document.querySelectorAll('.skill-hex-card').forEach(c => barObs.observe(c));


// ─────────────────────────────────────────────
// PROGRESS BAR (Ongoing)
// ─────────────────────────────────────────────
const progObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.prog-fill').forEach(b => {
                setTimeout(() => b.classList.add('animated'), 300);
            });
            progObs.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });
document.querySelectorAll('.ong-card').forEach(c => progObs.observe(c));


// ─────────────────────────────────────────────
// PROJECT FILTER
// ─────────────────────────────────────────────
document.querySelectorAll('.filt').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        document.querySelectorAll('.proj-card').forEach(card => {
            card.classList.toggle('hidden', f !== 'all' && card.dataset.category !== f);
        });
    });
});


// ─────────────────────────────────────────────
// EXPANDABLE DETAILS
// ─────────────────────────────────────────────
document.querySelectorAll('.proj-more').forEach(btn => {
    btn.addEventListener('click', () => {
        const det = document.getElementById(btn.dataset.target);
        if (!det) return;
        const isOpen = det.classList.contains('open');

        // close all
        document.querySelectorAll('.proj-detail.open').forEach(d => d.classList.remove('open'));
        document.querySelectorAll('.proj-more.open').forEach(b => { b.classList.remove('open'); b.textContent = 'Read More ›'; });

        if (!isOpen) {
            det.classList.add('open');
            btn.classList.add('open');
            btn.textContent = 'Show Less ‹';
        }
    });
});


// ─────────────────────────────────────────────
// CONSOLE EASTER EGG
// ─────────────────────────────────────────────
console.log('%c 🥽 XR Portfolio – Abhinandan Jain ', 'background: #00e5ff; color: #050810; font-size: 14px; padding: 6px 12px; border-radius: 4px; font-weight: bold;');
console.log('%c Built with Three.js + vanilla HTML/CSS/JS ', 'color: #b388ff; font-size: 12px;');
