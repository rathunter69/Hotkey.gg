// Chapter 1 · 1.6.1 — Point, don't type (voltline-weekly, S5d → S6a)
// The Report holds this week's kWh, revenue and energy cost for six sites; the three calculated
// lines beside them (gross profit, average price per kWh, margin) are built for Domain by pointing:
// = then the arrow keys write each reference, an operator joins them, Enter commits. One formula is
// read back with F2 so the learner sees its precedents lit, then the three are filled down the six
// sites in one press. The fill carries Domain's $ format down the gross-profit column, so the last
// goal puts comma style back on F6:F10 ($ belongs to the first and total rows only). The closer
// perturbs Domain's kWh and its average price answers.
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const settled = ses => !ses.editing && !ses.dialog;
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const near = (a, b) => isNum(a) && isNum(b) && Math.abs(a - b) < 1e-6;
const normFormula = f => String(f || '').replace(/\s|\$/g, '').toUpperCase();

const SITE_ROWS = [5, 6, 7, 8, 9, 10];   // Domain … Airport; the total row is 11
/** The three calculated lines for row r: gross profit = revenue − energy cost, avg price = revenue ÷ kWh, margin = gross profit ÷ revenue. */
const LINES = r => ({ F: `=D${r}-E${r}`, G: `=D${r}/C${r}`, H: `=F${r}/D${r}` });
/** `ref` holds exactly `formula` (spacing and $ ignored) and shows a finite number. */
const holds = (sh, ref, formula) => normFormula(sh.formula(ref)) === formula && isNum(sh.value(ref));
/** Row r carries all three lines and each reads the figure its inputs give. */
const rowLive = (sh, r) => {
  const want = LINES(r);
  if (!['F', 'G', 'H'].every(col => holds(sh, col + r, want[col]))) return false;
  const c = sh.value('C' + r), d = sh.value('D' + r), e = sh.value('E' + r);
  return near(sh.value('F' + r), d - e) && near(sh.value('G' + r), d / c) && near(sh.value('H' + r), (d - e) / d);
};
const fmtIs = (sh, refs, style, dec) => refs.every(ref => { const c = sh.cellAt(ref); return c.fmtStyle === style && (c.decimals | 0) === dec; });
const FILLED = ['F6', 'F7', 'F8', 'F9', 'F10'];   // the gross-profit cells under Domain's

