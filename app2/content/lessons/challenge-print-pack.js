// Chapter 2 · 2.7.C Challenge: a three-sheet model prints as a clean pack (seeded over S7C)
// A cluster's pack, its three pages built and Print linked, with no print set-up anywhere. The
// set-up goes on in three minutes: landscape, one page wide by two tall, the title rows repeated,
// one footer with the file, the page number and the date, and the page centered. Seeds pick the
// cluster and its figures; the workload never moves. (Print areas, a portrait Print and the page
// break above the site costs wait on per-sheet page setup and Page Break Preview in the engine.)
import { CH2_PAGE_SETUP, challengeSeed, PRINT_CHECK, PRINT } from '../workbooks/clearcoat-pnl.js';
import { parsFrom } from '../../app/pars.js';

const setup = ses => (ses.settings && ses.settings.pageSetup) || {};
const footer = ses => setup(ses).footer || {};
const W = CH2_PAGE_SETUP;
const closed = ses => !ses.dialog && !ses.editing;
const landscape = ses => setup(ses).orientation === W.orientation;
const fitWide = ses => { const p = setup(ses); return p.scaling === 'fit' && p.fitWide === W.fitWide && p.fitTall === W.fitTall; };
const titles = ses => setup(ses).titlesRows === W.titlesRows;
const footed = ses => { const f = footer(ses); return f.left === W.footer.left && f.centre === W.footer.centre && f.right === W.footer.right; };
const centered = ses => setup(ses).centerH === true;
const sheetOf = (ses, name) => { const e = ses.sheets.find(x => x.name === name); return e ? e.sheet : null; };

export default {
  id: 'challenge-print-pack',
  chapter: 'formatting',
  section: 'Printing and page layout',
  module: 'printing-and-page-layout',
  workbook: 'clearcoat-pnl',
  state: { before: 'S7C' },
  kind: 'challenge',
  title: 'Challenge: a three-sheet model prints as a clean pack',
  difficulty: 'medium',
  tags: ['challenge', 'print', 'page-setup', 'pnl'],
  access: 'paid',
  minutes: 3,
  conventions: ['G1', 'G2'],
  prerequisites: ['one-page-summary'],
  brief: 'Three sheets, no print set-up. Orientation, fit, titles, one footer everywhere and the page centered: a pack a reader can print without thinking.',
  timeLimit: 150,
  pars: parsFrom(40, { pass: 120, pro: 60 }),
  seed: rng => challengeSeed('challenge-print-pack', rng),
  goals: [
    { id: 'landscape', text: 'Turn the pack landscape with Alt, P, O, L.', convention: 'G1',
      keys: 'Alt P O L',
      check: (s, ses) => landscape(ses) && closed(ses) },
    { id: 'fit-wide', text: 'In Page Setup, Alt, P, S, P, fit the pack to 1 page wide by 2 tall.', convention: 'G1',
      keys: 'Alt P S P Alt+F Tab 2 ↵',
      check: (s, ses) => landscape(ses) && fitWide(ses) && closed(ses) },
    { id: 'titles', text: 'Repeat rows 1:5 at the top of every printed page with Print Titles, Alt, P, I.', convention: 'G2',
      keys: 'Alt P I "1:5" ↵',
      check: (s, ses) => fitWide(ses) && titles(ses) && closed(ses) },
    { id: 'footer', text: 'In Custom Footer, Alt+U, put &[File] left, Page &[Page] of &[Pages] in the center and &[Date] right.', convention: 'G1',
      keys: 'Alt P S P H Alt+U "&[File]" Alt+C "Page &[Page] of &[Pages]" Alt+R "&[Date]" ↵ ↵',
      check: (s, ses) => titles(ses) && footed(ses) && closed(ses) },
    { id: 'center', text: 'On Page Setup\'s Margins tab, center the page horizontally with Alt+Z.', convention: 'G2',
      keys: 'Alt P S P M Alt+Z ↵',
      check: (s, ses) => footed(ses) && centered(ses) && closed(ses) },
  ],
  graders: [
    ses => {
      if (!landscape(ses) || !fitWide(ses)) return { ok: false, why: 'the pack does not print landscape, one page wide by two tall' };
      if (!titles(ses)) return { ok: false, why: 'rows 1:5 do not repeat at the top of each printed page' };
      if (!footed(ses)) return { ok: false, why: 'the footer does not carry the file, Page &[Page] of &[Pages] and the date' };
      if (!centered(ses)) return { ok: false, why: 'the page is not centered horizontally' };
      return { ok: true };
    },
    ses => { const sh = sheetOf(ses, 'Print'); if (!sh) return { ok: false, why: 'the Print sheet is missing' };
      return sh.value('C' + PRINT.check) === 0 ? { ok: true } : { ok: false, why: `Print C${PRINT.check} (${PRINT_CHECK[0]}) does not read zero` }; },
  ],
  solution: 'Alt P O L Alt P S P Alt+F Tab 2 Enter Alt P I "1:5" Enter Alt P S P H Alt+U "&[File]" Alt+C "Page &[Page] of &[Pages]" Alt+R "&[Date]" Enter Enter Alt P S P M Alt+Z Enter',
};
