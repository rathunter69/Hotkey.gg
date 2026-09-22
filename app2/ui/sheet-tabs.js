// app2/ui/sheet-tabs.js — the workbook's sheet-tabs strip under the grid, in the old build's look
// (the drill page's SHEETS chip and raised current tab): one tab per session.sheets entry, the
// active one raised, a click switches, a double-click opens Rename Sheet on that tab (the same card
// Alt H O R opens: the tab previews the draft name while it is open), and the ⊕ adds a sheet as
// Excel's does. Every click is recorded as a workspace mouse action (SITE_SPEC §6). Re-renders on
// every session change, so a rename, delete, move or copy shows at once.
//
//   const tabs = mountSheetTabs(el, session);   // el becomes the strip
//   tabs.render(); tabs.destroy();

import { recordMouse, MODAL_DIALOGS } from './ribbon-commands.js';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/**
 * @param {HTMLElement} el   the strip's element (gets class wb-tabs; its content is owned here)
 * @param {import('../engine/keyboard.js').Session} session
 */
export function mountSheetTabs(el, session) {
  el.classList.add('wb-tabs');
  el.setAttribute('role', 'tablist'); el.setAttribute('aria-label', 'Sheets');
  let destroyed = false;

  function render() {
    if (destroyed) return;
    const sheets = session.sheets || [{ name: 'Sheet1', sheet: session.sheet }];
    const cur = session.sheetIndex | 0;
    const ren = session.dialog === 'renamesheet' && session.dlg ? session.dlg.index : -1;   // the tab being renamed shows the draft
    let html = '<span class="wb-lead">SHEETS</span>';
    sheets.forEach((sh, i) => {
      const label = i === ren ? (session.dlg.name || '…') : sh.name;
      html += `<span class="wb-tab${i === cur ? ' cur' : ''}${i === ren ? ' ren' : ''}" role="tab" aria-selected="${i === cur}" data-i="${i}" title="${esc(sh.name)}${i === cur ? ' — double-click to rename' : ' — click, or Ctrl+PgDn / Ctrl+PgUp; double-click to rename'}">${esc(label)}</span>`;
    });
    html += '<button type="button" class="wb-add" data-add="1" tabindex="-1" title="New sheet (Shift+F11)" aria-label="New sheet">⊕</button>';
    el.innerHTML = html;
  }

  /** An entry in progress commits before a tab acts (a click away commits, as on the grid); a refused one keeps the editor and drops the click. */
  function commitFirst() {
    if (session.editing && !session.commitEdit(0, 0, { kind: 'move' })) { session.emit('mouse'); return false; }
    return true;
  }
  function onClick(e) {
    const t = e.target; if (!t || !t.closest) return;
    if (e.detail > 1) return;   // the second click of a double-click: dblclick handles it
    if (session.dialog && MODAL_DIALOGS.has(session.dialog)) return;   // a modal card owns the input
    const add = t.closest('[data-add]');
    if (add) {
      if (!commitFirst()) return;
      try { session.insertSheet(); } catch (err) { /* a name clash cannot happen with the default name */ }
      recordMouse(session, 'sheettab'); session.emit('mouse'); return;
    }
    const tab = t.closest('.wb-tab'); if (!tab) return;
    const i = +tab.dataset.i;
    if (!commitFirst()) return;
    if (session.mode === 'ribbon') session.exitRibbon(false);   // a click on the strip dismisses KeyTips and dropdowns, as on the grid
    session.switchSheet(i);   // a no-op on the current tab, as in Excel
    recordMouse(session, 'sheettab'); session.emit('mouse');
  }
  /** A double-click on a tab opens Rename Sheet on it (Excel's in-place rename), the same card and state as Alt H O R. */
  function onDblClick(e) {
    const t = e.target; if (!t || !t.closest) return;
    if (session.dialog && MODAL_DIALOGS.has(session.dialog)) return;
    const tab = t.closest('.wb-tab'); if (!tab) return;
    if (!commitFirst()) return;
    if (session.mode === 'ribbon') session.exitRibbon(false);
    const i = +tab.dataset.i;
    session.switchSheet(i);   // the first click already did this; it is a no-op now
    session.openRenameSheet(i);
    recordMouse(session, 'sheettab'); session.emit('mouse');
  }
  const onDown = e => { if (e.button === 0) e.preventDefault(); };   // the sheet keeps the keyboard; a double-click never selects text
  el.addEventListener('click', onClick);
  el.addEventListener('dblclick', onDblClick);
  el.addEventListener('mousedown', onDown);
  const unsub = session.onChange(() => render());
  render();

  return {
    render,
    destroy() {
      destroyed = true; unsub();
      el.removeEventListener('click', onClick); el.removeEventListener('dblclick', onDblClick); el.removeEventListener('mousedown', onDown);
      el.innerHTML = ''; el.classList.remove('wb-tabs');
    },
  };
}
