// The task card that points (M90): the placement engine over every registered lesson's goals (the
// card never covers its target, the selection or a note, and always sits inside the sheet box), the
// keys that answer (routeTokens, routeProgress, liveLine), and the card's copy held to the tells.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LESSONS } from '../content/index.js';
import { LessonRun } from '../app/runner.js';
import { inferTarget, targetParts, rangesOf } from '../ui/cues.js';
import { placeCard, rangeRect, routeTokens, routeProgress, liveLine, normKey, CARD_W, CARD_GAP, CARD_PAD, SIDES, DOCKS, HELP_ITEMS } from '../ui/components/task-card.js';
import { notePlace } from '../ui/components/sheet-marks.js';
import { COPY } from '../content/copy/index.js';
import { tells } from '../content/copy/tells.js';

const overlaps = (a, b) => !!a && !!b && a.left < b.left + b.width && a.left + a.width > b.left && a.top < b.top + b.height && a.top + a.height > b.top;
const inside = (r, box) => r.left >= box.x0 - 1e-9 && r.top >= box.y0 - 1e-9 && r.left + r.width <= box.w + 1e-9 && r.top + r.height <= box.h + 1e-9;
const BOX = { w: 1400, h: 680, x0: 36, y0: 20 };    // a 1440 by 900 window: the sheet box under the tab row, the Ribbon, the toolbar row and the formula bar
const CARD = { w: CARD_W, h: 236 };

/* ---------------- placement, every lesson's goals ---------------- */

test('placeCard over every registered lesson: inside the box, never over the target, the selection or a note', () => {
  let goals = 0, pointed = 0, docked = 0;
  for (const lesson of LESSONS) {
    if (!Array.isArray(lesson.goals) || !lesson.goals.length) continue;
    let run;
    try { run = new LessonRun(lesson, { now: () => 0, calculate: false }); } catch (e) { continue; }   // laid out, not calculated: the layout places the card (a lesson mid-rewrite grades itself in lessons.test.js)
    const names = run.session.sheets.map(x => x.name);
    const sheetBy = n => { const e = run.session.sheets.find(x => x.name === n) || run.session.sheets[0]; return e.sheet; };
    const rectOf = (ref, sheet) => rangeRect(ref, { colW: c => sheet.colW[c] || 64, rowH: r => sheet.rowH[r] || 20, x0: BOX.x0, y0: BOX.y0 });
    let prev = null;   // the previous goal's target stands in for the selection the learner left there
    lesson.goals.forEach((goal, i) => {
      goals++;
      const target = inferTarget(goal, names);
      const { sheet, ref, tab } = targetParts(target);
      const sh = sheetBy(sheet || names[0]);
      const first = rangesOf(ref)[0];
      const content = ref && !tab ? rectOf(first, sh) : null;
      // the box scrolled so the target shows (the sticky headers stay)
      let sl = 0, st = 0;
      if (content) {
        if (content.left + content.width > BOX.w - CARD_PAD) sl = Math.max(0, content.left - BOX.x0 - 40);
        if (content.top + content.height > BOX.h - CARD_PAD) st = Math.max(0, content.top - BOX.y0 - 40);
      }
      const shift = r => (r ? { left: r.left - sl, top: r.top - st, width: r.width, height: r.height } : null);
      const t = shift(content);
      const avoid = [];
      const selRect = shift(prev || rectOf(sh.selectionText ? sh.selectionText() : 'A1', sh));
      if (selRect && selRect.width * selRect.height < 0.3 * BOX.w * BOX.h) avoid.push(selRect);
      let note = null;
      if (goal.note && content) {
        const cell = shift(rectOf(first.split(':')[0], sh));
        note = notePlace(cell, { w: BOX.w, h: BOX.h, x0: BOX.x0, y0: BOX.y0, scrollLeft: 0, scrollTop: 0 }, { w: 240, h: 44 });
        avoid.push(note);
      }
      const p = placeCard(BOX, t, CARD, { avoid });
      const where = `${lesson.id} goal ${i} (${goal.id || ''}, target ${JSON.stringify(target)})`;
      assert.ok(inside(p.rect, BOX), `${where}: the card sits inside the sheet box: ${JSON.stringify(p.rect)}`);
      assert.ok(SIDES.includes(p.side) || p.side === 'dock', where + ': a known side');
      if (t) {
        const clipped = { left: Math.max(BOX.x0, t.left), top: Math.max(BOX.y0, t.top), width: Math.min(BOX.w, t.left + t.width) - Math.max(BOX.x0, t.left), height: Math.min(BOX.h, t.top + t.height) - Math.max(BOX.y0, t.top) };
        const huge = clipped.width * clipped.height >= 0.5 * (BOX.w - BOX.x0) * (BOX.h - BOX.y0);   // a target that is most of the box is a region, not a thing to point at
        if (!huge) {
          assert.ok(!overlaps(p.rect, clipped), `${where}: the card never covers its target`);
          assert.ok(!p.covers, `${where}: something was clear`);
        }
        if (p.side !== 'dock') { pointed++; assert.ok(p.pointer && p.pointer.at >= 16, where + ': the pointer sits on the edge facing the target'); }
        else docked++;
      } else assert.equal(p.side, 'dock', where + ': no target on the sheet docks the card');
      for (const a of avoid) assert.ok(!overlaps(p.rect, a), `${where}: the card never covers the selection or a note`);
      if (note) assert.ok(!overlaps(p.rect, note), `${where}: the card keeps off the note`);
      prev = content;
    });
  }
  assert.ok(goals > 50, 'the registered lessons carry goals (' + goals + ')');
  assert.ok(pointed > docked, `most goals get a pointed card (${pointed} pointed, ${docked} docked)`);
});

