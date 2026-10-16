(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window)) return;
  root.classList.add('svc-js');

  // Scroll reveal
  const revealTargets = document.querySelectorAll('.svc-thread-head, .svc-reality-head, .svc-compare, .svc-bento li, .svc-cta-card');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px' });
  revealTargets.forEach((target, index) => {
    target.classList.add('svc-reveal');
    if (target.matches('.svc-bento li')) target.style.transitionDelay = `${(index % 5) * 80}ms`;
    revealObserver.observe(target);
  });

  // Sticky stage: clone each step's scene into the stage, swap on scroll
  const stageScenes = document.querySelector('[data-stage-scenes]');
  const stageIndex = document.querySelector('[data-stage-index]');
  const stageBar = document.querySelector('[data-stage-bar]');
  const steps = [...document.querySelectorAll('.svc-step')];
  if (!stageScenes || !steps.length) return;

  const clones = steps.map((step) => {
    const scene = step.querySelector('.scene')?.cloneNode(true);
    if (!scene) return null;
    scene.removeAttribute('role');
    scene.removeAttribute('aria-label');
    // keep SVG ids unique between the inline and staged copy
    scene.querySelectorAll('[id]').forEach((el) => {
      const oldId = el.id;
      el.id = `${oldId}-stage`;
      scene.querySelectorAll('*').forEach((node) => {
        ['fill', 'clip-path', 'stroke'].forEach((attr) => {
          const value = node.getAttribute(attr);
          if (value === `url(#${oldId})`) node.setAttribute(attr, `url(#${oldId}-stage)`);
        });
      });
    });
    stageScenes.append(scene);
    return scene;
  });

  const setActive = (index) => {
    steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
    clones.forEach((scene, i) => scene?.classList.toggle('is-active', i === index));
    if (stageIndex) stageIndex.textContent = steps[index].dataset.step;
    if (stageBar) stageBar.style.width = `${((index + 1) / steps.length) * 100}%`;
  };
  setActive(0);

  // Keep the sticky stage vertically centred and each step block the same height,
  // so the active card always lines up with the illustration.
  const stage = document.querySelector('.svc-stage');
  const layout = document.querySelector('.svc-thread-layout');
  const header = document.querySelector('.site-header');
  let activeIndex = 0;

  const measure = () => {
    if (!stage || !layout) return;
    const stageHeight = stage.offsetHeight;
    const headerHeight = header?.offsetHeight || 0;
    const top = Math.max(headerHeight + 24, headerHeight + (window.innerHeight - headerHeight - stageHeight) / 2);
    layout.style.setProperty('--stage-h', `${stageHeight}px`);
    layout.style.setProperty('--stage-top', `${Math.round(top)}px`);
  };

  const pickActive = () => {
    frame = 0;
    if (!stage || !stage.offsetParent) return;
    const stageRect = stage.getBoundingClientRect();
    const stageCenter = stageRect.top + stageRect.height / 2;
    let best = 0;
    let bestDistance = Infinity;
    steps.forEach((step, i) => {
      const rect = step.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - stageCenter);
      if (distance < bestDistance) { bestDistance = distance; best = i; }
    });
    if (best !== activeIndex) { activeIndex = best; setActive(best); }
  };

  let frame = 0;
  const schedule = () => { if (!frame) frame = requestAnimationFrame(pickActive); };
  measure();
  pickActive();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', () => { measure(); schedule(); }, { passive: true });

  if (reduceMotion) document.querySelectorAll('.svc-page svg').forEach((svg) => svg.pauseAnimations?.());
})();
