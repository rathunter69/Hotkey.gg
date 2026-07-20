/* LEADERBOARD E2E (r339) — permanent gate coverage for the ranking surface.
   Supabase is blocked in CI, so the suite injects a synthetic DATA field (the same shape
   load() builds) and drives renderAll() + the real DOM. Covers:
     A. tier sub-menu on the drill boards (r335): dropdown, bucket chips, n-of-m note, restore
     B. ranked entry (r336): gate card -> placement checklist -> tier card; enter-ranked copy
     C. nav rank pill (r336): Unranked -> placement n/5 -> tier (stubbed sb + auth)
     D. seed-field sanity: dev/seed-field.sql parses back and renders non-empty boards\n     E. account-state sync (r358): hkStateHydrate merge rules — flags/seen/streak/ranked
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
  // NOTE: the page's own boot-time load() settles LATE with Supabase blocked and reassigns
  // DATA — so every section must (re)inject DATA and read the DOM in the SAME evaluate tick.
  const inject = `DATA = { perDrill: window.__f.perDrill, names: window.__f.names, meId: 'u3',
    myTeam: null, teamOnly: false, viewDesk: null, myDesk: null,
    fRuns: window.__f.runs.slice(), fSessions: [], userStat: window.__f.userStat,
    gUserStat: window.__f.userStat, profs: Object.keys(window.__f.names).map(u => ({ id: u, handle: window.__f.names[u] })),
    runs: window.__f.runs, sessions: [] };`;
  const b1 = await page.evaluate((inject) => {
    localStorage.removeItem('hk_ranked'); localStorage.setItem('hk_dev_unlock', '1');
    eval(inject); renderAll();
    return (document.querySelector('.panel.me') || {}).textContent || '';
  }, inject);
  ok(/Enter Ranked/.test(b1), 'not opted in: Enter-Ranked gate card');

  const b2 = await page.evaluate(({ PKEYS, inject }) => {
    localStorage.setItem('hk_ranked', '1');
    eval(inject);
    PKEYS.slice(0, 2).forEach(k => DATA.fRuns.push({ user_id: 'u3', challenge: k, time_ms: 9000, created_at: '2026-01-02' }));
    renderAll();
    const hero = document.querySelector('.panel.me');
    return { text: hero ? hero.textContent : '',
      links: [...document.querySelectorAll('.pl-go')].map(a => a.getAttribute('href')) };
  }, { PKEYS, inject });
  ok(/Placement series — 2\/5/.test(b2.text), 'mid-placement: checklist shows 2/5', b2.text.slice(0, 60));
  ok(b2.links.length === 3 && b2.links.every(h => /index\.html\?drill=/.test(h)), 'remaining boards deep-link into the trainer');

  const b3 = await page.evaluate(({ PKEYS, inject }) => {
    eval(inject);
    PKEYS.forEach(k => DATA.fRuns.push({ user_id: 'u3', challenge: k, time_ms: 9000, created_at: '2026-01-02' }));
    renderAll();
    return (document.querySelector('.panel.me') || {}).textContent || '';
  }, { PKEYS, inject });
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

  // ---------- E. account-state sync (r358): merge rules, pure client ----------
  console.log('E. account-state sync merge rules');
  const e1 = await page.evaluate(() => {
    const out = {};
    localStorage.setItem('hk_ach_flags', JSON.stringify({ mouseRuns: 2, nightWin: false, slowWins: 1 }));
    localStorage.setItem('hk_ach_seen', JSON.stringify(['a1', 'a2']));
    localStorage.setItem('hotkey_streak', JSON.stringify({ d: '2026-07-18', n: 3 }));
    localStorage.removeItem('hk_ranked');
    const changed = window.hkStateHydrate({ v: 1,
      ach_flags: { mouseRuns: 5, nightWin: true, weekendWin: true },
      ach_seen: ['a2', 'a3'],
      streak: { d: '2026-07-19', n: 1 },
      ranked: true });
    out.changed = changed;
    out.flags = JSON.parse(localStorage.getItem('hk_ach_flags'));
    out.seen = JSON.parse(localStorage.getItem('hk_ach_seen')).sort();
    out.streak = JSON.parse(localStorage.getItem('hotkey_streak'));
    out.ranked = localStorage.getItem('hk_ranked');
    // explicit local leave is respected (server true must not resurrect an explicit '0')
    localStorage.setItem('hk_ranked', '0');
    window.hkStateHydrate({ v: 1, ranked: true });
    out.rankedAfterLeave = localStorage.getItem('hk_ranked');
    // same-day streak: higher count wins
    localStorage.setItem('hotkey_streak', JSON.stringify({ d: '2026-07-20', n: 2 }));
    window.hkStateHydrate({ v: 1, streak: { d: '2026-07-20', n: 6 } });
    out.sameDay = JSON.parse(localStorage.getItem('hotkey_streak')).n;
    out.pushIsFn = typeof window.hkStatePush === 'function';
    return out;
  });
  ok(e1.changed === true, 'hydrate reports a merge happened');
  ok(e1.flags.mouseRuns === 5 && e1.flags.slowWins === 1 && e1.flags.nightWin === true && e1.flags.weekendWin === true,
    'flags merge: counters max, booleans OR, local-only keys kept', JSON.stringify(e1.flags));
  ok(String(e1.seen) === 'a1,a2,a3', 'seen achievements union', String(e1.seen));
  ok(e1.streak.d === '2026-07-19' && e1.streak.n === 1, 'later streak day wins', JSON.stringify(e1.streak));
  ok(e1.ranked === '1', 'ranked opt-in follows the account');
  ok(e1.rankedAfterLeave === '0', 'an explicit local leave is not resurrected');
  ok(e1.sameDay === 6, 'same-day streak takes the higher count');
  ok(e1.pushIsFn, 'hkStatePush is wired');

  // ---------- F. certificate tracks + share card (r359) ----------
  console.log('F. certificate tracks + share card');
  const f1 = await page.evaluate(() => {
    const T = window.HK_TRACKS || [];
    const all = new Set(T.flatMap(t => t.keys));
    return { n: T.length, sizes: T.map(t => t.keys.length),
      coversAll: (window.HOTKEY_DRILLS.menuOrder || []).every(k => all.has(k)),
      shareFn: typeof window.hkShareCard === 'function',
      ids: T.map(t => t.id).join(',') };
  });
  ok(f1.n === 3 && f1.ids === 'fluency,formulas,modeling', 'three tracks, stable ids', f1.ids);
  ok(String(f1.sizes) === '20,32,30', 'track lengths 20/32/30', String(f1.sizes));
  ok(f1.coversAll, 'every drill belongs to a track');
  ok(f1.shareFn, 'hkShareCard renderer is loaded');
  // the SQL migration's arrays must match drills.js (they are generated from it)
  const certSql = fs.readFileSync('dev/migrate-certificates.sql', 'utf8');
  const f2 = await page.evaluate(() => (window.HK_TRACKS || []).map(t => ({ id: t.id, keys: t.keys })));
  let sqlOk = true;
  for (const t of f2) { for (const k of t.keys) { if (!certSql.includes("'" + k + "'")) { sqlOk = false; break; } } }
  ok(sqlOk, 'migrate-certificates.sql arrays cover every track drill');
  // cert page renders its empty state without page errors
  const certPage = await browser.newPage();
  const certErrs = [];
  certPage.on('pageerror', e => certErrs.push(String(e.message).slice(0, 120)));
  await certPage.goto(URL.replace('leaderboard.html', 'cert.html'), { waitUntil: 'load' });
  await certPage.waitForTimeout(600);
  const f3 = await certPage.evaluate(() => (document.getElementById('root') || {}).textContent || '');
  ok(/No certificate id|loading/i.test(f3), 'cert.html renders the no-id state', f3.slice(0, 60));
  ok(certErrs.length === 0, 'cert.html zero page errors', certErrs.join(' | '));
  await certPage.close();

  ok(errs.length === 0, 'zero page errors', errs.join(' | '));
  console.log(fail === 0 ? ('LB SUITE: ALL ' + pass + ' PASS') : ('LB SUITE: ' + fail + ' FAILURE(S) of ' + (pass + fail)));
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
