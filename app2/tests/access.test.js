// app2/tests/access.test.js — R8: chapter access (M58), Teams desks (Phase F desks v1) and the
// processor-agnostic checkout client (Phase E). The server decides; these hold the client's pure
// parts and keep migration 0013's seeds in step with the content, since an unseeded ref fails open.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { accessFromRows, entitlement, FREE_CHAPTERS } from '../app/entitlement.js';
import { parseDeskCode, isDeskCode, joinHref, inviteLink, errorKey, seatLine, lastActive, DESK_ERRORS } from '../app/desks.js';
import { activeText, deskHeadFacts, seatRowsModel, joinFacts, codeBoxHtml, OWNER_SEES } from '../app/desk-page.js';
import { parseRoute, navKeyFor, titleFor } from '../app/main.js';
import { registerProcessor, processorFor, beginCheckout, mountPaymentForm, processorIds } from '../app/checkout.js';
import { CHECKOUT_PROCESSOR } from '../app/config.js';
import { LESSONS, CHAPTERS } from '../content/index.js';
import { CATALOG } from '../content/catalog.js';
import { DRILLS } from '../content/drills.js';
import { siteCopy } from '../content/copy/apply.js';

const here = dirname(fileURLToPath(import.meta.url));
const T0 = Date.parse('2026-10-02T12:00:00Z');
const DAY = 86400000;

/* ---------------- M58: what an account's rows open ---------------- */
test('accessFromRows: a live row without a chapter is the plan; a chapter row opens that chapter; ended rows open nothing', () => {
  const live = { starts_at: '2026-09-01T00:00:00Z', ends_at: null };
  assert.deepEqual(accessFromRows([], T0), { plan: false, chapters: [] });
  assert.deepEqual(accessFromRows([{ ...live, chapter: null }], T0), { plan: true, chapters: [] });
  assert.deepEqual(accessFromRows([{ ...live, chapter: 'formulas' }, { ...live, chapter: 'formatting' }, { ...live, chapter: 'formulas' }], T0), { plan: false, chapters: ['formatting', 'formulas'] });
  assert.deepEqual(accessFromRows([{ starts_at: '2026-01-01T00:00:00Z', ends_at: '2026-02-01T00:00:00Z', chapter: null }], T0), { plan: false, chapters: [] }, 'ended');
  assert.deepEqual(accessFromRows([{ ...live }], T0), { plan: true, chapters: [] }, 'a row from before 0013 (no chapter column) reads as the plan');
  assert.deepEqual(accessFromRows(null, T0), { plan: false, chapters: [] });
});

test('chapterOpen: Chapter 1 is open to everyone, a guest opens nothing else, and only Chapter 1 is free in the content', () => {
  entitlement.reset();
  assert.deepEqual(FREE_CHAPTERS, CHAPTERS.filter(c => c.access !== 'paid').map(c => c.id));
  assert.equal(entitlement.chapterOpen('foundations'), true);
  for (const c of CHAPTERS.slice(1)) assert.equal(entitlement.chapterOpen(c.id), false, c.id);
  assert.equal(entitlement.locked({ id: 'x', access: 'paid', chapter: 'formulas' }), true);
  assert.equal(entitlement.locked({ id: 'x', access: 'free', chapter: 'foundations' }), false);
});

/* ---------------- migration 0013's seeds match the content ---------------- */
const SQL = readFileSync(resolve(here, '../supabase/migrations/0013_chapter_access_desks.sql'), 'utf8');
const block = start => { const a = SQL.indexOf(start); assert.ok(a >= 0, start); return SQL.slice(a, SQL.indexOf(';', a)); };

