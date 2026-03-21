-- Add tags array to documents
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';
