import { supabase } from '../../lib/supabase';
import { normalizeLegacyQuestionType } from '../constants/questionTypes';

/**
 * Seeds the Hourly Activity Log and Daily Reflection questionnaires
 * with the full set of questions matching the standalone dementia survey app.
 * Only inserts into questionnaires that currently have 0 questions.
 */
export async function seedDementiaQuestions(projectId: string): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Find questionnaires for this project
    const { data: questionnaires, error: qError } = await supabase
      .from('questionnaire')
      .select('id, title, questionnaire_type')
      .eq('project_id', projectId)
      .eq('questionnaire_type', 'survey');

    if (qError) throw qError;
    if (!questionnaires || questionnaires.length === 0) {
      return { success: false, message: 'No survey questionnaires found for this project.' };
    }

    // Find hourly and daily questionnaires by title pattern
    const hourlyQ = questionnaires.find(q => q.title.toLowerCase().includes('hourly'));
    const dailyQ = questionnaires.find(q => q.title.toLowerCase().includes('daily'));

    if (!hourlyQ && !dailyQ) {
      return { success: false, message: 'Could not find Hourly or Daily questionnaires. Make sure they exist.' };
    }

    let totalInserted = 0;

    // 2. Seed Hourly Activity Log
    if (hourlyQ) {
      const { data: existingQ } = await supabase
        .from('survey_question')
        .select('id')
        .eq('questionnaire_id', hourlyQ.id)
        .limit(1);

      if (!existingQ || existingQ.length === 0) {
        const count = await seedHourlyQuestions(projectId, hourlyQ.id);
        totalInserted += count;
      }
    }

    // 3. Seed Daily Reflection
    if (dailyQ) {
      const { data: existingQ } = await supabase
        .from('survey_question')
        .select('id')
        .eq('questionnaire_id', dailyQ.id)
        .limit(1);

      if (!existingQ || existingQ.length === 0) {
        const count = await seedDailyQuestions(projectId, dailyQ.id);
        totalInserted += count;
      }
    }

    if (totalInserted === 0) {
      return { success: true, message: 'Questionnaires already have questions. No changes made.' };
    }

    return { success: true, message: `Successfully seeded ${totalInserted} questions. Reload the page to see them.` };
  } catch (error: any) {
    console.error('Seed error:', error);
    return { success: false, message: error.message || 'Unknown error' };
  }
}

async function insertQuestionWithOptions(
  projectId: string,
  questionnaireId: string,
  question: { type: string; text: string; description?: string; required: boolean; config?: any; options?: string[] },
  orderIndex: number
): Promise<void> {
  const { data: inserted, error } = await supabase
    .from('survey_question')
    .insert({
      project_id: projectId,
      questionnaire_id: questionnaireId,
      question_type: normalizeLegacyQuestionType(question.type),
      question_text: question.text,
      question_description: question.description || '',
      required: question.required,
      order_index: orderIndex,
      question_config: question.config || {},
      validation_rule: {},
      logic_rule: {},
      ai_config: {},
      allow_voice: ['text_long', 'long_text'].includes(question.type),
    })
    .select()
    .single();

  if (error) throw error;

  if (question.options && question.options.length > 0 && inserted) {
    const optionsToInsert = question.options.map((opt, idx) => ({
      question_id: inserted.id,
      option_text: opt,
      option_value: opt.toLowerCase().replace(/\s+/g, '_'),
      order_index: idx,
      is_other: opt.toLowerCase() === 'other',
    }));
    await supabase.from('question_option').insert(optionsToInsert);
  }
}

