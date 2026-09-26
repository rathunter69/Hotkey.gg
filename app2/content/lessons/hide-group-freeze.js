// Chapter 1 · 1.4.3 — Hide, group, freeze (voltline-weekly, S4b → S4c)
// The Report's two working columns (Energy cost, Gross profit) get hidden the way most people hide
// things, then unhidden and grouped instead: a hidden column vanishes and gets forgotten, a grouped
// one shows an outline button and folds away when the reader wants the page clean. Then the heads —
// title, units line, header row and the site column — are frozen at B5 so the page scrolls without
// losing them. Nothing on the sheet changes but its structure; the totals still tie at the end.
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const report = ses => { const e = ses.sheets.find(x => x.name === 'Report'); return e ? e.sheet : null; };

const WORKING = { c1: 5, c2: 6 };   // E:F — Energy cost ($) and Gross profit ($)
/** Exactly the two working columns are hidden. */
const workingHidden = sh => sh.hiddenCols.size === 2 && sh.hiddenCols.has(WORKING.c1) && sh.hiddenCols.has(WORKING.c2);
const nothingHidden = sh => sh.hiddenCols.size === 0 && sh.hiddenRows.size === 0;
/** One column outline over E:F, folded or not as asked, no row outline, and nothing hidden (C7: grouped, never hidden). */
const workingGrouped = (sh, collapsed) => {
  const g = sh.groups || { rows: [], cols: [] };
  return g.cols.length === 1 && g.cols[0].c1 === WORKING.c1 && g.cols[0].c2 === WORKING.c2 && g.cols[0].collapsed === collapsed
    && g.rows.length === 0 && nothingHidden(sh);
};
/** The chord, or the Ribbon's Data › Group › Group… walk (Alt A G G), which reaches the same state. */
const grouped = ses => { const k = windowKeys(ses); return k.includes('Alt+Shift+→') || k.join(' ').includes('Alt A G G'); };
const frozenAt = (sh, r, c) => !!sh.freeze && sh.freeze.r === r && sh.freeze.c === c;

