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
  /* r424 (rowops absorbs colops, DEPTH_PASS §4.5/D17): both entries rebuilt for the merged
     structure drill. ALT 1 = chord-ROUTE alt (ribbon walks, partial selections — the ☆ is
     forfeited but core clears, §1.0(c)); ALT 2 = op-ORDER alt (deletes first, border last). */
  { key: 'rowops', name: 'RIBBON routes from partial selections (Alt H I/D R·C from a single cell — the re-cut ☆ is forfeited, all six cores clear), comma via ctrl+shift+1', moves: `C => { const o=C._o;
      const insAt=o.predRow0+1, fyL=colLetter(o.fyC);
      const jr2=o.junkRow0+(o.junkRow0>=insAt?1:0);
      const ni2=o.ni-(o.dc<o.ni?1:0);
      return [
        {sel:'A'+insAt, keys:[{key:' ',shift:true},{key:'Alt'},L('h'),L('i'),L('r')]},   // ribbon insert (full row is fine — the partial ops below break the ☆)
        {sel:'A'+(o.sr0+1)+':'+fyL+(o.sr0+1), keys:[{key:'c',ctrl:true}]},
        {sel:'A'+insAt, keys:[{key:'v',ctrl:true}]},
        {sel:'B'+insAt+':'+fyL+insAt, keys:[{key:'!',ctrl:true,shift:true}]},
        {sel:'B'+insAt+':'+colLetter(o.fyC-1)+insAt, keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
        {sel:'A'+jr2, keys:[{key:' ',shift:true},{key:'Alt'},L('h'),L('d'),L('r')]},
        {sel:'A'+o.totRow0+':'+fyL+o.totRow0, keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
        {sel:colLetter(o.dc)+(o.hr+1), keys:[{key:'Alt'},L('h'),L('d'),L('c')]},        // DRAFT dies from a SINGLE CELL — the ribbon's partial-selection path
        {sel:colLetter(ni2)+(o.hr+1), keys:[{key:'Alt'},L('h'),L('i'),L('c')]},         // the gap opens from a single cell too
        {sel:colLetter(o.sc)+o.q0+':'+colLetter(o.sc)+(o.q0+7), keys:[{key:'c',ctrl:true}]},
        {sel:colLetter(ni2)+o.hr, keys:[{key:'v',ctrl:true}]},
      ]; }` },
  { key: 'rowops', name: 'deletes FIRST (placeholder, then DRAFT), row insert into the contracted block, border LAST', moves: `C => { const o=C._o;
      const pred1=o.predRow0-(o.junkRow0<=o.predRow0?1:0);   // the early junk delete pulls the predecessor up when it sat above
      const insAt=pred1+1;
      const ni2=o.ni-(o.dc<o.ni?1:0);
      const totR=o.totRow0;                                   // −1 (junk) +1 (insert) nets back to build
      return [
        {sel:'A'+o.junkRow0, keys:[{key:' ',shift:true},{key:'-',ctrl:true}]},          // the squatter dies before anything else
        {sel:colLetter(o.dc)+o.hr, keys:[{key:' ',ctrl:true},{key:'-',ctrl:true}]},     // DRAFT out early — the staged line contracts in lockstep
        {sel:'A'+insAt, keys:[{key:' ',shift:true},{key:'+',ctrl:true}]},
        {sel:'A'+o.sr0+':'+colLetter(o.fyC-1)+o.sr0, keys:[{key:'c',ctrl:true}]},       // staged line: −1 junk, +1 insert → build row; one col narrower (DRAFT closed)
        {sel:'A'+insAt, keys:[{key:'v',ctrl:true}]},
        {sel:'B'+insAt+':'+colLetter(o.fyC-1)+insAt, keys:[{key:'Alt'},L('h'),L('k')]},
        {sel:'B'+insAt+':'+colLetter(o.fyC-2)+insAt, keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
        {sel:colLetter(ni2)+o.hr, keys:[{key:' ',ctrl:true},{key:'+',ctrl:true}]},
        {sel:colLetter(o.sc)+o.q0+':'+colLetter(o.sc)+(o.q0+7), keys:[{key:'c',ctrl:true}]},
        {sel:colLetter(ni2)+o.hr, keys:[{key:'v',ctrl:true}]},
        {sel:'A'+totR+':'+colLetter(o.fyC)+totR, keys:[{key:'Alt'},L('h'),L('b'),L('p')]},   // the border closes the page LAST
      ]; }` },
  /* r427 (blocksel ROUND 3, DEPTH_PASS §4.4): ALT 1 keeps the block-select chord (the ☆ route)
     but reorders + reroutes everything else; ALT 2 is the §1.0(c) FREEDOM proof for the re-cut
     ☆ — every block grabbed by walking plain Shift+arrow down the column, margins TYPED per
     cell as decimals, per-edge border walk. Every core clears; the ☆ must NOT fire. */
  { key: 'blocksel', name: 'cuts FIRST (Operating income before EBITDA), base via legacy Alt E S paste, bold via Alt H 1, center via Ctrl+1 A per header, margin typed then filled, hand-grabbed table + THICK box', moves: `C => { const O=C._o; return [
      {sel:O.opTL,        keys:[{key:'ArrowDown',ctrl:true,shift:true},{key:'x',ctrl:true}]},        // Operating income travels first this time
      {sel:O.o.opinc[0],  keys:[{key:'v',ctrl:true}]},
      {sel:O.ebTL,        keys:[{key:'ArrowDown',ctrl:true,shift:true},{key:'x',ctrl:true}]},
      {sel:O.o.ebitda[0], keys:[{key:'v',ctrl:true}]},
      {sel:O.baseTL,      keys:[{key:'ArrowRight',ctrl:true,shift:true},{key:'ArrowDown',ctrl:true,shift:true},{key:'c',ctrl:true}]},   // COPY base last
      {sel:O.o.seg[0],    keys:[{key:'Alt'},L('e'),L('s'),{key:'Enter'}]},                            // legacy paste dialog, All
      {sel:O.hdrRng,      keys:[{key:'Alt'},L('h'),D(1)]},                                            // bold via ribbon (Alt H 1)
      {sel:'A3',          keys:[{key:'1',ctrl:true},L('a')]},                                         // center across, one header at a time (Ctrl+1 → A)
      {sel:'B3',          keys:[{key:'1',ctrl:true},L('a')]},
      {sel:'C3',          keys:[{key:'1',ctrl:true},L('a')]},
      {sel:'D3',          keys:[{key:'1',ctrl:true},L('a')]},
      {sel:'E3',          keys:[{key:'1',ctrl:true},L('a')]},
      {sel:O.revRng,      keys:[{key:'Alt'},L('h'),L('a'),L('r')]},
      {sel:O.o.marg[0],   keys:[...T('='+O.o.ebitda[0]+'/'+O.o.rev[0]),{key:'Enter'}]},               // r427: margin seed…
      {sel:O.margRng,     keys:[{key:'d',ctrl:true}]},                                                // …filled down
      {sel:O.tableRng,    keys:[{key:'Alt'},L('h'),L('b'),L('t')]},                                   // hand-grabbed table (no Ctrl+A), THICK box — the perimeter grades the same
    ]; }` },
  { key: 'blocksel', name: 'SLOW GRAB: every block walked with plain shift+arrow (☆ forfeited, cores clear), dress LAST, margins TYPED as decimals, per-edge border walk Alt H B P/O/L/R', moves: `C => { const O=C._o; const N=O.o.seg.length;
      const dn=n=>{ const a=[]; for(let i=0;i<n;i++) a.push({key:'ArrowDown',shift:true}); return a; };
      return [
      {sel:O.baseTL,      keys:[{key:'ArrowRight',shift:true},...dn(N-1),{key:'c',ctrl:true}]},       // walked, not chorded — the ☆ route is skipped on purpose
      {sel:O.o.seg[0],    keys:[{key:'v',ctrl:true}]},
      {sel:O.ebTL,        keys:[...dn(N-1),{key:'x',ctrl:true}]},
      {sel:O.o.ebitda[0], keys:[{key:'v',ctrl:true}]},
      {sel:O.opTL,        keys:[...dn(N-1),{key:'x',ctrl:true}]},
      {sel:O.o.opinc[0],  keys:[{key:'v',ctrl:true}]},
      {sel:O.revRng,      keys:[{key:'Alt'},L('h'),L('a'),L('r')]},
      {sel:O.hdrRng,      keys:[{key:'Alt'},L('h'),L('a'),L('c'),{key:'b',ctrl:true}]},               // center then bold — reversed pair
      /* §1.0(c): typed percentages clear the margin beat — no formula anywhere. A bare number
         typed into a percent-formatted cell is read as a PERCENT (engine parity, index.html
         ~11279), so the alt types 24.3456 for a 0.243456 ratio. */
      {sel:O.o.marg[0],   keys:[...T((100*O.ebVals[0]/O.revVals[0]).toFixed(4)),{key:'Enter'}]},
      {sel:O.o.marg[1],   keys:[...T((100*O.ebVals[1]/O.revVals[1]).toFixed(4)),{key:'Enter'}]},
      {sel:O.o.marg[2],   keys:[...T((100*O.ebVals[2]/O.revVals[2]).toFixed(4)),{key:'Enter'}]},
      {sel:O.o.marg[3],   keys:[...T((100*O.ebVals[3]/O.revVals[3]).toFixed(4)),{key:'Enter'}]},
      {sel:'A3:E3',       keys:[{key:'Alt'},L('h'),L('b'),L('p')]},                                   // top edge
      {sel:'A7:E7',       keys:[{key:'Alt'},L('h'),L('b'),L('o')]},                                   // bottom edge
      {sel:'A3:A7',       keys:[{key:'Alt'},L('h'),L('b'),L('l')]},                                   // left edge
      {sel:'E3:E7',       keys:[{key:'Alt'},L('h'),L('b'),L('r')]},                                   // right edge — outside border assembled by hand
    ]; }` },
  { key: 'pastes', name: 'ctrl+alt+v transpose, right-align + THICK box on the deck row, scale row-by-row via alt h v s, costs TYPED negative (Freedom), ribbon unbold (chord-ROUTE alt)', moves: `C => { const o=C._o; const k=o.mode==='div'?'i':'m'; return [
      {sel:o.side, keys:[{key:'c',ctrl:true}]},
      {sel:o.feesRow.split(':')[0], keys:[{key:'v',ctrl:true,alt:true},L('e'),{key:'Enter'}]},
      {sel:o.feesRow, keys:[{key:'Alt'},L('h'),L('a'),L('r')]},                                  // r427: the new right-align beat — Alt H A R is the engine's only alignment route
      {sel:o.helperScale, keys:[{key:'c',ctrl:true}]},
      {sel:'B5:E5', keys:[{key:'Alt'},L('h'),L('v'),L('s'),L(k),{key:'Enter'}]},
      {sel:'B6:E6', keys:[{key:'Alt'},L('h'),L('v'),L('s'),L(k),{key:'Enter'}]},
      {sel:'B8', keys:[...T('-'+o.costVals[0]),{key:'Enter'}]},
      {sel:'C8', keys:[...T('-'+o.costVals[1]),{key:'Enter'}]},
      {sel:'D8', keys:[...T('-'+o.costVals[2]),{key:'Enter'}]},
      {sel:'E8', keys:[...T('-'+o.costVals[3]),{key:'Enter'}]},
      {sel:o.dressed, keys:[{key:'c',ctrl:true}]},
      {sel:o.sub, keys:[{key:'v',ctrl:true,alt:true},L('t'),{key:'Enter'}]},
      {sel:o.sub, keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:o.dressed, keys:[{key:'c',ctrl:true}]},
      {sel:o.deck, keys:[{key:'Alt'},L('e'),L('s'),L('v'),{key:'Enter'}]},
      {sel:o.deck, keys:[{key:'Alt'},L('h'),L('b'),L('t')]},                                    // r427: THICK box — the perimeter grades the same as Alt H B S (§1.0(c))
    ]; }` },
  /* r424 (pastes ROUND 2, DEPTH_PASS §4.3): op-ORDER alt — formats land on the undressed
     Subtotal FIRST (its live SUM only re-ties later; end-state grading must hold), then the
     sign flip, then the ☆ one-pass scale conversion (single-cell helper broadcast over the
     TWO-row selection — also the r419 paste-TILING regression: once per cell, never
     double-applied), transpose second-to-last, deck values last via ctrl+alt+v. */
  { key: 'pastes', name: 'formats FIRST + ctrl+b unbold, sign flip, ☆ one-pass scale over both rows (r419 tiling regression), transpose late, deck via ctrl+alt+v, deck box assembled edge-by-edge', moves: `C => { const o=C._o; const k=o.mode==='div'?'i':'m'; const dr=o.deck.match(/\\d+/)[0]; return [
      {sel:o.dressed, keys:[{key:'c',ctrl:true}]},
      {sel:o.sub, keys:[{key:'Alt'},L('e'),L('s'),L('t'),{key:'Enter'}]},
      {sel:o.sub, keys:[{key:'b',ctrl:true}]},
      {sel:o.helperSign, keys:[{key:'c',ctrl:true}]},
      {sel:o.costRow, keys:[{key:'v',ctrl:true,alt:true},L('m'),{key:'Enter'}]},
      {sel:o.helperScale, keys:[{key:'c',ctrl:true}]},
      {sel:o.scaleRows, keys:[{key:'Alt'},L('e'),L('s'),L(k),{key:'Enter'}]},
      {sel:o.side, keys:[{key:'c',ctrl:true}]},
      {sel:'B4', keys:[{key:'Alt'},L('e'),L('s'),L('e'),{key:'Enter'}]},
      {sel:o.feesRow, keys:[{key:'Alt'},L('h'),L('a'),L('r')]},                                  // r427: right-align walked LATE — end-state grading must hold
      {sel:o.dressed, keys:[{key:'c',ctrl:true}]},
      {sel:o.deck, keys:[{key:'v',ctrl:true,alt:true},L('v'),{key:'Enter'}]},
      {sel:o.deck, keys:[{key:'Alt'},L('h'),L('b'),L('p')]},                                     // r427: the deck box by hand — top edge…
      {sel:o.deck, keys:[{key:'Alt'},L('h'),L('b'),L('o')]},                                     // …bottom edge…
      {sel:'B'+dr, keys:[{key:'Alt'},L('h'),L('b'),L('l')]},                                     // …left edge…
      {sel:'E'+dr, keys:[{key:'Alt'},L('h'),L('b'),L('r')]},                                     // …right edge: any route that lands the perimeter grades
    ]; }` },
  /* r424 (filldr round 2, DEPTH_PASS §4.2): op-ORDER alt — FY column lands BEFORE the EBITDA
     row (its FY cell then arrives live off the fill-right and recalcs), fills ride the ribbon
     (Alt H F I D/R), and the ratio block goes the §1.0(c) SLOW way: four row formulas typed
     UNANCHORED, each filled right on its own. Every core clears; the ☆ census must NOT fire. */
  { key: 'filldr', name: 'FY before EBITDA (recalc closes the FY cell), ribbon fills, ratio rows typed per-row unanchored — the slow route: cores clear, no ☆', moves: `C => { const o=C._o; const rr=o.rr, p1=o.p1; return [
      {sel:o.pull0, keys:[...T('='+o.feed0),{key:'Enter'}]},
      {sel:o.pullRng, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:o.costBlk, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:o.fy0, keys:[...T('=SUM('+o.fyArg+')'),{key:'Enter'}]},
      {sel:o.fyRng, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
      {sel:o.sum0, keys:[...T('=SUM('+o.sumArg+')'),{key:'Enter'}]},
      {sel:o.sumRng, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:o.sumRng, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:'B'+p1, keys:[...T('=B'+(rr+1)+'/B'+rr),{key:'Enter'}]},
      {sel:'B'+p1+':F'+p1, keys:[{key:'r',ctrl:true}]},
      {sel:'B'+(p1+1), keys:[...T('=B'+(rr+2)+'/B'+rr),{key:'Enter'}]},
      {sel:'B'+(p1+1)+':F'+(p1+1), keys:[{key:'r',ctrl:true}]},
      {sel:'B'+(p1+2), keys:[...T('=B'+(rr+3)+'/B'+rr),{key:'Enter'}]},
      {sel:'B'+(p1+2)+':F'+(p1+2), keys:[{key:'r',ctrl:true}]},
      {sel:'B'+(p1+3), keys:[...T('=B'+o.er+'/B'+rr),{key:'Enter'}]},
      {sel:'B'+(p1+3)+':F'+(p1+3), keys:[{key:'r',ctrl:true}]},
    ]; }` },
  /* r424: chord-ROUTE alt — AutoSum (alt+=) for both totals, ribbon bold (Alt H 1) on the
     EBITDA dress, and the ratio block the ☆ way (one anchored seed, ctrl+d then ctrl+r) —
     the mastery route wins on a different chord set, canonical beat order. */
  { key: 'filldr', name: 'AutoSum route (alt+=) for both totals, ribbon bold (alt h 1) + top border, ratio block via the one-anchored-formula ☆ move', moves: `C => { const o=C._o; return [
      {sel:o.pull0, keys:[...T('='+o.feed0),{key:'Enter'}]},
      {sel:o.pullRng, keys:[{key:'r',ctrl:true}]},
      {sel:o.costBlk, keys:[{key:'r',ctrl:true}]},
      {sel:o.sum0, keys:[{key:'=',alt:true},{key:'Enter'}]},
      {sel:o.sumRng, keys:[{key:'r',ctrl:true}]},
      {sel:o.sumRng, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:o.fy0, keys:[{key:'=',alt:true},{key:'Enter'}]},
      {sel:o.fyRng, keys:[{key:'d',ctrl:true}]},
      {sel:o.mix0, keys:[...T('='+o.mixF),{key:'Enter'}]},
      {sel:o.mixCol, keys:[{key:'d',ctrl:true}]},
      {sel:o.ratioBlk, keys:[{key:'r',ctrl:true}]},
    ]; }` },
  /* r433 (foot DEPTH_PASS §4.22): the old single entry drove the retired fixed 4×4 board at B2.
     Two entries now, per §1.8 / DoD #4 — ALT 1 is a different chord ROUTE (ribbon fills, ribbon
     bold, ALL-borders instead of a top border, dialog percent-free) that still runs BOTH fills
     through the corner, so the re-cut ☆ must FIRE on a chord set the demo never presses; ALT 2 is
     a different op ORDER and the §1.0(c) FREEDOM proof — dress first, columns before rows, every
     total TYPED (the row totals as bare numbers, no formula anywhere in the block), the corner
     AutoSummed on its own and the tie check written against the ROW edge instead of the column.
     Every core clears; the ☆ must NOT fire, because neither fill reaches the corner. */
  { key: 'foot', name: 'RIBBON route with both fills carried through the corner (☆ still fires off Alt H F I D/R), ribbon bold, ALL borders on the total row, check written corner-minus-row', moves: `C => { const o=C._o; return [
      {sel:o.rowSeed, keys:[{key:'Alt'},L('m'),L('u'),L('s'),{key:'Enter'}]},        // Alt M U S — the other AutoSum ribbon route
      {sel:o.colRng,  keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},               // ribbon fill DOWN, through the corner
      {sel:o.colSeed, keys:[{key:'Alt'},L('h'),L('u'),L('s'),{key:'Enter'}]},
      {sel:o.rowRng,  keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},               // ribbon fill RIGHT, through the corner
      {sel:o.rowRng,  keys:[{key:'Alt'},L('h'),D(1)]},                               // ribbon bold (Alt H 1) — the same toggle by another route
      {sel:o.colRng,  keys:[{key:'Alt'},L('h'),D(1)]},                               // mixed selection (the corner is already bold) → Excel bolds ALL
      {sel:o.rowRng,  keys:[{key:'Alt'},L('h'),L('b'),L('a')]},                      // ALL borders draws the top edge too (§1.0-R3(p))
      {sel:o.chk,     keys:[...T('='+o.corner+'-SUM('+o.rowBody+')'),{key:'Enter'}]},// the corner against the ROW edge — the other legitimate cross-check
    ]; }` },
  { key: 'foot', name: 'SLOW + REVERSED: dress first, columns before rows, every total TYPED as a bare number (no formula in the block), corner AutoSummed alone — cores clear, ☆ forfeited', moves: `C => { const o=C._o; const cl=colLetter; return [
      {sel:o.rowRng, keys:[{key:'Alt'},L('h'),L('b'),L('p')]},                       // the rule lands before a single total exists — end-state grading must hold
      {sel:o.rowRng, keys:[{key:'b',ctrl:true}]},
      {sel:o.colRng, keys:[{key:'b',ctrl:true}]},
      ...o.colSum.map((w,j)=>({sel:cl(o.cq1+j)+o.rt, keys:[...T(String(w)),{key:'Enter'}]})),
      ...o.rowSum.map((w,i)=>({sel:o.CT+(o.r1+i),   keys:[...T(String(w)),{key:'Enter'}]})),
      {sel:o.corner, keys:[{key:'=',alt:true,code:'Equal'},{key:'Enter'}]},          // the corner totalled as a third act — the move the ☆ is hidden behind
      {sel:o.chk,    keys:[...T('='+o.corner+'-'+o.CT+o.r1+(o.rowSum.slice(1).map((_,i)=>'-'+o.CT+(o.r1+1+i)).join(''))),{key:'Enter'}]},
    ]; }` },
  /* r432: rebuilt onto the round-3 board (the old entry drove the retired 3-column comps page).
     Still the "reverse order" route, now with every dollar column taken SEPARATELY (☆ forfeited)
     and the read line ruled with ALL borders — which draws a top edge, so the dress beat grades
     the same as the Alt H B P route. */
  { key: 'decimals', name: 'columns walked in reverse order, dollar columns one at a time (☆ forfeited), ragged cell reset via Ctrl+1, read line ruled with ALL borders', moves: `C => { const o=C._o; return [
      {sel:'F'+o.r0+':F'+o.rN, keys:[{key:'Alt'},L('h'),D(9), {key:'Alt'},L('h'),D(9)]},
      {sel:'E'+o.r0+':E'+o.rN, keys:[{key:'Alt'},L('h'),D(0)]},
      {sel:'D'+o.r0+':D'+o.rN, keys:[{key:'Alt'},L('h'),D(9), {key:'Alt'},L('h'),D(9)]},
      {sel:'C'+o.r0+':C'+o.rN, keys:[{key:'Alt'},L('h'),D(9), {key:'Alt'},L('h'),D(9)]},
      {sel:'B'+o.r0+':B'+o.rN, keys:[{key:'Alt'},L('h'),D(9), {key:'Alt'},L('h'),D(9)]},
      {sel:o.defCell, keys:[{key:'1',ctrl:true}, L(o.defKind==='mult'?'x':'n')]},
      {sel:'A'+o.medR+':F'+o.medR, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('a')]},
    ]; }` },
  /* r424 (D17): the colops entry is gone with the drill — its column-op alternates live on
     inside the two rowops entries above (ribbon vs chord routes, insert-vs-delete order). */
  /* r433: both legacy anchor entries rebuilt onto the §4.23 board (the old ones drove _o.tl /
     _o.col, which the depth pass replaced, and stopped before the format/border/save beats). */
  { key: 'anchor', name: 'fill RIGHT first then DOWN (reversed fill order), dollars via ctrl+1 → C, ALL borders as the box', moves: `C => { const o=C._o; return [
      {sel:o.corner, keys:[...T('=$'+o.VC+o.r0+'*'+o.PC[0]+'$'+o.hr),{key:'Enter'}]},
      {sel:o.PC[0]+o.r0+':'+o.PC[2]+o.r0, keys:[{key:'r',ctrl:true}]},   // the seed ROW first…
      {sel:o.grid, keys:[{key:'d',ctrl:true}]},                          // …then the whole grid down
      {sel:o.grid, keys:[{key:'1',ctrl:true},L('c')]},                   // Format Cells → Currency, zero places
      {sel:o.grid, keys:[{key:'Alt'},L('h'),L('b'),L('a')]},             // ALL borders — carries the perimeter the beat asks for
    ]; }` },
  { key: 'anchor', name: 'POINT MODE + F4 — arrows grab both refs, F4 cycles the locks, ribbon dollars, outside box', moves: `C => { const o=C._o; return [
      {sel:o.corner, keys:[{key:'='},{key:'ArrowLeft'},{key:'F4'},{key:'F4'},{key:'F4'},{key:'*'},{key:'ArrowUp'},{key:'F4'},{key:'F4'},{key:'Enter'}]},
      {sel:o.col0, keys:[{key:'d',ctrl:true}]},
      {sel:o.grid, keys:[{key:'r',ctrl:true}]},
      {sel:o.grid, keys:[{key:'Alt'},L('h'),L('a'),L('n')]},
      {sel:o.grid, keys:[{key:'Alt'},L('h'),L('b'),L('s')]},
    ]; }` },
  /* r436 (sort depth pass, DEPTH_PASS §4.33). The pre-r436 entry ("foot and dress BEFORE
     sorting, single-column sort resolved via the WARNING") drove the RETIRED 3-check board —
     it read o.range / o.foot / o.sc off the old _o and there is no way to repair it into the
     new one, so it was DELETED rather than edited. Both entries below replace it.
     ALT 1 = different op ORDER + different chord ROUTE, and it KEEPS the ☆: the late deal is
     entered FIRST so ONE ranking does the whole job, the grab is the WHOLE-BLOCK right-then-down
     chord pair (the demo takes the single-column grab through the warning card instead — the
     r436 provenance latch stamps both, because the flag is read at the press and not after the
     expand rewrites the selection), the total is a hand-typed SUM, and the dress runs
     ribbon-only (Alt H 1 / Alt H B P).
     ALT 2 = the MEASURED NEGATIVE CONTROL for the ☆ (§1.0-R2(i) skippability): every grab
     walked down with plain Shift+arrow, ascending sorts run twice to land descending, the
     total typed as a chain of plus signs, bold via Alt H 1 and the border via Alt H B D. All
     five cores must clear and the star must stay DARK. */
  { key: 'sort', name: 'late deal FIRST so ONE ranking does it, WHOLE-BLOCK right-then-down chord grab instead of the warning card (the ☆ still fires), typed SUM, ribbon dress', moves: `C => { const o=C._o; return [
      {sel:o.lateCell, keys:[...T(o.lateName),{key:'Enter'}]},
      {sel:o.lateSizeCell, keys:[...T(String(o.lateSize)),{key:'Enter'}]},
      {sel:o.top, keys:[{key:'ArrowRight',ctrl:true,shift:true},{key:'ArrowDown',ctrl:true,shift:true},{key:'Alt'},L('a'),L('s'),L('d')]},
      {sel:o.foot, keys:[...T('=SUM('+o.SC+o.r1+':'+o.SC+(o.r1+6)+')'),{key:'Enter'}]},
      {sel:o.totRow, keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:o.totRow, keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
    ]; }` },
  { key: 'sort', name: 'NEGATIVE CONTROL for the ☆ — every block walked down with plain shift+arrow, two ASCENDING sorts, plus-chain total, Alt H 1 bold + Alt H B D border (five cores clear, star stays dark)', moves: `C => { const o=C._o;
      const walk=(n)=>{ const k=[]; for(let i=0;i<n;i++) k.push({key:'ArrowDown',shift:true}); return k; };
      return [
        // grab six rows by hand: right one column, then step down five — the ☆ route refused
        {sel:o.top, keys:[{key:'ArrowRight',shift:true}, ...walk(5), {key:'Alt'},L('a'),L('s'),L('a')]},
        {sel:o.top, keys:[{key:'ArrowRight',shift:true}, ...walk(5), {key:'Alt'},L('a'),L('s'),L('d')]},
        {sel:o.lateCell, keys:[...T(o.lateName),{key:'Enter'}]},
        {sel:o.lateSizeCell, keys:[...T(String(o.lateSize)),{key:'Enter'}]},
        {sel:o.top, keys:[{key:'ArrowRight',shift:true}, ...walk(6), {key:'Alt'},L('a'),L('s'),L('a')]},
        {sel:o.top, keys:[{key:'ArrowRight',shift:true}, ...walk(6), {key:'Alt'},L('a'),L('s'),L('d')]},
        {sel:o.foot, keys:[...T('='+o.SC+o.r1+'+'+o.SC+(o.r1+1)+'+'+o.SC+(o.r1+2)+'+'+o.SC+(o.r1+3)+'+'+o.SC+(o.r1+4)+'+'+o.SC+(o.r1+5)+'+'+o.SC+(o.r1+6)),{key:'Enter'}]},
        {sel:o.totRow, keys:[{key:'Alt'},L('h'),D(1)]},
        {sel:o.totRow, keys:[{key:'Alt'},L('h'),L('b'),L('d')]},
      ]; }` },
  /* r438 (series DEPTH PASS, DEPTH_PASS §4.43). The r169 entry that lived here — "dress first,
     series last" — drove `o.range`, a five-cell header on a board with no Ref column, no
     component lines and no indent beat. DELETED, not adapted: o.range no longer exists on any
     seed. Do not resurrect it. ALT 1 = chord-ROUTE alt (ribbon bold instead of Ctrl+B, both
     Series selections stretched one cell past the run, the indent taken in two passes, and the
     dress applied BEFORE the run is filled — the ☆ still fires). ALT 2 = op-ORDER alt AND the
     measured NEGATIVE CONTROL for the ☆: every value typed, nothing extended, all four cores
     clear and the star must stay DARK (65 keys against the star route's 42). */
  { key: 'series', name: 'chord-ROUTE: dress BEFORE the fill (ribbon bold Alt H 1), both Series runs selected one cell past the end, indent taken in two passes — the ☆ still fires', moves: `C => { const o=C._o; return [
      {sel:o.hdrRun,  keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('a'),L('r')]},
      {sel:o.hdrRun,  keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('s'),{key:'Enter'}]},
      {sel:o.RL+o.r1+':'+o.RL+(o.r1+o.NC), keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('s'),{key:'Enter'}]},
      {sel:o.LL+(o.r1+1)+':'+o.LL+(o.r1+3), keys:[{key:'Alt'},L('h'),D(6)]},
      {sel:o.LL+(o.r1+4)+':'+o.LL+(o.r1+o.NC), keys:[{key:'Alt'},L('h'),D(6)]},
    ]; }` },
  { key: 'series', name: 'NEGATIVE CONTROL / op-ORDER: indent first, every year and every line number TYPED, nothing extended — all four cores clear and the \u2606 must stay DARK', moves: `C => { const o=C._o;
      const yk=[]; for(let j=2;j<o.NY;j++){ yk.push(...T(String(o.y0+j))); yk.push(j===o.NY-1?{key:'Enter'}:{key:'Tab'}); }
      const rk=[]; for(let i=2;i<=o.NC;i++){ rk.push(...T(String(o.ref0*(i+1)))); rk.push({key:'Enter'}); }
      return [
      {sel:o.compRng, keys:[{key:'Alt'},L('h'),D(6)]},
      {sel:o.RL+(o.r1+2), keys:rk},
      {sel:o.yc[2]+o.hr, keys:yk},
      {sel:o.hdrRun, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('a'),L('r')]},
    ]; }` },
  // --- T-A tranche 2 additions (r170) ---
  /* r436 (lookup DEPTH PASS, DEPTH_PASS §4.38). The r170 entry that lived here — a single
     two-way INDEX typed into G4 against a 7-row table — drove the RETIRED board and was
     DELETED, not adapted: G4/A2:A8/B1:D1 no longer exist on any seed. Do not resurrect it.
     ALT 1 = chord-ROUTE alt: a locked VLOOKUP instead of INDEX/MATCH (the cores read VALUES,
     never formula text — §1.0-R3(p)), the ribbon's Alt H F I D instead of Ctrl+D, the font
     swatch walk instead of Cell Styles, the deck strip retyped instead of pasted, the THICK
     box instead of Alt H B S, and the deck repair before the dress. The ☆ still fires.
     ALT 2 = op-ORDER alt AND the measured NEGATIVE CONTROL for the ☆. */
  { key: 'lookup', name: 'chord-ROUTE: locked VLOOKUP instead of INDEX/MATCH, ribbon fill alt h f i d, deck strip retyped BEFORE the dress, font-swatch walk instead of Cell Styles, thick box instead of outside borders — the ☆ still fires', moves: `C => { const o=C._o;
      const vi=o.mL.charCodeAt(0)-o.LN.charCodeAt(0)+1;
      const tbl='$'+o.LN+'$'+o.r1+':$'+o.mL+'$'+o.rL;
      return [
        {sel:o.LPV+o.p0,  keys:[...T('=VLOOKUP('+o.LPL+o.p0+','+tbl+','+vi+',0)'),{key:'Enter'}]},
        {sel:o.ansRng,    keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
        {sel:o.deck,      keys:[...T('=VLOOKUP('+o.LPL+o.dRow+','+tbl+','+vi+',0)'),{key:'Enter'}]},
        {sel:o.ansRng,    keys:[{key:'Alt'},L('h'),L('f'),L('c'),
                                {key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},
                                {key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
        {sel:o.panel,     keys:[{key:'Alt'},L('h'),L('b'),L('t')]},
      ]; }` },
  { key: 'lookup', name: 'NEGATIVE CONTROL / op-ORDER: deck strip repaired FIRST, then the three screen amounts typed bottom-up as separate formulas with no fill anywhere, font-swatch walk, four per-edge border walks — all five cores clear, ☆ dark (163 keys against the demo’s 55)', moves: `C => { const o=C._o;
      const F=row=>'=INDEX('+o.mL+o.r1+':'+o.mL+o.rL+',MATCH('+o.LPL+row+','+o.LN+o.r1+':'+o.LN+o.rL+',0))';
      return [
        {sel:o.deck,     keys:[...T(F(o.dRow)),{key:'Enter'}]},
        {sel:o.LPV+o.p2, keys:[...T(F(o.p2)),{key:'Enter'}]},
        {sel:o.LPV+o.p1, keys:[...T(F(o.p1)),{key:'Enter'}]},
        {sel:o.LPV+o.p0, keys:[...T(F(o.p0)),{key:'Enter'}]},
        {sel:o.ansRng,   keys:[{key:'Alt'},L('h'),L('f'),L('c'),
                               {key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},
                               {key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
        {sel:o.LPL+o.hr+':'+o.LPV+o.hr,         keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
        {sel:o.LPL+(o.hr+4)+':'+o.LPV+(o.hr+4), keys:[{key:'Alt'},L('h'),L('b'),L('o')]},
        {sel:o.LPL+o.hr+':'+o.LPL+(o.hr+4),     keys:[{key:'Alt'},L('h'),L('b'),L('l')]},
        {sel:o.LPV+o.hr+':'+o.LPV+(o.hr+4),     keys:[{key:'Alt'},L('h'),L('b'),L('r')]},
      ]; }` },
  /* r437 (lookup2 ROUND 3, DEPTH_PASS §4.40 + the ⚠️ BINDING CONSTRAINT block): the r169 entry
     that used to live here ("header-inclusive ranges") was DELETED — it was hard-wired to the
     old G4 / B1:D6 board, which no longer exists. ALT 1 = chord-ROUTE alt: the three ranges are
     typed BARE and locked with F4 instead of typed with dollars, the block is bordered FIRST and
     with ALL borders rather than a top rule, and the pack cards are served p.9-before-p.4 — the
     ☆ still fires, because it grades the paste MECHANIC, not the order. ALT 2 = the NEGATIVE
     CONTROL and op-ORDER alt: three separately hand-typed UNLOCKED reads, no copy anywhere, the
     missing header entered LAST (so every read is #N/A until the final keystroke re-prices it),
     and each card bordered on its own with outside borders. All five cores clear; the ☆ must
     stay dark. Measured: 71-73 keys for ALT 1, 167 for ALT 2, against the demo's 76. */
  { key: 'lookup2', name: 'chord-ROUTE: bare ranges locked with F4 instead of typed dollars, ALL borders drawn FIRST and one card at a time, pack cards served p.9 before p.4 — the ☆ still fires', moves: `C => { const o=C._o;
      const g=o.gridR.replace(/[$]/g,''), sg=o.segR.replace(/[$]/g,''), qt=o.qtrR.replace(/[$]/g,'');
      return [
        {sel:o.AL+o.pr+':'+o.AV+o.pr, keys:[{key:'Alt'},L('h'),L('b'),L('a')]},           // the rule goes down before any read exists…
        {sel:o.BL+o.pr+':'+o.BV+o.pr, keys:[{key:'Alt'},L('h'),L('b'),L('a')]},           // …and ALL borders carries the top edge
        {sel:o.mCell, keys:[...T(o.mQ),{key:'Enter'}]},
        {sel:o.fRead, keys:[...T('=INDEX('+g),{key:'F4'},...T(',MATCH('+o.FV+o.hr+','+sg),{key:'F4'},
                             ...T(',0),MATCH('+o.FV+(o.hr+1)+','+qt),{key:'F4'},...T(',0))'),{key:'Enter'}]},
        {sel:o.fRead, keys:[{key:'c',ctrl:true}]},
        {sel:o.bRead, keys:[{key:'v',ctrl:true}]},                                        // p.9 lands first this time
        {sel:o.aRead, keys:[{key:'v',ctrl:true}]},
      ]; }` },
  { key: 'lookup2', name: 'NEGATIVE CONTROL / op-ORDER: three UNLOCKED reads hand-typed one at a time with no copy anywhere, the missing header entered LAST, each card bordered on its own — all five cores clear, ☆ dark (167 keys against the demo’s 76)', moves: `C => { const o=C._o;
      const g=o.gridR.replace(/[$]/g,''), sg=o.segR.replace(/[$]/g,''), qt=o.qtrR.replace(/[$]/g,'');
      const F=(sc,qc)=>'=INDEX('+g+',MATCH('+sc+','+sg+',0),MATCH('+qc+','+qt+',0))';
      return [
        {sel:o.aRead, keys:[...T(F(o.AV+o.pr, o.AV+(o.pr+1))),{key:'Enter'}]},            // p.4 repaired by retyping, before anything else
        {sel:o.bRead, keys:[...T(F(o.BV+o.pr, o.BV+(o.pr+1))),{key:'Enter'}]},
        {sel:o.fRead, keys:[...T(F(o.FV+o.hr, o.FV+(o.hr+1))),{key:'Enter'}]},            // still #N/A — its header is not on the board yet
        {sel:o.AL+o.pr+':'+o.AV+o.pr, keys:[{key:'Alt'},L('h'),L('b'),L('s')]},
        {sel:o.BL+o.pr+':'+o.BV+o.pr, keys:[{key:'Alt'},L('h'),L('b'),L('s')]},
        {sel:o.mCell, keys:[...T(o.mQ),{key:'Enter'}]},                                   // the header LAST: one commit re-prices the flash read
      ]; }` },
  { key: 'autofit', name: 'run BACKWARDS — totals first as typed addition chains, dress next, then widths right-to-left with the labels last (no fill, so no star)', moves: `C => { const o=C._o;
      const steps=[];
      for(let r=o.r0;r<=o.tr;r++)
        steps.push({sel:o.tcL+r, keys:[...T('='+o.qL[0]+r+'+'+o.qL[1]+r+'+'+o.qL[2]+r+'+'+o.qL[3]+r),{key:'Enter'}]});
      steps.push({sel:o.lc1L+o.tr+':'+o.tcL+o.tr, keys:[{key:'Alt'},L('h'),D(1)]});                    // ribbon bold, before any column is sized
      steps.push({sel:o.lc1L+o.tr+':'+o.tcL+o.tr, keys:[{key:'Alt'},L('h'),L('b'),L('p')]});
      steps.push({sel:o.tcL+o.hr, keys:[{key:'Alt'},L('h'),L('o'),L('i')]});
      steps.push({sel:o.qL[0]+o.hr+':'+o.qL[3]+o.hr, keys:[{key:'Alt'},L('h'),L('o'),L('w'),D(1),D(2),{key:'Enter'}]});
      steps.push({sel:o.lc1L+o.hr+':'+o.lc2L+o.hr, keys:[{key:'Alt'},L('h'),L('o'),L('i')]});          // the labels come last this time
      return steps; }` },
  { key: 'autofit', name: 'autosum totals (alt+= per line), whole-column ctrl+space selections, Total column sized by a TYPED width not a fit, ribbon bold', moves: `C => { const o=C._o;
      const steps=[];
      for(let r=o.r0;r<=o.tr;r++)   // Excel's RANGE autosum: select the line THROUGH its empty total cell, alt+= commits it
        steps.push({sel:o.qL[0]+r+':'+o.tcL+r, keys:[{key:'=',alt:true,code:'Equal'}]});
      steps.push({sel:o.lc1L+o.hr+':'+o.lc2L+o.hr, keys:[{key:' ',ctrl:true},{key:'Alt'},L('h'),L('o'),L('i')]});
      steps.push({sel:o.qL[0]+o.hr+':'+o.qL[3]+o.hr, keys:[{key:' ',ctrl:true},{key:'Alt'},L('h'),L('o'),L('w'),D(1),D(2),{key:'Enter'}]});
      steps.push({sel:o.tcL+o.hr, keys:[{key:' ',ctrl:true},{key:'Alt'},L('h'),L('o'),L('w'),D(1),D(6),{key:'Enter'}]});   // width 16 = 117px — wider than the grand total needs, and it reads the same
      steps.push({sel:o.lc1L+o.tr+':'+o.tcL+o.tr, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('p')]});
      return steps; }` },
  /* r431 (merged drill): FREEDOM route — the junk cleared FIRST, SCRATCH A restored by RETYPING
     every value instead of undoing, and both formula repairs written as explicit additions
     rather than SUM ranges. Every core beat still clears (§1.0(c) grades the end state), and
     the ☆ must NOT light: no undo ever ran, so the deepUndo latch cannot fire. */
  { key: 'editfix', name: 'junk FIRST, SCRATCH A retyped back (no undo at all — Freedom), additions not SUMs — cores clear, no star', moves: `C => { const o=C._o;
      const steps=[
        {sel:o.rightRng, keys:[{key:'Delete'}]},
        {sel:o.wrongRng, keys:[{key:'Delete'}]},
      ];
      o.aCells.forEach((k,i)=>steps.push({sel:k, keys:[...T(String(o.aVals[i])),{key:'Enter'}]}));
      steps.push({sel:o.typoCell,  keys:[...T(o.good),{key:'Enter'}]});
      steps.push({sel:o.badFyCell, keys:[...T('=B'+o.badRow+'+C'+o.badRow+'+D'+o.badRow),{key:'Enter'}]});
      steps.push({sel:o.totCell,   keys:[...T('=E5+E6+E7'),{key:'Enter'}]});
      return steps; }` },
  /* r431: chord-ROUTE alt — the clear walked through the ribbon clear menu (alt h e c,
     contents only) instead of Delete, and the ☆ taken on the OTHER redo chord
     (ctrl+shift+z, not ctrl+y). Same beats, different keys throughout. */
  { key: 'editfix', name: 'ribbon clear (alt h e c), deep undo + ctrl+shift+z redo (the star on the other chord)', moves: `C => { const o=C._o; return [
      {sel:o.typoCell,  keys:[...T(o.good),{key:'Enter'}]},
      {sel:o.badFyCell, keys:[...T('=SUM(B'+o.badRow+':D'+o.badRow+')'),{key:'Enter'}]},
      {sel:o.totCell,   keys:[...T('=SUM(E5:E7)'),{key:'Enter'}]},
      {sel:o.wrongRng,  keys:[{key:'Alt'},L('h'),L('e'),L('c')]},
      {sel:o.wrongRng,  keys:[{key:'z',ctrl:true}]},
      {sel:o.totCell,   keys:[{key:'z',ctrl:true},{key:'z',ctrl:true},{key:'z',ctrl:true}]},
      {sel:o.totCell,   keys:[{key:'z',ctrl:true,shift:true},{key:'z',ctrl:true,shift:true},{key:'z',ctrl:true,shift:true}]},
      {sel:o.rightRng,  keys:[{key:'Delete'}]},
    ]; }` },
  /* r438 (drill DEPTH PASS, DEPTH_PASS §4.42). The r169 entry that lived here — "values paste
     via the H V S dialog route" — drove the hard-coded B3:B8 site of the RETIRED board, which
     no seed produces now (the block anchors at A or B, the header row is 3 or 4, and the Draft
     working column can sit on either side of the send-out pair). DELETED, not adapted. Do not
     resurrect it. ALT 1 = chord-ROUTE alt: the tiled paste through the Ctrl+Alt+V dialog rather
     than Alt E S V, the feed cleared with Alt H E C rather than Del, and the blue pass moved
     ahead of the archive — the ☆ still fires. ALT 2 = op-ORDER alt AND the measured NEGATIVE
     CONTROL for the ☆: the archive served by its OWN second paste through the legacy Alt H V S
     dialog, so nothing is ever broadcast; all four cores clear and the star must stay DARK
     (31 keys against the star route's 21). */
  { key: 'drill', name: 'chord-ROUTE: the tiled values-paste through the Ctrl+Alt+V dialog, blue BEFORE the feed dies, feed cleared with Alt H E C instead of Del \u2014 the \u2606 still fires', moves: `C => { const o=C._o; return [
      {sel:o.finTop,  keys:[{key:'ArrowDown',ctrl:true,shift:true},{key:'c',ctrl:true},{key:'ArrowRight',shift:true},{key:'v',ctrl:true,alt:true},L('v'),{key:'Enter'}]},
      {sel:o.finRng,  keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
      {sel:o.feedRng, keys:[{key:'Alt'},L('h'),L('e'),L('c')]},
    ]; }` },
  { key: 'drill', name: 'NEGATIVE CONTROL / op-ORDER: the archive served by its own SECOND paste (legacy Alt H V S dialog), archive before the flatten, blue last \u2014 all four cores clear and the \u2606 must stay DARK', moves: `C => { const o=C._o; return [
      {sel:o.finTop,  keys:[{key:'ArrowDown',ctrl:true,shift:true},{key:'c',ctrl:true}]},
      {sel:o.sentRng, keys:[{key:'Alt'},L('h'),L('v'),L('s'),L('v'),{key:'Enter'}]},
      {sel:o.finRng,  keys:[{key:'Alt'},L('h'),L('v'),L('s'),L('v'),{key:'Enter'}]},
      {sel:o.feedRng, keys:[{key:'Delete'}]},
      {sel:o.finRng,  keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
    ]; }` },
  /* r436 (scrub ROUND 3, DEPTH_PASS §4.34): both entries rebuilt for the reworked drill — the
     old single entry drove the RETIRED board (o.range / o.foot no longer exist, the duplicate
     record and the dress beat did not exist, and it never touched the ☆) and was DELETED, not
     patched. ALT 1 is the chord-ROUTE alt and the drill's NEGATIVE CONTROL: every structure op
     on the Home ribbon, the sort through Excel's expand-the-selection warning card, the total
     TYPED — all five cores clear and the ☆ must stay dark (41 keys against the demo's 20).
     ALT 2 is the op-ORDER alt and the third delete route: the junk rows and the repeat are
     CLEARED, not deleted, then one sort re-forms the block, and the total comes off the Home
     ribbon's autosum (Alt H U S) instead of Alt+= — which must earn the same ☆. */
  { key: 'scrub', name: 'NEGATIVE CONTROL — ribbon deletes (Alt H D R) from single cells, sort via the expand-selection warning card, SUM typed by hand, bold via Alt H 1 (every core clears, the ☆ must stay dark)', moves: `C => { const o=C._o;
      const steps=[]; const top=o.hr+1;
      o.junkRows.slice().sort((a,b)=>b-a).forEach(r=>{ steps.push({sel:'A'+r, keys:[{key:'Alt'},L('h'),L('d'),L('r')]}); });
      steps.push({sel:'C'+top+':C'+(top+7), keys:[{key:'Alt'},L('a'),L('s'),L('d'),L('e')]});   // single-column sort → Excel's warning card → E expands to the block
      steps.push({sel:'A'+(top+o.dupRank+1), keys:[{key:'Alt'},L('h'),L('d'),L('r')]});
      steps.push({sel:'C'+(top+7), keys:[...T('=SUM(C'+top+':C'+(top+6)+')'),{key:'Enter'}]});  // typed, never autosum — this is what the ☆ is measured against
      steps.push({sel:'A'+(top+7)+':C'+(top+7), keys:[{key:'Alt'},L('h'),D(1)]});
      steps.push({sel:'A'+(top+7)+':C'+(top+7), keys:[{key:'Alt'},L('h'),L('b'),L('p')]});
      return steps; }` },
  { key: 'scrub', name: 'junk and the repeat CLEARED not deleted, ONE sort re-forms the block, total off the ribbon autosum (alt h u s)', moves: `C => { const o=C._o;
      const steps=[]; const top=o.hr+1, last=o.hr+11, foot=o.footRow;
      o.junkRows.forEach(r=>{ steps.push({sel:'A'+r+':C'+r, keys:[{key:'Delete'}]}); });
      steps.push({sel:'A'+o.dupRows[1]+':C'+o.dupRows[1], keys:[{key:'Delete'}]});
      steps.push({sel:'A'+top+':C'+last, keys:[{key:'Alt'},L('a'),L('s'),L('d')]});             // one sort: the four emptied rows part company with the deals
      steps.push({sel:'C'+top+':C'+foot, keys:[{key:'Alt'},L('h'),L('u'),L('s')]});             // the ribbon's autosum — same ☆ as alt+=
      steps.push({sel:'A'+foot+':C'+foot, keys:[{key:'b',ctrl:true}]});
      steps.push({sel:'A'+foot+':C'+foot, keys:[{key:'Alt'},L('h'),L('b'),L('p')]});
      return steps; }` },
  /* r437 (DEPTH_PASS §4.41): both entries rebuilt for the reworked recon board. The single
     pre-r437 entry ("typo fixed FIRST, diff before flags") was DELETED — it drove hard-coded
     C4/D10/E10/F4:F10 against a board that now anchors at column A or B with its header row at
     3 or 4, so it could not survive the randomization rebuild, and it predated the check cell
     entirely. ALT 1 = chord-ROUTE alt (VLOOKUP instead of INDEX/MATCH, ribbon fills, the legacy
     Alt E S paste dialog, a typed addition chain for the check — the ☆ still fires on the other
     paste chord). ALT 2 = op-ORDER alt AND the MEASURED negative control for the ☆. */
  { key: 'recon', name: 'chord-ROUTE: VLOOKUP instead of INDEX/MATCH, ribbon fills (alt h f i d), the deal carried by the legacy Alt E S dialog paste, check line as a typed addition chain instead of SUM — every core clears and the ☆ still fires', moves: `C => { const o=C._o;
      const chain='='+o.LD+o.r1; let s=chain;
      for(let r=o.r1+1;r<=o.rL;r++) s+='+'+o.LD+r;
      return [
        {sel:o.LFL+o.r1, keys:[...T('=COUNTIF('+o.cntR+','+o.LTN+o.r1+')'),{key:'Enter'}]},
        {sel:o.flagRng,  keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
        {sel:o.srcRng,   keys:[{key:'c',ctrl:true}]},
        {sel:o.LFN+o.rL, keys:[{key:'Alt'},L('e'),L('s'),{key:'Enter'}]},
        {sel:o.LD+o.r1,  keys:[...T('='+o.LFA+o.r1+'-VLOOKUP('+o.LFN+o.r1+',$'+o.LTN+'$'+o.r1+':$'+o.LTA+'$'+o.rL+',2,0)'),{key:'Enter'}]},
        {sel:o.dRng,     keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
        {sel:o.LFA+o.badRow, keys:[...T(String(o.badTrue)),{key:'Enter'}]},
        {sel:o.chk,      keys:[...T(s),{key:'Enter'}]},
      ]; }` },
  { key: 'recon', name: 'NEGATIVE CONTROL / op-ORDER: check line written FIRST over an empty column, repair before the carry, the missing deal TYPED, then every difference and every presence count hand-written bottom-up with no fill and no paste anywhere — all five cores clear, ☆ dark (20-seed median 474 keys against the demo’s flat 88)', moves: `C => { const o=C._o;
      const st=[];
      st.push({sel:o.chk, keys:[...T('=SUM('+o.LD+o.r1+':'+o.LD+o.rL+')'),{key:'Enter'}]});
      st.push({sel:o.LFA+o.badRow, keys:[...T(String(o.badTrue)),{key:'Enter'}]});
      st.push({sel:o.LFN+o.rL, keys:[...T(o.missName),{key:'Enter'}]});
      st.push({sel:o.LFA+o.rL, keys:[...T(String(o.missAmt)),{key:'Enter'}]});
      for(let r=o.rL;r>=o.r1;r--)
        st.push({sel:o.LD+r, keys:[...T('='+o.LFA+r+'-INDEX('+o.LTA+o.r1+':'+o.LTA+o.rL+',MATCH('+o.LFN+r+','+o.LTN+o.r1+':'+o.LTN+o.rL+',0))'),{key:'Enter'}]});
      for(let r=o.rL;r>=o.r1;r--)
        st.push({sel:o.LFL+r, keys:[...T('=COUNTIF('+o.LFN+o.r1+':'+o.LFN+o.rL+','+o.LTN+r+')'),{key:'Enter'}]});
      return st; }` },
  { key: 'filterpass', name: 'op ORDER: the graded status screen FIRST, its two figures typed, then the sector screen and back again (☆ lit — the toggle retires both screens)', moves: `C => { const o=C._o;
      const pick=(chips,keep)=>{ const pk=[{key:'ArrowDown',alt:true}];
        chips.forEach((v,i)=>{ if(v!==keep) pk.push({key:' '}); if(i<chips.length-1) pk.push({key:'ArrowRight'}); });
        pk.push({key:'Enter'}); return pk; };
      return [
        {sel:o.CT+o.hr, keys:[{key:'l',ctrl:true,shift:true}]},
        {sel:o.CT+o.hr, keys:pick(o.statChips,o.statusX)},
        {sel:o.CS+o.ansR2, keys:[...T(String(o.ans2)),{key:'Enter'}]},
        {sel:o.CS+o.ansR3, keys:[...T(String(o.ans3)),{key:'Enter'}]},
        {sel:o.CE+o.hr, keys:[{key:'l',ctrl:true,shift:true},{key:'l',ctrl:true,shift:true}]},
        {sel:o.CE+o.hr, keys:pick(o.sectChips,o.sectorA)},
        {sel:o.CS+o.ansR1, keys:[...T(String(o.ans1)),{key:'Enter'}]},
        {sel:o.CT+o.hr, keys:[{key:'l',ctrl:true,shift:true},{key:'l',ctrl:true,shift:true}]},
        {sel:o.CT+o.hr, keys:pick(o.statChips,o.statusX)},
      ]; }` },
  /* THE ☆ SKIPPABILITY PROOF, MEASURED (§1.0-R2(i), and the §2 headroom law). Identical work to
     the demo, except the first screen is walked BACK through its own picker chip by chip instead
     of being discarded with the toggle. Walked on the live engine: 30 keys against the demo's
     24, five of five cores GREEN, and S.filterClears never stamps — so the ☆ must stay DARK.
     If this entry ever earns the star, the latch has started reading something it should not. */
  { key: 'filterpass', name: 'NEGATIVE CONTROL — the sector picker walked back to All instead of the toggle (30 keys vs 24; every core clears, ☆ MUST stay dark)', moves: `C => { const o=C._o;
      const pick=(chips,keep)=>{ const pk=[{key:'ArrowDown',alt:true}];
        chips.forEach((v,i)=>{ if(v!==keep) pk.push({key:' '}); if(i<chips.length-1) pk.push({key:'ArrowRight'}); });
        pk.push({key:'Enter'}); return pk; };
      return [
        {sel:o.CE+o.hr, keys:[{key:'l',ctrl:true,shift:true}]},
        {sel:o.CE+o.hr, keys:pick(o.sectChips,o.sectorA)},
        {sel:o.CS+o.ansR1, keys:[...T(String(o.ans1)),{key:'Enter'}]},
        {sel:o.CE+o.hr, keys:pick(o.sectChips,o.sectorA)},   // every dropped chip switched back on
        {sel:o.CT+o.hr, keys:pick(o.statChips,o.statusX)},
        {sel:o.CS+o.ansR2, keys:[...T(String(o.ans2)),{key:'Enter'}]},
        {sel:o.CS+o.ansR3, keys:[...T(String(o.ans3)),{key:'Enter'}]},
      ]; }` },
  /* Different CHORD ROUTE (§1.8): the value picker is never opened. The filter is armed from the
     ribbon (Alt A T), both screens are built by hand-hiding every non-matching row with
     Shift+Space / Ctrl+9, and the first screen is put back with Ctrl+Shift+9. 39 keys against
     the demo's 24 — this is the "obvious slow route" the §2 headroom diagnostic measures against,
     and it clears all five cores, which is §1.0(c) freedom proved rather than asserted. */
  { key: 'filterpass', name: 'chord ROUTE — ribbon arm (alt a t) and both screens hand-hidden with shift+space / ctrl+9, no picker ever opened (39 keys, all cores clear, ☆ dark)', moves: `C => { const o=C._o;
      const steps=[{sel:o.CE+o.hr, keys:[{key:'Alt'},L('a'),L('t')]}];
      o.rows.filter(x=>x.sect!==o.sectorA).forEach(x=>{
        steps.push({sel:o.CD+x.r, keys:[{key:' ',shift:true},{key:'9',ctrl:true}]}); });
      steps.push({sel:o.CS+o.ansR1, keys:[...T(String(o.ans1)),{key:'Enter'}]});
      steps.push({sel:o.CD+(o.hr+1)+':'+o.CD+(o.hr+o.nD), keys:[{key:'(',ctrl:true,shift:true}]});
      o.rows.filter(x=>x.stat!==o.statusX).forEach(x=>{
        steps.push({sel:o.CD+x.r, keys:[{key:' ',shift:true},{key:'9',ctrl:true}]}); });
      steps.push({sel:o.CS+o.ansR2, keys:[...T(String(o.ans2)),{key:'Enter'}]});
      steps.push({sel:o.CS+o.ansR3, keys:[...T(String(o.ans3)),{key:'Enter'}]});
      return steps; }` },
  /* r431: the strike route is gone with r430's strike->red-font beat. Red is applied CELL BY
     CELL here (the demo does the whole range in one pass), so the per-cell path still grades. */
  { key: 'typeset', name: 'RIBBON routes — bold/unbold via Alt H 1, italics line-by-line via Alt H 2 (☆ forfeited, core clears), red applied cell by cell', moves: `C => { const o=C._o;
      const RED=[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}];
      return [
      {sel:'A2:D2', keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:o.wbRng, keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:'A'+o.m0, keys:[{key:'Alt'},L('h'),D(2)]},
      {sel:'A'+(o.m0+1), keys:[{key:'Alt'},L('h'),D(2)]},
      {sel:'A'+(o.m0+2), keys:[{key:'Alt'},L('h'),D(2)]},
      {sel:'A'+o.deadR, keys:RED}, {sel:'B'+o.deadR, keys:RED},
      {sel:'C'+o.deadR, keys:RED}, {sel:'D'+o.deadR, keys:RED},
      {sel:o.stamp, keys:[...T('=TODAY()'),{key:'Enter'}]},
    ]; }` },
  { key: 'typeset', name: 'reverse order — signed FIRST, red flag, one-pass memos, unbold, header bold LAST', moves: `C => { const o=C._o; return [
      {sel:o.stamp, keys:[...T('=TODAY()'),{key:'Enter'}]},
      {sel:o.deadRng, keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
      {sel:o.memoRng, keys:[{key:'i',ctrl:true}]},
      {sel:o.wbRng, keys:[{key:'b',ctrl:true}]},
      {sel:'A2:D2', keys:[{key:'b',ctrl:true}]},
    ]; }` },
  /* r432 (decimals ROUND 3, DEPTH_PASS §4.12). ALT 1 = chord-ROUTE alt: every column takes an
     ABSOLUTE format instead of the demo's relative Alt H 9/H 0 walk (Ctrl+1 → N sets comma at
     zero places, Ctrl+1 → X sets the multiple at one, Ctrl+Shift+% + Alt H 0 sets the margin),
     bold comes off the ribbon and the read line takes a top-AND-bottom rule. Two things this
     proves: the dollar beat accepts any money style at zero places, and an absolute pass over a
     whole column sweeps the planted four-decimal cell with it — beat 4 clears without ever being
     hunted. Three separate dollar selections, so the one-rectangle ☆ is forfeited and the drill
     still wins. ALT 2 = op-ORDER alt: read line dressed FIRST, dollars LAST, and the dollar pass
     is a full-COLUMN Ctrl+Space grab — which still lands inside the ☆'s rect test, so the star
     fires from a selection route the demo never uses. The ragged cell is then walked down with
     relative Alt H 9 steps (the other legal repair). */
  { key: 'decimals', name: 'ABSOLUTE formats per column (Ctrl+1 N / Ctrl+1 X / Ctrl+Shift+% + Alt H 0), ribbon bold, top+bottom rule — ☆ forfeited, the outlier is swept by the column pass', moves: `C => { const o=C._o; return [
      {sel:'B'+o.r0+':B'+o.rN, keys:[{key:'1',ctrl:true},L('n')]},
      {sel:'C'+o.r0+':C'+o.rN, keys:[{key:'1',ctrl:true},L('n')]},
      {sel:'D'+o.r0+':D'+o.rN, keys:[{key:'1',ctrl:true},L('n')]},
      {sel:'E'+o.r0+':E'+o.rN, keys:[{key:'1',ctrl:true},L('x')]},
      {sel:'F'+o.r0+':F'+o.rN, keys:[{key:'%',ctrl:true,shift:true},{key:'Alt'},L('h'),D(0)]},
      {sel:'A'+o.medR+':F'+o.medR, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('d')]},
    ]; }` },
  { key: 'decimals', name: 'read line dressed FIRST (outside-border route), margin then multiple, dollars LAST from a full-column Ctrl+Space grab (☆ still fires), ragged cell walked down with Alt H 9', moves: `C => { const o=C._o;
      const steps=(o.defKind==='mult')?4:2; const walk=[];
      for(let i=0;i<steps;i++) walk.push({key:'Alt'},L('h'),D(9));
      return [
      {sel:'A'+o.medR+':F'+o.medR, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('s')]},
      {sel:'F'+o.r0+':F'+o.rN, keys:[{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
      {sel:'E'+o.r0+':E'+o.rN, keys:[{key:'Alt'},L('h'),D(0)]},
      {sel:'B'+o.r0+':D'+o.r0, keys:[{key:' ',ctrl:true},{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
      {sel:o.defCell, keys:walk},
    ]; }` },
  /* r437 (unhide DEPTH PASS, DEPTH_PASS §4.37 — and the §4.35 grpfold merge). The pre-rework
     entry ("width fixed FIRST, ribbon unhide route, grouped while still hidden") is DELETED:
     it drove o.h1/o.h2, a single hidden span that the reworked board no longer has.
     ALT 1 = chord-ROUTE alt AND the ☆ negative control — every op that has a second route
     takes it (ribbon unhide gap by gap, autofit instead of the width dialog, Alt H 1 for bold),
     and the outline is folded ONE GROUP AT A TIME so the star must stay dark while all six
     cores clear (§1.0(c)). MEASURED 41 keys against the demo's 23.
     ALT 2 = op-ORDER alt — the page is dressed FIRST, the regions are grouped while their
     detail is STILL HIDDEN, the whole outline is folded in one pass, and only then is the hide
     lifted and the column widened. Proves the ☆ latch is order-blind (it still fires) and that
     beat 1 grades S.hiddenRows, not "did you unhide before you grouped". */
  { key: 'unhide', name: 'RIBBON routes throughout (Alt H O U O gap by gap, autofit not the width dialog, Alt H 1 bold) and the outline folded ONE GROUP AT A TIME — the ☆ is forfeited, all six cores clear', moves: `C => { const o=C._o;
      const steps=[];
      o.regions.filter(b=>b.hidden).forEach(b=>{
        steps.push({sel:'A'+(b.d1-1)+':A'+(b.d2+1), keys:[{key:'Alt'},L('h'),L('o'),L('u'),L('o')]}); });
      steps.push({sel:'B'+o.hr, keys:[{key:'Alt'},L('h'),L('o'),L('i')]});
      o.regions.forEach(b=>{
        steps.push({sel:'A'+b.d1+':A'+b.d2, keys:[{key:'ArrowRight',alt:true,shift:true}]});
        steps.push({sel:'A'+b.d1, keys:[{key:'Alt'},L('a'),L('h')]}); });
      steps.push({sel:'A'+o.regions[o.openI].rt, keys:[{key:'Alt'},L('a'),L('j')]});
      steps.push({sel:'A'+o.consolRow+':B'+o.consolRow, keys:[{key:'Alt'},L('h'),D(1)]});
      steps.push({sel:'A'+o.consolRow+':B'+o.consolRow, keys:[{key:'Alt'},L('h'),L('b'),L('p')]});
      return steps; }` },
  { key: 'unhide', name: 'Consolidated dressed FIRST, regions grouped while the detail is STILL HIDDEN, whole outline folded in one pass, hide lifted and column widened LAST (☆ still fires — the latch is order-blind)', moves: `C => { const o=C._o;
      const steps=[];
      steps.push({sel:'A'+o.consolRow+':B'+o.consolRow, keys:[{key:'b',ctrl:true}]});
      steps.push({sel:'A'+o.consolRow+':B'+o.consolRow, keys:[{key:'Alt'},L('h'),L('b'),L('p')]});
      o.regions.slice().reverse().forEach(b=>{
        steps.push({sel:'A'+b.d1+':A'+b.d2, keys:[{key:'ArrowRight',alt:true,shift:true}]}); });
      steps.push({sel:'A1', keys:[{key:'Alt'},L('a'),L('h')]});   // cursor clear of every group — the !hit branch shuts the whole outline in one pass
      steps.push({sel:'A'+o.regions[0].d1+':A'+o.regions[2].rt, keys:[{key:'9',ctrl:true,shift:true}]});
      steps.push({sel:'A'+o.regions[o.openI].rt, keys:[{key:'Alt'},L('a'),L('j')]});
      steps.push({sel:'B'+o.hr, keys:[{key:'Alt'},L('h'),L('o'),L('w'),{key:'1'},{key:'2'},{key:'Enter'}]});
      return steps; }` },
  { key: 'rollup', name: 'BACKWARDS + ribbon: cross-tab total over an empty grid, check written before it is true, ledger total before the crosses exist, grid filled LAST right-then-down via the ribbon, thick box closes — the ☆ still fires', moves: `C => { const o=C._o; return [
      {sel:o.gtCell,   keys:[...T('=SUM('+o.gridRng+')'),{key:'Enter'}]},             // totals an empty block: zero until the crosses land
      {sel:o.chkCell,  keys:[...T('='+o.LA+o.rLT+'-'+o.gtCell),{key:'Enter'}]},       // the check, reversed and not yet true
      {sel:o.LA+o.rLT, keys:[...T('=SUM('+o.LA+o.r1+':'+o.LA+o.rL+')'),{key:'Enter'}]},
      {sel:o.g0,       keys:[...T('=SUMIFS('+o.sumR+','+o.segR+',$'+o.LL+o.g1+','+o.regR+','+o.R0+'$'+o.hr+')'),{key:'Enter'}]},
      {sel:o.R0+o.g1+':'+o.Rn+o.g1, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},  // right FIRST, then down — the other fill order
      {sel:o.gridRng,  keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
      {sel:o.blockRng, keys:[{key:'Alt'},L('h'),L('b'),L('t')]},                      // the thick box closes the page (a fill would wipe it — see the note above)
    ]; }` },
  /* ALT 2 = the §1.0-R2(i) SKIPPABILITY PROOF, measured. Every cross hand-written with FULLY
     RELATIVE ranges, top-to-bottom, no fill anywhere; a quoted-text criterion is used for the
     first cross to prove that route too, and the block is boxed by figures only (no header row,
     no label column — the §1.0-R3(p) label-plus-figures widening). All FIVE cores clear and the
     ☆ must stay DARK. Measured over 9 seeds: 245-480 keys, median 337, against the demo's 76 —
     a 4.4x spread, which is the headroom the clock exists to show. Verified directly (win, all
     five cores, ☆ dark on 5/5 seeds), because this harness asserts only that a route WINS. */
  { key: 'rollup', name: 'NEGATIVE CONTROL — every cross hand-typed with fully relative ranges, one quoted-text criterion, no fill anywhere, figures-only box: five cores clear, ☆ DARK', moves: `C => { const o=C._o; const mv=[];
      mv.push({sel:o.LA+o.rLT, keys:[...T('=SUM('+o.LA+o.r1+':'+o.LA+o.rL+')'),{key:'Enter'}]});
      for(let i=0;i<o.nSeg;i++) for(let j=0;j<o.nReg;j++){
        const seg=S.cells[o.LL+(o.g1+i)].value, reg=S.cells[o.RC[j]+o.hr].value;
        const f=(i===0&&j===0)
          ? '=SUMIFS('+o.sumR+','+o.segR+',"'+seg+'",'+o.regR+',"'+reg+'")'                       // quoted-text criteria clear too
          : '=SUMIFS('+o.LA+o.r1+':'+o.LA+o.rL+','+o.LS+o.r1+':'+o.LS+o.rL+','+o.LL+(o.g1+i)+','+o.LG+o.r1+':'+o.LG+o.rL+','+o.RC[j]+o.hr+')';
        mv.push({sel:o.RC[j]+(o.g1+i), keys:[...T(f),{key:'Enter'}]}); }
      mv.push({sel:o.gridRng, keys:[{key:'Alt'},L('h'),L('b'),L('s')]});               // figures only — no header row, no label column
      mv.push({sel:o.gtCell,  keys:[...T('=SUM('+o.gridRng+')'),{key:'Enter'}]});
      mv.push({sel:o.chkCell, keys:[...T('='+o.gtCell+'-'+o.LA+o.rLT),{key:'Enter'}]});
      return mv; }` },
  { key: 'center', name: 'chord-ROUTE: shift+space/ctrl+space take the header row and the label column, bold via alt h 1, the header rule as an OUTSIDE border (alt h b s), title across from alt h o e → A — the one-pass ☆ still lands', moves: `C => { const o=C._o; return [
      {sel:'A'+o.hr,  keys:[{key:' ',shift:true},{key:'Alt'},L('h'),L('a'),L('c')]},   // whole ROW centered — column A rides along, ungraded
      {sel:'A'+o.r1,  keys:[{key:' ',ctrl:true},{key:'Alt'},L('h'),L('a'),L('l')]},    // whole COLUMN left — title + notes ride along
      {sel:o.blk,     keys:[{key:'Alt'},L('h'),L('a'),L('r')]},                        // one rectangle over the slumped quarter AND the Total row — the ☆
      {sel:o.tot,     keys:[{key:'Alt'},L('h'),D(1)]},                                 // ribbon bold
      {sel:o.hdrFull, keys:[{key:'Alt'},L('h'),L('b'),L('s')]},                        // outside border: on a one-row selection the perimeter IS the rule under the headers
      {sel:o.titleRng,keys:[{key:'Alt'},L('h'),L('o'),L('e'),L('a')]},                 // Format Cells via the Home ribbon, then center across
    ]; }` },
  { key: 'center', name: 'op-ORDER reversed: title across FIRST (ctrl+1 a), header rule as a top-and-bottom pair (alt h b d), bold before the alignment, figures right in TWO passes (☆ forfeited), headers centered last', moves: `C => { const o=C._o; return [
      {sel:o.titleRng, keys:[{key:'1',ctrl:true},L('a')]},
      {sel:o.hdrFull,  keys:[{key:'Alt'},L('h'),L('b'),L('d')]},                       // top AND bottom — the bottom edge is what the beat grades
      {sel:o.tot,      keys:[{key:'b',ctrl:true}]},
      {sel:o.sqL+o.r1+':'+o.sqL+(o.rt-1), keys:[{key:'Alt'},L('h'),L('a'),L('r')]},    // pass 1: the slumped quarter only
      {sel:'B'+o.rt+':'+o.lc+o.rt,        keys:[{key:'Alt'},L('h'),L('a'),L('r')]},    // pass 2: the Total row — two ops, no ☆
      {sel:o.lab,      keys:[{key:'Alt'},L('h'),L('a'),L('l')]},
      {sel:o.hdr,      keys:[{key:'Alt'},L('h'),L('a'),L('c')]},
    ]; }` },
  /* r446 (DEPTH_PASS §4.71 depth pass): BOTH entries rebuilt for the corkscrew board. The single
     pre-r446 entry ('MAX-outside nest, prove-outs bottom-up, border before bold via ribbon') is
     DELETED — it drove the retired 7-row board by hard-coded B2:E7 geometry, and its own dress
     leg (alt h b p after alt h 1) is now covered by ALT 1. Do not resurrect it on merge.
     ALT 1 = op-ORDER alt (☆ forfeited, all six cores clear — §1.0(c));
     ALT 2 = chord-ROUTE alt, and it deliberately walks the two routes that were UNTRIGGERABLE
     on the shipped board: an IF-shaped sweep (the old check read 'MIN(' out of formula text) and
     ALL borders (the old check demanded `bt`, which alt h b a never sets). Registered so neither
     can come back. */
  { key: 'revolver', name: 'op-ORDER reversed: sweep before draw, the cash line before the ending balance, an addition chain instead of SUM, the roll linked before the block exists, each row filled on its own (☆ forfeited), the dress LAST', moves: `C => { const o=C._o, R=o.R, SR={key:'ArrowRight',shift:true};
      return [
        {sel:o.CB+R.sw, keys:[...T('=-MIN('+o.CB+R.bb+',MAX(0,'+o.CB+R.cb+'-$'+o.CB+'$'+R.mc+'))'),{key:'Enter'}]},
        {sel:o.CB+R.dr, keys:[...T('=MAX(0,$'+o.CB+'$'+R.mc+'-'+o.CB+R.cb+')'),{key:'Enter'}]},
        {sel:o.CB+R.cp, keys:[...T('='+o.CB+R.cb+'+'+o.CB+R.dr+'+'+o.CB+R.sw),{key:'Enter'}]},
        {sel:o.CB+R.eb, keys:[...T('='+o.CB+R.bb+'+'+o.CB+R.dr+'+'+o.CB+R.sw),{key:'Enter'}]},
        {sel:o.CC+R.bb, keys:[...T('='+o.CB+R.eb),{key:'Enter'}]},
        {sel:o.CC+R.bb, keys:[SR,SR,{key:'r',ctrl:true}]},
        {sel:o.CB+R.dr, keys:[SR,SR,SR,{key:'r',ctrl:true}]},
        {sel:o.CB+R.sw, keys:[SR,SR,SR,{key:'r',ctrl:true}]},
        {sel:o.CB+R.eb, keys:[SR,SR,SR,{key:'r',ctrl:true}]},
        {sel:o.CB+R.cp, keys:[SR,SR,SR,{key:'r',ctrl:true}]},
        {sel:o.CB+R.eb, keys:[SR,SR,SR,{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]},
      ]; }` },
  { key: 'revolver', name: 'chord ROUTE: IF instead of MIN/MAX on both lines, ribbon bold (alt h 1) + ALL borders (alt h b a stores ball, never bt), every fill through the ribbon (alt h f i r) — the block grab still earns the ☆', moves: `C => { const o=C._o, R=o.R, SR={key:'ArrowRight',shift:true}, SD={key:'ArrowDown',shift:true};
      const FR=[{key:'Alt'},L('h'),L('f'),L('i'),L('r')];
      return [
        {sel:o.CB+R.dr, keys:[...T('=IF($'+o.CB+'$'+R.mc+'>'+o.CB+R.cb+',$'+o.CB+'$'+R.mc+'-'+o.CB+R.cb+',0)'),{key:'Enter'}]},
        {sel:o.CB+R.sw, keys:[...T('=-IF('+o.CB+R.cb+'-$'+o.CB+'$'+R.mc+'>'+o.CB+R.bb+','+o.CB+R.bb+',MAX(0,'+o.CB+R.cb+'-$'+o.CB+'$'+R.mc+'))'),{key:'Enter'}]},
        {sel:o.CB+R.eb, keys:[...T('=SUM('+o.CB+R.bb+':'+o.CB+R.sw+')'),{key:'Enter'}]},
        {sel:o.CB+R.eb, keys:[SR,SR,SR,{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('a')]},
        {sel:o.CC+R.bb, keys:[...T('='+o.CB+R.eb),{key:'Enter'}]},
        {sel:o.CC+R.bb, keys:[SR,SR,...FR]},
        {sel:o.CB+R.dr, keys:[SR,SR,SR,SD,SD,...FR]},
        {sel:o.CB+R.cp, keys:[...T('='+o.CB+R.cb+'+'+o.CB+R.dr+'+'+o.CB+R.sw),{key:'Enter'}]},
        {sel:o.CB+R.cp, keys:[SR,SR,SR,...FR]},
      ]; }` },
  /* r444 (waterfall depth pass, DEPTH_PASS §4.72): three entries, replacing the one pre-pass
     entry, which was written against the retired ROWS:14 geometry.
     ALT 1 = chord-ROUTE alt — every fill walked from the ribbon (Alt H F I R), bold via Alt H 1,
     the rule via Alt H B A, and the ☆ earned through the Alt H V S paste-special dialog set to
     Formulas rather than Ctrl+V (§1.0(c): the star is graded off the MECHANIC, so every paste
     route that TRANSLATES must earn it. Note there is no Alt H V F — Alt H V offers only Values
     and Paste-special, and the first cut of this entry assumed otherwise and went red).
     ALT 2 = op-ORDER alt AND the untriggerable-beat regression: the whole cascade is built and
     filled BEFORE the cash row that feeds it exists (every dependent recalculates when the SUMs
     land), both corkscrews and the dress come last, and the rationing is written as an IF, not a
     MIN — the shape the pre-pass predicate locked out by demanding the literal 'MIN(' out of
     formula text. The ☆ still fires, because the junior block is still reached by a copy.
     ALT 3 = the §1.0-R2(i) SKIPPABILITY CONTROL and the ☆-headroom denominator: every year-cell
     typed on its own, no fill and no paste anywhere on the board, the dress walked cell by cell —
     all six cores clear and the ☆ must stay DARK.
     MEASURED, 3 seeds each, in the r444 worktree: ALT 1 median 101 keys (☆ 3/3) · ALT 2 median
     103 (☆ 3/3) · ALT 3 median 209 (☆ 0/3). The demo is 73. */
  { key: 'waterfall', name: 'RIBBON routes throughout (Alt H F I R fills, Alt H 1 bold, Alt H B A rule) and the ☆ earned by the Alt H V S paste-special dialog set to Formulas', moves: `C => { const o=C._o, R=n=>Array(n).fill({key:'ArrowRight',shift:true}); return [
      {sel:o.CB+o.rCF, keys:[...T('=SUM('+o.CB+o.rEB+':'+o.CB+o.rWC+')'), {key:'Enter'}]},
      {sel:o.CB+o.rCF, keys:[...R(2), {key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:o.CA+o.rCF, keys:[...R(3), {key:'Alt'},L('h'),D(1), {key:'Alt'},L('h'),L('b'),L('a')]},
      {sel:o.CB+o.rSP, keys:[...T('=MIN('+o.CB+o.rCF+','+o.CB+o.rSB+')'), {key:'Enter'}]},
      {sel:o.CB+o.rSE, keys:[...T('='+o.CB+o.rSB+'-'+o.CB+o.rSP), {key:'Enter'}]},
      {sel:o.CB+o.rSP, keys:[...R(2), {key:'ArrowDown',shift:true}, {key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:o.CC+o.rSB, keys:[...T('='+o.CB+o.rSE), {key:'Enter'}]},
      {sel:o.CC+o.rSB, keys:[...R(1), {key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:o.CB+o.rCA, keys:[...T('='+o.CB+o.rCF+'-'+o.CB+o.rSP), {key:'Enter'}]},
      {sel:o.CB+o.rCA, keys:[...R(2), {key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:o.CB+o.rSP, keys:[...R(2), {key:'ArrowDown',shift:true}, {key:'c',ctrl:true}]},
      {sel:o.CB+o.rJP, keys:[{key:'Alt'},L('h'),L('v'),L('s'),L('f'),{key:'Enter'}]},
      {sel:o.CC+o.rJB, keys:[...T('='+o.CB+o.rJE), {key:'Enter'}]},
      {sel:o.CC+o.rJB, keys:[...R(1), {key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
    ]; }` },
  { key: 'waterfall', name: 'BOTTOM-UP op order — the tranches built and filled before the cash row that feeds them exists, both corkscrews and the dress last, rationing written as an IF not a MIN', moves: `C => { const o=C._o, R=n=>Array(n).fill({key:'ArrowRight',shift:true}); return [
      {sel:o.CB+o.rSP, keys:[...T('=IF('+o.CB+o.rCF+'<'+o.CB+o.rSB+','+o.CB+o.rCF+','+o.CB+o.rSB+')'), {key:'Enter'}]},
      {sel:o.CB+o.rSE, keys:[...T('='+o.CB+o.rSB+'-'+o.CB+o.rSP), {key:'Enter'}]},
      {sel:o.CB+o.rSP, keys:[...R(2), {key:'ArrowDown',shift:true}, {key:'r',ctrl:true}]},
      {sel:o.CB+o.rCA, keys:[...T('='+o.CB+o.rCF+'-'+o.CB+o.rSP), {key:'Enter'}]},
      {sel:o.CB+o.rCA, keys:[...R(2), {key:'r',ctrl:true}]},
      {sel:o.CB+o.rSP, keys:[...R(2), {key:'ArrowDown',shift:true}, {key:'c',ctrl:true}]},
      {sel:o.CB+o.rJP, keys:[{key:'v',ctrl:true}]},
      {sel:o.CC+o.rJB, keys:[...T('='+o.CB+o.rJE), {key:'Enter'}]},
      {sel:o.CD+o.rJB, keys:[...T('='+o.CC+o.rJE), {key:'Enter'}]},
      {sel:o.CC+o.rSB, keys:[...T('='+o.CB+o.rSE), {key:'Enter'}]},
      {sel:o.CD+o.rSB, keys:[...T('='+o.CC+o.rSE), {key:'Enter'}]},
      {sel:o.CD+o.rCF, keys:[...T('=SUM('+o.CD+o.rEB+':'+o.CD+o.rWC+')'), {key:'Enter'}]},
      {sel:o.CB+o.rCF, keys:[...T('=SUM('+o.CB+o.rEB+':'+o.CB+o.rWC+')'), {key:'Enter'}]},
      {sel:o.CC+o.rCF, keys:[...T('=SUM('+o.CC+o.rEB+':'+o.CC+o.rWC+')'), {key:'Enter'}]},
      {sel:o.CA+o.rCF, keys:[...R(3), {key:'b',ctrl:true}, {key:'Alt'},L('h'),L('b'),L('s')]},
    ]; }` },
  { key: 'waterfall', name: 'SLOWEST LEGAL ROUTE, the ☆-skippability control (§1.0-R2(i)): every year-cell typed on its own, no fill and no paste anywhere on the board, the dress walked cell by cell — all six cores clear, ☆ forfeited', moves: `C => { const o=C._o, out=[], Y=[o.CB,o.CC,o.CD];
      for(let i=0;i<3;i++) out.push({sel:Y[i]+o.rCF, keys:[...T('=SUM('+Y[i]+o.rEB+':'+Y[i]+o.rWC+')'), {key:'Enter'}]});
      for(let i=0;i<3;i++) out.push({sel:Y[i]+o.rCF, keys:[{key:'b',ctrl:true}, {key:'Alt'},L('h'),L('b'),L('p')]});
      for(let i=0;i<3;i++) out.push({sel:Y[i]+o.rSP, keys:[...T('=MIN('+Y[i]+o.rCF+','+Y[i]+o.rSB+')'), {key:'Enter'}]});
      for(let i=0;i<3;i++) out.push({sel:Y[i]+o.rSE, keys:[...T('='+Y[i]+o.rSB+'-'+Y[i]+o.rSP), {key:'Enter'}]});
      for(let i=1;i<3;i++) out.push({sel:Y[i]+o.rSB, keys:[...T('='+Y[i-1]+o.rSE), {key:'Enter'}]});
      for(let i=0;i<3;i++) out.push({sel:Y[i]+o.rCA, keys:[...T('='+Y[i]+o.rCF+'-'+Y[i]+o.rSP), {key:'Enter'}]});
      for(let i=0;i<3;i++) out.push({sel:Y[i]+o.rJP, keys:[...T('=MIN('+Y[i]+o.rCA+','+Y[i]+o.rJB+')'), {key:'Enter'}]});
      for(let i=0;i<3;i++) out.push({sel:Y[i]+o.rJE, keys:[...T('='+Y[i]+o.rJB+'-'+Y[i]+o.rJP), {key:'Enter'}]});
      for(let i=1;i<3;i++) out.push({sel:Y[i]+o.rJB, keys:[...T('='+Y[i-1]+o.rJE), {key:'Enter'}]});
      return out; }` },
  /* r444 (accdil depth pass, DEPTH_PASS §4.65): the shipped entry — "shares side FIRST, drag
     last-but-one, typed addition instead of SUM()" — is DELETED, not patched. It drove the
     one-structure board's fixed cells B7/B8/B11/B12/B13/B14, and no seed produces that geometry
     now (the board is three structures on a 20-row sheet with corner jitter). Replaced by the
     §1.8 pair plus the measured negative control. ALT 1 = chord ROUTE (point mode + F4 instead of
     typed anchors, the ribbon's fill-right, the ribbon percent walk) and it LIGHTS the ☆;
     ALT 2 = op ORDER (shares first, an addition chain, the headline dressed before the block
     travels, and the block carried by CLIPBOARD rather than a fill) and it lights the ☆ too;
     ALT 3 = the NEGATIVE CONTROL for the ☆ — fifteen formulas typed cell by cell, nothing filled
     and nothing pasted: all six cores clear and the star must stay DARK. */
  { key: 'accdil', name: 'chord ROUTE: point-mode + F4 references instead of typed anchors, the ribbon fill-right (alt h f i r), percent by alt h p plus a decimal step — the ☆ still fires', moves: `C => { const o=C._o;
      const up=n=>Array(n).fill({key:'ArrowUp'}), dn=n=>Array(n).fill({key:'ArrowDown'});
      return [
        {sel:o.CB+o.rD, keys:[...T('=-'), ...up(o.rD-o.rC), ...T('*'), ...dn(o.rY-o.rD), {key:'F4'}, Kb.enter]},
        {sel:o.CB+o.rN, keys:[...T(o.fN), Kb.enter]},
        {sel:o.CB+o.rS, keys:[...T('='), ...dn(o.rAS-o.rS), {key:'F4'}, ...T('+'), ...up(o.rS-o.rNS), Kb.enter]},
        {sel:o.CB+o.rE, keys:[...T('='), ...up(o.rE-o.rN), ...T('/'), ...up(o.rE-o.rS), Kb.enter]},
        {sel:o.CB+o.rA, keys:[...T('='), ...up(o.rA-o.rE), ...T('/'), ...dn(o.rSE-o.rA), {key:'F4'}, ...T('-1'), Kb.enter]},
        {sel:o.CB+o.rD+':'+o.CD+o.rA, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
        {sel:o.CB+o.rA+':'+o.CD+o.rA, keys:[{key:'Alt'},L('h'),L('p'),{key:'Alt'},L('h'),L('0')]},
      ]; }` },
  { key: 'accdil', name: 'op ORDER: shares side FIRST, addition chain instead of SUM(), the accretion line dressed BEFORE the block travels (ctrl+shift+% then alt h 0), block carried by COPY/PASTE instead of a fill — the ☆ still fires', moves: `C => { const o=C._o; return [
      {sel:o.CB+o.rS, keys:[...T(o.fS), Kb.enter]},
      {sel:o.CB+o.rD, keys:[...T('=-'+o.CB+o.rC+'*$'+o.CB+'$'+o.rY), Kb.enter,
                            ...T('=$'+o.CB+'$'+o.rAN+'+$'+o.CB+'$'+o.rTN+'+$'+o.CB+'$'+o.rSY+'+'+o.CB+o.rD), Kb.enter]},
      {sel:o.CB+o.rE, keys:[...T(o.fE), Kb.enter, ...T(o.fA), Kb.enter]},
      {sel:o.CB+o.rA, keys:[{key:'%',ctrl:true,shift:true},{key:'Alt'},L('h'),L('0')]},
      {sel:o.CB+o.rD+':'+o.CB+o.rA, keys:[Kb.copy]},
      {sel:o.CC+o.rD+':'+o.CD+o.rA, keys:[Kb.paste]},
    ]; }` },
  { key: 'accdil', name: 'NEGATIVE CONTROL for the ☆: all fifteen formulas typed cell by cell, nothing filled and nothing pasted, ribbon percent walk per column — all six cores clear and the ☆ must stay DARK (192 keys against the demo’s 66)', moves: `C => { const o=C._o; const mv=[];
      const F=(C2,r)=>({ [o.rD]:'=-'+C2+o.rC+'*$'+o.CB+'$'+o.rY,
                         [o.rN]:'=$'+o.CB+'$'+o.rAN+'+$'+o.CB+'$'+o.rTN+'+$'+o.CB+'$'+o.rSY+'+'+C2+o.rD,
                         [o.rS]:'=$'+o.CB+'$'+o.rAS+'+'+C2+o.rNS,
                         [o.rE]:'='+C2+o.rN+'/'+C2+o.rS,
                         [o.rA]:'='+C2+o.rE+'/$'+o.CB+'$'+o.rSE+'-1' }[r]);
      o.CS.forEach(C2=>{ [o.rD,o.rN,o.rS,o.rE,o.rA].forEach(r=>{
        mv.push({sel:C2+r, keys:[...T(F(C2,r)), Kb.enter]}); }); });
      o.CS.forEach(C2=>{ mv.push({sel:C2+o.rA, keys:[{key:'Alt'},L('h'),L('p'),{key:'Alt'},L('h'),L('0')]}); });
      return mv; }` },
  { key: 'audit', name: 'chord ROUTE — addition-chain Total, ribbon fill Alt H F I R over the block, anchored margin refs, padded " OK " sign-off (☆ LIT, 47 keys)', moves: `C => { const o=C._o, CL=c=>colLetter(c);
      const chain=[]; for(let c=o.c0;c<=o.cN;c++) chain.push(CL(c)+o.badRow);
      return [
        {sel:o.badK,     keys:[...T('='+chain.join('+')),{key:'Enter'}]},
        {sel:o.blockTop, keys:[{key:'ArrowDown',shift:true},...Array.from({length:o.NC-1},()=>({key:'ArrowRight',shift:true})),{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
        {sel:o.margK,    keys:[...T(o.margFix.replace(/([A-J])(\d+)/g,'$$$1$$$2')),{key:'Enter'}]},
        {sel:o.signK,    keys:[...T(' OK '),{key:'Enter'}]},
      ]; }` },
  { key: 'audit', name: 'op ORDER + the MEASURED NEGATIVE CONTROL — sign-off first, then the margin, then each EBIT cell typed on its own, the short Total last; no fill and no paste anywhere (all five cores clear, ☆ DARK, 46 keys)', moves: `C => { const o=C._o, CL=c=>colLetter(c);
      const st=[{sel:o.signK, keys:[...T('OK'),{key:'Enter'}]},
                {sel:o.margK, keys:[...T(o.margFix),{key:'Enter'}]}];
      [o.hcB,o.hcA].forEach(c=>st.push({sel:CL(c)+o.ebitR, keys:[...T('='+CL(c)+o.totR+'+'+CL(c)+o.costR+'+'+CL(c)+o.daR),{key:'Enter'}]}));
      st.push({sel:o.badK, keys:[...T('=SUM('+CL(o.c0)+o.badRow+':'+o.lastCol+o.badRow+')'),{key:'Enter'}]});
      return st; }` },
  /* r440 §4.55 depth pass — both entries rebuilt for the three-year board (the old pair hard-coded
     B6/B12/B14 off the retired two-year one). ALT 1 = chord ROUTE + op ORDER: the L&E side footed
     before the assets, every total landed with autosum's range form instead of a typed SUM, and
     every fill and every dress walked through the ribbon. The ☆ still latches — a ribbon fill is
     the same latch as Ctrl+R (§1.0(c)) — which is the point: the star grades the DECISION to fill,
     never the chord that does it. */
  { key: 'balance', name: 'L&E footed before assets, autosum range form, every fill and dress by ribbon', moves: `C => { const o=C._o; return [
      {sel:o.CB+o.l0+':'+o.CB+o.rLE, keys:[{key:'=',alt:true,code:'Equal'}]},
      {sel:o.CB+o.rLE+':'+o.CD+o.rLE, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:o.CA+o.rLE+':'+o.CD+o.rLE, keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:o.CA+o.rLE+':'+o.CD+o.rLE, keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:o.CB+o.a0+':'+o.CB+o.rTA, keys:[{key:'=',alt:true,code:'Equal'}]},
      {sel:o.CB+o.rTA+':'+o.CD+o.rTA, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:o.CA+o.rTA+':'+o.CD+o.rTA, keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:o.CA+o.rTA+':'+o.CD+o.rTA, keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:o.CB+o.rCK, keys:[...T('='+o.CB+o.rTA+'-'+o.CB+o.rLE),{key:'Enter'}]},
      {sel:o.CB+o.rCK+':'+o.CD+o.rCK, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:o.CA+o.rCK+':'+o.CD+o.rCK, keys:[{key:'Alt'},L('h'),D(1)]},
    ]; }` },
  /* ALT 2 = the MEASURED NEGATIVE CONTROL for the ☆: no fill anywhere. Every year typed on its
     own, both totals written as $-anchored addition chains rather than SUMs, and the check written
     the other way round and negated. All five cores clear, the ☆ goes DARK (§1.0(c): the slow route
     is never penalised, it just costs the keys) — and this is the route that proves the two
     untriggerable beats recorded in the drill's header comment are dead. */
  { key: 'balance', name: 'NEGATIVE CONTROL — no fill at all, anchored addition chains, check negated (cores clear, ☆ dark)', moves: `C => { const o=C._o; const st=[];
      o.cols.forEach(c=>{ let f='='; for(let r=o.a0;r<=o.aN;r++) f+=(r>o.a0?'+':'')+'$'+c+'$'+r;
        st.push({sel:c+o.rTA, keys:[...T(f),{key:'Enter'}]}); });
      o.cols.forEach(c=>{ let f='='; for(let r=o.l0;r<=o.lN;r++) f+=(r>o.l0?'+':'')+'$'+c+'$'+r;
        st.push({sel:c+o.rLE, keys:[...T(f),{key:'Enter'}]}); });
      st.push({sel:o.CA+o.rTA+':'+o.CD+o.rTA, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]});
      st.push({sel:o.CA+o.rLE+':'+o.CD+o.rLE, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]});
      o.cols.forEach(c=>st.push({sel:c+o.rCK, keys:[...T('=-($'+c+'$'+o.rLE+'-$'+c+'$'+o.rTA+')'),{key:'Enter'}]}));
      st.push({sel:o.CA+o.rCK+':'+o.CD+o.rCK, keys:[{key:'b',ctrl:true}]});
      return st; }` },
  /* r440 §4.48 depth pass — both entries rebuilt for the reworked board (the old one hard-coded
     rows 4/7/12/13/15 off the retired ROWS:15 one). ALT 1 = op ORDER: both causes repaired BEFORE
     the check row is rebuilt, so the cascade never fires and the player never reads the instrument
     — the end state is identical, which is exactly what §1.0-R3(p) promises. Ribbon fill, ribbon
     bold. The ☆ still latches: repairing surgically is orthogonal to the order you do it in. */
  { key: 'balcheck', name: 'op ORDER — both causes repaired FIRST, check row rebuilt last, ribbon fill + ribbon bold', moves: `C => { const o=C._o;
      const shL=o.short[0], plL=o.plug[0];   // single-letter cols; regex escapes die inside template literals
      const prev=String.fromCharCode(plL.charCodeAt(0)-1);
      return [
        {sel:o.plug,  keys:[...T('='+prev+o.rEq+'+'+plL+o.rNi),{key:'Enter'}]},
        {sel:o.short, keys:[...T('=SUM('+shL+o.a0+':'+shL+o.aN+')'),{key:'Enter'}]},
        {sel:o.CB+o.rCk, keys:[...T('='+o.CB+o.rTA+'-'+o.CB+o.rLE),{key:'Enter'}]},
        {sel:o.CB+o.rCk+':'+o.CE+o.rCk, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
        {sel:o.CB+o.rCk+':'+o.CE+o.rCk, keys:[{key:'Alt'},L('h'),D(1)]},
      ]; }` },
  /* ALT 2 = chord ROUTE + the three formula shapes the SHIPPED board locked out, all three walked
     here so the regression cannot come back: the check row written $-anchored and negated and typed
     year by year with no fill at all; the short Total re-spanned as an addition chain instead of a
     SUM; the typed-over equity rebuilt as SUM(prior, memo) rather than a reference chain. Every
     core clears (§1.0-R3(p) grades the number), and the ☆ still latches because no healthy formula
     was touched — which is the distinction the star is drawn on. */
  { key: 'balcheck', name: 'the three locked-out formula shapes — anchored negated check typed year by year, addition-chain Total, SUM-form roll', moves: `C => { const o=C._o;
      const shL=o.short[0], plL=o.plug[0];
      const prev=String.fromCharCode(plL.charCodeAt(0)-1);
      const st=[];
      let chain='='; for(let r=o.a0;r<=o.aN;r++) chain+=(r>o.a0?'+':'')+shL+r;
      st.push({sel:o.short, keys:[...T(chain),{key:'Enter'}]});
      st.push({sel:o.plug,  keys:[...T('=SUM('+prev+o.rEq+','+plL+o.rNi+')'),{key:'Enter'}]});
      o.cols.forEach(c=>st.push({sel:c+o.rCk, keys:[...T('=-($'+c+'$'+o.rLE+'-$'+c+'$'+o.rTA+')'),{key:'Enter'}]}));
      st.push({sel:o.CB+o.rCk+':'+o.CE+o.rCk, keys:[{key:'b',ctrl:true}]});
      return st; }` },
  /* r440 §4.51 depth pass — tieout's FIRST alt-path entries ever (it was one of the nine zero-ALT
     drills §1.8 names). ALT 1 = op ORDER: the tie-out built BEFORE the leg is repointed, so it
     shows a live non-zero difference and then walks to zero under the repair — the reading the
     drill's prompt describes, in the opposite order to the demo. Autosum range form for the total,
     ribbon dress throughout. The ☆ goes DARK here: no leg is ever opened in the editor. */
  { key: 'tieout', name: 'op ORDER — tie-out built before the repoint, autosum range form, ribbon dress (☆ dark)', moves: `C => { const o=C._o; return [
      {sel:o.CB+o.r0+':'+o.CB+o.rTot, keys:[{key:'=',alt:true,code:'Equal'}]},
      {sel:o.CA+o.rTot+':'+o.CB+o.rTot, keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:o.CA+o.rTot+':'+o.CB+o.rTot, keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:o.CB+o.rTie, keys:[...T('='+o.CB+o.rTot+'-'+o.CB+o.rDeck),{key:'Enter'}]},
      {sel:o.bad, keys:[...T(o.fixF),{key:'Enter'}]},
      {sel:o.CA+o.rTie+':'+o.CB+o.rTie, keys:[{key:'Alt'},L('h'),D(1)]},
    ]; }` },
  /* ALT 2 = chord ROUTE + the anchoring the shipped board would have locked out: the block totalled
     as an addition chain over all eight legs, the leg repointed with an ANCHORED reference, the
     outside-border dress instead of a top rule, and the tie-out written the other way round and
     negated. The ☆ stays DARK — no leg is opened in the editor — so this doubles as the star's
     negative control.

     r440, WHY THIS ALT DOES NOT INTERROGATE. It originally ran F2 · F9 · Esc here to light the star
     from a non-demo route. It passed 15 isolated seeds and failed inside the FULL suite, every time
     with the same signature: the trace shows F2 opening the editor (buf "=F6"), F9 collapsing it
     (buf "360"), and then Esc leaving `editing` TRUE and the buffer untouched — so the following
     retype appended to it and the leg committed as the text "360=G$6". At that moment mode=normal,
     dialog=null, pickerOpen=false and no card is on screen, and a fresh alt-paths-style context
     cancels the edit correctly, so it is accumulated state after ~350 prior alt reps in one page
     session rather than anything about this drill. The SAME F2/F9/Esc route is exercised by
     tieout's demo and replays green 3/3 across the full 74-drill catalog run, which is the coverage
     that matters; reproducing the harness-context wedge is tracked separately rather than parked in
     a red gate. */
  { key: 'tieout', name: 'addition-chain total, ANCHORED repoint, outside-border dress, negated tie-out (☆ dark)', moves: `C => { const o=C._o;
      let chain='='; for(let r=o.r0;r<=o.rN;r++) chain+=(r>o.r0?'+':'')+o.CB+r;
      const anch='='+o.fixF.slice(1,2)+'$'+o.fixF.slice(2);
      return [
        {sel:o.CB+o.rTot, keys:[...T(chain),{key:'Enter'}]},
        {sel:o.CA+o.rTot+':'+o.CB+o.rTot, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('s')]},
        {sel:o.bad, keys:[...T(anch),{key:'Enter'}]},
        {sel:o.CB+o.rTie, keys:[...T('=-('+o.CB+o.rDeck+'-'+o.CB+o.rTot+')'),{key:'Enter'}]},
        {sel:o.CA+o.rTie+':'+o.CB+o.rTie, keys:[{key:'b',ctrl:true}]},
      ]; }` },
  /* r448 §4.79 depth pass — the single old entry is DELETED (it hard-coded B5/B8/C10/B11/B14 off
     the retired ROWS:14 board) and replaced by the pair below. ALT 1 = chord ROUTE + op ORDER:
     the roll committed to BOTH cells at once with Ctrl+Enter, the assets total landed with
     autosum's RANGE form instead of a typed SUM, the fill walked through the ribbon, the ☆'s
     clone made through the paste-special FORMULAS dialog rather than Ctrl+V, both totals dressed
     with Alt H 1 + the Alt H B S box (which stores bt AND bb — the lenient border reading is what
     lets it clear), and the check written straight off the two BLOCKS so it never reads either
     total row. The ☆ still latches: a dialog paste writes the same S.pasteLog entry as Ctrl+V
     (§1.0(c)), which is the point — the star grades the DECISION to clone, never the chord. */
  { key: 'bsbuild', name: 'Ctrl+Enter roll, autosum range form, ribbon fill, paste-special FORMULAS clone, Alt H B S box, check written off the blocks', moves: `C => { const o=C._o; const st=[
      {sel:o.CC+o.rRE, keys:[{key:'ArrowRight',shift:true},...T('='+o.CB+o.rRE+'+'+o.CC+o.rNI+'+'+o.CC+o.rDV),{key:'Enter',ctrl:true}]},
      {sel:o.CB+o.a0+':'+o.CB+o.rTA, keys:[{key:'=',alt:true,code:'Equal'}]},
      {sel:o.CB+o.rTA+':'+o.CD+o.rTA, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:o.CB+o.rTA+':'+o.CD+o.rTA, keys:[{key:'c',ctrl:true}]},
      {sel:o.CB+o.rLE, keys:[{key:'Alt'},L('h'),L('v'),L('s'),L('f'),{key:'Enter'}]},
      {sel:o.CB+o.rTA+':'+o.CD+o.rTA, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('s')]},
      {sel:o.CB+o.rLE+':'+o.CD+o.rLE, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('s')]}];
    o.cols.forEach(c=>st.push({sel:c+o.rCK, keys:[...T('=SUM('+c+o.a0+':'+c+o.aN+')-SUM('+c+o.l0+':'+c+o.lN+')'),{key:'Enter'}]}));
    st.push({sel:o.CB+o.rCK+':'+o.CD+o.rCK, keys:[{key:'Alt'},L('h'),D(1)]});
    return st; }` },
  /* ALT 2 = the MEASURED NEGATIVE CONTROL for the ☆, and the freedom proof for the whole board:
     no paste and no fill anywhere. The roll typed year by year with $-ANCHORED refs, both totals
     written as anchored ADDITION CHAINS rather than SUMs, every year typed on its own, the check
     written the other way round and negated, and every dress walked cell by cell through the
     ribbon. All six cores clear and the ☆ goes DARK — §1.0(c): the slow route is never penalised,
     it only costs the keys (261 against 60, 5-seed medians, dev/verify-bsbuild.js §D). This is
     also the route that proves the two formula-TEXT beats the retired board shipped are dead:
     nothing here writes a SUM( or an unanchored reference anywhere. */
  { key: 'bsbuild', name: 'NEGATIVE CONTROL — no paste, no fill, anchored addition chains, roll and check typed per year, dress cell by cell (six cores clear, ☆ dark)', moves: `C => { const o=C._o; const st=[];
      [[o.CC,o.CB],[o.CD,o.CC]].forEach(([c,prev])=>
        st.push({sel:c+o.rRE, keys:[...T('=$'+prev+'$'+o.rRE+'+$'+c+'$'+o.rNI+'+$'+c+'$'+o.rDV),{key:'Enter'}]}));
      o.cols.forEach(c=>{ let f='='; for(let r=o.a0;r<=o.aN;r++) f+=(r>o.a0?'+':'')+'$'+c+'$'+r;
        st.push({sel:c+o.rTA, keys:[...T(f),{key:'Enter'}]}); });
      o.cols.forEach(c=>{ let f='='; for(let r=o.l0;r<=o.lN;r++) f+=(r>o.l0?'+':'')+'$'+c+'$'+r;
        st.push({sel:c+o.rLE, keys:[...T(f),{key:'Enter'}]}); });
      o.cols.forEach(c=>{ st.push({sel:c+o.rTA, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('p')]});
                          st.push({sel:c+o.rLE, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('p')]}); });
      o.cols.forEach(c=>st.push({sel:c+o.rCK, keys:[...T('=-($'+c+'$'+o.rLE+'-$'+c+'$'+o.rTA+')'),{key:'Enter'}]}));
      o.cols.forEach(c=>st.push({sel:c+o.rCK, keys:[{key:'Alt'},L('h'),D(1)]}));
      return st; }` },
  /* r447 (cascade depth pass, DEPTH_PASS §4.77 — the Models II capstone): three entries,
     replacing the one pre-pass entry, which drove the retired ROWS:14 geometry cell by cell.
     ALT 1 = chord-ROUTE alt — every fill walked from the ribbon (Alt H F I R), bold via Alt H 1,
     the rule via Alt H B S, EVERY MIN written as an IF (the untriggerable-beat regression: the
     pre-pass predicate demanded the literal 'MIN(' out of formula text, finding #21–#23), the
     total as =SUM(a,b,c), and the ☆ built the OTHER way round — the three paydown rows rolled
     up against the cash line instead of opening-less-closing. The star still fires, because it
     grades the identity off the board and not a formula shape.
     ALT 2 = op-ORDER alt — the junior facility built first and the senior last, the dress and
     the total laid down BEFORE the numbers that feed them (everything recalculates when they
     land), the corkscrew links last, every year-one reference ANCHORED (finding #24: the roll
     checks used to demand the bare prior-year cell out of the text), and the ☆ as a bare
     addition chain with no SUM anywhere.
     ALT 3 = the §1.0-R2(i) SKIPPABILITY CONTROL and the ☆-headroom denominator: every year-cell
     typed on its own, no fill anywhere on the board, the dress walked column by column with ALL
     borders (Alt H B A, which stores `ball` and not `bt` — probed, and the reason the dress
     predicate accepts either). All six cores clear and the ☆ must stay DARK.
     MEASURED, 3 seeds each, in the r447 worktree: ALT 1 median 237 keys (☆ 3/3) · ALT 2 median
     243 (☆ 3/3) · ALT 3 median 374 (☆ 0/3). The demo is 153. */
  { key: 'cascade', name: 'RIBBON routes throughout (Alt H F I R fills, Alt H 1 bold, Alt H B S perimeter rule), every MIN written as an IF, and the ☆ built the other way round — the paydown rows rolled up against the cash line', moves: `C => { const o=C._o, R=o.R, Y=o.Y;
      const RT=n=>{ const a=[]; for(let i=0;i<n;i++) a.push({key:'ArrowRight',shift:true}); return a; };
      const IF=(bal,cash)=>'=IF('+cash+'<'+bal+','+cash+','+bal+')';
      const FIR=[{key:'Alt'},L('h'),L('f'),L('i'),L('r')];
      return [
        {sel:Y[0]+R.rp, keys:[...T(IF(Y[0]+R.rb, Y[0]+R.cash)), {key:'Enter'}]},
        {sel:Y[0]+R.re, keys:[...T('='+Y[0]+R.rb+'-'+Y[0]+R.rp), {key:'Enter'}]},
        {sel:Y[0]+R.tp, keys:[...T(IF(Y[0]+R.tb, Y[0]+R.cash+'-'+Y[0]+R.rp)), {key:'Enter'}]},
        {sel:Y[0]+R.te, keys:[...T('='+Y[0]+R.tb+'-'+Y[0]+R.tp), {key:'Enter'}]},
        {sel:Y[0]+R.mp, keys:[...T(IF(Y[0]+R.mb, Y[0]+R.cash+'-'+Y[0]+R.rp+'-'+Y[0]+R.tp)), {key:'Enter'}]},
        {sel:Y[0]+R.me, keys:[...T('='+Y[0]+R.mb+'-'+Y[0]+R.mp), {key:'Enter'}]},
        {sel:Y[1]+R.rb, keys:[...T('='+Y[0]+R.re), {key:'Enter'}]},
        {sel:Y[1]+R.tb, keys:[...T('='+Y[0]+R.te), {key:'Enter'}]},
        {sel:Y[1]+R.mb, keys:[...T('='+Y[0]+R.me), {key:'Enter'}]},
        {sel:Y[0]+R.rp, keys:[...RT(3), {key:'ArrowDown',shift:true}, ...FIR]},
        {sel:Y[0]+R.tp, keys:[...RT(3), {key:'ArrowDown',shift:true}, ...FIR]},
        {sel:Y[0]+R.mp, keys:[...RT(3), {key:'ArrowDown',shift:true}, ...FIR]},
        {sel:Y[1]+R.rb, keys:[...RT(2), ...FIR]},
        {sel:Y[1]+R.tb, keys:[...RT(2), ...FIR]},
        {sel:Y[1]+R.mb, keys:[...RT(2), ...FIR]},
        {sel:Y[0]+R.tot, keys:[...T('=SUM('+Y[0]+R.re+','+Y[0]+R.te+','+Y[0]+R.me+')'), {key:'Enter'}]},
        {sel:Y[0]+R.tot, keys:[...RT(3), ...FIR]},
        {sel:o.CA+R.tot, keys:[...RT(4), {key:'Alt'},L('h'),D(1), {key:'Alt'},L('h'),L('b'),L('s')]},
        {sel:Y[0]+R.chk, keys:[...T('=SUM('+Y[0]+R.rp+':'+Y[3]+R.rp+')+SUM('+Y[0]+R.tp+':'+Y[3]+R.tp+')+SUM('+Y[0]+R.mp+':'+Y[3]+R.mp+')-SUM('+Y[0]+R.cash+':'+Y[3]+R.cash+')'), {key:'Enter'}]},
      ]; }` },
  { key: 'cascade', name: 'BOTTOM-UP op order — the junior facility built first and the senior last, the dress and the total laid down before the numbers that feed them, corkscrews last, every reference ANCHORED, and the ☆ written as an addition chain', moves: `C => { const o=C._o, R=o.R, Y=o.Y;
      const RT=n=>{ const a=[]; for(let i=0;i<n;i++) a.push({key:'ArrowRight',shift:true}); return a; };
      const A=c=>'$'+c[0]+'$'+c.slice(1);
      return [
        {sel:o.CA+R.tot, keys:[...RT(4), {key:'b',ctrl:true}, {key:'Alt'},L('h'),L('b'),L('t')]},
        {sel:Y[0]+R.tot, keys:[...T('='+Y[0]+R.re+'+'+Y[0]+R.te+'+'+Y[0]+R.me), {key:'Enter'}]},
        {sel:Y[0]+R.tot, keys:[...RT(3), {key:'r',ctrl:true}]},
        {sel:Y[0]+R.mp, keys:[...T('=MIN('+A(Y[0]+R.mb)+','+A(Y[0]+R.cash)+'-'+A(Y[0]+R.rp)+'-'+A(Y[0]+R.tp)+')'), {key:'Enter'}]},
        {sel:Y[0]+R.me, keys:[...T('='+Y[0]+R.mb+'-'+Y[0]+R.mp), {key:'Enter'}]},
        {sel:Y[0]+R.tp, keys:[...T('=MIN('+A(Y[0]+R.tb)+','+A(Y[0]+R.cash)+'-'+A(Y[0]+R.rp)+')'), {key:'Enter'}]},
        {sel:Y[0]+R.te, keys:[...T('='+Y[0]+R.tb+'-'+Y[0]+R.tp), {key:'Enter'}]},
        {sel:Y[0]+R.rp, keys:[...T('=MIN('+A(Y[0]+R.rb)+','+A(Y[0]+R.cash)+')'), {key:'Enter'}]},
        {sel:Y[0]+R.re, keys:[...T('='+Y[0]+R.rb+'-'+Y[0]+R.rp), {key:'Enter'}]},
        {sel:Y[1]+R.mp, keys:[...T('=MIN('+Y[1]+R.mb+','+Y[1]+R.cash+'-'+Y[1]+R.rp+'-'+Y[1]+R.tp+')'), {key:'Enter'}]},
        {sel:Y[1]+R.me, keys:[...T('='+Y[1]+R.mb+'-'+Y[1]+R.mp), {key:'Enter'}]},
        {sel:Y[1]+R.tp, keys:[...T('=MIN('+Y[1]+R.tb+','+Y[1]+R.cash+'-'+Y[1]+R.rp+')'), {key:'Enter'}]},
        {sel:Y[1]+R.te, keys:[...T('='+Y[1]+R.tb+'-'+Y[1]+R.tp), {key:'Enter'}]},
        {sel:Y[1]+R.rp, keys:[...T('=MIN('+Y[1]+R.rb+','+Y[1]+R.cash+')'), {key:'Enter'}]},
        {sel:Y[1]+R.re, keys:[...T('='+Y[1]+R.rb+'-'+Y[1]+R.rp), {key:'Enter'}]},
        {sel:Y[1]+R.rp, keys:[...RT(2), {key:'ArrowDown',shift:true}, {key:'r',ctrl:true}]},
        {sel:Y[1]+R.tp, keys:[...RT(2), {key:'ArrowDown',shift:true}, {key:'r',ctrl:true}]},
        {sel:Y[1]+R.mp, keys:[...RT(2), {key:'ArrowDown',shift:true}, {key:'r',ctrl:true}]},
        {sel:Y[1]+R.rb, keys:[...T('='+Y[0]+R.re), {key:'Enter'}]},
        {sel:Y[1]+R.tb, keys:[...T('='+Y[0]+R.te), {key:'Enter'}]},
        {sel:Y[1]+R.mb, keys:[...T('='+Y[0]+R.me), {key:'Enter'}]},
        {sel:Y[1]+R.rb, keys:[...RT(2), {key:'r',ctrl:true}]},
        {sel:Y[1]+R.tb, keys:[...RT(2), {key:'r',ctrl:true}]},
        {sel:Y[1]+R.mb, keys:[...RT(2), {key:'r',ctrl:true}]},
        {sel:Y[0]+R.chk, keys:[...T('='+Y[0]+R.rb+'+'+Y[0]+R.tb+'+'+Y[0]+R.mb+'-'+Y[3]+R.re+'-'+Y[3]+R.te+'-'+Y[3]+R.me+'-'+Y[0]+R.cash+'-'+Y[1]+R.cash+'-'+Y[2]+R.cash+'-'+Y[3]+R.cash), {key:'Enter'}]},
      ]; }` },
  { key: 'cascade', name: 'SLOWEST LEGAL ROUTE and the §1.0-R2(i) skippability control: every year-cell typed on its own, no fill anywhere on the board, the dress walked column by column with ALL borders (Alt H B A, which stores `ball` not `bt`) — all six cores clear, ☆ forfeited', moves: `C => { const o=C._o, R=o.R, Y=o.Y, out=[];
      for(let i=0;i<4;i++){ const y=Y[i], p=i?Y[i-1]:null;
        if(p){ out.push({sel:y+R.rb, keys:[...T('='+p+R.re), {key:'Enter'}]});
               out.push({sel:y+R.tb, keys:[...T('='+p+R.te), {key:'Enter'}]});
               out.push({sel:y+R.mb, keys:[...T('='+p+R.me), {key:'Enter'}]}); }
        out.push({sel:y+R.rp, keys:[...T('=MIN('+y+R.rb+','+y+R.cash+')'), {key:'Enter'}]});
        out.push({sel:y+R.re, keys:[...T('='+y+R.rb+'-'+y+R.rp), {key:'Enter'}]});
        out.push({sel:y+R.tp, keys:[...T('=MIN('+y+R.tb+','+y+R.cash+'-'+y+R.rp+')'), {key:'Enter'}]});
        out.push({sel:y+R.te, keys:[...T('='+y+R.tb+'-'+y+R.tp), {key:'Enter'}]});
        out.push({sel:y+R.mp, keys:[...T('=MIN('+y+R.mb+','+y+R.cash+'-'+y+R.rp+'-'+y+R.tp+')'), {key:'Enter'}]});
        out.push({sel:y+R.me, keys:[...T('='+y+R.mb+'-'+y+R.mp), {key:'Enter'}]});
        out.push({sel:y+R.tot, keys:[...T('='+y+R.re+'+'+y+R.te+'+'+y+R.me), {key:'Enter'}]});
      }
      for(let i=0;i<4;i++) out.push({sel:Y[i]+R.tot, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('a')]});
      return out; }` },
  /* r448 (cfslink depth pass, DEPTH_PASS §4.80): the old single entry drove the retired ROWS:10
     board (hard-coded B6/B8/C7/B10 addresses that no longer exist) and is DELETED — integrators,
     do not resurrect it (CAMPAIGN §4: for the drill an agent reworked, its side is authoritative
     for deletions too).
     ALT 1 = chord-ROUTE alt. ALT 2 = op-ORDER alt AND the measured ☆ skippability control. */
  { key: 'cfslink', name: 'chord ROUTE alt — both subtotals taken with AutoSum over the range (select through the empty total cell, Alt+= commits it) instead of typed SUMs, every fill off the RIBBON (Alt H F I R), the memo percent walked Alt H P + Alt H 0 instead of Ctrl+1 P, and the closing row dressed Alt H 1 + Alt H B S (outside border round the row): all six cores clear and the ☆ still lands, because the star grades the DECISION to cover the block in one pass, never the chord that does it', moves: `C => { const o=C._o; return [
      {sel:o.wc0,  keys:[...T('='+o.nwcSrc0),{key:'Enter'}]},
      {sel:o.cx0,  keys:[...T('='+o.capxSrc0),{key:'Enter'}]},
      {sel:o.ni0+':'+o.cfo0,  keys:[{key:'=',alt:true,code:'Equal'}]},
      {sel:o.cfo0+':'+o.net0, keys:[{key:'=',alt:true,code:'Equal'}]},
      {sel:o.blk,     keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:o.memo0,   keys:[...T('='+o.net0+'/'+o.ebit0),{key:'Enter'}]},
      {sel:o.memoRng, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r'),{key:'Alt'},L('h'),L('p'),{key:'Alt'},L('h'),D(0)]},
      {sel:o.end0,    keys:[...T('='+o.begC0+'+'+o.net0),{key:'Enter'}]},
      {sel:o.begL1,   keys:[...T('='+o.end0),{key:'Enter'}]},
      {sel:o.begRest, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:o.endRng,  keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r'),{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('s')]},
    ]; }` },
  { key: 'cfslink', name: 'op ORDER alt AND the measured ☆ NEGATIVE CONTROL — the closing row dressed BEFORE it holds anything, the memo built off an empty net-change row (recalc closes it), the statement written bottom-up from the investing line, the roll link written before the close exists, and the four lines carried as FOUR SEPARATE ROW FILLS so all six cores clear with the star DARK — the ☆ state itself is asserted in dev/verify-cfslink.js §I (this harness grades the win and never the star), and §D prices the skip fully keyed: the same four lines cost 59 keys as four row fills against 44 as one pass', moves: `C => { const o=C._o; return [
      {sel:o.endRng,  keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:o.memo0,   keys:[...T('='+o.net0+'/'+o.ebit0),{key:'Enter'}]},
      {sel:o.memoRng, keys:[{key:'r',ctrl:true},{key:'1',ctrl:true},L('p')]},
      {sel:o.cx0,     keys:[...T('='+o.capxSrc0),{key:'Enter'}]},
      {sel:o.cxRng,   keys:[{key:'r',ctrl:true}]},
      {sel:o.wc0,     keys:[...T('='+o.nwcSrc0),{key:'Enter'}]},
      {sel:o.wcRng,   keys:[{key:'r',ctrl:true}]},
      {sel:o.cfo0,    keys:[...T('='+o.ni0+'+'+o.da0+'+'+o.wc0),{key:'Enter'}]},
      {sel:o.cfoRng,  keys:[{key:'r',ctrl:true}]},
      {sel:o.net0,    keys:[...T('='+o.cfo0+'+'+o.cx0),{key:'Enter'}]},
      {sel:o.netRng,  keys:[{key:'r',ctrl:true}]},
      {sel:o.begL1,   keys:[...T('='+o.end0),{key:'Enter'}]},
      {sel:o.begRest, keys:[{key:'r',ctrl:true}]},
      {sel:o.end0,    keys:[...T('='+o.begC0+'+'+o.net0),{key:'Enter'}]},
      {sel:o.endRng,  keys:[{key:'r',ctrl:true}]},
    ]; }` },
  /* r444 (comps depth pass, DEPTH_PASS §4.60): the old single entry drove the retired 3-column
     comps page (D3/D8/G4) and is DELETED — integrators, do not resurrect it (CAMPAIGN §4: for
     the drill an agent reworked, its side is authoritative for deletions too).
     ALT 1 = chord-ROUTE alt. ALT 2 = op-ORDER alt AND the measured skippability control. */
  { key: 'comps', name: 'chord ROUTE alt — the anchor set by F4 instead of a typed $, both fills off the ribbon (Alt H F I R / I D), the summary read with LARGE/SMALL instead of MEDIAN/MAX/MIN, the landing dressed via Alt H 1 + Alt H B S (the ☆ still fires — a fill is a fill however it is reached)', moves: `C => { const o=C._o; return [
      {sel:o.CX+o.P0, keys:[...T('='+o.CV+o.P0),{key:'F4'},{key:'F4'},{key:'F4'},...T('/'+o.CD+o.P0),{key:'Enter'}]},
      {sel:o.CX+o.P0+':'+o.CY+o.P0, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:o.CX+o.P0+':'+o.CY+o.PN, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
      {sel:o.CX+o.RMED, keys:[...T('=LARGE('+o.CX+o.P0+':'+o.CX+o.PN+',3)'),{key:'Enter'}]},
      {sel:o.CY+o.RMED, keys:[...T('=SMALL('+o.CY+o.P0+':'+o.CY+o.PN+',3)'),{key:'Enter'}]},
      {sel:o.CX+o.RHI,  keys:[...T('=LARGE('+o.CX+o.P0+':'+o.CX+o.PN+',1)'),{key:'Enter'}]},
      {sel:o.CY+o.RHI,  keys:[...T('=LARGE('+o.CY+o.P0+':'+o.CY+o.PN+',1)'),{key:'Enter'}]},
      {sel:o.CX+o.RLO,  keys:[...T('=SMALL('+o.CX+o.P0+':'+o.CX+o.PN+',1)'),{key:'Enter'}]},
      {sel:o.CY+o.RLO,  keys:[...T('=SMALL('+o.CY+o.P0+':'+o.CY+o.PN+',1)'),{key:'Enter'}]},
      {sel:o.CV+o.REV, keys:[...T('='+o.CV+o.RTE+'*'+o.CX+o.RMED),{key:'Enter'}]},
      {sel:o.CV+o.REQ, keys:[...T('='+o.CV+o.REV+'-'+o.CV+o.RND),{key:'Enter'}]},
      {sel:o.CV+o.RPS, keys:[...T('='+o.CV+o.REQ+'/'+o.CV+o.RSH),{key:'Enter'}]},
      {sel:o.CA+o.RPS+':'+o.CV+o.RPS, keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:o.CA+o.RPS+':'+o.CV+o.RPS, keys:[{key:'Alt'},L('h'),L('b'),L('s')]},
    ]; }` },
  { key: 'comps', name: 'op ORDER alt AND the measured negative control — the landing dressed BEFORE it exists, the bridge built off an empty median (recalc closes it), the tape read bottom-up, and the ten multiples taken as TWO unanchored column formulas so all six cores clear with the star DARK (93 keys against the demo\'s 85)', moves: `C => { const o=C._o; return [
      {sel:o.CA+o.RPS+':'+o.CV+o.RPS, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:o.CV+o.RPS, keys:[...T('='+o.CV+o.REQ+'/'+o.CV+o.RSH),{key:'Enter'}]},
      {sel:o.CV+o.REQ, keys:[...T('='+o.CV+o.REV+'-'+o.CV+o.RND),{key:'Enter'}]},
      {sel:o.CV+o.REV, keys:[...T('='+o.CV+o.RTE+'*'+o.CX+o.RMED),{key:'Enter'}]},
      {sel:o.CX+o.RLO,  keys:[...T('=MIN('+o.CX+o.P0+':'+o.CX+o.PN+')'),{key:'Enter'}]},
      {sel:o.CY+o.RLO,  keys:[...T('=MIN('+o.CY+o.P0+':'+o.CY+o.PN+')'),{key:'Enter'}]},
      {sel:o.CX+o.RHI,  keys:[...T('=MAX('+o.CX+o.P0+':'+o.CX+o.PN+')'),{key:'Enter'}]},
      {sel:o.CY+o.RHI,  keys:[...T('=MAX('+o.CY+o.P0+':'+o.CY+o.PN+')'),{key:'Enter'}]},
      {sel:o.CX+o.RMED, keys:[...T('=MEDIAN('+o.CX+o.P0+':'+o.CX+o.PN+')'),{key:'Enter'}]},
      {sel:o.CY+o.RMED, keys:[...T('=MEDIAN('+o.CY+o.P0+':'+o.CY+o.PN+')'),{key:'Enter'}]},
      {sel:o.CX+o.P0, keys:[...T('='+o.CV+o.P0+'/'+o.CD+o.P0),{key:'Enter'}]},
      {sel:o.CX+o.P0+':'+o.CX+o.PN, keys:[{key:'d',ctrl:true}]},
      {sel:o.CY+o.P0, keys:[...T('='+o.CV+o.P0+'/'+o.CI+o.P0),{key:'Enter'}]},
      {sel:o.CY+o.P0+':'+o.CY+o.PN, keys:[{key:'d',ctrl:true}]},
    ]; }` },
  /* r447 (covtable ROUND 3, DEPTH_PASS §4.73): the pre-pass entry above is DELETED — it drove a
     board that no longer exists (12 rows, one leverage test, hard-coded B7/B9/B10/B12).
     ALT 1 = chord-ROUTE alt: ribbon fills everywhere, the LEGACY Alt E S paste-special dialog
     carrying the clone as FORMULAS, bold via Alt H 1, and the single-cell OUTSIDE box (Alt H B S,
     which stores `ball` not `bt`) — the ☆ is still earned, because the latch reads the paste, not
     the chord that opened it. ALT 2 = op-ORDER alt AND the §1.0(c)/§1.0-R2(i) freedom proof:
     dress FIRST on an empty cell, then the flag line, then headroom, then the leverage line, every
     cell hand-typed with no fill and no paste anywhere, and the MIN written over five named cells
     instead of a range. All five cores clear; the ☆ must stay DARK. */
  { key: 'covtable', name: 'ribbon fills, the legacy Alt E S dialog carries the clone as FORMULAS (☆ still earned), bold via Alt H 1, outside box via Alt H B S', moves: `C => { const o=C._o, q0=o.qc[0], qN=o.qc[o.NQ-1], dB=o.bTot?o.rTot:o.rSen; return [
      {sel:q0+o.RB, keys:[...T('=('+q0+dB+'-'+q0+o.rCash+')/'+q0+o.rEb),{key:'Enter'}]},
      {sel:q0+o.RB+':'+qN+o.RB, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:o.srcRng, keys:[{key:'c',ctrl:true}]},
      {sel:q0+(o.RB+2), keys:[{key:'Alt'},L('e'),L('s'),L('f'),{key:'Enter'}]},
      {sel:q0+o.rMin, keys:[...T('=MIN('+o.hdRng+')'),{key:'Enter'}]},
      {sel:q0+o.rMin, keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:q0+o.rMin, keys:[{key:'Alt'},L('h'),L('b'),L('s')]},
    ]; }` },
  { key: 'covtable', name: 'dress FIRST on an empty cell, then flags, then headroom, then the leverage line — every cell hand-typed, no fill and no paste, MIN over five named cells (the ☆ NEGATIVE CONTROL: all five cores clear, star dark)', moves: `C => { const o=C._o, dB=o.bTot?o.rTot:o.rSen, mv=[];
      mv.push({sel:o.qc[0]+o.rMin, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]});
      for(let j=0;j<o.NQ;j++){ const Q=o.qc[j]; mv.push({sel:Q+(o.RB+3), keys:[...T('=IF('+Q+(o.RB+2)+'>=0,1,0)'),{key:'Enter'}]}); }
      for(let j=0;j<o.NQ;j++){ const Q=o.qc[j]; mv.push({sel:Q+(o.RB+2), keys:[...T('='+Q+(o.RB+1)+'-'+Q+o.RB),{key:'Enter'}]}); }
      for(let j=0;j<o.NQ;j++){ const Q=o.qc[j]; mv.push({sel:Q+o.RB, keys:[...T('=('+Q+dB+'-'+Q+o.rCash+')/'+Q+o.rEb),{key:'Enter'}]}); }
      mv.push({sel:o.qc[0]+o.rMin, keys:[...T('=MIN('+o.qc.map(q=>q+(o.RB+2)).join(',')+')'),{key:'Enter'}]});
      return mv; }` },
  /* r444 (dcf DEPTH PASS, DEPTH_PASS §4.59 + §1.8). The drill had ONE entry, and it drove the
     board the old formula-TEXT checks were overfit to. Both entries below are rebuilt for the
     reworked board and both walk routes the old predicates locked out (CAMPAIGN §1).
     ALT 1 = chord-ROUTE alt (ribbon fills, ribbon bold, all-borders instead of a top border, the
     reciprocal-power factor shape, an addition chain for the enterprise value) with the op order
     inverted — the terminal-value block is built BEFORE the factors it reads. The ☆ is EARNED.
     ALT 2 = op-ORDER alt AND the ☆'s measured NEGATIVE CONTROL: the dress goes on first, the
     factor row and the present-value row are typed cell by cell in REVERSE with no fill anywhere,
     the present values are discounted straight off the cash flows (never cash × factor), and the
     terminal value is re-derived rather than pointed at the year-5 factor. All six cores clear;
     the ☆ must stay DARK (asserted in dev/verify-dcf.js part 3). 217 keys against the demo's 81. */
  { key: 'dcf', name: 'chord-ROUTE + inverted order: terminal-value block FIRST (before the factors it reads), reciprocal-power factor shape, ribbon fills alt h f i r, addition chain for the enterprise value, ribbon bold alt h 1 and ALL borders alt h b a — the ☆ is earned', moves: `C => { const o=C._o;
      const R=n=>{ const a=[]; for(let i=0;i<n;i++) a.push({key:'ArrowRight',shift:true}); return a; };
      const chain=o.cols.map(c=>c+o.rPv).join('+');
      return [
        {sel:o.CB+o.rTv,   keys:[...T('='+o.CF+o.rFcf+'*(1+'+o.CB+o.rG+')/('+o.CB+o.rW+'-'+o.CB+o.rG+')'),{key:'Enter'}]},
        {sel:o.CB+o.rPvtv, keys:[...T('=$'+o.CB+'$'+o.rTv+'*$'+o.CF+'$'+o.rDf),{key:'Enter'}]},
        {sel:o.CB+o.rEv,   keys:[...T('='+chain+'+'+o.CB+o.rPvtv),{key:'Enter'}]},
        {sel:o.CB+o.rPv,   keys:[...T('='+o.CB+o.rFcf+'*'+o.CB+o.rDf),{key:'Enter'}]},
        {sel:o.CB+o.rPv,   keys:[...R(4),{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
        {sel:o.CB+o.rDf,   keys:[...T('=(1+$'+o.CB+'$'+o.rW+')^-'+o.CB+o.rPer),{key:'Enter'}]},
        {sel:o.CB+o.rDf,   keys:[...R(4),{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
        {sel:o.CA+o.rEv,   keys:[...R(1),{key:'Alt'},L('h'),D(1)]},
        {sel:o.CA+o.rEv,   keys:[...R(1),{key:'Alt'},L('h'),L('b'),L('a')]},
      ]; }` },
  { key: 'dcf', name: 'op-ORDER alt AND the ☆ negative control — dress FIRST on the empty headline (one-cell alt h b p), factor row and present-value row typed in REVERSE with no fill anywhere, present values discounted straight off the cash flows, terminal value re-derived instead of pointed at the year-5 factor: all six cores clear with the ☆ DARK (217 keys against the demo\'s 81)', moves: `C => { const o=C._o;
      const mv=[];
      mv.push({sel:o.CB+o.rEv, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]});
      mv.push({sel:o.CB+o.rTv, keys:[...T('='+o.CF+o.rFcf+'*(1+'+o.CB+o.rG+')/('+o.CB+o.rW+'-'+o.CB+o.rG+')'),{key:'Enter'}]});
      for(let i=4;i>=0;i--) mv.push({sel:o.cols[i]+o.rDf, keys:[...T('=1/(1+$'+o.CB+'$'+o.rW+')^'+o.cols[i]+o.rPer),{key:'Enter'}]});
      for(let i=4;i>=0;i--) mv.push({sel:o.cols[i]+o.rPv, keys:[...T('='+o.cols[i]+o.rFcf+'/(1+$'+o.CB+'$'+o.rW+')^'+o.cols[i]+o.rPer),{key:'Enter'}]});
      mv.push({sel:o.CB+o.rPvtv, keys:[...T('='+o.CB+o.rTv+'/(1+'+o.CB+o.rW+')^5'),{key:'Enter'}]});
      mv.push({sel:o.CB+o.rEv, keys:[...T('=SUM('+o.CB+o.rPv+':'+o.CF+o.rPv+')+'+o.CB+o.rPvtv),{key:'Enter'}]});
      return mv; }` },
  /* r447 (DEPTH_PASS §4.76 depth pass) — BOTH debtsched entries are NEW; the single pre-r447
     entry ("machine built FIRST, the VP rate dropped in LAST, ribbon fills + alt h 1") is
     DELETED, because it drives the retired B2/B4/B9/C2 geometry and the average-balance
     interest formula that MODELING_STANDARDS §5 replaced. ALT 1 = chord-ROUTE alt (ribbon
     everywhere, four separate row fills — the ☆ is forfeited and all six cores clear, the
     §1.0(c) freedom proof). ALT 2 = op-ORDER alt (dress first, schedule built bottom-up, the
     roll linked before the block travels, the VP's rate dropped in LAST so recalc closes it)
     AND the ☆'s second mechanic — a TILED paste of the first-year column instead of a fill. */
  { key: 'debtsched', name: 'RIBBON routes throughout (Alt H F I R fills · Alt H 1 bold · Alt H B S outside border) and the block taken across as FOUR separate row fills — the ☆ is forfeited, all six cores clear', moves: `C => { const o=C._o;
      const Y=i=>colLetter(o.cY0+i), Y0=Y(0);
      const RIB=[{key:'Alt'},L('h'),L('f'),L('i'),L('r')];
      return [
        {sel:o.rate,  keys:[...T(C._ratePct+'%'),{key:'Enter'}]},
        {sel:o.rate,  keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
        {sel:o.am0,   keys:[...T('=-'+Y0+o.rBeg+'*$'+Y0+'$'+o.rRate),{key:'Enter'}]},
        {sel:o.sw0,   keys:[...T('=-MIN('+Y0+o.rBeg+'+'+Y0+o.rAm+',MAX(0,'+Y0+o.rCash+'))'),{key:'Enter'}]},
        {sel:o.end0,  keys:[...T('='+Y0+o.rBeg+'+'+Y0+o.rAm+'+'+Y0+o.rSw),{key:'Enter'}]},
        {sel:o.int0,  keys:[...T('=-$'+Y0+'$'+o.rIr+'*'+Y0+o.rBeg),{key:'Enter'}]},
        {sel:o.amRng,  keys:RIB},
        {sel:o.swRng,  keys:RIB},
        {sel:o.endRng, keys:RIB},
        {sel:o.intRng, keys:RIB},
        {sel:o.begL1,   keys:[...T('='+Y0+o.rEnd),{key:'Enter'}]},
        {sel:o.begRest, keys:RIB},
        {sel:o.endRng, keys:[{key:'Alt'},L('h'),D(1)]},
        {sel:o.endRng, keys:[{key:'Alt'},L('h'),L('b'),L('s')]},
      ]; }` },
  { key: 'debtsched', name: 'dress FIRST, schedule built bottom-up (interest → ending → sweep → amortization), the roll linked before the block travels by TILED PASTE, and the VP rate dropped in LAST — recalc closes it', moves: `C => { const o=C._o;
      const Y=i=>colLetter(o.cY0+i), Y0=Y(0), YN=Y(4);
      return [
        {sel:o.endRng, keys:[{key:'b',ctrl:true}]},
        {sel:o.endRng, keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
        {sel:o.int0,  keys:[...T('=-$'+Y0+'$'+o.rIr+'*'+Y0+o.rBeg),{key:'Enter'}]},
        {sel:o.end0,  keys:[...T('='+Y0+o.rBeg+'+'+Y0+o.rAm+'+'+Y0+o.rSw),{key:'Enter'}]},
        {sel:o.sw0,   keys:[...T('=-MIN('+Y0+o.rBeg+'+'+Y0+o.rAm+',MAX(0,'+Y0+o.rCash+'))'),{key:'Enter'}]},
        {sel:o.am0,   keys:[...T('=-'+Y0+o.rBeg+'*$'+Y0+'$'+o.rRate),{key:'Enter'}]},
        {sel:o.begL1,   keys:[...T('='+Y0+o.rEnd),{key:'Enter'}]},
        {sel:o.begRest, keys:[{key:'r',ctrl:true}]},
        {sel:Y0+o.rAm+':'+Y0+o.rInt,   keys:[{key:'c',ctrl:true}]},
        {sel:Y(1)+o.rAm+':'+YN+o.rInt, keys:[{key:'v',ctrl:true}]},
        {sel:o.rate,  keys:[...T(C._ratePct+'%'),{key:'Enter'}]},
        {sel:o.rate,  keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
      ]; }` },
  /* r448 (DEPTH_PASS §4.78 depth pass) — BOTH isbuild entries are NEW; the single pre-r448
     entry ("dress FIRST, statement built bottom-up (margin to COGS), alt h p + ribbon fills")
     is DELETED, because it drives the retired B3/B4/B6/B7/B8/B10/B11 geometry, a tax line and
     a net-margin row that no longer exist on the board. ALT 1 = chord-ROUTE alt (typed $ traded
     for F4 anchoring, autosum's range form for EBITDA, every fill through the ribbon, Alt H 1
     bold, Alt H B S for the rule, Alt H P + Alt H 0 for the percent — and FOUR SEPARATE ROW
     FILLS, so the ☆ is forfeited and all six cores clear: the §1.0(c) freedom proof and the
     ☆'s named negative control in one route). ALT 2 = op-ORDER alt (the row dressed before it
     holds anything, the first forecast column built BOTTOM-UP so every figure arrives only when
     revenue lands last and recalc closes it, the block carried by TILED PASTE instead of a fill
     — the ☆'s second mechanic — and the memo written as `=1-cogs%-opex%`, which is the same
     number by construction and is exactly the route a formula-text grade would have stranded). */
  { key: 'isbuild', name: 'chord ROUTE — F4 anchoring, autosum range form for EBITDA, ribbon fills throughout, Alt H 1 bold, Alt H B S rule, Alt H P + Alt H 0 percent, and four separate row fills (☆ forfeited, all six cores clear)', moves: `C => { const o=C._o;
      const Y=i=>colLetter(o.cA+i), Y0=Y(0), Y1=Y(1), YN=Y(5);
      const RIB=[{key:'Alt'},L('h'),L('f'),L('i'),L('r')];
      return [
        {sel:o.rev1, keys:[...T('='+Y0+o.rRev+'*(1+'+Y0+o.rG),{key:'F4'},...T(')'),{key:'Enter'}]},   // F4 cycles the growth ref to $abs mid-edit instead of typing the dollars
        {sel:o.revRng, keys:RIB},
        {sel:o.cog1, keys:[...T('=-'+Y1+o.rRev+'*'+Y0+o.rC),{key:'F4'},{key:'Enter'}]},
        {sel:Y1+o.rCog+':'+YN+o.rCog, keys:RIB},
        {sel:o.opx1, keys:[...T('=-'+Y1+o.rRev+'*'+Y0+o.rO),{key:'F4'},{key:'Enter'}]},
        {sel:Y1+o.rOpx+':'+YN+o.rOpx, keys:RIB},
        {sel:o.ebd1col, keys:[{key:'=',alt:true,code:'Equal'}]},                                 // autosum's RANGE form lands =SUM() committed
        {sel:o.ebdRng, keys:RIB},
        {sel:o.ebdRow, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('s')]},
        {sel:o.ebt1, keys:[...T('=SUM('+Y1+o.rEbd+':'+Y1+o.rDA+')'),{key:'Enter'}]},
        {sel:o.ebtRng, keys:RIB},
        {sel:o.mgn1, keys:[...T('='+Y1+o.rEbd+'/'+Y1+o.rRev),{key:'Enter'}]},
        {sel:o.mgnRng, keys:RIB},
        {sel:o.mgnRng, keys:[{key:'Alt'},L('h'),L('p'),{key:'Alt'},L('h'),D(0)]},
      ]; }` },
  { key: 'isbuild', name: 'op ORDER — the EBITDA row dressed while still empty, the first forecast column built BOTTOM-UP so revenue lands last and recalc closes it, the block carried by TILED PASTE, and the memo written as 1 − cogs% − opex%', moves: `C => { const o=C._o;
      const Y=i=>colLetter(o.cA+i), Y0=Y(0), Y1=Y(1), Y2=Y(2), YN=Y(5);
      return [
        {sel:o.ebdRow, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]},             // the rule goes on before the row holds anything
        {sel:o.opx1, keys:[...T('=-'+Y1+o.rRev+'*$'+Y0+'$'+o.rO),{key:'Enter'}]},
        {sel:o.cog1, keys:[...T('=-'+Y1+o.rRev+'*$'+Y0+'$'+o.rC),{key:'Enter'}]},
        {sel:o.ebd1, keys:[...T('='+Y1+o.rRev+'+'+Y1+o.rCog+'+'+Y1+o.rOpx),{key:'Enter'}]},      // the addition chain, not SUM
        {sel:o.rev1, keys:[...T('='+Y0+o.rRev+'*(1+$'+Y0+'$'+o.rG+')'),{key:'Enter'}]},          // revenue LAST — recalc closes the column
        {sel:Y1+o.rRev+':'+Y1+o.rEbd, keys:[{key:'c',ctrl:true}]},
        {sel:Y2+o.rRev+':'+YN+o.rEbd, keys:[{key:'v',ctrl:true}]},                               // the ☆'s second mechanic: a TILED paste, not a fill
        {sel:o.ebt1, keys:[...T('='+Y1+o.rEbd+'+'+Y1+o.rDA),{key:'Enter'}]},
        {sel:o.ebtRng, keys:[{key:'r',ctrl:true}]},
        {sel:o.mgn1, keys:[...T('=1-$'+Y0+'$'+o.rC+'-$'+Y0+'$'+o.rO),{key:'Enter'}]},
        {sel:o.mgnRng, keys:[{key:'r',ctrl:true},{key:'1',ctrl:true},L('p')]},
      ]; }` },
  /* r446 §4.70 depth pass — both entries rebuilt for the case-column board (the single old entry
     hard-coded B6/B8/B9/B11/B12/B14 off the retired one-column one and is DELETED, not kept).
     ALT 1 = chord ROUTE: F4 cycling instead of typed $ anchors, autosum's range form for the
     equity line, every fill through the ribbon (Alt H F I R), bold via Alt H 1 and the rule via
     Alt H B S — which stores `bt` on a one-row range, the §1.0-R3(p) route the predicate has to
     accept. The ☆ still latches: a ribbon fill is the same S.fillOps latch as Ctrl+R, which is
     the point — the star grades the DECISION to fill, never the chord that does it. */
  { key: 'lbo', name: 'chord ROUTE — F4 anchoring, autosum range form, ribbon fills, Alt H 1 bold, Alt H B S rule (☆ still latches)', moves: `C => { const o=C._o;
      const R={key:'ArrowRight',shift:true}, DN={key:'ArrowDown',shift:true};
      const fill=[{key:'Alt'},L('h'),L('f'),L('i'),L('r')];
      return [
        {sel:o.CB+o.rEV, keys:[...T('='+o.CB+o.rEB+'*'+o.CB+o.rMU),{key:'F4'},{key:'Enter'}]},
        {sel:o.CB+o.rEV, keys:[R,R,R,...fill]},
        {sel:o.CB+o.rEV+':'+o.CB+o.rEQ, keys:[{key:'=',alt:true,code:'Equal'}]},
        {sel:o.CB+o.rEQ, keys:[R,R,R,...fill]},
        {sel:o.CA+o.rEQ, keys:[R,R,R,R,{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('s')]},
        {sel:o.CC+o.rMO, keys:[...T('='+o.CC+o.rEQ+'/'+o.CB+o.rEQ),{key:'F4'},{key:'Enter'}]},
        {sel:o.CC+o.rIR, keys:[...T('='+o.CC+o.rMO+'^(1/'+o.CC+o.rHD+')-1'),{key:'Enter'}]},
        {sel:o.CC+o.rMO, keys:[R,R,DN,...fill]},
        {sel:o.CC+o.rMO, keys:[R,R,DN,{key:'Alt'},L('h'),D(1)]},
      ]; }` },
  /* ALT 2 = op ORDER + the MEASURED NEGATIVE CONTROL for the ☆: the returns block is built
     BEFORE the bridge that feeds it (the values arrive when the bridge lands — §1.0-R3(p) grades
     the end state, so the order is free), nothing is filled anywhere, both totals are written as
     addition chains rather than SUMs, and the IRR carries the hold TYPED into its exponent with
     no reference to the hold row. All six cores clear, the ☆ goes DARK (§1.0(c): the slow route
     is never penalised, it just costs the keys) — and this is the route that proves the two
     untriggerable beats recorded in the drill's header comment are dead, since the shipped board
     graded the IRR by looking for 'B12' and 'B13' inside the formula text. */
  { key: 'lbo', name: 'NEGATIVE CONTROL — returns built first, no fill anywhere, addition chains, hold typed into the exponent (cores clear, ☆ dark)', moves: `C => { const o=C._o; const st=[];
      o.cols.forEach((c,j)=>st.push({sel:c+o.rMO, keys:[...T('='+c+o.rEQ+'/$'+o.CB+'$'+o.rEQ),{key:'Enter'}]}));
      o.cols.forEach((c,j)=>st.push({sel:c+o.rIR, keys:[...T('='+c+o.rMO+'^(1/'+o.holds[j]+')-1'),{key:'Enter'}]}));
      st.push({sel:o.CC+o.rMO, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true},{key:'ArrowDown',shift:true},{key:'b',ctrl:true}]});
      o.allCols.forEach(c=>st.push({sel:c+o.rEQ, keys:[...T('='+c+o.rEV+'+'+c+o.rND+'+'+c+o.rPF),{key:'Enter'}]}));
      st.push({sel:o.CB+o.rEQ, keys:[{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true},{key:'ArrowRight',shift:true},{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]});
      o.allCols.forEach(c=>st.push({sel:c+o.rEV, keys:[...T('='+c+o.rEB+'*$'+o.CB+'$'+o.rMU),{key:'Enter'}]}));
      return st; }` },
  /* r447 (liqbridge ROUND 1, DEPTH_PASS §4.74): the old single entry died with the ROWS:14
     board it drove (no borrowing base, no covenant assumption cell, no dress beat, no flag) —
     DELETE it and take this §1.8 pair. ALT 1 = chord-ROUTE alt: ribbon fills instead of Ctrl+R,
     Alt H 1 for bold, Alt H B S for the rule, F4 for the covenant lock, the Warning cell style
     for the flag — every core clears AND the ☆ still lands, which is what proves the star's
     latch is route-blind (§1.0(c)). ALT 2 = op-ORDER alt AND the ☆ negative control: the page
     is built BOTTOM-UP (cushion before ending before beginning before availability), the dress
     goes on first, every case is typed by hand with unanchored covenant refs, and the flag comes
     off the font-colour swatch — all six cores clear with the ☆ FORFEITED, which is the
     §1.0-R2(i) skippability proof (the star state is asserted in dev/verify-liqbridge.js §C;
     this harness asserts the win). */
  { key: 'liqbridge', name: 'ribbon fills (Alt H F I R), bold via Alt H 1, the rule via Alt H B S, the covenant pinned with F4, the flag from the Warning cell style — the ☆ still lands', moves: `C => { const o=C._o;
      const SR={key:'ArrowRight',shift:true}, SD={key:'ArrowDown',shift:true};
      const f=o.breach.indexOf(true), n=o.breach.filter(Boolean).length, x=[];
      for(let i=1;i<n;i++) x.push(SR);
      return [
        {sel:o.CB+o.rAv,   keys:[...T('=MIN('+o.CB+o.rCom+','+o.CB+o.rBB+')-'+o.CB+o.rDr), {key:'Enter'}]},
        {sel:o.CB+o.rBeg,  keys:[...T('='+o.CB+o.rCash+'+'+o.CB+o.rAv), {key:'Enter'}]},
        {sel:o.CB+o.rAv,   keys:[SR,SR,SD,{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
        {sel:o.CB+o.rEnd,  keys:[...T('=SUM('+o.CB+o.rBeg+':'+o.CB+o.rFee+')'), {key:'Enter'}]},
        {sel:o.CB+o.rEnd,  keys:[SR,SR,{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('s')]},
        {sel:o.CB+o.rCush, keys:[...T('='+o.CB+o.rEnd+'-'+o.CB+o.rMin), {key:'F4'}, {key:'Enter'}]},
        {sel:o.CB+o.rEnd,  keys:[SR,SR,SD,{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
        {sel:o.cols[f]+o.rCush, keys:[...x,{key:'Alt'},L('h'),L('j'),
          {key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
      ]; }` },
  { key: 'liqbridge', name: 'dress FIRST, page built BOTTOM-UP (cushion → ending → beginning → availability), every case typed by hand with unanchored covenant refs, flag from the font-colour swatch — all six cores clear, the ☆ forfeited', moves: `C => { const o=C._o;
      const SR={key:'ArrowRight',shift:true};
      const sub=(s,c)=>s.split(o.CB).join(c);
      const A='=MIN('+o.CB+o.rCom+','+o.CB+o.rBB+')-'+o.CB+o.rDr;
      const B='='+o.CB+o.rCash+'+'+o.CB+o.rAv;
      const E='='+o.CB+o.rBeg+'+'+o.CB+o.rBurn+'+'+o.CB+o.rSale+'+'+o.CB+o.rFee;
      const mv=[{sel:o.CB+o.rEnd, keys:[SR,SR,{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]}];
      o.cols.forEach(c=>mv.push({sel:c+o.rCush, keys:[...T('='+c+o.rEnd+'-'+o.CB+o.rMin), {key:'Enter'}]}));
      o.cols.forEach(c=>mv.push({sel:c+o.rEnd,  keys:[...T(sub(E,c)), {key:'Enter'}]}));
      o.cols.forEach(c=>mv.push({sel:c+o.rBeg,  keys:[...T(sub(B,c)), {key:'Enter'}]}));
      o.cols.forEach(c=>mv.push({sel:c+o.rAv,   keys:[...T(sub(A,c)), {key:'Enter'}]}));
      o.cols.forEach((c,i)=>{ if(o.breach[i]) mv.push({sel:c+o.rCush, keys:[{key:'Alt'},L('h'),L('f'),L('c'),
        {key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]}); });
      return mv; }` },
  /* r433 (margin ROUND 1, DEPTH_PASS §4.21): the old three-table entry died with the board it
     drove; the §1.8 pair replaces it. ALT 1 = chord-ROUTE alt — typed refs instead of pointing,
     one ribbon fill per column, percent from the Ctrl+Shift+% + Alt H 0 pair instead of the
     Ctrl+1 dialog, bold from the ribbon: every core clears with the ☆ FORFEITED (three separate
     fills), which is the §1.0(c) freedom + §1.0-R2(i) skippability proof. ALT 2 = op-ORDER alt —
     headers bolded first, the columns seeded right-to-left, each seed dressed BEFORE the fill so
     the formats ride down with it, and one block fill at the end: the ☆ still lands, proving the
     latch is route-blind. */
  { key: 'margin', name: 'chord-ROUTE: typed refs (no pointing), ribbon fill down per column (alt h f i d), percent via ctrl+shift+% then alt h 0, bold via alt h 1 — the one-pass ☆ is forfeited', moves: `C => { const o=C._o; const r=o.r1;
      const seed=(d,f)=>[{sel:d.top, keys:[...T(f),{key:'Enter'}]},
                         {sel:d.rng, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]}];
      const pctl=d=>({sel:d.rng, keys:[{key:'%',ctrl:true,shift:true},{key:'Alt'},L('h'),D(0)]});
      return [
        ...seed(o.m, '='+colLetter(o.cEbd)+r+'/'+colLetter(o.cRevC)+r),
        ...seed(o.g, '='+colLetter(o.cRevC)+r+'/'+colLetter(o.cRevP)+r+'-1'),
        ...seed(o.x, '='+colLetter(o.cEv)+r+'/'+colLetter(o.cEbd)+r),
        pctl(o.m), pctl(o.g),
        {sel:o.x.rng, keys:[{key:'1',ctrl:true},L('X')]},
        {sel:o.hdrRng, keys:[{key:'Alt'},L('h'),D(1)]},
      ]; }` },
  { key: 'margin', name: 'op-ORDER reversed: headers bolded FIRST, multiple then growth then margin seeded, each seed formatted BEFORE the block fill carries its dress down — the ☆ still fires', moves: `C => { const o=C._o; const r=o.r1;
      return [
        {sel:o.hdrRng, keys:[{key:'b',ctrl:true}]},
        {sel:o.x.top, keys:[...T('='+colLetter(o.cEv)+r+'/'+colLetter(o.cEbd)+r),{key:'Enter'}]},
        {sel:o.x.top, keys:[{key:'1',ctrl:true},L('X')]},
        {sel:o.g.top, keys:[...T('='+colLetter(o.cRevC)+r+'/'+colLetter(o.cRevP)+r+'-1'),{key:'Enter'}]},
        {sel:o.g.top, keys:[{key:'Alt'},L('h'),L('p'),{key:'Alt'},L('h'),D(0)]},
        {sel:o.m.top, keys:[...T('='+colLetter(o.cEbd)+r+'/'+colLetter(o.cRevC)+r),{key:'Enter'}]},
        {sel:o.m.top, keys:[{key:'1',ctrl:true},L('P')]},
        {sel:o.blk,   keys:[{key:'d',ctrl:true}]},
      ]; }` },
  { key: 'modeltour', name: 'margins typed as raw VALUES first (no formulas — §1.0(c)), subtotals retyped in place (☆ forfeited), dollar dress after, home last', moves: `C => { const o=C._o, m=C._m, val=C._val, MG=C._marg, mv=[];
      MG.forEach(g=>{ for(let c=2;c<7;c++){ const w=val[g.num][c]/val[3][c];
        mv.push({sel:colLetter(c)+g.r, keys:[...T(w.toFixed(7)),{key:'Enter'}]}); } });
      mv.push({sel:o.mr0, keys:[{key:'%',ctrl:true,shift:true},{key:'Alt'},L('h'),D(0)]});
      mv.push({sel:o.mr1, keys:[{key:'%',ctrl:true,shift:true},{key:'Alt'},L('h'),D(0)]});
      m.forEach(x=>mv.push({sel:x.k, keys:[...T('='+x.disp),{key:'Enter'}]}));
      mv.push({sel:o.niRng, keys:[{key:'$',ctrl:true,shift:true}]});
      mv.push({sel:'A1', keys:[{key:'Home',ctrl:true}]});
      return mv; }` },
  /* r425: chord-ROUTE alt — the heals ride copy + PASTE-SPECIAL-FORMULAS (ctrl+alt+v → F,
     not plain ctrl+v: proves the ☆ pasteLog latch isn't overfit to one paste chord), margin
     fills ride the RIBBON (Alt H F I R), canonical beat order otherwise. */
  { key: 'modeltour', name: 'copy-heal via paste-special-FORMULAS dialog (☆ on a different paste chord), ribbon fills for both margin rows', moves: `C => { const o=C._o, m=C._m, mv=[];
      m.forEach(x=>{ const sC=x.c===2?3:2;
        mv.push({sel:colLetter(sC)+x.r, keys:[{key:'c',ctrl:true}]});
        mv.push({sel:x.k, keys:[{key:'v',ctrl:true,alt:true},L('f'),{key:'Enter'}]}); });
      mv.push({sel:o.niRng, keys:[{key:'$',ctrl:true,shift:true}]});
      mv.push({sel:o.gpm0, keys:[...T(o.gpmF),{key:'Enter'}]});
      mv.push({sel:o.mr0, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]});
      mv.push({sel:o.ebm0, keys:[...T(o.ebmF),{key:'Enter'}]});
      mv.push({sel:o.mr1, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]});
      mv.push({sel:o.mr0, keys:[{key:'%',ctrl:true,shift:true},{key:'Alt'},L('h'),D(0)]});
      mv.push({sel:o.mr1, keys:[{key:'%',ctrl:true,shift:true},{key:'Alt'},L('h'),D(0)]});
      mv.push({sel:'A1', keys:[{key:'Home',ctrl:true}]});
      return mv; }` },
  { key: 'modeltour', name: 'subtotals rebuilt in REVERSE (typed, ☆ forfeited), margins filled right, both dresses via the Ctrl+1 dialog (C / P)', moves: `C => { const o=C._o, MG=C._marg, LC=colLetter(1+C._NC);
      const steps=C._m.slice().reverse().map(x=>({sel:x.k, keys:[...T('='+x.disp),{key:'Enter'}]}));
      MG.forEach(g=>{ steps.push({sel:'B'+g.r, keys:[...T('=B'+g.num+'/B3'),{key:'Enter'}]});
                      steps.push({sel:'B'+g.r+':'+LC+g.r, keys:[{key:'r',ctrl:true}]}); });
      steps.push({sel:C._niRng, keys:[{key:'1',ctrl:true},L('c')]});
      steps.push({sel:o.mr0, keys:[{key:'1',ctrl:true},L('p')]});
      steps.push({sel:o.mr1, keys:[{key:'1',ctrl:true},L('p')]});
      steps.push({sel:'A1', keys:[{key:'Home',ctrl:true}]});
      return steps; }` },
  /* r448 (DEPTH_PASS §4.81 depth pass): REPLACES the pre-depth-pass nwcsched alt, which drove the
     retired ROWS:11 board by hard-coded geometry (B4/B5/B6/B7/C8 and C._dso/_dio/_dpo, all gone
     with the rebuild). ALT 1 is the chord-ROUTE alt and EARNS the ☆ by the ribbon door; ALT 2 is
     the op-ORDER alt and the ☆'s SKIPPABILITY PROOF (§1.0-R2(i)) — the taught per-line route,
     every core clearing with the star dark. */
  { key: 'nwcsched', name: 'Cell Styles gallery for the blue pass AND for the total rule, an addition chain instead of SUM, the ribbon fill takes the block across — the ☆ earned by the other door', moves: `C => { const o=C._o, F1=o.Y1;
      const ent={key:'Enter'}, alt={key:'Alt'}, rt={key:'ArrowRight'};
      const sU={key:'ArrowUp',shift:true}, sD={key:'ArrowDown',shift:true}, sR={key:'ArrowRight',shift:true};
      return [
        {sel:o.CD+o.rDSO, keys:[...T(String(o.dso)),ent,...T(String(o.dio)),ent,...T(String(o.dpo)),ent]},
        {sel:o.CD+o.rDPO, keys:[sU,sU,alt,L('h'),L('j'),rt,ent]},                       // Alt H J → Input = the blue swatch's twin
        {sel:F1+o.rAR, keys:[...T('='+F1+o.rRev+'/365*$'+o.CD+'$'+o.rDSO),ent,
                             ...T('='+F1+o.rCog+'/365*$'+o.CD+'$'+o.rDIO),ent,
                             ...T('=-'+F1+o.rCog+'/365*$'+o.CD+'$'+o.rDPO),ent,
                             ...T('='+F1+o.rAR+'+'+F1+o.rINV+'+'+F1+o.rAP),ent,        // addition chain, not SUM
                             ...T('='+F1+o.rNWC+'-'+o.Y0+o.rNWC),ent]},
        {sel:F1+o.rAR, keys:[sD,sD,sD,sD,sR,sR,sR,sR,alt,L('h'),L('f'),L('i'),L('r')]}, // the ribbon fill still stamps S.fillOps → ☆
        {sel:F1+o.rCHG, keys:[sR,sR,sR,sR,alt,L('h'),L('j'),rt,rt,rt,rt,ent]},          // Alt H J → Total = bold + the rule above
      ]; }` },
  { key: 'nwcsched', name: 'drivers typed bottom-up and coloured one cell at a time, inventory+payables built before receivables, per-line fills, the change row dressed in its first cell so the dress rides the fill — the ☆ forfeited, every core clears', moves: `C => { const o=C._o, F1=o.Y1;
      const ent={key:'Enter'}, alt={key:'Alt'}, rt={key:'ArrowRight'};
      const sD={key:'ArrowDown',shift:true}, sR={key:'ArrowRight',shift:true};
      const blue=[alt,L('h'),L('f'),L('c'),rt,rt,rt,rt,ent];
      return [
        {sel:o.CD+o.rDPO, keys:[...T(String(o.dpo)),ent]},
        {sel:o.CD+o.rDIO, keys:[...T(String(o.dio)),ent]},
        {sel:o.CD+o.rDSO, keys:[...T(String(o.dso)),ent]},
        {sel:o.CD+o.rDPO, keys:blue},
        {sel:o.CD+o.rDIO, keys:blue},
        {sel:o.CD+o.rDSO, keys:blue},
        {sel:F1+o.rINV, keys:[...T('='+F1+o.rCog+'/365*$'+o.CD+'$'+o.rDIO),ent,
                              ...T('=-'+F1+o.rCog+'/365*$'+o.CD+'$'+o.rDPO),ent]},
        {sel:F1+o.rINV, keys:[sD,sR,sR,sR,sR,{key:'r',ctrl:true}]},                     // two lines, one fill — still not the block
        {sel:F1+o.rAR, keys:[...T('='+F1+o.rRev+'/365*$'+o.CD+'$'+o.rDSO),ent]},
        {sel:F1+o.rAR, keys:[sR,sR,sR,sR,{key:'r',ctrl:true}]},
        {sel:F1+o.rNWC, keys:[...T('=SUM('+F1+o.rAR+':'+F1+o.rAP+')'),ent]},
        {sel:F1+o.rNWC, keys:[sR,sR,sR,sR,{key:'r',ctrl:true}]},
        {sel:F1+o.rCHG, keys:[...T('='+F1+o.rNWC+'-'+o.Y0+o.rNWC),ent]},
        {sel:F1+o.rCHG, keys:[{key:'b',ctrl:true},alt,L('h'),L('b'),L('p')]},           // dress ONE cell first
        {sel:F1+o.rCHG, keys:[sR,sR,sR,sR,{key:'r',ctrl:true}]},                        // the fill carries bold + the rule across
      ]; }` },
  /* r444 §4.64 depth pass — REPLACES the single pre-depth-pass retbridge entry, which drove the
     retired 14-row board by hard-coded geometry (B9/B10/B11/B12/B14, all gone with the rebuild:
     the board now jitters its corner, so nothing may name a cell that is not read off C._o).
     ALT 1 is the chord-ROUTE + op-ORDER alt and EARNS the ☆ by the other fill door; ALT 2 is the
     MEASURED negative control — every core clears with the ☆ dark (dev/verify-retbridge.js §3). */
  { key: 'retbridge', name: 'bridge built BOTTOM-UP (paydown, multiple, growth), operands reversed, autosum by the RANGE form, F4 anchors instead of typed dollars, share column filled from the RIBBON (alt h f i d), check recomputing the gain inline — ☆ still earned', moves: `C => { const o=C._o; return [
      {sel:o.CB+o.rD,   keys:[...T('=-('+o.CC+o.rNd+'-'+o.CB+o.rNd+')'),{key:'Enter'}]},
      {sel:o.CB+o.rM,   keys:[...T('='+o.CC+o.rEbt+'*('+o.CC+o.rMlt+'-'+o.CB+o.rMlt+')'),{key:'Enter'}]},
      {sel:o.CB+o.rG,   keys:[...T('='+o.CB+o.rMlt+'*('+o.CC+o.rEbt+'-'+o.CB+o.rEbt+')'),{key:'Enter'}]},
      {sel:o.CB+o.rG+':'+o.CB+o.rTot, keys:[{key:'=',alt:true,code:'Equal'}]},
      {sel:o.CC+o.rG,   keys:[...T('='+o.CB+o.rG+'/'+o.CB+o.rTot),{key:'F4'},{key:'Enter'}]},
      {sel:o.CC+o.rG,   keys:[{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
      {sel:o.CB+o.rChk, keys:[...T('='+o.CB+o.rTot+'-('+o.CC+o.rEq+'-'+o.CB+o.rEq+')'),{key:'Enter'}]},
    ]; }` },
  { key: 'retbridge', name: 'NEGATIVE CONTROL — every lever written out as two products, the total as a typed addition chain, all three shares typed one at a time with no anchor and no fill anywhere, check written the long way: all six cores clear, ☆ DARK', moves: `C => { const o=C._o; return [
      {sel:o.CB+o.rG,   keys:[...T('='+o.CC+o.rEbt+'*'+o.CB+o.rMlt+'-'+o.CB+o.rEbt+'*'+o.CB+o.rMlt),{key:'Enter'}]},
      {sel:o.CB+o.rM,   keys:[...T('='+o.CC+o.rMlt+'*'+o.CC+o.rEbt+'-'+o.CB+o.rMlt+'*'+o.CC+o.rEbt),{key:'Enter'}]},
      {sel:o.CB+o.rD,   keys:[...T('='+o.CB+o.rNd+'-'+o.CC+o.rNd),{key:'Enter'}]},
      {sel:o.CB+o.rTot, keys:[...T('='+o.CB+o.rG+'+'+o.CB+o.rM+'+'+o.CB+o.rD),{key:'Enter'}]},
      {sel:o.CC+o.rG,   keys:[...T('='+o.CB+o.rG+'/'+o.CB+o.rTot),{key:'Enter'}]},
      {sel:o.CC+o.rM,   keys:[...T('='+o.CB+o.rM+'/'+o.CB+o.rTot),{key:'Enter'}]},
      {sel:o.CC+o.rD,   keys:[...T('='+o.CB+o.rD+'/'+o.CB+o.rTot),{key:'Enter'}]},
      {sel:o.CB+o.rChk, keys:[...T('=-('+o.CB+o.rAct+'-'+o.CB+o.rTot+')'),{key:'Enter'}]},
    ]; }` },
  /* r446 (schedule ROUND 1 depth pass, DEPTH_PASS §4.68): REPLACES the single pre-depth-pass
     entry, which drove the retired ROWS:9 board by hard-coded geometry (B4/B5/C2/B7 — every one
     of those rows moved). ALT 1 is the chord-ROUTE + op-ORDER alt and still EARNS the ☆ by the
     ribbon fill door; ALT 2 is the MEASURED negative control — every core clears with the ☆
     dark, which is the §1.0-R2(i) skippability proof (184 keys against the taught 64). */
  { key: 'schedule', name: 'AUTOSUM writes the closing line, ribbon fills throughout (alt h f i r), Alt H 1 bold + Alt H B S perimeter rule, memo by expanding anchored SUM filled from year one — ☆ still earned', moves: `C => { const o=C._o, R=o.R;
      const sr={key:'ArrowRight',shift:true}, sd={key:'ArrowDown',shift:true};
      const rib=[{key:'Alt'},L('h'),L('f'),L('i'),L('r')];
      return [
        {sel:o.CB+R.dep, keys:[...T('=-$'+o.CB+'$'+R.rate+'*'+o.CB+R.beg),{key:'Enter'}]},   // rate FIRST, anchor typed
        {sel:o.CB+R.beg, keys:[sd,sd,sd,sd,{key:'=',alt:true,code:'Equal'}]},                 // alt+= over the block THROUGH the empty closing cell
        {sel:o.CC+R.beg, keys:[...T('='+o.CB+R.end),{key:'Enter'}]},
        {sel:o.CC+R.beg, keys:[sr,sr,sr, ...rib]},
        {sel:o.CB+R.dep, keys:[sr,sr,sr,sr,sd, ...rib]},                                      // one rectangle over both roll lines
        {sel:o.CA+R.end, keys:[sr,sr,sr,sr,sr,{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('s')]},   // ribbon bold + OUTSIDE border
        {sel:o.CB+R.acc, keys:[...T('=$'+o.CB+'$'+R.acc0+'+SUM($'+o.CB+'$'+R.dep+':'+o.CB+R.dep+')'),{key:'Enter'}]},
        {sel:o.CB+R.acc, keys:[sr,sr,sr,sr, ...rib]},                                         // the expanding anchor fills from YEAR ONE
      ]; }` },
  { key: 'schedule', name: 'NEGATIVE CONTROL — every later year typed, rate unanchored, addition chain for the closing line, ALL-BORDERS dress cell by cell, no fill anywhere — all five cores clear, ☆ forfeited', moves: `C => { const o=C._o, R=o.R, Y=o.YC; const mv=[];
      for(let i=0;i<5;i++){ const c=Y[i], p=Y[i-1];
        if(i>0) mv.push({sel:c+R.beg, keys:[...T('='+p+R.end),{key:'Enter'}]});
        mv.push({sel:c+R.dep, keys:[...T('=-'+c+R.beg+'*$'+o.CB+'$'+R.rate),{key:'Enter'}]});
        mv.push({sel:c+R.end, keys:[...T('='+c+R.beg+'+'+c+R.mnt+'+'+c+R.grw+'+'+c+R.dep),{key:'Enter'}]});
      }
      mv.push({sel:Y[0]+R.acc, keys:[...T('=$'+o.CB+'$'+R.acc0+'+'+Y[0]+R.dep),{key:'Enter'}]});
      for(let i=1;i<5;i++) mv.push({sel:Y[i]+R.acc, keys:[...T('='+Y[i-1]+R.acc+'+'+Y[i]+R.dep),{key:'Enter'}]});
      for(let i=0;i<5;i++) mv.push({sel:Y[i]+R.end, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('a')]});   // Alt H B A writes ball, never bt — the route the predicate was widened for
      return mv; }` },
  /* r446 (DEPTH_PASS §4.69, `intsched` depth pass) — intsched was one of the nine ZERO-ALTS
     drills §1.8 names, and its board was rebuilt from 11 rows to 20, so there is nothing to
     carry forward: these are its first two entries and neither replaces anything.
     ALT 1 = chord ROUTE — AutoSum instead of a typed SUM, both fills off the ribbon
     (Alt H F I R), the ending row dressed FIGURES-ONLY with Alt H 1 and the outside-border
     walk Alt H B S, and the coverage multiple set outright by the absolute Ctrl+1 → X route.
     The ☆ still fires, because Alt H F I R hits the same S.fillOps latch as Ctrl+R (§1.0(c):
     no route is penalised).
     ALT 2 = op ORDER **and the ☆'s measured negative control** — the P&L feeds are built for
     year one BEFORE the debt rolls, the coverage row is set to one place while it is still
     empty, the roll and the link land after them, the dress closes the run, and every
     remaining feed year is TYPED. All six cores clear with the re-cut fill-☆ DARK — measured
     164 keys against the demo's 68, flat over 3 seeds. */
  { key: 'intsched', name: 'chord ROUTE — beat 1 by alt+= over the block, both rolls filled off the ribbon (Alt H F I R), the ending row dressed figures-only via Alt H 1 + the outside-border walk Alt H B S, the coverage multiple set outright by Ctrl+1 → X; the ☆ still fires on the ribbon fill', moves: `C => { const o=C._o;
      const R={key:'ArrowRight',shift:true}, DN={key:'ArrowDown',shift:true};
      return [
        {sel:o.CB+o.rBeg, keys:[DN,DN,DN,{key:'=',alt:true,code:'Equal'}]},                       // AutoSum down through the empty ending cell
        {sel:o.CC+o.rBeg, keys:[...T('='+o.CB+o.rEnd),{key:'Enter'}]},
        {sel:o.CC+o.rBeg, keys:[R,R,R,{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},                  // ribbon fill, not ctrl+r
        {sel:o.CB+o.rEnd, keys:[R,R,R,R,{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
        {sel:o.CB+o.rEnd, keys:[R,R,R,R,{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('s')]},  // figures only; Alt H 1 = bold, Alt H B S = the perimeter, which draws the top rule
        {sel:o.CB+o.rInt, keys:[...T('='+o.CB+o.rBeg+'*($'+o.CB+'$'+o.rRate+'+$'+o.CB+'$'+o.rSprd+')'),{key:'Enter'}]},
        {sel:o.CB+o.rCov, keys:[...T('='+o.CB+o.rEbit+'/'+o.CB+o.rInt),{key:'Enter'}]},
        {sel:o.CB+o.rCov, keys:[{key:'1',ctrl:true},L('x')]},                                     // Ctrl+1 → X sets the multiple at one place outright
        {sel:o.CB+o.rInt, keys:[R,R,R,R,DN,{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},             // the ☆, taken off the ribbon
      ]; }` },
  { key: 'intsched', name: 'op ORDER AND the ☆\'s negative control — the P&L feeds built for year one before the debt rolls, the coverage row set to one place while still empty, roll + link after them, dress last, and every remaining feed year TYPED: all six cores clear with the re-cut fill-☆ forfeited and DARK (164 keys against the demo\'s 68)', moves: `C => { const o=C._o;
      const R={key:'ArrowRight',shift:true}, CL=o.cols, st=[];
      st.push({sel:o.CB+o.rInt, keys:[...T('='+o.CB+o.rBeg+'*($'+o.CB+'$'+o.rRate+'+$'+o.CB+'$'+o.rSprd+')'),{key:'Enter'}]});
      st.push({sel:o.CB+o.rCov, keys:[...T('='+o.CB+o.rEbit+'/'+o.CB+o.rInt),{key:'Enter'}]});
      /* the decimal pass runs over the whole coverage row while four of its five cells are
         still EMPTY — a typed formula keeps the cell's number format (commitEdit only writes
         formula/value), so the beat is satisfied by the cells the player fills in afterwards */
      st.push({sel:o.CB+o.rCov, keys:[R,R,R,R,{key:'Alt'},L('h'),D(9)]});
      st.push({sel:o.CB+o.rEnd, keys:[...T('='+o.CB+o.rBeg+'+'+o.CB+o.rAmrt+'+'+o.CB+o.rPre),{key:'Enter'}]});   // addition chain, not SUM
      st.push({sel:o.CB+o.rEnd, keys:[R,R,R,R,{key:'r',ctrl:true}]});
      st.push({sel:o.CC+o.rBeg, keys:[...T('='+o.CB+o.rEnd),{key:'Enter'}]});
      st.push({sel:o.CC+o.rBeg, keys:[R,R,R,{key:'r',ctrl:true}]});
      for(let i=1;i<5;i++) st.push({sel:CL[i]+o.rInt, keys:[...T('='+CL[i]+o.rBeg+'*($'+o.CB+'$'+o.rRate+'+$'+o.CB+'$'+o.rSprd+')'),{key:'Enter'}]});
      for(let i=1;i<5;i++) st.push({sel:CL[i]+o.rCov, keys:[...T('='+CL[i]+o.rEbit+'/'+CL[i]+o.rInt),{key:'Enter'}]});
      st.push({sel:o.CA+o.rEnd, keys:[R,R,R,R,R,{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]});          // the dress closes the run
      return st; }` },
  /* r439: REPLACES the pre-depth-pass signerr alt, which drove the retired 10-row board by
     hard-coded geometry (B10/B8/B4 and C._flips/C._mag, all gone with the rebuild). ALT 1 is the
     chord-ROUTE + op-ORDER alt and EARNS the ☆ by the other paste-special door; ALT 2 is the
     MEASURED negative control — every core clears with the ☆ dark. */
  { key: 'signerr', name: 'margin and EBIT laid BEFORE the sweep, ribbon fills, the OTHER paste-special door (alt h v s) — ☆ still earned', moves: `C => { const o=C._o, y=o.yc[0], bc=o.yc[o.bad];
      return [
        {sel:y+o.rMg, keys:[...T('='+y+o.rEbit+'/'+y+o.rRev),{key:'Enter'}]},
        {sel:o.mgRng, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
        {sel:o.mgRng, keys:[{key:'1',ctrl:true},L('p')]},
        {sel:y+o.rEbit, keys:[...T('='+y+o.rRev+'+'+y+o.rCost1+'+'+y+(o.rCost1+1)+'+'+y+(o.rCost1+2)),{key:'Enter'}]},
        {sel:o.ebitRng, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
        {sel:o.ebitRng, keys:[{key:'Alt'},L('h'),D(1)]},
        {sel:o.ebitRng, keys:[{key:'Alt'},L('h'),L('b'),L('d')]},
        {sel:o.helper, keys:[{key:'c',ctrl:true}]},
        {sel:bc+o.rCost1+':'+bc+(o.rCost1+2), keys:[{key:'Alt'},L('h'),L('v'),L('s'),L('m'),{key:'Enter'}]},
      ]; }` },
  { key: 'signerr', name: 'NEGATIVE CONTROL — the three figures retyped in accounting parens, EBIT and margin typed year by year, alt h p + alt h 0: every core clears, ☆ DARK', moves: `C => { const o=C._o, bc=o.yc[o.bad], mv=[];
      for(let i=0;i<3;i++) mv.push({sel:bc+(o.rCost1+i), keys:[...T('('+Math.abs(o.cost[o.bad][i])+')'),{key:'Enter'}]});
      for(let j=0;j<o.NY;j++){ const Y=o.yc[j];
        mv.push({sel:Y+o.rEbit, keys:[...T('=SUM('+Y+o.rRev+':'+Y+(o.rRev+3)+')'),{key:'Enter'}]});
        mv.push({sel:Y+o.rMg,   keys:[...T('='+Y+o.rEbit+'/'+Y+o.rRev),{key:'Enter'}]}); }
      mv.push({sel:o.ebitRng, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('s')]});
      mv.push({sel:o.mgRng,   keys:[{key:'Alt'},L('h'),L('p'),{key:'Alt'},L('h'),D(0)]});
      return mv; }` },
  /* r445 (DEPTH_PASS §4.66): REPLACES the pre-depth-pass sourcesuses alt, which drove the retired
     12-row board by hard-coded geometry ('B5'/'C2:C5'/'B9'/'B10'/'C7:C10'/'B12', all gone with the
     rebuild — the board is corner-jittered now and every row moved). ALT 1 is the chord-ROUTE +
     op-ORDER alt and EARNS the ☆ through the ribbon's fill; ALT 2 is the MEASURED negative control
     — every core clears, ☆ dark. */
  { key: 'sourcesuses', name: 'check row FIRST, both totals by alt+= autosum, the plug off a SUM of the committed lines, both percent columns filled from the ribbon (alt h f i d), whole-row shift+space dress with the outside-border box (alt h b s) and alt h 1 bold — the ☆ still lands', moves: `C => { const o=C._o, R=o.R, CB=o.CB, CC=o.CC,
      dn={key:'ArrowDown',shift:true}, SS={key:' ',shift:true}, RIB=[{key:'Alt'},L('h'),L('f'),L('i'),L('d')];
      return [
        {sel:CB+R.ck, keys:[...T('='+CB+R.ts+'-'+CB+R.tu),{key:'Enter'}]},
        {sel:CB+R.tu, keys:[{key:'=',alt:true,code:'Equal'},{key:'Enter'}]},
        {sel:CB+R.pl, keys:[...T('='+CB+R.tu+'-SUM('+CB+R.s0+':'+CB+R.sN+')'),{key:'Enter'}]},
        {sel:CB+R.ts, keys:[{key:'=',alt:true,code:'Equal'},{key:'Enter'}]},
        {sel:CC+R.s0, keys:[...T('='+CB+R.s0+'/'+CB+R.ts),{key:'F4'},{key:'Enter'}]},
        {sel:CC+R.s0, keys:[dn,dn,dn,dn,...RIB]},
        {sel:CC+R.u0, keys:[...T('='+CB+R.u0+'/'+CB+R.tu),{key:'F4'},{key:'Enter'}]},
        {sel:CC+R.u0, keys:[dn,dn,dn,dn,...RIB]},
        {sel:o.CA+R.ts, keys:[SS,{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('s')]},
        {sel:o.CA+R.tu, keys:[SS,{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('s')]},
      ]; }` },
  { key: 'sourcesuses', name: 'NEGATIVE CONTROL — both totals as addition chains, the plug spelled out line by line, the check written the other way round, all ten percents typed cell by cell with no anchor, figures-only dress via alt h b a (which stores ball, not bt): every core clears, ☆ DARK', moves: `C => { const o=C._o, R=o.R, CB=o.CB, CC=o.CC, mv=[];
      mv.push({sel:CB+R.tu, keys:[...T('='+CB+R.u0+'+'+CB+(R.u0+1)+'+'+CB+(R.u0+2)+'+'+CB+R.uN),{key:'Enter'}]});
      mv.push({sel:CB+R.pl, keys:[...T('='+CB+R.tu+'-'+CB+R.s0+'-'+CB+(R.s0+1)+'-'+CB+R.sN),{key:'Enter'}]});
      mv.push({sel:CB+R.ts, keys:[...T('='+CB+R.s0+'+'+CB+(R.s0+1)+'+'+CB+R.sN+'+'+CB+R.pl),{key:'Enter'}]});
      mv.push({sel:CB+R.ck, keys:[...T('=-('+CB+R.tu+'-'+CB+R.ts+')'),{key:'Enter'}]});
      for(let i=0;i<=4;i++) mv.push({sel:CC+(R.u0+i), keys:[...T('='+CB+(R.u0+i)+'/'+CB+R.tu),{key:'Enter'}]});
      for(let i=0;i<=4;i++) mv.push({sel:CC+(R.s0+i), keys:[...T('='+CB+(R.s0+i)+'/'+CB+R.ts),{key:'Enter'}]});
      [R.tu,R.ts].forEach(r=>mv.push({sel:CB+r, keys:[{key:'ArrowRight',shift:true},{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('a')]}));
      return mv; }` },
  { key: 'stalelink', name: 'reverse order (v1 cleared FIRST, lines re-pointed by copying a healthy year, operands swapped), alt h j Link, alt h e c, ribbon fill, alt h b s — ☆ still earned', moves: `C => { const o=C._o, y=o.yc[0], mv=[];
      mv.push({sel:o.deadRng, keys:[{key:'Alt'},L('h'),L('e'),L('c')]});
      for(let i=2;i>=0;i--){ const j=o.stale[i], Lc=o.yc[j], r=o.hr+2+i;
        const good=o.yc.find(x=>x!==Lc);
        mv.push({sel:good+r, keys:[{key:'c',ctrl:true}]});
        mv.push({sel:Lc+r,   keys:[{key:'v',ctrl:true}]}); }
      mv.push({sel:o.linkRng, keys:[{key:'Alt'},L('h'),L('j'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]});
      mv.push({sel:y+(o.hr+6), keys:[...T('=('+y+(o.hr+2)+'-'+y+(o.hr+3)+'-'+y+(o.hr+4)+')/'+y+(o.hr+2)),{key:'Enter'}]});
      mv.push({sel:y+(o.hr+5), keys:[...T('='+y+(o.hr+2)+'-'+y+(o.hr+4)+'-'+y+(o.hr+3)),{key:'Enter'}]});
      mv.push({sel:o.blockRng, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]});
      mv.push({sel:o.contribRng, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('s')]});
      return mv; }` },
  { key: 'stalelink', name: 'NEGATIVE CONTROL — every re-point retyped in full and the contribution block typed year by year, no fill anywhere: every core clears, ☆ DARK', moves: `C => { const o=C._o, mv=[];
      for(let i=0;i<3;i++){ const j=o.stale[i], Lc=o.yc[j];
        const dep = i===0 ? Lc+(o.hr+1) : Lc+(o.hr+2);
        mv.push({sel:Lc+(o.hr+2+i), keys:[...T('=$'+o.cV+'$'+(o.pr+1+i)+'*'+dep),{key:'Enter'}]}); }
      mv.push({sel:o.linkRng, keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowLeft'},{key:'ArrowLeft'},{key:'Enter'}]});
      mv.push({sel:o.deadRng, keys:[{key:'Delete'}]});
      for(let j=0;j<o.NY;j++){ const Y=o.yc[j];
        mv.push({sel:Y+(o.hr+5), keys:[...T('='+Y+(o.hr+2)+'-'+Y+(o.hr+3)+'-'+Y+(o.hr+4)),{key:'Enter'}]});
        mv.push({sel:Y+(o.hr+6), keys:[...T('='+Y+(o.hr+5)+'/'+Y+(o.hr+2)),{key:'Enter'}]}); }
      mv.push({sel:o.contribRng, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]});
      return mv; }` },
  /* r435: REPLACES the pre-depth-pass sumif alt, which drove the retired fixed-geometry board
     (hard-coded D5:E5 / E2:E4 / '=SUMIF($A$2:$A$10,D2,$B$2:$B$10)') and could only fail once the
     board started randomising its anchor, its header row and its segment count. Same character
     as the entry it replaces — dress FIRST, foot and mix before the rollup exists — rebuilt on
     C._o, and carrying the SECOND ☆-skip route: two segments are hand-typed and the fill starts
     on the SECOND row, so no single op covers the column and the star stays dark while all five
     cores clear. Third distinct border route on the board too (Alt H B D, top and bottom). */
  { key: 'sumif', name: 'dress FIRST (alt h b d), foot + mix before the rollup exists, ctrl+1 percent, two segments hand-typed and the rollup filled from the SECOND row — cores clear, ☆ dark', moves: `C => { const o=C._o; return [
      {sel:o.totRng,     keys:[{key:'b',ctrl:true}]},
      {sel:o.totRng,     keys:[{key:'Alt'},L('h'),L('b'),L('d')]},                                  // top AND bottom — the top edge is what the beat reads
      {sel:o.LR+o.rT,    keys:[...T('=SUM('+o.LR+o.r1+':'+o.LR+o.rn+')'),{key:'Enter'}]},           // foots an empty block: zero until the rollup lands
      {sel:o.LP+o.r1,    keys:[...T('='+o.LR+o.r1+'/$'+o.LR+'$'+o.rT),{key:'Enter'}]},
      {sel:o.pctRng,     keys:[{key:'d',ctrl:true}]},
      {sel:o.pctRng,     keys:[{key:'1',ctrl:true},L('p')]},
      {sel:o.LR+o.r1,    keys:[...T('=SUMIF('+o.critR+','+o.LM+o.r1+','+o.sumR+')'),{key:'Enter'}]},
      {sel:o.LR+(o.r1+1),keys:[...T('=SUMIF('+o.critR+','+o.LM+(o.r1+1)+','+o.sumR+')'),{key:'Enter'}]},
      {sel:o.LR+(o.r1+1)+':'+o.LR+o.rn, keys:[{key:'d',ctrl:true}]},                                 // starts one row low — no single op covers the column
    ]; }` },
  /* r448 (DEPTH_PASS §4.82 depth pass) — BOTH threestmt entries are NEW; the single pre-r448
     entry ("balance sheet BEFORE the CFS — RE roll and check first, cash spine last") is
     DELETED, because every cell it names (B5/B7/C6/B9/B11/C13/B14) belongs to the retired
     ROWS:14 geometry and to beats this pass no longer has. ALT 1 = chord ROUTE (ribbon fills
     Alt H F I R · Alt H 1 bold · Alt H B S outside border, the RE roll read off the CASH FLOW
     net income rather than the statement line, and the check written the other way round and
     negated with every ref $-anchored) — the ☆ still latches, because a ribbon fill is a fill.
     ALT 2 = op ORDER (the check row dressed and built FIRST, while it still reads a non-zero
     number, then the balance sheet, then the cash flow wire last — recalc closes it) AND the
     ☆'s second mechanic: a Ctrl+Enter commit into the whole year strip instead of a fill. */
  { key: 'threestmt', name: 'RIBBON routes throughout (Alt H F I R fills · Alt H 1 bold · Alt H B S outside border), the RE roll off the cash flow net income, the check negated and $-anchored — the ☆ still latches', moves: `C => { const o=C._o;
      const R={key:'ArrowRight',shift:true};
      const FR=[{key:'Alt'},L('h'),L('f'),L('i'),L('r')];
      return [
        {sel:o.Y0+o.rCni,  keys:[...T('='+o.Y0+o.rNi),{key:'Enter'}]},
        {sel:o.Y0+o.rCni,  keys:[R,R,...FR]},
        {sel:o.Y0+o.rCash, keys:[...T('=SUM('+o.Y0+o.rEcash+')'),{key:'Enter'}]},
        {sel:o.Y0+o.rCash, keys:[R,R,...FR]},
        {sel:o.Y1+o.rRe,   keys:[...T('='+o.Y1+o.rCni+'+'+o.Y0+o.rRe),{key:'Enter'}]},
        {sel:o.Y1+o.rRe,   keys:[R,...FR]},
        {sel:o.Y0+o.rChk,  keys:[...T('=-($'+o.Y0+'$'+o.rTle+'-$'+o.Y0+'$'+o.rTa+')'),{key:'Enter'}]},
        {sel:o.Y1+o.rChk,  keys:[...T('=-($'+o.Y1+'$'+o.rTle+'-$'+o.Y1+'$'+o.rTa+')'),{key:'Enter'}]},
        {sel:o.Y2+o.rChk,  keys:[...T('=-($'+o.Y2+'$'+o.rTle+'-$'+o.Y2+'$'+o.rTa+')'),{key:'Enter'}]},
        {sel:o.CA+o.rChk,  keys:[R,R,R,{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('s')]},
      ]; }` },
  { key: 'threestmt', name: 'op ORDER — check row dressed and built FIRST (non-zero on screen), then the balance sheet, the cash flow wire LAST; every line committed with ctrl+enter instead of a fill', moves: `C => { const o=C._o;
      const R={key:'ArrowRight',shift:true}, CE={key:'Enter',ctrl:true};
      return [
        {sel:o.CA+o.rChk,  keys:[R,R,R,{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]},
        {sel:o.Y0+o.rChk,  keys:[R,R,...T('='+o.Y0+o.rTa+'-'+o.Y0+o.rTle),CE]},
        {sel:o.Y1+o.rRe,   keys:[R,...T('='+o.Y0+o.rRe+'+'+o.Y1+o.rNi),CE]},
        {sel:o.Y0+o.rCash, keys:[R,R,...T('=+'+o.Y0+o.rEcash),CE]},
        {sel:o.Y0+o.rCni,  keys:[R,R,...T('='+o.Y0+o.rNi),CE]},
      ]; }` },
  /* r449 (DEPTH_PASS §4.83 depth pass) — BOTH opmodel entries are NEW; opmodel was one of the
     nine zero-ALT drills §1.8 names, so nothing is DELETED here. ALT 1 = chord ROUTE (ribbon
     fill Alt H F I R for the carry, Alt H 1 for bold, Alt H B S for the rule, Alt H P + Alt H 0
     for the percent, and an addition chain instead of SUM) — it is ALSO the measured ☆ NEGATIVE
     CONTROL, because a fill is not a paste and the star latches on S.pasteLog alone. ALT 2 =
     op ORDER (the total row dressed while it is still empty, the cost lines and the subtotal
     built BEFORE the revenue they read, price before units, the memo last) with column-only
     anchors and SEVEN separate row fills — cores clear, ☆ dark again. The ☆ state itself is
     asserted in dev/verify-opmodel.js §B; this harness grades the win and never the star. */
  { key: 'opmodel', name: 'RIBBON routes throughout (Alt H F I R carries the block · Alt H 1 bold · Alt H B S rule · Alt H P then Alt H 0 for the percent), EBITDA as an addition chain instead of SUM — every core clears and the ☆ is DARK, because a fill is not a paste', moves: `C => { const o=C._o;
      const YC=i=>colLetter(o.cA+i), P=[0,1,2,3,4,5].map(YC);
      const FR=[{key:'Alt'},L('h'),L('f'),L('i'),L('r')];
      return [
        {sel:P[1]+o.rVol, keys:[...T('='+P[0]+o.rVol+'*(1+'+o.gUA+')'),{key:'Enter'},
                                ...T('='+P[0]+o.rPrc+'*(1+'+o.gPA+')'),{key:'Enter'}]},
        {sel:P[1]+o.rRev, keys:[...T('='+P[1]+o.rPrc+'*'+P[1]+o.rVol),{key:'Enter'},
                                ...T('=-'+o.ucA+'*'+P[1]+o.rVol),{key:'Enter'},
                                ...T('=-'+o.oPA+'*'+P[1]+o.rRev),{key:'Enter'},
                                ...T('='+P[1]+o.rRev+'+'+P[1]+o.rCog+'+'+P[1]+o.rOpx),{key:'Enter'}]},
        {sel:P[1]+o.rMgn, keys:[...T('='+P[1]+o.rEbd+'/'+P[1]+o.rRev),{key:'Enter'}]},
        {sel:P[1]+o.rMgn, keys:[{key:'Alt'},L('h'),L('p'),{key:'Alt'},L('h'),D(0)]},
        {sel:o.planAll,   keys:FR},
        {sel:o.ebdRow,    keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('s')]},
      ]; }` },
  { key: 'opmodel', name: 'op ORDER — the total row dressed FIRST while it is empty, then the cost lines and the subtotal built BEFORE the revenue they read (recalc closes them), price before units, the memo last; column-only anchors and seven separate row fills — every core clears, ☆ DARK', moves: `C => { const o=C._o;
      const YC=i=>colLetter(o.cA+i), P=[0,1,2,3,4,5].map(YC);
      const A=colLetter(o.cA);
      const gU='$'+A+o.rG, gP='$'+A+o.rP, uc='$'+A+o.rU, oP='$'+A+o.rO;
      const R={key:'ArrowRight',shift:true}, FR={key:'r',ctrl:true};
      const fill=r=>({sel:P[1]+r, keys:[R,R,R,R,FR]});
      return [
        {sel:o.ebdRow,    keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]},
        {sel:P[1]+o.rOpx, keys:[...T('=-'+P[1]+o.rRev+'*'+oP),{key:'Enter'}]},
        {sel:P[1]+o.rCog, keys:[...T('=-'+P[1]+o.rVol+'*'+uc),{key:'Enter'}]},
        {sel:P[1]+o.rEbd, keys:[...T('=SUM('+P[1]+o.rRev+':'+P[1]+o.rOpx+')'),{key:'Enter'}]},
        {sel:P[1]+o.rPrc, keys:[...T('='+P[0]+o.rPrc+'*(1+'+gP+')'),{key:'Enter'}]},
        {sel:P[1]+o.rVol, keys:[...T('='+P[0]+o.rVol+'*(1+'+gU+')'),{key:'Enter'}]},
        {sel:P[1]+o.rRev, keys:[...T('='+P[1]+o.rVol+'*'+P[1]+o.rPrc),{key:'Enter'}]},
        {sel:P[1]+o.rMgn, keys:[...T('='+P[1]+o.rEbd+'/'+P[1]+o.rRev),{key:'Enter'}]},
        {sel:P[1]+o.rMgn, keys:[{key:'1',ctrl:true},L('p')]},
        fill(o.rMgn), fill(o.rEbd), fill(o.rOpx), fill(o.rCog), fill(o.rRev), fill(o.rPrc), fill(o.rVol),
      ]; }` },
  /* r449 (DEPTH_PASS §4.84 depth pass): BOTH dcfbuild entries are NEW — the drill was one of the
     nine zero-ALT drills §1.8 names, and it clears that here. ALT 1 is the chord-ROUTE alt and
     EARNS the ☆ through the ribbon fill door; ALT 2 is the op-ORDER alt and the ☆'s
     SKIPPABILITY PROOF (§1.0-R2(i)) — the taught per-row route, every core clearing with the
     star dark. Nothing on this board is registered by the old pre-depth-pass geometry, so there
     is nothing to DELETE for this key. */
  { key: 'dcfbuild', name: 'RIBBON fill (Alt H F I R) takes the strip across, a COLUMN-only anchor on the WACC, the PV product commuted, enterprise value as an addition chain and the check written as SUMPRODUCT over the flows and the factors — the ☆ still latches', moves: `C => { const o=C._o, B=o.CB, LC=o.YL, Y=o.Y;
      const ent={key:'Enter'}, alt={key:'Alt'}, up={key:'ArrowUp'};
      const sR={key:'ArrowRight',shift:true}, sD={key:'ArrowDown',shift:true};
      return [
        {sel:B+o.rDF, keys:[...T('=1/(1+$'+B+o.rWACC+')^'+B+o.HR),ent,                 // column-only lock — all a fill RIGHT needs
                            ...T('='+B+o.rDF+'*'+B+o.rFCF),ent]},                      // factor x flow, the product commuted
        {sel:B+(o.rPV+1), keys:[up,up,sR,sR,sR,sR,sD,alt,L('h'),L('f'),L('i'),L('r')]}, // the ribbon fill stamps S.fillOps -> the ☆
        {sel:B+o.rTV, keys:[...T('='+LC+o.rFCF+'*(1+'+B+o.rG+')/('+B+o.rWACC+'-'+B+o.rG+')'),ent,
                            ...T('='+LC+o.rDF+'*'+B+o.rTV),ent,                        // the terminal discount, commuted
                            ...T('='+Y.map(c=>c+o.rPV).join('+')+'+'+B+o.rPVTV),ent]}, // addition chain, not SUM
        {sel:B+o.rEQ, keys:[...T('='+B+o.rEV+'-'+B+o.rND),ent]},
        {sel:B+o.rPS, keys:[...T('='+B+o.rEQ+'/'+B+o.rSH),ent]},
        {sel:B+o.rCHK, keys:[...T('=SUMPRODUCT('+B+o.rFCF+':'+LC+o.rFCF+','+B+o.rDF+':'+LC+o.rDF+')'),ent]},
      ]; }` },
  { key: 'dcfbuild', name: 'op ORDER — the check line written FIRST off the raw flows, then the bridge before enterprise value exists, then the terminal value, and the strip built per row with the PV line before the factor line — every core recalculates and clears, the ☆ forfeited', moves: `C => { const o=C._o, B=o.CB, LC=o.YL, Y=o.Y;
      const ent={key:'Enter'}, up={key:'ArrowUp'}, dn={key:'ArrowDown'};
      const sR={key:'ArrowRight',shift:true}, ctrlR={key:'r',ctrl:true};
      return [
        {sel:B+o.rCHK, keys:[...T('=NPV($'+B+'$'+o.rWACC+','+B+o.rFCF+':'+LC+o.rFCF+')'),ent]},
        {sel:B+o.rEQ, keys:[...T('='+B+o.rEV+'-'+B+o.rND),ent]},                        // written against an EMPTY enterprise value
        {sel:B+o.rPS, keys:[...T('='+B+o.rEQ+'/'+B+o.rSH),ent]},
        {sel:B+o.rTV, keys:[...T('='+LC+o.rFCF+'*(1+$'+B+'$'+o.rG+')/($'+B+'$'+o.rWACC+'-$'+B+'$'+o.rG+')'),ent]},
        {sel:B+o.rPV, keys:[...T('='+B+o.rFCF+'*'+B+o.rDF),ent, up, sR,sR,sR,sR, ctrlR]},   // the PV row BEFORE the factor row
        {sel:B+o.rDF, keys:[...T('=1/(1+$'+B+'$'+o.rWACC+')^'+B+o.HR),ent, up, sR,sR,sR,sR, ctrlR]},
        {sel:B+o.rPVTV, keys:[...T('='+B+o.rTV+'*'+LC+o.rDF),ent]},
        {sel:B+o.rEV, keys:[...T('=SUM('+B+o.rPV+':'+LC+o.rPV+')+'+B+o.rPVTV),ent]},
      ]; }` },
  { key: 'versionup', name: 'stamp FIRST, cost lines before revenue, ribbon fills, alt h f c Blue swatch, alt h b d — ☆ still earned', moves: `C => { const o=C._o, y=o.yc[0], mv=[];
      mv.push({sel:o.cL+'1', keys:[{key:'h',ctrl:true,code:'KeyH'},{key:'v'},{key:'1'},{key:'Tab'},{key:'v'},{key:'2'},{key:'Enter'}]});
      for(let i=1;i>=0;i--){ const r=o.ratioRows[i], ref='$'+o.cV+'$'+(o.pr+2+i);
        mv.push({sel:y+r, keys:[...T('=-'+ref+'*'+y+o.rRev),{key:'Enter'}]});
        mv.push({sel:o.yc[0]+r+':'+o.yc[o.NY-1]+r, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]}); }
      mv.push({sel:o.yc[1]+o.rRev, keys:[...T('='+y+o.rRev+'+'+y+o.rRev+'*$'+o.cV+'$'+(o.pr+1)),{key:'Enter'}]});
      mv.push({sel:o.revRng, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]});
      mv.push({sel:o.panelRng, keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]});
      mv.push({sel:o.ebitRng, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('d')]});
      return mv; }` },
  { key: 'versionup', name: 'NEGATIVE CONTROL — every plan year typed with no fill anywhere and the three version tags retyped one at a time: every core clears, ☆ DARK', moves: `C => { const o=C._o, mv=[];
      const g='$'+o.cV+'$'+(o.pr+1);
      for(let j=1;j<o.NY;j++) mv.push({sel:o.yc[j]+o.rRev, keys:[...T('='+o.yc[j-1]+o.rRev+'*(1+'+g+')'),{key:'Enter'}]});
      for(let i=0;i<2;i++){ const r=o.ratioRows[i], ref='$'+o.cV+'$'+(o.pr+2+i);
        for(let j=0;j<o.NY;j++) mv.push({sel:o.yc[j]+r, keys:[...T('=-'+o.yc[j]+o.rRev+'*'+ref),{key:'Enter'}]}); }
      mv.push({sel:o.panelRng, keys:[{key:'Alt'},L('h'),L('j'),{key:'ArrowRight'},{key:'Enter'}]});
      mv.push({sel:o.cL+'1',        keys:[...T(String(S.cells[o.cL+'1'].value).replace('v1','v2')),{key:'Enter'}]});
      mv.push({sel:o.cL+(o.hr+8),   keys:[...T('Tag: v2 — supersede on roll-forward'),{key:'Enter'}]});
      mv.push({sel:o.cL+(o.hr+9),   keys:[...T('Footnotes cite the v2 basis'),{key:'Enter'}]});
      mv.push({sel:o.ebitRng, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]});
      return mv; }` },
  { key: 'triage', name: 'chord ROUTE — one quarter typed then ctrl+r across, ribbon bold Alt H 1, nested IF instead of CHOOSE (☆ LIT, 63 keys)', moves: `C => { const o=C._o, CL=c=>colLetter(c);
      return [
        {sel:CL(o.c0)+o.totCostR, keys:[...T('=SUM('+CL(o.c0)+o.cost0+':'+CL(o.c0)+o.cost2+')'),{key:'Enter'}]},
        {sel:CL(o.c0)+o.totCostR, keys:[...Array.from({length:o.NQ-1},()=>({key:'ArrowRight',shift:true})),{key:'r',ctrl:true}]},
        {sel:o.costLine, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('p')]},
        {sel:o.shareK,   keys:[...T(o.shareFix),{key:'Enter'}]},
        {sel:o.selK,     keys:[...T('=IF('+o.switchK+'=1,'+CL(o.c0)+o.caseValR+',IF('+o.switchK+'=2,'+CL(o.c0+1)+o.caseValR+','+CL(o.c0+2)+o.caseValR+'))'),{key:'Enter'}]},
      ]; }` },
  { key: 'triage', name: 'op ORDER + the MEASURED NEGATIVE CONTROL — case read first, share second, then the four quarters typed separately right-to-left; no fill and no paste anywhere, dress off a Shift+Space row grab, INDEX case read (all five cores clear, ☆ DARK, 84 keys)', moves: `C => { const o=C._o, CL=c=>colLetter(c);
      const st=[{sel:o.selK,   keys:[...T('=INDEX('+CL(o.c0)+o.caseValR+':'+CL(o.c0+2)+o.caseValR+','+o.switchK+')'),{key:'Enter'}]},
                {sel:o.shareK, keys:[...T(o.shareFix),{key:'Enter'}]}];
      for(let c=o.cN;c>=o.c0;c--) st.push({sel:CL(c)+o.totCostR, keys:[...T('='+CL(c)+o.cost0+'+'+CL(c)+(o.cost0+1)+'+'+CL(c)+o.cost2),{key:'Enter'}]});
      st.push({sel:CL(o.c0)+o.totCostR, keys:[{key:' ',shift:true},{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]});
      return st; }` },
  /* r447 (wk13 ROUND 1 depth pass, DEPTH_PASS §4.75): BOTH entries rebuilt and the pre-pass entry
     DELETED — it drove B6/B8/C7/B10/J4 and the 20-row board moved every one of them. ALT 1 is the
     chord-ROUTE alt: ribbon walks end to end, the F4 anchor cycle instead of typed dollars, and
     the ☆ earned from Alt H U S rather than Alt+=. ALT 2 is the op-ORDER alt AND the §1.0-R2(i)
     SKIPPABILITY CONTROL, measured: the page is built bottom-up with nothing filled, nothing
     pasted and nothing autosummed anywhere, so all six cores clear with the ☆ DARK. */
  { key: 'wk13', name: 'RIBBON end to end — Alt H F I R fills, Alt H U S cross-foot + Alt H F I D carry (☆ earned from the ribbon side), F4 anchor cycle, Alt H 1 + Alt H B S box', moves: `C => { const o=C._o;
      const RB=(...ls)=>[{key:'Alt'}].concat(ls.map(x=>(x>='0'&&x<='9')?D(Number(x)):L(x)));
      return [
        {sel:'B'+o.rNET,  keys:[...T('=B'+o.rTR+'-B'+o.rTD),{key:'Enter'}]},
        {sel:o.netRng,    keys:RB('h','f','i','r')},
        {sel:'C'+o.rBEG,  keys:[...T('=B'+o.rEND),{key:'Enter'}]},
        {sel:o.begRng,    keys:RB('h','f','i','r')},
        {sel:'B'+o.rEND,  keys:[...T('=B'+o.rBEG+'+B'+o.rNET),{key:'Enter'}]},
        {sel:o.endRng,    keys:RB('h','f','i','r')},
        {sel:o.endRng,    keys:RB('h','1')},                                        // bold from the ribbon (Alt H 1 is Ctrl+B's twin)
        {sel:o.endRng,    keys:RB('h','b','s')},                                    // outside border on a one-row selection sets the row's TOP edge — §1.0-R3(p), the beat grades bt OR ball
        {sel:o.asRng,     keys:RB('h','u','s')},                                    // the ☆: AutoSum's ribbon route, range form, one commit
        {sel:o.totRng,    keys:RB('h','f','i','d')},
        {sel:'B'+o.rCUSH, keys:[...T('=B'+o.rEND+'-B'+o.rMIN),{key:'F4'},{key:'Enter'}]},   // F4 once = $B$n — never typed dollars
        {sel:o.cushRng,   keys:RB('h','f','i','r')},
      ]; }` },
  { key: 'wk13', name: 'op ORDER bottom-up + the MEASURED NEGATIVE CONTROL — cushion first, dress before the builds, nothing filled and nothing autosummed: 31 hand-typed formulas and nine typed SUMs (six cores clear, ☆ DARK)', moves: `C => { const o=C._o, CL=['B','C','D','E','F','G','H','I'];
      const st=[];
      CL.forEach(c=>st.push({sel:c+o.rCUSH, keys:[...T('='+c+o.rEND+'-B'+o.rMIN),{key:'Enter'}]}));      // relative ref, typed per cell — no anchor needed when nothing is filled
      st.push({sel:'B'+o.rEND, keys:[{key:' ',shift:true},{key:'b',ctrl:true}]});                        // dress from a full-row Shift+Space grab, BEFORE the row holds a number
      st.push({sel:'B'+o.rEND, keys:[{key:' ',shift:true},{key:'Alt'},L('h'),L('b'),L('a')]});           // ALL borders — every cell boxed, so the top edge is there
      CL.forEach(c=>st.push({sel:c+o.rEND, keys:[...T('='+c+o.rBEG+'+'+c+o.rNET),{key:'Enter'}]}));
      CL.slice(1).forEach((c,i)=>st.push({sel:c+o.rBEG, keys:[...T('='+CL[i]+o.rEND),{key:'Enter'}]}));
      CL.forEach(c=>st.push({sel:c+o.rNET, keys:[...T('='+c+o.rTR+'-'+c+o.rTD),{key:'Enter'}]}));
      o.jrows.forEach(r=>st.push({sel:'J'+r, keys:[...T('=SUM(B'+r+':I'+r+')'),{key:'Enter'}]}));
      return st; }` },
  /* r428 (combo ROUND 2, DEPTH_PASS §4.17): ALT 1 is the chord-ROUTE alt AND the §1.0(c)
     freedom proof for the re-cut ☆ — the slow comma route (ctrl+shift+! then two decimal
     walks), blue picked by walking the swatches the other way, and the width TYPED instead of
     autofitted. Every core beat clears; the ☆ must NOT fire (no dec:0 comma op is ever
     written). ALT 2 is the op-ORDER alt: the page is dressed back-to-front, and the dialog
     route still earns the star from a different place in the run. */
  { key: 'combo', name: 'slow comma route (ctrl+shift+! + two decimal walks — ☆ forfeited), ribbon bold, swatches walked LEFT to blue, width TYPED via alt h o w', moves: `C => { const o=C._o;
      const left=[]; for(let i=0;i<6;i++) left.push({key:'ArrowLeft'});   // 10 swatches: 6 left of black lands on Blue
      return [
      {sel:o.title, keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:o.hdr,   keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:o.mh,    keys:[{key:'Alt'},L('h'),L('a'),L('r')]},
      {sel:o.num,   keys:[{key:'!',ctrl:true,shift:true},{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
      {sel:o.num,   keys:[{key:'Alt'},L('h'),L('f'),L('c'),...left,{key:'Enter'}]},
      {sel:o.notes, keys:[{key:'Alt'},L('h'),L('w')]},
      {sel:o.num,   keys:[{key:'Alt'},L('h'),L('o'),L('w'),D(1),D(6),{key:'Enter'}]},   // 16 char units = 117px — clears the widest comma'd figure
    ]; }` },
  { key: 'combo', name: 'back-to-front order — wrap first, blue before the number format, dialog commas mid-run, weight late, autofit still last', moves: `C => { const o=C._o; return [
      {sel:o.notes, keys:[{key:'Alt'},L('h'),L('w')]},
      {sel:o.num,   keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
      {sel:o.num,   keys:[{key:'Alt'},L('h'),L('o'),L('e'),L('n')]},   // Format Cells by the ribbon door — same one-move commas, ☆ still earned
      {sel:o.mh,    keys:[{key:'Alt'},L('h'),L('a'),L('r')]},
      {sel:o.hdr,   keys:[{key:'b',ctrl:true}]},
      {sel:o.title, keys:[{key:'b',ctrl:true}]},
      {sel:o.num,   keys:[{key:'Alt'},L('h'),L('o'),L('i')]},
    ]; }` },
  /* r433 (gauntlet ★ CAPSTONE c2, DEPTH_PASS §4.20): both entries rebuilt for the reworked
     two-sided board. ALT 1 = chord-ROUTE alt — a different door to every single beat (Format
     Cells by the ribbon, blue by the Cell Styles gallery, commas by chord + decimal walks,
     typed SUMs, ribbon bold, the top edge as part of a top-AND-bottom pair, dollars by
     Ctrl+Shift+$ which writes 'currency' where Alt H A N writes 'acct' — the §1.0-R3(p) proof
     that both read as dollars — and the widths autofitted one column at a time). Dressing the
     two totals separately forfeits the ☆; all seven cores clear (§1.0(c)).
     ALT 2 = op-ORDER alt: the ritual run BACKWARDS — totals first, the whole total row dressed
     in one pass (the ☆ still lands), then the numbers, then the ink, headings centered LAST.
     Autofit stays last in both: it is the only beat whose end state depends on every other. */
  { key: 'gauntlet', name: 'chord-ROUTE: Format Cells by the ribbon door (alt h o e → a), blue via the Cell Styles gallery, ctrl+shift+! + decimal walks, typed SUMs, alt h 1 bold, top-and-bottom rule (alt h b d), dollars via ctrl+shift+$ (currency, not acct) — ☆ forfeited', moves: `C => { const o=C._o;
      const STYLE_INPUT=[{key:'Alt'},L('h'),L('j'),{key:'ArrowRight'},{key:'Enter'}];   // gallery: Normal → Input (blue ink)
      return [
        {sel:o.hdrS,  keys:[{key:'Alt'},L('h'),L('o'),L('e'),L('a')]},
        {sel:o.hdrU,  keys:[{key:'Alt'},L('h'),L('o'),L('e'),L('a')]},
        {sel:o.inU,   keys:STYLE_INPUT.slice()},
        {sel:o.inS,   keys:STYLE_INPUT.slice()},
        {sel:o.inU,   keys:[{key:'!',ctrl:true,shift:true},{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
        {sel:o.inS,   keys:[{key:'!',ctrl:true,shift:true},{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
        {sel:o.NC+o.rt, keys:[...T('=SUM('+o.NC+o.r1+':'+o.NC+o.rn+')'),{key:'Enter'}]},
        {sel:o.MC+o.rt, keys:[...T('=SUM('+o.MC+o.r1+':'+o.MC+o.rn+')'),{key:'Enter'}]},
        {sel:o.NC+o.rt, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('d'),{key:'$',ctrl:true,shift:true}]},
        {sel:o.MC+o.rt, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('d'),{key:'$',ctrl:true,shift:true}]},
        {sel:o.NC+o.r1+':'+o.NC+o.rt, keys:[{key:'Alt'},L('h'),L('o'),L('i')]},
        {sel:o.MC+o.r1+':'+o.MC+o.rt, keys:[{key:'Alt'},L('h'),L('o'),L('i')]},
      ]; }` },
  { key: 'gauntlet', name: 'op-ORDER reversed: totals FIRST, the whole total row dressed in one pass (☆ lands), alt h k + decimal walks, blue after the numbers, headings centered LAST, autofit closes', moves: `C => { const o=C._o;
      const BLUE=[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}];
      return [
        {sel:o.sumS,  keys:[{key:'=',alt:true,code:'Equal'}]},
        {sel:o.sumU,  keys:[{key:'=',alt:true,code:'Equal'}]},
        /* one selection across the total row — bold, top border and dollars land on both sides */
        {sel:o.totRng, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p'),{key:'Alt'},L('h'),L('a'),L('n')]},
        {sel:o.inS,   keys:[{key:'Alt'},L('h'),L('k'),{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
        {sel:o.inU,   keys:[{key:'Alt'},L('h'),L('k'),{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
        {sel:o.inS,   keys:BLUE.slice()},
        {sel:o.inU,   keys:BLUE.slice()},
        {sel:o.hdrU,  keys:[{key:'1',ctrl:true},L('a')]},
        {sel:o.hdrS,  keys:[{key:'1',ctrl:true},L('a')]},
        {sel:o.fitRng, keys:[{key:'Alt'},L('h'),L('o'),L('i')]},
      ]; }` },
  { key: 'housestyle', name: 'slow-route pass — buried input by eye (no F5, no ☆), ctrl+shift+!/% + decimal walks, typed column width, ribbon bold, masthead LAST', moves: `C => { const R=C._R;
      const BLUE=[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}];
      return [
        {sel:R.buried, keys:BLUE.slice()},
        {sel:R.revRng, keys:BLUE.slice()},
        {sel:R.body1, keys:[{key:'!',ctrl:true,shift:true},{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
        {sel:R.body2, keys:[{key:'Alt'},L('h'),L('k'),{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
        {sel:R.gmRng, keys:[{key:'%',ctrl:true,shift:true},{key:'Alt'},L('h'),D(0)]},
        {sel:R.emRng, keys:[{key:'%',ctrl:true,shift:true},{key:'Alt'},L('h'),D(0)]},
        {sel:R.gpRng, keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
        {sel:R.ebRng, keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
        {sel:'A1', keys:[{key:'Alt'},L('h'),L('o'),L('w'),...T('22'),{key:'Enter'}]},
        {sel:R.hdrRng, keys:[{key:'Alt'},L('h'),D(1)]},
        {sel:'A1', keys:[{key:'Alt'},L('h'),D(1)]},
      ]; }` },
  /* r425 (housestyle ROUND 3): op-ORDER alt — the ritual run BACKWARDS (width first, rules
     before numbers, masthead last) with the ☆ discovery mid-run (F5 → s → o before the blue
     pass) and ctrl+b for the bolds. Order-free grading must hold end to end. */
  { key: 'housestyle', name: 'reversed ritual — autofit FIRST, rules before numbers, ☆ F5 constants mid-run, masthead bolded last', moves: `C => { const R=C._R;
      const BLUE=[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}];
      return [
        {sel:'A'+R.rev, keys:[{key:'Alt'},L('h'),L('o'),L('i')]},
        {sel:R.gpRng, keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
        {sel:R.ebRng, keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
        {sel:R.emRng, keys:[{key:'1',ctrl:true},L('p')]},
        {sel:R.gmRng, keys:[{key:'1',ctrl:true},L('p')]},
        {sel:R.body2, keys:[{key:'1',ctrl:true},L('n')]},
        {sel:R.body1, keys:[{key:'1',ctrl:true},L('n')]},
        {sel:R.revRng, keys:[{key:'F5'},L('s'),L('o')]},
        {sel:R.buried, keys:BLUE.slice()},
        {sel:R.revRng, keys:BLUE.slice()},
        {sel:R.hdrRng, keys:[{key:'b',ctrl:true}]},
        {sel:'A1', keys:[{key:'b',ctrl:true}]},
      ]; }` },
  { key: 'ruleaudit', name: 'breaks repaired in REVERSE page order (headline first), bold via ribbon alt h 1 (op-ORDER alt, ☆ survives)', moves: `C => { const R=C._R;
      const W=(a,b,c2)=>[{key:'Alt'},L(a),L(b),L(c2)];
      const KEY={hdr:W('h','b','o'), sub1:W('h','b','p'), sub2:W('h','b','p'), gbt:W('h','b','p'), gbold:[{key:'Alt'},L('h'),D(1)], box:W('h','b','s')};
      return R.defects.slice().reverse().map(d=>({sel:R.tg[d], keys:KEY[d]})); }` },
  { key: 'ruleaudit', name: 'full-row Shift+Space bands + THICK box via alt h b t — ☆ forfeited (collateral ink), core clears (§1.0(c))', moves: `C => { const R=C._R;
      const W=(a,b,c2)=>[{key:'Alt'},L(a),L(b),L(c2)];
      const SS={key:' ',shift:true};
      const SEL={hdr:'B2', sub1:'B'+R.sub1, sub2:'B'+R.sub2, gbt:'B'+R.g, gbold:'B'+R.g, box:R.hcell};
      const KEY={hdr:[SS].concat(W('h','b','o')), sub1:[SS].concat(W('h','b','p')), sub2:[SS].concat(W('h','b','p')),
                 gbt:[SS].concat(W('h','b','p')), gbold:[SS,{key:'b',ctrl:true}], box:W('h','b','t')};
      return R.defects.map(d=>({sel:SEL[d], keys:KEY[d]})); }` },
  { key: 'ruleoff', name: 'box FIRST, rulings bottom-up, EBITDA typed as VALUES per column (freedom proof — core clears, ☆ forfeited)', moves: `C => { const R=C._R;
      const steps=[
        {sel:R.focus, keys:[{key:'Alt'},L('h'),L('b'),L('t')]},
        {sel:'B'+R.g+':'+R.LC+R.g, keys:[{key:'Alt'},L('h'),D(1)]},
        {sel:'B'+R.g+':'+R.LC+R.g, keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
        {sel:'B'+R.sub2+':'+R.LC+R.sub2, keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
        {sel:'B'+R.sub1+':'+R.LC+R.sub1, keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
        {sel:'B'+R.hr+':'+R.LC+R.hr, keys:[{key:'Alt'},L('h'),L('b'),L('o')]},
      ];
      for(let i=0;i<R.NCOL;i++) steps.push({sel:colLetter(2+i)+R.g, keys:[...T(String(R.ebWant[i])),{key:'Enter'}]});
      return steps; }` },
  { key: 'ruleoff', name: 'the RIBBON route end to end — Alt H F I R fill (the ☆ latch logs chord-agnostic), Alt H 1 bold, demo order', moves: `C => { const R=C._R; return [
      {sel:'B'+R.hr+':'+R.LC+R.hr, keys:[{key:'Alt'},L('h'),L('b'),L('o')]},
      {sel:'B'+R.sub1+':'+R.LC+R.sub1, keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:'B'+R.sub2+':'+R.LC+R.sub2, keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:'B'+R.g, keys:[...T('=B'+R.sub1+'+B'+R.sub2),{key:'Enter'}]},
      {sel:'B'+R.g+':'+R.LC+R.g, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B'+R.g+':'+R.LC+R.g, keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:'B'+R.g+':'+R.LC+R.g, keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:R.focus, keys:[{key:'Alt'},L('h'),L('b'),L('t')]},
    ]; }` },
  { key: 'navigation', name: 'ROUND-2 corridor the SLOW way — single-arrow steps both directions (no ctrl-shots, no Ctrl+Home), slow shift-span grab, walk home, paste, Ctrl+End', moves: `C => {
      // r424 (§4.1 round 2): the corridor is bidirectional — the slow route steps every cell,
      // grabs the block with plain Shift+arrows, WALKS back to the A1 room instead of the
      // Ctrl+Home teleport, pastes, then flies Ctrl+End (the finish beat's only route — a
      // teleport by design; the §1.7 R2(a) coordinates-are-the-game exemption).
      const M=C._maze, cl=colLetter, T=M.table, p1=M.p1;
      const sk=(a,b)=>{ const dr=b[0]-a[0], dc=b[1]-a[1]; return dr===1?{key:'ArrowDown'}:dr===-1?{key:'ArrowUp'}:dc===1?{key:'ArrowRight'}:{key:'ArrowLeft'}; };
      const nav1=[]; for(let i=1;i<p1.length;i++) nav1.push(sk(p1[i-1],p1[i]));   // step to the block, one cell at a time (collects pips) — lands bottom-left
      const BL=[T.r0+T.h-1,T.c0], TR=[T.r0,T.c0+T.w-1];
      const g=[]; for(let i=0;i<T.w-1;i++) g.push({key:'ArrowRight',shift:true});
      for(let i=0;i<T.h-1;i++) g.push({key:'ArrowUp',shift:true});
      g.push({key:'c',ctrl:true});                                               // slow span from the landing corner + copy (active ends top-right)
      const back=[];                                                             // walk from the top-right corner back to A1: rejoin BL, then reverse p1, then up the room edge
      for(let i=0;i<T.h-1;i++) back.push({key:'ArrowDown'});
      for(let i=0;i<T.w-1;i++) back.push({key:'ArrowLeft'});
      for(let i=p1.length-1;i>0;i--) back.push(sk(p1[i],p1[i-1]));
      for(let r=p1[0][0];r>1;r--) back.push({key:'ArrowUp'});
      return [
        {sel:cl(p1[0][1])+p1[0][0], keys:nav1},
        {sel:cl(BL[1])+BL[0], keys:g},
        {sel:cl(TR[1])+TR[0], keys:back},
        {sel:'A1', keys:[{key:'v',ctrl:true}]},
        {sel:'A1', keys:[{key:'End',ctrl:true}]}                                 // finish flight; the harness presses the universal Ctrl+S closer
      ]; }` },
  { key: 'navigation', name: 'ROUND-2 ctrl-shot flights + TL grab (span DOWN then RIGHT) + Wolf sketch order: paste → SAVE → finish flight (win fires on the flight)', moves: `C => {
      // r424 (§1.8): second route — canonical corridor flights, but the grab anchors at the
      // TOP-LEFT corner (single steps up the label column, then ctrl+shift down/right), and the
      // closer follows Wolf's §4.1 sketch order: Ctrl+S BEFORE the bottom-right flight — the
      // post:true finish beat means the save takes and the win fires on the flight.
      const M=C._maze, cl=colLetter, T=M.table, p1=M.p1, RN=20, CN=10;
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
      walk(p1);                                                                  // flight chain to the block (collects pips) — lands bottom-left
      const up=[]; for(let i=0;i<T.h-1;i++) up.push({key:'ArrowUp'});            // single-step up the label column to the top-left corner
      up.push({key:'ArrowDown',ctrl:true,shift:true},{key:'ArrowRight',ctrl:true,shift:true},{key:'c',ctrl:true});
      steps.push({sel:cl(T.c0)+(T.r0+T.h-1), keys:up});
      steps.push({sel:cl(T.c0)+T.r0+':'+cl(T.c0+T.w-1)+(T.r0+T.h-1), keys:[{key:'Home',ctrl:true},{key:'v',ctrl:true}]});
      steps.push({sel:'A1', keys:[{key:'s',ctrl:true},{key:'End',ctrl:true}]});  // SAVE first, then the finish flight — the win fires on the flight
      return steps; }` },
  { key: 'navigation', name: 'ROUND-3 exit ON FOOT — no Ctrl+End at all: paste, walk back down the corridor, and step the carved exit gap to J20 cell by cell', moves: `C => {
      // r427 (§4.1 ROUND 3, Wolf playtest r2 — "add a small EXIT so you can still get THROUGH the
      // corridor to complete the 'go to last cell' checklist item"): this route NEVER presses
      // Ctrl+End. It rides the corridor, grabs and copies the block, teleports home to paste, then
      // walks all the way back down the corridor and out through the exit gap to J20 on single
      // arrow steps — proving the finish beat has a legitimate PATH, not only the teleport.
      const M=C._maze, cl=colLetter, T=M.table, p1=M.p1, RN=20, CN=10;
      const ek=(r,c,nr,nc)=>{ const a=r*100+c,b=nr*100+nc; return a<b?(r+':'+c+'|'+nr+':'+nc):(nr+':'+nc+'|'+r+':'+c); };
      const can=(r,c,nr,nc)=> nr>=1&&nr<=RN&&nc>=1&&nc<=CN&&M.pass.has(ek(r,c,nr,nc));
      const sk=(a,b)=>{ const dr=b[0]-a[0], dc=b[1]-a[1]; return dr===1?{key:'ArrowDown'}:dr===-1?{key:'ArrowUp'}:dc===1?{key:'ArrowRight'}:{key:'ArrowLeft'}; };
      // BFS the open graph so the walk home from A1 is a real wall-respecting route
      const bfs=(from,to)=>{ const q=[from], prev={}; prev[from[0]+':'+from[1]]=null;
        while(q.length){ const [r,c]=q.shift(); if(r===to[0]&&c===to[1]) break;
          for(const d of [[-1,0],[1,0],[0,-1],[0,1]]){ const nr=r+d[0], nc=c+d[1], k=nr+':'+nc;
            if(can(r,c,nr,nc) && !(k in prev)){ prev[k]=[r,c]; q.push([nr,nc]); } } }
        const path=[]; let cur=to; while(cur){ path.unshift(cur); cur=prev[cur[0]+':'+cur[1]]; }
        return path; };
      const steps=[];
      const stepAll=(path)=>{ const keys=[]; for(let i=1;i<path.length;i++) keys.push(sk(path[i-1],path[i]));
        steps.push({sel:cl(path[0][1])+path[0][0], keys}); };
      stepAll(p1);                                                               // walk to the block (collects every pip)
      const BL=[T.r0+T.h-1,T.c0];
      const grab=[]; for(let i=0;i<T.w-1;i++) grab.push({key:'ArrowRight',shift:true});
      for(let i=0;i<T.h-1;i++) grab.push({key:'ArrowUp',shift:true});
      grab.push({key:'c',ctrl:true});
      steps.push({sel:cl(BL[1])+BL[0], keys:grab});
      steps.push({sel:cl(T.c0)+T.r0+':'+cl(T.c0+T.w-1)+(T.r0+T.h-1), keys:[{key:'Home',ctrl:true},{key:'v',ctrl:true}]});
      stepAll(bfs([1,1],[RN,CN]));                                               // A1 → the exit gap → J20, entirely on foot
      return steps; }` },
  /* r433 (anchor ROUND 1 depth pass, DEPTH_PASS §4.23): the drill grades formula TEXT under the
     doctrine §2.2 anchor-text exception, so these two alts are the proof that the exception buys
     the LOCKS and nothing else. ALT 1 = chord-ROUTE alt: every dollar sign TYPED (no F4 anywhere),
     both fills walked through the Home ribbon, dollars via Ctrl+Shift+$ + two decimal steps, the
     box as a THICK perimeter. ALT 2 = op-ORDER alt: border and format land on the EMPTY grid
     first and the nine formulas are hand-typed with no fill at all. Both forfeit the ☆ (only the
     Ctrl+Enter one-entry commit earns it); every core beat clears. */
  { key: 'anchor', name: 'TYPED dollar signs end to end (no F4), ribbon fills Alt H F I D / F I R, dollars via ctrl+shift+$ then two Alt H 9 steps, THICK box — ☆ forfeited', moves: `C => { const o=C._o; return [
      {sel:o.corner, keys:[...T('=$'+o.VC+o.r0+'*'+o.PC[0]+'$'+o.hr),{key:'Enter'}]},   // the locks typed by hand — same string F4 would have cycled to
      {sel:o.col0,   keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},                    // the ribbon's fill DOWN, not ctrl+d
      {sel:o.grid,   keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},                    // the ribbon's fill RIGHT, not ctrl+r
      {sel:o.grid,   keys:[{key:'$',ctrl:true,shift:true}]},                             // currency @2 …
      {sel:o.grid,   keys:[{key:'Alt'},L('h'),D(9)]},                                    // … walked down to zero places
      {sel:o.grid,   keys:[{key:'Alt'},L('h'),D(9)]},
      {sel:o.grid,   keys:[{key:'Alt'},L('h'),L('b'),L('t')]},                           // thick box — the perimeter grades the same as Alt H B S
    ]; }` },
  { key: 'anchor', name: 'BOX and DOLLAR the empty grid FIRST, then nine hand-typed anchored formulas — no fill anywhere, whole-table border rect (☆ forfeited)', moves: `C => { const o=C._o;
      const steps=[
        {sel:o.grid, keys:[{key:'Alt'},L('h'),L('a'),L('n')]},                           // dress before there is anything to dress — end-state grading must hold
        {sel:colLetter(o.lc)+o.hr+':'+o.PC[2]+(o.r0+2), keys:[{key:'Alt'},L('h'),L('b'),L('s')]},   // the WHOLE table boxed, label column and header row included
      ];
      // every cell typed in its own right, bottom-up and right-to-left, locks spelled out
      for(let i=2;i>=0;i--) for(let j=2;j>=0;j--)
        steps.push({sel:o.PC[j]+(o.r0+i), keys:[...T('='+o.PC[j]+'$'+o.hr+'*$'+o.VC+(o.r0+i)),{key:'Enter'}]});   // price first, volume second — operand order is free
      return steps; }` },
  /* r434 (percent ROUND 1 depth pass, DEPTH_PASS §4.24): two blocks, two locked divisors, a
     1-D fill each. ALT 1 = chord-ROUTE alt AND the §4.24 engine regression the page asks for —
     the columns are percent-formatted BEFORE anything is entered (so the r418/r419 %-entry fix
     is exercised: a bare "100" typed into an already-percent cell must land 100.0%, not
     10,000%), dollar signs typed by hand with no F4 anywhere, fills walked through the ribbon,
     bold via Alt H 1, and the right-hand block worked first. ALT 2 = op-ORDER alt and the ☆'s
     NEGATIVE CONTROL — revenue lines bolded first, every percent cell hand-typed bottom-up with
     a ROW-ONLY lock (B$4, the other end state a fill down survives), no fill anywhere, formats
     last via Ctrl+Shift+% + Alt H 0. Both clear all six cores; both forfeit the ☆ (ALT 1 fills
     from the line BELOW revenue, ALT 2 never fills at all). */
  { key: 'percent', name: 'FORMAT FIRST (alt h p then alt h 0), 100% typed into the percent cell (r419 entry regression), typed $ locks with no F4, ribbon fill from the line below revenue, bold via alt h 1, right-hand block first — ☆ forfeited', moves: `C => { const o=C._o;
      const blk=b=>[
        {sel:b.rng, keys:[{key:'Alt'},L('h'),L('p'),{key:'Alt'},L('h'),D(0)]},                    // percent at ZERO, stepped to one — the ribbon pair
        {sel:b.top, keys:[...T('100'),{key:'Enter'}]},                                            // the 100% line typed by hand into an already-percent cell
        {sel:b.PC+(b.r0+1), keys:[...T('='+b.VC+(b.r0+1)+'/$'+b.VC+'$'+b.r0),{key:'Enter'}]},     // locks TYPED, not cycled
        {sel:b.PC+(b.r0+1)+':'+b.PC+b.rN, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},        // ribbon fill down, starting BELOW the revenue line
        {sel:b.revRng, keys:[{key:'Alt'},L('h'),D(1)]},
      ];
      return [...blk(o.B), ...blk(o.A)]; }` },
  { key: 'percent', name: 'NEGATIVE CONTROL: bolds first, every percent cell hand-typed bottom-up with a row-only lock (B$4), no fill anywhere, percent via ctrl+shift+% then alt h 0 last — every core clears, ☆ dark', moves: `C => { const o=C._o; const steps=[];
      [o.A,o.B].forEach(b=>steps.push({sel:b.revRng, keys:[{key:'b',ctrl:true}]}));               // dress before the work — end-state grading must hold
      [o.B,o.A].forEach(b=>{ for(let i=b.n-1;i>=0;i--)
        steps.push({sel:b.PC+(b.r0+i), keys:[...T('='+b.VC+(b.r0+i)+'/'+b.VC+'$'+b.r0),{key:'Enter'}]}); });   // bottom-up, row lock only
      [o.A,o.B].forEach(b=>steps.push({sel:b.rng, keys:[{key:'%',ctrl:true,shift:true},{key:'Alt'},L('h'),D(0)]}));
      return steps; }` },
  /* r434 (bridge ROUND 1 depth pass, DEPTH_PASS §4.27). ALT 1 is the chord-ROUTE alt AND the
     §1.0-R2(i) SKIPPABILITY PROOF for the re-cut ☆: every reference is TYPED OUT, so not one
     arrow ever points, blue comes from the cell-styles gallery instead of the font-colour
     drop-down, both fills walk the Home ribbon, bold is Alt H 1 and the rule is Alt H B S
     (outside borders on a one-row selection — its top edge IS the top border). All six cores
     clear; S.pointLog stays empty and the star stays dark. ALT 2 is the op-ORDER alt: the
     EBITDA line is BOLDED AND RULED WHILE EMPTY, then built and filled across a revenue line
     that does not exist yet (every year reads 0), and only then does the revenue verse land and
     recalc light it — the §1.0-R3(p) end-state proof — with the hardcode marked blue last. Both
     formulas are pointed there, so the ☆ still fires from a completely different order. */
  { key: 'bridge', name: 'chord-ROUTE: every reference TYPED (no pointing — ☆ forfeited), blue via the alt h j cell-styles gallery, both fills via alt h f i r, bold alt h 1, rule via alt h b s', moves: `C => { const o=C._o; const CL=j=>colLetter(o.c0+1+j); return [
      {sel:o.rev1,   keys:[{key:'Alt'},L('h'),L('j'),{key:'ArrowRight'},{key:'Enter'}]},          // cell styles → Input, the other route to blue
      {sel:o.rev2,   keys:[...T('='+CL(0)+o.revRow+'*(1+'+CL(1)+o.gRow+')'),{key:'Enter'}]},      // typed refs — the arrows never grab anything
      {sel:o.revRng, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:o.eb1,    keys:[...T('='+CL(0)+o.mRow+'*'+CL(0)+o.revRow),{key:'Enter'}]},             // margin × revenue — operand order is free
      {sel:o.ebRng,  keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:o.ebRng,  keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:o.ebRng,  keys:[{key:'Alt'},L('h'),L('b'),L('s')]},
    ]; }` },
  { key: 'bridge', name: 'op-ORDER: EBITDA line ruled while EMPTY, built and filled before revenue exists (reads 0 until the revenue verse recalcs it), hardcode marked blue LAST — ☆ still fires', moves: `C => { const o=C._o; return [
      {sel:o.ebRng, keys:[{key:'b',ctrl:true}]},
      {sel:o.ebRng, keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:o.eb1,   keys:[{key:'='},{key:'ArrowUp'},{key:'*'},{key:'ArrowUp'},{key:'ArrowUp'},{key:'Enter'}]},
      {sel:o.ebRng, keys:[{key:'r',ctrl:true}]},                                                  // five EBITDA years, every one of them zero
      {sel:o.rev2,  keys:[{key:'='},{key:'ArrowLeft'},{key:'*'},{key:'('},{key:'1'},{key:'+'},{key:'ArrowUp'},{key:'ArrowUp'},{key:')'},{key:'Enter'}]},
      {sel:o.revRng,keys:[{key:'r',ctrl:true}]},                                                  // the revenue line lands and the EBITDA line comes alive behind it
      {sel:o.rev1,  keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
    ]; }` },
  /* r435 (sumif depth pass, DEPTH_PASS §4.28). ALT 1 is the chord-ROUTE alt AND an op-ORDER
     inversion: the whole page is built BACKWARDS — the % column is percent-formatted while it
     is still empty, then built and ribbon-filled against a Total row that does not exist yet
     (every share reads a divide-by-nothing until the foot lands), the Total row is dressed
     before it holds a number, and the rollup itself is written LAST. Every chord differs from
     the demo's: Alt H P + Alt H 0 for the percent, Alt H F I D for both fills, Alt H 1 for the
     bold, Alt H B S for the rule (the perimeter of a one-row selection sets its top edge) and
     Alt+= AutoSum for the foot. The ☆ still fires — it reads the fill MECHANIC off S.fillOps,
     so the ribbon route earns it exactly like Ctrl+D. This is the §1.0-R3(p) end-state proof:
     three of the five beats go through a state where they grade FALSE with the work correctly
     done, and all five light once the last piece lands.
     ALT 2 is the §1.0-R2(i) SKIPPABILITY PROOF and the drill's MEASURED negative control: every
     segment's SUMIF hand-typed with FULLY RELATIVE ranges, bottom-up, no fill anywhere, the
     share column hand-typed per row with an unlocked denominator, percent via Ctrl+Shift+%
     then Alt H 0. All five cores clear and the star stays dark — measured at 111 keys on a
     three-segment seed and 141 on a four-segment one, against the demo's flat 61. */
  { key: 'sumif', name: 'BACKWARDS + ribbon: % column formatted empty, built and filled before the foot exists, total row dressed before it holds a number, rollup written LAST, autosum foot — the ☆ still fires off the ribbon fill', moves: `C => { const o=C._o; return [
      {sel:o.pctRng,  keys:[{key:'Alt'},L('h'),L('p'),{key:'Alt'},L('h'),D(0)]},                  // percent-format an empty column
      {sel:o.LP+o.r1, keys:[...T('='+o.LR+o.r1+'/$'+o.LR+'$'+o.rT),{key:'Enter'}]},               // denominator points at a Total row that is still blank
      {sel:o.pctRng,  keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},                            // ribbon fill down
      {sel:o.totRng,  keys:[{key:'Alt'},L('h'),D(1)]},                                            // bold via the ribbon
      {sel:o.totRng,  keys:[{key:'Alt'},L('h'),L('b'),L('s')]},                                   // outside border — its top edge IS the top border
      {sel:o.LR+o.r1, keys:[...T('=SUMIF('+o.critR+','+o.LM+o.r1+','+o.sumR+')'),{key:'Enter'}]},
      {sel:o.rollRng, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},                            // the ☆ fill, ribbon route
      {sel:o.LR+o.rT, keys:[{key:'=',alt:true,code:'Equal'},{key:'Enter'}]},                      // AutoSum proposes the block from directly under it
    ]; }` },
  { key: 'sumif', name: 'NEGATIVE CONTROL: every segment SUMIF hand-typed bottom-up with FULLY RELATIVE ranges, no fill anywhere, shares typed per row off an unlocked denominator, percent via ctrl+shift+% then alt h 0 — all five cores clear, ☆ dark', moves: `C => { const o=C._o; const st=[];
      const cr=o.LS+o.r1+':'+o.LS+o.rL, sr=o.LA+o.r1+':'+o.LA+o.rL;
      for(let i=o.nSeg-1;i>=0;i--) st.push({sel:o.LR+(o.r1+i), keys:[...T('=SUMIF('+cr+','+o.LM+(o.r1+i)+','+sr+')'),{key:'Enter'}]});
      st.push({sel:o.LR+o.rT, keys:[...T('=SUM('+o.LR+o.r1+':'+o.LR+o.rn+')'),{key:'Enter'}]});
      st.push({sel:o.totRng, keys:[{key:'b',ctrl:true}]});
      st.push({sel:o.totRng, keys:[{key:'Alt'},L('h'),L('b'),L('p')]});
      for(let i=o.nSeg-1;i>=0;i--) st.push({sel:o.LP+(o.r1+i), keys:[...T('='+o.LR+(o.r1+i)+'/'+o.LR+o.rT),{key:'Enter'}]});
      st.push({sel:o.pctRng, keys:[{key:'%',ctrl:true,shift:true},{key:'Alt'},L('h'),D(0)]});
      return st; }` },
  /* r435 (fxconvert ROUND 1 depth pass, DEPTH_PASS §4.30): ONE fully absolute scalar driver
     broadcast over a 2-D block. ALT 1 is the op-ORDER alt AND the chord-ROUTE alt at once — the
     empty dollar table is comma-formatted BEFORE anything is entered, the driver box is walked
     edge by edge instead of chorded, blue comes from the cell-styles gallery, both dollar signs
     are TYPED with no F4 anywhere, the two fills go DOWN-then-RIGHT through the Home ribbon
     (the demo goes right-then-down with Ctrl chords), the perimeter is a THICK box, and the
     RATE IS TYPED LAST, so every converted figure reads 0 until it lands and recalc lights the
     page — the §1.0-R3(p) end-state proof. The ☆ still fires there, which is the point: it is
     graded on SCOPE (the FY column and the Total line read the rate too), never on a chord.
     ALT 2 is the ☆'s NEGATIVE CONTROL and the §1.0(c) freedom proof: the rate and its box
     first, then every body cell hand-typed bottom-up and right-to-left with the dollar signs
     spelled out and the operands the other way round, no fill anywhere, and the FY column and
     the Total line summed with nine Alt+= passes — the route the guide actually teaches. All
     five cores clear; the star stays dark because those nine cells hold SUMs, not the rate.
     MEASURED: 153 keys at three segments, 187 at four, against the demo's 33 — and the tighter
     skip route the guide actually teaches (fill the BODY, Alt+= the two edges) runs 49-51 with
     the same result, which is the star's real headroom. */
  { key: 'fxconvert', name: 'op-ORDER + chord-ROUTE: empty table comma-formatted FIRST (alt h k then two alt h 9), driver box walked edge by edge, blue via the alt h j cell-styles gallery, typed $ locks with no F4, ribbon fills DOWN then RIGHT, thick perimeter, and the rate typed LAST (every figure reads 0 until recalc) — ☆ still fires', moves: `C => { const o=C._o; return [
      {sel:o.block,    keys:[{key:'Alt'},L('h'),L('k'),{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},   // commas on an empty block — end-state grading must hold
      {sel:o.rateCell, keys:[{key:'Alt'},L('h'),L('b'),L('p')]},                                            // the box, one edge at a time …
      {sel:o.rateCell, keys:[{key:'Alt'},L('h'),L('b'),L('o')]},
      {sel:o.rateCell, keys:[{key:'Alt'},L('h'),L('b'),L('l')]},
      {sel:o.rateCell, keys:[{key:'Alt'},L('h'),L('b'),L('r')]},                                            // … four edges, no ball flag anywhere
      {sel:o.rateCell, keys:[{key:'Alt'},L('h'),L('j'),{key:'ArrowRight'},{key:'Enter'}]},                   // cell styles → Input, the other route to blue
      {sel:o.seed,     keys:[...T('='+o.C[0]+o.eurR0+'*$'+o.VC+'$'+o.rr),{key:'Enter'}]},                    // locks typed, not cycled — and the rate cell is still empty
      {sel:o.C[0]+o.usdR0+':'+o.C[0]+o.usdTot, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},              // down the first column …
      {sel:o.block,    keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},                                      // … then right across everything, edges included
      {sel:o.tableRect,keys:[{key:'Alt'},L('h'),L('b'),L('t')]},                                             // thick box — the perimeter grades the same
      {sel:o.rateCell, keys:[...T(o.rateStr),{key:'Enter'}]},                                                // the rate lands last and the whole page comes alive
    ]; }` },
  { key: 'fxconvert', name: 'NEGATIVE CONTROL: rate and box first, every body cell hand-typed bottom-up with typed $ signs and reversed operands, no fill anywhere, FY column and Total line summed with nine alt+= passes, comma via ctrl+shift+! then two alt h 9, per-edge border walk — all five cores clear, ☆ dark', moves: `C => { const o=C._o; const steps=[];
      steps.push({sel:o.rateCell, keys:[...T(o.rateStr),{key:'Enter'}]});
      steps.push({sel:o.rateCell, keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]});
      steps.push({sel:o.rateCell, keys:[{key:'Alt'},L('h'),L('b'),L('a')]});
      for(let i=o.n-1;i>=0;i--) for(let j=3;j>=0;j--)                                                        // bottom-up, right-to-left, rate first in the product
        steps.push({sel:o.C[j]+(o.usdR0+i), keys:[...T('=$'+o.VC+'$'+o.rr+'*'+o.C[j]+(o.eurR0+i)),{key:'Enter'}]});
      for(let i=0;i<o.n;i++)                                                                                 // the FY column, one AutoSum per segment …
        steps.push({sel:o.C[0]+(o.usdR0+i)+':'+o.C[4]+(o.usdR0+i), keys:[{key:'=',alt:true,code:'Equal'}]});
      for(let j=0;j<5;j++)                                                                                   // … and the Total line, one per column
        steps.push({sel:o.C[j]+o.usdR0+':'+o.C[j]+o.usdTot, keys:[{key:'=',alt:true,code:'Equal'}]});
      steps.push({sel:o.block, keys:[{key:'!',ctrl:true,shift:true},{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]});
      steps.push({sel:o.C[0]+o.usdR0+':'+o.C[4]+o.usdR0, keys:[{key:'Alt'},L('h'),L('b'),L('p')]});           // the perimeter walked one edge at a time,
      steps.push({sel:o.C[0]+o.usdTot+':'+o.C[4]+o.usdTot, keys:[{key:'Alt'},L('h'),L('b'),L('o')]});         // and around the FIGURES only — the label
      steps.push({sel:o.C[0]+o.usdR0+':'+o.C[0]+o.usdTot, keys:[{key:'Alt'},L('h'),L('b'),L('l')]});          // column and header row left outside it
      steps.push({sel:o.C[4]+o.usdR0+':'+o.C[4]+o.usdTot, keys:[{key:'Alt'},L('h'),L('b'),L('r')]});
      return steps; }` },
  { key: 'cagr', name: 'chord-ROUTE: estimate column seeded BEFORE the CAGR it reads (recalcs behind it), root written ^0.25, forward compound as three (1+r) factors, ribbon block fill alt h f i d, percent alt h p + alt h 0, italic alt h 2, bold alt h 1 — the ☆ still fires', moves: `C => { const o=C._o; const CL=j=>colLetter(o.c0+1+j); const w=o.seg[o.win];
      const f=o.cagrL+o.r1;
      return [
        {sel:o.fyTop,   keys:[...T('='+CL(4)+o.r1+'*(1+'+f+')*(1+'+f+')*(1+'+f+')'),{key:'Enter'}]},   // commits reading an EMPTY CAGR cell — the estimate reads flat until the root lands
        {sel:o.cagrTop, keys:[...T('=('+CL(4)+o.r1+'/'+CL(0)+o.r1+')^0.25-1'),{key:'Enter'}]},
        {sel:o.blk,     keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},                                // the ribbon's fill down — same latch, same star
        {sel:o.fyRngH,  keys:[{key:'Alt'},L('h'),D(2)]},
        {sel:o.cagrRng, keys:[{key:'Alt'},L('h'),L('p'),{key:'Alt'},L('h'),D(0)]},                      // percent at ZERO, stepped to one
        {sel:w.cagrK,   keys:[{key:'Alt'},L('h'),D(1)]},
      ]; }` },
  { key: 'cagr', name: 'NEGATIVE CONTROL: both columns dressed while empty, winner bolded before its number exists, all six formulas typed bottom-up with no fill anywhere, percent via ctrl+shift+% then alt h 0 — all five cores clear, ☆ dark', moves: `C => { const o=C._o; const CL=j=>colLetter(o.c0+1+j); const w=o.seg[o.win]; const st=[];
      st.push({sel:o.cagrRng, keys:[{key:'%',ctrl:true,shift:true},{key:'Alt'},L('h'),D(0)]});          // dress before the work — end-state grading must hold
      st.push({sel:o.fyRngH,  keys:[{key:'i',ctrl:true}]});
      st.push({sel:w.cagrK,   keys:[{key:'b',ctrl:true}]});
      for(let i=2;i>=0;i--){ const rr=o.r1+i;
        st.push({sel:o.fyL+rr,   keys:[...T('='+CL(4)+rr+'*(1+'+o.cagrL+rr+')^3'),{key:'Enter'}]});
        st.push({sel:o.cagrL+rr, keys:[...T('=('+CL(4)+rr+'/'+CL(0)+rr+')^(1/4)-1'),{key:'Enter'}]}); }
      return st; }` },
  /* r444 §4.57 depth pass — the single shipped entry ("debt side first", hard-coded B10..B14 off
     the retired single-peer ROWS:14 board) is DELETED and replaced by this pair; nothing else in
     the file is touched (CAMPAIGN §4: for the reworked drill, the agent's side is authoritative
     for deletions as well as additions — never union).
     ALT 1 = op ORDER + chord ROUTE, and it is also the §1.0-R3(p) END-STATE proof: the WACC line
     is written SECOND, off two cells that do not exist yet, so it reads a wrong rate for most of
     the run and recalcs into the right one when the equity side finally lands. The comp column
     travels by the ribbon fill (Alt H F I D), which is the same latch as Ctrl+D — so the ☆ still
     fires, which is the point: the star grades the DECISION to cover the block in one pass, never
     the chord that does it (§1.0(c)). */
  { key: 'wacc', name: 'op ORDER — debt side and the WACC line written FIRST (both read empty cells and recalc), comp column by ribbon fill, median last-in — ☆ still earned', moves: `C => { const o=C._o; return [
      {sel:o.CD+o.rKd,  keys:[...T('='+o.CG+o.aKd+'*(1-'+o.CG+o.aTax+')'),{key:'Enter'}]},
      {sel:o.CD+o.rW,   keys:[...T('=('+o.CG+o.aEq+'*'+o.CD+o.rKe+'+'+o.CG+o.aDb+'*'+o.CD+o.rKd+')/('+o.CG+o.aEq+'+'+o.CG+o.aDb+')'),{key:'Enter'}]},
      {sel:o.CD+o.p0,   keys:[...T('='+o.CB+o.p0+'/(1+(1-$'+o.CG+'$'+o.aTax+')*'+o.CC+o.p0+')'),{key:'Enter'}]},
      {sel:o.CD+o.p0+':'+o.CD+o.pN, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
      {sel:o.CD+o.rMed, keys:[...T('=MEDIAN('+o.CD+o.p0+':'+o.CD+o.pN+')'),{key:'Enter'}]},
      {sel:o.CD+o.rRel, keys:[...T('='+o.CD+o.rMed+'*(1+(1-'+o.CG+o.aTax+')*'+o.CG+o.aDb+'/'+o.CG+o.aEq+')'),{key:'Enter'}]},
      {sel:o.CD+o.rKe,  keys:[...T('='+o.CG+o.aRf+'+'+o.CD+o.rRel+'*'+o.CG+o.aErp),{key:'Enter'}]},
    ]; }` },
  /* ALT 2 = the MEASURED NEGATIVE CONTROL for the ☆ (§1.0-R2(i) skippability, proved rather than
     asserted) and, at the same time, the walk that kills the three untriggerable beats the
     shipped board carried. No fill anywhere — five comps typed one at a time, bottom-up, every
     reference $-anchored; the median taken with SMALL(range,3) instead of MEDIAN; the relever
     written as βu + βu×(1−t)×D/E; the after-tax line as Kd − Kd×t; and the WACC in the
     weight-times-cost form, which names neither denominator the shipped predicate demanded.
     All six cores clear, the ☆ goes DARK (§1.0(c): the slow route is never penalised, it just
     costs the keys — 85 against 24, measured in dev/verify-wacc.js §B). */
  { key: 'wacc', name: 'NEGATIVE CONTROL — no fill at all, five comps typed bottom-up with $-anchors, SMALL(,3) for the median, weight×cost WACC (cores clear, ☆ forfeited)', moves: `C => { const o=C._o; const A=(c,r)=>'$'+c+'$'+r; const W='('+o.CG+o.aEq+'+'+o.CG+o.aDb+')'; const st=[];
      for(let i=4;i>=0;i--) st.push({sel:o.CD+(o.p0+i), keys:[...T('='+A(o.CB,o.p0+i)+'/(1+(1-'+A(o.CG,o.aTax)+')*'+A(o.CC,o.p0+i)+')'),{key:'Enter'}]});
      st.push({sel:o.CD+o.rMed, keys:[...T('=SMALL('+A(o.CD,o.p0)+':'+A(o.CD,o.pN)+',3)'),{key:'Enter'}]});
      st.push({sel:o.CD+o.rRel, keys:[...T('='+o.CD+o.rMed+'+'+o.CD+o.rMed+'*(1-'+o.CG+o.aTax+')*'+o.CG+o.aDb+'/'+o.CG+o.aEq),{key:'Enter'}]});
      st.push({sel:o.CD+o.rKe,  keys:[...T('='+o.CD+o.rRel+'*'+o.CG+o.aErp+'+'+o.CG+o.aRf),{key:'Enter'}]});
      st.push({sel:o.CD+o.rKd,  keys:[...T('='+o.CG+o.aKd+'-'+o.CG+o.aKd+'*'+o.CG+o.aTax),{key:'Enter'}]});
      st.push({sel:o.CD+o.rW,   keys:[...T('='+o.CG+o.aEq+'/'+W+'*'+o.CD+o.rKe+'+'+o.CG+o.aDb+'/'+W+'*'+o.CD+o.rKd),{key:'Enter'}]});
      return st; }` },
  /* r444 (fcfbuild depth pass, DEPTH_PASS §4.58) — one of the nine zero-ALT drills named in
     §1.8, clearing the minimum here. ALT 1 = chord-ROUTE alt: ribbon fills, the ribbon bold,
     the tax formula with the minus on the right, and the SINGLE-CELL autosum proposal at the
     total cell (the ☆'s other route — it must still light). ALT 2 = op-ORDER alt AND the
     §1.0(c) freedom control: nothing filled, nothing autosummed, every one of the fifteen
     cells hand-typed and the dress walked cell by cell, the line closed BEFORE the total is
     landed — all six cores clear and the ☆ must stay DARK (measured 206 keys against the
     demo's 38). */
  { key: 'fcfbuild', name: 'RIBBON fills (Alt H F I R), ribbon bold (Alt H 1), minus on the right of the tax formula, single-cell autosum proposal at the total cell (the ☆ still lights)', moves: `C => { const o=C._o; return [
      {sel:'B7',      keys:[...T('=B6*-'+o.rateAbs), {key:'Enter'}]},
      {sel:'B8',      keys:[...T('=SUM(B6:B7)'), {key:'Enter'}]},
      {sel:'B12',     keys:[...T('=B8+B9+B10+B11'), {key:'Enter'}]},
      {sel:'B7:F7',   keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B8:F8',   keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B12:F12', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'G12',     keys:[{key:'=',alt:true,code:'Equal'},{key:'Enter'}]},
      {sel:'A12:G12', keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:'A12:G12', keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
    ]; }` },
  { key: 'fcfbuild', name: 'SLOW RUN, ☆ forfeited: nothing filled and nothing autosummed — all fifteen cells hand-typed year by year, the closing line dressed cell by cell BEFORE the total lands (206 keys against the demo\'s 38, every core green)', moves: `C => { const o=C._o; const YC=['B','C','D','E','F']; const mv=[];
      for(let i=0;i<5;i++){ const c=YC[i];
        mv.push({sel:c+'7',  keys:[...T('=-'+c+'6*'+o.rateAbs), {key:'Enter'}]});
        mv.push({sel:c+'8',  keys:[...T('='+c+'6+'+c+'7'), {key:'Enter'}]});
        mv.push({sel:c+'12', keys:[...T('='+c+'8+'+c+'9+'+c+'10+'+c+'11'), {key:'Enter'}]});
      }
      for(const c of ['A','B','C','D','E','F','G']){
        mv.push({sel:c+'12', keys:[{key:'b',ctrl:true}]});
        mv.push({sel:c+'12', keys:[{key:'Alt'},L('h'),L('b'),L('p')]});
      }
      mv.push({sel:'G12', keys:[...T('=B12+C12+D12+E12+F12'), {key:'Enter'}]});
      return mv; }` },
  /* r444 (txncomps depth pass, DEPTH_PASS §4.61). The pre-rework entry is DELETED, not kept:
     it drove hard-coded D3:D7/D8/B11/B13 on a ROWS:13 board that no longer exists. Per the
     CAMPAIGN §4 merge rule the reworking agent's side is authoritative for DELETIONS as well as
     additions — never union this file.
     ALT 1 = op-ORDER alt (the bridge written before the tape it depends on, recalc catching up)
     AND the measured ☆ NEGATIVE CONTROL: all six multiples typed, so every core clears with the
     star DARK (74 keys against the demo's 48). ALT 2 = chord-ROUTE alt: ribbon fill instead of
     Ctrl+D, an anchored divisor, the median by its long-hand SMALL form (proving beat 2 does not
     grade the word MEDIAN), and the landing boxed with Alt H B S — which on a ONE-CELL selection
     stores `ball` rather than `bt`, the route fact that would have stranded the dress beat. */
  { key: 'txncomps', name: 'op ORDER reversed — implied equity and implied EV written FIRST, then the median, then all six multiples TYPED (☆ forfeited, all five cores clear), landing dressed with ribbon bold', moves: `C => { const o=C._o; const mv=[
      {sel:o.CD+o.rEq, keys:[...T('='+o.CD+o.rEV+'-'+o.CD+o.rNd),{key:'Enter'}]},
      {sel:o.CD+o.rEV, keys:[...T('='+o.CD+o.rTgt+'*'+o.CF+o.rMed),{key:'Enter'}]},
      {sel:o.CF+o.rMed, keys:[...T('=MEDIAN('+o.CF+o.d0+':'+o.CF+o.dN+')'),{key:'Enter'}]}];
      for(let i=5;i>=0;i--){ const r=o.d0+i; mv.push({sel:o.CF+r, keys:[...T('='+o.CD+r+'/'+o.CE+r),{key:'Enter'}]}); }
      mv.push({sel:o.CD+o.rEq, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('d')]});
      return mv; }` },
  { key: 'txncomps', name: 'chord ROUTE: divisor column-anchored and filled by the RIBBON (alt h f i d), median by the long-hand SMALL form, bridge fully anchored, landing boxed with alt h b s (1x1 stores ball, not bt) — the ☆ still earns', moves: `C => { const o=C._o;
      const rng=o.CF+o.d0+':'+o.CF+o.dN, SD=[]; for(let i=0;i<5;i++) SD.push({key:'ArrowDown',shift:true});
      return [
      {sel:o.CF+o.d0, keys:[...T('='+o.CD+o.d0+'/$'+o.CE+o.d0),{key:'Enter'}]},
      {sel:o.CF+o.d0, keys:[...SD,{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
      {sel:o.CF+o.rMed, keys:[...T('=(SMALL('+rng+',3)+SMALL('+rng+',4))/2'),{key:'Enter'}]},
      {sel:o.CD+o.rEV, keys:[...T('=$'+o.CF+'$'+o.rMed+'*$'+o.CD+'$'+o.rTgt),{key:'Enter'}]},
      {sel:o.CD+o.rEq, keys:[...T('=$'+o.CD+'$'+o.rEV+'-$'+o.CD+'$'+o.rNd),{key:'Enter'}]},
      {sel:o.CD+o.rEq, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('s')]},
    ]; }` },
  /* r444 (football depth pass, DEPTH_PASS §4.62): the board was REBUILT, so the pre-r444 entry
     is DELETED, not edited — it drove B7/B8/B9 and D3:D5 on a nine-row board that no longer
     exists. Integrators: do not resurrect it (CAMPAIGN §4 union rule).
     ALT 1 = op-ORDER alt AND the measured ☆ NEGATIVE CONTROL — the page is worked backwards
     (box first, spread before its own inputs, mids last) with NOTHING filled, so all six cores
     clear with the star DARK. ALT 2 = chord-ROUTE alt — F4 instead of typed dollars, both
     ribbon fills, SMALL/LARGE instead of MIN/MAX, and Alt H B A for the box; the ☆ still
     earns, because a fill is a fill however it is reached. */
  { key: 'football', name: 'op ORDER backwards (box first, spread before its own inputs, mids LAST) and every formula TYPED — all six cores clear with the ☆ DARK, the measured negative control', moves: `C => { const o=C._o; const mv=[];
      for(const e of ['p','o','l','r']) mv.push({sel:o.boxRng, keys:[{key:'Alt'},L('h'),L('b'),L(e)]});
      mv.push({sel:o.spreadK, keys:[...T('=MAX('+o.hiRng+')-MIN('+o.loRng+')'),{key:'Enter'}]});
      mv.push({sel:o.ceilK,   keys:[...T('=MAX('+o.hiRng+')'),{key:'Enter'}]});
      mv.push({sel:o.floorK,  keys:[...T('=MIN('+o.loRng+')'),{key:'Enter'}]});
      for(const x of o.m) mv.push({sel:x.premK, keys:[...T('='+o.LM+x.row+'/$'+o.LL+'$'+o.pxR+'-1'),{key:'Enter'}]});
      for(const x of o.m) mv.push({sel:x.midK,  keys:[...T('=('+o.LL+x.row+'+'+o.LH+x.row+')/2'),{key:'Enter'}]});
      return mv; }` },
  { key: 'football', name: 'chord ROUTE: the price cell locked with F4 instead of typed dollars, both columns filled from the RIBBON (alt h f i d), SMALL/LARGE instead of MIN/MAX, the box drawn with alt h b a — the ☆ still fires', moves: `C => { const o=C._o; return [
      {sel:o.midTop,  keys:[...T('=AVERAGE('+o.LL+o.r1+':'+o.LH+o.r1+')'),{key:'Enter'}]},
      {sel:o.midRng,  keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
      {sel:o.premTop, keys:[...T('='+o.LM+o.r1+'/'+o.LL+o.pxR),{key:'F4'},...T('-1'),{key:'Enter'}]},
      {sel:o.premRng, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
      {sel:o.floorK,  keys:[...T('=SMALL('+o.loRng+',1)'),{key:'Enter'}]},
      {sel:o.ceilK,   keys:[...T('=LARGE('+o.hiRng+',1)'),{key:'Enter'}]},
      {sel:o.spreadK, keys:[...T('='+o.ceilK+'-'+o.floorK),{key:'Enter'}]},
      {sel:o.boxRng,  keys:[{key:'Alt'},L('h'),L('b'),L('a')]},
    ]; }` },
  /* r444 (DEPTH_PASS §4.63 depth pass): the board was rebuilt from a fixed C4:G6 grid on an
     8-row sheet to a 20-row DCF page whose grid draws from a 4-spot pool, so the pre-r444 entry
     ("fill DOWN first, then right", hard-coded C4/C4:C6/C4:G6) is DELETED, not edited — those
     cells no longer exist. Integrators: do not resurrect it (CAMPAIGN §4 union rule). */
  { key: 'dcfsens', name: 'op ORDER alt — the corner COMMAED FIRST so the format travels with the formula on the fill, the grid built down-the-column then right, and the base case boxed last (the box has to come after the fills or the fill overwrites it — the one ordering the board really does constrain)', moves: `C => { const o=C._o;
      const f=(i,j)=>'=$'+o.CB+'$'+o.rTfcf+'/('+o.yc[j]+'$'+o.hr+'-$'+o.CB+(o.gr0+i)+')';
      return [
        {sel:o.corner, keys:[...T(f(0,0)), {key:'Enter'}]},
        {sel:o.corner, keys:[{key:'1',ctrl:true}, L('N')]},                 // comma the SOURCE cell — the fill carries the format
        {sel:o.corner+':'+o.yc[0]+(o.gr0+2), keys:[{key:'d',ctrl:true}]},   // down the first WACC column
        {sel:o.grid, keys:[{key:'r',ctrl:true}]},                           // then right across the block
        {sel:o.baseCell, keys:[Kb.alt,L('h'),L('b'),L('a')]},               // all-borders on a 1x1 IS the box
      ]; }` },
  { key: 'dcfsens', name: 'chord ROUTE alt — F4 cycling instead of typed dollar signs (B7 -> $B$7 -> B$7 -> $B7), both fills off the RIBBON (Alt H F I R / Alt H F I D), comma via Alt H K + Alt H 9 x2 instead of Ctrl+1 N, and the box walked edge by edge (B P/O/L/R): every core clears and the star still lands', moves: `C => { const o=C._o; const F4={key:'F4'};
      return [
        {sel:o.corner, keys:[...T('='+o.fcfCell), F4, ...T('/('+o.yc[0]+o.hr), F4, F4,
                             ...T('-'+o.CB+o.gr0), F4, F4, F4, ...T(')'), {key:'Enter'}]},
        {sel:o.topRow, keys:[Kb.alt,L('h'),L('f'),L('i'),L('r')]},
        {sel:o.grid,   keys:[Kb.alt,L('h'),L('f'),L('i'),L('d')]},
        {sel:o.grid,   keys:[Kb.alt,L('h'),L('k')]},
        {sel:o.grid,   keys:[Kb.alt,L('h'),D(9),Kb.alt,L('h'),D(9)]},
        {sel:o.baseCell, keys:[Kb.alt,L('h'),L('b'),L('p'),Kb.alt,L('h'),L('b'),L('o'),
                               Kb.alt,L('h'),L('b'),L('l'),Kb.alt,L('h'),L('b'),L('r')]},
      ]; }` },
  { key: 'dcfsens', name: 'THE NEGATIVE CONTROL, ☆ forfeited — fifteen anchored formulas typed out with no fill anywhere: all five cores clear and the re-cut fill-☆ stays DARK, which is what proves it skippable by measurement rather than by assertion (292 keys against the demo\'s 32; dev/verify-dcfsens.js §E runs the fully hand-dressed variant at 407)', moves: `C => { const o=C._o; const out=[];
      for(let i=0;i<3;i++) for(let j=0;j<5;j++){
        const f='=$'+o.CB+'$'+o.rTfcf+'/('+o.yc[j]+'$'+o.hr+'-$'+o.CB+(o.gr0+i)+')';
        out.push({sel:o.yc[j]+(o.gr0+i), keys:[...T(f), {key:'Enter'}]}); }
      out.push({sel:o.grid, keys:[{key:'1',ctrl:true}, L('N')]});
      out.push({sel:o.baseCell, keys:[Kb.alt,L('h'),L('b'),L('s')]});
      return out; }` },
  { key: 'wrapfix', name: 'chord ROUTE alt — every read RETYPED in full (VLOOKUP, not INDEX/MATCH), ribbon bold and ribbon top border, typed SUM: all six cores clear with the re-cut fill-☆ DARK (the measured negative control, 145 keys against the demo\'s 24)', moves: `C => { const o=C._o;
      const key=cell=>o.CA+cell.replace(/[A-J]/g,'');
      const vl=cell=>'=VLOOKUP('+key(cell)+','+o.CA+o.T0+':'+o.CC+o.TN+',3,0)';
      return [
        {sel:o.wrapCell, keys:[...T('=IFERROR('+vl(o.wrapCell).slice(1)+',0)'),{key:'Enter'}]},
        {sel:o.bad[0].cell, keys:[...T(vl(o.bad[0].cell)),{key:'Enter'}]},
        {sel:o.bad[1].cell, keys:[...T(vl(o.bad[1].cell)),{key:'Enter'}]},
        {sel:o.totCell, keys:[...T('=SUM('+o.readRng+')'),{key:'Enter'}]},
        {sel:o.totRow, keys:[{key:'Alt'},L('h'),D(1)]},
        {sel:o.totRow, keys:[{key:'Alt'},L('h'),L('b'),L('p')]},
      ]; }` },
  { key: 'wrapfix', name: 'op ORDER alt — foot and dress the panel LAST is the only order that works, so this one repairs bottom-up, wraps before it fixes, boxes the total with Alt H B S instead of B P, and takes the ☆ with the ribbon fill Alt H F I D', moves: `C => { const o=C._o;
      return [
        {sel:o.wrapCell, keys:[{key:'F2'},...T(',0)'),{key:'Home'},...T('IFERROR('),{key:'Enter'}]},
        {sel:o.good.cell, keys:[{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
        {sel:o.totRow, keys:[{key:'Alt'},L('h'),L('b'),L('s')]},
        {sel:o.totCell, keys:[{key:'=',alt:true,code:'Equal'},{key:'Enter'}]},
        {sel:o.totRow, keys:[{key:'b',ctrl:true}]},
      ]; }` },
  { key: 'cases', name: 'chord ROUTE alt — the driver built with INDEX instead of CHOOSE (the r439 untriggerable-beat probe: identical board, identical behaviour under every switch position) and every fill taken off the ribbon, Alt H F I D / Alt H F I R', moves: `C => { const o=C._o;
      const R=n=>{ const a=[]; for(let i=0;i<n;i++) a.push({key:'ArrowRight',shift:true}); return a; };
      return [
        {sel:o.drv0, keys:[...T('=INDEX('+o.CB+o.rCase+':'+o.CD+o.rCase+',$'+o.CB+'$'+o.rSw+')'),{key:'Enter'}]},
        {sel:o.drv0, keys:[{key:'ArrowDown',shift:true},{key:'ArrowDown',shift:true},{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
        {sel:o.rev1, keys:[...T('='+o.CB+o.rRev+'*(1+$'+o.CB+'$'+o.rDrvG+')'),{key:'Enter'}]},
        {sel:o.rev1, keys:[...R(o.NY-2),{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
        {sel:o.eb0,  keys:[...T('='+o.CB+o.rRev+'*$'+o.CB+'$'+o.rDrvM),{key:'Enter'}]},
        {sel:o.eb0,  keys:[...R(o.NY-1),{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
        {sel:o.cap0, keys:[...T('=IF($'+o.CB+'$'+o.rSw+'='+o.CC+'$'+o.rNum+',$'+o.capL+'$'+o.rEb+','+o.CC+o.rSnap+')'),{key:'Enter'}]},
        {sel:o.cap0, keys:[...R(2),{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
        {sel:o.swCell, keys:[...T('1'),{key:'Enter'}]},
        {sel:o.swCell, keys:[...T('2'),{key:'Enter'}]},
        {sel:o.swCell, keys:[...T('3'),{key:'Enter'}]},
        {sel:o.mutCell, keys:[...T(o.mutPct+'%'),{key:'Enter'}]},
        {sel:o.swCell, keys:[...T(String(o.mutIdx)),{key:'Enter'}]},
      ]; }` },
  { key: 'cases', name: 'op ORDER alt AND the measured negative control — capture built first, then EBITDA, then revenue, then the driver, and the driver TYPED OUT three times so all five cores clear with the ☆ DARK (133 keys against the demo\'s 92)', moves: `C => { const o=C._o;
      const R=n=>{ const a=[]; for(let i=0;i<n;i++) a.push({key:'ArrowRight',shift:true}); return a; };
      const ch=(r)=>'=CHOOSE($'+o.CB+'$'+o.rSw+','+o.CB+r+','+o.CC+r+','+o.CD+r+')';
      return [
        {sel:o.cap0, keys:[...T('=IF($'+o.CB+'$'+o.rSw+'='+o.CC+'$'+o.rNum+',$'+o.capL+'$'+o.rEb+','+o.CC+o.rSnap+')'),{key:'Enter'}]},
        {sel:o.cap0, keys:[...R(2),{key:'r',ctrl:true}]},
        {sel:o.eb0,  keys:[...T('='+o.CB+o.rRev+'*$'+o.CB+'$'+o.rDrvM),{key:'Enter'}]},
        {sel:o.eb0,  keys:[...R(o.NY-1),{key:'r',ctrl:true}]},
        {sel:o.rev1, keys:[...T('='+o.CB+o.rRev+'*(1+$'+o.CB+'$'+o.rDrvG+')'),{key:'Enter'}]},
        {sel:o.rev1, keys:[...R(o.NY-2),{key:'r',ctrl:true}]},
        {sel:o.drv0, keys:[...T(ch(o.rCase)),{key:'Enter'}]},
        {sel:o.CB+o.rDrvG, keys:[...T(ch(o.rG)),{key:'Enter'}]},
        {sel:o.CB+o.rDrvM, keys:[...T(ch(o.rM)),{key:'Enter'}]},
        {sel:o.swCell, keys:[...T('1'),{key:'Enter'}]},
        {sel:o.swCell, keys:[...T('2'),{key:'Enter'}]},
        {sel:o.swCell, keys:[...T('3'),{key:'Enter'}]},
        {sel:o.mutCell, keys:[...T(o.mutPct+'%'),{key:'Enter'}]},
        {sel:o.swCell, keys:[...T(String(o.mutIdx)),{key:'Enter'}]},
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
          /* r423 §1: saveClose drills close on the universal Ctrl+S beat — every alt route
             ends with the same save keystroke a player would press (the routes themselves
             stay chord-diverse; the closer is engine-owned and route-independent) */
          if (!done && C.saveClose) demoKey({ key: 's', ctrl: true });
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
