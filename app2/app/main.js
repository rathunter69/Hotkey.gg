// app2/app/main.js — the shell: one nav, one footer, a hash router over the site's pages.
//
//   #/                 Landing for a first-time visitor; Home once any progress or prefs exist
//   #/landing          the landing page, always
//   #/start            first run (platform, experience, placement)
//   #/learn            the catalog
//   #/lesson/<id>      a lesson (split pane); ?mode=solo|timed
//   #/practice         timed drills, the Daily, rapid-fire (honest stubs) and the sandbox
//   #/drill/sandbox    the drill workspace hosting the free sheet
//   #/leaderboard  #/reference  #/pricing  #/teams  #/account
//   #/about  #/terms  #/privacy  #/eula  #/contact
//   anything else      404
//
// Page modules load lazily with import(); a failed load renders an error card with Retry, never
// an empty page. Below ~900px the lesson and drill routes show a readable notice instead of the
// workspace (site.css hides the workspace too, so a resize mid-lesson degrades the same way).
import { mountNav } from '../ui/nav.js';
import { mountFooter } from '../ui/footer.js';
import { prefs } from './prefs.js';
import { progress } from './progress.js';
import { lessonById } from '../content/index.js';

const NAV_LINKS = [
  { key: 'learn', label: 'Learn', href: '#/learn' },
  { key: 'practice', label: 'Practice', href: '#/practice' },
  { key: 'leaderboard', label: 'Leaderboard', href: '#/leaderboard' },
  { key: 'reference', label: 'Reference', href: '#/reference' },
];

const NARROW_QUERY = '(max-width: 900px)';

/**
 * Parse a location hash into { name, params, query }. Pure; exported for the tests.
 *   parseRoute('#/lesson/foundations-01-active-cell?mode=solo')
 *     → { name:'lesson', params:{ id:'foundations-01-active-cell' }, query:{ mode:'solo' } }
 * Unknown paths give name 'notfound'. '#/sandbox' (the old shell's route) maps to the drill.
 */
export function parseRoute(hash) {
  const raw = String(hash == null ? '' : hash);
  const h = raw.startsWith('#') ? raw.slice(1) : raw;
  const [pathPart, queryPart] = h.split('?');
  const path = (pathPart || '/').replace(/\/+$/, '') || '/';
  const query = {};
  if (queryPart) for (const [k, v] of new URLSearchParams(queryPart)) query[k] = v;
  const params = {};
  let name;
  let m;
  if (path === '/') name = 'root';
  else if (path === '/landing') name = 'landing';
  else if (path === '/start') name = 'start';
  else if (path === '/learn') name = 'learn';
  else if ((m = /^\/lesson\/([a-z0-9-]+)$/.exec(path))) { name = 'lesson'; params.id = m[1]; }
  else if (path === '/practice') name = 'practice';
  else if ((m = /^\/drill\/([a-z0-9-]+)$/.exec(path))) { name = 'drill'; params.id = m[1]; }
  else if (path === '/sandbox') { name = 'drill'; params.id = 'sandbox'; }
  else if (['/leaderboard', '/reference', '/pricing', '/teams', '/account', '/about', '/terms', '/privacy', '/eula', '/contact'].includes(path)) name = path.slice(1);
  else name = 'notfound';
  return { name, params, query, path };
}

/** Which nav link a route lights up. */
export function navKeyFor(name) {
  if (['root', 'landing', 'start', 'learn', 'lesson'].includes(name)) return 'learn';
  if (name === 'practice' || name === 'drill') return 'practice';
  if (name === 'leaderboard' || name === 'reference') return name;
  return '';
}

