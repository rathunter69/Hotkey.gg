# Architecture and source ownership

## Runtime today

```text
Static pages (Cloudflare Pages and GitHub Pages deployment checks exist)
  index.html: trainer, spreadsheet engine, CHALLENGES, scoring and persistence
  drills.js: catalog, campaign, tracks, pars and premium configuration
  themes.js: themes/assets plus rank, XP and shared identity behavior
  nav.js / nav.css: navigation, account/profile UI and shared state synchronization
  lb.js / lb.css: leaderboards and desk surfaces
  account/profile/stats/billing/admin/cert pages: page-specific inline scripts
                         |
                         v
  Supabase JS client -> Auth + Postgres tables / RLS / RPC functions
                         |
                         v
  Edge Functions: create-checkout (test only), weekly-digest
```

There is no React/Vite/Next application or frontend compilation step. The new `package.json`
only makes development dependencies and commands reproducible. `index.html` is roughly 34,500
lines at the baseline; drill content occupies a large part of it.

## Editing map

| Concern | Edit here | Related contracts |
|---|---|---|
| Spreadsheet operations, formula evaluation, keyboard input, rendering | `index.html` | Formula, keyboard parity, Mac input, borders, resize and pause suites |
| Drill boards and grading | `index.html` → `CHALLENGES` | Paired guides/targets/checks, demo replay, alternate routes, par measurement |
| Names, descriptions, membership, order | `drills.js` → `HOTKEY_DRILLS` | Campaign, tracks, placement, daily pool, SEO generator |
| Progression and rank | Campaign/pars in `drills.js`, calculations in `themes.js`, consumers in page scripts | Rank and leaderboard tests, certificates in SQL |
| Identity and shared shell | `themes.js`, `nav.js`, `nav.css` | Cross-page smoke, visual and entitlement behavior |
| Leaderboards/desks | `lb.js`, `lb.css`, related HTML and SQL | Leaderboard tests, permissions, run integrity |
| Persistence and authorization | `supabase/migrations/` and client callers | Inspect newest function definition and policy before changing it |
| Payment | `billing.html`, premium config, `supabase/functions/create-checkout/`, entitlements SQL | Test-only today; webhook and authoritative integration incomplete |
| Website headers | `_headers` | Cloudflare configuration is external; local preview does not emulate headers |

## Generated files and retained dependencies

- `dev/build-drill-pages.js` loads the actual trainer and generates `drills/*.html` and
  `sitemap.xml`. Edit source metadata/content first, then regenerate. The generated pages stay
  committed because production serves static files.
- `dev/gen/curriculum-html.py` generates `dev/CURRICULUM_V5.md` and `dev/curriculum-v5.html`
  from `curriculum_v51_data.py`.
- `dev/gen/curriculum-v5-json.py` generates `dev/curriculum-v5.json` from the data/map Python
  files, the older v3 vocabulary and the runtime catalog. Run generators from the repository root.
- `dev/migrate-*.sql` are historical mirrors, not a deployment route. Some are still read by
  guards (notably certificate tracks). Do not move/delete them until those dependencies are replaced.
- `.claude/workflows/` holds previous assistant-specific automation. It is not a production or
  GitHub Actions entry point. Current work does not require that orchestration system.

## Refactor boundaries to establish

The target is to separate these responsibilities, in small behavior-preserving changes:

1. **Engine:** cells, formulas, selection, clipboard, undo and commands; independent of rewards.
2. **Drill content:** builders, objectives, guides and grading using an explicit engine interface.
3. **Session controller:** timing, hints, completion and results; emits a completed-run record.
4. **Progression:** XP, mastery, ranks and unlock decisions; consumes run/progress data.
5. **Persistence:** Supabase access, retries and account synchronization.
6. **Presentation:** trainer chrome, player identity, navigation and other pages.

