-- ═══════════════════════════════════════════════════════════════
-- MASTER MIGRATION: Align DB to PRD (FUCKING-READ-ME.md)
-- Date: 2026-03-03
-- 
-- 1. Rename survey_question → question
-- 2. Rename survey_respons → survey_response  
-- 3. Add missing columns to question (allow_other, allow_none, cfg_*, vr_*, template cols)
-- 4. Add missing columns to research_project (layout_*, template cols)
-- 5. Add missing columns to questionnaire (display_mode, questions_per_page, template cols)
-- 6. Create flat tables: app_tab, app_tab_element, child tables
-- 7. Create flat tables: enrollment_dnd_period, enrollment_profile_response, ecogram_member, questionnaire_time_window
-- 8. Migrate existing JSONB data to flat columns/tables
-- 9. RLS policies
-- ═══════════════════════════════════════════════════════════════

-- ─── STEP 0: Table renames ───────────────────────────────────
ALTER TABLE IF EXISTS care_connector.survey_question RENAME TO question;
ALTER TABLE IF EXISTS care_connector.survey_respons RENAME TO survey_response;

-- ─── STEP 1: Add missing columns to question ─────────────────
ALTER TABLE question ADD COLUMN IF NOT EXISTS allow_other boolean DEFAULT false;
ALTER TABLE question ADD COLUMN IF NOT EXISTS allow_none boolean DEFAULT false;
ALTER TABLE question ADD COLUMN IF NOT EXISTS is_template boolean DEFAULT false;
ALTER TABLE question ADD COLUMN IF NOT EXISTS template_is_public_or_private boolean DEFAULT false;
ALTER TABLE question ADD COLUMN IF NOT EXISTS template_category text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS source_template_id uuid;
ALTER TABLE question ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE question ADD COLUMN IF NOT EXISTS scoring_config jsonb;
ALTER TABLE question ADD COLUMN IF NOT EXISTS piping_config jsonb;

-- cfg_* columns (38 flat config columns)
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_max_length integer;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_allow_other boolean;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_allow_none boolean;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_allow_multiple boolean;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_columns text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_custom_labels text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_min_value numeric;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_max_value numeric;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_min numeric;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_max numeric;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_step numeric;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_min_label text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_max_label text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_show_value_labels boolean;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_scale_type text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_yes_label text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_no_label text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_max_files integer;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_max_size_mb integer;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_accepted_types text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_image_url text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_alt_text text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_max_width text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_caption text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_section_color text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_section_icon text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_content text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_content_type text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_font_size text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_color text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_thickness text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_style text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_disqualify_value text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_response_required text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_questionnaire_id uuid;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_options text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_allow_ai_assist boolean;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_allow_ai_auto_answer boolean;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_allow_voice boolean;

-- vr_* columns (8 validation rule columns)
ALTER TABLE question ADD COLUMN IF NOT EXISTS vr_min_length integer;
ALTER TABLE question ADD COLUMN IF NOT EXISTS vr_max_length integer;
ALTER TABLE question ADD COLUMN IF NOT EXISTS vr_min_value numeric;
ALTER TABLE question ADD COLUMN IF NOT EXISTS vr_max_value numeric;
ALTER TABLE question ADD COLUMN IF NOT EXISTS vr_min numeric;
ALTER TABLE question ADD COLUMN IF NOT EXISTS vr_max numeric;
ALTER TABLE question ADD COLUMN IF NOT EXISTS vr_allow_future_dates boolean;
ALTER TABLE question ADD COLUMN IF NOT EXISTS vr_allow_past_dates boolean;

