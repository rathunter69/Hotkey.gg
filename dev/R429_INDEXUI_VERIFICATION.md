# r429 — verification of the r427 index-UI items AUDIT.md flagged as "no per-item record"

Read-only sweep of the live tree (branch claude/progress-audit-path-forward-q7y89t @ 59cdebb),
checking ROUND2_FEEDBACK.md §3 bugs R2-B6/B7 and §4c chrome items. Fold into the W4 assembly PR.

## ✅ CONFIRMED FIXED (r425/r427 did land these — AUDIT's "unverified" flag can be cleared)

| item | evidence |
|------|----------|
| **R2-B6** onboarding arrow keys dead on the keyboard-layout + experience pickers | Both cards now drive off ONE shared `hkCardPicker(m, btns, sel, onPick)` (index.html:18098) — handles ↑↓←→, Tab/Shift-Tab, Enter, number keys, click, with capture-phase listeners armed on both document and card. Called by `showKbCard` (~18155) and `showComfort` (~18178). The r425 comment names the ACTUAL root cause Wolf hit: `.ob-key.primary` painted the same accent block as `.focused`, so on the experience card the arrows worked but left the green block sitting on option 1 — it *read* as dead. Fix travels the primary styling with the selection. |
| **R2-B7** drill selector wraps to top past the last drill | `movePk(d)` (index.html:14448) clamps: `Math.max(0, Math.min(rows.length-1, pkSel+d))`, and returns early with `highlightPk()` when already at the edge. Hard stop, both ends. |
| **§4c** arrow-key help text illegible | `.pk-foot` (index.html:1359) — r425 comment cites Wolf §4c by name; moved from --faint 11px on a blurred backdrop to its own chip: own surface + border, 12.5px, `--text`, accent keycaps. |
| **§4c** section-completion signal | `pkGroupDone`/`pkGroupCleared` (index.html ~16853) + folder row renders either `✓ complete` seal or a live `n/N` counter, plus `.pk-folder.done .vdr-gname` accent. Legible folded or unfolded. |
| **§4c** selector default state = current chapter expanded, others collapsed | `pkDefaultFolds(names){ const here=GROUP_OF[cur]; return names.filter(n=>n!==here); }` — folds everything except the chapter you're in; `pkFolds` honors a saved `hk_pk_folds` override. Exactly the ask. |

## ❌ STILL OUTSTANDING — carry into the W4 assembly PR

1. **Tab-name expansion (§4c "there's room for longer names").** `drills.js` still ships the
   truncated forms. Confirmed offenders: `pastes` `tab:'Paste Sp.'` (Wolf's literal example →
   "Paste Special"), `liqbridge` `'Liq. Bridge'`, `dcfsens` `'Sens.'`, `accdil` `'Acc/Dil'`.
   Sweep every `tab:` in drills.js against the bottom-bar width and expand where it fits.
   NOTE: this is a drills.js meta change — it collides with the wave agents' meta payloads, so it
   MUST be applied during serial assembly (§9.3), not before.
2. **Selector row width (§4c "lots of empty space between drill name and time/par").**
   `.pk-byline .vdr-fname{flex:1}` (index.html:1328) expands the name cell to fill, pushing
   `.vdr-pb{min-width:74px}` (1333) and `.pk-par{width:64px}` (1335) hard right — that IS the gap.
   Tighten: drop pb min-width ~74→60 and par width ~64→52, or cap the name's flex-grow.
   Cosmetic-only; verify against the smoke render before shipping.

## Note for the AUDIT.md r426–r427 entry
Amend the "index-UI round — UNVERIFIED" line: 5 of 7 items VERIFIED PRESENT in the tree; the two
above are genuinely unshipped. The r427 index-UI round was real work, just undocumented.
