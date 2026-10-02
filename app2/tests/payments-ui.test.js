// app2/tests/payments-ui.test.js — the client side of Phase E (docs/phases/E-checkout.md, section 6):
// the `payments` flag (off on hotkey.gg whatever is stored), the pricing page with the flag off and
// on (Wolf, 2026-10-02: the three plans show either way; only the Full Access action changes), the
// paywall's action, the checkout and done screens, the plan summary the account page reads, and the
// boot mapping of Stripe's return URLs. Pure markup and pure functions: no DOM, no network.
import test from 'node:test';
import assert from 'node:assert/strict';
import { paymentsFlag, STRIPE_PUBLISHABLE_KEY, PRODUCTION_HOSTS } from '../app/config.js';
import { pricingHtml, PRICES, FREE_ROWS, FULL_ROWS, TEAMS_ROWS, TRUST_LINES } from '../app/pricing-page.js';
import { paywallHtml, goHrefFor } from '../ui/components/paywall.js';
import { summaryHtml, signinHtml, formHtml, haveHtml, doneHtml, closedHtml, checkoutHtml, planLine, POLL_MS, POLL_LIMIT_MS } from '../app/checkout-page.js';
import { planSummary, planDate, isCourseDone, GRACE_DAYS } from '../app/billing.js';
import { billingPanelHtml } from '../app/account-page.js';
import { stripeReturn, parseRoute, legacyQuery } from '../app/main.js';
import { tells } from '../content/copy/tells.js';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const text = html => String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const app2 = join(dirname(fileURLToPath(import.meta.url)), '..');

test('the payments flag: never on hotkey.gg, on for previews and a local server, an override only off production', () => {
  for (const h of PRODUCTION_HOSTS) { assert.equal(paymentsFlag(h), false, h); assert.equal(paymentsFlag(h, '1'), false, h + ' ignores an override'); }
  assert.equal(paymentsFlag('HOTKEY.GG', '1'), false);
  assert.equal(paymentsFlag('payments.hotkey-gg.pages.dev'), true);
  assert.equal(paymentsFlag('localhost'), true); assert.equal(paymentsFlag('127.0.0.1'), true);
  assert.equal(paymentsFlag('127.0.0.1', '0'), false, 'tests and screenshots can switch it off');
  assert.equal(paymentsFlag('example.com'), false, 'unknown hosts stay off');
  assert.equal(paymentsFlag('example.com', '1'), true);
  assert.equal(paymentsFlag(''), false);
});

test('only the Stripe publishable key is in client code: no secret or restricted key anywhere under app2', () => {
  assert.match(STRIPE_PUBLISHABLE_KEY, /^pk_(test|live)_/);
  const hits = [];
  const walk = d => { for (const n of readdirSync(d)) { const p = join(d, n); if (statSync(p).isDirectory()) { if (n !== 'node_modules' && n !== 'vendor') walk(p); } else if (/\.(js|mjs|ts|html|css|toml|sql|json|md|csv)$|^_headers$|^_redirects$/.test(n)) { const s = readFileSync(p, 'utf8'); if (/\b(sk|rk)_(test|live)_[A-Za-z0-9]{8,}|whsec_[A-Za-z0-9]{8,}/.test(s)) hits.push(p); } } };
  walk(app2);
  assert.deepEqual(hits, []);
});

