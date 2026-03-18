CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled board',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own boards" ON boards
  FOR ALL USING (auth.uid() = user_id);

CREATE TABLE canvas_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('task', 'document', 'note')),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  note_text TEXT,
  note_color TEXT NOT NULL DEFAULT 'yellow',
  x DOUBLE PRECISION NOT NULL DEFAULT 0,
  y DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE canvas_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own canvas items" ON canvas_items
  FOR ALL USING (auth.uid() = user_id);
