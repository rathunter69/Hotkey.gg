/* LEADERBOARD E2E (r339) — permanent gate coverage for the ranking surface.
   Supabase is blocked in CI, so the suite injects a synthetic DATA field (the same shape
   load() builds) and drives renderAll() + the real DOM. Covers:
     A. tier sub-menu on the drill boards (r335): dropdown, bucket chips, n-of-m note, restore
     B. ranked entry (r336): gate card -> placement checklist -> tier card; enter-ranked copy
     C. nav rank pill (r336): Unranked -> placement n/5 -> tier (stubbed sb + auth)
     D. seed-field sanity: dev/seed-field.sql parses back and renders non-empty boards
   Run: python3 -m http.server 8791 &  ·  node dev/e2e-lb.js */
'use strict';
const { chromium } = require('playwright-core');
const fs = require('fs');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/leaderboard.html';
let pass = 0, fail = 0;
const ok = (c, n, x) => { if (c) { pass++; console.log('  PASS ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' — ' + x : '')); } };

const PKEYS = ['navigation', 'dress', 'margin', 'sort', 'opmodel'];

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 150)));
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof renderAll === 'function' && typeof CH !== 'undefined' && !!window.HK_PLACEMENT);

  // ---------- A. tier sub-menu ----------
  console.log('A. tier sub-menu on the boards');
  const a1 = await page.evaluate(() => {
    const users = []; for (let i = 0; i < 12; i++) users.push('u' + i);
    const names = {}; users.forEach((u, i) => names[u] = 'Player_' + i);
    const keys = CH.slice(0, 2).map(c => c.key);
    const runs = []; users.forEach((u, i) => keys.forEach(k =>
      runs.push({ user_id: u, challenge: k, time_ms: 8000 + i * 900, created_at: '2026-01-0' + (1 + (i % 9)) })));
    const perDrill = {}; CH.forEach(c => perDrill[c.key] = []);
    const seen = {};
    runs.slice().sort((x, y) => x.time_ms - y.time_ms).forEach(r => {
      const kk = r.challenge + '|' + r.user_id;
      if (!seen[kk]) { seen[kk] = true; perDrill[r.challenge].push(r); } });
    const userStat = {}; users.forEach((u, i) => userStat[u] = { att: 20, avg: i / 11, wsum: 30, sum: 0, crowns: 0, pod: 0, t10: 0 });
    window.__f = { users, names, runs, perDrill, userStat };
    DATA = { perDrill, names, meId: 'u3', myTeam: null, teamOnly: false, viewDesk: null, myDesk: null,
      fRuns: runs, fSessions: [], userStat, gUserStat: userStat,
      profs: users.map(u => ({ id: u, handle: names[u] })), runs, sessions: [] };
    try { localStorage.setItem('hk_ranked', '1'); } catch (e) {}
    sessionStorage.removeItem('hk_lb_tier'); sessionStorage.removeItem('hk_lb_bucket');
    tierFilter = 'all'; bucketFilter = 'all';
    renderAll();
    const sel = document.getElementById('tierSel');
    return { hasSel: !!sel, opts: sel ? sel.options.length : 0,
      rows: document.querySelectorAll('.browse-detail .board .row:not(.open)').length };
  });
  ok(a1.hasSel, 'tier dropdown renders on the drill board');
  ok(a1.opts >= 9, 'dropdown lists the full ladder', 'opts=' + a1.opts);
  ok(a1.rows === 10, 'unfiltered board shows the top 10', 'rows=' + a1.rows);

  const a2 = await page.evaluate(() => {
    const st = DATA.userStat['u3']; const t = TIER_OF(st.avg, st.att, st.wsum);
    const sel = document.getElementById('tierSel'); sel.value = t.name; sel.onchange();
    return { tier: t.name,
      rows: document.querySelectorAll('.browse-detail .board .row:not(.open)').length,
      chips: document.querySelectorAll('.chip[data-bucket]').length,
      note: (document.querySelector('.tf-note') || {}).textContent || '' };
  });
  ok(a2.rows > 0 && a2.rows < 12, 'picking a tier narrows and re-ranks the board', 'rows=' + a2.rows);
  ok(a2.chips === 4, 'bucket chips appear once a tier is picked');
  ok(/of 12 on this board/.test(a2.note), 'n-of-m note reports the filtered field');

  const a3 = await page.evaluate(() => {
    const sel = document.getElementById('tierSel'); sel.value = 'all'; sel.onchange();
    return { rows: document.querySelectorAll('.browse-detail .board .row:not(.open)').length,
      chips: document.querySelectorAll('.chip[data-bucket]').length };
  });
  ok(a3.rows === 10 && a3.chips === 0, 'tier=all restores the board and hides the chips');

  // ---------- B. ranked entry states ----------
  console.log('B. ranked entry: gate -> placement -> tier');
  const b1 = await page.evaluate(() => {
    localStorage.removeItem('hk_ranked'); localStorage.setItem('hk_dev_unlock', '1');
    renderAll();
    return (document.querySelector('.panel.me') || {}).textContent || '';
  });
  ok(/Enter Ranked/.test(b1), 'not opted in: Enter-Ranked gate card');

  const b2 = await page.evaluate((PKEYS) => {
    localStorage.setItem('hk_ranked', '1');
    const f = window.__f;
    const done = PKEYS.slice(0, 2);
    const runs = f.runs.slice();
    done.forEach(k => runs.push({ user_id: 'u3', challenge: k, time_ms: 9000, created_at: '2026-01-02' }));
    DATA.fRuns = runs;
    renderAll();
    const hero = document.querySelector('.panel.me');
    return { text: hero ? hero.textContent : '',
      links: [...document.querySelectorAll('.pl-go')].map(a => a.getAttribute('href')) };
  }, PKEYS);
  ok(/Placement series — 2\/5/.test(b2.text), 'mid-placement: checklist shows 2/5', b2.text.slice(0, 60));
  ok(b2.links.length === 3 && b2.links.every(h => /index\.html\?drill=/.test(h)), 'remaining boards deep-link into the trainer');

  const b3 = await page.evaluate((PKEYS) => {
    const runs = DATA.fRuns.slice();
    PKEYS.forEach(k => runs.push({ user_id: 'u3', challenge: k, time_ms: 9000, created_at: '2026-01-02' }));
    DATA.fRuns = runs;
    renderAll();
    return (document.querySelector('.panel.me') || {}).textContent || '';
  }, PKEYS);
  ok(!/Placement series/.test(b3) && /LVL /.test(b3), 'all five posted: normal tier card returns');

  const b4 = await page.evaluate(() => {
    rankedInfographic();
    const has = /placement series/i.test(document.body.textContent);
    const go = document.getElementById('rankedGo');
    let m = go; while (m && m.parentElement !== document.body) m = m.parentElement;
    if (m) m.remove();
    return has;
  });
  ok(b4, 'enter-ranked infographic names the placement series');

  // ---------- C. nav rank pill ----------
  console.log('C. nav rank pill honors the opt-in');
  const pill = async (opted, doneKeys) => {
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForFunction(() => !!document.getElementById('navRankPill'));
    return page.evaluate(({ opted, doneKeys }) => new Promise(res => {
      try { if (opted) localStorage.setItem('hk_ranked', '1'); else localStorage.removeItem('hk_ranked'); } catch (e) {}
      sessionStorage.removeItem('hk_rank3');
      const runs = [];
      ['u1', 'u2', 'u3'].forEach((u, i) => doneKeys.forEach(k =>
        runs.push({ user_id: u, challenge: k, time_ms: 9000 + i * 500, created_at: '2026-01-01' })));
      const table = (rows) => { const b = { select: () => b, eq: () => b, order: () => b, limit: () => b,
        then: (f) => Promise.resolve({ data: rows }).then(f) }; return b; };
      window.sb = { from: (t) => t === 'profiles'
          ? table([{ id: 'u1', handle: 'Alpha' }, { id: 'u2', handle: 'Bravo' }, { id: 'u3', handle: 'Me' }])
          : t === 'runs' ? table(runs) : table([]),
        auth: { getSession: async () => ({ data: { session: { user: { id: 'u3' } } } }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) } };
      window._navUser = { id: 'u3' };
      let tries = 0; const iv = setInterval(() => {
        const el = document.getElementById('navRankPill');
        if (el && el.style.display !== 'none' && el.textContent.trim()) { clearInterval(iv); res(el.textContent.trim()); }
        else if (++tries > 16) { clearInterval(iv); res('(never rendered)'); }
      }, 400);
    }), { opted, doneKeys });
  };
  ok((await pill(false, PKEYS)) === 'Unranked', 'pill: not opted in -> Unranked');
  ok(/placement 3\/5/.test(await pill(true, PKEYS.slice(0, 3))), 'pill: mid-placement -> placement 3/5');
  const p3 = await pill(true, PKEYS);
  ok(!/placement|Unranked|never/.test(p3) && p3.length > 2, 'pill: placement complete -> tier', p3);

  // ---------- D. seed field renders ----------
  console.log('D. seed field parses + renders');
  const sql = fs.readFileSync(require('path').join(__dirname, 'seed-field.sql'), 'utf8');
  const profs = [...sql.matchAll(/\('(5eed0000-[0-9a-f-]+)', '([^']+)', false\)/g)].map(m => ({ id: m[1], handle: m[2] }));
  const runs = [...sql.matchAll(/\('(5eed0000-[0-9a-f-]+)', '([a-z0-9]+)', (\d+), false, '([^']+)'\)/g)]
    .map(m => ({ user_id: m[1], challenge: m[2], time_ms: +m[3], created_at: m[4] }));
  ok(profs.length === 50, 'seed SQL holds 50 players', String(profs.length));
  ok(runs.length > 1000, 'seed SQL holds a full run set', String(runs.length));
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof renderAll === 'function');
  const d1 = await page.evaluate(({ profs, runs }) => {
    const names = {}; profs.forEach(x => names[x.id] = x.handle);
    const perDrill = {}; CH.forEach(c => perDrill[c.key] = []);
    const seen = {};
    runs.slice().sort((a, b) => a.time_ms - b.time_ms).forEach(r => {
      if (perDrill[r.challenge] === undefined) return;
      const k = r.challenge + '|' + r.user_id;
      if (!seen[k]) { seen[k] = true; perDrill[r.challenge].push(r); } });
    const userStat = {};
    profs.forEach(x => { const st = window.HK_RANK.standing(runs, x.id, CH.map(c => c.key));
      if (st && st.att) userStat[x.id] = { att: st.att, avg: st.avgPct, wsum: st.wsum, sum: 0, crowns: 0, pod: 0, t10: 0 }; });
    DATA = { perDrill, names, meId: null, myTeam: null, teamOnly: false, viewDesk: null, myDesk: null,
      fRuns: runs, fSessions: [], userStat, gUserStat: userStat, profs, runs, sessions: [] };
    renderAll();
    const firstBoard = document.querySelectorAll('.browse-detail .board .row:not(.open)').length;
    const rosterRows = document.querySelectorAll('.ros-row').length;
    return { firstBoard, rosterRows };
  }, { profs, runs });
  ok(d1.firstBoard >= 8, 'seed field fills the detail board', 'rows=' + d1.firstBoard);
  ok(d1.rosterRows > 0, 'seed field populates the tier roster');

  ok(errs.length === 0, 'zero page errors', errs.join(' | '));
  console.log(fail === 0 ? ('LB SUITE: ALL ' + pass + ' PASS') : ('LB SUITE: ' + fail + ' FAILURE(S) of ' + (pass + fail)));
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
