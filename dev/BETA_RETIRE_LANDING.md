# RETIRE THE BETA · BUILD THE LANDING — r452 (2026-09-03)

> Wolf, 2026-09-03: _"we need to fix the overall onboarding flow — I think we just remove the
> whole concept of the beta while I start building and implementing, and we can have a more
> robust landing / explanation of the site vs. just adding the beta code."_

This doc is two halves. **Part I** is the beta inventory + a single retirement PR checklist.
**Part II** is the spec for what replaces the code box: a real landing, mocked at
`art/landing-mock.html`. Nothing here is implemented — no production file was touched.

Companion docs: `dev/LAUNCH.md` (the runbook this supersedes in part), `dev/STRATEGY.md`
(lens 5 · do-not-build), `dev/CONTINUITY.md` §0–§4, `dev/AUDIT.md` r450 (the curtain fix).

---

# PART I — THE BETA INVENTORY

## 0 · Headline numbers

| | |
|---|---|
| Files containing a real "beta" reference (greek-β WACC copy excluded) | **48** |
| Total real "beta" occurrences | **~209** lines |
| Production surfaces (`*.html`, `*.js`, `*.css`) | **17 files** |
| Migrations that mention beta | **6** (only 1 exists *because* of the beta) |
| `dev/` suites that touch a beta key | **32** (30 of them one line: `hk_beta_ok` fixture) |
| Device flags to wipe | **3** (`hk_beta_ok`, `hk_beta_unlock`, `hk_dev_unlock`) |

Grep to reproduce:
```
grep -rin "beta" --include=*.html --include=*.js --include=*.sql --include=*.css . \
  | grep -viE "levered beta|unlever|relever|beta of|equity beta|asset beta"
```
The excluded pattern is the **WACC drill's greek β** — `drills.js:112`, `index.html:9053-9313`,
`drills/wacc.html`, `drills/index.html:180`, and ~20 `dev/verify-*.js` probes. **All KEEP.**
Any sweep that does a blind find/replace on "beta" breaks the Models I chapter.

---

## 1 · THE CURTAIN (the thing Wolf is actually asking to delete)

### 1.1 Client

| where | what |
|---|---|
| `index.html:2160` | `const PRELAUNCH_LOCK = true;` — the launch switch |
| `index.html:2156-2159` | the r134 comment block explaining the flag |
| `index.html:2162` | `const INVITE_AUTO_CODE = 'HAGS'` — offline fallback code + per-session auto-redeem |
| `index.html:2144` | `<div class="gate" id="gate"></div>` — the curtain's only mount point |
| `index.html:1256-1264` | `.gate` / `.gate.show` / `.gate-brand` / `.gate-tag` CSS (curtain-only) |
| `index.html:30892-30894` | boot: `if(PRELAUNCH_LOCK && !onboarded){ if(!localStorage.hk_beta_ok) showPrelaunchLock(); }` |
| `index.html:31595-31596` | `closeAuth()` — cancelling sign-in at the curtain re-raises it |
| `index.html:31132-31133` | `onSession` — a real session writes `hk_beta_ok` and closes the gate |
| `index.html:31816-31856` | `showPrelaunchLock()` — the card, the copy, the RPC call, the mailto door |
| `index.html:31857` | `closeGate()` |
| `index.html:27235, 27293, 29751, 29783` | four `gateOpen` guards in the global keydown / hotkey handlers |
| `index.html:2186` | `gateOpen` declaration |
| `index.html:31765, 31767` | `advanceAccess()` calls `closeGate()` on both branches |

**Note:** `#gate` and `closeGate()` are used by **nothing but the curtain**. Auth uses
`#authModal`. Deleting the curtain deletes all of it cleanly.

### 1.2 Server

| where | what | verdict |
|---|---|---|
| `supabase/migrations/20260716900000_beta_codes.sql` | `public.beta_codes` table (RLS on, no client policies) + `curtain_check(text)` SECURITY DEFINER RPC, granted to `anon, authenticated`. Seeds `('hags','original beta wave')`. | **RETIRE — new migration, do not edit this one** |

There is **no admin surface** for beta codes. `admin.html` has zero beta references; codes were
minted by hand SQL (documented in the migration header).

### 1.3 Copy inside the curtain (all deleted with it)

`index.html:31830` `Private beta` · `:31831-31832` `Keyboard-only Excel training — 74 speedrun
drills against the clock, no mouse. what this is →` · `:31833` `We're letting people in gradually
— got a code?` · `:31834` placeholder `access code` · `:31837` `No code? get on the list →`
(mailto with `subject=Beta access — hotkey.gg`) · `:31852` `That code didn't work. Check with
whoever invited you.`

The r450 audit (`dev/AUDIT.md:13091`, **P0-3**) added the tagline and the mailto door precisely
because the curtain was the entire first impression for 100% of uninvited traffic. **Landing v2
makes that fix permanent by deleting the thing it was patching.**

---

## 2 · `BETA_MODE` — WHAT IT ACTUALLY GATES

`index.html:2155` — `const BETA_MODE = true;`
`index.html:31081` — `function isPro(){ return BETA_MODE || _pro; }` — **the only read.**

`isPro()` has exactly **7 call sites**, and `requirePro()` (`:31090-31093`) has 4:

