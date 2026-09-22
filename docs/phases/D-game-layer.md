# Phase D build brief: Game layer

Read first: `docs/SITE_SPEC.md` §5, §6, §6a, §8 (Stats), §9; `docs/REBUILD_PLAN.md` row D; `CLAUDE.md`. Work on branch `rebuild`, under `app2/` only. `node app2/tests/run-checks.js` must stay green and under 30 s. Old root files are copy/look reference only; never import them.

## What exists (read before touching)

- `app2/app/drill-page.js` — the trainer layout already: `.drillbar` (prev/current/next), `.mode-bar` (help F1, platform, ghost disabled, sound, fullscreen), `.stage-row` with `#drillHost` + `aside.task-panel`, `#sheetTabs`, `.bar.drill-status` with `#parPass/#parPro/#parLeg` reading "—". Hosts only `DRILLS=[sandbox]`. Keep this markup; fill it.
- `app2/app/sandbox.js` — `mountSandbox(root, {cells, ribbonMode, modeBar, onKey, onMouse})` returns `{sheet, session, view, ribbon, fx, destroy}`. Builds its own `Session`; for graded drills you will NOT use it (see DrillRun).
- `app2/app/runner.js` — `LessonRun`: goals, `splits()`, `elapsed`, `mouseCount`, `startedAt` = `session.t0`, `session.keyLog` entries `{k, t (ms since t0), cell}`. That keyLog is the ghost trace. `shortcutsUsed(log)` folds Alt walks.
- `app2/app/lesson-view.js` — `finish()` (line 291) calls `progress.record(id, mode, secs, {clean})`; `focusWorkspace()`, `paintFocusHint()`, overlay with `[data-act="continue"]` focused. Copy these patterns, do not import the view.
- `app2/app/progress.js` — guest lesson progress `hk2_progress_v1`, entry `{completed, solo, timed, best, at}`.
- `app2/app/prefs.js` — `prefs.get/set`, `keyLabel()`. Add `effects: 'full'|'subtle'|'off'` and `ghost: bool` to `defaultPrefs`/`normalisePrefs` (update `pages.test.js` deepEqual fixtures).
- `app2/ui/effects.js` — `mountEffects()` → `{goalTick, finish, click, refuse, setMuted, isMuted, mountMuteButton, armSounds}`; WebAudio sines via `tone(freq, start, dur, gain)`.
- `app2/ui/ribbon-commands.js` `recordMouse(session, what)` increments `session.mouse.count` — the mouse rule is already recorded; you only read it.
- `app2/content/schema.js` — `validateLesson`, `CONCEPTS`; lessons carry a single `par`.
- `app2/ui/themes.js` — `THEMES`, `THEME_ORDER` (27 themes), `applyTheme`, `saveTheme`.
- `app2/ui/nav.js` `ACCOUNT_ITEMS` has Stats at `#/account?section=stats`; `app2/app/account-page.js` renders sections by `ctx.query.section`.
- `app2/app/main.js` `parseRoute` only accepts `/drill/<id>` and `route()` 404s any id but `sandbox` (line 166). Remove that guard.
- Old build reference: root `index.html` lines 2321-2420 (drillbar, mode-bar, `.fbar` with `#timer` + `.ghost#ghostDelta`, `.bar .stat` "time par · best · keys · optimal"); `drills.js` 483-512 (pass=par×1.5, pro=par×1.15, legendary=par; per-drill `HOTKEY_CLOCKS` overrides); `drills.js` 513+ (achievement `{id, glyph, tier, name, desc, test(ctx)→{done,prog,goal}}`); `themes.js` 662-796 (`HK_RANK`: TIERS, `tierOf`, `levelOf`, `ratingOf`, `standing`).

## Order of work

### 1. Drill content + validator
Create `app2/content/drills/<id>.js` (start with 6 Foundations drills: `edge-jumps`, `select-blocks`, `type-the-column`, `bold-and-borders`, `format-cells-numbers`, `weekly-sales-report`; the last is `benchmark: true`) and `app2/content/drills.js` exporting `DRILLS`, `DRILLS_BY_ID`, `drillById`, `BENCHMARKS`, `DAILY_POOL`. Drill shape:

