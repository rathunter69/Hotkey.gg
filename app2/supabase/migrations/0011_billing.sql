-- 0011_billing.sql — Phase E checkout (docs/phases/E-checkout.md, section 4). Stripe writes the
-- same `entitlements` rows admin and redeem grants write (source = 'checkout'), keyed on the
-- Stripe object they came from, so every webhook handler is an idempotent upsert. Forward-only;
-- written on branch `payments` and NOT applied until Wolf gives the go-ahead (brief section 0).
--
--   entitlements.external_ref   sub_… for a subscription (pi_… for a later one-time pass); unique when set
--   entitlements.plan           monthly | student_monthly | pass | addon, null for admin, redeem and group rows
--   entitlements.auto_renew     true while the subscription renews, false once it is set to cancel at
--                               period end (the account page says "renews" or "ends"); null off checkout
--   billing_customers           user ↔ Stripe customer; the owner may read their own row
--   billing_events              every webhook event id seen, and when it was processed (replay guard)
--   billing_alerts              what needs Wolf's hand: a team subscription changed or ended, an unmatched refund
--
-- Every billing RPC is security definer with search_path pinned and executes as service_role ONLY
-- (the edge functions); anon and authenticated can call none of them. The client's active test is
-- unchanged: starts_at <= now() and (ends_at is null or ends_at > now()).

-- ---------------------------------------------------------------- entitlements: the Stripe key and the plan
alter table public.entitlements
  add column external_ref text check (external_ref is null or length(external_ref) between 3 and 255),
  add column plan text check (plan is null or plan in ('monthly', 'student_monthly', 'pass', 'addon')),
  add column auto_renew boolean;
create unique index entitlements_external_ref on public.entitlements (external_ref) where external_ref is not null;

-- ---------------------------------------------------------------- billing_customers
create table public.billing_customers (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  stripe_customer_id text unique not null check (stripe_customer_id ~ '^cus_[A-Za-z0-9]{1,250}$'),
  created_at timestamptz not null default now()
);
alter table public.billing_customers enable row level security;
revoke all on table public.billing_customers from anon, authenticated;
grant select on table public.billing_customers to authenticated;
create policy billing_customers_owner_select on public.billing_customers for select to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------- billing_events (no client access)
create table public.billing_events (
  id text primary key check (length(id) between 3 and 255),
  type text not null check (length(type) <= 100),
  received_at timestamptz not null default now(),
  processed_at timestamptz
);
alter table public.billing_events enable row level security;
revoke all on table public.billing_events from anon, authenticated;

