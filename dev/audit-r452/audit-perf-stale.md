# hotkey.gg — PERFORMANCE + STALE-CODE AUDIT (read-only)
_Worktree: `/home/user/Hotkey.gg/.claude/worktrees/agent-a9cdb1ea244978995` @ `f221706` (r450, catalog 74).
All numbers MEASURED, not estimated. Harness: `http-server -p 8801 -c-1`, playwright chromium 1194,
viewport 1440×900, container CPU (slower than a laptop — read the RATIOS as the durable result, the
absolute ms as an upper bound). Probe scripts live beside this file: `perf1..9.js`, `deadscan.js`,
`csscan.js`, `lskeys.js`, `devscan.js`._

Scope notes: `dev/PROJECT_REVIEW.md` already closed B1/B2 (dead ornament machinery + dead fx
generators, deferred with cause), C5, D4, and Segment E (BETA_MODE / PRELAUNCH_LOCK / the
wolfcdrake backdoor). **Those are not re-litigated here.** `dev/PIPELINE.md`'s "dead echo feature
~90 unreachable lines" is confirmed and sized below (it is still unowned, so it earns a row).

---

## 0. HEADLINE MEASUREMENTS

| what | measured |
|---|---|
| per-keystroke handler time, `navigation` | mean **25.2ms**, p50 22.3, p90 35.6, p99 62.4, max 74.9 (`perf4.js`) |
| per-keystroke handler time, `margin` / `foot` | mean 21.2 / 20.5ms |
| `render()` standalone | **23.95ms** (`perf7.js`) |
| CPU profile share, 300 keys | `render` self **37.8%**, `updateChecklist` self **38.1%**, `hkComboTick` **13.2%** (`perf5.js`) |
| batching render's `innerHTML +=` into ONE write | **−34% to −49% per keystroke** (−8.96 to −17.66ms) (`perf8.js`) |
| `grid.innerHTML+=` per row vs one assign, same markup | 6.779ms vs 0.437ms → **15.5×** (`perf4.js`) |
| `checks()` grader passes per keystroke | **4** (only 1 needed) (`perf4.js`) |
| `checks()` cost, catalog-wide | median 0.020ms, mean 0.046ms, worst `recon` 0.590ms (`perf5.js`) |
| index.html first load | 8 requests, **3,159,792 B** uncompressed; index.html alone 2,582,907 B (`perf1.js`) |
| of index.html: `const CHALLENGES` | **1,751,062 B / 19,857 lines** = 68% of the file |
| `drills.js` fetched + executed per page | **2×** on 14 of 16 HTML pages (`perf6.js`) |
| DOM/heap growth over 30 `loadChallenge()` + 150 keys | heap +1.36 MB, nodes +17 — **no heap leak** |
| listener growth over the same | **+22 net**, 11 keydown + 11 click, all from `openGateInfo` (`perf2.js`) |

---

## P0 — user-visible perf bug or a leak

