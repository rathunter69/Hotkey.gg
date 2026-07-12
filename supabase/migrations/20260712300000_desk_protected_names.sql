-- DESK PROTECTED NAMES (r118) — Wolf's impersonation concern: "some undergrad makes
-- their group 'PJT RSSG' and tanks a real desk's image." Real firm/group names are
-- RESERVED at the trigger: creation fails with DESK_NAME_PROTECTED. Verified-desk
-- claiming (manual, by Wolf) unlocks them later — see dev/TRUST_SAFETY.md.
-- Idempotent: redefines desk_name_guard (trigger binding from r110 unchanged).

create or replace function public.desk_name_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare banned text[] := array[
  'admin','hotkey','moderator','anthropic','staff','official','support',
  'nigger','nigga','faggot','kike','spic','chink','wetback','tranny','coon',
  'beaner','gook','raghead','retard','hitler','nazi','kkk','rapist','pedo'
];
        -- long firm names: matched on the punctuation/space-collapsed form (substring-safe)
        protected_collapsed text[] := array[
  'goldmansachs','goldman','morganstanley','jpmorgan','bankofamerica','merrilllynch',
  'evercore','lazard','moelis','centerview','qatalyst','jefferies','blackstone',
  'apollo','carlyle','barclays','citigroup','citibank','creditsuisse','rothschild',
  'houlihanlokey','houlihan','perellaweinberg','perella','guggenheim','greenhill',
  'wellsfargo','deutschebank','nomura','mizuho','macquarie','pipersandler',
  'raymondjames','williamblair','harrisWilliams','solomonpartners','ducerapartners',
  'liontreeadvisors','liontree','allenandcompany'
];
        b text; cleaned text; collapsed text;
begin
  cleaned   := lower(regexp_replace(coalesce(new.name,''), '[_0134578 ]', '', 'g'));
  collapsed := lower(regexp_replace(coalesce(new.name,''), '[^a-zA-Z]', '', 'g'));
  foreach b in array banned loop
    if lower(coalesce(new.name,'')) like '%'||b||'%' or cleaned like '%'||b||'%' then
      raise exception 'DESK_NAME_RESERVED';
    end if;
  end loop;
  foreach b in array protected_collapsed loop
    if collapsed like '%'||lower(b)||'%' then
      raise exception 'DESK_NAME_PROTECTED';
    end if;
  end loop;
  -- short acronyms (GS, MS, PJT, RSSG…): standalone-token match only, so 'Kings of
  -- the Grid' passes while 'GS TMT 2026' is reserved.
  if lower(coalesce(new.name,'')) ~* '\y(gs|ms|jpm|jpmc|pjt|rssg|kkr|ubs|rbc|citi|baml|bofa|pwp|db|cs|cvp|evr|hl|gugg|msco)\y' then
    raise exception 'DESK_NAME_PROTECTED';
  end if;
  return new;
end $$;
