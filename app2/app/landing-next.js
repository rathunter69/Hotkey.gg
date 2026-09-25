// app2/app/landing-next.js — the landing, redesigned (experience pass, decision 2): "Excel isn't
// learned. It's practiced." (Wolf's pick) with two alternates behind ?h=2 / ?h=3, the subhead a non-banker self-selects into (decision 13), a live
// self-playing lesson the visitor can take over by clicking it (or tabbing to it) and typing, the
// six modes shown as short muted clips of the real product composed as a page, then how it works,
// Project Volt, free vs paid, teams and the close (with a Sign in for returning learners; the nav
// carries the other). Enter anywhere starts.
//
// Keys reach the demo only while it has focus: page scrolling, Space, Tab and the browser's own
// shortcuts work as on any page. Motion: the clips play only while on screen, and with reduced
// motion nothing plays by itself (posters with a play control; the demo waits on its first frame).
import { mountDemoPoster, loadLiveDemo } from '../ui/demo-poster.js';
import { NAV_ICONS } from '../ui/nav.js';
import { store } from './store.js';
import { track } from './telemetry.js';
import { STAGES } from './deal-strip.js';
import { siteCopy } from '../content/copy/apply.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** The headline and its two alternates (?h=2 and ?h=3 still show them). */
export const HEADLINES = [
  { a: siteCopy('landing_headline_a', 'Excel isn’t learned.'), b: siteCopy('landing_headline_b', 'It’s practiced.') },   // shipped (Wolf, 2026-09-23 B); site.csv overrides
  { a: 'You don’t learn Excel by watching.', b: 'You learn it by doing it again.' },
  { a: 'Nobody learned Excel from a video.', b: '' },
];
export const SUBHEAD = siteCopy('landing_subhead', 'Learn Excel the way analysts are taught — on a real sheet, one job at a time.');

/**
 * The six modes, in the order a learner meets them. Each clip is a muted loop of the real product;
 * `poster` shows until it plays, and a themed card (a mini grid, the mode's glyph and name) sits
 * behind both, so the card still reads when neither file loads. `href`: the Learn modes start the
 * first run; the Practice modes and the boards open their pages, which a guest can browse as is.
 */
const MODES_DEFAULT = [
  { key: 'lesson', size: 'wide', title: 'Lessons', line: 'One job at a time on a live sheet. The keys are shown the first time; the sheet is graded on where it ends up, so any correct route counts.', where: 'Learn', href: '#/start' },
  { key: 'challenge', size: '', title: 'Challenges', line: 'Every module ends in a seeded, timed run on a fresh file. Pass completes the module; pro and legendary are what you come back for.', where: 'Learn', href: '#/start' },
  { key: 'drill', size: '', title: 'Drills', line: 'The same generators stripped of the story. Pars, personal bests, and a ghost of your own best run to race.', where: 'Practice', href: '#/practice' },
  { key: 'daily', size: '', title: 'The Daily', line: 'Ninety seconds, the same sheet for everyone, once a day. A result card built to be shared.', where: 'Practice', href: '#/practice' },
  { key: 'rapid', size: '', title: 'Rapid-fire', line: 'One shortcut at a time against the clock, drawn from the ones you remember least. Recall is the game.', where: 'Practice', href: '#/practice' },
  { key: 'boards', size: 'wide', title: 'Boards', line: 'A board for every challenge and for the Daily. Clean runs only: no help, no mouse. Rank turns on when the field fills.', where: 'Leaderboard', href: '#/leaderboard' },
];
export const MODES = MODES_DEFAULT.map(m => ({ ...m, line: siteCopy('mode_' + m.key, m.line) }));

/** Each mode's glyph on its fallback card: the nav's line icons, and three more in the same hand. */
const SVG = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const MODE_GLYPHS = {
  lesson: NAV_ICONS.learn,
  challenge: `<svg ${SVG}><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9 2h6"/></svg>`,
  drill: NAV_ICONS.practice,
  daily: `<svg ${SVG}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>`,
  rapid: `<svg ${SVG}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/></svg>`,
  boards: NAV_ICONS.leaderboard,
};

