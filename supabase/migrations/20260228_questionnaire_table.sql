-- Migration: Extract questionnaire_configs and participant_types from JSONB into proper tables
-- This makes the data model relational and safe instead of storing critical data in JSONB blobs

-- ============================================================
-- 1. PARTICIPANT TYPE TABLE
-- Previously stored in research_project.setting.participant_types[]
-- ============================================================
CREATE TABLE IF NOT EXISTS care_connector.participant_type (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES care_connector.research_project(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  relations TEXT[] DEFAULT '{}',
  color TEXT DEFAULT '#10b981',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_participant_type_project_id ON care_connector.participant_type(project_id);

-- ============================================================
-- 2. QUESTIONNAIRE TABLE
-- Previously stored in research_project.setting.questionnaire_configs[]
-- Now also covers consent forms and screening question sets
-- questionnaire_type: 'survey' | 'consent' | 'screening'
-- ============================================================
CREATE TABLE IF NOT EXISTS care_connector.questionnaire (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES care_connector.research_project(id) ON DELETE CASCADE,
  questionnaire_type TEXT NOT NULL DEFAULT 'survey',  -- 'survey' | 'consent' | 'screening'
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  estimated_duration INTEGER DEFAULT 5,
  frequency TEXT DEFAULT 'once',                      -- 'once' | 'daily' | 'hourly' | '2hours' | '4hours' | 'twice_daily'
  time_windows JSONB DEFAULT '[{"start":"09:00","end":"21:00"}]',
  notification_enabled BOOLEAN DEFAULT false,
  notification_minutes_before INTEGER DEFAULT 5,
  dnd_allowed BOOLEAN DEFAULT false,
  dnd_default_start TEXT DEFAULT '22:00',
  dnd_default_end TEXT DEFAULT '08:00',
  order_index INTEGER NOT NULL DEFAULT 0,
  -- Consent-specific fields (only used when questionnaire_type = 'consent')
  consent_text TEXT,
  consent_url TEXT,
  consent_required BOOLEAN DEFAULT true,
  -- Screening-specific fields (only used when questionnaire_type = 'screening')
  disqualify_logic JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questionnaire_project_id ON care_connector.questionnaire(project_id);

-- ============================================================
-- 3. JUNCTION: questionnaire <-> participant_type (many-to-many)
-- A questionnaire can be assigned to multiple participant types
-- A participant type can have multiple questionnaires
-- ============================================================
CREATE TABLE IF NOT EXISTS care_connector.questionnaire_participant_type (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  questionnaire_id UUID NOT NULL REFERENCES care_connector.questionnaire(id) ON DELETE CASCADE,
  participant_type_id UUID NOT NULL REFERENCES care_connector.participant_type(id) ON DELETE CASCADE,
  UNIQUE(questionnaire_id, participant_type_id)
);

CREATE INDEX IF NOT EXISTS idx_qpt_questionnaire_id ON care_connector.questionnaire_participant_type(questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_qpt_participant_type_id ON care_connector.questionnaire_participant_type(participant_type_id);

-- ============================================================
-- 4. ADD questionnaire_id FK to survey_question
-- Previously this was stored inside question_config JSONB as questionnaire_id
-- Now it's a proper foreign key
-- ============================================================
ALTER TABLE care_connector.survey_question
  ADD COLUMN IF NOT EXISTS questionnaire_id UUID REFERENCES care_connector.questionnaire(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_survey_question_questionnaire_id ON care_connector.survey_question(questionnaire_id);
