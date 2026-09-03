# CONTRACT AUDIT — client ↔ Supabase wire, hotkey.gg
Read-only static audit. 46 migrations replayed by reading, in filename order.
No DB credentials — every "prod state" claim below is derived from the migration
replay + the deploy workflow, not from a live query.

---

## 0. SCOPE NOTE — TWO TABLES ARE NOT IN THE REPO

`public.runs` and `public.profiles` are **never created by any migration**. Their
CREATE TABLE lives only in `hotkey-setup-guide.md:152` / `:175` (dashboard era).
Every migration ALTERs them. So does `public.members` / `public.access_codes` /
`public.redeem_code()` (`hotkey-setup-guide.md:206+`), which `index.html:30817` and
`index.html:30822` still call every session.

Consequence: `supabase db push` against a fresh project **fails on migration #3**
(`20260707000000_team_code.sql` ALTERs a nonexistent `profiles`). The repo cannot
rebuild the database. Base DDL for runs/profiles/members/access_codes/redeem_code
must be back-filled as migration `2025…_baseline.sql` for the migration channel to
mean what WORKFLOW.md §4 says it means.

---

## 1. THE EFFECTIVE SCHEMA (final state after replay)

### 1.1 Tables + final columns

| table | created | final columns (base + ALTERs) |
|---|---|---|
| **profiles** | setup-guide (NOT in repo) | id, handle, updated_at · +team_code (707000) +handle_changed_at (707200) +flair (707300) +school_domain, school_tag, show_school (712500) +featured_ach (713200) +digest_optout (716800) +theme (717600) +school_changed_at (717800) +client_state, client_state_at (724100) +email_recap, email_streak, email_certs (724100) |
| **runs** | setup-guide (NOT in repo) | id, user_id, challenge, time_ms, keystrokes, optimal, mouse_used, trace jsonb, created_at · +flagged, flag_reason (717100) |
| **sessions** | 20260101000000 | id bigserial, user_id, mode, duration_sec, score, keystrokes, misses, created_at · +optimal (101000001) +flagged, flag_reason (723000) |
| **entitlements** | 707100 | user_id PK, pro, source, updated_at · +expires_at, trial_used (717400) |
| **teams** | 712000 | id, name, slug, invite_code, owner_id (made NULLable 712400), is_private, created_at · +verified, edu_domain (712400) +recruiting (717700) |
| **team_members** | 712000 | team_id, user_id, role, joined_at · unique(user_id) = one desk per player |
| **team_assignments** | 712600 | id, team_id, challenge, target_ms, note, created_by, created_at, expires_at |
| **team_applications** | 716000 | team_id, user_id, note, created_at |
| **reports** | 712400 | id, reporter, kind, target, note, created_at |
| **desk_creations** | 712900 | user_id, created_at (rate-limit log, no policies) |
| **school_map** | 712500 | domain PK, tag — RLS on, **zero policies** (716100 lockdown) |
| **events** | 713300 | id, user_id (FK SET NULL), session_key, name, meta jsonb, created_at |
| **key_stats** | 716400 | user_id PK, counts jsonb, keys_lifetime, updated_at |
| **admins** | 716600 | user_id PK, added_at |
| **beta_codes** | 716900 | code PK, note, active, uses, created_at |
| **desk_pro_grants** | 717300 | team_id PK, kind, status, seats, note, requested_by, decided_by, requested_at, decided_at, expires_at |
| **certificates** | 724100 (§1/4) | id, user_id→profiles, track, handle, issued_at · +emailed_at |
| **drill_feedback** | 724100 (§4/4) | id, user_id, drill, note, created_at, done |
| **members / access_codes** | setup-guide (NOT in repo) | — |
| **invoices** | **DOES NOT EXIST** | billing.html:177 selects from it |

### 1.2 Final RLS policy set per table

| table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| profiles | readable by all | own (id) | own (id) | — |
| runs | `(not flagged) or user_id=auth.uid()` (717100 replaced "readable by all") | own | — | — |
| sessions | `(not flagged) or user_id=auth.uid()` (723000 replaced select_all) | own | — | — |
| entitlements | own | — | — | — |
| teams | all (col-restricted grant) | owner_id=uid | owner_id=uid | owner_id=uid |
| team_members | all | user_id=uid | — | self or `is_desk_captain()` |
| team_assignments | all | — | — | — (RPC-only writes) |
| team_applications | self or captain | self | — | self or captain |
| reports | **none** | reporter=uid AND note≤400 | — | — |
| events | **none** | `user_id is null or = auth.uid()` | — | — |
| key_stats | own | — | — | — |
| admins | own | — | — | — |
| certificates | all (public verify) | — | — | — |
| drill_feedback | own | own | — | — |
| school_map / beta_codes / desk_pro_grants / desk_creations | **none (deny-all)** | — | — | — |

