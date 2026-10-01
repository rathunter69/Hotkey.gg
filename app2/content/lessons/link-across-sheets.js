// Chapter 1 · 1.6.4 — Link across sheets (clearcoat-weekly, S6c → S6d)
// The Report's site figures are a pasted snapshot of Raw's totals block (1.3.4 took it on purpose),
// so the next feed leaves them stale. Here they become live links: one typed by hand so the syntax
// has been seen (=Raw!I8), the rest written by pointing across sheets: the sheet key while the
// formula is open shows Raw, the arrows point there, and Enter brings the entry home. The washes
// and revenue links go in at scale with Ctrl+Enter over a selection (the reference shifts a row
// per cell; every cell keeps its own number format), wash cost becomes washes × the cost per wash
// on Inputs with the price anchored, and every link is colored green, once with the Ribbon, then
// with F4, while Cedar Park's emailed figures in C9:D9 stay typed and automatic. Ctrl+[ follows a
// link back to its source. The closer moves the cost per wash and the whole Report answers.
const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const report = ses => sheetOf(ses, 'Report');
const onSheet = (ses, name) => ses.sheets[ses.sheetIndex] && ses.sheets[ses.sheetIndex].name === name;
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const normFormula = f => String(f || '').replace(/\s/g, '').replace(/^=\+/, '=').toUpperCase();
const green = c => c.fontColor === 'green';
const automatic = c => c.fontColor == null || c.fontColor === 'black';

/** `ref` holds exactly the link `=Raw!<rawRef>` (anchors ignored) and reads a number. */
const linksRaw = (rep, ref, rawRef) => { const c = rep.cellAt(ref); return normFormula(c.formula).replace(/\$/g, '') === `=RAW!${rawRef}` && isNum(c.value); };
/** Report rows 5..8 mirror Raw's totals block rows 8..11 in `col` (washes I, revenue J); Airport's row 10 reads row 12. */
const linkedRows = (rep, col, rawCol, rows) => rows.every(r => linksRaw(rep, col + r, rawCol + (r < 9 ? r + 3 : 12)));
/** Cedar Park's C9:D9 stay as the manager emailed them: typed numbers, no formula. */
const cedarTyped = rep => ['C9', 'D9'].every(ref => { const c = rep.cellAt(ref); return !c.formula && isNum(c.value); });
/** E<r> is =C<r>*Inputs!$B$4 (either operand order) with the price anchored both ways, and reads a number. */
const costLinked = (rep, r) => { const c = rep.cellAt('E' + r); const f = normFormula(c.formula); return (f === `=C${r}*INPUTS!$B$4` || f === `=INPUTS!$B$4*C${r}`) && isNum(c.value); };
const SITE_ROWS = [5, 6, 7, 8, 9, 10];
const LINK_ROWS = [5, 6, 7, 8, 10];
const allLinksIn = rep => LINK_ROWS.every(r => linksRaw(rep, 'C' + r, 'I' + (r < 9 ? r + 3 : 12)) && linksRaw(rep, 'D' + r, 'J' + (r < 9 ? r + 3 : 12)))
  && SITE_ROWS.every(r => costLinked(rep, r)) && cedarTyped(rep);
/** Every link green, and only links: C9:D9 automatic. */
const colorsRight = rep => LINK_ROWS.every(r => green(rep.cellAt('C' + r)) && green(rep.cellAt('D' + r)))
  && SITE_ROWS.every(r => green(rep.cellAt('E' + r))) && automatic(rep.cellAt('C9')) && automatic(rep.cellAt('D9'));

