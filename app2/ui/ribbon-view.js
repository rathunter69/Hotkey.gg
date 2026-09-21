// app2/ui/ribbon-view.js — paints the Alt ribbon strip, its lean/open menus, the swatch dropdown
// and the Paste Special / Format Cells cards from a Session's ribbon state. Lifted from
// index.html __drawRibbon (24847–24964), __leanRibbonHtml/__ribbonPin/__ribbonDrop (24786–24846),
// drawDialog/positionDialog (24734–24778). The Session owns mode/path/dialog; this only reads them.
//
//   const rv = new RibbonView(ribbonSlotEl, session);   // creates <div class="ribbon" id="ribbon"> in the slot
//   rv.render();                                        // (re-runs on session.onChange)

import { TABS, MENUS, RIBBON_GROUPS, RIBBON_ICONS, RIBBON_MENU_ICONS, FMT_OPTS, PASTE_OPTS, PASTE_OP_OPTS, tabName } from '../engine/ribbon.js';
import { FONT_SWATCHES, FILL_SWATCHES, CELL_STYLES } from '../engine/sheet.js';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const BAR_KEY = 'hk_ribbon_bar';

/** The per-device "always-on lean bar" pin. */
export function ribbonBarOn() { try { return localStorage.getItem(BAR_KEY) === '1'; } catch (e) { return false; } }

/**
 * EVERY menu in the same lean format. Icons are PATH-AWARE (the same letter means different
 * commands on different menus); menus without icons render badge+label text chips in the identical
 * chip family, so Alt through any path stays one 34px row.
 */
export function leanRibbonHtml(menuKey, withExtra) {
  menuKey = menuKey || 'H';
  const opts = MENUS[menuKey], groups = RIBBON_GROUPS[menuKey];
  if (!opts) return '<span class="rhint"><k>alt</k> ribbon</span>';
  const lblOf = {}; opts.forEach(([k, l]) => lblOf[k] = l);
  const chord = menuKey.toLowerCase().split('').join(' ');
  const icons = menuKey === 'H' ? RIBBON_ICONS : (RIBBON_MENU_ICONS[menuKey] || {});
  const tile = (k) => { const ico = icons[k];
    const tip = String(lblOf[k]).replace(/<[^>]+>/g, '') + ' — alt ' + chord + ' ' + k.toLowerCase();
    // KeyTip BADGES render UPPERCASE (Excel's keytips are capital letters); data-k stays lowercase (dropdown anchor lookup)
    if (ico) return '<span class="ri-cmd" data-k="' + k.toLowerCase() + '" title="' + esc(tip) + '"><span class="ri-key">' + k.toUpperCase() + '</span><span class="ri-ico">' + ico + '</span></span>';
    return '<span class="ri-cmd ri-txt" data-k="' + k.toLowerCase() + '" title="' + esc(tip) + '"><span class="ri-key">' + k.toUpperCase() + '</span><span class="ri-lbl">' + lblOf[k] + '</span></span>'; };
  const used = new Set();
  let html = '';
  (groups || []).forEach(([, keys]) => {
    let cells = '';
    keys.forEach(k => { if (lblOf[k] === undefined) return; cells += tile(k); used.add(k); });
    if (cells) html += '<span class="rgrp rgrp-ico"><span class="rgrp-chips">' + cells + '</span></span>';
  });
  if (withExtra || !groups) {
    const extra = opts.filter(([k]) => !used.has(k));
    if (extra.length) { let c = ''; extra.forEach(([k]) => c += tile(k));
      html += '<span class="rgrp rgrp-ico"><span class="rgrp-chips">' + c + '</span></span>'; }
  }
  return html;
}

function pinHtml(on) {
  return '<span class="rpin' + (on ? ' on' : '') + '" title="' + (on ? 'switch back to the alt-only flyout' : 'always show the ribbon as a lean bar') + '">bar: ' + (on ? 'on' : 'off') + '</span>';
}

