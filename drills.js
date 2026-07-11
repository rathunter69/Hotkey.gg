/* ============================================================
   hotkey.gg — DRILL CATALOG (canonical source of truth)
   ----------------------------------------------------------------
   Adding a new drill means editing in two places:
     1. HERE  (drills.js)  — name, label, tab, desc, group placement
     2. index.html         — engine logic: build(), demo(), checks(), targets,
                             prompt, req, guide, par, parKeys
   The trainer auto-overrides CHALLENGES[k].name and CHALLENGES[k].label from
   the entries below at runtime, so don't keep stale duplicates in CHALLENGES.

   This file is loaded by:
     - index.html  (the trainer — for DRILL_GROUPS, MENU_ORDER, GROUP_OF, etc.)
     - nav.js      (for the profile modal on leaderboard/reference)
     - leaderboard.html (for the per-drill board list)
   All consumers read window.HOTKEY_DRILLS, never define their own copy.
   ============================================================ */

window.HOTKEY_DRILLS = {

  // ---------------------------------------------------------------
  // GROUPS — defines both the categorization AND the display order.
  // Each group lists its drill keys in the order they should appear.
  // Group order here is the order in the drill picker.
  // ---------------------------------------------------------------
  groups: [
    { name: 'Foundations', keys: ['navigation', 'blocksel', 'ribbon', 'editfix', 'undo', 'filldr', 'pastes', 'rowops', 'autofit', 'saves', 'copyover'] },
    { name: 'Formatting',  keys: ['polish', 'combo', 'format', 'center', 'blue', 'gauntlet'] },
    { name: 'Values',      keys: ['drill', 'series', 'transpose'] },
    { name: 'Data',        keys: ['sort'] },
    { name: 'Formulas',    keys: ['margin', 'growth', 'bridge', 'foot', 'revolver', 'balance', 'audit', 'percent', 'cagr', 'sumif', 'cases'] },
    { name: 'Models',      keys: ['wacc', 'dcf', 'lbo', 'schedule', 'comps', 'waterfall', 'txncomps', 'sourcesuses', 'accdil', 'dcfsens', 'retbridge', 'football'] },
    { name: 'Full Builds', keys: ['isbuild', 'bsbuild', 'cfslink', 'nwcsched', 'debtsched', 'threestmt'] },
    { name: 'Lookups',     keys: ['lookup', 'lookup2'] },
  ],

  // ---------------------------------------------------------------
  // META — per-drill display strings. Keep these tight; long-form prompts
  // and Excel-key guides live in CHALLENGES in index.html (they reference
  // engine internals like Kb, blankCell, colLetter, so they can't live here).
  //   name  — short name shown in tab strip / breadcrumbs (1-2 words)
  //   label — longer display label shown in headers (2-4 words)
  //   tab   — picker tab label (1 word ideally)
  //   desc  — one-line drill picker description
  // ---------------------------------------------------------------
  meta: {
    // Foundations
    navigation: { name:'Navigate', label:'Navigation tour',     tab:'Nav',         desc:'The full obstacle course — 12 chords: edges, selections, rows, columns' },
    autofit:    { name:'Autofit',  label:'Fix the squeezed columns',tab:'Autofit',  desc:'##### everywhere — Alt H O I fits the columns' },
    rowops:     { name:'Rows',     label:'Insert and delete rows',  tab:'Rows',     desc:'Alt H I R opens a row, Alt H D R kills one' },
    filldr:     { name:'Fill',     label:'Fill down, fill right',   tab:'Fill',     desc:'Ctrl+D and Ctrl+R — one formula, whole block' },
    blocksel:   { name:'Block Sel.',label:'Grab the whole block',   tab:'Block',    desc:'Ctrl+Shift+arrow rides to the end of the data' },
    ribbon:     { name:'Ribbon',   label:'Learn the ribbon',        tab:'Ribbon',   desc:'Alt is a menu — walk H 1, H K, H A C' },
    editfix:    { name:'Edit',     label:'Fix the typo in place',   tab:'Edit',     desc:'F2 in, arrow to the mistake, fix, commit' },
    undo:       { name:'Undo',     label:'Undo is a tool',          tab:'Undo',     desc:'Delete, Ctrl+Z it back, bold it instead' },
    pastes:     { name:'Paste Sp.',label:'Alt E S everything',      tab:'Paste Sp.',desc:'One copy, two pastes — values then formats' },
    transpose:  { name:'Transpose', label:'Flip it on its side',        tab:'Transpose', desc:'Copy a row, Alt E S E drops it in as a column' },
    waterfall:  { name:'Waterfall', label:'Run the paydown waterfall',  tab:'Waterfall', desc:'Strict seniority: MIN rations cash down two tranches' },
    txncomps:   { name:'Txn Comps', label:'Run precedent transactions', tab:'Txn Comps', desc:'Multiples paid, the average, and the implied equity' },
    sourcesuses:{ name:'S&U',       label:'Balance sources and uses',   tab:'S&U',       desc:'Total the uses, plug sponsor equity, check reads zero' },
    accdil:     { name:'Acc/Dil',   label:'Run accretion / dilution',   tab:'Acc/Dil',   desc:'Combined income over combined shares — does the deal add to EPS?' },
    dcfsens:    { name:'Sensitivity',label:'Run the sensitivity row',   tab:'Sens.',     desc:'Mixed anchoring: one formula, six WACCs, ctrl+r does the rest' },
    retbridge:  { name:'Ret. Bridge',label:'Attribute the returns',     tab:'Bridge',    desc:'Growth, multiple, delever — prove the bridge ties with a zero check' },
    football:   { name:'Football',  label:'Build the football field',   tab:'Football',  desc:'Midpoints per method, MIN floor, MAX ceiling — the summary page' },
    saves:      { name:'Save',     label:'Save like you mean it',   tab:'Save',     desc:'Work, Ctrl+S. More work, Ctrl+S again' },
    copyover:   { name:'Copyover', label:'Copy it over',        tab:'Basics',      desc:'Select, copy, and paste a block — all keyboard' },

    // Formatting
    polish:     { name:'Polish',   label:'Polish the Header',   tab:'Header',      desc:'Bold + bottom border + shade a header row' },
    combo:      { name:'Combo',    label:'Clean the paste',     tab:'Cleanup',     desc:'Bold, comma, wrap and autofit a pasted table' },
    format:     { name:'Format',   label:'Fix the formats',     tab:'Formats',     desc:'Triage the units — percent, currency, comma' },
    center:     { name:'Center',   label:'Set the alignment',   tab:'Align',       desc:'Center, left, right — three alignment passes, house style' },
    blue:       { name:'Blue',     label:'Blue the inputs',     tab:'Inputs',      desc:'Blue the hardcoded inputs — Alt H F C' },
    gauntlet:   { name:'Gauntlet', label:'Make it model-ready', tab:'Model',       desc:'A full model-ready formatting pass' },

    // Values
    drill:      { name:'Drill',    label:'Hardcode it',         tab:'Hardcode',    desc:'Paste-special values to strip the formulas' },
    series:     { name:'Series',   label:'Stub the year header',tab:'Years',       desc:'Fill the year header, then bold + right-align it' },

    // Data
    sort:       { name:'Sort',     label:'Sort the league table',tab:'Sort',       desc:'Sort the league table, foot it, bold the total' },

    // Formulas
    margin:     { name:'Formula',  label:'Build the margin',    tab:'Margin',      desc:'Build a margin formula down the column' },
    growth:     { name:'Growth',   label:'Run the growth rates',tab:'Growth',      desc:'YoY growth row — point it, fill right, format %' },
    wacc:       { name:'WACC',     label:'Build the discount rate', tab:'WACC',    desc:'Weight the cap structure — debt after-tax, always' },
    dcf:        { name:'DCF',      label:'Discount the cash flows', tab:'DCF',     desc:'Anchored PV formula, fill right, sum the PVs' },
    lbo:        { name:'LBO',      label:'Run the LBO math',        tab:'LBO',     desc:'Entry equity, exit equity, MOIC — the IC number' },
    revolver:   { name:'Revolver', label:'Sweep the cash',      tab:'Revolver',    desc:'Revolver draw = MAX(0, −cash) across the years' },
    cagr:       { name:'CAGR',     label:'Compound it',         tab:'CAGR',        desc:'One-cell CAGR with the ^ power key' },
    sumif:      { name:'SUMIF',    label:'Roll up the segments',tab:'SUMIF',       desc:'Anchored SUMIF rollup — $-lock the ranges, fill down' },
    cases:      { name:'Sticky switch', label:'Sticky IFs \u2014 one switch runs the model', tab:'Cases', desc:'Anchored scenario IF, filled across, then flip the switch' },
    bridge:     { name:'Bridge',   label:'Stretch the profit row', tab:'Bridge',   desc:'Profit = revenue × margin, fill it across years' },
    foot:       { name:'Foot',     label:'Total it both ways',  tab:'Cross-foot',  desc:'SUM across and down, tie out the corner' },
    wacc:       { name:'WACC',     label:'Build the discount rate', tab:'WACC',    desc:'Weight the cap structure — debt after-tax, always' },
    dcf:        { name:'DCF',      label:'Discount the cash flows', tab:'DCF',     desc:'Anchored PV formula, fill right, sum the PVs' },
    lbo:        { name:'LBO',      label:'Run the LBO math',        tab:'LBO',     desc:'Entry equity, exit equity, MOIC — the IC number' },
    revolver:   { name:'Revolver', label:'Sweep the revolver',  tab:'Revolver',    desc:'LBO cash sweep — MAX the draw, MIN the paydown' },
    balance:    { name:'Balance',  label:'Make it balance',     tab:'Balance',     desc:'Foot both sides, plug the equity, CHECK cell must read 0' },
    audit:      { name:'The 4am pass', label:'The 4am pass \u2014 find what\u2019s broken', tab:'Audit', desc:'Three planted breaks in a real P&L \u2014 find them all' },
    percent:    { name:'% of rev', label:'Common-size it',      tab:'Common-size', desc:'Common-size with an anchored ($) formula' },
    schedule:   { name:'Schedule', label:'Roll it forward',     tab:'Schedule',    desc:'Roll a PP&E schedule forward with links' },
    comps:      { name:'Comps',    label:'Line up the comps',   tab:'Comps',       desc:'EV/EBITDA multiples, then the average' },

    // Lookups
    isbuild:    { name:'IS Build',  label:'Build the income statement', tab:'IS Build',  desc:'COGS, GP, EBIT, NI — four formulas, twelve cells' },
    bsbuild:    { name:'BS Build',  label:'Balance the balance sheet',  tab:'BS Build',  desc:'Totals, the RE roll, and a check row that must read zero' },
    nwcsched:   { name:'NWC Sched.',label:'Roll working capital',       tab:'NWC',       desc:'AR/inv/AP off anchored DSO·DIO·DPO, then the swing' },
    threestmt:  { name:'3-Statement',label:'Tie the three statements',  tab:'3-Stmt',    desc:'Three links — corkscrew, CFS→BS cash, RE roll — until it ties' },
    cfslink:    { name:'CFS Link',  label:'Link the cash flow statement',tab:'CFS Link', desc:'Net change, then the cash corkscrew ties out' },
    debtsched:  { name:'Debt Sched.',label:'Run the debt schedule',      tab:'Debt',     desc:'Amort, sweep, average-balance interest — the corkscrew' },
    lookup:     { name:'Lookup',   label:'Look it up',          tab:'Lookup',      desc:'Pull a value out of a table with INDEX/MATCH' },
    lookup2:    { name:'2-way',    label:'Two-way lookup',      tab:'2-way',       desc:'INDEX with two MATCHes — row and column at once' },
  },
};

