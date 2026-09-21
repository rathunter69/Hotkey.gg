// app2/engine/formula.js — the formula evaluator. Pure: no DOM, no globals, no sheet state.
//
//   evalFormula('=SUM(A1:A3)*2', ctx) → number | string | boolean | error sentinel string
//
// ctx = {
//   raw(key)      → the referenced cell's value: number | string | boolean | null (blank). A cell
//                   holding an error shows it as its sentinel string ('#N/A', …).
//   rows, cols    → sheet size, used to bound whole-column / whole-row references (A:A, 1:1).
//   cell          → {r, c} of the cell being evaluated (ROW(), COLUMN() without arguments).
//   today()       → today's Excel serial (optional; defaults to the real clock).
// }
//
// Semantics follow Microsoft Excel (365, en-US, iterative calculation off):
//   · operator precedence  :  -x (negation)  %  ^  * /  + -  &  = <> < <= > >=   (^ is left-assoc,
//     negation binds tighter than ^ so =-2^2 is 4)
//   · TRUE/FALSE are booleans (display TRUE/FALSE); arithmetic reads them as 1/0
//   · a blank cell reads 0 in arithmetic, "" in text, FALSE in logic; =A1 on a blank cell is 0
//   · text in arithmetic: a numeric-looking string coerces ("5"+1 → 6), anything else is #VALUE!
//   · comparisons: numbers < text < booleans; text compares case-insensitively
//   · errors are values that propagate; IFERROR / IFNA catch them; #NAME? for unknown functions
//   · aggregates ignore text/booleans inside ranges but coerce literal arguments (SUM("3") → 3)
//   · multi-letter columns (AA1) and whole-column/row ranges are understood
//
// The evaluator replaced the r23463–23788 recursive-descent evaluator of the old index.html; the
// unit tests in app2/tests/formula.test.js pin each behaviour with its Excel-correct value.

import { colLetter, colIndex, refKey } from './refs.js';
import { serialToDate } from './format.js';

export const ERROR_CODES = ['#NULL!', '#DIV/0!', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#N/A'];

export class FxError extends Error {
  constructor(code) { super(code); this.code = code; }
}
export const isErrVal = v => typeof v === 'string' && ERROR_CODES.includes(v);
const err = code => new FxError(code);

/* ============================================================================
   TOKENIZER
   Tokens carry {t, v, pos, end} so the original text can be rebuilt (translateFormula) and
   references can be highlighted by position (the formula bar).
   ============================================================================ */
const RE_NUM = /^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/;
const RE_IDENT = /^[A-Za-z_][A-Za-z0-9_.]*/;
const RE_REF = /^\$?[A-Za-z]{1,3}\$?\d+$/;
const RE_ERR = /^#(?:NULL!|DIV\/0!|VALUE!|REF!|NAME\?|NUM!|N\/A)/;
const OPS2 = ['<>', '<=', '>='];

export function tokenize(src) {
  const s = String(src);
  const out = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') { i++; continue; }
    const rest = s.slice(i);
    let m;
    if (ch === '"') {
      let j = i + 1, v = '';
      for (;;) {
        if (j >= s.length) throw new SyntaxError('unterminated string');
        if (s[j] === '"') { if (s[j + 1] === '"') { v += '"'; j += 2; continue; } break; }
        v += s[j++];
      }
      out.push({ t: 'str', v, pos: i, end: j + 1 }); i = j + 1; continue;
    }
    if ((m = RE_ERR.exec(rest))) { out.push({ t: 'err', v: m[0].toUpperCase(), pos: i, end: i + m[0].length }); i += m[0].length; continue; }
    if ((m = RE_NUM.exec(rest))) { out.push({ t: 'num', v: parseFloat(m[0]), pos: i, end: i + m[0].length }); i += m[0].length; continue; }
    if (ch === '$' || /[A-Za-z_]/.test(ch)) {
      // reference ($A$1, a1), function name (SUM( ), or a bare name (TRUE, FALSE, A for A:A)
      const dm = /^\$?[A-Za-z]{1,3}\$?\d+/.exec(rest);
      const im = RE_IDENT.exec(rest);
      const after = t => { let k = i + t.length; while (s[k] === ' ') k++; return s[k]; };
      if (im && after(im[0]) === '(') { out.push({ t: 'fn', v: im[0].toUpperCase(), pos: i, end: i + im[0].length }); i += im[0].length; continue; }
      if (dm && (!im || dm[0].length >= im[0].length) && RE_REF.test(dm[0])) {
        // guard: "A1B" is not a ref followed by a name — require a non-identifier char after
        const nx = s[i + dm[0].length];
        if (!nx || !/[A-Za-z0-9_.]/.test(nx)) { out.push({ t: 'ref', v: dm[0].toUpperCase(), pos: i, end: i + dm[0].length }); i += dm[0].length; continue; }
      }
      if (ch === '$') {
        const cm = /^\$?[A-Za-z]{1,3}(?=\s*:)/.exec(rest);
        if (cm) { out.push({ t: 'name', v: cm[0].toUpperCase(), pos: i, end: i + cm[0].length }); i += cm[0].length; continue; }
        throw new SyntaxError('unexpected $');
      }
      if (im) { out.push({ t: 'name', v: im[0].toUpperCase(), pos: i, end: i + im[0].length }); i += im[0].length; continue; }
    }
    const two = s.substr(i, 2);
    if (OPS2.includes(two)) { out.push({ t: 'op', v: two, pos: i, end: i + 2 }); i += 2; continue; }
    if ('+-*/^&=<>%:'.includes(ch)) { out.push({ t: 'op', v: ch, pos: i, end: i + 1 }); i++; continue; }
    if (ch === '(') { out.push({ t: 'lp', pos: i, end: i + 1 }); i++; continue; }
    if (ch === ')') { out.push({ t: 'rp', pos: i, end: i + 1 }); i++; continue; }
    if (ch === ',') { out.push({ t: 'comma', pos: i, end: i + 1 }); i++; continue; }
    if (ch === ';') { out.push({ t: 'comma', pos: i, end: i + 1, semi: true }); i++; continue; }
    throw new SyntaxError('unexpected character ' + ch);
  }
  return out;
}

/* ============================================================================
   PARSER — Pratt. AST nodes:
     {k:'num',v} {k:'str',v} {k:'bool',v} {k:'err',v} {k:'ref',ref} {k:'range',a,b}
     {k:'colrange',a,b} {k:'rowrange',a,b} {k:'un',op,x} {k:'pct',x} {k:'bin',op,l,r}
     {k:'fn',name,args:[node|null]}  (null = omitted argument, e.g. IF(A1,,2))
   ============================================================================ */
/** Excel refuses a formula at entry when a function has too few arguments ("You've entered too few arguments"). */
const MIN_ARGS = { SUM: 1, MAX: 1, MIN: 1, ABS: 1, AVERAGE: 1, PRODUCT: 1, MEDIAN: 1, COUNTBLANK: 1, ROUND: 2, ROUNDUP: 2, ROUNDDOWN: 2, MOD: 2, SQRT: 1, POWER: 2, EXP: 1, LN: 1, LOG: 1, LOG10: 1,
  LARGE: 2, SMALL: 2, RANK: 2, 'RANK.EQ': 2, SUMPRODUCT: 1, SUMIF: 2, COUNTIF: 2, AVERAGEIF: 2, SUMIFS: 3, COUNTIFS: 2, AVERAGEIFS: 3, MAXIFS: 3, MINIFS: 3, AND: 1, OR: 1, XOR: 1, NOT: 1,
  ISBLANK: 1, ISNUMBER: 1, ISTEXT: 1, ISNONTEXT: 1, ISLOGICAL: 1, MATCH: 2, INDEX: 2, VLOOKUP: 3, HLOOKUP: 3, XLOOKUP: 3, OFFSET: 3, ROWS: 1, COLUMNS: 1, LEN: 1, LEFT: 1, RIGHT: 1, MID: 3,
  FIND: 2, SEARCH: 2, TRIM: 1, UPPER: 1, LOWER: 1, PROPER: 1, CONCATENATE: 1, CONCAT: 1, TEXTJOIN: 3, SUBSTITUTE: 3, REPT: 2, EXACT: 2, VALUE: 1, TEXT: 2, T: 1, N: 1,
  DATE: 3, YEAR: 1, MONTH: 1, DAY: 1, WEEKDAY: 1, DAYS: 2, EDATE: 2, EOMONTH: 2, YEARFRAC: 2, NPV: 2, IRR: 1, PMT: 3, PV: 3, FV: 3 };
