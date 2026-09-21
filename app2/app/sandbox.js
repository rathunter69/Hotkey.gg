// app2/app/sandbox.js — a free sheet: engine + keyboard + the painters, wired to the page's
// keyboard. Self-contained so the lesson shell can mount it as a route.
//
//   const sb = mountSandbox(document.getElementById('root'));
//   sb.session.run('"hello" Enter');   sb.destroy();

import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';
import { SheetView } from '../ui/sheet-view.js';
import { RibbonView } from '../ui/ribbon-view.js';
import { mountKeycaps } from '../ui/keycaps.js';
import { showToast } from '../ui/toast.js';

/** A small block so the page is not empty: labels, blue inputs, a ruled total with a live formula. */
export const SEED = {
  A1: { value: 'Line item', bold: true, bb: true },
  B1: { value: 'FY26', bold: true, bb: true, align: 'r' },
  C1: { value: 'FY27', bold: true, bb: true, align: 'r' },
  A2: { value: 'Revenue' },
  B2: { value: 1200, fontColor: 'blue', fmtStyle: 'comma', decimals: 0 },
  C2: { value: 1380, fontColor: 'blue', fmtStyle: 'comma', decimals: 0 },
  A3: { value: 'Cost' },
  B3: { value: -800, fontColor: 'blue', fmtStyle: 'comma', decimals: 0 },
  C3: { value: -905, fontColor: 'blue', fmtStyle: 'comma', decimals: 0 },
  A4: { value: 'Profit', bold: true },
  B4: { formula: '=B2+B3', bold: true, bt: true, fmtStyle: 'comma', decimals: 0 },
  C4: { formula: '=C2+C3', bold: true, bt: true, fmtStyle: 'comma', decimals: 0 },
  A5: { value: 'Margin', it: true, fontColor: 'gray' },
  B5: { formula: '=B4/B2', it: true, fontColor: 'gray', fmtStyle: 'percent', decimals: 1 },
  C5: { formula: '=C4/C2', it: true, fontColor: 'gray', fmtStyle: 'percent', decimals: 1 },
};

const isTyping = t => !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);

/**
 * @param {HTMLElement} root
 * @param {object} [opts]  cells (seed map, default SEED), rows, cols, active, onKey/onToast/onRefuse
 */
export function mountSandbox(root, opts = {}) {
  const sheet = new Sheet({ rows: opts.rows || 20, cols: opts.cols || 10, cells: opts.cells === undefined ? SEED : opts.cells, active: opts.active || { r: 1, c: 1 } });
  const session = new Session(sheet, {
    onToast: msg => { showToast(msg); if (opts.onToast) opts.onToast(msg); },
    onRefuse: () => { if (opts.onRefuse) opts.onRefuse(); },
    onKey: label => { if (opts.onKey) opts.onKey(label); },
  });

  root.innerHTML = '<div class="stage"><div class="stage-row"><div class="stage-main"><div class="ribbon-slot"></div></div></div></div>';
  const stageMain = root.querySelector('.stage-main');
  const slot = root.querySelector('.ribbon-slot');
  const ribbon = new RibbonView(slot, session);
  const view = new SheetView(stageMain, session);
  const keycaps = mountKeycaps(session);

  // the page's keyboard → the Session. Form fields keep their keys; everything else is the sheet's.
  const onKeyDown = e => {
    if (isTyping(e.target)) return;
    if (session.key(e)) e.preventDefault();
  };
  // a released Alt would focus the browser's menu bar — the ribbon owns Alt
  const onKeyUp = e => { if (e.key === 'Alt') e.preventDefault(); };
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp, { capture: true });

  function destroy() {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp, { capture: true });
    keycaps.destroy(); view.destroy(); ribbon.destroy();
    root.innerHTML = '';
  }
  return { sheet, session, view, ribbon, keycaps, destroy };
}
