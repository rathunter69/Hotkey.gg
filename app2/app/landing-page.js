// app2/app/landing-page.js — the landing page (SITE_SPEC §3), in the old landing's look
// (index.html 2468–2720 / its CSS at 1975–2300, rebuilt as page sections in site.css):
// hero + the live drill preview card, how it works, what you'll learn, free vs paid, teams, close.
// Primary button "Start learning" → #/start. No signup wall.
import { CHAPTER_PLAN } from './learn-page.js';
import { CHAPTERS } from '../content/index.js';

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const HEADLINE = 'Learn Excel by doing.';
export const HEADLINE_ALT = 'The better way to learn Excel';
export const LEDE = 'Whether you are a beginner or a finance professional, learn Excel and practise it through guided lessons and real-world drills. Not by watching a video. Not in a classroom.';

const HOW = [
  { n: '01', h: 'Read', p: 'One idea per lesson, in plain Excel terms. Three to five minutes.' },
  { n: '02', h: 'Do it guided', p: 'The keys for each goal are shown. You press them on a real sheet.' },
  { n: '03', h: 'Do it solo', p: 'Same goals, no hints. The sheet is graded on the end result, not the route.' },
  { n: '04', h: 'Race the clock', p: 'Pass, pro and legendary par times. Personal bests and boards, when you are ready.' },
];

/** The hero still: the Weekly Sales Report from Chapter 1, mid-lesson, hand-built and theme-tokened like the old landing's card. */
function previewCard() {
  const rows = [
    ['1', ['Weekly Sales Report', 'l-lbl l-title l-cur'], ['', 'l-num'], ['', 'l-num']],
    ['2', ['Day', 'l-lbl l-hdr'], ['Sales', 'l-num l-hdr'], ['Units', 'l-num l-hdr']],
    ['3', ['Monday', 'l-lbl'], ['1,200', 'l-num l-in'], ['40', 'l-num l-in']],
    ['4', ['Tuesday', 'l-lbl'], ['950', 'l-num l-in'], ['31', 'l-num l-in']],
    ['5', ['Wednesday', 'l-lbl'], ['1,430', 'l-num l-in'], ['47', 'l-num l-in']],
    ['6', ['Thursday', 'l-lbl'], ['1,100', 'l-num l-in'], ['36', 'l-num l-in']],
    ['7', ['Friday', 'l-lbl'], ['1,675', 'l-num l-in'], ['55', 'l-num l-in']],
    ['8', ['Total', 'l-lbl l-tot'], ['6,355', 'l-num l-tot'], ['209', 'l-num l-tot']],
  ];
  return `<div class="l-demo" aria-hidden="true">
    <div class="l-demo-cap"><span class="l-dot"></span><span class="l-dot"></span><span class="l-dot"></span><span>foundations · the ribbon</span><span class="l-clock">goal 2 of 3</span></div>
    <div class="l-demo-task">Make <b>Weekly Sales Report</b> bold, then rule off the total.</div>
    <div class="l-sheet"><table><tbody>
      <tr><th></th><th>A</th><th>B</th><th>C</th></tr>
      ${rows.map(([n, ...cells]) => `<tr><td class="l-rh">${n}</td>${cells.map(([t, c]) => `<td class="${c}">${esc(t)}</td>`).join('')}</tr>`).join('')}
    </tbody></table></div>
    <div class="l-demo-keys"><span class="l-cap">ctrl</span><span class="l-cap lit">B</span><span class="l-tail">✓ 1 of 3 · 14 keys</span></div>
  </div>`;
}

export function landingHtml() {
  const lessonCount = (CHAPTERS.find(c => c.id === 'foundations') || { lessons: [] }).lessons.length;
  return `<div class="ld">
    <section class="l-hero">
      <div class="l-glow"></div>
      <div class="l-hero-grid">
        <div>
          <div class="eyebrow">learn excel by doing · keyboard first</div>
          <h1 data-alt="${esc(HEADLINE_ALT)}">${esc(HEADLINE)}</h1>
          <p class="lede">${esc(LEDE)}</p>
          <div class="landing-cta">
            <a class="start-btn" id="startLearning" href="#/start">Start learning <kbd class="kbd-cta">↵</kbd></a>
            <a class="l-quiet" href="#/learn">Browse the catalog</a>
          </div>
          <div class="micro">No account to start · nothing to install · your progress is saved on this device</div>
        </div>
        ${previewCard()}
      </div>
    </section>

    <section class="l-sec" id="lHow">
      <div class="l-label">how it works</div>
      <h2>You do not learn Excel by watching.</h2>
      <div class="l-beats l-beats-4">
        ${HOW.map(b => `<div class="l-beat"><div class="l-n">${b.n}</div><h3>${esc(b.h)}</h3><p>${esc(b.p)}</p></div>`).join('')}
      </div>
    </section>

    <section class="l-sec" id="lCatalog">
      <div class="l-label">what you'll learn</div>
      <h2>Six chapters, from the first cell to a full model.</h2>
      <div class="l-rail">
        ${CHAPTER_PLAN.map(ch => `<a class="l-chap" href="#/learn">
          <div class="l-cn">CHAPTER ${ch.n}</div>
          <div class="l-cname">${esc(ch.title)}</div>
          <div class="l-cskill">${esc(ch.line)}</div>
          <div class="l-cmeta">${ch.access === 'free' ? `<span class="l-ccount">${lessonCount}</span><span class="l-cunit">lessons</span><span class="l-tag l-free">free</span>` : `<span class="l-tag">paid</span><span class="l-cunit">coming</span>`}</div>
        </a>`).join('')}
      </div>
      <div class="l-note">Chapter 1 is free in full. Every paid chapter has one free sample lesson. Each chapter ends with a project and an assessment.</div>
    </section>

    <section class="l-sec" id="lPricing">
      <div class="l-label">free vs paid</div>
      <h2>Free to learn the basics. Paid for the rest.</h2>
      <div class="l-tiers">
        <div class="l-tier">
          <div class="l-tier-cap">free</div>
          <div class="l-tier-body">
            <div class="l-price"><b>Free</b><span>no account, no card</span></div>
            <ul>
              <li><b>All of Chapter 1</b>: navigation, editing, formatting, basic formulas, the Ribbon</li>
              <li>Repeats and personal bests on that content</li>
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
              <li>Full model builds and end-of-chapter projects</li>
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
      <p class="l-sub">one sheet · one idea · your keyboard</p>
      <a class="start-btn" href="#/start">Start learning <kbd class="kbd-cta">↵</kbd></a>
    </section>
  </div>`;
}

export function mountLandingPage(root) {
  const el = document.createElement('div');
  el.innerHTML = landingHtml();
  root.appendChild(el);
  const isTyping = t => !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.tagName === 'BUTTON' || t.tagName === 'A' || t.isContentEditable);
  // Enter anywhere on the page starts, like the old landing's "Press ↵ to start"
  const onKey = e => { if (e.key === 'Enter' && !isTyping(e.target) && !e.defaultPrevented) { e.preventDefault(); location.hash = '#/start'; } };
  document.addEventListener('keydown', onKey);
  return { destroy() { document.removeEventListener('keydown', onKey); el.remove(); } };
}
