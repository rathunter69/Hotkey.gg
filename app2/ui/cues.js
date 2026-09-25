// app2/ui/cues.js — the subtle on-sheet cues (experience pass, decision 4; the old build's
// flashing objective cell): on every Chapter 1 goal the target cell or range pulses once at
// goal start and fades; a Ribbon goal glows the tab, then the button, as the KeyTips are
// pressed. The pure parts (what to pulse, what to glow) are exported for the tests; the DOM
// parts add and remove one class and never touch the engine.
//
//   inferTarget(goal, sheetNames)     → 'A61' | 'E2:E13' | 'B5,B6' | { sheet:'Costs', ref:'B7' } | { sheet:'Sheet2', tab:true } | null
//   altPath(keys)                     → ['H','O','R'] for 'Alt H O R', [] when the goal is not a Ribbon route
//   pulseTarget(stageEl, target, cur) one pulse on the target's cells (or the sheet tab when it is elsewhere)
//   glowRibbon(ribbonEl, tokens, path, mode)  mark the next control the route wants

// a sheet name before '!' starts with a capital and is one word, or two ("Old wk37"); more would swallow the sentence
const REF_RX = /(?:([A-Z]\w*(?: \w+)?)!)?\$?([A-Z]{1,2})\$?(\d{1,3})(?::\$?([A-Z]{1,2})\$?(\d{1,3}))?/g;
const ROW_RX = /\brows?\s+(\d{1,3})(?:\s*(?:[–-]|to|:)\s*(\d{1,3}))?\b/i;
const COL_RX = /\bcolumn\s+([A-Z])\b/;
const COLS_RX = /(?:^|[^\w$!])\$?([A-Z]{1,2}):\$?([A-Z]{1,2})(?![\w$])/;   // A:A, D:F — a whole-column span
// what may sit between two references that form one list ("B5 and B6", "B5, B7 and D6")
const LIST_GAP = /^\s*(?:,\s*(?:and\s+)?|and\s+|&\s*)$/;
export const GRID_ROWS = 100;

/**
 * What a goal points at, from an explicit `target` or its text:
 *   'A61' | 'E2:E13'                a cell or range (the last one named: "from A3 to A7" means A7)
 *   'B5,B6'                         a list of cells named together ("B5 and B6"): one outline each
 *   { sheet: 'Costs', ref: 'B7' }   a reference qualified by its sheet ("Costs!B7", "On Costs, … B7")
 *   { sheet: 'Sheet2', tab: true }  no cell at all, but a sheet the goal is about: its tab is the target
 *   null                            nothing on the sheet to point at (a Ribbon route, a dialog)
 * "row 8", "rows 3–5", "column D" and "A:C" count as whole rows and columns. References inside a
 * formula the goal quotes ("reads =B4+C4+D4") are not targets. Pure.
 */