-- ─── STEP 2: Migrate question_config JSONB → cfg_* columns ──
UPDATE question SET
  cfg_max_length = (question_config->>'max_length')::integer,
  cfg_allow_other = (question_config->>'allow_other')::boolean,
  cfg_allow_none = (question_config->>'allow_none')::boolean,
  cfg_allow_multiple = (question_config->>'allow_multiple')::boolean,
  cfg_columns = question_config->>'columns',
  cfg_custom_labels = question_config->>'custom_labels',
  cfg_min_value = (question_config->>'min_value')::numeric,
  cfg_max_value = (question_config->>'max_value')::numeric,
  cfg_min = (question_config->>'min')::numeric,
  cfg_max = (question_config->>'max')::numeric,
  cfg_step = (question_config->>'step')::numeric,
  cfg_min_label = question_config->>'min_label',
  cfg_max_label = question_config->>'max_label',
  cfg_show_value_labels = (question_config->>'show_value_labels')::boolean,
  cfg_scale_type = question_config->>'scale_type',
  cfg_yes_label = question_config->>'yes_label',
  cfg_no_label = question_config->>'no_label',
  cfg_max_files = (question_config->>'max_files')::integer,
  cfg_max_size_mb = (question_config->>'max_size_mb')::integer,
  cfg_accepted_types = question_config->>'accepted_types',
  cfg_image_url = question_config->>'image_url',
  cfg_alt_text = question_config->>'alt_text',
  cfg_max_width = question_config->>'max_width',
  cfg_caption = question_config->>'caption',
  cfg_section_color = question_config->>'section_color',
  cfg_section_icon = question_config->>'section_icon',
  cfg_content = question_config->>'content',
  cfg_content_type = question_config->>'content_type',
  cfg_font_size = question_config->>'font_size',
  cfg_color = question_config->>'color',
  cfg_thickness = question_config->>'thickness',
  cfg_style = question_config->>'style',
  cfg_disqualify_value = question_config->>'disqualify_value',
  cfg_response_required = question_config->>'response_required',
  cfg_questionnaire_id = (question_config->>'questionnaire_id')::uuid,
  cfg_options = question_config->>'options',
  cfg_allow_ai_assist = (question_config->>'allow_ai_assist')::boolean,
  cfg_allow_ai_auto_answer = (question_config->>'allow_ai_auto_answer')::boolean,
  cfg_allow_voice = (question_config->>'allow_voice')::boolean
WHERE question_config IS NOT NULL AND question_config != '{}'::jsonb;

-- ─── STEP 3: Migrate validation_rule JSONB → vr_* columns ───
UPDATE question SET
  vr_min_length = (validation_rule->>'min_length')::integer,
  vr_max_length = (validation_rule->>'max_length')::integer,
  vr_min_value = (validation_rule->>'min_value')::numeric,
  vr_max_value = (validation_rule->>'max_value')::numeric,
  vr_min = (validation_rule->>'min')::numeric,
  vr_max = (validation_rule->>'max')::numeric,
  vr_allow_future_dates = (validation_rule->>'allow_future_dates')::boolean,
  vr_allow_past_dates = (validation_rule->>'allow_past_dates')::boolean
WHERE validation_rule IS NOT NULL AND validation_rule != '{}'::jsonb;

-- ─── STEP 4: Add missing columns to research_project ─────────
ALTER TABLE research_project ADD COLUMN IF NOT EXISTS layout_show_header boolean DEFAULT true;
ALTER TABLE research_project ADD COLUMN IF NOT EXISTS layout_header_title text;
ALTER TABLE research_project ADD COLUMN IF NOT EXISTS layout_theme_primary_color text DEFAULT '#10b981';
ALTER TABLE research_project ADD COLUMN IF NOT EXISTS layout_theme_background_color text DEFAULT '#f9faf8';
ALTER TABLE research_project ADD COLUMN IF NOT EXISTS layout_theme_card_style text DEFAULT 'elevated';
ALTER TABLE research_project ADD COLUMN IF NOT EXISTS is_template boolean DEFAULT false;
ALTER TABLE research_project ADD COLUMN IF NOT EXISTS template_is_public_or_private boolean DEFAULT false;
ALTER TABLE research_project ADD COLUMN IF NOT EXISTS template_category text;
ALTER TABLE research_project ADD COLUMN IF NOT EXISTS source_template_id uuid;
ALTER TABLE research_project ADD COLUMN IF NOT EXISTS completion_title text;
ALTER TABLE research_project ADD COLUMN IF NOT EXISTS completion_message text;
ALTER TABLE research_project ADD COLUMN IF NOT EXISTS completion_redirect_url text;
ALTER TABLE research_project ADD COLUMN IF NOT EXISTS created_by uuid;

