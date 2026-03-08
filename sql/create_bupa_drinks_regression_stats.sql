-- Create table for drinks regression statistics
-- Shows how each biomarker correlates with alcohol consumption (drinks per day)

create table if not exists public.bupa_drinks_regression_stats (
  id bigint generated always as identity primary key,
  variable_name text not null unique,
  slope numeric(12,6) not null,
  intercept numeric(12,6) not null,
  r_value numeric(12,6) not null,
  r_squared numeric(12,6) not null,
  count_used integer not null,
  created_at timestamptz not null default now(),
  constraint bupa_drinks_regression_stats_variable_name_check
    check (variable_name in ('mcv', 'alp', 'alt', 'ast', 'ast_alt_ratio', 'ggt', 'selector'))
);

create index if not exists bupa_drinks_regression_stats_variable_name_idx
  on public.bupa_drinks_regression_stats (variable_name);

-- Enable RLS but allow public read access
alter table public.bupa_drinks_regression_stats enable row level security;

drop policy if exists "Allow public read access to drinks regression stats" on public.bupa_drinks_regression_stats;
create policy "Allow public read access to drinks regression stats"
  on public.bupa_drinks_regression_stats for select
  using (true);

-- Helper function for linear regression calculation
create or replace function linear_regression(x numeric[], y numeric[])
returns table(slope numeric, intercept numeric, r_value numeric, r_squared numeric) as $$
declare
  n integer;
  mean_x numeric;
  mean_y numeric;
  sum_xy numeric;
  sum_x2 numeric;
  sum_y2 numeric;
  numerator numeric;
  denominator_x numeric;
  denominator_y numeric;
  calc_slope numeric;
  calc_intercept numeric;
  calc_r numeric;
  calc_r2 numeric;
begin
  n := array_length(x, 1);
  
  if n is null or n = 0 then
    return query select 0::numeric, 0::numeric, 0::numeric, 0::numeric;
    return;
  end if;
  
  -- Calculate means
  mean_x := (select avg(val) from unnest(x) val);
  mean_y := (select avg(val) from unnest(y) val);
  
  -- Calculate sums
  sum_xy := (select sum((x[i] - mean_x) * (y[i] - mean_y)) from generate_series(1, n) i);
  sum_x2 := (select sum((x[i] - mean_x) ^ 2) from generate_series(1, n) i);
  sum_y2 := (select sum((y[i] - mean_y) ^ 2) from generate_series(1, n) i);
  
  -- Calculate slope and intercept
  if sum_x2 = 0 then
    calc_slope := 0;
    calc_intercept := mean_y;
  else
    calc_slope := sum_xy / sum_x2;
    calc_intercept := mean_y - calc_slope * mean_x;
  end if;
  
  -- Calculate correlation coefficient
  denominator_x := sqrt(sum_x2);
  denominator_y := sqrt(sum_y2);
  
  if denominator_x = 0 or denominator_y = 0 then
    calc_r := 0;
  else
    calc_r := sum_xy / (denominator_x * denominator_y);
  end if;
  
  calc_r2 := calc_r ^ 2;
  
  return query select 
    round(calc_slope, 6),
    round(calc_intercept, 6),
    round(calc_r, 6),
    round(calc_r2, 6);
end;
$$ language plpgsql;

-- Calculate regression for MCV vs Drinks
insert into public.bupa_drinks_regression_stats (variable_name, slope, intercept, r_value, r_squared, count_used)
select 
  'mcv' as variable_name,
  lr.slope,
  lr.intercept,
  lr.r_value,
  lr.r_squared,
  (select count(*)::integer from public.bupa_liver_records) as count_used
from (
  select array_agg(drinks) as x_vals, array_agg(mcv) as y_vals
  from public.bupa_liver_records
) data
cross join lateral linear_regression(data.x_vals, data.y_vals) lr
on conflict (variable_name) do update set
  slope = excluded.slope,
  intercept = excluded.intercept,
  r_value = excluded.r_value,
  r_squared = excluded.r_squared,
  count_used = excluded.count_used,
  created_at = now();

-- Calculate regression for ALP vs Drinks
insert into public.bupa_drinks_regression_stats (variable_name, slope, intercept, r_value, r_squared, count_used)
select 
  'alp' as variable_name,
  lr.slope,
  lr.intercept,
  lr.r_value,
  lr.r_squared,
  (select count(*)::integer from public.bupa_liver_records) as count_used
