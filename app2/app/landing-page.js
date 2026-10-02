// app2/app/landing-page.js — the landing page (screenplay 3.0 "The landing page"; 3.1; M95), as
// Wolf re-cut it on 2026-10-02: the headline and Start learning at the left with the live demo at
// the right (the demo is the spreadsheet; no sheet frame around the hero); under it a row of three
// small proofs (a lesson's card pointing at its target, a drill result, the Daily's board), each a
// real piece of the product on its mode's tint with a heading and one line; then the course as six
// chapter cards, each drawn as its modules of lessons closing in a challenge; then the plans side
// by side, and the footer. Few words, the mode colors, keycaps and pixel badges as the accents,
// and motion only where a proof plays itself (none under reduced motion).
//
// Every line a visitor reads is a site.csv row (landing_*, pricing_*); the course's figures come
// from PATH (the plan's modules, lessons and hours per chapter, screenplay 4 and the chapter
// scripts), the plans from the pricing page's own figures and rows.
import { mountDemoPoster, loadLiveDemo } from '../ui/demo-poster.js';
import { track } from './telemetry.js';
import { siteCopy } from '../content/copy/apply.js';
import { createTaskCard, routeTokens } from '../ui/components/task-card.js';
import { trackModel, trackHtml, marksHtml, tierLabel, fmtClock } from '../ui/components/run-panel.js';
import { panelHtml, tableHtml, buttonHtml } from '../ui/components/table.js';
import { GLYPHS, renderPixel } from '../ui/pixel.js';
import { FREE_ROWS, FULL_ROWS, TEAMS_ROWS } from './plans.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? vars[k] : m));
const t = (key, fb) => siteCopy(key, fb);

/** The headline and its two alternates (?h=2 and ?h=3 still show them; screenplay 3.1). */
export const HEADLINES = [
  () => t('landing_headline', 'The better way to master Excel'),
  () => t('landing_headline_2', 'Excel isn’t learned. It’s practiced.'),
  () => t('landing_headline_3', 'The better way to learn Excel'),
];
export const SUBHEAD = () => t('landing_subhead', 'Learn like an analyst at a top firm, and build the muscle memory to make it stick.');

/**
 * The course: six chapters. `modules` is the lessons in each module, in order (every module closes
 * in its challenge, then the chapter's project and assessment); the hours are the plan's.
 */
export const PATH = [
  { n: 1, key: 'foundations', copy: 'landing_path_1', title: 'Foundations', hours: 3.5, access: 'free', modules: [5, 4, 5, 3, 4, 6, 3], line: 'Get around a sheet without the mouse, and build a live weekly report.' },
  { n: 2, key: 'formatting', copy: 'landing_path_2', title: 'Formatting', hours: 3, access: 'pro', modules: [4, 4, 6, 4, 4, 5, 3], line: 'Make a P&L look like it came out of a bank, print set-up included.' },
  { n: 3, key: 'formulas', copy: 'landing_path_3', title: 'Formulas', hours: 3, access: 'pro', modules: [4, 5, 6, 4, 4, 4], line: 'IF, SUMIFS, dates and text, plus the checks that prove it all ties.' },
  { n: 4, key: 'data', copy: 'landing_path_4', title: 'Data and Lookups', hours: 3.5, access: 'pro', modules: [8, 6, 6, 3, 6, 3], line: 'Lookups, pivots and sensitivity tables on a real diligence data set.' },
  { n: 5, key: 'finance', copy: 'landing_path_5', title: 'Finance and Accounting', hours: 4.5, access: 'pro', modules: [7, 6, 6, 5, 4, 6, 3], line: 'Link the three statements and build a five-year model that balances.' },
  { n: 6, key: 'valuation', copy: 'landing_path_6', title: 'Valuation', hours: 3, access: 'pro', modules: [5, 3, 6, 4], line: 'Comps, a DCF and a paper LBO, the way a deal team runs them.' },
];

/** The course in three facts, from PATH: its lessons, its challenges (one a module), its hours. Pure. */
export function courseFacts(path = PATH) {
  const lessons = path.reduce((s, c) => s + c.modules.reduce((a, b) => a + b, 0), 0);
  const challenges = path.reduce((s, c) => s + c.modules.length, 0);
  const hours = path.reduce((s, c) => s + (Number(c.hours) || 0), 0);
  return { lessons, challenges, hours: Math.round(hours) };
}

