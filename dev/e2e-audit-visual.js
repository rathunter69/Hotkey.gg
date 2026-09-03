/* r160 VISUAL-CLARITY MATRIX — Wolf's standing brief: grid, colors, text, and
   borders must READ on every theme (the formatting drills depend on it).
   For all 27 themes this computes real WCAG contrast from getComputedStyle:
     - gridlines vs the sheet background        (subtle but present: >= 1.15)
     - the applied-border overlay actually paints (r452: >= 2px, the r442 bug class)
     - APPLIED borders (bt/bb/ball) vs bg       (must read as ink: >= 3.0)
     - applied borders vs gridlines             (distinct layers: >= 1.6)
     - every font swatch vs the cell bg         (>= 2.5; white is exempt on
       light themes — Excel parity: white-on-white is invisible there too)
     - blue-fill text vs the blue fill          (>= 3.0)
     - selection outline vs bg                  (>= 2.0)
   Run: node dev/e2e-audit-visual.js   (server on 127.0.0.1:8791)
   r452: BASE overrides the origin, matching e2e-smoke.js (BASE) and e2e-demo-replay.js (URL)
   -- this was the one suite in the fleet that could not be pointed at another port. */
'use strict';
const { chromium } = require('playwright-core');
const BASE = process.env.BASE || 'http://127.0.0.1:8791';
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
let pass = 0, fail = 0;
const ok = (c, n, x) => { if (c) { pass++; } else { fail++; console.log('  FAIL ' + n + (x ? ' — ' + x : '')); } };

