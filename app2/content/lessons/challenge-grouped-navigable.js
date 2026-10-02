// Chapter 2 · 2.4.C Challenge: a flat P&L into a grouped, navigable one (seeded over S3f)
// A cluster's three-year P&L with Monthly dressed, the margins block hidden and a month-by-month
// cluster block pasted under the page at row 41. The challenge finishes Monthly's header row,
// groups the site-cost detail and the memo block with a second level over revenue to head office,
// finds the hidden rows and groups them instead,
// moves the stray block onto its own sheet at the end, and names Monthly's three answer rows with
// a navigation column beside them (where the project keeps them; this file has no company block on
// Monthly detail). Seeds pick the cluster and its figures; the workload never moves.
import { FULL_YEAR_COL, MONTH_COLS, DETAIL, challengeSeed } from '../workbooks/clearcoat-pnl.js';
import { parsFrom } from '../../app/pars.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const monthly = ses => sheetOf(ses, 'Monthly');
const detail = ses => sheetOf(ses, 'Monthly detail');
const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
const groupOf = (sh, r1, r2) => ((sh.groups && sh.groups.rows) || []).find(g => g.r1 === r1 && g.r2 === r2) || null;

const headers = m => ['B', ...MONTH_COLS, FULL_YEAR_COL].every(col => m.cellAt(col + '4').bold) && m.value('O4') === 'Full year' && m.cellAt('O4').wrap;
const detailGrouped = sh => !!groupOf(sh, 13, 19) && !!groupOf(sh, 33, 35) && !!groupOf(sh, 7, 23) && groupOf(sh, 13, 19).level === 2;
const marginsGrouped = sh => sh.hiddenRows.size === 0 && !!groupOf(sh, 26, 30);
const strayGone = sh => { for (const k in sh.cells) { const r = +/\d+$/.exec(k)[0]; const c = sh.cells[k]; if (r >= DETAIL.strayTop && (c.value != null || c.formula)) return false; } return true; };
const strayMoved = ses => { const p = pnl(ses), d = detail(ses); return !!p && !!d && strayGone(p) && /by cluster/.test(String(d.value('A1'))) && d.cellAt('C9').formula === '=SUM(C6:C8)' && ses.sheets[ses.sheets.length - 1].name === 'Monthly detail'; };
const NAMES = { Rev: 10, SiteCosts: 20, EBITDA: 24 };
const named = ses => !!ses.names && Object.entries(NAMES).every(([n, r]) => ses.names[n] === `Monthly!$B$${r}:$O$${r}`);
const listed = m => m.value('Q4') === 'Go to' && m.cellAt('Q4').bold && m.value('Q5') === 'Revenue' && m.value('Q6') === 'Site costs' && m.value('Q7') === 'EBITDA';