// ---------------------------------------------------------------
// DERIVED HELPERS — computed once at load time, so consumers can just read them.
// Everything below is generated from the groups+meta above; don't edit by hand.
// ---------------------------------------------------------------
(function(){
  const D = window.HOTKEY_DRILLS;

  // Flat ordered list of all drill keys. Used everywhere a numeric/sequential ordering matters
  // (1-9 hotkeys, Ctrl+PgUp/Dn cycling, leaderboard iteration, profile listing).
  D.menuOrder = D.groups.flatMap(g => g.keys);

  // Reverse lookup: drill key -> group name. Used by the profile modal to print group headers.
  D.groupOf = {};
  D.groups.forEach(g => g.keys.forEach(k => { D.groupOf[k] = g.name; }));

  // Convenience maps so consumers don't have to dig into .meta[k].label every time.
  D.labelOf = {};
  D.nameOf  = {};
  D.tabOf   = {};
  D.descOf  = {};
  for(const k in D.meta){
    const m = D.meta[k];
    D.labelOf[k] = m.label;
    D.nameOf[k]  = m.name;
    D.tabOf[k]   = m.tab;
    D.descOf[k]  = m.desc || '';
  }

  // Sanity check: warn (don't throw) on metadata gaps. A drill listed in groups but missing
  // from meta means downstream UIs will show empty labels — the warning catches it early.
  D.menuOrder.forEach(k => {
    if(!D.meta[k]) console.warn('drills.js: drill key "'+k+'" listed in groups but missing from meta');
  });
})();

