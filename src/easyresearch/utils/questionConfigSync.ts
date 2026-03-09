/**
 * Question Config Sync Utilities
 * 
 * Converts between flat DB columns on `question` table and the in-memory
 * `question_config` object used throughout the app.
 * 
 * NO JSONB. All flat columns.
 * 
 * The 38 config keys are stored as individual columns prefixed with `cfg_` on
 * the question table. On load, they're assembled back into `question_config`.
 * On save, `question_config` is spread into the `cfg_` columns.
 */

// All known question_config keys and their DB column names
const CONFIG_KEY_MAP: Record<string, string> = {
  // Text config
  max_length: 'cfg_max_length',
  // Choice config
  allow_other: 'cfg_allow_other',
  allow_none: 'cfg_allow_none',
  allow_multiple: 'cfg_allow_multiple',
  columns: 'cfg_columns',           // text[] for matrix columns OR int for checkbox_group
  custom_labels: 'cfg_custom_labels', // text[] for likert custom labels
  // Scale config
  min_value: 'cfg_min_value',
  max_value: 'cfg_max_value',
  min: 'cfg_min',
  max: 'cfg_max',
  step: 'cfg_step',
  min_label: 'cfg_min_label',
  max_label: 'cfg_max_label',
  show_value_labels: 'cfg_show_value_labels',
  scale_type: 'cfg_scale_type',
  // Yes/No config
  yes_label: 'cfg_yes_label',
  no_label: 'cfg_no_label',
  // File upload config
  max_files: 'cfg_max_files',
  max_size_mb: 'cfg_max_size_mb',
  accepted_types: 'cfg_accepted_types',
  // Image block config
  image_url: 'cfg_image_url',
  alt_text: 'cfg_alt_text',
  max_width: 'cfg_max_width',
  caption: 'cfg_caption',
  // Section header config
  section_color: 'cfg_section_color',
  section_icon: 'cfg_section_icon',
  // Text block / content config
  content: 'cfg_content',
  content_type: 'cfg_content_type',
  font_size: 'cfg_font_size',
  // Style config
  color: 'cfg_color',
  thickness: 'cfg_thickness',
  style: 'cfg_style',
  // Screening config
  disqualify_value: 'cfg_disqualify_value',
  // Response config
  response_required: 'cfg_response_required',
  // Questionnaire reference (which questionnaire this question is displayed in)
  questionnaire_id: 'cfg_questionnaire_id',
  // Display
  options: 'cfg_options',   // text[] for inline options (rare)
  // Constant sum config
  total: 'cfg_total',
  // Address config
  show_country: 'cfg_show_country',
  // AI config on question level
  allow_ai_assist: 'cfg_allow_ai_assist',
  allow_ai_auto_answer: 'cfg_allow_ai_auto_answer',
  allow_voice: 'cfg_allow_voice',
  // Rich media config
  video_url: 'cfg_video_url',
  audio_url: 'cfg_audio_url',
  embed_url: 'cfg_embed_url',
  embed_type: 'cfg_embed_type',
  autoplay: 'cfg_autoplay',
  loop: 'cfg_loop',
  muted: 'cfg_muted',
  poster_url: 'cfg_poster_url',
  media_type: 'cfg_media_type',
  embed_height: 'cfg_embed_height',
  allow_fullscreen: 'cfg_allow_fullscreen',
  // Card Sort config
  cards: 'cfg_cards',
  categories: 'cfg_categories',
  sort_type: 'cfg_sort_type',
  // Tree Test config
  tree_data: 'cfg_tree_data',
  task_description: 'cfg_task_description',
  correct_answer: 'cfg_correct_answer',
  // First Click / 5-Second Test config
  test_image_url: 'cfg_test_image_url',
  test_duration: 'cfg_test_duration',
  followup_question: 'cfg_followup_question',
  // Preference Test config
  variant_a_url: 'cfg_variant_a_url',
  variant_a_label: 'cfg_variant_a_label',
  variant_b_url: 'cfg_variant_b_url',
  variant_b_label: 'cfg_variant_b_label',
  // Prototype Test config
  prototype_url: 'cfg_prototype_url',
  prototype_platform: 'cfg_prototype_platform',
  task_list: 'cfg_task_list',
};

// Reverse map: DB column → config key
const REVERSE_MAP: Record<string, string> = {};
for (const [key, col] of Object.entries(CONFIG_KEY_MAP)) {
  REVERSE_MAP[col] = key;
}

/**
 * Extract question_config from flat DB row columns.
 * Call this after loading a question row from Supabase.
 * Reconstructs the `question_config` object from `cfg_*` columns.
 */
export function dbRowToQuestionConfig(row: Record<string, any>): Record<string, any> {
  const config: Record<string, any> = {};
  
  // Build config exclusively from flat cfg_* columns (no JSONB fallback)
  for (const [configKey, dbCol] of Object.entries(CONFIG_KEY_MAP)) {
    if (dbCol in row && row[dbCol] !== null && row[dbCol] !== undefined) {
      config[configKey] = row[dbCol];
    }
  }
  
  return config;
}

/**
 * Spread question_config into flat DB columns for upsert.
 * Call this before saving a question row to Supabase.
 * Returns an object with `cfg_*` columns set from `question_config`.
 */
export function questionConfigToDbCols(questionConfig: Record<string, any> | null | undefined): Record<string, any> {
  const cols: Record<string, any> = {};
  if (!questionConfig) return cols;
  
  for (const [configKey, dbCol] of Object.entries(CONFIG_KEY_MAP)) {
    if (configKey in questionConfig) {
      cols[dbCol] = questionConfig[configKey];
    }
  }
  
  return cols;
}

// ── validation_rule flattening (8 known keys → vr_* columns) ──

const VR_KEY_MAP: Record<string, string> = {
  min_length: 'vr_min_length',
  max_length: 'vr_max_length',
  min_value: 'vr_min_value',
  max_value: 'vr_max_value',
  min: 'vr_min',
  max: 'vr_max',
  allow_future_dates: 'vr_allow_future_dates',
  allow_past_dates: 'vr_allow_past_dates',
};

export function dbRowToValidationRule(row: Record<string, any>): Record<string, any> {
  const rule: Record<string, any> = {};
  // Build rule exclusively from flat vr_* columns (no JSONB fallback)
  for (const [ruleKey, dbCol] of Object.entries(VR_KEY_MAP)) {
    if (dbCol in row && row[dbCol] !== null && row[dbCol] !== undefined) {
      rule[ruleKey] = row[dbCol];
    }
  }
  return rule;
}

export function validationRuleToDbCols(validationRule: Record<string, any> | null | undefined): Record<string, any> {
  const cols: Record<string, any> = {};
  if (!validationRule) return cols;
  for (const [ruleKey, dbCol] of Object.entries(VR_KEY_MAP)) {
    if (ruleKey in validationRule) {
      cols[dbCol] = validationRule[ruleKey];
    }
  }
  return cols;
}

/**
 * Process a question row from DB: reconstruct question_config and validation_rule from flat columns.
 * This modifies the row in-place and returns it.
 */
export function hydrateQuestionRow(row: any): any {
  if (!row) return row;
  row.question_config = dbRowToQuestionConfig(row);
  row.validation_rule = dbRowToValidationRule(row);
  return row;
}

/**
 * Process an array of question rows from DB.
 */
export function hydrateQuestionRows(rows: any[]): any[] {
  return (rows || []).map(hydrateQuestionRow);
}
