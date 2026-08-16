/* ============================================================
   MUHAMMAD FARIS KHAN — PORTFOLIO SCRIPT
   Modular vanilla JS. No frameworks, no libraries.
   ============================================================ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const enableHeavyFX = !prefersReducedMotion && !isTouchDevice;

  /* ============================================================
     LOADER
     ============================================================ */
  function initLoader() {
    const loader = document.getElementById('loader');
    const fill = document.getElementById('loaderFill');
    const percentEl = document.getElementById('loaderPercent');
    if (!loader) return;

    let progress = 0;
    const duration = 900; // ms, kept short per spec
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      progress = Math.min(100, Math.round((elapsed / duration) * 100));
      fill.style.width = progress + '%';
      percentEl.textContent = progress + '%';

      if (progress < 100) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(function () {
          loader.classList.add('is-hidden');
          document.body.style.overflow = '';
        }, 200);
      }
    }

    document.body.style.overflow = 'hidden';
    requestAnimationFrame(tick);

    // Safety net: never block the site for more than 2.5s even if rAF stalls.
    setTimeout(function () {
      loader.classList.add('is-hidden');
      document.body.style.overflow = '';
    }, 2500);
  }

  /* ============================================================
     CUSTOM CURSOR
     ============================================================ */
  function initCustomCursor() {
    if (!enableHeavyFX) return;

    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    document.body.classList.add('has-custom-cursor');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = 'translate(' + mouseX + 'px,' + mouseY + 'px) translate(-50%,-50%)';
    }, { passive: true });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = 'translate(' + ringX + 'px,' + ringY + 'px) translate(-50%,-50%)';
      requestAnimationFrame(animateRing);
    }
    requestAnimationFrame(animateRing);

    const interactiveSelector = 'a, button, .tilt-card, input, textarea';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(interactiveSelector)) ring.classList.add('is-active');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(interactiveSelector)) ring.classList.remove('is-active');
    });
  }

  /* ============================================================
     THEME TOGGLE
     ============================================================ */
  function initThemeToggle() {
    const root = document.documentElement;
    const toggles = [document.getElementById('themeToggle'), document.getElementById('themeToggleMobile')].filter(Boolean);
    const stored = null; // no persistent storage relied upon; default to dark per spec
    let theme = stored || 'dark';

    function applyTheme(next) {
      theme = next;
      if (theme === 'light') {
        root.setAttribute('data-theme', 'light');
      } else {
        root.removeAttribute('data-theme');
      }
      toggles.forEach(function (btn) {
        btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
      });
    }

    toggles.forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyTheme(theme === 'light' ? 'dark' : 'light');
      });
    });

    applyTheme(theme);
  }

  /* ============================================================
     NAVBAR: scroll shrink + active section detection
     ============================================================ */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const sections = Array.from(document.querySelectorAll('main section[id]'));

    function onScroll() {
      if (window.scrollY > 24) {
        navbar.classList.add('is-scrolled');
      } else {
        navbar.classList.remove('is-scrolled');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (!('IntersectionObserver' in window) || sections.length === 0) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;

        navLinks.forEach(function (link) {
          link.classList.toggle('active', link.dataset.section === id);
        });
        mobileLinks.forEach(function (link) {
          link.classList.toggle('active', link.dataset.section === id);
        });
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ============================================================
     MOBILE MENU
     ============================================================ */
  function initMobileMenu() {
    const btn = document.getElementById('hamburgerBtn');
    const menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;

    function closeMenu() {
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open navigation menu');
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function openMenu() {
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'Close navigation menu');
      menu.classList.add('is-open');
      menu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    btn.addEventListener('click', function () {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });

    menu.querySelectorAll('.mobile-link').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ============================================================
     SCROLL REVEAL
     ============================================================ */
  function initScrollReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || items.length === 0) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ============================================================
     3D TILT CARDS (skills, projects, about, timeline, education, form)
     ============================================================ */
  function initTiltCards() {
    if (!enableHeavyFX) return;

    const cards = document.querySelectorAll('.tilt-card');
    const MAX_ROTATE = 6; // degrees — kept subtle per spec

    cards.forEach(function (card) {
      let rafId = null;
      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;

      function loop() {
        currentX += (targetX - currentX) * 0.15;
        currentY += (targetY - currentY) * 0.15;
        card.style.transform =
          'rotateX(' + currentY.toFixed(2) + 'deg) rotateY(' + currentX.toFixed(2) + 'deg) translateZ(6px)';

        if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
          rafId = requestAnimationFrame(loop);
        } else {
          rafId = null;
        }
      }

      function handleMove(e) {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        targetX = px * MAX_ROTATE * 2;
        targetY = -py * MAX_ROTATE * 2;
        if (!rafId) rafId = requestAnimationFrame(loop);
      }

      function handleLeave() {
        targetX = 0;
        targetY = 0;
        if (!rafId) rafId = requestAnimationFrame(loop);
      }

      card.addEventListener('mousemove', handleMove);
      card.addEventListener('mouseleave', handleLeave);
    });
  }

  /* ============================================================
     HERO TERMINAL: pointer-driven rotation
     ============================================================ */
  function initHeroTerminal() {
    const terminal = document.getElementById('terminal3d');
    if (!terminal || !enableHeavyFX) return;

    let targetRX = 8, targetRY = -14;
    let curRX = 8, curRY = -14;
    let rafId = null;

    function loop() {
      curRX += (targetRX - curRX) * 0.08;
      curRY += (targetRY - curRY) * 0.08;
      terminal.style.animationPlayState = 'paused';
      terminal.style.transform = 'rotateX(' + curRX.toFixed(2) + 'deg) rotateY(' + curRY.toFixed(2) + 'deg)';
      rafId = requestAnimationFrame(loop);
    }

    window.addEventListener('mousemove', function (e) {
      const px = e.clientX / window.innerWidth - 0.5;
      const py = e.clientY / window.innerHeight - 0.5;
      targetRX = 8 - py * 14;
      targetRY = -14 + px * 20;
      if (!rafId) rafId = requestAnimationFrame(loop);
    }, { passive: true });
  }

  /* ============================================================
     3D BACKGROUND: canvas particle field with mouse parallax
     ============================================================ */
  function initBackgroundCanvas() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height, dpr;
    let particles = [];
    const PARTICLE_COUNT = window.innerWidth < 768 ? 26 : 52;

    let mouseX = 0, mouseY = 0;
    let parallaxX = 0, parallaxY = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: Math.random() * 0.7 + 0.3, // depth factor: closer = larger parallax
          r: Math.random() * 1.4 + 0.6,
          vy: Math.random() * 0.12 + 0.03
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#3B82F6';

      particles.forEach(function (p) {
        p.y -= p.vy;
        if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }

        const offsetX = parallaxX * p.z * 26;
        const offsetY = parallaxY * p.z * 26;

        ctx.beginPath();
        ctx.arc(p.x + offsetX, p.y + offsetY, p.r, 0, Math.PI * 2);
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.16 + p.z * 0.18;
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    requestAnimationFrame(draw);

    window.addEventListener('resize', function () {
      resize();
      createParticles();
    });

    if (enableHeavyFX) {
      window.addEventListener('mousemove', function (e) {
        parallaxX += ((e.clientX / width - 0.5) - parallaxX) * 0.06;
        parallaxY += ((e.clientY / height - 0.5) - parallaxY) * 0.06;
      }, { passive: true });
    }
  }

  /* ============================================================
     CONTACT FORM — client-side validation + Web3Forms
     ------------------------------------------------------------
     Sends the message directly from the browser via Web3Forms'
     public API (https://web3forms.com). No custom backend, no
     Node.js — just a fetch() call to their hosted endpoint. The
     visitor stays on this page the whole time; no mail app opens
     and no page navigation happens.

     Setup (one-time, free):
       1. Go to https://web3forms.com
       2. Enter khangee90870@gmail.com and generate an Access Key
       3. Paste that key into the hidden "access_key" input in
          index.html (search for YOUR_ACCESS_KEY_HERE)
     ============================================================ */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const statusMsg = document.getElementById('statusMsg');
    const submitBtn = document.getElementById('submitBtn');
    const btnLabel = submitBtn.querySelector('.btn-label');

    const fields = {
      name: document.getElementById('name'),
      email: document.getElementById('email'),
      subject: document.getElementById('subject'),
      message: document.getElementById('message')
    };

    const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

    function clearError(key) {
      document.getElementById('field-' + key).classList.remove('invalid');
    }
    function setError(key) {
      document.getElementById('field-' + key).classList.add('invalid');
    }
    function isValidEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    Object.keys(fields).forEach(function (key) {
      fields[key].addEventListener('input', function () { clearError(key); });
    });

    function setLoading(isLoading) {
      submitBtn.disabled = isLoading;
      submitBtn.classList.toggle('is-loading', isLoading);
      btnLabel.textContent = isLoading ? 'Sending...' : 'Send Message';
    }

    function showStatus(message, type) {
      statusMsg.textContent = message;
      statusMsg.className = 'status-msg show ' + type;
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const name = fields.name.value.trim();
      const email = fields.email.value.trim();
      const subject = fields.subject.value.trim();
      const message = fields.message.value.trim();

      let valid = true;
      if (!name) { setError('name'); valid = false; } else { clearError('name'); }
      if (!email || !isValidEmail(email)) { setError('email'); valid = false; } else { clearError('email'); }
      if (!subject) { setError('subject'); valid = false; } else { clearError('subject'); }
      if (!message) { setError('message'); valid = false; } else { clearError('message'); }

      if (!valid) {
        showStatus('Please fill in all fields correctly before sending.', 'error');
        return;
      }

      const accessKey = form.querySelector('input[name="access_key"]').value.trim();
      if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE') {
        showStatus('Form is not configured yet — add a Web3Forms access key in index.html.', 'error');
        return;
      }

      setLoading(true);
      statusMsg.className = 'status-msg';

      try {
        const response = await fetch(WEB3FORMS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: accessKey,
            name: name,
            email: email,
            subject: subject,
            message: message
          })
        });

        const result = await response.json().catch(function () { return {}; });

        if (response.ok && result.success) {
          showStatus("Message sent successfully. I'll get back to you soon.", 'success');
          form.reset();
        } else {
          showStatus('Unable to send your message. Please try again.', 'error');
        }
      } catch (networkErr) {
        showStatus('Unable to send your message. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    });
  }

  /* ============================================================
     SMOOTH ANCHOR SCROLL (accounts for fixed navbar offset)
     ============================================================ */
  function initAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        const targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        const navOffset = 110;
        const top = target.getBoundingClientRect().top + window.scrollY - navOffset;
        window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
    });
  }

  /* ============================================================
     INIT
     ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    initLoader();
    initCustomCursor();
    initThemeToggle();
    initNavbar();
    initMobileMenu();
    initScrollReveal();
    initTiltCards();
    initHeroTerminal();
    initBackgroundCanvas();
    initContactForm();
    initAnchorScroll();
  });
})();

document.querySelectorAll(".coming-soon-btn").forEach(button => {
    button.addEventListener("click", () => {
        alert("🚀 Coming Soon!\nThis project is currently under development.");
    });
});
