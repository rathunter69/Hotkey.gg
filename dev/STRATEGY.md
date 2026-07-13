# STRATEGY — five-lens review of hotkey.gg (r137, 2026-07-13)
_Wolf asked for the wide-angle pass: game developer, live-ops manager, IB coach,
former banker/buyer, and MBA candidate. Each lens gets: what's working, what's
missing, and specific builds. Sequencing and "do-not-build" at the end. This is
opinionated on purpose — push back where it's wrong._

## Where the product actually is (honest baseline)
The 30-second loop is genuinely good: drill → end-state grading → results → next.
That's the hardest part of a skill game and it works. The identity layer (rank
emblems, levels, desks, achievements) is now deep. What's thin is everything
that happens BETWEEN sessions: reasons to come back tomorrow, proof to show
other people, and visibility into whether any of it is working (zero funnel
instrumentation). The biggest asset nobody is using: **timestamped keystroke
traces on every run since r9** — a goldmine nothing reads today.

---

## LENS 1 — Game designer (the loop above the loop)

**Working:** grading end-state not keystrokes (freedom doctrine), guided mode,
two-ladders (LEVEL=reps, RANK=competition), drill variety with randomized
structure.

**Missing:** the 5-minute loop. After a solve, "what next" is a picker with 55
choices. Monkeytype solves this with restart-compulsion; Duolingo with a daily
path. We have neither fully.

