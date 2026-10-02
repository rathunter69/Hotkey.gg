// app2/tests/hardcoded-allow.js — the hardcoded-strings guard's allow list (R8, M1; the guard is
// tests/hardcoded-strings.js). A line belongs here only when it is not the course's voice: Excel's
// own interface words (screenplay 9: dialog titles, Ribbon labels and Options rows copy Excel and are
// not listed), developer text, a fallback table a sheet overrides row by row, a retired screen, or a
// legal page that changes only with Wolf's go-ahead. Everything a learner reads in the course's voice
// is a copy-sheet row instead. A new screen line that is none of these goes in site.csv.

/** Whole files, with the reason. */
export const ALLOW_FILES = {
  'ui/ribbon-view.js': 'Excel’s own Ribbon, dialogs and Options pages: their words copy Excel',
  'ui/ribbon-commands.js': 'Excel’s own command names and ScreenTips',
  'ui/tool-cards.js': 'Excel’s own dialogs (Goal Seek, Data Table, Text to Columns, PivotTable, Data Validation): their words copy Excel',
  'app/legal-pages.js': 'Terms, Privacy, EULA and Contact: legal text changes only with Wolf’s go-ahead (CLAUDE.md, business constraints)',
  'app/beats.js': 'the fallback table for modules.csv: every built module’s name, objective and story beat is a modules.csv row, which wins',
  'app/schedule.js': 'the micro-drills behind the retired Due today queue (M18): micro.csv carries their prompts',
  'app/rank.js': 'the rank ladder, retired (M22) and not imported',
  'app/sandbox.js': 'the sandbox, retired (M21)',
};

/** Single lines: { file, text } where text is the start of the visible line, with the reason. */
export const ALLOW = [
  // developer text: the moments registry documents when each animation plays; no learner sees it
  { file: 'ui/effects.js', text: 'A page change over 150ms', why: 'moments registry' },
  { file: 'ui/effects.js', text: 'Entering a lesson, challenge or drill', why: 'moments registry' },
  { file: 'ui/effects.js', text: 'An arrow key on a site page', why: 'moments registry' },
  { file: 'ui/effects.js', text: 'The account menu, More, Help opens', why: 'moments registry' },
  { file: 'ui/effects.js', text: 'A key in a taught route', why: 'moments registry' },
  { file: 'ui/effects.js', text: 'A goal lands', why: 'moments registry' },
  { file: 'ui/effects.js', text: 'A timed run', why: 'moments registry' },
  { file: 'ui/effects.js', text: 'The panel changes beat', why: 'moments registry' },
  { file: 'ui/effects.js', text: 'A correct chord in rapid-fire', why: 'moments registry' },
  { file: 'ui/effects.js', text: 'A wrong chord in rapid-fire', why: 'moments registry' },
  { file: 'ui/effects.js', text: 'The third daily quest', why: 'moments registry' },
  { file: 'ui/effects.js', text: 'The day’s first practice', why: 'moments registry' },
  { file: 'ui/effects.js', text: 'An achievement is earned', why: 'moments registry' },
  { file: 'ui/effects.js', text: 'A level lands outside a result', why: 'moments registry' },
  { file: 'ui/effects.js', text: 'A personal best outside a result', why: 'moments registry' },
  { file: 'ui/effects.js', text: 'A goal with a tip', why: 'moments registry' },
  { file: 'ui/effects.js', text: 'A write to the account', why: 'moments registry' },
  { file: 'ui/effects.js', text: 'Checkout unlocks the course', why: 'moments registry' },
  { file: 'ui/effects.js', text: 'left: px; top: px;', why: 'an inline style' },
  { file: 'app/what-if.js', text: 'whatIf must be an object', why: 'a lesson-data validation error for the tests' },
  // a server message matched, never shown
  { file: 'app/account-page.js', text: 'too many tries', why: 'matches the redeem RPC’s error' },
  { file: 'app/store.js', text: 'carried to another account', why: 'matches the carry RPC’s error' },
  // the document title: the brand line index.html carries, and "Page · hotkey.gg" tab titles
  { file: 'app/main.js', text: 'hotkey.gg: the better way to master Excel', why: 'index.html’s own title; the landing keeps it so a shared link agrees' },
  { file: 'app/main.js', text: 'Page not found · hotkey.gg', why: 'a tab title' },
  { file: 'app/main.js', text: 'Get full access · hotkey.gg', why: 'a tab title' },
  // data names the code matches on
  { file: 'app/reference-page.js', text: 'Copy and paste', why: 'a content/reference.js category id' },
  { file: 'app/reference-page.js', text: 'Rows and columns', why: 'a content/reference.js category id' },
  { file: 'app/reference-page.js', text: 'Formulas and fill', why: 'a content/reference.js category id' },
  { file: 'app/reference-page.js', text: 'Data and outline', why: 'a content/reference.js category id' },
  { file: 'app/learn-page.js', text: 'Formatting and presentation', why: 'CHAPTER_PLAN’s working title; the chapter name on screen is the built chapter’s' },
  { file: 'app/learn-page.js', text: 'Formulas and functions', why: 'CHAPTER_PLAN’s working title' },
  { file: 'app/learn-page.js', text: 'Data and analysis', why: 'CHAPTER_PLAN’s working title' },
  { file: 'app/learn-page.js', text: 'Valuation and deals', why: 'CHAPTER_PLAN’s working title' },
];
