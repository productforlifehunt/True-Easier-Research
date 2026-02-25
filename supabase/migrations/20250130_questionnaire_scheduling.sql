-- Create questionnaires table for longitudinal surveys
CREATE TABLE IF NOT EXISTS questionnaires (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimated_duration INTEGER, -- in minutes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create questionnaire_schedule table for timeline scheduling
CREATE TABLE IF NOT EXISTS questionnaire_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  questionnaire_id UUID NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL, -- Day 1, Day 2, etc. in study
  scheduled_time TIME NOT NULL, -- Time of day (e.g., 09:00, 14:00)
  notification_enabled BOOLEAN DEFAULT TRUE,
  notification_minutes_before INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, questionnaire_id, day_number, scheduled_time)
);

-- Create indexes for performance
CREATE INDEX idx_questionnaires_project ON questionnaires(project_id);
CREATE INDEX idx_schedule_project ON questionnaire_schedule(project_id);
CREATE INDEX idx_schedule_day ON questionnaire_schedule(project_id, day_number);

-- Add RLS policies
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_schedule ENABLE ROW LEVEL SECURITY;

-- Questionnaires policies
CREATE POLICY "Researchers can manage their questionnaires"
  ON questionnaires
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM research_projects WHERE researcher_id = auth.uid()
    )
  );

CREATE POLICY "Participants can view questionnaires for enrolled projects"
  ON questionnaires
  FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM enrollments WHERE participant_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Schedule policies
CREATE POLICY "Researchers can manage their schedules"
  ON questionnaire_schedule
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM research_projects WHERE researcher_id = auth.uid()
    )
  );

CREATE POLICY "Participants can view schedules for enrolled projects"
  ON questionnaire_schedule
  FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM enrollments WHERE participant_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );
