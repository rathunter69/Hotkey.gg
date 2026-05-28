# hotkey.gg — Cloudflare + Supabase setup guide

This gets your foundation stood up: the site live on Cloudflare, and Supabase ready for accounts + the leaderboard. It's written for the architecture we settled on:

- **Site** → static files on Cloudflare (no server to manage)
- **Accounts + data** → Supabase (Postgres database + built-in auth)
- **Login method** → email **+ password** — testers create an account with their **school (.edu) email** and a password, then sign in normally; sessions persist, so they're not re-authing every visit (Monkeytype-style). An **invite code** still gates the beta. No Google/Facebook.
- **No Cloudflare Worker for now.** The page talks to Supabase directly; you add a Worker/Edge Function later only when scores need to be tamper-proof. Nothing here gets thrown away when you do.

Do the two parts in any order — they're independent until the very end. Exact button labels may shift slightly as these dashboards update; the structure won't.

---

## Part 1 — Cloudflare (get the site live)

### 1.1 Your site files
Your site is a handful of static files (all in your outputs):
- `app.html` — **the trainer, which now also contains the landing screen** ("Drills, not lessons." → Start training). This is your real front door.
- `leaderboard.html` — the leaderboard
- `reference.html` — the keyboard cheat sheet
- `favicon.svg` — the tab icon

**Homepage:** since the landing now lives inside the trainer, you want `app.html` to load at the root. The clean way is to **rename `app.html` → `index.html`** (Cloudflare serves `index.html` at the root). The old standalone marketing `index.html` is no longer needed — drop it. One catch: `leaderboard.html` and `reference.html` link back to the trainer as `app.html`, so if you rename it those two links need to point to the new name — say the word and I'll fix them in one pass. Keep all files in the same folder.

### 1.2 Create the Cloudflare account
1. Sign up at **dash.cloudflare.com**.
2. Immediately turn on **2FA** (My Profile → Authentication). This account will eventually hold your domain, database keys, and everything else — lock it down now.

### 1.3 Add your domain to Cloudflare (DNS)
You registered `hotkey.gg` at Porkbun; now you point its DNS at Cloudflare.
1. In Cloudflare: **Add a site** → enter `hotkey.gg` → pick the **Free** plan.
2. Cloudflare scans existing records and then gives you **two nameservers** (something like `xxx.ns.cloudflare.com`).
3. In **Porkbun** → your domain → **Authoritative Nameservers** → replace what's there with Cloudflare's two nameservers → save.
4. Back in Cloudflare, wait for the zone status to flip to **Active** (usually minutes, sometimes a few hours). **Nothing routes until it says Active** — this is the #1 "why isn't it working" cause.

### 1.4 Put the site on GitHub and deploy from it (no terminal)
This is the one-time setup that makes future updates painless: you'll edit files, click two buttons in an app, and Cloudflare republishes automatically — plus you get version history and one-click rollback. You never touch a command line.

**A. Make a GitHub account.** Go to **github.com**, sign up (free), and turn on 2FA.

**B. Install GitHub Desktop.** Download from **desktop.github.com**, install it, open it, and **Sign in to GitHub.com** from inside the app (File → Options → Accounts, or it prompts you on first launch). This is a normal app with buttons — no typing commands, ever.

**C. Create the repository (your project folder).**
1. In GitHub Desktop: **File → New Repository…**
2. **Name:** `hotkey-site`
3. **Local path:** pick somewhere you'll remember, like your Documents folder. (GitHub Desktop will create a `hotkey-site` folder there.)
4. Leave "Initialize with a README", "Git ignore", and "License" at their defaults.
5. Click **Create Repository**.

**D. Add your three files.**
1. In GitHub Desktop, click **Repository → Show in Finder** (Mac) or **Show in Explorer** (Windows). Your empty `hotkey-site` folder opens.
2. Copy `index.html`, `app.html`, and `leaderboard.html` into that folder.
3. Switch back to GitHub Desktop — the three files now appear in the left-hand **Changes** list.

**E. Commit and publish (this puts it on GitHub, privately).**
1. Bottom-left, in the **Summary** box, type something like `initial site`.
2. Click **Commit to main**.
3. Top of the window, click **Publish repository**.
4. In the dialog, **check "Keep this code private"**, then click **Publish repository**.

Your code now lives in a private GitHub repo. (The anon Supabase key inside the files is safe even if the repo were public — but private is tidier.)

**F. Connect Cloudflare Pages to the repo.**
1. Cloudflare → **Workers & Pages → Create → Pages** tab → **Connect to Git**.
2. Click **Connect GitHub**, authorize Cloudflare in the window that pops up, choose **Only select repositories**, pick **`hotkey-site`**, and approve.
3. Back in Cloudflare, select **`hotkey-site`** → **Begin setup**.
4. **Build settings** — this part matters because your site is plain HTML with no build step:
   - **Framework preset:** `None`
   - **Build command:** leave **empty**
   - **Build output directory:** `/`
