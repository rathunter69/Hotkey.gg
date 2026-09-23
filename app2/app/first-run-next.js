// app2/app/first-run-next.js — the first run, redesigned (experience pass, decision 1): one
// frame, one size, for the whole sequence. Start learning → a ~20-second self-playing demo of a
// real lesson → the three-card Project Volt briefing (who you are / what management sent / what
// you'll deliver) → the orientation card (lessons, challenges, drills, the Daily, boards, level
// and XP, and where each lives) → the platform + experience picker → the Welcome race. Enter
// advances, Esc skips the briefing, the briefing shows once (prefs.briefingDone). Nothing
// jumps: the frame keeps its size from the first step to the last.
//
// Voice (decision 10): a senior Wall Street Prep instructor with prior IB and PE experience —
// plain, confident, dry; the why in one line; never tongue-in-cheek. American spelling.
import { mountDemo } from '../ui/demo-player.js';
import { prefs } from './prefs.js';
import { store } from './store.js';
import { track } from './telemetry.js';
import { LESSONS } from '../content/index.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const FIRST_LESSON = LESSONS[0].id;

/** The briefing, three cards, then the orientation card. Exported so the copy is testable (American spelling, voice). */
export const BRIEFING = [
  { key: 'who', eyebrow: 'Project Volt · 1 of 3', title: 'You are the analyst on the Voltline sale.',
    body: ['Voltline Charging Inc. runs 40 EV fast-charging sites. Its owners have hired the deal team you just joined to sell the business.',
      'Your job is the pack the buyers will read. Every number in it comes off your sheet.'] },
  { key: 'sent', eyebrow: 'Project Volt · 2 of 3', title: 'Management sent the Austin file.',
    body: ['The weekly site report for the Austin cluster: five sites, two weeks of daily figures. It arrived the way inherited files do — a tab still called Sheet2, a dead half-export, a price buried inside a formula.',
      'A buyer’s analyst will open this file. It has to be right before then.'] },
  { key: 'deliver', eyebrow: 'Project Volt · 3 of 3', title: 'By the end of Chapter 1: page one of the pack.',
    body: ['A one-page weekly KPI report that ties, formatted to house style, live to its inputs.',
      'You build it one job at a time: set the file up, move and select without the mouse, enter and fix, structure, format, add the formulas, present it. Every lesson is one of those jobs on this file.'] },
];

export const ORIENTATION = {
  eyebrow: 'How this place works', title: 'Where things are.',
  rows: [
    { where: 'Learn', what: 'Lessons, in modules. Each module ends in a challenge: a seeded, timed run on a fresh file, scored pass, pro or legendary. Passing it, at any tier, completes the module.' },
    { where: 'Practice', what: 'Drills and rapid-fire for reps, and the Daily: one ninety-second sheet, the same for everyone, once a day.' },
    { where: 'Leaderboard', what: 'Boards for every challenge and for the Daily. Clean runs only: no help, no mouse.' },
    { where: 'Level', what: 'Finishing lessons and challenges earns XP; XP is your level, shown in the top bar. Speed earns pars and board places, never XP.' },
  ],
  fine: 'Keyboard first. Sound is on at low volume from your first key; the mute is in the workspace.',
};

/** Step order for a first visit; a returning visitor who has read the briefing only sees the picker. */
export function stepsFor(briefingDone) {
  return briefingDone ? ['picker'] : ['demo', 'who', 'sent', 'deliver', 'orient', 'picker'];
}

