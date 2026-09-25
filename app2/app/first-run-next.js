// app2/app/first-run-next.js — the first run (experience pass, decision 1; order per Wolf's B
// review): one frame, one size, for the whole sequence. Start learning → a ~20-second
// self-playing demo of a real lesson → the orientation card (where things are: Learn, Practice,
// the Daily, boards, level and XP) → the three Project Volt cards (the company and the sale /
// this week's report / the data room) → keyboard + experience → straight into lesson 1.1.1.
// Enter advances, Esc skips the briefing, the briefing shows once (prefs.briefingDone). Nothing
// jumps: the frame keeps its size from the first step to the last, and the cards sit at one
// height so a heading stays put from step to step. The picker: ← → choose within a question,
// ↑ ↓ move between the two, Enter starts; the choices are saved only when the first job opens.
// A learner who read the deal cards is not shown module 1.1's story beat again in 1.1.1.
//
// Voice (B3): a finance instructor explaining a deal process to a capable person outside
// finance. Plain sentences, one idea each; any term is defined in the same breath; nobody is
// required to be an analyst. American spelling.
import { mountDemoPoster, loadLiveDemo } from '../ui/demo-poster.js';
import { prefs } from './prefs.js';
import { store } from './store.js';
import { track } from './telemetry.js';
import { LESSONS } from '../content/index.js';
import { siteCopy, splitParas } from '../content/copy/apply.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/** Module 1.1, and its first lesson 1.1.1, where the first run hands off (the Welcome race is retired, B2). */
export const FIRST_MODULE = 'open-and-set-up';
export const FIRST_LESSON = (LESSONS.find(l => l.module === FIRST_MODULE) || LESSONS[0]).id;
/** The deal cards: they tell module 1.1's story, so a learner who read them skips that module's beat. */
const DEAL_STEPS = ['who', 'sent', 'deliver'];

/** The prefs patch the first run writes as it hands off: the two choices, done flags, and 1.1's beat marked seen when the deal was read. Pure. */
export function finishPatch({ platform, experience, sawDeal }, beatsSeen = []) {
  const patch = { platform, experience, firstRunDone: true, briefingDone: true, skipped: [] };
  if (sawDeal) patch.beatsSeen = [...new Set([...(beatsSeen || []), FIRST_MODULE])];
  return patch;
}

/** The picker's arrow keys. Pure. ← → move within a question (wrapping); ↑ ↓ move between the two questions. */
export function pickerMove(key, group, i, n) {
  if (key === 'ArrowRight') return { pick: (i + 1) % n };
  if (key === 'ArrowLeft') return { pick: (i - 1 + n) % n };
  if (key === 'ArrowDown') return group === 'platform' ? { group: 'experience' } : { stay: true };
  if (key === 'ArrowUp') return group === 'experience' ? { group: 'platform' } : { stay: true };
  return null;
}

/** The three Project Volt cards (B3 voice). Built-in lines here; site.csv (briefing_n_*) overrides. Exported so the copy is testable. */
const BRIEFING_DEFAULT = [
  { key: 'who', eyebrow: 'The deal · 1 of 3', title: 'A company is being sold. You prepare the numbers.',
    body: ['Voltline runs 40 electric-car charging sites. Its owners are selling the company.',
      'Before any buyer sees a number, someone has to make the numbers clean, consistent and checked. That is you: an analyst, someone in finance or operations, a founder. It does not matter which.'] },
  { key: 'sent', eyebrow: 'The deal · 2 of 3', title: 'It starts with this week’s site report.',
    body: ['It arrived the way files usually do: a tab still called Sheet2, an old export nobody deleted, a price typed inside a formula.',
      'You will turn it into a page a buyer can trust, using the methods investment banks train their people in. One job at a time, on the real file.'] },
  { key: 'deliver', eyebrow: 'The deal · 3 of 3', title: 'Every finished page goes into the data room.',
    body: ['A sale runs in stages. Each chapter here is one stage, and each one ends with a finished page.',
      'The pages go into the data room: the folder buyers will read. By the end of Chapter 1, page one is in it, built by you.'] },
];
export const BRIEFING = BRIEFING_DEFAULT.map((c, i) => ({
  key: c.key, eyebrow: siteCopy(`briefing_${i + 1}_eyebrow`, c.eyebrow), title: siteCopy(`briefing_${i + 1}_title`, c.title),
  body: siteCopy(`briefing_${i + 1}_body`) ? splitParas(siteCopy(`briefing_${i + 1}_body`)) : c.body,
}));

