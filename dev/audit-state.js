'use strict';
// September 17 audit reproduction. Synthetic data only; all external traffic blocked.
const { chromium } = require('playwright-core');
const { createServer } = require('./serve');

(async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.CHROME, headless: true });
    console.log('Browser:', browser.version());
    const context = await browser.newContext();
    await context.route('**/*', r => new URL(r.request().url()).origin === origin ? r.continue() : r.abort());
    const page = await context.newPage();
    await page.goto(origin + '/index.html');
    await page.waitForFunction(() => typeof cur !== 'undefined' && typeof clearAccountUI === 'function');
    await page.evaluate(() => { markOnboarded(); loadChallenge('autofit'); });
    await page.waitForFunction(() => localStorage.getItem('hotkey_last_drill') === 'autofit');
    const signedOut = await page.evaluate(() => {
      clearAccountUI();
      return { lastDrill: localStorage.getItem('hotkey_last_drill'), onboarded: localStorage.getItem('hotkey_onboarded') };
    });
    await page.goto(origin + '/index.html?fresh=1');
    await page.waitForFunction(() => typeof cur !== 'undefined' && !!cur);
    signedOut.resumedDrill = await page.evaluate(() => cur);
    console.log('SIGNOUT', JSON.stringify(signedOut));
    const snapshot = await page.evaluate(async () => {
      localStorage.setItem('hk_guide_navigation', 'done');
      const writes = [];
      window._navUser = { id: 'audit-user' };
      window.sb = { from: () => ({ update: value => ({ eq: async () => { writes.push(value); return { error: null }; } }) }) };
      hkStatePush();
      await new Promise(resolve => setTimeout(resolve, 2800));
      return writes.map(w => Object.keys(w.client_state));
    });
    console.log('SYNC_FIELDS', JSON.stringify(snapshot));
    await context.close();

    const boards = await browser.newContext();
    await boards.route('**/*', r => new URL(r.request().url()).origin === origin ? r.continue() : r.abort());
    await boards.addInitScript(() => {
      window.__auditMode = 'limited';
      window.__auditReads = [];
      const rows = [
        { user_id: 'audit-a', challenge: 'navigation', time_ms: 5000, keystrokes: 15, optimal: 15 },
        { user_id: 'audit-b', challenge: 'navigation', time_ms: 6000, keystrokes: 15, optimal: 15 },
        { user_id: 'audit-c', challenge: 'autofit', time_ms: 25000, keystrokes: 25, optimal: 25 },
      ];
      function builder(table) {
        const filters = [];
        const b = {};
        ['select', 'eq', 'in', 'order', 'limit', 'range', 'gt', 'gte', 'lt', 'lte'].forEach(name => b[name] = (...args) => { filters.push([name, ...args]); return b; });
        b.then = (resolve, reject) => {
          window.__auditReads.push({ table, filters });
          const error = table === 'runs' && window.__auditMode === 'error' ? { message: 'simulated database unavailable' } : null;
          const data = table === 'runs' ? (error ? null : window.__auditMode === 'full' ? rows : rows.slice(0, 2)) : [];
          return Promise.resolve({ data, error }).then(resolve, reject);
        };
        b.single = b.maybeSingle = () => Promise.resolve({ data: null, error: null });
        return b;
      }
      window.supabase = { createClient: () => ({
        auth: { getSession: async () => ({ data: { session: null } }), getUser: async () => ({ data: { user: null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) },
        from: builder,
        rpc: async () => ({ data: null, error: null }),
      }) };
    });
    const boardPage = await boards.newPage();
    await boardPage.goto(origin + '/leaderboard.html');
    await boardPage.waitForFunction(() => typeof DATA !== 'undefined' && DATA !== null);
    const bounded = await boardPage.evaluate(async () => {
      const partial = { runs: DATA.runs.length, autofitEntries: DATA.perDrill.autofit.length };
      window.__auditMode = 'full';
      await load();
      const full = { runs: DATA.runs.length, autofitEntries: DATA.perDrill.autofit.length };
      window.__auditMode = 'error';
      await load();
      const text = document.getElementById('boards').innerText;
      return { partial, full, error: { runs: DATA.runs.length, shownAsUnavailable: /couldn.t load|unreachable|unavailable/i.test(text), shownAsEmpty: /no runs yet|claim this board/i.test(text) }, runQueries: window.__auditReads.filter(q => q.table === 'runs') };
    });
    console.log('LEADERBOARD', JSON.stringify(bounded));
    await boards.close();
  } finally {
    if (browser) await browser.close();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
