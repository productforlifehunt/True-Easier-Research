
-- Allow anonymous read access to enabled public pages and their blocks / 允许匿名读取已启用的公开页面及其块
CREATE POLICY "Anyone can view enabled public pages"
ON care_connector.app_public_page FOR SELECT TO anon, authenticated
USING (enabled = true);

CREATE POLICY "Anyone can view blocks of enabled public pages"
ON care_connector.app_public_page_block FOR SELECT TO anon, authenticated
USING (page_id IN (SELECT id FROM care_connector.app_public_page WHERE enabled = true));
