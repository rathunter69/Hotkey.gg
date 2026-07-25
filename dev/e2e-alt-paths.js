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
  { key: 'drill', name: 'values paste via the H V S dialog route', moves: `C => [
      {sel:'B3:B8', keys:[{key:'c',ctrl:true}]},
      {sel:'B3:B8', keys:[{key:'Alt'},L('h'),L('v'),L('s'),L('v'),{key:'Enter'}]},
      {sel:'B3:B8', keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
    ]` },
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
  /* r429 (center ROUND 3, DEPTH_PASS §4.13): the pre-rework single alt (title-across via Alt O E)
     is replaced by the §1.8 pair. ALT 1 = chord-ROUTE alt — the whole drill off different keys:
     space chords take the row/column, bold from the ribbon, the header rule drawn as an OUTSIDE
     border, the title centered across from the Home ribbon's Format Cells; the one-pass ☆ still
     lands, proving the ☆ latch is route-blind. ALT 2 = op-ORDER alt — the beats run backwards and
     the figures are right-aligned in TWO passes, so every core clears with the ☆ FORFEITED
     (§1.0(c) freedom + the §1.0-R2(i) skippability proof). */
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
