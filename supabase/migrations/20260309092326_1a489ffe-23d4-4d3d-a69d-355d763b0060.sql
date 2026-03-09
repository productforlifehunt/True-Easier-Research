
-- Public pages table / 公开页面表
CREATE TABLE care_connector.app_public_page (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES care_connector.research_project(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Page',
  slug TEXT NOT NULL DEFAULT '',
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Public page blocks table / 公开页面块表
CREATE TABLE care_connector.app_public_page_block (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES care_connector.app_public_page(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'text',
  content TEXT,
  image_url TEXT,
  style_padding TEXT,
  style_background TEXT,
  style_text_color TEXT,
  style_text_align TEXT,
  style_font_size TEXT,
  style_font_weight TEXT,
  style_height TEXT,
  style_border_radius TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE care_connector.app_public_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_connector.app_public_page_block ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage public pages for their projects"
ON care_connector.app_public_page FOR ALL TO authenticated
USING (project_id IN (SELECT id FROM care_connector.research_project WHERE researcher_id = auth.uid()))
WITH CHECK (project_id IN (SELECT id FROM care_connector.research_project WHERE researcher_id = auth.uid()));

CREATE POLICY "Users can manage public page blocks"
ON care_connector.app_public_page_block FOR ALL TO authenticated
USING (page_id IN (
  SELECT p.id FROM care_connector.app_public_page p
  JOIN care_connector.research_project rp ON rp.id = p.project_id
  WHERE rp.researcher_id = auth.uid()
))
WITH CHECK (page_id IN (
  SELECT p.id FROM care_connector.app_public_page p
  JOIN care_connector.research_project rp ON rp.id = p.project_id
  WHERE rp.researcher_id = auth.uid()
));
