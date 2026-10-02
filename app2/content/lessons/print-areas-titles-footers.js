// Chapter 2 · 2.7.1 Print areas, titles, fit to width, headers and footers (clearcoat-pnl, S6e → S7a)
// The financials section is three pages in a printed book, and Monthly is wider than a page. The
// pack's print set-up goes on once: landscape, one page wide by two tall, the title rows repeated,
// a footer that says which file, which page and which day, and the page centered. Page Setup is
// one per workbook in the engine, so the set-up is set once for the pack (no print area, no
// portrait Print, no custom header yet: those wait on per-sheet page setup).
import { CH2_PAGE_SETUP } from '../workbooks/clearcoat-pnl.js';

const setup = ses => (ses.settings && ses.settings.pageSetup) || {};
const footer = ses => setup(ses).footer || {};
const W = CH2_PAGE_SETUP;
const closed = ses => !ses.dialog && !ses.editing;
const landscape = ses => setup(ses).orientation === W.orientation;
const fitWide = ses => { const p = setup(ses); return p.scaling === 'fit' && p.fitWide === W.fitWide && p.fitTall === W.fitTall; };
const titles = ses => setup(ses).titlesRows === W.titlesRows;
const footed = ses => { const f = footer(ses); return f.left === W.footer.left && f.centre === W.footer.centre && f.right === W.footer.right; };
const centered = ses => { const p = setup(ses); return p.centerH === true && !p.centerV && !p.margins; };

export default {
  id: 'print-areas-titles-footers',
  chapter: 'formatting',
  section: 'Printing and page layout',
  module: 'printing-and-page-layout',
  workbook: 'clearcoat-pnl',
  state: { before: 'S6e', after: 'S7a' },
  title: 'Print areas, titles, fit to width, headers and footers',
  difficulty: 'medium',
  tags: ['print', 'page-setup', 'pnl'],
  access: 'paid',
  minutes: 5,
  headline: 'Alt P S P',
  conventions: ['G1', 'G2'],
  teaches: ['page-numbers-footer', 'center-on-page'],
  uses: ['page-setup', 'orientation', 'fit-to-page', 'print-titles', 'keytips', 'ribbon-tabs'],
  prerequisites: ['challenge-house-format-set'],
  brief: 'Chapter 1 set one page to print; a pack needs the same on every sheet, and Monthly is wider than a page. Fit to one page wide lets a wide sheet run down two pages tall; print titles repeat the header rows on each; the footer carries the file, the page number and the date on every sheet. The key is `Alt P S P`.',
  goals: [
    { id: 'landscape', text: 'The P&L and Monthly both run wider than they are tall: turn the pack landscape with Alt, P, O, L.',
      keys: 'Alt P O L', requires: ['orientation', 'keytips', 'ribbon-tabs'], convention: 'G1',
      hintStuck: 'pulse the Page Layout tab · Orientation sits on Page Layout, and L is landscape.',
      check: (s, ses) => landscape(ses) && closed(ses) },
    { id: 'fit-wide', text: 'Open Page Setup with Alt, P, S, P and set Fit to 1 page wide by 2 tall, so Monthly runs down the page and not off it.',
      keys: 'Alt P S P Alt+F Tab 2 ↵', requires: ['page-setup', 'fit-to-page', 'keytips'], convention: 'G1',
      hintStuck: 'pulse the Page Setup dialog · Alt+F picks Fit to; Tab moves to the tall count.',
      check: (s, ses) => landscape(ses) && fitWide(ses) && closed(ses) },
    { id: 'titles', text: 'Repeat the title, units line, timeline and flags on every printed page: Print Titles with Alt, P, I, rows 1:5.',
      keys: 'Alt P I "1:5" ↵', requires: ['print-titles', 'page-setup', 'keytips'], convention: 'G2',
      hintStuck: 'pulse the Sheet tab of Page Setup · Rows to repeat at top takes 1:5.',
      check: (s, ses) => fitWide(ses) && titles(ses) && closed(ses) },
    { id: 'footer', text: 'In Page Setup\'s Custom Footer, Alt+U, put &[File] left, Page &[Page] of &[Pages] in the center and &[Date] right.',
      teach: 'A pack prints many pages, so the footer numbers them: &[Page] is this page and &[Pages] the count, and Page &[Page] of &[Pages] reads Page 2 of 3. Alt+L, Alt+C and Alt+R move between the three sections of Custom Footer.',
      keys: 'Alt P S P H Alt+U "&[File]" Alt+C "Page &[Page] of &[Pages]" Alt+R "&[Date]" ↵ ↵', requires: ['page-numbers-footer', 'print-titles', 'page-setup'], convention: 'G1',
      hintStuck: 'pulse the Header/Footer tab · H reaches the tab, Alt+U opens Custom Footer.',
      check: (s, ses) => titles(ses) && footed(ses) && closed(ses) },
    { id: 'center', text: 'On Page Setup\'s Margins tab, tick Center on page Horizontally with Alt+Z and keep the margins as they are.',
      teach: 'Center on page puts the same white space either side of the figures, so a page narrower than the paper sits in the middle. Excel\'s Normal margins keep the header margin, 0.3 inches, under the top margin, 0.75, so the header never prints over the title row.',
      keys: 'Alt P S P M Alt+Z ↵', requires: ['center-on-page', 'page-setup'], convention: 'G2',
      hintStuck: 'pulse the Margins tab · M reaches the tab, and Alt+Z ticks Horizontally.',
      check: (s, ses) => footed(ses) && centered(ses) && closed(ses) },
    { id: 'tie', closer: true, demo: { script: 'Ctrl+G "C7" Enter "18500" Enter Ctrl+G "C10" Enter Escape Escape Escape', cadence: 320 },
      text: 'Does it tie? Watch C7 change to 18500 and total revenue in C10 answer: the print set-up changed nothing on the sheet.',
      requires: [],
      hintStuck: 'pulse cell C10 · Print settings live beside the sheet, not in it.',
      check: (s, ses) => ses.demoDone.has('tie') },
  ],
  endState: [
    { text: 'The pack prints landscape, one page wide by two tall, centered horizontally', check: (s, ses) => landscape(ses) && fitWide(ses) && centered(ses) },
    { text: 'Rows 1:5 repeat at the top of every printed page', check: (s, ses) => titles(ses) },
    { text: 'The footer carries the file, the page number and the date', check: (s, ses) => footed(ses) },
  ],
  closing: [
    'Three sheets share one footer, so every page knows which file it came from.',
    'Landscape, one page wide, the title rows on every page, and a footer that names the file, the page and the day: the pack prints the way a reader turns it. Monthly runs to two pages tall, and the next lesson decides where the second one starts.',
  ],
  solution: 'Alt P O L Alt P S P Alt+F Tab 2 Enter Alt P I "1:5" Enter Alt P S P H Alt+U "&[File]" Alt+C "Page &[Page] of &[Pages]" Alt+R "&[Date]" Enter Enter Alt P S P M Alt+Z Enter',
};
