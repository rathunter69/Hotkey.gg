-- SMOKE FIXTURES RE-STAMP (r196) — restore the consumed smoke-u test seed.
-- The r132 full smoke run consumed the smoke-u fixture (claim tests end by
-- emptying it, which self-deletes the desk). `supabase db push` is STATEFUL —
-- the 20260713000000 migration will never re-run — so per its own
-- instructions this ships a fresh copy of the insert under a NEW timestamp
-- ahead of the r196 live smoke run. Idempotent for every existing seed
-- (on conflict do nothing); only the missing smoke-u row actually inserts.
-- REMOVE smoke-u AT LAUNCH (T&S pass) — invisible to real students (domain
-- never matches) but it shouldn't outlive the beta.

insert into public.teams (name, slug, invite_code, owner_id, is_private, edu_domain) values
  ('Wharton',                  'wharton',      '25a39fde', null, false, 'upenn.edu'),
  ('Harvard Business School',  'hbs',          '13584c31', null, false, 'hbs.edu'),
  ('Stanford GSB',             'stanford-gsb', '5516d73c', null, false, 'stanford.edu'),
  ('Columbia Business School', 'cbs',          'e70508a8', null, false, 'columbia.edu'),
  ('Chicago Booth',            'booth',        '6a22b308', null, false, 'chicagobooth.edu'),
  ('Kellogg',                  'kellogg',      '737d446f', null, false, 'northwestern.edu'),
  ('NYU Stern',                'stern',        '36e0a55c', null, false, 'nyu.edu'),
  ('LSE',                      'lse',          '1b97e1cd', null, false, 'lse.ac.uk'),
  ('Smoke University',         'smoke-u',      'smokeu42', null, true,  'hotkeysmoketest.edu')
on conflict (slug) do nothing;
