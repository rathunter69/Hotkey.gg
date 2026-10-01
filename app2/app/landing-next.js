// app2/app/landing-next.js — the landing page as a sheet (screenplay 3.0 "The landing page";
// 3.1; M95). Under the top bar, a Name Box and formula bar show B2 and the headline; column
// letters and row numbers frame the hero and faint gridlines run behind it. The headline sits in
// B2, Wolf's subhead under it, and "Start learning" is the selected cell, filled green with the
// cursor's handle, on Enter. Beside it: "Chapter 1 is free, and you don't need an account." Under
// them, the course in three facts from the course data. The live demo floats over the columns at
// the right, playing a real lesson until the visitor clicks it and takes over. Sheet tabs under
// the hero jump to the sections: the path (six chapters on one line), then five sections of a
// proof plate on its mode's tint and Wolf's mode line with two or three facts as rows (Drills,
// Rapid-fire, Leaderboards, Challenges, the Certificate), then pricing and teams on the same two
// columns, then the footer. No closing band, no label above the headline, no case on the page.
//
// Every line a visitor reads is a site.csv row (landing_*, mode_*); the figures come from the
// course data (LESSONS and PATH). The live pricing line stays until Wolf says go.
import { mountDemoPoster, loadLiveDemo } from '../ui/demo-poster.js';
import { track } from './telemetry.js';
import { LESSONS } from '../content/index.js';
import { siteCopy, splitParas } from '../content/copy/apply.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fill = (s, vars) => String(s).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? vars[k] : m));
const t = (key, fb) => siteCopy(key, fb);

/** The headline and its two alternates (?h=2 and ?h=3 still show them; screenplay 3.1). */
export const HEADLINES = [
  () => t('landing_headline', 'The better way to master Excel'),
  () => 'Excel isn’t learned. It’s practiced.',
  () => 'The better way to learn Excel',
];
export const SUBHEAD = () => t('landing_subhead', 'Learn like an analyst at a top firm, and build the muscle memory to make it stick.');

/**
 * The path: the six chapters on one line (3.0; the hours and lines from screenplay 3.1 and 5).
 * The built chapters' lessons are counted from the catalog; the hours are the plan's.
 */
export const PATH = [
  { n: 1, key: 'foundations', copy: 'landing_path_1', title: 'Foundations', hours: 3.5, access: 'free', line: 'Get around a sheet without the mouse, and build a live weekly report.' },
  { n: 2, key: 'formatting', copy: 'landing_path_2', title: 'Formatting', hours: 3, access: 'pro', line: 'Make a P&L look like it came out of a bank, print set-up included.' },
  { n: 3, key: 'formulas', copy: 'landing_path_3', title: 'Formulas', hours: 3, access: 'pro', line: 'IF, SUMIFS, dates and text, plus the checks that prove it all ties.' },
  { n: 4, key: 'data', copy: 'landing_path_4', title: 'Data and Lookups', hours: 3.5, access: 'pro', line: 'Lookups, pivots and sensitivity tables on a real diligence data set.' },
  { n: 5, key: 'finance', copy: 'landing_path_5', title: 'Finance and Accounting', hours: 4.5, access: 'pro', line: 'Link the three statements and build a five-year model that balances.' },
  { n: 6, key: 'valuation', copy: 'landing_path_6', title: 'Valuation', hours: 3, access: 'pro', line: 'Comps, a DCF and a paper LBO, the way a deal team runs them.' },
];

/**
 * The five sections, each a proof plate on its mode's tint and Wolf's mode line with its facts
 * (screenplay 3.1). `mode` picks the tint token; `copy` the site.csv row whose paragraphs are the
 * heading then the facts; `plate` names the drawn proof.
 */
