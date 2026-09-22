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

import { COLW_DEFAULT, cellNumPx, cellTxtPx } from '../engine/sheet.js';
import { dispText } from '../engine/format.js';
import { colLetter, refKey, parseRef } from '../engine/refs.js';
import { formulaRefs, isErrVal } from '../engine/formula.js';
import { recordMouse, MODAL_DIALOGS } from './ribbon-commands.js';

// Excel's classic formula-highlighting palette — saturated, universally recognizable, works on
// both dark and light themes. Same as Office Theme Accents 1, Red, Green, Purple, Accent 2, Gray.
export const REF_PALETTE = ['#4286D0', '#C62828', '#2E7D32', '#8E24AA', '#EF6C00', '#6D4C41'];
// Excel's defaults at 100% zoom (SITE_SPEC §4). app.css carries the same numbers as --cellh / --cellpad /
// --rowhdrw fallbacks; the view writes --cellh and --cellpad on the wrap so the two never drift.
export const ROW_H = 20;       // px, Excel's 15pt default row
export const ROWHDR_W = 36;    // px, the row-number column: three digits at 11px
export const CELL_PAD = 3;     // px each side of a cell's text
const HASH_PX = 9.2;           // one '#' of the #### verdict at the 11pt cell font (8.2px glyph + 1px letter-spacing)

export function escHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

/**
 * Refs of a formula buffer with their colours. Colour is assigned by ORDER OF FIRST APPEARANCE and
 * keyed by COORDINATE, so B2 and $B$2 share one colour. Positions index the string INCLUDING '='.
 * Returns { refs:[{raw,r1,c1,r2,c2,color,start,end}], cellColors:{[A1]:color} }.
 */
