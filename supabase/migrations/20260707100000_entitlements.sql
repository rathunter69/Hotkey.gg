-- Pro entitlements: monetization scaffold. No payments wired yet (Stripe stays in
-- TEST mode until after the internship); this is the table the webhook will write.
create table if not exists public.entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  pro boolean not null default false,
  source text,                      -- 'stripe' | 'comp' | 'beta'
  updated_at timestamptz not null default now()
);
alter table public.entitlements enable row level security;
drop policy if exists "read own entitlement" on public.entitlements;
create policy "read own entitlement" on public.entitlements
  for select using (auth.uid() = user_id);
-- writes come ONLY from the service role (future stripe-webhook edge function)
