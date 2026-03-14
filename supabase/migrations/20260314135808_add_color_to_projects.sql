alter table public.projects
  add column color_tag text check (color_tag in ('red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'));