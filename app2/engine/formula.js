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
//     negation binds tighter than ^ so =-2^2 is 4); unary + is a no-op (=+E1 on text is the text)
//   · TRUE/FALSE are booleans (display TRUE/FALSE); arithmetic reads them as 1/0
//   · a blank cell reads 0 in arithmetic, "" in text, FALSE in logic; =A1 on a blank cell is 0
//   · text in arithmetic: a numeric-looking string coerces ("5"+1 → 6), anything else is #VALUE!
//   · comparisons: numbers < text < booleans; text compares case-insensitively
//   · errors are values that propagate; IFERROR / IFNA catch them; #NAME? for unknown functions;
//     the IS* classifiers, COUNT/COUNTA, criteria ranges and lookup columns never propagate one
//   · aggregates ignore text/booleans inside ranges but coerce literal arguments (SUM("3") → 3)
//   · multi-letter columns (AA1) and whole-column/row ranges ($A:$A, 1:$1) are understood
//   · a text result longer than 32,767 characters is #VALUE! (Excel's cell limit)
//
// evalFormula throws only SyntaxError, and only for text Excel refuses at entry: bad syntax, too
// few / too many arguments, more than 8,192 characters, more than 64 nested function levels.
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

/** Excel's limits: cell text length, formula text length, nested function levels. */
const MAX_TEXT = 32767;
const MAX_FORMULA_LEN = 8192;
const MAX_FN_DEPTH = 64;
const MAX_DEPTH = 512;   // parentheses / unary nesting: far above anything typed, far below the call stack

/* ============================================================================
   TOKENIZER
   Tokens carry {t, v, pos, end} so the original text can be rebuilt (translateFormula) and
   references can be highlighted by position (the formula bar).
   ============================================================================ */
const RE_NUM = /^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/;
const RE_IDENT = /^[A-Za-z_][A-Za-z0-9_.]*/;
const RE_REF = /^\$?[A-Za-z]{1,3}\$?\d+$/;
const RE_ERR = /^#(?:NULL!|DIV\/0!|VALUE!|REF!|NAME\?|NUM!|N\/A)/i;   // error literals are case-insensitive, like everything else
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
    if (ch === "'" || ch === '$' || /[A-Za-z_]/.test(ch)) {
      // sheet-prefixed reference: Name!A1 or 'My Sheet'!A1 — the prefix and the ref are ONE token
      // (the whole span, so text rewriters replace it as a unit); the corner after ':' stays plain
      const sm = /^(?:'((?:[^']|'')+)'|([A-Za-z_][A-Za-z0-9_.]*))!/.exec(rest);
      if (sm) {
        const sheetName = sm[1] ? sm[1].replace(/''/g, "'") : sm[2];
        const tail = rest.slice(sm[0].length);
        const rm2 = /^\$?[A-Za-z]{1,3}\$?\d+/.exec(tail);
        if (!rm2 || !RE_REF.test(rm2[0])) throw new SyntaxError('bad reference after ' + sheetName + '!');
        const nx2 = tail[rm2[0].length];
        if (nx2 && /[A-Za-z0-9_.]/.test(nx2)) throw new SyntaxError('bad reference after ' + sheetName + '!');
        out.push({ t: 'ref', v: rm2[0].toUpperCase(), sheet: sheetName.toUpperCase(), sheetTxt: sm[0], pos: i, end: i + sm[0].length + rm2[0].length });
        i += sm[0].length + rm2[0].length; continue;
      }
      if (ch === "'") throw new SyntaxError('unexpected character ' + ch);
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
        // an absolute corner of a whole-column / whole-row range: $A:$A, A:$A, $1:$1, 1:$1
        const prevColon = out.length > 0 && out[out.length - 1].t === 'op' && out[out.length - 1].v === ':';
        const cm = /^\$?[A-Za-z]{1,3}(?=\s*:)/.exec(rest) || (prevColon ? /^\$[A-Za-z]{1,3}(?![A-Za-z0-9_.$])/.exec(rest) : null);
        if (cm) { out.push({ t: 'name', v: cm[0].toUpperCase(), pos: i, end: i + cm[0].length }); i += cm[0].length; continue; }
        const rm = /^\$(\d+)(?![A-Za-z0-9_.$])/.exec(rest);
        if (rm && (prevColon || /^\s*:/.test(rest.slice(rm[0].length)))) { out.push({ t: 'num', v: parseInt(rm[1], 10), abs: true, pos: i, end: i + rm[0].length }); i += rm[0].length; continue; }
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
/**
 * Argument counts Excel enforces at entry ("You've entered too few / too many arguments for this
 * function"). Slots count, empty or not, so =SUM(,) and =ROUND(1,) are accepted as Excel does.
 * Checked by the parser, so parses()/autocorrectFormula and evalFormula agree.
 */
const MIN_ARGS = { SUM: 1, MAX: 1, MIN: 1, ABS: 1, SIGN: 1, INT: 1, TRUNC: 1, AVERAGE: 1, PRODUCT: 1, MEDIAN: 1, COUNT: 1, COUNTA: 1, COUNTBLANK: 1, ROUND: 2, ROUNDUP: 2, ROUNDDOWN: 2, MOD: 2, SQRT: 1, POWER: 2, EXP: 1, LN: 1, LOG: 1, LOG10: 1,
  LARGE: 2, SMALL: 2, RANK: 2, 'RANK.EQ': 2, SUMPRODUCT: 1, SUMIF: 2, COUNTIF: 2, AVERAGEIF: 2, SUMIFS: 3, COUNTIFS: 2, AVERAGEIFS: 3, MAXIFS: 3, MINIFS: 3, AND: 1, OR: 1, XOR: 1, NOT: 1,
  IF: 2, IFS: 2, IFERROR: 2, IFNA: 2, CHOOSE: 2, SWITCH: 3, ISERROR: 1, ISERR: 1, ISNA: 1,
  ISBLANK: 1, ISNUMBER: 1, ISTEXT: 1, ISNONTEXT: 1, ISLOGICAL: 1, MATCH: 2, INDEX: 2, VLOOKUP: 3, HLOOKUP: 3, XLOOKUP: 3, OFFSET: 3, ROWS: 1, COLUMNS: 1, LEN: 1, LEFT: 1, RIGHT: 1, MID: 3,
  FIND: 2, SEARCH: 2, TRIM: 1, UPPER: 1, LOWER: 1, PROPER: 1, CONCATENATE: 1, CONCAT: 1, TEXTJOIN: 3, SUBSTITUTE: 3, REPT: 2, EXACT: 2, VALUE: 1, TEXT: 2, T: 1, N: 1,
  DATE: 3, YEAR: 1, MONTH: 1, DAY: 1, WEEKDAY: 1, DAYS: 2, EDATE: 2, EOMONTH: 2, YEARFRAC: 2, NPV: 2, IRR: 1, PMT: 3, PV: 3, FV: 3 };
