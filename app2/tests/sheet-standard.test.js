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
import { sheetStandard } from '../app/graders.js';

// Built before the standard existed and rebuilt on it in run R1 (the Clearcoat re-skin and the
// drills moved onto the skeleton, M108). This list only shrinks; R1 is not done until it is empty.
const PENDING_WORKBOOKS = new Set(['voltline-weekly', 'voltline-pnl']);
const PENDING_DRILLS = new Set(['bold-and-borders', 'edge-jumps', 'fill-factory', 'find-and-fix', 'format-cells-numbers',
  'formula-sprint', 'go-anywhere', 'paste-surgeon', 'row-wrangler', 'select-blocks', 'type-the-column', 'weekly-sales-report']);

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
    for (const [stateId, name, opts = {}] of wb.STANDARD.pages) {
      const st = wb.stateOf(stateId);
      const spec = st.sheets.find(s => s.name === name);
      assert.ok(spec, `${id} ${stateId} has a sheet ${name}`);
      const out = sheetStandard(new Sheet(spec), { chapter: wb.CHAPTER || 1, read: opts.read !== false });
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
    }
  }
});
