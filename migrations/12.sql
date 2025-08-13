
ALTER TABLE chat_messages ADD COLUMN replied_to_message_id INTEGER;
ALTER TABLE chat_messages ADD COLUMN replied_to_username TEXT;
