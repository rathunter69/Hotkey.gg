# hotkey.gg — PROGRESSION / RANK / DESK / LEVEL SYSTEMS AUDIT
_Read-only audit, worktree `agent-ac5de107286da46fb` @ f221706 (r450). Catalog = **74** drills, 8 groups.
All claims below verified by reading the code path; the ones marked **[headless]** were additionally
verified by booting `index.html` on :8804 under playwright with seeded localStorage._

---

## 0. WHAT "MISSION MODE" IS

There is **no** system named "mission" anywhere in the repo (`grep -i mission` returns only the word
"omission"). The term maps onto three *different* live systems that all look like missions:

| candidate | where | what it actually is |
|---|---|---|
| **Track milestones** (ex-"campaign") | `drills.js:227` `HOTKEY_CAMPAIGN.chapters`, surfaced by `index.html:29688 openCampaign()` as **"the tracks"** | 8 chapters × 4 drills, pace-gated, one-time XP bounty, medal. Branded "campaign" in the store, "milestones" in the UI. |
| **Desk quests** | `lb.js:319` (hall), `lb.js:1326 renderQuests()` (staffer controls), `team_assignments` table | up to 3 captain-pinned drills/week with optional target time + per-member ticks |
| **Daily Challenge** | `index.html:29891-30104`, `HOTKEY_CHALLENGE_POOL` `drills.js:355` | one global board/day out of a 14-drill pool |

If Wolf means "a named mission mode a player can enter", it does not exist. The report treats all three.

---

## 1. P0 — TIES BROKEN FOR REAL PLAYERS

### P0-1 · Two of three certificates are permanently unissuable (live DB)
* **systems**: certificate tracks × catalog × achievements × titles × skins
* **file:line**: `supabase/migrations/20260725000000_retire_colops.sql:22-23` (the newest, therefore
  live, definition of `issue_certificate`) vs `drills.js:178-197` `HK_TRACKS`
* **evidence**:
  * live SQL `fluency` array = 19 keys, contains `'undo'`, `'copyover'`, `'dress'` — all retired.
  * live SQL `formulas` array = 32 keys, contains `'growth'`, `'grpfold'`, `'wirewalk'`, `'hunt'` — all retired.
  * `HK_TRACKS` (derived from `groups`) = fluency 16 / formulas 28 / modeling 30. `modeling` matches; the other two do not.
  * Those 7 keys are not in `menuOrder`, so **no player can ever post a run for them**.
  * The migration's own header says it exists to stop the fluency track requiring a retired drill —
    it removed `colops` only and left the other six.
  * `dev/migrate-certificates.sql:33-35` (the ad-hoc file) IS correct/current — so the repo looks fine
    while the deployed function is wrong. `20260724200000_security_regression_fix.sql:141-142` carries
    the same stale arrays.
* **player symptom**: `index.html:24519 maybeOfferCertificate()` fires at 16/16 local PBs → RPC raises
  `TRACK_INCOMPLETE:3` → the toast lies: *"some clears never posted (guest runs from before sign-in
  don't count). Re-run the missing drills."* (`index.html:24530`). `account.html:541` shows a **"Claim
  certificate"** button at 16/16 which throws the raw `TRACK_INCOMPLETE:3` string at the user
  (`account.html:553`). The trainer's tracks modal shows `🎓 16/16` forever (`index.html:29732`).
* **blast radius**: `cert1`/`cert3` achievements, `boutique` skin (`certs>=3`), `foil`/`terminal`
  skins (`certs>=1`), `heraldic` cert path, `cert_fluency`/`cert_formulas`/`chartered` titles,
  the entire "Triple Crown" arc. Only the `modeling` cert (the hardest, 30 drills) can ever issue.
* **why CI is green**: `dev/check-invariants.js:428` **C13** ("no harness may name a retired drill")
  scans `fs.readdirSync('dev')` only — it never looks at `supabase/migrations/` or the root `*.js`.
  Its own docstring says the class of bug it exists to catch is exactly this one.
* **fix**: regenerate the three arrays in a new migration from `HK_TRACKS`; widen C13's file list to
  `supabase/migrations/*.sql` + `lb.js`/`nav.js`/`themes.js`/`index.html`.
* **effort**: S (one migration + 4 lines of CI). **safe to auto-fix: YES** (idempotent migration;
  the RPC is `create or replace`).

### P0-2 · Ranked opens at LVL 10 but the placement series needs a LVL-11 drill
* **systems**: rank tiers × placement × progression gates × premium
* **file:line**: `drills.js:21` `HK_PLACEMENT.KEYS` ends in `'opmodel'` (group **Full Builds**);
  `drills.js:641-646` `HOTKEY_GATES['Full Builds'] = {lvl:11, clears:32, chapters:[c1..c7]}`;
  `themes.js:686` `RANKED_MIN_LVL:10`; gate enforced at `index.html:30132 drillLocked` →
  `index.html:30181` inside `loadChallenge`.
