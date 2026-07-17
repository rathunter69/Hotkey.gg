# COPY INVENTORY — hotkey.gg

All user-facing copy on the included surfaces, one row per string, numbered for batch markup
(reply e.g. "change 12, 47, 83 as suggested; for 51 use: ...").

**Line numbers** are from a working-tree snapshot taken **2026-07-17 16:29 UTC** (HEAD `2cd5602` + uncommitted edits).
The repo was being actively edited during the sweep, so treat line numbers as "close, search the quoted text if it moved."
**Excluded by design:** per-drill prompt/req/guide/aha/checklist text inside index.html's CHALLENGES object (its own pass),
legal body text (terms/privacy/security), Excel-native ribbon/menu labels the sim mirrors (Paste, Bold, Sort A→Z…),
per-shortcut rows on reference.html (they describe Excel itself), code comments, and themes.js (theme names, rank-tier
names/req lines, mac popup — not in this pass's file list, noted where they collide with in-scope copy).

**Flags:** WORDY · VAGUE · JARGON · INCONSISTENT · TONE · GRAMMAR · DEAD (references something that no longer exists). Blank = fine.

---

## Terminology

| Canonical term | Variants found | Where |
|---|---|---|
| **drill** | drill · challenge (engine key + "daily challenge" + "challenge link") · board ("this board", per-drill leaderboards) · exercise/exercises (About.html only) · file (".xlsx" metaphor, picker) · task (rapid-fire) · card (rapid-fire "cards") | "exercise" survives only on About.html (#414, #418, #420); "challenge" is the engine noun and the race/daily brand; picker deliberately re-skins drills as VDR "files" |
| **chapter / version** | chapter (code) · version ("v1 · Foundations", "versions shipped") · campaign | Player-facing word is **version**; "chapter" appears nowhere user-visible — consistent |
| **campaign** | the campaign · "the build" (player-card badge strip header, nav.js:518) · "ship the model" | mostly consistent; "the build · 3/8 versions" is the one drift |
| **desk** | desk · team (schema: teams/team_members/team_code; "your desk" everywhere in UI) · guild ("guild board") · cohort ("cohort report", "the cohorts…") | UI is consistently "desk"; "team" leaks only in old settings copy (nav.js:238) |
| **staffer** | staffer (product word) · captain (schema role, never shown) · "desk staffer" (account delete copy) | consistent since r138 |
| **rank / tier** | rank · tier · the ladder · rating (roster panel) · "ranked" (opt-in mode) | ladder endpoints disagree: "Candidate → Second-Year Analyst" (onboard card, #71) vs "MBA Associate → Second-Year Analyst" (rank pill title, #211) vs placement floor "Candidate — the ladder starts here" (#100) |
| **level** | LEVEL · LVL · level | display is "LVL n"/"LEVEL n"; consistent |
| **PB / best** | PB · best · "new best" · "★ new best" · pb (ghost delta "vs pb") · "personal best" (never spelled out) | mixed casing pb/PB in-trainer; results card uses "best", ghost uses "pb" |
| **guided mode** | guided mode · guided hints · hints (session HUD "g hints") · "training wheels" (never shown) · "paint-by-numbers walkthrough" (shortcut sheet) | trainer toggles with **F1**; sessions reveal keycaps with **g** — nav.js shortcut sheet wrongly says "g" toggles guided in classic (#37) |
| **rapid-fire** | rapid-fire · rapidfire (code) · "rounds" · "cards"/"tasks" | consistent player-facing "rapid-fire" |
| **daily challenge** | Daily Challenge (marquee, extra-hard, level-gated) · "the daily" (morning-sheet item 1, seeded easy daily) · morning sheet ("⚡ sheet") | two different dailies exist by design; copy mostly keeps them apart but "daily" unqualified is ambiguous in a few spots |
| **PRO** | PRO · ◆ (diamond marker) · "advanced" (picker tag "◆ advanced") · "premium" (code only) | consistent |

---

## A · Nav & chrome (nav.js, shared footer, 404)

| # | Location | Current copy | Flag | Suggested |
|---|---|---|---|---|
| 1 | nav.js:73 | hotkey.gg (brand) + "beta" chip · title "hotkey.gg — excel trainer" | | |
| 2 | nav.js:75–79 | nav links: "trainer" · "leaderboard" · "desks" (title "desks & schools") · "stats" · "reference" | | |
| 3 | nav.js:82 | rank pill title: "your rank — click for your full card" | | |
| 4 | nav.js:83 | icon title: "keyboard shortcuts (?)" | | |
| 5 | nav.js:86–89 | icon title: "themes" · theme-name chip title "theme" | | |
| 6 | nav.js:111 | footer fine print: "Excel is a registered trademark of Microsoft Corporation. hotkey.gg is independent and not affiliated with or endorsed by Microsoft." | | |
| 7 | nav.js:114–121 | footer links: "about · drill library · contact · enterprise · report a bug · terms · privacy · security" | | |
| 8 | nav.js:131–154 | shortcut sheet sections: "navigating drills / while training / in a rapid-fire session / after solving / anywhere" | | |
| 9 | nav.js:132 | "open the drill picker (trainer)" | | |
| 10 | nav.js:133 | "jump to drill # (trainer, classic)" | | |
| 11 | nav.js:134 | "restart the current drill" | | |
| 12 | nav.js:137 | "start the clock (first keystroke begins the run)" | | |
| 13 | nav.js:138 | "g — toggle guided hints" | INCONSISTENT | trainer uses F1: "F1 — toggle guided hints" (index.html's own sheet already says F1) |
| 14 | nav.js:139 | "F2 — edit the active cell" | | |
| 15 | nav.js:142–144 | "s — skip the current task" · "g — reveal the keycap hints" · "Shift+Esc — end the session early" | | |
| 16 | nav.js:147–149 | "Enter — run it again" · "Space — next drill (classic)" · "Esc — back to the menu" | | |
| 17 | nav.js:152–153 | "? — open this shortcut sheet" · "Esc — close menus & modals" | | |
| 18 | nav.js:169 | "App navigation only — for Excel shortcuts, see the reference page." | | |
| 19 | nav.js:171 | "press ? or esc to close" | | |
| 20 | nav.js:195 | themes modal: "Click a theme to apply. Your pick saves across sessions." | | |
| 21 | nav.js:219 | settings (guest): "You're playing as a guest — add an email and password to your account first, then come back here to change it later." | WORDY | "You're playing as a guest — add an email and password first; change it here later." |
| 22 | nav.js:220 | "Save your progress →" · "close" | | |
| 23 | nav.js:228–234 | settings: "Account" · "Email" · "Change password" · placeholders "new password (8+ characters)" / "confirm new password" · "Save password" | | |
| 24 | nav.js:237–238 | "Your desk" · "Desks replaced team codes — create one, join by invite link, and share it from your account page." | DEAD | "team codes" are a retired concept: "Create a desk, join by invite link, and manage it from your account page." |
| 25 | nav.js:251–257 | password msgs: "Password needs at least 8 characters." · "Passwords don't match." · "Saving…" · "Password updated ✓" · "Couldn't update password." · "Something went wrong — try again." | | |
| 26 | nav.js:273 | player card (signed out): "Sign in to see your card and where you rank against the field." | | |
| 27 | nav.js:279 | "loading your card…" | | |
| 28 | nav.js:284 | "Couldn't load the rankings right now — check your connection and try again." | | |
| 29 | nav.js:434, 501 | standing line: "N/5 boards toward a rank" (share card) vs "N/5 drills toward Summer Analyst" (card) | INCONSISTENT | pick one unit ("boards") and one goal phrasing across both |
| 30 | nav.js:495–496 | per-board line: "top N%" · "only you so far" · "+X.XXs off #1" · "you lead" | | |
| 31 | nav.js:516–518 | badge strip: "the build · N / 8 versions" · tooltip "— clear every drill under par × 1.5 to earn it" / "— EARNED" | INCONSISTENT | header elsewhere is "the campaign"/"versions shipped" — consider "the campaign · N / 8 versions" |
| 32 | nav.js:521 | finisher tip: "Model complete — every version shipped" | | |
| 33 | nav.js:599–600 | "achievements N / M" · link "pick your showcase ↗" / "edit showcase ↗" | | |
| 34 | nav.js:605 | rarity tip: "N% of players have this" | | |
| 35 | nav.js:610 | "full grid + progress on your numbers →" | | |
| 36 | nav.js:616 | "most-used shortcuts · last 40 clean runs" | | |
| 37 | nav.js:621 | coach tip: "F4 barely shows up in your play — the Models and Full Builds tiers lean on anchor cycling" | | |
| 38 | nav.js:622 | "no Alt-ribbon walks in your recent runs — alt h o i (autofit) and alt e s (paste special) are desk staples" | | |
| 39 | nav.js:623 | "mostly single arrows — ctrl+arrows jump to data edges, ctrl+shift+arrows grab whole ranges" | | |
| 40 | nav.js:624 | "paste special (ctrl+alt+v) is missing from your rotation — values-only paste is everywhere in real models" | | |
| 41 | nav.js:626 | "coach's notes" | | |
| 42 | nav.js:657 | rank-up celebration sub: "the desk noticed · top N%" | TONE | fine if intentional flavor; plainer: "top N% of the field" |
| 43 | nav.js:681, 687 | card sublabels: "rank · speed vs the field" · "level · earned from reps" | | |
| 44 | nav.js:698–700 | stat tiles: "clean solves" · "crowns" · "streak" | | |
| 45 | nav.js:705 | "the card downloads as a PNG · card themes — PRO" (tip: "custom card themes land with PRO at launch") | | |
| 46 | nav.js:707 | card footer: "full leaderboard ↗ · ⬇ share your rank card · close" | | |
| 47 | nav.js:712–715 | share states: "rendering…" · "saved ✓ check your downloads" · "couldn't render — try again" | | |
| 48 | nav.js:763 | "sign in" (auth slot button) | | |
| 49 | nav.js:775 | level chip title: "LVL n · x/y xp — levels are reps; they never decay" | | |
| 50 | nav.js:785–789 | user menu: "Your numbers" · "Your desk" (title "your desk's hall — quests, roster, standings") · "Save your progress" · "Account" · "Sign out" | | |
| 51 | nav.js:422, 429, 451 | rank card PNG: fallback name "analyst" · "keyboard-only excel · no mouse allowed" · "think you're faster? hotkey.gg" | | |
| 52 | nav.js:440 | rank card: "LEVEL n · N clean solves · N crowns" | | |
| 53 | nav.js:1021–1031 | PRO sheet chrome: "hotkey.gg PRO" · grid head "◆ pro / free" · "landing during beta: …" · CTA (beta) "Back to training — PRO is on, free" / (live) "Upgrade — $7 per month" | | |
| 54 | nav.js:1024 | "**[feature]** comes with PRO." | | |
| 55 | nav.js:1054 | "Sign in first — PRO attaches to your account." | | |
| 56 | nav.js:1055, 1061 | "Opening checkout…" · "Checkout isn't live yet — the beta keeps everything free." | | |
| 57 | nav.js:1069, 1074 | celebration card: cap fallback "nice" · hint "↵ continue · v — see it on your card" | | |
| 58 | 404.html:44–52 | "hotkey.gg · cell reference check" · "=IFERROR(this_page, #REF!)" · "That reference doesn't resolve." · "The page you're after was moved, renamed, or never existed — like a formula pointing at a deleted row. The sheet itself is fine." · buttons "back to the trainer / leaderboard / shortcuts / report a broken link" | | |

## B · Onboarding & tour (index.html)

| # | Location | Current copy | Flag | Suggested |
|---|---|---|---|---|
| 59 | index:6 | title: "hotkey.gg · spreadsheet speedruns" | | |
| 60 | index:7 | meta description: "Keyboard-only Excel training: 81 banker-grade drills, live leaderboards, and desks for your whole team. No mouse allowed." | | |
| 61 | index:10 | og:title: "hotkey.gg — train Excel like it's a sport" | | |
| 62 | index:21 | JSON-LD description: "An Excel simulator that scores your keyboard speed — 81 drills from navigation to full model builds, with pars, leaderboards, and guided demos." | | |
| 63 | index:1512–1514 | landing: eyebrow "Keyboard-only Excel" · h1 "Drills, not lessons." · lede "Real shortcuts, real tasks. Built for the keystrokes you use every day." | | |
| 64 | index:1516–1517 | "Start training ↵" · "Log in" | | |
| 65 | index:1519–1520 | mode chips: "Classic" (tip "solve drills at your own pace") · "⚡ Rapid-fire" (tip "one shortcut at a time, as fast as you can") | | |
| 66 | index:1523 | "Classic mode. ↵ to begin · everything keyboard" | | |
| 67 | index:1524 | "Been here before? Sign in to pick up your rank, level, and boards." | | |
| 68 | index:11018–11019 | mode blurbs: "Solve drills at your own pace · the timer's just feedback." · "One cell, one chord, one transform · go as fast as you can recall." | | |
| 69 | index:10989–10999 | returning landing: "↩ welcome back · [name]" · "Welcome back, [name]." · "Your boards, rank, and streak are where you left them — one ↵ drops you on the sheet." · "You're signed out on this browser — Log in reconnects [name]'s boards; ↵ trains as a guest." | | |
| 70 | index:13388 | (signed-in landing) "Signed in and ready — one ↵ drops you on the sheet." | | |
| 71 | index:1485–1486 | onboard card: "welcome to hotkey.gg" · "The ladder runs Candidate → Second-Year Analyst. One drill tells you where you start." | INCONSISTENT | rank pill (#253) says the ladder runs MBA Associate → Second-Year Analyst; also the placement pitch is stale — the button now starts a warm-up sandbox, not a placement (see #72) |
| 72 | index:1488 | static button: "🎯 60-second placement — find your rung" | DEAD | overridden at runtime by "▶ Quick warm-up — feel the moves" (index:13788); update the static HTML to match |
| 73 | index:1489, 13789 | "Skip — I'll dive in" | TONE | "dive in" is on the banned list: "Skip — straight to the drills" |
| 74 | index:13788 | "▶ Quick warm-up — feel the moves" | | |
| 75 | index:14133–14137 | keyboard fork: "first — what keyboard are you on?" · "Keycaps and shortcuts render for your machine. Same drills either way. ↑↓ to choose · ↵ to confirm" · "⊞ Windows — Ctrl chords, Alt ribbon walks" · "⌘ Mac — ⌘ chords, ⌥ ribbon walks (KeyTips)" · "(detected)" | | |
| 76 | index:14161–14166 | comfort fork: "quick one — how much Excel have you done?" · "No wrong answer — this just sets how much hand-holding you get. You can always press F1 for guided mode." · "Basically none — teach me from zero" · "I get around — classes, an internship" · "I live in it — just show me the drills" | | |
| 77 | index:14176–14186 | primer card 1 "the grid": "Everything in Excel lives in a cell. Every box has an address — column letter + row number, like B4. The dark outline is you: the arrow keys move it." | | |
| 78 | index:14179 | primer 2 "what a cell shows vs what it is": "A cell can hold a plain number (340) or a formula that computes one (=B2+B3 — formulas always start with =). The grid shows the RESULT; the formula bar above…" | | |
| 79 | index:14180 | primer 3 "typing": "Click nothing. Just type — it replaces what's in the cell — and press ↵ to commit (Tab commits and moves right). Made a mess? Esc backs out safely. F2 opens a cell…" | | |
| 80 | index:14181 | primer 4 "the ribbon": "Excel's menus all have keyboard paths. Tap Alt and letters light up: Alt → H → O → I fixes squeezed columns. Nobody memorizes these overnight — the drills make them reflex." | | |
| 81 | index:14182 | primer 5 "how you win": "Each drill: make the sheet match the checklist on the right, fast. Any keystroke path that gets there counts. F1 is guided mode — it highlights every key to press, and it's ON for your first few runs. You've got this." | TONE | "You've got this." is filler — cut the last sentence |
| 82 | index:14192–14196 | primer chrome: "excel from zero — [topic]" · "n / 5" · next button "next" / "let's drill" | | |
| 83 | index:13818 | sandbox A1 cell: "Warm-up — no timer, no score. Feel out the moves, then hit Ready." | | |
| 84 | index:13835–13837 | sandbox chrome: drill name "Warm-up" · cat "practice" · taskline "Try the moves below — Ctrl+→ to jump, Shift+→ to select, Ctrl+Shift+→ to grab the whole run." | | |
| 85 | index:13844–13846 | sandbox ready card: "Warm-up — no clock, no score. Ctrl+→ leaps to the edge · Shift+→ selects across · Ctrl+Shift+→ grabs the run · Ctrl+Home home." · button "Ready — start your first drill →" | | |
| 86 | index:13855–13858 | sandbox callouts: "Ctrl+Shift+→ — grabbed the whole run in one leap" · "Ctrl+→ — jumped straight to the edge of the data" · "Shift+→ — extended the selection (watch the blue block grow)" · "arrows move one cell — add Ctrl to leap, Shift to select" | | |
| 87 | index:13865 | exit-sandbox toast: "same moves — now for real. take your time; the clock starts on your first keystroke" | | |
| 88 | index:14207–14208 | tour 1 "try this": "A mouse takes a few seconds to scroll and click across a sheet. The keyboard takes one press. Hold ctrl and tap → — right now." | | |
| 89 | index:14209–14210 | tour 2 "again — bigger": "The cursor jumped to the edge of the data. Now select a whole column of it, no dragging: ctrl+shift+↓ — one chord." | | |
| 90 | index:14211 | tour 3 "your checklist": "Each drill gives you a checklist on the right. Every line is one action; it turns green when done. Clear them all and the clock stops — any keystroke path that gets there counts." | | |
| 91 | index:14212 | tour 4 "moving around": "\\ opens the drill list — ↑↓ arrows move, ↵ loads. Or hop straight with Alt+←/→. Esc never ends your run." | | |
| 92 | index:14213 | tour 5 "stuck? two helpers": "Guided mode (this button, or F1) highlights every key to press — on by default for your first runs. Beside it, watch solution plays the optimal keys, and learn mode hands you the keys one step at a time." | | |
| 93 | index:14214 | tour 6 "your keyboard": "Your layout (Windows or Mac, auto-detected) and shortcut profile (native Excel · Macabacus · FactSet) live here — click to switch either. The drills accept the chords of whichever profile you train." | | |
| 94 | index:14215 | tour 7 "race yourself": "Ghost replays your best run as a moving cursor so you can race your own time. Toggle it here." | | |
| 95 | index:14216 | tour 8 "make it yours": "Light or dark — themes live here, and every one keeps a clean, readable sheet. Pick one anytime; it saves across sessions." | | |
| 96 | index:14217–14218 | tour 9 (guest) "save your progress": "You're playing as a guest. Create a free account to save your progress, post times to the leaderboards, join ranked, and join a team. Takes a few seconds — or keep playing and sign up whenever." | INCONSISTENT | "join a team" → "join a desk" |
| 97 | index:14219–14220 | tour 9 (signed-in) "the ladder": "LEVEL is your reps — every clean solve earns xp. RANK is the competition — clean, keyboard-only runs post to per-drill leaderboards, with crowns for first." | | |
| 98 | index:14252–14255 | tour chrome: "▸ press it — the sheet is live" · "next · ↵" / "start drilling" · "skip tour · esc" | | |
| 99 | index:10414 | tour do-it payoff: "⚡ that's the whole product — one press" | | |
| 100 | index:13868–13874 | placement verdicts: "Second-Year Analyst pace" · "Associate pace" · "First-Year Analyst pace" · "Summer Analyst pace" · "Candidate — the ladder starts here" | INCONSISTENT | floor tier elsewhere is MBA Associate (see #71/#253) — align the bottom rung |
| 101 | index:13967–13972 | prelaunch curtain: "Private beta" · "We're letting people in gradually — got a code?" · placeholder "access code" · "Enter" · "Already have an account? Sign in" | | |
| 102 | index:13979–13986 | curtain msgs: "Enter your access code." · "checking…" · "That code didn't work. Check with whoever invited you." | | |
| 103 | index:1502–1505 | mobile gate: "The trainer needs a real keyboard." · "hotkey.gg trains Excel keyboard shortcuts — F-keys, Ctrl chords, Alt ribbon walks — and none of that exists on a touchscreen." · "Drills wait for your desk — open hotkey.gg on a computer." | | |
| 104 | index:13299–13305 | mobile hub links: "🏆 the boards — see who's fastest" · "◆ desks & schools" · "📈 your numbers" · "⌨ shortcut reference" · "👤 your player card" / "👤 sign in — player card & saved times" | | |
| 105 | index:13884 | post-intro line: "you're set — \\ all drills · shift+f11 restart · F1 hints · ? shortcuts · type to start" | | |

## C · Trainer UI (index.html — chrome, modes, toasts, modals)

| # | Location | Current copy | Flag | Suggested |
|---|---|---|---|---|
| 106 | index:1358–1365 | drill bar: prev/next titles "previous drill (←/‹)" / "next drill (›)" · picker title "all drills" · "\\ all" | | |
| 107 | index:1375–1376 | session HUD: "s skip · g hints · shift+esc end" · button "end session" | | |
| 108 | index:1382, 1387 | mode pills: "● classic" · "⚡ rapid-fire ▾" | | |
| 109 | index:1391–1396 | rapid-fire popover: decks "all chords" / "dialog chords" · durations "30 seconds / 1 minute / 2 minutes" | | |
| 110 | index:1400 | "▶ watch solution" (tip: "replays the optimal keystrokes through the real engine") | | |
| 111 | index:1401 | "⌨ learn mode" (tip: "learn mode — the demo hands YOU the keys, one chord at a time") | | |
| 112 | index:1402 | "F1 guided: off" (toggles "guided: on/off", index:10845) | | |
| 113 | index:1403 | "⌘ mac keys" (title: "how the keys map on a Mac + enabling KeyTips in real Excel") | | |
| 114 | index:1404 | "👻 ghost: on" (tip: "◆ PRO — race a live ghost of your PB run · pace counter is free · click to toggle") | | |
| 115 | index:1406 | "⚄ random" (title: "deal me a random drill — anywhere in the catalog") | | |
| 116 | index:1408 | "◆ weakness" (tip: "PRO — the site builds your session: slowest vs par, never-cleared, gone-stale drills first") | | |
| 117 | index:1411 | "📈 campaign" (title: "the campaign — ordered chapters, time gates, badges") | INCONSISTENT | player-facing word is "versions", not "chapters": "the campaign — ordered versions, time gates, badges" |
| 118 | index:1412 | "◆ daily challenge" (tip: "the Daily Challenge — one extra-hard sitting, same board worldwide, live leaderboard") | | |
| 119 | index:1427–1428 | rapid-fire stage placeholders: "—" · cell chip "B4" | | |
| 120 | index:1434–1438 | formula bar: "A1" · "0.00" · "fx" · "empty" · cancel/enter titles "Cancel (Esc)" / "Enter (↵)" | | |
| 121 | index:1449–1451 | stat bar: "time par — · best —" · "keys 0 · optimal ~—" · badge "mouse used" | | |
| 122 | index:1457–1466 | dialogs: "Paste Special" / "Format Cells" · "esc to cancel" · "Cancel esc · OK ↵" · "a letter applies · esc cancels" | | |
| 123 | index:1476 | picker footer: "↑↓ move · ←→ fold · ↵ open · 1–9 folder · esc close" | | |
| 124 | index:7472 | random codenames: "Project [BEDROCK/ORION/…]" | | |
| 125 | index:7906, 7920 | flash-fill toasts: "flash fill: put the cursor beside the data, example typed" · "flash fill: type one example first, then Ctrl+E" | | |
| 126 | index:7961, 7975 | "flash fill: no pattern found — give it one more example" · "flash fill: N cells" / "flash fill: nothing to fill" | | |
| 127 | index:8387, 8393 | ribbon caller: "[path] → … · esc backs out" · idle hint "alt ribbon" | | |
| 128 | index:8395 | paste special caller: "letters pick · m/d set the operation · ↵ apply · esc cancel" | | |
| 129 | index:8432 | column width caller: "type a width (Excel units) · ↵ apply · esc cancel" | | |
| 130 | index:8440 | find & replace caller: "tab switches · ↵ replace all · esc cancel" | | |
| 131 | index:8445 | sort warning: "e Expand the selection · c Continue with the current selection · data sits NEXT to your column — ↵ = expand (Excel's default) · esc cancel" | | |
| 132 | index:8455 | go to special: "o Constants (numbers) · f Formulas · k Blanks · marks light up · ↵ walks · esc clears" | | |
| 133 | index:8470 | series caller: "linear, step from selection · ↵ apply · esc cancel" | | |
| 134 | index:8665 | discovery toast: "three clears in — try ⚡ rapid-fire: one chord at a time, against the clock" | | |
| 135 | index:9100 | first-run toast: "guided mode is on for your first run — follow the highlighted keys · F1 turns it off" | | |
| 136 | index:9518 | combo chip: "×N flow" | | |
| 137 | index:9534 | idle reset toast: "⏱ stalled out — 60s without a keystroke, fresh board" | | |
| 138 | index:9969 | "put the cursor on a header cell first" | | |
| 139 | index:10023 | "N cells marked — ↵ walks them · esc clears" / "nothing matched" | | |
| 140 | index:10049 | "rows hidden — the desk rule prefers a group (shift+alt+→)" | | |
| 141 | index:10078–10079 | "N replaced" · "no matches" | | |
| 142 | index:10659 | Ctrl+S catch: "saved (N)" · "drill restarted — Ctrl+S works here" | | |
| 143 | index:10712 | "fresh board — esc·esc restarts" | | |
| 144 | index:9046–9062 | sheet-tab strip: "« [GROUP]" (title "previous set") · "[NEXT GROUP] »" (title "next set (alt+pgdn past the last tab)") | | |
| 145 | index:9195–9196 | xp chip on drill bar: "+N xp" (title "what your next clean solve of this drill earns") | | |
| 146 | index:10845 | guided button states: "F1 guided: on/off" | | |
| 147 | index:10855–10863 | sound button: "🔇 off" / "🔊 thock" / "🔊 [pack]" · tip "sound: … — click to cycle" | | |
| 148 | index:10942–10951 | weakness popover: "◆ weakness queue · built from your runs" · "train the queue — N drills →" · empty: "Nothing weak on the board — play a few drills and the queue finds the gaps." | | |
| 149 | index:10959 | toast: "weakness queue armed — N drills · n on the results card walks it" | | |
| 150 | index:13020 | toast: "weakness queue cleared — the gaps got smaller" | | |
| 151 | index:11014 | guest banner (no Supabase): "⚠ Guest mode — Supabase not configured, runs won't save and there's no login. setup →" | | |
| 152 | index:11092–11093 | marathon modal: "⏱ marathon" · "Random drills, back to back, against the clock. The timer starts on your first keystroke — clear as many as you can." | DEAD | marathon was retired from the UI (r292 comment at index:1384) — copy still ships; confirm and delete or keep for the hidden mode |
| 153 | index:11095–11096 | rapid-fire modal: "⚡ rapid-fire" · "One cell, one instruction, one shortcut — fire it as fast as you can. Next, next, next." | | |
| 154 | index:11896 | "Hardo mode · no keycap hints, pure recall" | TONE | gamer slang; if intended, keep — otherwise "Hard mode · no keycap hints, pure recall" |
| 155 | index:11897 | "cancel" (modes modal) | | |
| 156 | index:11952 | marathon skip: "⏭ skipped — next…" | | |
| 157 | index:12045 | session summary title: "session complete" (+" · practice run") | | |
| 158 | index:12047 | "· hints used — not posted to leaderboard" | | |
| 159 | index:12039 | "· guest session — not posted" | | |
| 160 | index:12042 | guest footer: "playing as guest — nothing saved · save your progress" | | |
| 161 | index:12032–12034 | summary stat labels: "rounds / best streak / fastest / avg round" · "drills / skipped / keystrokes / key efficiency" | | |
| 162 | index:12049 | empty session: "nothing finished — give it another go" | | |
| 163 | index:12050–12052 | "↵ run again" · "esc back to drills" · graph label "seconds per round/drill" | | |
| 164 | index:12072 | benchmark line: "benchmark: [category] chords cost you the most this run — train "[drill]" →" | | |
| 165 | index:12088 | "no drills completed" | | |
| 166 | index:11160–11474 | rapid-fire instructions (55 ops), e.g. "Center this header" · "Right-align this number" · "Pin this label left" · "It's a hardcode — blue the font" · "Raw thousands — comma format it" · "It's a rate — percent format" · "Bold it — the ribbon way" · "Column's too narrow — autofit it" · "Clipboard's loaded — paste VALUES only" | | |
| 167 | index:11205–11257 | …rapid-fire cont.: "Bold this label / Remove the bold" · "Italicize this / Remove the italic" · "Underline this / Remove the underline" · "Strike through this line item" · "Format as currency" · "Format as percent" · "Comma-format the number" · "Format as a date" · "Format as a time" · "Use scientific notation" · "Reset to general format" | | |
| 168 | index:11266–11347 | …"Add an outline border" · "Strip the borders off" · "Add a top border (subtotal line)" · "Add a bottom border (subtotal line)" · "Activate filter on this column" · "Snap back to A1" · "Stamp today's date here" · "Stamp the current time" · "Convert to a hyperlink" · "Clear the contents" · "Lock the reference (absolute)" · "AutoSum the column" · "Fill the value down" · "Fill the value right" | | |
| 169 | index:11355–11474 | …"Center this header" (dup, ribbon path) · "Left-align this" · "Right-align this" · "Open font color (blue this input)" · "Clear everything (text + formatting)" · "Strip the formatting (keep the text)" · "Open Find" · "Open Find & Replace" · "Open Go To" · "Open Format Cells" · "Open Insert Function" · "Save the workbook" · "Insert a new sheet" · "Freeze panes here" · "Select the whole sheet" · "Toggle formula view" · "Trace precedents" · "Copy this cell" · "Paste as values only" · "Drop a comment on this cell" | | |
| 170 | index:11800 | rapid-fire hardo hint: "no hints · press g to reveal · or recall from memory" | | |
| 171 | index:12201 | demo button states: "▶ watch solution" / "esc stop demo" | | |
| 172 | index:12303 | demo intro: "▶ watch the optimal keystrokes — then it's your turn" | | |
| 173 | index:12322 | demo outro: "your turn — or ⌨ learn mode to walk the steps yourself" | | |
| 174 | index:12348–12349 | demo spotlight caption: "step N/M · B4 · [chord]" | | |
| 175 | index:12360 | echo intro: "⌨ learn mode — press each highlighted chord yourself · esc bails" | | |
| 176 | index:12368 | echo done: "⚡ you walked the whole line (N stray keys) — board's reset, now run it for time" | | |
| 177 | index:12344 | echo stop: "your turn" | | |
| 178 | index:12337 | echo button states: "⌨ learn mode" / "esc stop" | | |
| 179 | index:12446 | stuck nudge: "stuck? ▶ watch solution plays the line · ⌨ learn mode walks you through it · F1 guides every key" | | |
| 180 | index:12469, 12473 | streak toasts: "🧊 streak freeze used — 🔥 N kept alive" · "🧊 streak freeze earned — auto-covers one missed day" | | |
| 181 | index:12503–12505 | streak badge: "🔥 N 🧊×N" · title "N-day streak — solve a drill every day to keep it alive · N freezes banked (auto-covers a missed day)" / "· every 5 days banks a freeze" | | |
| 182 | index:8633–8635 | level-up celebration: cap "level up" · "LEVEL N" · "+N xp · keep stacking" | | |
| 183 | index:12543–12544 | version-shipped celebration: cap "version shipped" · "+N xp" · "[names] — complete" · toast fallback "🎉 version shipped — +N xp" | | |
| 184 | index:12594–12595 | campaign modal intro: "the campaign" · "Ship the model version by version. Clear every drill in a version under its pace gate and the next unlocks — each shipped version pays a one-time xp bounty and stamps a medal on your card." | | |
| 185 | index:12586–12589 | campaign header: "N / 8 versions shipped" · "N / N campaign xp" · "N / N drills cleared under the pace gate (par × 1.5, clean run)" | | |
| 186 | index:12580 | per-drill gate chip: "beat Ns" / "[PB]s" | | |
| 187 | index:12592–12593 | campaign footer: "⭐ Model complete — every version shipped." / "The Models & Full Builds versions carry the biggest bounties — go PRO to own the whole model." | | |
| 188 | index:12621–12632 | level modal: "LEVEL N" · "x / y xp" · "N xp to LVL n+1" · "current rank · [tier]" · "keep climbing" · "how xp works ›" | | |
| 189 | index:12646–12651 | xp modal: "how xp works" · "new drill +50 (advanced +65) · repeat +15" · "daily +30 · gauntlet leg +25 · rapid-fire +10" · "boards: top-10 +25 · podium +100 · crown +250" · "Each level costs a bit more than the last. New drills and showing up daily are the fastest climb." | | |
| 190 | index:12652–12653 | par explainer: "how par works — Par is a clean run at NATIVE Excel pace — the same bar for everyone, every board. Plugin keyboard layers (Macabacus / FactSet) are a legal edge: their shortcuts are shorter, so beating par with them is playing it like a real desk, not cheating. Guided mode lists the alternates when one exists." · "got it" | WORDY | trim mid-sentence: "…are a legal edge — their shortcuts are shorter. Beating par with them is how real desks play. Guided mode lists the alternates." |
| 191 | index:12723–12724 | daily challenge board slot: "today's global field" · "loading the field…" | | |
| 192 | index:12726 | play button: "◆ play today's challenge →" / "↺ play again (practice)" | | |
| 193 | index:12727–12728 | locked gate: "○ Locked — reach LVL 3 to enter (you're LVL n). The Daily Challenge is where the field competes head-to-head — keep training to unlock it, or" · "keep training →" · "◆ PRO enters now" | | |
| 194 | index:12730 | PRO perk: "Free players see the top 10 · PRO sees the full field, replays the top runs, and gets unlimited practice re-rolls." | | |
| 195 | index:12733–12738 | dc header: "◆ Daily Challenge" · "next drop in 07:12:33" · tag "extra-hard" · "One sitting. The same board for everyone, everywhere, all day — par is Ns, and the field is racing it right now. Your best time today is what ranks." | | |
| 196 | index:12740–12742 | dc stats: "🔥 your streak — N days" · "today's board" · "your rank" ("unranked"/"locked") | | |
| 197 | index:12766–12767 | dc offline/signed-out: "the global field loads when you're online — be the first to post a time today" · "sign in to see today's global field and put your time on the board" | | |
| 198 | index:12776–12777 | "today's global field · N racing" · "no times yet today — be the first on the board" | | |
| 199 | index:12781 | "◆ PRO reveals the remaining N · including the leaders you're chasing" | | |
| 200 | index:12875–12877 | morning-sheet tags: "the daily" · "fresh ground" · "sharpen" · "chase par" | | |
| 201 | index:12882–12887 | sheet popover: "⚡ morning sheet · N/3 — cleared" · footer "clear all three — the sheet is your day's signature" | | |
| 202 | index:12789 | daily button: "⚡ sheet N/3 ✓" | | |
| 203 | index:12908–12911 | sheet cleared: cap "morning sheet" · "Sheet cleared" · "all three signed off — the desk runs on people like you" · toasts "⚡ morning sheet cleared" / "⚡ sheet: N/3 signed off" | TONE | sub is flattery filler: "all three signed off" |
| 204 | index:12823 | locked-tier toast (mid-tour): "[group] unlocks as you level — finish the tour first" | | |
| 205 | index:12830–12835 | gate modal: "[group] — locked, for now" · "This tier opens when the climb says you're ready — both bars, or ship the campaign:" · "✓ LVL n — you're LVL n" · "✓ N pace clears — you have N · a pace clear = beat par ×1.5 on a clean run" · "or 📈 ship the campaign through the earlier versions — pure speed, no waiting" | | |
| 206 | index:12838–12839 | "keep training →" · "◆ PRO skips the wait" | | |
| 207 | index:13016–13017 | picker cap: "◆ the data room" · crumb "hotkey.gg › vdr" · "N files · N folders" | JARGON | "vdr" in the crumb is insider shorthand — fine for the audience, but flag for a deliberate call |
| 208 | index:13031–13035 | picker tags: "◆ advanced" (tip "what comes with PRO") · "N files · folded" · gate tag "LVL n · N clears" (title "click for what unlocks this") | | |
| 209 | index:13054–13056 | picker rows: "✓ [PB]s" / "—" · "par Ns" · title "desk assignment · target Ns · [note] · [label] · best [PB]s" | | |
| 210 | index:12963–12965 | (openGateInfo see #205) picker crumbs: "hotkey.gg › vdr › 01 foundations/" · "… › 01 foundations › the_4am_pass.xlsx" | | |
| 211 | index:13210 | rank pill title: "[tier] — the ladder runs MBA Associate → Second-Year Analyst. Click for your card." | INCONSISTENT | see #71/#100 — pick one ladder phrasing site-wide |
| 212 | index:13257 | edu trial toast: "🎓 .edu verified — PRO unlocked free for 7 days. Every feature, on the house." | | |
| 213 | index:13267–13269 | PRO badge: "PRO · Nd" / "PRO ✓" · titles ".edu trial — N days left. Keep it going anytime." · "PRO through your desk" | | |
| 214 | index:13329–13331 | desk-join errors: "you already have a desk — manage it from your account page" · "that desk is full (200 analysts)" · "that desk invite isn't valid anymore" | | |
| 215 | index:13336 | "welcome to the desk: [name]" | | |
| 216 | index:13359 | home-desk nudge: "[school] has a desk — one tap to join it on your account page" | | |
| 217 | index:13375–13376 | assignments toast: "desk assignment(s) this week: [drills] — marked ◆ in the picker (\\)" | | |
| 218 | index:13494–13495 | set password: "Set a password" · "Pick a password (8+ characters) — you'll use it to sign in from now on." | | |
| 219 | index:13506–13512 | reset: "Reset your password" · "Enter your email and we'll send a link to set a new one." · "Send reset link" · "← back to sign in" · "cancel" | | |
| 220 | index:13524–13526 | guest upgrade: "Save your progress" · "Add an email and password to your guest account. All your runs and times stay attached." · "Save account" | | |
| 221 | index:13528–13532 | signup: "Create your account" · "Email and a password you'll remember. Got a school email? Sign up with your .edu — it auto-matches you to your school's desk (and unlocks student perks later)." · "Create account" | | |
| 222 | index:13534–13536 | signin: "Sign in" · "Welcome back — email and password." · "Sign in" | | |
| 223 | index:13548 | "+ add your school (optional — or use your .edu)" | | |
| 224 | index:13554–13556 | "+ desk or referral code (optional)" · placeholder "desk / referral code" | | |
| 225 | index:13560–13561 | "Have an account? Sign in" · "Create an account" · "Forgot password?" | | |
| 226 | index:13597 | desk-code preview: "✓ joins [desk] — N on the desk" / "code not recognized — check with whoever sent it" | | |
| 227 | index:13609 | "Still connecting — give it a second and try again." | | |
| 228 | index:13612–13626 | sign-in errors: "Enter your email and password." · "Confirm your email first — check your inbox." · "Wrong email or password. forgot password?" · "Type your email above first, then click forgot password." · "Reset link sent — check your inbox." · "Could not send the reset email — try again." | | |
| 229 | index:13637–13638 | "Enter a valid email." · "Password needs at least 8 characters." | | |
| 230 | index:13648 | "That email already has an account — sign in instead (your guest progress will reset)." | | |
| 231 | index:13653–13655 | "Check your email — We sent a link to [email]. Click it to confirm — your progress is already saved to this account." · "You can keep playing in the meantime. From now on, your email and password will sign you in from any device." | | |
| 232 | index:13665 | "That email already has an account — sign in instead (guest scores can't merge into it)." | | |
| 233 | index:13671 | "Confirm your email — We sent a confirmation link to [email]. Click it and this account — with all your guest runs — is yours." | | |
| 234 | index:13675 | toast: "account saved — your guest runs are yours now. Set a handle on the Account page." | | |
| 235 | index:13679–13681 | "That email already has an account — try signing in." · "Confirm your email … Click it, then sign in with your password." | | |
| 236 | index:13692 | "Check your email — We sent a reset link to [email]. Open it on this device to set a new password." | | |
| 237 | index:13717–13719 | handle prompt: "Pick a name" · "This is how you'll show up on the leaderboard." · placeholder "e.g. first name + last initial" · "⚄ reroll" · "Save" | | |
| 238 | index:12133–12135 | in-game settings (guest): "Account" · "You're playing as a guest — add an email and password to your account first, then come back here to change it later." · "Save your progress →" | WORDY | same fix as #21 |
| 239 | index:13941 | landing desk-invite: "You've been invited to join [desk] — N on the desk. Sign in and you're on it." · toast "signing you onto [desk] once you're in" | | |
| 240 | index:1551 | digest-off alert: "Weekly digest off — re-enable it anytime from your account page." | | |
| 241 | index:13144 | race arrival: "🏁 beat [name]'s N.NNs — type to start the race" | | |

## D · Results & progression (index.html)

| # | Location | Current copy | Flag | Suggested |
|---|---|---|---|---|
| 242 | index:8887 | results title: "solved" (+" · ★ new best") | | |
| 243 | index:8841–8846 | post row: "not posted — mouse used" · "practice run (guided) — not posted" · "global leaderboard coming soon" · "sign in to post your time →" · "scores not saved as guest — save your progress →" · "posting to the leaderboard…" | | |
| 244 | index:8678 | post result: "posted to the leaderboard ✓" / "couldn't post — check your connection" | | |
| 245 | index:8850 | guest footer: "playing as guest — nothing saved · save your progress" | | |
| 246 | index:8857 | PB hook: "★ new best — X.XXs faster than your old Y.YYs" | | |
| 247 | index:8860 | near-miss hook: "so close / off the pace — +X.XXs off your Y.YYs best · ↵ run it back" | | |
| 248 | index:8862–8863 | flow hook: "🔥 N-key flow streak — you were locked in" | | |
| 249 | index:8879–8881 | time-saved row: "⏱ X.Xs faster than your first try / time banked · Nm banked lifetime" | | |
| 250 | index:8890, 8909 | details toggle: "d details — keys · band · stalls · boards" / "hide the detail" | | |
| 251 | index:8892 | stats row labels: "keys / optimal ~N / best" | | |
| 252 | index:8832–8833 | band row: "X.XXs to [Silver]" · "★ new · +Nxp" · "the ceiling — beat par held" | VAGUE | "the ceiling — beat par held" reads cryptic: "Elite — you beat par; nothing above it" |
| 253 | index:8789–8791 | ghost diff head: "X.Xs executing · Y.Ys thinking (N stalls)" / "clean execution — no stalls over 1.5s" · section title "where the time went" | | |
| 254 | index:8776–8782 | stall reasons: "hunting the ribbon" · "formula recall" · "selection chord recall" · "chord recall" · "finding the cell" · "checking the work" · "reading the sheet" | | |
| 255 | index:8793–8794 | keys line: "+N keys over the optimal path — a shorter route exists" · "optimal-length path — nothing wasted" | | |
| 256 | index:8897 | board row header: "leaderboard" | | |
| 257 | index:8699–8700 | rank badge: "👑 #1 on this drill — you lead" · "#N of M · +X.XXs off #1" | | |
| 258 | index:8901–8903 | action buttons: "↵ enter again" · "n next: [drill] →" · "esc menu" | | |
| 259 | index:9040 | key hint footer: "↵ run it again · n next drill" | | |
| 260 | index:8928 | placement row: "🎯 placement: [verdict]" (+" — faster than N% of M analysts") | | |
| 261 | index:8946 | "⬇ share your verdict" | | |
| 262 | index:8953, 8959 | gauntlet rows: "🏁 gauntlet leg N of 5 →" · "🏁 gauntlet complete — combined time is on the weekly board" | | |
| 263 | index:8967–8968 | race verdicts: "🏁 race won — [name]'s N.NNs is history" · "🏁 [name] holds it — +X.XXs to their N.NNs" | | |
| 264 | index:8985, 8990 | share row: "⬇ share card" · "⚔ copy challenge link" | | |
| 265 | index:8996–8997 | "challenge link copied — they have to beat N.NNs" · prompt fallback "your challenge link:" | | |
| 266 | index:9007 | xp row: "+N xp · [note] · how xp works" | | |
| 267 | index:8600–8605 | xp notes: "daily challenge" · "gauntlet leg" · "first clear · advanced bonus" · "clean solve · fresh today" · "clean solve · diminishing today" · "clean solve · worn for today — fresh tomorrow" · "+25 warm-up" | | |
| 268 | index:9018, 9029 | drip line: "N xp to LVL n+1 · next medal: [name] N/M" | | |
| 269 | index:8569–8570 | ghost delta: "pb N.NN" · "−0.42 vs pb · keys 12/14" | | |
| 270 | index:8741 | "⬇ card saved — check your downloads" | | |
| 271 | index:8712–8731 | share card PNG: "hotkey.gg" · "keyboard-only excel · no mouse allowed" · "[N.NN]s" · "N keys · optimal M" · "think you're faster? hotkey.gg" | | |
| 272 | index:11998 | marathon inline win: "✓ N.NNs" | | |

## E · Stats page (stats.html)

| # | Location | Current copy | Flag | Suggested |
|---|---|---|---|---|
| 273 | stats:6–7 | title "Stats · hotkey.gg" · meta "Your complete performance picture — speed, efficiency, most-used chords and functions, synced to your account." | | |
| 274 | stats:121–122 | h1 "Stats" · sub "Speed, efficiency, and where every drill stands — your complete performance picture." | | |
| 275 | stats:213–218 | your-card panel: "your card" · "LVL n" · "x/y xp" · "N crowns · N podiums · N/81 boards" · "defend them on the boards → · account →" | | |
| 276 | stats:238–241 | hero tiles: "time banked — first try vs best" · "drills on your board" · "avg keys vs optimal path" · "day streak" | | |
| 277 | stats:245 | guest state: "You're viewing local bests only. Sign in with a real account and every run posts — ranks, efficiency history, and the ladder all live here." | | |
| 278 | stats:335–341 | achievements header: "Achievements N / M" · filters "all / earned / in progress / locked" | | |
| 279 | stats:342–343 | wall hint: "medals sort rarest-first · click an earned one to ★ showcase it on your player card · up to 3 (oldest pick swaps out) · sign in to show them on the boards" · "tiers: gold earned · RARE (≤25% of players) · EPIC (≤10%) · LEGENDARY (≤3%)" | | |
| 280 | stats:325 | medal tip: "[name] — [desc] ✓ EARNED / · N/M · N% of players have this · click to showcase" | | |
| 281 | stats:362–364 | weakest board card: "Your weakest board: [drill] — #N of M (top N%)" · "one clean run there moves your average more than anywhere else" · "run it →" | | |
| 282 | stats:377–379 | strongest board card: "Your strongest board: [drill] — #N of M (top N%)" · "your best N.NNs · +X.XXs off #1 / you lead it" · "defend it →" | | |
| 283 | stats:397–398 | pace panel: "pace · time vs par · last N runs — below the dashed line = under par" · "median N.NN× par · N keys/min" | | |
| 284 | stats:404 | "how it's computed: each point = one posted run's time ÷ that drill's par, oldest → newest. keys/min = keystrokes ÷ minutes across posted runs (median)." | | |
| 285 | stats:425–429 | lifetime tiles: "total keystrokes (posted runs)" · "time on the grid" · "distinct shortcuts used · last N runs" · "busiest day · [date]" | | |
| 286 | stats:438 | "Analytics — PRO · free in beta" (tip "what comes with PRO") | | |
| 287 | stats:448 | "your most-used chords & functions · this device / synced to your account" | | |
| 288 | stats:456 | "fastest hands · keys per second by drill" | | |
| 289 | stats:461, 472, 483 | per-drill list: "Per-drill" · "untried" · "N% eff" · "#N of M" · "local only" | | |
| 290 | stats:494–496 | "Recent runs" · fallback labels "⚡ daily" · "🏁 gauntlet leg" | | |

## F · Leaderboard (leaderboard.html + lb.js overview/ranked)

| # | Location | Current copy | Flag | Suggested |
|---|---|---|---|---|
| 291 | leaderboard.html:6–7 | title "Leaderboard · hotkey.gg" · meta "Every drill has a board. Ranked ladder, top players, daily and weekly gauntlets — keyboard-only Excel, timed." | | |
| 292 | leaderboard.html:44–51 | h1 "Leaderboard" · "loading times…" | | |
| 293 | lb.js:46–52 | empty board: "open board — first run sets the bar" · filler rows "open lane" | | |
| 294 | lb.js:70 | session board empty: "no runs yet — claim this board" | | |
| 295 | lb.js:124 | "Leaderboard not connected yet" | | |
| 296 | lb.js:142 | "Couldn't load times — Database unreachable — refresh in a moment." | | |
| 297 | lb.js:152–155 | section-leader flagships: "Full Builds — tie the three statements" · "Models · LBO — run the LBO math" · "Models · RX — the paydown waterfall" · "Models · Comps — precedent transactions" | | |
| 298 | lb.js:185–189 | "◆ section leaders" · "N.NNs clean" · "unclaimed / be first" | | |
| 299 | lb.js:97–99 | session board labels: "3/5/10-minute marathon" · "30/60/90-second rapid-fire" · "N drills · N keys" · "N hits · N%" | DEAD | marathon boards render only if old sessions exist; mode is retired from the UI (see #152) — confirm whether the marathon boards should still show |
| 300 | lb.js:512–513 | signed-out card: "Times only count on the boards for signed-in accounts. Sign in and post a time to see your rank, level, and progress toward the next tier." | | |
| 301 | lb.js:533–534 | ranked gate: "Ranked is unlocked (campaign complete / LVL n). Entering shows your placement on every board you've run — nothing is lost by waiting." · "Ranked unlocks at LVL 10 or by completing the campaign. You're LVL n." | | |
| 302 | lb.js:536–537 | "progress to LVL 10" · buttons "⚔ Enter Ranked" · "Not yet" | | |
| 303 | lb.js:572–579 | ranked infographic: "welcome to ranked" · "Your rank = your average placement across the boards you've entered — stabilized two ways: with only a few boards, your rating starts near the middle and your results pull it toward your true level (so two fast drills alone can't crown you); and small fields count for less than big ones (1st of 2 says less than 4th of 40). Until you've faced enough real competition, your rank is capped and tagged provisional — everyone starts low and earns altitude. Breadth + placement is the climb." | WORDY | it's a lot for one modal paragraph — split: keep sentence 1, move the two stabilizers to short bullets |
| 304 | lb.js:577–578 | "Each tier splits into three buckets by where you sit inside that tier's band: you enter at Bottom Bucket, pass through Middle, and reach Top Bucket as your average placement improves — clear the band and you promote to the next tier." | | |
| 305 | lb.js:580–582 | "Ranks are live: they can fall as well as rise when other players improve." · "Enter Ranked ⚔" · "Not yet" | | |
| 306 | lb.js:604 | your-card ranked footer: "leave ranked" | | |
| 307 | lb.js:597–601 | your card: "N crowns · N podiums · N/81 drills · N clean solves" | | |
| 308 | lb.js:608–614 | ladder panel: "the ladder" · "[tier] — you" · req lines from themes.js ("8 drills · top 55% avg placement" etc.) | | |
| 309 | lb.js:623 | top players empty: "nobody has placed yet (5+ drills) — be the first name here" | | |
| 310 | lb.js:626 | "top players · the field" | | |
| 311 | lb.js:648–650 | featured boards: "⚡ today · [drill]" · "🏁 weekly gauntlet · 5 legs, one clock" | | |
| 312 | lb.js:676–684 | tier roster: "the field · by tier" · "nobody holds this tier yet — it's open" · "rating = stabilized average placement (lower is better) · your row is highlighted" | | |
| 313 | lb.js:1161–1177 | browse tabs: "⌨ drills" · "⚡ rapid-fire" · search placeholder "search drills…" · session sublabel "best per player" | | |
| 314 | lb.js:441–461 | public player card: "PLAYER CARD" · "(you)" · "· provisional" · tiles "crowns / podiums / top-10s / boards" · "no board entries yet" · "report" / "reported ✓" | | |
| 315 | lb.js:686–719 | school standings: "🎓 School Standings" · "champion [name]" · "no ranked runs yet" · "N analysts" · "N boards" · "schools ranked by crowns (board #1s), then depth · opt in from your account to fly your colors" | | |

## G · Desks (desks.html + lb.js desk hall / guild / staffer)

| # | Location | Current copy | Flag | Suggested |
|---|---|---|---|---|
| 316 | desks.html:6–7 | title "Desks & Schools · hotkey.gg" · meta "Private team rooms with desk-only boards, weekly quests, and school standings. Browse the guild board and find your desk." | | |
| 317 | desks.html:44–45 | h1 "Desks & Schools" · sub "private desk rooms and school colors — where the cohorts stack up · ← the leaderboard · manage / start a desk" | | |
| 318 | desks.html:51 | "loading the cohorts…" | | |
| 319 | lb.js:297–300 | hall header: "◆ THE DESK" · "✓ verified" · "N analysts · staffer: [name]" · "staffer seat open — first code-join takes the desk" · "report" | | |
| 320 | lb.js:302–304 | "staffer controls →" · "apply to join →" | | |
| 321 | lb.js:309–313 | ROI band: "faster, first try → best / summed across the desk" · "avg speed-up per re-drilled task" · "clean runs · N / 81 drills covered" · "runs this week vs last" | | |
| 322 | lb.js:326–336 | quest board: "this week's quests" · "◆ [drill]" · "under Ns / clean clear · Nd left" · "N / M done — quest complete" · member ticks "✓ [name] / · [name] — not yet" | | |
| 323 | lb.js:317 | quests empty (staffer): "no quests pinned — pin up to 3 drills from your staffer controls (targets + notes optional)" | | |
| 324 | lb.js:317 | quests empty (member): "no quests pinned this week — the staffer sets them" | | |
| 325 | lb.js:343–345 | roster: "the roster" · columns "analyst / rank / boards / crowns / this wk / saved" · "(you)" | | |
| 326 | lb.js:349–353 | hall footer: "every board below is desk-only · click any analyst for their card · ⚠ = no runs this week" · "⚛ lateral out" (title "leave this desk — your runs and rank travel with you") · "⎙ cohort report (print / PDF) · ⬇ summary card" | | |
| 327 | lb.js:417–421 | lateral confirm: "⚛ lateral out — click again to confirm" · "something went wrong" | | |
| 328 | lb.js:425 | apply result: "applied ✓ — the staffer decides" | | |
| 329 | lb.js:352–371 | cohort report (print): "cohort report · keyboard-only excel training" · "generated [date]" · "live assignments" · table "drill / bar / completed" · "the roster" · footnote "time saved = each analyst's first recorded time vs current best on re-drilled tasks, summed · speed-up = the average of those first→best gains · clean runs exclude…" | | |
| 330 | lb.js:379–398 | summary card PNG: "cohort summary · keyboard-only excel" · "time saved / avg speed-up / clean runs / drills covered" · "N runs this week · ▲ +N% vs last" · "generated [date] · hotkey.gg" | | |
| 331 | lb.js:764–767 | desk grade chip: "unrated" (title "grades unlock at 3 competing analysts") · title "desk grade — roster-wide average placement, WSO-tier scale" | JARGON | "WSO-tier scale" assumes the reader knows WSO — fine for the audience, deliberate call |
| 332 | lb.js:788–800 | guild card actions: "🔒 invite-only" (title "private desk — joins by invite code only") · "roster closed" (title "the staffer closed the roster — invite codes still work") · "applied · pending ✓" (title "click to withdraw") · "add an email to apply" · "apply" · "sign in to apply" | | |
| 333 | lb.js:805 | "top analyst [name]" / "open roster — be the first name on it" | | |
| 334 | lb.js:806 | "the hall →" | | |
| 335 | lb.js:810–813 | start row: placeholder "start a desk — name it (e.g. Wharton UG Finance)" · "start a desk" · "or" · placeholder "invite code" · "join" | | |
| 336 | lb.js:809 | anon: "Desks need a full account — add an email & password and your progress comes with you." | | |
| 337 | lb.js:815 | signed out: "Sign in to apply to a desk or start your own." | | |
| 338 | lb.js:817–823 | "The guild board" · arrows aria "previous/next desk" · counter "N / M" · "no desks yet" | | |
| 339 | lb.js:842 | application note placeholder: "one line for the staffer (optional)" · "send" | | |
| 340 | lb.js:857 | "withdraw application?" / "applied · pending ✓" | | |
| 341 | lb.js:860–866 | create/join msgs: "give the desk a real name (3+ characters)." · "that name won't fly — pick something you'd put on a resume." · "paste the invite code from your staffer." | | |
| 342 | lb.js:748–757 | desk error map: "real firm and group names are reserved — verified desks are coming." · "that name isn't available." · "you're already on a desk — leave it first." · "that invite code isn't valid." · "that desk is full (200)." · "one desk per day — try again tomorrow." · "that desk is invite-only." · "that desk closed its roster — invite codes still work." | | |
| 343 | lb.js:758–763 | …cont: "five open applications max — withdraw one first." · "applications need a full account — add an email to your account first." · "that application was already handled." · "they joined another desk in the meantime." · "only the staffer can do that." · "three live assignments max — clear one first." · "applications aren't live yet — ask the staffer for an invite code." · "a desk with that name already exists." · "something went wrong." | | |
| 344 | lb.js:895–903 | desk standings: "◆ Desk Standings" · "desks ranked by crowns (board #1s), then depth · click a desk for its hall · start or join a desk" | | |
| 345 | lb.js:921–922 | manage guards: "You're not on a desk — find one on the guild board." · "Only the staffer sees the controls — back to your desk's hall." | | |
| 346 | lb.js:925–932 | staffer screen: "⚙ staffer controls for [desk] · N analysts · ← the hall" · panels "invite link" ("the fast lane — anyone with the link joins instantly") · "applications · the inbox" · "recruiting — open to applicants / roster closed" · "PRO for the desk" · "this week's quests · up to 3" · "the roster" | | |
| 347 | lb.js:932 | "the exit — Leaving hands the desk to the longest-tenured analyst; if you're the last one out, the desk dissolves." · "leave the desk" · "click again to confirm" | | |
| 348 | lb.js:938–947 | invite: "copy" · "rotate" (title "new code — old invite links stop working") · "rotate — old links die" · "link copied — drop it in the group chat." · "copy failed — select the link and copy it." · "new code minted — the old invite links are dead." · "no code available" | | |
| 349 | lb.js:969–975 | desk PRO states: "✓ PRO is live for the whole desk — free club access / for the desk · N days left / no expiry" · "N / M seats in use · N analysts waitlisted — earliest to join hold the seats. add seats" · "⏳ request received — we'll review and get back to you. Beta desks are approved fast." | | |
| 350 | lb.js:978–990 | "a previous request wasn't approved — reach out at hello@hotkey.gg if that's a surprise." · "request PRO for the desk →" · "see desk pricing" · "sending…" | | |
| 351 | lb.js:997–998 | inbox: "applications aren't enabled on the server yet — the invite link still works." · "no applications waiting — the guild board sends them here." | | |
| 352 | lb.js:1000–1003 | app rows: "today / Nd ago" · "accept" · "pass" | | |
| 353 | lb.js:1012–1024 | program templates: "Intern week 0 — zero to desk-ready — movement, formatting, first formulas, find-and-fix" · "First-year bootcamp — the modeling core — clean-up, functions, schedules, statements" · "Speed weeks — PB-chase under par-based bars, basics to models" | | |
| 354 | lb.js:1013–1023 | program week notes: "get moving, no mouse" · "desk-standard formatting" · "first formulas" · "find it and fix it" · "clean-up week" · "function week" · "schedule week" · "statement week" · "speed: the basics / the sheet / data + lookups / the models" | DEAD | intern0 and speed weeks pin deleted drill keys (`saves`, `format`, `blue` were removed in r249) — those pins will fail; update the drill lists |
| 355 | lb.js:1042–1046 | quest pin row: placeholders "drill — type to search" · "target s (optional)" · "note for the desk (optional)" · "pin it" · "program templates — a 4-week quest sequence, pinned one click a week" | | |
| 356 | lb.js:1051–1087 | quest msgs: "pick a real drill from the list." · "nothing pinned this week." · "this replaces the current pins — click again to confirm." · "week N pinned — [drills]." · "clear" | | |
| 357 | lb.js:1134–1139 | roster removal: "remove" · "remove [name]?" · "removed — they can re-apply or re-join with a code." | | |
| 358 | lb.js:1214–1215 | page-state titles: "Staffer controls" · "opening the manager…" | | |

## H · Account (account.html)

| # | Location | Current copy | Flag | Suggested |
|---|---|---|---|---|
| 359 | account:6–7 | title "Account · hotkey.gg" · meta "Your profile, handle, school colors, desk, and data controls." | | |
| 360 | account:101 | h1 "Account" | | |
| 361 | account:121–124 | guest state: "You're playing as a guest — your times live only on this device." · "Create an account" · "Log in" · "Create an account to claim a handle, post to the boards, and start the climb." | | |
| 362 | account:149–159 | title card: "set a handle" fallback · "LVL n" · "x/y xp" · "N crowns · N podiums · N/81 drills · N clean solves · member since [date]" | | |
| 363 | account:162–163 | "Your desk" · "loading…" | | |
| 364 | account:166–170 | profile card: "Profile" · label "handle — how you appear on every board" · placeholder "pick a handle — letters, numbers, underscores" · "Save handle" · "⚄ suggest one" | | |
| 365 | account:173 | "email — [address]" | | |
| 366 | account:176–177 | data card: "Data" · "Your runs live on the server under this account. Local device data (PBs cache, streak, achievement flags) can be exported or cleared." | | |
| 367 | account:178–180 | "weekly desk digest — email me Monday desk standings & quests" | | |
| 368 | account:181–182 | "Export local data" · "Clear local cache" | | |
| 369 | account:186–187 | "Appearance" · "Theme applies everywhere, instantly." | | |
| 370 | account:191–194 | plan card: "Your plan" · "plan — PRO · free during beta" · "at launch — beta players lock in founder pricing" · "See what comes with PRO" | | |
| 371 | account:197–198 | "Card flair — PRO · free in beta" · "A border style for your player card, shown wherever your card appears." · options "none / gold / emerald / holo" | | |
| 372 | account:204–207 | beta tools: "Beta tools — testing only — removed at launch" · "Bypass the LVL-10 ranked gate so you can test ranked without grinding. Cosmetic only — your real rating and boards are untouched." · "Unlock ranked gate (test)" · "Reset" | | |
| 373 | account:211–219 | security card: "Security" · "password — Email me a reset link" · "sessions — Sign out of all devices" · labels "new password (8+ characters)" / "confirm" · "Update password" | | |
| 374 | account:222–226 | delete card: "Delete account" · "Permanent. Your profile, runs, boards entries, desk membership, and analytics are erased immediately. If you're a desk staffer, the desk passes to the longest-tenured analyst first. This cannot be undone." · placeholder "type DELETE to confirm" · "Delete my account" | | |
| 375 | account:236–237 | reset msgs: "Reset link sent — check your inbox." · "Could not send: [err]" · "Could not send the reset email." | | |
| 376 | account:257–265 | delete msgs: "Type DELETE (all caps) to confirm — this is permanent." · "Deleting…" · "Couldn't delete — contact hello@hotkey.gg and we'll handle it." · "Something went wrong — contact hello@hotkey.gg." | | |
| 377 | account:281–296 | handle msgs: "2–24 characters — letters, numbers, and underscores only." · "That handle is reserved — pick another." · "Handles can change once every 7 days — next change available [date]." · "That handle is taken — try a variation." · "Saved ✓ — the boards update on next load. (Handles can change once every 7 days.)" | | |
| 378 | account:301–310 | desk error map (Title-case twin of lb.js's): "Real firm and group names are reserved — verified desks are coming." … "Something went wrong." | INCONSISTENT | same strings as #342–343 but sentence-cased here, lowercase there — pick one casing for shared desk errors |
| 379 | account:318–322 | desk summary: "desk — [name]" · "analysts — N / 200" · "your role — staffer / analyst" · "Your desk lives on its own page now — the hall, quests, and boards[, plus the invite link, application inbox, and roster controls,] are all there." · "The hall →" · "Staffer controls →" · "Leave desk" | | |
| 380 | account:326–330 | leave flow: "Really leave? click again" · "Leaving drops you from the desk boards and quests — rejoining needs the invite link." · "You've left the desk." | | |
| 381 | account:334 | anon desk note: "Desks need a full account — set an email & password in the Profile card above and your progress comes with you." | | |
| 382 | account:337–344 | create/join: placeholder "desk name — e.g. Wharton UG Finance" · "private" · "Start a desk" · placeholder "have an invite code?" · "Join" · "No code? Browse the guild board and apply to a public desk." | | |
| 383 | account:348–355 | msgs: "Give the desk a real name (3+ characters)." · "That name won't fly — pick something you'd put on a resume." · "Paste the invite code from your staffer." | | |
| 384 | account:377–383 | school row: "school — not set" · buttons "pick your school / change / done" · "show on card & boards" | | |
| 385 | account:400–403 | school errors: "That name won't fly — pick something you'd put on a resume." · "Letters, numbers, spaces and simple punctuation only (2–40 chars)." · "School changes are limited to one per 30 days — your colors are a commitment, not a costume." | TONE | "a commitment, not a costume" is cute-adjacent; if keeping the voice bar strict: "School changes are limited to one per 30 days." |
| 386 | account:424 | home-desk button: "Join [school] — your school's desk (N on it)" | | |
| 387 | account:433–437 | password msgs: "Password needs at least 8 characters." · "Passwords don't match." · "Password updated ✓" | | |
| 388 | account:445–447 | flair msgs: "Couldn't save — try again." · "Flair set ✓" | | |
| 389 | account:451–453 | beta-tool msgs: "Ranked unlocked for testing ✓ — open the leaderboard." · "Reset ✓ — the real gate applies again." | | |

## I · Drill library & SEO pages (drills/index.html, dev/build-drill-pages.js, reference.html)

| # | Location | Current copy | Flag | Suggested |
|---|---|---|---|---|
| 390 | drills/index:7–8 | title "The drill library — 81 Excel shortcut drills · hotkey.gg" · meta "Every hotkey.gg drill: navigation, formatting, formulas, lookups, and full model builds — 81 interactive Excel keyboard drills with par scores. No mouse allowed." | | |
| 391 | drills/index:98–100 | crumbs "hotkey.gg / drill library" · eyebrow "◆ the drill library" · h1 "81 drills, zero mouse" | | |
| 392 | drills/index:101 | sub: "The whole curriculum — from arrow-key navigation to full three-statement builds. Every drill has a par time, an optimal key count, a watchable demo, a follow-along walkthrough, and a leaderboard. The chords are the Windows banker set; on a Mac, ⌘ and ⌥ speak the same language." | | |
| 393 | drills/index:103–104 | CTAs: "start training →" · "the shortcut compendium" | INCONSISTENT | nav + footer call it "reference"; "compendium" appears only here — "the shortcut reference" |
| 394 | drills/index:106+ | per-drill grid rows: label + first ~90 chars of the drills.js desc (generated — edit drills.js, not this file) | | |
| 395 | build-drill-pages.js:329 | per-drill meta description suffix: "Par Ns, optimal N keys. Free interactive Excel drill — no mouse allowed." | | |
| 396 | build-drill-pages.js:328 | per-drill title: "[label] — Excel shortcut drill · hotkey.gg" | | |
| 397 | build-drill-pages.js:358–359 | drill page CTA: "train this drill →" · "par Ns · optimal N keys · keyboard only · free" | | |
| 398 | build-drill-pages.js:362–364 | section: "The shortcuts in this drill" · walknote "Alt walks: tap Alt, release, then the letters in sequence — each key steps one ribbon menu. On a Mac, tap ⌥ and use the same letters (KeyTips, Excel 2024+)." | | |
| 399 | build-drill-pages.js:366 | "functions you'll type: SUM() · IF() …" | | |
| 400 | build-drill-pages.js:370–371 | section: "The optimal line" · "the par-setting sequence, straight through:" | | |
| 401 | build-drill-pages.js:373–380 | "More [group] drills" · prev/next links · "all 81 drills" | | |
| 402 | build-drill-pages.js:134–200 | per-chord "use" blurbs (e.g. "Copy starts almost every hand-off — grab a finished block once, then place it in the summary, the deck, or next quarter's column." · "Bold marks structure: titles, total rows, anything the reviewer's eye should land on first.") — ~60 entries, one per chord | | |
| 403 | reference.html:6–7 | title "Shortcut reference · hotkey.gg" · meta "Every Excel shortcut the trainer drills — navigation, formulas, formatting, borders, paste special — searchable and printable." | | |
| 404 | reference.html:139–144 | h1 "Shortcut reference" · legend "drilled in the trainer" · "→ press in sequence (release between)" · "+ hold together" · "ⓘ mac setup" | | |
| 405 | reference.html:155–157 | search placeholder "Search" · count "N / M shortcuts" | | |
| 406 | reference.html:~255–260 | rapid-fire cross-links: "Foundations drills → navigation + editing cards (snap home, find, go to, copy, paste values)" · "Formatting drills → styling / alignment / numbers / borders cards — the same chords at recall speed" · "Data drills → sort + filter cards…" · "Formulas drills → formulas cards…" · "Dialog chords deck — find · replace · go to · … — the chords classic drills never exercise; pick the deck in the rapid-fire menu" | | |
| 407 | reference.html:~365 | per-row link "practice →" (title "practice this shortcut in a drill") | | |
| 408 | reference.html:~410 | fine print: "Macabacus is a trademark of Macabacus Inc.; FactSet is a trademark of FactSet Research Systems Inc. …" | | |

## J · Marketing pages (About, contact, enterprise; legal headers only)

| # | Location | Current copy | Flag | Suggested |
|---|---|---|---|---|
| 409 | About:6, 10 | title "About · hotkey.gg" · meta "A keyboard-only Excel speedrun trainer. Drill the keystrokes and modeling moves analysts use all day — timed, scored, and built into muscle memory before your internship." | | |
| 410 | About:226–227 | nav: "Train" · "Start training" | | |
| 411 | About:238–240 | hero: eyebrow "Keyboard-only Excel · timed · scored" · h1 "Get fast at Excel. No mouse. Just reps." · lede "hotkey.gg is a speedrun trainer for the keystrokes and modeling moves that fill an analyst's day. Real tasks, the exact Windows shortcuts, timed to the hundredth of a second — drilled until they're reflex." | | |
| 412 | About:242 | "Start your first run" | | |
| 413 | About:264–266 | section: "How it works" · "Drills, not lessons." · "You don't read about shortcuts here. You execute them, against the clock, until they stop being something you think about." | | |
| 414 | About:270–271 | card 1: "Real tasks, real keystrokes" · "Exercises mirror what first-years actually do — paste-special values, clean a formatting mess, AutoSum, make a tab model-ready — using the exact Windows Excel shortcuts. The muscle memory transfers one-to-one." | INCONSISTENT | "Exercises" → "Drills" (site-wide noun) |
| 415 | About:275–276 | card 2: "Scored like a speedrun" · "Every run is timed, and your keystrokes are counted against the optimal path. You can watch your times drop as the moves turn into reflex — the same loop that makes typing tests addictive." | | |
| 416 | About:280–281 | card 3: "Keyboard or nothing" · "Reach for the mouse and the run gets flagged. The whole point is to work the way fast modelers work — hands on the home row, ribbon driven by Alt key tips, never hunting for a button." | | |
| 417 | About:289–291 | board section: "The board" · "Fastest hands win." · "Every run posts a time. Climb the board against your class — and find out who actually deserves the bragging rights before anyone sets foot on a desk." | | |
| 418 | About:296–299 | demo board rows: "you, hopefully" · "classmate" · exercise names "hardcode it / clean the paste / model-ready" | | |
| 419 | About:301–303 | board veil: "The boards are live — 81 drills, each with a ladder." · "daily & weekly gauntlets · ranked tiers · desks & school standings" · "See the leaderboard" | | |
| 420 | About:311–313 | final CTA: "Your first run takes thirty seconds." · "Three exercises. One clock. No mouse." · "Start training" | DEAD | "Three exercises" is stale (the catalog is 81 drills; entry is one warm-up) — e.g. "One drill. One clock. No mouse." — and "exercises" → "drills" |
| 421 | About:320–323 | footer: "An Excel speedrun trainer." · Microsoft trademark line | | |
| 422 | contact:6–7 | title "contact · hotkey.gg" · meta "Support, bug reports, schools and clubs, press, and security disclosure — one inbox, routed by subject." | | |
| 423 | contact:68–69 | h1 "Contact the team" · sub "One inbox, routed by subject line — pick your lane and we'll get back to you, usually within two business days." | | |
| 424 | contact:73–76 | lane "✉ support": "Stuck on your account, a board that looks wrong, sign-in trouble, or a data request (export / deletion)." · "hello@hotkey.gg →" | | |
| 425 | contact:79–81 | lane "⚠ bugs": "Something behaved un-Excel? Tell us the drill, the keystrokes you pressed, and what you expected — that's usually enough to reproduce it." · "report a bug →" | | |
| 426 | contact:84–86 | lane "◆ desks & enterprise": "PRO for a whole desk, analyst-class training programs, or firm-wide rollouts — there's a dedicated page for that conversation." · "enterprise & partnerships →" | | |
| 427 | contact:89–91 | lane "🎓 schools & clubs": "Finance clubs, MBA cohorts, and career centers: school standings are already live — we're happy to help you set up a desk for your members." · "talk to us →" | | |
| 428 | contact:94–96 | lane "📰 press": "Writing about keyboard-first Excel training or the finance-prep space? We'll get you screenshots, numbers, and a human." · "press inquiries →" | | |
| 429 | contact:99–101 | lane "🔒 security": "Found a vulnerability? Please report it privately — see the disclosure policy for scope and what to include." · "security policy →" | | |
| 430 | contact:105–107 | fine print: "hotkey.gg is in private beta — replies come from a small team, so include enough detail to skip a round trip. Legal: terms · privacy · security." | | |
| 431 | enterprise:6–7 | title "enterprise · hotkey.gg" · meta "PRO for the whole desk: private boards, weekly assignments, 4-week training programs, and a cohort report worth forwarding." | | |
| 432 | enterprise:84–86 | hero: eyebrow "◆ enterprise & partnerships" · h1 "PRO for the whole desk" · sub "Your analysts already live in Excel. hotkey.gg turns keyboard fluency into a measurable, competitive team sport — private boards, weekly assignments, and a cohort report you can put in front of whoever signed off on the budget." | | |
| 433 | enterprise:88–89 | CTAs: "talk to us →" · "see the desks page" | | |
| 434 | enterprise:93–117 | "What a desk gets": "◆ the private room" (Desk-only leaderboards… / The hall — roster, ranks, weekly activity, time saved per analyst / School colors and verified-desk badging) · "✍ the training program" (Weekly quests… / 4-week program templates: Intern week 0, First-year bootcamp, Speed weeks / Guided demos…) · "📈 the receipts" (Cohort report (print / PDF)… / Per-analyst evaluation… / Application inbox…) | | |
| 435 | enterprise:121–133 | "How firms use it": "analyst classes" · "live desks" ("Staffers pin the week's quests; the hall shows who's putting in reps and who's idle. The desk ladder makes speed a standing competition instead of a one-off training.") · "clubs & programs" | | |
| 436 | enterprise:137–152 | "Two ways to run a desk": "◆ community desk — free ◆ always" ("Any club or cohort can start a desk for free — private boards, the roster hall, weekly quests, the guild board, school colors. This is the community layer, and it stays free.") · "◆ PRO for the desk — per-seat ◆ billed to the desk" · "free PRO ◆ a recruiting cycle" (school clubs comp) | | |
| 437 | enterprise:157 | how-to line: "How to turn it on: start a desk, then open your staffer controls and hit request PRO for the desk. Student clubs are comped for the cycle; firms get one invoice for every seat. Individual analysts who'd rather go solo can grab PRO on their own — and any .edu email starts a free 7-day PRO trial automatically." | | |
| 438 | enterprise:163–166 | steps: "Start a desk from the desks page — name it, grab the invite link." · "Drop the link in the group chat. Analysts join in one click; applications from the guild board land in your inbox." · "Pin a program. One click a week runs a 4-week curriculum with time targets derived from par." · "Print the cohort report when someone asks whether it worked." | | |
| 439 | enterprise:169–172 | footer CTAs: "enterprise inquiries →" · "partnerships →" · "everything else" | | |
| 440 | privacy:6–7, 55 | title "privacy · hotkey.gg" · meta "What hotkey.gg collects and what we do with it." · h1 "Privacy Policy" (+ section h2s: What we collect / How we use it / Service providers / Retention & deletion / Your rights / Children / International users / Changes / Contact) | | |
| 441 | security:6–7, 55 | title "security · hotkey.gg" · meta "How to report vulnerabilities to hotkey.gg." · h1 "Security" (+ h2s: How we protect your data / Reporting a vulnerability / For organizations) | | |
| 442 | terms:6–7, 55 | title "terms · hotkey.gg" · meta "The terms of service for hotkey.gg." · h1 "Terms of Service" (+ h2s: The Service / Eligibility & accounts / Acceptable use / Intellectual property / Leaderboards / Subscriptions & payment / Disclaimers / Limitation of liability / Termination / Governing law / Changes / Contact) | | |
| 443 | privacy/security/terms:6 | page titles are lowercase ("privacy · hotkey.gg") while Stats/Account/Leaderboard titles are capitalized | INCONSISTENT | pick one: either "Privacy · hotkey.gg" style everywhere or lowercase everywhere |

## K · Drill catalog — names, labels, descs (drills.js)

Format: **name · label** — desc (picker/tab label noted only where it differs interestingly). These strings feed the trainer, picker, leaderboard, stats, and the generated SEO pages — one edit here lands everywhere.

### Foundations

| # | Location | Current copy | Flag | Suggested |
|---|---|---|---|---|
| 444 | drills.js:53 | **Navigate · Navigation tour** — "The keyboard jumps every direction — thread a long maze (8 jumps), select a block, copy it, paste it into the summary, return home" | | |
| 445 | drills.js:113 | **Model Tour · Follow the markers** — "Four subtotals blown to #REF! — ctrl-jump to each, rebuild the cascade formula" | | |
| 446 | drills.js:57 | **Fill · Fill down, fill right** — "Ctrl+D and Ctrl+R — one formula, whole block" | | |
| 447 | drills.js:61 | **Paste Sp. · Alt E S everything** — "One copy, two pastes — values then formats" | | |
| 448 | drills.js:58 | **Block Sel. · Assemble and format the summary** — "COPY what stays, CUT what moves into a headed output, add a margin note, then format it to match" | | |
| 449 | drills.js:55 | **Rows · Rebuild the schedule** — "Insert a row and paste the staged line in, delete the junk — the live SUM widens and contracts itself" | | |
| 450 | drills.js:56 | **Columns · Columns move too** — "Ctrl+Space selects it, Alt H D C deletes it, Alt H I C inserts one" | | |
| 451 | drills.js:59 | **Edit · Fix the typos in place** — "Three typos, three F2 repairs — never retype a cell" | | |
| 452 | drills.js:60 | **Undo · Undo is a tool** — "Delete big, Ctrl+Z, then delete only what deserved it" | | |
| 453 | drills.js:73 | **Copyover · One copy, three hand-offs** — "Two full pastes + Alt E S V values for the summary" | | |

### Formatting

| # | Location | Current copy | Flag | Suggested |
|---|---|---|---|---|
| 454 | drills.js:80 | **Typeset · Typeset the memo** — "Bold, unbold, italic memos, strike the dead line, =TODAY() stamp" | | |
| 455 | drills.js:81 | **Decimals · The decimals pass** — "Alt H 9 / Alt H 0 — dollars none, multiples and percents one" | | |
| 456 | drills.js:85 | **Center · Set the alignment** — "Center, left, right — three alignment passes, house style" | | |
| 457 | drills.js:54 | **Autofit · Fix the squeezed columns** — "##### everywhere — Alt H O I fits the columns" | | |
| 458 | drills.js:77 | **Rule Off · Rule off the schedule** — "Accounting rulings: line under headers, line above every total, box the headline" | | |
| 459 | drills.js:78 | **Ruling Pass · The ruling pass** — "The page says done — the pass disagrees. Find the missing rulings, fix only those" | | |
| 460 | drills.js:79 | **Combo · Clean the paste** — "Bold, comma, wrap and autofit a pasted table" | | |
| 461 | drills.js:82 | **Format tab · Full formatting pass** — "Title ruled, inputs blue, percents, commas — book-ready" (tab: "Dress") | | |
| 462 | drills.js:76 | **House Style · Clean it to standard** — "A full cleanup pass: title, headers, blue inputs (one buried), commas, %, ruled off" | | |
| 463 | drills.js:86 | **Gauntlet · Make it model-ready** — "A full model-ready formatting pass" (tab: "Model") | VAGUE | desc restates the label; say what's different: e.g. "everything from the chapter at once — the formatting capstone" |

### Formulas I

| # | Location | Current copy | Flag | Suggested |
|---|---|---|---|---|
| 464 | drills.js:101 | **Margins · Margins across the page** — "EBITDA ÷ revenue, three comp tables — pointed, filled, %" | | |
| 465 | drills.js:121 | **Foot · Total it both ways** — "SUM across and down, tie out the corner" (tab: "Cross-foot") | | |
| 466 | drills.js:102 | **Anchors · Pin it with F4** — "F4 cycles the locks — one pinned formula prices the whole grid" | | |
| 467 | drills.js:130 | **% of rev · Common-size both statements** — "Both blocks ÷ their OWN revenue, $-locked so the fill can't drift" | | |
| 468 | drills.js:103 | **Growth · Run the growth rates** — "Consolidate, YoY as %, CAGR with ^ — a real revenue build" | | |
| 469 | drills.js:115 | **CAGR · Compound it, three times** — "(End÷Begin)^(1÷yrs)−1 — three scattered blocks" | | |
| 470 | drills.js:120 | **Bridge · Build the profit bridge** — "Profit = revenue × margin, fill it across years" | | |
| 471 | drills.js:116 | **SUMIF · Roll up the segments** — "SUMIF rollup + live foot + % of total, summary dressed" | | |
| 472 | drills.js:117 | **SUMIFS · Sum on two criteria** — "One mixed-anchor SUMIFS fills the segment × region grid" | | |
| 473 | drills.js:118 | **FX Convert · Convert the page — one boxed rate** — "One boxed EUR→USD rate drives a 2D-filled conversion — anchored driver, outlined output" | | |
| 474 | drills.js:119 | **Sticky switch · Scenario switch with CHOOSE** — "A CHOOSE driver reads the switch and repositions the model; a self-referencing IF snapshots each case into the output table" | | |

### Data & Lookups

| # | Location | Current copy | Flag | Suggested |
|---|---|---|---|---|
| 475 | drills.js:93 | **Sort · Sort the table** — "Sort the table, total it, bold the total" | | |
| 476 | drills.js:94 | **Scrub · Clean the export** — "A system export with a duplicate header, a page-break row, and a stale SUBTOTAL — delete all three, sort, re-total" | | |
| 477 | drills.js:96 | **Group · Fold the detail away** — "Shift+Alt+→ groups the months — never hide, always group" | | |
| 478 | drills.js:97 | **Filter · Work the filtered view** — "Ctrl+Shift+L turns on filters, Alt+↓ opens the picker — the answer reads itself" | | |
| 479 | drills.js:98 | **Unhide · Unhide the rows** — "Hidden rows lie — unhide the sins, group them right, set a real width" | | |
| 480 | drills.js:142 | **Lookup · Look it up** — "Pull a value out of a table with INDEX/MATCH" | | |
| 481 | drills.js:143 | **2-way · Two-way lookup** — "INDEX with two MATCHes — row and column at once" | | |
| 482 | drills.js:95 | **Recon · Two systems, one truth** — "COUNTIF for presence, INDEX/MATCH for amounts — drive Δ to zero" | | |
| 483 | drills.js:89 | **Hardcode · Hardcode it** — "Break the links before it ships — ESV in place, painted blue" | | |
| 484 | drills.js:90 | **Series · Stub the year header** — "Fill the year header, then bold + right-align it" (tab: "Years") | | |

### Formulas II

| # | Location | Current copy | Flag | Suggested |
|---|---|---|---|---|
| 485 | drills.js:123 | **Review Pass · Review pass — find what's broken** — "Three planted breaks in a real P&L — find them all" (tab: "Audit") | | |
| 486 | drills.js:83 | **Error triage · Error triage — #REF! #DIV/0! #VALUE!** — "Three classic breaks — read the error, rebuild the intent" | | |
| 487 | drills.js:128 | **IFERROR · Wrap it or fix it** — "Wrap the truly missing, fix the merely broken — never bury errors" | | |
| 488 | drills.js:124 | **Tie-out · Make it tie — hunt the break** — "The check row was pasted over — resurrect it, run both breaks down" | | |
| 489 | drills.js:125 | **Stale Links · Re-point the stale links** — "Assumptions moved to v2 — three cells still read the dead block" | | |
| 490 | drills.js:126 | **Trace · Trace the precedents** — "Ctrl+[ rides to the source, Ctrl+] rides back — fix it upstream" | | |
| 491 | drills.js:127 | **Audit · Hunt the hardcodes** — "F5 → special → constants — every number a formula should own lights up" (tab: "Audit") | INCONSISTENT | name + tab collide with "Review Pass" (#485, also tab "Audit") — rename one, e.g. name "Hunt", tab "Hunt" |
| 492 | drills.js:129 | **Sign Sweep · Flip the signs back** — "Pasted costs came in positive — sweep the signs, prove EBIT, margin it" | | |
| 493 | drills.js:84 | **Roll-forward prep · Replace hardcodes so it rolls forward** — "Typed answers → live formulas; v2 must survive new numbers" | | |
| 494 | drills.js:122 | **Balance · Make it balance** — "2 yrs SUM-footed both sides, check at zero, totals dressed" | | |

### Models I

| # | Location | Current copy | Flag | Suggested |
|---|---|---|---|---|
| 495 | drills.js:104 | **WACC · Build the discount rate** — "Unlever, relever, CAPM, weight — the full discount-rate build" | | |
| 496 | drills.js:105 | **uFCF · Build the unlevered FCF** — "EBIT → less taxes → NOPAT → plus D&A, less capex and the NWC build: the row every DCF discounts, filled across five years" | | |
| 497 | drills.js:106 | **DCF · Discount the cash flows** — "DF row × PV row; the TV reuses the year-5 factor" | | |
| 498 | drills.js:133 | **Comps · Run the comps** — "Build the multiples, read the summary — median, high/low and the LARGE/SMALL trimmed range — land per share and premium" | | |
| 499 | drills.js:67 | **Txn Comps · Run precedent transactions** — "Multiples paid, the average, and the implied equity" | | |
| 500 | drills.js:72 | **Football · Build the football field** — "Midpoints per method, MIN floor, MAX ceiling — the summary page" | | |
| 501 | drills.js:70 | **Sensitivity · Run the sensitivity table** — "True mixed anchors — one formula fills the 5×3 WACC × growth grid" | | |
| 502 | drills.js:71 | **Ret. Bridge · Attribute the returns** — "Growth, multiple, delever — prove the bridge ties with a zero check" | | |
| 503 | drills.js:69 | **Acc/Dil · Run accretion / dilution** — "Combined EPS vs standalone — synergies in, financing drag out" | | |
| 504 | drills.js:68 | **S&U · Balance sources and uses** — "Total, plug, check zero — then % of total down both sides" | | |

### Models II

| # | Location | Current copy | Flag | Suggested |
|---|---|---|---|---|
| 505 | drills.js:132 | **Schedule · Roll it forward** — "5-yr roll: linked openings + the accumulated-dep memo" | | |
| 506 | drills.js:131 | **Interest · Run the interest schedule** — "Roll the debt, then rate × the opening balance is cash interest — and EBITDA ÷ interest is the coverage the covenant reads" | | |
| 507 | drills.js:112 | **LBO · Run the LBO math** — "Entry equity, exit equity, MOIC — then IRR over the hold" | | |
| 508 | drills.js:114 | **Revolver · Sweep the revolver** — "MIN/MAX sweep ×4 years, then prove out both balances" | | |
| 509 | drills.js:62 | **Waterfall · Run the paydown waterfall** — "3-yr cascade: MIN rations, both tranches corkscrew across" | | |
| 510 | drills.js:66 | **Cov. Table · Run the covenant table** — "Net leverage vs a stepping max — headroom, a real IF flag, MIN pulls the pinch quarter" (tab: "Covenants") | | |
| 511 | drills.js:65 | **Liq. Bridge · Bridge the liquidity — three cases** — "Cash + undrawn to ending liquidity, Base / Downside / Severe — read which cases breach" | | |
| 512 | drills.js:64 | **13-Week Cash · Run the 13-week** — "The restructuring staple: a weekly roll-forward, an anchored liquidity cushion, totals on flows only" | | |
| 513 | drills.js:63 | **Full Waterfall · Run the full cascade** — "3 tranches × 4 yrs: seniority MINs, per-tranche corkscrews, total debt ruled off" (tab: "Cascade") | | |
| 514 | drills.js:141 | **Debt Sched. · Run the debt schedule** — "Type the rate, paint it blue, run the 5-yr sweep corkscrew" (tab: "Debt") | | |

### Full Builds

| # | Location | Current copy | Flag | Suggested |
|---|---|---|---|---|
| 515 | drills.js:136 | **IS Build · Build the income statement** — "5-yr IS: anchored drivers, margin row as %, bottom line ruled" | | |
| 516 | drills.js:137 | **BS Build · Balance the balance sheet** — "3 yrs: SUM both sides, RE roll filled across, dressed to zero" | | |
| 517 | drills.js:140 | **CFS Link · Link the cash flow statement** — "5-yr corkscrew + conversion memo as %, close ruled off" | | |
| 518 | drills.js:138 | **NWC Sched. · Roll working capital** — "Type the drivers, paint them blue, roll NWC five years" (tab: "NWC") | | |
| 519 | drills.js:139 | **3-Statement · Tie the three statements** — "3 yrs × 3 links, checks at zero, totals dressed to ship" (tab: "3-Stmt") | | |
| 520 | drills.js:109 | **Op model · Build the operating model** — "Drivers up: grow revenue off one anchored rate, cost it as % of sales, and gross profit, EBITDA and the margin line build themselves" | | |
| 521 | drills.js:107 | **DCF page · Build the DCF page** — "The whole valuation page: DF, PV, terminal value, EV — bridge to value per share, then one =NPV() line audits your whole PV row" | | |
| 522 | drills.js:108 | **Paper LBO · Build the paper LBO** — "Sources & uses sizes the equity plug, entry to exit lands MOIC — then prove the IRR twice: compounded, and =IRR() over the raw equity flows" | | |
| 523 | drills.js:110 | **Debt block · Build the debt & interest block** — "Two tranches, each rolling on its own anchored rate — senior and sub corkscrews, both interest lines, then total debt and total interest" | | |
| 524 | drills.js:111 | **Model cover · Build the model cover** — "The page-one output box: reference the model into the headline metrics, then stamp the cover title clean with UPPER(TRIM())" | | |

### Campaign, bands, PRO offer, plugin layers (drills.js)

| # | Location | Current copy | Flag | Suggested |
|---|---|---|---|---|
| 525 | drills.js:194–201 | campaign versions: "v1 · Foundations 🎓" · "v2 · Formatting 🎨" · "v3 · Formulas I ➗" · "v4 · Data & Lookups 🔎" · "v5 · Formulas II 🧮" · "v6 · Models I · Valuation 🏦" · "v7 · Models II · Credit 📉" · "v8 · Full Builds 🏗" | | |
| 526 | drills.js:203 | finisher: "⭐ Model complete" | | |
| 527 | drills.js:213–219 | speed bands: "Cleared / Bronze / Silver / Gold / Elite" | | |
| 528 | drills.js:427–429 | PRO plans: "$7 per month" · "$19 per season · 3 months · one recruiting cycle" | | |
| 529 | drills.js:431 | PRO tagline: "Train like the desk is watching." | | |
| 530 | drills.js:433–435 | feature: "The full catalog, day one — Models + Full Builds from Level 1 — DCF, LBO, debt schedules, three-statement builds" (free: "unlocks as you level") | | |
| 531 | drills.js:436–438 | feature: "The Weakness Queue — the site builds your session — slowest vs par, never-cleared, gone-stale drills first" (free: "pick your own drills") | | |
| 532 | drills.js:439–441 | feature: "Plugin keyboard layers — Macabacus + FactSet shortcut profiles on every drill" (free: "native Excel only") | | |
| 533 | drills.js:442–444 | feature: "Ghost replays — race a live ghost of your PB run — its cursor glides the recorded path against your clock" (free: "time + key-count pace only") | | |
| 534 | drills.js:445–447 | feature: "Deep analytics — keystroke heatmap, speed-by-drill trends, percentile history" (free: "core stats + PBs") | | |
| 535 | drills.js:448–450 | feature: "Pro cosmetics — exclusive card flair + share-card themes + first access to new looks" (free: "standard flair") | | |
| 536 | drills.js:452 | roadmap: "Interview mode — timed assessment + report card" · "Season rewards track" | | |
| 537 | drills.js:453 | betaNote: "Beta: PRO perks are free for everyone. The progression ladder still applies — the climb is the game — but at launch PRO opens the full catalog from Level 1. Beta players lock in founder pricing." | | |
| 538 | drills.js:336 | Macabacus layer note: "Defaults verified against the CFI×Macabacus cheat sheet (Jul 2026) — number/border/color cycles piggyback on the native Excel chords; most desks remap some in Shortcut Manager." | | |
| 539 | drills.js:363 | FactSet layer note: "Verified against FactSet's published Hot Keys sheet (Jul 2026) — remappable via FactSet ribbon → Settings → Manage Hotkeys." | | |

### Achievements (drills.js:253–315) — medal names + descs

| # | Location | Current copy | Flag | Suggested |
|---|---|---|---|---|
| 540 | drills.js:253–254 | "Tourist — Attempt 10 different drills" · "Completionist — Attempt every drill on the board" | | |
| 541 | drills.js:255–257 | "Blink — Finish any drill in under 5 seconds" · "No Wasted Keys — Match the optimal keystroke count exactly" · "Economist — 10 runs at or under optimal keys" | | |
| 542 | drills.js:258 | "Thorough — Take over a minute on a single solve" | | |
| 543 | drills.js:259–260 | "Old Habits — Ruin a run with the mouse" · "The Mouse Is a Lifestyle — Ruin 10 runs with the mouse" | | |
| 544 | drills.js:261–263 | "Night Shift — Clean solve between midnight and 4am" · "Dawn Patrol — Clean solve between 5 and 7am" · "Weekend Warrior — Clean solve on a Saturday or Sunday" | | |
| 545 | drills.js:264, 272–274, 295–296 | volume ladder: "Opening Bell — 25 clean solves" · "Warm Hands — 100" · "Deal Flow — 250" · "Grinder — 500" · "Ten Thousand Keys — 2,000 clean solves" · "Volume Business — 200 recorded runs" | INCONSISTENT | "Ten Thousand Keys" counts solves, not keys — rename (e.g. "Two Thousand Solves") or repoint at keystrokes |
| 546 | drills.js:265–268 | coverage: "Foundations Poured — PB on every Foundations drill" · "Full Stack — At least one PB in every group" · "Collector — Hold a PB on 40 different drills" · "Par Machine — Beat par on 25 different drills" | | |
| 547 | drills.js:269–271, 299, 290 | pace ladder: "Under Par — Beat par on any drill" · "Finding the Line — …5 drills" · "Metronome — …10 drills" · "Untouchable — Beat par on EVERY drill" · "Half-Par Club — Clear any drill in under half its par" | | |
| 548 | drills.js:275–277, 297 | streak ladder: "Back Tomorrow — 3-day streak" · "Business Week — 7-day" · "Quarter Close — 30-day" · "Institution — 100-day" | | |
| 549 | drills.js:278–279, 300 | crowns: "First Blood — Hold #1 on any board" · "Land Grab — Hold 3 crowns at once" · "Corner Office — Hold 5 crowns at once" | | |
| 550 | drills.js:280–281, 298 | dailies: "Morning Person — Run 3 daily challenges" · "Regular — Run 10" · "Fixture — Run 50" | | |
| 551 | drills.js:282, 291 | gauntlet: "Gauntlet Runner — Post all 5 legs of a weekly gauntlet" · "Season Ticket — Post gauntlet legs in 4 different weeks" | | |
| 552 | drills.js:283–285 | intensity: "Deal Sprint — 10 posted runs in a single day" · "Live Deal — 25 posted runs in a single day" · "Full Weekend — Post runs on both Saturday and Sunday of the same weekend" | | |
| 553 | drills.js:286–289 | group mastery: "Solid Foundation — Beat par on every Foundations drill" · "Model Citizen — …every Models drill" · "Formula Desk — …every Formulas drill" · "Master Builder — …every Full Builds drill" | | |
| 554 | drills.js:301–303 | "Shelf Space — Hold a PB on 20 different drills" · "Field Coverage — Attempt 25 different drills" · "Piano Hands — 25,000 keystrokes in clean runs" | | |
| 555 | drills.js:306–315 | special class: "The RX Desk — Clear revolver, waterfall, cascade and the 13-week" · "House Style — Beat par on House Style — the senior's pass" · "Called Out — Win a challenge race" · "Undefeated — Win 5 challenge races" · "Clean Sheet — Clear the morning sheet — all three" · "Standing Order — Clear 10 morning sheets" · "Ice in the Veins — Bank a streak freeze (every 5-day streak earns one)" · "Tour Guide — Beat par on both navigation drills" · "Chord Library — Use 25 distinct shortcuts in clean runs" · "Shipped It — Beat par on the three-statement capstone" | | |

---

## Count summary

- **Rows total: 555** (many rows carry several sibling strings — distinct strings inventoried ≈ 1,100). **521 rows clean, 34 flagged.**
- **Flags by category:** INCONSISTENT 14 (#13, #29, #31, #71, #96, #100, #117, #211, #378, #393, #414, #443, #491, #545) · DEAD 6 (#24, #72, #152, #299, #354, #420) · TONE 6 (#42, #73, #81, #154, #203, #385) · WORDY 4 (#21, #190, #238, #303) · VAGUE 2 (#252, #463) · JARGON 2 (#207, #331) · GRAMMAR 0.
- The three drifts most worth settling in one decision: **(1) the ladder's floor tier** (Candidate vs MBA Associate — #71/#100/#211), **(2) "exercise" vs "drill"** on About.html (#414/#420), **(3) desk copy shared across three files** — error-map casing and the stale "team codes" line (#24/#378/#342).
- The DEAD flags are the ones that can bite: the onboarding button copy that never renders (#72), the staffer program templates that pin deleted drills (#354), and the retired marathon mode's surviving modal + boards (#152/#299).
