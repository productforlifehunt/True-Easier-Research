-- Add Design Thinking Workshop fields to survey_entries
-- These fields enable affinity mapping, canvas positioning, and interview annotations

-- Interview tags for marking entries during discussion (stored as JSON array)
ALTER TABLE care_connector.survey_entries 
ADD COLUMN IF NOT EXISTS interview_tags TEXT[] DEFAULT '{}';

-- AI-generated category based on entry content
ALTER TABLE care_connector.survey_entries 
ADD COLUMN IF NOT EXISTS ai_category TEXT;

-- Cluster ID for affinity mapping / grouping
ALTER TABLE care_connector.survey_entries 
ADD COLUMN IF NOT EXISTS cluster_id INTEGER;

-- Canvas positioning for drag-and-drop interface
ALTER TABLE care_connector.survey_entries 
ADD COLUMN IF NOT EXISTS canvas_position_x FLOAT DEFAULT 0;

ALTER TABLE care_connector.survey_entries 
ADD COLUMN IF NOT EXISTS canvas_position_y FLOAT DEFAULT 0;

-- Interviewer notes per entry (separate from participant data)
ALTER TABLE care_connector.survey_entries 
ADD COLUMN IF NOT EXISTS interview_notes TEXT;

-- Create clusters table for custom affinity mapping groups
CREATE TABLE IF NOT EXISTS care_connector.interview_clusters (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_zh TEXT,
  color TEXT DEFAULT '#10B981',
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_survey_entries_ai_category ON care_connector.survey_entries(ai_category);
CREATE INDEX IF NOT EXISTS idx_survey_entries_cluster_id ON care_connector.survey_entries(cluster_id);
CREATE INDEX IF NOT EXISTS idx_interview_clusters_user_id ON care_connector.interview_clusters(user_id);

-- Add comments for documentation
COMMENT ON COLUMN care_connector.survey_entries.interview_tags IS 'Tags added during interview: pain_point, insight, follow_up, opportunity, unmet_need';
COMMENT ON COLUMN care_connector.survey_entries.ai_category IS 'Auto-categorized: physical_care, communication, coordination, information, emotional, tools, support';
COMMENT ON COLUMN care_connector.survey_entries.cluster_id IS 'References interview_clusters for affinity mapping';
COMMENT ON COLUMN care_connector.survey_entries.canvas_position_x IS 'X position on design thinking canvas (0-1000)';
COMMENT ON COLUMN care_connector.survey_entries.canvas_position_y IS 'Y position on design thinking canvas (0-1000)';
COMMENT ON COLUMN care_connector.survey_entries.interview_notes IS 'Interviewer notes added during discussion';
