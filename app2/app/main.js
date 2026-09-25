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
//   #/due/<shortcut>   a due-today micro-drill (app/schedule.js), behind ?flow=next
//   #/storyboard/<id>  unlisted: the experience-pass storyboard screens (app/storyboard.js)
//   anything else      404
// `?flow=next` on any route turns the redesigned landing / first run / Home / Learn on for this
// browser (app/flow.js); the LOADERS `next` entries are what it swaps in.
//
// Page modules load lazily with import(); a failed load renders an error card with Retry, never
// an empty page. Below ~900px the lesson and drill routes show a readable notice instead of the
// workspace (site.css hides the workspace too, so a resize mid-lesson degrades the same way).
import { mountNav } from '../ui/nav.js';
import { mountFooter } from '../ui/footer.js';
import { prefs } from './prefs.js';
import { applyFlowQuery, reflectFlow } from './flow.js';
import { store } from './store.js';
import { auth } from './auth.js';
import { track, installErrorLog } from './telemetry.js';
import { captureInstall } from './install.js';
import { lessonById } from '../content/index.js';
import { gameCtx } from './stats.js';
import { earnedSet } from '../ui/badges.js';
import { themeStates } from './cosmetics.js';

const NAV_LINKS = [
  { key: 'learn', label: 'Learn', href: '#/learn' },
  { key: 'practice', label: 'Practice', href: '#/practice' },
  { key: 'leaderboard', label: 'Leaderboard', href: '#/leaderboard' },
  { key: 'reference', label: 'Reference', href: '#/reference' },
];

const NARROW_QUERY = '(max-width: 900px)';

/**
 * Parse a location hash into { name, params, query }. Pure; exported for the tests.
 *   parseRoute('#/lesson/active-cell?mode=solo')
 *     → { name:'lesson', params:{ id:'active-cell' }, query:{ mode:'solo' } }
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
  else if (path === '/daily') { name = 'drill'; params.daily = true; }
  else if (path === '/rapid') name = 'rapid';
  else if ((m = /^\/due\/([a-z0-9-]+)$/.exec(path))) { name = 'due'; params.id = m[1]; }
  else if ((m = /^\/storyboard(?:\/([a-z0-9-]+))?$/.exec(path))) { name = 'storyboard'; params.id = m[1] || 'index'; }
  else if (['/leaderboard', '/reference', '/pricing', '/teams', '/account', '/about', '/terms', '/privacy', '/eula', '/contact'].includes(path)) name = path.slice(1);
  else name = 'notfound';
  return { name, params, query, path };
}

/** Which nav link a route lights up. */
export function navKeyFor(name) {
  if (['root', 'landing', 'start', 'learn', 'lesson'].includes(name)) return 'learn';
  if (name === 'practice' || name === 'drill' || name === 'rapid' || name === 'due') return 'practice';
  if (name === 'leaderboard' || name === 'reference') return name;
  return '';
}

/** The document title for a route. */
export function titleFor(name, extra) {
  const T = { root: 'hotkey.gg — Learn Excel by doing', landing: 'hotkey.gg — Learn Excel by doing', home: 'Home · hotkey.gg', start: 'Get started · hotkey.gg', learn: 'Learn · hotkey.gg',
    lesson: (extra ? extra + ' · ' : '') + 'hotkey.gg', practice: 'Practice · hotkey.gg', drill: (extra ? extra + ' · ' : '') + 'Practice · hotkey.gg', leaderboard: 'Leaderboard · hotkey.gg',
    reference: 'Reference · hotkey.gg', pricing: 'Pricing · hotkey.gg', teams: 'Teams · hotkey.gg', account: 'Account · hotkey.gg', about: 'About · hotkey.gg',
    terms: 'Terms · hotkey.gg', privacy: 'Privacy · hotkey.gg', eula: 'EULA · hotkey.gg', contact: 'Contact · hotkey.gg', notfound: 'Page not found · hotkey.gg',
    due: 'Due today · hotkey.gg', storyboard: 'Storyboard · hotkey.gg' };
  return T[name] || 'hotkey.gg';
}

/**
 * The old build's 75 SEO pages linked `index.html?drill=<key>`. `_redirects` cannot match query
 * strings, so the shell resolves them at boot. Pure: takes `location.search`, returns the URL to
 * replaceState to, or null when the search string is not a legacy CTA.
 */
export function legacyQuery(search) {
  const s = String(search == null ? '' : search);
  if (!s) return null;
  const q = new URLSearchParams(s.startsWith('?') ? s.slice(1) : s);
  return q.has('drill') ? '/#/practice' : null;
}

/** A first-time visitor has neither saved prefs, nor lesson progress, nor a signed-in session. */
export function isReturning() {
  try { return prefs.stored() || !!auth.user() || Object.keys(store.all()).length > 0; } catch (e) { return false; }
}

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/**
 * The lazily imported page modules, by route name: the file (relative to this module) and the
 * mount(root, ctx) function to pick from it. A failed dynamic import is cached by the browser's
 * module map, so a Retry re-imports the file under a fresh `?retry=N` query (see loadPage).
 */
