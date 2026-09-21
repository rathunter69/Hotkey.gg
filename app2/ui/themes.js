// app2/ui/themes.js — the 27 hotkey.gg palettes and the theme switch. Lifted verbatim from
// themes.js (THEMES 5–153, THEME_ORDER/themeList 155–171, hkOnAccent 188–193, scrollbar
// injection 195–208, applyTheme 212–221, initial apply 228–236) as an ES module.
//
// Importing this module applies NOTHING. The page calls loadTheme() as early as it can (an
// inline module in <head>) so the saved palette lands before first paint; applyTheme() writes
// every palette key as --<key> on <html>, derives --on-accent, sets html[data-dark] and refreshes
// every [data-theme-label]. Persistence is saveTheme() (localStorage 'hotkey_theme'), kept apart
// from applyTheme() exactly as the old build did.

export const THEMES = {
  default: { name: 'Graphite', dark: true, vars: {
    bg: '#292b31', surface: '#383b42', surface2: '#43474f', line: '#5a5e68',
    text: '#f0f1ec', muted: '#a8adb3', faint: '#767d87',
    accent: '#6ec9a0', 'accent-dim': '#4a8f72', 'accent-glow': 'rgba(110,201,160,.2)',
    warn: '#e0cf7a', bad: '#e07a6e' } },
  terminal: { name: 'Terminal', dark: true, vars: {
    bg: '#0c0d0e', surface: '#141517', surface2: '#1c1d20', line: '#26282c',
    text: '#e9e8e3', muted: '#7c7d77', faint: '#4c4d49',
    accent: '#2ea36f', 'accent-dim': '#1d6647', 'accent-glow': 'rgba(46,163,111,.22)',
    warn: '#d9a441', bad: '#c8533f' } },
  daylight: { name: 'Daylight', dark: false, vars: {
    bg: '#dbd8d1', surface: '#ecebe6', surface2: '#e1dfd8', line: '#c6c2b8',
    text: '#38352d', muted: '#6b665d', faint: '#a09a8f',
    accent: '#16a862', 'accent-dim': '#0e7a45', 'accent-glow': 'rgba(22,168,98,.16)', onAccent: '#ffffff',
    warn: '#9a6700', bad: '#b3261e' } },
  light: { name: 'Light', dark: false, vars: {
    bg: '#f7f7f4', surface: '#ffffff', surface2: '#eeeeea', line: '#d8d8d2',
    text: '#35352f', muted: '#6a6a6a', faint: '#a8a8a4',
    accent: '#0e9b57', 'accent-dim': '#0a7442', 'accent-glow': 'rgba(14,155,87,.16)',
    warn: '#b8860b', bad: '#a83232' } },
  serika: { name: 'Serika', dark: false, vars: {
    bg: '#e1e1e3', surface: '#f5f5f7', surface2: '#d0d0d2', line: '#b8b8bb',
    text: '#323437', muted: '#646669', faint: '#9a9a9c',
    accent: '#e2b714', 'accent-dim': '#a07f0a', 'accent-glow': 'rgba(226,183,20,.25)',
    warn: '#ca4754', bad: '#ca4754' } },
  dracula: { name: 'Dracula', dark: true, vars: {
    bg: '#282a36', surface: '#383a48', surface2: '#44475a', line: '#5d5f6e',
    text: '#f8f8f2', muted: '#a8a8a0', faint: '#6272a4',
    accent: '#bd93f9', 'accent-dim': '#8a68c4', 'accent-glow': 'rgba(189,147,249,.25)',
    warn: '#f1fa8c', bad: '#ff5555' } },
  nord: { name: 'Nord', dark: true, vars: {
    bg: '#2e3440', surface: '#3b4252', surface2: '#434c5e', line: '#4c566a',
    text: '#eceff4', muted: '#d8dee9', faint: '#7e8a9a',
    accent: '#88c0d0', 'accent-dim': '#5e81ac', 'accent-glow': 'rgba(136,192,208,.25)',
    warn: '#ebcb8b', bad: '#bf616a' } },
  tokyo: { name: 'Tokyo Night', dark: true, vars: {
    bg: '#1a1b26', surface: '#24283b', surface2: '#2f334d', line: '#414868',
    text: '#c0caf5', muted: '#a9b1d6', faint: '#565f89',
    accent: '#bb9af7', 'accent-dim': '#9a7bd0', 'accent-glow': 'rgba(187,154,247,.22)',
    warn: '#e0af68', bad: '#f7768e' } },
  gruvbox: { name: 'Gruvbox', dark: true, vars: {
    bg: '#282828', surface: '#3c3836', surface2: '#504945', line: '#665c54',
    text: '#ebdbb2', muted: '#a89984', faint: '#7c6f64',
    accent: '#fabd2f', 'accent-dim': '#d79921', 'accent-glow': 'rgba(250,189,47,.22)',
    warn: '#fe8019', bad: '#cc241d' } },
  carbon: { name: 'Carbon', dark: true, vars: {
    bg: '#161616', surface: '#262626', surface2: '#393939', line: '#525252',
    text: '#f4f4f4', muted: '#a8a8a8', faint: '#6f6f6f',
    accent: '#0f62fe', 'accent-dim': '#0043ce', 'accent-glow': 'rgba(15,98,254,.22)',
    warn: '#f1c21b', bad: '#da1e28' } },
  solarized: { name: 'Solarized', dark: true, vars: {
    bg: '#002b36', surface: '#073642', surface2: '#0d4757', line: '#586e75',
    text: '#fdf6e3', muted: '#93a1a1', faint: '#657b83',
    accent: '#268bd2', 'accent-dim': '#1a5e8f', 'accent-glow': 'rgba(38,139,210,.22)',
    warn: '#b58900', bad: '#dc322f' } },
  catppuccin: { name: 'Catppuccin', dark: true, vars: {
    bg: '#1e1e2e', surface: '#313244', surface2: '#45475a', line: '#585b70',
    text: '#cdd6f4', muted: '#bac2de', faint: '#7f849c',
    accent: '#a6e3a1', 'accent-dim': '#7eb87a', 'accent-glow': 'rgba(166,227,161,.22)',
    warn: '#f9e2af', bad: '#f38ba8' } },
  bloomberg: { name: 'Bloomberg', dark: true, vars: {
    bg: '#000000', surface: '#0a0a0a', surface2: '#161616', line: '#2a2a2a',
    text: '#ff9933', muted: '#cc7700', faint: '#704400',
    accent: '#ff9933', 'accent-dim': '#cc7700', 'accent-glow': 'rgba(255,153,51,.25)',
    warn: '#ffd700', bad: '#ff3344' } },
  monokai: { name: 'Monokai', dark: true, vars: {
    bg: '#272822', surface: '#3e3d32', surface2: '#49483e', line: '#75715e',
    text: '#f8f8f2', muted: '#cfcfc2', faint: '#75715e',
    accent: '#f92672', 'accent-dim': '#c11c50', 'accent-glow': 'rgba(249,38,114,.25)',
    warn: '#e6db74', bad: '#fd971f' } },
  onedark: { name: 'One Dark', dark: true, vars: {
    bg: '#282c34', surface: '#353b45', surface2: '#3e4451', line: '#4b5263',
    text: '#abb2bf', muted: '#828997', faint: '#5c6370',
    accent: '#61afef', 'accent-dim': '#4a8bc7', 'accent-glow': 'rgba(97,175,239,.22)',
    warn: '#e5c07b', bad: '#e06c75' } },
  synthwave: { name: 'Synthwave', dark: true, vars: {
    bg: '#241b2f', surface: '#2d2240', surface2: '#38294d', line: '#4d3a66',
    text: '#f4eee4', muted: '#b893ce', faint: '#6f5a85',
    accent: '#ff7edb', 'accent-dim': '#c14ca8', 'accent-glow': 'rgba(255,126,219,.28)',
    warn: '#ffe261', bad: '#ff5870' } },
  rose: { name: 'Rosé Pine', dark: true, vars: {
    bg: '#191724', surface: '#1f1d2e', surface2: '#26233a', line: '#403d52',
    text: '#e0def4', muted: '#908caa', faint: '#6e6a86',
    accent: '#ebbcba', 'accent-dim': '#c9a3a2', 'accent-glow': 'rgba(235,188,186,.22)',
    warn: '#f6c177', bad: '#eb6f92' } },
  everforest: { name: 'Everforest', dark: true, vars: {
    bg: '#2d353b', surface: '#343f44', surface2: '#3d484d', line: '#475258',
    text: '#d3c6aa', muted: '#9da9a0', faint: '#7a8478',
    accent: '#a7c080', 'accent-dim': '#82a06d', 'accent-glow': 'rgba(167,192,128,.22)',
    warn: '#dbbc7f', bad: '#e67e80' } },
  github: { name: 'GitHub Light', dark: false, vars: {
    bg: '#ffffff', surface: '#f6f8fa', surface2: '#eaeef2', line: '#d0d7de',
    text: '#1f2328', muted: '#656d76', faint: '#8c959f',
    accent: '#0969da', 'accent-dim': '#054da7', 'accent-glow': 'rgba(9,105,218,.15)',
    warn: '#9a6700', bad: '#cf222e' } },
  newsprint: { name: 'Newsprint', dark: false, vars: {
    bg: '#f3eedf', surface: '#fffaee', surface2: '#e8e0c8', line: '#c2b89c',
    text: '#1a1a1a', muted: '#5a5446', faint: '#8c8470',
    accent: '#8b0000', 'accent-dim': '#5e0000', 'accent-glow': 'rgba(139,0,0,.12)',
    warn: '#b58900', bad: '#8b0000' } },
  kanagawa: { name: 'Kanagawa', dark: true, vars: {
    bg: '#1f1f28', surface: '#2a2a37', surface2: '#363646', line: '#54546d',
    text: '#dcd7ba', muted: '#c8c093', faint: '#727169',
    accent: '#ffa066', 'accent-dim': '#c97f4d', 'accent-glow': 'rgba(255,160,102,.22)',
    warn: '#e6c384', bad: '#c34043' } },
  ledger: { name: 'Ledger', dark: false, vars: {
    bg: '#e7ede0', surface: '#f2f6ea', surface2: '#dde5d0', line: '#c2cdad',
    text: '#26301c', muted: '#5b6650', faint: '#98a186',
    accent: '#2f7a44', 'accent-dim': '#1d5730', 'accent-glow': 'rgba(47,122,68,.14)',
    warn: '#8a6100', bad: '#a83232' } },
  sepia: { name: 'Sepia', dark: false, vars: {
    bg: '#ece0cd', surface: '#f5ecdd', surface2: '#e2d4bd', line: '#cab897',
    text: '#3a2e20', muted: '#6e5c45', faint: '#a08e74',
    accent: '#a3592a', 'accent-dim': '#7a3f18', 'accent-glow': 'rgba(163,89,42,.13)',
    warn: '#8a6100', bad: '#9c3b2e' } },
  frost: { name: 'Frost', dark: false, vars: {
    bg: '#e8edf3', surface: '#f6fafd', surface2: '#dce4ec', line: '#c1ccd9',
    text: '#1f2733', muted: '#5b6673', faint: '#97a2b0',
    accent: '#2b7bbd', 'accent-dim': '#1b5688', 'accent-glow': 'rgba(43,123,189,.14)',
    warn: '#9a6700', bad: '#b3261e' } },
  phoebes: { name: 'Phoebe’s Paws', dark: false, vars: {
    bg: '#f9e9ee', surface: '#fef5f8', surface2: '#f4d9e2', line: '#ebbfce',
    text: '#3c2930', muted: '#8c6874', faint: '#c49fad',
    accent: '#c55c7d', 'accent-dim': '#9e4460', 'accent-glow': 'rgba(213,126,150,.16)',
    warn: '#9a6700', bad: '#b3261e' } },
  crimson: { name: 'Crimson', dark: true, vars: {
    bg: '#191012', surface: '#241619', surface2: '#301b20', line: '#4a2d33',
    text: '#f2e2e2', muted: '#c09a9a', faint: '#7d585e',
    accent: '#e2503f', 'accent-dim': '#b0392b', 'accent-glow': 'rgba(226,80,63,.22)',
    warn: '#e0b020', bad: '#ff6a5a' } },
  tangerine: { name: 'Tangerine', dark: true, vars: {
    bg: '#181410', surface: '#231d15', surface2: '#2f251a', line: '#4a3c28',
    text: '#f3e9db', muted: '#c3ac8c', faint: '#847258',
    accent: '#f0871f', 'accent-dim': '#bf6810', 'accent-glow': 'rgba(240,135,31,.22)',
    warn: '#ffd24a', bad: '#ff6a4a' } },
};

