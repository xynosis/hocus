create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  notes text,
  color_tag text check (color_tag in ('red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink')),
  working_on_date date,
  due_date date,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "users can select own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "users can insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.handle_updated_at();