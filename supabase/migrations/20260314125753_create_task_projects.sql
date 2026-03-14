create table public.task_projects (
  task_id uuid not null references public.tasks(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (task_id, project_id)
);

alter table public.task_projects enable row level security;

create policy "users can select own task_projects"
  on public.task_projects for select
  using (auth.uid() = user_id);

create policy "users can insert own task_projects"
  on public.task_projects for insert
  with check (auth.uid() = user_id);

create policy "users can delete own task_projects"
  on public.task_projects for delete
  using (auth.uid() = user_id);