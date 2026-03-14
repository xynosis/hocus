create table public.project_sections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.project_sections enable row level security;

create policy "Users can manage their own project sections"
  on public.project_sections for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
