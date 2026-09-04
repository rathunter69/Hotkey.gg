/* LEADERBOARD E2E (r339) — permanent gate coverage for the ranking surface.
   Supabase is blocked in CI, so the suite injects a synthetic DATA field (the same shape
   load() builds) and drives renderAll() + the real DOM. Covers:
     A. tier sub-menu on the drill boards (r335): dropdown, bucket chips, n-of-m note, restore
     B. ranked entry (r336 / r455): unlock panel below LVL 10 -> placement checklist -> tier card;
        rank is DERIVED (nav.js hkRankedEntered off the hk_xp_est level cache), the reveal card
     C. nav rank pill (r336): Unranked -> placement n/5 -> tier (stubbed sb + auth)
     D. seed-field sanity: dev/seed-field.sql parses back and renders non-empty boards
     E. account-state sync (r358): hkStateHydrate merge rules — flags/seen/streak; ranked is dead data (r455)
   Run: python3 -m http.server 8791 &  ·  node dev/e2e-lb.js */
'use strict';
const { chromium } = require('playwright-core');
const fs = require('fs');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/leaderboard.html';
let pass = 0, fail = 0;
const ok = (c, n, x) => { if (c) { pass++; console.log('  PASS ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' — ' + x : '')); } };

/* r436: was a hard-coded copy of HK_PLACEMENT.KEYS, and it drifted the moment `dress` was
   retired and the real list repointed at `combo` — four placement assertions went red because
   the suite was seeding times for a drill no longer in the series. Derived from drills.js now,
   the same root-cause fix r436 applied to e2e-depth-mechanics §H/§I: a test that hard-codes a
   fact owned elsewhere WILL drift, and re-pointing it just moves the next break. */
const PKEYS = (() => {
  const src = fs.readFileSync(require('path').join(__dirname, '..', 'drills.js'), 'utf8');
  const m = /HK_PLACEMENT\s*=\s*\{[^}]*KEYS:\s*\[([^\]]*)\]/.exec(src);
  if (!m) throw new Error('e2e-lb: could not read HK_PLACEMENT.KEYS from drills.js');
  return m[1].split(',').map(x => x.trim().replace(/^'|'$/g, '')).filter(Boolean);
})();

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 150)));
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof renderAll === 'function' && typeof CH !== 'undefined' && !!window.HK_PLACEMENT);

  // ---------- A. drill boards (r393: per-board tier filter removed) ----------
  console.log('A. drill boards render without a by-rank filter');
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
    try { localStorage.setItem('hk_xp_est', '4600'); localStorage.setItem('hk_xp_uid', 'u3'); } catch (e) {}   // r455: LVL 10 = ranked
    renderAll();
    return { hasSel: !!document.getElementById('tierSel'),
      chips: document.querySelectorAll('.chip[data-bucket]').length,
      hasNote: !!document.querySelector('.tf-note'),
      rows: document.querySelectorAll('.browse-detail .board .row:not(.open)').length };
  });
  /* r393 (Wolf): the individual drill leaderboards no longer carry a by-rank filter — the tier
     dropdown, the bucket chips, and the n-of-m note are all gone. The board shows the whole
     field for the picked drill (capped at the board's top 10). */
  ok(!a1.hasSel, 'no per-board tier dropdown (filter removed)');
  ok(a1.chips === 0, 'no per-board bucket chips (filter removed)', 'chips=' + a1.chips);
  ok(!a1.hasNote, 'no n-of-m filter note (filter removed)');
  ok(a1.rows === 10, 'drill board shows the top 10', 'rows=' + a1.rows);

  // ---------- B. ranked entry states ----------
  console.log('B. ranked entry: unlock panel -> placement -> tier (rank derived at LVL 10, r455)');
  // NOTE: the page's own boot-time load() settles LATE with Supabase blocked and reassigns
  // DATA — so every section must (re)inject DATA and read the DOM in the SAME evaluate tick.
  const inject = `DATA = { perDrill: window.__f.perDrill, names: window.__f.names, meId: 'u3',
    myTeam: null, teamOnly: false, viewDesk: null, myDesk: null,
    fRuns: window.__f.runs.slice(), fSessions: [], userStat: window.__f.userStat,
    gUserStat: window.__f.userStat, profs: Object.keys(window.__f.names).map(u => ({ id: u, handle: window.__f.names[u] })),
    runs: window.__f.runs, sessions: [] };`;
  /* r455: below the line the your-card is the UNLOCK PANEL (copy + progress bar) and nothing on it
     asks to enter; the old Enter Ranked / Not yet buttons must stay gone. */
  const b1 = await page.evaluate((inject) => {
    localStorage.removeItem('hk_dev_unlock'); localStorage.setItem('hk_xp_est', '0'); localStorage.setItem('hk_xp_uid', 'u3');
    eval(inject); renderAll();
    const t = (document.querySelector('.panel.me') || {}).textContent || '';
    return { t, entered: window.hkRankedEntered(), btn: !!document.getElementById('enterRanked') || !!document.getElementById('waitRanked') };
  }, inject);
  ok(!b1.entered && /Ranked unlocks at LVL 10/.test(b1.t) && /You’re LVL \d+/.test(b1.t), 'below LVL 10: the unlock panel names the line and your level', b1.t.slice(0, 80));
  ok(!b1.btn && !/Enter Ranked|Not yet/.test(b1.t), 'below LVL 10: no Enter Ranked / Not yet buttons (the opt-in ceremony is retired)');
  const b1b = await page.evaluate((inject) => {
    localStorage.setItem('hk_xp_est', '4600'); localStorage.setItem('hk_xp_uid', 'u3');   // LVL 10 exactly
    eval(inject); renderAll();
    return { entered: window.hkRankedEntered(), t: (document.querySelector('.panel.me') || {}).textContent || '' };
  }, inject);
  ok(b1b.entered && !/Ranked unlocks at/.test(b1b.t), 'LVL 10: the predicate flips on its own and the unlock panel is gone (no click)');
  const b1c = await page.evaluate((inject) => {
    localStorage.setItem('hk_xp_est', '0'); localStorage.setItem('hk_dev_unlock', '1');
    const v = window.hkRankedEntered(); localStorage.removeItem('hk_dev_unlock'); localStorage.setItem('hk_xp_est', '4600');
    return v;
  }, inject);
  ok(b1c === true, 'hk_dev_unlock still opens ranked for fixtures (the e2e bypass survives)');

  const b2 = await page.evaluate(({ PKEYS, inject }) => {
    localStorage.setItem('hk_xp_est', '4600'); localStorage.setItem('hk_xp_uid', 'u3');
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
    /* r455: the Ranked Unlocked card (themes.js hkRankedCard) is the one-time REVEAL — it names
       the placement series, carries one dismiss, and no button on it writes state. */
    const before = JSON.stringify(localStorage);
    window.hkRankedCard({ reason: 'Level 10 reached' });
    const has = /placement series/i.test(document.body.textContent);
    const okBtn = document.getElementById('hkruOk'), enter = document.getElementById('hkruGo') || document.getElementById('hkruLater');
    if (okBtn) okBtn.click();
    const gone = !document.getElementById('hkru-modal');
    return { has, hasOk: !!okBtn, enter: !!enter, gone, same: before === JSON.stringify(localStorage) };
  });
  ok(b4.has && b4.hasOk && b4.gone, 'reveal card names the placement series and dismisses', JSON.stringify(b4));
  ok(!b4.enter && b4.same, 'reveal card has no Enter/later button and writes no state');
  ok(typeof await page.evaluate(() => typeof rankedInfographic) === 'string' && (await page.evaluate(() => typeof rankedInfographic)) === 'undefined',
    'lb.js rankedInfographic (the opt-in opener) is gone');

  // ---------- C. nav rank pill ----------
  console.log('C. nav rank pill derives ranked from level (r455)');
  const pill = async (opted, doneKeys) => {
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForFunction(() => !!document.getElementById('navRankPill'));
    return page.evaluate(({ opted, doneKeys }) => new Promise(res => {
      /* r455: "opted" = at the rank level. The stubbed runs below carry near-zero server XP, and
         nav's hydrate takes max(server, local) for the same account, so the local estimate holds. */
      try { localStorage.setItem('hk_xp_est', opted ? '4600' : '0'); localStorage.setItem('hk_xp_uid', 'u3'); localStorage.setItem('hk_rank_reveal_seen', '1'); } catch (e) {}
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
  ok((await pill(false, PKEYS)) === 'Unranked', 'pill: below LVL 10 -> Unranked');
  ok(/placement 3\/5/.test(await pill(true, PKEYS.slice(0, 3))), 'pill: LVL 10, mid-placement -> placement 3/5 (no opt-in)');
  const p3 = await pill(true, PKEYS);
  ok(!/placement|Unranked|never/.test(p3) && p3.length > 2, 'pill: placement complete -> tier', p3);

  // ---------- D. seed field renders ----------
  console.log('D. seed field parses + renders');
  const sql = fs.readFileSync(require('path').join(__dirname, 'seed-field.sql'), 'utf8');
  const profs = [...sql.matchAll(/\('(5eed0000-[0-9a-f-]+)', '([^']+)', false\)/g)].map(m => ({ id: m[1], handle: m[2] }));
  const runs = [...sql.matchAll(/\('(5eed0000-[0-9a-f-]+)', '([a-z0-9]+)', (\d+), false, '([^']+)'\)/g)]
    .map(m => ({ user_id: m[1], challenge: m[2], time_ms: +m[3], created_at: m[4] }));
  ok(profs.length >= 50, 'seed SQL holds the full seed field (>=50 players)', String(profs.length));
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
    localStorage.removeItem('hk_ranked'); localStorage.setItem('hk_xp_est', '0'); localStorage.setItem('hk_xp_uid', 'u3'); localStorage.removeItem('hk_dev_unlock');
    const changed = window.hkStateHydrate({ v: 1,
      ach_flags: { mouseRuns: 5, nightWin: true, weekendWin: true },
      ach_seen: ['a2', 'a3'],
      streak: { d: '2026-07-19', n: 1 },
      ranked: true });
    out.changed = changed;
    out.flags = JSON.parse(localStorage.getItem('hk_ach_flags'));
    out.seen = JSON.parse(localStorage.getItem('hk_ach_seen')).sort();
    out.streak = JSON.parse(localStorage.getItem('hotkey_streak'));
    /* r455: client_state.ranked is DEAD DATA — a server `ranked: true` must not write the retired
       key, and must not make the predicate true on its own (rank derives from level). */
    out.ranked = localStorage.getItem('hk_ranked');
    out.enteredAfterHydrate = window.hkRankedEntered();

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
  ok(e1.ranked === null, 'hydrate no longer writes the retired hk_ranked key (dead server data is ignored)');
  ok(e1.enteredAfterHydrate === false, 'a server ranked:true cannot make a LVL 1 player ranked — rank derives from level');
  ok(e1.sameDay === 6, 'same-day streak takes the higher count');
  ok(e1.pushIsFn, 'hkStatePush is wired');

  // ---------- F. certificate tracks + share card (r359) ----------
  console.log('F. certificate tracks + share card');
  const f1 = await page.evaluate(() => {
    const T = window.HK_TRACKS || [];
    const all = new Set(T.flatMap(t => t.keys));
    return { n: T.length, sizes: T.map(t => t.keys.length),
      total: (window.HOTKEY_DRILLS.menuOrder || []).length,
      coversAll: (window.HOTKEY_DRILLS.menuOrder || []).every(k => all.has(k)),
      shareFn: typeof window.hkShareCard === 'function',
      ids: T.map(t => t.id).join(',') };
  });
  ok(f1.n === 3 && f1.ids === 'fluency,formulas,modeling', 'three tracks, stable ids', f1.ids);
  /* r424: derive from the catalog — hardcoded sizes broke on the colops retirement (D17).
     Tracks must partition menuOrder exactly; sizes are whatever the catalog says. */
  ok(f1.sizes.reduce((a,b)=>a+b,0) === f1.total, 'track sizes sum to the catalog', String(f1.sizes)+' vs '+f1.total);
  ok(f1.coversAll, 'every drill belongs to a track');
  ok(f1.shareFn, 'hkShareCard renderer is loaded');
  // r361 FRAMEWORK COHERENCE — every structure that references drills must resolve against
  // the catalog: campaign chapters (v1..v8), progression gates, placement, tracks, pars.
  const g1 = await page.evaluate(() => {
    const D = window.HOTKEY_DRILLS, cat = new Set(D.menuOrder), out = { bad: [] };
    (window.HOTKEY_CAMPAIGN.chapters || []).forEach(c =>
      c.keys.forEach(k => { if (!cat.has(k)) out.bad.push('campaign ' + c.id + ':' + k); }));
    const gnames = new Set(D.groups.map(g => g.name));
    Object.keys(window.HOTKEY_GATES.groups || {}).forEach(g => { if (!gnames.has(g)) out.bad.push('gate group ' + g); });
    const chIds = new Set((window.HOTKEY_CAMPAIGN.chapters || []).map(c => c.id));
    Object.values(window.HOTKEY_GATES.groups || {}).forEach(g =>
      (g.chapters || []).forEach(c => { if (!chIds.has(c)) out.bad.push('gate chapter ' + c); }));
    (window.HK_PLACEMENT.KEYS || []).forEach(k => { if (!cat.has(k)) out.bad.push('placement ' + k); });
    (window.HK_TRACKS || []).forEach(t => t.keys.forEach(k => { if (!cat.has(k)) out.bad.push('track ' + t.id + ':' + k); }));
    D.menuOrder.forEach(k => { if (window.HOTKEY_PARS[k] === undefined) out.bad.push('par missing ' + k); });
    // chapter groups mirror the catalog groups 1:1 (the milestone spine)
    if ((window.HOTKEY_CAMPAIGN.chapters || []).length !== D.groups.length) out.bad.push('chapter/group count drift');
    // r363: milestones PARTITION into the tracks — every chapter owned by exactly one track,
    // and every milestone's drills belong to its track's drill set
    const owned = {};
    (window.HK_TRACKS || []).forEach(t => (t.milestones || []).forEach(id => { owned[id] = (owned[id] || 0) + 1; }));
    (window.HOTKEY_CAMPAIGN.chapters || []).forEach(c => { if (owned[c.id] !== 1) out.bad.push('milestone ownership ' + c.id + '=' + (owned[c.id] || 0)); });
    (window.HK_TRACKS || []).forEach(t => {
      const tset = new Set(t.keys);
      (t.milestones || []).forEach(id => { const ch = (window.HOTKEY_CAMPAIGN.chapters || []).find(x => x.id === id);
        (ch ? ch.keys : []).forEach(k => { if (!tset.has(k)) out.bad.push('milestone ' + id + ' key outside track ' + t.id + ': ' + k); }); });
    });
    (window.HOTKEY_CHALLENGE_POOL || []).forEach(k => { if (!cat.has(k)) out.bad.push('challenge pool ' + k); });
    return out;
  });
  ok(g1.bad.length === 0, 'campaign/gates/placement/tracks/pars all resolve against the catalog', g1.bad.slice(0, 5).join(' | '));
  // the SQL migration's arrays must match drills.js (they are generated from it)
  const certSql = fs.readFileSync('dev/migrate-certificates.sql', 'utf8');
  const f2 = await page.evaluate(() => (window.HK_TRACKS || []).map(t => ({ id: t.id, keys: t.keys })));
  let sqlOk = true;
  for (const t of f2) { for (const k of t.keys) { if (!certSql.includes("'" + k + "'")) { sqlOk = false; break; } } }
  ok(sqlOk, 'migrate-certificates.sql arrays cover every track drill');
  /* r371: SET-equality per track — membership-only let a drill sit in the WRONG track's
     SQL array (or stale extras linger) without failing. Parse each when-arm exactly. */
  let sqlSetOk = true, sqlSetWhy = '';
  for (const t of f2) {
    const m = new RegExp("when '" + t.id + "'\\s+then array\\[([^\\]]*)\\]").exec(certSql);
    const sqlKeys = m ? m[1].split(',').map(x => x.trim().replace(/'/g, '')).filter(Boolean) : [];
    const a = new Set(sqlKeys), b = new Set(t.keys);
    const extra = sqlKeys.filter(k => !b.has(k)), missing = t.keys.filter(k => !a.has(k));
    if (extra.length || missing.length) { sqlSetOk = false; sqlSetWhy = t.id + ' extra:' + extra.join('/') + ' missing:' + missing.join('/'); break; }
  }
  ok(sqlSetOk, 'migrate-certificates.sql arrays EQUAL each track set (no strays, no gaps)', sqlSetWhy);
  /* r371: daily-challenge seed parity — trainer and board must derive the same pick.
     Lock the shared ingredients: the xor constant, the *31 date fold, and the shared pool. */
  const idxSrc = fs.readFileSync('index.html', 'utf8');
  const lbSrc = fs.readFileSync('lb.js', 'utf8');
  ok(idxSrc.includes('0x9e3779b9') && lbSrc.includes('0x9e3779b9')
     && idxSrc.includes('x*31+ch.charCodeAt(0)') && lbSrc.includes('dSeed*31+ch.charCodeAt(0)')
     && lbSrc.includes('HOTKEY_CHALLENGE_POOL') && idxSrc.includes('HOTKEY_CHALLENGE_POOL'),
     'daily seed ingredients match between trainer and boards (xor constant + *31 fold + shared pool)');
  /* r371: computeXP call-signature lock — a call that drops the sessions arg makes the
     level disagree between surfaces (the exact bug this suite now guards). Every call
     site outside themes.js must pass all three args. */
  const sigBad = [];
  for (const f of ['index.html', 'lb.js', 'nav.js', 'stats.html', 'account.html']) {
    const src = fs.readFileSync(f, 'utf8');
    let i = 0;
    while ((i = src.indexOf('computeXP(', i)) !== -1) {
      const before = src.slice(Math.max(0, i - 40), i);
      i += 'computeXP('.length;
      if (/function\s*$|\bcomputeXP\s*$/.test(before)) continue;           // definition/wrapper decl
      let depth = 1, commas = 0, j = i;
      while (j < src.length && depth > 0) {
        const c = src[j];
        if (c === '(') depth++; else if (c === ')') depth--;
        else if (c === ',' && depth === 1) commas++;
        j++;
      }
      if (commas < 2) sigBad.push(f + '@' + i);
    }
  }
  ok(sigBad.length === 0, 'every computeXP call site passes (runs, pl, sessions)', sigBad.join(' | '));
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
