// Chapter 4 · 4.7.P Project: the diligence pack (clearcoat-pack, SPraw → SPdone)
// The fortnight after the chapter's export (Oct 1 to 15), with the pack cut back to its page: the
// misspelt code planted again, the unique site list and its proof gone, the site block, the KPI
// block, both cubes, the window's sums and the checks blank on Summary, the case switch, the driver,
// the outputs and break-even blank on Scenarios, no names, the pickers on the Lists ranges, and eight
// questions open in the log. Every page around them (the labels and formats, the per-hour ranking,
// the roll-up, the sensitivity grids, the dashboard, the site tabs) arrives built and reads the
// fresh export. Fourteen goals and the closer, no teach lines: nothing here is new.
// The assessment (4.7.A) runs the same goals on Dallas's pack with a reseeded export, so the goal
// checks read structure (each formula against the finished pack, spacing and case ignored); the
// project also accepts any formula that lands on the finished figure.
import { hintToScript } from '../../app/runner.js';
import { rangeRefs } from '../../engine/refs.js';
import { stateOf, NAMES, SITES, PLANT, misspell, breakEvenOf } from '../workbooks/clearcoat-pack.js';
import { listMatches } from './name-manager.js';
import { pickerReads } from './validation-list-by-name.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const settled = ses => !ses.editing && !ses.dialog;
const norm = f => String(f || '').replace(/\s/g, '').toUpperCase();
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const near = (a, b) => (isNum(a) && isNum(b) ? Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b)) : a === b);
const refsOf = spec => spec.split(',').flatMap(part => { const [a, b] = part.trim().split(':'); return rangeRefs(a, b || a); });

/**
 * The cells of `spec` on sheet `name` match the finished pack `done`: a formula where it has one (the
 * same text, spacing and case ignored, or with `byValue` any formula landing on the finished figure),
 * a typed value where it has one, empty where it is empty.
 */
export function packLike(ses, done, name, spec, { byValue = false } = {}) {
  const sh = sheetOf(ses, name), dn = done.sheets.find(s => s.name === name); if (!sh || !dn) return false;
  return refsOf(spec).every(ref => {
    const c = sh.cellAt(ref), d = dn.cells[ref] || {};
    if (d.formula) return !!c.formula && (norm(c.formula) === norm(d.formula) || (byValue && near(sh.value(ref), d.value)));
    if (c.formula) return false;
    if (d.value === undefined) return c.value === undefined || c.value === null || c.value === '';
    return c.value === d.value;
  });
}
const zeroChecks = (ses, name, spec) => { const sh = sheetOf(ses, name); return !!sh && refsOf(spec).every(ref => !!sh.cellAt(ref).formula && sh.value(ref) === 0); };
const namesAll = ses => Object.keys(NAMES).every(n => (ses.names || {})[n] === NAMES[n]);

/**
 * Each goal's end-state check for a pack (`done`: the finished state, `sites`: its six sites), shared
 * by the project and the assessment.
 */
