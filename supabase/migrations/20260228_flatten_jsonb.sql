-- Migration: Flatten ALL JSONB columns into proper columns on research_project
-- No data to preserve (haven't launched). Clean relational schema.

-- ============================================================
-- 1. Flatten setting JSONB into proper columns
-- ============================================================
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS show_progress_bar BOOLEAN DEFAULT true;
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS disable_backtracking BOOLEAN DEFAULT false;
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS randomize_questions BOOLEAN DEFAULT false;
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS auto_advance BOOLEAN DEFAULT false;
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS consent_required BOOLEAN DEFAULT false;
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS consent_form_title TEXT DEFAULT 'Research Consent Form';
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS consent_form_text TEXT;
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS consent_form_url TEXT;
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS screening_enabled BOOLEAN DEFAULT false;
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS participant_number_prefix TEXT DEFAULT 'PP';
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS participant_relation_enabled BOOLEAN DEFAULT false;
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS participant_relation_options TEXT[] DEFAULT '{}';
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS ecogram_enabled BOOLEAN DEFAULT false;
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS ecogram_center_label TEXT DEFAULT 'Me';
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS ecogram_relationship_options TEXT[] DEFAULT '{}';
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS ecogram_support_categories TEXT[] DEFAULT '{}';
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS app_layout JSONB DEFAULT '{}';

-- ============================================================
-- 2. Flatten notification_setting JSONB into proper columns
-- ============================================================
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS notification_frequency TEXT;
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS notification_times_per_day INTEGER;
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS notification_times TEXT[] DEFAULT '{}';
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS notification_send_reminders BOOLEAN DEFAULT true;
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS notification_timezone TEXT;

-- ============================================================
-- 3. Flatten sampling_strategy JSONB into proper columns
-- ============================================================
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS sampling_type TEXT;
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS sampling_prompts_per_day INTEGER;
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS sampling_start_hour INTEGER DEFAULT 8;
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS sampling_end_hour INTEGER DEFAULT 21;
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS sampling_allow_late BOOLEAN DEFAULT true;
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS sampling_late_window_minutes INTEGER DEFAULT 60;

-- ============================================================
-- 4. Flatten recruitment_criteria JSONB into a text column
-- ============================================================
ALTER TABLE care_connector.research_project ADD COLUMN IF NOT EXISTS recruitment_criteria_text TEXT;

-- ============================================================
-- 5. Create profile_question table
-- ============================================================
CREATE TABLE IF NOT EXISTS care_connector.profile_question (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES care_connector.research_project(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'text',
  options TEXT[] DEFAULT '{}',
  required BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_profile_question_project_id ON care_connector.profile_question(project_id);

-- ============================================================
-- 6. Create logic_rule table
-- ============================================================
CREATE TABLE IF NOT EXISTS care_connector.logic_rule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES care_connector.research_project(id) ON DELETE CASCADE,
  question_id UUID REFERENCES care_connector.survey_question(id) ON DELETE CASCADE,
  condition TEXT NOT NULL DEFAULT 'equals',
  value TEXT DEFAULT '',
  action TEXT NOT NULL DEFAULT 'skip',
  target_question_id UUID REFERENCES care_connector.survey_question(id) ON DELETE SET NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_logic_rule_project_id ON care_connector.logic_rule(project_id);
CREATE INDEX IF NOT EXISTS idx_logic_rule_question_id ON care_connector.logic_rule(question_id);

-- ============================================================
-- 7. Drop old JSONB columns (no data to preserve)
-- ============================================================
ALTER TABLE care_connector.research_project DROP COLUMN IF EXISTS setting;
ALTER TABLE care_connector.research_project DROP COLUMN IF EXISTS consent_form;
ALTER TABLE care_connector.research_project DROP COLUMN IF EXISTS notification_setting;
ALTER TABLE care_connector.research_project DROP COLUMN IF EXISTS sampling_strategy;
ALTER TABLE care_connector.research_project DROP COLUMN IF EXISTS recruitment_criteria;
ALTER TABLE care_connector.research_project DROP COLUMN IF EXISTS timeline_config;
ALTER TABLE care_connector.research_project DROP COLUMN IF EXISTS profile_question;
