-- SECURITY REGRESSION FIX (2026-07-24) — live-DB-verified audit repairs.
--
-- ROOT CAUSE (twice): `create or replace function` is LAST-WINS. Two later
-- migrations redefined a function to add one feature and silently dropped a
-- protection an earlier migration had added to the same body:
--   * desk_name_guard: 20260716700000_set_school_tag.sql added the hk_name_ok
--     leetspeak gate but DROPPED the protected-firm-names layer from
--     20260712300000_desk_protected_names.sql (goldmansachs…liontree collapsed
--     substrings + the \y(gs|ms|pjt|rssg…)\y acronym regex, plus the r118 slur
--     substring list). Verified live: prod had NO protected-name checks.
--   * apply_to_desk: 20260717700000_desk_recruiting.sql added
--     DESK_NOT_RECRUITING but DROPPED the FULL_ACCOUNT_REQUIRED is_anonymous
--     guard from 20260716200000_apply_full_account.sql. Verified live: anon
--     sessions could file applications.
-- This file restores each function as the UNION of every generation's checks.
-- HOUSE RULE going forward: before `create or replace` on an existing
-- function, diff against the newest prior definition in migrations/ and carry
-- every check forward — never rewrite from an older copy.
--
-- Also here:
--   * profiles column UPDATE grants the client already writes but prod never
--     granted (writes were silently 403ing): theme (20260717600000),
--     client_state/client_state_at (r358), email_recap/email_streak/email_certs
--     (r360/r370).
--   * issue_certificate: flagged (shadow-banned) runs no longer count toward
--     certificate issuance.
-- Idempotent per house rules.

-- ============================================================================
-- (a) desk_name_guard — union of r118 (protected names) + r276 (leet fold)
-- ============================================================================

create or replace function public.desk_name_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  -- r118 banned list (reserved words + slurs), substring-matched on the raw,
  -- digit-STRIPPED (r118 'cleaned') and leet-MAPPED (r276 'folded') forms —
  -- both folds kept because they catch different disguises.
  banned text[] := array[
    'admin','hotkey','moderator','anthropic','staff','official','support',
    'nigger','nigga','faggot','kike','spic','chink','wetback','tranny','coon',
    'beaner','gook','raghead','retard','hitler','nazi','kkk','rapist','pedo'
  ];
  -- r118 long firm names: matched on the punctuation/space-collapsed form (substring-safe)
  protected_collapsed text[] := array[
    'goldmansachs','goldman','morganstanley','jpmorgan','bankofamerica','merrilllynch',
    'evercore','lazard','moelis','centerview','qatalyst','jefferies','blackstone',
    'apollo','carlyle','barclays','citigroup','citibank','creditsuisse','rothschild',
    'houlihanlokey','houlihan','perellaweinberg','perella','guggenheim','greenhill',
    'wellsfargo','deutschebank','nomura','mizuho','macquarie','pipersandler',
    'raymondjames','williamblair','harrisWilliams','solomonpartners','ducerapartners',
    'liontreeadvisors','liontree','allenandcompany'
  ];
  b text; cleaned text; folded text; collapsed text;
begin
  cleaned   := lower(regexp_replace(coalesce(new.name,''), '[_0134578 ]', '', 'g'));
  folded    := lower(regexp_replace(translate(coalesce(new.name,''), '@0134578', 'aoieastb'), '[^a-z]', '', 'g'));
  collapsed := lower(regexp_replace(coalesce(new.name,''), '[^a-zA-Z]', '', 'g'));
  foreach b in array banned loop
    if lower(coalesce(new.name,'')) like '%'||b||'%'
       or cleaned like '%'||b||'%'
       or folded  like '%'||b||'%' then
      raise exception 'DESK_NAME_RESERVED';
    end if;
  end loop;
  -- r276 shared gate (leet MAP + word-boundary list; mirrors themes.js hkNameOk)
  if not public.hk_name_ok(new.name) then raise exception 'DESK_NAME_RESERVED'; end if;
  -- r118 protected firm names — creation fails until verified-desk claiming (dev/TRUST_SAFETY.md)
  foreach b in array protected_collapsed loop
    if collapsed like '%'||lower(b)||'%' then
      raise exception 'DESK_NAME_PROTECTED';
    end if;
  end loop;
  -- short acronyms (GS, MS, PJT, RSSG…): standalone-token match only, so 'Kings of
  -- the Grid' passes while 'GS TMT 2026' is reserved.
  if lower(coalesce(new.name,'')) ~* '\y(gs|ms|jpm|jpmc|pjt|rssg|kkr|ubs|rbc|citi|baml|bofa|pwp|db|cs|cvp|evr|hl|gugg|msco)\y' then
    raise exception 'DESK_NAME_PROTECTED';
  end if;
  return new;
