ALTER TABLE comments ADD COLUMN parent_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_comments_path_parent_created
  ON comments (path, parent_id, created_at ASC);
