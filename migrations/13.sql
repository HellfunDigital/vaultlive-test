
-- Add XP and Points system columns to users table
ALTER TABLE users ADD COLUMN xp_total INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN user_level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN points_balance INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN points_earned_total INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN referral_token TEXT;
ALTER TABLE users ADD COLUMN referred_by INTEGER;
ALTER TABLE users ADD COLUMN watch_time_minutes INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN last_watch_time_update TIMESTAMP;

-- Create XP events tracking table
CREATE TABLE xp_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  xp_amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create points transactions table
CREATE TABLE points_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  points_amount INTEGER NOT NULL,
  description TEXT,
  related_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create viewer of the month table
CREATE TABLE viewer_of_month (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  month_year TEXT NOT NULL,
  selection_criteria TEXT,
  bonus_points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create community guidelines table
CREATE TABLE community_guidelines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create leaderboards cache table
CREATE TABLE leaderboard_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  leaderboard_type TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  data TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