/** The hero's small print as separate clauses (' · ' in the source), so a wrapped line never starts with a separator. Pure. */
export function microClauses(line) { return String(line || '').split(' · ').map(s => s.trim()).filter(Boolean); }

/** The line under the hero demo, by state: waiting, focused (keys go to the sheet), taken over, failed to load. */
const DEMO_NOTES = {
  idle: 'A real lesson, playing itself. <b>Click it, then type</b>: the sheet is yours.',
  still: 'A real lesson, ready to play. <b>Play it</b>, or click it and type: the sheet is yours.',
  focus: 'Your keys go to the sheet now. <b>Type</b> to take it over; <b>Tab</b> moves on.',
  taken: '<b>Yours.</b> Same four goals, any route. <a href="#/start">Start learning</a> when you want the real thing.',
  failed: 'The live demo didn’t load; the still shows the finished sheet. <a href="#/start">Start learning</a> to do it yourself.',
};

const HOW = [
  { n: '01', h: 'One line of why', p: 'Each goal carries its own teaching point: what the key does and why an analyst reaches for it.' },
  { n: '02', h: 'Do it on the sheet', p: 'The keys are shown once. You press them on a real sheet with the real Ribbon, and the goal ticks when the sheet is right.' },
  { n: '03', h: 'Pass the challenge', p: 'A seeded run on a fresh file at the end of every module. Correct numbers with a broken convention do not pass.' },
  { n: '04', h: 'Come back for the reps', p: 'Drills, rapid-fire and the Daily. Three items a day, ninety seconds, chosen from what you are about to forget.' },
];

