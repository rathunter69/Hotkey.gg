// app2/engine/numfmt.js — Excel number-format codes, one engine for the grid and for TEXT(). Pure.
//
// A code has up to four sections split on unquoted ';' — positive;negative;zero;text — and each
// section is digit placeholders (0 # ?), a decimal point, thousands and scaling commas (#,##0,
// shows thousands, #,##0,, millions), %, scientific E+00, quoted literals ("k", " bps"), escaped
// literals (\x), _x (a space the width of x), *x (a fill, dropped), dates and times (yyyy mmm d
// h:mm AM/PM [h]), General and @. A section may carry a colour ([Red], [Blue] …) and a condition
// ([>=1000], [<0]); with conditions, the first section whose condition holds wins and the first
// section without one takes the rest. An unquoted letter that is not a code is not a format —
// Excel refuses it ("0 kg" needs quotes: 0" kg"), and so does compileFormat.
//
//   formatValue(value, code)  → { text, color }   color: a FONT_SWATCHES key or null
//   compileFormat(code)       → the parsed sections (cached); throws FormatError on a bad code
//   isValidFormat(code)       → boolean
//   numToText(n)              → General as & and the text functions see it (15 significant digits)

export class FormatError extends Error {
  constructor(msg) { super(msg || 'bad number format'); this.code = '#VALUE!'; }
}
const bad = m => new FormatError(m);

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const pad2 = n => String(n).padStart(2, '0');
/** Excel's colour names → the grid's font swatches. */
const COLORS = { black: 'black', blue: 'blue', cyan: 'blue', green: 'green', magenta: 'purple', red: 'red', white: 'white', yellow: 'yellow' };
const COLOR_N = { 1: 'black', 2: 'white', 3: 'red', 4: 'green', 5: 'blue', 6: 'yellow', 7: 'purple', 8: 'blue', 10: 'green', 13: 'purple' };

/** General-format text of a number, as & and text functions see it (15 significant digits). */
export function numToText(n) {
  if (!isFinite(n)) return '#NUM!';
  if (Object.is(n, -0)) n = 0;
  const v = parseFloat(Number(n).toPrecision(15));
  const a = Math.abs(v);
  let s;
  if (v !== 0 && (a >= 1e15 || a < 1e-4)) { s = v.toExponential().replace(/\.?0+e/, 'e'); const m = /^(-?[\d.]+)e([+-]\d+)$/.exec(s); s = m ? m[1] + 'E' + m[2][0] + String(Math.abs(+m[2])).padStart(2, '0') : s; }
  else s = String(v);
  return s.replace(/e\+?(-?\d+)$/i, (m, e) => 'E' + (e[0] === '-' ? '-' : '+') + String(Math.abs(+e)).padStart(2, '0'));
}

/* ---- rounding on the 15-digit decimal representation (Excel's, not IEEE's) ---- */
const splitExp = s => { const [m, e] = String(s).split('e'); return [m, e ? parseInt(e, 10) : 0]; };
function shift(x, d) { const [m, e] = splitExp(Math.abs(x).toPrecision(15)); return Number(m + 'e' + (e + d)); }
function unshift(m, d) { const [mm, e] = splitExp(m); return Number(mm + 'e' + (e - d)); }
const roundHalfAway = (x, d) => { const m = Math.round(shift(x, d)); return (x < 0 ? -1 : 1) * unshift(m, d); };

/* ---- dates (Excel's 1900 system, phantom 29 Feb 1900 included) ---- */
const EPOCH = Date.UTC(1899, 11, 30);
function ymd(s) {
  s = Math.floor(s);
  if (s === 60) return { y: 1900, m: 2, d: 29, wd: 3 };
  if (s === 0) return { y: 1900, m: 1, d: 0, wd: 6 };
  if (s < 0) throw bad('negative date');
  const d = new Date(EPOCH + (s < 60 ? s + 1 : s) * 86400000);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), wd: d.getUTCDay() };
}