export function checksFor(done, sites, o = {}) {
  const codes = sites.map(s => s.code);
  return {
    'clean-export': ses => { const sh = sheetOf(ses, 'Export'); return !!sh && refsOf('B5:B94').every(ref => codes.includes(sh.value(ref))); },
    'unique-list': ses => { const sh = sheetOf(ses, 'Lists'); if (!sh) return false; const got = refsOf('N5:N10').map(ref => sh.value(ref));
      return codes.every(c => got.includes(c)) && new Set(got).size === 6 && packLike(ses, done, 'Lists', 'O5:O11,C26', o) && sh.value('C26') === 0; },
    'site-block': ses => packLike(ses, done, 'Summary', 'C5:E10', o),
    'kpi-block': ses => packLike(ses, done, 'Summary', 'F5:M11', o),
    cubes: ses => packLike(ses, done, 'Summary', 'C15:F21,C25:F31', o),
    window: ses => packLike(ses, done, 'Summary', 'C50:C51', o),
    names: ses => namesAll(ses) && listMatches(ses),
    pickers: ses => pickerReads(ses, 'Scenarios', 'C10', 'Cases') && pickerReads(ses, 'Summary', 'C34', 'Sites'),
    switch: ses => packLike(ses, done, 'Scenarios', 'C11,G5:G8', o),
    driver: ses => packLike(ses, done, 'Scenarios', 'C13:C14', o),
    outputs: ses => packLike(ses, done, 'Scenarios', 'C17:C25', o),
    'break-even': ses => { const sh = sheetOf(ses, 'Scenarios'); return !!sh && packLike(ses, done, 'Scenarios', 'C41:C45', o) && sh.value('C43') === 250
      && !sh.cellAt('C46').formula && sh.value('C46') === Math.round(sh.value('C45')); },
    checks: ses => packLike(ses, done, 'Summary', 'C72:C77', o) && packLike(ses, done, 'Scenarios', 'C58:C60', o) && zeroChecks(ses, 'Summary', 'C72:C77') && zeroChecks(ses, 'Scenarios', 'C58:C60'),
    log: ses => { const sh = sheetOf(ses, 'Q&A'); return !!sh && packLike(ses, done, 'Q&A', 'F5:F16', o) && refsOf('E5:E14').every(ref => sh.value(ref) === 'Answered'); },
  };
}

/** Select a range by Go To and fill it with one formula: Ctrl+Enter writes it relative in every cell and keeps each cell's format. */
const fill = (range, formula) => `Ctrl+G "${range}" ↵ ${formula.includes('"') ? `'${formula}'` : `"${formula}"`} Ctrl+↵`;
const one = (ref, formula) => `Ctrl+G "${ref}" ↵ ${formula.includes('"') ? `'${formula}'` : `"${formula}"`} ↵`;
const EB = 'Export!$B$5:$B$94';
const DEF = (ref, name) => `Ctrl+G "${ref}" ↵ Alt M M D "${name}" ↵`;
const PICK = (ref, name) => `Ctrl+G "${ref}" ↵ Alt A V V Alt+C L Alt+S "=${name}" ↵`;

