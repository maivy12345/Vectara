// Insights — option B: topic chips + search filter the library index.
(() => {
  const library = document.querySelector('.ix-library');
  if (!library) return;

  const chips = [...library.querySelectorAll('.ix-chip')];
  const rows = [...library.querySelectorAll('.ix-row')];
  const input = library.querySelector('.ix-search input');
  const count = library.querySelector('.ix-count strong');
  const empty = library.querySelector('.ix-empty');
  let topic = 'all';

  const apply = () => {
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    rows.forEach((row) => {
      const match = (topic === 'all' || row.dataset.topic === topic) && (!q || row.textContent.toLowerCase().includes(q));
      row.hidden = !match;
      if (match) row.style.setProperty('--ix-i', shown++);
    });
    count.textContent = shown;
    empty.hidden = shown > 0;
    library.classList.remove('is-filtering');
    void library.offsetWidth;
    library.classList.add('is-filtering');
  };

  const setTopic = (value) => {
    topic = value;
    chips.forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.filter === value)));
    apply();
  };

  chips.forEach((chip) => chip.addEventListener('click', () => setTopic(chip.dataset.filter)));
  input.addEventListener('input', apply);
  // Article pages link here as /insights/?topic=<id>#library
  const requested = new URLSearchParams(window.location.search).get('topic');
  if (chips.some((chip) => chip.dataset.filter === requested)) setTopic(requested);

  library.querySelector('[data-reset]').addEventListener('click', () => { input.value = ''; setTopic('all'); input.focus(); });
})();
