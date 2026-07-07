-- Expanded handle moderation: slurs and abusive terms blocked as substrings
-- (case-insensitive, catches embedded variants). Cooldown + uniqueness unchanged.
create or replace function public.enforce_handle_rules()
returns trigger language plpgsql security definer as $$
declare banned text[] := array[
  'admin','hotkey','moderator','anthropic','staff','official','support',
  'nigger','nigga','faggot','kike','spic','chink','wetback','tranny','coon',
  'beaner','gook','raghead','retard','hitler','nazi','kkk','rapist','pedo'
];
        b text; cleaned text;
begin
  if new.handle is distinct from old.handle then
    if old.handle_changed_at is not null
       and now() - old.handle_changed_at < interval '7 days' then
      raise exception 'HANDLE_COOLDOWN:%', to_char(old.handle_changed_at + interval '7 days','YYYY-MM-DD');
    end if;
    cleaned := lower(regexp_replace(coalesce(new.handle,''), '[_0134578]', '', 'g'));
    foreach b in array banned loop
      if lower(coalesce(new.handle,'')) like '%'||b||'%' or cleaned like '%'||b||'%' then
        raise exception 'HANDLE_RESERVED';
      end if;
    end loop;
    new.handle_changed_at := now();
  end if;
  return new;
end $$;
