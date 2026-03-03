-- Migration: Flatten ALL remaining JSONB fields across the entire app
-- Date: 2026-03-03
-- Summary:
--   1. validation_rule on question → flat vr_* columns
--   2. dnd_setting on enrollment → enrollment_dnd_period table
--   3. profile_data on enrollment → enrollment_profile_response table
--   4. ecogram_data on enrollment/profiles → ecogram_member table
--   5. time_windows on questionnaire → questionnaire_time_window table
--   6. enrollment_data on enrollment → audit if still needed

-- ═══════════════════════════════════════════════════════════════
-- 1. Flatten validation_rule (8 known keys) on question table
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE question ADD COLUMN IF NOT EXISTS vr_min_length integer;
ALTER TABLE question ADD COLUMN IF NOT EXISTS vr_max_length integer;
ALTER TABLE question ADD COLUMN IF NOT EXISTS vr_min_value numeric;
ALTER TABLE question ADD COLUMN IF NOT EXISTS vr_max_value numeric;
ALTER TABLE question ADD COLUMN IF NOT EXISTS vr_min numeric;
ALTER TABLE question ADD COLUMN IF NOT EXISTS vr_max numeric;
ALTER TABLE question ADD COLUMN IF NOT EXISTS vr_allow_future_dates boolean;
ALTER TABLE question ADD COLUMN IF NOT EXISTS vr_allow_past_dates boolean;

-- Migrate existing data
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

-- ═══════════════════════════════════════════════════════════════
-- 2. Flatten dnd_setting → enrollment_dnd_period table
--    Was: { [questionnaire_id]: { dnd_periods: [{start, end}] } }
--    Now: one row per DND period per questionnaire per enrollment
-- ═══════════════════════════════════════════════════════════════
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
          VALUES (
            enr.id,
            q_id::uuid,
            COALESCE(period->>'start', '22:00'),
            COALESCE(period->>'end', '07:00'),
            period_idx
          );
          period_idx := period_idx + 1;
        END LOOP;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- 3. Flatten profile_data → enrollment_profile_response table
--    Was: { [question_id]: response_value }
--    Now: one row per response per enrollment
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS enrollment_profile_response (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES enrollment(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  response_value text,
  response_type text NOT NULL DEFAULT 'profile',  -- 'profile' or 'enrollment'
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

-- Migrate existing enrollment_data (same structure as profile_data but type='enrollment')
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

-- ═══════════════════════════════════════════════════════════════
-- 4. Flatten ecogram_data → ecogram_member table
--    Was: { members: [EcogramMember...], lastUpdated }
--    Now: one row per member, plus last_updated column on enrollment
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE enrollment ADD COLUMN IF NOT EXISTS ecogram_last_updated timestamptz;

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

-- Migrate existing ecogram_data from enrollment
DO $$
DECLARE
  enr RECORD;
  member JSONB;
  member_idx INTEGER;
BEGIN
  FOR enr IN SELECT id, ecogram_data FROM enrollment WHERE ecogram_data IS NOT NULL AND ecogram_data != '{}'::jsonb AND ecogram_data != 'null'::jsonb
  LOOP
    IF enr.ecogram_data ? 'lastUpdated' THEN
      UPDATE enrollment SET ecogram_last_updated = (enr.ecogram_data->>'lastUpdated')::timestamptz WHERE id = enr.id;
    END IF;
    IF enr.ecogram_data ? 'members' THEN
      member_idx := 0;
      FOR member IN SELECT * FROM jsonb_array_elements(enr.ecogram_data->'members')
      LOOP
        INSERT INTO ecogram_member (
          enrollment_id, name, relationship, age, gender, distance, custom_distance,
          frequency, importance, pos_x, pos_y, circle, line_style, arrow_direction,
          support_types, custom_adl, custom_iadl, custom_maintenance, custom_other,
          color, order_index
        ) VALUES (
          enr.id,
          COALESCE(member->>'name', ''),
          COALESCE(member->>'relationship', 'other'),
          (member->>'age')::integer,
          member->>'gender',
          COALESCE(member->>'distance', 'same_city'),
          member->>'customDistance',
          COALESCE(member->>'frequency', 'weekly'),
          COALESCE((member->>'importance')::integer, 50),
          COALESCE((member->>'x')::numeric, 0),
          COALESCE((member->>'y')::numeric, 0),
          COALESCE((member->>'circle')::integer, 1),
          COALESCE(member->>'lineStyle', 'solid'),
          COALESCE(member->>'arrowDirection', 'both'),
          CASE WHEN member ? 'supportTypes'
            THEN ARRAY(SELECT jsonb_array_elements_text(member->'supportTypes'))
            ELSE '{}'::text[] END,
          member->>'customADL',
          member->>'customIADL',
          member->>'customMaintenance',
          member->>'customOther',
          COALESCE(member->>'color', '#6B7280'),
          member_idx
        );
        member_idx := member_idx + 1;
      END LOOP;
    END IF;
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- 5. Flatten time_windows on questionnaire → questionnaire_time_window table
--    Was: [{start: '08:00', end: '22:00'}]
--    Now: one row per window per questionnaire
-- ═══════════════════════════════════════════════════════════════
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

-- ═══════════════════════════════════════════════════════════════
-- 6. RLS on new tables
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE enrollment_dnd_period ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment_profile_response ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecogram_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_time_window ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated access" ON enrollment_dnd_period FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access" ON enrollment_profile_response FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access" ON ecogram_member FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access" ON questionnaire_time_window FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read" ON enrollment_dnd_period FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON enrollment_profile_response FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON ecogram_member FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON questionnaire_time_window FOR SELECT TO anon USING (true);

-- ═══════════════════════════════════════════════════════════════
-- 7. Drop old JSONB columns (optional — uncomment when ready)
-- ═══════════════════════════════════════════════════════════════
-- ALTER TABLE question DROP COLUMN IF EXISTS validation_rule;
-- ALTER TABLE enrollment DROP COLUMN IF EXISTS dnd_setting;
-- ALTER TABLE enrollment DROP COLUMN IF EXISTS profile_data;
-- ALTER TABLE enrollment DROP COLUMN IF EXISTS ecogram_data;
-- ALTER TABLE enrollment DROP COLUMN IF EXISTS enrollment_data;
-- ALTER TABLE questionnaire DROP COLUMN IF EXISTS time_windows;
