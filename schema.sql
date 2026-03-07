-- Supabase schema for the BUPA liver dataset.
-- Import note:
-- After creating this table, you can bulk import `data/bupa.data` from the
-- Supabase SQL editor, Table Editor import, or a small script that inserts
-- rows into `public.bupa_liver_records`.

create table if not exists public.bupa_liver_records (
  id bigint generated always as identity primary key,
  mcv integer not null,
  alkphos integer not null,
  sgpt integer not null,
  sgot integer not null,
  gammagt integer not null,
  drinks numeric(6,2) not null,
  selector integer not null check (selector in (1, 2)),
  created_at timestamptz not null default now()
);

create index if not exists bupa_liver_records_selector_idx
  on public.bupa_liver_records (selector);

create index if not exists bupa_liver_records_created_at_idx
  on public.bupa_liver_records (created_at desc);
