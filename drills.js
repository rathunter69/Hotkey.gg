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
    { name: 'Values',      keys: ['drill', 'series'] },
    { name: 'Data',        keys: ['sort'] },
    { name: 'Formulas',    keys: ['margin', 'growth', 'bridge', 'foot', 'revolver', 'balance', 'audit', 'percent', 'cagr', 'sumif'] },
    { name: 'Models',      keys: ['wacc', 'dcf', 'lbo', 'schedule', 'comps'] },
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
    bridge:     { name:'Bridge',   label:'Stretch the profit row', tab:'Bridge',   desc:'Profit = revenue × margin, fill it across years' },
    foot:       { name:'Foot',     label:'Total it both ways',  tab:'Cross-foot',  desc:'SUM across and down, tie out the corner' },
    wacc:       { name:'WACC',     label:'Build the discount rate', tab:'WACC',    desc:'Weight the cap structure — debt after-tax, always' },
    dcf:        { name:'DCF',      label:'Discount the cash flows', tab:'DCF',     desc:'Anchored PV formula, fill right, sum the PVs' },
    lbo:        { name:'LBO',      label:'Run the LBO math',        tab:'LBO',     desc:'Entry equity, exit equity, MOIC — the IC number' },
    revolver:   { name:'Revolver', label:'Sweep the revolver',  tab:'Revolver',    desc:'LBO cash sweep — MAX the draw, MIN the paydown' },
    balance:    { name:'Balance',  label:'Make it balance',     tab:'Balance',     desc:'Foot both sides, plug the equity, CHECK cell must read 0' },
    audit:      { name:'Audit',    label:'Fix the broken ref',  tab:'Audit',       desc:'One formula reads the wrong row — find it, F2, repair' },
    percent:    { name:'% of rev', label:'Common-size it',      tab:'Common-size', desc:'Common-size with an anchored ($) formula' },
    schedule:   { name:'Schedule', label:'Roll it forward',     tab:'Schedule',    desc:'Roll a PP&E schedule forward with links' },
    comps:      { name:'Comps',    label:'Line up the comps',   tab:'Comps',       desc:'EV/EBITDA multiples, then the average' },

    // Lookups
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
  ],
  finisher: { badge:'\u2b50', name:'Model complete' },
};

/* ---- par snapshot (auto-extracted from CHALLENGES; regen when pars change) ---- */
window.HOTKEY_PARS = {"drill":13,"combo":32,"gauntlet":75,"format":35,"margin":22,"schedule":65,"percent":30,"lookup":50,"ribbon":30,"pastes":38,"saves":26,"editfix":22,"undo":28,"autofit":20,"rowops":26,"filldr":24,"blocksel":22,"copyover":18,"polish":24,"foot":55,"comps":32,"center":38,"blue":34,"sort":33,"series":25,"bridge":22,"growth":28,"wacc":58,"dcf":70,"lbo":75,"revolver":50,"cagr":34,"balance":55,"audit":32,"sumif":52,"lookup2":60,"navigation":30};

/* ---- ACHIEVEMENTS: long-grind goals beyond the campaign. Each test() gets
   ctx = {pb, pars, runs (my posted), streak, solves, crowns, podiums, att, menuOrder}
   and returns {done, prog, goal}. Rendered as medals on the player card. ---- */
window.HOTKEY_ACHIEVEMENTS = [
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
  'Data':'#b9c2cf', 'Formulas':'#e0879e', 'Models':'#c9a2e8', 'Lookups':'#7fd4c1', 'More':'#8b8e94'
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
