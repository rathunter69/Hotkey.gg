// Chapter 1 · 1.3.C — Challenge: complete the feed (seeded over S2a)
// The learner's own Austin feed, remixed: the site names stay, every figure varies by seed, and
// the faults sit where they always sit — one day missing, one lone typo, one typo repeated three
// times, one kWh figure typed as text. Enter the day with a Tab run, fix the lone typo in place,
// Replace All the repeated one, make the text a number, freeze a values snapshot of this week's
// site totals, then start the Summary tab with the week's timeline. Seeds vary the figures,
// never the workload: the same keys pass every seed.
// The snapshot lives on the new Summary sheet (the brief's design): the header on A1:D1, the values
// on A2:D6, Snapshot in E1, Day and the Mon–Sat timeline on A8:G8 — a block copied on Raw pastes on
// Summary because the workbook keeps one clipboard (Session.wireSheet).
import { SITES, WHOLESALE, MISSING_DAY, rawRow } from '../workbooks/voltline-weekly.js';
import { liveness } from '../../app/graders.js';
import { parsFrom } from '../../app/pars.js';

const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };
const raw = ses => sheetOf(ses, 'Raw');
const rawIs = (ses, ref, fn) => { const sh = raw(ses); return !!sh && fn(sh.cellAt(ref)); };
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const r2 = v => Math.round(v * 100) / 100;

