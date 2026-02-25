# EasyResearch Platform Architecture

## Vision
The most advanced, AI-powered, customizable medical research survey platform - surpassing SurveyMonkey with medical-specific features and AI capabilities.

## Core Architecture Principles

### 1. Multi-Tenancy Model
- **Shared Backend**: Use existing Supabase instance with care_connector schema
- **Shared Frontend Components**: Leverage existing React components
- **Data Isolation**: Research projects isolated by organization/researcher

### 2. User Roles & Permissions

#### Researchers (Primary Users)
- Create and manage surveys
- Configure question types and logic
- Set AI/voice features
- Manage participants
- View analytics and results
- Configure notifications
- Handle consent forms

#### Participants
- Take surveys
- View their survey history
- Manage notification preferences
- Access survey results (if permitted)

#### Organization Admins
- Manage multiple researchers
- Handle billing
- View usage analytics
- Manage team settings

### 3. Core Features

#### Survey Builder
- **Question Types**:
  - Single choice (radio)
  - Multiple choice (checkbox)
  - Text input (short/long)
  - Numeric input
  - Date/time picker
  - Likert scale
  - Matrix questions
  - File upload
  - Voice recording
  - AI-assisted responses

- **Logic & Branching**:
  - Conditional questions
  - Skip logic
  - Piping answers
  - Randomization
  - Question pools

- **Customization**:
  - Custom themes
  - Branding
  - Multi-language support
  - Accessibility options

#### AI Features (Premium)
- Smart question suggestions
- Response analysis
- Sentiment analysis
- Voice-to-text transcription
- Natural language processing
- Automated insights
- Predictive analytics

#### Notification System
- Email notifications
- Push notifications
- SMS (optional)
- Custom schedules
- Reminder sequences
- Do Not Disturb periods
- Escalation rules

#### Consent & Compliance
- IRB-compliant consent forms
- HIPAA compliance
- GDPR compliance
- Digital signatures
- Audit trails
- Version control

#### Recruitment Tools
- Participant pools
- Screening surveys
- Eligibility criteria
- Invitation management
- Compensation tracking
- Demographic targeting

#### Analytics Dashboard
- Real-time responses
- Completion rates
- Drop-off analysis
- Response patterns
- Export capabilities (CSV, PDF, SPSS)
- Custom reports
- API access

## Technical Implementation

### Database Schema Extensions

```sql
-- Organizations (new)
CREATE TABLE care_connector.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free', -- free, pro, enterprise
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Researchers (extend profiles)
CREATE TABLE care_connector.researchers (
  id UUID PRIMARY KEY REFERENCES care_connector.profiles(id),
  organization_id UUID REFERENCES care_connector.organizations(id),
  role TEXT DEFAULT 'researcher', -- admin, researcher, viewer
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Research Projects (surveys)
CREATE TABLE care_connector.research_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES care_connector.organizations(id),
  researcher_id UUID REFERENCES care_connector.researchers(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft', -- draft, active, paused, completed
  settings JSONB DEFAULT '{}', -- AI enabled, voice enabled, etc.
  consent_form JSONB,
  recruitment_criteria JSONB,
  notification_settings JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP,
  ends_at TIMESTAMP
);

-- Survey Questions
CREATE TABLE care_connector.survey_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES care_connector.research_projects(id),
  question_type TEXT NOT NULL, -- single_choice, multiple_choice, text, etc.
  question_text TEXT NOT NULL,
  question_config JSONB, -- options, validation, AI settings
  logic JSONB, -- skip logic, conditions
  order_index INTEGER,
  required BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Participant Enrollments
CREATE TABLE care_connector.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES care_connector.research_projects(id),
  participant_id UUID REFERENCES care_connector.profiles(id),
  status TEXT DEFAULT 'enrolled', -- enrolled, active, completed, withdrawn
  consent_signed_at TIMESTAMP,
  enrollment_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Survey Responses (extend existing)
ALTER TABLE care_connector.survey_entries 
ADD COLUMN project_id UUID REFERENCES care_connector.research_projects(id),
ADD COLUMN question_id UUID REFERENCES care_connector.survey_questions(id);

-- Billing & Usage
CREATE TABLE care_connector.usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES care_connector.organizations(id),
  metric_type TEXT, -- responses, ai_calls, storage
  quantity INTEGER,
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Frontend Architecture

```
/src
  /easyresearch
    /components
      /researcher
        - Dashboard.tsx
        - SurveyBuilder.tsx
        - QuestionEditor.tsx
        - LogicBuilder.tsx
        - Analytics.tsx
        - ParticipantManager.tsx
      /participant
        - SurveyList.tsx
        - SurveyTaking.tsx (reuse existing)
        - History.tsx
        - Results.tsx
      /shared
        - Navigation.tsx
        - OrganizationSelector.tsx
    /pages
      - ResearcherDashboard.tsx
      - CreateSurvey.tsx
      - ManageParticipants.tsx
      - Analytics.tsx
      - Settings.tsx
      - Billing.tsx
    /hooks
      - useOrganization.ts
      - useProjects.ts
      - useBilling.ts
```

## Pricing Strategy

### Free Tier
- 1 active survey
- 100 responses/month
- Basic question types
- Email notifications
- Basic analytics

### Pro ($49/month)
- Unlimited surveys
- 1,000 responses/month
- All question types
- AI features (100 credits)
- Advanced analytics
- Priority support

### Enterprise (Custom)
- Unlimited everything
- Custom AI training
- API access
- SSO/SAML
- Dedicated support
- HIPAA compliance

### Add-ons
- Extra AI credits: $10/100 credits
- Extra responses: $20/1,000
- SMS notifications: $0.02/message
- Phone support: $100/month

## Implementation Phases

### Phase 1: Core Platform (Week 1-2)
1. Database schema setup
2. Multi-tenant authentication
3. Researcher dashboard
4. Basic survey builder
5. Participant interface

### Phase 2: Advanced Features (Week 3-4)
1. AI integration
2. Voice features
3. Advanced logic builder
4. Notification system
5. Consent management

### Phase 3: Analytics & Billing (Week 5)
1. Analytics dashboard
2. Export capabilities
3. Stripe integration
4. Usage tracking
5. Billing management

### Phase 4: Polish & Launch (Week 6)
1. Landing page
2. Onboarding flow
3. Documentation
4. Testing & QA
5. Deployment

## Key Differentiators

1. **Medical Research Focus**: IRB templates, HIPAA compliance, medical terminology
2. **AI-First Design**: Not just an add-on, deeply integrated
3. **Voice Capabilities**: Essential for accessibility
4. **Flexible Notifications**: Multiple DND periods, custom schedules
5. **Researcher Collaboration**: Team features, shared projects
6. **Participant Experience**: Beautiful UI, mobile-first
7. **Real-time Analytics**: Live dashboard, instant insights
8. **API-First**: Full API for integrations

## Success Metrics

- Researcher acquisition rate
- Survey completion rates
- AI feature usage
- Revenue per researcher
- Platform uptime
- Response time
- User satisfaction (NPS)

## Risk Mitigation

1. **Data Security**: End-to-end encryption, regular audits
2. **Scalability**: Prepared for 10,000+ concurrent users
3. **Compliance**: Legal review for HIPAA, GDPR
4. **Competition**: Continuous feature innovation
5. **User Adoption**: Smooth migration from existing platform