### 1.3 Final grants (anon / authenticated)

* **profiles UPDATE** (whitelist, cumulative): id, handle, team_code, flair, show_school, featured_ach, updated_at (713200) + digest_optout (716800) + theme + client_state + client_state_at + email_recap + email_streak + email_certs (724200). ✅ the r417 H1 gap is closed.
* **profiles INSERT** (whitelist, last set 713200): id, handle, team_code, flair, show_school, featured_ach, updated_at. `theme`/`client_state`/`email_*`/`digest_optout` are **UPDATE-only** — an INSERT carrying them 403s. No client path does this today (all definer RPCs or plain `.update()`), but a future `.upsert({id, theme})` would silently fail.
* **teams SELECT** (col whitelist): id, name, slug, owner_id, is_private, verified, edu_domain, created_at (712400) + recruiting (717700). `invite_code` deliberately withheld.
* **team_assignments**: SELECT to anon+authenticated (712600).
* **events**: INSERT to anon+authenticated (713300).
* **entitlements / runs / events / sessions / key_stats / reports**: INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER revoked per 717200 (each keeps only what it needs).
* **school_map**: `revoke all` (716100). **desk_pro_grants**: `revoke all` (717300).

### 1.4 Final function signatures

`(D)`=SECURITY DEFINER · `(sp)`=`set search_path` · grant column = final EXECUTE grant.

| function | final args | returns | D/sp | grant |
|---|---|---|---|---|
| enforce_handle_rules() | — | trigger | D sp (717200) | trigger |
| desk_name_guard() | — | trigger | D sp | trigger |
| desk_cap_guard() | — | trigger | D sp | trigger |
| desk_rate_guard() | — | trigger | D sp | trigger |
| assign_cap_guard() | — | trigger | D sp | trigger |
| profiles_id_guard() | — | trigger | **plain, no sp** | trigger |
| runs_guard() | — | trigger | D sp | trigger |
| sessions_guard() | — | trigger | D sp | trigger |
| is_desk_captain(t uuid) | t | boolean | D sp | (default) |
| hk_name_ok(p_name text) | p_name | boolean | immutable sp | anon, authenticated |
| is_admin() | — | boolean | D sp | authenticated |
| preview_desk(p_code text) | p_code | table(name, slug, members bigint) | D sp | anon, authenticated |
| **create_desk(p_name text, p_private boolean=false)** | p_name, p_private | table(id, name, slug, invite_code) | D sp | authenticated |
| **join_desk(p_code text)** | p_code | table(team_id, name, slug) | D sp | authenticated |
| my_desk() | — | table(team_id, name, slug, role, members, invite_code) | D sp | authenticated |
| leave_desk() | — | void | D sp | authenticated |
| rotate_invite() | — | text | D sp | authenticated |
| refresh_school_tag() | — | text | D sp | authenticated |
| home_desk_for_me() | — | table(team_id, name, slug, members) | D sp | authenticated |
| join_home_desk() | — | table(team_id, name, slug) | D sp | authenticated |
| set_assignment(p_challenge text, p_target_ms int=null, p_note text=null) | 3 | void | D sp | authenticated |
| clear_assignment(p_challenge text) | 1 | void | D sp | authenticated |
| **apply_to_desk(p_team uuid, p_note text=null)** | 2 | void | D sp | authenticated |
| withdraw_application(p_team uuid) | 1 | void | D sp | authenticated |
| my_applications() | — | table(team_id, name, slug, created_at) | D sp | authenticated |
| desk_applications() | — | table(user_id, handle, note, created_at) | D sp | authenticated |
| decide_application(p_user uuid, p_accept boolean) | 2 | void | D sp | authenticated |
| bump_key_stats(p_counts jsonb, p_keys int=0) | 2 | void | D sp | authenticated |
| delete_account() | — | void | D sp | authenticated |
| admin_metrics() | — | jsonb | D sp | authenticated |
| admin_events(p_name text=null, p_limit int=50) | 2 | table(name, meta, user_id, created_at) | D sp | authenticated |
| admin_reports() | — | table(reporter, reporter_handle, kind, target, created_at) | D sp | authenticated |
| admin_resolve_report(p_kind text, p_target text) | 2 | void | D sp | authenticated |
| set_school_tag(p_tag text) | 1 | void | D sp | authenticated |
| digest_payloads() | — | table(10 cols) | D sp | **revoked from all** (service role only) |
| digest_unsubscribe() | — | void | D sp | authenticated |
| curtain_check(p_code text) | 1 | boolean | D sp | anon, authenticated |
| admin_flagged_runs() | — | table(9 cols) | D sp | authenticated |
| admin_run_verdict(p_id uuid, p_action text) | 2 | text | D sp | authenticated |
| request_desk_pro(p_note text, p_seats int) | 2 | text | D sp | authenticated |
| my_desk_pro() | — | table(status, kind, seats, expires_at, note, am_captain, members, seated, waitlisted) — **9 cols, r289 dropped+recreated** | D sp | authenticated |
| my_pro() | — | boolean (seat-capped, r289) | D sp | authenticated |
| admin_desk_pro_requests() | — | table(12 cols) | D sp | authenticated |
| admin_decide_desk_pro(p_team uuid, p_action, p_kind text, p_days int, p_seats int) | 5 | text | D sp | authenticated |
| set_desk_pro_seats(p_team uuid, p_seats int) | 2 | text | D sp | authenticated |
| start_pro_trial() | — | text | D sp | authenticated |
| my_pro_status() | — | table(pro, source, expires_at, trial_used) | D sp | authenticated |
| set_desk_recruiting(p_on boolean) | 1 | void | D sp | authenticated |
| **issue_certificate(p_track text)** | 1 | uuid | D sp | authenticated |
| admin_flagged_sessions() | — | table(10 cols) | D sp | authenticated |
| admin_session_verdict(p_id bigint, p_action text) | 2 | text | D sp | authenticated |
| **redeem_code(p_code text)** | 1 | boolean | D sp | **NOT IN REPO** (setup-guide only) |