```js
{ id, chapter:'foundations', title, task /*one sentence*/, access:'free'|'paid', benchmark:false,
  sheet:{cells,active,colW}, sheets?, seed?: (rng)=>cellsPatch /*Daily variation*/,
  goals:[{id, text, keys, check(sheet,session)}],   // checkpoints; no teach/requires
  endState?, solution:'Ctrl+Down …', optimalKeys: 14,
  pars:{ pass:60, pro:38, legendary:30 } }        // seconds, authored explicitly
```
Add `parsFrom(legendary, {pass, pro})` in `app2/app/pars.js` (`pass = ×1.5`, `pro = ×1.15`, rounded up) so authors write `pars: parsFrom(30)` and override capstones (`pass ×2`). Add `validateDrill` to `schema.js`: pars strictly `pass > pro > legendary > 0`, `optimalKeys > 0`, first goal not already satisfied, solution parses. **Test** `app2/tests/drills.test.js`: every drill validates; replaying `solution` through `LessonRun` (it accepts any object with `sheet/goals/endState`) finishes with `keyLog.length <= optimalKeys`; `legendary >= optimalKeys * 0.2` (a par nobody can hit is a bug).

### 2. Records store (guest) and the Phase B contract
Create `app2/app/records.js`, key `hk2_records_v1`, every read/write try/catch and normalised like `progress.js`. Shapes (these are the Phase B tables too):

```js
attempt: { id /*crypto.randomUUID()*/, kind:'drill'|'daily'|'rapid'|'lesson-timed', ref /*drill/lesson id*/,
           day /*'2026-09-22' UTC*/, seed, secs, keys, clean:boolean, helped, mouse, tier:'none'|'pass'|'pro'|'legendary',
           splits:[secs], trace:[{k,t,cell}] /*clean runs only, cap 600 entries*/, at }
pb:      { ref, secs, keys, attemptId, at }         // derived: best clean attempt per ref
xp:      { total, events:[{at, kind, ref, amount}] } // derived from attempts + progress
daily:   { day, drillId, attempts, best }
```
API: `records.addAttempt(a)`, `records.pb(ref)`, `records.pbs()`, `records.attempts({ref, day})`, `records.trace(ref)`, `records.clear()`. Local store only; the account save is Phase B. **Risk flagged**: `app2/supabase/` does not exist yet, so B is not built. Write `app2/app/store.js` exposing `{addAttempt, pbs, boards(ref), rank()}` with the local implementation and a `docs/REBUILD_PLAN.md` note under phase B: "attempts table = the `attempt` shape above; PBs, boards, XP, rank derived server-side; `trace` jsonb capped; `id` unique for idempotent retries". Also flag: `progress.js` keeps lesson `best` separately; timed lesson runs must also write an `attempt` (`kind:'lesson-timed'`) so Stats has one source. **Test** `records.test.js`: corrupt storage → empty; a helped or mouse attempt never becomes a PB; second faster clean run replaces PB and trace.

### 3. DrillRun + workspace
Create `app2/app/drill-run.js`: `class DrillRun extends LessonRun` with `mode='timed'`, plus `helped` (set when Help reveals steps or plays the solution), `clean = !helped && mouseCount===0`, `tierFor(secs, pars)`, `toAttempt()`. Rewrite `drill-page.js`: build the sheet from `DrillRun` (mount `SheetView`, `RibbonView` slim, `mountKeycaps`, `mountEffects` as `sandbox.js` does; keep `mountSandbox` only for `id==='sandbox'`). Fill: drill bar prev/next across `DRILLS`; task panel = goals as checkpoints ticking; status line pars from `drill.pars`, PB, keys vs `optimalKeys`; the "press any key to start" card (old build copy) before `t0`; clock in the fbar position (`#drTime`, tick 50 ms, 2 dp); pace bar vs PB (accent ahead, neutral behind, never red); par markers dimming as each passes. Finish: `effects.finish`, result card with time, splits vs PB, tier stamps in sequence, efficiency meter, Retry on Enter/R (restart within two seconds), Continue. Help panel: hints (goal keys), guided (reveal all), solution replay via `run.demoSteps`/`demoStep` at 250 ms; any of these sets `helped`. Ghost: `prefs.ghost`; when a trace exists, a second faint cursor div in `SheetView` positioned from `trace[i].cell` at `trace[i].t` (needs a `view.cellRect(ref)` helper; add it to `sheet-view.js`). Router: allow any drill id, add `#/daily` and `#/rapid`.

