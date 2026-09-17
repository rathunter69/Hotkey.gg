'use strict';
// Actual shared scripts, synthetic users and deferred responses. No external traffic.
const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');
const { newIsolatedContext } = require('./browser-isolation');
const BASE = process.env.BASE || 'http://127.0.0.1:8791';

function fixtures() {
  const users = { a: { id: 'user-a', email: 'a@example.test' }, b: { id: 'user-b', email: 'b@example.test' } };
  const profiles = Object.values(users).map(u => ({ id: u.id, handle: u.id, flair: null }));
  const runs = [{ user_id: 'user-a', challenge: 'navigation', time_ms: 10000, keystrokes: 20, optimal: 20 }];
  let current = users.a;
  const callbacks = [], holds = [], reads = [], writes = [];
  function query(table) {
    let columns = '', filters = [], write;
    const b = {};
    b.select = c => { columns = c; return b; };
    ['eq', 'lte', 'order', 'limit', 'in'].forEach(k => b[k] = (...v) => { filters.push([k, ...v]); return b; });
    b.update = b.insert = v => { write = v; return b; };
    const execute = single => {
      const id = (filters.find(f => f[0] === 'eq' && ['id', 'user_id'].includes(f[1])) || [])[2];
      const request = { table, columns, id, user: current && current.id, write };
      (write ? writes : reads).push(request);
      let data = table === 'profiles' ? profiles.filter(p => !id || p.id === id) : table === 'runs' ? runs : [];
      if (single) data = data[0] || null;
      if (columns === 'client_state') data = { client_state: { ach_flags: { fixtureA: id === 'user-a' } } };
      const result = { data, error: null, count: 12 };
      const hold = holds.find(h => !h.used && h.table === table && (!h.columns || h.columns === columns));
      if (hold) { hold.used = true; return new Promise((resolve, reject) => { hold.resolve = dataOverride => resolve(dataOverride ? { ...result, data: dataOverride } : result); hold.reject = () => reject(new Error('synthetic failure')); }); }
      return Promise.resolve(result);
    };
    b.then = (yes, no) => execute(false).then(yes, no);
    b.maybeSingle = b.single = () => execute(true);
    return b;
  }
  window.fixture = {
    reads, writes, holds,
    hold(table, columns) { holds.push({ table, columns }); return holds.length - 1; },
    release(i, fail, dataOverride) { holds[i][fail ? 'reject' : 'resolve'](dataOverride); },
    subscriptions() { return callbacks.length; },
    initialGuest() { current = null; callbacks.forEach(cb => cb('INITIAL_SESSION', null)); },
    switchTo(key) { current = users[key] || null; callbacks.forEach(cb => cb(current ? 'SIGNED_IN' : 'SIGNED_OUT', current ? { user: current } : null)); },
  };
  window.sb = {
    auth: {
      getSession: () => {
        const result = { data: { session: current ? { user: current } : null } };
        const hold = holds.find(h => !h.used && h.table === 'auth');
        if (hold) { hold.used = true; return new Promise(resolve => { hold.resolve = () => resolve(result); }); }
        return Promise.resolve(result);
      },
      onAuthStateChange: cb => { callbacks.push(cb); return { data: { subscription: { unsubscribe() {} } } }; },
    },
    from: query, rpc: async () => ({ data: false, error: null }),
  };
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME, headless: true });
  let passed = 0;
  try {
    async function shell(late = false, guest = false) {
      const context = await newIsolatedContext(browser, BASE);
      await context.route('**/*', route => {
        const url = new URL(route.request().url());
        if (url.origin !== BASE) return route.abort();
        if (url.pathname === '/__account_fixture.html') return route.fulfill({ contentType: 'text/html', body: '<!doctype html><div id="navMount"></div>' + (guest ? '<script>fixture.initialGuest(); localStorage.setItem("hotkey_pb","{\\"navigation\\":12345}"); localStorage.setItem("hotkey_last_drill","autofit"); localStorage.setItem("hk_guide_navigation","done");</script>' : '') + (late ? '<script>window.lateClient=window.sb; window.sb=null;</script>' : '') + '<script src="themes.js"></script><script src="drills.js"></script><script src="nav.js"></script>' + (late ? '<script>window.sb=window.lateClient; window.__navAuthKick();</script>' : '') + (guest ? '<script>fixture.initialGuest();</script>' : '') });
        return route.fallback();
      });
      await context.addInitScript(fixtures);
      const page = await context.newPage();
      await page.goto(BASE + '/__account_fixture.html');
      await page.waitForFunction(g => g ? !!document.getElementById('authSignInBtn') : document.getElementById('userBtn')?.textContent.includes('user-a'), guest);
      return { context, page };
    }
    async function switched(page, key) {
      await page.evaluate(k => fixture.switchTo(k), key);
      await page.waitForFunction(k => k ? document.getElementById('userBtn')?.textContent.includes('user-' + k) : !!document.getElementById('authSignInBtn'), key);
    }
    async function check(name, fn) { await fn(); passed++; console.log('PASS ' + name); }

    await check('initial null session preserves returning guest progress', async () => {
      const { context, page } = await shell(true, true);
      assert.equal(await page.evaluate(() => localStorage.getItem('hotkey_pb')), '{"navigation":12345}');
      assert.equal(await page.evaluate(() => localStorage.getItem('hotkey_last_drill')), 'autofit');
      assert.equal(await page.evaluate(() => localStorage.getItem('hk_guide_navigation')), 'done');
      await context.close();
    });

    await check('trainer-style late client initialization observes account changes', async () => {
      const { context, page } = await shell(true);
      await page.evaluate(() => openProfile());
      await switched(page, 'b'); await page.evaluate(() => openProfile());
      await page.evaluate(async () => { await __navAuthKick(); await __navAuthKick(); });
      assert.equal(await page.evaluate(() => fixture.subscriptions()), 1);
      assert.equal(await page.evaluate(() => localStorage.getItem('hk_xp_uid')), 'user-b');
      assert.equal(await page.evaluate(() => localStorage.getItem('hk_xp_est')), '0');
      await switched(page, null);
      assert.equal(await page.evaluate(() => _navProfile), null);
      await context.close();
    });

    await check('same-account refresh preserves local progress', async () => {
      const { context, page } = await shell();
      await page.evaluate(() => { localStorage.setItem('hk_guide_navigation', 'done'); localStorage.setItem('hotkey_last_drill', 'autofit'); fixture.switchTo('a'); });
      await page.evaluate(() => __navAuthKick());
      assert.equal(await page.evaluate(() => localStorage.getItem('hk_guide_navigation')), 'done');
      assert.equal(await page.evaluate(() => localStorage.getItem('hotkey_last_drill')), 'autofit');
      await context.close();
    });

    await check('profile cache belongs to the account and same-user calls reuse it', async () => {
      const { context, page } = await shell();
      await page.evaluate(() => openProfile());
      const a = await page.evaluate(() => ({ xp: localStorage.getItem('hk_xp_est'), reads: fixture.reads.filter(r => r.table === 'runs').length }));
      await page.evaluate(() => openProfile());
      assert.equal(await page.evaluate(() => fixture.reads.filter(r => r.table === 'runs').length), a.reads);
      await page.evaluate(() => localStorage.setItem('sb-fixture-auth-token', 'keep-b-session'));
      await switched(page, 'b');
      await page.evaluate(() => openProfile());
      const b = await page.evaluate(() => ({ owner: localStorage.getItem('hk_xp_uid'), xp: localStorage.getItem('hk_xp_est'), reads: fixture.reads.filter(r => r.table === 'runs').length, token: localStorage.getItem('sb-fixture-auth-token') }));
      assert.equal(b.owner, 'user-b'); assert.equal(b.xp, '0'); assert.ok(Number(a.xp) > 0); assert.ok(b.reads > a.reads); assert.equal(b.token, 'keep-b-session');
      await context.close();
    });

    for (const target of ['b', null]) await check('late profile response cannot repaint ' + (target || 'signed-out state'), async () => {
      const { context, page } = await shell();
      const hold = await page.evaluate(() => fixture.hold('profiles', 'handle,flair,theme'));
      await page.evaluate(() => { window.pendingKick = __navAuthKick(); });
      await page.waitForFunction(i => fixture.holds[i].used, hold);
      await switched(page, target);
      await page.evaluate(i => fixture.release(i), hold);
      await page.evaluate(() => pendingKick);
      const state = await page.evaluate(() => ({ id: _navUser && _navUser.id, profile: _navProfile && _navProfile.handle, flags: localStorage.getItem('hk_ach_flags'), text: document.getElementById('authSlot').textContent }));
      assert.equal(state.id, target ? 'user-b' : null); assert.notEqual(state.profile, 'user-a'); assert.ok(!state.flags?.includes('"fixtureA":true')); assert.ok(!state.text.includes('user-a'));
      await context.close();
    });

    await check('old in-flight card cannot restore A data after A → B → A', async () => {
      const { context, page } = await shell();
      await switched(page, 'b');
      const hold = await page.evaluate(() => fixture.hold('runs'));
      await switched(page, 'a');
      await page.evaluate(() => { window.oldCard = openProfile(); });
      await page.waitForFunction(i => fixture.holds[i].used, hold);
      await switched(page, 'b'); await switched(page, 'a');
      await page.evaluate(() => openProfile());
      const before = await page.evaluate(() => document.getElementById('profileModal').innerHTML);
      await page.evaluate(i => fixture.release(i, false, [{ user_id: 'user-a', challenge: 'combo', time_ms: 99999, keystrokes: 100, optimal: 50 }]), hold); await page.evaluate(() => oldCard);
      assert.equal(await page.evaluate(() => document.getElementById('profileModal').innerHTML), before);
      await context.close();
    });

    for (const table of ['auth', 'client_state']) await check('delayed ' + table + ' cannot restore A after switch', async () => {
      const { context, page } = await shell();
      const hold = await page.evaluate(t => fixture.hold(t === 'auth' ? 'auth' : 'profiles', t === 'auth' ? null : t), table);
      await page.evaluate(() => { window.pendingKick = __navAuthKick(); });
      await page.waitForFunction(i => fixture.holds[i].used, hold);
      await switched(page, 'b');
      await page.evaluate(i => fixture.release(i), hold); await page.evaluate(() => pendingKick);
      assert.equal(await page.evaluate(() => _navUser.id), 'user-b');
      assert.ok(!(await page.evaluate(() => localStorage.getItem('hk_ach_flags')))?.includes('"fixtureA":true'));
      await context.close();
    });

    await check('pending account-state push is cancelled on switch', async () => {
      const { context, page } = await shell();
      await page.evaluate(() => { localStorage.setItem('hk_ach_flags', '{"fixtureA":true}'); hkStatePush(); fixture.switchTo('b'); });
      await page.waitForTimeout(2700); // Deliberately exceed the production debounce.
      const writes = await page.evaluate(() => fixture.writes.filter(w => w.write?.client_state));
      assert.ok(writes.every(w => w.id !== 'user-b' || !w.write.client_state.ach_flags.fixtureA));
      await context.close();
    });

    await check('late founding-rank result cannot restore account flags', async () => {
      const { context, page } = await shell();
      const hold = await page.evaluate(() => fixture.hold('profiles', 'id'));
      await page.evaluate(() => hkFoundingRank(sb, { ..._navUser, created_at: '2026-01-01' }));
      await page.waitForFunction(i => fixture.holds[i].used, hold);
      await switched(page, 'b'); await page.evaluate(i => fixture.release(i), hold);
      assert.equal(await page.evaluate(() => localStorage.getItem('hk_founding')), null);
      await context.close();
    });

    await check('late cosmetic read cannot write to the next account', async () => {
      const { context, page } = await shell();
      const hold = await page.evaluate(() => fixture.hold('profiles', 'flair'));
      await page.evaluate(() => hkCelebrate({ title: 'Synthetic unlock', equip: { frameId: 'classic', frameName: 'Fixture' } }));
      await page.locator('.hk-cel-equip').click();
      await page.waitForFunction(i => fixture.holds[i].used, hold);
      await switched(page, 'b'); await page.evaluate(i => fixture.release(i), hold);
      assert.equal(await page.evaluate(() => fixture.writes.filter(w => w.write && 'flair' in w.write).length), 0);
      await context.close();
    });

    await check('failed profile load can be retried', async () => {
      const { context, page } = await shell();
      const hold = await page.evaluate(() => fixture.hold('runs'));
      await switched(page, 'b');
      await page.evaluate(() => { window.failedCard = openProfile(); });
      await page.waitForFunction(i => fixture.holds[i].used, hold);
      await page.evaluate(i => fixture.release(i, true), hold); await page.evaluate(() => failedCard);
      const before = await page.evaluate(() => fixture.reads.filter(r => r.table === 'runs').length);
      await page.evaluate(() => openProfile());
      assert.ok(await page.evaluate(n => fixture.reads.filter(r => r.table === 'runs').length > n, before));
      assert.ok(!(await page.locator('#profileModal').innerText()).includes('Couldn’t load'));
      await context.close();
    });

    await check('sign-out clears resume state, closes the card and preserves device preferences', async () => {
      const { context, page } = await shell();
      await page.evaluate(() => { localStorage.setItem('hotkey_last_drill', 'autofit'); localStorage.setItem('hotkey_theme', 'terminal'); localStorage.setItem('hotkey_onboarded', '1'); });
      await page.evaluate(() => openProfile()); await switched(page, null);
      const state = await page.evaluate(() => ({ drill: localStorage.getItem('hotkey_last_drill'), theme: localStorage.getItem('hotkey_theme'), onboarding: localStorage.getItem('hotkey_onboarded'), card: document.getElementById('profileModal').classList.contains('show') }));
      assert.equal(state.drill, null); assert.equal(state.theme, 'terminal'); assert.equal(state.onboarding, '1'); assert.equal(state.card, false);
      // Real trainer consumes the same resume key after reload; no synthetic Supabase here.
      await context.close();
      const real = await newIsolatedContext(browser, BASE);
      const trainer = await real.newPage(); await trainer.goto(BASE + '/index.html');
      await trainer.waitForFunction(() => typeof loadChallenge === 'function');
      await trainer.evaluate(() => { localStorage.setItem('hk_gate_off', '1'); markOnboarded(); loadChallenge('autofit'); clearAccountUI(); });
      await trainer.reload(); await trainer.waitForFunction(() => typeof cur !== 'undefined' && !!cur);
      assert.notEqual(await trainer.evaluate(() => cur), 'autofit');
      await real.close();
    });
    console.log(`ACCOUNT ISOLATION: ${passed} scenarios passed`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
