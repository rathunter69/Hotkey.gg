# LANDING V3 — the launch pass (r455 · 2026-09-04)

_Wolf, 2026-09-04: "update the landing page to reflect the site at launch i.e. with pro as a real feature. Also our landing slogan should be more centered around like, learning excel, saving time, picking up a skill you've neglected to pick up, prep for banking and consulting and finance / corporate jobs etc; less just like, oh you build fp&a schedules and can get better."_

Standing r452/r453 feedback kept: progression up front, later chapters PRO or earned by level, learn-by-DOING vs classes/YouTube, Daylight designed first, Classic vs Rapid-fire chips. No typed count, no typed price.

## 1 · The three headline/lede pairs

**A — the hours (SHIPPED)** · eyebrow `learn excel by doing · keyboard only` · **Learn Excel properly.** / _The hours come back._
*"NN timed drills on a real spreadsheet — a budget vs actual, a simple P&L, a sales table with a lookup. You're graded on the finished page, not on which key you pressed. It is the skill you keep meaning to pick up, and the one an analyst seat assumes you already have."*

**B — the neglected skill** · eyebrow `the excel you meant to get around to` · **You've been meaning** / _to get good at this._
*"NN timed drills, three minutes each, on pages you already recognise — a budget vs actual, a simple P&L, a sales table with a lookup. Not a course you abandon in week two: a clock, a real sheet, and a grade on the finished page."*

**C — job-ready** · eyebrow `excel training for the analyst seat` · **Be the analyst who** / _doesn't reach for the mouse._
*"Banking, consulting and corporate finance all assume you can build a page at speed. NN timed drills teach it the only way it sticks — by making you do it, against a clock, graded on the finished sheet."*

**Why A.** It leads with the motive Wolf named first and pays it off with the one benefit any visitor can price, then puts the neglected-skill and job-readiness angles in the lede, where they qualify the audience instead of narrowing it. B is the warmest line of the three but it is passive and never says what the site IS — bad for a page whose job is a first run. C narrows to finance in its first four words, the exact move Wolf asked us to stop making.

## 2 · What changed, per section

| section | change |
|---|---|
| hero | new eyebrow / H1 / lede. Hero still swapped from the term-loan sweep to a **budget vs actual** — same hand-built, engine-free markup, a page a non-banker reads at a glance. |
| micro | "free while we're building" (beta language; the beta ended at r451) → `no account to try it · no install · keyboard only`. |
| how it works | doing-vs-watching argument unchanged; "a page a banker would recognise" → analysts, consultants, corporate finance, anyone who lives in Excel. Beats 01/03 reworded, 03 now names the level. |
| **progression (new)** | before pricing. Levels → rank (all eight `HK_RANK.TIERS`, drawn with the shared `window.rankEmblem`), a board per drill, the three `HK_TRACKS` certificates, the daily challenge, plus the medal-clock panel. ABSORBED the r452 "proof" band (`#lProof`, deleted) so one place says how you climb; desks keep their own section. One line reads `HK_RANK.RANKED_MIN_LVL` — rank is automatic at that level, no opt-in. |
| pricing | "Free today. PRO when billing opens." → **two real tiers.** FREE = the chapters outside `HOTKEY_PREMIUM.groups` (count from `menuOrder`); PRO = the four inside it, each chip carrying its earn-in level. CTA → `billing.html`. |
| catalog rail | the back chapters are PRO *or earned by levelling*, not "become PRO when billing opens". |

## 3 · The rules this round adds

**The price law.** Every dollar figure on the landing is a string read out of `HOTKEY_PRO.plans`; no price literal exists in the landing markup or in `paintLanding()`. `dev/check-paywall.js` §4b asserts both halves (static scan for literals + runtime read against `plans`), `dev/check-landing.js` re-asserts in both flag states. "No dollar figure on any upgrade surface" stays in force for `billing.html` and the in-app modal (§3/§4) — that is the checkout path, and checkout is still a disabled stub.

**The freeNow rule.** While `HOTKEY_PRO.freeNow` is true, one line under the PRO price says billing has not opened and PRO is on for everyone until it does. It is a node (`#lFreeNow`) that `paintLanding()` **removes** when the flag goes false: flipping the flag deletes the line with no copy edit, and both guards assert presence == flag in both directions.

**The earn-in levels.** `drills.js` has no `unlock_level` on this branch, so the shipped numbers are dev/CURRICULUM_V3.md §3's curve — PRO chapter *k* at 10 + 3k = **13 / 16 / 19 / 22** (D-8, pending Wolf). `paintLanding()` prefers a group's own `unlock_level` or a `HOTKEY_PREMIUM.unlock_level` map; the fallback dies the moment that field lands.

## 4 · Open questions for Wolf

1. **Season plan naming** — renders "$19 per season · 3 months · one recruiting cycle" from `HOTKEY_PRO.plans[1].cap`. Keep "season", or "per recruiting cycle"? nav.js's PRO sheet reads the same string.
2. **The level-earn path on the landing** — each PRO chip says "or LVL 13". Honest, and it is the anti-paywall argument, but it also tells a visitor the paid half is reachable for free. Keep the numbers here, or say "or earned by levelling" and keep the numbers in-app only?
3. **13 / 16 / 19 / 22** as recommended, or flatten the tail (13/16/18/20)? The landing is the first surface to publish them, so they harden the day this ships.
4. **The headline** — A shipped; B and C are one edit away if the hours line reads as a claim.