const MAX_ARGS = { ABS: 1, SIGN: 1, INT: 1, TRUNC: 2, COUNTBLANK: 1, ROUND: 2, ROUNDUP: 2, ROUNDDOWN: 2, MOD: 2, SQRT: 1, POWER: 2, EXP: 1, LN: 1, LOG: 2, LOG10: 1, PI: 0, RAND: 0,
  LARGE: 2, SMALL: 2, RANK: 3, 'RANK.EQ': 3, SUMIF: 3, COUNTIF: 2, AVERAGEIF: 3, NOT: 1, TRUE: 0, FALSE: 0, NA: 0,
  IF: 3, IFERROR: 2, IFNA: 2, ISERROR: 1, ISERR: 1, ISNA: 1, ISBLANK: 1, ISNUMBER: 1, ISTEXT: 1, ISNONTEXT: 1, ISLOGICAL: 1,
  MATCH: 3, INDEX: 4, VLOOKUP: 4, HLOOKUP: 4, XLOOKUP: 6, OFFSET: 5, ROWS: 1, COLUMNS: 1, ROW: 1, COLUMN: 1, LEN: 1, LEFT: 2, RIGHT: 2, MID: 3,
  FIND: 3, SEARCH: 3, TRIM: 1, UPPER: 1, LOWER: 1, PROPER: 1, SUBSTITUTE: 4, REPT: 2, EXACT: 2, VALUE: 1, TEXT: 2, T: 1, N: 1,
  TODAY: 0, DATE: 3, YEAR: 1, MONTH: 1, DAY: 1, WEEKDAY: 2, DAYS: 2, EDATE: 2, EOMONTH: 2, YEARFRAC: 3, IRR: 2, PMT: 5, PV: 5, FV: 5 };
const BP = { '=': 1, '<>': 1, '<': 1, '<=': 1, '>': 1, '>=': 1, '&': 2, '+': 3, '-': 3, '*': 4, '/': 4, '^': 5 };
const BP_UNARY = 6, BP_PCT = 7;

