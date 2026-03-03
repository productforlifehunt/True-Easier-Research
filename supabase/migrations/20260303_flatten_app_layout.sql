-- Migration: Flatten app_layout JSONB into relational tables
-- Date: 2026-03-03
-- Summary: Replace research_project.app_layout JSONB with flat tables:
--   app_tab, app_tab_element, app_element_todo_card, app_element_help_section, app_element_tab_section
-- Also adds layout_show_header, layout_header_title, layout_theme_* columns to research_project

-- ═══════════════════════════════════════════════════════════════
-- 1. Add flat layout theme/header columns to research_project
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE research_project ADD COLUMN IF NOT EXISTS layout_show_header boolean DEFAULT true;
ALTER TABLE research_project ADD COLUMN IF NOT EXISTS layout_header_title text DEFAULT '';
ALTER TABLE research_project ADD COLUMN IF NOT EXISTS layout_theme_primary_color text DEFAULT '#10b981';
ALTER TABLE research_project ADD COLUMN IF NOT EXISTS layout_theme_background_color text DEFAULT '#f5f5f4';
ALTER TABLE research_project ADD COLUMN IF NOT EXISTS layout_theme_card_style text DEFAULT 'elevated';

-- ═══════════════════════════════════════════════════════════════
-- 2. Create app_tab table
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS app_tab (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES research_project(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Tab',
  icon text NOT NULL DEFAULT 'FileText',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_tab_project ON app_tab(project_id);

-- ═══════════════════════════════════════════════════════════════
-- 3. Create app_tab_element table
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS app_tab_element (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tab_id uuid NOT NULL REFERENCES app_tab(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES research_project(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'text_block',
  order_index integer NOT NULL DEFAULT 0,
  -- All config fields as flat columns
  questionnaire_id uuid,
  title text,
  content text,
  visible boolean DEFAULT true,
  participant_types text[],
  width text DEFAULT '100%',
  style_padding text,
  style_background text,
  style_border_radius text,
  style_height text,
  button_action text,
  button_label text,
  image_url text,
  show_question_count boolean,
  show_estimated_time boolean,
  consent_text text,
  screening_criteria text,
  progress_style text,
  timeline_start_hour integer,
  timeline_end_hour integer,
  timeline_days integer,
  todo_layout text,
  todo_auto_scroll boolean,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_tab_element_tab ON app_tab_element(tab_id);
CREATE INDEX IF NOT EXISTS idx_app_tab_element_project ON app_tab_element(project_id);

-- ═══════════════════════════════════════════════════════════════
-- 4. Create app_element_todo_card table
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS app_element_todo_card (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  element_id uuid NOT NULL REFERENCES app_tab_element(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'custom',
  questionnaire_id uuid,
  title text,
  description text,
  completion_trigger text DEFAULT 'manual',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_element_todo_card_element ON app_element_todo_card(element_id);

-- ═══════════════════════════════════════════════════════════════
-- 5. Create app_element_help_section table
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS app_element_help_section (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  element_id uuid NOT NULL REFERENCES app_tab_element(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_element_help_section_element ON app_element_help_section(element_id);

-- ═══════════════════════════════════════════════════════════════
-- 6. Create app_element_tab_section table
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS app_element_tab_section (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  element_id uuid NOT NULL REFERENCES app_tab_element(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT '',
  question_ids text[] DEFAULT '{}',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_element_tab_section_element ON app_element_tab_section(element_id);

-- ═══════════════════════════════════════════════════════════════
-- 7. Migrate existing app_layout JSONB data to flat tables
-- ═══════════════════════════════════════════════════════════════
DO $$
DECLARE
  proj RECORD;
  tab_obj JSONB;
  el_obj JSONB;
  tab_idx INTEGER;
  el_idx INTEGER;
  new_tab_id UUID;
  new_el_id UUID;
  card_obj JSONB;
  card_idx INTEGER;
  hs_obj JSONB;
  hs_idx INTEGER;
  ts_obj JSONB;
  ts_idx INTEGER;
BEGIN
  FOR proj IN
    SELECT id, app_layout FROM research_project
    WHERE app_layout IS NOT NULL AND app_layout != '{}'::jsonb AND app_layout != 'null'::jsonb
  LOOP
    -- Migrate theme/header to flat columns
    UPDATE research_project SET
      layout_show_header = COALESCE((proj.app_layout->>'show_header')::boolean, true),
      layout_header_title = COALESCE(proj.app_layout->>'header_title', ''),
      layout_theme_primary_color = COALESCE(proj.app_layout->'theme'->>'primary_color', '#10b981'),
      layout_theme_background_color = COALESCE(proj.app_layout->'theme'->>'background_color', '#f5f5f4'),
      layout_theme_card_style = COALESCE(proj.app_layout->'theme'->>'card_style', 'elevated')
    WHERE id = proj.id;

    -- Migrate tabs
    tab_idx := 0;
    IF proj.app_layout ? 'tabs' THEN
      FOR tab_obj IN SELECT * FROM jsonb_array_elements(proj.app_layout->'tabs')
      LOOP
        new_tab_id := COALESCE((tab_obj->>'id')::uuid, gen_random_uuid());
        INSERT INTO app_tab (id, project_id, label, icon, order_index)
        VALUES (
          new_tab_id,
          proj.id,
          COALESCE(tab_obj->>'label', 'Tab'),
          COALESCE(tab_obj->>'icon', 'FileText'),
          COALESCE((tab_obj->>'order_index')::integer, tab_idx)
        )
        ON CONFLICT (id) DO NOTHING;

        -- Migrate elements within tab
        el_idx := 0;
        IF tab_obj ? 'elements' THEN
          FOR el_obj IN SELECT * FROM jsonb_array_elements(tab_obj->'elements')
          LOOP
            new_el_id := COALESCE((el_obj->>'id')::uuid, gen_random_uuid());
            INSERT INTO app_tab_element (
              id, tab_id, project_id, type, order_index,
              questionnaire_id, title, content, visible, participant_types, width,
              style_padding, style_background, style_border_radius, style_height,
              button_action, button_label, image_url,
              show_question_count, show_estimated_time,
              consent_text, screening_criteria, progress_style,
              timeline_start_hour, timeline_end_hour, timeline_days,
              todo_layout, todo_auto_scroll
            ) VALUES (
              new_el_id, new_tab_id, proj.id,
              COALESCE(el_obj->>'type', 'text_block'),
              COALESCE((el_obj->>'order_index')::integer, el_idx),
              (el_obj->'config'->>'questionnaire_id')::uuid,
              el_obj->'config'->>'title',
              el_obj->'config'->>'content',
              COALESCE((el_obj->'config'->>'visible')::boolean, true),
              CASE WHEN el_obj->'config' ? 'participant_types'
                THEN ARRAY(SELECT jsonb_array_elements_text(el_obj->'config'->'participant_types'))
                ELSE NULL END,
              el_obj->'config'->>'width',
              el_obj->'config'->'style'->>'padding',
              el_obj->'config'->'style'->>'background',
              el_obj->'config'->'style'->>'border_radius',
              el_obj->'config'->'style'->>'height',
              el_obj->'config'->>'button_action',
              el_obj->'config'->>'button_label',
              el_obj->'config'->>'image_url',
              (el_obj->'config'->>'show_question_count')::boolean,
              (el_obj->'config'->>'show_estimated_time')::boolean,
              el_obj->'config'->>'consent_text',
              el_obj->'config'->>'screening_criteria',
              el_obj->'config'->>'progress_style',
              (el_obj->'config'->>'timeline_start_hour')::integer,
              (el_obj->'config'->>'timeline_end_hour')::integer,
              (el_obj->'config'->>'timeline_days')::integer,
              el_obj->'config'->>'todo_layout',
              (el_obj->'config'->>'todo_auto_scroll')::boolean
            )
            ON CONFLICT (id) DO NOTHING;

            -- Migrate todo cards
            IF el_obj->'config' ? 'todo_cards' THEN
              card_idx := 0;
              FOR card_obj IN SELECT * FROM jsonb_array_elements(el_obj->'config'->'todo_cards')
              LOOP
                INSERT INTO app_element_todo_card (id, element_id, type, questionnaire_id, title, description, completion_trigger, order_index)
                VALUES (
                  COALESCE((card_obj->>'id')::uuid, gen_random_uuid()),
                  new_el_id,
                  COALESCE(card_obj->>'type', 'custom'),
                  (card_obj->>'questionnaire_id')::uuid,
                  card_obj->>'title',
                  card_obj->>'description',
                  COALESCE(card_obj->>'completion_trigger', 'manual'),
                  card_idx
                )
                ON CONFLICT (id) DO NOTHING;
                card_idx := card_idx + 1;
              END LOOP;
            END IF;

            -- Migrate help sections
            IF el_obj->'config' ? 'help_sections' THEN
              hs_idx := 0;
              FOR hs_obj IN SELECT * FROM jsonb_array_elements(el_obj->'config'->'help_sections')
              LOOP
                INSERT INTO app_element_help_section (element_id, title, content, order_index)
                VALUES (
                  new_el_id,
                  COALESCE(hs_obj->>'title', ''),
                  COALESCE(hs_obj->>'content', ''),
                  hs_idx
                );
                hs_idx := hs_idx + 1;
              END LOOP;
            END IF;

            -- Migrate tab sections
            IF el_obj->'config' ? 'tab_sections' THEN
              ts_idx := 0;
              FOR ts_obj IN SELECT * FROM jsonb_array_elements(el_obj->'config'->'tab_sections')
              LOOP
                INSERT INTO app_element_tab_section (id, element_id, label, question_ids, order_index)
                VALUES (
                  COALESCE((ts_obj->>'id')::uuid, gen_random_uuid()),
                  new_el_id,
                  COALESCE(ts_obj->>'label', ''),
                  CASE WHEN ts_obj ? 'question_ids'
                    THEN ARRAY(SELECT jsonb_array_elements_text(ts_obj->'question_ids'))
                    ELSE '{}'::text[] END,
                  ts_idx
                )
                ON CONFLICT (id) DO NOTHING;
                ts_idx := ts_idx + 1;
              END LOOP;
            END IF;

            el_idx := el_idx + 1;
          END LOOP;
        END IF;

        tab_idx := tab_idx + 1;
      END LOOP;
    END IF;
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- 8. Enable RLS on new tables
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE app_tab ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_tab_element ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_element_todo_card ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_element_help_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_element_tab_section ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (matches existing RLS patterns)
CREATE POLICY "Allow authenticated access" ON app_tab FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access" ON app_tab_element FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access" ON app_element_todo_card FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access" ON app_element_help_section FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access" ON app_element_tab_section FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow anon read for participant views
CREATE POLICY "Allow anon read" ON app_tab FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON app_tab_element FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON app_element_todo_card FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON app_element_help_section FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read" ON app_element_tab_section FOR SELECT TO anon USING (true);

-- ═══════════════════════════════════════════════════════════════
-- 9. Drop the old JSONB column (optional — uncomment when ready)
-- ═══════════════════════════════════════════════════════════════
-- ALTER TABLE research_project DROP COLUMN IF EXISTS app_layout;
