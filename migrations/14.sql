
CREATE TABLE stream_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stream_source TEXT NOT NULL DEFAULT 'kick',
  custom_stream_url TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO stream_settings (stream_source, is_active) VALUES ('kick', 1);
