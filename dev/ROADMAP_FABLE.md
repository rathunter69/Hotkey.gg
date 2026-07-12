# ROADMAP — the next 30–40 passes (r136, Wolf-requested)
_The prioritized backlog for the Fable sessions ahead (~10 hours / 30–40 rounds).
Effort: S (<1 round) · M (1 round) · L (2+ rounds). [egress] = needs a session
where supabase.co is reachable. [Wolf] = blocked on Wolf's approval/notes.
Order within tiers is the recommended order. PROJECT_CONTEXT points here; the
old PIPELINE v2 section remains for history._

## TIER 0 — unblock the backend (first fresh-egress session, non-negotiable order)
1. **LIVE SMOKE TEST** [egress·M] — desks/school-tags/assignments RPCs, 8 seeded
   desks, claim/rotate/home-desk, report flow → dev/SMOKE_REPORT.md + fix rounds.
   Wolf distributes seed codes only after green.
2. **Edge Function deploy pass** [egress·M] — create-checkout (TEST) deployed +
   invoked end-to-end; scaffold for the streak-email function (T15).

## TIER 1 — monetization & progression core (the business; spec: MONETIZATION_DESIGN.md)
3. **Level-gate v1 (dark)** [M] — HOTKEY_UNLOCKS table, picker lock chips, gate
   modal w/ dual CTA, campaign skill-unlock path, beta toggle. Ships behind BETA_MODE.
4. **Season windows on boards** [M] — "this cycle / all time" chip, H1/H2 windows
   as pure query filters, archive view. Zero migration.
5. **Cycle-end rewards** [M] — placement cosmetic grants + season line on player
   card + LinkedIn rank PNG; season-end celebration moment.
6. **Pro wiring end-to-end** [egress·M] — entitlements live read, TEST checkout
   round-trip, account PRO card states (active/lapsed), webhook scaffold.
7. **Rank cycle refresh mechanics** [M] — placement recompute inside windows,
   provisional behavior at cycle start, "last cycle" chip on cards.

## TIER 2 — art system completion [Wolf-gated, fast once notes land]
8. **Medal port** [Wolf·M] — hkBadge v3: 6-grade system + G6 animation
   (reduced-motion gated) + per-achievement grade map (43) + card/stats surfaces.
9. **Rank plates** [Wolf·L] — 1024×640 card-hero art per tier (proto loop like
   emblems), wired into player card v3 hero + rank-up backdrop.
10. **Player card v3 assembly** [M] — plates + graded medals + share-PNG refresh
    (grades on the LinkedIn card = rarity flex).

## TIER 3 — structural systems (approved arc)
11. **S4 seed slice** [M] — seeded RNG per drill load (mulberry32), seed recorded
    on runs + local PBs. Unlocks 12 and true daily-challenge parity.
12. **S2 race-your-PB (ghost cursor)** [L] — selection-path traces ({k,t,a}),
    phantom-outline playback on the grid, "race your PB" on the results card
    (same-seed rebuild). Design settled r135 — no shadow engine.
13. **S4 full drillgen integration** [L] — 17 generators through ENGINE_ADAPTER;
    daily challenge switches to seeded generators; 200-seed harness in CI.
14. **S5 onboarding funnel v2** [M] — signup→placement→first-PB→share prompt;
    lite local funnel events to find the drop-off Wolf's buddy hit.
15. **S7 server streaks + re-engagement email** [egress·L] — Edge Function + cron;
    streak truth moves server-side (device streaks stay as cache).
16. **S8 usage-analytics admin view** [egress·M] — DAU/retention/drill-heatmap
    from runs; the B2B evidence page (service-role, not client).
17. **PWA v2** [M] — app shortcuts (Random drill / Daily / Boards), richer-install
    screenshots, launch_handler; SW offline-shell DECISION DOC only (cache risk).
18. **CI on push** [M] — GitHub Action: node --check all + extracted-inline checks
    + e2e demo-replay headless; blocks bad deploys at the repo edge.

## TIER 4 — audit & hardening passes (the compounding-quality tier)
19. **T7 finance-fidelity: Models** [M] — wacc/dcf/lbo/comps/txncomps/accdil/
    dcfsens/retbridge/football/schedule/revolver/sourcesuses vs the r132 taxonomy.
20. **T7 finance-fidelity: Full Builds** [M] — isbuild/debtsched/cfslink/bsbuild/
    nwcsched/threestmt/waterfall; balance/identity checks by construction.
21. **T7 finance-fidelity: Formulas + report** [M] — remainder of catalog; close
    with a findings table + copy sync (labels must support the math).
22. **Evaluator hardening** [M] — #VALUE! error states (kill silent-0), circular
    ref detection, text-in-range warnings (r95 accepted-shortcut queue).
23. **Guide/demo coverage audit** [M] — every guide vs live engine alternates,
    demo-vs-parKeys recompute sweep (r40 rule enforced portfolio-wide).
24. **Accessibility pass** [M] — modal focus traps, aria labels, contrast in both
    themes, reduced-motion coverage beyond the rank-up.
25. **Perf pass** [M] — leaderboard emblem render cost (hundreds of SVGs), boot
    profile, index.html size strategy (8.6k lines — split candidates).
26. **Mobile/responsive audit** [M] — boards/stats/account on phones, PWA mobile,
    the ≤740px gate card revisit.
27. **Copy/voice pass tranche 2** [S] — results/gate/upgrade/empty states in the
    associate voice (queued since Wave 2b).
28. **Fossil sweep rerun** [M] — r120 tooling + new classes from r133 (the
    dup-modal colony implies siblings: index settingsOpen vs nav's, orphan CSS
    from the excised card renderer, double-wired listeners).
29. **Security/RLS audit (static)** [M] — every table/policy/trigger read against
    the client code paths; invite gate, handle rules, report-flow abuse cases.
    Live probing rides an [egress] session.

## TIER 5 — features (retention/growth, post-core)
30. **Referrals** [M] — codes on player card + rank PNG (QR), credit table,
    account surface. Design first (ties into seasons rewards).
31. **Marathon rethink** [S] — verdict: rework or retire (Full Builds ate its
    lunch); session-modes audit rides along.
32. **Comments/citations engine turn** [L] — cell comments as engine layer →
    audit-trail drills ("source your numbers" — the RX habit).
33. **Daily challenge v2** [M] — seeded-generator dailies (needs 11), streak
    surface polish, share-card hook on daily results.
34. **Achievement expansion** [S] — grade map opens G5/G6 aspirational slots:
    finance-flavored legendaries ("Closed the books" — clear every Full Build
    under par in one day, etc.).
35. **Desks v3: captain dashboard** [M] — assignment completion tables, member
    activity, desk-vs-desk board (inter-desk rivalry).
36. **Practice analytics (Pro surface)** [M] — per-drill keystroke diff vs
    optimal path, trend lines on stats; the first real Pro-only screen.
37. **Sound pass** [S] — thock variants per theme, celebration audio, volume UX.
38. **Landing/SEO pass** [S] — og:image = rank-card PNG, meta descriptions,
    sitemap, About refresh for the desks/seasons era.

## Standing rules for every pass (unchanged)
Ship-as-script · node --check + extracted-inline + boot + e2e before push ·
cache-bump on shared-asset change · AUDIT.md entry per round · fossil doctrine
(no inlined copies; fallbacks never carry implementations) · pars recompute when
demos change · finance labels must support the math (r132).
