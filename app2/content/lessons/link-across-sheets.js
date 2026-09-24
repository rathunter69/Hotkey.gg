// Chapter 1 · 1.6.4 — Link across sheets (voltline-weekly, S6c → S6d)
// The Report's site figures are a pasted snapshot of Raw's totals block (1.3.4 took it on purpose),
// so the next feed leaves them stale. Here they become live links written by pointing across
// sheets: Ctrl+PgDn while the formula is open shows Raw, the arrows point there, and Enter brings
// the entry home as =Raw!I8. The kWh and revenue links go in at scale with Ctrl+Enter over a
// selection (the reference shifts a row per cell; every cell keeps its own number format), energy
// cost becomes kWh × the wholesale price on Inputs with the price anchored, and every link is
// colored green — once with the Ribbon, then with F4 — while Cedar Park's emailed figures in
// C9:D9 stay typed and automatic. The closer moves the wholesale price and the whole Report answers.
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const normFormula = f => String(f || '').replace(/\s/g, '').toUpperCase();
const green = c => c.fontColor === 'green';
const automatic = c => c.fontColor == null || c.fontColor === 'black';

/** `ref` holds exactly the link `=Raw!<rawRef>` (anchors ignored) and reads a number. */
const linksRaw = (rep, ref, rawRef) => { const c = rep.cellAt(ref); return normFormula(c.formula).replace(/\$/g, '') === `=RAW!${rawRef}` && isNum(c.value); };
/** Report rows 5..8 mirror Raw's totals block rows 8..11 in `col` (kWh I, revenue J). */
const linkedRows = (rep, col, rawCol, rows) => rows.every(r => linksRaw(rep, col + r, rawCol + (r < 9 ? r + 3 : 12)));
/** Cedar Park's C9:D9 stay as management emailed them: typed numbers, no formula. */
const cedarTyped = rep => ['C9', 'D9'].every(ref => { const c = rep.cellAt(ref); return !c.formula && isNum(c.value); });
/** E<r> is =C<r>*Inputs!$B$4 with the price anchored both ways, and reads a number. */
const energyLinked = (rep, r) => { const c = rep.cellAt('E' + r); return normFormula(c.formula) === `=C${r}*INPUTS!$B$4` && isNum(c.value); };
const SITE_ROWS = [5, 6, 7, 8, 9, 10];
const LINK_ROWS = [5, 6, 7, 8, 10];
const allLinksIn = rep => LINK_ROWS.every(r => linksRaw(rep, 'C' + r, 'I' + (r < 9 ? r + 3 : 12)) && linksRaw(rep, 'D' + r, 'J' + (r < 9 ? r + 3 : 12)))
  && SITE_ROWS.every(r => energyLinked(rep, r)) && cedarTyped(rep);
/** Every link green, and only links: C9:D9 automatic. */
const colorsRight = rep => LINK_ROWS.every(r => green(rep.cellAt('C' + r)) && green(rep.cellAt('D' + r)))
  && SITE_ROWS.every(r => green(rep.cellAt('E' + r))) && automatic(rep.cellAt('C9')) && automatic(rep.cellAt('D9'));

