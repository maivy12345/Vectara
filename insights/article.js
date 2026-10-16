// Insight article — reading progress bar and copy-link share button.
(() => {
  const progress = document.querySelector('.ia-progress');
  const body = document.querySelector('.article-body');
  if (progress && body) {
    let ticking = false;
    const update = () => {
      const rect = body.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      const value = Math.min(1, Math.max(0, -rect.top / Math.max(total, 1)));
      progress.style.setProperty('--ia-p', value.toFixed(3));
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  document.querySelectorAll('[data-copy-link]').forEach((button) => {
    const label = button.querySelector('span');
    const original = label.textContent;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copyLink);
        label.textContent = 'Copied';
      } catch {
        label.textContent = 'Copy failed';
      }
      button.classList.add('is-done');
      setTimeout(() => { label.textContent = original; button.classList.remove('is-done'); }, 2000);
    });
  });
})();
