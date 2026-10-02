// app2/ui/sheet-view.js — paints a Session's Sheet into the old build's grid DOM. Lifted from
// index.html render() (24082–24495, minus the drill-only decoration), positionMarquee (24496–24518),
// REF_PALETTE/parseFormulaRefs/buildFormulaHTML (24519–24565), updateFormulaBar (24566–24588) and
// the ResizeObserver / resize re-fit (29275–29299). Every class name and inline style is the old
// one, so app.css applies unchanged.
//
// The sheet is Excel at 100% (SITE_SPEC §4): every row and column of the model paints at the engine's
// column width (64px default; autofit and Column Width change it) and a fixed 20px row height, inside
// .gridwrap, a scroll box the frame sizes. Row and column headers stick; after every render the active
// cell is scrolled into view the way Excel does it (whole rows and columns, never the window); and the
// session learns how many rows and columns one screen holds (pageRows / pageCols) for PageUp/PageDown.
//
//   const view = new SheetView(stageMainEl, session);   // appends .fbar + .gridwrap to el
//   view.render();                                       // (re-runs on session.onChange)
//   view.destroy();

import { COLW_DEFAULT, cellShown, cellTxtPx } from '../engine/sheet.js';
import { dispText, dispColor, PAD_MARK } from '../engine/format.js';
import { colLetter, refKey, parseRef } from '../engine/refs.js';
import { formulaRefs, isErrVal } from '../engine/formula.js';
import { recordMouse, MODAL_DIALOGS } from './ribbon-commands.js';
import { outlineMarks, outlineHeaderHtml, outlineLevelHtml, pageBoxes } from './sheet-overlays.js';
import { isFormulaText } from '../engine/keyboard.js';

// Excel's classic formula-highlighting palette — saturated, universally recognizable, works on
// both dark and light themes. Same as Office Theme Accents 1, Red, Green, Purple, Accent 2, Gray.
export const REF_PALETTE = ['#4286D0', '#C62828', '#2E7D32', '#8E24AA', '#EF6C00', '#6D4C41'];
// Excel's defaults at 100% zoom (SITE_SPEC §4). app.css carries the same numbers as --cellh / --cellpad /
// --rowhdrw fallbacks; the view writes --cellh and --cellpad on the wrap so the two never drift.
export const ROW_H = 20;       // px, Excel's 15pt default row
export const ROWHDR_W = 36;    // px, the row-number column: three digits at 11px
export const CELL_PAD = 3;     // px each side of a cell's text
export const CELL_FS = 14.67;  // px: 11pt, the cells' text at 100% (app.css --cellfs)
const HASH_PX = 9.2;           // one '#' of the #### verdict at the 11pt cell font (8.2px glyph + 1px letter-spacing)

/** An escaped display text with each _x pad marker (PAD_MARK + x) as an invisible x: a gap exactly x wide (M64: _) is a bracket's width). */
export function padHtml(s) { return String(s).replace(new RegExp(PAD_MARK + '(&[a-z#0-9]+;|.)', 'g'), (m, ch) => '<span class="padx" aria-hidden="true">' + ch + '</span>'); }
export function escHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

/**
 * Refs of a formula buffer with their colours. Colour is assigned by ORDER OF FIRST APPEARANCE and
 * keyed by COORDINATE, so B2 and $B$2 share one colour. Positions index the string INCLUDING '='.
 * Returns { refs:[{raw,r1,c1,r2,c2,color,start,end}], cellColors:{[A1]:color} }.
 */
export function parseFormulaRefs(buf) {
  const refs = [], cellColors = {}, refToColor = {};
  if (!buf || !isFormulaText(buf)) return { refs, cellColors };
  const off = buf[0] === '=' ? 0 : 1;   // +D5-E5 (M63) is read as =+D5-E5; positions index the buffer as typed
  let ix = 0;
  for (const ref of formulaRefs(off ? '=' + buf : buf)) {
    if (ref.sheet) continue;   // a cross-sheet ref outlines nothing here (its cells are not on this grid)
    let r1, c1, r2, c2;
    if (ref.range) ({ r1, c1, r2, c2 } = ref.range);
    else { const p = parseRef(ref.key); if (!p) continue; r1 = r2 = p.r; c1 = c2 = p.c; }
    const coordKey = r1 + ',' + c1 + ',' + r2 + ',' + c2;
    let color = refToColor[coordKey];
    if (!color) { color = REF_PALETTE[ix++ % REF_PALETTE.length]; refToColor[coordKey] = color; }
    refs.push({ raw: ref.text, r1, c1, r2, c2, color, start: ref.pos - off, end: ref.end - off });
    for (let rr = r1; rr <= r2; rr++) for (let cc = c1; cc <= c2; cc++) {
      const k = refKey(rr, cc);
      if (!cellColors[k]) cellColors[k] = color;   // first-colour-wins on overlaps so the visual stays stable
    }
  }
  return { refs, cellColors };
}

/**
 * Formula HTML with refs wrapped in coloured spans (escaped). With a numeric `caret`, an
 * <span class="edcaret"> lands at that offset — inside a ref span when the caret sits inside a ref.
 */
export function buildFormulaHTML(buf, refs, caret) {
  const parts = []; let last = 0;
  for (const r of refs) { if (r.start > last) parts.push({ s: last, e: r.start }); parts.push({ s: r.start, e: r.end, color: r.color }); last = r.end; }
  if (last < buf.length) parts.push({ s: last, e: buf.length });
  const CARET = '<span class="edcaret"></span>';
  const hasCaret = typeof caret === 'number';
  let out = '', placed = false;
  parts.forEach((p, i) => {
    let seg;
    if (hasCaret && !placed && caret >= p.s && caret <= p.e && (caret < p.e || i === parts.length - 1)) {
      seg = escHtml(buf.slice(p.s, caret)) + CARET + escHtml(buf.slice(caret, p.e)); placed = true;
    } else seg = escHtml(buf.slice(p.s, p.e));
    out += p.color ? `<span style="color:${p.color};font-weight:600">${seg}</span>` : seg;
  });
  if (hasCaret && !placed) out += CARET;
  return out;
}

