// app2/ui/cues.js — the subtle on-sheet cues (experience pass, decision 4; the old build's
// flashing objective cell): on every Chapter 1 goal the target cell or range pulses once at
// goal start and fades; a Ribbon goal glows the tab, then the button, as the KeyTips are
// pressed. The pure parts (what to pulse, what to glow) are exported for the tests; the DOM
// parts add and remove one class and never touch the engine.
//
//   inferTarget(goal)                 → 'A61' | 'E2:E13' | { sheet:'Costs', ref:'B7' } | null
//   altPath(keys)                     → ['H','O','R'] for 'Alt H O R', [] when the goal is not a Ribbon route
//   pulseTarget(stageEl, target, cur) one pulse on the target's cells (or the sheet tab when it is elsewhere)
//   glowRibbon(ribbonEl, tokens, path, mode)  mark the next control the route wants

// a sheet name before '!' starts with a capital and is one word, or two ("Old wk37"); more would swallow the sentence
const REF_RX = /(?:([A-Z]\w*(?: \w+)?)!)?\$?([A-Z]{1,2})\$?(\d{1,3})(?::\$?([A-Z]{1,2})\$?(\d{1,3}))?/g;
const ROW_RX = /\brow\s+(\d{1,3})\b/i;
const COL_RX = /\bcolumn\s+([A-Z])\b/;

/**
 * The cell or range a goal names, from an explicit `target` or the last reference in its text
 * (a goal reads "from A3 to A7": the destination comes last). A sheet-qualified reference keeps
 * its sheet. "row 8" and "column D" count as a row or column. Pure.
 */
export function inferTarget(goal, sheetNames = []) {
  if (!goal) return null;
  if (typeof goal.target === 'string' && goal.target) return parseOne(goal.target) || null;
  // references inside a formula the goal quotes ("read =B4+C4+D4") are not targets
  const text = String(goal.text || '').replace(/=\S+/g, ' ');
  let last = null, m;
  REF_RX.lastIndex = 0;
  while ((m = REF_RX.exec(text))) {
    const ref = m[2] + m[3] + (m[4] ? ':' + m[4] + m[5] : '');
    last = m[1] ? { sheet: m[1].trim(), ref } : ref;
  }
  if (last && typeof last === 'string' && sheetNames.length) {
    // "On Costs, land on E4": the sheet named in passing qualifies the cell
    const on = /\b(?:[Oo]n|[Tt]o|[Ii]n|[Oo]f)\s+([A-Z][\w ]{0,20}?)(?=[,:;.!]|\s+(?:sheet|tab)\b)/.exec(text);
    const hit = on && sheetNames.find(n => n.toLowerCase() === on[1].trim().toLowerCase());
    if (hit) last = { sheet: hit, ref: last };
  }
  if (last) return last;
  const r = ROW_RX.exec(text); if (r) return `A${r[1]}:Z${r[1]}`;
  const c = COL_RX.exec(text); if (c) return `${c[1]}1:${c[1]}100`;
  return null;
}
function parseOne(s) { REF_RX.lastIndex = 0; const m = REF_RX.exec(String(s)); if (!m) return null; const ref = m[2] + m[3] + (m[4] ? ':' + m[4] + m[5] : ''); return m[1] ? { sheet: m[1].trim(), ref } : ref; }

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

/**
 * Pulse the target once: ONE outline around the range's perimeter (B7 — never per-cell borders),
 * drawn as an overlay inside the sheet's scroll box like the marquee; or the sheet's tab when the
 * target is on another sheet. `view` is the SheetView (cellRect + gw); `activeSheet` the current
 * sheet name; `tabsEl` the sheet-tabs strip. Returns the box it drew (or 'tab' / null).
 */
