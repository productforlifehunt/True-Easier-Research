/**
 * Notification Config Sync Utilities
 *
 * Unified notification_config table supports:
 * - Multiple notifications per questionnaire (questionnaire_id set)
 * - Multiple project-level notifications (questionnaire_id = null)
 * - Each with independent title, body, type, frequency, minutes_before, dnd_allowed
 * - Participant type targeting via notification_config_participant_type junction
 *
 * NO JSONB. All flat relational tables.
 */

import { supabase } from '../../lib/supabase';

export interface NotificationConfig {
  id: string;
  project_id: string;
  questionnaire_id: string | null; // null = project-level
  enabled: boolean;
  title: string;
  body: string;
  notification_type: string; // 'push' | 'email' | 'sms' | 'push_email'
  frequency: string; // 'once' | 'hourly' | '2hours' | '4hours' | 'daily' | 'twice_daily' | 'weekly'
  schedule_mode: 'interval' | 'specific_times'; // interval = recurring in range; specific_times = exact HH:MM list
  interval_start_hour: number; // 0-23, default 8
  interval_end_hour: number; // 0-23, default 19
  specific_times: string[]; // HH:MM strings
  minutes_before: number;
  dnd_allowed: boolean;
  order_index: number;
  assigned_participant_types: string[]; // participant_type IDs
}

/**
 * Load all notification configs for a project (both project-level and questionnaire-level).
 */
export async function loadNotificationConfigs(projectId: string): Promise<NotificationConfig[]> {
  const { data: rows } = await supabase
    .from('notification_config')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index');

  if (!rows || rows.length === 0) return [];

  // Load participant type assignments
  const configIds = rows.map((r: any) => r.id);
  const { data: ptRows } = await supabase
    .from('notification_config_participant_type')
    .select('notification_config_id, participant_type_id')
    .in('notification_config_id', configIds);

  const ptMap = new Map<string, string[]>();
  for (const pt of (ptRows || [])) {
    if (!ptMap.has(pt.notification_config_id)) ptMap.set(pt.notification_config_id, []);
    ptMap.get(pt.notification_config_id)!.push(pt.participant_type_id);
  }

  return rows.map((r: any) => ({
    id: r.id,
    project_id: r.project_id,
    questionnaire_id: r.questionnaire_id || null,
    enabled: r.enabled ?? true,
    title: r.title || 'Time for your survey!',
    body: r.body || 'Please complete your questionnaire now.',
    notification_type: r.notification_type || 'push',
    frequency: r.frequency || 'daily',
    schedule_mode: r.schedule_mode || 'interval',
    interval_start_hour: r.interval_start_hour ?? 8,
    interval_end_hour: r.interval_end_hour ?? 19,
    specific_times: r.specific_times || [],
    minutes_before: r.minutes_before ?? 5,
    dnd_allowed: r.dnd_allowed ?? true,
    order_index: r.order_index ?? 0,
    assigned_participant_types: ptMap.get(r.id) || [],
  }));
}

/**
 * Load notification configs for a specific questionnaire.
 */
export async function loadNotificationConfigsForQuestionnaire(questionnaireId: string): Promise<NotificationConfig[]> {
  const { data: rows } = await supabase
    .from('notification_config')
    .select('*')
    .eq('questionnaire_id', questionnaireId)
    .order('order_index');

  if (!rows || rows.length === 0) return [];

  const configIds = rows.map((r: any) => r.id);
  const { data: ptRows } = await supabase
    .from('notification_config_participant_type')
    .select('notification_config_id, participant_type_id')
    .in('notification_config_id', configIds);

  const ptMap = new Map<string, string[]>();
  for (const pt of (ptRows || [])) {
    if (!ptMap.has(pt.notification_config_id)) ptMap.set(pt.notification_config_id, []);
    ptMap.get(pt.notification_config_id)!.push(pt.participant_type_id);
  }

  return rows.map((r: any) => ({
    id: r.id,
    project_id: r.project_id,
    questionnaire_id: r.questionnaire_id || null,
    enabled: r.enabled ?? true,
    title: r.title || '',
    body: r.body || '',
    notification_type: r.notification_type || 'push',
    frequency: r.frequency || 'daily',
    minutes_before: r.minutes_before ?? 5,
    dnd_allowed: r.dnd_allowed ?? true,
    order_index: r.order_index ?? 0,
    assigned_participant_types: ptMap.get(r.id) || [],
  }));
}

