# MONETIZATION & PROGRESSION DESIGN — level gates, Pro, seasons (r136)
_Wolf asked (r136): how do drill locks by level + season passes + level unlocks
look as features in the CURRENT build? This doc maps the design onto what already
exists. The r87 decision (subscription · free = level-gated path · no live-service
treadmill) stays the spine; seasons are reconciled with it below, not bolted on._

## What the build already has (nothing here starts from zero)
- **Levels**: canonical XP (HK_RANK.computeXP, XP v4 daily-reset) + levelOf();
  LVL chip in nav; local estimate for instant paint. Levels are the free currency.
- **Campaign**: HOTKEY_CAMPAIGN 8 chapters, PB-under-par gates — a second,
  skill-based unlock axis that already works.
- **Ranked gate**: LVL 10 OR campaign complete — the level-gate pattern, live today.
- **Pro scaffold**: entitlements table (RLS, server-written), isPro()/requirePro(),
  upgrade modal, PRO badge, inert startCheckout(), create-checkout Edge Function
  (TEST-mode only, refuses live keys). BETA_MODE=true unlocks everything.
- **Premium marker**: HOTKEY_PREMIUM {groups:['Models','Full Builds']} → ◆ badges
  in the picker. This becomes the unlock table.

## FREE SPINE (the level-gated path) — v1 spec
One robust pathway; levels are earnable by anyone, forever. Pro removes the wait,
never the ceiling.

| Group        | Free unlock | Rationale                                  |
|--------------|-------------|--------------------------------------------|
| Foundations  | L1          | the hook — never gate the front door        |
| Formatting   | L1          | day-one muscle memory, keeps variety high   |
| Values       | L3          | ~2 good sessions                            |
| Data         | L5          |                                             |
| Formulas     | L8          | the meat arrives once the habit exists      |
| Lookups      | L10         | pairs with the ranked gate                  |
| Models       | L14         | aspirational tier — visible, locked, named  |
| Full Builds  | L18         | the summit; campaign completion also unlocks (skill can beat time) |

- Locked drills stay VISIBLE in the picker (locked chip + "L14 · or go Pro") —
  aspiration needs a shop window.
- Campaign chapters can ALSO unlock their group early (skill path — keeps the
  "one robust pathway" promise honest for grinders who out-skill their level).
- Daily challenge ignores gates entirely (best re-engagement surface stays open).

### Implementation (small, all client + one config)
1. drills.js: `HOTKEY_UNLOCKS = {Foundations:1, Formatting:1, Values:3, Data:5,
   Formulas:8, Lookups:10, Models:14, 'Full Builds':18}` (replaces HOTKEY_PREMIUM.groups).
2. index.html: `drillLocked(key)` = !isPro() && lvl < unlock && !campaignUnlocked(group).
   Picker chip renders lock + requirement; loadChallenge guard opens the gate modal
   (two CTAs: "keep training — L14 unlocks this" / "Pro unlocks everything now").
3. BETA_MODE keeps everything open until launch — gates ship DARK, testable via
   the account beta tools (hk_dev_gates flag), flipped at launch. Zero migration.

## PRO (the only SKU)
Unchanged from r87: one subscription. Pro = full track from L1 + plugin keyboard
layers + advanced analytics + cosmetics (flair, seasonal track auto-included, below).
Stripe TEST MODE until internship ends; entitlements written only by the webhook.

## SEASONS — reconciled with "no live-service treadmill"
A paid battle pass would be a second SKU and a treadmill — it stays DEAD.
But **seasons as free competitive cadence** fit banking culture perfectly:
**comp cycles**. "H1 2027 comp cycle" — placements refresh, boards archive,
last cycle's elite get lasting cosmetic proof.

- **Season = a time window on runs.** Runs are timestamped; seasonal boards are
  pure query windows. ZERO migration for v1 — a `season` filter on leaderboard
  queries + a chip in the UI ("this cycle / all time").
- **Placement refresh**: rank recomputes within the window (the provisional
  system already handles thin data gracefully at cycle start).
- **Rewards are EARNED, never sold**: cycle-end grants (flair variants, emblem
  accents, a "comp cycle" line on the player card / LinkedIn rank PNG). Grants
  land in an entitlements-style table; art system already supports variants.
- **Pro tie-in (the acceptable "pass" shape)**: Pro members auto-collect the
  cosmetic track; free players earn the same items via placement. One SKU,
  seasons make it feel alive. No purchasable tiers, no FOMO timers on skill.
- Cadence: 2 per year (H1/H2 — matches the joke and the school calendar) with
  a soft launch as "Season 0 (beta)" so early data stays.

### Build order (each ≈ one round)
1. LEVEL-GATE v1 dark (config + picker locks + gate modal + beta toggle).
2. SEASON WINDOWS on boards (query windows + chip + archive view).
3. CYCLE-END: rewards grants + celebration + card/PNG "comp cycle" line.
4. PRO WIRING END-TO-END (entitlements read live, TEST checkout) — needs egress.
Launch flip = BETA_MODE:false + gates live + Stripe TEST→live (post-internship).
