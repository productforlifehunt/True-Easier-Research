-- Add consent form fields to research_projects table
ALTER TABLE research_projects 
ADD COLUMN consent_required BOOLEAN DEFAULT FALSE,
ADD COLUMN consent_form_url TEXT,
ADD COLUMN consent_form_text TEXT;

-- Create consent_records table to track participant consent
CREATE TABLE IF NOT EXISTS consent_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consent_given BOOLEAN NOT NULL DEFAULT TRUE,
  consent_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  UNIQUE(project_id, participant_id)
);

-- Add RLS policies for consent_records
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own consent records
CREATE POLICY "Users can view own consent records"
  ON consent_records
  FOR SELECT
  USING (participant_id = auth.uid());

-- Allow users to insert their own consent records
CREATE POLICY "Users can insert own consent records"
  ON consent_records
  FOR INSERT
  WITH CHECK (participant_id = auth.uid());

-- Allow researchers to view consent records for their projects
CREATE POLICY "Researchers can view consent records for their projects"
  ON consent_records
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM research_projects WHERE researcher_id = auth.uid()
    )
  );

-- Create index for faster lookups
CREATE INDEX idx_consent_records_project_participant 
  ON consent_records(project_id, participant_id);

CREATE INDEX idx_consent_records_participant 
  ON consent_records(participant_id);
