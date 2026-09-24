// Chapter 1 · 1.7.3 — Hardcode hunt (voltline-weekly, S7b → S7c, plant PLANT_AUDIT)
// The associate's marked-up copy of the Report came back with eight faults from the day-one list:
// Cedar Park's emailed figures shown black, a literal typed inside a formula, a Thursday retyped
// over its link, the title centered with spaces, the units line gone, an all-borders grid over the
// daily table with gridlines on, and the Prior week column hidden. The audit pass finds them the
// way a reviewer would — Go To Special for constants, show formulas for the number that stands out,
// the view for the rest — and fixes every one without changing anything else. The closer moves
// Cedar Park's kWh and the Total answers, as it did before the markup.
import { PLANT_AUDIT, REPORT_TITLE, UNITS_LINE, KWH, stateOf } from '../workbooks/voltline-weekly.js';

// The plant, merged over S7b's Report cells: `applyStatePatch` REPLACES a cell record, and the
// exported PLANT_AUDIT carries `{ ball: true }` alone for B15:G21, which would wipe the daily
// table's day names, dates and links at lesson start (and its grid loop overwrote the retyped
// Thursday it had just planted). Merging keeps every cell as S7b left it plus the grid, and puts
// Mueller's Thursday back as the typed number the state file meant to plant.
const S7B_REPORT = stateOf('S7b').sheets.find(x => x.name === 'Report').cells;
const PLANT = Object.fromEntries(Object.entries(PLANT_AUDIT).map(([key, patch]) => {
  if (key.startsWith('Report!#') || patch === null || !('ball' in patch)) return [key, patch];
  const ref = key.split('!')[1];
  const base = ref === 'E18' ? { value: KWH.Mueller[9], fontColor: 'green', fmtStyle: 'comma', decimals: 0 } : (S7B_REPORT[ref] || {});
  return [key, { ...base, ...patch }];
}));

const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const settled = ses => !ses.editing && !ses.dialog;
const normFormula = f => String(f || '').replace(/\s|\$/g, '').toUpperCase();

/** Go To Special was opened this goal, by the Home walk (Alt H F D S) or the Go To card's Special button (Ctrl+G Alt+S). */
const goToSpecialUsed = ses => { const w = windowKeys(ses); return w.some((k, i) => (k === 'Alt' && w[i + 1] === 'H' && w[i + 2] === 'F' && w[i + 3] === 'D' && w[i + 4] === 'S') || (k === 'Ctrl+G' && w[i + 1] === 'Alt+S')); };
/** Show Formulas is on now, or was toggled this goal. */
const formulasShown = ses => !!ses.settings.showFormulas || windowKeys(ses).includes('Ctrl+`');
const blue = (rep, ref) => rep.cellAt(ref).fontColor === 'blue';
/** Cedar Park's typed kWh and revenue read blue. */
const cedarTypedBlue = rep => blue(rep, 'C9') && blue(rep, 'D9');
/** The links stayed green and the prior-week column stayed black: only Cedar Park's typed figures were marked. */
const onlyCedarMarked = rep => ['C5', 'D5', 'E5', 'C8', 'D8', 'E8', 'C10', 'D10', 'E10'].every(ref => rep.cellAt(ref).fontColor === 'green') && ['I5', 'I6', 'I7', 'I8', 'I9', 'I10'].every(ref => !blue(rep, ref));
/** G6 divides Mueller's revenue by its kWh cell, not by a number. */
const g6Fixed = rep => normFormula(rep.formula('G6')) === '=D6/C6';
/** Mueller's Thursday E18 is the link again, green and comma 0 like the rest of the row. */
const e18Linked = rep => { const c = rep.cellAt('E18'); return normFormula(c.formula) === '=RAW!L33' && c.fontColor === 'green' && c.fmtStyle === 'comma' && (c.decimals || 0) === 0; };
const nothingHidden = rep => rep.hiddenCols.size === 0 && rep.hiddenRows.size === 0;
/** A1 holds the title exactly, no padding, and is centered across A1:I1 (ca counts the columns). */
const titleCentered = rep => rep.value('A1') === REPORT_TITLE && rep.cellAt('A1').ca === 9 && rep.cellAt('A1').bold === true;
const unitsBack = rep => rep.value('A2') === UNITS_LINE && rep.cellAt('A2').it === true;
const DAILY = []; for (const col of ['B', 'C', 'D', 'E', 'F', 'G']) for (let r = 15; r <= 21; r++) DAILY.push(col + r);
/** No border of any kind on the daily table: the grid is gone and nothing replaced it. */
const noGrid = rep => DAILY.every(ref => { const c = rep.cellAt(ref); return !c.ball && !c.bt && !c.bb && !c.bl && !c.br && !c.thick && !c.bdbl; });

