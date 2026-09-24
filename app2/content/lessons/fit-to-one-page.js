// Chapter 1 · 1.7.1 — Fit to one page (voltline-weekly, S6f → S7a)
// The Report is finished and the deal team will print it and read it on paper. The print set-up
// is part of the model (G1): read how far the page runs, turn it landscape, fit it to one page
// wide by one tall, repeat the title rows on every printed page, and put the file name and the
// date in the footer so every copy says what it is. Nothing on the sheet changes; the settings
// do, and the checker's after-state diff reads them.
import { REPORT_PAGE_SETUP } from '../workbooks/voltline-weekly.js';

const windowKeys = ses => ses.keyLog.slice(ses.goalMark || 0).map(e => e.k);
const report = ses => { const e = ses.sheets.find(x => x.name === 'Report'); return e ? e.sheet : null; };
const onReport = ses => { const e = ses.sheets[ses.sheetIndex]; return !!e && e.name === 'Report'; };
const setup = ses => (ses.settings && ses.settings.pageSetup) || {};
const footer = ses => setup(ses).footer || {};

const WANT = REPORT_PAGE_SETUP;
const landscape = ses => setup(ses).orientation === WANT.orientation;
/** Fit to page: scaling 'fit', one page wide by one tall (Excel stores the two counts; both must read 1). */
const fitsOnePage = ses => { const p = setup(ses); return p.scaling === WANT.scaling && p.fitWide === WANT.fitWide && p.fitTall === WANT.fitTall; };
/** Rows to repeat at top, as Excel shows it back: $1:$4. */
const titlesSet = ses => setup(ses).titlesRows === WANT.titlesRows;
const footerLeft = ses => footer(ses).left === WANT.footer.left;
const footerRight = ses => footer(ses).right === WANT.footer.right && !footer(ses).centre;
const wholeSetup = ses => landscape(ses) && fitsOnePage(ses) && titlesSet(ses) && footerLeft(ses) && footerRight(ses) && !setup(ses).printGridlines;

export default {
  id: 'fit-to-one-page',
  chapter: 'foundations',
  section: 'Present and audit',
  module: 'present-and-audit',
  workbook: 'voltline-weekly',
  state: { before: 'S6f', after: 'S7a' },
  title: 'Fit to one page',
  difficulty: 'easy',
  tags: ['print', 'page-setup', 'report'],
  access: 'free',
  minutes: 5,
  headline: 'Alt P S P',
  conventions: ['G1', 'G2', 'A6'],
  teaches: ['orientation', 'page-setup', 'fit-to-page', 'print-titles'],
  uses: ['keytips', 'ribbon-tabs', 'ctrl-home-end'],
  prerequisites: ['read-the-error'],
  brief: 'The Report is finished and the deal team, the people running the sale, will print it and read it on paper, where a page that spills onto a second sheet reads as careless. Set it to print landscape on one page, with the title rows repeated and the file name and date in the footer, so every copy says what it is. The key is `Alt P S P`.',
  goals: [
    { id: 'read-the-page', text: 'Read the page before you set it: Ctrl+End lands on Z31, the last used cell, so the Report is wider than tall; Ctrl+Home returns to A1.', keys: 'Ctrl+End Ctrl+Home', requires: ['ctrl-home-end'], convention: 'G2',
      check: (s, ses) => { const sh = report(ses); return !!sh && onReport(ses) && windowKeys(ses).includes('Ctrl+End') && sh.selectionText() === 'A1' && !ses.dialog && !ses.editing; } },
    { id: 'landscape', teach: 'Page Layout › Orientation, Alt P O then L for landscape or P for portrait, turns the printed page without opening a dialog box.', text: 'A page wider than it is tall prints landscape: turn the Report with Alt P O L.', keys: 'Alt P O L', requires: ['orientation', 'keytips', 'ribbon-tabs'],
      check: (s, ses) => landscape(ses) && !ses.dialog },
    { id: 'fit', teach: 'Page Setup, Alt P S P, holds every print setting on three pages; F picks Fit to, one page wide by one page tall, and Enter is OK.', text: 'One page, however wide the columns run: open Page Setup, choose Fit to 1 page wide by 1 tall, and OK it.', keys: 'Alt P S P F ↵', requires: ['page-setup', 'fit-to-page', 'keytips', 'ribbon-tabs'], convention: 'G1',
      check: (s, ses) => landscape(ses) && fitsOnePage(ses) && !ses.dialog },
    { id: 'print-titles', teach: 'Print Titles, Alt P I, opens Page Setup on its Sheet page; the rows typed as Rows to repeat at top, 1:4, print at the top of every page.', text: 'The title, the units line and the header row must top every printed page: set Print Titles to rows 1:4 with Alt P I.', keys: 'Alt P I "1:4" ↵', requires: ['print-titles', 'page-setup', 'keytips'],
      check: (s, ses) => landscape(ses) && fitsOnePage(ses) && titlesSet(ses) && !ses.dialog },
    { id: 'footer-file', text: 'A printed page must say which file it came from: on Page Setup’s Header/Footer page, Alt+H, put the field code &[File] in the left footer section.', keys: 'Alt P S P Alt+H "&[File]" ↵', requires: ['print-titles', 'page-setup', 'keytips'],
      check: (s, ses) => landscape(ses) && fitsOnePage(ses) && titlesSet(ses) && footerLeft(ses) && !ses.dialog },
    { id: 'footer-date', text: 'And when it was printed: back on the Header/Footer page, Alt+R moves to the right section; put &[Date] there and OK it.', keys: 'Alt P S P Alt+H Alt+R "&[Date]" ↵', requires: ['print-titles', 'page-setup', 'keytips'], convention: 'G1',
      check: (s, ses) => wholeSetup(ses) && !ses.dialog },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Report!C9" Enter "3000" Enter Ctrl+G "Report!C11" Enter Escape Escape Escape', cadence: 320 }, text: 'Does it tie? Watch Cedar Park’s kWh in C9 change to 3,000 and the Total in C11 answer: the print set-up changed nothing on the sheet.', requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The Report prints landscape, fit to one page wide by one tall', check: (s, ses) => landscape(ses) && fitsOnePage(ses) },
    { text: 'Rows 1:4 repeat at the top of every printed page', check: (s, ses) => titlesSet(ses) },
    { text: 'The footer carries the file name on the left and the date on the right', check: (s, ses) => footerLeft(ses) && footerRight(ses) },
  ],
  closing: [
    'The Report now prints on one landscape page with its title rows on every sheet and the file name and date in the footer: the print set-up is part of the model (G1), and a page reads the way the buyer reads it, title, units, timeline, then the answer (G2).',
    'Before it goes out, save it as a new version rather than over the only copy (A6); the sheet itself did not change, and Cedar Park’s kWh still moves the Total.',
  ],
  solution: 'Ctrl+End Ctrl+Home Alt P O L Alt P S P F Enter Alt P I "1:4" Enter Alt P S P Alt+H "&[File]" Enter Alt P S P Alt+H Alt+R "&[Date]" Enter',
};
