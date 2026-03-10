
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS join_participant_library boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS web_notifications_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_notifications_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS occupation text,
  ADD COLUMN IF NOT EXISTS age text,
  ADD COLUMN IF NOT EXISTS gender text;

-- DND periods table for user-level notification preferences
CREATE TABLE IF NOT EXISTS care_connector.user_dnd_period (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  channel text NOT NULL DEFAULT 'all', -- 'all', 'web', 'push', 'email'
  start_time text NOT NULL DEFAULT '22:00', -- HH:MM
  end_time text NOT NULL DEFAULT '07:00',   -- HH:MM
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE care_connector.user_dnd_period ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own DND" ON care_connector.user_dnd_period
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

NOTIFY pgrst, 'reload schema';
