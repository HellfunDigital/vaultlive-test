
-- Add columns to track user payment/support status for TTS eligibility
ALTER TABLE users ADD COLUMN has_donated BOOLEAN DEFAULT 0;
ALTER TABLE users ADD COLUMN total_donated REAL DEFAULT 0.0;
ALTER TABLE users ADD COLUMN last_donation_at TIMESTAMP DEFAULT NULL;
