// ============================================================
// Prof. Dr. K. Thangadurai Research Foundation — main.js
// Static site vanilla JavaScript — no React, no framework
// ============================================================

// ─── Scroll Reveal (IntersectionObserver) ───────────────────
(function initReveal() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    document.querySelectorAll('.reveal').forEach((el) => {
      el.setAttribute('data-visible', 'true');
    });
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-visible', 'true');
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
})();

// ─── Sticky Header ──────────────────────────────────────────
(function initStickyHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 12) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// ─── Mobile Navigation Toggle ───────────────────────────────
(function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  if (!btn || !mobileNav) return;

  const iconMenu = btn.querySelector('.icon-menu');
  const iconX = btn.querySelector('.icon-x');

  btn.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    btn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    if (iconMenu) iconMenu.style.display = isOpen ? 'none' : 'block';
    if (iconX) iconX.style.display = isOpen ? 'block' : 'none';
  });

  // Close on nav link click
  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      btn.setAttribute('aria-label', 'Open menu');
      if (iconMenu) iconMenu.style.display = 'block';
      if (iconX) iconX.style.display = 'none';
    });
  });
})();

// ─── Active Nav Link Highlighting ───────────────────────────
(function initActiveNav() {
  const path = window.location.pathname;
  const filename = path.split('/').pop() || 'index.html';

  document.querySelectorAll('[data-nav-link]').forEach((link) => {
    const href = link.getAttribute('href') || '';
    const isHome = (filename === 'index.html' || filename === '') && href === 'index.html';
    const isMatch = !isHome && href !== 'index.html' && filename === href;
    if (isHome || isMatch) {
      link.classList.add('nav-active');
    }
  });
})();

// ─── Leaf Cursor (canvas) ───────────────────────────────────
(function initLeafCursor() {
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (coarse || reduced) return;

  const canvas = document.getElementById('sparkle-canvas');
  const dot = document.getElementById('sparkle-dot');
  if (!canvas) return;

  // Hide the old sparkle follow ring dot
  if (dot) dot.style.display = 'none';

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();

  const leaves = [];
  let lastX = -1, lastY = -1;

  const spawnLeaf = (x, y) => {
    if (leaves.length >= 25) return; // Keep a maximum density
    leaves.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 1.4,
      vy: Math.random() * 0.7 + 0.3, // Fall downwards
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.04,
      life: 0,
      maxLife: 60 + Math.random() * 40,
      size: 7 + Math.random() * 7, // Small leaves (7px - 14px)
    });
  };

  const onMove = (e) => {
    const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
    if (lastX === -1 || dist > 20) {
      spawnLeaf(e.clientX, e.clientY);
      lastX = e.clientX;
      lastY = e.clientY;
    }
  };

  let raf = 0;
  const loop = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let i = leaves.length - 1; i >= 0; i--) {
      const leaf = leaves[i];
      leaf.life += 1;
      leaf.x += leaf.vx;
      leaf.y += leaf.vy;
      leaf.angle += leaf.spin;
      leaf.vy += 0.006; // Gentle gravity
      
      const progress = leaf.life / leaf.maxLife;
      if (progress >= 1) {
        leaves.splice(i, 1);
        continue;
      }

      const alpha = 1 - progress;
      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.angle);
      ctx.globalAlpha = alpha;

      // Draw elegant leaf path
      ctx.beginPath();
      ctx.moveTo(0, leaf.size * 0.65);
      ctx.quadraticCurveTo(-leaf.size * 0.5, 0, 0, -leaf.size * 0.65);
      ctx.quadraticCurveTo(leaf.size * 0.5, 0, 0, leaf.size * 0.65);
      ctx.fillStyle = 'rgba(46, 125, 96, 0.7)'; // Natural soft forest green
      ctx.fill();

      // Draw leaf vein line
      ctx.beginPath();
      ctx.moveTo(0, leaf.size * 0.65);
      ctx.lineTo(0, -leaf.size * 0.45);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('resize', resize);
})();

// ─── Hero Parallax (Disabled to allow full-screen background video) ───
// (function initParallax() {
//   const heroImg = document.getElementById('hero-parallax');
//   if (!heroImg) return;
//   const onScroll = () => {
//     heroImg.style.transform = `translateY(${window.scrollY * 0.18}px) scale(1.04)`;
//   };
//   window.addEventListener('scroll', onScroll, { passive: true });
// })();

// ─── Appointment Form ────────────────────────────────────────
(function initAppointmentForm() {
  const form = document.getElementById('appointment-form');
  if (!form) return;
  const successPanel = document.getElementById('form-success');
  const formPanel = document.getElementById('form-panel');

  const showError = (fieldName, msg) => {
    const errEl = document.getElementById('err-' + fieldName);
    if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
  };
  const clearErrors = () => {
    form.querySelectorAll('.field-error').forEach((el) => {
      el.textContent = '';
      el.style.display = 'none';
    });
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();
    const data = new FormData(form);
    const name = (data.get('name') || '').toString().trim();
    const phone = (data.get('phone') || '').toString().trim();
    const age = (data.get('age') || '').toString().trim();
    const condition = (data.get('condition') || '').toString().trim();
    const date = (data.get('date') || '').toString().trim();
    const notes = (data.get('notes') || '').toString().trim();

    let hasError = false;
    if (name.length < 2) { showError('name', 'Please enter your full name'); hasError = true; }
    if (!/^[0-9+\s-]{10,15}$/.test(phone)) { showError('phone', 'Enter a valid phone number'); hasError = true; }
    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum < 1 || ageNum > 120) { showError('age', 'Enter a valid age'); hasError = true; }
    if (!condition) { showError('condition', 'Please select a condition'); hasError = true; }
    if (!date) { showError('date', 'Choose a preferred date'); hasError = true; }
    if (notes.length > 600) { showError('notes', 'Notes must be under 600 characters'); hasError = true; }
    if (hasError) return;

    const formattedNotes = notes ? `\n- Notes: ${notes}` : '';
    const text = `Hello Doctor, I would like to book a Siddha consultation:
- Name: ${name}
- Age: ${age}
- Phone: ${phone}
- Condition: ${condition}
- Preferred Date: ${date}${formattedNotes}`;
    const waUrl = `https://wa.me/919841023292?text=${encodeURIComponent(text)}`;
    
    // Reset form fields
    form.reset();

    // Directly redirect the user to WhatsApp in the current window
    window.location.href = waUrl;
  });

  // Keep this event listener for back-compatibility if the button still exists in HTML
  const bookAnotherBtn = document.getElementById('book-another-btn');
  if (bookAnotherBtn) {
    bookAnotherBtn.addEventListener('click', () => {
      if (successPanel) successPanel.style.display = 'none';
      if (formPanel) formPanel.style.display = 'block';
    });
  }
})();

// ─── About Accordion ─────────────────────────────────────────
(function initAboutAccordion() {
  const triggers = document.querySelectorAll('.accordion-trigger');
  if (!triggers.length) return;

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const isOpen = item.classList.contains('is-open');

      // Close all items (single-open behaviour)
      document.querySelectorAll('.accordion-item').forEach((el) => {
        el.classList.remove('is-open');
        el.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
      });

      // If it was closed, open it
      if (!isOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();

