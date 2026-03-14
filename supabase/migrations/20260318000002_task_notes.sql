create table public.task_notes (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.task_notes enable row level security;

create policy "Users can manage their own task notes"
  on public.task_notes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