/** The route, goal by goal, for a pack's six sites. */
export const keysFor = (sites = SITES) => {
  const code = sites[PLANT.misspelt.site].code;
  return {
    'clean-export': `Ctrl+G "Export!B5" ↵ Ctrl+H "${misspell(code)}" Tab "${code}" Alt+A Esc`,
    'unique-list': [`Ctrl+G "Lists!N5" ↵`, ...sites.map(s => `"${s.code}" ↵`), fill('Lists!O5:O10', `=COUNTIF(${EB},N5)`), one('Lists!O11', '=SUM(O5:O10)'), one('Lists!C26', `=O11-COUNTA(${EB})`)].join(' '),
    'site-block': ['C', 'F', 'G'].map((c, i) => fill(`Summary!${'CDE'[i]}5:${'CDE'[i]}10`, `=INDEX(Lists!$${c}$5:$${c}$10,MATCH($B5,Lists!$B$5:$B$10,0))`)).join(' '),
    'kpi-block': [fill('Summary!F5:F10', '=D5*E5'), fill('Summary!G5:G10', `=COUNTIFS(${EB},$B5,Export!$G$5:$G$94,">0")`), fill('Summary!H5:H10', `=SUMIFS(Export!$E$5:$E$94,${EB},$B5)`),
      fill('Summary!I5:I10', '=H5/(F5*G5)'), fill('Summary!J5:J10', `=MAXIFS(Export!$E$5:$E$94,${EB},$B5)`), fill('Summary!K5:K10', '=J5/F5'),
      fill('Summary!L5:L10', `=SUMIFS(Export!$D$5:$D$94,${EB},$B5)`), fill('Summary!M5:M10', '=L5/H5'),
      `Ctrl+G "Summary!F11" ↵ "=SUM(F5:F10)" Tab Tab "=SUM(H5:H10)" Tab "=H11/SUMPRODUCT(F5:F10,G5:G10)" Tab "=MAX(J5:J10)" Tab Tab "=SUM(L5:L10)" Tab "=L11/H11" ↵`].join(' '),
    cubes: [fill('Summary!C15:E20', `=SUMIFS(Export!$E$5:$E$94,${EB},$B15,Export!$H$5:$H$94,C$14)`), fill('Summary!F15:F20', '=SUM(C15:E15)'), fill('Summary!C21:F21', '=SUM(C15:C20)'),
      fill('Summary!C25:E30', `=SUMIFS(Export!$F$5:$F$94,${EB},$B25,Export!$H$5:$H$94,C$24)`), fill('Summary!F25:F30', '=SUM(C25:E25)'), fill('Summary!C31:F31', '=SUM(C25:C30)')].join(' '),
    window: [one('Summary!C50', '=SUMIFS(Export!$E$5:$E$94,Export!$A$5:$A$94,">="&C48,Export!$A$5:$A$94,"<="&C49)'), `'=SUMIFS(Export!$F$5:$F$94,Export!$A$5:$A$94,">="&C48,Export!$A$5:$A$94,"<="&C49)' ↵`].join(' '),
    names: [DEF('Scenarios!C11', 'Case'), DEF('Lists!L5:L7', 'Cases'), DEF('Inputs!C5', 'Cost_Per_Wash'), DEF('Lists!N5:N10', 'Sites'), DEF('Inputs!C15', 'Ticket'), 'Ctrl+G "Inputs!B19" ↵ F3 Alt+L'].join(' '),
    pickers: [PICK('Scenarios!C10', 'Cases'), PICK('Summary!C34', 'Sites')].join(' '),
    switch: [one('Scenarios!G5', '=CHOOSE(Case,C5,D5,E5)'), 'Shift+↓ ×2 "=INDEX(C6:E6,Case)" Ctrl+↵', one('Case', '=MATCH(C10,Lists!$L$5:$L$7,0)')].join(' '),
    driver: one('Scenarios!C14', '=IF(C13="",Inputs!$C$15,C13)'),
    outputs: ['Ctrl+G "Scenarios!C17" ↵', ...['=G8*G5*Inputs!$C$10', '=C17*C14', '=-C17*Inputs!$C$5', '=-C17*(1-G7)*Inputs!$C$7', '=-G8*Inputs!$C$10*Inputs!$C$8', '=SUM(C18:C21)', '=-Inputs!$C$9', '=C22+C23', '=C24/C18'].map(f => `"${f}" ↵`)].join(' '),
    'break-even': ['Ctrl+G "Scenarios!C41" ↵ "=INDEX(Lists!$H$5:$H$10,MATCH(C40,Lists!$B$5:$B$10,0))" ↵ "=C14-Inputs!$C$5-(1-G7)*Inputs!$C$7" ↵ ↓ "=C43*C42-C41" ↵ "=C41/C42" ↵',
      `↑ ×2 Alt A W G Alt+V "0" Alt+C "C43" ↵ Esc ↓ ×2 "${breakEvenOf(sites[0]).goalSeek}" ↵`].join(' '),
    checks: [one('Summary!C72', '=F21-SUM(Export!$E$5:$E$94)'), '"=F31-SUM(Export!$F$5:$F$94)" ↵ "=ROUND(M11*H11-L11,0)" ↵ "=H11-F21" ↵ "=F67-F21" ↵ "=IF(AND(C72=0,C73=0,C74=0,C75=0,C76=0),0,1)" ↵',
      one('Scenarios!C58', '=INDEX($C$54:$E$54,Case)-C24'), '"=ROUND(C45,0)-C46" ↵ "=IF(AND(C25>=0,C25<=1),0,1)" ↵'].join(' '),
    log: ['Ctrl+G "\'Q&A\'!E6" ↵', ...['=Summary!I5', '=Summary!M11', '=Summary!C44', '=Summary!F21', '=Summary!J11'].map(f => `"Answered" Tab "${f}" ↵`),
      '↓', ...['=Summary!C51', '=Scenarios!E54', '=Scenarios!C46'].map(f => `"Answered" Tab "${f}" ↵`)].join(' '),
  };
};