-- ─── STEP 5: Add missing columns to questionnaire ────────────
ALTER TABLE questionnaire ADD COLUMN IF NOT EXISTS display_mode text DEFAULT 'all_at_once';
ALTER TABLE questionnaire ADD COLUMN IF NOT EXISTS questions_per_page integer DEFAULT 10;
ALTER TABLE questionnaire ADD COLUMN IF NOT EXISTS is_template boolean DEFAULT false;
ALTER TABLE questionnaire ADD COLUMN IF NOT EXISTS template_is_public_or_private boolean DEFAULT false;
ALTER TABLE questionnaire ADD COLUMN IF NOT EXISTS template_category text;
ALTER TABLE questionnaire ADD COLUMN IF NOT EXISTS source_template_id uuid;
ALTER TABLE questionnaire ADD COLUMN IF NOT EXISTS created_by uuid;

-- ─── STEP 6: Add missing column to enrollment ────────────────
ALTER TABLE enrollment ADD COLUMN IF NOT EXISTS ecogram_last_updated timestamptz;
ALTER TABLE enrollment ADD COLUMN IF NOT EXISTS participant_type_id uuid;

-- ─── STEP 7: Create app_tab table ────────────────────────────
CREATE TABLE IF NOT EXISTS app_tab (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES research_project(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Home',
  icon text DEFAULT 'Home',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_app_tab_project ON app_tab(project_id);

-- ─── STEP 8: Create app_tab_element table ────────────────────
CREATE TABLE IF NOT EXISTS app_tab_element (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tab_id uuid NOT NULL REFERENCES app_tab(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES research_project(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'questionnaire',
  order_index integer NOT NULL DEFAULT 0,
  questionnaire_id uuid,
  title text,
  content text,
  visible boolean DEFAULT true,
  participant_types text[],
  width text DEFAULT '100%',
  style_padding text,
  style_background text,
  style_border_radius text,
  style_height text,
  button_action text,
  button_label text,
  image_url text,
  show_question_count boolean DEFAULT false,
  show_estimated_time boolean DEFAULT false,
  consent_text text,
  screening_criteria text,
  progress_style text DEFAULT 'bar',
  timeline_start_hour integer,
  timeline_end_hour integer,
  timeline_days integer,
  todo_layout text DEFAULT 'horizontal',
  todo_auto_scroll boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_app_tab_element_tab ON app_tab_element(tab_id);
CREATE INDEX IF NOT EXISTS idx_app_tab_element_project ON app_tab_element(project_id);

-- ─── STEP 9: Create app_element child tables ─────────────────
CREATE TABLE IF NOT EXISTS app_element_todo_card (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  element_id uuid NOT NULL REFERENCES app_tab_element(id) ON DELETE CASCADE,
  type text DEFAULT 'questionnaire',
  questionnaire_id uuid,
  title text,
  description text,
  completion_trigger text DEFAULT 'manual',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_app_element_todo_card_element ON app_element_todo_card(element_id);

CREATE TABLE IF NOT EXISTS app_element_help_section (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  element_id uuid NOT NULL REFERENCES app_tab_element(id) ON DELETE CASCADE,
  title text,
  content text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_app_element_help_section_element ON app_element_help_section(element_id);

CREATE TABLE IF NOT EXISTS app_element_tab_section (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  element_id uuid NOT NULL REFERENCES app_tab_element(id) ON DELETE CASCADE,
  label text,
  question_ids text[],
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_app_element_tab_section_element ON app_element_tab_section(element_id);

-- ─── STEP 10: Create enrollment_dnd_period table ─────────────
CREATE TABLE IF NOT EXISTS enrollment_dnd_period (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES enrollment(id) ON DELETE CASCADE,
  questionnaire_id uuid NOT NULL,
  start_time text NOT NULL DEFAULT '22:00',
  end_time text NOT NULL DEFAULT '07:00',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_enrollment_dnd_period_enrollment ON enrollment_dnd_period(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_dnd_period_questionnaire ON enrollment_dnd_period(questionnaire_id);

-- Migrate existing dnd_setting data
DO $$
DECLARE
  enr RECORD;
  q_id TEXT;
  period JSONB;
  period_idx INTEGER;
BEGIN
  FOR enr IN SELECT id, dnd_setting FROM enrollment WHERE dnd_setting IS NOT NULL AND dnd_setting != '{}'::jsonb AND dnd_setting != 'null'::jsonb
  LOOP
    FOR q_id IN SELECT jsonb_object_keys(enr.dnd_setting)
    LOOP
      IF enr.dnd_setting->q_id ? 'dnd_periods' THEN
        period_idx := 0;
        FOR period IN SELECT * FROM jsonb_array_elements(enr.dnd_setting->q_id->'dnd_periods')
        LOOP
          INSERT INTO enrollment_dnd_period (enrollment_id, questionnaire_id, start_time, end_time, order_index)
          VALUES (enr.id, q_id::uuid, COALESCE(period->>'start', '22:00'), COALESCE(period->>'end', '07:00'), period_idx);
          period_idx := period_idx + 1;
        END LOOP;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- ─── STEP 11: Create enrollment_profile_response table ───────
CREATE TABLE IF NOT EXISTS enrollment_profile_response (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES enrollment(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  response_value text,
  response_type text NOT NULL DEFAULT 'profile',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_enrollment_profile_response_enrollment ON enrollment_profile_response(enrollment_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollment_profile_response_unique ON enrollment_profile_response(enrollment_id, question_id, response_type);

-- Migrate existing profile_data
DO $$
DECLARE
  enr RECORD;
  q_key TEXT;
BEGIN
  FOR enr IN SELECT id, profile_data FROM enrollment WHERE profile_data IS NOT NULL AND profile_data != '{}'::jsonb AND profile_data != 'null'::jsonb
  LOOP
    FOR q_key IN SELECT jsonb_object_keys(enr.profile_data)
    LOOP
      INSERT INTO enrollment_profile_response (enrollment_id, question_id, response_value, response_type)
      VALUES (enr.id, q_key, enr.profile_data->>q_key, 'profile')
      ON CONFLICT (enrollment_id, question_id, response_type) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Migrate existing enrollment_data
DO $$
DECLARE
  enr RECORD;
  q_key TEXT;
BEGIN
  FOR enr IN SELECT id, enrollment_data FROM enrollment WHERE enrollment_data IS NOT NULL AND enrollment_data != '{}'::jsonb AND enrollment_data != 'null'::jsonb
  LOOP
    FOR q_key IN SELECT jsonb_object_keys(enr.enrollment_data)
    LOOP
      INSERT INTO enrollment_profile_response (enrollment_id, question_id, response_value, response_type)
      VALUES (enr.id, q_key, enr.enrollment_data->>q_key, 'enrollment')
      ON CONFLICT (enrollment_id, question_id, response_type) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- ─── STEP 12: Create ecogram_member table ────────────────────
CREATE TABLE IF NOT EXISTS ecogram_member (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid REFERENCES enrollment(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  relationship text NOT NULL DEFAULT 'other',
  age integer,
  gender text,
  distance text DEFAULT 'same_city',
  custom_distance text,
  frequency text DEFAULT 'weekly',
  importance integer DEFAULT 50,
  pos_x numeric DEFAULT 0,
  pos_y numeric DEFAULT 0,
  circle integer DEFAULT 1,
  line_style text DEFAULT 'solid',
  arrow_direction text DEFAULT 'both',
  support_types text[] DEFAULT '{}',
  custom_adl text,
  custom_iadl text,
  custom_maintenance text,
  custom_other text,
  color text DEFAULT '#6B7280',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT ecogram_member_owner CHECK (enrollment_id IS NOT NULL OR profile_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_ecogram_member_enrollment ON ecogram_member(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_ecogram_member_profile ON ecogram_member(profile_id);

-- ─── STEP 13: Create questionnaire_time_window table ─────────
CREATE TABLE IF NOT EXISTS questionnaire_time_window (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id uuid NOT NULL REFERENCES questionnaire(id) ON DELETE CASCADE,
  start_time text NOT NULL DEFAULT '09:00',
  end_time text NOT NULL DEFAULT '21:00',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_questionnaire_time_window_questionnaire ON questionnaire_time_window(questionnaire_id);

-- Migrate existing time_windows data
DO $$
DECLARE
  q RECORD;
  tw JSONB;
  tw_idx INTEGER;
BEGIN
  FOR q IN SELECT id, time_windows FROM questionnaire WHERE time_windows IS NOT NULL AND time_windows != '[]'::jsonb AND time_windows != 'null'::jsonb
  LOOP
    tw_idx := 0;
    FOR tw IN SELECT * FROM jsonb_array_elements(q.time_windows)
    LOOP
      INSERT INTO questionnaire_time_window (questionnaire_id, start_time, end_time, order_index)
      VALUES (q.id, COALESCE(tw->>'start', '09:00'), COALESCE(tw->>'end', '21:00'), tw_idx);
      tw_idx := tw_idx + 1;
    END LOOP;
  END LOOP;
END $$;

-- ─── STEP 14: Fix survey_response column names ──────────────
-- PRD says answer_text, answer_number, answer_array, answer_json
-- DB currently has response_text, response_value, etc.
ALTER TABLE survey_response ADD COLUMN IF NOT EXISTS answer_text text;
ALTER TABLE survey_response ADD COLUMN IF NOT EXISTS answer_number numeric;
ALTER TABLE survey_response ADD COLUMN IF NOT EXISTS answer_array text[];
ALTER TABLE survey_response ADD COLUMN IF NOT EXISTS answer_json jsonb;

-- Copy existing data to new column names
UPDATE survey_response SET answer_text = response_text WHERE response_text IS NOT NULL AND answer_text IS NULL;
UPDATE survey_response SET answer_number = response_value::numeric WHERE response_value IS NOT NULL AND answer_number IS NULL;

-- ─── STEP 15: RLS on all new tables ─────────────────────────
ALTER TABLE app_tab ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_tab_element ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_element_todo_card ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_element_help_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_element_tab_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment_dnd_period ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment_profile_response ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecogram_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_time_window ENABLE ROW LEVEL SECURITY;

-- Authenticated users can CRUD
CREATE POLICY "Allow authenticated access" ON app_tab FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access" ON app_tab_element FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access" ON app_element_todo_card FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access" ON app_element_help_section FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access" ON app_element_tab_section FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access" ON enrollment_dnd_period FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access" ON enrollment_profile_response FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access" ON ecogram_member FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access" ON questionnaire_time_window FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Anon users can read
CREATE POLICY "Allow anon read" ON app_tab FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON app_tab_element FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON app_element_todo_card FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON app_element_help_section FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON app_element_tab_section FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON enrollment_dnd_period FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON enrollment_profile_response FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON ecogram_member FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON questionnaire_time_window FOR SELECT TO anon USING (true);

-- ─── STEP 16: Expose new tables in PostgREST (care_connector schema) ─
-- PostgREST auto-discovers tables in the schema, but we need to grant usage
GRANT USAGE ON SCHEMA care_connector TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA care_connector TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA care_connector TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA care_connector TO authenticated;
