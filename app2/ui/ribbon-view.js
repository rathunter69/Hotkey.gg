// app2/ui/ribbon-view.js — paints the ribbon from a Session's ribbon state, in one of two modes:
//   'slim'  the Alt strip (index.html __drawRibbon 24847–24964, __leanRibbonHtml/__ribbonPin/
//           __ribbonDrop 24786–24846, drawDialog/positionDialog 24734–24778): idle hint, Alt tabs,
//           lean one-row menus, the colour dropdown and the Paste Special / Format Cells cards.
//   'full'  the Excel ribbon bar (SITE_SPEC §4): a tab row, then the tab's groups with labelled
//           command buttons (icon over label, group name beneath). Every engine command is live;
//           every real Excel command the engine lacks renders disabled. Alt draws the KeyTips on
//           the tabs, then on the open tab's buttons, exactly where the letters land.
// Both modes: every button, tile, dropdown item, card option and swatch is clickable and runs
// through ui/ribbon-commands.js, and every workspace click is recorded on the session (§6).
// The Session owns mode/path/dialog; this reads them and writes only through its public methods.
//
//   const rv = new RibbonView(ribbonSlotEl, session, { mode: 'full' | 'slim' });   // creates <div class="ribbon" id="ribbon"> in the slot
//   rv.setMode('slim');                                  // the learner's toggle persists to localStorage 'hk2_ribbon'
//   rv.render();                                         // (re-runs on session.onChange)

import { TABS, MENUS, RIBBON_GROUPS, RIBBON_ICONS, RIBBON_MENU_ICONS, FMT_OPTS, PASTE_OPTS, PASTE_OP_OPTS, COMMANDS, tabName } from '../engine/ribbon.js';
import { FONT_SWATCHES, FILL_SWATCHES, CELL_STYLES } from '../engine/sheet.js';
import { RIBBON_COMMANDS, RIBBON_LAYOUT, MENU_META, VIRTUAL_MENUS, UNIMPLEMENTED_BY_ID, MODAL_DIALOGS,
  itemTip, keyTipAt, runCommand, openMenuPath, recordMouse, closeDialog, leaveRibbon, menuEntries } from './ribbon-commands.js';

const COLLAPSED_W = 62;   // a collapsed group's button + its padding (Excel folds the rightmost groups when the bar is narrow)

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const BAR_KEY = 'hk_ribbon_bar';
const MODE_KEY = 'hk2_ribbon';
const spaced = np => String(np).split('').join(' ');

/** The per-device "always-on lean bar" pin of the old build (slim mode's idle look when set). */
export function ribbonBarOn() { try { return localStorage.getItem(BAR_KEY) === '1'; } catch (e) { return false; } }
/** The learner's remembered ribbon mode ('full' | 'slim'), or null when the host's default applies. */
export function storedRibbonMode() { try { const v = localStorage.getItem(MODE_KEY); return v === 'full' || v === 'slim' ? v : null; } catch (e) { return null; } }
export function storeRibbonMode(mode) { try { localStorage.setItem(MODE_KEY, mode); } catch (e) { /* storage blocked: the session keeps the choice */ } }

/** What a click on the tile `k` at menu `menuKey` does: the command, or one level deeper. */
function tileAct(menuKey, k) {
  const np = menuKey + k.toUpperCase();
  if (COMMANDS[np] !== undefined && RIBBON_COMMANDS[np]) return 'cmd:' + np;
  if (MENUS[np] !== undefined) return 'menu:' + np;
  return '';
}

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
    const act = tileAct(menuKey, k); const actAttr = act ? ' data-act="' + act + '"' : '';
    // KeyTip BADGES render UPPERCASE (Excel's keytips are capital letters); data-k stays lowercase (dropdown anchor lookup)
    if (ico) return '<span class="ri-cmd" data-k="' + k.toLowerCase() + '"' + actAttr + ' title="' + esc(tip) + '"><span class="ri-key">' + k.toUpperCase() + '</span><span class="ri-ico">' + ico + '</span></span>';
    return '<span class="ri-cmd ri-txt" data-k="' + k.toLowerCase() + '"' + actAttr + ' title="' + esc(tip) + '"><span class="ri-key">' + k.toUpperCase() + '</span><span class="ri-lbl">' + lblOf[k] + '</span></span>'; };
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

const swatchesHtml = (SW, idx) => SW.map((sw, i) => { const bg = (sw.k === null) ? 'repeating-linear-gradient(45deg,#bbb 0 4px,#eee 4px 8px)' : sw.hex;
  return '<span class="fc-swatch' + (i === idx ? ' on' : '') + '" data-act="swatch:' + i + '" title="' + esc(sw.name) + '" style="background:' + bg + '"></span>'; }).join('');