/* Picker order — LIGHT/paper first (Daylight leads), then DARK roughly light → dark. Any theme
   missing from the list still shows (appended), so a new theme can't vanish. */
export const THEME_ORDER = [
  // light / paper
  'daylight', 'github', 'light', 'phoebes', 'newsprint', 'frost', 'ledger', 'serika', 'sepia',
  // dark, ~lightest → darkest
  'default', 'nord', 'everforest', 'dracula', 'onedark', 'gruvbox', 'monokai', 'kanagawa', 'catppuccin',
  'synthwave', 'tokyo', 'rose', 'solarized', 'crimson', 'tangerine', 'carbon', 'terminal', 'bloomberg',
];

/** [[key, theme], …] in picker order. */
export function themeList() {
  const seen = {}, out = [];
  THEME_ORDER.forEach(k => { if (THEMES[k]) { out.push([k, THEMES[k]]); seen[k] = 1; } });
  Object.keys(THEMES).forEach(k => { if (!seen[k]) out.push([k, THEMES[k]]); });
  return out;
}

export const STORAGE_KEY = 'hotkey_theme';
export const DEFAULT_THEME = 'daylight';

let current = DEFAULT_THEME;
export function currentTheme() { return current; }

/* relative luminance (sRGB → linear), for auto-contrast ink selection */
function schLum(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim()); if (!m) return 0;
  const n = parseInt(m[1], 16), ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => {
    v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
/** Readable label colour on an accent fill: white on dark accents, near-black on light ones. */
export function onAccent(accent) {
  const L = schLum(accent);
  const rDark = (Math.max(L, 0) + 0.05) / (0 + 0.05);   // vs near-black (lum≈0)
  const rWhite = (1 + 0.05) / (L + 0.05);               // vs white   (lum≈1)
  return rWhite > rDark ? '#ffffff' : '#0d1013';
}

/** Write the active theme's name into every [data-theme-label]. */
export function syncThemeLabels() {
  const t = THEMES[current] || THEMES.default;
  try { document.querySelectorAll('[data-theme-label]').forEach(el => { el.textContent = t.name; }); } catch (e) { /* no DOM yet */ }
}

/* THEMED SCROLLBARS — every overflow scroller rides the theme instead of the OS default. Injected
   once (id-guarded); colours come from the CSS vars so every theme is covered automatically. */
function ensureScrollbarStyle() {
  try {
    if (document.getElementById('hk-scrollbars')) return;
    const st = document.createElement('style'); st.id = 'hk-scrollbars';
    st.textContent = '*{scrollbar-width:thin; scrollbar-color:var(--line,#555) transparent}' +
      '*::-webkit-scrollbar{width:9px;height:9px}' +
      '*::-webkit-scrollbar-track{background:transparent}' +
      '*::-webkit-scrollbar-thumb{background:var(--line,#555);border-radius:99px;border:2px solid transparent;background-clip:padding-box}' +
      '*::-webkit-scrollbar-thumb:hover{background:var(--faint,#777);border:2px solid transparent;background-clip:padding-box}' +
      '*::-webkit-scrollbar-corner{background:transparent}';
    (document.head || document.documentElement).appendChild(st);
  } catch (e) { /* ignore */ }
}

/** Apply a palette: --<key> vars on <html>, --on-accent, html[data-dark], labels. Does not persist. */
export function applyTheme(name) {
  const t = THEMES[name] || THEMES.default;
  const root = document.documentElement;
  for (const k in t.vars) root.style.setProperty('--' + k, t.vars[k]);
  /* themes may pin the CTA text colour explicitly (daylight: green + WHITE text); the contrast
     formula stays the fallback. */
  root.style.setProperty('--on-accent', t.vars.onAccent || onAccent(t.vars.accent || '#6ec9a0'));
  root.setAttribute('data-dark', t.dark ? '1' : '0');   // drives cell-colour visibility overrides
  current = THEMES[name] ? name : 'default';
  ensureScrollbarStyle();
  syncThemeLabels();
}

/** Apply the saved theme (localStorage 'hotkey_theme') or Daylight, the unconditional default. */
export function loadTheme() {
  let saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage blocked */ }
  applyTheme(saved && THEMES[saved] ? saved : DEFAULT_THEME);
  return current;
}

/** Persist a pick (the account sync the old nav.js did is auth logic and lives elsewhere). */
export function saveTheme(name) {
  try { localStorage.setItem(STORAGE_KEY, name); } catch (e) { /* storage blocked */ }
}
