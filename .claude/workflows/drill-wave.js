export const meta = {
  name: 'drill-wave',
  description: 'Launch one depth-pass drill build wave: one worktree agent per drill, WORKFLOW.md §9 payload contract',
  whenToUse: 'H6b drill build waves, any chapter. args = ["wacc","fcfbuild","dcf","comps","txncomps"] — drill keys in catalog order, ≤5 per wave. Assembly stays with the orchestrator (§9.3) — this workflow only builds and returns payloads.',
  phases: [{ title: 'Build' }],
}

// WHY this exists (r427): 12 parallel agents appended to shared registry files and the
// union-merge corrupted all of them. This workflow enforces WORKFLOW.md §9.1 ownership:
// agents build in isolated worktrees, touch ONLY their drill's CHALLENGES block (+ a
// dedicated probe), and return everything else as a paste-ready PAYLOAD. The main session
// applies payloads SERIALLY per §9.3. Do not "improve" this by letting agents edit
// drills.js / check-invariants.js / e2e-alt-paths.js / e2e-depth-mechanics.js directly.
//
// r443 REWRITE. The r429 version was chapter-2's wave prompt frozen in time: it cited
// "§1.0-R3(n) dual-audience" (renumbered §1.0-R4(t) in r443 — the letters now mean different
// laws), claimed every page's ☆ was pre-re-cut (true only for wave 4), hardcoded chapter-2's
// bonus families, and never mentioned MODELING_STANDARDS.md. Agents on any later chapter were
// being briefed on the wrong chapter and the wrong law. This version is chapter-agnostic and
// carries the campaign rules that were paid for after it was written.

const MODELS_KEYS = new Set([
  'wacc','fcfbuild','dcf','comps','txncomps','football','dcfsens','retbridge','accdil','sourcesuses',
  'schedule','intsched','lbo','revolver','waterfall','covtable','liqbridge','wk13','cascade','debtsched',
  'isbuild','bsbuild','cfslink','nwcsched','threestmt','opmodel','dcfbuild','lbobuild','debtblock','dashcover',
])