export function pulseTarget(view, target, activeSheet, tabsEl) {
  if (!view || !target) return null;
  const ref = typeof target === 'string' ? target : target.ref;
  const sheet = typeof target === 'string' ? null : target.sheet;
  if (sheet && activeSheet && sheet.toLowerCase() !== String(activeSheet).toLowerCase()) {
    const tab = tabsEl && [...tabsEl.querySelectorAll('.wb-tab')].find(t => t.textContent.trim().toLowerCase() === sheet.toLowerCase());
    if (tab) { restart(tab, 'cue-pulse'); return 'tab'; }
    return null;
  }
  const corners = rangeCorners(ref); if (!corners) return null;
  const box = rangeBox(view.cellRect(corners[0]), view.cellRect(corners[1]));
  if (!box || !view.gw) return null;
  clearPulse(view.gw);
  const ring = document.createElement('div');
  ring.className = 'cue-ring'; ring.setAttribute('aria-hidden', 'true');
  ring.style.left = box.left + 'px'; ring.style.top = box.top + 'px'; ring.style.width = box.width + 'px'; ring.style.height = box.height + 'px';
  view.gw.appendChild(ring);
  ring.addEventListener('animationend', () => ring.remove(), { once: true });
  setTimeout(() => ring.remove(), 2200);
  return box;
}
function restart(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
/** Take every pulse off (a new goal, a restart). */
export function clearPulse(rootEl) { if (rootEl) for (const el of rootEl.querySelectorAll('.cue-pulse, .cue-ring')) { if (el.classList.contains('cue-ring')) el.remove(); else el.classList.remove('cue-pulse'); } }

/**
 * Where the floating panel goes (B4, Wolf 2026-09-23): adjacent to the goal's target, a cell or
 * two away (one cell when the box is tight), preferring right of it, then below, then left, then above; never over the target,
 * never over the row and column headers (the box's x0/y0), never off the visible sheet. Pure.
 *   box     { w, h, x0, y0 }: the visible scroll box in its own pixels; the data area starts at (x0, y0)
 *   target  { left, top, width, height } in box pixels (scrolled), or null when the goal has no cell target
 *   panel   { w, h }
 *   opts    gapX (default 96 ≈ 1.5 cells), gapY (40 = 2 rows), pad (12: the margin to the box's far edges),
 *           prefer (the side order; the first entry is what Ctrl+Shift+J asked for), ribbon ({ left, right }
 *           of the glowing Ribbon group in box pixels: the card docks under it, beside the group),
 *           keep ({ side, rect } of the current placement: kept while there is no target to dock to)
 *   → { side: 'right' | 'below' | 'left' | 'above' | 'ribbon' | 'free', rect: { left, top, width, height } }
 */
export const SIDES = ['right', 'below', 'left', 'above'];
export function placeNear(box, target, panel, opts = {}) {
  const gapX = opts.gapX == null ? 96 : opts.gapX, gapY = opts.gapY == null ? 40 : opts.gapY, pad = opts.pad == null ? 12 : opts.pad;
  const x0 = box.x0 || 0, y0 = box.y0 || 0;
  const w = Math.min(panel.w, Math.max(0, box.w - x0 - pad)), h = Math.min(panel.h, Math.max(0, box.h - y0 - pad));
  const maxL = box.w - pad - w, maxT = box.h - pad - h;
  const cx = v => Math.max(x0, Math.min(maxL, v)), cy = v => Math.max(y0, Math.min(maxT, v));
  const rect = (left, top) => ({ left, top, width: w, height: h });
  const inside = r => r.left >= x0 && r.top >= y0 && r.left + r.width <= box.w - pad + 1e-9 && r.top + r.height <= box.h - pad + 1e-9;
  // a target partly off the box is clipped to the data area; one wholly off it is no target
  let t = null;
  if (target) {
    const l = Math.max(x0, target.left), tp = Math.max(y0, target.top), r = Math.min(box.w, target.left + target.width), b = Math.min(box.h, target.top + target.height);
    if (r > l && b > tp) t = { left: l, top: tp, width: r - l, height: b - tp };
  }
  if (!t) {
    if (opts.ribbon && Number.isFinite(opts.ribbon.left) && Number.isFinite(opts.ribbon.right)) {
      const right = opts.ribbon.right + 16, left = opts.ribbon.left - 16 - w;
      const l = right <= maxL ? right : left >= x0 ? left : cx(opts.ribbon.left);
      return { side: 'ribbon', rect: rect(l, y0 + pad) };
    }
    if (opts.keep && opts.keep.rect && inside(opts.keep.rect)) return { side: opts.keep.side || 'free', rect: { ...opts.keep.rect } };
    return { side: 'free', rect: rect(maxL, y0 + pad) };
  }
  const order = [...(opts.prefer || []), ...SIDES].filter((s, i, a) => SIDES.includes(s) && a.indexOf(s) === i);
  // two passes: the full gap (a cell and a half / two rows), then the one-cell gap when the box is tight
  for (const [gx, gy] of [[gapX, gapY], [Math.min(gapX, 64), Math.min(gapY, 20)]]) {
    for (const side of order) {
      let r = null;
      if (side === 'right') { const l = t.left + t.width + gx; if (l <= maxL) r = rect(l, cy(t.top)); }
      else if (side === 'below') { const tp = t.top + t.height + gy; if (tp <= maxT) r = rect(cx(t.left), tp); }
      else if (side === 'left') { const l = t.left - gx - w; if (l >= x0) r = rect(l, cy(t.top)); }
      else if (side === 'above') { const tp = t.top - gy - h; if (tp >= y0) r = rect(cx(t.left), tp); }
      if (r && inside(r)) return { side, rect: r };
    }
  }
  // nothing fits beside it (the target fills the view): the corner farthest from its centre
  const tc = { x: t.left + t.width / 2, y: t.top + t.height / 2 };
  let best = null;
  for (const [l, tp] of [[maxL, y0 + pad], [x0, y0 + pad], [maxL, maxT], [x0, maxT]]) {
    const r = rect(l, tp); const d = Math.hypot(l + w / 2 - tc.x, tp + h / 2 - tc.y);
    if (!best || d > best.d) best = { d, r };
  }
  return { side: 'free', rect: best.r };
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
