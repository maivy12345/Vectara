const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
  navigation?.classList.toggle('open', !open);
});

navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Open navigation');
  navigation.classList.remove('open');
}));

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || !navigation?.classList.contains('open')) return;
  navigation.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Open navigation');
  menuButton?.focus();
});

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const path = window.location.pathname.toLowerCase();
const visualForPath = () => {
  if (/reality|point-cloud|survey|as-built|capture/.test(path)) {
    return {
      src: '/assets/reality-capture-point-cloud.png',
      alt: 'Point-cloud survey data resolving into a coordinated infrastructure model',
      label: 'Reality captured · Model verified'
    };
  }
  if (/about|sectors|contact|careers|infrastructure|utilities/.test(path)) {
    return {
      src: '/assets/digital-city-infrastructure.png',
      alt: 'Urban infrastructure connected through a coordinated digital model',
      label: 'Physical assets · Connected information'
    };
  }
  return {
    src: '/assets/bim-digital-twin.png',
    alt: 'Federated BIM model coordinating architecture, structure and building services',
    label: 'One model · One controlled truth'
  };
};

const heroProfileForPath = () => {
  if (/privacy|terms|cookies/.test(path)) {
    return {
      index: 'DOC',
      panelIndex: 'INFORMATION / CONTROLLED',
      panel: 'Clear terms.<br><strong>Responsible information.</strong>',
      status: 'Published record',
      rail: ['Transparent', 'Current', 'Governed'],
      facts: [['Plain language', 'Clear by design'], ['Data care', 'Privacy minded'], ['Hong Kong', 'Applicable context']]
    };
  }
  if (/404/.test(path) || document.title.startsWith('Page not found')) {
    return {
      index: '404',
      panelIndex: 'ROUTE / NOT FOUND',
      panel: 'A missing link.<br><strong>A clear way forward.</strong>',
      status: 'Navigation ready',
      rail: ['Return', 'Explore', 'Connect'],
      facts: [['Home', 'Start again'], ['Services', 'Explore capability'], ['Contact', 'Talk to us']]
    };
  }
  if (/approach|how-we-work/.test(path)) {
    return {
      index: '03',
      panelIndex: 'METHOD / 01—05',
      panel: 'Govern first.<br><strong>Verify at handover.</strong>',
      status: 'Workflow controlled',
      rail: ['Govern', 'Coordinate', 'Verify'],
      facts: [['ISO 19650', 'Working standard'], ['Fixed cadence', 'Visible progress'], ['Audit trail', 'Every decision']]
    };
  }
  if (/sectors/.test(path)) {
    return {
      index: '04',
      panelIndex: 'ASSETS / CONNECTED',
      panel: 'Different assets.<br><strong>One data discipline.</strong>',
      status: 'Asset context mapped',
      rail: ['Infrastructure', 'Buildings', 'Operations'],
      facts: [['Infrastructure', 'Networks & utilities'], ['Buildings', 'Mixed-use assets'], ['Operations', 'Living records']]
    };
  }
  if (/insights/.test(path)) {
    return {
      index: '05',
      panelIndex: 'INSIGHT / PRACTICAL',
      panel: 'Technical thinking.<br><strong>Operational value.</strong>',
      status: 'Evidence reviewed',
      rail: ['Question', 'Explain', 'Apply'],
      facts: [['BIM', 'Coordination'], ['Information', 'Governance'], ['Handover', 'Digital assets']]
    };
  }
  if (/careers/.test(path)) {
    return {
      index: '06',
      panelIndex: 'CAREERS / VECTARA',
      panel: 'Senior work.<br><strong>Measurable impact.</strong>',
      status: 'Built by specialists',
      rail: ['Curious', 'Disciplined', 'Hands-on'],
      facts: [['Specialists', 'Senior delivery'], ['Standards', 'Work with rigour'], ['Impact', 'See the outcome']]
    };
  }
  if (/contact/.test(path)) {
    return {
      index: '07',
      panelIndex: 'PROJECT / START',
      panel: 'Start with clarity.<br><strong>Build with confidence.</strong>',
      status: 'Conversation open',
      rail: ['Scope', 'Align', 'Mobilise'],
      facts: [['Hong Kong', 'Local base'], ['Independent', 'Direct advice'], ['Responsive', 'Senior contact']]
    };
  }
  return {
    index: '02',
    panelIndex: 'DELIVERY / CONNECTED',
    panel: 'From first model.<br><strong>To verified handover.</strong>',
    status: 'Information coordinated',
    rail: ['Model', 'Measure', 'Handover'],
    facts: [['Coordinate', 'One model'], ['Measure', 'Traceable output'], ['Govern', 'One source of truth']]
  };
};

