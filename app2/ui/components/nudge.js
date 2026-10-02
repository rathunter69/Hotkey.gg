// app2/ui/components/nudge.js — the gentle account step (Wolf, 2026-10-02, point 25): "Save your
// progress" as a small panel at the moments it matters (Home after the first lesson, the boards,
// Learn as Chapter 1 nears its end, the tour). Never a wall: Not now hides it for this visit. One
// component; the pages decide when.
//
//   saveNudgeHtml({ heading, line })   → the panel, or '' when signed in or put off this visit
//   wireSaveNudge(el, onHide)          → wires Not now; returns nothing
import { siteCopy } from '../../content/copy/apply.js';
import { auth } from '../../app/auth.js';
import { panelHtml, buttonHtml } from './table.js';
import { esc } from './format.js';

const LATER_KEY = 'hk2_save_later';
const t = (k, fb) => siteCopy(k, fb);

/** Whether to show it: signed out and not put off this visit. */
export function saveNudgeDue() {
  if (auth.state() === 'in') return false;
  try { return sessionStorage.getItem(LATER_KEY) !== '1'; } catch (e) { return true; }
}

export function saveNudgeHtml({ heading = t('save_title', 'Save your progress'), line = t('save_line', '') } = {}) {
  if (!saveNudgeDue()) return '';
  const body = `<p class="panel-line">${esc(line)}</p><div class="btn-row">${buttonHtml({ label: t('save_go', 'Make a free account'), href: '#/account', primary: true, cls: 'save-go' })}${buttonHtml({ label: t('paywall_not_now', 'Not now'), quiet: true, cls: 'save-later' })}</div>`;
  return panelHtml({ heading: esc(heading), body, cls: 'save-nudge' });
}

export function wireSaveNudge(el, onHide) {
  const b = el.querySelector('.save-nudge .save-later');
  if (!b) return;
  b.onclick = () => { try { sessionStorage.setItem(LATER_KEY, '1'); } catch (e) { /* private window: hides for this render only */ } const p = el.querySelector('.save-nudge'); if (p) p.remove(); if (onHide) onHide(); };
}
