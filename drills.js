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
  // r242 — curriculum v2.1 regroup. 8 chapters, ~10 drills each, a clean difficulty spine:
  // Foundations → Formatting → Formulas I (all FREE) → Data & Lookups (level bridge) →
  // Formulas II / Models I / Models II / Full Builds (PRO).
  // r249 — the 6 folded legacy drills (saves, ribbon, polish, format, blue, transpose) were
  // deleted outright, their value covered by survivors (copyover, housestyle, dress, decimals,
  // the Alt-H drills, pastes). Catalog is now exactly the 80 grouped drills.
  groups: [
    { name: 'Foundations',    keys: ['navigation', 'modeltour', 'filldr', 'pastes', 'blocksel', 'rowops', 'colops', 'editfix', 'undo', 'copyover'] },
    { name: 'Formatting',     keys: ['typeset', 'decimals', 'center', 'autofit', 'ruleoff', 'ruleaudit', 'combo', 'dress', 'housestyle', 'gauntlet'] },
    { name: 'Formulas I',     keys: ['margin', 'foot', 'anchor', 'percent', 'growth', 'cagr', 'bridge', 'sumif', 'rollup', 'fxconvert', 'cases'] },
    { name: 'Data & Lookups', keys: ['sort', 'scrub', 'grpfold', 'filterpass', 'unhide', 'lookup', 'lookup2', 'recon', 'drill', 'series'] },
    { name: 'Formulas II',    keys: ['audit', 'triage', 'wrapfix', 'balcheck', 'stalelink', 'wirewalk', 'hunt', 'signerr', 'versionup', 'balance'] },
    { name: 'Models I',       keys: ['wacc', 'fcfbuild', 'dcf', 'comps', 'txncomps', 'football', 'dcfsens', 'retbridge', 'accdil', 'sourcesuses'] },
    { name: 'Models II',      keys: ['schedule', 'intsched', 'lbo', 'revolver', 'waterfall', 'covtable', 'liqbridge', 'wk13', 'cascade', 'debtsched'] },
    { name: 'Full Builds',    keys: ['isbuild', 'bsbuild', 'cfslink', 'nwcsched', 'threestmt', 'opmodel', 'dcfbuild', 'lbobuild', 'debtblock', 'dashcover'] },
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
    navigation: { name:'Navigate', label:'Navigation tour',     tab:'Nav',         desc:'The keyboard LEAPS every direction — thread a long random maze (8 jumps), grab the model, copy it, drop it in the deck, land home' },
    autofit:    { name:'Autofit',  label:'Fix the squeezed columns',tab:'Autofit',  desc:'##### everywhere — Alt H O I fits the columns' },
    rowops:     { name:'Rows',     label:'Rebuild the schedule',    tab:'Rows',     desc:'Insert a row and paste the staged line in, delete the junk \u2014 the live SUM widens and contracts itself' },
    colops:     { name:'Columns',  label:'Columns move too',        tab:'Columns',  desc:'Ctrl+Space grabs it, Alt H D C kills it, Alt H I C opens one' },
    filldr:     { name:'Fill',     label:'Fill down, fill right',   tab:'Fill',     desc:'Ctrl+D and Ctrl+R — one formula, whole block' },
    blocksel:   { name:'Block Sel.',label:'Assemble & dress the summary',tab:'Block', desc:'COPY what stays, CUT what moves into a headered output, add a margin memo, then dress it like the deck' },
    editfix:    { name:'Edit',     label:'Fix the typos in place',  tab:'Edit',     desc:'Three typos, three F2 repairs — never retype a cell' },
    undo:       { name:'Undo',     label:'Undo is a tool',          tab:'Undo',     desc:'Delete big, Ctrl+Z, then delete only what deserved it' },
    pastes:     { name:'Paste Sp.',label:'Alt E S everything',      tab:'Paste Sp.',desc:'One copy, two pastes — values then formats' },
    waterfall:  { name:'Waterfall', label:'Run the paydown waterfall',  tab:'Waterfall', desc:'3-yr cascade: MIN rations, both tranches corkscrew across' },
    cascade:    { name:'Full Waterfall', label:'Run the full cascade',   tab:'Cascade',   desc:'3 tranches \u00d7 4 yrs: seniority MINs, per-tranche corkscrews, total debt ruled off' },
    wk13:       { name:'13-Week Cash', label:'Run the 13-week', tab:'13-Week', desc:'The RX staple: weekly corkscrew, anchored liquidity cushion, totals on flows only' },
    liqbridge:  { name:'Liq. Bridge', label:'Bridge the liquidity \u2014 three cases', tab:'Liq. Bridge', desc:'Cash + undrawn to ending liquidity, Base / Downside / Severe \u2014 read which cases breach' },
    covtable:   { name:'Cov. Table',  label:'Run the covenant table', tab:'Covenants', desc:'Net leverage vs a stepping max \u2014 headroom, a real IF flag, MIN pulls the pinch quarter' },
    txncomps:   { name:'Txn Comps', label:'Run precedent transactions', tab:'Txn Comps', desc:'Multiples paid, the average, and the implied equity' },
    sourcesuses:{ name:'S&U',       label:'Balance sources and uses',   tab:'S&U',       desc:'Total, plug, check zero — then % of total down both sides' },
    accdil:     { name:'Acc/Dil',   label:'Run accretion / dilution',   tab:'Acc/Dil',   desc:'Combined EPS vs standalone — synergies in, financing drag out' },
    dcfsens:    { name:'Sensitivity',label:'Run the sensitivity table', tab:'Sens.',     desc:'True mixed anchors — one formula fills the 5×3 WACC × growth grid' },
    retbridge:  { name:'Ret. Bridge',label:'Attribute the returns',     tab:'Returns',   desc:'Growth, multiple, delever — prove the bridge ties with a zero check' },
    football:   { name:'Football',  label:'Build the football field',   tab:'Football',  desc:'Midpoints per method, MIN floor, MAX ceiling — the summary page' },
    copyover:   { name:'Copyover', label:'One copy, three hand-offs', tab:'Copy',  desc:'Two full pastes + Alt E S V values for the deck' },

    // Formatting
    housestyle: { name:'House Style', label:'Bring it to standard', tab:'House Style', desc:'The senior\u2019s pass: title, headers, blue inputs (one buried), commas, %, ruled off' },
    ruleoff:    { name:'Rule Off',  label:'Rule off the schedule', tab:'Rule Off',  desc:'Accounting rulings: line under headers, line above every total, box the headline' },
    ruleaudit:  { name:'Ruling Pass', label:'The ruling pass', tab:'Ruling Pass', desc:'The page says done \u2014 the pass disagrees. Find the missing rulings, fix only those' },
    combo:      { name:'Combo',    label:'Clean the paste',     tab:'Cleanup',     desc:'Bold, comma, wrap and autofit a pasted table' },
    typeset:    { name:'Typeset',  label:'Typeset the memo',    tab:'Typeset',     desc:'Bold, unbold, italic memos, strike the dead line, =TODAY() stamp' },
    decimals:   { name:'Decimals', label:'The decimals pass',   tab:'Decimals',    desc:'Alt H 9 / Alt H 0 — dollars none, multiples and percents one' },
    dress:      { name:'Dress the tab', label:'Dress the tab \u2014 full formatting pass', tab:'Dress', desc:'Title ruled, inputs blue, percents, commas \u2014 book-ready' },
    triage:     { name:'Error triage', label:'Error triage \u2014 #REF! #DIV/0! #VALUE!', tab:'Triage', desc:'Three classic breaks \u2014 read the error, rebuild the intent' },
    versionup:  { name:'Roll-forward prep', label:'Kill the hardcodes \u2014 make it roll forward', tab:'Rollfwd', desc:'Typed answers \u2192 live formulas; v2 must survive new numbers' },
    center:     { name:'Center',   label:'Set the alignment',   tab:'Align',       desc:'Center, left, right — three alignment passes, house style' },
    gauntlet:   { name:'Gauntlet', label:'Make it model-ready', tab:'Model',       desc:'A full model-ready formatting pass' },

    // Values
    drill:      { name:'Hardcode', label:'Hardcode it',         tab:'Hardcode',    desc:'Break the links before it ships — ESV in place, painted blue' },
    series:     { name:'Series',   label:'Stub the year header',tab:'Years',       desc:'Fill the year header, then bold + right-align it' },

    // Data
    sort:       { name:'Sort',     label:'Sort the league table',tab:'Sort',       desc:'Sort the league table, foot it, bold the total' },
    scrub:      { name:'Scrub',    label:'Clean the export',     tab:'Scrub',      desc:'Junk rows out, sort what\u2019s real, refoot the clean tape' },
    recon:      { name:'Recon',    label:'Two systems, one truth',tab:'Recon',     desc:'COUNTIF for presence, INDEX/MATCH for amounts \u2014 drive \u0394 to zero' },
    grpfold:    { name:'Group',    label:'Fold the detail away', tab:'Group',      desc:'Shift+Alt+\u2192 groups the months \u2014 never hide, always group' },
    filterpass: { name:'Filter',   label:'Work the filtered tape', tab:'Filter',    desc:'Ctrl+Shift+L arms the tape, Alt+\u2193 works the picker \u2014 the answer reads itself' },
    unhide:     { name:'Unhide',   label:'Flush the hidden rows',  tab:'Unhide',    desc:'Hidden rows lie \u2014 unhide the sins, group them right, set a real width' },

    // Formulas
    margin:     { name:'Margins',  label:'Margins across the page', tab:'Margin',  desc:'EBITDA ÷ revenue, three comp tables — pointed, filled, %' },
    anchor:     { name:'Anchors',  label:'Pin it with F4',          tab:'F4',      desc:'F4 cycles the locks — one pinned formula prices the whole grid' },
    growth:     { name:'Growth',   label:'Run the growth rates',tab:'Growth',      desc:'Consolidate, YoY as %, CAGR with ^ — a real revenue build' },
    wacc:       { name:'WACC',     label:'Build the discount rate', tab:'WACC',    desc:'Unlever, relever, CAPM, weight — the full discount-rate build' },
    fcfbuild:   { name:'uFCF',     label:'Build the unlevered FCF', tab:'uFCF',    desc:'EBIT \u2192 less taxes \u2192 NOPAT \u2192 plus D&A, less capex and the NWC build: the row every DCF discounts, filled across five years' },
    dcf:        { name:'DCF',      label:'Discount the cash flows', tab:'DCF',     desc:'DF row \u00d7 PV row; the TV reuses the year-5 factor' },
    dcfbuild:   { name:'DCF page', label:'Build the DCF page',      tab:'DCF page',desc:'The whole valuation page: DF, PV, terminal value, EV \u2014 then bridge net debt to equity and divide to value per share' },
    lbobuild:   { name:'Paper LBO',label:'Build the paper LBO',     tab:'Paper LBO',desc:'Sources & uses sizes the equity plug, then entry to exit turns it into MOIC and IRR \u2014 the whole paper LBO on one tab' },
    opmodel:    { name:'Op model', label:'Build the operating model',tab:'Op model',desc:'Drivers up: grow revenue off one anchored rate, cost it as % of sales, and gross profit, EBITDA and the margin line build themselves' },
    debtblock:  { name:'Debt block',label:'Build the debt & interest block',tab:'Debt block',desc:'Two tranches, each rolling on its own anchored rate — senior and sub corkscrews, both interest lines, then total debt and total interest' },
    dashcover:  { name:'Model cover',label:'Build the model cover',  tab:'Model cover',desc:'The page-one output box: reference the model into equity value, value per share, EV/EBITDA, net leverage and interest coverage' },
    lbo:        { name:'LBO',      label:'Run the LBO math',        tab:'LBO',     desc:'Entry equity, exit equity, MOIC — then IRR over the hold' },
    modeltour:  { name:'Model Tour', label:'Chase the marks', tab:'Model Tour', desc:'Four subtotals blown to #REF! \u2014 ctrl-jump to each, rebuild the cascade formula' },
    revolver:   { name:'Revolver', label:'Sweep the revolver',  tab:'Revolver',    desc:'MIN/MAX sweep ×4 years, then prove out both balances' },
    cagr:       { name:'CAGR',     label:'Compound it, three times', tab:'CAGR',   desc:'(End÷Begin)^(1÷yrs)−1 — three scattered blocks' },
    sumif:      { name:'SUMIF',    label:'Roll up the segments',tab:'SUMIF',       desc:'SUMIF rollup + live foot + % of total, summary dressed' },
    rollup:     { name:'SUMIFS',   label:'Cross the tape',      tab:'SUMIFS',      desc:'One mixed-anchor SUMIFS fills the segment \u00d7 region grid' },
    fxconvert:  { name:'FX Convert', label:'Convert the page \u2014 one boxed rate', tab:'FX', desc:'One boxed EUR\u2192USD rate drives a 2D-filled conversion \u2014 anchored driver, outlined output' },
    cases:      { name:'Sticky switch', label:'Scenario driver \u2014 CHOOSE + sticky capture', tab:'Cases', desc:'A CHOOSE driver reads the switch and repositions the model; a self-referencing IF snapshots each case into the output table' },
    bridge:     { name:'Bridge',   label:'Stretch the profit row', tab:'Bridge',   desc:'Profit = revenue × margin, fill it across years' },
    foot:       { name:'Foot',     label:'Total it both ways',  tab:'Cross-foot',  desc:'SUM across and down, tie out the corner' },
    balance:    { name:'Balance',  label:'Make it balance',     tab:'Balance',     desc:'2 yrs SUM-footed both sides, check at zero, totals dressed' },
    audit:      { name:'The 4am pass', label:'The 4am pass \u2014 find what\u2019s broken', tab:'Audit', desc:'Three planted breaks in a real P&L \u2014 find them all' },
    balcheck:   { name:'Tie-out',    label:'Make it tie \u2014 hunt the break', tab:'Tie-out', desc:'The check row was pasted over \u2014 resurrect it, run both breaks down' },
    stalelink:  { name:'Stale Links',label:'Re-point the stale links', tab:'Stale', desc:'Assumptions moved to v2 \u2014 three cells still read the dead block' },
    wirewalk:   { name:'Trace',    label:'Walk the wire',       tab:'Trace',   desc:'Ctrl+[ rides to the source, Ctrl+] rides back \u2014 fix it upstream' },
    hunt:       { name:'Audit',    label:'Hunt the hardcodes',  tab:'Audit',   desc:'F5 \u2192 special \u2192 constants \u2014 every number a formula should own lights up' },
    wrapfix:    { name:'IFERROR',  label:'Wrap it or fix it',   tab:'IFERROR', desc:'Wrap the truly missing, fix the merely broken \u2014 never bury errors' },
    signerr:    { name:'Sign Sweep', label:'Flip the signs back', tab:'Signs', desc:'Pasted costs came in positive \u2014 sweep the signs, prove EBIT, margin it' },
    percent:    { name:'% of rev', label:'Common-size both statements', tab:'Common-size', desc:'Both blocks ÷ their OWN revenue, $-locked so the fill can’t drift' },
    intsched:   { name:'Interest', label:'Run the interest schedule', tab:'Interest', desc:'Roll the debt, then rate × the opening balance is cash interest — and EBITDA ÷ interest is the coverage the covenant reads' },
    schedule:   { name:'Schedule', label:'Roll it forward',     tab:'Schedule',    desc:'5-yr roll: linked openings + the accumulated-dep memo' },
    comps:      { name:'Comps',    label:'Run the comps',       tab:'Comps',       desc:'Build the multiples, read the tape, land per share and premium' },

    // Lookups
    isbuild:    { name:'IS Build',  label:'Build the income statement', tab:'IS Build',  desc:'5-yr IS: anchored drivers, margin row as %, bottom line ruled' },
    bsbuild:    { name:'BS Build',  label:'Balance the balance sheet',  tab:'BS Build',  desc:'3 yrs: SUM both sides, RE roll filled across, dressed to zero' },
    nwcsched:   { name:'NWC Sched.',label:'Roll working capital',       tab:'NWC',       desc:'Type the drivers, paint them blue, roll NWC five years' },
    threestmt:  { name:'3-Statement',label:'Tie the three statements',  tab:'3-Stmt',    desc:'3 yrs × 3 links, checks at zero, totals dressed to ship' },
    cfslink:    { name:'CFS Link',  label:'Link the cash flow statement',tab:'CFS Link', desc:'5-yr corkscrew + conversion memo as %, close ruled off' },
    debtsched:  { name:'Debt Sched.',label:'Run the debt schedule',      tab:'Debt',     desc:'Type the rate, paint it blue, run the 5-yr sweep corkscrew' },
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
  /* r215 (Wolf): each shipped version pays a ONE-TIME xp bounty (awarded once, on top of the
     per-solve xp + the medal) so the campaign reads as the spine of progression, not a side
     feature. Escalating to reward the climb; the Models/Full-Builds versions carry the fat
     bounties that funnel toward PRO. */
  // r242 \u2014 chapters mirror the v2.1 groups 1:1 (the campaign IS the spine). Escalating XP:
  // the free tiers (c1-c3) hook, the PRO tiers (c5-c8) carry the fat bounties that funnel to PRO.
  chapters: [
    { id:'c1', name:'v1 \u00b7 Foundations',            badge:'\ud83c\udf93', xp:150, keys:['navigation','blocksel','filldr','pastes'] },
    { id:'c2', name:'v2 \u00b7 Formatting',             badge:'\ud83c\udfa8', xp:200, keys:['housestyle','dress','gauntlet'] },
    { id:'c3', name:'v3 \u00b7 Formulas I',             badge:'\u2797',        xp:250, keys:['margin','growth','anchor','sumif'] },
    { id:'c4', name:'v4 \u00b7 Data & Lookups',         badge:'\ud83d\udd0e', xp:300, keys:['sort','recon','lookup','lookup2'] },
    { id:'c5', name:'v5 \u00b7 Formulas II',            badge:'\ud83e\uddee', xp:450, keys:['audit','balance','hunt','versionup'] },
    { id:'c6', name:'v6 \u00b7 Models I \u00b7 Valuation',    badge:'\ud83c\udfe6', xp:600, keys:['wacc','fcfbuild','dcf','comps'] },
    { id:'c7', name:'v7 \u00b7 Models II \u00b7 Credit',      badge:'\ud83d\udcc9', xp:750, keys:['lbo','revolver','intsched','debtsched'] },
    { id:'c8', name:'v8 \u00b7 Full Builds',            badge:'\ud83c\udfd7', xp:1000, keys:['threestmt','dcfbuild','lbobuild','opmodel'] },
  ],
  finisher: { badge:'\u2b50', name:'Model complete', xp:600 },
};

