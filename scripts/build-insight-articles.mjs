// Rebuilds the <main> of every /insights/<slug>/index.html with cross-linking features:
// topic + reading time, reading-route navigator, share tools, in-text links to related
// articles, a related-service CTA, previous/next pager and a scored "Related insights" grid.
// Source of truth for topics and reading routes: /insights-v2/index.html.
// Safe to re-run: it re-derives the article body from the page each time.
//
//   node scripts/build-insight-articles.mjs

import { promises as fs } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const insightsDir = join(root, 'insights');
const SITE = 'https://vectaragroup.com';

const TOPICS = {
  coordination: { label: 'Coordination', glyph: '<rect x="3" y="3" width="11" height="11" rx="1.5"/><rect x="10" y="10" width="11" height="11" rx="1.5"/>' },
  governance: { label: 'Governance & CDE', glyph: '<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>' },
  capture: { label: 'Reality capture', glyph: '<circle cx="5" cy="6" r="1.2"/><circle cx="12" cy="4" r="1.2"/><circle cx="19" cy="7" r="1.2"/><circle cx="7" cy="13" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="10" cy="19" r="1.2"/><circle cx="18" cy="18" r="1.2"/>' },
  standards: { label: 'Model standards', glyph: '<path d="M3 3h18v18H3z"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>' },
  data: { label: 'Data & handover', glyph: '<ellipse cx="12" cy="5.5" rx="7.5" ry="2.5"/><path d="M4.5 5.5v13c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5v-13"/><path d="M4.5 12c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5"/>' },
};

const SERVICES = {
  coordination: { href: '/services/clash-detection-design-coordination/', name: 'Clash detection & design coordination', line: 'We find and close the conflicts before they reach the site.' },
  governance: { href: '/services/common-data-environment-cde-administration/', name: 'Common Data Environment administration', line: 'We govern the project’s information so the right people have the right data.' },
  capture: { href: '/services/reality-capture-digital-twin-handover/', name: 'Reality capture & digital twin handover', line: 'We process site reality into the model and hand over a living twin.' },
  standards: { href: '/services/bim-modelling-coordination/', name: 'BIM modelling & coordination', line: 'We build and federate the model that the whole project coordinates around.' },
  data: { href: '/services/reality-capture-digital-twin-handover/', name: 'Reality capture & digital twin handover', line: 'We process site reality into the model and hand over a living twin.' },
  quantities: { href: '/services/5d-quantities-model-based-measurement/', name: '5D quantities & model-based measurement', line: 'We extract quantities straight from the model for faster, traceable measurement.' },
};
const SERVICE_OVERRIDES = { 'when-to-trust-an-automated-quantity-and-when-to-check-it': 'quantities' };

// Terms linked once, in the body text, to the article that explains them best.
const GLOSSARY = [
  [/ISO 19650/, 'iso-19650-in-plain-language-its-about-controlling-information-not-just-modelling'],
  [/Common Data Environment|\bCDE\b/, 'the-cde-is-a-governance-tool-not-a-file-server'],
  [/clash report/i, 'a-clash-report-nobody-closes-is-worse-than-no-report-at-all'],
  [/clash detection/i, 'clash-detection-pays-for-itself-before-the-first-wall-goes-up'],
  [/point cloud/i, 'from-point-cloud-to-bim-where-the-software-stops-and-judgement-begins'],
  [/reality capture/i, 'from-survey-to-digital-twin-what-reality-capture-actually-delivers'],
  [/coordinate system/i, 'coordinate-systems-get-the-origin-wrong-and-nothing-aligns'],
  [/federated model|federation/i, 'federation-order-matters-why-you-dont-just-throw-models-together'],
  [/Level of Information Need|\bLOIN\b/, 'level-of-information-need-more-detail-is-not-always-better'],
  [/\bLOD\b|Level of Development/, 'lod-and-loin-detail-is-a-cost-so-spend-it-where-it-pays'],
  [/naming (?:convention|standard)s?/i, 'naming-conventions-the-unglamorous-backbone-of-a-usable-model'],
  [/transmittals?/i, 'the-transmittal-boring-essential-and-quietly-legal'],
  [/access (?:list|control)s?/i, 'the-cde-access-list-is-a-security-control-not-an-afterthought'],
  [/as-built (?:data|record)/i, 'why-as-built-data-is-worth-more-to-the-owner-than-to-the-builder'],
  [/digital handover/i, 'handover-should-be-data-not-a-pile-of-pdfs'],
  [/\bIFC\b|open formats?/, 'model-handover-the-formats-that-outlive-the-software'],
  [/quantities/i, 'when-to-trust-an-automated-quantity-and-when-to-check-it'],
  [/model standards?/i, 'garbage-in-garbage-twin-why-model-standards-beat-modelling-talent'],
];
const MAX_INLINE_LINKS = 3;

