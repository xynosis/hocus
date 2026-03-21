CREATE TABLE IF NOT EXISTS write_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL DEFAULT 'Untitled template',
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE write_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own templates"
  ON write_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own templates"
  ON write_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own templates"
  ON write_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own templates"
  ON write_templates FOR DELETE USING (auth.uid() = user_id);
