-- Enable frontend read access with Row Level Security.
-- This keeps writes closed while allowing anonymous/public dashboard reads.

alter table public.bupa_liver_records enable row level security;

drop policy if exists "Public can read bupa liver records" on public.bupa_liver_records;

create policy "Public can read bupa liver records"
on public.bupa_liver_records
for select
to anon, authenticated
using (true);
