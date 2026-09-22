# Phase F build brief: Desks, schools, certificates

Branch `rebuild`, code under `app2/`. Read `docs/SITE_SPEC.md` §8, §11, §11a, §12 and `CLAUDE.md` before starting. Do not touch the old build. No framework, no build step, no bare imports (`app2/tests/run-checks.js` fails on them).

## 0. Preconditions (stop if any is missing)

Phase F depends on B (accounts), D (attempts, drills, boards) and E (entitlements). Before writing anything, confirm these exist on the branch; if not, report "Phase F blocked on <thing>" and stop:

1. `app2/supabase/migrations/` with the Phase B schema (profile tables split public/private, `attempts`), and `app2/supabase/tests/` with the pgTAP runner. Read the newest migration to learn the real table and column names; this brief uses `profiles_public` / `profiles_private` / `attempts` as placeholders and you must substitute the real ones.
2. A client data module from Phase B that exposes `rpc(name, args)` (wraps `supabase.rpc`, throws `{code}` on error) and `session()` (current user or null). Find it with `grep -rn "supabase" app2/app/*.js`. Do not create a second Supabase client.
3. Drill IDs from Phase D (`app2/content/index.js` or a drills module) so assignments can reference a drill by string id.

## 1. Database (new forward migration `app2/supabase/migrations/<ts>_phase_f_desks_schools_certs.sql`)

Old build reference only: `git show origin/main:supabase/migrations/20260712000000_desks.sql` (tables `teams`, `team_members`, `create_desk`, `join_desk`, `leave_desk` with captain succession), `20260712600000_desk_assignments.sql`, `20260712500000_school_tags.sql` (`school_map` seed list is reusable), `20260903000000_certificate_tracks_r452.sql`. Copy ideas, not code; the old tables had world-readable `select using (true)` policies and direct client writes, which are exactly what §12 forbids.

Tables (RLS enabled on all; **no** policies granting insert/update/delete to `authenticated`; `revoke all on <table> from anon, authenticated` then grant `select` only where noted):

```
desks            id uuid pk, name text (3-40, unique ci), slug text unique,
                 invite_code text unique (12 chars, random), captain_id uuid -> auth.users,
                 created_at
desk_members     desk_id, user_id, role check in ('captain','member'), joined_at, pk(desk_id,user_id)
                 unique index on (user_id)        -- one desk per account in v1 (old rule; keeps boards unambiguous)
desk_assignments id uuid pk, desk_id, drill_id text, target_ms int null, note text (<=140) null,
                 due_at timestamptz null, created_by uuid, created_at
                 -- trigger: max 5 open assignments per desk
desk_creations   user_id, created_at   -- rate limit: 3 desks created per user per day
schools          domain text pk, name text        -- seed from old school_map
certificates     id uuid pk default gen_random_uuid(), user_id, chapter_id text,
                 tier check in ('completed','verified'), handle_at_issue text, issued_at,
                 attempt_id uuid null -> attempts
                 unique (user_id, chapter_id, tier)
```

Profile changes: add `school_domain text null` to the **private** profile table and `school_tag text null` (nullable, opt-in) to the **public** one. `invite_code` must never be selectable by clients: no `select` grant on `desks` at all; everything goes through functions.

Functions, all `security definer set search_path = public`, `revoke execute from public`, `grant execute to authenticated` (anon only where marked). Raise `exception 'NOT_SIGNED_IN'`, `'ALREADY_ON_DESK'`, `'DESK_NOT_FOUND'`, `'NOT_CAPTAIN'`, `'NOT_MEMBER'`, `'LAST_MEMBER'`, `'TOO_MANY_ASSIGNMENTS'`, `'RATE_LIMITED'`, `'BAD_NAME'`, `'NOT_SCHOOL_EMAIL'`, `'CHAPTER_INCOMPLETE'`, `'NOT_VERIFIED_RUN'` so the client maps codes to copy.