test('placeCard: the side with the most room wins; the setting side wins when it fits; the dock when nothing is clear', () => {
  const box = { w: 1000, h: 600, x0: 36, y0: 20 };
  const t = { left: 100, top: 100, width: 80, height: 20 };
  const right = placeCard(box, t, CARD, {});
  assert.equal(right.side, 'right'); assert.equal(right.rect.left, t.left + t.width + CARD_GAP); assert.equal(right.pointer.edge, 'left');
  const far = placeCard(box, { left: 800, top: 100, width: 80, height: 20 }, CARD, {});
  assert.equal(far.side, 'left'); assert.equal(far.pointer.edge, 'right');
  const asked = placeCard(box, t, CARD, { prefer: 'below' });
  assert.equal(asked.side, 'below'); assert.equal(asked.pointer.edge, 'top');
  const blocked = placeCard(box, t, CARD, { avoid: [{ left: 36, top: 20, width: 964, height: 580 }] });
  assert.equal(blocked.side, 'dock'); assert.equal(blocked.dock, 'bottom-right'); assert.equal(blocked.covers, true);
  const none = placeCard(box, null, CARD, {});
  assert.equal(none.side, 'dock'); assert.equal(none.pointer, null); assert.equal(none.rect.left, box.w - CARD_PAD - CARD.w);
  assert.deepEqual(DOCKS[0], 'bottom-right');
});

test('rangeRect: a range from column widths and row heights', () => {
  const geom = { colW: () => 64, rowH: () => 20, x0: 36, y0: 20 };
  assert.deepEqual(rangeRect('A1', geom), { left: 36, top: 20, width: 64, height: 20 });
  assert.deepEqual(rangeRect('B5:D9', geom), { left: 100, top: 100, width: 192, height: 100 });
  assert.equal(rangeRect('nope', geom), null);
});

/* ---------------- the keys that answer ---------------- */

