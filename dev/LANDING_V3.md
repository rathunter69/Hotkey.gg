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

---

# v3.1 — THE CUT (r455, same day)

_Wolf, 2026-09-04, on the v3 page that had shipped an hour earlier: **"Too much text on the
landing page - make it pithy - so I can identify at a glance what I'll be learning and
practising."**_

v3 argued its case. It read like an essay: 994 rendered words, five paragraphs of prose before
the visitor reached a single Excel skill, and the one band that answered the founder's question —
what will I actually learn? — was eight cards showing a name and a number. v3.1 halves the page
and spends the savings in exactly one place: the catalog band now says, per chapter, what you
learn.

## 1 · Word count, per section, before and after

Rendered words in `#landing` (SVG stripped — the rank emblems are art), 1280×800, flag off.
Counted with a whitespace split over `textContent`, the same way `dev/check-landing.js` now does
it on every run.

| section | v3 | v3.1 | Δ |
|---|---:|---:|---:|
| top nav | 10 | 10 | — |
| hero (copy + the still) | 143 | 85 | −41% |
| how it works | 245 | 70 | −71% |
| **what you'll learn** (catalog) | 77 | 77 | **0%, but rebuilt** |
| progression | 162 | 66 | −59% |
| pricing | 265 | 116 | −56% |
| for desks | 38 | 21 | −45% |
| the closer | 18 | 18 | — |
| footer | 36 | 30 | −17% |
| **TOTAL** | **994** | **493** | **−50.4%** |

The catalog line is the point of the whole round. It costs the same 77 words it always did, but
v3 spent 34 of them on a lede about "a difficulty spine, not a menu" and 16 on the cards; v3.1
spends 48 on eight lines of Excel skills and has no lede at all. Same budget, different answer.

What went, by section:
- **hero** — the lede went from 47 words to 16 (one sentence, still opening on the live drill
  count); the micro line's second-line hint went; the still's task line lost four words. Eyebrow,
  H1 (`Learn Excel properly. / The hours come back.`) and the micro line are untouched.
- **how it works** — the 38-word section lede deleted; the "usual route vs hotkey.gg" comparison
  collapsed from six bullets to **one line per column**; the three 01/02/03 beats went from
  paragraphs (118 words) to a heading plus one clause each (39). Par times, medals and the ☆ moved
  out of beat 03 and into the progression band, which owns them.
- **what you'll learn** — see §2.
- **progression** — the 46-word lede and the two prose panels (boards, the daily) collapsed into
  ONE derived line under the emblems: `levels from every clean run · ranked automatically at
  level 10 · a board on all 74 drills · 3 certificates`. The eight rank emblems row is unchanged.
  The four explainer cards shrank to caption-plus-three-words tiles; the medal clock kept its four
  rows because those are NUMBERS off the live par ladder, not prose.
- **pricing** — the 34-word section lede deleted. FREE keeps its price, its chapter chips and now
  four bullets of ≤6 words; PRO keeps its price, its `or LVL n` chips, the freeNow line (13 words,
  still flag-driven) and four bullets that are now the perk NAME only — `HOTKEY_PRO.features[n][1]`
  is the in-app explainer and billing.html is where a buyer reads it. The closing note went from
  39 words to 12.
- **desks** — one line. The four-part cohort-report list moved to enterprise.html, where the
  staffer who clicked through is actually deciding.
- **footer** — only the doubled "affiliated with or endorsed by" went; both legal halves stay.

## 2 · The eight chapter skill lines

The band is the centrepiece now. Every card carries four facts and no prose: chapter name, live
drill count, FREE/PRO chip, and one line of what it teaches. The lines live in
**`HK_CHAPTER_SKILLS`**, a single hand-curated map next to `paintLanding()` in index.html.

| # | chapter | drills | tier | what you learn |
|---|---|---:|---|---|
| 01 | Foundations | 7 | FREE | navigate, select, edit, fill, undo, first formulas |
| 02 | Formatting | 9 | FREE | decimals, currency, borders, alignment, paste special |
| 03 | Formulas I | 9 | FREE | anchors, SUM, SUMIF, growth, margins, tie-outs |
| 04 | Data & Lookups | 9 | FREE | sort, filter, VLOOKUP, INDEX/MATCH, medians |
| 05 | Formulas II | 10 | PRO | tracing errors, IFERROR, IF/MIN/MAX, signs, links |
| 06 | Models I | 10 | PRO | WACC, free cash flow, DCF, comps, bridges |
| 07 | Models II | 10 | PRO | debt schedules, revolvers, waterfalls, covenants, sweeps |
| 08 | Full Builds | 10 | PRO | three statements, DCF, LBO, from a blank sheet |

**Why curated and not derived.** Each line summarises the union of that chapter's `teaches` tags
in `dev/curriculum-v3.json` — but a tag list is a machine index (`anchor($/F4)`,
`stat-fn(MEDIAN/AVERAGE)`, `corkscrew(roll-forward)`), and the ask was plain words read at a
glance. Three chapters also carry almost no tags yet (Models II has one, Full Builds has none —
their drills are whole models, so the curriculum file leans on its per-chapter `teaches_line`
instead). So this is a curation, and it lives in ONE place rather than half-derived in two and
drifting. The map's comment in index.html lists, per chapter, exactly which tags each line
summarises, so the next editor can check the curation against the source without re-deriving it.

## 3 · The rules v3.1 adds

**The word budget.** `dev/check-landing.js` now counts the landing's rendered words and fails
above **560** — room for a chapter or two of catalog growth, none for a new paragraph. Copy grows
one paragraph at a time and nobody notices until the founder does; the ratchet is a gate step, not
a review habit (WORKFLOW §3.3). Raising the cap is a decision and it is made HERE, not in a copy
edit.

**Every chapter says what it teaches.** The same guard asserts that every rendered chapter card
carries a non-empty skills line and that `HK_CHAPTER_SKILLS` covers every `HOTKEY_DRILLS.groups`
entry — so a chapter added to drills.js without a line fails the build instead of shipping a blank
card. It also holds the lines to the copy law (WORKFLOW §4): no chords in marketing copy —
"anchors", never "$/F4".

## 4 · What did not change

The headline. The micro line. The price law and the freeNow rule (§3 above) — both guards still
pass in both flag states. Every number on the page is still derived: the lede's drill total, the
catalog h2, the per-chapter counts, the eight rank tiers, `RANKED_MIN_LVL`, the certificate
tracks, the daily pool, the two plan prices, the premium split. Nothing typed was added.

Screenshots re-rendered at deviceScaleFactor 1: `art/landing-v3-light.png` (1440×3342),
`art/landing-v3-dark.png` (1440×3342), `art/landing-v3-mobile.png` (390×5651). `.landing` is a
fixed-position dialog with its own scroller, so a full-page capture means growing the viewport to
`.landing-inner`'s scrollHeight — `fullPage: true` silently returns one viewport.

Tests: `dev/check-landing.js` 39/39 PASS (was 31 assertions; four added, none removed —
`lProgSub`/`lPriceSub` were markup nodes, not assertions). `dev/check-paywall.js` clean in both
flag states.

## 5 · Open questions for Wolf (v3 §4 still stands, plus)

5. **The comparison block.** "the usual route / hotkey.gg" survives as one line each. It is the
   only argumentative copy left on the page. Keep it, or cut it too and let the beats carry it?
