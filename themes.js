/* themes.js — single source of truth for hotkey.gg color palettes.
   Loaded by index.html, leaderboard.html, and reference.html.
   Exposes: window.THEMES (the dict), window.applyTheme(name), window.currentTheme. */

window.THEMES = {
  default: { name:'Default', dark:true, vars:{
    bg:'#0c0d0e', surface:'#141517', surface2:'#1c1d20', line:'#26282c',
    text:'#e9e8e3', muted:'#7c7d77', faint:'#4c4d49',
    accent:'#2ea36f', 'accent-dim':'#1d6647', 'accent-glow':'rgba(46,163,111,.22)',
    warn:'#d9a441', bad:'#c8533f' }},
  daylight: { name:'Daylight', dark:false, vars:{
    bg:'#e8eaed', surface:'#f8f9fb', surface2:'#edeff2', line:'#ccd0d6',
    text:'#1f2328', muted:'#5c636e', faint:'#99a0ab',
    accent:'#2ea36f', 'accent-dim':'#1d6647', 'accent-glow':'rgba(46,163,111,.14)',
    warn:'#9a6700', bad:'#b3261e' }},
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
  root.setAttribute('data-dark', t.dark ? '1' : '0');   // drives cell-color visibility overrides
  window.currentTheme = name;
  window.syncThemeLabels();
};

// On script load: apply the saved theme, else default to Daylight (soft light, Excel-like) so new
// visitors land in light mode the way Excel opens. Anyone who picks another theme keeps it.
(function(){
  let saved = null;
  try{ saved = localStorage.getItem('hotkey_theme'); }catch(e){}
  if(!saved || !window.THEMES[saved]) saved = 'daylight';
  window.applyTheme(saved);
})();

// Theme-name labels live in the page body, which doesn't exist yet when this runs in <head>.
// Populate them once the DOM is ready; applyTheme keeps them in sync on every change after that.
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', window.syncThemeLabels);
else window.syncThemeLabels();

/* ---- rank emblems: military-style insignia per tier, glow via currentColor ----
   Single source of truth for every page (themes.js loads everywhere). */

/* ---- rank emblems: LoL-style layered crests, single source for all pages ---- */
window.RANK_EMBLEM_IDX = {'Candidate':0,'Summer Analyst':1,'Incoming Analyst':2,
  'First-Year Analyst':3,'Top-Bucket Analyst':4,'Second-Year Analyst':5};
window.rankEmblem = function(tierName, size){
  const i = window.RANK_EMBLEM_IDX[tierName] ?? 0;
  size = size || 16;
  // Layered crest in currentColor with opacity depth — no gradient ids, safe to repeat on a page.
  const shield = '<path d="M12 2.6 L19 5.4 V12 C19 16.6 15.9 20 12 21.6 C8.1 20 5 16.6 5 12 V5.4 Z" fill="currentColor" opacity=".16"/>'+
                 '<path d="M12 2.6 L19 5.4 V12 C19 16.6 15.9 20 12 21.6 C8.1 20 5 16.6 5 12 V5.4 Z" fill="none" stroke="currentColor" stroke-width="1.5"/>';
  const gem    = '<path d="M12 8 L15 11.2 L12 15.4 L9 11.2 Z" fill="currentColor"/>'+
                 '<path d="M12 8 L15 11.2 L12 15.4 Z" fill="currentColor" opacity=".55"/>';
  const laurelL= '<path d="M4.4 8 C2.6 10.8 2.6 14.6 4.6 17.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>'+
                 '<path d="M4.1 10.4 L2.4 9.8 M3.8 12.6 L2 12.4 M4.1 14.8 L2.4 15.3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>';
  const laurelR= '<path d="M19.6 8 C21.4 10.8 21.4 14.6 19.4 17.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>'+
                 '<path d="M19.9 10.4 L21.6 9.8 M20.2 12.6 L22 12.4 M19.9 14.8 L21.6 15.3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>';
  const wings  = '<path d="M5 7.2 C2.8 6.4 1.6 4.6 1.2 3 C3.6 3.4 5.4 4.4 6.4 5.8" fill="currentColor" opacity=".8"/>'+
                 '<path d="M19 7.2 C21.2 6.4 22.4 4.6 22.8 3 C20.4 3.4 18.6 4.4 17.6 5.8" fill="currentColor" opacity=".8"/>';
  const crown  = '<path d="M8.4 3.4 L9.6 1.4 L12 2.8 L14.4 1.4 L15.6 3.4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>';
  const star   = '<path d="M12 9 L13 11.4 L15.6 11.6 L13.7 13.3 L14.3 15.9 L12 14.5 L9.7 15.9 L10.3 13.3 L8.4 11.6 L11 11.4 Z" fill="currentColor"/>';
  let body='';
  if(i===0)      body = '<path d="M12 2.6 L19 5.4 V12 C19 16.6 15.9 20 12 21.6 C8.1 20 5 16.6 5 12 V5.4 Z" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".7"/>';
  else if(i===1) body = shield + gem;
  else if(i===2) body = shield + gem + laurelL + laurelR;
  else if(i===3) body = shield + gem + laurelL + laurelR + crown;
  else if(i===4) body = shield + gem + laurelL + laurelR + crown + wings;
  else           body = shield.replace('.16','.28') + star + laurelL + laurelR + crown + wings;
  return '<svg class="rank-emblem'+(i>=4?' emblem-max':'')+'" viewBox="0 0 24 24" width="'+size+'" height="'+size+'" aria-hidden="true">'+body+'</svg>';
};

