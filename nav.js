/* ============================================================
   hotkey.gg — SHARED NAV SCRIPT (used by leaderboard.html and reference.html)
   Loaded synchronously in <head>. Does three jobs:
   1. Defines window.THEMES + window.applyTheme + immediately applies the saved theme (no FOUC).
   2. On DOMContentLoaded: injects nav HTML into #navMount + all modal mount points.
   3. Wires up: shortcuts modal, themes modal, user menu dropdown, settings modal, profile modal.

   Each page must define BEFORE loading this script:
     window.NAV_ACTIVE = 'trainer' | 'leaderboard' | 'reference'   (which link gets the active style)
     window.sb         = supabase client (or null if Supabase failed to init)
   This script reads window.sb but does NOT create it — pages own their own Supabase init.
   ============================================================ */
(function(){
  'use strict';

  // ---------------------------------------------------------------
  // THEMES — same list as index.html. Kept in this shared file so leaderboard and reference
  // don't need their own inline theme dictionary. Update both this and index.html when adding new themes.
  // ---------------------------------------------------------------
  const THEMES = {
    default: { name:'Default Dark', dark:true, vars:{
      bg:'#0c0d0e', surface:'#141517', surface2:'#1c1d20', line:'#26282c',
      text:'#e6e6e6', muted:'#8a8d92', faint:'#5c5f64',
      accent:'#2ea36f', 'accent-dim':'#1d6647', 'accent-glow':'rgba(46,163,111,.22)',
      warn:'#d4a14a', bad:'#c14545' }},
    light: { name:'Light', dark:false, vars:{
      bg:'#fafafa', surface:'#f0f0f0', surface2:'#e4e4e4', line:'#d0d0d0',
      text:'#1a1a1a', muted:'#6a6a6a', faint:'#8a8a8a',
      accent:'#2ea36f', 'accent-dim':'#1d6647', 'accent-glow':'rgba(46,163,111,.18)',
      warn:'#a37020', bad:'#a73838' }},
    nord: { name:'Nord', dark:true, vars:{
      bg:'#2e3440', surface:'#3b4252', surface2:'#434c5e', line:'#4c566a',
      text:'#eceff4', muted:'#d8dee9', faint:'#7b88a1',
      accent:'#88c0d0', 'accent-dim':'#6a9aa8', 'accent-glow':'rgba(136,192,208,.22)',
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
  window.THEMES = THEMES;
  let currentTheme = 'default';

  function applyTheme(name){
    const t = THEMES[name] || THEMES.default;
    const root = document.documentElement;
    for(const k in t.vars) root.style.setProperty('--' + k, t.vars[k]);
    currentTheme = name;
  }
  function saveTheme(name){
    try { localStorage.setItem('hotkey_theme', name); } catch(e){}
  }
  window.applyTheme = applyTheme;

  // Apply theme RIGHT NOW (script load, before body renders) to avoid flash-of-default-theme.
  // Reads localStorage synchronously, falls back to prefers-color-scheme, then to 'default'.
  (function loadInitialTheme(){
    let saved = null;
    try { saved = localStorage.getItem('hotkey_theme'); } catch(e){}
    if(saved && THEMES[saved]) { applyTheme(saved); return; }
    try {
      const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
      applyTheme(prefersLight ? 'light' : 'default');
    } catch(e) { applyTheme('default'); }
  })();

  // ---------------------------------------------------------------
  // DRILL CATALOG — read from window.HOTKEY_DRILLS (defined in drills.js, loaded before this file).
  // The profile modal uses MENU_ORDER + DRILL_LABEL + GROUP_OF to render the per-drill stats table.
  // If drills.js failed to load, we fall back to a minimal stub so the rest of the nav still works.
  // ---------------------------------------------------------------
  const _D = window.HOTKEY_DRILLS;
  if(!_D) console.warn('nav.js: drills.js not loaded — profile modal will be empty');
  const MENU_ORDER  = _D ? _D.menuOrder : [];
  const DRILL_LABEL = _D ? _D.labelOf   : {};
  const GROUP_OF    = _D ? _D.groupOf   : {};

  // Same tier function as index.html. Kept in sync — if thresholds change there, change here.
  function tierOf(avgPct, attemptedCount){
    if(avgPct===null || (attemptedCount||0) < 5) return {name:'Unranked', cls:'tier-unranked'};
    if(attemptedCount >= 15 && avgPct <= 0.05) return {name:'Diamond',  cls:'tier-diamond'};
    if(attemptedCount >= 13 && avgPct <= 0.15) return {name:'Platinum', cls:'tier-platinum'};
    if(attemptedCount >= 10 && avgPct <= 0.30) return {name:'Gold',     cls:'tier-gold'};
    if(attemptedCount >=  8 && avgPct <= 0.55) return {name:'Silver',   cls:'tier-silver'};
    return {name:'Bronze', cls:'tier-bronze'};
  }

  // ---------------------------------------------------------------
  // SMALL UTILITIES
  // ---------------------------------------------------------------
  const $ = id => document.getElementById(id);
  const escHtml = s => String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const isAnonUser = () => {
    // Anonymous Supabase users have no email AND no other identities besides their auto-issued anon identity.
    if(!window._navUser) return false;
    const u = window._navUser;
    if(u.email) return false;
    if(u.is_anonymous === true) return true;
    // Older Supabase versions don't set is_anonymous; check the identities array as a fallback.
    if(Array.isArray(u.identities) && u.identities.length === 0) return true;
    return false;
  };

  // Where to deep-link for profile / auth flows. If we're on the trainer page itself, do nothing
  // (the page has its own inline handlers); otherwise route through URL params.
  const TRAINER_URL = 'index.html';
  function goToTrainer(query){ window.location.href = TRAINER_URL + (query ? '?' + query : ''); }

  // ---------------------------------------------------------------
  // NAV HTML — injected into #navMount on DOMContentLoaded
  // ---------------------------------------------------------------
  const NAV_HTML = `
    <nav class="topnav">
      <div class="topnav-in">
        <a class="topnav-brand" href="index.html" title="hotkey.gg — excel trainer">hotkey<b>.gg</b></a>
        <div class="topnav-pages" id="navPages">
          <a class="topnav-link" data-page="trainer"     href="index.html">trainer</a>
          <a class="topnav-link" data-page="leaderboard" href="leaderboard.html">leaderboard</a>
          <a class="topnav-link" data-page="reference"   href="reference.html">reference</a>
        </div>
        <div class="topnav-tools">
          <button class="topnav-icon" id="navShortcuts" title="keyboard shortcuts (?)" aria-label="keyboard shortcuts">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </button>
          <button class="topnav-icon" id="navThemes" title="themes" aria-label="themes">
            <svg width="16" height="16" viewBox="0 0 18 18"><circle cx="5" cy="5" r="3.4" fill="#e74c3c"/><circle cx="13" cy="5" r="3.4" fill="#f39c12"/><circle cx="5" cy="13" r="3.4" fill="#27ae60"/><circle cx="13" cy="13" r="3.4" fill="#3498db"/></svg>
          </button>
          <div class="auth-slot" id="authSlot"></div>
        </div>
        <button class="topnav-burger" id="navBurger" aria-label="menu">&#8801;</button>
      </div>
    </nav>
    <div class="profile-modal" id="profileModal"></div>
    <div class="profile-modal" id="settingsModal"></div>
    <div class="profile-modal" id="themesModal"></div>
    <div class="profile-modal" id="kbdModal"></div>
  `;

  // ---------------------------------------------------------------
  // SHORTCUTS MODAL — static content. Mostly app navigation; for Excel chords, point to reference.html.
  // ---------------------------------------------------------------
  const APP_SHORTCUTS = [
    { title:'navigating drills', rows: [
      ['\\',         'open the drill picker (trainer)'],
      ['1 – 9',      'jump to drill # (trainer, classic)'],
      ['Shift + F11','restart the current drill'],
    ]},
    { title:'while training', rows: [
      ['type',       'start the clock (first keystroke begins the run)'],
      ['g',          'toggle guided hints'],
      ['F2',         'edit the active cell'],
    ]},
    { title:'in a session (marathon / rapid-fire)', rows: [
      ['s',          'skip the current drill (marathon)'],
      ['g',          'toggle guided hints (marathon)'],
      ['Shift + Esc','end the session early'],
    ]},
    { title:'after solving', rows: [
      ['Enter',      'run it again'],
      ['Space',      'next drill (classic)'],
      ['Esc',        'back to the menu'],
    ]},
    { title:'anywhere', rows: [
      ['?',          'open this shortcut sheet'],
      ['Esc',        'close menus & modals'],
    ]},
  ];
  let kbdOpen=false;
  function closeKbd(){ kbdOpen=false; const m=$('kbdModal'); if(m) m.classList.remove('show'); }
  function openKbd(){
    const m=$('kbdModal'); if(!m) return;
    kbdOpen=true; m.classList.add('show');
    const sections = APP_SHORTCUTS.map(g=>{
      const rows = g.rows.map(([k,d])=>
        `<div class="kb-row"><span class="kb-keys">${k.split('+').map(p=>'<kbd>'+escHtml(p.trim())+'</kbd>').join(' + ')}</span><span class="kb-desc">${escHtml(d)}</span></div>`
      ).join('');
      return `<div class="kb-section"><div class="kb-h">${escHtml(g.title)}</div>${rows}</div>`;
    }).join('');
    m.innerHTML='<div class="pc-card" style="width:560px">'+
      '<div class="pc-head"><div class="pc-name">shortcuts</div></div>'+
      '<div class="pc-sub">App navigation only — for Excel shortcuts, see the <a href="reference.html" style="color:var(--accent)">reference</a> page.</div>'+
      '<div class="kb-grid">'+sections+'</div>'+
      '<div class="pc-foot"><span></span><a id="kbClose">press <kbd>?</kbd> or <kbd>esc</kbd> to close</a></div>'+
      '</div>';
    const c=$('kbClose'); if(c) c.onclick=closeKbd;
    m.addEventListener('click', e=>{ if(e.target===m) closeKbd(); }, {once:true});
  }

  // ---------------------------------------------------------------
  // THEMES MODAL — full functionality, themes apply immediately + persist to localStorage.
  // ---------------------------------------------------------------
  let themesOpen=false;
  function closeThemes(){ themesOpen=false; const m=$('themesModal'); if(m) m.classList.remove('show'); }
  function openThemes(){
    const m=$('themesModal'); if(!m) return;
    themesOpen=true; m.classList.add('show');
    const swatches = Object.entries(THEMES).map(([key,t])=>{
      const v=t.vars; const isSel = key===currentTheme;
      return `<button class="th-card${isSel?' sel':''}" data-key="${key}" style="background:${v.bg}; color:${v.text}; border-color:${isSel?v.accent:v.line}">`+
        `<div class="th-name">${escHtml(t.name)}</div>`+
        `<div class="th-bars"><span style="background:${v.accent}"></span><span style="background:${v.warn}"></span><span style="background:${v.bad}"></span></div>`+
        `</button>`;
    }).join('');
    m.innerHTML='<div class="pc-card" style="width:600px">'+
      '<div class="pc-head"><div class="pc-name">themes</div></div>'+
      '<div class="pc-sub">Click a theme to apply. Your pick saves across sessions.</div>'+
      '<div class="th-grid">'+swatches+'</div>'+
      '<div class="pc-foot"><span></span><a id="thClose">close</a></div>'+
      '</div>';
    m.querySelectorAll('.th-card').forEach(b=>b.onclick=()=>{
      const k=b.dataset.key; applyTheme(k); saveTheme(k); openThemes();
    });
    const c=$('thClose'); if(c) c.onclick=closeThemes;
    m.addEventListener('click', e=>{ if(e.target===m) closeThemes(); }, {once:true});
  }

  // ---------------------------------------------------------------
  // SETTINGS MODAL — in-app password change. Works only for signed-in non-anon users.
  // Anon users see a CTA to upgrade their account instead.
  // ---------------------------------------------------------------
  let settingsOpen=false;
  function closeSettings(){ settingsOpen=false; const m=$('settingsModal'); if(m) m.classList.remove('show'); }
  function openSettings(){
    if(!window.sb || !window._navUser) return;
    const m=$('settingsModal'); if(!m) return;
    settingsOpen=true; m.classList.add('show');
    if(isAnonUser()){
      m.innerHTML='<div class="pc-card" style="width:420px">'+
        '<div class="pc-head"><div class="pc-name">Account</div></div>'+
        '<div class="pc-msg">You\u2019re playing as a guest \u2014 add an email and password to your account first, then come back here to change it later.</div>'+
        '<div class="pc-foot"><a id="stSaveProg" style="color:var(--accent)">Save your progress \u2192</a><a id="stClose">close</a></div>'+
        '</div>';
      const sp=$('stSaveProg'); if(sp) sp.onclick=()=>{ closeSettings(); goToTrainer('openAuth=signup'); };
      const cl=$('stClose'); if(cl) cl.onclick=closeSettings;
      return;
    }
    const email=(window._navUser&&window._navUser.email)||'';
    m.innerHTML='<div class="pc-card" style="width:420px">'+
      '<div class="pc-head"><div class="pc-name">Account</div></div>'+
      '<div class="st-row"><div class="st-label">Email</div><div class="st-value">'+escHtml(email)+'</div></div>'+
      '<div class="st-divider"></div>'+
      '<div class="st-section-h">Change password</div>'+
      '<input id="stPass1" type="password" placeholder="new password (8+ characters)" autocomplete="new-password">'+
      '<input id="stPass2" type="password" placeholder="confirm new password" autocomplete="new-password" style="margin-top:8px">'+
      '<button class="auth-go" id="stSave" style="margin-top:12px; width:100%">Save password</button>'+
      '<div class="auth-msg" id="stMsg" style="min-height:14px; margin-top:9px"></div>'+
      '<div class="pc-foot"><a id="stClose">close</a></div>'+
      '</div>';
    const cl=$('stClose'); if(cl) cl.onclick=closeSettings;
    const sv=$('stSave'); if(sv) sv.onclick=doChangePassword;
    ['stPass1','stPass2'].forEach(id=>{ const el=$(id); if(el) el.onkeydown=e=>{ if(e.key==='Enter') doChangePassword(); }; });
    const p1=$('stPass1'); if(p1) p1.focus();
  }
  async function doChangePassword(){
    const p1=($('stPass1')||{}).value||'';
    const p2=($('stPass2')||{}).value||'';
    const msg=$('stMsg');
    const setMsg=(t,bad)=>{ if(msg){ msg.textContent=t; msg.style.color=bad?'var(--bad)':'var(--accent)'; } };
    if(p1.length<8){ setMsg('Password needs at least 8 characters.', true); return; }
    if(p1!==p2){ setMsg('Passwords don\u2019t match.', true); return; }
    setMsg('Saving\u2026', false);
    try{
      const { error } = await window.sb.auth.updateUser({ password: p1 });
      if(error){ setMsg(error.message || 'Couldn\u2019t update password.', true); return; }
      setMsg('Password updated \u2713', false);
      setTimeout(closeSettings, 900);
    }catch(e){ setMsg('Something went wrong \u2014 try again.', true); }
  }

  // ---------------------------------------------------------------
  // PROFILE MODAL — shows the user's tier + per-drill placement.
  // Queries Supabase runs table directly. The avgPct calculation mirrors index.html exactly so
  // the tier displayed here matches what the trainer page would show.
  // ---------------------------------------------------------------
  let profileOpen=false;
  function closeProfile(){ profileOpen=false; const m=$('profileModal'); if(m) m.classList.remove('show'); }
  async function openProfile(){
    const m=$('profileModal'); if(!m) return;
    profileOpen=true; m.classList.add('show');
    if(!window.sb || !window._navUser){
      m.innerHTML='<div class="pc-card"><div class="pc-msg">Sign in to see your card and where you rank against the field.</div>'+
        '<div class="pc-foot"><span></span><a id="pcClose">close</a></div></div>';
      const c=$('pcClose'); if(c) c.onclick=closeProfile;
      m.addEventListener('click', e=>{ if(e.target===m) closeProfile(); }, {once:true});
      return;
    }
    m.innerHTML='<div class="pc-card"><div class="pc-msg">loading your card\u2026</div></div>';
    try{
      const data = await loadProfileData();
      renderProfile(m, data);
    } catch(e){
      m.innerHTML='<div class="pc-card"><div class="pc-msg">Couldn\u2019t load the rankings right now \u2014 check your connection and try again.</div>'+
        '<div class="pc-foot"><span></span><a id="pcClose">close</a></div></div>';
      const c=$('pcClose'); if(c) c.onclick=closeProfile;
    }
  }
  async function loadProfileData(){
    const p = await window.sb.from('profiles').select('id,handle');
    const r = await window.sb.from('runs').select('user_id,challenge,time_ms').eq('mouse_used',false).order('time_ms',{ascending:true});
    const profs = p.data || [], runs = r.data || [];
    const names = {}; profs.forEach(x => names[x.id] = x.handle || 'anon');
    const per = {}; MENU_ORDER.forEach(k => per[k] = []);
    const seen = {};
    runs.forEach(x => {
      if(per[x.challenge] === undefined) return;
      const key = x.challenge + '|' + x.user_id;
      if(!seen[key]){ seen[key] = true; per[x.challenge].push(x); }
    });
    const me_id = window._navUser.id;
    const drills = MENU_ORDER.map(k => {
      const best = per[k], total = best.length;
      const idx = best.findIndex(b => b.user_id === me_id);
      const mine = idx >= 0 ? best[idx] : null;
      return {
        key: k, label: DRILL_LABEL[k] || k, group: GROUP_OF[k] || '',
        total, rank: idx >= 0 ? idx + 1 : null,
        time: mine ? mine.time_ms : null,
        leader: total ? best[0].time_ms : null,
        pct: idx >= 0 ? idx / total : null,
      };
    });
    const attempted = drills.filter(d => d.rank !== null);
    const avgPct = attempted.length ? attempted.reduce((a,d) => a + d.pct, 0) / attempted.length : null;
    return { drills, attempted: attempted.length, avgPct };
  }
  function renderProfile(m, d){
    const tier = tierOf(d.avgPct, d.attempted);
    const fmtMs = ms => (ms/1000).toFixed(2) + 's';
    const handle = (window._navProfile && window._navProfile.handle) || 'set a name';
    let body = '', lastG = null;
    d.drills.forEach(x => {
      if(x.group !== lastG){ body += `<div class="pc-grouphdr" style="font-family:var(--mono); font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:.8px; margin:16px 0 4px">${escHtml(x.group)}</div>`; lastG = x.group; }
      if(x.rank === null){
        body += `<div class="pc-row untried" style="display:grid; grid-template-columns:1fr auto auto; gap:14px; align-items:baseline; padding:8px 10px; border-radius:8px; font-family:var(--mono); font-size:12.5px; opacity:.6"><span style="color:var(--muted)">${escHtml(x.label)}</span><span style="color:var(--muted); text-align:right">untried</span><span style="color:var(--muted); font-size:11px; text-align:right; min-width:118px">\u2014</span></div>`;
      } else {
        const pct = x.total > 1 ? 'top ' + Math.max(1, Math.round(x.rank/x.total*100)) + '%' : 'only you so far';
        const gap = (x.rank > 1 && x.leader != null) ? ' \u00b7 +' + ((x.time-x.leader)/1000).toFixed(2) + 's off #1' : (x.rank === 1 ? ' \u00b7 you lead' : '');
        body += `<div class="pc-row" style="display:grid; grid-template-columns:1fr auto auto; gap:14px; align-items:baseline; padding:8px 10px; border-radius:8px; font-family:var(--mono); font-size:12.5px${x.rank===1?'; background:var(--accent-glow)':''}"><span style="color:var(--text)">${escHtml(x.label)} \u00b7 <b>${fmtMs(x.time)}</b></span><span style="color:${x.rank===1?'var(--warn)':'var(--accent)'}; text-align:right">#${x.rank} of ${x.total}</span><span style="color:var(--muted); font-size:11px; text-align:right; min-width:118px">${pct}${gap}</span></div>`;
      }
    });
    const standing = (d.attempted < 5)
      ? d.attempted + '/5 drills toward Bronze'
      : (d.avgPct === null ? '\u2014' : 'top ' + Math.max(1, Math.round(d.avgPct*100)) + '%');
    m.innerHTML = '<div class="pc-card">' +
      '<div class="pc-head"><div class="pc-name">' + escHtml(handle) + '</div><div class="pc-tier ' + tier.cls + '">' + tier.name + '</div></div>' +
      '<div class="pc-sub">' + d.attempted + ' / ' + MENU_ORDER.length + ' drills attempted \u00b7 ' + standing + '</div>' +
      body +
      '<div class="pc-foot"><a href="leaderboard.html">full leaderboard \u2197</a><a id="pcClose">close</a></div>' +
      '</div>';
    const c = $('pcClose'); if(c) c.onclick = closeProfile;
    m.addEventListener('click', e => { if(e.target === m) closeProfile(); }, { once: true });
  }

  // ---------------------------------------------------------------
  // USER MENU — top-right dropdown with profile / settings / sign-out.
  // Anon users see an additional "Save your progress" item that deep-links to the trainer's auth modal.
  // ---------------------------------------------------------------
  function closeUserMenu(){
    const btn = document.querySelector('.user-btn');
    const dd  = $('userDropdown');
    if(btn) btn.classList.remove('open');
    if(dd)  dd.classList.remove('open');
  }
  function renderAuthBar(){
    const slot = $('authSlot'); if(!slot) return;
    if(!window.sb){ slot.innerHTML = ''; return; }
    if(!window._navUser){
      // Not signed in at all — show a "sign in" button that routes through the trainer's auth modal.
      slot.innerHTML = '<button class="auth-btn" id="authSignInBtn">sign in</button>';
      const b = $('authSignInBtn'); if(b) b.onclick = () => goToTrainer('openAuth=signin');
      return;
    }
    const handle = (window._navProfile && window._navProfile.handle) || (window._navUser.email ? window._navUser.email.split('@')[0] : 'guest');
    const anon = isAnonUser();
    const saveItem = anon ? '<a id="umSaveProg" class="um-accent">Save your progress</a><div class="um-divider"></div>' : '';
    slot.innerHTML =
      '<div class="user-menu">' +
        '<button class="user-btn" id="userBtn" aria-haspopup="true" aria-expanded="false">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/></svg>' +
          '<span>' + escHtml(handle) + '</span>' +
          (anon ? '<span class="user-guest">(guest)</span>' : '') +
          '<svg class="um-caret" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>' +
        '</button>' +
        '<div class="user-dropdown" id="userDropdown" role="menu">' +
          '<a id="umProfile">Profile &amp; stats</a>' +
          saveItem +
          '<a id="umSettings">Account settings</a>' +
          '<a id="umSignout">Sign out</a>' +
        '</div>' +
      '</div>';
    const btn = $('userBtn');
    if(btn) btn.onclick = e => {
      e.stopPropagation();
      const dd = $('userDropdown');
      const open = dd.classList.toggle('open');
      btn.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    const wire = (id, fn) => { const el = $(id); if(el) el.onclick = () => { closeUserMenu(); fn(); }; };
    wire('umProfile',  openProfile);
    wire('umSaveProg', () => goToTrainer('openAuth=signup'));
    wire('umSettings', openSettings);
    wire('umSignout',  () => { window.sb.auth.signOut(); });
  }
  // Outside-click and Esc close the dropdown — global listeners, installed once.
  document.addEventListener('click', e => {
    const menu = document.querySelector('.user-menu');
    if(menu && !menu.contains(e.target)) closeUserMenu();
  });
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape'){
      closeUserMenu();
      if(themesOpen)   closeThemes();
      if(kbdOpen)      closeKbd();
      if(settingsOpen) closeSettings();
      if(profileOpen)  closeProfile();
    }
    if(e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey){
      // Don't trigger if user is typing in an input
      const t = e.target;
      if(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      e.preventDefault();
      kbdOpen ? closeKbd() : openKbd();
    }
  });

  // ---------------------------------------------------------------
  // INIT — runs on DOMContentLoaded. Injects nav, wires buttons, kicks off auth state listener.
  // ---------------------------------------------------------------
  function init(){
    const mount = $('navMount');
    if(!mount){ console.warn('nav.js: no #navMount found on this page'); return; }
    mount.innerHTML = NAV_HTML;

    // Mark the active page link based on what the page declared.
    const active = window.NAV_ACTIVE || 'trainer';
    document.querySelectorAll('.topnav-link').forEach(a => {
      if(a.dataset.page === active) a.classList.add('active');
    });

    // Wire the static tool buttons (always present regardless of auth).
    const sb_btn = $('navShortcuts'); if(sb_btn) sb_btn.onclick = () => kbdOpen ? closeKbd() : openKbd();
    const th_btn = $('navThemes');    if(th_btn) th_btn.onclick = () => themesOpen ? closeThemes() : openThemes();

    // Mobile burger toggles the .topnav-pages list open/closed.
    const bg = $('navBurger');
    if(bg) bg.onclick = () => { const p = $('navPages'); if(p) p.classList.toggle('open'); };

    // Auth state — if Supabase is initialized, fetch the session and listen for changes.
    // Pages without Supabase (or with sb=null) skip this and the auth slot stays empty.
    if(window.sb){
      window.sb.auth.getUser().then(({ data }) => {
        window._navUser = data && data.user;
        if(window._navUser){
          // Fetch handle from profiles table for the user-menu display.
          window.sb.from('profiles').select('id,handle').eq('id', window._navUser.id).single().then(({ data: prof }) => {
            window._navProfile = prof || null;
            renderAuthBar();
          });
        } else {
          renderAuthBar();
        }
      }).catch(() => renderAuthBar());
      // React to sign-in / sign-out across tabs.
      window.sb.auth.onAuthStateChange((_evt, session) => {
        window._navUser = session && session.user || null;
        if(window._navUser){
          window.sb.from('profiles').select('id,handle').eq('id', window._navUser.id).single().then(({ data: prof }) => {
            window._navProfile = prof || null;
            renderAuthBar();
          });
        } else {
          window._navProfile = null;
          renderAuthBar();
        }
      });
    } else {
      renderAuthBar();
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
