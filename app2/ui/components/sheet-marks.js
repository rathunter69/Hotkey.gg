// app2/ui/components/sheet-marks.js — the four ways the sheet talks besides the card (screenplay
// 3.0 "Five ways the sheet talks"; M90). Each form means one thing and is drawn once, here, as an
// overlay inside the sheet's scroll box (so it scrolls with the cells) from rects in content pixels:
//
//   the target   a dashed outline in the lesson's mode color with a faint fill, until the goal lands
//   the note     Excel's own note: a pale yellow box tied to its cell by a line, a red corner on the
//                cell, one or two lines; it stays until the next goal or Esc, and the card never covers it
//   the nudge    no text box: the target pulses and a small pill on it shows the next key
//   the pen      a red outline drawn as a reviewer's mark around the cell, with the rule's chip and
//                the correction line beside it (section 7)
//   the check    the checks cell itself: the difference showing, then a zero, then green
//
//   paintTarget(gw, boxes, { nudgeKey })   → the outline elements
//   paintNote(gw, cellRect, text, box)     → { el, rect }: the note, and where it sits (the card keeps off it)
//   paintPen(gw, cellRect, chip, line)     → the pen's elements
//   paintCheck(gw, cellRect, state)        → the check mark ('diff' | 'zero' | 'ok')
//   pingMark(gw, cellRect)                 → the ring the cursor-ping moment grows out of the active cell
//   beaconPlace(target, view, size)        → where the off-screen target's pill sits on the sheet's edge (pure)
//   paintBeacon(gw, target, view, label)   → the pill ("A61 ↓"), or nothing when the target shows
//   clearMarks(gw, kind?)                  take a kind off, or every mark
//   notePlace(cellRect, box, size)         → where the note goes (pure; right of the cell, else left, else below)
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const KINDS = ['target', 'note', 'pen', 'check', 'ping', 'beacon'];

function mark(gw, kind, rect, cls) {
  const d = document.createElement('div');
  d.className = 'sm sm-' + kind + (cls ? ' ' + cls : ''); d.dataset.mark = kind; d.setAttribute('aria-hidden', 'true');
  if (rect) { d.style.left = rect.left + 'px'; d.style.top = rect.top + 'px'; d.style.width = rect.width + 'px'; d.style.height = rect.height + 'px'; }
  gw.appendChild(d);
  return d;
}
export function clearMarks(gw, kind) {
  if (!gw) return;
  for (const d of gw.querySelectorAll(kind ? `.sm[data-mark="${kind}"]` : '.sm')) d.remove();
}

/** The target: one dashed outline per range; with `nudgeKey` the outline pulses and carries a pill with the next key. */
export function paintTarget(gw, boxes, opts = {}) {
  clearMarks(gw, 'target');
  if (!gw) return [];
  const out = [];
  (boxes || []).forEach((b, i) => {
    const d = mark(gw, 'target', b, opts.nudgeKey ? 'sm-nudge' : '');
    if (opts.nudgeKey && i === 0) { const pill = document.createElement('kbd'); pill.className = 'sm-pill'; pill.textContent = opts.nudgeKey; d.appendChild(pill); }
    out.push(d);
  });
  return out;
}

/**
 * Where a note goes, in content pixels: to the right of its cell when the box has the room, else to
 * the left, else below. `box` is { w, h, x0, y0, scrollLeft, scrollTop } (the visible box); `size` the
 * note's { w, h }. Pure.
 */
export function notePlace(cell, box, size = { w: 240, h: 44 }) {
  const gap = 24, pad = 8;
  const viewRight = (box.scrollLeft || 0) + box.w, viewBottom = (box.scrollTop || 0) + box.h;
  if (cell.left + cell.width + gap + size.w <= viewRight - pad) return { left: cell.left + cell.width + gap, top: Math.max((box.scrollTop || 0) + (box.y0 || 0), cell.top - 8), width: size.w, height: size.h, side: 'right' };
  if (cell.left - gap - size.w >= (box.scrollLeft || 0) + (box.x0 || 0)) return { left: cell.left - gap - size.w, top: Math.max((box.scrollTop || 0) + (box.y0 || 0), cell.top - 8), width: size.w, height: size.h, side: 'left' };
  return { left: Math.min(cell.left, viewRight - pad - size.w), top: Math.min(cell.top + cell.height + 12, viewBottom - pad - size.h), width: size.w, height: size.h, side: 'below' };
}

