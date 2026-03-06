
ALTER TABLE public.app_tab_element
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
  ADD COLUMN IF NOT EXISTS button_border_radius text;