export class RibbonView {
  /**
   * @param {HTMLElement} el   the .ribbon-slot (a .ribbon child is created) or an existing .ribbon
   * @param {import('../engine/keyboard.js').Session} session
   */
  constructor(el, session) {
    this.session = session;
    if (el.classList.contains('ribbon')) this.el = el;
    else {
      this.el = el.querySelector('.ribbon');
      if (!this.el) { this.el = document.createElement('div'); this.el.className = 'ribbon'; this.el.id = 'ribbon'; el.appendChild(this.el); }
    }
    this.slot = this.el.parentElement;
    this.drop = null; this.pasteDialog = null; this.fmtDialog = null;
    this.unsub = session.onChange(() => this.render());
    this.render();
  }

  destroy() {
    if (this.unsub) this.unsub();
    this.dropKill();
    if (this.pasteDialog) this.pasteDialog.remove();
    if (this.fmtDialog) this.fmtDialog.remove();
    this.el.remove();
  }

  /* ---- the floating cards (siblings of the page, fixed) ---- */
  card(id, title, footer, groupTitle) {
    let d = document.getElementById(id);
    if (!d) {
      d = document.createElement('div'); d.className = 'pd-backdrop'; d.id = id;
      d.innerHTML = '<div class="pd-box">' +
        '<div class="pd-title">' + title + ' <span class="x">esc to cancel</span></div>' +
        '<div class="pd-group">' + (groupTitle ? '<h4>' + groupTitle + '</h4>' : '') + '<div class="pd-opts"></div></div>' +
        '<div class="pd-foot">' + footer + '</div>' +
        '</div>';
      document.body.appendChild(d);
    }
    return d;
  }
  positionDialog(d) {
    // float the card over the SHEET like Excel — lower half so source rows stay readable
    try { const gw = (this.slot && this.slot.parentElement && this.slot.parentElement.querySelector('.gridwrap')) || document.querySelector('.gridwrap');
      if (gw) { const wr = gw.getBoundingClientRect();
        d.style.left = Math.max(8, wr.left + wr.width / 2 - 140) + 'px';
        const want = Math.round(wr.top + wr.height * 0.30);
        d.style.top = Math.max(8, Math.min(want, window.innerHeight - (d.offsetHeight || 360) - 14)) + 'px'; } } catch (e) { /* not laid out */ }
  }
  drawDialog() {
    const ss = this.session;
    if (ss.dialog === 'paste' || this.pasteDialog) {
      const d = this.pasteDialog || (this.pasteDialog = this.card('pasteDialog', 'Paste Special',
        '<span class="pd-btn">Cancel <kbd>esc</kbd></span><span class="pd-btn ok">OK <kbd>↵</kbd></span>', 'Paste'));
      if (ss.dialog !== 'paste') d.style.display = 'none';
      else {
        d.style.display = 'flex';
        let rows = '';
        PASTE_OPTS.forEach(([k, lbl, kind]) => {
          const on = ss.pasteKind === kind;
          rows += `<div class="pd-opt${on ? ' on' : ''}"><span class="pd-radio">${on ? '●' : '○'}</span><span class="pd-key">${k}</span><span>${lbl}</span></div>`;
        });
        rows += '<div class="pd-sect">operation</div>';
        PASTE_OP_OPTS.forEach(([k, lbl, op]) => {
          const on = ss.pasteOp === op;
          rows += `<div class="pd-opt${on ? ' on' : ''}"><span class="pd-radio">${on ? '●' : '○'}</span><span class="pd-key">${k}</span><span>${lbl}</span></div>`;
        });
        d.querySelector('.pd-opts').innerHTML = rows;
        this.positionDialog(d);
      }
    }
    // Ctrl+1 Format Cells — a compact standalone card like Paste Special, grouped like Excel's tabs
    // (Number / Font / Alignment) pared to the desk set; a letter applies instantly.
    if (ss.dialog === 'fmt' || this.fmtDialog) {
      const fd = this.fmtDialog || (this.fmtDialog = this.card('fmtDialog', 'Format Cells',
        '<span class="pd-btn">a letter applies · <kbd>esc</kbd> cancels</span>'));
      if (ss.dialog !== 'fmt') fd.style.display = 'none';
      else {
        fd.style.display = 'flex';
        const byK = {}; FMT_OPTS.forEach(([k, lbl]) => byK[k] = lbl);
        const groups = [['number', ['G', 'N', 'C', 'P', 'X', 'D', 'S', 'M']], ['font', ['E', 'K']], ['alignment', ['A']]];
        let frows = '';
        groups.forEach(([sect, keys]) => { frows += `<div class="pd-sect">${sect}</div>`;
          keys.forEach(k => { if (byK[k] !== undefined) frows += `<div class="pd-opt"><span class="pd-key">${k.toLowerCase()}</span><span>${byK[k]}</span></div>`; }); });
        fd.querySelector('.pd-opts').innerHTML = frows;
        this.positionDialog(fd);
      }
    }
  }

