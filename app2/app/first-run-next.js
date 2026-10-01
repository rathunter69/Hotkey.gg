// app2/app/first-run-next.js — the first run (screenplay 3.0 "The first run"; 3.2; M92). Three
// steps before the first key, shown once. (1) One screen with the two questions, keyboard and
// experience, answered with the arrows and Enter. (2) One story card with Wolf's line: you work
// for Clearcoat, an express car-wash company that's getting ready to sell to private equity.
// (3) Lesson 1.1.1, where the task card names itself once as it's used (lesson-view). After the
// first lesson, Home shows one coach mark on each rail item (ui/components/coachmarks.js). There
// are no other deal cards: the case stays inside the lessons.
//
// Keys: ↑ and ↓ move the highlight down one list of options across both questions, and the
// highlighted option in each question is its answer; Enter goes on (Next, then Start lesson
// 1.1.1); Esc skips (straight to the lesson with the answers as they stand). Every line is a
// site.csv row (first_run_*, briefing_1_*, orientation_fine).
import { prefs } from './prefs.js';
import { store } from './store.js';
import { track } from './telemetry.js';
import { LESSONS } from '../content/index.js';
import { siteCopy, splitParas } from '../content/copy/apply.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const t = (key, fb) => siteCopy(key, fb);

/** Module 1.1, and its first lesson 1.1.1, where the first run hands off. */
export const FIRST_MODULE = 'open-and-set-up';
export const FIRST_LESSON = (LESSONS.find(l => l.module === FIRST_MODULE) || LESSONS[0]).id;

/** The prefs patch the first run writes as it hands off: the two choices and the done flags. Pure. */
export function finishPatch({ platform, experience }) {
  return { platform, experience, firstRunDone: true, briefingDone: true, skipped: [] };
}

/** The two questions and their options (3.2, Frame 6). The sub-lines are site.csv rows. */
export const QUESTIONS = [
  { key: 'platform', copy: 'first_run_q_keyboard', fallback: 'Which keyboard?', options: [
    { v: 'win', copy: 'first_run_keyboard_win', label: 'Windows', sub: 'Ctrl, Alt, the Ribbon KeyTips.' },
    { v: 'mac', copy: 'first_run_keyboard_mac', label: 'Mac', sub: '⌘ and ⌥ stand in for Ctrl and Alt; KeyTips work the same.' },
  ] },
  { key: 'experience', copy: 'first_run_q_experience', fallback: 'How much Excel?', options: [
    { v: 'new', copy: 'first_run_exp_new', label: 'New to Excel', sub: 'Start at the first lesson and take them in order.' },
    { v: 'sometimes', copy: 'first_run_exp_sometimes', label: 'I use it sometimes', sub: 'The same path, and you’ll move through the parts you know faster.' },
    { v: 'daily', copy: 'first_run_exp_daily', label: 'I use it daily', sub: 'If Chapter 1 looks familiar, take its assessment from Learn and test out.' },
  ] },
];

/** The one story card (3.2): the title and body are site.csv rows. */
export const BRIEFING = () => ({
  title: t('briefing_1_title', 'Welcome to the finance team.'),
  body: splitParas(t('briefing_1_body', 'You work for Clearcoat, an express car-wash company that’s getting ready to sell to private equity. || Before you can start a sale process, your company needs to clean data, compile documents, and reconcile financials. That’s where you come in, and the better you are in Excel, the less painful the process will be.')),
});

/** Step order: the questions, then the story card; a learner who has seen the card only sees the questions. */
export function stepsFor(briefingDone) { return briefingDone ? ['picker'] : ['picker', 'story']; }

/**
 * Where ↑ or ↓ moves the highlight through one list of options (both questions as one list).
 * Pure; clamped at the ends, so a key past the last option changes nothing.
 */
export function pickerMove(key, index, count) {
  if (key === 'ArrowDown') return Math.min(count - 1, index + 1);
  if (key === 'ArrowUp') return Math.max(0, index - 1);
  return index;
}
/** The answer each question holds when the highlight sits at `index` of the flat list: moving within a question changes its answer. Pure. */
export function answersAt(questions, answers, index) {
  let i = 0; const out = { ...answers };
  for (const q of questions) for (const o of q.options) { if (i === index) out[q.key] = o.v; i++; }
  return out;
}

