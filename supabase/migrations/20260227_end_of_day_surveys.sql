-- End-of-Day Survey table (Section 4 of the corrected survey questions)
-- Separate from hourly survey_entries - this captures daily burden, sense of competence
CREATE TABLE IF NOT EXISTS end_of_day_surveys (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  survey_date DATE NOT NULL,
  entry_timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- 4.2 Shortened Daily Sense of Competence (ESM Items from SSCQ)
  -- Scale: 1-7 (Strongly Disagree to Strongly Agree)
  soc_stressed INTEGER CHECK (soc_stressed BETWEEN 1 AND 7),
  soc_privacy INTEGER CHECK (soc_privacy BETWEEN 1 AND 7),
  soc_strained INTEGER CHECK (soc_strained BETWEEN 1 AND 7),
  
  -- 4.3 Daily Burden Rating (-3 to +3)
  daily_burden_rating INTEGER CHECK (daily_burden_rating BETWEEN -3 AND 3),
  
  -- 4.1 Supplement notes - free text for any missed hourly logs
  supplement_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One end-of-day survey per user per day
  UNIQUE(user_id, survey_date)
);

-- Enable RLS
ALTER TABLE end_of_day_surveys ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own entries
CREATE POLICY "Users can view own end_of_day_surveys" ON end_of_day_surveys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own end_of_day_surveys" ON end_of_day_surveys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own end_of_day_surveys" ON end_of_day_surveys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own end_of_day_surveys" ON end_of_day_surveys
  FOR DELETE USING (auth.uid() = user_id);

-- Add end_of_day_time setting to user_profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'end_of_day_time'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN end_of_day_time TIME DEFAULT '22:00:00';
  END IF;
END $$;