  /* ---- the anchored colour dropdown ---- */
  dropKill() { if (this.drop) { this.drop.remove(); this.drop = null; } const stray = document.getElementById('ribbonDrop'); if (stray) stray.remove(); }
  dropShow(tileKey, innerHtml) {
    this.dropKill();
    const d = document.createElement('div'); d.id = 'ribbonDrop'; d.className = 'rdrop'; d.innerHTML = innerHtml;
    document.body.appendChild(d); this.drop = d;
    const anchor = this.el.querySelector('.ri-cmd[data-k="' + tileKey + '"]');
    const ar = (anchor || this.el).getBoundingClientRect();
    const dw = d.offsetWidth;
    d.style.left = Math.max(8, Math.min(window.innerWidth - dw - 8, ar.left)) + 'px';
    d.style.top = (ar.bottom + 4) + 'px';
  }

  wirePin() {
    const p = this.el.querySelector('.rpin'); if (!p) return;
    p.onclick = () => { try { localStorage.setItem(BAR_KEY, ribbonBarOn() ? '0' : '1'); } catch (e) { /* storage blocked */ } this.render(); };
  }

  render() {
    try { this.paint(); } catch (err) {
      // paint armor — a rendering bug must NEVER strand the player in an invisible ribbon mode
      try { const ss = this.session; this.el.className = 'ribbon show'; this.el.innerHTML = '<span class="path">' + (ss.path.length ? ss.path.join(' ') : 'alt') + ' →</span><span class="opt">… · esc backs out</span>'; } catch (e2) { /* nothing left to do */ }
      try { console.error('ribbon paint:', err); } catch (e3) { /* no console */ }
    }
  }

