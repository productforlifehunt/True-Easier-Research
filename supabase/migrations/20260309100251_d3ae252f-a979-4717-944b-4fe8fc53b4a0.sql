
-- Add new cfg_ columns for rich media and UX research question types
-- Video/Audio/Embed config
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_video_url text;
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_audio_url text;
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_embed_url text;
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_embed_type text;
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_autoplay boolean DEFAULT false;
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_loop boolean DEFAULT false;
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_muted boolean DEFAULT true;
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_poster_url text;
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_media_type text;
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_embed_height text DEFAULT '400px';
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_allow_fullscreen boolean DEFAULT true;

-- Card Sort config
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_cards text[];
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_categories text[];
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_sort_type text DEFAULT 'open';

-- Tree Test config
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_tree_data jsonb;
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_task_description text;
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_correct_answer text;

-- First Click / 5-Second Test config
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_test_image_url text;
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_test_duration integer DEFAULT 5;
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_followup_question text;

-- Preference Test config
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_variant_a_url text;
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_variant_a_label text;
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_variant_b_url text;
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_variant_b_label text;

-- Prototype Test config
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_prototype_url text;
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_prototype_platform text DEFAULT 'figma';
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_task_list jsonb;

-- A/B Test questionnaire-level columns
ALTER TABLE care_connector.questionnaire ADD COLUMN IF NOT EXISTS is_ab_test boolean DEFAULT false;
ALTER TABLE care_connector.questionnaire ADD COLUMN IF NOT EXISTS ab_variant_name text;
ALTER TABLE care_connector.questionnaire ADD COLUMN IF NOT EXISTS ab_group_id text;
ALTER TABLE care_connector.questionnaire ADD COLUMN IF NOT EXISTS ab_split_percentage integer DEFAULT 50;
