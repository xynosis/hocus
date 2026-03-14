alter table public.tasks
  add column energy text check (energy in ('easy', 'moderate', 'heavy')),
  add column interest text check (interest in ('dreading', 'neutral', 'want_to')),
  add column estimated_minutes integer check (estimated_minutes > 0);
