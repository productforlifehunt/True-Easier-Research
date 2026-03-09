
-- New cfg_* columns for MaxDiff, Design Survey, Heatmap question types
-- and questionnaire-level research features

-- MaxDiff columns on question table
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_items_per_set integer;
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_best_label text;
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_worst_label text;

-- Heatmap columns on question table
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_allow_multiple_clicks boolean DEFAULT false;
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_max_clicks integer DEFAULT 1;

-- Design Survey columns (multi-variant, uses options table for variants)
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_show_labels boolean DEFAULT true;
ALTER TABLE care_connector.question ADD COLUMN IF NOT EXISTS cfg_randomize_variants boolean DEFAULT false;

-- Questionnaire-level research features
ALTER TABLE care_connector.questionnaire ADD COLUMN IF NOT EXISTS randomize_questions boolean DEFAULT false;
ALTER TABLE care_connector.questionnaire ADD COLUMN IF NOT EXISTS enable_piping boolean DEFAULT false;
ALTER TABLE care_connector.questionnaire ADD COLUMN IF NOT EXISTS track_time_per_question boolean DEFAULT false;
