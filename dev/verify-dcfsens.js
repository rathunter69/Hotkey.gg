/* dcfsens VERIFICATION PROBE (r444, DEPTH_PASS §4.63 depth pass) — the drill's dedicated probe.
   Self-contained and single-drill by construction: it names `dcfsens` and nothing else, so the
   C13 retirement guard can never trip on it.

   WHY IT EXISTS (DEPTH_PASS_CAMPAIGN §1): the untriggerable-beat class — a check that grades a
   ROUTE while the board shows the right answer — has been found thirteen times and NEVER by
   reading a predicate. Every route to this board's visible end state is enumerated and WALKED
   here, including the two that a first-draft predicate would have locked out. It also re-measures
   the ☆-headroom diagnostic (§2 there, both halves separately per the r438 `series` rule) and the
   board invariants that a later edit could quietly break.

   Run:  node dev/verify-dcfsens.js          (server on 127.0.0.1:8791)
         URL=http://127.0.0.1:8873/index.html node dev/verify-dcfsens.js     (worktree port)

   The init below MIRRORS the real gate harnesses (hotkey_onboarded / hk_tour_done /
   hk_learn_done / hk_beta_ok / hk_xlv / hk_handle_cache). A probe that boots the page in a
   different state than the gate does is measuring a different product — r440 lost a round to
   exactly that. */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const SEEDS = parseInt(process.env.SEEDS || '5', 10);