export default {
  id: 'challenge-grouped-navigable',
  chapter: 'formatting',
  section: 'Alignment and structure',
  module: 'alignment-and-structure',
  workbook: 'clearcoat-pnl',
  state: { before: 'S3f' },
  kind: 'challenge',
  title: 'Challenge: a flat P&L into a grouped, navigable one',
  difficulty: 'medium',
  tags: ['challenge', 'structure', 'outline', 'names'],
  access: 'paid',
  minutes: 3,
  conventions: ['D6', 'C7', 'C6', 'C9'],
  prerequisites: ['navigation-column'],
  brief: 'A flat P&L with a stray block under it and rows someone hid. Finish the headers, group the detail on two levels, unhide what was hidden and group it, move the stray block to its own sheet, and add a navigation column.',
  timeLimit: 180,
  pars: parsFrom(90, { pass: 170, pro: 120 }),
  seed: rng => challengeSeed('challenge-grouped-navigable', rng),
  goals: [
    { id: 'headers', text: 'On Monthly, bold the header row B4:O4, retype O4 as Full year and wrap it.', convention: 'D6',
      keys: 'Ctrl+G "Monthly!B4:O4" ↵ Ctrl+B Ctrl+G "Monthly!O4" ↵ "Full year" Ctrl+↵ Alt H W',
      check: (s, ses) => { const m = monthly(ses); return !!m && headers(m) && settled(ses); } },
    { id: 'group-detail', text: 'On the P&L, group the site-cost detail rows 13:19 and the memo rows 33:35, then rows 7:23 over the detail for a second level.', convention: 'C7',
      keys: `Ctrl+G "'P&L'!A13:A19" ↵ Shift+Space Alt+Shift+→ Ctrl+G "'P&L'!A33:A35" ↵ Shift+Space Alt+Shift+→ Ctrl+G "'P&L'!A7:A23" ↵ Shift+Space Alt+Shift+→`,
      check: (s, ses) => { const sh = pnl(ses); return !!sh && detailGrouped(sh) && settled(ses); } },
    { id: 'hidden', text: 'Find the rows someone hid, 26:30, unhide them and group them instead.', convention: 'C7',
      keys: `Ctrl+G "'P&L'!A25:A31" ↵ Shift+Space Alt H O U O ↓ Shift+↓ ×4 Shift+Space Alt+Shift+→`,
      check: (s, ses) => { const sh = pnl(ses); return !!sh && marginsGrouped(sh) && settled(ses); } },
    { id: 'stray', text: 'Move the stray block A41:O58 onto a new sheet, Monthly detail, at A1, with the sheet at the end.', convention: 'C6',
      keys: `Ctrl+PgDn ×3 Shift+F11 Alt H O R "Monthly detail" ↵ Alt H O M ↓ ×2 ↵ Ctrl+G "'P&L'!A41:O58" ↵ Ctrl+X Ctrl+G "'Monthly detail'!A1" ↵ Ctrl+V`,
      check: (s, ses) => strayMoved(ses) && settled(ses) },
    { id: 'names', text: 'Name Monthly’s answer rows: B10:O10 Rev, B20:O20 SiteCosts and B24:O24 EBITDA.', convention: 'C9',
      keys: 'Ctrl+G "Monthly!B10:O10" ↵ Alt M M D "Rev" ↵ Ctrl+G "Monthly!B20:O20" ↵ Alt M M D "SiteCosts" ↵ Ctrl+G "Monthly!B24:O24" ↵ Alt M M D "EBITDA" ↵',
      check: (s, ses) => named(ses) && settled(ses) },
    { id: 'nav', text: 'Type the navigation column on Monthly: Go to in Q4 in bold, then Revenue, Site costs and EBITDA in Q5:Q7.', convention: 'C9',
      keys: 'Ctrl+G "Monthly!Q4" ↵ "Go to" Ctrl+↵ Ctrl+B ↓ "Revenue" ↵ "Site costs" ↵ "EBITDA" ↵',
      check: (s, ses) => { const m = monthly(ses); return !!m && listed(m) && settled(ses); } },
  ],
  graders: [
    ses => { const m = monthly(ses), p = pnl(ses); if (!m || !p) return { ok: false, why: 'a sheet is missing' };
      if (!headers(m)) return { ok: false, why: 'Monthly’s header row is not bold, or O4 is not a wrapped Full year' };
      if (!detailGrouped(p)) return { ok: false, why: 'the site-cost detail or the memo block is not grouped, or rows 7:23 are not a second level over the detail' };
      if (!marginsGrouped(p)) return { ok: false, why: 'rows 26:30 are still hidden, or not grouped: group, don’t hide' };
      return { ok: true }; },
    ses => strayMoved(ses) ? { ok: true } : { ok: false, why: 'the stray block is still under the P&L, or Monthly detail is not the last sheet' },
    ses => { const m = monthly(ses); if (!m) return { ok: false, why: 'the Monthly sheet is missing' };
      if (!named(ses)) return { ok: false, why: 'Rev, SiteCosts and EBITDA do not name Monthly’s rows 10, 20 and 24' };
      if (!listed(m)) return { ok: false, why: 'the navigation column in Q4:Q7 is missing' };
      return { ok: true }; },
  ],
  solution: `Ctrl+G "Monthly!B4:O4" Enter Ctrl+B Ctrl+G "Monthly!O4" Enter "Full year" Ctrl+Enter Alt H W Ctrl+G "'P&L'!A13:A19" Enter Shift+Space Alt+Shift+Right Ctrl+G "'P&L'!A33:A35" Enter Shift+Space Alt+Shift+Right Ctrl+G "'P&L'!A7:A23" Enter Shift+Space Alt+Shift+Right Ctrl+G "'P&L'!A25:A31" Enter Shift+Space Alt H O U O Down Shift+Down Shift+Down Shift+Down Shift+Down Shift+Space Alt+Shift+Right Ctrl+PgDn Ctrl+PgDn Ctrl+PgDn Shift+F11 Alt H O R "Monthly detail" Enter Alt H O M Down Down Enter Ctrl+G "'P&L'!A41:O58" Enter Ctrl+X Ctrl+G "'Monthly detail'!A1" Enter Ctrl+V Ctrl+G "Monthly!B10:O10" Enter Alt M M D "Rev" Enter Ctrl+G "Monthly!B20:O20" Enter Alt M M D "SiteCosts" Enter Ctrl+G "Monthly!B24:O24" Enter Alt M M D "EBITDA" Enter Ctrl+G "Monthly!Q4" Enter "Go to" Ctrl+Enter Ctrl+B Down "Revenue" Enter "Site costs" Enter "EBITDA" Enter`,
};