// Accept a real array OR a JSON-encoded / comma-separated string: some callers stringify args.
let keys = args
if (typeof keys === 'string') {
  const s = keys.trim()
  try { keys = JSON.parse(s) } catch { keys = s.split(',') }
}
if (!Array.isArray(keys)) keys = [keys]
keys = keys.map((k) => String(k).trim().replace(/^["']|["']$/g, '')).filter(Boolean)

if (keys.length === 0) {
  throw new Error('args must be a non-empty array of drill keys in catalog order, e.g. ["wacc","fcfbuild","dcf","comps","txncomps"]')
}
if (keys.length > 5) throw new Error('Wave cap is 5 drills (WORKFLOW.md §9.4) — split the wave.')

const MODELS_BLOCK = `
THIS IS A MODELS-CHAPTER DRILL — dev/MODELING_STANDARDS.md IS BINDING (read it in full):
- A banker judges the MODEL first; a correct keystroke on a wrong model is worse than no drill.
  Colour-as-provenance, sign convention, the roll-forward corkscrew, the standard DCF/WACC/comps/
  LBO forms, three-statement linkage. This engine uses BEGINNING-BALANCE interest (no iterative
  calc) — that ruling is already made, do not redesign around it.
- Your board is a COMPONENT of a model, not the model: a debt schedule, a WC corkscrew, a driver
  block, one statement's linkage, a discounting strip. It must fit 20×10. A board that does not
  fit is scoped too wide — NARROW THE FRAGMENT, never raise the cap.
- State in your payload §8 which MODELING_STANDARDS conventions your board follows and where you
  deliberately simplified.`

const PROMPT = (key) => `You are a depth-pass drill build agent for hotkey.gg. Your drill key: ${key}.

READ FIRST, in this order (all in the repo — nothing you need lives outside it):
1. dev/WORKFLOW.md §9 — your ownership law (§9.1) and payload contract (§9.2). Binding.
2. dev/DEPTH_PASS.md §0 + §1. BINDING LAW, and get the letters right — they were renumbered r443:
   · §1.0-R3 (n)–(s) is the round-3 playtest law: (n) checklist lines are INSTRUCTIONS never
     lessons · (o) formatting beats reflect real desk frequency · (p) grade the END STATE, every
     valid route clears · (q) location cues over selection outlines · (r) engine facts incl. the
     width rule · (s) merge/retire when the lesson is carried.
   · §1.0-R4 (t)/(u) is the dual-audience law: (t) every drill is a REAL TASK for BOTH audiences
     (corporate mid-career professional AND aspiring banker/consultant — apply the reality test
     to board and prompt) · (u) the ☆ re-cut sweep.
   Any older doc line citing "R3(n) dual-audience" means R4(t). When in doubt, the law text in
   DEPTH_PASS.md §1 as it reads TODAY wins over any cached citation, including this prompt.
3. Your drill's own §4 page, plus the §2 mechanics it consumes and dev/DRILL_DOCTRINE.md.
   ⚠ Unless your §4 page is marked r429+, it is a PRE-PLAYTEST page: its ☆ line is DEAD ON
   ARRIVAL (likely a formatting ☆, outlawed by §1.0(d)) and its artifact is unverified against
   R4(t). Re-cut both yourself under (u) — do not escalate for that alone.
4. dev/DEPTH_PASS_CAMPAIGN.md — the practice. Non-negotiables from it:
   · Run the ☆-HEADROOM DIAGNOSTIC BEFORE building the board (§2 there): measure the star route
     and the slow route in keys. No legal headroom → report it, the drill may be a motif.
   · Grade the RESULT, never the keypress. A technique that leaves no trace in the end state
     belongs in the ☆, not a core beat.
   · Enumerate every Excel route to the visible end state and PROBE each one — reading predicates
     has never once found the untriggerable-beat class. Reuse the route facts in §1 there.
   · Width beats grade !overflowsCol(S,c) (figures) / !clipsCol(S,c) (labels) — NEVER a width
     number, never neededWidth (§1.0-R3(r)).
   · Any probe you write must mirror the real harness init (hotkey_onboarded, hk_tour_done,
     hk_learn_done, hk_handle_cache) or its output is a lie. If a probe returns a suspiciously
     UNIFORM number, suspect the probe before the product.
${MODELS_KEYS.has(key) ? MODELS_BLOCK : ''}
BOARD STANDARD: ROWS=20 is the default, floor AND cap — ROWS=14 is the catalog's most-copied
defect, do not inherit it. Report win-state density (rows carrying content / 20; §1.3 target
≥60%). Totals take TOP borders (§1.0(f)). The board must fit its frame at natural width if any
width verdict is graded.

BUILD ${key} to its §4 page with the law overlaid. If the page under-specifies something you
need, STOP and return a SPEC BUG report naming the missing detail — do NOT improvise design.
Improvisation is the failure mode this whole apparatus exists to prevent. Quote the §-line you
implement in a code comment for every judgment call.

OWNERSHIP (WORKFLOW.md §9.1 — hard rule): edit ONLY your drill's CHALLENGES block in index.html
and, if needed, a dedicated probe script dev/verify-${key}.js. A probe must be self-contained:
it may reference ONLY ${key} — naming any other drill breaks the C13 retirement guard. Do NOT
edit drills.js, dev/check-invariants.js, dev/e2e-alt-paths.js, dev/e2e-depth-mechanics.js,
refmap.js, drills/*.html, or engine code outside your block — deliver those as payload items.

VERIFY in your worktree: serve on your OWN port (NEVER 8791), run demo-replay ×3 seeds for
${key}, guided, your probe, the par sweep for ${key}, fit check. Kill your server when done.

Your FINAL MESSAGE is the §9.2 payload — all 8 sections, in order, paste-ready:
(1) worktree path + files touched · (2) the full AUDIT.md round entry for ${key} · (3) ALTS
entries as code, ≥2 per §1.8, each green ×3 seeds · (4) invariant registration (C9 line + any
custom guard) · (5) drills.js deltas (meta/desc de-hint clean, PARS, CLOCKS/capstone if granted) ·
(6) engine telemetry hunk if your ☆ needs one, with why fillOps/pasteOpLog/fmtOps/cutMoves/
gotoSpecials could not carry it · (7) par-sweep median/drift/s-per-key + test matrix + screenshot
paths (fresh/mid/win — take the win screenshot and LOOK at it; §8.1.5 sendable-page test) ·
(8) spec deviations with §-anchors, or "built to page verbatim" — plus, for Models drills, the
MODELING_STANDARDS conventions statement.`

phase('Build')
const results = await parallel(keys.map((k) => () =>
  agent(PROMPT(k), { label: `build:${k}`, phase: 'Build', isolation: 'worktree', model: 'opus' })
))

const missing = keys.filter((k, i) => !results[i])
if (missing.length) log(`WARNING — no payload returned for: ${missing.join(', ')} (agent killed or errored; re-run those keys)`)
return { drills: keys, payloads: results, missing }