/* ---- TIME BANDS (r256, Wolf) — per-drill speed medals anchored to the (now brutal)
   par. A clean solve earns Cleared; the speed tiers key off time÷par so they scale
   with the drill. ELITE = beat par. One-time xp bounty when you reach a new band —
   the "chase the next tier" loop the tight par sets up. The global/competitive layer
   stays the leaderboard + rank tiers (no redundant top-X% badge). ---- */
window.HK_BAND = {
  // ordered easiest → hardest; `max` = the time÷par ceiling to earn it (lower is faster)
  BANDS: [
    { i:1, key:'cleared', name:'Cleared', color:'#8b909a', max:Infinity },
    { i:2, key:'bronze',  name:'Bronze',  color:'#c8894e', max:2.0 },
    { i:3, key:'silver',  name:'Silver',  color:'#aeb6c0', max:1.5 },
    { i:4, key:'gold',    name:'Gold',    color:'#e0b341', max:1.15 },
    { i:5, key:'elite',   name:'Elite',   color:'#b98bff', max:1.0 },
  ],
  XP: { cleared:0, bronze:15, silver:30, gold:60, elite:120 },   // one-time, cumulative deltas paid on reach
  // best band earned for a given PB (seconds) against par (seconds); null if unsolved
  of(pbSec, parSec){
    if(pbSec==null || !isFinite(pbSec) || !parSec) return null;
    const r = pbSec/parSec;
    for(let j=this.BANDS.length-1;j>=0;j--){ if(r<=this.BANDS[j].max) return this.BANDS[j]; }
    return this.BANDS[0];
  },
  // the next tier up + the time you'd need to hit it (null at Elite)
  next(parSec, curBand){
    const i = curBand ? curBand.i : 0;
    const nb = this.BANDS.find(b=>b.i===i+1);
    if(!nb || !isFinite(nb.max)) return nb ? {band:nb, needSec:parSec*nb.max} : null;
    return { band:nb, needSec:parSec*nb.max };
  },
  // total one-time xp earned for holding a band (sum of deltas up to it)
  xpFor(band){ if(!band) return 0; let t=0; for(const b of this.BANDS){ t+=this.XP[b.key]||0; if(b.i===band.i) break; } return t; },
};

