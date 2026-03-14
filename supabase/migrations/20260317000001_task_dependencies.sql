create table public.task_dependencies (
  task_id uuid not null references public.tasks(id) on delete cascade,
  depends_on_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (task_id, depends_on_id),
  check (task_id <> depends_on_id)
);

alter table public.task_dependencies enable row level security;

create policy "Users can manage their own dependencies"
  on public.task_dependencies
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
