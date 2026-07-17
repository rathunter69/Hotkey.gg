-- r286 SECURITY HARDENING — defense-in-depth from the pre-launch adversarial pass.
-- RLS already gates every table; this removes the LATENT privileges a future RLS
-- mistake could turn into an exploit, and pins the one unpinned definer function.
-- Idempotent.

-- 1. enforce_handle_rules ran SECURITY DEFINER with NO search_path — the classic
--    definer escalation vector (a shadowing function on a mutable search_path could
--    be hijacked). Pin it. Body unchanged; recreate with the SET.
create or replace function public.enforce_handle_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
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
end $fn$;

-- 2. entitlements is the PRO/revenue table. The client only ever READS its own row;
--    writes belong to the checkout webhook (service_role, which bypasses these grants).
--    Strip every write privilege from anon/authenticated so PRO can never be
--    self-granted even if a permissive policy is added by mistake.
revoke insert, update, delete, truncate, references, trigger on public.entitlements from anon, authenticated;

-- 3. runs: the client only INSERTs (guarded) and SELECTs (boards). Revoking UPDATE
--    means a flagged run can never be un-flagged from the client — the shadow flag
--    is permanent until an admin clears it. DELETE/TRUNCATE also gone.
revoke update, delete, truncate, references, trigger on public.runs from anon, authenticated;

-- 4. events (telemetry) + sessions: client INSERTs and, for sessions, SELECTs.
--    No client UPDATE/DELETE is ever legitimate.
revoke update, delete, truncate, references, trigger on public.events from anon, authenticated;
revoke update, delete, truncate, references, trigger on public.sessions from anon, authenticated;

-- 5. key_stats + reports: written only via security-definer RPCs / guarded inserts;
--    no client UPDATE/DELETE path.
revoke update, delete, truncate, references, trigger on public.key_stats from anon, authenticated;
revoke update, delete, truncate, references, trigger on public.reports from anon, authenticated;

-- NOTE (documented, not fixed here): events accepts inserts with user_id = null for
-- pre-auth pageview telemetry, so an anon key can post junk events — table-bloat only,
-- no data exposure. If it becomes a problem, add a per-window insert-rate trigger.