/** The line under the hero demo, by state: waiting, focused (keys go to the sheet), taken over, failed to load. */
const DEMO_NOTES = () => ({
  idle: t('landing_demo_idle', 'Four goals from Chapter 1 on a real sheet, playing themselves. Click it, then type: the sheet is yours.'),
  still: t('landing_demo_still', 'Four goals from Chapter 1 on a real sheet, ready to play. Play it, or click it and type: the sheet is yours.'),
  focus: t('landing_demo_focus', 'Your keys go to the sheet now. Type to take it over, and Tab moves on.'),
  taken: t('landing_demo_taken', 'Yours. Same four goals, any route. Start learning when you want the real thing.'),
  failed: t('landing_demo_failed', 'The live demo didn’t load; the still shows the finished sheet. Start learning to do it yourself.'),
});

/* ---------------- the three proofs under the hero ---------------- */

/** The lesson plate's sheet: a corner of the weekly Report, the headers the card's goal names. Figures are illustrative. */
const LESSON_SHEET = { cols: ['A', 'B', 'C', 'D'], first: 4, target: ['C', 'D'], rows: [['Site', 'Week', 'Washes', 'Revenue ($)'], ['Domain', 'Sep 15', '1,295', '18,778'], ['Mueller', 'Sep 15', '1,300', '17,550'], ['Riverside', 'Sep 15', '1,480', '20,350'], ['Airport', 'Sep 15', '1,440', '20,160']] };
/** The lesson plate's card: its goal and keys, as a lesson's goal carries them. */
export const LESSON_GOAL = () => ({ n: 2, m: 4, goal: t('landing_plate_lesson_goal', 'Right-align the headers, C4:D4.'), keys: 'Alt H A R' });
/** The drill plate: a result on the time track. Illustrative. */
export const DRILL_RESULT = { secs: 78.4, tier: 'pro', best: 84.6, pars: { pass: 120, pro: 84, legendary: 66 } };
/** The Daily's board. Illustrative. */
export const DAILY_BOARD = [['1', 'marta_k', '1:01.2', ''], ['2', 'dcf_dan', '1:03.8', '+2.6'], ['3', 'pivotqueen', '1:04.1', '+2.9'], ['31', 'you', '1:28.4', '+27.2']];

function lessonPlate() {
  const S = LESSON_SHEET;
  const head = `<tr><th class="lp-ms-corner"></th>${S.cols.map(c => `<th>${c}</th>`).join('')}</tr>`;
  const body = S.rows.map((r, i) => `<tr><th>${S.first + i}</th>${r.map((v, j) => {
    const on = i === 0 && S.target.includes(S.cols[j]);
    return `<td class="${j >= 2 ? 'num' : ''}${i === 0 ? ' hd' : ''}${on ? ' tgt' : ''}">${esc(v)}</td>`;
  }).join('')}</tr>`).join('');
  return `<div class="lp-lesson"><table class="lp-minisheet" aria-hidden="true">${head}${body}</table><div class="lp-cardhost" data-lesson-card></div></div>`;
}
function drillPlate() {
  const d = DRILL_RESULT;
  return `<div class="lp-pcard lp-drill" data-anim="drill">
    <div class="lp-pcard-title">${esc(t('landing_plate_drills_title', 'Format the weekly page'))}</div>
    <div class="rp-time"><b class="rp-time-n" data-count="${d.secs}">${esc(fmtClock(d.secs))}</b><span class="rp-tier">${esc(tierLabel(d.tier))}</span>${marksHtml(d.tier, true)}</div>
    <div class="rp-newbest">${esc(fill(t('panel_new_best', 'New best. {d} seconds faster.'), { d: Math.round((d.best - d.secs) * 10) / 10 }))}</div>
    ${trackHtml(trackModel(d.pars, { secs: d.secs }), { animate: true })}
  </div>`;
}
function dailyPlate() {
  const columns = [{ key: 'n', label: '', cls: 'n' }, { key: 'name', label: '' }, { key: 'time', label: '', align: 'right', cls: 'time' }, { key: 'gap', label: '', align: 'right', cls: 'gap' }];
  const rows = DAILY_BOARD.map((r, i) => ({ cells: { n: esc(r[0]), name: esc(r[1]), time: esc(r[2]), gap: esc(r[3]) }, cls: i === DAILY_BOARD.length - 1 ? 'mine pinned' : '', cursor: false }));
  return `<div class="lp-pcard lp-daily" data-anim="daily">${panelHtml({ heading: esc(t('landing_plate_boards_title', 'The Daily, Thursday')), facts: `<span>${esc(t('landing_plate_boards_facts', '184 clean runs'))}</span>`, body: tableHtml({ columns, rows, head: false, cls: 'tbl-board' }), cls: 'lp-board' })}</div>`;
}