### 1.5 Triggers

| trigger | table | timing | function |
|---|---|---|---|
| trg_handle_rules | profiles | BEFORE UPDATE | enforce_handle_rules |
| profiles_id_guard_t | profiles | BEFORE UPDATE | profiles_id_guard |
| desk_name_guard_t | teams | BEFORE INSERT OR UPDATE OF name | desk_name_guard |
| desk_rate_guard_t | teams | BEFORE INSERT | desk_rate_guard |
| desk_cap_guard_t | team_members | BEFORE INSERT | desk_cap_guard |
| assign_cap_guard_t | team_assignments | BEFORE INSERT | assign_cap_guard |
| runs_guard_trg | runs | BEFORE INSERT | runs_guard |
| sessions_guard_trg | sessions | BEFORE INSERT | sessions_guard |

Note `assign_cap_guard_t` is **BEFORE INSERT only**; `set_assignment` uses
`on conflict do update`, so re-pinning an existing drill never re-checks the cap
(harmless — the cap counts `challenge <> new.challenge`) and never prunes expired rows.

### 1.6 Cron

Exactly one scheduled job in migrations: `weekly-digest`, `0 13 * * 1`, pg_net POST to
`/functions/v1/weekly-digest` with `x-digest-secret` from `vault.decrypted_secrets`
(`20260716800000_digest.sql:77`). The three `dev/edge-*` senders document their own
`cron.schedule` calls **in comments only** — no migration creates them.

### 1.7 Replaced-function diffs (the r417 regression class)

| function | generations | verdict |
|---|---|---|
| enforce_handle_rules | 707200 → 707400 (bigger blocklist) → 717200 (+search_path) | ✅ monotonic |
| **desk_name_guard** | 712000 → 712300 (+protected firm names) → 716700 (**DROPPED protected names + slur list**) → 724200 (union restored) | ✅ fixed at 724200 |
| **apply_to_desk** | 716000 → 716200 (+FULL_ACCOUNT_REQUIRED) → 717700 (**DROPPED it**, +recruiting) → 724200 (union restored) | ✅ fixed at 724200 |
| join_desk | 712000 → 712400 (claim) → 712700 (claim fix) → 716300 (+anon guard) | ✅ monotonic |
| create_desk | 712000 → 716300 (+anon guard) → 725100 (+PRO_REQUIRED, explicit carry-forward table) | ✅ monotonic |
| refresh_school_tag | 712500 → 712800 (update→upsert) | ✅ |
| set_school_tag | 716700 → 717800 (+cooldown, update→upsert) | ✅ |
| my_pro | 717300 → 717400 (+expiry) → 717500 (+seat cap) | ✅ monotonic |
| admin_decide_desk_pro | 717300 → 717500 (+eff_seats) | ✅ |
| my_desk_pro | 717300 → **DROP + recreate** 717500 (6→9 cols) | ✅ intentional |
| **issue_certificate** | 724100 → 724200 (+flagged guard) → 725000 (−colops) | ✅ checks monotonic, **but arrays are stale — see P0-1** |

**No NEW dropped-check regression found.** The two known ones are repaired at 724200.

---

## 2. CLIENT CALL INVENTORY

### 2.1 RPCs (52 call sites)

