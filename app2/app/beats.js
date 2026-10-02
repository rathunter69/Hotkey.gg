// app2/app/beats.js — the story beats (experience pass, decision 4): one short card at each
// module boundary, shown once, in the deal-team voice — what just came in, what the module
// delivers. Nothing mid-lesson; the task card and one coach line per goal carry the work. The
// chapter-end moment ("page delivered") reads from the same table.
//
//   beatFor(lesson, moduleAt)  → { id, eyebrow, title, body } for the first lesson of a module, else null
import { moduleCopy, siteCopy, splitParas } from '../content/copy/apply.js';

/** The Chapter 1 modules as the map plans them: the number, the title and the objective (modules.csv overrides by id). */
const PLANNED_DEFAULT = [
  { n: '1.1', title: 'Open and set up', objective: 'Tidy the file as it arrived: tabs, gridlines, Excel Options, the QAT, the color-and-label conventions.' },
  { n: '1.2', title: 'Move and select', objective: 'Jumps, never scrolls: Ctrl+Arrow, the selection set, Go To, Go To Special.' },
  { n: '1.3', title: 'Enter, edit, copy and fill', objective: 'The missing day, the typos, the Report skeleton, Paste Special, Find and Replace, a timeline.' },
  { n: '1.4', title: 'Structure', objective: 'Rows and columns that keep the totals honest; widths, heights, AutoFit; hide, group, freeze.' },
  { n: '1.5', title: 'Format', objective: 'Numbers a banker can read; fonts, fills, borders; alignment and titles; the style pass.' },
  { n: '1.6', title: 'Formulas', objective: 'SUM and its family, relative and absolute references, links across sheets, the errors and what they mean.' },
  { n: '1.7', title: 'Present and audit', objective: 'The KPI page checked, print-ready and signed off: page one of the pack.' },
];
export const PLANNED_IDS = { '1.1': 'open-and-set-up', '1.2': 'move-and-select', '1.3': 'enter-edit-copy-fill', '1.4': 'structure', '1.5': 'format', '1.6': 'formulas', '1.7': 'present-and-audit' };
/** The seven planned modules; modules.csv (name, objective) overrides the built-in lines by module id. */
export const PLANNED_MODULES = PLANNED_DEFAULT.map(p => { const row = moduleCopy(PLANNED_IDS[p.n]); return row ? { ...p, title: (row.name || '').trim() || p.title, objective: (row.objective || '').trim() || p.objective } : p; });

/** The chapter-end line's shape; site.csv page_delivered overrides. {n} the module number, {module} its name, {page} modules.csv page_name. */
export const PAGE_DELIVERED = 'Page {n} is done: {page}.';

