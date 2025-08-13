
-- Add effect columns to chat_messages table for Points Shop effects
ALTER TABLE chat_messages ADD COLUMN has_highlight_effect BOOLEAN DEFAULT 0;
ALTER TABLE chat_messages ADD COLUMN has_rainbow_effect BOOLEAN DEFAULT 0;
ALTER TABLE chat_messages ADD COLUMN name_glow_color TEXT DEFAULT NULL;
