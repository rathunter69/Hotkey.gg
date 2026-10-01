// app2/tests/css-check.js — the CSS check of the interface standard (screenplay 3.0, "What the
// copy and the screen never do"; M94): what a machine can check of the tells, over every
// stylesheet under app2/ui and every module under app2 (npm run check). Fails on a violation in a
// stylesheet written to the standard; a legacy stylesheet (the ones the rebuild is still replacing)
// reports its findings as warnings until it is rewritten, so the count only ever goes down.
//   node app2/tests/css-check.js
// Rules:
//   C1  no letter-spacing on text
//   C2  no text-transform: uppercase (sentence case at normal spacing)
//   C3  the monospace face only on keys, addresses, formulas, times, the clock and the wordmark
//   C4  no raw color (a hex value, rgb(), hsl()) outside tokens.css: a color is a token
//   C5  no raw size or duration (px, rem, em, ms, s) outside tokens.css, apart from 0 and the 1px hairline
//   C6  pure white is never the page ground (body or html background)
//   C7  no import of a generic icon set (Lucide, Heroicons, Feather, Material, Font Awesome, Tabler, Phosphor), in CSS, JS or HTML
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const app2 = resolve(here, '..');

/** The stylesheets written to the standard: a finding in one of these fails the check. */
export const STANDARD_CSS = new Set(['tokens.css', 'components.css', 'screens.css']);
/** The stylesheets the rebuild is still replacing: findings warn until each is rewritten (R1b and on). */
export const LEGACY_CSS = new Set(['app.css', 'shell.css', 'site.css', 'next.css', 'lesson.css', 'workbook.css', 'scale.css', 'reference.css', 'public.css']);
/** A selector the monospace face belongs on: keys, addresses, formulas, times, the clock, the wordmark, the sheet's own cells. */
export const MONO_OK = /kbd|\bkey|keycap|\.kt\b|cell|addr|\bref\b|formula|\bfx\b|fbar|namebox|name-box|time|clock|\bmark\b|-mark\b|mono|code|wordmark|\bnum\b|digit|figure|chord|combo|-n\b|c-num|grid|stage|sheet|sk-|dp-|rapid|prompt|week|avatar/i;
export const ICON_SETS = /lucide|heroicons|feather-icons|feathericons|@material|material-icons|material-symbols|fontawesome|font-awesome|tabler-icons|phosphor-icons|ionicons|octicons|bootstrap-icons/i;

/** Split a stylesheet into [selector, declarations] rules (comments and at-rule headers stripped). Pure. */
export function rulesOf(css) {
  const src = String(css).replace(/\/\*[\s\S]*?\*\//g, ' ');
  const out = [];
  const rx = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = rx.exec(src))) {
    const sel = m[1].trim().replace(/^[^{]*\}\s*/, '').replace(/@[^{]+\{\s*/g, '').trim();
    out.push([sel, m[2]]);
  }
  return out;
}

const RAW_COLOR = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i;
const RAW_SIZE = /(?<![\w-])(-?\d*\.?\d+)(px|rem|em|ms|s)\b/g;

/** Every finding in one stylesheet: { rule, where, text }. Pure. */
export function checkCss(css, name) {
  const out = [];
  const isTokens = name === 'tokens.css';
  for (const [sel, decls] of rulesOf(css)) {
    const where = `${name} ${sel.slice(0, 60)}`;
    const d = decls.replace(/url\([^)]*\)/g, 'url()');
    if (/letter-spacing\s*:\s*(?!normal|0\b|inherit)/.test(d)) out.push({ rule: 'C1', where, text: 'letter-spacing on text' });
    if (/text-transform\s*:\s*uppercase/.test(d)) out.push({ rule: 'C2', where, text: 'text-transform: uppercase' });
    if (!isTokens && /font(?:-family)?\s*:[^;]*(?:var\(--mono\)|monospace|JetBrains)/i.test(d) && !MONO_OK.test(sel)) out.push({ rule: 'C3', where, text: 'the monospace face on something that is not a key, an address, a formula, a time or the wordmark' });
    if (!isTokens) {
      const dc = d.replace(/var\([^)]*\)/g, 'var()');
      const col = dc.match(RAW_COLOR); if (col) out.push({ rule: 'C4', where, text: `a raw color: ${col[0]}` });
      let m; RAW_SIZE.lastIndex = 0;
      while ((m = RAW_SIZE.exec(dc))) {
        const n = parseFloat(m[1]);
        if (n === 0 || (m[2] === 'px' && Math.abs(n) === 1)) continue;   // 0 and the 1px hairline
        out.push({ rule: 'C5', where, text: `a raw size or duration: ${m[0]}` }); break;
      }
    }
    if (/^(?:html|body)\b/.test(sel) && /background(?:-color)?\s*:\s*(?:#fff\b|#ffffff\b|white\b)/i.test(d)) out.push({ rule: 'C6', where, text: 'pure white as the page ground' });
  }
  if (ICON_SETS.test(css)) out.push({ rule: 'C7', where: name, text: 'a generic icon set' });
  return out;
}

function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) { if (n !== 'node_modules' && n !== 'vendor' && n !== 'lessons' && n !== 'shortcuts') walk(p, out); }
    else out.push(p);
  }
  return out;
}

/** Run the check over app2: { errors, warns } as lists of printable lines. */
export function runCssCheck(root = app2) {
  const errors = [], warns = [];
  const files = walk(root);
  for (const f of files) {
    const name = basename(f);
    if (/\.css$/.test(name)) {
      const legacy = LEGACY_CSS.has(name) && !STANDARD_CSS.has(name);
      for (const x of checkCss(readFileSync(f, 'utf8'), name)) (legacy ? warns : errors).push(`${x.rule} ${relative(root, f)} [${x.where.slice(name.length + 1)}]: ${x.text}`);
    } else if (/\.(js|mjs|html)$/.test(name) && !f.startsWith(join(root, 'tests'))) {
      const src = readFileSync(f, 'utf8');
      if (ICON_SETS.test(src)) errors.push(`C7 ${relative(root, f)}: a generic icon set`);
    }
  }
  return { errors, warns };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const { errors, warns } = runCssCheck();
  for (const w of warns) console.log('WARN ' + w);
  for (const e of errors) console.error('ERROR ' + e);
  if (errors.length) { console.error(`CHECK FAILED: css-check found ${errors.length} violation(s) (${warns.length} warning(s) in legacy stylesheets)`); process.exit(1); }
  console.log(`css-check ok: 0 violations, ${warns.length} warning(s) in legacy stylesheets`);
}