test('0013 seeds every lesson, drill and catalog ref with its chapter (an unseeded ref would fail open on the server)', () => {
  const seeded = new Map([...block('insert into public.content_refs').matchAll(/\('([a-z0-9-]+)', '([a-z-]+)'\)/g)].map(m => [m[1], m[2]]));
  const want = new Map();
  for (const x of [...LESSONS, ...CATALOG, ...DRILLS]) want.set(x.id, x.chapter);
  const missing = [...want].filter(([id, ch]) => seeded.get(id) !== ch).map(([id, ch]) => `${id} (${ch}, seeded ${seeded.get(id) || 'no'})`);
  assert.deepEqual(missing, [], 'add these to a new migration\'s content_refs seed');
  const chapters = new Map([...block('insert into public.chapters').matchAll(/\('([a-z-]+)', (\d+), '(free|paid)'\)/g)].map(m => [m[1], m[3]]));
  assert.deepEqual([...chapters], CHAPTERS.map(c => [c.id, c.access === 'paid' ? 'paid' : 'free']));
});

test('0013 gates every assessment and test-out with the content\'s time limit', () => {
  const gates = [...block('insert into public.chapter_gates').matchAll(/\('([a-z0-9-]+)', '([a-z-]+)', '(assessment|testout)', (\d+)\)/g)].map(m => [m[1], m[2], m[3], Number(m[4])]).sort();
  const want = LESSONS.filter(l => l.kind === 'assessment' || l.kind === 'testout').map(l => [l.id, l.chapter, l.kind, l.timeLimit]).sort();
  assert.deepEqual(gates, want);
});

/* ---------------- desks: codes, links, refusals ---------------- */
test('parseDeskCode reads a code however it was pasted, and nothing else', () => {
  assert.equal(parseDeskCode('TEAM-7KQ4-M2XP'), 'TEAM-7KQ4-M2XP');
  assert.equal(parseDeskCode(' team 7kq4 m2xp '), 'TEAM-7KQ4-M2XP');
  assert.equal(parseDeskCode('https://hotkey.gg/#/desk/join/TEAM-7KQ4-M2XP'), 'TEAM-7KQ4-M2XP');
  assert.equal(parseDeskCode('ABCD-EFGH-JKLM'), null, 'a one-time redeem code is not a desk code');
  assert.equal(parseDeskCode('TEAM-7KQ'), null);
  assert.equal(parseDeskCode(null), null);
  assert.equal(isDeskCode('TEAM-AAAA-BBBB'), true);
  assert.equal(joinHref('TEAM-AAAA-BBBB'), '#/desk/join/TEAM-AAAA-BBBB');
  assert.equal(inviteLink('TEAM-AAAA-BBBB', 'https://x.pages.dev/app2/index.html#/desk?y=1'), 'https://x.pages.dev/app2/index.html#/desk/join/TEAM-AAAA-BBBB');
});

test('every server refusal has its own line in the copy sheet, and an unknown one reads as the generic line', () => {
  for (const [code, key] of Object.entries(DESK_ERRORS)) {
    assert.equal(errorKey('ERROR: ' + code), key);
    assert.notEqual(siteCopy(key, ''), '', key);
  }
  assert.equal(errorKey('something new'), 'desk_err_failed');
  assert.notEqual(siteCopy('desk_err_failed', ''), '');
});

test('seats and last active', () => {
  assert.deepEqual(seatLine({ seats: 8, used: 5 }), { used: 5, seats: 8, left: 3 });
  assert.deepEqual(seatLine({ seats: 5, used: 9 }), { used: 5, seats: 5, left: 0 });
  assert.deepEqual(seatLine(null), { used: 0, seats: 0, left: 0 });
  assert.equal(lastActive(new Date(T0 - 3600e3).toISOString(), T0), 'today');
  assert.equal(lastActive(new Date(T0 - DAY).toISOString(), T0), 'yesterday');
  assert.deepEqual(lastActive(new Date(T0 - 6 * DAY).toISOString(), T0), { days: 6 });
  assert.equal(lastActive(null, T0), null);
  assert.equal(activeText(null, T0), siteCopy('desk_active_never'));
  assert.equal(activeText(new Date(T0 - 6 * DAY).toISOString(), T0), '6 days ago');
});

