-- Migration: Add corrected survey fields per SURVEY_QUESTIONS_CORRECTED document
-- Date: 2026-02-27
-- Description: Adds new columns to survey_entries for event stress rating, MBP checklist,
--   affect scales, daily burden rating. Adds new NPI-Q columns to profiles.
--   Changes task_difficulty semantics from 1-5 to -3 to +3.

-- ============================================================================
-- SURVEY_ENTRIES: New hourly log fields (Section 3 & 4)
-- ============================================================================

-- 3.1.3 Event Stress Rating (-3 to +3)
ALTER TABLE care_connector.survey_entries
  ADD COLUMN IF NOT EXISTS event_stress_rating integer;

-- 3.1.5 Patient Memory/Behavioral Problems (MBP) Checklist
ALTER TABLE care_connector.survey_entries
  ADD COLUMN IF NOT EXISTS mbp_memory text;       -- 'yes' / 'no'
ALTER TABLE care_connector.survey_entries
  ADD COLUMN IF NOT EXISTS mbp_behavior text;      -- 'yes' / 'no'
ALTER TABLE care_connector.survey_entries
  ADD COLUMN IF NOT EXISTS mbp_depression text;    -- 'yes' / 'no'

-- 3.1.6 MBP-Related Distress (0-4)
ALTER TABLE care_connector.survey_entries
  ADD COLUMN IF NOT EXISTS mbp_distress text;

-- 3.1.10 Positive Affect (1-7 each)
ALTER TABLE care_connector.survey_entries
  ADD COLUMN IF NOT EXISTS affect_cheerful text;
ALTER TABLE care_connector.survey_entries
  ADD COLUMN IF NOT EXISTS affect_relaxed text;
ALTER TABLE care_connector.survey_entries
  ADD COLUMN IF NOT EXISTS affect_enthusiastic text;
ALTER TABLE care_connector.survey_entries
  ADD COLUMN IF NOT EXISTS affect_satisfied text;

-- 3.1.11 Negative Affect (1-7 each)
ALTER TABLE care_connector.survey_entries
  ADD COLUMN IF NOT EXISTS affect_insecure text;
ALTER TABLE care_connector.survey_entries
  ADD COLUMN IF NOT EXISTS affect_lonely text;
ALTER TABLE care_connector.survey_entries
  ADD COLUMN IF NOT EXISTS affect_anxious text;
ALTER TABLE care_connector.survey_entries
  ADD COLUMN IF NOT EXISTS affect_irritated text;
ALTER TABLE care_connector.survey_entries
  ADD COLUMN IF NOT EXISTS affect_down text;
ALTER TABLE care_connector.survey_entries
  ADD COLUMN IF NOT EXISTS affect_desperate text;
ALTER TABLE care_connector.survey_entries
  ADD COLUMN IF NOT EXISTS affect_tensed text;

-- 4.3 Daily Burden Rating (-3 to +3)
ALTER TABLE care_connector.survey_entries
  ADD COLUMN IF NOT EXISTS daily_burden_rating integer;

-- Ensure these columns exist (may already exist from AddEntry usage)
ALTER TABLE care_connector.survey_entries
  ADD COLUMN IF NOT EXISTS activity_categories text[];
ALTER TABLE care_connector.survey_entries
  ADD COLUMN IF NOT EXISTS challenge_types text[];
ALTER TABLE care_connector.survey_entries
  ADD COLUMN IF NOT EXISTS challenges_faced text;
ALTER TABLE care_connector.survey_entries
  ADD COLUMN IF NOT EXISTS people_challenges text;
ALTER TABLE care_connector.survey_entries
  ADD COLUMN IF NOT EXISTS resources_using text;
ALTER TABLE care_connector.survey_entries
  ADD COLUMN IF NOT EXISTS resources_wanted text;
ALTER TABLE care_connector.survey_entries
  ADD COLUMN IF NOT EXISTS daily_soc_stressed text;
ALTER TABLE care_connector.survey_entries
  ADD COLUMN IF NOT EXISTS daily_soc_privacy text;
ALTER TABLE care_connector.survey_entries
  ADD COLUMN IF NOT EXISTS daily_soc_strained text;

-- NOTE: task_difficulty column already exists as integer.
-- Semantics change from 1-5 to -3 to +3. Old values remain; new entries use new scale.
-- emotional_impact and your_mood columns retained for backward compat with legacy entries.

-- ============================================================================
-- PROFILES: New NPI-Q 12-item columns (replacing 7-item BPSD)
-- ============================================================================

-- New NPI-Q items (5 new items; agitation, depression, anxiety, hallucinations, sleep already exist)
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS recipient_bpsd_delusions text;
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS recipient_bpsd_elation text;
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS recipient_bpsd_apathy text;
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS recipient_bpsd_disinhibition text;
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS recipient_bpsd_irritability text;
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS recipient_bpsd_motor text;
ALTER TABLE care_connector.profiles
  ADD COLUMN IF NOT EXISTS recipient_bpsd_appetite text;

-- NOTE: Old columns (recipient_bpsd_wandering, recipient_bpsd_aggression) are kept
-- for backward compatibility but are no longer written to by the app.
-- The NPI-Q uses agitation/aggression as a single combined item.

-- ============================================================================
-- PROFILES: Ensure caregiving_duration uses category values
-- ============================================================================
-- No schema change needed; the column type is already text.
-- Old numeric values remain; new values will be category strings:
-- 'less_than_6_months', '6_months_to_1_year', '1_to_2_years', '2_to_5_years', 'more_than_5_years'

COMMENT ON COLUMN care_connector.survey_entries.event_stress_rating IS 'Section 3.1.3: Event stress rating, scale -3 (very unpleasant) to +3 (very pleasant)';
COMMENT ON COLUMN care_connector.survey_entries.mbp_memory IS 'Section 3.1.5.a: Patient memory problems during event (yes/no)';
COMMENT ON COLUMN care_connector.survey_entries.mbp_behavior IS 'Section 3.1.5.b: Patient behavior problems during event (yes/no)';
COMMENT ON COLUMN care_connector.survey_entries.mbp_depression IS 'Section 3.1.5.c: Patient depressive symptoms during event (yes/no)';
COMMENT ON COLUMN care_connector.survey_entries.mbp_distress IS 'Section 3.1.6: Caregiver MBP-related distress (0-4)';
COMMENT ON COLUMN care_connector.survey_entries.daily_burden_rating IS 'Section 4.3: Daily burden rating, scale -3 to +3';
COMMENT ON COLUMN care_connector.survey_entries.task_difficulty IS 'Section 3.3.1: Task difficulty, scale -3 (no challenges) to +3 (extreme challenges). NOTE: Changed from 1-5 to -3/+3 on 2026-02-27';
