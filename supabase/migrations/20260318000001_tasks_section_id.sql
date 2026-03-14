alter table public.tasks
  add column if not exists section_id uuid references public.project_sections(id) on delete set null;
