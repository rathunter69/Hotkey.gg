/* FORMULA PACK E2E (D1, r415-review · extended r418 H3-A) — locks the lookup/logical/date
   functions added to the engine's evalFormula (VLOOKUP/HLOOKUP, AND/OR/NOT, DATE/YEAR/MONTH/
   DAY/EDATE/EOMONTH/YEARFRAC) AND the r418 formula-system batch (AUDIT_R417 §A #1/3/4/11/12/
   13/15 + §G): error-value sentinels (#N/A · #DIV/0! · #VALUE! · #NAME? beside the r407
   #REF!) that commit, display and propagate; the autocorrect ladder (silent case-normalize /
   propose-fix / #NAME? / refuse) on Enter AND Ctrl+Enter; lazy IF; COUNT/COUNTA/MOD/ROUNDUP/
   ROUNDDOWN; postfix %; INDEX text results; %-formatted-cell entry auto-scale.
   Run: python3 -m http.server 8791 & ; node dev/e2e-formulas.js */
'use strict';
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = process.env.URL || 'http://127.0.0.1:8791/index.html';

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await browser.newPage();
  const perr = [];
  page.on('pageerror', e => perr.push(String(e.message || e).slice(0, 140)));
  await page.route('**/@supabase/**', r => r.abort());
  await page.addInitScript(() => { try {
    localStorage.setItem('hotkey_onboarded', '1'); localStorage.setItem('hk_tour_done', '1');
    localStorage.setItem('hk_learn_done', '1'); localStorage.setItem('hk_beta_ok', '1');
  } catch (e) {} });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof evalFormula === 'function' && typeof S !== 'undefined', null, { timeout: 15000 });

  let fail = 0;
  const judge = (got, want, tag) => {
    for (const k of Object.keys(want)) {
      if (got[k] !== want[k]) { fail++; console.error(`FAIL ${tag}.${k}: got ${JSON.stringify(got[k])} want ${JSON.stringify(want[k])}`); }
      else console.log(`  ok  ${tag}.${k} = ${JSON.stringify(got[k])}`);
    }
  };

  /* ---- 1 · D1 pack (unchanged contract) ---- */
  const got = await page.evaluate(() => {
    const set = (ref, v) => { (S.cells[ref] = S.cells[ref] || {}).value = v; S.cells[ref].formula = null; };
    set('A1', 1); set('A2', 2); set('A3', 3);
    set('B1', 10); set('B2', 20); set('B3', 30);
    set('C1', 'apple'); set('C2', 'pear'); set('C3', 'plum');
    set('D1', 5); set('E1', 6); set('F1', 7);
    set('D2', 50); set('E2', 60); set('F2', 70);
    const E = f => { try { return evalFormula(f); } catch (e) { return 'ERR:' + String(e.message || e).slice(0, 20); } };
    return {
      vlookup_num: E('=VLOOKUP(2,A1:B3,2,0)'),
      vlookup_txt: E('=VLOOKUP(3,A1:C3,3,0)'),
      vlookup_approx: E('=VLOOKUP(2.5,A1:B3,2,1)'),
      vlookup_miss: E('=IFERROR(VLOOKUP(9,A1:B3,2,0),-1)'),
      hlookup: E('=HLOOKUP(6,D1:F2,2,0)'),
      and1: E('=AND(1>0,2>0)'), and0: E('=AND(1>0,0>1)'),
      or1: E('=OR(0>1,2>0)'), or0: E('=OR(0>1,0>2)'),
      not0: E('=NOT(0)'), not1: E('=NOT(5)'),
      yr: E('=YEAR(DATE(2026,7,24))'), mo: E('=MONTH(DATE(2026,7,24))'), day: E('=DAY(DATE(2026,7,24))'),
      edate: E('=DAY(EDATE(DATE(2026,1,31),1))'),
      eomonth: E('=DAY(EOMONTH(DATE(2026,1,15),0))'),
      yearfrac: E('=YEARFRAC(DATE(2026,1,1),DATE(2026,7,1))'),
      sum_still: E('=SUM(A1:A3)'), index_still: E('=INDEX(B1:B3,2)'),
    };
  });
  const want = {
    vlookup_num: 20, vlookup_txt: 'plum', vlookup_approx: 20, vlookup_miss: -1, hlookup: 60,
    and1: 1, and0: 0, or1: 1, or0: 0, not0: 1, not1: 0,
    yr: 2026, mo: 7, day: 24, edate: 28, eomonth: 31, yearfrac: 0.5,
    sum_still: 6, index_still: 20,
  };
  judge(got, want, 'D1');

  /* ---- 2 · r418 H3-A engine matrix — sentinels, propagation, IFERROR, lazy IF,
          new functions, postfix %, INDEX text (same seeded table as block 1) ---- */
  const got2 = await page.evaluate(() => {
    const set = (ref, v) => { (S.cells[ref] = S.cells[ref] || {}).value = v; S.cells[ref].formula = null; };
    set('G1', '#DIV/0!'); set('G2', '#N/A'); set('G3', null);   // pre-seeded error VALUES for propagation reads
    const E = f => { try { return evalFormula(f); } catch (e) { return 'ERR:' + String(e.message || e).slice(0, 20); } };
    return {
      // each sentinel is a VALUE, not a refusal
      div0: E('=1/0'), div0_zero: E('=0/0'),
      na_match: E('=MATCH(9,A1:A3,0)'), na_vlookup: E('=VLOOKUP(9,A1:B3,2,0)'),
      name_err: E('=FOO(A1)'),
      value_choose: E('=CHOOSE(9,1,2)'), value_find: E('=FIND("z","abc")'),
      bare_err_ref: E('=G1'),
      // propagation: a ref to an error cell poisons operators, aggregates, and text ops
      prop_arith: E('=G1+1'), prop_sum: E('=SUM(G2:G3)'), prop_concat: E('="x"&G2'),
      // IFERROR catches every sentinel — thrown, returned, or read from a cell
      iferror_div0: E('=IFERROR(1/0,7)'), iferror_name: E('=IFERROR(FOO(1),8)'),
      iferror_na: E('=IFERROR(VLOOKUP(9,A1:B3,2,0),9)'),
      iferror_cellval: E('=IFERROR(G1,5)'), iferror_nested: E('=1+IFERROR(1/0,5)'),
      // lazy IF: the untaken branch never evaluates; an erroring CONDITION still propagates
      if_lazy_true: E('=IF(1>0,5,1/0)'), if_lazy_false: E('=IF(0>1,1/0,9)'),
      if_lazy_name: E('=IF(1>0,7,FOO(1))'), if_err_cond: E('=IF(G2,1,2)'),
      // new functions (Excel semantics)
      count: E('=COUNT(A1:C3)'), counta: E('=COUNTA(A1:C3)'), count_scalars: E('=COUNT(5,"x",7)'),
      mod: E('=MOD(7,3)'), mod_negnum: E('=MOD(-7,3)'), mod_div0: E('=MOD(7,0)'),
      roundup: E('=ROUNDUP(3.2,0)'), roundup_neg: E('=ROUNDUP(-3.2,0)'), roundup_noise: E('=ROUNDUP(3.1,1)'),
      rounddown: E('=ROUNDDOWN(3.9,0)'), rounddown_neg: E('=ROUNDDOWN(-3.9,0)'),
      // postfix % operator
      pct_lit: E('=50%'), pct_mul: E('=B2*10%'), pct_neg: E('=-50%'),
      // INDEX returns text AS TEXT (matches VLOOKUP/OFFSET/CHOOSE)
      index_text: E('=INDEX(C1:C3,2)'), index_text_2d: E('=INDEX(A1:C3,3,3)'),
    };
  });
  const want2 = {
    div0: '#DIV/0!', div0_zero: '#DIV/0!',
    na_match: '#N/A', na_vlookup: '#N/A',
    name_err: '#NAME?',
    value_choose: '#VALUE!', value_find: '#VALUE!',
    bare_err_ref: '#DIV/0!',
    prop_arith: '#DIV/0!', prop_sum: '#N/A', prop_concat: '#N/A',
    iferror_div0: 7, iferror_name: 8, iferror_na: 9, iferror_cellval: 5, iferror_nested: 6,
    if_lazy_true: 5, if_lazy_false: 9, if_lazy_name: 7, if_err_cond: '#N/A',
    count: 6, counta: 9, count_scalars: 2,
    mod: 1, mod_negnum: 2, mod_div0: '#DIV/0!',
    roundup: 4, roundup_neg: -4, roundup_noise: 3.1, rounddown: 3, rounddown_neg: -3,
    pct_lit: 0.5, pct_mul: 2, pct_neg: -0.5,
    index_text: 'pear', index_text_2d: 'plum',
  };
  judge(got2, want2, 'ENG');

  /* ---- 3 · r418 H3-A commit pipeline — real KeyboardEvents on a live board:
          sentinel commits + err class tagging, recalc shows a formula that STARTS
          erroring, %-cell entry, and the autocorrect ladder × (Enter, Ctrl+Enter) ---- */
  await page.waitForFunction(() => typeof CHALLENGES !== 'undefined' && typeof demoKey === 'function');
  await page.evaluate(() => { try { _pro = true; } catch (e) {} });
  await page.evaluate(() => { document.querySelectorAll('.wb-dlg,.hk-cel-wrap').forEach(n => n.remove()); loadChallenge('foot'); });
  const got3 = await page.evaluate(() => {
    const R = {};
    const put = (ref, v) => { S.cells[ref] = { ...blankCell(), value: v }; };
    /* setDemoSel is a test shim: it doesn't maintain S.selA the way live shift-selection
       does, so clear it — otherwise a stale anchor from a previous probe survives into the
       next range and editRetarget anchors the wrong corner. */
    const type = (sel, str) => { setDemoSel(sel); if (S) S.selA = null; for (const ch of str) demoKey({ key: ch }); };
    const enter = () => demoKey({ key: 'Enter' });
    const esc = () => demoKey({ key: 'Escape' });
    put('G1', 1); put('G2', 2); put('G3', 3);

    // sentinel commits, displays as its text, and the cell gets the .err tag
    type('H1', '=1/0'); enter();
    R.div0_commit = S.cells['H1'].value;
    R.div0_disp = dispText(S.cells['H1']);
    const td = document.querySelector('#grid td[data-r="1"][data-c="8"]');
    R.div0_errclass = !!(td && / err( |$)|^err( |$)/.test(' ' + td.className + ' ') || (td && td.className.split(/\s+/).indexOf('err') >= 0));
    const tdok = document.querySelector('#grid td[data-r="1"][data-c="7"]');
    R.clean_no_errclass = !!(tdok && tdok.className.split(/\s+/).indexOf('err') < 0);
    // a committed ref to the error cell propagates it; IFERROR still catches it
    type('H2', '=H1+1'); enter(); R.prop_commit = S.cells['H2'].value;
    type('H3', '=IFERROR(H1,42)'); enter(); R.iferror_commit = S.cells['H3'].value;
    // unknown fn name COMMITS #NAME? (no refusal), editor closed
    type('H4', '=FOO(G1)'); enter(); R.name_commit = S.cells['H4'].value; R.name_closed = editing === false;
    // a committed formula that STARTS erroring shows the error via recalc — then heals
    type('H5', '=12/G3'); enter(); R.recalc_before = S.cells['H5'].value;             // 4
    setDemoSel('G3'); demoKey({ key: 'Delete' }); R.recalc_errs = S.cells['H5'].value; // '#DIV/0!'
    put('G3', 3); recalc(); R.recalc_heals = S.cells['H5'].value;                      // 4 again
    // %-formatted cell: bare numeric entry auto-scales (8 -> 8%, not 800%)
    put('H6', 0); S.cells['H6'].fmtStyle = 'percent'; S.cells['H6'].decimals = 0;
    type('H6', '8'); enter(); R.pctcell_val = S.cells['H6'].value;                     // 0.08
    type('G4', '8'); enter(); R.plaincell_val = S.cells['G4'].value;                   // 8 (no % format -> unscaled)
    // lazy IF at commit: error in the untaken branch is harmless
    type('G5', '=IF(G1>0,G2,1/0)'); enter(); R.lazyif_commit = S.cells['G5'].value;    // 2
    // silent tier S: case-normalized formula is what STORES
    type('I1', '=sum(g1:g2)'); enter();
    R.norm_formula = S.cells['I1'].formula; R.norm_val = S.cells['I1'].value; R.norm_silent = dialog === null;

    // --- autocorrect ladder, Enter path: each repair class proposes, ↵ accepts ---
    type('I2', '=SUM(G1;G3)'); enter();
    R.semi_dialog = dialog === 'fxfix'; R.semi_prop = fxfixPend ? fxfixPend.fixed : null;
    enter(); R.semi_val = S.cells['I2'].value; R.semi_closed = editing === false && dialog === null;
    // trailing operator + THE ESC INVARIANT: esc returns to the editor, ORIGINAL buffer intact
    type('I3', '=G1+'); enter();
    R.trail_dialog = dialog === 'fxfix'; R.trail_prop = fxfixPend ? fxfixPend.fixed : null;
    esc(); R.trail_backedit = editing === true && editBuf === '=G1+' && dialog === null;
    enter(); R.trail_redialog = dialog === 'fxfix';
    enter(); R.trail_val = S.cells['I3'].value;
    type('I4', '=SUM(G2,)'); enter(); R.commaparen_prop = fxfixPend ? fxfixPend.fixed : null;
    enter(); R.commaparen_val = S.cells['I4'].value;
    type('I5', '==G1+G2'); enter(); R.dbleq_prop = fxfixPend ? fxfixPend.fixed : null;
    enter(); R.dbleq_val = S.cells['I5'].value;
    type('I6', '=SUM(G1:G2))'); enter(); R.unbal_prop = fxfixPend ? fxfixPend.fixed : null;
    enter(); R.unbal_val = S.cells['I6'].value;
    type('J3', '=G1**G2'); enter(); R.dblop_prop = fxfixPend ? fxfixPend.fixed : null;
    enter(); R.dblop_val = S.cells['J3'].value;
    // unary ++ / -- are LEGAL, never "repaired": commits silently, no dialog
    type('J4', '=G1--G2'); enter(); R.unary_silent = dialog === null && editing === false;
    R.unary_val = S.cells['J4'].value;   // 1 - (-2) = 3
    // bad: nothing repairs it -> the r348 refusal beat (stay editing, no dialog)
    type('H7', '=)('); enter();
    R.bad_editing = editing === true && dialog === null;
    esc(); R.bad_left_empty = !S.cells['H7'] || S.cells['H7'].value == null;

    // --- autocorrect ladder, Ctrl+Enter path (Hook C — the silent-0 hole) ---
    type('J1:J2', '=G1+'); demoKey({ key: 'Enter', ctrl: true });
    R.ce_dialog = dialog === 'fxfix';
    enter();   // accept -> commitEditAll: anchor gets the fix, refs translate per cell
    R.ce_v1 = S.cells['J1'].value; R.ce_v2 = S.cells['J2'].value; R.ce_f2 = S.cells['J2'].formula;
    type('J5:J6', '=sum(g1:g2)'); demoKey({ key: 'Enter', ctrl: true });
    R.ceok_nodialog = dialog === null;
    R.ceok_f1 = S.cells['J5'].formula; R.ceok_v2 = S.cells['J6'].value;   // translated =SUM(G2:G3) -> 5
    type('J7:J8', '=)('); demoKey({ key: 'Enter', ctrl: true });
    R.cebad_editing = editing === true && dialog === null;   // refused — no silent 0s across the range
    esc(); R.cebad_left_empty = !S.cells['J7'] || S.cells['J7'].value == null;
    return R;
  });
  const want3 = {
    div0_commit: '#DIV/0!', div0_disp: '#DIV/0!', div0_errclass: true, clean_no_errclass: true,
    prop_commit: '#DIV/0!', iferror_commit: 42,
    name_commit: '#NAME?', name_closed: true,
    recalc_before: 4, recalc_errs: '#DIV/0!', recalc_heals: 4,
    pctcell_val: 0.08, plaincell_val: 8,
    lazyif_commit: 2,
    norm_formula: '=SUM(G1:G2)', norm_val: 3, norm_silent: true,
    semi_dialog: true, semi_prop: '=SUM(G1,G3)', semi_val: 4, semi_closed: true,
    trail_dialog: true, trail_prop: '=G1', trail_backedit: true, trail_redialog: true, trail_val: 1,
    commaparen_prop: '=SUM(G2)', commaparen_val: 2,
    dbleq_prop: '=G1+G2', dbleq_val: 3,
    unbal_prop: '=SUM(G1:G2)', unbal_val: 3,
    dblop_prop: '=G1*G2', dblop_val: 2,
    unary_silent: true, unary_val: 3,
    bad_editing: true, bad_left_empty: true,
    ce_dialog: true, ce_v1: 1, ce_v2: 2, ce_f2: '=G2',
    ceok_nodialog: true, ceok_f1: '=SUM(G1:G2)', ceok_v2: 5,
    cebad_editing: true, cebad_left_empty: true,
  };
  judge(got3, want3, 'H3A');

  const total = Object.keys(want).length + Object.keys(want2).length + Object.keys(want3).length;
  if (perr.length) { fail++; console.error('PAGE ERRORS: ' + perr.join(' | ')); }
  await browser.close();
  if (fail) { console.error(`\nFORMULA PACK: ${fail} failure(s)`); process.exit(1); }
  console.log('FORMULA PACK: ALL ' + total + ' PASS');
})();
