/* verify-sourcesuses.js (r445, DEPTH_PASS §4.66) — the dedicated probe for `sourcesuses`.

   WHY THIS FILE EXISTS. The depth-pass rework of this drill was driven by two UNTRIGGERABLE
   BEATS (DEPTH_PASS_CAMPAIGN §1) that no amount of reading the predicates would have found: both
   percent beats graded formula TEXT for a `$` anchor, so a player who typed the percents one at a
   time — unanchored, landing the IDENTICAL board — watched two lines stay dark with nothing to
   fix. That class is only ever found by WALKING every Excel route to the visible end state, so
   this probe walks them, one route at a time, and asserts the beat clears.

   It is self-contained and names ONLY `sourcesuses` (the C13 retirement guard sweeps dev/ for
   quoted drill keys, so a probe that mentions a neighbour would break it).

   PARTS
     A · anatomy — tri-length, exactly one ☆, saveClose declared, ROWS/density, load-state ####.
     B · the ROUTE MATRIX — every core beat × every legal route to its end state. Any FAIL here is
         an untriggerable beat.
     C · the ☆ — earned by each of its three legal mechanics, and the measured NEGATIVE CONTROL
         (every core clears with the ☆ dark), plus each half isolated against its own slow route.
     D · the fill-format hazard (r439 `cases`) — a fill carries the SOURCE cell's format, so the
         win state is inspected for a percent cell the star route degraded.

   Run:  node dev/verify-sourcesuses.js          (server on 127.0.0.1:8791, or URL=…)          */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const REPS = parseInt(process.env.REPS || '5', 10);