const ORIENTATION_DEFAULT = {
  eyebrow: 'How this place works', title: 'Where things are.',
  rows: [
    { where: 'Learn', what: 'The path. Lessons in short modules, each one job on the file. A module ends with a challenge: the same job on a fresh file, against the clock.' },
    { where: 'Practice', what: 'The reps. Drills and rapid-fire with no story, and the Daily: one ninety-second sheet, the same for everyone, once a day.' },
    { where: 'Leaderboard', what: 'A board for every challenge and for the Daily. Clean runs only: no help, no mouse.' },
    { where: 'Level', what: 'Finishing lessons and challenges earns XP, and XP is your level, shown in the top bar. Speed earns places on the boards, not XP.' },
  ],
  fine: 'Keyboard first. Sound is on at low volume from your first key; the mute is on the workspace.',
};
export const ORIENTATION = {
  eyebrow: siteCopy('orientation_eyebrow', ORIENTATION_DEFAULT.eyebrow), title: siteCopy('orientation_title', ORIENTATION_DEFAULT.title),
  rows: ORIENTATION_DEFAULT.rows.map(r => ({ where: r.where, what: siteCopy('orientation_' + r.where.toLowerCase(), r.what) })),
  fine: siteCopy('orientation_fine', ORIENTATION_DEFAULT.fine),
};

