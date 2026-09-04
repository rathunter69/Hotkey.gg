# ROADMAP — one session, one goal

_2026-09-04 · Wolf: "I want to move to another session and want one session dedicated to one discrete goal. We're
mixing too many updates and fixes." From here, every session opens on ONE row of this table, ships ONE PR, and
closes by updating the row. Anything found along the way that is not the row's goal goes into §3 (the parking
lot), never into the PR._

## 1 · The rule for a session

1. Open on the row's **goal** and **done-when**. Read only the docs the row names.
2. Branch from `main`. One PR, titled with the row id. The gate must be green; the orchestrator lands it.
3. If the goal needs a decision from Wolf, ask it in the first message, with a recommendation, and keep building
   what does not depend on it.
4. Close: update the row's status, add the AUDIT entry, refresh `CONTINUITY.md` §0 if the handoff changed.
5. Off-goal findings → §3 with one line each. No "while I was in there" commits.

## 2 · The sessions, in priority order

Status: ☐ not started · ◐ in progress · ☑ done. Sizes: S = a few hours, M = a day, L = several days of agent time.

| id | goal (one sentence) | done when | size | reads | status |
|---|---|---|---|---|---|
| **S0** | **Merge PR #250** (the rebuild's groundwork: wave-0 tags/guards, gap matrix, curriculum v5.1 page, Phase A map + `--v5` checker, `check-borders` fix). No player-facing change. | merged to main | S | this file | ☐ Wolf's word |
| **S1** | **Foundations wave 1** — build tutorials 2–4 (`repairshop` `powergrid` `printshop`), `findgo`, and re-cut `pastes` + `series` to the seven rules; retire `filldr blocksel rowops editfix drill signerr`; C32/C33 as warnings; `--v5` gated. | the eight Foundations drills play end to end on the preview; onboarding suite green; par swept | L | CURRICULUM_V5.md ch.1 · CURRICULUM_V5_PHASE_A.md §1 §4 · DRILLS_WOLF_LIKED.md · CURRICULUM_V3.md §9.0 (the step/guide/hint contract) | ☐ |
| **S2** | **Engine pack P1** — the function pack (XLOOKUP, IFS, SWITCH, MAXIFS/MINIFS/AVERAGEIFS/COUNTIFS, TEXTJOIN, TEXT, SUBSTITUTE, SEARCH, DATEDIF, NETWORKDAYS, PMT) + comparison criteria in SUMIF/COUNTIF + the columns-past-Z parse fix. | every function in ENGINE_GAP_MATRIX P1 grades in a probe suite; invariant added | M | ENGINE_GAP_MATRIX.md · ENGINE_CHECKS_V4.md | ☐ |
| **S3** | **Formatting wave** — `typeset` `compspage` `ruleaudit` `printpage` (no freeze) re-cut/new; `housestyle` absorbs `gauntlet`; retire `decimals combo center autofit ruleoff gauntlet`. | chapter 2 plays end to end; C28–C31 numbers for c2 inside the P2/P3 quotas | L | CURRICULUM_V5.md ch.2 · PHASE_A §1 | ☐ |
| **S4** | **Formulas I wave** — `anchor` `ratios` `foot` `logic` `sumif`; retire `percent fxconvert margin cagr`. | chapter 3 (minus the P2-gated three) plays; `--v5` still clean | L | CURRICULUM_V5.md ch.3 | ☐ after S2 |
| **S5** | **Engine pack P2** — named ranges, remove duplicates, text-to-columns, two-key sort dialog, trace precedents/dependents + F9; then `bridge` (names), `textclean`, `dates`, `qclose`. | P2 probes grade; chapter 3 complete | L | ENGINE_GAP_MATRIX.md P2 | ☐ after S4 |
| **S6** | **Data & Lookups wave** — `scrub` `filterpass` `unhide` `lookup` `crosstab` `recon` `cleanroom`; retire `sort lookup2 rollup`. | chapter 4 (minus tables/pivot) plays | L | CURRICULUM_V5.md ch.4 | ☐ after S5 |
| **S7** | **Formulas II wave** — `wrapfix` `cases` `audit` `trace` `stalelink` `balcheck` `redflags`; retire `triage tieout versionup balance`. | chapter 5 plays | L | CURRICULUM_V5.md ch.5 | ☐ after S5 |
| **S8** | **Engine pack P3** — conditional formatting, data validation, Excel tables, freeze panes, protect + print area; then `condfmt` `tables`, the `printpage` freeze step. | P3 probes grade; c2/c4 complete | L | ENGINE_GAP_MATRIX.md P3 | ☐ |
| **S9** | **Models I wave** — `wacc` `npvirr` `dcf` `dcfsens` (formula grid) `comps` `accdil` `pitchpage`; retire `fcfbuild dcfbuild txncomps liqbridge football sourcesuses`. | chapter 6 plays | L | CURRICULUM_V5.md ch.6 | ☐ after S2 |
| **S10** | **Models II wave** — `rollfwd` `intsched` `revolver` `waterfall` `covtable` `wk13` `cascade`; retire `schedule lbo debtsched`. | chapter 7 plays | L | CURRICULUM_V5.md ch.7 | ☐ |
| **S11** | **Full Builds wave** — `isbuild` `nwcsched` `debtblock` `threestmt` `lbobuild` `dashcover` `shipit`; retire `opmodel bsbuild cfslink retbridge`. | chapter 8 (minus handoff) plays | L | CURRICULUM_V5.md ch.8 | ☐ |
| **S12** | **Engine pack P4** — multiple sheets, goal seek + data table, pivot; then `pivot`, the `dcfsens` what-if steps, `handoff`. | P4 probes grade; catalog complete at 61 | L | ENGINE_GAP_MATRIX.md P4 | ☐ after S8 |
| **S13** | **Close-out** — guards C28–C33 to failures, `menuOrder` 61, SEO 301s for the 36 retired pages, certificates re-derived, placement probes re-swept, landing count, old Keyboard Tour code deleted. | main is the v5.1 catalog; every guard a failure | M | PHASE_A §4 §5 | ☐ last |

