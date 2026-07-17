/* r154 RANK CONSISTENCY + ACCOUNT FLOWS + VISUAL OVERFLOW AUDIT. */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
let pass = 0, fail = 0;
const ok = (c, n, x) => { if (c) { pass++; console.log('  PASS ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' — ' + x : '')); } };

// u1: strong on 6 boards but every field is 2 players → att=6, rank #1 everywhere,
// wsum = 6 × log2(3)/log2(9) ≈ 3 < PROVISIONAL_W(6) → MUST cap at Summer Analyst
// (provisional) on EVERY surface.
const STUB = (opts) => {
  const NOW = Date.now();
  const drills = ['navigation','margin','foot','sort','format','percent'];
  const runs = [];
  drills.forEach((d, i) => {
    runs.push({ user_id: 'u1', challenge: d, time_ms: 20000 + i * 1000, keystrokes: 30, optimal: 28, created_at: new Date(NOW - 86400000 * (i + 1)).toISOString(), trace: [] });
    runs.push({ user_id: 'u2', challenge: d, time_ms: 60000 + i * 1000, keystrokes: 60, optimal: 28, created_at: new Date(NOW - 86400000 * (i + 1)).toISOString(), trace: [] });
  });
  runs.sort((a, b) => a.time_ms - b.time_ms);
  const DATA = {
    profiles: [{ id: 'u1', handle: 'wolfx', flair: null, featured_ach: null, team_code: null, school_tag: null, show_school: false },
               { id: 'u2', handle: 'jane', flair: null, featured_ach: null, team_code: null, school_tag: null, show_school: false }],
    runs, sessions: [], team_members: [], teams: [], team_assignments: [], entitlements: [], events: []
  };
  const mk = rows => { const b = {}; ['eq','gt','lt','order','limit','gte','lte','in'].forEach(f => b[f] = () => b);
    b.single = () => Promise.resolve({ data: rows[0] || null, error: null });
    b.maybeSingle = () => Promise.resolve({ data: rows[0] || null, error: null });
    b.then = (res, rej) => Promise.resolve({ data: rows, error: null }).then(res, rej); return b; };
  window.__rpcLog = [];
  window.supabase = { createClient: () => ({
    auth: {
      getSession: () => Promise.resolve({ data: { session: { user: { id: 'u1', email: 'w@x.com', app_metadata: { provider: 'email' }, created_at: '2026-06-01T00:00:00Z' } } } }),
      getUser: () => Promise.resolve({ data: { user: { id: 'u1', email: 'w@x.com' } } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signOut: () => { window.__signedOut = true; return Promise.resolve({}); },
      updateUser: () => Promise.resolve({ data: {}, error: null })
    },
    from: t => ({ select: () => mk(DATA[t] || []),
      insert: () => Promise.resolve({ data: null, error: null }),
      upsert: () => Promise.resolve((window.__upsertErr ? { data: null, error: { message: window.__upsertErr } } : { data: null, error: null })) }),
    rpc: (name, args) => { window.__rpcLog.push({ name, args });
      if (name === 'my_desk') return Promise.resolve({ data: [], error: null });
      if (window.__rpcErr && window.__rpcErr[name]) return Promise.resolve({ data: null, error: { message: window.__rpcErr[name] } });
      return Promise.resolve({ data: null, error: null }); },
    functions: { invoke: () => Promise.resolve({ data: null, error: 'no' }) }
  }) };
};

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const errs = [];
  const newPage = async (extra) => {
    const p = await browser.newPage();
    p.on('pageerror', e => errs.push(String(e.message || e).slice(0, 140)));
    await p.addInitScript(STUB);
    await p.addInitScript(() => { try {
      localStorage.setItem('hotkey_onboarded', '1'); localStorage.setItem('hk_tour_done', '1');
      localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_beta_ok', '1');
    } catch (e) {} });
    if (extra) await p.addInitScript(extra);
    return p;
  };

  console.log('T1 rank consistency across surfaces (provisional cap)');
  const lb = await newPage();
  await lb.goto('http://127.0.0.1:8791/leaderboard.html', { waitUntil: 'load' });
  await lb.waitForFunction(() => window.DATA || document.querySelector('.state'), null, { timeout: 12000 }).catch(() => {});
  await lb.waitForTimeout(1200);
  const t1lb = await lb.evaluate(() => {
    if (!DATA || !DATA.userStat || !DATA.userStat['u1']) return { err: 'no DATA' };
    const st = DATA.userStat['u1'];
    const t = tierOf(st.avg, st.att, st.wsum);
    return { name: t.name, provisional: !!t.provisional, wsum: st.wsum };
  });
  // canonical
  const canon = await lb.evaluate(() => {
    const st = window.HK_RANK.standing(DATA.runs, 'u1', window.HOTKEY_DRILLS.menuOrder);
    const t = window.HK_RANK.tierOf(st.avgPct, st.att, st.wsum);
    return { name: t.name, provisional: !!t.provisional };
  });
  ok(!t1lb.err && t1lb.name === canon.name, 'leaderboard tier == canonical tier', JSON.stringify({ lb: t1lb, canon }));
  ok(canon.provisional && t1lb.provisional, 'provisional cap applies on the boards too', JSON.stringify(t1lb));
  // nav pill (written to sessionStorage by navRank)
  const t1nav = await lb.evaluate(() => new Promise(res => {
    let n = 0; const iv = setInterval(() => {
      const c = sessionStorage.getItem('hk_rank3');
      if (c) { clearInterval(iv); res(JSON.parse(c).n); }
      if (++n > 40) { clearInterval(iv); res(null); }
    }, 300);
  }));
  ok(t1nav === canon.name, 'nav rank pill agrees', String(t1nav));
  await lb.close();

  console.log('T2 account page: tier + handle flows');
  const ac = await newPage();
  await ac.goto('http://127.0.0.1:8791/account.html', { waitUntil: 'load' });
  await ac.waitForSelector('#acHandle', { timeout: 12000 });
  const t2 = await ac.evaluate(() => ({
    tier: (document.querySelector('.pc-tier span:last-child') || {}).textContent || (document.querySelector('.pc-tier') || {}).textContent || '',
  }));
  ok(t2.tier.indexOf(canon.name) >= 0, 'account title card shows the same tier', t2.tier);
  await ac.fill('#acHandle', 'wolf_x2');
  await ac.click('#acHandleSave');
  await ac.waitForTimeout(300);
  const t2b = await ac.evaluate(() => (document.getElementById('acHandleMsg') || {}).textContent || '');
  ok(/Saved/.test(t2b), 'handle save success message', t2b);
  await ac.evaluate(() => { window.__upsertErr = 'HANDLE_COOLDOWN:2026-07-20'; });
  await ac.click('#acHandleSave');
  await ac.waitForTimeout(300);
  const t2c = await ac.evaluate(() => (document.getElementById('acHandleMsg') || {}).textContent || '');
  ok(/7 days/.test(t2c) && /2026-07-20/.test(t2c), 'cooldown error maps to plain words', t2c);
  await ac.evaluate(() => { window.__upsertErr = null; });
  // desk create: protected-name error mapping
  const t2d = await ac.evaluate(async () => {
    window.__rpcErr = { create_desk: 'DESK_NAME_PROTECTED' };
    const n = document.getElementById('deskName'); if (!n) return 'no desk form';
    n.value = 'Goldman Sachs TMT';
    document.getElementById('deskCreate').click();
    await new Promise(r => setTimeout(r, 300));
    return (document.getElementById('deskMsg') || {}).textContent || '';
  });
  ok(/reserved|verified/.test(t2d), 'protected desk name maps to plain words', t2d);
  await ac.close();

  console.log('T3 password recovery + sign out');
  const rc = await newPage();
  await rc.goto('http://127.0.0.1:8791/index.html#type=recovery', { waitUntil: 'load' });
  await rc.waitForTimeout(1500);
  const t3 = await rc.evaluate(() => {
    const am = document.querySelector('.auth-modal');
    const up = am && getComputedStyle(am).display !== 'none';
    return { up, txt: up ? am.textContent.slice(0, 200) : '' };
  });
  ok(t3.up && /password/i.test(t3.txt), 'recovery link opens the set-password flow', t3.txt.slice(0, 60));
  const t3b = await rc.evaluate(async () => {
    localStorage.setItem('hk_handle_cache', 'wolfx');
    if (window.sb) await window.sb.auth.signOut();
    return { called: !!window.__signedOut };
  });
  ok(t3b.called, 'sign-out reaches the auth layer');
  await rc.close();

  console.log('T4 visual overflow sweep (2 themes × 5 pages)');
  for (const theme of ['default', 'daylight']) {
    for (const url of ['index.html', 'leaderboard.html', 'stats.html', 'account.html', 'reference.html']) {
      const p = await newPage(`try{ localStorage.setItem('hotkey_theme','${theme}'); }catch(e){}`);
      await p.goto('http://127.0.0.1:8791/' + url, { waitUntil: 'load' });
      await p.waitForTimeout(900);
      const over = await p.evaluate(() => Math.max(0, document.documentElement.scrollWidth - window.innerWidth));
      ok(over <= 1, url + ' @ ' + theme + ': no horizontal overflow', 'over=' + over);
      await p.close();
    }
  }

  const realErrors = errs.filter(e => !/supabase|Failed to fetch|NetworkError|ERR_/i.test(e));
  ok(realErrors.length === 0, 'zero page errors across the audit', realErrors.join(' | '));
  await browser.close();
  console.log((fail ? 'RANK/ACCOUNT AUDIT: ' + fail + ' FAILURE(S), ' : 'RANK/ACCOUNT AUDIT: ALL ') + pass + ' PASS');
  process.exit(fail ? 1 : 0);
})();
