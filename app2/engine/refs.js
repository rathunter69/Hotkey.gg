// app2/engine/refs.js — A1-style reference helpers. Pure functions, no state, no DOM.
//
// The old build (index.html r2840 / r24049) only understood single-letter columns
// (`String.fromCharCode(64+c)` and `charCodeAt(0)-64`), so AA1 parsed as A1. These
// helpers handle any column width, Excel-style (A..Z, AA..ZZ, ...).

/** 1 → 'A', 26 → 'Z', 27 → 'AA'. */
export function colLetter(c) {
  let n = c | 0, s = '';
  if (n < 1) return '';
  while (n > 0) { n -= 1; s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26); }
  return s;
}

/** 'A' → 1, 'Z' → 26, 'AA' → 27. Case-insensitive. */
export function colIndex(letters) {
  let n = 0;
  for (const ch of String(letters).toUpperCase()) {
    const d = ch.charCodeAt(0) - 64;
    if (d < 1 || d > 26) return 0;
    n = n * 26 + d;
  }
  return n;
}

const REF_ONE = /^\s*(\$?)([A-Za-z]{1,3})(\$?)(\d+)\s*$/;

/**
 * Parse one cell reference. '$A$1', 'a1' → {r:1, c:1, absR:true, absC:true}; null if malformed.
 * Row 0 and column beyond 'ZZZ' are rejected.
 */
export function parseRef(ref) {
  const m = REF_ONE.exec(String(ref));
  if (!m) return null;
  const c = colIndex(m[2]), r = parseInt(m[4], 10);
  if (!c || !r) return null;
  return { r, c, absC: m[1] === '$', absR: m[3] === '$' };
}

/** Canonical key for a row/column pair: (1,1) → 'A1'. */
export function refKey(r, c) { return colLetter(c) + r; }

/** Uppercase, strip $ signs: '$a$1' → 'A1'. Returns null if not a reference. */
export function normRef(ref) { const p = parseRef(ref); return p ? refKey(p.r, p.c) : null; }

/**
 * Parse 'A1:B3' (or a single 'A1') into a normalised rectangle {r1,c1,r2,c2} with r1<=r2, c1<=c2.
 * Returns null if either corner is malformed.
 */
export function parseRange(str) {
  const parts = String(str).split(':');
  if (parts.length > 2) return null;
  const a = parseRef(parts[0]), b = parts.length === 2 ? parseRef(parts[1]) : a;
  if (!a || !b) return null;
  return { r1: Math.min(a.r, b.r), c1: Math.min(a.c, b.c), r2: Math.max(a.r, b.r), c2: Math.max(a.c, b.c) };
}

/** Every cell key inside the rectangle spanned by two corner refs, row-major. */
export function rangeRefs(a, b) {
  const rg = parseRange(a + ':' + (b || a));
  if (!rg) return [];
  const out = [];
  for (let r = rg.r1; r <= rg.r2; r++) for (let c = rg.c1; c <= rg.c2; c++) out.push(refKey(r, c));
  return out;
}

/** Every cell key inside a {r1,c1,r2,c2} rectangle, row-major. */
export function rectRefs(rg) {
  const out = [];
  for (let r = rg.r1; r <= rg.r2; r++) for (let c = rg.c1; c <= rg.c2; c++) out.push(refKey(r, c));
  return out;
}

/** 'A1:B3' text for a rectangle; a 1×1 rectangle prints as a single ref. */
export function rangeText(rg) {
  const a = refKey(rg.r1, rg.c1), b = refKey(rg.r2, rg.c2);
  return a === b ? a : a + ':' + b;
}

/** Global regex that finds refs and ranges inside formula text (used for highlighting only). */
export const REF_RX = /(\$?[A-Za-z]{1,3}\$?\d+)(?::(\$?[A-Za-z]{1,3}\$?\d+))?/g;
