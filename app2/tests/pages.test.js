// The pure parts of the site shell: prefs normalisation on corrupt values, the "next lesson"
// selection with skipped and completed lessons, catalog filters, route parsing and titles, the
// placement → skipped mapping, the group-access form validator.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalisePrefs, defaultPrefs, detectPlatform, keyLabel, PREFS_KEY } from '../app/prefs.js';
import { statusOf, pickNextLesson, matchesFilters, groupBySection, CHAPTER_PLAN } from '../app/learn-page.js';
import { parseRoute, navKeyFor, titleFor } from '../app/main.js';
import { LESSONS } from '../content/index.js';
import { skipsFor, PLACEMENT_TASKS } from '../app/first-run.js';
import { validateRequest } from '../app/teams-page.js';
import { FOOTER_LINKS } from '../ui/footer.js';
import { ACCOUNT_ITEMS } from '../ui/nav.js';

/* ---------------- prefs ---------------- */
test('prefs: defaults follow the detected platform', () => {
  assert.deepEqual(defaultPrefs('mac'), { platform: 'mac', experience: null, firstRunDone: false, skipped: [], ribbon: null, mute: false, effects: 'full', ghost: true,
    density: 'comfortable', panelSide: 'overlay', briefingDone: false, installPromptAt: 0, beatsSeen: [], saveNudgeDone: false, dashHintsSeen: false });
  assert.equal(defaultPrefs('amiga').platform, 'win');
  assert.equal(PREFS_KEY, 'hk2_prefs');
});

test('prefs: corrupt and wrong-typed values normalise to defaults', () => {
  for (const bad of [null, undefined, 'x', 42, [], [1, 2], true]) assert.deepEqual(normalisePrefs(bad, 'win'), defaultPrefs('win'), String(bad));
  const p = normalisePrefs({ platform: 'linux', experience: 'expert', firstRunDone: 'yes', skipped: 'a,b', ribbon: 'huge', mute: 1, extra: 'dropped' }, 'mac');
  assert.deepEqual(p, defaultPrefs('mac'));
  assert.equal('extra' in p, false);
});

test('prefs: valid values survive; skipped keeps unique non-empty strings, capped', () => {
  const p = normalisePrefs({ platform: 'mac', experience: 'daily', firstRunDone: true, skipped: ['a', 'a', '', 7, null, 'b'], ribbon: 'slim', mute: true }, 'win');
  assert.deepEqual(p, { platform: 'mac', experience: 'daily', firstRunDone: true, skipped: ['a', 'b'], ribbon: 'slim', mute: true, effects: 'full', ghost: true,
    density: 'comfortable', panelSide: 'overlay', briefingDone: false, installPromptAt: 0, beatsSeen: [], saveNudgeDone: false, dashHintsSeen: false });
  const many = normalisePrefs({ skipped: Array.from({ length: 2000 }, (_, i) => 'l' + i) }, 'win');
  assert.equal(many.skipped.length, 500);
});

