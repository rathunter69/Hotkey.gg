// Foundations · Project and assessment — Project: the weekly report
// Chapter 1's capstone: raw numbers on one sheet, a clean formatted report built on another,
// using everything the chapter taught. No new concepts; goals carry no teach lines.
import { isLiveFormula } from '../../engine/live.js';

const RAW = {
  A1: { value: 'Raw data', bold: true },
  A2: { value: 'Day' }, B2: { value: 'Sales' }, C2: { value: 'Units' },
  A3: { value: 'Monday' }, B3: { value: 1200 }, C3: { value: 40 },
  A4: { value: 'Tuesday' }, B4: { value: 950 }, C4: { value: 31 },
  A5: { value: 'Wednesday' }, B5: { value: 1430 }, C5: { value: 47 },
  A6: { value: 'Thursday' }, B6: { value: 1100 }, C6: { value: 36 },
  A7: { value: 'Friday' }, B7: { value: 1675 }, C7: { value: 55 },
};
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const near = (v, want) => typeof v === 'number' && Math.abs(v - want) < 1e-6;
const live = (s, ref) => isLiveFormula(s, ref);

export default {
  id: 'weekly-report-project',
  chapter: 'foundations',
  section: 'Project and assessment',
  title: 'Project: the weekly report',
  kind: 'project',
  difficulty: 'medium',
  tags: ['project'],
  access: 'free',
  concepts: [],
  prerequisites: ['fill-series', 'hide-freeze'],
  read: 'The Raw sheet holds an export; the Report sheet is blank. Build the weekly report on it end to end: title, headers, live links to the raw numbers, totals, formats, borders and a frozen header. This is the whole chapter on one page — take your time, everything is graded on the end state.',
  sheet: { cells: {}, active: { r: 1, c: 1 } },
  sheets: [{ name: 'Report' }, { name: 'Raw', cells: RAW, active: { r: 1, c: 1 }, colW: { 1: 92 } }],
  par: 150,
  goals: [
    { id: 'title', text: 'Type Weekly Sales Report into A1 and make it bold.', keys: '"Weekly Sales Report" ↵ Ctrl+Home Ctrl+B', requires: ['type-to-enter', 'bold-command'], check: s => s.value('A1') === 'Weekly Sales Report' && s.cellAt('A1').bold === true },
    { id: 'headers', text: 'Build the header row: Day in A2, Sales in B2, Units in C2, all bold.', keys: 'Ctrl+G "A2" ↵ "Day" Tab "Sales" Tab "Units" ↵ then Ctrl+G "A2:C2" ↵ Ctrl+B', requires: ['tab-commits', 'bold-command', 'go-to'], check: s => s.value('A2') === 'Day' && s.value('B2') === 'Sales' && s.value('C2') === 'Units' && ['A2', 'B2', 'C2'].every(r => s.cellAt(r).bold === true) },
    { id: 'link-days', text: 'Link the day names: enter =Raw!A3 in A3 and fill it down to A7.', keys: 'Ctrl+G "A3" ↵ "=Raw!A3" ↵ Ctrl+G "A3:A7" ↵ Ctrl+D', requires: ['cross-sheet-ref', 'fill-down-right', 'go-to'], check: s => DAYS.every((d, i) => s.value('A' + (i + 3)) === d) && live(s, 'A7') },
    { id: 'link-figures', text: 'Link the figures: enter =Raw!B3 in B3 and =Raw!C3 in C3, then fill B3:C7 down.', keys: 'Ctrl+G "B3" ↵ "=Raw!B3" Tab "=Raw!C3" ↵ Ctrl+G "B3:C7" ↵ Ctrl+D', requires: ['cross-sheet-ref', 'fill-down-right', 'go-to'], check: s => near(s.value('B3'), 1200) && near(s.value('C7'), 55) && near(s.value('B7'), 1675) && live(s, 'B7') && live(s, 'C7') },
    { id: 'totals', text: 'Type Total into A8, then select B3:C8 and AutoSum both columns at once.', keys: 'Ctrl+G "A8" ↵ "Total" ↵ Ctrl+G "B3:C8" ↵ Alt+=', requires: ['autosum', 'go-to', 'type-to-enter'], check: s => s.value('A8') === 'Total' && near(s.value('B8'), 6355) && near(s.value('C8'), 209) && live(s, 'B8') },
    { id: 'number-format', text: 'Give the Sales column B3:B8 the Number format from Ctrl+1.', keys: 'Ctrl+G "B3:B8" ↵ Ctrl+1 N', requires: ['format-cells-dialog', 'go-to'], check: s => ['B3', 'B5', 'B8'].every(r => s.cellAt(r).fmtStyle === 'comma') },
    { id: 'center-title', text: 'Centre the title across A1:C1 with Ctrl+1, A.', keys: 'Ctrl+G "A1:C1" ↵ Ctrl+1 A', requires: ['center-across', 'go-to'], check: s => s.cellAt('A1').ca === 3 },
    { id: 'borders', text: 'Rule the table: All Borders on A2:C8, then a thick outside ring.', keys: 'Ctrl+G "A2:C8" ↵ Alt H B A Alt H B T', requires: ['borders-menu', 'go-to'], check: s => ['A2', 'B5', 'C8'].every(r => s.cellAt(r).ball === true) && s.cellAt('A2').thick === true && s.cellAt('C8').thick === true },
    { id: 'header-fill', text: 'Fill the header row A2:C2 gray and AutoFit columns A to C.', keys: 'Ctrl+G "A2:C2" ↵ Alt H H → ↵ then Ctrl+G "A1:C8" ↵ Alt H O I', requires: ['fills-and-colours', 'autofit', 'go-to'], check: s => ['A2', 'B2', 'C2'].every(r => s.cellAt(r).fill === 'gray') && [1, 2, 3].every(c => s.colSet[c] === true) },
    { id: 'freeze', text: 'Freeze the top row so the title stays put when the report grows.', keys: 'Alt W F R', requires: ['freeze-panes'], check: s => s.freeze.r === 1 },
  ],
  endState: [
    { text: 'The title is still bold and centred across A1:C1', check: s => s.cellAt('A1').bold === true && s.cellAt('A1').ca === 3 },
    { text: 'The headers are still bold on their gray band', check: s => ['A2', 'B2', 'C2'].every(r => s.cellAt(r).bold === true && s.cellAt(r).fill === 'gray') },
    { text: 'The linked figures still read the Raw sheet', check: s => near(s.value('B3'), 1200) && near(s.value('B8'), 6355) },
    { text: 'Sales still show the Number format and the table its borders', check: s => s.cellAt('B5').fmtStyle === 'comma' && s.cellAt('B5').ball === true },
  ],
  closing: ['This page is the shape of every report you will build: inputs on one sheet, a formatted face on another, everything live. Change a Raw number and watch the report follow.'],
  solution: '"Weekly Sales Report" Enter Ctrl+Home Ctrl+B Ctrl+G "A2" Enter "Day" Tab "Sales" Tab "Units" Enter Ctrl+G "A2:C2" Enter Ctrl+B Ctrl+G "A3" Enter "=Raw!A3" Enter Ctrl+G "A3:A7" Enter Ctrl+D Ctrl+G "B3" Enter "=Raw!B3" Tab "=Raw!C3" Enter Ctrl+G "B3:C7" Enter Ctrl+D Ctrl+G "A8" Enter "Total" Enter Ctrl+G "B3:C8" Enter Alt+= Ctrl+G "B3:B8" Enter Ctrl+1 N Ctrl+G "A1:C1" Enter Ctrl+1 A Ctrl+G "A2:C8" Enter Alt H B A Alt H B T Ctrl+G "A2:C2" Enter Alt H H Right Enter Ctrl+G "A1:C8" Enter Alt H O I Alt W F R',
};