/** The three proofs: mode (the tint and the badge's color), glyph (the pixel badge), copy (heading and line), plate. */
export const PROOFS = [
  { id: 'lessons', mode: 'learn', glyph: 'book', title: 'landing_show_lesson_title', titleFb: 'Lessons', line: 'landing_show_lesson', lineFb: 'One job at a time on a real sheet. The card points at the cells and shows the keys.', plate: lessonPlate },
  { id: 'drills', mode: 'drills', glyph: 'clock', title: 'landing_show_drills_title', titleFb: 'Drills', line: 'landing_show_drills', lineFb: 'Short timed reps with three times to beat: Pass, Expert and Legendary.', plate: drillPlate },
  { id: 'daily', mode: 'daily', glyph: 'trophy', title: 'landing_show_daily_title', titleFb: 'The Daily', line: 'landing_show_daily', lineFb: 'A new ninety-second challenge every day, on one sheet for everyone, with one public board.', plate: dailyPlate },
];

const badge = (glyph, mode) => renderPixel(GLYPHS[glyph], { b: `var(--${mode})`, c: 'var(--sheet)' }, { size: 24, cls: 'lp-px' });

function heroHtml(h) {
  const head = HEADLINES[Math.max(0, Math.min(HEADLINES.length - 1, h))]();
  return `<section class="lp-hero" id="start" aria-label="Start">
    <div class="lp-hero-text">
      <h1 class="lp-headline">${esc(head)}</h1>
      <p class="lp-subhead">${esc(SUBHEAD())}</p>
      <div class="lp-cta"><a class="lp-start" id="startLearning" href="#/start">${esc(t('landing_start', 'Start learning'))}<kbd class="key key-on-fill">Enter</kbd></a></div>
      <p class="lp-start-note">${esc(t('landing_start_note', 'Chapter 1 is free, and you don’t need an account.'))}</p>
    </div>
    <div class="lp-demo"><div id="ldDemo"></div><p class="lp-demo-note" id="ldDemoNote" aria-live="polite"></p></div>
  </section>`;
}

function proofsHtml() {
  return `<section class="lp-sec lp-proofs" id="how" aria-label="${esc(t('landing_show_label', 'How it works'))}">${PROOFS.map(p => `<article class="lp-proof" id="proof-${p.id}">
      <div class="lp-plate" style="--plate:var(--${p.mode}-tint)">${p.plate()}</div>
      <h2 class="lp-proof-h">${badge(p.glyph, p.mode)}<span>${esc(t(p.title, p.titleFb))}</span></h2>
      <p class="lp-proof-line">${esc(t(p.line, p.lineFb))}</p>
    </article>`).join('')}</section>`;
}

/** A chapter's modules as squares: a lesson each, the module's challenge last. */
function stripHtml(c) {
  let k = 0;
  const mods = c.modules.map(n => `<span class="lp-mod">${Array.from({ length: n }, () => `<i style="--i:${k++}"></i>`).join('')}<b style="--i:${k++}"></b></span>`).join('');
  const label = fill(t('landing_strip_label', '{m} modules of lessons, each closing in a timed challenge'), { m: c.modules.length });
  return `<div class="lp-strip" role="img" aria-label="${esc(label)}">${mods}</div>`;
}

