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
    text:'#26241f', muted:'#6b665d', faint:'#a09a8f',
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

// On script load: apply the saved theme, else the dark default — the SAME fallback the trainer
// uses, so navigating between pages never flips light/dark on a fresh browser.
(function(){
  let saved = null;
  try{ saved = localStorage.getItem('hotkey_theme'); }catch(e){}
  if(!saved || !window.THEMES[saved]) saved = 'default';   // r56: Default IS the windows-grey desk look; saved 'desk' falls through here too
  window.applyTheme(saved);
})();

// Theme-name labels live in the page body, which doesn't exist yet when this runs in <head>.
// Populate them once the DOM is ready; applyTheme keeps them in sync on every change after that.
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', window.syncThemeLabels);
else window.syncThemeLabels();

/* ---- rank emblems: military-style insignia per tier, glow via currentColor ----
   Single source of truth for every page (themes.js loads everywhere). */

/* ---- rank emblems: LoL-style layered crests, single source for all pages ---- */
window.RANK_EMBLEM_IDX = {'MBA Associate':0,'Candidate':1,'Summer Analyst':2,
  'First-Year Analyst':3,'Associate':4,'VP':5,'MD':6,'Second-Year Analyst':7};
window.rankEmblem = function(tierName, size, bucket){
  const i = window.RANK_EMBLEM_IDX[tierName] ?? 0;
  size = size || 16;
  /* THE KEYCAP LADDER, desk edition. MBA Associate's cap bears a MOUSE (they still
     reach for it). MD is crimson power with a crown but no F4 — never touches Excel.
     Second-Year Analyst is the radiant final boss. Layered flats, no gradient ids. */
  const P=[
    {rim:'#8a8271', face:'#25231e', top:'#2f2d26', leg:'#a89e88', fx:'mouse'},                  // MBA — dusty plastic + mouse
    {rim:'#5a5d63', face:'#2a2c30', top:'#34373c', leg:'#8b8e94', fx:null},                     // Candidate — plain
    {rim:'#b0793f', face:'#2e2418', top:'#3d3020', leg:'#e0a35c', fx:null},                     // Summer — bronze
    {rim:'#b9c2cf', face:'#23262b', top:'#31353c', leg:'#dde4ee', fx:'ticks'},                  // First-Year — machined silver
    {rim:'#e3b341', face:'#2b2413', top:'#3a301a', leg:'#ffd769', fx:'laurel'},                 // Associate — gold, laureled
    {rim:'#7fd4c1', face:'#132a26', top:'#1a3833', leg:'#a9f0e0', fx:'wings'},                  // VP — platinum ice, winged
    {rim:'#e06a55', face:'#2d1512', top:'#3c1d18', leg:'#ffb3a3', fx:'crown'},                  // MD — crimson corner office
    {rim:'#8ab4ff', face:'#161a33', top:'#202649', leg:'#c4d7ff', fx:'radiant'},                // Second-Year — radiant diamond
  ];
  const p=P[i];
  let fx1='', fx2='';
  if(p.fx==='ticks')  fx1='<path d="M9 25.5h4 M15 25.5h4 M21 25.5h4" stroke="'+p.rim+'" stroke-width="1.4" stroke-linecap="round"/>';
  if(p.fx==='laurel') fx1='<path d="M7 26c-2.4-2-3.4-5-3-8 M27 26c2.4-2 3.4-5 3-8" fill="none" stroke="'+p.rim+'" stroke-width="1.6" stroke-linecap="round"/>'+
                          '<path d="M4.6 21.5l-2-.4 M5 18.6l-1.9-1 M29.4 21.5l2-.4 M29 18.6l1.9-1" stroke="'+p.rim+'" stroke-width="1.3" stroke-linecap="round"/>';
  if(p.fx==='wings')  fx1='<path d="M5 12C2.2 11 .8 8.6.4 6.4 3.4 7 5.6 8.4 6.8 10.4Z M29 12c2.8-1 4.2-3.4 4.6-5.6-3 .6-5.2 2-6.4 4Z" fill="'+p.rim+'" opacity=".9"/>';
  if(p.fx==='crown')  fx1='<path d="M11 5.6l2.2 2.6L17 4.6l3.8 3.6L23 5.6l-1 4.4H12z" fill="'+p.rim+'"/>';
  if(p.fx==='radiant'){
    fx1='<path d="M17 .8l1 3.2 M17 .8l-1 3.2 M6.5 3.5l2.2 2.4 M27.5 3.5l-2.2 2.4 M2 11h3.2 M32 11h-3.2" stroke="'+p.rim+'" stroke-width="1.5" stroke-linecap="round" opacity=".85"/>'+
        '<path d="M12.6 4.6L14 1.8l3 1.7 3-1.7 1.4 2.8" fill="none" stroke="'+p.leg+'" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
    fx2='<path d="M17 12.2l1.1 2.6 2.8.3-2.1 1.8.7 2.7-2.5-1.5-2.5 1.5.7-2.7-2.1-1.8 2.8-.3z" fill="'+p.leg+'"/>';
  }
  let legend;
  if(p.fx==='mouse'){
    legend='<g fill="none" stroke="'+p.leg+'" stroke-width="1.4" stroke-linecap="round">'+
      '<rect x="13.4" y="11.5" width="7.2" height="10.5" rx="3.6"/><path d="M17 11.5v3.6"/></g>';
  } else if(p.fx==='radiant'){ legend=fx2; }
  else if(i===1){ legend=''; }
  else if(p.fx==='crown'){ legend='<text x="17" y="21.5" text-anchor="middle" font-family="ui-monospace,monospace" font-weight="700" font-size="8.5" fill="'+p.leg+'">MD</text>'; }
  else { legend='<text x="17" y="21.5" text-anchor="middle" font-family="ui-monospace,monospace" font-weight="700" font-size="9.5" fill="'+p.leg+'">F4</text>'; }
  let pips='';
  if(bucket){
    const n = bucket==='Top Bucket'?3:(bucket==='Middle Bucket'?2:1);
    for(let k=0;k<3;k++) pips+='<circle cx="'+(13+k*4)+'" cy="31.4" r="1.5" fill="'+(k<n?p.rim:'#3a3d42')+'"/>';
  }
  return '<svg class="rank-emblem'+(i===7?' emblem-max':'')+'" viewBox="0 0 34 34" width="'+size+'" height="'+size+'" aria-hidden="true">'+
    fx1+
    '<rect x="6" y="8" width="22" height="20" rx="5" fill="#0a0b0c"/>'+
    '<rect x="7.4" y="6.6" width="19.2" height="17.6" rx="4.2" fill="'+p.face+'" stroke="'+p.rim+'" stroke-width="1.8"/>'+
    '<rect x="9.4" y="8.4" width="15.2" height="6" rx="3" fill="'+p.top+'"/>'+
    legend + pips +
    '</svg>';
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
    // capped at Incoming Analyst and tagged provisional. Everyone starts low and
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
window.hkBadge = function(id, earned, size, color){
  size=size||26;
  // hexagonal medal, video-game achievement style. Earned = gold + glow; locked = ghost outline.
  const G={
    spd:'<path d="M14 8l-4 6h4l-2 6 6-8h-4l2-4z"/>',
    vol:'<path d="M8.5 17.5h9 M8.5 14h9 M8.5 10.5h9"/>',
    str:'<path d="M13 7c2.6 2 4.4 4.2 4.4 7a4.4 4.4 0 0 1-8.8 0c0-1.4.6-2.6 1.5-3.7.2 1 .8 1.8 1.7 2.2-.3-2 .2-4 1.2-5.5z"/>',
    crn:'<path d="M8 17l-1-6 3.4 2.4L13 9.5l2.6 3.9L19 11l-1 6z"/>',
    day:'<circle cx="13" cy="13" r="4.4"/><path d="M13 5.6v1.8 M13 18.6v1.8 M5.6 13h1.8 M18.6 13h1.8"/>',
    gnt:'<path d="M8 8v10 M8 8h8l-2 2.5 2 2.5H8"/>',
    c1:'<path d="M13 8v10 M8 13h10 M13 8l-2.4 2.4 M13 8l2.4 2.4 M13 18l-2.4-2.4 M13 18l2.4-2.4" />',                       // navigation arrows
    c2:'<rect x="8.5" y="8.5" width="9" height="9" rx="1"/><rect x="10.7" y="10.7" width="4.6" height="4.6" rx=".6"/>',    // formatting frames
    c3:'<path d="M9 17v-3 M13 17v-6 M17 17v-9"/>',                                                                          // data bars
    c4:'<path d="M9.5 8.5h7l-5 4.5 5 4.5h-7"/>',                                                                            // sigma
    c5:'<circle cx="10" cy="10" r="1.7"/><circle cx="16" cy="16" r="1.7"/><path d="M17 9 9 17"/>',                          // percent
    c6:'<path d="M8 11l5-3.4L18 11 M9 12v5 M13 12v5 M17 12v5 M7.5 17.5h11"/>',                                              // bank columns
    c7:'<circle cx="12" cy="12" r="3.6"/><path d="M15 15l3.4 3.4"/>',
    c8:'<path d="M9 9h6l3 3v6H9z M15 9v3h3 M11 20h8 M13 22.5h6"/>',                                                       // lookup lens
    fin:'<path d="M13 7.4l1.5 3.4 3.7.3-2.8 2.4.9 3.6-3.3-2-3.3 2 .9-3.6-2.8-2.4 3.7-.3z" fill="currentColor" stroke="none"/>' // star
  };
  const hex='M13 2.8 L21.7 7.9 V18.1 L13 23.2 L4.3 18.1 V7.9 Z';
  const col = earned ? (color||'var(--warn)') : 'var(--faint)';
  return '<svg class="hk-badge'+(earned?' earned':' off')+'" viewBox="0 0 26 26" width="'+size+'" height="'+size+'" style="color:'+col+'">'+
    '<path d="'+hex+'" fill="currentColor" opacity="'+(earned?'.14':'.05')+'"/>'+
    '<path d="'+hex+'" fill="none" stroke="currentColor" stroke-width="1.6"/>'+
    '<g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+(G[id]||G.fin)+'</g>'+
    '</svg>';
};
