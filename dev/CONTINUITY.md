# HOTKEY.GG — PROJECT CONTINUITY BRIEF

_Written r449 (2026-07-29) at the close of the depth-pass campaign; §0 added r451 (2026-09-03). Purpose: condition a fresh
session — especially one working the BUSINESS PLAN — with everything load-bearing about the
product, its current state, and where the decisions sit. The operational/engineering companion
docs are listed in §8; this file is the top of the funnel._

---

## 0 · r451 (2026-09-03) — THE FOUR VECTORS: where the project goes next

_Wolf returned after a break with four workstreams. Session r451 wrote the plans; nothing is built._

| # | vector | state | the doc |
|---|---|---|---|
| 1 | **Tutorial front end for Foundations** — ONE robust `keyboardtour` (staged, untimed, replayable, a TUTORIAL HUD that names the next keystroke; six stages; outside the catalog like the sandbox — it replaces the modal tour's Excel beats and the warm-up sandbox) + FOUR lesson drills (select · firstsum · lockref · ribbonpass) inside the existing **Foundations** chapter, right after `navigation`. No chapter rename, no `c0`, no achievement re-targeting; Foundations becomes 11 drills, `modeltour★` stays its capstone, catalog 74 → 78 | **spec v2 written, awaiting Wolf's decisions** (T1–T3 · L1 · D2–D7 · D9) | `dev/TUTORIAL_CHAPTER_SPEC.md` |
| 2 | **Rank art** — 8-bit pixel sprites vs the shipped heraldic crests | **memo + rendered prototype, awaiting A1–A4** | `dev/ART_DIRECTION.md` · `art/rank-pixel-proto.html` · `art/rank-pixel-proto-{dark,light}.png` |
| 3 | **Business plan** — OBA clearance, LLC (home state), EIN, bank, Stripe live, bookkeeping, mail/logins/bills routing | **reserved plan; four short sessions sequenced** | `dev/BUSINESS_PLAN.md` (+ `dev/EMAIL_SETUP.md`, `STRIPE_SETUP.md`) |
| 4 | **Security hardening** — eight-domain audit fleet (RLS/RPC, auth, edge+secrets, browser/CSP, run integrity, repo/pipeline, data+policy, ops) with a definition of done | **reserved plan; one dedicated session** | `dev/SECURITY_PLAN.md` |

**Order Wolf set:** vectors 1 and 2 first (this and the next sessions), 3 and 4 reserved. **Build
order inside 1+2:** tutorial platform wave → tutorial drill waves → art (cosmetic lane, can run in
parallel once A1 is answered). Also on the table from r450: PR #246 merged the first-session round
(start gate, tour Esc arming, paywall built dark) — `main` is current through r450.

**Facts a new session needs that changed since r449:** catalog is 74 with PR #245 merged; the
premium flag is still OFF and CI asserts it; the r450 first-session audit is the newest playtest
evidence (AUDIT.md top). The tutorial spec supersedes `FOUNDATIONS_SPEC.md` §6 for chapter 1 only.

## 0a · r452 (2026-09-03, same day) — THE FULL-PROJECT AUDIT + THE BUILD DAY

**Read `dev/AUDIT_R452.md` first** — six domain audits (perf/stale · Excel+Mac parity · pages+drills
bugs · progression systems · catalog coherence · client↔backend contract) synthesized into fixes
made and a menu for Wolf; the full reports live in `dev/audit-r452/`. Fourteen fix/build streams
landed on the branch the same day, each with a CI guard (AUDIT_R452 §1): certificates issuable
again (P0), the run outbox, placement's 5th board, phantom medals, Mac ⌃⌘V / ⌘⇧T and the chord
truth table, Tab-Enter home, Esc closes sign-in, 74 inline name/label duplicates, the beta retired
(curtain deleted, BETA_MODE → PRO_PERKS_FREE, beta_codes dropped), landing v2, the Keyboard Tour
(wave 0 + the six-stage board + the HUD), the card-frame pixel pass, plus the keystroke hot path
and the bug-sweep set. Wolf's answered decisions: delete the curtain · keep BETA_MODE behavior,
rename it · landing defaults to Daylight with a PRO door and learn-by-doing · pixel frames go ·
implement from the pushes and re-assess. **Open Wolf items:** AUDIT_R452 §2 (the menu) — first up
C1 legal placeholders, C4 Mac KeyTips, then the lesson-drill wave B1–B3.

**r453 backend round APPLIED LIVE (2026-09-03 22:20 UTC, via the Supabase connector; PR #248 carries
the files):** baseline (no-op on prod) · membership retired (runs INSERT policy replaced first;
members/invite_codes/access_codes/redeem_code dropped) · prune_guest_shells daily 04:00 UTC and the
one-time pass (2,558 abandoned anonymous shells removed of 2,622 users) · RPC grants (37 client RPCs
off public+anon, 12 helpers off authenticated; anon keeps preview_desk + is_desk_captain) ·
profiles 6→3 policies + 22 initplan rewrites · 6 FK indexes, 4 dropped, desk_creations PK, events
retention 180 days daily 03:30 UTC · run_stats aggregate + trigger + backfill (no read path moved —
dev/RUN_STATS_PLAN.md). Version rows stamped in supabase_migrations.schema_migrations so a future
`db push` skips them. Leaked-password protection is Wolf's dashboard toggle (Authentication →
Providers → Passwords).

