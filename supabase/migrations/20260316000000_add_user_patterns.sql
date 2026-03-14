create table public.user_patterns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  steps text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.user_patterns enable row level security;

create policy "Users can manage their own patterns"
  on public.user_patterns
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
