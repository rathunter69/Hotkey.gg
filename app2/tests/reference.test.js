// The shortcut reference: every entry complete and unique, every category listed, every lesson link
// real, the Foundations shortcuts resolving to the lesson that teaches them, the Mac column derived
// by the old rule, the chord notation parsing, and the old reference's content all present.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { REFERENCE, CATEGORIES, CATEGORY_NOTES, macChord, macNote, parseChord, referenceByChord, referenceById, lessonForConcept } from '../content/reference.js';
import { LESSONS_BY_ID } from '../content/index.js';
import { CONCEPTS } from '../content/schema.js';
import { detectPlatform, chordHtml, searchText } from '../app/reference-page.js';

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

test('every lessonId exists in the catalogue and matches the entry concept', () => {
  for (const e of REFERENCE) {
    if (e.lessonId === null) { assert.equal(lessonForConcept(e.concept), null, `${e.id}: concept ${e.concept} is taught, lessonId should be set`); continue; }
    const lesson = LESSONS_BY_ID[e.lessonId];
    assert.ok(lesson, `${e.id}: lesson ${e.lessonId} is in the catalogue`);
    assert.ok(e.concept && lesson.concepts.includes(e.concept), `${e.id}: lesson ${e.lessonId} teaches "${e.concept}"`);
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

test('the Foundations shortcuts resolve to the lesson that teaches them', () => {
  const expect = {
    'ctrl-b': 'foundations-06-ribbon-commands',
    'alt-h-1': 'foundations-06-ribbon-commands',
    'alt-h-b-o': 'foundations-06-ribbon-commands',
    'ctrl-1': 'foundations-07-dialog-boxes',
    'ctrl-arrow': 'foundations-02-moving-around',
    'ctrl-shift-arrow': 'foundations-03-selecting-ranges',
    'shift-space': 'foundations-03-selecting-ranges',
    'ctrl-space': 'foundations-03-selecting-ranges',
    'ctrl-a': 'foundations-03-selecting-ranges',
    'f2-edit': 'foundations-05-editing-cells',
  };
  for (const [id, lessonId] of Object.entries(expect)) {
    const e = referenceById(id);
    assert.ok(e, `${id} is in the reference`);
    assert.equal(e.lessonId, lessonId, `${id} (${e.win}) links to ${lessonId}`);
  }
  // by chord too: Ctrl+B and Alt H 1 are the same command, both taught in lesson 6
  assert.equal(referenceByChord('Ctrl+B')[0].lessonId, 'foundations-06-ribbon-commands');
  assert.equal(referenceByChord('Alt H 1')[0].lessonId, 'foundations-06-ribbon-commands');
  assert.equal(referenceByChord('ctrl + 1')[0].lessonId, 'foundations-07-dialog-boxes');
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
  assert.equal((html.match(/<kbd>/g) || []).length, 3);
  assert.ok(html.includes('<span class="ref-plus">+</span>'));
  assert.equal((chordHtml('Alt H B O', parseChord).match(/class="ref-seq"/g) || []).length, 4);
  assert.ok(chordHtml('<b>', parseChord).includes('&lt;b&gt;'), 'keys are escaped');
  const e = referenceById('ctrl-b'); const t = searchText(e, LESSONS_BY_ID[e.lessonId]);
  for (const q of ['ctrl b', 'ctrl+b', 'bold', 'cmd b', 'command b', 'lesson 6', 'formatting']) assert.ok(t.includes(q.replace('+', ' ')), `"${q}" finds Ctrl+B`);
  assert.ok(searchText(referenceById('ctrl-9'), null).includes('coming soon'));
});