| id | file:line | finding | evidence / measurement | proposed fix | effort | safe to auto-fix? |
|---|---|---|---|---|---|---|
| **P0-1** | `index.html:23068`, `:23098`, `:23120`, `:23306` | `render()` rebuilds the grid with **`g.innerHTML += row` inside the per-row loop**. Each `+=` serializes the whole growing `<tbody>` to a string, re-parses it, and destroys/recreates every node built so far — O(rows²) parse work and a full layout invalidation 21× per render. | Direct A/B in the live page (`perf8.js`): buffering render's writes into one assignment, identical markup, cut per-keystroke time by **40% on `navigation` (44.07→26.41ms), 49% on `margin` (31.62→16.09ms), 34% on `foot` (26.50→17.53ms)**. Isolated micro-bench on the same 21 rows / 14.3 KB (`perf4.js`): `+=` 6.779ms vs one assign 0.437ms = **15.5×**. Every keystroke calls `render()` exactly once (`callsPerKey=1.00`, `perf3.js`). | Build the header + all rows into one local string and assign `g.innerHTML = html` once at the end. Zero markup change. | **S** | **YES** — strictly-equivalent; output is byte-identical. Guarded by `dev/e2e-grid-height.js` + the parity matrix. |
| **P0-2** | `index.html:25908` (`hkComboTick`) | `el.classList.remove('peak'); void el.offsetWidth; el.classList.add('peak');` — the CSS-animation-restart reflow trick, run on **every productive keystroke** (`logKey` → `hkComboTick`, `index.html:25891`). Because it lands immediately after `render()` has rewritten the whole grid, the `offsetWidth` read forces a **full relayout of the freshly-rebuilt 200-cell table**. | CPU profile, 300 keys: `hkComboTick` self = **13.2% / 1371ms = 4.57ms per keystroke** (`perf5.js`). Isolated (clean layout) the same three lines cost 0.012ms vs 0.004ms — i.e. the 4.57ms is *entirely* the forced relayout of dirty layout, not the classList work. | Restart the animation without a layout read: `el.getAnimations().forEach(a=>{a.currentTime=0;a.play()})`, or defer the class flip to `requestAnimationFrame`. Alternatively hoist `hkComboTick` **above** the render write so it reflows a clean tree. | S | Yes for the rAF variant (behaviour identical, one frame later); the `getAnimations` variant needs a visual check on the `×N flow` chip. |
| **P0-3** | `index.html:25795-25799` (`updateChecklist` autoscroll) | Reads `bodyEl.scrollHeight` / `.clientHeight` / `nx.offsetTop` / `nx.offsetHeight` **immediately after `el.innerHTML=html`**, and immediately after `render()` has invalidated the whole document layout. Classic read-after-write thrash: the second of three forced relayouts per keystroke. | `perf7.js`: the checklist write alone is **0.05ms**; write + the `scrollHeight` read is **1.026ms** — a **20×** jump on an otherwise-clean layout, and it is the dominant term inside `updateChecklist` (whole function 1.081ms standalone). In the real keystroke path the same read pays for the 19 KB grid rebuild, which is why `updateChecklist` shows **38.1% / ~13ms per key** in the profile (`perf5.js`) but only 1.08ms in isolation. | Skip the autoscroll unless the "next" item actually changed (cache the last `.cl-item.next` index), and/or do it in a `requestAnimationFrame` so the read happens after layout has settled once for all three consumers. | S–M | Partially — the "only when `next` moved" guard is a pure win and safe; batching into rAF changes timing and wants a guided-mode eyeball. |
| **P0-4** | `index.html:30162` and `:30165` (`openGateInfo`) | The gate modal is a **singleton element** (`#gateModal`, reused) but every call attaches a **new** `document` keydown listener (`__esc`) and a **new** click listener. `close()` is bound to only the newest `gateX`/`gateGo` (`$('gateX').onclick=close` overwrites), so dismissing with the mouse removes only the newest `__esc` — every earlier one leaks permanently and runs on every subsequent keystroke. The click listener is `{once:true}`, so it only unregisters if you happen to click the backdrop. | `perf2.js`, 30 `loadChallenge()` over the catalog: **+11 keydown and +11 click listeners, 0 removals**, every add attributed to `loadChallenge (index.html:30183)` → `openGateInfo`. 49 of 74 drills are gate-locked (`perf4.js`), so a player arrowing the drill picker hits this constantly. Heap is fine (+1.36 MB over 30 loads), so this is a listener leak, not a memory leak — but the leaked handlers are on the **hot keydown path**. | Register `__esc` once (module-scope, added on open / removed in `close`), or reuse a single named handler and `removeEventListener` before adding. Bind the backdrop click once at element creation. | S | **YES** — the current behaviour (N identical Escape handlers) is observably redundant; deduping is equivalent. |

---

## P1 — measurable waste