export function mountFirstRun(root, ctx = {}) {
  const el = document.createElement('div');
  el.className = 'fr2';
  root.appendChild(root && el);
  const q = (ctx && ctx.query) || {};
  const briefingDone = !!prefs.get().briefingDone && q.replay !== '1';
  const steps = stepsFor(briefingDone);
  let idx = Math.max(0, steps.indexOf(q.step)) || 0;
  let platform = prefs.get().platform;
  let experience = prefs.get().experience || 'new';
  let demo = null;
  let skipped = false;

  el.innerHTML = `<div class="fr2-frame" id="frFrame" role="region" aria-label="Getting started">
      <div class="fr2-head"><span class="fr2-eyebrow" id="frEyebrow"></span><span class="fr2-keys" id="frKeys"></span></div>
      <div class="fr2-body" id="frBody"></div>
      <div class="fr2-foot"><span class="fr2-dots" id="frDots" aria-hidden="true"></span><span class="fr2-actions" id="frActions"></span></div>
    </div>`;
  const $ = id => el.querySelector('#' + id);

  const step = () => steps[idx];
  function teardownDemo() { if (demo) { demo.destroy(); demo = null; } }

  function render() {
    teardownDemo();
    const s = step();
    const body = $('frBody');
    const n = idx + 1, of = steps.length;
    $('frDots').innerHTML = steps.map((k, i) => `<i class="${i < idx ? 'past' : i === idx ? 'now' : ''}"></i>`).join('');
    $('frEyebrow').textContent = of > 1 ? `Getting started · ${n} of ${of}` : 'Set up';
    if (s === 'demo') {
      $('frKeys').innerHTML = '<kbd>Enter</kbd> continue';
      body.innerHTML = `<div class="fr2-demo">
          <div class="fr2-demo-cap"><h1>This is a lesson.</h1><p>The keys are pressed on a real sheet. The sheet is graded on what it ends up as, so any correct route counts.</p></div>
          <div class="fr2-demo-host" id="frDemoHost"></div>
        </div>`;
      demo = mountDemo($('frDemoHost'), { onDone: () => { track('landing_demo', { where: 'first_run', outcome: 'finished' }); } });
      actions([{ id: 'next', label: 'Continue', primary: true, kbd: 'Enter' }]);
    } else if (s === 'who' || s === 'sent' || s === 'deliver') {
      const c = BRIEFING.find(b => b.key === s);
      $('frKeys').innerHTML = '<kbd>Enter</kbd> next · <kbd>Esc</kbd> skip';
      body.innerHTML = `<article class="fr2-card"><div class="fr2-card-eyebrow">${esc(c.eyebrow)}</div><h1>${esc(c.title)}</h1>${c.body.map(p => `<p>${esc(p)}</p>`).join('')}</article>`;
      actions([{ id: 'back', label: 'Back' }, { id: 'next', label: s === 'deliver' ? 'Continue' : 'Next', primary: true, kbd: 'Enter' }]);
    } else if (s === 'orient') {
      $('frKeys').innerHTML = '<kbd>Enter</kbd> next · <kbd>Esc</kbd> skip';
      body.innerHTML = `<article class="fr2-card fr2-orient"><div class="fr2-card-eyebrow">${esc(ORIENTATION.eyebrow)}</div><h1>${esc(ORIENTATION.title)}</h1>
          <dl class="fr2-map">${ORIENTATION.rows.map(r => `<div><dt>${esc(r.where)}</dt><dd>${esc(r.what)}</dd></div>`).join('')}</dl>
          <p class="fr2-fine">${esc(ORIENTATION.fine)}</p></article>`;
      actions([{ id: 'back', label: 'Back' }, { id: 'next', label: 'Continue', primary: true, kbd: 'Enter' }]);
    } else {
      $('frKeys').innerHTML = '<kbd>↑</kbd><kbd>↓</kbd> pick · <kbd>Enter</kbd> start';
      body.innerHTML = `<article class="fr2-card fr2-picker">
          <div class="fr2-card-eyebrow">Set up</div><h1>Two questions, then the Welcome race.</h1>
          <div class="fr2-q"><div class="fr2-qt">Which keyboard?</div>${options('platform', [{ v: 'win', t: 'Windows', s: 'Ctrl, Alt, the Ribbon KeyTips' }, { v: 'mac', t: 'Mac', s: '⌘ and ⌥ stand in for Ctrl and Alt; KeyTips work the same' }], platform)}</div>
          <div class="fr2-q"><div class="fr2-qt">How much Excel?</div>${options('experience', [{ v: 'new', t: 'New to Excel', s: 'Every lesson, in order' }, { v: 'sometimes', t: 'I use it sometimes', s: 'Same path; the challenges will move you fast' }, { v: 'daily', t: 'I use it daily', s: 'Start at the Welcome; test out of Chapter 1 from Learn any time' }], experience)}</div>
          <p class="fr2-fine">Instructions and keycaps follow the keyboard choice. Both settings change any time from Settings. Progress is saved on this device.</p>
        </article>`;
      wireOptions();
      actions([...(steps.length > 1 ? [{ id: 'back', label: 'Back' }] : []), { id: 'start', label: 'Start the Welcome race', primary: true, kbd: 'Enter' }]);
    }
  }

  const options = (name, list, cur) => `<div class="fr-options fr2-options" role="radiogroup" aria-label="${esc(name)}" data-name="${esc(name)}">${list.map(o =>
    `<button type="button" class="fr-opt${o.v === cur ? ' on' : ''}" role="radio" aria-checked="${o.v === cur}" tabindex="${o.v === cur ? 0 : -1}" data-v="${esc(o.v)}"><span class="fr-opt-t">${esc(o.t)}</span>${o.s ? `<span class="fr-opt-s">${esc(o.s)}</span>` : ''}</button>`).join('')}</div>`;
  function wireOptions() {
    for (const group of el.querySelectorAll('.fr2-options')) {
      const opts = [...group.querySelectorAll('.fr-opt')];
      const pick = v => { if (group.dataset.name === 'platform') { platform = v; prefs.set({ platform }); } else experience = v; render(); focusGroup(group.dataset.name); };
      opts.forEach((b, i) => {
        b.onclick = () => pick(b.dataset.v);
        b.onkeydown = e => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); pick(opts[(i + 1) % opts.length].dataset.v); }
          else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); pick(opts[(i - 1 + opts.length) % opts.length].dataset.v); }
          else if (e.key === ' ') { e.preventDefault(); pick(b.dataset.v); }
          else if (e.key === 'Tab' && !e.shiftKey && group.dataset.name === 'platform') { e.preventDefault(); focusGroup('experience'); }
        };
      });
    }
    focusGroup('platform');
  }
  function focusGroup(name) { const on = el.querySelector(`.fr2-options[data-name="${name}"] .fr-opt.on`); if (on) on.focus({ preventScroll: true }); }

  function actions(list) {
    $('frActions').innerHTML = list.map(a => `<button type="button" class="btn ${a.primary ? 'btn-primary' : 'btn-ghost'}" data-act="${a.id}">${esc(a.label)}${a.kbd ? ` <kbd>${a.kbd}</kbd>` : ''}</button>`).join('');
    for (const b of $('frActions').querySelectorAll('[data-act]')) b.onclick = () => act(b.dataset.act);
  }
  function act(id) {
    if (id === 'next') next();
    else if (id === 'back') { if (idx > 0) { idx--; render(); } }
    else if (id === 'start') finish();
  }
  function next() {
    if (step() === 'demo' && demo && !demo.done) { demo.skip(); return; }   // the first Enter finishes the demo, the second moves on
    if (idx + 1 < steps.length) { idx++; render(); } else finish();
  }
  /** Esc: skip what is left of the briefing and land on the picker (the demo included). */
  function skipToPicker() {
    if (step() === 'picker') return;
    skipped = true;
    idx = steps.indexOf('picker'); render();
  }
  function finish() {
    if (!briefingDone) track('briefing_done', { skipped });
    store.setLearner({ platform, experience, firstRunDone: true, briefingDone: true, skipped: [] });
    location.hash = '#/lesson/' + FIRST_LESSON;
  }

  const isTyping = t => !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
  const onKey = e => {
    if (isTyping(e.target) || e.defaultPrevented) return;
    if (e.key === 'Enter') { e.preventDefault(); if (step() === 'picker') finish(); else next(); }
    else if (e.key === 'Escape') { e.preventDefault(); skipToPicker(); }
    else if (e.key === 'Backspace' && step() !== 'picker') { e.preventDefault(); act('back'); }
  };
  document.addEventListener('keydown', onKey);
  render();
  return { destroy() { document.removeEventListener('keydown', onKey); teardownDemo(); el.remove(); } };
}