test('pricing, flag OFF (hotkey.gg): the three plans, Full Access recommended, its action waiting for launch', () => {
  const html = pricingHtml({ payments: false });
  const t = text(html);
  for (const s of ['Pricing', 'Free', '$0', 'Full Access', 'Recommended', '$15', 'a month', 'Students $9 a month with your school email', 'Teams', '$12', 'a seat a month', '5 seats or more', 'Talk to us', 'Start learning', 'Get Full Access', 'Checkout opens at launch.']) assert.ok(t.includes(s), s);
  for (const s of TRUST_LINES()) assert.ok(t.includes(s), s);
  // the old figures, the toggle and the yearly terms are gone
  for (const s of ['$90', '$70', '$7 ', 'Yearly', 'Monthly', 'Go Pro', 'a year']) assert.ok(!t.includes(s), 'no ' + s);
  assert.ok(!html.includes('role="radiogroup"'), 'no term toggle');
  // one primary action on the page, disabled, and no link to checkout
  assert.equal((html.match(/btn2-primary/g) || []).length, 1, 'one primary button');
  assert.match(html, /<button type="button" class="btn2 btn2-primary\s*" id="goFull" disabled aria-disabled="true"/);
  assert.ok(!html.includes('#/checkout'), 'nothing opens checkout with the flag off');
  // Full Access is the emphasized column: the mode's rule and the mark
  assert.match(html, /class="panel panel-mode plan plan-full" data-mode="learn"/);
  assert.equal((html.match(/class="panel plan"/g) || []).length, 2, 'Free and Teams are plain panels');
  // one action per column
  assert.equal((html.match(/id="go(Free|Full|Teams)"/g) || []).length, 3);
  assert.match(html, /href="mailto:teams@hotkey\.gg\?subject=/);
  assert.equal(FREE_ROWS().length + FULL_ROWS().length + TEAMS_ROWS().length, 11);
  assert.equal((html.match(/class="plan-tick"/g) || []).length, 11, 'one ticked row each');
  // the terms rows, true to the handover
  for (const s of ['No trial', 'so it is the trial', 'Cancel any time from your account', 'end of the month you paid for', 'within 14 days', 'Nothing cosmetic is sold']) assert.ok(t.includes(s), s);
  assert.deepEqual(PRICES, { month: 15, studentMonth: 9, seat: 12, minSeats: 5 });
  assert.doesNotMatch(t, /→|·|—/, 'no arrow on a button, no dot-joined facts, no dash');
  for (const line of t.split(/(?<=[.!?])\s+/)) assert.deepEqual(tells(line), [], line);
});

test('pricing, flag ON (previews): Get Full Access goes to checkout and Enter does it; a subscriber sees Manage billing', () => {
  const html = pricingHtml({ payments: true });
  assert.match(html, /<a class="btn2 btn2-primary\s*" href="#\/checkout" id="goFull"/);
  assert.ok(!text(html).includes('Checkout opens at launch.'));
  assert.ok(html.includes('class="key'), 'the Enter keycap on the primary');
  const sub = pricingHtml({ payments: true, entitled: true });
  assert.ok(!sub.includes('#/checkout') && text(sub).includes('Manage billing'), 'never a second subscription');
});

test('the paywall goes to checkout with the flag on and to Pricing with it off', () => {
  assert.equal(goHrefFor(true), '#/checkout'); assert.equal(goHrefFor(false), '#/pricing');
  const on = paywallHtml({ heading: 'Chapter 2', payments: true });
  assert.ok(on.includes('href="#/checkout"') && !text(on).includes('Checkout opens at launch.'));
  const off = paywallHtml({ heading: 'Chapter 2', payments: false });
  assert.ok(off.includes('href="#/pricing"') && text(off).includes('Checkout opens at launch.'));
  assert.equal((on.match(/btn2-primary/g) || []).length, 1, 'one primary action');
});

test('checkout: the summary, the code sign-in, the form placeholder, already subscribed, closed', () => {
  const s = text(summaryHtml());
  for (const x of ['Full Access', '$15', 'a month', 'Cancel any time from your account.', '14 days', 'Payment is handled by Stripe. Your receipt comes from Link.']) assert.ok(s.includes(x), x);
  assert.ok(text(summaryHtml({ student: true })).includes('Student price $9 a month') && summaryHtml({ student: true }).includes('>$9<'));
  const e = signinHtml();
  assert.ok(e.includes('type="email"') && e.includes('type="submit"') && text(e).includes('school email'));
  const c = signinHtml({ step: 'code', email: 'a@b.com' });
  assert.ok(c.includes('autocomplete="one-time-code"') && text(c).includes('a@b.com') && text(c).includes('Use another email'));
  assert.ok(text(signinHtml({ error: 'Enter your email address.' })).includes('Enter your email address.'));
  assert.ok(formHtml().includes('id="coStripe"') && text(formHtml()).includes('Opening the secure payment form'));
  assert.ok(text(formHtml({ error: 'x' })).includes('Try again'));
  const have = text(haveHtml({ kind: 'subscription', plan: 'monthly', renews: true, date: '2026-11-02T12:00:00Z' }));
  assert.ok(have.includes('You already have Full Access') && have.includes('Full Access, renews November 2, 2026') && have.includes('Manage billing'));
  assert.ok(text(closedHtml()).includes('Checkout opens at launch.') && closedHtml().includes('#/pricing'));
  assert.ok(checkoutHtml('<p>x</p>').includes('class="cols-2"'), 'the form at the left, the summary at the right');
  for (const h of [summaryHtml(), signinHtml(), signinHtml({ step: 'code', email: 'a@b.com' }), formHtml(), closedHtml()]) assert.equal((h.match(/btn2-primary/g) || []).length <= 1, true, 'at most one primary');
});

test('checkout done: waits, unlocks with the chapter list, times out honestly, asks a signed-out buyer to sign in', () => {
  assert.equal(POLL_MS, 2000); assert.equal(POLL_LIMIT_MS, 20000);
  assert.ok(text(doneHtml()).includes('Unlocking your course'));
  const ok = doneHtml({ phase: 'ok', chapters: [{ label: 'Chapter 2: Formatting and presentation', href: '#/learn' }], firstHref: '#/lesson/x' });
  assert.ok(text(ok).includes('Chapters 2 to 6 are open') && ok.includes('href="#/lesson/x"') && text(ok).includes('Chapter 2: Formatting'));
  const to = text(doneHtml({ phase: 'timeout' }));
  assert.ok(to.includes('Payment received. Unlocking can take a minute; refresh this page.') && to.includes('support@hotkey.gg'));
  assert.ok(text(doneHtml({ phase: 'signin' })).includes('Sign in with the email you paid with'));
});

test('planSummary: a live checkout row is a subscription dated period end (less the grace); other rows are grants', () => {
  const now = Date.parse('2026-10-02T00:00:00Z');
  const ends = new Date(Date.parse('2026-11-02T12:00:00Z') + GRACE_DAYS * 86400000).toISOString();
  assert.deepEqual(planSummary([], now), { kind: 'free' });
  assert.deepEqual(planSummary(null, now), { kind: 'free' });
  const s = planSummary([{ source: 'checkout', plan: 'student_monthly', auto_renew: true, starts_at: '2026-10-01T00:00:00Z', ends_at: ends }], now);
  assert.deepEqual(s, { kind: 'subscription', plan: 'student_monthly', student: true, renews: true, date: '2026-11-02T12:00:00.000Z' });
  assert.equal(planSummary([{ source: 'checkout', plan: 'monthly', auto_renew: false, starts_at: '2026-10-01T00:00:00Z', ends_at: ends }], now).renews, false);
  assert.equal(planSummary([{ source: 'checkout', starts_at: '2026-09-01T00:00:00Z', ends_at: '2026-09-20T00:00:00Z' }], now).kind, 'free', 'an ended row');
  assert.deepEqual(planSummary([{ source: 'redeem', starts_at: '2026-09-01T00:00:00Z', ends_at: null }], now), { kind: 'granted', source: 'redeem', endsAt: null });
  assert.equal(planSummary([{ source: 'checkout', starts_at: '2026-10-01T00:00:00Z', ends_at: ends }], now).renews, true, 'before 0011 there is no auto_renew: read as renewing');
  assert.equal(planDate('2026-11-02T12:00:00Z'), 'November 2, 2026');
  assert.equal(planDate('nope'), '');
  assert.equal(planLine({ kind: 'subscription', renews: false, date: '2026-11-02T12:00:00Z' }), 'Full Access, ends November 2, 2026');
  assert.equal(planLine({ kind: 'free' }), 'Free');
  assert.equal(isCourseDone(['a', 'b'], { a: { completed: true }, b: { completed: true } }), true);
  assert.equal(isCourseDone(['a', 'b'], { a: { completed: true } }), false);
  assert.equal(isCourseDone([], {}), false);
});

test('account: Plan and billing shows the plan, Cancel subscription and Manage billing for a subscriber', () => {
  const sub = billingPanelHtml({ kind: 'subscription', plan: 'monthly', renews: true, date: '2026-11-02T12:00:00Z' });
  const t = text(sub);
  for (const s of ['Plan and billing', 'Full Access', 'Renews November 2, 2026', 'Cancel subscription', 'Manage billing', 'end of the month you paid for']) assert.ok(t.includes(s), s);
  assert.ok(sub.includes('id="billCancel"') && sub.includes('id="billManage"'));
  const ending = text(billingPanelHtml({ kind: 'subscription', plan: 'student_monthly', student: true, renews: false, date: '2026-11-02T12:00:00Z' }));
  assert.ok(ending.includes('Ends November 2, 2026') && ending.includes('Student price') && !ending.includes('Cancel subscription'), 'already cancelling: no second cancel');
  const free = billingPanelHtml({ kind: 'free' }, { payments: true });
  assert.ok(free.includes('href="#/checkout"') && text(free).includes('Get Full Access'));
  assert.ok(text(billingPanelHtml({ kind: 'granted', endsAt: null })).includes('From a code or a grant'));
  assert.ok(text(billingPanelHtml(null)).includes('Plan and billing'), 'loading');
});

test('routes: #/checkout and #/checkout/done; Stripe\'s query-string returns become those routes at boot', () => {
  assert.equal(parseRoute('#/checkout').name, 'checkout');
  const d = parseRoute('#/checkout/done?session_id=cs_test_1');
  assert.equal(d.name, 'checkout'); assert.equal(d.params.done, true); assert.equal(d.query.session_id, 'cs_test_1');
  assert.equal(stripeReturn('?checkout_session=cs_test_a1B2', '/'), '/#/checkout/done?session_id=cs_test_a1B2');
  assert.equal(stripeReturn('?checkout_session=<script>', '/app2/index.html'), '/app2/index.html#/checkout/done', 'a junk id is dropped');
  assert.equal(stripeReturn('?billing=done', '/'), '/#/account?section=billing');
  assert.equal(stripeReturn('', '/'), null); assert.equal(stripeReturn('?code=abc', '/'), null, 'the auth return is left alone');
  assert.equal(legacyQuery('?checkout_session=cs_1'), null);
});

test('the preview hosts let Stripe and Link in; hotkey.gg keeps the strict policy', () => {
  const h = readFileSync(join(app2, '_headers'), 'utf8');
  const blocks = h.split(/\n(?=\S)/);
  const site = blocks.find(b => b.startsWith('/*\n'));
  assert.ok(site && !/stripe|link\.com/.test(site), 'the site-wide policy has no Stripe host');
  const preview = blocks.filter(b => /^https:\/\/.*pages\.dev/.test(b));
  assert.equal(preview.length, 2);
  for (const b of preview) {
    assert.ok(b.includes('! Content-Security-Policy'), 'the site-wide policy is dropped first');
    const csp = (b.match(/Content-Security-Policy: (.*)/) || [])[1] || '';
    for (const dir of ['script-src', 'frame-src', 'connect-src']) assert.match(csp, new RegExp(dir + "[^;]*https://\\*\\.stripe\\.com[^;]*https://\\*\\.link\\.com"), dir);
    assert.ok(!/default-src \*/.test(csp));
    assert.match(csp, /frame-ancestors 'none'/);
  }
});
