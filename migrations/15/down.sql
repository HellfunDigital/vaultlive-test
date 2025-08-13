
-- Remove the donation tracking columns
ALTER TABLE users DROP COLUMN has_donated;
ALTER TABLE users DROP COLUMN total_donated;
ALTER TABLE users DROP COLUMN last_donation_at;
