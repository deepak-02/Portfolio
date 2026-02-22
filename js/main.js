/* ══════════════════════════════════════════════════════════
   PORTFOLIO — MAIN.JS
   Handles: navbar, cursor, scroll reveal, scroll progress,
            contact form, copyright year, resize stop
   ══════════════════════════════════════════════════════════ */

'use strict';

// ─── UTILS ───────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ─── COPYRIGHT YEAR ──────────────────────────────────────
function initCopyrightYear() {
    const el = $('#copyright-year');
    if (el) el.textContent = new Date().getFullYear();
}
initCopyrightYear();

// ─── CUSTOM CURSOR (desktop only) ────────────────────────
function initCursor() {
    const cursor  = $('#cursor');
    const dot     = $('#cursor-dot');
    const isMobile = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

    if (isMobile || !cursor) {
        if (cursor) cursor.style.display = 'none';
        if (dot)    dot.style.display    = 'none';
        return;
    }

    let mx = -100, my = -100;
    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.left = mx + 'px';
        dot.style.top  = my + 'px';
    });

    // Throttle cursor ring to rAF for smoothness
    function trackCursor() {
        cursor.style.left = mx + 'px';
        cursor.style.top  = my + 'px';
        requestAnimationFrame(trackCursor);
    }
    requestAnimationFrame(trackCursor);

    // Hover state on interactive elements
    $$('a, button, .skill-tag, .bento-card, .tech-icon').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });
}
initCursor();

// ─── SCROLL PROGRESS BAR ─────────────────────────────────
function initScrollProgress() {
    const bar = $('#scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
        const h = document.documentElement;
        const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
        bar.style.width = pct + '%';
    }, { passive: true });
}
initScrollProgress();

// ─── NAVBAR ──────────────────────────────────────────────
function initNavbar() {
    const navbar   = $('#navbar');
    const toggle   = $('#nav-toggle');
    const navLinks = $('#nav-links');
    const links    = $$('.nav-link');

    // Scroll class
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 30);
    }, { passive: true });

    // Mobile toggle
    if (toggle && navLinks) {
        toggle.addEventListener('click', () => {
            const isOpen = toggle.classList.toggle('open');
            navLinks.classList.toggle('open', isOpen);
            toggle.setAttribute('aria-expanded', String(isOpen));
        });

        // Close on link click (mobile)
        links.forEach(link => {
            link.addEventListener('click', () => {
                toggle.classList.remove('open');
                navLinks.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Active link on scroll
    const sections = $$('section[id]');
    function setActiveLink() {
        let current = '';
        sections.forEach(sec => {
            const top = sec.getBoundingClientRect().top;
            if (top <= 100) current = sec.id;
        });
        links.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
    }
    window.addEventListener('scroll', setActiveLink, { passive: true });
    setActiveLink();
}
initNavbar();

// ─── SCROLL REVEAL ────────────────────────────────────────
function initScrollReveal() {
    const elements = $$('[data-reveal]');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay;
                if (delay) {
                    entry.target.style.transitionDelay = delay + 'ms';
                }
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));

    // Also trigger stat-card animations when about section is visible
    const aboutSection = $('#about');
    if (aboutSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        statsObserver.observe(aboutSection);
    }
}
initScrollReveal();

// ─── CONTACT FORM ─────────────────────────────────────────
function initContactForm() {
    const form      = $('#contact-form');
    const statusEl  = $('#form-status');
    const submitBtn = $('#submit-btn');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            name:    String(form.elements['name'].value).trim(),
            email:   String(form.elements['email'].value).trim(),
            message: String(form.elements['message'].value).trim(),
        };

        if (!data.name || !data.email || !data.message) return;

        // Loading state
        submitBtn.classList.add('loading');
        statusEl.className = 'form-status';
        statusEl.textContent = '';

        try {
            const res = await fetch('https://portfolio-backend-yq1y.onrender.com/api/contact/mail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error('Server error');

            showStatus('success', 'Message sent! I\'ll get back to you soon. 🎉');
            form.reset();
        } catch {
            showStatus('error', 'Failed to send. Please email me directly at deepakck02@gmail.com');
        } finally {
            submitBtn.classList.remove('loading');
        }
    });

    function showStatus(type, msg) {
        statusEl.className = 'form-status ' + type;
        statusEl.textContent = msg;
        setTimeout(() => {
            statusEl.className = 'form-status';
            statusEl.textContent = '';
        }, 6000);
    }
}
initContactForm();

// ─── RESIZE ANIMATION STOPPER ────────────────────────────
let resizeTimer;
window.addEventListener('resize', () => {
    document.body.classList.add('resize-animation-stopper');
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        document.body.classList.remove('resize-animation-stopper');
    }, 400);
});

// ─── BACKEND PING (keep-alive) ───────────────────────────
// Fire-and-forget: wakes up render backend
fetch('https://portfolio-backend-yq1y.onrender.com/').catch(() => {});