export default {
  id: 'hardcode-hunt',
  chapter: 'foundations',
  section: 'Present and audit',
  module: 'present-and-audit',
  workbook: 'voltline-weekly',
  state: { before: 'S7b', after: 'S7c' },
  plant: PLANT,
  title: 'Hardcode hunt',
  difficulty: 'hard',
  tags: ['audit', 'formulas', 'report'],
  access: 'free',
  minutes: 7,
  headline: 'Ctrl+`',
  conventions: ['F3', 'B1', 'D7'],
  teaches: ['audit-pass'],
  uses: ['go-to-special', 'font-color', 'input-colour-convention', 'f4-repeat', 'show-formulas', 'pointing', 'formula-operators', 'edit-mode-f2', 'ctrl-enter-fill', 'hide-unhide', 'row-col-select', 'center-across', 'format-cells-dialog', 'bold-italic-underline', 'type-to-enter', 'borders-menu', 'gridlines', 'keytips', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow', 'ctrl-home-end', 'arrow-keys'],
  prerequisites: ['the-checks-row'],
  brief: 'The associate’s marked-up copy of the Report came back with eight faults from the day-one list, the faults a reviewer checks first, and the page goes to the buyer tonight. The audit pass finds them the way a reviewer would, with Go To Special, show formulas and your eyes on the page, and you fix every one without changing anything else. The key is Ctrl with the backtick key, `Ctrl+Backtick`.',
  goals: [
    { id: 'find-constants', teach: 'The audit pass is three looks: Go To Special for typed numbers among links, show formulas for a number in a formula row, the page for the rest.', text: 'Typed numbers hide among the links: select the figure block C5:E10, run Go To Special for Constants, and color Cedar Park’s emailed figures blue.', keys: 'Ctrl+↓ ↓ → ×2 Ctrl+Shift+↓ Shift+↑ Shift+→ ×2 then Alt H F D S O ↵ then Alt H F C → ×4 ↵', requires: ['audit-pass', 'go-to-special', 'font-color', 'input-colour-convention', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow', 'keytips', 'arrow-keys'], convention: 'F3',
      check: (s, ses) => { const rep = report(ses); return !!rep && cedarTypedBlue(rep) && onlyCedarMarked(rep) && goToSpecialUsed(ses) && settled(ses); } },
    { id: 'f4-energy', text: 'E9 multiplies the emailed kWh, so the whole Cedar Park row is marked blue until the feed carries the site: move to E9 and press F4.', keys: '→ ×2 F4', requires: ['f4-repeat', 'input-colour-convention', 'arrow-keys'], convention: 'B1',
      check: (s, ses) => { const rep = report(ses); return !!rep && cedarTypedBlue(rep) && blue(rep, 'E9') && windowKeys(ses).includes('F4') && settled(ses); } },
    { id: 'literal-in-formula', text: 'Mueller’s average price G6 divides by a typed 6850, which Ctrl+` shows at a glance: rewrite it as =D6/C6 by pointing.', keys: 'Ctrl+` Ctrl+→ ← Ctrl+↑ ↓ ×2 "=" ← ×3 "/" Ctrl+← → ×2 ↵', requires: ['show-formulas', 'pointing', 'formula-operators', 'ctrl-arrow', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && g6Fixed(rep) && formulasShown(ses) && settled(ses); } },
    { id: 'refill-thursday', text: 'In the daily table Mueller’s Thursday E18 is a number in a formula row: select B18:G18, F2 on Saturday’s link G18, Ctrl+Enter, then Ctrl+` off.', keys: 'Ctrl+↓ ×3 ↑ ×3 Ctrl+Shift+← Shift+→ F2 Ctrl+↵ then Ctrl+`', requires: ['show-formulas', 'ctrl-enter-fill', 'edit-mode-f2', 'ctrl-arrow', 'ctrl-shift-arrow', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && e18Linked(rep) && !ses.settings.showFormulas && settled(ses); } },
    { id: 'unhide-prior', text: 'Prior week rev is hidden between H and J, and a buyer who finds one hidden column looks for more: select H:J and press Ctrl+Shift+).', keys: 'Ctrl+Home ↓ ×3 Ctrl+→ ← ×3 Ctrl+Space Shift+→ Ctrl+Shift+)', requires: ['hide-unhide', 'row-col-select', 'shift-arrow', 'ctrl-arrow', 'ctrl-home-end', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && nothingHidden(rep) && settled(ses); } },
    { id: 'title-across', text: 'The title was centered by typing spaces in front of it: retype it in A1 without them, then center it across A1:I1 with Ctrl+1 then A.', keys: `Ctrl+Home "${REPORT_TITLE}" ↵ ↓ ×2 Ctrl+→ ← ×3 Ctrl+↑ Ctrl+Shift+← Ctrl+1 A`, requires: ['center-across', 'format-cells-dialog', 'type-to-enter', 'ctrl-arrow', 'ctrl-shift-arrow', 'ctrl-home-end', 'arrow-keys'], convention: 'D7',
      check: (s, ses) => { const rep = report(ses); return !!rep && titleCentered(rep) && settled(ses); } },
    { id: 'units-line', text: 'The units line is gone, so a reader cannot tell which currency the figures are in: in A2 press Ctrl+I, then type USD unless stated.', keys: 'Ctrl+← ↓ Ctrl+I "USD unless stated" ↵', requires: ['bold-italic-underline', 'type-to-enter', 'ctrl-arrow', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && unitsBack(rep) && settled(ses); } },
    { id: 'grid-off', text: 'A grid sits over the daily table with gridlines on: select B15:G21, take every border off with Alt H B N, then Alt W V G.', keys: 'Ctrl+↓ ×3 ↓ ×2 → Ctrl+Shift+↓ Ctrl+Shift+→ Alt H B N then Alt W V G', requires: ['borders-menu', 'gridlines', 'keytips', 'ctrl-arrow', 'ctrl-shift-arrow', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && noGrid(rep) && rep.gridlines === false && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Report!C9" Enter "3000" Enter Ctrl+G "Report!C11" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch Cedar Park’s kWh in C9 change to 3,000 and the Total in C11 answer: the page is clean and still live.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Cedar Park’s emailed row C9:E9 reads blue; G6 and E18 are formulas again', check: (s, ses) => { const rep = report(ses); return !!rep && cedarTypedBlue(rep) && onlyCedarMarked(rep) && blue(rep, 'E9') && g6Fixed(rep) && e18Linked(rep); } },
    { text: 'The title is centered across A1:I1, the units line is back, nothing is hidden, and the daily table has no grid', check: (s, ses) => { const rep = report(ses); return !!rep && titleCentered(rep) && unitsBack(rep) && nothingHidden(rep) && noGrid(rep) && rep.gridlines === false; } },
  ],
  closing: [
    'Eight faults found in a colleague’s file in two minutes, the way a reviewer finds them: Go To Special for the typed numbers, show formulas for the literal and the retyped Thursday, the page for the rest (F3).',
    'Cedar Park’s emailed figures now read blue, so the one row that is not a link says so (B1), and the title is centered across the page, not merged (D7).',
  ],
  solution: `Ctrl+Down Down Right Right Ctrl+Shift+Down Shift+Up Shift+Right Shift+Right Alt H F D S O Enter Alt H F C Right Right Right Right Enter Right Right F4 Ctrl+\` Ctrl+Right Left Ctrl+Up Down Down "=" Left Left Left "/" Ctrl+Left Right Right Enter Ctrl+Down Ctrl+Down Ctrl+Down Up Up Up Ctrl+Shift+Left Shift+Right F2 Ctrl+Enter Ctrl+\` Ctrl+Home Down Down Down Ctrl+Right Left Left Left Ctrl+Space Shift+Right Ctrl+Shift+) Ctrl+Home "${REPORT_TITLE}" Enter Down Down Ctrl+Right Left Left Left Ctrl+Up Ctrl+Shift+Left Ctrl+1 A Ctrl+Left Down Ctrl+I "USD unless stated" Enter Ctrl+Down Ctrl+Down Ctrl+Down Down Down Right Ctrl+Shift+Down Ctrl+Shift+Right Alt H B N Alt W V G`,
};
