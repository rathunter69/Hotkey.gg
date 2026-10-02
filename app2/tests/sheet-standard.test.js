// app2/tests/sheet-standard.test.js — the whole-sheet audit (screenplay section 5, "The sheet
// standard"; M86). Every finished page a workbook declares and every drill's solved sheet passes
// sheetStandard() unless it is a named exception (a raw export, an inherited sheet, a start state
// whose job is the standard). Nothing is off the standard by accident.
//
// A workbook declares its pages as `export const STANDARD = { pages: [[stateId, sheetName, { read }]],
// off: { sheetName: reason } }`. A drill names any sheet that is off the standard in `offStandard`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WORKBOOKS } from '../content/workbooks/index.js';
import { DRILLS } from '../content/drills.js';
import { LessonRun } from '../app/runner.js';
import { Sheet } from '../engine/sheet.js';
import { Session } from '../engine/keyboard.js';
import { sheetStandard } from '../app/graders.js';
import { parseRef } from '../engine/refs.js';

// Built before the standard existed and rebuilt on it in run R1 (the Clearcoat re-skin and the
// drills moved onto the skeleton, M108). This list only shrinks; R1 is not done until it is empty.
const PENDING_WORKBOOKS = new Set();   // emptied by run R1: the Voltline workbook is retired, Clearcoat declares its pages
const PENDING_DRILLS = new Set();   // emptied by M108: every Chapter 1 drill is built on the skeleton

const chapterOf = ch => ch === 'foundations' || ch === 1 ? 1 : (typeof ch === 'number' ? ch : 2);

test('the pending lists only name things that still exist', () => {
  for (const id of PENDING_WORKBOOKS) assert.ok(WORKBOOKS[id], `${id} is gone: take it off PENDING_WORKBOOKS`);
  const ids = new Set(DRILLS.map(d => d.id));
  for (const id of PENDING_DRILLS) assert.ok(ids.has(id), `${id} is gone: take it off PENDING_DRILLS`);
});

test('every workbook declares its finished pages, and each one is to standard', () => {
  for (const [id, wb] of Object.entries(WORKBOOKS)) {
    if (PENDING_WORKBOOKS.has(id)) continue;
    assert.ok(wb.STANDARD && Array.isArray(wb.STANDARD.pages) && wb.STANDARD.pages.length, `${id} declares STANDARD.pages`);
    const sessions = new Map();   // one live workbook per state: several pages share a state
    for (const [stateId, name, opts = {}] of wb.STANDARD.pages) {
      const st = wb.stateOf(stateId);
      const spec = st.sheets.find(s => s.name === name);
      assert.ok(spec, `${id} ${stateId} has a sheet ${name}`);
      // the whole workbook, so a page's links to other sheets (a title from Inputs, a summary of the P&L) read their values
      if (!sessions.has(stateId)) {
        const build = sp => new Sheet({ cells: structuredClone(sp.cells || {}), colW: sp.colW, rowH: sp.rowH, hiddenRows: sp.hiddenRows, hiddenCols: sp.hiddenCols, freeze: sp.freeze, gridlines: sp.gridlines, groups: sp.groups, condFmt: sp.condFmt });
        const ses = new Session(build(st.sheets[0]), { now: () => 0 });
        ses.sheets[0].name = st.sheets[0].name;
        for (const sh of st.sheets.slice(1)) ses.addSheet(sh.name, build(sh), undefined, { recalc: false });
        const set = st.settings || {};   // as the runner assembles it: a model that carries a circle iterates
        Object.assign(ses.settings, { iterative: !!set.iterative, maxIterations: set.maxIterations || 100, maxChange: set.maxChange == null ? 0.001 : set.maxChange });
        if (st.names && Object.keys(st.names).length) ses.names = st.names; else ses.recalcAll();   // the names setter recalculates the workbook
        sessions.set(stateId, ses);
      }
      const ses = sessions.get(stateId);
      const out = sheetStandard(ses.sheets.find(e => e.name === name).sheet, { chapter: wb.CHAPTER || 1, read: opts.read !== false });
      assert.deepEqual(out, [], `${id} ${stateId} ${name}`);
    }
    // every sheet of the workbook is either a page or a named exception
    const last = wb.stateOf(wb.STANDARD.pages[wb.STANDARD.pages.length - 1][0]);
    const pages = new Set(wb.STANDARD.pages.map(p => p[1]));
    for (const s of last.sheets) assert.ok(pages.has(s.name) || (wb.STANDARD.off && wb.STANDARD.off[s.name]), `${id}: ${s.name} is neither a page nor a named exception`);
  }
});

test("every drill's solved sheet is to standard", () => {
  for (const d of DRILLS) {
    if (d.kind === 'challenge' || PENDING_DRILLS.has(d.id)) continue;
    const run = new LessonRun(d, { mode: 'timed' });
    run.run(d.solution);
    for (const { name, sheet } of run.session.sheets) {
      if (d.offStandard && d.offStandard[name]) continue;
      assert.deepEqual(sheetStandard(sheet, { chapter: chapterOf(d.chapter), read: !(d.working) }), [], `${d.id} ${name}`);
      // a drill tab runs 5 to 40 rows by 5 to 11 columns (screenplay 5, "Drill sheets")
      let rows = 0, cols = 0;
      for (const k in sheet.cells) { const c = sheet.cells[k]; if (c.value == null && c.formula == null) continue; const p = parseRef(k); rows = Math.max(rows, p.r); cols = Math.max(cols, p.c); }
      assert.ok(rows >= 5 && rows <= 40 && cols >= 5 && cols <= 11, `${d.id} ${name}: ${rows} rows by ${cols} columns, a drill tab is 5 to 40 by 5 to 11`);
    }
  }
});
