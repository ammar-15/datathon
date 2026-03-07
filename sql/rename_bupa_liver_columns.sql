alter table public.bupa_liver_records
  rename column alkphos to alp;

alter table public.bupa_liver_records
  rename column sgpt to alt;

alter table public.bupa_liver_records
  rename column sgot to ast;

alter table public.bupa_liver_records
  rename column gammagt to ggt;
