alter table public.bupa_liver_records enable row level security;
alter table public.bupa_liver_statistics enable row level security;

drop policy if exists "Public can read bupa liver records" on public.bupa_liver_records;
create policy "Public can read bupa liver records"
on public.bupa_liver_records
for select
to anon, authenticated
using (true);

drop policy if exists "Public can read bupa liver statistics" on public.bupa_liver_statistics;
create policy "Public can read bupa liver statistics"
on public.bupa_liver_statistics
for select
to anon, authenticated
using (true);
