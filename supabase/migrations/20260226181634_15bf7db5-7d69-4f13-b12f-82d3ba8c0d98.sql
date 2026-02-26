ALTER TABLE care_connector.survey_entries 
  ADD COLUMN IF NOT EXISTS activity_categories TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS activity_other TEXT,
  ADD COLUMN IF NOT EXISTS your_mood TEXT,
  ADD COLUMN IF NOT EXISTS people_challenges TEXT,
  ADD COLUMN IF NOT EXISTS challenges_faced TEXT,
  ADD COLUMN IF NOT EXISTS challenge_types TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS task_difficulty INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS resources_using TEXT,
  ADD COLUMN IF NOT EXISTS resources_wanted TEXT,
  ADD COLUMN IF NOT EXISTS daily_soc_stressed TEXT,
  ADD COLUMN IF NOT EXISTS daily_soc_privacy TEXT,
  ADD COLUMN IF NOT EXISTS daily_soc_strained TEXT;

ALTER TABLE care_connector.profiles 
  ADD COLUMN IF NOT EXISTS ecogram_data JSONB;