export function parseFormula(src) {
  let s = String(src).trim();
  if (s[0] === '=') s = s.slice(1);
  if (s.length > MAX_FORMULA_LEN) throw new SyntaxError('formula too long');
  const toks = tokenize(s);
  let p = 0, depth = 0, fnDepth = 0;
  const peek = () => toks[p];
  const next = () => toks[p++];
  const expect = (t) => { const tk = next(); if (!tk || tk.t !== t) throw new SyntaxError('expected ' + t); return tk; };
  const checkArity = (name, args) => {
    if (MIN_ARGS[name] !== undefined && args.length < MIN_ARGS[name]) throw new SyntaxError('too few arguments for ' + name);
    if (MAX_ARGS[name] !== undefined && args.length > MAX_ARGS[name]) throw new SyntaxError('too many arguments for ' + name);
  };

  function primary() {
    if (++depth > MAX_DEPTH) throw new SyntaxError('too many nested levels');
    try { return primaryInner(); } finally { depth--; }
  }
  function primaryInner() {
    const tk = next();
    if (!tk) throw new SyntaxError('unexpected end');
    switch (tk.t) {
      case 'num': {
        // whole-row range: 1:1, $1:$1
        const c = peek();
        if (c && c.t === 'op' && c.v === ':' && toks[p + 1] && toks[p + 1].t === 'num' && Number.isInteger(tk.v) && Number.isInteger(toks[p + 1].v)) {
          p += 2; return { k: 'rowrange', a: tk.v, b: toks[p - 1].v };
        }
        if (tk.abs) throw new SyntaxError('unexpected $');
        return { k: 'num', v: tk.v };
      }
      case 'str': return { k: 'str', v: tk.v };
      case 'err': return { k: 'err', v: tk.v };
      case 'ref': {
        const c = peek();
        if (c && c.t === 'op' && c.v === ':') {
          const d = toks[p + 1];
          if (d && d.t === 'ref' && !d.sheet) { p += 2; return tk.sheet ? { k: 'range', a: tk.v, b: d.v, sheet: tk.sheet } : { k: 'range', a: tk.v, b: d.v }; }
          throw new SyntaxError('bad range');
        }
        return tk.sheet ? { k: 'ref', ref: tk.v, sheet: tk.sheet } : { k: 'ref', ref: tk.v };
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
        if (++fnDepth > MAX_FN_DEPTH) throw new SyntaxError('too many nested levels');
        expect('lp');
        const args = [];
        if (peek() && peek().t === 'rp') next();
        else for (;;) {
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
        fnDepth--;
        checkArity(tk.v, args);
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
  constructor(r1, c1, r2, c2, sheet) { this.r1 = r1; this.c1 = c1; this.r2 = r2; this.c2 = c2; if (sheet) this.sheet = sheet; }
  get rows() { return this.r2 - this.r1 + 1; }
  get cols() { return this.c2 - this.c1 + 1; }
  get size() { return this.rows * this.cols; }
  pfx(k) { return this.sheet ? this.sheet + '!' + k : k; }
  cell(i) { const r = this.r1 + Math.floor(i / this.cols), c = this.c1 + (i % this.cols); return this.pfx(refKey(r, c)); }
  at(r, c) { return this.pfx(refKey(this.r1 + r, this.c1 + c)); }
  keys() { const out = []; for (let r = this.r1; r <= this.r2; r++) for (let c = this.c1; c <= this.c2; c++) out.push(this.pfx(refKey(r, c))); return out; }
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

/* ---- wildcards ("a*", "?ear", "~*") — an iterative glob, never a backtracking RegExp -------- */
/** Compile a criteria pattern: '*' any run, '?' one char, '~x' the literal x. Case-insensitive. */
function compileGlob(pat) {
  const toks = [];
  for (let i = 0; i < pat.length; i++) {
    const ch = pat[i];
    if (ch === '~' && i + 1 < pat.length) toks.push({ lit: pat[++i].toLowerCase() });
    else if (ch === '*') { if (!toks.length || !toks[toks.length - 1].star) toks.push({ star: true }); }   // runs of * collapse
    else if (ch === '?') toks.push({ any: true });
    else toks.push({ lit: ch.toLowerCase() });
  }
  return toks;
}
/** Two-pointer glob match: O(text × pattern) worst case, so "*a*a*a…" can never hang the page. */
function globTest(toks, str) {
  const s = str.toLowerCase();
  let ti = 0, si = 0, star = -1, mark = 0;
  while (si < s.length) {
    const t = toks[ti];
    if (t && (t.any || t.lit === s[si])) { ti++; si++; }
    else if (t && t.star) { star = ti; mark = si; ti++; }
    else if (star >= 0) { ti = star + 1; si = ++mark; }
    else return false;
  }
  while (ti < toks.length && toks[ti].star) ti++;
  return ti === toks.length;
}

/* ============================================================================
   EVALUATOR
   ============================================================================ */
export function evalFormula(expr, ctx = {}) {
  const rawIn = ctx.raw || (() => null);
  // a key of the form NAME!B3 comes from a sheet-prefixed reference: ctx.sheetRaw resolves it
  // against the workbook; without a resolver a cross-sheet read is #REF! (as an error VALUE,
  // so the reading formula shows #REF! rather than throwing out of the evaluator)
  const raw = k => {
    const b = k.indexOf('!');
    if (b < 0) return rawIn(k);
    return ctx.sheetRaw ? ctx.sheetRaw(k.slice(0, b), k.slice(b + 1)) : '#REF!';
  };
  const ROWS = ctx.rows || 20, COLS = ctx.cols || 10;
  const ast = parseFormula(expr);   // SyntaxError propagates: the commit gate decides what to do

  /* ---- value helpers -------------------------------------------------------- */
  const cellVal = key => { const v = raw(key); if (v === undefined) return null; if (isErrVal(v)) throw err(v); return v; };
  const deref = v => {
    if (v === undefined) return null;   // an omitted argument slot reads as a blank
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
  const capText = s => { if (s.length > MAX_TEXT) throw err('#VALUE!'); return s; };
  const argRange = v => { if (isRange(v)) return v; throw err('#VALUE!'); };
  const rangeOf = (a, b, sheet) => {
    const A = refParts(a), B = refParts(b);
    return new Range(Math.min(A.r, B.r), Math.min(A.c, B.c), Math.max(A.r, B.r), Math.max(A.c, B.c), sheet);
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
    let c;
    if (typeof v === 'string') {
      const m = /^(<>|<=|>=|=|<|>)(.*)$/s.exec(v);
      c = m ? { op: m[1], val: parseCritVal(m[2]) } : { op: '=', val: parseCritVal(v) };
    } else c = { op: '=', val: v === null ? 0 : v };   // an empty criteria cell counts as 0, not as ""
    if (typeof c.val === 'string' && c.val !== '') c.glob = compileGlob(c.val);   // compiled once, tested per cell
    return c;
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
  /** A criteria-range cell: read raw, so an error cell is a value to match ("#N/A") or skip, never a propagation. */
  const critVal = key => { const v = raw(key); return v === undefined ? null : v; };
  function matches(cell, crit) {
    const { op, val } = crit;
    if (typeof val === 'string' && isErrVal(val)) return op === '=' ? cell === val : op === '<>' ? cell !== val : false;
    if (typeof cell === 'string' && isErrVal(cell)) return op === '<>';   // an error cell matches only "<>…" (and its own code, above)
    if (op === '=' || op === '<>') {
      let eq;
      if (val === '') eq = (cell === null || cell === '');
      else if (typeof val === 'number') eq = (typeof cell === 'number' && numeq(cell, val)) || (typeof cell === 'string' && textToNumber(cell) !== null && numeq(textToNumber(cell), val));
      else if (typeof val === 'boolean') eq = cell === val;
      else eq = typeof cell === 'string' && globTest(crit.glob, cell);
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
  const evArgs = (node) => node.args.map(a => a === null ? undefined : ev(a));   // undefined = omitted slot (the function's default applies)
  const evArg = a => (a === null || a === undefined) ? null : ev(a);              // for the lazy forms: an omitted slot is a blank (0 / "" / FALSE)
  const has = (args, i) => args.length > i && args[i] !== undefined;

  /* ---- rounding on the 15-digit decimal representation (Excel's, not IEEE's) ---- */
  // toPrecision(15) and String() may themselves produce exponent form (|x| ≥ 1e15 or < 1e-6, ≥ 1e21),
  // so the exponent is folded into the decimal shift instead of appending a second 'e'.
  const splitExp = s => { const [m, e] = String(s).split('e'); return [m, e ? parseInt(e, 10) : 0]; };
  function shift(x, d) { const [m, e] = splitExp(Math.abs(x).toPrecision(15)); return Number(m + 'e' + (e + d)); }
  function unshift(m, d) { const [mm, e] = splitExp(m); return Number(mm + 'e' + (e - d)); }
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
  const SKIP = Symbol('error-cell');   // an error in a lookup column is stepped over, never propagated (only the returned cell's error is)
  const lookVal = key => { const v = raw(key); if (v === undefined) return null; return isErrVal(v) ? SKIP : v; };
  function lookupIndex(key, vals, mode) {
    // mode 0 exact (wildcards on text) · 1 largest ≤ key assuming ascending · -1 smallest ≥ key assuming descending
    key = deref(key);
    if (key === null) key = 0;
    const same = v => typeof v === typeof key;
    if (mode === 0) {
      if (typeof key === 'string') { const g = /[*?]/.test(key) ? compileGlob(key) : null;
        for (let i = 0; i < vals.length; i++) { const v = vals[i]; if (typeof v !== 'string') continue; if (g ? globTest(g, v) : cmpText(v, key) === 0) return i; } return -1; }
      for (let i = 0; i < vals.length; i++) { const v = vals[i]; if (!same(v)) continue; if (typeof v === 'number' ? numeq(v, key) : v === key) return i; }
      return -1;
    }
    // Excel's approximate modes are a binary search: it assumes sorted data, steps left over cells of
    // another type, and on unsorted data returns whatever its probes land on (never #N/A just because
    // the first cell is on the wrong side of the key). Moving right on equality keeps the last duplicate.
    let lo = 0, hi = vals.length - 1, hit = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      let p = mid; while (p >= lo && !same(vals[p])) p--;
      if (p < lo) { lo = mid + 1; continue; }
      if (mode === 1 ? compare('<=', vals[p], key) : compare('>=', vals[p], key)) { hit = p; lo = mid + 1; } else hi = p - 1;
    }
    return hit;
  }
  const colVals = (rg, c) => { const out = []; for (let r = 0; r < rg.rows; r++) out.push(lookVal(rg.at(r, c))); return out; };
  const rowVals = (rg, r) => { const out = []; for (let c = 0; c < rg.cols; c++) out.push(lookVal(rg.at(r, c))); return out; };
  const flatVals = rg => rg.keys().map(lookVal);

  /* ---- TEXT(value, format) — Excel number-format codes ------------------------ */
  // Sections (positive;negative;zero;text), digit placeholders 0 # ?, thousands and scaling commas,
  // percent, scientific E+00, quoted / escaped literals, dates (yyyy mmm dddd …), times (h:mm:ss
  // AM/PM, [h]), General and @. An unquoted letter that is not a format code is #VALUE!.
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const pad2 = n => String(n).padStart(2, '0');
  function fmtSections(f) {   // split on unquoted ';' (backslash escapes honoured)
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
  function fmtTokens(sec) {
    const toks = [];
    for (let i = 0; i < sec.length; i++) {
      const ch = sec[i], rest = sec.slice(i);
      let m;
      if (ch === '"') { const j = sec.indexOf('"', i + 1); const end = j < 0 ? sec.length : j; toks.push({ t: 'lit', v: sec.slice(i + 1, end) }); i = end; continue; }
      if (ch === '\\') { toks.push({ t: 'lit', v: sec[i + 1] || '' }); i++; continue; }
      if (ch === '_') { toks.push({ t: 'lit', v: ' ' }); i++; continue; }        // _x: the width of x → a space
      if (ch === '*') { i++; continue; }                                           // *x: fill the cell → nothing in TEXT
      if (ch === '[') {
        const j = sec.indexOf(']', i); if (j < 0) throw err('#VALUE!');
        const inner = sec.slice(i + 1, j);
        if (/^(?:h+|m+|s+)$/i.test(inner)) toks.push({ t: 'elapsed', v: inner[0].toLowerCase() });
        else if (!/^(?:black|blue|cyan|green|magenta|red|white|yellow|color ?\d{1,2})$/i.test(inner)) throw err('#VALUE!');   // colours are ignored; conditions are not supported
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
      if (/[A-Za-z]/.test(ch)) throw err('#VALUE!');   // a letter that is not a format code — Excel needs it quoted
      toks.push({ t: 'lit', v: ch });                     // $ - + / ( ) : ! ^ & ' ~ { } < > = space …
    }
    return toks;
  }
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
    if (fracCount > 30) throw err('#VALUE!');   // Excel formats show at most 30 decimal places
    // a comma between integer placeholders groups thousands; commas after the last one scale by 1000 each
    let grouped = false, scale = 0, seenPh = false;
    for (const t of intToks) { if (t.t === 'ph') { seenPh = true; if (scale) grouped = true; scale = 0; } else if (t.t === 'comma' && seenPh) scale++; }
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
  function textFormat(v, fmt) {
    v = deref(v);
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
    const secs = fmtSections(String(fmt));
    if (typeof v === 'string' && textToNumber(v) === null) {
      // text passes through unchanged, unless a fourth (text) section or a lone "@" section formats it
      const sec = secs.length >= 4 ? secs[3] : (secs.length === 1 && secs[0].includes('@')) ? secs[0] : null;
      return sec === null ? v : renderLits(fmtTokens(sec), v);
    }
    let n = toNum(v), sec, neg = false; const negative = n < 0;
    if (n < 0 && secs.length >= 2) { sec = secs[1]; n = -n; }             // the negative section supplies its own sign
    else if (n === 0 && secs.length >= 3) sec = secs[2];
    else { sec = secs[0]; if (n < 0) { neg = true; n = -n; } }
    const toks = fmtTokens(sec);
    const kinds = new Set(toks.map(t => t.t));
    let body;
    if (kinds.has('general') || kinds.has('at')) body = renderLits(toks, numToText(n));
    else if (kinds.has('date') || kinds.has('elapsed') || kinds.has('ampm')) { if (kinds.has('ph') || kinds.has('exp') || negative) throw err('#VALUE!'); body = renderDate(toks, n); }   // no negative dates
    else if (kinds.has('ph') || kinds.has('exp')) body = renderNumber(toks, n);
    else body = renderLits(toks, '');   // a section with no placeholders shows its literals only ("-" for zero)
    return (neg ? '-' : '') + body;
  }

  /* ---- the function table --------------------------------------------------------- */
  function callFn(name, node) {
    const slots = node.args;   // null = omitted slot; arity was checked by the parser
    // lazy forms first: they choose which arguments to evaluate, or classify an error instead of propagating it
    switch (name) {
      case 'IF': {
        const c = toBool(evArg(slots[0]));
        const pick = c ? slots[1] : slots[2];
        if (pick === undefined) return false;   // no value_if_false → FALSE
        return evArg(pick);                      // an omitted slot reads as 0
      }
      case 'IFS': {
        if (slots.length % 2) throw err('#VALUE!');
        for (let i = 0; i < slots.length; i += 2) { if (toBool(evArg(slots[i]))) return evArg(slots[i + 1]); }
        throw err('#N/A');
      }
      case 'IFERROR': case 'IFNA': {
        let v;
        try { v = deref(evArg(slots[0])); }
        catch (e) { if (!(e instanceof FxError)) throw e; if (name === 'IFNA' && e.code !== '#N/A') throw e; return evArg(slots[1]); }
        if (typeof v === 'number' && !isFinite(v)) return evArg(slots[1]);
        return v;
      }
      case 'CHOOSE': {
        const idx = toInt(evArg(slots[0]));
        if (idx < 1 || idx >= slots.length) throw err('#VALUE!');
        return evArg(slots[idx]);
      }
      case 'SWITCH': {
        const x = deref(evArg(slots[0]));
        const n = slots.length;
        for (let i = 1; i + 1 < n; i += 2) { if (compare('=', x, evArg(slots[i]))) return evArg(slots[i + 1]); }
        if ((n - 1) % 2 === 1) return evArg(slots[n - 1]);
        throw err('#N/A');
      }
      case 'ISERROR': case 'ISERR': case 'ISNA': {
        try { deref(evArg(slots[0])); return false; }
        catch (e) { if (!(e instanceof FxError)) throw e; if (name === 'ISERROR') return true; if (name === 'ISNA') return e.code === '#N/A'; return e.code !== '#N/A'; }
      }
      case 'ISBLANK': case 'ISNUMBER': case 'ISTEXT': case 'ISNONTEXT': case 'ISLOGICAL': {
        // the argument is classified, so an error inside it (ISNUMBER(MATCH(…)), ISNUMBER(SEARCH(…))) is FALSE, not a propagation
        let v;
        try { v = evArg(slots[0]); if (name !== 'ISBLANK') v = deref(v); }
        catch (e) { if (!(e instanceof FxError)) throw e; return name === 'ISNONTEXT'; }
        if (name === 'ISBLANK') { if (isRange(v) && v.size === 1) { const x = raw(v.cell(0)); return x === null || x === undefined; } return v === null; }
        if (name === 'ISNUMBER') return typeof v === 'number';
        if (name === 'ISTEXT') return typeof v === 'string';
        if (name === 'ISNONTEXT') return typeof v !== 'string';
        return typeof v === 'boolean';
      }
      case 'ROW': case 'COLUMN': {
        if (!slots.length || slots[0] === null) { if (!ctx.cell) throw err('#VALUE!'); return name === 'ROW' ? ctx.cell.r : ctx.cell.c; }
        const v = ev(slots[0]); if (!isRange(v)) throw err('#VALUE!'); return name === 'ROW' ? v.r1 : v.c1;
      }
    }
    if (name === 'COUNT' || name === 'COUNTA') {
      // errors in the argument list are counted (COUNTA) or ignored (COUNT), never propagated
      const vals = slots.map(a => { if (a === null) return undefined; try { return ev(a); } catch (e) { if (e instanceof FxError) return { __err: e.code }; throw e; } });
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
      case 'LOG': { const x = toNum(args[0]), b = has(args, 1) ? toNum(args[1]) : 10; if (x <= 0 || b <= 0 || b === 1) throw err('#NUM!');
        // the exact-library bases keep LOG(1000) at exactly 3, as Excel and LOG10 do (ln/ln gives 2.9999999999999996)
        if (b === 10) return Math.log10(x); if (b === 2) return Math.log2(x); if (b === Math.E) return Math.log(x); return Math.log(x) / Math.log(b); }
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
        for (let i = 0; i < rg.size; i++) { const v = critVal(rg.cell(i)); if (!matches(v, crit)) continue; k++;
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
        for (let i = 0; i < L; i++) { if (pairs.every(p => matches(critVal(p.rg.cell(i)), p.crit))) { if (isCount) hits.push(1); else { const x = cellVal(sumRg.cell(i)); if (typeof x === 'number') hits.push(x); } } }
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
      case 'XLOOKUP': {
        // match_mode: 0 exact · -1 exact or next smaller · 1 exact or next larger · 2 wildcard — none needs sorted data.
        // search_mode: 1 first-to-last · -1 last-to-first (2 / -2, the binary searches, give the same answers on the sorted data they require).
        const look = argRange(args[1]), ret = argRange(args[2]);
        const mode = has(args, 4) ? toInt(args[4]) : 0, smode = has(args, 5) ? toInt(args[5]) : 1;
        if (![0, 1, -1, 2].includes(mode) || ![1, -1, 2, -2].includes(smode)) throw err('#VALUE!');
        const vert = look.cols === 1;
        if ((look.rows > 1 && look.cols > 1) || (vert ? ret.rows !== look.rows : ret.cols !== look.cols)) throw err('#VALUE!');
        const vals = flatVals(look);
        let key = deref(args[0]); if (key === null) key = 0;
        const same = v => typeof v === typeof key;
        const eq = v => same(v) && (typeof v === 'number' ? numeq(v, key) : typeof v === 'string' ? cmpText(v, key) === 0 : v === key);
        const order = vals.map((_, j) => j); if (smode < 0) order.reverse();
        let i = -1;
        if (mode === 2 && typeof key === 'string') { const g = compileGlob(key); i = order.find(j => typeof vals[j] === 'string' && globTest(g, vals[j])) ?? -1; }
        else {
          i = order.find(j => eq(vals[j])) ?? -1;
          if (i < 0 && mode !== 0) {
            // the closest candidate on the wanted side; strict comparisons keep the first-encountered row on ties
            for (const j of order) { const v = vals[j]; if (!same(v)) continue;
              if (mode === 1 ? compare('>', v, key) && (i < 0 || compare('<', v, vals[i])) : compare('<', v, key) && (i < 0 || compare('>', v, vals[i]))) i = j; }
          }
        }
        if (i < 0) { if (has(args, 3)) return args[3]; throw err('#N/A'); }
        const v = cellVal(vert ? ret.at(i, 0) : ret.at(0, i)); return v === null ? 0 : v; }
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
        let p = -1;
        if (name === 'FIND') p = hay.indexOf(needle, st - 1);
        else if (/[*?~]/.test(needle)) { const g = compileGlob(needle + '*'); for (let i = st - 1; i <= hay.length; i++) if (globTest(g, hay.slice(i))) { p = i; break; } }
        else { p = hay.toLowerCase().indexOf(needle.toLowerCase(), st - 1); }
        if (p < 0) throw err('#VALUE!'); return p + 1; }
      case 'TRIM': return toText(args[0]).replace(/ +/g, ' ').replace(/^ | $/g, '');
      case 'UPPER': return toText(args[0]).toUpperCase();
      case 'LOWER': return toText(args[0]).toLowerCase();
      case 'PROPER': return toText(args[0]).toLowerCase().replace(/(^|[^A-Za-z])([a-z])/g, (m, a, b) => a + b.toUpperCase());
      case 'CONCATENATE': case 'CONCAT': { let s = ''; for (const v of args) { if (v === undefined) continue; if (isRange(v)) { if (name === 'CONCATENATE' && v.size > 1) throw err('#VALUE!'); for (const k of v.keys()) s = capText(s + toText(cellVal(k))); } else s = capText(s + toText(v)); } return s; }
      case 'TEXTJOIN': { const d = toText(args[0]); const skip = toBool(args[1]); const parts = [];
        for (const v of args.slice(2)) { if (v === undefined) continue; const vs = isRange(v) ? v.keys().map(k => toText(cellVal(k))) : [toText(v)]; for (const t of vs) if (!skip || t !== '') parts.push(t); }
        return capText(parts.join(d)); }
      case 'SUBSTITUTE': { const t = toText(args[0]), o = toText(args[1]), nw = toText(args[2]); if (o === '') return t;
        if (has(args, 3)) { const inst = toInt(args[3]); if (inst < 1) throw err('#VALUE!'); let idx = -1; for (let k = 0; k < inst; k++) { idx = t.indexOf(o, idx + 1); if (idx < 0) return t; } return capText(t.slice(0, idx) + nw + t.slice(idx + o.length)); }
        const cnt = t.split(o).length - 1; if (t.length + cnt * (nw.length - o.length) > MAX_TEXT) throw err('#VALUE!');   // never build an oversized string
        return t.split(o).join(nw); }
      case 'REPT': { const t = toText(args[0]); const k = toInt(args[1]); if (k < 0 || t.length * k > MAX_TEXT) throw err('#VALUE!'); return t.repeat(k); }
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
      case 'WEEKDAY': { const d = ymd(toNum(args[0])).wd; const t = has(args, 1) ? toInt(args[1]) : 1;
        // return_type: 1 and 17 start on Sunday, 2/3/11 on Monday, 12…16 on Tuesday…Saturday; 3 counts from 0; anything else is #NUM!
        const start = t === 1 ? 0 : (t === 2 || t === 3) ? 1 : (t >= 11 && t <= 17) ? (t - 10) % 7 : -1;
        if (start < 0) throw err('#NUM!'); const r = (d - start + 7) % 7; return t === 3 ? r : r + 1; }
      case 'DAYS': return Math.floor(toNum(args[0])) - Math.floor(toNum(args[1]));
      case 'EDATE': case 'EOMONTH': { const d = dateOf(toNum(args[0])); const y = d.getUTCFullYear(), m = d.getUTCMonth() + toInt(args[1]), dd = d.getUTCDate();
        if (name === 'EOMONTH') return serial(y, m + 2, 0);
        const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); return serial(y, m + 1, Math.min(dd, last)); }
      case 'YEARFRAC': { const a = dateOf(toNum(args[0])), b = dateOf(toNum(args[1])); const basis = has(args, 2) ? toInt(args[2]) : 0;
        if (basis < 0 || basis > 4) throw err('#NUM!');
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
        const [A, B] = a <= b ? [a, b] : [b, a]; let d1 = A.getUTCDate(), d2 = B.getUTCDate();
        const y1 = A.getUTCFullYear(), m1 = A.getUTCMonth() + 1, y2 = B.getUTCFullYear(), m2 = B.getUTCMonth() + 1;
        if (basis === 4) { if (d1 === 31) d1 = 30; if (d2 === 31) d2 = 30; }   // European 30/360: only a 31st clips, no February rule
        else {   // US (NASD) 30/360
          const isFebEnd = d => d.getUTCMonth() === 1 && d.getUTCDate() === new Date(Date.UTC(d.getUTCFullYear(), 2, 0)).getUTCDate();
          if (isFebEnd(A) && isFebEnd(B)) d2 = 30; if (isFebEnd(A)) d1 = 30; if (d2 === 31 && d1 >= 30) d2 = 30; if (d1 === 31) d1 = 30;
        }
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

  /* ---- operators ---------------------------------------------------------------- */
  function binop(op, a, b) {
    if (BP[op] === 1) return compare(op, a, b);
    if (op === '&') return capText(toText(a) + toText(b));
    const x = toNum(a), y = toNum(b);
    switch (op) {
      case '+': return checkNum(x + y);
      case '-': return checkNum(x - y);
      case '*': return checkNum(x * y);
      case '/': if (y === 0) throw err('#DIV/0!'); return checkNum(x / y);
      case '^': { if (x === 0 && y < 0) throw err('#DIV/0!'); if (x === 0 && y === 0) throw err('#NUM!'); const v = Math.pow(x, y); if (isNaN(v)) throw err('#NUM!'); return checkNum(v); }
    }
    throw new SyntaxError('operator');
  }

  /* ---- AST walker --------------------------------------------------------------- */
  function ev(node) {
    switch (node.k) {
      case 'num': return node.v;
      case 'str': return node.v;
      case 'bool': return node.v;
      case 'err': throw err(node.v);
      case 'name': throw err('#NAME?');
      case 'paren': return ev(node.x);
      case 'ref': { const p = refParts(node.ref); return new Range(p.r, p.c, p.r, p.c, node.sheet); }
      case 'range': return rangeOf(node.a, node.b, node.sheet);
      case 'colrange': { const a = colIndex(node.a), b = colIndex(node.b); return new Range(1, Math.min(a, b), ROWS, Math.max(a, b)); }
      case 'rowrange': return new Range(Math.min(node.a, node.b), 1, Math.max(node.a, node.b), COLS);
      case 'un': { const v = ev(node.x); if (node.op === '+') return v; return -toNum(v); }   // unary plus is a no-op in Excel: text stays text
      case 'pct': return toNum(ev(node.x)) / 100;
      case 'bin': {
        // a left-associative chain (=1+1+1+…, 4,096 terms in an 8,192-char formula) folds iteratively, never one recursion per term
        const ops = [], rights = [];
        let n = node; while (n.k === 'bin') { ops.push(n.op); rights.push(n.r); n = n.l; }
        let acc = ev(n);
        for (let i = ops.length - 1; i >= 0; i--) acc = binop(ops[i], acc, ev(rights[i]));
        return acc;
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
    if (typeof v === 'string' && v.length > MAX_TEXT) return '#VALUE!';
    return v;
  } catch (e) {
    if (e instanceof FxError) return e.code;
    if (e instanceof RangeError) throw new SyntaxError('formula too complex');   // the contract: nothing but SyntaxError escapes
    throw e;   // SyntaxError: the formula does not parse — the commit gate decides what to do
  }
}

/* ============================================================================
   FORMULA TEXT UTILITIES (all token-based — never regex over raw formula text)
   ============================================================================ */

/** True when text is a formula that parses. */
export function parses(expr) { try { parseFormula(expr); return true; } catch (e) { return false; } }

// whole-column / whole-row corners as the tokenizer emits them: name A / $A, integer num 1 / $1
const isColTok = t => !!t && t.t === 'name' && /^\$?[A-Z]{1,3}$/.test(t.v);
const isRowTok = t => !!t && t.t === 'num' && Number.isInteger(t.v);
const isColonTok = t => !!t && t.t === 'op' && t.v === ':';

/**
 * Every reference the formula reads, as {key} for cells and {range:{r1,c1,r2,c2}} for ranges,
 * with the token positions (relative to the text after '=') for highlighting. Whole-column and
 * whole-row references are bounded by opts.rows / opts.cols (the sheet size; defaults match
 * evalFormula's), so the dependency graph sees =SUM(A:A) in column A as the circle it is.
 */
export function formulaRefs(expr, opts = {}) {
  const ROWS = opts.rows || 20, COLS = opts.cols || 10;
  let s = String(expr).trim(); const off = s[0] === '=' ? 1 : 0; if (off) s = s.slice(1);
  let toks; try { toks = tokenize(s); } catch (e) { return []; }
  const out = [];
  const parts = ref => { const m = /^\$?([A-Z]{1,3})\$?(\d+)$/.exec(ref); return { c: colIndex(m[1]), r: +m[2] }; };
  const span = (t, n2, range) => ({ range, pos: t.pos + off, end: n2.end + off, text: s.slice(t.pos, n2.end) });
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    const n1 = toks[i + 1], n2 = toks[i + 2];
    if (isColonTok(n1)) {
      if (t.t === 'ref' && n2 && n2.t === 'ref' && !n2.sheet) {
        const a = parts(t.v), b = parts(n2.v);
        const rec = span(t, n2, { r1: Math.min(a.r, b.r), c1: Math.min(a.c, b.c), r2: Math.max(a.r, b.r), c2: Math.max(a.c, b.c) });
        if (t.sheet) rec.sheet = t.sheet;
        out.push(rec);
        i += 2; continue;
      }
      if (isColTok(t) && isColTok(n2)) {
        const a = colIndex(t.v.replace('$', '')), b = colIndex(n2.v.replace('$', ''));
        out.push(span(t, n2, { r1: 1, c1: Math.min(a, b), r2: ROWS, c2: Math.max(a, b) }));
        i += 2; continue;
      }
      if (isRowTok(t) && isRowTok(n2)) {
        out.push(span(t, n2, { r1: Math.min(t.v, n2.v), c1: 1, r2: Math.max(t.v, n2.v), c2: COLS }));
        i += 2; continue;
      }
    }
    if (t.t === 'ref') {
      const a = parts(t.v);
      const rec = { key: refKey(a.r, a.c), pos: t.pos + off, end: t.end + off, text: s.slice(t.pos, t.end) };
      if (t.sheet) rec.sheet = t.sheet;
      out.push(rec);
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
 * A reference pushed off the sheet becomes one #REF! token (a range, A:A or 1:1 included, is a
 * unit: either corner off the sheet makes the whole reference #REF!). Text outside references is
 * preserved exactly.
 */
export function translateFormula(f, dr, dc) {
  const src = String(f);
  const eq = src.trimStart()[0] === '=';
  const body = eq ? src.slice(src.indexOf('=') + 1) : src;
  let toks; try { toks = tokenize(body); } catch (e) { return src; }
  const shiftRef = ref => {   // null = off the sheet
    const m = /^(\$?)([A-Z]{1,3})(\$?)(\d+)$/.exec(ref);
    let c = colIndex(m[2]), r = +m[4];
    if (!m[1]) c += dc; if (!m[3]) r += dr;
    if (c < 1 || r < 1) return null;
    return m[1] + colLetter(c) + m[3] + r;
  };
  const shiftCol = t => { const abs = t.v[0] === '$'; const c = colIndex(t.v.replace('$', '')) + (abs ? 0 : dc); return c < 1 ? null : (abs ? '$' : '') + colLetter(c); };
  const shiftRow = t => { const abs = body[t.pos] === '$'; const r = t.v + (abs ? 0 : dr); return r < 1 ? null : (abs ? '$' : '') + r; };
  const pair = (a, b) => (a === null || b === null) ? '#REF!' : a + ':' + b;
  let out = '', last = 0;
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i], n1 = toks[i + 1], n2 = toks[i + 2];
    let rep = null, end = t.end;
    if (isColonTok(n1) && t.t === 'ref' && n2 && n2.t === 'ref') { rep = pair(shiftRef(t.v), shiftRef(n2.v)); if (t.sheetTxt && rep !== '#REF!') rep = t.sheetTxt + rep; end = n2.end; i += 2; }
    else if (isColonTok(n1) && isColTok(t) && isColTok(n2)) { rep = pair(shiftCol(t), shiftCol(n2)); end = n2.end; i += 2; }
    else if (isColonTok(n1) && isRowTok(t) && isRowTok(n2)) { rep = pair(shiftRow(t), shiftRow(n2)); end = n2.end; i += 2; }
    else if (t.t === 'ref') { rep = shiftRef(t.v); if (rep === null) rep = '#REF!'; else if (t.sheetTxt) rep = t.sheetTxt + rep; }
    if (rep !== null) { out += body.slice(last, t.pos) + rep; last = end; }
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

/** Upper-case references, function names, TRUE/FALSE and error literals outside string literals. */
export function normalizeFormula(str) {
  const s = String(str);
  const parts = s.split(/("(?:[^"]|"")*"|'(?:[^']|'')*')/);
  return parts.map((seg, k) => k % 2 ? seg : seg
    .replace(/(\$?[A-Za-z]{1,3}\$?)0*(\d+)(?![A-Za-z0-9_.])/g, (m, a, r) => (a + r).toUpperCase())
    .replace(/[A-Za-z_][A-Za-z0-9_.]*(?=\s*\()/g, m => m.toUpperCase())
    .replace(/\b(true|false)\b/gi, m => m.toUpperCase())
    .replace(/#(?:NULL!|DIV\/0!|VALUE!|REF!|NAME\?|NUM!|N\/A)/gi, m => m.toUpperCase())).join('');
}

/**
 * Rewrite references after rows (axis 'r') or columns (axis 'c') are inserted (delta > 0) or
 * deleted (delta < 0) at index `at`. Excel semantics: a reference inside a deleted band becomes
 * #REF!; a range whose corner falls in the band contracts to the seam; a range wholly deleted
 * becomes #REF!. Whole-column / whole-row references shift on their own axis and are untouched on
 * the other. Token-based, so string literals are untouched.
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
  const seam = (lo, hi) => {   // a range's new [lo, hi] on this axis, or null when it is wholly deleted
    let nlo = adj(lo), nhi = adj(hi);
    if (delta < 0) { if (nlo === null) nlo = at; if (nhi === null) nhi = at - 1; }
    return nhi < nlo ? null : [nlo, nhi];
  };
  const build = p => p.ac + colLetter(p.c) + p.ar + p.r;
  let out = '', last = 0;
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    const n1 = toks[i + 1], n2 = toks[i + 2];
    let rep, end;
    if (isColonTok(n1) && ((isColTok(t) && isColTok(n2)) || (isRowTok(t) && isRowTok(n2)))) {
      const col = isColTok(t);
      end = n2.end; i += 2;
      if ((axis === 'c') !== col) continue;   // a column edit leaves 1:1 alone, a row edit leaves A:A alone
      const val = tk => col ? colIndex(tk.v.replace('$', '')) : tk.v;
      const pre = tk => (col ? tk.v[0] === '$' : body[tk.pos] === '$') ? '$' : '';
      const txt = v => col ? colLetter(v) : String(v);
      const va = val(t), vb = val(n2);
      const s = seam(Math.min(va, vb), Math.max(va, vb));
      if (!s) rep = '#REF!';
      else { const [x, y] = va <= vb ? s : [s[1], s[0]]; rep = pre(t) + txt(x) + ':' + pre(n2) + txt(y); }
    } else if (t.t !== 'ref' || t.sheet) { if (t.sheet && isColonTok(n1) && n2 && n2.t === 'ref') i += 2; continue; }
    else if (isColonTok(n1) && n2 && n2.t === 'ref') {
      const a = parts(t.v), b = parts(n2.v);
      const s = axis === 'r' ? seam(Math.min(a.r, b.r), Math.max(a.r, b.r)) : seam(Math.min(a.c, b.c), Math.max(a.c, b.c));
      if (!s) rep = '#REF!';
      else {
        const [nlo, nhi] = s;
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