let pass = 0, fail = 0;
const ok = m => { pass++; console.log('  ok   ' + m); };
const bad = m => { fail++; console.log('  FAIL ' + m); };
const is = (cond, m) => cond ? ok(m) : bad(m);

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1'); localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_gate_off', '1'); localStorage.setItem('hk_beta_ok', '1');
    localStorage.setItem('hk_xlv', '2'); localStorage.setItem('hk_handle_cache', '');
  } catch (e) {} });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof demoKey === 'function');
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  /* the page-side driver every section uses: load, run a move list, report the checklist, the
     ☆ state, the key count and any board fact the section asked for. */
  const drive = (movesSrc, extraSrc) => page.evaluate(({ m, x }) => {
    document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
    loadChallenge('dcfsens');
    const C = CHALLENGES.dcfsens, o = C._o;
    let moves = [];
    try { moves = eval('(' + m + ')')(C, o); } catch (e) { return { threw: 'MOVES ' + String(e).slice(0, 120) }; }
    for (const mv of moves) { setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
    if (!done && C.saveClose) demoKey({ key: 's', ctrl: true });
    const items = C.checks(S);
    const core = items.filter(c => !c.bonus && !c.save);
    const star = items.find(c => c.bonus);
    const out = { won: !!done, keys: keyLog.length, cores: core.map(c => !!c.ok), star: !!(star && star.ok),
      labels: core.map(c => c.label) };
    if (x) { try { out.extra = eval('(' + x + ')')(C, o, S); } catch (e) { out.extra = 'EXTRA ' + String(e).slice(0, 120); } }
    return out;
  }, { m: movesSrc, x: extraSrc || null });

  /* ---------- shared move builders (page-side source strings) ---------- */
  const F = '(o,i,j)=>"=$"+o.CB+"$"+o.rTfcf+"/("+o.yc[j]+"$"+o.hr+"-$"+o.CB+(o.gr0+i)+")"';
  const SHIFT = 'n=>{const a=[];for(let k=0;k<n;k++)a.push({key:"ArrowRight",shift:true});return a;}';
  const SHIFTD = 'n=>{const a=[];for(let k=0;k<n;k++)a.push({key:"ArrowDown",shift:true});return a;}';
  const HEAD = `const f=${F}, R=${SHIFT}, D=${SHIFTD};`;
  const COMMA1 = '{sel:o.grid, keys:[{key:"1",ctrl:true},{key:"n",code:"KeyN"}]}';
  const BOXS = '{sel:o.baseCell, keys:[{key:"Alt"},{key:"h",code:"KeyH"},{key:"b",code:"KeyB"},{key:"s",code:"KeyS"}]}';

  console.log('\n=== A · BOARD INVARIANTS (' + SEEDS + ' seeds) ===');
  const rects = new Set();
  for (let s = 0; s < Math.max(SEEDS, 12); s++) {
    const b = await page.evaluate(() => {
      loadChallenge('dcfsens');
      const C = CHALLENGES.dcfsens, o = C._o, e = C._exp;
      const cel = k => S.cells[k] || {};
      const rows = [];
      for (let r = 1; r <= S.ROWS; r++) {
        let used = false;
        for (let c = 1; c <= 10; c++) { const x = S.cells[colLetter(c) + r];
          if (x && ((x.value !== null && x.value !== '') || x.formula)) { used = true; break; } }
        rows.push(used);
      }
      const grid = [];
      for (let i = 0; i < 3; i++) for (let j = 0; j < 5; j++) grid.push(o.yc[j] + (o.gr0 + i));
      const gw = document.getElementById('gridwrap') || document.querySelector('#grid').parentElement;
      const g = document.getElementById('grid') || document.querySelector('.grid');
      /* S._colW is the ENGINE width map render() stores (S.colW does not exist — the builder's
         colW is a local); the graders read the same map, r441. */
      let colSum = 0; for (let c = 1; c <= 10; c++) colSum += ((S._colW && S._colW[c]) || 78);
      // unscaled ##### verdict on every column, at LOAD
      const over = []; for (let c = 1; c <= 10; c++) if (overflowsCol(S, c)) over.push(c);
      const clip = []; for (let c = 1; c <= 10; c++) if (clipsCol(S, c)) clip.push(c);
      return { ROWS: S.ROWS, dens: rows.filter(Boolean).length,
        moats: [3 + o.d, 10 + o.d, 16 + o.d].map(r => !rows[r - 1]),
        rect: o.grid, base: o.baseCell, colSum, scroll: g.scrollWidth, box: gw.clientWidth,
        over, clip,
        gLtW: o.G.every(gg => o.W.every(ww => gg < ww)),
        tfcfLive: !!cel(o.fcfCell).formula && cel(o.fcfCell).value === cel(o.stripCell).value,
        tfcfBlack: !cel(o.fcfCell).fontColor,
        inputsBlue: [o.CB + o.rW, o.CB + o.rG, o.stripCell, o.yc[0] + o.hr, o.CB + o.gr0]
          .every(k => cel(k).fontColor === 'blue'),
        yellowStack: [o.CB + o.rW, o.CB + o.rG].every(k => cel(k).fill === 'yellow' && cel(k).ball
          && typeof cel(k).value === 'number'),
        labelled: [o.CA + o.rW, o.CA + o.rG, o.CA + o.rTfcf, o.CA + o.rFcf].every(k => !!cel(k).value),
        gridEmpty: grid.every(k => cel(k).value === null && !cel(k).formula),
        gridPlain: grid.every(k => cel(k).fmtStyle === 'general'),
        expOk: e.length === 3 && e[0].length === 5,
        baseInGrid: grid.indexOf(o.baseCell) >= 0,
        baseMatches: Math.abs(cel(o.CB + o.rW).value - o.W[o.jb]) < 1e-9
                  && Math.abs(cel(o.CB + o.rG).value - o.G[o.ib]) < 1e-9 };
    });
    rects.add(b.rect);
    if (s === 0) {
      is(b.ROWS === 20, 'ROWS = 20 (§1.3 floor and cap) — got ' + b.ROWS);
      is(b.dens >= 12, '§1.3 density ' + b.dens + '/20 (' + Math.round(b.dens * 5) + '%) ≥ 60% target');
      is(b.moats.every(Boolean), 'the three moat rows are blank across all ten columns (no ride-through)');
      is(b.colSum <= 822, 'column budget ' + b.colSum + 'px ≤ 822 (render\'s elastic budget at 1440 — no shrink)');
      is(b.scroll <= b.box, 'sheet renders inside its frame: ' + b.scroll + 'px ≤ ' + b.box + 'px');
      is(b.gridEmpty && b.gridPlain, 'the fifteen grid cells ship EMPTY and unformatted (beats 1-4 are real work)');
      is(b.labelled, '§1.3 labelled targets: every referenced row carries its label');
    }
    if (b.over.length) bad('seed ' + s + ': ##### at load in column(s) ' + b.over.join(','));
    if (b.clip.length) bad('seed ' + s + ': clipped label in column(s) ' + b.clip.join(','));
    if (!b.gLtW) bad('seed ' + s + ': g >= WACC somewhere (MODELING_STANDARDS §4 sanity check)');
    if (!b.tfcfLive) bad('seed ' + s + ': terminal-year FCF is not a live link to the strip');
    if (!b.tfcfBlack) bad('seed ' + s + ': terminal-year FCF is a formula but not black ink (§1 provenance)');
    if (!b.inputsBlue) bad('seed ' + s + ': a typed input is not blue (§1 provenance)');
    if (!b.yellowStack) bad('seed ' + s + ': the assumption stack is not yellow + all-borders + populated (§1.0(f)/(l))');
    if (!b.baseInGrid || !b.baseMatches) bad('seed ' + s + ': the base case does not sit at the intersection of its two inputs');
  }
  ok('no ##### and no clipped label at load across ' + Math.max(SEEDS, 12) + ' seeds (unscaled verdicts)');
  ok('provenance, the assumption stack, the live terminal-FCF link and the base-case intersection hold on every seed');
  is(rects.size >= 3, '§1.2(a) site pool: ' + rects.size + ' distinct grid rects over ' + Math.max(SEEDS, 12) + ' seeds (' + [...rects].join(' ') + ')');

  console.log('\n=== B · EVERY ROUTE TO THE VISIBLE END STATE (the CAMPAIGN §1 sweep) ===');
  const R = {};
  const run = async (name, movesSrc, extraSrc) => { const r = await drive(movesSrc, extraSrc); R[name] = r; return r; };

  // 1 · the taught route — one selection, Ctrl+D then Ctrl+R
  let r = await run('taught', `(C,o)=>{${HEAD} return [
    {sel:o.corner, keys:[...[...f(o,0,0)].map(ch=>({key:ch})), {key:"Enter"}]},
    {sel:o.corner, keys:[...R(4), ...D(2), {key:"d",ctrl:true}, {key:"r",ctrl:true}]},
    ${COMMA1}, ${BOXS} ]; }`);
  is(r.won && r.star, 'ONE selection, Ctrl+D then Ctrl+R: win + ☆ (' + r.keys + ' keys)');

  // 2 · two selections — across first, then down
  r = await run('twoSel', `(C,o)=>{${HEAD} return [
    {sel:o.corner, keys:[...[...f(o,0,0)].map(ch=>({key:ch})), {key:"Enter"}]},
    {sel:o.topRow, keys:[{key:"r",ctrl:true}]},
    {sel:o.grid,   keys:[{key:"d",ctrl:true}]},
    ${COMMA1}, ${BOXS} ]; }`);
  is(r.won && r.star, 'two selections, across then down: win + ☆ (' + r.keys + ' keys)');

  // 3 · op-ORDER alt — down the first column first, then right across the block
  r = await run('downFirst', `(C,o)=>{${HEAD} return [
    {sel:o.corner, keys:[...[...f(o,0,0)].map(ch=>({key:ch})), {key:"Enter"}]},
    {sel:o.corner+":"+o.yc[0]+(o.gr0+2), keys:[{key:"d",ctrl:true}]},
    {sel:o.grid, keys:[{key:"r",ctrl:true}]},
    ${COMMA1}, ${BOXS} ]; }`);
  is(r.won && r.star, 'down the column first, then right: win + ☆ (' + r.keys + ' keys)');

  // 4 · chord-ROUTE alt — the ribbon's own fills
  r = await run('ribbon', `(C,o)=>{${HEAD} const A=(...ks)=>[{key:"Alt"},...ks.map(c=>({key:c,code:"Key"+c.toUpperCase()}))]; return [
    {sel:o.corner, keys:[...[...f(o,0,0)].map(ch=>({key:ch})), {key:"Enter"}]},
    {sel:o.topRow, keys:A("h","f","i","r")},
    {sel:o.grid,   keys:A("h","f","i","d")},
    {sel:o.grid,   keys:A("h","k")},
    {sel:o.grid,   keys:[...A("h","9"), ...A("h","9")]},
    ${BOXS} ]; }`);
  is(r.won && r.star, 'ribbon fills (Alt H F I R / D) + Alt H K + Alt H 9 ×2: win + ☆ (' + r.keys + ' keys)');

  // 5 · F4 cycling instead of typed dollar signs (B7 → $B$7 ×1 · ×2 row lock · ×3 column lock)
  r = await run('f4', `(C,o)=>{const T2=s=>[...s].map(ch=>({key:ch})), F4={key:"F4"}; return [
    {sel:o.corner, keys:[...T2("="+o.fcfCell), F4, ...T2("/("+o.yc[0]+o.hr), F4, F4,
                         ...T2("-"+o.CB+o.gr0), F4, F4, F4, ...T2(")"), {key:"Enter"}]},
    {sel:o.corner, keys:[{key:"ArrowRight",shift:true},{key:"ArrowRight",shift:true},{key:"ArrowRight",shift:true},{key:"ArrowRight",shift:true},
                         {key:"ArrowDown",shift:true},{key:"ArrowDown",shift:true},{key:"d",ctrl:true},{key:"r",ctrl:true}]},
    ${COMMA1}, ${BOXS} ]; }`,
    '(C,o,S)=>String(S.cells[o.corner].formula||"")');
  is(r.won && r.star, 'F4 cycling lands the identical formula: win + ☆ · ' + r.extra);

  // 6 · Ctrl+Enter multi-commit over the whole grid — no fill op at all
  r = await run('multiEnter', `(C,o)=>{const T2=s=>[...s].map(ch=>({key:ch})); return [
    {sel:o.grid, keys:[...T2("=$"+o.CB+"$"+o.rTfcf+"/("+o.yc[0]+"$"+o.hr+"-$"+o.CB+o.gr0+")"), {key:"Enter",ctrl:true}]},
    ${COMMA1}, ${BOXS} ]; }`,
    '(C,o,S)=>({fills:(S.fillOps||[]).length, multi:(S.multiEnter||[]).length})');
  is(r.won && r.star, 'Ctrl+Enter multi-commit: win + ☆ with ZERO fill ops (' + JSON.stringify(r.extra) + ', ' + r.keys + ' keys)');

  // 7 · THE UNTRIGGERABLE-BEAT PROBE: the driver pointed at the forecast strip's last year
  //     instead of the labelled Terminal-year FCF cell. Same number, same board.
  r = await run('stripRef', `(C,o)=>{const T2=s=>[...s].map(ch=>({key:ch}));
    const g="=$"+o.stripCell.replace(/(\\d+)$/,"$$$1")+"/("+o.yc[0]+"$"+o.hr+"-$"+o.CB+o.gr0+")";
    return [
    {sel:o.corner, keys:[...T2(g), {key:"Enter"}]},
    {sel:o.corner, keys:[{key:"ArrowRight",shift:true},{key:"ArrowRight",shift:true},{key:"ArrowRight",shift:true},{key:"ArrowRight",shift:true},
                         {key:"ArrowDown",shift:true},{key:"ArrowDown",shift:true},{key:"d",ctrl:true},{key:"r",ctrl:true}]},
    ${COMMA1}, ${BOXS} ]; }`,
    '(C,o,S)=>String(S.cells[o.corner].formula||"")');
  is(r.won, 'the FCF read off the forecast strip instead of the summary cell still wins · ' + r.extra);

  // 8 · fully absolute references typed per cell — the legitimate slow-route end state
  r = await run('absTyped', `(C,o)=>{const out=[];
    for(let i=0;i<3;i++) for(let j=0;j<5;j++){
      const g="=$"+o.CB+"$"+o.rTfcf+"/($"+o.yc[j]+"$"+o.hr+"-$"+o.CB+"$"+(o.gr0+i)+")";
      out.push({sel:o.yc[j]+(o.gr0+i), keys:[...[...g].map(ch=>({key:ch})),{key:"Enter"}]}); }
    out.push(${COMMA1}); out.push(${BOXS}); return out; }`);
  is(r.won && !r.star, 'fifteen FULLY ABSOLUTE formulas typed per cell: every core clears, ☆ dark (' + r.keys + ' keys)');

  // 9 · the loophole control — fifteen IDENTICAL absolute formulas must NOT clear
  r = await run('absSame', `(C,o)=>{const g="=$"+o.CB+"$"+o.rTfcf+"/($"+o.yc[0]+"$"+o.hr+"-$"+o.CB+"$"+o.gr0+")"; const out=[];
    for(let i=0;i<3;i++) for(let j=0;j<5;j++) out.push({sel:o.yc[j]+(o.gr0+i), keys:[...[...g].map(ch=>({key:ch})),{key:"Enter"}]});
    out.push(${COMMA1}); out.push(${BOXS}); return out; }`);
  is(!r.won && r.cores[0] && !r.cores[1] && !r.cores[2],
    'fifteen IDENTICAL absolute formulas: the corner clears, beats 2 and 3 stay dark on VALUE (no all-absolute loophole)');

  // 10 · the doctrine §2.2 exception, recorded: a grid with NO locks reads right and is refused
  r = await run('noLocks', `(C,o)=>{const out=[];
    for(let i=0;i<3;i++) for(let j=0;j<5;j++){
      const g="="+o.fcfCell+"/("+o.yc[j]+o.hr+"-"+o.CB+(o.gr0+i)+")";
      out.push({sel:o.yc[j]+(o.gr0+i), keys:[...[...g].map(ch=>({key:ch})),{key:"Enter"}]}); }
    out.push(${COMMA1}); out.push(${BOXS}); return out; }`,
    '(C,o,S)=>{let n=0; for(let i=0;i<3;i++) for(let j=0;j<5;j++){ const c=S.cells[o.yc[j]+(o.gr0+i)]; if(c&&Math.abs(c.value-C._exp[i][j])<0.5) n++; } return n; }');
  is(!r.won && !r.cores[0] && !r.cores[1] && !r.cores[2] && r.cores[3] && r.cores[4] && r.extra === 15,
    'the anchor-text exception (doctrine §2.2, which names this drill): fifteen UNLOCKED formulas carry all fifteen right numbers and the three build beats stay dark — deliberate, stated in the labels and taught in the guide');

  console.log('\n=== C · THE DRESS BEATS, ROUTE BY ROUTE (§1.0-R3(p)) ===');
  const dress = async (name, keysSrc, which, want) => {
    const rr = await drive(`(C,o)=>{${HEAD} return [
      {sel:o.corner, keys:[...[...f(o,0,0)].map(ch=>({key:ch})), {key:"Enter"}]},
      {sel:o.corner, keys:[...R(4), ...D(2), {key:"d",ctrl:true}, {key:"r",ctrl:true}]},
      ${keysSrc} ]; }`);
    is(rr.cores[which] === want, name + ' → beat ' + (which + 1) + ' ' + (want ? 'clears' : 'stays dark') +
      (rr.cores[which] === want ? '' : ' (got ' + rr.cores[which] + ')'));
  };
  const A2 = (...ks) => '[{key:"Alt"},' + ks.map(c => '{key:"' + c + '",code:"Key' + c.toUpperCase() + '"}').join(',') + ']';
  await dress('Ctrl+1 → N (one move)', COMMA1 + ', ' + BOXS, 3, true);
  await dress('Alt H K + Alt H 9 ×2', '{sel:o.grid, keys:' + A2('h', 'k') + '}, {sel:o.grid, keys:[...' + A2('h', '9') + ', ...' + A2('h', '9') + ']}, ' + BOXS, 3, true);
  await dress('Ctrl+Shift+! + Alt H 9 ×2', '{sel:o.grid, keys:[{key:"!",ctrl:true,shift:true}]}, {sel:o.grid, keys:[...' + A2('h', '9') + ', ...' + A2('h', '9') + ']}, ' + BOXS, 3, true);
  await dress('Alt H A N (a DOLLAR format, not a comma)', '{sel:o.grid, keys:' + A2('h', 'a', 'n') + '}, ' + BOXS, 3, false);
  await dress('Alt H B S on the base case (1×1 → ball)', COMMA1 + ', ' + BOXS, 4, true);
  await dress('Alt H B A on the base case', COMMA1 + ', {sel:o.baseCell, keys:' + A2('h', 'b', 'a') + '}', 4, true);
  await dress('Alt H B T (thick box)', COMMA1 + ', {sel:o.baseCell, keys:' + A2('h', 'b', 't') + '}', 4, true);
  await dress('the four edges walked one at a time (B P/O/L/R)', COMMA1 +
    ', {sel:o.baseCell, keys:[...' + A2('h', 'b', 'p') + ', ...' + A2('h', 'b', 'o') + ', ...' + A2('h', 'b', 'l') + ', ...' + A2('h', 'b', 'r') + ']}', 4, true);
  await dress('an outside border around the WHOLE grid (the base case is not marked)', COMMA1 +
    ', {sel:o.grid, keys:' + A2('h', 'b', 's') + '}', 4, false);

  console.log('\n=== D · DE-NESTING (AUDIT_R417 §D #14: each ok stands alone given S) ===');
  r = await drive(`(C,o)=>{${HEAD} return [
    {sel:o.corner, keys:[...[...f(o,0,0)].map(ch=>({key:ch})), {key:"Enter"}]},
    {sel:o.corner, keys:[...R(4), ...D(2), {key:"d",ctrl:true}, {key:"r",ctrl:true}]},
    ${COMMA1}, ${BOXS},
    {sel:o.yc[4]+(o.gr0+2), keys:[{key:"Delete"}]} ]; }`);
  is(r.cores[0] && r.cores[1] && !r.cores[2] && r.cores[3] && r.cores[4],
    'clearing one cell of the lower block darkens beat 3 ALONE (beats 1, 2, 4, 5 unmoved)');
  r = await drive(`(C,o)=>{${HEAD} return [
    {sel:o.corner, keys:[...[...f(o,0,0)].map(ch=>({key:ch})), {key:"Enter"}]},
    {sel:o.corner, keys:[...R(4), ...D(2), {key:"d",ctrl:true}, {key:"r",ctrl:true}]},
    ${COMMA1}, ${BOXS},
    {sel:o.corner, keys:[{key:"Delete"}]} ]; }`);
  is(!r.cores[0] && r.cores[1] && r.cores[2],
    'clearing the corner darkens beat 1 ALONE (beats 2 and 3 unmoved)');

  console.log('\n=== E · ☆ HEADROOM, EACH HALF MEASURED APART (CAMPAIGN §2 + the r438 series rule) ===');
  const keysOnly = async (movesSrc) => (await page.evaluate((m) => {
    loadChallenge('dcfsens');
    const C = CHALLENGES.dcfsens, o = C._o;
    const moves = eval('(' + m + ')')(C, o);
    const before = keyLog.length;
    for (const mv of moves) { setDemoSel(mv.sel); for (const k of mv.keys) demoKey(k); }
    return keyLog.length - before;
  }, movesSrc));
  const acrossFill = await keysOnly(`(C,o)=>{${HEAD} return [
    {sel:o.corner, keys:[...[...f(o,0,0)].map(ch=>({key:ch})), {key:"Enter"}]},
    {sel:o.corner, keys:[...R(4), {key:"r",ctrl:true}]} ]; }`);
  const acrossType = await keysOnly(`(C,o)=>{${HEAD} const out=[{sel:o.corner, keys:[...[...f(o,0,0)].map(ch=>({key:ch})), {key:"Enter"}]}];
    for(let j=1;j<5;j++) out.push({sel:o.yc[j]+o.gr0, keys:[...[...f(o,0,j)].map(ch=>({key:ch})),{key:"Enter"}]});
    return out; }`);
  const downFill = await keysOnly(`(C,o)=>{${HEAD} return [
    {sel:o.corner, keys:[...[...f(o,0,0)].map(ch=>({key:ch})), {key:"Enter"}]},
    {sel:o.corner, keys:[...R(4), {key:"r",ctrl:true}]},
    {sel:o.corner, keys:[...R(4), ...D(2), {key:"d",ctrl:true}]} ]; }`);
  const downType = await keysOnly(`(C,o)=>{${HEAD} const out=[{sel:o.corner, keys:[...[...f(o,0,0)].map(ch=>({key:ch})), {key:"Enter"}]}];
    for(let j=1;j<5;j++) out.push({sel:o.yc[j]+o.gr0, keys:[...[...f(o,0,j)].map(ch=>({key:ch})),{key:"Enter"}]});
    for(let i=1;i<3;i++) for(let j=0;j<5;j++) out.push({sel:o.yc[j]+(o.gr0+i), keys:[...[...f(o,i,j)].map(ch=>({key:ch})),{key:"Enter"}]});
    return out; }`);
  const across = { fill: acrossFill, type: acrossType };
  const down = { fill: downFill - acrossFill, type: downType - acrossType };
  is(across.fill < across.type, 'ACROSS half: ' + across.fill + ' keys filled vs ' + across.type + ' typed out');
  is(down.fill < down.type, 'DOWN half: ' + down.fill + ' keys filled vs ' + down.type + ' typed out');
  console.log('  ..   neither half is negative — the ' + (across.type + down.type - across.fill - down.fill) +
    '-key gap is all fill-against-typing, which is neither the chord-vs-ribbon class §1.0(c) forces to clear nor the formatting class §1.0(d) forbids');

  // the slowest legal route that clears every core, and the fastest — the diagnostic's ratio
  const slow = await drive(`(C,o)=>{const A=(...ks)=>[{key:"Alt"},...ks.map(c=>({key:c,code:"Key"+c.toUpperCase()}))]; const out=[];
    for(let i=0;i<3;i++) for(let j=0;j<5;j++){
      const g="=$"+o.CB+"$"+o.rTfcf+"/("+o.yc[j]+"$"+o.hr+"-$"+o.CB+(o.gr0+i)+")";
      out.push({sel:o.yc[j]+(o.gr0+i), keys:[...[...g].map(ch=>({key:ch})),{key:"Enter"}]});
      out.push({sel:o.yc[j]+(o.gr0+i), keys:[...A("h","k")]});
      out.push({sel:o.yc[j]+(o.gr0+i), keys:[...A("h","9"),...A("h","9")]}); }
    out.push({sel:o.baseCell, keys:[...A("h","b","p"),...A("h","b","o"),...A("h","b","l"),...A("h","b","r")]});
    return out; }`);
  is(slow.won && !slow.star, 'the SLOWEST legal route (every cell typed, every cell commaed by hand, the box walked edge by edge): ' +
    slow.keys + ' keys, every core green, ☆ dark');
  const fast = R.taught.keys;
  console.log('  ..   spread = ' + (slow.keys / fast).toFixed(1) + '× (' + fast + ' → ' + slow.keys + ' keys) · ' +
    'far above the ~1.3× floor that retires a board (CAMPAIGN §2)');

  console.log('\n=== F · PAGE ERRORS ===');
  is(errs.length === 0, 'zero page errors across every route (' + (errs[0] || 'none') + ')');

  console.log('\n' + (fail ? 'FAIL ' : 'PASS ') + pass + ' assertions ok, ' + fail + ' failed');
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
