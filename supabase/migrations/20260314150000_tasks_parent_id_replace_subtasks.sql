-- Add parent_id to tasks (self-referential, cascade delete children with parent)
alter table public.tasks
  add column parent_id uuid references public.tasks(id) on delete cascade;

-- Migrate existing subtasks into tasks as child tasks
insert into public.tasks (
  id, user_id, title, status, parent_id,
  estimated_minutes, created_at, updated_at, completed_at
)
select
  id,
  user_id,
  title,
  case when is_complete then 'done'::text else 'todo'::text end,
  task_id,
  estimated_minutes,
  created_at,
  created_at,
  case when is_complete then created_at else null end
from public.subtasks;

-- Drop the subtasks table (no longer needed)
drop table public.subtasks;
