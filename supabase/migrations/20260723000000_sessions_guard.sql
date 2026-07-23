-- A3 (r414-review Segment A) SESSION LEADERBOARD INTEGRITY. The `sessions` table
-- (marathon + rapid-fire boards) was the one client-reported score path with NO
-- server referee — a signed-in user could insert {score: 999999} straight past
-- the trivially-bypassed client checks. This gives sessions the same treatment
-- `runs` already has (20260717100000_run_integrity.sql):
--   1. HARD REJECT the physically impossible (bad duration, absurd values,
--      >30 keys/sec) and rate-limit the firehose.
--   2. SHADOW-FLAG the merely implausible (superhuman pace, score that can't come
--      from the claimed duration, misses > keystrokes) — flagged rows stay visible
--      to their OWNER but vanish from everyone else's boards via RLS.
--   3. ADMIN QUEUE — admin_flagged_sessions() / admin_session_verdict().
-- Idempotent per house rules.

alter table public.sessions add column if not exists flagged boolean not null default false;
alter table public.sessions add column if not exists flag_reason text;
create index if not exists sessions_user_recent_idx on public.sessions (user_id, created_at desc);
create index if not exists sessions_flagged_idx on public.sessions (created_at desc) where flagged;

create or replace function public.sessions_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  n_recent int;
  n_day int;
  kps numeric;
  sps numeric;
begin
  -- ---- layer 1: hard rejects ----------------------------------------------
  if new.duration_sec is null or new.duration_sec < 5 or new.duration_sec > 7200 then
    raise exception 'SESSION_REJECTED';               -- a session is seconds..2h
  end if;
  if new.score is null or new.score < 0 or new.score > 1000000 then
    raise exception 'SESSION_REJECTED';
  end if;
  if new.keystrokes is null or new.keystrokes < 0 or new.keystrokes > 500000 then
    raise exception 'SESSION_REJECTED';
  end if;
  if new.misses is null or new.misses < 0 then
    raise exception 'SESSION_REJECTED';
  end if;
  kps := new.keystrokes::numeric / greatest(new.duration_sec, 1)::numeric;
  if kps > 30 then
    raise exception 'SESSION_REJECTED';               -- no human sustains >30 keys/sec
  end if;

  -- rate limits: sessions end every few seconds at the very fastest
  select count(*) into n_recent from public.sessions
    where user_id = new.user_id and created_at > now() - interval '60 seconds';
  if n_recent >= 10 then
    raise exception 'RATE_LIMITED';
  end if;
  select count(*) into n_day from public.sessions
    where user_id = new.user_id and created_at > now() - interval '24 hours';
  if n_day >= 500 then
    raise exception 'RATE_LIMITED';
  end if;

  -- ---- layer 2: shadow flags ----------------------------------------------
  new.flagged := false; new.flag_reason := null;      -- never client-settable
  sps := new.score::numeric / greatest(new.duration_sec, 1)::numeric;
  if kps > 15 then
    new.flagged := true; new.flag_reason := 'pace';           -- superhuman chord rate
  elsif sps > 5 then
    new.flagged := true; new.flag_reason := 'score_rate';     -- score can't come from that duration (the {score:999999} attack)
  elsif new.keystrokes > 0 and new.misses > new.keystrokes then
    new.flagged := true; new.flag_reason := 'miss_gt_keys';   -- more misses than keystrokes is impossible
  elsif new.keystrokes = 0 and new.score > 0 and new.duration_sec > 3 then
    new.flagged := true; new.flag_reason := 'no_keys';        -- a real session logs keystrokes
  end if;

  return new;
end;
$$;

drop trigger if exists sessions_guard_trg on public.sessions;
create trigger sessions_guard_trg before insert on public.sessions
  for each row execute function public.sessions_guard();

-- flagged sessions disappear from everyone but their owner (no UPDATE/DELETE policy
-- exists on sessions, so a flag can't be washed off client-side)
drop policy if exists "sessions_select_all" on public.sessions;
drop policy if exists "sessions readable (clean or own)" on public.sessions;
create policy "sessions readable (clean or own)" on public.sessions
  for select using ((not flagged) or user_id = auth.uid());

-- ---- layer 3: the admin queue ----------------------------------------------
create or replace function public.admin_flagged_sessions()
returns table (id bigint, user_id uuid, handle text, mode text, duration_sec int,
               score int, keystrokes int, misses int, flag_reason text, created_at timestamptz)
language sql security definer set search_path = public
as $$
  select s.id, s.user_id, coalesce(p.handle, '(no handle)'), s.mode, s.duration_sec,
         s.score, s.keystrokes, s.misses, s.flag_reason, s.created_at
  from public.sessions s
  left join public.profiles p on p.id = s.user_id
  where s.flagged and public.is_admin()
  order by s.created_at desc
  limit 200
$$;
grant execute on function public.admin_flagged_sessions() to authenticated;

create or replace function public.admin_session_verdict(p_id bigint, p_action text)
returns text
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  if p_action = 'clear' then
    update public.sessions set flagged = false, flag_reason = null where id = p_id;
    return 'cleared';
  elsif p_action = 'delete' then
    delete from public.sessions where id = p_id;
    return 'deleted';
  end if;
  raise exception 'BAD_ACTION';
end;
$$;
grant execute on function public.admin_session_verdict(bigint, text) to authenticated;

-- Review: sb.rpc('admin_flagged_sessions'); verdicts: sb.rpc('admin_session_verdict',{p_id, p_action:'clear'|'delete'})
