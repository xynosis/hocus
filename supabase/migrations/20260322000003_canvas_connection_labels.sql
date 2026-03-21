-- Add optional text label to canvas connections
ALTER TABLE canvas_connections
  ADD COLUMN IF NOT EXISTS label text;