const BEATS_DEFAULT = {
  'open-and-set-up': { eyebrow: 'Module 1.1 · open and set up', title: 'The file arrived the way inherited files do.',
    body: 'A tab still called Sheet2, a dead half-export, no page for the report, a price buried inside a formula. Set it up to house standard first: the tab names you choose now are the names every reference carries later.' },
  'move-and-select': { eyebrow: 'Module 1.2 · move and select', title: 'The associate has questions about the feed.',
    body: 'Last row, last column, the first blank cost, the notes below the data. Answer each one by landing on the cell that holds it, and select what you will format later. Jumps, never scrolls: the mouse is for reviewing, not building.' },
  'enter-edit-copy-fill': { eyebrow: 'Module 1.3 · enter, edit, copy and fill', title: 'A day is missing and the figures have typos.',
    body: 'Airport’s Saturday never came through; management emailed the four figures. Enter them, fix the feed in place, and build the Report skeleton from Raw with the clipboard and the fill keys.' },
  structure: { eyebrow: 'Module 1.4 · structure', title: 'Cedar Park opened this week.',
    body: 'A sixth site row, a margin column, a stale column to remove, and a total that has to follow every edit. Then the widths, heights, groups and frozen panes that make the page readable.' },
  format: { eyebrow: 'Module 1.5 · format', title: 'Numbers a banker can read.',
    body: 'Thousands separators, no stray decimals, negatives in parentheses; bold totals with a top border; inputs blue with a light tint; the title centered across the page. The standard, applied once and then repeated in a single pass.' },
  formulas: { eyebrow: 'Module 1.6 · formulas', title: 'Make the page live.',
    body: 'Every figure on the Report links to Raw and Inputs, so a corrected feed flows through without retyping. SUM and its family, anchoring with F4, links across sheets, and what each error means.' },
  'present-and-audit': { eyebrow: 'Module 1.7 · present and audit', title: 'Sign the page off.',
    body: 'The buyer’s analyst opens page one first. Check the totals tie, the conventions hold, the print fits one page, and nothing is hardcoded that should not be. Then it goes in the pack.' },
  // Chapter 2 · Formatting and presentation (Run 1: 2.1 and 2.2; the rest land with their modules)
  'number-formats': { eyebrow: 'Module 2.1 · number formats', title: 'The P&L came out of the accounting system.',
    body: 'The owners have hired advisers to run the sale, and the first document is the book: the information memorandum that describes the company to buyers. Its financials section starts with three years of P&L, and what the accounting system exported is account codes in capitals, costs as positives and numbers to four decimal places. Before anyone reads it, the figures have to read like figures.' },
  'custom-number-formats': { eyebrow: 'Module 2.2 · custom number formats', title: 'Every number on the page has to say what it is.',
    body: 'A buyer flips to the financials and reads margins, multiples and thousands without a legend, so the number format has to carry the unit. A format code can write k or m after a figure, show a zero as a dash, color a negative and turn a plain date into FY26E, with the value underneath untouched. This module is the format code, one section at a time.' },
  'the-page-a-buyer-reads': { eyebrow: 'Module 2.3 · the page a buyer reads', title: 'The first page a buyer turns to.',
    body: 'The book, the information memorandum, is the document that describes the company to buyers, and its financials page is the one they turn to first. A page like that has an anatomy: a title that says what it is, a units line, a timeline, sections that add down to the answer, and a source under the table. Build it on the P&L the way the book will print it.' },
  'alignment-and-structure': { eyebrow: 'Module 2.4 · alignment and structure', title: 'Forty lines is too many to read.',
    body: 'By the time the site costs are broken out by line and the memo block is in, the P&L runs to forty rows, and a buyer wants the six that matter with the rest on demand. Groups fold the detail behind a button; indents show what belongs to what; a navigation column jumps a long sheet. The page stays complete and reads short.' },
  'conditional-formatting': { eyebrow: 'Module 2.5 · conditional formatting', title: 'Make the page flag its own mistakes.',
    body: 'The book will be read by people looking for a reason to pay less, so the page has to catch its own errors before they do. A conditional format is a rule the cell applies to itself: a check that isn’t zero turns red, a negative margin highlights, an exception stands out. Used well it’s a second pair of eyes, and used badly it’s wallpaper, so this module is about learning the difference.' },
  'dates-and-text-for-presentation': { eyebrow: 'Module 2.6 · dates and text for presentation', title: 'The headers should write themselves.',
    body: 'Every quarter the page rolls forward a year, and every time someone retypes the title, the headers and the units line. And one of them is wrong. A title that reads the company name from Inputs, headers that read the dates under them, a units line that reads the currency: change one cell and the whole page updates. The Monthly sheet, with its text dates and capitalized labels, is where to learn it.' },
  'printing-and-page-layout': { eyebrow: 'Module 2.7 · printing and page layout', title: 'The book goes to print.',
    body: 'The financials section is three pages, and the book is a PDF that gets printed, so each page has to land on one sheet, carry its title rows, and say which file and which page it is. The one-page summary reads from the detail behind it. Set the pack up to print and it’s ready for the data room.' },
  'ch2-project-and-assessment': { eyebrow: 'Module 2.8 · project and assessment', title: 'The financials section, start to finish.',
    body: 'A fresh export has landed: the same accounting system, the same faults, a different three years. Everything the chapter taught goes onto one workbook, until three pages are ready for the data room. Build it, then build it again on the clock, because the assessment is the test-out.' },
  // Chapter 3 · Formulas and functions (script-ch3.md story cards)
  logic: { eyebrow: 'Module 3.1 · logic', title: 'Which sites are pulling their weight?',
    body: 'The buyers’ first question is the CFO’s oldest one: which sites clear their daily target, which don’t, and what the managers earn when they do. The point-of-sale export has every wash; the Sites sheet has every target. A formula that can ask a question and act on the answer turns ninety rows into a page of flags.' },
  dates: { eyebrow: 'Module 3.2 · dates', title: 'How old is each site, and how long do members stay?',
    body: 'Two of the buyers’ questions are about time: how old each site is, because new ones ramp for two years, and how long a member stays before cancelling, because that’s what a $30-a-month fee is worth. Excel keeps a date as a number, days since the start of 1900, so dates subtract, add and compare like any figure once you know the functions that build and break them.' },
  // Chapter 3 · Formulas and functions
  'math-and-aggregation': { eyebrow: 'Module 3.3 · math and aggregation', title: 'Ninety rows into one page.',
    body: 'The buyers want washes and revenue by site and by package, the busiest sites, the blended ticket, and the question that decides whether they believe anything: whether the POS export agrees with what the managers sent. Every one of those is a count or a sum with a condition on it. Build them, then build the reconciliation and drive its check to zero.' },
  text: { eyebrow: 'Module 3.4 · text', title: 'The codes have to become words.',
    body: 'The POS writes AUS-DOM where a buyer wants Austin and Domain in their own columns, it packs the package and channel into one memo, and when the terminal hiccups it sends amounts as text. Text functions take a string apart and put it back together, Text to Columns does the same for a whole column at once, and nothing gets retyped.' },
  // Chapter 3 · Formulas
  'time-value-of-money': { eyebrow: 'Module 3.5 · time value of money', title: 'What is a new site worth?',
    body: 'Cedar Park cost $5m all in (the land, which Clearcoat owns there, and the build) and was funded with a $3.5m loan, and the buyers want two things: the loan’s schedule, and whether a site like it is worth building at all. A dollar next year is worth less than a dollar today, and the functions in this module say how much less: PMT for the loan, NPV and IRR for the site.' },
  auditing: { eyebrow: 'Module 3.6 · auditing', title: 'Somebody else’s Summary doesn’t tie.',
    body: 'Before you built yours, someone started a Summary sheet and left. It has a SUMIF pointing at a range a row short, a typed number in a formula column, a text "12", and a total that agrees with nothing. Chapter 1 taught the three looks; this module adds the tools a reviewer uses on a sheet they didn’t build, and the checks block that says, in one cell, whether the databook ties.' },
  'ch3-project-and-assessment': { eyebrow: 'Module 3.7 · project and assessment', title: 'The databook, tied out.',
    body: 'A fresh export, a fresh site list, a Summary someone else abandoned. Rebuild it so every number reads the export and the flag reads OK, then value the next site on the list. Build it, then build it again on the clock. The assessment is the test-out.' },
  // Chapter 4 · Data and lookups (script-ch4.md story cards)
  lookups: { eyebrow: 'Module 4.1 · lookups', title: 'The model can’t hold the data.',
    body: 'Sponsor A’s first question is simple, the Deluxe price, and the price list is on another sheet. A lookup reaches into a table, finds a row by its key and brings back the column you asked for, so a page can read a dataset it could never hold. Every model a buyer sends you is built on them, and every one has a way to fail.' },
  // Chapter 4 · Data and Lookups (script-ch4.md story cards)
  'lists-and-tables': { eyebrow: 'Module 4.2 · lists and tables', title: 'Ninety rows, sorted, filtered, deduplicated.',
    body: 'Sponsor B wants the export by site and then by day, the Saturdays only, and a clean list of sites with no repeats. They also want the inputs on the case sheet limited to choices from a list, so nobody types "Mangement". Sort, filter, Remove Duplicates and Data Validation are the list tools, and they change the data or what you see of it, so the rule is: on a copy, and with a total that knows what’s filtered.' },
  'summaries-from-raw-rows': { eyebrow: 'Module 4.3 · summaries from raw rows', title: 'The KPI page.',
    body: 'Every buyer wants the same page: washes and revenue by site and by week, utilization, member share, and a way to ask any question of the export without touching it. The page is a set of SUMIFS reading the export by keys, laid out as a cube, with a KPI block on top and a checks block underneath, and it answers the log’s questions one after another.' },
  'pivot-tables': { eyebrow: 'Module 4.4 · pivot tables', title: 'The fast cut, and where it stops.',
    body: 'Sponsor B’s analyst wants three cuts of the export by tomorrow, and a PivotTable gives each in a minute: a field down, a field across, a field into values. It’s the fastest way to see a dataset and the wrong thing to build a model on, because it holds a copy of the data and doesn’t refresh on its own. Use it for the cut, and GETPIVOTDATA to read it when a page must.' },
  'scenarios-and-sensitivity': { eyebrow: 'Module 4.5 · scenarios and sensitivity', title: 'What if the ticket falls?',
    body: 'The management case is the company’s own forecast; a buyer builds a base case from what they think will happen and a downside they can live with, and they want all three in one model with a switch, never three files. Then the questions: what if the blended ticket drops a dollar, what if member share slips, how many washes break even. A case toggle and a data table answer them on one sheet.' },
  // Chapter 4 · Data and Lookups (script-ch4.md story cards)
  'names-and-structure': { eyebrow: 'Module 4.6 · names and structure', title: 'Name the switch, not everything.',
    body: 'The pack is thirteen sheets now, and the case switch is read from all over it. A name turns Scenarios!$C$11 into Case, so a formula reads like English and a reviewer finds the switch by name. But a model with a hundred names is worse than one with none. Name the toggles and the key inputs, manage them, and let the picker read its list by name.' },
  'ch4-project-and-assessment': { eyebrow: 'Module 4.7 · project and assessment', title: 'The diligence pack.',
    body: 'A fresh export, a question log with eight questions open, a case sheet with three columns and no switch wired. Answer the log, build the KPI page, wire the case and name what deserves it. Build it, then build it again on another cluster’s export against the clock. The assessment is the test-out.' },
  // Chapter 5 · Finance and Accounting (script-ch5.md story cards)
  'the-three-statements': { eyebrow: 'Module 5.1 · the three statements', title: 'What the sites did, in three statements.',
    body: 'Before the model, the accounting. Every wash, chemical, paycheck, loan payment and tunnel bought shows up in one of three statements, and a buyer reads all three because each one hides what the others show. This module builds them for one site and one month by hand, so that when the model links them at forty sites and five years, you know what every line means.' },
  'model-setup': { eyebrow: 'Module 5.2 · model setup', title: 'Set the model up before you build it.',
    body: 'Forty sites, eight years, six schedules and three statements is too much to hold in your head, so the model holds it for you, if it’s laid out in the order it calculates: inputs feed schedules, schedules feed statements, statements feed the DCF, left to right across the tabs. Set the sheets, the timeline and the checks up empty first, and every formula after has a place to go.' },
  'schedules': { eyebrow: 'Module 5.3 · schedules', title: 'The schedules behind the statements.',
    body: 'A statement line like revenue or interest is the last row of a schedule that builds it: sites times washes times ticket; a debt balance that rolls forward and charges interest on its average. Six schedules (revenue, costs, working capital, PP&E, debt, tax), and every one rolls a balance from one year to the next. Build them on Schedules, and the statements in module 5.4 read their last lines.' },
  'linking-the-statements': { eyebrow: 'Module 5.4 · linking the statements', title: 'Link it.',
    body: 'The schedules are built; the statements read their last lines. Income statement first, from revenue to net income. Cash flow from net income and the schedules’ changes. Balance sheet last, with cash from the cash flow, and if it doesn’t balance, there’s an order to look, and you’ll learn it by breaking it.' },
  // Chapter 5 · Finance and accounting (script-ch5.md story cards)
  'auditing-a-model': { eyebrow: 'Module 5.5 · auditing a model', title: 'Audit it before they do.',
    body: 'Three buyers’ analysts are about to open this model looking for the mistake that lets them pay less, so find it first. A model gets audited the way a databook does, and then for the things only a model can get wrong: a row that doesn’t cross-foot, a formula that breaks pattern halfway across, an input that survives a stress test by luck.' },
  dcf: { eyebrow: 'Module 5.6 · DCF', title: 'What the cash flows are worth.',
    body: 'The model says what the business will earn; the DCF says what that’s worth today. Take the cash the business throws off after tax, capex and working capital, before anyone is paid interest, discount it at the return its investors require, add what it’s worth beyond the forecast, and you have an enterprise value. Take off the debt and what’s left is what the owners are selling.' },
  'model-speed': { eyebrow: 'Module 5.7 · model speed', title: 'Now do it fast.',
    body: 'Everything in this chapter you can now do; the question a desk asks is how fast. Three benchmarks, each a piece of the model against the clock: the revenue build in three minutes, a block filled and formatted in one pass, the cash flow statement linked without touching the mouse. They live in Practice as this chapter’s benchmarks, and here you run each once with the keys shown.' },
  'ch5-project-and-assessment': { eyebrow: 'Module 5.8 · project and assessment', title: 'The operating model, end to end.',
    body: 'An empty shell with the inputs and the history in it. Build the schedules, link the statements, get the flag to OK and value the business. Build it, then build one schedule and its links again on the clock. The assessment is the test-out.' },
  // Chapter 6 · Valuation (script-ch6.md story cards)
  'trading-comps': { eyebrow: 'Module 6.1 · trading comps', title: 'What the market pays for a car wash.',
    body: 'Six listed operators do what Clearcoat does, and the market prices each of them every day. Turn those prices into multiples (what a dollar of car-wash EBITDA is worth), measure every company to the same date, take the middle of the set, and apply it to Clearcoat. That’s the first range on the board’s page, and the one the buyers will quote back.' },
  'project-and-assessment': { eyebrow: 'Module 1.8 · project, assessment, test-out', title: 'Management’s next feed is in.',
    body: 'A fresh week, a blank Report, and everything the chapter taught. Build the page start to finish, then prove it against the clock on Monday morning; or test out of the chapter in five minutes.' },
};

