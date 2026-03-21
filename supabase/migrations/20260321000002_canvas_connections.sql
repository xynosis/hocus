CREATE TABLE canvas_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_item_id UUID NOT NULL REFERENCES canvas_items(id) ON DELETE CASCADE,
  to_item_id UUID NOT NULL REFERENCES canvas_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE canvas_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own canvas connections" ON canvas_connections
  FOR ALL USING (auth.uid() = user_id);
