
-- Custom Function Elements table / 定制功能部件表
-- Stores private/public custom elements that can be placed in the Layout Builder
CREATE TABLE care_connector.custom_function_element (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name_en TEXT NOT NULL DEFAULT 'Custom Element',
  name_zh TEXT NOT NULL DEFAULT '定制部件',
  description_en TEXT,
  description_zh TEXT,
  icon TEXT DEFAULT 'Sparkles',
  element_config JSONB DEFAULT '{}'::jsonb,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE care_connector.custom_function_element ENABLE ROW LEVEL SECURITY;

-- Policy: users can see their own private elements + all public elements
CREATE POLICY "Users can view own and public elements"
  ON care_connector.custom_function_element
  FOR SELECT
  TO authenticated
  USING (is_public = true OR user_id = auth.uid());

-- Policy: users can insert their own elements (admin use)
CREATE POLICY "Users can insert own elements"
  ON care_connector.custom_function_element
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: users can update their own elements
CREATE POLICY "Users can update own elements"
  ON care_connector.custom_function_element
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Insert a demo private element for the test user (dementia study package)
INSERT INTO care_connector.custom_function_element (
  user_id,
  name_en,
  name_zh,
  description_en,
  description_zh,
  icon,
  element_config,
  is_public
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'guowei.jiang.work@gmail.com' LIMIT 1),
  'Dementia Caregiver Study Suite',
  '痴呆症照护者研究套件',
  'Complete research package: ESM diary, end-of-day survey, caregiver profiles, ecogram, and timeline — pre-configured for longitudinal caregiver research.',
  '完整研究套件：ESM日记、每日结束问卷、照护者档案、生态图和时间线——为纵向照护者研究预配置。',
  'Layers',
  '{"type": "research_suite", "includes": ["esm_diary", "end_of_day_survey", "caregiver_profiles", "ecogram", "timeline"], "study_duration_days": 7, "participant_roles": ["primary_caregiver", "other_caregiver"]}'::jsonb,
  false
);