/** modules.csv story_beat ("Title || body") overrides a module's built-in beat; a row with only a body keeps the built-in title. */
export const MODULE_BEATS = Object.fromEntries(Object.entries(BEATS_DEFAULT).map(([id, b]) => {
  const row = moduleCopy(id); const paras = row ? splitParas(row.story_beat) : [];
  if (!paras.length) return [id, b];
  return [id, { eyebrow: b.eyebrow, title: paras.length > 1 ? paras[0] : b.title, body: paras.length > 1 ? paras.slice(1).join(' ') : paras[0] }];
}));

/** The beat for a lesson, when it opens a module the learner has not seen the beat for. Pure over `seen`. */
export function beatFor(lesson, at, seen = []) {
  if (!lesson || !at || at.n !== 1 || lesson.kind === 'challenge') return null;
  const id = lesson.module;
  if (id === 'welcome') return null;   // retired (B2): the Welcome's moves open 1.1.1
  if (!id || seen.includes(id)) return null;
  const b = MODULE_BEATS[id];
  if (b) return { id, ...b };
  const planned = PLANNED_MODULES.find(p => p.title === at.module.title);
  return { id, eyebrow: `Module ${(planned && planned.n) || '1.' + at.k} · ${at.module.title.toLowerCase()}`, title: at.module.title + '.', body: (planned && planned.objective) || '' };
}

/** The chapter-end line when a module's challenge passes: what page went into the pack. */
export function pageDelivered(at) {
  if (!at) return '';
  const planned = PLANNED_MODULES.find(p => p.title === at.module.title);
  const row = moduleCopy(at.module.id);
  const page = (row && row.page_name && row.page_name.trim()) || at.module.title;
  return siteCopy('page_delivered', PAGE_DELIVERED).replace(/\{n\}/g, (planned && planned.n) || '1.' + at.k).replace(/\{module\}/g, at.module.title).replace(/\{page\}/g, page);
}