export function mountFirstRun(root, ctx = {}) {
  const el = document.createElement('div');
  el.className = 'fr';
  root.appendChild(el);
  const q = (ctx && ctx.query) || {};
  const briefingDone = !!prefs.get().briefingDone && q.replay !== '1';
  const steps = stepsFor(briefingDone);
  let idx = Math.max(0, steps.indexOf(q.step));
  const answers = { platform: prefs.get().platform, experience: prefs.get().experience || 'new' };
  const flat = QUESTIONS.flatMap(qq => qq.options.map(o => ({ q: qq.key, v: o.v })));
  let at = flat.findIndex(o => o.q === 'experience' && o.v === answers.experience);   // the highlight starts on the experience answer
  if (at < 0) at = 0;
  let skipped = false;

  const step = () => steps[idx];
  function render() {
    const s = step();
    if (s === 'picker') {
      el.innerHTML = `<section class="panel fr-panel" aria-label="${esc(t('first_run_title', 'Two questions, then the first job.'))}">
        <div class="fr-mark mono">hotkey<b>.gg</b></div>
        <h1 class="h-title">${esc(t('first_run_title', 'Two questions, then the first job.'))}</h1>
        ${QUESTIONS.map(qq => `<div class="fr-q"><div class="label" id="frq-${qq.key}">${esc(t(qq.copy, qq.fallback))}</div>
          <div class="fr-options" role="radiogroup" aria-labelledby="frq-${qq.key}" data-q="${qq.key}">${qq.options.map(o => `<button type="button" class="fr-opt" role="radio" aria-checked="false" data-q="${qq.key}" data-v="${esc(o.v)}"><span class="fr-opt-label">${esc(o.label)}</span><span class="fr-opt-sub">${esc(t(o.copy, o.sub))}</span></button>`).join('')}</div></div>`).join('')}
        <p class="fine">${esc(t('orientation_fine', 'Use the arrows and Enter. Sound comes on quietly with your first key, and the sound button at the top of a lesson turns it off.'))}</p>
        <p class="fine">${esc(t('first_run_fine', 'Instructions and keycaps follow the keyboard choice. Both settings change any time from Settings. Progress is saved on this device.'))}</p>
        <div class="btn-row"><span class="keys-hint"><kbd class="key">↑</kbd><kbd class="key">↓</kbd> ${esc(t('first_run_then', 'then'))} <kbd class="key">Enter</kbd></span><button type="button" class="btn btn-primary" data-act="next">${esc(t('first_run_next', 'Next'))}<kbd class="key key-on-fill">Enter</kbd></button><button type="button" class="btn" data-act="skip">${esc(t('first_run_skip', 'Skip'))}<kbd class="key">Esc</kbd></button></div>
      </section>`;
      paintPicker();
    } else {
      const card = BRIEFING();
      el.innerHTML = `<section class="panel fr-panel fr-story" aria-label="${esc(card.title)}">
        <h1 class="h-title">${esc(card.title)}</h1>
        ${card.body.map((p, i) => `<p class="${i === 0 ? 'fr-story-lead' : 'body'}">${esc(p)}</p>`).join('')}
        <div class="btn-row"><button type="button" class="btn btn-primary" data-act="start">${esc(t('first_run_start', 'Start lesson 1.1.1'))}<kbd class="key key-on-fill">Enter</kbd></button><button type="button" class="btn" data-act="skip">${esc(t('first_run_skip', 'Skip'))}<kbd class="key">Esc</kbd></button></div>
      </section>`;
      const b = el.querySelector('[data-act="start"]'); if (b) b.focus({ preventScroll: true });
    }
    for (const b of el.querySelectorAll('[data-act]')) b.onclick = () => act(b.dataset.act);
    for (const o of el.querySelectorAll('.fr-opt')) o.onclick = () => { at = flat.findIndex(f => f.q === o.dataset.q && f.v === o.dataset.v); Object.assign(answers, answersAt(QUESTIONS, answers, at)); paintPicker(); };
  }
  /** The highlighted option carries the cursor; each question's answer is marked checked. */
  function paintPicker() {
    el.querySelectorAll('.fr-opt').forEach(o => {
      const i = flat.findIndex(f => f.q === o.dataset.q && f.v === o.dataset.v);
      const on = answers[o.dataset.q] === o.dataset.v;
      o.classList.toggle('on', on); o.setAttribute('aria-checked', String(on));
      o.classList.toggle('cursor-on', i === at); o.tabIndex = i === at ? 0 : -1;
      if (i === at) o.focus({ preventScroll: true });
    });
  }
  function act(id) {
    if (id === 'next') next();
    else if (id === 'start') finish();
    else if (id === 'skip') { skipped = true; finish(); }
  }
  function next() { if (idx + 1 < steps.length) { idx++; render(); } else finish(); }
  function finish() {
    if (!briefingDone) track('briefing_done', { skipped });
    store.setLearner(finishPatch(answers));
    location.hash = '#/lesson/' + FIRST_LESSON;
  }
  const isTyping = tg => !!tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.tagName === 'SELECT' || tg.isContentEditable);
  const onKey = e => {
    if (isTyping(e.target) || e.defaultPrevented) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (step() !== 'picker') return;
      e.preventDefault(); at = pickerMove(e.key, at, flat.length); Object.assign(answers, answersAt(QUESTIONS, answers, at)); paintPicker();
    } else if (e.key === 'Enter') { e.preventDefault(); if (step() === 'picker') next(); else finish(); }
    else if (e.key === 'Escape') { e.preventDefault(); act('skip'); }
  };
  document.addEventListener('keydown', onKey);
  render();
  return { destroy() { document.removeEventListener('keydown', onKey); el.remove(); } };
}
