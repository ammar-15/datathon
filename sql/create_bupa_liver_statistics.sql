create table if not exists public.bupa_liver_statistics (
  id bigint generated always as identity primary key,
  column_name text not null unique,
  mean numeric(12,4) not null,
  median numeric(12,4) not null,
  mode numeric(12,4) not null,
  std_dev numeric(12,4) not null,
  min_value numeric(12,4) not null,
  max_value numeric(12,4) not null,
  record_count integer not null,
  updated_at timestamptz not null default now(),
  constraint bupa_liver_statistics_column_name_check
    check (column_name in ('mcv', 'alp', 'alt', 'ast', 'ggt', 'drinks', 'selector'))
);

create index if not exists bupa_liver_statistics_column_name_idx
  on public.bupa_liver_statistics (column_name);
