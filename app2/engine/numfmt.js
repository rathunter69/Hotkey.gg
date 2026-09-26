// app2/engine/numfmt.js — Excel number-format codes, one engine for the grid and for TEXT(). Pure.
//
// A code has up to four sections split on unquoted ';' — positive;negative;zero;text — and each
// section is digit placeholders (0 # ?), a decimal point, thousands and scaling commas (#,##0,
// shows thousands, #,##0,, millions), %, scientific E+00 (engineering when the integer area has
// several placeholders: ##0.0E+0), fractions (# ?/?, # ?/8), quoted literals ("k", " bps"), escaped
// literals (\x), _x (a space the width of x), *x (a fill, dropped), dates and times (yyyy mmm d
// h:mm AM/PM [h] ss.00), General and @. A section may carry a colour ([Red], [Color 9] …) and a
// condition ([>=1000], [<0]); with conditions, the first section whose condition holds wins and
// the first section without one takes the rest. A two- or three-section code whose last section
// is @ keeps that section for text, as Excel stores its own d-mmm-yy;@ codes. An unquoted letter
// that is a date or era code needs its context (0 kg is refused: g is an era); the letters Excel
// prints as themselves (x k bps …) are literals, as TEXT() reads them.
//
//   formatValue(value, code)  → { text, color }   color: a FONT_SWATCHES key, a #hex from Excel's palette, or null
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
/** [Color 1] … [Color 56]: Excel's default palette; a swatch key where the grid has the colour, else its hex. */
const PALETTE = ['black', 'white', 'red', 'green', 'blue', 'yellow', 'purple', 'blue',
  '#800000', 'green', '#000080', '#808000', 'purple', '#008080', '#c0c0c0', 'gray',
  '#9999ff', '#993366', '#ffffcc', '#ccffff', '#660066', '#ff8080', '#0066cc', '#ccccff',
  '#000080', 'purple', 'yellow', 'blue', 'purple', '#800000', '#008080', 'blue',
  '#00ccff', '#ccffff', '#ccffcc', '#ffff99', '#99ccff', '#ff99cc', '#cc99ff', '#ffcc99',
  '#3366ff', '#33cccc', '#99cc00', '#ffcc00', '#ff9900', '#ff6600', '#666699', 'gray',
  '#003366', '#339966', '#003300', '#333300', '#993300', '#993366', '#333399', 'darkgray'];
/** The letters Excel prints as themselves when unquoted (as TEXT() reads a code); the rest are date, era, E+ or General codes, or need quotes. */
const LITERAL_LETTERS = 'acfijklopqrtuvwxzP';
const LAST_SERIAL = 2958466;   // 31 Dec 9999 is 2958465: the last date Excel recognises

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
const roundHalfAway = (x, d) => {
  if (!isFinite(x) || splitExp(Math.abs(x).toPrecision(15))[1] >= 14) return x;   // no fraction within 15 significant digits: nothing to round (and nothing to overflow)
  const m = Math.round(shift(x, d)); return (x < 0 ? -1 : 1) * unshift(m, d);
};
/**
 * The integer and fraction digit strings of a non-negative number already rounded to `fracCount`
 * places: Excel keeps 15 significant digits and pads the rest with zeros (never the double's
 * binary expansion). ip has no leading zeros ('' for zero); fp has exactly fracCount digits.
 */
function digitsOf(n, fracCount) {
  if (n === 0) return ['', '0'.repeat(fracCount)];
  const [m, e] = n.toExponential(14).split('e');
  const ds = m.replace('.', ''), x = +e;   // 15 digits, the point after position x
  let ip, fp;
  if (x >= 14) { ip = ds + '0'.repeat(x - 14); fp = ''; }
  else if (x >= 0) { ip = ds.slice(0, x + 1); fp = ds.slice(x + 1); }
  else { ip = ''; fp = '0'.repeat(-x - 1) + ds; }
  return [ip.replace(/^0+/, ''), fp.slice(0, fracCount).padEnd(fracCount, '0')];
}