export function landingHtml(h = 0) {
  const head = HEADLINES[Math.max(0, Math.min(HEADLINES.length - 1, h))];
  return `<div class="ld2">
    <section class="ld2-hero">
      <div class="l-glow"></div>
      <div class="ld2-hero-grid">
        <div class="ld2-hero-text">
          <div class="eyebrow">learn excel by doing · keyboard first</div>
          <h1>${esc(head.a)}${head.b ? `<br><em>${esc(head.b)}</em>` : ''}</h1>
          <p class="lede">${esc(SUBHEAD)}</p>
          <div class="landing-cta">
            <a class="start-btn" id="startLearning" href="#/start">Start learning <kbd class="kbd-cta">↵</kbd></a>
          </div>
          <div class="micro ld2-micro"><div class="ld2-micro-list">${microClauses(`Chapter 1 is free · no account to start · nothing to install · progress ${store.saveLine()}`).map(c => `<span>${esc(c)}</span>`).join('')}</div></div>
        </div>
        <div class="ld2-hero-demo">
          <div id="ldDemo"></div>
          <div class="ld2-demo-note" id="ldDemoNote" aria-live="polite">${DEMO_NOTES.idle}</div>
        </div>
      </div>
    </section>

    <section class="l-sec ld2-modes" id="lModes">
      <div class="l-label">six ways to practice</div>
      <h2>One real sheet. Six ways to use it.</h2>
      <p class="l-sub">Lessons teach. Everything else is repetition — the part a video cannot give you.</p>
      <div class="ld2-bento">
        ${MODES.map(m => `<article class="ld2-mode ld2-mode-${m.key}${m.size ? ' ' + m.size : ''}">
          <div class="ld2-clip">
            <div class="ld2-clip-fb" aria-hidden="true"><span class="ld2-clip-glyph">${MODE_GLYPHS[m.key] || ''}</span><span class="ld2-clip-name">${esc(m.title)}</span></div>
            <video muted loop playsinline preload="none" poster="./clips/${m.key}.jpg" aria-hidden="true"><source src="./clips/${m.key}.webm" type="video/webm"></video>
            <button type="button" class="ld2-clip-play" hidden aria-label="Play the ${esc(m.title)} clip">▶</button>
          </div>
          <div class="ld2-mode-text"><div class="ld2-mode-where">${esc(m.where)}</div><h3><a class="ld2-mode-link" href="${m.href}">${esc(m.title)}</a></h3><p>${esc(m.line)}</p></div>
        </article>`).join('')}
      </div>
    </section>

    <section class="l-sec" id="lHow">
      <div class="l-label">how a lesson works</div>
      <h2>Read one line. Do the job. Prove it against the clock.</h2>
      <div class="l-beats l-beats-4">
        ${HOW.map(b => `<div class="l-beat"><div class="l-n">${b.n}</div><h3>${esc(b.h)}</h3><p>${esc(b.p)}</p></div>`).join('')}
      </div>
    </section>

    <section class="l-sec ld2-volt" id="lVolt">
      <div class="ld2-volt-grid">
        <div>
          <div class="l-label">project volt</div>
          <h2>One deal, six chapters, one pack.</h2>
          <p class="l-sub">You are the analyst on the sale of Voltline Charging, a 40-site EV fast-charging network. Management sends data; you turn it into the pages a buyer will read. Each chapter is one stage of the sale, and every lesson is one job on that file.</p>
        </div>
        <ol class="ld2-stages">
          ${STAGES.map(s => `<li class="${s.access === 'free' ? 'free' : ''}"><span class="ld2-stage-n">${s.n}</span><span class="ld2-stage-body"><b>${esc(s.stage)}</b><span>${esc(s.delivers)}</span></span><span class="l-tag ${s.access === 'free' ? 'l-free' : ''}">${s.access}</span></li>`).join('')}
        </ol>
      </div>
    </section>

    <section class="l-sec" id="lPricing">
      <div class="l-label">free vs paid</div>
      <h2>Chapter 1 is free in full. The rest is $9 a month.</h2>
      <div class="l-tiers">
        <div class="l-tier">
          <div class="l-tier-cap">free</div>
          <div class="l-tier-body">
            <div class="l-price"><b>Free</b><span>no account, no card</span></div>
            <ul>
              <li><b>All of Chapter 1</b>: set-up, moving and selecting, entering and editing, structure, formatting, formulas, presenting</li>
              <li>Its seven challenges, their drills and boards</li>
              <li>The Daily, free for everyone</li>
              <li>One sample lesson from each paid chapter</li>
            </ul>
            <a class="l-btn" href="#/start">Start learning →</a>
          </div>
        </div>
        <div class="l-tier l-tier-pro">
          <div class="l-tier-cap">paid</div>
          <div class="l-tier-body">
            <div class="l-price"><b>$9</b><span>per month · or $90 a year</span></div>
            <p class="l-alt">Students <b>$7</b>/mo or <b>$70</b>/yr with a school email. No trial: the free chapter is the trial. 14-day money-back guarantee on your first payment.</p>
            <ul>
              <li><b>Chapters 2 to 6</b>: formatting, formulas, data, financial modeling, valuation</li>
              <li>Full model builds and the pack, page by page</li>
              <li>Timed and competitive play on that content</li>
              <li>Certificates: Completed and Verified</li>
            </ul>
            <a class="l-btn" href="#/pricing">See pricing →</a>
          </div>
        </div>
      </div>
    </section>

    <section class="l-sec" id="lTeams">
      <div class="l-teams">
        <div><h2>Learning with a team or a class?</h2><p class="l-sub">Start a desk for a private board and assignments, or ask about group access for a bank, a training provider or a school.</p></div>
        <a class="l-btn" href="#/teams">Teams and schools →</a>
      </div>
    </section>

    <section class="l-sec l-close">
      <h2>Your first lesson takes three minutes.</h2>
      <p class="l-sub">one sheet · one job · your keyboard</p>
      <a class="start-btn" href="#/start">Start learning <kbd class="kbd-cta">↵</kbd></a>
      <p class="ld2-return">Learning here already? <a class="ld2-signin" id="ldSignIn" href="#/account">Sign in</a> to pick up where you left off.</p>
    </section>
  </div>`;
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
  // a still of the lesson paints at once; the live demo loads behind it and takes its place (a failed load keeps the still)
  const host = el.querySelector('#ldDemo');
  let demo = mountDemoPoster(host, { compact: true, note: false });
  const inDemo = () => !!(demo && demo.el && !demo.poster && demo.el.contains(document.activeElement));
  let noteKey = '';
  const syncNote = () => {   // rewritten only when the state changes, so a focused link in the note is never replaced under the focus
    const k = failed ? 'failed' : tookOver ? 'taken' : inDemo() ? 'focus' : reduced && !(demo && demo.started) ? 'still' : 'idle';
    if (note && k !== noteKey) { noteKey = k; note.innerHTML = DEMO_NOTES[k]; }
  };
  const cancelDemo = loadLiveDemo(host, {
    compact: true, loop: !reduced, autoplay: !reduced, focusable: true,
    onDone: () => { if (!tookOver) track('landing_demo', { where: 'landing', outcome: 'finished' }); },
    onPlay: () => syncNote(),
    onTakeover: () => { tookOver = true; track('landing_demo', { where: 'landing', outcome: 'takeover' }); syncNote(); },
    onFail: () => { failed = true; syncNote(); },
  }, d => { demo = d; syncNote(); }, demo);
  syncNote();

  const isTyping = t => !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.tagName === 'BUTTON' || t.tagName === 'A' || t.isContentEditable);
  const onKey = e => {
    if (e.defaultPrevented) return;
    const focused = inDemo();
    if (focused && e.target && e.target.closest && e.target.closest('.dp-play')) return;   // the play button's own Enter / Space
    if (!focused && isTyping(e.target)) return;
    const to = landingKeyRoute(e, focused);
    if (to === 'start') { e.preventDefault(); location.hash = '#/start'; }
    else if (to === 'demo') {
      const handled = demo.takeover(e);
      // while the sheet has focus its keys never scroll the page, handled or not
      if (handled || /^(Arrow|Page)|^(Home|End|Backspace| )$/.test(e.key)) e.preventDefault();
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
  const unclips = wireClips(el, reduced);
  return { destroy() {
    cancelDemo(); unclips();
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

/**
 * The modes' clips: each plays only while it is on screen and pauses when it leaves (preload none,
 * so nothing downloads before). With reduced motion nothing plays by itself: the poster shows, with
 * a play control. A clip whose file fails keeps its poster; when the poster fails too, the video
 * is hidden and the card's own drawing shows. Returns the teardown.
 */
function wireClips(root, reduced) {
  const clips = [...root.querySelectorAll('.ld2-clip')];
  const play = v => { try { const p = v.play(); if (p && p.catch) p.catch(() => { /* autoplay refused or the file failed: the poster stays */ }); } catch (e) { /* no media support */ } };
  for (const clip of clips) {
    const v = clip.querySelector('video'), src = v && v.querySelector('source'), btn = clip.querySelector('.ld2-clip-play');
    if (!v) continue;
    const broken = () => {
      if (clip.dataset.broken) return;
      clip.dataset.broken = '1'; if (btn) btn.hidden = true;
      const probe = new Image();
      probe.onerror = () => { v.hidden = true; };
      probe.src = v.getAttribute('poster') || '';
    };
    if (src) src.addEventListener('error', broken);
    v.addEventListener('error', broken);
    if (reduced && btn) {
      const label = btn.getAttribute('aria-label') || '';
      btn.hidden = false;
      btn.onclick = () => { if (v.paused) play(v); else v.pause(); };
      v.addEventListener('play', () => { btn.textContent = '❚❚'; btn.setAttribute('aria-label', label.replace(/^Play/, 'Pause')); });
      v.addEventListener('pause', () => { btn.textContent = '▶'; btn.setAttribute('aria-label', label); });
    }
  }
  const io = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
    for (const en of entries) {
      const v = en.target.querySelector('video');
      if (!v || en.target.dataset.broken) continue;
      if (en.isIntersecting) { if (!reduced) play(v); }
      else if (!v.paused) v.pause();
    }
  }, { threshold: 0.35 }) : null;
  if (io) clips.forEach(c => io.observe(c));
  else if (!reduced) clips.forEach(c => { const v = c.querySelector('video'); if (v) play(v); });
  return () => { if (io) io.disconnect(); for (const c of clips) { const v = c.querySelector('video'); if (v && !v.paused) v.pause(); } };
}
