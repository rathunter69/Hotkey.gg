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
import { formatValue, FormatError, numToText } from './numfmt.js';
export { numToText };

export const ERROR_CODES = ['#NULL!', '#DIV/0!', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#N/A', '#SPILL!', '#CALC!'];

export class FxError extends Error {
  // thrown and caught thousands of times in a recalc (IFERROR, lookups): no stack trace is captured
  constructor(code) { const lim = Error.stackTraceLimit; Error.stackTraceLimit = 0; super(code); Error.stackTraceLimit = lim; this.code = code; }
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
const RE_ERR = /^#(?:NULL!|DIV\/0!|VALUE!|REF!|NAME\?|NUM!|N\/A|SPILL!|CALC!)/i;   // error literals are case-insensitive, like everything else
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
    if (ch === "'" || ch === '$' || ch === '[' || /[A-Za-z_]/.test(ch)) {
      // sheet-prefixed reference: Name!A1 or 'My Sheet'!A1 — the prefix and the ref are ONE token
      // (the whole span, so text rewriters replace it as a unit); the corner after ':' stays plain
      // a 3D reference names a run of sheets, First:Last!B5 or 'Jan 1:Mar 1'!B5 (never A1:Sheet2!B5, a cell before the colon)
      let sm = /^([A-Za-z_][A-Za-z0-9_.]*:[A-Za-z_][A-Za-z0-9_.]*)!/.exec(rest);
      if (sm && /^\$?[A-Za-z]{1,3}\$?\d+:/.test(sm[1])) sm = null;
      if (sm) sm = [sm[0], undefined, sm[1]]; else sm = /^(?:'((?:[^']|'')+)'|(\[[^\]'!]+\][A-Za-z_][A-Za-z0-9_.]*|[A-Za-z_][A-Za-z0-9_.]*))!/.exec(rest);   // [Book.xlsx]Sheet!A1: another workbook (Edit Links)
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
      if (ch === "'" || ch === '[') throw new SyntaxError('unexpected character ' + ch);
      // reference ($A$1, a1), function name (SUM( ), or a bare name (TRUE, FALSE, A for A:A)
      const dm = /^\$?[A-Za-z]{1,3}\$?\d+/.exec(rest);
      const im = RE_IDENT.exec(rest);
      const after = t => { let k = i + t.length; while (s[k] === ' ') k++; return s[k]; };
      if (im && after(im[0]) === '(') { out.push({ t: 'fn', v: im[0].toUpperCase(), pos: i, end: i + im[0].length }); i += im[0].length; continue; }
      if (dm && (!im || dm[0].length >= im[0].length) && RE_REF.test(dm[0])) {
        // guard: "A1B" is not a ref followed by a name — require a non-identifier char after
        const nx = s[i + dm[0].length];
        if (!nx || !/[A-Za-z0-9_.]/.test(nx)) {
          // A1#: the spilled range of the dynamic-array formula in A1 (the # is part of the one token)
          const spill = nx === '#' && !/[A-Za-z0-9_.$]/.test(s[i + dm[0].length + 1] || '');
          out.push({ t: 'ref', v: dm[0].toUpperCase(), pos: i, end: i + dm[0].length + (spill ? 1 : 0), ...(spill ? { spill: true } : {}) }); i += dm[0].length + (spill ? 1 : 0); continue;
        }
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
  LARGE: 2, SMALL: 2, RANK: 2, 'RANK.EQ': 2, QUARTILE: 2, 'QUARTILE.INC': 2, PERCENTILE: 2, 'PERCENTILE.INC': 2, SUMPRODUCT: 1, SUMIF: 2, COUNTIF: 2, AVERAGEIF: 2, SUMIFS: 3, COUNTIFS: 2, AVERAGEIFS: 3, MAXIFS: 3, MINIFS: 3, AND: 1, OR: 1, XOR: 1, NOT: 1,
  IF: 2, IFS: 2, IFERROR: 2, IFNA: 2, CHOOSE: 2, SWITCH: 3, ISERROR: 1, ISERR: 1, ISNA: 1,
  ISBLANK: 1, ISNUMBER: 1, ISTEXT: 1, ISNONTEXT: 1, ISLOGICAL: 1, ISFORMULA: 1, HYPERLINK: 1, MATCH: 2, INDEX: 2, VLOOKUP: 3, HLOOKUP: 3, XLOOKUP: 3, OFFSET: 3, INDIRECT: 1, SUBTOTAL: 2, ROWS: 1, COLUMNS: 1, LEN: 1, LEFT: 1, RIGHT: 1, MID: 3,
  FIND: 2, SEARCH: 2, TRIM: 1, UPPER: 1, LOWER: 1, PROPER: 1, CONCATENATE: 1, CONCAT: 1, TEXTJOIN: 3, SUBSTITUTE: 3, REPT: 2, EXACT: 2, VALUE: 1, TEXT: 2, T: 1, N: 1,
  DATE: 3, YEAR: 1, MONTH: 1, DAY: 1, WEEKDAY: 1, DAYS: 2, EDATE: 2, EOMONTH: 2, YEARFRAC: 2, NPV: 2, IRR: 1, PMT: 3, PV: 3, FV: 3,
  REPLACE: 4, RRI: 3, QUARTILE: 2, 'QUARTILE.INC': 2, PERCENTILE: 2, 'PERCENTILE.INC': 2, ISFORMULA: 1, FILTER: 2, SORT: 1, UNIQUE: 1, SEQUENCE: 1, TRANSPOSE: 1, XMATCH: 2,
  'NETWORKDAYS.INTL': 2, DATEDIF: 3, RATE: 3, NPER: 3, ADDRESS: 2, GETPIVOTDATA: 2,
  CEILING: 2, FLOOR: 2, DATEVALUE: 1, NETWORKDAYS: 2, XNPV: 3, XIRR: 2, PPMT: 4, IPMT: 4 };
const MAX_ARGS = { ABS: 1, SIGN: 1, INT: 1, TRUNC: 2, COUNTBLANK: 1, ROUND: 2, ROUNDUP: 2, ROUNDDOWN: 2, MOD: 2, SQRT: 1, POWER: 2, EXP: 1, LN: 1, LOG: 2, LOG10: 1, PI: 0, RAND: 0,
  LARGE: 2, SMALL: 2, RANK: 3, 'RANK.EQ': 3, QUARTILE: 2, 'QUARTILE.INC': 2, PERCENTILE: 2, 'PERCENTILE.INC': 2, SUMIF: 3, COUNTIF: 2, AVERAGEIF: 3, NOT: 1, TRUE: 0, FALSE: 0, NA: 0,
  IF: 3, IFERROR: 2, IFNA: 2, ISERROR: 1, ISERR: 1, ISNA: 1, ISBLANK: 1, ISNUMBER: 1, ISTEXT: 1, ISNONTEXT: 1, ISLOGICAL: 1, ISFORMULA: 1, HYPERLINK: 2,
  MATCH: 3, INDEX: 4, VLOOKUP: 4, HLOOKUP: 4, XLOOKUP: 6, OFFSET: 5, INDIRECT: 2, ROWS: 1, COLUMNS: 1, ROW: 1, COLUMN: 1, LEN: 1, LEFT: 2, RIGHT: 2, MID: 3,
  FIND: 3, SEARCH: 3, TRIM: 1, UPPER: 1, LOWER: 1, PROPER: 1, SUBSTITUTE: 4, REPT: 2, EXACT: 2, VALUE: 1, TEXT: 2, T: 1, N: 1,
  TODAY: 0, DATE: 3, YEAR: 1, MONTH: 1, DAY: 1, WEEKDAY: 2, DAYS: 2, EDATE: 2, EOMONTH: 2, YEARFRAC: 3, IRR: 2, PMT: 5, PV: 5, FV: 5,
  REPLACE: 4, RRI: 3, QUARTILE: 2, 'QUARTILE.INC': 2, PERCENTILE: 2, 'PERCENTILE.INC': 2, ISFORMULA: 1, FILTER: 3, SORT: 4, UNIQUE: 3, SEQUENCE: 4, TRANSPOSE: 1, XMATCH: 4,
  'NETWORKDAYS.INTL': 4, DATEDIF: 3, RATE: 6, NPER: 5, ADDRESS: 5, GETPIVOTDATA: 254,
  CEILING: 2, FLOOR: 2, DATEVALUE: 1, NETWORKDAYS: 3, XNPV: 3, XIRR: 3, PPMT: 6, IPMT: 6 };
/**
 * The scalar functions Excel 365 lifts over a multi-cell argument, one call per cell, giving an
 * array: ABS(A1:A5) inside SUMPRODUCT, ROUND(B2:B9,0), LEN(A2:A9), TEXT(dates,"mmm"). The aggregates,
 * the lookups and the criteria functions take whole ranges and are not here.
 */
const LIFT = new Set(['ABS', 'SIGN', 'INT', 'TRUNC', 'ROUND', 'ROUNDUP', 'ROUNDDOWN', 'MOD', 'SQRT', 'POWER', 'EXP', 'LN', 'LOG', 'LOG10', 'NOT', 'LEN', 'LEFT', 'RIGHT', 'MID',
  'FIND', 'SEARCH', 'TRIM', 'UPPER', 'LOWER', 'PROPER', 'SUBSTITUTE', 'REPLACE', 'REPT', 'EXACT', 'VALUE', 'TEXT', 'T', 'N', 'DATE', 'YEAR', 'MONTH', 'DAY', 'WEEKDAY', 'DAYS',
  'EDATE', 'EOMONTH', 'YEARFRAC']);
