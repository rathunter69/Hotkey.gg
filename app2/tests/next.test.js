// The experience pass (2026-09-23): the pure parts of the flag, the cues, the story beats, the
// install offer, the Daily result card, the first-run copy and the demo script.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flowFromQuery, flowOn, DEFAULT_ON } from '../app/flow.js';
import { inferTarget, altPath, cellsOf, rangeBox, rangeCorners, placeNear, SIDES, rangesOf, targetParts, coverage, unionBox } from '../ui/cues.js';
import { beatFor, MODULE_BEATS, pageDelivered } from '../app/beats.js';
import { shouldOfferInstall } from '../app/install.js';
import { dailyCardHtml, efficiency, prettyDay } from '../ui/result-card.js';
import { BRIEFING, ORIENTATION, stepsFor, FIRST_LESSON } from '../app/first-run-next.js';
import { HEADLINES, SUBHEAD, MODES, landingHtml } from '../app/landing-next.js';
import { DEMO_LESSON, demoScript } from '../ui/demo-player.js';
import { STAGES, dealState } from '../app/deal-strip.js';
import { PLANNED_MODULES } from '../app/learn-next.js';
import { LessonRun } from '../app/runner.js';
import { parseRoute, titleFor, navKeyFor } from '../app/main.js';
import { LESSONS, moduleOf } from '../content/index.js';
import { EVENTS } from '../app/telemetry.js';

test('flow: the flag is off by default, ?flow=next turns it on, ?flow=off turns it off', () => {
  assert.equal(DEFAULT_ON, true);
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
  assert.deepEqual(inferTarget({ text: 'On Costs, land on the Domain total E4 and read =B4+C4+D4 in the formula bar.' }, ['Raw', 'Costs']), { sheet: 'Costs', ref: 'E4' }, 'a quoted formula is not a target; the sheet named in passing qualifies the cell');
  assert.equal(inferTarget({ text: 'Jump to the feed’s last date with Ctrl+↓ — the Name Box now reads A61.' }, ['Raw', 'Costs']), 'A61');
  assert.equal(inferTarget(null), null);
});

