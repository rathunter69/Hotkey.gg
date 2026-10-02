// Chapter 4 · 4.2.C Challenge: a dump into a filtered, deduplicated list (seeded over S42C)
// The copy on Export sort arrives as a raw dump, its ninety rows in the order the seed shuffles
// them; the unique site list on Lists is gone, and so are the case picker's and the washes inputs'
// rules. Sort the dump two levels, filter it to Airport and count what shows with SUBTOTAL, rebuild
// the unique list with Remove Duplicates and prove it with COUNTIF, and put back the drop-down and
// the number limit. Seeds pick the order; the workload never moves: the same keys pass every seed.
import { workbookState } from '../workbooks/index.js';
import { exportSheet, copySheet, lists, scenarios, rowsOf, sameText, calls, live, settled, ruleAt } from './lib/pack-checks.js';
import { parseRef } from '../../engine/refs.js';
import { parsFrom } from '../../app/pars.js';

const COLS = 'ABCDEFG';
const CODES = ['AUS-DOM', 'AUS-MUE', 'AUS-RIV', 'AUS-SLA', 'AUS-AIR', 'AUS-CED'];
const CASES = ['Management', 'Base', 'Downside'];
const SITE = 'AUS-AIR';

/** The seed: the copy's ninety rows shuffled, a cell for the count, the unique list cleared to its headers, the Scenarios rules gone. */
export function seedDump(rng) {
  const st = workbookState('clearcoat-pack', 'S42C');
  const cp = st.sheets.find(s => s.name === 'Export sort').cells;
  const order = Array.from({ length: 90 }, (_, i) => 5 + i);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const p = {};
  order.forEach((src, k) => {
    const r = 5 + k;
    for (const c of COLS) {
      const cell = cp[c + src];
      p[`Export sort!${c}${r}`] = !cell ? null : cell.formula ? { ...cell, formula: `=C${r}+D${r}` } : { ...cell };
    }
  });
  p['Export sort!I2'] = { value: 'Rows showing', bold: true };
  for (let r = 4; r <= 10; r++) p['Lists!N' + r] = null;
  for (let r = 5; r <= 10; r++) p['Lists!O' + r] = { fontColor: 'green', fmtStyle: 'comma', decimals: 0 };
  p['Lists!O11'] = { bold: true, bt: true, fmtStyle: 'comma', decimals: 0 };
  p['Scenarios!#validation'] = null;
  return p;
}

const key = x => [x.date, x.site, x.retail, x.member, x.revenue, x.hours].join('|');
const complete = ses => { const a = rowsOf(exportSheet(ses)).map(key).sort(), b = rowsOf(copySheet(ses)).map(key).sort(); return a.every((k, i) => k === b[i]); };
const sorted = ses => { const rows = rowsOf(copySheet(ses)); return complete(ses) && rows.every((x, i) => i === 0 || (String(rows[i - 1].site).localeCompare(String(x.site)) || rows[i - 1].date - x.date) <= 0); };
const showing = sh => rowsOf(sh).filter(x => !sh.filterRows.has(x.r));
const filtered = ses => { const sh = copySheet(ses); const v = showing(sh); return !!sh.filter && v.length === 15 && v.every(x => sameText(x.site, SITE)); };
const counted = ses => { const sh = copySheet(ses); return calls(sh, 'J2', ['SUBTOTAL']) && /103/.test(sh.formula('J2') || '') && sh.value('J2') === showing(sh).length; };
const listed = ses => { const l = lists(ses); const v = [5, 6, 7, 8, 9, 10].map(r => l.value('N' + r)); return CODES.every(c => v.some(x => sameText(x, c))) && (l.value('N11') == null || l.value('N11') === ''); };
const count = (ses, code) => rowsOf(exportSheet(ses)).filter(x => sameText(x.site, code)).length;
const proof = ses => { const l = lists(ses); return [5, 6, 7, 8, 9, 10].every(r => calls(l, 'O' + r, ['COUNTIF']) && l.value('O' + r) === count(ses, l.value('N' + r))) && calls(l, 'O11', ['SUM']) && l.value('O11') === 90 && live(l, 'O5'); };
const items = (ses, sh, ref) => { const rule = ruleAt(sh, ref); return rule && rule.allow === 'list' ? ses.validationItems(sh, rule, parseRef(ref)) : []; };
const picker = ses => { const got = items(ses, scenarios(ses), 'C10'); return got.length === 3 && CASES.every((c, i) => sameText(got[i], c)); };
const limit = ses => ['C5', 'D5', 'E5'].every(ref => { const r = ruleAt(scenarios(ses), ref); return !!r && r.allow === 'whole' && (r.data || 'between') === 'between' && +r.min === 100 && +r.max === 600; });
const F = { count: '=SUBTOTAL(103,A5:A94)', countif: '=COUNTIF(Export!$B$5:$B$94,N5)' };

