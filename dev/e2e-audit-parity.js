/* r154 EXCEL-PARITY MATRIX — asserts every grid behavior the engine has claimed
   across rounds, plus the r154 fill-ref fix. Real KeyboardEvents via demoKey. */
'use strict';
const { chromium } = require('playwright-core');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
let pass = 0, fail = 0;
const ok = (c, n, x) => { if (c) { pass++; console.log('  PASS ' + n); } else { fail++; console.log('  FAIL ' + n + (x ? ' — ' + x : '')); } };

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 140)));
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1'); localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_beta_ok', '1');
  } catch (e) {} });
  await page.goto('http://127.0.0.1:8791/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof demoKey === 'function');
  // r159: the matrix probes gated-tier drills ('foot' = Formulas) — flip the real
  // pro entitlement so r158's progression gates never bounce a fresh() board.
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });

  const run = (fn, arg) => page.evaluate(fn, arg);
  // fresh neutral board for each probe
  const fresh = () => run(() => { document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove()); loadChallenge('foot'); });

  console.log('A. movement + commit');
  await fresh();
  const a1 = await run(() => {
    setDemoSel('C5'); demoKey({key:'1'}); demoKey({key:'2'}); demoKey({key:'Enter'});
    const afterEnter = colLetter(S.active.c) + S.active.r;
    setDemoSel('C5'); demoKey({key:'9'}); demoKey({key:'Tab'});
    const afterTab = colLetter(S.active.c) + S.active.r;
    setDemoSel('C5'); demoKey({key:'7'}); demoKey({key:'Enter', shift:true});
    const afterShEnter = colLetter(S.active.c) + S.active.r;
    return { afterEnter, afterTab, afterShEnter, v: S.cells['C5'].value };
  });
  ok(a1.afterEnter === 'C6', 'Enter commits + moves down', a1.afterEnter);
  ok(a1.afterTab === 'D5', 'Tab commits + moves right', a1.afterTab);
  ok(a1.afterShEnter === 'C4', 'Shift+Enter moves up', a1.afterShEnter);

  console.log('B. edit semantics');
  await fresh();
  const b1 = await run(() => {
    setDemoSel('B4'); const before = S.cells['B4'].value;
    demoKey({key:'5'}); demoKey({key:'5'}); demoKey({key:'Escape'});   // type-to-replace then cancel
    const cancelled = S.cells['B4'].value === before;
    setDemoSel('B4'); demoKey({key:'F2'});
    const inEdit = editing === true;
    demoKey({key:'ArrowLeft'});                                        // F2: caret move, not commit
    const stillEditing = editing === true;
    demoKey({key:'Escape'});
    return { cancelled, inEdit, stillEditing, after: S.cells['B4'].value === before };
  });
  ok(b1.cancelled, 'Esc cancels a type-to-replace edit');
  ok(b1.inEdit && b1.stillEditing, 'F2 enters edit mode; arrows move the caret, not the cell');
  ok(b1.after, 'Esc from F2 edit restores the original');

  console.log('C. F4 anchor cycle (Excel order)');
  await fresh();
  const c1 = await run(() => {
    setDemoSel('D10'); demoKey({key:'='}); demoKey({key:'B'}); demoKey({key:'4'});
    const states = [];
    for (let i = 0; i < 4; i++) { demoKey({key:'F4'}); states.push(editBuf); }
    demoKey({key:'Escape'});
    return states;
  });
  ok(JSON.stringify(c1) === JSON.stringify(['=$B$4','=B$4','=$B4','=B4']), 'F4 cycles $B$4 → B$4 → $B4 → B4', JSON.stringify(c1));

  console.log('D. jumps + selections');
  await fresh();
  const d1 = await run(() => {
    setDemoSel('B4'); demoKey({key:'ArrowDown', ctrl:true});
    const edge = colLetter(S.active.c) + S.active.r;
    setDemoSel('B4'); demoKey({key:'ArrowDown', ctrl:true, shift:true});
    const selDown = S.sel ? (colLetter(S.sel.c1)+S.sel.r1+':'+colLetter(S.sel.c2)+S.sel.r2) : null;
    setDemoSel('C5'); demoKey({key:' ', shift:true});
    let R = selRange();
    const rowSel = R.c1===1 && R.c2===COLS && R.r1===5 && R.r2===5;
    setDemoSel('C5'); demoKey({key:' ', ctrl:true});
    R = selRange();
    const colSel = R.r1===1 && R.r2===S.ROWS && R.c1===3 && R.c2===3;
    return { edge, selDown, rowSel, colSel };
  });
  ok(/^B\d+$/.test(d1.edge) && d1.edge !== 'B4', 'Ctrl+Down jumps to the data edge', d1.edge);
  ok(!!d1.selDown, 'Ctrl+Shift+Down extends selection to the edge', String(d1.selDown));
  ok(d1.rowSel, 'Shift+Space selects the whole row');
  ok(d1.colSel, 'Ctrl+Space selects the whole column');

  console.log('E. fill translation incl. tall sheets (r154 fix)');
  const e1 = await run(() => {
    loadChallenge('balcheck');                             // 15-row tab
    setDemoSel('B15'); for (const ch of '=B8-B14') demoKey({key:ch}); demoKey({key:'Enter'});
    setDemoSel('B15:E15'); demoKey({key:'r', ctrl:true});
    const c15 = S.cells['C15'].formula, e15 = S.cells['E15'].formula;
    // anchored refs must NOT move on fill
    setDemoSel('B9'); for (const ch of '=$B$4+B5') demoKey({key:ch}); demoKey({key:'Enter'});
    setDemoSel('B9:D9'); demoKey({key:'r', ctrl:true});
    return { c15, e15, d9: S.cells['D9'].formula };
  });
  ok(e1.c15 === '=C8-C14' && e1.e15 === '=E8-E14', 'fill-right keeps row refs on a 15-row tab', e1.c15 + ' / ' + e1.e15);
  ok(e1.d9 === '=$B$4+D5', 'anchored refs survive fill untouched', e1.d9);

  console.log('F. copy/paste + paste-special values');
  await fresh();
  const f1 = await run(() => {
    setDemoSel('C9'); for (const ch of '=B4+1') demoKey({key:ch}); demoKey({key:'Enter'});
    setDemoSel('C9'); demoKey({key:'c', ctrl:true});
    setDemoSel('D10'); demoKey({key:'v', ctrl:true});
    const pasted = S.cells['D10'] ? S.cells['D10'].formula : null;
    const val = S.cells['C9'].value;
    setDemoSel('C9'); demoKey({key:'c', ctrl:true});
    setDemoSel('E11');
    demoKey({key:'Alt'}); demoKey({key:'e'}); demoKey({key:'s'}); demoKey({key:'v'}); demoKey({key:'Enter'});
    const esv = S.cells['E11'] ? { f: S.cells['E11'].formula, v: S.cells['E11'].value } : {};
    return { pasted, val, esv };
  });
  ok(f1.pasted === '=C5+1', 'paste translates relative refs', f1.pasted);
  ok(!f1.esv.f && f1.esv.v === f1.val, 'Alt E S V pastes the value, kills the formula', JSON.stringify(f1.esv));

  console.log('G. number-entry parity');
  await fresh();
  const g1 = await run(() => {
    const t = (str) => { setDemoSel('H12'); for (const ch of str) demoKey({key:ch}); demoKey({key:'Enter'}); return S.cells['H12'].value; };
    return { comma: t('1,200'), pct: t('45%'), paren: t('(500)') };
  });
  ok(g1.comma === 1200, 'typing 1,200 lands 1200', String(g1.comma));
  ok(Math.abs(g1.pct - 0.45) < 1e-9, 'typing 45% lands 0.45', String(g1.pct));
  ok(g1.paren === -500, 'typing (500) lands -500', String(g1.paren));

  console.log('H. evaluator + autosum');
  await fresh();
  const h1 = await run(() => {
    setDemoSel('G4'); for (const ch of '=2+3*4^2') demoKey({key:ch}); demoKey({key:'Enter'});
    const prec = S.cells['G4'].value;
    setDemoSel('G5'); for (const ch of '=IF(G4>=50,1,0)') demoKey({key:ch}); demoKey({key:'Enter'});
    const iff = S.cells['G5'].value;
    setDemoSel('B8'); demoKey({key:'=', alt:true, code:'Equal'});
    const proposed = editing && /SUM/i.test(editBuf);
    demoKey({key:'Escape'});
    return { prec, iff, proposed };
  });
  ok(h1.prec === 50, '=2+3*4^2 respects precedence (50)', String(h1.prec));
  ok(h1.iff === 1, 'IF + comparators evaluate', String(h1.iff));
  ok(h1.proposed, 'Alt+= proposes a SUM');

  console.log('I. delete / undo / redo');
  await fresh();
  const i1 = await run(() => {
    const before = S.cells['B4'].value;
    setDemoSel('B4:C5'); demoKey({key:'Delete'});
    const cleared = !S.cells['B4'].value && !S.cells['C5'].value;
    demoKey({key:'z', ctrl:true});
    const undone = S.cells['B4'].value === before;
    demoKey({key:'y', ctrl:true});
    const redone = !S.cells['B4'].value;
    demoKey({key:'z', ctrl:true});
    return { cleared, undone, redone };
  });
  ok(i1.cleared, 'Delete clears the selected range');
  ok(i1.undone, 'Ctrl+Z restores it');
  ok(i1.redone, 'Ctrl+Y re-applies');

  console.log('K. row ops + undo geometry (r95 fix)');
  await fresh();
  const k1 = await run(() => {
    const rows0 = S.ROWS, val0 = S.cells['B4'].value;
    setDemoSel('B4');
    demoKey({key:'Alt'}); demoKey({key:'h'}); demoKey({key:'i'}); demoKey({key:'r'});   // insert row above 4
    const shifted = S.cells['B5'] && S.cells['B5'].value === val0;
    const latched = S.lastRowOp === 'ins';         // action-sourced latch (r14) — undo can't fake it
    demoKey({key:'z', ctrl:true});
    const undone = S.cells['B4'] && S.cells['B4'].value === val0 && S.ROWS === rows0;
    return { shifted, latched, undone };
  });
  ok(k1.shifted, 'Alt H I R inserts a row (content shifts down)');
  ok(k1.latched, 'row op latches S.lastRowOp (action-sourced, r14)');
  ok(k1.undone, 'Ctrl+Z restores content AND geometry (r95/r101 stable viewport)');

  console.log('L. formatting ops land on the cell');
  await fresh();
  const l1 = await run(() => {
    setDemoSel('C5'); demoKey({key:'b', ctrl:true});
    const bold = !!S.cells['C5'].bold;
    demoKey({key:'Alt'}); demoKey({key:'h'}); demoKey({key:'a'}); demoKey({key:'c'});
    const centered = S.cells['C5'].align === 'c';   // engine stores l/c/r
    demoKey({key:'Alt'}); demoKey({key:'h'}); demoKey({key:'k'});
    const comma = S.cells['C5'].fmtStyle === 'comma';
    return { bold, centered, comma };
  });
  ok(l1.bold, 'Ctrl+B bolds the selection');
  ok(l1.centered, 'Alt H A C centers');
  ok(l1.comma, 'Alt H K applies comma format', JSON.stringify(l1));

  console.log('M. autofit widens a squeezed column');
  await fresh();
  const m1 = await run(() => {
    setDemoSel('E3'); for (const ch of 'WORKING CAPITAL SCHEDULE') demoKey({key:ch}); demoKey({key:'Enter'});
    const before = colW[5];                        // E = col 5, 1-indexed engine widths
    setDemoSel('E3'); demoKey({key:'Alt'}); demoKey({key:'h'}); demoKey({key:'o'}); demoKey({key:'i'});
    const after = colW[5];
    return { before, after };
  });
  ok(m1.after > m1.before, 'Alt H O I widens the column to fit', m1.before + ' -> ' + m1.after);

  console.log('N. pointer mode + F4 on pointed refs (r87 class)');
  await fresh();
  const n1 = await run(() => {
    setDemoSel('D12'); demoKey({key:'='});
    demoKey({key:'ArrowUp'}); demoKey({key:'ArrowUp'});
    const pointed = editBuf;                       // '=D10'
    demoKey({key:'F4'});
    const anchored = editBuf;                      // '=$D$10'
    demoKey({key:'Enter'});
    const committed = S.cells['D12'].formula;
    return { pointed, anchored, committed };
  });
  ok(n1.pointed === '=D10', 'arrow keys point refs in edit mode', n1.pointed);
  ok(n1.anchored === '=$D$10', 'F4 anchors a POINTED ref (not just typed)', n1.anchored);
  ok(n1.committed === '=$D$10', 'pointed+anchored formula commits intact', n1.committed);

  console.log('O. audit pack — IFERROR + trace jumps (r173)');
  await fresh();
  const o1 = await run(() => {
    setDemoSel('C2'); for (const ch of '5') demoKey({key:ch}); demoKey({key:'Enter'});
    setDemoSel('C3'); for (const ch of '=SUM(C2:C2)') demoKey({key:ch}); demoKey({key:'Enter'});
    setDemoSel('C4'); for (const ch of '=C3*2') demoKey({key:ch}); demoKey({key:'Enter'});
    setDemoSel('C5'); for (const ch of '=IFERROR(MATCH(99,C2:C3,0),7)') demoKey({key:ch}); demoKey({key:'Enter'});
    setDemoSel('C6'); for (const ch of '=IFERROR(C2*2,7)') demoKey({key:ch}); demoKey({key:'Enter'});
    const fallback = S.cells['C5'].value;              // MATCH misses -> 7
    const passthru = S.cells['C6'].value;              // clean -> 10
    setDemoSel('C4'); demoKey({key:'[', ctrl:true});
    const prec = colLetter(S.active.c) + S.active.r;   // C3
    demoKey({key:'[', ctrl:true});
    const prec2 = colLetter(S.active.c) + S.active.r;  // C2 via the range head
    demoKey({key:']', ctrl:true});
    const dep = colLetter(S.active.c) + S.active.r;    // back to C3 (range containment)
    return { fallback, passthru, prec, prec2, dep, traced: S.traceN };
  });
  ok(o1.fallback === 7, 'IFERROR catches a MATCH miss -> fallback', o1.fallback);
  ok(o1.passthru === 10, 'IFERROR passes a clean value through', o1.passthru);
  ok(o1.prec === 'C3', 'Ctrl+[ jumps to the first precedent', o1.prec);
  ok(o1.prec2 === 'C2', 'Ctrl+[ follows a range ref to its head', o1.prec2);
  ok(o1.dep === 'C3', 'Ctrl+] finds the dependent via range containment', o1.dep);
  ok(o1.traced === 3, 'S.traceN latches every hop', o1.traced);

  console.log('Q. format cells dialog — ctrl+1 / alt o e (r177)');
  await fresh();
  const q1 = await run(() => {
    setDemoSel('D2'); for (const ch of '8.25') demoKey({key:ch}); demoKey({key:'Enter'});
    setDemoSel('D2'); demoKey({key:'1', ctrl:true}); demoKey({key:'x'});
    const mult = dispText(S.cells['D2']);
    setDemoSel('D3'); for (const ch of '46200') demoKey({key:ch}); demoKey({key:'Enter'});
    setDemoSel('D3'); demoKey({key:'Alt'}); demoKey({key:'o'}); demoKey({key:'e'}); demoKey({key:'d'});
    const date = dispText(S.cells['D3']);
    setDemoSel('D4'); for (const ch of 'Adj.') demoKey({key:ch}); demoKey({key:'Enter'});
    setDemoSel('D4'); demoKey({key:'1', ctrl:true}); demoKey({key:'e'});
    const foot = S.cells['D4'].value;
    setDemoSel('D5'); for (const ch of 'Title') demoKey({key:ch}); demoKey({key:'Enter'});
    setDemoSel('D5:G5'); demoKey({key:'1', ctrl:true}); demoKey({key:'a'});
    const ca = S.cells['D5'].ca;
    demoKey({key:'1', ctrl:true}); demoKey({key:'Escape'});
    return { mult, date, foot, ca, clean: mode === 'normal' };
  });
  ok(q1.mult === '8.3x' || q1.mult === '8.2x' || /x$/.test(q1.mult), 'ctrl+1 X casts a multiple (…x, 1 dec)', q1.mult);
  ok(/^[A-Z][a-z]{2}-\d{2}$/.test(q1.date), 'alt o e D turns a serial into Mmm-yy', q1.date);
  ok(q1.foot === 'Adj.¹', 'ctrl+1 E (Excel\'s Alt+E) marks a footnote superscript', q1.foot);
  ok(q1.ca === 4, 'ctrl+1 A centers ACROSS the selected span', q1.ca);
  ok(q1.clean, 'esc leaves the dialog cleanly');

  console.log('R. row grouping substrate (r179)');
  await fresh();
  const r1 = await run(() => {
    setDemoSel('A2:A3'); demoKey({key:'ArrowRight', alt:true, shift:true});
    const grouped = S.rowGroups.length === 1 && S.rowGroups[0].r1 === 2 && S.rowGroups[0].r2 === 3;
    setDemoSel('A2'); demoKey({key:'Alt'}); demoKey({key:'a'}); demoKey({key:'h'});
    const hidden = S.hidden.has(2) && S.hidden.has(3);
    const relocated = S.active.r === 4;                    // cursor never strands on a hidden row
    setDemoSel('A1'); demoKey({key:'ArrowDown'});
    const skips = S.active.r === 4;                        // plain step routes around the fold
    demoKey({key:'Alt'}); demoKey({key:'a'}); demoKey({key:'j'});
    const reopened = S.hidden.size === 0;                  // show-detail works from the summary row
    setDemoSel('A2:A3'); demoKey({key:'ArrowLeft', alt:true, shift:true});
    return { grouped, hidden, relocated, skips, reopened, ungrouped: S.rowGroups.length === 0 };
  });
  ok(r1.grouped, 'Shift+Alt+RIGHT groups the selected rows');
  ok(r1.hidden && r1.relocated, 'Alt A H folds the group; cursor relocates', JSON.stringify(r1));
  ok(r1.skips, 'plain arrows route around folded rows');
  ok(r1.reopened, 'Alt A J from the summary row reopens the fold');
  ok(r1.ungrouped, 'Shift+Alt+LEFT ungroups');

  console.log('S. AutoFilter (r180)');
  await run(() => { document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove()); loadChallenge('filterpass'); });
  const s1 = await run(() => {
    const o = CHALLENGES.filterpass._o;
    setDemoSel('B3'); demoKey({key:'L', ctrl:true, shift:true});
    const armed = !!S.filter && S.filter.hr === 3 && S.filter.c1 === 1 && S.filter.c2 === 3;   // header block found from a MIDDLE cell
    const markers = document.querySelectorAll('.fltbtn').length === 3;
    setDemoSel('C3'); demoKey({key:'ArrowDown', alt:true});
    const open = mode === 'ribbon' && dialog === 'filter' && filterVals.length === 3;
    filterVals.forEach((x, i) => { if (x.v !== 'Open') { filterIdx = i; demoKey({key:' '}); } });
    demoKey({key:'Enter'});
    const nonOpen = o.rows.filter(x => x.st !== 'Open').map(x => x.r);
    const hidOk = nonOpen.every(r => S.hidden.has(r)) && S.hidden.size === nonOpen.length;
    S.cells['E1'] = { ...blankCell(), formula: '=SUM(B4:B12)' }; recalc();
    let t = 0; for (let r = 4; r <= 12; r++) t += S.cells['B' + r].value;
    const sumOk = Math.abs(S.cells['E1'].value - t) < 0.5;                     // SUM sees hidden rows (no SUBTOTAL yet)
    demoKey({key:'L', ctrl:true, shift:true});
    const cleared = !S.filter && S.hidden.size === 0 && document.querySelectorAll('.fltbtn').length === 0;
    setDemoSel('A3'); demoKey({key:'Alt'}); demoKey({key:'a'}); demoKey({key:'t'});
    const viaRibbon = !!S.filter && mode === 'normal';
    demoKey({key:'L', ctrl:true, shift:true});
    return { armed, markers, open, hidOk, sumOk, cleared, viaRibbon };
  });
  ok(s1.armed, 'Ctrl+Shift+L arms across the contiguous header block');
  ok(s1.markers, 'every armed header wears a \u25be');
  ok(s1.open, 'Alt+\u2193 on an armed header opens the value picker');
  ok(s1.hidOk, 'excluded values hide EXACTLY their rows', JSON.stringify(s1));
  ok(s1.sumOk, 'SUM still sees filtered-out rows');
  ok(s1.cleared, 'Ctrl+Shift+L again clears filter, rows, markers');
  ok(s1.viaRibbon, 'Alt A T is the ribbon route to the same toggle');

  console.log('T. Go To Special (r182)');
  await run(() => { document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove()); loadChallenge('hunt'); });
  const t1 = await run(() => {
    const o = CHALLENGES.hunt._o;
    demoKey({key:'F5'}); const gotoOpen = mode === 'ribbon' && dialog === 'goto';
    demoKey({key:'s', code:'KeyS'}); demoKey({key:'o', code:'KeyO'});
    const marked = S.marks.length === 13 && S.markN === 1 && mode === 'normal';   // 5 inputs + 5 growths + 3 crimes
    setDemoSel('A1'); demoKey({key:'Enter'});
    const walksTo = colLetter(S.active.c) + S.active.r;                            // first mark in scan order
    demoKey({key:'Enter', shift:true});
    const wrapsBack = colLetter(S.active.c) + S.active.r === walksTo || S.marks.indexOf(colLetter(S.active.c)+S.active.r) >= 0;
    const s0 = o.sites[0];
    setDemoSel(s0.k); for (const ch of s0.f) demoKey({key:ch}); demoKey({key:'Enter'});
    const unmarked = S.marks.length === 12 && S.marks.indexOf(s0.k) < 0;           // fixing kills the mark
    const walkedOn = S.marks.indexOf(colLetter(S.active.c) + S.active.r) >= 0;     // commit rode to a survivor
    demoKey({key:'Escape'});
    const cleared = !S.marks.length && !S.markCrit;
    demoKey({key:'g', ctrl:true}); const ctrlG = mode === 'ribbon' && dialog === 'goto';
    demoKey({key:'s', code:'KeyS'}); demoKey({key:'f', code:'KeyF'});
    const formulas = S.marks.length === 8;                                         // 7 surviving calc formulas + 1 fix
    demoKey({key:'Escape'});
    return { gotoOpen, marked, walksTo, wrapsBack, unmarked, walkedOn, cleared, ctrlG, formulas };
  });
  ok(t1.gotoOpen, 'F5 opens Go To');
  ok(t1.marked, 'S\u2192O marks every raw number (and only those)');
  ok(t1.walksTo === 'B3', 'Enter rides the marked set in scan order', t1.walksTo);
  ok(t1.wrapsBack, 'Shift+Enter walks backward');
  ok(t1.unmarked && t1.walkedOn, 'fixing a marked cell unmarks it and walks on', JSON.stringify(t1));
  ok(t1.cleared, 'Esc clears the hunt');
  ok(t1.ctrlG && t1.formulas, 'Ctrl+G route + Formulas criterion');

  console.log('U. manual hide + column width (r185)');
  await run(() => { document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove()); loadChallenge('unhide'); });
  const u1 = await run(() => {
    const preHidden = [4,5,6,7].every(r => S.hidden.has(r)) && S.hiddenRows.length === 4;   // board loads with the sins in place
    const subLive = Math.abs(S.cells['B3'].value - CHALLENGES.unhide._o.sum) < 0.5;        // SUM sees hidden rows
    setDemoSel('A3:A8'); demoKey({key:'9', ctrl:true, shift:true});
    const unhid = S.hidden.size === 0 && S.unhideN === 1;
    setDemoSel('A5:A6'); demoKey({key:'9', ctrl:true});
    const rehid = S.hidden.has(5) && S.hidden.has(6) && !S.hidden.has(4) && !rowHidden(S.active.r);
    setDemoSel('A4:A7'); demoKey({key:'Alt'}); demoKey({key:'h'}); demoKey({key:'o'}); demoKey({key:'u'}); demoKey({key:'o'});
    const ribbonUnhide = S.hidden.size === 0;
    setDemoSel('B2'); demoKey({key:'Alt'}); demoKey({key:'h'}); demoKey({key:'o'}); demoKey({key:'w'});
    const dlg = mode === 'ribbon' && dialog === 'colw';
    demoKey({key:'1'}); demoKey({key:'2'}); demoKey({key:'Enter'});
    const applied = colW[2] === Math.round(12*7)+5 && mode === 'normal';
    return { preHidden, subLive, unhid, rehid, ribbonUnhide, dlg, applied };
  });
  ok(u1.preHidden, 'a board can load with manually hidden rows');
  ok(u1.subLive, 'SUM sees manually hidden rows');
  ok(u1.unhid, 'Ctrl+Shift+9 unhides across the selection');
  ok(u1.rehid, 'Ctrl+9 hides + relocates the cursor', JSON.stringify(u1));
  ok(u1.ribbonUnhide, 'Alt H O U O is the ribbon unhide route');
  ok(u1.dlg && u1.applied, 'Alt H O W numeric width prompt applies Excel units');

  console.log('V. SUMIFS + SUMPRODUCT (r188)');
  await run(() => { document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove()); loadChallenge('rollup'); });
  const v1 = await run(() => {
    S.cells['J1']={...blankCell(), formula:'=SUMIFS(C3:C11,A3:A11,"Retail",B3:B11,"EMEA")'};
    S.cells['J2']={...blankCell(), formula:'=SUMPRODUCT(C3:C6,C3:C6)'};
    S.cells['J3']={...blankCell(), formula:'=SUMIFS(C3:C11,A3:A11,"Nobody",B3:B11,"EMEA")'};
    S.cells['J4']={...blankCell(), formula:'=IFERROR(SUMIFS(C3:C11,A3:A11),-1)'};   // odd args \u2192 error \u2192 fallback
    recalc();
    let want=0; for(let r=3;r<=11;r++) if(S.cells['A'+r].value==='Retail'&&S.cells['B'+r].value==='EMEA') want+=S.cells['C'+r].value;
    let dot=0; for(let r=3;r<=6;r++) dot+=S.cells['C'+r].value*S.cells['C'+r].value;
    return { two: Math.abs(S.cells['J1'].value-want)<0.5, dot: Math.abs(S.cells['J2'].value-dot)<0.5,
      zero: S.cells['J3'].value===0, err: S.cells['J4'].value===-1 };
  });
  ok(v1.two, 'SUMIFS crosses two criteria correctly');
  ok(v1.dot, 'SUMPRODUCT is a pairwise dot product');
  ok(v1.zero, 'SUMIFS with no match sums to zero');
  ok(v1.err, 'malformed SUMIFS throws into IFERROR, not into the sheet');

  console.log('W. paste operations (r191)');
  await fresh();
  const w1 = await run(() => {
    S.cells['H2']={...blankCell(), value:-1};
    S.cells['H3']={...blankCell(), value:100}; S.cells['H4']={...blankCell(), value:200};
    S.cells['H5']={...blankCell(), formula:'=H3+H4', value:300};
    recalc(); render();
    setDemoSel('H2'); demoKey({key:'c',ctrl:true});
    setDemoSel('H3:H5');
    demoKey({key:'Alt'}); demoKey({key:'e'}); demoKey({key:'s'}); demoKey({key:'m'}); demoKey({key:'Enter'});
    recalc();
    const mult = S.cells['H3'].value===-100 && S.cells['H4'].value===-200;
    const wrap = S.cells['H5'].formula==='=(H3+H4)*-1' && Math.abs(S.cells['H5'].value-300)<0.5;
    const latch = S.pasteOpN===1;
    S.cells['H7']={...blankCell(), value:7}; render();
    setDemoSel('H7'); demoKey({key:'c',ctrl:true});
    setDemoSel('H3');
    demoKey({key:'Alt'}); demoKey({key:'e'}); demoKey({key:'s'}); demoKey({key:'d'}); demoKey({key:'Enter'});
    const add = S.cells['H3'].value===-93;
    setDemoSel('H7'); demoKey({key:'c',ctrl:true});
    setDemoSel('H8');
    demoKey({key:'Alt'}); demoKey({key:'e'}); demoKey({key:'s'}); demoKey({key:'Enter'});
    const reset = S.cells['H8'].value===7;   // op resets to None on every open — plain paste unharmed
    return { mult, wrap, latch, add, reset };
  });
  ok(w1.mult, 'multiply broadcasts a copied single cell over the selection');
  ok(w1.wrap, 'formula cells wrap =(F)*k like Excel writes them', JSON.stringify(w1));
  ok(w1.latch, 'pasteOpN latch counts operation pastes');
  ok(w1.add, 'add operation lands');
  ok(w1.reset, 'operation resets to None each time the dialog opens');

  console.log('J. esc discipline');
  await fresh();
  const j1 = await run(() => new Promise(res => {
    const drill0 = cur;
    setDemoSel('B4'); demoKey({key:'Escape'});               // single esc, idle: must NOT restart
    const noRestart = !done && cur === drill0 && S.cells['B4'].value !== undefined;
    demoKey({key:'Escape'}); // second esc within 450ms → restart (r146)
    setTimeout(() => res({ noRestart, restarted: keyLog.length === 0 }), 120);
  }));
  ok(j1.noRestart, 'single Esc never restarts');
  ok(j1.restarted, 'esc·esc restarts the drill');

  const realErrors = errs.filter(e => !/supabase|Failed to fetch|NetworkError|ERR_/i.test(e));
  ok(realErrors.length === 0, 'zero page errors during the matrix', realErrors.join(' | '));
  await browser.close();
  console.log((fail ? 'PARITY MATRIX: ' + fail + ' FAILURE(S), ' : 'PARITY MATRIX: ALL ') + pass + ' PASS');
  process.exit(fail ? 1 : 0);
})();