export function inferTarget(goal, sheetNames = []) {
  if (!goal) return null;
  if (typeof goal.target === 'string' && goal.target) return parseOne(goal.target) || null;
  const text = String(goal.text || '').replace(/=\S+/g, ' ');
  const hits = []; let m;
  REF_RX.lastIndex = 0;
  // a two-word "sheet" before '!' may be a word of the sentence plus the sheet ("Read Costs!B7")
  const sheetOf = q => { if (!q) return null; q = q.trim(); if (!sheetNames.length || sheetNames.includes(q)) return q; const w = q.split(' ').pop(); return sheetNames.includes(w) ? w : q; };
  while ((m = REF_RX.exec(text))) hits.push({ at: m.index, end: m.index + m[0].length, sheet: sheetOf(m[1]), ref: m[2] + m[3] + (m[4] ? ':' + m[4] + m[5] : '') });
  // a whole-column span ("delete column E", "E:E") wins over a stray cell only when it comes later
  const cs = COLS_RX.exec(text);
  if (cs) { const at = cs.index + cs[0].indexOf(cs[1]); if (!hits.length || at > hits[hits.length - 1].at) return `${cs[1]}1:${cs[2]}${GRID_ROWS}`; }
  let last = null;
  if (hits.length) {
    // the last reference, and every reference listed with it ("B5 and B6")
    let i = hits.length - 1; const group = [hits[i]];
    while (i > 0 && LIST_GAP.test(text.slice(hits[i - 1].end, hits[i].at)) && hits[i - 1].sheet === hits[i].sheet) { i--; group.unshift(hits[i]); }
    const ref = group.map(h => h.ref).join(',');
    last = group[0].sheet ? { sheet: group[0].sheet, ref } : ref;
  }
  if (last && typeof last === 'string' && sheetNames.length) {
    // "On Costs, land on E4", "walk the tabs to Costs and land on E4": a sheet reached before the
    // reference qualifies it (only after on/to/in/onto, so "copy Raw's total row" does not)
    const startAt = hits.length ? hits[hits.length - 1].at : text.length;
    let hit = null;
    for (const n of sheetNames) {
      const rx = new RegExp('\\b(?:[Oo]n|[Tt]o|[Ii]n|[Oo]nto)\\s+(?:the\\s+)?' + esc(n) + '(?![\\w’\'])', 'g'); let mm;
      while ((mm = rx.exec(text))) if (mm.index < startAt && (!hit || mm.index > hit.at)) hit = { at: mm.index, n };
    }
    if (hit) last = { sheet: hit.n, ref: last };
  }
  if (last) return last;
  const r = ROW_RX.exec(text); if (r) return `A${r[1]}:Z${r[2] || r[1]}`;
  const c = COL_RX.exec(text); if (c) return `${c[1]}1:${c[1]}${GRID_ROWS}`;
  // no cell: a sheet the goal names is the target, cued on its tab ("rename Sheet2", "move Report to the front")
  // the last sheet named is where the goal ends ("Ctrl+PgDn to Costs, Ctrl+PgUp back to Report")
  let tab = null;
  for (const n of sheetNames) { const rx = new RegExp('(?:^|[^\\w])' + esc(n) + '(?![\\w])', 'g'); let mm; while ((mm = rx.exec(text))) if (!tab || mm.index > tab.at) tab = { at: mm.index, n }; }
  return tab ? { sheet: tab.n, tab: true } : null;
}
const esc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function parseOne(s) {
  const str = String(s);
  const cs = /^\$?([A-Z]{1,2}):\$?([A-Z]{1,2})$/.exec(str); if (cs) return `${cs[1]}1:${cs[2]}${GRID_ROWS}`;
  const refs = []; let sheet = null, m; REF_RX.lastIndex = 0;
  while ((m = REF_RX.exec(str))) { if (m[1]) sheet = m[1].trim(); refs.push(m[2] + m[3] + (m[4] ? ':' + m[4] + m[5] : '')); }
  if (!refs.length) return null;
  return sheet ? { sheet, ref: refs.join(',') } : refs.join(',');
}

/** The KeyTip letters of a goal's route: 'Alt H O R "Inputs" ↵' → ['H','O','R']; a non-Ribbon route → []. Pure. */
export function altPath(keys) {
  const toks = String(keys || '').split(/\s+/).filter(Boolean);
  const i = toks.findIndex(t => t === 'Alt' || t === '⌥');
  if (i < 0) return [];
  const out = [];
  for (const t of toks.slice(i + 1)) { if (/^[A-Z0-9]{1,2}$/.test(t)) out.push(t.toUpperCase()); else break; }
  return out;
}

const colNum = s => { let n = 0; for (const ch of s) n = n * 26 + (ch.charCodeAt(0) - 64); return n; };
/** The (r, c) pairs of a ref or range, capped so a whole-column cue never touches 2,600 cells. */
export function cellsOf(ref, cap = 240) {
  const m = /^([A-Z]{1,2})(\d{1,3})(?::([A-Z]{1,2})(\d{1,3}))?$/.exec(String(ref || ''));
  if (!m) return [];
  const c1 = colNum(m[1]), r1 = +m[2], c2 = m[3] ? colNum(m[3]) : c1, r2 = m[4] ? +m[4] : r1;
  const out = [];
  for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) { if (out.length >= cap) return out; out.push([r, c]); }
  return out;
}

