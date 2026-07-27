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
  { key: 'undo', name: 'junk FIRST, values RETYPED back (no undo at all — Freedom), ribbon bold/italic LAST — cores clear, no ☆', moves: `C => { const o=C._o;
      const steps=[
        {sel:o.rightRng, keys:[{key:'Delete'}]},
        {sel:o.wrongRng, keys:[{key:'Delete'}]},
      ];
      o.wrongCells.forEach((k,i)=>steps.push({sel:k, keys:[...T(String(o.wrongVals[i])),{key:'Enter'}]}));
      steps.push({sel:'A1', keys:[{key:'Alt'},L('h'),D(1)]});
      steps.push({sel:o.memo, keys:[{key:'Alt'},L('h'),D(2)]});
      steps.push({sel:o.logCell, keys:[...T('cleared per note'),{key:'Enter'}]});
      return steps; }` },
  /* r425 (undo ROUND 2): chord-ROUTE alt — clears via the ribbon clear menu (alt h e c,
     contents only), the ☆ walked on the OTHER redo chord (ctrl+shift+z, not ctrl+y), the
     log signed through an F2 edit. Same beat order as the demo, different keys throughout. */
  { key: 'undo', name: 'ribbon clears (alt h e c), deep undo + ctrl+shift+z redo (the ☆ on the other chord), F2 log entry', moves: `C => { const o=C._o; return [
      {sel:'A1', keys:[{key:'b',ctrl:true}]},
      {sel:o.memo, keys:[{key:'i',ctrl:true}]},
      {sel:o.wrongRng, keys:[{key:'Alt'},L('h'),L('e'),L('c')]},
      {sel:o.wrongRng, keys:[{key:'z',ctrl:true},{key:'z',ctrl:true},{key:'z',ctrl:true}]},
      {sel:'A1', keys:[{key:'z',ctrl:true,shift:true},{key:'z',ctrl:true,shift:true}]},
      {sel:o.rightRng, keys:[{key:'Alt'},L('h'),L('e'),L('c')]},
      {sel:o.logCell, keys:[{key:'F2'},...T('cleared per note'),{key:'Enter'}]},
    ]; }` },
  { key: 'copyover', name: 'deck hand-off FIRST (ctrl+alt+v values), dress rides, block after, peel off the ORIGINAL column', moves: `C => { const o=C._o;
      const srcCol=(o.peel?'C':'B')+'4:'+(o.peel?'C':'B')+'7';
      return [
        {sel:o.srcTot, keys:[{key:'c',ctrl:true}]},
        {sel:o.d3, keys:[{key:'v',ctrl:true,alt:true},L('v'),{key:'Enter'}]},
        {sel:o.deckRng, keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
        {sel:o.deckRect, keys:[{key:'Alt'},L('h'),L('b'),L('s')]},
        {sel:o.src, keys:[{key:'c',ctrl:true}]},
        {sel:o.d1, keys:[{key:'v',ctrl:true}]},
        {sel:srcCol, keys:[{key:'c',ctrl:true}]},
        {sel:o.d2, keys:[{key:'v',ctrl:true}]},
      ]; }` },
  /* r425: chord-ROUTE alt — values land via the Alt H V S dialog instead of Alt E S V /
     ctrl+alt+v, and the ☆ source delete fires MID-RUN, before the dress beats: the
     destructive bonus may NEVER un-flip a core beat (the live re-grade safety this
     drill's rework documents in its ☆ deviation comment). */
  { key: 'copyover', name: 'H V S dialog values, ☆ source delete MID-RUN (destructive-bonus safety), box via preselected range', moves: `C => { const o=C._o; return [
      {sel:o.src, keys:[{key:'c',ctrl:true}]},
      {sel:o.d1, keys:[{key:'v',ctrl:true}]},
      {sel:o.landedCol, keys:[{key:'c',ctrl:true}]},
      {sel:o.d2, keys:[{key:'v',ctrl:true}]},
      {sel:o.srcTot, keys:[{key:'c',ctrl:true}]},
      {sel:o.d3, keys:[{key:'Alt'},L('h'),L('v'),L('s'),L('v'),{key:'Enter'}]},
      {sel:o.srcAll, keys:[{key:'Delete'}]},
      {sel:o.deckRng, keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
      {sel:o.deckRect, keys:[{key:'Alt'},L('h'),L('b'),L('s')]},
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
  /* r429 (DEPTH_PASS §4.22 wave 5): both foot entries rebuilt — the pre-rework pair hardcoded a
     fixed 4x4 block at B2 (the grid is now 3-5 regions x 3-4 quarters and it moves), and predated
     the dress beat, the cross-foot prove-out and the ☆. */
  { key: 'foot', name: 'op-ORDER — columns before rows, typed SUMs (no alt+=), corner off the Total ROW edge (the ☆ must latch on EITHER edge)', moves: `C => { const o=C._o, mv=[];
      mv.push({sel:'B'+o.tr, keys:[...T('=SUM(B'+o.r0+':B'+(o.tr-1)+')'),{key:'Enter'}]});
      mv.push({sel:'B'+o.tr+':'+o.lastQ+o.tr, keys:[{key:'r',ctrl:true}]});
      mv.push({sel:o.tCol+o.r0, keys:[...T('=SUM(B'+o.r0+':'+o.lastQ+o.r0+')'),{key:'Enter'}]});
      mv.push({sel:o.tCol+o.r0+':'+o.tCol+(o.tr-1), keys:[{key:'d',ctrl:true}]});
      mv.push({sel:o.tCol+o.tr, keys:[...T('=SUM(B'+o.tr+':'+o.lastQ+o.tr+')'),{key:'Enter'}]});
      mv.push({sel:'A'+o.tr+':'+o.tCol+o.tr, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]});
      mv.push({sel:o.tCol+o.r0+':'+o.tCol+o.tr, keys:[{key:'b',ctrl:true}]});
      mv.push({sel:o.chk, keys:[...T('='+o.tCol+o.tr+'-SUM('+o.tCol+o.r0+':'+o.tCol+(o.tr-1)+')'),{key:'Enter'}]});
      mv.push({sel:'A1', keys:[{key:'s',ctrl:true}]});
      return mv; }` },
  { key: 'foot', name: 'FREEDOM proof — corner re-summed off the RAW BLOCK and ribbon bold (☆ forfeited, all five cores clear)', moves: `C => { const o=C._o, mv=[];
      mv.push({sel:o.tCol+o.r0, keys:[{key:'=',alt:true},{key:'Enter'}]});
      mv.push({sel:o.tCol+o.r0+':'+o.tCol+(o.tr-1), keys:[{key:'d',ctrl:true}]});
      mv.push({sel:'B'+o.tr, keys:[{key:'=',alt:true},{key:'Enter'}]});
      mv.push({sel:'B'+o.tr+':'+o.lastQ+o.tr, keys:[{key:'r',ctrl:true}]});
      mv.push({sel:o.tCol+o.tr, keys:[...T('=SUM(B'+o.r0+':'+o.lastQ+(o.tr-1)+')'),{key:'Enter'}]});
      mv.push({sel:'A'+o.tr+':'+o.tCol+o.tr, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('p')]});
      mv.push({sel:o.tCol+o.r0+':'+o.tCol+o.tr, keys:[{key:'Alt'},L('h'),D(1)]});
      mv.push({sel:o.chk, keys:[...T('='+o.tCol+o.tr+'-SUM('+o.tCol+o.r0+':'+o.tCol+(o.tr-1)+')'),{key:'Enter'}]});
      mv.push({sel:'A1', keys:[{key:'s',ctrl:true}]});
      return mv; }` },
  /* r429: the r199-era decimals alt is RETIRED — it solved the pre-rework comps board
     (o.evR/o.mR/o.pR are gone with §4.12). Its "columns in a different order" coverage lives on
     inside the two r429 entries below, which also carry the ☆ earn/forfeit controls. */
  /* r424 (D17): the colops entry is gone with the drill — its column-op alternates live on
     inside the two rowops entries above (ribbon vs chord routes, insert-vs-delete order). */
  /* r429 (DEPTH_PASS §4.23 wave 5): both anchor entries rebuilt — the pre-rework pair stopped at
     the fill (the drill now carries dollar-format, an outside border and the independent-check ☆),
     and the grid moved off its nailed C4 site onto a 4-spot pool with 3-4 rows. ALT 1 = chord-ROUTE
     (typed $ instead of F4, ctrl+1 for the money register, Alt H B A all-borders instead of B S —
     the boxed check accepts either end state per §1.0-R2(m)). ALT 2 = the skippability control. */
  /* r429 (DEPTH_PASS §4.30 wave 5): fxconvert had ZERO registered ALTS — one of the two audit
     findings the page names (the other was guide 3-vs-5, also fixed). Two now, incl. the
     ☆-forfeit control. */
  { key: 'fxconvert', name: 'chord-ROUTE — typed $ anchors (no F4), ctrl+1 comma register, ribbon fills; the ☆ must still latch', moves: `C => [
      {sel:'B3', keys:[...T(C._rateStr),{key:'Enter'}]},
      {sel:'B3', keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
      {sel:'B3', keys:[{key:'Alt'},L('h'),L('b'),L('a')]},
      {sel:'B10', keys:[...T('=B6*$B$3'),{key:'Enter'}]},
      {sel:'B10:F10', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:'B10:F12', keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
      {sel:'B10:F12', keys:[{key:'1',ctrl:true},L('n')]},
      {sel:'A10:F12', keys:[{key:'Alt'},L('h'),L('b'),L('s')]},
      {sel:'A1', keys:[{key:'s',ctrl:true}]},
    ]` },
  { key: 'fxconvert', name: 'FREEDOM proof — every conversion TYPED with the rate inline, no anchored formula and no fill (☆ forfeited, all five cores clear)', moves: `C => { const mv=[], r=C._rate;
      mv.push({sel:'B3', keys:[...T(C._rateStr),{key:'Enter'}]});
      mv.push({sel:'B3', keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]});
      mv.push({sel:'B3', keys:[{key:'Alt'},L('h'),L('b'),L('a')]});
      for(let i=0;i<3;i++) for(let j=0;j<5;j++){
        mv.push({sel:colLetter(2+j)+(10+i), keys:[...T('='+colLetter(2+j)+(6+i)+'*'+C._rateStr),{key:'Enter'}]}); }
      mv.push({sel:'B10:F12', keys:[{key:'Alt'},L('h'),L('k')]});
      mv.push({sel:'A10:F12', keys:[{key:'Alt'},L('h'),L('b'),L('s')]});
      mv.push({sel:'A1', keys:[{key:'s',ctrl:true}]});
      return mv; }` },
  { key: 'anchor', name: 'chord-ROUTE — dollars typed by hand (no F4), ctrl+1 money register, Alt H B A all-borders instead of the outside chord', moves: `C => { const o=C._o; return [
      {sel:o.tl, keys:[...T('=$B'+o.r0+'*C$'+o.hr),{key:'Enter'}]},
      {sel:o.col, keys:[{key:'d',ctrl:true}]},
      {sel:o.grid, keys:[{key:'r',ctrl:true}]},
      {sel:o.grid, keys:[{key:'1',ctrl:true},L('C')]},
      {sel:o.grid, keys:[{key:'Alt'},L('h'),L('b'),L('a')]},
      {sel:o.chk, keys:[...T('=B'+(o.r0+o.n-1)+'*'+o.lastC+o.hr),{key:'Enter'}]},
      {sel:'A1', keys:[{key:'s',ctrl:true}]},
    ]; }` },
  { key: 'anchor', name: 'pointer mode + F4, check cell left EMPTY (☆ forfeited, all five cores clear)', moves: `C => { const o=C._o; return [
      {sel:o.tl, keys:[{key:'='},{key:'ArrowLeft'},{key:'F4'},{key:'F4'},{key:'F4'},{key:'*'},{key:'ArrowUp'},{key:'F4'},{key:'F4'},{key:'Enter'}]},
      {sel:o.col, keys:[{key:'d',ctrl:true}]},
      {sel:o.grid, keys:[{key:'r',ctrl:true}]},
      {sel:o.grid, keys:[{key:'$',ctrl:true,shift:true},{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
      {sel:o.grid, keys:[{key:'Alt'},L('h'),L('b'),L('s')]},
      {sel:'A1', keys:[{key:'s',ctrl:true}]},
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
  /* r429 (DEPTH_PASS §4.24 wave 5): both percent entries rebuilt — the pre-rework pair hardcoded
     block A at C2:C6 (both blocks now site-shuffle), used C._R for what is now C._B, and predated
     the one-decimal requirement, the bold-revenue beat and the ☆. */
  { key: 'percent', name: 'chord-ROUTE — typed dollar anchors (no F4), unit B first, ribbon percent (Alt H P) and ribbon bold', moves: `C => { const A=C._A, B=C._B; return [
      {sel:B.pc+B.r0, keys:[...T('='+B.vc+B.r0+'/$'+B.vc+'$'+B.r0),{key:'Enter'}]},
      {sel:B.pc+B.r0+':'+B.pc+B.rN, keys:[{key:'d',ctrl:true},{key:'Alt'},L('h'),L('p'),{key:'Alt'},L('h'),D(0)]},
      {sel:A.pc+A.r0, keys:[...T('='+A.vc+A.r0+'/$'+A.vc+'$'+A.r0),{key:'Enter'}]},
      {sel:A.pc+A.r0+':'+A.pc+A.rN, keys:[{key:'d',ctrl:true},{key:'Alt'},L('h'),L('p'),{key:'Alt'},L('h'),D(0)]},
      {sel:A.lc+A.r0+':'+A.pc+A.r0, keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:B.lc+B.r0+':'+B.pc+B.r0, keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:'A1', keys:[{key:'s',ctrl:true}]},
    ]; }` },
  { key: 'percent', name: 'FREEDOM proof — every row written by hand with its own anchored formula, no fill at all (☆ forfeited, all five cores clear)', moves: `C => { const mv=[];
      for(const blk of [C._A, C._B]){
        for(let i=0;i<blk.n;i++){ const r=blk.r0+i;
          mv.push({sel:blk.pc+r, keys:[...T('='+blk.vc+r+'/$'+blk.vc+'$'+blk.r0),{key:'Enter'}]}); }
        mv.push({sel:blk.pc+blk.r0+':'+blk.pc+blk.rN, keys:[{key:'%',ctrl:true,shift:true},{key:'Alt'},L('h'),D(0)]});
        mv.push({sel:blk.lc+blk.r0+':'+blk.pc+blk.r0, keys:[{key:'b',ctrl:true}]});
      }
      mv.push({sel:'A1', keys:[{key:'s',ctrl:true}]});
      return mv; }` },
  /* r429 (DEPTH_PASS §4.27 wave 5): both bridge entries rebuilt — the pre-rework entry used o.f /
     o.rng (gone) and stopped at the EBITDA fill; the drill now grows the revenue line off the memo
     rates, totals the FY column and dresses the line. ALT 1 = chord-ROUTE, typed refs (no pointing)
     with the RIBBON fill — the ☆ latch is chord-agnostic so it must still earn. ALT 2 = the
     skippability control: both rows filled in CHUNKS instead of one pass. */
  { key: 'bridge', name: 'chord-ROUTE — typed refs (no pointing at all) and ribbon fill right (Alt H F I R); the one-pass ☆ must still latch', moves: `C => { const o=C._o;
      const CL=j=>colLetter(o.c0+j);
      return [
        {sel:o.rev2, keys:[...T('='+CL(0)+(o.hr+1)+'*(1+'+CL(1)+(o.hr+5)+')'),{key:'Enter'}]},
        {sel:o.revRng, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
        {sel:o.eb1, keys:[...T('='+CL(0)+(o.hr+1)+'*'+CL(0)+(o.hr+2)),{key:'Enter'}]},
        {sel:o.ebRng, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
        {sel:o.fy, keys:[...T('=SUM('+CL(0)+(o.hr+3)+':'+CL(4)+(o.hr+3)+')'),{key:'Enter'}]},
        {sel:o.ebRow, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('p')]},
        {sel:'A1', keys:[{key:'s',ctrl:true}]},
      ]; }` },
  { key: 'bridge', name: 'FREEDOM proof — both rows filled in CHUNKS, one column at a time (☆ forfeited, all six cores clear)', moves: `C => { const o=C._o, mv=[];
      const CL=j=>colLetter(o.c0+j);
      mv.push({sel:o.rev2, keys:[...T('='+CL(0)+(o.hr+1)+'*(1+'+CL(1)+(o.hr+5)+')'),{key:'Enter'}]});
      for(let j=2;j<=4;j++) mv.push({sel:CL(j-1)+(o.hr+1)+':'+CL(j)+(o.hr+1), keys:[{key:'r',ctrl:true}]});
      mv.push({sel:o.eb1, keys:[...T('='+CL(0)+(o.hr+1)+'*'+CL(0)+(o.hr+2)),{key:'Enter'}]});
      for(let j=1;j<=4;j++) mv.push({sel:CL(j-1)+(o.hr+3)+':'+CL(j)+(o.hr+3), keys:[{key:'r',ctrl:true}]});
      mv.push({sel:o.fy, keys:[{key:'=',alt:true},{key:'Enter'}]});
      mv.push({sel:o.ebRow, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]});
      mv.push({sel:'A1', keys:[{key:'s',ctrl:true}]});
      return mv; }` },
  /* r429 (DEPTH_PASS §4.14 wave 4): both autofit entries rebuilt — the pre-rework entry solved a
     two-island board (o.uRng / o.a1 / o.a2 are gone with the headcount-roster rework). ALT 1 =
     op-ORDER + the §1.0(c) FREEDOM proof (widths last, totals TYPED, label columns fitted one at a
     time — every core clears, the one-pass ☆ is forfeited). ALT 2 = chord-ROUTE + SUPERSET ☆ proof
     (a sweep wider than the two label columns still latches, and the quarter widths are re-set
     afterwards so beat 2 survives the over-wide autofit). */
  { key: 'autofit', name: 'op-ORDER reversed + FREEDOM proof — TYPED totals, label columns fitted one at a time (☆ forfeited, all five cores clear)', moves: `C => { const o=C._o; const mv=[];
      for(let i=0;i<=o.nd;i++) mv.push({sel:o.tCol+(o.hr+1+i), keys:[...T(String(o.expect[i])),{key:'Enter'}]});
      mv.push({sel:'A'+o.rt+':'+o.tCol+o.rt, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]});
      mv.push({sel:'A'+o.hr, keys:[{key:'Alt'},L('h'),L('o'),L('i')]});
      mv.push({sel:'B'+o.hr, keys:[{key:'Alt'},L('h'),L('o'),L('i')]});
      mv.push({sel:o.tCol+(o.hr+1), keys:[{key:'Alt'},L('h'),L('o'),L('i')]});
      mv.push({sel:o.qRng, keys:[{key:'Alt'},L('h'),L('o'),L('w'),D(1),D(2),{key:'Enter'}]});
      mv.push({sel:'A1', keys:[{key:'s',ctrl:true}]});
      return mv; }` },
  { key: 'autofit', name: 'chord-ROUTE + SUPERSET ☆ proof — one autofit across A:G (must latch), quarter widths re-set after, fill-down via the ribbon', moves: `C => { const o=C._o; return [
      {sel:o.tCol+(o.hr+1), keys:[...T('=SUM('+o.q1+(o.hr+1)+':'+o.q4+(o.hr+1)+')'),{key:'Enter'}]},
      {sel:o.tCol+(o.hr+1)+':'+o.tCol+o.rt, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
      {sel:'A'+o.hr+':'+o.tCol+o.rt, keys:[{key:'Alt'},L('h'),L('o'),L('i')]},
      {sel:o.qRng, keys:[{key:'Alt'},L('h'),L('o'),L('w'),D(1),D(2),{key:'Enter'}]},
      {sel:'A'+o.rt+':'+o.tCol+o.rt, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:'A1', keys:[{key:'s',ctrl:true}]},
    ]; }` },
  { key: 'editfix', name: 'range stretched FIRST, drift typed as a number (no ☆), memo mid-run, typos last in reverse', moves: `C => { const o=C._o;
      const steps=[
        {sel:o.totCell, keys:[{key:'F2'},{key:'Backspace'},{key:'Backspace'},...T(o.tailFix),{key:'Enter'}]},
        {sel:o.driftCell, keys:[...T(String(o.feedVal)),{key:'Enter'}]},
        {sel:o.memoCell, keys:[{key:'5',ctrl:true}]},
      ];
      [o.s2,o.s1].forEach(s2=>{
        let p=0; while(p<s2.bad.length && p<s2.good.length && s2.bad[p]===s2.good[p]) p++;
        const keys=[{key:'F2'}];
        for(let i=0;i<s2.bad.length-p;i++) keys.push({key:'Backspace'});
        keys.push(...T(s2.good.slice(p)),{key:'Enter'});
        steps.push({sel:s2.cell, keys});
      });
      return steps; }` },
  /* r425 (editfix rework): chord-ROUTE alt — a ZERO-F2 run. Typos and the total fixed by full
     retype (slow but legal — §1.0(c) freedom re-affirmed), the strike via the ctrl+1 K Font-tab
     route, the drift repaired by reference (the ☆ route inside an otherwise slow run). */
  { key: 'editfix', name: 'zero-F2 run — full retypes + ctrl+1 K strike + drift by reference (☆ route)', moves: `C => { const o=C._o; return [
      {sel:o.s1.cell, keys:[...T(o.s1.good),{key:'Enter'}]},
      {sel:o.s2.cell, keys:[...T(o.s2.good),{key:'Enter'}]},
      {sel:o.driftCell, keys:[...T('='+o.feedCell),{key:'Enter'}]},
      {sel:o.memoCell, keys:[{key:'1',ctrl:true},L('k')]},
      {sel:o.totCell, keys:[...T('=SUM(C11:C12)'),{key:'Enter'}]},
    ]; }` },
  { key: 'drill', name: 'values paste via the H V S dialog route', moves: `C => [
      {sel:'B3:B8', keys:[{key:'c',ctrl:true}]},
      {sel:'B3:B8', keys:[{key:'Alt'},L('h'),L('v'),L('s'),L('v'),{key:'Enter'}]},
      {sel:'B3:B8', keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
    ]` },
  { key: 'dress', name: 'op-ORDER bottom-up: outline FIRST, ☆ one-pass comma via ctrl+shift+!, masthead LAST with a double-bottom rule (tightened CHECK1 accepts bdbl)', moves: `C => { const R=C._R; return [
      {sel:'A'+R.mRow+':E'+R.mRow, keys:[{key:'Alt'},L('h'),L('b'),L('s')]},
      {sel:R.mRowRange, keys:[{key:'%',ctrl:true,shift:true},{key:'Alt'},L('h'),D(0)]},
      {sel:'A'+R.tRow+':E'+R.tRow, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:R.fRange, keys:[{key:'!',ctrl:true,shift:true}]},
      {sel:R.costRange, keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
      {sel:R.segRange, keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
      {sel:'A1', keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('b')]},
    ]; }` },
  { key: 'dress', name: 'chord-ROUTE: ribbon bold (alt h 1), ctrl+1 dialog comma/percent, all-borders outline (alt h b a) — commas row-by-row, ☆ forfeited, core clears', moves: `C => { const R=C._R;
      const steps=[
        {sel:'A1', keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('o')]},
        {sel:R.segRange, keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
        {sel:R.costRange, keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
      ];
      for(let r=R.segR0;r<=R.tRow;r++) steps.push({sel:'B'+r+':E'+r, keys:[{key:'1',ctrl:true},L('n')]});   // the slow way — every row its own pass; no fmtOps rect covers the body
      steps.push({sel:'A'+R.tRow+':E'+R.tRow, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('p')]});
      steps.push({sel:R.mRowRange, keys:[{key:'1',ctrl:true},L('p')]});
      steps.push({sel:'A'+R.mRow+':E'+R.mRow, keys:[{key:'Alt'},L('h'),L('b'),L('a')]});
      return steps; }` },
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
  { key: 'typeset', name: 'RIBBON routes — bold/unbold via Alt H 1, italics line-by-line via Alt H 2 (☆ forfeited, core clears), strike via ctrl+1 K', moves: `C => { const o=C._o; return [
      {sel:'A2:D2', keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:o.wbRng, keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:'A'+o.m0, keys:[{key:'Alt'},L('h'),D(2)]},
      {sel:'A'+(o.m0+1), keys:[{key:'Alt'},L('h'),D(2)]},
      {sel:'A'+(o.m0+2), keys:[{key:'Alt'},L('h'),D(2)]},
      {sel:o.deadRng, keys:[{key:'1',ctrl:true},L('k')]},
      {sel:o.stamp, keys:[...T('=TODAY()'),{key:'Enter'}]},
    ]; }` },
  { key: 'typeset', name: 'reverse order — signed FIRST, strike, one-pass memos, unbold, header bold LAST', moves: `C => { const o=C._o; return [
      {sel:o.stamp, keys:[...T('=TODAY()'),{key:'Enter'}]},
      {sel:o.deadRng, keys:[{key:'5',ctrl:true}]},
      {sel:o.memoRng, keys:[{key:'i',ctrl:true}]},
      {sel:o.wbRng, keys:[{key:'b',ctrl:true}]},
      {sel:'A2:D2', keys:[{key:'b',ctrl:true}]},
    ]; }` },
  { key: 'unhide', name: 'width fixed FIRST, ribbon unhide route, grouped while still hidden', moves: `C => { const o=C._o; return [
      {sel:'B2', keys:[{key:'Alt'},L('h'),L('o'),L('w'),{key:'1'},{key:'2'},{key:'Enter'}]},
      {sel:'A'+o.h1+':A'+o.h2, keys:[{key:'ArrowRight',alt:true,shift:true}]},
      {sel:'A'+(o.h1-1)+':A'+(o.h2+1), keys:[{key:'Alt'},L('h'),L('o'),L('u'),L('o')]},
      {sel:'A'+(o.h1-1), keys:[{key:'Alt'},L('a'),L('h')]},
    ]; }` },
  /* r429 (DEPTH_PASS §4.29 wave 5): both rollup entries rebuilt — the pre-rework entry hardcoded
     the F2:H5 grid and a 9-row list (all of it now varies) and predated the promoted axes beat and
     the ☆. ALT 1 = op-ORDER with the criteria PAIRS SWAPPED (SUMIFS takes them in any order) and
     ribbon fills — the ☆ must still latch. ALT 2 = the skippability control: four hand-written
     SUMIFS, no fill anywhere, which is also the §1.0(c) proof that core grades values. */
  { key: 'rollup', name: 'op-ORDER — feet first, criteria pairs SWAPPED, ribbon fills throughout', moves: `C => { const o=C._o; return [
      {sel:o.c0L+o.totR, keys:[...T('=SUM('+o.c0L+o.r0+':'+o.c0L+o.r1+')'),{key:'Enter'}]},
      {sel:o.feet, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:o.rowC+o.totR+':'+o.cNL+o.totR, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:o.g0, keys:[...T('=SUMIFS($'+o.amtC+'$'+o.l0+':$'+o.amtC+'$'+o.lN+',$'+o.regC+'$'+o.l0+':$'+o.regC+'$'+o.lN+','+o.c0L+'$'+o.hr+',$'+o.segC+'$'+o.l0+':$'+o.segC+'$'+o.lN+',$'+o.rowC+o.r0+')'),{key:'Enter'}]},
      {sel:o.gridRow0, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('r')]},
      {sel:o.grid, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
      {sel:o.colHdr, keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:o.rowHdr, keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:'A1', keys:[{key:'s',ctrl:true}]},
    ]; }` },
  { key: 'rollup', name: 'FREEDOM proof — four hand-written SUMIFS, no anchors, no fill anywhere (☆ forfeited, all five cores clear)', moves: `C => { const o=C._o, mv=[];
      const R=[o.r0,o.r1], CC=[o.c0L,o.cNL];
      for(let i=0;i<2;i++) for(let j=0;j<2;j++){
        mv.push({sel:CC[j]+R[i], keys:[...T('=SUMIFS('+o.amtC+o.l0+':'+o.amtC+o.lN+','+o.segC+o.l0+':'+o.segC+o.lN+','+o.rowC+R[i]+','+o.regC+o.l0+':'+o.regC+o.lN+','+CC[j]+o.hr+')'),{key:'Enter'}]}); }
      mv.push({sel:o.c0L+o.totR, keys:[...T('=SUM('+o.c0L+o.r0+':'+o.c0L+o.r1+')'),{key:'Enter'}]});
      mv.push({sel:o.cNL+o.totR, keys:[...T('=SUM('+o.cNL+o.r0+':'+o.cNL+o.r1+')'),{key:'Enter'}]});
      mv.push({sel:o.colHdr, keys:[{key:'b',ctrl:true}]});
      mv.push({sel:o.rowHdr, keys:[{key:'b',ctrl:true}]});
      mv.push({sel:o.rowC+o.totR+':'+o.cNL+o.totR, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]});
      mv.push({sel:'A1', keys:[{key:'s',ctrl:true}]});
      return mv; }` },
  { key: 'hunt', name: 'totals footed FIRST, ctrl+g route, crimes fixed in reverse', moves: `C => { const o=C._o;
      const steps=[
        {sel:'B8', keys:[...T('=SUM(B3:B7)'),{key:'Enter'}]},
        {sel:'B8:D8', keys:[{key:'r',ctrl:true}]},
        {sel:'B8:D8', keys:[{key:'b',ctrl:true}]},
        {sel:'A1', keys:[{key:'g',ctrl:true},L('s'),L('o')]},
      ];
      o.sites.slice().reverse().forEach(s=>steps.push({sel:s.k, keys:[...T(s.f),{key:'Enter'}]}));
      return steps; }` },
  /* r429 (DEPTH_PASS §4.13 wave 4): both center entries rebuilt — the pre-rework pair solved a
     board with no border beat and an o.tot range that no longer exists. ALT 1 = chord-ROUTE +
     SUPERSET ☆ proof (a sweep wider than the figure block still latches, then the headers are
     re-centred over the top); ALT 2 = op-ORDER reversed + the §1.0(c) FREEDOM proof (body and
     total aligned in two passes — every core clears, the class-sweep ☆ is forfeited). */
  { key: 'center', name: 'chord-ROUTE — legacy Alt O E A dialog for the title, ribbon bold, and a SUPERSET class sweep (headers re-centred after) that must still latch the ☆', moves: `C => { const o=C._o; return [
      {sel:'B1:'+o.lc+o.rt, keys:[{key:'Alt'},L('h'),L('a'),L('r')]},
      {sel:o.hdr, keys:[{key:'Alt'},L('h'),L('a'),L('c')]},
      {sel:o.lab, keys:[{key:'Alt'},L('h'),L('a'),L('l')]},
      {sel:'A'+o.rt+':'+o.lc+o.rt, keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:'A'+o.hr+':'+o.lc+o.hr, keys:[{key:'Alt'},L('h'),L('b'),L('o')]},
      {sel:'A1:'+o.lc+'1', keys:[{key:'Alt'},L('o'),L('e'),L('a')]},
      {sel:'A1', keys:[{key:'s',ctrl:true}]},
    ]; }` },
  { key: 'center', name: 'op-ORDER reversed + FREEDOM proof — title/border/bold first, figures and total aligned in TWO passes (☆ forfeited, all six cores clear)', moves: `C => { const o=C._o; return [
      {sel:'A1:'+o.lc+'1', keys:[{key:'1',ctrl:true},L('A')]},
      {sel:'A'+o.hr+':'+o.lc+o.hr, keys:[{key:'Alt'},L('h'),L('b'),L('o')]},
      {sel:'A'+o.rt+':'+o.lc+o.rt, keys:[{key:'b',ctrl:true}]},
      {sel:o.lab, keys:[{key:'Alt'},L('h'),L('a'),L('l')]},
      {sel:'B'+o.r1+':'+o.lc+(o.rt-1), keys:[{key:'Alt'},L('h'),L('a'),L('r')]},
      {sel:'B'+o.rt+':'+o.lc+o.rt, keys:[{key:'Alt'},L('h'),L('a'),L('r')]},
      {sel:o.hdr, keys:[{key:'Alt'},L('h'),L('a'),L('c')]},
      {sel:'A1', keys:[{key:'s',ctrl:true}]},
    ]; }` },
  /* r429 (DEPTH_PASS §4.25 wave 5): both growth entries rebuilt — the pre-rework entry hardcoded
     rows 2-7 (the board now jitters) and predated the one-decimal requirement, the top rule and
     the ☆. ALT 1 = op-ORDER + an ALGEBRAIC YoY variant ((this-last)/last), proving core grades the
     VALUE not the formula shape. ALT 2 = the skippability control: the CAGR endpoints TYPED. */
  { key: 'growth', name: 'op-ORDER — dress first, CAGR before YoY, algebraic YoY variant ((this−last)/last) and ribbon percent', moves: `C => { const o=C._o; return [
      {sel:'B'+o.tot, keys:[...T('=B'+o.s1+'+B'+o.s2),{key:'Enter'}]},
      {sel:'B'+o.tot+':F'+o.tot, keys:[{key:'r',ctrl:true}]},
      {sel:'A'+o.tot+':F'+o.tot, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:'B'+o.cagr, keys:[...T('=(F'+o.tot+'/B'+o.tot+')^(1/4)-1'),{key:'Enter'}]},
      {sel:'B'+o.cagr, keys:[{key:'Alt'},L('h'),L('p'),{key:'Alt'},L('h'),D(0)]},
      {sel:'C'+o.yoy, keys:[...T('=(C'+o.tot+'-B'+o.tot+')/B'+o.tot),{key:'Enter'}]},
      {sel:'C'+o.yoy+':F'+o.yoy, keys:[{key:'r',ctrl:true}]},
      {sel:'C'+o.yoy+':F'+o.yoy, keys:[{key:'Alt'},L('h'),L('p'),{key:'Alt'},L('h'),D(0)]},
      {sel:'A1', keys:[{key:'s',ctrl:true}]},
    ]; }` },
  { key: 'growth', name: 'FREEDOM proof — consolidated totals and the CAGR endpoints TYPED as raw figures (☆ forfeited, all five cores clear)', moves: `C => { const o=C._o, T4=C._tot, mv=[];
      const COL=['B','C','D','E','F'];
      for(let i=0;i<5;i++) mv.push({sel:COL[i]+o.tot, keys:[...T(String(T4[i])),{key:'Enter'}]});
      mv.push({sel:'C'+o.yoy, keys:[...T('=C'+o.tot+'/B'+o.tot+'-1'),{key:'Enter'}]});
      mv.push({sel:'C'+o.yoy+':F'+o.yoy, keys:[{key:'r',ctrl:true}]});
      mv.push({sel:'C'+o.yoy+':F'+o.yoy, keys:[{key:'%',ctrl:true,shift:true},{key:'Alt'},L('h'),D(0)]});
      mv.push({sel:'B'+o.cagr, keys:[...T('=('+T4[4]+'/'+T4[0]+')^(1/4)-1'),{key:'Enter'}]});
      mv.push({sel:'B'+o.cagr, keys:[{key:'%',ctrl:true,shift:true},{key:'Alt'},L('h'),D(0)]});
      mv.push({sel:'A'+o.tot+':F'+o.tot, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]});
      mv.push({sel:'A1', keys:[{key:'s',ctrl:true}]});
      return mv; }` },
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
  /* r429 (DEPTH_PASS §4.21 wave 5): both margin entries rebuilt — the pre-rework entry used
     s.e/s.v (one shared EBITDA÷revenue ask) and a fixed 3-row block; the drill now permutes THREE
     different asks across the tables with 3-4 rows each. ALT 1 = op-ORDER reversed + ribbon fill
     (the ☆ latch is chord-agnostic, so the ribbon fill must earn it too). ALT 2 = the §1.0(c)
     FREEDOM proof — every formula TYPED, no fill anywhere, ☆ forfeited, all four cores clear. */
  { key: 'margin', name: 'op-ORDER reversed + ribbon fill down (Alt H F I D) and the ctrl+1 dialog for both registers — the ☆ must latch off a non-ctrl+d fill', moves: `C => C._sites.slice().reverse().flatMap(s => [
      {sel:s.m+s.r0, keys:[...T('='+s.f),{key:'Enter'}]},
      {sel:s.m+s.r0+':'+s.m+(s.r0+s.n-1), keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
      {sel:s.m+s.r0+':'+s.m+(s.r0+s.n-1), keys: s.fmt==='percent' ? [{key:'1',ctrl:true},L('P')] : [{key:'1',ctrl:true},L('X')]},
      {sel:s.m+(s.r0-1), keys:[{key:'Alt'},L('h'),D(1)]},
    ]).concat([{sel:'A1', keys:[{key:'s',ctrl:true}]}]) ` },
  { key: 'margin', name: 'FREEDOM proof — every formula TYPED row by row, no fill anywhere (☆ forfeited, all four cores clear)', moves: `C => { const mv=[];
      C._sites.forEach(s=>{ for(let j=0;j<s.n;j++){ const r=s.r0+j;
        const f = s.ask==='growth' ? (s.b+r+'/'+s.a+r+'-1') : (s.ask==='margin' ? (s.b+r+'/'+s.a+r) : (s.a+r+'/'+s.b+r));
        mv.push({sel:s.m+r, keys:[...T('='+f),{key:'Enter'}]}); }
        mv.push({sel:s.m+s.r0+':'+s.m+(s.r0+s.n-1), keys: s.fmt==='percent' ? [{key:'%',ctrl:true,shift:true},{key:'Alt'},L('h'),D(0)] : [{key:'1',ctrl:true},L('X')]});
        mv.push({sel:s.m+(s.r0-1), keys:[{key:'b',ctrl:true}]}); });
      mv.push({sel:'A1', keys:[{key:'s',ctrl:true}]});
      return mv; }` },
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
  /* r429 (DEPTH_PASS §4.28 wave 5): both sumif entries rebuilt — the pre-rework entry hardcoded a
     fixed 3-segment summary at D2:F4 with a 9-row ledger (all of it now varies) and predated the
     tie-out ☆. ALT 1 = op-ORDER + ribbon fills. ALT 2 = the skippability control: the check cell
     left EMPTY, plus the §1.0(c) proof that SEPARATE un-anchored SUMIFs clear the rollup beat. */
  { key: 'sumif', name: 'op-ORDER — dress first, foot and share before the rollup exists, ribbon fills throughout', moves: `C => { const o=C._o; return [
      {sel:o.segC+o.tot+':'+o.sumC+o.tot, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('p')]},
      {sel:o.sumC+o.tot, keys:[...T('=SUM('+o.sumC+o.s0+':'+o.sumC+o.sN+')'),{key:'Enter'}]},
      {sel:o.pctC+o.s0, keys:[...T('='+o.sumC+o.s0+'/$'+o.sumC+'$'+o.tot),{key:'Enter'}]},
      {sel:o.pctC+o.s0+':'+o.pctC+o.sN, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
      {sel:o.pctC+o.s0+':'+o.pctC+o.sN, keys:[{key:'Alt'},L('h'),L('p'),{key:'Alt'},L('h'),D(0)]},
      {sel:o.sumC+o.s0, keys:[...T('=SUMIF($'+o.ledC+'$'+o.l0+':$'+o.ledC+'$'+o.lN+','+o.segC+o.s0+',$'+o.amtC+'$'+o.l0+':$'+o.amtC+'$'+o.lN+')'),{key:'Enter'}]},
      {sel:o.sumC+o.s0+':'+o.sumC+o.sN, keys:[{key:'Alt'},L('h'),L('f'),L('i'),L('d')]},
      {sel:o.chk, keys:[...T('='+o.sumC+o.tot+'-SUM('+o.amtC+o.l0+':'+o.amtC+o.lN+')'),{key:'Enter'}]},
      {sel:'A1', keys:[{key:'s',ctrl:true}]},
    ]; }` },
  { key: 'sumif', name: 'FREEDOM proof — a SEPARATE un-anchored SUMIF per segment, check cell left EMPTY (☆ forfeited, all four cores clear)', moves: `C => { const o=C._o, mv=[];
      for(let i=0;i<o.nSeg;i++){ const r=o.s0+i;
        mv.push({sel:o.sumC+r, keys:[...T('=SUMIF('+o.ledC+o.l0+':'+o.ledC+o.lN+','+o.segC+r+','+o.amtC+o.l0+':'+o.amtC+o.lN+')'),{key:'Enter'}]}); }
      mv.push({sel:o.sumC+o.tot, keys:[{key:'=',alt:true},{key:'Enter'}]});
      for(let i=0;i<o.nSeg;i++){ const r=o.s0+i;
        mv.push({sel:o.pctC+r, keys:[...T('='+o.sumC+r+'/'+o.sumC+o.tot),{key:'Enter'}]}); }
      mv.push({sel:o.pctC+o.s0+':'+o.pctC+o.sN, keys:[{key:'%',ctrl:true,shift:true},{key:'Alt'},L('h'),D(0)]});
      mv.push({sel:o.segC+o.tot+':'+o.sumC+o.tot, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]});
      mv.push({sel:'A1', keys:[{key:'s',ctrl:true}]});
      return mv; }` },
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
  /* r429 (DEPTH_PASS §4.17 wave 4): both combo entries rebuilt for the reworked drill (a blue
     input beat came in as core, and the ☆ moved to the current-region family). ALT 1 = op-ORDER
     reversed + the §1.0(c) FREEDOM proof — every range hand-selected, so all six cores clear and
     the chord-graded ☆ is forfeited. ALT 2 = chord-ROUTE — the region grab drives a Ctrl+Shift+!
     comma pass instead of Alt H K, proving the ☆ latch is not tied to one format chord. */
  { key: 'combo', name: 'op-ORDER reversed + FREEDOM proof — wrap and commas first, ribbon bold, every range hand-selected (☆ forfeited, all six cores clear)', moves: `C => { const o=C._o; return [
      {sel:o.notes, keys:[{key:'Alt'},L('h'),L('w')]},
      {sel:o.num,   keys:[{key:'!',ctrl:true,shift:true},{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
      {sel:o.num,   keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
      {sel:o.mh,    keys:[{key:'Alt'},L('h'),L('a'),L('r')]},
      {sel:o.hdr,   keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:o.title, keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:o.num,   keys:[{key:'Alt'},L('h'),L('o'),L('i')]},
      {sel:'A1',    keys:[{key:'s',ctrl:true}]},
    ]; }` },
  { key: 'combo', name: 'chord-ROUTE — the Ctrl+A region drives a ctrl+shift+! comma pass (not Alt H K), proving the ☆ latch is chord-agnostic about the FORMAT op', moves: `C => { const o=C._o; return [
      {sel:o.title, keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:o.hdr,   keys:[{key:'Alt'},L('h'),D(1)]},
      {sel:o.mh,    keys:[{key:'Alt'},L('h'),L('a'),L('r')]},
      {sel:'B'+o.r1, keys:[{key:'a',ctrl:true},{key:'!',ctrl:true,shift:true},{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
      {sel:o.num,   keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
      {sel:o.notes, keys:[{key:'Alt'},L('h'),L('w')]},
      {sel:o.num,   keys:[{key:'Alt'},L('h'),L('o'),L('i')]},
      {sel:'A1',    keys:[{key:'s',ctrl:true}]},
    ]; }` },
  /* r429 (DEPTH_PASS §4.20 wave 4): both gauntlet entries rebuilt — the pre-rework entry
     hardcoded a 4-line block (nL is now 4-5), graded the retired accounting beat, and predated the
     finish-at-A1 + save closer. ALT 1 = op-ORDER + the §1.0(c) FREEDOM proof, dressing BOTH sides
     by hand (all six cores clear, the clone ☆ forfeited — and since this is the c2 CAPSTONE, that
     doubles as the §2.2 proof that a bonus never gates a chapter). ALT 2 = the REVERSE clone
     direction (Uses dressed first, formats pasted onto Sources), proving the ☆ is not a one-way
     route trap. */
  { key: 'gauntlet', name: 'op-ORDER — uses side FIRST, typed SUMs (no alt+=), ribbon bold, ctrl+shift+! commas, BOTH sides dressed by hand (☆ forfeited, all six cores clear)', moves: `C => { const R=C._R, r0=R.r0, nL=R.nL, tr=R.tr;
      const BLUE=[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}];
      return [
        {sel:R.useIn,  keys:BLUE},
        {sel:R.srcIn,  keys:BLUE},
        {sel:R.useTot, keys:[...T('=SUM(E'+(r0+1)+':E'+(r0+nL)+')'),{key:'Enter'}]},
        {sel:R.srcTot, keys:[...T('=SUM(B'+(r0+1)+':B'+(r0+nL)+')'),{key:'Enter'}]},
        {sel:R.useTot, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('p')]},
        {sel:R.srcTot, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('p')]},
        {sel:R.useCol, keys:[{key:'!',ctrl:true,shift:true},{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
        {sel:R.srcCol, keys:[{key:'!',ctrl:true,shift:true},{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
        {sel:R.useCol, keys:[{key:'Alt'},L('h'),L('o'),L('i')]},
        {sel:R.srcCol, keys:[{key:'Alt'},L('h'),L('o'),L('i')]},
        {sel:'A1',     keys:[{key:'Home',ctrl:true}]},
        {sel:'A1',     keys:[{key:'s',ctrl:true}]},
      ]; }` },
  { key: 'gauntlet', name: 'REVERSE clone — Uses dressed first, formats pasted onto SOURCES (the ☆ must latch in either direction)', moves: `C => { const R=C._R, r0=R.r0, nL=R.nL;
      return [
        {sel:R.useIn,  keys:[{key:'Alt'},L('h'),L('f'),L('c'),{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'ArrowRight'},{key:'Enter'}]},
        {sel:R.useTot, keys:[{key:'Alt'},{key:'='},{key:'Enter'}]},
        {sel:R.srcTot, keys:[{key:'Alt'},{key:'='},{key:'Enter'}]},
        {sel:R.useTot, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]},
        {sel:R.useCol, keys:[{key:'Alt'},L('h'),L('k'),{key:'Alt'},L('h'),D(9),{key:'Alt'},L('h'),D(9)]},
        {sel:R.useCol, keys:[{key:'c',ctrl:true}]},
        {sel:R.srcCol, keys:[{key:'Alt'},{key:'e'},{key:'s'},{key:'t'},{key:'Enter'}]},
        {sel:R.useCol, keys:[{key:'Alt'},L('h'),L('o'),L('i')]},
        {sel:R.srcCol, keys:[{key:'Alt'},L('h'),L('o'),L('i')]},
        {sel:'A1',     keys:[{key:'Home',ctrl:true}]},
        {sel:'A1',     keys:[{key:'s',ctrl:true}]},
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
  /* r429 (DEPTH_PASS §4.12 wave 4): decimals rebuilt to the audience-A ops scorecard.
     ALT 1 = op-ORDER + the §1.0(c) FREEDOM proof (money columns walked cell by cell — every core
     clears, the column-select ☆ is forfeited). ALT 2 = chord-ROUTE (Ctrl+Space whole-column
     selections + ribbon bold — the ☆ latch is rect-based, so it must fire on this route too). */
  { key: 'decimals', name: 'op-ORDER reversed + FREEDOM proof — read line dressed FIRST, margins/turns by body pass, money columns walked CELL BY CELL (☆ forfeited, all cores clear)', moves: `C => { const o=C._o; const mv=[];
      mv.push({sel:'A'+o.medRow+':'+colLetter(o.lastC)+o.medRow, keys:[{key:'b',ctrl:true},{key:'Alt'},L('h'),L('b'),L('p')]});
      mv.push({sel:o.mgnR,  keys:[{key:'Alt'},L('h'),L('9'),{key:'Alt'},L('h'),L('9')]});
      mv.push({sel:o.turnR, keys:[{key:'Alt'},L('h'),L('0')]});
      const fix=[]; for(let k=0;k<o.defPresses;k++) fix.push({key:'Alt'},L('h'),L('9'));
      mv.push({sel:o.defCell, keys:fix});
      for(const col of ['B','C']){ for(let i=0;i<o.n;i++){ mv.push({sel:col+(o.hr+1+i), keys:[{key:'Alt'},L('h'),L('9'),{key:'Alt'},L('h'),L('9')]}); }
        mv.push({sel:col+o.medRow, keys:[{key:'Alt'},L('h'),L('9'),{key:'Alt'},L('h'),L('9')]}); }
      mv.push({sel:'A1', keys:[{key:'s',ctrl:true}]});
      return mv; }` },
  { key: 'decimals', name: 'chord-ROUTE — Ctrl+Space whole-column selections + ribbon bold (Alt H 1); the rect-based ☆ must still latch', moves: `C => { const o=C._o; const mv=[];
      mv.push({sel:'B'+(o.hr+1)+':C'+(o.hr+1), keys:[{key:' ',ctrl:true},{key:'Alt'},L('h'),L('9'),{key:'Alt'},L('h'),L('9')]});
      mv.push({sel:'D'+(o.hr+1), keys:[{key:' ',ctrl:true},{key:'Alt'},L('h'),L('0')]});
      mv.push({sel:'E'+(o.hr+1), keys:[{key:' ',ctrl:true},{key:'Alt'},L('h'),L('9'),{key:'Alt'},L('h'),L('9')]});
      const fix=[]; for(let k=0;k<o.defPresses;k++) fix.push({key:'Alt'},L('h'),L('9'));
      mv.push({sel:o.defCell, keys:fix});
      mv.push({sel:'A'+o.medRow+':'+colLetter(o.lastC)+o.medRow, keys:[{key:'Alt'},L('h'),D(1),{key:'Alt'},L('h'),L('b'),L('p')]});
      mv.push({sel:'A1', keys:[{key:'s',ctrl:true}]});
      return mv; }` },
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
  /* r429 (DEPTH_PASS §4.26 wave 5): both cagr entries rebuilt — the pre-rework entry predated the
     promoted percent beat (the format is core now, one decimal) and the clone ☆. */
  { key: 'cagr', name: 'op-ORDER — blocks in reverse, ribbon percent + ribbon bold, winner flagged last', moves: `C => {
      const w=C._sites.reduce((a,s)=>s.exp>a.exp?s:a,C._sites[0]);
      const steps=C._sites.slice().reverse().flatMap(s=>[
        {sel:s.col+s.ans, keys:[...T('=('+s.col+(s.r0+1)+'/'+s.col+s.r0+')^(1/'+s.col+(s.r0+2)+')-1'),{key:'Enter'}]},
        {sel:s.col+s.ans, keys:[{key:'Alt'},L('h'),L('p'),{key:'Alt'},L('h'),D(0)]},
      ]);
      steps.push({sel:w.col+w.ans, keys:[{key:'Alt'},L('h'),D(1)]});
      steps.push({sel:'A1', keys:[{key:'s',ctrl:true}]});
      return steps; }` },
  { key: 'cagr', name: 'FREEDOM proof — all three rates TYPED, never pasted (☆ forfeited, all five cores clear)', moves: `C => {
      const w=C._sites.reduce((a,s)=>s.exp>a.exp?s:a,C._sites[0]);
      const steps=C._sites.flatMap(s=>[
        {sel:s.col+s.ans, keys:[...T('=('+s.col+(s.r0+1)+'/'+s.col+s.r0+')^(1/'+s.col+(s.r0+2)+')-1'),{key:'Enter'}]},
        {sel:s.col+s.ans, keys:[{key:'%',ctrl:true,shift:true},{key:'Alt'},L('h'),D(0)]},
      ]);
      steps.push({sel:w.col+w.ans, keys:[{key:'b',ctrl:true}]});
      steps.push({sel:'A1', keys:[{key:'s',ctrl:true}]});
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
    let wins = 0, starRuns = 0, bonusRuns = 0; const notes = [];
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
          /* r429: report the ☆ state too. An alt whose NAME says "☆ forfeited" is a drill's
             NEGATIVE CONTROL for §1.0-R2(i) skippability — it must clear every core beat with the
             bonus still dark. Enforcing it here means each reworked drill gets its skippability
             proof from the alt it already ships, instead of a bespoke probe file per drill. */
          const rows = C.checks(S);
          const bonus = rows.find(x => x.bonus);
          const star = !!(bonus && bonus.ok);
          if (done) return { won: true, keys: keyLog.length, star, hasBonus: !!bonus };
          const failing = rows.filter(x => !x.ok).map(x => x.label);
          return { won: false, failing, star, hasBonus: !!bonus };
        } catch (e) { return { won: false, failing: ['THREW: ' + String(e).slice(0, 100)] }; }
      }, { key: alt.key, movesSrc: alt.moves });
      if (r.won) wins++;
      else notes.push((r.failing || []).join(' | ').slice(0, 160));
      if (r.star) starRuns++;
      if (r.hasBonus) bonusRuns++;
    }
    let ok = wins === REPS;
    /* the ☆-forfeit contract (see above): name says forfeited => the ☆ must be dark in EVERY rep */
    const claimsForfeit = /☆\s*forfeit|forfeit(ed)?\s*(the\s*)?☆|no ☆/i.test(alt.name);
    let starNote = '';
    if (claimsForfeit && bonusRuns && starRuns > 0) {
      ok = false;
      starNote = '\n       ☆ CONTRACT BROKEN: this alt claims the ☆ is forfeited but EARNED it in '
        + starRuns + '/' + REPS + ' reps — either the alt is not actually the slow route, or the ☆ latch is too loose';
    }
    if (!ok) fails++;
    console.log((ok ? 'PASS ' : 'FAIL ') + alt.key.padEnd(10) + ' · ' + alt.name
      + (wins === REPS ? '' : '\n       stuck on: ' + notes[0]) + starNote);
  }
  console.log('\nALT PATHS: ' + (fails ? fails + ' FAILURE(S) of ' + ran : 'ALL ' + ran + ' PASS'));
  if (errs.length) { console.log('PAGE ERRORS: ' + errs.slice(0, 3).join(' · ')); fails++; }
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
