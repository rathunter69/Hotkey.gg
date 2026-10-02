// app2/ui/themes.js — the hotkey.gg palettes and the theme switch (screenplay 3.0, Color; M87).
// Workbook is the default theme and the one 3.0's table describes; seven more, each clearly its own,
// are themes a learner picks or earns (6.9; pruned from 28, Wolf 2026-10-02). Every theme supplies the same tokens (ui/tokens.css):
// the ground and the ink, the rail's four, the note's two, the red, and the six mode colors with
// their ink and tint. An older palette states its legacy keys (bg, surface, text, accent …) and
// tokensFor() derives the tokens from them, so a theme never reaches into a stylesheet and the
// contrast test (tests/contrast.test.js) holds every theme to the same pairs.
//
// Importing this module applies NOTHING. The page calls loadTheme() as early as it can (an
// inline module in <head>) so the saved palette lands before first paint; applyTheme() writes
// every token as --<name> on <html>, sets html[data-dark] and refreshes every [data-theme-label].
// Persistence is saveTheme() (localStorage 'hk2_theme'), kept apart from applyTheme().

/** The token names every theme supplies (the contrast test checks them all). */
export const TOKEN_NAMES = ['paper', 'sheet', 'chrome', 'line', 'grid', 'edge', 'ink', 'ink-2', 'rail', 'rail-hi', 'rail-text', 'rail-sub', 'note', 'note-ink', 'note-edge', 'red', 'on-fill', 'plate-neutral',
  'learn', 'learn-ink', 'learn-tint', 'drills', 'drills-ink', 'drills-tint', 'daily', 'daily-ink', 'daily-tint', 'rapid', 'rapid-ink', 'rapid-tint', 'challenges', 'challenges-ink', 'challenges-tint', 'clock', 'clock-ink', 'clock-tint'];
export const MODES = ['learn', 'drills', 'daily', 'rapid', 'challenges', 'clock'];

/** The mode colors on a light ground (3.0's table): white text on every fill, the ink on a tint or the paper. */
export const LIGHT_MODES = {
  learn: '#0F7B45', 'learn-ink': '#0B6338', 'learn-tint': '#E1F1E8',
  drills: '#1F4FD1', 'drills-ink': '#183FA8', 'drills-tint': '#E6ECFB',
  daily: '#B8501A', 'daily-ink': '#8A3A10', 'daily-tint': '#FCEBDD',
  rapid: '#C42B6A', 'rapid-ink': '#9E1F52', 'rapid-tint': '#FBE7EF',
  challenges: '#6B3FC4', 'challenges-ink': '#5A33A8', 'challenges-tint': '#EEE8FA',
  clock: '#F0A81C', 'clock-ink': '#7A4F00', 'clock-tint': '#FDF1D3',
};
/** The mode colors on a dark ground: brighter fills that read against the dark paper (3 to 1), dark text on them, light inks for the tints; the tint is derived per theme. */
export const DARK_MODES = {
  learn: '#3DBE7E', 'learn-ink': '#6FDCA3',
  drills: '#7A9CF7', 'drills-ink': '#A9BEFF',
  daily: '#F08A4B', 'daily-ink': '#FFAE7A',
  rapid: '#F073A6', 'rapid-ink': '#FF9DC2',
  challenges: '#AE93F2', 'challenges-ink': '#CBB8FF',
  clock: '#F0A81C', 'clock-ink': '#F7C65E',
};

