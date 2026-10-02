// Chapter 3 · 3.4.C Challenge: a text dump into a usable table (seeded over S3f)
// A raw dump from the San Antonio cluster laid over the module's start: every row of Transactions
// changes with the seed, two site codes carry a stray space and three amounts arrive as text, and
// Summary's codes and the managers' tallies follow the cluster. The challenge trims the codes at the
// source through a helper and Paste Special Values, parses the channel out of the memo, turns the
// text amounts into numbers the same way and clears the helper, splits the codes into cluster and
// site with one Text to Columns, and reads the checks block at zero. Seeds pick the dump; the
// workload never moves: the same keys pass every seed.
import { SAN_ANTONIO, PACKAGES, TX_FIRST, TX_ROWS, memoOf, stateOf } from '../workbooks/clearcoat-databook.js';
import { summary, transactions, settled, selected, onSheet, near, isNum } from './lib/databook-checks.js';
import { parsFrom } from '../../app/pars.js';

const CODES = SAN_ANTONIO.sites.map(s => s.code);
const CHANNELS = ['kiosk', 'app', 'attendant'];
const OFFSET = { 53: 1, 55: 2 };   // the managers who over-counted; S3f already carries their adjustments (-1, -2) in G53 and G55
const R1 = TX_FIRST, R2 = TX_FIRST + TX_ROWS - 1;

/** Distinct row indexes, drawn from `from` (inclusive) to TX_ROWS. */
function distinct(rng, n, from, ok = () => true) {
  const out = [];
  while (out.length < n) { const i = from + Math.floor(rng() * (TX_ROWS - from)); if (!out.includes(i) && ok(i)) out.push(i); }
  return out;
}

/** The seed: a raw San Antonio dump over Transactions (stray spaces, text amounts), the codes on Summary, and the managers' tallies. */
export function seedDump(rng) {
  const base = stateOf('S3f');
  const sum = base.sheets.find(s => s.name === 'Summary').cells;
  const pick = arr => arr[Math.floor(rng() * arr.length)];
  const p = {};
  const counts = CODES.map(() => 0);
  const rows = [];
  for (let i = 0; i < TX_ROWS; i++) {
    const s = i < CODES.length ? i : Math.floor(rng() * CODES.length);   // every site has a retail wash
    const member = i >= CODES.length && rng() < 0.4;
    const pkg = pick(['B', 'D', 'D', 'U']);
    rows.push({ site: CODES[s], pkg, member, channel: pick(CHANNELS), amount: member ? 0 : PACKAGES.find(x => x.code === pkg).price });
    counts[s]++;
  }
  const dirty = distinct(rng, 2, CODES.length), text = distinct(rng, 3, CODES.length, i => !rows[i].member);
  rows.forEach((t, i) => {
    const r = TX_FIRST + i;
    p[`Transactions!B${r}`] = { value: t.site + (dirty.includes(i) ? ' ' : '') };
    p[`Transactions!C${r}`] = { value: t.pkg };
    p[`Transactions!D${r}`] = t.member ? { value: 'M' + String(1 + Math.floor(rng() * 40)).padStart(4, '0') } : null;
    p[`Transactions!E${r}`] = { value: text.includes(i) ? String(t.amount) : t.amount };
    p[`Transactions!F${r}`] = { value: memoOf(t) };
  });
  CODES.forEach((c, i) => { for (const r of [15 + i, 41 + i, 51 + i]) p[`Summary!B${r}`] = { ...sum['B' + r], value: c }; });
  for (let i = 0; i < 6; i++) { const r = 51 + i; p[`Summary!D${r}`] = { ...sum['D' + r], value: counts[i] + (OFFSET[r] || 0) }; }
  return p;
}

const str = v => (typeof v === 'string' ? v : v == null ? '' : String(v));
const codeAt = (t, r) => str(t.value('B' + r));
const cleanCodes = ses => { const t = transactions(ses); if (!t) return false; for (let r = R1; r <= R2; r++) if (!/^[A-Z]{3}-[A-Z]{3}$/.test(codeAt(t, r))) return false; return true; };
const channels = ses => { const t = transactions(ses); if (!t) return false; for (let r = R1; r <= R2; r++) { const m = str(t.value('F' + r)); if (t.value('W' + r) !== m.slice(m.indexOf('(') + 1, m.indexOf(')'))) return false; } return true; };
const amounts = ses => { const t = transactions(ses); if (!t) return false; for (let r = R1; r <= R2; r++) { if (t.cellAt('E' + r).formula || !isNum(t.value('E' + r))) return false; } return true; };
const helperGone = ses => { const t = transactions(ses); if (!t) return false; for (let r = R1; r <= R2; r++) { const c = t.cellAt('Z' + r); if (c.formula || (c.value != null && c.value !== '')) return false; } return true; };
const split = ses => { const t = transactions(ses); if (!t) return false; for (let r = R1; r <= R2; r++) { const [a, b] = codeAt(t, r).trim().split('-'); if (t.value('S' + r) !== a || t.value('T' + r) !== b) return false; } return true; };
const checksZero = ses => { const sh = summary(ses); return !!sh && [80, 81, 82, 83].every(r => near(sh.value('C' + r), 0)); };
const F = {
  trim: '=TRIM(B5)',
  channel: '=MID(F5,FIND("(",F5)+1,FIND(")",F5)-FIND("(",F5)-1)',
  value: '=VALUE(E5)',
};

