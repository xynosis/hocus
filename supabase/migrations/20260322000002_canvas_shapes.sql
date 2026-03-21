-- Add rect and ellipse shape types to canvas_items
ALTER TABLE canvas_items DROP CONSTRAINT IF EXISTS canvas_items_item_type_check;
ALTER TABLE canvas_items ADD CONSTRAINT canvas_items_item_type_check
  CHECK (item_type IN ('task', 'document', 'note', 'image', 'frame', 'rect', 'ellipse'));
