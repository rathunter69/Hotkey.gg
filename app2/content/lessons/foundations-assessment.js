// Foundations · Project and assessment — Assessment: the weekly report, timed
// The project rebuilt against the clock with fresh figures. No teach lines, no new concepts:
// this is proof the chapter stuck. Five minutes on the clock; the end state is what counts.
import { isLiveFormula } from '../../engine/live.js';

const RAW = {
  A1: { value: 'Raw data', bold: true },
  A2: { value: 'Day' }, B2: { value: 'Sales' }, C2: { value: 'Units' },
  A3: { value: 'Monday' }, B3: { value: 1340 }, C3: { value: 45 },
  A4: { value: 'Tuesday' }, B4: { value: 1010 }, C4: { value: 33 },
  A5: { value: 'Wednesday' }, B5: { value: 1580 }, C5: { value: 52 },
  A6: { value: 'Thursday' }, B6: { value: 990 }, C6: { value: 30 },
  A7: { value: 'Friday' }, B7: { value: 1725 }, C7: { value: 58 },
};
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const near = (v, want) => typeof v === 'number' && Math.abs(v - want) < 1e-6;
const live = (s, ref) => isLiveFormula(s, ref);

export default {
  id: 'foundations-assessment',
  chapter: 'foundations',
  section: 'Project and assessment',
  title: 'Assessment: the weekly report, timed',
  kind: 'assessment',
  timeLimit: 300,
  difficulty: 'hard',
  tags: ['assessment'],
  access: 'free',
  concepts: [],
  prerequisites: ['weekly-report-project'],
  read: 'Same report, fresh week, five minutes on the clock. The Raw sheet holds week two’s export and the Report sheet is blank: title, headers, live links, totals, Number format, borders, frozen header. You built this once slowly — now build it like it’s Monday morning.',
  sheet: { cells: {}, active: { r: 1, c: 1 } },
  sheets: [{ name: 'Report' }, { name: 'Raw', cells: RAW, active: { r: 1, c: 1 }, colW: { 1: 92 } }],
  par: 120,
  goals: [
    { id: 'title', text: 'Type Week 2 Sales Report into A1 and make it bold.', keys: '"Week 2 Sales Report" ↵ Ctrl+Home Ctrl+B', requires: ['type-to-enter', 'bold-command'], check: s => s.value('A1') === 'Week 2 Sales Report' && s.cellAt('A1').bold === true },
    { id: 'headers', text: 'Build the header row: Day in A2, Sales in B2, Units in C2, all bold.', keys: 'Ctrl+G "A2" ↵ "Day" Tab "Sales" Tab "Units" ↵ then Ctrl+G "A2:C2" ↵ Ctrl+B', requires: ['tab-commits', 'bold-command', 'go-to'], check: s => s.value('A2') === 'Day' && s.value('B2') === 'Sales' && s.value('C2') === 'Units' && ['A2', 'B2', 'C2'].every(r => s.cellAt(r).bold === true) },
    { id: 'link-days', text: 'Link the day names: enter =Raw!A3 in A3 and fill it down to A7.', keys: 'Ctrl+G "A3" ↵ "=Raw!A3" ↵ Ctrl+G "A3:A7" ↵ Ctrl+D', requires: ['cross-sheet-ref', 'fill-down-right', 'go-to'], check: s => DAYS.every((d, i) => s.value('A' + (i + 3)) === d) && live(s, 'A7') },
    { id: 'link-figures', text: 'Link the figures: enter =Raw!B3 in B3 and =Raw!C3 in C3, then fill B3:C7 down.', keys: 'Ctrl+G "B3" ↵ "=Raw!B3" Tab "=Raw!C3" ↵ Ctrl+G "B3:C7" ↵ Ctrl+D', requires: ['cross-sheet-ref', 'fill-down-right', 'go-to'], check: s => near(s.value('B3'), 1340) && near(s.value('B7'), 1725) && near(s.value('C7'), 58) && live(s, 'B7') && live(s, 'C7') },
    { id: 'totals', text: 'Type Total into A8, then select B3:C8 and AutoSum both columns at once.', keys: 'Ctrl+G "A8" ↵ "Total" ↵ Ctrl+G "B3:C8" ↵ Alt+=', requires: ['autosum', 'go-to', 'type-to-enter'], check: s => s.value('A8') === 'Total' && near(s.value('B8'), 6645) && near(s.value('C8'), 218) && live(s, 'B8') },
    { id: 'number-format', text: 'Give the Sales column B3:B8 the Number format from Ctrl+1.', keys: 'Ctrl+G "B3:B8" ↵ Ctrl+1 N', requires: ['format-cells-dialog', 'go-to'], check: s => ['B3', 'B5', 'B8'].every(r => s.cellAt(r).fmtStyle === 'comma') },
    { id: 'borders', text: 'Rule the table with All Borders on A2:C8.', keys: 'Ctrl+G "A2:C8" ↵ Alt H B A', requires: ['borders-menu', 'go-to'], check: s => ['A2', 'B5', 'C8'].every(r => s.cellAt(r).ball === true) },
    { id: 'freeze', text: 'Freeze the top row to finish the report.', keys: 'Alt W F R', requires: ['freeze-panes'], check: s => s.freeze.r === 1 },
  ],
  endState: [
    { text: 'The title is still bold', check: s => s.cellAt('A1').bold === true },
    { text: 'The headers are still bold over their borders', check: s => ['A2', 'B2', 'C2'].every(r => s.cellAt(r).bold === true) && s.cellAt('A2').ball === true },
    { text: 'The linked figures still read the Raw sheet and total 6,645', check: s => near(s.value('B3'), 1340) && near(s.value('B8'), 6645) },
    { text: 'Sales still show the Number format', check: s => s.cellAt('B5').fmtStyle === 'comma' },
  ],
  closing: ['Under the clock the shape is what saves you: links first, totals next, formats last. That order never changes, however big the report gets.'],
  solution: '"Week 2 Sales Report" Enter Ctrl+Home Ctrl+B Ctrl+G "A2" Enter "Day" Tab "Sales" Tab "Units" Enter Ctrl+G "A2:C2" Enter Ctrl+B Ctrl+G "A3" Enter "=Raw!A3" Enter Ctrl+G "A3:A7" Enter Ctrl+D Ctrl+G "B3" Enter "=Raw!B3" Tab "=Raw!C3" Enter Ctrl+G "B3:C7" Enter Ctrl+D Ctrl+G "A8" Enter "Total" Enter Ctrl+G "B3:C8" Enter Alt+= Ctrl+G "B3:B8" Enter Ctrl+1 N Ctrl+G "A2:C8" Enter Alt H B A Alt W F R',
};
