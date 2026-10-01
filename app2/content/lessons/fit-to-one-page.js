// Chapter 1 · 1.7.1 — Fit to one page (clearcoat-weekly, S6f → S7a)
// The Report is finished and the CFO will print it and read it on paper. The print set-up is part
// of the page (G1): read how far the sheet runs, turn it landscape, fit it to one page wide by one
// tall, repeat the title rows on every printed page, and put the file name and the date in the
// footer so every copy says what it is and when it was printed. Nothing on the sheet changes; the
// settings do, and the checker's after-state diff reads them.
import { REPORT_PAGE_SETUP } from '../workbooks/clearcoat-weekly.js';

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
  workbook: 'clearcoat-weekly',
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
  prerequisites: ['read-the-error-follow-the-trail'],
  brief: 'The Report is finished and the CFO will print it and read it on paper, where a page that spills onto a second sheet reads as careless. Set it to print landscape on one page, with the title rows repeated and the file name and date in the footer, so every copy says what it is and when it was printed. Page Layout is Alt, P; Page Setup is the dialog behind it, and Ctrl+F2 shows you what the printer will get. The key is `Alt P S P`.',
  wow: 'It prints on one landscape page, with the heads on every sheet and the file and date in the footer.',
  goals: [
    { id: 'read-the-page', text: 'Before you set the page, read how far it runs: jump to the last used cell, Z31, then come back to the top of the sheet.',
      teach: 'Ctrl+End shows the sheet\'s extent: if it\'s further than your table, something stray is out there and it will print. Stray formats on emptied cells are the usual cause: Delete leaves them behind, so clear them with Clear All (Alt, H, E, A, from 1.3.1), save, and Ctrl+Home brings you back to the top.',
      hintStuck: 'pulse cell Z31 · Ctrl+End, look, Ctrl+Home.',
      keys: 'Ctrl+End Ctrl+Home', requires: ['ctrl-home-end'],
      check: (s, ses) => { const sh = report(ses); return !!sh && onReport(ses) && windowKeys(ses).includes('Ctrl+End') && sh.selectionText() === 'B5' && !ses.dialog && !ses.editing; } },
    { id: 'landscape', text: 'A page wider than it is tall prints landscape: turn the Report with Alt, P, O, L.',
      teach: 'Page Layout › Orientation, Alt, P, O, then L for landscape or P for portrait, turns the printed page without opening a dialog.',
      hintStuck: 'pulse the Page Layout tab · Alt, P, O, L.',
      keys: 'Alt P O L', requires: ['orientation', 'keytips', 'ribbon-tabs'],
      check: (s, ses) => landscape(ses) && !ses.dialog },
    { id: 'fit', text: 'One page, however wide the columns run: open Page Setup, choose Fit to, leave the counts at 1 page wide by 1 tall, and OK it.',
      teach: 'Page Setup, Alt, P, S, P, holds every print setting on its tabbed pages; Alt+F picks Fit to, one page wide by one tall, and Enter is OK. Fit to one is the default for any page that goes to a reader.',
      hintStuck: 'pulse the Page Setup dialog · Alt, P, S, P; Alt+F for Fit to; Enter.',
      keys: 'Alt P S P Alt+F ↵', requires: ['page-setup', 'fit-to-page', 'keytips', 'ribbon-tabs'], convention: 'G1',
      check: (s, ses) => landscape(ses) && fitsOnePage(ses) && !ses.dialog },
    { id: 'print-titles', text: 'The title, the units line and the header row must top every printed page: set Print Titles to rows 1:4 with Alt, P, I.',
      teach: 'Print Titles, Alt, P, I, opens Page Setup on its Sheet page; the rows typed as Rows to repeat at top, 1:4, print at the top of every page. On a one-page report it\'s insurance for the day it grows.',
      hintStuck: 'pulse the Sheet tab of Page Setup · Alt, P, I; type 1:4 in Rows to repeat at top; Enter.',
      keys: 'Alt P I "1:4" ↵', requires: ['print-titles', 'page-setup', 'keytips'],
      check: (s, ses) => landscape(ses) && fitsOnePage(ses) && titlesSet(ses) && !ses.dialog },
    { id: 'footer-file', text: 'A printed page must say which file it came from: on Page Setup\'s Header/Footer tab, open Custom Footer and put &[File] in the left section.',
      teach: 'Header/Footer is a tab in Page Setup, and the tabs answer to their first letter as Format Cells\' do, so H reaches it; Alt+U opens Custom Footer with the cursor in the left of its three sections, and &[File] is the code for the file name. Every printed page traces back to its file.',
      hintStuck: 'pulse the Header/Footer tab · Alt, P, S, P; H for the Header/Footer tab; Alt+U for Custom Footer; type &[File] in the left section; OK, then OK.',
      keys: 'Alt P S P H Alt+U "&[File]" ↵ ↵', requires: ['print-titles', 'page-setup', 'keytips'],
      check: (s, ses) => landscape(ses) && fitsOnePage(ses) && titlesSet(ses) && footerLeft(ses) && !ses.dialog },
    { id: 'footer-date', text: 'A printed page must also say when it was printed: on the Header/Footer page, Alt+R moves to the right section; put &[Date] there and OK it.',
      teach: '&[Date] prints the date on the day it\'s printed, so a stale copy on a desk says so. &[Page] of &[Pages] goes in the center on a multi-page pack (the challenge).',
      hintStuck: 'pulse the right footer section · Alt+R in the footer dialog; &[Date]; Enter, Enter.',
      keys: 'Alt P S P Alt+U Alt+R "&[Date]" ↵ ↵', requires: ['print-titles', 'page-setup', 'keytips'], convention: 'G1',
      check: (s, ses) => wholeSetup(ses) && !ses.dialog },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "Report!C9" Enter "300" Enter Ctrl+G "Report!C11" Enter Escape Escape Escape', cadence: 320 },
      text: 'Does it tie? Change Cedar Park\'s washes in C9 to 300 and watch the Total in C11 answer: the print set-up changed nothing on the sheet.',
      teach: 'Print settings live beside the sheet, not in it. Ctrl+F2 shows what the printer will get; Esc comes back.',
      hintStuck: 'pulse cell C11 · C9, 300, Enter; then Ctrl+F2 to see the page, Esc.',
      requires: [],
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The Report prints landscape, fit to one page wide by one tall', check: (s, ses) => landscape(ses) && fitsOnePage(ses) },
    { text: 'Rows 1:4 repeat at the top of every printed page', check: (s, ses) => titlesSet(ses) },
    { text: 'The footer carries the file name on the left and the date on the right', check: (s, ses) => footerLeft(ses) && footerRight(ses) },
  ],
  deviations: [
    'read-the-page is a read-back goal (Ctrl+End then Ctrl+Home): its check reads the key window plus the resting state, since reading the page changes nothing. The Report is frozen at B5 from 1.4.3, so Ctrl+Home rests on B5, the first unfrozen cell, as in Excel.',
    'No at-scale goal: a print set-up changes settings, not rows; read-the-page is the composition goal.',
  ],
  closing: [
    'The print set-up is part of the page: landscape, fit to one, the title rows repeated, the footer saying which file and when. A page reads the way the reader reads it: title, units, timeline, then the answer.',
    'Best practice: save a new version rather than over the only copy (Clearcoat_Weekly_KPI_v03_2026-09-15.xlsx, never "final"), and Ctrl+Home on every sheet before you send. A file with pay or deal figures that leaves by email gets a password first: File, Info (Alt, F, I), Protect Workbook, Encrypt with Password. Protect Sheet sits in the same menu, and desks rarely lock a model.',
  ],
  solution: 'Ctrl+End Ctrl+Home Alt P O L Alt P S P Alt+F Enter Alt P I "1:4" Enter Alt P S P H Alt+U "&[File]" Enter Enter Alt P S P Alt+U Alt+R "&[Date]" Enter Enter',
};