async function seedHourlyQuestions(projectId: string, questionnaireId: string): Promise<number> {
  // Full replication of the standalone dementia survey's AddEntry.tsx
  // Tab 1: Activity, Tab 2: People, Tab 3: Challenges & Resources
  // We also set tab_sections on the questionnaire

  const tabSections = [
    { id: 'tab-activity', label: 'Activity', order_index: 0 },
    { id: 'tab-people', label: 'People', order_index: 1 },
    { id: 'tab-challenges', label: 'Challenges & Resources', order_index: 2 },
  ];

  // Update questionnaire with tab_sections
  await supabase
    .from('questionnaire')
    .update({ tab_sections: tabSections })
    .eq('id', questionnaireId);

  const questions: Array<{
    type: string; text: string; description?: string; required: boolean;
    config?: any; options?: string[]; tab_section_id?: string;
  }> = [
    // ═══════════════════════════════════════════
    // TAB 1: ACTIVITY
    // ═══════════════════════════════════════════
    {
      type: 'section_header', text: 'Activity Details',
      required: false,
      config: { section_icon: '📋', section_color: '#10b981', tab_section_id: 'tab-activity' },
      tab_section_id: 'tab-activity',
    },
    {
      type: 'checkbox_group',
      text: 'What caregiving activities did you do?',
      description: 'Select activity types involved in this time period (multiple allowed)',
      required: true,
      options: [
        'Clinical: medication, medical tasks (catheter, wound care)',
        'Functional: feeding/eating, bathing, dressing, grooming, toileting, ambulation',
        'Cognitive: orientation (time, day, names, location), conversation, answering questions',
        'Decision: medical decisions, financial decisions, non-medical decisions',
        'Housekeeping: preparing meals, cleaning house/yard, shopping, managing wardrobe',
        'Info Management: coordinating care, communicating with care team, managing finances',
        'Logistics: scheduling appointments, reminding, ensuring delivery of necessities',
        'Transport: driving, arranging rides, accompanying to appointments',
        'Companionship: social interaction, conversation, games, music, walks, outings',
        'Caregiver Support: emotional support for other caregivers, filling in/respite',
        'Vigilance: supervision, safety monitoring, accompanying on walks/errands',
        'Pet Care: walking pets, feeding, vet visits, pet management',
        'Skill Development: attending classes, reading books, self-reflection, learning about dementia',
        'Other',
      ],
      config: { tab_section_id: 'tab-activity' },
      tab_section_id: 'tab-activity',
    },
    {
      type: 'text_long',
      text: 'Please describe what you were doing',
      description: 'Describe care activities you performed during this time. If you prefer not to fill each tab separately, you can describe everything here at once.',
      required: false,
      config: { tab_section_id: 'tab-activity' },
      tab_section_id: 'tab-activity',
    },
    {
      type: 'text_long',
      text: 'Unfulfilled Care Needs (Optional)',
      description: 'Describe care activities you couldn\'t do due to various reasons: lack of knowledge, no one available to help, safety concerns, etc.',
      required: false,
      config: { tab_section_id: 'tab-activity' },
      tab_section_id: 'tab-activity',
    },
    {
      type: 'text_long',
      text: 'Ideas or Suggestions (Optional)',
      description: 'Describe resources, tools, or services you think might be helpful. Even if nothing particular happened, you can record your thoughts.',
      required: false,
      config: { tab_section_id: 'tab-activity' },
      tab_section_id: 'tab-activity',
    },
    {
      type: 'number',
      text: 'How long did you spend on this activity (minutes)?',
      description: 'Estimate how much time you spent on this activity (in minutes)',
      required: false,
      config: { tab_section_id: 'tab-activity' },
      tab_section_id: 'tab-activity',
    },
    {
      type: 'single_choice',
      text: 'Urgency Level',
      description: 'How urgent is this situation? Does it need immediate attention?',
      required: false,
      options: ['Low', 'Medium', 'High', 'Urgent'],
      config: { tab_section_id: 'tab-activity' },
      tab_section_id: 'tab-activity',
    },
    {
      type: 'bipolar_scale',
      text: 'How pleasant/unpleasant was this event?',
      description: 'Event Stress Rating: How did this event make you feel?',
      required: true,
      config: { min_value: -3, max_value: 3, min_label: 'Very Unpleasant', max_label: 'Very Pleasant', tab_section_id: 'tab-activity' },
      tab_section_id: 'tab-activity',
    },
    // MBP Section
    {
      type: 'section_header', text: 'Patient Memory/Behavioral Problems',
      required: false,
      config: { section_icon: '🧠', section_color: '#ef4444', tab_section_id: 'tab-activity' },
      tab_section_id: 'tab-activity',
    },
    {
      type: 'yes_no',
      text: 'Did the care recipient show memory problems?',
      description: 'Memory problems: repeating things, misplacing items, not completing tasks, not remembering events or people, difficulty concentrating',
      required: true,
      config: { tab_section_id: 'tab-activity' },
      tab_section_id: 'tab-activity',
    },
    {
      type: 'yes_no',
      text: 'Did the care recipient show behavior problems?',
      description: 'Behavior problems: aggression, wandering, restlessness, repetitive behaviors, sundowning, inappropriate behavior',
      required: true,
      config: { tab_section_id: 'tab-activity' },
      tab_section_id: 'tab-activity',
    },
    {
      type: 'yes_no',
      text: 'Did the care recipient show depressive symptoms?',
      description: 'Depressive symptoms: sadness, crying, withdrawal, loss of interest, changes in appetite/sleep',
      required: true,
      config: { tab_section_id: 'tab-activity' },
      tab_section_id: 'tab-activity',
    },
    {
      type: 'likert_scale',
      text: 'How much distress did these memory/behavior problems cause you?',
      description: 'Rate your level of distress from these problems',
      required: false,
      config: { scale_type: '0-4', custom_labels: ['No distress', 'A little', 'Moderate', 'Quite a bit', 'Extreme distress'], tab_section_id: 'tab-activity' },
      tab_section_id: 'tab-activity',
    },
    // Affect Section - Positive
    {
      type: 'section_header', text: 'Your Wellbeing',
      required: false,
      config: { section_icon: '💛', section_color: '#eab308', tab_section_id: 'tab-activity' },
      tab_section_id: 'tab-activity',
    },
    {
      type: 'likert_scale', text: 'Right now, I feel cheerful',
      required: true,
      config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much', tab_section_id: 'tab-activity' },
      tab_section_id: 'tab-activity',
    },
    {
      type: 'likert_scale', text: 'Right now, I feel relaxed',
      required: true,
      config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much', tab_section_id: 'tab-activity' },
      tab_section_id: 'tab-activity',
    },
    {
      type: 'likert_scale', text: 'Right now, I feel enthusiastic',
      required: true,
      config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much', tab_section_id: 'tab-activity' },
      tab_section_id: 'tab-activity',
    },
    {
      type: 'likert_scale', text: 'Right now, I feel satisfied',
      required: true,
      config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much', tab_section_id: 'tab-activity' },
      tab_section_id: 'tab-activity',
    },
    // Affect Section - Negative
    {
      type: 'likert_scale', text: 'Right now, I feel insecure',
      required: true,
      config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much', tab_section_id: 'tab-activity' },
      tab_section_id: 'tab-activity',
    },
    {
      type: 'likert_scale', text: 'Right now, I feel lonely',
      required: true,
      config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much', tab_section_id: 'tab-activity' },
      tab_section_id: 'tab-activity',
    },
    {
      type: 'likert_scale', text: 'Right now, I feel anxious',
      required: true,
      config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much', tab_section_id: 'tab-activity' },
      tab_section_id: 'tab-activity',
    },
    {
      type: 'likert_scale', text: 'Right now, I feel irritated',
      required: true,
      config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much', tab_section_id: 'tab-activity' },
      tab_section_id: 'tab-activity',
    },
    {
      type: 'likert_scale', text: 'Right now, I feel down',
      required: true,
      config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much', tab_section_id: 'tab-activity' },
      tab_section_id: 'tab-activity',
    },
    {
      type: 'likert_scale', text: 'Right now, I feel desperate',
      required: true,
      config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much', tab_section_id: 'tab-activity' },
      tab_section_id: 'tab-activity',
    },
    {
      type: 'likert_scale', text: 'Right now, I feel tensed',
      required: true,
      config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much', tab_section_id: 'tab-activity' },
      tab_section_id: 'tab-activity',
    },

    // ═══════════════════════════════════════════
    // TAB 2: PEOPLE
    // ═══════════════════════════════════════════
    {
      type: 'section_header', text: 'People & Social Network',
      required: false,
      config: { section_icon: '👥', section_color: '#3b82f6', tab_section_id: 'tab-people' },
      tab_section_id: 'tab-people',
    },
    {
      type: 'text_long',
      text: 'Who was with you or helped you?',
      description: 'Describe who was involved: family (spouse, children), healthcare workers (doctor, nurse, aide), friends, neighbors. What help did they provide? If you prefer not to fill each question separately, you can describe all people-related content here.',
      required: false,
      config: { tab_section_id: 'tab-people' },
      tab_section_id: 'tab-people',
    },
    {
      type: 'text_long',
      text: 'Who else do you wish could have helped?',
      description: 'Describe people you wish could be involved but are not currently helping. E.g. other family members, neighbors, friends, professional caregivers, volunteers, social workers.',
      required: false,
      config: { tab_section_id: 'tab-people' },
      tab_section_id: 'tab-people',
    },
    {
      type: 'text_long',
      text: 'What challenges did you face reaching the people you needed?',
      description: 'Describe challenges in contacting or getting help: felt awkward asking, didn\'t know how to explain care needs, worried they wouldn\'t know how to care, scheduling conflicts, couldn\'t reach them.',
      required: false,
      config: { tab_section_id: 'tab-people' },
      tab_section_id: 'tab-people',
    },

    // ═══════════════════════════════════════════
    // TAB 3: CHALLENGES & RESOURCES
    // ═══════════════════════════════════════════
    {
      type: 'section_header', text: 'Challenges & Resources',
      required: false,
      config: { section_icon: '🛠️', section_color: '#f59e0b', tab_section_id: 'tab-challenges' },
      tab_section_id: 'tab-challenges',
    },
    {
      type: 'bipolar_scale',
      text: 'How challenging was this activity overall?',
      description: 'Rate the level of challenge you encountered while performing this task',
      required: true,
      config: { min_value: -3, max_value: 3, min_label: 'No Challenges', max_label: 'Extreme Challenges', tab_section_id: 'tab-challenges' },
      tab_section_id: 'tab-challenges',
    },
    {
      type: 'checkbox_group',
      text: 'What types of challenges did you experience?',
      description: 'Select all challenge types that apply. If you prefer not to fill each tab separately, you can describe all challenges and resource needs in the text field below.',
      required: false,
      options: [
        'Don\'t know how to handle dementia symptoms',
        'Don\'t understand patient\'s condition',
        'Lack of recent updates on patient\'s condition/progression',
        'Coordination difficulties',
        'Time constraints',
        'Emotional stress',
        'Physical demands',
        'Communication barriers',
        'Safety/liability concerns',
        'Privacy concerns',
        'Other',
      ],
      config: { tab_section_id: 'tab-challenges' },
      tab_section_id: 'tab-challenges',
    },
    {
      type: 'text_long',
      text: 'Describe your challenges in detail',
      description: 'Describe difficulties you encountered: not knowing how to handle symptoms, not understanding the patient\'s condition, time constraints, emotional stress, coordination problems.',
      required: false,
      config: { tab_section_id: 'tab-challenges' },
      tab_section_id: 'tab-challenges',
    },
    {
      type: 'text_long',
      text: 'What resources or tools are you currently using?',
      description: 'Describe tools or resources you currently use and any challenges in using them. E.g. care apps, reminder tools, information websites, support groups, family help.',
      required: false,
      config: { tab_section_id: 'tab-challenges' },
      tab_section_id: 'tab-challenges',
    },
    {
      type: 'text_long',
      text: 'What resources or tools do you wish you had?',
      description: 'Describe new tools you wish existed, or improvements to current tools. E.g. better care coordination apps, platforms to find helpers, patient info sharing tools.',
      required: false,
      config: { tab_section_id: 'tab-challenges' },
      tab_section_id: 'tab-challenges',
    },
  ];

  let idx = 0;
  for (const q of questions) {
    const config = { ...(q.config || {}) };
    if (q.tab_section_id) {
      config.tab_section_id = q.tab_section_id;
    }
    await insertQuestionWithOptions(projectId, questionnaireId, { ...q, config }, idx);
    idx++;
  }

  return idx;
}