const BP = { '=': 1, '<>': 1, '<': 1, '<=': 1, '>': 1, '>=': 1, '&': 2, '+': 3, '-': 3, '*': 4, '/': 4, '^': 5 };
const BP_UNARY = 6, BP_PCT = 7;

export function parseFormula(src) {
  let s = String(src).trim();
  if (s[0] === '=') s = s.slice(1);
  const toks = tokenize(s);
  let p = 0;
  const peek = () => toks[p];
  const next = () => toks[p++];
  const expect = (t) => { const tk = next(); if (!tk || tk.t !== t) throw new SyntaxError('expected ' + t); return tk; };

  function primary() {
    const tk = next();
    if (!tk) throw new SyntaxError('unexpected end');
    switch (tk.t) {
      case 'num': {
        // whole-row range: 1:1
        const c = peek();
        if (c && c.t === 'op' && c.v === ':' && toks[p + 1] && toks[p + 1].t === 'num' && Number.isInteger(tk.v) && Number.isInteger(toks[p + 1].v)) {
          p += 2; return { k: 'rowrange', a: tk.v, b: toks[p - 1].v };
        }
        return { k: 'num', v: tk.v };
      }
      case 'str': return { k: 'str', v: tk.v };
      case 'err': return { k: 'err', v: tk.v };
      case 'ref': {
        const c = peek();
        if (c && c.t === 'op' && c.v === ':') {
          const d = toks[p + 1];
          if (d && d.t === 'ref') { p += 2; return { k: 'range', a: tk.v, b: d.v }; }
          throw new SyntaxError('bad range');
        }
        return { k: 'ref', ref: tk.v };
      }
      case 'name': {
        const nm = tk.v.replace(/^\$/, '');
        const c = peek();
        if (c && c.t === 'op' && c.v === ':' && /^[A-Z]{1,3}$/.test(nm)) {
          const d = toks[p + 1];
          if (d && d.t === 'name' && /^\$?[A-Z]{1,3}$/.test(d.v)) { p += 2; return { k: 'colrange', a: nm, b: d.v.replace(/^\$/, '') }; }
        }
        if (nm === 'TRUE') return { k: 'bool', v: true };
        if (nm === 'FALSE') return { k: 'bool', v: false };
        return { k: 'name', v: nm };
      }
      case 'fn': {
        expect('lp');
        const args = [];
        if (peek() && peek().t === 'rp') { next(); return { k: 'fn', name: tk.v, args }; }
        for (;;) {
          const c = peek();
          if (!c) throw new SyntaxError('unclosed function');
          if (c.t === 'comma') { next(); args.push(null); continue; }
          if (c.t === 'rp') { next(); args.push(null); break; }
          args.push(expr(0));
          const d = next();
          if (!d) throw new SyntaxError('unclosed function');
          if (d.t === 'rp') break;
          if (d.t !== 'comma') throw new SyntaxError('expected , or )');
          if (peek() && peek().t === 'rp') { next(); args.push(null); break; }
        }
        return { k: 'fn', name: tk.v, args };
      }
      case 'lp': { const e = expr(0); expect('rp'); return { k: 'paren', x: e }; }
      case 'op':
        if (tk.v === '-') return { k: 'un', op: '-', x: expr(BP_UNARY) };
        if (tk.v === '+') return { k: 'un', op: '+', x: expr(BP_UNARY) };
        throw new SyntaxError('unexpected operator ' + tk.v);
      default: throw new SyntaxError('unexpected token');
    }
  }
  function expr(minBp) {
    let left = primary();
    for (;;) {
      const tk = peek();
      if (!tk || tk.t !== 'op') break;
      if (tk.v === '%') { if (BP_PCT < minBp) break; next(); left = { k: 'pct', x: left }; continue; }
      const bp = BP[tk.v];
      if (bp === undefined || bp < minBp) break;
      next();
      const right = expr(bp + 1);   // every binary operator is left-associative in Excel, ^ included
      left = { k: 'bin', op: tk.v, l: left, r: right };
    }
    return left;
  }
  if (!toks.length) throw new SyntaxError('empty formula');
  const ast = expr(0);
  if (p < toks.length) throw new SyntaxError('unexpected trailing input');
  return ast;
}

/* ============================================================================
   VALUES
   A value is: number | string | boolean | null (blank) | Range. Errors travel as thrown FxError.
   ============================================================================ */
export class Range {
  constructor(r1, c1, r2, c2) { this.r1 = r1; this.c1 = c1; this.r2 = r2; this.c2 = c2; }
  get rows() { return this.r2 - this.r1 + 1; }
  get cols() { return this.c2 - this.c1 + 1; }
  get size() { return this.rows * this.cols; }
  cell(i) { const r = this.r1 + Math.floor(i / this.cols), c = this.c1 + (i % this.cols); return refKey(r, c); }
  at(r, c) { return refKey(this.r1 + r, this.c1 + c); }
  keys() { const out = []; for (let r = this.r1; r <= this.r2; r++) for (let c = this.c1; c <= this.c2; c++) out.push(refKey(r, c)); return out; }
}
const isRange = v => v instanceof Range;

const RE_NUMERIC_TEXT = /^\s*[-+]?\$?\s*(?:\d{1,3}(?:,\d{3})+|\d+)?(?:\.\d*)?(?:[eE][+-]?\d+)?\s*%?\s*$/;
const RE_PAREN_NEG = /^\s*\(\s*\$?\s*(?:\d{1,3}(?:,\d{3})+|\d+)?(?:\.\d*)?\s*\)\s*$/;

/** Excel's text→number coercion for arithmetic. Returns null when the text is not numeric. */
export function textToNumber(str) {
  const t = String(str);
  if (!/\d/.test(t)) return null;
  if (RE_PAREN_NEG.test(t)) { const n = parseFloat(t.replace(/[\s()$,]/g, '')); return isNaN(n) ? null : -n; }
  if (!RE_NUMERIC_TEXT.test(t)) return null;
  let u = t.replace(/[\s$,]/g, ''), pct = false;
  if (u.endsWith('%')) { pct = true; u = u.slice(0, -1); }
  if (u === '' || u === '+' || u === '-' || u === '.') return null;
  const n = Number(u);
  if (!isFinite(n)) return null;
  return pct ? n / 100 : n;
}

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

const num15 = n => parseFloat(Number(n).toPrecision(15));

function numeq(a, b) { return num15(a) === num15(b); }

/* ============================================================================
   EVALUATOR
   ============================================================================ */