5. Click **Save and Deploy**. After ~30 seconds you get a live URL like `hotkey.pages.dev`. Open it — the landing loads, **Start training** opens the trainer. Confirm before attaching the real domain.

**G. From now on, your update loop is just this:** when I send you a changed file, drop it into the `hotkey-site` folder (replacing the old one) → in GitHub Desktop, type a summary → **Commit to main** → **Push origin**. Cloudflare rebuilds automatically in about half a minute. If a change ever breaks something, Cloudflare → your Pages project → **Deployments** → pick an earlier one → **Rollback**.

> Prefer no GitHub at all? You can instead use **Workers & Pages → Create → Pages → Upload assets** and drag the folder in. It works, but you lose version history and have to re-drag on every change — which is the friction you're trying to avoid.

### 1.5 Attach the real domain
1. In the Pages project → **Custom domains** → **Set up a domain** → enter `hotkey.gg`. Repeat for `www.hotkey.gg`.
2. Because the domain is already on Cloudflare, it wires the DNS for you. Confirm the record shows as **proxied** (orange cloud) — that's what gives you the CDN and SSL.

### 1.6 Lock down SSL (the classic footgun)
1. Cloudflare → **SSL/TLS** → **Overview** → set the mode to **Full (strict)**. *Not* "Flexible" — Flexible causes redirect loops and insecure origins.
2. **SSL/TLS → Edge Certificates** → turn on **Always Use HTTPS**.

### 1.7 A project email address (free, ~5 min)
Use one address for every service account so you stop juggling personal inboxes. Since your domain is on Cloudflare, this is free and receive-only — perfect for signups, password resets, and billing alerts.
1. Cloudflare → your domain → **Email** → **Email Routing** → **Get started**.
2. Create a custom address and point it at the inbox you already use:
   - `ops@hotkey.gg`  →  *(your personal inbox)*
   - Optional but tidy: make one per service so you can see who's mailing you and kill a leaked address without changing everything else — `github@hotkey.gg`, `supabase@hotkey.gg`, `cloudflare@hotkey.gg`, all → the same inbox.
3. Cloudflare adds the required MX/DNS records automatically — accept them. Then **verify** the destination inbox (click the link Cloudflare emails you).
4. *(Optional — sending too)* To also **send** as `ops@hotkey.gg`: in Gmail → **Settings → Accounts → "Send mail as" → Add another email address**, enter `ops@hotkey.gg`, and Gmail will email a code to that address. Since Cloudflare is already forwarding it to you, the code arrives in seconds — enter it and you're done. A "From" dropdown now lets you send as either address.

⚠️ **One trap:** keep your **Porkbun and Cloudflare accounts themselves** on an *independent* email (your personal one) — **not** `@hotkey.gg`. Those two control the domain and its email, so if DNS ever breaks you must be able to log in and fix it without your reset email routing through the thing that's down. Everything else (GitHub, Supabase, socials) is fine on `@hotkey.gg`. And put **2FA** on whatever inbox these forward into — it's now the recovery key for your whole stack.

✅ **Cloudflare done.** `https://hotkey.gg` loads the landing page and routes into the trainer, and you've got a clean project email.

---

## Part 2 — Supabase (accounts + database)