const FEED_ROWS = Array.from({ length: 60 }, (_, i) => 2 + i);   // the 60 feed rows, 2..61
const REPEAT_ROWS = [27, 29, 31];                                 // Riverside rows carrying the repeated typo
const HEADERS = ['Site', 'kWh sold', 'Revenue ($)', 'Energy cost ($)'];   // Raw!H7:K7, bold: the platform block's header
const BLOCK_COLS = ['H', 'I', 'J', 'K'];
const SNAP = { sheet: 'Summary', label: 'E1', headerRow: 1, firstRow: 2 };   // the snapshot block on Summary
const SNAP_COLS = ['A', 'B', 'C', 'D'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_COLS = ['B', 'C', 'D', 'E', 'F', 'G'];

// the figures as management wrote them (2,500 kWh, $0.48, $1,200.00, $325.00) and as they are typed (2500, 0.48, 1200, 325)
const usd = v => '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const { kwh, price, revenue, energy } = MISSING_DAY;

const dayIn = sh => sh.value('C61') === kwh && sh.value('D61') === price && sh.value('E61') === revenue && sh.value('F61') === energy;
const noRepeatTypo = sh => REPEAT_ROWS.every(r => sh.value('B' + r) === 'Riverside') && !FEED_ROWS.some(r => /riverisde/i.test(String(sh.value('B' + r) || '')));
const isText = c => c.txt === true || typeof c.value === 'string';
/** A cell holding the same thing as another, as a value: text as text, a number as that number, never a formula. */
const frozenCopy = (c, v) => !c.formula && (isNum(v) ? isNum(c.value) && Math.abs(c.value - v) < 1e-6 : c.value === v);
const summary = ses => sheetOf(ses, SNAP.sheet);
const headerOn = sum => SNAP_COLS.every((col, i) => { const c = sum.cellAt(col + SNAP.headerRow); return c.value === HEADERS[i] && c.bold === true; });
/** Summary!A2:D6 hold what the platform block Raw!H8:K12 shows right now — site names and this week's three totals — as values. */
const valuesOn = (sum, rw) => SITES.every((site, i) => SNAP_COLS.every((col, j) => frozenCopy(sum.cellAt(col + (SNAP.firstRow + i)), rw.value(BLOCK_COLS[j] + (8 + i)))));
const timelineOn = sum => sum.value('A8') === 'Day' && DAY_COLS.every((col, i) => sum.value(col + '8') === DAYS[i]);

export default {
  id: 'challenge-complete-the-feed',
  chapter: 'foundations',
  section: 'Enter, edit, copy and fill',
  module: 'enter-edit-copy-fill',
  workbook: 'voltline-weekly',
  state: { before: 'S2a' },
  kind: 'challenge',
  title: 'Challenge: complete the feed',
  difficulty: 'medium',
  tags: ['challenge', 'editing', 'clipboard'],
  access: 'free',
  minutes: 3,
  conventions: ['E4'],
  prerequisites: ['find-replace-timeline'],
  brief: 'A fresh cut of the Austin feed came in with a day missing, a text figure and typos: complete it, clean it, then start the Summary tab with a snapshot and the week’s timeline.',
  timeLimit: 170,
  pars: parsFrom(50, { pass: 150, pro: 90 }),
  seed: rng => {
    const patch = {};
    // one price per site in 0.42–0.48; Airport keeps the price management's emailed Saturday carries
    const prices = {};
    for (const site of SITES) { const p = Math.round(42 + rng() * 6) / 100; prices[site] = site === 'Airport' ? price : p; }
    for (const site of SITES) for (let d = 0; d < 12; d++) {
      const r = rawRow(site, d);
      if (r === 61) continue;   // Airport's Saturday: the missing day, cleared below
      const k = Math.round((400 + rng() * 2200) / 10) * 10;
      patch[`Raw!C${r}`] = { value: k };
      patch[`Raw!D${r}`] = { value: prices[site] };
      patch[`Raw!E${r}`] = { value: r2(k * prices[site]) };
      patch[`Raw!F${r}`] = { value: r2(k * WHOLESALE) };   // every energy cost in, F12/F19/F28/F44/F47 included
    }
    // the text-number: 1,240 typed with a trailing space; its revenue and energy cost agree with 1,240
    patch['Raw!C33'] = { value: '1,240 ' };
    patch['Raw!E33'] = { value: r2(1240 * prices.Riverside) };
    patch['Raw!F33'] = { value: r2(1240 * WHOLESALE) };
    for (const col of ['C', 'D', 'E', 'F']) patch[`Raw!${col}61`] = null;   // Airport's Saturday never came through
    patch['Raw!B14'] = { value: 'Muller' };                                  // the lone typo
    for (const r of REPEAT_ROWS) patch[`Raw!B${r}`] = { value: 'Riverisde' };   // the repeated one
    patch['Raw!B55'] = { value: 'Airport' };                                 // the module's other plantings are not this challenge's
    patch['Raw!H3'] = null;
    return patch;
  },
  goals: [
    { id: 'missing-day', text: `Airport’s Saturday never came through: enter management’s figures in C61:F61 — ${kwh.toLocaleString('en-US')} kWh, ${usd(price)}, ${usd(revenue)} revenue and ${usd(energy)} energy cost.`,
      keys: `Ctrl+PgDn Ctrl+↓ Ctrl+→ → "${kwh}" Tab "${price}" Tab "${revenue}" Tab "${energy}" ↵`,
      check: (s, ses) => { const sh = raw(ses); return !!sh && dayIn(sh); } },
    { id: 'lone-typo', text: 'Mueller is misspelled Muller in one row of the 60-row feed: find it and fix it in place.', keys: 'Ctrl+F "Muller" ↵ Esc F2 Home → ×2 "e" ↵',
      check: (s, ses) => rawIs(ses, 'B14', c => c.value === 'Mueller') },
    { id: 'repeated-typo', text: 'Riverside reads Riverisde in three rows: Replace All of them in one step and read the count.', keys: 'Ctrl+H "Riverisde" Tab "Riverside" Alt+A Esc',
      check: (s, ses) => { const sh = raw(ses); return !!sh && noRepeatTypo(sh); } },
    { id: 'text-number', text: 'The kWh figure 1,240 in the Riverside rows was typed as text and sits on the left: make it a number.', keys: 'Ctrl+F "1,240" ↵ Esc F2 ⌫ ↵',
      check: (s, ses) => { const sh = raw(ses); return !!sh && sh.value('C33') === 1240 && !FEED_ROWS.some(r => isText(sh.cellAt('C' + r))); } },
    { id: 'summary-header', text: 'Copy the site totals header H7:K7, insert a sheet named Summary in front, drop the header on its A1 and label E1 Snapshot.',
      keys: 'Ctrl+Home Ctrl+→ → ×2 Ctrl+↓ ↓ Shift+→ ×3 Ctrl+C Ctrl+PgUp Shift+F11 Alt H O R "Summary" ↵ ↵ Ctrl+→ → "Snapshot" ↵',
      check: (s, ses) => { const names = ses.sheets.map(x => x.name); const sum = summary(ses);
        return names[0] === 'Summary' && names.includes('Report') && !!sum && sum.value(SNAP.label) === 'Snapshot' && headerOn(sum) && !ses.editing; } },
    { id: 'snapshot-values', text: 'With the feed complete, paste Raw’s site rows H8:K12 as values onto Summary!A2: a snapshot is values, never a live formula.', convention: 'E4',
      keys: 'Ctrl+PgDn ×2 Ctrl+Home Ctrl+→ → ×2 Ctrl+↓ ↓ ×2 Ctrl+Shift+↓ Shift+↑ Shift+→ ×3 Ctrl+C Ctrl+PgUp ×2 Ctrl+Home ↓ Ctrl+Alt+V V ↵',
      check: (s, ses) => { const sum = summary(ses), rw = raw(ses); return !!sum && !!rw && valuesOn(sum, rw); } },
    { id: 'summary-timeline', text: 'Under the snapshot, type Day in A8 and fill a Mon–Sat timeline across B8:G8.', keys: 'Ctrl+↓ ↓ ×2 "Day" Tab "Mon" Ctrl+↵ Shift+→ ×5 then Alt H F I S ↵',
      check: (s, ses) => { const sum = summary(ses); return !!sum && timelineOn(sum) && !ses.editing; } },
  ],
  graders: [
    ses => { const sum = summary(ses); if (!sum) return { ok: false, why: 'No Summary sheet — the snapshot and the timeline live on a sheet named Summary, in front' };
      for (let i = 0; i < SITES.length; i++) for (const col of SNAP_COLS) { const ref = col + (SNAP.firstRow + i); if (sum.cellAt(ref).formula) return { ok: false, why: `Summary!${ref} in the snapshot is a live formula — a snapshot is values, on purpose` }; }
      return { ok: true }; },
    ses => { const sum = summary(ses); if (!sum) return { ok: false, why: 'No Summary sheet.' };
      for (const col of SNAP_COLS) { const ref = col + SNAP.headerRow; if (sum.cellAt(ref).bold !== true) return { ok: false, why: `Summary!${ref} is not bold — the header keeps its format when it is pasted plain` }; }
      return { ok: true }; },
    // E4 the other way round: the platform's block I8:K12 is still live — values went onto the snapshot, not over the formulas
    ses => { const sh = raw(ses); if (!sh) return { ok: false, why: 'No Raw sheet.' };
      for (let i = 0; i < SITES.length; i++) for (const col of ['I', 'J', 'K']) {
        const ref = col + (8 + i); const c = sh.cellAt(ref);
        if (!c.formula) return { ok: false, why: `${ref} is a typed number where the platform’s live total belongs — values go onto the snapshot, never over the live block` };
        if (!liveness(sh, ref).ok) return { ok: false, why: `${ref} no longer moves with the feed — the platform’s total is a live formula` };
      }
      return { ok: true }; },
    ses => { const sum = summary(ses); if (!sum) return { ok: false, why: 'No Summary sheet.' };
      return sum.value(SNAP.label) === 'Snapshot' ? { ok: true } : { ok: false, why: 'Summary!E1 does not read Snapshot — label what the block is before anyone reads it' }; },
    ses => { const sh = raw(ses); if (!sh) return { ok: false, why: 'No Raw sheet.' };
      for (const r of FEED_ROWS) for (const col of ['C', 'D', 'E', 'F']) { const c = sh.cellAt(col + r); if (c.value == null && !c.formula) return { ok: false, why: `row ${r} of the feed is still blank` }; }
      return { ok: true }; },
    ses => { const sh = raw(ses); if (!sh) return { ok: false, why: 'No Raw sheet.' };
      for (const r of FEED_ROWS) if (isText(sh.cellAt('C' + r))) return { ok: false, why: `C${r} is text sitting on the left — a kWh figure is a number` };
      return { ok: true }; },
    ses => { const sh = raw(ses); if (!sh) return { ok: false, why: 'No Raw sheet.' };
      for (const r of FEED_ROWS) { const v = sh.value('B' + r); if (!SITES.includes(v)) return { ok: false, why: `B${r} reads ${v} — the five sites are Domain, Mueller, Riverside, South Lamar and Airport` }; }
      return { ok: true }; },
  ],
  solution: `Ctrl+PgDn Ctrl+Down Ctrl+Right Right "${kwh}" Tab "${price}" Tab "${revenue}" Tab "${energy}" Enter Ctrl+F "Muller" Enter Escape F2 Home Right Right "e" Enter Ctrl+H "Riverisde" Tab "Riverside" Alt+A Escape Ctrl+F "1,240" Enter Escape F2 Backspace Enter Ctrl+Home Ctrl+Right Right Right Ctrl+Down Down Shift+Right Shift+Right Shift+Right Ctrl+C Ctrl+PgUp Shift+F11 Alt H O R "Summary" Enter Enter Ctrl+Right Right "Snapshot" Enter Ctrl+PgDn Ctrl+PgDn Ctrl+Home Ctrl+Right Right Right Ctrl+Down Down Down Ctrl+Shift+Down Shift+Up Shift+Right Shift+Right Shift+Right Ctrl+C Ctrl+PgUp Ctrl+PgUp Ctrl+Home Down Ctrl+Alt+V V Enter Ctrl+Down Down Down "Day" Tab "Mon" Ctrl+Enter Shift+Right Shift+Right Shift+Right Shift+Right Shift+Right Alt H F I S Enter`,
};
