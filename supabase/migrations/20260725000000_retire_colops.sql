-- r424 (DEPTH_PASS D17, playtest round 1): colops RETIRED — rowops absorbed it.
-- The fluency certificate track must stop requiring a clean colops run, or the
-- track becomes uncompletable for anyone who hasn't already cleared the retired
-- drill (its key left menuOrder, so it is unreachable client-side). Same body as
-- 20260724200000 §(d) — the r284 flagged-run guard stays — minus 'colops' in the
-- fluency array. Mirrors dev/migrate-certificates.sql + HK_TRACKS (r359 drift rule).
-- Historical colops runs stay in public.runs untouched (leaderboard history kept;
-- the board simply no longer appears in pickers — no data migration).

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
    when 'fluency'  then array['navigation','modeltour','filldr','pastes','blocksel','rowops','editfix','undo','copyover','typeset','decimals','center','autofit','ruleoff','ruleaudit','combo','dress','housestyle','gauntlet']
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