| line | surface | if BETA_MODE went false today |
|---|---|---|
| `24116`, `24133` | ghost-cursor replay of your PB run | free players lose ghost replays |
| `30181` | `challengeEligible()` — armed challenge races (`isPro() \|\| lvl>=CHALLENGE_MIN_LVL`) | level path still opens it; low-level players lose the bypass |
| `30357`, `30364` | desk board row cap — non-PRO sees 10 rows + an upsell line | boards truncate at 10 |
| `25635`, `28008-28009` (via `requirePro`) | Macabacus / FactSet keyboard layers | locked |
| `28111` (via `requirePro`) | the Weakness Queue | locked |

**What `BETA_MODE` does NOT gate — checked, and this is the important part:**

- **The catalog.** Drill locking runs through `drills.js` `hkEntitled()` →
  `HOTKEY_PREMIUM.enabled`, which is **`false`** (`drills.js:313`). `drills.js:322-329` and
  `dev/check-paywall.js` §1 assert "flag off = zero visible change". `BETA_MODE` never touches it.
- **Progression gates.** `index.html:30396-30398` is explicit: the level/pace ladder reads the
  *real* `_pro`, "deliberately not BETA_MODE — the ladder runs in beta because the climb IS the game."
- **Founding a desk.** `create_desk()` raises `PRO_REQUIRED` unless server-side `my_pro()`
  (`supabase/migrations/20260725100000_desk_create_pro.sql`). `nav.js:1330-1352` documents at
  length that `my_pro()` has **no knowledge of the beta flag** — this is r428 policy, not a bug.
- **Anything server-side.** Nothing in Postgres reads `BETA_MODE` or `HOTKEY_PRO.beta`.

### RECOMMENDATION — keep the free-for-all, rename the reason

Wolf's constraint (internship / no live entity) means **Stripe cannot go live**, so
`HOTKEY_PREMIUM.enabled` stays `false` and the whole 74-drill catalog stays free regardless.
Against that, `BETA_MODE`'s PRO unlock is worth exactly five perks: ghost replays, plugin layers,
the weakness queue, full desk boards, the race bypass. **Turning it off would take features away
from users on the day we tell them the product is out of beta.** That is the wrong trade.

**Keep the unlock; kill the word.** Rename `BETA_MODE` → `FREE_EVERYTHING` (or
`PRO_FREE_UNTIL_BILLING`), keep it `true`, and change the framing everywhere from
*"free during the beta"* to *"free until billing is live — founder pricing locked in."* One flag,
same behaviour, no copy that expires. The flag flips to `false` in the same PR that flips
`HOTKEY_PREMIUM.enabled` to `true` — i.e. the Stripe PR, which is a separate business decision
already parked at `CONTINUITY.md` §6.2.

---

## 3 · BRAND CHIP

| where | what | verdict |
|---|---|---|
| `nav.js:73` | `<span class="brand-beta">beta</span>` in the shared topnav brand — **every page** | **RETIRE** (Wolf gate) |
| `nav.css:430-433` | `.brand-beta` styles | RETIRE with it |

`LAUNCH.md` phase-0 item 6 says "keep the [beta] chip until PRO pricing is real." That was written
when the curtain was the launch. **If the curtain goes, the chip goes with it** — a public site
with an access-free landing that still wears a `[beta]` badge tells a visitor the product is not
ready, which is the exact impression Wolf is trying to remove. If Wolf wants a hedge, the honest
replacement is `[free]` or nothing. **Wolf's call.**

---

## 4 · COPY STRINGS — every one, with a verdict

### 4a. Player-facing product copy — RETIRE or REWRITE

| file:line | string (abbrev) | verdict |
|---|---|---|
| `drills.js:828` | `betaNote:` — "Beta: PRO perks are free for everyone — with one exception…" | **REWRITE** → "Everything below is free until billing goes live — with one exception. Founding a desk needs a real PRO entitlement…" Keep the desk carve-out sentence verbatim (r428 policy). |
| `drills.js:824` | feature blurb: "…live now, the one PRO perk beta does not give away" | **REWRITE** → "…the one PRO perk that isn't free" |
| `drills.js:793` | `beta: true` (`HOTKEY_PRO.beta`) | **RENAME** → `freeNow: true`. Client-only flag; read by `nav.js` 1493/1498/1499/1513/1517 only. |
| `nav.js:1491` | `window.HK_BETA_EXEMPT = /desk/i` | **RENAME** → `HK_FREE_EXEMPT` |
| `nav.js:1493, 1497-1499, 1512-1517, 1535` | PRO-sheet `betaFree` / `deskCtx` branches + "landing during beta: " roadmap line | **REWRITE** — swap `betaFree`→`freeNow`, and `landing during beta:` → `coming next:` |
| `nav.js:1549-1551` | checkout fallback: "Checkout opens at launch — every PRO perk except founding a desk is already free during the beta." | **REWRITE** → "Checkout isn't live yet — every PRO perk except founding a desk is free right now." |
| `billing.html:153` | "Founder pricing is being set now. Beta players get it locked in" | **REWRITE** → "Early players get it locked in" |
| `billing.html:198` | badge "perks free during beta" | **REWRITE** → "perks free for now" |
| `billing.html:199` | "active — not billed during beta" | **REWRITE** → "active — not billed yet" |
| `billing.html:210` | "Founder pricing and payment collection go live when the beta ends" | **REWRITE** → "…go live when billing opens" |
| `billing.html:224` | "No payments yet — you're on the free beta." | **REWRITE** → "No payments yet — nothing is billed today." |
| `billing.html:233` | "Billing isn't live during beta" | **REWRITE** → "Billing isn't live yet" |
| `billing.html:237` | "Founder pricing is locked in for beta players." | **REWRITE** → "…for early players." |
| `account.html:305` | plan badge "perks free during beta" | **REWRITE** (same as billing) |
| `account.html:310` | "beta players lock in founder pricing" | **REWRITE** |
| `stats.html:683, 725` | analytics header tag `PRO · free in beta` | **REWRITE** → `PRO · free for now` |
| `reference.html:382` | section tag `◆ PRO · free in beta` | **REWRITE** → `◆ PRO · free for now` |
| `About.html:245` | "**Invite-only beta** — built for the summer before the internship." | **RETIRE the invite-only clause.** → "Free to play. Built for the summer before the internship." |
| `contact.html:114` | "hotkey.gg is in private beta — replies come from a small team…" | **REWRITE** → "hotkey.gg is a small team — include enough detail to skip a round trip." |
| `lb.js:1271` | "Beta desks are approved fast." | **REWRITE** → "Desks are approved fast." |
| `profile.html:730` | `Beta: unlock everything` / `Beta unlock active — every skin & title is open` | **REWRITE** → `Dev: unlock everything` (see §5) |
| `profile.html:808-809` | `if(betaOpen)` gate on the custom-title input | **RENAME** var only |

