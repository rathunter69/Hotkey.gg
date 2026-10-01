// app2/tests/catalog.test.js — M97: every built drill is a valid catalog entry with its length
// class, lesson, tags, mode, pars and route; the set picker mixes its four sources within the
// budget and never hands a free account a Pro drill.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG, catalogEntry, validateCatalogEntry, lengthClassOf, taughtIn, LENGTH_CLASSES } from '../content/catalog.js';
import { pickSet, SET_LENGTHS } from '../app/set-picker.js';

test('length classes: a Pass par maps to the smallest class it fits, past three minutes is long', () => {
  assert.equal(lengthClassOf(45), 60); assert.equal(lengthClassOf(60), 60); assert.equal(lengthClassOf(61), 90);
  assert.equal(lengthClassOf(120), 120); assert.equal(lengthClassOf(151), 180); assert.equal(lengthClassOf(181), 'long'); assert.equal(lengthClassOf(300), 'long');
  assert.equal(lengthClassOf(NaN), 60);
  assert.deepEqual(LENGTH_CLASSES, [60, 90, 120, 150, 180, 'long']);
});

test('every built drill and challenge is a valid catalog entry', () => {
  assert.ok(CATALOG.length >= 11, 'Chapter 1 has eleven drills and its challenges');
  for (const e of CATALOG) {
    const errs = validateCatalogEntry(e);
    assert.deepEqual(errs, [], e.id + ': ' + errs.join('; '));
    assert.ok(e.route.secs == null || e.route.secs > 0);
  }
  const drills = CATALOG.filter(e => e.mode === 'drill'), challenges = CATALOG.filter(e => e.mode === 'challenge');
  assert.ok(drills.length >= 11 && challenges.length >= 1);
  for (const c of challenges) assert.equal(c.lesson, c.id, 'a challenge is taught by itself');
  assert.ok(drills.every(d => d.dailyEligible), 'Chapter 1 drills all feed the Daily (no stretch, no long)');
});

test('catalogEntry keeps what a drill states and derives the rest', () => {
  const base = { id: 'x', chapter: 'formatting', title: 'X', access: 'paid', pars: { pass: 200, pro: 140, legendary: 110 }, optimalKeys: 30, solution: 'Ctrl+B', goals: [{}, {}], route: 100 };
  const e = catalogEntry({ ...base, tags: ['stretch', 'bogus'], lesson: 'the-four-section-format' }, []);
  assert.deepEqual(e.tags.sort(), ['long', 'stretch'], 'a 200-second Pass is long; a bogus tag drops');
  assert.equal(e.length, 'long'); assert.equal(e.lessonSecs, undefined); assert.equal(e.lengthSecs, 300);
  assert.equal(e.lesson, 'the-four-section-format'); assert.equal(e.goals, 2); assert.equal(e.dailyEligible, false);
  assert.deepEqual(validateCatalogEntry(e), []);
  const f = catalogEntry({ ...base, access: 'free', tags: ['stretch'], pars: { pass: 90, pro: 60, legendary: 45 } }, []);
  assert.ok(validateCatalogEntry(f).some(m => /stretch drill is Pro/.test(m)));
  assert.equal(catalogEntry({ ...base, length: 90 }, []).length, 90, 'a stated length is kept');
  // the lesson a drill is taught in: its module's last lesson when it names none
  const lessons = [{ id: 'a', module: 'm1' }, { id: 'b', module: 'm1' }, { id: 'c', module: 'm1', kind: 'challenge' }];
  assert.equal(taughtIn({ module: 'm1' }, lessons), 'b');
  assert.equal(taughtIn({ id: 'c', kind: 'challenge' }, lessons), 'c');
  assert.equal(taughtIn({}, lessons), null);
});

const mk = (id, over = {}) => ({ id, title: id, chapter: 'foundations', mode: 'drill', access: 'free', length: 60, lengthSecs: 60, tags: [], pars: { pass: 60, pro: 42, legendary: 33 }, lesson: null, ...over });
const cat = [mk('a'), mk('b'), mk('c'), mk('d', { access: 'paid' }), mk('e', { lengthSecs: 120, length: 120 }), mk('f', { tags: ['long'], length: 'long', lengthSecs: 300 }), mk('g')];
const all = cat.map(e => e.id);

test('pickSet: the budget holds, the four sources lead in turn, Pro drills never reach a free account', () => {
  const s = pickSet({ catalog: cat, minutes: 5, pro: false, unlocked: all, due: ['c'], bests: { a: { secs: 100, tier: 'none' }, b: { secs: 40, tier: 'pro' } } });
  assert.ok(s.secs <= 300, 'within five minutes'); assert.ok(s.ids.length > 0);
  assert.equal(s.ids[0], 'c', 'what is due comes first'); assert.equal(s.reasons.c, 'due');
  assert.equal(s.ids[1], 'a', 'then the slowest against its par'); assert.equal(s.reasons.a, 'slowest');
  assert.equal(s.reasons.g, 'newest', 'then the newest unlocked, unplayed drill');
  assert.equal(s.reasons.b, 'next-tier', 'then a drill under its next tier');
  assert.ok(!s.ids.includes('d'), 'no Pro drill on a free account');
  assert.ok(!s.ids.includes('f'), 'long drills live with the challenges, not in a set');
  assert.equal(new Set(s.ids).size, s.ids.length, 'no repeats');
  const p = pickSet({ catalog: cat, minutes: 20, pro: true, unlocked: all });
  assert.ok(p.ids.includes('d'), 'Pro sees the Pro drill'); assert.ok(p.secs <= 1200);
  assert.deepEqual(pickSet({ catalog: cat, minutes: 10, unlocked: [] }).ids, [], 'nothing unlocked, nothing picked');
  assert.deepEqual(pickSet({ catalog: cat, minutes: 10, unlocked: ['e'] }).ids, ['e'], 'a lone drill is a set of one');
  assert.deepEqual(SET_LENGTHS, [5, 10, 20]);
  assert.deepEqual(pickSet({ catalog: cat, minutes: 7, unlocked: all }), pickSet({ catalog: cat, minutes: 10, unlocked: all }), 'an unknown length is ten minutes');
});

test('pickSet is deterministic and fills from the catalog when the sources run dry', () => {
  const a = pickSet({ catalog: cat, minutes: 10, unlocked: ['a', 'b'] }), b = pickSet({ catalog: cat, minutes: 10, unlocked: ['a', 'b'] });
  assert.deepEqual(a, b);
  const s = pickSet({ catalog: cat, minutes: 10, unlocked: all, bests: { a: { secs: 30 }, b: { secs: 30 }, c: { secs: 30 }, e: { secs: 30 }, g: { secs: 30 } } });
  assert.ok(s.ids.length >= 5); assert.ok(s.secs <= 600);
});