/**
 * Save notification configs for a project.
 * Handles both project-level (questionnaire_id=null) and questionnaire-level configs.
 * Uses upsert for existing configs (with id) and insert for new ones.
 */
export async function saveNotificationConfigs(
  projectId: string,
  configs: NotificationConfig[],
): Promise<void> {
  // Get existing config IDs for this project
  const { data: existingRows } = await supabase
    .from('notification_config')
    .select('id')
    .eq('project_id', projectId);
  const existingIds = new Set((existingRows || []).map((r: any) => r.id));
  const currentIds = new Set(configs.map(c => c.id));

  // Delete removed configs
  const removedIds = [...existingIds].filter(id => !currentIds.has(id));
  if (removedIds.length > 0) {
    await supabase.from('notification_config_participant_type').delete().in('notification_config_id', removedIds);
    await supabase.from('notification_config').delete().in('id', removedIds);
  }

  // Upsert configs
  for (const config of configs) {
    const payload = {
      id: config.id,
      project_id: projectId,
      questionnaire_id: config.questionnaire_id || null,
      enabled: config.enabled,
      title: config.title,
      body: config.body,
      notification_type: config.notification_type,
      frequency: config.frequency,
      minutes_before: config.minutes_before,
      dnd_allowed: config.dnd_allowed,
      order_index: config.order_index,
    };
    await supabase.from('notification_config').upsert(payload, { onConflict: 'id' });

    // Sync participant type assignments
    await supabase.from('notification_config_participant_type').delete().eq('notification_config_id', config.id);
    if (config.assigned_participant_types.length > 0) {
      const ptRows = config.assigned_participant_types.map(ptId => ({
        notification_config_id: config.id,
        participant_type_id: ptId,
      }));
      await supabase.from('notification_config_participant_type').insert(ptRows);
    }
  }
}

/**
 * Save notification configs for a single questionnaire only.
 * Deletes configs that were removed, upserts the rest.
 */
export async function saveNotificationConfigsForQuestionnaire(
  projectId: string,
  questionnaireId: string,
  configs: NotificationConfig[],
): Promise<void> {
  // Get existing config IDs for this questionnaire
  const { data: existingRows } = await supabase
    .from('notification_config')
    .select('id')
    .eq('questionnaire_id', questionnaireId);
  const existingIds = new Set((existingRows || []).map((r: any) => r.id));
  const currentIds = new Set(configs.map(c => c.id));

  // Delete removed configs
  const removedIds = [...existingIds].filter(id => !currentIds.has(id));
  if (removedIds.length > 0) {
    await supabase.from('notification_config_participant_type').delete().in('notification_config_id', removedIds);
    await supabase.from('notification_config').delete().in('id', removedIds);
  }

  // Upsert each config
  for (const config of configs) {
    const payload = {
      id: config.id,
      project_id: projectId,
      questionnaire_id: questionnaireId,
      enabled: config.enabled,
      title: config.title,
      body: config.body,
      notification_type: config.notification_type,
      frequency: config.frequency,
      minutes_before: config.minutes_before,
      dnd_allowed: config.dnd_allowed,
      order_index: config.order_index,
    };
    await supabase.from('notification_config').upsert(payload, { onConflict: 'id' });

    // Sync participant type assignments
    await supabase.from('notification_config_participant_type').delete().eq('notification_config_id', config.id);
    if (config.assigned_participant_types.length > 0) {
      const ptRows = config.assigned_participant_types.map(ptId => ({
        notification_config_id: config.id,
        participant_type_id: ptId,
      }));
      await supabase.from('notification_config_participant_type').insert(ptRows);
    }
  }
}

/**
 * Create a default notification config for a questionnaire.
 */
export function createDefaultNotificationConfig(projectId: string, questionnaireId: string | null): NotificationConfig {
  return {
    id: crypto.randomUUID(),
    project_id: projectId,
    questionnaire_id: questionnaireId,
    enabled: true,
    title: 'Time for your survey!',
    body: 'Please complete your questionnaire now.',
    notification_type: 'push',
    frequency: 'daily',
    minutes_before: 5,
    dnd_allowed: true,
    order_index: 0,
    assigned_participant_types: [],
  };
}