export default {
  id: 'link-across-sheets',
  chapter: 'foundations',
  section: 'Formulas',
  module: 'formulas',
  workbook: 'clearcoat-weekly',
  state: { before: 'S6c', after: 'S6d' },
  title: 'Link across sheets',
  difficulty: 'medium',
  tags: ['formulas', 'links', 'report'],
  access: 'free',
  minutes: 7,
  headline: 'Ctrl+PgDn',
  conventions: ['B2', 'E7'],
  teaches: ['cross-sheet-ref'],
  uses: ['pointing', 'formula-basics', 'formula-operators', 'type-to-enter', 'ctrl-enter-fill', 'relative-absolute', 'f4-anchor', 'f4-repeat', 'font-color', 'keytips', 'sheet-tabs', 'ctrl-arrow', 'shift-arrow', 'arrow-keys'],
  prerequisites: ['anchors-dollar-and-f4'],
  brief: 'The Report’s site figures are a pasted snapshot of Raw’s totals, so the next feed will leave them stale. A link is a formula that reads a cell on another sheet: =Raw!I8 (the sheet name, an exclamation mark, then the cell). You can type it, or point at it: with the formula open, switch sheets with the sheet key, walk to the cell, Enter, and Excel writes the reference for you; links are green, so a reader knows which figures come from elsewhere. Replace the snapshot with links, and compute wash cost from the price on Inputs, so the page updates itself. The key is `Ctrl+PgDn`.',
  macNote: 'Pointing across sheets while a formula is open: ⌥→ and ⌥← switch sheets on a Mac. In a browser on Windows, Alt+PgDn and Alt+PgUp do it, and Ctrl+PgDn works in fullscreen or the installed app.',
  goals: [
    { id: 'type-link', teach: 'A reference on another sheet is the sheet name, an exclamation mark, then the cell: Raw!I8. Type it exactly once so you’ve seen the syntax; from here on you’ll point.',
      text: 'Type the first link by hand in C5, =Raw!I8 (Domain’s washes total on Raw), and press Enter.',
      hintStuck: 'pulse cell C5 · C5, type =Raw!I8, Enter; the number matches Raw’s I8.',
      keys: 'Ctrl+↓ ×2 ↓ → ×2 "=Raw!I8" ↵', requires: ['cross-sheet-ref', 'formula-basics', 'type-to-enter', 'ctrl-arrow', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && linksRaw(rep, 'C5', 'I8') && !ses.editing; } },
    { id: 'point-link', teach: 'With a formula open, the sheet key (Ctrl+PgDn, or Alt+PgDn in a browser) takes you to the other sheet and the arrows point at cells there, so Excel writes Raw!J8 for you and nobody types a sheet name. Enter commits the formula and lands you back where you started, which is why a link built this way never carries a typo.',
      text: 'Point the second one: in D5 type =, press the sheet key to Raw, walk to J8 and press Enter, so the formula bar reads =Raw!J8.',
      hintStuck: 'pulse the formula bar · D5, =, Alt+PgDn to Raw, walk to J8, Enter.',
      keys: '→ "=" Ctrl+PgDn Ctrl+→ → ×3 Ctrl+↓ → ↓ ↵', requires: ['cross-sheet-ref', 'pointing', 'sheet-tabs', 'ctrl-arrow', 'arrow-keys'], convention: 'E7',
      check: (s, ses) => { const rep = report(ses); return !!rep && linksRaw(rep, 'C5', 'I8') && linksRaw(rep, 'D5', 'J8') && !ses.editing; } },
    { id: 'washes-at-scale', teach: 'Select the destination cells first, build one formula pointing at the top source cell, then Ctrl+Enter: each cell gets the same formula shifted a row (=Raw!I9, =Raw!I10, =Raw!I11). A column of links in one press.',
      text: 'Mueller, Riverside and South Lamar follow: select C6:C8, point one link at Raw’s I9 and commit it into all three with Ctrl+Enter.',
      hintStuck: 'pulse cells C6:C8 · Select C6:C8; =, Alt+PgDn, point at I9, Ctrl+Enter.',
      keys: '← ↓ Shift+↓ ×2 "=" Ctrl+PgDn Ctrl+→ → ×3 Ctrl+↓ ↓ ×2 Ctrl+↵', requires: ['cross-sheet-ref', 'pointing', 'ctrl-enter-fill', 'relative-absolute', 'shift-arrow', 'sheet-tabs', 'ctrl-arrow', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && linkedRows(rep, 'C', 'I', [5, 6, 7, 8]) && !ses.editing; } },
    { id: 'revenue-at-scale', teach: 'Same move, next column. F2 on D7 afterwards: =Raw!J10, the row shifted with the fill.',
      text: 'Revenue the same way: select D6:D8, point one link at Raw’s J9 and commit it into all three; the reference shifts a row per cell.',
      hintStuck: 'pulse cells D6:D8 · Select D6:D8; =, Alt+PgDn, point at J9, Ctrl+Enter.',
      keys: '→ Shift+↓ ×2 "=" Ctrl+PgDn Ctrl+→ → ×3 Ctrl+↓ → ↓ ×2 Ctrl+↵', requires: ['cross-sheet-ref', 'pointing', 'ctrl-enter-fill', 'relative-absolute', 'shift-arrow', 'sheet-tabs', 'ctrl-arrow', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && linkedRows(rep, 'C', 'I', [5, 6, 7, 8]) && linkedRows(rep, 'D', 'J', [5, 6, 7, 8]) && !ses.editing; } },
    { id: 'airport', teach: 'Ctrl+Enter fills across too: the reference shifts a column per cell, so I12 becomes J12 in the next one. Cedar Park’s row 9 stays typed (it came by email and isn’t on the feed yet) and stays blue.',
      text: 'Airport sits below Cedar Park’s emailed row: select C10:D10, point at Raw’s I12 and Ctrl+Enter writes both links at once.',
      hintStuck: 'pulse cells C10:D10 · Select C10:D10; =, Alt+PgDn, point at I12, Ctrl+Enter.',
      keys: '← Ctrl+↓ ↑ Shift+→ "=" Ctrl+PgDn Ctrl+→ → ×3 Ctrl+↓ ×2 ↑ Ctrl+↵', requires: ['cross-sheet-ref', 'pointing', 'ctrl-enter-fill', 'relative-absolute', 'shift-arrow', 'sheet-tabs', 'ctrl-arrow', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && linkedRows(rep, 'C', 'I', LINK_ROWS) && linkedRows(rep, 'D', 'J', LINK_ROWS) && cedarTyped(rep) && !ses.editing; } },
    { id: 'wash-cost', teach: 'Point at C5, type *, sheet key to Inputs, point at B4, F4 once for $B$4, Ctrl+Enter. The price is anchored so every row reads the same cell; the washes reference moves row by row. Two ideas from 1.6.3 in one formula.',
      text: 'Wash cost is washes times the cost per wash on Inputs: select E5:E10, point =C5*Inputs!$B$4, anchor the price with F4, and Ctrl+Enter.',
      hintStuck: 'pulse cells E5:E10 · Select E5:E10; =, ← ←, *, Alt+PgDn twice to Inputs, point at B4, F4, Ctrl+Enter.',
      keys: 'Ctrl+↑ ↓ → ×2 Shift+↓ ×5 "=" ← ×2 "*" Ctrl+PgDn ×2 → Ctrl+↓ ↓ F4 Ctrl+↵', requires: ['cross-sheet-ref', 'pointing', 'formula-operators', 'f4-anchor', 'ctrl-enter-fill', 'shift-arrow', 'sheet-tabs', 'ctrl-arrow', 'arrow-keys'],
      check: (s, ses) => { const rep = report(ses); return !!rep && SITE_ROWS.every(r => costLinked(rep, r)) && cedarTyped(rep) && !ses.editing; } },
    { id: 'green-links', teach: 'Alt, H, F, C, then the green swatch; F4 repeats the color on the next selection. Green says "this comes from another sheet": blue is typed, black is calculated here, green is fetched.',
      text: 'Links are green: color the wash costs E5:E10 green with Font Color, then select C5:D8 and press F4 to repeat it, then C10:D10.',
      hintStuck: 'pulse cells E5:E10 · Select E5:E10; Alt, H, F, C, → eight times, Enter; then C5:D8, F4; then C10:D10, F4.',
      keys: 'Alt H F C → ×8 ↵ ← ×2 Shift+↓ ×3 Shift+→ F4 Ctrl+↓ ↑ Shift+→ F4', requires: ['font-color', 'f4-repeat', 'keytips', 'shift-arrow', 'ctrl-arrow', 'arrow-keys'], convention: 'B2',
      check: (s, ses) => { const rep = report(ses); return !!rep && colorsRight(rep) && allLinksIn(rep) && !ses.editing && !ses.dialog; } },
    { id: 'follow-back', teach: 'Ctrl+[ jumps to the cells a formula reads, across sheets too; Ctrl+] goes the other way, to the cells that read this one; Ctrl+PgUp brings you back to the Report. That’s how you audit a link in two presses. Best practice: link every use of an input straight to its source cell, never to a cell that already links to it, so Ctrl+[ reaches the source in one hop; the one accepted chain is a flat assumption carried across forecast years as =prior year (5.2.6).',
      text: 'Follow a link back: land on C5 and press Ctrl+[, and you’re on Raw!I8, the cell it reads; Ctrl+PgUp brings you back to the Report.',
      hintStuck: 'pulse cell C5 · C5, Ctrl+[, look; Ctrl+PgUp to return.',
      keys: 'Ctrl+↑ ↓ Ctrl+[', requires: ['cross-sheet-ref', 'sheet-tabs', 'ctrl-arrow', 'arrow-keys'],
      check: (s, ses) => onSheet(ses, 'Raw') && s.selectionText() === 'I8' && windowKeys(ses).includes('Ctrl+[') && !ses.editing },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Inputs!B4" Enter "2" Enter Ctrl+G "Report!E5" Enter Escape Escape Escape', cadence: 320 },
      teach: 'One input on one sheet, eighteen cells on another. That’s a linked page, and from here on it’s the only kind you build.',
      text: 'Does it tie? On Inputs, change the cost per wash in B4 to 2.00 and watch every wash cost, gross profit and margin on the Report answer.',
      hintStuck: 'pulse cell B4 on Inputs · Alt+PgDn to Inputs; B4, 2, Enter; back to Report and look.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'C5:D8 and C10:D10 are live links to Raw’s totals block, and E5:E10 read =C×Inputs!$B$4', check: (s, ses) => { const rep = report(ses); return !!rep && allLinksIn(rep); } },
    { text: 'Cedar Park’s C9:D9 stay typed numbers', check: (s, ses) => { const rep = report(ses); return !!rep && cedarTyped(rep); } },
    { text: 'Every link is green, and only the links', check: (s, ses) => { const rep = report(ses); return !!rep && colorsRight(rep); } },
  ],
  wow: 'Every site figure is a link now. The next feed flows straight onto the page.',
  closing: [
    '=Raw!I8 is the sheet name, an exclamation mark and the cell. You typed one, pointed one, then wrote a whole column of them with Ctrl+Enter, and the cost per wash on Inputs, anchored, now drives every wash cost, gross profit and margin on the page.',
    'Links are green so a reader knows which figures come from elsewhere in the file; Ctrl+[ follows one back to its source, and the sheet key returns. A link to another workbook would show red, and the desk avoids those.',
  ],
  solution: 'Ctrl+Down Ctrl+Down Down Right Right "=Raw!I8" Enter Right "=" Ctrl+PgDn Ctrl+Right Right Right Right Ctrl+Down Right Down Enter Left Down Shift+Down Shift+Down "=" Ctrl+PgDn Ctrl+Right Right Right Right Ctrl+Down Down Down Ctrl+Enter Right Shift+Down Shift+Down "=" Ctrl+PgDn Ctrl+Right Right Right Right Ctrl+Down Right Down Down Ctrl+Enter Left Ctrl+Down Up Shift+Right "=" Ctrl+PgDn Ctrl+Right Right Right Right Ctrl+Down Ctrl+Down Up Ctrl+Enter Ctrl+Up Down Right Right Shift+Down Shift+Down Shift+Down Shift+Down Shift+Down "=" Left Left "*" Ctrl+PgDn Ctrl+PgDn Right Ctrl+Down Down F4 Ctrl+Enter Alt H F C Right Right Right Right Right Right Right Right Enter Left Left Shift+Down Shift+Down Shift+Down Shift+Right F4 Ctrl+Down Up Shift+Right F4 Ctrl+Up Down Ctrl+[',
};