export const SECTIONS = [
  { id: 'drills', mode: 'drills', copy: 'landing_drills', plate: 'drills', fallback: 'Drills: build muscle memory. || Short reps, one to five minutes, with three times to beat: Pass, Expert and Legendary. || Every day we pick a set for you: what’s due, where you’re slow, and what you just learned. || Post a clean run and you’re on the board.' },
  { id: 'rapid-fire', mode: 'rapid', copy: 'landing_rapid', plate: 'rapid', fallback: 'Rapid-fire: reach flow state. || We name the command, you press the keys, and the next one’s already waiting. || Thirty, sixty or a hundred and twenty seconds. Miss one and the combo starts over. || It pulls from every shortcut you’ve learned and leans on the ones you keep forgetting.' },
  { id: 'leaderboards', mode: 'daily', copy: 'landing_boards', plate: 'boards', fallback: 'Leaderboards: see who’s the fastest. || The Daily is a new ninety-second challenge every day, on the same sheet for everyone, with one public board. || Every drill and every challenge has a board of its own. || Only clean runs count. Use help or the mouse and your time stays off the board.' },
  { id: 'challenges', mode: 'challenges', copy: 'landing_challenges', plate: 'challenges', fallback: 'Challenges: work through a full solution, timed. || Every module ends with one, on a fresh file, so you can’t just memorize the answer. || Pass it and the module’s done. Expert and Legendary are there when you want more.' },
  { id: 'certificate', mode: 'learn', copy: 'landing_certificate', plate: 'certificate', fallback: 'Finish all six chapters and get certified. || Each chapter ends in an assessment on a hard clock, with no help and no mouse. || The certificate is hotkey.gg Certified, Excel for Finance. || Add it to LinkedIn in one click. The link opens a page with your times, so anyone can check it.' },
];
/** The sheet tabs under the hero: each jumps to a section (3.0). */
export const TABS = [
  { id: 'start', copy: 'landing_tab_start', fallback: 'Start' },
  { id: 'path', copy: 'landing_tab_path', fallback: 'The path' },
  { id: 'drills', copy: 'landing_tab_drills', fallback: 'Drills' },
  { id: 'rapid-fire', copy: 'landing_tab_rapid', fallback: 'Rapid-fire' },
  { id: 'leaderboards', copy: 'landing_tab_boards', fallback: 'Leaderboards' },
  { id: 'challenges', copy: 'landing_tab_challenges', fallback: 'Challenges' },
  { id: 'certificate', copy: 'landing_tab_certificate', fallback: 'Certificate' },
];

/** The course in three facts, from the course data: the built lessons, their challenges, the plan's hours. Pure. */
export function courseFacts(lessons = LESSONS, path = PATH) {
  const live = lessons.filter(l => l.module && l.module !== 'welcome');
  const challenges = live.filter(l => l.kind === 'challenge').length;
  const hours = path.reduce((s, c) => s + (Number(c.hours) || 0), 0);
  return { lessons: live.length - challenges, challenges, hours: Math.round(hours) };
}

/** The line under the hero demo, by state: waiting, focused (keys go to the sheet), taken over, failed to load. */
const DEMO_NOTES = () => ({
  idle: t('landing_demo_idle', 'Four goals from Chapter 1 on a real sheet, playing themselves. Click it, then type: the sheet is yours.'),
  still: t('landing_demo_still', 'Four goals from Chapter 1 on a real sheet, ready to play. Play it, or click it and type: the sheet is yours.'),
  focus: t('landing_demo_focus', 'Your keys go to the sheet now. Type to take it over, and Tab moves on.'),
  taken: t('landing_demo_taken', 'Yours. Same four goals, any route. Start learning when you want the real thing.'),
  failed: t('landing_demo_failed', 'The live demo didn’t load; the still shows the finished sheet. Start learning to do it yourself.'),
});

/* ---------------- the proof plates: a real piece of the product, drawn from data ---------------- */
const tierMarks = n => `<span class="tiers" aria-hidden="true">${[0, 1, 2].map(i => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</span>`;
const PLATES = {
  drills: () => `<div class="plate-table"><div class="plate-head"><span>${esc(t('landing_plate_drills_title', 'Drills'))}</span><span>${esc(t('landing_plate_drills_facts', 'Six picked for you, about ten minutes'))}</span></div>
    <table class="tbl"><tbody>${[['Jump, don’t scroll', '60 s', '0:41.2', 3], ['Select to the edge', '60 s', '0:52.8', 2], ['Paste values', '90 s', '1:12.0', 1], ['AutoSum the column', '90 s', '', 0]].map(r => `<tr><td class="name">${esc(r[0])}</td><td class="num">${r[1]}</td><td class="num mono">${r[2]}</td><td>${tierMarks(r[3])}</td></tr>`).join('')}</tbody></table></div>`,
  rapid: () => `<div class="plate-rapid"><div class="plate-rapid-cmd">${esc(t('landing_plate_rapid_cmd', 'Format Cells'))}</div><div class="keys">${['Ctrl', '1'].map(k => `<kbd class="key">${k}</kbd>`).join('')}</div><div class="combo" aria-hidden="true">${Array.from({ length: 10 }, (_, i) => `<i class="${i < 7 ? 'on' : ''}"></i>`).join('')}</div><div class="plate-rapid-line">${esc(t('landing_plate_rapid_line', 'Combo 7. Next: Paste values.'))}</div></div>`,
  boards: () => `<div class="plate-table"><div class="plate-head"><span>${esc(t('landing_plate_boards_title', 'The Daily'))}</span><span>${esc(t('landing_plate_boards_facts', '212 clean runs today'))}</span></div>
    <table class="tbl"><tbody>${[['1', 'ctrl_z', '1:02.4', ''], ['2', 'lena', '1:04.1', '+1.7'], ['3', 'dcf_dan', '1:05.9', '+3.5'], ['31', 'you', '1:18.4', '+16.0']].map((r, i) => `<tr class="${i === 3 ? 'you' : ''}"><td class="num mono">${r[0]}</td><td class="name">${esc(r[1])}</td><td class="num mono">${r[2]}</td><td class="num mono">${r[3]}</td></tr>`).join('')}</tbody></table></div>`,
  challenges: () => `<div class="plate-table"><div class="plate-head"><span>${esc(t('landing_plate_challenges_title', 'Challenge 1.5'))}</span><span class="mono">2:41</span></div>
    <ol class="checklist">${['Label the inputs and color them blue', 'Put the weekly totals in a SUM row', 'Bold the header row and clear the gridlines', 'Fit the report to one page'].map((s, i) => `<li class="${i < 2 ? 'done' : i === 2 ? 'now' : ''}">${esc(s)}</li>`).join('')}</ol></div>`,
  certificate: () => `<div class="plate-cert"><div class="plate-cert-card"><div class="plate-cert-mark">${esc(t('certificate_name', 'hotkey.gg Certified'))}</div><div class="plate-cert-course">${esc(t('certificate_course', 'Excel for Finance'))}</div><div class="plate-cert-line">${esc(fill(t('certificate_progress', '{n} of 6 chapters Verified'), { n: 2 }))}</div></div></div>`,
};

