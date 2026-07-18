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

  // the compendium's chord descriptions — reused as the mini-guide copy
  const ref = await browser.newPage();
  await ref.goto((process.env.URL || 'http://127.0.0.1:8791/index.html').replace('index.html', 'reference.html'), { waitUntil: 'load' });
  await ref.waitForFunction(() => typeof DATA !== 'undefined');
  const refDesc = await ref.evaluate(() => {
    const m = {};
    DATA.forEach(sec => sec.items.forEach(it => { if (!m[it.k]) m[it.k] = it.d; }));
    return m;
  });
  await ref.close();

  const data = await page.evaluate(() => {
    const groups = HOTKEY_DRILLS.groups.map(g => ({ name: g.name, keys: g.keys.filter(k => CHALLENGES[k]) }));
    const drills = {};
    groups.forEach(g => g.keys.forEach(k => {
      const C = CHALLENGES[k], m = (HOTKEY_DRILLS.meta || {})[k] || {};
      // req/guide are FUNCTIONS on many drills (they name cells from the built board) —
      // build the instance first so this._R/_o exist, then evaluate them.
      let req = '', guide = [];
      try { if (typeof mulberry32 === 'function') _rand = mulberry32(424242); } catch (e) {}
      try { if (typeof C.build === 'function') C.build.call(C); } catch (e) {}
      try { req = typeof C.req === 'function' ? C.req.call(C) : (C.req || ''); } catch (e) {}
      try { const gd = typeof C.guide === 'function' ? C.guide.call(C) : C.guide;
        guide = Array.isArray(gd) ? gd : []; } catch (e) {}
      // semantic chord extraction from the demo script — what this drill actually trains.
      // bare Alt starts a ribbon walk collecting the plain letters/digits after it;
      // ctrl/alt chords and F-keys tally as themselves; typed =FORMULAS( name their functions.
      const chords = [], fns = new Set(); const seen = new Set();
      const AR = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' };
      const put = c => { if (c && !seen.has(c)) { seen.add(c); chords.push(c); } };
      try {
        const mv = typeof C.demo === 'function' ? C.demo.call(C) : C.demo;
        let walk = null, typing = '';
        const flushTyping = () => {
          (typing.match(/[A-Za-z]{2,}(?=\()/g) || []).forEach(f => fns.add(f.toUpperCase()));
          typing = '';
        };
        (mv || []).forEach(step => (step.keys || []).forEach(kk => {
          const K = kk.key || '';
          const plain = K.length === 1 && !kk.ctrl && !kk.alt && !kk.shift;
          if (walk !== null && plain && /^[a-z0-9]$/i.test(K)) { walk += '>' + K.toUpperCase(); return; }
          if (walk !== null) { if (walk.includes('>')) put(walk); walk = null; }
          if (K === 'Alt' && !kk.alt) { walk = 'Alt'; flushTyping(); return; }
          if (plain) { typing += K; return; }
          flushTyping();
          if (K === 'Enter' || K === 'Escape' || K === 'Tab' || K === 'Delete' || K === 'Backspace') return;
          if (/^F\d+$/.test(K)) { put(K); return; }
          let mods = ''; if (kk.ctrl) mods += 'Ctrl+'; if (kk.alt) mods += 'Alt+'; if (kk.shift) mods += 'Shift+';
          if (!mods && !AR[K]) return;                       // bare navigation is noise
          if (!mods && AR[K]) return;
          let disp = K === ' ' ? 'Space' : (AR[K] || (K.length === 1 ? K.toUpperCase() : K));
          if (kk.ctrl && kk.shift && K.length === 1 && !/[a-z0-9]/i.test(K)) disp = K;   // Ctrl+Shift+% keeps the symbol
          put(mods + disp);
        }));
        if (walk !== null && walk.includes('>')) put(walk);
        flushTyping();
      } catch (e) {}
      drills[k] = {
        key: k, group: g.name,
        name: C.name || m.name || k, label: C.label || m.label || k,
        desc: m.desc || '', aha: C.aha || '', prompt: C.prompt || '',
        req: req || '', guide: guide,
        par: C.par || 0, parKeys: C.parKeys || 0,
        chords: chords.slice(0, 8), fns: [...fns].slice(0, 6)
      };
    }));
    return { groups, drills };
  });
  await browser.close();

  const all = data.groups.flatMap(g => g.keys);
  console.log('drills:', all.length);
  fs.mkdirSync(OUT, { recursive: true });

  // compendium description lookup (arrow chords are listed combined there), with
  // fallbacks for walks the compendium doesn't list individually
  const FB = {
    'Alt>E>S>E': 'Paste Special — transpose (column ↔ row)',
    'Alt>E>S>I': 'Paste Special — divide in place by the copied value',
    'Alt>E>S>M': 'Paste Special — multiply in place by the copied value',
    'Alt>E>S>T': 'Paste Special — formats only',
    'Alt>E>S>F': 'Paste Special — formulas only',
    'Alt>E>S>W': 'Paste Special — column widths',
    'Alt>H>A>C': 'Align center', 'Alt>H>A>L': 'Align left', 'Alt>H>A>R': 'Align right',
    'Alt>H>A>N': 'Align middle (vertical)',
    'Alt>H>W': 'Wrap text', 'Alt>H>B>K': 'Thick bottom border',
    'Alt>H>D>R': 'Delete rows', 'Alt>H>D>C': 'Delete columns',
    'Alt>H>I>R': 'Insert rows', 'Alt>H>I>C': 'Insert columns',
    'Alt>H>F>I>S': 'Fill series (Home → Fill → Series)',
    'Alt>H>O>W': 'Set column width…',
    'Alt>A>S>D': 'Sort descending (Data tab)', 'Alt>A>S>A': 'Sort ascending (Data tab)',
    'Alt+Shift+→': 'Group rows/columns (outline)', 'Alt+Shift+←': 'Ungroup rows/columns',
    'Ctrl+5': 'Strikethrough', 'Ctrl+Shift+9': 'Unhide rows',
    'Ctrl+[': 'Jump to precedents', 'Ctrl+]': 'Jump to dependents',
    'F5': 'Go To — jump anywhere by reference'
  };
  const refLookup = c => refDesc[c] || refDesc[c.replace(/[↑↓←→]/, '↑/↓/←/→')] || FB[c]
    || FB[Object.keys(FB).find(f => c.startsWith(f)) || ''] || '';
  // one guide sentence per chord: where it earns its keep in real work
  const USES = {
    'Ctrl+C': 'Copy starts almost every hand-off \u2014 grab a finished block once, then place it in the summary, the deck, or next quarter\u2019s column.',
    'Ctrl+X': 'Cut moves a block and drags its references along intact \u2014 the safe way to reorganize a page without breaking the wiring.',
    'Ctrl+V': 'Plain paste brings everything: values, formulas, formats. Reach for Paste Special when you only want part of it.',
    'Ctrl+Z': 'Delete big, undo, keep what deserved to stay \u2014 the undo stack is deep, and working fearlessly is faster than working carefully.',
    'Ctrl+D': 'Build the logic once in the top cell, select down, and stamp it \u2014 the standard way to fill a schedule.',
    'Ctrl+R': 'Same as fill down, but across \u2014 one quarter\u2019s formula becomes the whole year in two keystrokes.',
    'Ctrl+B': 'Bold marks structure: titles, total rows, anything the reviewer\u2019s eye should land on first.',
    'Ctrl+I': 'Italics are the convention for memos, footnotes, and anything explanatory rather than computed.',
    'Ctrl+5': 'Strikethrough marks a line dead without deleting it \u2014 the audit trail stays visible.',
    'Ctrl+H': 'Find & Replace fixes a mislabeled quarter or a stale entity name across the whole tab in one pass.',
    'Ctrl+1': 'The master formatting dialog \u2014 number formats, alignment, borders in one place when a ribbon walk would take longer.',
    'Ctrl+Home': 'Back to A1 \u2014 end every session with the cursor home so the next person opens the tab clean.',
    'Ctrl+[': 'Jump to the cells a formula reads from \u2014 the fastest way to audit where a number comes from.',
    'Ctrl+]': 'Jump to the cells that depend on this one \u2014 check what breaks before you change anything.',
    'Ctrl+\u2191': 'Edge-jumping crosses a 500-row tape in two keystrokes instead of a held-down arrow key.',
    'Ctrl+\u2193': 'Edge-jumping crosses a 500-row tape in two keystrokes instead of a held-down arrow key.',
    'Ctrl+\u2190': 'Edge-jumping crosses a wide page in two keystrokes \u2014 the horizontal version of the same move.',
    'Ctrl+\u2192': 'Edge-jumping crosses a wide page in two keystrokes \u2014 the horizontal version of the same move.',
    'Ctrl+Shift+\u2193': 'Select from here to the edge of the data \u2014 the standard grab before formatting or filling a column.',
    'Ctrl+Shift+\u2192': 'Select from here to the end of the row \u2014 grab a header or a year of quarters in one chord.',
    'Shift+\u2192': 'Nudge a selection one cell at a time when the block you need doesn\u2019t end at a data edge.',
    'Ctrl+Space': 'Select the whole column \u2014 the setup move for inserting, deleting, or formatting column-wide.',
    'Shift+Space': 'Select the whole row \u2014 pair it with Ctrl+Shift+= to insert, Ctrl+- to delete.',
    'Ctrl+Shift+$': 'Price columns and per-share figures read as money instantly \u2014 standard on comps pages and output rows.',
    'Ctrl+Shift+%': 'Margins, growth rates, weights \u2014 any ratio gets the percent treatment the moment it\u2019s computed.',
    'Ctrl+Shift+!': 'The default for raw numbers: thousands separators, two decimals, readable at a glance.',
    'Ctrl+Shift+9': 'Unhide rows an export or a previous owner collapsed \u2014 hidden detail is where errors hide too.',
    'Ctrl+Shift+L': 'Filters on and off over a header row \u2014 the first triage tool on any raw export.',
    'Alt+=': 'AutoSum reads the block above or beside the cursor and proposes the SUM \u2014 foot rows and columns without typing a formula.',
    'Alt+\u2193': 'Opens the dropdown under the cell \u2014 pick from values already in the column for consistent labels.',
    'Alt+Shift+\u2192': 'Group detail rows so a reviewer can collapse to the summary \u2014 finished models ship with the detail folded.',
    'Alt+Shift+\u2190': 'Ungroup when the outline no longer matches the page \u2014 structure should follow the content.',
    'F2': 'Edit-in-place lights up every cell a formula touches \u2014 the first move when a number looks wrong.',
    'F4': 'Cycles $A$1 \u2192 A$1 \u2192 $A1 \u2192 A1 while editing \u2014 pin the row, the column, or both before filling across a grid.',
    'F5': 'Go To jumps to any reference on the tab \u2014 long-distance travel on big pages.',
    'Alt>E>S>V': 'The values-only paste is how numbers leave a model safely: no formulas, no links, nothing to break downstream.',
    'Alt>E>S>T': 'Clone a finished row\u2019s look \u2014 commas, decimals, borders \u2014 onto raw numbers without touching the values.',
    'Alt>E>S>E': 'Transpose flips a block between column and row \u2014 labels running the wrong way, fixed in one dialog.',
    'Alt>E>S>I': 'Paste-divide rescales in place \u2014 raw dollars become $000s with no helper column.',
    'Alt>E>S>M': 'Paste-multiply scales or sign-flips a block at once \u2014 costs typed positive become negative in one pass.',
    'Alt>H>K': 'Comma style on any block of raw numbers \u2014 readable thousands in three keys.',
    'Alt>H>0': 'Add decimals until the figure carries the precision the page needs.',
    'Alt>H>9': 'Strip decimals \u2014 share counts and headcounts don\u2019t want cents.',
    'Alt>H>H': 'Fill color shades input cells and flags rows for review \u2014 the visual layer of house style.',
    'Alt>H>F>C': 'Font color: blue inputs, black formulas \u2014 the oldest convention in banking models, still enforced.',
    'Alt>H>B>B': 'Bottom border under headers \u2014 rulings mark structure, not decoration.',
    'Alt>H>B>T': 'Top border above a total row \u2014 the accounting ruling that says \u201cthis line sums the ones above.\u201d',
    'Alt>H>B>O': 'Bottom double border closes a finished schedule \u2014 the page\u2019s way of saying done.',
    'Alt>H>B>A': 'Box a block to set it apart \u2014 the headline number earns a frame.',
    'Alt>H>B>N': 'Clear borders a paste dragged along \u2014 formats travel with copies whether you want them or not.',
    'Alt>H>B>K': 'The thick box for the number the page exists to produce.',
    'Alt>H>A>C': 'Center headers over their columns \u2014 alignment is half of readability.',
    'Alt>H>A>L': 'Left-align labels \u2014 text reads from the left, numbers from the right.',
    'Alt>H>A>R': 'Right-align headers over number columns so they sit flush with their digits.',
    'Alt>H>A>N': 'Middle-align vertically when rows get tall \u2014 wrapped headers stay centered.',
    'Alt>H>W': 'Wrap long header text instead of widening the column \u2014 the layout survives.',
    'Alt>H>O>I': 'The ##### fix: autofit the column to its widest entry in three keys.',
    'Alt>H>O>W': 'Exact column widths when autofit gives a ragged page \u2014 uniform width is part of house style.',
    'Alt>H>D>R': 'Delete full rows as structure changes \u2014 live formulas rewire themselves around the edit.',
    'Alt>H>D>C': 'Delete full columns cleanly \u2014 references adjust, nothing dangles.',
    'Alt>H>I>R': 'Insert rows where the schedule grows \u2014 a live SUM widens to absorb the new line.',
    'Alt>H>I>C': 'Insert columns for the new quarter \u2014 the model makes room without re-keying.',
    'Alt>H>F>I>S': 'Fill Series generates date and number sequences \u2014 a year of quarter headers in seconds.',
    'Alt>A>S>D': 'Sort the tape before reading it \u2014 biggest positions first is how a book gets reviewed.',
    'Alt>A>S>A': 'Ascending sort for dates and IDs \u2014 chronology before analysis.',
    'Alt>A>H': 'Collapse grouped detail to read the summary \u2014 the fold hides rows without deleting them.'
  };
  const useLookup = c => USES[c] || USES[Object.keys(USES).find(f => c.startsWith(f)) || ''] || '';
  // KeyTips-forward mac forms: ⌘ plays Ctrl, ⌥ walks the ribbon, F4→⌘T, F2→⌃U
  const macForm = c => {
    if (c === 'F2') return '⌃U · fn F2';
    if (c === 'F4') return '⌘T · fn F4';
    if (/^F\d+$/.test(c)) return 'fn ' + c;
    if (c.startsWith('Alt>')) return '⌥ ' + c.slice(4).split('>').join(' ').toLowerCase();
    if (c === 'Alt+=') return '⌥ =';
    return c.replace(/Ctrl\+/g, '⌘').replace(/Shift\+/g, '⇧').replace(/Alt\+/g, '⌥');
  };
  const dispWin = c => c.startsWith('Alt>') ? 'Alt ' + c.slice(4).split('>').join(' ').toLowerCase() : c;

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
  .scb{padding:13px 0; border-bottom:1px solid var(--line)}
  .scb:last-child{border-bottom:0; padding-bottom:2px}
  .sch{display:flex; gap:14px; align-items:baseline; flex-wrap:wrap}
  .sch kbd{padding:1px 8px; font-size:12.5px}
  .sch .m{font-family:var(--mono); font-size:11.5px; color:var(--faint)}
  .sch .what{font-size:13.5px; color:var(--text); font-weight:600}
  .scb .use{font-size:13px; color:var(--muted); margin-top:5px; max-width:640px}
  .walknote{font-family:var(--mono); font-size:11.5px; color:var(--muted); margin-bottom:6px; padding-bottom:11px; border-bottom:1px solid var(--line)}
  .fnline{font-family:var(--mono); font-size:12px; color:var(--muted); margin-top:12px; padding-top:10px; border-top:1px solid var(--line)}
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
<link rel="stylesheet" href="nav.css?v=179">
<script src="drills.js?v=265"><\/script>
<script>
  const SUPABASE_URL='https://vshtftzrlepedydmkcnm.supabase.co';
  const SUPABASE_ANON_KEY='sb_publishable_yKhIRqtk7w98jUCJYjFWAQ_CMnQ4-yT';
  window.sb=(SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase)?window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY):null;
  window.NAV_ACTIVE='';
