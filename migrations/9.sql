
ALTER TABLE users ADD COLUMN last_name_change_at TIMESTAMP DEFAULT NULL;
CREATE UNIQUE INDEX idx_users_name_unique ON users(name) WHERE name IS NOT NULL;
