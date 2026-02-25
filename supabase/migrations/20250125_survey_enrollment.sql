-- Create survey enrollment tracking table
CREATE TABLE IF NOT EXISTS care_connector.survey_enrollments (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_date DATE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_survey_enrollments_user_id ON care_connector.survey_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_enrollments_status ON care_connector.survey_enrollments(status);

-- Create function to get current survey day for a user
CREATE OR REPLACE FUNCTION care_connector.get_survey_day(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_start_date DATE;
  v_current_day INTEGER;
BEGIN
  -- Get the user's enrollment start date
  SELECT start_date INTO v_start_date
  FROM care_connector.survey_enrollments
  WHERE user_id = p_user_id AND status = 'active';
  
  -- If no active enrollment, return 0
  IF v_start_date IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calculate day number (1-7)
  v_current_day := (CURRENT_DATE - v_start_date)::INTEGER + 1;
  
  -- Ensure day is within 1-7 range
  IF v_current_day < 1 THEN
    RETURN 1;
  ELSIF v_current_day > 7 THEN
    RETURN 7;
  ELSE
    RETURN v_current_day;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to check if user has completed survey
CREATE OR REPLACE FUNCTION care_connector.check_survey_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- If end_date has passed, mark as completed
  IF NEW.end_date < CURRENT_DATE THEN
    NEW.status := 'completed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update status
CREATE TRIGGER trg_check_survey_completion
  BEFORE INSERT OR UPDATE ON care_connector.survey_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION care_connector.check_survey_completion();

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION care_connector.update_survey_enrollment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_survey_enrollment_timestamp
  BEFORE UPDATE ON care_connector.survey_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION care_connector.update_survey_enrollment_timestamp();
