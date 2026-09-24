// app2/content/copy/rules.js — the vocabulary the copy checks and the screens agree on.
// RIBBON_WORDS: a goal that names one of these names something visible (R4). SITE_KEYS: the
// site.csv keys the screens read (R11 warns when one is missing; the screen keeps its built-in line).

export const RIBBON_WORDS = [
  'Ribbon', 'KeyTips?', 'Home tab', 'View tab', 'File tab', 'Format Cells', 'Rename Sheet', 'Delete Sheet', 'Move or Copy', 'Insert Sheet',
  'Go To Special', 'Go To', 'Find', 'Replace', 'Paste Special', 'Fill Series', 'AutoSum', 'AutoFit', 'Freeze Panes', 'Page Setup', 'Excel Options',
  'Quick Access Toolbar', 'QAT', 'Name Box', 'formula bar', 'Font Color', 'Gridlines', 'Bold', 'Italic', 'Underline', 'Borders?', 'Fill', 'Wrap',
  'Center Across Selection', 'Number tab', 'Increase Decimal', 'Decrease Decimal', 'Fill Color', 'Constants', 'Formulas', 'Blanks', 'Calculation', 'Automatic', 'Manual', 'Iterative', 'Alignment', 'Group', 'Ungroup', 'Hide', 'Unhide', 'Undo', 'Redo', 'Options', 'tab', 'sheet', 'row', 'column', 'header', 'title', 'total',
];

export const SITE_KEYS = [
  'briefing_1_eyebrow', 'briefing_1_title', 'briefing_1_body',
  'briefing_2_eyebrow', 'briefing_2_title', 'briefing_2_body',
  'briefing_3_eyebrow', 'briefing_3_title', 'briefing_3_body',
  'orientation_eyebrow', 'orientation_title', 'orientation_learn', 'orientation_practice', 'orientation_leaderboard', 'orientation_level', 'orientation_fine',
  'landing_headline_a', 'landing_headline_b', 'landing_subhead',
  'mode_lesson', 'mode_challenge', 'mode_drill', 'mode_daily', 'mode_rapid', 'mode_boards',
  'dash_learn', 'dash_practice',
  'deal_strip_stage_1', 'deal_strip_deliverable_1',
  'page_delivered', 'save_nudge', 'install_prompt', 'due_empty', 'due_foot',
];