export class SheetView {
  /**
   * @param {HTMLElement} el   receives .fbar and .gridwrap (appended, so el can hold a ribbon slot above)
   * @param {import('../engine/keyboard.js').Session} session
   */
  constructor(el, session) {
    this.el = el; this.session = session; this.sheet = session.sheet;   // re-read from the session on every render: a workbook switches sheets
    this.destroyed = false;
    const fbar = document.createElement('div'); fbar.className = 'fbar'; fbar.style.position = 'relative';
    fbar.innerHTML =
      '<span class="namebox">A1</span>' +
      '<span class="fx-actions"><button class="fx-x" title="Cancel (Esc)" tabindex="-1">✕</button><button class="fx-ok" title="Enter (↵)" tabindex="-1">✓</button></span>' +
      '<span class="fx"><i>fx</i></span>' +
      '<span class="fcontent empty">empty</span>';
    const gw = document.createElement('div'); gw.className = 'gridwrap';
    gw.innerHTML = '<table id="grid"></table><div class="marquee"></div>';
    el.classList.add('sheet-view');   // the flex-column chain (app.css) so the grid fills its frame from any host element
    const sbar = document.createElement('div'); sbar.className = 'sbar';   // the status bar (M40, M65): the mode word, the selection's figures, the zoom
    sbar.innerHTML = '<span class="sb-mode"></span><span class="sb-group"></span><span class="sb-fill"></span><span class="sb-stats"></span><span class="sb-menu" hidden></span><span class="sb-zoom"></span>';
    el.appendChild(fbar); el.appendChild(gw); el.appendChild(sbar);
    this.sbar = sbar;
    this._onSbarMenu = e => { e.preventDefault(); const m = sbar.querySelector('.sb-menu'); m.hidden = !m.hidden; this.renderStatus(); };
    this._onSbarClick = e => { const it = e.target.closest && e.target.closest('[data-sb]'); if (!it) return; this.session.toggleStatusItem(it.dataset.sb); this.renderStatus(); };
    sbar.addEventListener('contextmenu', this._onSbarMenu); sbar.addEventListener('click', this._onSbarClick);
    // the Name Box list (M40): a click drops the workbook's names; picking one goes there
    this._onNameBox = e => {
      const it = e.target.closest && e.target.closest('[data-name]');
      if (it) { this.session.goToName(it.dataset.name); this.nbList.hidden = true; this.session.emit('mouse'); return; }
      const names = this.session.definedNames ? this.session.definedNames() : [];
      if (!names.length) return;
      this.nbList.innerHTML = names.map(n => '<div class="nb-item" data-name="' + escHtml(n.name) + '">' + escHtml(n.name) + '</div>').join('');
      this.nbList.hidden = !this.nbList.hidden;
    };
    this.nbList = document.createElement('div'); this.nbList.className = 'nb-list'; this.nbList.hidden = true; fbar.appendChild(this.nbList);
    this.fbar = fbar; this.nameBox = fbar.querySelector('.namebox');
    this.nameBox.addEventListener('click', this._onNameBox); this.nbList.addEventListener('click', this._onNameBox); this.fContent = fbar.querySelector('.fcontent'); this.fxActions = fbar.querySelector('.fx-actions');
    this.gw = gw; this.grid = gw.querySelector('table'); this.marquee = gw.querySelector('.marquee');
    this._roPend = false; this._rzT = null;
    this.ew = [];   // the column widths the last render painted with (the engine's colW; index = column)
    this._shape = ''; this._tds = null; this._cls = null; this._sty = null; this._txt = null;   // the painted table, for the patch path (see render)

    this.unsub = session.onChange(() => this.render());
    // the box changed size (the divider moved, the window resized, the first layout landed): the
    // painted grid is unchanged, so only re-scroll to the active cell and re-count the screen
    this.ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => {
      if (this._roPend) return; this._roPend = true;
      requestAnimationFrame(() => { this._roPend = false; if (!this.destroyed) this.refit(); });
    }) : null;
    if (this.ro) this.ro.observe(gw);
    this._onResize = () => { clearTimeout(this._rzT); this._rzT = setTimeout(() => { if (!this.destroyed) this.refit(); }, 120); };
    window.addEventListener('resize', this._onResize);
    // the mouse (SITE_SPEC §6): click selects, Shift+click extends, drag selects a range, headers
    // select columns/rows/all, double-click edits — every workspace click recorded on the session
    this.drag = null;
    this._onDown = e => this.onMouseDown(e);
    this._onDbl = e => this.onDblClick(e);
    this._onMove = e => this.onMouseMove(e);
    this._onUp = () => this.endDrag();
    gw.addEventListener('mousedown', this._onDown);
    gw.addEventListener('dblclick', this._onDbl);
    this.render();
  }

  destroy() {
    this.destroyed = true;
    if (this.unsub) this.unsub();
    if (this.ro) this.ro.disconnect();
    window.removeEventListener('resize', this._onResize); clearTimeout(this._rzT);
    this.endDrag();
    this.gw.removeEventListener('mousedown', this._onDown); this.gw.removeEventListener('dblclick', this._onDbl);
    this.sbar.removeEventListener('contextmenu', this._onSbarMenu); this.sbar.removeEventListener('click', this._onSbarClick);
    this.fbar.remove(); this.gw.remove(); this.sbar.remove(); this.el.classList.remove('sheet-view');
  }

  /* ---------------- mouse ---------------- */
  /** The grid cell or header under an event: {r,c} for a cell, {hdr:'col',c} / {hdr:'row',r} / {hdr:'all'} for a header. */
  hit(e) {
    const t = e.target; if (!t || !t.closest) return null;
    const td = t.closest('td[data-r]');
    if (td) return { r: +td.dataset.r, c: +td.dataset.c };
    const th = t.closest('th'); if (!th || !this.grid.contains(th)) return null;
    const tr = th.parentElement; const S = this.sheet = this.session.sheet;
    if (tr === this.grid.rows[0]) return th.cellIndex === 0 ? { hdr: 'all' } : { hdr: 'col', c: th.cellIndex };
    const r = parseInt(th.dataset.row || th.textContent, 10);   // data-row: the header's text may start with the outline's ⊖ / ⊕
    return (r >= 1 && r <= S.rows) ? { hdr: 'row', r } : null;
  }
  onMouseDown(e) {
    if (e.button !== 0) return;
    // the outline bar's ⊖ / ⊕ (C2 gap 4): fold or unfold that group, recorded like any header click
    const lb = e.target && e.target.closest ? e.target.closest('.ol-lv-b') : null;   // a level button in the corner: show that level of the outline
    if (lb && this.grid.contains(lb)) {
      e.preventDefault(); if (e.detail > 1) return;
      const ssL = this.session, SL = this.sheet = ssL.sheet;
      if (ssL.dialog && MODAL_DIALOGS.has(ssL.dialog)) return;
      if (ssL.mode === 'ribbon') ssL.exitRibbon(false);
      if (ssL.editing && !ssL.commitEdit(0, 0, { kind: 'move' })) { ssL.emit('mouse'); return; }
      const [axis, n] = String(lb.dataset.olv || '').split(':');
      ssL.startClock(); SL.showOutlineLevel(axis, +n); recordMouse(ssL, 'header'); ssL.emit('mouse'); return;
    }
    const ob = e.target && e.target.closest ? e.target.closest('.ol-btn') : null;
    if (ob && this.grid.contains(ob)) {
      e.preventDefault();
      if (e.detail > 1) return;   // the second press of a double-click: one fold, not two
      const ss0 = this.session, S0 = this.sheet = ss0.sheet;
      if (ss0.dialog && MODAL_DIALOGS.has(ss0.dialog)) return;
      if (ss0.mode === 'ribbon') ss0.exitRibbon(false);
      if (ss0.editing && !ss0.commitEdit(0, 0, { kind: 'move' })) { ss0.emit('mouse'); return; }
      const [axis, idx] = String(ob.dataset.ol || '').split(':');
      const g = S0.groups[axis === 'r' ? 'rows' : 'cols'][+idx];
      if (g) { ss0.startClock(); S0.setGroupFold(axis, +idx, !g.collapsed); }
      recordMouse(ss0, 'header');
      ss0.emit('mouse');
      return;
    }
    const h = this.hit(e); if (!h) return;
    e.preventDefault();   // the sheet keeps the keyboard; no text selection starts
    if (e.detail > 1) return;   // the second press of a double-click: dblclick handles it
    const ss = this.session, S = this.sheet = ss.sheet;
    if (ss.dialog && MODAL_DIALOGS.has(ss.dialog)) return;   // a modal card owns the input (Excel)
    if (ss.mode === 'ribbon') ss.exitRibbon(false);          // a click on the sheet dismisses KeyTips and dropdowns
    if (ss.editing && !ss.commitEdit(0, 0, { kind: 'move' })) { ss.emit('mouse'); return; }   // Excel commits the entry when you click away; a refused one stays open
    ss.startClock(); S.tabHome = null;
    if (h.hdr) {
      if (h.hdr === 'all') { const a = S.dispActive(); S.sel = { r: 1, c: 1 }; S.active = { r: S.rows, c: S.cols }; S.selA = { r: a.r, c: a.c }; }
      else if (h.hdr === 'col') {
        if (e.shiftKey && S.sel) { S.sel = { r: 1, c: S.sel.c }; S.active = { r: S.rows, c: h.c }; }
        else { S.active = { r: 1, c: h.c }; S.sel = null; S.selA = null; S.selectCol(); }
        this.drag = { kind: 'col', c0: e.shiftKey && S.sel ? S.sel.c : h.c };
      } else {
        if (e.shiftKey && S.sel) { S.sel = { r: S.sel.r, c: 1 }; S.active = { r: h.r, c: S.cols }; }
        else { S.active = { r: h.r, c: 1 }; S.sel = null; S.selA = null; S.selectRow(); }
        this.drag = { kind: 'row', r0: e.shiftKey && S.sel ? S.sel.r : h.r };
      }
      S.emit('select');
      recordMouse(ss, 'header');
    } else {
      if (e.shiftKey) {   // extend from the displayed active cell (the anchor), as Shift+arrow does
        if (!S.sel) { const a = S.dispActive(); S.sel = { r: a.r, c: a.c }; S.selA = null; }
        S.active = { r: h.r, c: h.c }; S.emit('select');
        this.drag = { kind: 'cell', r: S.sel.r, c: S.sel.c };
      } else { S.goTo(h.r, h.c); this.drag = { kind: 'cell', r: h.r, c: h.c }; }
      recordMouse(ss, 'cell');
    }
    document.addEventListener('mousemove', this._onMove);
    document.addEventListener('mouseup', this._onUp);
    ss.emit('mouse');
  }
  onMouseMove(e) {
    const d = this.drag; if (!d) return;
    if (!(e.buttons & 1)) { this.endDrag(); return; }   // the button was released outside the window
    const h = this.hit(e); if (!h) return;
    const S = this.sheet = this.session.sheet;
    if (d.kind === 'cell') {
      if (h.hdr) return;
      if (S.active.r === h.r && S.active.c === h.c && (S.sel ? true : (h.r === d.r && h.c === d.c))) return;
      if (h.r === d.r && h.c === d.c) { S.sel = null; S.selA = null; S.active = { r: h.r, c: h.c }; }
      else { S.sel = { r: d.r, c: d.c }; S.active = { r: h.r, c: h.c }; S.selA = null; }   // the pressed cell stays the white anchor
    } else if (d.kind === 'col') {
      const c = h.hdr === 'col' ? h.c : (h.hdr ? null : h.c); if (c == null || S.active.c === c) return;
      S.sel = { r: 1, c: d.c0 }; S.active = { r: S.rows, c }; S.selA = { r: 1, c: d.c0 };
    } else {
      const r = h.hdr === 'row' ? h.r : (h.hdr ? null : h.r); if (r == null || S.active.r === r) return;
      S.sel = { r: d.r0, c: 1 }; S.active = { r, c: S.cols }; S.selA = { r: d.r0, c: 1 };
    }
    S.emit('select');
  }
  endDrag() {
    this.drag = null;
    document.removeEventListener('mousemove', this._onMove);
    document.removeEventListener('mouseup', this._onUp);
  }
  /** Double-click opens the cell for editing: the session gets an F2, as the keyboard would. */
  onDblClick(e) {
    const h = this.hit(e); if (!h || h.hdr) return;
    e.preventDefault();
    const ss = this.session, S = this.sheet = ss.sheet;
    if (ss.editing || (ss.dialog && MODAL_DIALOGS.has(ss.dialog))) return;
    const a = S.dispActive();
    if (a.r !== h.r || a.c !== h.c) S.goTo(h.r, h.c);
    ss.key({ key: 'F2' });
    recordMouse(ss, 'edit');
  }

  /**
   * Paint the model. The first paint (and any change of shape: rows, columns, a column width) writes
   * the whole table in one innerHTML; every other render computes each cell's class / style / text
   * as before and touches only the cells whose triple changed, so a cursor move restyles two cells
   * instead of re-laying-out 2,600.
   */
  render() {
    if (this.destroyed) return;
    const ss = this.session, S = this.sheet = ss.sheet, gw = this.gw;
    const COLS = S.cols, ROWS = S.rows, colW = S.colW, cells = S.cells;
    const W = [0], L = ['']; let totalW = ROWHDR_W;
    const hidC = S.hiddenCols || new Set(), hidR = S.hiddenRows || new Set();
    const rowH = S.rowH || [];
    const freeze = S.freeze || { r: 0, c: 0 };
    // the outline (C2 gap 4): a collapsed group folds its rows / columns away in the view — never
    // through hiddenRows / hiddenCols, so graders can tell grouped from hidden — and every group
    // draws a bracket on the header with a ⊖ / ⊕ on the row or column just past it (Excel's bar)
    const groups = S.groups || { rows: [], cols: [] };
    // nested (up to seven levels): each level draws its own bracket and button lane (ui/sheet-overlays.js); the corner carries the level buttons
    const foldC = new Set(), foldR = new Set();
    groups.cols.forEach(g => { if (g.collapsed) for (let c = g.c1; c <= g.c2; c++) foldC.add(c); });
    groups.rows.forEach(g => { if (g.collapsed) for (let r = g.r1; r <= g.r2; r++) foldR.add(r); });
    const olMarksC = outlineMarks(S, 'c', COLS), olMarksR = outlineMarks(S, 'r', ROWS);
    const olCorner = outlineLevelHtml(olMarksR, olMarksC);
    // Page Break Preview (View › Page Break Preview): the cells outside the print range grey; the page boxes are an overlay (positionPages)
    const pbp = pageBoxes(S); const pbr = pbp && pbp.range;
    const showFx = !!(ss.settings && ss.settings.showFormulas);   // Ctrl+` (C2 gap 5): formula text in place of values
    const cf = S.condFmt && S.condFmt.length ? S.condFmtMap() : null;   // conditional formatting (Chapter 2): evaluated once per paint
    const z = (S.zoom || 100) / 100, Z = px => Math.round(px * z);   // the sheet's zoom (M44, M99): every painted size scales, the engine's widths stay
    totalW = Z(ROWHDR_W);
    for (let c = 1; c <= COLS; c++) { const w = hidC.has(c) || foldC.has(c) ? 0 : (colW[c] || COLW_DEFAULT); W[c] = w; totalW += Z(w); L[c] = colLetter(c); }
    this.ew = W;
    const N = ROWS * COLS, shape = z + '@' + ROWS + 'x' + COLS + ':' + W.join(',') + '|' + [...hidR].join('.') + '|' + rowH.join('.') + '|' + freeze.r + ',' + freeze.c + '|' + JSON.stringify(groups) + '|' + S.view;
    const patch = this._shape === shape && !!this._tds && this._tds.length === N && this.grid.rows.length === ROWS + 1;
    if (!patch) { this._cls = new Array(N); this._sty = new Array(N); this._txt = new Array(N); }
    const oldCls = this._cls, oldSty = this._sty, oldTxt = this._txt, tds = this._tds;

    const sr = S.selRange(), hasSel = !!S.sel;
    let refColors = {};
    if (ss.editing) refColors = parseFormulaRefs(ss.editBuf).cellColors;
    // an entry pointing on another sheet (Ctrl+PgDn mid-formula) shows only in the formula bar here: the editor box stays on its own sheet
    const editing = ss.editing && (ss.editOrigin == null || ss.editOrigin === ss.sheetIndex), editPointer = ss.editPointer;
    // the DISPLAYED active cell is the selection ANCHOR (Excel-true)
    const dA = S.dispActive();

    let gh = '';
    if (!patch) {
      gw.style.setProperty('--cellh', Z(ROW_H) + 'px'); gw.style.setProperty('--cellpad', CELL_PAD + 'px'); gw.style.setProperty('--zoom', String(z));
      // the cells' text scales with the zoom as Excel's does (100% keeps the stylesheet's size, density steps included)
      if (z === 1) gw.style.removeProperty('--cellfs'); else gw.style.setProperty('--cellfs', (Math.round(CELL_FS * z * 100) / 100) + 'px');
      this.grid.style.width = totalW + 'px';   // table-layout:fixed — the <col> widths are the column widths
      // column widths, then the header row — no active-column highlight (the old build had none)
      gh = '<colgroup><col style="width:' + Z(ROWHDR_W) + 'px">';
      for (let c = 1; c <= COLS; c++) gh += '<col style="width:' + Z(W[c]) + 'px">';
      gh += '</colgroup><tr><th class="rowhdr' + (olCorner ? ' ol-corner' : '') + '">' + olCorner + '</th>';
      for (let c = 1; c <= COLS; c++) gh += '<th class="' + (hidC.has(c) || foldC.has(c) ? 'hidc' : hidC.has(c - 1) ? 'seam-c' : '') + (olMarksC.btns[c] ? ' ol-host' : '') + '">' + outlineHeaderHtml(olMarksC, 'c', c) + L[c] + '</th>';
      gh += '</tr>';
    }

    let i = 0;   // flat cell index, row-major
    for (let r = 1; r <= ROWS; r++) {
      const rowIn = hasSel && r >= sr.r1 && r <= sr.r2;
      const rh = rowH[r] || ROW_H;
      let row = patch ? '' : '<tr' + (hidR.has(r) || foldR.has(r) ? ' class="hidrow"' : rh !== ROW_H ? ' style="height:' + Z(rh) + 'px"' : '') + '><th class="rowhdr' + (hidR.has(r - 1) ? ' seam-r' : '') + (olMarksR.btns[r] ? ' ol-host' : '') + '" data-row="' + r + '">' + outlineHeaderHtml(olMarksR, 'r', r) + r + '</th>';
      for (let c = 1; c <= COLS; c++, i++) {
        const isActive = (r === dA.r && c === dA.c);
        const inSel = rowIn && c >= sr.c1 && c <= sr.c2;
        const isPoint = !!(editing && editPointer && r === editPointer.r && c === editPointer.c);
        let cls = isActive ? 'active' : (inSel ? 'sel' : '');
        if (hidC.has(c) || foldC.has(c)) cls += ' hidc';
        if (freeze.r && r === freeze.r) cls += ' frz-b';
        if (freeze.c && c === freeze.c) cls += ' frz-r';
        if (isPoint) cls += ' point';
        if (pbr && (r < pbr.r1 || r > pbr.r2 || c < pbr.c1 || c > pbr.c2)) cls += ' pbp-out';
        if (inSel) { if (r === sr.r1) cls += ' sel-t'; if (r === sr.r2) cls += ' sel-b'; if (c === sr.c1) cls += ' sel-l'; if (c === sr.c2) cls += ' sel-r'; }
        // Excel's fill-handle — the tiny green square at the selection's bottom-right (or on the lone active cell)
        if (hasSel ? (r === sr.r2 && c === sr.c2) : isActive) cls += ' fh';
        const key = L[c] + r;
        const refColor = refColors[key];
        let style = '';
        if (refColor && !isActive && !isPoint) style = 'outline:2px solid ' + refColor + ';outline-offset:-2px;z-index:2';
        const rec = cells[key];
        let txt = '';
        if (rec || (editing && isActive)) {
          const cell = rec || S.get(r, c);
          const isNum = typeof cell.value === 'number';
          if (cell.bold) cls += ' bold'; if (cell.txt && !isNum) cls += ' txt';
          if (isErrVal(cell.value)) cls += ' err';
          if (cell.it) cls += ' it'; if (cell.strike) cls += ' strike';
          if (cell.uline) cls += ' uline';
          if (cell.cmt) cls += ' cmt';
          if (cell.wrap) cls += ' wrap'; if (cell.fill) cls += ' fill-' + cell.fill;
          if (cell.bt) cls += ' bt'; if (cell.bb) cls += ' bb'; if (cell.ball) cls += ' ball'; if (cell.bdbl) cls += ' bdbl';
          if (cell.bl) cls += ' bl'; if (cell.br) cls += ' br'; if (cell.thick) cls += ' thick';
          if (cell.align) cls += ' align-' + cell.align;
          const fcKey = dispColor(cell) || cell.fontColor;   // a custom code's [Red] section wins over the font colour, as in Excel
          if (fcKey) { if (fcKey[0] === '#') style += ';color:' + fcKey; else cls += ' fc-' + fcKey; }   // [Color 9]: a palette hex the swatches lack

          const fit = isNum ? cellShown(cell, W[c]) : null;
          const shown = isNum ? fit.text : dispText(cell);
          // the td collapses spaces (white-space:nowrap): a number keeps every one (the accounting $   -  ),
          // an _x pad paints as an invisible x, so 1,235 lines up under (1,235) to the bracket's width,
          // and text keeps its leading and trailing run
          txt = isNum ? padHtml(escHtml(shown).replace(/ /g, '&nbsp;')) : escHtml(shown).replace(/^ +| +$/g, m => '&nbsp;'.repeat(m.length));
          const fxShown = showFx && !!cell.formula && !(editing && isActive);
          if (fxShown) { cls += ' txt fxshow'; txt = escHtml(cell.formula); }   // show formulas: the text, left-aligned, no #### verdict
          if (editing && isActive) {
            // Editing cell: the formula buffer with coloured refs (matches the formula bar), in the pop-out overlay
            const { refs } = parseFormulaRefs(ss.editBuf);
            cls += ' editing';
            const rest = ss.acFull && ss.acFull.length > ss.editBuf.length ? '<span class="ac-rest">' + escHtml(ss.acFull.slice(ss.editBuf.length)) + '</span>' : '';
            const L2 = ss.fxList;
            const list = L2 ? '<span class="ac-list" role="listbox">' + L2.items.slice(Math.max(0, L2.idx - 7), Math.max(0, L2.idx - 7) + 8).map(it => '<span class="ac-item' + (it === L2.items[L2.idx] ? ' on' : '') + (it.kind === 'name' ? ' ac-name' : '') + '">' + escHtml(it.name) + '</span>').join('') + '</span>' : '';
            txt = '<span class="edbox"><span class="edin">' + buildFormulaHTML(ss.editBuf, refs, ss.editCaret) + rest + '</span>' + list + '</span>';
          }
          else if (fxShown) { /* painted above */ }
          else if (cell.txt && (cell.ca | 0) > 1 && typeof cell.value === 'string') {
            // CENTER ACROSS SELECTION — the anchor's text centers over its stored span; no merged cells
            let caw = 0; for (let k2 = 0; k2 < cell.ca && c + k2 <= COLS; k2++) caw += W[c + k2];
            cls += ' spill';
            txt = '<span class="sp" style="width:' + (Z(caw) - 2 * CELL_PAD) + 'px;max-width:' + (Z(caw) - 2 * CELL_PAD) + 'px;text-align:center;display:inline-block">' + txt + '</span>';
          }
          else if (cell.txt && !cell.wrap && typeof cell.value === 'string') {
            // EXCEL PARITY — long text SPILLS across empty right neighbours, clipping at the first occupied cell
            const est = cellTxtPx(cell);
            if (est > W[c]) {
              let spillW = W[c], cc = c + 1;
              while (cc <= COLS) { const n = cells[L[cc] + r]; if (n && n.value !== null && n.value !== '') break; spillW += W[cc]; cc++; }
              if (spillW > W[c]) {
                cls += ' spill';
                // the highlighted anchor's outline/tint covers ONLY its own cell; the text paints on top
                const hi = (isActive || inSel) ? '<span class="sphi" style="width:' + Z(W[c]) + 'px"></span>' : '';
                txt = hi + '<span class="sp" style="max-width:' + (Z(spillW) - 2 * CELL_PAD) + 'px">' + txt + '</span>';
              }
            }
          }
          else if (isNum && !cell.wrap) {
            // #### when the number needs more than the column's engine width, or when its format cannot
            // show it at all (a negative date, a value no section fits): the engine's own # fill
            if (fit.over) { cls += ' over'; txt = '#'.repeat(Math.max(3, Math.floor((Z(W[c]) - 2 * CELL_PAD) / (HASH_PX * z)))); }
          }

          if (cell.indent) {   // Alt H 6/5 indent — pad the content gutter (right edge for right-aligned cells)
            const pad = CELL_PAD + (cell.indent | 0) * 13;
            style += (cell.align === 'r') ? (';padding-right:' + pad + 'px') : (';padding-left:' + pad + 'px');
          }
          if (cell.fsz) style += ';font-size:' + (Math.round(cell.fsz * z * 100) / 100) + 'px';   // grow/shrink font (Alt H F G/K)
        }
        const cfc = cf && cf[key];   // a rule's paint: fill (a colour scale's too) / font colour / border / data bar, over the cell's own
        if (cfc) {
          if (cfc.fill) { cls += ' cf-fill'; style += ';--cf-fill:' + cfc.fill; }
          if (cfc.fontColor) { cls += ' cf-fc'; style += ';--cf-fc:' + cfc.fontColor; }
          if (cfc.border) { cls += ' cf-bd'; style += ';--cf-bd:' + cfc.border; }
          if (cfc.bar) {
            // Excel's automatic bar: a positive value runs right from the axis (where zero sits: the left
            // edge unless the range holds negatives) in the rule colour, a negative runs left from it in red
            const b = cfc.bar, axis = b.axis || 0;
            const x1 = b.neg ? axis * (1 - b.pct) : axis, x2 = b.neg ? axis : axis + b.pct * (1 - axis), col = b.neg ? '#ff0000' : b.color;
            const pc = x => (Math.round(x * 1000) / 10) + '%';
            cls += ' cf-bar';   // the class keeps the bar from repeating; the gradient itself is inline, since the stylesheet's template only knows a left-anchored bar
            style += ';background-image:linear-gradient(90deg, transparent ' + pc(x1) + ', ' + col + ' ' + pc(x1) + ', ' + col + ' ' + pc(x2) + ', transparent ' + pc(x2) + ') !important';
          }
        }

        if (patch) {
          if (oldCls[i] !== cls) { tds[i].className = cls; oldCls[i] = cls; }
          if (oldSty[i] !== style) { tds[i].style.cssText = style; oldSty[i] = style; }
          if (oldTxt[i] !== txt) { tds[i].innerHTML = txt; oldTxt[i] = txt; }
        } else {
          oldCls[i] = cls; oldSty[i] = style; oldTxt[i] = txt;
          row += '<td data-r="' + r + '" data-c="' + c + '" class="' + cls + '"' + (style ? ' style="' + style + '"' : '') + '>' + txt + '</td>';
        }
      }
      if (!patch) gh += row + '</tr>';
    }
    if (!patch) {
      this.grid.innerHTML = gh;   // the one full grid write
      this._tds = Array.prototype.slice.call(this.grid.querySelectorAll('td'));
      this._shape = shape;
    }

    try { document.body.classList.toggle('hide-gridlines', !S.gridlines); } catch (e) { /* no body */ }
    const f = S.lastFlash;
    if (f) { S.lastFlash = null;   // the one-shot paste flash: drop the class, flush, add it, so a repeat paste animates again
      const hit = [];
      for (let r = f.r1; r <= f.r2; r++) for (let c = f.c1; c <= f.c2; c++) {
        const td = this.grid.querySelector('td[data-r="' + r + '"][data-c="' + c + '"]'); if (td) { td.classList.remove('pasted'); hit.push(td); } }
      if (hit.length) { void this.grid.offsetWidth; for (const td of hit) td.classList.add('pasted'); }
    }
    this.keepActiveInView();
    this.positionMarquee();
    this.positionPages(pbp);
    this.measurePage();
    this.updateFormulaBar();
    this.renderStatus();
  }
  /** The status bar: Ready / Enter / Edit / Point, Group when sheets are grouped, Average / Count / Sum (and Minimum / Maximum when ticked) of a selection of two or more filled cells, the zoom. */
  renderStatus() {
    const ss = this.session, sb = this.sbar; if (!sb || !ss.statusInfo) return;
    const st = ss.statusInfo();
    sb.querySelector('.sb-mode').textContent = st.mode;
    sb.querySelector('.sb-group').textContent = st.grouped ? 'Group' : '';
    const parts = [];
    if (st.show) {
      if (st.numCount) parts.push(['Average', st.text.average]);
      parts.push(['Count', st.text.count]);
      if (st.numCount && st.showMin) parts.push(['Min', st.text.min]);
      if (st.numCount && st.showMax) parts.push(['Max', st.text.max]);
      if (st.numCount) parts.push(['Sum', st.text.sum]);
    }
    sb.querySelector('.sb-stats').innerHTML = parts.map(([k, v]) => '<span class="sb-stat">' + k + ': <b>' + escHtml(String(v).trim()) + '</b></span>').join('');
    const menu = sb.querySelector('.sb-menu');
    if (!menu.hidden) menu.innerHTML = '<span class="sb-item' + (st.showMin ? ' on' : '') + '" data-sb="min">Minimum</span><span class="sb-item' + (st.showMax ? ' on' : '') + '" data-sb="max">Maximum</span>';
    sb.querySelector('.sb-zoom').textContent = st.zoom + '%';
    this.fbar.classList.toggle('expanded', !!(ss.settings && ss.settings.formulaBarExpanded));
  }

  /** The box changed size: the grid stands, the scroll position and the screen count follow. */
  refit() { if (this.destroyed || !this.grid.rows.length) return; this.keepActiveInView(); this.positionMarquee(); this.positionPages(pageBoxes(this.session.sheet)); this.measurePage(); }

  /**
   * A cell's painted box in .gridwrap content pixels ({ left, top, width, height }), for an
   * overlay positioned inside the scroll box (the PB ghost cursor). Null while the cell has no
   * <td> (hidden row/column, or the grid has not laid out).
   */
  cellRect(ref) {
    const p = parseRef(String(ref || ''));
    if (!p) return null;
    const td = this.grid.querySelector(`td[data-r="${p.r}"][data-c="${p.c}"]`);
    if (!td) return null;
    const tr = td.parentElement;
    return { left: td.offsetLeft, top: tr.offsetTop, width: td.offsetWidth, height: tr.offsetHeight };
  }

  /**
   * The scroll box's geometry in content pixels, from the painted table: y0/x0 are where cell A1
   * starts (the sticky header row and row-header column sit above / left of it), viewH/viewW the
   * data area that shows. Null until the box has laid out.
   */
  box() {
    const gw = this.gw, rows = this.grid.rows;
    if (gw.clientHeight <= 0 || gw.clientWidth <= 0 || rows.length < 2) return null;
    const y0 = rows[1].offsetTop, x0 = rows[1].cells[1] ? rows[1].cells[1].offsetLeft : rows[1].cells[0].offsetWidth;
    return { y0, x0, viewH: gw.clientHeight - y0, viewW: gw.clientWidth - x0 };
  }

  /**
   * Scroll .gridwrap (never the window) the least it takes to show the displayed active cell whole.
   * Excel-true: rows and columns stay aligned, so a cell just below the box scrolls exactly one row,
   * Ctrl+↓ on an empty column lands on the last row with the box scrolled there, Ctrl+Home goes
   * back to the top-left.
   */
  keepActiveInView() {
    const gw = this.gw, grid = this.grid, S = this.sheet;
    const b = this.box(); if (!b) return;
    const a = S.dispActive();
    const td = grid.querySelector(`td[data-r="${a.r}"][data-c="${a.c}"]`); if (!td) return;
    const tr = td.parentElement, rows = grid.rows;
    const top = tr.offsetTop - b.y0, bottom = top + tr.offsetHeight;
    const left = td.offsetLeft - b.x0, right = left + td.offsetWidth;
    let st = gw.scrollTop, sl = gw.scrollLeft;
    if (top < st) st = top;
    else if (bottom > st + b.viewH) {   // the first row-aligned offset that shows the whole row
      const need = bottom - b.viewH;
      let i = Math.max(1, Math.min(rows.length - 1, Math.ceil(need / ROW_H) + 1));
      while (i < rows.length - 1 && rows[i].offsetTop - b.y0 < need) i++;
      while (i > 1 && rows[i - 1].offsetTop - b.y0 >= need) i--;
      st = rows[i].offsetTop - b.y0;
    }
    if (left < sl) sl = left;
    else if (right > sl + b.viewW) {    // the first column-aligned offset that shows the whole column
      const need = right - b.viewW, tds = tr.cells;
      let x = left;
      for (let c = 1; c < tds.length; c++) { const l = tds[c].offsetLeft - b.x0; if (l >= need) { x = l; break; } }
      sl = x;
    }
    st = Math.max(0, Math.round(st)); sl = Math.max(0, Math.round(sl));
    if (st !== gw.scrollTop) gw.scrollTop = st;
    if (sl !== gw.scrollLeft) gw.scrollLeft = sl;
  }

  /** session.pageRows / pageCols: the rows and columns fully visible in the box at its current scroll (one screen). */
  measurePage() {
    const ss = this.session, gw = this.gw, rows = this.grid.rows;
    const b = this.box(); if (!b) return;
    const st = gw.scrollTop, sl = gw.scrollLeft;
    let nr = 0;
    for (let i = 1; i < rows.length; i++) {
      const t = rows[i].offsetTop - b.y0 - st; if (t + rows[i].offsetHeight > b.viewH + 0.5) break;
      if (t >= -0.5) nr++;
    }
    let nc = 0; const tds = rows[1].cells;
    for (let c = 1; c < tds.length; c++) {
      const l = tds[c].offsetLeft - b.x0 - sl; if (l + tds[c].offsetWidth > b.viewW + 0.5) break;
      if (l >= -0.5) nc++;
    }
    ss.pageRows = Math.max(1, nr); ss.pageCols = Math.max(1, nc);
    const z = (this.sheet.zoom || 100) / 100;
    ss.viewSize = { width: Math.round(b.viewW / z * 1) + ROWHDR_W, height: Math.round(b.viewH / z) + ROW_H };   // the sheet area at 100%, for Zoom › Fit selection
  }

  /** The marching ants over the copied block (sheet.clipboard.rect), placed over the live cells — only on the sheet the block was copied from. */
  /** Page Break Preview's overlay: one box per printed page over its cells, numbered; removed in Normal view. */
  positionPages(pbp) {
    let ov = this.gw.querySelector('.pbp');
    if (!pbp) { if (ov) ov.remove(); return; }
    if (!ov) { ov = document.createElement('div'); ov.className = 'pbp'; ov.setAttribute('aria-hidden', 'true'); this.gw.appendChild(ov); }
    const wrap = this.gw, wr = wrap.getBoundingClientRect(); let html = '';
    const td = (r, c) => this.grid.querySelector('td[data-r="' + r + '"][data-c="' + c + '"]');
    for (const p of pbp.pages) {
      const a = td(p.r1, p.c1), b = td(p.r2, p.c2); if (!a || !b) continue;
      const ar = a.getBoundingClientRect(), br = b.getBoundingClientRect(); if (br.right <= ar.left || br.bottom <= ar.top) continue;
      html += '<div class="pbp-page' + (p.autoTop ? ' auto-t' : '') + (p.autoLeft ? ' auto-l' : '') + '" style="left:' + (ar.left - wr.left + wrap.scrollLeft) + 'px;top:' + (ar.top - wr.top + wrap.scrollTop) + 'px;width:' + (br.right - ar.left) + 'px;height:' + (br.bottom - ar.top) + 'px;--pbp-fs:' + Math.max(9, Math.min(28, Math.round((br.right - ar.left) / 6))) + 'px"><span class="pbp-num">Page ' + p.page + '</span></div>';
    }
    ov.innerHTML = html;
  }
  positionMarquee() {
    const m = this.marquee; if (!m) return;
    const cb = this.sheet.clipboard;
    const rect = cb && (!cb.src || cb.src === this.sheet) ? cb.rect : null;
    if (!rect) { m.style.display = 'none'; return; }
    const a = this.grid.querySelector(`td[data-r="${rect.r1}"][data-c="${rect.c1}"]`);
    const b = this.grid.querySelector(`td[data-r="${rect.r2}"][data-c="${rect.c2}"]`);
    if (!a || !b) { m.style.display = 'none'; return; }
    const wrap = this.gw;
    const wr = wrap.getBoundingClientRect(), ar = a.getBoundingClientRect(), br = b.getBoundingClientRect();
    m.style.display = 'block';
    m.style.left = (ar.left - wr.left + wrap.scrollLeft) + 'px';
    m.style.top = (ar.top - wr.top + wrap.scrollTop) + 'px';
    m.style.width = (br.right - ar.left) + 'px';
    m.style.height = (br.bottom - ar.top) + 'px';
  }

  /** Name box · ✕/✓ · fx · content — editing shows the whole buffer with coloured refs (no caret here). */
  updateFormulaBar() {
    const S = this.sheet, ss = this.session, fc = this.fContent, fxa = this.fxActions;
    if (ss.editing) {
      this.nameBox.textContent = refKey(S.active.r, S.active.c);
      fc.className = 'fcontent isfx';
      const { refs } = parseFormulaRefs(ss.editBuf);
      fc.innerHTML = buildFormulaHTML(ss.editBuf, refs);
      fxa.classList.add('on');   // light the ✕/✓ while editing (Excel)
      return;
    }
    fxa.classList.remove('on');
    const dA = S.dispActive();
    const cell = S.get(dA.r, dA.c);
    const sr = S.selRange(), here = (ss.sheets[ss.sheetIndex] || {}).name;
    const named = ss.definedNames ? ss.definedNames().find(n => n.sheet === here && n.ref.replace(/\$/g, '') === (sr.r1 === sr.r2 && sr.c1 === sr.c2 ? refKey(sr.r1, sr.c1) : refKey(sr.r1, sr.c1) + ':' + refKey(sr.r2, sr.c2))) : null;
    this.nameBox.textContent = named ? named.name : refKey(dA.r, dA.c);
    if (cell.formula) {
      fc.className = 'fcontent isfx';
      const { refs } = parseFormulaRefs(cell.formula);
      fc.innerHTML = buildFormulaHTML(cell.formula, refs);
    }
    else if (cell.value !== null && cell.value !== '') { fc.className = 'fcontent'; fc.textContent = typeof cell.value === 'boolean' ? (cell.value ? 'TRUE' : 'FALSE') : String(cell.value); }
    else { fc.className = 'fcontent empty'; fc.textContent = 'empty'; }
  }
}
