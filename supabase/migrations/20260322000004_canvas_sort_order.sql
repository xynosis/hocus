-- Add sort_order to canvas_items for z-layer control (higher = in front)
ALTER TABLE canvas_items
  ADD COLUMN IF NOT EXISTS sort_order bigint NOT NULL DEFAULT 0;