export function evalFormula(expr, ctx = {}) {
  const raw = ctx.raw || (() => null);
  const ROWS = ctx.rows || 20, COLS = ctx.cols || 10;
  let ast;
  try { ast = parseFormula(expr); }
  catch (e) { if (e instanceof SyntaxError) throw e; throw e; }

  /* ---- value helpers -------------------------------------------------------- */
  const cellVal = key => { const v = raw(key); if (v === undefined) return null; if (isErrVal(v)) throw err(v); return v; };
  const deref = v => {
    if (!isRange(v)) return v;
    if (v.size === 1) return cellVal(v.cell(0));
    throw err('#VALUE!');
  };
  const toNum = v => {
    v = deref(v);
    if (typeof v === 'number') return v;
    if (typeof v === 'boolean') return v ? 1 : 0;
    if (v === null) return 0;
    const n = textToNumber(v);
    if (n === null) throw err('#VALUE!');
    return n;
  };
  const toText = v => {
    v = deref(v);
    if (v === null) return '';
    if (typeof v === 'number') return numToText(v);
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
    return String(v);
  };
  const toBool = v => {
    v = deref(v);
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v !== 0;
    if (v === null) return false;
    const u = String(v).trim().toUpperCase();
    if (u === 'TRUE') return true;
    if (u === 'FALSE') return false;
    const n = textToNumber(u);            // numeric text reads as its number in a logical test
    if (n !== null) return n !== 0;
    throw err('#VALUE!');
  };
  const toInt = v => Math.trunc(toNum(v));
  const argRange = v => { if (isRange(v)) return v; throw err('#VALUE!'); };
  const rangeOf = (a, b) => {
    const A = refParts(a), B = refParts(b);
    return new Range(Math.min(A.r, B.r), Math.min(A.c, B.c), Math.max(A.r, B.r), Math.max(A.c, B.c));
  };
  function refParts(ref) {
    const m = /^\$?([A-Z]{1,3})\$?(\d+)$/.exec(ref);
    return { c: colIndex(m[1]), r: +m[2] };
  }
  const cmpText = (a, b) => a.localeCompare(b, 'en', { sensitivity: 'accent' });
  function compare(op, a, b) {
    a = deref(a); b = deref(b);
    const rank = v => typeof v === 'number' ? 0 : typeof v === 'string' ? 1 : typeof v === 'boolean' ? 2 : -1;
    if (a === null && b === null) return op === '=' || op === '<=' || op === '>=';
    if (a === null) a = typeof b === 'string' ? '' : typeof b === 'boolean' ? false : 0;
    if (b === null) b = typeof a === 'string' ? '' : typeof a === 'boolean' ? false : 0;
    let d;
    if (rank(a) !== rank(b)) d = rank(a) - rank(b);
    else if (typeof a === 'number') d = numeq(a, b) ? 0 : (a < b ? -1 : 1);
    else if (typeof a === 'string') d = cmpText(a, b);
    else d = (a === b) ? 0 : (a ? 1 : -1);
    switch (op) {
      case '=': return d === 0; case '<>': return d !== 0; case '<': return d < 0;
      case '<=': return d <= 0; case '>': return d > 0; default: return d >= 0;
    }
  }

  /* ---- criteria ("<>5", ">="&A1, "a*") for the *IF family ---------------- */
  function criterion(v) {
    v = deref(v);
    if (typeof v === 'string') {
      const m = /^(<>|<=|>=|=|<|>)(.*)$/s.exec(v);
      if (m) return { op: m[1], val: parseCritVal(m[2]) };
      return { op: '=', val: parseCritVal(v) };
    }
    return { op: '=', val: v === null ? 0 : v };   // an empty criteria cell counts as 0, not as ""
  }
  function parseCritVal(t) {
    if (t === '') return '';
    const n = textToNumber(t);
    if (n !== null) return n;
    const u = t.trim().toUpperCase();
    if (u === 'TRUE') return true;
    if (u === 'FALSE') return false;
    if (isErrVal(u)) return u;
    return t;
  }
  function wildcardRx(pat) {
    let rx = '^';
    for (let i = 0; i < pat.length; i++) {
      const ch = pat[i];
      if (ch === '~' && i + 1 < pat.length) { rx += pat[++i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
      else if (ch === '*') rx += '.*';
      else if (ch === '?') rx += '.';
      else rx += ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    return new RegExp(rx + '$', 'is');
  }
  function matches(cell, crit) {
    const { op, val } = crit;
    if (typeof val === 'string' && isErrVal(val)) return op === '=' ? cell === val : op === '<>' ? cell !== val : false;
    if (op === '=' || op === '<>') {
      let eq;
      if (val === '') eq = (cell === null || cell === '');
      else if (typeof val === 'number') eq = (typeof cell === 'number' && numeq(cell, val)) || (typeof cell === 'string' && textToNumber(cell) !== null && numeq(textToNumber(cell), val));
      else if (typeof val === 'boolean') eq = cell === val;
      else eq = typeof cell === 'string' && wildcardRx(val).test(cell);
      return op === '=' ? eq : !eq;
    }
    if (typeof val === 'number') { if (typeof cell !== 'number') return false; return compare(op, cell, val); }
    if (typeof val === 'string') { if (typeof cell !== 'string') return false; return compare(op, cell, val); }
    if (typeof val === 'boolean') { if (typeof cell !== 'boolean') return false; return compare(op, cell, val); }
    return false;
  }

  /* ---- aggregates ------------------------------------------------------------- */
  // Numbers gathered Excel-style: range cells contribute numbers only (text/booleans/blanks are
  // skipped, errors propagate); direct arguments are coerced (booleans → 1/0, numeric text → number,
  // other text → #VALUE!, blank → skipped).
  function collectNums(args, { keepBoolInRange = false } = {}) {
    const out = [];
    for (const v of args) {
      if (v === undefined || v === null) continue;
      if (isRange(v)) {
        for (const k of v.keys()) { const x = cellVal(k); if (typeof x === 'number') out.push(x); else if (keepBoolInRange && typeof x === 'boolean') out.push(x ? 1 : 0); }
      } else out.push(toNum(v));
    }
    return out;
  }
  const evArgs = (node) => node.args.map(a => a === null ? undefined : ev(a));
  const arityOk = (name, node) => { if (MIN_ARGS[name] !== undefined && node.args.filter(a => a !== null).length < MIN_ARGS[name]) throw new SyntaxError('too few arguments for ' + name); };
  const A = (args, i) => args[i] === undefined ? undefined : args[i];
  const has = (args, i) => args.length > i && args[i] !== undefined;

  /* ---- rounding on the 15-digit decimal representation (Excel's, not IEEE's) ---- */
  function shift(x, d) { return Number(Math.abs(x).toPrecision(15) + 'e' + d); }
  function unshift(m, d) { return Number(m + 'e' + (-d)); }
  const roundHalfAway = (x, d) => { const m = Math.round(shift(x, d)); return (x < 0 ? -1 : 1) * unshift(m, d); };
  const roundUp = (x, d) => { const m = Math.ceil(num15(shift(x, d))); return (x < 0 ? -1 : 1) * unshift(m, d); };
  const roundDown = (x, d) => { const m = Math.floor(num15(shift(x, d))); return (x < 0 ? -1 : 1) * unshift(m, d); };

  /* ---- dates ------------------------------------------------------------------- */
  const EPOCH = Date.UTC(1899, 11, 30);
  // Excel's 1900 date system counts a phantom 29 Feb 1900 (serial 60): serials below 61 are one
  // day behind the real calendar, and serial 60 itself is 1900-02-29.
  const serial = (y, m, d) => { if (y === 1900 && m === 2 && d >= 29) return 31 + d; const n = Math.floor((Date.UTC(y, m - 1, d) - EPOCH) / 86400000); return n < 61 ? n - 1 : n; };
  const dateOf = s => { s = Math.floor(s); if (s < 0) throw err('#NUM!'); return serialToDate(s < 60 ? s + 1 : s); };
  const ymd = s => { s = Math.floor(s); if (s === 60) return { y: 1900, m: 2, d: 29, wd: 3 }; if (s === 0) return { y: 1900, m: 1, d: 0, wd: 6 }; const d = dateOf(s); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), wd: d.getUTCDay() }; };
  const todaySerial = () => ctx.today ? ctx.today() : Math.floor((Date.now() - EPOCH) / 86400000);

  /* ---- lookups ----------------------------------------------------------------- */
  function lookupIndex(key, vals, mode) {
    // mode 0 exact (wildcards on text) · 1 largest ≤ key on ascending · -1 smallest ≥ key on descending
    key = deref(key);
    if (key === null) key = 0;
    const same = v => typeof v === typeof key;
    if (mode === 0) {
      if (typeof key === 'string') { const rx = /[*?]/.test(key) ? wildcardRx(key) : null;
        for (let i = 0; i < vals.length; i++) { const v = vals[i]; if (typeof v !== 'string') continue; if (rx ? rx.test(v) : cmpText(v, key) === 0) return i; } return -1; }
      for (let i = 0; i < vals.length; i++) { const v = vals[i]; if (!same(v)) continue; if (typeof v === 'number' ? numeq(v, key) : v === key) return i; }
      return -1;
    }
    let hit = -1;
    for (let i = 0; i < vals.length; i++) {
      const v = vals[i]; if (!same(v)) continue;
      const le = compare('<=', v, key), ge = compare('>=', v, key);
      if (mode === 1) { if (le) hit = i; else break; }
      else { if (ge) hit = i; else break; }
    }
    return hit;
  }
  const colVals = (rg, c) => { const out = []; for (let r = 0; r < rg.rows; r++) out.push(cellVal(rg.at(r, c))); return out; };
  const rowVals = (rg, r) => { const out = []; for (let c = 0; c < rg.cols; c++) out.push(cellVal(rg.at(r, c))); return out; };
  const flatVals = rg => rg.keys().map(cellVal);

  /* ---- TEXT(value, format) — the everyday subset ----------------------------- */
  function textFormat(v, fmt) {
    const f = String(fmt);
    if (/[ymd]/i.test(f) && !/[#0]/.test(f)) {
      const d = dateOf(toNum(v));
      const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return f.replace(/yyyy|yy|mmmm|mmm|mm|m|dddd|ddd|dd|d/gi, tk => {
        switch (tk.toLowerCase()) {
          case 'yyyy': return String(d.getUTCFullYear()); case 'yy': return String(d.getUTCFullYear()).slice(2);
          case 'mmmm': return MON[d.getUTCMonth()]; case 'mmm': return MON[d.getUTCMonth()].slice(0, 3);
          case 'mm': return String(d.getUTCMonth() + 1).padStart(2, '0'); case 'm': return String(d.getUTCMonth() + 1);
          case 'dddd': return DAY[d.getUTCDay()]; case 'ddd': return DAY[d.getUTCDay()].slice(0, 3);
          case 'dd': return String(d.getUTCDate()).padStart(2, '0'); default: return String(d.getUTCDate());
        }
      });
    }
    let n = toNum(v);
    const pct = f.includes('%'); if (pct) n *= 100;
    const dec = (f.split('.')[1] || '').replace(/[^0#]/g, '').length;
    const grouped = /#,#|0,0|#,0/.test(f);
    const prefix = f.startsWith('$') ? '$' : '';
    const neg = n < 0; const a = Math.abs(roundHalfAway(n, dec));
    const body = grouped ? a.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : a.toFixed(dec);
    return (neg ? '-' : '') + prefix + body + (pct ? '%' : '');
  }

  /* ---- the function table --------------------------------------------------------- */
  function callFn(name, node) {
    // lazy forms first
    switch (name) {
      case 'IF': {
        if (node.args.length < 2 || node.args.length > 3) throw new SyntaxError('IF takes 2 or 3 arguments');
        const c = toBool(ev(node.args[0]));
        const pick = c ? node.args[1] : node.args[2];
        if (pick === undefined) return c ? true : false;
        if (pick === null) return 0;
        return ev(pick);
      }
      case 'IFS': {
        if (node.args.length < 2 || node.args.length % 2) throw err('#VALUE!');
        for (let i = 0; i < node.args.length; i += 2) { if (toBool(ev(node.args[i]))) return node.args[i + 1] === null ? 0 : ev(node.args[i + 1]); }
        throw err('#N/A');
      }
      case 'IFERROR': case 'IFNA': {
        if (node.args.length !== 2) throw new SyntaxError(name + ' takes 2 arguments');
        let v;
        try { v = deref(node.args[0] === null ? 0 : ev(node.args[0])); }
        catch (e) { if (!(e instanceof FxError)) throw e; if (name === 'IFNA' && e.code !== '#N/A') throw e; return node.args[1] === null ? 0 : ev(node.args[1]); }
        if (typeof v === 'number' && !isFinite(v)) return node.args[1] === null ? 0 : ev(node.args[1]);
        return v;
      }
      case 'CHOOSE': {
        const idx = toInt(ev(node.args[0]));
        if (idx < 1 || idx >= node.args.length) throw err('#VALUE!');
        return node.args[idx] === null ? 0 : ev(node.args[idx]);
      }
      case 'SWITCH': {
        const x = deref(ev(node.args[0]));
        const n = node.args.length;
        for (let i = 1; i + 1 < n; i += 2) { if (compare('=', x, ev(node.args[i]))) return ev(node.args[i + 1]); }
        if ((n - 1) % 2 === 1) return ev(node.args[n - 1]);
        throw err('#N/A');
      }
      case 'ISERROR': case 'ISERR': case 'ISNA': {
        try { deref(ev(node.args[0])); return false; }
        catch (e) { if (!(e instanceof FxError)) throw e; if (name === 'ISERROR') return true; if (name === 'ISNA') return e.code === '#N/A'; return e.code !== '#N/A'; }
      }
      case 'ROW': case 'COLUMN': {
        if (!node.args.length || node.args[0] === null) { if (!ctx.cell) throw err('#VALUE!'); return name === 'ROW' ? ctx.cell.r : ctx.cell.c; }
        const v = ev(node.args[0]); if (!isRange(v)) throw err('#VALUE!'); return name === 'ROW' ? v.r1 : v.c1;
      }
    }
    if (name === 'COUNT' || name === 'COUNTA') {
      // errors in the argument list are counted (COUNTA) or ignored (COUNT), never propagated
      const vals = node.args.map(a => { if (a === null) return undefined; try { return ev(a); } catch (e) { if (e instanceof FxError) return { __err: e.code }; throw e; } });
      let k = 0;
      for (const v of vals) {
        if (v === undefined) continue;
        if (isRange(v)) { for (const key of v.keys()) { const x = raw(key); if (name === 'COUNT' ? typeof x === 'number' : (x !== null && x !== undefined)) k++; } }
        else if (v && v.__err) { if (name === 'COUNTA') k++; }
        else if (name === 'COUNT') { if (typeof v === 'number' || typeof v === 'boolean' || (typeof v === 'string' && textToNumber(v) !== null)) k++; }
        else if (v !== null) k++;
      }
      return k;
    }
    if (MIN_ARGS[name] !== undefined && node.args.filter(a => a !== null).length < MIN_ARGS[name]) throw new SyntaxError('too few arguments for ' + name);
    const args = evArgs(node);
    const n = args.length;
    const nums = (opts) => collectNums(args, opts);
    switch (name) {
      /* ---- math & statistics ---- */
      case 'SUM': return nums().reduce((a, b) => a + b, 0);
      case 'PRODUCT': { const xs = nums(); return xs.length ? xs.reduce((a, b) => a * b, 1) : 0; }
      case 'AVERAGE': { const xs = nums(); if (!xs.length) throw err('#DIV/0!'); return xs.reduce((a, b) => a + b, 0) / xs.length; }
      case 'MIN': { const xs = nums(); return xs.length ? Math.min(...xs) : 0; }
      case 'MAX': { const xs = nums(); return xs.length ? Math.max(...xs) : 0; }
      case 'MEDIAN': { const xs = nums().sort((a, b) => a - b); if (!xs.length) throw err('#NUM!'); const m = xs.length >> 1; return xs.length % 2 ? xs[m] : (xs[m - 1] + xs[m]) / 2; }
      case 'COUNTBLANK': { const rg = argRange(args[0]); let k = 0; for (const key of rg.keys()) { const x = raw(key); if (x === null || x === undefined || x === '') k++; } return k; }
      case 'ABS': return Math.abs(toNum(args[0]));
      case 'SIGN': return Math.sign(toNum(args[0]));
      case 'INT': return Math.floor(toNum(args[0]));
      case 'TRUNC': return roundDown(toNum(args[0]), has(args, 1) ? toInt(args[1]) : 0);
      case 'ROUND': return roundHalfAway(toNum(args[0]), toInt(args[1]));
      case 'ROUNDUP': return roundUp(toNum(args[0]), toInt(args[1]));
      case 'ROUNDDOWN': return roundDown(toNum(args[0]), toInt(args[1]));
      case 'MOD': { const a = toNum(args[0]), b = toNum(args[1]); if (b === 0) throw err('#DIV/0!'); return a - b * Math.floor(a / b); }
      case 'SQRT': { const x = toNum(args[0]); if (x < 0) throw err('#NUM!'); return Math.sqrt(x); }
      case 'POWER': { const a = toNum(args[0]), b = toNum(args[1]); if (a === 0 && b < 0) throw err('#DIV/0!'); if (a === 0 && b === 0) throw err('#NUM!'); const v = Math.pow(a, b); if (isNaN(v)) throw err('#NUM!'); return checkNum(v); }
      case 'EXP': return checkNum(Math.exp(toNum(args[0])));
      case 'LN': { const x = toNum(args[0]); if (x <= 0) throw err('#NUM!'); return Math.log(x); }
      case 'LOG': { const x = toNum(args[0]), b = has(args, 1) ? toNum(args[1]) : 10; if (x <= 0 || b <= 0 || b === 1) throw err('#NUM!'); return Math.log(x) / Math.log(b); }
      case 'LOG10': { const x = toNum(args[0]); if (x <= 0) throw err('#NUM!'); return Math.log10(x); }
      case 'PI': return Math.PI;
      case 'RAND': return ctx.random ? ctx.random() : Math.random();
      case 'LARGE': case 'SMALL': { const xs = collectNums([args[0]]).sort((a, b) => name === 'LARGE' ? b - a : a - b); const k = toInt(args[1]); if (k < 1 || k > xs.length) throw err('#NUM!'); return xs[k - 1]; }
      case 'RANK': case 'RANK.EQ': { const x = toNum(args[0]); const xs = collectNums([argRange(args[1])]); const asc = has(args, 2) && toNum(args[2]) !== 0;
        if (!xs.some(v => numeq(v, x))) throw err('#N/A'); return xs.filter(v => asc ? v < x : v > x).length + 1; }
      case 'SUMPRODUCT': { const rgs = args.map(argRange); const L = rgs[0].size; if (rgs.some(r => r.size !== L)) throw err('#VALUE!');
        let t = 0; for (let i = 0; i < L; i++) { let m = 1; for (const rg of rgs) { const v = cellVal(rg.cell(i)); m *= typeof v === 'number' ? v : 0; } t += m; } return t; }
      case 'SUMIF': case 'AVERAGEIF': case 'COUNTIF': {
        const rg = argRange(args[0]); const crit = criterion(args[1]);
        const sumRg = name === 'COUNTIF' ? null : (has(args, 2) ? argRange(args[2]) : rg);
        let t = 0, k = 0;
        for (let i = 0; i < rg.size; i++) { const v = cellVal(rg.cell(i)); if (!matches(v, crit)) continue; k++;
          if (sumRg) { const key = sumRg.at(Math.floor(i / rg.cols), i % rg.cols); const x = raw(key); if (isErrVal(x)) throw err(x); if (typeof x === 'number') t += x; else if (name === 'AVERAGEIF') k--; } }
        if (name === 'COUNTIF') return k; if (name === 'SUMIF') return t; if (!k) throw err('#DIV/0!'); return t / k;
      }
      case 'SUMIFS': case 'AVERAGEIFS': case 'COUNTIFS': case 'MAXIFS': case 'MINIFS': {
        const isCount = name === 'COUNTIFS';
        const sumRg = isCount ? null : argRange(args[0]);
        const pairs = []; for (let i = isCount ? 0 : 1; i + 1 < n; i += 2) pairs.push({ rg: argRange(args[i]), crit: criterion(args[i + 1]) });
        if (!pairs.length) throw err('#VALUE!');
        const L = pairs[0].rg.size; if (pairs.some(p => p.rg.size !== L) || (sumRg && sumRg.size !== L)) throw err('#VALUE!');
        const hits = [];
        for (let i = 0; i < L; i++) { if (pairs.every(p => matches(cellVal(p.rg.cell(i)), p.crit))) { if (isCount) hits.push(1); else { const x = cellVal(sumRg.cell(i)); if (typeof x === 'number') hits.push(x); } } }
        if (isCount) return hits.length;
        if (name === 'SUMIFS') return hits.reduce((a, b) => a + b, 0);
        if (name === 'AVERAGEIFS') { if (!hits.length) throw err('#DIV/0!'); return hits.reduce((a, b) => a + b, 0) / hits.length; }
        if (!hits.length) return 0; return name === 'MAXIFS' ? Math.max(...hits) : Math.min(...hits);
      }
      /* ---- logical ---- */
      case 'AND': case 'OR': case 'XOR': {
        const bs = []; for (const v of args) { if (v === undefined) continue;
          if (isRange(v)) { for (const key of v.keys()) { const x = cellVal(key); if (typeof x === 'number') bs.push(x !== 0); else if (typeof x === 'boolean') bs.push(x); } }
          else if (v !== null) bs.push(toBool(v)); }
        if (!bs.length) throw err('#VALUE!');
        if (name === 'AND') return bs.every(Boolean); if (name === 'OR') return bs.some(Boolean); return bs.filter(Boolean).length % 2 === 1;
      }
      case 'NOT': return !toBool(args[0]);
      case 'TRUE': return true; case 'FALSE': return false;
      case 'NA': throw err('#N/A');
      case 'ISBLANK': { const v = args[0]; if (isRange(v) && v.size === 1) { const x = raw(v.cell(0)); return x === null || x === undefined; } return v === null || v === undefined; }
      case 'ISNUMBER': { let v = args[0]; try { v = deref(v); } catch (e) { if (e instanceof FxError) return false; throw e; } return typeof v === 'number'; }
      case 'ISTEXT': { let v = args[0]; try { v = deref(v); } catch (e) { if (e instanceof FxError) return false; throw e; } return typeof v === 'string'; }
      case 'ISNONTEXT': { let v = args[0]; try { v = deref(v); } catch (e) { if (e instanceof FxError) return true; throw e; } return typeof v !== 'string'; }
      case 'ISLOGICAL': { let v = args[0]; try { v = deref(v); } catch (e) { if (e instanceof FxError) return false; throw e; } return typeof v === 'boolean'; }
      /* ---- lookup ---- */
      case 'MATCH': { const rg = argRange(args[1]); const mode = has(args, 2) ? Math.sign(toNum(args[2])) : 1;
        const vals = flatVals(rg); const i = lookupIndex(args[0], vals, mode); if (i < 0) throw err('#N/A'); return i + 1; }
      case 'INDEX': { const rg = argRange(args[0]);
        const r = has(args, 1) ? toInt(args[1]) : 0, c = has(args, 2) ? toInt(args[2]) : (rg.rows === 1 && !has(args, 2) && has(args, 1) && rg.cols > 1 ? r : 0);
        if (rg.rows === 1 && rg.cols > 1 && !has(args, 2) && has(args, 1)) { if (r < 1 || r > rg.cols) throw err('#REF!'); return new Range(rg.r1, rg.c1 + r - 1, rg.r1, rg.c1 + r - 1); }
        if (r < 0 || c < 0 || r > rg.rows || c > rg.cols) throw err('#REF!');
        if (r === 0 && c === 0) return rg;
        if (r === 0) return new Range(rg.r1, rg.c1 + c - 1, rg.r2, rg.c1 + c - 1);
        if (c === 0) { if (rg.cols === 1) return new Range(rg.r1 + r - 1, rg.c1, rg.r1 + r - 1, rg.c1); return new Range(rg.r1 + r - 1, rg.c1, rg.r1 + r - 1, rg.c2); }
        return new Range(rg.r1 + r - 1, rg.c1 + c - 1, rg.r1 + r - 1, rg.c1 + c - 1); }
      case 'VLOOKUP': case 'HLOOKUP': { const rg = argRange(args[1]); const idx = toInt(args[2]); const approx = has(args, 3) ? toBool(args[3]) : true;
        const vert = name === 'VLOOKUP'; if (idx < 1 || idx > (vert ? rg.cols : rg.rows)) throw err('#REF!');
        const keys = vert ? colVals(rg, 0) : rowVals(rg, 0); const i = lookupIndex(args[0], keys, approx ? 1 : 0); if (i < 0) throw err('#N/A');
        const v = cellVal(vert ? rg.at(i, idx - 1) : rg.at(idx - 1, i)); return v === null ? 0 : v; }
      case 'XLOOKUP': { const look = argRange(args[1]), ret = argRange(args[2]); const mode = has(args, 4) ? toInt(args[4]) : 0;
        const vals = flatVals(look); let i = lookupIndex(args[0], vals, mode === 0 ? 0 : mode === -1 ? 1 : -1);
        if (i < 0) { if (has(args, 3)) return args[3]; throw err('#N/A'); }
        const v = cellVal(ret.cell(i)); return v === null ? 0 : v; }
      case 'OFFSET': { const base = argRange(args[0]); const dr = toInt(args[1]), dc = toInt(args[2]);
        const h = has(args, 3) ? toInt(args[3]) : base.rows, w = has(args, 4) ? toInt(args[4]) : base.cols;
        if (h < 1 || w < 1) throw err('#REF!'); const r1 = base.r1 + dr, c1 = base.c1 + dc; if (r1 < 1 || c1 < 1) throw err('#REF!');
        return new Range(r1, c1, r1 + h - 1, c1 + w - 1); }
      case 'ROWS': return argRange(args[0]).rows;
      case 'COLUMNS': return argRange(args[0]).cols;
      /* ---- text ---- */
      case 'LEN': return toText(args[0]).length;
      case 'LEFT': { const t = toText(args[0]); const k = has(args, 1) ? toInt(args[1]) : 1; if (k < 0) throw err('#VALUE!'); return t.slice(0, k); }
      case 'RIGHT': { const t = toText(args[0]); const k = has(args, 1) ? toInt(args[1]) : 1; if (k < 0) throw err('#VALUE!'); return k === 0 ? '' : t.slice(-k); }
      case 'MID': { const t = toText(args[0]); const st = toInt(args[1]), k = toInt(args[2]); if (st < 1 || k < 0) throw err('#VALUE!'); return t.substr(st - 1, k); }
      case 'FIND': case 'SEARCH': { const needle = toText(args[0]), hay = toText(args[1]); const st = has(args, 2) ? toInt(args[2]) : 1;
        if (st < 1 || st > hay.length + 1) throw err('#VALUE!');
        let p;
        if (name === 'FIND') p = hay.indexOf(needle, st - 1);
        else { const rx = /[*?~]/.test(needle) ? wildcardRx(needle).source.replace(/^\^|\$$/g, '') : needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); const m = new RegExp(rx, 'i').exec(hay.slice(st - 1)); p = m ? m.index + st - 1 : -1; }
        if (p < 0) throw err('#VALUE!'); return p + 1; }
      case 'TRIM': return toText(args[0]).replace(/ +/g, ' ').replace(/^ | $/g, '');
      case 'UPPER': return toText(args[0]).toUpperCase();
      case 'LOWER': return toText(args[0]).toLowerCase();
      case 'PROPER': return toText(args[0]).toLowerCase().replace(/(^|[^A-Za-z])([a-z])/g, (m, a, b) => a + b.toUpperCase());
      case 'CONCATENATE': case 'CONCAT': { let s = ''; for (const v of args) { if (v === undefined) continue; if (isRange(v)) { if (name === 'CONCATENATE' && v.size > 1) throw err('#VALUE!'); for (const k of v.keys()) s += toText(cellVal(k)); } else s += toText(v); } return s; }
      case 'TEXTJOIN': { const d = toText(args[0]); const skip = toBool(args[1]); const parts = [];
        for (const v of args.slice(2)) { if (v === undefined) continue; const vs = isRange(v) ? v.keys().map(k => toText(cellVal(k))) : [toText(v)]; for (const t of vs) if (!skip || t !== '') parts.push(t); }
        return parts.join(d); }
      case 'SUBSTITUTE': { const t = toText(args[0]), o = toText(args[1]), nw = toText(args[2]); if (o === '') return t;
        if (has(args, 3)) { const inst = toInt(args[3]); if (inst < 1) throw err('#VALUE!'); let idx = -1; for (let k = 0; k < inst; k++) { idx = t.indexOf(o, idx + 1); if (idx < 0) return t; } return t.slice(0, idx) + nw + t.slice(idx + o.length); }
        return t.split(o).join(nw); }
      case 'REPT': { const k = toInt(args[1]); if (k < 0) throw err('#VALUE!'); return toText(args[0]).repeat(k); }
      case 'EXACT': return toText(args[0]) === toText(args[1]);
      case 'VALUE': { const v = deref(args[0]); if (typeof v === 'number') return v; const x = textToNumber(toText(v)); if (x === null) throw err('#VALUE!'); return x; }
      case 'TEXT': return textFormat(args[0], toText(args[1]));
      case 'T': { const v = deref(args[0]); return typeof v === 'string' ? v : ''; }
      case 'N': { const v = deref(args[0]); return typeof v === 'number' ? v : typeof v === 'boolean' ? (v ? 1 : 0) : 0; }
      /* ---- dates ---- */
      case 'TODAY': return todaySerial();
      case 'DATE': return serial(toInt(args[0]), toInt(args[1]), toInt(args[2]));
      case 'YEAR': return ymd(toNum(args[0])).y;
      case 'MONTH': return ymd(toNum(args[0])).m;
      case 'DAY': return ymd(toNum(args[0])).d;
      case 'WEEKDAY': { const d = ymd(toNum(args[0])).wd; const t = has(args, 1) ? toInt(args[1]) : 1; if (t === 2) return d === 0 ? 7 : d; if (t === 3) return d === 0 ? 6 : d - 1; return d + 1; }
      case 'DAYS': return Math.floor(toNum(args[0])) - Math.floor(toNum(args[1]));
      case 'EDATE': case 'EOMONTH': { const d = dateOf(toNum(args[0])); const y = d.getUTCFullYear(), m = d.getUTCMonth() + toInt(args[1]), dd = d.getUTCDate();
        if (name === 'EOMONTH') return serial(y, m + 2, 0);
        const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); return serial(y, m + 1, Math.min(dd, last)); }
      case 'YEARFRAC': { const a = dateOf(toNum(args[0])), b = dateOf(toNum(args[1])); const basis = has(args, 2) ? toInt(args[2]) : 0;
        if (basis === 1) {
          const days = Math.abs((b - a) / 86400000); const [A1, B1] = a <= b ? [a, b] : [b, a];
          const y1 = A1.getUTCFullYear(), y2 = B1.getUTCFullYear();
          const ylen = y => (new Date(Date.UTC(y, 1, 29)).getUTCMonth() === 1) ? 366 : 365;
          if (y1 === y2) return days / ylen(y1);
          if (days <= 366) { const feb29 = y => Date.UTC(y, 1, 29); const leapIn = (y) => ylen(y) === 366 && feb29(y) >= A1.getTime() && feb29(y) <= B1.getTime(); return days / ((leapIn(y1) || leapIn(y2)) ? 366 : 365); }
          let total = 0; for (let y = y1; y <= y2; y++) total += ylen(y); return days / (total / (y2 - y1 + 1));
        }
        if (basis === 2) return Math.abs((b - a) / 86400000) / 360;
        if (basis === 3) return Math.abs((b - a) / 86400000) / 365;
        let [A, B] = a <= b ? [a, b] : [b, a]; let d1 = A.getUTCDate(), d2 = B.getUTCDate();
        const y1 = A.getUTCFullYear(), m1 = A.getUTCMonth() + 1, y2 = B.getUTCFullYear(), m2 = B.getUTCMonth() + 1;
        const isFebEnd = d => d.getUTCMonth() === 1 && d.getUTCDate() === new Date(Date.UTC(d.getUTCFullYear(), 2, 0)).getUTCDate();
        if (isFebEnd(A) && isFebEnd(B)) d2 = 30; if (isFebEnd(A)) d1 = 30; if (d2 === 31 && d1 >= 30) d2 = 30; if (d1 === 31) d1 = 30;
        return ((y2 - y1) * 360 + (m2 - m1) * 30 + (d2 - d1)) / 360; }
      /* ---- financial ---- */
      case 'NPV': { const rate = toNum(args[0]); const flows = collectNums(args.slice(1)); if (rate === -1) throw err('#DIV/0!'); let t = 0; for (let i = 0; i < flows.length; i++) t += flows[i] / Math.pow(1 + rate, i + 1); return t; }
      case 'IRR': { const flows = collectNums([args[0]]); if (!(flows.some(x => x > 0) && flows.some(x => x < 0))) throw err('#NUM!');
        const f = r => { let t = 0; for (let i = 0; i < flows.length; i++) t += flows[i] / Math.pow(1 + r, i); return t; };
        let lo = -0.999999, hi = 10, flo = f(lo), fhi = f(hi); if (!isFinite(flo) || !isFinite(fhi) || flo * fhi > 0) throw err('#NUM!');
        for (let k = 0; k < 200; k++) { const mid = (lo + hi) / 2, fm = f(mid); if (flo * fm <= 0) { hi = mid; fhi = fm; } else { lo = mid; flo = fm; } }
        return num15((lo + hi) / 2); }
      case 'PMT': { const r = toNum(args[0]), np = toNum(args[1]), pv = toNum(args[2]), fv = has(args, 3) ? toNum(args[3]) : 0, type = has(args, 4) ? toNum(args[4]) : 0;
        if (r === 0) return -(pv + fv) / np; const q = Math.pow(1 + r, np); return -(r * (pv * q + fv)) / ((1 + r * type) * (q - 1)); }
      case 'PV': { const r = toNum(args[0]), np = toNum(args[1]), pmt = toNum(args[2]), fv = has(args, 3) ? toNum(args[3]) : 0, type = has(args, 4) ? toNum(args[4]) : 0;
        if (r === 0) return -(pmt * np + fv); const q = Math.pow(1 + r, np); return -(fv + pmt * (1 + r * type) * (q - 1) / r) / q; }
      case 'FV': { const r = toNum(args[0]), np = toNum(args[1]), pmt = toNum(args[2]), pv = has(args, 3) ? toNum(args[3]) : 0, type = has(args, 4) ? toNum(args[4]) : 0;
        if (r === 0) return -(pv + pmt * np); const q = Math.pow(1 + r, np); return -(pv * q + pmt * (1 + r * type) * (q - 1) / r); }
      default: throw err('#NAME?');
    }
  }
  const checkNum = x => { if (typeof x !== 'number' || !isFinite(x)) throw err('#NUM!'); return x; };

  /* ---- AST walker --------------------------------------------------------------- */
  function ev(node) {
    switch (node.k) {
      case 'num': return node.v;
      case 'str': return node.v;
      case 'bool': return node.v;
      case 'err': throw err(node.v);
      case 'name': throw err('#NAME?');
      case 'paren': return ev(node.x);
      case 'ref': { const p = refParts(node.ref); return new Range(p.r, p.c, p.r, p.c); }
      case 'range': return rangeOf(node.a, node.b);
      case 'colrange': { const a = colIndex(node.a), b = colIndex(node.b); return new Range(1, Math.min(a, b), ROWS, Math.max(a, b)); }
      case 'rowrange': return new Range(Math.min(node.a, node.b), 1, Math.max(node.a, node.b), COLS);
      case 'un': { const x = toNum(ev(node.x)); return node.op === '-' ? -x : x; }
      case 'pct': return toNum(ev(node.x)) / 100;
      case 'bin': {
        const op = node.op;
        if (BP[op] === 1) return compare(op, ev(node.l), ev(node.r));
        if (op === '&') return toText(ev(node.l)) + toText(ev(node.r));
        const a = toNum(ev(node.l)), b = toNum(ev(node.r));
        switch (op) {
          case '+': return checkNum(a + b);
          case '-': return checkNum(a - b);
          case '*': return checkNum(a * b);
          case '/': if (b === 0) throw err('#DIV/0!'); return checkNum(a / b);
          case '^': { if (a === 0 && b < 0) throw err('#DIV/0!'); if (a === 0 && b === 0) throw err('#NUM!'); const v = Math.pow(a, b); if (isNaN(v)) throw err('#NUM!'); return checkNum(v); }
        }
        throw new SyntaxError('operator');
      }
      case 'fn': return callFn(node.name, node);
      default: throw new SyntaxError('node');
    }
  }

  try {
    let v = ev(ast);
    if (isRange(v)) v = cellVal(v.cell(0));   // a multi-cell result spills in Excel 365; the formula cell shows its top-left value
    if (v === null || v === undefined) return 0;
    if (typeof v === 'number') { if (!isFinite(v)) return '#NUM!'; return Object.is(v, -0) ? 0 : v; }
    return v;
  } catch (e) {
    if (e instanceof FxError) return e.code;
    throw e;   // SyntaxError: the formula does not parse — the commit gate decides what to do
  }
}

/* ============================================================================
   FORMULA TEXT UTILITIES (all token-based — never regex over raw formula text)
   ============================================================================ */

/** True when text is a formula that parses. */
export function parses(expr) { try { parseFormula(expr); return true; } catch (e) { return false; } }

/**
 * Every reference the formula reads, as {key} for cells and {range:{r1,c1,r2,c2}} for ranges,
 * with the token positions (relative to the text after '=') for highlighting.
 */
export function formulaRefs(expr) {
  let s = String(expr).trim(); const off = s[0] === '=' ? 1 : 0; if (off) s = s.slice(1);
  let toks; try { toks = tokenize(s); } catch (e) { return []; }
  const out = [];
  const parts = ref => { const m = /^\$?([A-Z]{1,3})\$?(\d+)$/.exec(ref); return { c: colIndex(m[1]), r: +m[2] }; };
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (t.t === 'ref') {
      const n1 = toks[i + 1], n2 = toks[i + 2];
      if (n1 && n1.t === 'op' && n1.v === ':' && n2 && n2.t === 'ref') {
        const a = parts(t.v), b = parts(n2.v);
        out.push({ range: { r1: Math.min(a.r, b.r), c1: Math.min(a.c, b.c), r2: Math.max(a.r, b.r), c2: Math.max(a.c, b.c) }, pos: t.pos + off, end: n2.end + off, text: s.slice(t.pos, n2.end) });
        i += 2; continue;
      }
      const a = parts(t.v);
      out.push({ key: refKey(a.r, a.c), pos: t.pos + off, end: t.end + off, text: s.slice(t.pos, t.end) });
    }
  }
  return out;
}

/** Function names used by a formula (uppercase), e.g. ['SUM']. Token-based. */
export function formulaFunctions(expr) {
  let s = String(expr).trim(); if (s[0] === '=') s = s.slice(1);
  try { return [...new Set(tokenize(s).filter(t => t.t === 'fn').map(t => t.v))]; } catch (e) { return []; }
}

/**
 * Shift relative references by (dr, dc) — what copy/paste and fill do. Absolute parts ($) stay.
 * A reference pushed off the sheet becomes #REF!. Text outside references is preserved exactly.
 */
export function translateFormula(f, dr, dc) {
  const src = String(f);
  const eq = src.trimStart()[0] === '=';
  const body = eq ? src.slice(src.indexOf('=') + 1) : src;
  let toks; try { toks = tokenize(body); } catch (e) { return src; }
  const shiftRef = ref => {
    const m = /^(\$?)([A-Z]{1,3})(\$?)(\d+)$/.exec(ref);
    let c = colIndex(m[2]), r = +m[4];
    if (!m[1]) c += dc; if (!m[3]) r += dr;
    if (c < 1 || r < 1) return '#REF!';
    return m[1] + colLetter(c) + m[3] + r;
  };
  let out = '', last = 0;
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    let rep = null;
    if (t.t === 'ref' && toks[i + 1] && toks[i + 1].t === 'op' && toks[i + 1].v === ':' && toks[i + 2] && toks[i + 2].t === 'ref') {
      // a range: if either corner leaves the sheet the whole reference is #REF! (Excel)
      const a = shiftRef(t.v), b = shiftRef(toks[i + 2].v);
      out += body.slice(last, t.pos) + (a === '#REF!' || b === '#REF!' ? '#REF!' : a + ':' + b); last = toks[i + 2].end; i += 2; continue;
    }
    if (t.t === 'ref') rep = shiftRef(t.v);
    else if (t.t === 'name' && /^\$?[A-Z]{1,3}$/.test(t.v) && toks[i + 1] && toks[i + 1].t === 'op' && toks[i + 1].v === ':') {
      const abs = t.v[0] === '$'; const c = colIndex(t.v.replace('$', '')) + (abs ? 0 : dc); rep = c < 1 ? '#REF!' : (abs ? '$' : '') + colLetter(c);
    } else if (t.t === 'name' && /^\$?[A-Z]{1,3}$/.test(t.v) && toks[i - 1] && toks[i - 1].t === 'op' && toks[i - 1].v === ':') {
      const abs = t.v[0] === '$'; const c = colIndex(t.v.replace('$', '')) + (abs ? 0 : dc); rep = c < 1 ? '#REF!' : (abs ? '$' : '') + colLetter(c);
    } else if (t.t === 'num' && Number.isInteger(t.v) && ((toks[i + 1] && toks[i + 1].t === 'op' && toks[i + 1].v === ':' && toks[i + 2] && toks[i + 2].t === 'num') || (toks[i - 1] && toks[i - 1].t === 'op' && toks[i - 1].v === ':' && toks[i - 2] && toks[i - 2].t === 'num'))) {
      const r = t.v + dr; rep = r < 1 ? '#REF!' : String(r);
    }
    if (rep !== null) { out += body.slice(last, t.pos) + rep; last = t.end; }
  }
  out += body.slice(last);
  return (eq ? '=' : '') + out;
}

