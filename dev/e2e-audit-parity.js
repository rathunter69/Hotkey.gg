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
