/* hotkey.gg — SHARED LEADERBOARD/DESKS ENGINE (extracted r269 from leaderboard.html).
   Pages set window.LB_PAGE = "overview" (leaderboard.html) | "teams" (desks.html)
   before loading this file. */
/* ============================================================
   SUPABASE — paste the SAME two values you used in index.html.
   Leave blank and the page shows a friendly "not connected" note.
   ============================================================ */
const SUPABASE_URL      = 'https://vshtftzrlepedydmkcnm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_yKhIRqtk7w98jUCJYjFWAQ_CMnQ4-yT';
const sb = (SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
window.sb = sb;   // expose for nav.js (shared user-menu / auth state)

// Drill list comes from drills.js — single source of truth. Previously this was a hardcoded
// array of 12 drills which drifted out of sync (was missing navigation, center, blue, series,
// sort, bridge). Building it from HOTKEY_DRILLS.menuOrder + meta gets all 18 automatically.
const CH = (window.HOTKEY_DRILLS ? window.HOTKEY_DRILLS.menuOrder : []).map(key => ({
  key,
  group: window.HOTKEY_DRILLS.groupOf ? window.HOTKEY_DRILLS.groupOf[key] : null,
  label: window.HOTKEY_DRILLS.labelOf[key] || key,
  lvl:   window.HOTKEY_DRILLS.groupOf[key] || 'More',
}));
function esc(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function fmt(ms){ return (ms/1000).toFixed(2)+'s'; }

function rowHtml(r,i,names,meId,extra,leaderMs,opts){
  const me = meId && r.user_id===meId;
  const medal = i<3 ? ' r'+(i+1) : '';
  // the chase: show your gap to the leader right on your row — the number to beat
  const gap = (me && i>0 && leaderMs) ? `<span class="gap">+${((r.time_ms-leaderMs)/1000).toFixed(2)}</span>` : '';
  /* r362: reward boards (the daily) medal the podium outright and tint the whole top 10 */
  const glyph = (opts&&opts.medals&&i<3) ? ['\ud83e\udd47','\ud83e\udd48','\ud83e\udd49'][i] : (i+1);
  return `<div class="row${i===0?' top':''}${me?' me':''}${extra?' you-extra':''}${(opts&&opts.medals&&i<10)?' t10':''}">`+
    `<span class="rk${medal}">${glyph}</span>`+
    `<span class="nm" data-uid="${r.user_id}">${esc(names[r.user_id])}${schoolChipByUid(r.user_id)}</span>`+
    `<span class="tm">${fmt(r.time_ms)}${gap}</span></div>`;
}
// r252: colored-monogram chip (themes.js window.schoolChip). Named *ByUid to avoid
// clobbering the global component — a top-level `function schoolChip` would shadow it.
function schoolChipByUid(uid, size){
  const t=(window.__schoolOf||{})[uid];
  if(!t) return '';
  return window.schoolChip ? window.schoolChip(t, size||15) : '<span class="sch">'+esc(t)+'</span>';
}
function boardHtml(c, best, names, meId, opts){
  let body;
  if(!best.length){
    body='<div class="empty" style="padding:14px 18px 6px">open board \u2014 <b>first run sets the bar</b></div>';
    for(let k=0;k<3;k++) body+='<div class="row open"><span class="rk">\u00b7</span><span class="nm">open lane</span><span class="tm">\u2014</span></div>';   /* r369: 3 placeholder lanes, not 5 — reclaim the vertical space */
  }
  else {
    const leaderMs = best[0].time_ms;
    body = best.slice(0,10).map((r,i)=>rowHtml(r,i,names,meId,false,leaderMs,opts)).join('');
    for(let k=best.length;k<3;k++) body+='<div class="row open"><span class="rk">\u00b7</span><span class="nm">open lane</span><span class="tm">\u2014</span></div>';
    const myIdx = meId ? best.findIndex(r=>r.user_id===meId) : -1;
    if(myIdx>=10){ body += '<div class="you-gap">···</div>' + rowHtml(best[myIdx], myIdx, names, meId, true, leaderMs, opts); }
  }
  return `<div class="board"><div class="board-cap"><h2>${esc(c.label)}</h2><span class="lvl">${esc(c.lvl)}</span></div>${body}</div>`;
}

/* Session boards (marathon + rapid-fire) share rendering but format the score column differently. */
function sessionRowHtml(r,i,names,meId,labelFn,extra){
  const me = meId && r.user_id===meId;
  const medal = i<3 ? ' r'+(i+1) : '';
  return `<div class="row${i===0?' top':''}${me?' me':''}${extra?' you-extra':''}">`+
    `<span class="rk${medal}">${i+1}</span>`+
    `<span class="nm" data-uid="${r.user_id}">${esc(names[r.user_id])}${schoolChipByUid(r.user_id)}</span>`+
    `<span class="tm">${labelFn(r)}</span></div>`;
}
function sessionBoardHtml(title, sublabel, best, names, meId, labelFn){
  let body;
  if(!best.length){ body='<div class="empty">no runs yet — <b>claim this board</b></div>'; }
  else {
    body = best.slice(0,10).map((r,i)=>sessionRowHtml(r,i,names,meId,labelFn)).join('');
    const myIdx = meId ? best.findIndex(r=>r.user_id===meId) : -1;
    if(myIdx>=10){ body += '<div class="you-gap">···</div>' + sessionRowHtml(best[myIdx], myIdx, names, meId, labelFn, true); }
  }
  return `<div class="board"><div class="board-cap"><h2>${esc(title)}</h2><span class="lvl">${esc(sublabel)}</span></div>${body}</div>`;
}
function bestPerUser(rows, mode, dur){
  const seen={}, best=[];
  rows.filter(r=>r.mode===mode && r.duration_sec===dur)
      .sort((a,b)=>{
        // primary: more score is better
        if(b.score !== a.score) return b.score - a.score;
        // secondary: closer to par — fewer keystrokes-over-optimal wins
        const aOver = (a.keystrokes||0) - (a.optimal||0);
        const bOver = (b.keystrokes||0) - (b.optimal||0);
        if(aOver !== bOver) return aOver - bOver;
        // tertiary: fewer misses (mostly rapid-fire)
        if((a.misses||0) !== (b.misses||0)) return (a.misses||0) - (b.misses||0);
        // quaternary: who got there first
        return new Date(a.created_at||0) - new Date(b.created_at||0);
      })
      .forEach(r=>{ if(!seen[r.user_id]){ seen[r.user_id]=true; best.push(r); } });
  return best;
}
// r298: MARATHON_DURS deleted — marathon boards retired r293; nothing referenced it
const RAPID_DURS    = [{sec:30,  label:'30-second rapid-fire'}, {sec:60, label:'60-second rapid-fire'}, {sec:90, label:'90-second rapid-fire'}];  // must match the trainer's duration configs
const marathonScore = r => `${r.score} drill${r.score===1?'':'s'} · ${r.keystrokes} keys`;
const rapidScore    = r => { const t=r.score+(r.misses||0); const a=t?Math.round(100*r.score/t):100;
                             return `${r.score} hit${r.score===1?'':'s'} · ${a}%`; };

/* ---- tier + level math (mirrors index.html/nav.js — keep the three in sync) ---- */
const TIERS = window.HK_RANK.TIERS.slice(1);   // ranked tiers (floor 'MBA Associate' excluded from requirement lists)
function tierOf(avgPct, att, wsum){
  /* r154 RANK CONSISTENCY: this wrapper took two params while every caller passed
     three — wsum silently fell on the floor, so the provisional season-zero cap
     (Summer Analyst until real exposure) never applied on ANY leaderboard surface
     while the nav card / account / stats enforced it. Same split-brain class r112
     killed; pass it through. */
  if(window.HK_RANK){ const t=window.HK_RANK.tierOf(avgPct, att, wsum); return {...t, i:t.i-1}; }  // HK_RANK indexes incl. Candidate; local TIERS excludes it
  return {...TIERS[0], i:0};
}
function levelOf(xp){   // r151: delegates to the canonical curve (HK_RANK, themes.js)
  if(window.HK_RANK && window.HK_RANK.levelOf) return window.HK_RANK.levelOf(xp);
  let lvl=1, need=150, floor=0;
  while(xp>=floor+need){ floor+=need; lvl++; need=Math.min(150*lvl, 600); }
  return {lvl, into:xp-floor, need, pct:Math.min(100,Math.round(100*(xp-floor)/need))}; }

let DATA=null;
async function load(){
  const root=document.getElementById('boards');
  if(!sb){ root.innerHTML='<div class="state"><h2>Leaderboard not connected yet</h2></div>'; return; }
  let profs=[], runs=[], sessions=[], meId=null;
  try{
    let meAnon=false;
    try{ const { data:{ session } } = await sb.auth.getSession(); meId = session ? session.user.id : null;
      const u=session&&session.user;
      meAnon = !!(u && (u.is_anonymous===true || (Array.isArray(u.identities)&&u.identities.length===0)));   // r271: mirrors nav.js isAnonUser
      window.__meAnon=meAnon; }catch(e){}
    const [p, r, se, tm, tt] = await Promise.all([
      sb.from('profiles').select('id,handle,team_code,school_tag,show_school,featured_ach,flair'),   /* r373: flair feeds the hero card's frame */
      sb.from('runs').select('user_id,challenge,time_ms,created_at').eq('mouse_used',false).order('time_ms',{ascending:true}),
      sb.from('sessions').select('user_id,mode,duration_sec,score,keystrokes,misses,optimal,created_at'),
      sb.from('team_members').select('team_id,user_id,role'),
      sb.from('teams').select('id,name,slug,verified,is_private,recruiting'),   // EXPLICIT columns — invite_code is grant-revoked (r110); select * would 403
    ]);
    profs=p.data||[]; runs=r.data||[]; sessions=se.data||[];
    window.__deskMembers=(tm&&tm.data)||[]; window.__deskTeams=(tt&&tt.data)||[];
  }catch(e){
    root.innerHTML='<div class="state"><h2>Couldn\u2019t load times</h2><p>Database unreachable \u2014 refresh in a moment.</p></div>'; return;
  }
  const names=new Proxy({},{get:(t,k)=>t[k]||( typeof k==='string'&&k.length>6 ? 'analyst-'+k.slice(0,4) : 'analyst')});
  profs.forEach(p=>{ names[p.id]=p.handle||('analyst-'+String(p.id).slice(0,4)); });
  // r122: opt-in school chips (v1.5) — tag derives server-side from the auth email
  window.__schoolOf={}; profs.forEach(p=>{ if(p.show_school&&p.school_tag) window.__schoolOf[p.id]=p.school_tag; });
  // r135: featured-achievement picks (cosmetic, curated on the stats page)
  window.__featOf={}; profs.forEach(p=>{ if(p.featured_ach) window.__featOf[p.id]=String(p.featured_ach).split(',').filter(Boolean).slice(0,3); });
  // section leaders: fastest clean run on each advanced section's flagship.
  // runs arrive time-sorted asc, so first hit per drill IS the leader.
  const SECTION_FLAGSHIPS=[['Full Builds','threestmt','tie the three statements'],
                           ['Models \u00b7 LBO','lbo','run the LBO math'],
                           ['Models \u00b7 RX','waterfall','the paydown waterfall'],
                           ['Models \u00b7 Comps','txncomps','precedent transactions']];
  window.__sectionLeaders = SECTION_FLAGSHIPS.map(([sec,key,lab])=>{
    const r=runs.find(x=>x.challenge===key);
    return {sec:sec, key:key, lab:lab, name:r?names[r.user_id]:null, t:r?(r.time_ms/1000).toFixed(2):null};
  });
  // DESKS (r111): real membership drives the filter; legacy team_code is the fallback
  // until its holders migrate. ?desk=slug turns the whole page into that desk's boards.
  let teamIds=null, myTeam=null, myDesk=null, viewDesk=null;
  const members=window.__deskMembers||[], teams=window.__deskTeams||[];
  const memByTeam={}; members.forEach(m=>{ (memByTeam[m.team_id]=memByTeam[m.team_id]||[]).push(m.user_id); });
  const deskSlug=new URLSearchParams(location.search).get('desk');
  if(deskSlug){ const t=teams.find(x=>x.slug===deskSlug);
    if(t) viewDesk={id:t.id, name:t.name, slug:t.slug, verified:!!t.verified, priv:!!t.is_private, recr:t.recruiting!==false, ids:new Set(memByTeam[t.id]||[])}; }
  if(meId){
    const mine=members.find(m=>m.user_id===meId);
    const mineTeam=mine && teams.find(t=>t.id===mine.team_id);
    if(mineTeam){ myDesk=mineTeam; myTeam=mineTeam.name; teamIds=new Set(memByTeam[mineTeam.id]||[]); }
    else{ const me=profs.find(p=>p.id===meId);
      if(me && me.team_code){ myTeam=me.team_code;
        teamIds=new Set(profs.filter(p=>p.team_code===me.team_code).map(p=>p.id)); } } }
  // r269: on desks.html, members land scoped to their OWN desk — no slug link needed
  if(pageView()==='teams' && !viewDesk && myDesk && teamIds)
    viewDesk={id:myDesk.id, name:myDesk.name, slug:myDesk.slug, verified:!!myDesk.verified, priv:!!myDesk.is_private, recr:myDesk.recruiting!==false, ids:teamIds};
  const teamOnly = !viewDesk && myTeam && sessionStorage.getItem('hk_teamview')==='1';
  // render the section-leaders strip into its mount (added below the featured grid)
  setTimeout(()=>{ try{
    if(pageView()!=='overview') return;   // r269: overview-only strip
    let host=document.getElementById('secleadMount');
    if(!host){ const feat=document.querySelector('.featured'); if(!feat) return;
      host=document.createElement('div'); host.id='secleadMount'; feat.parentNode.insertBefore(host, feat); }
    host.innerHTML='<div class="section-title">\u25c6 section leaders</div><div class="seclead">'+
      window.__sectionLeaders.map(s=>'<div class="sl"><div class="sl-sec"><span class="dia">\u25c6</span>'+s.sec+'</div>'+
        (s.name?('<div class="sl-name">'+s.name+'</div><div class="sl-t">'+s.t+'s clean</div>')
               :'<div class="sl-name" style="color:var(--faint)">unclaimed</div><div class="sl-t">be first</div>')+
        '<div class="sl-lab">'+s.lab+'</div></div>').join('')+'</div>';
  }catch(e){} }, 0);
  const baseIds = viewDesk ? viewDesk.ids : (teamOnly ? teamIds : null);
  const fRuns = baseIds ? runs.filter(r=>baseIds.has(r.user_id)) : runs;
  const fSessions = baseIds ? sessions.filter(r=>baseIds.has(r.user_id)) : sessions;

  // per-drill best-per-user boards + per-user standing, computed once
  const perDrill={}, userStat={};
  CH.forEach(c=>{
    const seen={}, best=[];
    fRuns.filter(x=>x.challenge===c.key).forEach(x=>{ if(!seen[x.user_id]){ seen[x.user_id]=true; best.push(x); } });
    perDrill[c.key]=best;
    best.forEach((r,i)=>{ const u=userStat[r.user_id]=userStat[r.user_id]||{att:0,entries:[],crowns:0,pod:0,t10:0};
      u.att++; u.entries.push({pct: best.length>1 ? i/(best.length-1) : 0, n:best.length});
      if(i===0)u.crowns++; if(i<3)u.pod++; if(i<10)u.t10++; });
  });
  Object.values(userStat).forEach(st=>{ st.avg = window.HK_RANK.ratingOf(st.entries);
    st.wsum = st.entries.reduce((a,e)=>a+Math.min(1, Math.log2((e.n||1)+1)/Math.log2(9)),0); });
  // r269: standings panels rank the WHOLE field even when the boards are desk-scoped
  let gUserStat=userStat;
  if(baseIds){ gUserStat={};
    CH.forEach(c=>{ const seen={}, best=[];
      runs.filter(x=>x.challenge===c.key).forEach(x=>{ if(!seen[x.user_id]){ seen[x.user_id]=true; best.push(x); } });
      best.forEach((r,i)=>{ const u=gUserStat[r.user_id]=gUserStat[r.user_id]||{att:0,entries:[],crowns:0,pod:0,t10:0};
        u.att++; u.entries.push({pct: best.length>1 ? i/(best.length-1) : 0, n:best.length});
        if(i===0)u.crowns++; if(i<3)u.pod++; if(i<10)u.t10++; });
    });
    Object.values(gUserStat).forEach(st=>{ st.avg = window.HK_RANK.ratingOf(st.entries);
      st.wsum = st.entries.reduce((a,e)=>a+Math.min(1, Math.log2((e.n||1)+1)/Math.log2(9)),0); });
  }
  const mySolves = meId ? fRuns.filter(x=>x.user_id===meId).length : 0;
  DATA={profs,runs,sessions,fRuns,fSessions,names,meId,teamIds,myTeam,myDesk,viewDesk,teamOnly,perDrill,userStat,gUserStat,mySolves,myApps:{}};
  // r270: guild board \u2014 surface my open applications so cards show "applied \u00b7 pending"
  if(pageView()==='teams' && meId && !myDesk){
    try{ const {data:ap}=await sb.rpc('my_applications'); (ap||[]).forEach(a=>{ DATA.myApps[a.team_id]=true; }); }catch(e){}
  }
  // ================= r136: THE DESK HALL — captain-first team dashboard =================
  // Wolf: "not a re-skinned leaderboard — captains need to see users, evaluate at a
  // glance, chase assignment completion, and justify the investment." Guild-style:
  // ROI band (hours saved, cohort improvement, coverage, momentum) + quest board with
  // per-member ticks + evaluation roster. Everything derives from already-loaded runs.
  setTimeout(async ()=>{ try{
    let b=document.getElementById('deskBanner');
    if(!DATA.viewDesk || subView()==='manage'){ if(b) b.remove(); return; }
    if(!b){ const root=document.getElementById('boards'); b=document.createElement('div'); b.id='deskBanner'; root.parentNode.insertBefore(b, root); }
    const ids=[...DATA.viewDesk.ids];
    const WEEK=7*86400000, now=Date.now();
    const capRow=(window.__deskMembers||[]).find(m=>m.team_id===DATA.viewDesk.id && m.role==='captain');
    const captainId=capRow&&capRow.user_id;
    const iAmCaptain=!!(DATA.meId && captainId===DATA.meId);

    // ---- per-member ledger: first-vs-best per drill, weekly activity ----
    const eco={}; // uid -> {savedMs, impPcts:[], week:0, prevWeek:0, runs:0, drills:Set}
    ids.forEach(id=>eco[id]={savedMs:0, impPcts:[], week:0, prevWeek:0, runs:0, drills:new Set()});
    const byUD={};
    DATA.fRuns.forEach(r=>{
      const e=eco[r.user_id]; if(!e) return;
      e.runs++; e.drills.add(r.challenge);
      const t=new Date(r.created_at||0).getTime();
      if(t>now-WEEK) e.week++; else if(t>now-2*WEEK) e.prevWeek++;
      (byUD[r.user_id+'|'+r.challenge]=byUD[r.user_id+'|'+r.challenge]||[]).push(r);
    });
    Object.entries(byUD).forEach(([k,arr])=>{
      if(arr.length<2) return;
      const uid=k.split('|')[0];
      const first=arr.slice().sort((a,b2)=>new Date(a.created_at||0)-new Date(b2.created_at||0))[0].time_ms;
      const best=Math.min(...arr.map(r=>r.time_ms));
      if(first>best){ eco[uid].savedMs+=(first-best); eco[uid].impPcts.push((first-best)/first); }
    });
    const teamSavedMs=ids.reduce((a,id)=>a+eco[id].savedMs,0);
    const allImp=ids.flatMap(id=>eco[id].impPcts);
    const avgImp=allImp.length?Math.round(100*allImp.reduce((a,x)=>a+x,0)/allImp.length):null;
    const teamRuns=ids.reduce((a,id)=>a+eco[id].runs,0);
    const teamDrills=new Set(); ids.forEach(id=>eco[id].drills.forEach(d=>teamDrills.add(d)));
    const wk=ids.reduce((a,id)=>a+eco[id].week,0), pwk=ids.reduce((a,id)=>a+eco[id].prevWeek,0);
    const fmtSaved=ms=>{ const m=Math.round(ms/60000); if(!m) return '<1m';   // r149: 29s of gains read as "0m" — a broken-looking zero
      return m>=60 ? (Math.floor(m/60)+'h '+(m%60)+'m') : (m+'m'); };
    const mom = pwk ? Math.round(100*(wk-pwk)/pwk) : null;

    // ---- hall header ----
    const capName=captainId?DATA.names[captainId]:null;
    let html='<div class="dk-hall">'+
      '<div class="dk-cap"><span>\u25c6 THE DESK</span><span>'+(DATA.meId?'<a id="deskReport" style="cursor:pointer;color:var(--faint)">report</a>':'')+'</span></div>'+
      '<div class="dk-head">'+
        '<div class="dk-crest">\u25c6</div>'+
        '<div class="dk-id"><div class="dk-name">'+esc(DATA.viewDesk.name)+(DATA.viewDesk.verified?' <span class="dk-ver">\u2713 verified</span>':'')+'</div>'+
        '<div class="dk-sub">'+ids.length+' analyst'+(ids.length===1?'':'s')+
          (capName?' \u00b7 staffer: <b data-uid="'+captainId+'" style="cursor:pointer">'+esc(capName)+'</b>':' \u00b7 <span style="color:var(--warn)">staffer seat open \u2014 first code-join takes the desk</span>')+'</div></div>'+
        (iAmCaptain?'<a class="dk-manage" href="desks.html?manage=1">staffer controls \u2192</a>':'')+
        (!iAmCaptain && DATA.meId && !window.__meAnon && !DATA.myDesk && !DATA.viewDesk.priv && !DATA.viewDesk.ids.has(DATA.meId)
          ?'<a class="dk-manage" id="dkApply" style="cursor:pointer">apply to join \u2192</a>':'')+
      '</div>';

    // ---- ROI band ----
    html+='<div class="dk-stats">'+
      '<div class="dk-stat"><div class="v">'+(teamSavedMs?fmtSaved(teamSavedMs):'\u2014')+'</div><div class="l">faster, first try \u2192 best<br>summed across the desk</div></div>'+
      '<div class="dk-stat"><div class="v">'+(avgImp!==null?avgImp+'%':'\u2014')+'</div><div class="l">avg speed-up per<br>re-drilled task</div></div>'+
      '<div class="dk-stat"><div class="v">'+teamRuns+'</div><div class="l">clean runs \u00b7 '+teamDrills.size+' / '+CH.length+'<br>drills covered</div></div>'+
      '<div class="dk-stat'+(wk||pwk?(wk>=pwk?' up':' down'):'')+'"><div class="v">'+wk+(mom!==null?' <em>'+(mom>=0?'\u25b2':'\u25bc')+Math.abs(mom)+'%</em>':'')+'</div><div class="l">runs this week<br>vs last</div></div>'+
      '</div>';

    // ---- quest board (assignments w/ per-member ticks) ----
    let asg=[];
    try{ const {data:a2}=await sb.from('team_assignments')
      .select('challenge,target_ms,note,created_at,expires_at')
      .eq('team_id', DATA.viewDesk.id).gt('expires_at', new Date().toISOString())
      .order('created_at'); asg=a2||[]; }catch(e){}
    const lab={}; CH.forEach(c=>lab[c.key]=c.label||c.key);
    if(asg.length){
      html+='<div class="dk-sect">this week\u2019s quests</div><div class="dk-quests">'+asg.map(a=>{
        const since=new Date(a.created_at).getTime();
        const doneIds=ids.filter(id=>DATA.fRuns.some(r=>r.user_id===id && r.challenge===a.challenge &&
          (!a.target_ms || r.time_ms<=a.target_ms) && new Date(r.created_at||0).getTime()>=since));
        const pct=ids.length?Math.round(100*doneIds.length/ids.length):0;
        const dSet=new Set(doneIds);
        const daysLeft=Math.max(0,Math.ceil((new Date(a.expires_at).getTime()-now)/86400000));
        return '<div class="dk-quest'+(pct===100?' done':'')+'">'+
          '<div class="dk-q-top"><span class="dk-q-name">\u25c6 '+esc(lab[a.challenge]||a.challenge)+'</span>'+
            '<span class="dk-q-tgt">'+(a.target_ms?('under '+(a.target_ms/1000)+'s'):'clean clear')+' \u00b7 '+daysLeft+'d left</span></div>'+
          (a.note?'<div class="dk-q-note">\u201c'+esc(a.note)+'\u201d</div>':'')+
          '<div class="dk-q-bar"><i style="width:'+pct+'%"></i></div>'+
          '<div class="dk-q-n">'+doneIds.length+' / '+ids.length+' done'+(pct===100?' \u2014 quest complete':'')+'</div>'+
          '<div class="dk-q-ticks">'+ids.map(id=>'<span class="'+(dSet.has(id)?'ok':'no')+'" data-uid="'+id+'" title="'+esc(DATA.names[id])+(dSet.has(id)?' \u2713':' \u2014 not yet')+'">'+
            (dSet.has(id)?'\u2713':'\u00b7')+' '+esc(DATA.names[id])+'</span>').join('')+'</div>'+
          '</div>';
      }).join('')+'</div>';
    } else {
      html+='<div class="dk-sect">this week\u2019s quests</div>'+
        '<div class="dk-empty">'+(iAmCaptain?'no quests pinned \u2014 pin up to 3 drills from your <a href="desks.html?manage=1" style="color:var(--accent)">staffer controls</a> (targets + notes optional)':'no quests pinned this week \u2014 the staffer sets them')+'</div>';
    }

    // ---- evaluation roster ----
    const roster=ids.map(id=>{ const st=DATA.userStat[id]; const e=eco[id];
      const t=st?tierOf(st.avg, st.att, st.wsum):window.HK_RANK.tierOf(null,0);
      return {id, name:DATA.names[id], tier:t, att:(st&&st.att)||0, crowns:(st&&st.crowns)||0,
        week:e.week, saved:e.savedMs, cap:id===captainId}; })
      .sort((a,b2)=> b2.week-a.week || b2.crowns-a.crowns || b2.att-a.att);
    html+='<div class="dk-sect">the roster</div><div class="dk-roster">'+
      '<div class="dk-r hd"><span>analyst</span><span>rank</span><span>boards</span><span>crowns</span><span>this wk</span><span>saved</span></div>'+
      roster.map(m=>'<div class="dk-r'+(m.week===0?' idle':'')+'" data-uid="'+m.id+'">'+
        '<span class="nm">'+(m.cap?'\u2605 ':'')+esc(m.name)+(m.id===DATA.meId?' <b class="you">(you)</b>':'')+'</span>'+
        '<span class="tr">'+(window.rankEmblem?window.rankEmblem(m.tier.name,16,m.tier.bucket):'')+' '+esc(m.tier.name)+'</span>'+
        '<span>'+m.att+'</span><span>'+(m.crowns||'\u00b7')+'</span>'+
        '<span class="wk">'+(m.week||(iAmCaptain?'\u26a0 0':'0'))+'</span>'+
        '<span>'+(m.saved?fmtSaved(m.saved):'\u2014')+'</span></div>').join('')+
      '</div>'+
      '<div class="dk-foot">every board below is desk-only \u00b7 click any analyst for their card'+(iAmCaptain?' \u00b7 \u26a0 = no runs this week':'')+
        (DATA.meId && !iAmCaptain && DATA.viewDesk.ids.has(DATA.meId)
          ?' \u00b7 <a id="dkLateral" style="cursor:pointer;color:var(--warn)" title="leave this desk \u2014 your runs and rank travel with you">\u2609 lateral out</a>':'')+
      /* r149: the artifacts that leave the product \u2014 print report + PNG summary card */
      '<span style="float:right"><a id="deskExport" style="cursor:pointer;color:var(--accent)">\u2399 cohort report (print / PDF)</a> \u00b7 <a id="deskCardBtn" style="cursor:pointer;color:var(--accent)">\u2b07 summary card</a></span></div>'+
      '</div>';
    b.innerHTML=html;
    // ---- r149: COHORT REPORT EXPORT \u2014 everything derives from the hall's own numbers ----
    const questDone=a=>{
      const since=new Date(a.created_at).getTime();
      return ids.filter(id=>DATA.fRuns.some(r=>r.user_id===id && r.challenge===a.challenge &&
        (!a.target_ms || r.time_ms<=a.target_ms) && new Date(r.created_at||0).getTime()>=since)).length;
    };
    function buildDeskPrint(){
      let pr=document.getElementById('deskPrint');
      if(!pr){ pr=document.createElement('div'); pr.id='deskPrint'; document.body.appendChild(pr); }
      const today=new Date().toISOString().slice(0,10);
      pr.innerHTML='<div class="rp-brand">hotkey<b>.gg</b></div>'+
        '<div class="rp-cap">cohort report \u00b7 keyboard-only excel training</div>'+
        '<h1>'+esc(DATA.viewDesk.name)+(DATA.viewDesk.verified?' \u2713':'')+'</h1>'+
        '<div class="rp-sub">'+ids.length+' analyst'+(ids.length===1?'':'s')+
          (capName?' \u00b7 staffer: '+esc(capName):'')+' \u00b7 generated '+today+'</div>'+
        '<div class="rp-band">'+
          '<div><div class="v">'+(teamSavedMs?fmtSaved(teamSavedMs):'\u2014')+'</div><div class="l">faster, first try \u2192 best, summed</div></div>'+
          '<div><div class="v">'+(avgImp!==null?avgImp+'%':'\u2014')+'</div><div class="l">avg speed-up per re-drilled task</div></div>'+
          '<div><div class="v">'+teamRuns+'</div><div class="l">clean runs \u00b7 '+teamDrills.size+' / '+CH.length+' drills covered</div></div>'+
          '<div><div class="v">'+wk+'</div><div class="l">runs this week ('+pwk+' last'+(mom!==null?', '+(mom>=0?'+':'')+mom+'%':'')+')</div></div>'+
        '</div>'+
        (asg.length?('<h2>live assignments</h2><table><tr><th>drill</th><th>bar</th><th class="r">completed</th></tr>'+
          asg.map(a=>{ const dn=questDone(a);
            return '<tr><td>'+esc(lab[a.challenge]||a.challenge)+(a.note?' \u2014 \u201c'+esc(a.note)+'\u201d':'')+'</td>'+
              '<td>'+(a.target_ms?('under '+(a.target_ms/1000)+'s'):'clean clear')+'</td>'+
              '<td class="r">'+dn+' / '+ids.length+'</td></tr>'; }).join('')+'</table>'):'')+
        '<h2>the roster</h2><table><tr><th>analyst</th><th>rank</th><th class="r">boards</th><th class="r">crowns</th><th class="r">runs this wk</th><th class="r">time saved</th></tr>'+
        roster.map(m=>'<tr><td>'+(m.cap?'\u2605 ':'')+esc(m.name)+'</td><td>'+esc(m.tier.name)+'</td>'+
          '<td class="r">'+m.att+'</td><td class="r">'+(m.crowns||'\u2014')+'</td>'+
          '<td class="r">'+m.week+'</td><td class="r">'+(m.saved?fmtSaved(m.saved):'\u2014')+'</td></tr>').join('')+'</table>'+
        '<div class="rp-foot">time saved = each analyst\u2019s first recorded time vs current best on re-drilled tasks, summed \u00b7 '+
        'speed-up = the average of those first\u2192best gains \u00b7 clean runs exclude mouse use and guided practice.<br>'+
        'boards, ranks and live completion at www.hotkey.gg/desks.html?desk='+esc(DATA.viewDesk.slug)+'</div>';
      return pr;
    }
    const ex=document.getElementById('deskExport');
    if(ex) ex.onclick=()=>{ try{ buildDeskPrint(); if(window.hkEvent) hkEvent('report_print',{d:DATA.viewDesk.slug}); window.print(); }catch(e){} };
    // ---- r149: PNG summary card (1200x627) \u2014 the forwardable version of the ROI band ----
    const cb=document.getElementById('deskCardBtn');
    if(cb) cb.onclick=()=>{ try{
      const cv=document.createElement('canvas'); cv.width=1200; cv.height=627;
      const x=cv.getContext('2d');
      const css=getComputedStyle(document.documentElement);
      const col=v=>css.getPropertyValue(v).trim()||'#000';
      x.fillStyle=col('--bg'); x.fillRect(0,0,1200,627);
      x.fillStyle=col('--surface'); x.fillRect(32,32,1136,563);
      x.strokeStyle=col('--accent'); x.lineWidth=2; x.strokeRect(32,32,1136,563);
      x.fillStyle=col('--accent'); x.font='700 32px "JetBrains Mono", monospace';
      x.fillText('hotkey.gg', 72, 104);
      x.fillStyle=col('--muted'); x.font='500 20px "JetBrains Mono", monospace';
      x.fillText('cohort summary \u00b7 keyboard-only excel', 72, 138);
      x.fillStyle=col('--text'); x.font='700 50px "Hanken Grotesk", sans-serif';
      x.fillText(DATA.viewDesk.name.slice(0,26)+(DATA.viewDesk.verified?' \u2713':''), 72, 224);
      x.fillStyle=col('--muted'); x.font='500 24px "JetBrains Mono", monospace';
      x.fillText(ids.length+' analyst'+(ids.length===1?'':'s')+(capName?(' \u00b7 staffer '+capName):''), 72, 268);
      const stats=[[teamSavedMs?fmtSaved(teamSavedMs):'\u2014','time saved'],
                   [avgImp!==null?avgImp+'%':'\u2014','avg speed-up'],
                   [String(teamRuns),'clean runs'],
                   [teamDrills.size+'/'+CH.length,'drills covered']];
      stats.forEach((s,i)=>{ const sx=72+i*272;
        x.fillStyle=col('--accent'); x.font='700 44px "JetBrains Mono", monospace';
        x.fillText(s[0], sx, 400);
        x.fillStyle=col('--muted'); x.font='500 17px "JetBrains Mono", monospace';
        x.fillText(s[1], sx, 434); });
      x.fillStyle=col('--text'); x.font='500 22px "JetBrains Mono", monospace';
      x.fillText(wk+' runs this week'+(mom!==null?(' \u00b7 '+(mom>=0?'\u25b2 +':'\u25bc ')+Math.abs(mom)+'% vs last'):''), 72, 500);
      x.fillStyle=col('--faint'); x.font='500 20px "JetBrains Mono", monospace';
      x.fillText('generated '+new Date().toISOString().slice(0,10)+' \u00b7 hotkey.gg', 72, 566);
      const a=document.createElement('a');
      a.download='hotkey-desk-'+DATA.viewDesk.slug+'.png';
      a.href=cv.toDataURL('image/png'); a.click();
      if(window.hkEvent) hkEvent('report_card',{d:DATA.viewDesk.slug});
    }catch(e){} };
    const dkl=document.getElementById('dkLateral'); let dklArmed=false;
    if(dkl) dkl.onclick=async()=>{
      if(!dklArmed){ dklArmed=true; dkl.textContent='\u2609 lateral out \u2014 click again to confirm'; setTimeout(()=>{dklArmed=false; dkl.textContent='\u2609 lateral out';},2800); return; }
      try{ const {error}=await sb.rpc('leave_desk');
        if(error){ dkl.textContent=deskErrMsg(error); return; }
        location.href='desks.html';   // lands on the guild board \u2014 find the next seat
      }catch(e){ dkl.textContent='something went wrong'; } };
    const dka=document.getElementById('dkApply');
    if(dka) dka.onclick=async()=>{ try{
      const {error}=await sb.rpc('apply_to_desk',{p_team:DATA.viewDesk.id, p_note:null});
      dka.textContent = error ? deskErrMsg(error) : 'applied \u2713 \u2014 the staffer decides';
      dka.style.pointerEvents='none';
    }catch(e){ dka.textContent='something went wrong'; } };
    const rep=document.getElementById('deskReport');
    if(rep) rep.onclick=async()=>{ try{
      await sb.from('reports').insert({reporter:DATA.meId, kind:'desk', target:DATA.viewDesk.slug});
      rep.textContent='reported \u2713'; rep.style.pointerEvents='none'; }catch(e){} };
  }catch(e){} }, 0);
  renderAll();
}

/* PUBLIC PLAYER CARDS (r114, #28): click any name on any board — zero new queries,
   everything renders from the already-loaded runs/standing. */
function showPublicCard(uid){
  if(!DATA) return;
  const {userStat,names,meId}=DATA;
  const st=userStat[uid];
  const t=st ? tierOf(st.avg, st.att, st.wsum) : window.HK_RANK.tierOf(null, 0);
  let deskNm=null;
  try{ const m=(window.__deskMembers||[]).find(x=>x.user_id===uid);
    if(m){ const tt=(window.__deskTeams||[]).find(x=>x.id===m.team_id); deskNm=tt&&tt.name; } }catch(e){}
  const best=[];
  Object.keys(DATA.perDrill).forEach(k=>{ const arr=DATA.perDrill[k];
    const i=arr.findIndex(r=>r.user_id===uid);
    if(i>=0) best.push({k:k, i:i, n:arr.length, ms:arr[i].time_ms}); });
  best.sort((a,b)=>a.i-b.i || a.ms-b.ms);
  const lab={}; CH.forEach(c=>lab[c.key]=c.label||c.key);
  const old=document.getElementById('pubCard'); if(old) old.remove();
  const m=document.createElement('div'); m.id='pubCard'; m.className='pub-wrap';
  m.innerHTML='<div class="pub-card">'+
    '<div class="pub-cap"><span>PLAYER CARD</span><span>'+(meId&&uid!==meId?'<a class="pub-rep" style="cursor:pointer;color:var(--faint);font-size:9px;margin-right:12px">report</a>':'')+'<a class="pub-x">\u00d7</a></span></div>'+
    '<div class="pub-hero">'+(window.rankEmblem?window.rankEmblem(t.name,64,t.bucket):'')+   /* r381: bigger hero */
      '<div><div class="pub-nm">'+esc(names[uid])+(uid===meId?' <span class="pub-you">(you)</span>':'')+'</div>'+
      '<div class="pc-tier '+t.cls+'" style="margin-top:4px">'+   /* r374: chip layout + gap live on .pc-tier (nav.css); crest at the 16 chip scale (was 13) */
        (window.rankEmblem?window.rankEmblem(t.name,16,t.bucket):'')+'<span>'+(t.full||t.name)+(t.provisional?' \u00b7 provisional':'')+'</span></div>'+
      (deskNm?'<div class="pub-desk">\u25c6 '+esc(deskNm)+'</div>':'')+
      ((window.__schoolOf||{})[uid]?'<div class="pub-desk" style="color:var(--muted);display:flex;align-items:center;gap:6px">'+schoolChipByUid(uid,16)+esc((window.schoolResolve&&window.schoolResolve(window.__schoolOf[uid])||{}).name||window.__schoolOf[uid])+'</div>':'')+'</div></div>'+
    '<div class="pub-tiles">'+
      '<span><b>'+((st&&st.crowns)||0)+'</b> crowns</span><span><b>'+((st&&st.pod)||0)+'</b> podiums</span>'+
      '<span><b>'+((st&&st.t10)||0)+'</b> top-10s</span><span><b>'+((st&&st.att)||0)+'</b> boards</span></div>'+
    (function(){ // r135: their showcase — picked medals, rendered as-is (cosmetic)
      try{
        const AC=window.HOTKEY_ACHIEVEMENTS; const picks=(window.__featOf||{})[uid];
        if(!AC||!picks||!picks.length||!window.hkBadge) return '';
        const byId={}; AC.forEach(a=>byId[a.id]=a);
        const items=picks.map(id=>byId[id]).filter(Boolean);
        if(!items.length) return '';
        return '<div style="display:flex;gap:12px;justify-content:center;margin:2px 0 10px">'+items.map(a=>
          '<span title="'+esc(a.name)+' \u2014 '+esc(a.desc)+'" style="display:flex;flex-direction:column;align-items:center;gap:2px;font-family:var(--mono);font-size:8.5px;color:var(--muted);max-width:72px;text-align:center">'+
          window.hkBadge(a.glyph,true,34)+'\u2605 '+esc(a.name)+'</span>').join('')+'</div>';
      }catch(e){ return ''; }
    })()+
    (best.length?'<div class="pub-best">'+best.slice(0,3).map(x=>
      '<div class="pub-row"><span class="rk'+(x.i<3?' r'+(x.i+1):'')+'">'+(x.i+1)+'</span>'+
      '<span class="nm">'+esc(lab[x.k]||x.k)+'</span><span class="tm">'+(x.ms/1000).toFixed(2)+'s \u00b7 of '+x.n+'</span></div>').join('')+'</div>'
      :'<div class="pub-best" style="color:var(--faint)">no board entries yet</div>')+
    '</div>';
  const close=()=>{ m.remove(); document.removeEventListener('keydown', esch, true); };
  const esch=(e)=>{ if(e.key==='Escape'){ e.stopImmediatePropagation(); close(); } };
  m.addEventListener('click', e=>{ if(e.target===m) close(); });
  m.querySelector('.pub-x').onclick=close;
  const pr=m.querySelector('.pub-rep');
  if(pr) pr.onclick=async()=>{ try{
    await sb.from('reports').insert({reporter:meId, kind:'handle', target:uid});
    pr.textContent='reported \u2713'; pr.style.pointerEvents='none'; }catch(e){} };
  document.addEventListener('keydown', esch, true);
  document.body.appendChild(m);
}
document.addEventListener('click', e=>{
  const el=e.target.closest ? e.target.closest('[data-uid]') : null;
  if(el && DATA){ showPublicCard(el.getAttribute('data-uid')); }
});

const RANKED_MIN_LVL = 10;
function campaignComplete(){
  try{
    const PB=JSON.parse(localStorage.getItem('hotkey_pb')||'{}');
    const CAMP=window.HOTKEY_CAMPAIGN, PARS=window.HOTKEY_PARS||{};
    if(!CAMP) return false;
    return CAMP.chapters.every(c=>c.keys.every(k=>PB[k]!==undefined && (!PARS[k] || PB[k]<=PARS[k]*CAMP.GATE)));
  }catch(e){ return false; }
}
function rankedOptedIn(){ try{ return localStorage.getItem('hk_ranked')==='1'; }catch(e){ return false; } }
function heroHtml(){
  const {userStat,meId,mySolves,perDrill}=DATA;
  if(!meId){
    /* r368: the signed-out card was a tall box with two lines glued to the bottom —
       center the pitch and give it a real CTA so the space reads intentional */
    return '<div class="panel me" style="display:flex;flex-direction:column"><h4>your card</h4>'+
      '<div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:16px;text-align:center;padding:10px 6px">'+
      '<div style="font-family:var(--mono);font-size:13.5px;color:var(--muted);line-height:1.8;max-width:300px">Times only count on the boards for signed-in accounts.</div>'+
      '<a href="index.html" class="fd-play" style="margin-left:0">sign in &amp; post a time →</a>'+
      '<div style="font-family:var(--mono);font-size:10.5px;color:var(--faint);line-height:1.7;max-width:300px">your rank, level and progress toward the next tier land here</div>'+
      '</div></div>';
  }
  const me=userStat[meId]||{att:0,sum:0,crowns:0,pod:0,t10:0};
  // RANKED GATE: RANKED_MIN_LVL unlocks Ranked; entering it shows the season-start infographic.
  {
    /* r371: the gate ran a RETIRED lifetime xp ladder while every other surface uses
       HK_RANK.computeXP — same player, different level, Enter Ranked wrongly withheld. */
    const xp0=window.HK_RANK ? window.HK_RANK.computeXP(
      DATA.fRuns.filter(x=>x.user_id===meId),
      {t10:me.t10, pod:me.pod, crowns:me.crowns},
      DATA.fSessions.filter(x=>x.user_id===meId)) : 0;
    const lvl0=levelOf(xp0).lvl;
    if(!rankedOptedIn()){
      const campDone = campaignComplete();
      const devUnlock=(function(){ try{ return localStorage.getItem('hk_dev_unlock')==='1'; }catch(e){ return false; } })();
      const eligible = lvl0>=RANKED_MIN_LVL || campDone || devUnlock;
      const lvlPct = Math.min(100, Math.round(100*lvl0/RANKED_MIN_LVL));
      return '<div class="panel me"><h4>your card</h4>'+
        '<div style="font-family:var(--mono);font-size:13px;color:var(--muted);line-height:1.8">'+
        (eligible
          ? 'Ranked is unlocked ('+(campDone?'all milestones shipped':'LVL '+lvl0)+'). Entering shows your placement on every board you\u2019ve run \u2014 nothing is lost by waiting.'
          : 'Ranked unlocks at <b style="color:var(--warn)">LVL '+RANKED_MIN_LVL+'</b> or by shipping every track milestone. You\u2019re LVL '+lvl0+'.')+
        '</div>'+
        (!eligible?'<div style="margin-top:10px"><div style="font-family:var(--mono);font-size:10px;color:var(--faint);margin-bottom:4px">progress to LVL '+RANKED_MIN_LVL+'</div><div style="height:6px;background:var(--surface2);border-radius:99px;overflow:hidden"><div style="height:100%;width:'+lvlPct+'%;background:var(--accent);border-radius:99px"></div></div></div>':'')+
        (eligible?'<div style="display:flex;gap:10px;margin-top:14px"><button class="tab on" id="enterRanked" style="font-size:13px;padding:10px 22px">\u2694 Enter Ranked</button><button class="tab" id="waitRanked" style="font-size:12px;padding:10px 18px">Not yet</button></div>':'')+
        '</div>';
    }
  }
  // r336 (Wolf): STANDARDIZED PLACEMENT — once you enter ranked, your first rank is withheld
  // until you post a keyboard-only time on each of the five standard boards (HK_PLACEMENT):
  // the same five for every analyst, one from each band of the arc, so early ranks compare.
  {
    const pset=(window.HK_PLACEMENT?window.HK_PLACEMENT.KEYS:[]).filter(k=>CH.some(c=>c.key===k));
    const done=pset.filter(k=>DATA.fRuns.some(r=>r.user_id===meId && r.challenge===k));
    if(pset.length && done.length<pset.length){
      const rows=pset.map(k=>{ const c=CH.find(x=>x.key===k); const ok=done.indexOf(k)>=0;
        return '<div class="pl-row'+(ok?' ok':'')+'"><span class="pl-tick">'+(ok?'\u2713':'\u00b7')+'</span>'+
          '<span class="pl-nm">'+esc(c?c.label:k)+'</span>'+
          (ok?'<span class="pl-done">posted</span>':'<a class="pl-go" href="index.html?drill='+encodeURIComponent(k)+'">run it \u2192</a>')+'</div>'; }).join('');
      return '<div class="panel me"><h4>your card</h4>'+
        '<div style="font-family:var(--mono);font-size:12.5px;color:var(--muted);line-height:1.7">\u2694 <b style="color:var(--text)">Placement series \u2014 '+done.length+'/'+pset.length+'</b><br>'+
        'Post a keyboard-only time on each of the five standard boards \u2014 the same five for every analyst, one from each band of the catalog \u2014 and your first rank is placed off one yardstick.</div>'+
        '<div class="pl-list">'+rows+'</div></div>';
    }
  }
  const avg=me.att?me.avg:null;
  const t=tierOf(avg, me.att, me.wsum);
  // r116: XP v4 — ONE implementation (HK_RANK.computeXP); the old inline mirror had drifted
  const xp = window.HK_RANK.computeXP(
    DATA.fRuns.filter(x=>x.user_id===meId),
    {t10:me.t10||0, pod:me.pod||0, crowns:me.crowns||0},
    DATA.fSessions.filter(x=>x.user_id===meId));
  const L=levelOf(xp);
  /* r293 (Wolf): the persistent next-rank progression block is retired — the opt-in
     infographic already explains the climb, and the card stays slim. Keep the exit. */
  const nextHtml='<div class="yc-next"><a id="leaveRanked" style="font-size:10px;color:var(--faint);cursor:pointer;text-decoration:underline dotted">leave ranked</a></div>';
  /* r373 FRAME SYSTEM: the signed-in hero wears the same earned frame as the profile
     card — .hk-frame-<id> + ornaments first. Same sanitize + legacy split as nav.js. */
  let __fCls='', __fOrn='';
  try{
    const __mp=(DATA.profs||[]).find(p=>p.id===meId);
    const __fv=__mp && __mp.flair;
    if(__fv && /^[a-z0-9_-]{1,32}$/i.test(__fv)){
      if(window.HK_FRAMES && window.HK_FRAMES.some(f=>f.id===__fv)){
        __fCls=' hk-frame-'+__fv;
        /* r376: gem cut = the bucket held at the best tier (hk_ach_flags, via nav.js) */
        __fOrn=window.hkFrameOrnaments ? window.hkFrameOrnaments(__fv, {bucket:(window.hkFrameBucket?window.hkFrameBucket():1)}) : '';
      } else __fCls=' flair-'+__fv;   // legacy gold/emerald/holo — harmless no-op on .panel
    }
  }catch(e){}
  return '<div class="panel me'+__fCls+'">'+__fOrn+'<h4>your card</h4>'+
    '<div class="yc-top"><span class="pc-tier '+t.cls+'">'+(window.rankEmblem?window.rankEmblem(t.name,32,t.bucket):'')+'<span>'+(t.full||t.name)+'</span></span>'+   /* r374 chip layout on .pc-tier · r381: 32 hero scale */
    '<span class="yc-lvl">LVL '+L.lvl+'</span><span class="yc-bar"><i style="width:'+L.pct+'%"></i></span>'+
    '<span style="font-family:var(--mono);font-size:11px;color:var(--muted)">'+L.into+'/'+L.need+' xp</span></div>'+
    '<div style="font-family:var(--mono);font-size:12.5px;color:var(--muted)">'+
      me.crowns+' crown'+(me.crowns===1?'':'s')+' \u00b7 '+me.pod+' podiums \u00b7 '+me.att+'/'+CH.length+' drills \u00b7 '+mySolves+' clean solves</div>'+
    nextHtml+'</div>';
}

function rankedInfographic(){
  let m=document.getElementById('rankedModal');
  if(!m){ m=document.createElement('div'); m.id='rankedModal';
    m.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:300;padding:20px';
    document.body.appendChild(m); }
  const T=window.HK_RANK.TIERS;
  let rows='';
  T.forEach(t=>{ rows+='<div style="display:flex;align-items:center;gap:10px;padding:7px 4px;font-family:var(--mono);font-size:12.5px">'+   /* r374: 22 @ gap 10 — same row scale as the tier roster */
    '<span class="'+t.cls+'" style="display:inline-flex;color:inherit;">'+(window.rankEmblem?window.rankEmblem(t.name,22):'')+'</span>'+
    '<span>'+t.name+'</span><span style="margin-left:auto;color:var(--faint);font-size:10.5px">'+(t.att?t.att+' drills \u00b7 top '+Math.round(Math.min(1,t.pct)*100)+'%':'start here')+'</span></div>'; });
  m.innerHTML='<div class="panel" style="max-width:460px;width:100%">'+
    '<h4>welcome to ranked</h4>'+
    '<div style="font-family:var(--mono);font-size:12.5px;color:var(--muted);line-height:1.8;margin-bottom:12px">'+
    'Entry starts with a <b>placement series</b> \u2014 the same five standard boards for every analyst '+
    '(one from each band of the catalog); your first rank shows once all five are posted.<br><br>'+
    'Your rank = your <b>average placement</b> across the boards you\u2019ve entered \u2014 stabilized two ways: '+
    'with only a few boards, your rating starts near the middle and your results pull it toward your true level (so two fast drills alone can\u2019t crown you); '+
    'and small fields count for less than big ones (1st of 2 says less than 4th of 40). Until you\u2019ve faced enough real competition, your rank is capped and tagged <b>provisional</b> \u2014 everyone starts low and earns altitude. Breadth + placement is the climb.<br><br>'+
    'Each tier splits into three <b>buckets</b> by where you sit inside that tier\u2019s band: '+
    'you enter at <b>Bottom Bucket</b>, pass through <b>Middle</b>, and reach <b>Top Bucket</b> as your average placement improves \u2014 clear the band and you promote to the next tier.</div>'+rows+
    '<div style="font-family:var(--mono);font-size:11px;color:var(--faint);margin-top:10px">Ranks are live: they can fall as well as rise when other players improve.</div>'+
    '<div style="display:flex;gap:10px;margin-top:16px"><button class="tab on" id="rankedGo" style="flex:1;text-align:center;font-size:13px;padding:11px">Enter Ranked \u2694</button>'+
    '<button class="tab" id="rankedWait" style="padding:11px 18px;font-size:12px">Not yet</button></div></div>';
  document.getElementById('rankedGo').onclick=()=>{ try{ localStorage.setItem('hk_ranked','1'); }catch(e){} try{ window.hkStatePush&&window.hkStatePush(); }catch(e){} m.remove(); load(); };
  document.getElementById('rankedWait').onclick=()=>m.remove();
  m.addEventListener('click',e=>{ if(e.target===m) m.remove(); },{once:true});
}
function ladderHtml(){
  const {userStat,meId}=DATA;
  const me=(meId&&userStat[meId])||{att:0,sum:0};
  const avg=me.att?me.avg:null;
  const cur=tierOf(avg, me.att, me.wsum);
  // r112: TIERS.slice(1) already starts at Candidate — the manual prepend listed it twice
  const T=TIERS.map(t=>({name:t.name,cls:t.cls,req:t.req||((t.att?t.att+' drills':'')+(t.pct<=1?' \u00b7 top '+Math.round(t.pct*100)+'%':' \u00b7 any placement'))}));
  let rows='';
  T.forEach((t,i)=>{
    const here=t.name===cur.name;
    const locked=i>(cur.i??-1)+1 && !here;
    const reqLines=String(t.req).split(/\s*[\u00b7\u2014,]\s*/).filter(Boolean).slice(0,3)
      .map(p=>'<i>'+p+'</i>').join('');   // r268: stacked nowrap lines — the ragged mid-phrase wrap read as compression
    rows+='<div class="ld-row'+(here?' here':'')+(locked&&!here?' locked':'')+'">'+
      '<span class="'+t.cls+'" style="display:inline-flex;color:inherit">'+(window.rankEmblem?window.rankEmblem(t.name,22):'')+'</span>'+
      '<span>'+t.name+(here?' \u2014 you':'')+'</span><span class="ld-req">'+reqLines+'</span></div>';
  });
  return '<div class="panel"><h4>the ladder</h4>'+rows+'</div>';
}
function topPlayersHtml(){
  const {userStat,names,meId}=DATA;
  const ranked=Object.keys(userStat).map(u=>({u, ...userStat[u]}))
    .filter(x=>x.att>=5).sort((a,b)=>a.avg-b.avg || b.att-a.att);
  /* r374 icon scale (Wolf: sizes were eyeballed per site — 16/18/22/24 across four row
     surfaces): field rows (top players, tier roster, ranked-modal ladder) all render the
     crest at 22; dense desk tables stay 16 (10.5px labels); card chips are 16; heroes
     keep their own art sizes (54 pub / 84 profile / 28 your-card pill). */
  let rows='';
  ranked.slice(0,8).forEach((x,i)=>{
    const t=tierOf(x.avg,x.att,x.wsum);
    rows+='<div class="tp-row'+(x.u===meId?' me':'')+'"><span class="rk'+(i<3?' r'+(i+1):'')+'">'+(i+1)+'</span>'+
      '<span class="nm" data-uid="'+x.u+'">'+esc(names[x.u])+'</span>'+
      '<span class="tp-emb" title="'+t.name+'">'+(window.rankEmblem?window.rankEmblem(t.name,22,t.bucket):'')+'</span>'+
      '<span class="pct"><b>top '+Math.max(1,Math.round(x.avg*100))+'%</b><i>'+x.att+' drills</i></span></div>';
  });
  const myIdx=meId?ranked.findIndex(x=>x.u===meId):-1;
  if(myIdx>=8){ const x=ranked[myIdx]; const t=tierOf(x.avg,x.att,x.wsum);
    rows+='<div class="you-gap">\u00b7\u00b7\u00b7</div><div class="tp-row me"><span class="rk">'+(myIdx+1)+'</span>'+
      '<span class="nm" data-uid="'+x.u+'">'+esc(names[x.u])+'</span>'+
      '<span class="tp-emb" title="'+t.name+'">'+(window.rankEmblem?window.rankEmblem(t.name,22,t.bucket):'')+'</span>'+
      '<span class="pct"><b>top '+Math.max(1,Math.round(x.avg*100))+'%</b><i>'+x.att+' drills</i></span></div>'; }
  if(!rows) rows='<div class="empty">nobody has placed yet (5+ drills) \u2014 <b>be the first name here</b></div>';
  return '<div class="panel"><h4>top players \u00b7 the field</h4>'+rows+'</div>';
}

function featuredHtml(){
  const {fRuns,names,meId}=DATA;
  /* r362 (Wolf: the daily belongs FRONT AND CENTER here): this board used to read the retired
     'daily-<date>' key — nothing has posted there since the morning sheet was retired, so the
     board sat permanently empty. It reads the REAL Daily Challenge ('challenge-<date>') now,
     labels it from the shared pool, and wears the hero styling + top-10 medals. */
  const dailyDate=new Date().toISOString().slice(0,10);
  let dSeed=0; for(const ch of dailyDate) dSeed=(dSeed*31+ch.charCodeAt(0))>>>0;
  const cSeed=(dSeed^0x9e3779b9)>>>0;   // = index.html challengeSeed()
  const pool=(window.HOTKEY_CHALLENGE_POOL||[]).filter(k=>window.HOTKEY_DRILLS&&window.HOTKEY_DRILLS.labelOf[k]);
  const dk=pool.length?pool[cSeed%pool.length]:null;
  const dl=(dk&&window.HOTKEY_DRILLS.labelOf[dk])||'Daily Challenge';
  const seenD={}, bestD=[];
  fRuns.filter(x=>x.challenge==='challenge-'+dailyDate).forEach(x=>{ if(!seenD[x.user_id]){ seenD[x.user_id]=true; bestD.push(x); } });
  bestD.sort((a,b)=>a.time_ms-b.time_ms);
  // weekly
  const d=new Date(); const onejan=new Date(d.getUTCFullYear(),0,1);
  const wk=Math.ceil((((d-onejan)/864e5)+onejan.getUTCDay()+1)/7);
  const wkStr=d.getUTCFullYear()+'-'+String(wk).padStart(2,'0');
  let seed=0; for(const ch of wkStr) seed=(seed*31+ch.charCodeAt(0))>>>0;
  const mul=(a=>()=>{a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;})(seed);
  const bag=(window.HOTKEY_DRILLS?window.HOTKEY_DRILLS.menuOrder.slice():[]);
  for(let i=bag.length-1;i>0;i--){ const j=Math.floor(mul()*(i+1)); [bag[i],bag[j]]=[bag[j],bag[i]]; }
  const legs=bag.slice(0,5);
  const per={};
  legs.forEach(k=>{ const ck='wk-'+wkStr+'-'+k; const seen={};
    fRuns.filter(x=>x.challenge===ck).forEach(x=>{ if(seen[x.user_id]) return; seen[x.user_id]=true;
      (per[x.user_id]=per[x.user_id]||{})[k]=x.time_ms; }); });
  const combined=Object.keys(per).filter(u=>legs.every(k=>per[u][k]!==undefined))
    .map(u=>({user_id:u, time_ms:legs.reduce((s,k)=>s+per[u][k],0)})).sort((a,b)=>a.time_ms-b.time_ms);
  const midnight=new Date(); midnight.setHours(24,0,0,0);
  const hrsLeft=Math.max(0, Math.round((midnight-new Date())/36e5));
  /* r364: yesterday's podium — the honor roll rides the hero card */
  const yDate=new Date(Date.now()-86400e3).toISOString().slice(0,10);
  const seenY={}, bestY=[];
  fRuns.filter(x=>x.challenge==='challenge-'+yDate).sort((a,b)=>a.time_ms-b.time_ms)
    .forEach(x=>{ if(!seenY[x.user_id]){ seenY[x.user_id]=true; bestY.push(x); } });
  const gl=['\ud83e\udd47','\ud83e\udd48','\ud83e\udd49'];
  const podium=bestY.slice(0,3).map((r,i)=>gl[i]+' '+esc(names[r.user_id]||'analyst')+' '+fmt(r.time_ms)).join(' \u00b7 ');
  return '<div class="featured">'+
    '<div class="featured-daily">'+
      '<div class="fd-head"><span class="fd-live">\u25cf live</span><b>\u25c6 the Daily Challenge \u00b7 '+dl+'</b>'+
      '<span class="fd-meta">resets in ~'+hrsLeft+'h \u00b7 top 3 medal \u00b7 top 10 +40 xp & wear it on their card'+(podium?' \u00b7 yesterday: '+podium:'')+'</span>'+
      '<a class="fd-play" href="index.html?daily=1">play it \u2192</a></div>'+
      boardHtml({label:'today\u2019s global field', lvl:dailyDate}, bestD, names, meId, {medals:true})+
    '</div>'+
    boardHtml({label:'\ud83c\udfc1 weekly gauntlet \u00b7 '+legs.length+' legs, one clock', lvl:'wk '+wkStr}, combined, names, meId)+
    rosterHtml(true)+   /* r369: the field-by-tier panel fills the other half of the row */
    '</div>';
}

/* ---- drill browser: tabs + chips + one detail board ---- */
let browseTab = sessionStorage.getItem('hk_lb_tab') || 'drills';
if(browseTab==='marathon') browseTab='drills';   // r293: marathon boards retired — stale saved tab falls back
let browseKey = sessionStorage.getItem('hk_lb_key') || null;
/* r335 (Wolf): tier sub-menu on the drill boards — a dropdown scopes the detail board to one
   rank tier; bucket chips (Bottom/Middle/Top) narrow further once a tier is picked. 'all' = off. */
let tierFilter = sessionStorage.getItem('hk_lb_tier') || 'all';
let bucketFilter = sessionStorage.getItem('hk_lb_bucket') || 'all';
let rosterTier = null;
function rosterHtml(flush){
  const {names,meId}=DATA; const userStat=DATA.gUserStat||DATA.userStat;
  const users=Object.entries(userStat).map(([u,st])=>{
    const av=st.att?st.avg:null;
    return {u, st, av, tier:TIER_OF(av, st.att, st.wsum)};
  }).filter(x=>x.av!==null);
  if(!users.length) return '';
  const myTier = meId && users.find(x=>x.u===meId) ? users.find(x=>x.u===meId).tier.name : null;
  if(rosterTier===null) rosterTier = myTier || TIERS[0].name;
  const tierNames=window.HK_RANK.TIERS.map(t=>t.name);
  const inTier=users.filter(x=>x.tier.name===rosterTier).sort((a,b)=>a.av-b.av);
  let rows=inTier.map((x,i)=>'<div class="ros-row'+(x.u===meId?' me':'')+'">'+
    '<span class="ros-n">'+(i+1)+'</span>'+
    (window.rankEmblem?window.rankEmblem(x.tier.name,22,x.tier.bucket):'')+
    '<span class="ros-nm" data-uid="'+x.u+'">'+esc(names[x.u])+'</span>'+
    '<span class="ros-b">'+(x.tier.bucket||'')+'</span>'+
    '<span class="ros-r">rating '+(x.av*100).toFixed(1)+'</span>'+
    '<span class="ros-a">'+x.st.att+' boards</span></div>').join('');
  if(!inTier.length) rows='<div class="empty">nobody holds this tier yet \u2014 it\u2019s open</div>';
  return '<div class="panel" style="margin-top:'+(flush?'0':'18px')+'"><h4>the field \u00b7 by tier</h4>'+
    '<div class="ros-tabs">'+tierNames.map(tn=>'<span class="tab ros-t'+(tn===rosterTier?' on':'')+'" data-tier="'+tn+'">'+tn.replace(' Analyst','')+'</span>').join('')+'</div>'+
    '<div class="ros-list">'+rows+'</div>'+
    '<div style="font-family:var(--mono);font-size:10px;color:var(--faint);margin-top:8px">rating = stabilized average placement (lower is better) \u00b7 your row is highlighted</div></div>';
}
function TIER_OF(av,att,w){ return window.HK_RANK.tierOf(av,att,w); }
/* r252: SCHOOL STANDINGS — school-vs-school aggregate of opted-in analysts.
   Crowns (board #1s) lead the ranking; headcount and the school's champion follow.
   Reflects the current board scope (global by default). Skips silently when the
   field has no opted-in schools yet. */
function schoolStandingsHtml(){
  if(!window.schoolResolve || !DATA) return '';
  const {profs,names,meId}=DATA; const userStat=DATA.gUserStat||DATA.userStat;
  const by={};
  let mineKey=null;
  profs.forEach(p=>{
    if(!(p.show_school && p.school_tag)) return;
    const s=window.schoolResolve(p.school_tag); if(!s) return;
    const key=s.id||('other:'+s.name.toLowerCase());
    const e=by[key]||(by[key]={key:key, tag:(s.id||p.school_tag), name:s.name, n:0, competing:0,
      crowns:0, pod:0, best:null, bestU:null, boards:0});
    e.n++;
    const st=userStat[p.id];
    if(st && st.att){ e.competing++; e.crowns+=st.crowns; e.pod+=st.pod; e.boards+=st.att;
      if(e.best===null || st.avg<e.best){ e.best=st.avg; e.bestU=p.id; } }
    if(meId && p.id===meId) mineKey=key;
  });
  const rows=Object.values(by).filter(e=>e.n>0);
  if(!rows.length) return '';
  rows.sort((a,b)=> b.crowns-a.crowns || b.pod-a.pod || b.competing-a.competing || b.n-a.n
    || ((a.best==null?9:a.best)-(b.best==null?9:b.best)) || a.name.localeCompare(b.name));
  const body=rows.slice(0,12).map((e,i)=>{
    const mine = mineKey && e.key===mineKey;
    const champ = e.bestU ? ('champion '+esc(names[e.bestU])) : (e.competing?'':'no ranked runs yet');
    const analysts = e.competing || e.n;
    return '<div class="st-row'+(mine?' mine':'')+'">'+
      '<span class="st-rk'+(i<3?(' m'+(i+1)):'')+'">'+(i+1)+'</span>'+
      (window.schoolChip?window.schoolChip(e.tag,22):'')+
      '<span class="st-body"><span class="st-name">'+esc(e.name)+'</span>'+
        (champ?'<span class="st-champ">'+champ+'</span>':'')+'</span>'+
      '<span class="st-stats">'+
        (e.crowns?'<span class="crown"><b>'+e.crowns+'</b> ♛</span>':'')+
        '<span class="analysts"><b>'+analysts+'</b> '+(analysts===1?'analyst':'analysts')+'</span>'+
        '<span class="boards"><b>'+e.boards+'</b> boards</span>'+
      '</span></div>';
  }).join('');
  return '<div class="panel standings"><h4>🎓 School Standings</h4>'+
    '<div class="st-list">'+body+'</div>'+
    '<div style="font-family:var(--mono);font-size:10px;color:var(--faint);margin-top:8px">'+
      'schools ranked by crowns (board #1s), then depth · opt in from your account to fly your colors</div></div>';
}
/* r270: shared desk-error copy (mirrors account.html's map + the application codes) */
function deskErrMsg(e){ const m=String((e&&e.message)||e||'');
  if(m.includes('DESK_NAME_PROTECTED')) return 'real firm and group names are reserved \u2014 verified desks are coming.';
  if(m.includes('DESK_NAME_RESERVED')) return 'that name isn\u2019t available.';
  if(m.includes('ALREADY_ON_DESK'))   return 'you\u2019re already on a desk \u2014 leave it first.';
  if(m.includes('DESK_NOT_FOUND'))    return 'that invite code isn\u2019t valid.';
  if(m.includes('DESK_FULL'))         return 'that desk is full (200).';
  if(m.includes('DESK_RATE_LIMIT'))   return 'one desk per day \u2014 try again tomorrow.';
  if(m.includes('DESK_PRIVATE'))      return 'that desk is invite-only.';
  if(m.includes('DESK_NOT_RECRUITING')) return 'that desk closed its roster \u2014 invite codes still work.';
  if(m.includes('APPLY_RATE_LIMIT'))  return 'five open applications max \u2014 withdraw one first.';
  if(m.includes('FULL_ACCOUNT_REQUIRED')) return 'applications need a full account \u2014 add an email to your account first.';
  if(m.includes('APPLICATION_GONE'))  return 'that application was already handled.';
  if(m.includes('APPLICANT_TAKEN'))   return 'they joined another desk in the meantime.';
  if(m.includes('NOT_CAPTAIN'))       return 'only the staffer can do that.';
  if(m.includes('ASSIGN_CAP'))        return 'three live assignments max \u2014 clear one first.';
  if(m.includes('does not exist')||m.includes('Could not find')||m.includes('404'))
                                      return 'applications aren\u2019t live yet \u2014 ask the staffer for an invite code.';
  if(m.includes('duplicate key'))     return 'a desk with that name already exists.';
  return 'something went wrong.'; }

/* r293 (Wolf): desk identity helpers — a deterministic accent hue per desk (cards
   stop looking identical) and a WSO-style tier grade (S+++ … C-) from the roster's
   competitive record. Grades need 3+ competing analysts; below that a desk reads
   "unrated" instead of pretending small-sample precision. */
function deskHue(slug){ let h=0; const s=String(slug||''); for(let i=0;i<s.length;i++){ h=(h*31 + s.charCodeAt(i))>>>0; } return h%360; }
const DESK_GRADES=[[.12,'S+++'],[.16,'S++'],[.20,'S+'],[.25,'S'],[.30,'A+'],[.36,'A'],[.44,'B+'],[.52,'B'],[.62,'C+'],[.75,'C'],[9,'C-']];
function deskGrade(meanRating, competing){
  if(competing<3 || meanRating==null) return null;
  for(const [cap,g] of DESK_GRADES){ if(meanRating<=cap) return g; }
  return 'C-';
}
/* r376: BULGE BRACKET latch — when the signed-in analyst's OWN desk grades S+++
   (the top of DESK_GRADES), hk_ach_flags.deskPeak latches 1 for the mythic feat.
   Numeric, so the r358 hydration max carries it across devices — and like every
   earned cosmetic it doesn't fall when the desk later slips. */
function latchDeskPeak(grade){
  try{
    if(grade!==DESK_GRADES[0][1]) return;
    const fl=JSON.parse(localStorage.getItem('hk_ach_flags')||'{}');
    if(fl.deskPeak) return;
    fl.deskPeak=1;
    localStorage.setItem('hk_ach_flags', JSON.stringify(fl));
    try{ window.hkStatePush && window.hkStatePush(); }catch(e){}
  }catch(e){}
}
function deskGradeChip(g){
  if(!g) return '<span class="dk-grade unrated" title="grades unlock at 3 competing analysts">unrated</span>';
  const cls=g[0]==='S'?'s':(g[0]==='A'?'a':(g[0]==='B'?'b':'c'));
  return '<span class="dk-grade '+cls+'" title="desk grade \u2014 roster-wide average placement, WSO-tier scale">'+g+'</span>';
}
/* r270: THE GUILD BOARD \u2014 deskless players browse public desks, apply with a
   one-line note, redeem an invite code, or start their own. Private desks list
   but stay invite-only. */
function guildHtml(){
  if(!DATA) return '';
  const teams=window.__deskTeams||[], members=window.__deskMembers||[];
  const stat=DATA.gUserStat||DATA.userStat, names=DATA.names;
  const memBy={}; members.forEach(m=>{ (memBy[m.team_id]=memBy[m.team_id]||[]).push(m.user_id); });
  const apps=DATA.myApps||{};
  const cards=teams.map(t=>{
    const ids=memBy[t.id]||[];
    let crowns=0,boards=0,best=null,bestU=null,competing=0,rsum=0;
    ids.forEach(id=>{ const st=stat[id]; if(!(st&&st.att)) return;
      competing++; rsum+=st.avg; crowns+=st.crowns; boards+=st.att;
      if(best===null||st.avg<best){ best=st.avg; bestU=id; } });
    return {t:t, n:ids.length, crowns:crowns, boards:boards, bestU:bestU,
      grade:deskGrade(competing?rsum/competing:null, competing)};
  }).sort((a,b)=> b.crowns-a.crowns || b.n-a.n || a.t.name.localeCompare(b.t.name));
  // r376: the guild board computes every desk's grade with rosters in hand — latch
  // Bulge Bracket here too, so the feat lands wherever the grade first renders
  try{ if(DATA.meId) cards.forEach(c=>{ if((memBy[c.t.id]||[]).indexOf(DATA.meId)>=0) latchDeskPeak(c.grade); }); }catch(e){}
  const canApply=!!DATA.meId;
  const cardHtml=cards.map(c=>{
    const t=c.t, applied=!!apps[t.id];
    const act = t.is_private
      ? '<span class="gb-lock" title="private desk \u2014 joins by invite code only">\ud83d\udd12 invite-only</span>'
      : (t.recruiting===false
      ? '<span class="gb-lock" title="the staffer closed the roster \u2014 invite codes still work">roster closed</span>'
      : (applied
        ? '<span class="gb-applied" data-team="'+t.id+'" title="click to withdraw">applied \u00b7 pending \u2713</span>'
        : (canApply
          ? (window.__meAnon
            ? '<a class="gb-lock" href="account.html" title="anonymous sessions can\u2019t apply \u2014 add an email to your account">add an email to apply</a>'
            : '<button class="tab gb-apply" data-team="'+t.id+'">apply</button>')
          : '<a class="tab" href="index.html">sign in to apply</a>')));
    const hue=deskHue(t.slug);
    return '<div class="gb-card" style="border-left:3px solid hsl('+hue+' 45% 52%);background:linear-gradient(135deg, hsl('+hue+' 40% 50% / .07), transparent 55%), var(--surface)">'+
      '<div class="gb-top"><span class="dk-mini" style="color:hsl('+hue+' 45% 55%)">\u25c6</span><a class="gb-name" href="desks.html?desk='+encodeURIComponent(t.slug)+'">'+esc(t.name)+(t.verified?' <span style="color:var(--accent)">\u2713</span>':'')+'</a>'+deskGradeChip(c.grade)+'</div>'+
      '<div class="gb-stats">'+c.n+' analyst'+(c.n===1?'':'s')+(c.crowns?' \u00b7 '+c.crowns+' \u265b':'')+(c.boards?' \u00b7 '+c.boards+' boards':'')+'</div>'+
      (c.bestU?'<div class="gb-champ">top analyst '+esc(names[c.bestU])+'</div>':'<div class="gb-champ" style="color:var(--faint)">open roster \u2014 be the first name on it</div>')+
      '<div class="gb-act"><a class="gb-hall" href="desks.html?desk='+encodeURIComponent(t.slug)+'">the hall \u2192</a>'+act+'</div>'+
      '<div class="gb-note" id="gbn-'+t.id+'"></div>'+
      '</div>';
  }).join('');
  const startRow = DATA.meId
    ? (window.__meAnon
      ? '<div class="gb-start" style="color:var(--muted);align-items:center;text-align:center"><span>Desks need a full account \u2014 <a href="account.html" style="color:var(--accent)">add an email &amp; password</a> and your progress comes with you.</span></div>'
      : '<div class="gb-start">'+
          /* r316 (Wolf): invite code is the PRIMARY action \u2014 most people join, they don\u2019t found.
             Starting a desk is demoted to a quieter secondary line so the page stops pushing it. */
          '<div class="gb-join"><span class="gb-join-l">Got an invite code?</span>'+
            '<input id="gbCode" maxlength="12" placeholder="paste it here"><button class="tab on" id="gbJoin">join desk</button>'+
            '<span class="gb-msg" id="gbMsg"></span></div>'+
          '<div class="gb-found"><span class="gb-found-l">or start your own \u2014</span>'+
            '<input id="gbName" maxlength="40" placeholder="desk name (e.g. Wharton UG Finance)"><button class="tab" id="gbCreate">start a desk</button></div>'+
        '</div>')
    : '<div class="gb-start" style="color:var(--muted);align-items:center;text-align:center"><span><a href="index.html" style="color:var(--accent)">Sign in</a> to apply to a desk or start your own.</span></div>';   /* r368: one centered line — the left-glued note left the panel mostly blank */
  /* r293 (Wolf): ONE tile + arrows instead of a full grid, tight header, no explainer */
  /* r297: with ZERO desks the carousel used to render two stranded arrows around an empty
     stage \u2014 now the empty state is a single centered line and the chrome stays hidden */
  const caro = cardHtml
    ? '<div class="gb-caro" style="grid-column:1/-1">'+   /* r316 (Wolf): 3-across sliding track, fills the width */
        '<button class="gb-arrow" id="gbPrev" aria-label="previous desks">\u2039</button>'+
        '<div class="gb-stage" id="gbStage"><div class="gb-track" id="gbTrack">'+cardHtml+'</div></div>'+
        '<button class="gb-arrow" id="gbNext" aria-label="next desks">\u203a</button>'+
        '<span class="gb-count" id="gbCount"></span>'+
      '</div>'
    : '<div style="grid-column:1/-1; text-align:center; padding:26px 0; font-family:var(--mono); font-size:12.5px; color:var(--muted)">no desks yet \u2014 start one below</div>';
  return '<h3 class="section-title">The guild board</h3>'+ caro +
    '<div style="grid-column:1/-1">'+startRow+'</div>';
}
function wireGuild(){
  const say=(id,t,bad)=>{ const el=document.getElementById(id); if(el){ el.textContent=t; el.style.color=bad?'var(--warn)':'var(--accent)'; } };
  // r316 (Wolf): 3-across sliding carousel — arrows scroll the track one desk at a time with a
  // smooth transform; counter shows the visible window; arrows disable at the ends.
  { const track=document.getElementById('gbTrack');
    if(track){
      const cards=[...track.querySelectorAll('.gb-card')];
      const pv=document.getElementById('gbPrev'), nx=document.getElementById('gbNext'), ct=document.getElementById('gbCount');
      const perView=()=> window.innerWidth<=720 ? 1 : (window.innerWidth<=980 ? 2 : 3);
      let gi=0;
      const maxGi=()=>Math.max(0, cards.length - perView());
      const show=()=>{
        gi=Math.max(0, Math.min(gi, maxGi()));
        const first=cards[0];
        const step=first ? (first.getBoundingClientRect().width + 12) : 0;   // card width + gap
        track.style.transform='translateX('+(-gi*step)+'px)';
        if(ct){ const end=Math.min(cards.length, gi+perView()); ct.textContent=cards.length?((gi+1)+(end>gi+1?'–'+end:'')+' / '+cards.length):'no desks yet'; }
        const atStart=gi<=0, atEnd=gi>=maxGi();
        if(pv){ pv.disabled=atStart; }
        if(nx){ nx.disabled=atEnd; }
        const solo=cards.length<=perView();
        if(pv) pv.style.display=solo?'none':'';
        if(nx) nx.style.display=solo?'none':'';
      };
      if(pv) pv.onclick=()=>{ gi-=1; show(); };
      if(nx) nx.onclick=()=>{ gi+=1; show(); };
      let rz; window.addEventListener('resize', ()=>{ clearTimeout(rz); rz=setTimeout(show, 120); });
      show();
    } }
  document.querySelectorAll('.gb-apply').forEach(b=>b.onclick=()=>{
    const host=document.getElementById('gbn-'+b.dataset.team); if(!host) return;
    host.innerHTML='<input class="gb-notein" maxlength="140" placeholder="one line for the staffer (optional)">'+
      '<button class="tab on gb-send">send</button>';
    const send=host.querySelector('.gb-send');
    send.onclick=async()=>{ send.disabled=true;
      try{ const note=(host.querySelector('.gb-notein').value||'').trim()||null;
        const {error}=await sb.rpc('apply_to_desk',{p_team:b.dataset.team, p_note:note});
        if(error){ host.innerHTML='<span class="gb-msg" style="color:var(--warn)">'+esc(deskErrMsg(error))+'</span>'; return; }
        if(DATA) DATA.myApps[b.dataset.team]=true;
        renderAll();
      }catch(e){ host.innerHTML='<span class="gb-msg" style="color:var(--warn)">something went wrong.</span>'; } };
    const ni=host.querySelector('.gb-notein');
    ni.onkeydown=e=>{ e.stopPropagation(); if(e.key==='Enter') send.click(); };
    ni.focus();
  });
  document.querySelectorAll('.gb-applied').forEach(sp=>{ let armed=false; sp.onclick=async()=>{
    if(!armed){ armed=true; sp.textContent='withdraw application?'; setTimeout(()=>{armed=false; sp.textContent='applied \u00b7 pending \u2713';},2600); return; }
    try{ await sb.rpc('withdraw_application',{p_team:sp.dataset.team});
      if(DATA) delete DATA.myApps[sp.dataset.team]; renderAll(); }catch(e){} }; });
  const cr=document.getElementById('gbCreate');
  if(cr) cr.onclick=async()=>{
    const n=(document.getElementById('gbName').value||'').trim();
    if(n.length<3){ say('gbMsg','give the desk a real name (3+ characters).',1); return; }
    if(window.hkNameOk && !window.hkNameOk(n)){ say('gbMsg','that name won\u2019t fly \u2014 pick something you\u2019d put on a resume.',1); return; }
    try{ const {error}=await sb.rpc('create_desk',{p_name:n, p_private:false});
      if(error){ say('gbMsg',deskErrMsg(error),1); return; } load(); }catch(e){ say('gbMsg','something went wrong.',1); } };
  const jn=document.getElementById('gbJoin');
  if(jn) jn.onclick=async()=>{
    const c=(document.getElementById('gbCode').value||'').trim();
    if(!c){ say('gbMsg','paste the invite code from your staffer.',1); return; }
    try{ const {error}=await sb.rpc('join_desk',{p_code:c});
      if(error){ say('gbMsg',deskErrMsg(error),1); return; } load(); }catch(e){ say('gbMsg','something went wrong.',1); } };
  ['gbName','gbCode'].forEach(id=>{ const el=document.getElementById(id); if(el) el.onkeydown=e=>e.stopPropagation(); });
}

/* r269: DESK STANDINGS — desk-vs-desk, the twin of the school panel. Always ranks the
   whole field (gUserStat); every row deep-links into that desk's hall. */
function deskStandingsHtml(){
  if(!DATA) return '';
  const teams=window.__deskTeams||[], members=window.__deskMembers||[];
  if(!teams.length) return '';
  const stat=DATA.gUserStat||DATA.userStat, names=DATA.names;
  const memBy={}; members.forEach(m=>{ (memBy[m.team_id]=memBy[m.team_id]||[]).push(m.user_id); });
  const rows=teams.map(t=>{
    const ids=memBy[t.id]||[]; if(!ids.length) return null;
    let crowns=0,pod=0,boards=0,competing=0,best=null,bestU=null;
    let rsum=0;
    ids.forEach(id=>{ const st=stat[id]; if(!(st&&st.att)) return;
      competing++; rsum+=st.avg; crowns+=st.crowns; pod+=st.pod; boards+=st.att;
      if(best===null||st.avg<best){ best=st.avg; bestU=id; } });
    return {id:t.id,name:t.name,slug:t.slug,verified:!!t.verified,n:ids.length,competing,crowns,pod,boards,best,bestU,
      grade:deskGrade(competing?rsum/competing:null, competing)};
  }).filter(Boolean);
  if(!rows.length) return '';
  rows.sort((a,b)=> b.crowns-a.crowns || b.pod-a.pod || b.competing-a.competing || b.n-a.n
    || ((a.best==null?9:a.best)-(b.best==null?9:b.best)) || a.name.localeCompare(b.name));
  const mineId=DATA.myDesk&&DATA.myDesk.id;
  // r376: my desk at the top grade → the Bulge Bracket latch
  { const mine=rows.find(e=>e.id===mineId); if(mine) latchDeskPeak(mine.grade); }
  const body=rows.slice(0,12).map((e,i)=>{
    const champ=e.bestU?('top analyst '+esc(names[e.bestU])):(e.competing?'':'no ranked runs yet');
    return '<a class="st-row'+(mineId===e.id?' mine':'')+'" href="desks.html?desk='+encodeURIComponent(e.slug)+'">'+
      '<span class="st-rk'+(i<3?(' m'+(i+1)):'')+'">'+(i+1)+'</span>'+
      '<span class="dk-mini" style="color:hsl('+deskHue(e.slug)+' 45% 55%)">\u25c6</span>'+
      '<span class="st-body"><span class="st-name">'+esc(e.name)+(e.verified?' <span style="color:var(--accent)">\u2713</span>':'')+' '+deskGradeChip(e.grade)+'</span>'+
        (champ?'<span class="st-champ">'+champ+'</span>':'')+'</span>'+
      '<span class="st-stats">'+
        (e.crowns?'<span class="crown"><b>'+e.crowns+'</b> \u265b</span>':'')+
        '<span class="analysts"><b>'+e.n+'</b> '+(e.n===1?'analyst':'analysts')+'</span>'+
        '<span class="boards"><b>'+e.boards+'</b> boards</span>'+
      '</span></a>';
  }).join('');
  return '<div class="panel standings" style="margin-top:0"><h4>\u25c6 Desk Standings</h4><div class="st-list">'+body+'</div>'+
    '<div style="font-family:var(--mono);font-size:10px;color:var(--faint);margin-top:8px">desks ranked by crowns (board #1s), then depth \u00b7 click a desk for its hall \u00b7 <a href="account.html#desk" style="color:var(--accent)">start or join a desk</a></div></div>';
}
/* r270: STAFFER CONTROLS — the manager's standalone screen (desks.html?manage=1).
   Everything the captain runs lives here: invite link, application inbox, weekly
   quests + program templates, roster with removals, the exit. account.html keeps
   only create/join and a pointer over. */
async function renderManage(root){
  let d=null;
  try{ const {data}=await sb.rpc('my_desk'); d=(data&&data[0])||null; }catch(e){}
  if(!d){ root.innerHTML='<div class="standing cta" style="grid-column:1/-1">You’re not on a desk — <a href="desks.html">find one on the guild board</a>.</div>'; return; }
  if(d.role!=='captain'){ root.innerHTML='<div class="standing cta" style="grid-column:1/-1">Only the staffer sees the controls — <a href="desks.html">back to your desk’s hall</a>.</div>'; return; }
  const say=(id,t,bad)=>{ const el=document.getElementById(id); if(el){ el.textContent=t; el.style.color=bad?'var(--warn)':'var(--accent)'; } };
  const lab={}; CH.forEach(c=>lab[c.key]=c.label||c.key);
  root.innerHTML=
    '<div style="grid-column:1/-1;font-family:var(--mono);font-size:12px;color:var(--muted);margin:-6px 0 4px">⚙ staffer controls for <b>'+esc(d.name)+'</b> · '+d.members+' analyst'+(d.members==1?'':'s')+' · <a href="desks.html" style="color:var(--accent)">← the hall</a></div>'+
    '<div class="panel"><h4>invite link</h4><div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-bottom:9px">the fast lane — anyone with the link joins instantly</div><div id="mgInvite"></div></div>'+
    '<div class="panel"><h4>applications · the inbox</h4>'+
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:9px;font-family:var(--mono);font-size:11px;color:var(--muted)">recruiting <button class="tab'+(DATA.viewDesk&&DATA.viewDesk.recr?' on':'')+'" id="mgRecr" style="font-size:10.5px;padding:4px 12px">'+(DATA.viewDesk&&DATA.viewDesk.recr?'open to applicants':'roster closed')+'</button><span class="gb-msg" id="mgRecrMsg"></span></div>'+
    '<div id="mgApps"><div class="loading" style="padding:8px">checking…</div></div></div>'+
    '<div class="panel" style="grid-column:1/-1"><h4>PRO for the desk</h4><div id="mgPro"><div class="loading" style="padding:8px">checking…</div></div></div>'+
    '<div class="panel" style="grid-column:1/-1"><h4>this week’s quests · up to 3</h4><div id="mgAsg"></div></div>'+
    '<div class="panel" style="grid-column:1/-1"><h4>the roster</h4><div id="mgRoster"></div></div>'+
    '<div class="panel" style="grid-column:1/-1"><h4>the exit</h4><div style="font-family:var(--mono);font-size:12px;color:var(--muted);margin-bottom:8px">Leaving hands the desk to the longest-tenured analyst; if you’re the last one out, the desk dissolves.</div><button class="tab" id="mgLeave">leave the desk</button><span class="gb-msg" id="mgLeaveMsg" style="margin-left:10px"></span></div>';
  // ---- invite ----
  function renderInvite(code){
    const inv=document.getElementById('mgInvite'); if(!inv) return;
    inv.innerHTML = code
      ? '<div style="display:flex;gap:9px;align-items:center;flex-wrap:wrap;font-family:var(--mono);font-size:12px"><code id="mgLink" style="background:var(--surface2);border:1px solid var(--line);border-radius:7px;padding:5px 9px">https://www.hotkey.gg/?desk='+esc(code)+'</code><button class="tab" id="mgCopy">copy</button><button class="tab" id="mgRotate" title="new code — old invite links stop working">rotate</button></div><div class="gb-msg" id="mgInvMsg" style="margin-top:6px"></div>'
      : '<div style="font-family:var(--mono);font-size:12px;color:var(--muted)">no code available</div>';
    const cp=document.getElementById('mgCopy');
    if(cp) cp.onclick=async()=>{ try{ await navigator.clipboard.writeText(document.getElementById('mgLink').textContent);
      say('mgInvMsg','link copied — drop it in the group chat.'); }catch(e){ say('mgInvMsg','copy failed — select the link and copy it.',1); } };
    let armed=false; const rt=document.getElementById('mgRotate');
    if(rt) rt.onclick=async()=>{
      if(!armed){ armed=true; rt.textContent='rotate — old links die'; setTimeout(()=>{armed=false; rt.textContent='rotate';},2600); return; }
      try{ const {data,error}=await sb.rpc('rotate_invite');
        if(error){ say('mgInvMsg',deskErrMsg(error),1); return; }
        renderInvite(data||''); say('mgInvMsg','new code minted — the old invite links are dead.');
      }catch(e){ say('mgInvMsg','something went wrong.',1); } };
  }
  // ---- PRO for the desk (r287) — request flow; admin approves as comp or paid ----
  async function renderPro(){
    const host=document.getElementById('mgPro'); if(!host) return;
    let g=null;
    try{ const {data}=await sb.rpc('my_desk_pro'); g=(data&&data[0])||null; }catch(e){}
    const st=g&&g.status;
    if(st==='active'){
      const exp=g.expires_at?new Date(g.expires_at):null;
      const dl=exp?Math.max(0,Math.ceil((exp-Date.now())/86400000)):null;
      const wl=g.waitlisted||0;
      let seatLine='';
      if(g.kind==='paid' && g.seats!=null){
        seatLine='<div style="font-family:var(--mono);font-size:11.5px;color:'+(wl>0?'var(--warn)':'var(--muted)')+';margin-top:5px">'+
          (g.seated||0)+' / '+g.seats+' seats in use'+
          (wl>0?' · '+wl+' analyst'+(wl===1?'':'s')+' waitlisted — earliest to join hold the seats. <a href="mailto:hello@hotkey.gg?subject=More%20PRO%20seats%20for%20our%20desk" style="color:var(--accent)">add seats</a>':'')+
          '</div>';
      }
      host.innerHTML='<div style="font-family:var(--mono);font-size:12.5px;color:var(--accent)">✓ PRO is live'+
        (g.kind==='comp'?' for the whole desk — free club access':' for the desk')+
        (dl!=null?' · '+dl+' day'+(dl===1?'':'s')+' left':' · no expiry')+'</div>'+seatLine;
      return;
    }
    if(st==='pending'){
      host.innerHTML='<div style="font-family:var(--mono);font-size:12.5px;color:var(--warn)">⏳ request received — we’ll review and get back to you. Beta desks are approved fast.</div>';
      return;
    }
    const denied = st==='denied' ? '<div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-bottom:8px">a previous request wasn’t approved — reach out at hello@hotkey.gg if that’s a surprise.</div>' : '';
    host.innerHTML=denied+
      '<div style="display:flex;gap:9px;align-items:center;flex-wrap:wrap">'+
      '<button class="tab on" id="mgProReq">request PRO for the desk →</button>'+
      '<a class="tab" href="enterprise.html" style="text-decoration:none">see desk pricing</a>'+
      '</div><div class="gb-msg" id="mgProMsg" style="margin-top:7px"></div>';
    const b=document.getElementById('mgProReq');
    if(b) b.onclick=async()=>{ b.disabled=true; b.textContent='sending…';
      try{ const {data,error}=await sb.rpc('request_desk_pro',{p_note:'',p_seats:d.members});
        if(error){ say('mgProMsg',deskErrMsg(error),1); b.disabled=false; b.textContent='request PRO for the desk →'; return; }
        try{ ev('desk_pro_request',{}); }catch(e){}
        renderPro();
      }catch(e){ say('mgProMsg','something went wrong — try again.',1); b.disabled=false; b.textContent='request PRO for the desk →'; } };
  }
  // ---- applications inbox ----
  async function renderApps(){
    const host=document.getElementById('mgApps'); if(!host) return;
    let rows=null;
    try{ const {data,error}=await sb.rpc('desk_applications'); if(error) throw error; rows=data||[]; }
    catch(e){ host.innerHTML='<div style="font-family:var(--mono);font-size:11.5px;color:var(--muted);line-height:1.7">applications aren’t enabled on the server yet — the invite link still works.</div>'; return; }
    if(!rows.length){ host.innerHTML='<div style="font-family:var(--mono);font-size:12px;color:var(--muted)">no applications waiting — the guild board sends them here.</div>'; return; }
    const days=x=>Math.max(0,Math.floor((Date.now()-new Date(x))/86400000));
    host.innerHTML=rows.map(r=>'<div class="mg-app"><span class="mg-app-nm" data-uid="'+r.user_id+'">'+esc(r.handle||('analyst-'+String(r.user_id).slice(0,4)))+'</span>'+
      (r.note?'<span class="mg-app-note">“'+esc(r.note)+'”</span>':'')+
      '<span class="mg-app-age">'+(days(r.created_at)===0?'today':days(r.created_at)+'d ago')+'</span>'+
      '<span class="mg-app-act"><button class="tab on mg-ok" data-u="'+r.user_id+'">accept</button><button class="tab mg-no" data-u="'+r.user_id+'">pass</button></span></div>').join('')+
      '<div class="gb-msg" id="mgAppMsg"></div>';
    host.querySelectorAll('.mg-ok,.mg-no').forEach(b=>b.onclick=async()=>{ b.disabled=true;
      try{ const {error}=await sb.rpc('decide_application',{p_user:b.dataset.u, p_accept:b.classList.contains('mg-ok')});
        if(error){ say('mgAppMsg',deskErrMsg(error),1); b.disabled=false; return; }
        renderApps(); }catch(e){ say('mgAppMsg','something went wrong.',1); b.disabled=false; } });
  }
  // ---- quests + program templates (ported from account.html r130/r149) ----
  const MG_PROGRAMS={
    intern0:{name:'Intern week 0', pitch:'zero to desk-ready — movement, formatting, first formulas, find-and-fix', weeks:[
      {note:'get moving, no mouse',        keys:['navigation','copyover','undo']},
      {note:'desk-standard formatting',    keys:['housestyle','dress','decimals']},
      {note:'first formulas',              keys:['margin','growth','foot']},
      {note:'find it and fix it',          keys:['modeltour','audit','triage']}]},
    bootcamp:{name:'First-year bootcamp', pitch:'the modeling core — clean-up, functions, schedules, statements', weeks:[
      {note:'clean-up week',               keys:['housestyle','editfix','pastes']},
      {note:'function week',               keys:['percent','sumif','lookup']},
      {note:'schedule week',               keys:['schedule','debtsched','nwcsched']},
      {note:'statement week',              keys:['cfslink','bsbuild','threestmt']}]},
    speed:{name:'Speed weeks', pitch:'PB-chase under par-based bars, basics to models', mult:1.5, weeks:[
      {note:'speed: the basics',           keys:['navigation','decimals','margin']},
      {note:'speed: the sheet',            keys:['foot','percent','series']},
      {note:'speed: data + lookups',       keys:['sort','lookup','sumif']},
      {note:'speed: the models',           keys:['dcf','waterfall','lbo']}]}
  };
  let mgProgArmed=false;
  async function renderQuests(){
    const host=document.getElementById('mgAsg'); if(!host) return;
    let rows=[];
    try{ const {data}=await sb.from('team_assignments').select('challenge,target_ms,note,created_at,expires_at')
      .eq('team_id', d.team_id).gt('expires_at', new Date().toISOString()).order('created_at'); rows=data||[]; }catch(e){}
    const days=x=>Math.max(1,Math.ceil((new Date(x)-Date.now())/86400000));
    let h= rows.length? rows.map(r=>'<div class="mg-q"><span><b>'+esc(lab[r.challenge]||r.challenge)+'</b>'+(r.target_ms?' · under '+(r.target_ms/1000)+'s':'')+(r.note?' · <span style="color:var(--muted)">'+esc(r.note)+'</span>':'')+' <span style="color:var(--faint)">· '+days(r.expires_at)+'d left</span></span><button class="tab mg-qdel" data-k="'+esc(r.challenge)+'">clear</button></div>').join('')
      : '<div style="font-family:var(--mono);font-size:12px;color:var(--muted);margin-bottom:4px">nothing pinned this week.</div>';
    const opts=CH.map(c=>'<option value="'+c.key+'">'+esc(c.label)+'</option>').join('');
    h+='<div class="mg-pin"><input id="mgQKey" list="mgQList" placeholder="drill — type to search"><datalist id="mgQList">'+opts+'</datalist>'+
      '<input id="mgQTgt" type="number" min="1" max="3600" step="1" placeholder="target s (optional)">'+
      '<input id="mgQNote" maxlength="120" placeholder="note for the desk (optional)">'+
      '<button class="tab on" id="mgQAdd">pin it</button></div><div class="gb-msg" id="mgQMsg"></div>'+
      '<div style="font-family:var(--mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-top:14px">program templates — a 4-week quest sequence, pinned one click a week</div><div id="mgProg"></div>';
    host.innerHTML=h;
    host.querySelectorAll('input').forEach(el=>el.onkeydown=e=>e.stopPropagation());
    host.querySelectorAll('.mg-qdel').forEach(b=>b.onclick=async()=>{ try{
      const {error}=await sb.rpc('clear_assignment',{p_challenge:b.dataset.k});
      if(error){ say('mgQMsg',deskErrMsg(error),1); return; } renderQuests(); }catch(e){ say('mgQMsg','something went wrong.',1); } });
    const add=document.getElementById('mgQAdd');
    if(add) add.onclick=async()=>{
      const k=(document.getElementById('mgQKey').value||'').trim().toLowerCase();
      if(!lab[k]){ say('mgQMsg','pick a real drill from the list.',1); return; }
      const tv=parseFloat(document.getElementById('mgQTgt').value);
      try{ const {error}=await sb.rpc('set_assignment',{p_challenge:k,
          p_target_ms:(isFinite(tv)&&tv>0)?Math.round(tv*1000):null,
          p_note:(document.getElementById('mgQNote').value||'').trim()||null});
        if(error){ say('mgQMsg',deskErrMsg(error),1); return; } renderQuests();
      }catch(e){ say('mgQMsg','something went wrong.',1); } };
    renderProgramsMg(rows);
  }
  function renderProgramsMg(liveRows){
    const w=document.getElementById('mgProg'); if(!w) return;
    const skey='hk_prog_'+d.team_id;
    let st=null; try{ st=JSON.parse(localStorage.getItem(skey)||'null'); }catch(e){}
    if(st && !MG_PROGRAMS[st.tpl]) st=null;
    const save=v=>{ try{ v?localStorage.setItem(skey,JSON.stringify(v)):localStorage.removeItem(skey); }catch(e){} };
    const pinWeek=async(tpl, weekIdx)=>{
      const P=MG_PROGRAMS[tpl], wkDef=P.weeks[weekIdx];
      if(!wkDef) return;
      if(liveRows.length && !mgProgArmed){ mgProgArmed=true;
        say('mgQMsg','this replaces the current pins — click again to confirm.',1);
        setTimeout(()=>{mgProgArmed=false;},3000); return; }
      mgProgArmed=false;
      try{
        for(const r of liveRows){ const {error}=await sb.rpc('clear_assignment',{p_challenge:r.challenge});
          if(error){ say('mgQMsg',deskErrMsg(error),1); return; } }
        const PARS=window.HOTKEY_PARS||{};
        for(const k of wkDef.keys){
          if(!lab[k]) continue;   // catalog drift guard
          const tgt=P.mult&&PARS[k] ? Math.round(PARS[k]*P.mult)*1000 : null;
          const {error}=await sb.rpc('set_assignment',{p_challenge:k, p_target_ms:tgt,
            p_note:P.name+' w'+(weekIdx+1)+': '+wkDef.note});
          if(error){ say('mgQMsg',deskErrMsg(error),1); return; }
        }
        save({tpl:tpl, week:weekIdx+1});   // .week = weeks completed
        if(window.hkEvent) window.hkEvent('program_pin',{tpl:tpl, week:weekIdx+1});
        await renderQuests();   // re-render first — say() after, or the message gets wiped
        say('mgQMsg','week '+(weekIdx+1)+' pinned — '+wkDef.keys.map(k=>lab[k]||k).join(', ')+'.');
      }catch(e){ say('mgQMsg','something went wrong.',1); }
    };
    if(st){
      const P=MG_PROGRAMS[st.tpl], nxt=st.week;   // next week INDEX to pin (0-based = weeks done)
      let h='<div style="font-family:var(--mono);font-size:12px;margin-top:6px"><b>'+esc(P.name)+'</b> — '+
        P.weeks.map((wkDef,i)=>'<span style="color:'+(i<st.week?'var(--accent)':'var(--muted)')+'">w'+(i+1)+(i<st.week?' ✓':'')+'</span>').join(' · ')+'</div>';
      if(nxt<P.weeks.length){
        h+='<div style="font-family:var(--mono);font-size:11.5px;color:var(--muted);margin:4px 0">next — <b>week '+(nxt+1)+': '+esc(P.weeks[nxt].note)+'</b> · '+
          P.weeks[nxt].keys.map(k=>esc(lab[k]||k)).join(', ')+(P.mult?' (targets: par × '+P.mult+')':'')+'</div>'+
          '<div style="display:flex;gap:10px;align-items:center;margin-top:4px">'+
          '<button class="tab mg-prog-pin" data-w="'+nxt+'">pin week '+(nxt+1)+'</button>'+
          '<a class="mg-prog-drop" style="cursor:pointer;font-family:var(--mono);font-size:11px;color:var(--faint)">abandon program</a></div>';
      } else {
        h+='<div style="font-family:var(--mono);font-size:11.5px;color:var(--accent);margin:4px 0">program complete — all 4 weeks pinned. Run it back or pick another.</div>'+
          '<a class="mg-prog-drop" style="cursor:pointer;font-family:var(--mono);font-size:11px;color:var(--faint)">clear program</a>';
      }
      w.innerHTML=h;
      w.querySelectorAll('.mg-prog-pin').forEach(b=>b.onclick=()=>pinWeek(st.tpl, parseInt(b.dataset.w,10)));
      const dr=w.querySelector('.mg-prog-drop'); if(dr) dr.onclick=()=>{ save(null); renderProgramsMg(liveRows); };
    } else {
      w.innerHTML=Object.entries(MG_PROGRAMS).map(([id,P])=>
        '<div style="display:flex;gap:10px;align-items:baseline;margin-top:6px;font-family:var(--mono);font-size:12px">'+
        '<button class="tab mg-prog-start" data-t="'+id+'" style="white-space:nowrap">'+esc(P.name)+'</button>'+
        '<span style="font-size:11px;color:var(--muted)">'+esc(P.pitch)+'</span></div>').join('');
      w.querySelectorAll('.mg-prog-start').forEach(b=>b.onclick=()=>{ save({tpl:b.dataset.t, week:0}); renderProgramsMg(liveRows); });
    }
  }
  // ---- roster with removals (RLS lets the captain delete membership rows) ----
  function renderRoster(){
    const host=document.getElementById('mgRoster'); if(!host||!DATA) return;
    const ids=(window.__deskMembers||[]).filter(m=>m.team_id===d.team_id).map(m=>m.user_id);
    const stat=DATA.gUserStat||DATA.userStat; const WEEK=7*86400000, now2=Date.now();
    const rows=ids.map(id=>{ const st=stat[id]||{att:0,crowns:0};
      const wk=DATA.runs.filter(r=>r.user_id===id && new Date(r.created_at||0).getTime()>now2-WEEK).length;
      const t=st.att?tierOf(st.avg,st.att,st.wsum):window.HK_RANK.tierOf(null,0);
      return {id:id, nm:DATA.names[id], t:t, att:st.att||0, crowns:st.crowns||0, wk:wk}; })
      .sort((a,b)=> (b.id===DATA.meId?1:0)-(a.id===DATA.meId?1:0) || b.wk-a.wk || b.att-a.att);
    host.innerHTML='<div class="dk-roster" style="padding:0">'+
      '<div class="dk-r hd"><span>analyst</span><span>rank</span><span>boards</span><span>crowns</span><span>this wk</span><span></span></div>'+
      rows.map(m=>'<div class="dk-r'+(m.wk===0?' idle':'')+'">'+
        '<span class="nm" data-uid="'+m.id+'">'+esc(m.nm)+(m.id===DATA.meId?' <b class="you">(you · staffer)</b>':'')+'</span>'+
        '<span class="tr">'+(window.rankEmblem?window.rankEmblem(m.t.name,16,m.t.bucket):'')+' '+esc(m.t.name)+'</span>'+
        '<span>'+m.att+'</span><span>'+(m.crowns||'·')+'</span><span class="wk">'+m.wk+'</span>'+
        '<span>'+(m.id===DATA.meId?'':'<button class="tab mg-kick" data-u="'+m.id+'" data-n="'+esc(m.nm)+'">remove</button>')+'</span></div>').join('')+
      '</div><div class="gb-msg" id="mgRosMsg" style="margin-top:6px"></div>';
    host.querySelectorAll('.mg-kick').forEach(b=>{ let armed=false; b.onclick=async()=>{
      if(!armed){ armed=true; b.textContent='remove '+b.dataset.n+'?'; setTimeout(()=>{armed=false; b.textContent='remove';},2800); return; }
      try{ const {error}=await sb.from('team_members').delete().eq('team_id',d.team_id).eq('user_id',b.dataset.u);
        if(error){ say('mgRosMsg',deskErrMsg(error),1); return; }
        window.__deskMembers=(window.__deskMembers||[]).filter(m=>!(m.team_id===d.team_id&&m.user_id===b.dataset.u));
        say('mgRosMsg','removed — they can re-apply or re-join with a code.'); renderRoster();
      }catch(e){ say('mgRosMsg','something went wrong.',1); } }; });
  }
  renderInvite(d.invite_code||'');
  renderApps(); renderPro(); renderQuests(); renderRoster();
  { const rb=document.getElementById('mgRecr');
    if(rb) rb.onclick=async()=>{ rb.disabled=true;
      const next=!(DATA.viewDesk&&DATA.viewDesk.recr);
      try{ const {error}=await sb.rpc('set_desk_recruiting',{p_on:next});
        if(error){ const el=document.getElementById('mgRecrMsg'); if(el){ el.textContent=deskErrMsg(error); el.style.color='var(--warn)'; } rb.disabled=false; return; }
        if(DATA.viewDesk) DATA.viewDesk.recr=next;
        rb.classList.toggle('on', next); rb.textContent=next?'open to applicants':'roster closed'; rb.disabled=false;
      }catch(e){ rb.disabled=false; } }; }
  let lArmed=false; const lv=document.getElementById('mgLeave');
  if(lv) lv.onclick=async()=>{
    if(!lArmed){ lArmed=true; lv.textContent='click again to confirm'; setTimeout(()=>{lArmed=false; lv.textContent='leave the desk';},2600); return; }
    try{ const {error}=await sb.rpc('leave_desk'); if(error){ say('mgLeaveMsg',deskErrMsg(error),1); return; }
      location.href='desks.html'; }catch(e){ say('mgLeaveMsg','something went wrong.',1); } };
}

function browserHtml(){
  const {perDrill,meId,myTeam,teamOnly}=DATA;
  /* r293 (Wolf): marathon retired site-wide — session boards are rapid-fire only */
  const tabs=[['drills','\u2328 drills'],['rapidfire','\u26a1 rapid-fire']];
  let html='<div class="tabrow">'+tabs.map(t=>'<span class="tab'+(browseTab===t[0]?' on':'')+'" data-tab="'+t[0]+'">'+t[1]+'</span>').join('');
  if(myTeam && !DATA.viewDesk) html+='<span class="tab'+(teamOnly?' on':'')+'" id="teamToggle">'+(teamOnly?'\u25c9 desk: '+esc(myTeam):'\u25cb show desk only')+'</span>';
  html+='</div>';
  if(browseTab==='drills'){
    if(!browseKey || !perDrill[browseKey]) browseKey = (meId && CH.find(c=>perDrill[c.key].some(r=>r.user_id===meId)) || CH[0]).key;
    /* r268: MASTER-DETAIL — a chapter-grouped drill list beside the selected board.
       The old loose chip cloud pushed the actual time board below the fold with no
       visible connection between the picker and the numbers. */
    let lastG=null, listRows='';
    CH.forEach(c=>{ const mine=meId&&perDrill[c.key].some(r=>r.user_id===meId);
      if(c.lvl!==lastG){ lastG=c.lvl; listRows+='<div class="bl-g">'+esc(c.lvl)+'</div>'; }
      listRows+='<span class="chip bl-row'+(browseKey===c.key?' on':'')+(mine?' mine':'')+'" data-key="'+c.key+'">'+
        '<span class="bl-nm">'+esc(c.label)+'</span>'+(mine?'<b class="bl-me" title="you have a time here">\u2713</b>':'')+'</span>'; });
    const c=CH.find(x=>x.key===browseKey);
    // r335: tier scope — map every user on the board to their tier once, filter, re-rank
    const tierNames=(window.HK_RANK?window.HK_RANK.TIERS.map(t=>t.name):[]);
    let rows=perDrill[browseKey], fnote='';
    /* r366 (Wolf: 'we didn't have sub menu buttons to filter ranks by bucket'): the chips
       existed but hid until a tier was picked — invisible IS missing. They're always on now:
       tier picked → thirds WITHIN that tier (r335 behavior); 'all tiers' → thirds of the
       whole ranked field by average percentile. */
    if(tierFilter!=='all' || bucketFilter!=='all'){
      const stat=DATA.gUserStat||DATA.userStat;
      const tof={}; Object.entries(stat).forEach(([u,st])=>{ const av=st.att?st.avg:null;
        if(av!==null) tof[u]=TIER_OF(av, st.att, st.wsum); });
      const fieldBucket=u=>{ const st=stat[u]; if(!st||!st.att) return null;
        return st.avg<=1/3 ? 'Top' : (st.avg<=2/3 ? 'Middle' : 'Bottom'); };
      rows=rows.filter(r=>{
        const t=tof[r.user_id];
        if(tierFilter!=='all'){ if(!t || t.name!==tierFilter) return false;
          if(bucketFilter!=='all' && (t.bucket||'')!==bucketFilter+' Bucket') return false; }
        else if(bucketFilter!=='all'){ if(fieldBucket(r.user_id)!==bucketFilter) return false; }
        return true; });
      fnote='<div class="tf-note">'+rows.length+' of '+perDrill[browseKey].length+' on this board '+
        (rows.length===1?'holds':'hold')+' '+
        (tierFilter!=='all' ? esc(tierFilter)+(bucketFilter!=='all'?' \u00b7 '+esc(bucketFilter)+' Bucket':'')
                            : 'the field\u2019s '+esc(bucketFilter)+' bucket')+'</div>';
    }
    const tierSel='<div class="tier-filter"><label for="tierSel">tier</label>'+
      '<select id="tierSel">'+['all'].concat(tierNames).map(tn=>'<option value="'+esc(tn)+'"'+(tierFilter===tn?' selected':'')+'>'+(tn==='all'?'all tiers':esc(tn))+'</option>').join('')+'</select>'+
      ['all','Bottom','Middle','Top'].map(b=>'<span class="chip tf-b'+(bucketFilter===b?' on':'')+'" data-bucket="'+b+'" title="'+(tierFilter!=='all'?'thirds within '+esc(tierFilter):'thirds of the whole ranked field')+'">'+(b==='all'?'all buckets':b.toLowerCase())+'</span>').join('')+
      '</div>';
    const detailBoard=(tierFilter!=='all' && !rows.length)
      ? '<div class="board"><div class="board-cap"><h2>'+esc(c.label)+'</h2><span class="lvl">'+esc(c.lvl)+'</span></div><div class="empty" style="padding:14px 18px">nobody holding '+esc(tierFilter)+' has a time on this board yet \u2014 the lane is open</div></div>'
      : boardHtml(c, rows, DATA.names, meId);
    html+='<div class="browse-wrap">'+
      '<div class="browse-list"><input id="blSearch" placeholder="search drills\u2026" aria-label="search drills">'+listRows+'</div>'+
      '<div class="browse-detail" id="detail">'+tierSel+fnote+detailBoard+'</div>'+
    '</div>';
  } else {
    const durs = RAPID_DURS;
    if(!browseKey || !durs.some(d=>String(d.sec)===String(browseKey))) browseKey=String(durs[0].sec);
    html+='<div class="chips">'+durs.map(d=>'<span class="chip'+(String(browseKey)===String(d.sec)?' on':'')+'" data-key="'+d.sec+'">'+esc(d.label)+'</span>').join('')+'</div>';
    const best=bestPerUser(DATA.fSessions, browseTab, +browseKey);
    const fmtFn=rapidScore;
    html+='<div id="detail">'+sessionBoardHtml(durs.find(d=>String(d.sec)===String(browseKey)).label,'best per player', best, DATA.names, DATA.meId, fmtFn)+'</div>';
  }
  return html;
}

function pageView(){
  /* r269 (Wolf): the Schools & Desks view graduated to its own page — desks.html sets
     window.LB_PAGE='teams'; leaderboard.html stays the clean overview. */
  return window.LB_PAGE || 'overview';
}
function subView(){
  try{ return new URLSearchParams(location.search).get('manage') ? 'manage' : null; }catch(e){ return null; }
}
// legacy deep links (leaderboard.html?view=teams / ?desk=slug) land on the new page
try{ const q=new URLSearchParams(location.search);
  if(pageView()==='overview' && (q.get('view')==='teams' || q.get('desk')))
    location.replace('desks.html'+(q.get('desk')?('?desk='+encodeURIComponent(q.get('desk'))):''));
}catch(e){}
function renderAll(){
  const __sy = window.scrollY;   // r293 (Wolf): tab/chip clicks re-render the page — hold the scroll so it doesn't jump

  const root=document.getElementById('boards');
  const h1=document.querySelector('h1');
  if(pageView()==='teams'){
    /* r269: the standalone Desks & Schools page — your desk's hall on top (injected as
       #deskBanner above this root), then field-wide standings, then desk-only boards. */
    /* r270: ?manage=1 is the staffer's screen; deskless players get the guild board */
    if(subView()==='manage'){
      if(h1) h1.textContent='Staffer controls';
      root.innerHTML='<div class="loading">opening the manager\u2026</div>';
      renderManage(root);
      return;
    }
    if(h1 && DATA.viewDesk) h1.textContent='\u25c6 '+DATA.viewDesk.name;
    root.innerHTML =
      (!DATA.viewDesk && !DATA.myDesk ? guildHtml() : '')+
      '<h3 class="section-title">Standings \u00b7 the cohorts</h3>'+
      '<div class="featured" style="grid-column:1/-1;align-items:start;margin-bottom:0">'+deskStandingsHtml()+schoolStandingsHtml()+'</div>'+
      '<div style="grid-column:1/-1;min-width:0">'+rosterHtml()+'</div>'+
      (DATA.viewDesk ? ('<h3 class="section-title">This desk\u2019s boards \u2014 members only</h3><div class="browse" style="grid-column:1/-1">'+browserHtml()+'</div>') : '');
  } else {
    if(h1) h1.textContent='Leaderboard';
    /* r369 (Wolf): tighter dashboard — the tier roster rides beside the weekly gauntlet
       inside .featured instead of spreading as its own full-width strip */
    root.innerHTML =
      '<div class="hero two">'+heroHtml()+topPlayersHtml()+'</div>'+
      featuredHtml()+
      '<h3 class="section-title">Browse the boards'+
        '<a href="desks.html" style="float:right;font-size:11px;color:var(--accent);text-decoration:none">\ud83c\udf93 schools & desks \u2192</a></h3>'+
      '<div class="browse" style="grid-column:1/-1">'+browserHtml()+'</div>';
  }
  wire(); wireGuild();
  document.querySelectorAll('.ros-t').forEach(b=>b.onclick=()=>{ rosterTier=b.dataset.tier; renderAll(); });
  const er=document.getElementById('enterRanked'); if(er) er.onclick=rankedInfographic;
  const wr=document.getElementById('waitRanked'); if(wr) wr.onclick=()=>{};
  const lr=document.getElementById('leaveRanked'); if(lr) lr.onclick=()=>{ try{ localStorage.setItem('hk_ranked','0'); }catch(e){} try{ window.hkStatePush&&window.hkStatePush(); }catch(e){} load(); };
  try{ window.scrollTo(0, __sy); }catch(e){}
}
function wire(){
  const bs=document.getElementById('blSearch');
  if(bs){ bs.oninput=()=>{ const q=bs.value.trim().toLowerCase();
    document.querySelectorAll('.browse-list .bl-row').forEach(r=>{
      r.style.display = (!q || r.textContent.toLowerCase().includes(q)) ? '' : 'none'; });
    document.querySelectorAll('.browse-list .bl-g').forEach(g=>{ g.style.display = q ? 'none' : ''; }); };
    bs.onkeydown=e=>e.stopPropagation(); }
  document.querySelectorAll('.tab[data-tab]').forEach(t=>t.onclick=()=>{
    browseTab=t.dataset.tab; browseKey=null;
    sessionStorage.setItem('hk_lb_tab',browseTab); sessionStorage.removeItem('hk_lb_key');
    renderAll(); });
  document.querySelectorAll('.chip[data-key]').forEach(c=>c.onclick=()=>{
    browseKey=c.dataset.key; sessionStorage.setItem('hk_lb_key',browseKey); renderAll(); });
  const ts=document.getElementById('tierSel');
  if(ts){ ts.onchange=()=>{ tierFilter=ts.value; bucketFilter='all';
    sessionStorage.setItem('hk_lb_tier',tierFilter); sessionStorage.setItem('hk_lb_bucket','all'); renderAll(); }; }
  document.querySelectorAll('.chip[data-bucket]').forEach(b=>b.onclick=()=>{
    bucketFilter=b.dataset.bucket; sessionStorage.setItem('hk_lb_bucket',bucketFilter); renderAll(); });
  const tt=document.getElementById('teamToggle');
  if(tt) tt.onclick=()=>{ sessionStorage.setItem('hk_teamview', DATA.teamOnly?'0':'1'); load();
 };
}
load();