### Independent tracks (discrete goals that do not touch the catalog — any order, any time)

| id | goal | done when | size | reads | status |
|---|---|---|---|---|---|
| **T1** | **Identity sprites wired in** behind a flag: rank emblems, level chip/ring, achievement medals + rings, player card frames, favicon; flag off = zero visible change. | the flag flips on the preview with every surface rendering the sprites | M | ART_DIRECTION.md §6 §7a §7b · ASSET_INVENTORY.md · art/asset-pixel-proto.html | ☐ |
| **T2** | **Business setup** — LLC, bank, Stripe live (checkout on billing.html, `freeNow` off), accounting, the email/accounts/bills list. | a real PRO purchase completes on production | M+Wolf | BUSINESS_PLAN.md · billing.html "STRIPE GOES HERE" · check-paywall.js | ☐ |
| **T3** | **Security hardening** — the plan in SECURITY_PLAN.md: RLS review, secret rotation (the keys pasted in chat), headers, abuse limits, the deploy token type; plus the email-consistency items in §3 (security@, security.txt). | every item in SECURITY_PLAN.md checked or scheduled | M | SECURITY_PLAN.md · supabase/migrations | ☐ |
| **T4** | **Legal pages** — replace the 13 `[bracketed]` placeholders (entity line) once T2 names the entity. | zero placeholders on terms/privacy | S | terms.html · privacy.html | ☐ after T2 |
| **T5** | **Mac ⌥ KeyTips** — verify on a real Mac and fix the chord table. | parity suite green on a Mac run | S | MAC_DESIGN.md | ☐ needs a Mac |

## 3 · Parking lot (found along the way; not a session until promoted)

- Two silent engine bugs from the gap matrix, fixed in S2: columns past Z mis-parse; SUMIF/COUNTIF ignore `">100"`.
- The daily-challenge card opens 1.4 s after load over any board it is eligible for; the harness suppresses it, the product may want a gentler moment.
- `combo` (keycaps) reads weak at 1×/2× and `cert` at 32 in the icon set — one more hand pass when T1 starts.
- Email consistency (T3, after the aliases exist — canonical list: BUSINESS_PLAN.md §5): `security.html` sends
  disclosure reports to `hello@` → `security@`; add `/.well-known/security.txt` (Contact: security@, Policy:
  /security.html); privacy.html/terms.html name `privacy@`/`legal@`; contact.html "schools" → `teams@`; stray
  `contact@` in EMAIL.md → `hello@`; `no-reply@` → `notifications@` in EMAIL.md and the Resend templates; Supabase
  custom SMTP from `auth@`; DMARC `rua=` → `dmarc@`.
- Wolf-side, no session needed: the GitHub `SUPABASE_ACCESS_TOKEN` must be an `sbp_` personal token; rotate the secret key pasted in chat; one `reports` row and one `team_applications` row to review.

## 4 · What is already true (so a new session does not re-derive it)

- Live site = main @ #249: landing v3.1, rank automatic at LVL 10, the step controller, Foundations 1 built, identity pixel assets drawn but not wired. 74 drills in the catalog.
- PR #250 (open, green) = the rebuild's groundwork; nothing player-facing.
- The curriculum is decided at the conceptual level (`dev/CURRICULUM_V5.md`, the page at `dev/curriculum-v5.html`) and mapped (`dev/curriculum-v5.json`, proven by `check-curriculum-map.js --v5`). Wolf's five Phase A decisions (`CURRICULUM_V5_PHASE_A.md` §6) default to the recommendations if he is silent.
- The seven drill rules live in `dev/DRILLS_WOLF_LIKED.md`; the binding laws in `DEPTH_PASS.md` §1 and `DRILL_DOCTRINE.md` §2/§8.
- Models: Opus for engine and drill builds, Sonnet for mechanical/doc work, the orchestrator reviews and lands.
