// The experience pass (2026-09-23): the pure parts of the flag, the cues, the story beats, the
// install offer, the Daily result card, the first-run copy and the demo script.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flowFromQuery, flowOn, DEFAULT_ON } from '../app/flow.js';
import { inferTarget, altPath, cellsOf } from '../ui/cues.js';
import { beatFor, MODULE_BEATS, pageDelivered } from '../app/beats.js';
import { shouldOfferInstall } from '../app/install.js';
import { dailyCardHtml, efficiency, prettyDay } from '../ui/result-card.js';
import { BRIEFING, ORIENTATION, stepsFor } from '../app/first-run-next.js';
import { HEADLINES, SUBHEAD, MODES, landingHtml } from '../app/landing-next.js';
import { DEMO_LESSON, demoScript } from '../ui/demo-player.js';
import { STAGES, dealState } from '../app/deal-strip.js';
import { PLANNED_MODULES } from '../app/learn-next.js';
import { LessonRun } from '../app/runner.js';
import { parseRoute, titleFor, navKeyFor } from '../app/main.js';
import { LESSONS, moduleOf } from '../content/index.js';
import { EVENTS } from '../app/telemetry.js';

test('flow: the flag is off by default, ?flow=next turns it on, ?flow=off turns it off', () => {
  assert.equal(DEFAULT_ON, false);
  assert.equal(flowFromQuery({ flow: 'next' }), 'next');
  assert.equal(flowFromQuery({ flow: 'on' }), 'next');
  assert.equal(flowFromQuery({ flow: 'off' }), 'off');
  assert.equal(flowFromQuery({ flow: 'maybe' }), null);
  assert.equal(flowFromQuery({}), null);
  assert.equal(flowFromQuery(null), null);
  assert.equal(flowOn(null), DEFAULT_ON);
  assert.equal(flowOn('next'), true);
  assert.equal(flowOn('off'), false);
});

test('routes: the due micro-drill and the storyboard parse; the flow query rides any route', () => {
  assert.deepEqual(parseRoute('#/due/ctrl-arrow').params, { id: 'ctrl-arrow' });
  assert.equal(parseRoute('#/due/ctrl-arrow').name, 'due');
  assert.equal(navKeyFor('due'), 'practice');
  assert.equal(parseRoute('#/storyboard').params.id, 'index');
  assert.equal(parseRoute('#/storyboard/daily-card').params.id, 'daily-card');
  assert.equal(parseRoute('#/learn?flow=next').query.flow, 'next');
  assert.equal(titleFor('storyboard'), 'Storyboard · hotkey.gg');
  assert.equal(titleFor('due'), 'Due today · hotkey.gg');
});

test('cues: the target is the last reference a goal names; rows, columns and other sheets count', () => {
  assert.equal(inferTarget({ text: 'Move from A3 (Monday) to A7 (Friday).' }), 'A7');
  assert.equal(inferTarget({ text: 'Round one, the slow way: walk down the dates with ↓ until you reach the last one, A61.' }), 'A61');
  assert.equal(inferTarget({ text: 'Select the Revenue column, E1:E60.' }), 'E1:E60');
  assert.deepEqual(inferTarget({ text: 'Jump to Costs!B7 by address.' }), { sheet: 'Costs', ref: 'B7' });
  assert.deepEqual(inferTarget({ text: 'Land on Old wk37!A15.' }), { sheet: 'Old wk37', ref: 'A15' });
  assert.equal(inferTarget({ text: 'Select row 8, the totals.' }), 'A8:Z8');
  assert.equal(inferTarget({ text: 'Select column D.' }), 'D1:D100');
  assert.equal(inferTarget({ text: 'Walk the tabs to the end and back.' }), null);
  assert.equal(inferTarget({ text: 'Go to A1', target: 'F61' }), 'F61', 'an explicit target wins');
  assert.equal(inferTarget(null), null);
});