| file:line | rpc | args passed | server args | verdict |
|---|---|---|---|---|
| index.html:31418 | curtain_check | p_code | p_code | OK (anon) |
| index.html:30822 | **redeem_code** | p_code | not in repo | P1 side-channel |
| index.html:2052 | digest_unsubscribe | — | — | OK |
| index.html:30648 / nav.js:1360 | my_pro_status | — | — | OK, reads data[0].{pro,source,expires_at} |
| index.html:30652 | start_pro_trial | — | — | OK (text) |
| index.html:24526 / account.html:552 | **issue_certificate** | p_track | p_track | **P0-1 DATA MISMATCH** |
| index.html:30725 / account.html:637 / lb.js:1165 | join_desk | p_code | p_code | OK |
| index.html:30764 / account.html:678 | refresh_school_tag | — | — | OK |
| index.html:30755 / account.html:704 | set_school_tag | p_tag | p_tag | OK |
| index.html:30767 / account.html:727 | home_desk_for_me | — | — | OK |
| account.html:734 | join_home_desk | — | — | OK |
| index.html:30774 / account.html:582 / lb.js:1216 | my_desk | — | — | OK |
| index.html:31009, 31373 | preview_desk | p_code | p_code | OK |
| index.html:31497 | bump_key_stats | p_counts, p_keys | p_counts, p_keys | OK |
| account.html:438 | delete_account | — | — | OK |
| account.html:596 / lb.js:451, 1450 | leave_desk | — | — | OK |
| account.html:631 / lb.js:1159 | create_desk | p_name, p_private | p_name, p_private | OK (PRO_REQUIRED live) |
| lb.js:252 | my_applications | — | — | OK |
| lb.js:457, 1124 | apply_to_desk | p_team, p_note | p_team, p_note | OK |
| lb.js:1135 | withdraw_application | p_team | p_team | OK |
| lb.js:1243 | rotate_invite | — | — | OK |
| lb.js:1252 | my_desk_pro | — | — | OK (9-col, reads .members/.seats/.status) |
| lb.js:1282 | request_desk_pro | p_note, p_seats | p_note, p_seats | OK |
| lb.js:1292 | desk_applications | — | — | OK |
| lb.js:1302 | decide_application | p_user, p_accept | p_user, p_accept | OK |
| lb.js:1342, 1370 | clear_assignment | p_challenge | p_challenge | OK |
| lb.js:1349, 1376 | set_assignment | p_challenge, p_target_ms, p_note | same 3 | OK |
| lb.js:1442 | set_desk_recruiting | p_on | p_on | OK |
| admin.html:94 | admin_metrics | — | — | OK (jsonb; reads players, active_7d, runs_24h, runs_total, runs_7d, desks, desk_members, applications, reports_open, events_24h, errors_24h, runs_by_day, top_events_24h) |
| admin.html:130 | admin_events | p_name, p_limit | p_name, p_limit | OK |
| admin.html:137 | admin_reports | — | — | OK |
| admin.html:145 | admin_resolve_report | p_kind, p_target | p_kind, p_target | OK |
| admin.html:151 | admin_flagged_runs | — | — | OK |
| admin.html:160 | admin_run_verdict | p_id, p_action | p_id, p_action | OK |
| admin.html:166 | admin_flagged_sessions | — | — | OK |
| admin.html:175 | admin_session_verdict | p_id, p_action | p_id, p_action | OK |
| admin.html:181 | admin_desk_pro_requests | — | — | OK |
| admin.html:204 | admin_decide_desk_pro | p_team,p_action,p_kind,p_days,p_seats | same 5 | OK |
| admin.html:211 | set_desk_pro_seats | p_team, p_seats | p_team, p_seats | OK |

**Every RPC arg name and count matches.** No ARG MISMATCH, no MISSING RPC except
`redeem_code` (exists in prod, absent from repo).

### 2.2 PostgREST table calls

| file:line | op | table · columns | verdict |
|---|---|---|---|
| index.html:31867/31891 | insert | runs (user_id, challenge, time_ms, keystrokes, optimal, mouse_used, trace) | OK |
| index.html:31906 | insert | sessions (user_id, mode, duration_sec, score, keystrokes, misses, optimal) | OK |
| index.html:29996 | insert | drill_feedback (rows) | OK |
| index.html:28609 / nav.js:26 / account.html:455 | update | profiles.theme | OK (granted 724200) |
| index.html:30758 / account.html:694,715 / profile.html:833 | update | profiles.show_school | OK |
| index.html:31084/31167, account.html:468 | upsert | profiles (id, handle, updated_at) | OK (r132 fix) |
| index.html:30817 | select | **members** | P1 side-channel |
| nav.js:1391 | update | profiles.client_state, client_state_at | OK (granted 724200) |
| nav.js:1146 | insert | events (user_id, session_key, name, meta) | OK; see P2-2 |
| nav.js:979, 1644 / profile.html:499 | update | profiles.flair | OK |
| profile.html:501 | update | profiles.featured_ach | OK |
| account.html:417 | update | profiles.digest_optout | OK |
| account.html:575 | update | profiles.email_recap/email_streak/email_certs | OK (granted 724200) |
| lb.js:463, 567 | insert | reports (reporter, kind, target) | OK |
| lb.js:1431 | delete | team_members | OK (policy: self or captain) |
| lb.js:157–161, nav.js:503–506, stats.html, profile.html, account.html | select | profiles / runs / sessions / team_members / teams / key_stats / certificates / team_assignments | OK |
| **billing.html:108** | select | **profiles.plan** — column does not exist | P2-1 |
| **billing.html:177** | select | **invoices** — table does not exist | P2-1 |
| themes.js:2358 | select head/count | profiles | OK |

