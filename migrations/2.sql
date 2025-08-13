
ALTER TABLE chat_messages ADD COLUMN platform TEXT DEFAULT 'vaultkeeper';
ALTER TABLE chat_messages ADD COLUMN external_user_id TEXT;
ALTER TABLE chat_messages ADD COLUMN badges TEXT;
