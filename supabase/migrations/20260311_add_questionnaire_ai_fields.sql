-- Add AI-related fields to questionnaire table
-- These fields control AI features at the questionnaire level

SET search_path TO care_connector;

-- Add AI feature toggle columns
ALTER TABLE questionnaire
ADD COLUMN IF NOT EXISTS ai_voice_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_chatbot_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_voice_all_questions boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_assist_all_questions boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_guidance text;

-- Add comment for documentation
COMMENT ON COLUMN questionnaire.ai_voice_enabled IS 'Enable voice input feature for this questionnaire';
COMMENT ON COLUMN questionnaire.ai_chatbot_enabled IS 'Enable AI chatbot assistant for this questionnaire';
COMMENT ON COLUMN questionnaire.ai_voice_all_questions IS 'When true, all questions inherit voice input capability';
COMMENT ON COLUMN questionnaire.ai_assist_all_questions IS 'When true, all questions get AI Support dropdown panel';
COMMENT ON COLUMN questionnaire.ai_guidance IS 'System prompt to guide AI behavior for this questionnaire';
