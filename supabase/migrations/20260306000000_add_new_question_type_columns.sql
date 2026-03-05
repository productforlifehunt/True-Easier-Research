-- Migration: Add cfg_* columns for new question types (constant_sum, address)
-- Date: 2026-03-06
-- Types affected: constant_sum (cfg_total), address (cfg_show_country)
-- Note: signature and slider_range reuse existing columns (no new columns needed)

-- Constant sum: the fixed total participants must distribute
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_total integer;

-- Address: whether to show the country field
ALTER TABLE question ADD COLUMN IF NOT EXISTS cfg_show_country boolean;

-- Back-fill from question_config JSONB (if any rows already have these keys)
UPDATE question SET
  cfg_total = (question_config->>'total')::integer,
  cfg_show_country = (question_config->>'show_country')::boolean
WHERE question_config IS NOT NULL
  AND question_config != '{}'::jsonb
  AND (question_config ? 'total' OR question_config ? 'show_country');