| id | file:line | finding | evidence / measurement | proposed fix | effort | safe to auto-fix? |
|---|---|---|---|---|---|---|
| **P1-1** | `index.html:1838` **and** `:1840` — and the same pair in `account.html:171/173`, `admin.html:56/58`, `cert.html:65/67`, `contact.html:53/55`, `desks.html:31/33`, `enterprise.html:69/71`, `leaderboard.html:31/33`, `privacy.html:40/42`, `profile.html:61/63`, `reference.html`, `security.html`, `stats.html`, `terms.html` | **`<script src="drills.js?v=300">` is included twice on 14 of 16 HTML pages.** Introduced no later than `dc42b79` (r425–r427) and carried through every cache bump since (`git log -L 1838,1841:index.html` shows the pair being bumped v298→v299→v300 in lockstep). | Network trace (`perf1.js`, `perf6.js`): the browser issues **two 200 responses of 78,060 B each** for `drills.js` on index/profile/stats/leaderboard/account. Resource timing (`perf9.js`) shows two entries, `transferSize` 78,360 each, durations 22.9ms and 19.0ms. Re-execution costs a further **0.85ms** of JS per page (`perf9.js`). Both tags are parser-blocking in `<head>`, so this sits on the critical path. **`dev/check-cache-versions.js` cannot catch it** — it only asserts one *version* per asset and counts matches, so a duplicate silently inflates the "N files agree" tally. | Delete the second tag on all 14 pages. Add a one-line assertion to `dev/check-cache-versions.js`: each asset appears at most once per HTML file. | S | **YES** — pure deletion of a redundant identical tag; the second execution is a no-op re-definition. |
| **P1-2** | `index.html:23070` (`currentTargetRange`), `:25727` (the `dense` toggle), `:25729` (`items`), `:25721` (`gradePass` ← `checkWin` `:24329`) | **`CHALLENGES[cur].checks(S)` runs 4× per keystroke** where one pass could be shared. `:25727` runs the entire grader only to read `.length` for a CSS class. | Stack-attributed count, 10 keys (`perf4.js`): exactly 4 distinct call sites, 1 each per key. Cost is small today — median drill 0.020ms, mean 0.046ms, worst `recon` **0.590ms → 2.36ms/key at 4×** (`perf5.js`) — but it scales with drill complexity and the depth pass has been adding beats. | Compute `items` once at the top of the keystroke pass and thread it to `currentTargetRange`, `updateChecklist` and `gradePass`. Minimum fix: reuse `items` for the `dense` toggle (`:25727` → move below `:25729`). | M (full) / S (the `dense` line) | The `dense`-line fix: **YES** (identical value, one fewer pass). The full threading is a refactor — needs the parity matrix. |
| **P1-3** | `index.html:29497-29512` | An **unconditional `setInterval(..., 3000)` that is never cleared**, firing for the whole session. Each tick runs `l.getClientRects()` (a forced layout) and, past the guards, a full grader pass via `__stkOk()` (`:29495`). It also fires when the tab is backgrounded (rAF is throttled, `setInterval` is only clamped). | Code read + `perf2.js` (`maxTimerId` 370 after 30 loads — the interval is alive throughout). Per-tick cost is small (≤0.6ms grader + one layout) but it is unbounded in time and unnecessary once `window.__stkDone` latches — which it never checks *before* doing the layout read. | Move the `__stkDone` / `!S` early-outs above the `getClientRects()` call, and `clearInterval` once `__stkDone` latches. | S | Yes — reordering guards that already exist is strictly equivalent. |
| **P1-4** | `themes.js:1990` (the fx `loop`) | The card-fx rAF loop's only liveness test is `o.cv.isConnected`. **No `IntersectionObserver`, no `document.hidden` gate** — a card scrolled out of the viewport keeps painting `shadowBlur`'d particles at 60fps. (`grep -n "IntersectionObserver\|document.hidden" themes.js nav.js lb.js index.html` → one hit, `index.html:23879`, and that one is the run-pause, not fx.) | Code evidence only — I could not attach a live measurement because `canvas.hk-fx` requires a signed-in profile and the probe has no Supabase (`perf6.js`: `canvases: 0`). | Gate `draw()` on an `IntersectionObserver` entry + `!document.hidden`. | M | No — visual; and this is **PROJECT_REVIEW F1**, already scoped there. Listed for completeness with the code evidence, not as a new find. |
| **P1-5** | `_headers` (whole file) | **No `Cache-Control` at all.** The `?v=` scheme is the only cache-bust, so the versioned assets are perfectly immutable by construction — but Cloudflare Pages' default (`max-age=0, must-revalidate`-class) makes every navigation issue conditional requests for all 5 shared assets plus the 2.5 MB `index.html`. | `cat _headers` — the file sets X-Frame-Options / nosniff / Referrer-Policy / Permissions-Policy / CSP and nothing else. First load measured at 8 requests / 3.16 MB (`perf1.js`). | Add `/*.js` + `/*.css` → `Cache-Control: public, max-age=31536000, immutable` (safe *because* of the `?v=` discipline the gate already enforces), and leave HTML on revalidate. | S | Yes — but it makes the `?v=` bump load-bearing for real, so ship it together with the P1-1 assertion. |
| **P1-6** | `index.html:2163-22019` | `const CHALLENGES` is **1,751,062 B / 19,857 lines — 68% of the 2.55 MB index.html** — and all 74 drills' `build()`/`checks()`/`demo()`/`guide()` bodies are parsed on every first load though a session touches a handful. | Measured by brace-matching the block (`perf1.js` companion one-liner). Boot timeline (`perf1.js`): `domInteractive` 423ms, FCP 244ms on localhost with zero latency. | Longer-term only: split `CHALLENGES` into a per-drill lazy module fetched by `loadChallenge`. Note this collides head-on with the "one global scope" architecture (PROJECT_REVIEW II.5) and with `dev/build-drill-pages.js`, which launches the real trainer to mine `demo()`. | **L** | No — architectural. Recorded so the 2.6 MB number has an owner. |