test('cues (C2): whole columns, lists of cells, sheets reached in passing, and sheet tabs', () => {
  const S = ['Raw', 'Sheet2', 'Old wk37', 'Costs'];
  // a whole-column span, however it is written
  assert.equal(inferTarget({ text: 'Select A:A with Ctrl+Space.' }), 'A1:A100');
  assert.equal(inferTarget({ text: 'Hide D:F, the working columns.' }), 'D1:F100');
  assert.equal(inferTarget({ text: 'Hide rows 3–5 for now.' }), 'A3:Z5');
  // a list named together is one target of several ranges (one outline each); a route's destination still wins
  assert.equal(inferTarget({ text: 'Color the typed inputs B5 and B6 blue.' }), 'B5,B6');
  assert.equal(inferTarget({ text: 'Mark B5, B7 and D6:D8 blue.' }), 'B5,B7,D6:D8');
  assert.equal(inferTarget({ text: 'Copy it from B9 to B13, then fill it right across B13:G13 with Ctrl+R.' }), 'B13:G13');
  assert.deepEqual(rangesOf('B5,B7, D6:D8'), ['B5', 'B7', 'D6:D8']);
  // the sheet reached before the reference qualifies it — the Costs table in 1.1.1 — but a possessive does not
  assert.deepEqual(inferTarget({ text: 'Walk the tabs to Costs and land on the Domain total E4: the formula bar shows =B4+C4+D4.' }, S), { sheet: 'Costs', ref: 'E4' });
  assert.equal(inferTarget({ text: 'Copy Raw’s total row I13:K13 and paste it onto C10.' }, S), 'C10');
  assert.deepEqual(inferTarget({ text: 'Read Costs!B7 now.' }, S), { sheet: 'Costs', ref: 'B7' }, 'a word before the sheet is not part of its name');
  // no cell: the sheet the goal ends on is the target, cued on its tab
  assert.deepEqual(inferTarget({ text: 'Sheet2 is the associate’s inputs scratch — go there and rename it Inputs.' }, S), { sheet: 'Sheet2', tab: true });
  assert.deepEqual(inferTarget({ text: 'Old wk37 is a dead half-export — delete it and confirm.' }, S), { sheet: 'Old wk37', tab: true });
  assert.deepEqual(inferTarget({ text: 'Warm up the tab keys: Ctrl+PgDn to Costs at the end, Ctrl+PgUp back to Raw.' }, S), { sheet: 'Raw', tab: true });
  assert.equal(inferTarget({ text: 'Walk to the View tab with Alt, W.' }, S), null, 'a Ribbon tab is not a sheet');
  assert.deepEqual(targetParts({ sheet: 'Raw', tab: true }), { sheet: 'Raw', ref: null, tab: true });
  assert.deepEqual(targetParts('B5,B6'), { sheet: null, ref: 'B5,B6', tab: false });
  assert.deepEqual(unionBox([{ left: 0, top: 0, width: 10, height: 10 }, { left: 20, top: 30, width: 10, height: 10 }]), { left: 0, top: 0, width: 30, height: 40 });
  assert.equal(unionBox([]), null);
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
  assert.match(pageDelivered(at), /^Page 1\.1 — The workbook, set up to standard — delivered/);
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
  for (const w of ['Lessons', 'challenge', 'Drills', 'rapid-fire', 'the Daily', 'board', 'XP', 'level']) assert.ok(orient.includes(w), w);
  assert.deepEqual(ORIENTATION.rows.map(r => r.where), ['Learn', 'Practice', 'Leaderboard', 'Level']);
  assert.deepEqual(stepsFor(false), ['demo', 'orient', 'who', 'sent', 'deliver', 'picker']);
  assert.equal(FIRST_LESSON, 'inherited-workbook', 'the first run hands off to 1.1.1');
  // B3: plain sentences; any jargon is defined in the same breath; nobody is required to be an analyst
  const joined = BRIEFING.flatMap(b => [b.title, ...b.body]).join(' ');
  assert.ok(/data room: the folder buyers will read/.test(joined), 'the data room is defined where it appears');
  assert.doesNotMatch(joined, /house style|VDR|sell-side|first-year/i);
  for (const p of BRIEFING.flatMap(b => b.body)) for (const sentence of p.split(/(?<=[.!?])\s+/)) assert.ok(sentence.split(' ').length <= 30, 'short sentence: ' + sentence);
  assert.deepEqual(stepsFor(true), ['picker']);
});

test('landing: the headline and its two alternates, the subhead, six modes, a Sign in, Enter starts', () => {
  assert.equal(HEADLINES.length, 3);
  assert.equal(HEADLINES[0].a + ' ' + HEADLINES[0].b, 'Excel isn’t learned. It’s practiced.');
  assert.equal(HEADLINES[1].a, 'You don’t learn Excel by watching.');
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
  assert.equal(d0.done, 0); assert.equal(d0.stage.n, 1); assert.equal(d0.planned, 8, 'seven modules plus Project and assessment');
  assert.equal(PLANNED_MODULES.length, 7, 'seven modules; the Welcome is retired');
});

test('telemetry: the three new events exist', () => {
  for (const e of ['landing_demo', 'briefing_done', 'install_prompt']) assert.ok(EVENTS.includes(e), e);
});

test('cues (B7): the pulse is one box around the range perimeter, from its corner cells', () => {
  assert.deepEqual(rangeCorners('B3'), ['B3', 'B3']);
  assert.deepEqual(rangeCorners('E1:E60'), ['E1', 'E60']);
  assert.equal(rangeCorners('nope'), null);
  const a = { left: 100, top: 20, width: 64, height: 20 }, b = { left: 228, top: 120, width: 64, height: 20 };
  assert.deepEqual(rangeBox(a, b), { left: 100, top: 20, width: 192, height: 120 });
  assert.deepEqual(rangeBox(a, null), a);
  assert.deepEqual(rangeBox(null, null), null);
});

