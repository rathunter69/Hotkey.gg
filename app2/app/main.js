// app2/app/main.js — the shell: one nav, one footer, a hash router over the site's pages.
//
//   #/                 Landing for a first-time visitor; Home once any progress or prefs exist
//   #/landing          the landing page, always
//   #/start            the first run (the two questions, the story card)
//   #/learn            the chapter table
//   #/lesson/<id>      a lesson in the workspace; ?mode=solo|timed
//   #/practice         Drills; #/practice/daily, /rapid, /challenges the other three modes
//   #/drill/<id>       a drill; #/daily the Daily; #/drill/sandbox the free sheet
//   #/leaderboard  #/reference  #/pricing  #/teams  #/account
//   #/about  #/terms  #/privacy  #/eula  #/contact
//   #/due/<shortcut>   a refresher rep from today's queue (app/due-page.js)
//   anything else      404
//
// Page modules load lazily with import(); a failed load renders an error card with Retry, never
// an empty page. Below ~900px the lesson and drill routes show a readable notice instead of the
// workspace (site.css hides the workspace too, so a resize mid-lesson degrades the same way).
import { mountNav, weekCells } from '../ui/nav.js';
import { createKeyTips } from '../ui/components/keytips.js';
import { createCursor } from '../ui/components/cursor.js';
import { mountCoachMarks, coachMarksDue } from '../ui/components/coachmarks.js';
import { mountFooter } from '../ui/footer.js';
import { prefs } from './prefs.js';
import { settings } from './settings.js';
import { dayOf } from './records.js';
import { store } from './store.js';
import { auth } from './auth.js';
import { entitlement } from './entitlement.js';
import { track, installErrorLog } from './telemetry.js';
import { captureInstall } from './install.js';
import { LEGACY_IDS } from './progress.js';
import { skeletonHtml } from '../ui/skeleton.js';
import { itemNumber } from './numbering.js';
// the lesson catalogue and the XP/cosmetics stack load lazily (they are most of the module graph):
// the nav, the footer and a page skeleton paint first, then the level chip and theme locks catch up
const lessonsMod = () => import('../content/index.js');
const statsMod = () => Promise.all([import('./stats.js'), import('../ui/badges.js'), import('./cosmetics.js')]);

/** The routes that are the workspace: no rail, Alt belongs to the Ribbon, the sheet gets the window (3.0). */
export const WORKSPACE_ROUTES = new Set(['lesson', 'drill', 'rapid', 'due']);

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
  else if ((m = /^\/practice\/(daily|drills|rapid|challenges)$/.exec(path))) { name = 'practice'; params.mode = m[1]; }   // the four modes under Practice (3.0, The rail)
  else if (path === '/leaderboards') name = 'leaderboard';
  else if ((m = /^\/drill\/([a-z0-9-]+)$/.exec(path))) { name = 'drill'; params.id = m[1]; }
  else if (path === '/sandbox') { name = 'drill'; params.id = 'sandbox'; }
  else if (path === '/daily') { name = 'drill'; params.daily = true; }
  else if (path === '/rapid') name = 'rapid';
  else if ((m = /^\/due\/([a-z0-9-]+)$/.exec(path))) { name = 'due'; params.id = m[1]; }
  else if (['/leaderboard', '/reference', '/pricing', '/teams', '/account', '/about', '/terms', '/privacy', '/eula', '/contact'].includes(path)) name = path.slice(1);
  else name = 'notfound';
  return { name, params, query, path };
}

/** Which rail item a route lights up: Home, Learn, Practice or one of its four modes, Leaderboards, Reference. The landing and the first run light none. */
export function navKeyFor(name, params = {}) {
  if (name === 'root' || name === 'home') return 'home';
  if (name === 'learn' || name === 'lesson' || name === 'locked') return 'learn';
  if (name === 'practice') return params.mode || 'drills';   // #/practice is Drills: its item under Practice carries the mark (3.0, The rail)
  if (name === 'drill') return params.daily ? 'daily' : 'drills';
  if (name === 'rapid') return 'rapid';
  if (name === 'due') return 'practice';
  if (name === 'leaderboard' || name === 'reference') return name;
  return '';
}