function courseHtml() {
  const f = courseFacts();
  const facts = [fill(t('landing_fact_lessons', '{n} lessons.'), { n: f.lessons }), fill(t('landing_fact_challenges', '{n} challenges.'), { n: f.challenges }), fill(t('landing_fact_hours', 'About {n} hours, beginner to expert.'), { n: f.hours })];
  return `<section class="lp-sec lp-course" id="path" aria-label="${esc(t('landing_path_title', 'From your first Alt to a full valuation'))}">
    <div class="lp-sec-head"><h2 class="lp-sec-h">${esc(t('landing_path_title', 'From your first Alt to a full valuation'))}</h2><div class="lp-facts">${facts.map(x => `<span>${esc(x)}</span>`).join('')}</div></div>
    <ol class="lp-chapters" data-anim="course">${PATH.map(c => {
      const lessons = c.modules.reduce((a, b) => a + b, 0);
      return `<li class="lp-ch${c.access === 'free' ? ' free' : ''}">
        <div class="lp-ch-top"><span class="lp-ch-n">${c.n}</span><span class="lp-ch-access">${esc(c.access === 'free' ? t('landing_free', 'Free') : t('landing_pro', 'Full Access'))}</span></div>
        <h3 class="lp-ch-title">${esc(t(c.copy + '_title', c.title))}</h3>
        <div class="lp-ch-facts"><span>${esc(fill(t('landing_ch_modules', '{n} modules'), { n: c.modules.length }))}</span><span>${esc(fill(t('landing_ch_lessons', '{n} lessons'), { n: lessons }))}</span><span>${esc(fill(t('landing_hours', '{n} hours'), { n: c.hours }))}</span></div>
        ${stripHtml(c)}
        <p class="lp-ch-line">${esc(t(c.copy, c.line))}</p>
      </li>`;
    }).join('')}</ol>
    <p class="lp-legend"><span><i class="lp-sq" aria-hidden="true"></i>${esc(t('landing_legend_lesson', 'A lesson'))}</span><span><b class="lp-sq lp-sq-ch" aria-hidden="true"></b>${esc(t('landing_legend_challenge', 'The timed challenge that closes each module'))}</span></p>
  </section>`;
}

/** The plans, side by side: the pricing page's own figures and rows (the first three of each), Full Access marked. */
export const PLANS = () => [
  { id: 'free', name: t('pricing_free', 'Free'), figure: '$0', unit: '', sub: t('pricing_free_unit', 'No card, no account needed to start'), rows: FREE_ROWS().slice(0, 3), button: { label: t('landing_start', 'Start learning'), key: 'Enter', href: '#/start', primary: true } },
  { id: 'full', name: t('pricing_full', 'Full Access'), mark: t('pricing_recommended', 'Recommended'), figure: t('pricing_full_figure', '$15'), unit: t('pricing_full_unit', 'a month'), sub: t('pricing_full_student', 'Students $9 a month with your school email'), rows: FULL_ROWS().slice(0, 3), button: { label: t('landing_see_pricing', 'See pricing'), href: '#/pricing' } },
  { id: 'teams', name: t('pricing_teams_col', 'Teams'), figure: t('pricing_teams_figure', '$12'), unit: t('pricing_teams_unit', 'a seat a month'), sub: t('pricing_teams_seats', '5 seats or more'), rows: TEAMS_ROWS().slice(0, 3), button: { label: t('landing_nav_teams', 'For teams'), href: '#/teams' } },
];

function pricingHtml() {
  const tick = '<i class="plan-tick" aria-hidden="true"></i>';
  return `<section class="lp-sec lp-pricing" id="pricing" aria-label="${esc(t('pricing_title', 'Pricing'))}">
    <div class="lp-sec-head"><h2 class="lp-sec-h">${esc(t('landing_pricing', 'Chapter 1 is free in full.'))}</h2><a class="lp-sec-link" href="#/pricing">${esc(t('landing_see_pricing', 'See pricing'))}</a></div>
    <div class="lp-plans">${PLANS().map(p => `<section class="lp-plan${p.id === 'full' ? ' lp-plan-full' : ''}" aria-label="${esc(p.name)}">
        <div class="lp-plan-head"><h3 class="lp-plan-name">${esc(p.name)}</h3>${p.mark ? `<span class="plan-mark">${esc(p.mark)}</span>` : ''}</div>
        <div class="plan-price"><span class="plan-figure mono">${esc(p.figure)}</span>${p.unit ? `<span class="ink-2">${esc(p.unit)}</span>` : ''}</div>
        <p class="lp-plan-sub">${esc(p.sub)}</p>
        <ul class="ticks">${p.rows.map(r => `<li>${tick}<span>${esc(r)}</span></li>`).join('')}</ul>
        <div class="lp-plan-foot">${buttonHtml(p.button)}</div>
      </section>`).join('')}</div>
    <p class="lp-return">${esc(t('landing_return', 'Learning here already?'))} <a id="ldSignIn" href="#/account">${esc(t('rail_sign_in', 'Sign in'))}</a> ${esc(t('landing_return_tail', 'to pick up where you left off.'))}</p>
  </section>`;
}