/** The hero's sheet frame: the column letters, the row numbers and the cells the copy sits in. */
function heroHtml(h, facts) {
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const head = HEADLINES[Math.max(0, Math.min(HEADLINES.length - 1, h))]();
  return `<section class="lp-hero" id="start" aria-label="Start">
    <div class="lp-fbar" aria-hidden="true"><span class="lp-namebox mono">B2</span><span class="lp-fx mono">fx</span><span class="lp-formula">${esc(head)}</span></div>
    <div class="lp-sheet">
      <div class="lp-cols" aria-hidden="true"><span class="lp-corner"></span>${cols.map(c => `<span>${c}</span>`).join('')}</div>
      <div class="lp-rows" aria-hidden="true">${Array.from({ length: 12 }, (_, i) => `<span>${i + 1}</span>`).join('')}</div>
      <div class="lp-grid" aria-hidden="true"></div>
      <div class="lp-cells">
        <h1 class="lp-headline">${esc(head)}</h1>
        <p class="lp-subhead">${esc(SUBHEAD())}</p>
        <div class="lp-cta-row">
          <a class="lp-start cursor-cell" id="startLearning" href="#/start">${esc(t('landing_start', 'Start learning'))}<kbd class="key key-on-fill">Enter</kbd></a>
          <span class="lp-start-note">${esc(t('landing_start_note', 'Chapter 1 is free, and you don’t need an account.'))}</span>
        </div>
        <div class="lp-facts">
          <span>${esc(fill(t('landing_fact_lessons', '{n} lessons.'), { n: facts.lessons }))}</span>
          <span>${esc(fill(t('landing_fact_challenges', '{n} challenges.'), { n: facts.challenges }))}</span>
          <span>${esc(fill(t('landing_fact_hours', 'About {n} hours, beginner to expert.'), { n: facts.hours }))}</span>
        </div>
      </div>
      <div class="lp-demo"><div id="ldDemo"></div><p class="lp-demo-note" id="ldDemoNote" aria-live="polite"></p></div>
    </div>
    <nav class="lp-tabs" aria-label="Sections">${TABS.map((tab, i) => `<a class="lp-tab${i === 0 ? ' on' : ''}" href="#${tab.id}" data-tab="${tab.id}">${esc(t(tab.copy, tab.fallback))}</a>`).join('')}</nav>
  </section>`;
}

function pathHtml() {
  return `<section class="lp-sec lp-path" id="path" aria-label="The path">
    <h2 class="h-panel">${esc(t('landing_path_title', 'From your first Alt to a full valuation'))}</h2>
    <ol class="lp-chapters">${PATH.map(c => `<li class="lp-chapter"><span class="lp-ch-n mono">${c.n}</span><span class="lp-ch-title">${esc(t(c.copy + '_title', c.title))}</span><span class="lp-ch-facts">${esc(fill(t('landing_hours', '{n} hours'), { n: c.hours }))}<span class="lp-ch-access${c.access === 'free' ? ' free' : ''}">${esc(c.access === 'free' ? t('landing_free', 'Free') : t('landing_pro', 'Pro'))}</span></span><span class="lp-ch-line">${esc(t(c.copy, c.line))}</span></li>`).join('')}</ol>
  </section>`;
}

