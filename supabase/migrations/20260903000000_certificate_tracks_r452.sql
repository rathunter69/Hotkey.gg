-- r452 CERTIFICATE TRACKS — the arrays inside issue_certificate() are re-derived from
-- drills.js (HK_TRACKS = groups: fluency = Foundations+Formatting · formulas = Formulas I +
-- Data & Lookups + Formulas II · modeling = Models I + Models II + Full Builds).
--
-- ROOT CAUSE (contract audit P0-1): the r424 depth-pass retirements landed in drills.js and in
-- dev/migrate-certificates.sql, but only ONE of them (colops) was carried into supabase/migrations/
-- by 20260725000000_retire_colops.sql. The deployed function therefore still demanded seven drills
-- that no longer exist in the catalog — undo, copyover, dress (fluency) and growth, grpfold,
-- wirewalk, hunt (formulas). No player can post a clean run for a drill that has no board, so the
-- fluency and formulas certificates have been UNISSUABLE in production: account.html offers
-- "Claim certificate" off the 16/28 client list and the RPC answers TRACK_INCOMPLETE:3 /
-- TRACK_INCOMPLETE:4, which index.html mistranslates into "some clears never posted". Modeling
-- (30) was already set-correct; its array is only re-ordered here to match catalog order (r447
-- moved cascade to the end of Models II).
--
--   fluency  19 -> 16 (-undo, -copyover, -dress)
--   formulas 32 -> 28 (-growth, -grpfold, -wirewalk, -hunt)
--   modeling 30 -> 30 (unchanged set)
--
-- INVARIANT (enforced in CI by dev/check-invariants.js C14, the r359 drift rule): the three arrays
-- in the NEWEST issue_certificate migration must be set-equal to the HK_TRACKS keys derived from
-- drills.js, and dev/migrate-certificates.sql must mirror them. A catalog edit that retires or adds
-- a drill now fails the gate until this file moves with it.
--
-- DIFF-BEFORE-REPLACE (WORKFLOW §4): this body is 20260725000000_retire_colops.sql verbatim — which
-- is itself 20260724200000 §(d), which is the r359 original — with ONLY the three arrays changed.
-- Every prior check is carried forward: NOT_SIGNED_IN (auth.uid()), GUEST_ACCOUNT (anonymous JWT),
-- BAD_TRACK (unknown track), the clean-run predicate mouse_used = false (the "no guided" half of a
-- clean run has no column on public.runs — index.html recordRun() refuses to post a guided run at
-- all), the r284 flagged-run exclusion coalesce(r.flagged,false) = false, TRACK_INCOMPLETE:<n>, the
-- handle fallback, the on-conflict re-stamp, security definer + set search_path = public, and the
-- revoke-from-public / grant-to-authenticated pair. Idempotent per house rules.
-- Historical runs for the retired keys stay in public.runs untouched (leaderboard history kept).

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
    when 'fluency'  then array['navigation','entrybasics','filldr','pastes','blocksel','rowops','editfix','modeltour','typeset','decimals','center','autofit','ruleoff','ruleaudit','combo','housestyle','gauntlet']
    when 'formulas' then array['margin','foot','anchor','percent','cagr','bridge','sumif','rollup','fxconvert','sort','scrub','filterpass','unhide','lookup','lookup2','recon','drill','series','audit','triage','wrapfix','balcheck','stalelink','cases','tieout','signerr','versionup','balance']
    when 'modeling' then array['wacc','fcfbuild','dcf','comps','txncomps','football','dcfsens','retbridge','accdil','sourcesuses','schedule','intsched','lbo','revolver','waterfall','covtable','liqbridge','wk13','debtsched','cascade','isbuild','bsbuild','cfslink','nwcsched','threestmt','opmodel','dcfbuild','lbobuild','debtblock','dashcover']
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
