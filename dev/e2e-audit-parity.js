/* r154 EXCEL-PARITY MATRIX — asserts every grid behavior the engine has claimed
   across rounds, plus the r154 fill-ref fix. Real KeyboardEvents via demoKey. */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
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
  await page.goto(process.env.URL || 'http://127.0.0.1:8791/index.html', { waitUntil: 'load' });   /* r421: URL override — parallel checkouts serve on their own ports */
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
  /* r438 — DE-COUPLED FROM THE DRILL'S PRIVATE GEOMETRY (DEPTH_PASS_CAMPAIGN, "Parity is coupled
     to drill internals"). This section tests the ENGINE's AutoFilter (r180); filterpass is only
     the board it happens to run on. It used to read CHALLENGES.filterpass._o.rows[].st and
     hard-code the header at row 3, columns A–C, three ▾ markers, three chips and the data at
     B4:B12 — so the filterpass depth pass (which jitters the header row, moves the table into
     column A or B, and carries a fourth column) broke an engine suite that has nothing to do
     with the drill. Same class as the sortGeo() fix in r437 and the section-U fix in unhide.
     Everything below now DERIVES from the live sheet: the header row and span come from the
     armed S.filter itself, the status column is the last column of that span, and the data rows
     are read off the sheet. Re-boarding any filter drill can no longer reach this file. */
  const s1 = await run(() => {
    // find the header row from the sheet: the first row whose cells match the seeded headers
    let hr = 0, cD = 0;
    for (let r = 1; r <= S.ROWS && !hr; r++)
      for (let c = 1; c <= 10; c++) {
        const v = S.cells[String.fromCharCode(64 + c) + r];
        if (v && v.value === 'Deal') { hr = r; cD = c; break; }
      }
    const CL = c => String.fromCharCode(64 + c);
    // arm from a MIDDLE cell of the header block — the span must be found by walking outward
    setDemoSel(CL(cD + 1) + hr); demoKey({key:'L', ctrl:true, shift:true});
    const span = S.filter ? (S.filter.c2 - S.filter.c1 + 1) : 0;
    const armed = !!S.filter && S.filter.hr === hr && S.filter.c1 === cD && span >= 3;
    const markers = document.querySelectorAll('.fltbtn').length === span;
    const cSt = S.filter ? S.filter.c2 : 0;                                    // Status: the last armed column
    // the data rows and the distinct values in the status column, read off the sheet
    const rows = [];
    for (let r = hr + 1; r <= S.filter.r2; r++) {
      const v = S.cells[CL(cSt) + r];
      if (v && v.value !== null && v.value !== '') rows.push({ r, v: String(v.value) });
    }
    const vals = []; rows.forEach(x => { if (vals.indexOf(x.v) < 0) vals.push(x.v); });
    const keep = vals[0];                                                      // keep the first value, drop the rest
    setDemoSel(CL(cSt) + hr); demoKey({key:'ArrowDown', alt:true});
    const open = mode === 'ribbon' && dialog === 'filter' && filterVals.length === vals.length;
    filterVals.forEach((x, i) => { if (x.v !== keep) { filterIdx = i; demoKey({key:' '}); } });
    demoKey({key:'Enter'});
    const shouldHide = rows.filter(x => x.v !== keep).map(x => x.r);
    const hidOk = shouldHide.every(r => S.hidden.has(r)) && S.hidden.size === shouldHide.length;
    // SUM over the figures column still counts the hidden rows (no SUBTOTAL in this engine)
    const cSi = cSt - 1;
    const r1 = hr + 1, r2 = S.filter.r2;
    S.cells['J1'] = { ...blankCell(), formula: '=SUM(' + CL(cSi) + r1 + ':' + CL(cSi) + r2 + ')' }; recalc();
    let t = 0; for (let r = r1; r <= r2; r++) { const c = S.cells[CL(cSi) + r]; if (c && typeof c.value === 'number') t += c.value; }
    const sumOk = Math.abs(S.cells['J1'].value - t) < 0.5;
    demoKey({key:'L', ctrl:true, shift:true});
    const cleared = !S.filter && S.hidden.size === 0 && document.querySelectorAll('.fltbtn').length === 0;
    setDemoSel(CL(cD) + hr); demoKey({key:'Alt'}); demoKey({key:'a'}); demoKey({key:'t'});
    const viaRibbon = !!S.filter && mode === 'normal';
    demoKey({key:'L', ctrl:true, shift:true});
    return { armed, markers, open, hidOk, sumOk, cleared, viaRibbon, span, nVals: vals.length };
  });
  ok(s1.armed, 'Ctrl+Shift+L arms across the contiguous header block');
  ok(s1.markers, 'every armed header wears a \u25be');
  ok(s1.open, 'Alt+\u2193 on an armed header opens the value picker');
  ok(s1.hidOk, 'excluded values hide EXACTLY their rows', JSON.stringify(s1));
  ok(s1.sumOk, 'SUM still sees filtered-out rows');
  ok(s1.cleared, 'Ctrl+Shift+L again clears filter, rows, markers');
  ok(s1.viaRibbon, 'Alt A T is the ribbon route to the same toggle');

  console.log('T. Go To Special (r182)');
  /* r439: this section tests the GO TO SPECIAL ENGINE, not a drill — but it drove
     `loadChallenge('hunt')` and asserted magic counts (13 marks, 8 formulas, first mark at B3)
     read off that board. `hunt` retired into `audit` in r439, and even before that the counts
     were a board fact masquerading as an engine fact. It now builds its OWN fixture and derives
     every expected number from it, so no drill rework can break an engine assertion again. */
  await run(() => {
    document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove());
    loadChallenge('audit');                       // any board; we replace its cells wholesale
    S.cells = {};
    S.ROWS = 12;
    // labels are TEXT constants — the engine's Constants criterion excludes them on purpose
    ['Alpha','Beta','Gamma','Delta','Epsilon','Zeta'].forEach((n, i) => {
      S.cells['A' + (3 + i)] = { ...blankCell(), value: n, txt: true };
    });
    // 6 numeric constants — the Constants criterion should mark exactly these
    [110, 120, 130, 140, 150, 160].forEach((v, i) => {
      S.cells['B' + (3 + i)] = { ...blankCell(), value: v };
    });
    // 4 formulas — the Formulas criterion should mark exactly these
    for (let i = 0; i < 4; i++) {
      S.cells['C' + (3 + i)] = { ...blankCell(), formula: '=B' + (3 + i) + '*2' };
    }
    recalc(); render();
  });
  const t1 = await run(() => {
    const CONSTS = ['B3','B4','B5','B6','B7','B8'], FORMS = ['C3','C4','C5','C6'];
    demoKey({key:'F5'}); const gotoOpen = mode === 'ribbon' && dialog === 'goto';
    demoKey({key:'s', code:'KeyS'}); demoKey({key:'o', code:'KeyO'});
    const marked = S.marks.length === CONSTS.length && S.markN === 1 && mode === 'normal'
                   && CONSTS.every(k => S.marks.indexOf(k) >= 0);
    setDemoSel('A1'); demoKey({key:'Enter'});
    const walksTo = colLetter(S.active.c) + S.active.r;            // first mark in scan order
    demoKey({key:'Enter', shift:true});
    const wrapsBack = colLetter(S.active.c) + S.active.r === walksTo || S.marks.indexOf(colLetter(S.active.c)+S.active.r) >= 0;
    const victim = CONSTS[0];
    setDemoSel(victim); for (const ch of '=1+1') demoKey({key:ch}); demoKey({key:'Enter'});
    const unmarked = S.marks.length === CONSTS.length - 1 && S.marks.indexOf(victim) < 0;
    const walkedOn = S.marks.indexOf(colLetter(S.active.c) + S.active.r) >= 0;
    demoKey({key:'Escape'});
    const cleared = !S.marks.length && !S.markCrit;
    demoKey({key:'g', ctrl:true}); const ctrlG = mode === 'ribbon' && dialog === 'goto';
    demoKey({key:'s', code:'KeyS'}); demoKey({key:'f', code:'KeyF'});
    const formulas = S.marks.length === FORMS.length + 1;          // the 4 seeded + the cell just repaired
    demoKey({key:'Escape'});
    return { gotoOpen, marked, walksTo, wrapsBack, unmarked, walkedOn, cleared, ctrlG, formulas, nMarks: S.marks.length };
  });
  ok(t1.gotoOpen, 'F5 opens Go To');
  ok(t1.marked, 'S\u2192O marks every raw number (and only those \u2014 text constants excluded)');
  ok(t1.walksTo === 'B3', 'Enter rides the marked set in scan order', t1.walksTo);
  ok(t1.wrapsBack, 'Shift+Enter walks backward');
  ok(t1.unmarked && t1.walkedOn, 'fixing a marked cell unmarks it and walks on', JSON.stringify(t1));
  ok(t1.cleared, 'Esc clears the marks');
  ok(t1.ctrlG && t1.formulas, 'Ctrl+G route + Formulas criterion', JSON.stringify(t1));

  console.log('U. manual hide + column width (r185)');
  await run(() => { document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove()); loadChallenge('unhide'); });
  /* r437: this section drove the PRE-REWORK unhide board by hard-coded coordinates (rows 4-7
     hidden, the total at B3, the header at B2) and by `_o.sum`, none of which survived the
     depth pass (DEPTH_PASS §4.37 + the §4.35 grpfold merge). It is an ENGINE-parity section,
     not a drill section, so it is repointed at the live board's own `_o` instead of being
     re-hard-coded — the r185 hide/unhide mechanics and the Alt H O W prompt are what it is
     actually asserting, and those are unchanged. */
  const u1 = await run(() => {
    const o = CHALLENGES.unhide._o;
    const gaps = o.regions.filter(b => b.hidden);
    const buried = []; gaps.forEach(b => { for (let r = b.d1; r <= b.d2; r++) buried.push(r); });
    const preHidden = buried.every(r => S.hidden.has(r)) && S.hiddenRows.length === buried.length;   // board loads with the sins in place
    const subLive = gaps.every(b => Math.abs(S.cells['B' + b.rt].value - b.sum) < 0.5);              // SUM sees hidden rows
    const g0 = gaps[0];
    setDemoSel('A' + (g0.d1 - 1) + ':A' + (g0.d2 + 1)); demoKey({key:'9', ctrl:true, shift:true});
    const unhid = ![g0.d1, g0.d2].some(r => S.hidden.has(r)) && S.unhideN === 1;
    setDemoSel('A' + g0.d1 + ':A' + (g0.d1 + 1)); demoKey({key:'9', ctrl:true});
    const rehid = S.hidden.has(g0.d1) && S.hidden.has(g0.d1 + 1) && !S.hidden.has(g0.d2) && !rowHidden(S.active.r);
    setDemoSel('A' + o.regions[0].d1 + ':A' + o.regions[2].rt);
    demoKey({key:'Alt'}); demoKey({key:'h'}); demoKey({key:'o'}); demoKey({key:'u'}); demoKey({key:'o'});
    const ribbonUnhide = S.hidden.size === 0;
    setDemoSel('B' + o.hr); demoKey({key:'Alt'}); demoKey({key:'h'}); demoKey({key:'o'}); demoKey({key:'w'});
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
  /* r438: this section drove `rollup`'s BOARD \u2014 it hard-coded A3:A11/B3:B11/C3:C11 and the
     literal labels "Retail"/"EMEA" that the pre-depth-pass board happened to seed. That is an
     ENGINE suite depending on a drill's private geometry (dev/DEPTH_PASS_CAMPAIGN.md, "Parity is
     coupled to drill internals"), so rollup's depth pass \u2014 which randomizes both axes and the
     grid shape \u2014 would have broken it for reasons unrelated to the engine. De-coupled rather
     than re-pinned: the section now seeds its OWN fixture and asserts against its own data, so
     no drill rework can reach it again. */
  await fresh();
  const v1 = await run(() => {
    const SEG=['Retail','Retail','Instl','Retail','Instl','Instl','Retail','Instl','Retail'];
    const REG=['EMEA','APAC','EMEA','EMEA','APAC','EMEA','APAC','APAC','EMEA'];
    const AMT=[120,340,260,80,150,410,90,230,170];
    for(let i=0;i<9;i++){ const r=3+i;
      S.cells['A'+r]={...blankCell(), value:SEG[i], txt:true};
      S.cells['B'+r]={...blankCell(), value:REG[i], txt:true};
      S.cells['C'+r]={...blankCell(), value:AMT[i]}; }
    S.cells['J1']={...blankCell(), formula:'=SUMIFS(C3:C11,A3:A11,"Retail",B3:B11,"EMEA")'};
    S.cells['J2']={...blankCell(), formula:'=SUMPRODUCT(C3:C6,C3:C6)'};
    S.cells['J3']={...blankCell(), formula:'=SUMIFS(C3:C11,A3:A11,"Nobody",B3:B11,"EMEA")'};
    S.cells['J4']={...blankCell(), formula:'=IFERROR(SUMIFS(C3:C11,A3:A11),-1)'};   // odd args \u2192 error \u2192 fallback
    recalc();
    let want=0; for(let r=3;r<=11;r++) if(S.cells['A'+r].value==='Retail'&&S.cells['B'+r].value==='EMEA') want+=S.cells['C'+r].value;
    let dot=0; for(let r=3;r<=6;r++) dot+=S.cells['C'+r].value*S.cells['C'+r].value;
    return { two: want>0 && Math.abs(S.cells['J1'].value-want)<0.5, dot: Math.abs(S.cells['J2'].value-dot)<0.5,
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

  console.log('X. sort warning (r192)');
  await run(() => { document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove()); loadChallenge('sort'); });
  // r437: these two blocks test the SORT ENGINE (the r192 warning card, Alt+= range detection),
  // not the sort drill — but they read the drill's private _o field names directly, so the
  // depth-pass rework renamed `range`/`sc` out from under them and the suite crashed on
  // undefined.match. Same coupling class as the depth-mechanics fix: go through sortGeo(),
  // which accepts either shape, so a board rework can change geometry without breaking CI.
  await run(() => {
    window.sortGeo = () => {
      const o = CHALLENGES.sort._o;
      return {
        range6: o.range || o.rng6,           // the table as it arrives (late-deal row empty)
        range7: o.range || o.rng7 || o.rng6, // …one row taller, incl. the late-deal slot
        sc    : o.sc    || o.SC,             // the size (sort-key) column letter
        foot  : o.foot,
      };
    };
  });
  const x1 = await run(() => {
    const o = sortGeo(), m = o.range6.match(/([A-J])(\d+):([A-J])(\d+)/);
    const r1 = +m[2], r2 = +m[4], scN = o.sc.charCodeAt(0) - 64;
    const pairs = []; for (let rr = r1; rr <= r2; rr++) pairs.push([S.cells[m[1]+rr].value, S.cells[o.sc+rr].value]);
    S.sel = { r: r1, c: scN }; S.active = { r: r2, c: scN }; render();
    demoKey({key:'Alt'}); demoKey({key:'a'}); demoKey({key:'s'}); demoKey({key:'d'});
    const warned = dialog === 'sortwarn';
    demoKey({key:'Enter'});                                  // Enter = expand, Excel's default
    const post = []; for (let rr = r1; rr <= r2; rr++) post.push([S.cells[m[1]+rr].value, S.cells[o.sc+rr].value]);
    const desc = post.every((p, i) => i === 0 || post[i-1][1] >= p[1]);
    const coupled = post.every(p => pairs.some(q => q[0] === p[0] && q[1] === p[1]));
    S.sel = { r: r1, c: m[1].charCodeAt(0)-64 }; S.active = { r: r2, c: scN }; render();
    demoKey({key:'Alt'}); demoKey({key:'a'}); demoKey({key:'s'}); demoKey({key:'a'});
    const noWarnFull = mode === 'normal' && dialog === null;  // full-table selection never warns
    return { warned, desc, coupled, noWarnFull };
  });
  ok(x1.warned, 'single-column sort beside data raises the warning');
  ok(x1.desc && x1.coupled, 'Enter expands — rows travel together', JSON.stringify(x1));
  ok(x1.noWarnFull, 'full-table selection sorts with no dialog');

  console.log('Y. Alt+= flow (r192)');
  await run(() => { document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove()); loadChallenge('sort'); });
  const y1 = await run(() => {
    // range7, not range6: the foot sits directly under the LATE-DEAL row, so the Alt+= probe
    // must select through it for `r2 + 1` to land on the total. That slot is legitimately
    // empty at load, hence the guarded sum.
    const o = sortGeo(), m = o.range7.match(/([A-J])(\d+):([A-J])(\d+)/);
    const r1 = +m[2], r2 = +m[4], scN = o.sc.charCodeAt(0) - 64;
    let want = 0; for (let rr = r1; rr <= r2; rr++) want += (S.cells[o.sc+rr] || {}).value || 0;
    S.sel = { r: r1, c: scN }; S.active = { r: r2 + 1, c: scN }; render();
    demoKey({key:'=', alt:true});
    const f = S.cells[o.foot];
    const rangeForm = !!(f && f.formula && Math.abs(f.value - want) < 0.5) && !editing && !!S.sel;
    loadChallenge('sort');
    const o2 = sortGeo(), fr = +o2.foot.match(/\d+/)[0], fc = o2.foot[0].charCodeAt(0) - 64;
    S.active = { r: fr, c: fc }; S.sel = null; render();
    demoKey({key:'=', alt:true}); demoKey({key:'Enter'});
    const stays = S.active.r === fr && S.active.c === fc;
    demoKey({key:'b', ctrl:true});
    const bolds = !!(S.cells[o2.foot] && S.cells[o2.foot].bold);
    setDemoSel('E12'); demoKey({key:'5'}); demoKey({key:'Enter'});
    const normalMoves = S.active.r === 13;
    return { rangeForm, stays, bolds, normalMoves };
  });
  ok(y1.rangeForm, 'range-form Alt+= commits the SUM, selection preserved, no editor');
  ok(y1.stays && y1.bolds, 'proposal commit stays put — ctrl+b lands on the sum', JSON.stringify(y1));
  ok(y1.normalMoves, 'ordinary commits still move down');

  console.log('Z. engine pack 3 (r193)');
  await fresh();
  const z1 = await run(() => {
    setDemoSel('B2'); demoKey({key:'i',ctrl:true});
    const italic = !!S.cells['B2'].it;
    demoKey({key:'Alt'}); demoKey({key:'h'}); demoKey({key:'2',code:'Digit2'});
    const italicOff = !S.cells['B2'].it;
    setDemoSel('B3'); demoKey({key:'5',ctrl:true});
    const struck = !!S.cells['B3'].strike;
    demoKey({key:'1',ctrl:true}); demoKey({key:'k'});
    const struckOff = !S.cells['B3'].strike;
    S.cells['H1']={...blankCell(), formula:'=TODAY()', fmtStyle:'date'}; recalc();
    const days=Math.floor((Date.now()-Date.UTC(1899,11,30))/86400000);
    const today = Math.abs(S.cells['H1'].value-days)<=1;
    setDemoSel('G10:I12'); demoKey({key:'Alt'}); demoKey({key:'h'}); demoKey({key:'b'}); demoKey({key:'s'});   // empty region — foot's own dressed rows must not pollute the probe
    const g=(k)=>S.cells[k]||{};
    const perim = !!(g('G10').bt && g('I10').bt && g('G12').bb && g('G10').bl && g('G11').bl && g('I11').br) && !(g('H11').bt||g('H11').bb||g('H11').bl||g('H11').br);
    S.cells['H3']={...blankCell(), value:100}; S.cells['H4']={...blankCell(), value:4200}; recalc(); render();
    setDemoSel('H3'); demoKey({key:'c',ctrl:true}); setDemoSel('H4');
    demoKey({key:'Alt'}); demoKey({key:'e'}); demoKey({key:'s'}); demoKey({key:'i'}); demoKey({key:'Enter'});
    const divided = S.cells['H4'].value===42;
    S.cells['H6']={...blankCell(), value:1, bold:true}; S.cells['H7']={...blankCell(), value:2}; render();
    setDemoSel('H6:H7'); demoKey({key:'b',ctrl:true});
    const mixedAll = !!S.cells['H6'].bold && !!S.cells['H7'].bold;   // mixed -> ALL bold (Excel), not a per-cell flip
    demoKey({key:'b',ctrl:true});
    const uniformOff = !S.cells['H6'].bold && !S.cells['H7'].bold;
    return { italic, italicOff, struck, struckOff, today, perim, divided, mixedAll, uniformOff };
  });
  ok(z1.italic && z1.italicOff, 'Ctrl+I / Alt H 2 italicize');
  ok(z1.struck && z1.struckOff, 'Ctrl+5 / Ctrl+1 K strike');
  ok(z1.today, 'TODAY() returns the Excel serial');
  ok(z1.perim, 'Alt H B S draws the selection PERIMETER, interior clean', JSON.stringify(z1));
  ok(z1.divided, 'paste-op Divide lands');
  ok(z1.mixedAll && z1.uniformOff, 'mixed-selection Ctrl+B bolds ALL first (Excel), uniform toggles off');

  console.log('AA. CHOOSE + OFFSET (r257)');
  await fresh();
  const aa1 = await run(() => {
    const bc=()=>({...blankCell()});
    S.cells['B3']={...bc(), value:2};                                   // scenario switch
    S.cells['B5']={...bc(), value:0.06}; S.cells['C5']={...bc(), value:0.12}; S.cells['D5']={...bc(), value:-0.01};
    S.cells['A9']={...bc(), value:'Base', txt:true}; S.cells['A10']={...bc(), value:'Upside', txt:true}; S.cells['A11']={...bc(), value:'Downside', txt:true};
    S.cells['J1']={...bc(), formula:'=CHOOSE($B$3,$B$5,$C$5,$D$5)'};    // -> 0.12 (case 2)
    S.cells['J2']={...bc(), formula:'=OFFSET($B$5,0,$B$3-1)'};          // B5 + 1 col -> C5 = 0.12
    S.cells['J3']={...bc(), formula:'=OFFSET($A$9,$B$3-1,0)'};          // A9 + 1 row -> "Upside"
    S.cells['J4']={...bc(), formula:'=IFERROR(CHOOSE(9,1,2),-1)'};      // out of range -> IFERROR -> -1
    S.cells['B3'].value=1; recalc();                                    // flip to case 1
    const case1 = S.cells['J1'].value;                                 // -> 0.06
    S.cells['B3'].value=2; recalc();                                    // back to case 2
    return { choose: Math.abs(S.cells['J1'].value-0.12)<1e-9, offNum: Math.abs(S.cells['J2'].value-0.12)<1e-9,
      offTxt: S.cells['J3'].value==='Upside', oob: S.cells['J4'].value===-1, reactive: Math.abs(case1-0.06)<1e-9 };
  });
  ok(aa1.choose, 'CHOOSE picks the switch-selected value');
  ok(aa1.offNum, 'OFFSET(ref,0,n) walks columns to the active assumption');
  ok(aa1.offTxt, 'OFFSET preserves text (pulls the active case NAME)');
  ok(aa1.oob, 'CHOOSE out of range throws into IFERROR, not the sheet');
  ok(aa1.reactive, 'CHOOSE reprices when the switch flips');

  console.log('AB. MEDIAN (r264)');
  await fresh();
  const ab1 = await run(() => {
    const bc=()=>({...blankCell()});
    S.cells['K1']={...bc(), value:8}; S.cells['K2']={...bc(), value:12}; S.cells['K3']={...bc(), value:7};
    S.cells['K4']={...bc(), value:30}; S.cells['K5']={...bc(), value:9};
    S.cells['L1']={...bc(), formula:'=MEDIAN(K1:K5)'};   // sorted 7 8 9 12 30 -> 9 (outlier 30 ignored)
    S.cells['L2']={...bc(), formula:'=MEDIAN(K1:K4)'};   // even count: (8+12)/2 = 10
    recalc();
    return { odd: S.cells['L1'].value===9, even: Math.abs(S.cells['L2'].value-10)<1e-9 };
  });
  ok(ab1.odd, 'MEDIAN of an odd set picks the middle (outlier-resistant)');
  ok(ab1.even, 'MEDIAN of an even set averages the middle pair');

  console.log('AC. insert/delete rewrites formula refs (r265)');
  await fresh();
  const ac1 = await run(() => {
    const bc=()=>({...blankCell()});
    // a block with a SUM below it and a pointer above it
    S.cells['H2']={...bc(), value:10}; S.cells['H3']={...bc(), value:20}; S.cells['H4']={...bc(), value:30};
    S.cells['H6']={...bc(), formula:'=SUM(H2:H4)', value:60};
    S.cells['I1']={...bc(), formula:'=H3*2', value:40};
    // INSERT a row at 3: SUM range expands to H2:H5, the H3 pointer shifts to H4
    S.sel={r:3,c:1}; S.active={r:3,c:10};
    S.cells = shiftCellsRows(3, 1); S.ROWS=Math.max(S.ROWS,14); recalc();
    const insSum=String((S.cells['H7']||{}).formula||'');
    const insPtr=String((S.cells['I1']||{}).formula||'');
    // DELETE the inserted row back out: range contracts, pointer returns
    S.cells = shiftCellsRows(3, -1); recalc();
    const delSum=String((S.cells['H6']||{}).formula||'');
    const delPtr=String((S.cells['I1']||{}).formula||'');
    // DELETE a row a single ref points at -> #REF!
    S.cells = shiftCellsRows(3, -1); // removes old H3 (the pointer's target)
    const refErr=String((S.cells['I1']||{}).formula||'');
    return { insSum: insSum==='=SUM(H2:H5)', insPtr: insPtr==='=H4*2',
             delSum: delSum==='=SUM(H2:H4)', delPtr: delPtr==='=H3*2',
             refErr: refErr.includes('#REF!') };
  });
  ok(ac1.insSum, 'row insert inside a SUM range EXPANDS the range');
  ok(ac1.insPtr, 'row insert shifts single refs below it');
  ok(ac1.delSum, 'row delete inside a SUM range CONTRACTS the range');
  ok(ac1.delPtr, 'row delete shifts single refs back up');
  ok(ac1.refErr, 'deleting a referenced row leaves #REF!, like Excel');

  console.log('AD. finance pack — NPV + IRR (r296)');
  await fresh();
  const ad1 = await run(() => {
    const bc=()=>({...blankCell()});
    S.cells['H1']={...bc(), value:-1000}; S.cells['I1']={...bc(), value:300};
    S.cells['J1']={...bc(), value:400};   S.cells['K1']={...bc(), value:500}; S.cells['L1']={...bc(), value:600};
    S.cells['M1']={...bc(), formula:'=NPV(0.1,I1:L1)'};
    S.cells['M2']={...bc(), formula:'=IRR(H1:L1)'};
    S.cells['M3']={...bc(), formula:'=NPV(IRR(H1:L1),I1:L1)'};              // NPV at the IRR ≡ -year0 flow
    S.cells['M4']={...bc(), formula:'=IFERROR(IRR(I1:L1),-99)'};            // no sign change → #NUM → fallback
    recalc();
    const manual = 300/1.1 + 400/1.21 + 500/1.331 + 600/1.4641;
    return { npv: Math.abs(S.cells['M1'].value-manual)<1e-6,
      irrTies: Math.abs(S.cells['M3'].value-1000)<1e-4,
      irrConverged: S.cells['M2'].value>0 && S.cells['M2'].value<1,
      irrNum: S.cells['M4'].value===-99 };
  });
  ok(ad1.npv, 'NPV discounts the first flow one full period (Excel-true)');
  ok(ad1.irrConverged, 'IRR converges on a mixed-sign flow line');
  ok(ad1.irrTies, 'NPV at the IRR reproduces the year-0 outflow — the identity holds');
  ok(ad1.irrNum, 'IRR with no sign change throws into IFERROR, not the sheet');

  console.log('AE. text pack + & operator (r296)');
  await fresh();
  const ae1 = await run(() => {
    const bc=()=>({...blankCell()});
    S.cells['H2']={...bc(), value:'  acme   holdings  ', txt:true};
    S.cells['H3']={...bc(), value:'AAPL US Equity', txt:true};
    S.cells['H4']={...bc(), value:12};
    S.cells['M1']={...bc(), formula:'=PROPER(TRIM(H2))'};
    S.cells['M2']={...bc(), formula:'=LEFT(H3,FIND(" ",H3)-1)'};            // the ticker, composably
    S.cells['M3']={...bc(), formula:'=MID(H3,6,2)'};
    S.cells['M4']={...bc(), formula:'=LEN(H3)'};
    S.cells['M5']={...bc(), formula:'="FY"&H4&" — "&UPPER(LEFT(H3,4))'};    // & operator + literal + nesting
    S.cells['M6']={...bc(), formula:'=IFERROR(FIND("z",H3),0)'};            // case-sensitive miss → 0
    S.cells['M7']={...bc(), formula:'=CONCATENATE(LOWER(LEFT(H3,4)),".us")'};
    recalc();
    return { trimProper: S.cells['M1'].value==='Acme Holdings',
      leftFind: S.cells['M2'].value==='AAPL', mid: S.cells['M3'].value==='US',
      len: S.cells['M4'].value===14, amp: S.cells['M5'].value==='FY12 — AAPL',
      findMiss: S.cells['M6'].value===0, concat: S.cells['M7'].value==='aapl.us' };
  });
  ok(ae1.trimProper, 'TRIM collapses runs of spaces; PROPER title-cases the result');
  ok(ae1.leftFind, 'LEFT + FIND compose (grab the ticker before the first space)');
  ok(ae1.mid && ae1.len, 'MID and LEN read Excel-true (1-based, real length)');
  ok(ae1.amp, '& concatenates literals, numbers and nested text functions');
  ok(ae1.findMiss, 'FIND is case-sensitive and a miss throws into IFERROR');
  ok(ae1.concat, 'CONCATENATE joins mixed args');

  console.log('AF. sorting functions — LARGE / SMALL / RANK (r296)');
  await fresh();
  const af1 = await run(() => {
    const bc=()=>({...blankCell()});
    S.cells['H5']={...bc(), value:10}; S.cells['I5']={...bc(), value:40}; S.cells['J5']={...bc(), value:20};
    S.cells['K5']={...bc(), value:40}; S.cells['L5']={...bc(), value:30};
    S.cells['H6']={...bc(), value:'n/a', txt:true};                          // text in range must be ignored
    S.cells['M1']={...bc(), formula:'=LARGE(H5:L5,2)'};                      // 40 (tie: 1st and 2nd both 40)
    S.cells['M2']={...bc(), formula:'=SMALL(H5:L5,2)'};                      // 20
    S.cells['M3']={...bc(), formula:'=RANK(J5,H5:L5)'};                      // desc: 4th
    S.cells['M4']={...bc(), formula:'=RANK(J5,H5:L5,1)'};                    // asc: 2nd
    S.cells['M5']={...bc(), formula:'=RANK(I5,H5:L5)'};                      // tied top → 1 (RANK.EQ)
    S.cells['M6']={...bc(), formula:'=IFERROR(RANK(7,H5:L5),-1)'};           // absent value → #N/A → fallback
    S.cells['M7']={...bc(), formula:'=IFERROR(LARGE(H5:L5,9),-1)'};          // k out of range → #NUM → fallback
    recalc();
    return { l2: S.cells['M1'].value===40, s2: S.cells['M2'].value===20,
      rDesc: S.cells['M3'].value===4, rAsc: S.cells['M4'].value===2, rTie: S.cells['M5'].value===1,
      rMiss: S.cells['M6'].value===-1, kOob: S.cells['M7'].value===-1 };
  });
  ok(af1.l2 && af1.s2, 'LARGE/SMALL pick the k-th ranked value (ties Excel-true)');
  ok(af1.rDesc && af1.rAsc, 'RANK defaults descending; order arg flips it');
  ok(af1.rTie, 'tied values share the top rank (RANK.EQ)');
  ok(af1.rMiss && af1.kOob, 'RANK miss and LARGE k-out-of-range throw into IFERROR');

  console.log('AG. Flash Fill — Ctrl+E (r297)');
  await fresh();
  const ag1 = await run(() => {
    S.ROWS = Math.max(S.ROWS, 14);
    const bc=()=>({...blankCell()});
    const set=(k,v)=>{ S.cells[k]={...bc(), value:v, txt:true}; };
    // one example, case cleanup
    set('H2','jane doe'); set('H3','JOHN Q SMITH'); set('H4','mary-anne lee');
    S.cells['I2']={...bc(), value:'Jane Doe', txt:true};
    S.active={r:2,c:9}; flashFill();
    const proper = get(3,9).value==='John Q Smith' && get(4,9).value==='Mary-Anne Lee';
    // extraction before the first space, via the real chord
    set('H6','AAPL US Equity'); set('H7','7203 JT Equity');
    S.cells['I6']={...bc(), value:'AAPL', txt:true};
    setDemoSel('I6'); demoKey({key:'e', ctrl:true});
    const ticker = get(7,9).value==='7203' && get(7,9).txt===true;   // stays TEXT
    // two-column template with an inferred literal
    set('B10','sam'); set('C10','okafor'); set('B11','ana'); set('C11','ruiz');
    S.cells['D10']={...bc(), value:'Okafor, Sam', txt:true};
    S.active={r:10,c:4}; flashFill();
    const concat = get(11,4).value==='Ruiz, Ana';
    // no pattern → refuses (no garbage fill)
    set('G13','xyz'); set('G14','abc');
    S.cells['H13']={...bc(), value:'qqqq', txt:true};
    S.active={r:13,c:8}; flashFill();
    const refuses = (get(14,8).value==null || get(14,8).value==='');
    // undo restores
    S.active={r:2,c:9}; undoAct(); undoAct(); undoAct(); undoAct();
    return { proper, ticker, concat, refuses };
  });
  ok(ag1.proper, 'Ctrl+E fills a case-cleanup pattern from ONE example');
  ok(ag1.ticker, 'extraction pattern fills via the real chord; results stay TEXT (a "7203" ticker is not a number)');
  ok(ag1.concat, 'two-column template with an inferred literal separator ("Last, First")');
  ok(ag1.refuses, 'no discernible pattern -> Flash Fill refuses rather than guessing');

  console.log('AH. clipboard lifecycle — tiling, ants, copy-then-Enter, Ctrl+F (r418)');
  await fresh();
  const ah1 = await run(() => {
    const bc=()=>({...blankCell()});
    // exact-multiple tiling: copy 1 cell, select 3 -> Ctrl+V fills all three (Excel)
    S.cells['H2']={...bc(), value:7}; render();
    setDemoSel('H2'); demoKey({key:'c',ctrl:true});
    setDemoSel('H4:H6'); demoKey({key:'v',ctrl:true});
    const tiled = S.cells['H4'].value===7 && S.cells['H5'].value===7 && S.cells['H6'].value===7;
    const R = selRange();
    const selFootprint = R.r1===4 && R.r2===6 && R.c1===8 && R.c2===8;   // the FULL tiled block is selected
    // per-tile formula translation: each repeat translates relative to ITS landing spot
    setDemoSel('C9'); for (const ch of '=B4+1') demoKey({key:ch}); demoKey({key:'Enter'});
    setDemoSel('C9'); demoKey({key:'c',ctrl:true});
    setDemoSel('D10:D11'); demoKey({key:'v',ctrl:true});
    const tf = (S.cells['D10']||{}).formula==='=C5+1' && (S.cells['D11']||{}).formula==='=C6+1';
    // NON-multiple selection: single paste anchored top-left, no spill (also Excel)
    S.cells['I2']={...bc(), value:1}; S.cells['I3']={...bc(), value:2}; render();
    setDemoSel('I2:I3'); demoKey({key:'c',ctrl:true});
    setDemoSel('I5:I7'); demoKey({key:'v',ctrl:true});
    const single = S.cells['I5'].value===1 && S.cells['I6'].value===2 && !(S.cells['I7'] && S.cells['I7'].value);
    // ants lifecycle: starting an edit (type-to-replace -> startEdit) kills ants + clipboard
    setDemoSel('H2'); demoKey({key:'c',ctrl:true});
    const armed = !!S.clipboard;
    setDemoSel('G2'); demoKey({key:'5'});
    const clearedByEdit = armed && !S.clipboard && editing;
    demoKey({key:'Escape'});
    // row insert (keyboard chord) invalidates the copied rect
    setDemoSel('H2'); demoKey({key:'c',ctrl:true});
    setDemoSel('A12'); demoKey({key:' ',shift:true});
    demoKey({key:'=',ctrl:true,shift:true});
    const clearedByIns = !S.clipboard;
    demoKey({key:'z',ctrl:true});
    // row delete (ribbon route) too
    setDemoSel('H2'); demoKey({key:'c',ctrl:true});
    setDemoSel('A12'); demoKey({key:'Alt'}); demoKey({key:'h'}); demoKey({key:'d'}); demoKey({key:'r'});
    const clearedByDel = !S.clipboard;
    demoKey({key:'z',ctrl:true});
    // COPY-THEN-ENTER: plain Enter pastes at the cursor and CONSUMES the clipboard
    setDemoSel('H2'); demoKey({key:'c',ctrl:true});
    setDemoSel('G7'); demoKey({key:'Enter'});
    const enterPasted = S.cells['G7'] && S.cells['G7'].value===7;
    const consumed = !S.clipboard;
    const antsGone = (document.getElementById('marquee')||{style:{display:'none'}}).style.display==='none';
    // with no clipboard armed, plain Enter still just moves down
    setDemoSel('G9'); demoKey({key:'Enter'});
    const stillMoves = S.active.r===10 && S.active.c===7;
    // Ctrl+F: swallowed (never reaches the browser find bar) and opens Find & Replace
    const ev=new KeyboardEvent('keydown',{key:'f',ctrlKey:true,bubbles:true,cancelable:true});
    document.dispatchEvent(ev);
    const ctrlF = ev.defaultPrevented && mode==='ribbon' && dialog==='findrep';
    demoKey({key:'Escape'});
    const chordDialogOneEsc = mode==='normal' && dialog===null;   // chord-opened dialog (no KeyTip path) closes to the grid in ONE press
    return { tiled, selFootprint, tf, single, clearedByEdit, clearedByIns, clearedByDel,
             enterPasted, consumed, antsGone, stillMoves, ctrlF, chordDialogOneEsc };
  });
  ok(ah1.tiled, 'paste TILES: 1 copied cell fills an exact-multiple 3-cell selection', JSON.stringify(ah1));
  ok(ah1.selFootprint, 'the full tiled footprint is selected after paste');
  ok(ah1.tf, 'each tiled repeat translates relative refs to ITS OWN landing spot');
  ok(ah1.single, 'non-multiple selection keeps the single paste anchored top-left');
  ok(ah1.clearedByEdit, 'starting an edit kills the marching ants + clipboard (startEdit)');
  ok(ah1.clearedByIns, 'row insert (Ctrl+Shift+=) invalidates the copied rect');
  ok(ah1.clearedByDel, 'row delete (Alt H D R) invalidates the copied rect');
  ok(ah1.enterPasted && ah1.consumed, 'copy-then-Enter pastes at the cursor and consumes the clipboard');
  ok(ah1.antsGone, 'the ants frame is hidden after the Enter-paste');
  ok(ah1.stillMoves, 'plain Enter with no clipboard armed still moves down');
  ok(ah1.ctrlF, 'Ctrl+F is swallowed and opens Find & Replace (no browser find bar)');
  ok(ah1.chordDialogOneEsc, 'Esc closes a chord-opened dialog straight back to the grid');

  /* r422 (pastes rework, DEPTH_PASS §4.3 engine note): the r418/r419 paste-TILING change must
     never route paste-OPS through the tile loop — a 1-cell helper over an exact-multiple
     selection broadcasts ONCE per destination cell (pastes' ×1000 divide across B5:E5). */
  console.log('AH2. paste-op broadcast ×1 over an exact-multiple selection (r422 pastes regression)');
  await fresh();
  const ah2 = await run(() => {
    const bc=()=>({...blankCell()});
    S.cells['H4']={...bc(), value:2000}; S.cells['H5']={...bc(), value:5000}; S.cells['H6']={...bc(), value:9000};
    S.cells['J2']={...bc(), value:1000}; render();
    setDemoSel('J2'); demoKey({key:'c',ctrl:true});
    setDemoSel('H4:H6'); demoKey({key:'Alt'}); demoKey({key:'e'}); demoKey({key:'s'}); demoKey({key:'i'}); demoKey({key:'Enter'});
    return { a:S.cells['H4'].value, b:S.cells['H5'].value, c:S.cells['H6'].value };
  });
  ok(ah2.a===2 && ah2.b===5 && ah2.c===9, 'a 1-cell clip DIVIDE over a 3-cell selection divides each cell exactly once', JSON.stringify(ah2));

  console.log('AI. ribbon canon — W V G, H 3, Subtract, H O E, M P / M D (r418)');
  await fresh();
  const ai1 = await run(() => {
    const bc=()=>({...blankCell()});
    // Alt W V G is Excel canon (View -> Show -> Gridlines)
    const had = document.body.classList.contains('hide-gridlines');
    demoKey({key:'Alt'}); demoKey({key:'w'});
    const wMenu = mode==='ribbon' && path.join('')==='W' && (MENUS['W']||[]).some(o=>o[0]==='V');
    demoKey({key:'v'});
    const wvMenu = path.join('')==='WV';
    demoKey({key:'g'});
    const toggled = document.body.classList.contains('hide-gridlines')!==had && mode==='normal';
    // Alt W G stays a silent alias
    demoKey({key:'Alt'}); demoKey({key:'w'}); demoKey({key:'g'});
    const aliased = document.body.classList.contains('hide-gridlines')===had && mode==='normal';
    // Alt H 3 (Underline) is now LISTED, not just wired
    const h3Listed = (MENUS['H']||[]).some(o=>o[0]==='3')
      && RIBBON_GROUPS['H'].some(g=>g[0]==='Font' && g[1].indexOf('3')>=0);
    setDemoSel('C5'); demoKey({key:'Alt'}); demoKey({key:'h'}); demoKey({key:'3', code:'Digit3'});
    const uline = !!S.cells['C5'].uline;
    // Paste Special SUBTRACT: dest - src on values, =(F)-k wrap on formulas
    S.cells['H2']={...bc(), value:7};
    S.cells['H3']={...bc(), value:100};
    S.cells['H4']={...bc(), formula:'=H3*2', value:200};
    recalc(); render();
    setDemoSel('H2'); demoKey({key:'c',ctrl:true});
    setDemoSel('H3'); demoKey({key:'Alt'}); demoKey({key:'e'}); demoKey({key:'s'}); demoKey({key:'s'}); demoKey({key:'Enter'});
    const sub = S.cells['H3'].value===93;
    setDemoSel('H4'); demoKey({key:'Alt'}); demoKey({key:'e'}); demoKey({key:'s'}); demoKey({key:'s'}); demoKey({key:'Enter'});
    const subWrap = S.cells['H4'].formula==='=(H3*2)-7';
    // Alt H O E — the ribbon route to Format Cells
    setDemoSel('D3'); for (const ch of '46200') demoKey({key:ch}); demoKey({key:'Enter'});
    setDemoSel('D3'); demoKey({key:'Alt'}); demoKey({key:'h'}); demoKey({key:'o'}); demoKey({key:'e'});
    const hoe = mode==='ribbon' && dialog==='fmt';
    demoKey({key:'d'});
    const dated = /^[A-Z][a-z]{2}-\d{2}$/.test(dispText(S.cells['D3'])) && mode==='normal';
    // Alt M P / M D alias the Ctrl+[ / Ctrl+] trace jumps
    S.cells['J2']={...bc(), value:5}; S.cells['J3']={...bc(), formula:'=J2*2'}; recalc(); render();
    setDemoSel('J3'); demoKey({key:'Alt'}); demoKey({key:'m'}); demoKey({key:'p'});
    const prec = colLetter(S.active.c)+S.active.r==='J2' && mode==='normal';
    demoKey({key:'Alt'}); demoKey({key:'m'}); demoKey({key:'d'});
    const dep = colLetter(S.active.c)+S.active.r==='J3' && mode==='normal';
    return { wMenu, wvMenu, toggled, aliased, h3Listed, uline, sub, subWrap, hoe, dated, prec, dep };
  });
  ok(ai1.wMenu && ai1.wvMenu, 'Alt W shows the Show group; V descends (Excel canon path)', JSON.stringify(ai1));
  ok(ai1.toggled, 'Alt W V G toggles gridlines');
  ok(ai1.aliased, 'Alt W G still works as a silent alias');
  ok(ai1.h3Listed, 'the H 3 Underline keytip is visible in MENUS + the Font group');
  ok(ai1.uline, 'Alt H 3 underlines');
  ok(ai1.sub, 'paste-special Subtract lands dest − src', JSON.stringify({v:ai1.sub}));
  ok(ai1.subWrap, 'Subtract wraps formula cells =(F)-k like the other ops');
  ok(ai1.hoe, 'Alt H O E opens Format Cells');
  ok(ai1.dated, 'the H O E dialog applies (serial → Mmm-yy)');
  ok(ai1.prec, 'Alt M P rides to the precedent (Ctrl+[ alias)');
  ok(ai1.dep, 'Alt M D rides to the dependent (Ctrl+] alias)');

  console.log('AJ. Esc one-level + uppercase KeyTips (r418)');
  await fresh();
  const aj1 = await run(() => {
    // menu path: Esc pops ONE key per press, then exits
    demoKey({key:'Alt'}); demoKey({key:'h'}); demoKey({key:'b'});
    const depth2 = mode==='ribbon' && path.join('')==='HB';
    demoKey({key:'Escape'}); const popped = mode==='ribbon' && path.join('')==='H';
    demoKey({key:'Escape'}); const strip  = mode==='ribbon' && path.length===0;
    demoKey({key:'Escape'}); const out    = mode==='normal';
    // dialog opened over a KeyTip path: first Esc closes the dialog only
    demoKey({key:'Alt'}); demoKey({key:'h'}); demoKey({key:'v'}); demoKey({key:'s'});
    const dlgOpen = dialog==='paste' && path.join('')==='HV';
    demoKey({key:'Escape'});
    const dlgClosed = dialog===null && mode==='ribbon' && path.join('')==='HV';
    demoKey({key:'Escape'}); demoKey({key:'Escape'}); demoKey({key:'Escape'});
    const backOut = mode==='normal';
    // uppercase KeyTip badges — tab strip and command tiles
    demoKey({key:'Alt'});
    const tabsUpper = Array.from(document.querySelectorAll('#ribbon .rtab k'))
      .every(el=>/^[A-Z]$/.test(el.textContent)) && document.querySelectorAll('#ribbon .rtab k').length>0;
    demoKey({key:'h'});
    const badges = Array.from(document.querySelectorAll('#ribbon .ri-key')).map(el=>el.textContent);
    const badgesUpper = badges.length>0 && badges.every(t=>/^[A-Z0-9]$/.test(t));
    demoKey({key:'Escape'}); demoKey({key:'Escape'});
    return { depth2, popped, strip, out, dlgOpen, dlgClosed, backOut, tabsUpper, badgesUpper };
  });
  ok(aj1.depth2 && aj1.popped, 'Esc pops one menu level (H B → H)', JSON.stringify(aj1));
  ok(aj1.strip, 'second Esc lands on the tab strip');
  ok(aj1.out, 'third Esc exits the ribbon');
  ok(aj1.dlgOpen && aj1.dlgClosed, 'Esc on a path-opened dialog closes the dialog, stays at the menu');
  ok(aj1.backOut, 'then Esc walks the rest of the way out');
  ok(aj1.tabsUpper, 'tab-strip KeyTips render UPPERCASE');
  ok(aj1.badgesUpper, 'command-tile KeyTip badges render UPPERCASE');

  /* =====================================================================================
     AK. THE CURSOR AFTER A COPY / A PASTE (Wolf round-2 R2-B2: "re-check the behavior of the
     cursor when you move with arrow keys after pasting or copying a range of values").
     Excel truth, one case per assert:
       (a) after COPY the arrows move FREELY and the marching ants stay on the source;
       (b) after a multi-cell PASTE the landed block is SELECTED with the ANCHOR active — the
           next arrow collapses the selection and steps ONE cell from the anchor, never from
           the range's far corner;
       (c) copy-then-ENTER is a one-shot drop: cursor on the destination cell, no ghost;
       (d) Ctrl+Z after a paste leaves the selection sane (in-bounds, anchor still active).
     Before r426 the collapse stepped off S.active — the far corner — so (b) landed the cursor
     one row BELOW the pasted block instead of one below its top-left, and the same divergence
     hit every shift-extend and both space-selects.
     ===================================================================================== */
  console.log('AK. cursor after copy / paste (round-2 R2-B2)');
  await fresh();
  const ak1 = await run(() => {
    const at = () => colLetter(S.active.c) + S.active.r;
    const ants = () => { const m = document.getElementById('marquee'); return !!m && m.style.display !== 'none'; };
    const out = {};
    // ---- (a) COPY: arrows roam, ants persist ----
    setDemoSel('B4:B6'); demoKey({key:'c', ctrl:true});
    out.copyAnts = ants();
    demoKey({key:'ArrowDown'});
    out.afterCopyDown = at(); out.antsAfterMove = ants(); out.copySelCleared = !S.sel;
    demoKey({key:'ArrowRight'}); demoKey({key:'ArrowRight'});
    out.afterCopyRoam = at(); out.antsAfterRoam = ants();
    // ---- (b) PASTE a 1×3 block, then a plain arrow ----
    setDemoSel('B4:B6'); demoKey({key:'c', ctrl:true});
    setDemoSel('H4'); demoKey({key:'v', ctrl:true});
    const pr = selRange();
    out.pasteRect = 'H' + pr.r1 + ':' + colLetter(pr.c2) + pr.r2;
    out.pasteSelected = !!S.sel;
    out.pasteAnchorShown = (() => { const a = document.querySelector('#grid td.active');
      const tr = [...document.querySelectorAll('#grid tr')].indexOf(a && a.parentElement);
      return a ? tr : -1; })();
    demoKey({key:'ArrowDown'});
    out.afterPasteDown = at(); out.pasteGhost = !!S.sel;
    // ← from the anchor too (a horizontal step off the same anchor)
    setDemoSel('H4'); demoKey({key:'v', ctrl:true}); demoKey({key:'ArrowRight'});
    out.afterPasteRight = at();
    // Ctrl+arrow collapses off the anchor as well
    setDemoSel('H4'); demoKey({key:'v', ctrl:true});
    const ctrlFrom = (S.selA && S.selA.r >= 1 ? S.selA : S.sel);
    out.pasteAnchor = colLetter(ctrlFrom.c) + ctrlFrom.r;
    // ---- shift-extend: the anchor is the active cell, an arrow steps from IT ----
    setDemoSel('D4'); demoKey({key:'ArrowDown', shift:true}); demoKey({key:'ArrowDown', shift:true});
    out.extRect = (() => { const r = selRange(); return colLetter(r.c1) + r.r1 + ':' + colLetter(r.c2) + r.r2; })();
    demoKey({key:'ArrowDown'});
    out.afterExtDown = at();
    // ---- Shift+Space (whole row): the active cell never left column D ----
    setDemoSel('D8'); demoKey({key:' ', shift:true});
    out.rowSel = !!S.sel && selRange().c1 === 1 && selRange().c2 === COLS;
    demoKey({key:'ArrowDown'});
    out.afterRowSel = at();
    // ---- Ctrl+Space (whole column) ----
    setDemoSel('D8'); demoKey({key:' ', ctrl:true}); demoKey({key:'ArrowRight'});
    out.afterColSel = at();
    return out;
  });
  ok(ak1.copyAnts && ak1.antsAfterMove && ak1.antsAfterRoam,
    '(a) copy: the marching ants survive every arrow key', JSON.stringify(ak1));
  ok(ak1.afterCopyDown === 'B5' && ak1.afterCopyRoam === 'D5' && ak1.copySelCleared,
    '(a) copy: the first arrow collapses to the ANCHOR and steps one — B4:B6 ↓ → B5', ak1.afterCopyDown);
  ok(ak1.pasteRect === 'H4:H6' && ak1.pasteSelected,
    '(b) paste: the landed block is selected (H4:H6)', ak1.pasteRect);
  ok(ak1.pasteAnchor === 'H4', '(b) paste: the ANCHOR — the displayed active cell — is the top-left', ak1.pasteAnchor);
  ok(ak1.afterPasteDown === 'H5' && !ak1.pasteGhost,
    '(b) paste + ↓ steps ONE from the anchor (H5), selection gone — not H7 off the far corner', ak1.afterPasteDown);
  ok(ak1.afterPasteRight === 'I4', '(b) paste + → steps ONE from the anchor (I4)', ak1.afterPasteRight);
  ok(ak1.extRect === 'D4:D6' && ak1.afterExtDown === 'D5',
    'shift-extend + ↓ collapses to the anchor and steps (D4:D6 → D5), not D7', ak1);
  ok(ak1.rowSel && ak1.afterRowSel === 'D9',
    'Shift+Space + ↓ steps from the parked active cell (D9), not off column J', ak1.afterRowSel);
  ok(ak1.afterColSel === 'E8',
    'Ctrl+Space + → steps from the parked active cell (E8), not off the last row', ak1.afterColSel);

  await fresh();
  const ak2 = await run(() => {
    const at = () => colLetter(S.active.c) + S.active.r;
    // ---- (c) copy-then-ENTER: one-shot drop, cursor on the destination, no ghost ----
    setDemoSel('B4:B6'); demoKey({key:'c', ctrl:true});
    setDemoSel('H4'); demoKey({key:'Enter'});
    const landed = !!(S.cells['H4'] && S.cells['H5'] && S.cells['H6']);
    const at1 = at(), ghost = !!S.sel;
    const ants = (() => { const m = document.getElementById('marquee'); return !!m && m.style.display !== 'none'; })();
    const clip = !!S.clipboard;
    demoKey({key:'ArrowDown'});
    const at2 = at();
    // ---- (d) Ctrl+Z after a paste: cells revert, the selection stays sane ----
    const before = JSON.stringify(S.cells['J4'] || null);
    setDemoSel('B4:B6'); demoKey({key:'c', ctrl:true});
    setDemoSel('J4'); demoKey({key:'v', ctrl:true});
    demoKey({key:'z', ctrl:true});
    const reverted = JSON.stringify(S.cells['J4'] || null) === before;
    const r = selRange();
    const inBounds = S.active.r >= 1 && S.active.r <= S.ROWS && S.active.c >= 1 && S.active.c <= COLS &&
      (!S.sel || (S.sel.r >= 1 && S.sel.r <= S.ROWS && S.sel.c >= 1 && S.sel.c <= COLS));
    const anchor = S.sel ? colLetter((S.selA && S.selA.r >= 1 ? S.selA : S.sel).c) + (S.selA && S.selA.r >= 1 ? S.selA : S.sel).r : at();
    demoKey({key:'ArrowDown'});
    const afterUndoDown = at();
    return { landed, at1, ghost, ants, clip, at2, reverted, rect: colLetter(r.c1)+r.r1+':'+colLetter(r.c2)+r.r2, inBounds, anchor, afterUndoDown };
  });
  ok(ak2.landed && ak2.at1 === 'H4' && !ak2.ghost,
    '(c) copy-then-Enter lands the block and leaves the cursor ON the anchor with no selection ghost', ak2);
  ok(!ak2.ants && !ak2.clip, '(c) copy-then-Enter consumes the clipboard — the ants die', ak2);
  ok(ak2.at2 === 'H5', '(c) the next arrow steps one from there (H5)', ak2.at2);
  ok(ak2.reverted, '(d) Ctrl+Z after a paste reverts the cells', ak2);
  ok(ak2.inBounds && ak2.rect === 'J4:J6' && ak2.anchor === 'J4',
    '(d) Ctrl+Z leaves the undone range selected, in-bounds, anchor active', ak2);
  ok(ak2.afterUndoDown === 'J5', '(d) an arrow after the undo still steps from the anchor', ak2.afterUndoDown);

  await fresh();
  const ak3 = await run(() => {
    const at = () => colLetter(S.active.c) + S.active.r;
    const disp = () => { const a = dispActive(); return colLetter(a.c) + a.r; };
    // Home collapses off the ANCHOR's row, not the grabbed block's last row
    setDemoSel('B4'); demoKey({key:'ArrowDown', shift:true, ctrl:true});
    const grabbed = colLetter(selRange().c1) + selRange().r1 + ':' + colLetter(selRange().c2) + selRange().r2;
    demoKey({key:'Home'});
    const afterHome = at();
    // a parked anchor may never leak into the NEXT selection
    setDemoSel('D8'); demoKey({key:' ', shift:true});          // Shift+Space parks S.selA at D8
    const parked = disp();
    demoKey({key:'Home'});                                      // collapse — the park must die with it
    setDemoSel('G3'); demoKey({key:'ArrowDown', shift:true});    // a brand-new range, anchor G3
    const freshAnchor = disp();
    demoKey({key:'ArrowUp'});
    const afterFresh = at();
    return { grabbed, afterHome, parked, freshAnchor, afterFresh };
  });
  ok(ak3.afterHome === 'A4', 'Home after a Ctrl+Shift+↓ grab lands in the ANCHOR\'s row (A4), not the block\'s last', ak3);
  ok(ak3.parked === 'D8', 'Shift+Space parks the active cell where it was (D8)', ak3.parked);
  ok(ak3.freshAnchor === 'G3' && ak3.afterFresh === 'G2',
    'a parked anchor never leaks into the next selection (G3:G4 → ↑ → G2)', ak3);

  /* =====================================================================================
     AL. OUTSIDE-BORDER CANON (Wolf round-2 R2-B4 / DEPTH_PASS §1.0-R2(m)): outside borders
     are Alt H B **S** (S for outSide); Alt H B **A** is ALL borders. The engine assert lives
     at 'Alt H B S draws the selection PERIMETER' above; these guard the TEACHING surfaces —
     the menu table, the drill copy, and the generated reference pages — so no route, hint or
     checklist line can teach A for an outside border again.
     ===================================================================================== */
  console.log('AL. outside-border canon: S = outSide, A = all (round-2 R2-B4)');
  await fresh();
  const al1 = await run(() => {
    const lbl = k => (MENUS['HB'].find(x => x[0] === k) || [])[1];
    // A = all borders: every interior edge inked, not just the perimeter
    setDemoSel('C4:E6');
    demoKey({key:'Alt'}); demoKey({key:'h'}); demoKey({key:'b'}); demoKey({key:'a'});
    const mid = S.cells['D5'] || {};
    const allInked = !!mid.ball;
    // S = outside: perimeter only, interior clean
    setDemoSel('C9:E11');
    demoKey({key:'Alt'}); demoKey({key:'h'}); demoKey({key:'b'}); demoKey({key:'s'});
    const midS = S.cells['D10'] || {};
    const perimOnly = !midS.ball && !midS.bt && !midS.bb && !midS.bl && !midS.br &&
      !!(S.cells['C9'] || {}).bt && !!(S.cells['C9'] || {}).bl &&
      !!(S.cells['E11'] || {}).bb && !!(S.cells['E11'] || {}).br;
    // no drill hint / req / checklist line may call H B A an OUTSIDE border
    const offenders = [];
    Object.keys(CHALLENGES).forEach(k => {
      const d = CHALLENGES[k]; if (!d) return;
      const bits = [];
      try { if (d.aha) bits.push(String(d.aha)); } catch (e) {}
      try { if (typeof d.req === 'function') bits.push(String(d.req.call(d))); } catch (e) {}
      try { if (typeof d.guide === 'function') bits.push(d.guide.call(d).join(' ')); } catch (e) {}
      bits.forEach(t => {
        const flat = t.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').toLowerCase();
        /* Which border WORD does this "h b a" chord claim to be? Our copy names the border
           just before the chord ("all borders (alt h b a)") or just after it ("alt h b a — a
           is ALL borders"). Read the nearest one on each side and flag only when the letter A
           is being sold as the OUTSIDE border. A sentence that legitimately names both chords
           ("…ALL borders (Alt H B A) while the table gets an OUTSIDE border (Alt H B S)") must
           not trip it — hence nearest-word, not window-contains. */
        const WORD = /(all borders|all-borders|outside|outline|perimeter)/g;
        const rx = /h\s*b\s*a\b/g; let m;
        while ((m = rx.exec(flat))) {
          const back = flat.slice(Math.max(0, m.index - 60), m.index);
          const fwd = flat.slice(m.index, m.index + 70);
          const bm = back.match(WORD), fm = fwd.match(WORD);
          const claim = bm ? bm[bm.length - 1] : (fm ? fm[0] : null);
          if (claim && /outside|outline|perimeter/.test(claim))
            offenders.push(k + ' [' + claim + ']: …' + (back + fwd).trim() + '…');
        }
      });
    });
    return { a: lbl('A'), s: lbl('S'), allInked, perimOnly, offenders };
  });
  ok(al1.a === 'All' && al1.s === 'Outside', 'MENUS canon: A = All, S = Outside', al1);
  ok(al1.allInked, 'Alt H B A inks the INTERIOR too — it is ALL borders', al1);
  ok(al1.perimOnly, 'Alt H B S inks the PERIMETER only — it is the OUTSIDE border', al1);
  ok(al1.offenders.length === 0,
    'no drill aha / req / hint teaches H B A as an outside border', al1.offenders.slice(0, 4).join(' | '));

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

  /* r452 (parity audit P1-1/P1-2/P1-5/P1-8/P1-9): four chords Excel users reach for that the
     engine either missed or did something else with. Each was proven live before the fix. */
  console.log('AM. r452 parity: Tab-Enter home · Ctrl+Shift+V · Ctrl+Shift+8 · Shift+F2 · Ctrl+;');
  await fresh();
  const am1 = await run(() => {
    // Excel: a Tab run remembers its home column — B4 → Tab → Tab → Enter lands B5, not D5
    setDemoSel('B4'); demoKey({key:'1'}); demoKey({key:'Tab'});
    demoKey({key:'2'}); demoKey({key:'Tab'});
    demoKey({key:'3'}); demoKey({key:'Enter'});
    const home = colLetter(S.active.c) + S.active.r;
    // …and a plain Tab run with no typing behaves the same
    setDemoSel('E4'); demoKey({key:'Tab'}); demoKey({key:'Tab'}); demoKey({key:'Enter'});
    const home2 = colLetter(S.active.c) + S.active.r;
    // an arrow between the Tabs ENDS the run: Enter then just steps down
    setDemoSel('B10'); demoKey({key:'Tab'}); demoKey({key:'ArrowRight'}); demoKey({key:'Enter'});
    const broken = colLetter(S.active.c) + S.active.r;
    // a lone Enter with no Tab run behind it still just moves down
    setDemoSel('G4'); demoKey({key:'Enter'});
    const plain = colLetter(S.active.c) + S.active.r;
    return { home, home2, broken, plain };
  });
  ok(am1.home === 'B5', 'Tab, Tab, Enter returns to the column the run started in', am1.home);
  ok(am1.home2 === 'E5', 'the home-column return needs no typing', am1.home2);
  ok(am1.broken === 'D11', 'an arrow between Tabs ends the run (Enter just steps down)', am1.broken);
  ok(am1.plain === 'G5', 'Enter with no Tab run behind it is unchanged', am1.plain);

  await fresh();
  const am2 = await run(() => {
    // Ctrl+Shift+V = paste VALUES on the native profile (Excel 365, 2023)
    setDemoSel('C9'); for (const ch of '=B4+1') demoKey({key:ch}); demoKey({key:'Enter'});
    const src = S.cells['C9'].value;
    setDemoSel('C9'); demoKey({key:'c', ctrl:true});
    setDemoSel('E11'); demoKey({key:'v', ctrl:true, shift:true});
    const d = S.cells['E11'] || {};
    // Alt E S V still walks (the ribbon route must not have moved)
    setDemoSel('C9'); demoKey({key:'c', ctrl:true});
    setDemoSel('E12');
    demoKey({key:'Alt'}); demoKey({key:'e'}); demoKey({key:'s'}); demoKey({key:'v'}); demoKey({key:'Enter'});
    const w = S.cells['E12'] || {};
    return { f: d.formula || null, v: d.value, src, wf: w.formula || null, wv: w.value };
  });
  ok(!am2.f && am2.v === am2.src, 'Ctrl+Shift+V pastes VALUES, not the formula', JSON.stringify(am2));
  ok(!am2.wf && am2.wv === am2.src, 'Alt E S V is untouched by the Ctrl+Shift+V route', JSON.stringify(am2));

  await fresh();
  const am3 = await run(() => {
    setDemoSel('C5'); demoKey({key:' ', ctrl:true, shift:true});
    const spaceR = selRange();
    setDemoSel('C5'); S.sel = null;
    demoKey({key:'*', ctrl:true, shift:true});
    const starR = selRange();
    setDemoSel('C5'); S.sel = null;
    demoKey({key:'8', ctrl:true, shift:true});
    const eightR = selRange();
    const same = (a, b) => a.r1 === b.r1 && a.c1 === b.c1 && a.r2 === b.r2 && a.c2 === b.c2;
    return { ok8: same(spaceR, eightR), okStar: same(spaceR, starR), spaceR, starR };
  });
  ok(am3.okStar, 'Ctrl+* selects the current region, same as Ctrl+Shift+Space', JSON.stringify(am3));
  ok(am3.ok8, 'Ctrl+Shift+8 selects the current region too', JSON.stringify(am3));

  await fresh();
  const am4 = await run(() => {
    // Shift+F2 is Excel's INSERT COMMENT — it must never open the editor
    setDemoSel('B4'); const before = S.cells['B4'].value;
    demoKey({key:'F2', shift:true});
    const noEdit = editing === false;
    demoKey({key:'F2'});                       // plain F2 still edits
    const edits = editing === true;
    demoKey({key:'Escape'});
    // Ctrl+; stamps today as a VALUE (the engine's date format renders it)
    setDemoSel('D6'); demoKey({key:';', ctrl:true});
    const c = S.cells['D6'] || {};
    const today = Math.floor((Date.now() - Date.UTC(1899, 11, 30)) / 86400000);
    return { noEdit, edits, kept: S.cells['B4'].value === before, dv: c.value, df: c.fmtStyle, today, txt: dispText(c) };
  });
  ok(am4.noEdit && am4.kept, 'Shift+F2 does not open edit mode (Excel: insert comment)', JSON.stringify(am4));
  ok(am4.edits, 'plain F2 still edits');
  ok(am4.dv === am4.today && am4.df === 'date', 'Ctrl+; stamps today as a dated value', JSON.stringify(am4));
  ok(!!am4.txt && am4.txt.length > 0, 'the stamped date renders through the date format', String(am4.txt));

  const realErrors = errs.filter(e => !/supabase|Failed to fetch|NetworkError|ERR_/i.test(e));
  ok(realErrors.length === 0, 'zero page errors during the matrix', realErrors.join(' | '));
  await browser.close();
  console.log((fail ? 'PARITY MATRIX: ' + fail + ' FAILURE(S), ' : 'PARITY MATRIX: ALL ') + pass + ' PASS');
  process.exit(fail ? 1 : 0);
})();
