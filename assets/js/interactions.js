/**
 * INTERACTIONS - Bit by Bit
 * Haptic feedback and micro-animations.
 *
 * Vibration API support: Chrome Android only.
 * Firefox removed it in v79 (2020) — nothing to fix there.
 * iOS Safari has never supported it.
 */
(function () {
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IS_MOBILE = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

  // ===========================
  // VIBRATION ENGINE
  // Intensity scale:
  //   [6]          — scroll grain (barely perceptible)
  //   [15]         — catch inertia / navbar tap
  //   [20]         — TOC link, minor action
  //   [30]         — close sheet, copy confirm
  //   [40]         — open sheet
  //   [20, 50, 20] — milestone achievement
  //   [30, 60, 30] — theme toggle (strong double)
  // ===========================
  function vibe(pattern) {
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch (_) {}
  }

  // ===========================
  // SCROLL TEXTURE VIBRATION
  // Fires every ~100px scrolled with 80ms cooldown so the
  // vibration motor doesn't stutter on fast flings.
  // ===========================
  let _scrollAccum = 0;
  let _lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
  let _lastVibeTime = 0;
  let _wasScrolling = false;
  let _scrollStopTimer = null;

  function initScrollVibe() {
    window.addEventListener('scroll', () => {
      const delta = Math.abs(window.scrollY - _lastScrollY);
      _lastScrollY = window.scrollY;
      _scrollAccum += delta;

      // Mark scrolling active, reset stop timer
      _wasScrolling = true;
      clearTimeout(_scrollStopTimer);
      _scrollStopTimer = setTimeout(() => { _wasScrolling = false; }, 200);

      // Scroll texture: every 100px with 80ms cooldown
      if (_scrollAccum >= 100) {
        _scrollAccum -= 100;
        const now = Date.now();
        if (now - _lastVibeTime >= 80) {
          _lastVibeTime = now;
          vibe([6]);
        }
      }
    }, { passive: true });

    // Catch inertia: user taps screen during momentum scroll
    document.addEventListener('touchstart', () => {
      if (_wasScrolling) {
        _wasScrolling = false;
        clearTimeout(_scrollStopTimer);
        vibe([15]);
      }
    }, { passive: true });
  }

  // ===========================
  // MICRO-FEEDBACK
  // Mobile: vibe. Laptop: shake animation.
  // ===========================
  function microBounce(el) {
    if (!el || REDUCED) return;
    if (IS_MOBILE) {
      el.classList.add('bb-pressed');
      setTimeout(() => el.classList.remove('bb-pressed'), 100);
    } else {
      el.classList.add('bb-shake');
      setTimeout(() => el.classList.remove('bb-shake'), 280);
    }
  }

  // ===========================
  // SCROLL MILESTONES
  // ===========================
  const _seen = new Set();
  function checkMilestone(pct) {
    [25, 50, 75, 100].forEach(m => {
      if (pct >= m && !_seen.has(m)) {
        _seen.add(m);
        vibe([20, 50, 20]);
        if (m === 100) {
          const bar = document.getElementById('scrollIndicator');
          if (bar) {
            bar.classList.add('bb-complete');
            setTimeout(() => bar.classList.remove('bb-complete'), 600);
          }
        }
      }
    });
  }

  // ===========================
  // HEADING ENTRANCE ANIMATIONS
  // ===========================
  function initHeadingEntrance() {
    if (REDUCED) return;
    const headings = document.querySelectorAll('.article-content h2[id]');
    if (!headings.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.remove('bb-heading-hidden');
          e.target.classList.add('bb-heading-visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });

    headings.forEach(h => {
      const rect = h.getBoundingClientRect();
      if (rect.top > window.innerHeight * 0.85) {
        h.classList.add('bb-heading-hidden');
        obs.observe(h);
      }
    });
  }

  // ===========================
  // CODE BLOCK COPY BUTTONS
  // ===========================
  function initCopyButtons() {
    document.querySelectorAll('pre').forEach(pre => {
      if (pre.querySelector('.bb-copy-btn')) return;
      const btn = document.createElement('button');
      btn.className = 'bb-copy-btn';
      btn.textContent = 'COPY';
      btn.setAttribute('aria-label', 'Copy code');
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const code = pre.querySelector('code');
        const text = (code || pre).textContent;
        navigator.clipboard.writeText(text).then(() => {
          btn.textContent = '✓ COPIED';
          btn.classList.add('bb-copy-done');
          vibe([30]);
          setTimeout(() => {
            btn.textContent = 'COPY';
            btn.classList.remove('bb-copy-done');
          }, 1500);
        }).catch(() => {});
      });
      pre.appendChild(btn);
    });
  }

  // ===========================
  // NAVBAR FEEDBACK
  // ===========================
  function initNavFeedback() {
    // Brand logo
    const brand = document.querySelector('.header-brand');
    if (brand) brand.addEventListener('click', () => vibe([20]));

    // Any other header links/buttons not covered elsewhere
    document.querySelectorAll('.header a:not(.header-brand), .footer-home-mark').forEach(el => {
      el.addEventListener('click', () => vibe([15]));
    });
  }

  // ===========================
  // RESOURCE CARD + BUTTON FEEDBACK
  // ===========================
  function initButtonFeedback() {
    document.querySelectorAll('.resource-card').forEach(card => {
      card.addEventListener('click', () => vibe([20]));
    });
    document.querySelectorAll('.rec-btn').forEach(el => {
      el.addEventListener('click', () => {
        vibe([20]);
        microBounce(el);
      }, { passive: true });
    });
  }

  // ===========================
  // PUBLIC API
  // ===========================
  window.InteractionManager = {
    vibe,
    microBounce,
    checkMilestone,
    isMobile: IS_MOBILE,
  };

  document.documentElement.classList.add('bb-interactions-active');

  function init() {
    initScrollVibe();
    initHeadingEntrance();
    initCopyButtons();
    initNavFeedback();
    initButtonFeedback();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
