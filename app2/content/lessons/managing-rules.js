// Chapter 2 · 2.5.4 Managing rules (clearcoat-pnl, S5c → S5d)
// Manage Rules lists a sheet's rules, their ranges and their order. The P&L's three rules go to
// the two the page needs: the row rule from 2.5.2 is deleted (the duplicate-values rule the script
// names never existed in the engine), the margin rule moves to C27:E30 (a new rule over the four
// lines, the old one deleted, since the engine's manager has no range box), and the checks rule
// goes to the top with Stop If True. The closer types over total revenue: only the checks rule fires.
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const pnl = ses => sheetOf(ses, 'P&L');
const settled = ses => !ses.editing && !ses.dialog;
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;
const cellsOf = range => { const [a, b] = range.split(':'); const c1 = a.charCodeAt(0) - 64, c2 = b.charCodeAt(0) - 64, r1 = +a.slice(1), r2 = +b.slice(1); const out = []; for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) out.push([r, c]); return out; };
const ruled = (sh, range, pred) => !!sh && cellsOf(range).every(([r, c]) => sh.condFmtRulesAt(r, c).some(pred));
const squash = f => String(f || '').replace(/\s+/g, '').toUpperCase();
const RED = new Set(['redtext', 'lightred', 'redfill']);
const negRule = x => x.kind === 'cellValue' && x.op === '<' && x.v1 === 0 && RED.has(x.style);
const checksRule = x => x.kind === 'formula' && squash(x.formula) === '=C39<>0';
const flagRule = x => x.kind === 'formula' && /\$A\d+=/.test(squash(x.formula));
const ordered = sh => !!sh && sh.condFmt.length === 2 && checksRule(sh.condFmt[0]) && sh.condFmt[0].stopIfTrue === true && ruled(sh, 'C27:E30', negRule) && sh.condFmt.filter(negRule).length === 1;

export default {
  id: 'managing-rules',
  chapter: 'formatting',
  section: 'Conditional formatting',
  module: 'conditional-formatting',
  workbook: 'clearcoat-pnl',
  state: { before: 'S5c', after: 'S5d' },
  title: 'Managing rules',
  difficulty: 'medium',
  tags: ['format', 'conditional-formatting', 'checks', 'pnl'],
  access: 'paid',
  minutes: 5,
  headline: 'Alt H L R',
  conventions: ['F1', 'F5'],
  teaches: ['rule-order'],
  uses: ['manage-rules', 'highlight-rule', 'formula-rule', 'go-to', 'shift-arrow'],
  prerequisites: ['data-bars-and-scales'],
  brief: 'Rules pile up, overlap and outlive the ranges they were written for, and a page with six rules nobody remembers is a page nobody trusts. Manage Rules lists them, shows their ranges, and lets you delete, reorder and set Stop If True. Tidy the rules on the P&L to the two the page needs. The key is `Alt H L R`.',
  goals: [
    { id: 'open', text: 'On the P&L, open Manage Rules with Alt, H, L, R and read the three rules and the ranges they apply to.', keys: 'Alt H L R', requires: ['manage-rules'], convention: 'F5',
      hintStuck: 'pulse range B7:E9 · The row rule from the last lesson sits on top.',
      check: (s, ses) => onSheet(ses, 'P&L') && ses.dialog === 'condrules' },
    { id: 'delete-row-rule', text: 'Delete the row rule on B7:E9, now that no row carries a flag, and close the list with Enter.', keys: 'Delete ↵', requires: ['manage-rules'],
      hintStuck: 'pulse range B7:E9 · The first rule in the list is selected when it opens.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && !sh.condFmt.some(flagRule) && settled(ses); } },
    { id: 'margin-range', teach: 'A rule written for C27:E29 misses the growth line under it. Add the same rule over C27:E30, and the old one becomes a duplicate to delete.', text: 'Select the margins and growth C27:E30 and add the rule again: Less Than 0, Red Text.', keys: 'Ctrl+G "C27" ↵ Shift+→ ×2 Shift+↓ ×3 Alt H L H L "0" → ×4 ↵', requires: ['highlight-rule', 'go-to', 'shift-arrow'],
      hintStuck: 'pulse range C27:E30 · Four lines now: three margins and revenue growth.',
      check: (s, ses) => ruled(pnl(ses), 'C27:E30', negRule) && settled(ses) },
    { id: 'delete-old', text: 'In Manage Rules, select the old margin rule on C27:E29, third in the list, and delete it.', keys: 'Alt H L R ↓ ×2 Delete', requires: ['manage-rules'],
      hintStuck: 'pulse range C27:E29 · The new rule is on top; the old one is at the bottom.',
      check: (s, ses) => { const sh = pnl(ses); return !!sh && sh.condFmt.filter(negRule).length === 1 && ruled(sh, 'C27:E30', negRule); } },
    { id: 'checks-first', teach: 'Rules run from the top. Move Up (U) puts the checks rule first, and Stop If True (S) means that where a check fires, nothing below it paints the cell.', text: 'Move the checks rule to the top with U, tick Stop If True with S, and press Enter.', keys: 'U S ↵', requires: ['rule-order', 'manage-rules'], convention: 'F1',
      hintStuck: 'pulse range C39:C40 · The checks rule is the one selected after the delete.',
      check: (s, ses) => ordered(pnl(ses)) && settled(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "C10" Enter "32000" Enter Escape', cadence: 320 }, text: 'Does it tie? Watch total revenue in C10 typed over as 32000: the checks rule fires on C39, and nothing else does.', requires: [],
      hintStuck: 'pulse cell C39 · One rule fires, the one that matters.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'Two rules remain: the checks rule first with Stop If True, then the margin rule on C27:E30', check: (s, ses) => ordered(pnl(ses)) },
  ],
  closing: [
    'Two rules remain, both named and both where you’d look for them.',
    'The checks rule runs first and stops there, and the margin rule now covers growth as well. When the page goes to the data room, anyone who opens Manage Rules finds two rules that each do one job.',
  ],
  solution: 'Alt H L R Delete Enter Ctrl+G "C27" Enter Shift+Right Shift+Right Shift+Down Shift+Down Shift+Down Alt H L H L "0" Right Right Right Right Enter Alt H L R Down Down Delete U S Enter',
};
