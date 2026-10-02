// The shortcut reference: every entry complete and unique, every category listed, every lesson link
// real, the Foundations shortcuts resolving to the lesson that teaches them, the Mac column derived
// by the old rule, the chord notation parsing, and the old reference's content all present.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { REFERENCE, CATEGORIES, CATEGORY_NOTES, ADDIN_DISCLAIMER, macChord, macNote, parseChord, referenceByChord, referenceById, lessonForConcept } from '../content/reference.js';
import { LESSONS, LESSONS_BY_ID, lessonNumber } from '../content/index.js';
import { CONCEPTS } from '../content/schema.js';
import { detectPlatform, chordHtml, searchText, REFERENCE_GROUPS, groupRows, keyState, collectedCount, taughtIn, KEY_STATES } from '../app/reference-page.js';
import { renderShortcutsIndex } from './public-pages.js';

const nonEmpty = v => typeof v === 'string' && v.trim().length > 0;

test('every entry has an id, name, what, category, win and mac', () => {
  assert.ok(REFERENCE.length >= 100, `expected the whole old reference, got ${REFERENCE.length} entries`);
  for (const e of REFERENCE) {
    for (const k of ['id', 'name', 'what', 'category', 'win', 'mac']) assert.ok(nonEmpty(e[k]), `${e.id || '?'}: ${k} is empty`);
    assert.match(e.id, /^[a-z0-9-]+$/, `${e.id}: id is kebab-case`);
    assert.ok(e.lessonId === null || typeof e.lessonId === 'string', `${e.id}: lessonId is a string or null`);
    assert.ok(e.concept === null || CONCEPTS[e.concept], `${e.id}: concept "${e.concept}" is in schema.js CONCEPTS`);
    assert.ok(typeof e.macNote === 'string' && typeof e.note === 'string', `${e.id}: note fields are strings`);
    assert.ok(e.addin === null || e.addin === 'Macabacus' || e.addin === 'FactSet', `${e.id}: addin flag`);
  }
});

