/**
 * Layout Sync Utilities
 * 
 * Converts between flat DB tables (app_tab, app_tab_element, app_element_todo_card,
 * app_element_help_section, app_element_tab_section) and in-memory AppLayout objects.
 * 
 * NO JSONB. All flat relational tables.
 */

import { supabase } from '../../lib/supabase';
import type { AppLayout, LayoutTab, LayoutElement } from '../components/LayoutBuilder';

// ── DB Row types (flat tables) ──

export interface AppTabRow {
  id: string;
  project_id: string;
  label: string;
  icon: string;
  order_index: number;
}

export interface AppTabElementRow {
  id: string;
  tab_id: string;
  project_id: string;
  type: string;
  order_index: number;
  // All config fields as flat columns
  questionnaire_id?: string | null;
  title?: string | null;
  content?: string | null;
  visible?: boolean | null;
  participant_types?: string[] | null;
  width?: string | null;
  style_padding?: string | null;
  style_background?: string | null;
  style_border_radius?: string | null;
  style_height?: string | null;
  button_action?: string | null;
  button_label?: string | null;
  image_url?: string | null;
  show_question_count?: boolean | null;
  show_estimated_time?: boolean | null;
  consent_text?: string | null;
  screening_criteria?: string | null;
  progress_style?: string | null;
  timeline_start_hour?: number | null;
  timeline_end_hour?: number | null;
  timeline_days?: number | null;
  todo_layout?: string | null;
  todo_auto_scroll?: boolean | null;
}

export interface AppElementTodoCardRow {
  id: string;
  element_id: string;
  type: string;
  questionnaire_id?: string | null;
  title?: string | null;
  description?: string | null;
  completion_trigger?: string | null;
  order_index: number;
}

export interface AppElementHelpSectionRow {
  id: string;
  element_id: string;
  title: string;
  content: string;
  order_index: number;
}

export interface AppElementTabSectionRow {
  id: string;
  element_id: string;
  label: string;
  question_ids: string[];
  order_index: number;
}

// ── Load: flat DB rows → in-memory AppLayout ──