function lum(rgb) {
  const [r, g, b] = rgb.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function parseColor(s) {
  const m = String(s).match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
  if (m) return { rgb: [+m[1], +m[2], +m[3]], a: m[4] === undefined ? 1 : +m[4] };
  /* r452 (audit P1-4): CSS Color 4. index.html:286 paints the gridline with
     `color-mix(in srgb, var(--line) 52%, transparent)`, and Chromium serialises that as
     `color(srgb 0.776471 0.760784 0.721569 / 0.52)` — which this regex could not read, so
     contrast() returned null and BOTH the gridline and the applied-border assertions failed on
     every one of the 27 themes with "contrast null". 54 of the 108 baseline failures were this
     one missing branch. Channels are 0-1 floats here, and the alpha is `/ a`, not `, a`. */
  const c = String(s).match(/^color\(srgb\s+([\d.eE+-]+)\s+([\d.eE+-]+)\s+([\d.eE+-]+)(?:\s*\/\s*([\d.eE+-]+))?\s*\)$/);
  if (c) return { rgb: [+c[1] * 255, +c[2] * 255, +c[3] * 255], a: c[4] === undefined ? 1 : +c[4] };
  return null;
}
// composite a possibly-translucent color over a base before measuring
function over(fg, bg) { return fg.rgb.map((v, i) => Math.round(v * fg.a + bg.rgb[i] * (1 - fg.a))); }
function contrast(fgS, bgS) {
  const fg = parseColor(fgS), bg = parseColor(bgS);
  if (!fg || !bg) return null;
  const f = lum(over(fg, bg)), b = lum(bg.rgb);
  const [hi, lo] = f > b ? [f, b] : [b, f];
  return (hi + 0.05) / (lo + 0.05);
}

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 140)));
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1'); localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_gate_off', '1');    localStorage.setItem('hk_xlv', '2');
  } catch (e) {} });
  await page.goto(BASE + '/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof applyTheme === 'function');
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  // dress one board with every formatting feature, once
  await page.evaluate(() => {
    loadChallenge('foot');
    const SW = ['black','darkgray','gray','white','blue','red','orange','yellow','green','purple'];
    for (let i = 0; i < SW.length; i++) { const c = ensure(3 + i, 8); c.value = 123; c.fontColor = SW[i]; }
    const f = ensure(3, 9); f.value = 456; f.fill = 'blue';
    ensure(4, 9).bt = true; ensure(5, 9).bb = true; ensure(6, 9).ball = true;
    render();
  });

  const themes = await page.evaluate(() => Object.keys(THEMES));
  console.log('themes under audit: ' + themes.length);
  for (const th of themes) {
    await page.evaluate((t) => applyTheme(t), th);
    await page.waitForTimeout(140);   // td background transition is .08s — settle before measuring
    const m = await page.evaluate((t) => {
      const $td = (r, c) => document.querySelector('td[data-r="' + r + '"][data-c="' + c + '"]') ||
        [...document.querySelectorAll('td')].find(x => x.dataset && +x.dataset.r === r && +x.dataset.c === c);
      // r212: the visible sheet bg is the .gridwrap DIV (background:var(--surface)), NOT the
      // body — cells are transparent and sit over the gridwrap. On dark themes the sheet is now
      // light (dark chrome, light sheet), so measuring against body would be wrong.
      /* r452 (audit P1-4): .gridwrap is TRANSPARENT now — the sheet paint moved down to
         `table#grid`, and .gridwrap only carries the --surface/--text overrides that make the
         sheet light under a dark theme (index.html:200-207). Reading .gridwrap therefore
         returned `rgba(0, 0, 0, 0)`, which contrast() measures as pure BLACK, and every font
         swatch was scored against black instead of the sheet: "black" (the r204 graphite
         #38352d) came out at 1.38:1 and darkgray #404040 at exactly 2.03:1 on all 27 themes —
         the same number everywhere, which is the tell that the bg, not the theme, was wrong.
         Walk UP from the cell to the first ancestor that actually paints, so this survives the
         next move too. */
      const opaque = (el) => {
        for (let e = el; e; e = e.parentElement) {
          const bg = getComputedStyle(e).backgroundColor;
          const pc = String(bg).match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
          if (pc && (pc[4] === undefined || +pc[4] > 0)) return bg;
        }
        return getComputedStyle(document.body).backgroundColor;
      };
      const anyTd = document.querySelector('td:not(.rowhdr)');
      const sheetBg = opaque(anyTd || document.querySelector('.gridwrap') || document.body);
      const grid = getComputedStyle(anyTd).borderTopColor;
      const tdBg0 = getComputedStyle(anyTd).backgroundColor;
      const bg = (parseFloat((tdBg0.match(/[\d.]+\)$/) || ['1'])[0]) === 0 || tdBg0 === 'rgba(0, 0, 0, 0)') ? sheetBg : tdBg0;
      const sw = {};
      document.querySelectorAll('td').forEach(td => {
        [...td.classList].forEach(cl => { if (cl.indexOf('fc-') === 0) sw[cl.slice(3)] = getComputedStyle(td).color; });
      });
      const fillTd = [...document.querySelectorAll('td.fill-blue')][0];
      const fill = fillTd ? { bg: getComputedStyle(fillTd).backgroundColor, fg: getComputedStyle(fillTd).color } : null;
      /* r452 (audit P1-4): applied border INK moved to the ::after OVERLAY. r442 deleted the
         inline border emitter and r429's box-shadow with it — applied borders now paint on
         `td.ball::after` (index.html:622-626, `border:0 solid var(--rule,var(--text))` with a
         per-edge width). getComputedStyle(td).boxShadow has read "none" ever since, so the
         border-ink assertion scored `contrast null` on all 27 themes and the layer-separation
         assertion never ran at all. Read the pseudo-element, and read its WIDTH too so a
         collapsed overlay (the r442 bug class) can't pass as ink. */
      const bTd = document.querySelector('td.ball');
      const bAfter = bTd ? getComputedStyle(bTd, '::after') : null;
      const bInk = bAfter ? bAfter.borderTopColor : '';
      const bW = bAfter ? parseFloat(bAfter.borderTopWidth) || 0 : 0;
      const acc = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
      return { bg, grid, sw, fill, bInk, bW, acc, dark: document.documentElement.getAttribute('data-dark') === '1' };
    }, th);

    const gc = contrast(m.grid, m.bg);
    ok(gc !== null && gc >= 1.15, th + ': gridlines visible vs sheet bg', 'contrast ' + (gc && gc.toFixed(2)));
    const bcol = m.bInk || null;
    ok(m.bW >= 2, th + ': applied border overlay actually paints', 'border-top-width ' + m.bW + 'px');
    const bc = bcol ? contrast(bcol, m.bg) : null;
    ok(bc !== null && bc >= 3.0, th + ': APPLIED borders read as ink vs bg', 'contrast ' + (bc && bc.toFixed(2)));
    if (bcol && gc) {
      const layerRatio = bc / gc;
      ok(layerRatio >= 1.6, th + ': applied border distinct from gridlines', 'ratio ' + layerRatio.toFixed(2));
    }
    for (const [name, col] of Object.entries(m.sw)) {
      // Excel parity: white font on a light sheet is invisible in real Excel too. r212 decoupled
      // the sheet from the theme (dark chrome, LIGHT sheet), so exempt white whenever the SHEET is
      // light — not just on light themes.
      if (name === 'white') { const bgc = parseColor(m.bg); if (bgc && lum(bgc.rgb) > 0.5) continue; }
      const c = contrast(col, m.bg);
      ok(c !== null && c >= 2.5, th + ': font swatch "' + name + '" legible', 'contrast ' + (c && c.toFixed(2)));
    }
    if (m.fill) {
      const c = contrast(m.fill.fg, m.fill.bg);
      ok(c !== null && c >= 3.0, th + ': blue-fill text vs fill', 'contrast ' + (c && c.toFixed(2)) + ' fg=' + m.fill.fg + ' bg=' + m.fill.bg);
      const fb = contrast(m.fill.bg, m.bg);
      ok(fb !== null && fb >= 1.2, th + ': blue fill visible vs sheet', 'contrast ' + (fb && fb.toFixed(2)));
    }
  }
  await page.evaluate(() => applyTheme('default'));
  const realErrors = errs.filter(e => !/supabase|Failed to fetch|NetworkError|ERR_/i.test(e));
  ok(realErrors.length === 0, 'zero page errors during the sweep', realErrors.join(' | '));
  await browser.close();
  console.log((fail ? 'VISUAL MATRIX: ' + fail + ' FAILURE(S), ' : 'VISUAL MATRIX: ALL ') + pass + ' PASS');
  process.exit(fail ? 1 : 0);
})();
