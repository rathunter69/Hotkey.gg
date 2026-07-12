/* ============================================================
   hotkey.gg — SHARED NAV SCRIPT (used by leaderboard.html and reference.html)
   Loaded synchronously in <head>. Does three jobs:
   1. Reads window.THEMES + window.applyTheme from themes.js (loaded in <head> before this).
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
  // THEMES — the palette, applyTheme(), currentTheme, and the no-FOUC initial apply now
  // live in themes.js (single source of truth). Each page loads themes.js in <head> BEFORE
  // this script, so window.THEMES / window.applyTheme / window.currentTheme already exist.
  // We keep only saveTheme here (persistence wrapper used by the themes modal below).
  // ---------------------------------------------------------------
  function saveTheme(name){
    try { localStorage.setItem('hotkey_theme', name); } catch(e){}
  }

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
    if(window.HK_RANK) return window.HK_RANK.tierOf(avgPct, attemptedCount);   // consolidated source
    if(window.HK_RANK) return window.HK_RANK.tierOf(avgPct, attemptedCount);
    if(avgPct===null || (attemptedCount||0) < 5) return {name:'MBA Associate', cls:'tier-mba'};
    if(attemptedCount >= 15 && avgPct <= 0.05) return {name:'Second-Year Analyst', cls:'tier-diamond'};
    if(attemptedCount >= 13 && avgPct <= 0.15) return {name:'Top-Bucket Analyst', cls:'tier-platinum'};
    if(attemptedCount >= 10 && avgPct <= 0.30) return {name:'First-Year Analyst', cls:'tier-gold'};
    if(attemptedCount >=  8 && avgPct <= 0.55) return {name:'Incoming Analyst', cls:'tier-silver'};
    return {name:'Summer Analyst', cls:'tier-bronze'};
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
        <a class="topnav-brand" href="index.html" title="hotkey.gg — excel trainer">hotkey<b>.gg</b><span class="brand-beta">beta</span></a>
        <div class="topnav-pages" id="navPages">
          <a class="topnav-link" data-page="trainer"     href="index.html" title="trainer" aria-label="trainer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/></svg><span class="tl-label">trainer</span></a>
          <a class="topnav-link" data-page="leaderboard" href="leaderboard.html" title="leaderboard" aria-label="leaderboard"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M7 6H5a2 2 0 0 0 0 4h2"/><path d="M17 6h2a2 2 0 0 1 0 4h-2"/><path d="M12 14v3"/><path d="M8 21h8"/><path d="M10 21a2 2 0 0 1 4 0"/></svg><span class="tl-label">leaderboard</span></a>
          <a class="topnav-link" data-page="stats"       href="stats.html" title="stats" aria-label="stats"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 15l4-6 3 4 5-8"/></svg><span class="tl-label">stats</span></a>
          <a class="topnav-link" data-page="reference"   href="reference.html" title="reference" aria-label="reference"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6c-1.6-1-4-1.5-6-1.5S2 5 2 5v13s2-.5 4-.5 4.4.5 6 1.5c1.6-1 4-1.5 6-1.5s4 .5 4 .5V5s-2-.5-4-.5-4.4.5-6 1.5Z"/><path d="M12 6v13"/></svg><span class="tl-label">reference</span></a>
        </div>
        <div class="topnav-tools">
          <span class="pc-tier tier-unranked topnav-rank" id="navRankPill" style="display:none" title="your rank — click for your full card"></span>
          <button class="topnav-icon" id="navShortcuts" title="keyboard shortcuts (?)" aria-label="keyboard shortcuts">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </button>
          <button class="topnav-icon" id="navThemes" title="themes" aria-label="themes">
            <svg width="16" height="16" viewBox="0 0 18 18"><circle cx="5" cy="5" r="3.4" fill="#e74c3c"/><circle cx="13" cy="5" r="3.4" fill="#f39c12"/><circle cx="5" cy="13" r="3.4" fill="#27ae60"/><circle cx="13" cy="13" r="3.4" fill="#3498db"/></svg>
          </button>
          <span class="topnav-theme-name" id="navThemeName" data-theme-label title="theme"></span>
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
  // FOOTER HTML — injected into #siteFooter on DOMContentLoaded (shared across
  // leaderboard, reference, and the legal pages). index.html carries its own inline copy.
  // NOTE: replace hello@hotkey.gg with the real support address once it exists.
  // ---------------------------------------------------------------
  const FOOTER_HTML = `
    <footer class="site-footer">
      <div class="sf-in">
        <div class="sf-left">
          <a href="index.html" class="sf-brand">hotkey<b>.gg</b></a>
          <span class="sf-fine">Excel is a registered trademark of Microsoft Corporation. hotkey.gg is independent and not affiliated with or endorsed by Microsoft.</span>
        </div>
        <nav class="sf-links" aria-label="footer">
          <a href="mailto:hello@hotkey.gg">contact</a>
          <a href="mailto:hello@hotkey.gg?subject=Bug%20report%20%E2%80%94%20hotkey.gg">report a bug</a>
          <a href="terms.html">terms</a>
          <a href="privacy.html">privacy</a>
          <a href="security.html">security</a>
        </nav>
      </div>
    </footer>
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
    m.innerHTML='<div class="pc-card" style="width:560px"><a class="modal-x">\u00d7</a>'+
      '<div class="pc-head"><div class="pc-name">shortcuts</div></div>'+
      '<div class="pc-sub">App navigation only — for Excel shortcuts, see the <a href="reference.html" style="color:var(--accent)">reference</a> page.</div>'+
      '<div class="kb-grid" style="max-height:56vh;overflow-y:auto;padding-right:8px">'+sections+'</div>'+
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
    // × is injected per-open (innerHTML below rebuilds content) — see append after build
    const swatches = Object.entries(THEMES).map(([key,t])=>{
      const v=t.vars; const isSel = key===currentTheme;
      return `<button class="th-card${isSel?' sel':''}" data-key="${key}" style="background:${v.bg}; color:${v.text}; border-color:${isSel?v.accent:v.line}">`+
        `<div class="th-name">${escHtml(t.name)}</div>`+
        `<div class="th-bars"><span style="background:${v.accent}"></span><span style="background:${v.warn}"></span><span style="background:${v.bad}"></span></div>`+
        `</button>`;
    }).join('');
    m.innerHTML='<div class="pc-card" style="width:600px"><a class="modal-x">\u00d7</a>'+
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
      m.innerHTML='<div class="pc-card" style="width:420px"><a class="modal-x">\u00d7</a>'+
        '<div class="pc-head"><div class="pc-name">Account</div></div>'+
        '<div class="pc-msg">You\u2019re playing as a guest \u2014 add an email and password to your account first, then come back here to change it later.</div>'+
        '<div class="pc-foot"><a id="stSaveProg" style="color:var(--accent)">Save your progress \u2192</a><a id="stClose">close</a></div>'+
        '</div>';
      const sp=$('stSaveProg'); if(sp) sp.onclick=()=>{ closeSettings(); goToTrainer('openAuth=signup'); };
      const cl=$('stClose'); if(cl) cl.onclick=closeSettings;
      return;
    }
    const email=(window._navUser&&window._navUser.email)||'';
    m.innerHTML='<div class="pc-card" style="width:420px"><a class="modal-x">\u00d7</a>'+
      '<div class="pc-head"><div class="pc-name">Account</div></div>'+
      '<div class="st-row"><div class="st-label">Email</div><div class="st-value">'+escHtml(email)+'</div></div>'+
      '<div class="st-divider"></div>'+
      '<div class="st-section-h">Change password</div>'+
      '<input id="stPass1" type="password" placeholder="new password (8+ characters)" autocomplete="new-password">'+
      '<input id="stPass2" type="password" placeholder="confirm new password" autocomplete="new-password" style="margin-top:8px">'+
      '<button class="auth-go" id="stSave" style="margin-top:12px; width:100%">Save password</button>'+
      '<div class="auth-msg" id="stMsg" style="min-height:14px; margin-top:9px"></div>'+
      '<div class="st-divider"></div>'+
      '<div class="st-section-h">Your desk</div>'+
      '<div style="font-family:var(--mono);font-size:11.5px;color:var(--muted);margin-bottom:8px;line-height:1.5">Desks replaced team codes \u2014 create one, join by invite link, and share it from your <a href="account.html" style="color:var(--accent)">account page</a>.</div>'+
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
      m.innerHTML='<div class="pc-card"><a class="modal-x">\u00d7</a><div class="pc-msg">Sign in to see your card and where you rank against the field.</div>'+
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
      m.innerHTML='<div class="pc-card"><a class="modal-x">\u00d7</a><div class="pc-msg">Couldn\u2019t load the rankings right now \u2014 check your connection and try again.</div>'+
        '<div class="pc-foot"><span></span><a id="pcClose">close</a></div></div>';
      const c=$('pcClose'); if(c) c.onclick=closeProfile;
    }
  }
  // Rank pill: fetch standing once per session (10-min cache shared with index.html via sessionStorage)
  async function navRank(){
    const el=$('navRankPill'); if(!el) return;
    try{ const c=JSON.parse(sessionStorage.getItem('hk_rank3')||'null');
      if(c && c.exp>Date.now()){ el.innerHTML=(window.rankEmblem?window.rankEmblem(c.n,20):'')+'<span>'+c.n+'</span>';
        el.className='pc-tier '+c.c+' topnav-rank'; el.style.display='inline-flex'; el.onclick=openProfile; return; } }catch(e){}
    if(!window.sb || !window._navUser) return;
    try{
      const d = await loadProfileData();
      const t = tierOf(d.avgPct, d.attempted);
      el.innerHTML=(window.rankEmblem?window.rankEmblem(t.name,20):'')+'<span>'+t.name+'</span>';
      el.className='pc-tier '+t.cls+' topnav-rank'; el.style.display='inline-flex'; el.onclick=openProfile;
      try{ sessionStorage.setItem('hk_rank3', JSON.stringify({n:t.name,c:t.cls,exp:Date.now()+6e5})); }catch(e){}
    }catch(e){}
  }
  // user state lands async — poll briefly, then give up quietly
  { let tries=0; const iv=setInterval(()=>{ if(window._navUser){ clearInterval(iv); navRank(); } else if(++tries>12) clearInterval(iv); }, 700); }

  async function loadProfileData(){
    const p = await window.sb.from('profiles').select('id,handle,flair');
    const r = await window.sb.from('runs').select('user_id,challenge,time_ms').eq('mouse_used',false).order('time_ms',{ascending:true});
    let mySessions=[];
    try{ const se=await window.sb.from('sessions').select('user_id,mode').eq('user_id', window._navUser.id);
      mySessions=se.data||[]; }catch(e){}
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
    const myRuns = runs.filter(x => x.user_id === me_id);
    let _chordFreq={}, _totKeys=0;
    try{
      const tr=await window.sb.from('runs').select('trace,keystrokes').eq('user_id', meId)
        .eq('mouse_used',false).order('created_at',{ascending:false}).limit(40);
      (tr.data||[]).forEach(row=>{ _totKeys+=(row.keystrokes||0);
        (Array.isArray(row.trace)?row.trace:[]).forEach(k=>{ const key=(k&&k.k)||k;
          if(typeof key==='string' && /\+|^Alt$|^F\d+$/.test(key)) _chordFreq[key]=(_chordFreq[key]||0)+1; }); });
    }catch(e){}
    const _perBoard={}; MENU_ORDER.forEach(k=>{ _perBoard[k]=[]; const seenB={};
      runs.forEach(x=>{ if(x.challenge===k && !seenB[x.user_id]){ seenB[x.user_id]=true; _perBoard[k].push(x.user_id); } }); });
    return { drills, attempted: attempted.length, avgPct, mySolves: myRuns.length, myRuns, mySessions, _profs: profs, _allRuns: runs, _perBoard, _chordFreq, _totKeys,
      wsum: drills.reduce((a,x)=>a+(x.rank!==null?Math.min(1,Math.log2((x.total||1)+1)/Math.log2(9)):0),0) };
  }
  /* ---- XP & LEVELS ----
     XP = 15/clean solve + 50/distinct drill + 25/top-10 + 100/podium + 250/crown.
     Level n needs 150*n more XP than n-1 (triangular curve): fast early, grindy late.
     The tier (Candidate → Second-Year Analyst) stays the COMPETITIVE rank; the level
     is personal progress — both live on the card. */
  /* XP v2 — built so coming back is worth more than grinding one drill:
     first solve of a drill 50 · solves 2-10 of that drill 15 each · beyond 10, 3 each
     (repeat-grinding decays) · daily runs 30 · weekly gauntlet legs 25 ·
     placement: 25/top-10, 100/podium, 250/crown. */
  function computeXP(d, myRuns, mySessions){
    let crowns=0, podiums=0, top10s=0;
    d.drills.forEach(x=>{ if(x.rank===1) crowns++; if(x.rank!==null&&x.rank<=3) podiums++; if(x.rank!==null&&x.rank<=10) top10s++; });
    const PARS=window.HOTKEY_PARS||{};
    const perDrill={}; let xp=0;
    (myRuns||[]).forEach(r=>{
      const ch=r.challenge||'';
      if(ch.indexOf('daily-')===0){ xp+=30; return; }
      if(ch.indexOf('wk-')===0){ xp+=25; return; }
      const nth=(perDrill[ch]=(perDrill[ch]||0)+1);
      // r60: smooth diminishing repeats (Wolf: adaptive XP) — grinding one drill decays
      // instead of paying flat-15 nine times then cliffing. Reprices history in beta.
      const rep=[0,0,15,10,7,5][Math.min(nth,5)] ?? 0;
      xp += nth===1 ? (50 + ((PARS[ch]||0)>=55?15:0)) : (nth<=5 ? rep : (nth<=10 ? 3 : 1));
    });
    (mySessions||[]).forEach(s=>{ xp += s.mode==='marathon' ? 20 : 10; });
    return xp + 25*top10s + 100*podiums + 250*crowns;
  }
  function levelOf(xp){ let lvl=1, need=150, floor=0;
    while(xp >= floor+need){ floor+=need; lvl++; need=150*lvl; }
    return { lvl, into: xp-floor, need, pct: Math.min(100, Math.round(100*(xp-floor)/need)) }; }

  function renderProfile(m, d){
    const tier = tierOf(d.avgPct, d.attempted);
    const fmtMs = ms => (ms/1000).toFixed(2) + 's';
    const handle = (window._navProfile && window._navProfile.handle) || 'set a name';
    // r70b: 'set a name' is a real state (profile without a handle) — make it actionable
    window.__hkNoHandle = !(window._navProfile && window._navProfile.handle);
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
      ? d.attempted + '/5 drills toward Summer Analyst'
      : (d.avgPct === null ? '\u2014' : 'top ' + Math.max(1, Math.round(d.avgPct*100)) + '%');
    // badges: campaign chapters cleared (PB-derived, local)
    let badgesHtml='';
    try{
      const PBl=JSON.parse(localStorage.getItem('hotkey_pb')||'{}');
      const CAMP=window.HOTKEY_CAMPAIGN;
      if(CAMP){
        // gate uses drills.js pars? pars live in index CHALLENGES — approximate with PB presence + stored par map unavailable here,
        // so nav badges use a shipped par table snapshot:
        const PARS=window.HOTKEY_PARS||{};
        const cleared=k=>PBl[k]!==undefined && (!PARS[k] || PBl[k]<=PARS[k]*CAMP.GATE);
        const chs=CAMP.chapters.map(c=>({...c, done:c.keys.every(cleared)}));
        const earned=chs.filter(c=>c.done);
        const allDone=earned.length===chs.length;
        const gateTxt=' \u2014 clear every drill under par \u00d7 '+CAMP.GATE+' to earn it';
        /* r72: chapter medals read as MODEL VERSIONS — a labeled strip, v-numbers under each */
        badgesHtml='<div style="font-family:var(--mono);font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.12em;margin:2px 0 6px">the build \u00b7 '+earned.length+' / '+chs.length+' versions</div>'+
          '<div class="pc-badges" style="display:flex;gap:10px;align-items:flex-start;padding:10px 12px;background:var(--surface2);border:1px solid var(--line);border-radius:10px;margin-bottom:14px">'+
          chs.map((c,ci)=>'<span class="pc-badge" data-tip="'+c.name+(c.done?' \u2014 EARNED':gateTxt)+'" style="display:flex;flex-direction:column;align-items:center;gap:2px;font-family:var(--mono);font-size:9px;color:'+(c.done?'var(--muted)':'var(--faint)')+'">'+(window.hkBadge?window.hkBadge(c.id, c.done, 30, (window.HOTKEY_GROUP_COLORS||{})[(window.HOTKEY_DRILLS.groupOf[c.keys[0]])]):c.badge)+'v'+(ci+1)+'</span>').join('')+
          '<span class="pc-badge" data-tip="Model complete \u2014 every version shipped" style="display:flex;flex-direction:column;align-items:center;gap:2px;font-family:var(--mono);font-size:9px;color:var(--faint);margin-left:auto">'+(window.hkBadge?window.hkBadge('fin', allDone, 30):CAMP.finisher.badge)+'ship</span>'+
          '</div>'+
          (function(){
            const AC=window.HOTKEY_ACHIEVEMENTS;
            if(!AC) return '';
            let streakN=0; try{ streakN=(JSON.parse(localStorage.getItem('hotkey_streak')||'{}').n)||0; }catch(e){}
            let solvesN=0; try{ solvesN=parseInt(localStorage.getItem('hotkey_solves')||'0',10)||0; }catch(e){}
            let __xflags={}; try{ __xflags=JSON.parse(localStorage.getItem('hk_ach_flags')||'{}'); }catch(e){}
            const ctx={ pb:PBl, pars:window.HOTKEY_PARS||{}, runs:d.myRuns||[], streak:streakN, solves:solvesN,
              mouseRuns:__xflags.mouseRuns||0, slowWins:__xflags.slowWins||0,
              nightWin:!!__xflags.nightWin, dawnWin:!!__xflags.dawnWin, weekendWin:!!__xflags.weekendWin,
              crowns:(function(){let c2=0; d.drills.forEach(x=>{ if(x.rank===1) c2++; }); return c2;})(), groups:(function(){ const g={}; Object.entries(window.HOTKEY_DRILLS.groupOf).forEach(([k,gr])=>{(g[gr]=g[gr]||[]).push(k);}); return g; })(),
              att:d.attempted, menuOrder:MENU_ORDER };
            // STEAM-STYLE GLOBAL RARITY: evaluate run-derivable achievements for every
            // player from the same runs dataset → "% of players have this".
            const globalPct=(function(){
              try{
                const byUser={};
                (d._allRuns||[]).forEach(r=>{ (byUser[r.user_id]=byUser[r.user_id]||[]).push(r); });
                const uids=Object.keys(byUser); if(uids.length<2) return {};
                const PARS2=window.HOTKEY_PARS||{};
                const out={};
                uids.forEach(u=>{
                  const runs=byUser[u];
                  const best={}; const days=new Set();
                  runs.forEach(r=>{ const ch=r.challenge;
                    if(best[ch]===undefined||r.time_ms<best[ch]) best[ch]=r.time_ms;
                    if(r.created_at) days.add(String(r.created_at).slice(0,10)); });
                  const pbU={}; Object.keys(best).forEach(k=>pbU[k]=best[k]/1000);
                  // streak: longest consecutive-day run
                  const ds=[...days].sort(); let streakU=ds.length?1:0, cur=1;
                  for(let i=1;i<ds.length;i++){ const gap=(new Date(ds[i])-new Date(ds[i-1]))/86400000;
                    cur = gap===1 ? cur+1 : 1; if(cur>streakU) streakU=cur; }
                  let crownsU=0; MENU_ORDER.forEach(k=>{ const b=(d._perBoard&&d._perBoard[k])||[]; if(b.length&&b[0]===u) crownsU++; });
                  const attU=MENU_ORDER.filter(k=>pbU[k]!==undefined).length;
                  const ctxU={ pb:pbU, pars:PARS2, runs, streak:streakU, solves:runs.length, crowns:crownsU, att:attU, menuOrder:MENU_ORDER, groups:(function(){ const g={}; Object.entries(window.HOTKEY_DRILLS.groupOf).forEach(([k,gr])=>{(g[gr]=g[gr]||[]).push(k);}); return g; })() };
                  AC.forEach(a=>{ let ru; try{ ru=a.test(ctxU); }catch(e){ ru={done:false}; }
                    if(ru.done) out[a.id]=(out[a.id]||0)+1; });
                });
                Object.keys(out).forEach(k=>out[k]=Math.round(100*out[k]/uids.length));
                AC.forEach(a=>{ if(out[a.id]===undefined) out[a.id]=0; });
                return out;
              }catch(e){ return {}; }
            })();
            // r70: header shows earned/possible; top-3 rarest EARNED featured large
            let earnedList=[]; AC.forEach(a=>{ let r; try{ r=a.test(ctx); }catch(e){ r={done:false}; }
              if(r.done) earnedList.push({a, gp:(globalPct[a.id]!==undefined?globalPct[a.id]:100)}); });
            earnedList.sort((x,y)=>x.gp-y.gp);
            // r77: NEW unlocks since last look → celebrate (queued if several)
            try{
              const seen=JSON.parse(localStorage.getItem('hk_ach_seen')||'[]');
              const fresh=earnedList.filter(e=>!seen.includes(e.a.id));
              if(fresh.length && window.hkCelebrate){
                window.hkCelebrate({cap:'achievement unlocked',
                  title:fresh[0].a.name,
                  sub:fresh[0].a.desc+(fresh.length>1?' \u00b7 +'+(fresh.length-1)+' more unlocked':''),
                  iconHtml:(window.hkBadge?window.hkBadge(fresh[0].a.glyph,true,60):'')});
              }
              localStorage.setItem('hk_ach_seen', JSON.stringify(earnedList.map(e=>e.a.id)));
            }catch(e){}
            let out='<div class="pc-ach-h">achievements <span style="color:var(--faint)">'+earnedList.length+' / '+AC.length+'</span></div>';
            if(earnedList.length){
              out+='<div style="display:flex;gap:14px;margin:2px 0 10px">'+earnedList.slice(0,3).map(e=>
                '<span style="display:flex;flex-direction:column;align-items:center;gap:3px;font-family:var(--mono);font-size:9px;color:var(--muted);text-align:center;max-width:76px">'+
                (window.hkBadge?window.hkBadge(e.a.glyph,true,46):'')+e.a.name+
                '</span>').join('')+'</div>';
            }
            out+='<div class="pc-ach">';
            AC.forEach(a=>{ let r; try{ r=a.test(ctx); }catch(e){ r={done:false,prog:0,goal:1}; }
              const gp=globalPct[a.id];
              const rare=(gp!==undefined)?(' \u00b7 '+gp+'% of players have this'):'';
              out+='<span class="pc-ach-i'+(r.done?' got':'')+'" data-tip="'+a.name+' \u2014 '+a.desc+(r.done?' \u2713 EARNED':' \u00b7 '+r.prog+'/'+r.goal)+rare+'">'+
                (window.hkBadge?window.hkBadge(a.glyph, r.done, 40):'')+
                (r.done?'':'<i>'+Math.min(99,Math.round(100*r.prog/r.goal))+'%</i>')+'</span>'; });
            out+='</div>';
            // ---- most-used shortcuts + coach's notes (directional, never prescriptive) ----
            try{
              const cf=d._chordFreq||{};
              const top=Object.entries(cf).sort((a,b)=>b[1]-a[1]).slice(0,5);
              if(top.length){
                out+='<div class="pc-ach-h">most-used shortcuts <span style="color:var(--faint)">\u00b7 last 40 clean runs</span></div>'+
                  '<div style="display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 2px">'+
                  top.map(([k,c])=>'<span style="font-family:var(--mono);font-size:10.5px;background:var(--surface2);border:1px solid var(--line);border-radius:7px;padding:3px 8px">'+k+' <span style="color:var(--faint)">\u00d7'+c+'</span></span>').join('')+'</div>';
                const tips=[];
                const hasAny=re=>Object.keys(cf).some(k=>re.test(k));
                if(!hasAny(/^F4$/)) tips.push('F4 barely shows up in your play \u2014 the Models and Full Builds tiers lean on anchor cycling');
                if(!hasAny(/^Alt$|^Alt\+/) && !hasAny(/^H/)) tips.push('no Alt-ribbon walks in your recent runs \u2014 alt h o i (autofit) and alt e s (paste special) are desk staples');
                if(!hasAny(/Ctrl\+(\u2192|\u2190|\u2191|\u2193|Shift)/)) tips.push('mostly single arrows \u2014 ctrl+arrows jump to data edges, ctrl+shift+arrows grab whole ranges');
                if(!hasAny(/Ctrl\+Alt\+V/)) tips.push('paste special (ctrl+alt+v) is missing from your rotation \u2014 values-only paste is everywhere in real models');
                if(tips.length){
                  out+='<div class="pc-ach-h" style="margin-top:10px">coach\u2019s notes</div>'+
                    tips.slice(0,2).map(t=>'<div style="font-family:var(--mono);font-size:11px;color:var(--muted);line-height:1.6;margin:3px 0"><span style="color:var(--faint)">\u2013</span> '+t+'</div>').join('');
                }
              }
            }catch(e){}
            return out;
          })() +
          '';
      }
    }catch(e){}
    let myFlair=null;
    try{ const meP=(d._profs||[]).find(x=>x.id===window._navUser.id); myFlair=meP&&meP.flair; }catch(e){}
    const __xp = computeXP(d, d.myRuns, d.mySessions);
    const __L  = levelOf(__xp);
    // r77: RANK-UP — tier climbed since last look → celebrate with the new crest
    try{
      const ti=(window.RANK_EMBLEM_IDX||{})[tier.name] ?? 0;
      const prev=parseInt(localStorage.getItem('hk_seen_tier')||'-1',10);
      if(prev>=0 && ti>prev && window.hkCelebrate){
        window.hkCelebrate({cap:'rank up', title:tier.name,
          sub:'the desk noticed \u00b7 '+standing,
          iconHtml:(window.rankEmblem?window.rankEmblem(tier.name,84):'')});
      }
      if(ti>=0) localStorage.setItem('hk_seen_tier', String(ti));
    }catch(e){}
    m.innerHTML = '<div class="pc-card'+(myFlair?' flair-'+myFlair:'')+'">' +
      '<a class="pc-x" id="pcX">\u00d7</a>' +
      '<div class="pc-head"><div class="pc-name" style="font-size:20px;letter-spacing:-.3px">' + escHtml(handle) + (window.__hkNoHandle?' <a id="pcSetName" style="font-size:11px;color:var(--accent);cursor:pointer;text-decoration:underline">set your name</a>':'') + '</div></div>' +
      /* r70: RANK HERO — the crest gets real estate */
      /* r72: rank + LEVEL live together — crest left, tier center, level+progress right */
        /* r76: APEX-STYLE SHOWCASE — handle banner on top, two prominent circulars
         side by side beneath (crest tile | level-ring tile), labels under each. */
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:6px 0 14px">' +
        '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px 10px;background:var(--surface2);border:1px solid var(--line);border-radius:12px">' +
          '<span style="display:inline-flex;line-height:0">'+(window.rankEmblem?window.rankEmblem(tier.name,84):'')+'</span>' +
          '<div class="pc-tier '+tier.cls+'" style="border:0;padding:0;font-size:13px;background:none;box-shadow:none">'+tier.name+'</div>' +
          '<div style="font-family:var(--mono);font-size:10.5px;color:var(--muted)">'+standing+'</div>' +
          '<div style="font-family:var(--mono);font-size:8.5px;color:var(--faint);letter-spacing:.1em;text-transform:uppercase;margin-top:4px">rank \u00b7 speed vs the field</div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px 10px;background:var(--surface2);border:1px solid var(--line);border-radius:12px">' +
          (window.hkLevelRing?window.hkLevelRing(__L.lvl, __L.pct, 84):'') +
          '<div style="font-family:var(--mono);font-size:13px;font-weight:700;color:var(--accent)">LEVEL '+__L.lvl+'</div>' +
          '<div style="font-family:var(--mono);font-size:10.5px;color:var(--muted)">'+__L.into+' / '+__L.need+' xp</div>' +
          '<div style="font-family:var(--mono);font-size:8.5px;color:var(--faint);letter-spacing:.1em;text-transform:uppercase;margin-top:4px">level \u00b7 earned from reps</div>' +
        '</div>' +
      '</div>' +
      badgesHtml +
      (function(){
        const xp = computeXP(d, d.myRuns, d.mySessions);
        const L = levelOf(xp);
        let crowns=0, podiums=0; d.drills.forEach(x=>{ if(x.rank===1) crowns++; if(x.rank!==null&&x.rank<=3) podiums++; });
        let streakN=0; try{ streakN=(JSON.parse(localStorage.getItem('hotkey_streak')||'{}').n)||0; }catch(e){}
        return ''+   /* r72: level row moved into the rank hero */
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;font-family:var(--mono);text-align:center">'+
          '<div style="background:var(--surface2);border-radius:10px;padding:10px 6px"><div style="font-size:18px;font-weight:700;color:var(--text)">'+(d.mySolves||0)+'</div><div style="font-size:9.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px">clean solves</div></div>'+
          '<div style="background:var(--surface2);border-radius:10px;padding:10px 6px"><div style="font-size:18px;font-weight:700;color:'+(crowns?'var(--warn)':'var(--text)')+'">'+crowns+'</div><div style="font-size:9.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px">crowns</div></div>'+
          '<div style="background:var(--surface2);border-radius:10px;padding:10px 6px"><div style="font-size:18px;font-weight:700;color:var(--text)">'+(streakN?'\ud83d\udd25 '+streakN:'\u2014')+'</div><div style="font-size:9.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px">streak</div></div>'+
        '</div>';
      })() +
      /* r70: drill-by-drill list retired from the card — stats page carries it */
      '<div class="pc-foot"><a href="leaderboard.html">full leaderboard \u2197</a><a id="pcClose">close</a></div>' +
      '</div>';
    const c = $('pcClose'); if(c) c.onclick = closeProfile;
    const sn=$('pcSetName'); if(sn) sn.onclick=()=>{ closeProfile();
      if(window.promptHandle) window.promptHandle(); else location.href='index.html'; };
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
  window.__navAuthKick = async function(){
    try{
      if(window.sb){
        const { data } = await window.sb.auth.getSession();
        window._navUser = data && data.session ? data.session.user : null;
        if(window._navUser){
          try{ const p = await window.sb.from('profiles').select('handle,flair').eq('id', window._navUser.id).maybeSingle();
            window._navProfile = p && p.data ? p.data : null; }catch(e){}
        }
      }
    }catch(e){}
    try{ renderAuthBar(); }catch(e){}
  };
  function renderAuthBar(){
    const slot = $('authSlot'); if(!slot) return;
    if(!window.sb){
      // nav.js runs at body-top; pages create window.sb in their bottom scripts.
      // Retry briefly instead of rendering an empty slot forever (the "no username
      // on the game/boards pages" bug), and pages can force it via navRefreshAuth().
      slot.innerHTML = '';
      if((window.__navSbTries=(window.__navSbTries||0)+1) < 40) setTimeout(()=>{ try{ if(window.__navAuthKick) window.__navAuthKick(); else renderAuthBar(); }catch(e){} }, 150);
      return;
    }
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
          '<a id="umProfile">Player card</a>' +
          '<a href="stats.html">Your numbers</a>' +
          saveItem +
          '<a href="account.html">Account</a>' +
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
    wire('umSignout',  () => { try{ localStorage.removeItem('hk_handle_cache'); }catch(e){} window.sb.auth.signOut(); });   // r101: forget the landing greeting too
  }
  // Outside-click and Esc close the dropdown — global listeners, installed once.
  document.addEventListener('click', e => {
    const menu = document.querySelector('.user-menu');
    if(menu && !menu.contains(e.target)) closeUserMenu();
  });
  // Anything nav owns that's currently covering the page (game code checks this
  // to pause its own keyboard handling under our overlays).
  window.navOverlayOpen = () => !!(themesOpen || kbdOpen || settingsOpen || profileOpen);
  window.navRefreshAuth = function(){ try{ if(window.__navAuthKick) window.__navAuthKick(); }catch(e){} };
  document.addEventListener('keydown', e => {
    const onTrainer = window.NAV_ACTIVE === 'trainer';
    if(e.key === 'Escape'){
      const anyOpen = window.navOverlayOpen();
      closeUserMenu();
      if(themesOpen)   closeThemes();
      if(kbdOpen)      closeKbd();
      if(settingsOpen) closeSettings();
      if(profileOpen)  closeProfile();
      // On the trainer, Esc-with-an-overlay-open must ONLY close the overlay —
      // never fall through to the game (where Esc restarts the drill).
      if(onTrainer && anyOpen){ e.preventDefault(); e.stopImmediatePropagation(); }
      return;
    }
    if(e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey){
      if(onTrainer) return;   // the game owns raw keys — grid cells aren't inputs
      const t = e.target;
      if(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      e.preventDefault();
      kbdOpen ? closeKbd() : openKbd();
    }
  }, true);

  // ---------------------------------------------------------------
  // INIT — runs on DOMContentLoaded. Injects nav, wires buttons, kicks off auth state listener.
  // ---------------------------------------------------------------
  function init(){
    const mount = $('navMount');
    if(!mount){ console.warn('nav.js: no #navMount found on this page'); return; }
    mount.innerHTML = NAV_HTML;
    if(window.syncThemeLabels) window.syncThemeLabels();
    const fmount = $('siteFooter'); if(fmount) fmount.innerHTML = FOOTER_HTML;

    // Mark the active page link based on what the page declared.
    const active = window.NAV_ACTIVE || 'trainer';
    document.querySelectorAll('.topnav-link').forEach(a => {
      if(a.dataset.page === active) a.classList.add('active');
    });

    // Wire the static tool buttons (always present regardless of auth).
    // universal modal-× delegation (all pages): closes the overlay AND syncs nav's flags
    if(!window.__hkModalDelegated){ window.__hkModalDelegated = true;
      document.addEventListener('click', e => {
        // BACKDROP CLICK-AWAY: clicking the dimmed area around any overlay closes it.
        // ({once:true} per-instance listeners kept dying after one inner click — this
        // delegation is permanent and flag-synced.)
        const t=e.target;
        if(t && t.classList && t.classList.contains('show') &&
           (t.classList.contains('profile-modal') || t.classList.contains('onboard-modal') || /Modal$/.test(t.id||''))){
          t.classList.remove('show');
          if(t.id==='themesModal') themesOpen=false;
          if(t.id==='kbdModal') kbdOpen=false;
          if(t.id==='settingsModal') settingsOpen=false;
          if(t.id==='profileModal') profileOpen=false;
          if(t.id==='rankedModal') t.remove();
          return;
        }
        const x = e.target.closest && e.target.closest('.modal-x, .pc-x');
        if(!x) return;
        const ov = x.closest('.onboard-modal, .profile-modal, [id$="Modal"]');
        if(!ov) return;
        e.preventDefault(); e.stopPropagation();
        ov.classList.remove('show');
        if(ov.id==='themesModal') themesOpen=false;
        if(ov.id==='kbdModal') kbdOpen=false;
        if(ov.id==='settingsModal') settingsOpen=false;
        if(ov.id==='profileModal') profileOpen=false;
        if(!ov.classList.contains('onboard-modal') && !ov.classList.contains('profile-modal')) ov.remove();
      }, true);
    }
    const sb_btn = $('navShortcuts'); if(sb_btn) sb_btn.onclick = () => kbdOpen ? closeKbd() : openKbd();
    const th_btn = $('navThemes');    if(th_btn) th_btn.onclick = () => themesOpen ? closeThemes() : openThemes();
    const th_name = $('navThemeName'); if(th_name) th_name.onclick = () => themesOpen ? closeThemes() : openThemes();

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
    if($('navMount')) init(); else document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


/* ---- r77: celebration engine (shared by every page) ---- */
window.hkConfetti = function(host, colors){
  if(!host) return;
  colors = colors && colors.length ? colors : ['#6ec9a0','#e3b341','#8ab4ff','#e0879e','#7fd4c1','#e0cf7a'];
  const box=document.createElement('div'); box.className='hk-confetti';
  let bits='';
  for(let i=0;i<38;i++){
    bits+='<i style="left:'+(Math.random()*100).toFixed(1)+'%;background:'+colors[i%colors.length]+
      ';--rz:'+(360+Math.random()*540).toFixed(0)+'deg;animation-duration:'+(1.1+Math.random()*.9).toFixed(2)+
      's;animation-delay:'+(Math.random()*.35).toFixed(2)+'s"></i>';
  }
  box.innerHTML=bits; host.appendChild(box);
  setTimeout(()=>{ try{ box.remove(); }catch(e){} }, 2400);
};
window.__hkCelQ=[]; window.__hkCelOpen=false;
window.hkCelebrate = function(o){
  if(window.__hkCelOpen){ window.__hkCelQ.push(o); return; }
  window.__hkCelOpen=true;
  const w=document.createElement('div'); w.className='hk-cel-wrap';
  w.innerHTML='<div class="hk-cel">'+
    '<div class="hk-cel-cap">'+(o.cap||'nice')+'</div>'+
    '<div class="hk-cel-body">'+
      (o.iconHtml?'<div class="hk-cel-icon">'+o.iconHtml+'</div>':'')+
      '<div class="hk-cel-title">'+(o.title||'')+'</div>'+
      (o.sub?'<div class="hk-cel-sub">'+o.sub+'</div>':'')+
      '<div class="hk-cel-hint">click or \u21b5 to continue</div>'+
    '</div></div>';
  document.body.appendChild(w);
  window.hkConfetti(w.querySelector('.hk-cel-body'), o.colors);
  let done=false;
  const close=()=>{ if(done) return; done=true;
    try{ w.remove(); }catch(e){}
    window.__hkCelOpen=false;
    const nx=window.__hkCelQ.shift(); if(nx) setTimeout(()=>window.hkCelebrate(nx), 220); };
  w.addEventListener('click', close);
  const key=(e)=>{ if(e.key==='Enter'||e.key==='Escape'){ e.preventDefault(); close(); document.removeEventListener('keydown',key,true);} };
  document.addEventListener('keydown', key, true);
  setTimeout(close, 4200);
};
