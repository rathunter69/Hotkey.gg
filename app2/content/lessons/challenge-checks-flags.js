// Chapter 2 · 2.5.C Challenge: the checks flags on a model (seeded over S4d)
// A cluster's P&L with a checks block and no rules on it, plus three stray rules someone left:
// data bars on total revenue, a color scale on the site costs, and a yellow rule on any revenue
// line over 1,000. One revenue row carries an x in A (the seed picks which). The checks get a
// formula rule, the revenue lines a row rule from the flag column, the decoration and the stray
// rule go, and the checks rule runs first with Stop If True. The workload never moves with the seed.
import { challengeSeed, REVENUE_ROWS } from '../workbooks/clearcoat-pnl.js';
import { parsFrom } from '../../app/pars.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const settled = ses => !ses.editing && !ses.dialog;
const cellsOf = range => { const [a, b] = range.split(':'); const c1 = a.charCodeAt(0) - 64, c2 = b.charCodeAt(0) - 64, r1 = +a.slice(1), r2 = +b.slice(1); const out = []; for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) out.push([r, c]); return out; };
const ruled = (sh, range, pred) => !!sh && cellsOf(range).every(([r, c]) => sh.condFmtRulesAt(r, c).some(pred));
const squash = f => String(f || '').replace(/\s+/g, '').toUpperCase();
const checksRule = x => x.kind === 'formula' && squash(x.formula) === '=C39<>0' && (x.style === 'lightred' || x.style === 'redfill');
const flagRule = x => x.kind === 'formula' && squash(x.formula) === '=$A7="X"';
const decoration = x => x.kind === 'dataBar' || x.kind === 'colorScale';
const stray = x => x.kind === 'cellValue' && x.op === '>';
const checksFirst = sh => !!sh && sh.condFmt.length > 0 && checksRule(sh.condFmt[0]) && sh.condFmt[0].stopIfTrue === true;
/** The flagged revenue row lights across B:E, and the other revenue rows stay plain. */
const flagLights = sh => {
  if (!sh) return false;
  const map = sh.condFmtMap();
  return REVENUE_ROWS.every(r => {
    const flagged = String(sh.value('A' + r) || '').toLowerCase() === 'x';
    return ['B', 'C', 'D', 'E'].every(col => !!(map[col + r] && map[col + r].fill) === flagged);
  });
};

export default {
  id: 'challenge-checks-flags',
  chapter: 'formatting',
  section: 'Conditional formatting',
  module: 'conditional-formatting',
  workbook: 'clearcoat-pnl',
  state: { before: 'S4d' },
  kind: 'challenge',
  title: 'Challenge: the checks flags on a model',
  difficulty: 'medium',
  tags: ['challenge', 'format', 'conditional-formatting', 'checks'],
  access: 'paid',
  minutes: 3,
  conventions: ['F1', 'D8'],
  prerequisites: ['managing-rules'],
  brief: 'A cluster model with a checks block and no rules on it, plus three stray rules someone left. Make the check flag red, light the flagged row, strip the decoration and tidy the list.',
  timeLimit: 150,
  pars: parsFrom(45, { pass: 140, pro: 80 }),
  seed: rng => challengeSeed('challenge-checks-flags', rng),
  goals: [
    { id: 'checks-rule', text: 'Give the check in C39 a formula rule, =C39<>0, with the Light Red Fill.', convention: 'F1',
      keys: 'Ctrl+G "C39" ↵ Alt H L N "=C39<>0" ↵',
      check: (s, ses) => ruled(pnl(ses), 'C39:C39', checksRule) && settled(ses) },
    { id: 'row-rule', text: 'Light the revenue row flagged x in column A: a rule on B7:E9 that reads =$A7="x", with the Yellow Fill.',
      keys: `Ctrl+G "B7" ↵ Shift+→ ×3 Shift+↓ ×2 Alt H L N '=$A7="x"' ↓ ↵`,
      check: (s, ses) => ruled(pnl(ses), 'B7:E9', flagRule) && settled(ses) },
    { id: 'no-decoration', text: 'Take the data bars off C10:E10 and the color scale off C13:E19.', convention: 'D8',
      keys: 'Alt H L R ↓ ×2 Delete Delete ↵',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && !sh.condFmt.some(decoration) && settled(ses); } },
    { id: 'no-stray', text: 'Delete the stray Greater Than 1,000 rule on C7:E9, so only the flagged row lights.',
      keys: 'Alt H L R ↓ ×2 Delete ↵',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && !sh.condFmt.some(stray) && flagLights(sh) && settled(ses); } },
    { id: 'order', text: 'In Manage Rules (Alt, H, L, R), put the checks rule on top with U and tick Stop If True with S.', convention: 'F1',
      keys: 'Alt H L R ↓ U S ↵',
      check: (s, ses) => checksFirst(pnl(ses)) && settled(ses) },
  ],
  graders: [
    ses => { const sh = pnl(ses); if (!sh) return { ok: false, why: 'the P&L sheet is missing' };
      if (!checksFirst(sh)) return { ok: false, why: 'the checks rule on C39 is not first with Stop If True' };
      if (sh.condFmt.some(decoration)) return { ok: false, why: 'bars or a scale are still on the page: a buyer reads figures' };
      if (sh.condFmt.some(stray)) return { ok: false, why: 'the stray Greater Than rule still paints the revenue lines' };
      return { ok: true }; },
    ses => { const sh = pnl(ses); if (!sh) return { ok: false, why: 'the P&L sheet is missing' };
      return flagLights(sh) ? { ok: true } : { ok: false, why: 'the flagged revenue row does not light across B:E on its own' }; },
  ],
  solution: `Ctrl+G "C39" Enter Alt H L N "=C39<>0" Enter Ctrl+G "B7" Enter Shift+Right Shift+Right Shift+Right Shift+Down Shift+Down Alt H L N '=$A7="x"' Down Enter Alt H L R Down Down Delete Delete Enter Alt H L R Down Down Delete Enter Alt H L R Down U S Enter`,
};