---

## P2 — hygiene (stale code)

### (a) Defined but never referenced
Method: `deadscan.js` extracted 5,449 declarations from `index.html`/`nav.js`/`themes.js`/`lb.js`/`drills.js`/`refmap.js`, then counted `\bname\b` occurrences across **every** `.html`/`.js`/`.md`/`.txt`/`.sql`/`.yml`/`.sh` in the repo (dev/ and drills/ included, so `onclick="fn()"` and doc mentions all count). A name is a candidate only when total occurrences ≤ declaration count. 18 candidates; `greetReturning` (`index.html:27874`) and `syncDrillMeta` (`index.html:30283`) were **rejected on inspection — they are self-named IIFEs that do run.** The rest:

| id | file:line | symbol | evidence | size | deletion risk |
|---|---|---|---|---|---|
| P2-a1 | `index.html:29399-29489` | the whole **echo / "learn mode"** subsystem: `updateEchoBtn`, `echoAbort`, `echoStop`, `echoStep`, `echoStart`, `echoDone`, `echoNudge`, `echoMatch`, the `keydown` branch at `:29465-29487`, and the wiring at `:29489` | `grep -c 'id="echoBtn"' index.html` → **0**. The only path that can set `echoOn=true` is `echoStart()`, called only from `$('echoBtn')` click wiring guarded by `if(eb)`. r401 comment on `:29489` says the button "retired from the bar". → `echoOn` is permanently `false`; all **22** `echoOn` guard sites are dead conditions. | **91 lines** + 22 guard clauses | **LOW** for the block; the guards are `low` individually but touch the keydown path — delete the block, leave the guards, or do both under the engine matrix. This is PIPELINE.md's "~90 unreachable lines" — confirmed at 91. |
| P2-a2 | `index.html:31238-31242` + `:24838-24847` | `startPlacement()` (never called) → `placementMode` (`:31237`) can never be `true` → the placement-verdict branch in the results card and `placementVerdict()` (`:31304`) are unreachable | `grep -rn '\bstartPlacement\b'` → 1 hit (its own definition). `placementMode=true` occurs only at `:31240` inside `startPlacement`. `placementVerdict` is called only from `:24840`, inside the dead branch. | ~5 + ~10 + ~8 lines | LOW |
| P2-a3 | `index.html:30173` | `function sheetMarkWin(){}` — an empty no-op whose own comment says *"r363: retired with the sheet — kept as a no-op for one release so any stale caller can't throw"* | zero callers repo-wide; r363 is ~87 revisions old | 1 line | **LOW** — the stated grace period has long expired |
| P2-a4 | `index.html:31312-31321` | `async function startGuidedIntro()` | zero references | 10 lines | LOW |
| P2-a5 | `index.html:25396-25400` | `function cycleProfile()` (rotates native→macabacus→factset) | zero references; the plugin picker must have moved to another path | 5 lines | **MED** — verify the plugin-layer UI still reaches `keyProfile` some other way before deleting |
| P2-a6 | `index.html:27712` | `function toggleSound()` | zero references (`updateSoundBtn`/`saveSound` are live elsewhere) | 1 line | MED — same caution: confirm the sound toggle in settings is wired to something else |
| P2-a7 | `index.html:22288-22294` | `function evalSum(expr)` — a regex-only `=SUM(A1:A9)` evaluator, superseded by `evalFormula` | zero references | 7 lines | LOW |
| P2-a8 | `lb.js:746-764` | `function ladderHtml()` | zero references | 19 lines | LOW |
| P2-a9 | `index.html:30266`, `:30268` | `const DRILL_DESC = window.HOTKEY_DRILLS.descOf;` / `const TAB_LABEL = window.HOTKEY_DRILLS.tabOf;` | zero references — two SSOT aliases nobody reads | 2 lines | LOW |
| P2-a10 | `themes.js:560` | `const MOTTO=[…8 strings…]` | zero references | 1 line | LOW |
| P2-a11 | `lb.js:124` | `const marathonScore = r => …` | zero references | 1 line | LOW |
| P2-a12 | `lb.js:889` | `const bucketsPresent = ROSTER_BUCKETS.filter(…)` — computed, never read | zero references | 1 line | LOW |
| P2-a13 | `nav.js:810` | `const mySchoolChip = …` — built, never inserted | zero references | 2 lines | **MED** — a built-but-unused chip usually means a *missing* feature, not dead code. Check against the school/desk design before deleting. |
| P2-a14 | `index.html:23015` | `const __CELL_TARGET = 26;` — declared with a "one knob for the whole grid" comment, never read (the 26 is hard-coded in the comment below and the math uses `__availH/__VR`) | zero references | 1 line | LOW, but it is a **doc-vs-code lie** in the most fragile function in the codebase |
| P2-a15 | `index.html:31285`, `:6529` | `let __sbT=0;` / `const wrongIsA=true;` | zero references | 2 lines | LOW |