test('ids are unique', () => {
  const ids = REFERENCE.map(e => e.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate ids: ' + ids.filter((x, i) => ids.indexOf(x) !== i).join(', '));
  assert.equal(referenceById('ctrl-b').win, 'Ctrl+B');
  assert.equal(referenceById('nope'), null);
});

test('every lessonId exists in the catalogue: the lesson the keys sheet names, else the one that teaches the concept (M50)', () => {
  for (const e of REFERENCE) {
    if (e.lessonId === null) { assert.equal(lessonForConcept(e.concept), null, `${e.id}: concept ${e.concept} is taught, lessonId should be set`); continue; }
    const lesson = LESSONS_BY_ID[e.lessonId];
    assert.ok(lesson, `${e.id}: lesson ${e.lessonId} is in the catalogue`);
    assert.ok(!lesson.kind || lesson.kind === 'lesson', `${e.id}: ${e.lessonId} is a lesson, not a challenge or a gate`);
    const teaches = e.concept && (lesson.teaches || lesson.concepts || []).includes(e.concept);
    const toks = s => String(s).replace(/↵/g, 'Enter').split(/\s+/).filter(Boolean);
    const want = toks(e.win);
    const SHIFTED = { '$': '4', '%': '5', '!': '1', '#': '3', '+': '=', '~': '`' };
    const alt = e.win.replace(/^Ctrl\+Shift\+(.)$/, (m, c) => 'Ctrl+Shift+' + (SHIFTED[c] || c));
    const presses = [want, toks(alt)].some(w => (lesson.goals || []).some(g => { const have = toks(g.keys || ''); for (let i = 0; i + w.length <= have.length; i++) if (w.every((x, j) => have[i + j] === x)) return true; return false; }));
    assert.ok(teaches || presses, `${e.id}: lesson ${e.lessonId} teaches "${e.concept}" or a goal of it presses ${e.win}`);
  }
});

test('every category is in CATEGORIES, in display order, and CATEGORIES has no empties', () => {
  assert.equal(new Set(CATEGORIES).size, CATEGORIES.length, 'categories are unique');
  for (const e of REFERENCE) assert.ok(CATEGORIES.includes(e.category), `${e.id}: category "${e.category}" is listed`);
  for (const c of CATEGORIES) assert.ok(REFERENCE.some(e => e.category === c), `category ${c} has entries`);
  const order = REFERENCE.map(e => CATEGORIES.indexOf(e.category));
  assert.ok(order.every((v, i) => i === 0 || v >= order[i - 1]), 'REFERENCE is grouped in CATEGORIES order');
  assert.equal(CATEGORIES[0], 'Navigation');
  for (const name of Object.keys(CATEGORY_NOTES)) assert.ok(CATEGORIES.includes(name));
});

test('the Foundations shortcuts resolve to the module lesson that teaches them', () => {
  // lessonId is derived: the first catalogue lesson whose teaches/concepts include the entry's concept
  const teacherOf = concept => { const l = LESSONS.find(x => (x.teaches || x.concepts || []).includes(concept)); return l ? l.id : null; };
  const expect = {
    'alt-h-b-o': 'fonts-fills-borders',          // borders-menu
    'ctrl-1': 'ribbon-by-keyboard',              // format-cells-dialog
    'ctrl-arrow': 'inherited-workbook',          // ctrl-arrow (1.1.1's opening goals)
    'ctrl-shift-arrow': 'know-the-screen',       // ctrl-shift-arrow (1.1.2's status bar read; the payoff pass moved it out of 1.1.1)
    'shift-space': 'select-like-you-mean-it',    // row-col-select
    'ctrl-space': 'select-like-you-mean-it',
    'ctrl-a': 'select-like-you-mean-it',         // ctrl-a
    'f2-edit': 'colour-label-hardcode',          // edit-mode-f2
  };
  for (const [id, lessonId] of Object.entries(expect)) {
    const e = referenceById(id);
    assert.ok(e, `${id} is in the reference`);
    assert.ok(LESSONS_BY_ID[lessonId] && typeof LESSONS_BY_ID[lessonId].module === 'string', `${lessonId} is a module lesson`);
    assert.equal(teacherOf(e.concept), lessonId, `${id}: the catalogue's first teacher of ${e.concept} is ${lessonId}`);
    assert.ok(e.lessonId, `${id} (${e.win}) links to a lesson`);
    assert.equal(e.lessonId, lessonId, `${id} (${e.win}) links to ${lessonId}`);
  }
  // the modules teach bold as bold-italic-underline: no lesson carries the bold-command concept, so the
  // keys sheet names the lesson whose goals first press Ctrl+B (M50); the Ribbon route links nowhere
  assert.equal(teacherOf('bold-command'), null);
  assert.equal(referenceById('ctrl-b').lessonId, 'fonts-fills-borders'); assert.equal(referenceById('alt-h-1').lessonId, null);
  // by chord too
  assert.equal(referenceByChord('Alt H B O')[0].lessonId, 'fonts-fills-borders');
  assert.equal(referenceByChord('ctrl + 1')[0].lessonId, 'ribbon-by-keyboard');
  assert.ok(REFERENCE.filter(e => e.lessonId).length >= 30, 'Foundations covers at least 30 rows');
});

test('the Mac column follows the swap rule behind the truth table', () => {
  assert.equal(macChord('Ctrl+B'), '⌘+B');
  assert.equal(macChord('Alt H B O'), '⌥ H B O');
  assert.equal(macChord('Ctrl+Shift+↓'), '⌘+⇧+↓');
  assert.equal(macChord('Shift+Alt+→'), '⇧+⌥+→');
  assert.equal(macChord('Ctrl+A Alt H O U O'), '⌘+A ⌥ H O U O');
  assert.equal(macChord('Enter'), 'Enter');
  // truth-table rows
  assert.equal(macChord('Ctrl+Space'), '⌃+Space'); assert.match(macNote('Ctrl+Space'), /Spotlight/);
  assert.equal(macChord('Alt+='), '⌘+⇧+T');
  assert.equal(macChord('F2'), '⌃+U');
  assert.equal(macChord('Ctrl+Shift++'), '⌃+⇧+=');
  assert.equal(macChord('Ctrl+Shift+$'), '⌃+⇧+$');
  assert.equal(macChord('Ctrl+Alt+V'), '⌃+⌘+V');
  assert.equal(macChord('Ctrl+H'), '⌃+H');
  // the audit would not stand behind these: Windows chord + "Mac: varies"
  assert.equal(macChord('Ctrl+9'), 'Ctrl+9'); assert.equal(macNote('Ctrl+9'), 'Mac: varies');
  assert.equal(macChord('Ctrl+Shift+L'), 'Ctrl+Shift+L');
  assert.equal(macNote('Ctrl+B'), '');
  // every entry's mac field is consistent with the rule
  for (const e of REFERENCE) {
    if (e.addin) { assert.equal(e.mac, e.win, `${e.id}: add-ins never translate`); assert.equal(e.macNote, 'Windows only'); assert.equal(e.lessonId, null); continue; }
    if (e.macNote === 'Mac: varies') assert.equal(e.mac, e.win, `${e.id}: varies rows keep the Windows chord`);
    else { assert.equal(e.mac, macChord(e.win), `${e.id}: mac derives from win`); assert.equal(e.macNote, macNote(e.win)); }
  }
  const repeat = referenceById('f4-repeat'); assert.equal(repeat.mac, 'F4'); assert.equal(repeat.macNote, 'Mac: varies');
});

test('the chord notation parses every entry', () => {
  assert.deepEqual(parseChord('Ctrl+↑/↓/←/→'), [[['Ctrl'], ['↑', '↓', '←', '→']]]);
  assert.deepEqual(parseChord('Alt H 1'), [[['Alt']], [['H']], [['1']]]);
  assert.deepEqual(parseChord('Ctrl+Shift++'), [[['Ctrl'], ['Shift'], ['+']]]);
  assert.deepEqual(parseChord('Ctrl+-'), [[['Ctrl'], ['-']]]);
  assert.deepEqual(parseChord('='), [[['=']]]);
  assert.deepEqual(parseChord('Ctrl+A Alt H O U O'), [[['Ctrl'], ['A']], [['Alt']], [['H']], [['O']], [['U']], [['O']]]);
  for (const e of REFERENCE) for (const chord of [e.win, e.mac]) {
    const segs = parseChord(chord);
    assert.ok(segs.length >= 1, `${e.id}: ${chord} has a segment`);
    for (const seg of segs) { assert.ok(seg.length >= 1); for (const key of seg) { assert.ok(key.length >= 1, `${e.id}: empty key in ${chord}`); for (const k of key) assert.ok(k.length > 0 && !/\s/.test(k), `${e.id}: key "${k}" in ${chord}`); } }
  }
});

test('every row of the old reference.html is here', () => {
  const old = ['↑/↓/←/→', 'Ctrl+↑/↓/←/→', 'Ctrl+Home', 'Ctrl+End', 'Tab', 'Enter', 'PageUp/PageDown', 'Ctrl+PageUp/PageDown',
    'Shift+↑/↓/←/→', 'Ctrl+Shift+↑/↓/←/→', 'Shift+Space', 'Ctrl+Space', 'Ctrl+Shift+Space', 'Ctrl+A', 'Ctrl+Shift+End',
    'F2', 'Ctrl+Enter', '=', 'Esc', 'Delete', 'Alt+Enter', 'F4',
    'Alt+=', 'Ctrl+D', 'Ctrl+R', 'F9', 'Ctrl+`',
    'Ctrl+Shift+$', 'Ctrl+Shift+%', 'Ctrl+Shift+!', 'Ctrl+Shift+~', 'Ctrl+Shift+#', 'Alt H 0', 'Alt H 9', 'Alt H K',
    'Ctrl+B', 'Ctrl+I', 'Ctrl+U', 'Ctrl+1', 'Alt H H', 'Alt H F C',
    'Alt H B O', 'Alt H B P', 'Alt H B A', 'Alt H B S', 'Alt H B T', 'Alt H B B', 'Alt H B D', 'Alt H B N',
    'Ctrl+C', 'Ctrl+X', 'Ctrl+V', 'Ctrl+Alt+V', 'Alt E S V', 'Alt H V S',
    'Ctrl+Shift++', 'Ctrl+-', 'Alt H O I', 'Alt H O A', 'Ctrl+9', 'Ctrl+A Alt H O U O',
    'Shift+Alt+→', 'Shift+Alt+←', 'Alt A H', 'Alt A J', 'Ctrl+Shift+L', 'Alt+↓', 'Alt A S A',
    'Ctrl+Z', 'Ctrl+Y', 'Ctrl+S', 'Ctrl+F', 'Ctrl+H', 'Ctrl+P'];
  for (const chord of old) assert.ok(referenceByChord(chord).length >= 1, `old row ${chord} was ported`);
  // the two rows the old page listed twice under different meanings
  assert.equal(referenceByChord('F4').length, 2); assert.equal(referenceByChord('Enter').length, 2); assert.equal(referenceByChord('Tab').length, 2);
  // the add-in layers the old page appended
  assert.equal(REFERENCE.filter(e => e.addin === 'Macabacus').length, 24);
  assert.equal(REFERENCE.filter(e => e.addin === 'FactSet').length, 20);
  assert.ok(referenceByChord('Ctrl+Shift+R').some(e => e.addin === 'Macabacus') && referenceByChord('Ctrl+Shift+R').some(e => e.addin === 'FactSet'));
});

test('page helpers: platform detection, keycap markup, search text', () => {
  assert.equal(detectPlatform({ platform: 'MacIntel', userAgent: 'Mozilla/5.0 (Macintosh)' }), 'mac');
  assert.equal(detectPlatform({ platform: 'Win32', userAgent: 'Mozilla/5.0 (Windows NT 10.0)' }), 'win');
  assert.equal(detectPlatform({ userAgentData: { platform: 'macOS' } }), 'mac');
  assert.equal(detectPlatform({ platform: 'Linux x86_64', userAgent: 'X11' }), 'win');
  assert.equal(detectPlatform(null), 'win');
  const html = chordHtml('Ctrl+Shift+↓', parseChord);
  assert.equal((html.match(/<kbd class="key">/g) || []).length, 3);
  assert.ok(html.includes('<span class="chord-plus">+</span>'));
  assert.equal((chordHtml('Alt H B O', parseChord).match(/class="chord"/g) || []).length, 4);
  assert.ok(chordHtml('<b>', parseChord).includes('&lt;b&gt;'), 'keys are escaped');
  const e = referenceById('ctrl-b'); const t = searchText(e, null);
  for (const q of ['ctrl b', 'ctrl+b', 'bold', 'cmd b', 'command b', 'formatting']) assert.ok(t.includes(q.replace('+', ' ')), `"${q}" finds Ctrl+B`);
  const e1 = referenceById('ctrl-1'); const t1 = searchText(e1, LESSONS_BY_ID[e1.lessonId]);
  assert.ok(e1.lessonId, 'Ctrl+1 links to the lesson that teaches Format Cells');
  for (const q of ['ctrl 1', 'format cells', `lesson ${lessonNumber(e1.lessonId)}`]) assert.ok(t1.includes(q), `"${q}" finds Ctrl+1`);
  assert.ok(searchText(referenceById('ctrl-9'), null).includes('coming soon'));
});

test('the public shortcuts index: the native categories, then one "Add-ins (Windows)" heading with both lists and the disclaimer', () => {
  const native = CATEGORIES.filter(c => REFERENCE.filter(e => e.category === c).some(e => !e.addin));
  assert.deepEqual(CATEGORIES.slice(-2), ['Macabacus', 'FactSet'], 'the add-in categories come last');
  const html = renderShortcutsIndex();
  assert.deepEqual([...html.matchAll(/<h2>([^<]+)<\/h2>/g)].map(m => m[1]), [...native, 'Add-ins (Windows)']);
  const at = s => { const i = html.indexOf(s); assert.ok(i >= 0, `index has "${s.slice(0, 40)}"`); return i; };
  const heading = at('<h2>Add-ins (Windows)</h2>');
  assert.ok(heading > at('<h2>Workbook</h2>'), 'the add-ins come after the last native category');
  assert.ok(heading < at('<h3>Macabacus</h3>') && at('<h3>Macabacus</h3>') < at(CATEGORY_NOTES.Macabacus) && at(CATEGORY_NOTES.Macabacus) < at('macabacus-ctrl-shift-r.html'));
  assert.ok(at('factset-ctrl-alt-k.html') < at(ADDIN_DISCLAIMER) && at(ADDIN_DISCLAIMER) < at('Open the reference'), 'the disclaimer sits under both lists');
  assert.equal((html.slice(heading).match(/<li>/g) || []).length, 44, 'every add-in row is under the heading');
  assert.equal((html.match(/<li>/g) || []).length, REFERENCE.length, 'every row is on the index');
});

test('Reference as 3.0 draws it (M106): the groups gather every native category, a Ribbon route folds into its key, the states and the count', () => {
  const groups = groupRows(REFERENCE);
  assert.deepEqual(groups.map(g => g.id), ['move', 'select', 'edit', 'format', 'formulas', 'ribbon', 'data']);
  const covered = new Set(REFERENCE_GROUPS.flatMap(g => g.categories));
  for (const c of CATEGORIES) if (REFERENCE.some(e => e.category === c && !e.addin)) assert.ok(covered.has(c), `${c} is in a group`);
  const shown = groups.flatMap(g => g.rows);
  assert.ok(shown.every(r => !r.entry.addin), 'no add-in rows on the page');
  const bold = shown.find(r => r.entry.id === 'ctrl-b');
  assert.ok(bold && bold.ribbon && bold.ribbon.id === 'alt-h-1', 'Bold shows its Ribbon route as a second row of keycaps');
  assert.ok(!shown.some(r => r.entry.id === 'alt-h-1'), 'the folded route is not its own row');
  const fc = shown.find(r => r.entry.id === 'ctrl-1');
  assert.ok(fc && fc.ribbon && fc.ribbon.id === 'alt-h-o-e');
  assert.equal(shown.length + shown.filter(r => r.ribbon).length, REFERENCE.filter(e => !e.addin).length, 'every native entry is a row or a folded route');
  // the states
  const e = referenceById('ctrl-1');
  assert.deepEqual(KEY_STATES, ['not-yet', 'taught', 'practiced', 'under-par']);
  assert.equal(keyState(e, {}), 'not-yet');
  assert.equal(keyState(e, { done: new Set([e.lessonId]) }), 'taught');
  assert.equal(keyState(e, { practiced: new Set([e.concept]) }), 'practiced');
  assert.equal(keyState(e, { practiced: new Set([e.concept]), underPar: new Set([e.concept]) }), 'under-par');
  assert.equal(keyState(referenceById('ctrl-9'), { done: new Set(['x']) }), 'not-yet', 'no lesson, no state');
  assert.equal(collectedCount(shown, {}), 0);
  assert.equal(collectedCount(shown, { done: new Set([e.lessonId]) }), shown.filter(r => r.entry.lessonId === e.lessonId).length);
  assert.equal(taughtIn('1.5.2'), '1.5'); assert.equal(taughtIn('1.1.C'), '1.1'); assert.equal(taughtIn(''), '');
});