async function seedDailyQuestions(projectId: string, questionnaireId: string): Promise<number> {
  // Full replication of EndOfDaySurvey.tsx
  const questions: Array<{
    type: string; text: string; description?: string; required: boolean;
    config?: any; options?: string[];
  }> = [
    {
      type: 'section_header', text: 'Daily Sense of Competence',
      required: false,
      config: { section_icon: '🧠', section_color: '#8b5cf6' },
    },
    {
      type: 'likert_scale',
      text: 'Today I felt stressed due to my care responsibilities',
      description: 'Based on today\'s caregiving experience (1=Strongly Disagree to 7=Strongly Agree)',
      required: true,
      config: { scale_type: '1-7', min_label: 'Strongly Disagree', max_label: 'Strongly Agree' },
    },
    {
      type: 'likert_scale',
      text: 'Today I felt that the situation with my care recipient did not allow me as much privacy as I would have liked',
      description: '1=Strongly Disagree to 7=Strongly Agree',
      required: true,
      config: { scale_type: '1-7', min_label: 'Strongly Disagree', max_label: 'Strongly Agree' },
    },
    {
      type: 'likert_scale',
      text: 'Today I felt strained in the interactions with my care recipient',
      description: '1=Strongly Disagree to 7=Strongly Agree',
      required: true,
      config: { scale_type: '1-7', min_label: 'Strongly Disagree', max_label: 'Strongly Agree' },
    },
    {
      type: 'section_header', text: 'Daily Burden Rating',
      required: false,
      config: { section_icon: '📊', section_color: '#f59e0b' },
    },
    {
      type: 'bipolar_scale',
      text: 'Overall, how burdensome or manageable was caregiving today?',
      description: 'Rate your overall caregiving burden for today',
      required: true,
      config: { min_value: -3, max_value: 3, min_label: 'Very Burdensome', max_label: 'Very Manageable' },
    },
    {
      type: 'section_header', text: 'Supplement Missed Logs',
      required: false,
      config: { section_icon: '📝', section_color: '#10b981' },
    },
    {
      type: 'text_long',
      text: 'Supplemental notes for today',
      description: 'If there are caregiving activities today that were not recorded during hourly reminders, you can add notes here.',
      required: false,
    },
  ];

  let idx = 0;
  for (const q of questions) {
    await insertQuestionWithOptions(projectId, questionnaireId, q, idx);
    idx++;
  }

  return idx;
}