export default {
  id: 'challenge-text-dump',
  chapter: 'formulas',
  section: 'Text',
  module: 'text',
  workbook: 'clearcoat-databook',
  state: { before: 'S3f' },
  kind: 'challenge',
  title: 'Challenge: a text dump into a usable table',
  difficulty: 'hard',
  tags: ['challenge', 'formulas', 'text', 'data'],
  access: 'paid',
  minutes: 3,
  conventions: ['E4', 'F1'],
  prerequisites: ['text-to-columns-flash-fill'],
  brief: 'A raw dump from the San Antonio cluster: codes with stray spaces, memos with three facts, amounts as text. Make it a table the formulas can read, and bring the checks to zero.',
  timeLimit: 180,
  pars: parsFrom(95, { pass: 178, pro: 140 }),
  seed: rng => seedDump(rng),
  goals: [
    { id: 'trim', text: 'Clean the codes at the source: =TRIM(B5) in a helper Z5:Z94, then paste its values over B5:B94.',
      keys: `Ctrl+G "Transactions!Z5:Z94" ↵ "${F.trim}" Ctrl+↵ Ctrl+C Ctrl+G "B5:B94" ↵ Ctrl+Alt+V V ↵ Esc`,
      check: (s, ses) => settled(ses) && cleanCodes(ses) },
    { id: 'channel', text: 'Parse the channel out of every memo into W5:W94 with MID and FIND.',
      keys: `Ctrl+G "W5:W94" ↵ '${F.channel}' Ctrl+↵`,
      check: (s, ses) => settled(ses) && channels(ses) },
    { id: 'amounts', text: 'Turn the text amounts into numbers: =VALUE(E5) in Z5:Z94, paste its values over E5:E94, then clear the helper.',
      keys: `Ctrl+G "Z5:Z94" ↵ "${F.value}" Ctrl+↵ Ctrl+C Ctrl+G "E5:E94" ↵ Ctrl+Alt+V V ↵ Esc Ctrl+G "Z5:Z94" ↵ Delete`,
      check: (s, ses) => settled(ses) && amounts(ses) && helperGone(ses) },
    { id: 'split', text: 'Split the codes into the cluster in S5:S94 and the site in T5:T94 with one Text to Columns on the hyphen.',
      keys: 'Ctrl+G "B5:B94" ↵ Alt A E Alt+D ↵ Alt+O "-" Alt+N Alt+E "$S$5" Alt+F',
      check: (s, ses) => settled(ses) && split(ses) },
    { id: 'checks', text: 'Read the checks on Summary in C80:C83: with the dump clean, all four read zero.',
      keys: 'Ctrl+G "Summary!C80:C83" ↵',
      check: (s, ses) => settled(ses) && onSheet(ses, 'Summary') && selected(summary(ses), 'C80:C83') && checksZero(ses) },
  ],
  graders: [
    ses => cleanCodes(ses) && split(ses) ? { ok: true } : { ok: false, why: 'a site code still carries a stray space, or the cluster and site in S and T do not match it. Clean the code at the source, then split it' },
    ses => amounts(ses) && helperGone(ses) ? { ok: true } : { ok: false, why: 'an amount in E5:E94 is still text, or the helper is still on the sheet. Convert, paste the values, then clear the helper so nothing depends on it' },
    ses => checksZero(ses) ? { ok: true } : { ok: false, why: 'a check in Summary C80:C83 does not read zero. A clean export ties every check' },
  ],
  solution: `Ctrl+G "Transactions!Z5:Z94" Enter "${F.trim}" Ctrl+Enter Ctrl+C Ctrl+G "B5:B94" Enter Ctrl+Alt+V V Enter Escape `
    + `Ctrl+G "W5:W94" Enter '${F.channel}' Ctrl+Enter `
    + `Ctrl+G "Z5:Z94" Enter "${F.value}" Ctrl+Enter Ctrl+C Ctrl+G "E5:E94" Enter Ctrl+Alt+V V Enter Escape Ctrl+G "Z5:Z94" Enter Delete `
    + 'Ctrl+G "B5:B94" Enter Alt A E Alt+D Enter Alt+O "-" Alt+N Alt+E "$S$5" Alt+F '
    + 'Ctrl+G "Summary!C80:C83" Enter',
};