/**
 * Commit-time classifier for a typed formula (the autocorrect ladder):
 *   ok   → parses as typed (references and function names case-normalised)
 *   fix  → a mechanical repair makes it parse; propose `fixed`
 *   bad  → nothing works
 */
export function autocorrectFormula(buf) {
  const norm = normalizeFormula(String(buf).trim());
  if (parses(norm)) return { kind: 'ok', buf: norm };
  const cands = [];
  const outside = (str, f) => str.split(/("(?:[^"]|"")*")/).map((seg, k) => k % 2 ? seg : f(seg)).join('');
  cands.push(outside(norm, s => s.replace(/;/g, ',')));
  cands.push(outside(norm, s => s.replace(/,\s*\)/g, ')')));
  cands.push(norm.replace(/^==+/, '='));
  cands.push(outside(norm, s => s.replace(/([+\-*/^&=<>]|<>|<=|>=)\s*$/, '')));
  { const opens = (norm.match(/\(/g) || []).length, closes = (norm.match(/\)/g) || []).length; if (opens > closes) cands.push(norm + ')'.repeat(opens - closes)); if (closes > opens) cands.push(norm.replace(/\)+$/, m => m.slice(0, m.length - (closes - opens)))); }
  cands.push(outside(norm, s => s.replace(/([*/^&])\1+/g, '$1')));
  for (const c of cands) { if (c !== norm && parses(c)) return { kind: 'fix', buf: norm, fixed: c }; }
  return { kind: 'bad', buf: norm };
}

