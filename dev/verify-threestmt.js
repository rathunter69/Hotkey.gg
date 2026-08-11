/* dev/verify-threestmt.js — the threestmt depth-pass probe (r448, DEPTH_PASS §4.82).
   Self-contained and single-drill by construction: it names NO other drill, so the C13
   retirement guard can never trip on it (WORKFLOW.md §9.1).

   It answers, by WALKING routes through the live engine rather than by reading predicates
   (DEPTH_PASS_CAMPAIGN §1 — every one of the thirteen untriggerable beats found so far was
   found this way, none by reading):

     §1  BOARD INTEGRITY — 20 rows, §1.3 win-state density, the model's own arithmetic
         (assets − liabs & equity = 0 in all three years once the three wires are in), the
         colour-provenance census (MODELING_STANDARDS §1) and the load-state figure widths.
     §2  ROUTE SWEEP — every Excel route that produces the visible end state, per beat, each
         one driven and graded (§1.0-R3(p): both routes must clear, or the beat is broken).
     §3  ☆ FAMILY BAKE-OFF — the wave-5 addendum measurement: fill vs multi-enter vs paste
         vs point-mode, keys on the IDENTICAL job, medians over SEEDS seeds.
     §4  ☆ SKIPPABILITY — the negative control (§1.0-R2(i)): a named slow route that clears
         every core with the star DARK, with its key count.
     §5  ENGINE FACTS this board depends on — including the Ctrl+Shift+→ overshoot that rules
         the structured-selection ☆ family out on a board whose year strip loads empty.
     §6  ANATOMY — tri-length (§1.9), exactly one bonus (§2.2), the saveClose declaration.

   Mirrors the real harness init (hotkey_onboarded / hk_tour_done / hk_learn_done /
   hk_handle_cache) — a probe that does not is a lie.
   Run:  URL=http://127.0.0.1:8791/index.html node dev/verify-threestmt.js            */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const HK_URL = process.env.URL || 'http://127.0.0.1:8791/index.html';
const SEEDS = parseInt(process.env.SEEDS || '5', 10);