**Builds, in order:**
1. **THE MORNING SHEET (daily ritual)** — replace the single seeded daily with
   a 3-drill "morning sheet": one weak-board drill (their worst percentile),
   one un-drilled (coverage), one PB-chase (they're close to a bar). One daily
   crown for clearing all three. Banker fiction writes itself ("clear your
   sheet before the staffer pings"). All data local/derivable. **Highest
   retention ROI in the codebase.**
2. **GHOST DIFF on the results card** — we replay traces for demos already;
   after a solve, show the 2-3 places time was lost vs the optimal path
   ("4.1s hunting for Alt+H — the fill was ctrl+d"). Traces + PARS exist;
   this converts every loss into a lesson. Nobody in this niche has it.
3. **MASTERY STARS** — per-drill ☆☆☆ (clear / under par×1.25 / under par).
   PBs are invisible progress; stars are legible, campaign gates get cleaner,
   captains get a cohort-mastery read for free.
4. **SEASONS (design doc first)** — rank is currently a one-way ratchet;
   once you're Second-Year, the ladder is done. 10-week seasons, placement
   runs, soft reset, seasonal flair cosmetic. Do NOT build until DAU justifies
   it — but design it before monetization locks, because season pass ↔ sub
   perks interact.

## LENS 2 — Live-ops manager (cadence + measurement)

**Working:** desk quests are a real weekly cadence seed. Streaks exist.

**Missing:** we are flying blind. There is no event funnel — we cannot answer
"how many people passed the curtain, entered, finished the tour, ran one
drill, came back next day". The B2B evidence story (roadmap S8) and every
retention decision depends on this.

**Builds, in order:**
1. **EVENTS TABLE (this month)** — `events(user_id nullable, session_key,
   name, meta jsonb, created_at)`, insert-only RLS, fired client-side at ~10
   moments (curtain_pass, enter, tour_done, first_solve, solve, signup,
   desk_join, quest_done...). One migration + a 20-line client helper. Then
   S8's admin view has something to read. **Do this before launch — you can't
   measure a launch retroactively.**
2. **STREAK INSURANCE** — 5-day streak earns one freeze token (auto-spends on
   a missed day). Duolingo's single most effective retention mechanic, ~40
   lines. The 🔥 already exists.
3. **WEEKLY SPOTLIGHT** — rotate a drill family weekly ("RX week: waterfall,
   revolver, 13-week — 2× crown weight on these boards"). Pure config + copy;
   gives the boards a news cycle and desks a shared topic.
4. **Re-engagement email** — needs an Edge Function + a sender (Resend).
   Highest-leverage dormant-user tool but blocked on infra; queue post-launch.

## LENS 3 — IB coach (curriculum credibility)

**Working:** Mix Rule density, diagnostic drills (audit/triage), associate-voice
checklists, honest pedagogy rules (no plugs). The content is defensibly good.

**Missing:** the bridge from "fast at drills" to "better at the desk job", made
explicit and taught in the product's voice.

**Builds:**
1. **AUDIT FAMILY EXPANSION** (roadmap #20, promote it) — "find what's broken
   under time pressure" is THE skill VPs actually notice. Three more: a
   balance-check sweep, a stale-link hunt, a sign-error triage. The engine
   already supports all of it.
2. **RX PACK AS THE FLAGSHIP DIFFERENTIATOR** — Wolf's restructuring seat is
   an edge nobody else has: 13-week cash flow (roadmap idea), liquidity
   bridge, covenant table. "The RX desk" as a labeled advanced section makes
   the product read insider-grade to exactly the crowd that evangelizes it.
3. **CAPTAIN PROGRAM TEMPLATES** — captains shouldn't design curriculum. Three
   presets ("Intern week 0", "First-year bootcamp", "Speed week") that pin a
   4-week quest sequence one click at a time. This converts the desk system
   from a leaderboard into a training program — the actual B2B seed.

## LENS 4 — Former banker / the person who approves spend

**Working (as of r136):** the Desk Hall ROI band — hours saved, cohort
improvement, coverage, momentum — is the right language. Verified desks +
protected names protect the brand story.

**Missing:** the artifact that leaves the product. Buyers don't log in;
they get forwarded things.

**Builds:**
1. **COHORT REPORT EXPORT** — a print-styled page of the Desk Hall (stats,
   improvement curve, per-member table) that a captain can save as PDF and
   drop in an email to a staffer/L&D. Zero backend, one CSS media block +
   a canvas summary card. **The demo IS the sales motion at this stage.**
2. **PILOT PLAYBOOK** — with seed codes going out: pick 2-3 clubs, run a
   4-week measured cohort (events table, lens 2), turn the report into the
   first case study PDF. Concrete number Wolf can say out loud: "cohort of
   34 got 31% faster across 9 modeling tasks in 4 weeks."
3. **Pricing posture (decision, not build):** keep B2C sub as decided; anchor
   B2B later as per-desk/season, not per-seat/month — matches how clubs and
   training budgets actually spend. No payments until the constraint lifts.

## LENS 5 — MBA candidate (acquisition + proof)

**Working:** .edu → home-desk one-tap, desk deep links, seed schools.

**Missing:** shareable proof and a friend loop. Students share credentials
constantly; we produce none.

**Builds, in order:**
1. **CHALLENGE LINKS** — `?race=margin&t=44.1&by=wolfofwallst`: loads the
   drill with a ghost target line and "beat wolfofwallst's 44.1s". Zero
   backend (params only), works logged-out, and every result screen offers
   "send this run as a challenge". The cheapest viral loop available.
2. **SHAREABLE RANK CARD** (already roadmapped for monetization round) —
   LinkedIn-dimensioned PNG: emblem, tier, percentile, top boards, showcase
   achievements (r135 picks feed straight in). Prioritize with the PRO
   surface.
3. **PLACEMENT VERDICT SHARE** — the onboarding placement already computes a
   pace verdict; append "top X% of N analysts" + a share card. Recruiting
   season (Aug-Sep) is the window: candidates WANT a number to post.

---

## SEQUENCE (next ~6 rounds, in order)
1. **Events table + client hooks** (lens 2.1) — measurement before launch.
2. **Morning Sheet daily ritual** (1.1) + streak insurance (2.2) — same round,
   both touch the daily loop.
3. **Ghost diff results insight** (1.2) — the quality moat, traces are waiting.
4. **Share surfaces**: rank card + challenge links + placement share (5.1-5.3)
   with the PRO placeholder — one "proof & growth" round.
5. **Cohort report export + captain templates** (4.1, 3.3) — the B2B round.
6. **Audit family + RX pack tranche** (3.1, 3.2) — content round; then seasons
   design doc.

## DO NOT BUILD (for now)
- **More drill breadth.** 55 is past sufficient for launch; depth of feedback
  (ghost diff, stars) beats a 56th drill.
- **Mobile/touch play.** Physical-keyboard muscle memory is the product. A
  read-only mobile stats/boards view someday; never the trainer.
- **Realtime multiplayer races.** Challenge links fake 90% of the value at 2%
  of the cost; revisit at real DAU.
- **CAS/comment engines, PWA, marathon rework** — parked correctly.
- **Anything requiring live payments or entities** until the internship
  constraint lifts (standing rule).

## The one-sentence thesis
The trainer is already good enough to win its niche; the next six rounds should
make progress **legible** (stars, ghost diff), **daily** (sheet, streaks),
**social** (cards, challenges), and **provable** (events, cohort report) — in
that order, because each one compounds the next.
