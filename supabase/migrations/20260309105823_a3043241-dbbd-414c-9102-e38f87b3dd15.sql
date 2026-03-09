
-- Add cfg columns for Conjoint Analysis and Kano Model question types
-- Conjoint: attributes (jsonb[]), profiles per task, include_none_option
-- Kano: functional_question, dysfunctional_question paired rendering

ALTER TABLE care_connector.question
ADD COLUMN IF NOT EXISTS cfg_conjoint_attributes jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cfg_profiles_per_task int DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cfg_include_none_option boolean DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cfg_num_choice_tasks int DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cfg_kano_functional text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cfg_kano_dysfunctional text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cfg_kano_categories text[] DEFAULT NULL;

-- Add response quality columns on questionnaire table
ALTER TABLE care_connector.questionnaire
ADD COLUMN IF NOT EXISTS min_completion_time_seconds int DEFAULT NULL,
ADD COLUMN IF NOT EXISTS detect_straightlining boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS detect_gibberish boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_thank_you_message text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS redirect_url text DEFAULT NULL;

-- Add distribution columns on research_project table  
ALTER TABLE care_connector.research_project
ADD COLUMN IF NOT EXISTS embed_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_branding jsonb DEFAULT NULL;
