// Careers page: career-track tabs, stat count-up and scroll reveals.
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canObserve = 'IntersectionObserver' in window;

  // Tabs (WAI-ARIA tabs pattern with arrow-key navigation)
  const tabs = [...document.querySelectorAll('.cr-tablist [role="tab"]')];
  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
    tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      let next = null;
      if (e.key in keys) next = tabs[(i + keys[e.key] + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); select(next, true); }
    });
  });

  if (reduceMotion || !canObserve) {
    document.querySelector('.cr-steps')?.classList.add('is-visible');
    return;
  }

  // Count-up for stats
  const counters = document.querySelectorAll('[data-count]');
  const countObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const el = entry.target;
      const target = Number(el.dataset.count);
      const start = target > 1000 ? target - 650 : 0;
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now - t0) / 1400, 1);
        el.textContent = Math.round(start + (target - start) * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => countObserver.observe(el));

  // Reveals
  const groups = ['.cr-tile', '.cr-benefit', '.cr-values > div', '.cr-process-list li', '.cr-steps li', '.cr-apply-card', '.cr-panels'];
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      const el = entry.target;
      // Drop reveal classes once settled so hover transforms/transitions apply again.
      if (el.classList.contains('cr-reveal')) {
        const done = (e) => {
          if (e.target !== el || e.propertyName !== 'transform') return;
          el.classList.remove('cr-reveal', 'is-visible');
          el.removeEventListener('transitionend', done);
        };
        el.addEventListener('transitionend', done);
      }
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  groups.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('cr-reveal');
      el.style.setProperty('--rd', `${(i % 4) * 0.08}s`);
      revealObserver.observe(el);
    });
  });
  const steps = document.querySelector('.cr-steps');
  if (steps) revealObserver.observe(steps);
})();
