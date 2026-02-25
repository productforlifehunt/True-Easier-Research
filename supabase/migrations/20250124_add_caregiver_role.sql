-- Add caregiver_role to profiles table
ALTER TABLE care_connector.profiles 
ADD COLUMN IF NOT EXISTS caregiver_role VARCHAR(50) CHECK (caregiver_role IN ('primary', 'other'));

-- Add caregiver_role to survey_entries table to track role at time of entry
ALTER TABLE care_connector.survey_entries 
ADD COLUMN IF NOT EXISTS caregiver_role VARCHAR(50) CHECK (caregiver_role IN ('primary', 'other'));

-- Add index for filtering by caregiver role
CREATE INDEX IF NOT EXISTS idx_survey_entries_caregiver_role ON care_connector.survey_entries(caregiver_role);
CREATE INDEX IF NOT EXISTS idx_profiles_caregiver_role ON care_connector.profiles(caregiver_role);

-- Add comments for documentation
COMMENT ON COLUMN care_connector.profiles.caregiver_role IS 'Primary caregiver: main person with daily care responsibility. Other caregiver: friends, family, paid workers, volunteers, companions';
COMMENT ON COLUMN care_connector.survey_entries.caregiver_role IS 'Caregiver role at time of survey entry to categorize challenges by caregiver type';
