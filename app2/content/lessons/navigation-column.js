// Chapter 2 · 2.4.4 A navigation column for a long sheet (clearcoat-pnl, S4c + PLANT_CLUSTER_LINES → S4d)
// Monthly detail now runs to 75 rows: four clusters, the company block, its source and checks. The
// company block's revenue, site costs and EBITDA rows take defined names (Rev, SiteCosts,
// EBITDA), a navigation column at the top of the sheet lists them in Q4:Q7, each entry a hyperlink
// (Ctrl+K, Place in This Document) to its name, and Go To by name lands on each too. The closer
// follows the EBITDA link, moves head office and the company's EBITDA answers.
import { DETAIL, PLANT_CLUSTER_LINES } from '../workbooks/clearcoat-pnl.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const detail = ses => sheetOf(ses, 'Monthly detail');
const activeName = ses => ses.sheets[ses.sheetIndex].name;
const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
const named = (ses, name, row) => !!ses.names && ses.names[name] === `'Monthly detail'!$B$${row}:$O$${row}`;
const linked = (d, ref, name) => { const l = d.cellAt(ref).link; return !!l && l.name === name; };
const links = d => linked(d, 'Q5', 'Rev') && linked(d, 'Q6', 'SiteCosts') && linked(d, 'Q7', 'EBITDA');
const listed = d => d.value('Q4') === 'Go to' && d.cellAt('Q4').bold && d.value('Q5') === 'Revenue' && d.value('Q6') === 'Site costs' && d.value('Q7') === 'EBITDA';
const onDetail = ses => activeName(ses) === 'Monthly detail';

