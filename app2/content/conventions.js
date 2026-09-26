// app2/content/conventions.js — the banker-conventions canon as data (C2): every id from
// docs/proposals/BANKER_CONVENTIONS.proposed.md with its name and the short line the goal chip
// shows. Lessons carry `conventions: ['B1', …]`; graders and chips read this table. The full
// sources, recurrence counts and taught/enforced mapping live in the canon document.

export const CONVENTIONS = {
  // A. Set-up and workspace
  A1: { name: 'Set Excel up before you model', short: 'Set up once: calc mode, iteration, defaults' },
  A2: { name: 'The QAT holds your formatting commands', short: 'Alt+number beats a long Alt chord' },
  A3: { name: 'Gridlines off on a page someone reads', short: 'Borders carry structure, not gridlines' },
  A4: { name: 'Descriptive tab names, logical order', short: 'Name the tabs; outputs left, data right' },
  A5: { name: 'Keyboard first', short: 'The mouse is for reviewing, not building' },
  A6: { name: 'Save versions as you go', short: 'Never overwrite the only copy' },
  // B. Colour and cell roles
  B1: { name: 'Blue inputs, black formulas', short: 'Inputs blue, formulas black' },
  B2: { name: 'Green links to other sheets', short: 'Links green; external links avoided' },
  B3: { name: 'Inputs may carry a light fill', short: 'A tint marks the input block' },
  B4: { name: 'No hardcodes inside formulas', short: 'One input, one cell; formulas reference it' },
  B5: { name: 'Actuals and estimates look different', short: 'Mark the A/E divider' },
  B6: { name: 'Document every hardcode', short: 'Label the source ("per utility contract")' },
  // C. Layout and flow
  C1: { name: 'Inputs → calculations → outputs', short: 'Inputs, calcs, outputs — in that order' },
  C2: { name: 'One timeline row, equal period columns', short: 'Timeline on top, equal widths' },
  C3: { name: 'One formula per row, filled right', short: 'Write once, fill right' },
  C4: { name: 'One sign convention, stated', short: 'Income positive, costs negative' },
  C5: { name: 'Units stated once', short: 'A units line: "USD unless stated"' },
  C6: { name: 'Long sheets over many tabs', short: 'Schedules feed statements, never back' },
  C7: { name: 'Group, don’t hide', short: 'Hidden columns get forgotten' },
  C8: { name: 'Freeze panes on long sheets', short: 'Keep the timeline and labels in view' },
  C9: { name: 'Named ranges, sparingly', short: 'Name toggles and key inputs only' },
  // D. Number and text formatting
  D1: { name: 'Negatives in parentheses', short: 'Parentheses, never a leading minus' },
  D2: { name: 'Consistent decimals down a line', short: 'One decimals setting per line' },
  D3: { name: 'Zero shown as a dash', short: 'A dash, not 0.0' },
  D4: { name: 'Currency symbol first and total rows only', short: '$ on the first and total rows' },
  D5: { name: 'Totals bold with a top border', short: 'A top border, never an all-borders grid' },
  D6: { name: 'Indent hierarchy, right-aligned headers', short: 'Indent sub-items; headers over numbers' },
  D7: { name: 'Center Across Selection, never merge', short: 'Merged cells break everything' },
  D8: { name: 'One font, one size', short: 'No color for decoration' },
  D9: { name: 'Custom formats do the labelling', short: 'Units live in the format, not typed text' },
  // E. Formulas and keystrokes
  E1: { name: 'Point, don’t type', short: 'Build references by pointing; F2 to read back' },
  E2: { name: 'F4 anchors while typing', short: 'Know the four anchor states' },
  E3: { name: 'Fill, don’t retype', short: 'Ctrl+D down, Ctrl+R across' },
  E4: { name: 'Paste Special on purpose', short: 'Values to snapshot, never over live formulas' },
  E5: { name: 'AutoSum the block plus its edge', short: 'Alt+= once, across the block' },
  E6: { name: 'No nested-IF towers, no volatile functions', short: 'MIN/MAX or a lookup instead' },
  E7: { name: 'Avoid external workbook links', short: 'Check for stray links before sending' },
  E8: { name: 'Circularity only on purpose', short: 'Iterative calc + a circuit breaker' },
  E9: { name: 'Scenarios in one model', short: 'A case toggle, never copies of the file' },
  // F. Checks and auditing
  F1: { name: 'A checks row wherever two things must agree', short: 'The check is a live difference → 0' },
  F2: { name: 'Never plug', short: 'Cash balances the sheet; nothing is forced' },
  F3: { name: 'Hardcode hunt before you send', short: 'Go To Special, show formulas, trace' },
  F4: { name: 'Sense-check magnitudes', short: 'Read the page before anyone else does' },
  F5: { name: 'Read what Excel tells you', short: 'The count, the proposal, the error code' },
  // G. Presentation and delivery
  G1: { name: 'Print set-up is part of the model', short: 'Fit to page, titles, footer' },
  G2: { name: 'A page reads like an MD reads', short: 'Title, units, timeline, then the answer' },
  G3: { name: 'Consistent labels and footnotes', short: 'Attention to detail is judged first' },
};

export const CONVENTION_IDS = Object.keys(CONVENTIONS);