test('prefs: platform detection reads userAgentData first, then platform, then userAgent', () => {
  assert.equal(detectPlatform({ userAgentData: { platform: 'macOS' }, platform: 'Win32' }), 'mac');
  assert.equal(detectPlatform({ platform: 'MacIntel' }), 'mac');
  assert.equal(detectPlatform({ platform: 'iPhone' }), 'mac');
  assert.equal(detectPlatform({ platform: 'Win32' }), 'win');
  assert.equal(detectPlatform({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64)' }), 'win');
  assert.equal(detectPlatform({}), 'win');
  assert.equal(detectPlatform(null), 'win');
});

test('prefs: keycap labels follow the platform', () => {
  assert.equal(keyLabel('Ctrl+B', 'win'), 'Ctrl+B');
  assert.equal(keyLabel('Ctrl+B', 'mac'), '⌘+B');
  assert.equal(keyLabel('Alt H B', 'mac'), '⌥ H B');
  assert.equal(keyLabel('Ctrl+Shift+→', 'mac'), '⌘+Shift+→');
});

/* ---------------- next lesson, status, filters ---------------- */
const L = [{ id: 'a', title: 'A', difficulty: 'easy', tags: ['nav'], access: 'free', section: 'One' },
  { id: 'b', title: 'B moving', difficulty: 'easy', tags: ['nav'], access: 'free', section: 'One' },
  { id: 'c', title: 'C', difficulty: 'medium', tags: ['ribbon'], access: 'free' },
  { id: 'd', title: 'D', difficulty: 'hard', tags: ['formulas'], access: 'paid', section: 'Two' }];

test('statusOf: completed beats skipped; skipped beats started; mastered from solo or timed', () => {
  assert.equal(statusOf('a', {}, []), 'todo');
  assert.equal(statusOf('a', { a: { started: true } }, []), 'started');
  assert.equal(statusOf('a', { a: { started: true } }, ['a']), 'skipped');
  assert.equal(statusOf('a', { a: { completed: true } }, ['a']), 'done');
  assert.equal(statusOf('a', { a: { completed: true, solo: true } }, []), 'mastered');
  assert.equal(statusOf('a', { a: { completed: true, timed: true } }, ['a']), 'mastered');
  assert.equal(statusOf('a', null, null), 'todo');
});

test('pickNextLesson: the first lesson neither completed nor skipped, in catalog order', () => {
  assert.equal(pickNextLesson(L, {}, []).id, 'a');
  assert.equal(pickNextLesson(L, { a: { completed: true } }, []).id, 'b');
  assert.equal(pickNextLesson(L, { a: { completed: true } }, ['b']).id, 'c');
  assert.equal(pickNextLesson(L, { a: { completed: true }, c: { started: true } }, ['b']).id, 'c', 'a started lesson is still next');
  assert.equal(pickNextLesson(L, { b: { completed: true } }, ['a', 'c']).id, 'd', 'skips and completions interleave');
  assert.equal(pickNextLesson(L, { a: { completed: true }, b: { completed: true }, c: { completed: true, solo: true } }, ['d']), null, 'nothing left');
  assert.equal(pickNextLesson(L, { c: { completed: true } }, ['c']).id, 'a', 'a skipped-and-completed lesson does not move the pointer past earlier work');
});

test('pickNextLesson: works on the real catalogue with placement skips', () => {
  // 'move' skips the Welcome race, the workbook lesson and the Moving section; 'select' the Selecting section;
  // the section-1 Options and Page Setup lessons are never skipped, so a daily user starts there at the latest
  // the placement tasks cover legacy ids only, so mid-rewrite the module lessons always come first
  const skipped = skipsFor(['move', 'select']);
  assert.equal(pickNextLesson(LESSONS, {}, skipped).id, 'inherited-workbook');
  assert.equal(pickNextLesson(LESSONS, {}, []).id, 'inherited-workbook');
  // within the legacy block the placement skips still steer to the first uncovered lesson
  const legacy = LESSONS.slice(LESSONS.findIndex(l => l.id === 'welcome-race'));
  assert.equal(pickNextLesson(legacy, {}, skipped).id, 'managing-sheets');
  assert.equal(pickNextLesson(legacy, {}, skipsFor(['move', 'select', 'type-bold'])).id, 'managing-sheets');
});

test('matchesFilters: status, difficulty, access and a word search', () => {
  const none = { q: '', status: 'all', difficulty: 'all', access: 'all' };
  assert.equal(matchesFilters(L[0], 'todo', none), true);
  assert.equal(matchesFilters(L[0], 'todo', { ...none, status: 'done' }), false);
  assert.equal(matchesFilters(L[0], 'done', { ...none, status: 'done' }), true);
  assert.equal(matchesFilters(L[2], 'todo', { ...none, difficulty: 'medium' }), true);
  assert.equal(matchesFilters(L[2], 'todo', { ...none, difficulty: 'easy' }), false);
  assert.equal(matchesFilters(L[3], 'todo', { ...none, access: 'paid' }), true);
  assert.equal(matchesFilters(L[3], 'todo', { ...none, access: 'free' }), false);
  assert.equal(matchesFilters(L[1], 'todo', { ...none, q: 'MOVING' }), true, 'case-insensitive title match');
  assert.equal(matchesFilters(L[1], 'todo', { ...none, q: 'nav' }), true, 'tags match');
  assert.equal(matchesFilters(L[1], 'todo', { ...none, q: 'one' }), true, 'section matches');
  assert.equal(matchesFilters(L[1], 'todo', { ...none, q: 'moving formulas' }), false, 'every word must match');
  assert.equal(matchesFilters(L[1], 'todo', { ...none, q: '   ' }), true, 'blank search matches');
});

test('groupBySection: first-seen order, "Basics" when absent', () => {
  assert.deepEqual(groupBySection(L).map(g => [g.name, g.lessons.map(l => l.id)]), [['One', ['a', 'b']], ['Basics', ['c']], ['Two', ['d']]]);
});

test('the chapter plan has six chapters, Chapter 1 free and the rest paid', () => {
  assert.equal(CHAPTER_PLAN.length, 6);
  assert.deepEqual(CHAPTER_PLAN.map(c => c.n), [1, 2, 3, 4, 5, 6]);
  assert.equal(CHAPTER_PLAN[0].access, 'free');
  assert.ok(CHAPTER_PLAN.slice(1).every(c => c.access === 'paid'));
  assert.equal(CHAPTER_PLAN[0].id, 'foundations');
});

/* ---------------- routes ---------------- */
test('parseRoute: every documented route, with params and query', () => {
  assert.equal(parseRoute('').name, 'root');
  assert.equal(parseRoute('#/').name, 'root');
  assert.equal(parseRoute('#').name, 'root');
  assert.equal(parseRoute('#/landing').name, 'landing');
  assert.equal(parseRoute('#/start').name, 'start');
  assert.equal(parseRoute('#/learn').name, 'learn');
  assert.equal(parseRoute('#/learn/').name, 'learn', 'trailing slash tolerated');
  const l = parseRoute('#/lesson/active-cell?mode=solo');
  assert.equal(l.name, 'lesson'); assert.equal(l.params.id, 'active-cell'); assert.equal(l.query.mode, 'solo');
  assert.equal(parseRoute('#/lesson/Bad_Id').name, 'notfound');
  assert.equal(parseRoute('#/lesson/').name, 'notfound');
  assert.equal(parseRoute('#/practice').name, 'practice');
  const d = parseRoute('#/drill/sandbox'); assert.equal(d.name, 'drill'); assert.equal(d.params.id, 'sandbox');
  const old = parseRoute('#/sandbox'); assert.equal(old.name, 'drill'); assert.equal(old.params.id, 'sandbox');
  for (const n of ['leaderboard', 'reference', 'pricing', 'teams', 'account', 'about', 'terms', 'privacy', 'eula', 'contact']) assert.equal(parseRoute('#/' + n).name, n);
  assert.equal(parseRoute('#/account?section=desks').query.section, 'desks');
  assert.equal(parseRoute('#/nope').name, 'notfound');
  assert.equal(parseRoute('#/lesson/x/y').name, 'notfound');
  assert.equal(parseRoute(null).name, 'root');
});

test('navKeyFor and titleFor', () => {
  assert.equal(navKeyFor('root'), 'learn'); assert.equal(navKeyFor('lesson'), 'learn'); assert.equal(navKeyFor('start'), 'learn');
  assert.equal(navKeyFor('drill'), 'practice'); assert.equal(navKeyFor('leaderboard'), 'leaderboard'); assert.equal(navKeyFor('reference'), 'reference');
  assert.equal(navKeyFor('pricing'), '');
  assert.equal(titleFor('learn'), 'Learn · hotkey.gg');
  assert.equal(titleFor('lesson', 'The active cell'), 'The active cell · hotkey.gg');
  assert.equal(titleFor('notfound'), 'Page not found · hotkey.gg');
  assert.equal(titleFor('whatever'), 'hotkey.gg');
});

/* ---------------- placement, teams form, shell lists ---------------- */
test('placement: passed tasks map to skipped lessons that exist, without duplicates', () => {
  assert.deepEqual(skipsFor([]), []);
  assert.deepEqual(skipsFor(['move']), ['welcome-race', 'workbook-sheets-cells', 'active-cell', 'moving-around']);
  assert.deepEqual(skipsFor(['move', 'move', 'select']), ['welcome-race', 'workbook-sheets-cells', 'active-cell', 'moving-around', 'selecting-ranges']);
  assert.deepEqual(skipsFor(['type-bold']), ['ribbon-and-keytips', 'entering-data', 'ribbon-commands']);
  const ids = new Set(LESSONS.map(l => l.id));
  for (const t of PLACEMENT_TASKS) for (const id of t.skips) assert.ok(ids.has(id), `${t.id} skips a real lesson: ${id}`);
  for (const id of ['excel-options', 'page-setup']) assert.ok(!skipsFor(PLACEMENT_TASKS.map(t => t.id)).includes(id), `${id} is never skipped by placement`);
  assert.equal(PLACEMENT_TASKS.length, 3);
});

test('placement checks read the real engine', async () => {
  const { Sheet } = await import('../engine/sheet.js');
  const { Session } = await import('../engine/keyboard.js');
  const sheet = new Sheet({ cells: { A1: { value: 'Weekly Sales Report', bold: true } }, active: { r: 1, c: 1 } });
  const ses = new Session(sheet);
  const [move, select, typeBold] = PLACEMENT_TASKS;
  assert.equal(move.check(sheet, ses), false);
  ses.run('Right Right Down Down Down');
  assert.equal(move.check(sheet, ses), true, 'C4 is the active cell');
  ses.run('Ctrl+Home Down Right Shift+Down Shift+Down Shift+Down Shift+Down');
  assert.equal(select.check(sheet, ses), true, 'B2:B6 selected');
  ses.run('Ctrl+Home');
  for (let i = 0; i < 7; i++) ses.press('Down');
  assert.equal(typeBold.check(sheet, ses), false);
  ses.run('"Total" Enter Up Ctrl+B');
  assert.equal(typeBold.check(sheet, ses), true, 'Total in A8, bold');
});

test('teams: the group-access request validates every field', () => {
  const ok = validateRequest({ name: 'A', org: 'Bank', email: 'a@b.co', seats: '25', start: '2026-10-01' });
  assert.equal(ok.ok, true); assert.equal(ok.data.seats, 25);
  const bad = validateRequest({ name: '', org: ' ', email: 'nope', seats: '0', start: 'soon' });
  assert.equal(bad.ok, false);
  assert.deepEqual(Object.keys(bad.errors).sort(), ['email', 'name', 'org', 'seats', 'start']);
  assert.equal(validateRequest({ name: 'A', org: 'B', email: 'a@b.co', seats: '2.5', start: '2026-10-01' }).ok, false, 'seats must be whole');
});

test('the footer and account menu carry the spec lists', () => {
  assert.deepEqual(FOOTER_LINKS.map(l => l.label), ['Pricing', 'Teams', 'About', 'Terms', 'Privacy', 'Contact']);
  assert.deepEqual(ACCOUNT_ITEMS.filter(i => !i.divider).map(i => i.label), ['Sign in', 'Desks', 'Stats', 'Profile', 'Settings']);
  assert.ok(ACCOUNT_ITEMS.filter(i => !i.divider).every(i => i.href.startsWith('#/account')));
});

/* ---------------- legal pages ---------------- */
test('legal pages: real drafts, DRAFT banner gated on LEGAL_STATUS.reviewed, disclaimer and contact present', async () => {
  const { LEGAL, LEGAL_STATUS, renderLegal } = await import('../app/legal-pages.js');
  assert.equal(LEGAL_STATUS.reviewed, false, 'the flip to reviewed:true is a WOLF-approved commit');
  assert.match(LEGAL_STATUS.updated, /^\d{4}-\d{2}-\d{2}$/);
  for (const kind of ['terms', 'privacy', 'eula', 'contact']) {
    const draft = renderLegal(kind, { reviewed: false, updated: '2026-09-22' });
    assert.match(draft, /draft-banner/, kind + ': banner while unreviewed');
    const final = renderLegal(kind, { reviewed: true, updated: '2026-09-22' });
    assert.ok(!/draft-banner/.test(final), kind + ': no banner when reviewed');
    assert.ok(!/pre-review/.test(final), kind + ': no pre-review note when reviewed');
    assert.match(final, /Last updated 2026-09-22/);
    assert.match(draft, /not affiliated with, sponsored by, or endorsed by Microsoft/, kind + ': Microsoft disclaimer');
    for (const [, body] of LEGAL[kind].sections) assert.ok(body.length > 80, kind + ': every section is a real draft, not a placeholder');
  }
  assert.match(renderLegal('contact'), /hello@hotkey\.gg/, 'contact page has the support address');
  assert.match(renderLegal('privacy'), /privacy@hotkey\.gg/);
});

/* ---------------- the Learn path model (C2 gap 9) ---------------- */
import { moduleStatus, pathModel } from '../app/learn-page.js';
import { CHAPTERS, modulesOf, moduleOf } from '../content/index.js';

const MOD = { id: 'open-and-set-up', lessons: [{ id: 'm1' }, { id: 'm2' }], challenge: { id: 'mc', title: 'The challenge' } };
test('moduleStatus: lessons plus the challenge pass make complete; lessons alone stop at lessons-done', () => {
  assert.equal(moduleStatus(MOD, {}), 'todo');
  assert.equal(moduleStatus(MOD, { m1: { started: true } }), 'started');
  assert.equal(moduleStatus(MOD, { m1: { completed: true } }), 'started');
  assert.equal(moduleStatus(MOD, { m1: { completed: true }, m2: { completed: true } }), 'lessons-done');
  assert.equal(moduleStatus(MOD, { m1: { completed: true }, m2: { completed: true }, mc: { challenge: true, tier: 'pass' } }), 'complete');
  assert.equal(moduleStatus({ ...MOD, challenge: null }, { m1: { completed: true }, m2: { completed: true } }), 'complete', 'a module without a challenge (the Welcome) completes on its lessons');
  assert.equal(moduleStatus(MOD, { mc: { challenge: true } }), 'started', 'a challenge pass alone is a start, not completion');
});

test('pathModel: items in order with the challenge last, one next-up, ring counts', () => {
  const chapter = { id: 'x', lessons: [
    { id: 'a', title: 'A', module: 'one', section: 'One' },
    { id: 'b', title: 'B', module: 'one', section: 'One' },
    { id: 'c', title: 'C', module: 'one', section: 'One', kind: 'challenge' },
    { id: 'd', title: 'D', module: 'two', section: 'Two' },
  ] };
  const mods = pathModel(chapter, { a: { completed: true }, c: { challenge: true, tier: 'pro' } }, []);
  assert.equal(mods.length, 2);
  assert.deepEqual(mods[0].items.map(i => i.kind), ['lesson', 'lesson', 'challenge']);
  assert.equal(mods[0].items[2].tier, 'pro');
  assert.equal(mods[0].done, 2, 'the done ring counts lessons and the challenge alike');
  assert.equal(mods[0].total, 3);
  const nexts = mods.flatMap(m => m.items.filter(i => i.next));
  assert.equal(nexts.length, 1, 'exactly one item pulses as next up');
  assert.equal(nexts[0].id, 'b', 'the first open item in path order');
  assert.equal(pathModel(CHAPTERS[0], {}, []).length, modulesOf(CHAPTERS[0]).length, 'the real chapter renders its authored modules');
});

test('moduleOf places a lesson inside its module and counts the chapter\'s modules', () => {
  assert.equal(moduleOf({ id: 'legacy' }), null, 'legacy lessons sit in no module');
  const mods = modulesOf(CHAPTERS[0]);
  for (const m of mods) {
    for (const [i, l] of m.lessons.entries()) {
      const at = moduleOf(l);
      assert.equal(at.module.id, m.id); assert.equal(at.n, i + 1); assert.equal(at.of, m.lessons.length); assert.equal(at.of7, mods.length);
    }
  }
});