export function landingHtml(h = 0) {
  return `<div class="lp">${heroHtml(h)}${proofsHtml()}${courseHtml()}${pricingHtml()}</div>`;
}

/** The lesson plate's card: the real task card, its keycaps filling one by one, the goal ticking, then again. Still under reduced motion. */
function mountLessonCard(el, reduced) {
  const host = el && el.querySelector('[data-lesson-card]'); if (!host) return { start() {}, stop() {}, destroy() {} };
  const card = createTaskCard(host, {});
  const g = LESSON_GOAL(), tokens = routeTokens(g.keys);
  const show = (matched, done) => {
    card.set(done ? { n: g.n, m: g.m, goal: g.goal, state: 'done' } : { n: g.n, m: g.m, goal: g.goal, keys: tokens, progress: { matched }, state: 'repeat' });
    card.el.hidden = false;
    // the pointer on the card's top edge, under the middle of the target
    const tg = [...el.querySelectorAll('td.tgt')], cr = card.el.getBoundingClientRect();
    const mid = tg.length ? (tg[0].getBoundingClientRect().left + tg[tg.length - 1].getBoundingClientRect().right) / 2 : cr.left + 48;
    card.place({ side: 'below', rect: { left: 0, top: 0, height: 999 }, pointer: { edge: 'top', at: Math.max(16, Math.min(cr.width - 16, mid - cr.left)) } });
  };
  show(reduced ? tokens.length : 0, false);
  if (reduced) el.classList.add('lp-aligned');
  let step = 0, timer = null;
  const tick = () => { step = (step + 1) % (tokens.length + 3); show(Math.min(step, tokens.length), step === tokens.length + 1); el.classList.toggle('lp-aligned', step >= tokens.length); };
  return { start() { if (!reduced && !timer) timer = setInterval(tick, 650); }, stop() { if (timer) clearInterval(timer); timer = null; }, destroy() { if (timer) clearInterval(timer); card.destroy(); } };
}

