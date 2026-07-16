/* r282 (#33 SEO round 2) — PER-DRILL LANDING PAGE GENERATOR.
   Loads the real trainer in headless Chrome and dumps CHALLENGES + HOTKEY_DRILLS
   (the live source of truth — no HTML parsing), then writes:
     drills/<key>.html   one indexable page per drill (title/meta/JSON-LD/guide/CTA)
     drills/index.html   the drill library (grouped catalog)
     sitemap.xml         regenerated: static pages + the library + every drill page
   Rerun after adding/renaming drills:
     CHROME=... NODE_PATH=... node dev/build-drill-pages.js
   Pages use <base href="../"> so nav.js/themes.js and their root-relative links
   work unchanged from the /drills/ directory. */
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'drills');
const SITE = 'https://www.hotkey.gg';

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = s => String(s == null ? '' : s).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const jstr = s => JSON.stringify(String(s == null ? '' : s));

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1'); localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_beta_ok', '1');
  } catch (e) {} });
  await page.goto((process.env.URL || 'http://127.0.0.1:8791/index.html'), { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && window.HOTKEY_DRILLS);

  const data = await page.evaluate(() => {
    const groups = HOTKEY_DRILLS.groups.map(g => ({ name: g.name, keys: g.keys.filter(k => CHALLENGES[k]) }));
    const drills = {};
    groups.forEach(g => g.keys.forEach(k => {
      const C = CHALLENGES[k], m = (HOTKEY_DRILLS.meta || {})[k] || {};
      // req/guide are FUNCTIONS on many drills (they name cells from the built board) —
      // build the instance first so this._R/_o exist, then evaluate them.
      let req = '', guide = [];
      try { if (typeof C.build === 'function') C.build.call(C); } catch (e) {}
      try { req = typeof C.req === 'function' ? C.req.call(C) : (C.req || ''); } catch (e) {}
      try { const gd = typeof C.guide === 'function' ? C.guide.call(C) : C.guide;
        guide = Array.isArray(gd) ? gd : []; } catch (e) {}
      drills[k] = {
        key: k, group: g.name,
        name: C.name || m.name || k, label: C.label || m.label || k,
        desc: m.desc || '', aha: C.aha || '', prompt: C.prompt || '',
        req: req || '', guide: guide,
        par: C.par || 0, parKeys: C.parKeys || 0
      };
    }));
    return { groups, drills };
  });
  await browser.close();

  const all = data.groups.flatMap(g => g.keys);
  console.log('drills:', all.length);
  fs.mkdirSync(OUT, { recursive: true });

  const CSS = `
  html{scrollbar-gutter:stable}
  :root{
    --bg:#0c0d0e; --surface:#141517; --surface2:#1c1d20; --line:#26282c;
    --text:#e9e8e3; --muted:#7c7d77; --faint:#4c4d49; --accent:#2ea36f; --accent-dim:#1d6647;
    --accent-glow:rgba(46,163,111,.22); --warn:#d9a441; --bad:#c8533f;
    --mono:'JetBrains Mono',ui-monospace,monospace; --sans:'Hanken Grotesk',system-ui,sans-serif;
  }
  *{box-sizing:border-box; margin:0; padding:0}
  body{background:var(--bg); color:var(--text); font-family:var(--sans); -webkit-font-smoothing:antialiased; line-height:1.6}
  .wrap{max-width:860px; margin:0 auto; padding:0 24px 80px}
  .crumbs{font-family:var(--mono); font-size:11.5px; color:var(--faint); padding:16px 0 4px}
  .crumbs a{color:var(--muted); text-decoration:none} .crumbs a:hover{color:var(--accent)}
  .eyebrow{font-family:var(--mono); font-size:11px; letter-spacing:1.6px; text-transform:uppercase; color:var(--accent); margin:10px 0 8px}
  h1{font-size:26px; font-weight:700; letter-spacing:-.4px; margin-bottom:6px}
  .aha{font-size:15.5px; color:var(--warn); font-style:italic; margin:2px 0 12px}
  .sub{font-size:14.5px; color:var(--muted); max-width:640px}
  .cta-row{display:flex; gap:12px; flex-wrap:wrap; margin:20px 0 8px; align-items:center}
  .cta{font-family:var(--mono); font-size:13px; padding:11px 22px; border-radius:999px; text-decoration:none;
    border:1px solid var(--accent-dim); color:var(--accent)}
  .cta.solid{background:var(--accent); color:#0c0d0e; border-color:var(--accent); font-weight:700}
  .cta:hover{background:var(--accent-glow)} .cta.solid:hover{background:var(--accent); filter:brightness(1.08)}
  .par{font-family:var(--mono); font-size:12px; color:var(--muted)}
  .section-title{font-family:var(--mono); font-size:12px; color:var(--muted); text-transform:uppercase;
    letter-spacing:1.5px; margin:30px 0 12px; padding-bottom:6px; border-bottom:1px solid var(--line)}
  .panel{background:var(--surface); border:1px solid var(--line); border-radius:12px; padding:18px 20px}
  .keys{font-family:var(--mono); font-size:13.5px; color:var(--muted); line-height:2}
  .keys em, .steps em{font-style:normal; color:var(--text); background:var(--surface2); border:1px solid var(--line);
    border-radius:5px; padding:0 6px; font-family:var(--mono); font-size:12.5px}
  .steps{list-style:none; counter-reset:s; display:flex; flex-direction:column; gap:10px}
  .steps li{font-size:13.5px; color:var(--muted); display:flex; gap:14px; align-items:baseline}
  .steps li::before{counter-increment:s; content:counter(s); font-family:var(--mono); font-weight:700; color:var(--accent);
    border:1px solid var(--accent-dim); border-radius:8px; min-width:26px; text-align:center; padding:1px 0; flex:none}
  kbd{font-family:var(--mono); font-size:12px; color:var(--text); background:var(--surface2);
    border:1px solid var(--line); border-radius:5px; padding:0 5px}
  .rel{display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:12px}
  .rel a{display:block; background:var(--surface); border:1px solid var(--line); border-radius:10px;
    padding:12px 14px; text-decoration:none; color:var(--text)}
  .rel a:hover{border-color:var(--accent-dim)}
  .rel .rn{font-family:var(--mono); font-size:12.5px; font-weight:700; color:var(--accent)}
  .rel .rd{font-size:12px; color:var(--muted); margin-top:3px}
  .fine{font-family:var(--mono); font-size:11.5px; color:var(--faint); margin-top:30px; line-height:1.8}
  .fine a{color:var(--muted)}
  .grouphead{font-family:var(--mono); font-size:13px; font-weight:700; color:var(--text); margin:26px 0 10px}
  .grouphead small{color:var(--faint); font-weight:400}`;

  const HEAD = (title, desc, url, ld) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<base href="../">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="hotkey.gg">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/art/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${SITE}/art/og.png">
<link rel="canonical" href="${url}">
<link rel="icon" href="favicon.ico?v=174" sizes="16x16 32x32 48x48">
<link rel="icon" type="image/svg+xml" href="favicon.svg?v=174">
<link rel="apple-touch-icon" href="apple-touch-icon.png?v=174">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"><\/script>
<style>${CSS}</style>
<link rel="stylesheet" href="nav.css?v=174">
<script src="drills.js?v=263"><\/script>
<script>
  const SUPABASE_URL='https://vshtftzrlepedydmkcnm.supabase.co';
  const SUPABASE_ANON_KEY='sb_publishable_yKhIRqtk7w98jUCJYjFWAQ_CMnQ4-yT';
  window.sb=(SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase)?window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY):null;
  window.NAV_ACTIVE='';
