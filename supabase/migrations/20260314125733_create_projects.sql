create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "users can select own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();