
-- Remove effect columns from chat_messages table
ALTER TABLE chat_messages DROP COLUMN has_highlight_effect;
ALTER TABLE chat_messages DROP COLUMN has_rainbow_effect;
ALTER TABLE chat_messages DROP COLUMN name_glow_color;