export default {
  id: 'challenge-filtered-list',
  chapter: 'data-and-lookups',
  section: 'Lists and tables',
  module: 'lists-and-tables',
  workbook: 'clearcoat-pack',
  state: { before: 'S42C' },
  kind: 'challenge',
  title: 'Challenge: a dump into a filtered, deduplicated list',
  difficulty: 'hard',
  tags: ['challenge', 'data', 'lists'],
  access: 'paid',
  minutes: 3,
  conventions: ['F1', 'B1'],
  prerequisites: ['dynamic-arrays'],
  brief: 'A raw dump on Export sort. Sort it two levels, filter Airport and count what shows with SUBTOTAL, rebuild the unique site list and prove it, and put back the case drop-down and the washes limit.',
  timeLimit: 180,
  pars: parsFrom(100, { pass: 175, pro: 130 }),
  seed: rng => seedDump(rng),
  goals: [
    { id: 'sort', text: 'Sort Export sort by Site, then by Date oldest to newest, in one Sort dialog.',
      keys: 'Ctrl+G "\'Export sort\'!A5" ↵ Alt A S S S Alt+A ↵',
      check: (s, ses) => settled(ses) && sorted(ses) },
    { id: 'filter', text: 'Filter the copy to AUS-AIR and count the rows showing in J2 with =SUBTOTAL(103,A5:A94).',
      keys: `Ctrl+Shift+L ↑ → Alt+↓ E "AIR" ↵ ↑ ×2 Ctrl+→ → "${F.count}" ↵`,
      check: (s, ses) => settled(ses) && filtered(ses) && counted(ses) },
    { id: 'unique', text: 'Copy Export!B4:B94 to Lists!N4 and run Remove Duplicates: the six site codes.',
      keys: 'Ctrl+G "Export!B4" ↵ Ctrl+Shift+↓ Ctrl+C Ctrl+G "Lists!N4" ↵ Ctrl+V Alt A M ↵',
      check: (s, ses) => settled(ses) && listed(ses) },
    { id: 'proof', text: 'Prove the list in O5:O10 with COUNTIF against the export, and total it in O11: ninety rows.',
      keys: `→ ↓ Shift+↓ ×5 "${F.countif}" Ctrl+↵ Ctrl+↓ ↓ Alt+= ↵`,
      check: (s, ses) => settled(ses) && listed(ses) && proof(ses) },
    { id: 'picker', text: 'Make Scenarios!C10 a drop-down of the cases in Lists!$L$5:$L$7.',
      keys: 'Ctrl+G "Scenarios!C10" ↵ Alt A V V L Tab "=Lists!$L$5:$L$7" ↵',
      check: (s, ses) => settled(ses) && picker(ses) },
    { id: 'limit', text: 'Limit the washes a day inputs Scenarios!C5:E5 to a whole number from 100 to 600.',
      keys: 'Ctrl+G "Scenarios!C5" ↵ Shift+→ ×2 Alt A V V W Tab ×2 "100" Tab "600" ↵',
      check: (s, ses) => settled(ses) && limit(ses) },
  ],
  graders: [
    ses => (sorted(ses) ? { ok: true } : { ok: false, why: 'Export sort is not in site then date order with all ninety rows. Sort the copy by both levels in one dialog' }),
    ses => (rowsOf(exportSheet(ses)).every((x, i, all) => i === 0 || x.date >= all[i - 1].date) ? { ok: true } : { ok: false, why: 'the export itself has been reordered. Sorting only ever happens on the copy' }),
    ses => (proof(ses) ? { ok: true } : { ok: false, why: 'the COUNTIF proof on Lists does not total ninety from live formulas. Each code is counted against the export data' }),
  ],
  solution: 'Ctrl+G "\'Export sort\'!A5" Enter Alt A S S S Alt+A Enter '
    + `Ctrl+Shift+L Up Right Alt+Down E "AIR" Enter Up Up Ctrl+Right Right "${F.count}" Enter `
    + 'Ctrl+G "Export!B4" Enter Ctrl+Shift+Down Ctrl+C Ctrl+G "Lists!N4" Enter Ctrl+V Alt A M Enter '
    + `Right Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down "${F.countif}" Ctrl+Enter Ctrl+Down Down Alt+= Enter `
    + 'Ctrl+G "Scenarios!C10" Enter Alt A V V L Tab "=Lists!$L$5:$L$7" Enter '
    + 'Ctrl+G "Scenarios!C5" Enter Shift+Right Shift+Right Alt A V V W Tab Tab "100" Tab "600" Enter',
};
