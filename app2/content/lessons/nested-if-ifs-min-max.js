// Chapter 3 · 3.1.2 Nested IF, IFS, and MIN and MAX instead (clearcoat-databook, S1a → S1b)
// The manager bonus steps up in tiers (the table in J5:K8). The learner builds it as a nested-IF
// tower in I5:I10 first, reads its parentheses, then replaces it with IFS over the same cells; the
// gap above target in G5:G10 becomes MAX(C5-D5,0), and I4 is headed Bonus ($/day). The bonus
// is graded on its values and liveness; the tower and the IFS goals also read the parsed tokens of
// the cells they name (E6: no nested-IF towers). The closer lifts Domain to 360 washes.
import { liveness } from '../../app/graders.js';
import { tokenize } from '../../engine/formula.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const summary = ses => sheetOf(ses, 'Summary');
const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const same = (a, b) => (isNum(a) && isNum(b) ? Math.abs(a - b) < 1e-9 : a === b);
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const ROWS = [5, 6, 7, 8, 9, 10];
const at = (sh, ref) => sh.selectionText() === ref;
/** The function names in a cell's formula, every occurrence (the parsed tokens, never the text). */
const fns = (sh, ref) => { const f = sh.formula(ref); if (!f) return []; try { return tokenize(String(f).replace(/^\s*=/, '')).filter(t => t.t === 'fn').map(t => String(t.v).toUpperCase()); } catch (e) { return []; } };
const column = (sh, col, want) => ROWS.every(r => same(sh.value(col + r), want(sh, r))) && [5, 10].every(r => liveness(sh, col + r).ok);
const BONUS = (sh, r) => { const w = sh.value('C' + r); return w >= 350 ? 150 : w >= 300 ? 100 : w >= 250 ? 50 : 0; };
const bonus = sh => column(sh, 'I', BONUS);
const tower = sh => bonus(sh) && ROWS.every(r => fns(sh, 'I' + r).filter(f => f === 'IF').length >= 3);
const ifs = sh => bonus(sh) && ROWS.every(r => { const f = fns(sh, 'I' + r); return f.includes('IFS') && !f.includes('IF'); });
const GAP = (sh, r) => Math.max(sh.value('C' + r) - sh.value('D' + r), 0);
const floored = sh => column(sh, 'G', GAP) && ROWS.every(r => { const f = fns(sh, 'G' + r); return f.includes('MAX') && !f.includes('IF'); });
const HEAD = 'Bonus ($/day)';