### (b) Flags / branches permanently one value
| id | file:line | finding | evidence | risk |
|---|---|---|---|---|
| P2-b1 | `index.html:22033` | `echoOn` — permanently `false` (see P2-a1). 22 guard sites. | as above | low |
| P2-b2 | `index.html:31237` | `placementMode` — permanently `false` (see P2-a2). | as above | low |
| P2-b3 | `index.html:2041`, `:2046` | `BETA_MODE=true`, `PRELAUNCH_LOCK=true` | **Already owned by PROJECT_REVIEW Segment E3 — not re-raised.** | n/a |
| P2-b4 | `index.html:31713` | `PRIMER` / `showPrimer` | **Already deleted** (r303 tombstone comment). Only `dev/ONBOARDING_V3.md` still describes them → doc drift, see P2-e3. | low |
| P2-b5 | `themes.js:2718` | `hk_mac_seen` — **written, never read anywhere** in shipped or dev code | `lskeys.js`: 64 localStorage keys audited; this is the only write-only key | low — pure deletion |
| P2-b6 | `index.html:29270` | `hk_demo_spot` — read, never written | `lskeys.js`. **NOT stale** — the r271 comment at `:387` documents it as a deliberate hidden opt-out (`localStorage hk_demo_spot='0'`). Listed so a future sweep does not delete it by mistake. | n/a |
| P2-b7 | — | **`campaign` vs `tracks` duplication** | Checked: `window.HOTKEY_CAMPAIGN` (`index.html:24764, 29623, 29643, 29663, 29683-29690`; `nav.js:666`; `lb.js:582`; `profile.html:339`) and `window.HK_TRACKS` (`drills.js:178`; `index.html:24520-24521, 29731`; `nav.js:684`; `lb.js:180`) are **both live and both read** — the r363 consolidation left no dead half. **No finding.** | n/a |

### (c) CSS with no matching markup
Method: `csscan.js` parses every depth-0 selector in `nav.css`, `lb.css` and index.html's inline `<style>`, then requires each class/id token to appear somewhere in the html/js/md corpus **with `<style>` blocks stripped** (so a class cannot self-validate off its own rule). 214 raw hits; the `td.fill-*` / `td.fc-*` / `td.align-*` families are **false positives** (built as `'fill-'+cell.fill` etc. — verified: `grep -c "'fill-'"` → 70 refs). Every row below was re-verified individually with `grep -rn <token> --include=*.html --include=*.js | grep -v '^./dev/'` returning **0 non-CSS hits**.

