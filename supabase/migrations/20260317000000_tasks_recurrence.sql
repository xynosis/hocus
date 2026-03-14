alter table public.tasks
  add column if not exists recurrence text
  check (recurrence in ('daily', 'weekly', 'monthly'));
