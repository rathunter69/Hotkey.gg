# INTERVIEW MODE — design doc (r181, build gated on Wolf sign-off)

_Status: DESIGN ONLY (PIPELINE T-H). Nothing here is wired. The build round
should be a config-and-content round, not a design round — every open question
below has a proposed answer so sign-off is a yes/no pass, not a workshop._

## Why this mode exists (the product truth)

Every other mode on the site trains. This one CERTIFIES. The pitch to the
user: "you say you're fast in Excel on your resume — here's the receipt."
The pitch to the desk/recruiting side (later): a comparable, cheat-resistant
number for a skill every IB/PE seat screens for informally anyway. This is
also the strongest PRO conversion surface we have: training is free-ish,
proof costs money.

## The fiction

An interview mode run = **the superday**. One sitting, eight tasks, a hard
clock, no coaching, one attempt per task — because that is literally the
modeling-test format shops run. Copy stays in-voice: "the associate slides
you a laptop", "no F1, no demo, nobody walking you through it".

## Format (proposed, concrete)

- **8 drills, one attempt each, hard 12-minute wall clock** for the sitting.
  Median total par across the sampled set is ~8 minutes; 12 gives room to
  breathe without letting anyone camp.
- **Sampling**: seeded per UTC day ("the July 13 superday"), same 8 drills
  for everyone that day — comparability is the whole point. Sample frame:
  2 Foundations, 1 Formatting, 1 Data, 2 Formulas, 1 Models, 1 wildcard from
  Models/Full Builds. Excluded from the frame: gauntlet/combo (meta-drills),
  saves (trivial under a clock), anything whose par exceeds 3 minutes (the
  wall clock can't absorb it).
- **No guide, no demo, no F1, no par shown mid-run.** Esc·esc restart is
  DISABLED (one attempt means one attempt); Shift+F11 likewise. Skipping is
  allowed (skip = 0 for that task, clock keeps running) — real tests let you
  triage.
- **Mouse allowed but logged** — exactly like the real thing; the report says
  how often you reached for it. (Blocking it outright fails the "is this how
  they'd actually work" test.)
- **Daily cap: one scored sitting per UTC day** per account. Practice
  sittings (unscored, unlimited) reuse yesterday's seed so today's paper
  stays sealed.

## The report card (the artifact people share)

One screen, tombstone-styled, shareable as an image like the rank card:
- **Headline**: overall score 0-100 + a verdict line in-voice ("extend the
  offer" / "callback" / "keep training" bands).
- **Per-task table**: time vs par percentile, keys-over-optimal ratio,
  won/skipped/timed-out.
- **Stall analysis** off the existing ghost-trace diff: the three longest
  hesitations, named by what the player was staring at ("14s before the
  first F4 in anchor" — the coaching hook that converts a bad run into
  tomorrow's training plan).
- **Percentile vs everyone who sat the same day's paper** (needs Supabase;
  local-only fallback shows percentile vs par bands until egress).

Scoring per task: 60% time-vs-par (clamped band), 25% keystroke efficiency,
15% completion; skipped = 0. Overall = mean, no curve-fitting until we have
population data.

## Anti-cheat (proportionate, not paranoid)

Daily seed + one scored sitting closes the obvious replay hole. Keystroke
traces already exist (ghost) — a trace that solves a Models drill with zero
hesitation and zero corrections gets flagged for review later, not blocked
now. We are selling a signal, not running the SAT; the doc records the
stance so we don't over-build.

## Gating & pricing stance

PRO-gated, beta-free (matches the standing "beta-free PRO" posture).
Unscored practice sittings free — they ARE the funnel. No entity/payment
changes: Stripe stays TEST MODE; nothing here ships payments.

## Build plan (when signed off — est. one round)

1. `interviewMode` session wrapper reusing marathon's clock + rapid-fire's
   no-hint discipline (both exist); disable F1/demo/restart routes.
2. Daily seed: date-hash → drill sample + per-drill seeds (the engine's rnd
   already takes a seed path via marathon).
3. Report card renderer + share image (rank card pipeline reused).
4. Supabase table `interview_runs` (RPC-insert like runs; RLS same shape) —
   deferred to an egress session; local percentile fallback first.
5. Full gate + a new e2e: sit a whole interview headless, assert one-attempt
   discipline, clock enforcement, report math.

## Open questions for Wolf (each with a default)

1. 12-minute wall clock OK? (default: yes, tune after 100 sittings)
2. Verdict-band copy — "extend the offer" reads fun to us, but is it too
   cute for something people may screenshot into real recruiting channels?
   (default: keep, soften only if feedback says so)
3. Should a FAILED sitting still render a shareable card? (default: yes —
   shame is a retention mechanic, but the share button is less prominent)