const REQUIRES = {
  'clean-export': ['find-replace', 'replace-all', 'go-to'],
  'unique-list': ['countif-countifs', 'check-cell', 'ctrl-enter-fill', 'cross-sheet-ref', 'relative-absolute', 'go-to', 'type-to-enter'],
  'site-block': ['ctrl-enter-fill', 'cross-sheet-ref', 'relative-absolute', 'go-to'],
  'kpi-block': ['countif-countifs', 'sumif-sumifs', 'maxifs-minifs', 'sumproduct', 'sum-family', 'ctrl-enter-fill', 'relative-absolute', 'go-to', 'tab-commits', 'arrow-keys'],
  cubes: ['sumif-sumifs', 'sum-family', 'ctrl-enter-fill', 'relative-absolute', 'cross-sheet-ref', 'go-to'],
  window: ['sumif-sumifs', 'criteria-operators', 'go-to'],
  names: ['names-sparingly', 'defined-name', 'paste-list', 'go-to', 'keytips'],
  pickers: ['name-driven-list', 'go-to', 'keytips'],
  switch: ['names-sparingly', 'formula-basics', 'go-to', 'shift-arrow', 'ctrl-enter-fill'],
  driver: ['formula-basics', 'cross-sheet-ref', 'go-to'],
  outputs: ['formula-basics', 'sum-family', 'cross-sheet-ref', 'relative-absolute', 'go-to', 'type-to-enter'],
  'break-even': ['formula-basics', 'cross-sheet-ref', 'go-to', 'keytips', 'arrow-keys', 'type-to-enter'],
  checks: ['check-cell', 'sum-family', 'round-function', 'formula-basics', 'go-to'],
  log: ['cross-sheet-ref', 'go-to', 'tab-commits', 'type-to-enter'],
};
const CONVENTION = { 'clean-export': 'E3', 'unique-list': 'F1', 'site-block': 'C3', 'kpi-block': 'C3', cubes: 'C3', window: 'B4', names: 'C9', pickers: 'C9', switch: 'E9', driver: 'B4', outputs: 'C1', 'break-even': 'B6', checks: 'F1', log: 'B2' };

/** The goal list for one pack: the texts, the finished state the checks read, the sites the route types, and how loosely a figure is read. */
export function goalsFor(texts, { done, sites = SITES, byValue = false } = {}) {
  const keys = keysFor(sites), checks = checksFor(done, sites, { byValue });
  return Object.keys(texts).map(id => ({ id, text: texts[id], convention: CONVENTION[id], keys: keys[id], requires: REQUIRES[id],
    check: (s, ses) => settled(ses) && checks[id](ses) }));
}