### 4b. Legal / policy copy — Wolf gate, but simple

| file:line | string | verdict |
|---|---|---|
| `terms.html:71` | "It is currently in **beta** and is provided on an 'as is'…" | **REWRITE.** The as-is/as-available disclaimer must survive; only the word "beta" goes. → "It is provided on an 'as is' and 'as available' basis; features may change, be added, or be removed at any time." **WOLF — legal copy.** |
| `security.html:68` | "The Service is in beta and these practices will continue to evolve." | **REWRITE** → "These practices will continue to evolve." **WOLF — legal copy.** |

### 4c. The Charter medal — **STAYS**, description rewritten

| file:line | what | verdict |
|---|---|---|
| `drills.js:593` | `x_charter` mythic — `desc:'Account opened during the beta — you were on the desk before the desk was cool'` | **KEEP the medal. REWRITE the desc** → `'Account opened before launch — you were on the desk before the desk was cool'` |
| `drills.js:589-591` | comment: "auth created_at before the beta cutoff… unobtainable once beta ends" | **REWRITE** → "before the launch cutoff… unobtainable after it" |
| `nav.js:711-712`, `nav.js:926-928` | `charter:` ctx — `created_at < '2026-10-01'` (hardcoded, two copies) | **KEEP the gate. DECIDE the date.** See below. |
| `themes.js:1331-1332` | the `charter` card frame — tab reads **`BETA TESTER`** | **REWRITE the tab** → `CHARTER` (or `FOUNDING`). Retiring the beta while a frame says BETA TESTER is the contradiction. |
| `themes.js:955, 978, 994, 1023-1026` | title id `beta` → label `'Beta Tester'`, earned by `u.beta \|\| u.charter` | **RENAME the label** → `'Charter Member'`. The id is persisted in saved loadouts (`hk_flair`), so **keep the id `beta`** and change only `HK_TITLE_LABELS.beta`. Changing the id orphans every equipped title. |
| `drills.js:598`, `themes.js:2353` | `x_first100` "arms post-beta once PRO purchases are tracked" | comment only — **REWRITE** to "post-launch" |
| `themes.js:2336` | "beta scale reads all-common (1 of 3 players = 33%)" | comment — **REWRITE** to "small-N scale" |

**THE CHARTER CUTOFF IS A LIVE DECISION.** `'2026-10-01'` is a hardcoded literal in **two**
places in `nav.js`. Retiring the beta does not move it, but it means the medal now reads "opened
before launch" while the cutoff is a month after launch day. **WOLF: does the Charter window close
on launch day, or stay at 2026-10-01?** Either answer is fine; the two literals must agree and
should be lifted to one constant (`window.HK_CHARTER_CUTOFF`) in the same PR so they can never drift.

### 4d. Internal comments — REWRITE, zero risk

