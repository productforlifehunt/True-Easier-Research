-- Add schedule mode columns to notification_config
-- 为 notification_config 添加调度模式列

ALTER TABLE care_connector.notification_config
  ADD COLUMN IF NOT EXISTS schedule_mode text NOT NULL DEFAULT 'interval',
  ADD COLUMN IF NOT EXISTS interval_start_hour integer NOT NULL DEFAULT 8,
  ADD COLUMN IF NOT EXISTS interval_end_hour integer NOT NULL DEFAULT 19,
  ADD COLUMN IF NOT EXISTS specific_times text[] DEFAULT '{}'::text[];

COMMENT ON COLUMN care_connector.notification_config.schedule_mode IS 'interval = hourly/2h/4h within time range; specific_times = exact HH:MM list';
COMMENT ON COLUMN care_connector.notification_config.interval_start_hour IS 'Start hour for interval mode (0-23), default 8 AM';
COMMENT ON COLUMN care_connector.notification_config.interval_end_hour IS 'End hour for interval mode (0-23), default 7 PM';
COMMENT ON COLUMN care_connector.notification_config.specific_times IS 'Array of HH:MM strings for specific_times mode';