export default {
  id: 'navigation-column',
  chapter: 'formatting',
  section: 'Alignment and structure',
  module: 'alignment-and-structure',
  workbook: 'clearcoat-pnl',
  state: { before: 'S4c', after: 'S4d' },
  plant: PLANT_CLUSTER_LINES,
  title: 'A navigation column for a long sheet',
  difficulty: 'medium',
  tags: ['structure', 'names', 'navigation'],
  access: 'paid',
  minutes: 6,
  headline: 'Ctrl+K',
  conventions: ['C9', 'C8'],
  teaches: ['navigation-column', 'hyperlink'],
  uses: ['defined-name', 'go-to', 'sheet-reference', 'ctrl-shift-arrow', 'ctrl-enter-fill', 'bold-italic-underline', 'type-to-enter', 'ctrl-home-end', 'freeze-panes'],
  prerequisites: ['hide-group-or-separate-sheet'],
  brief: 'Monthly detail runs to seventy-five rows once the four clusters and the company block are in, and a reader shouldn’t scroll to find the EBITDA line. A navigation column is a short list at the top of the sheet: each entry a hyperlink to a named block, so following it lands you there, and Ctrl+G with the name does the same. Name the blocks, list them, link them. The key is `Ctrl+K`.',
  goals: [
    { id: 'name-rev', teach: 'A defined name labels a range, and Go To accepts the name wherever it accepts an address. Name the blocks a reader jumps to and nothing else.', text: 'On Monthly detail, name the company’s total revenue B66:O66 Rev with Define Name, Alt, M, M, D.', keys: `Ctrl+G "'Monthly detail'!B66:O66" ↵ Alt M M D "Rev" ↵`, requires: ['navigation-column', 'defined-name', 'go-to', 'sheet-reference'], convention: 'C9',
      hintStuck: 'pulse range B66:O66 · The company block sits under the four clusters.',
      check: (s, ses) => named(ses, 'Rev', DETAIL.rev) && settled(ses) },
    { id: 'name-costs', text: 'Name the company’s total site costs on the row under it, B67:O67, SiteCosts.', keys: '↓ Ctrl+Shift+→ Alt M M D "SiteCosts" ↵', requires: ['defined-name', 'ctrl-shift-arrow'], convention: 'C9',
      hintStuck: 'pulse range B67:O67 · One row under total revenue.',
      check: (s, ses) => named(ses, 'SiteCosts', DETAIL.costs) && settled(ses) },
    { id: 'name-ebitda', text: 'Name the company’s EBITDA row B70:O70 EBITDA.', keys: `Ctrl+G "'Monthly detail'!B70:O70" ↵ Alt M M D "EBITDA" ↵`, requires: ['defined-name', 'go-to'], convention: 'C9',
      hintStuck: 'pulse range B70:O70 · The answer, with its double bottom.',
      check: (s, ses) => named(ses, 'EBITDA', DETAIL.ebitda) && settled(ses) },
    { id: 'list', teach: 'The navigation column sits at the top of the sheet, beside the frozen header, where a reader starts. Each entry says the block in words; the name behind it does the jumping.', text: 'Type the navigation column: Go to in Q4 in bold, then Revenue, Site costs and EBITDA in Q5:Q7.', keys: `Ctrl+G "'Monthly detail'!Q4" ↵ "Go to" Ctrl+↵ Ctrl+B ↓ "Revenue" ↵ "Site costs" ↵ "EBITDA" ↵`, requires: ['navigation-column', 'type-to-enter', 'ctrl-enter-fill', 'bold-italic-underline'], convention: 'C9',
      hintStuck: 'pulse range Q4:Q7 · Column Q sits just right of the full year.',
      check: (s, ses) => { const d = detail(ses); return !!d && listed(d) && settled(ses); } },
    { id: 'link-rev', teach: 'Ctrl+K opens Insert Hyperlink. Place in This Document (Alt+A) lists the sheets and then the defined names; Alt+C reaches the list, ↓ walks it, and Enter links the cell. The cell keeps its words and takes the hyperlink look.', text: 'Link Revenue in Q5 to its block: Ctrl+K, Place in This Document with Alt+A, Alt+C to the list, ↓ twice to Rev, Enter.', keys: '↑ ×3 Ctrl+K Alt+A Alt+C ↓ ×2 ↵', requires: ['hyperlink', 'defined-name'], convention: 'C9',
      hintStuck: 'pulse cell Q5 · The names come after the sheets, in order: EBITDA, Rev, SiteCosts.',
      check: (s, ses) => { const d = detail(ses); return !!d && linked(d, 'Q5', 'Rev') && settled(ses); } },
    { id: 'link-rest', text: 'Link Site costs in Q6 to SiteCosts and EBITDA in Q7 to EBITDA the same way.', keys: '↓ Ctrl+K Alt+A Alt+C ↓ ×3 ↵ ↓ Ctrl+K Alt+A Alt+C ↓ ↵', requires: ['hyperlink', 'defined-name'], convention: 'C9',
      hintStuck: 'pulse range Q6:Q7 · The list opens on this sheet; the names sit under it.',
      check: (s, ses) => { const d = detail(ses); return !!d && links(d) && settled(ses); } },
    { id: 'jump', text: 'Jump to the EBITDA line by name: Ctrl+G, EBITDA, Enter.', keys: 'Ctrl+G "EBITDA" ↵', requires: ['go-to', 'defined-name'], convention: 'C9',
      hintStuck: 'pulse range B70:O70 · Go To takes the name where it takes an address.',
      check: (s, ses) => { const d = detail(ses); return !!d && onDetail(ses) && d.selectionText() === 'B70:O70' && settled(ses); } },
    { id: 'home', text: 'Come back to the top with Ctrl+Home, which lands on C5 under the frozen panes.', keys: 'Ctrl+Home', requires: ['ctrl-home-end', 'freeze-panes'], convention: 'C8',
      hintStuck: 'pulse cell C5 · With the panes frozen, home is the first figure.',
      check: (s, ses) => { const d = detail(ses); return !!d && onDetail(ses) && d.selectionText() === 'C5' && settled(ses); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Q7" Enter Shift+F10 O Ctrl+G "C69" Enter "-600" Enter Ctrl+G "C70" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch the EBITDA link followed from Q7, head office in C69 change to -600, and the company’s EBITDA in C70 answer.', requires: [],
      hintStuck: 'pulse cell C70 · The name lands on the row; the row is live.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Rev, SiteCosts and EBITDA name the company block', check: (s, ses) => named(ses, 'Rev', DETAIL.rev) && named(ses, 'SiteCosts', DETAIL.costs) && named(ses, 'EBITDA', DETAIL.ebitda) },
    { text: 'The navigation column lists the three blocks, each a link to its name', check: (s, ses) => { const d = detail(ses); return !!d && listed(d) && links(d); } },
  ],
  closing: [
    'Three links at the top make a seventy-five-row sheet read like a short one.',
    'A reader finds revenue, site costs and EBITDA from the list and lands on each by following its link, or with Ctrl+G and its name. Names are for the few places people jump to; everything else stays an address.',
  ],
  solution: `Ctrl+G "'Monthly detail'!B66:O66" Enter Alt M M D "Rev" Enter Down Ctrl+Shift+Right Alt M M D "SiteCosts" Enter Ctrl+G "'Monthly detail'!B70:O70" Enter Alt M M D "EBITDA" Enter Ctrl+G "'Monthly detail'!Q4" Enter "Go to" Ctrl+Enter Ctrl+B Down "Revenue" Enter "Site costs" Enter "EBITDA" Enter Up Up Up Ctrl+K Alt+A Alt+C Down Down Enter Down Ctrl+K Alt+A Alt+C Down Down Down Enter Down Ctrl+K Alt+A Alt+C Down Enter Ctrl+G "EBITDA" Enter Ctrl+Home`,
};
