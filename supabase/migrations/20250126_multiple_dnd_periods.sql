-- Create table for multiple Do Not Disturb periods
CREATE TABLE IF NOT EXISTS care_connector.dnd_periods (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  label VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_dnd_periods_user_id ON care_connector.dnd_periods(user_id);
CREATE INDEX IF NOT EXISTS idx_dnd_periods_active ON care_connector.dnd_periods(user_id, is_active);

-- Remove old single DND columns from profiles
ALTER TABLE care_connector.profiles 
DROP COLUMN IF EXISTS dnd_start_time,
DROP COLUMN IF EXISTS dnd_end_time;

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION care_connector.update_dnd_period_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_dnd_period_timestamp
  BEFORE UPDATE ON care_connector.dnd_periods
  FOR EACH ROW
  EXECUTE FUNCTION care_connector.update_dnd_period_timestamp();

-- Comment the table and columns
COMMENT ON TABLE care_connector.dnd_periods IS 'Stores multiple Do Not Disturb periods for each user';
COMMENT ON COLUMN care_connector.dnd_periods.label IS 'Optional label like "Sleep", "Work", "Meeting" etc.';
COMMENT ON COLUMN care_connector.dnd_periods.is_active IS 'Whether this DND period is currently active';
