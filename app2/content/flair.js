// app2/content/flair.js — the flair catalog (screenplay 6.10; M60): thirty items, one per level, so
// every level pays something and nothing repeats. Built from what the product already has: the
// themes (pruned to seven, Wolf 2026-10-02, so two are level rewards and Amber is Chapter 1's),
// keycap skins for the task card's keys, ghost-cursor colors and the ghost trail, result-panel
// header styles, board flair beside the handle (a pixel sprite from ui/sprites.js) and the profile
// frame. Sound sets are left out: the product has one set of sounds. Nothing here is ever sold.
//
//   { id, level, kind, slot, value, fallback }
//     kind  the reward kind levels.js names (themes_start, theme, keycap_skin, cursor_color,
//           panel_style, board_flair, profile_frame, ghost_trail, crimson)
//     slot  where it is equipped: theme | keycap | cursor | panel | board | frame | trail
//     value what the slot is set to: a theme key, a data attribute's value or a sprite key
// The names are site.csv rows (flair_<id>); `fallback` is used only when the sheet has no row.
// The colors a skin or a cursor uses are tokens in ui/tokens.css (html[data-keycap], [data-cursor]).

export const FLAIR = [
  { id: 'themes-start', level: 1, kind: 'themes_start', slot: 'theme', value: null, fallback: 'Workbook, High Contrast and Graphite' },
  { id: 'kc-slate', level: 2, kind: 'keycap_skin', slot: 'keycap', value: 'slate', fallback: 'The slate keycaps' },
  { id: 'theme-newsprint', level: 3, kind: 'theme', slot: 'theme', value: 'newsprint', fallback: 'The Newsprint theme' },
  { id: 'cur-blue', level: 4, kind: 'cursor_color', slot: 'cursor', value: 'blue', fallback: 'The blue ghost' },
  { id: 'panel-ruled', level: 5, kind: 'panel_style', slot: 'panel', value: 'ruled', fallback: 'The ruled panel header' },
  { id: 'theme-terminal', level: 6, kind: 'theme', slot: 'theme', value: 'terminal', fallback: 'The Terminal theme' },
  { id: 'board-key', level: 7, kind: 'board_flair', slot: 'board', value: 'keycap', fallback: 'The keycap board mark' },
  { id: 'kc-amber', level: 8, kind: 'keycap_skin', slot: 'keycap', value: 'amber', fallback: 'The amber keycaps' },
  { id: 'kc-ink', level: 9, kind: 'keycap_skin', slot: 'keycap', value: 'ink', fallback: 'The ink keycaps' },
  { id: 'frame-ledger', level: 10, kind: 'profile_frame', slot: 'frame', value: 'ledger', fallback: 'The ledger profile frame' },
  { id: 'cur-violet', level: 11, kind: 'cursor_color', slot: 'cursor', value: 'violet', fallback: 'The violet ghost' },
  { id: 'panel-tape', level: 12, kind: 'panel_style', slot: 'panel', value: 'tape', fallback: 'The adding machine header' },
  { id: 'board-bolt', level: 13, kind: 'board_flair', slot: 'board', value: 'bolt', fallback: 'The bolt board mark' },
  { id: 'kc-mint', level: 14, kind: 'keycap_skin', slot: 'keycap', value: 'mint', fallback: 'The mint keycaps' },
  { id: 'board-flame', level: 15, kind: 'board_flair', slot: 'board', value: 'flame', fallback: 'The flame board mark' },
  { id: 'cur-amber', level: 16, kind: 'cursor_color', slot: 'cursor', value: 'amber', fallback: 'The amber ghost' },
  { id: 'panel-stamp', level: 17, kind: 'panel_style', slot: 'panel', value: 'stamp', fallback: 'The stamped panel header' },
  { id: 'cur-red', level: 18, kind: 'cursor_color', slot: 'cursor', value: 'red', fallback: 'The red pen ghost' },
  { id: 'kc-paper', level: 19, kind: 'keycap_skin', slot: 'keycap', value: 'paper', fallback: 'The paper keycaps' },
  { id: 'trail', level: 20, kind: 'ghost_trail', slot: 'trail', value: 'on', fallback: 'The ghost trail' },
  { id: 'panel-double', level: 21, kind: 'panel_style', slot: 'panel', value: 'double', fallback: 'The double rule header' },
  { id: 'board-gem', level: 22, kind: 'board_flair', slot: 'board', value: 'gem-blue', fallback: 'The gem board mark' },
  { id: 'cur-green', level: 23, kind: 'cursor_color', slot: 'cursor', value: 'green', fallback: 'The green ghost' },
  { id: 'kc-gold', level: 24, kind: 'keycap_skin', slot: 'keycap', value: 'gold', fallback: 'The gold keycaps' },
  { id: 'panel-ticker', level: 25, kind: 'panel_style', slot: 'panel', value: 'ticker', fallback: 'The ticker panel header' },
  { id: 'board-crown', level: 26, kind: 'board_flair', slot: 'board', value: 'crown', fallback: 'The crown board mark' },
  { id: 'board-clock', level: 27, kind: 'board_flair', slot: 'board', value: 'stopwatch', fallback: 'The stopwatch board mark' },
  { id: 'kc-crimson', level: 28, kind: 'keycap_skin', slot: 'keycap', value: 'crimson', fallback: 'The crimson keycaps' },
  { id: 'cur-ink', level: 29, kind: 'cursor_color', slot: 'cursor', value: 'ink', fallback: 'The ink ghost' },
  { id: 'top-bucket', level: 30, kind: 'crimson', slot: 'theme', value: 'crimson', fallback: 'Crimson, with the Top Bucket frame' },
];

export const FLAIR_BY_ID = Object.fromEntries(FLAIR.map(f => [f.id, f]));
export const FLAIR_AT = Object.fromEntries(FLAIR.map(f => [f.level, f]));
/** The slots a learner equips, in the order the profile lists them. Themes equip in the theme picker. */
export const SLOTS = ['keycap', 'cursor', 'trail', 'panel', 'board', 'frame'];
/** The kinds the weekly clear may roll (6.10: a theme, a keycap skin, a board flair). */
export const ROLLABLE = ['theme', 'keycap_skin', 'board_flair'];