### 2.3 auth / functions / storage
* `sb.auth.*`: getSession ×11, updateUser ×8, signOut ×4, resetPasswordForEmail ×3, signInAnonymously ×2, onAuthStateChange ×2, signUp, signInWithPassword, resend, mfa, getUser. All standard GoTrue — no server contract.
* `sb.functions.invoke('create-checkout', {body:{user_id, plan}})` — nav.js:1545. See P1-4.
* `.storage` hits in index.html:22073/22079 are the **in-drill Excel `localStorage` shim**, not Supabase Storage. No Supabase Storage usage anywhere.

---

## 3. FINDINGS

### P0 — a call that fails in prod

**P0-1 · `issue_certificate` requires 7 drills that no longer exist → the fluency and formulas certificates are unissuable.**
* client: `account.html:552` (Claim button), `index.html:24526` (auto-offer), `cert.html:140` (verifier)
* server: `supabase/migrations/20260725000000_retire_colops.sql:22–24`
* Finding: `HK_TRACKS` keys derive from `drills.js:37–46` groups → fluency **16**, formulas **28**, modeling **30**. The RPC's arrays are fluency **19** and formulas **32**. The extras — `undo`, `copyover`, `dress` (fluency) and `growth`, `grpfold`, `wirewalk`, `hunt` (formulas) — appear **nowhere in drills.js** (0 hits in `meta`, 0 in `groups`), so no player can ever post a clean run for them. `account.html:539` renders "Claim certificate" at `n===N` against the 16/28 client list; the RPC then raises `TRACK_INCOMPLETE:3` / `TRACK_INCOMPLETE:4`. `index.html:24530` swallows it into a misleading toast ("some clears never posted (guest runs from before sign-in don't count)"). `cert.html:143` would verify such a cert as ✓ — the two sides disagree by construction. Modeling (30) matches and works.
* Interesting: `dev/migrate-certificates.sql` **already carries the correct 16/28/30 arrays** (updated at r424). The side channel is AHEAD of `supabase/migrations/`; the r424 catalog edit landed in `dev/` and in `20260725000000` only for `colops`.
* Fix: new migration re-issuing `issue_certificate` with the arrays from `dev/migrate-certificates.sql` verbatim, carrying forward the `coalesce(r.flagged,false)=false` guard. Better: derive nothing by hand — add a `public.track_keys` table seeded from `drills.js` and have the RPC read it, killing the drift class.
* Effort: 20 min. Safe to auto-fix: **yes** (pure superset removal; strictly loosens a gate that is currently impossible to satisfy).

### P1

**P1-1 · The repo cannot rebuild the database — `runs`, `profiles`, `members`, `access_codes`, `redeem_code()` have no migration.**
* client: `index.html:30812` (profiles), `:30817` (members), `:30822` (redeem_code), plus ~40 other `runs`/`profiles` sites
* server: absent; DDL only in `hotkey-setup-guide.md:152,175,206`
* Finding: `20260707000000_team_code.sql:2` ALTERs `public.profiles` — on a fresh project `db push` dies there. r417 declared the side channel "reconciled"; that reconciliation covered only the four `dev/migrate-*.sql` files, not the setup-guide baseline. Also: `recordSession` (`index.html:31904`) gates on `me_member`, which is `false` unless `members` + `redeem_code` exist — so a rebuilt DB silently stops accepting session leaderboard posts.
* Fix: a `2025…_baseline.sql` migration with the guide's `runs`/`profiles`/`members`/`access_codes` DDL + `redeem_code()`, all `if not exists` (no-op against prod). Effort: 1 h. Auto-fix: **yes** (idempotent).

**P1-2 · `dev/migrate-certificates.sql` has drifted from `supabase/migrations/` in the opposite direction — the side channel is now the correct copy.** Same evidence as P0-1. Fix: once P0-1 lands, delete the four `dev/migrate-*.sql` files or stamp them "superseded by 20260724100000" — two live copies of the same DDL is the drift engine. Effort: 10 min. Auto-fix: yes.

