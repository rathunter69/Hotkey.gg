# Mac support — design decision + build plan (task #29)

Wolf: "we've been cutting out like half of our target users, especially college
kids with their Mac pros." This doc frames the one decision that shapes the whole
build, then lays out the implementation in shippable stages.

## The core problem

Excel for Mac is not Windows Excel with different keycaps:

| Concept | Windows Excel | Excel for Mac |
|---|---|---|
| Ribbon access | **Alt walks** (`alt h k`, `alt e s v`) | **Does not exist.** No Alt-key ribbon sequences at all |
| Anchor cycling | `F4` | `⌘T` (or `fn+F4` if fn-keys enabled) |
| Paste special | `Ctrl+Alt+V` / `alt e s` | `⌘⌃V` |
| Edit cell | `F2` | `⌃U` (F2 needs fn) |
| Most Ctrl chords | `Ctrl+C/V/B/…` | `⌘C/V/B/…` (⌃ variants usually also work) |
| Fill right/down | `Ctrl+R` / `Ctrl+D` | `⌘R` / `⌘D` |
| Number formats | `Ctrl+Shift+1/4/5` | `⌃⇧1/4/5` (mostly parity) |
| Function keys | plain | intercepted by macOS unless fn or "use F-keys" enabled |

Roughly 60% of our curriculum maps 1:1 with a modifier swap; the Alt-ribbon
walks (~25% of drilled chords, including the formatting spine) have **no Mac
equivalent** — Mac Excel users do those tasks via ⌘1 dialogs, menu search, or
toolbar clicks.

## The decision: which Excel do we teach a Mac user?

**Option A — Windows-parity ("the trading floor answer").** Teach Windows
shortcuts on Mac hardware; map ⌘→Ctrl and ⌥-walks→Alt-walks in our engine.
Rationale: banks run Windows Excel (locally or via Citrix/VDI); the summer
analyst with a MacBook will be judged on Windows chords. Our sheet is a
simulator anyway — we can accept ⌥ h k as `alt h k` even though real Mac Excel
can't. Risk: students practicing in *real* Mac Excel between sessions find the
Alt walks don't work there, and we must say so honestly.

**Option B — native Mac curriculum.** Teach Excel-for-Mac's real bindings
(⌘T, ⌃U, ⌘⌃V…), drop/replace the Alt-walk drills on Mac. Rationale: honest to
the user's actual daily tool. Risk: splits the curriculum, halves the
leaderboard comparability (an `alt h k` drill and a `⌘1-dialog` drill aren't
the same par), and under-prepares them for the desk they're training FOR.

**Recommendation: A-primary with honest labeling ("train for the desk").**
- The engine accepts Mac input: **⌘ ≡ Ctrl** everywhere, **⌥ opens the ribbon**
  (⌥ h k ≡ alt h k), **⌘T ≡ F4**, **⌃U ≡ F2**, fn-key fallbacks.
- All keycaps, guides, demo captions, and the reference page render in the
  player's platform language (⌘/⌥/⌃ glyphs on Mac).
- A one-time Mac onboarding card says the quiet part out loud: *"Banks run
  Windows Excel — we teach those chords. On this Mac, ⌘ is your Ctrl and ⌥
  drives the ribbon. Where real Mac Excel differs (F4→⌘T, F2→⌃U), we accept
  both and show both."*
- The reference page gets a Windows/Mac column toggle showing the true Mac
  Excel binding next to each chord — so the same page serves both worlds.

This keeps one curriculum, one leaderboard, one par table — and turns the Mac
gap into a selling point ("your MacBook is now a Windows-Excel trainer").

## Build plan (each stage shippable + gateable)

**Stage 1 — input layer (engine).** A single `normalizeKey(e)` shim ahead of
the keydown handlers: on Mac (`navigator.platform`/UA-CH), `metaKey` maps to
`ctrlKey`, bare `Meta` keydown is ignored (no browser conflicts since we
preventDefault inside the sheet), `Alt`/`Option` keeps opening the ribbon
(⌥-generated dead characters must read `e.code` not `e.key` — KeyH not "˙"),
`⌘T`→F4, `⌃U`→F2. Browser-reserved chords we can't intercept (⌘W/⌘Q/⌘N/⌘T-tab)
get documented alternates; note ⌘T IS interceptable in fullscreen and mostly
outside it — needs device testing. **The e.code fix for ⌥-sequences is the
single most important line of the build.**

**Stage 2 — display layer.** `window.HK_PLATFORM` in themes.js; a
`kbdLabel(chord)` formatter every surface already funnels keycap text through
(guides, checklists, demo captions, keyflash, reference) renders `Ctrl+C` as
`⌘C`, `alt h k` as `⌥ h k`, `F4` as `⌘T / F4` on Mac.

**Stage 3 — onboarding + reference.** The one-time Mac explainer card; the
reference page Windows/Mac toggle with true Mac-Excel bindings; fn-key setup
tip (System Settings → Keyboard → "Use F1, F2… as standard function keys").

**Stage 4 — parity + measurement.** e2e suite runs the full parity matrix
through the Mac input path (dispatch metaKey events); add `mac:1` to the `pv`
telemetry event so the Ops dashboard shows the actual Mac share of traffic —
data for whether stage 3+ investments continue.

Pars don't change: same number of keystrokes, different modifier.

## Open questions for Wolf
1. Sign off on A-primary? (Everything above assumes yes.)
2. Should Mac players' boards mix with Windows players'? (Recommend yes —
   same chords, same par; the input layer makes them identical.)
3. Device testing: need a real MacBook pass before default-on (browser ⌘
   interception varies Safari vs Chrome) — beta testers with Macs exist?