/* ---- CAMPAIGN: ordered chapters with time gates. A drill is 'cleared' when the
   local PB beats par * GATE (clean run). Chapter N unlocks when N-1 is fully cleared.
   Badges derive from cleared chapters — rendered on the player card. ---- */
window.HOTKEY_CAMPAIGN = {
  GATE: 1.5,
  chapters: [
    { id:'c1', name:'v1 \u00b7 Foundations',  badge:'\ud83c\udf93', keys:['navigation','blocksel','ribbon','editfix','undo','filldr','pastes','rowops','autofit','saves','copyover'] },
    { id:'c2', name:'v2 \u00b7 Formatting',   badge:'\ud83c\udfa8', keys:['polish','combo','format','center','blue','gauntlet'] },
    { id:'c3', name:'v3 \u00b7 Values & Data',badge:'\ud83d\udccb', keys:['drill','series','sort'] },
    { id:'c4', name:'v4 \u00b7 Formulas I',   badge:'\u2797',        keys:['margin','growth','foot','percent'] },
    { id:'c5', name:'v5 \u00b7 Formulas II',  badge:'\ud83e\uddee', keys:['bridge','audit','balance','revolver','cagr','sumif'] },
    { id:'c6', name:'v6 \u00b7 Models',       badge:'\ud83c\udfe6', keys:['wacc','dcf','lbo','schedule','comps'] },
    { id:'c7', name:'v7 \u00b7 Lookups',      badge:'\ud83d\udd0e', keys:['lookup','lookup2'] },
    { id:'c8', name:'v8 \u00b7 Full Builds',  badge:'\ud83c\udfd7', keys:['isbuild','bsbuild','cfslink','nwcsched','debtsched','threestmt'] },
  ],
  finisher: { badge:'\u2b50', name:'Model complete' },
};