| id | file:line | dead selectors | size | risk |
|---|---|---|---|---|
| P2-c1 | `nav.css:233-276` | `.pc-badges`, `.pc-badge`, `.pc-badge.off`, `.pc-legend-t`, `.pc-legend`, `.pc-legend.show`, `.pc-ach-i`, `.pc-card.flair-gold/-emerald/-holo` | **3,170 B / 46 lines** | LOW |
| P2-c2 | `nav.css:434-445` | `.nav-lvl`, `.nav-lvl-t`, `.nav-lvl-bar`, `.nav-lvl-bar i` (r113/r133/r342 "level chip beside the user menu") | 829 B / 12 lines | LOW |
| P2-c3 | `nav.css:698-705` | `.pc-customize`, `.pc-customize:hover` — the r382 "one-click cosmetics chip"; the comment claims *"nav.js renders it only in the owner r…"* but `grep -rn pc-customize` finds **zero** JS hits | 523 B / 8 lines | **MED** — the comment says a live feature should be rendering this; either the chip regressed out or the comment is stale. Investigate before deleting. |
| P2-c4 | `nav.css:757-762` | `.hkf-serial`, `.hk-frame-lg .hkf-serial` (founder serial) | ~2 rules | LOW (and adjacent to PROJECT_REVIEW B1) |
| P2-c5 | `nav.css:777` | `.hkf-crack` | 1 rule | LOW |
| P2-c6 | `lb.css:130-140` + `:193-201` + `:547` | the whole retired **`.pub-*` public-card** family: `.pub-cap`, `.pub-cap .pub-x`, `.pub-hero`, `.pub-nm`, `.pub-you`, `.pub-desk`, `.pub-tiles`, `.pub-tiles b`, `.pub-best`, `.pub-row`, `.pub-row .nm/.tm`, `.pub-card[class*="hk-frame-"] .pub-cap` | 970 + 682 B ≈ **1.7 KB / 21 lines** | LOW — superseded by the unified `hkPlayerCard` (`themes.js:1996`). `.pub-card` itself still has 2 live refs; keep that one. |
| P2-c7 | `lb.css:373-379` | `.standing .st-big`, `.st-lbl`, `.st-chase`, `.st-chase b` | 628 B / 7 lines | LOW |
| P2-c8 | `lb.css:473` | `.gb-or` | 1 rule | LOW |
| ~~P2-c9~~ | `lb.css:108` | ~~`.st-rk.m3`~~ — **FALSE POSITIVE, rejected**: built dynamically as `'st-rk'+(i<3?(' m'+(i+1)):'')` (`lb.js:950`, `:1197`) | — | — |
| — | `lb.css:492-493` | `.tier-filter` / `.tf-note` — **already deleted**; only the r393 tombstone comment remains. No action. | — | — |
| P2-c10 | `index.html:862-872` | `.guide-toggle`, `.guide-toggle:hover/.on/kbd`, `.toprow`, `.toprow .tabs`, `.toprow .guide-toggle`, `.mode-ctrls`, `.keylog` — a contiguous dead block: the retired top-row control strip | **973 B / 11 lines** | LOW |
| P2-c11 | `index.html:1081-1084` | `.help-toggle` + 3 descendants | ~4 rules | LOW |
| P2-c12 | `index.html:825, 817, 853, 900, 916, 969, 1021, 629, 689` | singletons: `#prefsBtn`, `.pk-xp`, `.pk-adv .pk-glabel`, `.rc-stats`, `.rc-opts`, `.rm-note`, `.wb .wb-hi/.wb-sep/.wb-keys`, `.ribbon .rgrp-l`, `.ribbon .ri-name`, `.ribbon .fc-name` | ~12 rules | LOW individually |

