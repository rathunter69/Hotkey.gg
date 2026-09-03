# Hotkey.gg — read-only bug sweep (long version)

Worktree `agent-a2fd0ead09a943ea2`, served on **:8803** (never 8791). Chromium 1194 via
`NODE_PATH=/opt/node22/lib/node_modules/playwright/node_modules`, `chromium.launch({args:['--no-sandbox']})`.
Everything exercised **signed-out / anon** — the sandbox has no egress to supabase.co, so every
page logs `net::ERR_CONNECTION_RESET` for the SDK + REST calls. **No repo file was edited.**

---

## 1. Gate suites

All harnesses were run from the worktree against `:8803`. Port discipline: 12 of the 14 honour
`process.env.URL` / `BASE`. **`dev/e2e-audit-visual.js:47` hard-codes `http://127.0.0.1:8791`
with no override** (same for `dev/e2e-audit-rank.js:66,96,127,147`) — in a parallel worktree those
two silently test whatever another agent is serving on 8791. That is the exact defect r438 fixed
for `e2e-audit-onboard`. I ran audit-visual against a port-patched **copy** in the scratchpad.

| suite | last line |
|---|---|
| `check-invariants` | `STATIC INVARIANTS: clean` (exit 0) |
| `e2e-smoke` | `SMOKE: ALL 7 PAGES CLEAN + skin-unlock` (exit 0) |
| `REPS=2 e2e-demo-replay` (all 74) | `E2E: ALL GREEN` — 74/74 `WIN 2/2` (exit 0) |
| `e2e-alt-paths` | `ALT PATHS: ALL 160 PASS` (exit 0) |
| `e2e-guided` | `GUIDED GATE: ALL 77 PASS (72 railed)` (exit 0) |
| `e2e-fit-sweep` | **NOT COMPLETED** (twice). Run 2 sat at `page.evaluate` inside the post-solve replay (`dev/e2e-fit-sweep.js:48`) for **2 h 19 m with 1 s of node CPU** — the node side was blocked, the page was spinning. Another session on this box was concurrently running its own matrix on :8799, so I cannot separate a real hang from starvation. An instrumented copy with a 30 s time-box per evaluate cleared 8 drills cleanly before I stopped it. Note the suite prints **nothing** until the end and has no per-drill timeout, so a hang and slow progress are indistinguishable from its output — worth fixing regardless of the cause. |
| `e2e-audit-visual` (port-patched copy) | **`VISUAL MATRIX: 108 FAILURE(S), 271 PASS`** |
| `e2e-grid-height` | `GRID-HEIGHT: ALL INVARIANTS HOLD` (exit 0) |
| `e2e-formulas` | `FORMULA PACK: ALL 102 PASS` (exit 0) |
| `e2e-numfmt` | `NUMFMT: ALL PASS` (exit 0) |
| `e2e-borders` | `BORDERS: ALL PASS` (exit 0) |
| `check-borders` | `BORDER RENDER: clean` (exit 0) |
| `check-pause` | `ALT-TAB PAUSE: clean` (exit 0) |
| `e2e-lb` | `LB SUITE: ALL 36 PASS` (exit 0, clean re-run) |

---

## 2. Findings

### P0

