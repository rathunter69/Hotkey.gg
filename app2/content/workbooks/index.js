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

/**
 * Apply a seed's patch to a (cloned) state in place: `{ 'Sheet!B4': cellRecord | null, … }` writes
 * or clears cells (a key with no sheet names the first sheet), and `'Sheet!#colW'`, `'#rowH'`,
 * `'#hiddenCols'`, `'#hiddenRows'`, `'#freeze'`, `'#groups'`, `'#gridlines'`, `'#active'` set that
 * sheet's structure. Unknown sheets are skipped. Returns the state.
 */
export function applyStatePatch(state, patch) {
  for (const key in patch || {}) {
    const [shName, ref] = key.includes('!') ? key.split('!') : [state.sheets[0].name, key];
    const sh = state.sheets.find(x => x.name === shName);
    if (!sh) continue;
    if (ref.startsWith('#')) { const prop = ref.slice(1); if (patch[key] === null) delete sh[prop]; else sh[prop] = patch[key]; continue; }
    sh.cells = sh.cells || {};
    if (patch[key] === null) delete sh.cells[ref]; else sh.cells[ref] = patch[key];
  }
  return state;
}