<\/script>
<script src="themes.js?v=267"><\/script>
<script type="application/ld+json">${ld}</script>
</head>
<body>
<div id="navMount"></div>
<script src="nav.js?v=271"><\/script>
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
      const mdesc = (strip(d.desc || d.aha) + ` Par ${d.par}s, optimal ${d.parKeys} keys. Free interactive Excel drill — no mouse allowed.`).slice(0, 158);
      const url = `${SITE}/drills/${k}.html`;
      const ld = JSON.stringify([{
        '@context': 'https://schema.org', '@type': 'LearningResource',
        name: d.label, description: strip(d.desc || d.aha), url,
        learningResourceType: 'Interactive keyboard drill', interactivityType: 'active',
        educationalLevel: d.group, teaches: strip(d.aha) || strip(d.desc),
        about: { '@type': 'Thing', name: 'Microsoft Excel keyboard shortcuts' },
        timeRequired: 'PT' + (d.par || 30) + 'S',
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
    <span class="par">par ${d.par}s · optimal ${d.parKeys} keys · keyboard only · free</span>
  </div>
${d.chords.length ? `
  <div class="section-title">The shortcuts in this drill</div>
  <div class="panel">${d.chords.some(c => c.startsWith('Alt>')) ? `
    <div class="walknote">Alt walks: tap <kbd>Alt</kbd>, release, then the letters in sequence — each key steps one ribbon menu. On a Mac, tap <kbd>⌥</kbd> and use the same letters (KeyTips, Excel 2024+).</div>` : ''}
${d.chords.map(c => { const what = refLookup(c); const use = useLookup(c); return `    <div class="scb"><div class="sch"><kbd>${esc(dispWin(c))}</kbd><span class="m">${esc(macForm(c))} on mac</span>${what ? `<span class="what">${esc(what)}</span>` : ''}</div>${use ? `<div class="use">${esc(use)}</div>` : ''}</div>`; }).join('\n')}${d.fns.length ? `
    <div class="fnline">functions you'll type: ${d.fns.map(f => `<b style="color:var(--text)">${esc(f)}()</b>`).join(' · ')}</div>` : ''}
  </div>` : ''}
${d.req ? `
  <div class="section-title">The optimal line</div>
  <div class="panel"><div style="font-family:var(--mono);font-size:11.5px;color:var(--faint);margin-bottom:10px">the par-setting sequence, straight through:</div><div class="keys">${d.req}</div></div>` : ''}
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
  <div class="sub">The whole curriculum — from arrow-key navigation to full three-statement builds. Every drill has a par time, an optimal key count, a watchable demo, a follow-along walkthrough, and a leaderboard. The chords are the Windows banker set; on a Mac, ⌘ and ⌥ speak the same language.</div>
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
  const staticPages = ['', 'About.html', 'leaderboard.html', 'desks.html', 'stats.html', 'reference.html',
    'contact.html', 'enterprise.html', 'terms.html', 'privacy.html', 'security.html'];
  const urls = [
    ...staticPages.map(p => `  <url><loc>${SITE}/${p}</loc></url>`),
    `  <url><loc>${SITE}/drills/</loc></url>`,
    ...all.map(k => `  <url><loc>${SITE}/drills/${k}.html</loc></url>`)
  ];
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);

  // ---- refmap.js: chord → the drill that best teaches it (r291) ----
  // The reference page uses this to add "practice →" links. First drill in catalog
  // order wins per chord — that's the most foundational one teaching it. Keys are
  // normalized (uppercase, spaces stripped) so the reference page can match its own
  // key strings against them.
  const norm = c => String(c).toUpperCase().replace(/\s+/g, '');
  const chordDrill = {};
  all.forEach(k => (data.drills[k].chords || []).forEach(c => {
    const n = norm(c); if (!chordDrill[n]) chordDrill[n] = k;
  }));
  fs.writeFileSync(path.join(ROOT, 'refmap.js'),
    '/* GENERATED by dev/build-drill-pages.js — chord → representative drill key.\n' +
    '   Powers the "practice →" links on reference.html. Do not edit by hand. */\n' +
    'window.HK_CHORD_DRILL = ' + JSON.stringify(chordDrill, null, 0) + ';\n');

  console.log(`wrote ${all.length} drill pages + library + sitemap (${urls.length} urls) + refmap (${Object.keys(chordDrill).length} chords)`);
})();
