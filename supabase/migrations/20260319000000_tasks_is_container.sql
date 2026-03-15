ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_container boolean NOT NULL DEFAULT false;