/* ---- par snapshot (auto-extracted from CHALLENGES; regen when pars change) ---- */
// ---- ADVANCED TIER / PAYWALL SCAFFOLD ----
// enabled:false during beta. Advanced groups carry the \u25c6 badge and section-leader
// boards now; flipping enabled:true (post-beta, post-internship, Stripe LIVE keys)
// gates these groups behind entitlement. Everything else stays free.
window.HOTKEY_PREMIUM = { enabled:false, groups:['Models','Full Builds'] };

window.HOTKEY_PARS = {"drill":13,"combo":32,"gauntlet":75,"format":42,"margin":52,"schedule":98,"percent":64,"lookup":50,"ribbon":42,"pastes":44,"transpose":40,"saves":44,"editfix":44,"undo":28,"autofit":34,"rowops":26,"filldr":24,"blocksel":30,"copyover":36,"polish":38,"foot":72,"comps":62,"center":44,"blue":62,"sort":40,"series":30,"bridge":40,"growth":58,"wacc":78,"dcf":100,"lbo":98,"revolver":52,"isbuild":128,"debtsched":155,"cfslink":132,"bsbuild":125,"nwcsched":132,"threestmt":155,"waterfall":118,"txncomps":110,"sourcesuses":96,"accdil":104,"dcfsens":74,"retbridge":112,"football":92,"cagr":72,"balance":55,"audit":32,"sumif":52,"lookup2":60,"navigation":30};

/* ---- ACHIEVEMENTS: long-grind goals beyond the campaign. Each test() gets
   ctx = {pb, pars, runs (my posted), streak, solves, crowns, podiums, att, menuOrder}
   and returns {done, prog, goal}. Rendered as medals on the player card. ---- */
