// app2/ui/pixel.js — 16×16 pixel glyphs rendered to crisp SVG rects: the badge wall and the
// rank emblems (SITE_SPEC §9). A glyph is 16 rows of 16 characters: '.' transparent, letters
// palette slots — 'a' outline, 'b' body (takes the rarity or tier colour), 'c' accent,
// 'd' light. At most 6 colours per glyph; the palette maps slots to CSS colours at render.

const R = (...rows) => rows.join('\n');

export const GLYPHS = {
  seed: R('................', '................', '......aaa.......', '.....abbba......', '....abbba.......', '.....aaa........', '.......a........', '.......a........', '......aca.......', '.....ac.ca......', '....ac...ca.....', '...ab.....ba....', '...abbbbbbba....', '....aaaaaaa.....', '................', '................'),
  flag: R('................', '....a...........', '....aaaaaaaa....', '....abbbbbba....', '....abbcbbba....', '....abbbbbba....', '....aaaaaaaa....', '....a...........', '....a...........', '....a...........', '....a...........', '....a...........', '....a...........', '...aaa..........', '................', '................'),
  book: R('................', '................', '...aaaaaaaaaa...', '...abbbabbbba...', '...abbbabbbba...', '...abcbabbcba...', '...abbbabbbba...', '...abbbabbbba...', '...abbbabbbba...', '...abcbabbbba...', '...abbbabbcba...', '...abbbabbbba...', '...aaaaaaaaaa...', '................', '................', '................'),
  arrows: R('................', '.......aa.......', '......abba......', '.....abbbba.....', '.......aa.......', '...a...aa...a...', '..ab...aa...ba..', '.abbaaaaaaaabba.', '.abbaaaaaaaabba.', '..ab...aa...ba..', '...a...aa...a...', '.......aa.......', '.....abbbba.....', '......abba......', '.......aa.......', '................'),
  select: R('................', '..aa..aa..aa....', '..a........a....', '................', '..a..bbbb..a....', '.....bbbb.......', '..a..bbcb..a....', '.....bbbb.......', '..a........a....', '..aa..aa..aa....', '................', '..........cc....', '...........cc...', '............c...', '................', '................'),
  pencil: R('................', '...........aa...', '..........abba..', '.........abcba..', '........abbba...', '.......abbba....', '......abbba.....', '.....abbba......', '....abbba.......', '...abbba........', '...abba.........', '...aba..........', '...aa...........', '...a............', '................', '................'),
  rows: R('................', '................', '..aaaaaaaaaaaa..', '..abbbbbbbbbba..', '..aaaaaaaaaaaa..', '..abbbbbbbbbba..', '..aaaaaaaaaaaa..', '..abcbcbcbcbca..', '..aaaaaaaaaaaa..', '..abbbbbbbbbba..', '..aaaaaaaaaaaa..', '..abbbbbbbbbba..', '..aaaaaaaaaaaa..', '................', '................', '................'),
  ribbon: R('................', '................', '..aaaaaaaaaaaa..', '..abbcbbcbbcba..', '..abbbbbbbbbba..', '..aaaaaaaaaaaa..', '.....a....a.....', '.....a....a.....', '....a......a....', '....a......a....', '...a........a...', '...a........a...', '..aa........aa..', '................', '................', '................'),
  sigma: R('................', '................', '...aaaaaaaaaa...', '...abbbbbbbba...', '...aaaabbbbba...', '......abbba.....', '.....abbba......', '....abbba.......', '....abbba.......', '.....abbba......', '......abbba.....', '...aaaabbbbba...', '...abbbbbbbba...', '...aaaaaaaaaa...', '................', '................'),
  clipboard: R('................', '......aaaa......', '...aaabccbaaa...', '...abbaaaabba...', '...abbbbbbbba...', '...abbbbbbbba...', '...abcbcbbbba...', '...abbbbbbbba...', '...abcbcbcbba...', '...abbbbbbbba...', '...abcbbbbbba...', '...abbbbbbbba...', '...aaaaaaaaaa...', '................', '................', '................'),
  grid: R('................', '................', '..aaaaaaaaaaaa..', '..acccabbbabba..', '..aaaaaaaaaaaa..', '..abbbabbbabba..', '..aaaaaaaaaaaa..', '..abbbabcbabba..', '..aaaaaaaaaaaa..', '..abbbabbbabba..', '..aaaaaaaaaaaa..', '................', '................', '................', '................', '................'),
  clock: R('................', '.....aaaaaa.....', '....abbbbbba....', '...abbbcbbbba...', '..abbbbcbbbbba..', '..abbbbcbbbbba..', '..abbbbcbbbbba..', '..abbbbcccbbba..', '..abbbbbbbbbba..', '..abbbbbbbbbba..', '...abbbbbbbba...', '....abbbbbba....', '.....aaaaaa.....', '................', '................', '................'),
  bolt: R('................', '........aa......', '.......abba.....', '......abba......', '.....abba.......', '....abbaaaa.....', '...abbbbbba.....', '....aaaabba.....', '.......abba.....', '......abba......', '.....abba.......', '....abba........', '....aba.........', '....aa..........', '................', '................'),
  trophy: R('................', '..aaaaaaaaaaaa..', '..abbbbbbbbbba..', '.aabbbbbbbbbbaa.', '.ababbbcbbbbaba.', '.ababbbbbbbbaba.', '..aabbbbbbbbaa..', '...abbbbbbbba...', '....abbbbbba....', '.....abbbba.....', '......abba......', '......abba......', '.....abbbba.....', '....aabbbbaa....', '...aaaaaaaaaa...', '................'),
  star: R('................', '.......aa.......', '.......aa.......', '......abba......', '......abba......', '..aaaabbbbaaaa..', '..abbbbbbbbbba..', '...abbbbbbbba...', '....abbbbbba....', '.....abbbba.....', '.....abbbba.....', '....abbaabba....', '....aba..aba....', '....aa....aa....', '................', '................'),
  target: R('................', '.....aaaaaa.....', '....abbbbbba....', '...abbaaaabba...', '..abba....abba..', '..aba..aa..aba..', '..aba.acca.aba..', '..aba.acca.aba..', '..aba..aa..aba..', '..abba....abba..', '...abbaaaabba...', '....abbbbbba....', '.....aaaaaa.....', '................', '................', '................'),
  medal: R('................', '...aaa....aaa...', '...acca..acca...', '....acca.acca...', '....accaacca....', '.....accacca....', '.....aaaaaa.....', '....abbbbbba....', '...abbbbbbbba...', '...abbbcbbbba...', '...abbcbcbbba...', '...abbbcbbbba...', '...abbbbbbbba...', '....abbbbbba....', '.....aaaaaa.....', '................'),
  flame: R('................', '.......aa.......', '......abba......', '......abba......', '.....abbbba.....', '.....abbbba.....', '....abbbbbba....', '....abbcbbba....', '...abbccccbba...', '...abbcddcbba...', '...abcddddcba...', '...abcddddcba...', '....abcddcba....', '.....abccba.....', '......aaaa......', '................'),
  crown: R('................', '................', '...aa...aa...aa.', '...aba..aba..ab.', '...abba.abba.ab.', '...abbbaabbbaab.', '...abbbbbbbbbbb.', '...abbbbbbbbbba.', '...abbcbbbbcbba.', '...abbbbbbbbbba.', '...aaaaaaaaaaaa.', '...abbbbbbbbbba.', '...aaaaaaaaaaaa.', '................', '................', '................'),
  calendar: R('................', '.....a....a.....', '..aaaaaaaaaaaa..', '..abbbbbbbbbba..', '..aaaaaaaaaaaa..', '..abbcbbbcbbba..', '..abbbbbbbbbba..', '..abcbbbcbbcba..', '..abbbbbbbbbba..', '..abbcbbbbbbba..', '..abbbbbbbcbba..', '..aaaaaaaaaaaa..', '................', '................', '................', '................'),
  gem: R('................', '................', '....aaaaaaaa....', '...abbcbbcbba...', '..abbbbbbbbbba..', '..abcbbbbbbcba..', '...abbbbbbbba...', '....abbbbbba....', '.....abbbba.....', '......abba......', '.......aa.......', '................', '................', '................', '................', '................'),
  stack: R('................', '................', '....aaaaaaaa....', '...abbbbbbbba...', '..abbbbbbbbbba..', '..aabbbbbbbbaa..', '..abaaaaaaaaba..', '..abbbbbbbbbba..', '..aabbbbbbbbaa..', '..abaaaaaaaaba..', '..abbbbbbbbbba..', '...aabbbbbbaa...', '.....aaaaaa.....', '................', '................', '................'),
  moon: R('................', '......aaaa......', '....aabbbba.....', '...abbbbaaa.....', '..abbbba........', '..abbba.....c...', '.abbbba.........', '.abbbba.........', '.abbbba....c....', '.abbbba.........', '..abbba.........', '..abbbba........', '...abbbbaaa.....', '....aabbbba.....', '......aaaa......', '................'),
  sun: R('................', '.......aa.......', '...a...aa...a...', '....a......a....', '.....aaaaaa.....', '....abbbbbba....', '...abbcbbbbba...', '.aaabbbbbbbbaa..', '.aaabbbbbbbbaa..', '...abbbbbcbba...', '....abbbbbba....', '.....aaaaaa.....', '....a......a....', '...a...aa...a...', '.......aa.......', '................'),
  mouse: R('................', '......aaaa......', '.....abbcba.....', '....abbacbba....', '....abbacbba....', '....abbaabba....', '....abbbbbba....', '....abbbbbba....', '....abbbbbba....', '....abbbbbba....', '.....abbbba.....', '......aaaa......', '................', '................', '................', '................'),
};

