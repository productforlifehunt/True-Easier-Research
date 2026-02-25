-- Add notification preferences to profiles table
ALTER TABLE care_connector.profiles 
ADD COLUMN IF NOT EXISTS hourly_reminders_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dnd_start_time TIME DEFAULT '22:00:00',
ADD COLUMN IF NOT EXISTS dnd_end_time TIME DEFAULT '08:00:00',
ADD COLUMN IF NOT EXISTS notification_permission_status VARCHAR(20) DEFAULT 'default';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_hourly_reminders ON care_connector.profiles(hourly_reminders_enabled);

-- Comment the columns
COMMENT ON COLUMN care_connector.profiles.hourly_reminders_enabled IS 'Whether user wants hourly survey reminders';
COMMENT ON COLUMN care_connector.profiles.dnd_start_time IS 'Do Not Disturb period start time (24-hour format)';
COMMENT ON COLUMN care_connector.profiles.dnd_end_time IS 'Do Not Disturb period end time (24-hour format)';
COMMENT ON COLUMN care_connector.profiles.notification_permission_status IS 'Browser notification permission status: default, granted, denied';