### (d) dev/ harnesses targeting retired drills or dead flags
| id | file | finding | evidence | risk |
|---|---|---|---|---|
| P2-d1 | `dev/verify-*.js` (30 files) | **Clean.** Every `verify-<key>.js` maps to a live catalog key. | `devscan.js` diffed the 30 filenames against the 74 `CHALLENGES` keys — zero orphans. | n/a |
| P2-d2 | `dev/AUDIT.md`, `dev/AUDIT_R417.md`, `dev/DEPTH_PASS_CAMPAIGN.md`, `dev/PIPELINE.md`, `dev/ONBOARDING_V3.md` | the only remaining references to `echoStart`/`echoOn`/`PRIMER`/`showPrimer` are in **prose docs**, not harnesses | `devscan.js` retired-symbol pass | n/a (docs) |
| P2-d3 | `dev/check-cache-versions.js:16-38` | The cache guard asserts one *version* per asset across HTML but has **no uniqueness assertion**, which is exactly why P1-1 survived ~25 cache bumps. Its `"N files agree"` count is inflated by the duplicate. | reading the script against the P1-1 evidence | n/a — this is a gap to fill, not code to delete |
| P2-d4 | `.github/workflows/gate.yml:137-141` | The drill-page drift guard is `node dev/build-drill-pages.js && git diff --exit-code -- drills sitemap.xml`. `git diff` sees **modified** files, never **orphaned** ones the generator has stopped writing — so a retired drill's page stays green forever (see P2-e2). | reading the workflow against the `drills/colops.html` evidence | n/a |

### (e) Docs that contradict code
| id | file:line | finding | evidence | verdict |
|---|---|---|---|---|
| P2-e1 | `PROJECT_CONTEXT.md:781` and `:804` say **GitHub Pages**; `PROJECT_CONTEXT.md:538` says **Cloudflare Pages** | which is it | **Cloudflare Pages.** Evidence: (1) `_headers` exists and its own first line reads *"Cloudflare Pages response headers"* — a file GitHub Pages ignores entirely; (2) `.github/workflows/` contains only `gate.yml` and `supabase-deploy.yml` — **no Pages deploy workflow and no `actions/deploy-pages`**; (3) `dev/PROJECT_REVIEW.md:32` states "Cloudflare Pages deploys `main`"; (4) `CNAME` (`www.hotkey.gg`) is a **GitHub Pages artifact that Cloudflare Pages does not read** — a leftover from the old host, harmless but misleading. | Fix `:781` and `:804`; consider deleting `CNAME` (LOW risk — but confirm the Cloudflare custom-domain binding is set in the dashboard first, since deleting it is irreversible for a fallback to GH Pages). |
| P2-e2 | `drills/colops.html` (whole file) | An **orphan SEO landing page for a retired drill.** `colops` is not in `CHALLENGES` (74 keys) nor in `drills.js`. The page is live, `<link rel="canonical">`'d (`:21`), carries schema.org `LearningResource` markup (`:96`), and its CTA at `:108` is `index.html?drill=colops` — a dead deep-link into a drill that no longer exists. | `comm -23` of `ls drills/*.html` against the catalog: 76 page files vs 74 drills; the only true orphan is `colops` (the other diff entry is `drills/index.html`, the library index). `sitemap.xml` is clean — the generator already dropped it — so only the file lingers. | Delete `drills/colops.html`; add an orphan check to the gate (P2-d4). LOW risk. |
| P2-e3 | `index.html:21`, `About.html:301`, `enterprise.html:106` | **"82 drills"** in shipped, user-visible copy. The catalog is **74** (`drills.js` `menuOrder.length === 74`; groups 7+9+9+9+10+10+10+10). `index.html:21` is the schema.org `WebSite` description — i.e. the wrong number is being fed to search engines. The *generated* drill pages already say "all 74 drills", so this is hand-written copy that the derive-don't-duplicate rule (`dev/WORKFLOW.md §4`) should have caught. | `grep -n "82 drills"` + the `drills.js` count above | Derive the number, or at minimum add a gate assertion. LOW risk. |
| P2-e4 | `index.html:29509-29510` | The stuck-nudge toast still advertises the **retired echo feature**: *"⌨ learn mode walks you through it"*, and then tries to pulse `'echoBtn'` — an element that does not exist. User-visible copy pointing at a button that was removed. | `grep -c 'id="echoBtn"' index.html` → 0 | Rewrite the toast (drop the `⌨ learn mode` clause and `'echoBtn'` from the pulse list). LOW risk, ships with P2-a1. |
| P2-e5 | `index.html:23015` | `const __CELL_TARGET = 26; // catalog-standard cell height (px) — one knob for the whole grid` — it is **not** a knob; nothing reads it. | `deadscan.js` (occurrences = 1) | Either wire it into the `__rowH` math below or delete it. It sits inside the "most-churned, fragile" function (PROJECT_REVIEW §3), so a comment promising a single knob that isn't one is a live trap. LOW risk to delete, MED to wire. |
| P2-e6 | `nav.css:700` | comment claims `.pc-customize` is rendered by nav.js "in the owner r…" — nav.js has zero `pc-customize` hits | see P2-c3 | investigate |

