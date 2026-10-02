// Chapter 2 · 2.4.2 Grouping and outline levels (clearcoat-pnl, S4a → S4b)
// The site-cost detail, rows 13:19, is grouped so it folds behind a button; folded, site costs
// read as one line at total site costs; opened again, the page is complete. The memo block, rows
// 33:35, is grouped the same way. Then a second level: rows 7:23, revenue to head office, grouped
// over the detail, so the page folds to EBITDA and opens again. The outline numbers are a click, so
// each level folds with Hide Detail (script-ch2.md, Built differently). The closer changes a cost
// line through the fold and EBITDA answers.

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
  teaches: ['outline-detail', 'outline-levels'],
  uses: ['group-ungroup', 'row-col-select', 'shift-arrow', 'ctrl-arrow', 'page-anatomy', 'go-to'],
  prerequisites: ['alignment-at-scale'],
  brief: 'The site-cost detail is seven rows a buyer wants on demand, not on the page. Group them and an outline button appears in the margin: press it and the seven rows fold to the total; press it again and they’re back. The memo block folds the same way, and groups nest: a second level over revenue to head office folds the page to its answer. The key is `Alt+Shift+→`.',
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
    { id: 'second-level', teach: 'Group rows that already hold a group and the inner one goes a level deeper: the detail is level 2, the whole block level 1, and each folds on its own.', text: 'Add a second level: select rows 7:23, retail wash revenue to head office, and group them over the detail with Alt+Shift+→.', keys: `Ctrl+G "'P&L'!A7:A23" ↵ Shift+Space Alt+Shift+→`, requires: ['outline-levels', 'group-ungroup', 'row-col-select', 'go-to'], convention: 'C7',
      hintStuck: 'pulse rows 7:23 · Everything above EBITDA, below the Revenue header.',
      check: (s, ses) => { const sh = pnl(ses); const o = sh && groupOf(sh, 7, 23), i = sh && groupOf(sh, 13, 19); return !!o && !!i && i.level === 2 && settled(ses); } },
    { id: 'fold-answer', text: 'Fold the outer level from row 7 with Hide Detail, Alt, A, H, so the P&L reads as its timeline and EBITDA.', keys: 'Alt A H', requires: ['outline-levels', 'outline-detail'], convention: 'C7',
      hintStuck: 'pulse rows 7:23 · Row 7 sits in the outer group and in no inner one.',
      check: (s, ses) => { const sh = pnl(ses); const o = sh && groupOf(sh, 7, 23); return !!o && o.collapsed && settled(ses); } },
    { id: 'show-all', text: 'Open it again with Show Detail, Alt, A, J, and every line is back.', keys: 'Alt A J', requires: ['outline-detail'], convention: 'C7',
      hintStuck: 'pulse rows 7:23 · Show Detail opens the group the cell sits in.',
      check: (s, ses) => { const sh = pnl(ses); const o = sh && groupOf(sh, 7, 23); return !!o && !o.collapsed && !groupOf(sh, 13, 19).collapsed && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "B14" Enter Alt A H Ctrl+G "C13" Enter "-4500" Enter Ctrl+G "C24" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch the detail fold, C13 change to -4500 through the fold, and C24 answer.', requires: [],
      hintStuck: 'pulse cell C24 · Folded rows still count.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The site-cost detail and the memo block are grouped, and open', check: (s, ses) => { const sh = pnl(ses); const a = sh && groupOf(sh, 13, 19), b = sh && groupOf(sh, 33, 35); return !!a && !!b && !a.collapsed && !b.collapsed; } },
    { text: 'A second level over revenue to head office, open', check: (s, ses) => { const sh = pnl(ses); const o = sh && groupOf(sh, 7, 23); return !!o && !o.collapsed && groupOf(sh, 13, 19).level === 2; } },
  ],
  closing: [
    'The page reads short and stays complete, and a button decides which.',
    'Folded one level, the P&L is its totals and its answer; folded two, it is the answer alone; opened, every line is there. A folded row still counts in every total, which is why grouping is safe where hiding is not.',
  ],
  solution: 'Right Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Space Alt+Shift+Right Alt A H Down Alt A J Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Ctrl+Down Down Shift+Down Shift+Down Shift+Space Alt+Shift+Right Ctrl+G "\'P&L\'!A7:A23" Enter Shift+Space Alt+Shift+Right Alt A H Alt A J',
};
