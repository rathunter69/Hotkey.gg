/* r447 — wk13 DEPTH-PASS PROBE (DEPTH_PASS §4.75 · DEPTH_PASS_CAMPAIGN §1/§2 · WORKFLOW §9.1).
   Self-contained and single-drill by construction: this file names no drill but 'wk13', so the
   C13 retirement guard can never trip on it.

   WHY IT EXISTS. DEPTH_PASS_CAMPAIGN §1 records thirteen untriggerable beats, every one found by
   WALKING a route and none by reading a predicate. So this walks them: every Excel route that
   reaches wk13's visible end state is driven through the real engine and asserted to clear —
   including the routes a grader is most tempted to lock out (raw typed values, the ribbon walks,
   the F4 anchor cycle, an outside-border box instead of a top rule). It also proves the ☆ is
   SKIPPABLE by measurement rather than by assertion (§2 there), and prints the key counts that
   back the ☆-headroom claim in the drill's source header.

   Run:  node dev/verify-wk13.js                       (server on 127.0.0.1:8791)
         URL=http://127.0.0.1:8837/index.html node dev/verify-wk13.js      (a worktree port)
         SEEDS=10 node dev/verify-wk13.js                                  (deeper sweep) */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const HK_URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const SEEDS = parseInt(process.env.SEEDS || '5', 10);

let fails = 0;
const ok = m => console.log('  ok    ' + m);
const bad = m => { fails++; console.log('  FAIL  ' + m); };
const head = m => console.log('\n' + m);

/* demo-vocabulary mirrors of the page's own helpers, so a move list here reads exactly like a
   move list in dev/e2e-alt-paths.js */
const T = s => Array.from(String(s)).map(ch => ({ key: ch }));
const L = ch => ({ key: ch.toLowerCase(), code: 'Key' + ch.toUpperCase() });
const RIB = (...ls) => [{ key: 'Alt' }].concat(ls.map(L));
const K = {
  enter: { key: 'Enter' }, del: { key: 'Delete' }, f4: { key: 'F4' },
  bold: { key: 'b', ctrl: true }, fillR: { key: 'r', ctrl: true }, fillD: { key: 'd', ctrl: true },
  eq: { key: '=', alt: true, code: 'Equal' }, rowSel: { key: ' ', shift: true },
};
const CL = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