end $$;
-- trigger already exists (r110) and points at this function name; body swap is enough

-- ============================================================================
-- (b) apply_to_desk — union of r271 (FULL_ACCOUNT_REQUIRED) + r293 (recruiting)
-- ============================================================================

create or replace function public.apply_to_desk(p_team uuid, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_team public.teams;
begin
  if auth.uid() is null then raise exception 'NOT_SIGNED_IN'; end if;
  -- r271: anonymous "save progress later" sessions hold a real auth.uid() —
  -- staffers should only see applicants they can actually contact. The
  -- is_anonymous claim is server-set in the JWT (not user-editable metadata).
  if coalesce((auth.jwt()->>'is_anonymous')::boolean, false) then
    raise exception 'FULL_ACCOUNT_REQUIRED';
  end if;
  if exists(select 1 from public.team_members where user_id = auth.uid()) then
    raise exception 'ALREADY_ON_DESK';
  end if;
  select * into v_team from public.teams t where t.id = p_team;
  if not found then raise exception 'DESK_NOT_FOUND'; end if;
  if v_team.is_private then raise exception 'DESK_PRIVATE'; end if;
  if not v_team.recruiting then raise exception 'DESK_NOT_RECRUITING'; end if;
  if (select count(*) from public.team_applications where user_id = auth.uid()) >= 5 then
    raise exception 'APPLY_RATE_LIMIT';
  end if;
  insert into public.team_applications (team_id, user_id, note)
    values (p_team, auth.uid(), nullif(trim(coalesce(p_note,'')), ''))
    on conflict (team_id, user_id) do nothing;
end $$;

-- ============================================================================
-- (c) profiles UPDATE grants the client already relies on (writes 403'd in
-- prod because column grants are a whitelist and these were never added).
-- All writes are owner-only via the existing profiles UPDATE RLS policy.
-- ============================================================================

grant update (theme) on public.profiles to authenticated;                         -- account.html/nav.js theme sync (r293)
grant update (client_state, client_state_at) on public.profiles to authenticated; -- nav.js cross-device state (r358)
grant update (email_recap, email_streak, email_certs) on public.profiles to authenticated; -- account.html email toggles (r360/r370)

-- ============================================================================
-- (d) issue_certificate — flagged (shadow-banned) runs no longer satisfy a
-- track: same body as the r359 original except the runs probe now requires
-- coalesce(r.flagged,false) = false.
-- ============================================================================

create or replace function public.issue_certificate(p_track text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_keys text[];
  v_missing int;
  v_handle text;
  v_id uuid;
begin
  if v_uid is null then raise exception 'NOT_SIGNED_IN'; end if;
  if coalesce((auth.jwt()->>'is_anonymous')::boolean, false) then raise exception 'GUEST_ACCOUNT'; end if;
  v_keys := case p_track
    when 'fluency'  then array['navigation','modeltour','filldr','pastes','blocksel','rowops','colops','editfix','undo','copyover','typeset','decimals','center','autofit','ruleoff','ruleaudit','combo','dress','housestyle','gauntlet']
    when 'formulas' then array['margin','foot','anchor','percent','growth','cagr','bridge','sumif','rollup','fxconvert','cases','sort','scrub','grpfold','filterpass','unhide','lookup','lookup2','recon','drill','series','audit','triage','wrapfix','balcheck','stalelink','wirewalk','tieout','hunt','signerr','versionup','balance']
    when 'modeling' then array['wacc','fcfbuild','dcf','comps','txncomps','football','dcfsens','retbridge','accdil','sourcesuses','schedule','intsched','lbo','revolver','waterfall','covtable','liqbridge','wk13','cascade','debtsched','isbuild','bsbuild','cfslink','nwcsched','threestmt','opmodel','dcfbuild','lbobuild','debtblock','dashcover']
    else null end;
  if v_keys is null then raise exception 'BAD_TRACK'; end if;
  select count(*) into v_missing from unnest(v_keys) k
    where not exists (select 1 from public.runs r
      where r.user_id = v_uid and r.challenge = k and r.mouse_used = false
        and coalesce(r.flagged, false) = false);   -- shadow-flagged runs don't count (r284 integrity layer)
  if v_missing > 0 then
    raise exception 'TRACK_INCOMPLETE:%', v_missing;
  end if;
  select handle into v_handle from public.profiles where id = v_uid;
  insert into public.certificates (user_id, track, handle)
    values (v_uid, p_track, coalesce(v_handle, 'hotkey player'))
    on conflict (user_id, track) do update set handle = excluded.handle
    returning id into v_id;
  return v_id;
end $$;
revoke all on function public.issue_certificate(text) from public;
grant execute on function public.issue_certificate(text) to authenticated;