const LOADERS = {
  // `next`: the experience-pass screens behind the ?flow=next flag (app/flow.js); on go they replace the live ones
  landing: { file: './landing-page.js', pick: m => m.mountLandingPage, next: { file: './landing-next.js', pick: m => m.mountLandingPage } },
  home: { file: './home-page.js', pick: m => m.mountHomePage, next: { file: './home-next.js', pick: m => m.mountHomePage } },
  start: { file: './first-run.js', pick: m => m.mountFirstRun, next: { file: './first-run-next.js', pick: m => m.mountFirstRun } },
  learn: { file: './learn-page.js', pick: m => m.mountLearnPage, next: { file: './learn-next.js', pick: m => m.mountLearnPage } },
  due: { file: './home-next.js', pick: m => m.mountDuePage },
  storyboard: { file: './storyboard.js', pick: m => m.mountStoryboard },
  lesson: { file: './lesson-view.js', pick: m => m.mountLessonView },
  practice: { file: './practice-page.js', pick: m => m.mountPracticePage },
  drill: { file: './drill-page.js', pick: m => m.mountDrillPage },
  rapid: { file: './rapid-fire.js', pick: m => m.mountRapidPage },
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
  const legacy = legacyQuery(location.search);
  if (legacy) { try { history.replaceState(null, '', legacy); } catch (e) { /* file:// etc.: route as-is */ } }
  prefs.reflect();
  reflectFlow();
  const nav = mountNav(navEl, {
    links: NAV_LINKS, active: 'learn', account: true,
    onTheme: k => store.setTheme(k), onSignOut: () => auth.signOut(),
    // cosmetic locks (Phase D): resolved lazily when the picker opens
    themeLocks: () => {
      const ctx = gameCtx();
      return Object.fromEntries(themeStates({ level: ctx.level, earned: earnedSet(ctx), rankIndex: ctx.rankIndex }).map(s => [s.key, s.lock]));
    },
  });
  const footer = footEl ? mountFooter(footEl) : null;

  // ---- accounts: boot auth (PKCE ?code= returns are exchanged inside ready(); the hash
  // router never reads location.search, so the return lands on #/account untouched)
  function syncUser() {
    const u = auth.user();
    const p = store.profile();
    nav.setUser(u ? { handle: p && p.handle, level: p && p.level } : null);
    nav.setSaveState(store.saveText());
  }
  installErrorLog();
  captureInstall();
  auth.ready().then(() => { syncUser(); if (auth.state() === 'in') store.hydrate().then(syncUser); });
  auth.onChange(() => {
    if (auth.state() === 'in') { syncUser(); store.hydrate().then(() => { syncUser(); route(); }); }
    else { store.reset(); syncUser(); route(); }
  });
  window.addEventListener('hk:save', e => {
    nav.setSaveState(store.saveText(e.detail));
    // a result card showing the save line follows it ("Saving…" → "Saved to your account")
    document.querySelectorAll('[data-save-text]').forEach(n => { n.textContent = store.saveText(e.detail); });
  });
  window.addEventListener('hk:user', () => syncUser());
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
    const next = applyFlowQuery(r.query); reflectFlow(next);
    let name = r.name;
    if (name === 'root') name = isReturning() ? 'home' : 'landing';
    let lesson = null;
    if (name === 'lesson') { lesson = lessonById(r.params.id); if (!lesson) name = 'notfound'; }
    let drill = null;
    if (name === 'drill' && !r.params.daily && r.params.id !== 'sandbox') {
      drill = (await import('../content/drills.js')).drillById(r.params.id);
      if (!drill) name = 'notfound';
    }
    nav.setActive(navKeyFor(name === 'home' ? 'root' : name));
    try { nav.setLevel(gameCtx().level); } catch (e) { /* records unreadable: no chip */ }
    document.title = titleFor(name, lesson ? lesson.title : name === 'drill' ? (drill ? drill.title : 'Sandbox') : '');
    document.body.dataset.route = name;
    window.scrollTo(0, 0);

    // the workspace routes need a keyboard and width; below the breakpoint show the notice instead
    if ((name === 'lesson' || name === 'drill' || name === 'rapid' || name === 'due') && narrowMq && narrowMq.matches) { current = narrowNotice(rootEl, lesson); return; }

    const base = LOADERS[name] || LOADERS.notfound;
    const entry = next && base.next ? base.next : base;
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
      let res = name === 'lesson' ? mount(rootEl, lesson, { mode: r.query.mode || 'guided', panel: r.query.panel, seed: r.query.seed }) : mount(rootEl, ctx);
      // a page that mounts asynchronously still hands back its destroy(); a route that moved on meanwhile tears it down at once
      if (res && typeof res.then === 'function') { res = await res; if (myGen !== gen) { if (res && typeof res.destroy === 'function') { try { res.destroy(); } catch (e) { /* ignore */ } } return; } }
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
