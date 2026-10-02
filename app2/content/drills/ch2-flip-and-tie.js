// Practice · Formatting — Flip and tie (script-drills D24, D70, Wave 1; after 2.1.2). The P&L as the
// export left it (state S1a, costs positive), dressed in another analyst's formats: fills, italics, a
// larger size and colored figures over the lines, and the three subtotals that use the costs pasted
// in as values. The accounts' site contribution sits in the memo (row 36). Clear the stray formats,
// put the desk number format back, flip the costs negative with one -1 and Paste Special Multiply,
// rebuild the subtotals so they add, and write the tie-out check. Graded on the costs negative at the
// seed's size, the subtotals live and right, no stray format in the block, and a check reading zero.
import { SITE_COST_ROWS } from '../workbooks/clearcoat-pnl.js';
import { pnlDrill, pnl, settled, across, block, cellIn, near, desk, live, reads, lacks } from './pnl-drills.js';

const DESK_KEYS = 'Ctrl+1 N Tab N Alt+D 0 Alt+U Alt+N ↓ ↓ ↵';
const BLOCK = block('C7:E24');
const COSTS = across([...SITE_COST_ROWS, 23]);
const SUBS = { 20: c => `=SUM(${c}13:${c}19)`, 22: c => `=${c}10+${c}20`, 24: c => `=${c}22+${c}23` };
const ACCOUNTS_ROW = 36, CHECK_ROW = 41, SPARE = 'G19';
const STRAY = { fill: 'yellow', it: true, fsz: 12, fontColor: 'purple' };
const sum = (sh, c, rows) => rows.reduce((t, r) => t + sh.value(c + r), 0);
/** What the subtotal should read on the learner's own lines. */
const want = (sh, r, c) => (r === 20 ? sum(sh, c, SITE_COST_ROWS) : r === 22 ? sh.value(c + 10) + sh.value(c + 20) : sh.value(c + 22) + sh.value(c + 23));
function plant() {
  const p = {};
  const strayAt = ref => { const r = +ref.slice(1); return r <= 9 ? { fsz: 12 } : r <= 16 ? { fill: 'yellow' } : r <= 19 ? { it: true } : { fontColor: 'purple' }; };
  for (const ref of BLOCK) { const c = cellIn('S1a', 'P&L', ref); if (!c) continue; p[`P&L!${ref}`] = { ...c, ...strayAt(ref) }; }
  for (const c of ['C', 'D', 'E']) {
    const v = r => cellIn('S1a', 'P&L', c + r).value;
    const site = SITE_COST_ROWS.reduce((t, r) => t + v(r), 0), rev = v(7) + v(8) + v(9);
    const vals = { 20: site, 22: rev - site, 24: rev - site - v(23) };
    for (const r of [20, 22, 24]) { const rec = { ...p[`P&L!${c}${r}`], value: Math.round(vals[r] * 10) / 10 }; delete rec.formula; p[`P&L!${c}${r}`] = rec; }
    p[`P&L!${c}${ACCOUNTS_ROW}`] = { value: Math.round((rev - site) * 10) / 10, fontColor: 'blue', fmtStyle: 'comma' };
  }
  p[`P&L!B${ACCOUNTS_ROW}`] = { value: 'SITE CONTRIBUTION PER THE ACCOUNTS' };
  p[`P&L!B${CHECK_ROW}`] = { value: 'Site contribution less the accounts' };
  return p;
}
const stray = sh => Object.keys(STRAY).every(k => lacks(sh, BLOCK, k));
const flipped = sh => !!sh && COSTS.every(ref => !sh.formula(ref) && near(sh.value(ref), -cellIn('S1a', 'P&L', ref).value, 1e-6));
const rebuilt = sh => !!sh && [20, 22, 24].every(r => ['C', 'D', 'E'].every(c => !!sh.formula(c + r) && near(sh.value(c + r), want(sh, r, c), 1e-6))) && live(sh, 'E24');
const tied = sh => !!sh && ['C', 'D', 'E'].every(c => { const ref = c + CHECK_ROW; return reads(sh, ref, [c + 22, c + ACCOUNTS_ROW]) && near(sh.value(ref), 0, 0.05); });