export const TEXTS = {
  'clean-export': 'On Export replace the misspelt site code with the right one (Ctrl+H), so every row in B carries one of the six codes.',
  'unique-list': 'List the six site codes in Lists N5:N10, prove them with COUNTIF in O5:O11, and add the check in C26.',
  'site-block': 'Fill the site block on Summary C5:E10 by INDEX and MATCH from Lists: the site, its capacity and its hours open.',
  'kpi-block': 'Fill the KPI block on Summary F5:M11: capacity, days, washes, utilization, the peak, member washes and share, with totals.',
  cubes: 'Fill both cubes on Summary by SUMIFS on site and week: washes in C15:F21 and retail revenue in C25:F31, totals included.',
  window: 'Sum the washes and the retail revenue between the window’s two dates in Summary C50:C51 with SUMIFS.',
  names: 'Define Case, Cases, Cost_Per_Wash, Sites and Ticket with Alt M M D, then paste the list on Inputs from B19.',
  pickers: 'Point the case picker in Scenarios C10 at =Cases and the site picker in Summary C34 at =Sites.',
  switch: 'Wire the switch on Scenarios: the live column G5:G8 by CHOOSE and INDEX on Case, then Case itself in C11 by MATCH on the picker.',
  driver: 'Put the pass-through driver in Scenarios C14: the ticket on Inputs unless C13 holds a figure.',
  outputs: 'Build the outputs in Scenarios C17:C25 from the live column, from washes a year down to EBITDA and its margin.',
  'break-even': 'Build break-even in Scenarios C41:C45, Goal Seek C44 to 0 by changing C43, and note the answer in C46.',
  checks: 'Fill the checks in Summary C72:C77 and Scenarios C58:C60, every one a live difference reading 0.',
  log: 'Answer the eight open questions on Q&A: mark each Answered in E and link its answer in F to the cell that holds it.',
};
const DONE = stateOf('SPdone');
const GOALS = goalsFor(TEXTS, { done: DONE, byValue: true });
const CHECKS = checksFor(DONE, SITES, { byValue: true });
const all = (ses, ids) => ids.every(k => CHECKS[k](ses));

/** The closer: one export figure moved, the pack answers and the checks hold. */
export const TIE = { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Export!C5" Enter "500" Enter Ctrl+G "Summary!C72" Enter Escape Escape Escape', cadence: 320 },
  text: 'Does it tie? Watch the first retail count on Export jump to 500, the cubes and the KPI block move, and every check hold at 0.', requires: [],
  check: (s, ses) => ses.demoDone.has('tie') };

export default {
  id: 'ch4-project',
  chapter: 'data-and-lookups',
  section: 'Project and assessment',
  module: 'ch4-project-and-assessment',
  workbook: 'clearcoat-pack',
  kind: 'project',
  state: { before: 'SPraw', after: 'SPdone' },
  title: 'Project: the diligence pack',
  difficulty: 'hard',
  tags: ['project', 'lookups', 'scenarios', 'names', 'diligence'],
  access: 'paid',
  minutes: 15,
  headline: 'Ctrl+Enter',
  conventions: ['C3', 'C9', 'E9', 'F1', 'B2'],
  uses: [...new Set(Object.values(REQUIRES).flat())],
  prerequisites: ['challenge-toggles-named'],
  brief: 'The fortnight after the chapter’s export has landed, and the pack around it has been cut back to its pages: the KPI page blank, the case sheet with no switch wired, no names, and eight of the buyers’ questions open. Build it again in one sitting, from the clean export to the answered log, until every check reads 0. No clock, and nothing here is new. The key is `Ctrl+Enter`.',
  wow: 'A fresh export in, a diligence pack out with every question answered and every check at 0, and that is Chapter 4.',
  goals: [...GOALS, TIE],
  endState: [
    { text: 'The export is clean and the KPI page reads it: the site block, the KPI block, both cubes and the window', check: (s, ses) => all(ses, ['clean-export', 'unique-list', 'site-block', 'kpi-block', 'cubes', 'window']) },
    { text: 'The case is wired by name: the switch, the driver, the outputs and break-even, with both pickers on names', check: (s, ses) => all(ses, ['names', 'pickers', 'switch', 'driver', 'outputs', 'break-even']) },
    { text: 'Every check reads 0 and the eight questions point at their cells', check: (s, ses) => all(ses, ['checks', 'log']) },
  ],
  closing: [
    'A raw export in, a diligence pack out: the codes cleaned, the KPI page reading the export, the case wired to one switch by name, break-even found, every check at 0 and eight buyers’ questions pointing at the cells that answer them.',
    'This is the file a buyer’s analyst opens in the data room. Now the same pack on another cluster’s export, on the clock.',
  ],
  solution: hintToScript(GOALS.map(g => g.keys).join(' ')),
};