  paint() {
    const ss = this.session, el = this.el;
    this.drawDialog();
    this.dropKill();
    if (ss.dialog === 'fxfix') {
      // the FORMULA AUTOCORRECT proposal card — shows while still in cell-edit (mode 'normal', editing)
      el.className = 'ribbon show';
      el.innerHTML = '<span class="path">formula autocorrect →</span>' +
        '<span class="opt" style="font-family:var(--mono)">' + esc(ss.fxfixPend ? ss.fxfixPend.fixed : '') + '</span>' +
        '<span class="opt">↵ accept · esc keep editing</span>';
      return;
    }
    if (ss.mode !== 'ribbon') {
      if (ribbonBarOn()) { el.className = 'ribbon show ribbon-ico ribbon-lean'; el.innerHTML = leanRibbonHtml() + pinHtml(true); }
      else { el.className = 'ribbon'; el.innerHTML = '<span class="rhint"><k>alt</k> ribbon</span>' + pinHtml(false); }
      this.wirePin(); return;
    }
    if (ss.dialog === 'paste') { el.className = 'ribbon show';
      el.innerHTML = '<span class="path">paste special →</span><span class="opt">letters pick · m/d set the operation · ↵ apply · esc cancel</span>';   // the floating card carries the options
      return; }
    if (ss.dialog === 'fmt') { el.className = 'ribbon show';
      el.innerHTML = '<span class="path">format cells →</span><span class="opt">letters apply · esc cancel</span>';
      return; }
    if (ss.dialog === 'fontcolor' || ss.dialog === 'fillcolor') {
      // the strip keeps showing the lean Home row; a small palette DROPDOWN anchors under the
      // triggering tile (Font for Alt H F C, Fill for Alt H H). ← → pick, ↵ apply, esc cancel.
      el.className = 'ribbon show ribbon-ico ribbon-lean ribbon-open';
      el.innerHTML = leanRibbonHtml('H', true);
      const isFont = ss.dialog === 'fontcolor';
      const SW = isFont ? FONT_SWATCHES : FILL_SWATCHES, idx = isFont ? ss.fontColorIdx : ss.fillColorIdx;
      let drop = '<div class="rdrop-cap">' + (isFont ? 'font color' : 'fill color') + '</div><div class="rdrop-sw">';
      SW.forEach((sw, i) => { const bg = (sw.k === null) ? 'repeating-linear-gradient(45deg,#bbb 0 4px,#eee 4px 8px)' : sw.hex;
        drop += '<span class="fc-swatch' + (i === idx ? ' on' : '') + '" style="background:' + bg + '"></span>'; });
      drop += '</div><div class="rdrop-name">' + SW[idx].name + '</div>' +
        '<div class="rdrop-hint">← → pick · ↵ apply · esc cancel</div>';
      this.dropShow(isFont ? 'f' : 'h', drop);
      return;
    }
    if (ss.dialog === 'cellstyle') {   // cell-styles gallery — chip row, arrows walk it, ↵ applies
      el.className = 'ribbon show';
      let html = '<span class="path">cell styles →</span>';
      CELL_STYLES.forEach((st, i) => { html += `<span class="opt${i === ss.cellStyleIdx ? ' on' : ''}">${st.name}</span>`; });
      html += '<span class="opt">← → pick · ↵ apply · esc cancel</span>';
      el.innerHTML = html; return;
    }
    if (ss.dialog === 'colw') {
      el.className = 'ribbon show';
      el.innerHTML = '<span class="path">column width →</span><span class="opt" style="font-family:var(--mono)">' + esc(ss.colwBuf || '…') + '</span><span class="opt">type a width (Excel units) · ↵ apply · esc cancel</span>';
      return;
    }
    if (ss.dialog === 'sortwarn') {
      el.className = 'ribbon show';
      el.innerHTML = '<span class="path">sort warning →</span><span class="opt"><k>e</k>Expand the selection</span><span class="opt"><k>c</k>Continue with the current selection</span><span class="opt">data sits NEXT to your column — ↵ = expand (Excel’s default) · esc cancel</span>';
      return;
    }
    if (ss.dialog === 'series') {
      el.className = 'ribbon show';
      el.innerHTML = '<span class="path">series →</span><span class="opt">linear, step from selection · <kbd>↵</kbd> apply · <kbd>esc</kbd> cancel</span>';
      return;
    }
    if (ss.dialog) {   // a dialog this painter has no card for — a minimal strip so Esc always reads
      el.className = 'ribbon show';
      el.innerHTML = '<span class="path">' + esc(ss.dialog) + ' →</span><span class="opt">esc cancel</span>';
      return;
    }
    el.className = 'ribbon show';
    let icoRibbon = false;   // the icon ribbon spreads its groups edge-to-edge to fill the bar
    let html = '';
    if (ss.path.length === 0) {
      html += '<span class="path">alt →</span>';
      TABS.forEach(t => { html += `<span class="rtab${t.live ? '' : ' dim'}"><k>${t.k}</k>${t.name}</span>`; });   // uppercase KeyTips, Excel-true
      if (ss.note) html += `<span class="rnote">${esc(ss.note)}</span>`;
    } else {
      html += `<span class="path">${tabName(ss.path[0])}${ss.path.length > 1 ? ' ' + ss.path.slice(1).join(' ') : ''} →</span>`;
      const key = ss.path.join('');
      if (MENUS[key]) {
        icoRibbon = true;
        // EVERY menu path renders the same lean one-row bar (icon tiles where drawn, badge+label
        // chips otherwise), tinted .show — the ribbon never changes size, only state.
        html += leanRibbonHtml(key, true);
      }
      else html += '<span class="opt">…</span>';
    }
    if (icoRibbon) el.className = 'ribbon show ribbon-ico ribbon-lean ribbon-open';
    el.innerHTML = html;
  }
}
