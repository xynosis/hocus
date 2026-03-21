CREATE TABLE IF NOT EXISTS user_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_keywords_unique_text UNIQUE (user_id, text)
);

ALTER TABLE user_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own keywords"
  ON user_keywords FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own keywords"
  ON user_keywords FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own keywords"
  ON user_keywords FOR DELETE USING (auth.uid() = user_id);
