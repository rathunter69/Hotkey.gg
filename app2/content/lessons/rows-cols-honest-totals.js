// Chapter 1 · 1.4.1 — Rows and columns that keep the totals honest (voltline-weekly, S3e → S4a)
// Cedar Park opened this week and needs a row inside the Report block; the old platform's Old
// code column goes; a Margin % column comes in before Prior week rev. Whole rows and columns are
// selected first (Shift+Space, Ctrl+Space) and then inserted or deleted in one press, and the
// total row's SUM follows every edit without being retyped. On Raw, deleting the column the site
// totals read turns them to #REF! — a message to read, not damage — and Ctrl+Z puts it all back.
import { CEDAR_PARK, OLD_CODES } from '../workbooks/voltline-weekly.js';

const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const raw = ses => sheetOf(ses, 'Raw');
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const near = (a, b) => isNum(a) && isNum(b) && Math.abs(a - b) < 1e-6;
const blank = c => c.value == null && c.formula == null;
const normFormula = f => String(f || '').replace(/\s|\$/g, '').toUpperCase();

const WEEK = 'w/c 15 Sep';   // the reporting week on B5:B8 (1.3.5 made it current)
const TOTAL_COLS = ['C', 'D', 'E'];
/** Ctrl+Z, or the toolbar's Undo (Alt, 2 — taught in 1.1.3) when that is what the toolbar holds. */
const undone = ses => { const k = windowKeys(ses); return k.includes('Ctrl+Z') || (k.includes('Alt') && k.includes('2') && (ses.settings.qat || [])[1] === 'undo'); };
const SITE_ROWS = [5, 6, 7, 8, 9, 10];   // the six site rows once Cedar Park is in; the total row is 11
const CODES = new Set(Object.values(OLD_CODES));
/** C11:E11 are SUMs over rows 5–10 and each reads its column's sum — the total row followed the insert and the new figures. */
const totalsTie = rep => TOTAL_COLS.every(col => {
  if (normFormula(rep.formula(col + '11')) !== `=SUM(${col}5:${col}10)`) return false;
  let sum = 0; for (const r of SITE_ROWS) { const v = rep.value(col + r); if (v != null && !isNum(v)) return false; sum += v || 0; }
  return near(rep.value(col + '11'), sum);
});
const cedarRow = rep => rep.value('A9') === 'Cedar Park' && rep.value('B9') === WEEK
  && ['C', 'D', 'E'].every((col, i) => { const c = rep.cellAt(col + '9'); return !c.formula && c.value === [CEDAR_PARK.kwh, CEDAR_PARK.revenue, CEDAR_PARK.energy][i]; })
  && rep.value('A10') === 'Airport' && rep.value('A11') === 'Total';
/** No old platform code is left anywhere on the Report. */
const noCodes = rep => Object.keys(rep.cells).every(k => !CODES.has(rep.cells[k].value));
const columnsRight = rep => rep.value('G4') === 'Avg price ($/kWh)' && rep.value('H4') === 'Margin %' && rep.cellAt('H4').bold === true
  && rep.value('I4') === 'Prior week rev ($)' && rep.cellAt('I4').bold === true && blank(rep.cellAt('H5')) && isNum(rep.value('I5')) && noCodes(rep);
/** Raw's Revenue column is in place and the site totals' Revenue SUMs J8:J13 read numbers again. */
const rawIntact = rw => rw.value('E1') === 'Revenue ($)' && rw.value('F1') === 'Energy cost ($)'
  && normFormula(rw.formula('J8')) === '=SUM(E8:E13)' && [8, 9, 10, 11, 12, 13].every(r => isNum(rw.value('J' + r)));

// the figures as management wrote them (2,140 kWh, $1,005.80, $278.20) and as they are typed (2140, 1005.8, 278.2)
const usd = v => '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const { kwh, revenue, energy } = CEDAR_PARK;

