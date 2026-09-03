# LAUNCH RUNBOOK — hotkey.gg (r138)
_The whole point of the r134 rework: launch is ONE flag flip. Everything else
here is the checklist around that flip so nothing is forgotten on the day.
Companion doc: dev/STRATEGY.md (what we build before/after); dev/TRUST_SAFETY.md
(the moderation pass)._

## Phase 0 — BEFORE launch (gates, in order)
1. **Events table live + 2 weeks of beta funnel data** (STRATEGY item 1 —
   shipped r139). You cannot measure a launch retroactively.
2. **Morning Sheet + streak insurance shipped** (STRATEGY item 2) — never
   launch into a retention hole; day-1 users must have a day-2 reason.
3. **Pilot cohort running**: 2-3 school desks active via seed codes, staffers
   pinning quests weekly. Their 4-week numbers become the launch story.
4. **T&S minimums** (from TRUST_SAFETY.md): verified-desk granting path
   (manual is fine), report-queue review habit (service role), admin
   force-rename/suspend scripts written (even if manual SQL).
5. **Remove the smoke-u fixture** (migration: delete from teams where
   slug='smoke-u') and optionally the smoke accounts (SMOKE_REPORT list).
5b. **Clear (or keep) the seed field** (r337): 50 seed players + 2 private
   side desks live under the 5eed… id namespace. `dev/seed-clear.sql` removes
   every seed row in one transaction. Decide: clear at launch for honest
   boards, or keep briefly so day-1 boards aren't empty — either way the
   clear script is the whole cleanup.
6. **Beta-tools sweep**: hk_dev_unlock ranked-gate bypass on account.html
   (flagged REMOVE AT LAUNCH since r-early; the same dev row now also sets
   hk_ranked — remove both together) and any BETA copy that's wrong
   post-launch. Keep the [beta] brand chip until PRO pricing is real.
7. Decide PRO posture at launch: BETA_MODE=true currently unlocks PRO for
   everyone — keeping that ON at launch is fine (free-during-beta framing)
   and delays the paywall until Stripe can go live (internship constraint).

## Phase 1 — LAUNCH DAY (the flip, ~30 minutes)
**DONE r451 (2026-09-03) — branch `claude/drill-redesign-art-style-jg9vhm`, goes live on merge.**
Wolf's call went further than the flag: the curtain is **DELETED**, not set false
(`PRELAUNCH_LOCK`, `showPrelaunchLock()`, `closeGate()`, `#gate`, `.gate*` CSS, the four
`gateOpen` guards, every `hk_beta_ok` read/write). Rollback is `git revert` on the commit,
not a flag flip. `BETA_MODE` → `PRO_PERKS_FREE` (same value, same behaviour). The Phase-0
items below were NOT all done first — these are now DUE (dev/BETA_RETIRE_LANDING.md):

- [ ] 0.3 pilot cohort running — **Wolf**, judgement call
- [ ] 0.4 T&S minimums — report-queue habit + force-rename/suspend scripts (dev/TRUST_SAFETY.md)
- [ ] 0.5 remove the smoke-u fixture — `delete from teams where slug='smoke-u'` (**migration, orchestrator**)
- [ ] 0.5b decide the seed field — `dev/seed-clear.sql` clears it in one transaction (**Wolf**)
- [ ] follow-up migration: drop `public.beta_codes` + revoke/drop `curtain_check(text)` (**orchestrator**)
- [ ] Landing v2 — the curtain was the only thing explaining the product (Part II; separate agent)
- [x] 0.6 beta-tools sweep — `hk_dev_unlock` card deleted, `hk_beta_unlock` → `hk_dev_unlock_cosmetics`,
      `[beta]` brand chip removed, copy sweep done
- [x] 0.7 PRO posture — decided: keep the unlock, rename the flag

1. ~~index.html: `PRELAUNCH_LOCK = false`~~ — done as a deletion, see above.
2. Cache bump — done r451: nav.js 303→304, nav.css 210→211, themes.js 310→311,
   drills.js 301→302, lb.js 41→42 across all 92 pages (`node dev/check-cache-versions.js`).
3. Commit → PR → merge (auto-merge agreement). Pages deploys in minutes.
4. Verify live: incognito → landing (no curtain) → Enter → tour → placement;
   sign-up with a real email; run one drill; check the run posts. Then the
   ranking surface (r335-336): leaderboard tier dropdown filters, entering
   ranked shows the 5-board placement series, the nav pill reads Unranked
   until entry. (CI covers all of this via dev/e2e-lb.js — this is the
   live-double-check, not the only check.)
5. Watch `events` (service role): curtain-less funnel = pv → enter →
   tour_done → first_solve. If enter→first_solve conversion craters vs beta,
   something broke — the flag flip is instantly revertable.
6. Post the launch note (Wolf: LinkedIn + club channels). Seed-desk staffers
   get a heads-up the day before: their quest boards will fill up.

## Phase 2 — WEEK 1 AFTER
- Daily: events funnel glance (D1 return, first_solve rate), report queue.
- Ship nothing structural for 3-4 days — watch, fix papercuts only.
- Pull the first cohort report (STRATEGY item 5 artifact) from the pilot
  desks and publish the case-study number with real data.
- Start the share-surfaces round (rank card / challenge links) while launch
  attention is highest — proof artifacts amplify a fresh audience.

## Rollback
r451: there is no flag to flip back — `git revert` the retirement commit + cache bump.
That was the deliberate trade (dev/BETA_RETIRE_LANDING.md §8A): the curtain only ever
gated NEW devices, so re-raising it would have locked out exactly the people a rollback
is meant to protect, and it would sit in front of the landing that replaced it. DB
changes: none in this commit (the beta_codes/curtain_check drop is a later migration).

## Explicitly NOT launch-gated
Payments (constraint), seasons, PWA, email digests, achievement art pass,
mobile anything. See STRATEGY.md do-not-build list.
