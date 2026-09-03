# HOTKEY.GG — PROJECT CONTINUITY BRIEF

_Written r449 (2026-07-29) at the close of the depth-pass campaign; updated r450 (2026-09-03)
after the first-session round merged (PR #246)._
_Original preamble: Purpose: condition a fresh
session — especially one working the BUSINESS PLAN — with everything load-bearing about the
product, its current state, and where the decisions sit. The operational/engineering companion
docs are listed in §8; this file is the top of the funnel._

---

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

## 3 · Where the code sits (r450)

- **`main`** — live through **r450** (`aab89fa`, merge of PR #246). Everything is merged: the
  depth pass (PR #243/#245 lineage) AND the first-session round. Nothing is parked on branches.
- Working branch `claude/platform-audit-framework-1hf2v7` — restarted clean from merged main;
  this is where the next round's commits go.
- Cache-busting is versioned and guarded by CI, so a merge goes live cleanly (Cloudflare Pages
  auto-deploys main).

### 3b · What r450 shipped (PR #246, five commits)

1. **Drill-start gate** — every classic drill opens behind "Press any key to start"; t=0 is the
   swallowed first key. Auto-passes: rapid-fire, marathon, sandbox, tour, demo playback. All 56
   drill-driving suites declare a gate stance (`hk_gate_off`), enforced by invariant C14 and
   `dev/check-startgate.js`.
2. **First-session flow fixes** — the guided-run explanation that could never fire (guard bug),
   Esc-on-tour two-press arm + replay path, beta-curtain tagline/door, labels for medal clocks/
   ☆/the `d` fold, coach-card lane lift. `e2e-audit-onboard` hardened 35→64 assertions.
3. **Paywall UX built dark** — complete premium experience behind `HOTKEY_PREMIUM.enabled:false`
   (asserted invisible while off). One entitlement point (`hkEntitled`), locked picker cards,
   upgrade modal (quotes no price pre-Stripe), billing.html in pre-payments state, placement
   rides through once. `dev/check-paywall.js` (56 assertions, both flag states) is always-on CI.
   Stripe wiring inventory is inline at every touch point; see `STRIPE_SETUP.md`.
4. **Wolf playtest fix: picker click-off** — the drill picker closes on any click that isn't a
   row/foot (the transparent 1180px card was eating backdrop clicks).
5. **Wolf playtest fix: border alignment** — applied borders now sit ON the gridline. Root
   cause: the ::after overlay hung off the cell's PADDING box under border-collapse (0.5px
   inset per side), so the rule floated a row-varying sub-pixel below the boundary with ~1px
   holes at column joins. Fix: `inset:-1px` + `overflow:clip; overflow-clip-margin:1px` on
   bordered cells. `check-borders` gained a 16-assertion ALIGNMENT block (DPR 1/2 × themes,
   negative-control-proven).

### 3c · The CI forensics lesson (read before touching check-borders)

The alignment block failed 4× on the gate runner while every local replica (exact driver
1.49.1 + chromium-1148 + same server/flags) was green. Diagnosis came from dumping the failing
clip PNG into the CI log: the board was photographed **through a body-level fixed modal backer**
(rgba black + backdrop blur) that something pops asynchronously on the runner only — sheet
dimmed 234→137, rule smeared into a halo, gridline crushed below the FAINT threshold. The probe
now (a) recomputes geometry + pins scrolls every take, (b) clears pause state, (c) hides any
&gt;600×300 fixed overlay before shooting and PRINTS ITS NAME (`note … hid fixed overlay(s) …`),
(d) on failure dumps img stats + the clip PNG base64 into the log. **The identity of the async
CI modal is still unknown** — next time the note line fires on CI, it will name the element;
suspect the offline-profile auth/handle flow. If a stray modal ever flashes on a fresh offline
load in production, it is the same animal.

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

## 6 · Wolf's open decision queue (r450 refresh; nothing blocks the product)

1. ~~Merge PR #245~~ / ~~PR #246~~ — **done, all merged; main is r450.**
2. **Premium flip** — the UX is now fully built dark (§3b.3). Remaining prerequisites are pure
   business: (a) the **processor decision** — Stripe vs a merchant of record (Paddle/LemonSqueezy;
   Wolf was researching in another session), (b) the **LLC** — paperwork was in flight; entity
   details are needed for terms/privacy/receipts, (c) Stripe (or MoR) keys + webhook per
   `STRIPE_SETUP.md`, then flip `HOTKEY_PREMIUM.enabled`.
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
dual-audience audit over pre-R4 drills · **identify the async CI modal** (§3c) ·
`e2e-audit-visual.js:91` border probe is rot since r442 (reads `.boxShadow`; fix = read the
`::after` like depth-mechanics §P — documented in AUDIT r450 "FOUND, NOT FIXED") ·
**Wolf has a further playtest bug list he has not yet sent** — ask for it.

## 7b · Session-environment gotchas (Claude Code on the web, this repo)

- **The checkout gets yanked** to an old commit (r443-era) on nearly every session
  resume/worker restart. ALWAYS `git fetch origin <branch> && git checkout -B <branch>
  origin/<branch>` before reading or editing anything, and re-verify after any long gap. Never
  trust `git log` without fetching first; work exists on origin even when the tree looks stale.
- **The scratchpad is wiped** across resumes — reinstalled browsers (`ci-replica`,
  chromium-1148) and scratch scripts vanish; rebuild as needed.
- CI runs playwright-core **1.49.1** + chromium-1148 (gate.yml pins it); local box has 1.56.1 +
  chromium-1194 at `/opt/pw-browsers`. A CI-only failure justifies a version replica FIRST
  (scratch `npm i playwright-core@1.49.1` + `PLAYWRIGHT_BROWSERS_PATH` install) — but r450's
  lesson is that the remaining gap is runner *environment*, not versions: get pixels from the
  runner (the probe's PNG dump) before theorizing.
- The gate workflow timeout is 45 min (raised r450); a full gate run is ~20 min.

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