**Branch state:** everything is on `claude/drill-redesign-art-style-jg9vhm`; `gate.yml` runs only on
PRs and pushes to main, so CI has NOT run on the branch — but the FULL 24-step local gate (every
suite gate.yml runs plus the r452 guards) ran green on the merged tip at the close of r452
(`.gate-r452.log`; the one red step was a resurrected orphan page, deleted). **LAUNCHED 2026-09-03 21:44 UTC: PR #247 squash-merged (854cf00); www.hotkey.gg serves the new build via Cloudflare; the two r452 migrations were applied through the Supabase connector because the deploy workflow's SUPABASE_ACCESS_TOKEN secret is stale ("Unauthorized" at `supabase link`) — the MCP recorded them as 20260903214612/…615, so the next successful `db push` will re-run the repo's 20260903000000/…100 files, which are idempotent. Wolf: refresh the repo secret.** The live DB was also cleaned the same hour: 50 seed players + 2 seed desks, 21 smoke/test accounts, and Wolf's own playtest history (backup in the session scratchpad only). Cache versions on the branch:
(`.gate-r452.log`; the one red step was a resurrected orphan page, deleted). Merge to main = launch (the curtain is gone). Cache versions on the branch:
themes.js 313 · nav.css 312 · drills.js 304 · nav.js 305 · lb.js 43.

## 1 · What the product is

**Hotkey.gg is keyboard-only Excel training for finance professionals.** The tagline on the live
page: *"74 banker-grade drills, live leaderboards, and desks for your whole team. No mouse
allowed."* A drill is a real spreadsheet task on a real (simulated) grid — build a debt schedule,
tie three statements, foot a covenant table — graded beat-by-beat on the visible end state, with
par times, medals (pass / pro / legendary), hidden bonus stars (☆) that reward the efficient
route, and a save-and-close finisher on every drill.

The wedge: every competitor teaches *shortcuts*; Hotkey teaches *the artifact*. Every board is a
page a banker would recognise as their own file (enforced by a written standard — see §5), and
the drills grade what the finished page looks like, never which chord you pressed.

## 2 · State of the build — THE DEPTH PASS IS COMPLETE (r449)

The multi-week "depth pass" campaign rebuilt **all 74 drills** to a single quality bar:

| chapter | drills | state |
|---|---|---|
| Foundations | 7 | ✅ |
| Formatting | 9 | ✅ (`gauntlet` capstone) |
| Formulas I | 9 | ✅ |
| Data & Lookups | 9 | ✅ |
| Formulas II | 10 | ✅ |
| Models I · Valuation | 10 | ✅ |
| Models II · Credit | 10 | ✅ (`cascade` capstone) |
| Full Builds (PRO) | 10 | ✅ |

The bar every drill now meets: end-state grading (the campaign found and killed **82**
"untriggerable beats" — checks that graded the typed formula's text instead of the result, so a
correct player stared at a dark checklist line); a measured ☆ with a proven skip; ≥2 alternate
solution routes under regression test; 20-row boards at ≥60% content density; a dedicated
verification probe per drill; par times re-measured keystroke-by-keystroke through the live
engine (~1.05 s/key across the catalog).

**Verification**: the final full gate ran green on all 19 suites — 160 alternate-route tests,
zero par drift, every drill solvable on guided rails, both themes, Mac input, borders painted
and measured. The same gate runs on CI for every push.

## 3 · Where the code sits

- **`main`** — live through r450: PR #245 (the depth pass, waves 1–6) and PR #246 (the
  first-session round: start gate, tour Esc arming, paywall built dark) are both MERGED
  (2026-09-03). _r449 text kept for history: "#245 gate green; merge is Wolf's call" — given._
- **Branch `claude/drill-redesign-art-style-jg9vhm`** — r451, docs only (the four vector plans, §0).
- Cache-busting is versioned (`drills.js?v=300`) and guarded by CI, so a merge goes live cleanly.

## 4 · Product surface inventory (business-plan relevant)

- **Pages**: index (the app), About, enterprise, desks (team product), leaderboard, cert
  (certificates), stats, profile, account, billing, admin, reference, contact, security,
  privacy, terms + 74 per-drill SEO pages (`/drills/*`) + sitemap.
