-- EasyResearch Core Schema - Matches Frontend Table Names
-- Fixes schema drift between migrations and frontend code

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations (frontend uses .from('organization'))
CREATE TABLE IF NOT EXISTS care_connector.organization (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT,
  subscription_current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Researchers (frontend uses .from('researcher'))
CREATE TABLE IF NOT EXISTS care_connector.researcher (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES care_connector.organization(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'researcher',
  permission JSONB DEFAULT '{}',
  -- Settings columns (matches SettingsPage.tsx load logic)
  email_notifications BOOLEAN DEFAULT true,
  response_alerts BOOLEAN DEFAULT true,
  weekly_digest BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- Research Projects (frontend uses .from('research_project'))
CREATE TABLE IF NOT EXISTS care_connector.research_project (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES care_connector.organization(id) ON DELETE CASCADE,
  researcher_id UUID NOT NULL REFERENCES care_connector.researcher(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  project_type TEXT DEFAULT 'survey',
  methodology_type TEXT DEFAULT 'single_survey',
  status TEXT DEFAULT 'draft',
  survey_code TEXT UNIQUE,
  ai_enabled BOOLEAN DEFAULT false,
  voice_enabled BOOLEAN DEFAULT false,
  notification_enabled BOOLEAN DEFAULT true,
  setting JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Survey Questions (frontend uses .from('survey_question'))
CREATE TABLE IF NOT EXISTS care_connector.survey_question (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES care_connector.research_project(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL,
  question_text TEXT NOT NULL,
  required BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  question_config JSONB DEFAULT '{}',
  validation_rule JSONB DEFAULT '{}',
  logic_rule JSONB DEFAULT '{}',
  allow_voice BOOLEAN DEFAULT false,
  allow_ai_assist BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Question Options (frontend uses .from('question_option'))
CREATE TABLE IF NOT EXISTS care_connector.question_option (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES care_connector.survey_question(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollment (frontend uses .from('enrollment'))
CREATE TABLE IF NOT EXISTS care_connector.enrollment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES care_connector.research_project(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  participant_email TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  consent_signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, participant_email)
);

-- Survey Responses (frontend uses .from('survey_respons'))
CREATE TABLE IF NOT EXISTS care_connector.survey_respons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES care_connector.research_project(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES care_connector.enrollment(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES care_connector.survey_question(id) ON DELETE CASCADE,
  response_text TEXT,
  response_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Key indexes
CREATE INDEX IF NOT EXISTS idx_researcher_user_id ON care_connector.researcher(user_id);
CREATE INDEX IF NOT EXISTS idx_research_project_org_id ON care_connector.research_project(organization_id);
CREATE INDEX IF NOT EXISTS idx_survey_question_project_id ON care_connector.survey_question(project_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_project_id ON care_connector.enrollment(project_id);
CREATE INDEX IF NOT EXISTS idx_survey_respons_project_id ON care_connector.survey_respons(project_id);