export const THEMES = {
  workbook: { name: 'Workbook', dark: false, tokens: {
    paper: '#F6F7F6', sheet: '#FFFFFF', chrome: '#ECEFED', line: '#D6DBD8', grid: '#E3E7E5', edge: '#7A857F', ink: '#17201B', 'ink-2': '#525D57',
    rail: '#16201A', 'rail-hi': '#2B3A31', 'rail-text': '#C9D3CD', 'rail-sub': '#AEBBB4', note: '#FFF6C7', 'note-ink': '#17201B', 'note-edge': '#B9A53C', red: '#C23B2A', 'on-fill': '#FFFFFF', 'plate-neutral': '#EEF3EF',
    ...LIGHT_MODES } },
  // High Contrast: white sheet, black ink, black gridlines, a black rail. For bright rooms and tired eyes.
  contrast: { name: 'High Contrast', dark: false, vars: {
    bg: '#FFFFFF', surface: '#FFFFFF', surface2: '#EDEDED', line: '#6B6B6B',
    text: '#000000', muted: '#262626', faint: '#595959', bad: '#B00020' },
    tokens: { paper: '#F5F5F5', grid: '#9E9E9E', rail: '#000000', 'rail-hi': '#2E2E2E', 'rail-text': '#FFFFFF', 'rail-sub': '#E0E0E0', 'plate-neutral': '#EDEDED',
      learn: '#006B32', 'learn-ink': '#00522A', drills: '#0033B3', 'drills-ink': '#002A8F' } },
  // Newsprint: the pink paper of the financial pages, set in black, the rail in ink.
  newsprint: { name: 'Newsprint', dark: false, vars: {
    bg: '#F2E3D3', surface: '#FFF4E8', surface2: '#E8D5C1', line: '#C4AC93',
    text: '#141110', muted: '#4A3F36', faint: '#7A6A5C', bad: '#A1131A' },
    tokens: { rail: '#141110', 'rail-hi': '#3A302A', 'rail-text': '#F2E3D3', 'rail-sub': '#D6C3AF', 'plate-neutral': '#EBDAC7',
      learn: '#1B5E3C', 'learn-ink': '#174F33', drills: '#1A3F8F', 'drills-ink': '#163675' } },
  // Graphite: cool charcoal panels with white ink, for late nights; the free dark theme.
  default: { name: 'Graphite', dark: true, vars: {
    bg: '#16181C', surface: '#212429', surface2: '#2C3037', line: '#454B55',
    text: '#F1F3F5', muted: '#B3BAC4', faint: '#858D99', bad: '#FF7A6B' },
    tokens: { rail: '#0E0F12', 'rail-hi': '#2C3037' } },
  // Terminal: phosphor green on black, every colour the screen of a trading desk at 2am.
  terminal: { name: 'Terminal', dark: true, vars: {
    bg: '#000000', surface: '#03120A', surface2: '#0A2414', line: '#1F5A33',
    text: '#8DFFB0', muted: '#4FD27A', faint: '#3A9A5A', bad: '#FF6B5B' },
    tokens: { rail: '#000000', 'rail-hi': '#0A2414', 'rail-text': '#8DFFB0', 'rail-sub': '#4FD27A',
      learn: '#39E17F', 'learn-ink': '#6CF0A0', drills: '#4FD1C5', 'drills-ink': '#83E8DF' } },
  // Amber: the amber screen of an old market terminal (the key stays 'bloomberg', the unlock the tests name).
  bloomberg: { name: 'Amber', dark: true, vars: {
    bg: '#000000', surface: '#0D0A05', surface2: '#1C150A', line: '#4A3816',
    text: '#FFB547', muted: '#E09A3A', faint: '#A0702A', bad: '#FF5A4D' },
    tokens: { rail: '#000000', 'rail-hi': '#1C150A', 'rail-text': '#FFB547', 'rail-sub': '#E09A3A',
      learn: '#FFB547', 'learn-ink': '#FFC978', drills: '#FFD580', 'drills-ink': '#FFE0A3' } },
  // Crimson: deep red on black. Earned at Top Bucket, level 30 (M22; the rank ladder is retired).
  crimson: { name: 'Crimson', dark: true, vars: {
    bg: '#120A0B', surface: '#1E1113', surface2: '#2B181B', line: '#55282E',
    text: '#F7E8E8', muted: '#D2A9A9', faint: '#9A6A70', bad: '#FF6A5A' },
    tokens: { rail: '#0A0506', 'rail-hi': '#2B181B', learn: '#FF6B5B', 'learn-ink': '#FF9A8E' } },
  // Synthwave: neon pink and cyan on a violet night. Earned with the first ten-hit rapid-fire combo (M100).
  synthwave: { name: 'Synthwave', dark: true, vars: {
    bg: '#140A24', surface: '#1F1035', surface2: '#2C1748', line: '#5A2F7A',
    text: '#F7ECFF', muted: '#D3B8F2', faint: '#A385C6', bad: '#FF6B6B' },
    tokens: { rail: '#0B0516', 'rail-hi': '#2C1748', 'rail-text': '#F7ECFF', 'rail-sub': '#D3B8F2',
      learn: '#FF4FB8', 'learn-ink': '#FF8AD0', drills: '#3ED8F0', 'drills-ink': '#8BEAF7' } },
};

/* Picker order: the three light sheets, then the five dark ones. Any theme missing from the list
   still shows (appended), so a new theme can't vanish. Wolf, 2026-10-02 (point 24): a few themes,
   each one clearly different, each one high contrast. */
