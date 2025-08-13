
CREATE TABLE temp_gift_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  custom_id TEXT NOT NULL UNIQUE,
  user_id INTEGER NOT NULL,
  recipients TEXT,
  quantity INTEGER NOT NULL,
  plan_type TEXT NOT NULL,
  billing_cycle TEXT NOT NULL,
  amount REAL NOT NULL,
  gift_message TEXT,
  processed BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
