-- SCHOOL TAG SAVE + MODERATION (r276) — two birds:
-- 1. BUG: the r252 picker saved via profiles.update(school_tag), but r122 revoked
--    that column from clients (server-derived only) — every custom pick since has
--    silently failed with 42501 (the client swallowed the error). Picks now travel
--    through this RPC.
-- 2. #31: custom "Other" tags relied on the client-side hkNameOk filter only —
--    the same two-list design (leet-mapped substrings + word-boundary terms) now
--    runs server-side, shared with the desk trigger via hk_name_ok().

-- shared name gate: mirrors themes.js hkNameOk (keep the three in sync)
create or replace function public.hk_name_ok(p_name text)
returns boolean language plpgsql immutable set search_path = public as $$
declare raw text; s text; w text; frag text;
        subs  text[] := array['nigg','fagg','kike','wetback','tranny','pedo','whore','slut','cunt','fuck','shit','bitch','retard','jizz','porn'];
        words text[] := array['rape','nazi','dyke','anal','cum','cock','dick','pussy','penis','vagina','coon','spic','chink','hoe','kkk','isis','hitler'];
begin
  raw := lower(coalesce(p_name,''));
  -- leet MAP (not strip): n4z1 -> nazi
  s := translate(raw, '@0134578$!|', 'aoieastsbsi');
  s := regexp_replace(replace(replace(s,'$','s'),'!','i'), '[^a-z]', '', 'g');
  foreach frag in array subs loop
    if s like '%'||frag||'%' then return false; end if;
  end loop;
  -- word-boundary check runs on the leet-MAPPED text with spaces intact:
  -- 'n4z1' -> the word 'nazi' (blocked); 'Ashkenazi' stays one word (passes)
  foreach w in array words loop
    if translate(raw, '@0134578$!|', 'aoieastsbsi') ~ ('\m'||w||'\M') then return false; end if;
  end loop;
  return true;
end $$;
grant execute on function public.hk_name_ok(text) to authenticated, anon;

create or replace function public.set_school_tag(p_tag text)
returns void language plpgsql security definer set search_path = public as $$
declare v text;
begin
  if auth.uid() is null then raise exception 'NOT_SIGNED_IN'; end if;
  v := nullif(trim(coalesce(p_tag,'')), '');
  if v is not null then
    if char_length(v) not between 2 and 40 then raise exception 'TAG_FORMAT'; end if;
    if v !~ '^[A-Za-z0-9][A-Za-z0-9 &.:''\-]*$' then raise exception 'TAG_FORMAT'; end if;
    if not public.hk_name_ok(replace(v, 'other:', '')) then raise exception 'TAG_RESERVED'; end if;
  end if;
  update public.profiles set school_tag = v, updated_at = now() where id = auth.uid();
end $$;
grant execute on function public.set_school_tag(text) to authenticated;

-- desk names get the upgraded gate too (the old fold STRIPPED digits, so n4z1 slipped)
create or replace function public.desk_name_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare reserved text[] := array['admin','hotkey','moderator','anthropic','staff','official','support'];
        b text; folded text;
begin
  folded := lower(regexp_replace(translate(coalesce(new.name,''), '@0134578', 'aoieastb'), '[^a-z]', '', 'g'));
  foreach b in array reserved loop
    if lower(coalesce(new.name,'')) like '%'||b||'%' or folded like '%'||b||'%' then
      raise exception 'DESK_NAME_RESERVED';
    end if;
  end loop;
  if not public.hk_name_ok(new.name) then raise exception 'DESK_NAME_RESERVED'; end if;
  return new;
end $$;
-- trigger already exists (r110) and points at this function name; body swap is enough