export async function loadLayoutFromDb(projectId: string): Promise<AppLayout | null> {
  // Load project-level layout settings
  const { data: proj } = await supabase
    .from('research_project')
    .select('layout_show_header, layout_header_title, layout_theme_primary_color, layout_theme_background_color, layout_theme_card_style')
    .eq('id', projectId)
    .maybeSingle();

  // Load tabs
  const { data: tabRows } = await supabase
    .from('app_tab')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index');

  if (!tabRows || tabRows.length === 0) return null;

  // Load all elements for this project
  const { data: elementRows } = await supabase
    .from('app_tab_element')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index');

  // Load all child rows for elements
  const elementIds = (elementRows || []).map(e => e.id);

  let todoCardRows: AppElementTodoCardRow[] = [];
  let helpSectionRows: AppElementHelpSectionRow[] = [];
  let tabSectionRows: AppElementTabSectionRow[] = [];

  if (elementIds.length > 0) {
    const [todoRes, helpRes, tabSecRes] = await Promise.all([
      supabase.from('app_element_todo_card').select('*').in('element_id', elementIds).order('order_index'),
      supabase.from('app_element_help_section').select('*').in('element_id', elementIds).order('order_index'),
      supabase.from('app_element_tab_section').select('*').in('element_id', elementIds).order('order_index'),
    ]);
    todoCardRows = (todoRes.data || []) as AppElementTodoCardRow[];
    helpSectionRows = (helpRes.data || []) as AppElementHelpSectionRow[];
    tabSectionRows = (tabSecRes.data || []) as AppElementTabSectionRow[];
  }

  // Group elements by tab_id
  const elementsByTab = new Map<string, AppTabElementRow[]>();
  for (const el of (elementRows || []) as AppTabElementRow[]) {
    if (!elementsByTab.has(el.tab_id)) elementsByTab.set(el.tab_id, []);
    elementsByTab.get(el.tab_id)!.push(el);
  }

  // Group child rows by element_id
  const todosByElement = new Map<string, AppElementTodoCardRow[]>();
  for (const tc of todoCardRows) {
    if (!todosByElement.has(tc.element_id)) todosByElement.set(tc.element_id, []);
    todosByElement.get(tc.element_id)!.push(tc);
  }
  const helpsByElement = new Map<string, AppElementHelpSectionRow[]>();
  for (const hs of helpSectionRows) {
    if (!helpsByElement.has(hs.element_id)) helpsByElement.set(hs.element_id, []);
    helpsByElement.get(hs.element_id)!.push(hs);
  }
  const tabSecsByElement = new Map<string, AppElementTabSectionRow[]>();
  for (const ts of tabSectionRows) {
    if (!tabSecsByElement.has(ts.element_id)) tabSecsByElement.set(ts.element_id, []);
    tabSecsByElement.get(ts.element_id)!.push(ts);
  }

  // Convert element rows → in-memory LayoutElement
  const toLayoutElement = (row: AppTabElementRow): LayoutElement => ({
    id: row.id,
    type: row.type as LayoutElement['type'],
    order_index: row.order_index,
    config: {
      questionnaire_id: row.questionnaire_id || undefined,
      title: row.title || undefined,
      content: row.content || undefined,
      visible: row.visible ?? true,
      participant_types: row.participant_types || undefined,
      width: row.width || undefined,
      style: (row.style_padding || row.style_background || row.style_border_radius || row.style_height) ? {
        padding: row.style_padding || undefined,
        background: row.style_background || undefined,
        border_radius: row.style_border_radius || undefined,
        height: row.style_height || undefined,
      } : undefined,
      button_action: row.button_action || undefined,
      button_label: row.button_label || undefined,
      image_url: row.image_url || undefined,
      show_question_count: row.show_question_count ?? undefined,
      show_estimated_time: row.show_estimated_time ?? undefined,
      consent_text: row.consent_text || undefined,
      screening_criteria: row.screening_criteria || undefined,
      progress_style: (row.progress_style as any) || undefined,
      timeline_start_hour: row.timeline_start_hour ?? undefined,
      timeline_end_hour: row.timeline_end_hour ?? undefined,
      timeline_days: row.timeline_days ?? undefined,
      todo_layout: (row.todo_layout as any) || undefined,
      todo_auto_scroll: row.todo_auto_scroll ?? undefined,
      todo_cards: (todosByElement.get(row.id) || []).map(tc => ({
        id: tc.id,
        type: tc.type as 'questionnaire' | 'custom',
        questionnaire_id: tc.questionnaire_id || undefined,
        title: tc.title || undefined,
        description: tc.description || undefined,
        completion_trigger: (tc.completion_trigger as any) || undefined,
      })),
      help_sections: (helpsByElement.get(row.id) || []).map(hs => ({
        title: hs.title,
        content: hs.content,
      })),
      tab_sections: (tabSecsByElement.get(row.id) || []).map(ts => ({
        id: ts.id,
        label: ts.label,
        question_ids: ts.question_ids || [],
      })),
    },
  });

  // Convert tab rows → in-memory LayoutTab
  const tabs: LayoutTab[] = (tabRows as AppTabRow[]).map(tab => ({
    id: tab.id,
    label: tab.label,
    icon: tab.icon,
    order_index: tab.order_index,
    elements: (elementsByTab.get(tab.id) || []).map(toLayoutElement),
  }));

  return {
    tabs,
    bottom_nav: tabs.map(t => ({ icon: t.icon, label: t.label, tab_id: t.id })),
    show_header: proj?.layout_show_header ?? true,
    header_title: proj?.layout_header_title || '',
    theme: {
      primary_color: proj?.layout_theme_primary_color || '#10b981',
      background_color: proj?.layout_theme_background_color || '#f5f5f4',
      card_style: (proj?.layout_theme_card_style as any) || 'elevated',
    },
  };
}

// ── Save: in-memory AppLayout → flat DB rows ──