test('placeNear: the card sits beside the target, a cell or two away, on the first side that fits', () => {
  const box = { w: 1000, h: 600, x0: 40, y0: 22 }, panel = { w: 380, h: 260 };
  const cell = (left, top, width = 64, height = 20) => ({ left, top, width, height });
  const clear = (r, t) => r.left >= t.left + t.width || r.left + r.width <= t.left || r.top >= t.top + t.height || r.top + r.height <= t.top;
  const inside = r => r.left >= box.x0 && r.top >= box.y0 && r.left + r.width <= box.w - 12 && r.top + r.height <= box.h - 12;
  assert.deepEqual(SIDES, ['right', 'below', 'left', 'above']);
  // left edge (A5): right of it, one and a half cells away, top-aligned
  const a5 = cell(40, 102); const p1 = placeNear(box, a5, panel);
  assert.equal(p1.side, 'right'); assert.equal(p1.rect.left, 40 + 64 + 96); assert.equal(p1.rect.top, 102);
  // right edge (a cell at the box's far right): no room right → below, pulled in so it stays on screen
  const far = cell(900, 122); const p2 = placeNear(box, far, panel);
  assert.equal(p2.side, 'below'); assert.equal(p2.rect.top, 122 + 20 + 40); assert.equal(p2.rect.left, 1000 - 12 - 380);
  // bottom right corner: no room right or below → left of it, its top clamped to the box
  const br = cell(900, 560); const p3 = placeNear(box, br, panel);
  assert.equal(p3.side, 'left'); assert.equal(p3.rect.left, 900 - 96 - 380); assert.equal(p3.rect.top, 600 - 12 - 260);
  // a wide block along the bottom (a whole row, scrolled to the bottom): only above fits
  const row = cell(40, 560, 960, 20); const p4 = placeNear(box, row, panel);
  assert.equal(p4.side, 'above'); assert.equal(p4.rect.top, 560 - 40 - 260);
  // top edge, mid-sheet (C1): right of it
  const c1 = cell(168, 22); assert.equal(placeNear(box, c1, panel).side, 'right');
  // a whole column down the left (A1:A100 selected): right of it
  const colA = cell(40, 22, 64, 578); const p5 = placeNear(box, colA, panel);
  assert.equal(p5.side, 'right'); assert.ok(clear(p5.rect, colA));
  // every edge case: never over the target, the headers, or the box's far edges
  for (const [name, t, p] of [['A5', a5, p1], ['far right', far, p2], ['bottom right', br, p3], ['bottom row', row, p4], ['column A', colA, p5]]) {
    assert.ok(clear(p.rect, t), name + ': the card is clear of the target'); assert.ok(inside(p.rect), name + ': the card is inside the data area');
  }
  // the target fills the view: nothing fits beside it, so the farthest corner, still inside the data area
  const all = cell(40, 22, 960, 578); const p6 = placeNear(box, all, panel);
  assert.equal(p6.side, 'free'); assert.ok(inside(p6.rect));
  // a target scrolled wholly out of the box is no target: the card stays where it was
  const keep = { side: 'below', rect: { left: 300, top: 300, width: 380, height: 260 } };
  const kept = placeNear(box, cell(-200, -100), panel, { keep });
  assert.deepEqual({ side: kept.side, rect: kept.rect }, keep);
  assert.equal(placeNear(box, null, panel).side, 'free');
  assert.deepEqual(placeNear(box, null, panel).rect, { left: 1000 - 12 - 380, top: 22 + 12, width: 380, height: 260 }, 'no target, nothing kept: top right of the data area');
  // Ctrl+Shift+J asks for a side first; one that does not fit falls through
  assert.equal(placeNear(box, a5, panel, { prefer: ['below'] }).side, 'below');
  assert.equal(placeNear(box, a5, panel, { prefer: ['left'] }).side, 'right', 'left of A5 does not fit: the next side that does');
  // a Ribbon goal: under the bar, beside the glowing group
  const rb = placeNear(box, null, panel, { ribbon: { left: 200, right: 320 } });
  assert.equal(rb.side, 'ribbon'); assert.equal(rb.rect.left, 336); assert.equal(rb.rect.top, 22 + 12);
  const rbFar = placeNear(box, null, panel, { ribbon: { left: 800, right: 950 } });
  assert.equal(rbFar.rect.left, 800 - 16 - 380, 'no room right of the group: left of it');
  // a tight box: the full gap does not fit on any side, the one-cell gap right of the target does
  const tight = placeNear({ w: 1020, h: 559, x0: 40, y0: 22 }, cell(448, 220, 104, 20), { w: 380, h: 334 });
  assert.equal(tight.side, 'right'); assert.equal(tight.rect.left, 448 + 104 + 64);
  // what the learner is reading (C2): with every side open, the card takes the one over the fewest filled cells
  const sideTable = []; for (let r = 0; r < 8; r++) for (let c = 0; c < 5; c++) sideTable.push(cell(600 + c * 64, 102 + r * 20));
  const e5 = cell(168, 102);
  const p7 = placeNear(box, e5, panel, { obstacles: sideTable });
  assert.equal(p7.side, 'below', 'right of the target would cover the side table: below covers nothing');
  assert.equal(p7.covers, 0);
  assert.equal(coverage(p7.rect, sideTable), 0);
  assert.equal(placeNear(box, e5, panel).side, 'right', 'no content given: right, as before');
  assert.equal(placeNear(box, e5, panel, { obstacles: sideTable, prefer: ['right'] }).side, 'right', 'Ctrl+Shift+J wins over coverage');
  // no target: the corner over the least content, or where the card already is when that is as good
  const feed = []; for (let r = 0; r < 25; r++) for (let c = 0; c < 6; c++) feed.push(cell(40 + c * 64, 22 + r * 20));
  const free = placeNear(box, null, panel, { obstacles: feed });
  assert.equal(free.covers, 0); assert.ok(free.rect.left >= 40 + 6 * 64, 'the card sits clear of the feed');
  const stay = { side: 'free', rect: { left: 600, top: 60, width: 380, height: 260 } };
  assert.deepEqual(placeNear(box, null, panel, { obstacles: feed, keep: stay }).rect, stay.rect, 'as good as any corner: it stays');
  // a Ribbon goal: beside the glowing control, on the side that covers less
  const rbSide = placeNear(box, null, panel, { ribbon: { left: 500, right: 560 }, obstacles: [cell(600, 60, 300, 200)] });
  assert.equal(rbSide.side, 'ribbon'); assert.equal(rbSide.rect.left, 500 - 16 - 380, 'the right side is covered: left of the control');
  // hard obstacles (C2): the active cell and an open dialog are never covered when any place avoids them
  const active = cell(700, 102);   // right of e5 at the full gap would cover this cell
  const h1 = placeNear(box, e5, panel, { hard: [active] });
  assert.notEqual(h1.side, 'right'); assert.equal(coverage(h1.rect, [active]), 0);
  const dialog = { left: 560, top: 60, width: 300, height: 200 };   // a dialog where the top-right corner would put the card
  const h2 = placeNear(box, null, panel, { hard: [dialog] });
  assert.equal(coverage(h2.rect, [dialog]), 0, 'no target: a corner clear of the dialog');
  // the kept place is re-derived at the card's current size: a taller card is pulled up so its footer stays inside
  const tall = placeNear(box, null, { w: 380, h: 420 }, { keep: { side: 'free', rect: { left: 600, top: 300, width: 380, height: 200 } } });
  assert.ok(tall.rect.top + tall.rect.height <= box.h - 12 + 1e-9, 'the whole card fits');
  // a small box: the card shrinks to the data area and stays inside
  const small = placeNear({ w: 420, h: 300, x0: 40, y0: 22 }, cell(100, 100), { w: 380, h: 260 });
  assert.ok(small.rect.width <= 420 - 40 - 12 && small.rect.height <= 300 - 22 - 12);
});