/** The union of two cell boxes ({ left, top, width, height }): the range's perimeter. Pure. */
export function rangeBox(a, b) {
  if (!a) return b || null; if (!b) return a;
  const left = Math.min(a.left, b.left), top = Math.min(a.top, b.top);
  return { left, top, width: Math.max(a.left + a.width, b.left + b.width) - left, height: Math.max(a.top + a.height, b.top + b.height) - top };
}
/** The first and last cell of a ref or range: ['A1', 'C4'] (a single cell twice). Pure. */
export function rangeCorners(ref) {
  const m = /^([A-Z]{1,2})(\d{1,3})(?::([A-Z]{1,2})(\d{1,3}))?$/.exec(String(ref || ''));
  if (!m) return null;
  return [m[1] + m[2], m[3] ? m[3] + m[4] : m[1] + m[2]];
}

/** The ranges of a target ref: 'B5,B6:B8' → ['B5', 'B6:B8']. Pure. */
export const rangesOf = ref => String(ref || '').split(',').map(x => x.trim()).filter(Boolean);
/** A target's sheet and ref, whatever shape inferTarget gave it: { sheet | null, ref | null, tab }. Pure. */
export function targetParts(target) {
  if (!target) return { sheet: null, ref: null, tab: false };
  if (typeof target === 'string') return { sheet: null, ref: target, tab: false };
  return { sheet: target.sheet || null, ref: target.ref || null, tab: !!target.tab };
}
const sameSheet = (a, b) => !a || !b || String(a).toLowerCase() === String(b).toLowerCase();

/**
 * The boxes of a target on the sheet that is showing, in .gridwrap content pixels: one per range
 * (a list of cells gives several), or [] when the target is a tab, is on another sheet, or has no
 * painted cells. `view` is the SheetView (cellRect). Reads layout; changes nothing.
 */
export function targetBoxes(view, target, activeSheet) {
  const { sheet, ref, tab } = targetParts(target);
  if (!view || !ref || tab || !sameSheet(sheet, activeSheet)) return [];
  const out = [];
  for (const one of rangesOf(ref)) {
    const corners = rangeCorners(one); if (!corners) continue;
    const box = rangeBox(view.cellRect(corners[0]), view.cellRect(corners[1]));
    if (box) out.push(box);
  }
  return out;
}
/** The union of boxes (the card keeps clear of all of them), or null. Pure. */
export const unionBox = boxes => (boxes || []).reduce((u, b) => rangeBox(u, b), null);

/**
 * Pulse the target once: ONE outline around each range's perimeter (B7 — never per-cell borders),
 * drawn as an overlay inside the sheet's scroll box like the marquee; or the sheet's tab when the
 * target is a sheet, or sits on another sheet. `view` is the SheetView (cellRect + gw);
 * `activeSheet` the current sheet name; `tabsEl` the sheet-tabs strip. Returns the union box it
 * drew, 'tab', or null.
 */
