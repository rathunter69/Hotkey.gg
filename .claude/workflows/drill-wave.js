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

if (!Array.isArray(args) || args.length === 0) {
  throw new Error('args must be a non-empty array of drill keys in catalog order, e.g. ["decimals","center","autofit","combo","gauntlet"]')
}
if (args.length > 5) throw new Error('Wave cap is 5 drills (WORKFLOW.md §9.4) — split the wave.')

const PROMPT = (key) => `You are a depth-pass drill build agent for hotkey.gg. Your drill key: ${key}.

READ FIRST, in this order (all in the repo — nothing you need lives outside it):
1. dev/WORKFLOW.md §9 — your ownership law (§9.1) and payload contract (§9.2). Binding.
2. dev/DEPTH_PASS.md §0 (how to use the doc) + §1 (the anatomy standard — §1.0 and §1.0-R2 are
   BINDING LAW and win over any older line) + the §2 mechanics your drill consumes + your drill's
   own §4 page. The §4 beat lines ship as the literal check labels.
3. dev/DRILL_DOCTRINE.md for anything §1 references.
4. dev/AUDIT.md r425 entries (undo, dress, editfix, modeltour) — your output-quality exemplars,
   including how judgment calls are documented as in-code comments quoting the §-line.

BUILD ${key} to its §4 page with §1.0/§1.0-R2 overlaid. If the page under-specifies something you
need, STOP and return a SPEC BUG report naming the missing detail — do NOT improvise design.

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
const results = await parallel(args.map((k) => () =>
  agent(PROMPT(k), { label: `build:${k}`, phase: 'Build', isolation: 'worktree' })
))

const missing = args.filter((k, i) => !results[i])
if (missing.length) log(`WARNING — no payload returned for: ${missing.join(', ')} (agent killed or errored; re-run those keys)`)
return { drills: args, payloads: results, missing }
