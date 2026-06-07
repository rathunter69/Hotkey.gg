/* themes.js — single source of truth for hotkey.gg color palettes.
   Loaded by index.html, leaderboard.html, and reference.html.
   Exposes: window.THEMES (the dict), window.applyTheme(name), window.currentTheme. */

window.THEMES = {
  default: { name:'Default', dark:true, vars:{
    bg:'#0c0d0e', surface:'#141517', surface2:'#1c1d20', line:'#26282c',
    text:'#e9e8e3', muted:'#7c7d77', faint:'#4c4d49',
    accent:'#2ea36f', 'accent-dim':'#1d6647', 'accent-glow':'rgba(46,163,111,.22)',
    warn:'#d9a441', bad:'#c8533f' }},
  light: { name:'Light', dark:false, vars:{
    bg:'#f7f7f4', surface:'#ffffff', surface2:'#eeeeea', line:'#d8d8d2',
    text:'#1a1a1a', muted:'#6a6a6a', faint:'#a8a8a4',
    accent:'#2ea36f', 'accent-dim':'#1d6647', 'accent-glow':'rgba(46,163,111,.18)',
    warn:'#b8860b', bad:'#a83232' }},
  serika: { name:'Serika', dark:false, vars:{
    bg:'#e1e1e3', surface:'#f5f5f7', surface2:'#d0d0d2', line:'#b8b8bb',
    text:'#323437', muted:'#646669', faint:'#9a9a9c',
    accent:'#e2b714', 'accent-dim':'#a07f0a', 'accent-glow':'rgba(226,183,20,.25)',
    warn:'#ca4754', bad:'#ca4754' }},
  dracula: { name:'Dracula', dark:true, vars:{
    bg:'#282a36', surface:'#383a48', surface2:'#44475a', line:'#5d5f6e',
    text:'#f8f8f2', muted:'#a8a8a0', faint:'#6272a4',
    accent:'#bd93f9', 'accent-dim':'#8a68c4', 'accent-glow':'rgba(189,147,249,.25)',
    warn:'#f1fa8c', bad:'#ff5555' }},
  nord: { name:'Nord', dark:true, vars:{
    bg:'#2e3440', surface:'#3b4252', surface2:'#434c5e', line:'#4c566a',
    text:'#eceff4', muted:'#d8dee9', faint:'#7e8a9a',
    accent:'#88c0d0', 'accent-dim':'#5e81ac', 'accent-glow':'rgba(136,192,208,.25)',
    warn:'#ebcb8b', bad:'#bf616a' }},
  tokyo: { name:'Tokyo Night', dark:true, vars:{
    bg:'#1a1b26', surface:'#24283b', surface2:'#2f334d', line:'#414868',
    text:'#c0caf5', muted:'#a9b1d6', faint:'#565f89',
    accent:'#bb9af7', 'accent-dim':'#9a7bd0', 'accent-glow':'rgba(187,154,247,.22)',
    warn:'#e0af68', bad:'#f7768e' }},
  gruvbox: { name:'Gruvbox', dark:true, vars:{
    bg:'#282828', surface:'#3c3836', surface2:'#504945', line:'#665c54',
    text:'#ebdbb2', muted:'#a89984', faint:'#7c6f64',
    accent:'#fabd2f', 'accent-dim':'#d79921', 'accent-glow':'rgba(250,189,47,.22)',
    warn:'#fe8019', bad:'#cc241d' }},
  carbon: { name:'Carbon', dark:true, vars:{
    bg:'#161616', surface:'#262626', surface2:'#393939', line:'#525252',
    text:'#f4f4f4', muted:'#a8a8a8', faint:'#6f6f6f',
    accent:'#0f62fe', 'accent-dim':'#0043ce', 'accent-glow':'rgba(15,98,254,.22)',
    warn:'#f1c21b', bad:'#da1e28' }},
  solarized: { name:'Solarized', dark:true, vars:{
    bg:'#002b36', surface:'#073642', surface2:'#0d4757', line:'#586e75',
    text:'#fdf6e3', muted:'#93a1a1', faint:'#657b83',
    accent:'#268bd2', 'accent-dim':'#1a5e8f', 'accent-glow':'rgba(38,139,210,.22)',
    warn:'#b58900', bad:'#dc322f' }},
  catppuccin: { name:'Catppuccin', dark:true, vars:{
    bg:'#1e1e2e', surface:'#313244', surface2:'#45475a', line:'#585b70',
    text:'#cdd6f4', muted:'#bac2de', faint:'#7f849c',
    accent:'#a6e3a1', 'accent-dim':'#7eb87a', 'accent-glow':'rgba(166,227,161,.22)',
    warn:'#f9e2af', bad:'#f38ba8' }},
  bloomberg: { name:'Bloomberg', dark:true, vars:{
    bg:'#000000', surface:'#0a0a0a', surface2:'#161616', line:'#2a2a2a',
    text:'#ff9933', muted:'#cc7700', faint:'#704400',
    accent:'#ff9933', 'accent-dim':'#cc7700', 'accent-glow':'rgba(255,153,51,.25)',
    warn:'#ffd700', bad:'#ff3344' }},
  monokai: { name:'Monokai', dark:true, vars:{
    bg:'#272822', surface:'#3e3d32', surface2:'#49483e', line:'#75715e',
    text:'#f8f8f2', muted:'#cfcfc2', faint:'#75715e',
    accent:'#f92672', 'accent-dim':'#c11c50', 'accent-glow':'rgba(249,38,114,.25)',
    warn:'#e6db74', bad:'#fd971f' }},
  onedark: { name:'One Dark', dark:true, vars:{
    bg:'#282c34', surface:'#353b45', surface2:'#3e4451', line:'#4b5263',
    text:'#abb2bf', muted:'#828997', faint:'#5c6370',
    accent:'#61afef', 'accent-dim':'#4a8bc7', 'accent-glow':'rgba(97,175,239,.22)',
    warn:'#e5c07b', bad:'#e06c75' }},
  synthwave: { name:'Synthwave', dark:true, vars:{
    bg:'#241b2f', surface:'#2d2240', surface2:'#38294d', line:'#4d3a66',
    text:'#f4eee4', muted:'#b893ce', faint:'#6f5a85',
    accent:'#ff7edb', 'accent-dim':'#c14ca8', 'accent-glow':'rgba(255,126,219,.28)',
    warn:'#ffe261', bad:'#ff5870' }},
  rose: { name:'Rosé Pine', dark:true, vars:{
    bg:'#191724', surface:'#1f1d2e', surface2:'#26233a', line:'#403d52',
    text:'#e0def4', muted:'#908caa', faint:'#6e6a86',
    accent:'#ebbcba', 'accent-dim':'#c9a3a2', 'accent-glow':'rgba(235,188,186,.22)',
    warn:'#f6c177', bad:'#eb6f92' }},
  everforest: { name:'Everforest', dark:true, vars:{
    bg:'#2d353b', surface:'#343f44', surface2:'#3d484d', line:'#475258',
    text:'#d3c6aa', muted:'#9da9a0', faint:'#7a8478',
    accent:'#a7c080', 'accent-dim':'#82a06d', 'accent-glow':'rgba(167,192,128,.22)',
    warn:'#dbbc7f', bad:'#e67e80' }},
  github: { name:'GitHub Light', dark:false, vars:{
    bg:'#ffffff', surface:'#f6f8fa', surface2:'#eaeef2', line:'#d0d7de',
    text:'#1f2328', muted:'#656d76', faint:'#8c959f',
    accent:'#0969da', 'accent-dim':'#054da7', 'accent-glow':'rgba(9,105,218,.15)',
    warn:'#9a6700', bad:'#cf222e' }},
  newsprint: { name:'Newsprint', dark:false, vars:{
    bg:'#f3eedf', surface:'#fffaee', surface2:'#e8e0c8', line:'#c2b89c',
    text:'#1a1a1a', muted:'#5a5446', faint:'#8c8470',
    accent:'#8b0000', 'accent-dim':'#5e0000', 'accent-glow':'rgba(139,0,0,.12)',
    warn:'#b58900', bad:'#8b0000' }},
  kanagawa: { name:'Kanagawa', dark:true, vars:{
    bg:'#1f1f28', surface:'#2a2a37', surface2:'#363646', line:'#54546d',
    text:'#dcd7ba', muted:'#c8c093', faint:'#727169',
    accent:'#ffa066', 'accent-dim':'#c97f4d', 'accent-glow':'rgba(255,160,102,.22)',
    warn:'#e6c384', bad:'#c34043' }},
};

