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
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const REPS = 3;
const only = process.argv.slice(2);

const ALTS = [
  { key: 'rowops', name: 'ctrl chords with shift+space rows (not the ribbon)', moves: `C => [
      {sel:'A3', keys:[{key:' ',shift:true},{key:'=',ctrl:true,shift:true}]},
      {sel:'A6', keys:[{key:' ',shift:true},{key:'-',ctrl:true}]},
    ]` },
  { key: 'polish', name: 'reversed order + ribbon bold (alt h 1)', moves: `C => { const o=C._o; return [
      {sel:o.h1+':'+o.h2, keys:[{key:'Alt'},L('h'),L('h'), {key:'Alt'},L('h'),L('b'),L('b'), {key:'Alt'},L('h'),D(1)]},
    ]; }` },
  { key: 'blocksel', name: 'move FIRST, reselect at the new address, ctrl+shift+! + ribbon bold', moves: `C => { const o=C._o; return [
      {sel:o.u0, keys:[{key:'ArrowDown',ctrl:true,shift:true},{key:'ArrowRight',ctrl:true,shift:true},{key:'x',ctrl:true}]},
      {sel:o.dst, keys:[{key:'v',ctrl:true}]},
      {sel:o.dst, keys:[{key:'ArrowDown',ctrl:true,shift:true},{key:'ArrowRight',ctrl:true,shift:true},{key:'!',ctrl:true,shift:true}]},
      {sel:o.t0, keys:[{key:'ArrowDown',ctrl:true,shift:true},{key:'ArrowRight',ctrl:true,shift:true},{key:'Alt'},L('h'),D(1)]},
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
  { key: 'pastes', name: 'deck values FIRST (pre-rescale numbers legal — end-state), ops via ctrl+alt+v route', moves: `C => { const o=C._o; return [
      {sel:o.dressed, keys:[{key:'c',ctrl:true}]},
      {sel:o.naked, keys:[{key:'v',ctrl:true,alt:true},L('t'),{key:'Enter'}]},
      {sel:o.helper, keys:[...T('1000'),{key:'Enter'}]},
      {sel:o.helper, keys:[{key:'c',ctrl:true}]},
      {sel:o.blk, keys:[{key:'Alt'},L('h'),L('v'),L('s'),L('i'),{key:'Enter'}]},
      {sel:o.totRng, keys:[{key:'c',ctrl:true}]},
      {sel:o.deck, keys:[{key:'Alt'},L('e'),L('s'),L('v'),{key:'Enter'}]},
    ]; }` },
  { key: 'filldr', name: '2D block FIRST (recalc closes it), ribbon fills, then sum + pull', moves: `C => { const o=C._o; return [
      {sel:o.mix0, keys:[...T('='+o.mixF),{key:'Enter'}]},
      {sel:'B11:B13', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
      {sel:o.blk, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:o.sum0, keys:[...T('=SUM(B5:B8)'),{key:'Enter'}]},
      {sel:o.sumRng, keys:[{key:'r',ctrl:true}]},
      {sel:o.pull0, keys:[...T('='+o.feed0),{key:'Enter'}]},
      {sel:o.pullRng, keys:[{key:'r',ctrl:true}]},
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
  { key: 'saves', name: 'blocks in reverse, ribbon bold + ctrl+shift+! comma routes', moves: `C => C._sites.slice().reverse().map(s => {
      const work = s.t==='done' ? [...T('done'),{key:'Enter'}] : (s.t==='bold' ? [{key:'Alt'},L('h'),D(1)] : [{key:'!',ctrl:true,shift:true}]);
      return {sel:s.cell, keys:[...work,{key:'s',ctrl:true}]};
    }) ` },
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
  { key: 'transpose', name: 'helper staged FIRST, ctrl+alt+v flip, multiply via alt h v s', moves: `C => { const o=C._o; return [
      {sel:o.helper, keys:[...T('-1'),{key:'Enter'}]},
      {sel:o.src, keys:[{key:'c',ctrl:true}]},
      {sel:o.dst, keys:[{key:'v',ctrl:true,alt:true},L('e'),{key:'Enter'}]},
      {sel:o.helper, keys:[{key:'c',ctrl:true}]},
      {sel:o.capexRng, keys:[{key:'Alt'},L('h'),L('v'),L('s'),L('m'),{key:'Enter'}]},
    ]; }` },
  { key: 'format', name: 'reversed order + ribbon percent + ALT O E for multiple/date', moves: `C => { const o=C._o; return [
      {sel:o.date, keys:[{key:'Alt'},L('o'),L('e'),L('d')]},
      {sel:o.mult, keys:[{key:'Alt'},L('o'),L('e'),L('x')]},
      {sel:o.com, keys:[{key:'!',ctrl:true,shift:true},{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
      {sel:o.cur, keys:[{key:'$',ctrl:true,shift:true},{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
      {sel:o.pct, keys:[{key:'Alt'},L('h'),L('p')]},
      {sel:o.pct.split(':')[1], keys:[{key:'Alt'},L('h'),D(0)]},
    ]; }` },
  { key: 'dress', name: 'footnote FIRST via alt o e, total row dressed mid-pass via ribbon routes', moves: `C => { const R=C._R; return [
      {sel:'A'+R.mRow, keys:[{key:'Alt'},L('o'),L('e'),L('e')]},
      {sel:'A1', keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('o')]},
      {sel:'A'+R.tRow+':E'+R.tRow, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('t')]},
      {sel:R.inpRange, keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
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
      {sel:'F5:H5', keys:[{key:'Alt'},L('h'),L('b'),L('t')]},
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
      {sel:'B6:E6', keys:[{key:'Alt'},L('h'),L('b'),L('t')]},
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
      {sel:'B14:C14', keys:[{key:'Alt'},L('h'),L('b'),L('t')]},
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
  { key: 'blue', name: 'scatter painted in REVERSE — loose singles before the blocks', moves: `C => { const s=C._scatter;
      const chord=[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}];
      return [
        {sel:s.s2, keys:chord},
        {sel:s.s1, keys:chord},
        {sel:s.b2.a+':'+s.b2.b, keys:chord},
        {sel:s.b1.a+':'+s.b1.b, keys:chord},
      ]; }` },
  { key: 'bsbuild', name: 'dress FIRST, RE roll before any footing, assets footed LAST, ribbon fills + alt h 1', moves: `C => [
      {sel:'B5:D5',   keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:'B11:D11', keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:'B14:D14', keys:[{key:'Alt'},L('h'),L('b'),L('t')]},
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
      {sel:'B14:E14', keys:[{key:'Alt'},L('h'),L('b'),L('t')]},
    ]` },
  { key: 'cases', name: 'switch flipped FIRST, sticky IF built into the downside, ribbon fill', moves: `C => [
      {sel:'B3',  keys:[...T('3'),{key:'Enter'}]},
      {sel:'C10', keys:[...T('=B10*(1+IF($B$3=1,$B$5,IF($B$3=2,$C$5,$D$5)))'),{key:'Enter'}]},
      {sel:'C10:F10', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
    ]` },
  { key: 'cfslink', name: 'rule the close FIRST, memo before the corkscrew, alt h p percent, bold last', moves: `C => [
      {sel:'B8:F8', keys:[{key:'Alt'},L('h'),L('b'),L('t')]},
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
      {sel:'D10', keys:[...T('=MIN(D3:D7)'),{key:'Enter'}]},
      {sel:'D9',  keys:[...T('=MAX(D3:D7)'),{key:'Enter'}]},
      {sel:'D8',  keys:[...T('=AVERAGE(D3:D7)'),{key:'Enter'}]},
    ]` },
  { key: 'covtable', name: 'read bottom-up — MIN first, flags before headroom, leverage last, ribbon fills', moves: `C => [
      {sel:'B11', keys:[...T('=MIN(B8:F8)'),{key:'Enter'}]},
      {sel:'B9',  keys:[...T('=IF(B8>=0,1,0)'),{key:'Enter'}]},
      {sel:'B9:F9', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B8',  keys:[...T('=B7-B6'),{key:'Enter'}]},
      {sel:'B8:F8', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B6',  keys:[...T('=B5/B4'),{key:'Enter'}]},
      {sel:'B6:F6', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
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
      {sel:'B6:F6', keys:[{key:'Alt'},L('h'),L('b'),L('t')]},
      {sel:'B9', keys:[...T(C._ratePct+'%'),{key:'Enter'}]},
      {sel:'B9', keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
    ]` },
  { key: 'isbuild', name: 'dress FIRST, statement built bottom-up (margin to COGS), alt h p + ribbon fills', moves: `C => [
      {sel:'B7:F7', keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:'B7:F7', keys:[{key:'Alt'},L('h'),L('b'),L('t')]},
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
  { key: 'modeltour', name: 'marks in REVERSE, dress rows 13->5 via alt h 1 + ctrl+1 C, home last', moves: `C => { const d=C._d.slice().reverse();
      const steps=d.map(x=>({sel:x.k, keys:[...T(String(x.v)),{key:'Enter'}]}));
      [13,9,5].forEach(r=>steps.push({sel:'B'+r+':J'+r, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('t'),{key:'1',ctrl:true},L('c')]}));
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
      {sel:'B7:F7', keys:[{key:'Alt'},L('h'),L('b'),L('t')]},
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
      {sel:'D5:E5', keys:[{key:'Alt'},L('h'),L('b'),L('t')]},
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
      {sel:'B14:D14', keys:[{key:'Alt'},L('h'),L('b'),L('t')]},
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
    ]` },
  { key: 'wk13', name: 'totals + dress FIRST, cushion before the spine, ribbon fills throughout', moves: `C => [
      {sel:'J4', keys:[...T('=SUM(B4:I4)'),{key:'Enter'}]},
      {sel:'J4:J6', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
      {sel:'B8:I8', keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:'B8:I8', keys:[{key:'Alt'},L('h'),L('b'),L('t')]},
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
      {sel:R.useIn,  keys:[{key:'Alt'},L('h'),L('h')]},
      {sel:R.srcIn,  keys:[{key:'Alt'},L('h'),L('h')]},
      {sel:R.useTot, keys:[...T('=SUM(E'+(r0+1)+':E'+(r0+4)+')'),{key:'Enter'}]},
      {sel:R.srcTot, keys:[...T('=SUM(B'+(r0+1)+':B'+(r0+4)+')'),{key:'Enter'}]},
      {sel:R.useTot, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('t')]},
      {sel:R.srcTot, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('t')]},
      {sel:R.useCol, keys:[{key:'!',ctrl:true,shift:true},{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
      {sel:R.srcCol, keys:[{key:'!',ctrl:true,shift:true},{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
      {sel:R.useCol, keys:[{key:'Alt'},L('h'),L('o'),L('i')]},
      {sel:R.srcCol, keys:[{key:'Alt'},L('h'),L('o'),L('i')]},
    ]; }` },
  { key: 'housestyle', name: 'reversed pass — rule EBITDA first, alt h p, ctrl+shift+!, title bolded last', moves: `C => { const R=C._R;
      const BLUE=[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}];
      const steps=[
        {sel:'B7:F7', keys:[{key:'Alt'},L('h'),D(1)]},
        {sel:'B7:F7', keys:[{key:'Alt'},L('h'),L('b'),L('t')]},
        {sel:'B8:F8', keys:[{key:'Alt'},L('h'),L('p')]},
        {sel:'B3:F7', keys:[{key:'!',ctrl:true,shift:true},{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
        {sel:R.override, keys:BLUE},
      ];
      R.inpRows.slice().reverse().forEach(r=>steps.push({sel:'B'+r+':F'+r, keys:BLUE}));
      steps.push({sel:'B2:F2', keys:[{key:'Alt'},L('h'),D(1)]});
      steps.push({sel:'B2:F2', keys:[{key:'Alt'},L('h'),L('b'),L('b')]});
      steps.push({sel:'A1', keys:[{key:'b',ctrl:true}]});
      return steps; }` },
  { key: 'ruleaudit', name: 'defects fixed in REVERSE (box first), alt h 1 for the bold, pull-through LAST', moves: `C => { const R=C._R;
      const W=(a,b,c2)=>[{key:'Alt'},L(a),L(b),L(c2)];
      const steps=[];
      if(R.defects.includes('box'))  steps.push({sel:R.focus, keys:W('h','b','o')});
      if(R.defects.includes('gbold'))steps.push({sel:'B'+R.g+':'+R.LC+R.g, keys:[{key:'Alt'},L('h'),D(1)]});
      if(R.defects.includes('gbt'))  steps.push({sel:'B'+R.g+':'+R.LC+R.g, keys:W('h','b','t')});
      if(R.defects.includes('sub2')) steps.push({sel:'B'+R.sub2+':'+R.LC+R.sub2, keys:W('h','b','t')});
      if(R.defects.includes('sub1')) steps.push({sel:'B'+R.sub1+':'+R.LC+R.sub1, keys:W('h','b','t')});
      if(R.defects.includes('hdr'))  steps.push({sel:'B2:'+R.LC+'2', keys:W('h','b','b')});
      steps.push({sel:R.mcol+R.g, keys:[...T('='+R.mcol+R.sub1+'+'+R.mcol+R.sub2),{key:'Enter'}]});
      return steps; }` },
  { key: 'ruleoff', name: 'EBITDA pulled FIRST via ribbon fill + alt h 1, rulings walked bottom-up, box last', moves: `C => { const R=C._R; return [
      {sel:'B'+R.g, keys:[...T('=B'+R.sub1+'+B'+R.sub2),{key:'Enter'}]},
      {sel:'B'+R.g+':'+R.LC+R.g, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B'+R.g+':'+R.LC+R.g, keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:'B'+R.g+':'+R.LC+R.g, keys:[{key:'Alt'},L('h'),L('b'),L('t')]},
      {sel:'B'+R.sub2+':'+R.LC+R.sub2, keys:[{key:'Alt'},L('h'),L('b'),L('t')]},
      {sel:'B'+R.sub1+':'+R.LC+R.sub1, keys:[{key:'Alt'},L('h'),L('b'),L('t')]},
      {sel:'B2:'+R.LC+'2', keys:[{key:'Alt'},L('h'),L('b'),L('b')]},
      {sel:R.focus, keys:[{key:'Alt'},L('h'),L('b'),L('o')]},
    ]; }` },
  { key: 'navigation', name: 'same tour, ribbon rows — alt h i r / alt h d r for the insert and delete legs', moves: `C => [
      {sel:'C4',    keys:[{key:'Home',ctrl:true}]},
      {sel:'A1',    keys:[{key:'ArrowRight',ctrl:true}]},
      {sel:'E1',    keys:[{key:'ArrowDown',ctrl:true}]},
      {sel:'E7',    keys:[{key:'ArrowLeft',ctrl:true}]},
      {sel:'A7',    keys:[{key:'ArrowUp',ctrl:true}]},
      {sel:'A1',    keys:[{key:'ArrowRight',ctrl:true,shift:true}]},
      {sel:'A1:E1', keys:[{key:'ArrowDown',ctrl:true,shift:true}]},
      {sel:'A1:E7', keys:[{key:' ',shift:true}]},
      {sel:'A1:J7', keys:[{key:'Alt'},L('h'),L('i'),L('r')]},
      {sel:'A1:J7', keys:[{key:'Alt'},L('h'),L('d'),L('r')]},
      {sel:'A1:J7', keys:[{key:' ',ctrl:true}]},
      {sel:'A1:A7', keys:[{key:'Home',ctrl:true}]},
    ]` },
  { key: 'cagr', name: 'blocks in reverse, winner flagged mid-run', moves: `C => {
      const w=C._sites.reduce((a,s)=>s.exp>a.exp?s:a,C._sites[0]);
      const steps=C._sites.slice().reverse().flatMap(s=>[
        {sel:s.col+s.ans, keys:[...T('=('+s.col+(s.r0+1)+'/'+s.col+s.r0+')^(1/'+s.col+(s.r0+2)+')-1'),{key:'Enter'}]},
        {sel:s.col+s.ans, keys:[{key:'%',ctrl:true,shift:true}]},
      ]);
      steps.push({sel:w.col+w.ans, keys:[{key:'Alt'},L('h'),D(1)]});
      return steps; }` },
  { key: 'ribbon', name: 'jobs in reverse + ctrl+b for the bold job', moves: `C => { const o=C._o; return [
      {sel:o.r, keys:[{key:'Alt'},L('h'),L('b'),L('b')]},
      {sel:o.c, keys:[{key:'Alt'},L('h'),L('a'),L('c')]},
      {sel:o.k, keys:[{key:'Alt'},L('h'),L('k')]},
      {sel:o.b, keys:[{key:'b',ctrl:true}]},
    ]; }` },
  // --- T-C realism-audit additions (r172): advanced-tier freedom proofs ---
  { key: 'wacc', name: 'debt side first — at-Kd before the beta chain', moves: `C => [
      {sel:'B13', keys:[...T('=B9*(1-B6)'),{key:'Enter'}]},
      {sel:'B10', keys:[...T('=B4/(1+(1-B6)*B5)'),{key:'Enter'}]},
      {sel:'B11', keys:[...T('=B10*(1+(1-B6)*B8/B7)'),{key:'Enter'}]},
      {sel:'B12', keys:[...T('=B2+B11*B3'),{key:'Enter'}]},
      {sel:'B14', keys:[...T('=(B7*B12+B8*B13)/(B7+B8)'),{key:'Enter'}]},
    ]` },
  { key: 'txncomps', name: 'SUM/5 instead of AVERAGE (either idiom lands)', moves: `C => [
      {sel:'D3', keys:[...T('=B3/C3'),{key:'Enter'}]},
      {sel:'D3:D7', keys:[{key:'d',ctrl:true}]},
      {sel:'D8', keys:[...T('=SUM(D3:D7)/5'),{key:'Enter'}]},
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
  { key: 'wirewalk', name: 'hop up, fix, ctrl+home — no return trip', moves: `C => { const o=C._o;
      const keys=[{key:'[',ctrl:true},{key:'[',ctrl:true}];
      for(let i=0;i<o.bi;i++) keys.push({key:'ArrowDown'});
      keys.push(...T(String(o.good)),{key:'Enter'},{key:'Home',ctrl:true});
      return [{sel:o.deck, keys:keys}]; }` },
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
  await page.goto('http://127.0.0.1:8791/index.html', { waitUntil: 'load' });
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
