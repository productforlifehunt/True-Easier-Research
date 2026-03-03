/**
 * Time Window Sync Utilities
 * 
 * Converts between the flat `questionnaire_time_window` table and the
 * in-memory `time_windows: { start: string; end: string }[]` array
 * used on questionnaire configs.
 * 
 * NO JSONB. All flat relational tables.
 */

import { supabase } from '../../lib/supabase';

export interface TimeWindow {
  start: string;
  end: string;
}

/**
 * Load time windows for a questionnaire from the flat table.
 */
export async function loadTimeWindows(questionnaireId: string): Promise<TimeWindow[]> {
  const { data } = await supabase
    .from('questionnaire_time_window')
    .select('start_time, end_time')
    .eq('questionnaire_id', questionnaireId)
    .order('order_index');

  return (data || []).map(row => ({
    start: row.start_time,
    end: row.end_time,
  }));
}

/**
 * Load time windows for multiple questionnaires at once.
 * Returns a map of questionnaireId → TimeWindow[].
 */
export async function loadTimeWindowsBatch(questionnaireIds: string[]): Promise<Map<string, TimeWindow[]>> {
  if (questionnaireIds.length === 0) return new Map();

  const { data } = await supabase
    .from('questionnaire_time_window')
    .select('questionnaire_id, start_time, end_time')
    .in('questionnaire_id', questionnaireIds)
    .order('order_index');

  const result = new Map<string, TimeWindow[]>();
  for (const row of (data || [])) {
    if (!result.has(row.questionnaire_id)) result.set(row.questionnaire_id, []);
    result.get(row.questionnaire_id)!.push({ start: row.start_time, end: row.end_time });
  }
  return result;
}

/**
 * Save time windows for a questionnaire to the flat table.
 */
export async function saveTimeWindows(questionnaireId: string, windows: TimeWindow[]): Promise<void> {
  await supabase.from('questionnaire_time_window').delete().eq('questionnaire_id', questionnaireId);

  if (windows.length > 0) {
    const rows = windows.map((w, i) => ({
      questionnaire_id: questionnaireId,
      start_time: w.start || '09:00',
      end_time: w.end || '21:00',
      order_index: i,
    }));
    await supabase.from('questionnaire_time_window').insert(rows);
  }
}