| Function | Who | Returns |
|---|---|---|
| `desk_create(p_name)` | signed in, not on a desk | `{id,name,slug,invite_code}`; inserts captain row + `desk_creations` |
| `desk_preview(p_code)` | anon + auth | `{name, captain_handle, members}` — nothing else |
| `desk_join(p_code)` | signed in, not on a desk | `{desk_id,name,slug}` |
| `desk_leave()` | member | void; captain leaving promotes longest-tenured member, deletes desk if empty (old `leave_desk` logic) |
| `desk_mine()` | member | desk row, role, member count, members `[{user_id,handle,role,joined_at}]`, `invite_code` **only when role = captain** |
| `desk_rotate_invite()` | captain | new code |
| `desk_remove_member(p_user)` | captain, not self | void |
| `desk_set_assignment(p_drill, p_target_ms, p_note, p_due)` | captain | assignment row |
| `desk_clear_assignment(p_id)` | captain | void |
| `desk_assignments(p_desk)` | member | list |
| `desk_board(p_desk, p_drill, p_page)` | member | 25 rows per page from clean `attempts` (no help, no mouse), best per user |
| `desk_member_progress(p_desk)` | captain | per member: per-assignment best clean ms + attempts, chapters completed. Nothing outside assignments and chapter completions (§11a promise) |
| `school_refresh()` | signed in | reads `auth.users.email`, matches `schools.domain` (longest suffix match), sets private `school_domain`; returns school name or raises `NOT_SCHOOL_EMAIL`. Only if `email_confirmed_at` is set |
| `school_set_visible(p_on)` | signed in | copies name into public `school_tag` or nulls it |
| `school_board(p_domain, p_drill, p_page)` | anon + auth | rows only for users with public `school_tag` set |
| `certificate_issue(p_chapter)` | signed in | derives tier server-side: `completed` if every lesson in the chapter has a completed attempt; `verified` additionally requires a chapter-assessment attempt with `mode='solo'`, `help_used=false`, `mouse_used=false`, `elapsed_ms <= limit` (limit per chapter in a `chapter_limits` table, seed Foundations = 20 min). Idempotent via the unique constraint; returns both certificates the user now holds for that chapter |
| `certificate_verify(p_id)` | anon + auth | `{chapter_id, tier, handle_at_issue, issued_at}` or empty |
| `certificates_mine()` | signed in | list |

Chapter lesson lists must come from a table (`chapter_lessons(chapter_id, lesson_id)`) seeded by the migration and checked against `app2/content/index.js` by a node test, so the certificate rule never drifts like the old r452 arrays did.

## 2. Permission tests (`app2/supabase/tests/desks.test.sql`, pgTAP)

Style: the transactional fixture pattern from `git show origin/codex/groundwork-db-integration:supabase/tests/database/01-desk-authorization.test.sql` (`pg_temp.actor(n)` sets JWT claims, `pg_temp.probe(sql)` runs a statement in a subtransaction and reports whether it was allowed). Run only against the disposable local database via the Phase B runner. Every desk rule gets an assertion; the list is the exit check:

- anon: every function except `desk_preview`, `school_board`, `certificate_verify` raises; direct `select` on `desks`, `desk_members`, `desk_assignments`, `certificates` returns permission denied.
- authenticated: direct insert/update/delete on all five tables denied; `select` on `desks` denied (invite code hidden).
- `desk_create` twice → `ALREADY_ON_DESK`; 4th create in a day by a fresh user → `RATE_LIMITED`; bad name → `BAD_NAME`.
- `desk_join` with wrong code → `DESK_NOT_FOUND`; while on a desk → `ALREADY_ON_DESK`.
- `desk_mine` as member: `invite_code is null`; as captain: not null.
- member calling `desk_rotate_invite`, `desk_remove_member`, `desk_set_assignment`, `desk_clear_assignment`, `desk_member_progress` → `NOT_CAPTAIN`.
- non-member calling `desk_board`, `desk_assignments` → `NOT_MEMBER`.
- 6th open assignment → `TOO_MANY_ASSIGNMENTS`.
- captain leaves with two members → other member becomes captain; last member leaves → desk row gone.
- `desk_member_progress` for user X never returns attempts on drills that are not assignments.
- `school_refresh` with a gmail address → `NOT_SCHOOL_EMAIL`; with `x@stern.nyu.edu` → tag `NYU Stern`, public `school_tag` still null until `school_set_visible(true)`.
- `certificate_issue` with one lesson missing → `CHAPTER_INCOMPLETE`; complete + assessment with `mouse_used=true` → only `completed` row; clean solo assessment under limit → both rows; second call returns the same ids.
- `certificate_verify` as anon returns the row and no `user_id`.

## 3. Client

Create `app2/app/desks.js` (data layer + pure helpers, node-testable):
- `parseInviteCode(input)` → code from a raw code or an invite URL like `https://hotkey.gg/#/desk/join/ABCD1234EFGH`; null when invalid. Move the regex currently inline in `app2/app/teams-page.js` (`codeForm.onsubmit`) here.
- `inviteLink(code)` → `location.origin + location.pathname + '#/desk/join/' + code`.
- `errorCopy(code)` → learner-facing sentence for every exception name above; default "Something went wrong. Try again."
- `certificateTier(attempts, chapter, limitMs)` → mirror of the server rule, used by the UI to say why a Verified certificate is not available yet ("assessment was done with the mouse").
- thin async wrappers `createDesk`, `joinDesk`, `leaveDesk`, `myDesk`, `setAssignment`, `clearAssignment`, `memberProgress`, `deskBoard`, `schoolRefresh`, `schoolVisible`, `schoolBoard`, `issueCertificate`, `verifyCertificate`, `myCertificates`, each calling Phase B's `rpc`.

