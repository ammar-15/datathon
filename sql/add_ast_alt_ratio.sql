alter table public.bupa_liver_records
  add column if not exists ast_alt_ratio numeric;

update public.bupa_liver_records
set ast_alt_ratio = ast / nullif(alt, 0);

alter table public.bupa_liver_statistics
  drop constraint if exists bupa_liver_statistics_column_name_check;

alter table public.bupa_liver_statistics
  add constraint bupa_liver_statistics_column_name_check
  check (
    column_name in (
      'mcv',
      'alp',
      'alt',
      'ast',
      'ast_alt_ratio',
      'ggt',
      'drinks',
      'selector'
    )
  );
