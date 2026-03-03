-- Migration: Flatten question_config JSONB into flat columns on question table
-- Date: 2026-03-03
-- Summary: Add cfg_* columns to question table mirroring all known question_config keys.
-- The app writes both question_config JSONB and cfg_* columns during transition.
-- On read, cfg_* columns take priority over question_config JSONB values.

-- ═══════════════════════════════════════════════════════════════
-- 1. Add flat config columns to question table
-- ═══════════════════════════════════════════════════════════════

-- Text config
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_max_length integer;

-- Choice config
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_allow_other boolean;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_allow_none boolean;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_allow_multiple boolean;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_columns text;  -- JSON string for matrix columns array, or int-as-text for checkbox_group
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_custom_labels text;  -- JSON string for likert custom labels array

-- Scale config
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_min_value numeric;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_max_value numeric;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_min numeric;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_max numeric;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_step numeric;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_min_label text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_max_label text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_show_value_labels boolean;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_scale_type text;

-- Yes/No config
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_yes_label text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_no_label text;

-- File upload config
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_max_files integer;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_max_size_mb integer;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_accepted_types text;

-- Image block config
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_image_url text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_alt_text text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_max_width text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_caption text;

-- Section header config
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_section_color text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_section_icon text;

-- Text block / content config
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_content text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_content_type text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_font_size text;

-- Style config
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_color text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_thickness text;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_style text;

-- Screening config
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_disqualify_value text;

-- Response config
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_response_required text;

-- Questionnaire reference
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_questionnaire_id uuid;

-- Inline options (rare, for some question types)
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_options text;  -- JSON string for inline options array

-- AI config on question level
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_allow_ai_assist boolean;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_allow_ai_auto_answer boolean;
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_allow_voice boolean;

-- ═══════════════════════════════════════════════════════════════
-- 2. Migrate existing question_config JSONB data to flat columns
-- ═══════════════════════════════════════════════════════════════
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

-- ═══════════════════════════════════════════════════════════════
-- 3. Drop question_config JSONB column (optional — uncomment when ready)
-- ═══════════════════════════════════════════════════════════════
-- ALTER TABLE question DROP COLUMN IF EXISTS question_config;