/* ---- parsing ---- */
function splitSections(f) {   // split on unquoted ';' (backslash escapes honoured)
  const out = []; let cur = '', q = false;
  for (let i = 0; i < f.length; i++) {
    const ch = f[i];
    if (ch === '"') { q = !q; cur += ch; }
    else if (ch === '\\' && !q) { cur += ch + (f[i + 1] || ''); i++; }
    else if (ch === ';' && !q) { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}
const COND_RX = /^(<=|>=|<>|<|>|=)\s*(-?\d+(?:\.\d+)?)$/;
function tokenizeSection(sec) {
  const toks = []; let cond = null, color = null;
  for (let i = 0; i < sec.length; i++) {
    const ch = sec[i], rest = sec.slice(i);
    let m;
    if (ch === '"') { const j = sec.indexOf('"', i + 1); const end = j < 0 ? sec.length : j; toks.push({ t: 'lit', v: sec.slice(i + 1, end) }); i = end; continue; }
    if (ch === '\\') { toks.push({ t: 'lit', v: sec[i + 1] || '' }); i++; continue; }
    if (ch === '_') { toks.push({ t: 'lit', v: ' ', pad: true }); i++; continue; }   // _x: the width of x → a space
    if (ch === '*') { i++; continue; }                                                // *x: fill the cell → nothing
    if (ch === '[') {
      const j = sec.indexOf(']', i); if (j < 0) throw bad('unclosed [');
      const inner = sec.slice(i + 1, j).trim();
      let cm;
      if (/^(?:h+|m+|s+)$/i.test(inner)) toks.push({ t: 'elapsed', v: inner[0].toLowerCase() });
      else if (COLORS[inner.toLowerCase()]) color = COLORS[inner.toLowerCase()];
      else if ((cm = /^colou?r\s*(\d{1,2})$/i.exec(inner))) color = COLOR_N[+cm[1]] || null;
      else if ((cm = COND_RX.exec(inner))) cond = { op: cm[1], v: parseFloat(cm[2]) };
      else if (/^\$/.test(inner)) { const sym = inner.slice(1).split('-')[0]; if (sym) toks.push({ t: 'lit', v: sym }); }   // [$€-x-euro]: the currency symbol
      else throw bad('unknown [' + inner + ']');
      i = j; continue;
    }
    if (ch === '0' || ch === '#' || ch === '?') { toks.push({ t: 'ph', v: ch }); continue; }
    if (ch === '.') { toks.push({ t: 'dot' }); continue; }
    if (ch === ',') { toks.push({ t: 'comma' }); continue; }
    if (ch === '%') { toks.push({ t: 'pct' }); continue; }
    if (ch === '@') { toks.push({ t: 'at' }); continue; }
    if ((ch === 'E' || ch === 'e') && (sec[i + 1] === '+' || sec[i + 1] === '-')) { toks.push({ t: 'exp', e: ch, sign: sec[i + 1] }); i++; continue; }
    if ((m = /^general/i.exec(rest))) { toks.push({ t: 'general' }); i += m[0].length - 1; continue; }
    if ((m = /^(?:AM\/PM|A\/P)/i.exec(rest))) { toks.push({ t: 'ampm', v: m[0] }); i += m[0].length - 1; continue; }
    if (/[ymdhs]/i.test(ch)) { let j = i + 1; while (j < sec.length && sec[j].toLowerCase() === ch.toLowerCase()) j++; toks.push({ t: 'date', v: ch.toLowerCase(), n: j - i }); i = j - 1; continue; }
    if (/[A-Za-z]/.test(ch)) throw bad('unquoted letter ' + ch);   // a letter that is not a format code — Excel needs it quoted
    toks.push({ t: 'lit', v: ch });                                  // $ - + / ( ) : ! ^ & ' ~ { } < > = space …
  }
  const kinds = new Set(toks.map(t => t.t));
  const kind = kinds.has('general') ? 'general' : (kinds.has('date') || kinds.has('elapsed') || kinds.has('ampm')) ? 'date'
    : (kinds.has('ph') || kinds.has('exp')) ? 'number' : kinds.has('at') ? 'text' : 'lits';
  if (kind === 'date' && (kinds.has('ph') || kinds.has('exp'))) throw bad('date and digit codes mixed');
  return { toks, cond, color, kind };
}
const cache = new Map();
/** Parse a code into its sections (cached). Throws FormatError when Excel would refuse it. */
export function compileFormat(code) {
  const key = String(code == null ? '' : code);
  if (cache.has(key)) { const c = cache.get(key); if (c instanceof FormatError) throw c; return c; }
  try {
    if (!key.trim()) throw bad('empty format');
    if (key.length > 255) throw bad('format too long');
    const secs = splitSections(key);
    if (secs.length > 4) throw bad('more than four sections');
    const out = { code: key, sections: secs.map(tokenizeSection) };
    for (const s of out.sections) {
      if (s.toks.filter(t => t.t === 'ph').length > 60) throw bad('too many placeholders');
      const di = s.toks.findIndex(t => t.t === 'dot');
      if (di >= 0) { const ei = s.toks.findIndex((t, i) => t.t === 'exp' && i > di); if (s.toks.slice(di + 1, ei >= 0 ? ei : undefined).filter(t => t.t === 'ph').length > 30) throw bad('more than 30 decimals'); }   // Excel shows at most 30
    }
    if (cache.size > 500) cache.clear();
    cache.set(key, out);
    return out;
  } catch (e) { if (e instanceof FormatError) { cache.set(key, e); } throw e; }
}
export function isValidFormat(code) { try { compileFormat(code); return true; } catch (e) { return false; } }

/* ---- rendering ---- */
const renderLits = (toks, text) => toks.map(t => t.t === 'lit' ? t.v : (t.t === 'at' || t.t === 'general') ? text : t.t === 'comma' ? ',' : t.t === 'dot' ? '.' : t.t === 'pct' ? '%' : '').join('');
function renderDate(toks, n) {
  const d = ymd(n);
  const total = Math.floor(Math.round((n - Math.floor(n)) * 86400 * 1000) / 1000);   // whole seconds into the day
  const hh = Math.floor(total / 3600), mi = Math.floor(total / 60) % 60, ss = total % 60;
  const twelve = toks.some(t => t.t === 'ampm');
  const near = (i, step) => { for (let j = i + step; j >= 0 && j < toks.length; j += step) { if (toks[j].t === 'date' || toks[j].t === 'elapsed') return toks[j]; if (toks[j].t !== 'lit') return null; } return null; };
  let out = '';
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (t.t === 'lit') out += t.v;
    else if (t.t === 'comma') out += ','; else if (t.t === 'dot') out += '.'; else if (t.t === 'pct') out += '%';
    else if (t.t === 'ampm') { const up = t.v[0] === 'A'; const s = t.v.length === 3 ? (hh >= 12 ? 'P' : 'A') : (hh >= 12 ? 'PM' : 'AM'); out += up ? s : s.toLowerCase(); }
    else if (t.t === 'elapsed') out += String(t.v === 'h' ? Math.floor(n) * 24 + hh : t.v === 'm' ? (Math.floor(n) * 24 + hh) * 60 + mi : Math.floor(n) * 86400 + total);
    else if (t.t === 'date') {
      const k = t.n;
      if (t.v === 'y') out += k <= 2 ? pad2(d.y % 100) : String(d.y);
      else if (t.v === 'd') out += k === 1 ? String(d.d) : k === 2 ? pad2(d.d) : k === 3 ? DAYS[d.wd].slice(0, 3) : DAYS[d.wd];
      else if (t.v === 'h') { const h = twelve ? (hh % 12 || 12) : hh; out += k === 1 ? String(h) : pad2(h); }
      else if (t.v === 's') out += k === 1 ? String(ss) : pad2(ss);
      else {   // m is minutes right after an hour code or right before a seconds code, otherwise the month
        const prev = near(i, -1), next = near(i, 1);
        const minute = k <= 2 && ((prev && prev.v === 'h') || (next && next.t === 'date' && next.v === 's'));
        if (minute) out += k === 1 ? String(mi) : pad2(mi);
        else out += k === 1 ? String(d.m) : k === 2 ? pad2(d.m) : k === 3 ? MONTHS[d.m - 1].slice(0, 3) : k === 4 ? MONTHS[d.m - 1] : MONTHS[d.m - 1][0];
      }
    }
  }
  return out;
}
function renderNumber(toks, n) {   // n ≥ 0; the caller supplies the sign
  let pct = 0; for (const t of toks) if (t.t === 'pct') pct++;
  n *= 100 ** pct;
  const expI = toks.findIndex(t => t.t === 'exp');
  const dotI = toks.findIndex((t, i) => t.t === 'dot' && (expI < 0 || i < expI));
  const intToks = toks.slice(0, dotI >= 0 ? dotI : expI >= 0 ? expI : toks.length);
  const fracToks = dotI >= 0 ? toks.slice(dotI + 1, expI >= 0 ? expI : toks.length) : [];
  const expToks = expI >= 0 ? toks.slice(expI + 1) : [];
  const count = a => a.filter(t => t.t === 'ph').length;
  const intCount = count(intToks), fracCount = count(fracToks), expCount = count(expToks);
  if (fracCount > 30) throw bad('more than 30 decimals');   // Excel formats show at most 30 decimal places
  // a comma between integer placeholders groups thousands; commas after the last placeholder — of the
  // integer area (#,##0,) or of the fraction area (#,##0.0,,"m") — scale by 1000 each
  let grouped = false, scale = 0, seenPh = false, run = 0;
  for (const t of intToks) { if (t.t === 'ph') { seenPh = true; if (run) grouped = true; run = 0; } else if (t.t === 'comma' && seenPh) run++; }
  scale += run; run = 0;
  for (const t of fracToks) { if (t.t === 'ph') run = 0; else if (t.t === 'comma') run++; }
  scale += run;
  n /= 1000 ** scale;
  let exp = null;
  if (expI >= 0) {
    const w = Math.max(intCount, 1);
    let e = n === 0 ? 0 : Math.floor(Math.log10(n)) - w + 1;
    let m = roundHalfAway(n / 10 ** e, fracCount);
    if (m >= 10 ** w) { e += 1; m = roundHalfAway(m / 10, fracCount); }
    n = m; exp = e;
  } else n = roundHalfAway(n, fracCount);
  const fixed = n < 1e21 ? n.toFixed(fracCount) : BigInt(Math.round(n)).toString() + (fracCount ? '.' + '0'.repeat(fracCount) : '');
  let [ip, fp = ''] = fixed.split('.');
  if (ip === '0') ip = '';   // a zero integer part shows only where a 0 placeholder demands it (TEXT(0.5,"#.0") → ".5")
  // integer area, filled right to left; the leftmost placeholder takes any excess digits
  const firstPh = intToks.findIndex(t => t.t === 'ph');
  const rev = []; let di = ip.length, emitted = 0;
  const digit = ch => { if (grouped && emitted > 0 && emitted % 3 === 0) rev.push(','); rev.push(ch); emitted++; };
  if (firstPh < 0) while (di > 0) digit(ip[--di]);   // no integer placeholders: the digits still sit left of the point
  for (let k = intToks.length - 1; k >= 0; k--) {
    const t = intToks[k];
    if (t.t === 'ph') {
      if (di > 0) { digit(ip[--di]); if (k === firstPh) while (di > 0) digit(ip[--di]); }
      else if (t.v === '0') digit('0');
      else if (t.v === '?') rev.push(' ');
    } else if (t.t === 'lit') { for (let q = t.v.length - 1; q >= 0; q--) rev.push(t.v[q]); }
    else if (t.t === 'pct') rev.push('%');
  }
  let out = rev.reverse().join('');
  // fraction area, filled left to right; trailing zeros drop from # and ? placeholders
  if (dotI >= 0) {
    out += '.';
    let j = 0;
    for (const t of fracToks) {
      if (t.t === 'ph') { const ch = fp[j] || '0', more = /[1-9]/.test(fp.slice(j)); j++; if (t.v === '0' || more) out += ch; else if (t.v === '?') out += ' '; }
      else if (t.t === 'lit') out += t.v; else if (t.t === 'pct') out += '%';
    }
  }
  if (exp !== null) {
    const x = toks[expI];
    out += x.e + (exp < 0 ? '-' : x.sign === '+' ? '+' : '') + String(Math.abs(exp)).padStart(expCount, '0');
    for (const t of expToks) { if (t.t === 'lit') out += t.v; else if (t.t === 'pct') out += '%'; }
  }
  return out;
}
const holds = (c, n) => c.op === '<' ? n < c.v : c.op === '<=' ? n <= c.v : c.op === '>' ? n > c.v : c.op === '>=' ? n >= c.v : c.op === '=' ? n === c.v : n !== c.v;

/**
 * A value in a format code → { text, color }. Numbers pick their section (conditions first when
 * the code has any), text uses the fourth section (or a lone "@" section) or passes through,
 * booleans print TRUE / FALSE. Throws FormatError on a bad code or a negative date.
 */
export function formatValue(v, code) {
  const f = compileFormat(code);
  const secs = f.sections;
  if (typeof v === 'boolean') return { text: v ? 'TRUE' : 'FALSE', color: null };
  if (typeof v === 'string') {
    const sec = secs.length >= 4 ? secs[3] : (secs.length === 1 && secs[0].kind === 'text') ? secs[0] : null;
    return sec ? { text: renderLits(sec.toks, v), color: sec.color } : { text: v, color: null };
  }
  let n = Number(v);
  if (!isFinite(n)) return { text: '#NUM!', color: null };
  const numeric = secs.slice(0, 3);
  let sec, neg = false;
  if (numeric.some(s => s.cond)) {
    sec = numeric.find(s => s.cond && holds(s.cond, n)) || numeric.find(s => !s.cond && s.kind !== 'text');
    if (!sec) return { text: '#'.repeat(8), color: null };   // Excel fills a cell no section can show with ####
    if (n < 0 && !sec.cond) { neg = true; n = -n; }
    else if (n < 0 && sec.cond && !(sec.cond.op[0] === '<' && sec.cond.v <= 0)) { neg = true; n = -n; }
    else n = Math.abs(n);
  } else {
    const negative = n < 0;
    if (negative && numeric.length >= 2) { sec = numeric[1]; n = -n; }              // the negative section supplies its own sign
    else if (n === 0 && numeric.length >= 3) sec = numeric[2];
    else { sec = numeric[0]; if (negative) { neg = true; n = -n; } }
  }
  let body;
  if (sec.kind === 'general') body = renderLits(sec.toks, numToText(n));
  else if (sec.kind === 'text') body = renderLits(sec.toks, numToText(n));
  else if (sec.kind === 'date') { if (neg) throw bad('negative date'); body = renderDate(sec.toks, n); }
  else if (sec.kind === 'number') body = renderNumber(sec.toks, n);
  else body = renderLits(sec.toks, '');   // a section with no placeholders shows its literals only ("-" for zero)
  // a leading minus sits before the digits, after any leading literal ($ stays outside: -$5 as Excel shows it)
  return { text: (neg ? '-' : '') + body, color: sec.color };
}

/**
 * The built-in styles as the codes Excel shows under Custom, so the Custom box opens on the
 * cell's current code and the graders read every format the same way.
 */
export function builtinCode(style, decimals = 0, scale = 0) {
  const d = Math.max(0, Math.min(30, decimals | 0));
  const frac = d ? '.' + '0'.repeat(d) : '';
  const sc = scale === 3 ? ',' : scale === 6 ? ',,' : '';
  switch (style) {
    case 'comma': return `#,##0${frac}${sc}_);(#,##0${frac}${sc})`;
    case 'currency': return `$#,##0${frac}${sc}_);($#,##0${frac}${sc})`;
    case 'acct': return `_($* #,##0${frac}${sc}_);_($* (#,##0${frac}${sc});_($* "-"??_);_(@_)`;
    case 'percent': return `0${frac}%`;
    case 'mult': return `0${frac}"x"`;
    case 'date': return 'mmm-yy';
    default: return 'General';
  }
}

/**
 * Increase / decrease decimal on a code (Alt H 0 / Alt H 9): every numeric section gains or loses
 * one decimal place, as Excel rewrites a custom code. Returns the new code (the same one when
 * there is nothing to change).
 */
export function stepDecimals(code, delta) {
  const secs = splitSections(String(code));
  const out = secs.map(sec => {
    // walk the section outside quotes; find the last run of digit placeholders (the figure) and its decimals
    let q = false, lastPh = -1, dot = -1;
    for (let i = 0; i < sec.length; i++) {
      const ch = sec[i];
      if (ch === '"') { q = !q; continue; }
      if (q) continue;
      if (ch === '\\' || ch === '_' || ch === '*') { i++; continue; }
      if (ch === '[') { const j = sec.indexOf(']', i); if (j > i) i = j; continue; }
      if (ch === '0' || ch === '#' || ch === '?') lastPh = i;
      else if (ch === '.' && lastPh >= 0 && dot < 0) dot = i;
      else if ((ch === 'E' || ch === 'e') && (sec[i + 1] === '+' || sec[i + 1] === '-')) break;
    }
    if (lastPh < 0) return sec;
    if (delta > 0) return dot < 0 ? sec.slice(0, lastPh + 1) + '.0' + sec.slice(lastPh + 1) : sec.slice(0, lastPh + 1) + '0' + sec.slice(lastPh + 1);
    if (dot < 0) return sec;
    const decs = lastPh - dot;
    if (decs <= 0) return sec;
    return decs === 1 ? sec.slice(0, dot) + sec.slice(lastPh + 1) : sec.slice(0, lastPh) + sec.slice(lastPh + 1);
  });
  return out.join(';');
}

/** How many decimals a code shows on a positive figure (the first numeric section's). */
export function codeDecimals(code) {
  try {
    const sec = compileFormat(code).sections[0];
    if (sec.kind !== 'number') return 0;
    const toks = sec.toks; const dot = toks.findIndex(t => t.t === 'dot');
    return dot < 0 ? 0 : toks.slice(dot + 1).filter(t => t.t === 'ph').length;
  } catch (e) { return 0; }
}

/**
 * A code as the Custom box stores it: a run of letters that is not a format code ("x", "k",
 * "bps") is quoted, as Excel does when it can, so 0.0x and #,##0,k are accepted at the box.
 * A code that already compiles is returned as typed. Null when the code still will not compile.
 */
export function normalizeCode(code) {
  const raw = String(code == null ? '' : code).trim();
  if (!raw) return null;
  if (isValidFormat(raw)) return raw;
  const quoted = splitSections(raw).map(sec => {
    let out = '', i = 0;
    while (i < sec.length) {
      const ch = sec[i], rest = sec.slice(i);
      let m;
      if (ch === '"') { const j = sec.indexOf('"', i + 1); const end = j < 0 ? sec.length : j + 1; out += sec.slice(i, end); i = end; continue; }
      if (ch === '\\' || ch === '_' || ch === '*') { out += sec.slice(i, i + 2); i += 2; continue; }
      if (ch === '[') { const j = sec.indexOf(']', i); const end = j < 0 ? sec.length : j + 1; out += sec.slice(i, end); i = end; continue; }
      if ((m = /^(?:general|am\/pm|a\/p)/i.exec(rest))) { out += m[0]; i += m[0].length; continue; }
      if ((m = /^[A-Za-z]+/.exec(rest))) {
        const run = m[0];
        if ((/^e$/i.test(run) && (sec[i + 1] === '+' || sec[i + 1] === '-')) || /^[ymdhs]+$/i.test(run)) out += run;   // a code: E+00, a date part
        else out += '"' + run + '"';
        i += run.length; continue;
      }
      out += ch; i++;
    }
    return out;
  }).join(';');
  return isValidFormat(quoted) ? quoted : null;
}
