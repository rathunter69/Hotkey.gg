// Chapter 3 · 3.7.P Project: the KPI databook (clearcoat-databook, S7raw → S7done)
// The San Antonio cluster's export for the same fortnight, run through the same build as the
// chapter's Austin databook in one sitting: the export cleaned and split, the period keys, the ages
// and member tenure, the flags block, the site counts and revenue, the members' revenue, site by
// package, the league table and the blended ticket, the reconciliation to the managers' tallies, the
// loan and the new-site case, the first year of the schedule, the old block brought to standard and
// the checks block with its roll-up flag. Fifteen goals, no teach lines: nothing here is new.
// The assessment (3.7.A) runs the same goals on a fresh export, so the goal checks read structure
// (each formula against the finished databook, the clean data, the colours), never the figures of this export
// alone; the project also accepts any formula that lands on the finished figure.
import { hintToScript } from '../../app/runner.js';
import { rangeRefs } from '../../engine/refs.js';
import { stateOf } from '../workbooks/clearcoat-databook.js';

const DONE = stateOf('S7done');
const doneSheet = name => DONE.sheets.find(s => s.name === name);
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const settled = ses => !ses.editing && !ses.dialog;
const norm = f => String(f || '').replace(/\s/g, '').toUpperCase();
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const isText = v => typeof v === 'string' && v.trim() !== '';
const near = (a, b) => (isNum(a) && isNum(b) ? Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b)) : a === b);
const refsOf = spec => spec.split(',').flatMap(part => { const [a, b] = part.trim().split(':'); return rangeRefs(a, b || a); });

/**
 * The cells of `spec` on sheet `name` match the finished databook on `props`. 'content' reads the
 * route-free part: a formula's text (spacing ignored), or with `byValue` any formula landing on the
 * finished figure; a typed number staying a number; a label's words; an empty cell staying empty.
 */
export function cellsLike(ses, name, spec, props, { byValue = false } = {}) {
  const sh = sheetOf(ses, name), dn = doneSheet(name); if (!sh || !dn) return false;
  return refsOf(spec).every(ref => {
    const c = sh.cellAt(ref), d = dn.cells[ref] || {};
    return props.every(p => {
      if (p !== 'content') return (c[p] || null) === (d[p] || null);
      if (d.formula) return !!c.formula && (norm(c.formula) === norm(d.formula) || (byValue && near(sh.value(ref), d.value)));
      if (c.formula) return false;
      if (typeof d.value === 'number') return typeof c.value === 'number';
      if (d.value === undefined) return c.value === undefined || c.value === null || c.value === '';
      return c.value === d.value;
    });
  });
}
const doneValue = (name, ref) => (doneSheet(name).cells[ref] || {}).value;
const covers = (range, ref) => String(range || '').toUpperCase().split(',').some(part => { const [a, b] = part.split(':'); if (!b) return a === ref;
  const rc = x => { const m = /^([A-Z]+)(\d+)$/.exec(x); return m ? { c: m[1].charCodeAt(0) - 64, r: +m[2] } : null; }; const p = rc(a), q = rc(b), t = rc(ref);
  return !!(p && q && t) && t.r >= Math.min(p.r, q.r) && t.r <= Math.max(p.r, q.r) && t.c >= Math.min(p.c, q.c) && t.c <= Math.max(p.c, q.c); });

const TX = 'Transactions';
/** The codes in the export carry no stray spaces and every amount is a number. */
const cleanData = ses => { const sh = sheetOf(ses, TX); if (!sh) return false;
  return refsOf('B5:B94').every(ref => { const v = sh.value(ref); return isText(v) && v === v.trim(); }) && refsOf('E5:E94').every(ref => isNum(sh.value(ref))); };
/** The reconciliation: links, tallies in blue, differences, adjustments in blue with a note beside each, adjusted, checks at zero, totals. */
const reconciled = (ses, o) => { const sh = sheetOf(ses, 'Summary'); if (!sh) return false;
  return cellsLike(ses, 'Summary', 'C44:C50,E44:E50,D50,G50:I50,H44:I49', ['content'], o) && cellsLike(ses, 'Summary', 'D44:D49,G44:G49', ['content', 'fontColor'])
    && [44, 45, 46, 47, 48, 49].every(r => near(sh.value('I' + r), 0) && (doneValue('Summary', 'G' + r) === undefined || (isText(sh.value('F' + r)) && sh.cellAt('F' + r).fontColor === 'blue'))); };
