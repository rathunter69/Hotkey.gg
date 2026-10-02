// app2/tests/rapid-deck.test.js — rapid-fire's deck (screenplay 6.5, M100): every prompt, on a run
// of seeded fragments, fails on the fresh fragment, passes once its reference chord is pressed, and
// keeps its target inside the window the stage draws. The prompt is graded on the fragment's end
// state, so the test also plays a second route where the course teaches one.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RAPID_DECK, RAPID_BY_ID, buildFrag, fragSession, chordScript, deckFor, atRest, startsAtRest, stateSig, FRAG_ROWS, FRAG_COLS, DECK_CHAPTERS } from '../content/rapid-deck.js';
import { parseRange } from '../engine/refs.js';
import { COPY } from '../content/copy/index.js';

const SEEDS = [1, 2, 3, 7, 42, 99, 1234, 777777];

test('the deck: about a hundred commands, ids unique, every chapter that teaches a key represented', () => {
  assert.ok(RAPID_DECK.length >= 95, `the deck has ${RAPID_DECK.length} prompts`);
  const ids = RAPID_DECK.map(p => p.id);
  assert.equal(new Set(ids).size, ids.length, 'prompt ids unique');
  assert.deepEqual(DECK_CHAPTERS, [1, 2, 3, 4]);
  assert.ok(deckFor(1).every(p => p.ch === 1));
  assert.equal(deckFor(6).length, RAPID_DECK.length);
  assert.ok(deckFor(1).length >= 60, 'Chapter 1 alone carries most of the deck');
});

test('every prompt names the command in Excel’s words, never the key, and has its line in the copy sheet', () => {
  for (const p of RAPID_DECK) {
    const line = COPY.site['rapid_cmd_' + p.id];
    assert.ok(line && line.trim(), `site.csv carries rapid_cmd_${p.id}`);
    assert.doesNotMatch(line, /\b(Ctrl|Alt|Shift|F\d)\b|[+↑↓←→↵]/, `${p.id}: the prompt names a key: ${line}`);
    assert.doesNotMatch(line, / - | – | — /, `${p.id}: a dash as punctuation`);
  }
});

for (const p of RAPID_DECK) {
  test(`${p.id}: the reference chord passes on every seeded fragment, and nothing passes before it`, () => {
    const seen = new Set();
    for (const seed of SEEDS) {
      const f = buildFrag(p.id, seed);
      seen.add(JSON.stringify(f.cells));
      const g = parseRange(f.target);
      assert.ok(g && g.r1 >= 1 && g.c1 >= 1 && g.r2 <= FRAG_ROWS && g.c2 <= FRAG_COLS, `${p.id} seed ${seed}: target ${f.target} outside the window`);
      const s = fragSession(f);
      assert.equal(p.check(s, f), false, `${p.id} seed ${seed}: passes before any key`);
      assert.equal(atRest(s), startsAtRest(f), `${p.id} seed ${seed}: the fragment starts in Ready unless it opens inside an entry`);
      const sig = stateSig(s);
      s.run(chordScript(p.keys));
      assert.ok(p.check(s, f), `${p.id} seed ${seed}: ${p.keys} does not pass (selection ${s.sheet.selectionText()}, dialog ${s.dialog}, mode ${s.mode})`);
      assert.ok(s.keyLog.length > 0, `${p.id}: the chord reached the engine`);
      if (atRest(s) && !['go-home'].includes(p.id)) assert.notEqual(stateSig(s), sig, `${p.id}: the chord changed nothing the stage can show`);
    }
    assert.ok(seen.size >= SEEDS.length - 2, `${p.id}: the fragments barely vary (${seen.size} distinct of ${SEEDS.length})`);
  });
}

// any legitimate route passes: the grader reads the sheet, never the keystroke
const OTHER_ROUTES = {
  bold: 'Alt H 1', italic: 'Alt H 2', underline: 'Alt H 3', 'insert-row': 'Alt H I R', 'delete-row': 'Alt H D R',
  'format-cells': 'Alt H O E', 'go-to': 'Alt H F D G', 'select-region': 'Ctrl+Shift+Space', 'paste-values': 'Alt H V V', 'autosum': 'Alt H U S',
  'hide-rows': 'Ctrl+9', 'group-rows': 'Alt A G G', 'sort-ascending': 'Alt A S A', 'replace': 'Alt H F D R', 'find': 'Alt H F D F',
};
test('a second route passes where the course teaches one', () => {
  for (const [id, route] of Object.entries(OTHER_ROUTES)) {
    const p = RAPID_BY_ID[id]; assert.ok(p, id);
    const f = buildFrag(id, 5);
    const s = fragSession(f);
    s.run(chordScript(route));
    assert.ok(p.check(s, f), `${id}: ${route} should pass too`);
  }
});

test('a wrong chord leaves the fragment changed and failing, so the stage can call it', () => {
  const f = buildFrag('bold', 3);
  const s = fragSession(f);
  const sig = stateSig(s);
  s.run('Ctrl+I');
  assert.ok(atRest(s));
  assert.equal(RAPID_BY_ID.bold.check(s, f), false);
  assert.notEqual(stateSig(s), sig);
  // Alt then Esc walks into the Ribbon and back: nothing changed, so it is not a miss
  const s2 = fragSession(f); const sig2 = stateSig(s2);
  s2.run('Alt Esc');
  assert.ok(atRest(s2)); assert.equal(stateSig(s2), sig2);
});