* **[headless] evidence**: seeded a player with 25 pace clears and `hk_xp_est=4600` (LVL 10 by the
  gate's own math):
  `placementKeys: [navigation=OPEN, combo=OPEN, margin=OPEN, sort=OPEN, opmodel=Full Builds]`
  and loading `index.html?drill=opmodel` produced `gateModal:true, gateText:"Full Builds — locked, for now"`.
* **player symptom**: `lb.js:601` unlocks "⚔ Enter Ranked" at LVL 10. `lb.js:629` then shows the
  5-row placement checklist whose 5th row is a **"run it →"** link to `index.html?drill=opmodel`
  (`lb.js:648`). That link bounces off the gate onto a *different* drill and opens a lock modal.
  The nav pill sits at **"⚔ placement 4/5" forever** (`nav.js:439`) — no tier, no card, no rank.
* **fix (pick one)**: (a) exempt `HK_PLACEMENT.KEYS` in `loadChallenge`'s gate bypass alongside
  daily/race (one clause at `index.html:30180`); (b) swap `opmodel` for a Models-II-or-lower board;
  (c) raise `RANKED_MIN_LVL` to 11 and add `clears:32` to the ranked gate. **(a) is the cheap correct one.**
* **effort**: S. **safe to auto-fix: YES** for (a); (b) changes a frozen yardstick — Wolf call.

### P0-3 · The trainer's LEVEL and the player card's LEVEL are computed from different numbers
* **systems**: XP/levels × milestones × pace bands × daily challenge × ranked nudge
* **file:line**:
  * trainer chip + nav auth-bar chip: `index.html:29556 hkLevelXp()` = `max(window.__srvXp, hk_xp_est)`;
    `nav.js:1685` reads `hk_xp_est` raw.
  * every CARD surface: `nav.js:814`, `lb.js:657`, `lb.js:515`, `profile.html:317`, `stats.html:320`,
    `account.html:234` — all `HK_RANK.computeXP(runs, boards, sessions)` with **no** `max()`.
  * `HK_RANK.computeXP` (`themes.js:726`) knows about: first-ever solve, daily decay, +25/day,
    sessions, board bonuses. It knows **nothing** about the four local-only XP sources:
    - milestone bounties `index.html:29666 awardCampaignXP()` (150→1000 ×8 + 600 finisher = **4,300**)
    - speed-band bounties `index.html:24681 awardBandXP()` (up to 225/drill × 74 = **16,650**)
    - bonus-☆ +15 `index.html:24352` (up to **1,110**)
    - daily top-10 +40 `index.html:24485`
* **player symptom**: this is the *live* form of the "level 4 in game / 13 on card" bug the r412
  consolidation was supposed to kill — r412 unified the *readers*, not the *writers*. **[headless]**
  a seeded player read **LVL 7 on the chip** while `myXpEst()` (the gate) read **LVL 10**; and any
  player with milestone/band bounties will read HIGHER in the trainer than on their own profile card.
* **compounding**: `nav.js:344 maybeRankedNudge()` uses SERVER xp — so a player the trainer shows at
  LVL 12 may never get told Ranked exists.
* **worse**: `hk_camp_xp` and `hk_band_best` are **not** in the `client_state` sync snapshot
  (`nav.js:1378` syncs only `hk_ach_flags`, `hk_ach_seen`, `hotkey_streak`, `hk_ranked`, `hk_dc_done`,
  `hk_dc_top10`). On a second device those bounties are re-awarded from scratch; on the first device
  they are silently lost if storage is cleared.
* **fix**: make bounties server-truth. Cheapest honest version: add a `bounty_xp` integer to
  `profiles.client_state` (already a jsonb the sync owns), include it in `computeXP` callers as
  `computeXP(...) + bountyXp`, and add `hk_camp_xp`/`hk_band_best`/`hk_bonus_star` to the snapshot.
  Cheapest *consistent* version: drop the local bounties into the run ledger, or drop the `max()` and
  accept server-only XP everywhere (a visible level drop for existing players — violates the r158 no-rug-pull law).
* **effort**: M. **safe to auto-fix: NO** (changes visible levels; needs Wolf's call on direction).

### P0-4 · The Daily Challenge hands day-1 players drills the ladder has locked
* **systems**: daily challenge pool × progression gates × premium
* **file:line**: `index.html:29891 challengeEligible(){ return isPro() || lvl>=CHALLENGE_MIN_LVL }`
  with `isPro()` = `BETA_MODE || _pro` and `BETA_MODE=true` (`index.html:2041`), so **everyone** is
  eligible and `CHALLENGE_MIN_LVL=3` (`index.html:2114`) is dead code today.
  `loadChallenge` exempts `{challenge:true}` from `drillLocked` (`index.html:30180`).
* **[headless] evidence**: brand-new guest, 25/74 drills open, `challengeOfDay()` = **`comps`**,
  `drillLocked('comps')` = `"Models I"`. So the marquee daily hands a fresh player a **par-89
  Models I board** they cannot otherwise open, then nudges them into it 3 solves in (`index.html:24449`).
* **pool composition** (`drills.js:355`): 3 Formatting / 5 Models I / 5 Models II / 1 Full Builds.
  **11 of 14 pool drills are behind the ladder for a new player.**
* **fix**: filter the daily pool by `groupUnlocked` for non-PRO (or seed two pools: an open-tier
  daily and an advanced daily); restore `CHALLENGE_MIN_LVL` by testing `_pro` not `isPro()`.
* **effort**: S. **safe to auto-fix: NO** — the daily board must be *the same worldwide*; splitting it
  is a product decision.

---

## 2. P1 — DRIFT / DEAD / ORPHAN

### P1-1 · Five capstone medals and the completionist mythic are unearnable; "clear every capstone" means three
* `drills.js:487` `HOTKEY_CAPSTONES` names 8 capstones; five of the keys (`qclose`, `cleanroom`,
  `redflags`, `pitchpage`, `shipit`) **do not exist** in `menuOrder`.
* `drills.js:471-477` `cap_c3/c4/c5/c6/c8` test those keys through `hkCapstoneDone`
  (`drills.js:508`), which returns `false` for a key not in the catalog → **permanently 0/1**.
* `drills.js:498 hkCapstoneKeys()` prefers the *wired* list, which is only 3 → so
  `cap_all` ("Clear **every** chapter capstone — the whole catalog, answered", **legendary**, and a
  **title**) has `goal:3` and fires after modeltour+gauntlet+cascade. `cap_half` fires at 2.
* `x_allach` "Sweaty" (**mythic**, and a title) requires every non-mythic medal → includes the five
  dead ones → **unearnable forever**.
* **verified by script**: with a fully-maxed ctx, 6 of 78 achievements never fire:
  `x_allach, cap_c3, cap_c4, cap_c5, cap_c6, cap_c8`.
* **fix**: filter `HOTKEY_ACHIEVEMENTS` at load to drop capstone medals whose key isn't in
  `menuOrder` (three lines, keeps the ids frozen for `hk_ach_seen`), and reword `cap_all`.
* **effort**: S. **safe to auto-fix: YES.**

### P1-2 · The `pro` skin and the `PRO` title are gated on a flag nothing ever writes
* `themes.js:920 case 'pro': return !!u.pro;` and `themes.js:977 case 'pro': return !!u.pro;`
* `u.pro` is sourced from `hk_ach_flags.pro` (`nav.js:1691`, `profile.html:586`).
  **Nothing in the repo writes `fl.pro`.** Real PRO resolves server-side into `_pro`
  (`index.html:30648 my_pro_status`) / `nav.js:1360` and is never mirrored into the flags.
* `profile.html:322 frameU` doesn't even carry a `pro` key — so the customizer's "PRO · Cosmic"
  tile reads **locked for a paying subscriber**. Only `hk_beta_unlock` opens it.
* HOTKEY_PRO advertises "Pro cosmetics — exclusive card flair" (`drills.js:672`). It does not deliver.
* **fix**: write `fl.pro` alongside the `my_pro_status` resolve in `nav.js:1360`/`index.html:30648`
  and add `pro:` to `profile.html`'s `frameU`. **effort: S. safe to auto-fix: YES.**

### P1-3 · Chapter-gated skins can never *reveal*; only *pick*
* `nav.js:1690` builds the sweep's unlock ctx with `chaptersCleared: fl.chaptersCleared||[]` —
  again a `hk_ach_flags` field nothing writes. The two computers of that array live elsewhere
  (`index.html:31562 buildSkinCtx`, `profile.html:346`).
* → `emerald` (clear c5) and `architect` (clear c8) never appear in `hkSkinUnlockSweep`'s earned set
  (`nav.js:1699`), so their unlock celebration never fires. They *are* pickable in `profile.html`.
* Same shape: `nav.js:924 openFrameGallery`'s `u` omits `streak`, `chaptersCleared`, `pro`, `founder`
  → sakura/goldenhour/emerald/architect/pro/founder read locked there (documented as a legacy path).
* **fix**: have `profile.html`/`index.html` persist `chaptersCleared` into `hk_ach_flags` (it already
  writes flags), or have the sweep compute it from `hotkey_pb` + `HOTKEY_CAMPAIGN` the way profile does.
  **effort: S. safe to auto-fix: YES.**

### P1-4 · Desk program templates pin retired drills
* `lb.js:1310` `MG_PROGRAMS.intern0` week 2 = `['housestyle','dress','decimals']`;
  `lb.js:1311` week 3 = `['margin','growth','foot']`. `dress` and `growth` are retired keys.
* `lb.js:1374 if(!lab[k]) continue;   // catalog drift guard` silently skips them at pin time —
  so a captain who clicks **"pin week 2"** gets a **2-drill week** and the preview line
  (`lb.js:1392`) advertises the raw key `dress` to the captain.
* Same root cause as P0-1: C13 doesn't scan `lb.js`.
* **fix**: replace `dress`→`housestyle`-adjacent survivor (`combo`), `growth`→`percent`/`cagr`;
  widen C13. **effort: S. safe to auto-fix: YES.**

### P1-5 · The capstone "pass" clock contradicts the milestone gate on `gauntlet`
* `drills.js:330-334` `HOTKEY_CLOCKS.gauntlet.pass = 94` (par 47 × 2.0, the §2.4 capstone rule).
* `gauntlet` is **both** the c2 capstone *and* one of c2's three milestone keys
  (`drills.js:243`). `campCleared` (`index.html:29617`) requires `PB <= par × 1.5 = 70.5s`.
* So a 90-second gauntlet run shows **"Pass ✓"** on the results card (`index.html:24010 hkClockStrip`)
  while the tracks modal shows **"beat 71s"** and refuses to tick (`index.html:29714`).
  `HK_BAND.of(90,47)` = ratio 1.91 → **Bronze**, so the same card also shows a bronze medal next to a
  silver-colored "pass". Only `gauntlet` is affected (modeltour and cascade are capstone-only).
* **fix**: drop `gauntlet` from `chapters[1].keys` (it is the capstone), or drop its clock override.
  **effort: S. safe to auto-fix: NO** (changes a milestone's shape → Wolf).

### P1-6 · Two vocabularies for one speed ladder
* `HK_BAND` (`drills.js:280`) grades **Cleared / Bronze / Silver / Gold / Elite** at ×∞/2.0/1.5/1.15/1.0
  and pays one-time XP. `HK_CLOCK_TIERS` (`index.html:23999`) *displays* **Pass / Pro / Legendary** at
  ×1.5/1.15/1.0 — the same three thresholds, the same three colors (`#aeb6c0`/`#e0b341`/`#b98bff`),
  different names. A player sees "Silver" in one row of the results card and "pass" in the row above it.
* **fix**: one name set. **effort: S (copy). safe to auto-fix: NO** (Wolf's voice).

### P1-7 · Band medals are computed, paid, and never shown outside the trainer
* `hk_band_best` is written at `index.html:24679` and read only there and in `nav.js:470` (the wipe list).
  No profile card, stats page, leaderboard row or desk roster renders a band. The catalog-wide
  "☆☆☆ mastery" read that `STRATEGY.md` lens 1.3 asks for is 90% built and 0% surfaced.
* **ORPHAN-adjacent**: it also isn't in the `client_state` snapshot → device-local (see P0-3).

### P1-8 · Guest level chip vs guest gate use different XP entirely
* `index.html:29542 localXP(n) = 15*solves + 50*PBs` drives the guest's visible LVL chip
  (`hkLevelXp`'s last branch), while `index.html:30109 myXpEst()` returns
  `max(hk_xp_est, hkLevelXp())` — and `hk_xp_est` *is* accumulated for guests on every solve
  (`index.html:24410`). **[headless]** a seeded guest read **LVL 7 on the chip** and **LVL 10** inside
  `openGateInfo`'s "you're LVL n" line (`index.html:30144`).
* **fix**: give the guest branch of `hkLevelXp` the same `max(hk_xp_est, localXP)`. **effort: S. YES.**

### P1-9 · The placement series can never lift the provisional cap
* `HK_PLACEMENT` = 5 boards. `HK_RANK.PROVISIONAL_W = 6` (`themes.js:685`) and each board's weight is
  `min(1, log2(n+1)/log2(9))` ≤ 1, so 5 boards give `wsum ≤ 5 < 6` → `tierOf` caps at **Summer Analyst
  · provisional** (`themes.js:694-696`) the moment placement finishes.
* Player symptom: "your first rank posts the moment the fifth board does" (`lb.js:651`) — and it posts
  as *Summer Analyst, provisional*, for every player, regardless of skill.
* **fix**: `PROVISIONAL_W = 5`, or add a 6th placement board, or say it in the copy.
  **effort: S. safe to auto-fix: NO** (rank calibration → Wolf).

### P1-10 · Skin earn copy contradicts skin earn code (6 skins)
`themes.js:814-884` (the prose the customizer shows) vs `themes.js:891-945` (the gate):

| skin | shown | actual code |
|---|---|---|
| `crt` | "complete the reference tour" | `lvl >= 12` |
| `circuit` | "clear a full rapid-fire set" | `dailyWins>=1 \|\| lvl>=8` |
| `terminal` | "finish a timed sprint set" | `certs>=1` |
| `molten` | "hold a 30-day streak (5 daily wins)" | `dailyWins>=5` only |
| `neon` | "hold a 10-win daily streak" | 10 daily-challenge **wins**, not a streak |
| `cottoncandy` / `vaporwave` | "reach Summer Analyst" | `tb>=2 \|\| lvl>=3` / `lvl>=4` |

Three of these describe features (reference tour, rapid-fire set, timed sprint set) that have **no
unlock hook at all**. **effort: S (copy only). safe to auto-fix: YES.**

### P1-11 · In-game achievement sweep can never award crowns
`index.html:31519 buildAchCtx()` hard-codes `crowns:0`. `crn1`/`crn2`/`crn3`/`grp2`-adjacent and
`x_summit` therefore never celebrate in the trainer; they only light up on nav/profile/stats.
Since `hk_ach_seen` is written by whichever sweep sees them first, nothing is *lost* — but the
celebration lands on a leaderboard page instead of at the moment of the crown.

### P1-12 · `HOTKEY_PREMIUM.enabled` is dead config
`drills.js:313` — `.enabled` is read **nowhere**; only `.groups` is used, and only to draw the
"◆ advanced" tag (`index.html:30381`). The comment above it promises that flipping it "gates these
groups behind entitlement". Post-beta there is no paywall code to flip; `groupUnlocked`
(`index.html:30122`) only ever checks the ladder + `_pro` bypass.

### P1-13 · Milestone/track XP totals are advertised but unreachable server-side
The tracks modal shows `xpEarned / xpTotal` milestone XP (`index.html:29694`), computed from
`hk_camp_xp` — a device-local key. On a fresh device the header reads `0 / 4,300` for a player who
has shipped every milestone.

---

## 3. P2 — HYGIENE

* **P2-1** `dev/PROJECT_REVIEW.md:14,20` still says **82 drills / menuOrder===82**; live is **74**.
  `dev/FOUNDATIONS_SPEC.md` says 13 Foundations drills; live is 7. `dev/XP_DESIGN.md` describes the
  "150·n triangular" ladder that `themes.js:716` explicitly replaced.
* **P2-2** `dev/SEASONS.md` is design-only and **no season code exists** (`grep season` finds only
  prose and the `$19 / season` price). `HK_RANK.standing()` has no `since` param. Correctly parked —
  but `HOTKEY_PRO.roadmap` (`drills.js:678`) advertises "Season rewards track" to users.
* **P2-3** `index.html:31579 skinSweepInGame()` is a documented no-op that still writes
  `hk_skin_seen` — an **orphan** key nothing else reads (the live sweep uses `hk_seen_frames`).
* **P2-4** `hk_runs_lite` (`index.html:31460`) is written on **every** win including mouse/guided runs,
  so `x_sub5`, `x_zero`, `x_econ`, `day3`, `day4` count dirty runs in-game and clean runs on the card.
* **P2-5** `titleU.solves` (`profile.html:591`) = server run count; `hkTitleEarned('centurion')`
  wants 100 *clean solves* — `hotkey_solves` elsewhere. Two definitions of "solves".
* **P2-6** `nav.js:363` the `wolfcdrake@gmail.com` backdoor force-sets `hk_ranked`,
  `hk_beta_unlock`, `hk_placement_done`. Known; Segment E3.
* **P2-7** `HOTKEY_ACH_CATS` maps `ice`→"Streaks" (ord 7, duplicating `streak`) and `rapid`→"Desk packs"
  for a single achievement (`rx1`) that has nothing to do with rapid-fire.
* **P2-8** `profiles.client_state` is publicly readable by design
  (`20260724100000_reconcile_adhoc.sql:73`) — it carries `hk_ach_flags` incl. `tierBest`, `dailyWins`,
  `deskPeak`. Documented as intentional; worth a second look before launch.
* **P2-9** `nav.js:1373` still says the sync "requires dev/migrate-client-state.sql" — reconciled into
  `20260724100000` long ago.

---

## 4. THE SYSTEM MAP

### 4.1 XP / LEVELS
| | |
|---|---|
| inputs | posted `runs` rows (challenge, created_at), `sessions` rows, board placements (t10/pod/crowns); **plus** four local-only bounty streams |
| state | `hk_xp_est` (+`hk_xp_uid` owner tag), `hk_clears`, `hk_clears_day`, `hk_camp_xp`, `hk_band_best`, `hk_bonus_star`, `hk_dc_top10`, `hotkey_solves`; DB `runs` + `sessions` |
| computed | canonical `themes.js:726 HK_RANK.computeXP`; curve `themes.js:716 levelOf` (150/300/450 then flat 600). **Readers**: `index.html:29556 hkLevelXp`, `index.html:30109 myXpEst`, `nav.js:1685`, `nav.js:814`, `lb.js:515/657`, `profile.html:317`, `stats.html:320`, `account.html:234`. **>1 place: YES** — see P0-3, P1-8 |
| outputs | trainer LVL chip + progress bar (`renderLvl`), nav auth-bar chip, player card LVL tray, level-up celebration, gate thresholds, skin level gates, ranked nudge |
| docs | `dev/XP_DESIGN.md` (stale on the curve; correct on v4 decay) |

### 4.2 RANK TIERS / BUCKETS / PROVISIONAL
| | |
|---|---|
| inputs | all posted clean runs across the whole field (per-board dedup to each user's best) |
| state | `hk_ranked` (opt-in, synced), `hk_placement_done`, `hk_rank3` (sessionStorage 10-min cache), `hk_ach_flags.tierBest` / `.tierBestBucket` (packed `tier*3+bucket`) |
| computed | `themes.js:687 tierOf` (8 tiers), `themes.js:761 ratingOf` (shrunk K=6, log2 field weight), `themes.js:782 standing`. One implementation; `lb.js`/`nav.js` delegate |
| outputs | nav rank pill (`nav.js:398 navRank`, `pillHtml`), player card crest + bucket, leaderboard "your card", roster rank column (`lb.js:355` — uses **global** standing, correct since r417), desk grade input, `x_summit` mythic, plaque-frame unlocks |
| docs | `dev/SEASONS.md` (design only — see P2-2) |

### 4.3 PACE BANDS / MEDALS / CLOCKS
| | |
|---|---|
| inputs | clean-run time ÷ `HOTKEY_PARS[key]` |
| state | `hk_band_best` (device-local, unsynced) |
| computed | `drills.js:280 HK_BAND.of/next/xpFor`; display layer `index.html:23999 HK_CLOCK_TIERS` + `hkClocksFor` with `HOTKEY_CLOCKS` overrides |
| outputs | results-card band row (`index.html:24690 _bandRow`) + clock row (`hkClockRow`) + drill-rail clock strip. **Nowhere else.** |
| docs | `dev/DEPTH_PASS.md` §2.1 |

### 4.4 TRACK MILESTONES (ex-campaign) + CAPSTONES
| | |
|---|---|
| inputs | local `PB[k]` (written only on clean runs, `index.html:~10151`) vs `par × 1.5` |
| state | `hotkey_pb`, `hk_camp_xp` (claim flags, **device-local**) |
| computed | `index.html:29617 campCleared` / `29631 campCapstoneOk` / `29636 campState`; shared predicate `drills.js:268 hkCapstoneOk`; **duplicated (deliberately, same predicate)** in `nav.js:677` and `profile.html:346` |
| outputs | tracks modal (`openCampaign`), milestone one-line strip on the player card (`nav.js:684`), chapter-gated skins, gate bypass path, `cap_*` medals |
| docs | comments only (`drills.js:224`, `dev/DEPTH_PASS.md §2.4`) |

### 4.5 CERTIFICATE TRACKS
| | |
|---|---|
| inputs | server `runs` with `mouse_used=false` and `flagged=false` |
| state | `certificates` table; `hk_cert_<track>` latch; `hk_ach_flags.certTracks` |
| computed | client trigger `index.html:24519`; **authority** = `issue_certificate` RPC (live def in `20260725000000_retire_colops.sql`) |
| outputs | cert modal, `cert.html`, account certificates card, tracks modal counter, `cert1`/`cert3`, `foil`/`terminal`/`boutique` skins, three titles |
| status | **BROKEN for 2/3 tracks** (P0-1) |

### 4.6 PROGRESSION GATES
`drills.js:627 HOTKEY_GATES` — 5 gated groups; unlock = `(lvl AND paceClears)` OR all prior chapters
done OR any PB in the group (grandfather) OR real `_pro`. Enforced only in
`index.html:30117 groupUnlocked`. Exempt: daily/weekly/challenge/race/marathon. Surfaced as the
picker's `LVL n · m clears` tag (`index.html:30400`) and `openGateInfo`.
**[headless] fresh guest: 25/74 open.**

### 4.7 PREMIUM / ENTITLEMENT
`HOTKEY_PREMIUM.groups` → "◆ advanced" tag only. `HOTKEY_PRO` (`drills.js:650`) = the offer sheet
copy. Real gate: `my_pro_status` → `_pro` (`index.html:30648`), `my_pro()` in Postgres, `entitlements`
table (service-role write only), `desk_pro_grants` seats, `.edu` trial. `BETA_MODE=true` makes
`isPro()` universally true — which is why `CHALLENGE_MIN_LVL` and the weakness-queue `requirePro`
are currently no-ops.

### 4.8 PLACEMENT
`HK_PLACEMENT.KEYS` (5 boards, one per band). Read by `nav.js:435` (pill) and `lb.js:633` (checklist).
Completion = a posted run on each. See P0-2, P1-9.

### 4.9 DAILY CHALLENGE
`challengeKey()` = `challenge-YYYY-MM-DD`; board seeded by `challengeSeed()`; drill from
`HOTKEY_CHALLENGE_POOL` (shared with `lb.js`). Pays flat 50 XP server-side + 40 for top-10 locally.
State: `hk_dc_done`, `hk_dc_top10`, `hk_dc_nudge`, `hk_dc_seen`; flags `dailyTop10/dailyPod/dailyWins`.
Outputs: the marquee chip, the DC modal with today's global field + yesterday's podium, 8 achievements,
`foil`/`neon`/`molten`/`circuit`/`heraldic` skins. See P0-4.

### 4.10 MARATHON / WEAKNESS QUEUE / RAPID-FIRE
`sessions` table (mode, dur, score, keys, misses, optimal), guarded by `sessions_guard`.
`endSession` (`index.html:29062`) skips the post if hints were used. XP: +20 marathon / +10 other.
Weakness queue `index.html:27813` is local-only, honors `drillLocked`, gated by `requirePro` (free in beta).
Rapid-fire scores hits. None of these feed rank; all feed level.

### 4.11 DESKS
`teams` / `team_members` (UNIQUE user, cap 200) / `team_assignments` / `team_applications` /
`desk_pro_grants` (seats by seniority) / `school_map` + `profiles.school_tag`.
`create_desk` requires `my_pro()` (`20260725100000:88`); joining is free.
Hall (`lb.js:257-410`): ROI band (time saved first→best, avg speed-up, clean runs, coverage/74,
week-over-week momentum), quest board with per-member ticks, evaluation roster, cohort report (print)
+ PNG summary card. Grades `lb.js:992 DESK_GRADES` S+++…C- off roster mean rating;
`lb.js:1002` latches `hk_ach_flags.deskPeak` for the `x_bulge` mythic. Verified badge = `teams.verified`.
Docs: `dev/TEAMS_DESIGN.md` (v1 shipped; V2 captain tools shipped as quests+templates).

### 4.12 STREAKS + FREEZE
`hotkey_streak {d, n, frz}` (synced). `updateStreak` (`index.html:29527`) on any clean-ish win;
freeze earned every 5 days, max 2, auto-covers exactly one missed day. Feeds `str0/1/2/3`, `ice1`,
`goldenhour` (7), `sakura` (14), the flame chip, DC modal.

### 4.13 SKINS / TITLES / FRAMES
`HK_FRAMES` (31) + `hkFrameEarned` gate + `hkFrameUnlocked` (beta short-circuit) + `hkSkinUnlockSweep`
(page-load reveal, `hk_seen_frames`). Titles: `HK_TITLE_LABELS` + medal-derived (14 mythic/legendary ids)
+ `hkTitleEarned`. Picker lives in `profile.html:552`; `account.html` has the ledger; `nav.js:924` a
legacy gallery. See P1-2, P1-3, P1-10.

### 4.14 LEARNING PATH
landing → curtain (`PRELAUNCH_LOCK`) → `tryEnter` → keyboard-layout card → comfort card (`hk_xlv` 0/1/2)
→ spotlight tour on a **sandbox** board (`startOnboardBoard`, `TOUR_STEPS`, novice beats gated by `hk_xlv`)
→ `loadChallenge(MENU_ORDER[0], {guided:true})` → hint ladder `req → guide(F1) → aha → demo/learn`
→ stuck-nudge after 40s idle (`index.html:29500`) → 3 solves: rapid-fire nudge + daily-challenge nudge
→ picker = "the data room", groups in `drills.js:groups` order with capstone ★ last in each chapter.

---

## 5. THE TIES MATRIX

| # | edge | verdict | note |
|---|---|---|---|
| 1 | catalog `groups` → `HK_TRACKS.keys` | **consistent** (derived) | `drills.js:192` |
| 2 | `HK_TRACKS.keys` → live `issue_certificate` arrays | **DRIFT (P0-1)** | 7 phantom keys |
| 3 | `HK_TRACKS.keys` → `dev/migrate-certificates.sql` | duplicated-but-equal | the *un*deployed copy is the correct one |
| 4 | `HOTKEY_CAMPAIGN.chapters[].keys` → catalog | consistent | all 32 keys real |
| 5 | `chapters[].capstone` ↔ `meta[k].capstone` | consistent | both `{modeltour, gauntlet, cascade}`; guarded by C1/C2 |
| 6 | `chapters[].capstone` ↔ `HOTKEY_CAPSTONES` | **DRIFT (P1-1)** | 8 vs 3; 5 phantom keys |
| 7 | `cap_c*` medals → catalog | **DEAD (P1-1)** | 5 unearnable |
| 8 | `x_allach` → `cap_c*` | **DEAD (P1-1)** | mythic + title unearnable |
| 9 | `HOTKEY_GATES.chapters` → chapter ids | consistent | guarded `check-invariants.js:44` |
| 10 | `HOTKEY_GATES.groups` → group names | consistent | |
| 11 | `HOTKEY_PREMIUM.groups` → `HOTKEY_GATES` | consistent (4 ⊂ 5) | |
| 12 | `HOTKEY_PREMIUM.enabled` → any reader | **DEAD (P1-12)** | |
| 13 | `HOTKEY_PARS` ↔ `CHALLENGES[k].par` | duplicated-but-equal | 74/74, guarded C2 |
| 14 | `HOTKEY_CLOCKS` ↔ `HOTKEY_PARS` (×2.0) | consistent | guarded `check-invariants.js:88` |
| 15 | `HOTKEY_CLOCKS.pass` ↔ `campCleared` (par×1.5) on `gauntlet` | **DRIFT (P1-5)** | 94s vs 70.5s, same drill |
| 16 | `HK_BAND` names ↔ `HK_CLOCK_TIERS` names | **DRIFT (P1-6)** | same thresholds, two vocabularies |
| 17 | `HK_BAND` → any card/board surface | **DEAD (P1-7)** | trainer-only |
| 18 | `hk_band_best` / `hk_camp_xp` → `client_state` | **ORPHAN across devices (P0-3)** | not in `nav.js:1381 snapshot()` |
| 19 | local bounty XP → `HK_RANK.computeXP` | **DRIFT (P0-3)** | chip ≠ card |
| 20 | `hkLevelXp` (guest branch) ↔ `myXpEst` | **DRIFT (P1-8)** | chip ≠ gate |
| 21 | `RANKED_MIN_LVL` → `nav.js` + `lb.js` | consistent (SSOT `themes.js:686`) | r417 fixed the comment-synced dupes |
| 22 | `RANKED_MIN_LVL` (10) → `HK_PLACEMENT` reachability | **BROKEN (P0-2)** | opmodel needs LVL 11 |
| 23 | `HK_PLACEMENT` (5) → `PROVISIONAL_W` (6) | **DRIFT (P1-9)** | placement can't lift the cap |
| 24 | `HOTKEY_CHALLENGE_POOL` → catalog | consistent | 14/14 real |
| 25 | `HOTKEY_CHALLENGE_POOL` → `groupUnlocked` | **BROKEN (P0-4)** | 11/14 locked for new players |
| 26 | `CHALLENGE_MIN_LVL` → `challengeEligible` | **DEAD in beta** | `isPro()` short-circuits |
| 27 | `hk_ach_flags.pro` → writer | **ORPHAN (P1-2)** | skin + title dead |
| 28 | `hk_ach_flags.chaptersCleared` → writer | **ORPHAN (P1-3)** | sweep can't reveal 2 skins |
| 29 | `HK_FRAMES[].earn` prose ↔ `hkFrameEarned` | **DRIFT (P1-10)** | 6 skins |
| 30 | `hk_skin_seen` → reader | **ORPHAN (P2-3)** | superseded by `hk_seen_frames` |
| 31 | desk `MG_PROGRAMS` → catalog | **DRIFT (P1-4)** | `dress`, `growth` |
| 32 | desk quest `challenge` → catalog | consistent at pin time | free-text RPC accepts anything though |
| 33 | `deskGrade` → `x_bulge` | consistent | own-desk only, `lb.js:1002` |
| 34 | roster tier → global standing | consistent (r417 fix) | `lb.js:355` |
| 35 | `buildAchCtx().crowns` → crown medals | **DEAD in-game (P1-11)** | hard-coded 0 |
| 36 | `hk_runs_lite` (dirty) ↔ server runs (clean) | **DRIFT (P2-4)** | 5 medals |
| 37 | `SEASONS.md` → code | **DEAD by design** | zero season code |
| 38 | `PROJECT_REVIEW.md` "82 drills" → catalog (74) | **DRIFT (P2-1)** | |
| 39 | C13 retired-drill guard → `supabase/migrations` + root `*.js` | **GAP** | root cause of #2 and #31 |
| 40 | `HOTKEY_ACH_CATS` glyphs → achievements | consistent | 0 missing |
| 41 | `HOTKEY_GROUP_COLORS` → groups | consistent | 8/8 |

---

## 6. A NEW PLAYER'S FIRST 30 DAYS (as coded)

**Day 0.** Access code curtain → keyboard-layout card → comfort question (`hk_xlv`). "Basically none"
gets 5 extra novice tour beats; the other two skip straight to the product tour. The tour runs on a
throwaway warm-up sheet, then drops them on **`navigation`** with guided rails on. The chip says
**LVL 1**. The rank pill is hidden (guest). 25 of 74 drills are open; the other 5 chapters wear
`LVL n · m clears` tags. First clean solve pays 50 + 25 warm-up.

**Day 1–2.** Three clears in, two toasts fire: rapid-fire, and the **Daily Challenge**. They open it
and today's board is **`comps`** — a Models I board they are 4 chapters and ~7 levels away from —
labelled "extra-hard", with a global field. They will lose badly to the whole world on a drill their
own picker refuses to open. *(P0-4.)* If they sign up here, XP re-prices from the runs table; the
guest chip number and the signed-in number are different formulas *(P1-8)*.

**Week 1.** LVL 3-ish → **Data & Lookups** opens (lvl 3 + 8 pace clears). Milestone c1 (Foundations)
completes only when `modeltour` — the capstone, a par-35 model tour placed 7th in a chapter of 7 —
has one clean run. `+150 xp` fires as a celebration; that XP exists **only in this browser** *(P0-3)*.
Streak hits 5 → a freeze banks → `ice1`. `bloom` skin unlocks at LVL 2, `vaporwave` at LVL 4.

**Week 2.** LVL 5 + 12 pace clears → **Formulas II**. LVL 7 + 18 → **Models I**. The tracks modal now
shows "Fluency 1/2 · Formulas & Data 0/3 · Modeling 0/3" and, per track, a `🎓 n/N` certificate counter.
c2 Formatting requires `gauntlet` twice over — once at par×1.5 (70.5s) as a milestone key, once as the
capstone — while the results card congratulates them on beating the "pass" clock at 94s *(P1-5)*.

**Week 3.** LVL 9 + 26 → **Models II**. Around LVL 10 the ranked nudge card appears
(`nav.js:340 maybeRankedNudge`) — **if** their *server* XP is LVL 10; the trainer may already be
showing LVL 12 *(P0-3)*. They enter Ranked from the leaderboard. The pill flips to
**"⚔ placement 0/5"**. Four boards go down fast. The fifth, `opmodel`, is behind the **Full Builds**
gate (LVL 11 + 32 pace clears). The checklist's "run it →" link bounces them onto a random open drill
with a lock modal. **The pill reads "placement 4/5" indefinitely.** *(P0-2 — the single worst dead end
in the product.)*

**Week 4.** They grind to LVL 11 + 32 clears, clear `opmodel`, and the fifth board posts. Their first
rank is computed — and because 5 boards can never reach `PROVISIONAL_W=6`, it is **Summer Analyst ·
provisional** no matter how fast they were *(P1-9)*. Plaque-bronze and plaque-silver unlock.

**Day ~30, if they're a completionist.** All 16 Foundations+Formatting drills cleared → the trainer
pops "certificate almost ready — some clears never posted… Re-run the missing drills." There are no
missing drills. `account.html` offers **"Claim certificate"**, which returns `TRACK_INCOMPLETE:3`.
The Excel Keyboard Fluency certificate — the flagship shareable artifact, the thing the tour promised
them in its last step — **cannot be issued** *(P0-1)*. Same for Formulas & Data. Only the 30-drill
Modeling cert works.

**Also along the way:** if they subscribe, the "PRO · Cosmic" skin they were sold stays locked
*(P1-2)*. If they clear Formulas II, the `emerald` skin never celebrates *(P1-3)*. If their captain
pins "Intern week 0", weeks 2 and 3 arrive with 2 drills instead of 3 *(P1-4)*. Their band medals
(Bronze→Elite, up to 16,650 XP of them) exist only on the results card and only on this laptop
*(P1-7, P0-3)*.

---

## 7. RECONCILIATION MENU

**Today there are FOUR ladders describing one climb:**

1. **Progression gates** — `lvl + paceClears` per group (`HOTKEY_GATES`)
2. **Track milestones** — 4 drills/chapter at par×1.5 + a capstone (`HOTKEY_CAMPAIGN`)
3. **Certificate tracks** — every drill in 2-3 chapters, any speed (`HK_TRACKS`)
4. **Capstones** — one clean run on a designated drill (`chapters[].capstone` / `HOTKEY_CAPSTONES`)

…plus a fifth partial one (`HK_BAND` per-drill medals) and a sixth cosmetic one
(`hkFrameEarned`'s ad-hoc mix of `lvl`, `tierBest`, `streak`, `certs`, `dailyWins`, `chaptersCleared`).

### Option A — "One spine" (recommended)
**Chapter → capstone → certificate.** Collapse (2) into (4): a chapter is DONE when its capstone has
one clean run, full stop; delete `chapters[].keys` as a gate and keep them only as the chapter's
*suggested* run. Collapse (1) into (4): a group unlocks when the previous chapter is done (drop the
`lvl`/`clears` pair entirely, or keep `lvl` as a floor only). Keep (3) as-is — a certificate is
"every drill in the track, clean" and is the only thing that requires *breadth*.
Then: **XP/level = the volume meter** (never gates anything), **rank = the competitive meter**,
**bands = per-drill mastery** (surface them on the card), **achievements = flavor**, **desks = social**.
* *cost*: M-L. Touches `groupUnlocked`, `campState`, the tracks modal, `openGateInfo` copy, and the
  five not-yet-built capstones must actually be built (or the five chapters keep a keys-based gate
  until they are — which is what the current code half-does).
* *wins*: kills ties #6, #7, #8, #15, #19 (bounties disappear with the milestone system), #22 (gates
  stop being level-based), and the entire "which ladder am I on" confusion.

### Option B — "Keep four, make them agree" (cheap)
Leave the architecture; fix every DRIFT edge in §5. Regenerate the cert arrays, exempt placement keys
from the gate, sync the bounty keys, filter the dead medals, fix the six skin strings.
* *cost*: S-M, ~1-2 sessions, all of it individually safe.
* *wins*: every P0 and most P1s. Does **not** fix the conceptual sprawl.

### Option C — "Delete the milestone system"
`HOTKEY_CAMPAIGN` is already branded "retired" in its own comment (`drills.js:224`). Its only unique
outputs are the XP bounties (device-local, therefore already unreliable), the `hk_camp_xp` grandfather
flags, the milestone strip on the card, and two skin gates. Deleting it and keeping capstones +
certificates removes ~4,300 XP of client-only currency and one whole vocabulary.
* *cost*: M. Must keep `hk_camp_xp` readable forever (grandfather) and re-home `emerald`/`architect`.
* *risk*: violates the r158 no-rug-pull law unless bounty XP is first migrated into a server field.

### MUST NOT CHANGE (frozen)
* **Drill keys** — PBs, `runs.challenge`, boards, `drills/<key>.html` SEO pages, `seed-field.sql` history.
* **Achievement ids** — persisted in `hk_ach_seen` and `profiles.featured_ach`; renaming un-earns a medal.
* **Chapter ids `c1..c8`** — `hk_camp_xp` claim flags, `HOTKEY_GATES.chapters`, `HK_TRACKS.milestones`,
  `emerald`/`architect` gates.
* **Track ids `fluency|formulas|modeling`** — `certificates.track` rows, `hk_cert_*`, `certTracks`, title ids.
* **localStorage keys** — `hotkey_pb`, `hotkey_streak`, `hotkey_solves`, `hk_ach_flags`, `hk_ach_seen`,
  `hk_camp_xp`, `hk_band_best`, `hk_ranked`, `hk_seen_frames`, `hk_xp_est`/`hk_xp_uid`.
* **`HK_RANK.TIERS` names/order** — `tierBest` is a persisted **index**; reordering re-grants plaques.
* **`HK_PLACEMENT.KEYS`** — changing it re-opens placement for everyone mid-flight (per `DEPTH_PASS` D16
  it is explicitly NO CHANGE). Prefer fixing the gate, not the list.

---

## 8. THE FIVE FIXES I'D MAKE FIRST

1. **Regenerate `issue_certificate`'s three arrays from `HK_TRACKS`** in a new migration, and widen
   `check-invariants.js` C13 to scan `supabase/migrations/*.sql` + the root `*.js`. *(P0-1, and it
   would have caught P1-4 too.)* — S, auto-fixable.
2. **Exempt `HK_PLACEMENT.KEYS` from `drillLocked`** in `loadChallenge` (`index.html:30180`), the
   same way daily/race are exempt. *(P0-2.)* — S, auto-fixable.
3. **Make bounty XP survive**: add `hk_camp_xp`, `hk_band_best`, `hk_bonus_star` to
   `nav.js:1381 snapshot()` and add a `bounty_xp` term every `computeXP` caller adds. *(P0-3.)* — M,
   needs Wolf's call on which number wins.
4. **Filter the phantom capstone medals at load** (`drills.js`: drop `cap_c*` whose key isn't in
   `menuOrder`) so `x_allach`, `cap_half` and `cap_all` become truthful and earnable. *(P1-1.)* — S,
   auto-fixable, ids stay frozen.
5. **Write `hk_ach_flags.pro` and `.chaptersCleared`** where they're already computed
   (`my_pro_status` resolve; `campState`), so the PRO skin/title and the chapter skins stop being
   dead. *(P1-2, P1-3.)* — S, auto-fixable.

_(6th, free: fix the six skin `earn` strings — the customizer is currently telling players to
"complete the reference tour" for a skin gated on LVL 12.)_