/** The eight rank emblems, floor to summit (rank.js TIERS order), same 16×16 mechanism. */
export const RANK_EMBLEMS = {
  'tier-mba': R('................', '................', '...aaaaaaaa.....', '...abbbbbbaaa...', '...abbbbbbabba..', '...abbbbbbabba..', '...abbbbbbaaa...', '...abbbbbba.....', '....abbbba......', '.....aaaa.......', '...aaaaaaaa.....', '...abbbbbba.....', '...aaaaaaaa.....', '................', '................', '................'),
  'tier-bronze': R('................', '.....aaaaaa.....', '....abbbbbba....', '...abbbbbbbba...', '...abbaabbbba...', '...abbbabbbba...', '...abbbabbbba...', '...abbbabbbba...', '...abbaaabbba...', '...abbbbbbbba...', '....abbbbbba....', '.....aaaaaa.....', '................', '................', '................', '................'),
  'tier-silver': R('................', '.....aaaaaa.....', '....abbbbbba....', '...abbaaabbba...', '...abbabbbbba...', '...abbaaabbba...', '...abbbbabbba...', '...abbaaabbba...', '...abbbbbbbba...', '...abbbbbbbba...', '....abbbbbba....', '.....aaaaaa.....', '................', '................', '................', '................'),
  'tier-gold': R('................', '.......aa.......', '.....aabbaa.....', '....abbbbbba....', '...abbcbbcbba...', '...abbbbbbbba...', '..abbcbbbbcbba..', '..abbbbbbbbbba..', '...abbbbbbbba...', '...abbcbbcbba...', '....abbbbbba....', '.....aabbaa.....', '.......aa.......', '................', '................', '................'),
  'tier-amethyst': R('................', '................', '....aaaaaaaa....', '...abbcbbcbba...', '..abbbbbbbbbba..', '..abcbbbbbbcba..', '...abbbbbbbba...', '....abbbbbba....', '.....abbbba.....', '......abba......', '.......aa.......', '................', '................', '................', '................', '................'),
  'tier-platinum': R('................', '.......aa.......', '......abba......', '.....abbbba.....', '....abbcbbba....', '...abbcccbbba...', '..abbcccccbbba..', '..abbbcccbbbba..', '...abbbcbbbba...', '....abbbbbba....', '.....abbbba.....', '......abba......', '.......aa.......', '................', '................', '................'),
  'tier-crimson': R('................', '..aaaaaaaaaaaa..', '..abbbbbbbbbba..', '..abcbcbcbcbba..', '..abbbbbbbbbba..', '..abcbcbcbcbba..', '..abbbbbbbbbba..', '..abcbcbcbcbba..', '..abbbbbbbbbba..', '..abbbbaabbbba..', '..abbbbaabbbba..', '..abbbbaabbbba..', '..aaaaaaaaaaaa..', '................', '................', '................'),
  'tier-diamond': R('................', '.......aa.......', '......abba......', '.....abccba.....', '....abccccba....', '...abccddccba...', '..abccddddccba..', '..abcddddddcba..', '...abcddddcba...', '....abcddcba....', '.....abccba.....', '......abba......', '.......aa.......', '................', '................', '................'),
};

