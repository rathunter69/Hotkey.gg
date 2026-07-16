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

function rowHtml(r,i,names,meId,extra,leaderMs){
  const me = meId && r.user_id===meId;
  const medal = i<3 ? ' r'+(i+1) : '';
  // the chase: show your gap to the leader right on your row — the number to beat
  const gap = (me && i>0 && leaderMs) ? `<span class="gap">+${((r.time_ms-leaderMs)/1000).toFixed(2)}</span>` : '';
  return `<div class="row${i===0?' top':''}${me?' me':''}${extra?' you-extra':''}">`+
    `<span class="rk${medal}">${i+1}</span>`+
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
function boardHtml(c, best, names, meId){
  let body;
  if(!best.length){
    body='<div class="empty" style="padding:14px 18px 6px">open board \u2014 <b>first run sets the bar</b></div>';
    for(let k=0;k<5;k++) body+='<div class="row open"><span class="rk">\u00b7</span><span class="nm">open lane</span><span class="tm">\u2014</span></div>';
  }
  else {
    const leaderMs = best[0].time_ms;
    body = best.slice(0,10).map((r,i)=>rowHtml(r,i,names,meId,false,leaderMs)).join('');
    for(let k=best.length;k<5;k++) body+='<div class="row open"><span class="rk">\u00b7</span><span class="nm">open lane</span><span class="tm">\u2014</span></div>';
    const myIdx = meId ? best.findIndex(r=>r.user_id===meId) : -1;
    if(myIdx>=10){ body += '<div class="you-gap">···</div>' + rowHtml(best[myIdx], myIdx, names, meId, true, leaderMs); }
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
const MARATHON_DURS = [{sec:180, label:'3-minute marathon'}, {sec:300, label:'5-minute marathon'}, {sec:600, label:'10-minute marathon'}];  // must match the trainer's duration configs
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
  for(let i=TIERS.length-1;i>=0;i--){ if(att>=TIERS[i].att && avgPct<=TIERS[i].pct) return {...TIERS[i], i}; }
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
    try{ const { data:{ session } } = await sb.auth.getSession(); meId = session ? session.user.id : null; }catch(e){}
    const [p, r, se, tm, tt] = await Promise.all([
      sb.from('profiles').select('id,handle,team_code,school_tag,show_school,featured_ach'),
      sb.from('runs').select('user_id,challenge,time_ms,created_at').eq('mouse_used',false).order('time_ms',{ascending:true}),
      sb.from('sessions').select('user_id,mode,duration_sec,score,keystrokes,misses,optimal,created_at'),
      sb.from('team_members').select('team_id,user_id,role'),
      sb.from('teams').select('id,name,slug,verified'),   // EXPLICIT columns — invite_code is grant-revoked (r110); select * would 403
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
    if(t) viewDesk={id:t.id, name:t.name, slug:t.slug, verified:!!t.verified, ids:new Set(memByTeam[t.id]||[])}; }
  if(meId){
    const mine=members.find(m=>m.user_id===meId);
    const mineTeam=mine && teams.find(t=>t.id===mine.team_id);
    if(mineTeam){ myDesk=mineTeam; myTeam=mineTeam.name; teamIds=new Set(memByTeam[mineTeam.id]||[]); }
    else{ const me=profs.find(p=>p.id===meId);
      if(me && me.team_code){ myTeam=me.team_code;
        teamIds=new Set(profs.filter(p=>p.team_code===me.team_code).map(p=>p.id)); } } }
  // r269: on desks.html, members land scoped to their OWN desk — no slug link needed
  if(pageView()==='teams' && !viewDesk && myDesk && teamIds)
    viewDesk={id:myDesk.id, name:myDesk.name, slug:myDesk.slug, verified:!!myDesk.verified, ids:teamIds};
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
  DATA={profs,runs,sessions,fRuns,fSessions,names,meId,teamIds,myTeam,myDesk,viewDesk,teamOnly,perDrill,userStat,gUserStat,mySolves};
  // ================= r136: THE DESK HALL — captain-first team dashboard =================
  // Wolf: "not a re-skinned leaderboard — captains need to see users, evaluate at a
  // glance, chase assignment completion, and justify the investment." Guild-style:
  // ROI band (hours saved, cohort improvement, coverage, momentum) + quest board with
  // per-member ticks + evaluation roster. Everything derives from already-loaded runs.
  setTimeout(async ()=>{ try{
    let b=document.getElementById('deskBanner');
    if(!DATA.viewDesk){ if(b) b.remove(); return; }
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
        (iAmCaptain?'<a class="dk-manage" href="account.html#desk">staffer controls \u2192</a>':'')+
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
        '<div class="dk-empty">'+(iAmCaptain?'no quests pinned \u2014 pin up to 3 drills from your <a href="account.html" style="color:var(--accent)">staffer controls</a> (targets + notes optional)':'no quests pinned this week \u2014 the staffer sets them')+'</div>';
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
    '<div class="pub-hero">'+(window.rankEmblem?window.rankEmblem(t.name,54,t.bucket):'')+
      '<div><div class="pub-nm">'+esc(names[uid])+(uid===meId?' <span class="pub-you">(you)</span>':'')+'</div>'+
      '<div class="pc-tier '+t.cls+'" style="display:inline-flex;align-items:center;margin-top:4px">'+
        (window.rankEmblem?window.rankEmblem(t.name,13,t.bucket):'')+'<span>'+(t.full||t.name)+(t.provisional?' \u00b7 provisional':'')+'</span></div>'+
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
    return '<div class="panel me"><h4>your card</h4>'+
      '<div style="font-family:var(--mono);font-size:13.5px;color:var(--muted);line-height:1.8">Times only count on the boards for signed-in accounts. '+
      '<a href="index.html" style="color:var(--accent)">Sign in and post a time</a> to see your rank, level, and progress toward the next tier.</div></div>';
  }
  const me=userStat[meId]||{att:0,sum:0,crowns:0,pod:0,t10:0};
  // RANKED GATE: level 3 unlocks Ranked; entering it shows the season-start infographic.
  {
    const perD0={}; let xp0=0;
    DATA.fRuns.filter(x=>x.user_id===meId).forEach(r=>{ const ch=r.challenge||'';
      if(ch.indexOf('daily-')===0){ xp0+=30; return; } if(ch.indexOf('wk-')===0){ xp0+=25; return; }
      const nth=(perD0[ch]=(perD0[ch]||0)+1); xp0 += nth===1?(50+(((window.HOTKEY_PARS||{})[ch]||0)>=55?15:0)):(nth<=10?15:3); });
    DATA.fSessions.filter(x=>x.user_id===meId).forEach(x=>{ xp0 += x.mode==='marathon'?20:10; });
    xp0 += 25*me.t10+100*me.pod+250*me.crowns;
    const lvl0=levelOf(xp0).lvl;
    if(!rankedOptedIn()){
      const campDone = campaignComplete();
      const devUnlock=(function(){ try{ return localStorage.getItem('hk_dev_unlock')==='1'; }catch(e){ return false; } })();
      const eligible = lvl0>=RANKED_MIN_LVL || campDone || devUnlock;
      const lvlPct = Math.min(100, Math.round(100*lvl0/RANKED_MIN_LVL));
      return '<div class="panel me"><h4>your card</h4>'+
        '<div style="font-family:var(--mono);font-size:13px;color:var(--muted);line-height:1.8">'+
        (eligible
          ? 'Ranked is unlocked ('+(campDone?'campaign complete':'LVL '+lvl0)+'). Entering shows your placement on every board you\u2019ve run \u2014 nothing is lost by waiting.'
          : 'Ranked unlocks at <b style="color:var(--warn)">LVL '+RANKED_MIN_LVL+'</b> or by completing the campaign. You\u2019re LVL '+lvl0+'.')+
        '</div>'+
        (!eligible?'<div style="margin-top:10px"><div style="font-family:var(--mono);font-size:10px;color:var(--faint);margin-bottom:4px">progress to LVL '+RANKED_MIN_LVL+'</div><div style="height:6px;background:var(--surface2);border-radius:99px;overflow:hidden"><div style="height:100%;width:'+lvlPct+'%;background:var(--accent);border-radius:99px"></div></div></div>':'')+
        (eligible?'<div style="display:flex;gap:10px;margin-top:14px"><button class="tab on" id="enterRanked" style="font-size:13px;padding:10px 22px">\u2694 Enter Ranked</button><button class="tab" id="waitRanked" style="font-size:12px;padding:10px 18px">Not yet</button></div>':'')+
        '</div>';
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
  // NEXT RANK: first tier above the current with concrete unmet requirements
  let nextHtml='';
  const nxt=TIERS[t.i+1];
  if(nxt){
    const attOk=me.att>=nxt.att, pctOk=avg!==null&&avg<=nxt.pct;
    // progress toward the next tier's placement requirement (band position, clamped)
    const hiB=(t.pct>1?1:t.pct), prog = avg===null?0:Math.max(0,Math.min(100,Math.round(100*(hiB-avg)/Math.max(1e-9,hiB-nxt.pct))));
    nextHtml='<div class="yc-next">next rank: <b>'+nxt.name+'</b><br>'+
      '<span class="'+(attOk?'have':'lack')+'">'+(attOk?'\u2713':'\u25cb')+' '+nxt.att+' drills attempted (you: '+me.att+')</span><br>'+
      '<span class="'+(pctOk?'have':'lack')+'">'+(pctOk?'\u2713':'\u25cb')+' top '+Math.round(nxt.pct*100)+'% avg placement (you: '+(avg===null?'\u2014':'top '+Math.max(1,Math.round(avg*100))+'%')+')</span>'+
      '<div style="height:5px;background:var(--surface2);border-radius:99px;overflow:hidden;margin-top:8px"><div style="height:100%;width:'+prog+'%;background:var(--accent);border-radius:99px"></div></div>'+
      '<div style="font-size:9.5px;color:var(--faint);margin-top:3px">placement progress through '+t.name+' \u2014 buckets: bottom \u2192 middle \u2192 top \u2192 promote</div>'+
      '<a id="leaveRanked" style="display:inline-block;margin-top:8px;font-size:10px;color:var(--faint);cursor:pointer;text-decoration:underline dotted">leave ranked</a></div>';
  } else {
    nextHtml='<div class="yc-next"><b>Top of the ladder.</b> Rankings stay live \u2014 keep placing to hold it. <a id="leaveRanked" style="font-size:10px;color:var(--faint);cursor:pointer;text-decoration:underline dotted">leave ranked</a></div>';
  }
  return '<div class="panel me"><h4>your card</h4>'+
    '<div class="yc-top"><span class="pc-tier '+t.cls+'" style="display:inline-flex;align-items:center">'+(window.rankEmblem?window.rankEmblem(t.name,28,t.bucket):'')+'<span>'+(t.full||t.name)+'</span></span>'+
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
  T.forEach(t=>{ rows+='<div style="display:flex;align-items:center;gap:12px;padding:7px 4px;font-family:var(--mono);font-size:12.5px">'+
    '<span class="'+t.cls+'" style="display:inline-flex;color:inherit;">'+(window.rankEmblem?window.rankEmblem(t.name,24):'')+'</span>'+
    '<span>'+t.name+'</span><span style="margin-left:auto;color:var(--faint);font-size:10.5px">'+(t.att?t.att+' drills \u00b7 top '+Math.round(Math.min(1,t.pct)*100)+'%':'start here')+'</span></div>'; });
  m.innerHTML='<div class="panel" style="max-width:460px;width:100%">'+
    '<h4>welcome to ranked</h4>'+
    '<div style="font-family:var(--mono);font-size:12.5px;color:var(--muted);line-height:1.8;margin-bottom:12px">'+
    'Your rank = your <b>average placement</b> across the boards you\u2019ve entered \u2014 stabilized two ways: '+
    'with only a few boards, your rating starts near the middle and your results pull it toward your true level (so two fast drills alone can\u2019t crown you); '+
    'and small fields count for less than big ones (1st of 2 says less than 4th of 40). Until you\u2019ve faced enough real competition, your rank is capped and tagged <b>provisional</b> \u2014 everyone starts low and earns altitude. Breadth + placement is the climb.<br><br>'+
    'Each tier splits into three <b>buckets</b> by where you sit inside that tier\u2019s band: '+
    'you enter at <b>Bottom Bucket</b>, pass through <b>Middle</b>, and reach <b>Top Bucket</b> as your average placement improves \u2014 clear the band and you promote to the next tier.</div>'+rows+
    '<div style="font-family:var(--mono);font-size:11px;color:var(--faint);margin-top:10px">Ranks are live: they can fall as well as rise when other players improve.</div>'+
    '<div style="display:flex;gap:10px;margin-top:16px"><button class="tab on" id="rankedGo" style="flex:1;text-align:center;font-size:13px;padding:11px">Enter Ranked \u2694</button>'+
    '<button class="tab" id="rankedWait" style="padding:11px 18px;font-size:12px">Not yet</button></div></div>';
  document.getElementById('rankedGo').onclick=()=>{ try{ localStorage.setItem('hk_ranked','1'); }catch(e){} m.remove(); load(); };
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
  let rows='';
  ranked.slice(0,8).forEach((x,i)=>{
    const t=tierOf(x.avg,x.att,x.wsum);
    rows+='<div class="tp-row'+(x.u===meId?' me':'')+'"><span class="rk'+(i<3?' r'+(i+1):'')+'">'+(i+1)+'</span>'+
      '<span class="nm" data-uid="'+x.u+'">'+esc(names[x.u])+'</span>'+
      '<span class="tp-emb" title="'+t.name+'">'+(window.rankEmblem?window.rankEmblem(t.name,18,t.bucket):'')+'</span>'+
      '<span class="pct"><b>top '+Math.max(1,Math.round(x.avg*100))+'%</b><i>'+x.att+' drills</i></span></div>';
  });
  const myIdx=meId?ranked.findIndex(x=>x.u===meId):-1;
  if(myIdx>=8){ const x=ranked[myIdx]; const t=tierOf(x.avg,x.att,x.wsum);
    rows+='<div class="you-gap">\u00b7\u00b7\u00b7</div><div class="tp-row me"><span class="rk">'+(myIdx+1)+'</span>'+
      '<span class="nm" data-uid="'+x.u+'">'+esc(names[x.u])+'</span>'+
      '<span class="tp-emb" title="'+t.name+'">'+(window.rankEmblem?window.rankEmblem(t.name,18,t.bucket):'')+'</span>'+
      '<span class="pct"><b>top '+Math.max(1,Math.round(x.avg*100))+'%</b><i>'+x.att+' drills</i></span></div>'; }
  if(!rows) rows='<div class="empty">nobody has placed yet (5+ drills) \u2014 <b>be the first name here</b></div>';
  return '<div class="panel"><h4>top players \u00b7 the field</h4>'+rows+'</div>';
}

function featuredHtml(){
  const {fRuns,names,meId}=DATA;
  // daily
  const dailyDate=new Date().toISOString().slice(0,10);
  let dSeed=0; for(const ch of dailyDate) dSeed=(dSeed*31+ch.charCodeAt(0))>>>0;
  const dk=(window.HOTKEY_DRILLS?window.HOTKEY_DRILLS.menuOrder:[])[dSeed%(window.HOTKEY_DRILLS?window.HOTKEY_DRILLS.menuOrder.length:1)];
  const dl=(window.HOTKEY_DRILLS&&window.HOTKEY_DRILLS.labelOf[dk])||'Daily';
  const seenD={}, bestD=[];
  fRuns.filter(x=>x.challenge==='daily-'+dailyDate).forEach(x=>{ if(!seenD[x.user_id]){ seenD[x.user_id]=true; bestD.push(x); } });
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
  return '<div class="featured">'+
    boardHtml({label:'\u26a1 today \u00b7 '+dl, lvl:dailyDate}, bestD, names, meId)+
    '</div>';
}

/* ---- drill browser: tabs + chips + one detail board ---- */
let browseTab = sessionStorage.getItem('hk_lb_tab') || 'drills';
let browseKey = sessionStorage.getItem('hk_lb_key') || null;
let rosterTier = null;
function rosterHtml(){
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
  return '<div class="panel" style="margin-top:18px"><h4>the field \u00b7 by tier</h4>'+
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
    ids.forEach(id=>{ const st=stat[id]; if(!(st&&st.att)) return;
      competing++; crowns+=st.crowns; pod+=st.pod; boards+=st.att;
      if(best===null||st.avg<best){ best=st.avg; bestU=id; } });
    return {id:t.id,name:t.name,slug:t.slug,verified:!!t.verified,n:ids.length,competing,crowns,pod,boards,best,bestU};
  }).filter(Boolean);
  if(!rows.length) return '';
  rows.sort((a,b)=> b.crowns-a.crowns || b.pod-a.pod || b.competing-a.competing || b.n-a.n
    || ((a.best==null?9:a.best)-(b.best==null?9:b.best)) || a.name.localeCompare(b.name));
  const mineId=DATA.myDesk&&DATA.myDesk.id;
  const body=rows.slice(0,12).map((e,i)=>{
    const champ=e.bestU?('top analyst '+esc(names[e.bestU])):(e.competing?'':'no ranked runs yet');
    return '<a class="st-row'+(mineId===e.id?' mine':'')+'" href="desks.html?desk='+encodeURIComponent(e.slug)+'">'+
      '<span class="st-rk'+(i<3?(' m'+(i+1)):'')+'">'+(i+1)+'</span>'+
      '<span class="dk-mini">\u25c6</span>'+
      '<span class="st-body"><span class="st-name">'+esc(e.name)+(e.verified?' <span style="color:var(--accent)">\u2713</span>':'')+'</span>'+
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
function browserHtml(){
  const {perDrill,meId,myTeam,teamOnly}=DATA;
  const tabs=[['drills','\u2328 drills'],['marathon','\u23f1 marathon'],['rapidfire','\u26a1 rapid-fire']];
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
    html+='<div class="browse-wrap">'+
      '<div class="browse-list"><input id="blSearch" placeholder="search drills\u2026" aria-label="search drills">'+listRows+'</div>'+
      '<div class="browse-detail" id="detail">'+boardHtml(c, perDrill[browseKey], DATA.names, meId)+'</div>'+
    '</div>';
  } else {
    const durs = browseTab==='marathon'?MARATHON_DURS:RAPID_DURS;
    if(!browseKey || !durs.some(d=>String(d.sec)===String(browseKey))) browseKey=String(durs[0].sec);
    html+='<div class="chips">'+durs.map(d=>'<span class="chip'+(String(browseKey)===String(d.sec)?' on':'')+'" data-key="'+d.sec+'">'+esc(d.label)+'</span>').join('')+'</div>';
    const best=bestPerUser(DATA.fSessions, browseTab, +browseKey);
    const fmtFn=browseTab==='marathon'?marathonScore:rapidScore;
    html+='<div id="detail">'+sessionBoardHtml(durs.find(d=>String(d.sec)===String(browseKey)).label,'best per player', best, DATA.names, DATA.meId, fmtFn)+'</div>';
  }
  return html;
}

function pageView(){
  /* r269 (Wolf): the Schools & Desks view graduated to its own page — desks.html sets
     window.LB_PAGE='teams'; leaderboard.html stays the clean overview. */
  return window.LB_PAGE || 'overview';
}
// legacy deep links (leaderboard.html?view=teams / ?desk=slug) land on the new page
try{ const q=new URLSearchParams(location.search);
  if(pageView()==='overview' && (q.get('view')==='teams' || q.get('desk')))
    location.replace('desks.html'+(q.get('desk')?('?desk='+encodeURIComponent(q.get('desk'))):''));
}catch(e){}
function renderAll(){
  const root=document.getElementById('boards');
  const h1=document.querySelector('h1');
  if(pageView()==='teams'){
    /* r269: the standalone Desks & Schools page — your desk's hall on top (injected as
       #deskBanner above this root), then field-wide standings, then desk-only boards. */
    if(h1 && DATA.viewDesk) h1.textContent='\u25c6 '+DATA.viewDesk.name;
    root.innerHTML =
      (!DATA.viewDesk && DATA.meId ? '<div class="standing cta" style="grid-column:1/-1">A <b>desk</b> is your team\u2019s private room \u2014 shared boards, weekly quests from the staffer, and a roster your cohort can see. <a href="account.html#desk">Start one or join with a code \u2192</a></div>' : '')+
      (!DATA.meId ? '<div class="standing cta" style="grid-column:1/-1"><a href="index.html">Sign in</a> to join a desk and fly your school\u2019s colors \u2014 the standings below are live.</div>' : '')+
      '<h3 class="section-title">Standings \u00b7 the cohorts</h3>'+
      '<div class="featured" style="grid-column:1/-1;align-items:start;margin-bottom:0">'+deskStandingsHtml()+schoolStandingsHtml()+'</div>'+
      '<div style="grid-column:1/-1;min-width:0">'+rosterHtml()+'</div>'+
      (DATA.viewDesk ? ('<h3 class="section-title">This desk\u2019s boards \u2014 members only</h3><div class="browse" style="grid-column:1/-1">'+browserHtml()+'</div>') : '');
  } else {
    if(h1) h1.textContent='Leaderboard';
    root.innerHTML =
      '<div class="hero">'+heroHtml()+ladderHtml()+topPlayersHtml()+'</div>'+
      featuredHtml()+
      '<h3 class="section-title">Browse the boards'+
        '<a href="desks.html" style="float:right;font-size:11px;color:var(--accent);text-decoration:none">\ud83c\udf93 schools & desks \u2192</a></h3>'+
      '<div class="browse" style="grid-column:1/-1">'+browserHtml()+'</div>';
  }
  wire();
  document.querySelectorAll('.ros-t').forEach(b=>b.onclick=()=>{ rosterTier=b.dataset.tier; renderAll(); });
  const er=document.getElementById('enterRanked'); if(er) er.onclick=rankedInfographic;
  const wr=document.getElementById('waitRanked'); if(wr) wr.onclick=()=>{};
  const lr=document.getElementById('leaveRanked'); if(lr) lr.onclick=()=>{ try{ localStorage.setItem('hk_ranked','0'); }catch(e){} load(); };
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
  const tt=document.getElementById('teamToggle');
  if(tt) tt.onclick=()=>{ sessionStorage.setItem('hk_teamview', DATA.teamOnly?'0':'1'); load();
 };
}
load();
