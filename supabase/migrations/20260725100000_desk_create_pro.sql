-- r426 DESK CREATION IS A PRO FEATURE (Wolf, dev/ROUND2_FEEDBACK.md §4e:
-- "Desk CREATION must be a PRO feature, locked to free users. Needs a server-side
-- guard (RPC/RLS), not just UI hiding.")
--
-- APPLIED TO PRODUCTION on merge (commit dc42b79, PR #242). Corrected r452 (contract
-- audit P1-6) — comment only, the SQL below is untouched.
--
-- The header used to read "NOT APPLIED TO PRODUCTION … committed for review only". That
-- was never possible in this pipeline: .github/workflows/supabase-deploy.yml triggers on
-- any push to main touching supabase/** and runs `supabase db push --include-all`, so
-- committing a migration IS deploying it. There is no review-only lane in
-- supabase/migrations/ — a change that must not ship yet has to stay out of this
-- directory (park it under dev/ and land it as a migration when the go arrives).
-- Consequence: the BETA INTERACTION note below describes LIVE behavior, not a forecast,
-- and the Wolf question it raises is now a rollback decision rather than a go/no-go.
--
-- ============================================================================
-- DIFF-BEFORE-REPLACE (WORKFLOW §4, the r417 regression class)
-- ============================================================================
-- `create or replace function` is LAST-WINS: a redefinition that forgets an earlier
-- generation's check silently deletes that protection (this bit us twice — see
-- 20260724200000_security_regression_fix.sql). The newest prior definition of
-- create_desk() is 20260716300000_desk_full_account.sql (verified: it is the ONLY
-- create_desk definition after 20260712000000_desks.sql — grep -i create_desk
-- supabase/migrations/ returns exactly those two files plus the original grant).
-- Every check in that definition is carried forward VERBATIM below:
--
--   carried  | NOT_SIGNED_IN            | auth.uid() is null                (r119, base)
--   carried  | FULL_ACCOUNT_REQUIRED    | is_anonymous JWT claim            (r272, 20260716300000)
--   carried  | ALREADY_ON_DESK          | existing team_members row         (r119, base)
--   carried  | slug derivation          | lower/regexp/trim '-'             (r119, base)
--   carried  | insert shape + captain   | teams row then team_members row   (r119, base)
--   carried  | return shape             | id, name, slug, invite_code       (r119, base)
--   NEW      | PRO_REQUIRED             | public.my_pro()                   (r426, this file)
--
-- Checks that ride TRIGGERS on public.teams and are therefore untouched by a body
-- swap — listed so nobody "helpfully" re-adds them inline and drifts a second copy:
--   * desk_name_guard()  — reserved words, slur list, protected firm names, the leet
--     fold + hk_name_ok() gate (20260724200000, the union restore). BEFORE INSERT.
--   * desk_rate_guard()  — 1 desk per user per day, logged in desk_creations so
--     create -> leave -> create can't bypass it (20260712900000). BEFORE INSERT.
--   * teams.invite_code / seats / is_private defaults — schema-side (20260712000000).
-- The PRO check is placed BEFORE the insert so a free user's attempt never consumes
-- the daily rate-limit allowance (same reasoning as the r132 rate-limit log note).
--
-- Definer + pinned search_path preserved (SECURITY DEFINER, SET search_path = public).
-- Idempotent. Grants restated so a fresh environment matches prod.
--
-- ============================================================================
-- BETA INTERACTION — how my_pro() and the beta window actually relate (the finding)
-- ============================================================================
-- 1. my_pro() (newest definition: 20260717500000_desk_pro_seats.sql, itself a
--    refinement of 20260717400000_edu_trial.sql) is ENTITLEMENT-ONLY. It is true when
--    EITHER an unexpired entitlements.pro row exists for auth.uid() (paid, or the
--    7-day .edu trial from start_pro_trial()), OR the caller sits on a desk holding an
--    active desk_pro_grant within its seat cap.
-- 2. It has NO knowledge of the beta window. HOTKEY_PRO.beta = true lives in drills.js
--    and is a CLIENT flag; only the trainer honors it (index.html isPro() is
--    `BETA_MODE || _pro`). No SQL function reads it, and nothing writes entitlements
--    rows for beta players.
-- 3. THEREFORE this gate does not inherit the beta free-for-all. Since it went live,
--    every beta account without a paid entitlement or a live .edu trial has been
--    blocked from creating a desk — which is precisely Wolf's requirement, but it
--    contradicts HOTKEY_PRO.betaNote ("Beta: PRO perks are free for everyone").
--    Wolf decides which promise wins; until then the gate is the one in force.
-- 4. Corollary: the desk-grant branch of my_pro() can NEVER authorize a create. You
--    must already be a team_members row to inherit a desk grant, and the
--    ALREADY_ON_DESK check rejects exactly that caller. In practice this gate reduces
--    to "own paid entitlement or unexpired .edu trial" — worth knowing before pricing
--    a desk-creation upsell off it.
-- 5. If Wolf wants the gate live DURING beta with PRO otherwise free, the clean lever
--    is a server-side beta switch (e.g. a public.app_flags row read here) rather than
--    teaching my_pro() about beta — my_pro() is consumed by every PRO surface and
--    widening it would hand out the whole PRO catalog.

create or replace function public.create_desk(p_name text, p_private boolean default false)
returns table(id uuid, name text, slug text, invite_code text)
language plpgsql
security definer
set search_path = public
as $function$
declare v_slug text; v_row public.teams;
begin
  -- carried: base (r119)
  if auth.uid() is null then raise exception 'NOT_SIGNED_IN'; end if;
  -- carried: r272 / 20260716300000 — anonymous "save progress later" sessions hold a
  -- real auth.uid(), so desks must demand a full account. The is_anonymous claim is
  -- server-set in the JWT (not user-editable metadata).
  if coalesce((auth.jwt()->>'is_anonymous')::boolean, false) then
    raise exception 'FULL_ACCOUNT_REQUIRED';
  end if;
  -- NEW r426 (Wolf, ROUND2_FEEDBACK §4e): founding a desk is PRO. Checked BEFORE the
  -- insert so a rejected free attempt never burns the 1-per-day desk_rate_guard
  -- allowance. JOINING stays free — join_desk() is deliberately untouched.
  if not public.my_pro() then raise exception 'PRO_REQUIRED'; end if;
  -- carried: base (r119)
  if exists(select 1 from public.team_members where user_id = auth.uid()) then
    raise exception 'ALREADY_ON_DESK';
  end if;
  -- carried: base (r119) — slug derivation
  v_slug := trim(both '-' from regexp_replace(lower(trim(p_name)), '[^a-z0-9]+', '-', 'g'));
  -- carried: base (r119) — the insert fires desk_name_guard (reserved/slur/protected
  -- firm names) and desk_rate_guard (1/day, logged) as BEFORE INSERT triggers.
  insert into public.teams (name, slug, owner_id, is_private)
    values (trim(p_name), v_slug, auth.uid(), coalesce(p_private, false))
    returning * into v_row;
  insert into public.team_members (team_id, user_id, role) values (v_row.id, auth.uid(), 'captain');
  return query select v_row.id, v_row.name, v_row.slug, v_row.invite_code;
end $function$;

revoke all on function public.create_desk(text, boolean) from public;
grant execute on function public.create_desk(text, boolean) to authenticated;
