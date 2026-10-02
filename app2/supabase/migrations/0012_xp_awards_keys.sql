-- 0012_xp_awards_keys.sql — the XP R7 kept on the device only, recorded on the account, and the
-- learner's key states (M57). Forward-only; written in run R8 and NOT applied until Wolf says so
-- in the project chat.
--
--   (a) xp_awards     one row per award that is not a run: a daily or weekly quest done, the bonus
--                     for all three in a period, and the clean-lesson bonus (+10 the first time a
--                     lesson is finished with no mouse and no help; screenplay 6.10). The client
--                     never names an amount: the server sets it from the kind. Idempotent per
--                     (user, kind, ref), so an outbox retry never pays twice. Insert-only through
--                     rpc_record_xp_award; owner-only select.
--   (b) learner_keys  one row per key the learner has practiced (pressed in a lesson, drill, the
--                     Daily or a rapid-fire round) and when a key went under par (a clean Drill it
--                     rep inside its par). Written through rpc_note_keys; read back by rpc_my_keys.
--   (c) export        rpc_export_my_data grows both tables and the certificate.
--
-- What the server can check, it checks:
--   quests       at most three per period, the period now or recent (eight days back, a day
--                ahead for clock skew), a weekly period starts on a Monday; the bonus only once
--                all three of its period's quests are recorded. Which quests were drawn and
--                whether the run met them is decided on the device (app/quests.js): the caps
--                bound what a forged call can earn to 125 XP a day and 375 a week.
--   lesson-clean the caller has a lesson attempt for that lesson with no help and no mouse
--                (public.attempts); with no attempt yet the award waits ('pending', the client
--                retries once the lesson outbox has drained); with only unclean attempts it is
--                refused.
-- An award adds to profiles.xp and recomputes profiles.level with level_for_xp, as apply_attempt
-- does, so the account's XP and the device's agree on what was paid.

-- ---------------------------------------------------------------- (a) xp_awards
create table public.xp_awards (
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('quest-daily', 'quest-weekly', 'bonus-daily', 'bonus-weekly', 'lesson-clean')),
  ref text not null check (ref ~ '^[a-z0-9:-]{1,80}$'),
  period date,                                    -- the day, or the Monday of the week; null for a lesson
  xp integer not null check (xp > 0 and xp <= 1000),
  client_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (user_id, kind, ref)
);
create index xp_awards_user_period on public.xp_awards (user_id, kind, period);

alter table public.xp_awards enable row level security;
revoke all on table public.xp_awards from anon, authenticated;
grant select on table public.xp_awards to authenticated;
create policy xp_awards_owner_select on public.xp_awards for select to authenticated
  using (user_id = (select auth.uid()));

-- The amounts, in one place (screenplay 6.10; app2/content/quests.js QUEST_XP, app2/app/xp.js lessonClean).
create or replace function public.xp_award_amount(p_kind text)
returns integer
language sql
immutable
security definer
set search_path = ''
as $$
  select case p_kind
    when 'quest-daily' then 25
    when 'quest-weekly' then 75
    when 'bonus-daily' then 50
    when 'bonus-weekly' then 150
    when 'lesson-clean' then 10
    else null end
$$;
revoke execute on function public.xp_award_amount(text) from public, anon, authenticated;

-- ---------------------------------------------------------------- rpc_record_xp_award
-- p_ref by kind:
--   quest-daily   'd2026-10-02:<quest id>'     quest-weekly  'w2026-09-28:<quest id>'
--   bonus-daily   'd2026-10-02'                bonus-weekly  'w2026-09-28'
--   lesson-clean  '<lesson id>'
-- Returns 'awarded', 'duplicate' (already recorded: an outbox retry), 'pending' (a clean-lesson
-- award whose lesson attempt has not arrived yet) or 'refused' (over a cap, too old, or not
-- clean). A malformed call raises 'bad award'.
create or replace function public.rpc_record_xp_award(p_kind text, p_ref text, p_client_at timestamptz default null)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid;
  amount integer;
  per date;
  key text;
  today date := (now() at time zone 'utc')::date;
  n integer;
begin
  me := (select auth.uid());
  if me is null then raise exception 'not signed in'; end if;
  amount := public.xp_award_amount(p_kind);
  if amount is null or p_ref is null then raise exception 'bad award'; end if;

  if p_kind in ('quest-daily', 'quest-weekly', 'bonus-daily', 'bonus-weekly') then
    if p_kind in ('quest-daily', 'quest-weekly') then
      if p_ref !~ '^[dw][0-9]{4}-[0-9]{2}-[0-9]{2}:[a-z0-9-]{1,48}$' then raise exception 'bad award'; end if;
    else
      if p_ref !~ '^[dw][0-9]{4}-[0-9]{2}-[0-9]{2}$' then raise exception 'bad award'; end if;
    end if;
    if (left(p_ref, 1) = 'w') <> (p_kind in ('quest-weekly', 'bonus-weekly')) then raise exception 'bad award'; end if;
    key := split_part(p_ref, ':', 1);
    begin
      per := substr(key, 2, 10)::date;
    exception when others then
      raise exception 'bad award';
    end;
    if left(key, 1) = 'w' and extract(isodow from per) <> 1 then raise exception 'bad award'; end if;
    -- now or recent: the device settles a period while it is open, and its outbox may lag a little
    if per > today + 1 or per < today - 8 then return 'refused'; end if;
  elsif p_kind = 'lesson-clean' then
    if p_ref !~ '^[a-z0-9-]{1,64}$' then raise exception 'bad award'; end if;
    per := null;
  end if;

  if exists (select 1 from public.xp_awards where user_id = me and kind = p_kind and ref = p_ref) then
    return 'duplicate';
  end if;

  -- one award at a time per account, so two racing calls cannot both slip under a cap
  perform 1 from public.profiles where id = me for update;

  if p_kind in ('quest-daily', 'quest-weekly') then
    select count(*) into n from public.xp_awards where user_id = me and kind = p_kind and period = per;
    if n >= 3 then return 'refused'; end if;
  elsif p_kind in ('bonus-daily', 'bonus-weekly') then
    select count(*) into n from public.xp_awards
      where user_id = me and kind = case p_kind when 'bonus-daily' then 'quest-daily' else 'quest-weekly' end and period = per;
    if n < 3 then return 'refused'; end if;
  else
    if not exists (select 1 from public.attempts where user_id = me and lesson_id = p_ref) then return 'pending'; end if;
    if not exists (select 1 from public.attempts where user_id = me and lesson_id = p_ref and not assisted and mouse_count = 0) then return 'refused'; end if;
  end if;

  insert into public.xp_awards (user_id, kind, ref, period, xp, client_at)
  values (me, p_kind, p_ref, per, amount, p_client_at)
  on conflict (user_id, kind, ref) do nothing;
  if not found then return 'duplicate'; end if;

  update public.profiles
    set xp = xp + amount, level = public.level_for_xp(xp + amount)
    where id = me;
  return 'awarded';