/** The document title for a route. */
export function titleFor(name, extra) {
  const T = { root: 'hotkey.gg — Learn Excel by doing', landing: 'hotkey.gg — Learn Excel by doing', home: 'Home · hotkey.gg', start: 'Get started · hotkey.gg', learn: 'Learn · hotkey.gg',
    lesson: (extra ? extra + ' · ' : '') + 'hotkey.gg', practice: 'Practice · hotkey.gg', drill: (extra ? extra + ' · ' : '') + 'Practice · hotkey.gg', leaderboard: 'Leaderboard · hotkey.gg',
    reference: 'Reference · hotkey.gg', pricing: 'Pricing · hotkey.gg', teams: 'Teams · hotkey.gg', account: 'Account · hotkey.gg', about: 'About · hotkey.gg',
    terms: 'Terms · hotkey.gg', privacy: 'Privacy · hotkey.gg', eula: 'EULA · hotkey.gg', contact: 'Contact · hotkey.gg', notfound: 'Page not found · hotkey.gg' };
  return T[name] || 'hotkey.gg';
}

/** A first-time visitor has neither saved prefs nor any lesson progress. */
export function isReturning() {
  try { return prefs.stored() || Object.keys(progress.all()).length > 0; } catch (e) { return false; }
}

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/**
 * The lazily imported page modules, by route name: the file (relative to this module) and the
 * mount(root, ctx) function to pick from it. A failed dynamic import is cached by the browser's
 * module map, so a Retry re-imports the file under a fresh `?retry=N` query (see loadPage).
 */
const LOADERS = {
  landing: { file: './landing-page.js', pick: m => m.mountLandingPage },
  home: { file: './home-page.js', pick: m => m.mountHomePage },
  start: { file: './first-run.js', pick: m => m.mountFirstRun },
  learn: { file: './learn-page.js', pick: m => m.mountLearnPage },
  lesson: { file: './lesson-view.js', pick: m => m.mountLessonView },
  practice: { file: './practice-page.js', pick: m => m.mountPracticePage },
  drill: { file: './drill-page.js', pick: m => m.mountDrillPage },
  leaderboard: { file: './leaderboard-page.js', pick: m => m.mountLeaderboardPage },
  reference: { file: './reference-page.js', pick: m => m.mountReferencePage },
  pricing: { file: './pricing-page.js', pick: m => m.mountPricingPage },
  teams: { file: './teams-page.js', pick: m => m.mountTeamsPage },
  account: { file: './account-page.js', pick: m => m.mountAccountPage },
  about: { file: './legal-pages.js', pick: m => m.mountAboutPage },
  terms: { file: './legal-pages.js', pick: m => r => m.mountLegalPage(r, 'terms') },
  privacy: { file: './legal-pages.js', pick: m => r => m.mountLegalPage(r, 'privacy') },
  eula: { file: './legal-pages.js', pick: m => r => m.mountLegalPage(r, 'eula') },
  contact: { file: './legal-pages.js', pick: m => r => m.mountLegalPage(r, 'contact') },
  notfound: { file: './legal-pages.js', pick: m => m.mountNotFound },
};
const retries = {};   // file → how many times a load has failed; the next attempt busts the module map
async function loadPage(entry) {
  const n = retries[entry.file] || 0;
  try {
    const m = await import(entry.file + (n ? '?retry=' + n : ''));
    const mount = entry.pick(m);
    if (typeof mount !== 'function') throw new Error('page module has no mount function: ' + entry.file);
    return mount;
  } catch (e) { retries[entry.file] = n + 1; throw e; }
}

function errorCard(root, what, retry) {
  root.innerHTML = `<div class="err-card" role="alert"><div class="err-cap">hotkey.gg · could not load</div>
    <div class="err-body"><h1>This page did not load.</h1><p>${esc(what)} could not be fetched. Check your connection and try again.</p>
    <div class="err-actions"><button class="btn btn-primary" id="errRetry" type="button">Retry</button><a class="btn btn-ghost" href="#/">Home</a></div></div></div>`;
  const b = root.querySelector('#errRetry'); b.onclick = retry; b.focus();
}