const STOPWORDS = new Set('a about after all also an and any are as at be because been before but by can do does each even every for from has have how if in into is it its just less made make many may more most much not of often on one only or other out over rather really same so some than that the their them then there these they this those through to too up was what when where which while who whose why will with without would you your model models project information'.split(' '));

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const text = (html) => html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, '’').trim();
const glyph = (t) => `<svg class="ix-glyph" viewBox="0 0 24 24" aria-hidden="true">${TOPICS[t].glyph}</svg>`;
const topicTag = (t, tag = 'span', extra = '') => `<${tag} class="ix-topic" data-t="${t}"${extra}>${glyph(t)}${TOPICS[t].label}</${tag}>`;
const topicHref = (t) => `/insights/?topic=${t}#library`;
const pad = (n) => String(n).padStart(2, '0');
const clip = (s, n = 150) => (s.length <= n ? s : `${s.slice(0, s.lastIndexOf(' ', n))}…`);
const arrow = (dir) => `<span aria-hidden="true">${dir === 'prev' ? '←' : '→'}</span>`;

// ---- 1. Topics and reading routes from the v2 index ---------------------------------------
const indexV2 = await fs.readFile(join(root, 'insights-v2', 'index.html'), 'utf8');
const topicBySlug = {};
for (const m of indexV2.matchAll(/<li class="ix-row" data-topic="(\w+)">[\s\S]*?href="\/insights\/([^/]+)\//g)) topicBySlug[m[2]] = m[1];

const routes = [...indexV2.matchAll(/<article class="ix-path">([\s\S]*?)<\/article>/g)].map(([, block]) => ({
  id: block.match(/ix-path-id">([^<]+)/)[1],
  name: text(block.match(/<h3>([\s\S]*?)<\/h3>/)[1]),
  slugs: [...block.matchAll(/href="\/insights\/([^/]+)\//g)].map((m) => m[1]),
}));

// ---- 2. Read every article -----------------------------------------------------------------
const slugs = (await fs.readdir(insightsDir, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name);
const articles = [];
for (const slug of slugs) {
  const file = join(insightsDir, slug, 'index.html');
  const html = await fs.readFile(file, 'utf8');
  const number = Number(html.match(/Vectara insight (\d+)/)[1]);
  const titleHtml = html.match(/<h1>([\s\S]*?)<\/h1>/)[1];
  const description = html.match(/<meta name="description" content="([^"]*)"/)[1];
  const bodyInner = html.match(/<div class="article-body">([\s\S]*?)<aside>/)[1];
  // Paragraphs without previously injected term links, so re-runs start from clean prose.
  const paragraphs = [...bodyInner.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => m[1].replace(/<a class="ia-term"[^>]*>([\s\S]*?)<\/a>/g, '$1'));
  const plain = paragraphs.map(text).join(' ');
  const words = plain.split(/\s+/).length;
  const topic = topicBySlug[slug];
  if (!topic) throw new Error(`No topic for ${slug} in insights-v2/index.html`);
  articles.push({ slug, file, html, number, titleHtml, title: text(titleHtml), description, paragraphs, plain, words, topic,
    minutes: Math.max(2, Math.round(words / 200)),
    terms: new Set(GLOSSARY.filter(([re, target]) => target !== slug && re.test(plain)).map(([, target]) => target)),
    vocab: new Set(plain.toLowerCase().match(/[a-z][a-z-]{3,}/g).filter((w) => !STOPWORDS.has(w))),
  });
}
articles.sort((a, b) => a.number - b.number);
const bySlug = Object.fromEntries(articles.map((a) => [a.slug, a]));
const routeOf = (slug) => routes.find((r) => r.slugs.includes(slug));

// ---- 3. Relatedness score ------------------------------------------------------------------
function related(a, count = 3) {
  const route = routeOf(a.slug);
  return articles.filter((b) => b !== a).map((b) => {
    let score = 0;
    const reasons = [];
    if (b.topic === a.topic) { score += 3; reasons.push(`More on ${TOPICS[a.topic].label.toLowerCase()}`); }
    if (route && route.slugs.includes(b.slug)) { score += 2; reasons.push(`Also on ${route.id}`); }
    if (a.terms.has(b.slug)) { score += 2.5; reasons.push('Referenced in this article'); }
    if (b.terms.has(a.slug)) { score += 1.5; reasons.push('Builds on this topic'); }
    const shared = [...a.vocab].filter((w) => b.vocab.has(w)).length;
    score += (shared / Math.sqrt(a.vocab.size * b.vocab.size)) * 6;
    return { b, score, reason: reasons[0] || 'Shared themes' };
  }).sort((x, y) => y.score - x.score || x.b.number - y.b.number).slice(0, count);
}

// ---- 4. Markup -----------------------------------------------------------------------------
function linkTerms(a) {
  const used = new Set();
  return a.paragraphs.map((p, i) => {
    if (i === 0) return p; // keep the drop-cap lead paragraph clean
    for (const [re, target] of GLOSSARY) {
      if (used.size >= MAX_INLINE_LINKS || target === a.slug || used.has(target)) continue;
      const m = p.match(re);
      if (!m) continue;
      used.add(target);
      p = `${p.slice(0, m.index)}<a class="ia-term" href="/insights/${target}/" title="${esc(bySlug[target].title)}">${m[0]}</a>${p.slice(m.index + m[0].length)}`;
    }
    return p;
  });
}

function routeMini(a, route) {
  const items = route.slugs.map((s, i) => {
    const b = bySlug[s];
    const current = s === a.slug;
    return `<li${current ? ' class="is-current"' : ''}><a href="/insights/${s}/"${current ? ' aria-current="page"' : ''}><span class="ia-stop">${i + 1}</span><span>${b.titleHtml}</span></a></li>`;
  }).join('');
  return `<div class="ia-rail-block ia-rail-route"><span>Reading route</span><strong>${route.id} · ${esc(route.name)}</strong><ol class="ia-route-mini">${items}</ol></div>`;
}

function routeNav(a, route) {
  const i = route.slugs.indexOf(a.slug);
  const prev = bySlug[route.slugs[i - 1]];
  const next = bySlug[route.slugs[i + 1]];
  const pct = Math.round(((i + 1) / route.slugs.length) * 100);
  const cell = (b, dir) => b
    ? `<a class="ia-route-step ia-route-${dir}" href="/insights/${b.slug}/"><small>${arrow(dir)} ${dir === 'prev' ? 'Previous stop' : 'Next stop'}</small><span>${b.titleHtml}</span></a>`
    : `<a class="ia-route-step ia-route-${dir}" href="/insights/#ix-paths-title"><small>${arrow(dir)} ${dir === 'prev' ? 'Start of route' : 'Route complete'}</small><span>${dir === 'prev' ? 'See all reading routes' : 'Choose another reading route'}</span></a>`;
  return `<nav class="ia-route-nav" aria-label="Reading route ${esc(route.id)}"><div class="ia-route-head"><div><span class="ia-route-id">${route.id}</span><strong>${esc(route.name)}</strong></div><span class="ia-route-count">Stop ${i + 1} of ${route.slugs.length}</span></div><div class="ia-route-bar" role="progressbar" aria-label="Route progress" aria-valuemin="0" aria-valuemax="${route.slugs.length}" aria-valuenow="${i + 1}"><span style="width:${pct}%"></span></div><div class="ia-route-steps">${cell(prev, 'prev')}${cell(next, 'next')}</div></nav>`;
}

function card(b, reason) {
  return `<a class="ia-card" href="/insights/${b.slug}/"><span class="ia-card-top">${topicTag(b.topic)}<span class="ix-num">${pad(b.number)}</span></span><h3>${b.titleHtml}</h3><p>${esc(clip(text(b.description)))}</p><span class="ia-card-foot"><span class="ia-why">${esc(reason)}</span><span>${b.minutes} min read ${arrow('next')}</span></span></a>`;
}

function main(a) {
  const route = routeOf(a.slug);
  const routeIndex = route ? route.slugs.indexOf(a.slug) : -1;
  const service = SERVICES[SERVICE_OVERRIDES[a.slug] || a.topic];
  const prev = articles[articles.indexOf(a) - 1];
  const next = articles[articles.indexOf(a) + 1];
  const url = `${SITE}/insights/${a.slug}/`;
  const shareText = encodeURIComponent(a.title);

  const facts = [
    `<li>${topicTag(a.topic, 'a', ` href="${topicHref(a.topic)}"`)}</li>`,
    `<li>${a.minutes} min read</li>`,
    route ? `<li>${route.id} · stop ${routeIndex + 1} of ${route.slugs.length}</li>` : '',
  ].join('');

  const rail = `<div class="article-meta ia-rail">`
    + `<div class="ia-rail-block"><span>Topic</span>${topicTag(a.topic, 'a', ` href="${topicHref(a.topic)}"`)}</div>`
    + `<div class="ia-rail-block"><span>Reading time</span><strong>${a.minutes} minutes</strong></div>`
    + (route ? routeMini(a, route) : '')
    + `<div class="ia-rail-block"><span>Share</span><div class="ia-share">`
    + `<button type="button" class="ia-share-btn" data-copy-link="${url}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg><span>Copy link</span></button>`
    + `<a class="ia-share-btn" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10.5V17M8 7.5v.01M12 17v-6.5M12 13c0-1.5 1-2.5 2.4-2.5S16.5 11.5 16.5 13v4"/></svg><span>LinkedIn</span></a>`
    + `<a class="ia-share-btn" href="mailto:?subject=${shareText}&amp;body=${encodeURIComponent(url)}"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/></svg><span>Email</span></a>`
    + `</div></div>`
    + `<a class="text-link" href="/insights/">All insights <span aria-hidden="true">←</span></a></div>`;

  const body = `<div class="article-body">${linkTerms(a).map((p) => `<p>${p}</p>`).join('')}`
    + `<aside><strong>Discuss this topic with Vectara.</strong><a href="mailto:services@vectaragroup.com">services@vectaragroup.com</a></aside>`
    + (route ? routeNav(a, route) : '')
    + `<a class="ia-service" href="${service.href}"><span class="ia-service-kicker">Put this into practice</span><strong>${esc(service.name)}</strong><span class="ia-service-line">${esc(service.line)}</span><span class="text-link">Explore the service ${arrow('next')}</span></a>`
    + `</div>`;

  const pager = `<nav class="ia-pager" aria-label="More insights"><div class="container ia-pager-grid">`
    + (prev ? `<a class="ia-pager-link" href="/insights/${prev.slug}/" rel="prev"><small>${arrow('prev')} Previous insight · ${pad(prev.number)}</small><span>${prev.titleHtml}</span></a>` : '<span></span>')
    + (next ? `<a class="ia-pager-link ia-pager-next" href="/insights/${next.slug}/" rel="next"><small>Next insight · ${pad(next.number)} ${arrow('next')}</small><span>${next.titleHtml}</span></a>` : '<span></span>')
    + `</div></nav>`;

  const topicCounts = Object.keys(TOPICS).map((t) => [t, articles.filter((b) => b.topic === t).length]);
  const relatedSection = `<section class="section ia-related" aria-labelledby="ia-related-title"><div class="container">`
    + `<div class="ia-related-head"><div><p class="eyebrow">Keep reading</p><h2 id="ia-related-title">Related insights</h2></div><a class="text-link" href="/insights/">Browse all ${articles.length} insights ${arrow('next')}</a></div>`
    + `<div class="ia-related-grid">${related(a).map(({ b, reason }) => card(b, reason)).join('')}</div>`
    + `<div class="ia-topics"><span>Explore by topic</span><ul>${topicCounts.map(([t, n]) => `<li>${topicTag(t, 'a', ` href="${topicHref(t)}"${t === a.topic ? ' aria-current="true"' : ''}`).replace('</a>', ` <small>${n}</small></a>`)}</li>`).join('')}</ul></div>`
    + `</div></section>`;

  return `<main id="main"><div class="ia-progress" aria-hidden="true"><span></span></div><article class="article ia-article"><header class="article-header"><div class="container">`
    + `<p class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/insights/">Insights</a><span>/</span><a href="${topicHref(a.topic)}">${esc(TOPICS[a.topic].label)}</a></p>`
    + `<p class="eyebrow">Vectara insight ${pad(a.number)}</p><h1>${a.titleHtml}</h1><ul class="ia-facts">${facts}</ul></div></header>`
    + `<div class="container article-layout">${rail}${body}</div></article>${pager}${relatedSection}</main>`;
}

function head(a, html) {
  const url = `${SITE}/insights/${a.slug}/`;
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Article', headline: a.title, description: text(a.description), url, mainEntityOfPage: url, image: `${SITE}/assets/vectara-og.png`, articleSection: TOPICS[a.topic].label, wordCount: a.words, inLanguage: 'en', author: { '@type': 'Organization', name: 'Vectara' }, publisher: { '@type': 'Organization', name: 'Vectara Digital Infrastructure Limited', logo: { '@type': 'ImageObject', url: `${SITE}/assets/vectara-logo.svg` } } },
      { '@type': 'BreadcrumbList', itemListElement: [['Home', `${SITE}/`], ['Insights', `${SITE}/insights/`], [a.title, url]].map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })) },
    ],
  };
  html = html.replace(/<meta property="og:type" content="website">/, '<meta property="og:type" content="article">');
  html = html.replace(/\s*<!--ia-head-->[\s\S]*?<!--\/ia-head-->/, '');
  return html.replace('</head>', `  <!--ia-head--><link rel="stylesheet" href="/insights/article.css"><script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script><script src="/insights/article.js" defer></script><!--/ia-head-->\n</head>`);
}

// ---- 5. Write ------------------------------------------------------------------------------
for (const a of articles) {
  let html = head(a, a.html);
  html = html.replace(/<main id="main">[\s\S]*<\/main>/, () => main(a));
  await fs.writeFile(a.file, html);
}
console.log(`Rebuilt ${articles.length} insight articles (${routes.length} routes).`);
