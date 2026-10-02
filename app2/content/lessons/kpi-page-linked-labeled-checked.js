// Chapter 4 · 4.3.4 The KPI page: linked, labeled, checked (clearcoat-pack, S433 → S434)
// The blocks are built; the page around them gets finished. The title becomes a formula on the
// export period in Inputs, in green; a source line in italics says where the figures come from; the
// checks block gains the member share tie, the KPI-to-cube tie and the flag over every check; and
// the print set-up goes on: landscape, one page, the head rows repeated, file and date in the
// footer. The closer changes an export row: the page answers and the flag stays at zero.
import { summary, calls, near, live, settled, shellOf, refsIn } from './lib/pack-list-checks.js';
import { SUMMARY_PAGE_SETUP as W } from '../workbooks/clearcoat-pack.js';

const PLANT = [...refsIn('B74:B77'), 'C74', 'C75', 'C77'];
const SOURCE = 'Source: the POS export on Export, the site list on Lists, and the six site tabs';
const F = {
  title: '="Clearcoat Express: KPI page, "&Inputs!$C$14',
  c74: '=ROUND(M11*H11-L11,0)',
  c75: '=H11-F21',
  flag: '=IF(AND(C72=0,C73=0,C74=0,C75=0,C76=0),0,1)',
};
const setup = ses => (ses.settings && ses.settings.pageSetup) || {};
const titled = (ses, sh) => /Inputs!/i.test(sh.formula('A1') || '') && sh.value('A1') === 'Clearcoat Express: KPI page, Sep 15 to 29, 2026' && sh.cellAt('A1').fontColor === 'green';
const sourced = sh => { const c = sh.cellAt('B69'); return !c.formula && typeof c.value === 'string' && /^Source:/.test(c.value) && /Export/.test(c.value) && /Lists/.test(c.value) && c.it === true; };
const checked = sh => calls(sh, 'C74', ['ROUND']) && near(sh.value('C74'), 0) && /M11/.test(sh.formula('C74') || '') && /L11/.test(sh.formula('C74') || '')
  && near(sh.value('C75'), 0) && /H11/.test(sh.formula('C75') || '') && /F21/.test(sh.formula('C75') || '')
  && calls(sh, 'C77', ['IF', 'AND']) && sh.value('C77') === 0 && ['C72', 'C73', 'C74', 'C75'].every(ref => (sh.formula('C77') || '').includes(ref));
const fitted = ses => { const p = setup(ses); return p.orientation === W.orientation && p.scaling === 'fit' && p.fitWide === 1 && p.fitTall === 1; };
const titledPrint = ses => { const p = setup(ses), f = p.footer || {}; return /\$?1:\$?4/.test(p.titlesRows || '') && f.left === W.footer.left && f.right === W.footer.right && !f.centre; };