-- ---------------------------------------------------------------- billing_alerts (no client access; the admin page reads it)
create table public.billing_alerts (
  id bigint generated always as identity primary key,
  kind text not null check (kind ~ '^[a-z_]{1,60}$'),
  ref text check (ref is null or length(ref) <= 255),
  detail jsonb not null default '{}' check (pg_column_size(detail) <= 8192),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index billing_alerts_open on public.billing_alerts (created_at) where resolved_at is null;
alter table public.billing_alerts enable row level security;
revoke all on table public.billing_alerts from anon, authenticated;

-- ---------------------------------------------------------------- billing_link_customer
-- Insert the pair, or no-op when the same pair already exists. A user already linked to a
-- different customer (or a customer already linked to another user) is refused.
create or replace function public.billing_link_customer(p_user uuid, p_customer text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_user is null or p_customer is null then raise exception 'missing argument'; end if;
  insert into public.billing_customers (user_id, stripe_customer_id) values (p_user, p_customer)
  on conflict do nothing;
  if not exists (select 1 from public.billing_customers where user_id = p_user and stripe_customer_id = p_customer) then
    raise exception 'customer link conflict';
  end if;
end;
$$;

-- ---------------------------------------------------------------- billing_grant
-- Upsert on external_ref. A renewal moves ends_at forward, never back (an out-of-order older event
-- cannot shorten access), and a row ended by a refund or a dispute is never reopened by a late event.
create or replace function public.billing_grant(p_user uuid, p_ref text, p_plan text, p_ends_at timestamptz, p_note text default null, p_renews boolean default null)
returns public.entitlements
language plpgsql
security definer
set search_path = ''
as $$
declare
  ent public.entitlements;
begin
  if p_user is null or p_ref is null or p_ends_at is null then raise exception 'missing argument'; end if;
  insert into public.entitlements (user_id, source, ends_at, note, external_ref, plan, auto_renew)
  values (p_user, 'checkout', p_ends_at, p_note, p_ref, p_plan, p_renews)
  on conflict (external_ref) where external_ref is not null do update
    set ends_at = greatest(public.entitlements.ends_at, excluded.ends_at),
        plan = coalesce(excluded.plan, public.entitlements.plan),
        auto_renew = coalesce(excluded.auto_renew, public.entitlements.auto_renew)
    where public.entitlements.note is distinct from 'refund' and public.entitlements.note is distinct from 'dispute'
  returning * into ent;
  if ent.id is null then select * into ent from public.entitlements where external_ref = p_ref; end if;
  return ent;
end;
$$;

-- ---------------------------------------------------------------- billing_end
-- End the row with that ref at p_ends_at (never later than it already ends). Returns rows moved.
create or replace function public.billing_end(p_ref text, p_ends_at timestamptz)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare n integer;
begin
  if p_ref is null or p_ends_at is null then raise exception 'missing argument'; end if;
  update public.entitlements
     set ends_at = least(coalesce(ends_at, p_ends_at), p_ends_at), auto_renew = false
   where external_ref = p_ref;
  get diagnostics n = row_count;
  return n;
end;
$$;

-- ---------------------------------------------------------------- billing_revoke_user
-- A full refund or a dispute: end every live checkout row of the user now. Admin, redeem and group rows stay.
create or replace function public.billing_revoke_user(p_user uuid, p_note text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare n integer;
begin
  if p_user is null then raise exception 'missing argument'; end if;
  update public.entitlements
     set ends_at = now(), note = left(coalesce(p_note, 'revoked'), 200), auto_renew = false
   where user_id = p_user
     and source = 'checkout'
     and (ends_at is null or ends_at > now());
  get diagnostics n = row_count;
  return n;
end;
$$;

-- ---------------------------------------------------------------- billing_alert
create or replace function public.billing_alert(p_kind text, p_ref text, p_detail jsonb default '{}')
returns bigint
language sql
security definer
set search_path = ''
as $$
  insert into public.billing_alerts (kind, ref, detail) values (p_kind, p_ref, coalesce(p_detail, '{}'::jsonb))
  returning id
$$;

-- ---------------------------------------------------------------- the webhook's replay guard
-- billing_event_begin: record the event; true when it still needs handling (new, or seen but never
-- processed: Stripe retried after a 500). billing_event_done marks it processed.
create or replace function public.billing_event_begin(p_id text, p_type text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare done timestamptz;
begin
  if p_id is null or p_type is null then raise exception 'missing argument'; end if;
  insert into public.billing_events (id, type) values (p_id, p_type) on conflict (id) do nothing;
  select processed_at into done from public.billing_events where id = p_id;
  return done is null;
end;
$$;

create or replace function public.billing_event_done(p_id text)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.billing_events set processed_at = now() where id = p_id and processed_at is null
$$;

-- ---------------------------------------------------------------- service_role only
revoke execute on function public.billing_link_customer(uuid, text) from public, anon, authenticated;
revoke execute on function public.billing_grant(uuid, text, text, timestamptz, text, boolean) from public, anon, authenticated;
revoke execute on function public.billing_end(text, timestamptz) from public, anon, authenticated;
revoke execute on function public.billing_revoke_user(uuid, text) from public, anon, authenticated;
revoke execute on function public.billing_alert(text, text, jsonb) from public, anon, authenticated;
revoke execute on function public.billing_event_begin(text, text) from public, anon, authenticated;
revoke execute on function public.billing_event_done(text) from public, anon, authenticated;
grant execute on function public.billing_link_customer(uuid, text) to service_role;
grant execute on function public.billing_grant(uuid, text, text, timestamptz, text, boolean) to service_role;
grant execute on function public.billing_end(text, timestamptz) to service_role;
grant execute on function public.billing_revoke_user(uuid, text) to service_role;
grant execute on function public.billing_alert(text, text, jsonb) to service_role;
grant execute on function public.billing_event_begin(text, text) to service_role;
grant execute on function public.billing_event_done(text) to service_role;