`index.html:24114, 25362, 28077, 30397-30398, 31050-31053, 31132, 31816-31820, 31956, 31984` ·
`drills.js:310-311, 762, 768, 782` · `nav.js:378, 1330-1352, 1480-1487` · `themes.js:726, 889-898,
946` · `billing.html:191, 200-201, 250-256, 274` · `account.html:306` · `stats.html:472` ·
`supabase/migrations/20260713300000_events.sql:6` · `20260707100000_entitlements.sql:6`
(`source text -- 'stripe' | 'comp' | 'beta'` — a *data* value, leave it, it's historical) ·
`20260713000000_smoke_fixtures.sql:12` · `20260714000000_smoke_fixtures_restamp.sql:9` ·
`20260713100000_remove_edu_signup_gate.sql:3,22` (**do NOT edit** — line 22 is a live
`pg_get_functiondef ilike '%register for the beta%'` predicate; editing the string breaks the
migration's idempotency check) · `20260725100000_desk_create_pro.sql:6,43-66`.

**Rule for the sweep: never edit an applied migration.** Comments in migrations stay as written
history; if they must change, they change in a new migration's header.

### 4e. Bonus find — stale drill counts, unguarded by CI

`About.html:301` "**82 drills**" and `enterprise.html:106` "all **82 drills**" are wrong — the
catalog is **74** (`menuOrder.length`). `dev/e2e-smoke.js:89-104` only guards the exact phrase
`N banker-grade drills`, so these two slipped. **Fix in the same PR** and consider widening the
smoke regex to `(\d+)\s+(banker-grade\s+)?drills\b`.

Also stale: `CONTINUITY.md` §4 says the premium groups gate "**39** of 74". Counted from
`drills.js:37-46`, the four premium chapters hold **40** (10+10+10+10); free is 34 (7+9+9+9).

---

## 5 · DEVICE FLAGS

| key | written by | read by | verdict |
|---|---|---|---|
| `hk_beta_ok` | `index.html:31133` (session), `:31851` (code) | `index.html:30894`, `:31596` | **DELETE.** Also delete from the 30 `dev/` fixtures (§7) and `dev/build-drill-pages.js:38`. Note it is **not** in `nav.js`'s sign-out wipe list — it is a *device* flag, not an account one, so that was correct. |
| `hk_beta_unlock` | `profile.html:898` (password `chicagosux`), `nav.js:384` (owner shim) | `themes.js:891-893`, `profile.html:573` | **KEEP the mechanism, RENAME to `hk_dev_unlock_cosmetics`** — it is a friends/dev cosmetic master switch, not a beta artifact. It IS in the sign-out wipe list (`nav.js:471-472`, r416 bugfix) — **the rename must update that list in the same commit** or the leak r416 fixed comes back. Rewrite the profile button label off "Beta". If Wolf would rather it just die at launch, deleting it is also clean: `themes.js:896-898` documents that `hkFrameEarned()` is the genuine-earn path with no short-circuit. |
| `hk_dev_unlock` | `account.html:827` (with `hk_ranked`) | ranked gate | **DELETE — `LAUNCH.md` phase-0 item 6, flagged "REMOVE AT LAUNCH" since r-early.** Remove the whole `#betaTools` card (`account.html:388-392`) and both handlers (`:827-830`). Both keys must go together. |

---

## 6 · LAUNCH.md PHASE-0 ITEMS THAT BECOME DUE THE MOMENT THE CURTAIN GOES

Retiring the curtain **is** the launch, so `dev/LAUNCH.md` phase 0 stops being a future checklist
and becomes this PR's blocking list.

| LAUNCH.md | item | state today | in this PR? |
|---|---|---|---|
| 0.1 | events table + funnel data | **SHIPPED** r139 (`20260713300000_events.sql`, 10 fire points) | ✅ no action |
| 0.2 | Morning Sheet + streak insurance | **SHIPPED** r140 | ✅ no action |
| 0.3 | pilot cohort running | **NOT DONE** | **WOLF** — a judgement call, not a gate on this PR |
| 0.4 | T&S minimums (`dev/TRUST_SAFETY.md`) | partial | **WOLF** — report-queue habit + force-rename/suspend scripts |
| 0.5 | remove the smoke-u fixture | **DUE** — `delete from teams where slug='smoke-u'`; smoke accounts listed in `dev/SMOKE_REPORT.md` | **YES — new migration** |
| 0.5b | the seed field | **DUE, decision** — 50 seed players + 2 private desks under the `5eed…` id namespace; `dev/seed-clear.sql` clears every row in one transaction | **WOLF decides.** Recommend: **keep for launch week** (empty boards on day 1 are worse than seeded ones), clear at day 7. The script is the whole cleanup either way. |
| 0.6 | beta-tools sweep | **DUE** — `hk_dev_unlock` (§5) + the copy sweep (§4) + the `[beta]` chip (§3) | **YES** |
| 0.7 | PRO posture | **DECIDED** — see §2: keep the unlock, rename the flag | **YES** |
| Phase 1.2 | cache bump | — | **YES**, see §8 |
| Phase 1.5 | the funnel to watch | — | see §9 |

---

## 7 · CI / TEST SURFACE

### Must change
| file | what | change |
|---|---|---|
| `dev/e2e-audit-onboard.js` | **T1** (`:43-60`) asserts the curtain shows, a wrong code errors, `hags` passes. **T9** (`:410-431`) asserts the curtain's tagline + mailto door (r450 P0-3). Stub at `:28-31` mocks `curtain_check`. | **Delete T1 and T9; replace with a landing-v2 suite** — see Part II §7. Net assertion count should not drop: T1's three become "fresh device lands on the landing, no gate element, Enter starts a run"; T9's four become the landing-content asserts. |
| `dev/check-startgate.js:53` | sets `hk_beta_ok` in the fixture | drop the line |
| `dev/e2e-audit-parity.js:16` | same | drop |
| `dev/build-drill-pages.js:38` | same, in the **generator** | drop → then **regenerate all 74 drill pages** (`gate.yml` runs a regenerate-and-diff drift check; a stale generator fails CI) |
| 28 further `dev/` suites | one-line `localStorage.setItem('hk_beta_ok','1')` fixture each: `e2e-alt-paths`, `e2e-audit-rank`, `e2e-audit-visual`, `e2e-fit-sweep`, `e2e-formulas`, `e2e-grid-height`, `e2e-guided`, `e2e-mac-input`, `e2e-par-sweep`, `fit-flake-hunt`, and `verify-{cascade,cfslink,comps,covtable,dcfsens,debtsched,fcfbuild,football,intsched,isbuild,retbridge,revolver,schedule,sourcesuses,txncomps,waterfall}` | **harmless if left** (a write to a key nobody reads), **but sweep them** — a stale fixture is a false clue for the next reader. One `sed`, one gate run. |
| `dev/e2e-smoke.js:40, 56-58` | `earnIgnoresBeta` invariant — sets/clears `hk_beta_unlock` to prove the genuine-earn sweep ignores the blanket grant | **KEEP the invariant**, rename with the key (§5). This is a real regression guard. |

### Unchanged
`dev/check-paywall.js` (reads `HOTKEY_PREMIUM` only — zero beta refs), `dev/check-invariants.js`,
`dev/check-cache-versions.js`, `dev/check-borders.js`, `dev/check-pause.js`,
`dev/e2e-depth-mechanics.js` (its two hits are greek β), `.github/workflows/gate.yml` (the
path-gate already fires on `index.html`/`drills.js`/`dev/`, so this PR runs the full engine matrix).

---

## 8 · THE RETIREMENT PR — ONE CHECKLIST

**Scope note:** this is a single PR. It touches `index.html`, `drills.js`, `nav.js`, `nav.css`,
`themes.js`, `profile.html`, `billing.html`, `account.html`, `stats.html`, `reference.html`,
`About.html`, `contact.html`, `terms.html`, `security.html`, `enterprise.html`, `lb.js`, one new
migration, 32 dev suites, and 74 regenerated drill pages. Big, but every hunk is a string or a
deletion — there is one behavioural change (the curtain) and one rename with teeth (`hk_beta_unlock`).

### A · The curtain — **DELETE IT, don't flip the flag**

- [ ] **Delete** `showPrelaunchLock()` (`index.html:31816-31856`), `closeGate()` (`:31857`),
      `#gate` (`:2144`), `.gate*` CSS (`:1256-1264`), `PRELAUNCH_LOCK` (`:2160`) and its comment,
      the boot branch (`:30892-30894`), the `closeAuth` re-raise (`:31595-31596`), the
      `hk_beta_ok` write in `onSession` (`:31133`), the four `gateOpen` guards
      (`:27235, 27293, 29751, 29783`), the `gateOpen` declaration (`:2186`), and the two
      `closeGate()` calls in `advanceAccess()` (`:31765, 31767`). **WOLF — user-visible.**
- [ ] Keep `INVITE_AUTO_CODE = 'HAGS'` (`:2162`) — it is the **per-session member auto-redeem**,
      unrelated to the curtain; the curtain only borrowed it as an offline fallback. Verify the
      `onSession` redeem still compiles once the curtain's reference is gone.
- [ ] New migration `supabase/migrations/2026…_retire_curtain.sql`:
      `revoke execute on function public.curtain_check(text) from anon, authenticated;`
      `drop function if exists public.curtain_check(text);`
      `drop table if exists public.beta_codes;` — and in the same file, LAUNCH 0.5:
      `delete from public.teams where slug='smoke-u';`

**Why delete and not `PRELAUNCH_LOCK=false`.** `LAUNCH.md`'s rollback story is "flip the flag back
to true + cache bump", and that story **depends on the flag existing**. Three reasons to spend it
anyway:

1. **The rollback is worthless once the landing changes.** Re-raising the curtain over a landing
   built to explain the product to strangers puts the beige card back in front of the thing that
   replaced it. The rollback we actually want is `git revert` on this PR — same one-commit,
   same-minutes-to-deploy, and it restores the landing too.
2. **It cannot un-ring the bell.** The curtain gates **new devices only**; every device that has
   ever passed carries `hk_beta_ok` forever. Re-raising it locks out only people who have never
   visited — the exact population a rollback is supposed to protect.
3. **A dead flag rots.** `PRELAUNCH_LOCK=false` leaves ~55 lines of code, 30 test fixtures and a
   server RPC alive-but-unreachable, and the next reader must re-derive that it's dead.

**If Wolf wants the hedge:** keep `PRELAUNCH_LOCK` as a one-line flag whose only job is a
maintenance/"we're back soon" splash, or set the curtain aside as a revert-able first commit in
the PR. State the choice; don't leave it implicit.

### B · `BETA_MODE`
- [ ] Rename `BETA_MODE` → `FREE_EVERYTHING` at `index.html:2155` and `:31081`. Value stays `true`.
      Update the comments at `:30397-30398` and `:31050-31053`.
- [ ] `HOTKEY_PREMIUM.enabled` stays **`false`** — untouched. Catalog stays free. (`check-paywall`
      §1 keeps asserting it.)
- [ ] Rename `HOTKEY_PRO.beta` → `HOTKEY_PRO.freeNow` (`drills.js:793`) and its 5 `nav.js` readers.

### C · Copy sweep (§4)
- [ ] 4a — 22 product strings. **WOLF — all user-visible.**
- [ ] 4b — `terms.html:71`, `security.html:68`. **WOLF — legal.**
- [ ] 4c — Charter medal desc + `BETA TESTER` frame tab + `HK_TITLE_LABELS.beta` label.
      **Keep the medal, keep the title id.** **WOLF — decide the charter cutoff date** and lift
      `'2026-10-01'` from `nav.js:712` + `:928` into one constant.
- [ ] 4d — internal comments. No Wolf gate. **Do not edit applied migrations.**
- [ ] 4e — `82 drills` → `74` in `About.html:301` + `enterprise.html:106`; widen the
      `e2e-smoke` count regex; fix `CONTINUITY.md` §4's "39 of 74" → 40.
- [ ] Brand chip `nav.js:73` + `nav.css:430-433`. **WOLF.**

### D · Flag wipes (§5)
- [ ] `hk_beta_ok` — delete every write and read (client + 32 dev fixtures + generator).
- [ ] `hk_dev_unlock` + `hk_ranked` — delete `#betaTools` (`account.html:388-392`) and handlers
      (`:827-830`). Leave the keys in `nav.js:471-472`'s sign-out wipe list (harmless, defensive).
- [ ] `hk_beta_unlock` → `hk_dev_unlock_cosmetics`: rename at `profile.html:898`, `nav.js:384`,
      `themes.js:891`, **and `nav.js:471-472` (the sign-out wipe list — r416)**. Update
      `dev/e2e-smoke.js:56-58`. Add a one-release compatibility read of the old key if Wolf
      cares about friends' existing unlocks.

### E · Cache + CI
- [ ] Bump `?v=` for **every** changed shared asset — `drills.js` (301→302), `nav.js` (303→304),
      `nav.css` (210→211), `themes.js`, `lb.js` — across **all** `*.html`. `dev/check-cache-versions.js`
      enforces one version per asset site-wide; `GATE_BASE=<sha>` also enforces that a changed
      asset moved. **Grep, don't count from memory** (`LAUNCH.md` phase 1.2).
- [ ] Regenerate the 74 drill pages after `build-drill-pages.js` changes (gate.yml drift check).
- [ ] Rewrite `e2e-audit-onboard` T1/T9 (§7 + Part II §7). Sweep the 30 fixture lines.
- [ ] Full gate: `check-invariants` · `check-cache-versions` · `check-paywall` · `check-startgate` ·
      `check-borders` · `e2e-smoke` · `e2e-audit-onboard` · `e2e-audit-parity` · `e2e-lb` ·
      `e2e-guided` · `e2e-alt-paths` · `e2e-demo-replay` · `e2e-mac-input`.

### F · Deploy + watch
- [ ] Merge → Pages deploys in minutes.
- [ ] Live verify in incognito: landing renders (no gate) → Enter → guest session → tour →
      placement → one drill posts. Sign up with a real email. (`LAUNCH.md` phase 1.4.)
- [ ] Wolf posts the launch note (LinkedIn + club channels); seed-desk staffers get a day-ahead
      heads-up.

### Wolf gates, consolidated
Everything user-visible is a standing Wolf gate. Specifically: **the curtain deletion** ·
**the `[beta]` chip** · **all 22 product copy strings (§4a)** · **the two legal strings (§4b)** ·
**the Charter medal desc + `BETA TESTER` frame tab + charter cutoff date (§4c)** ·
**the seed-field decision (LAUNCH 0.5b)** · **the whole of Part II's landing copy** ·
**the pilot-cohort and T&S judgement calls (LAUNCH 0.3, 0.4)**.
No Wolf gate: internal comments, dev fixtures, flag renames, cache bumps, the new migration.

---

## 9 · THE FUNNEL TO WATCH (LAUNCH.md phase 1.5)

`hkEvent` (`nav.js`) writes to `public.events` (insert-only RLS, **no select policy** — reads are
service-role). The 10 fire points are listed at `dev/AUDIT.md:5956`.

**The funnel changes shape.** Today: `pv → curtain_pass → enter → tour_done → first_solve →
account_session`. After this PR **`curtain_pass` is dead** — `pv → enter` is the new top, and it is
the number that matters, because it is the first honest measure of whether the landing sells.

- [ ] Add a `landing_cta` event (or reuse `enter` with `meta:{src:'hero'|'key'|'catalog'}`) so
      Part II's several entry points are separable.
- [ ] Baseline before the merge: pull the last 14 days of `curtain_pass → enter → tour_done →
      first_solve` from the beta cohort. **`curtain_pass → enter` in beta is the bar the new
      `pv → enter` must beat** — beta traffic was pre-qualified (someone handed them a code), so
      a drop is expected; the size of the drop is the signal.
- [ ] Watch daily for a week: `pv → enter` (does the landing convert?), `enter → tour_done` (did
      a longer landing make the tour feel redundant?), `tour_done → first_solve`, D1 return.
- [ ] `enter → first_solve` cratering vs beta = something broke. Under the delete-the-curtain
      recommendation the revert is `git revert` + cache bump, not a flag flip.

---
---

# PART II — LANDING V2

## 1 · What is there today (and why it isn't a landing)

Behind the curtain sits `index.html:2125-2141` — 16 lines. r314 deliberately **stripped it from a
marketing splash to a start prompt**: brand, eyebrow "Keyboard-only Excel training", `Ready to
drill?`, a Start button, a Log in button, two mode chips, one micro hint. It is a **dialog over the
game** (`.landing` is `position:fixed` with a blurred backdrop, `index.html:1868-1876`), and
`html.hk-returning .landing{display:none}` (`:1907`) hides it entirely for returning users.

That was right when the curtain did the explaining. With the curtain gone it is the **entire**
first impression, and it explains nothing. The real explanation lives on `About.html` — a page most
visitors will never click.

**Two latent bugs the rework should absorb:**
1. **The desk-invite preview is already broken.** `index.html:31797-31800` looks up
   `$('landing').querySelector('.lede')` to write *"You've been invited to join {desk} — {n} on the
   desk."* The current landing has **no `.lede` element** (r314 removed it), so the branch silently
   falls through to a toast. Landing v2 must ship a `.lede` and re-point that write.
2. `.landing h1` is declared **twice** (`:1882` `23px`, `:1913` `clamp(42px,7.5vw,70px)`) — dead
   CSS from the r65 dialog experiment. Clean it out.

## 2 · The shape

> **One screen that answers "what is this", then a page that answers "why should I".
> The player never has to scroll to start.**

The landing stays a **dialog over the live trainer** — that is the r65 doctrine and it is why
`Enter` can hand off to the grid instantly. It gets **wider and taller with scrollable content
below the fold**, not a separate page. Rationale: a separate marketing page means a navigation
round-trip before the first keypress, and the 30-second loop is the product's best salesman.

```
┌─ hotkey.gg ───────────────────────────────── themes · sign in ─┐
│                                                                 │
│  KEYBOARD-ONLY EXCEL TRAINING                                   │
│  Get fast at the pages          ┌──────────────────────────┐    │
│  you actually build.            │  live grid preview /     │    │
│                                 │  looping demo replay      │    │
│  74 timed drills on a real      │  A  B  C  D  E            │    │
│  spreadsheet. Graded on the     │  1 Revenue  1,240         │    │
│  finished page, not the         │  2 COGS      (610)        │    │
│  keystroke.                     │  3 Gross      630 ◄       │    │
│                                 │       alt · = · ↵         │    │
│  [ Press ↵ to start ]  log in   └──────────────────────────┘    │
│  no account · no install · free                                 │
├─────────────────────────────────────────────────────────────────┤
│  01 a real task   02 keyboard only   03 graded on the page      │
├─────────────────────────────────────────────────────────────────┤
│  THE CATALOG · 8 chapters, 74 drills   (chapter rail w/ counts) │
├─────────────────────────────────────────────────────────────────┤
│  proof: live board rows · desks · certificates                  │
├─────────────────────────────────────────────────────────────────┤
│  for teams → enterprise            [ Press ↵ to start ]         │
└─────────────────────────────────────────────────────────────────┘
```

## 3 · Section by section

### 3.1 HERO — one screen, one keypress

- Eyebrow, H1, a **two-sentence** lede, one primary CTA, a quiet `log in`, and a trust micro-line.
- **The mode chips (Classic / ⚡ Rapid-fire) stay** — they set `pendingMode`
  (`index.html:28197`), and dropping them breaks the rapid-fire entry path. Demote them below the
  CTA as a quiet toggle.
- **`Enter` remains the single fastest path.** `index.html:27235` already routes a bare Enter on
  the landing to `tryEnter()`. Do not add a focus trap or an input that steals it.
- **The visual:** see §4.

### 3.2 HOW IT WORKS — three beats

Three cards, one line each. This is the whole pitch and it must fit above the second scroll.

1. **A real task, not a lesson.** — a page a banker would recognise
2. **Keyboard only.** — reach for the mouse and the run is flagged
3. **Graded on the finished page.** — end-state grading, medals, boards

### 3.3 THE CATALOG AT A GLANCE

A horizontal rail of 8 chapter cards, **counts derived at runtime** from
`window.HOTKEY_DRILLS.groups` — never hardcoded (`e2e-smoke` §drill-count is the precedent, and
`drills.js:31` says "menuOrder.length is the source of truth").

| chapter | n | today |
|---|---|---|
| Foundations | 7 | free |
| Formatting | 9 | free |
| Formulas I | 9 | free |
| Data & Lookups | 9 | free |
| Formulas II | 10 | free · PRO chapter |
| Models I · Valuation | 10 | free · PRO chapter |
| Models II · Credit | 10 | free · PRO chapter |
| Full Builds | 10 | free · PRO chapter |

34 free-tier + 40 in the four `HOTKEY_PREMIUM.groups` = **74**. **Label honestly:** while
`HOTKEY_PREMIUM.enabled === false` every one of the 74 is playable, so the badge must read
**"free right now"** on the PRO chapters, not "PRO" or "locked". Derive the badge from
`window.hkPremiumOn()` so the day the flag flips the rail relabels itself with no copy edit.

### 3.4 PROOF

- **Live board rows** — top 3 on one board, pulled from the same read `leaderboard.html` uses.
  Guard it: `sb` may be null (deferred CDN, `index.html:2173-2185`) and the landing must render
  identically without it. Static placeholder rows, replaced on resolve.
- **Desks** — one line + a school-colours chip, link to `desks.html`.
- **Certificates** — the three tracks (fluency / formulas / modeling), link to `cert.html`.

### 3.5 FOR TEAMS

Two lines and a link to `enterprise.html`. Do not restate the enterprise page here.

### 3.6 THE CLOSE

Repeat the single CTA. Nothing new below it.

## 4 · The hero visual — feasibility

Three options, in order of what we should build:

**(a) A static styled grid still, hand-built in the landing's own markup. — SHIP THIS.**
Zero engine coupling, zero risk to first paint, works with `sb` null, screenshot-stable for CI.
`About.html:340-395` already ships a looping CSS/JS keycap animation with no engine dependency;
the same technique, one file over. **This is what `art/landing-mock.html` implements.**

**(b) A real demo replay through `playDemo()`. — POSSIBLE, NOT RECOMMENDED NOW.**
The machinery is genuinely there: `playDemo()` (`index.html:29639-29668`) walks
`CHALLENGES[cur].demo`'s moves, drives `demoKey()` into the real engine, and every drill ships a
demo script (`e2e-demo-replay.js` runs all 74). But: it takes the **real** `#grid` over, which sits
*under* the landing; it calls `loadChallenge(cur)` twice and `hkGateClear()`; `ghostCurTick`
(`:24139`) explicitly bails while `demoPlaying`. Running it under a landing overlay means either
un-blurring the backdrop (the landing stops being a dialog) or mounting a second grid (a second
engine instance). **Both are a round of their own.** If Wolf wants it: the cheap version is to let
the landing's backdrop go transparent and run `playDemo('navigation')` on the live grid behind it —
the drill is *literally* the hero image. Worth a prototype, not worth blocking this PR.

**(c) A recorded trace replay.** Every run since r9 stores timestamped keystrokes
(`STRATEGY.md` calls it "a goldmine nothing reads today"), and `ghostSteps` already replays them
(`:24107-24154`). A canned trace → a tiny standalone player is the best-looking option and the most
work. Park it.

## 5 · THE COPY (house voice: lowercase confidence, banker's-desk register, no hype)

**Rules observed:** no "revolutionize", "supercharge", "unlock your potential", "AI", "10x". No
exclamation marks. Numbers instead of adjectives. The reader is an analyst who has already been
sold to badly.

### Hero
> **eyebrow** — keyboard-only excel training
>
> **h1** — Get fast at the pages you actually build.
>
> **lede** — 74 timed drills on a real spreadsheet — debt schedules, three-statement ties,
> covenant tables. You're graded on the finished page, not on which key you pressed to get there.
>
> **cta** — `Press ↵ to start`
> **secondary** — `log in`
> **micro** — no account, no install. free while we're building. everything is keyboard — reach for
> the mouse and the run gets flagged.

### How it works
> **section label** — how it works
> **h2** — Three minutes, start to graded.
>
> **01 · a real task, not a lesson** — Every drill opens on a page a banker would recognise as
> their own file. Build the schedule, tie the statements, foot the covenant table. Nothing is a
> toy example.
>
> **02 · keyboard only** — Alt walks the ribbon, Ctrl does the rest, and the mouse is a foul.
> That constraint is the whole product: it's how fast modelers actually work.
>
> **03 · graded on the finished page** — The clock stops when the page is right. Par times,
> medals at pass / pro / legendary, hidden ☆ for the efficient route, and every clean run posts
> to the board.

### Catalog
> **section label** — the catalog
> **h2** — Eight chapters. Seventy-four drills.
> **sub** — A difficulty spine, not a menu. Foundations teaches the hands; Full Builds hands you a
> blank sheet and a deadline.
> **badge on the back four** — free right now

### Proof
> **section label** — the board
> **h2** — Every run has a time on it.
> **sub** — Live boards per drill, ranked tiers, daily and weekly gauntlets. Desks for your club
> or your analyst class, with school standings. Three certificate tracks when the times hold up.

### Teams
> **section label** — for desks
> **h2** — Bring the whole analyst class.
> **sub** — Private boards, weekly assignments the staffer pins in one click, and a cohort report
> worth forwarding. Free for clubs. → `see how desks work`

### Close
> **h2** — Your first run takes thirty seconds.
> **sub** — one drill · one clock · no mouse
> **cta** — `Press ↵ to start`

### Footer micro
> Excel is a registered trademark of Microsoft Corporation. hotkey.gg is independent and not
> affiliated with or endorsed by Microsoft.

## 6 · Implementation notes for whoever builds it

- Landing v2 lives **in `index.html`** (the `.landing` block, `:2125-2141`, and its CSS at
  `:1868-1930`). It is not a new page. `About.html` stays as the long-form explainer and should
  lose its `Invite-only beta` line (§4a).
- **`html.hk-returning .landing{display:none}` must keep working** — returning users must never
  see the marketing landing. Verify with `e2e-audit-onboard` T3 (`:147`).
- The landing scrolls; the **hero must fit 1280×800 and 390×844 without scrolling.**
- **Ship a `.lede` element** and re-point the desk-invite write (`index.html:31797-31800`).
- Delete the duplicate `.landing h1` rule (`:1882` vs `:1913`).
- Chapter counts and the free/PRO badge derive from `HOTKEY_DRILLS.groups` / `hkPremiumOn()` at
  render. No hardcoded totals anywhere in the markup.
- Everything must render with `sb === null`. The trainer runs fully offline by design.
- Mobile: `index.html` already ships a "needs a real keyboard" interstitial (`:2118-2124`). The
  landing should read well on a phone anyway — that is the share surface — but the CTA on mobile
  should point at the explainer, not at a drill.

## 7 · The tests that replace T1/T9 in `dev/e2e-audit-onboard.js`

- [ ] a fresh device sees **no** `#gate` element and the landing is visible
- [ ] the hero names the product (`/excel/i`) and the CTA is reachable without scrolling at 1280×800
- [ ] a bare `Enter` on the landing starts a guest session and dismasses the landing (existing T2 path)
- [ ] the chapter rail renders 8 chapters and its counts sum to `HOTKEY_DRILLS.menuOrder.length`
- [ ] the free/PRO badge tracks `hkPremiumOn()` (assert both states via `?premium=preview`)
- [ ] `html.hk-returning` hides the landing (existing T3)
- [ ] the desk-invite deep link `?desk=CODE` writes into `.lede` (the bug from §1)
- [ ] zero page errors with `sb` stubbed to null

## 8 · The mock

`art/landing-mock.html` — static, unwired, site fonts + palettes, `?theme=light` to swap.
Renders: `art/landing-mock-dark.png` (1280) · `art/landing-mock-light.png` (1280) ·
`art/landing-mock-mobile.png` (390). All copy is §5 verbatim.
