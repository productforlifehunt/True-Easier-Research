ALTER TABLE public.app_tab_element ADD COLUMN IF NOT EXISTS show_frequency boolean DEFAULT null;
ALTER TABLE public.app_tab_element ADD COLUMN IF NOT EXISTS card_display_style text DEFAULT null;