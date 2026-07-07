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
    { name: 'Formulas',    keys: ['margin', 'growth', 'bridge', 'foot', 'percent', 'revolver', 'cagr', 'schedule', 'comps'] },
    { name: 'Lookups',     keys: ['lookup'] },
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
    navigation: { name:'Navigate', label:'Navigation tour',     tab:'Nav',         desc:'Full obstacle course: 4 nav chords + select rows + insert/delete' },
    copyover:   { name:'Copyover', label:'Copy it over',        tab:'Basics',      desc:'Select, copy, and paste a block — all keyboard' },

    // Formatting
    polish:     { name:'Polish',   label:'Polish the Header',   tab:'Header',      desc:'Bold + bottom border + shade a header row' },
    combo:      { name:'Combo',    label:'Clean the paste',     tab:'Cleanup',     desc:'Bold, comma, wrap and autofit a pasted table' },
    format:     { name:'Format',   label:'Fix the formats',     tab:'Formats',     desc:'Triage the units — percent, currency, comma' },
    center:     { name:'Center',   label:'Center the headers',  tab:'Align',       desc:'Center the column-header row — Alt H A C' },
    blue:       { name:'Blue',     label:'Blue the inputs',     tab:'Inputs',      desc:'Blue the hardcoded inputs — Alt H F C' },
    gauntlet:   { name:'Gauntlet', label:'Make it model-ready', tab:'Model',       desc:'A full model-ready formatting pass' },

    // Values
    drill:      { name:'Drill',    label:'Hardcode it',         tab:'Hardcode',    desc:'Paste-special values to strip the formulas' },
    series:     { name:'Series',   label:'Stub the year header',tab:'Years',       desc:'Fill a year header across — Alt H F I S' },

    // Data
    sort:       { name:'Sort',     label:'Sort the league table',tab:'Sort',       desc:'Sort a deal table descending — Alt A S D' },

    // Formulas
    margin:     { name:'Formula',  label:'Build the margin',    tab:'Margin',      desc:'Build a margin formula down the column' },
    growth:     { name:'Growth',   label:'Run the growth rates',tab:'Growth',      desc:'YoY growth row — point it, fill right, format %' },
    revolver:   { name:'Revolver', label:'Sweep the cash',      tab:'Revolver',    desc:'Revolver draw = MAX(0, −cash) across the years' },
    cagr:       { name:'CAGR',     label:'Compound it',         tab:'CAGR',        desc:'One-cell CAGR with the ^ power key' },
    bridge:     { name:'Bridge',   label:'Stretch the profit row', tab:'Bridge',   desc:'Profit = revenue × margin, fill it across years' },
    foot:       { name:'Foot',     label:'Total it both ways',  tab:'Cross-foot',  desc:'SUM across and down, tie out the corner' },
    percent:    { name:'% of rev', label:'Common-size it',      tab:'Common-size', desc:'Common-size with an anchored ($) formula' },
    schedule:   { name:'Schedule', label:'Roll it forward',     tab:'Schedule',    desc:'Roll a PP&E schedule forward with links' },
    comps:      { name:'Comps',    label:'Line up the comps',   tab:'Comps',       desc:'EV/EBITDA multiples, then the average' },

    // Lookups
    lookup:     { name:'Lookup',   label:'Look it up',          tab:'Lookup',      desc:'Pull a value out of a table with INDEX/MATCH' },
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