Pages (each exports `mountXxxPage(root, ctx)` returning `{destroy}`, like `app2/app/teams-page.js`):
- `app2/app/desk-page.js`: `#/desk` — the learner's desk: name, members, private board (drill picker, paged), assignments; captain extras: invite code with copy button and link, rotate, remove member, add/clear assignment (drill select, optional target and note), member progress table. Empty state links to `#/teams`. `#/desk/join/<code>`: `desk_preview` → "Desk name · invited by handle · what the captain sees" → Join. Guests see the sign-in card from Phase B with `?next=` back here, keeping local progress (Phase B carry-over).
- `app2/app/certificate-page.js`: `#/cert/<uuid>` public verification page (works signed out, no nav account state needed): chapter, tier, handle, date, "Verified means…" explanation, one line on group reporting (§11a). Not found → honest card.
- `app2/app/teams-page.js`: "Create a desk" → `#/desk?create=1` when signed in, else Phase B sign-in with `next`; "Have a code?" → `#/desk/join/<code>`. Delete the localStorage `CODE_KEY` path and its copy; keep `REQUESTS_KEY` only if Phase E did not already wire the group-request RPC.
- `app2/app/leaderboard-page.js`: School and Desk tabs load `school_board` / `desk_board` with paging; keep the honest empty states; Desk tab for a non-member shows the start-a-desk prompt.
- `app2/app/account-page.js`: Desks section links to `#/desk`; new Certificates section (list, Claim button per chapter, why Verified is unavailable); Profile section gets "Show my school" toggle with `school_refresh` on first use.
- `app2/app/main.js`: add routes `desk`, `deskjoin` (`/^\/desk\/join\/([A-Za-z0-9]{12})$/`), `cert` (`/^\/cert\/([0-9a-f-]{36})$/`) to `parseRoute`, `LOADERS`, `titleFor`; `navKeyFor` returns `''` for them. `app2/ui/nav.js` `ACCOUNT_ITEMS`: Desks → `#/desk`.
- Home (`app2/app/home-page.js`) after Chapter 1 complete: the one-line "Doing this with classmates or colleagues? Start a desk" (§11a). Nowhere else; never a popup.
- CSS in `app2/ui/site.css`: reuse `.tcard`, `.board`, `.row` classes; copy the desk banner look from old `lb.css` (`.dk-cap`, `.dk-stat`) by eye.

## 4. Node tests and smoke

- `app2/tests/desks.test.js`: `parseInviteCode` (code, link, junk, lowercase → uppercased), `inviteLink`, `errorCopy` covers every code, `certificateTier` cases, `chapter_lessons` seed in the migration SQL equals `CHAPTERS[i].lessons.map(l => l.id)` (parse the migration text).
- `app2/tests/pages.test.js`: extend the `parseRoute` / `titleFor` assertions for the three new routes.
- `app2/tests/smoke.mjs`: add `#/desk`, `#/desk/join/ABCDEFGHJKLM`, `#/cert/00000000-0000-4000-8000-000000000000` to the route loop. Network is blocked, so each must render its signed-out / not-found card with no page errors; RPC failures must render the error card with Retry, never an empty page.

## 5. Order of work

1. Preconditions check. 2. Migration + pgTAP file; run locally until green; run Supabase security advisors on the local instance. 3. `desks.js` + node tests. 4. Routes + desk page + join page. 5. Certificate page + account sections. 6. Leaderboard tabs, teams page, home line. 7. Smoke, `npm run check` under 30 s, update the phase table row F in `docs/REBUILD_PLAN.md` to "Built; Cowork chat to review and apply". Do not apply the migration to the live project; that is the Cowork chat's job.

## 6. Traps

- Never `select` on `desks` from the client; the old build leaked `invite_code` until a column-grant fix. Functions return it only to the captain.
- `desk_member_progress` is the privacy promise on the join page: assignments and chapter completions only. Test it.
- Tier is decided by the server from `attempts`; the client's `certificateTier` is explanatory copy, never the source of truth.
- `handle_at_issue` is stored so a later handle change does not rewrite history; verification shows it, plus the current handle only if the profile is public.
- One desk per account is a v1 simplification, not a spec decision. Note it under REBUILD_PLAN §8 open decisions.
- Keep all migration SQL idempotent and forward-only; never edit an applied Phase B file.
- Boards are paged (`p_page`), never one capped read (§12).