test('cues: cellsOf expands a ref or range and caps; altPath reads the KeyTip letters', () => {
  assert.deepEqual(cellsOf('B3'), [[3, 2]]);
  assert.equal(cellsOf('A1:C2').length, 6);
  assert.equal(cellsOf('A1:Z100').length, 240, 'capped');
  assert.deepEqual(cellsOf('nope'), []);
  assert.deepEqual(altPath('Alt H O R "Inputs" ↵'), ['H', 'O', 'R']);
  assert.deepEqual(altPath('Ctrl+PgUp ×2 then Alt H O R "Inputs" ↵'), ['H', 'O', 'R']);
  assert.deepEqual(altPath('Alt W V G'), ['W', 'V', 'G']);
  assert.deepEqual(altPath('Alt H F D S O ↵'), ['H', 'F', 'D', 'S', 'O']);
  assert.deepEqual(altPath('Ctrl+1'), []);
  assert.deepEqual(altPath(''), []);
});

test('beats: once per module, on its first lesson, never on a challenge; every built module has one', () => {
  const first = LESSONS.find(l => l.id === 'inherited-workbook');
  const at = moduleOf(first);
  const b = beatFor(first, at, []);
  assert.ok(b && b.id === 'open-and-set-up' && b.title && b.body);
  assert.equal(beatFor(first, at, ['open-and-set-up']), null, 'seen already');
  const second = LESSONS.find(l => l.id === 'ribbon-by-keyboard');
  assert.equal(beatFor(second, moduleOf(second), []), null, 'not the module’s first lesson');
  const ch = LESSONS.find(l => l.id === 'challenge-inherited-file');
  assert.equal(beatFor(ch, moduleOf(ch), []), null);
  for (const l of LESSONS) { const m = moduleOf(l); if (m && m.n === 1 && l.kind !== 'challenge') assert.ok(MODULE_BEATS[l.module], 'a beat for ' + l.module); }
  assert.match(pageDelivered(at), /^Page 1\.1 — Open and set up — delivered/);
  for (const k in MODULE_BEATS) for (const s of [MODULE_BEATS[k].title, MODULE_BEATS[k].body]) assert.doesNotMatch(s, /colour|practis|organis|centre|grey\b/i, 'American spelling in ' + k);
});

test('install: offered once, after the second lesson, only when the browser can install', () => {
  assert.equal(shouldOfferInstall({ installPromptAt: 0 }, 1, true), false);
  assert.equal(shouldOfferInstall({ installPromptAt: 0 }, 2, true), true);
  assert.equal(shouldOfferInstall({ installPromptAt: 0 }, 5, true), true);
  assert.equal(shouldOfferInstall({ installPromptAt: 1 }, 5, true), false, 'shown before');
  assert.equal(shouldOfferInstall({ installPromptAt: 0 }, 5, false), false, 'no prompt available');
  assert.equal(shouldOfferInstall(null, 5, true), false);
});

test('result card: efficiency, the day, and the card carries tier, time, keys, board, date and mark', () => {
  assert.equal(efficiency(26, 26), 100);
  assert.equal(efficiency(52, 26), 50);
  assert.equal(efficiency(20, 26), 100, 'better than the reference is 100');
  assert.equal(efficiency(null, 26), null);
  assert.equal(prettyDay('2026-09-23'), 'Wed, Sep 23, 2026');
  const html = dailyCardHtml({ day: '2026-09-23', title: 'Go anywhere', secs: 38.42, tier: 'legendary', keys: 27, refKeys: 26, pos: 3, of: 41, attempts: 2, clean: true, handle: 'wolf' });
  for (const s of ['dc-legendary', '38.42', '◆◆◆', 'Legendary', '27', '/ 26', '96%', '#3', 'of 41', 'Sep 23, 2026', '@wolf']) assert.ok(html.includes(s), s);
  const assisted = dailyCardHtml({ day: '2026-09-23', title: 'x', secs: 10, tier: 'pass', keys: 5, refKeys: 5, clean: false });
  assert.ok(assisted.includes('dc-none') && assisted.includes('assisted'), 'an assisted run carries no tier');
  assert.ok(dailyCardHtml({ title: '<b>' }).includes('&lt;b&gt;'), 'escaped');
});

