-- Add image support to canvas_items
ALTER TABLE canvas_items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update the item_type constraint to include 'image'
ALTER TABLE canvas_items DROP CONSTRAINT IF EXISTS canvas_items_item_type_check;
ALTER TABLE canvas_items ADD CONSTRAINT canvas_items_item_type_check
  CHECK (item_type IN ('task', 'document', 'note', 'image'));

-- Create canvas-images storage bucket (public read, auth-scoped write)
INSERT INTO storage.buckets (id, name, public)
  VALUES ('canvas-images', 'canvas-images', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Auth users can upload canvas images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'canvas-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Canvas images are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'canvas-images');

CREATE POLICY "Auth users can delete their canvas images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'canvas-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