export function parseFormulaRefs(buf) {
  const refs = [], cellColors = {}, refToColor = {};
  if (!buf || buf[0] !== '=') return { refs, cellColors };
  let ix = 0;
  for (const ref of formulaRefs(buf)) {
    if (ref.sheet) continue;   // a cross-sheet ref outlines nothing here (its cells are not on this grid)
    let r1, c1, r2, c2;
    if (ref.range) ({ r1, c1, r2, c2 } = ref.range);
    else { const p = parseRef(ref.key); if (!p) continue; r1 = r2 = p.r; c1 = c2 = p.c; }
    const coordKey = r1 + ',' + c1 + ',' + r2 + ',' + c2;
    let color = refToColor[coordKey];
    if (!color) { color = REF_PALETTE[ix++ % REF_PALETTE.length]; refToColor[coordKey] = color; }
    refs.push({ raw: ref.text, r1, c1, r2, c2, color, start: ref.pos, end: ref.end });
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
    el.appendChild(fbar); el.appendChild(gw);
    this.fbar = fbar; this.nameBox = fbar.querySelector('.namebox'); this.fContent = fbar.querySelector('.fcontent'); this.fxActions = fbar.querySelector('.fx-actions');
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
    this.fbar.remove(); this.gw.remove(); this.el.classList.remove('sheet-view');
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
    const r = parseInt(th.textContent, 10);
    return (r >= 1 && r <= S.rows) ? { hdr: 'row', r } : null;
  }
  onMouseDown(e) {
    if (e.button !== 0) return;
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
    for (let c = 1; c <= COLS; c++) { const w = hidC.has(c) ? 0 : (colW[c] || COLW_DEFAULT); W[c] = w; totalW += w; L[c] = colLetter(c); }
    this.ew = W;
    const N = ROWS * COLS, shape = ROWS + 'x' + COLS + ':' + W.join(',') + '|' + [...hidR].join('.') + '|' + rowH.join('.') + '|' + freeze.r + ',' + freeze.c;
    const patch = this._shape === shape && !!this._tds && this._tds.length === N && this.grid.rows.length === ROWS + 1;
    if (!patch) { this._cls = new Array(N); this._sty = new Array(N); this._txt = new Array(N); }
    const oldCls = this._cls, oldSty = this._sty, oldTxt = this._txt, tds = this._tds;

    const sr = S.selRange(), hasSel = !!S.sel;
    let refColors = {};
    if (ss.editing) refColors = parseFormulaRefs(ss.editBuf).cellColors;
    const editing = ss.editing, editPointer = ss.editPointer;
    // the DISPLAYED active cell is the selection ANCHOR (Excel-true)
    const dA = S.dispActive();

    let gh = '';
    if (!patch) {
      gw.style.setProperty('--cellh', ROW_H + 'px'); gw.style.setProperty('--cellpad', CELL_PAD + 'px');
      this.grid.style.width = totalW + 'px';   // table-layout:fixed — the <col> widths are the column widths
      // column widths, then the header row — no active-column highlight (the old build had none)
      gh = '<colgroup><col style="width:' + ROWHDR_W + 'px">';
      for (let c = 1; c <= COLS; c++) gh += '<col style="width:' + W[c] + 'px">';
      gh += '</colgroup><tr><th class="rowhdr"></th>';
      for (let c = 1; c <= COLS; c++) gh += '<th class="' + (hidC.has(c) ? 'hidc' : hidC.has(c - 1) ? 'seam-c' : '') + '">' + L[c] + '</th>';
      gh += '</tr>';
    }

    let i = 0;   // flat cell index, row-major
    for (let r = 1; r <= ROWS; r++) {
      const rowIn = hasSel && r >= sr.r1 && r <= sr.r2;
      const rh = rowH[r] || ROW_H;
      let row = patch ? '' : '<tr' + (hidR.has(r) ? ' class="hidrow"' : rh !== ROW_H ? ' style="height:' + rh + 'px"' : '') + '><th class="rowhdr' + (hidR.has(r - 1) ? ' seam-r' : '') + '">' + r + '</th>';
      for (let c = 1; c <= COLS; c++, i++) {
        const isActive = (r === dA.r && c === dA.c);
        const inSel = rowIn && c >= sr.c1 && c <= sr.c2;
        const isPoint = !!(editing && editPointer && r === editPointer.r && c === editPointer.c);
        let cls = isActive ? 'active' : (inSel ? 'sel' : '');
        if (hidC.has(c)) cls += ' hidc';
        if (freeze.r && r === freeze.r) cls += ' frz-b';
        if (freeze.c && c === freeze.c) cls += ' frz-r';
        if (isPoint) cls += ' point';
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
          if (cell.fontColor) cls += ' fc-' + cell.fontColor;

          txt = escHtml(dispText(cell));
          if (editing && isActive) {
            // Editing cell: the formula buffer with coloured refs (matches the formula bar), in the pop-out overlay
            const { refs } = parseFormulaRefs(ss.editBuf);
            cls += ' editing';
            txt = '<span class="edbox"><span class="edin">' + buildFormulaHTML(ss.editBuf, refs, ss.editCaret) + '</span></span>';
          }
          else if (cell.txt && (cell.ca | 0) > 1 && typeof cell.value === 'string') {
            // CENTER ACROSS SELECTION — the anchor's text centers over its stored span; no merged cells
            let caw = 0; for (let k2 = 0; k2 < cell.ca && c + k2 <= COLS; k2++) caw += W[c + k2];
            cls += ' spill';
            txt = '<span class="sp" style="width:' + (caw - 2 * CELL_PAD) + 'px;max-width:' + (caw - 2 * CELL_PAD) + 'px;text-align:center;display:inline-block">' + txt + '</span>';
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
                const hi = (isActive || inSel) ? '<span class="sphi" style="width:' + W[c] + 'px"></span>' : '';
                txt = hi + '<span class="sp" style="max-width:' + (spillW - 2 * CELL_PAD) + 'px">' + txt + '</span>';
              }
            }
          }
          else if (isNum && !cell.wrap) {
            // #### when the number needs more than the column's engine width
            const tw = cellNumPx(cell);
            if (tw > W[c]) { cls += ' over'; txt = '#'.repeat(Math.max(3, Math.floor((W[c] - 2 * CELL_PAD) / HASH_PX))); }
          }

          if (cell.indent) {   // Alt H 6/5 indent — pad the content gutter (right edge for right-aligned cells)
            const pad = CELL_PAD + (cell.indent | 0) * 13;
            style += (cell.align === 'r') ? (';padding-right:' + pad + 'px') : (';padding-left:' + pad + 'px');
          }
          if (cell.fsz) style += ';font-size:' + cell.fsz + 'px';   // grow/shrink font (Alt H F G/K)
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
    this.measurePage();
    this.updateFormulaBar();
  }

  /** The box changed size: the grid stands, the scroll position and the screen count follow. */
  refit() { if (this.destroyed || !this.grid.rows.length) return; this.keepActiveInView(); this.positionMarquee(); this.measurePage(); }

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
  }

  /** The marching ants over the copied block (sheet.clipboard.rect), placed over the live cells. */
  positionMarquee() {
    const m = this.marquee; if (!m) return;
    const rect = this.sheet.clipboard && this.sheet.clipboard.rect;
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
    this.nameBox.textContent = refKey(dA.r, dA.c);
    if (cell.formula) {
      fc.className = 'fcontent isfx';
      const { refs } = parseFormulaRefs(cell.formula);
      fc.innerHTML = buildFormulaHTML(cell.formula, refs);
    }
    else if (cell.value !== null && cell.value !== '') { fc.className = 'fcontent'; fc.textContent = typeof cell.value === 'boolean' ? (cell.value ? 'TRUE' : 'FALSE') : String(cell.value); }
    else { fc.className = 'fcontent empty'; fc.textContent = 'empty'; }
  }
}