/* ---- dates (Excel's 1900 system, phantom 29 Feb 1900 included) ---- */
const EPOCH = Date.UTC(1899, 11, 30);
function ymd(s) {
  s = Math.floor(s);
  if (s < 0 || s >= LAST_SERIAL) throw bad('date out of range');   // Excel fills the cell with # (TEXT: #VALUE!)
  const wd = ((s - 1) % 7 + 7) % 7;   // Excel's weekday follows the serial (0 = Saturday, 1 = Sunday): Jan–Feb 1900 sit a day off the real calendar
  if (s === 60) return { y: 1900, m: 2, d: 29, wd };
  if (s === 0) return { y: 1900, m: 1, d: 0, wd };
  const d = new Date(EPOCH + (s < 60 ? s + 1 : s) * 86400000);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), wd };
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
  const last = () => toks[toks.length - 1];
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
      if (/^(?:h+|m+|s+)$/i.test(inner)) toks.push({ t: 'elapsed', v: inner[0].toLowerCase(), n: inner.length });
      else if (COLORS[inner.toLowerCase()] || (cm = /^colou?r\s*(\d{1,2})$/i.exec(inner))) {
        if (color) throw bad('two colours');   // one colour per section
        if (cm) { const n = +cm[1]; if (n < 1 || n > 56) throw bad('color index'); color = PALETTE[n - 1]; }
        else color = COLORS[inner.toLowerCase()];
      }
      else if ((cm = COND_RX.exec(inner))) { if (cond) throw bad('two conditions'); cond = { op: cm[1], v: parseFloat(cm[2]) }; }
      else if (/^\$/.test(inner)) { const sym = inner.slice(1).split('-')[0]; if (sym) toks.push({ t: 'lit', v: sym }); }   // [$€-x-euro]: the currency symbol
      else throw bad('unknown [' + inner + ']');
      i = j; continue;
    }
    if (ch === '0' || ch === '#' || ch === '?') { toks.push({ t: 'ph', v: ch }); continue; }
    if (ch === '.') { toks.push({ t: 'dot' }); continue; }
    if (ch === ',') { toks.push({ t: 'comma' }); continue; }
    if (ch === '%') { toks.push({ t: 'pct' }); continue; }
    if (ch === '@') { toks.push({ t: 'at' }); continue; }
    if (ch === '/' && last() && last().t === 'ph') {   // a fraction's bar: # ?/? (placeholders) or # ?/8 (a fixed denominator)
      if ((m = /^\/([1-9]\d*)/.exec(rest))) { toks.push({ t: 'slash', den: +m[1] }); i += m[0].length - 1; continue; }
      if (/^\/[0#?]/.test(rest)) { toks.push({ t: 'slash', den: 0 }); continue; }
    }
    if ((ch === 'E' || ch === 'e') && (sec[i + 1] === '+' || sec[i + 1] === '-')) { toks.push({ t: 'exp', e: ch, sign: sec[i + 1] }); i++; continue; }
    if ((m = /^general/i.exec(rest))) { toks.push({ t: 'general' }); i += m[0].length - 1; continue; }
    if ((m = /^(?:AM\/PM|A\/P)/i.exec(rest))) { toks.push({ t: 'ampm', v: m[0] }); i += m[0].length - 1; continue; }
    if (/[ymdhsebg]/i.test(ch)) { let j = i + 1; while (j < sec.length && sec[j].toLowerCase() === ch.toLowerCase()) j++; toks.push({ t: 'date', v: ch.toLowerCase(), n: j - i }); i = j - 1; continue; }
    if (/[A-Za-z]/.test(ch) && !LITERAL_LETTERS.includes(ch)) throw bad('unquoted letter ' + ch);   // n, N, X …: Excel needs them quoted
    toks.push({ t: 'lit', v: ch });                                  // $ - + / ( ) : ! ^ & ' ~ { } < > = space x k …
  }
  // fractional seconds: ss.00 and [ss].00 fold the digits onto the seconds code (the time rounds to that unit)
  for (let i = 0; i + 1 < toks.length; i++) {
    const t = toks[i];
    if (toks[i + 1].t !== 'dot' || !((t.t === 'date' && t.v === 's') || (t.t === 'elapsed' && t.v === 's'))) continue;
    let j = i + 2; while (j < toks.length && toks[j].t === 'ph' && toks[j].v === '0') j++;
    if (j === i + 2) continue;
    t.frac = j - i - 2; toks.splice(i + 1, j - i - 1);
  }
  const kinds = new Set(toks.map(t => t.t));
  const digits = kinds.has('ph') || kinds.has('exp');
  let kind = kinds.has('general') ? 'general' : (kinds.has('date') || kinds.has('elapsed') || kinds.has('ampm')) ? 'date'
    : digits ? (kinds.has('slash') ? 'fraction' : 'number') : kinds.has('at') ? 'text' : 'lits';
  if (kind === 'date' && digits) throw bad('date and digit codes mixed');
  if (kind === 'general' && (digits || kinds.has('date') || kinds.has('elapsed'))) throw bad('General mixed with other codes');
  if (kinds.has('at') && kind !== 'text') throw bad('@ mixed with other codes');
  if (kind === 'fraction' && kinds.has('dot')) throw bad('fraction and decimal codes mixed');
  if (kind === 'lits' && !toks.length && (color || cond)) { kind = 'general'; toks.push({ t: 'general' }); }   // [Red] alone: General in red
  return { toks, cond, color, kind };
}
const cache = new Map();
const remember = (key, v) => { if (cache.size > 500) cache.clear(); cache.set(key, v); };
/** Parse a code into its sections (cached). Throws FormatError when Excel would refuse it. */
export function compileFormat(code) {
  const key = String(code == null ? '' : code);
  if (cache.has(key)) { const c = cache.get(key); if (c instanceof FormatError) throw c; return c; }
  try {
    if (!key.trim()) throw bad('empty format');
    if (key.length > 255) throw bad('format too long');
    const secs = splitSections(key);
    if (secs.length > 4) throw bad('more than four sections');
    const sections = secs.map(tokenizeSection);
    for (const [i, s] of sections.entries()) {
      if (s.toks.filter(t => t.t === 'ph').length > 60) throw bad('too many placeholders');
      const di = s.toks.findIndex(t => t.t === 'dot');
      if (di >= 0) { const ei = s.toks.findIndex((t, i) => t.t === 'exp' && i > di); if (s.toks.slice(di + 1, ei >= 0 ? ei : undefined).filter(t => t.t === 'ph').length > 30) throw bad('more than 30 decimals'); }   // Excel shows at most 30
      if (s.cond && i >= 2) throw bad('condition past the second section');
    }
    if (sections.length === 1 && sections[0].cond && sections[0].kind !== 'general') throw bad('a lone condition needs General');
    // the text section: the fourth, or a trailing @ section of a two- or three-section code ([$-409]d-mmm-yy;@ as Excel stores it)
    let numeric = sections.slice(0, 3), text = sections[3] || null;
    if ((sections.length === 2 || sections.length === 3) && sections[sections.length - 1].kind === 'text') { text = sections[sections.length - 1]; numeric = sections.slice(0, -1); }
    else if (sections.length === 1 && sections[0].kind === 'text') text = sections[0];
    const out = { code: key, sections, numeric, text };
    remember(key, out);
    return out;
  } catch (e) { if (e instanceof FormatError) remember(key, e); throw e; }
}
export function isValidFormat(code) { try { compileFormat(code); return true; } catch (e) { return false; } }

