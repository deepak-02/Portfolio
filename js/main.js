/* =========================================================
   Deepak C K — Portfolio 2026 · interactions
   GSAP + ScrollTrigger + Lenis (all optional — the page
   works without them).
   ========================================================= */
(() => {
  'use strict';

  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  // lite = smartwatches, keypad phones, old browsers, data-saver (decided in <head>)
  const LITE = !!window.__LITE__;
  const mq = q => !!(window.matchMedia && window.matchMedia(q).matches);
  const BOT = !!window.__BOT__; // crawlers and speed tests get the finished page, no motion
  const reduceMotion = LITE || BOT || mq('(prefers-reduced-motion: reduce)');
  const finePointer = !LITE && mq('(hover: hover) and (pointer: fine)');
  const hasGSAP = !LITE && typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const API = 'https://portfolio-backend-yq1y.onrender.com';

  if (reduceMotion) root.classList.add('reduced');

  /* ---------- Theme ---------- */
  const themeBtn = $('.theme-toggle');
  const setThemeLabel = () => {
    const t = root.getAttribute('data-theme');
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    $$('meta[name="theme-color"]').forEach(m => m.setAttribute('content', t === 'dark' ? '#000000' : '#f6f6f4'));
  };
  setThemeLabel();

  themeBtn.addEventListener('click', (e) => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    const apply = () => {
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('dck-theme', next); } catch (_) {}
      setThemeLabel();
    };
    if (!document.startViewTransition || reduceMotion) { apply(); return; }
    const r = themeBtn.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(apply).ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 750, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' }
      );
    });
  });

  /* ---------- Text splitting ---------- */
  function splitChars(el) {
    const text = el.textContent;
    el.setAttribute('aria-hidden', 'true');
    el.textContent = '';
    [...text].forEach(ch => {
      const s = document.createElement('span');
      s.className = ch === ' ' ? 'char char--space' : 'char';
      const inner = document.createElement('span');
      inner.className = 'char__in';
      inner.textContent = ch === ' ' ? ' ' : ch;
      s.appendChild(inner);
      el.appendChild(s);
    });
    return $$('.char', el);
  }

  function splitWords(el, wrap = true) {
    // keeps inline elements (em) intact, splits their words too
    const label = el.textContent.trim().replace(/\s+/g, ' ');
    const out = [];
    const walk = (node, parent) => {
      node.childNodes.forEach(n => {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { parent.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.setAttribute('aria-hidden', 'true');
            if (wrap) {
              w.className = 'word';
              const inner = document.createElement('span');
              inner.textContent = part;
              w.appendChild(inner);
              out.push(inner);
            } else {
              w.className = 'sw';
              w.textContent = part;
              out.push(w);
            }
            parent.appendChild(w);
          });
        } else if (n.nodeType === 1) {
          const clone = n.cloneNode(false);
          parent.appendChild(clone);
          walk(n, clone);
        }
      });
    };
    const frag = document.createElement('div');
    walk(el, frag);
    el.innerHTML = '';
    while (frag.firstChild) el.appendChild(frag.firstChild);
    // screen readers read one clean copy; the animated word spans are hidden from them
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = label;
    el.appendChild(sr);
    return out;
  }

  /* ---------- Clock + year ---------- */
  const clock = $('.js-clock');
  const tick = () => {
    clock.textContent = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date());
  };
  tick(); setInterval(tick, 15000);
  $('.js-year').textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  const menuBtn = $('.menu-toggle');
  const menu = $('#mobile-menu');
  const setMenu = (open) => {
    root.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', String(!open));
    if (lenis) open ? lenis.stop() : lenis.start();
    else document.body.style.overflow = open ? 'hidden' : '';
  };
  menuBtn.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('menu-open')) setMenu(false); });

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduceMotion && typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    if (hasGSAP) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      if (root.classList.contains('menu-open')) setMenu(false);
      const offset = id === '#home' ? 0 : -20;
      if (lenis) lenis.scrollTo(target, { offset, duration: 1.4 });
      else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      if (target.id !== 'home') target.setAttribute('tabindex', '-1'), target.focus({ preventScroll: true });
    });
  });

  /* ---------- Nav: hide on scroll down, active link pill ---------- */
  const nav = $('.nav');
  let lastY = 0;
  const onScroll = (y) => {
    nav.classList.toggle('is-scrolled', y > 40);
    if (!root.classList.contains('menu-open')) nav.classList.toggle('is-hidden', y > lastY && y > 400);
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
  };
  const progressBar = $('.progress span');
  if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll));
  else addEventListener('scroll', () => onScroll(scrollY), { passive: true });

  const pill = $('.nav__pill');
  const links = $$('.nav__links a');
  const movePill = (a) => {
    if (!a) { pill.style.opacity = '0'; return; }
    pill.style.opacity = '1';
    pill.style.width = a.offsetWidth + 'px';
    pill.style.transform = `translateX(${a.offsetLeft}px)`;
  };
  let activeLink = null;
  links.forEach(a => {
    a.addEventListener('mouseenter', () => movePill(a));
  });
  $('.nav__links').addEventListener('mouseleave', () => movePill(activeLink));

  const sections = ['about', 'experience', 'skills', 'work', 'contact'].map(id => document.getElementById(id));
  if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        activeLink = links.find(l => l.getAttribute('href') === '#' + en.target.id) || null;
        links.forEach(l => l.classList.toggle('is-active', l === activeLink));
        movePill(activeLink);
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => s && io.observe(s));
  const homeIO = new IntersectionObserver(([en]) => {
    if (en.isIntersecting) { activeLink = null; links.forEach(l => l.classList.remove('is-active')); movePill(null); }
  }, { rootMargin: '-45% 0px -50% 0px' });
  homeIO.observe($('#home'));
  }

  /* ---------- Cursor ---------- */
  if (finePointer && !reduceMotion) {
    const ring = $('.cursor'), dot = $('.cursor-dot'), label = $('.cursor__label');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('pointermove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      root.classList.add('has-cursor');
    }, { passive: true });
    document.addEventListener('pointerleave', () => root.classList.remove('has-cursor'));
    const loop = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener('pointerover', e => {
      const lbl = e.target.closest('[data-cursor]');
      const hov = e.target.closest('a, button, summary, .pcard, .chips li');
      const field = e.target.closest('input, textarea');
      ring.classList.toggle('is-label', !!lbl);
      label.textContent = lbl ? lbl.dataset.cursor : '';
      ring.classList.toggle('is-hover', !lbl && !!hov);
      ring.classList.toggle('is-hidden', !!field);
      dot.classList.toggle('is-hidden', !!field);
    });
  }

  /* ---------- Magnetic ---------- */
  if (finePointer && !reduceMotion) {
    $$('[data-magnetic]').forEach(el => {
      const strength = el.classList.contains('btn') ? 0.28 : 0.4;
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform 600ms cubic-bezier(.16,1,.3,1)';
        el.style.transform = '';
        setTimeout(() => (el.style.transition = ''), 600);
      });
    });
  }

  /* ---------- Spotlight (card light follows the pointer) ---------- */
  if (finePointer) {
    $$('.spotlight').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---------- Hero interactive dot field ---------- */
  (function dotField() {
    if (LITE) return;
    const canvas = $('.hero__field');
    const ctx = canvas.getContext('2d');
    const hero = $('#home');
    let w, h, dpr, dots = [], pointer = { x: -9999, y: -9999 }, running = true, rgb = '255,255,255';
    const GAP = 28;
    const readColor = () => { rgb = getComputedStyle(root).getPropertyValue('--dot').trim() || '255,255,255'; };
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = hero.clientWidth; h = hero.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      for (let y = GAP / 2; y < h; y += GAP) for (let x = GAP / 2; x < w; x += GAP) dots.push({ x, y, ox: x, oy: y });
      readColor();
      if (reduceMotion || !finePointer) draw(0);
    };
    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);
      const R = 150;
      for (const d of dots) {
        const dx = d.ox - pointer.x, dy = d.oy - pointer.y;
        const dist = Math.hypot(dx, dy);
        let a = 0.07, r = 0.9;
        if (!reduceMotion) {
          const wave = Math.sin(d.ox * 0.012 + d.oy * 0.008 + t * 0.0009) * 0.5 + 0.5;
          a += wave * 0.05;
        }
        let tx = d.ox, ty = d.oy;
        if (dist < R) {
          const f = 1 - dist / R;
          a += f * 0.55; r += f * 1.3;
          tx += (dx / (dist || 1)) * f * 14;
          ty += (dy / (dist || 1)) * f * 14;
        }
        d.x += (tx - d.x) * 0.12; d.y += (ty - d.y) * 0.12;
        ctx.fillStyle = `rgba(${rgb},${a.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(d.x, d.y, r, 0, Math.PI * 2); ctx.fill();
      }
    };
    const loop = (t) => { if (running) draw(t); requestAnimationFrame(loop); };
    resize();
    addEventListener('resize', () => { clearTimeout(resize._t); resize._t = setTimeout(resize, 150); });
    new MutationObserver(() => { readColor(); if (reduceMotion || !finePointer) draw(0); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    if (reduceMotion || !finePointer) return;
    hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; });
    hero.addEventListener('pointerleave', () => { pointer.x = pointer.y = -9999; });
    new IntersectionObserver(([en]) => { running = en.isIntersecting; }).observe(hero);
    requestAnimationFrame(loop);
  })();

  /* ---------- Footer name: fit exactly to container width ---------- */
  const giant = $('.footer__giant');
  const fitGiant = () => {
    if (!giant) return;
    const box = giant.parentElement;
    const cs = getComputedStyle(box);
    const avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    giant.style.display = 'inline-block';
    giant.style.fontSize = '100px';
    const w = giant.getBoundingClientRect().width;
    giant.style.display = '';
    if (w > 0) giant.style.fontSize = Math.floor(100 * avail / w * 0.98) + 'px';
  };
  fitGiant();
  addEventListener('resize', () => { clearTimeout(fitGiant._t); fitGiant._t = setTimeout(fitGiant, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitGiant);

  /* ---------- Project grid: the card nearest the viewport centre shows full colour ---------- */
  const gCards = $$('.pcard');
  const pickActive = () => {
    const mid = innerHeight * 0.5;
    let best = null, bestD = Infinity;
    gCards.forEach(c => {
      const b = c.getBoundingClientRect();
      if (b.bottom < 0 || b.top > innerHeight) return;
      const d = Math.abs(b.top + b.height / 2 - mid);
      if (d < bestD) { bestD = d; best = c; }
    });
    gCards.forEach(c => c.classList.toggle('is-active', c === best && bestD < innerHeight * 0.45));
  };
  let pickRaf = 0;
  addEventListener('scroll', () => { if (!pickRaf) pickRaf = requestAnimationFrame(() => { pickRaf = 0; pickActive(); }); }, { passive: true });
  pickActive();
  if (finePointer && !reduceMotion) {
    $$('.pcard__visual').forEach(v => {
      v.addEventListener('pointermove', e => {
        const b = v.getBoundingClientRect();
        v.style.setProperty('--lx', `${((e.clientX - b.left) / b.width - 0.5) * 22}px`);
        v.style.setProperty('--ly', `${((e.clientY - b.top) / b.height - 0.5) * 16}px`);
      });
      v.addEventListener('pointerleave', () => { v.style.setProperty('--lx', '0px'); v.style.setProperty('--ly', '0px'); });
    });
  }

  /* ---------- Copy email ---------- */
  const toast = $('.toast');
  const showToast = (msg) => {
    toast.textContent = msg; toast.classList.add('is-visible');
    clearTimeout(showToast._t); showToast._t = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  };
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); showToast('Email copied to clipboard'); }
    catch (_) { showToast(b.dataset.copy); }
  }));

  /* ---------- Contact form ---------- */
  (function contactForm() {
    const form = $('#contact-form');
    const status = $('.form__status', form);
    const btn = $('.btn--submit', form);
    const btnText = $('.btn__text', btn);
    const rules = {
      name: v => v.length >= 2 || 'Please enter your name.',
      email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Please enter a valid email address.',
      message: v => v.length >= 10 || 'Please write at least 10 characters.'
    };
    const validate = (input) => {
      const res = rules[input.name](input.value.trim());
      const ok = res === true;
      const field = input.closest('.field');
      field.classList.toggle('is-invalid', !ok);
      input.setAttribute('aria-invalid', String(!ok));
      const err = $('#e-' + input.name);
      err.textContent = ok ? '' : res;
      if (!ok) input.setAttribute('aria-describedby', err.id); else input.removeAttribute('aria-describedby');
      return ok;
    };
    $$('input, textarea', form).forEach(i => {
      i.addEventListener('blur', () => { if (i.value) validate(i); });
      i.addEventListener('input', () => { if (i.closest('.field').classList.contains('is-invalid')) validate(i); });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const inputs = $$('input, textarea', form);
      const results = inputs.map(validate);
      if (results.includes(false)) { inputs[results.indexOf(false)].focus(); return; }

      const data = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        message: form.elements.message.value.trim()
      };
      btn.classList.add('is-sending'); btnText.textContent = 'Sending…';
      status.className = 'form__status'; status.textContent = '';
      try {
        const res = await fetch(API + '/api/contact/mail', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Server error');
        status.className = 'form__status is-success';
        status.textContent = "Message sent — thank you! I'll get back to you soon.";
        form.reset();
      } catch (_) {
        status.className = 'form__status is-error';
        status.textContent = 'Could not send right now. Please email me directly at deepakck02@gmail.com.';
      } finally {
        btn.classList.remove('is-sending'); btnText.textContent = 'Send message';
      }
    });

    // wake the (sleeping) Render backend only when someone heads for the form
    let woke = false;
    const wake = () => { if (woke || BOT) return; woke = true; fetch(API + '/', { mode: 'no-cors' }).catch(() => {}); };
    form.addEventListener('focusin', wake, { once: true });
    if ('IntersectionObserver' in window) {
      const wio = new IntersectionObserver(([en]) => { if (en.isIntersecting) { wake(); wio.disconnect(); } }, { rootMargin: '600px 0px' });
      wio.observe(form);
    }
  })();

  /* ---------- Accordion animation for <details> ---------- */
  $$('.proj-acc').forEach(d => {
    const summary = $('summary', d);
    const body = $('ul', d);
    summary.addEventListener('click', e => {
      if (reduceMotion || !body.animate) return;
      e.preventDefault();
      if (d.open) {
        const h = body.offsetHeight;
        body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'cubic-bezier(.65,0,.35,1)' })
          .onfinish = () => { d.open = false; window.ScrollTrigger && ScrollTrigger.refresh(); };
      } else {
        d.open = true;
        const h = body.offsetHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' })
          .onfinish = () => { window.ScrollTrigger && ScrollTrigger.refresh(); };
      }
    });
  });

  /* =========================================================
     GSAP choreography
     ========================================================= */
  const heroChars = $$('.js-split-chars').flatMap(splitChars);
  const titleWords = $$('.js-split-words').map(el => splitWords(el, true));
  const scrubWords = $$('.js-scrub-words').flatMap(el => splitWords(el, false));

  const finishLoading = () => root.classList.remove('is-loading');

  /* --- Hero name: sized in CSS (fits the content width with no layout shift) --- */
  const heroTitle = $('.hero__title');
  const heroName = $('.hero__name');

  /* --- Hero name: liquid "expand" hover — letters near the pointer stretch,
         brighten and push their neighbours apart --- */
  const initNameHover = () => {
    if (reduceMotion || initNameHover.done) return;
    initNameHover.done = true;
    const outers = $$('.char', heroName);
    const inners = outers.map(o => o.firstElementChild);
    const st = inners.map(() => ({ sy: 1, sx: 1, x: 0, y: 0, b: 1 }));
    let px = -1e5, py = -1e5, active = 0, activeT = 0, visible = true, raf = 0;
    const onMove = (e) => { px = e.clientX; py = e.clientY; activeT = 1; kick(); };
    heroTitle.closest('.hero').addEventListener('pointermove', onMove, { passive: true });
    heroTitle.closest('.hero').addEventListener('pointerleave', () => { activeT = 0; kick(); });
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); }).observe(heroTitle);
    const kick = () => { if (!raf && visible) raf = requestAnimationFrame(frame); };
    function frame() {
      raf = 0;
      active += (activeT - active) * 0.08;
      const fs = parseFloat(getComputedStyle(heroTitle).fontSize) || 160;
      const sigX = fs * 0.75, sigY = fs * 0.9;
      let moving = Math.abs(activeT - active) > 0.002;
      outers.forEach((o, i) => {
        const r = o.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = px - cx, dy = py - cy;
        const f = Math.exp(-(dx * dx) / (2 * sigX * sigX)) * Math.exp(-(dy * dy) / (2 * sigY * sigY)) * active;
        const t = { sy: 1 + 0.26 * f, sx: 1 + 0.05 * f, x: -Math.tanh(dx / sigX) * f * fs * 0.07, y: -f * fs * 0.03, b: 1 + 0.45 * f };
        const c = st[i];
        for (const k in t) { const d = t[k] - c[k]; c[k] += d * 0.14; if (Math.abs(d) > 0.0005) moving = true; }
        inners[i].style.transform = `translate(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px) scale(${c.sx.toFixed(4)}, ${c.sy.toFixed(4)})`;
        inners[i].style.filter = c.b > 1.005 ? `brightness(${c.b.toFixed(3)})` : '';
      });
      if (moving) kick();
    }
  };

  if (!hasGSAP || reduceMotion) {
    finishLoading();
    $$('.js-counter').forEach(c => (c.textContent = c.dataset.to));
    heroTitle.classList.add('is-revealed');
    if (!hasGSAP) { initNameHover(); return; }
  }

  gsap.registerPlugin(ScrollTrigger);

  if (reduceMotion) {
    // Final states only; a couple of non-motion niceties
    ScrollTrigger.create({ trigger: '.timeline', start: 'top 70%', onEnter: () => gsap.set('.timeline__fill', { scaleY: 1 }) });
    return;
  }

  /* --- Preloader → hero intro --- */
  const heroIntro = () => {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: () => { heroTitle.classList.add('is-revealed'); initNameHover(); } });
    tl.from(heroChars, { yPercent: 115, rotate: 6, duration: 1.4, stagger: 0.045 })
      .from('.js-hero-fade', { y: 24, opacity: 0, duration: 1.1, stagger: 0.1 }, '-=1.0')
      .from('.nav__inner', { y: -30, opacity: 0, duration: 1 }, '<');
    return tl;
  };

  gsap.set(heroChars, { yPercent: 115 });
  const count = { v: 0 };
  const countEl = $('.js-count');
  const startHero = () => { gsap.set(heroChars, { clearProps: 'transform' }); heroIntro(); };
  if (root.classList.contains('is-loading')) {
    jarvisLoader(startHero);
  } else {
    gsap.set(heroChars, { clearProps: 'transform' });
    heroIntro();
  }

  /* --- JARVIS loader: HUD spins up while particles converge into the ring,
         then the particles burst outward and a circular hole opens onto the page --- */
  function jarvisLoader(onReveal) {
    const loader = $('.loader');
    const canvas = $('.loader-fx');
    const ctx = canvas.getContext('2d');
    const hudCount = $('.js-hud-count');
    const status = $('.js-status');
    const ring = $('.hud__progress');
    const CIRC = 540.35;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W = 0, H = 0, cx = 0, cy = 0, R = 0;
    const size = () => {
      W = innerWidth; H = innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const hud = $('.loader__hud').getBoundingClientRect();
      cx = hud.left + hud.width / 2; cy = hud.top + hud.height / 2; R = hud.width / 2;
    };
    size(); addEventListener('resize', size);
    const rgb = (getComputedStyle(root).getPropertyValue('--dot').trim()) || '255,255,255';
    const N = innerWidth < 600 ? 110 : 200;
    const far = Math.hypot(innerWidth, innerHeight) * 0.6;
    const P = Array.from({ length: N }, () => {
      const a = Math.random() * Math.PI * 2;
      return {
        a, s: (Math.random() * 0.6 + 0.2) * (Math.random() < 0.5 ? -1 : 1) * 0.02,
        r0: R * 1.4 + Math.random() * far, band: 0.62 + Math.random() * 0.62,
        z: Math.random() * 1.2 + 0.4, v: 0, x: 0, y: 0, alpha: 0
      };
    });
    const state = { p: 0, burst: 0 };
    let running = true;
    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      const e = 1 - Math.pow(1 - state.p, 3);
      for (const q of P) {
        q.a += q.s * (1 + e * 2);
        let r = q.r0 + (R * q.band - q.r0) * e;
        if (state.burst > 0) { q.v += 0.9 + q.z * 0.6; r = R * q.band + q.v * state.burst * 18; }
        const x = cx + Math.cos(q.a) * r, y = cy + Math.sin(q.a) * r;
        const a = Math.min(1, 0.15 + e * 0.85) * (1 - state.burst * 0.9) * (0.35 + q.z * 0.4);
        if (state.burst > 0) { // light streaks while bursting
          ctx.strokeStyle = `rgba(${rgb},${(a * 0.6).toFixed(3)})`;
          ctx.lineWidth = q.z * 0.8;
          ctx.beginPath(); ctx.moveTo(q.x || x, q.y || y); ctx.lineTo(x, y); ctx.stroke();
        }
        ctx.fillStyle = `rgba(${rgb},${a.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(x, y, q.z * (1 + e * 0.4), 0, Math.PI * 2); ctx.fill();
        q.x = x; q.y = y;
      }
      // faint connecting web near the ring once mostly converged
      if (e > 0.6 && state.burst === 0) {
        ctx.strokeStyle = `rgba(${rgb},${((e - 0.6) * 0.12).toFixed(3)})`;
        ctx.lineWidth = 0.5;
        for (let i = 0; i < P.length; i += 3) {
          const a = P[i], b = P[(i + 7) % P.length];
          if (Math.hypot(a.x - b.x, a.y - b.y) < R * 0.7) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
      }
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);

    const msgs = [[0, 'Initialising'], [0.3, 'Loading modules'], [0.62, 'Calibrating interface'], [0.9, 'Systems online']];
    const tl = gsap.timeline({ delay: 0.15 });
    tl.from('.loader__hud', { scale: 0.6, opacity: 0, duration: 0.9, ease: 'expo.out' })
      .to(state, {
        p: 1, duration: 2.2, ease: 'power2.inOut',
        onUpdate: () => {
          const v = Math.round(state.p * 100);
          countEl.textContent = v;
          hudCount.textContent = String(v).padStart(2, '0');
          ring.style.strokeDashoffset = CIRC * (1 - state.p);
          const m = msgs.filter(([t]) => state.p >= t).pop()[1];
          if (status.textContent !== m) status.textContent = m;
        }
      }, 0.1)
      .to('.loader__bar span', { scaleX: 1, duration: 2.2, ease: 'power2.inOut' }, 0.1)
      // power-up flash
      .to('.loader__hud', { scale: 1.08, duration: 0.25, ease: 'power2.out' })
      .to('.loader__inner', { yPercent: 40, opacity: 0, duration: 0.5, ease: 'power3.in' }, '<')
      .add(() => { loader.classList.add('is-opening'); })
      .to('.loader__hud', { scale: 0.2, opacity: 0, duration: 0.45, ease: 'power3.in' })
      .to(state, { burst: 1, duration: 1.2, ease: 'power2.out' }, '<0.15')
      .fromTo(loader, { '--hole': '0px' }, {
        '--hole': Math.ceil(Math.hypot(innerWidth, innerHeight) / 2 + 40) + 'px',
        duration: 1.15, ease: 'expo.inOut',
        onComplete: () => {
          running = false; finishLoading();
          canvas.classList.add('is-done'); loader.classList.remove('is-opening');
          removeEventListener('resize', size);
        }
      }, '<')
      .add(onReveal, '<0.35');
  }

  /* Everything below the first screen is set up in small steps, one per task,
     so the page stays responsive while it loads (no long main-thread tasks) */
  const stages = [];
  const stage = fn => stages.push(fn);

  stage(() => {
    /* --- Hero scroll-out parallax --- */
    gsap.to('.hero__title', {
      yPercent: -18, opacity: 0.15, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.hero__glow', {
      yPercent: 30, scale: 1.2, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  });

  stage(() => {
    /* --- Tech band: two rows drift in opposite directions; scrolling speeds them up,
           flips their direction and leans the type with the scroll velocity --- */
    const bandRows = $$('.band__row').map((row, i) => {
      const track = row.querySelector('.band__track');
      const list = row.querySelector('.band__list');
      track.appendChild(list.cloneNode(true)).setAttribute('aria-hidden', 'true');
      const base = i === 0 ? 1 : -1;                        // row 1 moves left, row 2 right
      const tween = gsap.fromTo(track, { xPercent: base > 0 ? 0 : -50 }, {
        xPercent: base > 0 ? -50 : 0, ease: 'none', repeat: -1,
        duration: Math.max(24, list.offsetWidth / 60)       // ~60px per second, whatever the content width
      });
      const skew = gsap.quickTo(track, 'skewX', { duration: 0.5, ease: 'power3.out' });
      row.addEventListener('pointerenter', () => gsap.to(tween, { timeScale: 0.25, duration: 0.6 }));
      row.addEventListener('pointerleave', () => gsap.to(tween, { timeScale: 1, duration: 0.6 }));
      return { tween, skew };
    });
    let bandDir = 1;
    ScrollTrigger.create({
      trigger: '.band', start: 'top bottom', end: 'bottom top',
      onUpdate: self => {
        const v = self.getVelocity();
        if (self.direction !== bandDir) bandDir = self.direction;
        const boost = 1 + Math.min(4, Math.abs(v) / 500);
        bandRows.forEach(({ tween, skew }) => {
          gsap.to(tween, { timeScale: bandDir * boost, duration: 0.25, overwrite: true });
          gsap.to(tween, { timeScale: bandDir, duration: 1.2, delay: 0.25, ease: 'power2.out' });
          skew(gsap.utils.clamp(-8, 8, -v / 300));
        });
      },
      onLeave: () => bandRows.forEach(({ skew }) => skew(0)),
      onLeaveBack: () => bandRows.forEach(({ skew }) => skew(0))
    });
    ScrollTrigger.addEventListener('scrollEnd', () => bandRows.forEach(({ skew }) => skew(0)));
    gsap.from('.band__row', { opacity: 0, y: 24, duration: 1.2, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: '.band', start: 'top 95%' } });
  });

  stage(() => {
    /* --- Section heading rules draw across as each section arrives --- */
    $$('.section-head').forEach(head => {
      gsap.fromTo(head, { '--draw': 0 }, {
        '--draw': 1, duration: 1.4, ease: 'expo.out',
        scrollTrigger: { trigger: head, start: 'top 88%' }
      });
      gsap.from(head.children, { opacity: 0, x: -12, duration: 0.8, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: head, start: 'top 88%' } });
    });
  });

  stage(() => {
    /* --- Lists settle in one item after another --- */
    $$('.skill-list').forEach(list => gsap.from(list.children, {
      opacity: 0, x: -16, duration: 0.7, ease: 'power3.out', stagger: 0.07,
      scrollTrigger: { trigger: list, start: 'top 88%' }
    }));
    $$('.pcard .tags, .featured .tags').forEach(tags => gsap.from(tags.children, {
      opacity: 0, y: 10, duration: 0.6, ease: 'power3.out', stagger: 0.05,
      scrollTrigger: { trigger: tags, start: 'top 92%' }
    }));
    gsap.from('.contact__info > *', {
      opacity: 0, y: 16, duration: 0.8, ease: 'power3.out', stagger: 0.08,
      scrollTrigger: { trigger: '.contact__info', start: 'top 85%' }
    });
    gsap.from('.form .field, .form .btn--submit', {
      opacity: 0, y: 16, duration: 0.8, ease: 'power3.out', stagger: 0.08,
      scrollTrigger: { trigger: '.form', start: 'top 85%' }
    });
  });

  stage(() => {
    /* --- Section titles: words rise from mask --- */
    titleWords.forEach(words => {
      gsap.from(words, {
        yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.06,
        scrollTrigger: { trigger: words[0].closest('h2'), start: 'top 85%' }
      });
    });
  });

  stage(() => {
    /* --- About statement: scrubbed word highlight --- */
    gsap.fromTo(scrubWords, { opacity: 0.42 }, {
      opacity: 1, ease: 'none', stagger: 0.1,
      scrollTrigger: { trigger: '.about__statement', start: 'top 80%', end: 'bottom 45%', scrub: true }
    });
  });

  stage(() => {
    /* --- About photo reveal + parallax + colour on mobile --- */
    gsap.fromTo('.about__photo-frame', { clipPath: 'inset(18% 12% 18% 12% round 28px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 28px)', ease: 'expo.out', duration: 1.6,
      scrollTrigger: { trigger: '.about__photo', start: 'top 80%' }
    });
    gsap.fromTo('.about__photo img', { scale: 1.25, yPercent: -4 }, {
      scale: 1.05, yPercent: 4, ease: 'none',
      scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true }
    });
    if (!finePointer) {
      ScrollTrigger.create({ trigger: '.about__photo', start: 'top 55%', end: 'bottom 30%', toggleClass: { targets: '.about__photo', className: 'is-color' } });
    }
  });

  stage(() => {
    /* --- Generic reveal (batched, staggered) --- */
    gsap.set('[data-reveal]', { y: 40, opacity: 0 });
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%',
      onEnter: batch => gsap.to(batch, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.08, overwrite: true, clearProps: 'transform' })
    });
  });

  stage(() => {
    /* --- Counters --- */
    $$('.js-counter').forEach(c => {
      const o = { v: 0 };
      ScrollTrigger.create({
        trigger: c, start: 'top 90%', once: true,
        onEnter: () => gsap.to(o, { v: +c.dataset.to, duration: 1.8, ease: 'power3.out', onUpdate: () => (c.textContent = Math.round(o.v)) })
      });
    });
  });

  stage(() => {
    /* --- Timeline rail draws with scroll; nodes light up --- */
    gsap.to('.timeline__fill', {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.timeline', start: 'top 65%', end: 'bottom 65%', scrub: 0.6 }
    });
    $$('.role').forEach(r => ScrollTrigger.create({ trigger: r, start: 'top 65%', toggleClass: { targets: r, className: 'is-active' } }));
  });

  stage(() => {
    /* --- Metric: numbers punch in --- */
    gsap.from('.metric__to', {
      scale: 0.6, opacity: 0, duration: 1, ease: 'back.out(1.6)',
      scrollTrigger: { trigger: '.metric', start: 'top 80%' }
    });
  });

  stage(() => {
    /* --- Skills chips stagger --- */
    $$('.chips').forEach(ch => gsap.from(ch.children, {
      y: 16, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.04,
      scrollTrigger: { trigger: ch, start: 'top 90%' }
    }));
  });

  stage(() => {
    /* --- Featured: route draws on scroll --- */
    const routePath = $('.route__path');
    if (routePath) {
      const len = routePath.getTotalLength();
      gsap.set(routePath, { strokeDasharray: len, strokeDashoffset: len });
      const rtl = gsap.timeline({ scrollTrigger: { trigger: '.featured', start: 'top 75%', end: 'center 40%', scrub: 0.8 } });
      rtl.to(routePath, { strokeDashoffset: 0, ease: 'none' })
         .from('.route__stop', { scale: 0, transformOrigin: 'center', stagger: 0.2, ease: 'back.out(2)' }, 0)
         .from('.route__pin', { scale: 0, opacity: 0, transformOrigin: 'center' }, '-=0.2');
      gsap.from('.featured__icon-wrap', {
        y: 60, rotate: -8, ease: 'none',
        scrollTrigger: { trigger: '.featured', start: 'top bottom', end: 'bottom top', scrub: true }
      });
    }
  });

  stage(() => {
    /* --- Project grid scroll effects ---
       1. cards rise in with a slight 3D tilt, staggered by column
       2. the right column drifts at a different speed (parallax stagger) on desktop
       3. each logo scales/rotates into place as its card travels through the viewport
       4. the dotted rings turn with scroll */
    gsap.set('.pcard', { transformOrigin: '50% 100%' });
    ScrollTrigger.batch('.pcard', {
      start: 'top 90%',
      onEnter: batch => gsap.fromTo(batch,
        { y: 90, opacity: 0, rotateX: 10, scale: 0.96 },
        { y: 0, opacity: 1, rotateX: 0, scale: 1, duration: 1.3, ease: 'expo.out', stagger: 0.12, overwrite: true })
    });
    $$('.pcard').forEach(card => {
      const logo = card.querySelector('.pcard__logo');
      const rings = card.querySelector('.pcard__rings');
      gsap.fromTo(logo, { scale: 0.82, rotate: -8, yPercent: 14 }, {
        scale: 1, rotate: 0, yPercent: -6, ease: 'none',
        scrollTrigger: { trigger: card, start: 'top bottom', end: 'center 40%', scrub: 0.6 }
      });
      gsap.fromTo(rings, { rotate: -40, scale: 0.9 }, {
        rotate: 40, scale: 1.08, ease: 'none',
        scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
    gsap.matchMedia().add('(min-width: 761px)', () => {
      const right = $$('.pgrid > .pcard:not(.pcard--wide)').filter((_, i) => i % 2 === 1);
      const drift = gsap.fromTo(right, { y: 70 }, {
        y: -30, ease: 'none',
        scrollTrigger: { trigger: '.pgrid', start: 'top bottom', end: 'bottom top', scrub: 0.8 }
      });
      return () => { drift.scrollTrigger && drift.scrollTrigger.kill(); drift.kill(); gsap.set(right, { clearProps: 'y' }); };
    });
  });

  stage(() => {
    /* --- Footer giant name --- */
    gsap.from('.footer__giant', {
      yPercent: 40, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true }
    });

    /* Refresh after fonts/images settle */
  });

  const runStages = () => {
    const fn = stages.shift();
    if (!fn) { ScrollTrigger.refresh(); return; }
    fn();
    setTimeout(runStages, 0);
  };
  setTimeout(runStages, 0);

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());
})();
