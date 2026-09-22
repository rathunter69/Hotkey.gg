// app2/ui/sheet-tabs.js — the workbook's sheet-tabs strip under the grid, in the old build's look
// (the drill page's SHEETS chip and raised current tab): one tab per session.sheets entry, the
// active one raised, a click switches (recorded as a workspace mouse action, SITE_SPEC §6), and
// the ⊕ adds a sheet as Excel's does. Re-renders on every session change. No rename UI yet.
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
    let html = '<span class="wb-lead">SHEETS</span>';
    sheets.forEach((sh, i) => {
      html += `<span class="wb-tab${i === cur ? ' cur' : ''}" role="tab" aria-selected="${i === cur}" data-i="${i}" title="${esc(sh.name)}${i === cur ? '' : ' — click, or Ctrl+PgDn / Ctrl+PgUp'}">${esc(sh.name)}</span>`;
    });
    html += '<button type="button" class="wb-add" data-add="1" tabindex="-1" title="New sheet (Shift+F11)" aria-label="New sheet">⊕</button>';
    el.innerHTML = html;
  }

  function onClick(e) {
    const t = e.target; if (!t || !t.closest) return;
    if (session.dialog && MODAL_DIALOGS.has(session.dialog)) return;   // a modal card owns the input
    const add = t.closest('[data-add]');
    if (add) {
      if (session.editing && !session.commitEdit(0, 0, { kind: 'move' })) { session.emit('mouse'); return; }
      try { session.insertSheet(); } catch (err) { /* a name clash cannot happen with the default name */ }
      recordMouse(session, 'sheettab'); session.emit('mouse'); return;
    }
    const tab = t.closest('.wb-tab'); if (!tab) return;
    const i = +tab.dataset.i;
    if (session.editing && !session.commitEdit(0, 0, { kind: 'move' })) { session.emit('mouse'); return; }   // a click away commits, as on the grid
    session.switchSheet(i);   // a no-op on the current tab, as in Excel
    recordMouse(session, 'sheettab'); session.emit('mouse');
  }
  const onDown = e => { if (e.button === 0) e.preventDefault(); };   // the sheet keeps the keyboard
  el.addEventListener('click', onClick);
  el.addEventListener('mousedown', onDown);
  const unsub = session.onChange(() => render());
  render();

  return {
    render,
    destroy() {
      destroyed = true; unsub();
      el.removeEventListener('click', onClick); el.removeEventListener('mousedown', onDown);
      el.innerHTML = ''; el.classList.remove('wb-tabs');
    },
  };
}