export default {
  id: 'kpi-page-linked-labeled-checked',
  chapter: 'data-and-lookups',
  section: 'Summaries from raw rows',
  module: 'summaries-from-raw-rows',
  workbook: 'clearcoat-pack',
  state: { before: 'S433', after: 'S434' },
  plant: shellOf('S434', { Summary: PLANT }, { keepText: true }),
  title: 'The KPI page: linked, labeled, checked',
  difficulty: 'medium',
  tags: ['formatting', 'checks', 'print'],
  access: 'paid',
  minutes: 6,
  headline: 'Ctrl+1',
  conventions: ['G1', 'G2', 'F1'],
  teaches: ['kpi-page'],
  uses: ['dynamic-title', 'concatenate-amp', 'link-colour-convention', 'font-color', 'source-line', 'bold-italic-underline', 'round-function', 'if-function', 'and-or-not', 'rollup-flag', 'page-setup', 'orientation', 'fit-to-page', 'print-titles', 'page-numbers-footer', 'go-to', 'ctrl-arrow', 'arrow-keys', 'type-to-enter', 'keytips', 'cross-sheet-ref'],
  prerequisites: ['date-range-criteria'],
  brief: 'The blocks are built; now they become a page a buyer reads: a title from Inputs, a source line, and a checks block that ties the cubes to the export and the KPI ratios to their parts, with one flag over the lot. Everything on the page is a link or a formula; nothing is typed but the inputs. Then the print set-up, so the page leaves the building on one sheet of paper. The key is `Ctrl+1`.',
  goals: [
    { id: 'title', text: `On Summary, make the title in A1 a formula on the export period, ${F.title}, in green.`, keys: `Ctrl+G "Summary!A1" ↵ '${F.title}' ↵ ↑ Alt H F C → ×8 ↵`, requires: ['dynamic-title', 'concatenate-amp', 'cross-sheet-ref', 'link-colour-convention', 'font-color', 'go-to'], convention: 'G2',
      hintStuck: 'pulse cell A1 · The period lives once, in Inputs!C14; the title reads it.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && titled(ses, sh); } },
    { id: 'source', text: 'In B69, type a source line that names Export, Lists and the six site tabs, and set it in italics with Ctrl+I.', keys: `Ctrl+G "B69" ↵ "${SOURCE}" ↵ ↑ Ctrl+I`, requires: ['source-line', 'bold-italic-underline', 'go-to', 'type-to-enter'],
      hintStuck: `pulse cell B69 · ${SOURCE}`,
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && sourced(sh); } },
    { id: 'checks', teach: 'A KPI page proves itself: every ratio ties back to its parts and every block to the export, each as a difference that reads zero, and one flag over the checks says whether the page ties. A reviewer reads the flag first.', text: `Finish the checks: C74 ${F.c74}, C75 ${F.c75}, and the flag in C77 over all five.`, keys: `→ Ctrl+↓ ↓ ×2 "${F.c74}" ↵ "${F.c75}" ↵ ↓ "${F.flag}" ↵`, requires: ['kpi-page', 'round-function', 'if-function', 'and-or-not', 'rollup-flag', 'ctrl-arrow', 'arrow-keys', 'type-to-enter'], convention: 'F1',
      hintStuck: `pulse range C74:C77 · The flag: ${F.flag}`,
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && checked(sh); } },
    { id: 'fit', text: 'Print set-up: landscape (Alt, P, O, L), then Page Setup, Fit to one page wide by one tall.', keys: 'Alt P O L Alt P S P Alt+F Tab 1 ↵', requires: ['page-setup', 'orientation', 'fit-to-page', 'keytips'], convention: 'G1',
      hintStuck: 'pulse cell A1 · Alt+F picks Fit to; Tab moves to the pages tall box.',
      check: (s, ses) => settled(ses) && fitted(ses) },
    { id: 'titles', text: 'Repeat rows 1:4 on every page (Alt, P, I), and put the file name left and the date right in the footer.', keys: 'Alt P I "1:4" ↵ Alt P S P H Alt+U "&[File]" Alt+R "&[Date]" ↵ ↵', requires: ['print-titles', 'page-numbers-footer', 'page-setup', 'keytips'], convention: 'G1',
      hintStuck: 'pulse rows 1:4 · The footer’s three boxes are Alt+U, Alt+C and Alt+R.',
      check: (s, ses) => settled(ses) && fitted(ses) && titledPrint(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Export!C6" Enter "250" Enter Ctrl+G "Summary!C77" Enter Escape', cadence: 320 }, text: 'Does it tie? Watch an export row change: the cubes, the KPI block and the window all move, and the flag in C77 stays at zero.', requires: [],
      hintStuck: 'pulse cell C77 · Every block reads the same rows, so the checks still agree.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The title reads the export period from Inputs, and the source line is in place', check: (s, ses) => { const sh = summary(ses); return titled(ses, sh) && sourced(sh); } },
    { text: 'The checks block is whole and its flag reads zero', check: (s, ses) => checked(summary(ses)) },
    { text: 'The page prints landscape on one page, rows 1:4 repeated, file and date in the footer', check: (s, ses) => fitted(ses) && titledPrint(ses) },
  ],
  closing: [
    'The KPI page reads the export end to end, and its own checks say so.',
    'Best practice: the flag sits where a reviewer looks first, and a page goes out only when it reads zero. Set the print set-up while the page is fresh in your head: nobody remembers the head rows the night the pack ships.',
  ],
  solution: `Ctrl+G "Summary!A1" Enter '${F.title}' Enter Up Alt H F C Right Right Right Right Right Right Right Right Enter `
    + `Ctrl+G "B69" Enter "${SOURCE}" Enter Up Ctrl+I Right Ctrl+Down Down Down "${F.c74}" Enter "${F.c75}" Enter Down "${F.flag}" Enter `
    + 'Alt P O L Alt P S P Alt+F Tab 1 Enter Alt P I "1:4" Enter Alt P S P H Alt+U "&[File]" Alt+R "&[Date]" Enter Enter',
};