**P1-3 · The run outbox never drops permanently-rejected rows, and 15 poisoned rows wedge it forever.**
* client: `index.html:31869–31872` (`flushRunOutbox`)
* Finding: the drop condition is `if(!error || /duplicate|conflict|unique/i.test(error.message))`. `runs_guard` (`20260717100000:33,37,40,44,48`) raises `RUN_REJECTED` and `RATE_LIMITED` — neither matches, and supabase-js **returns** the error rather than throwing, so the row falls through to "keep". A single unsatisfiable row (e.g. `time_ms > 3600000` from an idled run, `keystrokes > 5000`, or `optimal > 1000`) is retried on every flush forever. Worse, rejected rows still consume the `FLUSH_CAP=15` budget (`sent++` happens before the insert), so ≥15 poisoned rows mean **no good run ever posts again** on that device.
* Fix (client): drop on any non-transient PostgREST error — add `RUN_REJECTED` to the pattern, or gate on `error.code` being present at all, and only count `sent++` on rows that actually attempted. Effort: 15 min. Auto-fix: **yes**.

**P1-4 · `create-checkout` ignores the `plan` argument and trusts a client-supplied `user_id`.**
* client: `nav.js:1545` sends `{user_id, plan}` (monthly|yearly from the PRO sheet)
* server: `supabase/functions/create-checkout/index.ts:18` destructures `{ user_id }` only; `:23` always uses the single `STRIPE_PRICE_ID`. Both plans buy the same SKU.
* Also: `user_id` comes from the request body, not the verified JWT — the session's `client_reference_id` can name any account. Dormant (the function hard-refuses non-`sk_test_` keys at `:13`) but this is exactly the wiring that goes live.
* Fix: read the caller from the `Authorization` JWT; map `plan` → a `STRIPE_PRICE_ID_MONTHLY` / `_YEARLY` secret. Effort: 30 min. Auto-fix: no (needs new secrets + Wolf).

**P1-5 · The three email senders in `dev/edge-*` are outside `supabase/functions/` — the workflow never deploys them, and no migration schedules their cron.**
* server: `.github/workflows/supabase-deploy.yml:36–41` deploys `supabase/functions/*` only (today: `create-checkout`, `weekly-digest`). `dev/edge-cert-email`, `dev/edge-streak-nudge`, `dev/edge-weekly-recap` are hand-deploy-only (their headers say `supabase functions deploy … --no-verify-jwt`), and their `cron.schedule` calls exist **only as comments**.
* Consequence: `account.html:575` writes `email_recap` / `email_streak` / `email_certs` to a set of preferences that, as far as the repo is concerned, nothing consumes; and a CI redeploy cannot regress or refresh them because they're invisible to it. `supabase/config.toml` has a `verify_jwt=false` stanza only for `weekly-digest` — the three would need their own.
* Fix: move the three into `supabase/functions/{cert-email,streak-nudge,weekly-recap}/`, add their `[functions.x] verify_jwt = false` stanzas, and ship their `cron.schedule` calls as a migration next to the digest's. Effort: 45 min. Auto-fix: **no** (deploying live senders is a Wolf gate — they mail real users).

**P1-6 · `20260725100000_desk_create_pro.sql` says "NOT APPLIED TO PRODUCTION … committed for review only" but the pipeline applies every migration automatically.**
* server: `20260725100000_desk_create_pro.sql:5–8` vs `.github/workflows/supabase-deploy.yml:4` (`paths: ['supabase/**']`) + `:35` (`supabase db push --include-all`). Commit `dc42b79` pushed this file to `main` and therefore ran the workflow.
* The client agrees it is live (`nav.js:1353 HK_DESK_CREATE_PRO = true`, `account.html:489` and `lb.js:973` translate `PRO_REQUIRED`, `billing.html:118` tells beta players desks need real PRO), so **behaviour is consistent** — the header comment is simply false now and describes a workflow this repo cannot honour. A reader trusting it would mis-model the live gate. There is no "staging" for migrations here: anything in `supabase/migrations/` is production.
* Fix: rewrite the header to "APPLIED r428"; add a WORKFLOW.md §4 line stating that a migration file *is* a deploy, and park review-only SQL in `dev/` instead. Effort: 10 min. Auto-fix: **yes** (comment only).

