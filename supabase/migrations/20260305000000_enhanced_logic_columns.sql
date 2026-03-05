-- Enhanced logic system: add compound conditions, calculation, piping, validation, cross-questionnaire columns
-- All new columns are nullable/optional — existing rules continue to work unchanged

-- Compound condition fields
ALTER TABLE care_connector.research_logic ADD COLUMN IF NOT EXISTS condition_group text;
ALTER TABLE care_connector.research_logic ADD COLUMN IF NOT EXISTS group_operator text DEFAULT 'and';

-- Advanced action fields
ALTER TABLE care_connector.research_logic ADD COLUMN IF NOT EXISTS calculation_formula text;
ALTER TABLE care_connector.research_logic ADD COLUMN IF NOT EXISTS piping_template text;
ALTER TABLE care_connector.research_logic ADD COLUMN IF NOT EXISTS validation_regex text;
ALTER TABLE care_connector.research_logic ADD COLUMN IF NOT EXISTS error_message text;

-- Cross-questionnaire fields
ALTER TABLE care_connector.research_logic ADD COLUMN IF NOT EXISTS cross_questionnaire boolean DEFAULT false;
ALTER TABLE care_connector.research_logic ADD COLUMN IF NOT EXISTS target_questionnaire_id uuid REFERENCES care_connector.questionnaire(id);

-- Metadata
ALTER TABLE care_connector.research_logic ADD COLUMN IF NOT EXISTS description text;

-- Make questionnaire_id nullable for cross-questionnaire rules
ALTER TABLE care_connector.research_logic ALTER COLUMN questionnaire_id DROP NOT NULL;