let fails = 0;
const ok = m => console.log('  ok   ' + m);
const bad = m => { fails++; console.log('  FAIL ' + m); };

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 160)));
  /* the probe MUST mirror the real harness init or its output is a lie (CAMPAIGN §4) */
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1');
    localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_gate_off', '1');
    localStorage.setItem('hk_handle_cache', '');
    localStorage.setItem('hk_xlv', '2');
  } catch (e) {} });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof demoKey === 'function'
    && typeof loadChallenge === 'function' && typeof setDemoSel === 'function', null, { timeout: 15000 });
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  /* the route library lives page-side: each entry returns demo-style moves built off the live
     _o geometry, so it survives the corner jitter and every label pool. */
  const ROUTES = `(() => {
    const o = CHALLENGES.sourcesuses._o, R = o.R;
    const CA = o.CA, CB = o.CB, CC = o.CC;
    const dn = { key: 'ArrowDown', shift: true }, rt = { key: 'ArrowRight', shift: true };
    const AL = ch => ({ key: ch, code: 'Key' + ch.toUpperCase() });
    const typ = s => [...s].map(ch => ({ key: ch }));
    const ENT = { key: 'Enter' };
    const span5 = [dn, dn, dn, dn];
    return {
      /* ── beat 1 · Total the uses ─────────────────────────────────────────── */
      tu: {
        sum:      [{ sel: CB + R.tu, keys: [...typ('=SUM(' + CB + R.u0 + ':' + CB + R.uN + ')'), ENT] }],
        chain:    [{ sel: CB + R.tu, keys: [...typ('=' + CB + R.u0 + '+' + CB + (R.u0+1) + '+' + CB + (R.u0+2) + '+' + CB + R.uN), ENT] }],
        anchored: [{ sel: CB + R.tu, keys: [...typ('=SUM($' + CB + '$' + R.u0 + ':$' + CB + '$' + R.uN + ')'), ENT] }],
        autosum:  [{ sel: CB + R.tu, keys: [{ key: '=', alt: true, code: 'Equal' }, ENT] }],
        autosumBlock: [{ sel: CB + R.u0, keys: [dn, dn, dn, dn, { key: '=', alt: true, code: 'Equal' }] }],
      },
      /* ── beat 2 · Build sponsor equity (the plug) ────────────────────────── */
      pl: {
        chain: [{ sel: CB + R.pl, keys: [...typ('=' + CB + R.tu + '-' + CB + R.s0 + '-' + CB + (R.s0+1) + '-' + CB + (R.s0+2)), ENT] }],
        sum:   [{ sel: CB + R.pl, keys: [...typ('=' + CB + R.tu + '-SUM(' + CB + R.s0 + ':' + CB + R.sN + ')'), ENT] }],
        anch:  [{ sel: CB + R.pl, keys: [...typ('=$' + CB + '$' + R.tu + '-SUM($' + CB + '$' + R.s0 + ':$' + CB + '$' + R.sN + ')'), ENT] }],
      },
      /* ── beat 3 · Total the sources ──────────────────────────────────────── */
      ts: {
        sum:     [{ sel: CB + R.ts, keys: [...typ('=SUM(' + CB + R.s0 + ':' + CB + R.pl + ')'), ENT] }],
        chain:   [{ sel: CB + R.ts, keys: [...typ('=' + CB + R.s0 + '+' + CB + (R.s0+1) + '+' + CB + R.sN + '+' + CB + R.pl), ENT] }],
        autosum: [{ sel: CB + R.ts, keys: [{ key: '=', alt: true, code: 'Equal' }, ENT] }],
      },
      /* ── beat 4 · Build the check ────────────────────────────────────────── */
      ck: {
        plain:  [{ sel: CB + R.ck, keys: [...typ('=' + CB + R.ts + '-' + CB + R.tu), ENT] }],
        anch:   [{ sel: CB + R.ck, keys: [...typ('=$' + CB + '$' + R.ts + '-$' + CB + '$' + R.tu), ENT] }],
        flip:   [{ sel: CB + R.ck, keys: [...typ('=' + CB + R.tu + '-' + CB + R.ts), ENT] }],
        summed: [{ sel: CB + R.ck, keys: [...typ('=SUM(' + CB + R.ts + ')-SUM(' + CB + R.tu + ')'), ENT] }],
      },
      /* ── beat 5 · Build the % of total ───────────────────────────────────── */
      pct: {
        /* the star route: one anchored formula per side, one fill each */
        anchFill: [
          { sel: CC + R.u0, keys: [...typ('=' + CB + R.u0 + '/$' + CB + '$' + R.tu), ENT] },
          { sel: CC + R.u0, keys: [...span5, { key: 'd', ctrl: true }] },
          { sel: CC + R.s0, keys: [...typ('=' + CB + R.s0 + '/$' + CB + '$' + R.ts), ENT] },
          { sel: CC + R.s0, keys: [...span5, { key: 'd', ctrl: true }] }],
        /* THE BUG ROUTE — ten cells typed, no anchor anywhere; identical board */
        typedBare: (() => { const mv = [];
          for (let i = 0; i <= 4; i++) mv.push({ sel: CC + (R.u0 + i), keys: [...typ('=' + CB + (R.u0 + i) + '/' + CB + R.tu), ENT] });
          for (let i = 0; i <= 4; i++) mv.push({ sel: CC + (R.s0 + i), keys: [...typ('=' + CB + (R.s0 + i) + '/' + CB + R.ts), ENT] });
          return mv; })(),
        /* row-locked only — a fill down needs nothing more */
        halfAnchFill: [
          { sel: CC + R.u0, keys: [...typ('=' + CB + R.u0 + '/' + CB + '$' + R.tu), ENT] },
          { sel: CC + R.u0, keys: [...span5, { key: 'd', ctrl: true }] },
          { sel: CC + R.s0, keys: [...typ('=' + CB + R.s0 + '/' + CB + '$' + R.ts), ENT] },
          { sel: CC + R.s0, keys: [...span5, { key: 'd', ctrl: true }] }],
        /* F4 cycles the reference to absolute instead of typing the dollars */
        f4Fill: [
          { sel: CC + R.u0, keys: [...typ('=' + CB + R.u0 + '/' + CB + R.tu), { key: 'F4' }, ENT] },
          { sel: CC + R.u0, keys: [...span5, { key: 'd', ctrl: true }] },
          { sel: CC + R.s0, keys: [...typ('=' + CB + R.s0 + '/' + CB + R.ts), { key: 'F4' }, ENT] },
          { sel: CC + R.s0, keys: [...span5, { key: 'd', ctrl: true }] }],
        /* the ribbon's Fill ▸ Down — the same latch, no chord privileged (§1.0(c)) */
        ribbonFill: [
          { sel: CC + R.u0, keys: [...typ('=' + CB + R.u0 + '/$' + CB + '$' + R.tu), ENT] },
          { sel: CC + R.u0, keys: [...span5, { key: 'Alt' }, AL('h'), AL('f'), AL('i'), AL('d')] },
          { sel: CC + R.s0, keys: [...typ('=' + CB + R.s0 + '/$' + CB + '$' + R.ts), ENT] },
          { sel: CC + R.s0, keys: [...span5, { key: 'Alt' }, AL('h'), AL('f'), AL('i'), AL('d')] }],
        /* copy once, paste over the rest of the block */
        copyPaste: [
          { sel: CC + R.u0, keys: [...typ('=' + CB + R.u0 + '/$' + CB + '$' + R.tu), ENT] },
          { sel: CC + R.u0, keys: [{ key: 'c', ctrl: true }] },
          { sel: CC + (R.u0 + 1), keys: [dn, dn, dn, { key: 'v', ctrl: true }] },
          { sel: CC + R.s0, keys: [...typ('=' + CB + R.s0 + '/$' + CB + '$' + R.ts), ENT] },
          { sel: CC + R.s0, keys: [{ key: 'c', ctrl: true }] },
          { sel: CC + (R.s0 + 1), keys: [dn, dn, dn, { key: 'v', ctrl: true }] }],
      },
      /* ── beat 6 · Bold both total rows + a top border above each ─────────── */
      rule: {
        hbp:      [R.tu, R.ts].map(r => ({ sel: CA + r, keys: [rt, rt, { key: 'b', ctrl: true }, { key: 'Alt' }, AL('h'), AL('b'), AL('p')] })),
        outside:  [R.tu, R.ts].map(r => ({ sel: CA + r, keys: [rt, rt, { key: 'b', ctrl: true }, { key: 'Alt' }, AL('h'), AL('b'), AL('s')] })),
        allEdges: [R.tu, R.ts].map(r => ({ sel: CA + r, keys: [rt, rt, { key: 'b', ctrl: true }, { key: 'Alt' }, AL('h'), AL('b'), AL('a')] })),
        topBot:   [R.tu, R.ts].map(r => ({ sel: CA + r, keys: [rt, rt, { key: 'b', ctrl: true }, { key: 'Alt' }, AL('h'), AL('b'), AL('d')] })),
        thick:    [R.tu, R.ts].map(r => ({ sel: CA + r, keys: [rt, rt, { key: 'b', ctrl: true }, { key: 'Alt' }, AL('h'), AL('b'), AL('t')] })),
        wholeRow: [R.tu, R.ts].map(r => ({ sel: CA + r, keys: [{ key: ' ', shift: true }, { key: 'Alt' }, AL('h'), { key: '1', code: 'Digit1' }, { key: 'Alt' }, AL('h'), AL('b'), AL('p')] })),
        figsOnly: [R.tu, R.ts].map(r => ({ sel: CB + r, keys: [rt, { key: 'b', ctrl: true }, { key: 'Alt' }, AL('h'), AL('b'), AL('p')] })),
      },
    };
  })()`;

  /* run ONE combination of routes and report which beats cleared */
  const solve = (plan) => page.evaluate(({ plan, src }) => {
    document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
    loadChallenge('sourcesuses');
    const C = CHALLENGES.sourcesuses;
    const RT = eval(src);
    const order = plan.order || ['tu', 'pl', 'ts', 'ck', 'pct', 'rule'];
    for (const beat of order) {
      const mv = RT[beat][plan[beat]];
      if (!mv) throw new Error('no route ' + beat + '.' + plan[beat]);
      for (const m of mv) { setDemoSel(m.sel); for (const k of m.keys) demoKey(k); }
    }
    if (!done && C.saveClose) demoKey({ key: 's', ctrl: true });
    const items = C.checks(S);
    return {
      won: !!done,
      labels: items.map(x => x.label),
      oks: items.map(x => !!x.ok),
      bonus: items.map(x => !!x.bonus),
      keys: keyLog.length,
    };
  }, { plan, src: ROUTES });

  const coresClear = r => r.oks.every((v, i) => v || r.bonus[i] || /Save your work/.test(r.labels[i]));
  const starOn = r => r.oks[r.bonus.indexOf(true)] === true;
  const darkCores = r => r.labels.filter((l, i) => !r.oks[i] && !r.bonus[i] && !/Save your work/.test(l)).map(l => l.slice(0, 46));

  console.log('\n── A · ANATOMY ──────────────────────────────────────────────');
  const anat = await page.evaluate(() => {
    loadChallenge('sourcesuses');
    const C = CHALLENGES.sourcesuses;
    const items = C.checks(S), g = C.guide(), t = C.targets();
    /* density at the WIN state = rows carrying content OR scripted purpose. The board seeds every
       graded cell (empty but formatted), so a row that will hold a built figure already exists in
       S.cells — count a row if any cell in it has a value OR is a declared build target. */
    const o = C._o, R = o.R;
    const rowsUsed = new Set();
    for (const k in S.cells) { const c = S.cells[k]; const r = parseInt(k.slice(1), 10);
      if (c && (c.value !== null && c.value !== undefined)) rowsUsed.add(r); }
    [R.tu, R.pl, R.ts, R.ck].forEach(r => rowsUsed.add(r));
    for (let i = 0; i <= 4; i++) { rowsUsed.add(R.u0 + i); rowsUsed.add(R.s0 + i); }
    /* load-state #### scan across every column the board writes */
    let hashed = 0;
    for (let c = 1; c <= 10; c++) if (typeof overflowsCol === 'function' && overflowsCol(S, c)) hashed++;
    return { rows: S.ROWS, checks: items.length, guide: g.length, targets: t.length,
      bonus: items.filter(x => x.bonus).length, save: items.filter(x => x.save).length,
      saveClose: !!C.saveClose, density: rowsUsed.size, hashed,
      labels: items.map(x => x.label) };
  });
  (anat.rows === 20 ? ok : bad)('ROWS = ' + anat.rows + ' (§1.3: 20 is floor AND cap)');
  (anat.checks === anat.guide && anat.checks === anat.targets ? ok : bad)(
    'tri-length: checks=' + anat.checks + ' guide=' + anat.guide + ' targets=' + anat.targets + ' (§1.9, save beat included)');
  (anat.bonus === 1 ? ok : bad)('exactly one ☆ bonus beat (found ' + anat.bonus + ', §1.1/§2.2)');
  (anat.saveClose && anat.save === 1 ? ok : bad)('saveClose declared and the engine appended exactly one save beat (§1.0(e))');
  (anat.checks - anat.bonus - anat.save >= 4 && anat.checks - anat.bonus - anat.save <= 6 ? ok : bad)(
    (anat.checks - anat.bonus - anat.save) + ' core beats (§1.1 wants 4–6)');
  (anat.density >= 12 ? ok : bad)('§1.3 win-state density ' + anat.density + '/20 = ' + Math.round(anat.density / 0.2) + '% (target ≥60%)');
  (anat.hashed === 0 ? ok : bad)('no column overflows at load — ' + anat.hashed + ' would print #### (doctrine §4.5)');

  console.log('\n── B · ROUTE MATRIX (the untriggerable-beat hunt) ───────────');
  const BASE = { tu: 'sum', pl: 'chain', ts: 'sum', ck: 'plain', pct: 'anchFill', rule: 'hbp' };
  const MATRIX = {
    tu: ['sum', 'chain', 'anchored', 'autosum', 'autosumBlock'],
    pl: ['chain', 'sum', 'anch'],
    ts: ['sum', 'chain', 'autosum'],
    ck: ['plain', 'anch', 'flip', 'summed'],
    pct: ['anchFill', 'typedBare', 'halfAnchFill', 'f4Fill', 'ribbonFill', 'copyPaste'],
    rule: ['hbp', 'outside', 'allEdges', 'topBot', 'thick', 'wholeRow', 'figsOnly'],
  };
  for (const beat of Object.keys(MATRIX)) {
    for (const route of MATRIX[beat]) {
      let clean = 0, note = '';
      for (let rep = 0; rep < REPS; rep++) {
        const r = await solve({ ...BASE, [beat]: route });
        if (coresClear(r) && r.won) clean++; else note = darkCores(r).join(' | ');
      }
      (clean === REPS ? ok : bad)(beat + '.' + route + ' → all cores clear ' + clean + '/' + REPS +
        (clean === REPS ? '' : '  ← UNTRIGGERABLE: ' + note));
    }
  }
  /* op ORDER freedom: the same routes, run backwards (§1.0-R3(p) grades the end state) */
  {
    let clean = 0, note = '';
    for (let rep = 0; rep < REPS; rep++) {
      const r = await solve({ ...BASE, order: ['ck', 'ts', 'pl', 'tu', 'pct', 'rule'] });
      if (coresClear(r) && r.won) clean++; else note = darkCores(r).join(' | ');
    }
    (clean === REPS ? ok : bad)('order REVERSED (check first, totals last) → all cores clear ' + clean + '/' + REPS +
      (clean === REPS ? '' : '  ← ' + note));
  }

  console.log('\n── C · THE ☆ (earned, skippable, and worth the keys) ────────');
  for (const route of ['anchFill', 'ribbonFill', 'copyPaste', 'f4Fill', 'halfAnchFill']) {
    let lit = 0;
    for (let rep = 0; rep < REPS; rep++) { const r = await solve({ ...BASE, pct: route }); if (starOn(r)) lit++; }
    (lit === REPS ? ok : bad)('☆ EARNED by pct.' + route + ' ' + lit + '/' + REPS + ' (§1.0(c): no chord privileged)');
  }
  {
    let lit = 0, clean = 0, keys = [];
    for (let rep = 0; rep < REPS; rep++) {
      const r = await solve({ ...BASE, pct: 'typedBare' });
      if (starOn(r)) lit++; if (coresClear(r) && r.won) clean++; keys.push(r.keys);
    }
    (lit === 0 && clean === REPS ? ok : bad)('NEGATIVE CONTROL — ten percents typed: cores ' + clean + '/' + REPS +
      ', ☆ dark ' + (REPS - lit) + '/' + REPS + ' (§1.0-R2(i): the ☆ is a real, skippable decision)');
    const star = [];
    for (let rep = 0; rep < REPS; rep++) star.push((await solve({ ...BASE, pct: 'anchFill' })).keys);
    const med = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
    ok('spread: star route ' + med(star) + ' keys · slow route ' + med(keys) + ' keys · ' +
      (med(keys) / med(star)).toFixed(2) + '× (CAMPAIGN §2 part 1)');
  }
  /* each HALF isolated — a combined number hides a negative half (r438 `series`) */
  {
    const half = await page.evaluate(({ src }) => {
      const out = {};
      const run = (which, how) => {
        document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
        loadChallenge('sourcesuses');
        const RT = eval(src), o = CHALLENGES.sourcesuses._o, R = o.R;
        const CB = o.CB, CC = o.CC, ENT = { key: 'Enter' };
        const typ = s => [...s].map(ch => ({ key: ch }));
        const r0 = which === 'uses' ? R.u0 : R.s0, tot = which === 'uses' ? R.tu : R.ts;
        const before = keyLog.length;
        if (how === 'fill') {
          setDemoSel(CC + r0); for (const k of [...typ('=' + CB + r0 + '/$' + CB + '$' + tot), ENT]) demoKey(k);
          setDemoSel(CC + r0); for (const k of [{ key: 'ArrowDown', shift: true }, { key: 'ArrowDown', shift: true },
            { key: 'ArrowDown', shift: true }, { key: 'ArrowDown', shift: true }, { key: 'd', ctrl: true }]) demoKey(k);
        } else {
          for (let i = 0; i <= 4; i++) { setDemoSel(CC + (r0 + i));
            for (const k of [...typ('=' + CB + (r0 + i) + '/' + CB + tot), ENT]) demoKey(k); }
        }
        return keyLog.length - before;
      };
      for (const w of ['uses', 'sources']) out[w] = { fill: run(w, 'fill'), typed: run(w, 'typed') };
      return out;
    }, { src: ROUTES });
    for (const w of ['uses', 'sources']) {
      const h = half[w];
      (h.fill < h.typed ? ok : bad)('☆ half "' + w + '" isolated: ' + h.fill + ' keys filled vs ' + h.typed +
        ' typed (' + (h.typed - h.fill) + ' saved)' + (h.fill < h.typed ? '' : '  ← NEGATIVE HALF, rebuild the board'));
    }
  }

  console.log('\n── D · the ☆ must not DEGRADE the board (r439 `cases`) ──────');
  {
    const deg = await page.evaluate(({ src }) => {
      document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
      loadChallenge('sourcesuses');
      const RT = eval(src), o = CHALLENGES.sourcesuses._o, R = o.R;
      for (const beat of ['tu', 'pl', 'ts', 'ck', 'pct', 'rule']) {
        const mv = RT[beat][{ tu: 'sum', pl: 'chain', ts: 'sum', ck: 'plain', pct: 'anchFill', rule: 'hbp' }[beat]];
        for (const m of mv) { setDemoSel(m.sel); for (const k of m.keys) demoKey(k); }
      }
      demoKey({ key: 's', ctrl: true });
      const bad = [];
      for (let i = 0; i <= 4; i++) for (const r0 of [R.u0, R.s0]) {
        const c = S.cells[o.CC + (r0 + i)];
        if (!c || c.fmtStyle !== 'percent' || c.decimals !== 1) bad.push(o.CC + (r0 + i) + '=' + (c ? c.fmtStyle + '/' + c.decimals : 'missing'));
      }
      const tot = [R.tu, R.ts].map(r => [o.CB, o.CC].every(cc => { const x = S.cells[cc + r]; return x && x.bold && (x.bt || x.ball); }));
      return { bad, tot, won: !!done };
    }, { src: ROUTES });
    (deg.bad.length === 0 ? ok : bad)('every percent cell still reads percent/1 after the star fill' +
      (deg.bad.length ? ' — DEGRADED: ' + deg.bad.join(', ') : ''));
    (deg.tot.every(Boolean) && deg.won ? ok : bad)('both total rows still bold + ruled at the win state (the dress survives the fill)');
  }

  if (errs.length) { bad('PAGE ERRORS: ' + errs.slice(0, 3).join(' · ')); }
  console.log('\nverify-sourcesuses: ' + (fails ? fails + ' FAILURE(S)' : 'ALL GREEN'));
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
