
-- Drop new tables
DROP TABLE IF EXISTS leaderboard_cache;
DROP TABLE IF EXISTS community_guidelines;
DROP TABLE IF EXISTS viewer_of_month;
DROP TABLE IF EXISTS points_transactions;
DROP TABLE IF EXISTS xp_events;

-- Remove columns from users table
ALTER TABLE users DROP COLUMN xp_total;
ALTER TABLE users DROP COLUMN user_level;
ALTER TABLE users DROP COLUMN points_balance;
ALTER TABLE users DROP COLUMN points_earned_total;
ALTER TABLE users DROP COLUMN referral_token;
ALTER TABLE users DROP COLUMN referred_by;
ALTER TABLE users DROP COLUMN watch_time_minutes;
ALTER TABLE users DROP COLUMN last_watch_time_update;
