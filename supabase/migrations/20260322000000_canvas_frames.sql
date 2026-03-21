-- Add frame support to canvas_items
ALTER TABLE canvas_items
  ADD COLUMN IF NOT EXISTS width integer,
  ADD COLUMN IF NOT EXISTS height integer,
  ADD COLUMN IF NOT EXISTS frame_id uuid REFERENCES canvas_items(id) ON DELETE SET NULL;

-- Update the item_type constraint to include 'frame'
ALTER TABLE canvas_items DROP CONSTRAINT IF EXISTS canvas_items_item_type_check;
ALTER TABLE canvas_items ADD CONSTRAINT canvas_items_item_type_check
  CHECK (item_type IN ('task', 'document', 'note', 'image', 'frame'));
