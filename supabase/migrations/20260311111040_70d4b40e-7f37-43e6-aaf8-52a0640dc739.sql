ALTER TABLE care_connector.conversations 
ADD COLUMN IF NOT EXISTS last_message_preview text,
ADD COLUMN IF NOT EXISTS unread_count integer DEFAULT 0;