---

## Things I checked and found CLEAN (so nobody re-audits them)

- **No memory leak across drill loads.** 30 `loadChallenge()` + 150 real keystrokes: heap +1.36 MB, DOM nodes +17 (`perf2.js`). `loadChallenge` correctly `clearInterval(tickH)`s at `:30229`, resets `undoStack`/`redoStack`/`keyLog`, and `echoAbort()`s at `:30175`.
- **`updateFormulaBar` is not a hot-path problem** — 0.056–0.090ms/key, `callsPerKey=1.00` (`perf3.js`).
- **`recalc` is cheap** — 0.180ms mean, called 1× per *commit* (not per key): 40 calls for 40 commits (`perf3.js`). The r416 cap 8→24 did not make it hot.
- **The grader is cheap** — catalog median 0.020ms, worst 0.590ms (`perf5.js`).
- **`C.guide` is already memoised** (`C.__gCache`, `index.html:25771`).
- **Drill-page asset versions are current** — `drills/*.html` carry `nav.css?v=210 / themes.js?v=310 / nav.js?v=302 / drills.js?v=300`, matching `index.html`. The r416b generator fix holds.
- **`dev/verify-*.js` has no orphans** (P2-d1).
- **`HOTKEY_CAMPAIGN` vs `HK_TRACKS`** — both live, no dead half (P2-b7).
- **`hk_demo_spot`** is an intentional hidden opt-out, not stale (P2-b6).
- **Only one `visibilitychange` handler** (`index.html:23879`) and it is the run-pause — correct behaviour.

---

## THE 5 THINGS I WOULD FIX FIRST

1. **P0-1 — batch `render()`'s grid write.** One local string, one `innerHTML` assignment. Measured **34–49% off every keystroke** (8.96–17.66ms), zero markup change, ~10 lines touched. Nothing else in this audit comes close on payoff-per-line.
2. **P0-2 + P0-3 — stop the three forced relayouts per keystroke.** `void el.offsetWidth` in `hkComboTick` (4.57ms/key measured) and the `scrollHeight` read in `updateChecklist` (0.05ms → 1.03ms on a clean layout; ~10ms on the real dirty one) are both reads issued immediately after the grid rewrite. Fixing them compounds with #1: together with P0-1 these three are ~70% of the keystroke.
3. **P1-1 — delete the duplicate `<script src="drills.js">` on 14 pages** and add the "asset appears once per file" assertion to `dev/check-cache-versions.js`. 78 KB of pure duplicate download on every cold page load, on the critical path, and it has survived ~25 cache bumps precisely because the guard that should have caught it counts matches instead of asserting uniqueness.
4. **P0-4 — dedupe the `openGateInfo` listeners.** 49 of 74 drills are gate-locked, so this leaks onto the hot keydown path during ordinary browsing; measured +11 keydown / +11 click with zero removals over 30 loads.
5. **P2-a1 + P2-e4 — retire the echo feature properly.** 91 unreachable lines (`index.html:29399-29489`) plus a user-visible toast at `:29509` that still advertises "⌨ learn mode" and pulses a button that no longer exists. PIPELINE.md has been asking for an owner since r436; the copy bug is the reason it should stop waiting.

_Runner-up, and the cheapest of the lot: **P2-e3** — "82 drills" in `index.html:21`'s schema.org description, `About.html:301` and `enterprise.html:106`, against a catalog of 74. A wrong number in the structured data Google reads._
