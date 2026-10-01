// Chapter 1 · 1.3.C — Challenge: complete the feed (seeded over S2b)
// The learner's own Austin feed, remixed: the site names stay, every figure varies by seed, and the
// faults sit where they always sit: one day missing, one lone typo, one typo repeated three times,
// one wash count typed as text. Enter the day with a Tab run, fix the lone typo in place and Replace
// All the repeated one, name the cost per wash and note its source, make the text a number, freeze a
// values snapshot of this week's site totals on a new Summary tab, and fill the week's timeline under
// it. Seeds vary the figures, never the workload: the same keys pass every seed.
import { SITES, SITE_TICKET, COST_PER_WASH, MISSING_DAY, rawRow } from '../workbooks/clearcoat-weekly.js';
import { liveness } from '../../app/graders.js';
import { parsFrom } from '../../app/pars.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const raw = ses => sheetOf(ses, 'Raw');
const rawIs = (ses, ref, fn) => { const sh = raw(ses); return !!sh && fn(sh.cellAt(ref)); };
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const r2 = v => Math.round(v * 100) / 100;

const FEED_ROWS = Array.from({ length: 60 }, (_, i) => 2 + i);   // the 60 feed rows, 2..61
const REPEAT_ROWS = [27, 29, 31];                                 // Riverside rows carrying the repeated typo
const TEXT_ROW = 33, TEXT_WASHES = 240;                           // the wash count typed as text, with a trailing space
const HEADERS = ['Site', 'Washes', 'Revenue ($)', 'Wash cost ($)'];   // Raw!H7:K7, bold: the site totals block's header
const BLOCK_COLS = ['H', 'I', 'J', 'K'];
const SNAP = { sheet: 'Summary', label: 'E1', headerRow: 1, firstRow: 2 };   // the snapshot block on Summary
const SNAP_COLS = ['A', 'B', 'C', 'D'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_COLS = ['B', 'C', 'D', 'E', 'F', 'G'];
const NAME = 'CostPerWash';

// the figures as the manager wrote them (250 washes, $14.00, $3,500.00, $375.00) and as they are typed (250, 14, 3500, 375)
const usd = v => '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const { washes, ticket, revenue, cost } = MISSING_DAY;

const dayIn = sh => sh.value('C61') === washes && sh.value('D61') === ticket && sh.value('E61') === revenue && sh.value('F61') === cost;
const noRepeatTypo = sh => REPEAT_ROWS.every(r => sh.value('B' + r) === 'Riverside') && !FEED_ROWS.some(r => /riverisde/i.test(String(sh.value('B' + r) || '')));
const isText = c => c.txt === true || typeof c.value === 'string';
/** A cell holding the same thing as another, as a value: text as text, a number as that number, never a formula. */
const frozenCopy = (c, v) => !c.formula && (isNum(v) ? isNum(c.value) && Math.abs(c.value - v) < 1e-6 : c.value === v);
const summary = ses => sheetOf(ses, SNAP.sheet);
const headerOn = sum => SNAP_COLS.every((col, i) => { const c = sum.cellAt(col + SNAP.headerRow); return c.value === HEADERS[i] && c.bold === true; });
/** Summary!A2:D6 hold what the site totals block Raw!H8:K12 shows right now (site names and this week's three totals) as values. */
const valuesOn = (sum, rw) => SITES.every((site, i) => SNAP_COLS.every((col, j) => frozenCopy(sum.cellAt(col + (SNAP.firstRow + i)), rw.value(BLOCK_COLS[j] + (8 + i)))));
const timelineOn = sum => sum.value('A8') === 'Day' && DAY_COLS.every((col, i) => sum.value(col + '8') === DAYS[i]);
/** The name points at Inputs!B4, however it was anchored, and the cell carries a note of any length. */
const namedAndNoted = ses => { const inp = sheetOf(ses, 'Inputs'); return !!inp && !!ses.names && String(ses.names[NAME] || '').replace(/\$/g, '').toUpperCase() === 'INPUTS!B4' && typeof inp.cellAt('B4').cmt === 'string' && inp.cellAt('B4').cmt.trim().length > 0; };

export default {
  id: 'challenge-complete-the-feed',
  chapter: 'foundations',
  section: 'Enter, edit, copy and fill',
  module: 'enter-edit-copy-fill',
  workbook: 'clearcoat-weekly',
  state: { before: 'S2b' },
  kind: 'challenge',
  title: 'Challenge: complete the feed',
  difficulty: 'medium',
  tags: ['challenge', 'editing', 'clipboard'],
  access: 'free',
  minutes: 3,
  conventions: ['E4', 'B6'],
  prerequisites: ['find-replace-timeline'],
  brief: 'A fresh cut of the Austin feed came in with a day missing, a text figure and typos. Complete it, clean it, then start a Summary tab with a snapshot and the week’s timeline, all on the clock.',
  timeLimit: 170,
  pars: parsFrom(55, { pass: 150, pro: 95 }),
  seed: rng => {
    const patch = {};
    // one ticket per site within a quarter of its usual price; Airport keeps the ticket the manager's emailed Saturday carries
    const tickets = {};
    for (const site of SITES) { const t = Math.round((SITE_TICKET[site] + (rng() - 0.5) * 0.5) * 4) / 4; tickets[site] = site === 'Airport' ? ticket : t; }
    /** No figure anywhere may contain the digits of the text-number, so Find lands the one text cell. */
    const clean = (...vs) => vs.every(v => !String(v).includes(String(TEXT_WASHES)));
    for (const site of SITES) for (let d = 0; d < 12; d++) {
      const r = rawRow(site, d);
      if (r === 61) continue;   // Airport's Saturday: the missing day, cleared below
      let k, rev, c;
      do { k = Math.round((100 + rng() * 200) / 10) * 10; rev = r2(k * tickets[site]); c = r2(k * COST_PER_WASH); } while (!clean(k, rev, c));
      patch[`Raw!C${r}`] = { value: k };
      patch[`Raw!D${r}`] = { value: tickets[site] };
      patch[`Raw!E${r}`] = { value: rev };
      patch[`Raw!F${r}`] = { value: c };   // every wash cost in, F12/F19/F28/F44/F47 included
    }
    // the text-number: 240 typed with a trailing space; its revenue and wash cost agree with 240
    patch[`Raw!C${TEXT_ROW}`] = { value: TEXT_WASHES + ' ' };
    patch[`Raw!E${TEXT_ROW}`] = { value: r2(TEXT_WASHES * tickets.Riverside) };
    patch[`Raw!F${TEXT_ROW}`] = { value: r2(TEXT_WASHES * COST_PER_WASH) };
    for (const col of ['C', 'D', 'E', 'F']) patch[`Raw!${col}61`] = null;   // Airport's Saturday never came through
    patch['Raw!B14'] = { value: 'Muller' };                                  // the lone typo
    for (const r of REPEAT_ROWS) patch[`Raw!B${r}`] = { value: 'Riverisde' };   // the repeated one
    patch['Raw!B27'] = { value: 'Riverisde' };
    patch['Raw!B55'] = { value: 'Airport' };                                 // the module's other plantings are not this challenge's
    patch['Raw!H3'] = null;
    return patch;
  },
  goals: [
    { id: 'missing-day', text: `Airport’s Saturday never came through: enter the manager’s figures in C61:F61 (${washes} washes, ${usd(ticket)}, ${usd(revenue)} revenue and ${usd(cost)} wash cost).`,
      keys: `Ctrl+PgDn Ctrl+↓ Ctrl+→ → "${washes}" Tab "${ticket}" Tab "${revenue}" Tab "${cost}" ↵`,
      check: (s, ses) => { const sh = raw(ses); return !!sh && dayIn(sh); } },
    { id: 'typos', text: 'Mueller reads Muller in one row and Riverside reads Riverisde in three: fix the one in place, Replace All the three, read the count.',
      keys: 'Ctrl+F "Muller" ↵ Esc F2 Home → ×2 "e" ↵ then Ctrl+H "Riverisde" Tab "Riverside" Alt+A Esc',
      check: (s, ses) => { const sh = raw(ses); return !!sh && sh.value('B14') === 'Mueller' && noRepeatTypo(sh) && !ses.dialog; } },
    { id: 'name-and-note', text: `Name the cost per wash on Inputs ${NAME} and put its source in a note on the cell.`, convention: 'B6',
      keys: `Ctrl+PgDn Ctrl+Home → Ctrl+↓ ↓ then Alt M M D "${NAME}" ↵ then Shift+F2 "Supplier quote" Esc`,
      check: (s, ses) => namedAndNoted(ses) && !ses.dialog },
    { id: 'text-number', text: `The wash count "${TEXT_WASHES}" in the Riverside rows was typed as text and sits on the left: make it a number.`, keys: `Ctrl+PgUp Ctrl+F "${TEXT_WASHES}" ↵ Esc F2 ⌫ ↵`,
      check: (s, ses) => { const sh = raw(ses); return !!sh && sh.value('C' + TEXT_ROW) === TEXT_WASHES && !FEED_ROWS.some(r => isText(sh.cellAt('C' + r))); } },
    { id: 'summary-header', text: 'Copy the site totals header H7:K7, insert a sheet named Summary in front, drop the header on its A1 and label E1 Snapshot.',
      keys: 'Ctrl+Home Ctrl+→ ×2 Ctrl+↓ ↓ Shift+→ ×3 Ctrl+C Ctrl+PgUp Shift+F11 Alt H O R "Summary" ↵ ↵ Ctrl+→ → "Snapshot" ↵',
      check: (s, ses) => { const names = ses.sheets.map(x => x.name); const sum = summary(ses);
        return names[0] === 'Summary' && names.includes('Report') && !!sum && sum.value(SNAP.label) === 'Snapshot' && headerOn(sum) && !ses.editing; } },
    { id: 'snapshot-values', text: 'With the feed complete, paste Raw’s site rows H8:K12 as values onto Summary!A2: a snapshot is values, never a live formula.', convention: 'E4',
      keys: 'Ctrl+PgDn ×2 Ctrl+Home Ctrl+→ ×2 Ctrl+↓ ↓ ×2 Ctrl+Shift+↓ Shift+↑ Shift+→ ×3 Ctrl+C Ctrl+PgUp ×2 Ctrl+Home ↓ Ctrl+Alt+V V ↵',
      check: (s, ses) => { const sum = summary(ses), rw = raw(ses); return !!sum && !!rw && valuesOn(sum, rw); } },
    { id: 'summary-timeline', text: 'Under the snapshot, type Day in A8 and fill a Mon to Sat timeline across B8:G8.', keys: 'Ctrl+↓ ↓ ×2 "Day" Tab "Mon" Ctrl+↵ Shift+→ ×5 then Alt H F I S Alt+F ↵',
      check: (s, ses) => { const sum = summary(ses); return !!sum && timelineOn(sum) && !ses.editing; } },
  ],
  graders: [
    ses => { const sum = summary(ses); if (!sum) return { ok: false, why: 'No Summary sheet: the snapshot and the timeline live on a sheet named Summary, in front' };
      for (let i = 0; i < SITES.length; i++) for (const col of SNAP_COLS) { const ref = col + (SNAP.firstRow + i); if (sum.cellAt(ref).formula) return { ok: false, why: `Summary!${ref} in the snapshot is a live formula, and a snapshot is values, on purpose` }; }
      return { ok: true }; },
    ses => { const sum = summary(ses); if (!sum) return { ok: false, why: 'No Summary sheet.' };
      for (const col of SNAP_COLS) { const ref = col + SNAP.headerRow; if (sum.cellAt(ref).bold !== true) return { ok: false, why: `Summary!${ref} is not bold; the header keeps its format when it is pasted plain` }; }
      return { ok: true }; },
    // E4 the other way round: the feed's block I8:K12 is still live, so values went onto the snapshot, not over the formulas
    ses => { const sh = raw(ses); if (!sh) return { ok: false, why: 'No Raw sheet.' };
      for (let i = 0; i < SITES.length; i++) for (const col of ['I', 'J', 'K']) {
        const ref = col + (8 + i); const c = sh.cellAt(ref);
        if (!c.formula) return { ok: false, why: `${ref} is a typed number where the feed’s live total belongs; values go onto the snapshot, never over the live block` };
        if (!liveness(sh, ref).ok) return { ok: false, why: `${ref} no longer moves with the feed; the site total is a live formula` };
      }
      return { ok: true }; },
    ses => { const sum = summary(ses); if (!sum) return { ok: false, why: 'No Summary sheet.' };
      return sum.value(SNAP.label) === 'Snapshot' ? { ok: true } : { ok: false, why: 'Summary!E1 does not read Snapshot; label what the block is before anyone reads it' }; },
    ses => { const sh = raw(ses); if (!sh) return { ok: false, why: 'No Raw sheet.' };
      for (const r of FEED_ROWS) for (const col of ['C', 'D', 'E', 'F']) { const c = sh.cellAt(col + r); if (c.value == null && !c.formula) return { ok: false, why: `row ${r} of the feed is still blank` }; }
      return { ok: true }; },
    ses => { const sh = raw(ses); if (!sh) return { ok: false, why: 'No Raw sheet.' };
      for (const r of FEED_ROWS) if (isText(sh.cellAt('C' + r))) return { ok: false, why: `C${r} is text sitting on the left; a wash count is a number` };
      return { ok: true }; },
    ses => { const sh = raw(ses); if (!sh) return { ok: false, why: 'No Raw sheet.' };
      for (const r of FEED_ROWS) { const v = sh.value('B' + r); if (!SITES.includes(v)) return { ok: false, why: `B${r} reads ${v}; the five sites are Domain, Mueller, Riverside, South Lamar and Airport` }; }
      return { ok: true }; },
    ses => namedAndNoted(ses) ? { ok: true } : { ok: false, why: `Inputs!B4 is not named ${NAME} with a note on it; a hardcode carries its name and its source` },
  ],
  solution: `Ctrl+PgDn Ctrl+Down Ctrl+Right Right "${washes}" Tab "${ticket}" Tab "${revenue}" Tab "${cost}" Enter Ctrl+F "Muller" Enter Escape F2 Home Right Right "e" Enter Ctrl+H "Riverisde" Tab "Riverside" Alt+A Escape Ctrl+PgDn Ctrl+Home Right Ctrl+Down Down Alt M M D "${NAME}" Enter Shift+F2 "Supplier quote" Escape Ctrl+PgUp Ctrl+F "${TEXT_WASHES}" Enter Escape F2 Backspace Enter Ctrl+Home Ctrl+Right Ctrl+Right Ctrl+Down Down Shift+Right Shift+Right Shift+Right Ctrl+C Ctrl+PgUp Shift+F11 Alt H O R "Summary" Enter Enter Ctrl+Right Right "Snapshot" Enter Ctrl+PgDn Ctrl+PgDn Ctrl+Home Ctrl+Right Ctrl+Right Ctrl+Down Down Down Ctrl+Shift+Down Shift+Up Shift+Right Shift+Right Shift+Right Ctrl+C Ctrl+PgUp Ctrl+PgUp Ctrl+Home Down Ctrl+Alt+V V Enter Ctrl+Down Down Down "Day" Tab "Mon" Ctrl+Enter Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Alt H F I S Alt+F Enter`,
};
