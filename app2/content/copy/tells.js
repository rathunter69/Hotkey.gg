// app2/content/copy/tells.js — the tells that make copy read as machine-written (screenplay 3.0,
// "What the copy and the screen never do"; M94). Pure functions over one displayed string, used by
// tests/copy-check.js on every copy sheet and by any screen test that wants to hold a hardcoded line
// to the same rules. Each returns null when the string is clean, or a short reason.
//
//   dashTell(s)       a dash used as punctuation: an em dash anywhere, an en dash or a hyphen with a
//                     space on either side. A hyphen inside a word (well-formatted), a range of numbers
//                     (1–3, 60-180) and a minus in front of a figure (−$200k) are fine.
//   emojiTell(s)      an emoji, or a symbol standing in for an icon or a bullet (✓ ★ • ● ▶ ✔ ✗ ⚡ …).
//                     The arrows ↑ ↓ ← → and ↵ are key names and stay.
//   joinedTell(s)     facts strung together with middle dots or pipes ("Free · No account · 10 min").
//                     The " || " paragraph break of the sheets and the stuck cue's one separator are
//                     handled by the caller.
//   capsTell(s)       a word of four letters or more in capitals that isn't a key, an Excel function
//                     or an acronym on the whitelist.
//   arrowLabelTell(s) an arrow or a symbol at the end of a button's label ("Start learning →").
//
// What is typed into a cell is exempt from all of these: the caller strips quoted cell text first
// with stripCellText().

const EM = /—/;
// a spaced dash: " - ", " – ", or a dash hugging one side with a space on the other ("week -", "- week")
const SPACED = /(?:^|\s)[–-](?=\s|$)|\s[–](?=\S)|(?<=\S)[–]\s/;

export function dashTell(s) {
  const t = String(s || '');
  if (EM.test(t)) return 'an em dash used as punctuation';
  if (SPACED.test(t)) return 'a dash used as punctuation';
  // an en dash between two words (not two figures) is punctuation too: "wash–cost", "Mon–Sat" is a range and stays
  const m = t.match(/([A-Za-z]{3,})–([A-Za-z]{3,})/);
  if (m && !DAY_OR_MONTH.test(m[1]) && !DAY_OR_MONTH.test(m[2])) return 'an en dash joining two words';
  return null;
}
const DAY_OR_MONTH = /^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|June|July|August|September|October|November|December|Fort|Dallas)$/;

// Extended_Pictographic catches emoji; the explicit set catches the symbols that stand in for icons.
const PICTO = /\p{Extended_Pictographic}/u;
const ICON_SYMBOLS = /[✓✔✕✖✗✘★☆•●○■□▶▸►◀⇒➔➜➡❖✦✧✨⚡⭐❤]/;
// the key arrows and the Enter glyph are key names, not icons
const KEY_GLYPHS = /[↑↓←→↵⌘⌥⇧]/g;

export function emojiTell(s) {
  // © ® ™ are text, not pictures, even though some fonts draw them as emoji; key glyphs are key names
  const u = String(s || '').replace(/[\u00A9\u00AE\u2122]/g, '').replace(KEY_GLYPHS, '');
  if (PICTO.test(u)) return 'an emoji';
  if (ICON_SYMBOLS.test(u)) return 'a symbol standing in for an icon or a bullet';
  return null;
}

export function joinedTell(s) {
  const t = String(s || '');
  if (/\s·\s/.test(t)) return 'facts joined by a middle dot';
  if (/(?<!\|)\s\|\s(?!\|)/.test(t)) return 'facts joined by a pipe';
  return null;
}