export function pulseTarget(view, target, activeSheet, tabsEl) {
  if (!view || !target) return null;
  const { sheet, tab } = targetParts(target);
  if (sheet && (tab || !sameSheet(sheet, activeSheet))) {
    if (tab && sameSheet(sheet, activeSheet)) return 'tab';   // already there: nothing to point at
    const t = tabsEl && [...tabsEl.querySelectorAll('.wb-tab')].find(x => x.textContent.trim().toLowerCase() === sheet.toLowerCase());
    if (t) { restart(t, 'cue-pulse'); return 'tab'; }
    return null;
  }
  const boxes = targetBoxes(view, target, activeSheet);
  if (!boxes.length || !view.gw) return null;
  clearPulse(view.gw);
  for (const box of boxes) {
    const ring = document.createElement('div');
    ring.className = 'cue-ring'; ring.setAttribute('aria-hidden', 'true');
    ring.style.left = box.left + 'px'; ring.style.top = box.top + 'px'; ring.style.width = box.width + 'px'; ring.style.height = box.height + 'px';
    view.gw.appendChild(ring);
    ring.addEventListener('animationend', () => ring.remove(), { once: true });
    setTimeout(() => ring.remove(), 2200);
  }
  return unionBox(boxes);
}
function restart(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
/** Take every pulse off (a new goal, a restart). */
export function clearPulse(rootEl) { if (rootEl) for (const el of rootEl.querySelectorAll('.cue-pulse, .cue-ring')) { if (el.classList.contains('cue-ring')) el.remove(); else el.classList.remove('cue-pulse'); } }

/**
 * Where the floating panel goes (B4, Wolf 2026-09-23; second pass C2): adjacent to the goal's
 * target, a cell or two away (one cell when the box is tight), on the side that covers the least
 * of what the learner is reading — preferring right of the target, then below, then left, then
 * above when they cover the same; never over the target, never over the row and column headers
 * (the box's x0/y0), never off the visible sheet. Pure.
 *   box     { w, h, x0, y0 }: the visible scroll box in its own pixels; the data area starts at (x0, y0)
 *   target  { left, top, width, height } in box pixels (scrolled), or null when the goal has no cell target
 *   panel   { w, h }
 *   opts    gapX (default 96 ≈ 1.5 cells), gapY (40 = 2 rows), pad (12: the margin to the box's far edges),
 *           prefer (a side Ctrl+Shift+J asked for: taken whenever it fits), ribbon ({ left, right } of the
 *           glowing Ribbon control in box pixels: the card docks under the bar beside it),
 *           keep ({ side, rect } of the current placement: kept while nothing better is on offer, so the
 *           card does not hop), obstacles ([{ left, top, width, height }]: the filled cells showing — what
 *           the learner is reading; the card covers as few as it can)
 *   → { side: 'right' | 'below' | 'left' | 'above' | 'ribbon' | 'free', rect: { left, top, width, height }, covers }
 */
export const SIDES = ['right', 'below', 'left', 'above'];
const overlaps = (a, b) => a.left < b.left + b.width && a.left + a.width > b.left && a.top < b.top + b.height && a.top + a.height > b.top;
/** How many of the obstacles a rect covers. Pure. */
export const coverage = (r, obstacles) => (obstacles || []).reduce((n, o) => n + (overlaps(r, o) ? 1 : 0), 0);
export function placeNear(box, target, panel, opts = {}) {
  const gapX = opts.gapX == null ? 96 : opts.gapX, gapY = opts.gapY == null ? 40 : opts.gapY, pad = opts.pad == null ? 12 : opts.pad;
  const x0 = box.x0 || 0, y0 = box.y0 || 0;
  const obstacles = opts.obstacles || [];
  const w = Math.min(panel.w, Math.max(0, box.w - x0 - pad)), h = Math.min(panel.h, Math.max(0, box.h - y0 - pad));
  const maxL = box.w - pad - w, maxT = box.h - pad - h;
  const cx = v => Math.max(x0, Math.min(maxL, v)), cy = v => Math.max(y0, Math.min(maxT, v));
  const rect = (left, top) => ({ left, top, width: w, height: h });
  const inside = r => r.left >= x0 && r.top >= y0 && r.left + r.width <= box.w - pad + 1e-9 && r.top + r.height <= box.h - pad + 1e-9;
  const done = (side, r) => ({ side, rect: r, covers: coverage(r, obstacles) });
  // the fewest filled cells covered; ties go to the earliest candidate (the preference order)
  const best = cands => cands.reduce((b, c) => { const n = coverage(c.rect, obstacles); return !b || n < b.covers ? { ...c, covers: n } : b; }, null);
  const prefer = (opts.prefer || []).filter(x => SIDES.includes(x));
  // a target partly off the box is clipped to the data area; one wholly off it is no target
  let t = null;
  if (target) {
    const l = Math.max(x0, target.left), tp = Math.max(y0, target.top), r = Math.min(box.w, target.left + target.width), b = Math.min(box.h, target.top + target.height);
    if (r > l && b > tp) t = { left: l, top: tp, width: r - l, height: b - tp };
  }
  const keep = opts.keep && opts.keep.rect && inside(opts.keep.rect) && !(t && overlaps(opts.keep.rect, t)) ? { side: opts.keep.side || 'free', rect: { ...opts.keep.rect } } : null;
  if (!t) {
    if (opts.ribbon && Number.isFinite(opts.ribbon.left) && Number.isFinite(opts.ribbon.right)) {
      const cands = [];
      if (opts.ribbon.right + 16 <= maxL) cands.push({ side: 'ribbon', rect: rect(opts.ribbon.right + 16, y0 + pad) });
      if (opts.ribbon.left - 16 - w >= x0) cands.push({ side: 'ribbon', rect: rect(opts.ribbon.left - 16 - w, y0 + pad) });
      if (!cands.length) cands.push({ side: 'ribbon', rect: rect(cx(opts.ribbon.left), y0 + pad) });
      return best(cands);
    }
    // nothing to sit beside: stay put unless a corner covers less of the sheet
    const corners = [rect(maxL, y0 + pad), rect(x0 + pad <= maxL ? x0 + pad : x0, y0 + pad), rect(maxL, maxT), rect(x0 + pad <= maxL ? x0 + pad : x0, maxT)].map(r => ({ side: 'free', rect: r }));
    return best(keep ? [keep, ...corners] : corners);
  }
  // two passes: the full gap (a cell and a half / two rows), then the one-cell gap when the box is tight
  const cands = [];
  for (const [gx, gy] of [[gapX, gapY], [Math.min(gapX, 64), Math.min(gapY, 20)]]) {
    for (const side of SIDES) {
      let r = null;
      if (side === 'right') { const l = t.left + t.width + gx; if (l <= maxL) r = rect(l, cy(t.top)); }
      else if (side === 'below') { const tp = t.top + t.height + gy; if (tp <= maxT) r = rect(cx(t.left), tp); }
      else if (side === 'left') { const l = t.left - gx - w; if (l >= x0) r = rect(l, cy(t.top)); }
      else if (side === 'above') { const tp = t.top - gy - h; if (tp >= y0) r = rect(cx(t.left), tp); }
      if (r && inside(r)) cands.push({ side, rect: r });
    }
    const asked = prefer.length && cands.find(c => c.side === prefer[0]);
    if (asked) return done(asked.side, asked.rect);
    if (cands.length && !obstacles.length) return done(cands[0].side, cands[0].rect);
  }
  if (cands.length) return best(cands);
  // nothing fits beside it (the target fills the view): the corner farthest from its centre
  const tc = { x: t.left + t.width / 2, y: t.top + t.height / 2 };
  let far = null;
  for (const [l, tp] of [[maxL, y0 + pad], [x0, y0 + pad], [maxL, maxT], [x0, maxT]]) {
    const r = rect(l, tp); const d = Math.hypot(l + w / 2 - tc.x, tp + h / 2 - tc.y);
    if (!far || d > far.d) far = { d, r };
  }
  return done('free', far.r);
}

/**
 * Glow the next control on a Ribbon route. Before Alt: the tab the route needs. While walking:
 * the control whose KeyTip badge matches what is left of the route (a prefix match, so 'FC'
 * lights the Font Color badge and not 'FF'). Returns the number of elements glowing.
 */
export function glowRibbon(ribbonEl, tokens, path, mode, dropEl) {
  if (!ribbonEl) return 0;
  for (const el of [ribbonEl, dropEl]) if (el) for (const x of el.querySelectorAll('.cue-glow')) x.classList.remove('cue-glow');
  if (!tokens || !tokens.length) return 0;
  const walked = Array.isArray(path) ? path.map(p => String(p).toUpperCase()) : [];
  if (walked.length >= tokens.length) return 0;
  let n = 0;
  if (mode !== 'ribbon' || !walked.length) {
    // the tab first: the full bar's tab button, or the slim strip's chip
    const tab = ribbonEl.querySelector(`.rf-tab[data-tab="${tokens[0]}"]`) || [...ribbonEl.querySelectorAll('.rtab')].find(t => (t.querySelector('k') || {}).textContent === tokens[0]);
    if (tab) { tab.classList.add('cue-glow'); n++; }
    return n;
  }
  const rest = tokens.slice(walked.length).join('');
  const scopes = [dropEl, ribbonEl].filter(Boolean);
  for (const scope of scopes) {
    for (const badge of scope.querySelectorAll('.ri-key')) {
      const t = badge.textContent.trim().toUpperCase();
      if (!t || t.length > rest.length || rest.slice(0, t.length) !== t) continue;
      const host = badge.closest('.rf-btn, .rf-split, .rf-box, .rdrop-item, .ri-cmd, .rf-grpbtn, .rf-launch') || badge;
      host.classList.add('cue-glow'); n++;
    }
    if (n) break;   // the open menu wins over the bar behind it
  }
  return n;
}
