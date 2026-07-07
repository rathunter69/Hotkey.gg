-- cosmetic card flair (border styles); users set their own
alter table public.profiles add column if not exists flair text;