from (
  select array_agg(drinks) as x_vals, array_agg(alp) as y_vals
  from public.bupa_liver_records
) data
cross join lateral linear_regression(data.x_vals, data.y_vals) lr
on conflict (variable_name) do update set
  slope = excluded.slope,
  intercept = excluded.intercept,
  r_value = excluded.r_value,
  r_squared = excluded.r_squared,
  count_used = excluded.count_used,
  created_at = now();

-- Calculate regression for ALT vs Drinks
insert into public.bupa_drinks_regression_stats (variable_name, slope, intercept, r_value, r_squared, count_used)
select 
  'alt' as variable_name,
  lr.slope,
  lr.intercept,
  lr.r_value,
  lr.r_squared,
  (select count(*)::integer from public.bupa_liver_records) as count_used
from (
  select array_agg(drinks) as x_vals, array_agg(alt) as y_vals
  from public.bupa_liver_records
) data
cross join lateral linear_regression(data.x_vals, data.y_vals) lr
on conflict (variable_name) do update set
  slope = excluded.slope,
  intercept = excluded.intercept,
  r_value = excluded.r_value,
  r_squared = excluded.r_squared,
  count_used = excluded.count_used,
  created_at = now();

-- Calculate regression for AST vs Drinks
insert into public.bupa_drinks_regression_stats (variable_name, slope, intercept, r_value, r_squared, count_used)
select 
  'ast' as variable_name,
  lr.slope,
  lr.intercept,
  lr.r_value,
  lr.r_squared,
  (select count(*)::integer from public.bupa_liver_records) as count_used
from (
  select array_agg(drinks) as x_vals, array_agg(ast) as y_vals
  from public.bupa_liver_records
) data
cross join lateral linear_regression(data.x_vals, data.y_vals) lr
on conflict (variable_name) do update set
  slope = excluded.slope,
  intercept = excluded.intercept,
  r_value = excluded.r_value,
  r_squared = excluded.r_squared,
  count_used = excluded.count_used,
  created_at = now();

-- Calculate regression for AST/ALT Ratio vs Drinks
insert into public.bupa_drinks_regression_stats (variable_name, slope, intercept, r_value, r_squared, count_used)
select 
  'ast_alt_ratio' as variable_name,
  lr.slope,
  lr.intercept,
  lr.r_value,
  lr.r_squared,
  (select count(*)::integer from public.bupa_liver_records) as count_used
from (
  select array_agg(drinks) as x_vals, array_agg(ast_alt_ratio::numeric) as y_vals
  from public.bupa_liver_records
) data
cross join lateral linear_regression(data.x_vals, data.y_vals) lr
on conflict (variable_name) do update set
  slope = excluded.slope,
  intercept = excluded.intercept,
  r_value = excluded.r_value,
  r_squared = excluded.r_squared,
  count_used = excluded.count_used,
  created_at = now();

-- Calculate regression for GGT vs Drinks
insert into public.bupa_drinks_regression_stats (variable_name, slope, intercept, r_value, r_squared, count_used)
select 
  'ggt' as variable_name,
  lr.slope,
  lr.intercept,
  lr.r_value,
  lr.r_squared,
  (select count(*)::integer from public.bupa_liver_records) as count_used
from (
  select array_agg(drinks) as x_vals, array_agg(ggt) as y_vals
  from public.bupa_liver_records
) data
cross join lateral linear_regression(data.x_vals, data.y_vals) lr
on conflict (variable_name) do update set
  slope = excluded.slope,
  intercept = excluded.intercept,
  r_value = excluded.r_value,
  r_squared = excluded.r_squared,
  count_used = excluded.count_used,
  created_at = now();

-- Calculate regression for Selector vs Drinks
insert into public.bupa_drinks_regression_stats (variable_name, slope, intercept, r_value, r_squared, count_used)
select 
  'selector' as variable_name,
  lr.slope,
  lr.intercept,
  lr.r_value,
  lr.r_squared,
  (select count(*)::integer from public.bupa_liver_records) as count_used
from (
  select array_agg(drinks) as x_vals, array_agg(selector) as y_vals
  from public.bupa_liver_records
) data
cross join lateral linear_regression(data.x_vals, data.y_vals) lr
on conflict (variable_name) do update set
  slope = excluded.slope,
  intercept = excluded.intercept,
  r_value = excluded.r_value,
  r_squared = excluded.r_squared,
  count_used = excluded.count_used,
  created_at = now();