<\/script>
<script src="themes.js?v=262"><\/script>
<script type="application/ld+json">${ld}</script>
</head>
<body>
<div id="navMount"></div>
<script src="nav.js?v=258"><\/script>
<div class="wrap">`;

  const FOOT = `
  <div class="fine">
    Excel is a registered trademark of Microsoft Corporation. hotkey.gg is independent and not affiliated with or endorsed by Microsoft.
    More: <a href="reference.html">the shortcut compendium</a> · <a href="drills/index.html">all drills</a> · <a href="About.html">about hotkey.gg</a>.
  </div>
</div>
<div id="siteFooter"></div>
</body>
</html>
`;

  // ---- per-drill pages ----
  for (const g of data.groups) {
    g.keys.forEach((k, i) => {
      const d = data.drills[k];
      const title = `${d.label} — Excel shortcut drill · hotkey.gg`;
      const mdesc = (strip(d.desc || d.aha) + ` Par: ${d.parKeys || d.par} keystrokes. Free interactive Excel drill — no mouse allowed.`).slice(0, 158);
      const url = `${SITE}/drills/${k}.html`;
      const ld = JSON.stringify([{
        '@context': 'https://schema.org', '@type': 'LearningResource',
        name: d.label, description: strip(d.desc || d.aha), url,
        learningResourceType: 'Interactive keyboard drill', interactivityType: 'active',
        educationalLevel: d.group, teaches: strip(d.aha) || strip(d.desc),
        about: { '@type': 'Thing', name: 'Microsoft Excel keyboard shortcuts' },
        provider: { '@type': 'Organization', name: 'hotkey.gg', url: SITE + '/' },
        isAccessibleForFree: true
      }, {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'hotkey.gg', item: SITE + '/' },
          { '@type': 'ListItem', position: 2, name: 'Drill library', item: SITE + '/drills/' },
          { '@type': 'ListItem', position: 3, name: d.label, item: url }
        ]
      }]);
      const prev = i > 0 ? data.drills[g.keys[i - 1]] : null;
      const next = i < g.keys.length - 1 ? data.drills[g.keys[i + 1]] : null;
      const related = g.keys.filter(x => x !== k).slice(0, 4).map(x => data.drills[x]);
      const html = HEAD(title, mdesc, url, ld) + `
  <div class="crumbs"><a href="index.html">hotkey.gg</a> / <a href="drills/index.html">drill library</a> / ${esc(d.group.toLowerCase())}</div>
  <div class="eyebrow">◆ ${esc(d.group)} · drill</div>
  <h1>${esc(d.label)}</h1>
  ${d.aha ? `<div class="aha">${d.aha}</div>` : ''}
  ${d.prompt ? `<div class="sub">${d.prompt}</div>` : `<div class="sub">${esc(strip(d.desc))}</div>`}
  <div class="cta-row">
    <a class="cta solid" href="index.html?drill=${k}">train this drill →</a>
    <span class="par">par ${d.parKeys || d.par} keystrokes · keyboard only · free</span>
  </div>