export default pnlDrill({
  id: 'ch2-flip-and-tie',
  title: 'Flip and tie',
  task: 'The costs arrived positive in someone else’s formats: make them the page’s, negative, with subtotals that add and tie to the accounts.',
  module: 'number-formats',
  state: { before: 'S1a' },
  plant,
  goals: [
    { id: 'clear', text: 'Select the lines C7:E24 and clear the stray formats with Alt, H, E, F.', keys: 'Ctrl+G "C7:E24" ↵ Alt H E F',
      check: (s, ses) => settled(ses) && stray(pnl(ses)) },
    { id: 'desk', text: 'Give C7:E24 the desk number format back from Ctrl+1: Number, no decimals, the separator and (1,234).', keys: DESK_KEYS,
      check: (s, ses) => settled(ses) && stray(pnl(ses)) && desk(pnl(ses), BLOCK.filter(ref => !/^[C-E](11|12|21)$/.test(ref))) },
    { id: 'minus-one', text: 'Type -1 in the spare cell G19 and copy it with Ctrl+C.', keys: 'Ctrl+G "G19" ↵ "-1" Ctrl+↵ Ctrl+C',
      check: (s, ses) => { const sh = pnl(ses); return settled(ses) && sh.value(SPARE) === -1 && !!sh.clipboard; } },
    { id: 'flip', text: 'Flip the costs C13:E19 and head office C23:E23 with Paste Special Multiply, Ctrl+Alt+V, V, M, Enter.', keys: 'Ctrl+G "C13:E19" ↵ Ctrl+Alt+V V M ↵ Ctrl+G "C23:E23" ↵ Ctrl+Alt+V V M ↵',
      check: (s, ses) => settled(ses) && flipped(pnl(ses)) },
    { id: 'subtotals', text: 'Rebuild the pasted subtotals in rows 20, 22 and 24 as formulas that add the lines above.', keys: 'Ctrl+G "C20:E20" ↵ "=SUM(C13:C19)" Ctrl+↵ Ctrl+G "C22:E22" ↵ "=C10+C20" Ctrl+↵ Ctrl+G "C24:E24" ↵ "=C22+C23" Ctrl+↵',
      check: (s, ses) => settled(ses) && rebuilt(pnl(ses)) },
    { id: 'spare', text: 'Clear the -1 from G19 with Delete.', keys: 'Ctrl+G "G19" ↵ Delete',
      check: (s, ses) => { const sh = pnl(ses); return settled(ses) && sh.value(SPARE) == null && !sh.formula(SPARE); } },
    { id: 'check', text: 'In C41:E41, take the accounts in row 36 off site contribution in row 22, so each check reads 0.', keys: 'Ctrl+G "C41:E41" ↵ "=C22-C36" Ctrl+↵',
      check: (s, ses) => settled(ses) && tied(pnl(ses)) },
  ],
  endState: [
    { text: 'The costs are negative, the subtotals add live, no stray format is left and site contribution ties to the accounts', check: (s, ses) => { const sh = pnl(ses); return stray(sh) && flipped(sh) && rebuilt(sh) && tied(sh); } },
  ],
  solution: 'Ctrl+G "C7:E24" Enter Alt H E F Ctrl+1 N Tab N Alt+D 0 Alt+U Alt+N Down Down Enter Ctrl+G "G19" Enter "-1" Ctrl+Enter Ctrl+C Ctrl+G "C13:E19" Enter Ctrl+Alt+V V M Enter Ctrl+G "C23:E23" Enter Ctrl+Alt+V V M Enter Ctrl+G "C20:E20" Enter "=SUM(C13:C19)" Ctrl+Enter Ctrl+G "C22:E22" Enter "=C10+C20" Ctrl+Enter Ctrl+G "C24:E24" Enter "=C22+C23" Ctrl+Enter Ctrl+G "G19" Enter Delete Ctrl+G "C41:E41" Enter "=C22-C36" Ctrl+Enter',
  optimalKeys: 200,
  route: 60,
});
