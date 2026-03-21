-- Add group support to canvas_items
-- group_id is a shared UUID assigned to items that move/select together.
-- No separate groups table — the shared UUID IS the group.
ALTER TABLE canvas_items
  ADD COLUMN IF NOT EXISTS group_id uuid;
