
-- Popup table: each popup belongs to a project, can link to a questionnaire/component for content
-- 弹窗表：每个弹窗属于一个项目，可链接到问卷/组件作为内容
CREATE TABLE care_connector.app_popup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES care_connector.research_project(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Popup',
  questionnaire_id UUID REFERENCES care_connector.questionnaire(id) ON DELETE SET NULL,
  content TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Popup rules: each popup can have multiple trigger rules
-- 弹窗规则：每个弹窗可以有多个触发规则
CREATE TABLE care_connector.app_popup_rule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  popup_id UUID NOT NULL REFERENCES care_connector.app_popup(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL DEFAULT 'first_open',
  trigger_value INTEGER DEFAULT 0,
  hide_after_close BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE care_connector.app_popup ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_connector.app_popup_rule ENABLE ROW LEVEL SECURITY;

-- RLS policies for app_popup
CREATE POLICY "Users can manage popups for their projects" ON care_connector.app_popup
  FOR ALL TO authenticated
  USING (
    project_id IN (SELECT id FROM care_connector.research_project WHERE researcher_id = auth.uid())
  )
  WITH CHECK (
    project_id IN (SELECT id FROM care_connector.research_project WHERE researcher_id = auth.uid())
  );

-- RLS policies for app_popup_rule
CREATE POLICY "Users can manage popup rules" ON care_connector.app_popup_rule
  FOR ALL TO authenticated
  USING (
    popup_id IN (
      SELECT id FROM care_connector.app_popup WHERE project_id IN (
        SELECT id FROM care_connector.research_project WHERE researcher_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    popup_id IN (
      SELECT id FROM care_connector.app_popup WHERE project_id IN (
        SELECT id FROM care_connector.research_project WHERE researcher_id = auth.uid()
      )
    )
  );