/* ---- par snapshot (auto-extracted from CHALLENGES; regen when pars change) ---- */
// ---- ADVANCED TIER / PAYWALL SCAFFOLD ----
// enabled:false during beta. Advanced groups carry the \u25c6 badge and section-leader
// boards now; flipping enabled:true (post-beta, post-internship, Stripe LIVE keys)
// gates these groups behind entitlement. Everything else stays free.
window.HOTKEY_PREMIUM = { enabled:false, groups:['Formulas II','Models I','Models II','Full Builds'] };

window.HOTKEY_PARS = {"navigation":17,"modeltour":53,"blocksel":46,"filldr":37,"pastes":40,"rowops":26,"colops":16,"editfix":39,"undo":10,"copyover":13,"housestyle":47,"ruleoff":29,"ruleaudit":18,"dress":46,"typeset":15,"decimals":18,"center":18,"autofit":15,"combo":24,"gauntlet":63,"margin":23,"foot":11,"percent":17,"growth":36,"cagr":55,"anchor":16,"bridge":10,"sumif":57,"rollup":65,"fxconvert":35,"cases":94,"sort":10,"scrub":21,"recon":77,"grpfold":15,"filterpass":13,"unhide":15,"lookup":32,"lookup2":48,"drill":18,"series":14,"audit":34,"triage":27,"wrapfix":70,"balcheck":28,"stalelink":28,"wirewalk":10,"hunt":45,"signerr":22,"versionup":33,"balance":39,"wacc":78,"fcfbuild":32,"dcf":62,"comps":66,"txncomps":36,"football":39,"dcfsens":19,"retbridge":65,"accdil":50,"sourcesuses":55,"lbo":54,"revolver":41,"schedule":35,"intsched":29,"waterfall":64,"cascade":94,"wk13":45,"liqbridge":40,"covtable":45,"debtsched":73,"isbuild":51,"bsbuild":60,"cfslink":36,"nwcsched":74,"threestmt":59,"opmodel":55,"dcfbuild":76,"lbobuild":61,"debtblock":57,"dashcover":32};