export default {
  id: 'rows-cols-honest-totals',
  chapter: 'foundations',
  section: 'Structure',
  module: 'structure',
  workbook: 'voltline-weekly',
  state: { before: 'S3e', after: 'S4a' },
  title: 'Rows and columns that keep the totals honest',
  difficulty: 'medium',
  tags: ['structure', 'rows-columns', 'report'],
  access: 'free',
  minutes: 6,
  headline: 'Ctrl+Shift+=',
  conventions: ['F1', 'C3', 'F5'],
  teaches: ['insert-delete-rows', 'ref-error'],
  uses: ['row-col-select', 'shift-arrow', 'fill-down-right', 'type-to-enter', 'tab-commits', 'enter-tab-direction', 'undo-redo', 'sheet-tabs', 'ctrl-arrow'],
  prerequisites: ['find-replace-timeline'],
  brief: 'Cedar Park opened this week and needs a row inside the Report block, the old platform’s Old code column has to go, and a Margin % column is coming. Insert and delete whole rows and columns and watch the total row follow every edit — then see what happens to a SUM when the column it reads is deleted. The key is `Ctrl+Shift+=`.',
  goals: [
    { id: 'insert-row', teach: 'Ctrl+Shift+= inserts whole rows or columns at the selection, Ctrl+- deletes them, and a SUM whose range straddles the insert grows to take the new row in.', text: 'Cedar Park opened this week: select Airport’s row 9 and insert a blank row above it — the Total in C11 follows to =SUM(C5:C10).', keys: 'Ctrl+↓ ×3 ↑ Shift+Space Ctrl+Shift+=', requires: ['insert-delete-rows', 'row-col-select', 'ctrl-arrow'], convention: 'F1',
      check: (s, ses) => { const rep = report(ses); return !!rep && blank(rep.cellAt('A9')) && rep.value('A10') === 'Airport' && rep.value('A11') === 'Total'
        && TOTAL_COLS.every(col => normFormula(rep.formula(col + '11')) === `=SUM(${col}5:${col}10)`) && !ses.editing; } },
    { id: 'name-site', text: 'Name the new site: type Cedar Park in A9, then fill the week label down from B8 into B9 with Ctrl+D.', keys: '"Cedar Park" Tab Shift+↑ Ctrl+D', requires: ['type-to-enter', 'tab-commits', 'shift-arrow', 'fill-down-right'],
      check: (s, ses) => { const rep = report(ses); return !!rep && rep.value('A9') === 'Cedar Park' && rep.value('B9') === WEEK && rep.value('A10') === 'Airport' && !ses.editing; } },
    { id: 'figures', text: `Management emailed Cedar Park’s week: enter ${kwh.toLocaleString('en-US')} kWh, ${usd(revenue)} revenue and ${usd(energy)} energy cost across C9:E9 with Tab — the totals in C11:E11 grow together.`, keys: `→ "${kwh}" Tab "${revenue}" Tab "${energy}" ↵`, requires: ['type-to-enter', 'tab-commits', 'enter-tab-direction'], convention: 'C3',
      check: (s, ses) => { const rep = report(ses); return !!rep && cedarRow(rep) && totalsTie(rep) && !ses.editing; } },
    { id: 'drop-old-code', text: 'The Old code column is the old platform’s: select column I from its header I4 and delete the whole column in one press.', keys: 'Ctrl+↑ Ctrl+→ Ctrl+Space Ctrl+-', requires: ['insert-delete-rows', 'row-col-select', 'ctrl-arrow'],
      check: (s, ses) => { const rep = report(ses); return !!rep && rep.value('G4') === 'Avg price ($/kWh)' && rep.value('H4') === 'Prior week rev ($)' && isNum(rep.value('H5'))
        && blank(rep.cellAt('I4')) && !rep.cellAt('I4').bold && blank(rep.cellAt('I5')) && noCodes(rep) && !ses.editing; } },
    { id: 'margin-col', text: 'Margin % belongs before Prior week rev: insert a column at H and type Margin % in H4 — the header comes out bold.', keys: '← Ctrl+Space Ctrl+Shift+= "Margin %" ↵', requires: ['insert-delete-rows', 'row-col-select', 'type-to-enter'],
      check: (s, ses) => { const rep = report(ses); return !!rep && columnsRight(rep) && !ses.editing; } },
    { id: 'break-revenue', teach: '#REF! means the formula pointed at a cell that no longer exists: delete a column a SUM reads and it breaks, and Ctrl+Z brings both back.', text: 'On Raw, delete the Revenue column E and read the site totals block: every Revenue SUM now says #REF! instead of a number.', keys: 'Ctrl+PgDn Ctrl+→ ← Ctrl+Space Ctrl+-', requires: ['ref-error', 'insert-delete-rows', 'row-col-select', 'sheet-tabs', 'ctrl-arrow'], convention: 'F5',
      check: (s, ses) => { const rw = raw(ses); return !!rw && rw.value('D1') === 'Price ($/kWh)' && rw.value('E1') === 'Energy cost ($)'
        && [8, 9, 10, 11, 12, 13].every(r => rw.value('I' + r) === '#REF!') && !ses.editing; } },
    { id: 'heal', text: 'Read the error, then undo: Ctrl+Z brings the Revenue column back and Domain’s Revenue SUM in J8 reads a number again.', keys: 'Ctrl+Z', requires: ['ref-error', 'undo-redo'],
      check: (s, ses) => { const rw = raw(ses); return !!rw && rawIntact(rw) && undone(ses) && !ses.editing; } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Report!C9" Enter "3000" Enter Ctrl+G "Report!C11" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch Cedar Park’s kWh in C9 change to 3,000 and the Total in C11 answer.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'A9:E9 hold Cedar Park’s row and Airport sits on row 10', check: (s, ses) => { const rep = report(ses); return !!rep && cedarRow(rep); } },
    { text: 'C11:E11 are live SUMs over rows 5 to 10 and tie', check: (s, ses) => { const rep = report(ses); return !!rep && totalsTie(rep); } },
    { text: 'H4 reads Margin %, I4 Prior week rev ($), and no Old code remains', check: (s, ses) => { const rep = report(ses); return !!rep && columnsRight(rep); } },
    { text: 'Raw’s Revenue column and the site totals are intact', check: (s, ses) => { const rw = raw(ses); return !!rw && rawIntact(rw); } },
  ],
  closing: [
    'Cedar Park’s row went in inside the block, the Old code column came out and Margin % went in, and the total row followed every edit without a formula retyped — a total that follows its rows is the first check (F1).',
    'Deleting the column a SUM reads turned it to #REF!: that is a message, not damage — read it (F5) — and Ctrl+Z put the feed and its totals back.',
  ],
  solution: `Ctrl+Down Ctrl+Down Ctrl+Down Up Shift+Space Ctrl+Shift+= "Cedar Park" Tab Shift+Up Ctrl+D Right "${kwh}" Tab "${revenue}" Tab "${energy}" Enter Ctrl+Up Ctrl+Right Ctrl+Space Ctrl+- Left Ctrl+Space Ctrl+Shift+= "Margin %" Enter Ctrl+PgDn Ctrl+Right Left Ctrl+Space Ctrl+- Ctrl+Z`,
};
