// app2/tests/security.test.js — the liability checklist's Security section (run R9), the parts that
// live in this repo: the response headers (_headers parsed the way Cloudflare Pages reads it), the
// edge functions' guards (body caps, CORS, the webhook's signature gate, prices from the server),
// no user enumeration in the sign-in answers, and the "not applicable" items kept not applicable
// (no cookies, no uploads, no AI calls, no admin route). The database half is pgTAP
// app2/supabase/tests/13-security.test.sql. Nothing here reaches the network.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { APP2, parseHeaders, parseCsp, siteHeaders, publishedPages, inlineScriptHashes, withCurrentHashes } from './headers-file.js';
import { SUPABASE_URL } from '../app/config.js';
import { readBody, readJsonInput, verifyWebhook, BODY_LIMITS } from '../supabase/functions/_shared/http.js';
import { corsHeaders, createCheckout } from '../supabase/functions/_shared/billing.js';
import { enumerationSafe, CREDENTIALS_TEXT } from '../app/auth.js';

const HEADERS_TEXT = readFileSync(join(APP2, '_headers'), 'utf8');
const RULES = parseHeaders(HEADERS_TEXT);
const SITE = siteHeaders(RULES);
const SITE_CSP = parseCsp(SITE['content-security-policy']);
const ALL_CSPS = RULES.filter(r => r.headers['content-security-policy']).map(r => ({ pattern: r.pattern, csp: parseCsp(r.headers['content-security-policy']) }));
const SUPA = new URL(SUPABASE_URL).host;

/** Every .js/.ts/.html file the browser or an edge function runs (not tests, not vendored code). */
function sources(exts = /\.(js|html)$/, dirs = ['app', 'ui', 'engine', 'content', 'index.html', '404.html']) {
  const out = [];
  const walk = p => { if (statSync(p).isDirectory()) { for (const n of readdirSync(p)) walk(join(p, n)); } else if (exts.test(p)) out.push(p); };
  for (const d of dirs) walk(join(APP2, d));
  return out;
}

// ============================================================ headers
test('_headers: Cloudflare can read it (patterns, Name: value lines, under its line and rule limits)', () => {
  assert.ok(RULES.length > 0 && RULES.length <= 100, 'Cloudflare Pages takes at most 100 header rules');
  for (const line of HEADERS_TEXT.split('\n')) assert.ok(line.length <= 2000, 'a _headers line over 2,000 characters is dropped: ' + line.slice(0, 60));
  assert.equal(RULES[0].pattern, '/*', 'the site-wide rule comes first');
});

test('HSTS: two years, subdomains included, on every response', () => {
  const v = SITE['strict-transport-security'] || '';
  const age = Number((/max-age=(\d+)/.exec(v) || [])[1]);
  assert.ok(age >= 31536000, 'max-age of at least a year: ' + v);
  assert.match(v, /includeSubDomains/);
});

test('the other security headers: nosniff, referrer, permissions, framing', () => {
  assert.equal(SITE['x-content-type-options'], 'nosniff');
  assert.equal(SITE['referrer-policy'], 'strict-origin-when-cross-origin');
  assert.equal(SITE['x-frame-options'], 'DENY');
  for (const f of ['geolocation=()', 'microphone=()', 'camera=()', 'payment=()', 'usb=()']) assert.ok((SITE['permissions-policy'] || '').includes(f), f);
  for (const { pattern, csp } of ALL_CSPS) assert.deepEqual(csp['frame-ancestors'], ["'none'"], pattern + ': frame-ancestors');
});