/* ---- ACHIEVEMENTS: long-grind goals beyond the campaign. Each test() gets
   ctx = {pb, pars, runs (my posted), streak, solves, crowns, podiums, att, menuOrder}
   and returns {done, prog, goal}. Rendered as medals on the player card. ---- */
window.HOTKEY_ACHIEVEMENTS = [
  /* ---- r79: the creative twenty (incl. anti-achievements — mouse slips, slow burns) ---- */
  { id:'x_tour',   glyph:'c1', name:'Tourist',            desc:'Attempt 10 different drills',            test:c=>({done:c.att>=10, prog:Math.min(c.att,10), goal:10}) },
  { id:'x_comp',   glyph:'c1', tier:'e', name:'Completionist',      desc:'Attempt every drill on the board',       test:c=>({done:c.att>=c.menuOrder.length, prog:c.att, goal:c.menuOrder.length}) },
  { id:'x_sub5',   glyph:'spd', tier:'r', name:'Blink',             desc:'Finish any drill in under 5 seconds',    test:c=>{ const ok=(c.runs||[]).some(r=>r.time_ms<5000); return {done:ok, prog:ok?1:0, goal:1}; } },
  { id:'x_zero',   glyph:'gnt', tier:'r', name:'No Wasted Keys',    desc:'Match the optimal keystroke count exactly', test:c=>{ const ok=(c.runs||[]).some(r=>r.optimal&&r.keystrokes===r.optimal); return {done:ok, prog:ok?1:0, goal:1}; } },
  { id:'x_econ',   glyph:'gnt', tier:'e', name:'Economist',         desc:'10 runs at or under optimal keys',       test:c=>{ const n=(c.runs||[]).filter(r=>r.optimal&&r.keystrokes<=r.optimal).length; return {done:n>=10, prog:Math.min(n,10), goal:10}; } },
  { id:'x_slow',   glyph:'day', name:'Thorough',          desc:'Take over a minute on a single solve',   test:c=>({done:(c.slowWins||0)>=1, prog:Math.min(c.slowWins||0,1), goal:1}) },
  { id:'x_mouse1', glyph:'c7', name:'Old Habits',         desc:'Ruin a run with the mouse',              test:c=>({done:(c.mouseRuns||0)>=1, prog:Math.min(c.mouseRuns||0,1), goal:1}) },
  { id:'x_mouse10',glyph:'c7', name:'The Mouse Is a Lifestyle', desc:'Ruin 10 runs with the mouse',      test:c=>({done:(c.mouseRuns||0)>=10, prog:Math.min(c.mouseRuns||0,10), goal:10}) },
  { id:'x_night',  glyph:'day', tier:'r', name:'Night Shift',       desc:'Clean solve between midnight and 4am',   test:c=>({done:!!c.nightWin, prog:c.nightWin?1:0, goal:1}) },
  { id:'x_dawn',   glyph:'day', tier:'r', name:'Dawn Patrol',       desc:'Clean solve between 5 and 7am',          test:c=>({done:!!c.dawnWin, prog:c.dawnWin?1:0, goal:1}) },
  { id:'x_wknd',   glyph:'day', name:'Weekend Warrior',   desc:'Clean solve on a Saturday or Sunday',    test:c=>({done:!!c.weekendWin, prog:c.weekendWin?1:0, goal:1}) },
  { id:'x_run200', glyph:'vol', tier:'e', name:'Volume Business',   desc:'200 recorded runs',                      test:c=>{ const n=(c.runs||[]).length; return {done:n>=200, prog:Math.min(n,200), goal:200}; } },
  { id:'x_found',  glyph:'c6', tier:'r', name:'Foundations Poured', desc:'PB on every Foundations drill',          test:c=>{ const ks=(c.groups['Foundations']||[]); const n=ks.filter(k=>c.pb[k]!==undefined).length; return {done:ks.length>0&&n>=ks.length, prog:n, goal:ks.length||1}; } },
  { id:'x_stack',  glyph:'c3', tier:'r', name:'Full Stack',         desc:'At least one PB in every group',         test:c=>{ const gs=Object.keys(c.groups); const n=gs.filter(g=>(c.groups[g]||[]).some(k=>c.pb[k]!==undefined)).length; return {done:n>=gs.length, prog:n, goal:gs.length}; } },
  { id:'x_par25',  glyph:'spd', tier:'e', name:'Par Machine',       desc:'Beat par on 25 different drills',        test:c=>{ const n=c.menuOrder.filter(k=>c.pb[k]!==undefined&&c.pars[k]&&c.pb[k]<=c.pars[k]).length; return {done:n>=25, prog:Math.min(n,25), goal:25}; } },
  { id:'x_pb40',   glyph:'c3', tier:'e', name:'Collector',          desc:'Hold a PB on 40 different drills',       test:c=>{ const n=c.menuOrder.filter(k=>c.pb[k]!==undefined).length; return {done:n>=40, prog:Math.min(n,40), goal:40}; } },
  { id:'spd1', glyph:'spd', name:'Under Par',        desc:'Beat par on any drill',                 test:c=>{ const n=c.menuOrder.filter(k=>c.pb[k]!==undefined&&c.pars[k]&&c.pb[k]<=c.pars[k]).length; return {done:n>=1, prog:Math.min(n,1), goal:1}; } },
  { id:'spd2', glyph:'spd', tier:'r', name:'Metronome',        desc:'Beat par on 10 different drills',       test:c=>{ const n=c.menuOrder.filter(k=>c.pb[k]!==undefined&&c.pars[k]&&c.pb[k]<=c.pars[k]).length; return {done:n>=10, prog:Math.min(n,10), goal:10}; } },
  { id:'spd3', glyph:'spd', tier:'l', name:'Untouchable',      desc:'Beat par on EVERY drill',               test:c=>{ const n=c.menuOrder.filter(k=>c.pb[k]!==undefined&&c.pars[k]&&c.pb[k]<=c.pars[k]).length; return {done:n>=c.menuOrder.length, prog:n, goal:c.menuOrder.length}; } },
  { id:'vol1', glyph:'vol', name:'Warm Hands',       desc:'100 clean solves',                      test:c=>({done:c.solves>=100, prog:Math.min(c.solves,100), goal:100}) },
  { id:'vol2', glyph:'vol', tier:'e', name:'Grinder',          desc:'500 clean solves',                      test:c=>({done:c.solves>=500, prog:Math.min(c.solves,500), goal:500}) },
  { id:'vol3', glyph:'vol', tier:'l', name:'Ten Thousand Keys',desc:'2,000 clean solves',                    test:c=>({done:c.solves>=2000, prog:Math.min(c.solves,2000), goal:2000}) },
  { id:'str1', glyph:'str', name:'Business Week',            desc:'7-day streak',                          test:c=>({done:c.streak>=7, prog:Math.min(c.streak,7), goal:7}) },
  { id:'str2', glyph:'str', tier:'e', name:'Quarter Close',           desc:'30-day streak',                         test:c=>({done:c.streak>=30, prog:Math.min(c.streak,30), goal:30}) },
  { id:'str3', glyph:'str', tier:'l', name:'Institution',      desc:'100-day streak',                        test:c=>({done:c.streak>=100, prog:Math.min(c.streak,100), goal:100}) },
  { id:'crn1', glyph:'crn', tier:'r', name:'First Blood',      desc:'Hold #1 on any board',                  test:c=>({done:c.crowns>=1, prog:Math.min(c.crowns,1), goal:1}) },
  { id:'crn2', glyph:'crn', tier:'e', name:'Corner Office',          desc:'Hold 5 crowns at once',                 test:c=>({done:c.crowns>=5, prog:Math.min(c.crowns,5), goal:5}) },
  { id:'day1', glyph:'day', name:'Regular',          desc:'Run 10 daily challenges',               test:c=>{ const n=c.runs.filter(r=>(r.challenge||'').indexOf('daily-')===0).length; return {done:n>=10, prog:Math.min(n,10), goal:10}; } },
  { id:'day2', glyph:'day', tier:'e', name:'Fixture',          desc:'Run 50 daily challenges',               test:c=>{ const n=c.runs.filter(r=>(r.challenge||'').indexOf('daily-')===0).length; return {done:n>=50, prog:Math.min(n,50), goal:50}; } },
  { id:'gnt1', glyph:'gnt', tier:'r', name:'Gauntlet Runner',  desc:'Post all 5 legs of a weekly gauntlet',  test:c=>{ const wk={}; c.runs.forEach(r=>{ const m=/^wk-(\d{4}-\d{2})-/.exec(r.challenge||''); if(m){ (wk[m[1]]=wk[m[1]]||new Set()).add(r.challenge); } }); const best=Math.max(0,...Object.values(wk).map(s=>s.size)); return {done:best>=5, prog:Math.min(best,5), goal:5}; } },
  { id:'day3', glyph:'day', tier:'r', name:'Deal Sprint',      desc:'10 posted runs in a single day',        test:c=>{ const per={}; c.runs.forEach(r=>{ const d=String(r.created_at||'').slice(0,10); if(d) per[d]=(per[d]||0)+1; }); const best=Math.max(0,...Object.values(per)); return {done:best>=10, prog:Math.min(best,10), goal:10}; } },
  { id:'day4', glyph:'day', tier:'e', name:'Live Deal',        desc:'25 posted runs in a single day',        test:c=>{ const per={}; c.runs.forEach(r=>{ const d=String(r.created_at||'').slice(0,10); if(d) per[d]=(per[d]||0)+1; }); const best=Math.max(0,...Object.values(per)); return {done:best>=25, prog:Math.min(best,25), goal:25}; } },
  { id:'wkd1', glyph:'day', tier:'r', name:'Full Weekend',  desc:'Post runs on both Saturday and Sunday of the same weekend', test:c=>{ const wk={}; c.runs.forEach(r=>{ const t=new Date(r.created_at||0); const day=t.getDay(); if(day===0||day===6){ const sat=new Date(t); sat.setDate(t.getDate()-(day===0?1:0)); const key=sat.toISOString().slice(0,10); wk[key]=(wk[key]||0)|(day===6?1:2); } }); const hit=Object.values(wk).some(v=>v===3); return {done:hit, prog:hit?1:0, goal:1}; } },
  { id:'grp1', glyph:'spd', tier:'r', name:'Solid Foundation', desc:'Beat par on every Foundations drill',   test:c=>{ const ks=(c.groups&&c.groups['Foundations'])||[]; const n=ks.filter(k=>c.pb[k]!==undefined&&c.pars[k]&&c.pb[k]<=c.pars[k]).length; return {done:ks.length>0&&n>=ks.length, prog:n, goal:ks.length||1}; } },
  { id:'grp2', glyph:'crn', tier:'e', name:'Model Citizen',    desc:'Beat par on every Models drill',        test:c=>{ const ks=[...((c.groups&&c.groups['Models I'])||[]),...((c.groups&&c.groups['Models II'])||[])]; const n=ks.filter(k=>c.pb[k]!==undefined&&c.pars[k]&&c.pb[k]<=c.pars[k]).length; return {done:ks.length>0&&n>=ks.length, prog:n, goal:ks.length||1}; } },
  { id:'grp3', glyph:'c3',   tier:'e', name:'Formula Desk',    desc:'Beat par on every Formulas drill',      test:c=>{ const ks=[...((c.groups&&c.groups['Formulas I'])||[]),...((c.groups&&c.groups['Formulas II'])||[])]; const n=ks.filter(k=>c.pb[k]!==undefined&&c.pars[k]&&c.pb[k]<=c.pars[k]).length; return {done:ks.length>0&&n>=ks.length, prog:n, goal:ks.length||1}; } },
  { id:'grp4', glyph:'sheet', tier:'l', name:'Master Builder',  desc:'Beat par on every Full Builds drill',   test:c=>{ const ks=(c.groups&&c.groups['Full Builds'])||[]; const n=ks.filter(k=>c.pb[k]!==undefined&&c.pars[k]&&c.pb[k]<=c.pars[k]).length; return {done:ks.length>0&&n>=ks.length, prog:n, goal:ks.length||1}; } },
  { id:'spd4', glyph:'spd', tier:'r', name:'Half-Par Club',    desc:'Clear any drill in under half its par', test:c=>{ const hit=c.menuOrder.some(k=>c.pb[k]!==undefined&&c.pars[k]&&c.pb[k]<=c.pars[k]/2); return {done:hit, prog:hit?1:0, goal:1}; } },
  { id:'gnt2', glyph:'gnt', tier:'e', name:'Season Ticket',    desc:'Post gauntlet legs in 4 different weeks', test:c=>{ const wks=new Set(); c.runs.forEach(r=>{ const m=/^wk-(\d{4}-\d{2})-/.exec(r.challenge||''); if(m) wks.add(m[1]); }); return {done:wks.size>=4, prog:Math.min(wks.size,4), goal:4}; } },
  /* r151: DRIP RUNGS — the ladders had deserts (1 crown then 5; 100 solves then
     500; 10 dailies then 50). These fill the gaps so an engaged week always has a
     medal in reach. Fillers are deliberately common-tier: they're cadence, not glory. */
  { id:'vol0',  glyph:'vol',  name:'Opening Bell',    desc:'25 clean solves',                        test:c=>({done:c.solves>=25, prog:Math.min(c.solves,25), goal:25}) },
  { id:'vol1b', glyph:'vol',  tier:'r', name:'Deal Flow', desc:'250 clean solves',                   test:c=>({done:c.solves>=250, prog:Math.min(c.solves,250), goal:250}) },
  { id:'str0',  glyph:'str',  name:'Back Tomorrow',   desc:'3-day streak',                           test:c=>({done:c.streak>=3, prog:Math.min(c.streak,3), goal:3}) },
  { id:'day0',  glyph:'day',  name:'Morning Person',  desc:'Run 3 daily challenges',                 test:c=>{ const n=c.runs.filter(r=>(r.challenge||'').indexOf('daily-')===0).length; return {done:n>=3, prog:Math.min(n,3), goal:3}; } },
  { id:'par5',  glyph:'spd',  name:'Finding the Line',desc:'Beat par on 5 different drills',         test:c=>{ const n=c.menuOrder.filter(k=>c.pb[k]!==undefined&&c.pars[k]&&c.pb[k]<=c.pars[k]).length; return {done:n>=5, prog:Math.min(n,5), goal:5}; } },
  { id:'crn3',  glyph:'crn',  tier:'r', name:'Land Grab', desc:'Hold 3 crowns at once',              test:c=>({done:c.crowns>=3, prog:Math.min(c.crowns,3), goal:3}) },
  { id:'pb20',  glyph:'c3',   name:'Shelf Space',     desc:'Hold a PB on 20 different drills',       test:c=>{ const n=c.menuOrder.filter(k=>c.pb[k]!==undefined).length; return {done:n>=20, prog:Math.min(n,20), goal:20}; } },
  { id:'att25', glyph:'c1',   name:'Field Coverage',  desc:'Attempt 25 different drills',            test:c=>({done:c.att>=25, prog:Math.min(c.att,25), goal:25}) },
  { id:'key25', glyph:'keys', tier:'r', name:'Piano Hands', desc:'25,000 keystrokes in clean runs',  test:c=>({done:(c.keysLifetime||0)>=25000, prog:Math.min(c.keysLifetime||0,25000), goal:25000}) },
  /* r150: the new class — morning sheet, races, freezes, RX pack, house style, plugin-era
     chords. New glyphs (rx/flag/sheet/ice/map/brush/keys) live in themes.js hkBadge. */
  { id:'rx1',  glyph:'rx',    tier:'e', name:'The RX Desk',      desc:'Clear revolver, waterfall, cascade and the 13-week', test:c=>{ const ks=['revolver','waterfall','cascade','wk13']; const n=ks.filter(k=>c.pb[k]!==undefined).length; return {done:n>=ks.length, prog:n, goal:ks.length}; } },
  { id:'hse1', glyph:'brush', tier:'r', name:'House Style',      desc:'Beat par on House Style — the senior’s pass', test:c=>{ const ok=c.pb['housestyle']!==undefined&&c.pars['housestyle']&&c.pb['housestyle']<=c.pars['housestyle']; return {done:ok, prog:ok?1:0, goal:1}; } },
  { id:'rce1', glyph:'flag',  tier:'r', name:'Called Out',       desc:'Win a challenge race',                   test:c=>({done:(c.raceWins||0)>=1, prog:Math.min(c.raceWins||0,1), goal:1}) },
  { id:'rce2', glyph:'flag',  tier:'e', name:'Undefeated',       desc:'Win 5 challenge races',                  test:c=>({done:(c.raceWins||0)>=5, prog:Math.min(c.raceWins||0,5), goal:5}) },
  { id:'sht1', glyph:'sheet', tier:'r', name:'Clean Sheet',      desc:'Clear the morning sheet — all three',    test:c=>({done:(c.sheetClears||0)>=1, prog:Math.min(c.sheetClears||0,1), goal:1}) },
  { id:'sht2', glyph:'sheet', tier:'e', name:'Standing Order',   desc:'Clear 10 morning sheets',                test:c=>({done:(c.sheetClears||0)>=10, prog:Math.min(c.sheetClears||0,10), goal:10}) },
  { id:'ice1', glyph:'ice',   tier:'r', name:'Ice in the Veins', desc:'Bank a streak freeze (every 5-day streak earns one)', test:c=>({done:(c.frzBanked||0)>=1, prog:Math.min(c.frzBanked||0,1), goal:1}) },
  { id:'nav2', glyph:'map',   tier:'r', name:'Tour Guide',       desc:'Beat par on both navigation drills',     test:c=>{ const ks=['navigation','modeltour']; const n=ks.filter(k=>c.pb[k]!==undefined&&c.pars[k]&&c.pb[k]<=c.pars[k]).length; return {done:n>=ks.length, prog:n, goal:ks.length}; } },
  { id:'kbd1', glyph:'keys',  tier:'r', name:'Chord Library',    desc:'Use 25 distinct shortcuts in clean runs', test:c=>({done:(c.chordKinds||0)>=25, prog:Math.min(c.chordKinds||0,25), goal:25}) },
  { id:'bld1', glyph:'c8',    tier:'e', name:'Shipped It',       desc:'Beat par on the three-statement capstone', test:c=>{ const ok=c.pb['threestmt']!==undefined&&c.pars['threestmt']&&c.pb['threestmt']<=c.pars['threestmt']; return {done:ok, prog:ok?1:0, goal:1}; } },
];