**P0-1 · The three public legal pages are published as unfinished drafts.**
`privacy.html:64,66` · `terms.html:64,66` · `security.html:64,66`.
Every one renders a visible banner — "⚠ Draft for review … replace every [bracketed] placeholder" —
and "Draft · last updated **[DATE]**". 13 placeholders survive: `[LEGAL ENTITY / OPERATOR]` ×2,
`[DATE]` ×3, `[jurisdiction]`, `[venue]`, `[operator]` ×2, `[bracketed]` ×2, `[hosting provider]`,
`[country]`, `[hotkey.gg domain]`. All three are linked from every page footer and listed in
`sitemap.xml`. Expected: a finished ToS/Privacy/Security page. Actual: a reviewer's draft, live.
Fix: fill the placeholders, delete the `.legal-draft` banner and the `.legal-ph` spans.
Effort: 30 min + a legal read. Auto-fixable: **no** (needs Wolf's entity/jurisdiction facts).

### P1

**P1-1 · The sheet never re-fits when the window is resized — it overflows its frame by ~200 px.**
Repro: open a drill at 1440×900, shrink the window to 960 wide. Measured (probe4):
`A0 @1440x900 {sw:870, cw:880}` → `A1 width-only shrink to 960 {sw:852, cw:650}` = **+202 px overrun**;
one explicit `render()` → `{sw:640, cw:650}` fits. A **fresh** load at 960×600 fits (640/650), so the
math is right — it is simply never re-run. Cause: `index.html:27774-27804`. That block is a top-level
`{ … }` that executes **once at script load**; the r409 ResizeObserver is stashed on `S._gridRO`, and
every `loadChallenge()` replaces `S`, so the handle is dropped and the block never runs again — probe
reads `S._gridRO` as **false** on a loaded drill. The only `window resize` listener
(`index.html:25101`) re-renders the sheet tabs, not the grid; fullscreen escapes it only because
`__fsRefit` calls `render()` by hand. Every one of the 12 drills swept overran (845–923 px in a 650 px
wrap). Fix: hoist the observer to a module-level `window.__gridRO` (observe `#gridwrap` once) **and**
add `window.addEventListener('resize', …)` → debounced `render()`; also compare width, not only
`clientHeight`, in the observer guard. Effort: 15 min. Auto-fixable: **yes**.

**P1-2 · Escape can never close the sign-in / create-account modal.**
Repro: any "Sign in" / "Create an account" CTA → the modal opens with `#authEmail` focused → press Esc.
Traced keydown: `Escape target=INPUT#authEmail defaultPrevented=false`, `authOpen` stays `true`, and
the modal re-focuses the field even after `document.body.focus()`. Cause: `index.html:26984`
(`if(e.target.tagName==='INPUT'||'TEXTAREA') return;`) sits **above** the `authOpen` Escape branch at
`index.html:27051`. The `?` sheet promises "Esc — close menus & modals" (`index.html:28641`).
Only the "cancel" link closes it. Same class applies to any input-focused modal (handle prompt, desk
fields). Fix: handle Escape for `authOpen` before the INPUT bail, or bind `onkeydown` Escape on the
auth inputs. Effort: 10 min. Auto-fixable: **yes**.

**P1-3 · `billing.html` is the only nav page that does not load `drills.js`.**
Console on every viewport/theme: `nav.js: drills.js not loaded — profile modal will be empty`.
`billing.html:77-81` loads `themes.js` then `nav.js` with no `drills.js`; all 16 other nav pages load it.
Expected: the nav player-card modal renders. Actual: it is empty on billing.
Fix: add `<script src="drills.js?v=300"></script>` before `nav.js`. Effort: 1 min. Auto-fixable: **yes**.

**P1-4 · `dev/e2e-audit-visual.js` fails 108/379 on a clean tree — the theme-contrast net is dead.**
`VISUAL MATRIX: 108 FAILURE(S), 271 PASS`. The failures are 4 assertions × all 27 themes, identical
everywhere: `gridlines visible vs sheet bg — contrast null`, `APPLIED borders read as ink vs bg —
contrast null`, `font swatch "black" legible — contrast 1.38` (1.72 on daylight, where black-on-paper
should be ~19:1), `font swatch "darkgray" legible — contrast 2.03`. `contrast null` on every theme
means the probe can no longer read the colour at all (it still reads `td.ball`'s `boxShadow` for
border ink — borders moved to the `.brd` overlay, `index.html:563`), and the swatch numbers show
`m.bg` is not the sheet background either. So it is the harness that is stale, not 27 themes.
It is also **not in `.github/workflows/gate.yml`**, which is why it rotted unnoticed (nor are
`e2e-fit-sweep`, `e2e-numfmt`, `e2e-borders`, `e2e-cellstyles`, `e2e-findreplace`, `e2e-fontsize`,
`e2e-clear-menu`, `e2e-onboard-sandbox`, `e2e-audit-rank`, `e2e-par-sweep`).
Fix: re-point the probes at the current DOM, add the `URL=` override, then wire it into the gate.
Effort: 1-2 h. Auto-fixable: **no** (needs judgement about intended contrast).

**P1-5 · `About.html` scrolls sideways on a phone (+178 px).**
390×844, both themes: `document.scrollWidth - clientWidth = 178`. Cause: `About.html:79-83`
`.hero-glow{position:absolute; left:50%; transform:translateX(-50%); width:760px …}` inside
`.hero{position:relative}` (`About.html:78`) with no overflow clipping — measured `left=-192, right=568`.
Fix: `overflow:hidden` (or `overflow-x:clip`) on `.hero`, or cap `.hero-glow` at `max-width:100vw`.
Effort: 1 min. Auto-fixable: **yes**.

**P1-6 · `stats.html` scrolls sideways on a phone (+301 px).**
390×844, both themes. Cause: `stats.html:73` `.ach-filters{display:inline-flex; gap:6px; margin-left:14px}`
— the six rarity chips never wrap; measured `.ach-filters right=691` and the last `.ach-rf` at `631-691`
against a 390 px viewport.
Fix: `flex-wrap:wrap` + drop `margin-left` under a mobile media query.
Effort: 2 min. Auto-fixable: **yes**.

**P1-7 · `index.html?drill=<key>` silently lands a new visitor on Navigation maze for 49 of the 74 drills.**
Repro (fresh profile, no runs): `http://…/index.html?drill=scrub` or `?drill=wacc` → `cur` is
**`navigation`**, no gate explainer on screen (`gateInfo:false`), no toast, no copy saying why.
`?drill=filldr` / `?drill=combo` / `?drill=foot` (unlocked) load correctly, so the deep link itself works.
Measured: a signed-out visitor with no PBs has **49 of 74 drills locked** (`drillLocked()` →
`groupUnlocked()` reads `_pro`, not `isPro()`, so `BETA_MODE` does not open them — `index.html:30122-30132`).
Cause: `index.html:30495-30496` sets `startKey` from `?drill=`, then `loadChallenge()`
(`index.html:30180-30187`) sees the tier lock and, because no board exists yet at boot,
takes `key = nextUnlockedFrom(-1)` — the r174 "never strand an empty grid" fallback — after calling
`openGateInfo()`, which does not survive the boot render. Every one of the 74 public SEO drill pages
(`drills/*.html`), plus the `drills/index.html` library and each drill page's "next drills" rail, points
at `index.html?drill=<key>`, so two thirds of the site's organic landing traffic arrives on the wrong
drill with no explanation. Same silent fallback swallows an unknown key (see P2-2).
Fix: at boot, keep the requested key in a pending slot and show `openGateInfo()` (or a toast) after the
first render — "Scrub the export unlocks at …, here's Navigation maze meanwhile".
Effort: 30 min. Auto-fixable: **partly** (the message is a copy decision).

### P2

**P2-1 · A toast fired during the spotlight tour renders *under* the tour scrim.**
Reproduced: with the tour up, `showToast()` then `document.elementFromPoint()` at the toast's centre
returns **`tourWrap`**. `#hkToast` is `z-index:220` (`index.html:838`), `.tour-wrap` is `z-index:340`
with a `rgba(16,17,21,.55)` `::before` scrim (`index.html:1711-1713`). The tour's ENTRY and DO-IT beats
deliberately let real grid keys through (`index.html:27024-27043`), so gameplay toasts are reachable
while it is up. Fix: raise `#hkToast` above 340 (e.g. 360). Effort: 1 min. Auto-fixable: **yes**.

**P2-2 · `drills/colops.html` is an orphaned SEO page for a retired drill, and its CTA lands on the wrong drill.**
`colops` was retired into `rowops` (`drills.js:38`, `index.html:6810-6813`), and `check-invariants` even
guards against harnesses naming it — but `drills/colops.html` still ships (76 files in `drills/` =
74 drills + `index.html` + `colops.html`). It is not in `sitemap.xml` and not linked from
`drills/index.html`, so it is reachable only by direct URL / a stale search result. Its CTA points at
`index.html?drill=colops`; probed, that **silently loads Navigation maze** (`cur:"navigation"`, no
message, no error) — as does any unknown key. Expected: 404, or a redirect to `drills/rowops.html`.
Fix: delete the file (add a redirect if it has traffic). Effort: 2 min. Auto-fixable: **yes**.

**P2-3 · 14 of 17 pages load `drills.js` twice (adjacent duplicate tags, 78 KB re-parsed).**
`index.html:1838,1840` · `account.html:171,173` · `admin.html:56,58` · `cert.html:65,67` ·
`contact.html:53,55` · `desks.html:31,33` · `enterprise.html:69,71` · `leaderboard.html:31,33` ·
`privacy.html:40,42` · `profile.html:61,63` · `reference.html:134,136` · `security.html:40,42` ·
`stats.html:193,195` · `terms.html:40,42`. Looks like a shared-header insertion bug.
Fix: delete the second tag on each. Effort: 5 min. Auto-fixable: **yes**.

**P2-4 · The `?` shortcut sheet mis-describes F1 and omits three real shortcuts.**
`index.html:28625` lists `['F1','toggle guided hints (paint-by-numbers walkthrough)']`, but F1 calls
`toggleHints()` — tips only, no cursor lock (`index.html:27391`, whose own comment says
"F1 = hints; guided is its own control"). Guided is **`g`** (`index.html:27077`), and the sheet lists
`g` only under "in a rapid-fire session". Also missing: **Esc·Esc restarts** (`index.html:27494`, the
engine even toasts "esc·esc restarts", and the sheet offers only Shift+F11) and
**Alt/Ctrl+PgUp/PgDn** = walk the current chapter's drills (`stepSheetTab`, `index.html:27395`).
Fix: correct the F1 row, add `g`, Esc·Esc and the PgUp/PgDn row. Effort: 10 min. Auto-fixable: **yes**.

**P2-5 · Tab never yields DOM focus on the trainer (toolbar unreachable by keyboard alone).**
Probed: from the grid, `document.activeElement` stays `BODY` through repeated Tab presses while the
name box walks `B4 → C4` — Tab is consumed as Excel's move-right (`index.html:27520`), and the
document handler only bails for INPUT/TEXTAREA (`index.html:26984`), so even a mouse-focused toolbar
button cannot Tab onward. Excel parity is the intent, but there is then no keyboard route to the
theme / ghost / picker buttons (the picker has `\`; the rest do not). Only `#fxCancel`/`#fxEnter`
carry `tabindex` (`index.html:1938`, and it is `-1`).
Fix: a documented escape hatch (e.g. Shift+Tab or F6 cycles chrome), or `accesskey`s. Effort: 1 h.
Auto-fixable: **no** (design call).

**P2-6 · `refmap.js` carries two malformed chord keys.**
`"ALT>A>S>D>E>R>I>D>G>E":"sort"` and `"ALT>A>S>D>E>D>E>L>T>A":"sort"` — the generator
(`dev/build-drill-pages.js`) folded the typed deal names RIDGE and DELTA into the chord string.
Harmless today (`reference.html:366` only does exact lookups, so they never match) but it means the
chord extractor mis-segments typed text after an Alt walk, which could also *mask* a real chord.
Fix: stop the chord accumulator at the first non-navigation printable key; regenerate.
Effort: 30 min. Auto-fixable: **no** (generator logic).

**P2-7 · `cert.html` reports "No certificate id" when the backend is unreachable.**
`cert.html:99-100`: `if(!id || !window.sb)` prints "No certificate id." — so `cert.html?id=<real id>`
with Supabase down tells the holder their link is malformed. Probed: `cert.html?id=zzz` is byte-identical
to `cert.html`. Fix: split the two branches. Effort: 5 min. Auto-fixable: **yes**.

**P2-8 · The private-beta curtain has no exit affordance, and every satellite "Log in" link lands on it.**
`PRELAUNCH_LOCK = true` (`index.html:2046`). `showPrelaunchLock()` (`index.html:31398`) paints an
opaque full-screen `#gate` with a code field, an "Enter" button and a small "Already have an account?
Sign in" link — no close, no Escape (`index.html:27052` swallows every key; verified the curtain does
correctly block grid keys), and no link back to About/marketing. Every marketing CTA
("Start training", "Start your first run") and every satellite `index.html?openAuth=signin`
(profile/account/stats/billing) funnels here. It does **not** leak: cancelling the auth modal re-arms
the gate (verified). Fix: add a "back to hotkey.gg" link on the curtain.
Effort: 5 min. Auto-fixable: **yes**.

**P2-9 · `__noShrink` drills still overrun the frame on a small laptop (known/intentional).**
Fresh load at 960×600: `gauntlet` 935 vs 650 (+285), `combo` 909 (+259), `unhide` 867 (+217);
`autofit` fits. This is the documented r333 exemption (`index.html:22947-22990`) — shrinking would
re-narrow the column the player just widened — but it does break the "constant frame" promise on
1366×768-class screens. Not a regression; recorded so it is not re-found.

---

## 3. Clean results (checked, nothing found)

* **Grading**: 74/74 demo replays win twice each; 150 alt-path routes pass; on all 12 swept drills an
  intentional wrong action (`=1/0` stamped into the first target) left `checks()` at **0 green** and
  `done:false` — no drill ever went green wrongly, and nothing threw.
* **Results card** on 12 drills after a demo win: shown, medal/band strip present, splits table
  present, **zero** `NaN` / `undefined` / `[object Object]`.
* **Page crawl** (17 top-level + `drills/index` + 8 drill pages) × {1280×800, 390×844} × {daylight,
  Graphite}: zero page errors, zero console errors beyond the blocked Supabase host, **zero 404s**,
  **zero images without `alt`**, **zero `href="#"`**, zero `undefined`/`NaN`/`[object Object]` in DOM text.
* **Links**: every internal href on every crawled page resolves to a file on disk (drill pages resolve
  through their `<base href="../">`); `drills/index.html` links all 74 drills + itself and correctly
  omits `colops`; `sitemap.xml` has 74 drill URLs and no `admin.html`; `robots.txt` disallows admin.
* **Buttons signed-out**: every visible button/`.btn`/`summary` clicked on 18 pages — no throws, no
  console errors, no dead-end overlay without a close (the only "no close" hits are the beta curtain
  and the landing, both intentional), no sentinel text after interaction.
* **Picker keyboard nav end-to-end**: `\` opens (74 rows), ↑↓ move, ←→ fold/unfold, `1-9` jump to a
  folder, `↵` on a file loads it and closes (verified `navigation → pastes`), `↵` on a folder folds it
  (by design, `index.html:27978`), Esc and `\` close.
* **Esc·Esc restart**, **F1 hints**, **`g` guided**, **`?` sheet open/close**, **theme switch mid-drill**
  (tokyo `#1a1b26` ↔ daylight `#dbd8d1`), **ghost toggle with no PB** (toggles cleanly, label tracks):
  all clean on all 12 drills, zero page errors.
* **Alt+←/→** and **Ctrl+PgUp/PgDn** behave as designed (the latter walks the *chapter*, wrapping —
  `stepSheetTab`, `index.html:25111`) — the earlier-looking "inconsistency" (gauntlet → typeset) is
  the intended wrap inside Formatting.
* **Cache-bust versions** are internally consistent (`drills.js?v=300`, `nav.js?v=302`, `nav.css?v=210`,
  `themes.js?v=310`, `lb.js?v=41`, `lb.css?v=22`) — one version per asset across all pages.
* **Signed-out degradation** is graceful everywhere: leaderboard/desks "Leaderboard not connected yet",
  stats "Sign in to see your stats", profile/account "You're playing as a guest", billing "Billing lives
  on your account", admin "Sign in first". No stuck spinners, no blank pages.
* `_headers` (Cloudflare Pages, the real host per PROJECT_CONTEXT) ships CSP, `X-Frame-Options: DENY`,
  nosniff, Referrer-Policy and Permissions-Policy.

## 4. BUG_SCAN.md / SMOKE_REPORT.md re-check

* `BUG_SCAN` **#6 (deferred)** — stale `targets[]` in 9 model/build drills — appears **RESOLVED** by the
  depth pass. Probed all 74 drills: every non-bonus beat now has a target, and the 9 named drills
  (`opmodel`, `isbuild`, `cfslink`, `bsbuild`, `threestmt`, `lbobuild`, `dcfbuild`, `debtblock`,
  `nwcsched`) carry real ranges matching their `checks` order. The only "holes" left are (a) the ☆
  bonus beat, which never has a target, and (b) beat 0 of `audit`/`triage`, the hunt drills, where
  pointing at the break would give the drill away.
* `BUG_SCAN` **#10 (deferred)** — the `sort` grader ignoring whether names travelled — is **FIXED**:
  `index.html:8405-8406` now pairs each name to its size (`paired()`, r419) and the sizes-only route
  cannot clear.
* `BUG_SCAN` FIXED items #1-#5, #7-#9: no contradicting evidence found.
* `SMOKE_REPORT` outstanding item 2 ("rotate the credentials") and the smoke-account cleanup are
  Supabase-side and unverifiable from here.

## 5. Surfaces not exercisable signed-out (no Supabase in the sandbox)

Leaderboard rows / tier filter / placement / seed field · desks hall, roster, invite codes, quests,
applications · account (handle claim, email prefs, desk create/join, PRO gate) · billing & the Stripe
portal · admin ops (`Sign in first`) · a real certificate render · public profile `?u=` · stats ranks,
run history, efficiency, ladder · XP / level / skin-unlock sync · the run outbox flush · ranked
posting · the curtain's server-side `curtain_check` RPC · everything `dev/smoke-live.mjs` covers.

---

## 6. The five fixes I'd make first

1. **P0-1** — fill the legal placeholders and drop the "Draft for review" banners (privacy/terms/security).
2. **P1-1** — re-fit the grid on window resize (`index.html:27794`): one module-level observer + a
   `resize` → `render()` listener.
3. **P1-2** — let Escape close the auth modal (`index.html:26984` vs `:27051`).
4. **P1-3** — add `drills.js` to `billing.html`.
5. **P1-5 / P1-6** — the two one-line mobile overflow fixes (`About.html:78-83`, `stats.html:73`).