/** The note: the red corner on the cell, the line, the yellow box. Returns the box's rect so the card keeps off it. */
export function paintNote(gw, cell, text, box) {
  clearMarks(gw, 'note');
  if (!gw || !cell || !text) return null;
  mark(gw, 'note', cell, 'sm-note-corner');
  const probe = mark(gw, 'note', { left: 0, top: 0, width: 240, height: 0 }, 'sm-note-box sm-probe');
  probe.innerHTML = esc(text);
  probe.style.height = 'auto';
  const size = { w: 240, h: probe.offsetHeight || 44 };
  probe.remove();
  const at = notePlace(cell, box, size);
  const line = mark(gw, 'note', null, 'sm-note-line');
  // the line from the cell's corner to the box's near edge
  const x1 = at.side === 'left' ? cell.left : cell.left + cell.width, y1 = cell.top + 2;
  const x2 = at.side === 'right' ? at.left : at.side === 'left' ? at.left + at.width : cell.left + 8, y2 = at.side === 'below' ? at.top : at.top + 10;
  const len = Math.hypot(x2 - x1, y2 - y1), ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  line.style.left = x1 + 'px'; line.style.top = y1 + 'px'; line.style.width = len + 'px'; line.style.transform = `rotate(${ang}deg)`;
  const el = mark(gw, 'note', { left: at.left, top: at.top, width: at.width, height: at.height }, 'sm-note-box');
  el.style.height = 'auto';
  el.innerHTML = esc(text);
  return { el, rect: { left: at.left, top: at.top, width: at.width, height: el.offsetHeight || at.height } };
}

/** The pen: the reviewer's red mark around the cell, the rule's chip and the correction line beside it. */
export function paintPen(gw, cell, chip, line) {
  clearMarks(gw, 'pen');
  if (!gw || !cell) return [];
  const ring = mark(gw, 'pen', { left: cell.left - 3, top: cell.top - 3, width: cell.width + 6, height: cell.height + 6 }, 'sm-pen-ring');
  const label = mark(gw, 'pen', { left: cell.left + cell.width + 14, top: cell.top - 2, width: 0, height: 0 }, 'sm-pen-label');
  label.style.width = 'auto'; label.style.height = 'auto';
  label.innerHTML = (chip ? `<span class="sm-pen-chip">${esc(chip)}</span>` : '') + (line ? `<span class="sm-pen-line">${esc(line)}</span>` : '');
  return [ring, label];
}

/** The check: the checks cell, marked 'diff' (the difference showing), 'zero', then 'ok' (green). */
export function paintCheck(gw, cell, state) {
  clearMarks(gw, 'check');
  if (!gw || !cell) return null;
  return mark(gw, 'check', cell, 'sm-check-' + (['diff', 'zero', 'ok'].includes(state) ? state : 'diff'));
}

/** The ping's ring, on the active cell: the host plays the cursor-ping moment on it (effects.js). */
export function pingMark(gw, cell) {
  clearMarks(gw, 'ping');
  if (!gw || !cell) return null;
  return mark(gw, 'ping', cell, 'sm-ping');
}

const BEACON_ARROW = { '0,1': '↓', '0,-1': '↑', '1,0': '→', '-1,0': '←', '1,1': '↘', '-1,1': '↙', '1,-1': '↗', '-1,-1': '↖' };
/**
 * Where the pill for a target off the screen goes, in content pixels: on the edge of the visible box
 * that faces the target, level with it where it can be, with an arrow the way to go. `target` is the
 * target's rect, `view` { sl, st, w, h, x0, y0 } (the scroll offsets, the box's size, where the cells
 * start under the sticky headers), `size` the pill's { w, h }. → null when any of the target shows. Pure.
 */
export function beaconPlace(target, view, size = { w: 72, h: 22 }, pad = 8) {
  if (!target || !view) return null;
  const L = view.sl + (view.x0 || 0), T = view.st + (view.y0 || 0), R = view.sl + view.w, B = view.st + view.h;
  const dx = target.left + target.width <= L ? -1 : target.left >= R ? 1 : 0;
  const dy = target.top + target.height <= T ? -1 : target.top >= B ? 1 : 0;
  if (!dx && !dy) return null;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const left = dx < 0 ? L + pad : dx > 0 ? R - pad - size.w : clamp(target.left + target.width / 2 - size.w / 2, L + pad, R - pad - size.w);
  const top = dy < 0 ? T + pad : dy > 0 ? B - pad - size.h : clamp(target.top + target.height / 2 - size.h / 2, T + pad, B - pad - size.h);
  return { left, top, dx, dy, arrow: BEACON_ARROW[dx + ',' + dy] };
}
/** The pill for a target off the screen: its address and the arrow, on the edge that faces it. */
export function paintBeacon(gw, target, view, label) {
  clearMarks(gw, 'beacon');
  if (!gw || !target || !view || !label) return null;
  const d = mark(gw, 'beacon', null, 'sm-addr');
  d.textContent = label + ' ' + (BEACON_ARROW['0,1']);
  const at = beaconPlace(target, view, { w: d.offsetWidth || 72, h: d.offsetHeight || 22 });
  if (!at) { d.remove(); return null; }
  d.textContent = label + ' ' + at.arrow;
  d.style.left = Math.round(at.left) + 'px'; d.style.top = Math.round(at.top) + 'px';
  return d;
}

export const MARK_KINDS = KINDS;
