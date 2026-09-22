// app2/app/first-run.js — the first run (SITE_SPEC §3): (1) Windows or Mac, pre-selected from the
// browser and saved to prefs; (2) "New to Excel / I use it sometimes / I use it daily"; New and
// Sometimes go straight to lesson 1; Daily gets a short placement run on a real sheet whose passed
// tasks mark the matching early lessons as skipped (skipped is not completed), then a
// recommendation "Start at lesson N". Everything is keyboard-driven with visible focus.
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';
import { SheetView } from '../ui/sheet-view.js';
import { RibbonView } from '../ui/ribbon-view.js';
import { mountKeycaps } from '../ui/keycaps.js';
import { showToast } from '../ui/toast.js';
import { prefs, keyLabel } from './prefs.js';
import { store } from './store.js';
import { LESSONS, lessonNumber } from '../content/index.js';
import { pickNextLesson } from './learn-page.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const FIRST_LESSON = LESSONS[0].id;   // the catalogue's first lesson (the Welcome race)

const REPORT = {
  A1: { value: 'Weekly Sales Report', bold: true },
  A2: { value: 'Day', bold: true }, B2: { value: 'Sales', bold: true }, C2: { value: 'Units', bold: true },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 40 },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { value: 31 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { value: 47 },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 36 },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 55 },
};

/** The placement tasks. Each names visible cells; passing one marks its `skips` lessons as skipped. */
export const PLACEMENT_TASKS = [
  { id: 'move', text: 'Make C4 (Tuesday, Units) the active cell', keys: 'arrow keys, or Ctrl+Arrow to jump', skips: ['welcome-race', 'workbook-sheets-cells', 'active-cell', 'moving-around'],
    check: (s, ses) => !ses.editing && !s.sel && s.selectionText() === 'C4' },
  { id: 'select', text: 'Select the range B2:B6', keys: 'Shift+Arrow from B2', skips: ['selecting-ranges'],
    check: (s, ses) => !ses.editing && !!s.sel && s.selectionText() === 'B2:B6' },
  { id: 'type-bold', text: 'Type Total in A8, then make A8 bold', keys: 'type, Enter, then Ctrl+B or Alt H B', skips: ['ribbon-and-keytips', 'entering-data', 'ribbon-commands'],
    check: (s, ses) => { if (ses.editing) return false; const c = s.cellAt('A8'); return !!c && String(c.value == null ? '' : c.value).trim().toLowerCase() === 'total' && !!c.bold; } },
];

/** Lesson ids skipped by a set of passed task ids. Pure. */
export function skipsFor(passedIds, tasks = PLACEMENT_TASKS) {
  const out = []; for (const t of tasks) if (passedIds.includes(t.id)) for (const id of t.skips) if (!out.includes(id)) out.push(id);
  return out;
}

const isTyping = t => !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);

