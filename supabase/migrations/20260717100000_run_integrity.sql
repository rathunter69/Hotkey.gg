-- r284 (#35) LEADERBOARD INTEGRITY — runs are client-reported, so the server
-- now referees. Three layers:
--   1. HARD REJECT the physically absurd (negative/huge values, >30 keys/sec,
--      malformed challenge keys) and rate-limit the firehose.
--   2. SHADOW-FLAG the merely implausible (superhuman pace, trace that doesn't
--      match the claimed run). Flagged runs stay visible to their OWNER (they
--      can't tell they're flagged) but vanish from everyone else's boards via
--      RLS — the classic shadow treatment, no angry cheater feedback loop.
--   3. ADMIN QUEUE — admin_flagged_runs() to review, admin_run_verdict() to
--      clear or delete. Wired into admin.html.
-- Idempotent per house rules.

alter table public.runs add column if not exists flagged boolean not null default false;
alter table public.runs add column if not exists flag_reason text;
create index if not exists runs_user_recent_idx on public.runs (user_id, created_at desc);
create index if not exists runs_flagged_idx on public.runs (created_at desc) where flagged;

create or replace function public.runs_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  n_recent int;
  n_day int;
  kps numeric;
  tr_n int;
  tr_last numeric;
begin
  -- ---- layer 1: hard rejects ----------------------------------------------
  if new.time_ms is null or new.time_ms < 300 or new.time_ms > 3600000 then
    raise exception 'RUN_REJECTED';
  end if;
  if new.keystrokes is null or new.keystrokes < 1 or new.keystrokes > 5000 then
    raise exception 'RUN_REJECTED';
  end if;
  if new.optimal is not null and (new.optimal < 0 or new.optimal > 1000) then
    raise exception 'RUN_REJECTED';
  end if;
  -- scoreKey() emits: drill keys, daily keys, 'wk-YYYY-WW-drill', challenge keys
  if new.challenge is null or new.challenge !~ '^[A-Za-z0-9_@:.\-]{1,64}$' then
    raise exception 'RUN_REJECTED';
  end if;
  kps := new.keystrokes::numeric / greatest(new.time_ms, 1)::numeric * 1000;
  if kps > 30 then
    raise exception 'RUN_REJECTED';
  end if;

  -- rate limits: a human posts a run every few seconds at best
  select count(*) into n_recent from public.runs
    where user_id = new.user_id and created_at > now() - interval '60 seconds';
  if n_recent >= 20 then
    raise exception 'RATE_LIMITED';
  end if;
  select count(*) into n_day from public.runs
    where user_id = new.user_id and created_at > now() - interval '24 hours';
  if n_day >= 2000 then
    raise exception 'RATE_LIMITED';
  end if;

  -- ---- layer 2: shadow flags ----------------------------------------------
  new.flagged := false; new.flag_reason := null;   -- never client-settable

  if kps > 15 then
    new.flagged := true; new.flag_reason := 'pace';           -- superhuman sustained chord rate
  elsif new.optimal is not null and new.optimal > 0
        and new.keystrokes < new.optimal - 3
        and new.keystrokes::numeric < new.optimal * 0.7 then
    new.flagged := true; new.flag_reason := 'underkeys';      -- far fewer keys than the optimal path
  else
    begin
      if new.trace is not null and jsonb_typeof(new.trace) = 'array' then
        tr_n := jsonb_array_length(new.trace);
        if tr_n > new.keystrokes + 10 then
          new.flagged := true; new.flag_reason := 'trace_n';  -- more trace than keystrokes
        elsif new.keystrokes > 5 and tr_n < least(new.keystrokes, 400) / 2 then
          new.flagged := true; new.flag_reason := 'trace_thin'; -- real clients send the full log
        elsif tr_n >= 2 then
          tr_last := coalesce((new.trace -> -1 ->> 't')::numeric, 0);
          if tr_last > new.time_ms * 1.25 + 1000 then
            new.flagged := true; new.flag_reason := 'trace_t'; -- trace outlives the claimed time
          end if;
        end if;
      elsif new.keystrokes > 5 then
        new.flagged := true; new.flag_reason := 'no_trace';    -- the client always sends one
      end if;
    exception when others then
      new.flagged := true; new.flag_reason := 'trace_bad';     -- unparseable trace is its own tell
    end;
  end if;

  return new;
end;
$$;

drop trigger if exists runs_guard_trg on public.runs;
create trigger runs_guard_trg before insert on public.runs
  for each row execute function public.runs_guard();

-- flagged runs disappear from everyone but their owner (and updates stay closed:
-- there has never been an UPDATE policy on runs, so flags can't be washed off)
drop policy if exists "runs readable by all" on public.runs;
drop policy if exists "runs readable (clean or own)" on public.runs;
create policy "runs readable (clean or own)" on public.runs
  for select using ((not flagged) or user_id = auth.uid());

-- ---- layer 3: the admin queue ----------------------------------------------
create or replace function public.admin_flagged_runs()
returns table (id uuid, user_id uuid, handle text, challenge text, time_ms int,
               keystrokes int, optimal int, flag_reason text, created_at timestamptz)
language sql security definer set search_path = public
as $$
  select r.id, r.user_id, coalesce(p.handle, '(no handle)'), r.challenge, r.time_ms,
         r.keystrokes, r.optimal, r.flag_reason, r.created_at
  from public.runs r
  left join public.profiles p on p.id = r.user_id
  where r.flagged and public.is_admin()
  order by r.created_at desc
  limit 200
$$;
grant execute on function public.admin_flagged_runs() to authenticated;

create or replace function public.admin_run_verdict(p_id uuid, p_action text)
returns text
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  if p_action = 'clear' then
    update public.runs set flagged = false, flag_reason = null where id = p_id;
    return 'cleared';
  elsif p_action = 'delete' then
    delete from public.runs where id = p_id;
    return 'deleted';
  end if;
  raise exception 'BAD_ACTION';
end;
$$;
grant execute on function public.admin_run_verdict(uuid, text) to authenticated;

-- To review: sb.rpc('admin_flagged_runs'); verdicts: sb.rpc('admin_run_verdict',{p_id, p_action:'clear'|'delete'})
