
-- Junction table: custom elements can belong to multiple users / 定制部件可属于多个用户
CREATE TABLE IF NOT EXISTS care_connector.custom_element_user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  element_id UUID NOT NULL REFERENCES care_connector.custom_function_element(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(element_id, user_id)
);

ALTER TABLE care_connector.custom_element_user ENABLE ROW LEVEL SECURITY;

-- Users can see their own assignments
CREATE POLICY "Users can view own element assignments"
  ON care_connector.custom_element_user
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Admin (insert/update/delete) - only the admin email
CREATE POLICY "Admin can manage all element assignments"
  ON care_connector.custom_element_user
  FOR ALL TO authenticated
  USING (auth.email() = 'guowei.jiang.work@gmail.com')
  WITH CHECK (auth.email() = 'guowei.jiang.work@gmail.com');

-- Update RLS on custom_function_element to also allow access via junction table
DROP POLICY IF EXISTS "Users can view own and public elements" ON care_connector.custom_function_element;
CREATE POLICY "Users can view accessible elements"
  ON care_connector.custom_function_element
  FOR SELECT TO authenticated
  USING (
    is_public = true 
    OR user_id = auth.uid()
    OR id IN (SELECT element_id FROM care_connector.custom_element_user WHERE user_id = auth.uid())
  );

-- Admin full access to custom_function_element
CREATE POLICY "Admin full access to custom elements"
  ON care_connector.custom_function_element
  FOR ALL TO authenticated
  USING (auth.email() = 'guowei.jiang.work@gmail.com')
  WITH CHECK (auth.email() = 'guowei.jiang.work@gmail.com');

-- Insert junction for existing demo element -> test user
INSERT INTO care_connector.custom_element_user (element_id, user_id)
SELECT cfe.id, cfe.user_id
FROM care_connector.custom_function_element cfe
WHERE cfe.user_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Also add user_function_element table for user-customized (cloned) function elements
CREATE TABLE IF NOT EXISTS care_connector.user_function_element (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID,
  base_type TEXT NOT NULL, -- ecogram, progress, timeline, etc.
  name_en TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  description_en TEXT,
  description_zh TEXT,
  icon TEXT DEFAULT 'Sparkles',
  element_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE care_connector.user_function_element ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own function elements"
  ON care_connector.user_function_element
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
