-- Migration: Fix schema mismatches and add missing columns
-- Date: 2026-02-27
-- Description: 
--   1. Move end_of_day_surveys from public to care_connector schema
--   2. Add missing profile columns (MSPSS, ADKS, DAS, other caregiver fields, "other" text fields)
--   3. Add missing survey_entries column (challenge_type_other)

-- ============================================================================
-- 1. MOVE end_of_day_surveys TO care_connector SCHEMA
-- ============================================================================

-- Move table if it exists in public schema
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'end_of_day_surveys'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'care_connector' AND table_name = 'end_of_day_surveys'
  ) THEN
    ALTER TABLE public.end_of_day_surveys SET SCHEMA care_connector;
  END IF;
END $$;

-- If table doesn't exist in either schema, create it in care_connector
CREATE TABLE IF NOT EXISTS care_connector.end_of_day_surveys (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  survey_date DATE NOT NULL,
  entry_timestamp TIMESTAMPTZ DEFAULT NOW(),
  soc_stressed INTEGER CHECK (soc_stressed BETWEEN 1 AND 7),
  soc_privacy INTEGER CHECK (soc_privacy BETWEEN 1 AND 7),
  soc_strained INTEGER CHECK (soc_strained BETWEEN 1 AND 7),
  daily_burden_rating INTEGER CHECK (daily_burden_rating BETWEEN -3 AND 3),
  supplement_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, survey_date)
);

-- Enable RLS on the care_connector version
ALTER TABLE care_connector.end_of_day_surveys ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies (DROP IF EXISTS to avoid errors if they were moved with the table)
DROP POLICY IF EXISTS "Users can view own end_of_day_surveys" ON care_connector.end_of_day_surveys;
DROP POLICY IF EXISTS "Users can insert own end_of_day_surveys" ON care_connector.end_of_day_surveys;
DROP POLICY IF EXISTS "Users can update own end_of_day_surveys" ON care_connector.end_of_day_surveys;
DROP POLICY IF EXISTS "Users can delete own end_of_day_surveys" ON care_connector.end_of_day_surveys;

CREATE POLICY "Users can view own end_of_day_surveys" ON care_connector.end_of_day_surveys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own end_of_day_surveys" ON care_connector.end_of_day_surveys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own end_of_day_surveys" ON care_connector.end_of_day_surveys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own end_of_day_surveys" ON care_connector.end_of_day_surveys
  FOR DELETE USING (auth.uid() = user_id);


-- ============================================================================
-- 2. ADD MISSING PROFILE COLUMNS
-- ============================================================================

-- 1.1.8 / 2.1.8 Relationship "other" free-text
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS relationship_to_patient_other text;

-- 1.1.9 / 2.1.9 Caregiving years "other" free-text
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS caregiving_years_other text;

-- 1.1.11 Distance details (e.g. "15 min drive")
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS living_with_recipient_details text;

-- 1.2.3 Dementia type "other" free-text
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS dementia_type_other text;

-- 1.2 Comorbidities
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS recipient_comorbidities text;

-- 1.5 MSPSS - Multidimensional Scale of Perceived Social Support (12 items)
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS mspss_so_1 text;
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS mspss_so_2 text;
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS mspss_so_3 text;
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS mspss_so_4 text;
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS mspss_fam_1 text;
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS mspss_fam_2 text;
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS mspss_fam_3 text;
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS mspss_fam_4 text;
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS mspss_fri_1 text;
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS mspss_fri_2 text;
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS mspss_fri_3 text;
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS mspss_fri_4 text;

-- 1.7.1 ADKS (30-item True/False, stored as JSONB array)
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS adks_answers jsonb;

-- 1.7.2 DAS (20-item scale, stored as JSONB array)
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS das_answers jsonb;

-- 2.1.7 Other caregiver: Relationship to primary caregiver
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS relationship_to_primary text;
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS relationship_to_primary_other text;

-- 2.1.11 Other caregiver: Distance from care recipient
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS distance_from_recipient text;
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS distance_from_recipient_details text;
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS distance_from_recipient_other text;

-- 2.1.12 Other caregiver: Contact frequency
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS contact_frequency text;
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS contact_frequency_other text;


-- ============================================================================
-- 3. ADD MISSING SURVEY_ENTRIES COLUMN
-- ============================================================================

-- 3.3.2 Challenge type "other" free-text
ALTER TABLE care_connector.survey_entries
  ADD COLUMN IF NOT EXISTS challenge_type_other text;


-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN care_connector.profiles.mspss_so_1 IS 'MSPSS Significant Other item 1: special person around when in need (1-7)';
COMMENT ON COLUMN care_connector.profiles.adks_answers IS 'ADKS 30-item True/False answers stored as JSON array of strings';
COMMENT ON COLUMN care_connector.profiles.das_answers IS 'DAS 20-item scale answers stored as JSON array of strings (1-7)';
COMMENT ON COLUMN care_connector.profiles.relationship_to_primary IS 'Other caregiver: relationship to primary caregiver';
COMMENT ON COLUMN care_connector.profiles.distance_from_recipient IS 'Other caregiver: distance from care recipient';
COMMENT ON COLUMN care_connector.profiles.contact_frequency IS 'Other caregiver: contact frequency with care recipient';
COMMENT ON COLUMN care_connector.survey_entries.challenge_type_other IS 'Section 3.3.2: Free-text when "other" challenge type selected';