export const THEME_ORDER = ['workbook', 'contrast', 'newsprint', 'default', 'terminal', 'bloomberg', 'crimson', 'synthwave'];

/** [[key, theme], …] in picker order. */
export function themeList() {
  const seen = {}, out = [];
  THEME_ORDER.forEach(k => { if (THEMES[k]) { out.push([k, THEMES[k]]); seen[k] = 1; } });
  Object.keys(THEMES).forEach(k => { if (!seen[k]) out.push([k, THEMES[k]]); });
  return out;
}

export const STORAGE_KEY = 'hk2_theme';
const LEGACY_KEY = 'hotkey_theme';   // the old build's key, dropped at load
export const DEFAULT_THEME = 'workbook';

let current = DEFAULT_THEME;
export function currentTheme() { return current; }

/* ---------------- color arithmetic (sRGB), shared with the contrast test ---------------- */
export function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim()); if (!m) return null;
  const n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export const rgbToHex = ([r, g, b]) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
/** Relative luminance (WCAG). */
export function luminance(hex) {
  const rgb = hexToRgb(hex); if (!rgb) return 0;
  const ch = rgb.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
/** WCAG contrast ratio between two hex colors. */
export function contrast(a, b) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
/** Mix `a` into `b` by `t` (0..1 of a), in sRGB. */
export function mix(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b); if (!A || !B) return a;
  return rgbToHex(A.map((v, i) => v * t + B[i] * (1 - t)));
}
/** Readable label colour on a fill: white on dark fills, near-black on light ones. */
export function onAccent(accent) {
  const L = luminance(accent);
  const rDark = (Math.max(L, 0) + 0.05) / (0 + 0.05);
  const rWhite = (1 + 0.05) / (L + 0.05);
  return rWhite > rDark ? '#ffffff' : '#0d1013';
}

/**
 * Every token for a theme (ui/tokens.css names → hex). A theme that states `tokens` supplies them
 * outright (Workbook); an older palette's legacy `vars` derive: paper = bg, sheet = surface,
 * chrome = surface2, ink = text, ink-2 = muted, edge = faint, grid between line and sheet, the rail
 * from the theme's own dark surfaces on a dark theme and Workbook's rail on a light one, the mode
 * colors from LIGHT_MODES or DARK_MODES with each tint mixed from the fill and the paper. A theme
 * may override any token in `tokens` beside its `vars` (the contrast fixes do).
 */
export function tokensFor(name) {
  const t = THEMES[name] || THEMES[DEFAULT_THEME];
  const v = t.vars || {};
  const dark = !!t.dark;
  const paper = v.bg || '#F6F7F6', sheet = v.surface || paper, chrome = v.surface2 || sheet;
  const towards = dark ? '#FFFFFF' : '#000000';   // a failing color moves toward this until it passes
  const grounds = [paper, sheet, chrome];
  const rail = dark ? sheet : '#16201A', railHi = dark ? chrome : '#2B3A31';
  const out = {
    paper, sheet, chrome, line: v.line || '#D6DBD8', grid: mix(v.line || '#D6DBD8', sheet, 0.5),
    edge: fit(v.faint || '#7A857F', grounds, 3, towards),
    ink: fit(v.text || '#17201B', grounds, 4.5, towards), 'ink-2': fit(v.muted || '#525D57', grounds, 4.5, towards),
    rail, 'rail-hi': railHi,
    'rail-text': fit(dark ? (v.text || '#C9D3CD') : '#C9D3CD', [rail, railHi], 4.5, '#FFFFFF'),
    'rail-sub': fit(dark ? (v.muted || '#AEBBB4') : '#AEBBB4', [rail, railHi], 4.5, '#FFFFFF'),
    note: '#FFF6C7', 'note-ink': '#17201B', 'note-edge': '#B9A53C',
    red: fit(dark ? (v.bad || '#FF6A5A') : '#C23B2A', [paper, sheet], 4.5, towards),
    'on-fill': dark ? paper : '#FFFFFF',
    'plate-neutral': dark ? mix(sheet, paper, 0.5) : '#EEF3EF',
  };
  const modes = dark ? DARK_MODES : LIGHT_MODES;
  for (const m of MODES) {
    // the fill reads against the ground (3 to 1) and carries on-fill as text (4.5), except amber, which is never text's ground
    const fill = m === 'clock' ? modes[m] : fit(modes[m], [paper, sheet], 3, dark ? '#FFFFFF' : '#000000', c => contrast(c, out['on-fill']) >= 4.5);
    out[m] = fill;
    const tint = modes[m + '-tint'] || mix(fill, paper, dark ? 0.22 : 0.12);
    out[m + '-tint'] = tint;
    out[m + '-ink'] = fit(modes[m + '-ink'], [paper, sheet, tint], 4.5, towards);
  }
  const over = { ...out, ...(t.tokens || {}) };
  // body text on every tint
  over.ink = fit(over.ink, [over.paper, over.sheet, over.chrome, ...MODES.map(m => over[m + '-tint'])], 4.5, towards);
  return over;
}

