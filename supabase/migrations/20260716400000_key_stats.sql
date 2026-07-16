-- ACCOUNT-PERSISTENT ANALYTICS (r273, Wolf: "tied to the user account, not the
-- device"). A compact per-user aggregate of the semantic key units (r272): the
-- client bumps it fire-and-forget after every clean run; stats.html reads it as
-- the primary source when signed in. localStorage stays as the guest/offline
-- cache. Writes travel only through the RPC; reads are owner-only.

create table if not exists public.key_stats (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  counts        jsonb not null default '{}'::jsonb,
  keys_lifetime bigint not null default 0,
  updated_at    timestamptz not null default now()
);
alter table public.key_stats enable row level security;
drop policy if exists key_stats_read on public.key_stats;
create policy key_stats_read on public.key_stats for select using (auth.uid() = user_id);
-- no insert/update/delete policies: the security-definer RPC is the only writer

create or replace function public.bump_key_stats(p_counts jsonb, p_keys integer default 0)
returns void language plpgsql security definer set search_path = public as $$
declare cur jsonb; k text; n bigint; ent record;
begin
  if auth.uid() is null then raise exception 'NOT_SIGNED_IN'; end if;
  insert into public.key_stats(user_id) values (auth.uid()) on conflict (user_id) do nothing;
  select counts into cur from public.key_stats where user_id = auth.uid() for update;
  cur := coalesce(cur, '{}'::jsonb);
  for ent in select * from jsonb_each_text(coalesce(p_counts,'{}'::jsonb)) limit 150 loop
    k := ent.key;
    if char_length(k) between 2 and 18 and ent.value ~ '^[0-9]{1,6}$' then
      n := coalesce(nullif(cur->>k,'')::bigint, 0) + least(ent.value::bigint, 500);
      cur := jsonb_set(cur, array[k], to_jsonb(n));
    end if;
  end loop;
  -- bound growth: keep the 120 most-used units
  if (select count(*) from jsonb_object_keys(cur)) > 120 then
    select jsonb_object_agg(key, value) into cur
    from (select key, value from jsonb_each(cur) order by (value::text)::bigint desc limit 120) t;
  end if;
  update public.key_stats
    set counts = cur,
        keys_lifetime = keys_lifetime + least(greatest(coalesce(p_keys,0),0), 5000),
        updated_at = now()
    where user_id = auth.uid();
end $$;
grant execute on function public.bump_key_stats(jsonb, integer) to authenticated;