export class RibbonView {
  /**
   * @param {HTMLElement} el   the .ribbon-slot (a .ribbon child is created) or an existing .ribbon
   * @param {import('../engine/keyboard.js').Session} session
   * @param {object} [opts]    mode: 'full' | 'slim' (the host's default; a stored learner override wins)
   */
  constructor(el, session, opts = {}) {
    this.session = session;
    if (el.classList.contains('ribbon')) this.el = el;
    else {
      this.el = el.querySelector('.ribbon');
      if (!this.el) { this.el = document.createElement('div'); this.el.className = 'ribbon'; this.el.id = 'ribbon'; el.appendChild(this.el); }
    }
    this.slot = this.el.parentElement;
    this.hostMode = opts.mode === 'full' ? 'full' : 'slim';
    this.mode = storedRibbonMode() || this.hostMode;
    this.tab = 'H';            // the full bar's selected tab
    this.localMenu = null;     // a view-owned dropdown (a MENU_META key with `items`), e.g. Home › Sort & Filter
    this.drop = null; this.pasteDialog = null; this.fmtDialog = null;
    this._onClick = e => this.onClick(e);
    this._onDown = e => { if (e.button === 0 && !e.target.closest('input,textarea,select')) e.preventDefault(); };   // a press never steals focus from the sheet, nor starts a text selection
    this.el.addEventListener('click', this._onClick);
    this.el.addEventListener('mousedown', this._onDown);
    this._docDown = e => this.onDocumentDown(e);
    this._docKey = e => { if (this.localMenu && e.key === 'Escape') { this.localMenu = null; this.render(); e.preventDefault(); e.stopImmediatePropagation(); } };
    document.addEventListener('mousedown', this._docDown, true);
    document.addEventListener('keydown', this._docKey, true);
    this._fitKey = ''; this._fitSet = new Set(); this._tipGroup = {};   // which groups are folded at the current width, and where a folded tip anchors
    this._onResize = () => { clearTimeout(this._rzT); this._rzT = setTimeout(() => this.render(), 120); };
    window.addEventListener('resize', this._onResize);
    this.unsub = session.onChange(what => { if (what === 'key' && this.localMenu) this.localMenu = null; this.render(); });
    this.render();
  }

  destroy() {
    if (this.unsub) this.unsub();
    document.removeEventListener('mousedown', this._docDown, true);
    document.removeEventListener('keydown', this._docKey, true);
    this.dropKill();
    if (this.pasteDialog) this.pasteDialog.remove();
    if (this.fmtDialog) this.fmtDialog.remove();
    window.removeEventListener('resize', this._onResize); clearTimeout(this._rzT);
    if (this.slot) this.slot.classList.remove('rib-full');
    this.el.remove();
  }

  /** 'full' | 'slim'. `persist` remembers the learner's choice on this device (the toggle does). */
  setMode(mode, persist) {
    this.mode = mode === 'full' ? 'full' : 'slim';
    if (persist) storeRibbonMode(this.mode);
    this.localMenu = null;
    this.render();
  }

