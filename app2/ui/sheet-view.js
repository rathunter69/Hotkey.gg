// app2/ui/sheet-view.js — paints a Session's Sheet into the old build's grid DOM. Lifted from
// index.html render() (24082–24495, minus the drill-only decoration), positionMarquee (24496–24518),
// REF_PALETTE/parseFormulaRefs/buildFormulaHTML (24519–24565), updateFormulaBar (24566–24588) and
// the ResizeObserver / resize re-fit (29275–29299). Every class name and inline style is the old
// one, so app.css applies unchanged.
//
//   const view = new SheetView(stageMainEl, session);   // appends .fbar + .gridwrap to el
//   view.render();                                       // (re-runs on session.onChange)
//   view.destroy();

import { COLW_DEFAULT, cellNumPx, cellTxtPx } from '../engine/sheet.js';
import { dispText } from '../engine/format.js';
import { colLetter, refKey, parseRef } from '../engine/refs.js';
import { formulaRefs, isErrVal } from '../engine/formula.js';

// Excel's classic formula-highlighting palette — saturated, universally recognizable, works on
// both dark and light themes. Same as Office Theme Accents 1, Red, Green, Purple, Accent 2, Gray.
export const REF_PALETTE = ['#4286D0', '#C62828', '#2E7D32', '#8E24AA', '#EF6C00', '#6D4C41'];
const ROW_CAP = 20;   // the 20-row standard canvas

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
    this.el = el; this.session = session; this.sheet = session.sheet;
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
    this._renderedGwH = 0; this._renderedGwW = 0; this._measureRetry = 0; this._roPend = false; this._rzT = null;
    this.ew = {}; this.VR = ROW_CAP;

    this.unsub = session.onChange(() => this.render());
    // re-fit when the box settles to a different size (>6px either axis)
    this.ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => {
      if (this._roPend) return; this._roPend = true;
      requestAnimationFrame(() => { this._roPend = false; if (this.destroyed) return;
        const w = this.gw; if (w.clientHeight <= 100) return;
        if (Math.abs(w.clientHeight - this._renderedGwH) > 6 || Math.abs(w.clientWidth - this._renderedGwW) > 6) this.render(); });
    }) : null;
    if (this.ro) this.ro.observe(gw);
    this._onResize = () => { clearTimeout(this._rzT); this._rzT = setTimeout(() => { if (this.destroyed) return; this.render(); requestAnimationFrame(() => { if (!this.destroyed) this.render(); }); }, 120); };
    window.addEventListener('resize', this._onResize);
    this.render();
  }

  destroy() {
    this.destroyed = true;
    if (this.unsub) this.unsub();
    if (this.ro) this.ro.disconnect();
    window.removeEventListener('resize', this._onResize); clearTimeout(this._rzT);
    this.fbar.remove(); this.gw.remove(); this.el.classList.remove('sheet-view');
  }

  /** The one grid write. */
  render() {
    if (this.destroyed) return;
    const S = this.sheet, ss = this.session, gw = this.gw;
    const COLS = S.cols, ROWS = S.rows, colW = S.colW;

    // ELASTIC FIT (r55): distribute the gridwrap's spare width across all columns, or scale them
    // down (floor 40px) — the sheet fills its box on any screen without cutting columns.
    const availW = gw.clientWidth - 28 - 30;      // padding 14×2 + row header
    this._renderedGwW = gw.clientWidth;
    let base = 0; for (let c = 1; c <= COLS; c++) base += (colW[c] || 72);
    const ew = {};
    if (availW > base) {
      const per = Math.floor((availW - base) / COLS);
      for (let c = 1; c <= COLS; c++) ew[c] = (colW[c] || 72) + per;
    } else if (base > availW && availW > 0) {
      const scale = availW / base;
      for (let c = 1; c <= COLS; c++) ew[c] = Math.max(40, Math.round((colW[c] || 72) * scale));
    } else {
      for (let c = 1; c <= COLS; c++) ew[c] = (colW[c] || 72);
    }
    this.ew = ew;   // display widths (elastic); the #### verdict below reads the ENGINE widths

    // row canvas: the 20-row standard, floored at content; measured once the box has laid out
    let rowH = ROWS <= 8 ? 32 : (ROWS <= 10 ? 29 : (ROWS <= 12 ? 26 : 24));   // pre-measure fallback
    const VR = Math.max(ROWS, ROW_CAP);
    if (gw.clientHeight > 100) {
      const availH = gw.clientHeight - 17 - 31;   // usable height minus header
      rowH = Math.max(18, Math.min(40, Math.floor(availH / VR)));
      this._renderedGwH = gw.clientHeight;
    } else if (!this._measureRetry) {
      // first paint often lands before the box has laid out — schedule ONE post-layout re-render
      this._measureRetry = 1;
      requestAnimationFrame(() => requestAnimationFrame(() => { this._measureRetry = 0; if (!this.destroyed && this.gw.clientHeight > 100) this.render(); }));
    }
    gw.style.setProperty('--cellh', rowH + 'px');
    this.VR = VR;

    const sr = S.selRange();
    let refColors = {};
    if (ss.editing) refColors = parseFormulaRefs(ss.editBuf).cellColors;
    const editing = ss.editing, editPointer = ss.editPointer;

    // header row — no active-column highlight (the old build had none)
    let gh = '<tr><th class="rowhdr"></th>';
    for (let c = 1; c <= COLS; c++) gh += `<th style="min-width:${ew[c]}px">${colLetter(c)}</th>`;
    gh += '</tr>';

    // the DISPLAYED active cell is the selection ANCHOR (Excel-true)
    const dA = S.dispActive();
    // FULL-COLUMN selection reads to the BOTTOM OF THE CANVAS: filler rows carry the tint + side
    // edges and the green bottom edge rides the LAST RENDERED row, not the frame seam.
    const fullColSel = !!(S.sel && sr.r1 <= 1 && sr.r2 >= ROWS && VR > ROWS);
    for (let r = 1; r <= VR; r++) {
      if (r > ROWS) {   // empty Excel-style filler rows below the content (visual only — cursor clamps at ROWS)
        let fr = '<tr><th class="rowhdr">' + r + '</th>';
        for (let c = 1; c <= COLS; c++) {
          let fcls = 'fillcell';
          if (fullColSel && c >= sr.c1 && c <= sr.c2) {
            fcls += ' sel';
            if (c === sr.c1) fcls += ' sel-l'; if (c === sr.c2) fcls += ' sel-r';
            if (r === VR) fcls += ' sel-b';
          }
          fr += '<td class="' + fcls + '"></td>';
        }
        gh += fr + '</tr>'; continue;
      }
      let row = `<tr><th class="rowhdr">${r}</th>`;
      for (let c = 1; c <= COLS; c++) {
        const cell = S.get(r, c);
        const isNum = typeof cell.value === 'number';
        const cls = [];
        if (cell.bold) cls.push('bold'); if (cell.txt && !isNum) cls.push('txt');
        if (isErrVal(cell.value)) cls.push('err');
        if (cell.it) cls.push('it'); if (cell.strike) cls.push('strike');
        if (cell.uline) cls.push('uline');
        if (cell.cmt) cls.push('cmt');
        if (cell.wrap) cls.push('wrap'); if (cell.fill) cls.push('fill-' + cell.fill);
        if (cell.bt) cls.push('bt'); if (cell.bb) cls.push('bb'); if (cell.ball) cls.push('ball'); if (cell.bdbl) cls.push('bdbl');
        if (cell.bl) cls.push('bl'); if (cell.br) cls.push('br'); if (cell.thick) cls.push('thick');
        if (cell.align) cls.push('align-' + cell.align);
        if (cell.fontColor) cls.push('fc-' + cell.fontColor);
        const isActive = (r === dA.r && c === dA.c);
        const inSel = (r >= sr.r1 && r <= sr.r2 && c >= sr.c1 && c <= sr.c2);
        if (isActive) cls.push('active');
        else if (inSel && S.sel) cls.push('sel');
        const isPoint = editing && editPointer && r === editPointer.r && c === editPointer.c;
        if (isPoint) cls.push('point');
        if (S.sel && inSel) { if (r === sr.r1) cls.push('sel-t'); if (r === sr.r2 && !fullColSel) cls.push('sel-b'); if (c === sr.c1) cls.push('sel-l'); if (c === sr.c2) cls.push('sel-r'); }
        // Excel's fill-handle — the tiny green square at the selection's bottom-right (or on the lone active cell)
        if (S.sel) { if (r === sr.r2 && c === sr.c2) cls.push('fh'); } else if (isActive) cls.push('fh');

        let txt = escHtml(dispText(cell));
        if (editing && isActive) {
          // Editing cell: the formula buffer with coloured refs (matches the formula bar), in the pop-out overlay
          const { refs } = parseFormulaRefs(ss.editBuf);
          cls.push('editing');
          txt = '<span class="edbox"><span class="edin">' + buildFormulaHTML(ss.editBuf, refs, ss.editCaret) + '</span></span>';
        }
        else if (cell.txt && (cell.ca | 0) > 1 && typeof cell.value === 'string') {
          // CENTER ACROSS SELECTION — the anchor's text centers over its stored span; no merged cells
          let caw = 0; for (let k2 = 0; k2 < cell.ca && c + k2 <= COLS; k2++) caw += ew[c + k2];
          cls.push('spill');
          txt = '<span class="sp" style="width:' + (caw - 12) + 'px;max-width:' + (caw - 12) + 'px;text-align:center;display:inline-block">' + txt + '</span>';
        }
        else if (cell.txt && !cell.wrap && typeof cell.value === 'string') {
          // EXCEL PARITY — long text SPILLS across empty right neighbours, clipping at the first occupied cell
          const est = cellTxtPx(cell);
          if (est > ew[c]) {
            let spillW = ew[c], cc = c + 1;
            while (cc <= COLS) { const n = S.get(r, cc); if (n && n.value !== null && n.value !== '') break; spillW += ew[cc]; cc++; }
            if (spillW > ew[c]) {
              cls.push('spill');
              // the highlighted anchor's outline/tint covers ONLY its own cell; the text paints on top
              const hi = (isActive || (inSel && S.sel)) ? '<span class="sphi" style="width:' + ew[c] + 'px"></span>' : '';
              txt = hi + '<span class="sp" style="max-width:' + (spillW - 12) + 'px">' + txt + '</span>';
            }
          }
        }
        else if (isNum && !cell.wrap) {
          // #### reads the ENGINE width (unscaled colW), never the elastic display width
          const tw = cellNumPx(cell);
          const ownW = colW[c] || COLW_DEFAULT;
          if (tw > ownW) { cls.push('over'); txt = '#'.repeat(Math.max(3, Math.floor(ew[c] / 8))); }
        }

        const refColor = refColors[refKey(r, c)];
        let extraStyle = '';
        if (refColor && !isActive && !isPoint) {
          extraStyle = `;outline:2px solid ${refColor};outline-offset:-2px;z-index:2`;
        }
        if (cell.indent) {   // Alt H 6/5 indent — pad the content gutter (right edge for right-aligned cells)
          const pad = 9 + (cell.indent | 0) * 13;
          extraStyle += (cell.align === 'r') ? (';padding-right:' + pad + 'px') : (';padding-left:' + pad + 'px');
        }
        if (cell.fsz) extraStyle += ';font-size:' + cell.fsz + 'px';   // grow/shrink font (Alt H F G/K)
        row += `<td data-r="${r}" data-c="${c}" class="${cls.join(' ')}" style="min-width:${ew[c]}px;max-width:${ew[c]}px${extraStyle}">${txt}</td>`;
      }
      gh += row + '</tr>';
    }
    this.grid.innerHTML = gh;   // the one and only grid write

    try { document.body.classList.toggle('hide-gridlines', !S.gridlines); } catch (e) { /* no body */ }
    this.positionMarquee();
    const f = S.lastFlash;
    if (f) { S.lastFlash = null;
      for (let r = f.r1; r <= f.r2; r++) for (let c = f.c1; c <= f.c2; c++) {
        const td = this.grid.querySelector(`td[data-r="${r}"][data-c="${c}"]`); if (td) td.classList.add('pasted'); } }
    this.updateFormulaBar();
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
