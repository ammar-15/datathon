-- Create table for non-drinker statistics (drinks < 1.0)
create table if not exists public.bupa_non_drinker_stats (
  id bigint generated always as identity primary key,
  column_name text not null unique,
  mean numeric(12,4) not null,
  median numeric(12,4) not null,
  mode numeric(12,4) not null,
  std_dev numeric(12,4) not null,
  min_value numeric(12,4) not null,
  max_value numeric(12,4) not null,
  record_count integer not null,
  created_at timestamptz not null default now(),
  constraint bupa_non_drinker_stats_column_name_check
    check (column_name in ('mcv', 'alp', 'alt', 'ast', 'ast_alt_ratio', 'ggt', 'drinks', 'selector'))
);

create index if not exists bupa_non_drinker_stats_column_name_idx
  on public.bupa_non_drinker_stats (column_name);

-- Enable RLS but allow public read access
alter table public.bupa_non_drinker_stats enable row level security;

drop policy if exists "Allow public read access to non-drinker stats" on public.bupa_non_drinker_stats;
create policy "Allow public read access to non-drinker stats"
  on public.bupa_non_drinker_stats for select
  using (true);

-- Calculate and insert statistics for non-drinkers (drinks < 1.0)
-- Note: Mode calculation uses most frequent value

-- Helper function for mode calculation
create or replace function calculate_mode(col_vals numeric[])
returns numeric as $$
declare
  mode_val numeric;
begin
  select val into mode_val
  from (
    select unnest(col_vals) as val
  ) t
  group by val
  order by count(*) desc, val
  limit 1;
  return coalesce(mode_val, 0);
end;
$$ language plpgsql;

-- Insert statistics for each column
insert into public.bupa_non_drinker_stats (column_name, mean, median, mode, std_dev, min_value, max_value, record_count)
select 
  'mcv' as column_name,
  round(avg(mcv)::numeric, 4) as mean,
  round(percentile_cont(0.5) within group (order by mcv)::numeric, 4) as median,
  calculate_mode(array_agg(mcv)) as mode,
  round(stddev(mcv)::numeric, 4) as std_dev,
  round(min(mcv)::numeric, 4) as min_value,
  round(max(mcv)::numeric, 4) as max_value,
  count(*)::integer as record_count
from public.bupa_liver_records
where drinks < 1.0
on conflict (column_name) do update set
  mean = excluded.mean,
  median = excluded.median,
  mode = excluded.mode,
  std_dev = excluded.std_dev,
  min_value = excluded.min_value,
  max_value = excluded.max_value,
  record_count = excluded.record_count,
  created_at = now();

insert into public.bupa_non_drinker_stats (column_name, mean, median, mode, std_dev, min_value, max_value, record_count)
select 
  'alp' as column_name,
  round(avg(alp)::numeric, 4) as mean,
  round(percentile_cont(0.5) within group (order by alp)::numeric, 4) as median,
  calculate_mode(array_agg(alp)) as mode,
  round(stddev(alp)::numeric, 4) as std_dev,
  round(min(alp)::numeric, 4) as min_value,
  round(max(alp)::numeric, 4) as max_value,
  count(*)::integer as record_count
from public.bupa_liver_records
where drinks < 1.0
on conflict (column_name) do update set
  mean = excluded.mean,
  median = excluded.median,
  mode = excluded.mode,
  std_dev = excluded.std_dev,
  min_value = excluded.min_value,
  max_value = excluded.max_value,
  record_count = excluded.record_count,
  created_at = now();

insert into public.bupa_non_drinker_stats (column_name, mean, median, mode, std_dev, min_value, max_value, record_count)
select 
  'alt' as column_name,
  round(avg(alt)::numeric, 4) as mean,
  round(percentile_cont(0.5) within group (order by alt)::numeric, 4) as median,
  calculate_mode(array_agg(alt)) as mode,
  round(stddev(alt)::numeric, 4) as std_dev,
  round(min(alt)::numeric, 4) as min_value,
  round(max(alt)::numeric, 4) as max_value,
  count(*)::integer as record_count
from public.bupa_liver_records
where drinks < 1.0
on conflict (column_name) do update set
  mean = excluded.mean,
  median = excluded.median,
  mode = excluded.mode,
  std_dev = excluded.std_dev,
  min_value = excluded.min_value,
  max_value = excluded.max_value,
  record_count = excluded.record_count,
  created_at = now();