export default {
  id: 'nested-if-ifs-min-max',
  chapter: 'formulas',
  section: 'Logic',
  module: 'logic',
  workbook: 'clearcoat-databook',
  state: { before: 'S1a', after: 'S1b' },
  title: 'Nested IF, IFS, and MIN and MAX instead',
  difficulty: 'medium',
  tags: ['formulas', 'logic', 'ifs', 'min', 'max'],
  access: 'paid',
  minutes: 7,
  headline: 'IFS',
  conventions: ['E6'],
  teaches: ['nested-if', 'ifs-function', 'min-max-cap'],
  uses: ['if-function', 'formula-basics', 'fill-down-right', 'ctrl-enter-fill', 'edit-mode-f2', 'escape-cancels', 'sum-family', 'type-to-enter', 'arrow-keys', 'ctrl-arrow', 'shift-arrow', 'ctrl-shift-arrow'],
  prerequisites: ['if-on-a-threshold'],
  brief: 'The manager bonus steps up in tiers: $50 a day at 250 washes, $100 at 300, $150 at 350. A nested IF answers that, an IF inside an IF inside an IF, and it is the formula people write first and regret first, because nobody can read it. IFS lists the tests in order, and MIN and MAX cap and floor a value in one call. Build the bonus as a tower, then keep the one a reviewer can read. The key is `IFS`.',
  goals: [
    { id: 'read-tiers', teach: 'A manager earns a bonus for every day the site clears a tier: the more washes, the bigger the step, which is why the tests have to run from the top tier down.',
      text: 'Select the tier table J5:K8 on Summary: 250 washes earn $50 a day, 300 earn $100 and 350 earn $150.', keys: '↓ ×3 Ctrl+→ ×3 ↓ Shift+→ Ctrl+Shift+↓', requires: ['ctrl-arrow', 'shift-arrow', 'ctrl-shift-arrow', 'arrow-keys'],
      hintStuck: 'pulse range J5:K8 · The tiers sit right of the empty bonus column.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && at(sh, 'J5:K8'); } },
    { id: 'tower', teach: 'A nested IF puts the next IF where the false answer goes, so the tests run from the top tier down and the last 0 is what is left.',
      text: 'Build the tower in I5, =IF(C5>=350,150,IF(C5>=300,100,IF(C5>=250,50,0))), and fill it down to I10.', keys: '← "=IF(C5>=350,150,IF(C5>=300,100,IF(C5>=250,50,0)))" ↵ ↑ Shift+↓ ×5 Ctrl+D', requires: ['nested-if', 'if-function', 'fill-down-right', 'shift-arrow', 'arrow-keys'],
      hintStuck: 'pulse range I5:I10 · Three IFs, so three closing parentheses at the end.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && tower(sh); } },
    { id: 'count-parens', text: 'Open I5 with F2 and count the parentheses that close the tower, then Esc: that count is what a reviewer has to check.', keys: 'F2 Esc', requires: ['edit-mode-f2', 'escape-cancels'],
      hintStuck: 'pulse cell I5 · F2 shows the formula in the cell, Esc leaves it as it was.',
      check: (s, ses) => { const sh = summary(ses); const k = windowKeys(ses); return settled(ses) && !!sh && k.includes('F2') && k.includes('Esc') && tower(sh); } },
    { id: 'ifs', teach: 'IFS takes the tests in pairs, a test and its answer, and returns the answer beside the first test that holds; TRUE at the end catches everything left. Same answers as the tower, read top to bottom.',
      text: 'Replace the tower: with I5:I10 selected, type =IFS(C5>=350,150,C5>=300,100,C5>=250,50,TRUE,0) and press Ctrl+Enter.', keys: '"=IFS(C5>=350,150,C5>=300,100,C5>=250,50,TRUE,0)" Ctrl+↵', requires: ['ifs-function', 'ctrl-enter-fill'], convention: 'E6',
      hintStuck: 'pulse range I5:I10 · Ctrl+Enter writes the formula into every selected cell.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && ifs(sh); } },
    { id: 'floor-max', teach: 'MAX(x,0) floors a figure at zero and MIN(x,150) caps it at 150, each in one call. When a test only floors or caps, MAX or MIN says it without an IF.',
      text: 'Floor the gap with MAX: select G5:G10 and rewrite it as =MAX(C5-D5,0) with Ctrl+Enter; the figures do not move.', keys: '← ×2 Ctrl+Shift+↓ "=MAX(C5-D5,0)" Ctrl+↵', requires: ['min-max-cap', 'sum-family', 'ctrl-enter-fill', 'ctrl-shift-arrow', 'arrow-keys'], convention: 'E6',
      hintStuck: 'pulse range G5:G10 · Above target is two columns left of the bonus.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && floored(sh); } },
    { id: 'label', teach: 'When the test picks from a list of bands, IFS says it; when it only caps or floors, MIN or MAX does. In Chapter 4 a lookup on the tier table replaces both.',
      text: 'Head the column you kept: type Bonus ($/day) in I4.', keys: '→ ×2 ↑ "Bonus ($/day)" ↵', requires: ['type-to-enter', 'arrow-keys'],
      hintStuck: 'pulse cell I4 · The header row is row 4.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && sh.value('I4') === HEAD; } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Summary!C5" Enter "360" Enter Ctrl+G "Summary!I5" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch Domain’s washes in C5 rise to 360 and its bonus in I5 step up to $150.', requires: [],
      hintStuck: 'pulse cell I5 · The first test that holds wins.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'I5:I10 carry the bonus in IFS, live, with no IF left in them', check: (s, ses) => { const sh = summary(ses); return !!sh && ifs(sh); } },
    { text: 'G5:G10 carry the gap above target as MAX(C5-D5,0)', check: (s, ses) => { const sh = summary(ses); return !!sh && floored(sh); } },
    { text: 'I4 reads Bonus ($/day)', check: (s, ses) => { const sh = summary(ses); return !!sh && sh.value('I4') === HEAD; } },
  ],
  closing: [
    'You wrote the same test three ways, and only the one a reviewer can read survived.',
    'The bonus reads top to bottom in IFS, the gap is floored with MAX, and neither column has an IF tower left in it (E6). The tiers are still typed inside the formula; Chapter 4 reads them from the table instead.',
  ],
  solution: 'Down Down Down Ctrl+Right Ctrl+Right Ctrl+Right Down Shift+Right Ctrl+Shift+Down Left "=IF(C5>=350,150,IF(C5>=300,100,IF(C5>=250,50,0)))" Enter Up Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+D F2 Escape "=IFS(C5>=350,150,C5>=300,100,C5>=250,50,TRUE,0)" Ctrl+Enter Left Left Ctrl+Shift+Down "=MAX(C5-D5,0)" Ctrl+Enter Right Right Up "Bonus ($/day)" Enter',
};