export default {
  id: 'point-dont-type',
  chapter: 'foundations',
  section: 'Formulas',
  module: 'formulas',
  workbook: 'voltline-weekly',
  state: { before: 'S5d', after: 'S6a' },
  title: 'Point, don’t type',
  difficulty: 'medium',
  tags: ['formulas', 'pointing', 'report'],
  access: 'free',
  minutes: 6,
  headline: '=',
  conventions: ['E1', 'D4'],
  teaches: ['formula-basics', 'formula-operators', 'pointing'],
  uses: ['edit-mode-f2', 'escape-cancels', 'fill-down-right', 'number-formats', 'format-cells-dialog', 'arrow-keys', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow', 'ctrl-home-end'],
  prerequisites: ['the-style-pass'],
  brief: 'The Report holds this week’s kWh, revenue and energy cost for six sites, and the associate, the colleague who checks your page, wants three calculated lines beside them: gross profit, the average price per kWh and the margin. You build each one by pointing at the cells with the arrow keys, then fill the three formulas down the six sites in one press. The key is `=`.',
  goals: [
    { id: 'gross-profit', teach: 'A formula starts with = and recalculates when its inputs change; while it is open, each arrow key points at a cell and writes its reference for you.', text: 'Domain’s gross profit is revenue less energy cost: build =D5-E5 in F5 by pointing at the two cells with the arrow keys, not typing them.', keys: 'Ctrl+Home Ctrl+→ → "=" ← ×2 "-" ← ↵', requires: ['formula-basics', 'formula-operators', 'pointing', 'ctrl-home-end', 'ctrl-arrow', 'arrow-keys'], convention: 'E1',
      check: (s, ses) => { const sh = report(ses); return !!sh && holds(sh, 'F5', '=D5-E5') && near(sh.value('F5'), sh.value('D5') - sh.value('E5')) && settled(ses); } },
    { id: 'avg-price', text: 'Domain’s average price is revenue divided by kWh: build =D5/C5 in G5 by pointing, jumping the pointer across the row with Ctrl+Left.', keys: '↑ → "=" ← ×3 "/" Ctrl+← ×2 → ×2 ↵', requires: ['formula-operators', 'pointing', 'ctrl-arrow', 'arrow-keys'],
      check: (s, ses) => { const sh = report(ses); return !!sh && holds(sh, 'G5', '=D5/C5') && near(sh.value('G5'), sh.value('D5') / sh.value('C5')) && settled(ses); } },
    { id: 'margin', text: 'Domain’s margin is gross profit divided by revenue: build =F5/D5 in H5 the same way, with a Ctrl+Left jump to reach D5.', keys: '↑ → "=" ← ×2 "/" Ctrl+← ×2 → ×3 ↵', requires: ['formula-operators', 'pointing', 'ctrl-arrow', 'arrow-keys'],
      check: (s, ses) => { const sh = report(ses); return !!sh && holds(sh, 'H5', '=F5/D5') && near(sh.value('H5'), sh.value('F5') / sh.value('D5')) && settled(ses); } },
    { id: 'read-back', text: 'Read one back before you trust it: open F5 with F2 so its inputs D5 and E5 light up in color, then leave it unchanged.', keys: '↑ ← ×2 F2 Esc', requires: ['edit-mode-f2', 'escape-cancels', 'arrow-keys'],
      check: (s, ses) => { const sh = report(ses); return !!sh && holds(sh, 'F5', '=D5-E5') && ses.keyLog.slice(ses.goalMark || 0).some(e => e.k === 'F2' && e.cell === 'F5') && settled(ses); } },
    { id: 'fill-down', text: 'Five sites still have no calculated lines: select F5:H10 with Domain’s three formulas at the top and fill them down with Ctrl+D.', keys: 'Shift+→ ×2 Shift+↓ ×5 Ctrl+D', requires: ['fill-down-right', 'shift-arrow'],
      check: (s, ses) => { const sh = report(ses); return !!sh && SITE_ROWS.every(r => rowLive(sh, r)) && settled(ses); } },
    { id: 'dollar-back', text: 'The fill carried Domain’s $ sign down the gross-profit column: put F6:F10, and only those, back in comma style with no decimals.', keys: '↓ Ctrl+Shift+↓ Ctrl+1 N', requires: ['number-formats', 'format-cells-dialog', 'ctrl-shift-arrow', 'arrow-keys'], convention: 'D4',
      check: (s, ses) => { const sh = report(ses); return !!sh && fmtIs(sh, FILLED, 'comma', 0) && fmtIs(sh, ['F5'], 'currency', 0) && SITE_ROWS.every(r => rowLive(sh, r)) && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Report!C5" Enter "3000" Enter Ctrl+G "Report!G5" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch Domain’s kWh in C5 change to 3,000 and its average price in G5 answer.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'F5:H10 hold gross profit, average price and margin as live formulas, one pattern down every site', check: (s, ses) => { const sh = report(ses); return !!sh && SITE_ROWS.every(r => rowLive(sh, r)); } },
    { text: 'F5 carries the $ and F6:F10 read in comma style', check: (s, ses) => { const sh = report(ses); return !!sh && fmtIs(sh, ['F5'], 'currency', 0) && fmtIs(sh, FILLED, 'comma', 0); } },
  ],
  closing: [
    'Every calculated line on the Report was built by pointing, never by typing a reference: = then the arrow keys wrote D5 and E5 for you, and F2 showed them lit in color when you read it back (E1).',
    'One row of three formulas, filled down six sites in one press; the $ stays on the first and total rows only (D4), and Domain’s average price answers the moment its kWh changes.',
  ],
  solution: 'Ctrl+Home Ctrl+Right Right "=" Left Left "-" Left Enter Up Right "=" Left Left Left "/" Ctrl+Left Ctrl+Left Right Right Enter Up Right "=" Left Left "/" Ctrl+Left Ctrl+Left Right Right Right Enter Up Left Left F2 Escape Shift+Right Shift+Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+D Down Ctrl+Shift+Down Ctrl+1 N',
};
