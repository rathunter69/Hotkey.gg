// app2/tests/known-drift.js — content whose stored solution no longer replays because the engine
// became more Excel-faithful (run R1: M64 Format Cells, M66 dialog tabs, M67 Series). The content
// is being rewritten by the content thread (Clearcoat, run R1); until each piece is rewritten its
// replay tests are skipped here, by id, with the reason. Remove an id as soon as its content lands.
//
//   picker      the old Ctrl+1 quick picker (Ctrl+1 N / C / D / P / A / U) is gone: Ctrl+1 opens
//               Excel's Format Cells on its tab row (M64, M66)
//   number      Ctrl+Shift+1 writes Excel's #,##0.00 and Alt H K Excel's Comma Style code, not the
//               old 'comma' style (M64)
//   series      Alt H F I S Enter fills Linear, which leaves day names alone (M67)
//   pagesetup   Page Setup opens on its row of tabs; a bare F is no longer Fit to, Alt+H does nothing (M66)

export const DRIFT_LESSONS = new Map(Object.entries({
  'find-replace-timeline': 'series', 'challenge-complete-the-feed': 'series',
  'numbers-a-banker-can-read': 'picker', 'alignment-and-titles': 'picker', 'the-style-pass': 'picker',
  'challenge-to-standard-in-three-minutes': 'picker', 'point-dont-type': 'picker', 'sum-family-and-autosum': 'number',
  'anchors-dollar-and-f4': 'number', 'fit-to-one-page': 'pagesetup', 'the-checks-row': 'number', 'hardcode-hunt': 'picker',
  'challenge-audit-before-you-send': 'picker', 'weekly-kpi-project': 'picker', 'foundations-assessment': 'picker',
  'built-in-formats-on-a-pnl': 'picker', 'dates-on-the-timeline': 'picker', 'challenge-format-the-numbers': 'picker',
  'the-four-section-format': 'picker', 'units-in-the-format': 'picker', 'dynamic-headers-with-text': 'picker',
  'conditional-codes-and-hidden-zeros': 'picker', 'challenge-house-format-set': 'picker', 'remix-format-on-the-pnl': 'picker',
}));
export const DRIFT_DRILLS = new Map(Object.entries({ 'format-cells-numbers': 'picker', 'weekly-sales-report': 'picker' }));
export const DRIFT_MICRO = new Map(Object.entries({ 'fill-series': 'series', 'number-formats': 'picker', 'center-across': 'picker', 'f4-repeat': 'picker' }));
/** node:test's skip option for an id: false, or the reason. */
export const driftSkip = (map, id) => (map.has(id) ? 'known drift (' + map.get(id) + '): content awaits its rewrite' : false);
