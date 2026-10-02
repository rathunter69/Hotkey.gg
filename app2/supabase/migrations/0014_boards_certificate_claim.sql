-- 0014_boards_certificate_claim.sql — what M104 (Leaderboards) and M102 (the one certificate) still
-- needed on the server once 0009 (the run record, M96) and 0010 (settings, M101, and the
-- certificates table, M102) were written. Forward-only; written in run R8 and NOT applied until
-- Wolf says so in the project chat.
--
--   (a) rpc_board, by time   3.0 "Leaderboards": no tier marks, ranked by time, then keys, then the
--                            earlier run (0008 ranked the tier first). Each row says whether it is
--                            the caller's, and how big the field is; the caller's own row comes back
--                            under the top rows when they sit lower, so the page can pin it with its
--                            move. A private profile stays off everyone else's board but still sees
--                            its own place.
--   (b) rpc_claim_certificate  the server rule that issues hotkey.gg Certified, Excel for Finance:
--                            every chapter Verified, meaning a gate attempt (0013's chapter_gates)
--                            inside its time limit. The six assessment figures are frozen onto the
--                            certificate through 0010's issue_certificate. Idempotent.

-- ---------------------------------------------------------------- (a) the board by time
drop function if exists public.rpc_board(text, int, bigint);
create or replace function public.rpc_board(p_ref text, p_limit int default 100, p_seed bigint default null)
returns table (pos bigint, handle text, level integer, secs numeric(8,2), keys integer, at timestamptz, mine boolean, field bigint)
language sql
stable
security definer
set search_path = ''
as $$
  with me as (select (select auth.uid()) as id),
  best as (
    -- p_seed null: the all-time board from the derived PBs (each a user's fastest clean run).
    -- p_seed given: the best clean run per user on that sheet (the Daily).
    select b.user_id, b.secs, b.keys, b.at
    from public.game_pbs b
    where p_seed is null and b.ref = coalesce(p_ref, '')
    union all
    select s.user_id, s.secs, s.keys, s.at from (
      select distinct on (a.user_id) a.user_id, a.secs, a.keys, coalesce(a.client_at, a.created_at) as at
      from public.game_attempts a
      where p_seed is not null and a.ref = coalesce(p_ref, '') and a.seed = p_seed
        and a.clean and a.secs is not null
      order by a.user_id, a.secs asc, a.keys asc, coalesce(a.client_at, a.created_at) asc
    ) s
  ),
  field as (
    select r.*, pr.handle, pr.level, coalesce(r.user_id = me.id, false) as is_me
    from best r cross join me
    join public.profiles pr on pr.id = r.user_id
    where pr.public_profile or coalesce(r.user_id = me.id, false)
  ),
  ranked as (
    select row_number() over (order by f.secs asc, f.keys asc, f.at asc) as place, count(*) over () as n, f.*
    from field f
  )
  select r.place, r.handle, r.level, r.secs, r.keys, r.at, r.is_me, r.n
  from ranked r
  where coalesce(p_ref, '') ~ '^[a-z0-9-]{1,64}$'
    and (r.place <= least(greatest(coalesce(p_limit, 100), 1), 200) or r.is_me)
  order by r.place
$$;
revoke execute on function public.rpc_board(text, int, bigint) from public, anon, authenticated;
grant execute on function public.rpc_board(text, int, bigint) to anon, authenticated;

-- ---------------------------------------------------------------- (b) claiming the certificate
-- The best passing gate run per chapter for one account: the fastest attempt on any of the
-- chapter's gates that came in inside the gate's limit. Internal.
create or replace function public.verified_chapters(p_user uuid)
returns table (chapter text, n integer, lesson_id text, secs numeric(8,2), keys integer, at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select distinct on (c.id) c.id, c.n, a.lesson_id, a.secs, a.keystrokes, coalesce(a.client_at, a.created_at)
  from public.chapters c
  join public.chapter_gates g on g.chapter = c.id
  join public.attempts a on a.lesson_id = g.lesson_id and a.user_id = p_user
  where a.secs is not null and a.secs <= g.limit_secs
  order by c.id, a.secs asc, coalesce(a.client_at, a.created_at) asc
$$;
revoke execute on function public.verified_chapters(uuid) from public, anon, authenticated;

-- Issue the course certificate to the caller once every chapter is Verified; 'not verified' names
-- nothing more (the certificate page already shows which chapters are left). p_display_name is the
-- name for the certificate (Settings, Account and privacy); empty falls back to the handle. An
-- account that already holds it gets the same row back.
create or replace function public.rpc_claim_certificate(p_display_name text default null)
returns public.certificates
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid;
  done int;
  total int;
  figures jsonb;
  name_in text;
begin
  me := (select auth.uid());
  if me is null then raise exception 'not signed in'; end if;
  name_in := nullif(btrim(coalesce(p_display_name, '')), '');
  if name_in is not null and (length(name_in) > 80 or name_in ~ '[[:cntrl:]]') then raise exception 'bad name'; end if;
  select count(*) into total from public.chapters;
  select count(*), coalesce(jsonb_agg(jsonb_build_object('chapter', v.chapter, 'n', v.n, 'secs', v.secs, 'keys', v.keys, 'at', v.at) order by v.n), '[]'::jsonb)
    into done, figures
  from public.verified_chapters(me) v;
  if done < total then raise exception 'not verified'; end if;
  return public.issue_certificate(me, name_in, figures);
end;
$$;
revoke execute on function public.rpc_claim_certificate(text) from public, anon, authenticated;
grant execute on function public.rpc_claim_certificate(text) to authenticated;