/**
 * Move `color` toward `towards` in small steps until it holds `min` against every ground in `bgs`
 * (and `also(color)` holds, when given). A color that already passes comes back unchanged, so a
 * theme's own values stand wherever they can.
 */
export function fit(color, bgs, min, towards, also) {
  const ok = c => bgs.every(b => contrast(c, b) >= min) && (!also || also(c));
  if (ok(color)) return color;
  for (let t = 0.04; t <= 1.0001; t += 0.04) { const c = mix(towards, color, t); if (ok(c)) return c; }
  return towards;
}

/** Write the active theme's name into every [data-theme-label]. */
export function syncThemeLabels() {
  const t = THEMES[current] || THEMES[DEFAULT_THEME];
  try { document.querySelectorAll('[data-theme-label]').forEach(el => { el.textContent = t.name; }); } catch (e) { /* no DOM yet */ }
}

/* THEMED SCROLLBARS — every overflow scroller rides the theme instead of the OS default. Injected
   once (id-guarded); colours come from the tokens so every theme is covered automatically. */
function ensureScrollbarStyle() {
  try {
    if (document.getElementById('hk-scrollbars')) return;
    const st = document.createElement('style'); st.id = 'hk-scrollbars';
    st.textContent = '*{scrollbar-width:thin; scrollbar-color:var(--line) transparent}' +
      '*::-webkit-scrollbar{width:9px;height:9px}' +
      '*::-webkit-scrollbar-track{background:transparent}' +
      '*::-webkit-scrollbar-thumb{background:var(--line);border-radius:99px;border:2px solid transparent;background-clip:padding-box}' +
      '*::-webkit-scrollbar-thumb:hover{background:var(--edge);border:2px solid transparent;background-clip:padding-box}' +
      '*::-webkit-scrollbar-corner{background:transparent}';
    (document.head || document.documentElement).appendChild(st);
  } catch (e) { /* ignore */ }
}

/** Apply a theme: every token as --<name> on <html>, html[data-dark], labels. Does not persist. */
export const VARS_KEY = 'hk2_theme_vars';   // the applied tokens, for the no-flash inline restore in index.html
export function applyTheme(name) {
  const key = THEMES[name] ? name : DEFAULT_THEME;
  const t = THEMES[key];
  const tokens = tokensFor(key);
  const root = document.documentElement;
  // the legacy names are aliases in tokens.css; an inline value left by an older build would shadow them
  for (const k of ['bg', 'surface', 'surface2', 'text', 'muted', 'faint', 'accent', 'accent-dim', 'accent-glow', 'on-accent', 'warn', 'bad', 'onAccent']) root.style.removeProperty('--' + k);
  for (const k in tokens) root.style.setProperty('--' + k, tokens[k]);
  root.setAttribute('data-dark', t.dark ? '1' : '0');   // drives cell-colour visibility overrides
  current = key;
  try { localStorage.setItem(VARS_KEY, JSON.stringify({ dark: t.dark, vars: tokens })); } catch (e) { /* storage blocked */ }
  ensureScrollbarStyle();
  syncThemeLabels();
}

/** Apply the saved theme (localStorage 'hk2_theme') or Workbook, the default. */
export function loadTheme() {
  let saved = null;
  // the old build saved its pick under 'hotkey_theme' (its default was Graphite, a dark palette): the
  // rebuild ignores and drops that key, so a returning visitor lands on Workbook, the approved look
  try { localStorage.removeItem(LEGACY_KEY); localStorage.removeItem(LEGACY_KEY + '_vars'); } catch (e) { /* storage blocked */ }
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage blocked */ }
  applyTheme(saved && THEMES[saved] ? saved : DEFAULT_THEME);
  return current;
}

/** Persist a pick (the account sync lives in app/store.js). */
export function saveTheme(name) {
  try { localStorage.setItem(STORAGE_KEY, name); } catch (e) { /* storage blocked */ }
}