// Words in capitals that are allowed: key names, Excel's own function names, and the acronyms the
// course uses. Anything else in capitals is shouting.
export const CAPS_OK = new Set([
  // keys and key-ish names
  'CTRL', 'SHIFT', 'ENTER', 'HOME', 'PGUP', 'PGDN', 'BACKSPACE', 'DELETE', 'CAPS', 'LOCK', 'TAB', 'ESC',
  // acronyms of the course and the site
  'EBITDA', 'EBIT', 'DCF', 'LBO', 'IRR', 'XIRR', 'MOIC', 'WACC', 'CAGR', 'LTM', 'NTM', 'P&L', 'CFO', 'COGS', 'SG&A', 'PP&E',
  'CAPEX', 'UFCF', 'FCF', 'USD', 'NYSE', 'NASDAQ', 'IPO', 'IOI', 'LOI', 'SPA', 'CIM', 'VDR', 'GAAP', 'IFRS', 'KPI', 'KPIS', 'POS', 'QAT',
  'HTML', 'JSON', 'UTC', 'URL', 'FAQ', 'EULA', 'PDF', 'XLSX', 'CSV', 'ASAP', 'NULL', 'TRUE', 'FALSE', 'MMMM', 'YYYY', 'DDDD',
  'AUS', 'SATX', 'DFW', 'HOU', 'TBD', 'TBC', 'LLC', 'TEXAS', 'MACABACUS', 'EXCEL',
]);
// Excel's function names (and the error codes) are exempt wholesale.
const FUNCTION_NAMES = /^(?:SUM|SUMIF|SUMIFS|SUMPRODUCT|AVERAGE|AVERAGEIF|AVERAGEIFS|COUNT|COUNTA|COUNTIF|COUNTIFS|COUNTBLANK|MIN|MAX|MINIFS|MAXIFS|MEDIAN|LARGE|SMALL|RANK|ROUND|ROUNDUP|ROUNDDOWN|MROUND|CEILING|FLOOR|ABS|MOD|INT|TRUNC|SIGN|SQRT|POWER|PRODUCT|IF|IFS|IFERROR|IFNA|AND|OR|NOT|XOR|SWITCH|CHOOSE|INDEX|MATCH|XMATCH|VLOOKUP|HLOOKUP|XLOOKUP|LOOKUP|OFFSET|INDIRECT|ADDRESS|ROW|ROWS|COLUMN|COLUMNS|TEXT|VALUE|DATEVALUE|TRIM|CLEAN|PROPER|UPPER|LOWER|LEFT|RIGHT|MID|LEN|FIND|SEARCH|SUBSTITUTE|REPLACE|CONCAT|CONCATENATE|TEXTJOIN|DATE|YEAR|MONTH|DAY|TODAY|NOW|EOMONTH|EDATE|YEARFRAC|NETWORKDAYS|WORKDAY|WEEKDAY|WEEKNUM|DAYS|DATEDIF|PMT|PPMT|IPMT|PV|FV|NPV|XNPV|NPER|RATE|RRI|ISNUMBER|ISTEXT|ISBLANK|ISERROR|ISERR|ISNA|ISFORMULA|SUBTOTAL|AGGREGATE|UNIQUE|FILTER|SORT|SORTBY|SEQUENCE|GETPIVOTDATA|QUARTILE|PERCENTILE|STDEV|TRANSPOSE|HYPERLINK|N\/A|DIV\/0|REF|NAME|NUM|NULL|VALUE)$/;

export function capsTell(s) {
  const t = String(s || '').replace(/`[^`]*`/g, ' ').replace(/#(?:NULL!|DIV\/0!|VALUE!|REF!|NAME\?|NUM!|N\/A)/g, ' ');
  const words = t.match(/[A-Za-z&]+(?:\.[A-Z]+)?/g) || [];
  for (const w of words) {
    const letters = w.replace(/[^A-Za-z]/g, '');
    if (letters.length < 4 || letters !== letters.toUpperCase()) continue;
    const base = w.replace(/\.[A-Z]+$/, '').replace(/^&+|&+$/g, '');   // QUARTILE.INC → QUARTILE; &YEAR in a joined formula → YEAR
    if (CAPS_OK.has(w) || CAPS_OK.has(base) || FUNCTION_NAMES.test(base)) continue;
    return `"${w}" in capitals`;
  }
  return null;
}

export function arrowLabelTell(s) {
  const t = String(s || '').trim();
  // a key chord that ends in an arrow (Ctrl+Shift+→) is a key, not a decoration
  if (/(?:^|\s)[→⇒➔➜➡›»>]\s*$/.test(t)) return 'an arrow or symbol at the end of a label';
  return null;
}

/** Text typed into a cell is exempt: strip quoted cell contents ("…" right after a cell ref or "type"). */
export function stripCellText(s) {
  return String(s || '').replace(/(?:type|types|typed|reads|read|enter|entered)\s+[“"][^”"]*[”"]/gi, ' ').replace(/=(?:[^\s,.;]|\.(?=[A-Za-z]))+/g, ' ');   // a dot inside a name (NETWORKDAYS.INTL) stays in the formula
}

/** Every tell in one displayed string, as a list of reasons (empty when clean). */
export function tells(s, { label = false } = {}) {
  const t = stripCellText(s);
  const out = [];
  for (const f of [dashTell, emojiTell, joinedTell, capsTell]) { const r = f(t); if (r) out.push(r); }
  if (label) { const r = arrowLabelTell(s); if (r) out.push(r); }
  return out;
}
