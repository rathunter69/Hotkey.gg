-- SELF-SERVE ACCOUNT DELETION (r275) — the privacy policy promised deletion by
-- email; customary is a button. Deleting the auth.users row cascades through
-- profiles, runs, sessions, team_members, key_stats, entitlements, applications
-- (all FK on delete cascade); events keep their rows with user_id set null, so
-- aggregate telemetry survives without the person. If the leaver is a desk
-- captain, leave_desk() runs first so the heir hand-off applies.

create or replace function public.delete_account()
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'NOT_SIGNED_IN'; end if;
  begin
    perform public.leave_desk();   -- heir hand-off / desk dissolve before the cascade
  exception when others then null; -- never let desk cleanup block a deletion request
  end;
  delete from auth.users where id = auth.uid();
end $$;
grant execute on function public.delete_account() to authenticated;