/* ---------------- route segments, one per beat, one entry per legal Excel route -------------- */
const netSeed = o => ({ sel: 'B' + o.rNET, keys: [...T('=B' + o.rTR + '-B' + o.rTD), K.enter] });
const NET = {
  fill:    o => [netSeed(o), { sel: o.netRng, keys: [K.fillR] }],
  ribbon:  o => [netSeed(o), { sel: o.netRng, keys: RIB('h', 'f', 'i', 'r') }],
  typedF:  o => CL.map(c => ({ sel: c + o.rNET, keys: [...T('=' + c + o.rTR + '-' + c + o.rTD), K.enter] })),
  typedV:  o => CL.map((c, i) => ({ sel: c + o.rNET, keys: [...T(String(o.exp.net[i])), K.enter] })),
};
const BEG = {
  fill:    o => [{ sel: 'C' + o.rBEG, keys: [...T('=B' + o.rEND), K.enter] }, { sel: o.begRng, keys: [K.fillR] }],
  ribbon:  o => [{ sel: 'C' + o.rBEG, keys: [...T('=B' + o.rEND), K.enter] }, { sel: o.begRng, keys: RIB('h', 'f', 'i', 'r') }],
  typedF:  o => CL.slice(1).map((c, i) => ({ sel: c + o.rBEG, keys: [...T('=' + CL[i] + o.rEND), K.enter] })),
  /* the ONE route this drill deliberately does not accept — MODELING_STANDARDS §3/§7: a typed
     beginning balance is the classic junior error, and the label opens with "Reference" so the
     requirement is legible before a key is pressed */
  typedV:  o => CL.slice(1).map((c, i) => ({ sel: c + o.rBEG, keys: [...T(String(o.exp.end[i])), K.enter] })),
};
const END = {
  fill:    o => [{ sel: 'B' + o.rEND, keys: [...T('=B' + o.rBEG + '+B' + o.rNET), K.enter] }, { sel: o.endRng, keys: [K.fillR] }],
  ribbon:  o => [{ sel: 'B' + o.rEND, keys: [...T('=B' + o.rBEG + '+B' + o.rNET), K.enter] }, { sel: o.endRng, keys: RIB('h', 'f', 'i', 'r') }],
  typedF:  o => CL.map(c => ({ sel: c + o.rEND, keys: [...T('=' + c + o.rBEG + '+' + c + o.rNET), K.enter] })),
  typedV:  o => CL.map((c, i) => ({ sel: c + o.rEND, keys: [...T(String(o.exp.end[i])), K.enter] })),
};
const DRESS = {
  chord:   o => [{ sel: o.endRng, keys: [K.bold] }, { sel: o.endRng, keys: RIB('h', 'b', 'p') }],
  box:     o => [{ sel: o.endRng, keys: RIB('h', '1') }, { sel: o.endRng, keys: RIB('h', 'b', 's') }],
  allB:    o => [{ sel: 'B' + o.rEND, keys: [K.rowSel, K.bold] }, { sel: 'B' + o.rEND, keys: [K.rowSel, ...RIB('h', 'b', 'a')] }],
  thick:   o => [{ sel: o.endRng, keys: [K.bold] }, { sel: o.endRng, keys: RIB('h', 'b', 't') }],
  topBot:  o => [{ sel: o.endRng, keys: [K.bold] }, { sel: o.endRng, keys: RIB('h', 'b', 'd') }],
};
const TOT = {
  typedFill:  o => [{ sel: 'J5', keys: [...T('=SUM(B5:I5)'), K.enter] }, { sel: o.totRng, keys: [K.fillD] }],
  autoFill:   o => [{ sel: o.asRng, keys: [K.eq] }, { sel: o.totRng, keys: [K.fillD] }],
  autoRibbon: o => [{ sel: o.asRng, keys: RIB('h', 'u', 's') }, { sel: o.totRng, keys: RIB('h', 'f', 'i', 'd') }],
  typedEach:  o => o.jrows.map(r => ({ sel: 'J' + r, keys: [...T('=SUM(B' + r + ':I' + r + ')'), K.enter] })),
  autoEach:   o => o.jrows.map(r => ({ sel: 'B' + r + ':J' + r, keys: [K.eq] })),
  typedV:     o => o.jrows.map(r => ({ sel: 'J' + r, keys: [...T(String(o.jexp[r])), K.enter] })),
};
const CUSH = {
  fill:    o => [{ sel: 'B' + o.rCUSH, keys: [...T('=B' + o.rEND + '-$B$' + o.rMIN), K.enter] }, { sel: o.cushRng, keys: [K.fillR] }],
  f4:      o => [{ sel: 'B' + o.rCUSH, keys: [...T('=B' + o.rEND + '-B' + o.rMIN), K.f4, K.enter] }, { sel: o.cushRng, keys: [K.fillR] }],
  typedF:  o => CL.map(c => ({ sel: c + o.rCUSH, keys: [...T('=' + c + o.rEND + '-B' + o.rMIN), K.enter] })),
  typedV:  o => CL.map((c, i) => ({ sel: c + o.rCUSH, keys: [...T(String(o.exp.cush[i])), K.enter] })),
};

const flat = (...xs) => [].concat.apply([], xs);

/* the runs. `want` lists the core beats (0-5) this run must LIGHT; `dark` the ones it must not;
   `star` is the ☆ expectation (true / false / null = don't care). */