These are intended ownership boundaries, not folders that already exist. Before each extraction,
identify consumers and source-parsing tests that depend on inline blocks. Preserve behavior first;
change gameplay in a subsequent commit. Framework migration is not a prerequisite.

## Why catalog changes affect so many systems

September 17 follow-up: Wolf identified this as a practical obstacle to improving the content.
The code confirms several different relationships are attached to the same chapter lists and
drill keys. Some central definitions already exist; the problem is what those definitions control.

| Current link | Evidence | Effect of a catalog change |
|---|---|---|
| Chapter order becomes the universal drill order | `drills.js:181`, consumed by nav.js and lb.js | Menu navigation, profile listings and ranking calculations share the current catalog |
| Certificate membership derives from chapter names | `drills.js:193–212`; corresponding server certificate lists | Moving a drill between chapters can change certificate requirements; server rules must also agree |
| Milestones maintain another set of named drill lists | `drills.js:242–269` | Chapter rewards and capstones need coordinated changes beyond the picker |
| Paid classification and access gates use chapter membership | `drills.js:424–426`, `821–842` | A learning reorganization can change access classification; paid enforcement is currently disabled |
| Some achievements use the size/content of today's catalog | `drills.js:534`, `:562` | Adding/removing drills changes what qualifies for catalog-wide completion or speed awards |
| Competitive placement uses five specific drill keys | `drills.js:21`; nav.js and lb.js placement readers | Retiring one drill requires an explicit placement replacement and treatment of old completions |
| History and personal bests use the drill key | index.html run/PB code; `themes.js:727`, `nav.js:544` | Reusing a key for substantially different work can mix incomparable results; retiring it can hide history from catalog-filtered views |

This does not mean every achievement needs replacing whenever a drill changes. Generic solve,
streak and skill milestones can remain. The current catalog-wide and named-drill rules are the
parts that require deliberate treatment. Existing earned-state latches also need checking before
assuming that a changed qualification removes an award.

### Proposed separation — not implemented or approved as a rebuild

1. **Drills:** the exercise, skills taught, difficulty, grading and a lasting identity. Use a new
   scored revision when the task changes enough that its old best times are no longer comparable.
2. **Learning paths:** ordered recommendations that select drills. The same drill can appear in
   multiple paths without becoming a new exercise or creating duplicate progress.
3. **Progress and rewards:** explicit rules for learned skills, practice, achievements and
   certificates. Keep intentional drill-specific requirements, but avoid deriving unrelated
   eligibility from menu position or folder names. Give changing requirements a version.
4. **Play rules:** what timing, assistance, replay and competition mean for a completion. These
   rules should work consistently across the drills that support them, without requiring a new
   user-facing mode system.

Saved history must record what the learner actually completed. Proposed migration policy:
retain earned rewards and historical attempts; archive replaced exercises and rankings when
necessary; decide explicitly which old completions count toward a revised requirement. A broad
wipe or silent reinterpretation of old best times is not the default cleanup strategy.

Acceptance examples to settle before implementation: reordering a beginner path changes the
recommendation only; placing one drill in two paths counts one completion once; retiring a drill
does not erase earned history; materially revising a timed drill keeps old and new scores distinct;
changing a skill requirement does not silently change paid access. Validate the separation with
one small path change before considering any full catalog replacement.

## What the version numbers mean

- **Git SHA / PR:** identity and provenance of a change. Branch name and ancestry say where it lives.
- **`rNNN` in comments/commits:** historical session labels. They repeat across branches and are not
  reliable release identifiers.
- **`?v=NNN` on assets:** independent browser cache invalidation tokens, not product versions.
  Current consistency is checked by `dev/check-cache-versions.js`; runtime JS/CSS edits must update
  all consumers and regenerate drill pages.
- **Curriculum v3/v4/v5:** iterations of plans/reference data, not separate running applications.
- **Timestamped SQL migrations:** ordered database evolution. Do not reorder, squash or rewrite
  applied migrations to make the history look cleaner.