insert into public.bupa_non_drinker_stats (column_name, mean, median, mode, std_dev, min_value, max_value, record_count)
select 
  'ast' as column_name,
  round(avg(ast)::numeric, 4) as mean,
  round(percentile_cont(0.5) within group (order by ast)::numeric, 4) as median,
  calculate_mode(array_agg(ast)) as mode,
  round(stddev(ast)::numeric, 4) as std_dev,
  round(min(ast)::numeric, 4) as min_value,
  round(max(ast)::numeric, 4) as max_value,
  count(*)::integer as record_count
from public.bupa_liver_records
where drinks < 1.0
on conflict (column_name) do update set
  mean = excluded.mean,
  median = excluded.median,
  mode = excluded.mode,
  std_dev = excluded.std_dev,
  min_value = excluded.min_value,
  max_value = excluded.max_value,
  record_count = excluded.record_count,
  created_at = now();

insert into public.bupa_non_drinker_stats (column_name, mean, median, mode, std_dev, min_value, max_value, record_count)
select 
  'ast_alt_ratio' as column_name,
  round(avg(ast_alt_ratio)::numeric, 4) as mean,
  round(percentile_cont(0.5) within group (order by ast_alt_ratio)::numeric, 4) as median,
  round(calculate_mode(array_agg(round(ast_alt_ratio::numeric, 2))), 4) as mode,
  round(stddev(ast_alt_ratio)::numeric, 4) as std_dev,
  round(min(ast_alt_ratio)::numeric, 4) as min_value,
  round(max(ast_alt_ratio)::numeric, 4) as max_value,
  count(*)::integer as record_count
from public.bupa_liver_records
where drinks < 1.0
on conflict (column_name) do update set
  mean = excluded.mean,
  median = excluded.median,
  mode = excluded.mode,
  std_dev = excluded.std_dev,
  min_value = excluded.min_value,
  max_value = excluded.max_value,
  record_count = excluded.record_count,
  created_at = now();

insert into public.bupa_non_drinker_stats (column_name, mean, median, mode, std_dev, min_value, max_value, record_count)
select 
  'ggt' as column_name,
  round(avg(ggt)::numeric, 4) as mean,
  round(percentile_cont(0.5) within group (order by ggt)::numeric, 4) as median,
  calculate_mode(array_agg(ggt)) as mode,
  round(stddev(ggt)::numeric, 4) as std_dev,
  round(min(ggt)::numeric, 4) as min_value,
  round(max(ggt)::numeric, 4) as max_value,
  count(*)::integer as record_count
from public.bupa_liver_records
where drinks < 1.0
on conflict (column_name) do update set
  mean = excluded.mean,
  median = excluded.median,
  mode = excluded.mode,
  std_dev = excluded.std_dev,
  min_value = excluded.min_value,
  max_value = excluded.max_value,
  record_count = excluded.record_count,
  created_at = now();

insert into public.bupa_non_drinker_stats (column_name, mean, median, mode, std_dev, min_value, max_value, record_count)
select 
  'drinks' as column_name,
  round(avg(drinks)::numeric, 4) as mean,
  round(percentile_cont(0.5) within group (order by drinks)::numeric, 4) as median,
  calculate_mode(array_agg(drinks)) as mode,
  round(stddev(drinks)::numeric, 4) as std_dev,
  round(min(drinks)::numeric, 4) as min_value,
  round(max(drinks)::numeric, 4) as max_value,
  count(*)::integer as record_count
from public.bupa_liver_records
where drinks < 1.0
on conflict (column_name) do update set
  mean = excluded.mean,
  median = excluded.median,
  mode = excluded.mode,
  std_dev = excluded.std_dev,
  min_value = excluded.min_value,
  max_value = excluded.max_value,
  record_count = excluded.record_count,
  created_at = now();

insert into public.bupa_non_drinker_stats (column_name, mean, median, mode, std_dev, min_value, max_value, record_count)
select 
  'selector' as column_name,
  round(avg(selector)::numeric, 4) as mean,
  round(percentile_cont(0.5) within group (order by selector)::numeric, 4) as median,
  calculate_mode(array_agg(selector)) as mode,
  round(stddev(selector)::numeric, 4) as std_dev,
  round(min(selector)::numeric, 4) as min_value,
  round(max(selector)::numeric, 4) as max_value,
  count(*)::integer as record_count
from public.bupa_liver_records
where drinks < 1.0
on conflict (column_name) do update set
  mean = excluded.mean,
  median = excluded.median,
  mode = excluded.mode,
  std_dev = excluded.std_dev,
  min_value = excluded.min_value,
  max_value = excluded.max_value,
  record_count = excluded.record_count,
  created_at = now();
