// Chapter 2 · 2.8.A Assessment: the section on fresh figures (seeded over S8raw; also the test-out)
// The project's three pages again, against a hard clock, on a sister operator's export: the same
// accounting system, the same lines and faults, a different company and different figures
// (sisterPatch in clearcoat-pnl). The goals are those of the project, read structurally, so any seed
// passes on the same keys; the slow-month line is 3,000 for the smaller sister operator, and
// any threshold the learner sets passes as long as the rule is the right kind on the right row.
import { hintToScript } from '../../app/runner.js';
import { parsFrom } from '../../app/pars.js';
import { sisterPatch, PRINT, MONTHLY_ROW } from '../workbooks/clearcoat-pnl.js';
import { goalsFor } from './ch2-project.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const near0 = v => typeof v === 'number' && Math.abs(v) < 1e-6;

const TEXTS = {
  formats: 'On the P&L give C7:E24 the desk number format, $ on rows 7, 10 and 24, and the memo rows 33 to 35 their own codes.',
  signs: 'Turn the costs in rows 13 to 19 and 23 negative with Paste Special Multiply, then make C22 and C24 additions filled to E.',
  margins: 'Head the Margins and growth block at B26, four margin lines in C27:E30 in italic percent, and the CAGR in F30.',
  timeline: 'Link C4 to Inputs B6 and step D4:E4 a year with EOMONTH, FY codes in green, the A, A and E flags in row 5.',
  inputs: 'On Inputs give B12:B16 their unit codes, then the units line in B17, the next update in B18 and the headline in B19.',
  anatomy: 'Give the P&L its anatomy: clear column A, title and units line from Inputs, sections bold, lines indented, totals ruled, inputs blue.',
  labels: 'Draw the A/E divider down D4:D35, then retype the labels B7:B35 in sentence case with the source and footnote in B36:B37.',
  layout: 'Set the P&L widths, the title row to 24, freeze panes at C5, and group rows 13 to 19, 26 to 30 and 33 to 35.',
  monthly: 'Bring Monthly to the P&L: labels into B6:B30, costs negative, rows 22 and 24 as additions, the margins block and Paste Formats.',
  heads: 'Head Monthly: title and units line from Inputs, month ends in D4:N4 by EOMONTH, C4 blue, month names in C5:N5 by TEXT.',
  foot: 'Finish Monthly with its source in B31, two checks against the P&L in C34:C35, the P&L widths, panes at C5 and gridlines off.',
  navigation: 'Type the Go to column in Q4:Q7, then name Monthly rows 10, 20 and 24 as Rev, SiteCosts and EBITDA.',
  rules: 'Add the rules: Monthly C10:N10 yellow below 3,000, the P&L checks C39:C40 light red and stopping, negative margins in red text.',
  print: 'Build Print from links: title, period line and FY heads, six lines pointed at the P&L, formats, its check, divider and layout.',
  setup: 'In Page Setup, Alt, P, S, P, set the pack landscape, one page wide by two tall, rows 1:5 repeated, the three-part footer, centered.',
};
const GOALS = goalsFor(TEXTS, { slow: 3000, anyThreshold: true });

/** Every check on the three pages is a live formula reading zero. */
const CHECK_CELLS = [['P&L', 'C39'], ['P&L', 'C40'], ['Monthly', 'C' + MONTHLY_ROW.checkRevenue], ['Monthly', 'C' + MONTHLY_ROW.checkEbitda], ['Print', 'C' + PRINT.check]];
export const GRADERS = [
  ses => { for (const [name, ref] of CHECK_CELLS) { const sh = sheetOf(ses, name); if (!sh) return { ok: false, why: `No ${name} sheet.` };
      const c = sh.cellAt(ref);
      if (!c.formula) return { ok: false, why: `${name} ${ref} is not a formula. A check is a live difference, not a typed 0` };
      if (!near0(sh.value(ref))) return { ok: false, why: `${name} ${ref} reads ${sh.value(ref)}. The section does not tie` }; }
    return { ok: true }; },
  ses => { const sh = sheetOf(ses, 'Print'); if (!sh) return { ok: false, why: 'No Print sheet.' };
    for (const r of [PRINT.rev, PRINT.contrib, PRINT.ebitda, PRINT.margin, PRINT.sites, PRINT.washes]) for (const col of ['C', 'D', 'E']) {
      const c = sh.cellAt(col + r);
      if (!c.formula || !/P&L/i.test(c.formula)) return { ok: false, why: `Print ${col}${r} is not a link to the P&L. The summary reads from the detail` };
      if (c.fontColor !== 'green') return { ok: false, why: `Print ${col}${r} links to the P&L and is shown ${c.fontColor || 'black'}. A link to another sheet is green` }; }
    return { ok: true }; },
];

export default {
  id: 'ch2-assessment',
  chapter: 'formatting',
  section: 'Project and assessment',
  module: 'ch2-project-and-assessment',
  workbook: 'clearcoat-pnl',
  state: { before: 'S8raw' },
  kind: 'assessment',
  title: 'Assessment: the section on fresh figures',
  difficulty: 'hard',
  tags: ['assessment', 'pnl', 'format', 'print'],
  access: 'paid',
  minutes: 10,
  headline: 'Ctrl+1',
  conventions: ['B1', 'B2', 'C2', 'C4', 'C7', 'C9', 'D2', 'D5', 'D6', 'D9', 'F1', 'G1', 'G3'],
  uses: [...new Set(GOALS.flatMap(g => g.requires))],
  prerequisites: ['ch2-project'],
  brief: 'A sister operator in the same case world has sent its export: the same lines, the same faults and different figures. Make the same three pages, the P&L, Monthly and Print, formatted, checked and set to print, on the clock with no help and the keyboard only. Pass, and the chapter is Verified; this is also the test-out. The key is `Ctrl+1`.',
  wow: 'You built the financials section on figures you had never seen, on the clock, and the chapter is Verified.',
  timeLimit: 600,
  pars: parsFrom(300, { pass: 600, pro: 440 }),
  seed: rng => sisterPatch(rng),
  goals: [
    ...GOALS,
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "\'P&L\'!C7" Enter "9000" Enter Ctrl+G "Print!C5" Enter Escape Escape Escape', cadence: 320 },
      text: 'Does it tie? Change FY25A retail wash revenue on the P&L and watch Print C5 answer while every check stays at zero.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  graders: GRADERS,
  closing: [
    'A company you had never seen, three pages to the standard: every figure in its format, the signs stated, the heads built from formulas, the checks at zero and the pack set to print.',
    'That is what a buyer’s analyst looks for when the section lands in the data room, and you met it under a clock.',
  ],
  solution: hintToScript(GOALS.map(g => g.keys).join(' ')),
};