/** The page's mode color (3.0, Color: each mode has one; tokens.css reads body[data-mode]). */
export function modeOf(name, params = {}) {
  if (name === 'practice') return params.mode === 'daily' || params.mode === 'rapid' || params.mode === 'challenges' ? params.mode : 'drills';
  if (name === 'drill') return params.daily ? 'daily' : 'drills';
  if (name === 'rapid') return 'rapid';
  if (name === 'due') return 'drills';
  if (name === 'leaderboard') return 'daily';   // the page opens on The Daily's board
  return 'learn';
}

/** index.html's own <title>: the landing keeps it, so the tab and a shared link agree. */
export const HOME_TITLE = 'hotkey.gg: the better way to master Excel';

/** The document title for a route. */
export function titleFor(name, extra) {
  const T = { root: HOME_TITLE, landing: HOME_TITLE, home: 'Home · hotkey.gg', start: 'Get started · hotkey.gg', learn: 'Learn · hotkey.gg',
    lesson: (extra ? extra + ' · ' : '') + 'hotkey.gg', locked: (extra ? extra + ' · ' : '') + 'Paid tier · hotkey.gg', practice: 'Practice · hotkey.gg', drill: (extra ? extra + ' · ' : '') + 'Practice · hotkey.gg', leaderboard: 'Leaderboards · hotkey.gg',
    reference: 'Reference · hotkey.gg', pricing: 'Pricing · hotkey.gg', teams: 'Teams · hotkey.gg', account: 'Account · hotkey.gg', about: 'About · hotkey.gg',
    terms: 'Terms · hotkey.gg', privacy: 'Privacy · hotkey.gg', eula: 'EULA · hotkey.gg', contact: 'Contact · hotkey.gg', notfound: 'Page not found · hotkey.gg',
    due: 'Due today · hotkey.gg' };
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
  landing: { file: './landing-page.js', pick: m => m.mountLandingPage },   // the page as a sheet (M95)
  home: { file: './home-page.js', pick: m => m.mountHomePage },   // 3.0's Home (M89)
  start: { file: './first-run.js', pick: m => m.mountFirstRun },   // the two questions and the story card (M92)
  learn: { file: './learn-page.js', pick: m => m.mountLearnPage },   // 3.0's Learn (M89)
  due: { file: './due-page.js', pick: m => m.mountDuePage },
  lesson: { file: './lesson-view.js', pick: m => m.mountLessonView },
  locked: { file: './lock-page.js', pick: m => m.mountLockPage },   // a paid lesson, to an account without the tier
  practice: { file: './practice-page.js', pick: m => m.mountPracticePage },
  drill: { file: './drill-page.js', pick: m => m.mountDrillPage },
  rapid: { file: './rapid-fire.js', pick: m => m.mountRapidPage },
  leaderboard: { file: './leaderboard-page.js', pick: m => m.mountLeaderboardPage },
  reference: { file: './reference-page.js', pick: m => m.mountReferencePage },
  settings: { file: './settings-page.js', pick: m => m.mountSettingsPage },   // #/account?section=settings: the page rendered from SETTINGS_GROUPS (M101)
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

/** What the error card calls a route's page ("Learn did not load."). Exported for the tests. */
export function pageLabel(name, params) {
  const L = { home: 'Home', landing: 'The front page', root: 'Home', start: 'Getting started', learn: 'Learn', lesson: 'This lesson',
    practice: 'Practice', drill: params && params.daily ? 'The Daily' : 'This drill', rapid: 'Rapid-fire', due: 'Due today',
    leaderboard: 'The leaderboard', reference: 'The shortcut reference', pricing: 'Pricing', teams: 'Teams', account: 'Your account' };
  return L[name] || 'This page';
}

/**
 * The card a page that failed shows instead of an empty screen. `kind` 'fetch' (a file did not
 * arrive: the connection is the likely cause) or 'mount' (the page threw: our fault, not theirs).
 * The secondary action never points back at the page that just failed.
 */
function errorCard(root, { name, params, kind }, retry) {
  const label = pageLabel(name, params);
  const onHome = name === 'home' || name === 'root' || name === 'landing';
  const body = kind === 'mount'
    ? 'Something broke on our side. Retry, or go to ' + (onHome ? 'Learn' : 'Home') + '.'
    : label + ' couldn’t be fetched. Check your connection and try again.';
  root.innerHTML = `<div class="err-card" role="alert"><div class="err-cap">Couldn’t load</div>
    <div class="err-body"><h1>${esc(label)} didn’t load.</h1><p>${esc(body)}</p>
    <div class="err-actions"><button class="btn btn-primary" id="errRetry" type="button">Retry</button>${onHome ? '<a class="btn btn-ghost" href="#/learn">Learn</a>' : '<a class="btn btn-ghost" href="#/">Home</a>'}</div></div></div>`;
  const b = root.querySelector('#errRetry'); b.onclick = retry; b.focus();
}

/** A lesson's number for the narrow notice ('Lesson 1.2.3', 'Challenge 1.1'); '' when it has none. */
function narrowCrumb(lesson, content) {
  try {
    const num = itemNumber(lesson, content.moduleOf ? content.moduleOf(lesson) : null);
    if (!num) return '';
    return lesson.kind === 'challenge' ? 'Challenge ' + num.replace(/\.C$/, '') : 'Lesson ' + num;
  } catch (e) { return ''; }
}

function narrowNotice(root, lesson, content) {
  const el = document.createElement('div'); el.className = 'narrow-page';
  const teach = lesson && (lesson.steps || []).find(s => s.mode === 'teach');   // the old schema's teach step
  const crumb = lesson ? narrowCrumb(lesson, content || {}) : '';
  const code = t => esc(t).replace(/`([^`]+)`/g, '<kbd>$1</kbd>');
  el.innerHTML = `<div class="narrow-msg" role="status"><div class="narrow-cap">hotkey.gg</div>
      <h1>hotkey.gg needs a keyboard and a wider screen.</h1>
      <p>Lessons and drills run on a real spreadsheet with the keyboard. Open this page on a laptop or desktop, at least 900px wide.</p>
      <div class="narrow-actions"><a class="btn btn-ghost" href="#/learn">Back to Learn</a></div></div>` +
    (lesson ? `<article class="narrow-lesson">${crumb ? `<div class="lesson-crumb">${esc(crumb)}</div>` : ''}<h2>${esc(lesson.title)}</h2>` +
      (lesson.brief ? `<p class="narrow-brief">${code(lesson.brief)}</p>` : '') +
      (teach ? `<h3>${esc(teach.title)}</h3>` + teach.body.map(p => `<p>${code(p)}</p>`).join('') : '') +
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
  const nav = mountNav(navEl, { active: 'home', onSignOut: () => auth.signOut() });
  // one KeyTips registry for site pages (M88): never inside the workspace, where Alt is the Ribbon's; a setting switches it off
  const keytips = createKeyTips({ isWorkspace: () => WORKSPACE_ROUTES.has(document.body.dataset.route), enabled: () => { try { return settings.get().siteKeyTips !== false; } catch (e) { return true; } } });
  let cursor = null;   // the cell cursor of the current site page (M88), remade on every route
  const footer = footEl ? mountFooter(footEl) : null;
  let stats = null;   // { gameCtx, earnedSet, themeStates } once the lazy stack arrives
  // the rail's foot: the level with its XP, the streak with the week's cells, Go Pro for a free account (none on the landing and the first run)
  function refreshLevel() {
    const name = document.body.dataset.route;
    if (name === 'landing' || name === 'start') { nav.setLevel(null); nav.setStreak(null); return; }
    const set = () => {
      try {
        const ctx = stats.gameCtx();
        nav.setLevel(ctx.levelInfo);
        nav.setStreak({ day: ctx.streakDays || 0, ...weekCells(ctx.days || [], dayOf()) });
      } catch (e) { /* records unreadable: no level */ }
      try { nav.setPro(entitlement.entitled()); } catch (e) { /* no entitlement read: Go Pro shows */ }
    };
    if (stats) set();
    else statsMod().then(([st, b, c]) => { stats = { gameCtx: st.gameCtx, earnedSet: b.earnedSet, themeStates: c.themeStates }; set(); }).catch(() => { /* retried on the next route */ });
  }

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
  // signed in at boot: the page mounted from the device cache, so once the account's records arrive a
  // dashboard page that would read differently is drawn again (never a workspace mid-run)
  const snapshot = () => { try { return JSON.stringify(store.all()); } catch (e) { return ''; } };
  auth.ready().then(() => {
    syncUser();
    if (auth.state() !== 'in') return;
    const before = snapshot();
    store.hydrate().then(() => {
      syncUser();
      const n = document.body.dataset.route;
      if ((n === 'home' || n === 'learn' || n === 'practice') && snapshot() !== before) route();
    });
  });
  auth.onChange(() => {
    if (auth.state() === 'in') { syncUser(); store.hydrate().then(() => { syncUser(); route(); }); }
    else { store.reset(); syncUser(); route(); }
  });
  window.addEventListener('hk:save', e => {
    nav.setSaveState(store.saveText(e.detail));
    refreshLevel();   // a record was just written: XP may have crossed a level
    // a result card showing the save line follows it ("Saving…" → "Saved to your account")
    document.querySelectorAll('[data-save-text]').forEach(n => { n.textContent = store.saveText(e.detail); });
  });
  window.addEventListener('hk:user', () => syncUser());
  const narrowMq = typeof matchMedia === 'function' ? matchMedia(NARROW_QUERY) : null;

  function unmount() {
    if (current && current.destroy) { try { current.destroy(); } catch (e) { /* a page that failed half-way must not block the next */ } }
    current = null;
    keytips.clear();
    if (cursor) { cursor.destroy(); cursor = null; }
    if (coach) { coach.destroy(); coach = null; }
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
    let lesson = null, content = null;
    if (name === 'lesson') {
      const early = setTimeout(() => { if (myGen === gen && !rootEl.firstChild) rootEl.innerHTML = skeletonHtml('lesson'); }, 50);
      try { content = await lessonsMod(); } catch (e) { clearTimeout(early); if (myGen === gen) fetchFailed({ name, params: r.params }); return; }
      clearTimeout(early);
      if (myGen !== gen) return;
      lesson = content.lessonById(r.params.id);
      if (!lesson) { if (LEGACY_IDS.has(r.params.id)) { location.replace('#/learn'); return; } name = 'notfound'; }   // a deleted lesson's URL goes to the catalog (Run 4)
      // a paid lesson (Chapter 2 on): the account's entitlement decides between the lesson and the lock page — never a 404
      if (lesson && entitlement.locked(lesson)) {
        if (auth.state() === 'in') { await entitlement.refresh(); if (myGen !== gen) return; }
        if (entitlement.locked(lesson)) name = 'locked';
      }
    }
    let drill = null;
    if (name === 'drill' && !r.params.daily && r.params.id !== 'sandbox') {
      try { drill = (await import('../content/drills.js')).drillById(r.params.id); } catch (e) { if (myGen === gen) fetchFailed({ name, params: r.params }); return; }
      if (myGen !== gen) return;
      if (!drill) name = 'notfound';
    }
    nav.setLanding(name === 'landing');
    nav.setActive(navKeyFor(name, r.params));
    document.title = titleFor(name, lesson ? lesson.title : name === 'drill' ? (drill ? drill.title : 'Sandbox') : '');
    document.body.dataset.route = name;
    document.body.dataset.mode = modeOf(name, r.params);
    refreshLevel();
    window.scrollTo(0, 0);

    // the workspace routes need a keyboard and width; below the breakpoint show the notice instead
    if ((name === 'lesson' || name === 'drill' || name === 'rapid' || name === 'due') && narrowMq && narrowMq.matches) { current = narrowNotice(rootEl, lesson, content); return; }

    const entry = (name === 'account' && r.query.section === 'settings' ? LOADERS.settings : LOADERS[name]) || LOADERS.notfound;
    let mount;
    // a page module that is not in hand within 50 ms gets the page's shape painted meanwhile (C2)
    const skel = setTimeout(() => { if (myGen === gen && !rootEl.firstChild) rootEl.innerHTML = skeletonHtml(name); }, 50);
    try { mount = await loadPage(entry); }
    catch (e) {
      clearTimeout(skel);
      if (myGen === gen) fetchFailed({ name, params: r.params });
      return;
    }
    retrying = false;
    clearTimeout(skel);
    if (myGen !== gen) return;
    if (rootEl.querySelector('.sk')) rootEl.innerHTML = '';
    try {
      const ctx = { query: r.query, params: r.params, nav, lesson, keytips };
      let res = name === 'lesson' ? mount(rootEl, lesson, { mode: r.query.mode || 'guided', panel: r.query.panel, seed: r.query.seed, daily: r.query.daily }) : mount(rootEl, ctx);
      // the cell cursor on a site page: the arrows move it over whatever the page marked data-cursor, Enter does the item
      if (!WORKSPACE_ROUTES.has(name)) { cursor = createCursor({ root: rootEl }); ctx.cursor = cursor; }
      // a page that mounts asynchronously still hands back its destroy(); a route that moved on meanwhile tears it down at once
      if (res && typeof res.then === 'function') { res = await res; if (myGen !== gen) { if (res && typeof res.destroy === 'function') { try { res.destroy(); } catch (e) { /* ignore */ } } return; } }
      current = res && typeof res.destroy === 'function' ? res : { destroy() { rootEl.innerHTML = ''; } };
      // the first visit to Home after a lesson: one coach mark on each rail item, once (3.0, The first run; M92)
      if (name === 'home') showCoachMarks();
    } catch (e) {
      console.error(e);
      errorCard(rootEl, { name, params: r.params, kind: 'mount' }, route);
    }
  }
  let coach = null;
  function showCoachMarks() {
    try {
      const all = store.all();
      const done = Object.values(all).filter(e => e && e.completed).length;
      if (!coachMarksDue(prefs.get(), done)) return;
      if (coach) coach.destroy();
      coach = mountCoachMarks({ railEl: navEl, onDone: () => { coach = null; prefs.set({ coachMarksDone: true }); } });
    } catch (e) { /* a page without records: no marks today */ }
  }
  let retrying = false;
  function retryRoute() { retrying = true; route(); }
  // a Retry that fails again is a dependency the module map cached as failed: only a reload refetches it
  function fetchFailed(what) {
    if (retrying && (typeof navigator === 'undefined' || navigator.onLine !== false)) { retrying = false; location.reload(); return; }
    retrying = false;
    rootEl.innerHTML = '';
    errorCard(rootEl, { ...what, kind: 'fetch' }, retryRoute);
  }

  window.addEventListener('hashchange', route);
  if (narrowMq && narrowMq.addEventListener) narrowMq.addEventListener('change', () => { const n = parseRoute(location.hash || '#/').name; if (n === 'lesson' || n === 'drill') route(); });
  route();
  return { route, nav, footer, keytips };
}
