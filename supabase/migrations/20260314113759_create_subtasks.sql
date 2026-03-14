create table public.subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  is_complete boolean not null default false,
  estimated_minutes int,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.subtasks enable row level security;

create policy "users can select own subtasks"
  on public.subtasks for select
  using (auth.uid() = user_id);

create policy "users can insert own subtasks"
  on public.subtasks for insert
  with check (auth.uid() = user_id);

create policy "users can update own subtasks"
  on public.subtasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete own subtasks"
  on public.subtasks for delete
  using (auth.uid() = user_id);