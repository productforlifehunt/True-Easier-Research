-- Run this on the EXTERNAL Supabase (yekarqanirdkdckimpna.supabase.co)
-- Adds missing style/config columns to care_connector.app_tab_element
-- 在外部 Supabase 上运行此脚本，添加缺失的样式/配置列

ALTER TABLE care_connector.app_tab_element
  ADD COLUMN IF NOT EXISTS style_margin text,
  ADD COLUMN IF NOT EXISTS style_opacity numeric,
  ADD COLUMN IF NOT EXISTS style_border text,
  ADD COLUMN IF NOT EXISTS style_border_color text,
  ADD COLUMN IF NOT EXISTS style_shadow text,
  ADD COLUMN IF NOT EXISTS style_text_align text,
  ADD COLUMN IF NOT EXISTS style_content_align text,
  ADD COLUMN IF NOT EXISTS style_font_size text,
  ADD COLUMN IF NOT EXISTS style_font_weight text,
  ADD COLUMN IF NOT EXISTS style_text_color text,
  ADD COLUMN IF NOT EXISTS style_bg_color text,
  ADD COLUMN IF NOT EXISTS style_overflow text,
  ADD COLUMN IF NOT EXISTS button_border_radius text,
  ADD COLUMN IF NOT EXISTS show_frequency boolean,
  ADD COLUMN IF NOT EXISTS card_display_style text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Notify PostgREST to refresh its schema cache
-- 通知 PostgREST 刷新架构缓存
NOTIFY pgrst, 'reload schema';