### 2.1 Create the project
1. Sign up at **supabase.com** → **New project**.
2. **Region**: pick the one closest to your testers — for US-based classmates, **East US** (or West US). This is where your data lives; closer = faster.
3. Set a **database password** and **save it somewhere safe** (you rarely need it, but you can't recover it).
4. Wait ~2 minutes for it to provision.

### 2.2 Grab your API keys
1. Project → **Settings** → **API**.
2. Copy two things and keep them handy:
   - **Project URL** (e.g., `https://abcd1234.supabase.co`)
   - **anon / public key** — this one is **safe to put in the website**; it's designed to be public. Row-Level Security (Part 2.4) is what actually protects your data.
3. ⚠️ There's also a **`service_role` key** on that page. **Never** put it in the website or share it — it bypasses all security. You won't need it for the MVP at all.

> When you're ready to wire the app, I'll write the code with **placeholders** for the Project URL and anon key, so you just paste them in — you won't have to hand the keys to anyone.

### 2.3 Turn on email + password login
1. **Authentication** → **Providers** → **Email** → make sure it's enabled. This gives you email + password sign-up and sign-in. Leave Google, Facebook, etc. **off**.
2. **Confirm email** (in the same Email provider settings) — your call:
   - **On** (recommended): a new tester clicks a one-time confirmation link before their first sign-in — that's your proof the .edu address is real. It's a single step at sign-up, *not* every login.
   - **Off**: sign-up logs them straight in (less friction, unverified emails).
   The app handles both — it shows a "confirm your email" message when confirmation is on.
3. **Authentication** → **URL Configuration**:
   - **Site URL**: `https://hotkey.gg` (until the domain's live, use your `*.pages.dev` URL).
   - **Redirect URLs**: add `https://hotkey.gg` and `https://hotkey.gg/index.html` (also add `https://hotkey.gg/app.html` if you haven't renamed the file yet). Confirmation and password-reset links bounce the user back to one of these — if they're not listed, those links fail. Add `http://localhost:*` if you ever test locally.

### 2.3.5 Restrict sign-ups to school (.edu) emails
The app blocks non-academic emails in the form, but that's bypassable — so enforce it in the database too. **SQL Editor → New query**, paste, **Run**:

```sql
create or replace function public.enforce_edu_email()
returns trigger language plpgsql as $$
begin
  if new.email !~* '\.(edu|edu\.[a-z]{2,}|ac\.[a-z]{2,})$' then
    raise exception 'Only academic (.edu / .edu.xx / .ac.xx) emails may register for the beta.';
  end if;
  return new;
end; $$;

create trigger enforce_edu_email_trg
  before insert on auth.users
  for each row execute function public.enforce_edu_email();
```

This accepts `.edu`, `.edu.xx` (e.g. `edu.au`), and `.ac.xx` (e.g. `ac.uk`). It only affects **new** sign-ups — anyone already in the table stays. To change the rule later, re-run just the `create or replace function …` part. (Bare-country school domains like `utoronto.ca` won't match the pattern — handle those by hand.)

### 2.4 Create the tables + security
Open **SQL Editor** → **New query**, paste the block below, and **Run**. It creates the two tables and turns on Row-Level Security with the right policies (anyone can read the board; you can only write runs as yourself; scores can't be edited or deleted).

```sql
-- One row per completed exercise attempt
create table public.runs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  challenge   text not null,
  time_ms     integer not null,
  keystrokes  integer,
  optimal     integer,
  mouse_used  boolean default false,
  trace       jsonb,                       -- keystroke trace, for anti-cheat later
  created_at  timestamptz not null default now()
);

alter table public.runs enable row level security;

-- the leaderboard is public: anyone can read runs
create policy "runs readable by all"
  on public.runs for select using (true);

-- you can only insert a run as yourself
create policy "insert own runs"
  on public.runs for insert with check (auth.uid() = user_id);

-- Display names for the leaderboard
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  handle      text unique,
  updated_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles readable by all"
  on public.profiles for select using (true);

create policy "insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "update own profile"
  on public.profiles for update using (auth.uid() = id);
```

### 2.5 Sanity check
- **Table Editor** should now show `runs` and `profiles`, each with a small shield/RLS-enabled indicator.
- **Authentication → Policies** should list the policies above.

### 2.6 Invite-only access codes (keeps the beta to your friends)
This makes the platform invite-only: a visitor must sign in **and** redeem a valid code before they can play or post. The code is checked **inside the database** (server-side), so it can't be read from or bypassed in the browser. Run this in the **SQL Editor**:

```sql
-- the codes you hand out (kept secret: no read policy, so clients can't list them)
create table public.access_codes (
  code   text primary key,
  label  text,
  active boolean default true
);
alter table public.access_codes enable row level security;

-- who has redeemed a valid code = your allowlist
create table public.members (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  code      text,
  joined_at timestamptz default now()
);
alter table public.members enable row level security;
create policy "read own membership" on public.members for select using (auth.uid() = user_id);

-- validates a code server-side, records membership, never exposes the code list
create or replace function public.redeem_code(p_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare valid boolean;
begin
  select true into valid from public.access_codes where code = p_code and active = true;
  if valid then
    insert into public.members(user_id, code) values (auth.uid(), p_code)
      on conflict (user_id) do nothing;
    return true;
  end if;
  return false;
end; $$;

-- tighten run-posting: must be signed in AND a member
drop policy if exists "insert own runs" on public.runs;
create policy "members insert own runs" on public.runs for insert
  with check (auth.uid() = user_id and exists (select 1 from public.members m where m.user_id = auth.uid()));

-- seed a couple of codes — CHANGE THESE before sharing
insert into public.access_codes (code, label) values
  ('BOOTH-2026', 'classmates'),
  ('FRIENDS', 'general')
on conflict do nothing;
```

**Running the codes day to day, all from the Table Editor:**
- **Add a code:** add a row to `access_codes`.
- **Kill a code:** set its `active` to `false` (existing members keep access; the code just stops working for new people).
- **See who's joined:** open the `members` table — each row is a friend who redeemed, with which code and when.

✅ **Supabase done.** Accounts, run storage, a public leaderboard, and an invite-only gate — all enforced server-side by RLS.

---

## What's left (my side)
The frontend wiring (sign-in, the invite-code gate, run-recording, and the leaderboard) is already built into `app.html` and `leaderboard.html`. Once your project is live, paste your **Project URL** and **anon key** into the config block at the top of **both** files, re-deploy, and we'll do a quick test pass together.

## Quick reference — what each piece is
- **Porkbun** = owns the name `hotkey.gg`.
- **Cloudflare** = DNS + serves the static site (fast, free, HTTPS).
- **Supabase** = the accounts and the database the site talks to.
- **anon key** = public, goes in the site. **service_role key** = secret, never leaves Supabase.
- **RLS** = the database rules that keep the public anon key safe.