const heroActionsForPath = () => {
  if (/privacy|terms|cookies/.test(path)) return [];
  if (/404/.test(path) || document.title.startsWith('Page not found')) return [['Back to home', '/'], ['Explore services', '/services/']];
  if (/contact/.test(path)) return [['Email our team', 'mailto:services@vectaragroup.com'], ['Explore services', '/services/']];
  if (/careers/.test(path)) return [['See openings', '#openings'], ['About Vectara', '/about/']];
  return [['Discuss a project', '/contact/'], ['Explore services', '/services/']];
};

// Shared hero visual — the same framed, scanning model view used on /services/
const buildHeroVisual = (visual, profile) => {
  const [fact, detail] = profile.facts[0];
  const wrap = document.createElement('div');
  wrap.className = 'svc-hero-visual';
  wrap.setAttribute('aria-hidden', 'true');
  wrap.innerHTML = `<div class="svc-hero-frame"><img src="${visual.src}" alt="" width="1536" height="1024" loading="eager"><span class="svc-scanline"></span></div>`
    + '<div class="svc-orbit svc-orbit-a"></div><div class="svc-orbit svc-orbit-b"></div>'
    + `<div class="svc-chip svc-chip-1"><i></i>${profile.status}</div>`
    + `<div class="svc-chip svc-chip-2"><b>${fact}</b> ${detail.charAt(0).toLowerCase()}${detail.slice(1)}</div>`
    + `<div class="svc-chip svc-chip-3"><i class="is-cyan"></i>${profile.facts[1][0]}</div>`;
  return wrap;
};

const innerHeroGrid = document.querySelector('.inner-hero-grid');
const innerHeroLead = innerHeroGrid?.querySelector(':scope > .lead');
if (innerHeroGrid && innerHeroLead) {
  const profile = heroProfileForPath();
  const copy = innerHeroGrid.firstElementChild;
  copy?.classList.add('inner-hero-copy');
  copy?.append(innerHeroLead);

  const actions = heroActionsForPath();
  if (actions.length) {
    const [[primaryLabel, primaryHref], [ghostLabel, ghostHref]] = actions;
    const row = document.createElement('div');
    row.className = 'svc-hero-actions';
    row.innerHTML = `<a class="button button-primary" href="${primaryHref}">${primaryLabel}</a><a class="svc-ghost-link" href="${ghostHref}">${ghostLabel} <span aria-hidden="true">→</span></a>`;
    copy?.append(row);
  }

  innerHeroGrid.append(buildHeroVisual(visualForPath(), profile));
}

const articleHeader = document.querySelector('.article-header');
const articleLayout = document.querySelector('.article-layout');
if (articleHeader && articleLayout) {
  const headerContainer = articleHeader.querySelector(':scope > .container');
  const copy = document.createElement('div');
  copy.className = 'article-header-copy';
  while (headerContainer?.firstChild) copy.append(headerContainer.firstChild);
  headerContainer?.append(copy, buildHeroVisual(visualForPath(), heroProfileForPath()));
}

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const revealTargets = document.querySelectorAll('.section .card, .section .prose-grid > *, .timeline article, .sector-detail, .sector-panel');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -36px' });
  revealTargets.forEach((target) => {
    target.classList.add('reveal-ready');
    revealObserver.observe(target);
  });
}