/** Step order for a first visit; a returning visitor who has read the briefing only sees the picker. */
export function stepsFor(briefingDone) {
  return briefingDone ? ['picker'] : ['demo', 'orient', 'who', 'sent', 'deliver', 'picker'];
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
  let skipped = false, sawDeal = false;
  const reduced = (() => { try { return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();

  el.innerHTML = `<div class="fr2-frame" id="frFrame" role="region" aria-label="Getting started">
      <div class="fr2-head"><span class="fr2-eyebrow" id="frEyebrow"></span><span class="fr2-keys" id="frKeys"></span></div>
      <div class="fr2-body" id="frBody"></div>
      <div class="fr2-foot"><span class="fr2-dots" id="frDots" aria-hidden="true"></span><span class="fr2-actions" id="frActions"></span></div>
    </div>`;
  const $ = id => el.querySelector('#' + id);

  const step = () => steps[idx];
  let cancelDemo = () => {};
  function teardownDemo() { cancelDemo(); if (demo) { demo.destroy(); demo = null; } }

  function render() {
    teardownDemo();
    const s = step();
    const body = $('frBody');
    const n = idx + 1, of = steps.length;
    $('frDots').innerHTML = steps.map((k, i) => `<i class="${i < idx ? 'past' : i === idx ? 'now' : ''}"></i>`).join('');
    // the deal cards count themselves (The deal · 1 of 3) and the dots count the whole run: the frame just names it there
    $('frEyebrow').textContent = of < 2 ? 'Set up' : DEAL_STEPS.includes(s) ? 'Getting started' : `Getting started · ${n} of ${of}`;
    if (s === 'demo') {
      $('frKeys').innerHTML = '<kbd>Enter</kbd> continue · <kbd>Esc</kbd> skip';
      body.innerHTML = `<div class="fr2-demo">
          <div class="fr2-demo-cap"><h1>This is a lesson.</h1><p>The keys are pressed on a real sheet. The sheet is graded on what it ends up as, so any correct route counts.</p></div>
          <div class="fr2-demo-host" id="frDemoHost"></div>
        </div>`;
      const host = $('frDemoHost');
      demo = mountDemoPoster(host);
      cancelDemo = loadLiveDemo(host, {
        autoplay: !reduced,
        onPlay: syncDemoButton, onChange: syncDemoButton,
        onDone: () => { track('landing_demo', { where: 'first_run', outcome: 'finished' }); syncDemoButton(); },
      }, d => { if (step() === 'demo') { demo = d; syncDemoButton(); } else d.destroy(); }, demo);
      actions([{ id: 'next', label: 'Continue', primary: true, kbd: 'Enter' }]);
      syncDemoButton();
    } else if (DEAL_STEPS.includes(s)) {
      const c = BRIEFING.find(b => b.key === s);
      sawDeal = true;
      $('frKeys').innerHTML = '<kbd>Enter</kbd> next · <kbd>Esc</kbd> skip';
      body.innerHTML = `<article class="fr2-card fr2-deal"><div class="fr2-card-eyebrow">${esc(c.eyebrow)}</div><h1>${esc(c.title)}</h1>${c.body.map(p => `<p>${esc(p)}</p>`).join('')}</article>`;
      actions([{ id: 'back', label: 'Back' }, { id: 'next', label: s === 'deliver' ? 'Set up' : 'Next', primary: true, kbd: 'Enter' }]);
    } else if (s === 'orient') {
      $('frKeys').innerHTML = '<kbd>Enter</kbd> next · <kbd>Esc</kbd> skip';
      body.innerHTML = `<article class="fr2-card fr2-orient"><div class="fr2-card-eyebrow">${esc(ORIENTATION.eyebrow)}</div><h1>${esc(ORIENTATION.title)}</h1>
          <dl class="fr2-map">${ORIENTATION.rows.map(r => `<div><dt>${esc(r.where)}</dt><dd>${esc(r.what)}</dd></div>`).join('')}</dl>
          <p class="fr2-fine">${esc(ORIENTATION.fine)}</p></article>`;
      actions([{ id: 'back', label: 'Back' }, { id: 'next', label: 'The deal', primary: true, kbd: 'Enter' }]);
    } else {
      $('frKeys').innerHTML = '<kbd>←</kbd><kbd>→</kbd> pick · <kbd>↑</kbd><kbd>↓</kbd> next question · <kbd>Enter</kbd> start';
      body.innerHTML = `<article class="fr2-card fr2-picker">
          <div class="fr2-card-eyebrow">Set up</div><h1>Two questions, then the first job.</h1>
          <div class="fr2-q"><div class="fr2-qt" id="frQPlatform">Which keyboard?</div>${options('platform', 'frQPlatform', [{ v: 'win', t: 'Windows', s: 'Ctrl, Alt, the Ribbon KeyTips' }, { v: 'mac', t: 'Mac', s: '⌘ and ⌥ stand in for Ctrl and Alt; KeyTips work the same' }], platform)}</div>
          <div class="fr2-q"><div class="fr2-qt" id="frQExperience">How much Excel?</div>${options('experience', 'frQExperience', [{ v: 'new', t: 'New to Excel', s: 'Every lesson, in order' }, { v: 'sometimes', t: 'I use it sometimes', s: 'Same path; the challenges will move you fast' }, { v: 'daily', t: 'I use it daily', s: 'Same start; test out of Chapter 1 from Learn any time' }], experience)}</div>
          <p class="fr2-fine">Instructions and keycaps follow the keyboard choice. Both settings change any time from Settings. Progress is saved on this device.</p>
        </article>`;
      wireOptions();
      actions([...(steps.length > 1 ? [{ id: 'back', label: 'Back' }] : []), { id: 'start', label: 'Start lesson 1.1.1', primary: true, kbd: 'Enter' }]);
    }
  }

  /** The demo step's button says what it will do: skip the demo while it plays, continue once it is done (or still). Both move on. */
  function syncDemoButton() {
    if (step() !== 'demo') return;
    const b = $('frActions').querySelector('[data-act="next"]');
    const label = demo && demo.playing && !demo.done ? 'Skip demo' : 'Continue';
    if (b && b.firstChild && b.firstChild.nodeType === 3 && b.firstChild.nodeValue.trim() !== label) b.firstChild.nodeValue = label + ' ';
  }

  const options = (name, labelId, list, cur) => `<div class="fr-options fr2-options" role="radiogroup" aria-labelledby="${labelId}" data-name="${esc(name)}">${list.map(o =>
    `<button type="button" class="fr-opt${o.v === cur ? ' on' : ''}" role="radio" aria-checked="${o.v === cur}" tabindex="${o.v === cur ? 0 : -1}" data-v="${esc(o.v)}"><span class="fr-opt-t">${esc(o.t)}</span>${o.s ? `<span class="fr-opt-s">${esc(o.s)}</span>` : ''}</button>`).join('')}</div>`;
  /** The two radio groups, updated in place (no re-render, so the card does not replay its entrance on every key). */
  function wireOptions() {
    for (const group of el.querySelectorAll('.fr2-options')) {
      const name = group.dataset.name;
      const opts = [...group.querySelectorAll('.fr-opt')];
      const pick = v => {
        if (name === 'platform') platform = v; else experience = v;   // saved on the way into the lesson, not on every key
        for (const b of opts) { const on = b.dataset.v === v; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; }
        focusGroup(name);
      };
      opts.forEach((b, i) => {
        b.onclick = () => pick(b.dataset.v);
        b.onkeydown = e => {
          if (e.key === ' ') { e.preventDefault(); pick(b.dataset.v); return; }
          const mv = pickerMove(e.key, name, i, opts.length);
          if (!mv) return;
          e.preventDefault();
          if (mv.pick != null) pick(opts[mv.pick].dataset.v);
          else if (mv.group) focusGroup(mv.group);
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
  /** Next step. On the demo it moves on at once, played out or not: the button said Skip demo or Continue. */
  function next() {
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
    store.setLearner(finishPatch({ platform, experience, sawDeal }, prefs.get().beatsSeen));
    location.hash = '#/lesson/' + FIRST_LESSON;
  }

  const isTyping = t => !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
  // a focused button other than a picker option (Back, Next, the demo's Play) does what it says: its own click, not the frame's Enter
  const ownButton = t => !!(t && t.closest && t.closest('button') && !t.closest('.fr-opt'));
  const onKey = e => {
    if (isTyping(e.target) || e.defaultPrevented) return;
    if ((e.key === 'Enter' || e.key === ' ') && ownButton(e.target)) return;
    if (e.key === 'Enter') { e.preventDefault(); if (step() === 'picker') finish(); else next(); }
    else if (e.key === 'Escape') { e.preventDefault(); skipToPicker(); }
    else if (e.key === 'Backspace' && step() !== 'picker') { e.preventDefault(); act('back'); }
  };
  document.addEventListener('keydown', onKey);
  render();
  return { destroy() { document.removeEventListener('keydown', onKey); teardownDemo(); el.remove(); } };
}