export function mountFirstRun(root) {
  const el = document.createElement('div');
  el.className = 'fr';
  root.appendChild(el);
  let step = 'platform';           // 'platform' | 'experience' | 'placement' | 'result'
  let platform = prefs.get().platform;
  let experience = prefs.get().experience || 'new';
  let sheetView = null, ribbonView = null, keycaps = null, session = null, sheet = null;
  let taskIdx = 0; const passed = []; const attempted = [];

  const card = (cap, body) => `<div class="fr-card"><div class="fr-cap">${cap}</div><div class="fr-body">${body}</div></div>`;
  const options = (name, list, cur) => `<div class="fr-options" role="radiogroup" aria-label="${esc(name)}">${list.map(o =>
    `<button type="button" class="fr-opt${o.v === cur ? ' on' : ''}" role="radio" aria-checked="${o.v === cur}" tabindex="${o.v === cur ? 0 : -1}" data-v="${esc(o.v)}"><span class="fr-opt-t">${esc(o.t)}</span>${o.s ? `<span class="fr-opt-s">${esc(o.s)}</span>` : ''}</button>`).join('')}</div>`;

  function teardownSheet() {
    if (sheetView) { sheetView.destroy(); sheetView = null; }
    if (ribbonView && ribbonView.destroy) ribbonView.destroy();
    ribbonView = null;
    if (keycaps) { keycaps.destroy(); keycaps = null; }
    session = null; sheet = null;
  }

  function render() {
    teardownSheet();
    if (step === 'platform') {
      el.innerHTML = card('first run · step 1 of 2',
        `<h1>Which keyboard are you on?</h1>
        <p>Instructions and keycaps follow this choice. You can change it any time from Settings or the drill bar.</p>
        ${options('platform', [{ v: 'win', t: 'Windows', s: 'Ctrl, Alt, the Ribbon KeyTips' }, { v: 'mac', t: 'Mac', s: '⌘ and ⌥ in place of Ctrl and Alt' }], platform)}
        <div class="fr-actions"><button type="button" class="btn btn-primary" id="frNext">Continue <kbd>Enter</kbd></button></div>
        <p class="fr-fine">Detected: ${platform === 'mac' ? 'Mac' : 'Windows'}. Saved on this device.</p>`);
      wireOptions(v => { platform = v; prefs.set({ platform }); render(); }, () => { step = 'experience'; render(); });
    } else if (step === 'experience') {
      el.innerHTML = card('first run · step 2 of 2',
        `<h1>How much Excel have you used?</h1>
        <p>This only picks where you start. Every lesson stays open in the catalog.</p>
        ${options('experience', [{ v: 'new', t: 'New to Excel', s: 'Start at lesson 1' }, { v: 'sometimes', t: 'I use it sometimes', s: 'Start at lesson 1, move fast' }, { v: 'daily', t: 'I use it daily', s: 'Three quick tasks place you' }], experience)}
        <div class="fr-actions"><button type="button" class="btn btn-ghost" id="frBack">Back</button><button type="button" class="btn btn-primary" id="frNext">Continue <kbd>Enter</kbd></button></div>`);
      wireOptions(v => { experience = v; render(); }, () => {
        if (experience === 'daily') { step = 'placement'; taskIdx = 0; passed.length = 0; attempted.length = 0; render(); }
        else finish([]);
      });
      el.querySelector('#frBack').onclick = () => { step = 'platform'; render(); };
    } else if (step === 'placement') {
      el.innerHTML = `<div class="fr-place">
        <aside class="fr-side">
          <div class="fr-cap">placement · task ${taskIdx + 1} of ${PLACEMENT_TASKS.length}</div>
          <h1>Three quick tasks</h1>
          <p>Work on the sheet with your keyboard. A task you pass marks its lessons as skipped. Skipped lessons stay in the catalog.</p>
          <ol class="goals" id="frTasks"></ol>
          <div class="fr-actions"><button type="button" class="btn btn-ghost" id="frSkipTask">Skip this task</button><button type="button" class="btn btn-ghost" id="frSkipAll">Start at lesson 1 instead</button></div>
          <p class="fr-fine"><kbd>${esc(keyLabel('Ctrl', platform))}+Z</kbd> undoes. <kbd>Esc</kbd> backs out of the Ribbon or an edit.</p>
        </aside>
        <div class="fr-stage"><div class="stage"><div class="stage-row"><div class="stage-main">
          <div class="ribbon-slot" id="frRibbon"></div><div id="frSheet"></div>
        </div></div></div></div>
      </div>`;
      sheet = new Sheet({ cells: cloneCells(REPORT), active: { r: 1, c: 1 } });
      session = new Session(sheet, { onToast: showToast, onRefuse: () => sheetView && sheetView.shake && sheetView.shake() });
      sheetView = new SheetView(el.querySelector('#frSheet'), session);
      ribbonView = new RibbonView(el.querySelector('#frRibbon'), session);
      keycaps = mountKeycaps(session);
      session.onChange(() => { if (ribbonView) ribbonView.render(); evaluate(); });
      renderTasks();
      el.querySelector('#frSkipTask').onclick = () => advance(false);
      el.querySelector('#frSkipAll').onclick = () => finish([]);
      el.querySelector('#frSkipTask').focus({ preventScroll: true });
      el.querySelector('#frSkipTask').blur();   // keys go to the sheet; the buttons stay one Tab away
    } else if (step === 'result') {
      const skipped = skipsFor(passed);
      const all = store.all();
      const next = pickNextLesson(LESSONS, all, skipped) || LESSONS[LESSONS.length - 1];
      const n = lessonNumber(next.id);
      el.innerHTML = card('placement · result',
        `<h1>Start at lesson ${n}: ${esc(next.title)}</h1>
        <p>You passed ${passed.length} of ${PLACEMENT_TASKS.length} tasks. ${skipped.length ? `${skipped.length} lesson${skipped.length === 1 ? '' : 's'} marked as skipped: ${skipped.map(id => lessonNumber(id)).join(', ')}. Skipped is not completed; open any of them from the catalog.` : 'Nothing is skipped; you start from the top.'}</p>
        <ul class="fr-list">${PLACEMENT_TASKS.map(t => `<li class="${passed.includes(t.id) ? 'ok' : 'no'}"><span class="goal-mark">${passed.includes(t.id) ? '✓' : '–'}</span> ${esc(t.text)}</li>`).join('')}</ul>
        <div class="fr-actions"><button type="button" class="btn btn-primary" id="frStart">Start <kbd>Enter</kbd></button>${n > 1 ? '<button type="button" class="btn btn-ghost" id="frFromOne">Start from lesson 1</button>' : ''}</div>`);
      el.querySelector('#frStart').onclick = () => finish(skipped, next.id);
      const one = el.querySelector('#frFromOne'); if (one) one.onclick = () => finish(skipped, FIRST_LESSON);
      el.querySelector('#frStart').focus();
    }
  }

  function wireOptions(onPick, onNext) {
    const opts = [...el.querySelectorAll('.fr-opt')];
    opts.forEach((b, i) => {
      b.onclick = () => onPick(b.dataset.v);
      b.onkeydown = e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); onPick(opts[(i + 1) % opts.length].dataset.v); }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); onPick(opts[(i - 1 + opts.length) % opts.length].dataset.v); }
        else if (e.key === 'Enter') { e.preventDefault(); onNext(); }
        else if (e.key === ' ') { e.preventDefault(); onPick(b.dataset.v); }
      };
    });
    const next = el.querySelector('#frNext'); if (next) next.onclick = onNext;
    const on = el.querySelector('.fr-opt.on') || opts[0]; if (on) on.focus();
  }

  function renderTasks() {
    const ol = el.querySelector('#frTasks'); if (!ol) return;
    ol.innerHTML = PLACEMENT_TASKS.map((t, i) => `<li class="goal ${i < taskIdx ? (passed.includes(t.id) ? 'done' : 'skipped') : i === taskIdx ? 'current' : ''}">
      <span class="goal-mark">${i < taskIdx ? (passed.includes(t.id) ? '✓' : '–') : i === taskIdx ? '›' : ''}</span><span class="goal-text">${esc(t.text)}</span>
      ${i === taskIdx ? `<div class="goal-keys"><span class="kx">${esc(keyLabel(t.keys, platform))}</span></div>` : ''}</li>`).join('');
    const cap = el.querySelector('.fr-side .fr-cap'); if (cap) cap.textContent = `placement · task ${Math.min(taskIdx + 1, PLACEMENT_TASKS.length)} of ${PLACEMENT_TASKS.length}`;
  }
  function evaluate() {
    if (step !== 'placement' || !sheet || taskIdx >= PLACEMENT_TASKS.length) return;
    const t = PLACEMENT_TASKS[taskIdx];
    let ok = false; try { ok = !!t.check(sheet, session); } catch (e) { ok = false; }
    if (ok) { passed.push(t.id); showToast('✓ ' + t.text); advance(true); }
  }
  function advance() {
    attempted.push(PLACEMENT_TASKS[taskIdx].id);
    taskIdx++;
    if (taskIdx >= PLACEMENT_TASKS.length) { step = 'result'; render(); return; }
    // a fresh selection for the next task so a stale state never passes it by accident
    if (sheet) { sheet.goTo(1, 1); }
    renderTasks();
  }
  function finish(skipped, lessonId) {
    store.setLearner({ platform, experience, firstRunDone: true, skipped });
    location.hash = '#/lesson/' + (lessonId || FIRST_LESSON);
  }

  // the page's keyboard → the placement session (form controls keep their keys; buttons keep Enter/Space)
  const onKeyDown = e => {
    if (step !== 'placement' || !session) return;
    if (isTyping(e.target)) return;
    if (e.target && e.target.tagName === 'BUTTON' && (e.key === 'Enter' || e.key === ' ' || e.key === 'Tab')) return;
    if (e.key === 'Tab') return;
    if (session.key(e)) e.preventDefault();
  };
  const onKeyUp = e => { if (e.key === 'Alt') e.preventDefault(); };
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp, { capture: true });

  render();
  return { destroy() { document.removeEventListener('keydown', onKeyDown); document.removeEventListener('keyup', onKeyUp, { capture: true }); teardownSheet(); el.remove(); } };
}

function cloneCells(cells) { const out = {}; for (const k in cells) out[k] = { ...cells[k] }; return out; }