function narrowNotice(root, lesson) {
  const el = document.createElement('div'); el.className = 'narrow-page';
  const teach = lesson && (lesson.steps || []).find(s => s.mode === 'teach');
  el.innerHTML = `<div class="narrow-msg" role="status"><div class="narrow-cap">hotkey.gg</div>
      <h1>hotkey.gg needs a keyboard and a wider screen.</h1>
      <p>Lessons and drills run on a real spreadsheet with the keyboard. Open this page on a laptop or desktop, at least 900px wide.</p>
      <div class="narrow-actions"><a class="btn btn-ghost" href="#/learn">Back to the catalog</a></div></div>` +
    (lesson ? `<article class="narrow-lesson"><div class="lesson-crumb">Lesson ${esc(lesson.id)}</div><h2>${esc(lesson.title)}</h2>` +
      (teach ? `<h3>${esc(teach.title)}</h3>` + teach.body.map(p => `<p>${esc(p).replace(/`([^`]+)`/g, '<kbd>$1</kbd>')}</p>`).join('') : '') +
      `<p class="lesson-goalsintro">You will:</p><ol class="goals goals-preview">${(lesson.goals || []).map(g => `<li>${esc(g.text)}</li>`).join('')}</ol></article>` : '');
  root.appendChild(el);
  return { destroy() { el.remove(); } };
}

export function startApp({ navEl, rootEl, footEl }) {
  let current = null;      // { destroy() }
  let gen = 0;             // bumps on every route: a slow import for an old route never mounts
  prefs.reflect();
  const nav = mountNav(navEl, { links: NAV_LINKS, active: 'learn', account: true });
  const footer = footEl ? mountFooter(footEl) : null;
  const narrowMq = typeof matchMedia === 'function' ? matchMedia(NARROW_QUERY) : null;

  function unmount() {
    if (current && current.destroy) { try { current.destroy(); } catch (e) { /* a page that failed half-way must not block the next */ } }
    current = null;
    rootEl.innerHTML = '';
    document.body.classList.remove('hide-gridlines');
    document.body.dataset.route = '';
  }

  async function route() {
    const r = parseRoute(location.hash || '#/');
    const myGen = ++gen;
    unmount();
    let name = r.name;
    if (name === 'root') name = isReturning() ? 'home' : 'landing';
    let lesson = null;
    if (name === 'lesson') { lesson = lessonById(r.params.id); if (!lesson) name = 'notfound'; }
    if (name === 'drill' && r.params.id !== 'sandbox') name = 'notfound';
    nav.setActive(navKeyFor(name === 'home' ? 'root' : name));
    document.title = titleFor(name, lesson ? lesson.title : name === 'drill' ? 'Sandbox' : '');
    document.body.dataset.route = name;
    window.scrollTo(0, 0);

    // the workspace routes need a keyboard and width; below the breakpoint show the notice instead
    if ((name === 'lesson' || name === 'drill') && narrowMq && narrowMq.matches) { current = narrowNotice(rootEl, lesson); return; }

    const entry = LOADERS[name] || LOADERS.notfound;
    let mount;
    try { mount = await loadPage(entry); }
    catch (e) {
      if (myGen !== gen) return;
      errorCard(rootEl, 'The ' + name + ' page', route);
      return;
    }
    if (myGen !== gen) return;
    try {
      const ctx = { query: r.query, params: r.params, nav };
      const res = name === 'lesson' ? mount(rootEl, lesson, { mode: r.query.mode || 'guided' }) : mount(rootEl, ctx);
      current = res && typeof res.destroy === 'function' ? res : { destroy() { rootEl.innerHTML = ''; } };
    } catch (e) {
      console.error(e);
      errorCard(rootEl, 'The ' + name + ' page', route);
    }
  }

  window.addEventListener('hashchange', route);
  if (narrowMq && narrowMq.addEventListener) narrowMq.addEventListener('change', () => { const n = parseRoute(location.hash || '#/').name; if (n === 'lesson' || n === 'drill') route(); });
  route();
  return { route, nav, footer };
}