window.HOTKEY_ACHIEVEMENTS = [
  /* ---- r79: the creative twenty (incl. anti-achievements — mouse slips, slow burns) ---- */
  { id:'x_tour',   glyph:'c1', name:'Tourist',            desc:'Attempt 10 different drills',            test:c=>({done:c.att>=10, prog:Math.min(c.att,10), goal:10}) },
  { id:'x_comp',   glyph:'c1', name:'Completionist',      desc:'Attempt every drill on the board',       test:c=>({done:c.att>=c.menuOrder.length, prog:c.att, goal:c.menuOrder.length}) },
  { id:'x_sub5',   glyph:'spd', name:'Blink',             desc:'Finish any drill in under 5 seconds',    test:c=>{ const ok=(c.runs||[]).some(r=>r.time_ms<5000); return {done:ok, prog:ok?1:0, goal:1}; } },
  { id:'x_zero',   glyph:'gnt', name:'No Wasted Keys',    desc:'Match the optimal keystroke count exactly', test:c=>{ const ok=(c.runs||[]).some(r=>r.optimal&&r.keystrokes===r.optimal); return {done:ok, prog:ok?1:0, goal:1}; } },
  { id:'x_econ',   glyph:'gnt', name:'Economist',         desc:'10 runs at or under optimal keys',       test:c=>{ const n=(c.runs||[]).filter(r=>r.optimal&&r.keystrokes<=r.optimal).length; return {done:n>=10, prog:Math.min(n,10), goal:10}; } },
  { id:'x_slow',   glyph:'day', name:'Thorough',          desc:'Take over a minute on a single solve',   test:c=>({done:(c.slowWins||0)>=1, prog:Math.min(c.slowWins||0,1), goal:1}) },
  { id:'x_mouse1', glyph:'c7', name:'Old Habits',         desc:'Ruin a run with the mouse',              test:c=>({done:(c.mouseRuns||0)>=1, prog:Math.min(c.mouseRuns||0,1), goal:1}) },
  { id:'x_mouse10',glyph:'c7', name:'The Mouse Is a Lifestyle', desc:'Ruin 10 runs with the mouse',      test:c=>({done:(c.mouseRuns||0)>=10, prog:Math.min(c.mouseRuns||0,10), goal:10}) },
  { id:'x_night',  glyph:'day', name:'Night Shift',       desc:'Clean solve between midnight and 4am',   test:c=>({done:!!c.nightWin, prog:c.nightWin?1:0, goal:1}) },
  { id:'x_dawn',   glyph:'day', name:'Dawn Patrol',       desc:'Clean solve between 5 and 7am',          test:c=>({done:!!c.dawnWin, prog:c.dawnWin?1:0, goal:1}) },
  { id:'x_wknd',   glyph:'day', name:'Weekend Warrior',   desc:'Clean solve on a Saturday or Sunday',    test:c=>({done:!!c.weekendWin, prog:c.weekendWin?1:0, goal:1}) },
  { id:'x_run200', glyph:'vol', name:'Volume Business',   desc:'200 recorded runs',                      test:c=>{ const n=(c.runs||[]).length; return {done:n>=200, prog:Math.min(n,200), goal:200}; } },
  { id:'x_found',  glyph:'c6', name:'Foundations Poured', desc:'PB on every Foundations drill',          test:c=>{ const ks=(c.groups['Foundations']||[]); const n=ks.filter(k=>c.pb[k]!==undefined).length; return {done:ks.length>0&&n>=ks.length, prog:n, goal:ks.length||1}; } },
  { id:'x_models', glyph:'c6', name:'Model Citizen',      desc:'Beat par on every Models drill',         test:c=>{ const ks=(c.groups['Models']||[]); const n=ks.filter(k=>c.pb[k]!==undefined&&c.pars[k]&&c.pb[k]<=c.pars[k]).length; return {done:ks.length>0&&n>=ks.length, prog:n, goal:ks.length||1}; } },
  { id:'x_stack',  glyph:'c3', name:'Full Stack',         desc:'At least one PB in every group',         test:c=>{ const gs=Object.keys(c.groups); const n=gs.filter(g=>(c.groups[g]||[]).some(k=>c.pb[k]!==undefined)).length; return {done:n>=gs.length, prog:n, goal:gs.length}; } },
  { id:'x_par25',  glyph:'spd', name:'Par Machine',       desc:'Beat par on 25 different drills',        test:c=>{ const n=c.menuOrder.filter(k=>c.pb[k]!==undefined&&c.pars[k]&&c.pb[k]<=c.pars[k]).length; return {done:n>=25, prog:Math.min(n,25), goal:25}; } },
  { id:'x_pb40',   glyph:'c3', name:'Collector',          desc:'Hold a PB on 40 different drills',       test:c=>{ const n=c.menuOrder.filter(k=>c.pb[k]!==undefined).length; return {done:n>=40, prog:Math.min(n,40), goal:40}; } },
  { id:'x_strk7',  glyph:'str', name:'Business Week',     desc:'7-day streak',                           test:c=>({done:c.streak>=7, prog:Math.min(c.streak,7), goal:7}) },
  { id:'x_strk30', glyph:'str', name:'Quarter Close',     desc:'30-day streak',                          test:c=>({done:c.streak>=30, prog:Math.min(c.streak,30), goal:30}) },
  { id:'x_crown5', glyph:'crn', name:'Corner Office',     desc:'Hold 5 leaderboard crowns at once',      test:c=>({done:c.crowns>=5, prog:Math.min(c.crowns,5), goal:5}) },
  { id:'spd1', glyph:'spd', name:'Under Par',        desc:'Beat par on any drill',                 test:c=>{ const n=c.menuOrder.filter(k=>c.pb[k]!==undefined&&c.pars[k]&&c.pb[k]<=c.pars[k]).length; return {done:n>=1, prog:Math.min(n,1), goal:1}; } },
  { id:'spd2', glyph:'spd', name:'Metronome',        desc:'Beat par on 10 different drills',       test:c=>{ const n=c.menuOrder.filter(k=>c.pb[k]!==undefined&&c.pars[k]&&c.pb[k]<=c.pars[k]).length; return {done:n>=10, prog:Math.min(n,10), goal:10}; } },
  { id:'spd3', glyph:'spd', name:'Untouchable',      desc:'Beat par on EVERY drill',               test:c=>{ const n=c.menuOrder.filter(k=>c.pb[k]!==undefined&&c.pars[k]&&c.pb[k]<=c.pars[k]).length; return {done:n>=c.menuOrder.length, prog:n, goal:c.menuOrder.length}; } },
  { id:'vol1', glyph:'vol', name:'Warm Hands',       desc:'100 clean solves',                      test:c=>({done:c.solves>=100, prog:Math.min(c.solves,100), goal:100}) },
  { id:'vol2', glyph:'vol', name:'Grinder',          desc:'500 clean solves',                      test:c=>({done:c.solves>=500, prog:Math.min(c.solves,500), goal:500}) },
  { id:'vol3', glyph:'vol', name:'Ten Thousand Keys',desc:'2,000 clean solves',                    test:c=>({done:c.solves>=2000, prog:Math.min(c.solves,2000), goal:2000}) },
  { id:'str1', glyph:'str', name:'Habit',            desc:'7-day streak',                          test:c=>({done:c.streak>=7, prog:Math.min(c.streak,7), goal:7}) },
  { id:'str2', glyph:'str', name:'Ritual',           desc:'30-day streak',                         test:c=>({done:c.streak>=30, prog:Math.min(c.streak,30), goal:30}) },
  { id:'str3', glyph:'str', name:'Institution',      desc:'100-day streak',                        test:c=>({done:c.streak>=100, prog:Math.min(c.streak,100), goal:100}) },
  { id:'crn1', glyph:'crn', name:'First Blood',      desc:'Hold #1 on any board',                  test:c=>({done:c.crowns>=1, prog:Math.min(c.crowns,1), goal:1}) },
  { id:'crn2', glyph:'crn', name:'Warlord',          desc:'Hold 5 crowns at once',                 test:c=>({done:c.crowns>=5, prog:Math.min(c.crowns,5), goal:5}) },
  { id:'day1', glyph:'day', name:'Regular',          desc:'Run 10 daily challenges',               test:c=>{ const n=c.runs.filter(r=>(r.challenge||'').indexOf('daily-')===0).length; return {done:n>=10, prog:Math.min(n,10), goal:10}; } },
  { id:'day2', glyph:'day', name:'Fixture',          desc:'Run 50 daily challenges',               test:c=>{ const n=c.runs.filter(r=>(r.challenge||'').indexOf('daily-')===0).length; return {done:n>=50, prog:Math.min(n,50), goal:50}; } },
  { id:'gnt1', glyph:'gnt', name:'Gauntlet Runner',  desc:'Post all 5 legs of a weekly gauntlet',  test:c=>{ const wk={}; c.runs.forEach(r=>{ const m=/^wk-(\d{4}-\d{2})-/.exec(r.challenge||''); if(m){ (wk[m[1]]=wk[m[1]]||new Set()).add(r.challenge); } }); const best=Math.max(0,...Object.values(wk).map(s=>s.size)); return {done:best>=5, prog:Math.min(best,5), goal:5}; } },
  { id:'brd1', glyph:'vol', name:'Everywhere',       desc:'Post a time on every board',            test:c=>({done:c.att>=c.menuOrder.length, prog:c.att, goal:c.menuOrder.length}) },
  { id:'day3', glyph:'day', name:'Deal Sprint',      desc:'10 posted runs in a single day',        test:c=>{ const per={}; c.runs.forEach(r=>{ const d=String(r.created_at||'').slice(0,10); if(d) per[d]=(per[d]||0)+1; }); const best=Math.max(0,...Object.values(per)); return {done:best>=10, prog:Math.min(best,10), goal:10}; } },
  { id:'day4', glyph:'day', name:'Live Deal',        desc:'25 posted runs in a single day',        test:c=>{ const per={}; c.runs.forEach(r=>{ const d=String(r.created_at||'').slice(0,10); if(d) per[d]=(per[d]||0)+1; }); const best=Math.max(0,...Object.values(per)); return {done:best>=25, prog:Math.min(best,25), goal:25}; } },
  { id:'ngt1', glyph:'str', name:'After Hours',      desc:'Post a run between midnight and 5am',   test:c=>{ const hit=c.runs.some(r=>{ const t=new Date(r.created_at||0); const hr=t.getHours(); return hr>=0&&hr<5; }); return {done:hit, prog:hit?1:0, goal:1}; } },
  { id:'wkd1', glyph:'day', name:'Weekend Warrior',  desc:'Post runs on both Saturday and Sunday of the same weekend', test:c=>{ const wk={}; c.runs.forEach(r=>{ const t=new Date(r.created_at||0); const day=t.getDay(); if(day===0||day===6){ const sat=new Date(t); sat.setDate(t.getDate()-(day===0?1:0)); const key=sat.toISOString().slice(0,10); wk[key]=(wk[key]||0)|(day===6?1:2); } }); const hit=Object.values(wk).some(v=>v===3); return {done:hit, prog:hit?1:0, goal:1}; } },
  { id:'grp1', glyph:'spd', name:'Solid Foundation', desc:'Beat par on every Foundations drill',   test:c=>{ const ks=(c.groups&&c.groups['Foundations'])||[]; const n=ks.filter(k=>c.pb[k]!==undefined&&c.pars[k]&&c.pb[k]<=c.pars[k]).length; return {done:ks.length>0&&n>=ks.length, prog:n, goal:ks.length||1}; } },
  { id:'grp2', glyph:'crn', name:'Model Citizen',    desc:'Beat par on every Models drill',        test:c=>{ const ks=(c.groups&&c.groups['Models'])||[]; const n=ks.filter(k=>c.pb[k]!==undefined&&c.pars[k]&&c.pb[k]<=c.pars[k]).length; return {done:ks.length>0&&n>=ks.length, prog:n, goal:ks.length||1}; } },
  { id:'spd4', glyph:'spd', name:'Half-Par Club',    desc:'Clear any drill in under half its par', test:c=>{ const hit=c.menuOrder.some(k=>c.pb[k]!==undefined&&c.pars[k]&&c.pb[k]<=c.pars[k]/2); return {done:hit, prog:hit?1:0, goal:1}; } },
  { id:'gnt2', glyph:'gnt', name:'Season Ticket',    desc:'Post gauntlet legs in 4 different weeks', test:c=>{ const wks=new Set(); c.runs.forEach(r=>{ const m=/^wk-(\d{4}-\d{2})-/.exec(r.challenge||''); if(m) wks.add(m[1]); }); return {done:wks.size>=4, prog:Math.min(wks.size,4), goal:4}; } },
];