/* ---- group color identity: one muted hue per skill family. Used as accents only
   (left borders, label tints, badge strokes) — never full fills. ---- */
window.HOTKEY_GROUP_COLORS = {
  'Foundations':'#8ab4ff', 'Formatting':'#d9a441', 'Formulas I':'#e0879e',
  'Data & Lookups':'#7fd4c1', 'Formulas II':'#e06a86', 'Models I':'#c9a2e8',
  'Models II':'#a97fd6', 'Full Builds':'#e3b341', 'More':'#8b8e94'
};

/* ---- PLUGIN KEY LAYERS: curated Macabacus + FactSet defaults for IB workflows.
   Sources: Macabacus official shortcuts cheat sheet + Quick Start Guide (defaults;
   remappable in their Shortcut Manager — add-in conflicts are common per their docs);
   FactSet published hot-key sheet + desk convention (remappable: FactSet ribbon →
   Settings → Manage Hotkeys). inEngine:true = the trainer accepts it under that
   keyboard profile today. ---- */
window.HOTKEY_PLUGIN_LAYERS = {
  macabacus: { name:'Macabacus', color:'#8ab4ff', note:'Defaults verified against the CFI\u00d7Macabacus cheat sheet (Jul 2026) \u2014 number/border/color cycles piggyback on the native Excel chords; most desks remap some in Shortcut Manager.',
    keys:[
      {k:'Ctrl+Shift+R', a:'Fast Fill Right \u2014 fills to the data edge from one cell', cat:'Modeling', inEngine:true},
      {k:'Ctrl+Shift+D', a:'Fast Fill Down', cat:'Modeling', inEngine:true},
      {k:'Ctrl+Shift+L', a:'Fast Fill Left', cat:'Modeling', inEngine:true},
      {k:'Ctrl+Alt+A', a:'AutoColor Selection \u2014 inputs blue, formulas black', cat:'Colors', inEngine:true},
      {k:'Ctrl+Alt+S', a:'AutoColor Sheet', cat:'Colors', inEngine:true},
      {k:'Ctrl+Alt+Q', a:'AutoColor Workbook', cat:'Colors'},
      {k:'Ctrl+Shift+V', a:'Paste Values', cat:'Paste', inEngine:true},
      {k:'Ctrl+Shift+1', a:'General Number Cycle', cat:'Numbers', inEngine:true},
      {k:'Ctrl+Alt+Shift+2', a:'Date Cycle', cat:'Numbers'},
      {k:'Ctrl+Shift+4', a:'Local Currency Cycle', cat:'Numbers', inEngine:true},
      {k:'Ctrl+Shift+5', a:'Percent Cycle', cat:'Numbers', inEngine:true},
      {k:'Ctrl+Shift+8', a:'Multiple Cycle (x)', cat:'Numbers'},
      {k:'Ctrl+,', a:'Increase Decimals', cat:'Numbers'},
      {k:'Ctrl+.', a:'Decrease Decimals', cat:'Numbers'},
      {k:'Ctrl+Shift+;', a:'Blue-Black font toggle', cat:'Colors'},
      {k:'Ctrl+Alt+Shift+U', a:'Underline Cycle (single \u2192 accounting)', cat:'Fonts'},
      {k:'Ctrl+Shift+C', a:'Center Cycle (incl. center-across-selection)', cat:'Alignment'},
      {k:'Ctrl+Shift+7', a:'Outside Border Cycle', cat:'Borders'},
      {k:'Ctrl+Shift+Down', a:'Bottom Border Cycle', cat:'Borders'},
      {k:'Ctrl+Shift+[', a:'Pro Precedents \u2014 step through formula inputs, across tabs', cat:'Auditing'},
      {k:'Ctrl+Shift+]', a:'Pro Dependents', cat:'Auditing'},
      {k:'Ctrl+Alt+G', a:'Toggle gridlines', cat:'View'},
      {k:'Ctrl+Alt+=', a:'Zoom in (5% steps)', cat:'View'},
      {k:'Ctrl+Alt+-', a:'Zoom out', cat:'View'},
    ]},
  factset: { name:'FactSet', color:'#e0879e', note:'Verified against FactSet\u2019s published Hot Keys sheet (Jul 2026) \u2014 remappable via FactSet ribbon \u2192 Settings \u2192 Manage Hotkeys.',
    keys:[
      {k:'Ctrl+Alt+Shift+K', a:'Fill Right (FDS) \u2014 copy with links', cat:'Modeling', inEngine:true},
      {k:'Ctrl+Alt+Shift+J', a:'Fill Left (FDS)', cat:'Modeling', inEngine:true},
      {k:'Ctrl+Alt+Shift+D', a:'Fill Down (FDS)', cat:'Modeling', inEngine:true},
      {k:'Ctrl+Alt+Shift+U', a:'Fill Up (FDS)', cat:'Modeling', inEngine:true},
      {k:'Ctrl+Shift+R', a:'Smart Copy Right \u2014 copies the formula intelligently', cat:'Modeling'},
      {k:'Ctrl+Shift+D', a:'Smart Copy Down', cat:'Modeling'},
      {k:'Ctrl+Alt+E', a:'AutoColor \u2014 recolors by content: blue inputs, green links, black formulas', cat:'Colors', inEngine:true},
      {k:'Ctrl+Alt+A', a:'AutoColor Selection', cat:'Colors'},
      {k:'Ctrl+;', a:'Blue-Black SmartCycle \u2014 the font blue/black toggle', cat:'Colors'},
      {k:'Ctrl+Shift+1', a:'General Number SmartCycle', cat:'Numbers'},
      {k:'Ctrl+Shift+2', a:'Date SmartCycle', cat:'Numbers'},
      {k:'Ctrl+Shift+4', a:'Currency SmartCycle', cat:'Numbers', inEngine:true},
      {k:'Ctrl+Shift+5', a:'Percent SmartCycle', cat:'Numbers', inEngine:true},
      {k:'Ctrl+Shift+8', a:'Multiple SmartCycle (7.5x)', cat:'Numbers'},
      {k:'Ctrl+Shift+Y', a:'Binary SmartCycle (on/off, yes/no)', cat:'Numbers'},
      {k:'Ctrl+,', a:'Increase Decimal', cat:'Numbers'},
      {k:'Ctrl+.', a:'Decrease Decimal', cat:'Numbers'},
      {k:'Ctrl+Alt+,', a:'Copy Exact Formulas \u2014 capture for pasting elsewhere', cat:'Paste'},
      {k:'Ctrl+Alt+.', a:'Paste Exact Formulas \u2014 no reference adjustment', cat:'Paste'},
      {k:'Ctrl+Alt+K', a:'Paste Row/Column Info \u2014 size, hidden + grouped state', cat:'Utilities'},
    ]},
};