/** Upper-case references and function names outside string literals. */
export function normalizeFormula(str) {
  const s = String(str);
  const parts = s.split(/("(?:[^"]|"")*")/);
  return parts.map((seg, k) => k % 2 ? seg : seg
    .replace(/(\$?[A-Za-z]{1,3}\$?)0*(\d+)(?![A-Za-z0-9_.])/g, (m, a, r) => (a + r).toUpperCase())
    .replace(/[A-Za-z_][A-Za-z0-9_.]*(?=\s*\()/g, m => m.toUpperCase())
    .replace(/\b(true|false)\b/gi, m => m.toUpperCase())).join('');
}

/**
 * Rewrite references after rows (axis 'r') or columns (axis 'c') are inserted (delta > 0) or
 * deleted (delta < 0) at index `at`. Excel semantics: a reference inside a deleted band becomes
 * #REF!; a range whose corner falls in the band contracts to the seam; a range wholly deleted
 * becomes #REF!. Token-based, so string literals are untouched.
 */
export function adjustFormulaStructure(f, axis, at, delta) {
  const src = String(f);
  const eq = src.trimStart()[0] === '=';
  const body = eq ? src.slice(src.indexOf('=') + 1) : src;
  let toks; try { toks = tokenize(body); } catch (e) { return src; }
  const parts = ref => { const m = /^(\$?)([A-Z]{1,3})(\$?)(\d+)$/.exec(ref); return { ac: m[1], c: colIndex(m[2]), ar: m[3], r: +m[4] }; };
  const adj = n => {   // null = fell inside the deleted band
    if (delta > 0) return n >= at ? n + delta : n;
    const cnt = -delta;
    if (n >= at && n < at + cnt) return null;
    return n >= at + cnt ? n - cnt : n;
  };
  const build = p => p.ac + colLetter(p.c) + p.ar + p.r;
  let out = '', last = 0;
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (t.t !== 'ref') continue;
    const n1 = toks[i + 1], n2 = toks[i + 2];
    let rep, end;
    if (n1 && n1.t === 'op' && n1.v === ':' && n2 && n2.t === 'ref') {
      const a = parts(t.v), b = parts(n2.v);
      const lo = axis === 'r' ? Math.min(a.r, b.r) : Math.min(a.c, b.c), hi = axis === 'r' ? Math.max(a.r, b.r) : Math.max(a.c, b.c);
      let nlo = adj(lo), nhi = adj(hi);
      if (delta < 0) { if (nlo === null) nlo = at; if (nhi === null) nhi = at - 1; }
      if (nhi < nlo) rep = '#REF!';
      else {
        if (axis === 'r') { if (a.r <= b.r) { a.r = nlo; b.r = nhi; } else { a.r = nhi; b.r = nlo; } }
        else { if (a.c <= b.c) { a.c = nlo; b.c = nhi; } else { a.c = nhi; b.c = nlo; } }
        rep = build(a) + ':' + build(b);
      }
      end = n2.end; i += 2;
    } else {
      const a = parts(t.v);
      const n = adj(axis === 'r' ? a.r : a.c);
      if (n === null) rep = '#REF!';
      else { if (axis === 'r') a.r = n; else a.c = n; rep = build(a); }
      end = t.end;
    }
    out += body.slice(last, t.pos) + rep; last = end;
  }
  out += body.slice(last);
  return (eq ? '=' : '') + out;
}
