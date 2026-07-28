export const meta = {
  name: 'drill-wave',
  description: 'Launch one depth-pass drill build wave: one worktree agent per drill, WORKFLOW.md §9 payload contract',
  whenToUse: 'H6b drill build waves. args = ["decimals","center","autofit","combo","gauntlet"] — drill keys in catalog order, ≤5 per wave. Assembly stays with the orchestrator (§9.3) — this workflow only builds and returns payloads.',
  phases: [{ title: 'Build' }],
}

// WHY this exists (r427): 12 parallel agents appended to shared registry files and the
// union-merge corrupted all of them. This workflow enforces WORKFLOW.md §9.1 ownership:
// agents build in isolated worktrees, touch ONLY their drill's CHALLENGES block (+ a
// dedicated probe), and return everything else as a paste-ready PAYLOAD. The main session
// applies payloads SERIALLY per §9.3. Do not "improve" this by letting agents edit
// drills.js / check-invariants.js / e2e-alt-paths.js / e2e-depth-mechanics.js directly.

// Accept a real array OR a JSON-encoded / comma-separated string: some callers stringify args.
let keys = args
if (typeof keys === 'string') {
  const s = keys.trim()
  try { keys = JSON.parse(s) } catch { keys = s.split(',') }
}
if (!Array.isArray(keys)) keys = [keys]
keys = keys.map((k) => String(k).trim().replace(/^["']|["']$/g, '')).filter(Boolean)

if (keys.length === 0) {
  throw new Error('args must be a non-empty array of drill keys in catalog order, e.g. ["decimals","center","autofit","combo","gauntlet"]')
}
if (keys.length > 5) throw new Error('Wave cap is 5 drills (WORKFLOW.md §9.4) — split the wave.')

const PROMPT = (key) => `You are a depth-pass drill build agent for hotkey.gg. Your drill key: ${key}.

READ FIRST, in this order (all in the repo — nothing you need lives outside it):
1. dev/WORKFLOW.md §9 — your ownership law (§9.1) and payload contract (§9.2). Binding.
2. dev/DEPTH_PASS.md §0 (how to use the doc) + §1 (the anatomy standard — §1.0, §1.0-R2 and
   §1.0-R3 are BINDING LAW and win over any older line) + §3.1 (the audience map) + the §2
   mechanics your drill consumes + your drill's own §4 page. The §4 beat lines ship as the literal
   check labels.
3. dev/DRILL_DOCTRINE.md for anything §1 references.
4. dev/AUDIT.md r425 entries (undo, dress, editfix, modeltour) — your output-quality exemplars,
   including how judgment calls are documented as in-code comments quoting the §-line.

BUILD ${key} to its §4 page with §1.0/§1.0-R2/§1.0-R3 overlaid. If the page under-specifies
something you need, STOP and return a SPEC BUG report naming the missing detail — do NOT improvise
design.

R429 LAW — READ CAREFULLY, IT CHANGES YOUR PAGE:
- **§1.0-R3(n) the dual-audience real-task law.** Your board must read as a real file a real person
  has open at a real job — for BOTH audiences (corporate mid-career professional AND aspiring
  banker/consultant). Apply the REALITY TEST to your board and prompt. Your §4 page names your
  drill's assigned ARTIFACT and audience (§3.1 locks chapter 2 at 5A/5B) — build that artifact.
  Convert the DATA, never the DIFFICULTY: same beat count, same axes, same par band.
- **§1.0-R3(o) the ☆ re-cut.** Your §4 page's ☆ has ALREADY been re-cut for this wave — it names
  the bonus family, the latch telemetry to reuse, and the skippability proof you must produce.
  Do NOT ship a formatting ☆. If your ☆ needs NEW engine telemetry, that is a payload item (§9.2
  item 6) with a written justification — build it in your worktree, but report it as a payload
  hunk, do not treat it as yours to keep.
- Your ☆ must not duplicate another chapter-2 drill's bonus family; your page states which family
  is yours (decimals=column-select · center=technique/centre-across · autofit=one-pass ·
  combo=current-region · gauntlet=format-cloning).

OWNERSHIP (WORKFLOW.md §9.1 — hard rule): edit ONLY your drill's CHALLENGES block in index.html
and, if needed, a dedicated probe script dev/verify-${key}.js. Do NOT edit drills.js,
dev/check-invariants.js, dev/e2e-alt-paths.js, dev/e2e-depth-mechanics.js, refmap.js, drills/*.html,
or engine code outside your block — deliver those changes as payload items instead.

VERIFY in your worktree per DEPTH_PASS §5.3: serve on your OWN port (NEVER 8791), run demo-replay
×3 seeds for ${key}, guided, your probe, the par sweep for ${key}, fit check. Kill your server
when done (WORKFLOW.md §7 hygiene).

Your FINAL MESSAGE is the §9.2 payload — all 8 sections, in order, paste-ready:
(1) worktree path + files touched · (2) the full AUDIT.md round entry for ${key} · (3) ALTS
entries as code, each green ×3 seeds · (4) invariant registration (C9 line + any custom guard) ·
(5) drills.js deltas (meta/desc de-hint clean, PARS, CLOCKS/capstone if granted) · (6) engine
telemetry hunk if your ☆ needs one, with why existing telemetry could not carry it · (7) par-sweep
median/drift/s-per-key + test matrix + screenshot paths · (8) spec deviations with §-anchors, or
"built to page verbatim".`

phase('Build')
const results = await parallel(keys.map((k) => () =>
  agent(PROMPT(k), { label: `build:${k}`, phase: 'Build', isolation: 'worktree' })
))

const missing = keys.filter((k, i) => !results[i])
if (missing.length) log(`WARNING — no payload returned for: ${missing.join(', ')} (agent killed or errored; re-run those keys)`)
return { drills: keys, payloads: results, missing }