/* ---- shared rank/level math for account.html + stats.html (older pages keep
   their documented duplicates — sync all on threshold changes) ---- */
window.HK_RANK = {
  TIERS:[
    {name:'Candidate',           cls:'tier-unranked', att:0,  pct:9,    req:'take the placement — everyone starts here'},
    {name:'Summer Analyst',      cls:'tier-bronze',   att:5,  pct:1.01, req:'5 drills attempted, any placement'},
    {name:'Incoming Analyst',    cls:'tier-silver',   att:8,  pct:0.55, req:'8 drills \u00b7 top 55% avg placement'},
    {name:'First-Year Analyst',  cls:'tier-gold',     att:10, pct:0.30, req:'10 drills \u00b7 top 30%'},
    {name:'Top-Bucket Analyst',  cls:'tier-platinum', att:13, pct:0.15, req:'13 drills \u00b7 top 15%'},
    {name:'Second-Year Analyst', cls:'tier-diamond',  att:15, pct:0.05, req:'15 drills \u00b7 top 5% \u2014 the summit'},
  ],
  tierOf(avgPct, att){
    const T=this.TIERS;
    if(avgPct===null || (att||0)<5) return {...T[0], i:0, bucket:null, full:T[0].name};
    let t={...T[1], i:1};
    for(let i=T.length-1;i>=1;i--){ if(att>=T[i].att && avgPct<=T[i].pct){ t={...T[i], i}; break; } }
    // BUCKETS — comp-review language. Your position inside the tier's percentile band,
    // split in thirds: Top / Middle / Bottom Bucket. The summit tier buckets within 0–5%.
    const hi = t.pct>1 ? 1 : t.pct;                      // band ceiling (worse pct)
    const lo = t.i+1 < T.length ? T[t.i+1].pct : 0;       // band floor (better pct)
    const span = Math.max(1e-9, hi-lo);
    const pos = Math.min(1, Math.max(0, (avgPct-lo)/span));  // 0 = best in band
    t.bucket = pos<=1/3 ? 'Top Bucket' : (pos<=2/3 ? 'Middle Bucket' : 'Bottom Bucket');
    t.full = t.name+' \u00b7 '+t.bucket;
    return t;
  },
  levelOf(xp){ let lvl=1, need=150, floor=0;
    while(xp>=floor+need){ floor+=need; lvl++; need=150*lvl; }
    return {lvl, into:xp-floor, need, pct:Math.min(100,Math.round(100*(xp-floor)/need))}; },
  computeXP(myRuns, pl){
    const perD={}; let xp=0;
    (myRuns||[]).forEach(r=>{ const ch=r.challenge||'';
      if(ch.indexOf('daily-')===0){ xp+=30; return; }
      if(ch.indexOf('wk-')===0){ xp+=25; return; }
      const nth=(perD[ch]=(perD[ch]||0)+1);
      xp += nth===1 ? 50 : (nth<=10 ? 15 : 3); });
    return xp + 25*(pl.t10||0) + 100*(pl.pod||0) + 250*(pl.crowns||0);
  },
  // per-user placements from a full best-sorted runs list (mouse_used=false, time asc)
  standing(runs, meId, menuOrder){
    const per={}; menuOrder.forEach(k=>per[k]=[]);
    const seen={};
    runs.forEach(x=>{ if(per[x.challenge]===undefined) return; const key=x.challenge+'|'+x.user_id;
      if(!seen[key]){ seen[key]=true; per[x.challenge].push(x); } });
    let att=0,sum=0,crowns=0,pod=0,t10=0;
    menuOrder.forEach(k=>{ const b=per[k]; const idx=b.findIndex(r=>r.user_id===meId);
      if(idx>=0){ att++; sum+=idx/b.length; if(idx===0)crowns++; if(idx<3)pod++; if(idx<10)t10++; } });
    return {att, avgPct:att?sum/att:null, crowns, pod, t10, per};
  }
};
