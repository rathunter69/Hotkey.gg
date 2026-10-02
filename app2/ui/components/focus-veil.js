// app2/ui/components/focus-veil.js — the way back in after the window loses the keyboard (Wolf,
// 2026-10-02: "no good mechanic to jump back into a drill if I go off the tab"). When the window
// blurs (another tab, another app, the address bar) a veil covers the sheet: "Click here or press
// any key to continue", where the cursor is, and in a timed run that the clock is still running
// (the clock never pauses: a run is timed end to end). The click or the key that lifts it is
// swallowed: it never selects a cell, moves the cursor or types, so coming back can't disturb the
// sheet. One component, used by every workspace.
//
//   const veil = createFocusVeil(stageEl, { active, where, line, onResume });
//     active()   → whether the veil may show now (the host's play phase)
//     where()    → the active cell's address, for "Your cursor is on B6"
//     line()     → an extra line, or '' ("The clock is still running.")
//     onResume() → the veil lifted: the host gives the stage the keyboard and pings the cursor
//   veil.show(); veil.hide(); veil.shown; veil.destroy()
//   veilSwallows(e)  → whether a key event lifts the veil (every key but a lone modifier release)   pure
import { siteCopy } from '../../content/copy/apply.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Any key lifts the veil and is swallowed, a modifier included (Alt would otherwise open the Ribbon's KeyTips). Pure. */
export const veilSwallows = e => !!e && typeof e.key === 'string' && e.key.length > 0;

export function createFocusVeil(stage, opts = {}) {
  const el = document.createElement('div');
  el.className = 'wsc-veil'; el.hidden = true; el.setAttribute('role', 'button'); el.setAttribute('aria-live', 'polite');
  stage.appendChild(el);
  let shown = false;

  function paint() {
    const where = opts.where ? opts.where() : '';
    const line = opts.line ? opts.line() : '';
    el.innerHTML = `<div class="wsc-veil-box"><div class="wsc-veil-title">${esc(siteCopy('ws_focus_title', 'Click here or press any key to continue'))}</div>` +
      (where ? `<div class="wsc-veil-where">${esc(siteCopy('ws_focus_where', 'Your cursor is on'))} <span class="wsc-veil-addr">${esc(where)}</span></div>` : '') +
      (line ? `<div class="wsc-veil-line">${esc(line)}</div>` : '') + '</div>';
  }
  function show() {
    if (shown || (opts.active && !opts.active())) return;
    shown = true; paint(); el.hidden = false;
  }
  function hide() { if (!shown) return; shown = false; el.hidden = true; }
  function resume() { if (!shown) return; hide(); if (opts.onResume) opts.onResume(); }

  // a key while the veil shows: first in line (window, capture), swallowed, and the veil lifts
  const onKey = e => {
    if (!shown || !veilSwallows(e)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (e.type === 'keydown') resume();
  };
  // the press that comes back to the window lands on the veil: it never reaches a cell
  const onDown = e => { if (!shown) return; e.preventDefault(); e.stopPropagation(); };
  const onClick = e => { if (!shown) return; e.preventDefault(); e.stopPropagation(); resume(); };
  const onBlur = () => show();
  const onVis = () => { if (document.visibilityState === 'hidden') show(); };
  window.addEventListener('keydown', onKey, true);
  window.addEventListener('keyup', onKey, true);
  el.addEventListener('mousedown', onDown);
  el.addEventListener('click', onClick);
  window.addEventListener('blur', onBlur);
  document.addEventListener('visibilitychange', onVis);

  return {
    el, show, hide, resume,
    get shown() { return shown; },
    destroy() {
      window.removeEventListener('keydown', onKey, true); window.removeEventListener('keyup', onKey, true);
      window.removeEventListener('blur', onBlur); document.removeEventListener('visibilitychange', onVis);
      el.remove();
    },
  };
}