**P1-7 · Dead / orphaned server objects.**
* `beta_codes` + `curtain_check()` — retiring this week. Other references to retire with it: `index.html:2046` (`PRELAUNCH_LOCK=true`), `:30481–30483`, `:31174–31175`, `:31411–31421`, `hk_beta_ok` localStorage, the `curtain_pass` event name consumed by `admin_events`, and `dev/LAUNCH.md:37`. Nothing else in SQL depends on `beta_codes`.
* `hk_name_ok(text)` is granted to `anon, authenticated` but no client ever calls it (the client mirrors it as `hkNameOk` in themes.js). Revoke the client grant; the triggers call it as owner.
* `my_pro()` is granted to `authenticated` but only ever called server-side (by `my_pro_status`, `create_desk`). Harmless; candidate for revoke.
* `access_codes` / `members` / `redeem_code` — the invite gate is retired (`index.html:30819` comment), yet every session still round-trips `redeem_code('HAGS')`. Retire the call or keep the table; don't keep both.
* `smoke-u` desk fixture (`20260713000000:23`, `20260714000000:20`) — both files say "REMOVE AT LAUNCH".
* `drill_feedback.done` — written by nobody, read by nobody.
* `profiles.team_code` — read by lb.js/nav.js/stats/profile but no UI writes it; grant exists.

**P1-8 · `profiles_id_guard()` is the only trigger function with no pinned `search_path`.**
* server: `20260712800000_profile_grant_fix.sql:14` — `language plpgsql` with no `security definer` and no `set search_path`. It is INVOKER, so the escalation vector of `20260717200000` §1 doesn't apply, but it is the lone exception to the house pattern and would become dangerous if anyone adds `security definer`. Fix: add `set search_path = public`. Effort: 5 min. Auto-fix: yes.

### P2

**P2-1 · `billing.html` queries two objects that don't exist.** `:108` selects `profiles.plan` (no such column), `:177` selects from `invoices` (no such table). Both are wrapped in `try/catch`, but supabase-js **returns** PostgREST errors rather than throwing, so the catch never fires — `data` is null and the UI degrades correctly by accident. Net effect: two guaranteed-failing round-trips and console noise on every billing page load. The code comments (`:171`, `:191`) acknowledge this as scaffold. Fix: guard behind a feature flag or drop until billing is live. Effort: 10 min. Auto-fix: yes.

**P2-2 · `events.name` CHECK requires ≥2 chars; the client sanitizer permits 1.** `nav.js:1147` does `.replace(/[^a-z0-9_]/g,'_').slice(0,40)` with no minimum; `20260713300000:13` is `^[a-z0-9_]{2,40}$`. A one-character event name 400s. No current call site emits one. Fix: pad to 2. Effort: 2 min. Auto-fix: yes.

**P2-3 · `nav.js` pushes `client_state` for anonymous users onto a row that may not exist.** `nav.js:1389` comments "guests sync too — the anon row upgrades WITH them", but it's an `.update()`, and a guest who has never set a handle has no `profiles` row → 0 rows affected, silently. Use an upsert — but note `client_state` is **UPDATE-granted only** (§1.3), so an upsert would 403. Either add `client_state`/`client_state_at` to the INSERT grant or accept the guest gap explicitly. Effort: 15 min. Auto-fix: no (needs a grant decision).

**P2-4 · `desk_pro_grants.requested_by` / `.decided_by` are bare `uuid` with no FK.** Every other user-referencing column cascades from `auth.users`; these two retain the raw uuid of a deleted account. Low-severity PII residue. Fix: add `references auth.users(id) on delete set null`. Effort: 10 min. Auto-fix: yes.

**P2-5 · `team_assignments.created_by` cascades on user delete.** A captain deleting their account wipes the desk's pinned quests even after `leave_desk()` hands the desk to an heir. Should be `on delete set null` with the column made nullable. Effort: 15 min. Auto-fix: yes.

**P2-6 · Privacy page is out of date on deletion and retention.** `privacy.html:85` still says "ask us to delete your account … at hello@hotkey.gg" — self-serve deletion has shipped (`account.html:432`, `delete_account()`). It also carries no retention window, which PIPELINE.md §G10 requires. Effort: 15 min. Auto-fix: yes (copy only).

---

## 4. DATA RETENTION + DELETION

### 4.1 Per-user data by table, and what `delete_account()` reaches

`delete_account()` (`20260716500000:9–17`) is `leave_desk()` then `delete from auth.users where id = auth.uid()`. Everything else is FK cascade.

