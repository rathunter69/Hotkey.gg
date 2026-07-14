/* themes.js — single source of truth for hotkey.gg color palettes.
   Loaded by index.html, leaderboard.html, and reference.html.
   Exposes: window.THEMES (the dict), window.applyTheme(name), window.currentTheme. */

window.THEMES = {
  default: { name:'Default', dark:true, vars:{
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
    accent:'#0e9b57', 'accent-dim':'#0a7442', 'accent-glow':'rgba(14,155,87,.16)',
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
    bg:'#f7e8ee', surface:'#fdf3f7', surface2:'#f2dde6', line:'#e6c2d1',
    text:'#3b2b32', muted:'#8a6b76', faint:'#c2a2ae',
    accent:'#c43a77', 'accent-dim':'#9a2a5a', 'accent-glow':'rgba(196,58,119,.14)',
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
  root.setAttribute('data-dark', t.dark ? '1' : '0');   // drives cell-color visibility overrides
  window.currentTheme = name;
  window.syncThemeLabels();
};

// On script load: apply the saved theme, else follow the OS preference — the SAME fallback the
// trainer uses, so navigating between pages never flips light/dark on a fresh browser.
// r204 (Wolf): Daylight is now THE default light theme; system-light browsers land there instead
// of the harsher plain Light. Dark stays 'default' (the windows-grey desk look Wolf likes).
(function(){
  let saved = null;
  try{ saved = localStorage.getItem('hotkey_theme'); }catch(e){}
  if(saved && window.THEMES[saved]){ window.applyTheme(saved); return; }
  try{
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    window.applyTheme(prefersLight ? 'daylight' : 'default');
  }catch(e){ window.applyTheme('default'); }
})();

// Theme-name labels live in the page body, which doesn't exist yet when this runs in <head>.
// Populate them once the DOM is ready; applyTheme keeps them in sync on every change after that.
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', window.syncThemeLabels);
else window.syncThemeLabels();

/* ---- rank emblems v3 (r128): LoL-grade layered crests, iteration-8 art ----
   Ported from art/rank-proto.html (Wolf-approved iteration 8). Single source for
   every page. API unchanged: rankEmblem(tierName, size, bucket) — bucket is the
   HK_RANK string ('Bottom/Middle/Top Bucket') or null; with a bucket the canvas
   grows a division-pip zone (viewBox 100x114, height = size*1.14) and the emblem
   ESCALATES: bottom = clean frame+glyph, middle = +ornaments, top = ignited
   (jewel, sparks, hot rim, brighter glow). 'MBA Associate' arrives bucket-null
   in-game (placement pending) so it renders the iron #REF! plate, no pips.
   Animation layers for the rank-up moment: .aura .frame .glyph .ornament .jewel
   .pips .sparks. Glow filters switch off under 24px (crisper, cheaper rows). */
window.RANK_EMBLEM_IDX = {'MBA Associate':0,'Candidate':1,'Summer Analyst':2,
  'First-Year Analyst':3,'Associate':4,'VP':5,'MD':6,'Second-Year Analyst':7};
window.rankEmblem = (function(){
  let UID=0;
  const IRON ={hi:'#a9aeb9',mid:'#7c828e',lo:'#525761',deep:'#26282e',plateHi:'#33363d',plateLo:'#1f2126',core:'#8b919d'};
  const SLATE={hi:'#c4c9d3',mid:'#9299a6',lo:'#5f6570',deep:'#2c2f36',plateHi:'#3a3d45',plateLo:'#24262c',core:'#a5abb8'};
  const BRONZE={hi:'#f4c088',mid:'#cf8e4c',lo:'#95602c',deep:'#432a12',plateHi:'#453425',plateLo:'#271e16',core:'#e8a45f'};
  const SILVER={hi:'#f4f7fc',mid:'#c9d0dc',lo:'#8e96a5',deep:'#454c59',plateHi:'#454b57',plateLo:'#262a32',core:'#dde2ea'};
  const GOLD ={hi:'#ffefb3',mid:'#f4c754',lo:'#bf8e20',deep:'#523a05',plateHi:'#4a3f20',plateLo:'#282112',core:'#ffd968'};
  const PLAT ={hi:'#e0fdf7',mid:'#86dcca',lo:'#3d9c8e',deep:'#173f3a',plateHi:'#25453f',plateLo:'#152522',core:'#8ef2df'};
  const CRIM ={hi:'#ffb3a1',mid:'#e65843',lo:'#9c2a1c',deep:'#3a0f0b',plateHi:'#3b1d19',plateLo:'#1f0f0e',core:'#ff6248'};
  const DIAM ={hi:'#f4fdff',mid:'#9be0f7',lo:'#4aa6cc',deep:'#153c50',plateHi:'#21404f',plateLo:'#12232c',core:'#a8ecff'};
  function defs(id,P,glow){
    return '<defs><linearGradient id="'+id+'m" x1="0" y1="0" x2="0" y2="1">'+
      '<stop offset="0" stop-color="'+P.hi+'"/><stop offset=".45" stop-color="'+P.mid+'"/>'+
      '<stop offset=".55" stop-color="'+P.lo+'"/><stop offset="1" stop-color="'+P.deep+'"/></linearGradient>'+
      '<linearGradient id="'+id+'p" x1="0" y1="0" x2="0" y2="1">'+
      '<stop offset="0" stop-color="'+P.plateHi+'"/><stop offset="1" stop-color="'+P.plateLo+'"/></linearGradient>'+
      '<radialGradient id="'+id+'core" cx=".5" cy=".4">'+
      '<stop offset="0" stop-color="'+P.core+'" stop-opacity=".55"/><stop offset="1" stop-color="'+P.core+'" stop-opacity="0"/></radialGradient>'+
      '<radialGradient id="'+id+'a"><stop offset=".25" stop-color="'+P.core+'" stop-opacity=".5"/><stop offset="1" stop-color="'+P.core+'" stop-opacity="0"/></radialGradient>'+
      (glow?'<filter id="'+id+'g" x="-45%" y="-45%" width="190%" height="190%">'+
      '<feGaussianBlur stdDeviation="'+glow+'" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>':'')+
      '</defs>';
  }
  function frame(id,P,path,glow,sw,hot){
    return '<g class="frame"'+(glow?' filter="url(#'+id+'g)"':'')+'>'+
      '<path d="'+path+'" fill="none" stroke="'+P.deep+'" stroke-width="'+((sw||3.4)+2.6)+'" stroke-linejoin="round"/>'+
      '<path d="'+path+'" fill="url(#'+id+'p)" stroke="url(#'+id+'m)" stroke-width="'+(sw||3.4)+'" stroke-linejoin="round"/>'+
      (hot?'<path d="'+path+'" fill="none" stroke="'+P.hi+'" stroke-width="1" opacity=".8" stroke-linejoin="round"/>':'')+
      '</g>';
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
  function sparks(P,pts){
    return '<g class="sparks">'+pts.map(function(q){ const x=q[0],y=q[1],s=q[2];
      return '<path d="M'+x+' '+(y-s)+' L'+(x+s*.3)+' '+(y-s*.3)+' L'+(x+s)+' '+y+' L'+(x+s*.3)+' '+(y+s*.3)+' L'+x+' '+(y+s)+' L'+(x-s*.3)+' '+(y+s*.3)+' L'+(x-s)+' '+y+' L'+(x-s*.3)+' '+(y-s*.3)+' Z" fill="#ffffff" opacity=".9"/>'; }).join('')+'</g>';
  }
  const GLY={
    book:function(id,P){ return '<g class="glyph" transform="translate(50 50) scale(1.12)">'+
      '<path d="M-12 7.5 Q -6.5 4 0 5 Q 6.5 4 12 7.5 L12 -6 Q 6.5 -9.5 0 -8.5 Q -6.5 -9.5 -12 -6 Z" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width="1"/>'+
      '<path d="M0 5 L0 -8.5" stroke="'+P.deep+'" stroke-width="1.1"/>'+
      '<path d="M-9 -3.5 Q -5 -5.5 -2.5 -4.5 M-9 0 Q -5 -2 -2.5 -1 M2.5 -4.5 Q 5 -5.5 9 -3.5 M2.5 -1 Q 5 -2 9 0" stroke="'+P.plateLo+'" stroke-width=".9" fill="none"/></g>'; },
    sun:function(id,P){ let rays='';
      for(let i=0;i<8;i++){ const a=i*Math.PI/4, L=(i%2?16.5:20), w=.21, R=11;
        rays+='<path d="M'+(Math.cos(a-w)*R).toFixed(1)+' '+(Math.sin(a-w)*R).toFixed(1)+' L'+(Math.cos(a)*L).toFixed(1)+' '+(Math.sin(a)*L).toFixed(1)+' L'+(Math.cos(a+w)*R).toFixed(1)+' '+(Math.sin(a+w)*R).toFixed(1)+' Z" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".7"/>'; }
      return '<g class="glyph" transform="translate(50 48)">'+rays+
        '<circle r="9.2" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width="1.1"/>'+
        '<circle r="5.2" fill="'+P.hi+'" opacity=".65"/></g>'; },
    keycap:function(id,P){ return '<g class="glyph" transform="translate(50 50)">'+
      '<rect x="-13" y="-12.5" width="26" height="25" rx="4.5" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width="1.2"/>'+
      '<rect x="-9.5" y="-9.5" width="19" height="17" rx="3" fill="'+P.plateLo+'" stroke="'+P.deep+'" stroke-width=".8"/>'+
      '<text x="0" y="1" text-anchor="middle" dominant-baseline="middle" font-family="JetBrains Mono,ui-monospace,monospace" font-weight="800" font-size="10.5" fill="'+P.hi+'">F4</text></g>'; },
    briefcase:function(id,P){ return '<g class="glyph" transform="translate(50 50.5)">'+
      '<path d="M-5 -9.5 L-5 -12 Q-5 -13.8 -3.2 -13.8 L3.2 -13.8 Q5 -13.8 5 -12 L5 -9.5" fill="none" stroke="'+P.deep+'" stroke-width="2.4"/>'+
      '<rect x="-14" y="-9.5" width="28" height="21" rx="2.5" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width="1.2"/>'+
      '<path d="M-14 -2.8 L14 -2.8" stroke="'+P.deep+'" stroke-width="1"/>'+
      '<rect x="-3.2" y="-5" width="6.4" height="4.8" rx="1" fill="'+P.plateLo+'" stroke="'+P.deep+'" stroke-width=".8"/>'+
      '<path d="M-10.5 -2.8 L-10.5 .5 M10.5 -2.8 L10.5 .5" stroke="'+P.deep+'" stroke-width="1.4"/>'+
      '<path d="M-12.5 -8 L12.5 -8" stroke="'+P.hi+'" stroke-width=".9" opacity=".6"/></g>'; },
    chart:function(id,P){ return '<g class="glyph" transform="translate(50 53)">'+
      '<rect x="-12" y="3" width="5.2" height="10" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".8"/>'+
      '<rect x="-3.5" y="-2" width="5.2" height="15" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".8"/>'+
      '<rect x="5" y="-7" width="5.2" height="20" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".8"/>'+
      '<path d="M-12 -6 L-1 -11 L5 -14.5 L12 -17.5" fill="none" stroke="'+P.hi+'" stroke-width="2.1" stroke-linecap="round"/>'+
      '<path d="M7 -19.5 L12.8 -17.8 L10.3 -12.6" fill="none" stroke="'+P.hi+'" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></g>'; },
    bull:function(id,P){ return '<g class="glyph" transform="translate(50 52)">'+
      '<path d="M-9.5 -6 Q-21.5 -8 -20.5 -22.5 Q-13 -16 -7.5 -11.5 Z" fill="#f3ead9" stroke="'+P.deep+'" stroke-width="1"/>'+
      '<path d="M9.5 -6 Q21.5 -8 20.5 -22.5 Q13 -16 7.5 -11.5 Z" fill="#f3ead9" stroke="'+P.deep+'" stroke-width="1"/>'+
      '<path d="M-10.5 -12.5 L10.5 -12.5 L14 -5 L8.5 4 L5 13 L-5 13 L-8.5 4 L-14 -5 Z" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width="1.2" stroke-linejoin="round"/>'+
      '<path d="M-5 -12.5 Q0 -9 5 -12.5" fill="none" stroke="'+P.deep+'" stroke-width=".9" opacity=".8"/>'+
      '<path d="M-8.7 -4.8 L-3.2 -2.6 L-3.8 -.4 L-8.7 -2.2 Z" fill="#ffe1d6"/>'+
      '<path d="M8.7 -4.8 L3.2 -2.6 L3.8 -.4 L8.7 -2.2 Z" fill="#ffe1d6"/>'+
      '<path d="M-7.5 5 Q0 8 7.5 5 L5 13 Q0 15.2 -5 13 Z" fill="'+P.lo+'" stroke="'+P.deep+'" stroke-width=".9"/>'+
      '<ellipse cx="-3.1" cy="9.6" rx="1.5" ry="2" fill="'+P.deep+'"/>'+
      '<ellipse cx="3.1" cy="9.6" rx="1.5" ry="2" fill="'+P.deep+'"/></g>'; },
    rocket:function(id,P){ return '<g class="glyph" transform="translate(50 48.5)">'+
      '<path d="M-7.2 3 L-13.5 12.5 L-6 9.8 Z" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".8"/>'+
      '<path d="M7.2 3 L13.5 12.5 L6 9.8 Z" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".8"/>'+
      '<path d="M-2.8 10.5 L0 19.5 L2.8 10.5 Z" fill="'+P.hi+'"/>'+
      '<path d="M-1.3 10.5 L0 15.5 L1.3 10.5 Z" fill="#ffffff"/>'+
      '<path d="M0 -18.5 Q7.2 -9.5 7.2 .5 Q7.2 6.5 5.2 10.5 L-5.2 10.5 Q-7.2 6.5 -7.2 .5 Q-7.2 -9.5 0 -18.5 Z" fill="#f6feff" stroke="'+P.lo+'" stroke-width="1.1"/>'+
      '<path d="M0 -18.5 Q-7.2 -9.5 -7.2 .5 Q-7.2 6.5 -5.2 10.5 L-2 10.5 Q-3.6 5 -3.6 -1 Q-3.6 -11 0 -18.5 Z" fill="'+P.mid+'" opacity=".35"/>'+
      '<circle cx="0" cy="-4.5" r="3.1" fill="'+P.plateLo+'" stroke="'+P.deep+'" stroke-width="1"/>'+
      '<circle cx="0" cy="-4.5" r="1.4" fill="'+P.hi+'" opacity=".8"/></g>'; },
  };
  function svgOpen(sz,bk,max){
    const vb = bk ? '0 0 100 114' : '0 0 100 100';
    const h = bk ? Math.round(sz*1.14) : sz;
    return '<svg class="rank-emblem'+(max?' emblem-max':'')+'" viewBox="'+vb+'" width="'+sz+'" height="'+h+'" aria-hidden="true">';
  }
  function t_mba(sz,bk,gl){ const id='rk'+(UID++), P=IRON, o2=bk>=2, hot=bk===3;
    const sq='M28 21 L72 21 L79 28 L79 72 L72 79 L28 79 L21 72 L21 28 Z';
    return svgOpen(sz,bk,false)+defs(id,P,gl&&hot?0.8:0)+
      (o2?'<g class="ornament"><circle cx="25.5" cy="25.5" r="2.1" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".6"/><circle cx="74.5" cy="25.5" r="2.1" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".6"/><circle cx="25.5" cy="74.5" r="2.1" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".6"/><circle cx="74.5" cy="74.5" r="2.1" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".6"/></g>':'')+
      frame(id,P,sq,gl&&hot?0.8:0,3.2,hot)+
      '<path d="M21 42 L79 42 M21 60 L79 60 M41 21 L41 79 M61 21 L61 79" stroke="'+P.mid+'" stroke-width=".8" opacity=".28"/>'+
      '<path d="M34 16 L55 43 L45 51 L64 84" fill="none" stroke="'+P.deep+'" stroke-width="1.8" opacity=".75"/>'+
      '<path d="M28.5 22.8 L71.5 22.8" stroke="#ffffff" stroke-width="1.2" opacity=".5"/>'+
      (hot?'<g class="jewel"><path d="M46.8 21 L50 14.5 L53.2 21 L50 24 Z" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".7"/></g>':'')+
      '<g class="glyph"><text x="50" y="55.8" text-anchor="middle" font-family="JetBrains Mono,ui-monospace,monospace" font-weight="800" font-size="14" fill="'+P.deep+'">#REF!</text>'+
      '<text x="50" y="55" text-anchor="middle" font-family="JetBrains Mono,ui-monospace,monospace" font-weight="800" font-size="14" fill="'+P.hi+'">#REF!</text></g>'+
      (hot?sparks(P,[[21,17,3],[79,17,3]]):'')+pips(id,P,bk)+'</svg>'; }
  function t_candidate(sz,bk,gl){ const id='rk'+(UID++), P=SLATE, o2=bk>=2, hot=bk===3, g=gl?[0,0,.4,.9][bk||1]:0;
    let notch=''; if(o2) for(let i=0;i<8;i++){ const a=i*45*Math.PI/180;
      notch+='<line x1="'+(50+Math.cos(a)*34).toFixed(1)+'" y1="'+(50+Math.sin(a)*34).toFixed(1)+'" x2="'+(50+Math.cos(a)*38.5).toFixed(1)+'" y2="'+(50+Math.sin(a)*38.5).toFixed(1)+'" stroke="url(#'+id+'m)" stroke-width="4.2"/>'; }
    return svgOpen(sz,bk,false)+defs(id,P,g)+
      (o2?'<g class="ornament">'+notch+'</g>':'')+
      frame(id,P,'M50 17 A33 33 0 1 1 49.9 17 Z',g,3.4,hot)+
      '<circle cx="50" cy="50" r="26.5" fill="none" stroke="'+P.mid+'" stroke-width="1" opacity="'+(o2?'.8':'.45')+'"/>'+
      '<path d="M26 39 A27 27 0 0 1 74 39" fill="none" stroke="#ffffff" stroke-width="1.3" opacity=".5"/>'+
      (hot?'<g class="jewel"><circle cx="50" cy="15.8" r="2.6" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".8"/><circle cx="50" cy="15.8" r="1.1" fill="#ffffff" opacity=".85"/></g>':'')+
      GLY.book(id,P)+(hot?sparks(P,[[22,26,3],[78,26,3]]):'')+pips(id,P,bk)+'</svg>'; }
  function t_summer(sz,bk,gl){ const id='rk'+(UID++), P=BRONZE, o2=bk>=2, hot=bk===3, g=gl?[0,0,.5,1][bk||1]:0;
    const sh='M50 10 L82 20 L79 54 L50 90 L21 54 L18 20 Z';
    return svgOpen(sz,bk,false)+defs(id,P,g)+
      '<circle cx="50" cy="48" r="29" fill="url(#'+id+'core)" opacity="'+(hot?1:o2?.7:.45)+'"/>'+
      (o2?'<g class="ornament"><path d="M18 22 L8 17 L15 33 Z" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".8"/><path d="M82 22 L92 17 L85 33 Z" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".8"/><circle cx="25" cy="24.5" r="2" fill="url(#'+id+'m)"/><circle cx="75" cy="24.5" r="2" fill="url(#'+id+'m)"/><circle cx="23.5" cy="50" r="2" fill="url(#'+id+'m)"/><circle cx="76.5" cy="50" r="2" fill="url(#'+id+'m)"/></g>':'')+
      frame(id,P,sh,g,3.4,hot)+
      '<path d="M21 19.2 L50 11 L79 19.2" fill="none" stroke="#ffffff" stroke-width="1.4" opacity=".65"/>'+
      (hot?'<g class="jewel"><path d="M46 12.2 L50 5.5 L54 12.2 Z" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".8"/><circle cx="50" cy="10" r="1.1" fill="#ffffff" opacity=".85"/></g>':'')+
      GLY.sun(id,P)+(hot?sparks(P,[[18,17,3.2],[82,17,3.2]]):'')+pips(id,P,bk)+'</svg>'; }
  function t_firstyear(sz,bk,gl){ const id='rk'+(UID++), P=SILVER, o2=bk>=2, hot=bk===3, g=gl?[0,0,.6,1.1][bk||1]:0;
    const hx='M50 8 L82 26 L82 62 L50 92 L18 62 L18 26 Z';
    return svgOpen(sz,bk,false)+defs(id,P,g)+
      '<circle cx="50" cy="49" r="30" fill="url(#'+id+'core)" opacity="'+(hot?1:o2?.7:.45)+'"/>'+
      (o2?'<g class="ornament"><path d="M18 26 L8 21 L18 36 M82 26 L92 21 L82 36" fill="none" stroke="url(#'+id+'m)" stroke-width="2.8"/></g>':'')+
      (hot?'<g class="ornament"><path d="M18 62 L10 70 M82 62 L90 70" stroke="url(#'+id+'m)" stroke-width="2.8"/></g>':'')+
      frame(id,P,hx,g,3.4,hot)+
      '<path d="M50 12.5 L78 28 M50 12.5 L22 28" stroke="#ffffff" stroke-width="1.3" opacity=".55"/>'+
      (hot?'<g class="jewel"><path d="M46.5 10 L50 3.5 L53.5 10 L50 13 Z" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".8"/></g>':'')+
      GLY.keycap(id,P)+(hot?sparks(P,[[10,20,3.2],[90,20,3.2]]):'')+pips(id,P,bk)+'</svg>'; }
  function t_associate(sz,bk,gl){ const id='rk'+(UID++), P=GOLD, o2=bk>=2, hot=bk===3, g=gl?[0,.7,1.1,1.6][bk||1]:0;
    const cr='M50 11 L63 21 L84 16 L80 46 L68 78 L50 88 L32 78 L20 46 L16 16 L37 21 Z';
    let lr=''; if(o2) for(let s of [-1,1]){
      lr+='<path d="M'+(50+s*31)+' 78 q '+(s*17)+' -12 '+(s*18)+' -38" fill="none" stroke="url(#'+id+'m)" stroke-width="2.5" stroke-linecap="round"/>';
      for(let l=0;l<5;l++){ const t2=l/4.4, x=50+s*(31+16*t2*(2-t2)*0.95), y=77-38*t2;
        lr+='<ellipse cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" rx="5" ry="2.1" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".5" transform="rotate('+(s*(-54+t2*70)).toFixed(1)+' '+x.toFixed(1)+' '+y.toFixed(1)+')"/>'; } }
    return svgOpen(sz,bk,false)+defs(id,P,g)+
      '<circle cx="50" cy="48" r="31" fill="url(#'+id+'core)" opacity="'+(hot?1:o2?.8:.55)+'"/>'+
      (o2?'<g class="ornament">'+lr+'</g>':'')+
      frame(id,P,cr,g,3.4,hot)+
      '<path d="M37 21.6 L50 12 L63 21.6" fill="none" stroke="#ffffff" stroke-width="1.4" opacity=".7"/>'+
      (hot?'<g class="jewel"><circle cx="50" cy="16.5" r="2.4" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".8"/><circle cx="50" cy="16.5" r="1" fill="#ffffff" opacity=".9"/></g>':'')+
      GLY.briefcase(id,P)+(hot?sparks(P,[[16,13,3.4],[84,13,3.4]]):'')+pips(id,P,bk)+'</svg>'; }
  function t_vp(sz,bk,gl){ const id='rk'+(UID++), P=PLAT, o2=bk>=2, hot=bk===3, g=gl?[0,1,1.5,2][bk||1]:0;
    const cr='M50 10 L60 20 L84 14 L78 40 L82 52 L62 84 L50 92 L38 84 L18 52 L22 40 L16 14 L40 20 Z';
    return svgOpen(sz,bk,false)+defs(id,P,g)+
      (hot?'<g class="aura" opacity=".7"><circle cx="50" cy="50" r="48" fill="url(#'+id+'a)"/></g>':'')+
      '<circle cx="50" cy="48" r="33" fill="url(#'+id+'core)" opacity="'+(hot?1:o2?.8:.55)+'"/>'+
      (o2?'<g class="ornament"><path d="M16 14 L4 8 L14 26 L8 24 L18 38" fill="none" stroke="url(#'+id+'m)" stroke-width="2.8" stroke-linejoin="round"/><path d="M84 14 L96 8 L86 26 L92 24 L82 38" fill="none" stroke="url(#'+id+'m)" stroke-width="2.8" stroke-linejoin="round"/></g>':'')+
      (hot?'<g class="ornament"><path d="M38 84 L30 94 M62 84 L70 94" stroke="url(#'+id+'m)" stroke-width="2.4"/></g>':'')+
      frame(id,P,cr,g,3.4,hot)+
      '<path d="M40 20.5 L50 11 L60 20.5" fill="none" stroke="#ffffff" stroke-width="1.4" opacity=".75"/>'+
      (hot?'<g class="jewel"><path d="M50 10 L50 3" stroke="url(#'+id+'m)" stroke-width="2.4"/><circle cx="50" cy="2.5" r="2" fill="'+P.hi+'"/></g>':'')+
      GLY.chart(id,P)+(hot?sparks(P,[[4,8,3.6],[96,8,3.6]]):'')+pips(id,P,bk)+'</svg>'; }
  function t_md(sz,bk,gl){ const id='rk'+(UID++), P=CRIM, o2=bk>=2, hot=bk===3, g=gl?[0,1.6,2.1,2.6][bk||1]:0;
    const cr='M50 14 L64 22 L88 10 L80 38 L86 50 L64 86 L50 94 L36 86 L14 50 L20 38 L12 10 L36 22 Z';
    let horns='';
    for(let s of [-1,1]){
      horns+='<path d="M'+(50+s*38)+' 26 Q '+(50+s*58)+' 14 '+(50+s*62)+' -2 Q '+(50+s*50)+' 8 '+(50+s*42)+' 10 Q '+(50+s*46)+' 16 '+(50+s*38)+' 26 Z" transform="translate(0 14)" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width="1"/>';
      horns+='<path d="M'+(50+s*36)+' 60 Q '+(50+s*52)+' 62 '+(50+s*56)+' 74 Q '+(50+s*44)+' 70 '+(50+s*40)+' 66 Z" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".8"/>'; }
    return svgOpen(sz,bk,false)+defs(id,P,g)+
      '<g class="aura" opacity="'+(hot?1:o2?.8:.55)+'"><circle cx="50" cy="50" r="49" fill="url(#'+id+'a)"/></g>'+
      '<circle cx="50" cy="50" r="34" fill="url(#'+id+'core)"/>'+
      (o2?'<g class="ornament">'+horns+'</g>':'')+
      frame(id,P,cr,g,3.6,hot)+
      '<g class="ornament"'+(hot&&g?' filter="url(#'+id+'g)"':'')+'>'+
      '<path d="M35 21 L38 7 L46 15 L50 4 L54 15 L62 7 L65 21 Z" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width="1.1"/>'+
      (hot?'<circle cx="50" cy="3" r="2.3" fill="#ffd9cf"/><circle cx="38.4" cy="6.2" r="1.5" fill="#ffd9cf"/><circle cx="61.6" cy="6.2" r="1.5" fill="#ffd9cf"/>':'')+'</g>'+
      GLY.bull(id,P)+(hot?sparks(P,[[12,10,3.8],[88,10,3.8],[50,-1,3]]):'')+pips(id,P,bk)+'</svg>'; }
  function t_summit(sz,bk,gl){ const id='rk'+(UID++), P=DIAM, o2=bk>=2, hot=bk===3, g=gl?[0,1.8,2.3,2.8][bk||1]:0;
    const sp='M50 2 L65 17 L90 21 L77 45 L81 61 L59 88 L50 98 L41 88 L19 61 L23 45 L10 21 L35 17 Z';
    const rop=o2?1:.45;
    let rays=''; for(let i=0;i<20;i++){ const a=(i*18-90)*Math.PI/180, big=i%5===0;
      rays+='<line x1="'+(50+Math.cos(a)*(big?39:42)).toFixed(1)+'" y1="'+(50+Math.sin(a)*(big?39:42)).toFixed(1)+'" x2="'+(50+Math.cos(a)*(big?50:46.5)).toFixed(1)+'" y2="'+(50+Math.sin(a)*(big?50:46.5)).toFixed(1)+'" stroke="'+(big?'#ffd968':P.hi)+'" stroke-width="'+(big?2.6:0.9)+'" stroke-linecap="round" opacity="'+((big?0.95:0.5)*rop).toFixed(2)+'"/>'; }
    let shards=''; for(let s of [-1,1]){
      shards+='<path d="M'+(50+s*44)+' 29 L'+(50+s*51)+' 23 L'+(50+s*48)+' 33 Z" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".6"/>'+
        '<path d="M'+(50+s*46)+' 51 L'+(50+s*54)+' 49 L'+(50+s*48)+' 59 Z" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".6"/>'+
        (hot?'<path d="M'+(50+s*37)+' 77 L'+(50+s*45)+' 83 L'+(50+s*36)+' 85 Z" fill="url(#'+id+'m)" stroke="'+P.deep+'" stroke-width=".6"/>':''); }
    return svgOpen(sz,bk,true)+defs(id,P,g)+
      '<g class="aura" opacity="'+(hot?1:o2?.8:.6)+'"><circle cx="50" cy="50" r="49" fill="url(#'+id+'a)"/>'+rays+'</g>'+
      '<circle cx="50" cy="50" r="34" fill="url(#'+id+'core)"/>'+
      (o2?'<g class="ornament">'+shards+'</g>':'')+
      frame(id,P,sp,g,3.6,hot)+
      '<path d="M35 17.8 L50 3.5 L65 17.8" fill="none" stroke="#ffffff" stroke-width="1.5" opacity=".85"/>'+
      (hot?'<g class="jewel"><path d="M50 -3 L51.6 1.4 L56 3 L51.6 4.6 L50 9 L48.4 4.6 L44 3 L48.4 1.4 Z" fill="#ffd968" stroke="#523a05" stroke-width=".6"/></g>':'')+
      GLY.rocket(id,P)+(hot?sparks(P,[[10,21,3.8],[90,21,3.8],[50,-2,3.2]]):'')+pips(id,P,bk)+'</svg>'; }
  const BUILD=[t_mba,t_candidate,t_summer,t_firstyear,t_associate,t_vp,t_md,t_summit];
  // tier accent colors for celebration confetti etc. — same palettes as the emblems
  window.RANK_COLORS={'MBA Associate':[IRON.mid,IRON.hi],'Candidate':[SLATE.mid,SLATE.hi],
    'Summer Analyst':[BRONZE.mid,BRONZE.hi],'First-Year Analyst':[SILVER.mid,SILVER.hi],
    'Associate':[GOLD.mid,GOLD.hi],'VP':[PLAT.mid,PLAT.hi],'MD':[CRIM.mid,CRIM.hi],
    'Second-Year Analyst':[DIAM.mid,DIAM.hi,'#ffd968']};
  return function(tierName, size, bucket){
    size = size || 16;
    // 'Unranked' (no placement yet, anywhere a tier is unknown): the empty-cell plate
    if(tierName==='Unranked'){
      const id='rk'+(UID++), P=IRON;
      return svgOpen(size,0,false)+defs(id,P,0)+
        frame(id,P,'M28 21 L72 21 L79 28 L79 72 L72 79 L28 79 L21 72 L21 28 Z',0,3.2)+
        '<path d="M21 42 L79 42 M21 60 L79 60 M41 21 L41 79 M61 21 L61 79" stroke="'+P.mid+'" stroke-width=".8" opacity=".22"/>'+
        '<path d="M28.5 22.8 L71.5 22.8" stroke="#ffffff" stroke-width="1.2" opacity=".4"/>'+
        '<rect x="36" y="36" width="28" height="28" fill="none" stroke="'+P.mid+'" stroke-width="1.6" stroke-dasharray="4.2 3.2" opacity=".85"/>'+
        '<g class="glyph"><path d="M44 44 L56 56 M56 44 L44 56" stroke="url(#'+id+'m)" stroke-width="3.6" stroke-linecap="round"/>'+
        '<path d="M44 44 L56 56 M56 44 L44 56" stroke="#ffffff" stroke-width="1" stroke-linecap="round" opacity=".35"/></g></svg>';
    }
    const i = window.RANK_EMBLEM_IDX[tierName] ?? 0;
    const bk = typeof bucket==='number' ? bucket
      : bucket==='Top Bucket' ? 3 : bucket==='Middle Bucket' ? 2 : bucket==='Bottom Bucket' ? 1 : 0;
    const gl = size>=24 ? 1 : 0;   // glow filters off at row/chip sizes: crisper + cheaper
    return BUILD[i](size, bk, gl);
  };
})();

window.hkLevelRing = function(lvl, pct, size){
  size=size||56;
  const r=24, C=2*Math.PI*r, off=C*(1-Math.max(0,Math.min(100,pct))/100);
  return '<svg viewBox="0 0 56 56" width="'+size+'" height="'+size+'" aria-hidden="true">'+
    '<circle cx="28" cy="28" r="'+r+'" fill="none" stroke="var(--surface)" stroke-width="5"/>'+
    '<circle cx="28" cy="28" r="'+r+'" fill="none" stroke="var(--accent)" stroke-width="5" stroke-linecap="round" '+
      'stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'" transform="rotate(-90 28 28)">'+
      /* r85: the fitness-app sweep — SMIL animates on mount, no wiring anywhere */
      '<animate attributeName="stroke-dashoffset" from="'+C.toFixed(1)+'" to="'+off.toFixed(1)+'" dur="0.9s" '+
        'calcMode="spline" keySplines="0.2 0.8 0.2 1" fill="freeze"/>'+
      '</circle>'+
    '<text x="28" y="26.5" text-anchor="middle" font-family="JetBrains Mono,ui-monospace,monospace" font-weight="700" font-size="14" fill="var(--text)">'+lvl+'</text>'+
    '<text x="28" y="38" text-anchor="middle" font-family="JetBrains Mono,ui-monospace,monospace" font-size="6.5" letter-spacing="1.5" fill="var(--muted)">LVL</text></svg>';
};
window.hkLevelChip = function(lvl, size){
  size=size||22;
  const m = lvl>=20?['#8ab4ff','#c4d7ff'] : lvl>=15?['#e3b341','#ffd769'] : lvl>=10?['#b9c2cf','#dde4ee'] : lvl>=5?['#b0793f','#e0a35c'] : ['#6f7480','#a8adb6'];
  return '<svg viewBox="0 0 24 24" width="'+size+'" height="'+size+'" aria-hidden="true" style="vertical-align:-4px">'+
    '<rect x="2.5" y="4" width="19" height="17" rx="4.5" fill="rgba(0,0,0,.5)"/>'+
    '<rect x="3.5" y="2.8" width="17" height="15.6" rx="4" fill="#2a2d34" stroke="'+m[0]+'" stroke-width="1.6"/>'+
    '<text x="12" y="14.6" text-anchor="middle" font-family="JetBrains Mono,ui-monospace,monospace" font-weight="700" font-size="'+(String(lvl).length>2?8:9.5)+'" fill="'+m[1]+'">'+lvl+'</text></svg>';
};

/* ---- shared rank/level math for account.html + stats.html (older pages keep
   their documented duplicates — sync all on threshold changes) ---- */
window.HK_RANK = {
  /* THE LADDER, desk-culture edition. MBA Associate is the floor (they mean well),
     the MD can't use Excel, and the Second-Year Analyst is the true final boss.
     pct thresholds live on the SHRUNK rating scale (see ratingOf): each equals the
     advertised raw performance at that tier's gate att: rating=(att*raw+K/2)/(att+K). */
  TIERS:[
    {name:'MBA Associate',       cls:'tier-mba',      att:0,  pct:9,    req:'everyone starts here \u2014 yes, everyone'},
    {name:'Candidate',           cls:'tier-unranked', att:5,  pct:1.01, req:'5 drills attempted, any placement'},
    {name:'Summer Analyst',      cls:'tier-bronze',   att:8,  pct:0.53, req:'8 drills \u00b7 top 55% avg placement'},
    {name:'First-Year Analyst',  cls:'tier-silver',   att:10, pct:0.375, req:'10 drills \u00b7 top 30%'},
    {name:'Associate',           cls:'tier-gold',     att:12, pct:0.31, req:'12 drills \u00b7 top 22%'},
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
      if(ch.indexOf('daily-')===0){ xp+=30; return; }
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

/* ---- achievement badges: hex medals, single source (inline copy in index — sync) ---- */
window.hkBadge = function(id, earned, size, color, rarity){
  // r138: RARITY METALS — rarity = % of players holding it (from run-derived
  // global stats). <=25% rare (platinum blue), <=10% epic (crimson), <=3%
  // legendary (radiant gold + rays). Explicit `color` (campaign groups) wins.
  size=size||26;
  // hexagonal medal, video-game achievement style. Earned = gold + glow; locked = ghost outline.
  const G={
    spd:'<path d="M14 8l-4 6h4l-2 6 6-8h-4l2-4z"/>',
    vol:'<path d="M8.5 17.5h9 M8.5 14h9 M8.5 10.5h9"/>',
    str:'<path d="M13 7c2.6 2 4.4 4.2 4.4 7a4.4 4.4 0 0 1-8.8 0c0-1.4.6-2.6 1.5-3.7.2 1 .8 1.8 1.7 2.2-.3-2 .2-4 1.2-5.5z"/>',
    crn:'<path d="M8 17l-1-6 3.4 2.4L13 9.5l2.6 3.9L19 11l-1 6z"/>',
    day:'<circle cx="13" cy="13" r="4.4"/><path d="M13 5.6v1.8 M13 18.6v1.8 M5.6 13h1.8 M18.6 13h1.8"/>',
    gnt:'<path d="M8 8v10 M8 8h8l-2 2.5 2 2.5H8"/>',
    c1:'<path d="M8 9.5h10 M8 13h10 M8 16.5h6"/>',                                                         // v1 — the statement takes shape
    c2:'<path d="M13 7v3 M13 10c-3 0-5 1.4-5 3.2 0 1.6 1.4 2.8 3.2 2.8H14.8c1.8 0 3.2 1.2 3.2 2.8"/><path d="M8 19h10"/>',  // v2 — balance
    c3:'<path d="M7 9h4v3h4v3h4v3H7z"/>',                                                                   // v3 — the waterfall steps down
    c4:'<path d="M10.5 15.5a3 3 0 0 1 0-4.2l1.8-1.8a3 3 0 0 1 4.2 4.2 M15.5 10.5a3 3 0 0 1 0 4.2l-1.8 1.8a3 3 0 0 1-4.2-4.2"/>',  // v4 — the statements link
    c5:'<path d="M16.5 8c-4 0-7 1.4-7 3s2.6 3 6 3-5.6 1.2-5.6 2.6 2 2.4 4.6 2.4"/>',                        // v5 — the debt corkscrew
    c6:'<circle cx="13" cy="13" r="3"/><path d="M13 7.5v2 M13 16.5v2 M7.5 13h2 M16.5 13h2 M9.2 9.2l1.4 1.4 M15.4 15.4l1.4 1.4 M16.8 9.2l-1.4 1.4 M9.6 15.4l-1.4 1.4"/>',  // v6 — working capital gears
    c7:'<path d="M13 7.5l5.5 9.5h-11z"/><circle cx="13" cy="14" r="1.2"/>',                                 // v7 — three statements, one triangle
    c8:'<path d="M13 6.5c2.4 2 3.4 4.6 3.4 7.4l-1.6 2.6h-3.6l-1.6-2.6c0-2.8 1-5.4 3.4-7.4z M11.6 16.5l-1.6 3 M14.4 16.5l1.6 3 M13 10.5v2"/>',  // v8 — ship it
    /* r150: the new class — every new achievement family gets its own mark */
    rx:'<path d="M7.5 8.5h3v3h3v3h3 M7.5 17.5h11"/>',                                                        // rx — the waterfall steps to the floor
    flag:'<path d="M9 7.5v11 M9 8h7.5l-1.8 2.5 1.8 2.5H9"/><circle cx="9" cy="18.5" r="1" fill="currentColor" stroke="none"/>', // race flag planted
    sheet:'<path d="M9 6.5h6l2.5 2.5V19.5H9z M15 6.5V9h2.5"/><path d="M10.8 14.2l1.6 1.8 3-3.6"/>',          // morning sheet — page + tick
    ice:'<path d="M13 6.5v13 M7.4 9.8l11.2 6.4 M18.6 9.8L7.4 16.2 M13 6.5l-1.6 1.8 M13 6.5l1.6 1.8 M13 19.5l-1.6-1.8 M13 19.5l1.6-1.8"/>', // freeze
    map:'<path d="M7.5 8.5l3.5-1.5 4 1.5 3.5-1.5v10l-3.5 1.5-4-1.5-3.5 1.5z M11 7v10 M15 8.5v10"/>',          // model tour — the map fold
    brush:'<path d="M15.5 6.8l3 3-6.4 6.4-3-3z M9 13.5c-1.6.4-2.4 1.6-2.4 3.4 1.8.4 3.2-.2 3.8-1.6"/>',      // house style — the paint pass
    keys:'<path d="M7 10.5h12v6H7z M9.5 13h1 M12.5 13h1 M15.5 13h1 M9.5 15h7"/>',                             // chord library — keyboard
    fin:'<path d="M13 7.4l1.5 3.4 3.7.3-2.8 2.4.9 3.6-3.3-2-3.3 2 .9-3.6-2.8-2.4 3.7-.3z" fill="currentColor" stroke="none"/>' // star
  };
  const hex='M13 2.8 L21.7 7.9 V18.1 L13 23.2 L4.3 18.1 V7.9 Z';
  const hexIn='M13 5.1 L19.7 9 V17 L13 20.9 L6.3 17 V9 Z';
  let metal=null, regalia='';
  if(earned && rarity!==undefined && rarity!==null && isFinite(rarity)){
    if(rarity<=3){ metal='#ffd76e';   // LEGENDARY — radiant: apex rays + shoulder sparks
      regalia='<path d="M13 -.2v2.6 M7.8 1l1 2.2 M18.2 1l-1 2.2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>'+
              '<path d="M2.6 4.2l1.6 1.3 M23.4 4.2l-1.6 1.3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity=".9"/>'; }
    else if(rarity<=10){ metal='#e2574d';  // EPIC — crimson, side fins
      regalia='<path d="M1.8 10.6l2.2 1.1 M1.8 15.2l2.2-1.1 M24.2 10.6L22 11.7 M24.2 15.2L22 14.1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity=".85"/>'; }
    else if(rarity<=25){ metal='#8ab4ff';  // RARE — platinum blue, second inner ring
      regalia='<path d="M13 6.4 L18.6 9.7 V16.3 L13 19.6 L7.4 16.3 V9.7 Z" fill="none" stroke="currentColor" stroke-width=".6" opacity=".4"/>'; }
  }
  const col = earned ? (color||metal||'var(--warn)') : 'var(--faint)';
  // r67: earned medals wear the regalia — double ring + apex notches; locked stays a ghost.
  const crown = earned ? '<path d="M13 .8v1.6 M5.2 5.4l1.3.9 M20.8 5.4l-1.3.9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>' : '';
  return '<svg class="hk-badge'+(earned?' earned':' off')+'" viewBox="0 0 26 26" width="'+size+'" height="'+size+'" style="color:'+col+'">'+
    crown+regalia+
    '<path d="'+hex+'" fill="currentColor" opacity="'+(earned?(metal?'.2':'.16'):'.05')+'"/>'+
    '<path d="'+hex+'" fill="none" stroke="currentColor" stroke-width="1.6"/>'+
    (earned?'<path d="'+hexIn+'" fill="none" stroke="currentColor" stroke-width=".9" opacity=".55"/>':'')+
    '<g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+(G[id]||G.fin)+'</g>'+
    '</svg>';
};
// r138: shared rarity helpers — tier word + tooltip fragment (stats grid + cards)
window.hkRarityTier = function(pct){
  if(pct===undefined||pct===null||!isFinite(pct)) return null;
  if(pct<=3) return 'legendary'; if(pct<=10) return 'epic'; if(pct<=25) return 'rare'; return null;
};
/* r150: EFFECTIVE RARITY — metals were pure data (% of players holding it), which at
   beta scale reads all-gold (1 of 3 players = 33% = common). Each achievement now
   carries a hand-set difficulty tier ('r'/'e'/'l') as the DISPLAY FLOOR; live data
   takes over once the field is big enough to mean something (>= 20 players). */
window.hkEffRarity = function(tier, dataPct, fieldN){
  if((fieldN|0)>=20 && dataPct!==undefined && dataPct!==null && isFinite(dataPct)) return dataPct;
  return tier==='l' ? 3 : tier==='e' ? 10 : tier==='r' ? 25 : 100;
};
