-- SERVER-VALIDATED CURTAIN (r280, Wolf: "keep this locked down until launch").
-- The old curtain compared against a code shipped INSIDE the client JS — cosmetic.
-- Codes now live server-side; the client only asks "is this valid?". To really
-- lock down: deactivate HAGS and mint a private code —
--   update public.beta_codes set active=false where code='hags';
--   insert into public.beta_codes(code, note) values ('your-secret', 'launch wave 2');
-- Honest limits: localStorage hk_beta_ok can still be hand-set, and Supabase
-- signups remain open (anon-first UX) — this stops casual walk-ins, not devs.

create table if not exists public.beta_codes (
  code       text primary key check (code = lower(code)),
  note       text,
  active     boolean not null default true,
  uses       integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.beta_codes enable row level security;
-- no client policies: the RPC is the only road

insert into public.beta_codes (code, note) values ('hags', 'original beta wave')
on conflict (code) do nothing;

create or replace function public.curtain_check(p_code text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v text; hit boolean;
begin
  v := lower(trim(coalesce(p_code,'')));
  if v = '' then return false; end if;
  update public.beta_codes set uses = uses + 1 where code = v and active
    returning true into hit;
  return coalesce(hit, false);
end $$;
grant execute on function public.curtain_check(text) to anon, authenticated;
