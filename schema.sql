CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT NOT NULL,
  nickname TEXT NOT NULL,
  website TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  parent_id INTEGER
);

CREATE INDEX IF NOT EXISTS idx_comments_path_created
  ON comments (path, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_path_parent_created
  ON comments (path, parent_id, created_at ASC);

CREATE TABLE IF NOT EXISTS rate_limits (
  ip_hash TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  hits INTEGER NOT NULL
);
