-- r359 CERTIFICATES MIGRATION — run once in the Supabase SQL editor (after migrate-client-state).
-- Three long tracks, one verifiable certificate each. Issuance goes ONLY through the
-- issue_certificate() RPC below, which re-checks the caller's recorded runs server-side —
-- a client can't forge a cert, and the public cert page re-verifies against runs anyway.
-- If drills.js chapters ever change, regenerate the arrays below to match HK_TRACKS.

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  track text not null,
  handle text,
  issued_at timestamptz not null default now(),
  unique (user_id, track)
);
alter table public.certificates enable row level security;
drop policy if exists certs_public_read on public.certificates;
create policy certs_public_read on public.certificates for select using (true);
-- no insert/update/delete policies on purpose: writes only via the RPC (security definer).

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
      where r.user_id = v_uid and r.challenge = k and r.mouse_used = false);
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
