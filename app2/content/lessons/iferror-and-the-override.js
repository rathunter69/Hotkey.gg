// Chapter 3 · 3.1.4 IFERROR and the override pattern (clearcoat-databook, S1c → S1d)
// Revenue per wash in Q5:Q10 divides by washes, and Cedar Park washed nothing on Sep 15, so Q10
// reads #DIV/0!: IFERROR with a 0 fallback on Q10 first, then over the block with Ctrl+Enter so each
// cell keeps its format. Then the override pattern: R is labeled and colored blue as an input,
// S5:S10 reads the override when R holds a number and the link when not (ISNUMBER), an override
// is tried and cleared, and the flags in E point at the washes used. Liveness is graded through
// the override cells (perturb R, the flag must move). The closer types an override under target.
import { liveness } from '../../app/graders.js';
import { isLiveFormula } from '../../engine/live.js';
import { tokenize, formulaRefs } from '../../engine/formula.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const summary = ses => sheetOf(ses, 'Summary');
const settled = ses => !ses.editing && !ses.dialog && ses.mode !== 'ribbon';
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const same = (a, b) => (isNum(a) && isNum(b) ? Math.abs(a - b) < 1e-9 : a === b);
const blank = (sh, ref) => { const c = sh.cellAt(ref); return c.value == null && !c.formula; };
const ROWS = [5, 6, 7, 8, 9, 10];
const at = (sh, ref) => sh.selectionText() === ref;
const fns = (sh, ref) => { const f = sh.formula(ref); if (!f) return []; try { return tokenize(String(f).replace(/^\s*=/, '')).filter(t => t.t === 'fn').map(t => String(t.v).toUpperCase()); } catch (e) { return []; } };
const column = (sh, col, want, live = [5, 10]) => ROWS.every(r => same(sh.value(col + r), want(sh, r))) && live.every(r => liveness(sh, col + r).ok);
const PER_WASH = (sh, r) => { const w = sh.value('C' + r); return w ? sh.value('H' + r) / w : 0; };
const perWash = sh => column(sh, 'Q', PER_WASH, [5, 9]) &&   // Q10 divides 0 by 0: no one input moves it, so the live rows are the trading ones
  ROWS.every(r => fns(sh, 'Q' + r).includes('IFERROR'));
/** Cedar Park's cell on its own: 0 over 0 has no input that moves it, so it is read from its parsed tokens: IFERROR around H10 over C10. */
const caught = sh => { const f = sh.formula('Q10'); if (!f || !fns(sh, 'Q10').includes('IFERROR') || sh.value('Q10') !== 0) return false;
  const refs = formulaRefs(f).map(x => x.key).filter(Boolean); return refs.includes('H10') && refs.includes('C10'); };
const HEAD = 'Override (washes)';
const overrideCol = sh => sh.value('R4') === HEAD && ROWS.every(r => sh.cellAt('R' + r).fontColor === 'blue');
const USED = (sh, r) => (isNum(sh.value('R' + r)) ? sh.value('R' + r) : sh.value('C' + r));
/** S reads the override when one is typed: the value, and it moves when R moves. */
const used = sh => ROWS.every(r => same(sh.value('S' + r), USED(sh, r))) && [5, 10].every(r => isLiveFormula(sh, 'S' + r, { inputs: ['R' + r] }));
const FLAG = (sh, r) => (sh.value('S' + r) >= sh.value('D' + r) ? 'On target' : 'Below');
/** The flags read the washes used: an override typed in R moves them. */
// (an override of 1 is the probe, so it moves the flag on a site that is on target; a site already below stays below)
const flagsOnUsed = sh => ROWS.every(r => same(sh.value('E' + r), FLAG(sh, r))) && ROWS.filter(r => FLAG(sh, r) === 'On target').every(r => isLiveFormula(sh, 'E' + r, { inputs: ['R' + r] }));
const noOverrides = sh => ROWS.every(r => blank(sh, 'R' + r));

