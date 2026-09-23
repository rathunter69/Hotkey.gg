// app2/content/workbooks/index.js — the module-workbook registry: workbook id → its states.
// The runner and the schema resolve `lesson.module` + `lesson.state.before` through this.
import * as voltlineWeekly from './voltline-weekly.js';

export const WORKBOOKS = {
  'voltline-weekly': voltlineWeekly,
};

/** The named state of a workbook, deep-cloned; throws on an unknown workbook or state. */
export function workbookState(workbookId, stateId) {
  const wb = WORKBOOKS[workbookId];
  if (!wb) throw new Error('unknown workbook ' + workbookId);
  return wb.stateOf(stateId);
}
