/* dev/verify-revolver.js — the dedicated probe for the r446 `revolver` depth pass
   (DEPTH_PASS §4.71, Models II; dev/MODELING_STANDARDS.md binding).

   Written because reading predicates has never once found the untriggerable-beat class
   (DEPTH_PASS_CAMPAIGN §1): every route to the visible end state is WALKED through the live
   engine and asserted to clear. Five sections:

     A · BOARD CONTRACT   — ROWS/tri-length/density/provenance/helper-stack/border conventions
     B · THE MODEL        — the revolver identity recomputed independently from the board's own
                            inputs, plus the pedagogy guarantees the seed is supposed to hold
     C · ROUTE WALKS      — twelve legal routes to the same visible end state; each must clear
                            every core beat (§1.0-R3(p))
     D · THE ☆            — earned by both fill routes, skippable by measurement, and each half
                            of the decision measured against its own slow alternative
     E · HEADROOM         — the CAMPAIGN §2 diagnostic re-run on the rebuilt board

   Self-contained by §9.1: it references NO drill but `revolver` (the C13 retirement guard).
   Run: node dev/verify-revolver.js        (server on 127.0.0.1:8791, or pass URL=) */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const SEEDS = Number(process.env.SEEDS || 5);

let pass = 0, fail = 0;
const ok = m => { pass++; console.log('  ok   ' + m); };
const bad = m => { fail++; console.log('  FAIL ' + m); };
const is = (cond, m) => (cond ? ok(m) : bad(m));

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 180)));
  /* the probe MUST mirror the real harness init or its output is a lie (CAMPAIGN, the r440
     hotkey_onboarded note) */
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1'); localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_handle_cache', '');
    localStorage.setItem('hk_beta_ok', '1'); localStorage.setItem('hk_xlv', '2');
  } catch (e) {} });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof demoKey === 'function');
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  /* ---------- shared driver: load a fresh board, apply a move list, read the verdict ---------- */
  const walk = (src, reps) => page.evaluate(({ src, reps }) => {
    const out = [];
    for (let rep = 0; rep < reps; rep++) {
      document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
      loadChallenge('revolver');
      const C = CHALLENGES.revolver;
      const moves = src === null ? C.demo() : eval('(' + src + ')')(C);
      for (const mv of moves) { setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
      if (!done && C.saveClose) demoKey({ key: 's', ctrl: true });
      const items = C.checks(S);
      out.push({
        keys: keyLog.length, won: !!done,
        cores: items.filter(x => !x.bonus).every(x => x.ok),
        coreN: items.filter(x => !x.bonus && x.ok).length,
        star: (items.find(x => x.bonus) || {}).ok === true,
        failing: items.filter(x => !x.ok).map(x => String(x.label).slice(0, 62)),
      });
    }
    return out;
  }, { src, reps });

  const route = async (name, src, want) => {
    const r = await walk(src, 3);
    const cores = r.filter(x => x.cores).length;
    const star = r.filter(x => x.star).length;
    const detail = r.some(x => x.failing.length) ? '  [' + r.find(x => x.failing.length).failing.join(' | ') + ']' : '';
    if (want === 'star') is(cores === 3 && star === 3, name + ' — cores 3/3, ☆ 3/3' + (cores === 3 && star === 3 ? '' : ' (got ' + cores + '/' + star + ')' + detail));
    else if (want === 'nostar') is(cores === 3 && star === 0, name + ' — cores 3/3, ☆ dark 3/3' + (cores === 3 && star === 0 ? '' : ' (got ' + cores + '/' + star + ')' + detail));
    else is(cores === 3, name + ' — cores 3/3' + (cores === 3 ? '' : ' (got ' + cores + ')' + detail));
    return r;
  };

  /* ============================ A · BOARD CONTRACT ============================ */
  console.log('\nA · BOARD CONTRACT (' + SEEDS + ' seeds)');
  const A = await page.evaluate((SEEDS) => {
    const out = [];
    for (let rep = 0; rep < SEEDS; rep++) {
      document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
      loadChallenge('revolver');
      const C = CHALLENGES.revolver, o = C._o, R = o.R;
      const load = { rows: S.ROWS, checks: C.checks(S).length, guide: C.guide().length, targets: C.targets().length,
        bonus: C.checks(S).filter(x => x.bonus).length,
        starRinged: C.targets()[C.checks(S).findIndex(x => x.bonus)] !== null,
        saveClose: !!C.saveClose,
        /* helper stack (§1.0(f) + §1.0-R2(l)) */
        helpers: [R.mc, R.cm].map(r => { const c = S.cells[o.CB + r] || {};
          return { fill: c.fill, ball: !!c.ball, blue: c.fontColor === 'blue', populated: typeof c.value === 'number',
                   labelled: !!(S.cells[o.CA + r] || {}).value }; }),
        headerRule: [o.CA, o.CB, o.CC, o.CD, o.CE].every(c => !!(S.cells[c + R.h] || {}).bb),
        blueInputs: o.cols.every(c => (S.cells[c + R.cb] || {}).fontColor === 'blue') && (S.cells[o.CB + R.bb] || {}).fontColor === 'blue',
        /* every graded target row carries a visible label in the anchor column (§1.3) */
        labelled: [R.dr, R.sw, R.eb, R.bb, R.cp].every(r => !!(S.cells[o.CA + r] || {}).value),
        /* the memo reads ship LIVE */
        memoLive: o.cols.every(c => !!(S.cells[c + R.cu] || {}).formula && !!(S.cells[c + R.ua] || {}).formula),
        /* no figure prints #### at load anywhere on the sheet */
        overflow: (() => { let n = 0; for (let ci = 1; ci <= 10; ci++) { for (let r = 1; r <= S.ROWS; r++) {
          const c = S.cells[colLetter(ci) + r]; if (c && typeof c.value === 'number' && typeof overflowsCol === 'function' && overflowsCol(S, ci)) n++; } } return n; })(),
      };
      /* solve, then measure the WIN state */
      for (const mv of C.demo()) { setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
      if (!done && C.saveClose) demoKey({ key: 's', ctrl: true });
      let dense = 0;
      for (let r = 1; r <= S.ROWS; r++) { let any = false;
        for (let ci = 1; ci <= 10; ci++) { const c = S.cells[colLetter(ci) + r];
          if (c && c.value !== null && c.value !== undefined && c.value !== '') any = true; }
        if (any) dense++; }
      const win = { dense: dense, rows: S.ROWS,
        /* §1.0(f): a total wears a TOP border and never a rule underneath */
        endTop: o.cols.every(c => { const x = S.cells[c + R.eb] || {}; return !!(x.bt || x.ball); }),
        endNoBottom: o.cols.every(c => !(S.cells[c + R.eb] || {}).bb),
        /* provenance: every cell the player builds is BLACK, every typed input stays blue */
        builtBlack: [R.dr, R.sw, R.eb, R.cp].every(r => o.cols.every(c => !(S.cells[c + r] || {}).fontColor))
          && [o.CC, o.CD, o.CE].every(c => !(S.cells[c + R.bb] || {}).fontColor),
        inputsBlue: (S.cells[o.CB + R.bb] || {}).fontColor === 'blue' && o.cols.every(c => (S.cells[c + R.cb] || {}).fontColor === 'blue'),
        /* the number format survives the block fill (the r439 `cases` rule) */
        fmtKept: [R.dr, R.sw, R.eb, R.cp, R.bb].every(r => o.cols.every(c => (S.cells[c + r] || {}).fmtStyle === 'comma')),
        /* the memo reads answer correctly once the schedule is built */
        memo: o.cols.map((c, i) => ({ cu: (S.cells[c + R.cu] || {}).value, cuExp: o.exp[i].cash - o.minC,
                                      ua: (S.cells[c + R.ua] || {}).value, uaExp: o.commit - o.exp[i].end })),
      };
      out.push({ load: load, win: win, o: { c0: o.c0, minC: o.minC, open0: o.open0, commit: o.commit, drawYr: o.drawYr, exp: o.exp } });
    }
    return out;
  }, SEEDS);

  is(A.every(x => x.load.rows === 20), 'ROWS=20 on every seed (§1.3, floor AND cap)');
  /* the drill hand-writes 7 (6 core + the ☆); hkSaveCloseWire appends the Ctrl+S beat to all
     three arrays at load, so the RUNTIME tri-length is 8/8/8 and must stay equal (§1.9) */
  is(A.every(x => x.load.checks === 8 && x.load.guide === 8 && x.load.targets === 8),
    'tri-length equal at runtime: 8/8/8 — 6 core + ☆ hand-written, the save closer engine-appended (§1.9, §1.0(e))');
  is(A.every(x => x.load.bonus === 1 && !x.load.starRinged && x.load.saveClose),
    'exactly one bonus:true, never ringed (§2.2), saveClose declared (§1.0(e))');
  is(A.every(x => x.load.helpers.every(h => h.fill === 'yellow' && h.ball && h.blue && h.populated && h.labelled)),
    'assumption stack: light yellow + all borders + blue + POPULATED + individually labelled (§1.0(f), §1.0-R2(l))');
  is(A.every(x => x.load.headerRule && x.load.blueInputs && x.load.labelled && x.load.memoLive),
    'header rule shipped · typed inputs blue · every graded row labelled · the two memo reads live');
  is(A.every(x => x.load.overflow === 0), 'no column prints #### at load');
  const dens = A.map(x => x.win.dense);
  is(dens.every(d => d >= 12), '§1.3 density at the win state: ' + dens.join('/') + ' of 20 rows (' +
    Math.round(100 * dens.reduce((a, b) => a + b, 0) / dens.length / 20) + '% — target ≥60%)');
  is(A.every(x => x.win.endTop && x.win.endNoBottom), 'the ending balance wears a TOP border and no rule underneath (§1.0(f))');
  is(A.every(x => x.win.builtBlack && x.win.inputsBlue), 'colour-as-provenance holds at the win state (MODELING_STANDARDS §1)');
  is(A.every(x => x.win.fmtKept), 'the block fill preserves the comma format on every filled cell (the ☆ never degrades the board)');
  is(A.every(x => x.win.memo.every(m => Math.abs(m.cu - m.cuExp) < 0.5 && Math.abs(m.ua - m.uaExp) < 0.5)),
    'the memo reads answer correctly at the win state (headroom vs minimum · undrawn availability)');

  /* ============================ B · THE MODEL ============================ */
  console.log('\nB · THE MODEL (MODELING_STANDARDS §2/§3/§6 — recomputed independently from the board inputs)');
  let mOK = true, pedOK = true, boundOK = true, cashOK = true, rollOK = true;
  for (const s of A) {
    const { minC, open0, commit, exp } = s.o;
    let bal = open0;
    for (let i = 0; i < 4; i++) {
      const draw = Math.max(0, minC - exp[i].cashB);
      const sweep = -Math.min(bal, Math.max(0, exp[i].cashB - minC));
      const end = bal + draw + sweep;
      if (exp[i].draw !== draw || exp[i].sweep !== sweep || exp[i].end !== end || exp[i].begin !== bal) mOK = false;
      if (end < -0.5 || end > commit + 0.5) boundOK = false;
      if (exp[i].cash < minC - 0.5) cashOK = false;
      if (i > 0 && exp[i].begin !== exp[i - 1].end) rollOK = false;
      bal = end;
    }
    const drew = exp.filter(e => e.draw > 0).length;
    const capped = exp.filter(e => e.sweep !== 0 && Math.abs(e.sweep) === e.begin).length;
    const partial = exp.filter(e => e.sweep !== 0 && Math.abs(e.sweep) < e.begin).length;
    if (drew !== 1 || capped < 1 || partial < 2) pedOK = false;
  }
  is(mOK, 'the revolver identity holds on every seed: draw=MAX(0,min−cash) · sweep=−MIN(begin,MAX(0,cash−min)) · end=begin+draw+sweep');
  is(rollOK, 'the corkscrew rolls: every year opens on the prior year close (MODELING_STANDARDS §3)');
  is(boundOK, 'the balance never goes negative and never exceeds the commitment');
  is(cashOK, 'cash after the revolver never lands below the minimum — the point of the drill');
  is(pedOK, 'pedagogy guaranteed per seed: exactly one year where the MAX bites, ≥1 where the MIN caps the sweep, ≥2 partial sweeps');

  /* ============================ C · ROUTE WALKS ============================ */
  console.log('\nC · ROUTE WALKS — every legal route to the same visible end state must clear (§1.0-R3(p), CAMPAIGN §1)');
  const HDR = `const o=C._o, R=o.R, SR={key:'ArrowRight',shift:true}, SD={key:'ArrowDown',shift:true},
    DRAW='=MAX(0,$'+o.CB+'$'+R.mc+'-'+o.CB+R.cb+')',
    SWEEP='=-MIN('+o.CB+R.bb+',MAX(0,'+o.CB+R.cb+'-$'+o.CB+'$'+R.mc+'))',
    END='=SUM('+o.CB+R.bb+':'+o.CB+R.sw+')',
    CASH='='+o.CB+R.cb+'+'+o.CB+R.dr+'+'+o.CB+R.sw+'';`;
  /* the common skeleton: the first year's three formulas, the dress, the roll, the block fill and
     the cash line — parameterised on the pieces each route varies. Written out in full rather
     than assembled cleverly: a route walk that is silently wrong is worse than no route walk. */
  const R_ = (drawF, sweepF, endF, dressKeys, fillKeys, rollF, cashF) => `C => { ${HDR}
    const FILL = ${fillKeys};
    return [
      {sel:o.CB+R.dr, keys:[...T(${drawF}), {key:'Enter'}]},
      {sel:o.CB+R.sw, keys:[...T(${sweepF}), {key:'Enter'}]},
      {sel:o.CB+R.eb, keys:[...T(${endF}), {key:'Enter'}]},
      {sel:o.CB+R.eb, keys:[SR,SR,SR, ...${dressKeys}]},
      {sel:o.CC+R.bb, keys:[...T(${rollF}), {key:'Enter'}]},
      {sel:o.CC+R.bb, keys:[SR,SR, ...FILL]},
      {sel:o.CB+R.dr, keys:[SR,SR,SR,SD,SD, ...FILL]},
      {sel:o.CB+R.cp, keys:[...T(${cashF}), {key:'Enter'}]},
      {sel:o.CB+R.cp, keys:[SR,SR,SR, ...FILL]},
    ]; }`;
  const CTRLR = `[{key:'r',ctrl:true}]`;
  const RIBBONFILL = `[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]`;
  const D_BP = `[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]`;      // Ctrl+B + Top border
  const D_BA = `[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('a')]`;      // Ctrl+B + ALL borders  → ball
  const D_BS = `[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('s')]`;      // Ctrl+B + Outside
  const D_BD = `[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('d')]`;      // Ctrl+B + Top & bottom
  const D_BT = `[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('t')]`;      // Ctrl+B + Thick box
  const D_RIB = `[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('p')]`; // ribbon bold + Top

  const taught = await route('taught route (the demo)', null, 'star');
  await route('sweep written MAX-outside: =-MAX(0,MIN(begin,cash−min))',
    R_(`DRAW`, `'=-MAX(0,MIN('+o.CB+R.bb+','+o.CB+R.cb+'-$'+o.CB+'$'+R.mc+'))'`, `END`, D_BP, CTRLR, `'='+o.CB+R.eb`, `CASH`), 'star');
  await route('both lines written with IF instead of MIN/MAX',
    R_(`'=IF($'+o.CB+'$'+R.mc+'>'+o.CB+R.cb+',$'+o.CB+'$'+R.mc+'-'+o.CB+R.cb+',0)'`,
       `'=-IF('+o.CB+R.cb+'-$'+o.CB+'$'+R.mc+'>'+o.CB+R.bb+','+o.CB+R.bb+',MAX(0,'+o.CB+R.cb+'-$'+o.CB+'$'+R.mc+'))'`,
       `END`, D_BP, CTRLR, `'='+o.CB+R.eb`, `CASH`), 'star');
  await route('ending totalled by an addition chain instead of SUM',
    R_(`DRAW`, `SWEEP`, `'='+o.CB+R.bb+'+'+o.CB+R.dr+'+'+o.CB+R.sw`, D_BP, CTRLR, `'='+o.CB+R.eb`, `CASH`), 'star');
  await route('ending row dressed with ALL borders (alt h b a → ball)',
    R_(`DRAW`, `SWEEP`, `END`, D_BA, CTRLR, `'='+o.CB+R.eb`, `CASH`), 'star');
  await route('ending row dressed with Outside borders (alt h b s)',
    R_(`DRAW`, `SWEEP`, `END`, D_BS, CTRLR, `'='+o.CB+R.eb`, `CASH`), 'star');
  await route('ending row dressed top AND bottom (alt h b d)',
    R_(`DRAW`, `SWEEP`, `END`, D_BD, CTRLR, `'='+o.CB+R.eb`, `CASH`), 'star');
  await route('ending row dressed with the thick box (alt h b t)',
    R_(`DRAW`, `SWEEP`, `END`, D_BT, CTRLR, `'='+o.CB+R.eb`, `CASH`), 'star');
  await route('ribbon bold (alt h 1) instead of ctrl+b',
    R_(`DRAW`, `SWEEP`, `END`, D_RIB, CTRLR, `'='+o.CB+R.eb`, `CASH`), 'star');
  await route('every fill taken through the ribbon (alt h f i r)',
    R_(`DRAW`, `SWEEP`, `END`, D_BP, RIBBONFILL, `'='+o.CB+R.eb`, `CASH`), 'star');
  await route('the roll written anchored (=$B$eb) — the anchoring habit the catalog teaches',
    `C => { ${HDR}
      return [
        {sel:o.CB+R.dr, keys:[...T(DRAW), {key:'Enter'}]},
        {sel:o.CB+R.sw, keys:[...T(SWEEP), {key:'Enter'}]},
        {sel:o.CB+R.eb, keys:[...T(END), {key:'Enter'}]},
        {sel:o.CB+R.eb, keys:[SR,SR,SR, {key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]},
        {sel:o.CB+R.dr, keys:[SR,SR,SR,SD,SD, {key:'r',ctrl:true}]},
        {sel:o.CC+R.bb, keys:[...T('=$'+o.CB+'$'+R.eb), {key:'Enter'}]},
        {sel:o.CD+R.bb, keys:[...T('=$'+o.CC+'$'+R.eb), {key:'Enter'}]},
        {sel:o.CE+R.bb, keys:[...T('=$'+o.CD+'$'+R.eb), {key:'Enter'}]},
        {sel:o.CB+R.cp, keys:[...T(CASH), {key:'Enter'}]},
        {sel:o.CB+R.cp, keys:[SR,SR,SR, {key:'r',ctrl:true}]},
      ]; }`, 'star');

  /* THE SLOW ROUTE — no fill anywhere, every year written on its own. Must clear every core
     (§1.0(c) freedom) and must NOT earn the ☆ (§1.0-R2(i) skippability), measured not asserted. */
  const SLOW = `C => { const o=C._o, R=o.R, CL=[o.CB,o.CC,o.CD,o.CE]; const mv=[];
      for(let i=0;i<4;i++){ const c=CL[i];
        mv.push({sel:c+R.dr, keys:[...T('=MAX(0,$'+o.CB+'$'+R.mc+'-'+c+R.cb+')'), {key:'Enter'}]});
        mv.push({sel:c+R.sw, keys:[...T('=-MIN('+c+R.bb+',MAX(0,'+c+R.cb+'-$'+o.CB+'$'+R.mc+'))'), {key:'Enter'}]});
        mv.push({sel:c+R.eb, keys:[...T('=SUM('+c+R.bb+':'+c+R.sw+')'), {key:'Enter'}]});
        mv.push({sel:c+R.cp, keys:[...T('='+c+R.cb+'+'+c+R.dr+'+'+c+R.sw), {key:'Enter'}]});
        if(i>0) mv.push({sel:c+R.bb, keys:[...T('='+CL[i-1]+R.eb), {key:'Enter'}]});
        mv.push({sel:c+R.eb, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('p')]});
      }
      return mv; }`;
  const slow = await route('SLOW: no fill anywhere, every year typed, each column dressed on its own', SLOW, 'nostar');

  /* ============================ D · THE ☆ ============================ */
  console.log('\nD · THE ☆ — earned by both fill routes, skippable by measurement (§1.0(d), §1.0-R2(i))');
  const NEG = `C => { ${HDR}
      return [
        {sel:o.CB+R.dr, keys:[...T(DRAW), {key:'Enter'}]},
        {sel:o.CB+R.sw, keys:[...T(SWEEP), {key:'Enter'}]},
        {sel:o.CB+R.eb, keys:[...T(END), {key:'Enter'}]},
        {sel:o.CB+R.eb, keys:[SR,SR,SR, {key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]},
        {sel:o.CC+R.bb, keys:[...T('='+o.CB+R.eb), {key:'Enter'}]},
        {sel:o.CC+R.bb, keys:[SR,SR, {key:'r',ctrl:true}]},
        {sel:o.CB+R.dr, keys:[SR,SR,SR, {key:'r',ctrl:true}]},
        {sel:o.CB+R.sw, keys:[SR,SR,SR, {key:'r',ctrl:true}]},
        {sel:o.CB+R.eb, keys:[SR,SR,SR, {key:'r',ctrl:true}]},
        {sel:o.CB+R.cp, keys:[...T(CASH), {key:'Enter'}]},
        {sel:o.CB+R.cp, keys:[SR,SR,SR, {key:'r',ctrl:true}]},
      ]; }`;
  const neg = await route('NEGATIVE CONTROL: three separate row fills — the ☆ must stay dark', NEG, 'nostar');

  /* isolated measurement of the one decision the ☆ asks for (the r438 `series` rule: measure the
     move against its OWN slow alternative, never inside a combined total) */
  const med = a => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  const iso = await page.evaluate(() => {
    const cost = (build) => { document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
      loadChallenge('revolver'); const C = CHALLENGES.revolver, o = C._o, R = o.R;
      const SR = { key: 'ArrowRight', shift: true }, SD = { key: 'ArrowDown', shift: true };
      /* first year built identically in all three, then only the carry-across differs */
      const pre = [
        { sel: o.CB + R.dr, keys: [...T('=MAX(0,$' + o.CB + '$' + R.mc + '-' + o.CB + R.cb + ')'), Kb.enter] },
        { sel: o.CB + R.sw, keys: [...T('=-MIN(' + o.CB + R.bb + ',MAX(0,' + o.CB + R.cb + '-$' + o.CB + '$' + R.mc + '))'), Kb.enter] },
        { sel: o.CB + R.eb, keys: [...T('=SUM(' + o.CB + R.bb + ':' + o.CB + R.sw + ')'), Kb.enter] },
      ];
      for (const mv of pre) { setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
      const before = keyLog.length;
      for (const mv of build(o, R, SR, SD)) { setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
      return keyLog.length - before; };
    const block = [], rows = [], typed = [];
    for (let i = 0; i < 5; i++) {
      block.push(cost((o, R, SR, SD) => [{ sel: o.CB + R.dr, keys: [SR, SR, SR, SD, SD, Kb.fillR] }]));
      rows.push(cost((o, R, SR) => [
        { sel: o.CB + R.dr, keys: [SR, SR, SR, Kb.fillR] },
        { sel: o.CB + R.sw, keys: [SR, SR, SR, Kb.fillR] },
        { sel: o.CB + R.eb, keys: [SR, SR, SR, Kb.fillR] }]));
      typed.push(cost((o, R) => { const CL = [o.CC, o.CD, o.CE]; const mv = [];
        for (const c of CL) { mv.push({ sel: c + R.dr, keys: [...T('=MAX(0,$' + o.CB + '$' + R.mc + '-' + c + R.cb + ')'), Kb.enter] });
          mv.push({ sel: c + R.sw, keys: [...T('=-MIN(' + c + R.bb + ',MAX(0,' + c + R.cb + '-$' + o.CB + '$' + R.mc + '))'), Kb.enter] });
          mv.push({ sel: c + R.eb, keys: [...T('=SUM(' + c + R.bb + ':' + c + R.sw + ')'), Kb.enter] }); }
        return mv; }));
    }
    return { block: block, rows: rows, typed: typed };
  });
  const bK = med(iso.block), rK = med(iso.rows), tK = med(iso.typed);
  is(bK < rK && bK < tK, 'the ☆ decision measured in isolation: one block grab ' + bK + ' keys · three row fills ' + rK +
    ' · the nine cells typed ' + tK + ' (both comparisons positive — the r438 `series` rule)');

  /* ============================ E · HEADROOM ============================ */
  console.log('\nE · ☆-HEADROOM DIAGNOSTIC on the rebuilt board (CAMPAIGN §2)');
  const fast = med(taught.map(x => x.keys)), slw = med(slow.map(x => x.keys));
  console.log('  fastest legal ' + fast + ' keys · slowest legal ' + slw + ' keys · spread ' + (slw / fast).toFixed(2) + '×');
  is(slw / fast >= 1.3, 'spread ' + (slw / fast).toFixed(2) + '× — part 1 clears the ~1.3× warning line');
  is(neg.every(x => x.cores) && neg.every(x => !x.star) && slow.every(x => x.cores) && slow.every(x => !x.star),
    'part 2: the surviving spread is FILL-versus-RETYPE, which §1.0(d) names as a ☆ family — and both ☆-forfeiting controls clear every core');

  const flat = taught.map(x => x.keys);
  is(new Set(flat).size === 1, 'par is FLAT across seeds (' + flat.join('/') + ') — the geometry never moves with the draw');

  if (errs.length) { bad('PAGE ERRORS: ' + errs.slice(0, 4).join(' · ')); }
  console.log('\nverify-revolver: ' + pass + ' green, ' + fail + ' red');
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