window.currentTheme = 'default';

// Update any theme-name labels on the page (Monkeytype-style text next to the theme selector).
// Elements opt in with a data-theme-label attribute; we set their text to the active theme's name.
window.syncThemeLabels = function(){
  const t = window.THEMES[window.currentTheme] || window.THEMES.default;
  try{ document.querySelectorAll('[data-theme-label]').forEach(function(el){ el.textContent = t.name; }); }catch(e){}
};

window.applyTheme = function(name){
  const t = window.THEMES[name] || window.THEMES.default;
  const root = document.documentElement;
  for(const k in t.vars) root.style.setProperty('--' + k, t.vars[k]);
  window.currentTheme = name;
  window.syncThemeLabels();
};

// On script load: apply the saved theme (or prefers-color-scheme default) before any render.
(function(){
  let saved = null;
  try{ saved = localStorage.getItem('hotkey_theme'); }catch(e){}
  if(!saved || !window.THEMES[saved]){
    try{ saved = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'default'; }
    catch(e){ saved = 'default'; }
  }
  window.applyTheme(saved);
})();

// Theme-name labels live in the page body, which doesn't exist yet when this runs in <head>.
// Populate them once the DOM is ready; applyTheme keeps them in sync on every change after that.
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', window.syncThemeLabels);
else window.syncThemeLabels();