export default {
  id: 'hide-group-freeze',
  chapter: 'foundations',
  section: 'Structure',
  module: 'structure',
  workbook: 'voltline-weekly',
  state: { before: 'S4b', after: 'S4c' },
  title: 'Hide, group, freeze',
  difficulty: 'medium',
  tags: ['structure', 'view', 'report'],
  access: 'free',
  minutes: 6,
  headline: 'Alt+Shift+→',
  conventions: ['C7', 'C8'],
  teaches: ['hide-unhide', 'group-ungroup', 'freeze-panes'],
  uses: ['row-col-select', 'shift-arrow', 'ctrl-arrow', 'ctrl-home-end'],
  prerequisites: ['widths-heights-autofit'],
  brief: 'The Report’s Energy cost and Gross profit columns are workings the reader does not need, and a buyer’s analyst who finds a hidden column will wonder what else is hidden. Hide them the way most people do, then unhide them and group them instead, and freeze the heads so the page scrolls without losing them. The key is `Alt+Shift+→`.',
  goals: [
    { id: 'hide', teach: 'Ctrl+0 hides the selected columns and Ctrl+9 the rows; Ctrl+Shift+) and Ctrl+Shift+( unhide whatever is hidden inside the selection.', text: 'Energy cost and Gross profit are working columns: select the whole of E:F from the header row and hide them with Ctrl+0.', keys: 'Ctrl+Home ↓ ×3 Ctrl+→ ← ×3 Ctrl+Space Shift+← Ctrl+0', requires: ['hide-unhide', 'row-col-select', 'shift-arrow', 'ctrl-arrow', 'ctrl-home-end'],
      check: (s, ses) => { const sh = report(ses); return !!sh && workingHidden(sh); } },
    { id: 'unhide', text: 'A buyer’s analyst will find a hidden column and wonder what else is hidden: select D:G across the gap and unhide with Ctrl+Shift+).', keys: '→ Ctrl+Space Shift+← Ctrl+Shift+)', requires: ['hide-unhide', 'row-col-select', 'shift-arrow'],
      check: (s, ses) => { const sh = report(ses); return !!sh && nothingHidden(sh); } },
    { id: 'rows-at-scale', text: 'Rows hide the same way: select the whole daily table, rows 13:21, hide them with Ctrl+9, then bring them back with Ctrl+Shift+(.', keys: 'Ctrl+Home Ctrl+↓ ×5 Ctrl+Shift+↑ Shift+Space Ctrl+9 then Ctrl+Shift+(', requires: ['hide-unhide', 'row-col-select', 'ctrl-shift-arrow', 'ctrl-arrow', 'ctrl-home-end'],
      check: (s, ses) => { const sh = report(ses); return !!sh && nothingHidden(sh) && windowKeys(ses).includes('Ctrl+9') && windowKeys(ses).includes('Ctrl+Shift+('); } },
    { id: 'group', teach: 'Alt+Shift+→ groups the selected whole columns or rows into an outline with a button to fold and unfold; Alt+Shift+← ungroups them.', text: 'Group, don’t hide: select the whole of E:F again and group the two working columns with Alt+Shift+→.', keys: 'Ctrl+Home ↓ ×3 Ctrl+→ ← ×3 Ctrl+Space Shift+← Alt+Shift+→', requires: ['group-ungroup', 'row-col-select', 'shift-arrow'], convention: 'C7',
      check: (s, ses) => { const sh = report(ses); return !!sh && workingGrouped(sh, false) && grouped(ses); } },
    { id: 'fold', text: 'Fold the group with Hide Detail, Alt A H: the two columns tuck behind an outline button instead of vanishing.', keys: 'Alt A H', requires: ['group-ungroup'],
      check: (s, ses) => { const sh = report(ses); return !!sh && workingGrouped(sh, true); } },
    { id: 'unfold', text: 'Unfold it with Show Detail, Alt A J: the workings are there when a reader wants them, and the group stays.', keys: 'Alt A J', requires: ['group-ungroup'],
      check: (s, ses) => { const sh = report(ses); return !!sh && workingGrouped(sh, false); } },
    { id: 'freeze', teach: 'Freeze Panes (Alt W F F) pins every row above and every column left of the active cell so they stay in view as the sheet scrolls.', text: 'The title, units, header row and site column must stay in view: land on B5 and freeze panes there with Alt W F F.', keys: 'Ctrl+Home → ↵ ×4 Alt W F F', requires: ['freeze-panes', 'ctrl-home-end'], convention: 'C8',
      check: (s, ses) => { const sh = report(ses); return !!sh && frozenAt(sh, 4, 1); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Report!C9" Enter "3000" Enter Ctrl+G "Report!C11" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch Cedar Park’s kWh in C9 change to 3,000 and the Total in C11 answer, with the heads frozen in place.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'E:F are grouped and unfolded, and nothing on the Report is hidden', check: (s, ses) => { const sh = report(ses); return !!sh && workingGrouped(sh, false); } },
    { text: 'The panes are frozen at B5', check: (s, ses) => { const sh = report(ses); return !!sh && frozenAt(sh, 4, 1); } },
  ],
  closing: [
    'The two working columns are grouped, not hidden: a hidden column vanishes and gets forgotten, a grouped one shows its button and folds away when the reader wants the page clean (C7).',
    'The title, units, header row and site labels are frozen at B5, so the Report scrolls without losing its heads (C8) — and Cedar Park’s kWh still moves the Total.',
  ],
  solution: 'Ctrl+Home Down Down Down Ctrl+Right Left Left Left Ctrl+Space Shift+Left Ctrl+0 Right Ctrl+Space Shift+Left Ctrl+Shift+) Ctrl+Home Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Shift+Up Shift+Space Ctrl+9 Ctrl+Shift+( Ctrl+Home Down Down Down Ctrl+Right Left Left Left Ctrl+Space Shift+Left Alt+Shift+Right Alt A H Alt A J Ctrl+Home Right Enter Enter Enter Enter Alt W F F',
};
