// Approach page: drives the sticky method loop from the step in view.
(() => {
  const loop = document.querySelector('.ap-loop');
  const steps = [...document.querySelectorAll('.ap-step')];
  if (!loop || !steps.length) return;

  const nodes = [...loop.querySelectorAll('.ap-loop-nodes li')];
  const num = loop.querySelector('.ap-loop-num');
  const label = loop.querySelector('.ap-loop-label');
  let current = -1;

  const setActive = (index) => {
    if (index === current) return;
    current = index;
    steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
    nodes.forEach((node, i) => {
      node.classList.toggle('is-active', i === index);
      node.classList.toggle('is-done', i < index);
    });
    loop.style.setProperty('--ap-progress', ((index + 1) / steps.length) * 100);
    loop.classList.toggle('is-complete', index === steps.length - 1);
    loop.classList.add('is-swapping');
    setTimeout(() => {
      num.textContent = String(index + 1).padStart(2, '0');
      label.textContent = steps[index].dataset.label;
      loop.classList.remove('is-swapping');
    }, 200);
  };

  setActive(0);
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(steps.indexOf(entry.target));
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach((step) => observer.observe(step));
})();