test('first run: three briefing cards, the orientation names the five places and level/XP, American spelling, steps', () => {
  assert.equal(BRIEFING.length, 3);
  assert.deepEqual(BRIEFING.map(b => b.key), ['who', 'sent', 'deliver']);
  const all = [...BRIEFING.flatMap(b => [b.title, ...b.body]), ORIENTATION.title, ...ORIENTATION.rows.flatMap(r => [r.where, r.what]), ORIENTATION.fine];
  for (const s of all) assert.doesNotMatch(s, /colour|practis|organis|centre|grey\b|analyse/i, 'American spelling: ' + s.slice(0, 40));
  const orient = ORIENTATION.rows.map(r => r.what).join(' ');
  for (const w of ['Lessons', 'challenge', 'Drills', 'rapid-fire', 'the Daily', 'Boards', 'XP', 'level']) assert.ok(orient.includes(w), w);
  assert.deepEqual(ORIENTATION.rows.map(r => r.where), ['Learn', 'Practice', 'Leaderboard', 'Level']);
  assert.deepEqual(stepsFor(false), ['demo', 'who', 'sent', 'deliver', 'orient', 'picker']);
  assert.deepEqual(stepsFor(true), ['picker']);
});

test('landing: the headline and its two alternates, the subhead, six modes, a Sign in, Enter starts', () => {
  assert.equal(HEADLINES.length, 3);
  assert.equal(HEADLINES[0].a + ' ' + HEADLINES[0].b, 'You don’t learn Excel by watching. You learn it by doing it again.');
  assert.equal(SUBHEAD, 'Learn Excel the way analysts are taught — on a real sheet, one job at a time.');
  assert.deepEqual(MODES.map(m => m.key), ['lesson', 'challenge', 'drill', 'daily', 'rapid', 'boards']);
  const html = landingHtml(0);
  assert.ok(html.includes('id="ldSignIn"') && html.includes('href="#/account"'));
  assert.ok(html.includes('clips/lesson.webm') && html.includes('poster="./clips/boards.jpg"'));
  assert.ok(landingHtml(2).includes('Nobody learned Excel from a video.'));
  assert.ok(landingHtml(99).includes('Nobody learned'), 'clamped');
  for (const m of MODES) assert.doesNotMatch(m.line, /colour|practis|organis|centre/i);
});

test('demo: the self-playing lesson completes on its own script and lasts about twenty seconds', () => {
  const run = new LessonRun(DEMO_LESSON, { mode: 'guided' });
  run.run(DEMO_LESSON.solution);
  assert.ok(run.finished, 'the demo lesson completes on its solution');
  const script = demoScript(DEMO_LESSON);
  const keys = script.filter(s => s.spec || s.text).length;
  const ms = script.reduce((a, s) => a + (s.wait || 0), 0);
  assert.equal(keys, 12);
  assert.ok(ms >= 15000 && ms <= 25000, 'about twenty seconds: ' + ms);
  // the script's keys replay to the same finished state
  const run2 = new LessonRun(DEMO_LESSON, { mode: 'guided' });
  for (const s of script) if (s.spec) run2.pressSpec(s.spec);
  assert.ok(run2.finished);
});

test('deal strip: six stages, the first free; the state counts modules from progress', () => {
  assert.equal(STAGES.length, 6);
  assert.equal(STAGES[0].access, 'free');
  assert.ok(STAGES.every(s => s.stage && s.sends && s.delivers && s.modules > 0));
  const d0 = dealState({});
  assert.equal(d0.done, 0); assert.equal(d0.stage.n, 1); assert.equal(d0.planned, 7);
  assert.equal(PLANNED_MODULES.length, 7 + 1, 'the Welcome plus seven modules');
});

test('telemetry: the three new events exist', () => {
  for (const e of ['landing_demo', 'briefing_done', 'install_prompt']) assert.ok(EVENTS.includes(e), e);
});
