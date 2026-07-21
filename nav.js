/* ============================================================
   hotkey.gg — SHARED NAV SCRIPT (used by leaderboard.html and reference.html)
   Loaded synchronously in <head>. Does three jobs:
   1. Reads window.THEMES + window.applyTheme from themes.js (loaded in <head> before this).
   2. On DOMContentLoaded: injects nav HTML into #navMount + all modal mount points.
   3. Wires up: shortcuts modal, themes modal, user menu dropdown, settings modal, profile modal.

   Each page must define BEFORE loading this script:
     window.NAV_ACTIVE = 'trainer' | 'leaderboard' | 'desks' | 'stats' | 'reference'   (which link gets the active style)
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
    // r293 (Wolf): the theme follows the ACCOUNT — push the pick to the profile so
    // opening the site on another device (mobile) lands on the same look.
    try{ if(window.sb && window._navUser) window.sb.from('profiles').update({theme:name}).eq('id', window._navUser.id).then(()=>{}); }catch(e){}
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
  function tierOf(avgPct, attemptedCount, wsum){
    if(window.HK_RANK) return window.HK_RANK.tierOf(avgPct, attemptedCount, wsum);   // consolidated source — r112: no stale local ladder
    return {name:'MBA Associate', cls:'tier-mba'};
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
          <a class="topnav-link" data-page="desks"       href="desks.html" title="desks & schools" aria-label="desks and schools"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg><span class="tl-label">desks</span></a>
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
          <a href="About.html">about</a>
          <a href="drills/index.html">drill library</a>
          <a href="contact.html">contact</a>
          <a href="enterprise.html">enterprise</a>
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
      ['F1',         'toggle guided hints'],
      ['F2',         'edit the active cell'],
    ]},
    { title:'in a rapid-fire session', rows: [
      ['s',          'skip the current task'],
      ['g',          'reveal the keycap hints'],
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
    const swatches = (window.themeList?window.themeList():Object.entries(THEMES)).map(([key,t])=>{
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
  /* r373: HIGHEST TIER EVER REACHED — the plaque frames unlock on the best tier you've
     ever DISPLAYED, not the one you hold today (ranks can fall; earned cosmetics don't).
     Persisted as a TIERS index in hk_ach_flags.tierBest — a number, so the r358
     client-state hydration maxes it across devices for free. Called wherever the rank
     fetch computes a live tier (navRank + the card renderer).
     r376: also latches the BUCKET held at that best tier — the gemset plaque corners
     cut their stone from it. Packed as ONE monotonic number (tierBestBucket =
     tier*3 + bucket, bucket 0..2) so the hydration max keeps the true high-water
     PAIR; two separately-maxed fields could stitch an old device's top bucket onto
     a newly reached tier. Decode: bucket = tierBestBucket % 3 (themes.js hkFrameBucket). */
  function persistTierBest(i, bucket){
    try{
      if(typeof i!=='number' || i<=0) return;
      const bk = bucket==='Top Bucket' ? 2 : bucket==='Middle Bucket' ? 1 : 0;
      const packed = i*3 + bk;
      const fl=JSON.parse(localStorage.getItem('hk_ach_flags')||'{}');
      if((fl.tierBest|0) >= i && (fl.tierBestBucket|0) >= packed) return;
      fl.tierBest=Math.max(fl.tierBest|0, i);
      fl.tierBestBucket=Math.max(fl.tierBestBucket|0, packed);
      localStorage.setItem('hk_ach_flags', JSON.stringify(fl));
      try{ window.hkStatePush && window.hkStatePush(); }catch(e){}
    }catch(e){}
  }

  // Rank pill: fetch standing once per session (10-min cache shared with index.html via sessionStorage)
  async function navRank(){
    const el=$('navRankPill'); if(!el) return;
    /* r336 (Wolf): the pill honors the ranked opt-in. Not entered -> a quiet "Unranked" chip;
       entered but mid-placement -> "placement n/5"; only a finished placement shows a tier.
       The tier cache is consulted only when opted in, so leaving ranked demotes immediately. */
    const __opted=(function(){ try{ return localStorage.getItem('hk_ranked')==='1'; }catch(e){ return false; } })();
    try{ const c=JSON.parse(sessionStorage.getItem('hk_rank3')||'null');
      if(__opted && c && c.exp>Date.now()){ el.innerHTML=(window.rankEmblem?window.rankEmblem(c.n,20):'')+'<span>'+c.n+'</span>';
        el.className='pc-tier '+c.c+' topnav-rank'; el.style.display='inline-flex'; el.onclick=openProfile; return; } }catch(e){}
    if(!window.sb || !window._navUser) return;
    if(!__opted){
      el.innerHTML='<span>Unranked</span>';
      el.className='pc-tier tier-unranked topnav-rank'; el.style.display='inline-flex';
      el.title='not in ranked \u2014 enter from the leaderboard'; el.onclick=openProfile;
      return;
    }
    try{
      const d = await loadProfileData();
      // r117: LEVEL PERSISTENCE — nav chip & in-game level run on a local estimate
      // (hk_xp_est); a returning player on a fresh device read LVL 1 while their card
      // knew better. Hydrate from canonical XP (PB-hydration pattern, r83). SET, not
      // max: a second account on the same machine must not inherit the first's level.
      try{
        /* r371: same account -> take max(server, local est) so local-only bounty xp
           (daily top-10 +40, milestone bounties) survives the refresh; a DIFFERENT
           account on this machine still resets (the r117 concern). */
        const srvXp=computeXP(d, d.myRuns, d.mySessions);
        const owner=localStorage.getItem('hk_xp_uid')||'';
        const prev=parseInt(localStorage.getItem('hk_xp_est')||'0',10)||0;
        const uid=(window._navUser&&window._navUser.id)||'';
        localStorage.setItem('hk_xp_est', String(owner===uid ? Math.max(srvXp,prev) : srvXp));
        if(uid) localStorage.setItem('hk_xp_uid', uid);
        renderAuthBar();
      }catch(e){}
      const P=(window.HK_PLACEMENT?window.HK_PLACEMENT.KEYS:[]);
      const doneN=P.filter(k=>(d.myRuns||[]).some(r=>r.challenge===k)).length;
      if(P.length && doneN<P.length){
        el.innerHTML='<span>\u2694 placement '+doneN+'/'+P.length+'</span>';
        el.className='pc-tier tier-unranked topnav-rank'; el.style.display='inline-flex';
        el.title='placement series \u2014 post a time on each of the five standard boards'; el.onclick=openProfile;
        return;   // no tier cache write mid-placement
      }
      const t = tierOf(d.avgPct, d.attempted, d.wsum);
      persistTierBest(t.i, t.bucket);   // r373: plaque-frame unlocks latch the high-water tier (r376: + its bucket)
      el.innerHTML=(window.rankEmblem?window.rankEmblem(t.name,20):'')+'<span>'+t.name+'</span>';
      el.className='pc-tier '+t.cls+' topnav-rank'; el.style.display='inline-flex'; el.onclick=openProfile;
      try{ sessionStorage.setItem('hk_rank3', JSON.stringify({n:t.name,c:t.cls,exp:Date.now()+6e5})); }catch(e){}
    }catch(e){}
  }
  // r226 (Wolf): on sign-out the top bar kept the old rank + level because the caches that
  // hydrate them (sessionStorage rank, localStorage xp estimate + handle) survived, and the
  // rank pill is its OWN element renderAuthBar never touches. Wipe all of it so a guest never
  // sees stale account info — used by the sign-out button AND the reactive SIGNED_OUT event.
  function clearAccountUI(){
    try{ localStorage.removeItem('hk_handle_cache'); localStorage.removeItem('hk_xp_est'); }catch(e){}
    try{ sessionStorage.removeItem('hk_rank3'); }catch(e){}
    const rp=$('navRankPill'); if(rp){ rp.style.display='none'; rp.innerHTML=''; }
    const lc=$('navLvl');      if(lc) lc.remove();
    try{ if('__lvlXp' in window) window.__lvlXp=0; }catch(e){}
    // r296 (Wolf): the header wipe wasn't enough — stats.html still read the ACCOUNT's
    // local mirrors (PBs, run history, key counts, streak, achievements) after sign-out,
    // so a guest on a shared machine stared at the previous account's numbers. The server
    // owns all of this for account holders (r114: analytics ride the account; it re-hydrates
    // on the next sign-in), so the device copy goes too. Device PREFERENCES stay (theme,
    // platform, onboarding/tour flags) — those belong to the machine, not the account.
    try{
      ['hotkey_pb','hk_runs_lite','hotkey_solves','hotkey_streak','hk_camp_xp','hk_clears',
       'hk_clears_day','hk_key_counts','hk_keys_lifetime','hk_keystats_seeded','hk_ach_flags',
       'hk_ach_seen','hk_feat_ach','hk_band_best','hk_dc_done','hk_ranked','hk_seen_tier',
       'hk_xlv','hk_last_drill'].forEach(k=>localStorage.removeItem(k));
      for(let i=localStorage.length-1;i>=0;i--){ const k=localStorage.key(i);
        if(k && k.indexOf('hk_ghost_')===0) localStorage.removeItem(k); }   // per-drill ghost replays
    }catch(e){}
    // r311 (Wolf): sign-out kept "coming back" because the race that redirects after 1200ms
    // can fire BEFORE supabase's network signOut clears its persisted token — the reload then
    // re-hydrates the session and you're logged back in. Nuke the token ourselves so the
    // reload ALWAYS starts logged out, hung round-trip or not. (default storageKey = sb-<ref>-auth-token)
    try{
      for(let i=localStorage.length-1;i>=0;i--){ const k=localStorage.key(i);
        if(k && (/^sb-.*-auth-token$/.test(k) || k==='supabase.auth.token')) localStorage.removeItem(k); }
    }catch(e){}
  }
  window.clearAccountUI = clearAccountUI;   // pages (index.html) share the same wipe on their own sign-out path
  // user state lands async — poll briefly, then give up quietly
  { let tries=0; const iv=setInterval(()=>{ if(window._navUser){ clearInterval(iv); navRank(); } else if(++tries>12) clearInterval(iv); }, 700); }

  async function loadProfileData(){
    const p = await window.sb.from('profiles').select('id,handle,flair,featured_ach,school_tag,show_school');
    const r = await window.sb.from('runs').select('user_id,challenge,time_ms,created_at,keystrokes,optimal').eq('mouse_used',false).order('time_ms',{ascending:true});   /* r371: keystrokes+optimal feed the efficiency feats */
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
        pct: idx >= 0 ? (total > 1 ? idx / (total - 1) : 0) : null,   // r302: idx/(n-1), the SAME percentile HK_RANK.standing uses everywhere else
      };
    });
    const attempted = drills.filter(d => d.rank !== null);
    /* r302 (Wolf, THIRD recurrence of "my rank differs by surface"): this file used to
       hand-roll the standing with pct = idx/total while HK_RANK.standing (stats, boards,
       desks) uses idx/(n-1) — on small fields that's a different tier. ONE calc now:
       the shared standing. The hand-rolled path is gone, not patched. */
    const __st = window.HK_RANK ? window.HK_RANK.standing(runs, me_id, MENU_ORDER) : null;
    const avgPct = __st ? __st.avgPct
      : (attempted.length ? attempted.reduce((a,d) => a + d.pct, 0) / attempted.length : null);
    const myRuns = runs.filter(x => x.user_id === me_id);
    let _chordFreq={}, _totKeys=0;
    try{
      /* r148: was `meId` — a ReferenceError the try/catch swallowed since r72, so the
         chord-frequency fetch never ran and coach's notes always saw an empty map */
      const tr=await window.sb.from('runs').select('trace,keystrokes').eq('user_id', me_id)
        .eq('mouse_used',false).order('created_at',{ascending:false}).limit(40);
      (tr.data||[]).forEach(row=>{ _totKeys+=(row.keystrokes||0);
        (Array.isArray(row.trace)?row.trace:[]).forEach(k=>{ const key=(k&&k.k)||k;
          if(typeof key==='string' && /\+|^Alt$|^F\d+$/.test(key)) _chordFreq[key]=(_chordFreq[key]||0)+1; }); });
    }catch(e){}
    const _perBoard={}; MENU_ORDER.forEach(k=>{ _perBoard[k]=[]; const seenB={};
      runs.forEach(x=>{ if(x.challenge===k && !seenB[x.user_id]){ seenB[x.user_id]=true; _perBoard[k].push(x.user_id); } }); });
    return { drills, attempted: __st ? __st.att : attempted.length, avgPct, mySolves: myRuns.length, myRuns, mySessions, _profs: profs, _allRuns: runs, _perBoard, _chordFreq, _totKeys,
      wsum: __st ? __st.wsum : drills.reduce((a,x)=>a+(x.rank!==null?Math.min(1,Math.log2((x.total||1)+1)/Math.log2(9)):0),0) };   /* r302: att + wsum + avgPct all come from the ONE shared standing */
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
    // r116: XP v4 lives in HK_RANK.computeXP (themes.js) ONLY — this wrapper just
    // shapes the board bonuses. Four drifted copies died in this consolidation.
    let crowns=0, podiums=0, top10s=0;
    d.drills.forEach(x=>{ if(x.rank===1) crowns++; if(x.rank!==null&&x.rank<=3) podiums++; if(x.rank!==null&&x.rank<=10) top10s++; });
    return window.HK_RANK ? window.HK_RANK.computeXP(myRuns, {t10:top10s, pod:podiums, crowns:crowns}, mySessions) : 0;
  }
  // r151: HK_RANK.levelOf is canonical (curve softened there); this shell only
  // survives as a same-shape fallback for a themes.js load failure.
  function levelOf(xp){
    if(window.HK_RANK && window.HK_RANK.levelOf) return window.HK_RANK.levelOf(xp);
    let lvl=1, need=150, floor=0;
    while(xp >= floor+need){ floor+=need; lvl++; need=Math.min(150*lvl, 600); }
    return { lvl, into: xp-floor, need, pct: Math.min(100, Math.round(100*(xp-floor)/need)) }; }

  /* r148: SHAREABLE RANK CARD — LinkedIn-dimensioned PNG (1200x627) drawn locally,
     nothing uploaded. The tier emblem SVG rasterizes via data-URI; if that stalls or
     fails, the card ships text-only — the download never gets held hostage. */
  function makeRankCard(d, tier, handle, L, onDone){
    try{
      const cv=document.createElement('canvas'); cv.width=1200; cv.height=627;
      const x=cv.getContext('2d');
      const css=getComputedStyle(document.documentElement);
      const col=v=>css.getPropertyValue(v).trim()||'#000';
      const name=(handle && handle!=='set a name')?String(handle):'analyst';
      x.fillStyle=col('--bg'); x.fillRect(0,0,1200,627);
      x.fillStyle=col('--surface'); x.fillRect(32,32,1136,563);
      x.strokeStyle=col('--accent'); x.lineWidth=2; x.strokeRect(32,32,1136,563);
      x.fillStyle=col('--accent'); x.font='700 32px "JetBrains Mono", monospace';
      x.fillText('hotkey.gg', 72, 104);
      x.fillStyle=col('--muted'); x.font='500 20px "JetBrains Mono", monospace';
      x.fillText('keyboard-only excel · no mouse allowed', 72, 138);
      x.fillStyle=col('--text'); x.font='700 52px "Hanken Grotesk", sans-serif';
      x.fillText(name.slice(0,20), 72, 226);
      x.fillStyle=col('--warn'); x.font='700 38px "JetBrains Mono", monospace';
      x.fillText(tier.name.toUpperCase(), 72, 288);
      const standing=(d.attempted<5) ? (d.attempted+'/5 boards toward a rank')
        : (d.avgPct===null?'':'top '+Math.max(1,Math.round(d.avgPct*100))+'% of the field');
      x.fillStyle=col('--muted'); x.font='500 24px "JetBrains Mono", monospace';
      if(standing) x.fillText(standing, 72, 330);
      let crowns=0; d.drills.forEach(r=>{ if(r.rank===1) crowns++; });
      x.fillStyle=col('--text'); x.font='700 25px "JetBrains Mono", monospace';
      x.fillText('LEVEL '+L.lvl+'  ·  '+(d.mySolves||0)+' clean solves'+(crowns?('  ·  '+crowns+' crown'+(crowns===1?'':'s')):''), 72, 396);
      const tops=d.drills.filter(r=>r.rank!==null && r.total>1)
        .sort((a,b)=>(a.rank/a.total)-(b.rank/b.total)).slice(0,3);
      x.font='500 21px "JetBrains Mono", monospace';
      tops.forEach((r,i)=>{
        x.fillStyle=col('--accent');
        x.fillText('#'+r.rank+' of '+r.total, 72, 448+i*36);
        x.fillStyle=col('--muted');
        x.fillText('— '+String(r.label).slice(0,28)+' · '+(r.time/1000).toFixed(2)+'s', 250, 448+i*36);
      });
      x.fillStyle=col('--faint'); x.font='500 20px "JetBrains Mono", monospace';
      x.fillText('think you’re faster? hotkey.gg', 790, 568);
      let fired=false;
      /* r150 (Wolf: "doesn't do anything"): the detached-anchor + data:URL click is
         flaky outside Chrome. Blob URL + DOM-attached anchor is the dependable path,
         and the caller gets told whether the file actually went out. */
      const finish=()=>{ if(fired) return; fired=true;
        try{
          const fname='hotkey-rank-'+name.replace(/[^a-z0-9_-]/gi,'').slice(0,24)+'.png';
          const send=href=>{ const a=document.createElement('a');
            a.download=fname; a.href=href; a.style.display='none';
            document.body.appendChild(a); a.click();
            setTimeout(()=>{ a.remove(); if(href.indexOf('blob:')===0) URL.revokeObjectURL(href); }, 4000); };
          if(cv.toBlob) cv.toBlob(b=>{ try{ send(b?URL.createObjectURL(b):cv.toDataURL('image/png')); if(onDone) onDone(true); }catch(e){ if(onDone) onDone(false); } }, 'image/png');
          else { send(cv.toDataURL('image/png')); if(onDone) onDone(true); }
        }catch(e){ if(onDone) onDone(false); } };
      try{
        let svg=window.rankEmblem?window.rankEmblem(tier.name,300,tier.bucket):'';
        // the emblem SVG ships for inline DOM use (no xmlns); as an Image document
        // it MUST carry the namespace or the raster silently errors out
        if(svg && !/xmlns=/.test(svg)) svg=svg.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ');
        if(svg){
          const img=new Image();
          img.onload=()=>{ try{
            const w=300, h=img.height&&img.width ? w*(img.height/img.width) : 300;
            x.drawImage(img, 830, 150, w, h); }catch(e){} finish(); };
          img.onerror=finish;
          img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
          setTimeout(finish, 1200);   // raster stall can't block the download
        } else finish();
      }catch(e){ finish(); }
    }catch(e){ if(onDone) onDone(false); }
  }
  function renderProfile(m, d){
    const tier = tierOf(d.avgPct, d.attempted, d.wsum);
    persistTierBest(tier.i, tier.bucket);   // r373: the card render is a rank fetch too — latch here as well (r376: + bucket)
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
        /* r72 medal strip; r363: 'versions' language retired — TRACK MILESTONES.
           r367: chips banded under their three certificate tracks, so the strip tells the same
           story as the tracks modal instead of a flat m1..m8. */
        const chipHtml=(c,ci)=>'<span class="pc-badge" data-tip="'+c.name+(c.done?' — EARNED':gateTxt)+'" style="display:flex;flex-direction:column;align-items:center;gap:2px;font-family:var(--mono);font-size:9px;color:'+(c.done?'var(--muted)':'var(--faint)')+'">'+(window.hkBadge?window.hkBadge(c.id, c.done, 30, (window.HOTKEY_GROUP_COLORS||{})[(window.HOTKEY_DRILLS.groupOf[c.keys[0]])]):c.badge)+'m'+(ci+1)+'</span>';
        const SHORT={fluency:'Fluency', formulas:'Formulas & Data', modeling:'Modeling'};
        const tracks=(window.HK_TRACKS||[]).filter(t=>t.milestones&&t.milestones.length);
        const bandsHtml = tracks.length
          ? tracks.map(t=>{
              const seg=chs.map((c,ci)=>({c:c,ci:ci})).filter(x=>t.milestones.indexOf(x.c.id)>=0);
              if(!seg.length) return '';
              const segDone=seg.every(x=>x.c.done);
              return '<span style="display:flex;flex-direction:column;gap:4px">'+
                '<span style="font-family:var(--mono);font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:'+(segDone?'var(--accent)':'var(--faint)')+'">'+(SHORT[t.id]||t.name)+(segDone?' ✓':'')+'</span>'+
                '<span style="display:flex;gap:10px">'+seg.map(x=>chipHtml(x.c,x.ci)).join('')+'</span>'+
                '</span>';
            }).join('')
          : chs.map(chipHtml).join('');
        badgesHtml='<div style="font-family:var(--mono);font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.12em;margin:2px 0 6px">milestones · '+earned.length+' / '+chs.length+'</div>'+
          '<div class="pc-badges" style="display:flex;gap:16px;align-items:flex-end;flex-wrap:wrap;padding:10px 12px;background:var(--surface2);border:1px solid var(--line);border-radius:10px;margin-bottom:14px">'+
          bandsHtml+
          '<span class="pc-badge" data-tip="Catalog complete — every milestone shipped" style="display:flex;flex-direction:column;align-items:center;gap:2px;font-family:var(--mono);font-size:9px;color:var(--faint);margin-left:auto">'+(window.hkBadge?window.hkBadge('fin', allDone, 30):CAMP.finisher.badge)+'ship</span>'+
          '</div>'+
          (function(){
            const AC=window.HOTKEY_ACHIEVEMENTS;
            if(!AC) return '';
            let streakN=0; try{ streakN=(JSON.parse(localStorage.getItem('hotkey_streak')||'{}').n)||0; }catch(e){}
            let solvesN=0; try{ solvesN=parseInt(localStorage.getItem('hotkey_solves')||'0',10)||0; }catch(e){}
            let __xflags={}; try{ __xflags=JSON.parse(localStorage.getItem('hk_ach_flags')||'{}'); }catch(e){}
            let __ck=0, __kl=0; try{ const kc=JSON.parse(localStorage.getItem('hk_key_counts')||'{}');
              const __unit=k=>/^alt( [a-z0-9]){1,6}$/.test(k) || /\(\)$/.test(k) || /^F[0-9]+$/.test(k) || /^Ctrl\+/.test(k);   /* r371: same semantic-unit rule as index/stats */
              __ck=Object.keys(kc).filter(__unit).length;
              __kl=Object.values(kc).reduce((a,b)=>a+(b|0),0); }catch(e){}
            const ctx={ pb:PBl, pars:window.HOTKEY_PARS||{}, runs:d.myRuns||[], streak:streakN, solves:solvesN,
              mouseRuns:__xflags.mouseRuns||0, slowWins:__xflags.slowWins||0,
              nightWin:!!__xflags.nightWin, dawnWin:!!__xflags.dawnWin, weekendWin:!!__xflags.weekendWin,
              raceWins:__xflags.raceWins||0, sheetClears:__xflags.sheetClears||0,
              frzBanked:__xflags.frzBanked||0, chordKinds:__ck, keysLifetime:__kl, dailyTop10:__xflags.dailyTop10||0,
              dailyPod:__xflags.dailyPod||0, dailyWins:__xflags.dailyWins||0, certs:Object.keys(__xflags.certTracks||{}).length,
              /* r376: mythic-class keys — beta-era account + the packed rank latch + the S+++ desk latch */
              charter:!!(window._navUser && window._navUser.created_at && String(window._navUser.created_at) < '2026-10-01'),
              tierBest:__xflags.tierBest|0, tierBestBucket:__xflags.tierBestBucket|0, deskPeak:__xflags.deskPeak||0,
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
                out.__n=uids.length;   // r150: field size — effective rarity trusts data only at scale
                return out;
              }catch(e){ return {}; }
            })();
            // r70: header shows earned/possible; top-3 rarest EARNED featured large
            // r150: gp = EFFECTIVE rarity (static tier floor until the field is >= 20 players)
            const __fieldN=globalPct.__n||0;
            let earnedList=[]; AC.forEach(a=>{ let r; try{ r=a.test(ctx); }catch(e){ r={done:false}; }
              if(r.done) earnedList.push({a, gp:(window.hkEffRarity?window.hkEffRarity(a.tier, globalPct[a.id], __fieldN):(globalPct[a.id]!==undefined?globalPct[a.id]:100))}); });
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
              localStorage.setItem('hk_ach_seen', JSON.stringify([...new Set([...seen, ...earnedList.map(e=>e.a.id)])]));   /* r371: union — this surface can't evaluate every feat, so it must never shrink the list */
            }catch(e){}
            // r135: SHOWCASE — the player's picked medals lead (profiles.featured_ach,
            // curated on the stats page); rarest-3 remains the fallback. The full grid
            // moved to stats.html — the card stays a highlight reel.
            let picks=[];
            try{ const meP2=(d._profs||[]).find(x=>x.id===window._navUser.id);
              if(meP2 && meP2.featured_ach!=null) picks=String(meP2.featured_ach).split(',').filter(Boolean); }catch(e){}
            if(!picks.length){ try{ picks=JSON.parse(localStorage.getItem('hk_feat_ach')||'[]'); }catch(e){} }
            const earnedById={}; earnedList.forEach(e=>earnedById[e.a.id]=e);
            const showcase = picks.map(id=>earnedById[id]).filter(Boolean).slice(0,3);
            const shown = showcase.length ? showcase : earnedList.slice(0,3);
            let out='<div class="pc-ach-h">achievements <span style="color:var(--faint)">'+earnedList.length+' / '+AC.length+'</span>'+
              '<a href="stats.html#achievements" style="float:right;font-size:9.5px;color:var(--accent);text-decoration:none">'+(showcase.length?'edit showcase':'pick your showcase')+' \u2197</a></div>';
            if(shown.length){
              out+='<div style="display:flex;gap:14px;margin:2px 0 10px">'+shown.map(e=>
                /* r150: the % is only honest at field scale \u2014 below that, speak in tier words */
                '<span data-tip="'+e.a.name+' \u2014 '+e.a.desc+(function(){ const w=window.hkRarityTier?window.hkRarityTier(e.gp):null;
                  if(__fieldN>=20 && e.gp!==undefined) return ' \u00b7 '+e.gp+'% of players have this'+(w?' ('+w+')':'');
                  return w?' \u00b7 '+w:''; })()+'" style="display:flex;flex-direction:column;align-items:center;gap:3px;font-family:var(--mono);font-size:9px;color:var(--muted);text-align:center;max-width:76px">'+
                (window.hkBadge?window.hkBadge(e.a.glyph,true,46,null,e.gp):'')+(showcase.length?'\u2605 ':'')+e.a.name+
                '</span>').join('')+'</div>';
            }
            out+='<div style="font-family:var(--mono);font-size:10px;color:var(--faint);margin:0 0 4px">full grid + progress on <a href="stats.html#achievements" style="color:var(--accent)">your numbers \u2192</a></div>';
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
    let myFlair=null, mySchoolTag=null;
    try{ const meP=(d._profs||[]).find(x=>x.id===window._navUser.id);
      myFlair=meP&&meP.flair; mySchoolTag=(meP&&meP.school_tag)||null; }catch(e){}
    /* r252: SCHOOL FLAIR — the colored monogram rides beside the handle on the card.
       Shown on your own card whenever you have a school set (public display is the
       separate show_school opt-in that governs the boards). */
    /* r267 (Wolf): the chip used to crowd the handle with no gap and no label — the school
       name now rides beside it, muted, and the row gets real spacing */
    const __schName=((window.schoolResolve&&window.schoolResolve(mySchoolTag))||{}).name||mySchoolTag||'';
    const mySchoolChip = (mySchoolTag && window.schoolChip)
      ? '<span style="display:inline-flex;align-items:center;gap:7px;margin-left:6px" title="'+escHtml(__schName)+'">'+
          window.schoolChip(mySchoolTag,22)+
          '<span style="font-family:var(--mono);font-size:11px;color:var(--muted);letter-spacing:0">'+escHtml(__schName)+'</span></span>' : '';
    const __xp = computeXP(d, d.myRuns, d.mySessions);
    const __L  = levelOf(__xp);
    // r77: RANK-UP — tier climbed since last look → celebrate with the new crest
    try{
      const ti=(window.RANK_EMBLEM_IDX||{})[tier.name] ?? 0;
      const prev=parseInt(localStorage.getItem('hk_seen_tier')||'-1',10);
      if(prev>=0 && ti>prev && window.hkCelebrate){
        window.hkCelebrate({cap:'rank up', title:tier.name, rankUp:true,
          sub:'the desk noticed \u00b7 '+standing,
          colors:(window.RANK_COLORS||{})[tier.name],
          iconHtml:(window.rankEmblem?window.rankEmblem(tier.name,96,tier.bucket):'')});   /* r381: bigger hero */
      }
      if(ti>=0) localStorage.setItem('hk_seen_tier', String(ti));
    }catch(e){}
    // r286: flair is a fixed-picker value but the column takes free text over REST —
    // sanitize to a safe token so it can never break out of the class attribute (XSS).
    /* r373 FRAME SYSTEM: a flair value matching an HK_FRAMES id renders as an earned
       frame (.hk-frame-<id> + ornament HTML as the card's FIRST child). Legacy values
       (gold/emerald/holo) keep their old .flair-* classes — existing rows don't break. */
    const __safeFlair = (myFlair && /^[a-z0-9_-]{1,32}$/i.test(myFlair)) ? myFlair : null;
    const __isFrame = !!(__safeFlair && window.HK_FRAMES && window.HK_FRAMES.some(f=>f.id===__safeFlair));
    const flairCls = __safeFlair ? (__isFrame ? ' hk-frame-'+__safeFlair : ' flair-'+__safeFlair) : '';
    /* r376: plaque corners cut their gem from the bucket held at your best tier */
    const flairOrn = (__isFrame && window.hkFrameOrnaments)
      ? window.hkFrameOrnaments(__safeFlair, {bucket:(window.hkFrameBucket?window.hkFrameBucket():1)}) : '';
    m.innerHTML = '<div class="pc-card'+flairCls+'">' + flairOrn +
      '<a class="pc-x" id="pcX">\u00d7</a>' +
      '<div class="pc-head" style="margin-bottom:10px"><div class="pc-name" style="font-size:20px;letter-spacing:-.3px;display:inline-flex;align-items:center;gap:10px;flex-wrap:wrap;min-width:0">' + '<span>'+escHtml(handle)+'</span>' + mySchoolChip + (window.__hkNoHandle?' <a id="pcSetName" style="font-size:11px;color:var(--accent);cursor:pointer;text-decoration:underline">set your name</a>':'') + '</div></div>' +
      /* r134: .pc-scroll wrapper — the v3 CSS (max-height 82vh + inner scroll) existed
         but the renderer never emitted it, so long cards overflowed the frame */
      '<div class="pc-scroll">' +
      /* r70: RANK HERO — the crest gets real estate */
      /* r72: rank + LEVEL live together — crest left, tier center, level+progress right */
        /* r76: APEX-STYLE SHOWCASE — handle banner on top, two prominent circulars
         side by side beneath (crest tile | level-ring tile), labels under each. */
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:6px 0 14px">' +
        '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px 10px;background:var(--surface2);border:1px solid var(--line);border-radius:12px">' +
          '<span style="display:inline-flex;line-height:0">'+(window.rankEmblem?window.rankEmblem(tier.name,96,tier.bucket):'')+'</span>' +
          '<div class="pc-tier '+tier.cls+'" style="border:0;padding:0;font-size:13px;background:none;box-shadow:none">'+tier.name+'</div>' +
          '<div style="font-family:var(--mono);font-size:10.5px;color:var(--muted)">'+standing+'</div>' +
          /* r321 (Wolf): LP-style promotion progress \u2014 a slim bar + "N% to <next tier>", so the
             climb is legible. Model-safe: promote is just where avgPct sits across this tier's band.
             Hidden at the summit (no next tier) and while provisional (rank isn't final yet). */
          ((tier.nextName && !tier.provisional && typeof tier.promote==='number') ?
            '<div style="width:118px;margin-top:8px">' +
              '<div style="height:6px;background:var(--surface);border:1px solid var(--line);border-radius:99px;overflow:hidden"><div style="height:100%;width:'+Math.max(3,Math.min(100,tier.promote))+'%;background:var(--accent);border-radius:99px"></div></div>' +
              '<div style="font-family:var(--mono);font-size:9px;color:var(--muted);text-align:center;margin-top:4px"><b style="color:var(--text)">'+tier.promote+'%</b> to '+escHtml(tier.nextName)+'</div>' +
            '</div>'
            : (tier.provisional ? '<div style="font-family:var(--mono);font-size:9px;color:var(--faint);margin-top:8px">placement \u2014 rank locks in as you play</div>'
            : '<div style="font-family:var(--mono);font-size:9px;color:var(--accent);margin-top:8px">\u265b top of the ladder</div>')) +
          '<div class="pc-rankhow" style="font-family:var(--mono);font-size:8.5px;color:var(--faint);letter-spacing:.1em;text-transform:uppercase;margin-top:6px;cursor:pointer" title="how rank works">rank \u00b7 speed vs the field \u203a</div>' +
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
      /* r148: share row \u2014 the rank card is the proof artifact that leaves the product */
      '<div style="font-family:var(--mono);font-size:10px;color:var(--faint);text-align:center;margin:6px 0 2px">the card downloads as a PNG \u00b7 <a id="pcProThemes" style="color:var(--warn);cursor:pointer" data-tip="custom card themes land with PRO at launch">card themes \u2014 PRO</a></div>' +
      '</div>' +
      '<div class="pc-foot"><a href="leaderboard.html">full leaderboard \u2197</a><a id="pcShare">\u2b07 share your rank card</a><a id="pcClose">close</a></div>' +
      '</div>';
    const c = $('pcClose'); if(c) c.onclick = closeProfile;
    /* r309: the card's rank label opens the how-rank-works explainer */
    try{ const rh=m.querySelector('.pc-rankhow'); if(rh) rh.onclick=()=>{ closeProfile(); if(window.openRankInfo) window.openRankInfo(); else if(window.__openRankInfo) window.__openRankInfo(); }; }catch(e){}
    /* r150: the click TALKS BACK — Wolf hit a silent no-op and read it as broken */
    const shr = $('pcShare'); if(shr) shr.onclick = ()=>{ try{
      shr.textContent='rendering…';
      makeRankCard(d, tier, handle, __L, ok=>{ shr.textContent= ok ? 'saved ✓ check your downloads' : 'couldn’t render — try again';
        setTimeout(()=>{ shr.textContent='⬇ share your rank card'; }, 2600); });
      if(window.hkEvent) window.hkEvent('rankcard_share'); }catch(e){ shr.textContent='couldn’t render — try again'; } };
    const pt = $('pcProThemes'); if(pt) pt.onclick = ()=>{
      if(window.openUpgrade) window.openUpgrade('Share-card themes');
      else location.href='index.html?openUpgrade=1'; };
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
          try{ const p = await window.sb.from('profiles').select('handle,flair,theme').eq('id', window._navUser.id).maybeSingle();
            window._navProfile = p && p.data ? p.data : null; }catch(e){}
          /* r358: merge the account's cross-device state down BEFORE the pill/streak render.
             Separate query on purpose — if the migration hasn't run, ONLY this fails, never
             the handle/theme fetch above. */
          try{ const cs = await window.sb.from('profiles').select('client_state').eq('id', window._navUser.id).maybeSingle();
            if(cs && cs.data && cs.data.client_state && window.hkStateHydrate) window.hkStateHydrate(cs.data.client_state); }catch(e){}
          // r293: account theme lands on devices with no local pick yet (mobile carry)
          try{ const th=window._navProfile && window._navProfile.theme;
            if(th && window.THEMES && window.THEMES[th] && !localStorage.getItem('hotkey_theme')){
              window.applyTheme(th); localStorage.setItem('hotkey_theme', th); } }catch(e){}
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
    // r113 (#32): the level lives in the top bar — anon-friendly local estimate
    // (hk_xp_est, written at every solve); canonical XP still reprices on the card.
    /* r360 (Wolf): the top-bar level chip+bar is RETIRED — the level (with its progress
       bar) lives in the trainer's mode bar now, and the top nav sheds the clutter. */
    let lvlHtml='';
    slot.innerHTML = lvlHtml +
      '<div class="user-menu">' +
        '<button class="user-btn" id="userBtn" aria-haspopup="true" aria-expanded="false">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/></svg>' +
          '<span>' + escHtml(handle) + '</span>' +
          (anon ? '<span class="user-guest">(guest)</span>' : '') +
          '<svg class="um-caret" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>' +
        '</button>' +
        '<div class="user-dropdown" id="userDropdown" role="menu">' +
          '<a href="stats.html">Your numbers</a>' +
          (anon ? '' : '<a href="desks.html" title="your desk\u2019s hall \u2014 quests, roster, standings">Your desk</a>') +
          saveItem +
          '<a href="account.html">Account</a>' +
          '<a id="umSignout">Sign out</a>' +
        '</div>' +
      '</div>';
    const lc = $('navLvl'); if(lc) lc.onclick = ()=>{ try{ openProfile(); }catch(e){} };
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
    wire('umSignout',  () => { clearAccountUI(); Promise.race([window.sb.auth.signOut(), new Promise(r=>setTimeout(r,1200))]).catch(()=>{}).then(()=>{ try{ location.href = TRAINER_URL + '?fresh=1'; }catch(e){} }); });   // r266: never wait on a hung signOut round-trip. r296 (Wolf): sign-out LANDS YOU HOME. r299: ?fresh=1 — the trainer opens on drill one with a "signed out" cue, so it FEELS like the platform reset (last-drill memory is wiped with the account mirrors).
  }
  // Outside-click and Esc close the dropdown — global listeners, installed once.
  document.addEventListener('click', e => {
    const menu = document.querySelector('.user-menu');
    if(menu && !menu.contains(e.target)) closeUserMenu();
  });
  // Anything nav owns that's currently covering the page (game code checks this
  // to pause its own keyboard handling under our overlays).
  window.navOverlayOpen = () => !!(themesOpen || kbdOpen || settingsOpen || profileOpen);
  // r115 (#30): handle generator — xbox-style suggestions in desk dialect.
  // r298 (Wolf): pools rebuilt — the old list could deal "Bulge_…" and leaned hard on IB
  // recruiting slang. Now tongue-in-cheek across the whole spreadsheet-class (banking,
  // consulting, corp fin, accounting), with a compose-time guard as a safety net.
  // Server-side moderation (handle blocklist trigger) remains the real gate.
  window.hkSuggestHandle = function(){
    const A=['Levered','Accretive','Anchored','ProForma','Synergy','Covenant','Roadshow',
             'Waterfall','Recap','Terminal','BasisPoint','PasteSpecial','Corkscrew','MidCap',
             'PivotTable','HardCoded','ZeroBased','FullyLoaded','RunRate','TopDown','BottomUp',
             'GoingConcern','CircularRef','DoubleClick','Deliverable','ActionItem','QuickSave','WellFormatted'];
    const B=['Analyst','Associate','Modeler','Machine','Sweep','Multiple','Bridge','Anchor',
             'Macro','Deck','Tab','Cell','Margin','Plug','Font','Closer','Keyboard','Shortcut',
             'Wizard','Gridline','Footnote','Ledger','Forecast','Template','Consultant','Controller'];
    const BAD=/bulge|dilut|distress|strip|naked|swall|shaft/i;   // never compose these, whatever the pools hold later
    for(let tries=0; tries<8; tries++){
      const a=A[Math.floor(Math.random()*A.length)], b=B[Math.floor(Math.random()*B.length)];
      const num=Math.random()<0.4 ? String(Math.floor(Math.random()*90)+10) : '';
      const h=(a+'_'+b+num).slice(0,24);
      if(!BAD.test(h)) return h;
    }
    return 'Anchored_Analyst'+String(Math.floor(Math.random()*90)+10);
  };
  // r300 (Wolf): suggestions must be TRULY FREE — never deal a handle that's already taken.
  // One batched profiles query per deal (case-insensitive compare), a few rounds of redraws,
  // then a numbered fallback that's collision-proof in practice. Sync callers can still use
  // hkSuggestHandle directly; this is the checked path the UI prefers.
  window.hkSuggestHandleUnique = async function(n){
    n=n||3;
    const out=[], seen=new Set();
    for(let round=0; round<4 && out.length<n; round++){
      const cand=[];
      while(cand.length < (n-out.length)*2 && cand.length<12){
        const h=window.hkSuggestHandle();
        if(!seen.has(h.toLowerCase())){ seen.add(h.toLowerCase()); cand.push(h); } }
      const taken=new Set();
      try{
        if(window.sb){
          const {data}=await window.sb.from('profiles').select('handle').in('handle',cand);
          (data||[]).forEach(r=>taken.add(String(r.handle||'').toLowerCase()));
        }
      }catch(e){}
      for(const h of cand){ if(out.length<n && !taken.has(h.toLowerCase())) out.push(h); }
    }
    while(out.length<n) out.push((window.hkSuggestHandle()+String(Math.floor(Math.random()*900)+100)).slice(0,24));
    return out;
  };
  window.navRefreshAuth = function(){ try{ if(window.__navAuthKick) window.__navAuthKick(); }catch(e){} };
  // r134: THE player card (index's r13-era inline copy deleted — this is the only renderer)
  window.openProfile = openProfile;
  // r139: EVENTS — insert-only funnel telemetry (STRATEGY lens 2). Fire-and-forget:
  // never throws, never blocks, works signed-out (session_key stitches the funnel).
  window.hkEvent = function(name, meta){ try{
    if(!window.sb) return;
    let sk=sessionStorage.getItem('hk_sess');
    if(!sk){ sk=Math.random().toString(36).slice(2,12)+Date.now().toString(36); sessionStorage.setItem('hk_sess', sk); }
    const uid=(window._navUser&&window._navUser.id)||null;
    window.sb.from('events').insert({user_id:uid, session_key:sk,
      name:String(name).toLowerCase().replace(/[^a-z0-9_]/g,'_').slice(0,40), meta:meta||null}).then(()=>{},()=>{});
  }catch(e){} };
  // one pv per page load (cheap DAU/page traffic; the funnel's denominator)
  // r275: error telemetry — JS exceptions used to vanish silently on player machines.
  // Rate-limited to 3 per page load; message truncated; feeds the ops error feed.
  (function(){
    var sent=0;
    window.addEventListener('error', function(e){
      if(sent>=3) return; sent++;
      try{ window.hkEvent('err', { m:String(e.message||'').slice(0,180),
        src:String(e.filename||'').replace(/^.*\//,'').slice(0,60)+':'+(e.lineno||0) }); }catch(_){}
    });
    window.addEventListener('unhandledrejection', function(e){
      if(sent>=3) return; sent++;
      try{ var r=e && e.reason; window.hkEvent('err', { m:('promise: '+String((r&&r.message)||r||'')).slice(0,180) }); }catch(_){}
    });
  })();
  setTimeout(function(){ try{ window.hkEvent('pv',{p:location.pathname.replace(/^.*\//,'')||'index.html',
    mac:(/Mac/i.test(navigator.platform||'')||/Macintosh/i.test(navigator.userAgent||''))?1:0}); }catch(e){} }, 1500);
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
    /* r274: init() runs mid-parse (navMount exists before the rest of the body), so
       #siteFooter usually doesn't exist yet — the footer silently never rendered on
       ANY page. Inject now if present, else on DOMContentLoaded. */
    const injectFooter=()=>{ const f=$('siteFooter'); if(f) f.innerHTML = FOOTER_HTML; };
    if($('siteFooter')) injectFooter(); else document.addEventListener('DOMContentLoaded', injectFooter);

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
        // r323 (Wolf/agent): the intro keyboard/comfort cards are REQUIRED choices that own their
        // own lifecycle (pick() clears __introCardOpen + removes the capture keydown listener). A
        // backdrop-dismiss here only hid the card, leaving the grid keyboard-captured and FROZEN
        // with nothing on screen. Never backdrop-close them — the click does nothing.
        const __introCard = window.__introCardOpen || t.id==='kbCard' || t.id==='comfortCard';
        if(t && t.classList && t.classList.contains('show') && !__introCard &&
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
      // r292 (Wolf): use getSession (the locally-cached session) NOT getUser (a network
      // validation that returns null on any hiccup) — getUser was why the dropdown showed
      // "logged out" while the page body, which uses getSession, showed logged in. One
      // source of truth across nav + every page.
      window.sb.auth.getSession().then(({ data }) => {
        window._navUser = (data && data.session && data.session.user) || null;
        // r297 (Wolf: "open my browser, still logged in, but it doesn't show my account"):
        // render the signed-in state EAGERLY off the cached session — the handle refines
        // when the profile lands. Before this, a slow/failed profiles fetch left the auth
        // slot empty forever even though the session was right there.
        renderAuthBar();
        if(window._navUser){
          window.sb.from('profiles').select('id,handle').eq('id', window._navUser.id).maybeSingle().then(({ data: prof }) => {
            window._navProfile = prof || null;
            renderAuthBar();
            try{ navRank(); }catch(e){}   // r228 (Wolf): populate the rank pill on SIGN-IN, not only on the next refresh (the boot poll had already given up)
          });
        }
      }).catch(() => renderAuthBar());
      // React to sign-in / sign-out across tabs.
      // r266: the callback body is DEFERRED (setTimeout 0) — supabase-js v2 holds its auth
      // lock while emitting, and the profiles query inside re-acquires that same lock via
      // getSession(); querying synchronously here deadlocked the fetch until a page refresh.
      window.sb.auth.onAuthStateChange((_evt, session) => { setTimeout(() => { try{
        window._navUser = session && session.user || null;
        if(window._navUser){
          renderAuthBar();   // r297: eager render here too — the sign-in must show even if the profile fetch stalls
          window.sb.from('profiles').select('id,handle').eq('id', window._navUser.id).maybeSingle().then(({ data: prof }) => {
            window._navProfile = prof || null;
            renderAuthBar();
            try{ navRank(); }catch(e){}   // r228 (Wolf): populate the rank pill on SIGN-IN, not only on the next refresh (the boot poll had already given up)
          });
        } else {
          window._navProfile = null;
          clearAccountUI();      // r226: SIGNED_OUT (incl. from another tab) — clear the stale rank/level reactively
          renderAuthBar();
        }
      }catch(e){} }, 0); });
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
/* ============================================================
   r358 ACCOUNT-STATE SYNC — achievements, the daily streak and the ranked opt-in used to
   live ONLY in this browser's localStorage: clear the browser or switch devices and they
   were gone (the sweep's finding). They ride profiles.client_state (jsonb) now — pushed
   debounced after every change, merged down on every page boot. Requires
   dev/migrate-client-state.sql; without the column the module goes quiet on first error.
   Merge rules: counters take the max, booleans OR, seen-achievements union, the streak's
   later day wins (same day: higher count), ranked follows any device's opt-in but an
   explicit local leave still pushes false (leaving ranked is a global act).
   ============================================================ */
(function(){
  const K={flags:'hk_ach_flags', seen:'hk_ach_seen', streak:'hotkey_streak', ranked:'hk_ranked', dcDone:'hk_dc_done', dcTop:'hk_dc_top10'};
  let dead=false, t=null;
  const gj=(k,d)=>{ try{ return JSON.parse(localStorage.getItem(k)||d); }catch(e){ try{ return JSON.parse(d); }catch(_){ return null; } } };
  function snapshot(){ return { v:1,
    ach_flags: gj(K.flags,'{}')||{}, ach_seen: gj(K.seen,'[]')||[],
    streak: gj(K.streak,'{}')||{}, ranked: (function(){ try{ return localStorage.getItem(K.ranked)==='1'; }catch(e){ return false; } })(),
    dc_done: (function(){ try{ return localStorage.getItem(K.dcDone)||''; }catch(e){ return ''; } })(),
    dc_top10: (function(){ try{ return localStorage.getItem(K.dcTop)||''; }catch(e){ return ''; } })() }; }
  async function pushNow(){
    try{
      if(dead || !window.sb) return;
      const u=window._navUser; if(!u || !u.id) return;   // guests sync too — the anon row upgrades WITH them
      const { error } = await window.sb.from('profiles')
        .update({ client_state: snapshot(), client_state_at: new Date().toISOString() }).eq('id', u.id);
      if(error && /client_state|column|schema/i.test(error.message||'')) dead=true;   // migration not run yet
    }catch(e){}
  }
  window.hkStatePush=function(){ try{ clearTimeout(t); t=setTimeout(pushNow, 2500); }catch(e){} };
  window.hkStateHydrate=function(cs){
    try{
      if(!cs || typeof cs!=='object') return false;
      let changed=false;
      const lf=gj(K.flags,'{}')||{}, sf=cs.ach_flags||{};
      for(const k in sf){ const a=lf[k], b=sf[k];
        const m=(typeof b==='number'||typeof a==='number') ? Math.max(a||0,b||0) : (a||b);
        if(m!==a){ lf[k]=m; changed=true; } }
      const ls=gj(K.seen,'[]')||[], un=[...new Set([...ls, ...(cs.ach_seen||[])])];
      if(un.length!==ls.length) changed=true;
      const lst=gj(K.streak,'{}')||{}, sst=cs.streak||{};
      let st=lst;
      if(sst.d && (!lst.d || sst.d>lst.d || (sst.d===lst.d && (sst.n||0)>(lst.n||0)))){
        st=sst; if(JSON.stringify(sst)!==JSON.stringify(lst)) changed=true; }
      /* r371: daily latches — 'challenge-YYYY-MM-DD' strings, so lexicographic later-wins IS chronological */
      ['dc_done','dc_top10'].forEach((f,i)=>{ try{
        const lk=i===0?K.dcDone:K.dcTop; const lv=localStorage.getItem(lk)||'', sv=cs[f]||'';
        if(sv && sv>lv){ localStorage.setItem(lk, sv); changed=true; }
      }catch(e){} });
      let rk=null; try{ rk=localStorage.getItem(K.ranked); }catch(e){}
      const setRanked = cs.ranked && rk===null;
      if(setRanked) changed=true;
      try{
        localStorage.setItem(K.flags, JSON.stringify(lf));
        localStorage.setItem(K.seen, JSON.stringify(un));
        if(st && st.d) localStorage.setItem(K.streak, JSON.stringify(st));
        if(setRanked) localStorage.setItem(K.ranked,'1');
      }catch(e){}
      if(changed){ try{ window.dispatchEvent(new CustomEvent('hk-state-hydrated')); }catch(e){} }
      return changed;
    }catch(e){ return false; }
  };
})();

/* r359 SHARE CARD — one canvas renderer for every "share this" moment (PB results now;
   stats/cert surfaces can reuse it). Draws a 1200x630 brand card and hands it to the OS
   share sheet when available, else downloads a PNG. Payload: {big, title, lines[], url?}. */
window.hkShareCard = async function(o){
  try{
    o = o || {};
    const W=1200, H=630, cv=document.createElement('canvas'); cv.width=W; cv.height=H;
    const x=cv.getContext('2d');
    const css=k=>{ try{ return getComputedStyle(document.documentElement).getPropertyValue(k).trim(); }catch(e){ return ''; } };
    const accent=css('--accent')||'#16a862';
    // dark card regardless of theme — it travels to feeds, not to the app
    x.fillStyle='#0c0d0e'; x.fillRect(0,0,W,H);
    x.fillStyle=accent; x.fillRect(0,0,10,H);
    x.textBaseline='alphabetic';
    x.font='700 44px "JetBrains Mono", monospace';
    x.fillStyle='#e9e8e3'; x.fillText('hotkey', 70, 96);
    x.fillStyle=accent;    x.fillText('.gg', 70+x.measureText('hotkey').width, 96);
    x.font='500 26px "JetBrains Mono", monospace'; x.fillStyle='#7c7d77';
    x.fillText((o.title||'').slice(0,52), 70, 210);
    x.font='700 150px "JetBrains Mono", monospace'; x.fillStyle='#e9e8e3';
    x.fillText(String(o.big||''), 70, 370);
    x.font='500 28px "JetBrains Mono", monospace'; x.fillStyle='#a8ada7';
    let y=440; (o.lines||[]).slice(0,3).forEach(l=>{ x.fillText(String(l).slice(0,60), 70, y); y+=46; });
    x.fillStyle=accent; x.font='700 26px "JetBrains Mono", monospace';
    x.fillText(o.url||'hotkey.gg \u2014 excel keyboard training', 70, 576);
    const blob=await new Promise(r=>cv.toBlob(r,'image/png'));
    if(!blob) return;
    const file=new File([blob],'hotkey-gg.png',{type:'image/png'});
    if(navigator.canShare && navigator.canShare({files:[file]})){
      try{ await navigator.share({files:[file], title:'hotkey.gg', text:(o.title||'')+' \u00b7 hotkey.gg'}); return; }catch(e){ if(e && e.name==='AbortError') return; }
    }
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='hotkey-gg.png';
    document.body.appendChild(a); a.click(); setTimeout(()=>{ try{ URL.revokeObjectURL(a.href); a.remove(); }catch(e){} }, 800);
  }catch(e){}
};

window.hkConfetti = function(host, colors, count){
  if(!host) return;
  colors = colors && colors.length ? colors : ['#6ec9a0','#e3b341','#8ab4ff','#e0879e','#7fd4c1','#e0cf7a'];
  const box=document.createElement('div'); box.className='hk-confetti';
  let bits='';
  for(let i=0;i<(count||38);i++){
    bits+='<i style="left:'+(Math.random()*100).toFixed(1)+'%;background:'+colors[i%colors.length]+
      ';--rz:'+(360+Math.random()*540).toFixed(0)+'deg;animation-duration:'+(1.1+Math.random()*.9).toFixed(2)+
      's;animation-delay:'+(Math.random()*.35).toFixed(2)+'s"></i>';
  }
  box.innerHTML=bits; host.appendChild(box);
  setTimeout(()=>{ try{ box.remove(); }catch(e){} }, 2400);
};
/* ---- r156: PRO OFFER SHEET — THE upgrade surface, shared by every page.
   Offer content lives in drills.js HOTKEY_PRO (single source). Beta keeps
   everything free; at launch the CTA runs Stripe TEST-mode checkout via the
   create-checkout Edge Function (which refuses live keys). ---- */
window.hkProSheet = function(feature){
  const O = window.HOTKEY_PRO || {beta:true, plans:[{id:'monthly',price:'$7',cap:'per month'}], features:[], betaNote:''};
  const PL = O.plans || [{id:'monthly', price:O.monthly||'$7', cap:'per month'}];
  const old=document.getElementById('hkProWrap'); if(old) old.remove();
  let plan=PL[0];
  const w=document.createElement('div'); w.className='hk-cel-wrap'; w.id='hkProWrap';
  const rows=(O.features||[]).map(f=>
    '<div class="hk-pro-row"><div class="hk-pro-f"><b>'+f[0]+'</b><span>'+f[1]+'</span></div>'+
    '<div class="hk-pro-free">'+f[2]+'</div></div>').join('');
  w.innerHTML='<div class="hk-cel hk-pro">'+
    '<div class="hk-cel-cap"><span>hotkey.gg <b style="color:var(--warn)">PRO</b></span><a class="pc-x" id="hkProX" style="position:static;cursor:pointer">\u00d7</a></div>'+
    '<div class="hk-cel-body" style="text-align:left">'+
      (O.tagline?'<div class="hk-pro-tag">'+O.tagline+'</div>':'')+
      (feature?'<div class="hk-pro-hook"><b>'+feature+'</b> comes with PRO.</div>':'')+
      '<div class="hk-pro-grid"><div class="hk-pro-head"><span>\u25c6 pro</span><span>free</span></div>'+rows+'</div>'+
      '<div class="hk-pro-plans">'+PL.map(function(p,i){ return '<div class="hk-pro-plan'+(i===0?' on':'')+'" data-plan="'+p.id+'"><b>'+p.price+'</b><i>'+p.cap+'</i></div>'; }).join('')+'</div>'+
      (O.roadmap&&O.roadmap.length?'<div class="hk-pro-tag" style="margin:12px 0 0">landing during beta: '+O.roadmap.join(' \u00b7 ')+'</div>':'')+
      (O.beta?'<div class="hk-pro-beta">'+O.betaNote+'</div>':'')+
      (O.beta
        ? '<button class="hk-pro-cta quiet" id="hkProGo">Back to training \u2014 PRO is on, free</button>'
        : '<button class="hk-pro-cta" id="hkProGo">Upgrade \u2014 <span id="hkProPrice">'+PL[0].price+' '+PL[0].cap.split(' \u00b7 ')[0]+'</span></button>')+
      '<div class="hk-pro-msg" id="hkProMsg"></div>'+
    '</div></div>';
  document.body.appendChild(w);
  const close=()=>{ try{ w.remove(); }catch(e){} document.removeEventListener('keydown', esc, true); };
  const esc=(e)=>{ if(e.key==='Escape'){ e.preventDefault(); e.stopImmediatePropagation(); close(); } };
  document.addEventListener('keydown', esc, true);
  w.addEventListener('click', e=>{ if(e.target===w) close(); });
  const x=document.getElementById('hkProX'); if(x) x.onclick=close;
  w.querySelectorAll('.hk-pro-plan').forEach(p=>p.onclick=()=>{
    plan=PL.find(q=>q.id===p.dataset.plan)||PL[0];
    w.querySelectorAll('.hk-pro-plan').forEach(q=>q.classList.toggle('on', q===p));
    const pr=document.getElementById('hkProPrice');
    if(pr) pr.textContent = plan.price+' '+plan.cap.split(' \u00b7 ')[0];
  });
  const go=document.getElementById('hkProGo');
  if(go) go.onclick=()=>{ if(O.beta){ close(); return; } window.hkProCheckout(plan.id); };
};
window.hkProCheckout = async function(plan){
  // Stripe TEST-mode scaffold: tries the Edge Function, reports honestly when
  // checkout isn't live. The function itself refuses non-test keys.
  const msg=document.getElementById('hkProMsg');
  const say=t=>{ if(msg) msg.textContent=t; };
  if(!window.sb || !window._navUser){ say('Sign in first \u2014 PRO attaches to your account.'); return; }
  say('Opening checkout\u2026');
  try{
    const { data, error } = await window.sb.functions.invoke('create-checkout',
      { body:{ user_id: window._navUser.id, plan: plan||'yearly' } });
    if(!error && data && data.url){ location.href=data.url; return; }
  }catch(e){}
  say('Checkout isn\u2019t live yet \u2014 the beta keeps everything free.');
};
window.__hkCelQ=[]; window.__hkCelOpen=false;
window.hkCelebrate = function(o){
  if(window.__hkCelOpen){ window.__hkCelQ.push(o); return; }
  window.__hkCelOpen=true;
  const w=document.createElement('div'); w.className='hk-cel-wrap'+(o.rankUp?' hk-cel-rank':'')+(o.big?' hk-cel-big':'');
  w.innerHTML='<div class="hk-cel">'+
    '<div class="hk-cel-cap">'+(o.cap||'nice')+'</div>'+
    '<div class="hk-cel-body">'+
      (o.iconHtml?'<div class="hk-cel-icon">'+o.iconHtml+'</div>':'')+
      '<div class="hk-cel-title">'+(o.title||'')+'</div>'+
      (o.sub?'<div class="hk-cel-sub">'+o.sub+'</div>':'')+
      '<div class="hk-cel-hint">\u21b5 continue \u00b7 v \u2014 see it on your card</div>'+
    '</div></div>';
  document.body.appendChild(w);
  try{ if(document.activeElement && document.activeElement.blur) document.activeElement.blur(); }catch(e){}   // r176: a focused results button must not act on Enter
  window.hkConfetti(w.querySelector('.hk-cel-body'), o.colors);
  if(o.big) window.hkConfetti(w, o.colors, 52);   /* r305 big-moment rain; r357: 80→52 bits — indistinguishable at speed, meaningfully cheaper on integrated GPUs */
  let done=false;
  const close=()=>{ if(done) return; done=true;
    /* r352: EVERY close path detaches the key handler. It used to self-remove only when a
       key dismissed the card — a timeout/click close left it armed at capture, and the next
       Enter or Escape anywhere in the app was silently eaten (one stolen keystroke per card:
       an exit-edit Esc, a formula-commit Enter). */
    try{ document.removeEventListener('keydown', key, true); }catch(e){}
    try{ w.remove(); }catch(e){}
    window.__hkCelOpen=false;
    const nx=window.__hkCelQ.shift(); if(nx) setTimeout(()=>window.hkCelebrate(nx), 220); };
  w.addEventListener('click', close);
  const key=(e)=>{
    if(e.key==='Enter'||e.key==='Escape'){ e.preventDefault(); e.stopPropagation(); close(); document.removeEventListener('keydown',key,true); return; }
    /* r338: plain 'v' ONLY — a chorded v (Ctrl+V paste, Ctrl+Shift+V) mid-celebration used to
       hijack the paste into "view profile"; the orphaned profile modal then silently ate the
       next Escape (nav's overlay-close swallows it), wedging exit-edit until a second Esc. */
    if((e.key==='v'||e.key==='V') && !e.ctrlKey && !e.metaKey && !e.altKey && window.openProfile){ e.preventDefault(); e.stopPropagation(); close(); document.removeEventListener('keydown',key,true); try{ window.openProfile(); }catch(_){ } return; }
  };
  document.addEventListener('keydown', key, true);
  setTimeout(close, 4200);
};