const servicesThread = document.querySelector('.services-thread');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (servicesThread && !reduceMotion && 'IntersectionObserver' in window) {
  const threadIntro = servicesThread.querySelector('.services-thread-intro');
  const threadList = servicesThread.querySelector('.thread-list');
  const threadItems = [...servicesThread.querySelectorAll('.thread-list > li')];

  servicesThread.classList.add('thread-motion');
  threadItems.forEach((item, index) => {
    item.style.setProperty('--thread-delay', `${Math.min(index * 70, 210)}ms`);
  });

  const threadRevealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in-view');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -8%' });

  if (threadIntro) threadRevealObserver.observe(threadIntro);
  threadItems.forEach((item) => threadRevealObserver.observe(item));

  let threadFrame = 0;
  const updateThreadProgress = () => {
    threadFrame = 0;
    if (!threadList) return;
    const listRect = threadList.getBoundingClientRect();
    const marker = window.innerHeight * 0.58;
    const trackStart = listRect.top + 36;
    const trackLength = Math.max(1, listRect.height - 72);
    const progress = Math.min(1, Math.max(0, (marker - trackStart) / trackLength));
    servicesThread.style.setProperty('--thread-progress', progress.toFixed(4));
  };

  const scheduleThreadProgress = () => {
    if (threadFrame) return;
    threadFrame = requestAnimationFrame(updateThreadProgress);
  };

  updateThreadProgress();
  window.addEventListener('scroll', scheduleThreadProgress, { passive: true });
  window.addEventListener('resize', scheduleThreadProgress, { passive: true });
}

const form = document.getElementById('contact-form');
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  if (data.get('website')) return;
  const subject = `Website enquiry — ${data.get('name')}, ${data.get('company')}`;
  const body = [`Name: ${data.get('name')}`, `Company: ${data.get('company')}`, `Email: ${data.get('email')}`, `Phone: ${data.get('phone') || 'Not provided'}`, '', String(data.get('message'))].join('\n');
  const status = document.getElementById('form-status');
  if (status) status.textContent = 'Your email application will open with this enquiry ready to send.';
  track('form_submit', { form_name: 'contact' });
  window.location.href = `mailto:services@vectaragroup.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

const cookieBanner = document.getElementById('cookie-banner');
try {
  if (cookieBanner && !localStorage.getItem('vectara-cookie-choice')) cookieBanner.hidden = false;
} catch {}

document.querySelectorAll('[data-cookie]').forEach((button) => button.addEventListener('click', () => {
  try { localStorage.setItem('vectara-cookie-choice', button.dataset.cookie); } catch {}
  if (cookieBanner) cookieBanner.hidden = true;
}));

function track(eventName, parameters = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...parameters });
}

document.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  const url = new URL(link.href, window.location.href);
  const isCta = link.classList.contains('button') || link.closest('.cta-band');
  if (isCta) track('cta_click', { link_text: link.textContent.trim(), link_url: url.href });
  if (url.origin !== window.location.origin && !['mailto:', 'tel:'].includes(url.protocol)) {
    track('outbound_click', { link_url: url.href });
  }
  if (/\.(pdf|docx?|xlsx?|zip)$/i.test(url.pathname)) track('file_download', { file_url: url.href });
}));

const reportedDepths = new Set();
let scrollScheduled = false;
window.addEventListener('scroll', () => {
  if (scrollScheduled) return;
  scrollScheduled = true;
  requestAnimationFrame(() => {
    scrollScheduled = false;
    const available = document.documentElement.scrollHeight - window.innerHeight;
    const depth = available > 0 ? Math.round((window.scrollY / available) * 100) : 100;
    [25, 50, 75, 100].forEach((threshold) => {
      if (depth >= threshold && !reportedDepths.has(threshold)) {
        reportedDepths.add(threshold);
        track('scroll_depth', { percent_scrolled: threshold });
      }
    });
  });
}, { passive: true });

// Cards that point to a single destination are clickable anywhere, not just on their link.
document.querySelectorAll('.card, .thread-service, [class*="-card"]').forEach((card) => {
  if (card.closest('a') || card.querySelector('form, input, select, textarea, button')) return;
  const links = [...card.querySelectorAll('a[href]')];
  if (!links.length || new Set(links.map((link) => link.href)).size !== 1) return;
  if (/^(mailto|tel):/.test(links[0].href)) return;
  const link = links[0];
  card.classList.add('is-clickable');
  const open = (event) => {
    if (event.target.closest('a, button, summary, label')) return;
    if (window.getSelection()?.toString()) return;
    if (event.button === 1 || event.ctrlKey || event.metaKey || event.shiftKey) {
      window.open(link.href, '_blank', 'noopener');
      return;
    }
    if (event.button === 0) link.click();
  };
  card.addEventListener('click', open);
  card.addEventListener('auxclick', open);
});