/* ---- group color identity: one muted hue per skill family. Used as accents only
   (left borders, label tints, badge strokes) — never full fills. ---- */
window.HOTKEY_GROUP_COLORS = {
  'Foundations':'#8ab4ff', 'Formatting':'#d9a441', 'Values':'#2ea36f',
  'Data':'#b9c2cf', 'Formulas':'#e0879e', 'Models':'#c9a2e8', 'Full Builds':'#e3b341', 'Lookups':'#7fd4c1', 'More':'#8b8e94'
};

/* ---- PLUGIN KEY LAYERS: curated Macabacus + FactSet defaults for IB workflows.
   Sources: Macabacus official shortcuts cheat sheet + Quick Start Guide (defaults;
   remappable in their Shortcut Manager — add-in conflicts are common per their docs);
   FactSet published hot-key sheet + desk convention (remappable: FactSet ribbon →
   Settings → Manage Hotkeys). inEngine:true = the trainer accepts it under that
   keyboard profile today. ---- */
window.HOTKEY_PLUGIN_LAYERS = {
  macabacus: { name:'Macabacus', color:'#8ab4ff', note:'Defaults from the official cheat sheet \u2014 most desks remap some of these in Shortcut Manager.',
    keys:[
      {k:'Ctrl+Shift+R', a:'Fast Fill Right \u2014 fills to the data edge from one cell', cat:'Modeling', inEngine:true},
      {k:'Ctrl+Shift+D', a:'Fast Fill Down', cat:'Modeling', inEngine:true},
      {k:'Ctrl+Shift+L', a:'Fast Fill Left', cat:'Modeling', inEngine:true},
      {k:'Ctrl+Alt+A', a:'AutoColor Selection \u2014 inputs blue, formulas black', cat:'Colors', inEngine:true},
      {k:'Ctrl+Alt+S', a:'AutoColor Sheet', cat:'Colors', inEngine:true},
      {k:'Ctrl+Alt+W', a:'AutoColor Workbook', cat:'Colors'},
      {k:'Ctrl+Shift+V', a:'Paste Values', cat:'Paste', inEngine:true},
      {k:'Ctrl+Alt+Shift+1', a:'General Number Cycle', cat:'Numbers', inEngine:true},
      {k:'Ctrl+Alt+Shift+2', a:'Date Cycle', cat:'Numbers'},
      {k:'Ctrl+Alt+Shift+4', a:'Local Currency Cycle', cat:'Numbers', inEngine:true},
      {k:'Ctrl+Alt+Shift+5', a:'Percent Cycle', cat:'Numbers', inEngine:true},
      {k:'Ctrl+Alt+Shift+8', a:'Multiple Cycle (x)', cat:'Numbers'},
      {k:'Ctrl+Alt+Shift+.', a:'Increase Decimals', cat:'Numbers'},
      {k:'Ctrl+Alt+Shift+,', a:'Decrease Decimals', cat:'Numbers'},
      {k:'Ctrl+Alt+Shift+B', a:'Blue-Black font toggle', cat:'Fonts'},
      {k:'Ctrl+Alt+Shift+U', a:'Underline Cycle (single \u2192 accounting)', cat:'Fonts'},
      {k:'Ctrl+Alt+Shift+C', a:'Center Cycle (incl. center-across-selection)', cat:'Alignment'},
      {k:'Ctrl+Alt+Shift+7', a:'Outside Border Cycle', cat:'Borders'},
      {k:'Ctrl+Alt+Shift+-', a:'Bottom Border Cycle', cat:'Borders'},
      {k:'Ctrl+Shift+[', a:'Pro Precedents \u2014 step through formula inputs, across tabs', cat:'Auditing'},
      {k:'Ctrl+Shift+]', a:'Pro Dependents', cat:'Auditing'},
      {k:'Ctrl+Alt+G', a:'Toggle gridlines', cat:'View'},
      {k:'Ctrl+Alt+=', a:'Zoom in (5% steps)', cat:'View'},
      {k:'Ctrl+Alt+-', a:'Zoom out', cat:'View'},
    ]},
  factset: { name:'FactSet', color:'#e0879e', note:'From FactSet\u2019s published hot-key sheet + desk convention \u2014 remappable via FactSet ribbon \u2192 Settings \u2192 Manage Hotkeys.',
    keys:[
      {k:'Ctrl+Alt+Shift+K', a:'Fill right', cat:'Modeling', inEngine:true},
      {k:'Ctrl+Alt+Shift+J', a:'Fill left', cat:'Modeling', inEngine:true},
      {k:'Ctrl+Alt+Shift+D', a:'Fill down', cat:'Modeling', inEngine:true},
      {k:'Ctrl+Alt+Shift+U', a:'Fill up', cat:'Modeling', inEngine:true},
      {k:'Ctrl+Alt+E', a:'AutoColor by content \u2014 blue inputs, green links, black formulas', cat:'Colors', inEngine:true},
      {k:'Ctrl+Shift+3', a:'Number format: date', cat:'Numbers'},
      {k:'Ctrl+Shift+4', a:'Number format: currency', cat:'Numbers', inEngine:true},
      {k:'Ctrl+Shift+5', a:'Number format: percent', cat:'Numbers', inEngine:true},
      {k:'Ctrl+Shift+8', a:'Number format: multiple (x)', cat:'Numbers'},
      {k:'Ctrl+Shift+Y', a:'Number format cycle', cat:'Numbers'},
      {k:'Ctrl+Shift+:', a:'Cell color cycle', cat:'Colors'},
      {k:'Ctrl+Alt+,', a:'Copy formula refs + formatting', cat:'Paste'},
      {k:'Ctrl+Alt+.', a:'Paste formula refs + formatting', cat:'Paste'},
      {k:'Ctrl+Alt+Shift+!', a:'Apply captured row/column layout to selection', cat:'Utilities'},
    ]},
};
