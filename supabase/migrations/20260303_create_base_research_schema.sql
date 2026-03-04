-- ═══════════════════════════════════════════════════════════════
-- BASE RESEARCH SCHEMA: Create all core research tables
-- This must run BEFORE the master alignment migration
-- ═══════════════════════════════════════════════════════════════

SET search_path TO care_connector;

-- ─── research_project table ───────────────────────────────────
CREATE TABLE IF NOT EXISTS research_project (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  survey_type text DEFAULT 'survey',
  status text DEFAULT 'draft',
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz,
  require_consent boolean DEFAULT false,
  require_screening boolean DEFAULT false,
  voice_input_enabled boolean DEFAULT false,
  notifications_enabled boolean DEFAULT false,
  messaging_enabled boolean DEFAULT false,
  ecogram_enabled boolean DEFAULT false,
  ecogram_center_label text DEFAULT 'You',
  progress_bar_enabled boolean DEFAULT true,
  disable_backtracking boolean DEFAULT false,
  randomize_questions boolean DEFAULT false,
  auto_advance boolean DEFAULT false,
  start_date date,
  end_date date,
  max_participants integer,
  recruitment_criteria text,
  compensation_type text DEFAULT 'none',
  compensation_amount numeric,
  duration text DEFAULT '1 week',
  frequency text DEFAULT 'daily',
  dnd_enabled boolean DEFAULT false,
  onboarding_enabled boolean DEFAULT false,
  custom_start_date_enabled boolean DEFAULT false,
  onboarding_instructions text,
  help_information text,
  survey_code text UNIQUE,
  share_link text
);

CREATE INDEX IF NOT EXISTS idx_research_project_created_by ON research_project(created_by);
CREATE INDEX IF NOT EXISTS idx_research_project_status ON research_project(status);

-- ─── questionnaire table ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS questionnaire (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES research_project(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type text DEFAULT 'survey',
  order_index integer DEFAULT 0,
  frequency text DEFAULT 'once',
  estimated_duration integer DEFAULT 5,
  notification_enabled boolean DEFAULT false,
  notification_title text,
  notification_body text,
  notification_minutes_before integer DEFAULT 5,
  dnd_allowed boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questionnaire_project ON questionnaire(project_id);

-- ─── question table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS question (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id uuid REFERENCES questionnaire(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL,
  order_index integer DEFAULT 0,
  required boolean DEFAULT false,
  tab_label text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  question_config jsonb DEFAULT '{}'::jsonb,
  validation_rule jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_question_questionnaire ON question(questionnaire_id);

-- ─── question_option table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS question_option (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES question(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  option_value text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_question_option_question ON question_option(question_id);

-- ─── enrollment table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enrollment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES research_project(id) ON DELETE CASCADE,
  user_id uuid,
  email text,
  status text DEFAULT 'active',
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  start_date date,
  dnd_setting jsonb DEFAULT '{}'::jsonb,
  profile_data jsonb DEFAULT '{}'::jsonb,
  enrollment_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_enrollment_project ON enrollment(project_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_user ON enrollment(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_email ON enrollment(email);

-- ─── survey_response table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS survey_response (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid REFERENCES enrollment(id) ON DELETE CASCADE,
  project_id uuid REFERENCES research_project(id) ON DELETE CASCADE,
  questionnaire_id uuid REFERENCES questionnaire(id) ON DELETE CASCADE,
  question_id uuid REFERENCES question(id) ON DELETE CASCADE,
  response_text text,
  response_value numeric,
  response_array text[],
  response_json jsonb,
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_survey_response_enrollment ON survey_response(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_survey_response_project ON survey_response(project_id);
CREATE INDEX IF NOT EXISTS idx_survey_response_questionnaire ON survey_response(questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_survey_response_question ON survey_response(question_id);

-- ─── consent_form table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS consent_form (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES research_project(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consent_form_project ON consent_form(project_id);

-- ─── participant_type table ───────────────────────────────────
CREATE TABLE IF NOT EXISTS participant_type (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES research_project(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  auto_number_prefix text,
  relations text[] DEFAULT '{}',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_participant_type_project ON participant_type(project_id);

-- ─── questionnaire_participant_type junction table ────────────
CREATE TABLE IF NOT EXISTS questionnaire_participant_type (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id uuid REFERENCES questionnaire(id) ON DELETE CASCADE,
  participant_type_id uuid REFERENCES participant_type(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(questionnaire_id, participant_type_id)
);

CREATE INDEX IF NOT EXISTS idx_qpt_questionnaire ON questionnaire_participant_type(questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_qpt_participant_type ON questionnaire_participant_type(participant_type_id);

-- ─── Enable RLS on all tables ─────────────────────────────────
ALTER TABLE research_project ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire ENABLE ROW LEVEL SECURITY;
ALTER TABLE question ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_option ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_response ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_form ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_participant_type ENABLE ROW LEVEL SECURITY;

-- ─── RLS Policies: Allow all for authenticated users ──────────
CREATE POLICY "Allow authenticated access" ON research_project FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access" ON questionnaire FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access" ON question FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access" ON question_option FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access" ON enrollment FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access" ON survey_response FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access" ON consent_form FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access" ON participant_type FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access" ON questionnaire_participant_type FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─── RLS Policies: Allow read for anon users ──────────────────
CREATE POLICY "Allow anon read" ON research_project FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON questionnaire FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON question FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON question_option FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON enrollment FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON consent_form FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON participant_type FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON questionnaire_participant_type FOR SELECT TO anon USING (true);

-- ─── Grant permissions ────────────────────────────────────────
GRANT USAGE ON SCHEMA care_connector TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA care_connector TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA care_connector TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA care_connector TO authenticated;