${d.req ? `
  <div class="section-title">The keys</div>
  <div class="panel"><div class="keys">${d.req}</div></div>` : ''}
${d.guide && d.guide.length ? `
  <div class="section-title">Step by step</div>
  <div class="panel"><ol class="steps">${d.guide.map(s => `<li><span>${s}</span></li>`).join('\n')}</ol></div>` : ''}
${related.length ? `
  <div class="section-title">More ${esc(d.group)} drills</div>
  <div class="rel">
    ${related.map(r => `<a href="drills/${r.key}.html"><div class="rn">${esc(r.label)}</div><div class="rd">${esc(strip(r.desc).slice(0, 90))}</div></a>`).join('\n    ')}
  </div>` : ''}
  <div class="cta-row" style="margin-top:26px">
    ${prev ? `<a class="cta" href="drills/${prev.key}.html">← ${esc(prev.name)}</a>` : ''}
    ${next ? `<a class="cta" href="drills/${next.key}.html">${esc(next.name)} →</a>` : ''}
    <a class="cta" href="drills/index.html">all ${all.length} drills</a>
  </div>` + FOOT;
      fs.writeFileSync(path.join(OUT, k + '.html'), html);
    });
  }

  // ---- the library index ----
  {
    const title = `The drill library — ${all.length} Excel shortcut drills · hotkey.gg`;
    const mdesc = `Every hotkey.gg drill: navigation, formatting, formulas, lookups, and full model builds — ${all.length} interactive Excel keyboard drills with par scores. No mouse allowed.`;
    const url = `${SITE}/drills/`;
    const ld = JSON.stringify([{
      '@context': 'https://schema.org', '@type': 'CollectionPage',
      name: title, description: mdesc, url,
      isPartOf: { '@type': 'WebSite', name: 'hotkey.gg', url: SITE + '/' }
    }, {
      '@context': 'https://schema.org', '@type': 'ItemList',
      itemListElement: all.map((k, i) => ({
        '@type': 'ListItem', position: i + 1, name: data.drills[k].label, url: `${SITE}/drills/${k}.html`
      }))
    }]);
    const html = HEAD(title, mdesc, url, ld) + `
  <div class="crumbs"><a href="index.html">hotkey.gg</a> / drill library</div>
  <div class="eyebrow">◆ the drill library</div>
  <h1>${all.length} drills, zero mouse</h1>
  <div class="sub">The whole curriculum — from arrow-key navigation to full three-statement builds. Every drill has a par, a guided demo, an echo walk, and a leaderboard. The chords are the Windows banker set; on a Mac, ⌘ and ⌥ speak the same language.</div>
  <div class="cta-row">
    <a class="cta solid" href="index.html">start training →</a>
    <a class="cta" href="reference.html">the shortcut compendium</a>
  </div>
${data.groups.map(g => `
  <div class="grouphead">${esc(g.name)} <small>· ${g.keys.length} drills</small></div>
  <div class="rel">
    ${g.keys.map(k => { const d = data.drills[k]; return `<a href="drills/${k}.html"><div class="rn">${esc(d.label)}</div><div class="rd">${esc(strip(d.desc).slice(0, 90))}</div></a>`; }).join('\n    ')}
  </div>`).join('\n')}` + FOOT;
    fs.writeFileSync(path.join(OUT, 'index.html'), html);
  }

  // ---- sitemap ----
  const today = new Date().toISOString().slice(0, 10);
  const staticPages = ['', 'About.html', 'leaderboard.html', 'desks.html', 'stats.html', 'reference.html',
    'contact.html', 'enterprise.html', 'terms.html', 'privacy.html', 'security.html'];
  const urls = [
    ...staticPages.map(p => `  <url><loc>${SITE}/${p}</loc></url>`),
    `  <url><loc>${SITE}/drills/</loc><lastmod>${today}</lastmod></url>`,
    ...all.map(k => `  <url><loc>${SITE}/drills/${k}.html</loc><lastmod>${today}</lastmod></url>`)
  ];
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);

  console.log(`wrote ${all.length} drill pages + library + sitemap (${urls.length} urls)`);
})();
