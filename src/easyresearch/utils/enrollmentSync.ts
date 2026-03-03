/**
 * Enrollment Sync Utilities
 * 
 * Converts between flat DB tables and in-memory objects for:
 * - dnd_setting → enrollment_dnd_period table
 * - profile_data → enrollment_profile_response table
 * - ecogram_data → ecogram_member table
 * 
 * NO JSONB. All flat relational tables.
 */

import { supabase } from '../../lib/supabase';

// ── DND Setting: enrollment_dnd_period table ──

export interface DndPeriodRow {
  id?: string;
  enrollment_id: string;
  questionnaire_id: string;
  start_time: string;
  end_time: string;
  order_index: number;
}

/**
 * Load DND setting from flat table → in-memory { [qId]: { dnd_periods: [{start, end}] } }
 */
export async function loadDndSetting(enrollmentId: string): Promise<Record<string, { dnd_periods: { start: string; end: string }[] }>> {
  const { data } = await supabase
    .from('enrollment_dnd_period')
    .select('*')
    .eq('enrollment_id', enrollmentId)
    .order('order_index');

  const result: Record<string, { dnd_periods: { start: string; end: string }[] }> = {};
  for (const row of (data || [])) {
    if (!result[row.questionnaire_id]) {
      result[row.questionnaire_id] = { dnd_periods: [] };
    }
    result[row.questionnaire_id].dnd_periods.push({
      start: row.start_time,
      end: row.end_time,
    });
  }
  return result;
}

/**
 * Save DND setting from in-memory object → flat table
 */
export async function saveDndSetting(
  enrollmentId: string,
  dndSetting: Record<string, { dnd_periods: { start: string; end: string }[] }>
): Promise<void> {
  // Delete existing
  await supabase.from('enrollment_dnd_period').delete().eq('enrollment_id', enrollmentId);

  // Insert new
  const rows: DndPeriodRow[] = [];
  for (const [qId, setting] of Object.entries(dndSetting)) {
    (setting.dnd_periods || []).forEach((period, i) => {
      rows.push({
        enrollment_id: enrollmentId,
        questionnaire_id: qId,
        start_time: period.start,
        end_time: period.end,
        order_index: i,
      });
    });
  }
  if (rows.length > 0) {
    await supabase.from('enrollment_dnd_period').insert(rows);
  }
}

// ── Profile Data: enrollment_profile_response table ──

export interface ProfileResponseRow {
  id?: string;
  enrollment_id: string;
  question_id: string;
  response_value: string | null;
}

/**
 * Load profile data from flat table → in-memory { [questionId]: responseValue }
 * @param responseType - 'profile' for profile questions, 'enrollment' for enrollment questions
 */
export async function loadProfileData(enrollmentId: string, responseType: string = 'profile'): Promise<Record<string, any>> {
  const { data } = await supabase
    .from('enrollment_profile_response')
    .select('*')
    .eq('enrollment_id', enrollmentId)
    .eq('response_type', responseType);

  const result: Record<string, any> = {};
  for (const row of (data || [])) {
    result[row.question_id] = row.response_value;
  }
  return result;
}

/**
 * Save profile data from in-memory object → flat table
 * @param responseType - 'profile' for profile questions, 'enrollment' for enrollment questions
 */
export async function saveProfileData(
  enrollmentId: string,
  profileData: Record<string, any>,
  responseType: string = 'profile'
): Promise<void> {
  // Delete existing for this type
  await supabase.from('enrollment_profile_response')
    .delete()
    .eq('enrollment_id', enrollmentId)
    .eq('response_type', responseType);

  // Insert new
  const rows: any[] = [];
  for (const [qId, value] of Object.entries(profileData)) {
    if (value !== null && value !== undefined) {
      rows.push({
        enrollment_id: enrollmentId,
        question_id: qId,
        response_value: typeof value === 'string' ? value : JSON.stringify(value),
        response_type: responseType,
      });
    }
  }
  if (rows.length > 0) {
    await supabase.from('enrollment_profile_response').insert(rows);
  }
}

// ── Ecogram Data: ecogram_member table ──

