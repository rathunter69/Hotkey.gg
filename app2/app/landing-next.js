// app2/app/landing-next.js — the landing, redesigned (experience pass, decision 2): "Excel isn't
// learned. It's practiced." (Wolf's pick) with two alternates behind ?h=2 / ?h=3, the subhead a non-banker self-selects into (decision 13), a live
// self-playing lesson the visitor can take over by typing, the six modes shown as short muted
// looping clips of the real product composed as a page (posters until the clips are recorded),
// a prominent Sign in for returning learners, then how it works, Project Volt, free vs paid,
// teams and the close. Enter anywhere starts.
import { mountDemo } from '../ui/demo-player.js';
import { store } from './store.js';
import { track } from './telemetry.js';
import { STAGES } from './deal-strip.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** The headline and its two alternates (?h=2 and ?h=3 still show them). */
export const HEADLINES = [
  { a: 'Excel isn’t learned.', b: 'It’s practiced.' },                          // shipped (Wolf, 2026-09-23 B)
  { a: 'You don’t learn Excel by watching.', b: 'You learn it by doing it again.' },
  { a: 'Nobody learned Excel from a video.', b: '' },
];
export const SUBHEAD = 'Learn Excel the way analysts are taught — on a real sheet, one job at a time.';

/** The six modes, in the order a learner meets them. Each clip is a muted loop of the real product; `poster` shows until it loads. */
export const MODES = [
  { key: 'lesson', size: 'wide', title: 'Lessons', line: 'One job at a time on a live sheet. The keys are shown the first time; the sheet is graded on where it ends up, so any correct route counts.', where: 'Learn' },
  { key: 'challenge', size: '', title: 'Challenges', line: 'Every module ends in a seeded, timed run on a fresh file. Pass completes the module; pro and legendary are what you come back for.', where: 'Learn' },
  { key: 'drill', size: '', title: 'Drills', line: 'The same generators stripped of the story. Pars, personal bests, and a ghost of your own best run to race.', where: 'Practice' },
  { key: 'daily', size: '', title: 'The Daily', line: 'Ninety seconds, the same sheet for everyone, once a day. A result card built to be shared.', where: 'Practice' },
  { key: 'rapid', size: '', title: 'Rapid-fire', line: 'One shortcut at a time against the clock, drawn from the ones you remember least. Recall is the game.', where: 'Practice' },
  { key: 'boards', size: 'wide', title: 'Boards', line: 'A board for every challenge and for the Daily. Clean runs only: no help, no mouse. Rank turns on when the field fills.', where: 'Leaderboard' },
];

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
            <a class="l-quiet ld2-signin" id="ldSignIn" href="#/account">Sign in</a>
          </div>
          <div class="micro">Chapter 1 is free · no account to start · nothing to install · progress ${store.saveState() === 'device' ? 'saved on this device' : 'saved to your account'}</div>
        </div>
        <div class="ld2-hero-demo">
          <div id="ldDemo"></div>
          <div class="ld2-demo-note" id="ldDemoNote">A real lesson, playing itself. <b>Type on it</b> and the sheet is yours.</div>
        </div>
      </div>
    </section>

    <section class="l-sec ld2-modes" id="lModes">
      <div class="l-label">six ways to practice</div>
      <h2>One real sheet. Six ways to use it.</h2>
      <p class="l-sub">Lessons teach. Everything else is repetition — the part a video cannot give you.</p>
      <div class="ld2-bento">
        ${MODES.map(m => `<a class="ld2-mode ld2-mode-${m.key}${m.size ? ' ' + m.size : ''}" href="#/start" aria-label="${esc(m.title)}">
          <div class="ld2-clip"><video muted loop autoplay playsinline preload="none" poster="./clips/${m.key}.jpg" aria-hidden="true"><source src="./clips/${m.key}.webm" type="video/webm"></video></div>
          <div class="ld2-mode-text"><div class="ld2-mode-where">${esc(m.where)}</div><h3>${esc(m.title)}</h3><p>${esc(m.line)}</p></div>
        </a>`).join('')}
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
  let tookOver = false;
  const demo = mountDemo(el.querySelector('#ldDemo'), {
    compact: true, loop: true,
    onDone: () => { if (!tookOver) track('landing_demo', { where: 'landing', outcome: 'finished' }); },
    onTakeover: () => { tookOver = true; track('landing_demo', { where: 'landing', outcome: 'takeover' }); const n = el.querySelector('#ldDemoNote'); if (n) n.innerHTML = '<b>Yours.</b> Same four goals, any route. <a href="#/start">Start learning</a> when you want the real thing.'; },
  });
  const isTyping = t => !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.tagName === 'BUTTON' || t.tagName === 'A' || t.isContentEditable);
  /** A key the sheet would understand: arrows, letters, Ctrl/Alt chords, Enter once the sheet is the visitor's. */
  const sheetKey = e => e.altKey || e.ctrlKey || e.metaKey || /^Arrow|^F\d$|^(Home|End|PageUp|PageDown|Delete|Backspace|Tab|Escape|Enter)$/.test(e.key) || e.key.length === 1;
  const onKey = e => {
    if (isTyping(e.target) || e.defaultPrevented) return;
    if (e.key === 'Enter' && !demo.taken) { e.preventDefault(); location.hash = '#/start'; return; }
    if (!sheetKey(e)) return;
    if (demo.takeover(e)) e.preventDefault();
  };
  const onKeyUp = e => { if (e.key === 'Alt' && demo.taken) e.preventDefault(); };
  document.addEventListener('keydown', onKey);
  document.addEventListener('keyup', onKeyUp);
  return { destroy() { document.removeEventListener('keydown', onKey); document.removeEventListener('keyup', onKeyUp); demo.destroy(); el.remove(); } };
}