export default {
  id: 'link-across-sheets',
  chapter: 'foundations',
  section: 'Formulas',
  module: 'formulas',
  workbook: 'voltline-weekly',
  state: { before: 'S6c', after: 'S6d' },
  title: 'Link across sheets',
  difficulty: 'medium',
  tags: ['formulas', 'links', 'report'],
  access: 'free',
  minutes: 6,
  headline: 'Ctrl+PgDn',
  conventions: ['B2', 'E7'],
  teaches: ['cross-sheet-ref'],
  uses: ['pointing', 'formula-basics', 'formula-operators', 'ctrl-enter-fill', 'relative-absolute', 'f4-anchor', 'f4-repeat', 'edit-mode-f2', 'font-color', 'keytips', 'sheet-tabs', 'ctrl-arrow', 'ctrl-shift-arrow', 'shift-arrow'],
  prerequisites: ['anchors-dollar-f4'],
  brief: 'The Report’s site figures are a pasted snapshot of Raw’s totals, so the next feed will leave them stale. Replace them with live links, pointing across sheets while the formula is open, and compute energy cost from the wholesale price on Inputs, so the page updates itself. The key is `Ctrl+PgDn`.',
  goals: [
    { id: 'link-kwh', teach: 'A reference on another sheet names the sheet first, =Raw!I8: Ctrl+PgDn while the formula is open shows that sheet, and the arrows point there.', text: 'Domain’s kWh sold in C5 is a typed copy: replace it with a live link to Raw’s site total I8, pointing across sheets.', keys: 'Ctrl+↓ ×2 ↓ → ×2 "=" Ctrl+PgDn Ctrl+→ → ×3 Ctrl+↓ ↓ ↵', requires: ['cross-sheet-ref', 'pointing', 'formula-basics', 'sheet-tabs', 'ctrl-arrow'],
      check: (s, ses) => { const rep = report(ses); return !!rep && linksRaw(rep, 'C5', 'I8') && !ses.editing; } },
    { id: 'kwh-at-scale', text: 'Mueller, Riverside and South Lamar follow: select C6:C8, point one link at Raw’s I9 and commit it into all three with Ctrl+Enter.', keys: 'Shift+↓ ×2 "=" Ctrl+PgDn Ctrl+→ → ×3 Ctrl+↓ ↓ ×2 Ctrl+↵', requires: ['cross-sheet-ref', 'pointing', 'ctrl-enter-fill', 'relative-absolute', 'shift-arrow', 'sheet-tabs', 'ctrl-arrow'],
      check: (s, ses) => { const rep = report(ses); return !!rep && linkedRows(rep, 'C', 'I', [5, 6, 7, 8]) && !ses.editing; } },
    { id: 'revenue', text: 'Revenue the same way: select D5:D8, point at Raw’s J8 and press Ctrl+Enter, and the reference shifts a row for each cell.', keys: '↑ → Shift+↓ ×3 "=" Ctrl+PgDn Ctrl+→ → ×3 Ctrl+↓ → ↓ Ctrl+↵', requires: ['cross-sheet-ref', 'pointing', 'ctrl-enter-fill', 'relative-absolute', 'shift-arrow', 'sheet-tabs', 'ctrl-arrow'],
      check: (s, ses) => { const rep = report(ses); return !!rep && linkedRows(rep, 'C', 'I', [5, 6, 7, 8]) && linkedRows(rep, 'D', 'J', [5, 6, 7, 8]) && !ses.editing; } },
    { id: 'airport', text: 'Airport sits below Cedar Park’s emailed row: select C10:D10, point at Raw’s I12 and Ctrl+Enter writes both links, kWh and revenue, at once.', keys: '← Ctrl+↓ ↑ Shift+→ "=" Ctrl+PgDn Ctrl+→ → ×3 Ctrl+↓ ×2 ↑ Ctrl+↵', requires: ['cross-sheet-ref', 'pointing', 'ctrl-enter-fill', 'relative-absolute', 'shift-arrow', 'sheet-tabs', 'ctrl-arrow'],
      check: (s, ses) => { const rep = report(ses); return !!rep && linkedRows(rep, 'C', 'I', LINK_ROWS) && linkedRows(rep, 'D', 'J', LINK_ROWS) && cedarTyped(rep) && !ses.editing; } },
    { id: 'energy-cost', text: 'Energy cost is kWh times the wholesale price on Inputs: select E5:E10, enter =C5*Inputs!$B$4 by pointing, F2 then F4 anchoring the price, Ctrl+Enter.', keys: 'Ctrl+↑ ↓ → ×2 Ctrl+Shift+↓ Shift+↑ "=" ← ×2 "*" Ctrl+PgDn ×2 → Ctrl+↓ ↓ F2 F4 Ctrl+↵', requires: ['cross-sheet-ref', 'pointing', 'formula-operators', 'f4-anchor', 'edit-mode-f2', 'ctrl-enter-fill', 'ctrl-shift-arrow', 'shift-arrow', 'sheet-tabs', 'ctrl-arrow'],
      check: (s, ses) => { const rep = report(ses); return !!rep && SITE_ROWS.every(r => energyLinked(rep, r)) && cedarTyped(rep) && !ses.editing; } },
    { id: 'green-links', text: 'A link to another sheet is green in the format the team uses: color the energy costs E5:E10 green with Font Color, Alt H F C.', keys: 'Alt H F C → ×8 ↵', requires: ['font-color', 'keytips'], convention: 'B2',
      check: (s, ses) => { const rep = report(ses); return !!rep && SITE_ROWS.every(r => green(rep.cellAt('E' + r))) && allLinksIn(rep); } },
    { id: 'f4-everywhere', text: 'Format once, F4 everywhere: select C5:D8 and press F4 to repeat the green, then C10:D10, leaving Cedar Park’s typed C9:D9 automatic.', keys: '← ×2 Shift+↓ ×3 Shift+→ F4 Ctrl+↓ ↑ Shift+→ F4', requires: ['f4-repeat', 'shift-arrow', 'ctrl-arrow'],
      check: (s, ses) => { const rep = report(ses); return !!rep && colorsRight(rep) && allLinksIn(rep); } },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Inputs!B4" Enter "0.2" Enter Ctrl+G "Report!E5" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch the wholesale price on Inputs change to 0.200 and every energy cost in E5:E10, gross profit and margin answer.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C5:D8 and C10:D10 are live links to Raw’s totals block, and E5:E10 read =C×Inputs!$B$4', check: (s, ses) => { const rep = report(ses); return !!rep && allLinksIn(rep); } },
    { text: 'Cedar Park’s C9:D9 stay typed numbers', check: (s, ses) => { const rep = report(ses); return !!rep && cedarTyped(rep); } },
    { text: 'Every link is green, and only the links', check: (s, ses) => { const rep = report(ses); return !!rep && colorsRight(rep); } },
  ],
  closing: [
    'The Report is live: pointing across sheets wrote every link for you, Ctrl+Enter put a column of them in at once, and the wholesale price on Inputs now drives every energy cost, gross profit and margin.',
    'Links to another sheet are green (B2), so a reader knows which figures come from elsewhere; a link to another workbook would show red, and the team avoids those (E7).',
  ],
  solution: 'Ctrl+Down Ctrl+Down Down Right Right "=" Ctrl+PgDn Ctrl+Right Right Right Right Ctrl+Down Down Enter Shift+Down Shift+Down "=" Ctrl+PgDn Ctrl+Right Right Right Right Ctrl+Down Down Down Ctrl+Enter Up Right Shift+Down Shift+Down Shift+Down "=" Ctrl+PgDn Ctrl+Right Right Right Right Ctrl+Down Right Down Ctrl+Enter Left Ctrl+Down Up Shift+Right "=" Ctrl+PgDn Ctrl+Right Right Right Right Ctrl+Down Ctrl+Down Up Ctrl+Enter Ctrl+Up Down Right Right Ctrl+Shift+Down Shift+Up "=" Left Left "*" Ctrl+PgDn Ctrl+PgDn Right Ctrl+Down Down F2 F4 Ctrl+Enter Alt H F C Right Right Right Right Right Right Right Right Enter Left Left Shift+Down Shift+Down Shift+Down Shift+Right F4 Ctrl+Down Up Shift+Right F4',
};
