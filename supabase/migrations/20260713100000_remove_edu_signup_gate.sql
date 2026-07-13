-- REMOVE .EDU SIGNUP GATE (r133) — Wolf's call: incentivize, don't gate.
-- Live smoke (r131) found signup rejects non-.edu emails with "Only .edu email
-- addresses may register for the beta." — a dashboard-era artifact that is NOT
-- in the repo and locks out the core professional audience. The signup card
-- now carries the carrot instead (use your .edu -> auto-match to your school's
-- desk + student perks later); school tags stay server-derived either way.
-- This drops any trigger on auth.users whose function carries the gate's error
-- text (name unknown — it was created by hand). If signup STILL blocks
-- non-.edu after this deploys, the gate is a Supabase AUTH HOOK (config, not
-- schema): dashboard -> Authentication -> Hooks -> remove "before user
-- created". Idempotent: the scan simply finds nothing on re-run.

do $$
declare r record;
begin
  for r in
    select t.tgname
    from pg_trigger t
    join pg_proc p on p.oid = t.tgfoid
    where t.tgrelid = 'auth.users'::regclass
      and not t.tgisinternal
      and pg_get_functiondef(p.oid) ilike '%register for the beta%'
  loop
    execute format('drop trigger if exists %I on auth.users', r.tgname);
    raise notice 'dropped .edu-gate trigger: %', r.tgname;
  end loop;
end $$;
