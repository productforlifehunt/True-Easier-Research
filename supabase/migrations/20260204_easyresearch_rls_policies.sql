-- EasyResearch RLS Policies - Data Isolation & Security
-- Ensures users can only access data within their organization

-- Enable RLS on all EasyResearch tables
ALTER TABLE care_connector.organization ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_connector.researcher ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_connector.research_project ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_connector.survey_question ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_connector.question_option ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_connector.enrollment ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_connector.survey_respons ENABLE ROW LEVEL SECURITY;

-- ================================
-- ORGANIZATION POLICIES
-- ================================

-- Users can view their own organization
CREATE POLICY "Users can view own organization" ON care_connector.organization
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM care_connector.researcher WHERE user_id = auth.uid()
    )
  );

-- Organization admins can update their organization
CREATE POLICY "Admins can update own organization" ON care_connector.organization
  FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM care_connector.researcher 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ================================
-- RESEARCHER POLICIES
-- ================================

-- Users can view researchers in their organization
CREATE POLICY "Users can view researchers in own org" ON care_connector.researcher
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM care_connector.researcher WHERE user_id = auth.uid()
    )
  );

-- Users can view/update their own researcher profile
CREATE POLICY "Users can manage own researcher profile" ON care_connector.researcher
  FOR ALL
  USING (user_id = auth.uid());

-- Users can create researcher profiles (for registration)
CREATE POLICY "Users can create researcher profile" ON care_connector.researcher
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ================================
-- RESEARCH PROJECT POLICIES
-- ================================

-- Researchers can view projects in their organization
CREATE POLICY "Researchers can view org projects" ON care_connector.research_project
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM care_connector.researcher WHERE user_id = auth.uid()
    )
  );

-- Researchers can create projects in their organization
CREATE POLICY "Researchers can create projects" ON care_connector.research_project
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM care_connector.researcher WHERE user_id = auth.uid()
    )
    AND researcher_id IN (
      SELECT id FROM care_connector.researcher WHERE user_id = auth.uid()
    )
  );

-- Project owners and admins can update projects
CREATE POLICY "Project owners can update projects" ON care_connector.research_project
  FOR UPDATE
  USING (
    researcher_id IN (
      SELECT id FROM care_connector.researcher WHERE user_id = auth.uid()
    )
    OR organization_id IN (
      SELECT organization_id FROM care_connector.researcher 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Project owners can delete projects
CREATE POLICY "Project owners can delete projects" ON care_connector.research_project
  FOR DELETE
  USING (
    researcher_id IN (
      SELECT id FROM care_connector.researcher WHERE user_id = auth.uid()
    )
  );

-- ================================
-- SURVEY QUESTION POLICIES
-- ================================

-- Researchers can view questions for projects in their org
CREATE POLICY "Researchers can view org questions" ON care_connector.survey_question
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM care_connector.research_project
      WHERE organization_id IN (
        SELECT organization_id FROM care_connector.researcher WHERE user_id = auth.uid()
      )
    )
  );

-- Researchers can manage questions for their projects
CREATE POLICY "Researchers can manage project questions" ON care_connector.survey_question
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM care_connector.research_project
      WHERE researcher_id IN (
        SELECT id FROM care_connector.researcher WHERE user_id = auth.uid()
      )
    )
  );

-- Participants can view questions for projects they're enrolled in
CREATE POLICY "Participants can view enrolled questions" ON care_connector.survey_question
  FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM care_connector.enrollment
      WHERE participant_id = auth.uid() AND status = 'active'
    )
  );

-- ================================
-- QUESTION OPTION POLICIES
-- ================================

-- Researchers can view options for questions in their org
CREATE POLICY "Researchers can view org question options" ON care_connector.question_option
  FOR SELECT
  USING (
    question_id IN (
      SELECT id FROM care_connector.survey_question
      WHERE project_id IN (
        SELECT id FROM care_connector.research_project
        WHERE organization_id IN (
          SELECT organization_id FROM care_connector.researcher WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Researchers can manage options for their project questions
CREATE POLICY "Researchers can manage project question options" ON care_connector.question_option
  FOR ALL
  USING (
    question_id IN (
      SELECT id FROM care_connector.survey_question
      WHERE project_id IN (
        SELECT id FROM care_connector.research_project
        WHERE researcher_id IN (
          SELECT id FROM care_connector.researcher WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Participants can view options for questions they can access
CREATE POLICY "Participants can view enrolled question options" ON care_connector.question_option
  FOR SELECT
  USING (
    question_id IN (
      SELECT id FROM care_connector.survey_question
      WHERE project_id IN (
        SELECT project_id FROM care_connector.enrollment
        WHERE participant_id = auth.uid() AND status = 'active'
      )
    )
  );

-- ================================
-- ENROLLMENT POLICIES
-- ================================

-- Researchers can view enrollments for their organization's projects
CREATE POLICY "Researchers can view org enrollments" ON care_connector.enrollment
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM care_connector.research_project
      WHERE organization_id IN (
        SELECT organization_id FROM care_connector.researcher WHERE user_id = auth.uid()
      )
    )
  );

-- Researchers can manage enrollments for their projects
CREATE POLICY "Researchers can manage project enrollments" ON care_connector.enrollment
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM care_connector.research_project
      WHERE researcher_id IN (
        SELECT id FROM care_connector.researcher WHERE user_id = auth.uid()
      )
    )
  );

-- Participants can view their own enrollments
CREATE POLICY "Participants can view own enrollments" ON care_connector.enrollment
  FOR SELECT
  USING (participant_id = auth.uid());

-- Participants can update their enrollment status (withdraw)
CREATE POLICY "Participants can update own enrollment" ON care_connector.enrollment
  FOR UPDATE
  USING (participant_id = auth.uid())
  WITH CHECK (participant_id = auth.uid());

-- Allow anonymous enrollment creation (for public surveys)
CREATE POLICY "Allow enrollment creation" ON care_connector.enrollment
  FOR INSERT
  WITH CHECK (true);

-- ================================
-- SURVEY RESPONSE POLICIES
-- ================================

-- Researchers can view responses for their organization's projects
CREATE POLICY "Researchers can view org responses" ON care_connector.survey_respons
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM care_connector.research_project
      WHERE organization_id IN (
        SELECT organization_id FROM care_connector.researcher WHERE user_id = auth.uid()
      )
    )
  );

-- Participants can view their own responses
CREATE POLICY "Participants can view own responses" ON care_connector.survey_respons
  FOR SELECT
  USING (
    enrollment_id IN (
      SELECT id FROM care_connector.enrollment WHERE participant_id = auth.uid()
    )
  );

-- Participants can create responses for their enrollments
CREATE POLICY "Participants can create responses" ON care_connector.survey_respons
  FOR INSERT
  WITH CHECK (
    enrollment_id IN (
      SELECT id FROM care_connector.enrollment 
      WHERE participant_id = auth.uid() AND status = 'active'
    )
  );

-- Allow anonymous response creation (for public surveys)
CREATE POLICY "Allow anonymous response creation" ON care_connector.survey_respons
  FOR INSERT
  WITH CHECK (true);

-- ================================
-- HELPER FUNCTIONS
-- ================================

-- Function to check if user is organization admin
CREATE OR REPLACE FUNCTION care_connector.is_org_admin(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM care_connector.researcher
    WHERE user_id = auth.uid() 
    AND organization_id = org_id 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