/** The functions that take a 3D reference (Excel's list, as far as the engine computes them). */
const THREE_D = new Set(['SUM', 'AVERAGE', 'AVERAGEA', 'COUNT', 'COUNTA', 'MAX', 'MIN', 'PRODUCT']);
const is3D = n => !!n && (n.k === 'ref' || n.k === 'range') && typeof n.sheet === 'string' && n.sheet.includes(':');
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
          p += 2; return { k: 'rowrange', a: tk.v, b: toks[p - 1].v, absA: !!tk.abs, absB: !!toks[p - 1].abs };   // the $ flags, for an offset evaluation (conditional formatting)
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
        if (tk.spill) return { k: 'ref', ref: tk.v, spill: true };
        return tk.sheet ? { k: 'ref', ref: tk.v, sheet: tk.sheet } : { k: 'ref', ref: tk.v };
      }
      case 'name': {
        const nm = tk.v.replace(/^\$/, '');
        const c = peek();
        if (c && c.t === 'op' && c.v === ':' && /^[A-Z]{1,3}$/.test(nm)) {
          const d = toks[p + 1];
          if (d && d.t === 'name' && /^\$?[A-Z]{1,3}$/.test(d.v)) { p += 2; return { k: 'colrange', a: nm, b: d.v.replace(/^\$/, ''), absA: tk.v[0] === '$', absB: d.v[0] === '$' }; }
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
/**
 * An in-formula array (Excel 365's dynamic arrays): what (A1:A5="x")*(B1:B5), FILTER(), SORT(),
 * SEQUENCE() and a lifted scalar function over a range produce. `data` is row-major; an element is a
 * number | string | boolean | null | FxError (an error travels per element, as in Excel, and is
 * thrown when a scalar is wanted). At the top of a formula an Arr spills (evalFormula's ctx.onSpill).
 */
export class Arr {
  constructor(rows, cols, data) { this.rows = rows; this.cols = cols; this.data = data; }
  get size() { return this.rows * this.cols; }
  static of(rows2d) { const rows = rows2d.length, cols = rows ? rows2d[0].length : 0; return new Arr(rows, cols, [].concat(...rows2d)); }
  /** Row-major rows, error elements as their code strings (what the sheet writes into the spilled cells). */
  toRows() { const out = []; for (let r = 0; r < this.rows; r++) { const row = []; for (let c = 0; c < this.cols; c++) { const x = this.data[r * this.cols + c]; row.push(x instanceof FxError ? x.code : x); } out.push(row); } return out; }
}
export const isArr = v => v instanceof Arr;
/** A value that holds more than one cell: an Arr, or a Range of two or more cells. */
const isMulti = v => isArr(v) || (isRange(v) && v.size > 1);

const RE_NUMERIC_TEXT = /^\s*[-+]?\$?\s*(?:\d{1,3}(?:,\d{3})+|\d+)?(?:\.\d*)?(?:[eE][+-]?\d+)?\s*%?\s*$/;
const RE_PAREN_NEG = /^\s*\(\s*\$?\s*(?:\d{1,3}(?:,\d{3})+|\d+)?(?:\.\d*)?\s*\)\s*$/;

/** Excel's text→number coercion for arithmetic. Returns null when the text is not numeric. */
export function textToNumber(str) {
  const t = String(str);
  if (!/\d/.test(t)) return null;
  const fm = /^\s*([-+]?)(\d+)\s+(\d{1,3})\/(\d{1,3})\s*$/.exec(t);   // a typed fraction: "3 3/8" is 3.375 (a bare "3/8" is a date, as Excel reads it)
  if (fm && +fm[4] > 0) return (fm[1] === '-' ? -1 : 1) * (+fm[2] + +fm[3] / +fm[4]);
  if (RE_PAREN_NEG.test(t)) { const n = parseFloat(t.replace(/[\s()$,]/g, '')); return isNaN(n) ? null : -n; }
  if (!RE_NUMERIC_TEXT.test(t)) return null;
  let u = t.replace(/[\s$,]/g, ''), pct = false;
  if (u.endsWith('%')) { pct = true; u = u.slice(0, -1); }
  if (u === '' || u === '+' || u === '-' || u === '.') return null;
  const n = Number(u);
  if (!isFinite(n)) return null;
  return pct ? n / 100 : n;
}


/* ---- date and time text, as Excel (en-US) recognises it: 1/31/2026, 1/31/26, 1/2/3, 1/31 and 5-3 (this year), 1/2026 (the 1st), 2026-01-31, 2026/1/31, 31-Jan-26, 31 Jan 2026, Jan 31, 2026, Jan 31, Sept 5, Jan-32 (the year, when the day is impossible), 12:00, 12:00:30.5 PM, 100:00 (elapsed hours) and a date followed by a time ---- */
const MONTH_NAMES = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const RE_MDY = /^(\d{1,2})\/(\d{1,2})\/(\d{1,4})$/, RE_MD = /^(\d{1,2})[/-](\d{1,2})$/, RE_MY = /^(\d{1,2})[/-](\d{4})$/, RE_YMD = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/;
const RE_DMON = /^(\d{1,2})[- ]([a-z]{3,9})(?:[- ,]+(\d{2}|\d{4}))?$/i, RE_MOND = /^([a-z]{3,9})[- ]?(\d{1,2})(?:(?:,\s*|[- ])(\d{2}|\d{4}))?$/i, RE_MONY = /^([a-z]{3,9})[- ](\d{4})$/i;
const RE_TIME = /^(\d{1,4}):(\d{2})(?::(\d{2}(?:\.\d+)?))?(?:\s*([ap])\.?m?\.?)?$/i;   // up to 9999:59:59 typed elapsed, seconds with a fraction
const monthOf = name => { const n = name.toLowerCase(); if (n === 'sept') return 9; const i = MONTH_NAMES.findIndex(m => m.startsWith(n)); return i >= 0 && n.length >= 3 && (n.length === 3 || MONTH_NAMES[i] === n) ? i + 1 : 0; };
const yearOf = y => y === undefined ? null : y.length >= 3 ? +y : +y < 30 ? 2000 + +y : 1900 + +y;   // one- and two-digit years: 0–29 → 2000s, 30–99 → 1900s
const serialOf = (y, m, d) => {   // Excel's 1900 system (the phantom 29 Feb 1900 included); null when the calendar has no such day
  if (m < 1 || m > 12 || d < 1 || y < 1900 || y > 9999) return null;
  if (y === 1900 && m === 2 && d === 29) return 60;
  if (d > new Date(Date.UTC(y, m, 0)).getUTCDate()) return null;
  const n = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 86400000);
  return n < 61 ? n - 1 : n;
};
const timeOf = t => {   // the fraction of a day, or null
  const m = RE_TIME.exec(t); if (!m) return null;
  let h = +m[1]; const mi = +m[2], s = m[3] ? +m[3] : 0, ap = m[4] ? m[4].toLowerCase() : '';
  if (mi > 59 || s >= 60) return null;
  if (ap) { if (h < 1 || h > 12) return null; h = h % 12 + (ap === 'p' ? 12 : 0); }   // without AM/PM, 24:00 and beyond read as elapsed hours, as Excel takes them
  return (h * 3600 + mi * 60 + s) / 86400;
};
/** The Excel serial a date or time text denotes (en-US shapes), or null. A date with no year takes `yearNow()`'s. */
export function dateTextToSerial(str, yearNow) { const v = dateTextValue(str, yearNow); return v ? v.serial : null; }
/**
 * A typed date or time (en-US shapes) as { serial, code }: the serial it denotes and the number
 * format Excel gives a General cell for the shape typed — 1/31/2026 and 2026-01-31 → m/d/yyyy,
 * 1/31 and Jan 31 → d-mmm, 31-Jan-26 and Jan 31, 2026 → d-mmm-yy, 1/2026 and Jan 2026 → mmm-yy,
 * 12:00 → h:mm (h:mm:ss with seconds, AM/PM when typed, [h]:mm:ss past 23 hours), a date and a
 * time → m/d/yyyy h:mm. Null when the text is no date. A date with no year takes `yearNow()`'s.
 */
export function dateTextValue(str, yearNow = () => new Date().getUTCFullYear()) {
  const t = String(str).trim();
  if (!t || t.length > 40 || !/\d/.test(t)) return null;
  const v = (serial, code) => serial === null ? null : { serial, code };
  const dateOf = s => {
    let m;
    if ((m = RE_MDY.exec(s))) return v(serialOf(yearOf(m[3]), +m[1], +m[2]), 'm/d/yyyy');
    if ((m = RE_MD.exec(s))) return v(serialOf(yearNow(), +m[1], +m[2]), 'd-mmm');    // 1/31, 5-3: month and day of this year (13/1 and 1/32 stay text)
    if ((m = RE_MY.exec(s))) return v(serialOf(+m[2], +m[1], 1), 'mmm-yy');             // 1/2026: the first of the month
    if ((m = RE_YMD.exec(s))) return v(serialOf(+m[1], +m[2], +m[3]), 'm/d/yyyy');
    if ((m = RE_DMON.exec(s))) { const mo = monthOf(m[2]); return mo ? v(serialOf(m[3] === undefined ? yearNow() : yearOf(m[3]), mo, +m[1]), m[3] === undefined ? 'd-mmm' : 'd-mmm-yy') : null; }
    if ((m = RE_MOND.exec(s))) {
      const mo = monthOf(m[1]); if (!mo) return null;
      if (m[3] !== undefined) return v(serialOf(yearOf(m[3]), mo, +m[2]), 'd-mmm-yy');
      const d = serialOf(yearNow(), mo, +m[2]);
      return d !== null || +m[2] < 1 ? v(d, 'd-mmm') : v(serialOf(yearOf(m[2]), mo, 1), 'mmm-yy');   // Jan-32, Feb 29 in a common year: the number is a year (1 Jan 1932, 1 Feb 2029), as Excel reads it
    }
    if ((m = RE_MONY.exec(s))) { const mo = monthOf(m[1]); return mo ? v(serialOf(+m[2], mo, 1), 'mmm-yy') : null; }
    return null;
  };
  const timeCode = s => { const m = RE_TIME.exec(s); return +m[1] > 23 ? '[h]:mm:ss' : 'h:mm' + (m[3] ? ':ss' : '') + (m[4] ? ' AM/PM' : ''); };
  const whole = dateOf(t); if (whole) return whole;
  const time = timeOf(t); if (time !== null) return { serial: time, code: timeCode(t) };
  const sp = t.search(/\s\d{1,2}:\d{2}/);   // a date then a time
  if (sp > 0) { const d = dateOf(t.slice(0, sp).trim()), tm = timeOf(t.slice(sp).trim()); if (d && tm !== null) return { serial: d.serial + tm, code: 'm/d/yyyy h:mm' }; }
  return null;
}

const num15 = n => parseFloat(Number(n).toPrecision(15));

function numeq(a, b) { return num15(a) === num15(b); }

const COLLATOR = new Intl.Collator('en', { sensitivity: 'accent' });
const cmpText = (a, b) => a === b ? 0 : COLLATOR.compare(a, b);
/**
 * Excel's comparison of two plain values (number | string | boolean | null) under = <> < <= > >=:
 * numbers < text < booleans, text case-insensitive, a blank reads as the other side's zero ("" / 0 /
 * FALSE). The operators use it, and so do the conditional-formatting presets (a Highlight Cells
 * rule is the comparison =A1>5 evaluated per cell).
 */
export function compareValues(op, a, b) {
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
// parsed formulas, by text: a recalc evaluates the same formulas again and again (the evaluator never mutates a tree)
const PARSE_CACHE = new Map(); const PARSE_CACHE_MAX = 4000;
function parseCached(expr) {
  const key = String(expr); const hit = PARSE_CACHE.get(key); if (hit) return hit;
  const ast = parseFormula(expr);
  if (PARSE_CACHE.size >= PARSE_CACHE_MAX) PARSE_CACHE.clear();
  PARSE_CACHE.set(key, ast); return ast;
}
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
  // a parsed AST (parseFormula) is taken as is, so a formula evaluated over many cells — a
  // conditional-formatting rule — is parsed once; ctx.offset = {dr, dc} then shifts its relative
  // references per cell, exactly as translateFormula would rewrite the text (a reference pushed
  // above row 1 or left of column A is #REF! — or, with offset.wrap, runs round the sheet edge,
  // as Excel's conditional-formatting references do)
  const ast = expr && typeof expr === 'object' ? expr : parseCached(expr);   // SyntaxError propagates: the commit gate decides what to do
  const OFF = ctx.offset && (ctx.offset.dr || ctx.offset.dc) ? ctx.offset : null;
  const offR = r => OFF.wrap ? wrapIndex(r, ROWS) : r, offC = c => OFF.wrap ? wrapIndex(c, COLS) : c;

  /* ---- value helpers -------------------------------------------------------- */
  const cellVal = key => { const v = raw(key); if (v === undefined) return null; if (isErrVal(v)) throw err(v); return v; };
  const deref = v => {
    if (v === undefined) return null;   // an omitted argument slot reads as a blank
    if (isArr(v)) { if (v.size !== 1) throw err('#VALUE!'); const x = v.data[0]; if (x instanceof FxError) throw x; return x; }
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
    if (n !== null) return n;
    const s = dateText(v);
    if (s === null) throw err('#VALUE!');
    return s;
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

  /* ---- arrays: a 2-D view over a Range, an Arr or a scalar; element-wise lifting -------- */
  // Excel 365 evaluates every formula as an array formula: (A1:A5="x")*(B1:B5) is five products,
  // ABS(A1:A5) five absolutes, IF(A1:A5>0,B1:B5) five picks. A multi-cell operand lifts the
  // operator or scalar function cell by cell (broadcast); the aggregates then read the Arr as they
  // read a range (text and booleans skipped, errors propagated); at the top the Arr spills.
  const grid = v => {   // rows, cols, size, raw(i): the element as a cell holds it (an error as its code string, a blank null, an omitted argument undefined)
    if (isRange(v)) return { rows: v.rows, cols: v.cols, size: v.size, raw: i => { const x = raw(v.cell(i)); return x === undefined ? null : x; } };
    if (isArr(v)) return { rows: v.rows, cols: v.cols, size: v.size, raw: i => { const x = v.data[i]; return x instanceof FxError ? x.code : x; } };
    return { rows: 1, cols: 1, size: 1, raw: () => v };
  };
  const gval = (g, i) => { const x = g.raw(i); if (isErrVal(x)) throw err(x); return x; };   // a value, errors propagating
  const glook = (g, i) => { const x = g.raw(i); return isErrVal(x) ? SKIP : x; };          // a lookup cell: an error is stepped over
  /** A piece of a Range (a Range, still on its sheet) or of an Arr / scalar (an Arr); corners 0-based, inclusive. */
  const slice = (src, r1, c1, r2, c2) => {
    if (isRange(src)) return new Range(src.r1 + r1, src.c1 + c1, src.r1 + r2, src.c1 + c2, src.sheet);
    const g = grid(src), data = [];
    for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) data.push(isArr(src) ? src.data[r * g.cols + c] : src);
    return new Arr(r2 - r1 + 1, c2 - c1 + 1, data);
  };
  /**
   * Element-wise evaluation over the arguments: a single row or column stretches across the result,
   * a scalar repeats, a cell outside a smaller array is #N/A, and an error in one cell is an error
   * in that element alone. With `rawErrors` the function sees an error element as its code string
   * (the classifiers and IFERROR read errors instead of propagating them).
   */
  function broadcast(vals, fn, rawErrors = false) {
    const gs = vals.map(grid);
    const R = Math.max(...gs.map(g => g.rows)), C = Math.max(...gs.map(g => g.cols));
    const data = new Array(R * C);
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      try {
        const a = gs.map(g => {
          const rr = g.rows === 1 ? 0 : r, cc = g.cols === 1 ? 0 : c;
          if (rr >= g.rows || cc >= g.cols) throw err('#N/A');
          return rawErrors ? g.raw(rr * g.cols + cc) : gval(g, rr * g.cols + cc);
        });
        let x = fn(...a);
        if (isRange(x) || isArr(x)) x = deref(x);
        data[r * C + c] = x === null || x === undefined ? 0 : x;   // a blank picked into an array is 0, as Excel holds it
      } catch (e) { if (!(e instanceof FxError)) throw e; data[r * C + c] = e; }
    }
    return new Arr(R, C, data);
  }
  /** Every element of a Range or an Arr, as a cell holds it (errors as code strings), for the counters and the text joiners. */
  const eachRaw = (v, fn) => { const g = grid(v); for (let i = 0; i < g.size; i++) fn(g.raw(i)); };
  const rangeOf = (a, b, sheet) => {
    const A = refParts(a), B = refParts(b);
    return new Range(Math.min(A.r, B.r), Math.min(A.c, B.c), Math.max(A.r, B.r), Math.max(A.c, B.c), sheet);
  };
  function refParts(ref) {
    const m = /^(\$?)([A-Z]{1,3})(\$?)(\d+)$/.exec(ref);
    let c = colIndex(m[2]), r = +m[4];
    if (OFF) { if (!m[1]) c = offC(c + OFF.dc); if (!m[3]) r = offR(r + OFF.dr); if (c < 1 || r < 1) throw err('#REF!'); }
    return { c, r };
  }
  const offCol = (letters, abs) => { const c = OFF && !abs ? offC(colIndex(letters) + OFF.dc) : colIndex(letters); if (c < 1) throw err('#REF!'); return c; };
  const offRow = (n, abs) => { const r = OFF && !abs ? offR(n + OFF.dr) : n; if (r < 1) throw err('#REF!'); return r; };
  function compare(op, a, b) { return compareValues(op, deref(a), deref(b)); }

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
  /** Numeric or date text as its number ("1,000", "1/15/2026", "12:00"), else null: the criteria and COUNT read text as Excel coerces it. */
  const numOfText = s => { const n = textToNumber(s); return n !== null ? n : dateText(s); };
  function parseCritVal(t) {
    if (t === '') return '';
    const n = numOfText(t);   // ">1/15/2026" compares serials, as Excel's criteria do
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
      else if (typeof val === 'number') eq = (typeof cell === 'number' && numeq(cell, val)) || (typeof cell === 'string' && numOfText(cell) !== null && numeq(numOfText(cell), val));
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
      if (isRange(v) || isArr(v)) {
        const g = grid(v);
        for (let i = 0; i < g.size; i++) { const x = gval(g, i); if (typeof x === 'number') out.push(x); else if (keepBoolInRange && typeof x === 'boolean') out.push(x ? 1 : 0); }
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
  // the weekday follows the serial (0 = Saturday, 1 = Sunday), so Jan–Feb 1900 sit a day off the real calendar, as in Excel
  const ymd = s => { s = Math.floor(s); const wd = ((s - 1) % 7 + 7) % 7; if (s === 60) return { y: 1900, m: 2, d: 29, wd }; if (s === 0) return { y: 1900, m: 1, d: 0, wd }; const d = dateOf(s); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), wd }; };
  const todaySerial = () => ctx.today ? ctx.today() : Math.floor((Date.now() - EPOCH) / 86400000);
  const dateText = s => dateTextToSerial(s, () => ymd(todaySerial()).y);   // "1/31/2026", "31-Jan-26", "12:00 PM" read as their serial, as Excel coerces them

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
  const colVals = (g, c) => { const out = []; for (let r = 0; r < g.rows; r++) out.push(glook(g, r * g.cols + c)); return out; };
  const rowVals = (g, r) => { const out = []; for (let c = 0; c < g.cols; c++) out.push(glook(g, r * g.cols + c)); return out; };
  const flatVals = g => { const out = []; for (let i = 0; i < g.size; i++) out.push(glook(g, i)); return out; };
  /** XLOOKUP's and XMATCH's search: the index of `key` in `vals`, or -1. match_mode 0 exact · -1 exact or next smaller · 1 exact or next larger · 2 wildcard; search_mode 1 first-to-last · -1 last-to-first (2 / -2, the binary searches, give the same answers on the sorted data they require). */
  function xfind(key, vals, mode, smode) {
    if (![0, 1, -1, 2].includes(mode) || ![1, -1, 2, -2].includes(smode)) throw err('#VALUE!');
    key = deref(key); if (key === null) key = 0;
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
    return i;
  }
  /** Excel's sort order for SORT and UNIQUE: numbers, then text (case-insensitive), then booleans; blanks always last. */
  const sortCmp = (a, b) => {
    if (a === null && b === null) return 0; if (a === null) return 1; if (b === null) return -1;
    const ea = a instanceof FxError || isErrVal(a), eb = b instanceof FxError || isErrVal(b); if (ea || eb) return ea && eb ? 0 : ea ? 1 : -1;
    return compareValues('<', a, b) ? -1 : compareValues('>', a, b) ? 1 : 0;
  };
  const sameCell = (a, b) => (a === null ? '' : a) === (b === null ? '' : b) || (typeof a === 'string' && typeof b === 'string' && cmpText(a, b) === 0);

  /* ---- TEXT(value, format) — Excel number-format codes, via numfmt.js (the grid's engine) ---- */
  // A numeric- or date-looking string reads as its number; text passes through unless a text section
  // dresses it; an empty format text formats to nothing; a bad code or a date out of range is
  // #VALUE!, as Excel reports it.
  function textFormat(v, fmt) {
    v = deref(v);
    if (fmt === '') return '';
    if (typeof v === 'string') { const n = textToNumber(v); if (n !== null) v = n; else { const s = dateText(v); if (s !== null) v = s; } }
    else if (typeof v !== 'boolean' && typeof v !== 'number') v = toNum(v);
    try { return formatValue(v, String(fmt)).text; }
    catch (e) { if (e instanceof FormatError) throw err('#VALUE!'); throw e; }
  }
  /* ---- the function table --------------------------------------------------------- */
  function callFn(name, node) {
    // a 3D reference (Jan:Mar!B5) is one argument per sheet of the run, in the functions Excel lets take one; anywhere else it is #VALUE!
    if (node.args.some(is3D)) {
      if (!THREE_D.has(name)) throw err('#VALUE!');
      const ex = [];
      for (const a of node.args) { if (!is3D(a)) { ex.push(a); continue; } const [x, y] = a.sheet.split(':'); const names = ctx.sheetSpan ? ctx.sheetSpan(x, y) : null; if (!names) throw err('#REF!'); for (const nm of names) ex.push({ ...a, sheet: String(nm).toUpperCase() }); }
      return callFn(name, { ...node, args: ex });
    }
    const slots = node.args;   // null = omitted slot; arity was checked by the parser
    // lazy forms first: they choose which arguments to evaluate, or classify an error instead of propagating it
    switch (name) {
      case 'IF': {
        const cv = evArg(slots[0]);
        if (isMulti(cv)) {   // an array test picks element by element: MEDIAN(IF(A2:A9="x",B2:B9)) sees B where A is x, FALSE elsewhere
          const a = evArg(slots[1]), b = slots[2] === undefined ? false : evArg(slots[2]);
          return broadcast([cv, a, b], (c, x, y) => toBool(c) ? x : y);
        }
        const c = toBool(cv);
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
        try { v = evArg(slots[0]); if (isMulti(v)) { const alt = evArg(slots[1]); return broadcast([v, alt], (x, y) => isErrVal(x) && (name === 'IFERROR' || x === '#N/A') ? y : x, true); } v = deref(v); }
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
        try { const v = evArg(slots[0]); if (isMulti(v)) return broadcast([v], x => isErrVal(x) && (name === 'ISERROR' || (name === 'ISNA') === (x === '#N/A')), true); deref(v); return false; }
        catch (e) { if (!(e instanceof FxError)) throw e; if (name === 'ISERROR') return true; if (name === 'ISNA') return e.code === '#N/A'; return e.code !== '#N/A'; }
      }
      case 'ISBLANK': case 'ISNUMBER': case 'ISTEXT': case 'ISNONTEXT': case 'ISLOGICAL': {
        // the argument is classified, so an error inside it (ISNUMBER(MATCH(…)), ISNUMBER(SEARCH(…))) is FALSE, not a propagation
        let v;
        const classify = x => { if (isErrVal(x)) return name === 'ISNONTEXT'; if (name === 'ISBLANK') return x === null; if (name === 'ISNUMBER') return typeof x === 'number'; if (name === 'ISTEXT') return typeof x === 'string'; if (name === 'ISNONTEXT') return typeof x !== 'string'; return typeof x === 'boolean'; };
        try { v = evArg(slots[0]); if (isMulti(v)) return broadcast([v], classify, true); if (name !== 'ISBLANK') v = deref(v); }   // ISNUMBER(range): one answer per cell (M75)
        catch (e) { if (!(e instanceof FxError)) throw e; return name === 'ISNONTEXT'; }
        if (name === 'ISBLANK') { if (isRange(v) && v.size === 1) { const x = raw(v.cell(0)); return x === null || x === undefined; } return v === null; }
        if (name === 'ISNUMBER') return typeof v === 'number';
        if (name === 'ISTEXT') return typeof v === 'string';
        if (name === 'ISNONTEXT') return typeof v !== 'string';
        return typeof v === 'boolean';
      }
      case 'GETPIVOTDATA': {   // a figure from a PivotTable: the data field, a cell of the pivot, then field / item pairs (the sheet answers through ctx.pivotCell, which names the cell that holds it)
        const field = toText(evArg(slots[0])); const ref = evArg(slots[1]); if (!isRange(ref)) throw err('#REF!');
        const pairs = slots.slice(2).map(a => { const v = deref(evArg(a)); return typeof v === 'number' ? v : toText(v); });
        const k = ctx.pivotCell ? ctx.pivotCell(ref.cell(0), field, pairs) : null; if (!k) throw err('#REF!');
        const v = raw(k); if (v === null || v === undefined) throw err('#REF!'); if (isErrVal(v)) throw err(v); return v;
      }
      case 'ISFORMULA': {   // TRUE for a cell that holds a formula (the sheet answers through ctx.isFormula); over a range, one answer per cell (M75)
        const v = evArg(slots[0]); if (!isRange(v)) throw err('#VALUE!');
        const f = k => { const r = ctx.isFormula ? ctx.isFormula(k) : false; if (r === null) throw err('#REF!'); return !!r; };   // null: no such sheet
        return v.size === 1 ? f(v.cell(0)) : new Arr(v.rows, v.cols, v.keys().map(f));
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
        if (isRange(v) || isArr(v)) eachRaw(v, x => { if (name === 'COUNT' ? typeof x === 'number' : (x !== null && x !== undefined)) k++; });
        else if (v && v.__err) { if (name === 'COUNTA') k++; }
        else if (name === 'COUNT') { if (typeof v === 'number' || typeof v === 'boolean' || (typeof v === 'string' && numOfText(v) !== null)) k++; }   // a literal "12:00" or "1/31/2026" counts, as Excel's COUNT documents
        else if (v !== null) k++;
      }
      return k;
    }
    const args = evArgs(node);
    // a scalar function over a multi-cell argument runs once per cell (ABS(A1:A5), ROUND(B2:B9,0), LEN(A:A)) and gives an array
    if (LIFT.has(name) && args.some(isMulti)) return broadcast(args, (...a) => callScalar(name, a));
    return callScalar(name, args);
  }
  function callScalar(name, args) {
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
      // CEILING and FLOOR (the classic forms): round to a multiple of significance, away from zero
      // (CEILING) or toward zero (FLOOR) when both are negative; mixed signs are #NUM!
      case 'CEILING': { const x = toNum(args[0]), s = toNum(args[1]); if (s === 0) return 0; if ((x > 0 && s < 0)) throw err('#NUM!');
        return num15(Math.ceil(num15(x / s)) * s); }
      case 'FLOOR': { const x = toNum(args[0]), s = toNum(args[1]); if (s === 0) throw err('#DIV/0!'); if (x > 0 && s < 0) throw err('#NUM!');
        return num15(Math.floor(num15(x / s)) * s); }
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
      case 'SUMPRODUCT': {   // ranges or arrays of one shape: (A2:A9="x")*(B2:B9) arrives as one array of products, ABS(C2:C9) as one of absolutes; text and booleans read 0
        const gs = args.map(grid); const L = gs[0].size; if (gs.some(g => g.rows !== gs[0].rows || g.cols !== gs[0].cols)) throw err('#VALUE!');
        let t = 0; for (let i = 0; i < L; i++) { let m = 1; for (const g of gs) { const v = gval(g, i); m *= typeof v === 'number' ? v : 0; } t += m; } return t; }
      case 'HYPERLINK': { const v = has(args, 1) ? deref(args[1]) : deref(args[0]); return v === null ? 0 : v; }   // the cell shows the friendly name (or the link text); nothing is followed here
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
          if (isRange(v) || isArr(v)) { const g = grid(v); for (let i = 0; i < g.size; i++) { const x = gval(g, i); if (typeof x === 'number') bs.push(x !== 0); else if (typeof x === 'boolean') bs.push(x); } }
          else if (v !== null) bs.push(toBool(v)); }
        if (!bs.length) throw err('#VALUE!');
        if (name === 'AND') return bs.every(Boolean); if (name === 'OR') return bs.some(Boolean); return bs.filter(Boolean).length % 2 === 1;
      }
      case 'NOT': return !toBool(args[0]);
      case 'TRUE': return true; case 'FALSE': return false;
      case 'NA': throw err('#N/A');
      /* ---- lookup ---- */
      case 'MATCH': { const mode = has(args, 2) ? Math.sign(toNum(args[2])) : 1;
        const vals = flatVals(grid(args[1])); const i = lookupIndex(args[0], vals, mode); if (i < 0) throw err('#N/A'); return i + 1; }
      case 'XMATCH': { const i = xfind(args[0], flatVals(grid(args[1])), has(args, 2) ? toInt(args[2]) : 0, has(args, 3) ? toInt(args[3]) : 1); if (i < 0) throw err('#N/A'); return i + 1; }
      case 'INDEX': {   // a piece of the range (still a reference on its sheet) or of the array: a cell, a whole row (c = 0), a whole column (r = 0)
        const src = args[0]; if (!isRange(src) && !isArr(src)) throw err('#VALUE!'); const g = grid(src);
        const r = has(args, 1) ? toInt(args[1]) : 0, c = has(args, 2) ? toInt(args[2]) : 0;
        if (g.rows === 1 && g.cols > 1 && !has(args, 2) && has(args, 1)) { if (r < 1 || r > g.cols) throw err('#REF!'); return slice(src, 0, r - 1, 0, r - 1); }   // one row: the second argument walks along it
        if (r < 0 || c < 0 || r > g.rows || c > g.cols) throw err('#REF!');
        if (r === 0 && c === 0) return src;
        if (r === 0) return slice(src, 0, c - 1, g.rows - 1, c - 1);
        if (c === 0) return slice(src, r - 1, 0, r - 1, g.cols - 1);
        return slice(src, r - 1, c - 1, r - 1, c - 1); }
      case 'VLOOKUP': case 'HLOOKUP': { if (!isRange(args[1]) && !isArr(args[1])) throw err('#VALUE!'); const g = grid(args[1]); const idx = toInt(args[2]); const approx = has(args, 3) ? toBool(args[3]) : true;
        const vert = name === 'VLOOKUP'; if (idx < 1 || idx > (vert ? g.cols : g.rows)) throw err('#REF!');
        const keys = vert ? colVals(g, 0) : rowVals(g, 0); const i = lookupIndex(args[0], keys, approx ? 1 : 0); if (i < 0) throw err('#N/A');
        const v = gval(g, vert ? i * g.cols + idx - 1 : (idx - 1) * g.cols + i); return v === null ? 0 : v; }
      case 'XLOOKUP': {
        // match_mode: 0 exact · -1 exact or next smaller · 1 exact or next larger · 2 wildcard — none needs sorted data.
        // search_mode: 1 first-to-last · -1 last-to-first. The lookup array is one row or one column; the
        // return array matches it on that side and may be wider: a column lookup over a block returns the
        // whole row (a record), a row lookup over a block the whole column, so XLOOKUP(x, A:A, XLOOKUP(y,
        // 1:1, B2:E10)) is the two-way lookup, the inner one handing the outer its return column.
        if (!isRange(args[1]) && !isArr(args[1]) || !isRange(args[2]) && !isArr(args[2])) throw err('#VALUE!');
        const look = grid(args[1]), ret = grid(args[2]);
        const vert = look.cols === 1;
        if ((look.rows > 1 && look.cols > 1) || (vert ? ret.rows !== look.rows : ret.cols !== look.cols)) throw err('#VALUE!');
        const i = xfind(args[0], flatVals(look), has(args, 4) ? toInt(args[4]) : 0, has(args, 5) ? toInt(args[5]) : 1);
        if (i < 0) { if (has(args, 3)) return args[3]; throw err('#N/A'); }
        const piece = vert ? slice(args[2], i, 0, i, ret.cols - 1) : slice(args[2], 0, i, ret.rows - 1, i);
        if (piece.size > 1) return piece;
        const v = deref(piece); return v === null ? 0 : v; }
      case 'OFFSET': { const base = argRange(args[0]); const dr = toInt(args[1]), dc = toInt(args[2]);
        const h = has(args, 3) ? toInt(args[3]) : base.rows, w = has(args, 4) ? toInt(args[4]) : base.cols;
        if (h < 1 || w < 1) throw err('#REF!'); const r1 = base.r1 + dr, c1 = base.c1 + dc; if (r1 < 1 || c1 < 1) throw err('#REF!');
        return new Range(r1, c1, r1 + h - 1, c1 + w - 1, base.sheet); }
      case 'INDIRECT': {
        // the text of a reference, read as one (A1 style; a sheet prefix, a range and a defined name all
        // work): an unparseable text, or a text that is not a reference, is #REF!, as Excel reports it
        if (has(args, 1) && !toBool(args[1])) throw err('#REF!');   // R1C1 texts are not read
        const t = toText(args[0]).trim(); if (!t) throw err('#REF!');
        let ast; try { ast = parseFormula('=' + t); } catch (e) { throw err('#REF!'); }
        if (ast.k === 'name') { const t2 = ctx.name ? ctx.name(ast.v) : null; if (!t2) throw err('#REF!'); return new Range(t2.r1, t2.c1, t2.r2, t2.c2, t2.sheet || undefined); }
        if (!['ref', 'range', 'colrange', 'rowrange'].includes(ast.k)) throw err('#REF!');
        return ev(ast); }
      case 'SUBTOTAL': {
        // 1 to 11 skip only the rows the AutoFilter hides; 101 to 111 skip every row that does not show
        // (hidden by hand, filtered, or in a collapsed outline). The sheet answers through ctx.rowFiltered
        // and ctx.rowHidden; a range on another sheet is read whole.
        const fn = toInt(args[0]); const base = fn > 100 ? fn - 100 : fn;
        if (base < 1 || base > 11 || (fn > 11 && fn < 101)) throw err('#VALUE!');
        const rgs = args.slice(1).map(argRange);
        const hide = fn > 100 ? ctx.rowHidden : ctx.rowFiltered;
        const vals = [], nonblank = [];
        for (const rg of rgs) for (let r = rg.r1; r <= rg.r2; r++) {
          if (!rg.sheet && hide && hide(r)) continue;
          for (let c = rg.c1; c <= rg.c2; c++) { const x = cellVal(rg.at(r - rg.r1, c - rg.c1)); if (typeof x === 'number') vals.push(x); if (x !== null && x !== '') nonblank.push(x); }
        }
        const mean = xs => xs.reduce((a, b) => a + b, 0) / xs.length;
        const variance = (xs, sample) => { if (xs.length < (sample ? 2 : 1)) throw err('#DIV/0!'); const m = mean(xs); return xs.reduce((a, x) => a + (x - m) * (x - m), 0) / (xs.length - (sample ? 1 : 0)); };
        switch (base) {
          case 1: if (!vals.length) throw err('#DIV/0!'); return mean(vals);
          case 2: return vals.length;
          case 3: return nonblank.length;
          case 4: return vals.length ? Math.max(...vals) : 0;
          case 5: return vals.length ? Math.min(...vals) : 0;
          case 6: return vals.length ? vals.reduce((a, b) => a * b, 1) : 0;
          case 7: return Math.sqrt(variance(vals, true));
          case 8: return Math.sqrt(variance(vals, false));
          case 9: return vals.reduce((a, b) => a + b, 0);
          case 10: return variance(vals, true);
          default: return variance(vals, false);
        } }
      case 'ROWS': { const v = args[0]; if (!isRange(v) && !isArr(v)) throw err('#VALUE!'); return v.rows; }
      case 'COLUMNS': { const v = args[0]; if (!isRange(v) && !isArr(v)) throw err('#VALUE!'); return v.cols; }
      /* ---- dynamic arrays (M61): each gives an Arr, which spills at the top of a formula ---- */
      case 'FILTER': {   // the rows (a column of tests) or columns (a row of tests) of `array` whose test is true; none → if_empty, else #CALC!
        const src = args[0]; if (!isRange(src) && !isArr(src)) throw err('#VALUE!'); const g = grid(src), inc = grid(args[1]);
        const byRow = inc.cols === 1 && inc.rows === g.rows, byCol = !byRow && inc.rows === 1 && inc.cols === g.cols;
        if (!byRow && !byCol) throw err('#VALUE!');
        const keep = []; for (let i = 0; i < inc.size; i++) if (toBool(gval(inc, i))) keep.push(i);
        if (!keep.length) { if (has(args, 2)) return args[2]; throw err('#CALC!'); }
        const rows = []; if (byRow) for (const r of keep) { const row = []; for (let c = 0; c < g.cols; c++) row.push(g.raw(r * g.cols + c)); rows.push(row); }
        else for (let r = 0; r < g.rows; r++) { const row = []; for (const c of keep) row.push(g.raw(r * g.cols + c)); rows.push(row); }
        return Arr.of(rows); }
      case 'SORT': {   // the rows of `array` by column sort_index (1), ascending (1) or descending (-1); by_col TRUE sorts the columns by a row
        const src = args[0]; if (!isRange(src) && !isArr(src)) throw err('#VALUE!'); const g = grid(src);
        const idx = has(args, 1) ? toInt(args[1]) : 1, ord = has(args, 2) ? toInt(args[2]) : 1, byCol = has(args, 3) ? toBool(args[3]) : false;
        if (![1, -1].includes(ord)) throw err('#VALUE!');
        const rows = []; for (let r = 0; r < g.rows; r++) { const row = []; for (let c = 0; c < g.cols; c++) row.push(g.raw(r * g.cols + c)); rows.push(row); }
        const lines = byCol ? rows[0].map((_, c) => rows.map(row => row[c])) : rows;
        if (idx < 1 || idx > lines[0].length) throw err('#VALUE!');
        const sorted = lines.map((l, i) => [l, i]).sort((a, b) => (ord * sortCmp(a[0][idx - 1], b[0][idx - 1])) || (a[1] - b[1])).map(x => x[0]);
        return Arr.of(byCol ? sorted[0].map((_, r) => sorted.map(col => col[r])) : sorted); }
      case 'UNIQUE': {   // distinct rows (columns with by_col), in first-seen order; exactly_once keeps only the ones that appear once; text compares case-insensitively
        const src = args[0]; if (!isRange(src) && !isArr(src)) throw err('#VALUE!'); const g = grid(src);
        const byCol = has(args, 1) ? toBool(args[1]) : false, once = has(args, 2) ? toBool(args[2]) : false;
        const rows = []; for (let r = 0; r < g.rows; r++) { const row = []; for (let c = 0; c < g.cols; c++) row.push(g.raw(r * g.cols + c)); rows.push(row); }
        const lines = byCol ? rows[0].map((_, c) => rows.map(row => row[c])) : rows;
        const groups = [];
        for (const l of lines) { const hit = groups.find(gr => gr.line.every((x, i) => sameCell(x, l[i]))); if (hit) hit.n++; else groups.push({ line: l, n: 1 }); }
        const out = groups.filter(gr => !once || gr.n === 1).map(gr => gr.line);
        if (!out.length) throw err('#CALC!');
        return Arr.of(byCol ? out[0].map((_, r) => out.map(col => col[r])) : out); }
      case 'SEQUENCE': {   // rows × columns of numbers from start, by step, filled across then down
        const R = toInt(args[0]), C = has(args, 1) ? toInt(args[1]) : 1, st = has(args, 2) ? toNum(args[2]) : 1, step = has(args, 3) ? toNum(args[3]) : 1;
        if (R < 1 || C < 1) throw err('#VALUE!'); if (R * C > 1048576) throw err('#NUM!');
        const data = []; for (let i = 0; i < R * C; i++) data.push(st + step * i); return new Arr(R, C, data); }
      case 'TRANSPOSE': { const src = args[0]; const g = grid(src); const rows = []; for (let c = 0; c < g.cols; c++) { const row = []; for (let r = 0; r < g.rows; r++) row.push(g.raw(r * g.cols + c)); rows.push(row); } return Arr.of(rows); }
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
      case 'CONCATENATE': case 'CONCAT': { let s = ''; for (const v of args) { if (v === undefined) continue; if (isRange(v) || isArr(v)) { if (name === 'CONCATENATE' && v.size > 1) throw err('#VALUE!'); const g = grid(v); for (let i = 0; i < g.size; i++) s = capText(s + toText(gval(g, i))); } else s = capText(s + toText(v)); } return s; }
      case 'TEXTJOIN': { const d = toText(args[0]); const skip = toBool(args[1]); const parts = [];
        for (const v of args.slice(2)) { if (v === undefined) continue; const vs = isRange(v) || isArr(v) ? (() => { const g = grid(v), o = []; for (let i = 0; i < g.size; i++) o.push(toText(gval(g, i))); return o; })() : [toText(v)]; for (const t of vs) if (!skip || t !== '') parts.push(t); }
        return capText(parts.join(d)); }
      case 'SUBSTITUTE': { const t = toText(args[0]), o = toText(args[1]), nw = toText(args[2]); if (o === '') return t;
        if (has(args, 3)) { const inst = toInt(args[3]); if (inst < 1) throw err('#VALUE!'); let idx = -1; for (let k = 0; k < inst; k++) { idx = t.indexOf(o, idx + 1); if (idx < 0) return t; } return capText(t.slice(0, idx) + nw + t.slice(idx + o.length)); }
        const cnt = t.split(o).length - 1; if (t.length + cnt * (nw.length - o.length) > MAX_TEXT) throw err('#VALUE!');   // never build an oversized string
        return t.split(o).join(nw); }
      case 'REPT': { const t = toText(args[0]); const k = toInt(args[1]); if (k < 0 || t.length * k > MAX_TEXT) throw err('#VALUE!'); return t.repeat(k); }
      case 'EXACT': return toText(args[0]) === toText(args[1]);
      case 'VALUE': { const v = deref(args[0]); if (typeof v === 'number') return v; const t = toText(v); const x = textToNumber(t); if (x !== null) return x; const s = dateText(t); if (s === null) throw err('#VALUE!'); return s; }
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
      case 'DATEVALUE': { const v = deref(args[0]); if (typeof v !== 'string') throw err('#VALUE!'); const s = dateText(v); if (s === null) throw err('#VALUE!'); return Math.floor(s); }
      case 'NETWORKDAYS': case 'NETWORKDAYS.INTL': {
        const a = Math.floor(toNum(args[0])), b = Math.floor(toNum(args[1]));
        if (a < 0 || b < 0) throw err('#NUM!');
        // the weekend mask, Monday first: NETWORKDAYS is Saturday and Sunday; .INTL takes a number (1–7, 11–17) or a seven-character "0000000" string
        let mask = [0, 0, 0, 0, 0, 1, 1];
        let holidaysArg = name === 'NETWORKDAYS' ? args[2] : args[3];
        if (name === 'NETWORKDAYS.INTL' && has(args, 2)) {
          const w = deref(args[2]);
          if (typeof w === 'string') { if (!/^[01]{7}$/.test(w) || w === '1111111') throw err('#VALUE!'); mask = [...w].map(ch => +ch); }
          else { const n = toInt(w); if (n >= 1 && n <= 7) { mask = [0, 0, 0, 0, 0, 0, 0]; mask[(n + 4) % 7] = 1; mask[(n + 5) % 7] = 1; }   // 1 = Sat+Sun … 7 = Fri+Sat
            else if (n >= 11 && n <= 17) { mask = [0, 0, 0, 0, 0, 0, 0]; mask[(n - 11 + 6) % 7] = 1; }   // 11 = Sunday only … 17 = Saturday only
            else throw err('#NUM!'); }
        }
        const hol = new Set((holidaysArg === undefined || holidaysArg === null) ? [] : collectNums([holidaysArg]).map(Math.floor));
        const [lo, hi] = a <= b ? [a, b] : [b, a];
        let k = 0;
        for (let s = lo; s <= hi; s++) { const wd = ymd(s).wd; /* 0 = Sunday */ const mon = (wd + 6) % 7; if (mask[mon]) continue; if (hol.has(s)) continue; k++; }
        return a <= b ? k : -k;
      }
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
      case 'REPLACE': { const t = toText(args[0]); const st = toInt(args[1]), k = toInt(args[2]); if (st < 1 || k < 0) throw err('#VALUE!'); return capText(t.slice(0, st - 1) + toText(args[3]) + t.slice(st - 1 + k)); }
      case 'QUARTILE': case 'QUARTILE.INC': case 'PERCENTILE': case 'PERCENTILE.INC': {   // Excel's inclusive method: the k-th value by linear interpolation on (n − 1) intervals
        const xs = collectNums([args[0]]).sort((a, b) => a - b); if (!xs.length) throw err('#NUM!');
        let p; if (name.startsWith('QUARTILE')) { const q = toInt(args[1]); if (q < 0 || q > 4) throw err('#NUM!'); p = q / 4; } else { p = toNum(args[1]); if (p < 0 || p > 1) throw err('#NUM!'); }
        const pos = p * (xs.length - 1), lo = Math.floor(pos), hi = Math.ceil(pos); return xs[lo] + (xs[hi] - xs[lo]) * (pos - lo); }
      /* ---- financial ---- */
      case 'RRI': { const np = toNum(args[0]), pv = toNum(args[1]), fv = toNum(args[2]); if (np <= 0 || pv === 0) throw err('#NUM!');   // the equivalent compound rate: (fv / pv) ^ (1 / nper) − 1; a negative ratio works only where the power does (a whole nper)
        const v = Math.pow(fv / pv, 1 / np) - 1; if (isNaN(v) || !isFinite(v)) throw err('#NUM!'); return num15(v); }
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
      case 'DATEDIF': {   // the whole years, months or days between two dates; MD, YM and YD ignore the larger units
        const a = Math.floor(toNum(args[0])), b = Math.floor(toNum(args[1])); if (a > b) throw err('#NUM!');
        const A = ymd(a), B = ymd(b); const u = toText(args[2]).toUpperCase();
        let months = (B.y - A.y) * 12 + (B.m - A.m); if (B.d < A.d) months--;
        if (u === 'D') return b - a;
        if (u === 'M') return months;
        if (u === 'Y') return Math.floor(months / 12);
        if (u === 'YM') return ((months % 12) + 12) % 12;
        if (u === 'MD') { if (B.d >= A.d) return B.d - A.d; const prevLast = new Date(Date.UTC(B.y, B.m - 1, 0)).getUTCDate(); return prevLast - A.d + B.d; }
        if (u === 'YD') { let y = B.y; let st = serial(y, A.m, A.d); if (st > b) st = serial(y - 1, A.m, A.d); return b - st; }
        throw err('#NUM!'); }
      case 'RATE': {   // the rate per period, by Newton's method from the guess (10%): 20 tries to agree to 1e-7, else #NUM!
        const np = toNum(args[0]), pmt = toNum(args[1]), pv = toNum(args[2]), fv = has(args, 3) ? toNum(args[3]) : 0, type = has(args, 4) ? toNum(args[4]) : 0;
        let r = has(args, 5) ? toNum(args[5]) : 0.1; if (np <= 0) throw err('#NUM!');
        const f = x => x === 0 ? pv + pmt * np + fv : pv * Math.pow(1 + x, np) + pmt * (1 + x * type) * (Math.pow(1 + x, np) - 1) / x + fv;
        for (let i = 0; i < 100; i++) { const y = f(r), h = 1e-7 * Math.max(1, Math.abs(r)); const d = (f(r + h) - f(r - h)) / (2 * h); if (!isFinite(y) || !isFinite(d) || d === 0) break;
          const nr = r - y / d; if (Math.abs(nr - r) < 1e-10) return num15(nr); r = nr; if (r <= -1) break; }
        throw err('#NUM!'); }
      case 'NPER': { const r = toNum(args[0]), pmt = toNum(args[1]), pv = toNum(args[2]), fv = has(args, 3) ? toNum(args[3]) : 0, type = has(args, 4) ? toNum(args[4]) : 0;
        if (r === 0) { if (pmt === 0) throw err('#NUM!'); return -(pv + fv) / pmt; }
        const k = pmt * (1 + r * type); const x = (k - fv * r) / (k + pv * r); if (!(x > 0) || r <= -1) throw err('#NUM!'); return Math.log(x) / Math.log(1 + r); }
      case 'ADDRESS': {   // the address as text: abs_num 1 $A$1, 2 A$1, 3 $A1, 4 A1; a1 FALSE gives R1C1 (relative parts in brackets); a sheet name goes in front, quoted when it needs it
        const r = toInt(args[0]), c = toInt(args[1]); const abs = has(args, 2) ? toInt(args[2]) : 1; const a1 = has(args, 3) ? toBool(deref(args[3])) : true;
        if (r < 1 || c < 1 || r > 1048576 || c > 16384 || abs < 1 || abs > 4) throw err('#VALUE!');
        const ar = abs === 1 || abs === 2, ac = abs === 1 || abs === 3;
        const t = a1 ? (ac ? '$' : '') + colLetter(c) + (ar ? '$' : '') + r : 'R' + (ar ? r : '[' + r + ']') + 'C' + (ac ? c : '[' + c + ']');
        if (!has(args, 4)) return t; const sh = toText(args[4]); if (sh === '') return '!' + t;
        return (/^[A-Za-z_][A-Za-z0-9_.]*$/.test(sh) ? sh : "'" + sh.replace(/'/g, "''") + "'") + '!' + t; }
      case 'IPMT': case 'PPMT': {
        const r = toNum(args[0]), per = toNum(args[1]), np = toNum(args[2]), pv = toNum(args[3]), fv = has(args, 4) ? toNum(args[4]) : 0, type = has(args, 5) ? toNum(args[5]) : 0;
        if (per < 1 || per >= np + 1 || np <= 0) throw err('#NUM!');
        const pmtOf = () => { if (r === 0) return -(pv + fv) / np; const q = Math.pow(1 + r, np); return -(r * (pv * q + fv)) / ((1 + r * type) * (q - 1)); };
        const fvOf = (n, t) => { if (r === 0) return -(pv + pmt * n); const q = Math.pow(1 + r, n); return -(pv * q + pmt * (1 + r * t) * (q - 1) / r); };
        const pmt = pmtOf();
        let ipmt;
        if (type === 1) ipmt = per === 1 ? 0 : (fvOf(per - 2, 1) - pmt) * r;   // paid in advance: no interest in month 1
        else ipmt = fvOf(per - 1, 0) * r;                                       // interest on the balance that opened the period
        return checkNum(name === 'IPMT' ? ipmt : pmt - ipmt);
      }
      case 'XNPV': case 'XIRR': {
        // dated cash flows: each flow discounted by (1 + rate) ^ (days from the first date / 365)
        const rate = name === 'XNPV' ? toNum(args[0]) : null;
        const vals = collectNums([name === 'XNPV' ? args[1] : args[0]]), dates = collectNums([name === 'XNPV' ? args[2] : args[1]]).map(Math.floor);
        if (!vals.length || vals.length !== dates.length) throw err('#NUM!');
        if (dates.some(d => d < 0)) throw err('#NUM!');
        const d0 = dates[0]; if (dates.some(d => d < d0)) throw err('#NUM!');
        const f = rt => { let t = 0; for (let i = 0; i < vals.length; i++) t += vals[i] / Math.pow(1 + rt, (dates[i] - d0) / 365); return t; };
        if (name === 'XNPV') { if (rate <= -1) throw err('#NUM!'); return checkNum(f(rate)); }
        if (!(vals.some(x => x > 0) && vals.some(x => x < 0))) throw err('#NUM!');
        let lo = -0.999999, hi = 10, flo = f(lo), fhi = f(hi); if (!isFinite(flo) || !isFinite(fhi) || flo * fhi > 0) throw err('#NUM!');
        for (let k = 0; k < 200; k++) { const mid = (lo + hi) / 2, fm = f(mid); if (flo * fm <= 0) { hi = mid; fhi = fm; } else { lo = mid; flo = fm; } }
        return num15((lo + hi) / 2);
      }
      default: throw err('#NAME?');
    }
  }
  const checkNum = x => { if (typeof x !== 'number' || !isFinite(x)) throw err('#NUM!'); return x; };

  /* ---- operators ---------------------------------------------------------------- */
  function binop(op, a, b) {
    if (isMulti(a) || isMulti(b)) return broadcast([a, b], (x, y) => binop(op, x, y));   // array arithmetic: (A1:A5="x")*(B1:B5), A1:A5*2, A1:A3&"x"
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
      case 'val': { const x = node.v; if (isErrVal(x)) throw err(x); return x; }   // a piece Evaluate Formula has already computed (a scalar or an Arr)
      case 'err': throw err(node.v);
      case 'name': {   // a defined name (Define Name, M40): ctx.name resolves it to its cell or range, on this sheet or another
        const t = ctx.name ? ctx.name(node.v) : null;
        if (!t) throw err('#NAME?');
        return new Range(t.r1, t.c1, t.r2, t.c2, t.sheet || undefined);
      }
      case 'paren': return ev(node.x);
      case 'ref': { if (is3D(node)) throw err('#VALUE!'); const p = refParts(node.ref);
        if (node.spill) {   // A1#: the range A1 spills into (the sheet answers through ctx.spillRange); a formula that does not spill is its one cell; anything else is #REF!
          const sp = ctx.spillRange ? ctx.spillRange(refKey(p.r, p.c)) : null;
          if (sp) return new Range(sp.r1, sp.c1, sp.r2, sp.c2);
          if (!(ctx.isFormula && ctx.isFormula(refKey(p.r, p.c)))) throw err('#REF!');
        }
        return new Range(p.r, p.c, p.r, p.c, node.sheet); }
      case 'range': if (is3D(node)) throw err('#VALUE!'); return rangeOf(node.a, node.b, node.sheet);
      case 'colrange': { const a = offCol(node.a, node.absA), b = offCol(node.b, node.absB); return new Range(1, Math.min(a, b), ROWS, Math.max(a, b)); }
      case 'rowrange': { const a = offRow(node.a, node.absA), b = offRow(node.b, node.absB); return new Range(Math.min(a, b), 1, Math.max(a, b), COLS); }
      case 'un': { const v = ev(node.x); if (node.op === '+') return v; if (isMulti(v)) return broadcast([v], x => -toNum(x)); return -toNum(v); }   // unary plus is a no-op in Excel: text stays text
      case 'pct': { const v = ev(node.x); if (isMulti(v)) return broadcast([v], x => toNum(x) / 100); return toNum(v) / 100; }
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
    if (isMulti(v)) {   // a multi-cell result spills (Excel 365): the sheet writes the block through ctx.onSpill; the formula cell shows its top-left value
      if (ctx.onSpill) { const g = grid(v); const rows = []; for (let r = 0; r < g.rows; r++) { const row = []; for (let c = 0; c < g.cols; c++) row.push(g.raw(r * g.cols + c)); rows.push(row); } ctx.onSpill(rows); }
      v = isArr(v) ? v.data[0] : cellVal(v.cell(0));
      if (v instanceof FxError) throw v;
    }
    if (isArr(v)) v = deref(v);
    if (isRange(v)) v = cellVal(v.cell(0));
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

/** Every function the evaluator computes (formula.test.js keeps this list and callFn in step). */
export const FUNCTION_NAMES = ['ABS', 'AND', 'AVERAGE', 'AVERAGEIF', 'AVERAGEIFS', 'CHOOSE', 'COLUMN', 'COLUMNS', 'CONCAT', 'CONCATENATE', 'COUNT', 'COUNTA',
  'COUNTBLANK', 'COUNTIF', 'COUNTIFS', 'DATE', 'DAY', 'DAYS', 'EDATE', 'EOMONTH', 'EXACT', 'EXP', 'FALSE', 'FIND', 'FV', 'HLOOKUP', 'IF', 'IFERROR', 'IFNA',
  'HYPERLINK', 'IFS', 'INDEX', 'INT', 'IRR', 'ISBLANK', 'ISERR', 'ISERROR', 'ISFORMULA', 'ISLOGICAL', 'ISNA', 'ISNONTEXT', 'ISNUMBER', 'ISTEXT', 'LARGE', 'LEFT', 'LEN', 'LN', 'LOG',
  'LOG10', 'LOWER', 'MATCH', 'MAX', 'MAXIFS', 'MEDIAN', 'MID', 'MIN', 'MINIFS', 'MOD', 'MONTH', 'N', 'NA', 'NOT', 'NPV', 'OFFSET', 'OR', 'PERCENTILE', 'PERCENTILE.INC', 'PI', 'PMT',
  'POWER', 'PRODUCT', 'PROPER', 'PV', 'QUARTILE', 'QUARTILE.INC', 'RAND', 'RANK', 'RANK.EQ', 'REPT', 'RIGHT', 'ROUND', 'ROUNDDOWN', 'ROUNDUP', 'ROW', 'ROWS', 'RRI', 'SEARCH', 'SIGN',
  'SMALL', 'SQRT', 'SUBSTITUTE', 'SUM', 'SUMIF', 'SUMIFS', 'SUMPRODUCT', 'SWITCH', 'T', 'TEXT', 'TEXTJOIN', 'TODAY', 'TRIM', 'TRUE', 'TRUNC', 'UPPER',
  'VALUE', 'VLOOKUP', 'WEEKDAY', 'XLOOKUP', 'XOR', 'YEAR', 'YEARFRAC',
  'FILTER', 'ISFORMULA', 'PERCENTILE', 'PERCENTILE.INC', 'QUARTILE', 'QUARTILE.INC', 'REPLACE', 'RRI', 'SEQUENCE', 'SORT', 'TRANSPOSE', 'UNIQUE', 'XMATCH',
  'NETWORKDAYS.INTL', 'DATEDIF', 'RATE', 'NPER', 'ADDRESS', 'GETPIVOTDATA',
  'CEILING', 'FLOOR', 'DATEVALUE', 'NETWORKDAYS', 'XNPV', 'XIRR', 'PPMT', 'IPMT', 'INDIRECT', 'SUBTOTAL'];
/**
 * The functions Formula AutoComplete lists (M83): desktop Excel's catalogue, so =AV offers AVEDEV
 * first as Excel's list does; the evaluator's own set plus the common ones it does not compute.
 */
export const AUTOCOMPLETE_FUNCTIONS = [...new Set(FUNCTION_NAMES.concat(['ACOS', 'ADDRESS', 'AGGREGATE', 'ASIN', 'ATAN', 'ATAN2', 'AVEDEV', 'AVERAGEA', 'CEILING',
  'CEILING.MATH', 'CELL', 'CHAR', 'CHOOSECOLS', 'CHOOSEROWS', 'CLEAN', 'CODE', 'COMBIN', 'CORREL', 'COS', 'COUNTUNIQUEIFS', 'DATEDIF', 'DATEVALUE', 'DAYS360', 'DB', 'DDB',
  'DEGREES', 'DOLLAR', 'DROP', 'EFFECT', 'EVEN', 'EXPAND', 'FACT', 'FILTER', 'FIXED', 'FLOOR', 'FLOOR.MATH', 'FORECAST', 'FORMULATEXT', 'GCD', 'GROWTH', 'HOUR',
  'HSTACK', 'HYPERLINK', 'INDIRECT', 'INTERCEPT', 'IPMT', 'ISEVEN', 'ISFORMULA', 'ISODD', 'ISREF', 'LAMBDA', 'LCM', 'LET', 'LINEST', 'MINUTE', 'MIRR', 'MODE',
  'MROUND', 'NETWORKDAYS', 'NOMINAL', 'NOW', 'NPER', 'NUMBERVALUE', 'ODD', 'PERCENTILE', 'PERCENTRANK', 'PPMT', 'QUARTILE', 'QUOTIENT', 'RADIANS', 'RANDARRAY',
  'RANDBETWEEN', 'RATE', 'SECOND', 'SEQUENCE', 'SIN', 'SLN', 'SLOPE', 'SORT', 'SORTBY', 'STDEV', 'STDEV.P', 'STDEV.S', 'SUBTOTAL', 'SYD', 'TAKE', 'TAN',
  'TEXTAFTER', 'TEXTBEFORE', 'TEXTSPLIT', 'TIME', 'TIMEVALUE', 'TOCOL', 'TOROW', 'TRANSPOSE', 'TREND', 'TYPE', 'UNIQUE', 'VAR', 'VAR.P', 'VAR.S', 'VSTACK',
  'WORKDAY', 'XIRR', 'XMATCH', 'XNPV']))].filter(n => n !== 'TRUE' && n !== 'FALSE' && n !== 'COUNTUNIQUEIFS').sort();

/** True when text is a formula that parses. */
export function parses(expr) { try { parseFormula(expr); return true; } catch (e) { return false; } }

/* ============================================================================
   EVALUATE FORMULA (Formulas › Evaluate Formula, Alt M V) — a stepper over the AST
   ============================================================================ */
/** A value as formula text: 6, "ab", TRUE, #N/A, or {…} for an array (its first cells). */
export function valueText(v) {
  if (v === null || v === undefined) return '0';
  if (typeof v === 'number') return numToText(v);
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (isArr(v)) { const rows = v.toRows().slice(0, 3).map(r => r.slice(0, 5).map(valueText).join(',')); return '{' + rows.join(';') + (v.rows > 3 || v.cols > 5 ? ';…' : '') + '}'; }
  if (isErrVal(v)) return v;
  return '"' + String(v).replace(/"/g, '""') + '"';
}
/** The text of an AST, as the formula bar would show it (references upper-case, sheet names quoted when needed). `mark` wraps one node in \u0001…\u0002 so the caller can find its span. */
export function unparseAst(node, mark) {
  const sheetTxt = n => n ? (/^[A-Z_][A-Z0-9_.]*(:[A-Z_][A-Z0-9_.]*)?$/i.test(n) ? n : "'" + n.replace(/'/g, "''") + "'") + '!' : '';
  const u = n => {
    const t = (() => {
      switch (n.k) {
        case 'num': return numToText(n.v);
        case 'str': return '"' + n.v.replace(/"/g, '""') + '"';
        case 'bool': return n.v ? 'TRUE' : 'FALSE';
        case 'err': return n.v;
        case 'val': return valueText(n.v);
        case 'name': return n.v;
        case 'ref': return sheetTxt(n.sheet) + n.ref + (n.spill ? '#' : '');
        case 'range': return sheetTxt(n.sheet) + n.a + ':' + n.b;
        case 'colrange': return (n.absA ? '$' : '') + n.a + ':' + (n.absB ? '$' : '') + n.b;
        case 'rowrange': return (n.absA ? '$' : '') + n.a + ':' + (n.absB ? '$' : '') + n.b;
        case 'paren': return '(' + u(n.x) + ')';
        case 'un': return n.op + u(n.x);
        case 'pct': return u(n.x) + '%';
        case 'bin': return u(n.l) + n.op + u(n.r);
        case 'fn': return n.name + '(' + n.args.map(a => a === null ? '' : u(a)).join(',') + ')';
        default: return '';
      }
    })();
    return n === mark ? '\u0001' + t + '\u0002' : t;
  };
  return u(node);
}
const LEAF = new Set(['num', 'str', 'bool', 'err', 'val', 'range', 'colrange', 'rowrange', 'name']);
/** The next node Excel's Evaluate Formula underlines: the first unevaluated piece in evaluation order (arguments left to right, innermost first); null when only a value is left. */
function nextStep(node) {
  if (LEAF.has(node.k)) return null;
  if (node.k === 'ref') return node;   // a cell reference is the first thing shown as its value
  const kids = node.k === 'fn' ? node.args.filter(a => a !== null) : node.k === 'bin' ? [node.l, node.r] : [node.x];
  for (const kid of kids) { const n = nextStep(kid); if (n) return n; }
  return node.k === 'paren' ? null : node;   // brackets vanish once their inside is a value
}
function withoutParens(node) {   // (6) reads 6: a bracket around a value is dropped in the shown text
  if (node.k === 'paren' && LEAF.has(node.x.k)) return node.x;
  if (node.k === 'fn') node.args = node.args.map(a => a === null ? null : withoutParens(a));
  else if (node.k === 'bin') { node.l = withoutParens(node.l); node.r = withoutParens(node.r); }
  else if (node.k === 'paren' || node.k === 'un' || node.k === 'pct') node.x = withoutParens(node.x);
  return node;
}
/**
 * Evaluate Formula, as a stepper: `text` is the formula so far with the next piece to evaluate
 * between \u0001 and \u0002 (none once only the value is left); `step()` replaces that piece by its
 * value (Evaluate); `done` when nothing is left to evaluate. ctx is the sheet's evalCtx (with cell).
 */
export function evaluateStepper(formula, ctx) {
  let ast = withoutParens(parseFormula(formula));
  const st = {
    get done() { return nextStep(ast) === null; },
    get text() { const n = nextStep(ast); return '=' + unparseAst(ast, n); },
    get value() { const n = nextStep(ast); return n ? undefined : evalFormula(ast, ctx); },
    step() {
      const n = nextStep(ast); if (!n) return false;
      const sub = { k: 'paren', x: n };   // evaluate the piece on its own
      let rows = null; const v = evalFormula(sub, { ...ctx, onSpill: r => { rows = r; } });   // an array result stays an array for the piece around it
      n.k = 'val'; n.v = rows ? Arr.of(rows) : v; for (const key of ['args', 'l', 'r', 'x', 'name', 'ref', 'op']) delete n[key];
      ast = withoutParens(ast);
      return true;
    },
  };
  return st;
}

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

/** Row / column `n` wrapped onto a sheet `size` long: 0 is the last one, size + 1 the first — Excel's conditional-formatting references run round the sheet edge. */
export const wrapIndex = (n, size) => ((n - 1) % size + size) % size + 1;
/**
 * Shift relative references by (dr, dc) — what copy/paste and fill do. Absolute parts ($) stay.
 * A reference pushed off the sheet becomes one #REF! token (a range, A:A or 1:1 included, is a
 * unit: either corner off the sheet makes the whole reference #REF!). Text outside references is
 * preserved exactly. With `wrap` ({rows, cols}, the sheet's size) a reference pushed off the
 * sheet wraps round to its far edge instead, as Excel re-bases a conditional-formatting formula
 * (=$C1048575 for a reference two rows above row 1): the formula keeps working for every cell
 * where the reference exists.
 */
export function translateFormula(f, dr, dc, wrap) {
  const src = String(f);
  const eq = src.trimStart()[0] === '=';
  const body = eq ? src.slice(src.indexOf('=') + 1) : src;
  let toks; try { toks = tokenize(body); } catch (e) { return src; }
  const wrapRow = r => wrap ? wrapIndex(r, wrap.rows) : r, wrapCol = c => wrap ? wrapIndex(c, wrap.cols) : c;
  const shiftRef = ref => {   // null = off the sheet
    const m = /^(\$?)([A-Z]{1,3})(\$?)(\d+)$/.exec(ref);
    let c = colIndex(m[2]), r = +m[4];
    if (!m[1]) c = wrapCol(c + dc); if (!m[3]) r = wrapRow(r + dr);
    if (c < 1 || r < 1) return null;
    return m[1] + colLetter(c) + m[3] + r;
  };
  const shiftCol = t => { const abs = t.v[0] === '$'; const c = abs ? colIndex(t.v.slice(1)) : wrapCol(colIndex(t.v) + dc); return c < 1 ? null : (abs ? '$' : '') + colLetter(c); };
  const shiftRow = t => { const abs = body[t.pos] === '$'; const r = abs ? t.v : wrapRow(t.v + dr); return r < 1 ? null : (abs ? '$' : '') + r; };
  const pair = (a, b) => (a === null || b === null) ? '#REF!' : a + ':' + b;
  let out = '', last = 0;
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i], n1 = toks[i + 1], n2 = toks[i + 2];
    let rep = null, end = t.end;
    if (isColonTok(n1) && t.t === 'ref' && n2 && n2.t === 'ref') { rep = pair(shiftRef(t.v), shiftRef(n2.v)); if (t.sheetTxt && rep !== '#REF!') rep = t.sheetTxt + rep; end = n2.end; i += 2; }
    else if (isColonTok(n1) && isColTok(t) && isColTok(n2)) { rep = pair(shiftCol(t), shiftCol(n2)); end = n2.end; i += 2; }
    else if (isColonTok(n1) && isRowTok(t) && isRowTok(n2)) { rep = pair(shiftRow(t), shiftRow(n2)); end = n2.end; i += 2; }
    else if (t.t === 'ref') { rep = shiftRef(t.v); if (rep === null) rep = '#REF!'; else { if (t.sheetTxt) rep = t.sheetTxt + rep; if (t.spill) rep += '#'; } }
    if (rep !== null) { out += body.slice(last, t.pos) + rep; last = end; }
  }
  out += body.slice(last);
  return (eq ? '=' : '') + out;
}

/**
 * A formula copied from (sr, sc) and pasted Transposed at (tr, tc) (M68): a fully relative
 * reference turns with the block, its row offset becoming the column offset and back (=A1+B1 in
 * A2 pasted transposed into E1 reads =D1+D2 when the block A1:B2 landed at D1). An absolute or a
 * mixed reference moves as an ordinary paste would move it; a reference off the sheet is #REF!.
 */
export function transposeFormula(f, sr, sc, tr, tc) {
  const src = String(f);
  const eq = src.trimStart()[0] === '=';
  const body = eq ? src.slice(src.indexOf('=') + 1) : src;
  let toks; try { toks = tokenize(body); } catch (e) { return src; }
  const turn = ref => {
    const m = /^(\$?)([A-Z]{1,3})(\$?)(\d+)$/.exec(ref); if (!m) return ref;
    let c = colIndex(m[2]), r = +m[4];
    if (!m[1] && !m[3]) { const dr = r - sr, dc = c - sc; r = tr + dc; c = tc + dr; }
    else { if (!m[1]) c += tc - sc; if (!m[3]) r += tr - sr; }
    if (c < 1 || r < 1) return null;
    return m[1] + colLetter(c) + m[3] + r;
  };
  let out = '', last = 0;
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i], n1 = toks[i + 1], n2 = toks[i + 2];
    let rep = null, end = t.end;
    if (isColonTok(n1) && t.t === 'ref' && n2 && n2.t === 'ref') { const a = turn(t.v), b = turn(n2.v); rep = a === null || b === null ? '#REF!' : (t.sheetTxt || '') + a + ':' + b; end = n2.end; i += 2; }
    else if (t.t === 'ref') { const a = turn(t.v); rep = a === null ? '#REF!' : (t.sheetTxt || '') + a + (t.spill ? '#' : ''); }
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

/** Upper-case references, function names, TRUE/FALSE and error literals outside string literals. A sheet name keeps its spelling (=Sheet2!E2, never =ShEET2!E2): a reference never starts inside a name or ends at a '!'. */
export function normalizeFormula(str) {
  const s = String(str);
  const parts = s.split(/("(?:[^"]|"")*"|'(?:[^']|'')*')/);
  return parts.map((seg, k) => k % 2 ? seg : seg
    .replace(/(?<![A-Za-z0-9_.])(\$?[A-Za-z]{1,3}\$?)0*(\d+)(?![A-Za-z0-9_.!(])/g, (m, a, r) => (a + r).toUpperCase())
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
 * With `sheet` (a sheet name), the edit happened on that other sheet: only references qualified
 * with it move (Lists!$F$5:$F$10 on Summary, when a column goes into Lists), and this sheet's own
 * references stay where they are.
 */
export function adjustFormulaStructure(f, axis, at, delta, sheet = null) {
  const onSheet = sheet ? String(sheet).toUpperCase() : null;
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
      if (onSheet || (axis === 'c') !== col) continue;   // a column edit leaves 1:1 alone, a row edit leaves A:A alone
      const val = tk => col ? colIndex(tk.v.replace('$', '')) : tk.v;
      const pre = tk => (col ? tk.v[0] === '$' : body[tk.pos] === '$') ? '$' : '';
      const txt = v => col ? colLetter(v) : String(v);
      const va = val(t), vb = val(n2);
      const s = seam(Math.min(va, vb), Math.max(va, vb));
      if (!s) rep = '#REF!';
      else { const [x, y] = va <= vb ? s : [s[1], s[0]]; rep = pre(t) + txt(x) + ':' + pre(n2) + txt(y); }
    } else if (t.t !== 'ref' || (onSheet ? t.sheet !== onSheet : t.sheet)) { if (t.sheet && isColonTok(n1) && n2 && n2.t === 'ref') i += 2; continue; }
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
      if (t.sheetTxt && rep !== '#REF!') rep = t.sheetTxt + rep;
      end = n2.end; i += 2;
    } else {
      const a = parts(t.v);
      const n = adj(axis === 'r' ? a.r : a.c);
      if (n === null) rep = '#REF!';
      else { if (axis === 'r') a.r = n; else a.c = n; rep = build(a) + (t.spill ? '#' : ''); }
      if (t.sheetTxt && rep !== '#REF!') rep = t.sheetTxt + rep;
      end = t.end;
    }
    out += body.slice(last, t.pos) + rep; last = end;
  }
  out += body.slice(last);
  return (eq ? '=' : '') + out;
}
