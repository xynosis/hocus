alter table public.tasks
  add column if not exists pattern_id uuid references public.user_patterns(id) on delete set null;