function sectionHtml(s) {
  const paras = splitParas(t(s.copy, s.fallback));
  const [heading, ...facts] = paras;
  return `<section class="lp-sec lp-mode" id="${s.id}" data-mode="${s.mode}">
    <div class="plate" style="--plate:var(--${s.mode}-tint)">${PLATES[s.plate]()}</div>
    <div class="lp-mode-text"><h2 class="h-panel">${esc(heading || '')}</h2><div class="facts">${facts.map(f => `<p class="fact">${esc(f)}</p>`).join('')}</div></div>
  </section>`;
}

function pricingHtml() {
  const paras = splitParas(t('landing_pricing', 'Chapter 1 is free in full. || The rest is $9 a month.'));
  return `<section class="lp-sec lp-mode" id="pricing" aria-label="Pricing">
    <div class="plate" style="--plate:var(--plate-neutral)"><div class="plate-price"><div class="plate-price-row"><span>${esc(t('landing_free', 'Free'))}</span><span class="mono">$0</span></div><div class="plate-price-row"><span>${esc(t('landing_pro', 'Pro'))}</span><span class="mono">${esc(t('landing_pro_price', '$9 a month'))}</span></div></div></div>
    <div class="lp-mode-text"><h2 class="h-panel">${esc(paras[0] || '')}</h2><div class="facts">${paras.slice(1).map(f => `<p class="fact">${esc(f)}</p>`).join('')}</div>
      <div class="btn-row"><a class="btn btn-primary" href="#/start">${esc(t('landing_start', 'Start learning'))}</a><a class="btn" href="#/pricing">${esc(t('landing_see_pricing', 'See pricing'))}</a></div></div>
  </section>
  <section class="lp-sec lp-mode lp-teams" id="teams" aria-label="Teams">
    <div class="lp-mode-text"><h2 class="h-panel">${esc(t('landing_teams_title', 'Learning with a team or a class?'))}</h2><p class="fact">${esc(t('landing_teams_body', 'Set up a desk with its own board and assignments, or talk to us about group access for a bank, a training provider or a school.'))}</p></div>
    <div class="btn-row"><a class="btn" href="#/teams">${esc(t('landing_nav_teams', 'For teams'))}</a></div>
  </section>
  <p class="lp-return">${esc(t('landing_return', 'Learning here already?'))} <a id="ldSignIn" href="#/account">${esc(t('rail_sign_in', 'Sign in'))}</a> ${esc(t('landing_return_tail', 'to pick up where you left off.'))}</p>`;
}

export function landingHtml(h = 0) {
  return `<div class="lp">${heroHtml(h, courseFacts())}${pathHtml()}${SECTIONS.map(sectionHtml).join('')}${pricingHtml()}</div>`;
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
  let demo = mountDemoPoster(host, { compact: true, note: false });
  const inDemo = () => !!(demo && demo.el && !demo.poster && demo.el.contains(document.activeElement));
  let noteKey = '';
  const syncNote = () => {
    const k = failed ? 'failed' : tookOver ? 'taken' : inDemo() ? 'focus' : reduced && !(demo && demo.started) ? 'still' : 'idle';
    if (note && k !== noteKey) { noteKey = k; note.textContent = notes[k]; }
  };
  const cancelDemo = loadLiveDemo(host, {
    compact: true, loop: !reduced, autoplay: !reduced, focusable: true,
    onDone: () => { if (!tookOver) track('landing_demo', { where: 'landing', outcome: 'finished' }); },
    onPlay: () => syncNote(),
    onTakeover: () => { tookOver = true; track('landing_demo', { where: 'landing', outcome: 'takeover' }); syncNote(); },
    onFail: () => { failed = true; syncNote(); },
  }, d => { demo = d; syncNote(); }, demo);
  syncNote();

  // the sheet tabs: a click scrolls to the section and marks the tab; scrolling marks the tab whose section is in view
  const tabs = [...el.querySelectorAll('.lp-tab')];
  const markTab = id => tabs.forEach(a => a.classList.toggle('on', a.dataset.tab === id));
  const onTabClick = e => {
    const a = e.target.closest('.lp-tab'); if (!a) return;
    const sec = el.querySelector('#' + a.dataset.tab); if (!sec) return;
    e.preventDefault(); markTab(a.dataset.tab);
    try { sec.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' }); } catch (err) { sec.scrollIntoView(); }
  };
  el.addEventListener('click', onTabClick);
  const io = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => { for (const en of entries) if (en.isIntersecting) markTab(en.target.id); }, { rootMargin: '-40% 0px -55% 0px' }) : null;
  if (io) TABS.forEach(tab => { const sec = el.querySelector('#' + tab.id); if (sec) io.observe(sec); });

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
    cancelDemo(); if (io) io.disconnect();
    document.removeEventListener('keydown', onKey); document.removeEventListener('keyup', onKeyUp); document.removeEventListener('pointerdown', onPointer, true);
    document.removeEventListener('focusin', onFocus); document.removeEventListener('focusout', onFocus);
    el.removeEventListener('click', onTabClick);
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