export default {
  id: 'iferror-and-the-override',
  chapter: 'formulas',
  section: 'Logic',
  module: 'logic',
  workbook: 'clearcoat-databook',
  state: { before: 'S1c', after: 'S1d' },
  title: 'IFERROR and the override pattern',
  difficulty: 'medium',
  tags: ['formulas', 'logic', 'iferror', 'override'],
  access: 'paid',
  minutes: 7,
  headline: 'IFERROR',
  conventions: ['B1'],
  teaches: ['iferror-function', 'isnumber-override'],
  uses: ['if-function', 'formula-basics', 'formula-errors', 'ctrl-enter-fill', 'fill-down-right', 'font-color', 'input-colour-convention', 'delete-clears', 'type-to-enter', 'arrow-keys', 'ctrl-arrow', 'shift-arrow', 'ctrl-shift-arrow'],
  prerequisites: ['and-or-not'],
  brief: 'Two things break a clean block: a division by a site with no washes yet, and a manager who wants to type over a formula "for this week only". IFERROR catches the first, so =IFERROR(H5/C5,0) shows the figure you choose instead of #DIV/0!. The override pattern handles the second: a blue override cell beside the formula, and ISNUMBER tells the formula to read it whenever it is filled. The formula survives, the override is visible, and nobody types over a live cell. The key is `IFERROR`.',
  goals: [
    { id: 'read-error', text: 'Go to Cedar Park’s revenue per wash, Q10: it washed nothing on Sep 15, so H10/C10 divides by zero and reads #DIV/0!.', keys: '↓ ×3 Ctrl+→ ↓ Ctrl+→ Ctrl+↓', requires: ['formula-errors', 'ctrl-arrow', 'arrow-keys'],
      hintStuck: 'pulse cell Q10 · Revenue per wash is the last filled column on row 5; Cedar Park is the last site.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && at(sh, 'Q10'); } },
    { id: 'iferror', teach: 'IFERROR(value, fallback) shows the fallback wherever the value is an error. It hides every error, so use it only where one is expected, a zero denominator, never to silence a #REF!. A 0 suits a line that gets added up; a ratio that feeds nothing reads NM, not meaningful, instead.',
      text: 'Type =IFERROR(H10/C10,0) over Q10 and press Enter: the #DIV/0! becomes a 0 the column can add.', keys: '"=IFERROR(H10/C10,0)" ↵', requires: ['iferror-function'],
      hintStuck: 'pulse cell Q10 · Type straight over the error; Enter commits it.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && caught(sh); } },
    { id: 'iferror-col', text: 'Now the whole column, so the next site to open can’t break it: Shift+↑ from Q10 up to Q5, type =IFERROR(H10/C10,0), Ctrl+Enter.', keys: '↑ Shift+↑ ×5 "=IFERROR(H10/C10,0)" Ctrl+↵', requires: ['iferror-function', 'ctrl-enter-fill', 'shift-arrow', 'arrow-keys'],
      hintStuck: 'pulse range Q5:Q10 · Ctrl+Enter rewrites every selected cell from the active one and keeps each one’s format.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && perWash(sh); } },
    { id: 'override-col', teach: 'An override is a number someone typed, so it is an input, and inputs are blue: a reader sees at a glance which figures a person chose.',
      text: 'Head R4 Override (washes) and color R5:R10 blue with Font Color, Alt H F C, ready for typed overrides.', keys: 'Ctrl+↑ → "Override (washes)" ↵ Shift+↓ ×5 Alt H F C → ×4 ↵', requires: ['font-color', 'input-colour-convention', 'type-to-enter', 'shift-arrow', 'arrow-keys'], convention: 'B1',
      hintStuck: 'pulse range R5:R10 · The empty column right of revenue per wash.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && overrideCol(sh); } },
    { id: 'washes-used', teach: 'ISNUMBER(R5) is TRUE only when R5 holds a number, so the formula reads the override when one is typed and the link when not. Inherited models write the test bare, =IF(R5,R5,C5), where a blank or a 0 counts as false and text returns #VALUE!: read it, write ISNUMBER.',
      text: 'In S5, =IF(ISNUMBER(R5),R5,C5) is the washes the page uses, the override if one is typed and the link if not; fill it down to S10.', keys: '→ "=IF(ISNUMBER(R5),R5,C5)" ↵ ↑ Shift+↓ ×5 Ctrl+D', requires: ['isnumber-override', 'if-function', 'fill-down-right', 'shift-arrow', 'arrow-keys'],
      hintStuck: 'pulse range S5:S10 · Washes used sits right of the override column.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && used(sh); } },
    { id: 'try-override', text: 'Type 240 into Mueller’s override R6 and watch S6 take it over the link.', keys: '← ↓ "240" ↵', requires: ['type-to-enter', 'arrow-keys'],
      hintStuck: 'pulse cell R6 · Mueller is the second site.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && sh.value('R6') === 240 && sh.value('S6') === 240; } },
    { id: 'clear-override', teach: 'Its sibling ISTEXT catches a cell that holds a word: =IF(ISTEXT(C5),"Closed",H5/C5) returns a status instead of #VALUE! down a row.',
      text: 'Clear R6 with Delete and watch S6 go back to the link.', keys: '↑ Delete', requires: ['delete-clears', 'arrow-keys'],
      hintStuck: 'pulse cell R6 · Delete clears the entry and keeps the blue.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && noOverrides(sh) && used(sh); } },
    { id: 'flag-reads-used', text: `Point the flags at the washes used: select E5:E10, type =IF(S5>=D5,"On target","Below") and press Ctrl+Enter.`, keys: `↑ Ctrl+← ×2 → ×3 Ctrl+Shift+↓ '=IF(S5>=D5,"On target","Below")' Ctrl+↵`, requires: ['if-function', 'ctrl-enter-fill', 'ctrl-arrow', 'ctrl-shift-arrow', 'arrow-keys'],
      hintStuck: 'pulse range E5:E10 · Only the C in the test changes, to S.',
      check: (s, ses) => { const sh = summary(ses); return settled(ses) && !!sh && flagsOnUsed(sh); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Summary!R6" Enter "200" Enter Ctrl+G "Summary!E6" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch an override of 200 go into Mueller’s R6, under its target of 220, and its flag in E6 turn to Below.', requires: [],
      hintStuck: 'pulse cell E6 · The flag reads the washes used, so it follows the override.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Q5:Q10 read revenue per wash with IFERROR, 0 for Cedar Park', check: (s, ses) => { const sh = summary(ses); return !!sh && perWash(sh); } },
    { text: 'R4 heads the blue override column and R5:R10 are empty', check: (s, ses) => { const sh = summary(ses); return !!sh && overrideCol(sh) && noOverrides(sh); } },
    { text: 'S5:S10 read the override when typed, the link when not, and the flags in E5:E10 read S', check: (s, ses) => { const sh = summary(ses); return !!sh && used(sh) && flagsOnUsed(sh); } },
  ],
  closing: [
    'The errors you expect are caught, and the overrides you can’t stop are in the open.',
    'IFERROR sits only where a zero denominator was expected, and every override is a blue input beside the formula it replaces (B1), so a reviewer sees what a person chose and the formula is still there when the override goes.',
  ],
  solution: `Down Down Down Ctrl+Right Down Ctrl+Right Ctrl+Down "=IFERROR(H10/C10,0)" Enter Up Shift+Up Shift+Up Shift+Up Shift+Up Shift+Up "=IFERROR(H10/C10,0)" Ctrl+Enter Ctrl+Up Right "Override (washes)" Enter Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Alt H F C Right Right Right Right Enter Right "=IF(ISNUMBER(R5),R5,C5)" Enter Up Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down Ctrl+D Left Down "240" Enter Up Delete Up Ctrl+Left Ctrl+Left Right Right Right Ctrl+Shift+Down '=IF(S5>=D5,"On target","Below")' Ctrl+Enter`,
};