/* ---- THE PRO OFFER (r156) — single source; hkProSheet in nav.js renders it.
   DECIDED monetization: subscription; free = the level-gated progression path;
   PRO = the whole catalog from Level 1 + plugin layers + deep analytics +
   cosmetics. Prices are placeholders on Stripe TEST MODE — Wolf sets real
   pricing at launch; beta:true keeps every PRO feature ON for everyone. ---- */
/* ---- PROGRESSION GATES (r158) — the free spine. Advanced groups unlock by
   LEVEL (volume: you showed up) AND PACE CLEARS (skill: par x1.5 clean — slow
   grinding alone never opens the door), OR by shipping the campaign versions
   that cover everything before the group (pure skill path), OR grandfathered
   by an existing PB in the group. Real PRO entitlement skips; the gates run
   DURING BETA — the ladder is the game, not the paywall. ---- */
window.HOTKEY_GATES = {
  PACE: 1.5,   // = HOTKEY_CAMPAIGN.GATE — one definition of "cleared at pace"
  // r221 (Wolf): the level ladder now gates EVERY group past Foundations, escalating —
  // finish Foundations and the wall goes up: keep grinding for the next tier (levels +
  // pace-clears) OR ship that stretch of the campaign OR go PRO (which skips every gate).
  // The funnel: Foundations is the free hook; the climb after it converts. Each group opens
  // on (level AND pace-clears) OR the campaign chapters below OR a real PRO entitlement.
  // chapters = the campaign chapters BEFORE this group (never the group's own — that would be
  // circular: you can't ship a locked group's chapter). Shipping them is the "pure speed, no
  // waiting" bypass alongside the level+clears path.
  // r242 — v2.1 gates. Foundations / Formatting / Formulas I are FREE (no entry = open).
  // Data & Lookups is a level bridge (gated, NOT pro). Formulas II / Models I / Models II /
  // Full Builds are PRO (see HOTKEY_PREMIUM) — the level+clears path or the chapters below
  // is the beta bypass; a real PRO entitlement skips all of it.
  groups: {
    'Data & Lookups': { lvl:3,  clears:8,  chapters:['c1','c2','c3'] },
    'Formulas II':    { lvl:5,  clears:12, chapters:['c1','c2','c3','c4'] },
    'Models I':       { lvl:7,  clears:18, chapters:['c1','c2','c3','c4','c5'] },
    'Models II':      { lvl:9,  clears:26, chapters:['c1','c2','c3','c4','c5','c6'] },
    'Full Builds':    { lvl:11, clears:32, chapters:['c1','c2','c3','c4','c5','c6','c7'] },
  },
};