end;
$$;
revoke execute on function public.rpc_record_xp_award(text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.rpc_record_xp_award(text, text, timestamptz) to authenticated;

-- ---------------------------------------------------------------- (b) learner_keys
create table public.learner_keys (
  user_id uuid not null references public.profiles (id) on delete cascade,
  key_id text not null check (key_id ~ '^[a-z0-9-]{1,48}$'),
  practiced_at timestamptz not null default now(),
  under_par_at timestamptz,
  primary key (user_id, key_id)
);
alter table public.learner_keys enable row level security;
revoke all on table public.learner_keys from anon, authenticated;
grant select on table public.learner_keys to authenticated;
create policy learner_keys_owner_select on public.learner_keys for select to authenticated
  using (user_id = (select auth.uid()));

-- Stamp keys practiced (p_under_par false) or under par (true; under par is practiced too). The
-- first stamp stands: a later call never moves it. At most 200 ids a call; a malformed id raises.
-- Returns how many keys took a new stamp.
create or replace function public.rpc_note_keys(p_ids text[], p_under_par boolean default false)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid;
  n integer := 0;
  k text;
begin
  me := (select auth.uid());
  if me is null then raise exception 'not signed in'; end if;
  if p_ids is null or cardinality(p_ids) = 0 then return 0; end if;
  if cardinality(p_ids) > 200 then raise exception 'bad keys'; end if;
  foreach k in array p_ids loop
    if k is null or k !~ '^[a-z0-9-]{1,48}$' then raise exception 'bad keys'; end if;
  end loop;
  with ins as (
    insert into public.learner_keys as t (user_id, key_id, practiced_at, under_par_at)
    select me, x, now(), case when coalesce(p_under_par, false) then now() else null end
    from (select distinct unnest(p_ids) as x) ids
    on conflict (user_id, key_id) do update
      set under_par_at = coalesce(t.under_par_at, excluded.under_par_at)
      where t.under_par_at is null and excluded.under_par_at is not null
    returning 1
  )
  select count(*) into n from ins;
  return n;
end;
$$;
revoke execute on function public.rpc_note_keys(text[], boolean) from public, anon, authenticated;
grant execute on function public.rpc_note_keys(text[], boolean) to authenticated;

-- The caller's keys as the device keeps them: { "<key id>": { "p": ms, "u": ms } }.
create or replace function public.rpc_my_keys()
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select coalesce(jsonb_object_agg(k.key_id,
           jsonb_strip_nulls(jsonb_build_object(
             'p', (extract(epoch from k.practiced_at) * 1000)::bigint,
             'u', (extract(epoch from k.under_par_at) * 1000)::bigint))), '{}'::jsonb)
  from public.learner_keys k
  where k.user_id = (select auth.uid())
$$;
revoke execute on function public.rpc_my_keys() from public, anon, authenticated;
grant execute on function public.rpc_my_keys() to authenticated;

-- ---------------------------------------------------------------- (c) export grows
create or replace function public.rpc_export_my_data()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid;
begin
  me := (select auth.uid());
  if me is null then raise exception 'not signed in'; end if;
  return jsonb_build_object(
    'profile', (select to_jsonb(pr) from public.profiles pr where pr.id = me),
    'attempts', coalesce((select jsonb_agg(to_jsonb(a) order by a.created_at)
                          from public.attempts a where a.user_id = me), '[]'::jsonb),
    'lesson_progress', coalesce((select jsonb_agg(to_jsonb(lp) order by lp.lesson_id)
                                 from public.lesson_progress lp where lp.user_id = me), '[]'::jsonb),
    'game_attempts', coalesce((select jsonb_agg(to_jsonb(g) order by g.created_at)
                               from public.game_attempts g where g.user_id = me), '[]'::jsonb),
    'game_pbs', coalesce((select jsonb_agg(to_jsonb(b) order by b.ref)
                          from public.game_pbs b where b.user_id = me), '[]'::jsonb),
    'xp_awards', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at)
                           from public.xp_awards x where x.user_id = me), '[]'::jsonb),
    'learner_keys', coalesce((select jsonb_agg(to_jsonb(k) order by k.key_id)
                              from public.learner_keys k where k.user_id = me), '[]'::jsonb),
    'certificates', coalesce((select jsonb_agg(to_jsonb(c) order by c.issued_at)
                              from public.certificates c where c.user_id = me), '[]'::jsonb));
end;
$$;
-- grants on rpc_export_my_data carry over from 0004 (create or replace keeps the ACL)
