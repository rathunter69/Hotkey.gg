// Chapter 2 · 2.4.2 Grouping and outline levels (clearcoat-pnl, S4a → S4b)
// The site-cost detail, rows 13:19, is grouped so it folds behind a button; folded, site costs
// read as one line at total site costs; opened again, the page is complete. The memo block, rows
// 33:35, is grouped the same way. The engine's outline has one level, so the second level and
// the outline numbers wait (script-ch2.md, Built differently). The closer changes a cost line
// through the fold and EBITDA answers.

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const activeName = ses => ses.sheets[ses.sheetIndex].name;
const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
const groupOf = (sh, r1, r2) => ((sh.groups && sh.groups.rows) || []).find(g => g.r1 === r1 && g.r2 === r2) || null;

export default {
  id: 'grouping-and-outline-levels',
  chapter: 'formatting',
  section: 'Alignment and structure',
  module: 'alignment-and-structure',
  workbook: 'clearcoat-pnl',
  state: { before: 'S4a', after: 'S4b' },
  title: 'Grouping and outline levels',
  difficulty: 'medium',
  tags: ['structure', 'outline', 'pnl'],
  access: 'paid',
  minutes: 5,
  headline: 'Alt+Shift+→',
  conventions: ['C7'],
  teaches: ['outline-detail'],
  uses: ['group-ungroup', 'row-col-select', 'shift-arrow', 'ctrl-arrow', 'page-anatomy'],
  prerequisites: ['alignment-at-scale'],
  brief: 'The site-cost detail is seven rows a buyer wants on demand, not on the page. Group them and an outline button appears in the margin: press it and the seven rows fold to the total; press it again and they’re back. The memo block folds the same way, so the page reads short and stays complete. The key is `Alt+Shift+→`.',
  goals: [
    { id: 'group-costs', teach: 'A group puts a button in the margin that folds its rows away and brings them back, and the rows never stop being there. Select the rows whole with Shift+Space and group them with Alt+Shift+→.', text: 'Select rows 13:19 whole, chemicals and water to marketing, and group them with Alt+Shift+→.', keys: '→ Ctrl+↓ ×4 ↓ Shift+↓ ×6 Shift+Space Alt+Shift+→', requires: ['group-ungroup', 'row-col-select', 'shift-arrow', 'ctrl-arrow'], convention: 'C7',
      hintStuck: 'pulse rows 13:19 · The detail stops above total site costs.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && !!groupOf(sh, 13, 19) && settled(ses); } },
    { id: 'fold', teach: 'Hide Detail (Alt, A, H) folds the group the active cell sits in; Show Detail (Alt, A, J) opens it again. The outline button in the margin does the same with one click.', text: 'Fold the detail with Hide Detail, Alt, A, H.', keys: 'Alt A H', requires: ['outline-detail'], convention: 'C7',
      hintStuck: 'pulse rows 13:19 · The active cell is inside the group.',
      check: (s, ses) => { const sh = pnl(ses); const g = sh && groupOf(sh, 13, 19); return !!g && g.collapsed && settled(ses); } },
    { id: 'read-folded', text: 'Land on total site costs in B20 and read the page: site costs are one line now.', keys: '↓', requires: ['page-anatomy'],
      hintStuck: 'pulse cell B20 · The total stays when its lines fold.',
      check: (s, ses) => { const sh = pnl(ses); const g = sh && groupOf(sh, 13, 19); return !!g && g.collapsed && activeName(ses) === 'P&L' && sh.selectionText() === 'B20' && settled(ses); } },
    { id: 'show', text: 'Open the rows back up from the total with Show Detail, Alt, A, J.', keys: 'Alt A J', requires: ['outline-detail'], convention: 'C7',
      hintStuck: 'pulse cell B20 · Show Detail works from the row under the group.',
      check: (s, ses) => { const sh = pnl(ses); const g = sh && groupOf(sh, 13, 19); return !!g && !g.collapsed && settled(ses); } },
    { id: 'group-memo', text: 'Group the memo block, rows 33:35, the same way, so sites, washes and revenue per wash fold behind their own button.', keys: 'Ctrl+↓ ×5 ↓ Shift+↓ ×2 Shift+Space Alt+Shift+→', requires: ['group-ungroup', 'row-col-select', 'ctrl-arrow', 'shift-arrow'], convention: 'C7',
      hintStuck: 'pulse rows 33:35 · The three lines under the Memo header.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && !!groupOf(sh, 33, 35) && !groupOf(sh, 13, 19).collapsed && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "B14" Enter Alt A H Ctrl+G "C13" Enter "-4500" Enter Ctrl+G "C24" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch the detail fold, C13 change to -4500 through the fold, and C24 answer.', requires: [],
      hintStuck: 'pulse cell C24 · Folded rows still count.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The site-cost detail and the memo block are grouped, and open', check: (s, ses) => { const sh = pnl(ses); const a = sh && groupOf(sh, 13, 19), b = sh && groupOf(sh, 33, 35); return !!a && !!b && !a.collapsed && !b.collapsed; } },
  ],
  closing: [
    'The page reads short and stays complete, and a button decides which.',
    'Folded, the P&L is its totals and its answer; opened, every line is there. A folded row still counts in every total, which is why grouping is safe where hiding is not.',
  ],
  solution: 'Right Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Space Alt+Shift+Right Alt A H Down Alt A J Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Down Shift+Down Shift+Down Shift+Space Alt+Shift+Right',
};
