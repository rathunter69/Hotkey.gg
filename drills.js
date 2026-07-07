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
    { name: 'Foundations', keys: ['navigation', 'copyover'] },
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
    { id:'c1', name:'Ch. 1 \u00b7 Foundations',  badge:'\ud83c\udf93', keys:['navigation','copyover'] },
    { id:'c2', name:'Ch. 2 \u00b7 Formatting',   badge:'\ud83c\udfa8', keys:['polish','combo','format','center','blue','gauntlet'] },
    { id:'c3', name:'Ch. 3 \u00b7 Values & Data',badge:'\ud83d\udccb', keys:['drill','series','sort'] },
    { id:'c4', name:'Ch. 4 \u00b7 Formulas I',   badge:'\u2797',        keys:['margin','growth','foot','percent'] },
    { id:'c5', name:'Ch. 5 \u00b7 Formulas II',  badge:'\ud83e\uddee', keys:['bridge','audit','balance','revolver','cagr','sumif'] },
    { id:'c6', name:'Ch. 6 \u00b7 Models',       badge:'\ud83c\udfe6', keys:['wacc','dcf','lbo','schedule','comps'] },
    { id:'c7', name:'Ch. 7 \u00b7 Lookups',      badge:'\ud83d\udd0e', keys:['lookup','lookup2'] },
  ],
  finisher: { badge:'\u2b50', name:'Campaign Complete' },
};

/* ---- par snapshot (auto-extracted from CHALLENGES; regen when pars change) ---- */
window.HOTKEY_PARS = {"drill":13,"combo":32,"gauntlet":75,"format":35,"margin":22,"schedule":65,"percent":30,"lookup":50,"copyover":18,"polish":24,"foot":55,"comps":32,"center":38,"blue":34,"sort":33,"series":25,"bridge":22,"growth":28,"wacc":58,"dcf":70,"lbo":75,"revolver":50,"cagr":34,"balance":55,"audit":32,"sumif":52,"lookup2":60,"navigation":30};