test('the desk page: heading facts, the seat view rows, the join facts, the code box', () => {
  assert.deepEqual(deskHeadFacts({ seats: 8, used: 5, paid_until: '2027-07-01T00:00:00Z' }), ['5 of 8 seats taken', 'Paid until July 1, 2027']);
  const rows = seatRowsModel([{ handle: 'A', level: 3, role: 'owner', lessons_done: 4, chapters_verified: 1, last_at: null, joined_at: '2026-09-02T00:00:00Z' }], T0);
  assert.deepEqual(rows[0], { handle: 'A', level: 3, owner: true, lessons: 4, verified: 1, active: siteCopy('desk_active_never'), joined: 'September 2, 2026' });
  assert.deepEqual(joinFacts({ owner_handle: 'Wolf', seats_left: 3, paid_until: '2027-07-01T00:00:00Z' }).map(f => f.v), ['Wolf', '3', 'July 1, 2027']);
  assert.deepEqual(joinFacts(null), []);
  assert.equal(OWNER_SEES().length, 4);
  const box = codeBoxHtml({ id: 'x', value: '<b>', primary: false });
  assert.match(box, /id="xForm"/); assert.match(box, /value="&lt;b&gt;"/);
});

test('routes: #/desk and the join link', () => {
  assert.equal(parseRoute('#/desk').name, 'desk');
  const j = parseRoute('#/desk/join/team-7kq4-m2xp');
  assert.equal(j.name, 'desk'); assert.equal(j.params.join, true); assert.equal(j.params.code, 'TEAM-7KQ4-M2XP');
  assert.equal(parseRoute('#/desk/join/<script>').name, 'notfound');
  assert.equal(navKeyFor('desk'), 'leaderboard');
  assert.equal(titleFor('desk'), 'Your desk · hotkey.gg');
});

/* ---------------- Phase E: the processor-agnostic checkout client ---------------- */
test('checkout: the configured processor is registered, and an unknown one is refused', async () => {
  assert.ok(processorIds().includes(CHECKOUT_PROCESSOR));
  await assert.rejects(processorFor('nope'), /unknown processor/);
  registerProcessor('broken', async () => ({ default: { id: 'broken' } }));
  await assert.rejects(processorFor('broken'), /without mount/);
});

test('checkout: a session from the server mounts through whichever adapter it names, with no network', async () => {
  const calls = [];
  registerProcessor('fake', async () => ({ default: { id: 'fake', async mount(el, session, { alive }) { calls.push([el, session.clientSecret, alive()]); return { destroy() { calls.push('gone'); } }; } } }));
  const r = await beginCheckout(async () => ({ clientSecret: 'cs_test_1', student: true }), 'fake');
  assert.deepEqual(r, { session: { processor: 'fake', clientSecret: 'cs_test_1' }, student: true });
  const el = {};
  const form = await mountPaymentForm(el, r.session, { alive: () => true });
  assert.deepEqual(calls, [[el, 'cs_test_1', true]]);
  form.destroy(); assert.equal(calls[1], 'gone');
  assert.deepEqual(await beginCheckout(async () => ({ error: 'already_subscribed' }), 'fake'), { error: 'already_subscribed' });
  assert.deepEqual(await beginCheckout(async () => ({}), 'fake'), { error: 'failed' });
  assert.deepEqual(await beginCheckout(async () => null, 'fake'), { error: 'failed' });
});

test('checkout: only the processor adapter knows Stripe; the page and the client name no processor', () => {
  const read = p => readFileSync(resolve(here, '../app', p), 'utf8');
  for (const f of ['checkout-page.js', 'checkout.js', 'billing.js']) {
    const code = read(f).split('\n').filter(l => !/^\s*(\/\/|\*|\/\*\*)/.test(l)).join('\n');
    assert.doesNotMatch(code, /STRIPE_PUBLISHABLE_KEY|initEmbeddedCheckout|js\.stripe\.com|window\.Stripe/, f);
  }
  assert.match(read('processors/stripe.js'), /STRIPE_PUBLISHABLE_KEY/);
});
