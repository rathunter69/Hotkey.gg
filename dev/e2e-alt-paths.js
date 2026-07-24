/* r169 ALT-PATH AUDIT — the anti-railroad harness.
   The demo replay proves the SCRIPTED solution wins; this proves drills accept
   the OTHER legitimate routes Excel offers: ribbon walks vs Ctrl chords, dialog
   routes (Alt H V S vs Alt E S V), typed refs vs F4 cycling vs pointer mode,
   and — because checks grade END STATE — different op orders entirely.

   House rule (Wolf, T9): drills must be solvable "as users figure out the best
   pathways". Any alt that fails here is either a check overfit to one chord
   (fix the check) or a genuinely missing engine route (fix the engine or the
   prompt). Every rebuilt/new drill should land an entry in ALTS.

   Each entry: { key, name, moves } — moves is a page-side function source,
   receives the live C (challenge) after loadChallenge, returns demo-style
   moves. Runs REPS seeds per alt (drills randomize).
   Run: node dev/e2e-alt-paths.js [drill ...]   (server on 127.0.0.1:8791) */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const REPS = 3;
const only = process.argv.slice(2);

const ALTS = [
  { key: 'rowops', name: 'ctrl chords for insert/delete (shift+space rows), dress BEFORE the junk dies, border via Alt H B D', moves: `C => { const o=C._o;
      const pr=o.predRow0, jr=o.junkRow0, insAt=pr+1;
      const jr2=jr+(jr>=insAt?1:0);       // the insert shifts the junk down if it sat below
      return [
        {sel:'A'+insAt, keys:[{key:' ',shift:true},{key:'=',ctrl:true,shift:true}]},
        {sel:o.stagedRng, keys:[{key:'c',ctrl:true}]},
        {sel:'A'+insAt, keys:[{key:'v',ctrl:true}]},
        {sel:'B'+insAt, keys:[{key:'Alt'},L('h'),L('k'),{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
        {sel:'A'+jr2, keys:[{key:' ',shift:true},{key:'-',ctrl:true}]},
        {sel:'A'+o.totRow0+':B'+o.totRow0, keys:[{key:'Alt'},L('h'),L('b'),L('d')]},   // top-and-bottom route — bb lands the same
      ]; }` },
  { key: 'rowops', name: 'border FIRST (it rides the row through the ops), ribbon insert/delete, comma via ctrl+shift+1', moves: `C => { const o=C._o;
      const pr=o.predRow0, jr=o.junkRow0, insAt=pr+1;
      const jr2=jr+(jr>=insAt?1:0);
      const insAt2=insAt-(jr2<insAt?1:0);
      return [
        {sel:'A'+o.totRow0+':B'+o.totRow0, keys:[{key:'Alt'},L('h'),L('b'),L('o')]},   // close the schedule before touching a single row
        {sel:'A'+insAt, keys:[{key:' ',shift:true},{key:'Alt'},L('h'),L('i'),L('r')]},
        {sel:o.stagedRng, keys:[{key:'c',ctrl:true}]},
        {sel:'A'+insAt, keys:[{key:'v',ctrl:true}]},
        {sel:'A'+jr2, keys:[{key:' ',shift:true},{key:'Alt'},L('h'),L('d'),L('r')]},
        {sel:'B'+insAt2, keys:[{key:'!',ctrl:true,shift:true},{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
      ]; }` },
  { key: 'blocksel', name: 'CUT first / COPY last, margin via typed refs, dress via RIBBON variants (Alt H 1/2/K/P) + box before bold', moves: `C => { const O=C._o; return [
      {sel:O.ebTL,       keys:[{key:'ArrowDown',ctrl:true,shift:true},{key:'x',ctrl:true}]},        // CUT EBITDA first
      {sel:O.o.ebitda[0],keys:[{key:'v',ctrl:true}]},
      {sel:O.opTL,       keys:[{key:'ArrowDown',ctrl:true,shift:true},{key:'x',ctrl:true}]},        // CUT Op inc
      {sel:O.o.opinc[0], keys:[{key:'v',ctrl:true}]},
      {sel:O.baseTL,     keys:[{key:'ArrowRight',ctrl:true,shift:true},{key:'ArrowDown',ctrl:true,shift:true},{key:'c',ctrl:true}]}, // COPY base last
      {sel:O.o.seg[0],   keys:[{key:'v',ctrl:true}]},
      {sel:O.o.margin[0],keys:[...T('='+O.marginF),{key:'Enter'}]},                                 // margin via typed ref
      {sel:O.marginRng,  keys:[{key:'d',ctrl:true}]},
      {sel:O.marginRng,  keys:[{key:'Alt'},L('h'),L('p'),{key:'Alt'},L('h'),D(2)]},                 // percent + italic via RIBBON (Alt H P, Alt H 2)
      {sel:O.tableRng,   keys:[{key:'Alt'},L('h'),L('b'),L('s')]},                                  // outline BEFORE bold (r292: Outside Borders, not All)
      {sel:O.hdrRng,     keys:[{key:'Alt'},L('h'),D(1)]},                                            // bold header via ribbon (Alt H 1)
      {sel:O.topRowRng,  keys:[{key:'$',ctrl:true,shift:true},{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},   // top line $ 0-dec
      {sel:O.restRng,    keys:[{key:'Alt'},L('h'),L('k'),{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},        // rest commas via Alt H K + trim
      {sel:O.labelRng,   keys:[{key:'Alt'},L('h'),L('a'),L('c'),{key:'Alt'},L('h'),D(3)]},          // ☆ centre + underline via ribbon (Alt H 3) — before the final core beat
      {sel:O.figRng,     keys:[{key:'Alt'},L('h'),L('a'),L('r')]},                                  // final core — win fires here
    ]; }` },
  { key: 'blocksel', name: 'Op inc cut before EBITDA, margin in POINTER MODE, ribbon fill down, dress walked backwards (align → money → bold → box)', moves: `C => { const O=C._o; return [
      {sel:O.baseTL,     keys:[{key:'ArrowRight',ctrl:true,shift:true},{key:'ArrowDown',ctrl:true,shift:true},{key:'c',ctrl:true}]}, // COPY base first (canonical)
      {sel:O.o.seg[0],   keys:[{key:'v',ctrl:true}]},
      {sel:O.opTL,       keys:[{key:'ArrowDown',ctrl:true,shift:true},{key:'x',ctrl:true}]},        // Op inc FIRST this time
      {sel:O.o.opinc[0], keys:[{key:'v',ctrl:true}]},
      {sel:O.ebTL,       keys:[{key:'ArrowDown',ctrl:true,shift:true},{key:'x',ctrl:true}]},
      {sel:O.o.ebitda[0],keys:[{key:'v',ctrl:true}]},
      {sel:O.o.margin[0],keys:[{key:'='},{key:'ArrowLeft'},{key:'ArrowLeft'},{key:'/'},{key:'ArrowLeft'},{key:'ArrowLeft'},{key:'ArrowLeft'},{key:'Enter'}]},  // margin via pointer mode (arrows grab the refs)
      {sel:O.marginRng,  keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},                           // fill down via ribbon
      {sel:O.marginRng,  keys:[{key:'%',ctrl:true,shift:true},{key:'i',ctrl:true}]},
      {sel:O.labelRng,   keys:[{key:'Alt'},L('h'),L('a'),L('c'),{key:'u',ctrl:true}]},              // ☆ mid-run — never blocks anything
      {sel:O.figRng,     keys:[{key:'Alt'},L('h'),L('a'),L('r')]},                                  // alignment BEFORE the money formats
      {sel:O.topRowRng,  keys:[{key:'$',ctrl:true,shift:true},{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
      {sel:O.restRng,    keys:[{key:'!',ctrl:true,shift:true},{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
      {sel:O.hdrRng,     keys:[{key:'b',ctrl:true}]},
      {sel:O.tableRng,   keys:[{key:'Alt'},L('h'),L('b'),L('s')]},                                  // box LAST — win fires here
    ]; }` },
  { key: 'undo', name: 'the mistake walked FIRST, dressing last, italic via alt h 2', moves: `C => { const o=C._o; return [
      {sel:o.wrongRng, keys:[{key:'Delete'},{key:'z',ctrl:true}]},
      {sel:o.rightRng, keys:[{key:'Delete'}]},
      {sel:o.memo, keys:[{key:'Alt'},L('h'),D(2)]},
      {sel:'A1', keys:[{key:'Alt'},L('h'),D(1)]},
    ]; }` },
  { key: 'copyover', name: 'deck hand-off FIRST, peel via H V S dialog, block landed last', moves: `C => { const o=C._o; return [
      {sel:o.src, keys:[{key:'c',ctrl:true}]},
      {sel:o.d3, keys:[{key:'Alt'},L('e'),L('s'),L('v'),{key:'Enter'}]},
      {sel:o.d1, keys:[{key:'v',ctrl:true}]},
      {sel:o.landedCol, keys:[{key:'c',ctrl:true}]},
      {sel:o.d2, keys:[{key:'Alt'},L('h'),L('v'),L('s'),L('a'),{key:'Enter'}]},
    ]; }` },
  { key: 'pastes', name: 'transpose + multiply first via ctrl+alt+v, divide via alt h v s, formats then border-clear, deck values last (chord-ROUTE alt)', moves: `C => { const o=C._o; return [
      {sel:o.side, keys:[{key:'c',ctrl:true}]},
      {sel:o.feesRow.split(':')[0], keys:[{key:'v',ctrl:true,alt:true},L('e'),{key:'Enter'}]},
      {sel:o.helperNeg, keys:[...T('-1'),{key:'Enter'}]},
      {sel:o.helperNeg, keys:[{key:'c',ctrl:true}]},
      {sel:o.costRow, keys:[{key:'v',ctrl:true,alt:true},L('m'),{key:'Enter'}]},
      {sel:o.helperDiv, keys:[...T('1000'),{key:'Enter'}]},
      {sel:o.helperDiv, keys:[{key:'c',ctrl:true}]},
      {sel:o.divBlk, keys:[{key:'Alt'},L('h'),L('v'),L('s'),L('i'),{key:'Enter'}]},
      {sel:o.dressed, keys:[{key:'c',ctrl:true}]},
      {sel:o.sub, keys:[{key:'v',ctrl:true,alt:true},L('t'),{key:'Enter'}]},
      {sel:o.sub, keys:[{key:'Alt'},L('h'),L('b'),L('n')]},
      {sel:o.dressed, keys:[{key:'c',ctrl:true}]},
      {sel:o.deck, keys:[{key:'Alt'},L('e'),L('s'),L('v'),{key:'Enter'}]},
    ]; }` },
  { key: 'filldr', name: '2D block FIRST (recalc closes it), ribbon fills, FY column down, then sum + pull — no ☆ (the bonus must never gate the win)', moves: `C => { const o=C._o; return [
  /* r422 (pastes rework, DEPTH_PASS §4.3): op-ORDER alt — formats land on the naked Subtotal
     FIRST (its live SUM only re-ties later; end-state grading must hold), then the value ops.
     The 1-cell helper DIVIDE over the four-cell Trading row doubles as the r419 paste-TILING
     regression: the op path must broadcast the helper once per cell, never double-apply. */
  { key: 'pastes', name: 'formats FIRST onto the naked Subtotal, helpers batched, divide tiles ×1 across Trading (r419 tiling regression), deck via ctrl+alt+v', moves: `C => { const o=C._o; return [
      {sel:o.dressed, keys:[{key:'c',ctrl:true}]},
      {sel:o.sub, keys:[{key:'Alt'},L('e'),L('s'),L('t'),{key:'Enter'}]},
      {sel:o.sub, keys:[{key:'Alt'},L('h'),L('b'),L('n')]},
      {sel:o.helperDiv, keys:[...T('1000'),{key:'Enter'}]},
      {sel:o.helperNeg, keys:[...T('-1'),{key:'Enter'}]},
      {sel:o.helperDiv, keys:[{key:'c',ctrl:true}]},
      {sel:o.divBlk, keys:[{key:'Alt'},L('e'),L('s'),L('i'),{key:'Enter'}]},
      {sel:o.helperNeg, keys:[{key:'c',ctrl:true}]},
      {sel:o.costRow, keys:[{key:'Alt'},L('e'),L('s'),L('m'),{key:'Enter'}]},
      {sel:o.side, keys:[{key:'c',ctrl:true}]},
      {sel:'B4', keys:[{key:'Alt'},L('e'),L('s'),L('e'),{key:'Enter'}]},
      {sel:o.dressed, keys:[{key:'c',ctrl:true}]},
      {sel:o.deck, keys:[{key:'v',ctrl:true,alt:true},L('v'),{key:'Enter'}]},
    ]; }` },
  { key: 'filldr', name: '2D block FIRST (recalc closes it), ribbon fills, FY column down, then sum + pull', moves: `C => { const o=C._o; return [
      {sel:o.mix0, keys:[...T('='+o.mixF),{key:'Enter'}]},
      {sel:o.mixCol, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
      {sel:o.blk, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:o.fy0, keys:[...T('=SUM('+o.fyArg+')'),{key:'Enter'}]},
      {sel:o.fyRng, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
      {sel:o.sum0, keys:[...T('=SUM('+o.sumArg+')'),{key:'Enter'}]},
      {sel:o.sumRng, keys:[{key:'r',ctrl:true}]},
      {sel:o.pull0, keys:[...T('='+o.feed0),{key:'Enter'}]},
      {sel:o.pullRng, keys:[{key:'r',ctrl:true}]},
    ]; }` },
  { key: 'filldr', name: 'AutoSum route (alt+=) for both totals, ☆ via ribbon bold (alt h 1) + top border, canonical order', moves: `C => { const o=C._o; return [
      {sel:o.pull0, keys:[...T('='+o.feed0),{key:'Enter'}]},
      {sel:o.pullRng, keys:[{key:'r',ctrl:true}]},
      {sel:o.fy0, keys:[{key:'=',alt:true},{key:'Enter'}]},
      {sel:o.fyRng, keys:[{key:'d',ctrl:true}]},
      {sel:o.sum0, keys:[{key:'=',alt:true},{key:'Enter'}]},
      {sel:o.sumRng, keys:[{key:'r',ctrl:true}]},
      {sel:o.sumRng, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:o.mix0, keys:[...T('='+o.mixF),{key:'Enter'}]},
      {sel:o.blkRow, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:o.blk, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
    ]; }` },
  { key: 'foot', name: 'typed SUMs (no alt+=), columns before rows', moves: `C => [
      {sel:'B6', keys:[...T('=SUM(B2:B5)'),{key:'Enter'}]},
      {sel:'B6:E6', keys:[{key:'r',ctrl:true}]},
      {sel:'F2', keys:[...T('=SUM(B2:E2)'),{key:'Enter'}]},
      {sel:'F2:F5', keys:[{key:'d',ctrl:true}]},
      {sel:'F6', keys:[...T('=SUM(F2:F5)'),{key:'Enter'}]},
    ]` },
  { key: 'decimals', name: 'columns walked in reverse order', moves: `C => { const o=C._o; return [
      {sel:o.pR, keys:[{key:'Alt'},L('h'),D(9), {key:'Alt'},L('h'),D(9)]},
      {sel:o.mR, keys:[{key:'Alt'},L('h'),D(0)]},
      {sel:o.evR, keys:[{key:'Alt'},L('h'),D(9), {key:'Alt'},L('h'),D(9)]},
    ]; }` },
  { key: 'colops', name: 'insert the quarter BEFORE deleting DRAFT', moves: `C => { const o=C._o;
      const dc2 = o.dc + (o.ni<=o.dc ? 1 : 0);
      return [
        {sel:colLetter(o.ni)+(o.hr+1), keys:[{key:' ',ctrl:true},{key:'Alt'},L('h'),L('i'),L('c')]},
        {sel:colLetter(o.ni)+o.hr, keys:[...T(o.mq),{key:'Enter'}]},
        {sel:colLetter(o.ni)+o.hr, keys:[{key:'b',ctrl:true}]},
        {sel:colLetter(dc2)+(o.hr+1), keys:[{key:' ',ctrl:true},{key:'Alt'},L('h'),L('d'),L('c')]},
      ]; }` },
  { key: 'anchor', name: 'dollars typed by hand — no F4 at all', moves: `C => { const o=C._o; return [
      {sel:o.tl, keys:[...T('=$B'+o.r0+'*C$'+o.hr),{key:'Enter'}]},
      {sel:o.col, keys:[{key:'d',ctrl:true}]},
      {sel:o.grid, keys:[{key:'r',ctrl:true}]},
    ]; }` },
  { key: 'anchor', name: 'pointer mode + F4 (arrows grab the refs)', moves: `C => { const o=C._o; return [
      {sel:o.tl, keys:[{key:'='},{key:'ArrowLeft'},{key:'F4'},{key:'F4'},{key:'F4'},{key:'*'},{key:'ArrowUp'},{key:'F4'},{key:'F4'},{key:'Enter'}]},
      {sel:o.col, keys:[{key:'d',ctrl:true}]},
      {sel:o.grid, keys:[{key:'r',ctrl:true}]},
    ]; }` },
  { key: 'sort', name: 'foot and dress BEFORE sorting, single-column sort resolved via the WARNING (e expand)', moves: `C => { const o=C._o;
      const m=o.range.match(/([A-J])(\\d+):([A-J])(\\d+)/);
      return [
        {sel:o.foot, keys:[{key:'=',alt:true,code:'Equal'},{key:'Enter'}]},
        {sel:o.foot, keys:[{key:'b',ctrl:true}]},
        {sel:o.sc+m[2]+':'+o.sc+m[4], keys:[{key:'Alt'},L('a'),L('s'),L('d'),L('e')]},
      ]; }` },
  { key: 'series', name: 'dress first, series last', moves: `C => { const o=C._o; return [
      {sel:o.range, keys:[{key:'b',ctrl:true}]},
      {sel:o.range, keys:[{key:'Alt'},L('h'),L('a'),L('r')]},
      {sel:o.range, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('s'),{key:'Enter'}]},
    ]; }` },
  // --- T-A tranche 2 additions (r170) ---
  { key: 'lookup', name: 'the two-way INDEX form (block + double MATCH)', moves: `C => [
      {sel:'G4', keys:[...T('=INDEX(B2:D8,MATCH(G2,A2:A8,0),MATCH(G3,B1:D1,0))'),{key:'Enter'}]},
    ]` },
  { key: 'lookup2', name: 'header-inclusive ranges (consistent off-by-one)', moves: `C => [
      {sel:'G4', keys:[...T('=INDEX(B1:D6,MATCH(G2,A1:A6,0),MATCH(G3,B1:D1,0))'),{key:'Enter'}]},
    ]` },
  { key: 'percent', name: 'dollars typed by hand, block B first', moves: `C => { const R=C._R; return [
      {sel:R.pc+R.r0, keys:[...T('='+R.vc+R.r0+'/$'+R.vc+'$'+R.r0),{key:'Enter'}]},
      {sel:R.pc+R.r0+':'+R.pc+R.rN, keys:[{key:'d',ctrl:true},{key:'%',ctrl:true,shift:true}]},
      {sel:'C2', keys:[...T('=B2/$B$2'),{key:'Enter'}]},
      {sel:'C2:C6', keys:[{key:'d',ctrl:true},{key:'%',ctrl:true,shift:true}]},
    ]; }` },
  { key: 'bridge', name: 'typed refs (no pointing) + ribbon fill right, geometry-derived', moves: `C => { const o=C._o;
      const L2=colLetter(o.c0);
      return [
        {sel:o.f, keys:[...T('='+L2+(o.hr+1)+'*'+L2+(o.hr+2)),{key:'Enter'}]},
        {sel:o.rng, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      ]; }` },
  { key: 'autofit', name: 'uniform width FIRST, then content-fit; both via ribbon', moves: `C => { const o=C._o; return [
      {sel:o.uRng, keys:[{key:'Alt'},L('h'),L('o'),L('w'),D(1),D(2),{key:'Enter'}]},
      {sel:o.a1+':'+o.a2, keys:[{key:'Alt'},L('h'),L('o'),L('i')]},
    ]; }` },
  { key: 'editfix', name: 'range stretched FIRST, audit second, typos last in reverse', moves: `C => { const o=C._o;
      const steps=[
        {sel:o.totCell, keys:[{key:'F2'},{key:'Backspace'},{key:'Backspace'},...T(o.tailFix),{key:'Enter'}]},
        {sel:o.driftCell, keys:[...T(String(o.feedVal)),{key:'Enter'}]},
      ];
      o.sites.slice().reverse().forEach(s2=>{
        let p=0; while(p<s2.bad.length && p<s2.good.length && s2.bad[p]===s2.good[p]) p++;
        const keys=[{key:'F2'}];
        for(let i=0;i<s2.bad.length-p;i++) keys.push({key:'Backspace'});
        keys.push(...T(s2.good.slice(p)),{key:'Enter'});
        steps.push({sel:s2.cell, keys});
      });
      return steps; }` },
  { key: 'drill', name: 'values paste via the H V S dialog route', moves: `C => [
      {sel:'B3:B8', keys:[{key:'c',ctrl:true}]},
      {sel:'B3:B8', keys:[{key:'Alt'},L('h'),L('v'),L('s'),L('v'),{key:'Enter'}]},
      {sel:'B3:B8', keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
    ]` },
  { key: 'dress', name: 'footnote FIRST via alt o e, perimeter EARLY, blue in two passes, source italic mid-pass, header shaded late', moves: `C => { const R=C._R; return [
      {sel:'A'+R.mRow, keys:[{key:'Alt'},L('o'),L('e'),L('e')]},
      {sel:'A3:E3', keys:[{key:'Alt'},L('h'),L('h'),{key:'ArrowRight'},{key:'Enter'}]},
      {sel:'A'+R.mRow+':E'+R.mRow, keys:[{key:'Alt'},L('h'),L('b'),L('s')]},
      {sel:'A1', keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('s')]},
      {sel:'A'+R.tRow+':E'+R.tRow, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:'A'+R.srcRow, keys:[{key:'i',ctrl:true}]},
      {sel:R.costRange, keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
      {sel:R.segRange, keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
      {sel:R.mRowRange, keys:[{key:'%',ctrl:true,shift:true},{key:'Alt'},L('h'),D(0)]},
      {sel:R.fRange, keys:[{key:'!',ctrl:true,shift:true}]},
    ]; }` },
  { key: 'scrub', name: 'junk deleted TOP-DOWN (shift math) + typed SUM', moves: `C => { const o=C._o;
      const rows=o.junkRows.slice().sort((a,b)=>a-b);
      const steps=rows.map((r,i)=>({sel:'A'+(r-i), keys:[{key:'Alt'},L('h'),L('d'),L('r')]}));
      steps.push({sel:o.range, keys:[{key:'Alt'},L('a'),L('s'),L('d')]});
      steps.push({sel:o.foot, keys:[...T('=SUM(B'+(o.hr+1)+':B'+(o.hr+7)+')'),{key:'Enter'}]});
      steps.push({sel:o.foot, keys:[{key:'b',ctrl:true}]});
      return steps; }` },
  { key: 'recon', name: 'typo fixed FIRST, diff before flags', moves: `C => { const o=C._o; return [
      {sel:'E'+o.badRow, keys:[...T(String(o.badTrue)),{key:'Enter'}]},
      {sel:'D10', keys:[...T(o.missName),{key:'Enter'}]},
      {sel:'E10', keys:[...T(String(o.missAmt)),{key:'Enter'}]},
      {sel:'F4', keys:[...T('=E4-INDEX($B$4:$B$10,MATCH(D4,$A$4:$A$10,0))'),{key:'Enter'}]},
      {sel:'F4:F10', keys:[{key:'d',ctrl:true}]},
      {sel:'C4', keys:[...T('=COUNTIF($D$4:$D$10,A4)'),{key:'Enter'}]},
      {sel:'C4:C10', keys:[{key:'d',ctrl:true}]},
    ]; }` },
  { key: 'grpfold', name: 'quarters in REVERSE + one reopened and refolded (alt a j proof)', moves: `C => { const o=C._o;
      const steps=[];
      o.blocks.slice().reverse().forEach(b=>{
        steps.push({sel:'A'+b.r1+':A'+b.r2, keys:[{key:'ArrowRight',alt:true,shift:true}]});
        steps.push({sel:'A'+b.r1, keys:[{key:'Alt'},L('a'),L('h')]});
      });
      const b0=o.blocks[0];
      steps.push({sel:'A'+b0.sub, keys:[{key:'Alt'},L('a'),L('j')]});   // reopen from the summary row
      steps.push({sel:'A'+b0.r1, keys:[{key:'Alt'},L('a'),L('h')]});    // fold it back
      return steps; }` },
  { key: 'filterpass', name: 'answer typed FIRST, armed via ribbon (alt a t) from A3, chips swept right-to-left', moves: `C => { const o=C._o;
      const pk=[{key:'ArrowDown',alt:true}];
      for(let i=0;i<o.chips.length-1;i++) pk.push({key:'ArrowRight'});
      for(let i=o.chips.length-1;i>=0;i--){ if(o.chips[i]!=='Open') pk.push({key:' '}); if(i>0) pk.push({key:'ArrowLeft'}); }
      pk.push({key:'Enter'});
      return [
        {sel:'B'+o.ansR, keys:[...T(String(o.maxOpen)),{key:'Enter'}]},
        {sel:'A3', keys:[{key:'Alt'},L('a'),L('t')]},
        {sel:'C3', keys:pk},
      ]; }` },
  { key: 'typeset', name: 'reverse order, ribbon bold/italic routes, strike via ctrl+1 K', moves: `C => { const o=C._o; return [
      {sel:o.stamp, keys:[...T('=TODAY()'),{key:'Enter'}]},
      {sel:o.deadRng, keys:[{key:'1',ctrl:true},L('k')]},
      {sel:o.memoRng, keys:[{key:'Alt'},L('h'),D(2)]},
      {sel:o.wbRng, keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:'A2:D2', keys:[{key:'b',ctrl:true}]},
    ]; }` },
  { key: 'unhide', name: 'width fixed FIRST, ribbon unhide route, grouped while still hidden', moves: `C => { const o=C._o; return [
      {sel:'B2', keys:[{key:'Alt'},L('h'),L('o'),L('w'),{key:'1'},{key:'2'},{key:'Enter'}]},
      {sel:'A'+o.h1+':A'+o.h2, keys:[{key:'ArrowRight',alt:true,shift:true}]},
      {sel:'A'+(o.h1-1)+':A'+(o.h2+1), keys:[{key:'Alt'},L('h'),L('o'),L('u'),L('o')]},
      {sel:'A'+(o.h1-1), keys:[{key:'Alt'},L('a'),L('h')]},
    ]; }` },
  { key: 'rollup', name: 'feet FIRST (recalc closes them), criteria pairs swapped, ribbon fills', moves: `C => [
      {sel:'G5', keys:[...T('=SUM(G3:G4)'),{key:'Enter'}]},
      {sel:'G5:H5', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'F5:H5', keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:'F5:H5', keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:'G3', keys:[...T('=SUMIFS($C$3:$C$11,$B$3:$B$11,G$2,$A$3:$A$11,$F3)'),{key:'Enter'}]},
      {sel:'G3:H3', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'G3:H4', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
    ]` },
  { key: 'hunt', name: 'totals footed FIRST, ctrl+g route, crimes fixed in reverse', moves: `C => { const o=C._o;
      const steps=[
        {sel:'B8', keys:[...T('=SUM(B3:B7)'),{key:'Enter'}]},
        {sel:'B8:D8', keys:[{key:'r',ctrl:true}]},
        {sel:'B8:D8', keys:[{key:'b',ctrl:true}]},
        {sel:'A1', keys:[{key:'g',ctrl:true},L('s'),L('o')]},
      ];
      o.sites.slice().reverse().forEach(s=>steps.push({sel:s.k, keys:[...T(s.f),{key:'Enter'}]}));
      return steps; }` },
  { key: 'center', name: 'title centered ACROSS first, via alt o e', moves: `C => { const o=C._o; return [
      {sel:'A1:'+o.lc+'1', keys:[{key:'Alt'},L('o'),L('e'),L('a')]},
      {sel:o.hdr, keys:[{key:'Alt'},L('h'),L('a'),L('c')]},
      {sel:o.lab, keys:[{key:'Alt'},L('h'),L('a'),L('l')]},
      {sel:o.tot, keys:[{key:'Alt'},L('h'),L('a'),L('r')]},
      {sel:o.tot, keys:[{key:'b',ctrl:true}]},
    ]; }` },
  { key: 'growth', name: 'bold first, percent via alt h p, CAGR before YoY, algebraic YoY variant', moves: `C => [
      {sel:'B4', keys:[...T('=B2+B3'),{key:'Enter'}]},
      {sel:'B4:F4', keys:[{key:'r',ctrl:true}]},
      {sel:'B4:F4', keys:[{key:'b',ctrl:true}]},
      {sel:'B7', keys:[...T('=(F4/B4)^(1/4)-1'),{key:'Enter'}]},
      {sel:'B7', keys:[{key:'Alt'},L('h'),L('p')]},
      {sel:'C5', keys:[...T('=(C4-B4)/B4'),{key:'Enter'}]},
      {sel:'C5:F5', keys:[{key:'r',ctrl:true}]},
      {sel:'C5:F5', keys:[{key:'Alt'},L('h'),L('p')]},
    ]` },
  { key: 'revolver', name: 'MAX-outside nest, prove-outs bottom-up, border before bold via ribbon', moves: `C => [
      {sel:'B5', keys:[...T('=MAX(0,MIN(B3,B2-B4))'),{key:'Enter'}]},
      {sel:'B5:E5', keys:[{key:'r',ctrl:true}]},
      {sel:'B7', keys:[...T('=B2-B5'),{key:'Enter'}]},
      {sel:'B7:E7', keys:[{key:'r',ctrl:true}]},
      {sel:'B6', keys:[...T('=B3-B5'),{key:'Enter'}]},
      {sel:'B6:E6', keys:[{key:'r',ctrl:true}]},
      {sel:'B6:E6', keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:'B6:E6', keys:[{key:'Alt'},L('h'),D(1)]},
    ]` },
  { key: 'waterfall', name: 'corkscrews linked before block fills, narrower fill geometry than the demo', moves: `C => [
      {sel:'B5', keys:[...T('=SUM(B2:B4)'),{key:'Enter'}]},
      {sel:'B5:D5', keys:[{key:'r',ctrl:true}]},
      {sel:'B8', keys:[...T('=MIN(B5,B7)'),{key:'Enter'}]},
      {sel:'B9', keys:[...T('=B7-B8'),{key:'Enter'}]},
      {sel:'C7', keys:[...T('=B9'),{key:'Enter'}]},
      {sel:'C7:D7', keys:[{key:'r',ctrl:true}]},
      {sel:'B8:D9', keys:[{key:'r',ctrl:true}]},
      {sel:'B10', keys:[...T('=B5-B8'),{key:'Enter'}]},
      {sel:'B10:D10', keys:[{key:'r',ctrl:true}]},
      {sel:'B13', keys:[...T('=MIN(B10,B12)'),{key:'Enter'}]},
      {sel:'B14', keys:[...T('=B12-B13'),{key:'Enter'}]},
      {sel:'C12', keys:[...T('=B14'),{key:'Enter'}]},
      {sel:'C12:D12', keys:[{key:'r',ctrl:true}]},
      {sel:'B13:D14', keys:[{key:'r',ctrl:true}]},
    ]` },
  // --- T24 anti-railroad tranche: order permutations + chord-route swaps ---
  { key: 'accdil', name: 'shares side FIRST, drag last-but-one, typed addition instead of SUM()', moves: `C => [
      {sel:'B11', keys:[...T('=B9+B10'),{key:'Enter'}]},
      {sel:'B12', keys:[...T('=B2/B9'),{key:'Enter'}]},
      {sel:'B7',  keys:[...T('=-B5*B6'),{key:'Enter'}]},
      {sel:'B8',  keys:[...T('=B2+B3+B4+B7'),{key:'Enter'}]},
      {sel:'B13', keys:[...T('=B8/B11'),{key:'Enter'}]},
      {sel:'B14', keys:[...T('=B13/B12-1'),{key:'Enter'}]},
    ]` },
  { key: 'audit', name: 'crimes fixed in REVERSE, full retype instead of F2 surgery', moves: `C => {
      const c1=C._t1, c2=C._t2, c3=C._t3;
      const col2=c2[0], col3=c3[0], r1=c1.slice(1);
      return [
        {sel:c3, keys:[...T('='+col3+'10+'+col3+'12'),{key:'Enter'}]},
        {sel:c2, keys:[...T('='+col2+'10+'+col2+'12'),{key:'Enter'}]},
        {sel:c1, keys:[...T('=SUM(B'+r1+':F'+r1+')'),{key:'Enter'}]},
      ]; }` },
  { key: 'balance', name: 'dress BEFORE the build, L&E footed before assets, alt+= sums + ribbon fills', moves: `C => [
      {sel:'B14:C14', keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:'B6:C6',   keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:'B12:C12', keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:'B12',     keys:[{key:'=',alt:true,code:'Equal'},{key:'Enter'}]},
      {sel:'B12:C12', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B6',      keys:[{key:'=',alt:true,code:'Equal'},{key:'Enter'}]},
      {sel:'B6:C6',   keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B14',     keys:[...T('=B6-B12'),{key:'Enter'}]},
      {sel:'B14:C14', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
    ]` },
  { key: 'balcheck', name: 'culprits fixed FIRST, check row resurrected LAST via ribbon fill', moves: `C => {
      const sh=C._short, pl=C._plug;
      const shL=sh[0], plL=pl[0];   // single-letter cols; regex escapes die inside template literals
      const prev=String.fromCharCode(plL.charCodeAt(0)-1);
      return [
        {sel:pl, keys:[...T('='+prev+'12+'+plL+'13'),{key:'Enter'}]},
        {sel:sh, keys:[...T('=SUM('+shL+'4:'+shL+'7)'),{key:'Enter'}]},
        {sel:'B15', keys:[...T('=B8-B14'),{key:'Enter'}]},
        {sel:'B15:E15', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      ]; }` },
  { key: 'bsbuild', name: 'dress FIRST, RE roll before any footing, assets footed LAST, ribbon fills + alt h 1', moves: `C => [
      {sel:'B5:D5',   keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:'B11:D11', keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:'B14:D14', keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:'C10', keys:[...T('=B10+C12-C13'),{key:'Enter'}]},
      {sel:'C10:D10', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B8',  keys:[...T('=SUM(B6:B7)'),{key:'Enter'}]},
      {sel:'B8:D8', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B11', keys:[...T('=B8+B9+B10'),{key:'Enter'}]},
      {sel:'B11:D11', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B5',  keys:[...T('=SUM(B2:B4)'),{key:'Enter'}]},
      {sel:'B5:D5', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B14', keys:[...T('=B5-B11'),{key:'Enter'}]},
      {sel:'B14:D14', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
    ]` },
  { key: 'cascade', name: 'tranches bottom-up — mezz first, revolver last, ribbon fills, ribbon dress', moves: `C => [
      {sel:'B12', keys:[...T('=MIN(B11,B3-B6-B9)'),{key:'Enter'}]},
      {sel:'B12:E12', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B13', keys:[...T('=B11-B12'),{key:'Enter'}]},
      {sel:'B13:E13', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'C11', keys:[...T('=B13'),{key:'Enter'}]},
      {sel:'C11:E11', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B9',  keys:[...T('=MIN(B8,B3-B6)'),{key:'Enter'}]},
      {sel:'B9:E9', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B10', keys:[...T('=B8-B9'),{key:'Enter'}]},
      {sel:'B10:E10', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'C8',  keys:[...T('=B10'),{key:'Enter'}]},
      {sel:'C8:E8', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B6',  keys:[...T('=MIN(B5,B3)'),{key:'Enter'}]},
      {sel:'B6:E6', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B7',  keys:[...T('=B5-B6'),{key:'Enter'}]},
      {sel:'B7:E7', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'C5',  keys:[...T('=B7'),{key:'Enter'}]},
      {sel:'C5:E5', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B14', keys:[...T('=B7+B10+B13'),{key:'Enter'}]},
      {sel:'B14:E14', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B14:E14', keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:'B14:E14', keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
    ]` },
  { key: 'cases', name: 'driver built growth-first, model then capture, flip the cases, then the deal-team revision + refresh', moves: `C => { const cap=C._capL, mp=String(Math.round(C._mutG*100)); return [
      {sel:'B9', keys:[...T('=CHOOSE($B$3,B6,C6,D6)'),{key:'Enter'}]},
      {sel:'B8', keys:[...T('=CHOOSE($B$3,B5,C5,D5)'),{key:'Enter'}]},
      {sel:'C12', keys:[...T('=B12*(1+$B$9)'),{key:'Enter'}]},
      {sel:'C12:F12', keys:[{key:'r',ctrl:true}]},
      {sel:'C13', keys:[...T('=C12/B12-1'),{key:'Enter'}]},
      {sel:'C13:F13', keys:[{key:'r',ctrl:true}]},
      {sel:'C18', keys:[...T('=IF($B$3=C$17,$'+cap+'$12,C18)'),{key:'Enter'}]},
      {sel:'C18:E18', keys:[{key:'r',ctrl:true}]},
      {sel:'B3', keys:[...T('1'),{key:'Enter'}]},
      {sel:'B3', keys:[...T('2'),{key:'Enter'}]},
      {sel:'B3', keys:[...T('3'),{key:'Enter'}]},
      {sel:'B6', keys:[...T(mp+'%'),{key:'Enter'}]},
      {sel:'B3', keys:[...T('1'),{key:'Enter'}]},
    ]; }` },
  { key: 'cfslink', name: 'rule the close FIRST, memo before the corkscrew, alt h p percent, bold last', moves: `C => [
      {sel:'B8:F8', keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:'B6',  keys:[...T('=SUM(B2:B5)'),{key:'Enter'}]},
      {sel:'B6:F6', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B10', keys:[...T('=B6/B2'),{key:'Enter'}]},
      {sel:'B10:F10', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B10:F10', keys:[{key:'Alt'},L('h'),L('p')]},
      {sel:'B8',  keys:[...T('=B7+B6'),{key:'Enter'}]},
      {sel:'C7',  keys:[...T('=B8'),{key:'Enter'}]},
      {sel:'C7:F7', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B8:F8', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B8:F8', keys:[{key:'Alt'},L('h'),D(1)]},
    ]` },
  { key: 'comps', name: 'implied chain built FIRST (recalc closes it), tape read backwards, ribbon fill down', moves: `C => [
      {sel:'G4',  keys:[...T('=G3*D8'),{key:'Enter'}]},
      {sel:'G6',  keys:[...T('=G4-G5'),{key:'Enter'}]},
      {sel:'G8',  keys:[...T('=G6/G7'),{key:'Enter'}]},
      {sel:'G10', keys:[...T('=G8/G9-1'),{key:'Enter'}]},
      {sel:'D3',  keys:[...T('=B3/C3'),{key:'Enter'}]},
      {sel:'D3:D7', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
      {sel:'D12', keys:[...T('=SMALL(D3:D7,2)'),{key:'Enter'}]},
      {sel:'D11', keys:[...T('=LARGE(D3:D7,2)'),{key:'Enter'}]},
      {sel:'D10', keys:[...T('=MIN(D3:D7)'),{key:'Enter'}]},
      {sel:'D9',  keys:[...T('=MAX(D3:D7)'),{key:'Enter'}]},
      {sel:'D8',  keys:[...T('=MEDIAN(D3:D7)'),{key:'Enter'}]},
    ]` },
  { key: 'covtable', name: 'read bottom-up — MIN first, flags before headroom, net leverage last, ribbon fills', moves: `C => [
      {sel:'B12', keys:[...T('=MIN(B9:F9)'),{key:'Enter'}]},
      {sel:'B10', keys:[...T('=IF(B9>=0,1,0)'),{key:'Enter'}]},
      {sel:'B10:F10', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B9',  keys:[...T('=B8-B7'),{key:'Enter'}]},
      {sel:'B9:F9', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B7',  keys:[...T('=(B5-B6)/B4'),{key:'Enter'}]},
      {sel:'B7:F7', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
    ]` },
  { key: 'dcf', name: 'TV block FIRST, PV row before the factors it reads, ribbon fills', moves: `C => [
      {sel:'B10', keys:[...T('=F3*(1+B8)/($B$7-B8)'),{key:'Enter'}]},
      {sel:'B11', keys:[...T('=B10*F4'),{key:'Enter'}]},
      {sel:'B12', keys:[...T('=SUM(B5:F5)+B11'),{key:'Enter'}]},
      {sel:'B5',  keys:[...T('=B3*B4'),{key:'Enter'}]},
      {sel:'B5:F5', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B4',  keys:[...T('=1/(1+$B$7)^B2'),{key:'Enter'}]},
      {sel:'B4:F4', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
    ]` },
  { key: 'debtsched', name: 'machine built FIRST, the VP rate dropped in LAST, ribbon fills + alt h 1', moves: `C => [
      {sel:'B4', keys:[...T('=-B2*$B$9'),{key:'Enter'}]},
      {sel:'B5', keys:[...T('=-MIN(B2+B4,MAX(0,B3))'),{key:'Enter'}]},
      {sel:'B6', keys:[...T('=B2+B4+B5'),{key:'Enter'}]},
      {sel:'B7', keys:[...T('=$B$10*(B2+B6)/2'),{key:'Enter'}]},
      {sel:'C2', keys:[...T('=B6'),{key:'Enter'}]},
      {sel:'C2:F2', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B4:F7', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B6:F6', keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:'B6:F6', keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:'B9', keys:[...T(C._ratePct+'%'),{key:'Enter'}]},
      {sel:'B9', keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
    ]` },
  { key: 'isbuild', name: 'dress FIRST, statement built bottom-up (margin to COGS), alt h p + ribbon fills', moves: `C => [
      {sel:'B7:F7', keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:'B7:F7', keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:'B8', keys:[...T('=B7/B2'),{key:'Enter'}]},
      {sel:'B8:F8', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B8:F8', keys:[{key:'Alt'},L('h'),L('p')]},
      {sel:'B7', keys:[...T('=B6*(1-$B$11)'),{key:'Enter'}]},
      {sel:'B7:F7', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B6', keys:[...T('=B4+B5'),{key:'Enter'}]},
      {sel:'B6:F6', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B4', keys:[...T('=B2+B3'),{key:'Enter'}]},
      {sel:'B4:F4', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B3', keys:[...T('=-B2*$B$10'),{key:'Enter'}]},
      {sel:'B3:F3', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
    ]` },
  { key: 'lbo', name: 'the whole chain typed in REVERSE — IRR first, entry EV last (recalc closes it)', moves: `C => [
      {sel:'B14', keys:[...T('=B12^(1/B13)-1'),{key:'Enter'}]},
      {sel:'B12', keys:[...T('=B11/B8'),{key:'Enter'}]},
      {sel:'B11', keys:[...T('=B9-B10'),{key:'Enter'}]},
      {sel:'B9',  keys:[...T('=B3*$B$4'),{key:'Enter'}]},
      {sel:'B8',  keys:[...T('=B6-B7'),{key:'Enter'}]},
      {sel:'B7',  keys:[...T('=B6*B5'),{key:'Enter'}]},
      {sel:'B6',  keys:[...T('=B2*$B$4'),{key:'Enter'}]},
    ]` },
  { key: 'liqbridge', name: 'bold FIRST, bridge built bottom-up (cushion to availability), ribbon fills', moves: `C => [
      {sel:'B12:D12', keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:'B14', keys:[...T('=B12-B13'),{key:'Enter'}]},
      {sel:'B14:D14', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B12', keys:[...T('=B8+SUM(B9:B11)'),{key:'Enter'}]},
      {sel:'B12:D12', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B8',  keys:[...T('=B4+B7'),{key:'Enter'}]},
      {sel:'B8:D8', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B7',  keys:[...T('=B5-B6'),{key:'Enter'}]},
      {sel:'B7:D7', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
    ]` },
  { key: 'margin', name: 'tables in REVERSE, typed refs (no pointing), ribbon fill down + alt h p', moves: `C => C._sites.slice().reverse().flatMap(s => [
      {sel:s.m+s.r0, keys:[...T('='+s.e+s.r0+'/'+s.v+s.r0),{key:'Enter'}]},
      {sel:s.m+s.r0+':'+s.m+(s.r0+2), keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
      {sel:s.m+s.r0+':'+s.m+(s.r0+2), keys:[{key:'Alt'},L('h'),L('p')]},
    ]) ` },
  { key: 'modeltour', name: 'subtotals rebuilt in REVERSE (typed + form), margins filled right, close NI with ctrl+1 C + border, home last', moves: `C => { const m=C._m.slice().reverse(); const MG=C._marg; const LC=colLetter(1+C._NC);
      const steps=m.map(x=>({sel:x.k, keys:[...T('='+x.disp),{key:'Enter'}]}));
      MG.forEach(g=>{ steps.push({sel:'B'+g.r, keys:[...T('=B'+g.num+'/B3'),{key:'Enter'}]});
                      steps.push({sel:'B'+g.r+':'+LC+g.r, keys:[{key:'r',ctrl:true}]}); });
      steps.push({sel:C._niRng, keys:[{key:'1',ctrl:true},L('c'),{key:'Alt'},L('h'),L('b'),L('o')]});
      steps.push({sel:'A1', keys:[{key:'Home',ctrl:true}]});
      return steps; }` },
  { key: 'nwcsched', name: 'drivers typed bottom-up, NWC + dress before the driver rows, ribbon fills', moves: `C => [
      {sel:'B11', keys:[...T(String(C._dpo)),{key:'Enter'}]},
      {sel:'B10', keys:[...T(String(C._dio)),{key:'Enter'}]},
      {sel:'B9',  keys:[...T(String(C._dso)),{key:'Enter'}]},
      {sel:'B9:B11', keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
      {sel:'B7', keys:[...T('=B4+B5-B6'),{key:'Enter'}]},
      {sel:'B7:F7', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B7:F7', keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:'B7:F7', keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:'C8', keys:[...T('=C7-B7'),{key:'Enter'}]},
      {sel:'C8:F8', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B6', keys:[...T('=B3/365*$B$11'),{key:'Enter'}]},
      {sel:'B6:F6', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B5', keys:[...T('=B3/365*$B$10'),{key:'Enter'}]},
      {sel:'B5:F5', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B4', keys:[...T('=B2/365*$B$9'),{key:'Enter'}]},
      {sel:'B4:F4', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
    ]` },
  { key: 'retbridge', name: 'bridge tied in REVERSE — check first, levers last; typed addition for the total', moves: `C => [
      {sel:'B14', keys:[...T('=B12-((B3*B5-B7)-(B2*B4-B6))'),{key:'Enter'}]},
      {sel:'B12', keys:[...T('=B9+B10+B11'),{key:'Enter'}]},
      {sel:'B11', keys:[...T('=B6-B7'),{key:'Enter'}]},
      {sel:'B10', keys:[...T('=(B5-B4)*B3'),{key:'Enter'}]},
      {sel:'B9',  keys:[...T('=(B3-B2)*B4'),{key:'Enter'}]},
    ]` },
  { key: 'schedule', name: 'THE LINK laid FIRST, year-1 roll after it, memo last, ribbon fills', moves: `C => [
      {sel:'C2', keys:[...T('=B5'),{key:'Enter'}]},
      {sel:'C2:F2', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B5', keys:[...T('=B2+B3+B4'),{key:'Enter'}]},
      {sel:'B4', keys:[...T('=-B2*$B$9'),{key:'Enter'}]},
      {sel:'B4:F5', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B7', keys:[...T('=-B4'),{key:'Enter'}]},
      {sel:'C7', keys:[...T('=B7-C4'),{key:'Enter'}]},
      {sel:'C7:F7', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
    ]` },
  { key: 'signerr', name: 'margin row laid BEFORE the flips (recalc re-ties), flips reversed, alt h p', moves: `C => {
      const steps=[
        {sel:'B10', keys:[...T('=B8/B4'),{key:'Enter'}]},
        {sel:'B10:F10', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
        {sel:'B10:F10', keys:[{key:'Alt'},L('h'),L('p')]},
      ];
      C._flips.slice().reverse().forEach(cell=>steps.push({sel:cell, keys:[...T(String(-Math.abs(C._mag[cell]))),{key:'Enter'}]}));
      return steps; }` },
  { key: 'sourcesuses', name: 'check row FIRST, sources before uses, % columns last via ribbon fill down', moves: `C => [
      {sel:'B12', keys:[...T('=B10-B5'),{key:'Enter'}]},
      {sel:'B9',  keys:[...T('=B5-B7-B8'),{key:'Enter'}]},
      {sel:'B10', keys:[...T('=SUM(B7:B9)'),{key:'Enter'}]},
      {sel:'B5',  keys:[...T('=SUM(B2:B4)'),{key:'Enter'}]},
      {sel:'C7',  keys:[...T('=B7/$B$10'),{key:'Enter'}]},
      {sel:'C7:C10', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
      {sel:'C2',  keys:[...T('=B2/$B$5'),{key:'Enter'}]},
      {sel:'C2:C5', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
    ]` },
  { key: 'stalelink', name: 'stale refs re-pointed in REVERSE, operands swapped (units x price)', moves: `C => { const st=C._stale;
      const mk=(cell)=>{ const Lc=cell[0], r=cell.slice(1);   // single-letter cols; regex escapes die inside template literals
        const src=r==='11'?'$B$4':(r==='12'?'$B$5':'$B$6');
        const dep=r==='11'?(Lc+'10'):(Lc+'11');
        return {sel:cell, keys:[...T('='+dep+'*'+src),{key:'Enter'}]}; };
      return st.slice().reverse().map(mk); }` },
  { key: 'sumif', name: 'dress FIRST, foot + mix before the rollup exists, ctrl+1 percent, ribbon fills', moves: `C => [
      {sel:'D5:E5', keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:'D5:E5', keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:'E5', keys:[...T('=SUM(E2:E4)'),{key:'Enter'}]},
      {sel:'F2', keys:[...T('=E2/$E$5'),{key:'Enter'}]},
      {sel:'F2:F4', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
      {sel:'F2:F4', keys:[{key:'1',ctrl:true},L('p')]},
      {sel:'E2', keys:[...T('=SUMIF($A$2:$A$10,D2,$B$2:$B$10)'),{key:'Enter'}]},
      {sel:'E2:E4', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
    ]` },
  { key: 'threestmt', name: 'balance sheet BEFORE the CFS — RE roll and check first, cash spine last', moves: `C => [
      {sel:'C13', keys:[...T('=B13+C2'),{key:'Enter'}]},
      {sel:'C13:D13', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B14', keys:[...T('=B11-B12-B13'),{key:'Enter'}]},
      {sel:'B14:D14', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B11', keys:[...T('=B9+B10'),{key:'Enter'}]},
      {sel:'B11:D11', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B9',  keys:[...T('=B7'),{key:'Enter'}]},
      {sel:'B9:D9', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B5',  keys:[...T('=SUM(B2:B4)'),{key:'Enter'}]},
      {sel:'B5:D5', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B7',  keys:[...T('=B6+B5'),{key:'Enter'}]},
      {sel:'C6',  keys:[...T('=B7'),{key:'Enter'}]},
      {sel:'C6:D6', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B7:D7', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B11:D11', keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:'B14:D14', keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
    ]` },
  { key: 'triage', name: 'errors triaged in REVERSE — #VALUE! first, the #REF! it depends on last', moves: `C => { const R=C._R; return [
      {sel:R.valCell, keys:[...T('='+R.valFix+'/'+R.valBase+'-1'),{key:'Enter'}]},
      {sel:R.divCell, keys:[...T('='+R.divNum+'/'+R.divFix),{key:'Enter'}]},
      {sel:R.refCell, keys:[...T('=SUM('+R.refFix+')'),{key:'Enter'}]},
    ]; }` },
  { key: 'versionup', name: 'rows resurrected in REVERSE — margin first, growth last, ribbon fills', moves: `C => [
      {sel:'B10', keys:[...T('=B9/B4'),{key:'Enter'}]},
      {sel:'B10:F10', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B9', keys:[...T('=B7+B8'),{key:'Enter'}]},
      {sel:'B9:F9', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B7', keys:[...T('=B4+B6'),{key:'Enter'}]},
      {sel:'B7:F7', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'C5', keys:[...T('=C4/B4-1'),{key:'Enter'}]},
      {sel:'C5:F5', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'A1', keys:[{key:'h',ctrl:true,code:'KeyH'},{key:'v'},{key:'1'},{key:'Tab'},{key:'v'},{key:'2'},{key:'Enter'}]},
    ]` },
  { key: 'wk13', name: 'totals + dress FIRST, cushion before the spine, ribbon fills throughout', moves: `C => [
      {sel:'J4', keys:[...T('=SUM(B4:I4)'),{key:'Enter'}]},
      {sel:'J4:J6', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
      {sel:'B8:I8', keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:'B8:I8', keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:'B10', keys:[...T('=B8-$B$12'),{key:'Enter'}]},
      {sel:'B10:I10', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B6', keys:[...T('=B4-B5'),{key:'Enter'}]},
      {sel:'B6:I6', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B8', keys:[...T('=B7+B6'),{key:'Enter'}]},
      {sel:'C7', keys:[...T('=B8'),{key:'Enter'}]},
      {sel:'C7:I7', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B8:I8', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
    ]` },
  { key: 'combo', name: 'reversed pass — wrap and commas first, ctrl+shift+! + ribbon bold, autofit still last', moves: `C => { const o=C._o; return [
      {sel:o.notes, keys:[{key:'Alt'},L('h'),L('w')]},
      {sel:o.num,   keys:[{key:'!',ctrl:true,shift:true},{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
      {sel:o.mh,    keys:[{key:'Alt'},L('h'),L('a'),L('r')]},
      {sel:o.hdr,   keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:o.title, keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:o.num,   keys:[{key:'Alt'},L('h'),L('o'),L('i')]},
    ]; }` },
  { key: 'gauntlet', name: 'uses side FIRST, typed SUMs (no alt+=), alt h 1 bold, ctrl+shift+! commas', moves: `C => { const R=C._R, r0=R.r0; return [
      {sel:R.useIn,  keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
      {sel:R.srcIn,  keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
      {sel:R.useTot, keys:[...T('=SUM(E'+(r0+1)+':E'+(r0+4)+')'),{key:'Enter'}]},
      {sel:R.srcTot, keys:[...T('=SUM(B'+(r0+1)+':B'+(r0+4)+')'),{key:'Enter'}]},
      {sel:R.useTot, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:R.srcTot, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:R.useCol, keys:[{key:'!',ctrl:true,shift:true},{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
      {sel:R.srcCol, keys:[{key:'!',ctrl:true,shift:true},{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
      {sel:R.useTot, keys:[{key:'Alt'},L('h'),L('a'),L('n')]},
      {sel:R.srcTot, keys:[{key:'Alt'},L('h'),L('a'),L('n')]},
      {sel:R.useCol, keys:[{key:'Alt'},L('h'),L('o'),L('i')]},
      {sel:R.srcCol, keys:[{key:'Alt'},L('h'),L('o'),L('i')]},
    ]; }` },
  { key: 'housestyle', name: 'reversed pass — rule EBITDA first, alt h p, ctrl+shift+!, title bolded last', moves: `C => { const R=C._R;
      const BLUE=[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}];
      const steps=[
        {sel:'B7:F7', keys:[{key:'Alt'},L('h'),D(1)]},
        {sel:'B7:F7', keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
        {sel:'B8:F8', keys:[{key:'Alt'},L('h'),L('p')]},
        {sel:'B3:F7', keys:[{key:'!',ctrl:true,shift:true},{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
        {sel:R.override, keys:BLUE},
      ];
      R.inpRows.slice().reverse().forEach(r=>steps.push({sel:'B'+r+':F'+r, keys:BLUE}));
      steps.push({sel:'B2:F2', keys:[{key:'Alt'},L('h'),D(1)]});
      steps.push({sel:'B2:F2', keys:[{key:'Alt'},L('h'),L('b'),L('o')]});
      steps.push({sel:'A1', keys:[{key:'b',ctrl:true}]});
      return steps; }` },
  { key: 'ruleaudit', name: 'defects fixed in REVERSE (box first), alt h 1 for the bold, pull-through LAST', moves: `C => { const R=C._R;
      const W=(a,b,c2)=>[{key:'Alt'},L(a),L(b),L(c2)];
      const steps=[];
      if(R.defects.includes('box'))  steps.push({sel:R.focus, keys:W('h','b','s')});
      if(R.defects.includes('gbold'))steps.push({sel:'B'+R.g+':'+R.LC+R.g, keys:[{key:'Alt'},L('h'),D(1)]});
      if(R.defects.includes('gbt'))  steps.push({sel:'B'+R.g+':'+R.LC+R.g, keys:W('h','b','p')});
      if(R.defects.includes('sub2')) steps.push({sel:'B'+R.sub2+':'+R.LC+R.sub2, keys:W('h','b','p')});
      if(R.defects.includes('sub1')) steps.push({sel:'B'+R.sub1+':'+R.LC+R.sub1, keys:W('h','b','p')});
      if(R.defects.includes('hdr'))  steps.push({sel:'B2:'+R.LC+'2', keys:W('h','b','o')});
      steps.push({sel:R.mcol+R.g, keys:[...T('='+R.mcol+R.sub1+'+'+R.mcol+R.sub2),{key:'Enter'}]});
      return steps; }` },
  { key: 'ruleoff', name: 'EBITDA pulled FIRST via ribbon fill + alt h 1, rulings walked bottom-up, box last', moves: `C => { const R=C._R; return [
      {sel:'B'+R.g, keys:[...T('=B'+R.sub1+'+B'+R.sub2),{key:'Enter'}]},
      {sel:'B'+R.g+':'+R.LC+R.g, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B'+R.g+':'+R.LC+R.g, keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:'B'+R.g+':'+R.LC+R.g, keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:'B'+R.sub2+':'+R.LC+R.sub2, keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:'B'+R.sub1+':'+R.LC+R.sub1, keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:'B2:'+R.LC+'2', keys:[{key:'Alt'},L('h'),L('b'),L('o')]},
      {sel:R.focus, keys:[{key:'Alt'},L('h'),L('b'),L('t')]},
    ]; }` },
  { key: 'navigation', name: 'thread the maze the SLOW way — single-arrow steps (not Ctrl+arrow), collecting every pip, then grab → weave → drop', moves: `C => {
      // r402 maze: the alternate route is single-cell arrow-stepping the corridor instead of the
      // canonical Ctrl+arrow shooting. Same win (pips collected + model grabbed + pasted).
      const M=C._maze, cl=colLetter, T=M.table, D=M.paste, p1=M.p1, p2=M.p2;
      const sk=(a,b)=>{ const dr=b[0]-a[0], dc=b[1]-a[1]; return dr===1?{key:'ArrowDown'}:dr===-1?{key:'ArrowUp'}:dc===1?{key:'ArrowRight'}:{key:'ArrowLeft'}; };
      const nav1=[]; for(let i=1;i<p1.length;i++) nav1.push(sk(p1[i-1],p1[i]));   // walk to the model, one cell at a time (collects pips)
      const nav2=[]; for(let i=1;i<p2.length;i++) nav2.push(sk(p2[i-1],p2[i]));   // walk to the drop zone
      const corner=cl(T.c0)+T.r0, full=corner+':'+cl(T.c0+T.w-1)+(T.r0+T.h-1);
      return [
        {sel:cl(p1[0][1])+p1[0][0], keys:nav1},                                                          // slow single-step thread to the model room
        {sel:corner, keys:[{key:'ArrowRight',ctrl:true,shift:true},{key:'ArrowDown',ctrl:true,shift:true},{key:'c',ctrl:true}]},   // grab the block + copy
        {sel:cl(p2[0][1])+p2[0][0], keys:nav2},                                                          // slow single-step weave to the drop zone
        {sel:cl(D.c0)+D.r0, keys:[{key:'v',ctrl:true}]}                                                  // paste
      ]; }` },
  { key: 'navigation', name: 'ctrl-shot thread + SLOW GRAB — the model spanned with plain shift+arrows (no ctrl+shift jumps)', moves: `C => {
      // r422 (§1.8): second route — canonical corridor shooting, but the block-grab is plain
      // Shift+arrow spans (2 right, 3 down), one cell at a time. Same end state, different chords.
      const M=C._maze, cl=colLetter, T=M.table, D=M.paste, p1=M.p1, p2=M.p2, RN=20, CN=10;
      const ek=(r,c,nr,nc)=>{ const a=r*100+c,b=nr*100+nc; return a<b?(r+':'+c+'|'+nr+':'+nc):(nr+':'+nc+'|'+r+':'+c); };
      const can=(r,c,nr,nc)=> nr>=1&&nr<=RN&&nc>=1&&nc<=CN&&M.pass.has(ek(r,c,nr,nc));
      const shoot=(r,c,dr,dc)=>{ let cr=r,cc=c; while(can(cr,cc,cr+dr,cc+dc)){cr+=dr;cc+=dc;} return [cr,cc]; };
      const dK=(dr,dc)=> dr===1?{key:'ArrowDown',ctrl:true}:dr===-1?{key:'ArrowUp',ctrl:true}:dc===1?{key:'ArrowRight',ctrl:true}:{key:'ArrowLeft',ctrl:true};
      const sK=(dr,dc)=> dr===1?{key:'ArrowDown'}:dr===-1?{key:'ArrowUp'}:dc===1?{key:'ArrowRight'}:{key:'ArrowLeft'};
      const steps=[];
      const walk=(path)=>{ let i=0;
        while(i<path.length-1){ const [r,c]=path[i]; const dr=Math.sign(path[i+1][0]-r), dc=Math.sign(path[i+1][1]-c);
          let j=i+1; while(j+1<path.length && Math.sign(path[j+1][0]-path[j][0])===dr && Math.sign(path[j+1][1]-path[j][1])===dc) j++;
          const end=path[j], sh=shoot(r,c,dr,dc);
          if(sh[0]===end[0]&&sh[1]===end[1]){ steps.push({sel:cl(c)+r, keys:[dK(dr,dc)]}); }
          else { for(let k=i;k<j;k++){ const [rr,cc]=path[k]; steps.push({sel:cl(cc)+rr, keys:[sK(dr,dc)]}); } }
          i=j; } };
      walk(p1);                                                                                          // ctrl-shot thread to the model room (collects pips)
      const g=[]; for(let i=0;i<T.w-1;i++) g.push({key:'ArrowRight',shift:true});
      for(let i=0;i<T.h-1;i++) g.push({key:'ArrowDown',shift:true});
      g.push({key:'c',ctrl:true});
      steps.push({sel:cl(T.c0)+T.r0, keys:g});                                                           // slow grab + copy (active ends at the far corner, where p2 starts)
      walk(p2);                                                                                          // ctrl-shot weave to the drop zone
      steps.push({sel:cl(D.c0)+D.r0, keys:[{key:'v',ctrl:true}]});
      return steps; }` },
  { key: 'cagr', name: 'blocks in reverse, winner flagged mid-run', moves: `C => {
      const w=C._sites.reduce((a,s)=>s.exp>a.exp?s:a,C._sites[0]);
      const steps=C._sites.slice().reverse().flatMap(s=>[
        {sel:s.col+s.ans, keys:[...T('=('+s.col+(s.r0+1)+'/'+s.col+s.r0+')^(1/'+s.col+(s.r0+2)+')-1'),{key:'Enter'}]},
        {sel:s.col+s.ans, keys:[{key:'%',ctrl:true,shift:true}]},
      ]);
      steps.push({sel:w.col+w.ans, keys:[{key:'Alt'},L('h'),D(1)]});
      return steps; }` },
  { key: 'wacc', name: 'debt side first — at-Kd before the beta chain', moves: `C => [
      {sel:'B13', keys:[...T('=B9*(1-B6)'),{key:'Enter'}]},
      {sel:'B10', keys:[...T('=B4/(1+(1-B6)*B5)'),{key:'Enter'}]},
      {sel:'B11', keys:[...T('=B10*(1+(1-B6)*B8/B7)'),{key:'Enter'}]},
      {sel:'B12', keys:[...T('=B2+B11*B3'),{key:'Enter'}]},
      {sel:'B14', keys:[...T('=(B7*B12+B8*B13)/(B7+B8)'),{key:'Enter'}]},
    ]` },
  { key: 'txncomps', name: 'tape filled via ctrl+d, MEDIAN typed last-first', moves: `C => [
      {sel:'D3', keys:[...T('=B3/C3'),{key:'Enter'}]},
      {sel:'D3:D7', keys:[{key:'d',ctrl:true}]},
      {sel:'D8', keys:[...T('=MEDIAN(D3:D7)'),{key:'Enter'}]},
      {sel:'B11', keys:[...T('=B10*D8'),{key:'Enter'}]},
      {sel:'B13', keys:[...T('=B11-B12'),{key:'Enter'}]},
    ]` },
  { key: 'football', name: 'ceiling before floor, mids last', moves: `C => [
      {sel:'B8', keys:[...T('=MAX(C3:C5)'),{key:'Enter'}]},
      {sel:'B7', keys:[...T('=MIN(B3:B5)'),{key:'Enter'}]},
      {sel:'B9', keys:[...T('=B8-B7'),{key:'Enter'}]},
      {sel:'D3', keys:[...T('=(B3+C3)/2'),{key:'Enter'}]},
      {sel:'D3:D5', keys:[{key:'d',ctrl:true}]},
    ]` },
  { key: 'dcfsens', name: 'fill DOWN first, then right', moves: `C => [
      {sel:'C4', keys:[...T('=$B$2/(C$3-$B4)'),{key:'Enter'}]},
      {sel:'C4:C6', keys:[{key:'d',ctrl:true}]},
      {sel:'C4:G6', keys:[{key:'r',ctrl:true}]},
    ]` },
  // --- T-D audit pack (r173) ---
  { key: 'wirewalk', name: 'hop up, fix, then ride the dependents back down', moves: `C => { const o=C._o;
      const keys=[{key:'[',ctrl:true},{key:'[',ctrl:true}];
      for(let i=0;i<o.bi;i++) keys.push({key:'ArrowDown'});
      keys.push(...T(String(o.good)),{key:'Enter'});
      return [{sel:o.deck, keys:keys}, {sel:o.bad, keys:[{key:']',ctrl:true},{key:']',ctrl:true},{key:'Home',ctrl:true}]}]; }` },
  { key: 'wrapfix', name: 'fix the range FIRST, wrap second — F2 edit for the fix', moves: `C => { const o=C._o;
      // F2 into the broken MATCH range: caret at end; walk back over ',0))' then fix B->A twice
      return [
        {sel:o.q2, keys:[{key:'F2'},
          ...Array.from({length:8},()=>({key:'ArrowLeft'})),
          {key:'Backspace'},...T('A'),
          ...Array.from({length:3},()=>({key:'ArrowRight'})),
          {key:'Backspace'},...T('A'),
          {key:'Enter'}]},
        {sel:o.q1, keys:[...T('=IFERROR(INDEX(B3:B7,MATCH(E2,A3:A7,0)),0)'),{key:'Enter'}]},
      ]; }` },
];

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1'); localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_beta_ok', '1');
    localStorage.setItem('hk_xlv', '2');
  } catch (e) {} });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await page.goto(process.env.URL || 'http://127.0.0.1:8791/index.html', { waitUntil: 'load' });   /* r422: URL override — parallel checkouts serve on their own ports (the r421 e2e-guided pattern) */
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof demoKey === 'function');
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  let fails = 0, ran = 0;
  for (const alt of ALTS) {
    if (only.length && !only.includes(alt.key)) continue;
    ran++;
    let wins = 0; const notes = [];
    for (let rep = 0; rep < REPS; rep++) {
      const r = await page.evaluate(({ key, movesSrc }) => {
        try {
          document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
          loadChallenge(key);
          const C = CHALLENGES[key];
          const moves = eval('(' + movesSrc + ')')(C);
          for (const mv of moves) { setDemoSel(mv.sel); for (const kk of mv.keys) demoKey(kk); }
          if (done) return { won: true, keys: keyLog.length };
          const failing = C.checks(S).filter(x => !x.ok).map(x => x.label);
          return { won: false, failing };
        } catch (e) { return { won: false, failing: ['THREW: ' + String(e).slice(0, 100)] }; }
      }, { key: alt.key, movesSrc: alt.moves });
      if (r.won) wins++;
      else notes.push((r.failing || []).join(' | ').slice(0, 160));
    }
    const ok = wins === REPS;
    if (!ok) fails++;
    console.log((ok ? 'PASS ' : 'FAIL ') + alt.key.padEnd(10) + ' · ' + alt.name + (ok ? '' : '\n       stuck on: ' + notes[0]));
  }
  console.log('\nALT PATHS: ' + (fails ? fails + ' FAILURE(S) of ' + ran : 'ALL ' + ran + ' PASS'));
  if (errs.length) { console.log('PAGE ERRORS: ' + errs.slice(0, 3).join(' · ')); fails++; }
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