test('CSP: scripts from this origin and the hashed inline scripts only; no inline handler, eval or wildcard', () => {
  const hashes = [...inlineScriptHashes().keys()].sort();
  assert.ok(hashes.length >= 2, 'the pages carry their theme preload and boot scripts');
  for (const { pattern, csp } of ALL_CSPS) {
    const s = csp['script-src'] || [];
    assert.equal(s[0], "'self'", pattern);
    for (const bad of ["'unsafe-inline'", "'unsafe-eval'", "'unsafe-hashes'", "'strict-dynamic'", '*', 'data:', 'blob:', 'http:', 'https:'])
      assert.ok(!s.includes(bad), `${pattern}: script-src must not allow ${bad}`);
    assert.deepEqual(s.filter(x => x.startsWith("'sha256-")).sort(), hashes,
      `${pattern}: the hashes must be exactly the pages' inline scripts. After editing one, run: node app2/tests/headers-file.js --write`);
    assert.deepEqual(csp['script-src-attr'], ["'none'"], pattern + ': no inline event handlers');
    assert.deepEqual(csp['default-src'], ["'self'"], pattern);
    assert.deepEqual(csp['object-src'], ["'none'"], pattern);
    assert.deepEqual(csp['base-uri'], ["'self'"], pattern);
    assert.deepEqual(csp['form-action'], ["'self'"], pattern);
    for (const [dir, vals] of Object.entries(csp)) assert.ok(!vals.includes('*') && !vals.includes('http:') && !vals.includes('https:'), `${pattern}: ${dir} has a wildcard`);
  }
  assert.equal(withCurrentHashes(HEADERS_TEXT), HEADERS_TEXT, 'headers-file.js --write would change nothing');
});

test('CSP (hotkey.gg): exactly the origins the site loads, and nothing of Stripe until checkout is switched on', () => {
  assert.deepEqual(SITE_CSP['connect-src'], ["'self'", `https://${SUPA}`, `wss://${SUPA}`], 'the Supabase project: REST, Auth and functions over https, Realtime over wss');
  assert.deepEqual(SITE_CSP['style-src'], ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com']);
  assert.deepEqual(SITE_CSP['font-src'], ["'self'", 'https://fonts.gstatic.com']);
  assert.deepEqual(SITE_CSP['img-src'], ["'self'", 'data:', 'blob:']);
  assert.deepEqual(SITE_CSP['frame-src'], ["'none'"]);
  assert.deepEqual(SITE_CSP['worker-src'], ["'none'"]);
  // every external origin a published page links or loads is one the policy names
  const allowed = new Set(Object.values(SITE_CSP).flat());
  for (const f of publishedPages()) {
    const html = readFileSync(f, 'utf8');
    for (const m of html.matchAll(/<(script|link|img|iframe|source|video|audio)\b[^>]*\b(?:src|href)="(https?:\/\/[^"]+)"/gi)) {
      if (/^link$/i.test(m[1]) && /rel="(preconnect|canonical|alternate)"/.test(m[0])) continue;
      assert.ok(allowed.has(new URL(m[2]).origin), `${relative(APP2, f)} loads ${new URL(m[2]).origin}, which the CSP does not allow`);
    }
  }
});