let fails = 0;
const ok = m => console.log('  ok   ' + m);
const bad = m => { fails++; console.log('  FAIL ' + m); };

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 200)));
  await page.addInitScript(() => {
    try {
      localStorage.setItem('hotkey_onboarded', '1');
      localStorage.setItem('hk_tour_done', '1');
      localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_gate_off', '1');
      localStorage.setItem('hk_handle_cache', '');
    } catch (e) {}
  });
  await page.goto(HK_URL, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof loadChallenge === 'function'
    && typeof demoKey === 'function' && typeof setDemoSel === 'function', null, { timeout: 20000 });
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });   // r158: progression gates never bounce a locked-tier load

  /* the page-side driver: run a list of demo-shaped moves on a fresh build and report
     the checklist, the keys paid, and anything the caller asked to read off the board. */
  await page.evaluate(() => {
    window.__ts = {
      run(src, opts) {
        opts = opts || {};
        loadChallenge('threestmt');
        const C = CHALLENGES.threestmt, o = C._o;
        const moves = eval('(' + src + ')')(C, o);
        keyLog.length = 0;
        for (const m of moves) { setDemoSel(m.sel); for (const k of m.keys) demoKey(k); }
        const cs = C.checks(S);
        return {
          keys: keyLog.length,
          labels: cs.map(c => c.label),
          okv: cs.map(c => !!c.ok),
          cores: cs.filter(c => !c.bonus && !c.save).every(c => !!c.ok),
          star: !!(cs.find(c => c.bonus) || {}).ok,
          o: opts.wantO ? JSON.parse(JSON.stringify(o)) : null,
          probe: opts.probe ? eval('(' + opts.probe + ')')(S, o) : null,
        };
      },
    };
  });

  const run = (src, opts) => page.evaluate(([s, o]) => window.__ts.run(s, o), [src, opts || {}]);
  const median = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];

  /* the taught route, as a source string every section below reuses */
  const FILL = `(C,o)=>{const R={key:'ArrowRight',shift:true};return [
    {sel:o.Y0+o.rCni, keys:[...T('='+o.Y0+o.rNi), Kb.enter]},
    {sel:o.Y0+o.rCni, keys:[R,R, Kb.fillR]},
    {sel:o.Y0+o.rCash, keys:[...T('='+o.Y0+o.rEcash), Kb.enter]},
    {sel:o.Y0+o.rCash, keys:[R,R, Kb.fillR]},
    {sel:o.Y1+o.rRe, keys:[...T('='+o.Y0+o.rRe+'+'+o.Y1+o.rNi), Kb.enter]},
    {sel:o.Y1+o.rRe, keys:[R, Kb.fillR]},
    {sel:o.Y0+o.rChk, keys:[...T('='+o.Y0+o.rTa+'-'+o.Y0+o.rTle), Kb.enter]},
    {sel:o.Y0+o.rChk, keys:[R,R, Kb.fillR]},
    {sel:o.CA+o.rChk, keys:[R,R,R, Kb.bold, Kb.alt, L('h'), L('b'), L('p')]},
  ];}`;

  console.log('\n== §1 BOARD INTEGRITY (§1.3 · MODELING_STANDARDS §1/§4/§6) ==');
  {
    const probe = `(S,o)=>{
      const rows=new Set(); for(const k in S.cells){ const c=S.cells[k];
        if(c && (c.value!==null && c.value!=='' || c.formula)) rows.add(parseInt(k.replace(/[A-J]/,''),10)); }
      const tie=o.cols.map((c,i)=>({ta:S.cells[c+o.rTa].value, tle:S.cells[c+o.rTle].value, chk:S.cells[c+o.rChk].value}));
      let blue=0, black=0, badBlue=0;
      for(const k in S.cells){ const c=S.cells[k]; if(!c || c.txt || (c.value===null&&!c.formula)) continue;
        if(c.fontColor==='blue'){ blue++; if(c.formula) badBlue++; } else if(!c.fontColor){ black++; } }
      return {ROWS:S.ROWS, filled:[...rows].sort((a,b)=>a-b), tie:tie, blue:blue, black:black, blueWithFormula:badBlue,
              ecashIsSum:/SUM/i.test(String(S.cells[o.Y0+o.rEcash].formula||'')),
              bcashLinks:o.cols.slice(1).every((c,i)=>String(S.cells[c+o.rBcash].formula||'').includes(o.cols[i]+o.rEcash)),
              ppeRolls:o.cols.slice(1).every((c,i)=>String(S.cells[c+o.rPpe].formula||'').includes(o.cols[i]+o.rPpe)),
              totalsRuled:[o.rNi,o.rEcash,o.rTa,o.rTle].every(r=>o.cols.every(c=>S.cells[c+r].bt&&!S.cells[c+r].bb)) };
    }`;
    const r = await run(FILL, { probe, wantO: true });
    if (r.probe.ROWS === 20) ok('ROWS = 20 (§1.3 floor AND cap; no ROWS:14 inheritance)');
    else bad('ROWS = ' + r.probe.ROWS + ', expected 20');
    const dens = r.probe.filled.length;
    if (dens >= 12) ok(`win-state density ${dens}/20 rows carry content (${Math.round(dens / 20 * 100)}%) — §1.3 target ≥60%`);
    else bad(`win-state density ${dens}/20 (${Math.round(dens / 20 * 100)}%) — under the §1.3 60% target`);
    const tied = r.probe.tie.every(t => Math.abs(t.ta - t.tle) < 0.5 && Math.abs(t.chk) < 0.5);
    if (tied) ok('the model TIES: assets − liabs & equity = 0 in all three years (MODELING_STANDARDS §6)');
    else bad('the model does not tie: ' + JSON.stringify(r.probe.tie));
    if (r.probe.blueWithFormula === 0) ok(`colour provenance clean: ${r.probe.blue} blue inputs, ${r.probe.black} black formulas, no blue cell carrying a formula (MODELING_STANDARDS §1)`);
    else bad(r.probe.blueWithFormula + ' blue cell(s) carry a formula — blue means a typed hardcode');
    if (r.probe.bcashLinks) ok('the cash corkscrew REFERENCES the prior close, never repeats it (MODELING_STANDARDS §3)');
    else bad('a beginning-cash cell does not point at the prior ending cash');
    if (r.probe.ppeRolls) ok('PP&E rolls off its own prior balance — capex and D&A are what move it (MODELING_STANDARDS §3/§4)');
    else bad('the PP&E line does not roll');
    if (r.probe.totalsRuled) ok('every total row wears a TOP border and no rule underneath (§1.0(f) / MODELING_STANDARDS §1)');
    else bad('a total row is missing its top border, or carries a bottom one');
  }

  console.log('\n== §2 ROUTE SWEEP — every route to the visible end state must clear (§1.0-R3(p)) ==');
  {
    const ROUTES = {
      'WIRE 1 SUM-wrapped, WIRE 2 with a leading + (both relative, both filled)': `(C,o)=>{const R={key:'ArrowRight',shift:true};return [
        {sel:o.Y0+o.rCni, keys:[...T('=SUM('+o.Y0+o.rNi+')'), Kb.enter]},
        {sel:o.Y0+o.rCni, keys:[R,R, Kb.fillR]},
        {sel:o.Y0+o.rCash, keys:[...T('=+'+o.Y0+o.rEcash), Kb.enter]},
        {sel:o.Y0+o.rCash, keys:[R,R, Kb.fillR]},
        {sel:o.Y1+o.rRe, keys:[...T('='+o.Y0+o.rRe+'+'+o.Y1+o.rNi), Kb.enter]},
        {sel:o.Y1+o.rRe, keys:[R, Kb.fillR]},
        {sel:o.Y0+o.rChk, keys:[...T('='+o.Y0+o.rTa+'-'+o.Y0+o.rTle), Kb.enter]},
        {sel:o.Y0+o.rChk, keys:[R,R, Kb.fillR]},
        {sel:o.CA+o.rChk, keys:[R,R,R, Kb.bold, Kb.alt, L('h'), L('b'), L('p')]},
      ];}`,
      'every ref $-ANCHORED to its own year, typed column by column, no fill (the ☆ goes dark, all five cores clear)': `(C,o)=>{const R={key:'ArrowRight',shift:true};const mv=[];
        o.cols.forEach(c=>mv.push({sel:c+o.rCni, keys:[...T('=$'+c+'$'+o.rNi), Kb.enter]}));
        o.cols.forEach(c=>mv.push({sel:c+o.rCash, keys:[...T('=$'+c+'$'+o.rEcash), Kb.enter]}));
        [1,2].forEach(i=>mv.push({sel:o.cols[i]+o.rRe, keys:[...T('=$'+o.cols[i-1]+'$'+o.rRe+'+$'+o.cols[i]+'$'+o.rNi), Kb.enter]}));
        o.cols.forEach(c=>mv.push({sel:c+o.rChk, keys:[...T('=$'+c+'$'+o.rTa+'-$'+c+'$'+o.rTle), Kb.enter]}));
        mv.push({sel:o.CA+o.rChk, keys:[R,R,R, Kb.bold, Kb.alt, L('h'), L('b'), L('p')]});
        return mv;}`,
      'the RE roll read off the CASH FLOW net income instead of the statement line': `(C,o)=>{const R={key:'ArrowRight',shift:true};return [
        {sel:o.Y0+o.rCni, keys:[...T('='+o.Y0+o.rNi), Kb.enter]},
        {sel:o.Y0+o.rCni, keys:[R,R, Kb.fillR]},
        {sel:o.Y0+o.rCash, keys:[...T('='+o.Y0+o.rEcash), Kb.enter]},
        {sel:o.Y0+o.rCash, keys:[R,R, Kb.fillR]},
        {sel:o.Y1+o.rRe, keys:[...T('='+o.Y1+o.rCni+'+'+o.Y0+o.rRe), Kb.enter]},
        {sel:o.Y1+o.rRe, keys:[R, Kb.fillR]},
        {sel:o.Y0+o.rChk, keys:[...T('='+o.Y0+o.rTa+'-'+o.Y0+o.rTle), Kb.enter]},
        {sel:o.Y0+o.rChk, keys:[R,R, Kb.fillR]},
        {sel:o.CA+o.rChk, keys:[R,R,R, Kb.bold, Kb.alt, L('h'), L('b'), L('p')]},
      ];}`,
      'the check written the OTHER way round and negated, every ref $-anchored': `(C,o)=>{const R={key:'ArrowRight',shift:true};const mv=[
        {sel:o.Y0+o.rCni, keys:[...T('='+o.Y0+o.rNi), Kb.enter]},
        {sel:o.Y0+o.rCni, keys:[R,R, Kb.fillR]},
        {sel:o.Y0+o.rCash, keys:[...T('='+o.Y0+o.rEcash), Kb.enter]},
        {sel:o.Y0+o.rCash, keys:[R,R, Kb.fillR]},
        {sel:o.Y1+o.rRe, keys:[...T('='+o.Y0+o.rRe+'+'+o.Y1+o.rNi), Kb.enter]},
        {sel:o.Y1+o.rRe, keys:[R, Kb.fillR]}];
        o.cols.forEach(c=>mv.push({sel:c+o.rChk, keys:[...T('=-($'+c+'$'+o.rTle+'-$'+c+'$'+o.rTa+')'), Kb.enter]}));
        mv.push({sel:o.CA+o.rChk, keys:[R,R,R, Kb.bold, Kb.alt, L('h'), L('b'), L('p')]});
        return mv;}`,
      'the check DECOMPOSED — total assets less payables less retained earnings': `(C,o)=>{const R={key:'ArrowRight',shift:true};return [
        {sel:o.Y0+o.rCni, keys:[...T('='+o.Y0+o.rNi), Kb.enter]},
        {sel:o.Y0+o.rCni, keys:[R,R, Kb.fillR]},
        {sel:o.Y0+o.rCash, keys:[...T('='+o.Y0+o.rEcash), Kb.enter]},
        {sel:o.Y0+o.rCash, keys:[R,R, Kb.fillR]},
        {sel:o.Y1+o.rRe, keys:[...T('='+o.Y0+o.rRe+'+'+o.Y1+o.rNi), Kb.enter]},
        {sel:o.Y1+o.rRe, keys:[R, Kb.fillR]},
        {sel:o.Y0+o.rChk, keys:[...T('='+o.Y0+o.rTa+'-'+o.Y0+o.rPay+'-'+o.Y0+o.rRe), Kb.enter]},
        {sel:o.Y0+o.rChk, keys:[R,R, Kb.fillR]},
        {sel:o.CA+o.rChk, keys:[R,R,R, Kb.bold, Kb.alt, L('h'), L('b'), L('p')]},
      ];}`,
      'every dress by ribbon: Alt H 1 for bold, Alt H B A for all borders': `(C,o)=>{const R={key:'ArrowRight',shift:true};return [
        {sel:o.Y0+o.rCni, keys:[...T('='+o.Y0+o.rNi), Kb.enter]},
        {sel:o.Y0+o.rCni, keys:[R,R, Kb.fillR]},
        {sel:o.Y0+o.rCash, keys:[...T('='+o.Y0+o.rEcash), Kb.enter]},
        {sel:o.Y0+o.rCash, keys:[R,R, Kb.fillR]},
        {sel:o.Y1+o.rRe, keys:[...T('='+o.Y0+o.rRe+'+'+o.Y1+o.rNi), Kb.enter]},
        {sel:o.Y1+o.rRe, keys:[R, Kb.fillR]},
        {sel:o.Y0+o.rChk, keys:[...T('='+o.Y0+o.rTa+'-'+o.Y0+o.rTle), Kb.enter]},
        {sel:o.Y0+o.rChk, keys:[R,R, Kb.fillR]},
        {sel:o.Y0+o.rChk, keys:[R,R, Kb.alt, L('h'), D(1), Kb.alt, L('h'), L('b'), L('a')]},
      ];}`,
      'the dress by Alt H B S (outside border on the row) — the ball route': `(C,o)=>{const R={key:'ArrowRight',shift:true};return [
        {sel:o.Y0+o.rCni, keys:[...T('='+o.Y0+o.rNi), Kb.enter]},
        {sel:o.Y0+o.rCni, keys:[R,R, Kb.fillR]},
        {sel:o.Y0+o.rCash, keys:[...T('='+o.Y0+o.rEcash), Kb.enter]},
        {sel:o.Y0+o.rCash, keys:[R,R, Kb.fillR]},
        {sel:o.Y1+o.rRe, keys:[...T('='+o.Y0+o.rRe+'+'+o.Y1+o.rNi), Kb.enter]},
        {sel:o.Y1+o.rRe, keys:[R, Kb.fillR]},
        {sel:o.Y0+o.rChk, keys:[...T('='+o.Y0+o.rTa+'-'+o.Y0+o.rTle), Kb.enter]},
        {sel:o.Y0+o.rChk, keys:[R,R, Kb.fillR]},
        {sel:o.CA+o.rChk, keys:[R,R,R, Kb.bold, Kb.alt, L('h'), L('b'), L('s')]},
      ];}`,
      'op ORDER reversed — balance sheet first, the cash flow wire last': `(C,o)=>{const R={key:'ArrowRight',shift:true};return [
        {sel:o.Y1+o.rRe, keys:[...T('='+o.Y0+o.rRe+'+'+o.Y1+o.rNi), Kb.enter]},
        {sel:o.Y1+o.rRe, keys:[R, Kb.fillR]},
        {sel:o.Y0+o.rChk, keys:[...T('='+o.Y0+o.rTa+'-'+o.Y0+o.rTle), Kb.enter]},
        {sel:o.Y0+o.rChk, keys:[R,R, Kb.fillR]},
        {sel:o.CA+o.rChk, keys:[R,R,R, Kb.bold, Kb.alt, L('h'), L('b'), L('p')]},
        {sel:o.Y0+o.rCash, keys:[...T('='+o.Y0+o.rEcash), Kb.enter]},
        {sel:o.Y0+o.rCash, keys:[R,R, Kb.fillR]},
        {sel:o.Y0+o.rCni, keys:[...T('='+o.Y0+o.rNi), Kb.enter]},
        {sel:o.Y0+o.rCni, keys:[R,R, Kb.fillR]},
      ];}`,
      'every line committed with Ctrl+Enter into the whole year strip': `(C,o)=>{const R={key:'ArrowRight',shift:true};const CE={key:'Enter',ctrl:true};return [
        {sel:o.Y0+o.rCni, keys:[R,R, ...T('='+o.Y0+o.rNi), CE]},
        {sel:o.Y0+o.rCash, keys:[R,R, ...T('='+o.Y0+o.rEcash), CE]},
        {sel:o.Y1+o.rRe, keys:[R, ...T('='+o.Y0+o.rRe+'+'+o.Y1+o.rNi), CE]},
        {sel:o.Y0+o.rChk, keys:[R,R, ...T('='+o.Y0+o.rTa+'-'+o.Y0+o.rTle), CE]},
        {sel:o.CA+o.rChk, keys:[R,R,R, Kb.bold, Kb.alt, L('h'), L('b'), L('p')]},
      ];}`,
      'ribbon fills throughout (Alt H F I R)': `(C,o)=>{const R={key:'ArrowRight',shift:true};const FR=[Kb.alt,L('h'),L('f'),L('i'),L('r')];return [
        {sel:o.Y0+o.rCni, keys:[...T('='+o.Y0+o.rNi), Kb.enter]},
        {sel:o.Y0+o.rCni, keys:[R,R, ...FR]},
        {sel:o.Y0+o.rCash, keys:[...T('='+o.Y0+o.rEcash), Kb.enter]},
        {sel:o.Y0+o.rCash, keys:[R,R, ...FR]},
        {sel:o.Y1+o.rRe, keys:[...T('='+o.Y0+o.rRe+'+'+o.Y1+o.rNi), Kb.enter]},
        {sel:o.Y1+o.rRe, keys:[R, ...FR]},
        {sel:o.Y0+o.rChk, keys:[...T('='+o.Y0+o.rTa+'-'+o.Y0+o.rTle), Kb.enter]},
        {sel:o.Y0+o.rChk, keys:[R,R, ...FR]},
        {sel:o.CA+o.rChk, keys:[R,R,R, Kb.bold, Kb.alt, L('h'), L('b'), L('p')]},
      ];}`,
    };
    for (const [name, src] of Object.entries(ROUTES)) {
      let allCores = true, keys = 0;
      for (let s = 0; s < 3; s++) { const r = await run(src); allCores = allCores && r.cores; keys = r.keys; }
      if (allCores) ok(`all five cores clear — ${name} (${keys} keys)`);
      else bad(`a core beat stayed DARK on a legal route — ${name}`);
    }
    /* the one route that must NOT clear: a typed constant is not a link (doctrine §2.2's
       sanctioned "don't hardcode the answer" case, and the whole point of this drill). */
    const HARD = `(C,o)=>{const R={key:'ArrowRight',shift:true};const mv=[];
      o.cols.forEach((c,i)=>mv.push({sel:c+o.rCni, keys:[...T(String(o.ni[i])), Kb.enter]}));
      o.cols.forEach((c,i)=>mv.push({sel:c+o.rCash, keys:[...T(String(o.ecash[i])), Kb.enter]}));
      [1,2].forEach(i=>mv.push({sel:o.cols[i]+o.rRe, keys:[...T(String(o.re[i])), Kb.enter]}));
      mv.push({sel:o.Y0+o.rChk, keys:[...T('='+o.Y0+o.rTa+'-'+o.Y0+o.rTle), Kb.enter]});
      mv.push({sel:o.Y0+o.rChk, keys:[R,R, Kb.fillR]});
      mv.push({sel:o.CA+o.rChk, keys:[R,R,R, Kb.bold, Kb.alt, L('h'), L('b'), L('p')]});
      return mv;}`;
    const h = await run(HARD);
    if (!h.okv[0] && !h.okv[1] && !h.okv[2] && h.okv[3] && h.okv[4])
      ok('typed constants do NOT clear the three link beats, while the check and the dress still do — the links are graded as links');
    else bad('the hardcode control graded ' + JSON.stringify(h.okv) + ' — expected the three link beats dark and the last two green');
  }

  console.log('\n== §3 ☆ FAMILY BAKE-OFF (wave-5 addendum) — keys on the IDENTICAL job ==');
  const FAM = {
    'one-pass · Ctrl+R fill': FILL,
    'one-pass · Ctrl+Enter commit': `(C,o)=>{const R={key:'ArrowRight',shift:true};const CE={key:'Enter',ctrl:true};return [
      {sel:o.Y0+o.rCni, keys:[R,R, ...T('='+o.Y0+o.rNi), CE]},
      {sel:o.Y0+o.rCash, keys:[R,R, ...T('='+o.Y0+o.rEcash), CE]},
      {sel:o.Y1+o.rRe, keys:[R, ...T('='+o.Y0+o.rRe+'+'+o.Y1+o.rNi), CE]},
      {sel:o.Y0+o.rChk, keys:[R,R, ...T('='+o.Y0+o.rTa+'-'+o.Y0+o.rTle), CE]},
      {sel:o.CA+o.rChk, keys:[R,R,R, Kb.bold, Kb.alt, L('h'), L('b'), L('p')]},
    ];}`,
    'clipboard clone · copy the built cell onto the rest': `(C,o)=>{const R={key:'ArrowRight',shift:true};return [
      {sel:o.Y0+o.rCni, keys:[...T('='+o.Y0+o.rNi), Kb.enter]},
      {sel:o.Y0+o.rCni, keys:[Kb.copy]},
      {sel:o.Y1+o.rCni, keys:[R, Kb.paste]},
      {sel:o.Y0+o.rCash, keys:[...T('='+o.Y0+o.rEcash), Kb.enter]},
      {sel:o.Y0+o.rCash, keys:[Kb.copy]},
      {sel:o.Y1+o.rCash, keys:[R, Kb.paste]},
      {sel:o.Y1+o.rRe, keys:[...T('='+o.Y0+o.rRe+'+'+o.Y1+o.rNi), Kb.enter]},
      {sel:o.Y1+o.rRe, keys:[Kb.copy]},
      {sel:o.Y2+o.rRe, keys:[Kb.paste]},
      {sel:o.Y0+o.rChk, keys:[...T('='+o.Y0+o.rTa+'-'+o.Y0+o.rTle), Kb.enter]},
      {sel:o.Y0+o.rChk, keys:[Kb.copy]},
      {sel:o.Y1+o.rChk, keys:[R, Kb.paste]},
      {sel:o.CA+o.rChk, keys:[R,R,R, Kb.bold, Kb.alt, L('h'), L('b'), L('p')]},
    ];}`,
    'point mode · arrow to the reference instead of typing it': `(C,o)=>{const R={key:'ArrowRight',shift:true};
      const up=n=>{const a=[];for(let i=0;i<n;i++)a.push({key:'ArrowUp'});return a;};
      return [
      {sel:o.Y0+o.rCni, keys:[{key:'='}, ...up(o.rCni-o.rNi), Kb.enter]},
      {sel:o.Y0+o.rCni, keys:[R,R, Kb.fillR]},
      {sel:o.Y0+o.rCash, keys:[{key:'='}, ...up(o.rCash-o.rEcash), Kb.enter]},
      {sel:o.Y0+o.rCash, keys:[R,R, Kb.fillR]},
      {sel:o.Y1+o.rRe, keys:[...T('='+o.Y0+o.rRe+'+'+o.Y1+o.rNi), Kb.enter]},
      {sel:o.Y1+o.rRe, keys:[R, Kb.fillR]},
      {sel:o.Y0+o.rChk, keys:[{key:'='}, ...up(o.rChk-o.rTa), {key:'-'}, ...up(o.rChk-o.rTle), Kb.enter]},
      {sel:o.Y0+o.rChk, keys:[R,R, Kb.fillR]},
      {sel:o.CA+o.rChk, keys:[R,R,R, Kb.bold, Kb.alt, L('h'), L('b'), L('p')]},
    ];}`,
  };
  const famKeys = {};
  for (const [name, src] of Object.entries(FAM)) {
    const runs = [];
    let cores = true, star = true;
    for (let s = 0; s < SEEDS; s++) { const r = await run(src); runs.push(r.keys); cores = cores && r.cores; star = star && r.star; }
    famKeys[name] = median(runs);
    console.log(`  ${String(median(runs)).padStart(4)} keys · ${name}${cores ? '' : '  [CORES DARK]'}${star ? '  [☆]' : '  [☆ dark]'}`);
    if (!cores) bad(`${name} left a core beat dark`);
  }

  console.log('\n== §4 ☆ SKIPPABILITY — the negative control (§1.0-R2(i), measured not asserted) ==');
  {
    const SLOW = `(C,o)=>{const mv=[];
      o.cols.forEach(c=>mv.push({sel:c+o.rCni, keys:[...T('='+c+o.rNi), Kb.enter]}));
      o.cols.forEach(c=>mv.push({sel:c+o.rCash, keys:[...T('='+c+o.rEcash), Kb.enter]}));
      [1,2].forEach(i=>mv.push({sel:o.cols[i]+o.rRe, keys:[...T('='+o.cols[i-1]+o.rRe+'+'+o.cols[i]+o.rNi), Kb.enter]}));
      o.cols.forEach(c=>mv.push({sel:c+o.rChk, keys:[...T('='+c+o.rTa+'-'+c+o.rTle), Kb.enter]}));
      o.cols.forEach(c=>mv.push({sel:c+o.rChk, keys:[Kb.bold, Kb.alt, L('h'), L('b'), L('p')]}));
      return mv;}`;
    const runs = [];
    let cores = true, star = false;
    for (let s = 0; s < SEEDS; s++) { const r = await run(SLOW); runs.push(r.keys); cores = cores && r.cores; star = star || r.star; }
    const slow = median(runs);
    if (cores && !star) ok(`the retype control clears every core with the ☆ DARK — ${slow} keys against ${famKeys['one-pass · Ctrl+R fill']} (fill) / ${famKeys['one-pass · Ctrl+Enter commit']} (ctrl+↵): a ${slow - famKeys['one-pass · Ctrl+Enter commit']}–${slow - famKeys['one-pass · Ctrl+R fill']}-key discovery, and skippable`);
    else bad(`the ☆ is not skippable as designed: cores=${cores} star=${star}`);
    console.log(`  spread (slowest legal ÷ fastest legal): ${(slow / famKeys['one-pass · Ctrl+Enter commit']).toFixed(2)}×`);
  }

  console.log('\n== §5 ENGINE FACTS this board depends on ==');
  {
    const probe = `(S,o)=>({active:S.active, sel:S.sel})`;
    const CSR = `(C,o)=>[
      {sel:o.Y0+o.rCni, keys:[...T('='+o.Y0+o.rNi), Kb.enter]},
      {sel:o.Y0+o.rCni, keys:[{key:'ArrowRight',ctrl:true,shift:true}]},
    ]`;
    const r = await run(CSR, { probe, wantO: true });
    const far = r.probe.active.c > r.o.c0 + 3 || r.probe.sel.c > r.o.c0 + 3;
    if (far) ok(`Ctrl+Shift+→ OVERSHOOTS the year strip (lands at column ${Math.max(r.probe.active.c, r.probe.sel.c)}, the strip ends at ${r.o.c0 + 3}) — the year cells beside a freshly built one are still EMPTY, so the structured-selection ☆ family is not available on this board`);
    else bad('Ctrl+Shift+→ stopped inside the strip — re-run the ☆ family bake-off, structured selection is back on the table');

    const BALL = `(C,o)=>{const R={key:'ArrowRight',shift:true};return [
      {sel:o.Y0+o.rChk, keys:[...T('='+o.Y0+o.rTa+'-'+o.Y0+o.rTle), Kb.enter]},
      {sel:o.Y0+o.rChk, keys:[R,R, Kb.fillR]},
      {sel:o.Y0+o.rChk, keys:[R,R, Kb.alt, L('h'), L('b'), L('s')]},
    ];}`;
    const b = await run(BALL, { probe: `(S,o)=>o.cols.map(c=>({bt:!!S.cells[c+o.rChk].bt, ball:!!S.cells[c+o.rChk].ball, bb:!!S.cells[c+o.rChk].bb}))` });
    console.log('  Alt H B S on the three-cell check row stores: ' + JSON.stringify(b.probe));
    if (b.probe.every(x => x.bt || x.ball)) ok('the lenient border reading (bt || ball) is what keeps that route from stranding — declared in the drill header and in payload §8');
    else bad('Alt H B S left a check cell with neither bt nor ball — the border beat would strand');
  }

  console.log('\n== §6 ANATOMY (§1.9 tri-length · §2.2 one bonus · §1.0(e) saveClose) ==');
  {
    const a = await page.evaluate(() => {
      loadChallenge('threestmt');
      const C = CHALLENGES.threestmt;
      const g = (typeof C.guide === 'function' ? C.guide.call(C) : C.guide) || [];
      const t = (typeof C.targets === 'function' ? C.targets.call(C) : C.targets) || [];
      const cs = C.checks(S);
      const d = (typeof C.demo === 'function' ? C.demo.call(C) : C.demo) || [];
      return { g: g.length, t: t.length, c: cs.length, bonus: cs.filter(x => x.bonus).length,
               save: cs.filter(x => x.save).length, saveClose: !!C.saveClose, demo: d.length,
               labels: cs.map(x => x.label) };
    });
    if (a.g === a.c && a.t === a.c) ok(`tri-length holds: guide = checks = targets = ${a.c} (the engine-appended save beat included)`);
    else bad(`tri-length broken: guide=${a.g} checks=${a.c} targets=${a.t}`);
    if (a.bonus === 1) ok('exactly one bonus:true beat');
    else bad(`${a.bonus} bonus beats, expected 1`);
    if (a.saveClose && a.save === 1) ok('saveClose declared and the engine appended exactly one save beat');
    else bad(`saveClose=${a.saveClose}, save beats=${a.save}`);
    const VERBS = ['Add','Autofit','Bold','Build','Center','Clear','Collect','Color','Comma-format','Copy','Cut','Delete','Dollar-format','Enter','Fill','Filter','Find','Finish','Fix','Flip','Fold','Group','Indent','Insert','Italicize','Left-align','Move','Paste','Percent-format','Reference','Repoint','Save','Select','Set','Sort','Total','Trace','Transpose','Unbold','Underline','Undo','Unhide','Unfold','Wrap'];
    const off = a.labels.filter(l => !VERBS.includes(String(l).split(' ')[0]));
    if (!off.length) ok('every check label opens with a §1.7 closed-list verb');
    else bad('check label(s) outside the closed verb list: ' + JSON.stringify(off));
  }

  if (errs.length) { console.log('\nPAGE ERRORS: ' + JSON.stringify(errs.slice(0, 5))); fails += errs.length; }
  console.log('\n' + (fails ? `verify-threestmt: ${fails} FAILURE(S)` : 'verify-threestmt: ALL GREEN'));
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