/** The drill plate's time counting up to the result, once, as the result does in the run panel. */
function countUp(el, reduced) {
  const n = el.querySelector('[data-count]'); if (!n || reduced) return;
  const to = Number(n.dataset.count), t0 = performance.now(), ms = 900;
  const frame = now => { const k = Math.min(1, (now - t0) / ms); n.textContent = fmtClock(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(frame); };
  requestAnimationFrame(frame);
}

export function mountLandingPage(root, ctx = {}) {
  track('landing_view', { flow: 'next' });
  const q = (ctx && ctx.query) || {};
  const h = Math.max(0, (parseInt(q.h, 10) || 1) - 1);
  const el = document.createElement('div');
  el.innerHTML = landingHtml(h);
  root.appendChild(el);
  const reduced = prefersReducedMotion();
  let tookOver = false, failed = false;
  const note = el.querySelector('#ldDemoNote');
  const notes = DEMO_NOTES();
  // a still of the lesson paints at once; the live demo loads behind it and takes its place (a failed load keeps the still)
  const host = el.querySelector('#ldDemo');
  let demo = mountDemoPoster(host, { note: false });
  const inDemo = () => !!(demo && demo.el && !demo.poster && demo.el.contains(document.activeElement));
  let noteKey = '';
  const syncNote = () => {
    const k = failed ? 'failed' : tookOver ? 'taken' : inDemo() ? 'focus' : reduced && !(demo && demo.started) ? 'still' : 'idle';
    if (note && k !== noteKey) { noteKey = k; note.textContent = notes[k]; }
  };
  const cancelDemo = loadLiveDemo(host, {
    loop: !reduced, autoplay: !reduced, focusable: true,
    onDone: () => { if (!tookOver) track('landing_demo', { where: 'landing', outcome: 'finished' }); },
    onPlay: () => syncNote(),
    onTakeover: () => { tookOver = true; track('landing_demo', { where: 'landing', outcome: 'takeover' }); syncNote(); },
    onFail: () => { failed = true; syncNote(); },
  }, d => { demo = d; syncNote(); }, demo);
  syncNote();

  // the proofs play when they come into view (the lesson card's keys, the drill's count and track, the board's own row); nothing moves under reduced motion
  const lesson = mountLessonCard(el.querySelector('#proof-lessons'), reduced);
  const seen = new Set();
  const onSeen = target => {
    const id = target.id || target.dataset.anim;
    if (id === 'proof-lessons') lesson.start();
    if (seen.has(id)) return; seen.add(id);
    target.classList.add('lp-in');
    if (id === 'proof-drills') { const d = target.querySelector('.lp-drill'); if (d && !reduced) d.classList.add('rp-animate'); countUp(target, reduced); }
  };
  const watched = [...el.querySelectorAll('.lp-proof, [data-anim="course"]')];
  const io = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => { for (const en of entries) { if (en.isIntersecting) onSeen(en.target); else if (en.target.id === 'proof-lessons') lesson.stop(); } }, { threshold: 0.35 }) : null;
  if (io) watched.forEach(w => io.observe(w)); else watched.forEach(onSeen);

  const isTyping = tg => !!tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.tagName === 'SELECT' || tg.tagName === 'BUTTON' || tg.tagName === 'A' || tg.isContentEditable);
  const onKey = e => {
    if (e.defaultPrevented) return;
    const focused = inDemo();
    if (focused && e.target && e.target.closest && e.target.closest('.dp-play')) return;   // the play button's own Enter / Space
    if (!focused && isTyping(e.target)) return;
    const to = landingKeyRoute(e, focused);
    if (to === 'start') { e.preventDefault(); location.hash = '#/start'; }
    else if (to === 'demo') {
      const handled = demo.takeover(e);
      if (handled || /^(Arrow|Page)|^(Home|End|Backspace| )$/.test(e.key)) e.preventDefault();   // while the sheet has focus its keys never scroll the page
    }
  };
  const onKeyUp = e => { if (e.key === 'Alt' && inDemo()) e.preventDefault(); };
  // a click on the demo gives it the keyboard; a click on its sheet also hands the sheet over, so the click lands on the visitor's sheet
  const onPointer = e => {
    if (!demo || demo.poster || !demo.el || !demo.el.contains(e.target) || (e.target.closest && e.target.closest('.dp-play'))) return;
    if (!inDemo()) demo.el.focus({ preventScroll: true });
    if (!demo.taken && e.target.closest && e.target.closest('.dp-stage')) demo.takeover();
  };
  const onFocus = () => syncNote();
  document.addEventListener('keydown', onKey);
  document.addEventListener('keyup', onKeyUp);
  document.addEventListener('pointerdown', onPointer, true);
  document.addEventListener('focusin', onFocus);
  document.addEventListener('focusout', onFocus);
  return { destroy() {
    cancelDemo(); if (io) io.disconnect(); lesson.destroy();
    document.removeEventListener('keydown', onKey); document.removeEventListener('keyup', onKeyUp); document.removeEventListener('pointerdown', onPointer, true);
    document.removeEventListener('focusin', onFocus); document.removeEventListener('focusout', onFocus);
    demo.destroy(); el.remove();
  } };
}

const prefersReducedMotion = () => { try { return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };

/** A key the sheet would understand: arrows, letters, Ctrl/Alt chords, the editing and paging keys. Pure. */
const sheetKey = e => e.altKey || e.ctrlKey || e.metaKey || /^Arrow|^F\d$|^(Home|End|PageUp|PageDown|Delete|Backspace|Escape|Enter)$/.test(e.key) || e.key.length === 1;

/**
 * Where a key on the landing goes. Pure. 'demo': the demo has focus and the key is one the sheet
 * reads (Tab excepted: it always moves focus on, so the demo never traps it); 'start': a plain Enter
 * anywhere else starts; null: the page keeps it (scrolling, Space, Tab, the browser's shortcuts).
 */
export function landingKeyRoute(e, demoFocused) {
  if (demoFocused) return e.key !== 'Tab' && sheetKey(e) ? 'demo' : null;
  return e.key === 'Enter' && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey ? 'start' : null;
}