test('no inline event handlers or javascript: URLs anywhere the browser runs (the CSP would block them)', () => {
  const pages = publishedPages().filter(f => !f.includes('/supabase/'));
  for (const f of [...pages, ...sources(/\.js$/)]) {
    const s = readFileSync(f, 'utf8');
    const m = /<[a-z][^>]*\son(click|error|load|submit|change|input|key\w+|mouse\w+|focus|blur)\s*=\s*\\?["']/i.exec(s) || /href\s*=\s*\\?["']javascript:/i.exec(s);
    assert.equal(m, null, `${relative(APP2, f)}: ${m && m[0].slice(0, 80)}`);
  }
});

// ============================================================ edge functions
const req = (body, headers = {}, method = 'POST') => new Request('https://fn.test/x', { method, body, headers });

test('request size: bodies past the cap are refused, by header or by stream', async () => {
  assert.deepEqual(await readBody(req('{"plan":"monthly"}'), 64), { ok: true, text: '{"plan":"monthly"}' });
  assert.deepEqual(await readBody(req('x'.repeat(10), { 'Content-Length': '999999' }), 64), { ok: false, status: 413 }, 'a declared size over the cap');
  const stream = new ReadableStream({ start(c) { for (let i = 0; i < 20; i++) c.enqueue(new TextEncoder().encode('x'.repeat(10))); c.close(); } });
  const r = new Request('https://fn.test/x', { method: 'POST', body: stream, duplex: 'half' });
  assert.deepEqual(await readBody(r, 64), { ok: false, status: 413 }, 'an undeclared stream is cut off at the cap');
  assert.deepEqual(await readJsonInput(req(JSON.stringify({ pad: 'x'.repeat(BODY_LIMITS.json) }))), { ok: false, status: 413 });
  assert.deepEqual(await readJsonInput(req('not json')), { ok: true, input: {} });
  assert.deepEqual(await readJsonInput(req('[1,2]')), { ok: true, input: {} });
  assert.deepEqual(await readJsonInput(req('{"flow":"cancel"}')), { ok: true, input: { flow: 'cancel' } });
  assert.ok(BODY_LIMITS.json <= 16 * 1024 && BODY_LIMITS.webhook <= 1024 * 1024);
});

test('webhook verification: no secret, no signature, a bad signature or an oversized body never reach the handler; each refusal is logged', async () => {
  const logs = [];
  const log = (m, d) => logs.push([m, d]);
  let constructed = 0;
  const good = async (body, sig, secret) => { constructed++; if (sig !== 't=1,v1=good' || secret !== 'whsec') throw new Error('No signatures found matching the expected signature'); return JSON.parse(body); };
  const event = JSON.stringify({ id: 'evt_1', type: 'invoice.paid', data: { object: {} } });
  assert.equal((await verifyWebhook(req(undefined, {}, 'GET'), { secret: 'whsec', construct: good, log })).status, 405);
  assert.equal((await verifyWebhook(req(event, { 'Stripe-Signature': 't=1,v1=good' }), { secret: '', construct: good, log })).status, 400, 'no secret configured: refuse, never skip the check');
  assert.equal((await verifyWebhook(req(event), { secret: 'whsec', construct: good, log })).status, 400, 'no signature header');
  assert.equal((await verifyWebhook(req(event, { 'Stripe-Signature': 't=1,v1=forged' }), { secret: 'whsec', construct: good, log })).status, 400, 'a forged signature');
  assert.equal((await verifyWebhook(req('x'.repeat(100), { 'Stripe-Signature': 't=1,v1=good' }), { secret: 'whsec', construct: good, log, max: 50 })).status, 413);
  assert.equal(logs.length, 5, 'every refusal is a logged security event');
  for (const [m, d] of logs) { assert.equal(m, 'security: webhook refused'); assert.ok(!JSON.stringify(d).includes('whsec'), 'the secret is never logged'); }
  const ok = await verifyWebhook(req(event, { 'Stripe-Signature': 't=1,v1=good' }), { secret: 'whsec', construct: good, log });
  assert.equal(ok.ok, true); assert.equal(ok.event.id, 'evt_1');
  assert.equal(constructed, 2, 'the verifier sees only requests that passed the cheap checks');
});

test('the edge functions use the guards: Stripe verifies the raw body, inputs are capped, CORS names the site', () => {
  const fn = n => readFileSync(join(APP2, 'supabase', 'functions', n, 'index.ts'), 'utf8');
  const hook = fn('stripe-webhook');
  assert.match(hook, /verifyWebhook\(req/);
  assert.match(hook, /constructEventAsync\(body, sig, key/, 'Stripe’s own verifier (HMAC and timestamp tolerance) on the raw body');
  assert.ok(!/req\.(json|text|arrayBuffer)\(/.test(hook), 'the webhook never reads the body around the gate');
  assert.ok(!/Access-Control/.test(hook), 'the webhook is server to server: no CORS');
  for (const n of ['create-checkout', 'billing-portal']) {
    const s = fn(n);
    assert.match(s, /readJsonInput\(req\)/, n + ' caps its input');
    assert.ok(!/req\.(json|text|arrayBuffer)\(/.test(s), n + ' reads no uncapped body');
    assert.match(s, /corsHeaders\(req\.headers\.get\('Origin'\)/, n + ' answers CORS for the site only');
  }
  const shared = readdirSync(join(APP2, 'supabase', 'functions', '_shared')).map(n => readFileSync(join(APP2, 'supabase', 'functions', '_shared', n), 'utf8')).join('\n');
  assert.ok(!/Access-Control-Allow-Origin['"]?\s*:\s*['"]\*/.test(shared + hook), 'no wildcard CORS anywhere');
});

test('CORS lockdown: only the site and the configured preview origins are echoed', () => {
  for (const o of ['https://evil.com', 'null', 'https://hotkey.gg.evil.com', 'http://hotkey.gg', '']) {
    assert.equal(corsHeaders(o, 'https://hotkey.gg', 'https://*.hotkey-gg.pages.dev')['Access-Control-Allow-Origin'], 'https://hotkey.gg', o || '(no origin)');
  }
  assert.equal(corsHeaders('https://abc.hotkey-gg.pages.dev', 'https://hotkey.gg', 'https://*.hotkey-gg.pages.dev')['Access-Control-Allow-Origin'], 'https://abc.hotkey-gg.pages.dev');
  const h = corsHeaders('https://hotkey.gg', 'https://hotkey.gg', '');
  assert.equal(h.Vary, 'Origin'); assert.equal(h['Access-Control-Allow-Methods'], 'POST, OPTIONS');
  assert.equal('Access-Control-Allow-Credentials' in h, false, 'no cookies cross origins');
});

test('server-side prices: whatever the client sends, the price is the server’s lookup for the plan', async () => {
  const calls = [];
  const deps = {
    env: { siteUrl: 'https://hotkey.gg', returnOrigins: '', managedPayments: true }, now: () => 0, log: () => {},
    db: { activeCheckout: async () => false, customerFor: async () => 'cus_1', linkCustomer: async () => null },
    stripe: { priceByLookupKey: async k => ({ hk_monthly: 'price_server' })[k] || null, createCheckoutSession: async p => { calls.push(p); return { client_secret: 'cs' }; } },
  };
  const input = { plan: 'monthly', price: 'price_1cent', amount: 1, unit_amount: 1, line_items: [{ price: 'price_1cent' }], lookup_key: 'hk_free', currency: 'xxx' };
  const r = await createCheckout({ user: { id: 'u1', email: 'a@b.com' }, input }, deps);
  assert.equal(r.status, 200);
  assert.deepEqual(calls[0].line_items, [{ price: 'price_server', quantity: 1 }]);
  assert.ok(!JSON.stringify(calls[0]).includes('1cent') && !('currency' in calls[0]), 'nothing priced by the client reaches Stripe');
});

// ============================================================ auth answers
test('no user enumeration: a taken, unknown or unconfirmed email answers like any other', () => {
  for (const m of ['User already registered', 'A user with this email address has already been registered', 'Signups not allowed for otp'])
    for (const kind of ['signup', 'link', 'code']) assert.deepEqual(enumerationSafe(m, kind), { confirm: true }, `${kind}: ${m}`);
  for (const m of ['Invalid login credentials', 'Email not confirmed', 'User not found'])
    assert.deepEqual(enumerationSafe(m, 'signin'), { error: CREDENTIALS_TEXT }, m);
  assert.deepEqual(enumerationSafe('Password should be at least 8 characters.', 'signup'), { error: 'Password should be at least 8 characters.' }, 'a message about the input itself still shows');
  const auth = readFileSync(join(APP2, 'app', 'auth.js'), 'utf8');
  for (const call of ['signInWithPassword', 'signUp', 'signInWithOtp']) {
    const after = auth.split(`client.auth.${call}(`).slice(1);
    assert.ok(after.length, call);
    for (const a of after) assert.match(a.slice(0, 260), /enumerationSafe\(error\.message/, `every ${call} answer goes through enumerationSafe`);
  }
});

// ============================================================ dev-only files are not served
/** _redirects as Pages reads it: first matching source wins; "*" is a greedy splat. */
function redirectFor(path, text = readFileSync(join(APP2, '_redirects'), 'utf8')) {
  for (const l of text.split('\n').map(x => x.trim()).filter(x => x && !x.startsWith('#'))) {
    const [src, dest, status = '302'] = l.split(/\s+/);
    const rx = new RegExp('^' + src.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
    if (rx.test(path)) return { dest, status: Number(status) };
  }
  return null;
}

test('dev-only files are not served: everything under supabase/ and tests/ redirects away, except what the site imports', () => {
  const all = [];
  const walk = p => { if (statSync(p).isDirectory()) { for (const n of readdirSync(p)) walk(join(p, n)); } else all.push(p); };
  walk(APP2);
  const url = f => '/' + relative(APP2, f).split('\\').join('/');
  const isDev = f => /^\/(supabase|tests)\//.test(url(f)) || /^\/content\/copy\/.*\.csv$/.test(url(f)) || url(f) === '/package.json';
  // what the published site actually loads from those folders: relative imports, followed transitively
  const needed = new Set();
  const follow = f => {
    const s = readFileSync(f, 'utf8');
    for (const m of s.matchAll(/(?:import|from)\s*\(?\s*['"](\.{1,2}\/[^'"]+)['"]/g)) {
      const target = join(f, '..', m[1]);
      if (isDev(target) && !needed.has(target)) { needed.add(target); follow(target); }
    }
  };
  for (const f of all) if (!isDev(f) && /\.(js|html)$/.test(f)) follow(f);
  assert.deepEqual([...needed].map(url), ['/supabase/functions/_shared/student-domains.js'], 'the site imports only the school-domain list from the dev folders');
  for (const f of all) {
    const r = redirectFor(url(f));
    if (needed.has(f)) assert.equal(r, null, `${url(f)} is loaded by the site and must stay served`);
    else if (isDev(f)) assert.ok(r && r.status >= 300 && r.status < 400 && r.dest === '/', `${url(f)} is public: add a rule to app2/_redirects`);
  }
  for (const p of ['/', '/index.html', '/app/main.js', '/content/copy/index.js', '/lessons/accrual-and-cash.html', '/ui/tokens.css']) assert.equal(redirectFor(p), null, p + ' still served');
  assert.equal(redirectFor('/supabase/migrations/0011_billing.sql').dest, '/');
});

// ============================================================ the not-applicable items stay not applicable
test('not applicable, and kept so: no cookies, no uploads, no AI calls, no admin route', () => {
  const client = sources();
  for (const f of client) {
    const s = readFileSync(f, 'utf8');
    const rel = relative(APP2, f);
    assert.ok(!/document\.cookie\s*=/.test(s), `${rel} sets a cookie: the secure cookie flags item now applies`);
    assert.ok(!/type\s*=\s*\\?["']file\\?["']/.test(s), `${rel} has a file input: the upload types item now applies`);
    assert.ok(!/api\.anthropic\.com|api\.openai\.com|generativelanguage\.googleapis|@anthropic-ai|openai/i.test(s), `${rel} calls an AI API: prompt injection and AI caps now apply`);
    assert.ok(!/['"]#\/admin/.test(s), `${rel} has an admin route`);
  }
  for (const f of publishedPages()) assert.ok(!/(^|\/)(admin|wp-admin|phpmyadmin)/i.test(relative(APP2, f)), relative(APP2, f));
  const redirects = readFileSync(join(APP2, '_redirects'), 'utf8');
  assert.match(redirects, /^\/admin\.html \/ 30[12]$/m, 'the old admin page sends people home');
});
