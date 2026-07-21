/* themes.js — single source of truth for hotkey.gg color palettes.
   Loaded by index.html, leaderboard.html, and reference.html.
   Exposes: window.THEMES (the dict), window.applyTheme(name), window.currentTheme. */

window.THEMES = {
  default: { name:'Graphite', dark:true, vars:{
    bg:'#292b31', surface:'#383b42', surface2:'#43474f', line:'#5a5e68',
    text:'#f0f1ec', muted:'#a8adb3', faint:'#767d87',
    accent:'#6ec9a0', 'accent-dim':'#4a8f72', 'accent-glow':'rgba(110,201,160,.2)',
    warn:'#e0cf7a', bad:'#e07a6e' }},
  terminal: { name:'Terminal', dark:true, vars:{
    bg:'#0c0d0e', surface:'#141517', surface2:'#1c1d20', line:'#26282c',
    text:'#e9e8e3', muted:'#7c7d77', faint:'#4c4d49',
    accent:'#2ea36f', 'accent-dim':'#1d6647', 'accent-glow':'rgba(46,163,111,.22)',
    warn:'#d9a441', bad:'#c8533f' }},
  daylight: { name:'Daylight', dark:false, vars:{
    bg:'#dbd8d1', surface:'#ecebe6', surface2:'#e1dfd8', line:'#c6c2b8',
    /* r204 (Wolf): softer warm graphite text (not black) + a punchier, more saturated
       accent so menu tabs, nav, and drill headers POP on the paper background. */
    text:'#38352d', muted:'#6b665d', faint:'#a09a8f',
    /* r322/r325 (Wolf): a flat, SLIGHTLY lightened green — the r204 #0e9b57 read heavy; r322's
       #19b06a was a touch too vivid. #14a25c keeps the original's muted character, just lifted,
       flat solid fill, white button text still readable. */
    accent:'#16a862', 'accent-dim':'#0e7a45', 'accent-glow':'rgba(22,168,98,.16)', onAccent:'#ffffff',   /* r346 (Wolf): Supabase-style CTA — green background, white text */
    warn:'#9a6700', bad:'#b3261e' }},
  light: { name:'Light', dark:false, vars:{
    bg:'#f7f7f4', surface:'#ffffff', surface2:'#eeeeea', line:'#d8d8d2',
    /* r204 (Wolf): graphite text instead of near-black, same vibrant accent as Daylight. */
    text:'#35352f', muted:'#6a6a6a', faint:'#a8a8a4',
    accent:'#0e9b57', 'accent-dim':'#0a7442', 'accent-glow':'rgba(14,155,87,.16)',
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
  /* r213 (Wolf): more distinct LIGHT/paper themes + bolder color identities — the set skewed
     dark-blue. Light themes keep their own paper sheet; the bold dark ones ride the r212
     dark-chrome / light-sheet, so their identity lives in the chrome. */
  ledger: { name:'Ledger', dark:false, vars:{
    bg:'#e7ede0', surface:'#f2f6ea', surface2:'#dde5d0', line:'#c2cdad',
    text:'#26301c', muted:'#5b6650', faint:'#98a186',
    accent:'#2f7a44', 'accent-dim':'#1d5730', 'accent-glow':'rgba(47,122,68,.14)',
    warn:'#8a6100', bad:'#a83232' }},
  sepia: { name:'Sepia', dark:false, vars:{
    bg:'#ece0cd', surface:'#f5ecdd', surface2:'#e2d4bd', line:'#cab897',
    text:'#3a2e20', muted:'#6e5c45', faint:'#a08e74',
    accent:'#a3592a', 'accent-dim':'#7a3f18', 'accent-glow':'rgba(163,89,42,.13)',
    warn:'#8a6100', bad:'#9c3b2e' }},
  frost: { name:'Frost', dark:false, vars:{
    bg:'#e8edf3', surface:'#f6fafd', surface2:'#dce4ec', line:'#c1ccd9',
    text:'#1f2733', muted:'#5b6673', faint:'#97a2b0',
    accent:'#2b7bbd', 'accent-dim':'#1b5688', 'accent-glow':'rgba(43,123,189,.14)',
    warn:'#9a6700', bad:'#b3261e' }},
  phoebes: { name:'Phoebe’s Paws', dark:false, vars:{
    // r217 (Wolf): modeled on his friend's cat's toe beans — #D5957F, nudged pinker
    // into a soft Sakura rose. The blush backgrounds + dusty-rose accent keep the
    // toe-bean warmth while reading clearly PINK, not salmon/tan.
    bg:'#f9e9ee', surface:'#fef5f8', surface2:'#f4d9e2', line:'#ebbfce',
    text:'#3c2930', muted:'#8c6874', faint:'#c49fad',
    accent:'#c55c7d', 'accent-dim':'#9e4460', 'accent-glow':'rgba(213,126,150,.16)',
    warn:'#9a6700', bad:'#b3261e' }},
  crimson: { name:'Crimson', dark:true, vars:{
    bg:'#191012', surface:'#241619', surface2:'#301b20', line:'#4a2d33',
    text:'#f2e2e2', muted:'#c09a9a', faint:'#7d585e',
    accent:'#e2503f', 'accent-dim':'#b0392b', 'accent-glow':'rgba(226,80,63,.22)',
    warn:'#e0b020', bad:'#ff6a5a' }},
  tangerine: { name:'Tangerine', dark:true, vars:{
    bg:'#181410', surface:'#231d15', surface2:'#2f251a', line:'#4a3c28',
    text:'#f3e9db', muted:'#c3ac8c', faint:'#847258',
    accent:'#f0871f', 'accent-dim':'#bf6810', 'accent-glow':'rgba(240,135,31,.22)',
    warn:'#ffd24a', bad:'#ff6a4a' }},
};

/* r214 (Wolf): the picker interleaved light and dark randomly. Give it a coherent order —
   LIGHT/paper first (Daylight, the default light, leads), then DARK roughly light → dark
   (Default, the grey prior-default, leads). themeList() feeds both pickers; any theme missing
   from the list still shows (appended), so a new theme can't vanish. */
window.THEME_ORDER = [
  // light / paper
  'daylight','github','light','phoebes','newsprint','frost','ledger','serika','sepia',
  // dark, ~lightest → darkest
  'default','nord','everforest','dracula','onedark','gruvbox','monokai','kanagawa','catppuccin',
  'synthwave','tokyo','rose','solarized','crimson','tangerine','carbon','terminal','bloomberg',
];
window.themeList = function(){
  const seen={}, out=[];
  (window.THEME_ORDER||[]).forEach(k=>{ if(window.THEMES[k]){ out.push([k, window.THEMES[k]]); seen[k]=1; } });
  Object.keys(window.THEMES).forEach(k=>{ if(!seen[k]) out.push([k, window.THEMES[k]]); });
  return out;
};

window.currentTheme = 'daylight';

// Update any theme-name labels on the page (Monkeytype-style text next to the theme selector).
// Elements opt in with a data-theme-label attribute; we set their text to the active theme's name.
window.syncThemeLabels = function(){
  const t = window.THEMES[window.currentTheme] || window.THEMES.default;
  try{ document.querySelectorAll('[data-theme-label]').forEach(function(el){ el.textContent = t.name; }); }catch(e){}
};

/* r252 (Wolf): accent buttons hardcoded a near-black label, which is unreadable on
   accents like newsprint's dark red or carbon/github blue. Derive a readable
   on-accent label PER THEME (white on dark accents, near-black on light ones) so
   every accent CTA passes contrast on every palette — set as the --on-accent token.*/
/* readable label on an accent fill — exposed so every page's applyTheme (some carry
   their own copy) sets the SAME token. */
window.hkOnAccent = function(accent){
  var L=_schLum(accent);
  var rDark=(Math.max(L,0)+0.05)/(0+0.05);          // vs near-black (lum≈0)
  var rWhite=(1+0.05)/(L+0.05);                       // vs white   (lum≈1)
  return rWhite>rDark ? '#ffffff' : '#0d1013';
};
/* r268 THEMED SCROLLBARS — every overflow scroller (checklist, player card, pickers,
   board lists) rides the theme instead of the OS default. Injected once; colors come
   from the CSS vars so every theme is covered automatically. */
(function(){
  try{
    var st=document.createElement('style'); st.id='hk-scrollbars';
    st.textContent='*{scrollbar-width:thin; scrollbar-color:var(--line,#555) transparent}'+
      '*::-webkit-scrollbar{width:9px;height:9px}'+
      '*::-webkit-scrollbar-track{background:transparent}'+
      '*::-webkit-scrollbar-thumb{background:var(--line,#555);border-radius:99px;border:2px solid transparent;background-clip:padding-box}'+
      '*::-webkit-scrollbar-thumb:hover{background:var(--faint,#777);border:2px solid transparent;background-clip:padding-box}'+
      '*::-webkit-scrollbar-corner{background:transparent}';
    (document.head||document.documentElement).appendChild(st);
  }catch(e){}
})();

window.applyTheme = function(name){
  const t = window.THEMES[name] || window.THEMES.default;
  const root = document.documentElement;
  for(const k in t.vars) root.style.setProperty('--' + k, t.vars[k]);
  /* r346 (Wolf): themes may pin the CTA text color explicitly — the contrast formula chose
     near-black on daylight's green, but the Supabase-style read (green + WHITE text) is the
     look; white on #14a25c holds ~3.4:1, fine for bold button text. Formula stays the fallback. */
  root.style.setProperty('--on-accent', t.vars.onAccent || window.hkOnAccent(t.vars.accent || '#6ec9a0'));
  root.setAttribute('data-dark', t.dark ? '1' : '0');   // drives cell-color visibility overrides
  window.currentTheme = name;
  window.syncThemeLabels();
};

// On script load: apply the saved theme, else follow the OS preference — the SAME fallback the
// trainer uses, so navigating between pages never flips light/dark on a fresh browser.
// r204 (Wolf): Daylight is now THE default light theme; system-light browsers land there instead
// of the harsher plain Light. The grey desk theme (key 'default', kept for internal fallback) is
// now LABELLED 'Graphite' — Daylight is THE default a fresh device/visitor sees (Wolf).
(function(){
  let saved = null;
  try{ saved = localStorage.getItem('hotkey_theme'); }catch(e){}
  if(saved && window.THEMES[saved]){ window.applyTheme(saved); return; }
  // r293 (Wolf): Daylight is the unconditional default everywhere — a fresh device /
  // logged-out visitor always lands on light, matching the trainer (r238). A saved
  // choice (local, or synced from the account by nav.js) still wins.
  window.applyTheme('daylight');
})();

// Theme-name labels live in the page body, which doesn't exist yet when this runs in <head>.
// Populate them once the DOM is ready; applyTheme keeps them in sync on every change after that.
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', window.syncThemeLabels);
else window.syncThemeLabels();

/* ---- rank emblems v4 (r377): ONE SHIELD FAMILY — the heraldic ladder ----
   Ported from the approved concept round 3 (art3 board, Wolf-signed). Every
   tier wears the SAME heater plate, engraved monochrome in its tier metal
   (deep understroke → plate fill → metal-gradient stroke → hi hairline
   polish). Identity comes from two dials:
     CHARGE — keyboard-warrior devices, one per tier, no repeats: #REF! ·
       blank keycap · #### overflow chevron · arrow-key saltire · ↵ enter ·
       crossed keycap-pommel swords (+ the $ F4 chief) · the bull · the
       faceted gem (bearing the ladder's single Σ — Wolf's cap: at most one).
     FURNITURE — bare plate → rivets → bordure → mantling → banner scroll →
       wings (small/mid/full/grand) → finial (bead/diamond/star), and it now
       scales with BUCKET inside each tier: bottom = the tier's base dress,
       middle = +one stage, top = full dress. The absolute prime crest —
       grand three-rank spread + star finial + memento banner — is
       exclusively TOP-BUCKET Second-Year. No-bucket calls render the tier's
       MIDDLE dress (no pips, no heat rim).
   Banner scrolls carry a fixed per-tier engraved motto (Wolf: no custom
   title system this round); text drops in coarse mode. Below 28px the
   coarse branch kicks in: simplified charges, thicker strokes, solid
   mid-metal plate fill — 16/22px board rows stay crisp.
   API unchanged: rankEmblem(tierName, size, bucket) — bucket is the HK_RANK
   string ('Bottom/Middle/Top Bucket'), a number 1..3, or absent. With a
   bucket the canvas grows the division-pip zone (viewBox 100x114, height =
   size*1.14). 'MBA Associate' arrives bucket-null in-game (placement
   pending) so it renders the iron plate at middle dress, no pips.
   Animation layers for the rank-up moment keep their stable classes:
   .frame .glyph .ornament .jewel .pips. */
window.RANK_EMBLEM_IDX = {'MBA Associate':0,'Candidate':1,'Summer Analyst':2,
  'First-Year Analyst':3,'Associate':4,'VP':5,'MD':6,'Second-Year Analyst':7};
window.rankEmblem = (function(){
  let UID=0;
  /* r377: THE METAL LADDER, shifted down one rung (Wolf) — SLATE is retired.
     Candidate wears BRONZE, Summer SILVER, First-Year GOLD; Associate takes
     the new AMETHYST; VP keeps its teal-platinum; MD crimson and the summit
     diamond stand. EMER (a true rich emerald) is cut and exposed in
     HK_METALS but UNASSIGNED — it awaits Wolf's placement call. */
  const IRON ={hi:'#a9aeb9',mid:'#7c828e',lo:'#525761',deep:'#26282e',plateHi:'#33363d',plateLo:'#1f2126',core:'#8b919d'};
  const BRONZE={hi:'#f4c088',mid:'#cf8e4c',lo:'#95602c',deep:'#432a12',plateHi:'#453425',plateLo:'#271e16',core:'#e8a45f'};
  const SILVER={hi:'#f4f7fc',mid:'#c9d0dc',lo:'#8e96a5',deep:'#454c59',plateHi:'#454b57',plateLo:'#262a32',core:'#dde2ea'};
  const GOLD ={hi:'#ffefb3',mid:'#f4c754',lo:'#bf8e20',deep:'#523a05',plateHi:'#4a3f20',plateLo:'#282112',core:'#ffd968'};
  const AMET ={hi:'#efe0ff',mid:'#b78ae8',lo:'#7a4fb8',deep:'#2f1b50',plateHi:'#382b52',plateLo:'#1f172e',core:'#c9a2ff'};
  const EMER ={hi:'#d2f7dc',mid:'#57d183',lo:'#1f9455',deep:'#0c3d22',plateHi:'#1c4230',plateLo:'#11271b',core:'#6ff0a0'};
  const PLAT ={hi:'#e0fdf7',mid:'#86dcca',lo:'#3d9c8e',deep:'#173f3a',plateHi:'#25453f',plateLo:'#152522',core:'#8ef2df'};
  const CRIM ={hi:'#ffb3a1',mid:'#e65843',lo:'#9c2a1c',deep:'#3a0f0b',plateHi:'#3b1d19',plateLo:'#1f0f0e',core:'#ff6248'};
  const DIAM ={hi:'#f4fdff',mid:'#9be0f7',lo:'#4aa6cc',deep:'#153c50',plateHi:'#21404f',plateLo:'#12232c',core:'#a8ecff'};
  // r373: the profile-frame system (HK_FRAMES below) borrows the emblem metals —
  // ONE palette source, so a plaque frame can never drift off its rank tier's crest.
  // r377 adds AMET (Associate's new metal) + the unassigned EMER to the exposed set.
  window.HK_METALS={BRONZE:BRONZE,SILVER:SILVER,GOLD:GOLD,AMET:AMET,EMER:EMER,PLAT:PLAT,DIAM:DIAM};
  const PALS=[IRON,BRONZE,SILVER,GOLD,AMET,PLAT,CRIM,DIAM];
  const SH  ='M27 22 L73 22 L73 50 Q73 68 50 84 Q27 68 27 50 Z';   // the heater plate
  const SHIN='M31 26 L69 26 L69 49 Q69 63 50 79 Q31 63 31 49 Z';   // bordure inset
  const MONO='JetBrains Mono,ui-monospace,monospace';
  function defs(id,P){
    return '<defs><linearGradient id="'+id+'m" x1="0" y1="0" x2="0" y2="1">'+
      '<stop offset="0" stop-color="'+P.hi+'"/><stop offset=".45" stop-color="'+P.mid+'"/>'+
      '<stop offset=".55" stop-color="'+P.lo+'"/><stop offset="1" stop-color="'+P.deep+'"/></linearGradient>'+
      '<linearGradient id="'+id+'p" x1="0" y1="0" x2="0" y2="1">'+
      '<stop offset="0" stop-color="'+P.plateHi+'"/><stop offset="1" stop-color="'+P.plateLo+'"/></linearGradient>'+
      '<radialGradient id="'+id+'c" cx=".5" cy=".42">'+
      '<stop offset="0" stop-color="'+P.core+'" stop-opacity=".38"/><stop offset="1" stop-color="'+P.core+'" stop-opacity="0"/></radialGradient>'+
      '<clipPath id="'+id+'clip"><path d="'+SH+'"/></clipPath></defs>';
  }
  // engraved element: deep understroke, plate (or given) fill, metal stroke
  function eng(id,P,d,sw,fill){
    return '<path d="'+d+'" fill="none" stroke="'+P.deep+'" stroke-width="'+(sw+1.8).toFixed(1)+'" stroke-linejoin="round"/>'+
      '<path d="'+d+'" fill="'+(fill||('url(#'+id+'p)'))+'" stroke="url(#'+id+'m)" stroke-width="'+sw.toFixed(1)+'" stroke-linejoin="round"/>';
  }
  // engraved line-work (no fill): deep under + metal over
  function engLine(id,P,d,sw){
    return '<path d="'+d+'" fill="none" stroke="'+P.deep+'" stroke-width="'+(sw+1.6).toFixed(1)+'" stroke-linecap="round" stroke-linejoin="round"/>'+
      '<path d="'+d+'" fill="none" stroke="url(#'+id+'m)" stroke-width="'+sw.toFixed(1)+'" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  function pips(id,P,bk){
    if(!bk) return '';
    let out='';
    for(let i=0;i<3;i++){
      const x=50+(i-1)*13, on=i<bk;
      out+='<path d="M'+x+' 102 L'+(x+4.6)+' 107 L'+x+' 112 L'+(x-4.6)+' 107 Z" fill="'+
        (on?'url(#'+id+'m)':'none')+'" stroke="'+(on?P.deep:P.lo)+'" stroke-width="1.1"'+(on?' class="on"':' opacity=".45"')+'/>';
      if(on) out+='<path d="M'+x+' 103.6 L'+(x+2.7)+' 107 L'+x+' 110.4 L'+(x-2.7)+' 107 Z" fill="'+P.hi+'" opacity="'+(0.35+i*0.18)+'" class="on"/>';
    }
    return '<g class="pips">'+out+'</g>';
  }
  /* ---- wings: scalloped feather fans (r376 grammar), parameterised per stage ---- */
  function wings(id,P,cfg,th,fine){
    const px=cfg.px, py=cfg.py;
    const dirp=(a,r)=>[px+Math.cos(a*Math.PI/180)*r, py+Math.sin(a*Math.PI/180)*r];
    function fan(a0,a1,n,R,notch){
      const step=(a1-a0)/(n-1), pts=[];
      for(let f=0;f<n;f++){
        if(f>0) pts.push(dirp(a0+step*(f-0.5), R*notch));
        pts.push(dirp(a0+step*f, R));
      }
      let d='M'+dirp(a0,7).map(v=>v.toFixed(1)).join(' ');
      pts.forEach(p=>{ d+=' L'+p[0].toFixed(1)+' '+p[1].toFixed(1); });
      d+=' L'+dirp(a1,7).map(v=>v.toFixed(1)).join(' ')+' Z';
      return '<path d="'+d+'" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width="'+(0.7*th).toFixed(1)+'" stroke-linejoin="round"/>';
    }
    let w='';
    cfg.ranks.forEach(r=>{ w+=fan(r[0],r[1],r[2],r[3],r[4]); });
    if(fine && cfg.rachis){
      const r0=cfg.ranks[0]; let rch='';
      for(let f=0;f<r0[2];f++){
        const a=r0[0]+((r0[1]-r0[0])/(r0[2]-1))*f;
        rch+='M'+dirp(a,10).map(v=>v.toFixed(1)).join(' ')+' L'+dirp(a,r0[3]-3).map(v=>v.toFixed(1)).join(' ')+' ';
      }
      w+='<path d="'+rch+'" fill="none" stroke="'+P.deep+'" stroke-width=".45" opacity=".55"/>';
    }
    if(cfg.arch){
      w+='<path d="'+cfg.arch+'" fill="none" stroke="url(#'+id+'m)" stroke-width="'+(2*th).toFixed(1)+'" stroke-linecap="round"/>';
      if(fine && cfg.archHi) w+='<path d="'+cfg.archHi+'" fill="none" stroke="'+P.hi+'" stroke-width=".6" opacity=".5"/>';
    }
    return '<g>'+w+'</g><g transform="translate(100 0) scale(-1 1)">'+w+'</g>';
  }
  const WINGS={
    small:{px:60,py:33, ranks:[[-8,50,4,27,.72]]},
    mid:  {px:58,py:32, ranks:[[-16,58,5,35,.73],[-10,48,4,23,.70]], rachis:1,
           arch:'M55 26 Q70 13 88 16'},
    full: {px:57,py:30, ranks:[[-24,70,6,40,.74],[-18,60,5,29,.72],[-12,50,4,19,.70]], rachis:1,
           arch:'M53 22 Q70 6 93 13', archHi:'M55 25 Q70 12 89 15'},
    grand:{px:57,py:30, ranks:[[-28,72,7,42,.75],[-20,62,5,31,.72],[-13,52,4,21,.70]], rachis:1,
           arch:'M53 21 Q70 4 95 11', archHi:'M55 24 Q70 10 91 13'}
  };
  /* ---- banner scroll with fork tails. txt = the tier motto (engraved, drops in
     coarse); no txt = plain ruled scroll; memento adds the shatter cracks —
     the summit's memento-of-beginnings, top bucket only. ---- */
  function banner(id,P,th,fine,txt,memento){
    const x0=21,x1=79,y0=87,y1=96;
    const bf=fine?null:P.lo;   // coarse: solid mid metal so the scroll reads as a bar
    const tail='M'+x1+' '+y0+' L'+(x1+9)+' '+(y0+1.7)+' L'+(x1+4.6)+' 91.5 L'+(x1+8.2)+' '+(y1-1.7)+' L'+x1+' '+y1+' Z';
    const tailL='M'+x0+' '+y0+' L'+(x0-9)+' '+(y0+1.7)+' L'+(x0-4.6)+' 91.5 L'+(x0-8.2)+' '+(y1-1.7)+' L'+x0+' '+y1+' Z';
    let s=eng(id,P,tail,1.1*th,bf)+eng(id,P,tailL,1.1*th,bf)+
      eng(id,P,'M'+x0+' '+y0+' H'+x1+' V'+y1+' H'+x0+' Z',1.4*th,bf);
    if(fine){
      if(txt){
        const fs=txt.length>8?6.2:7.4, ls=txt.length>8?'.35':'.6';
        s+='<text x="50.5" y="94.1" text-anchor="middle" font-family="'+MONO+'" font-weight="800" font-size="'+fs+'" letter-spacing="'+ls+'" fill="'+P.deep+'">'+txt+'</text>'+
           '<text x="50" y="93.6" text-anchor="middle" font-family="'+MONO+'" font-weight="800" font-size="'+fs+'" letter-spacing="'+ls+'" fill="'+P.hi+'">'+txt+'</text>';
      } else {
        s+='<path d="M26 89.8 H74 M26 93.4 H74" stroke="'+P.lo+'" stroke-width=".6" opacity=".75"/>';
      }
      if(memento){
        s+='<path d="M33 86.5 l1.8 3.2 l-2.4 2.8 l1.6 3.8 M67.5 86.5 l-2 3 l2.5 3 l-1.7 3.6" fill="none" stroke="'+P.deep+'" stroke-width=".9"/>'+
           '<path d="M33.7 86.5 l1.8 3.2 l-2.4 2.8 M66.8 86.5 l-2 3 l2.5 3" fill="none" stroke="'+P.hi+'" stroke-width=".45" opacity=".6"/>';
      }
    }
    return s;
  }
  /* ---- finials above the plate: bead → diamond → star (the summit's alone) ---- */
  function finial(id,P,th,fine,kind){
    if(kind==='bead')
      return engLine(id,P,'M50 22 V13',1.8*th)+
        '<circle cx="50" cy="11.6" r="1.9" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".6"/>';
    if(kind==='diamond'){
      let s=engLine(id,P,'M50 22 V6',1.8*th)+
        '<rect x="47.4" y="4.4" width="5.2" height="5.2" transform="rotate(45 50 7)" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".6"/>';
      if(fine) s+='<path d="M48.6 5.6 l2.8 2.8 M48.6 8.4 l2.8 -2.8" stroke="'+P.deep+'" stroke-width=".45" opacity=".6"/>'+
        engArm(id,P,th);
      return s;
    }
    // star — top-bucket Second-Year only
    let s=engLine(id,P,'M50 22 V11',1.8*th)+
      '<path d="M50 0 L51.7 4.3 L56 6 L51.7 7.7 L50 12 L48.3 7.7 L44 6 L48.3 4.3 Z" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".6"/>';
    if(fine) s+='<circle cx="50" cy="6" r="1" fill="'+P.hi+'" opacity=".9"/>'+engArm(id,P,th);
    return s;
  }
  function engArm(id,P,th){ // curled gothic side arms + tip beads
    const a='<path d="M54 16 q7.5 -1.5 10.5 -8" fill="none" stroke="url(#'+id+'m)" stroke-width="'+(1.1*th).toFixed(1)+'" opacity=".85"/>'+
      '<circle cx="65" cy="7.5" r="1" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".4"/>';
    return '<g>'+a+'</g><g transform="translate(100 0) scale(-1 1)">'+a+'</g>';
  }
  /* mantling curls off the shoulders — stage 1 = the upper curl only (the
     half-step between bordure and full mantling), stage 2 = the full set */
  function mantling(id,P,th,stage){
    const up='M73 25 q11 1 14 11 q-5.5 -2.5 -8 -6.5 q1.5 7 6.5 11.5 q-8 -1.5 -11.5 -9';
    const curl=stage>=2 ? up+' M72 51 q8 3 8.5 11 q-5 -3 -7.5 -7' : up;
    return '<g>'+engLine(id,P,curl,1.5*th)+'</g><g transform="translate(100 0) scale(-1 1)">'+engLine(id,P,curl,1.5*th)+'</g>';
  }
  function rivets(id,P){
    return [[31,26],[69,26],[31,47],[69,47]].map(function(q){
      return '<circle cx="'+q[0]+'" cy="'+q[1]+'" r="1.4" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".5"/>';
    }).join('');
  }
  /* ---- the CHARGES — keyboard-warrior devices, engraved in the tier metal ---- */
  const DEV={
    // engraved cell grid, the shield field texture (fine sizes only)
    grid:function(id,P,op){
      return '<g clip-path="url(#'+id+'clip)" opacity="'+op+'">'+
        '<path d="M36 22 V84 M50 22 V84 M64 22 V84 M27 37 H73 M27 52 H73 M27 67 H73" '+
        'stroke="'+P.mid+'" stroke-width=".65" fill="none"/>'+
        '<path d="M36.5 22.5 V83 M27.5 37.5 H72.5" stroke="'+P.hi+'" stroke-width=".3" opacity=".4"/></g>';
    },
    // #REF! — the memento of beginnings, MBA's charge and nowhere else
    ref:function(id,P,fine){
      return '<text x="50.6" y="56.4" text-anchor="middle" font-family="'+MONO+'" font-weight="800" font-size="13" fill="'+P.deep+'">#REF!</text>'+
        '<text x="50" y="55.7" text-anchor="middle" font-family="'+MONO+'" font-weight="800" font-size="13" fill="'+P.hi+'">#REF!</text>';
    },
    // blank keycap as the shield boss
    keycap:function(id,P,fine){
      let s=eng(id,P,'M42 41 H58 Q61 41 61 44 V58 Q61 61 58 61 H42 Q39 61 39 58 V44 Q39 41 42 41 Z',1.5,
        fine?null:P.deep);
      if(fine) s+='<path d="M42.5 44.2 H57.5" stroke="'+P.hi+'" stroke-width=".7" opacity=".6"/>'+
        '<path d="M43 57.8 H57" stroke="'+P.deep+'" stroke-width=".7" opacity=".7"/>';
      else s+='<path d="M42.5 44.8 H57.5" stroke="'+P.hi+'" stroke-width="1.6" opacity=".8"/>';
      return s;
    },
    // #### overflow bars worn as a chevron
    chev:function(id,P,fine){
      let s=eng(id,P,'M30 47 L50 35 L70 47 L70 56 L50 44 L30 56 Z',1.3,fine?null:P.deep);
      if(fine) s+='<path d="M38 44.4 V49.8 M44 40.8 V46.2 M56 40.8 V46.2 M62 44.4 V49.8" stroke="'+P.deep+'" stroke-width="1.7" opacity=".85"/>'+
        '<path d="M30.5 46.6 L50 34.9 L69.5 46.6" fill="none" stroke="'+P.hi+'" stroke-width=".55" opacity=".55"/>';
      else s+='<path d="M30.5 46.4 L50 34.7 L69.5 46.4" fill="none" stroke="'+P.hi+'" stroke-width="1.4" opacity=".8"/>';
      return s;
    },
    // crossed arrow keys — the saltire
    saltire:function(id,P,fine){
      if(!fine)
        return '<path d="M38.5 39.5 L61.5 62.5 M61.5 39.5 L38.5 62.5" fill="none" stroke="'+P.deep+'" stroke-width="7.4" stroke-linecap="round"/>'+
          '<path d="M38.5 39.5 L61.5 62.5 M61.5 39.5 L38.5 62.5" fill="none" stroke="'+P.hi+'" stroke-width="3.6" stroke-linecap="round"/>';
      const key='M46.5 35 H53.5 Q56 35 56 38 V64 Q56 67 53.5 67 H46.5 Q44 67 44 64 V38 Q44 35 46.5 35 Z';
      function baton(rot){
        return '<g transform="rotate('+rot+' 50 51)">'+eng(id,P,key,1.4)+
          '<path d="M50 38.8 L53.8 45.4 H46.2 Z" fill="'+P.deep+'" opacity=".92"/>'+
          '<path d="M46.8 37.4 H53.2" stroke="'+P.hi+'" stroke-width=".6" opacity=".6"/></g>';
      }
      return baton(-45)+baton(45);
    },
    // ↵ enter-return — the keystroke that commits the model
    enter:function(id,P,fine){
      if(!fine)
        return '<path d="M62.5 37.5 V53 H48" fill="none" stroke="'+P.deep+'" stroke-width="7.6" stroke-linecap="round" stroke-linejoin="round"/>'+
          '<path d="M62.5 37.5 V53 H48" fill="none" stroke="'+P.hi+'" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/>'+
          '<path d="M49.5 44.5 L35.5 53 L49.5 61.5 Z" fill="'+P.hi+'" stroke="'+P.deep+'" stroke-width="1.6" stroke-linejoin="round"/>';
      return engLine(id,P,'M62.5 37.5 V53 H46.5',3.2)+
        eng(id,P,'M47.5 46 L36 53 L47.5 60 Z',1.2,'url(#'+id+'m)')+
        '<path d="M61.3 39 V51.6" stroke="'+P.hi+'" stroke-width=".6" opacity=".6"/>';
    },
    // crossed swords, keycap pommels — the desk militant
    swords:function(id,P,fine){
      if(!fine)
        return '<path d="M63.5 37.5 L36.5 64.5 M36.5 37.5 L63.5 64.5" fill="none" stroke="'+P.deep+'" stroke-width="7.4" stroke-linecap="round"/>'+
          '<path d="M63.5 37.5 L36.5 64.5 M36.5 37.5 L63.5 64.5" fill="none" stroke="'+P.hi+'" stroke-width="3.4" stroke-linecap="round"/>'+
          '<circle cx="37.6" cy="63.4" r="3.4" fill="'+P.hi+'" stroke="'+P.deep+'" stroke-width="1.4"/>'+
          '<circle cx="62.4" cy="63.4" r="3.4" fill="'+P.hi+'" stroke="'+P.deep+'" stroke-width="1.4"/>';
      function sword(rot){
        return '<g transform="rotate('+rot+' 50 51)">'+
          eng(id,P,'M50 31 L52.4 36.5 L52.4 56.5 L47.6 56.5 L47.6 36.5 Z',1.2)+          // blade
          eng(id,P,'M43.2 56.5 H56.8 V59.4 H43.2 Z',1.1)+                                // crossguard
          eng(id,P,'M48.3 59.4 H51.7 V64.6 H48.3 Z',1)+                                  // grip
          eng(id,P,'M46.2 64.8 H53.8 Q55.4 64.8 55.4 66.4 V69.6 Q55.4 71.2 53.8 71.2 H46.2 Q44.6 71.2 44.6 69.6 V66.4 Q44.6 64.8 46.2 64.8 Z',1.1)+  // keycap pommel
          '<path d="M50 34 V54.5" stroke="'+P.deep+'" stroke-width=".6" opacity=".6"/>'+ // fuller
          '<path d="M46.4 66.4 H53.6" stroke="'+P.hi+'" stroke-width=".55" opacity=".6"/></g>';
      }
      return sword(-45)+sword(45);
    },
    // Σ — reserved: the ladder is allowed exactly ONE sigma (Wolf), and the
    // summit gem carries it. Nothing else may call this.
    sigma:function(id,P,fine,scale,cy){
      const k=scale||1, cx=50; cy=cy||51.5;
      const d='M'+(cx+10*k)+' '+(cy-11*k)+' H'+(cx-10*k)+' L'+(cx+2*k)+' '+cy+' L'+(cx-10*k)+' '+(cy+11*k)+' H'+(cx+10*k);
      let s='<path d="'+d+'" fill="none" stroke="'+P.deep+'" stroke-width="'+(fine?5.6:6.6)+'" stroke-linecap="square" stroke-linejoin="miter"/>'+
        '<path d="'+d+'" fill="none" stroke="'+(fine?('url(#'+id+'m)'):P.hi)+'" stroke-width="'+(fine?3.6:4)+'" stroke-linecap="square" stroke-linejoin="miter"/>';
      if(fine) s+='<path d="M'+(cx+9.4*k)+' '+(cy-12.2*k)+' H'+(cx-9*k)+'" stroke="'+P.hi+'" stroke-width=".7" opacity=".65"/>';
      return s;
    },
    // $ chief — F4, the absolute reference (VP's mark of the anchor; fine only)
    lock:function(id,P,fine){
      if(!fine) return '';
      return eng(id,P,'M50 28.6 A5.6 5.6 0 1 1 49.9 28.6 Z',1.1)+
        '<text x="50.4" y="37.6" text-anchor="middle" font-family="'+MONO+'" font-weight="800" font-size="8" fill="'+P.deep+'">$</text>'+
        '<text x="50" y="37.2" text-anchor="middle" font-family="'+MONO+'" font-weight="800" font-size="8" fill="'+P.hi+'">$</text>';
    },
    // the bull — kept for the corner office, re-cut in engraved metal
    bull:function(id,P,fine){
      const horn=function(s){ return '<path d="M'+(s*-9.5)+' -6 Q'+(s*-21.5)+' -8 '+(s*-20.5)+' -22.5 Q'+(s*-13)+' -16 '+(s*-7.5)+' -11.5 Z" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width="1"/>'; };
      let s='<g transform="translate(50 52.5) scale(.88)">'+horn(1)+horn(-1)+
        '<path d="M-10.5 -12.5 L10.5 -12.5 L14 -5 L8.5 4 L5 13 L-5 13 L-8.5 4 L-14 -5 Z" fill="none" stroke="'+P.deep+'" stroke-width="3.4" stroke-linejoin="round"/>'+
        '<path d="M-10.5 -12.5 L10.5 -12.5 L14 -5 L8.5 4 L5 13 L-5 13 L-8.5 4 L-14 -5 Z" fill="'+(fine?('url(#'+id+'p)'):P.deep)+'" stroke="url(#'+id+'m)" stroke-width="1.4" stroke-linejoin="round"/>'+
        '<path d="M-8.7 -4.8 L-3.2 -2.6 L-3.8 -.4 L-8.7 -2.2 Z" fill="'+P.hi+'" opacity=".92"/>'+
        '<path d="M8.7 -4.8 L3.2 -2.6 L3.8 -.4 L8.7 -2.2 Z" fill="'+P.hi+'" opacity=".92"/>'+
        '<path d="M-7.5 5 Q0 8 7.5 5 L5 13 Q0 15.2 -5 13 Z" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".9"/>';
      if(fine) s+='<path d="M-5 -12.5 Q0 -9 5 -12.5" fill="none" stroke="'+P.deep+'" stroke-width=".9" opacity=".8"/>'+
        '<ellipse cx="-3.1" cy="9.6" rx="1.3" ry="1.8" fill="'+P.deep+'"/>'+
        '<ellipse cx="3.1" cy="9.6" rx="1.3" ry="1.8" fill="'+P.deep+'"/>'+
        '<path d="M-9.5 -13.5 H9.5" stroke="'+P.hi+'" stroke-width=".7" opacity=".55"/>';
      return s+'</g>';
    },
    // summit charge: faceted lozenge gem bearing the sigma — the rocket stays dead
    gem:function(id,P,fine){
      let s=eng(id,P,'M50 33 L65 51.5 L50 70 L35 51.5 Z',1.5,fine?null:P.deep);
      if(fine) s+='<path d="M50 33 V70 M35 51.5 H65" stroke="'+P.deep+'" stroke-width=".55" opacity=".6"/>'+
        '<path d="M49 36.6 L52.6 41 L49 45.5" fill="none" stroke="'+P.hi+'" stroke-width=".6" opacity=".7"/>';
      s+=DEV.sigma(id,P,fine,0.72,51.5);
      return s;
    }
  };
  /* tier table: the charge + grid-field opacity (+ VP's $ chief) */
  const TIERS=[
    {chg:'ref',    op:.6},            // MBA Associate — the floor remembers
    {chg:'keycap', op:.55},           // Candidate — the blank key
    {chg:'chev',   op:.55},           // Summer Analyst — #### overflow
    {chg:'saltire',op:.42},           // First-Year — crossed arrow keys
    {chg:'enter',  op:.42},           // Associate — ↵ ships the model
    {chg:'swords', op:.36, lock:1},   // VP — crossed swords under the $ chief
    {chg:'bull',   op:.3},            // MD — the corner office
    {chg:'gem',    op:.3}             // Second-Year — the gem bearing the Σ
  ];
  /* r377 MOTTOS — fixed per-tier scroll text (Wolf: no custom-title system,
     no desk jargon; short playful Excel-culture swagger, escalating gravitas,
     the summit dignified). One per tier; only tiers whose dress includes the
     banner (First-Year up) ever show theirs — the lower three are reserved
     against future dress. Text drops in coarse mode. The summit's scroll
     stays plain until top bucket, where the memento banner reads CLEAN over
     the shatter cracks — the model survived its #REF! beginnings. */
  /* r378 (Wolf): quoted #REF! · COOKED · the locked ref moves to First-Year · LOCKED IN ·
     SHEET SHOW · GLAZED at the summit */
  const MOTTO=['\u201c#REF!\u201d','ESC ARTIST','COOKED','$A$1','LOCKED IN','BALDING','CTRL FREAK','GLAZED'];   /* r379 (Wolf): the Candidate escaped, the VP is balding */
  /* r377 BUCKET-SCALED FURNITURE — the dress grid. Row = tier, column = bucket
     (bottom/middle/top; no-bucket renders the middle column). Keys: r rivets ·
     bd bordure · m mantling stage (1 upper curl, 2 full) · b banner ·
     plain (scroll without motto) · mem memento cracks · w wing stage ·
     f finial. Top column is exactly the Wolf-approved board ladder; each
     column steps down one stage so escalation reads incremental and
     monotonic inside every tier. Top-bucket Second-Year alone gets the
     grand spread + star + memento banner. */
  const DRESS=[
    [ {},                  {r:1},                        {r:1} ],
    [ {},                  {r:1},                        {bd:1} ],
    [ {bd:1},              {bd:1,m:1},                   {m:2} ],
    [ {bd:1,m:1},          {m:2},                        {b:1} ],
    [ {b:1},               {b:1,m:2},                    {b:1,w:'small'} ],
    [ {b:1,w:'small'},     {b:1,w:'mid'},                {b:1,w:'mid',f:'bead'} ],
    [ {b:1,w:'mid'},       {b:1,w:'full'},               {b:1,w:'full',f:'diamond'} ],
    [ {b:1,plain:1},       {b:1,plain:1,w:'mid',f:'diamond'}, {b:1,mem:1,w:'grand',f:'star'} ]
  ];
  function svgOpen(sz,bk,max){
    const vb = bk ? '0 0 100 114' : '0 0 100 100';
    const h = bk ? Math.round(sz*1.14) : sz;
    /* r374: bucketed crests carry .rk-pips so the shared CSS (nav.css) can re-center
       the CREST square on the text line — the pip zone (y 100-114) hangs below it.
       Without the class a bucketed emblem flex-centers on its FULL box and the crest
       rides ~6% high next to an unbucketed one of the same size. Class only — art
       and API unchanged. */
    return '<svg class="rank-emblem'+(bk?' rk-pips':'')+(max?' emblem-max':'')+'" viewBox="'+vb+'" width="'+sz+'" height="'+h+'" aria-hidden="true">';
  }
  window.RANK_COLORS={'MBA Associate':[IRON.mid,IRON.hi],'Candidate':[BRONZE.mid,BRONZE.hi],
    'Summer Analyst':[SILVER.mid,SILVER.hi],'First-Year Analyst':[GOLD.mid,GOLD.hi],
    'Associate':[AMET.mid,AMET.hi],'VP':[PLAT.mid,PLAT.hi],'MD':[CRIM.mid,CRIM.hi],
    'Second-Year Analyst':[DIAM.mid,DIAM.hi,'#ffd968']};
  return function(tierName, size, bucket){
    size = size || 16;
    const bk = typeof bucket==='number' ? bucket
      : bucket==='Top Bucket' ? 3 : bucket==='Middle Bucket' ? 2 : bucket==='Bottom Bucket' ? 1 : 0;
    if(tierName==='Unranked'){
      return svgOpen(size,0,false)+
        '<path d="M28 21 L72 21 L79 28 L79 72 L72 79 L28 79 L21 72 L21 28 Z" fill="none" stroke="#7c828e" stroke-width="2.4" stroke-linejoin="round" stroke-dasharray="5 4"/>'+
        '<path d="M43 43 L57 57 M57 43 L43 57" stroke="#7c828e" stroke-width="3" stroke-linecap="round"/></svg>';
    }
    const i = window.RANK_EMBLEM_IDX[tierName] ?? 0;
    const P=PALS[i], T=TIERS[i], D=DRESS[i][(bk||2)-1], id='rk'+(UID++);
    const fine=size>=28, th=fine?1:1.6, hot=bk===3, warm=bk===2;
    let s=svgOpen(size,bk,false)+defs(id,P);
    // furniture BEHIND the plate
    let orn='';
    if(D.w) orn+=wings(id,P,WINGS[D.w],th,fine);
    if(D.m) orn+=mantling(id,P,th,D.m);
    /* r381 (Wolf): banner scrolls retired — the crests stand on their iconography,
       and the freed space lets the hero renders run larger */
    if(orn) s+='<g class="ornament">'+orn+'</g>';
    if(D.f) s+='<g class="jewel">'+finial(id,P,th,fine,D.f)+'</g>';
    // the plate — coarse rows brighten to the solid mid metal so charges cut dark
    s+='<g class="frame"><path d="'+SH+'" fill="none" stroke="'+P.deep+'" stroke-width="6" stroke-linejoin="round"/>'+
       '<path d="'+SH+'" fill="'+(fine?('url(#'+id+'p)'):P.lo)+'" stroke="url(#'+id+'m)" stroke-width="3.4" stroke-linejoin="round"/></g>';
    // field texture: the grid + the top polish hairline
    if(fine) s+='<circle cx="50" cy="50" r="27" fill="url(#'+id+'c)"/>'+DEV.grid(id,P,T.op)+
      '<path d="M29.5 24 H70.5" stroke="#ffffff" stroke-width="1" opacity=".4"/>';
    // furniture ON the plate
    let orn2='';
    if(D.r && fine) orn2+=rivets(id,P);
    if(D.bd) orn2+='<path d="'+SHIN+'" fill="none" stroke="url(#'+id+'m)" stroke-width="'+(1.3*th).toFixed(1)+'"/>'+
      (fine?'<path d="'+SHIN+'" fill="none" stroke="'+P.deep+'" stroke-width=".5" opacity=".6" transform="translate(0 .9)"/>':'');
    if(orn2) s+='<g class="ornament">'+orn2+'</g>';
    // the charge (+ VP's $ chief)
    s+='<g class="glyph">'+(T.lock?DEV.lock(id,P,fine):'')+DEV[T.chg](id,P,fine)+'</g>';
    // bucket heat: hairline rim
    if(hot)  s+='<path d="'+SH+'" fill="none" stroke="'+P.hi+'" stroke-width="1" opacity=".85" stroke-linejoin="round"/>';
    if(warm) s+='<path d="'+SH+'" fill="none" stroke="'+P.hi+'" stroke-width=".8" opacity=".4" stroke-linejoin="round"/>';
    return s+pips(id,P,bk)+'</svg>';
  };
})();

window.hkLevelRing = function(lvl, pct, size){
  size=size||56;
  const r=24, C=2*Math.PI*r, off=C*(1-Math.max(0,Math.min(100,pct))/100);
  return '<svg viewBox="0 0 56 56" width="'+size+'" height="'+size+'" aria-hidden="true">'+
    '<circle cx="28" cy="28" r="'+r+'" fill="none" stroke="var(--surface2)" stroke-width="5"/>'+
    '<circle cx="28" cy="28" r="'+r+'" fill="none" stroke="var(--accent)" stroke-width="5" stroke-linecap="round" '+
      'stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'" transform="rotate(-90 28 28)">'+
      /* r85: the fitness-app sweep — SMIL animates on mount, no wiring anywhere */
      '<animate attributeName="stroke-dashoffset" from="'+C.toFixed(1)+'" to="'+off.toFixed(1)+'" dur="0.9s" '+
        'calcMode="spline" keySplines="0.2 0.8 0.2 1" fill="freeze"/>'+
      '</circle>'+
    /* r227 (Wolf): the ring shows just the level number, ADORNED — big, bold, accent —
       not a plain "1" stacked over a redundant "LVL" (the "LEVEL n" label sits below the ring). */
    '<text x="28" y="34.5" text-anchor="middle" font-family="JetBrains Mono,ui-monospace,monospace" font-weight="800" font-size="'+(String(lvl).length>1?19:23)+'" fill="var(--accent)" style="paint-order:stroke" stroke="var(--surface2)" stroke-width="0.5">'+lvl+'</text></svg>';
};
window.hkLevelChip = function(lvl, size){
  size=size||22;
  /* r230 (Wolf): FLAT — no drop-shadow / dark base / glow. A clean tier-coloured tile
     with a white numeral, favicon-sleek. More colour bands than the legacy 5. */
  const T = lvl>=25?'#8b5cf6' : lvl>=20?'#3b82f6' : lvl>=15?'#e0a52a' : lvl>=10?'#8b93a1' : lvl>=5?'#c07a3c' : '#5f6672';
  return '<svg viewBox="0 0 24 24" width="'+size+'" height="'+size+'" aria-hidden="true" style="vertical-align:-4px">'+
    '<rect x="2.5" y="3" width="19" height="18" rx="5" fill="'+T+'"/>'+
    '<text x="12" y="16.1" text-anchor="middle" font-family="JetBrains Mono,ui-monospace,monospace" font-weight="800" font-size="'+(String(lvl).length>2?8.5:11)+'" fill="#fff">'+lvl+'</text></svg>';
};

/* ---- shared rank/level math for account.html + stats.html (older pages keep
   their documented duplicates — sync all on threshold changes) ---- */
window.HK_RANK = {
  /* THE LADDER, desk-culture edition. MBA Associate is the floor (they mean well),
     the MD can't use Excel, and the Second-Year Analyst is the true final boss.
     pct thresholds live on the SHRUNK rating scale (see ratingOf): each equals the
     advertised raw performance at that tier's gate att: rating=(att*raw+K/2)/(att+K). */
  TIERS:[
    /* r377 (Wolf): tier chips follow the shifted metal ladder — Candidate wears
       bronze, Summer silver, First-Year gold, Associate the new amethyst; VP
       keeps platinum. .tier-unranked returns to meaning ONLY unranked. */
    {name:'MBA Associate',       cls:'tier-mba',      att:0,  pct:9,    req:'everyone starts here \u2014 yes, everyone'},
    {name:'Candidate',           cls:'tier-bronze',   att:5,  pct:1.01, req:'5 drills attempted, any placement'},
    {name:'Summer Analyst',      cls:'tier-silver',   att:8,  pct:0.53, req:'8 drills \u00b7 top 55% avg placement'},
    {name:'First-Year Analyst',  cls:'tier-gold',     att:10, pct:0.375, req:'10 drills \u00b7 top 30%'},
    {name:'Associate',           cls:'tier-amethyst', att:12, pct:0.31, req:'12 drills \u00b7 top 22%'},
    {name:'VP',                  cls:'tier-platinum', att:14, pct:0.255, req:'14 drills \u00b7 top 15%'},
    {name:'MD',                  cls:'tier-crimson',  att:16, pct:0.195, req:'16 drills \u00b7 top 8% \u2014 the corner office'},
    {name:'Second-Year Analyst', cls:'tier-diamond',  att:18, pct:0.15, req:'18 drills \u00b7 top 3% \u2014 the true final boss'},
  ],
  PROVISIONAL_W: 6,   // weighted-board exposure needed before ranks above Summer Analyst unlock
  tierOf(avgPct, att, wsum){
    const T=this.TIERS;
    if(avgPct===null || (att||0)<5) return {...T[0], i:0, bucket:null, full:T[0].name, provisional:false};   // MBA Associate — the floor
    let t={...T[1], i:1};
    for(let i=T.length-1;i>=1;i--){ if(att>=T[i].att && avgPct<=T[i].pct){ t={...T[i], i}; break; } }
    // PLACEMENT SEASON-ZERO RULE: until you've faced enough real competition
    // (weighted boards \u2265 PROVISIONAL_W — small fields count fractionally), rank is
    // capped at Summer Analyst and tagged provisional. Everyone starts low and
    // EARNS altitude as the field fills in — no day-one Second-Years off 3-player boards.
    let provisional=false;
    if(wsum!==undefined && wsum!==null && wsum < this.PROVISIONAL_W && t.i>2){
      t={...T[2], i:2}; provisional=true;   // capped at Summer Analyst until real exposure
    } else if(wsum!==undefined && wsum!==null && wsum < this.PROVISIONAL_W){ provisional=true; }
    t.provisional=provisional;
    // BUCKETS — comp-review language. Your position inside the tier's percentile band,
    // split in thirds: Top / Middle / Bottom Bucket. The summit tier buckets within 0–5%.
    const hi = t.pct>1 ? 1 : t.pct;                      // band ceiling (worse pct)
    const lo = t.i+1 < T.length ? T[t.i+1].pct : 0;       // band floor (better pct)
    const span = Math.max(1e-9, hi-lo);
    const pos = Math.min(1, Math.max(0, (avgPct-lo)/span));  // 0 = best in band
    t.bucket = pos<=1/3 ? 'Top Bucket' : (pos<=2/3 ? 'Middle Bucket' : 'Bottom Bucket');
    t.full = t.name+' \u00b7 '+t.bucket+(provisional?' \u00b7 provisional':'');
    // r321 (Wolf) \u2014 LP-style progression transparency. Model-safe: no points system, just how far
    // the live avgPct sits across THIS tier's band. promote = 0..1 toward the next tier's gate.
    t.pos = pos;                                             // 0 = best in band (at the promotion line)
    t.promote = t.i+1 < T.length ? Math.round((1-pos)*100) : 100;   // % of the way to the next tier
    t.nextName = t.i+1 < T.length ? T[t.i+1].name : null;   // null at the summit
    t.provisional = provisional;
    return t;
  },
  /* r151: THE CANONICAL LEVEL CURVE — six drifted copies (nav.js, leaderboard,
     index ×3) now delegate here, same consolidation XP got in r116. Curve softened
     for the dopamine drip (Wolf): 150/300/450 to L4, then FLAT 600 per level —
     the old 150×n triangular made L10+ a multi-week desert. Levels only move UP
     under the new curve (cheaper everywhere), so no one wakes up demoted. */
  levelOf(xp){ let lvl=1, need=150, floor=0;
    while(xp>=floor+need){ floor+=need; lvl++; need=Math.min(150*lvl, 600); }
    return {lvl, into:xp-floor, need, pct:Math.min(100,Math.round(100*(xp-floor)/need))}; },
  /* XP v4 (r116, Wolf-approved — "the trading day"): first-ever solve keeps the big
     spine (50, +15 advanced); repeat decay runs PER DRILL PER UTC DAY (15/10/7/5,
     floor 2) and RESETS at midnight — the catalog is renewable, breadth beats spam;
     +25 warm-up for the first solve of each active day. Lifetime decay (v2/v3)
     RETIRED: it paid loyal players worst. ONE implementation — every page delegates
     here (r116 killed four drifted copies). Runs need created_at for day buckets;
     legacy rows without it share one bucket (history reprices in beta). */
  computeXP(myRuns, pl, mySessions){
    const PARS=(typeof window!=='undefined'&&window.HOTKEY_PARS)||{};
    const LADDER=[15,10,7,5];
    const buckets={}, firstEver={}, days={};
    let xp=0;
    (myRuns||[]).forEach(r=>{
      const ch=r.challenge||'';
      const day=String(r.created_at||'').slice(0,10)||'x';
      days[day]=1;
      if(ch.indexOf('challenge-')===0){ xp+=50; return; }   /* r371: the Daily Challenge pays a flat 50 server-side (matches the trainer estimate) */
      if(ch.indexOf('daily-')===0){ xp+=30; return; }   /* legacy morning-sheet runs keep their old value */
      if(ch.indexOf('wk-')===0){ xp+=25; return; }
      const k=day+'|'+ch;
      const nthToday=(buckets[k]=(buckets[k]||0)+1);
      xp += nthToday<=LADDER.length ? LADDER[nthToday-1] : 2;
      if(!firstEver[ch]){ firstEver[ch]=1; xp += (50+((PARS[ch]||0)>=55?15:0)) - LADDER[0]; }
    });
    xp += 25*Object.keys(days).length;
    (mySessions||[]).forEach(s=>{ xp += (s&&s.mode==='marathon')?20:10; });
    return xp + 25*((pl&&pl.t10)||0) + 100*((pl&&pl.pod)||0) + 250*((pl&&pl.crowns)||0);
  },
  /* RATING v2 — a shrunk, size-weighted average placement.
     Fixes two exploits of the naive average:
     1. FEW-BOARDS SNIPING: someone fast on 1-2 boards shouldn't outrank a broad
        competitor. Every rating starts from a prior of 0.5 (middle of the field,
        weight K=6 "virtual boards") and your real boards pull it toward your true
        level. Two crowns alone → (2*0 + 6*0.5)/(2+6) = 0.375, solidly mid — you
        EARN the summit by being good in many places.
     2. TINY-FIELD NOISE: placing 1st of 2 says less than 4th of 40. Each board's
        weight scales with field size: w = log2(N+1)/log2(9), capped at 1 (full
        weight at 8+ players). The system self-adapts as the player count grows —
        no thresholds to retune at 10 vs 10,000 users.
     Percentile itself is also small-field-fair: idx/(N-1) when N>1 (best=0,
     worst=1), so 1st of 2 = 0.0 but carries little weight. */
  RATING_K: 6,
  ratingOf(entries){
    // entries: [{pct, n}] — placement percentile + field size per board
    const K=this.RATING_K; let wsum=0, s=0;
    (entries||[]).forEach(e=>{ const w=Math.min(1, Math.log2((e.n||1)+1)/Math.log2(9));
      wsum+=w; s+=w*e.pct; });
    return (s + K*0.5) / (wsum + K);
  },
  // per-user placements from a full best-sorted runs list (mouse_used=false, time asc)
  /* r371: board-bonus counts (t10/pod/crowns) from the same dedup the boards use —
     one path, so every computeXP caller can pass a REAL pl instead of dropping bonuses */
  boardCounts(runs, meId, menuOrder){
    const per={}; menuOrder.forEach(k=>per[k]=[]);
    const seen={};
    (runs||[]).forEach(x=>{ if(per[x.challenge]===undefined) return; const key=x.challenge+'|'+x.user_id;
      if(seen[key]) return; seen[key]=1; per[x.challenge].push(x); });
    let t10=0,pod=0,crowns=0;
    Object.values(per).forEach(list=>{ const i=list.findIndex(x=>x.user_id===meId);
      if(i<0) return; if(i===0) crowns++; if(i<3) pod++; if(i<10) t10++; });
    return {t10:t10,pod:pod,crowns:crowns};
  },
  standing(runs, meId, menuOrder){
    const per={}; menuOrder.forEach(k=>per[k]=[]);
    const seen={};
    runs.forEach(x=>{ if(per[x.challenge]===undefined) return; const key=x.challenge+'|'+x.user_id;
      if(!seen[key]){ seen[key]=true; per[x.challenge].push(x); } });
    let att=0,crowns=0,pod=0,t10=0; const entries=[];
    menuOrder.forEach(k=>{ const b=per[k]; const idx=b.findIndex(r=>r.user_id===meId);
      if(idx>=0){ att++; entries.push({pct: b.length>1 ? idx/(b.length-1) : 0, n:b.length});
        if(idx===0)crowns++; if(idx<3)pod++; if(idx<10)t10++; } });
    const rating = att ? this.ratingOf(entries) : null;
    const wsum = entries.reduce((a,e)=>a+Math.min(1, Math.log2((e.n||1)+1)/Math.log2(9)),0);
    return {att, avgPct:rating, rawAvg:att?entries.reduce((a,e)=>a+e.pct,0)/att:null,
            crowns, pod, t10, per, entries, wsum};
  }
};

/* ---- r373 PROFILE FRAME SYSTEM — earned card frames (Wolf-approved board v2) ----
   The flair column graduates from three flat borders to a suite of EARNED frames.
   A frame = a nav.css class (.hk-frame-<id>: border/background/shadow layers) plus
   optional ornament HTML (corner SVGs / medallion / tier tab) injected as the card's
   FIRST child. Ornaments are absolutely positioned and overflow the card edge on
   purpose — they never move layout. Unlocks are checked ONLY at pick time
   (account.html); display trusts the stored profiles.flair value. Legacy flair
   values (gold/emerald/holo) keep their old .flair-* classes on existing rows.
   r377 NOTE: the crest metal ladder shifted down one rung (Candidate bronze,
   Summer silver, First-Year gold, Associate amethyst) but the plaque earns
   below were NOT remapped — a bronze plaque still unlocks at Summer Analyst,
   whose crest now wears silver. Changing unlock thresholds is a progression
   call, not an art call; the metal-to-tier re-pairing (and whether an
   amethyst/emerald plaque joins the suite) awaits Wolf. */
window.HK_FRAMES = [
  {id:'engraved',      name:'Engraved',        tier:'common',
   desc:'steel certificate corners + rosettes',       earn:'reach LVL 5'},
  /* r376: plaque descs follow the screw → gemset corner swap (art round 2) */
  {id:'plaque-bronze', name:'Bronze Plaque',   tier:'rare',
   desc:'beveled bronze + gemset corners',            earn:'reach Candidate'},
  {id:'plaque-silver', name:'Silver Plaque',   tier:'rare',
   desc:'beveled silver + gemset corners',            earn:'reach Summer Analyst'},
  {id:'plaque-gold',   name:'Gold Plaque',     tier:'rare',
   desc:'beveled gold + gemset corners',              earn:'reach First-Year Analyst'},
  {id:'plaque-plat',   name:'Platinum Plaque', tier:'rare',
   desc:'beveled platinum + gemset corners',          earn:'reach VP'},
  {id:'plaque-diam',   name:'Diamond Plaque',  tier:'rare',
   desc:'beveled diamond + gemset corners',           earn:'reach Second-Year Analyst'},
  {id:'foil',          name:'Foil',            tier:'epic',
   desc:'conic sheen + fan corners',                  earn:'win a Daily Challenge or earn a certificate'},
  {id:'heraldic',      name:'Heraldic',        tier:'legendary',
   desc:'crimson filigree + lozenge medallion',       earn:'Daily Dynasty (5 daily wins) or Triple Crown (3 certificates)'},
  {id:'charter',       name:'Charter Analyst', tier:'rare',
   desc:'steel-navy laurels — the beta-tester class', earn:'account created during the beta'},
  {id:'bone',          name:'Bone',            tier:'egg',
   desc:'subtle off-white coloring, tasteful thickness', earn:'post a run at perfect efficiency — every keystroke optimal'},
  /* ---- r385 CARD SKINS (Wolf board) — full-interior title skins. Each themes the
     whole card (interior + border + a top-notch title + optional particle animation),
     not just the border. hkFrameOrnaments emits the notch tab + fx canvas; nav.css
     carries the interior + border + name treatment; hkInitCardFx drives the canvas. ---- */
  {id:'circuit',    name:'Circuit',      tier:'epic',
   desc:'neural grid wash + glowing chips',            earn:'clear a full rapid-fire set'},
  {id:'neon',       name:'Neon',         tier:'epic',
   desc:'cyberpunk magenta/cyan glow',                 earn:'hold a 10-win daily streak'},
  {id:'blueprint',  name:'Blueprint',    tier:'rare',
   desc:'drafting grid + dashed chips',                earn:'reach First-Year Analyst'},
  {id:'crt',        name:'CRT Terminal', tier:'rare',
   desc:'phosphor scanlines, terminal green',          earn:'complete the reference tour'},
  {id:'constellation', name:'Constellation', tier:'epic',
   desc:'animated starfield + Cinzel name',            earn:'reach Associate'},
  {id:'vaporwave',  name:'Vaporwave',    tier:'epic',
   desc:'retro synth sunset + grid horizon',           earn:'reach Summer Analyst'},
  {id:'terminal',   name:'Terminal',     tier:'epic',
   desc:'bloomberg amber + live ticker',               earn:'finish a timed sprint set'},
  {id:'pro',        name:'PRO · Cosmic', tier:'epic',
   desc:'deep space + gilt border',                    earn:'upgrade to PRO'},
  {id:'noir',       name:'Noir',         tier:'legendary',
   desc:'murdered-out black — zero color',             earn:'reach a top rank (VP or above)'},
  {id:'frostbite',  name:'Frostbite',    tier:'legendary',
   desc:'glacial ice + drifting snow',                 earn:'post a perfect-efficiency run'},
  {id:'molten',     name:'Molten',       tier:'legendary',
   desc:'magma cracks + rising embers',                earn:'hold a 30-day streak (5 daily wins)'},
  {id:'founder',    name:'Founder',      tier:'legendary',
   desc:'holographic foil — first 200 PRO, serialized', earn:'charter / first-200 PRO member'},
];
/* u = {lvl, tierBest, dailyWins, certs, charter, perfectRun}. tierBest is a
   HK_RANK.TIERS index (highest tier ever DISPLAYED — nav.js persists it into
   hk_ach_flags.tierBest on every rank fetch; hydration maxes it across devices). */
window.hkFrameUnlocked = function(id, u){
  u = u || {};
  const tb = u.tierBest|0;
  switch(id){
    case 'engraved':      return (u.lvl|0) >= 5;
    /* r380 (Wolf, option A): unlocks shifted down a rung so the plaque metal always
       matches the crest metal the r377 ladder gave that tier */
    case 'plaque-bronze': return tb >= 1;   // Candidate — bronze crest, bronze plaque
    case 'plaque-silver': return tb >= 2;   // Summer Analyst
    case 'plaque-gold':   return tb >= 3;   // First-Year Analyst
    case 'plaque-plat':   return tb >= 5;   // VP (MD is a higher rung — counts too)
    case 'plaque-diam':   return tb >= 7;   // Second-Year Analyst — the true final boss
    case 'foil':          return (u.dailyWins|0) >= 1 || (u.certs|0) >= 1;
    case 'heraldic':      return (u.dailyWins|0) >= 5 || (u.certs|0) >= 3;
    case 'charter':       return !!u.charter;
    case 'bone':          return !!u.perfectRun;
    /* r385 card skins — earn thresholds off the same signals (lvl/tierBest/dailyWins/
       certs/charter/perfectRun). Display always trusts stored flair; this gates PICKING. */
    case 'circuit':       return (u.dailyWins|0) >= 1 || (u.lvl|0) >= 8;
    case 'neon':          return (u.dailyWins|0) >= 10;
    case 'blueprint':     return tb >= 3;
    case 'crt':           return (u.lvl|0) >= 12;
    case 'constellation': return tb >= 4;
    case 'vaporwave':     return tb >= 2;
    case 'terminal':      return (u.certs|0) >= 1;
    case 'pro':           return tb >= 6 || !!u.pro;
    case 'noir':          return tb >= 5;
    case 'frostbite':     return !!u.perfectRun;
    case 'molten':        return (u.dailyWins|0) >= 5;
    case 'founder':       return !!u.charter || !!u.founder;
  }
  return false;
};
/* ---- r387: flair carries the whole card loadout, not just the frame. Historically
   profiles.flair held a bare frame id ("molten"). To let the Profile customizer
   persist the extended loadout (which elements show, which stats to highlight, the
   equipped title) WITHOUT a schema migration, flair may ALSO be a JSON blob:
     {"f":"molten","sh":{"rank":1,"level":1,"streak":1,"desk":0},"st":["solves","crowns","streak"],"ti":"pro"}
   hkFlair(raw) normalizes EITHER shape to {frame, show, stats, title}. Every legacy
   read site that only wants the frame stays correct by reading .frame — the bare-id
   path is preserved verbatim. hkFlairPack() round-trips: it emits a bare id when no
   extended prefs are set (keeps the column clean + old readers happy) and JSON only
   when the user has actually customized beyond the frame. Both are dependency-free. */
window.HK_STAT_KEYS = ['solves','crowns','streak','podiums','top10s','boards','accuracy'];
window.hkFlair = function(raw){
  const FR = window.HK_FRAMES || [];
  const validFrame = id => id && /^[a-z0-9_-]{1,32}$/i.test(id) && FR.some(f=>f.id===id) ? id : null;
  const def = { frame:null, show:{rank:true, level:true, streak:true, desk:false}, stats:[], title:null };
  if(raw==null || raw==='') return def;
  const s = String(raw).trim();
  if(s.charAt(0) === '{'){
    let o=null; try{ o=JSON.parse(s); }catch(e){ o=null; }
    if(o && typeof o==='object'){
      const show = Object.assign({}, def.show);
      if(o.sh && typeof o.sh==='object'){ ['rank','level','streak','desk'].forEach(k=>{ if(k in o.sh) show[k]=!!o.sh[k]; }); }
      const stats = Array.isArray(o.st) ? o.st.filter(k=>window.HK_STAT_KEYS.indexOf(k)>=0).slice(0,3) : [];
      const title = (typeof o.ti==='string' && /^[a-z0-9_-]{1,32}$/i.test(o.ti)) ? o.ti : null;
      return { frame: validFrame(o.f), show, stats, title };
    }
    return def;
  }
  // legacy bare frame id
  return { frame: validFrame(s), show: Object.assign({}, def.show), stats: [], title: null };
};
window.hkFlairPack = function(l){
  l = l || {};
  const frame = (l.frame && /^[a-z0-9_-]{1,32}$/i.test(l.frame)) ? l.frame : null;
  const show = l.show || {};
  const stats = Array.isArray(l.stats) ? l.stats.filter(k=>(window.HK_STAT_KEYS||[]).indexOf(k)>=0).slice(0,3) : [];
  const title = (l.title && /^[a-z0-9_-]{1,32}$/i.test(l.title)) ? l.title : null;
  // does the loadout differ from the defaults? if not, keep it a bare id (or null).
  const shOff = ('rank' in show && !show.rank) || ('level' in show && !show.level) ||
                ('streak' in show && !show.streak) || (!!show.desk);
  if(!stats.length && !title && !shOff) return frame;   // clean bare-id path
  const o = { f: frame };
  if(shOff) o.sh = { rank: show.rank!==false?1:0, level: show.level!==false?1:0,
                     streak: show.streak!==false?1:0, desk: show.desk?1:0 };
  if(stats.length) o.st = stats;
  if(title) o.ti = title;
  return JSON.stringify(o);
};
/* Ornament HTML per frame — '' for frames that are pure CSS (bone). Corner SVGs
   ride .hkf-cn/.hkf-c1..c4 (c2-c4 mirror via CSS transforms); the tier tab is an
   .hkf-tab <i> colored inline from HK_METALS. .hkf-glint is the specular-sweep
   layer (animation lives in nav.css, reduced-motion guarded); charter and bone
   ship none — bone stays PERFECTLY still, that is the joke.
   r376 (Wolf): the plaque screws are retired — corners read as bolt icons. The
   plaques now wear the GEMSET CHAMFER family from concept board A: a chamfered
   corner facet + a cut stone. The BUCKET picks the cut (0 bottom: cabochon dot ·
   1 middle: step cut + edge leaves · 2 top: brilliant, 3 prongs + rays — the pip
   logic moved into the ornament); the TIER escalates the setting (hairline →
   beads → filigree arcs → aura + sparks). Stable classes for the nav.css motion
   layer: .gem (the stone), .gem-facets (facet hairline), .gem-rays (top-bucket
   rays — the 8s shimmer target). */
window.hkFrameOrnaments = (function(){
  let UID=0;
  const GLINT='<i class="hkf-glint" aria-hidden="true"></i>';
  function corners(inner){
    return ['hkf-c1','hkf-c2','hkf-c3','hkf-c4'].map(c=>
      '<svg class="hkf-cn '+c+'" viewBox="0 0 56 56" aria-hidden="true">'+inner+'</svg>').join('');
  }
  // engraved — bracket arcs + rotated-square rosette (board v2, steel)
  const ENG='<path d="M4 44 V12 Q4 4 12 4 H44" fill="none" stroke="#767983" stroke-width="2"/>'+
    '<path d="M9 40 V14 Q9 9 14 9 H40" fill="none" stroke="#565860" stroke-width="1"/>'+
    '<rect x="2" y="2" width="8" height="8" fill="none" stroke="#767983" stroke-width="1.4" transform="rotate(45 6 6)"/>'+
    '<circle cx="6" cy="6" r="1.6" fill="#9a9da8"/>';
  // foil — nested fan arcs + corner pearl
  const FOIL='<g stroke="#8ef2df" stroke-width="1.3" opacity=".9" fill="none">'+
    '<path d="M4 30 Q4 4 30 4"/><path d="M4 22 Q4 4 22 4"/><path d="M4 14 Q4 4 14 4"/>'+
    '<path d="M4 38 Q4 4 38 4" opacity=".5"/></g><circle cx="7" cy="7" r="2" fill="#d8fff5"/>';
  // heraldic — dense crimson filigree + ember dots
  const HER='<g fill="none" stroke="#e65843" stroke-width="1.5" opacity=".9">'+
    '<path d="M2 54 C2 18 18 2 54 2"/><path d="M6 54 C6 22 22 6 54 6"/>'+
    '<path d="M2 30 Q12 27 15 15 Q27 12 30 2"/><path d="M2 42 Q19 38 22 22 Q38 19 42 2" opacity=".55"/></g>'+
    '<circle cx="15" cy="15" r="2.6" fill="#ffb3a1"/><circle cx="22" cy="22" r="1.7" fill="#ffb3a1" opacity=".7"/>';
  /* r382: the BIG card earns DENSER filigree — a third rail, echo scrolls, leaf curls
     and extra embers layered over HER when the host passes opts.lg (nav.js sets it on
     the 640px profile card only). Same 56-grid, so the detail rides the .hk-frame-lg
     ornament scale-up instead of inventing its own coordinates. */
  const HER_LG='<g fill="none" stroke="#e65843" stroke-width="1.1" opacity=".8">'+
    '<path d="M10 54 C10 26 26 10 54 10"/>'+
    '<path d="M2 22 Q9 20 11 11 Q20 9 22 2"/>'+
    '<path d="M2 48 Q26 44 29 29 Q44 26 48 2" opacity=".5"/>'+
    '<path d="M30 2 Q33 8 40 9 M2 30 Q8 33 9 40" stroke-width=".9" opacity=".7"/></g>'+
    '<circle cx="29" cy="29" r="1.9" fill="#ffb3a1" opacity=".85"/>'+
    '<circle cx="40" cy="9" r="1.3" fill="#ffb3a1" opacity=".6"/>'+
    '<circle cx="9" cy="40" r="1.3" fill="#ffb3a1" opacity=".6"/>';
  // charter — laurel-line corner: steel-navy arc with leaf ticks along it
  const CHA=(function(){
    let leaves='';
    for(let l=0;l<4;l++){ const t=0.16+l*0.22;
      // points along the quarter-arc x=4+? — parametrize the Q curve M4 44 Q4 4 44 4
      const x=(4*(1-t)*(1-t)+2*4*t*(1-t)+44*t*t).toFixed(1);
      const y=(44*(1-t)*(1-t)+2*4*t*(1-t)+4*t*t).toFixed(1);
      leaves+='<ellipse cx="'+x+'" cy="'+y+'" rx="4.2" ry="1.7" fill="#8fa3c0" stroke="#3d4c66" stroke-width=".5" transform="rotate('+(-58+l*30)+' '+x+' '+y+')"/>';
    }
    return '<path d="M4 44 Q4 4 44 4" fill="none" stroke="#55688a" stroke-width="1.6"/>'+
      '<path d="M9 42 Q9 9 42 9" fill="none" stroke="#3d4c66" stroke-width="1" opacity=".8"/>'+
      leaves+'<circle cx="5.5" cy="5.5" r="2" fill="#c8d4e6"/>';
  })();
  /* one gemset corner (board A, family 1) — t = tier 0..4 (bronze..diamond),
     b = bucket cut 1..3 (cabochon / step cut / brilliant). Each corner svg gets
     its own gradient id so multiple framed cards on one page never collide. */
  function gemCorner(P,t,b){
    const id='hkgem'+(UID++);
    let s='<defs><linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1">'+
      '<stop offset="0" stop-color="'+P.hi+'"/><stop offset=".5" stop-color="'+P.mid+'"/>'+
      '<stop offset="1" stop-color="'+P.lo+'"/></linearGradient></defs>';
    // the chamfered corner facet + its polish hairline
    s+='<path d="M1 15 L15 1 L26 1 L1 26 Z" fill="url(#'+id+')" stroke="'+P.deep+'" stroke-width="1.1" stroke-linejoin="round"/>';
    s+='<path class="gem-facets" d="M3.5 21.5 L21.5 3.5" stroke="'+P.hi+'" stroke-width=".8" opacity=".55"/>';
    // tier setting: hairline → beads → filigree arcs → aura arc + sparks
    if(t>=1)s+='<path d="M1 30 L30 1" fill="none" stroke="'+P.mid+'" stroke-width=".9" opacity=".75"/>';
    if(t>=2)s+='<circle cx="27.6" cy="3" r="1.7" fill="url(#'+id+')" stroke="'+P.deep+'" stroke-width=".6"/>'+
               '<circle cx="3" cy="27.6" r="1.7" fill="url(#'+id+')" stroke="'+P.deep+'" stroke-width=".6"/>';
    if(t>=3)s+='<path d="M33 3 Q41 5.5 48 3" fill="none" stroke="'+P.mid+'" stroke-width="1" opacity=".85"/>'+
               '<path d="M3 33 Q5.5 41 3 48" fill="none" stroke="'+P.mid+'" stroke-width="1" opacity=".85"/>';
    if(t>=4)s+='<path d="M1 37 Q16 32 22 22 Q32 16 37 1" fill="none" stroke="'+P.hi+'" stroke-width=".7" opacity=".55"/>'+
               '<path d="M50 2.2 l1.5 1.5 M2.2 50 l1.5 1.5" stroke="'+P.hi+'" stroke-width="1" opacity=".7"/>';
    const cx=10.4,cy=10.4,r=6+t*0.35;
    const dia=k=>'M'+cx+' '+(cy-k)+' L'+(cx+k)+' '+cy+' L'+cx+' '+(cy+k)+' L'+(cx-k)+' '+cy+' Z';
    // top bucket only: the ray fan draws UNDER the stone (shimmer target)
    if(b>=3){
      s+='<g class="gem-rays" stroke="'+P.hi+'" stroke-width="1.1" stroke-linecap="round" opacity=".9">'+
         '<path d="M'+(cx+r+2.5)+' '+(cy+r+2.5)+' L'+(cx+r+7)+' '+(cy+r+7)+'"/>'+
         '<path d="M'+(cx+r+3.5)+' '+cy+' L'+(cx+r+8)+' '+cy+'"/>'+
         '<path d="M'+cx+' '+(cy+r+3.5)+' L'+cx+' '+(cy+r+8)+'"/></g>';
    }
    // the cut stone
    let g='<path d="'+dia(r)+'" fill="url(#'+id+')" stroke="'+P.deep+'" stroke-width="1" stroke-linejoin="round"/>';
    if(b===1) g+='<circle cx="'+cx+'" cy="'+cy+'" r="1.4" fill="'+P.hi+'" opacity=".95"/>';
    if(b>=2){
      g+='<path class="gem-facets" d="'+dia(r*0.52)+'" fill="none" stroke="'+P.hi+'" stroke-width=".8" opacity=".9"/>'+
         '<path class="gem-facets" d="M'+cx+' '+(cy-r)+' L'+cx+' '+(cy-r*0.52)+' M'+(cx+r)+' '+cy+' L'+(cx+r*0.52)+' '+cy+
         ' M'+cx+' '+(cy+r)+' L'+cx+' '+(cy+r*0.52)+' M'+(cx-r)+' '+cy+' L'+(cx-r*0.52)+' '+cy+'" stroke="'+P.deep+'" stroke-width=".6" opacity=".8"/>';
      // edge leaves along the frame lip
      s+='<ellipse cx="27" cy="4.6" rx="4.4" ry="1.8" fill="url(#'+id+')" stroke="'+P.deep+'" stroke-width=".55" transform="rotate(-8 27 4.6)"/>'+
         '<ellipse cx="4.6" cy="27" rx="1.8" ry="4.4" fill="url(#'+id+')" stroke="'+P.deep+'" stroke-width=".55" transform="rotate(8 4.6 27)"/>';
    }
    if(b>=3){
      s+='<ellipse cx="35.5" cy="4.4" rx="3.4" ry="1.5" fill="url(#'+id+')" stroke="'+P.deep+'" stroke-width=".5" transform="rotate(-8 35.5 4.4)"/>'+
         '<ellipse cx="4.4" cy="35.5" rx="1.5" ry="3.4" fill="url(#'+id+')" stroke="'+P.deep+'" stroke-width=".5" transform="rotate(8 4.4 35.5)"/>';
      // three prongs — the pip echo — then the brilliant's white cross sparkle
      g+='<g fill="'+P.hi+'">'+
         '<path d="M'+cx+' '+(cy-r-0.6)+' l1.6 2.4 h-3.2 Z"/>'+
         '<path d="M'+(cx-r-0.6)+' '+cy+' l2.4 -1.6 v3.2 Z"/>'+
         '<path d="M'+(cx+r*0.71+0.8)+' '+(cy+r*0.71+0.8)+' l-0.4 2.6 2.6-0.4 Z"/></g>';
      g+='<path d="M'+cx+' '+(cy-2.6)+' V'+(cy+2.6)+' M'+(cx-2.6)+' '+cy+' H'+(cx+2.6)+'" stroke="#ffffff" stroke-width=".9" opacity=".95"/>';
    }
    return s+'<g class="gem">'+g+'</g>';
  }
  function gems(P,t,b){
    return ['hkf-c1','hkf-c2','hkf-c3','hkf-c4'].map(c=>
      '<svg class="hkf-cn '+c+'" viewBox="0 0 56 56" aria-hidden="true">'+gemCorner(P,t,b)+'</svg>').join('');
  }
  function tab(txt, fg, bg, bc){
    return '<i class="hkf-tab" aria-hidden="true" style="color:'+fg+';background:'+bg+';border-color:'+bc+'">'+txt+'</i>';
  }
  const PLQ={bronze:['BRONZE','BRONZE',0], silver:['SILVER','SILVER',1], gold:['GOLD','GOLD',2],
             plat:['PLAT','PLATINUM',3], diam:['DIAM','DIAMOND',4]};
  /* r376: opts.bucket (0 bottom · 1 middle · 2 top, default 1) picks the gem cut on
     plaque frames — the bucket you held at your best tier (hk_ach_flags.tierBestBucket,
     latched by nav.js persistTierBest). Non-plaque frames ignore it. */
  /* r382: opts.lg — the large-card variant (the 640px profile card wears
     .hk-frame-lg). Only heraldic draws EXTRA art for it (denser filigree);
     everything else scales through the nav.css ornament sizes. */
  /* r385 skins: [title, tab-fg, tab-bg, tab-border, fx-kind|'' , extraFlags]
     fx-kind drives hkInitCardFx (snow/fire/prism/stars/none). */
  const SKINS={
    circuit:      ['NEURAL',      '#04222a', 'linear-gradient(90deg,#1c6a68,#2aa89c)', '#2aa89c', ''],
    neon:         ['OVERCLOCK',   '#0b0410', 'linear-gradient(120deg,#ff2d95,#2edcff)', '#ff2d95', ''],
    blueprint:    ['SHEET 01',    '#0c1a26', 'linear-gradient(90deg,#2f5b86,#4f7aa8)', '#4f7aa8', ''],
    crt:          ['C:\\ READY',  '#04140a', 'linear-gradient(90deg,#1c6a38,#2fae5c)', '#2fae5c', ''],
    constellation:['✦ NAVIGATOR','#0b0d1e','linear-gradient(90deg,#6a74c0,#9aa4e0)','#9aa4e0','stars'],
    vaporwave:    ['SYNTHWAVE',   '#1a0722', 'linear-gradient(120deg,#ff5db1,#2ee6e6)', '#ff5db1', 'sun'],
    terminal:     ['● LIVE', '#1a1204', 'linear-gradient(90deg,#3a2a08,#7a5a12)', '#e0a02f', ''],
    pro:          ['◆ PRO',  '#241a06', 'linear-gradient(90deg,#e6c86e,#f3e6b0)', '#e6c86e', 'stars'],
    noir:         ['NOIR',        '#050506', '#f4f6fa', '#f4f6fa', ''],
    frostbite:    ['❄ SUBZERO','#08202e','linear-gradient(120deg,#cdeeff,#66b4e0)','#66b4e0','snow'],
    molten:       ['▲ ERUPTION','#2a0e04','linear-gradient(120deg,#ff7a2a,#ffb52e)','#ffb52e','fire'],
    founder:      ['★ FOUNDER','#100f18','linear-gradient(120deg,#ff5db1,#8fe0ff,#c89bff)','#c89bff','prism']
  };
  return function(id, opts){
    const M=window.HK_METALS||{};
    const bk=(opts && typeof opts.bucket==='number') ? Math.max(0, Math.min(2, opts.bucket|0)) : 1;
    const lg=!!(opts && opts.lg);
    const mini=!!(opts && opts.mini);
    if(SKINS[id]){
      const s=SKINS[id];
      if(window.hkEnsureSkinFonts) window.hkEnsureSkinFonts();
      // the tiny picker swatch shows interior+border only — no notch/canvas
      if(mini) return '';
      let h='';
      /* r385.2 (Wolf): the fracture/crack lines obscured the card — the pure particle
         animation (snow / embers) carries fire+ice better. Cracks retired. */
      if(s[4]) h+='<canvas class="hk-fx" data-kind="'+s[4]+'" aria-hidden="true"></canvas>';
      if(id==='vaporwave') h+='<span class="hkf-sun" aria-hidden="true"></span><span class="hkf-vgrid" aria-hidden="true"></span>';
      h+=tab(s[0], s[1], s[2], s[3]);
      if(id==='founder') h+='<i class="hkf-serial" aria-hidden="true">FOUNDER · 007 / 200</i>';
      return h;
    }
    if(id==='engraved') return GLINT+corners(ENG);
    if(id==='foil')     return GLINT+corners(FOIL);
    if(id==='heraldic'){
      /* r373 (Wolf): the medallion wears the BRAND LOZENGE — a ◆ diamond in the ring, never a star */
      return GLINT+'<svg class="hkf-med" viewBox="0 0 34 34" aria-hidden="true">'+
        '<circle cx="17" cy="17" r="15" fill="var(--surface,#232427)" stroke="#e65843" stroke-width="2"/>'+
        '<path d="M17 7.5 L25.5 17 L17 26.5 L8.5 17 Z" fill="#ffb3a1"/>'+
        '<path d="M17 11.2 L22.2 17 L17 22.8 L11.8 17 Z" fill="none" stroke="#9c2a1c" stroke-width="1.1"/>'+
        '</svg>'+corners(lg ? HER+HER_LG : HER);
    }
    if(id==='charter')  // no glint, no ◆ — the beta class keeps a quiet uniform
      return corners(CHA)+tab('BETA TESTER','#c8d4e6','linear-gradient(180deg,#2a3550,#1a2334)','#55688a');
    if(id.indexOf('plaque-')===0){
      const m=PLQ[id.slice(7)]; if(!m) return '';
      const P=M[m[0]]; if(!P) return '';
      return GLINT+gems(P, m[2], bk+1)+
        tab('◆ '+m[1]+' TIER', P.core, 'linear-gradient(180deg,'+P.plateHi+','+P.plateLo+')', P.lo);
    }
    return '';   // bone (pure CSS) + unknown ids
  };
})();
/* r376: the gem-cut bucket for plaque ornaments, decoded from the packed
   hk_ach_flags.tierBestBucket (tier*3 + bucket — see nav.js persistTierBest).
   Default is the middle cut: a frame should never look BEST-dressed unearned. */
window.hkFrameBucket = function(){
  try{
    const fl=JSON.parse(localStorage.getItem('hk_ach_flags')||'{}');
    return fl.tierBestBucket==null ? 1 : ((fl.tierBestBucket|0)%3);
  }catch(e){ return 1; }
};

/* ---- r385: display-fonts for the card skins (Orbitron/VT323/Cinzel). Injected once,
   idempotent, display=swap so the card never blocks on them. ---- */
window.hkEnsureSkinFonts = function(){
  try{
    if(document.getElementById('hk-skin-fonts')) return;
    const l=document.createElement('link'); l.id='hk-skin-fonts'; l.rel='stylesheet';
    l.href='https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Orbitron:wght@700&family=VT323&display=swap';
    document.head.appendChild(l);
  }catch(e){}
};

/* ---- r385: particle systems behind the animated skins. Finds every .hk-fx canvas
   inside `root` (default document), sizes to its card, and runs a compositor-light
   rAF loop. Reduced-motion → a single calm static field, no loop. Idempotent per
   canvas (marks _hkfx). Kinds: snow · fire (embers+ash) · prism · stars · sun. ---- */
window.hkInitCardFx = function(root){
  try{
    root = root || document;
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canv = [].slice.call(root.querySelectorAll ? root.querySelectorAll('canvas.hk-fx') : []);
    if(!canv.length) return;
    window.hkEnsureSkinFonts();
    const R=(a,b)=>a+Math.random()*(b-a);
    function fit(cv){
      const box=cv.parentElement; if(!box) return null;
      const r=box.getBoundingClientRect(); const dpr=Math.min(2, window.devicePixelRatio||1);
      cv.width=Math.max(1,Math.floor(r.width*dpr)); cv.height=Math.max(1,Math.floor(r.height*dpr));
      cv.style.width='100%'; cv.style.height='100%';   // keep the display box glued to the card, never the buffer size
      return {ctx:cv.getContext('2d'), w:cv.width, h:cv.height, dpr};
    }
    function snow(w,h){const n=Math.round(w*h/9000)+16,p=[];for(let i=0;i<n;i++)p.push({x:R(0,w),y:R(0,h),r:R(.6,2.3),vy:R(.2,.8),ph:R(0,6.28),amp:R(.2,.8),o:R(.35,.95)});return p;}
    function ember(w,h){const ash=Math.random()<.34;return{x:R(0,w),y:h+R(0,16),r:ash?R(1,2.5):R(.7,2),vy:ash?R(.3,.7):R(.7,1.5),drift:R(-.25,.25),ph:R(0,6.28),ash,life:0,max:R(55,140)};}
    function fire(w,h){const n=Math.round(w/7)+16,p=[];for(let i=0;i<n;i++)p.push(ember(w,h));return p;}
    function prism(w,h){const n=Math.round(w*h/17000)+6,cols=['#ff9ed4','#a8e6ff','#c9b8ff','#8ff0c8','#ffe0a0'],p=[];for(let i=0;i<n;i++)p.push({x:R(0,w),y:R(0,h),r:R(.6,1.8),ph:R(0,6.28),sp:R(.6,1.6),c:cols[i%cols.length]});return p;}
    function stars(w,h){const n=Math.round(w*h/6500)+10,cols=['#ffffff','#cfd6ff','#ffe9b8'],p=[];for(let i=0;i<n;i++)p.push({x:R(0,w),y:R(0,h),r:R(.5,1.6),ph:R(0,6.28),sp:R(.5,1.4),c:cols[i%cols.length]});return p;}
    const sys=[];
    canv.forEach(cv=>{
      if(cv._hkfx) return; cv._hkfx=1;
      const kind=cv.dataset.kind, S=fit(cv); if(!S) return;
      let parts = kind==='snow'?snow(S.w,S.h) : kind==='fire'?fire(S.w,S.h) : kind==='prism'?prism(S.w,S.h) : (kind==='stars'||kind==='sun')?stars(S.w,S.h) : [];
      sys.push({cv,kind,S,parts});
    });
    if(!sys.length) return;
    function draw(o,t){
      const S=o.S, ctx=S.ctx, w=S.w, h=S.h, dpr=S.dpr; ctx.clearRect(0,0,w,h);
      if(o.kind==='snow'){ for(const s of o.parts){ if(!reduce){s.y+=s.vy*dpr; s.x+=Math.sin(t/900+s.ph)*s.amp*.5; if(s.y>h+3){s.y=-3;s.x=R(0,w);}}
        ctx.beginPath();ctx.arc(s.x,s.y,s.r*dpr,0,6.28);ctx.fillStyle='rgba(224,244,255,'+s.o+')';ctx.shadowBlur=6*dpr;ctx.shadowColor='rgba(170,220,255,.7)';ctx.fill(); } ctx.shadowBlur=0; }
      else if(o.kind==='fire'){ for(let i=0;i<o.parts.length;i++){ let e=o.parts[i];
        if(!reduce){e.y-=e.vy*dpr; e.x+=(e.drift+Math.sin(t/500+e.ph)*.3)*dpr; e.life++; if(e.y<-4||e.life>e.max){o.parts[i]=ember(w,h);continue;}}
        const k=e.life/e.max,a=Math.max(0,1-k); ctx.beginPath();ctx.arc(e.x,e.y,e.r*dpr,0,6.28);
        if(e.ash){ctx.fillStyle='rgba(120,108,98,'+(a*.5)+')';ctx.shadowBlur=0;}
        else{const hot=Math.max(0,1-k*1.4);ctx.fillStyle='rgba(255,'+Math.round(150+hot*90)+','+Math.round(40+hot*60)+','+a+')';ctx.shadowBlur=7*dpr;ctx.shadowColor='rgba(255,140,50,.9)';}
        ctx.fill(); } ctx.shadowBlur=0; }
      else { for(const s of o.parts){ const a=reduce?.7:(.35+.55*(.5+.5*Math.sin(t/700*s.sp+s.ph)));
        ctx.beginPath();ctx.arc(s.x,s.y,s.r*dpr,0,6.28);ctx.fillStyle=s.c;ctx.globalAlpha=a;ctx.shadowBlur=6*dpr;ctx.shadowColor=s.c;ctx.fill();ctx.globalAlpha=1; } ctx.shadowBlur=0; }
    }
    if(reduce){ sys.forEach(o=>draw(o,0)); return; }
    (function loop(t){ let alive=false; sys.forEach(o=>{ if(o.cv.isConnected){ alive=true; draw(o,t); } });
      if(alive) requestAnimationFrame(loop); })(0);
  }catch(e){}
};

/* ---- r386: hkPlayerCard — the ONE unified player-card component. The public card
   AND the leaderboard hero both render through this, so the earned skin IS the
   surface (no nested container boxes). d carries pre-rendered emblem HTML (caller
   passes window.rankEmblem(...)); opts.scale is 'full' (public card) or 'compact'
   (the your-card hero). When d.flair is a valid HK_FRAMES id we add .hk-frame-<id>
   (+ .hk-frame-lg at full scale) and prepend hkFrameOrnaments — pass flair=null when
   the host element already carries the skin class (avoids a double frame). Compact
   keeps head + stats only; full adds the divider, achievements and boards.
   Dependency-light: only optional window.hkFrameOrnaments. ---- */
window.hkPlayerCard = function(d, opts){
  d = d || {}; opts = opts || {};
  const full = opts.scale !== 'compact';   // 'full' | 'compact' (default full)
  const esc = s => String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let cls = 'uc' + (full ? '' : ' compact'), orn = '';
  // r387: d.flair may be a bare frame id, a full loadout JSON, or null (host carries
  // the skin). Normalize to the frame id for the class/ornaments either way.
  const fv = (d.flair && window.hkFlair) ? window.hkFlair(d.flair).frame : d.flair;
  if(fv && window.HK_FRAMES && window.HK_FRAMES.some(f=>f.id===fv)){
    cls += ' hk-frame-'+fv + (full ? ' hk-frame-lg' : '');
    orn = window.hkFrameOrnaments ? window.hkFrameOrnaments(fv, {lg:full}) : '';
  }
  // r387: show-on-card toggles. Absent d.show => show everything (legacy callers).
  const show = d.show || {};
  const showRank = show.rank !== false, showLevel = show.level !== false;
  const stats = (d.stats||[]).map(s=>
    '<span class="s"><b>'+esc(s.n)+'</b><span>'+esc(s.label)+'</span></span>').join('');
  const crestHtml = showRank ? '<span class="uc-crest">'+(d.tierEmblem||'')+'</span>' : '';
  const tierHtml = showRank ? '<div class="uc-tier">'+(d.tierChipEmblem||'')+'<span>'+esc(d.tierLabel)+'</span></div>' : '';
  const lvlHtml = showLevel ? '<div class="uc-lvlwrap"><div class="uc-lvl">LVL '+esc(d.lvl)+'</div>'+
        '<div class="uc-bar"><i style="width:'+(d.pct||0)+'%"></i></div>'+
        '<div class="uc-xp">'+esc(d.xpLine)+'</div></div>' : '';
  let h = '<div class="'+cls+(showRank?'':' no-rank')+(showLevel?'':' no-lvl')+'">'+orn+
    '<div class="uc-head">'+crestHtml+
      '<div class="uc-id"><div class="uc-nm">'+esc(d.name)+'</div>'+tierHtml+'</div>'+
      lvlHtml+
    '</div>';
  if(full){
    h += '<hr class="uc-div"><div class="uc-stats">'+stats+'</div>';
    if(d.achHtml) h += '<div class="uc-ach">'+d.achHtml+'</div>';
    if(d.boards && d.boards.length) h += '<hr class="uc-div"><div class="uc-boards">'+
      d.boards.map(b=>'<div class="uc-brow"><span>'+esc(b.name)+'</span><b>'+esc(b.time)+'</b></div>').join('')+'</div>';
  } else {
    h += '<div class="uc-stats">'+stats+'</div>';
  }
  if(d.footHtml) h += d.footHtml;
  h += '</div>';
  return h;
};

/* ---- achievement badges: hex medals, single source ---- */
/* r376: THE RARITY PALETTE — one map for every surface that speaks rarity (badge
   rings, the stats-wall .rr tags + legend). Classic gaming ladder: common green ·
   rare blue · epic purple · legendary orange · mythic red (the 'm' class —
   drills.js reserves it for the rarest handful of feats).
   r384 (Wolf): quieted a notch — the r376 values fought the glyph colors and the
   wall read as a rainbow. Same ladder, desaturated toward the site's engraved
   grammar; still legible on light AND dark themes. */
window.HK_RARITY = { c:'#5a9a64', r:'#5f83bd', e:'#8d6cb5', l:'#c58a3a', m:'#bd5a4e' };
window.hkBadge = function(id, earned, size, color, rarity){
  /* r376: 'glyph keeps family color, ring carries rarity' — the r138 metal tint
     REPLACED the family identity (audit finding). r384 (Wolf): that combo was TWO
     color systems fighting — the wall read as a rainbow. ONE color axis now: every
     glyph+frame wears the same engraved steel (the wireframe heritage), and rarity
     lives on the RING alone. Explicit `color` (campaign track chips, keyed to the
     group dot beside them) still wins — that's a caller's system, not rarity's. */
  size=size||26;
  // hexagonal medal, video-game achievement style. Earned = gold + glow; locked = ghost outline.
  const G={
    spd:'<path d="M13.8 6 L9 13.8 H12.2 L11.4 20 L17 12.4 H13.8 L14.8 6 Z"/>',   // r240: centred on the hex
    vol:'<path d="M10.2 8.8h5.6 M8.4 13h9.2 M6.8 17.2h12.4"/>',   // r376: reps stack — centered pyramid, the count reads

    str:'<path d="M13 7c2.6 2 4.4 4.2 4.4 7a4.4 4.4 0 0 1-8.8 0c0-1.4.6-2.6 1.5-3.7.2 1 .8 1.8 1.7 2.2-.3-2 .2-4 1.2-5.5z"/>',
    crn:'<path d="M8 17l-1-6 3.4 2.4L13 9.5l2.6 3.9L19 11l-1 6z"/>',
    day:'<circle cx="13" cy="13" r="4.4"/><path d="M13 5.6v1.8 M13 18.6v1.8 M5.6 13h1.8 M18.6 13h1.8"/>',
    gnt:'<path d="M7 7h12 M9.3 7v9.6l3.7-2.6 3.7 2.6V7"/><path d="M13 10v2.6" stroke-width="1.2"/>',       // r376: centered gonfalon banner — hangs from the bar, swallowtail drop
    c1:'<path d="M8 5.8h10v14.4H8z"/><path d="M10.4 9.4h5.2 M10.4 12.6h5.2 M10.4 15.8h3.4" stroke-width="1.3"/>',   // r376 v1 — the statement takes shape: outlined card holds the ruled lines
    c2:'<path d="M13 7v3 M13 10c-3 0-5 1.4-5 3.2 0 1.6 1.4 2.8 3.2 2.8H14.8c1.8 0 3.2 1.2 3.2 2.8"/><path d="M8 19h10"/>',  // v2 — balance
    c3:'<path d="M7 9h4v3h4v3h4v3H7z"/>',                                                                   // v3 — the waterfall steps down
    c4:'<path d="M10.5 15.5a3 3 0 0 1 0-4.2l1.8-1.8a3 3 0 0 1 4.2 4.2 M15.5 10.5a3 3 0 0 1 0 4.2l-1.8 1.8a3 3 0 0 1-4.2-4.2"/>',  // v4 — the statements link
    c5:'<path d="M16.5 8c-4 0-7 1.4-7 3s2.6 3 6 3-5.6 1.2-5.6 2.6 2 2.4 4.6 2.4"/>',                        // v5 — the debt corkscrew
    c6:'<circle cx="13" cy="13" r="3"/><path d="M13 7.5v2 M13 16.5v2 M7.5 13h2 M16.5 13h2 M9.2 9.2l1.4 1.4 M15.4 15.4l1.4 1.4 M16.8 9.2l-1.4 1.4 M9.6 15.4l-1.4 1.4"/>',  // v6 — working capital gears
    c7:'<path d="M13 7.5l5.5 9.5h-11z"/><circle cx="13" cy="14" r="1.2"/>',                                 // v7 — three statements, one triangle
    c8:'<path d="M13 6.5c2.4 2 3.4 4.6 3.4 7.4l-1.6 2.6h-3.6l-1.6-2.6c0-2.8 1-5.4 3.4-7.4z M11.6 16.5l-1.6 3 M14.4 16.5l1.6 3 M13 10.5v2"/>',  // v8 — ship it
    /* r150: the new class — every new achievement family gets its own mark */
    rx:'<path d="M7.5 8.5h3v3h3v3h3 M7.5 17.5h11"/>',                                                        // rx — the waterfall steps to the floor
    flag:'<path d="M8.5 5.8v14.4 M8.5 6.8h10.6l-2.6 3.4 2.6 3.4H8.5"/><path d="M11.5 8.5v3.2 M14.8 8.7v3.4" stroke-width="1.1"/>', // r376: swallowtail spans the hex, checks add weight
    sheet:'<path d="M9 6.5h6l2.5 2.5V19.5H9z M15 6.5V9h2.5"/><path d="M10.8 14.2l1.6 1.8 3-3.6"/>',          // morning sheet — page + tick
    ice:'<path d="M13 6.5v13 M7.4 9.8l11.2 6.4 M18.6 9.8L7.4 16.2 M13 6.5l-1.6 1.8 M13 6.5l1.6 1.8 M13 19.5l-1.6-1.8 M13 19.5l1.6-1.8"/>', // freeze
    map:'<path d="M7.5 8.5l3.5-1.5 4 1.5 3.5-1.5v10l-3.5 1.5-4-1.5-3.5 1.5z M11 7v10 M15 8.5v10"/>',          // model tour — the map fold
    brush:'<path d="M13 5.6 L20.4 13 L13 20.4 L5.6 13 Z"/><path d="M9.9 13 L13 9.9 L16.1 13 L13 16.1 Z" stroke-width="1.2"/>',  // r376: house style — one strong lozenge swatch, centered
    keys:'<path d="M7 10.5h12v6H7z M9.5 13h1 M12.5 13h1 M15.5 13h1 M9.5 15h7"/>',                             // chord library — keyboard
    fin:'<path d="M13 7.4l1.5 3.4 3.7.3-2.8 2.4.9 3.6-3.3-2-3.3 2 .9-3.6-2.8-2.4 3.7-.3z" fill="currentColor" stroke="none"/>' // star
  };
  const hex='M13 2.8 L21.7 7.9 V18.1 L13 23.2 L4.3 18.1 V7.9 Z';
  /* r376: rarity RING — a scaled outer hex in the tier's palette color, escalating
     common (subtle thin) → rare → epic (+inner echo) → legendary (+vertex beads)
     → mythic (+side fins). Drawn OUTSIDE the 26-grid; the svg ships
     overflow:visible so the ring rides the margin instead of shrinking the medal. */
  const RARE=window.HK_RARITY||{};
  const hexPt=k=>[[13,2.8],[21.7,7.9],[21.7,18.1],[13,23.2],[4.3,18.1],[4.3,7.9]]
    .map(p=>[((p[0]-13)*k+13), ((p[1]-13)*k+13)]);
  const hexS=k=>'M'+hexPt(k).map(p=>p[0].toFixed(2)+' '+p[1].toFixed(2)).join(' L')+' Z';
  let ring='';
  if(earned && rarity!==undefined && rarity!==null && isFinite(rarity)){
    const w=window.hkRarityTier ? window.hkRarityTier(rarity) : null;
    if(w==='mythic'){
      /* the strongest treatment (board C ladder, in red): ornate engraved ring —
         vertex beads, edge-midpoint notch ticks — plus the crest crown at the apex */
      const V=hexPt(1.30);
      let notches='';
      for(let i2=0;i2<6;i2++){ const a2=V[i2], b2=V[(i2+1)%6];
        const mx=(a2[0]+b2[0])/2, my=(a2[1]+b2[1])/2, dx=mx-13, dy=my-13, L2=Math.hypot(dx,dy)||1;
        notches+='<path d="M'+(mx+dx/L2*0.6).toFixed(1)+' '+(my+dy/L2*0.6).toFixed(1)+
          ' L'+(mx+dx/L2*2.2).toFixed(1)+' '+(my+dy/L2*2.2).toFixed(1)+'" stroke="'+RARE.m+'" stroke-width=".8"/>'; }
      ring='<path d="'+hexS(1.30)+'" fill="none" stroke="'+RARE.m+'" stroke-width="1.5"/>'+
        '<path d="'+hexS(1.16)+'" fill="none" stroke="'+RARE.m+'" stroke-width=".55" opacity=".55"/>'+
        V.map(p=>'<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r=".95" fill="'+RARE.m+'"/>').join('')+
        notches+
        '<g transform="translate(13 -5.2) scale(.55)" stroke="'+RARE.m+'" stroke-width="2" fill="none" stroke-linejoin="round">'+
        '<path d="M-6 2.2 L-7.4 -4.6 L-3.4 -1.8 L0 -6.4 L3.4 -1.8 L7.4 -4.6 L6 2.2 Z"/></g>'+
        '<path d="M6.6 -7.2l1.7 1.4 M19.4 -7.2l-1.7 1.4" stroke="'+RARE.m+'" stroke-width="1" stroke-linecap="round"/>';
    } else if(w==='legendary'){
      ring='<path d="'+hexS(1.28)+'" fill="none" stroke="'+RARE.l+'" stroke-width="1.3"/>'+
        '<path d="'+hexS(1.14)+'" fill="none" stroke="'+RARE.l+'" stroke-width=".55" opacity=".55"/>'+
        hexPt(1.28).map(p=>'<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r=".9" fill="'+RARE.l+'"/>').join('');
    } else if(w==='epic'){
      ring='<path d="'+hexS(1.26)+'" fill="none" stroke="'+RARE.e+'" stroke-width="1.15"/>'+
        '<path d="'+hexS(1.13)+'" fill="none" stroke="'+RARE.e+'" stroke-width=".5" opacity=".5"/>';
    } else if(w==='rare'){
      /* r384: common/rare rings stay THIN — color volume scales with rarity */
      ring='<path d="'+hexS(1.24)+'" fill="none" stroke="'+RARE.r+'" stroke-width=".7" opacity=".85"/>';
    } else {
      ring='<path d="'+hexS(1.22)+'" fill="none" stroke="'+RARE.c+'" stroke-width=".55" opacity=".45"/>';
    }
  }
  /* r384 (Wolf): the r240 per-family palette is RETIRED, not patched — every earned
     medal engraves in one muted steel (a fixed hex on purpose: the engraved field
     must read identical in light and dark, like the frame art's steel). Earned vs
     locked stays an opacity/dim read, exactly as before. */
  const col = earned ? (color||'#828896') : 'var(--faint)';
  /* r240 (Wolf): FLAT + OUTLINED — a transparent hex with a coloured FRAME and a
     matching coloured glyph. No solid fill, no tint. Locked is the same shape
     ghosted. r376: earned medals add the rarity ring outside the frame. */
  const op = earned ? '' : ' opacity=".5"';
  return '<svg class="hk-badge'+(earned?' earned':' off')+'" viewBox="0 0 26 26" width="'+size+'" height="'+size+'" style="color:'+col+';overflow:visible">'+
    ring+
    '<path d="'+hex+'" fill="none" stroke="currentColor" stroke-width="1.7"'+op+'/>'+
    '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"'+op+'>'+(G[id]||G.fin)+'</g>'+
    '</svg>';
};
// r138: shared rarity helpers — tier word + tooltip fragment (stats grid + cards)
/* r376: mythic (<=0.5%) joins the ladder. In practice the hand-set 'm' floor is
   what lands there — the live % is integer-rounded, so an EARNED feat can't read
   <=0.5 until the field tops ~200 players. */
window.hkRarityTier = function(pct){
  if(pct===undefined||pct===null||!isFinite(pct)) return null;
  if(pct<=0.5) return 'mythic'; if(pct<=3) return 'legendary'; if(pct<=10) return 'epic'; if(pct<=25) return 'rare'; return null;
};
/* r293 (Wolf): one source of truth for the rarity word + its (cross-theme) color +
   a sort weight, so the wall can ORGANISE by rarity and every label/legend matches
   the colour painted on the badge ring. weight: 0 mythic … 4 common (sort ascending).
   r376: colors come from HK_RARITY — the same map the rings and .rr tags paint. */
window.hkRarityMeta = function(pct){
  const t=window.hkRarityTier(pct), C=window.HK_RARITY||{};
  if(t==='mythic')    return { word:'mythic',    abbr:'MYTH', color:C.m, weight:0 };
  if(t==='legendary') return { word:'legendary', abbr:'LEG',  color:C.l, weight:1 };
  if(t==='epic')      return { word:'epic',      abbr:'EPIC', color:C.e, weight:2 };
  if(t==='rare')      return { word:'rare',      abbr:'RARE', color:C.r, weight:3 };
  return { word:'common', abbr:'', color:C.c, weight:4 };
};
/* r150: EFFECTIVE RARITY — rarity was pure data (% of players holding it), which at
   beta scale reads all-common (1 of 3 players = 33%). Each achievement now
   carries a hand-set difficulty tier ('r'/'e'/'l'/'m') as the DISPLAY FLOOR;
   live data takes over once the field is big enough to mean something
   (>= 20 players). */
window.hkEffRarity = function(tier, dataPct, fieldN){
  /* r376: a live 0% is "no holder the run-derived sweep can SEE" — flag-based feats
     (night wins, race wins…) always read 0 globally even when earned, and 0 would
     fall into the reserved mythic band. Zero falls back to the hand-set floor. */
  if((fieldN|0)>=20 && dataPct!==undefined && dataPct!==null && isFinite(dataPct) && dataPct>0) return dataPct;
  return tier==='m' ? 0.5 : tier==='l' ? 3 : tier==='e' ? 10 : tier==='r' ? 25 : 100;
};

/* =====================================================================
   SCHOOL FLAIR — Phase 1 (T-Q, Wolf r251)  ·  r252
   The school mark is a COLORED MONOGRAM, our own: a 1–3 letter monogram in a
   school's real colors on ONE clean circle chip. Two-tone = background fill +
   letter color (Wharton = navy chip / red letter). NO border ring, NO crests /
   logos / mascots (trademark + clarity). Everything is data-driven.

     SCHOOLS[id] = { name, mono, fill, ink?, face? }
       name  display name (also what the .edu auto-match / school_tag may carry)
       mono  the monogram (1–3 chars)
       fill  chip background — the school's PRIMARY color
       ink   letter color — the school's SECOND color; OMIT to auto-pick a
             readable ink (dark on light fills — e.g. Columbia light-blue → navy)
       face  'serif' | 'condensed' | undefined (default geometric mono)

   Colors matched as closely as possible to each school's real identity, held to
   our contrast bar (schoolInk guarantees a legible letter on every fill).
   ~100 finance feeders seeded for Wolf to trim/approve. ===================== */
window.SCHOOLS = {
  /* ---- Ivy League ---- */
  harvard:      { name:'Harvard',            mono:'H',   fill:'#A51C30', face:'serif' },
  yale:         { name:'Yale',               mono:'Y',   fill:'#00356B', face:'serif' },
  princeton:    { name:'Princeton',          mono:'P',   fill:'#111111', ink:'#E77500', face:'serif' },
  penn:         { name:'Penn',               mono:'P',   fill:'#011F5B', ink:'#E4002B' },
  columbia:     { name:'Columbia',           mono:'C',   fill:'#B9D9EB' },              /* light fill → auto navy ink */
  brown:        { name:'Brown',              mono:'B',   fill:'#4E3629', ink:'#FFC72C', face:'serif' },
  dartmouth:    { name:'Dartmouth',          mono:'D',   fill:'#00693E', face:'serif' },
  cornell:      { name:'Cornell',            mono:'C',   fill:'#B31B1B', face:'serif' },
  /* ---- Target undergrad + their marquee B-schools ---- */
  wharton:      { name:'Wharton',            mono:'W',   fill:'#012169', ink:'#E4002B' },
  stanford:     { name:'Stanford',           mono:'S',   fill:'#8C1515', face:'serif' },
  gsb:          { name:'Stanford GSB',       mono:'GSB', fill:'#8C1515', ink:'#DAD7CB', face:'serif' },
  mit:          { name:'MIT',                mono:'MIT', fill:'#750014', ink:'#C2C0BF', face:'condensed' },
  sloan:        { name:'MIT Sloan',          mono:'S',   fill:'#750014', ink:'#C2C0BF' },
  nyu:          { name:'NYU',                mono:'NYU', fill:'#57068C' },
  stern:        { name:'NYU Stern',          mono:'S',   fill:'#57068C' },
  chicago:      { name:'UChicago',           mono:'UC',  fill:'#800000', face:'serif' },
  booth:        { name:'Chicago Booth',      mono:'B',   fill:'#800000' },
  northwestern: { name:'Northwestern',       mono:'N',   fill:'#4E2A84' },
  kellogg:      { name:'Kellogg',            mono:'K',   fill:'#4E2A84' },
  duke:         { name:'Duke',               mono:'D',   fill:'#012169' },
  fuqua:        { name:'Duke Fuqua',         mono:'F',   fill:'#012169' },
  georgetown:   { name:'Georgetown',         mono:'G',   fill:'#041E42', ink:'#8A8D8F', face:'serif' },
  uva:          { name:'Virginia',           mono:'V',   fill:'#232D4B', ink:'#E57200' },
  darden:       { name:'Darden',             mono:'D',   fill:'#232D4B', ink:'#E57200' },
  michigan:     { name:'Michigan',           mono:'M',   fill:'#00274C', ink:'#FFCB05' },
  ross:         { name:'Michigan Ross',      mono:'R',   fill:'#00274C', ink:'#FFCB05' },
  berkeley:     { name:'UC Berkeley',        mono:'Cal', fill:'#002676', ink:'#FDB515' },
  haas:         { name:'Berkeley Haas',      mono:'H',   fill:'#002676', ink:'#FDB515' },
  utaustin:     { name:'UT Austin',          mono:'UT',  fill:'#BF5700', face:'condensed' },
  mccombs:      { name:'McCombs',            mono:'M',   fill:'#BF5700', face:'condensed' },
  notredame:    { name:'Notre Dame',         mono:'ND',  fill:'#0C2340', ink:'#C99700', face:'serif' },
  vanderbilt:   { name:'Vanderbilt',         mono:'V',   fill:'#121212', ink:'#CFAE70', face:'serif' },
  washu:        { name:'WashU',              mono:'W',   fill:'#006A4D' },
  usc:          { name:'USC',                mono:'SC',  fill:'#990000', ink:'#FFC72C', face:'serif' },
  ucla:         { name:'UCLA',               mono:'LA',  fill:'#2774AE', ink:'#FFD100' },
  emory:        { name:'Emory',              mono:'E',   fill:'#012169', ink:'#F2A900' },
  bostoncollege:{ name:'Boston College',     mono:'BC',  fill:'#862633', ink:'#BC9B6A', face:'serif' },
  villanova:    { name:'Villanova',          mono:'V',   fill:'#002664', ink:'#13B5EA' },
  indiana:      { name:'Indiana Kelley',     mono:'IU',  fill:'#990000', ink:'#EEEDEB', face:'serif' },
  unc:          { name:'UNC',                mono:'NC',  fill:'#4B9CD3', ink:'#13294B' },  /* Carolina blue → navy letter */
  cmu:          { name:'Carnegie Mellon',    mono:'CMU', fill:'#941120' },
  jhu:          { name:'Johns Hopkins',      mono:'JHU', fill:'#002D72' },
  rice:         { name:'Rice',               mono:'R',   fill:'#00205B', face:'serif' },
  gatech:       { name:'Georgia Tech',       mono:'GT',  fill:'#003057', ink:'#B3A369', face:'condensed' },
  wakeforest:   { name:'Wake Forest',        mono:'W',   fill:'#000000', ink:'#9E7E38', face:'serif' },
  /* ---- Semi-targets ---- */
  bu:           { name:'Boston University',  mono:'BU',  fill:'#CC0000' },
  fordham:      { name:'Fordham',            mono:'F',   fill:'#900028', face:'serif' },
  baruch:       { name:'Baruch',             mono:'B',   fill:'#003865' },
  bentley:      { name:'Bentley',            mono:'B',   fill:'#00457C', ink:'#B5A268' },
  lehigh:       { name:'Lehigh',             mono:'L',   fill:'#663300', ink:'#FFFFFF' },
  bucknell:     { name:'Bucknell',           mono:'B',   fill:'#003865', ink:'#E87722' },
  wisconsin:    { name:'Wisconsin',          mono:'W',   fill:'#C5050C', face:'serif' },
  ohiostate:    { name:'Ohio State',         mono:'OS',  fill:'#BB0000', ink:'#B0B7BC', face:'condensed' },
  illinois:     { name:'Illinois',           mono:'I',   fill:'#13294B', ink:'#FF5F05' },
  purdue:       { name:'Purdue',             mono:'P',   fill:'#000000', ink:'#CEB888', face:'condensed' },
  pennstate:    { name:'Penn State',         mono:'PSU', fill:'#041E42', face:'condensed' },
  maryland:     { name:'Maryland',           mono:'M',   fill:'#E21833', ink:'#FFD520' },
  rutgers:      { name:'Rutgers',            mono:'R',   fill:'#CC0033', face:'serif' },
  miamifl:      { name:'Miami',              mono:'M',   fill:'#005030', ink:'#F47321' },
  tulane:       { name:'Tulane',             mono:'T',   fill:'#14453D', ink:'#418FDE' },
  smu:          { name:'SMU Cox',            mono:'SMU', fill:'#C8102E' },
  tcu:          { name:'TCU',                mono:'TCU', fill:'#4D1979' },
  babson:       { name:'Babson',             mono:'B',   fill:'#006A4D' },
  northeastern: { name:'Northeastern',       mono:'NU',  fill:'#CC0000', face:'condensed' },
  wm:           { name:'William & Mary',     mono:'WM',  fill:'#115740', ink:'#B9975B', face:'serif' },
  uga:          { name:'Georgia',            mono:'G',   fill:'#BA0C2F', ink:'#000000', face:'serif' },
  florida:      { name:'Florida',            mono:'UF',  fill:'#0021A5', ink:'#FA4616' },
  uwashington:  { name:'Washington Foster',  mono:'W',   fill:'#4B2E83', ink:'#E8E3D3' },
  minnesota:    { name:'Minnesota',          mono:'M',   fill:'#7A0019', ink:'#FFCC33', face:'serif' },
  tamu:         { name:'Texas A&M',          mono:'AM',  fill:'#500000', face:'serif' },
  asu:          { name:'Arizona State',      mono:'ASU', fill:'#8C1D40', ink:'#FFC627' },
  richmond:     { name:'Richmond',           mono:'R',   fill:'#001970', ink:'#E5B93C' },
  casewestern:  { name:'Case Western',       mono:'C',   fill:'#0A304E' },
  rochester:    { name:'Rochester Simon',    mono:'R',   fill:'#003B71', ink:'#FFD100' },
  bryant:       { name:'Bryant',             mono:'B',   fill:'#000000', ink:'#C5A253' },
  byu:          { name:'BYU',                mono:'BYU', fill:'#002E5D' },              /* big consulting/accounting feeder */
  drexel:       { name:'Drexel',             mono:'D',   fill:'#07294D', ink:'#FFC600' },
  gwu:          { name:'George Washington',  mono:'GW',  fill:'#033C5A', ink:'#A69362' },
  msu:          { name:'Michigan State',     mono:'MSU', fill:'#18453B' },
  /* ---- Liberal-arts feeders ---- */
  amherst:      { name:'Amherst',            mono:'A',   fill:'#31006F', face:'serif' },
  williams:     { name:'Williams',           mono:'W',   fill:'#512698', ink:'#FFD100', face:'serif' },
  middlebury:   { name:'Middlebury',         mono:'M',   fill:'#0D2B52', face:'serif' },
  colgate:      { name:'Colgate',            mono:'C',   fill:'#862633', face:'serif' },
  hamilton:     { name:'Hamilton',           mono:'H',   fill:'#00548F', face:'serif' },
  cmc:          { name:'Claremont McKenna',  mono:'CMC', fill:'#82112F', ink:'#B99C6B' },
  pomona:       { name:'Pomona',             mono:'P',   fill:'#00449C', ink:'#F0AB00' },
  swarthmore:   { name:'Swarthmore',         mono:'S',   fill:'#862334', face:'serif' },
  bowdoin:      { name:'Bowdoin',            mono:'B',   fill:'#000000', ink:'#C8B267', face:'serif' },
  davidson:     { name:'Davidson',           mono:'D',   fill:'#000000', ink:'#C8102E', face:'serif' },
  washlee:      { name:'Washington & Lee',   mono:'WL',  fill:'#003865', ink:'#B08A38', face:'serif' },
  holycross:    { name:'Holy Cross',         mono:'HC',  fill:'#602D89', face:'serif' },
  /* ---- HBCU finance feeders ---- */
  howard:       { name:'Howard',             mono:'H',   fill:'#003A63', ink:'#F44C5E', face:'serif' },
  morehouse:    { name:'Morehouse',          mono:'M',   fill:'#6F263D', ink:'#B3995D', face:'serif' },
  spelman:      { name:'Spelman',            mono:'S',   fill:'#00539B', face:'serif' },
  /* ---- International finance feeders ---- */
  lse:          { name:'LSE',                mono:'LSE', fill:'#7A003C' },
  oxford:       { name:'Oxford',             mono:'O',   fill:'#002147', face:'serif' },
  cambridge:    { name:'Cambridge',          mono:'C',   fill:'#0072CF', face:'serif' },
  imperial:     { name:'Imperial College',   mono:'IC',  fill:'#003E74' },
  warwick:      { name:'Warwick',            mono:'W',   fill:'#5A2D81' },
  lbs:          { name:'London Business Sch',mono:'LBS', fill:'#002147' },
  bocconi:      { name:'Bocconi',            mono:'B',   fill:'#002F6C', face:'serif' },
  hec:          { name:'HEC Paris',          mono:'HEC', fill:'#00205B', ink:'#B8985A' },
  insead:       { name:'INSEAD',             mono:'I',   fill:'#00447C' },
  mcgill:       { name:'McGill',             mono:'M',   fill:'#ED1B2F', face:'serif' },
  toronto:      { name:'Toronto Rotman',     mono:'T',   fill:'#002A5C', face:'serif' },
  ivey:         { name:'Ivey (Western)',     mono:'I',   fill:'#4F2683' },
  queens:       { name:'Queen’s',       mono:'Q',   fill:'#11335D', ink:'#F2A900', face:'serif' },
  waterloo:     { name:'Waterloo',           mono:'W',   fill:'#000000', ink:'#FED34C', face:'condensed' },
  ubc:          { name:'UBC',                mono:'UBC', fill:'#002145', ink:'#F2A900' },
  nus:          { name:'NUS Singapore',      mono:'NUS', fill:'#003D7C', ink:'#EF7C00' },
  hku:          { name:'Hong Kong (HKU)',    mono:'HKU', fill:'#00695C', ink:'#D4AF37' },
  tsinghua:     { name:'Tsinghua',           mono:'T',   fill:'#660874', face:'serif' },
  pku:          { name:'Peking',             mono:'P',   fill:'#94070A', face:'serif' },
  /* ---- more US feeders + marquee MBA brands ---- */
  tuck:         { name:'Tuck (Dartmouth)',   mono:'T',   fill:'#00693E' },
  cbs:          { name:'Columbia Business',  mono:'CBS', fill:'#012169', ink:'#9BCBEB' },
  yalesom:      { name:'Yale SOM',           mono:'SOM', fill:'#00356B', face:'serif' },
  syracuse:     { name:'Syracuse',           mono:'S',   fill:'#F76900', ink:'#0E1E45' },
  pitt:         { name:'Pittsburgh',         mono:'P',   fill:'#003594', ink:'#FFB81C' },
  uconn:        { name:'UConn',              mono:'C',   fill:'#000E2F', ink:'#E4002B' }
};

/* small curated palette for freeform "Other" schools — professional, distinct,
   and deterministically assigned so a given name always wears the same swatch. */
window.SCHOOL_OTHER_PALETTE = [
  '#2E4A62', /* slate blue  */ '#1F6E5A', /* forest    */ '#6D3B5E', /* plum   */
  '#8A4B2E', /* clay        */ '#3A3F8F', /* indigo    */ '#7A2E3B', /* wine   */
  '#4E5B3C', /* olive       */ '#2C6E7F', /* teal      */ '#8A6D2E'  /* bronze */
];

/* relative luminance (sRGB → linear), for auto-contrast ink selection */
function _schLum(hex){
  var m=/^#?([0-9a-f]{6})$/i.exec(String(hex||'').trim()); if(!m) return 0;
  var n=parseInt(m[1],16), ch=[(n>>16)&255,(n>>8)&255,n&255].map(function(v){
    v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4); });
  return 0.2126*ch[0]+0.7152*ch[1]+0.0722*ch[2];
}
/* the readable letter color for a given fill: explicit ink wins; otherwise a
   deep neutral navy on light fills, near-white on dark ones. */
window.schoolInk = function(fill, ink){
  if(ink) return ink;
  return _schLum(fill) > 0.48 ? '#132339' : '#F8F8F5';
};
function _schEsc(s){ return String(s==null?'':s).replace(/[&<>"']/g, function(c){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
/* freeform initials: up to 2 letters, skipping filler words */
window.schoolMonoFromName = function(name){
  var words=String(name||'').trim().split(/[\s.&\-]+/).filter(function(w){
    return w && !/^(of|the|and|at|de|for|university|college|school|business)$/i.test(w); });
  if(!words.length) words=[String(name||'?').trim()||'?'];
  var m = words.length>=2 ? (words[0][0]+words[1][0]) : words[0].slice(0,2);
  return m.toUpperCase();
};
window.schoolSwatchFor = function(name){
  var s=String(name||''), h=0; for(var i=0;i<s.length;i++){ h=(h*31 + s.charCodeAt(i))>>>0; }
  var P=window.SCHOOL_OTHER_PALETTE; return P[h % P.length];
};
function _schEntry(id, S){
  return { id:id, name:S.name, mono:S.mono, fill:S.fill,
           ink:window.schoolInk(S.fill, S.ink), face:S.face||'', other:false };
}
function _schOther(name){
  name=String(name||'').trim();
  var fill=window.schoolSwatchFor(name);
  return { id:null, name:name||'Other', mono:window.schoolMonoFromName(name), fill:fill,
           ink:window.schoolInk(fill), face:'', other:true };
}
/* resolve a stored value (a SCHOOLS id, a display name from the .edu match, or an
   "other:Free Name") to a renderable entry — always returns something legible. */
window.schoolResolve = function(tag){
  if(tag==null || tag==='') return null;
  tag=String(tag).trim(); if(!tag) return null;
  var S=window.SCHOOLS||{}, key=tag.toLowerCase();
  if(key.indexOf('other:')===0) return _schOther(tag.slice(6).trim());
  if(S[tag]) return _schEntry(tag, S[tag]);
  if(S[key]) return _schEntry(key, S[key]);
  var id;
  for(id in S){ if(S[id].name.toLowerCase()===key) return _schEntry(id, S[id]); }
  for(id in S){ var nm=S[id].name.toLowerCase(); if(nm===key || nm.replace(/[^a-z0-9]/g,'')===key.replace(/[^a-z0-9]/g,'')) return _schEntry(id, S[id]); }
  return _schOther(tag);   /* unknown → freeform monogram, never a broken chip */
};
/* THE component: schoolChip(schoolId | school_tag, size) → inline colored monogram.
   Self-contained inline styles so it renders identically on every page + surface. */
window.schoolChip = function(idOrTag, size){
  var s = window.schoolResolve(idOrTag); if(!s) return '';
  size = size || 18;
  var len = s.mono.length;
  var fs = Math.round(size * (len>=3 ? 0.40 : len===2 ? 0.46 : 0.54));
  var fam = s.face==='serif'     ? "Georgia,'Times New Roman',serif"
          : s.face==='condensed' ? "'Arial Narrow','Helvetica Neue',Arial,sans-serif"
          : "'JetBrains Mono',ui-monospace,'SFMono-Regular',monospace";
  // r252: letter-spacing offsets multi-char monos off horizontal-center (trailing
  // space), and cap-only glyphs sit high with line-height:1 — so drop letter-spacing
  // and nudge the glyph down 0.04em via an inner span for true optical centering.
  return '<span class="school-chip'+(s.other?' school-other':'')+'" title="'+_schEsc(s.name)+'" '+
    'role="img" aria-label="'+_schEsc(s.name)+'" data-school="'+_schEsc(s.id||('other:'+s.name))+'" '+
    'style="display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;box-sizing:border-box;'+
    'width:'+size+'px;height:'+size+'px;border-radius:50%;flex:0 0 auto;padding:0;'+
    'background:'+s.fill+';color:'+s.ink+';font-family:'+fam+';font-weight:700;'+
    'font-size:'+fs+'px;line-height:1;letter-spacing:0;overflow:hidden;user-select:none">'+
    '<span style="display:block;transform:translateY(.04em)">'+_schEsc(s.mono)+'</span></span>';
};
/* ordered id list for pickers (roster order above == curated priority order) */
window.SCHOOL_IDS = Object.keys(window.SCHOOLS);

/* r256: time-band medal — a small filled pip (◆) in the band's color. size=pip px. */
window.hkBandChip = function(band, size){
  if(!band) return '';
  size = size || 13;
  return '<span class="band-chip band-'+_schEsc(band.key)+'" title="'+_schEsc(band.name)+'" '+
    'style="display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;'+
    'width:'+size+'px;height:'+size+'px;color:'+band.color+';font-size:'+Math.round(size*0.92)+'px;line-height:1">◆</span>';
};

/* r267 NAME FILTER — shared first-pass moderation for user-named things (desks, "Other"
   schools). Substring list carries only unambiguous fragments; word list holds terms that
   are innocent inside real names (Dickinson, Ashkenazi, Analyst...). The server stays the
   real gate — this just keeps obvious garbage from ever reaching it. */
/* ============================================================
   r279 MAC DISPLAY LAYER (Stage 2+3, dev/MAC_DESIGN.md) — shared by the game,
   the reference page, and anywhere else keycaps render. KeyTips-forward per
   Wolf: the ⌥ ribbon walks are the star (they now match real Mac Excel);
   F-keys stay F-keys on screen — the popup teaches fn + the ⌘T/⌃U alternates.
   ============================================================ */
window.hkIsMac = function(){ try{
  var o=localStorage.getItem('hk_platform');              // r280: onboarding pick wins
  if(o==='mac') return true; if(o==='win') return false;
  return /Mac/i.test(navigator.platform||'') || /Macintosh/i.test(navigator.userAgent||'');
}catch(e){ return false; } };
window.hkMacChord = function(s){
  return String(s)
    .replace(/ctrl\+/gi,'\u2318')
    .replace(/\bshift\+/gi,'\u21e7')
    .replace(/\balt\b(?=(\s|\+))/gi,'\u2325');
};
window.hkMacifyKbds = function(root){
  if(!window.hkIsMac() || !root) return;
  try{
    root.querySelectorAll('kbd,em,b,.cl-label,.cl-hint').forEach(function(n){
      if(n.children.length) return;
      var t=n.textContent, tt=t.trim();
      if(/^ctrl$/i.test(tt)) n.textContent='\u2318';
      else if(/^alt$/i.test(tt)) n.textContent='\u2325';
      else if(/^shift$/i.test(tt)) n.textContent='\u21e7';
      else if(/ctrl\+|\balt\b|shift\+/i.test(t)) n.textContent=window.hkMacChord(t);
    });
  }catch(e){}
};
/* the small popup Wolf asked for: what the keys are here + how to switch on
   KeyTips in real Excel for Mac + the F-key setting. Openable any time. */
window.hkMacPopup = function(){
  try{
    var old=document.getElementById('hkMacPop'); if(old) old.remove();
    var w=document.createElement('div'); w.id='hkMacPop';
    w.style.cssText='position:fixed;inset:0;z-index:320;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:20px';
    w.innerHTML=
      '<div style="max-width:520px;width:100%;background:var(--surface,#141517);border:1px solid var(--line,#333);border-radius:14px;overflow:hidden;font-family:var(--mono,ui-monospace,monospace)">'+
      '<div style="min-height:34px;display:flex;align-items:center;justify-content:space-between;padding:6px 16px;background:var(--surface2,#1c1d20);border-bottom:1px solid var(--line,#333);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted,#888)">'+
        '<span>\u2318 mac keys \u2014 one motion, every excel</span><a id="hkMacX" style="cursor:pointer;font-size:15px">\u00d7</a></div>'+
      '<div style="padding:16px 20px;font-size:12.5px;line-height:1.8;color:var(--muted,#999)">'+
        '<div style="color:var(--text,#eee)"><b>\u2318 = Ctrl</b> \u2014 \u2318C \u00b7 \u2318B \u00b7 \u2318\u2193. <b style="color:var(--accent,#2ea36f)">\u2325 walks the ribbon</b> \u2014 \u2325 e s v pastes values, same letters as Windows Alt and Mac Excel\u2019s new KeyTips. <b>\u2318T</b> = F4 anchors \u00b7 <b>\u2303U</b> = F2 edit.</div>'+
        '<div style="margin-top:12px;padding-top:11px;border-top:1px dashed var(--line,#333)">'+
        '<b style="color:var(--warn,#d9a441)">Real Excel for Mac:</b> update Office, then tap \u2325 \u2014 KeyTips light up the ribbon. F-keys need <b>fn</b>, or flip \u201cUse F1, F2\u2026 as standard function keys\u201d in System Settings \u2192 Keyboard.</div>'+
        '<div style="margin-top:11px;font-size:10.5px;color:var(--faint,#666)">same boards, same pars, every platform</div>'+
      '</div>'+
      '<div style="padding:0 20px 16px"><button id="hkMacOk" style="font-family:inherit;font-size:12.5px;padding:9px 22px;border-radius:999px;border:1px solid var(--accent,#2ea36f);background:var(--accent,#2ea36f);color:#0c0d0e;font-weight:700;cursor:pointer">got it</button></div></div>';
    var close=function(){ w.remove(); document.removeEventListener('keydown',esch,true); };
    var esch=function(e){ if(e.key==='Escape'){ e.stopImmediatePropagation(); close(); } };
    w.addEventListener('click',function(e){ if(e.target===w) close(); });
    document.addEventListener('keydown',esch,true);
    document.body.appendChild(w);
    document.getElementById('hkMacX').onclick=close;
    document.getElementById('hkMacOk').onclick=close;
    try{ localStorage.setItem('hk_mac_seen','1'); }catch(e){}
  }catch(e){}
};
window.hkNameOk = function(name){
  var raw=String(name||'').toLowerCase();
  var s=raw.replace(/[@]/g,'a').replace(/0/g,'o').replace(/[1!|]/g,'i').replace(/3/g,'e')
           .replace(/4/g,'a').replace(/[5$]/g,'s').replace(/7/g,'t').replace(/[^a-z]/g,'');
  var SUB=['nigg','fagg','kike','wetback','tranny','pedo','whore','slut','cunt','fuck','shit','bitch','retard','jizz','porn'];
  for(var i=0;i<SUB.length;i++) if(s.indexOf(SUB[i])>=0) return false;
  // r276: word check runs on the leet-MAPPED text (spaces intact) — 'n4z1' becomes the
  // word 'nazi' and blocks; 'Ashkenazi' stays one long word and passes
  var mapped=raw.replace(/[@]/g,'a').replace(/0/g,'o').replace(/[1!|]/g,'i').replace(/3/g,'e')
                .replace(/4/g,'a').replace(/[5$]/g,'s').replace(/7/g,'t');
  var words=mapped.replace(/[^a-z]+/g,' ').split(' ');
  var WORD=['rape','nazi','dyke','anal','cum','cock','dick','pussy','penis','vagina','coon','spic','chink','hoe','kkk','isis','hitler'];
  for(var j=0;j<words.length;j++) if(WORD.indexOf(words[j])>=0) return false;
  return true;
};

/* Shared SCHOOL PICKER — curated search + freeform "Other". Returns a DOM element
   whose .getValue() gives the current selection (a SCHOOLS id, an "other:Name"
   string, or null). onPick(value) fires on every change. Self-contained styling
   (CSS-var fallbacks) so it drops into signup, the account page, anywhere. */
window.buildSchoolPicker = function(current, onPick){
  var wrap=document.createElement('div'); wrap.className='school-picker';
  wrap.style.cssText='display:flex;flex-direction:column;gap:8px;font-family:var(--mono,ui-monospace,monospace)';
  var cur=document.createElement('div');
  var search=document.createElement('input'); search.type='text';
  search.placeholder='search ~100 schools…'; search.setAttribute('aria-label','search schools');
  search.style.cssText='width:100%;box-sizing:border-box;background:var(--surface2,#33363c);color:var(--text,#eee);border:1px solid var(--line,#555);border-radius:8px;padding:8px 10px;font-family:inherit;font-size:12.5px';
  var list=document.createElement('div');
  list.style.cssText='max-height:220px;overflow-y:auto;display:flex;flex-direction:column;gap:1px;border:1px solid var(--line,#555);border-radius:8px;padding:5px;background:var(--surface,#2f3238)';
  var state={ value: current||null };
  function optBtn(id, S){
    var b=document.createElement('button'); b.type='button'; b.setAttribute('data-id',id);
    b.style.cssText='display:flex;align-items:center;gap:9px;width:100%;text-align:left;background:none;border:none;color:var(--text,#eee);font-family:inherit;font-size:12.5px;padding:6px 7px;border-radius:6px;cursor:pointer';
    b.onmouseover=function(){ b.style.background='var(--surface2,#3a3e46)'; };
    b.onmouseout=function(){ b.style.background='none'; };
    b.innerHTML=window.schoolChip(id,20)+'<span>'+_schEsc(S.name)+'</span>';
    b.onclick=function(){ set(id); };
    return b;
  }
  function renderList(q){
    q=(q||'').trim().toLowerCase(); list.innerHTML='';
    var ids=window.SCHOOL_IDS, shown=0;
    for(var i=0;i<ids.length;i++){ var id=ids[i], S=window.SCHOOLS[id];
      if(q && S.name.toLowerCase().indexOf(q)<0 && id.toLowerCase().indexOf(q)<0) continue;
      list.appendChild(optBtn(id,S)); shown++;
      if(shown>=80 && !q) break;
    }
    var other=document.createElement('div');
    other.style.cssText='display:flex;gap:6px;align-items:center;margin-top:5px;padding-top:7px;border-top:1px solid var(--line,#555)';
    var oi=document.createElement('input'); oi.type='text'; oi.value = q ? search.value.trim() : '';
    oi.placeholder='other — type your school'; oi.setAttribute('aria-label','other school name'); oi.maxLength=40;
    oi.style.cssText='flex:1;min-width:0;background:var(--surface2,#33363c);color:var(--text,#eee);border:1px solid var(--line,#555);border-radius:6px;padding:6px 8px;font-family:inherit;font-size:12px';
    var ob=document.createElement('button'); ob.type='button'; ob.textContent='use';
    ob.style.cssText='background:var(--accent,#6ec9a0);color:var(--on-accent,#0d1013);border:none;border-radius:6px;padding:6px 13px;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer';
    function useOther(){ var nm=oi.value.trim(); if(!nm) return;
      if(window.hkNameOk && !window.hkNameOk(nm)){ oi.value=''; oi.placeholder='pick a real school name'; oi.style.borderColor='var(--warn,#c77)'; setTimeout(function(){ oi.style.borderColor='var(--line,#555)'; oi.placeholder='other \u2014 your school, past or present'; },1800); return; }
      set('other:'+nm); }
    ob.onclick=useOther; oi.onkeydown=function(e){ if(e.key==='Enter'){ e.preventDefault(); useOther(); } };
    if(!shown && q){ var none=document.createElement('div');
      none.style.cssText='color:var(--faint,#888);font-size:11px;padding:6px 7px';
      none.textContent='no curated match — add it as “Other” below'; list.appendChild(none); }
    other.appendChild(oi); other.appendChild(ob); list.appendChild(other);
  }
  function renderCur(){
    if(state.value){ var s=window.schoolResolve(state.value);
      cur.innerHTML='<div style="display:flex;align-items:center;gap:9px;padding:2px 0">'+
        window.schoolChip(state.value,26)+'<span style="color:var(--text,#eee);font-size:13.5px;font-weight:600">'+_schEsc(s?s.name:state.value)+'</span>'+
        '<button type="button" data-clear="1" style="margin-left:auto;background:none;border:none;color:var(--faint,#888);font-family:inherit;font-size:11px;cursor:pointer;text-decoration:underline">remove</button></div>';
      var cl=cur.querySelector('[data-clear]'); if(cl) cl.onclick=function(){ set(null); };
    } else { cur.innerHTML='<div style="color:var(--faint,#888);font-size:12px;padding:2px 0">no school set — pick one to fly your colors</div>'; }
  }
  function set(v){ state.value=v; renderCur(); try{ if(onPick) onPick(v); }catch(e){} }
  search.oninput=function(){ renderList(search.value); };
  wrap.appendChild(cur); wrap.appendChild(search); wrap.appendChild(list);
  renderCur(); renderList('');
  wrap.getValue=function(){ return state.value; };
  wrap.setValue=function(v){ set(v); };
  return wrap;
};
