-- Fix RLS policies for public pages to match app_tab pattern (allow all authenticated)
-- 修复公开页面的 RLS 策略，匹配 app_tab 的模式（允许所有已认证用户）

DROP POLICY IF EXISTS "Users can manage public pages for their projects" ON care_connector.app_public_page;
DROP POLICY IF EXISTS "Anyone can view enabled public pages" ON care_connector.app_public_page;
DROP POLICY IF EXISTS "Users can manage public page blocks" ON care_connector.app_public_page_block;
DROP POLICY IF EXISTS "Anyone can view blocks of enabled public pages" ON care_connector.app_public_page_block;

-- app_public_page: authenticated can do everything, anon can read enabled
CREATE POLICY "Allow authenticated full access to public pages"
  ON care_connector.app_public_page FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read enabled public pages"
  ON care_connector.app_public_page FOR SELECT TO anon USING (enabled = true);

-- app_public_page_block: authenticated can do everything, anon can read blocks of enabled pages
CREATE POLICY "Allow authenticated full access to public page blocks"
  ON care_connector.app_public_page_block FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read blocks of enabled pages"
  ON care_connector.app_public_page_block FOR SELECT TO anon
  USING (page_id IN (SELECT id FROM care_connector.app_public_page WHERE enabled = true));