| table | per-user data | cleaned? | how |
|---|---|---|---|
| profiles | handle, school_tag/domain, flair, theme, client_state, email prefs, featured_ach | ✅ | FK cascade |
| runs | **keystroke trace (behavioural)**, times, challenge | ✅ | FK cascade |
| sessions | scores | ✅ | FK cascade |
| key_stats | per-key usage histogram | ✅ | FK cascade |
| entitlements | pro/source/expiry | ✅ | FK cascade |
| certificates | handle snapshot | ✅ | via profiles cascade |
| drill_feedback | free-text notes | ✅ | FK cascade |
| team_members | membership | ✅ | FK cascade |
| team_applications | applicant note | ✅ | FK cascade |
| reports.reporter | who reported whom | ✅ | FK cascade |
| desk_creations | rate-limit log | ✅ | FK cascade |
| admins | — | ✅ | FK cascade |
| teams.owner_id | ✅ cascade — **`leave_desk()` first** hands off the desk; if `leave_desk` throws, the exception is swallowed (`:14`) and the cascade **deletes the whole desk and every member's membership** | ⚠️ | mitigated, not guaranteed |
| team_assignments.created_by | ✅ cascade — but see P2-5, it takes the desk's quests with it | ⚠️ | over-deletes |
| events.user_id | → SET NULL (intentional, aggregate telemetry survives) | ✅ by design | |
| **desk_pro_grants.requested_by/decided_by** | raw uuid, **no FK** | ❌ | P2-4 |
| **reports.target** | for `kind='handle'`, `target` is the reported user's **uuid** (`lb.js:567`) — survives that user's deletion | ❌ | orphan uuid, no FK |
| members (setup-guide) | membership | ✅ | FK cascade per guide |

**No P0-grade PII remains.** The two gaps (`desk_pro_grants`, `reports.target`) leak
only opaque uuids of deleted accounts, which no longer resolve to a person.

### 4.2 The 7-day detailed-run retention (PIPELINE.md ⚡ G10)

**Decision (PIPELINE.md:117–124):** detailed per-run history kept ~7 days; stats show
"last 5 + expand"; aggregates permanent (PBs, bands, splits, keystroke totals,
achievements, certificates, leaderboard entries); implementation = "prune on write (a
scheduled purge of `runs` rows older than the window, PB-bearing rows exempt)", plus a
privacy-page sentence.

**Implementation: none. Zero of the three parts exists.**
* No purge job — `cron.schedule` appears exactly once across all 46 migrations, for `weekly-digest` (`20260716800000:77`).
* No trace-nulling, no partitioning, no `runs` TTL column.
* No privacy-page sentence (`privacy.html:85`).

**And the decision as written cannot be implemented against the current schema.**
There is no aggregate store: *every* "permanent" surface derives itself from raw `runs`
rows at read time —
`lb.js:158` (boards), `nav.js:504`, `stats.html:269`, `profile.html:303`,
`index.html:30609`/`31596` (PB map), `account.html:526` + `cert.html:140`
(certificate coverage), `issue_certificate` (`20260725000000:28`), `admin_metrics`
(`20260716600000:25–38`), `digest_payloads` (`20260716800000:50–53`).
Purging `runs` older than 7 days would delete the leaderboard, void every certificate's
verification, and reset PBs — the exact r158 "no-rug-pull" law the decision cites.
"PB-bearing rows exempt" doesn't save it either: a PB is currently *defined* as
`min(time_ms)` over the surviving rows, so the exemption is circular.

**What has to exist first:** a materialized aggregate table (`public.run_stats`:
`user_id, challenge, best_ms, best_run_id, best_trace, attempts, keystrokes_total,
first_clean_at`) maintained by an AFTER INSERT trigger on `runs`, plus a
`public.track_completion` (or reuse `certificates`) so `issue_certificate` and
`cert.html` stop scanning raw runs. Only then can a `pg_cron` purge of
`runs where created_at < now() - interval '7 days' and id not in (select best_run_id …)`
be safe. That is a multi-day Segment, not a migration — worth marking G10 as
**decided but blocked on an aggregate layer** in PIPELINE.md so it isn't picked up as a
one-liner.

---

## 5. THE FIVE FIXES I'D MAKE FIRST

1. **P0-1 · Re-issue `issue_certificate` with the real track arrays.** One migration copying `dev/migrate-certificates.sql`'s 16/28/30 lists (keeping the `flagged` guard). Two of the three certificates are dead in prod right now, and the failure surfaces to users as a wrong explanation.
2. **P1-1 · Ship the baseline migration** for `runs`, `profiles`, `members`, `access_codes`, `redeem_code()`. The migration channel is the only DB channel (WORKFLOW §4) and it currently can't build the database it governs.
3. **P1-3 · Fix the outbox drop condition** in `index.html:31869`. Fifteen server-rejected rows silently and permanently stop a player's scores from ever posting again — the precise failure the outbox was built to prevent.
4. **P1-5 · Move `dev/edge-*` into `supabase/functions/`** with their `verify_jwt` stanzas and cron migrations — or delete the three `email_*` toggles from `account.html`. Right now the account page collects consent for mail that the deploy pipeline cannot send.
5. **P1-6 + retention doc-truth · Correct the `desk_create_pro` header and mark G10 blocked.** Both are comment-only edits that stop the next session from acting on a false model of production (a "review-only" migration that is in fact live; a "decided" retention policy whose implementation would destroy the leaderboard).