export interface EcogramMemberRow {
  id?: string;
  enrollment_id?: string | null;
  profile_id?: string | null;
  name: string;
  relationship: string;
  age?: number | null;
  gender?: string | null;
  distance: string;
  custom_distance?: string | null;
  frequency: string;
  importance: number;
  pos_x: number;
  pos_y: number;
  circle: number;
  line_style: string;
  arrow_direction: string;
  support_types: string[];
  custom_adl?: string | null;
  custom_iadl?: string | null;
  custom_maintenance?: string | null;
  custom_other?: string | null;
  color: string;
  order_index: number;
}

export interface EcogramData {
  members: any[];
  lastUpdated: string | null;
}

/**
 * Load ecogram data from flat table → in-memory { members: [...], lastUpdated }
 * Pass either enrollmentId or profileId.
 */
export async function loadEcogramData(opts: { enrollmentId?: string; profileId?: string }): Promise<EcogramData> {
  let query = supabase.from('ecogram_member').select('*').order('order_index');
  if (opts.enrollmentId) query = query.eq('enrollment_id', opts.enrollmentId);
  else if (opts.profileId) query = query.eq('profile_id', opts.profileId);
  else return { members: [], lastUpdated: null };

  const { data } = await query;

  // Get lastUpdated from enrollment if available
  let lastUpdated: string | null = null;
  if (opts.enrollmentId) {
    const { data: enr } = await supabase
      .from('enrollment')
      .select('ecogram_last_updated')
      .eq('id', opts.enrollmentId)
      .maybeSingle();
    lastUpdated = enr?.ecogram_last_updated || null;
  }

  const members = (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    relationship: row.relationship,
    age: row.age,
    gender: row.gender,
    distance: row.distance,
    customDistance: row.custom_distance,
    frequency: row.frequency,
    importance: row.importance,
    x: row.pos_x,
    y: row.pos_y,
    circle: row.circle,
    lineStyle: row.line_style,
    arrowDirection: row.arrow_direction,
    supportTypes: row.support_types || [],
    customADL: row.custom_adl,
    customIADL: row.custom_iadl,
    customMaintenance: row.custom_maintenance,
    customOther: row.custom_other,
    color: row.color,
  }));

  return { members, lastUpdated };
}

/**
 * Save ecogram data from in-memory object → flat table
 */
export async function saveEcogramData(
  opts: { enrollmentId?: string; profileId?: string },
  ecogramData: EcogramData
): Promise<void> {
  // Delete existing members
  let deleteQuery = supabase.from('ecogram_member').delete();
  if (opts.enrollmentId) deleteQuery = deleteQuery.eq('enrollment_id', opts.enrollmentId);
  else if (opts.profileId) deleteQuery = deleteQuery.eq('profile_id', opts.profileId);
  await deleteQuery;

  // Update lastUpdated on enrollment
  if (opts.enrollmentId) {
    await supabase.from('enrollment').update({
      ecogram_last_updated: ecogramData.lastUpdated || new Date().toISOString(),
    }).eq('id', opts.enrollmentId);
  }

  // Insert members
  const rows: any[] = ecogramData.members.map((m, i) => ({
    enrollment_id: opts.enrollmentId || null,
    profile_id: opts.profileId || null,
    name: m.name || '',
    relationship: m.relationship || 'other',
    age: m.age ?? null,
    gender: m.gender ?? null,
    distance: m.distance || 'same_city',
    custom_distance: m.customDistance ?? null,
    frequency: m.frequency || 'weekly',
    importance: m.importance ?? 50,
    pos_x: m.x ?? 0,
    pos_y: m.y ?? 0,
    circle: m.circle ?? 1,
    line_style: m.lineStyle || 'solid',
    arrow_direction: m.arrowDirection || 'both',
    support_types: m.supportTypes || [],
    custom_adl: m.customADL ?? null,
    custom_iadl: m.customIADL ?? null,
    custom_maintenance: m.customMaintenance ?? null,
    custom_other: m.customOther ?? null,
    color: m.color || '#6B7280',
    order_index: i,
  }));

  if (rows.length > 0) {
    await supabase.from('ecogram_member').insert(rows);
  }
}