/** Parse a glyph string → 16 rows of 16 chars; throws on a malformed glyph (the tests pin this). */
export function glyphRows(glyph) {
  const rows = String(glyph).split('\n');
  if (rows.length !== 16 || rows.some(r => r.length !== 16)) throw new Error('glyph must be 16 rows × 16 cols');
  return rows;
}

/** The distinct palette letters a glyph uses (transparency aside). */
export function glyphColours(glyph) {
  return [...new Set(String(glyph).replace(/[.\n]/g, ''))];
}

const DEFAULT_PALETTE = { a: 'var(--ink)', b: 'var(--accent)', c: 'var(--bg)', d: 'var(--surface)' };

/**
 * Render a glyph to an SVG string. `palette` maps slot letters to CSS colours;
 * `mono` paints every slot one colour (the locked-badge silhouette).
 */
export function renderPixel(glyph, palette = {}, opts = {}) {
  const rows = glyphRows(glyph);
  const pal = { ...DEFAULT_PALETTE, ...palette };
  const rects = [];
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const ch = rows[y][x];
    if (ch === '.') continue;
    const fill = opts.mono ? opts.mono : (pal[ch] || pal.a);
    rects.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${fill}"/>`);
  }
  const size = opts.size || 32;
  return `<svg class="px ${opts.cls || ''}" width="${size}" height="${size}" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">${rects.join('')}</svg>`;
}

/** Rarity → the badge body colour (slot 'b') and ring class. */
export const RARITY_COLOURS = {
  common: 'var(--accent)',
  rare: '#4a9eda',
  epic: '#a06bd6',
  legendary: '#e0913f',
};