export async function saveLayoutToDb(projectId: string, layout: AppLayout): Promise<void> {
  // 1. Save project-level layout settings
  await supabase
    .from('research_project')
    .update({
      layout_show_header: layout.show_header,
      layout_header_title: layout.header_title,
      layout_theme_primary_color: layout.theme.primary_color,
      layout_theme_background_color: layout.theme.background_color,
      layout_theme_card_style: layout.theme.card_style,
    })
    .eq('id', projectId);

  // 2. Delete existing layout rows (cascade will handle children if FK set, otherwise delete manually)
  const { data: existingElements } = await supabase
    .from('app_tab_element')
    .select('id')
    .eq('project_id', projectId);
  const existingElementIds = (existingElements || []).map(e => e.id);

  if (existingElementIds.length > 0) {
    await Promise.all([
      supabase.from('app_element_todo_card').delete().in('element_id', existingElementIds),
      supabase.from('app_element_help_section').delete().in('element_id', existingElementIds),
      supabase.from('app_element_tab_section').delete().in('element_id', existingElementIds),
    ]);
  }
  await supabase.from('app_tab_element').delete().eq('project_id', projectId);
  await supabase.from('app_tab').delete().eq('project_id', projectId);

  // 3. Insert tabs
  const tabPayload: AppTabRow[] = layout.tabs.map(tab => ({
    id: tab.id,
    project_id: projectId,
    label: tab.label,
    icon: tab.icon,
    order_index: tab.order_index,
  }));
  if (tabPayload.length > 0) {
    await supabase.from('app_tab').insert(tabPayload);
  }

  // 4. Insert elements
  const allElements: AppTabElementRow[] = [];
  const allTodoCards: AppElementTodoCardRow[] = [];
  const allHelpSections: AppElementHelpSectionRow[] = [];
  const allTabSections: AppElementTabSectionRow[] = [];

  for (const tab of layout.tabs) {
    for (const el of tab.elements) {
      allElements.push({
        id: el.id,
        tab_id: tab.id,
        project_id: projectId,
        type: el.type,
        order_index: el.order_index,
        questionnaire_id: el.config.questionnaire_id || null,
        title: el.config.title || null,
        content: el.config.content || null,
        visible: el.config.visible ?? true,
        participant_types: el.config.participant_types || null,
        width: el.config.width || null,
        style_padding: el.config.style?.padding || null,
        style_background: el.config.style?.background || null,
        style_border_radius: el.config.style?.border_radius || null,
        style_height: el.config.style?.height || null,
        button_action: el.config.button_action || null,
        button_label: el.config.button_label || null,
        image_url: el.config.image_url || null,
        show_question_count: el.config.show_question_count ?? null,
        show_estimated_time: el.config.show_estimated_time ?? null,
        consent_text: el.config.consent_text || null,
        screening_criteria: el.config.screening_criteria || null,
        progress_style: el.config.progress_style || null,
        timeline_start_hour: el.config.timeline_start_hour ?? null,
        timeline_end_hour: el.config.timeline_end_hour ?? null,
        timeline_days: el.config.timeline_days ?? null,
        todo_layout: el.config.todo_layout || null,
        todo_auto_scroll: el.config.todo_auto_scroll ?? null,
      });

      // Child rows: todo cards
      if (el.config.todo_cards?.length) {
        el.config.todo_cards.forEach((card, i) => {
          allTodoCards.push({
            id: card.id,
            element_id: el.id,
            type: card.type,
            questionnaire_id: card.questionnaire_id || null,
            title: card.title || null,
            description: card.description || null,
            completion_trigger: card.completion_trigger || null,
            order_index: i,
          });
        });
      }

      // Child rows: help sections
      if (el.config.help_sections?.length) {
        el.config.help_sections.forEach((hs, i) => {
          allHelpSections.push({
            id: crypto.randomUUID(),
            element_id: el.id,
            title: hs.title,
            content: hs.content,
            order_index: i,
          });
        });
      }

      // Child rows: tab sections
      if (el.config.tab_sections?.length) {
        el.config.tab_sections.forEach((ts, i) => {
          allTabSections.push({
            id: ts.id,
            element_id: el.id,
            label: ts.label,
            question_ids: ts.question_ids,
            order_index: i,
          });
        });
      }
    }
  }

  // Batch insert all
  const inserts: Promise<any>[] = [];
  if (allElements.length > 0) inserts.push(supabase.from('app_tab_element').insert(allElements));
  if (allTodoCards.length > 0) inserts.push(supabase.from('app_element_todo_card').insert(allTodoCards));
  if (allHelpSections.length > 0) inserts.push(supabase.from('app_element_help_section').insert(allHelpSections));
  if (allTabSections.length > 0) inserts.push(supabase.from('app_element_tab_section').insert(allTabSections));
  await Promise.all(inserts);
}