const oldBlock = (ses, o) => { const sh = sheetOf(ses, 'Summary'); if (!sh) return false;
  return cellsLike(ses, 'Summary', 'D54:D59,C57,E54:E59', ['content'], o) && cellsLike(ses, 'Summary', 'B63', ['content'])
    && !sh.cellAt('C61').formula && sh.value('C61') === doneValue('Summary', 'C61') && isText(sh.value('D61')) && ['C61', 'D61', 'C63'].every(ref => sh.cellAt(ref).fontColor === 'blue')
    && !sh.cellAt('C63').formula && sh.value('C63') === 1.05 && cellsLike(ses, 'Summary', 'C63', ['fmtStyle', 'decimals']); };
const redFlag = ses => { const sh = sheetOf(ses, 'Summary'); return !!sh && (sh.condFmt || []).some(r => covers(r.range, 'C2') && covers(r.range, 'C75') && r.kind === 'cellValue' && r.op === '='
  && String(r.v1).replace(/"/g, '').toUpperCase() === 'CHECK' && /red/i.test(String(r.style || ''))); };

/** Each goal's end-state check, shared with the assessment (a fresh export, the same structure). */
export const CHECKS = {
  'clean-export': (ses, o) => cleanData(ses) && cellsLike(ses, TX, 'R5:T94,W5:W94', ['content'], o),
  'period-keys': (ses, o) => cellsLike(ses, TX, 'G5:K94', ['content'], o),
  dates: (ses, o) => cellsLike(ses, 'Sites', 'J5:K10', ['content'], o) && cellsLike(ses, 'Summary', 'L5:L10', ['content', 'fontColor'], o)
    && cellsLike(ses, 'Members', 'L2', ['content', 'fontColor']) && sheetOf(ses, 'Members').value('L2') === doneValue('Members', 'L2') && cellsLike(ses, 'Members', 'G5:K44,K45', ['content'], o),
  flags: (ses, o) => cellsLike(ses, 'Summary', 'E5:G10,F12,I4:I10,M5:N10', ['content'], o),
  counts: (ses, o) => cellsLike(ses, 'Summary', 'C15:E21,C25:D28', ['content'], o),
  revenue: (ses, o) => cellsLike(ses, 'Summary', 'F15:G21', ['content'], o) && isText(sheetOf(ses, 'Summary').value('C22')),
  'members-revenue': (ses, o) => cellsLike(ses, 'Summary', 'L15:O21', ['content'], o),
  'by-package': (ses, o) => cellsLike(ses, 'Summary', 'C34:H40', ['content'], o),
  league: (ses, o) => cellsLike(ses, 'Summary', 'J15:K20,C29:C30', ['content'], o),
  reconciliation: (ses, o) => reconciled(ses, o),
  'loan-case': (ses, o) => cellsLike(ses, 'Loans', 'C12:C13,C16:C18,C27:H34', ['content'], o),
  schedule: (ses, o) => cellsLike(ses, 'Loans', 'C38:J49,C53', ['content'], o) && cellsLike(ses, 'Loans', 'C38:C49', ['fontColor']),
  'old-block': (ses, o) => oldBlock(ses, o),
  checks: (ses, o) => cellsLike(ses, 'Summary', 'C68:C75,C2', ['content'], o) && cellsLike(ses, 'Summary', 'C72:C73', ['fontColor']) && redFlag(ses),
};

const BLUE = 'Alt H F C → ×4 ↵', GREEN = 'Alt H F C → ×8 ↵';
/** Select a range by Go To and fill it with one formula: Ctrl+Enter writes it relative in every cell and keeps each cell's format. */
const fill = (range, formula) => `Ctrl+G "${range}" ↵ ${formula.includes('"') ? `'${formula}'` : `"${formula}"`} Ctrl+↵`;
const TB = 'Transactions!$B$5:$B$94', TC = 'Transactions!$C$5:$C$94', TD = 'Transactions!$D$5:$D$94', TE = 'Transactions!$E$5:$E$94';
export const TALLIES = [10, 16, 22, 16, 16, 11];

/** The route, goal by goal; `tallies: false` leaves out typing the managers' tallies (the assessment's seed carries them). */
export const keysFor = ({ tallies = true } = {}) => ({
  'clean-export': [`Ctrl+G "Transactions!B5:B94" ↵ Ctrl+H " " Tab Alt+A Esc Ctrl+G "Transactions!E5:E94" ↵ Alt A E Alt+F`,
    fill('Transactions!R5:R94', '=LEN(B5)'), fill('Transactions!S5:S94', '=LEFT(B5,3)'), fill('Transactions!T5:T94', '=RIGHT(TRIM(B5),3)'),
    fill('Transactions!W5:W94', '=MID(F5,FIND("(",F5)+1,FIND(")",F5)-FIND("(",F5)-1)')].join(' '),
  'period-keys': [fill('Transactions!G5:G94', '=TEXT(A5,"yyyy-mm")'), fill('Transactions!H5:H94', '=EOMONTH(A5,0)'), fill('Transactions!I5:I94', '=ROUNDUP(MONTH(A5)/3,0)'),
    fill('Transactions!J5:J94', '="Q"&I5&" "&YEAR(A5)'), fill('Transactions!K5:K94', '=A5-WEEKDAY(A5,2)+1')].join(' '),
  dates: [fill('Sites!J5:J10', '=$I$5-E5'), fill('Sites!K5:K10', '=YEARFRAC(E5,$I$5)'), fill('Summary!L5:L10', '=Sites!K5'), GREEN,
    `Ctrl+G "Members!L2" ↵ "30" ↵ ↑ ${BLUE}`, fill('Members!G5:G44', '=IF(F5="",$H$2,F5)'), fill('Members!H5:H44', '=G5-E5'), fill('Members!I5:I44', '=H5/30.4'),
    fill('Members!J5:J44', '=IF(F5="","Active","Cancelled")'), fill('Members!K5:K44', '=I5*$L$2'), `Ctrl+↓ ↓ "=SUM(K5:K44)" ↵`].join(' '),
  flags: [fill('Summary!E5:E10', '=IF(C5>=D5,"On target","Below")'), fill('Summary!F5:F10', '=IF(C5>=D5,1,0)'), fill('Summary!G5:G10', '=MAX(C5-D5,0)'),
    `Ctrl+G "Summary!F12" ↵ "=SUM(F5:F10)" ↵ Ctrl+G "Summary!I4" ↵ "Bonus ($/day)" ↵ Shift+↓ ×5 "=IFS(C5>=350,150,C5>=300,100,C5>=250,50,TRUE,0)" Ctrl+↵`,
    fill('Summary!M5:M10', '=AND(C5<D5,L5>2)'), fill('Summary!N5:N10', '=IF(AND(C5<D5,L5>2),"Concern","-")')].join(' '),
  counts: [fill('Summary!C15:C20', `=COUNTIF(${TB},B15)`), fill('Summary!D15:D20', `=COUNTIFS(${TB},B15,${TD},"<>")`), fill('Summary!E15:E20', `=COUNTIFS(${TB},B15,${TE},">0")`),
    fill('Summary!C21:E21', '=SUM(C15:C20)'), fill('Summary!C25:C27', `=COUNTIF(${TC},B25)`), fill('Summary!D25:D27', `=COUNTIFS(${TC},B25,${TD},"")`), fill('Summary!C28:D28', '=SUM(C25:C27)')].join(' '),
  revenue: [fill('Summary!F15:F20', `=SUMIF(${TB},B15,${TE})`), fill('Summary!G15:G20', `=AVERAGEIFS(${TE},${TB},B15,${TE},">0")`),
    `Ctrl+G "Summary!F21" ↵ "=SUM(F15:F20)" Tab "=F21/E21" ↵ ← ×3 "Member washes carry $0; membership revenue is the fee times active members" ↵`].join(' '),
  'members-revenue': [fill('Summary!L15:L20', '=COUNTIFS(Members!$C$5:$C$44,B15,Members!$F$5:$F$44,"")'), fill('Summary!M15:M20', '=L15*Members!$L$2'), fill('Summary!N15:N20', '=F15+M15'),
    fill('Summary!O15:O20', '=SUMIF(Daily!$B$5:$B$94,B15,Daily!$D$5:$D$94)'), fill('Summary!L21:O21', '=SUM(L15:L20)')].join(' '),
  'by-package': [fill('Summary!C34:E39', `=COUNTIFS(${TB},$B34,${TC},C$33)`), fill('Summary!F34:H39', `=SUMIFS(${TE},${TB},$B34,${TC},F$33)`), fill('Summary!C40:H40', '=SUM(C34:C39)')].join(' '),
  league: [`Ctrl+G "Summary!J15" ↵ "=LARGE($C$15:$C$20,1)" ↵ "=LARGE($C$15:$C$20,2)" ↵ "=LARGE($C$15:$C$20,3)" ↵ "=SMALL($C$15:$C$20,1)" ↵`,
    fill('Summary!K15:K20', '=RANK(C15,$C$15:$C$20)'), `Ctrl+G "Summary!C29" ↵ "=SUMPRODUCT(D25:D27,E25:E27)" ↵ "=F21/C21" ↵`].join(' '),
  reconciliation: [fill('Summary!C44:C49', '=C15'),
    tallies ? `Ctrl+G "Summary!D44" ↵ ${TALLIES.map(t => `"${t}" ↵`).join(' ')} Ctrl+G "Summary!D44:D49" ↵ ${BLUE}` : '',
    fill('Summary!E44:E49', '=D44-C44'), fill('Summary!F44:F45', 'A wash the tally missed; the POS row carried a trailing space'), fill('Summary!G44:G45', '1'),
    `Ctrl+G "Summary!F46" ↵ "Re-wash counted twice, 9/22" Tab "-1" ↵ ↓ "Sep 30 tallied, a day the POS rows do not cover" Tab "-2" ↵`,
    `Ctrl+G "Summary!F44:G46" ↵ ${BLUE} Ctrl+G "Summary!F48:G48" ↵ ${BLUE}`,
    fill('Summary!H44:H49', '=D44+G44'), fill('Summary!I44:I49', '=H44-C44'), fill('Summary!C50:E50', '=SUM(C44:C49)'), fill('Summary!G50:I50', '=SUM(G44:G49)')].filter(Boolean).join(' '),
  'loan-case': [`Ctrl+G "Loans!C12" ↵ "=C7/C9" ↵ "=C8*C9" ↵ ↓ ×2 "=-PMT(C12,C13,C6)" ↵ "=C16*C13" ↵ "=C17-C6" ↵`,
    fill('Loans!C27:H27', '=1/(1+$C$26)^C21'), fill('Loans!C28:H28', '=C25*C27'),
    `Ctrl+G "Loans!C29" ↵ "=SUM(C28:H28)" ↵ "=NPV(C26,D25:H25)+C25" ↵ "=IRR(C25:H25)" ↵ "=C25" ↵`, fill('Loans!D32:H32', '=C32+D25'),
    fill('Loans!C33:G33', '=IF(AND(C32<0,D32>=0),-C32/D25,0)'), `Ctrl+G "Loans!C34" ↵ '=COUNTIF(C32:H32,"<0")+SUM(C33:G33)' ↵`].join(' '),
  schedule: [`Ctrl+G "Loans!C38" ↵ "1" ↵ ↑ Shift+↓ ×11 Alt H F I S ↵ ${BLUE} → "=C6" ↵ Shift+↓ ×10 "=G38" Ctrl+↵`,
    fill('Loans!E38:E49', '=D38*$C$12'), fill('Loans!F38:F49', '=$C$16-E38'), fill('Loans!G38:G49', '=D38-F38'),
    fill('Loans!H38:H49', '=-IPMT($C$12,C38,$C$13,$C$6)'), fill('Loans!I38:I49', '=-PPMT($C$12,C38,$C$13,$C$6)'), fill('Loans!J38:J49', '=SUM($E$38:E38)'),
    `Ctrl+G "Loans!C53" ↵ "=ROUND(C6-SUM(F38:F49)-G49,2)" ↵`].join(' '),
  'old-block': [fill('Summary!D54:D59', `=SUMIF(${TB},B54,${TE})`), `Ctrl+G "Summary!C57" ↵ "=C18" ↵`,
    `Ctrl+G "Summary!C61" ↵ "610" Tab "Databook FY25, Summary F21" ↵ ↑ Shift+→ ${BLUE}`,
    `↓ ×2 ← "Price uplift (x)" Tab "1.05" ↵ ↑ → ${BLUE} Ctrl+1 N Tab N Alt+D 2 Alt+U Alt+N ↓ ↓ ↵`, fill('Summary!E54:E59', '=D54*$C$63')].join(' '),
  checks: [`Ctrl+G "Summary!C68" ↵ "=C21-C28" ↵ "=C21-COUNTA(Transactions!$A$5:$A$94)" ↵ "=F21-C29" ↵ "=I50" ↵ "=Loans!C53" ↵`,
    `'=COUNTIF(Members!$J$5:$J$44,"Active")+COUNTIF(Members!$J$5:$J$44,"Cancelled")-COUNTA(Members!$B$5:$B$44)' ↵ ↑ Shift+↑ ${GREEN}`,
    `↓ '=COUNTIF(C68:C73,"<>0")' ↵ '=IF(C74=0,"OK","CHECK")' ↵ Ctrl+G "Summary!C2" ↵ "=C75" ↵`,
    `Ctrl+Space Ctrl+G Alt+S F U G E ↵ Alt H L H E "CHECK" ↵`].join(' '),
});

const REQUIRES = {
  'clean-export': ['go-to', 'find-replace', 'replace-all', 'ctrl-enter-fill', 'formula-basics', 'relative-absolute', 'keytips'],
  'period-keys': ['go-to', 'ctrl-enter-fill', 'formula-basics'],
  dates: ['go-to', 'ctrl-enter-fill', 'relative-absolute', 'cross-sheet-ref', 'font-color', 'link-colour-convention', 'input-colour-convention', 'sum-family', 'ctrl-arrow', 'keytips', 'arrow-keys'],
  flags: ['go-to', 'ctrl-enter-fill', 'formula-basics', 'sum-family', 'type-to-enter', 'shift-arrow'],
  counts: ['go-to', 'ctrl-enter-fill', 'cross-sheet-ref', 'relative-absolute', 'sum-family'],
  revenue: ['go-to', 'ctrl-enter-fill', 'cross-sheet-ref', 'relative-absolute', 'sum-family', 'tab-commits', 'type-to-enter', 'arrow-keys'],
  'members-revenue': ['go-to', 'ctrl-enter-fill', 'cross-sheet-ref', 'relative-absolute', 'sum-family'],
  'by-package': ['go-to', 'ctrl-enter-fill', 'cross-sheet-ref', 'relative-absolute', 'sum-family'],
  league: ['go-to', 'ctrl-enter-fill', 'relative-absolute', 'formula-basics'],
  reconciliation: ['go-to', 'ctrl-enter-fill', 'check-cell', 'input-colour-convention', 'font-color', 'type-to-enter', 'tab-commits', 'sum-family', 'keytips', 'arrow-keys'],
  'loan-case': ['go-to', 'pmt-pv-fv', 'npv', 'irr', 'ctrl-enter-fill', 'relative-absolute', 'formula-basics', 'arrow-keys'],
  schedule: ['go-to', 'loan-schedule', 'running-total', 'pmt-pv-fv', 'fill-series', 'font-color', 'input-colour-convention', 'ctrl-enter-fill', 'relative-absolute', 'check-cell', 'shift-arrow', 'keytips'],
  'old-block': ['go-to', 'ctrl-enter-fill', 'edit-links', 'input-colour-convention', 'font-color', 'format-cells-dialog', 'number-formats', 'tab-commits', 'relative-absolute', 'shift-arrow', 'arrow-keys', 'keytips'],
  checks: ['go-to', 'check-cell', 'rollup-flag', 'cross-sheet-ref', 'link-colour-convention', 'font-color', 'goto-special-types', 'go-to-special', 'row-col-select', 'conditional-format-code', 'shift-arrow', 'arrow-keys', 'keytips'],
};
const CONVENTION = { 'clean-export': 'F3', 'period-keys': 'C3', dates: 'B2', flags: 'C3', counts: 'E2', revenue: 'E2', 'members-revenue': 'B2', 'by-package': 'E2', league: 'E2',
  reconciliation: 'B6', 'loan-case': 'C4', schedule: 'B1', 'old-block': 'B4', checks: 'F1' };

/** The goal list for one route; the project and the assessment differ in their text, the tallies and how loosely a figure is read. */
export function goalsFor(texts, opts = {}) {
  const keys = keysFor(opts);
  const o = { byValue: !!opts.byValue };
  return Object.keys(texts).map(id => ({ id, text: texts[id], convention: CONVENTION[id], keys: keys[id], requires: REQUIRES[id],
    check: (s, ses) => settled(ses) && CHECKS[id](ses, o) }));
}

export const TEXTS = {
  'clean-export': 'On Transactions trim the codes in B, turn the text amounts in E into numbers, then LEN, LEFT, RIGHT and the MID channel in R, S, T and W.',
  'period-keys': 'Give every export row its period keys in G:K: the month key by TEXT, the month end, the quarter, the quarter label and the week of.',
  dates: 'Age the sites on Sites J:K, link Summary L5:L10 to the years in green, then set the $30 fee blue in Members L2 and build its tenure block.',
  flags: 'Fill the flags block: the flag, on target and above target in E:G, sites on target in F12, the Bonus ($/day) by IFS in I and Concern in M:N.',
  counts: 'Count the export: washes, member washes and retail washes by site in C15:E21, then washes and retail washes by package in C25:D28.',
  revenue: 'Add retail revenue by SUMIF and the average ticket by AVERAGEIFS in F15:G21, and a note in C22 that member washes carry $0.',
  'members-revenue': 'Count active members by site in L15:L20, then membership revenue, total revenue and washes from Daily, with totals in row 21.',
  'by-package': 'Fill site by package: washes by COUNTIFS in C34:E39 and retail revenue by SUMIFS in F34:H39, one formula each, totals in row 40.',
  league: 'Rank the sites by LARGE, SMALL and RANK in J15:K20, then retail revenue by SUMPRODUCT and the blended ticket in C29:C30.',
  reconciliation: 'Reconcile C44:I50: link the counts, type the tallies 10, 16, 22, 16, 16, 11 blue, then explain each gap in blue until I reads 0.',
  'loan-case': 'On Loans build the rate, periods, payment and totals in C12:C18, then the case: factors, NPV both ways, IRR and payback.',
  schedule: 'Build the schedule’s first twelve months in rows 38 to 49, months blue, with IPMT, PPMT and the running interest, and its check in C53.',
  'old-block': 'Fix the old block: full ranges in D54:D59, a link in C57, 610 blue with its source in C61, the 1.05 uplift a blue input in C63.',
  checks: 'Fill the checks in C68:C75, the two reading other sheets green, link the flag into C2, and turn CHECK red in both cells.',
};
const GOALS = goalsFor(TEXTS, { byValue: true });

export default {
  id: 'ch3-project',
  chapter: 'formulas',
  section: 'Project and assessment',
  module: 'ch3-project-and-assessment',
  workbook: 'clearcoat-databook',
  kind: 'project',
  state: { before: 'S7raw', after: 'S7done' },
  title: 'Project: the KPI databook',
  difficulty: 'hard',
  tags: ['project', 'formulas', 'databook', 'audit'],
  access: 'paid',
  minutes: 15,
  headline: 'Ctrl+Enter',
  conventions: ['B1', 'B2', 'B4', 'B6', 'C3', 'C4', 'E2', 'F1', 'F3'],
  uses: [...new Set(Object.values(REQUIRES).flat())],
  prerequisites: ['challenge-six-faults'],
  brief: 'The San Antonio cluster has sent the same fortnight’s export, and its databook is the Austin one with every formula taken out. Build it again in one sitting: the export cleaned, the keys and dates, the counts and revenue, the reconciliation, the loan and the case, the old block fixed and the checks reading OK. No clock, and nothing here is new. The key is `Ctrl+Enter`.',
  wow: 'A raw export in, a databook out that says OK at the top, and that is Chapter 3.',
  goals: [
    ...GOALS,
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Transactions!E5" Enter "150" Enter Ctrl+G "Summary!C2" Enter Escape Escape Escape', cadence: 320 },
      text: 'Does it tie? Watch the first amount on Transactions change to 150 and the flag in C2 turn to CHECK in red.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The export is clean and keyed, and the dates, counts, revenue and league table are live formulas', check: (s, ses) => ['clean-export', 'period-keys', 'dates', 'flags', 'counts', 'revenue', 'members-revenue', 'by-package', 'league'].every(k => CHECKS[k](ses, {})) },
    { text: 'The reconciliation explains every gap, and the loan, the case and the schedule are built', check: (s, ses) => ['reconciliation', 'loan-case', 'schedule'].every(k => CHECKS[k](ses, {})) },
    { text: 'The old block is fixed and the checks roll up to an OK flag at the top of the Summary', check: (s, ses) => CHECKS['old-block'](ses, {}) && CHECKS.checks(ses, {}) },
  ],
  closing: [
    'A raw export in, a databook out: the data cleaned and keyed, every count and sum a live formula, the gaps to the tallies explained, the case valued and the checks rolled up to one flag.',
    'A buyer’s analyst reads the flag first and then the reconciliation. Now the same databook on a fresh export, on the clock.',
  ],
  solution: hintToScript(GOALS.map(g => g.keys).join(' ')),
};