const RUNS = [
  { name: 'canonical taught route — one fill per row, typed SUM + fill down, Ctrl+B + Alt H B P',
    star: false, mv: o => flat(NET.fill(o), BEG.fill(o), END.fill(o), DRESS.chord(o), TOT.typedFill(o), CUSH.fill(o)) },
  { name: 'RIBBON end to end — Alt H F I R fills, Alt H 1 + Alt H B S box, Alt H U S autosum + Alt H F I D',
    star: true, mv: o => flat(NET.ribbon(o), BEG.ribbon(o), END.ribbon(o), DRESS.box(o), TOT.autoRibbon(o), CUSH.f4(o)) },
  { name: 'NOTHING FILLED, NOTHING AUTOSUMMED — every cell a hand-typed formula, full-row Alt H B A dress',
    star: false, mv: o => flat(NET.typedF(o), BEG.typedF(o), END.typedF(o), DRESS.allB(o), TOT.typedEach(o), CUSH.typedF(o)) },
  { name: 'RAW TYPED VALUES for net / ending / cushion / totals (the slow route §1.0(c) protects)',
    star: false, mv: o => flat(NET.typedV(o), BEG.fill(o), END.typedV(o), DRESS.thick(o), TOT.typedV(o), CUSH.typedV(o)) },
  { name: 'reverse order — cushion first, dress before the fills, Alt H B D top+bottom rule',
    star: true, mv: o => flat(CUSH.fill(o), DRESS.topBot(o), TOT.autoFill(o), END.fill(o), BEG.fill(o), NET.fill(o)) },
];

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', e => bad('page error: ' + String(e.message || e).slice(0, 140)));
  await page.addInitScript(() => {
    try {   /* the real harness init — a probe that boots differently measures a different app */
      localStorage.setItem('hotkey_onboarded', '1');
      localStorage.setItem('hk_tour_done', '1');
      localStorage.setItem('hk_learn_done', '1');
      localStorage.setItem('hk_handle_cache', '');
    } catch (e) {}
  });
  await page.goto(HK_URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof loadChallenge === 'function' &&
    typeof demoKey === 'function' && typeof setDemoSel === 'function', null, { timeout: 15000 });
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  await page.evaluate(() => {
    window.__wk = {
      load(){ document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove()); loadChallenge('wk13');
        return JSON.parse(JSON.stringify(CHALLENGES.wk13._o)); },
      play(moves){ for (const mv of moves){ setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); } },
      read(){ const C = CHALLENGES.wk13, items = C.checks.call(C, S);
        return { labels: items.map(i => i.label), ok: items.map(i => !!i.ok),
                 bonus: items.map(i => !!i.bonus), save: items.map(i => !!i.save),
                 keys: keyLog.length, done: !!done }; },
      board(){
        const o = CHALLENGES.wk13._o, rows = [];
        for (let r = 1; r <= S.ROWS; r++){ let any = false;
          for (let c = 1; c <= 10; c++){ const cell = S.cells[ck(r, c)];
            if (cell && (cell.value !== null && cell.value !== '' || cell.formula)) { any = true; break; } }
          if (any) rows.push(r); }
        let over = 0; for (let c = 1; c <= 10; c++) if (overflowsCol(S, c)) over++;
        let w = 0; for (let c = 1; c <= 10; c++) w += (colW[c] || 78);
        const grid = document.getElementById('grid'), wrap = document.getElementById('gridwrap');
        return { ROWS: S.ROWS, filled: rows.length, overCols: over, natural: w,
                 gridW: grid ? grid.scrollWidth : 0, wrapW: wrap ? wrap.clientWidth : 0, o: o };
      },
    };
  });

  const load = () => page.evaluate(() => window.__wk.load());
  const play = mv => page.evaluate(m => window.__wk.play(m), mv);
  const read = () => page.evaluate(() => window.__wk.read());
  const board = () => page.evaluate(() => window.__wk.board());

  /* ---------- A · BOARD CONTRACT (§1.3 · §2.1b · the fit rule) ---------- */
  head('A · board contract  (' + SEEDS + ' seeds)');
  const dens = [], nat = [];
  for (let s = 0; s < SEEDS; s++) {
    const o = await load();
    const b0 = await board();
    if (b0.ROWS !== 20) bad('seed ' + s + ': ROWS=' + b0.ROWS + ' — §1.3 says 20 is floor AND cap');
    if (b0.overCols) bad('seed ' + s + ': ' + b0.overCols + ' column(s) print #### AT LOAD (e2e-fit-sweep class)');
    nat.push(b0.natural);
    await play(await page.evaluate(() => { const C = CHALLENGES.wk13; return C.demo.call(C).concat([{ sel: 'A1', keys: [{ key: 's', ctrl: true }] }]); }));
    const r = await read();
    if (!r.done) bad('seed ' + s + ': the drill demo did not win');
    const b1 = await board();
    if (b1.overCols) bad('seed ' + s + ': ' + b1.overCols + ' column(s) print #### at the WIN state');
    dens.push(b1.filled);
    if (b1.gridW > b1.wrapW + 1) bad('seed ' + s + ': the sheet overruns its frame — grid ' + b1.gridW + 'px in a ' + b1.wrapW + 'px box (§6.6)');
  }
  const dmin = Math.min.apply(null, dens), dmax = Math.max.apply(null, dens);
  if (dmin / 20 >= 0.6) ok('win-state density ' + dmin + '-' + dmax + '/20 (' + Math.round(100 * dmin / 20) + '-' + Math.round(100 * dmax / 20) + '%) — §1.3 target >=60%');
  else bad('win-state density ' + dmin + '/20 is under the §1.3 60% target');
  ok('natural sheet width ' + Math.min.apply(null, nat) + '-' + Math.max.apply(null, nat) + 'px, inside the frame at 1440');

  /* ---------- B · ROUTE PROBE (DEPTH_PASS_CAMPAIGN §1 — walk them, never read them) ---------- */
  head('B · every route to the visible end state  (' + SEEDS + ' seeds each)');
  const keyCounts = {};
  for (const run of RUNS) {
    let allCore = true, starSeen = 0, keys = 0, first = null;
    for (let s = 0; s < SEEDS; s++) {
      const o = await load();
      await play(run.mv(o));
      const r = await read();
      const core = r.ok.filter((_, i) => !r.bonus[i] && !r.save[i]);
      if (!core.every(Boolean)) { allCore = false; if (!first) first = r.labels.filter((_, i) => !r.ok[i] && !r.bonus[i] && !r.save[i]); }
      if (r.ok[r.bonus.indexOf(true)]) starSeen++;
      keys = r.keys;
    }
    keyCounts[run.name] = keys;
    if (!allCore) bad(run.name + ' — core beat(s) DARK on a correct board: ' + JSON.stringify(first));
    else if (run.star === true && starSeen !== SEEDS) bad(run.name + ' — ☆ fired on only ' + starSeen + '/' + SEEDS + ' seeds');
    else if (run.star === false && starSeen !== 0) bad(run.name + ' — ☆ fired on ' + starSeen + '/' + SEEDS + ' seeds and must not');
    else ok(run.name + ' → 6/6 core, ☆ ' + (run.star ? 'lit' : 'dark') + ', ' + keys + ' keys');
  }

  /* ---------- C · the two grades that are deliberately NOT value-only ---------- */
  head('C · the deliberate rejections (each is a documented convention grade, not an oversight)');
  {
    const o = await load();
    await play(flat(NET.fill(o), BEG.typedV(o), END.fill(o), DRESS.chord(o), TOT.typedFill(o), CUSH.fill(o)));
    const r = await read();
    const i = r.labels.findIndex(l => /^Reference/.test(l));
    const others = r.ok.filter((_, j) => j !== i && !r.bonus[j] && !r.save[j]);
    if (r.ok[i]) bad('a HAND-TYPED beginning balance cleared the roll-forward beat — MODELING_STANDARDS §3 says that link is the lesson');
    else if (!others.every(Boolean)) bad('typing the beginning balance darkened beats other than its own');
    else ok('typed beginning balances leave ONLY the "Reference…" beat dark — every other core clears');
  }
  {
    const o = await load();
    await play(flat(NET.fill(o), BEG.fill(o), END.fill(o), DRESS.chord(o), CUSH.fill(o),
      [{ sel: 'J5', keys: [...T('=SUM(B5:I5)'), K.enter] }, { sel: 'J5:J' + o.rCUSH, keys: [K.fillD] }]));
    let r = await read();
    const ti = r.labels.findIndex(l => /^Total every flow line —/.test(l));
    if (r.ok[ti]) bad('totalling the BALANCE rows still cleared the flows-only beat');
    else ok('a total on Beginning/Ending/Cushion darkens the flows-only beat (the guard is folded into its ok, §1.1)');
    await play([{ sel: 'J' + o.rBEG + ':J' + o.rCUSH, keys: [K.del] }]);
    r = await read();
    if (!r.ok[ti]) bad('clearing the three balance-row totals did not re-light the beat');
    else ok('clearing them re-lights it — the beat is repairable from the board alone');
  }

  /* ---------- D · ☆ contract: earned, skippable, and never rewarded for a slower route -------- */
  head('D · the ☆  (§1.0(d) hidden efficiency · §1.0-R2(i) a distinct, skippable decision)');
  for (const [nm, seg, want] of [
    ['Alt+= then Ctrl+D', TOT.autoFill, true],
    ['Alt H U S then Alt H F I D', TOT.autoRibbon, true],
    ['typed =SUM then Ctrl+D (the skippability control)', TOT.typedFill, false],
    ['one Alt+= per flow line, no carry (right chord, slower route)', TOT.autoEach, false],
    ['nine hand-typed SUMs', TOT.typedEach, false],
  ]) {
    let lit = 0, keys = 0;
    for (let s = 0; s < SEEDS; s++) {
      const o = await load();
      await play(flat(NET.fill(o), BEG.fill(o), END.fill(o), DRESS.chord(o), seg(o), CUSH.fill(o)));
      const r = await read();
      if (r.ok[r.bonus.indexOf(true)]) lit++;
      keys = r.keys;
    }
    const good = want ? lit === SEEDS : lit === 0;
    (good ? ok : bad)('☆ ' + (want ? 'LIT' : 'dark') + ' ' + lit + '/' + SEEDS + ' — ' + nm + ' (' + keys + ' keys)');
  }

  /* ---------- E · the ☆-headroom numbers the drill header cites ---------- */
  head('E · ☆-headroom (DEPTH_PASS_CAMPAIGN §2 — measured, never asserted)');
  const kc = Object.entries(keyCounts).map(([n, k]) => '  ' + k + ' keys  ' + n.split(' — ')[0]);
  kc.forEach(l => console.log(l));

  console.log('\n' + (fails ? 'verify-wk13: ' + fails + ' FAILURE(S)' : 'verify-wk13: ALL GREEN'));
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