  /* ---- mouse: every control routes through ribbon-commands, and is recorded ---- */
  onDocumentDown(e) {
    const t = e.target; if (!t || !t.closest) return;
    const inside = t.closest('.ribbon') || t.closest('.rdrop') || t.closest('.pd-backdrop');
    if (inside) return;
    if (this.localMenu) { this.localMenu = null; this.render(); }
    const ss = this.session;
    if (ss.mode !== 'ribbon' || MODAL_DIALOGS.has(ss.dialog)) return;
    if (t.closest('.gridwrap')) return;   // the sheet closes the walk itself as part of its own click
    ss.exitRibbon(false); ss.emit('mouse');   // a click elsewhere on the page dismisses KeyTips and dropdowns (Excel)
  }
  onClick(e) {
    const t = e.target; if (!t || !t.closest) return;
    const seg = t.closest('.rpin-b'); if (seg) { this.setMode(seg.dataset.mode, true); return; }   // a page control: never counts as mouse use
    const tab = t.closest('.rf-tab'); if (tab) { this.clickTab(tab.dataset.tab); return; }
    const b = t.closest('[data-act]'); if (!b) return;
    if (b.classList.contains('dis') || b.getAttribute('aria-disabled') === 'true') return;
    this.act(b.dataset.act);
  }
  clickTab(k) {
    const ss = this.session; const t = TABS.find(x => x.k === k); if (!t) return;
    if (MODAL_DIALOGS.has(ss.dialog)) return;
    this.tab = k; this.localMenu = null;
    if (ss.mode === 'ribbon') ss.exitRibbon(false);   // the mouse took over: KeyTips go, the tab shows
    recordMouse(ss, 'ribbon:' + k);
    ss.emit('mouse');
  }
  /** One control's action: 'cmd:<id>' 'menu:<key>' 'letter:<K>' 'enter' 'cancel' 'swatch:<i>' 'style:<i>'. */
  act(act) {
    const ss = this.session;
    const [kind, arg] = String(act).split(':');
    const inDialog = kind === 'letter' || kind === 'enter' || kind === 'cancel' || kind === 'swatch' || kind === 'style';
    if (MODAL_DIALOGS.has(ss.dialog) && !inDialog) return;   // a modal card owns the input
    if (kind === 'cmd') {
      if (!runCommand(ss, arg)) { ss.emit('mouse'); return; }   // a refused edit keeps the editor open
      this.localMenu = null; recordMouse(ss, 'ribbon:' + arg); ss.emit('mouse'); return;
    }
    if (kind === 'group') {
      const key = 'group:' + arg;
      this.localMenu = this.localMenu === key ? null : key;
      recordMouse(ss, 'ribbon:' + key); ss.emit('mouse'); return;
    }
    if (kind === 'menu') {
      const meta = MENU_META[arg];
      if (meta && meta.items) {   // a view-owned dropdown (no Alt path)
        if (ss.mode === 'ribbon') ss.exitRibbon(false);
        this.localMenu = this.localMenu === arg ? null : arg;
        recordMouse(ss, 'ribbon:' + arg); ss.emit('mouse'); return;
      }
      this.localMenu = null;
      if (ss.mode === 'ribbon' && ss.path.join('') === arg && !ss.dialog) leaveRibbon(ss);   // the open menu's button closes it
      else {
        if (ss.editing && !ss.commitEdit(0, 0, { kind: 'move' })) { ss.emit('mouse'); return; }
        openMenuPath(ss, arg);
      }
      recordMouse(ss, 'ribbon:' + arg); ss.emit('mouse'); return;
    }
    if (kind === 'letter') { const d = ss.dialog; ss.applyRibbon(arg.toUpperCase()); recordMouse(ss, 'dialog:' + (d || arg)); ss.emit('mouse'); return; }
    if (kind === 'enter') { const d = ss.dialog; ss.applyRibbon('ENTER'); recordMouse(ss, 'dialog:' + (d || 'enter')); ss.emit('mouse'); return; }
    if (kind === 'cancel') { const d = ss.dialog; closeDialog(ss); recordMouse(ss, 'dialog:' + (d || 'cancel')); ss.emit('mouse'); return; }
    if (kind === 'swatch') {
      const i = +arg;
      if (ss.dialog === 'fontcolor') { ss.fontColorIdx = i; ss.applyRibbon('ENTER'); recordMouse(ss, 'ribbon:HFC'); }
      else if (ss.dialog === 'fillcolor') { ss.fillColorIdx = i; ss.applyRibbon('ENTER'); recordMouse(ss, 'ribbon:HH'); }
      ss.emit('mouse'); return;
    }
    if (kind === 'style') { if (ss.dialog === 'cellstyle') { ss.cellStyleIdx = +arg; ss.applyRibbon('ENTER'); recordMouse(ss, 'ribbon:HJ'); } ss.emit('mouse'); }
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
      d.addEventListener('click', this._onClick);
      d.addEventListener('mousedown', this._onDown);
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
        '<span class="pd-btn" data-act="cancel">Cancel <kbd>esc</kbd></span><span class="pd-btn ok" data-act="enter">OK <kbd>↵</kbd></span>', 'Paste'));
      if (ss.dialog !== 'paste') d.style.display = 'none';
      else {
        d.style.display = 'flex';
        let rows = '';
        PASTE_OPTS.forEach(([k, lbl, kind]) => {
          const on = ss.pasteKind === kind;
          rows += `<div class="pd-opt${on ? ' on' : ''}" data-act="letter:${k}"><span class="pd-radio">${on ? '●' : '○'}</span><span class="pd-key">${k}</span><span>${lbl}</span></div>`;
        });
        rows += '<div class="pd-sect">operation</div>';
        PASTE_OP_OPTS.forEach(([k, lbl, op]) => {
          const on = ss.pasteOp === op;
          rows += `<div class="pd-opt${on ? ' on' : ''}" data-act="letter:${k}"><span class="pd-radio">${on ? '●' : '○'}</span><span class="pd-key">${k}</span><span>${lbl}</span></div>`;
        });
        d.querySelector('.pd-opts').innerHTML = rows;
        this.positionDialog(d);
      }
    }
    // Ctrl+1 Format Cells — a compact standalone card like Paste Special, grouped like Excel's tabs
    // (Number / Font / Alignment) pared to the desk set; a letter (or a click) applies instantly.
    if (ss.dialog === 'fmt' || this.fmtDialog) {
      const fd = this.fmtDialog || (this.fmtDialog = this.card('fmtDialog', 'Format Cells',
        '<span class="pd-btn" data-act="cancel">Cancel <kbd>esc</kbd></span><span class="pd-btn">a letter applies</span>'));
      if (ss.dialog !== 'fmt') fd.style.display = 'none';
      else {
        fd.style.display = 'flex';
        const byK = {}; FMT_OPTS.forEach(([k, lbl]) => byK[k] = lbl);
        const groups = [['number', ['G', 'N', 'C', 'P', 'X', 'D', 'S', 'M']], ['font', ['E', 'K']], ['alignment', ['A']]];
        let frows = '';
        groups.forEach(([sect, keys]) => { frows += `<div class="pd-sect">${sect}</div>`;
          keys.forEach(k => { if (byK[k] !== undefined) frows += `<div class="pd-opt" data-act="letter:${k}"><span class="pd-key">${k.toLowerCase()}</span><span>${byK[k]}</span></div>`; }); });
        fd.querySelector('.pd-opts').innerHTML = frows;
        this.positionDialog(fd);
      }
    }
  }

  /* ---- the anchored dropdown (colours, galleries, menus, small dialogs) ---- */
  dropKill() { if (this.drop) { this.drop.remove(); this.drop = null; } const stray = document.getElementById('ribbonDrop'); if (stray) stray.remove(); }
  /** @param {HTMLElement|string} anchor  an element, or a slim-mode tile key ('f', 'h') */
  dropShow(anchor, innerHtml, cls) {
    this.dropKill();
    const d = document.createElement('div'); d.id = 'ribbonDrop'; d.className = 'rdrop' + (cls ? ' ' + cls : ''); d.innerHTML = innerHtml;
    d.addEventListener('click', this._onClick); d.addEventListener('mousedown', this._onDown);
    document.body.appendChild(d); this.drop = d;
    const a = typeof anchor === 'string' ? this.el.querySelector('.ri-cmd[data-k="' + anchor + '"]') : anchor;
    const ar = (a || this.el).getBoundingClientRect();
    const dw = d.offsetWidth;
    d.style.left = Math.max(8, Math.min(window.innerWidth - dw - 8, ar.left)) + 'px';
    d.style.top = (ar.bottom + 4) + 'px';
  }
  /** The full bar's control for a KeyTip path (button or split), else the tab row. */
  anchorFor(...tips) {
    for (const t of tips) {
      if (!t) continue;
      if (t.startsWith('group:')) { const g = this.el.querySelector('[data-group="' + t.slice(6).replace(/"/g, '') + '"] .rf-grpbtn'); if (g) return g; continue; }
      const a = this.el.querySelector('[data-tip="' + t + '"]'); if (a) return a;
      const grp = this._tipGroup[t]; if (grp) { const g = this.el.querySelector('[data-group="' + grp + '"] .rf-grpbtn'); if (g) return g; }
    }
    return this.el.querySelector('.rf-tabs') || this.el;
  }
  swatchDropHtml() {
    const ss = this.session; const isFont = ss.dialog === 'fontcolor';
    const SW = isFont ? FONT_SWATCHES : FILL_SWATCHES, idx = isFont ? ss.fontColorIdx : ss.fillColorIdx;
    return '<div class="rdrop-cap">' + (isFont ? 'font color' : 'fill color') + '</div><div class="rdrop-sw">' + swatchesHtml(SW, idx) + '</div>' +
      '<div class="rdrop-name">' + SW[idx].name + '</div><div class="rdrop-hint">← → pick · ↵ apply · esc cancel · or click a swatch</div>';
  }
  styleDropHtml() {
    const ss = this.session;
    return '<div class="rdrop-cap">cell styles</div><div class="rdrop-chips">' + CELL_STYLES.map((st, i) => `<span class="opt${i === ss.cellStyleIdx ? ' on' : ''}" data-act="style:${i}">${st.name}</span>`).join('') +
      '</div><div class="rdrop-hint">← → pick · ↵ apply · esc cancel · or click a style</div>';
  }
  /** A menu as a dropdown: the Alt path's MENUS items (with their KeyTips) or a view-owned list. */
  menuDropHtml(key) {
    if (key.startsWith('group:')) return this.groupDropHtml(key.slice(6));
    const meta = MENU_META[key] || { label: tabName(key) };
    let items;
    const entries = menuEntries(key);
    if (entries.length) items = entries.map(([k, lbl]) => {
      const np = key + k; const cmd = RIBBON_COMMANDS[np];
      if (cmd) return { act: 'cmd:' + np, key: k, label: cmd.label, icon: cmd.icon };
      if (MENUS[np]) return { act: 'menu:' + np, key: k, label: String(lbl).replace(/<[^>]+>/g, ''), icon: (MENU_META[np] || {}).icon || '', sub: true };
      return { key: k, label: String(lbl).replace(/<[^>]+>/g, ''), icon: '', dis: true };
    });
    else items = (meta.items || []).map(it => it.cmd ? { act: 'cmd:' + it.cmd, label: RIBBON_COMMANDS[it.cmd].label, icon: RIBBON_COMMANDS[it.cmd].icon }
      : { label: (UNIMPLEMENTED_BY_ID[it.dead] || { label: it.dead }).label, icon: (UNIMPLEMENTED_BY_ID[it.dead] || {}).icon || '', dis: true });
    const showKeys = entries.length > 0;
    let html = '<div class="rdrop-cap">' + esc(meta.label) + '</div>';
    items.forEach(it => {
      html += '<div class="rdrop-item' + (it.dis ? ' dis' : '') + '"' + (it.act ? ' data-act="' + it.act + '"' : '') + (it.dis ? ' aria-disabled="true" title="Not available yet"' : '') + '>' +
        (showKeys ? '<span class="ri-key">' + esc(it.key) + '</span>' : '') + '<span class="rdrop-ico">' + (it.icon || '') + '</span><span class="rdrop-lbl">' + esc(it.label) + (it.sub ? ' ›' : '') + '</span></div>';
    });
    html += '<div class="rdrop-hint">' + (showKeys ? 'letters pick · esc back · or click' : 'click an item · esc closes') + '</div>';
    return html;
  }
  /** The small dialogs (Column Width, Sort Warning, Series, formula autocorrect) as anchored cards in full mode. */
  smallDialogHtml() {
    const ss = this.session;
    const foot = (ok, cancel) => '<div class="rdrop-foot"><span class="pd-btn" data-act="cancel">' + cancel + ' <kbd>esc</kbd></span><span class="pd-btn ok" data-act="enter">' + ok + ' <kbd>↵</kbd></span></div>';
    if (ss.dialog === 'colw') return '<div class="rdrop-cap">column width</div><div class="rdrop-val">' + esc(ss.colwBuf || '…') + '</div><div class="rdrop-hint">type a width (Excel units)</div>' + foot('OK', 'Cancel');
    if (ss.dialog === 'sortwarn') return '<div class="rdrop-cap">sort warning</div><div class="rdrop-hint">data sits NEXT to your column</div>' +
      '<div class="rdrop-item" data-act="letter:E"><span class="ri-key">E</span><span class="rdrop-lbl">Expand the selection</span></div>' +
      '<div class="rdrop-item" data-act="letter:C"><span class="ri-key">C</span><span class="rdrop-lbl">Continue with the current selection</span></div>' +
      '<div class="rdrop-hint">↵ = expand (Excel’s default) · esc cancel</div>';
    if (ss.dialog === 'series') return '<div class="rdrop-cap">series</div><div class="rdrop-hint">linear, step from selection</div>' + foot('OK', 'Cancel');
    if (ss.dialog === 'fxfix') return '<div class="rdrop-cap">formula autocorrect</div><div class="rdrop-val">' + esc(ss.fxfixPend ? ss.fxfixPend.fixed : '') + '</div>' + foot('Accept', 'Keep editing');
    return '<div class="rdrop-cap">' + esc(ss.dialog) + '</div><div class="rdrop-hint">esc cancel</div>';
  }

  pinHtml() {
    const seg = (m, label, tip) => `<button type="button" class="rpin-b${this.mode === m ? ' on' : ''}" data-mode="${m}" aria-pressed="${this.mode === m}" title="${tip}">${label}</button>`;
    return '<span class="rpin" role="group" aria-label="Ribbon layout">' + seg('slim', 'slim', 'Slim strip: Alt shows the KeyTips') + seg('full', 'full', 'Full ribbon: tabs, groups and buttons') + '</span>';
  }

  render() {
    try { this.paint(); } catch (err) {
      // paint armor — a rendering bug must NEVER strand the player in an invisible ribbon mode
      try { const ss = this.session; this.el.className = 'ribbon show'; this.el.innerHTML = '<span class="path">' + (ss.path.length ? ss.path.join(' ') : 'alt') + ' →</span><span class="opt">… · esc backs out</span>'; } catch (e2) { /* nothing left to do */ }
      try { console.error('ribbon paint:', err); } catch (e3) { /* no console */ }
    }
  }

  paint() {
    if (this.slot) this.slot.classList.toggle('rib-full', this.mode === 'full');
    this.drawDialog();
    this.dropKill();
    if (this.mode === 'full') this.paintFull(); else this.paintSlim();
  }

  /* ================= full mode ================= */
  /** The tab on show: the Alt walk's tab while walking (and it sticks, as in Excel), else the clicked one. */
  currentTab() {
    const ss = this.session;
    if (ss.mode === 'ribbon' && ss.path.length && TABS.some(t => t.k === ss.path[0])) this.tab = ss.path[0];
    return this.tab;
  }
  paintFull() {
    const ss = this.session, el = this.el;
    const walking = ss.mode === 'ribbon' && !ss.dialog;   // KeyTips show while walking; a dialog owns the keys
    const pathStr = ss.path.join('');
    const tab = this.currentTab();
    el.className = 'ribbon ribbon-full' + (ss.mode === 'ribbon' ? ' show' : '');
    let html = '<div class="rf-tabs" role="tablist">';
    TABS.forEach(t => {
      const badge = walking && !pathStr ? '<k class="' + (t.live ? '' : 'dim') + '">' + t.k + '</k>' : '';
      html += `<button type="button" class="rf-tab${t.k === tab ? ' on' : ''}${t.live ? '' : ' dead'}" data-tab="${t.k}" role="tab" aria-selected="${t.k === tab}" tabindex="-1">${badge}${esc(t.name)}</button>`;
    });
    html += '<span class="rf-tools">' + (ss.note ? '<span class="rnote">' + esc(ss.note) + '</span>' : '') + this.pinHtml() + '</span></div>';
    const folded = this.fitFor(tab);
    el.innerHTML = html + this.bodyHtml(tab, pathStr, walking, folded);
    // FIT: when the groups overflow the bar, fold the rightmost ones into single dropdown buttons
    // (Excel's collapse) — measured once per tab and width, so the bar never wraps or hides a group
    if (this.refit(tab, folded)) el.innerHTML = html + this.bodyHtml(tab, pathStr, walking, folded);

    // what floats under the bar
    if (ss.dialog === 'fontcolor' || ss.dialog === 'fillcolor') { this.dropShow(this.anchorFor(ss.dialog === 'fontcolor' ? 'HFC' : 'HH'), this.swatchDropHtml()); return; }
    if (ss.dialog === 'cellstyle') { this.dropShow(this.anchorFor('HJ'), this.styleDropHtml(), 'rdrop-gallery'); return; }
    if (ss.dialog === 'colw') { this.dropShow(this.anchorFor('HO'), this.smallDialogHtml(), 'rdrop-dialog'); return; }
    if (ss.dialog === 'sortwarn') { this.dropShow(this.anchorFor('ASA', 'HSF'), this.smallDialogHtml(), 'rdrop-dialog'); return; }
    if (ss.dialog === 'series') { this.dropShow(this.anchorFor('HFI'), this.smallDialogHtml(), 'rdrop-dialog'); return; }
    if (ss.dialog === 'fxfix') { this.dropShow(this.anchorFor(), this.smallDialogHtml(), 'rdrop-dialog'); return; }
    if (ss.dialog === 'paste' || ss.dialog === 'fmt') return;   // the cards carry the options
    if (ss.dialog) { this.dropShow(this.anchorFor(), this.smallDialogHtml(), 'rdrop-dialog'); return; }
    if (walking && pathStr && menuEntries(pathStr).length && !VIRTUAL_MENUS.has(pathStr) && !TABS.some(t => t.k === pathStr)) {
      this.dropShow(this.anchorFor(pathStr), this.menuDropHtml(pathStr), 'rdrop-menu'); return;
    }
    if (this.localMenu) this.dropShow(this.anchorFor(this.localMenu), this.menuDropHtml(this.localMenu), 'rdrop-menu');
  }
  bodyHtml(tab, pathStr, walking, folded) {
    this._tipGroup = {};
    let html = '<div class="rf-body">';
    (RIBBON_LAYOUT[tab] || []).forEach(g => {
      if (folded.has(g.name)) { html += this.groupBtnHtml(g, pathStr, walking); return; }
      html += '<div class="rf-grp" data-group="' + esc(g.name) + '"><div class="rf-cols">' + g.cols.map(col => this.colHtml(col, pathStr, walking)).join('') + '</div><div class="rf-gname">' + esc(g.name) + '</div></div>';
    });
    return html + '</div>';
  }
  /** The folded-group set for this tab at the bar's current width (a new width starts from nothing folded). */
  fitFor(tab) {
    const key = tab + ':' + (this.el.clientWidth | 0);
    if (this._fitKey !== key) { this._fitKey = key; this._fitSet = new Set(); }
    return this._fitSet;
  }
  /** Measure the painted body; fold groups from the right until it fits. True when the set grew (repaint). */
  refit(tab, folded) {
    const b = this.el.querySelector('.rf-body'); if (!b || !b.clientWidth) return false;
    const over = b.scrollWidth - b.clientWidth; if (over <= 0) return false;
    const groups = [...b.querySelectorAll('.rf-grp')];
    let saved = 0, grew = false;
    for (let i = groups.length - 1; i >= 0 && saved < over; i--) {
      const g = groups[i]; if (g.classList.contains('rf-collapsed')) continue;
      saved += Math.max(0, g.offsetWidth - COLLAPSED_W); folded.add(g.dataset.group); grew = true;
    }
    return grew;
  }
  /** A folded group: one big button (the group's first icon, a caret, the name beneath) that opens the group's items; its live KeyTips stack under it. */
  groupBtnHtml(g, pathStr, walking) {
    const items = []; const walk = it => { if (it.rows) it.rows.forEach(r => r.forEach(walk)); else items.push(it); }; g.cols.forEach(walk);
    items.forEach(it => { const t = itemTip(it); if (t) this._tipGroup[t] = g.name; });
    const first = items.find(it => it.cmd || it.menu) || items[0] || {};
    const icon = first.cmd ? RIBBON_COMMANDS[first.cmd].icon : first.menu ? (MENU_META[first.menu] || {}).icon || '' : first.dead ? (UNIMPLEMENTED_BY_ID[first.dead] || {}).icon || '' : '';
    const tips = walking ? items.map(it => keyTipAt(itemTip(it), pathStr)).filter(Boolean) : [];
    const open = this.localMenu === 'group:' + g.name;
    const live = items.some(it => it.cmd || it.menu);
    return '<div class="rf-grp rf-collapsed" data-group="' + esc(g.name) + '"><div class="rf-cols">' +
      `<button type="button" tabindex="-1" class="rf-btn big rf-grpbtn${open ? ' open' : ''}${live ? '' : ' dis'}" data-act="group:${esc(g.name)}" aria-haspopup="menu" aria-expanded="${open}"${live ? '' : ' aria-disabled="true"'} title="${esc(g.name)} — open the group">` +
      (tips.length ? '<span class="rf-grptips">' + tips.map(t => '<span class="ri-key">' + t + '</span>').join('') + '</span>' : '') +
      `<span class="rf-ico">${icon}</span><span class="rf-lbl">${esc(g.name)}</span><span class="rf-caret">▾</span></button></div><div class="rf-gname">${esc(g.name)}</div></div>`;
  }
  /** A folded group's dropdown: every item of the group, live ones clickable, menus one level deeper, KeyTips while walking. */
  groupDropHtml(name) {
    const ss = this.session; const g = (RIBBON_LAYOUT[this.currentTab()] || []).find(x => x.name === name); if (!g) return '';
    const walking = ss.mode === 'ribbon' && !ss.dialog; const pathStr = ss.path.join('');
    const items = []; const walk = it => { if (it.rows) it.rows.forEach(r => r.forEach(walk)); else items.push(it); }; g.cols.forEach(walk);
    let html = '<div class="rdrop-cap">' + esc(name) + '</div>';
    items.forEach(it => {
      const badge = walking ? keyTipAt(itemTip(it), pathStr) : '';
      const key = badge ? '<span class="ri-key">' + badge + '</span>' : '';
      if (it.box) { const u = UNIMPLEMENTED_BY_ID[it.dead] || { label: it.dead }; html += '<div class="rdrop-item dis" aria-disabled="true" title="Not available yet">' + key + '<span class="rdrop-ico"></span><span class="rdrop-lbl">' + esc(u.label) + ': ' + esc(it.box) + '</span></div>'; return; }
      if (it.dead) { const u = UNIMPLEMENTED_BY_ID[it.dead] || { label: it.dead, icon: '' }; html += '<div class="rdrop-item dis" aria-disabled="true" title="Not available yet"><span class="rdrop-ico">' + (u.icon || '') + '</span><span class="rdrop-lbl">' + esc(u.label) + '</span></div>'; return; }
      if (it.menu) { const meta = MENU_META[it.menu] || { label: it.menu, icon: '' };
        if (it.cmd) { const cmd = RIBBON_COMMANDS[it.cmd]; html += '<div class="rdrop-item" data-act="cmd:' + it.cmd + '">' + key + '<span class="rdrop-ico">' + cmd.icon + '</span><span class="rdrop-lbl">' + esc(it.label || cmd.label) + '</span></div>'; }
        html += '<div class="rdrop-item" data-act="menu:' + it.menu + '">' + (it.cmd ? '' : key) + '<span class="rdrop-ico">' + (meta.icon || '') + '</span><span class="rdrop-lbl">' + esc(meta.label) + ' ›</span></div>'; return; }
      const cmd = RIBBON_COMMANDS[it.cmd]; if (!cmd) return;
      html += '<div class="rdrop-item' + (it.check && ss.sheet.gridlines ? ' on' : '') + '" data-act="cmd:' + it.cmd + '">' + key + '<span class="rdrop-ico">' + cmd.icon + '</span><span class="rdrop-lbl">' + esc(it.label || cmd.label) + '</span></div>';
    });
    return html + '<div class="rdrop-hint">' + (walking ? 'letters pick · esc back · or click' : 'click an item · esc closes') + '</div>';
  }
  colHtml(col, pathStr, walking) {
    if (col.rows) return '<div class="rf-col">' + col.rows.map(row => '<div class="rf-row">' + row.map(it => this.itemHtml(it, pathStr, walking)).join('') + '</div>').join('') + '</div>';
    return this.itemHtml(col, pathStr, walking);
  }
  itemHtml(it, pathStr, walking) {
    const ss = this.session;
    const tip = itemTip(it); const badge = walking ? keyTipAt(tip, pathStr) : '';
    const badgeHtml = badge ? '<span class="ri-key">' + badge + '</span>' : '';
    if (it.box) {
      const u = UNIMPLEMENTED_BY_ID[it.dead] || { label: it.dead };
      return `<span class="rf-box dis" aria-disabled="true" title="${esc(u.label)} — not available yet" style="width:${it.w | 0}px">${badgeHtml}<span class="rf-box-v">${esc(it.box)}</span><span class="rf-caret">▾</span></span>`;
    }
    if (it.dead) {
      const u = UNIMPLEMENTED_BY_ID[it.dead] || { label: it.dead, icon: '' };
      return this.btnHtml({ cls: 'dis', label: u.label, icon: u.icon || '', big: it.big, iconOnly: it.iconOnly, caret: it.caret, title: u.label + ' — not available yet', disabled: true });
    }
    if (it.menu) {
      const meta = MENU_META[it.menu] || { label: it.menu, icon: '' };
      const open = (ss.mode === 'ribbon' && !ss.dialog && ss.path.join('') === it.menu) || this.localMenu === it.menu;
      const chord = MENUS[it.menu] ? ' · Alt ' + spaced(it.menu) : '';
      if (it.cmd) {   // a split button: the face runs the command, the arrow opens the menu
        const cmd = RIBBON_COMMANDS[it.cmd]; const label = it.label || cmd.label;
        return `<span class="rf-split${it.big ? ' big' : ''}${open ? ' open' : ''}" data-tip="${it.menu}">${badgeHtml}` +
          `<button type="button" tabindex="-1" class="rf-btn rf-face" data-act="cmd:${it.cmd}" title="${esc(label + (cmd.keys ? ' (' + cmd.keys + ')' : ''))}"><span class="rf-ico">${cmd.icon}</span><span class="rf-lbl">${esc(label)}</span></button>` +
          `<button type="button" tabindex="-1" class="rf-btn rf-arrow" data-act="menu:${it.menu}" aria-haspopup="menu" aria-expanded="${open}" title="${esc(meta.label + ' options' + chord)}"><span class="rf-caret">▾</span></button></span>`;
      }
      return this.btnHtml({ act: 'menu:' + it.menu, tip: it.menu, label: meta.label, icon: meta.icon, big: it.big, iconOnly: it.iconOnly, caret: true, open, badge: badgeHtml, title: meta.label + chord, haspopup: true });
    }
    const cmd = RIBBON_COMMANDS[it.cmd]; if (!cmd) return '';
    const label = it.label || cmd.label;
    const title = label + (cmd.keys ? ' (' + cmd.keys + ')' : '') + (COMMANDS[it.cmd] !== undefined ? ' · Alt ' + spaced(it.cmd) : '');
    const pressed = it.check ? !!ss.sheet.gridlines : undefined;
    return this.btnHtml({ act: 'cmd:' + it.cmd, tip: it.cmd, label, icon: cmd.icon, big: it.big, iconOnly: it.iconOnly, caret: it.caret, badge: badgeHtml, title, pressed });
  }
  btnHtml(o) {
    const cls = 'rf-btn' + (o.big ? ' big' : '') + (o.iconOnly ? ' ico' : '') + (o.cls ? ' ' + o.cls : '') + (o.open ? ' open' : '') + (o.pressed ? ' on' : '');
    const attrs = (o.act ? ' data-act="' + o.act + '"' : '') + (o.tip ? ' data-tip="' + o.tip + '"' : '') + (o.disabled ? ' aria-disabled="true"' : '') +
      (o.haspopup ? ' aria-haspopup="menu" aria-expanded="' + !!o.open + '"' : '') + (o.pressed !== undefined ? ' aria-pressed="' + !!o.pressed + '"' : '');
    return `<button type="button" tabindex="-1" class="${cls}"${attrs} title="${esc(o.title || o.label)}">${o.badge || ''}<span class="rf-ico">${o.icon || ''}</span>` +
      (o.iconOnly ? '' : `<span class="rf-lbl">${esc(o.label)}</span>`) + (o.caret ? '<span class="rf-caret">▾</span>' : '') + '</button>';
  }

  /* ================= slim mode (today's strip) ================= */
  paintSlim() {
    const ss = this.session, el = this.el;
    if (ss.dialog === 'fxfix') {
      // the FORMULA AUTOCORRECT proposal card — shows while still in cell-edit (mode 'normal', editing)
      el.className = 'ribbon show';
      el.innerHTML = '<span class="path">formula autocorrect →</span>' +
        '<span class="opt" style="font-family:var(--mono)">' + esc(ss.fxfixPend ? ss.fxfixPend.fixed : '') + '</span>' +
        '<span class="opt" data-act="enter">↵ accept</span><span class="opt" data-act="cancel">esc keep editing</span>';
      return;
    }
    if (ss.mode !== 'ribbon') {
      if (ribbonBarOn()) { el.className = 'ribbon show ribbon-ico ribbon-lean'; el.innerHTML = leanRibbonHtml() + this.pinHtml(); }
      else { el.className = 'ribbon'; el.innerHTML = '<span class="rhint"><k>alt</k> ribbon</span>' + this.pinHtml(); }
      if (this.localMenu) this.dropShow(this.el, this.menuDropHtml(this.localMenu), 'rdrop-menu');
      return;
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
      this.dropShow(ss.dialog === 'fontcolor' ? 'f' : 'h', this.swatchDropHtml());
      return;
    }
    if (ss.dialog === 'cellstyle') {   // cell-styles gallery — chip row, arrows walk it, ↵ applies, a click applies too
      el.className = 'ribbon show';
      let html = '<span class="path">cell styles →</span>';
      CELL_STYLES.forEach((st, i) => { html += `<span class="opt${i === ss.cellStyleIdx ? ' on' : ''}" data-act="style:${i}">${st.name}</span>`; });
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
      el.innerHTML = '<span class="path">sort warning →</span><span class="opt" data-act="letter:E"><k>e</k>Expand the selection</span><span class="opt" data-act="letter:C"><k>c</k>Continue with the current selection</span><span class="opt">data sits NEXT to your column — ↵ = expand (Excel’s default) · esc cancel</span>';
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
      TABS.forEach(t => { html += `<span class="rtab${t.live ? '' : ' dim'}"${t.live ? ' data-act="menu:' + t.k + '"' : ''}><k>${t.k}</k>${t.name}</span>`; });   // uppercase KeyTips, Excel-true
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