/* ---- rendering ---- */
const renderLits = (toks, text) => toks.map(t => t.t === 'lit' ? t.v : (t.t === 'at' || t.t === 'general') ? text : t.t === 'comma' ? ',' : t.t === 'dot' ? '.' : t.t === 'pct' ? '%' : t.t === 'slash' ? '/' + (t.den || '') : '').join('');
function renderDate(toks, n) {
  // Excel rounds the time to the finest unit the code shows — the second, or ss.00's hundredth —
  // and the carry rolls into the date (23:59:59.7 under h:mm is 0:00 of the next day); h and m
  // then truncate (12:29:59 under h:mm is 12:29, under h:mm:ss.0 it is 12:29:59.0)
  let k = 0; for (const t of toks) if (t.v === 's' && (t.t === 'date' || t.t === 'elapsed')) k = Math.max(k, t.frac || 0);
  const unit = 10 ** k, dayUnits = 86400 * unit;
  const T = Math.round(n * dayUnits);
  const day = Math.floor(T / dayUnits), rem = T - day * dayUnits;
  const secs = Math.floor(rem / unit), fracDigits = String(rem % unit).padStart(k, '0');
  const hh = Math.floor(secs / 3600), mi = Math.floor(secs / 60) % 60, ss = secs % 60;
  let D = null; const d = () => D || (D = ymd(day));   // the calendar only where a code asks for it (out of range → FormatError)
  const twelve = toks.some(t => t.t === 'ampm');
  const SEP = new Set(['lit', 'dot', 'comma', 'pct']);   // plain separators between codes (h.mm is hours.minutes)
  const near = (i, step) => { for (let j = i + step; j >= 0 && j < toks.length; j += step) { if (toks[j].t === 'date' || toks[j].t === 'elapsed') return toks[j]; if (!SEP.has(toks[j].t)) return null; } return null; };
  const withFrac = (s, t) => t.frac ? s + '.' + fracDigits : s;
  let out = '';
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (t.t === 'lit') out += t.v;
    else if (t.t === 'comma') out += ','; else if (t.t === 'dot') out += '.'; else if (t.t === 'pct') out += '%';
    else if (t.t === 'ampm') { const up = t.v[0] === 'A'; const s = t.v.length === 3 ? (hh >= 12 ? 'P' : 'A') : (hh >= 12 ? 'PM' : 'AM'); out += up ? s : s.toLowerCase(); }
    else if (t.t === 'elapsed') {
      const count = t.v === 'h' ? Math.floor(T / (3600 * unit)) : t.v === 'm' ? Math.floor(T / (60 * unit)) : Math.floor(T / unit);
      out += withFrac(String(count).padStart(t.n, '0'), t);
    }
    else if (t.t === 'date') {
      const k = t.n;
      if (t.v === 'y') out += k <= 2 ? pad2(d().y % 100) : String(d().y);
      else if (t.v === 'e') out += String(d().y);                                            // e: the year (every locale)
      else if (t.v === 'b') out += k <= 2 ? pad2((d().y + 543) % 100) : String(d().y + 543);   // b: the Buddhist-era year
      else if (t.v === 'g') out += '';                                                       // g: the era name — none under the Gregorian calendar
      else if (t.v === 'd') out += k === 1 ? String(d().d) : k === 2 ? pad2(d().d) : k === 3 ? DAYS[d().wd].slice(0, 3) : DAYS[d().wd];
      else if (t.v === 'h') { const h = twelve ? (hh % 12 || 12) : hh; out += k === 1 ? String(h) : pad2(h); }
      else if (t.v === 's') out += withFrac(k === 1 ? String(ss) : pad2(ss), t);
      else {   // m is minutes right after an hour code or right before a seconds code, otherwise the month
        const prev = near(i, -1), next = near(i, 1);
        const minute = k <= 2 && ((prev && prev.v === 'h') || (next && next.t === 'date' && next.v === 's'));
        if (minute) out += k === 1 ? String(mi) : pad2(mi);
        else out += k === 1 ? String(d().m) : k === 2 ? pad2(d().m) : k === 3 ? MONTHS[d().m - 1].slice(0, 3) : k === 4 ? MONTHS[d().m - 1] : MONTHS[d().m - 1][0];
      }
    }
  }
  return out;
}
/** The integer area of a code filled right to left with the digits `ip`; the leftmost placeholder takes any excess digits. */
function fillInt(intToks, ip, grouped) {
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
  return rev.reverse().join('');
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
  if (!isFinite(n)) throw bad('number too large');   // 1E+307 under 0%: nothing Excel can show either
  let exp = null;
  if (expI >= 0) {
    // scientific: the integer placeholders set the mantissa width; with any # or ? among them the
    // exponent steps by their count (engineering: ##0.0E+0 shows 12345 as 12.3E+3, 1234567 as 1.2E+6)
    const w = Math.max(intCount, 1), forced = intToks.filter(t => t.t === 'ph' && t.v === '0').length === w;
    let e = 0, m = 0;
    if (n !== 0) {
      const p = Math.floor(Math.log10(n));
      e = forced ? p - w + 1 : w * Math.floor(p / w);
      m = roundHalfAway(n / 10 ** e, fracCount);
      if (m >= 10 ** w) { e += forced ? 1 : w; m = roundHalfAway(n / 10 ** e, fracCount); }
    }
    n = m; exp = e;
  } else n = roundHalfAway(n, fracCount);
  if (!isFinite(n)) throw bad('number too large');
  const [ip, fp] = digitsOf(n, fracCount);
  let out = fillInt(intToks, ip, grouped);
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
/** The fraction closest to x ≥ 0 with a denominator of at most D (a convergent or a semi-convergent of its continued fraction; ties keep the smaller denominator). */
function bestFraction(x, D) {
  D = Math.max(1, D);
  let p0 = 0, q0 = 1, p1 = 1, q1 = 0, r = x;
  for (let k = 0; k < 64; k++) {
    const a = Math.floor(r);
    const p2 = a * p1 + p0, q2 = a * q1 + q0;
    if (q2 > D) {
      const j = Math.floor((D - q0) / q1), ps = p0 + j * p1, qs = q0 + j * q1;   // the best semi-convergent that still fits
      return qs >= 1 && Math.abs(x - ps / qs) < Math.abs(x - p1 / q1) ? [ps, qs] : [p1, q1];
    }
    p0 = p1; q0 = q1; p1 = p2; q1 = q2;
    const f = r - a;
    if (f < 1e-12) break;
    r = 1 / f;
  }
  return [p1, q1];
}
function renderFraction(toks, n) {   // n ≥ 0: "# ?/?" shows 4.34 as 4 1/3, "?/?" shows 1.5 as 3/2, "# ?/8" shows 3.375 as 3 3/8
  const si = toks.findIndex(t => t.t === 'slash');
  let ns = si; while (ns > 0 && toks[ns - 1].t === 'ph') ns--;
  let de = si + 1; if (!toks[si].den) while (de < toks.length && toks[de].t === 'ph') de++;
  const wholeToks = toks.slice(0, ns), numToks = toks.slice(ns, si), denToks = toks.slice(si + 1, de), tail = toks.slice(de);
  const hasWhole = wholeToks.some(t => t.t === 'ph');
  let whole = hasWhole ? Math.floor(n) : 0;
  const frac = hasWhole ? n - whole : n;
  let num, den;
  if (toks[si].den) { den = toks[si].den; num = Math.round(frac * den); }                    // a fixed denominator: 0.5 under ?/4 is 2/4
  else [num, den] = bestFraction(frac, 10 ** denToks.length - 1);                            // k placeholders: the closest fraction with a denominator below 10^k
  if (hasWhole && num === den) { whole += 1; num = 0; }
  const blank = hasWhole && num === 0;   // a whole number: the fraction slot stays blank ("0    " for zero)
  const ip = whole || (hasWhole && blank) ? String(whole) : '';
  let grouped = false, seenPh = false, run = 0;   // #,##0 ?/?: a comma between whole placeholders groups thousands
  for (const t of wholeToks) { if (t.t === 'ph') { seenPh = true; if (run) grouped = true; run = 0; } else if (t.t === 'comma' && seenPh) run++; }
  let out = fillInt(wholeToks, ip, grouped);
  const padOf = t => t.v === '?' ? ' ' : t.v === '0' ? '0' : '';
  if (blank) { out += numToks.map(padOf).join('') + ' ' + (toks[si].den ? ' '.repeat(String(toks[si].den).length) : denToks.map(padOf).join('')); }
  else {
    out += fillInt(numToks, String(num), false) + '/';
    if (toks[si].den) out += String(den);
    else { const ds = String(den); let j = 0; for (const t of denToks) out += j < ds.length ? ds[j++] : padOf(t); }
  }
  return out + renderLits(tail, '');
}
const holds = (c, n) => c.op === '<' ? n < c.v : c.op === '<=' ? n <= c.v : c.op === '>' ? n > c.v : c.op === '>=' ? n >= c.v : c.op === '=' ? n === c.v : n !== c.v;

/**
 * A value in a format code → { text, color }. Numbers pick their section (conditions first when
 * the code has any), text uses the text section or passes through, booleans print TRUE / FALSE.
 * Throws FormatError on a bad code, a date out of range or a number too large to show.
 */
export function formatValue(v, code) {
  const f = compileFormat(code);
  if (typeof v === 'boolean') return { text: v ? 'TRUE' : 'FALSE', color: null };
  if (typeof v === 'string') {
    const sec = f.text;
    return sec ? { text: renderLits(sec.toks, v), color: sec.color } : { text: v, color: null };
  }
  let n = Number(v);
  if (!isFinite(n)) return { text: '#NUM!', color: null };
  const numeric = f.numeric;
  let sec, neg = false;
  if (numeric.some(s => s.cond)) {
    sec = numeric.find(s => s.cond && holds(s.cond, n)) || numeric.find(s => !s.cond && s.kind !== 'text');
    if (!sec) return { text: '#'.repeat(8), color: null };   // Excel fills a cell no section can show with ####
    if (n < 0 && !sec.cond) { neg = true; n = -n; }
    else if (n < 0 && sec.cond && !((sec.cond.op === '<' || sec.cond.op === '<=') && sec.cond.v <= 0)) { neg = true; n = -n; }   // only a section that catches negatives supplies its own sign ([<>0] does not)
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
  else if (sec.kind === 'fraction') body = renderFraction(sec.toks, n);
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
    case 'acct': return `_($* #,##0${frac}${sc}_);_($* (#,##0${frac}${sc});_($* "-"${'?'.repeat(d)}_);_(@_)`;   // the dash sits under the units digit: one ? per decimal (Excel's 42 / 44)
    case 'percent': return `0${frac}%`;
    case 'mult': return `0${frac}"x"`;
    case 'date': return 'mmm-yy';
    default: return 'General';
  }
}

/**
 * Increase / decrease decimal on a code (Alt H 0 / Alt H 9): every numeric section gains or loses
 * one decimal place, as Excel rewrites a custom code. The accounting dash section keeps one ? per
 * decimal after its "-" so the dash stays under the units digit; a fraction section is left alone.
 * Returns the new code (the same one when there is nothing to change).
 */
export function stepDecimals(code, delta) {
  const secs = splitSections(String(code));
  const out = secs.map(sec => {
    // walk the section outside quotes: the runs of digit placeholders, the first decimal point after
    // one, a fraction bar, and the closing quote of a literal that follows a * fill (the accounting dash)
    let q = false, dot = -1, runs = [], fill = -1, quoteEnd = -1;
    for (let i = 0; i < sec.length; i++) {
      const ch = sec[i];
      if (ch === '"') { q = !q; if (!q && fill >= 0) quoteEnd = i + 1; continue; }
      if (q) continue;
      if (ch === '\\' || ch === '_') { i++; continue; }
      if (ch === '*') { fill = i; i++; continue; }
      if (ch === '[') { const j = sec.indexOf(']', i); if (j > i) i = j; continue; }
      if (ch === '0' || ch === '#' || ch === '?') {
        const r = runs[runs.length - 1];
        if (r && r.end === i) { r.end = i + 1; if (ch !== '?') r.figure = true; }
        else runs.push({ start: i, end: i + 1, figure: ch !== '?', pad: sec[i - 1] === '"' });
      }
      else if (ch === '.' && runs.length && dot < 0) dot = i;
      else if (ch === '/' && runs.length && runs[runs.length - 1].end === i) return sec;   // a fraction: no decimals to step
      else if ((ch === 'E' || ch === 'e') && (sec[i + 1] === '+' || sec[i + 1] === '-')) break;
    }
    const isPad = r => !r.figure && r.pad;                       // "-"??: an alignment pad, one ? per decimal
    const fig = runs.filter(r => !isPad(r)).pop(), pad = runs.filter(isPad).pop();
    if (fig) {
      if (delta > 0) return dot < 0 ? sec.slice(0, fig.end) + '.0' + sec.slice(fig.end) : dot >= fig.end ? sec.slice(0, dot + 1) + '0' + sec.slice(dot + 1) : sec.slice(0, fig.end) + '0' + sec.slice(fig.end);
      if (dot < 0) return sec;
      if (dot >= fig.end) return sec.slice(0, dot) + sec.slice(dot + 1);   // "#." → "#"
      const decs = fig.end - dot - 1;
      if (decs <= 0) return sec;
      return decs === 1 ? sec.slice(0, dot) + sec.slice(fig.end) : sec.slice(0, fig.end - 1) + sec.slice(fig.end);
    }
    if (pad) return delta > 0 ? sec.slice(0, pad.end) + '?' + sec.slice(pad.end) : sec.slice(0, pad.end - 1) + sec.slice(pad.end);
    if (delta > 0 && quoteEnd >= 0) return sec.slice(0, quoteEnd) + '?' + sec.slice(quoteEnd);   // _($* "-"_) gains its first ?
    return sec;
  });
  return out.join(';');
}

/** How many decimals a code shows on a positive figure (the first numeric section's; the exponent's digits are not decimals). */
export function codeDecimals(code) {
  try {
    const sec = compileFormat(code).sections[0];
    if (sec.kind !== 'number') return 0;
    const toks = sec.toks; const dot = toks.findIndex(t => t.t === 'dot');
    if (dot < 0) return 0;
    const ei = toks.findIndex((t, i) => t.t === 'exp' && i > dot);
    return toks.slice(dot + 1, ei >= 0 ? ei : undefined).filter(t => t.t === 'ph').length;
  } catch (e) { return 0; }
}

/**
 * A code as the Custom box stores it: a run of letters that is not a format code ("x", "k",
 * "bps") is quoted, as Excel does when it can, so 0.0x and #,##0,k are accepted at the box.
 * Spaces are literals and stay as typed (a trailing one included). Null when the code still
 * will not compile.
 */
export function normalizeCode(code) {
  const raw = String(code == null ? '' : code);
  if (!raw.trim()) return null;
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
        if ((/^e$/i.test(run) && (sec[i + 1] === '+' || sec[i + 1] === '-')) || /^[ymdhsebg]+$/i.test(run)) out += run;   // a code: E+00, a date part (e, b, g included)
        else out += '"' + run + '"';
        i += run.length; continue;
      }
      out += ch; i++;
    }
    return out;
  }).join(';');
  return isValidFormat(quoted) ? quoted : null;
}