### 4. XP, level, rank (pure modules)
`app2/app/xp.js`: `levelOf(xp)` copied from old (`150, 300, 450, then 600 flat`); `xpForEvent(e, history)`: first lesson completion 50 (guided or solo alike; help-revealed 30, solo later pays the 20), lesson repeat 5 capped at 3/day, drill first clean finish 40, drill repeat 10 capped 3/day, Daily 30 once/day, rapid-fire round 10 capped 3/day, achievements 0, no speed bonus. `app2/app/rank.js`: port `TIERS` (MBA Associate → Candidate → Summer Analyst → First-Year Analyst → Associate → VP → MD → Second-Year Analyst, same `att`/`pct`), `ratingOf`, `tierOf`, `standing` over benchmark boards. **Note the tension**: the old ladder is placement-percentile on boards, the spec says "speed-based tiers, keep old thresholds"; keep the old math (it is speed-derived) and say so in the plan. Guests are Unranked; rank needs boards (B). **Tests** `xp.test.js`, `rank.test.js` with numeric fixtures.

### 5. Daily and rapid-fire
`app2/app/daily.js`: `dailyFor(dayStr)` → `{drillId, seed}` via a string hash of the day over `DAILY_POOL`, `mulberry32(seed)` in `app2/engine/rng.js`; page `#/daily` = drill page with reveal card, attempts-today counter, share card (copy-to-clipboard text). **Test**: same day same pick; consecutive days differ over 30 days. `app2/app/rapid-fire.js`: `RAPID_DECK` of prompts `{text, keys, check(before, after)}` built from concepts already taught (only Chapter 1 shortcuts); rounds 30/60/120 s on a small seeded sheet; combo, multiplier, misses reset combo; end tally. Effects: `hit`, `comboBreak`.

### 6. Achievements, pixel art, cosmetics
`app2/content/achievements.js`: ~40 `{id, name, desc, rarity:'common'|'rare'|'epic'|'legendary', hidden, glyph, test(ctx)→{done,prog,goal}}`, ctx = `{progress, pbs, attempts, xp, level, rank, streakDays}`. Cover: section/chapter completions, solo runs, first PB, first pass/pro/legendary, N legendaries, Daily 1/7/30 days, keystrokes at optimal, no-mouse streaks, 5 hidden. `app2/ui/pixel.js`: glyphs as 16×16 strings (`'.'` = transparent, letters = palette slots) rendered to SVG `<rect>`s with `shape-rendering: crispEdges`; palette = theme vars + rarity colour. Redraw the eight rank emblems the same way. `app2/ui/badges.js`: shelf, silhouettes for locked, hover idle. `app2/app/cosmetics.js`: free themes = `daylight, github, light, default, nord, dracula, gruvbox, solarized`; the rest unlock by level (one every 3 levels), achievements or rank; frames/flair ids per rank tier. Theme picker greys locked themes with "unlocks at level N". **Tests**: ids unique, count ≥ 38, every `test({})` returns `{done:false}` without throwing, every glyph 16 rows × 16 cols and ≤ 6 colours.

### 7. Effects, pages, stats
Extend `effects.js` with named moments: `goalDone, lessonDone, newShortcut, newPB, parTier(tier), rankUp, levelUp, achievement(def), clockStart, clockStop, hit, comboBreak`; queue `achievement` while a run is live; honour `prefs.effects` and `prefers-reduced-motion`. Then: `practice-page.js` real drill list with tier stamps and PBs; `leaderboard-page.js` local "your times" rows until B; `home-page.js` rank/PB block only after first attempt; nav level chip; Stats section in `account-page.js`: time practised, PBs, improvement per drill, keystrokes, shortcuts used (`shortcutsUsed` over traces), "estimated time saved" (labelled estimate: Σ (slow-route keys − actual keys) × 0.5 s).

### 8. Smoke
Add to `smoke.mjs`: open `#/drill/edge-jumps`, press a key (clock starts), replay `solution` via `pwKey`, assert `.drill-status` shows a tier and `hk2_records_v1` holds one clean attempt; reload, ghost toggle enabled.

## Traps
- `LessonRun.reset` clones `sheet.cells` only; a Daily seed must patch cells before construction.
- `session.t0` starts on the first key that does something; the start card must not swallow that key into the sheet (old build: "that one key never lands on the sheet").
- Page buttons focused + Enter are ignored by `sandbox.js`'s `onKeyDown`; keep that rule so Retry never counts as a keystroke or mouse.
- `keyLog.t` is 0 for keys before `t0`; drop them from traces.
- Two `Session`s listening on `document` at once (drill page + sandbox) double-handle keys; destroy before remount as `drReset` does.
- Ghost cursor must never steal focus or cover the active cell (§6a).
- `pages.test.js` deep-equals `defaultPrefs`; update it when adding prefs.