test('routeTokens: keys as the keycaps show them, text to type, connectives dropped, repeats expanded', () => {
  assert.deepEqual(routeTokens('Ctrl+Home then Ctrl+↓'), [{ key: 'Ctrl+Home' }, { key: 'Ctrl+↓' }]);
  assert.deepEqual(routeTokens('Shift+↑ ×2 then Ctrl+Shift+↑'), [{ key: 'Shift+↑' }, { key: 'Shift+↑' }, { key: 'Ctrl+Shift+↑' }]);
  assert.deepEqual(routeTokens('Alt H O R "Inputs" ↵'), [{ key: 'Alt' }, { key: 'H' }, { key: 'O' }, { key: 'R' }, { text: 'Inputs' }, { key: '↵' }]);
  assert.deepEqual(routeTokens('Ctrl+G "B25" Enter'), [{ key: 'Ctrl+G' }, { text: 'B25' }, { key: '↵' }]);
  assert.deepEqual(routeTokens(''), []);
  assert.equal(normKey('Ctrl+Down'), 'Ctrl+↓');
});

test('routeProgress: each key fills the next keycap; a wrong key resets the row; text fills by character', () => {
  const toks = routeTokens('Alt H A R');
  assert.deepEqual(routeProgress(toks, []), { matched: 0, chars: 0, wrong: null, next: toks[0], done: false });
  assert.equal(routeProgress(toks, ['Alt', 'H']).matched, 2);
  assert.equal(routeProgress(toks, ['Alt', 'H']).next.key, 'A');
  const wrong = routeProgress(toks, ['Alt', 'H', 'B']);
  assert.equal(wrong.matched, 0); assert.equal(wrong.wrong, 'B');
  assert.equal(routeProgress(toks, ['Alt', 'H', 'B', 'Alt']).matched, 1, 'the wrong key may start the route again');
  assert.equal(routeProgress(toks, [{ k: 'Alt' }, { k: 'H' }, { k: 'A' }, { k: 'R' }]).done, true);
  const typed = routeTokens('Ctrl+G "B25" ↵');
  const mid = routeProgress(typed, ['Ctrl+G', 'B', '2']);
  assert.equal(mid.matched, 1); assert.equal(mid.chars, 2);
  assert.equal(routeProgress(typed, ['Ctrl+G', 'B', '2', '5', '↵']).done, true);
  const folded = routeProgress(toks, ['Alt', 'H', 'Ctrl+F1']);
  assert.equal(folded.matched, 2); assert.equal(folded.wrong, null, 'folding the Ribbon is never a wrong key');
});

test('liveLine: the one line under the keys', () => {
  const toks = routeTokens('Alt H A R');
  assert.equal(liveLine(routeProgress(toks, []), toks, 'win'), 'Press Alt.');
  assert.equal(liveLine(routeProgress(toks, ['Alt']), toks, 'win'), 'One key in. Press H.');
  assert.equal(liveLine(routeProgress(toks, ['Alt', 'H']), toks, 'win'), 'Two keys in. Press A.');
  assert.equal(liveLine(routeProgress(toks, ['Alt', 'H', 'B']), toks, 'win'), 'That was B. Start again with Alt.');
  assert.equal(liveLine(routeProgress(toks, ['Alt', 'H', 'A', 'R']), toks, 'win'), 'Every key is in.');
  assert.equal(liveLine(routeProgress(toks, ['Alt']), toks, 'mac'), 'One key in. Press H.');
  assert.equal(liveLine(routeProgress(toks, []), toks, 'mac'), 'Press ⌥.');
});

test('the card’s and the panel’s copy rows carry no tells', () => {
  const keys = Object.keys(COPY.site).filter(k => /^(ws_|more_|card_|panel_|tier_|restart_|dialog_)/.test(k));
  assert.ok(keys.length > 80, 'the workspace rows are in site.csv');
  for (const k of keys) {
    const text = COPY.site[k];
    const found = tells(text.replace(/\{\w+\}/g, 'x'));
    assert.deepEqual(found, [], `${k}: ${JSON.stringify(found)}`);
  }
  for (const it of HELP_ITEMS) assert.ok(COPY.site[it.copy] && COPY.site[it.noteCopy], it.id + ' has its rows');
});