- **Monetization scaffold, currently OFF**: `HOTKEY_PREMIUM = { enabled:false, groups:
  ['Formulas II','Models I','Models II','Full Builds'] }` — a single flag gates the back half
  of the catalog (39 of 74 drills) as the paid tier. The free tier is the fluency foundation;
  the paid tier is the finance-modeling ladder. Flipping this is a business decision, not an
  engineering task.
- **Teams**: "desks" (team rosters + shared leaderboards) and an enterprise page already exist.
- **Progression assets**: XP + chapter campaigns with capstone gates (`modeltour` → `gauntlet` →
  `cascade`), achievements, medal clocks, personal bests, streaks, certificate tracks
  (fluency / formulas / modeling) with a certificate migration in SQL, and a **placement test**
  (5 boards: navigation, combo, margin, sort, opmodel) that bands new users.
- **Leaderboards**: live, tiered, seeded; backed by Supabase (auth + rows; MCP connector exists
  but needs interactive re-auth in a fresh session).
- **Marketing copy invariant**: "74 banker-grade drills" is asserted by CI against the real
  catalog count — it moves automatically if drills are added/retired.

## 5 · The quality moat (what a business plan can honestly claim)

- **`dev/MODELING_STANDARDS.md`** — a written house standard (colour-as-provenance, sign
  conventions, roll-forward corkscrews, credit-stat forms, the 20-row component rule) that every
  Models/Full-Builds board is audited against. This is the "banker-grade" claim made checkable.
- **`dev/AUDIT.md`** — ~11k lines of measured evidence: every rework documents the routes walked,
  the keys counted, and the defects killed. Due-diligence-ready.
- **Every drill ships its own probe** (`dev/verify-*.js`) plus 19 CI suites. The catalog is
  regression-armoured to a degree competitors can't cheaply copy.
- The **☆ system** is measured, not vibes: every bonus is proven worth N keys and proven
  skippable, with the numbers in the audit record.

## 6 · Wolf's open decision queue (nothing here blocks the product)

1. ~~Merge PR #245~~ — DONE (merged with #246, live through r450).
2. **Premium flip** — when/whether to enable `HOTKEY_PREMIUM` (§4).
3. **Border-dress doctrine** (r446b): strict ("a rule under a total never clears") vs lenient
   (`bt || ball`) — both ship today in different drills, zero player-stranding either way;
   unifying changes shipped behavior in ~10 drills.
4. **threestmt difficulty** (§5.4): landed light at par 45; the ways up are a fourth year or the
   cash corkscrew.
5. **opmodel placement band** (D16): its par moved 55→85 and it is a placement board.
6. **dcfbuild thin ☆** (4 keys) + whether terminal value deserves two beats.
7. **dashcover cover roster** — which headline outputs make page one.
8. **`redflags` §4.56** — build Formulas II's capstone or not (scope call).
9. **Unbuilt capstone ADDs**: `redflags`, `pitchpage` (Models I), `shipit` (Full Builds) — these
   are the natural "content update" releases post-launch.

## 7 · Engineering backlog (measured, none blocking)

Fit-sweep #### flake · §1.3 density retrofit (11 early-chapter drills under 60%) · alt-paths
long-run Escape wedge · __noShrink frame overrun at small viewports · qclose capstone port ·
dual-audience audit over pre-R4 drills.

## 8 · Docs map + how work gets done

- `dev/DEPTH_PASS.md` — the binding drill spec (§1.0 laws, ☆ rules, beat anatomy).
- `dev/DEPTH_PASS_CAMPAIGN.md` — the operational handover (state table §0, bug classes,
  dispatch briefings §5). **Read its §0 first in any new engineering session.**
- `dev/WORKFLOW.md` §9 — the wave playbook: one worktree agent per drill, ≤5 per wave, agents
  return structured payloads, the orchestrator assembles serially and runs the full gate per
  batch. This pipeline shipped 30 drills in 6 waves with zero regressions and is the template
  for any future content push (e.g., the capstone ADDs).
- `dev/AUDIT.md` — the evidence ledger. `dev/MODELING_STANDARDS.md` — the artifact standard.
- Engine = one file (`index.html`, ~20k lines); catalog metadata = `drills.js`; tests = `dev/`.

## 9 · One-paragraph summary for a pitch

Hotkey.gg is a keyboard-only Excel trainer whose 74 drills make finance professionals fast at
the pages they actually build — models, schedules, bridges — graded on the finished artifact
against a written banker standard, with medals, leaderboards, certificates, placement, and team
desks already built. The entire catalog just completed a measured quality pass (every drill
route-tested, every bonus proven, 19-suite CI), the paid tier is one flag away, and the
content pipeline that rebuilt 30 drills in six agent waves is reusable for every future release.