window.HOTKEY_PRO = {
  beta: true,
  // Wolf-decided (r157): MONTHLY leads ("$7 — crazy ROI on the time you save");
  // SEASON = one recruiting cycle / pre-summer ramp, lightly discounted. No annual —
  // this audience trains in cycles, not years.
  plans: [
    { id:'monthly', price:'$7',  cap:'per month' },
    { id:'season',  price:'$19', cap:'per season \u00b7 3 months \u00b7 one recruiting cycle' },
  ],
  tagline: 'Train like the desk is watching.',
  features: [
    ['The full catalog, day one',
     'Models + Full Builds from Level 1 \u2014 DCF, LBO, debt schedules, three-statement builds',
     'unlocks as you level'],
    ['The Weakness Queue',
     'the site builds your session \u2014 slowest vs par, never-cleared, gone-stale drills first',
     'pick your own drills'],
    ['Plugin keyboard layers',
     'Macabacus + FactSet shortcut profiles on every drill',
     'native Excel only'],
    ['Ghost replays',
     'race a live ghost of your PB run \u2014 its cursor glides the recorded path against your clock',
     'time + key-count pace only'],
    ['Deep analytics',
     'keystroke heatmap, speed-by-drill trends, percentile history',
     'core stats + PBs'],
    ['Pro cosmetics',
     'exclusive card flair + share-card themes + first access to new looks',
     'standard flair'],
  ],
  roadmap: ['Interview mode \u2014 timed assessment + report card', 'Season rewards track'],
  betaNote: 'Beta: PRO perks are free for everyone. The progression ladder still applies \u2014 the climb is the game \u2014 but at launch PRO opens the full catalog from Level 1. Beta players lock in founder pricing.',
};
