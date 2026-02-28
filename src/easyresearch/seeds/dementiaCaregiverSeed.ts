// Seed data for Dementia Caregiver ESM project
// Replicates the standalone dementia-survey app's full questionnaire structure
// 2 participant types, screening, consent, 2x hourly logs, 2x daily reflections

import type { QuestionnaireConfig } from '../components/QuestionnaireList';
import type { ParticipantType } from '../components/ParticipantTypeManager';

function makeQ(order: number, type: string, text: string, desc: string, config: any = {}, options: string[] = [], required = false) {
  return {
    id: crypto.randomUUID(),
    question_type: type,
    question_text: text,
    question_description: desc,
    question_config: config,
    required,
    order_index: order,
    voice_enabled: config?.voice_enabled || false,
    ai_enabled: config?.ai_enabled || false,
    options: options.map((opt, i) => ({
      id: crypto.randomUUID(),
      option_text: opt,
      option_value: opt.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 50),
      order_index: i,
    })),
  };
}

export function createDementiaSeedParticipantTypes(): ParticipantType[] {
  return [
    {
      id: crypto.randomUUID(),
      name: 'Primary Caregiver',
      description: 'Main caregiver who provides daily hands-on care to the person with dementia',
      color: '#10b981',
      relations: ['Spouse/Partner', 'Adult Child', 'Parent', 'Sibling', 'Other Relative', 'Friend/Neighbor', 'Professional Caregiver'],
      consent_forms: [],
      screening_questions: [],
      order_index: 0,
    },
    {
      id: crypto.randomUUID(),
      name: 'Family Member',
      description: 'Family member involved in care coordination or emotional support but not primary daily caregiver',
      color: '#3b82f6',
      relations: ['Spouse/Partner', 'Adult Child', 'Sibling', 'Other Relative', 'Friend'],
      consent_forms: [],
      screening_questions: [],
      order_index: 1,
    },
  ];
}

export function createDementiaSeedQuestionnaires(primaryPtId: string, familyPtId: string): QuestionnaireConfig[] {
  const allPtIds = [primaryPtId, familyPtId];

  // ─── 1. SCREENING ───
  const screening: QuestionnaireConfig = {
    id: crypto.randomUUID(),
    questionnaire_type: 'screening',
    title: 'Eligibility Screening',
    description: 'Check if participant qualifies for the 7-day dementia caregiver study',
    estimated_duration: 2,
    frequency: 'once',
    time_windows: [{ start: '09:00', end: '21:00' }],
    notification_enabled: false,
    notification_minutes_before: 0,
    dnd_allowed: false,
    dnd_default_start: '22:00',
    dnd_default_end: '08:00',
    assigned_participant_types: allPtIds,
    order_index: 0,
    questions: [
      makeQ(0, 'yes_no', 'Are you currently providing care or support to someone with dementia?', 'This study is specifically for dementia caregivers.', { yes_label: 'Yes', no_label: 'No', disqualify_value: 'no' }, [], true),
      makeQ(1, 'yes_no', 'Are you 18 years of age or older?', 'Participants must be at least 18 years old.', { yes_label: 'Yes', no_label: 'No', disqualify_value: 'no' }, [], true),
      makeQ(2, 'yes_no', 'Can you commit to logging caregiving activities for 7 consecutive days?', 'The study requires daily participation for one week.', { yes_label: 'Yes', no_label: 'No', disqualify_value: 'no' }, [], true),
      makeQ(3, 'single_choice', 'What is your relationship to the person with dementia?', 'Select the option that best describes your role.', {}, ['Spouse/Partner', 'Adult Child', 'Parent', 'Sibling', 'Other Relative', 'Friend/Neighbor', 'Professional Caregiver', 'Other'], true),
    ],
  };

  // ─── 2. CONSENT ───
  const consent: QuestionnaireConfig = {
    id: crypto.randomUUID(),
    questionnaire_type: 'consent',
    title: 'Research Consent Form',
    description: 'Informed consent for the 7-day Dementia Caregiver ESM study',
    estimated_duration: 3,
    frequency: 'once',
    time_windows: [{ start: '09:00', end: '21:00' }],
    notification_enabled: false,
    notification_minutes_before: 0,
    dnd_allowed: false,
    dnd_default_start: '22:00',
    dnd_default_end: '08:00',
    assigned_participant_types: allPtIds,
    order_index: 1,
    consent_text: 'By participating in this study, you consent to:\n\n1. Log your daily caregiving activities for 7 consecutive days using hourly prompts\n2. Complete screening questionnaires and baseline assessments\n3. Allow researchers to analyze your anonymized data for academic research\n4. Optionally participate in a follow-up interview\n\nYour data will be kept strictly confidential and used only for research purposes. You may withdraw at any time without penalty. All data is stored securely and access is limited to the research team.',
    consent_required: true,
    questions: [
      makeQ(0, 'instruction', 'Please read the consent information carefully before agreeing to participate.', 'This study examines the daily caregiving experiences of dementia caregivers over a 7-day period using Experience Sampling Method (ESM).'),
      makeQ(1, 'yes_no', 'I have read and understood the study information and agree to participate', 'You must agree to continue with enrollment.', { yes_label: 'I Agree', no_label: 'I Do Not Agree' }, [], true),
    ],
  };

  // ─── 3. HOURLY LOG — PRIMARY CAREGIVER (full 39 questions across 6 sections) ───
  const hourlyPrimary: QuestionnaireConfig = {
    id: crypto.randomUUID(),
    questionnaire_type: 'survey',
    title: 'Hourly Activity Log (Primary Caregiver)',
    description: 'Log each caregiving activity — includes activity details, patient behavior, affect ratings, people involved, challenges & resources, and daily sense of competence',
    estimated_duration: 8,
    frequency: 'hourly',
    time_windows: [{ start: '09:00', end: '21:00' }],
    notification_enabled: true,
    notification_minutes_before: 5,
    dnd_allowed: true,
    dnd_default_start: '22:00',
    dnd_default_end: '08:00',
    assigned_participant_types: [primaryPtId],
    order_index: 2,
    questions: [
      // Section 1: Activity
      makeQ(0, 'section_header', 'Activity', 'What caregiving activity did you do?', { section_icon: '📋', section_color: '#10b981' }),
      makeQ(1, 'single_choice', 'Entry Type', 'Choose the type that best describes this entry', {}, ['Care Activity', 'Care Need', 'Struggle'], true),
      makeQ(2, 'checkbox_group', 'Activity Category', 'Select all categories that apply to this activity', { layout: 'vertical' }, [
        'ADL (eating, bathing, dressing, toileting, mobility)',
        'IADL (medication, finances, shopping, cooking, housework)',
        'Medical care (doctor visits, treatments, monitoring)',
        'Emotional support (companionship, reassurance, comfort)',
        'Supervision/Safety (wandering prevention, fall prevention)',
        'Transportation',
        'Care coordination',
        'Other'
      ]),
      makeQ(3, 'text_long', 'Description', 'Describe in detail the care activity you performed. Include people involved, challenges encountered, and resources used.', { max_length: 2000, voice_enabled: true, ai_enabled: true }),
      makeQ(4, 'number', 'Time Spent (minutes)', 'Estimate how much time you spent on this activity', { min_value: 0, max_value: 480 }),
      makeQ(5, 'bipolar_scale', 'Event Stress Rating', 'How did this event make you feel?', { min_value: -3, max_value: 3, step: 1, min_label: 'Very Unpleasant', max_label: 'Very Pleasant', show_value_labels: true }),
      makeQ(6, 'single_choice', 'Urgency Level', 'How urgent was this situation?', {}, ['Low', 'Medium', 'High', 'Urgent']),

      // Section 2: Patient Memory/Behavioral Problems
      makeQ(7, 'section_header', 'Patient Behavior', 'Memory and behavioral problems during this activity', { section_icon: '🧠', section_color: '#8b5cf6' }),
      makeQ(8, 'yes_no', 'Did the patient show memory problems during this event?', 'e.g., forgetting names, getting lost, repeating questions', { yes_label: 'Yes', no_label: 'No' }),
      makeQ(9, 'yes_no', 'Did the patient show behavioral problems during this event?', 'e.g., agitation, aggression, wandering, sundowning', { yes_label: 'Yes', no_label: 'No' }),
      makeQ(10, 'yes_no', 'Did the patient show depressive symptoms during this event?', 'e.g., sadness, withdrawal, crying, loss of interest', { yes_label: 'Yes', no_label: 'No' }),
      makeQ(11, 'likert_scale', 'MBP-Related Distress', 'How distressed were you by these memory/behavioral problems?', { min_value: 0, max_value: 4, labels: ['0 - Not at all', '1 - A little', '2 - Moderately', '3 - Quite a bit', '4 - Extremely'] }),

      // Section 3: Affect
      makeQ(12, 'section_header', 'How You Feel', 'Rate your current feelings right now', { section_icon: '💚', section_color: '#f59e0b' }),
      makeQ(13, 'instruction', 'Rate each feeling from 1 (Not at all) to 7 (Very much). How do you feel RIGHT NOW?', ''),
      makeQ(14, 'likert_scale', 'Cheerful', '', { min_value: 1, max_value: 7, min_label: 'Not at all', max_label: 'Very much' }),
      makeQ(15, 'likert_scale', 'Relaxed', '', { min_value: 1, max_value: 7, min_label: 'Not at all', max_label: 'Very much' }),
      makeQ(16, 'likert_scale', 'Enthusiastic', '', { min_value: 1, max_value: 7, min_label: 'Not at all', max_label: 'Very much' }),
      makeQ(17, 'likert_scale', 'Satisfied', '', { min_value: 1, max_value: 7, min_label: 'Not at all', max_label: 'Very much' }),
      makeQ(18, 'likert_scale', 'Insecure', '', { min_value: 1, max_value: 7, min_label: 'Not at all', max_label: 'Very much' }),
      makeQ(19, 'likert_scale', 'Lonely', '', { min_value: 1, max_value: 7, min_label: 'Not at all', max_label: 'Very much' }),
      makeQ(20, 'likert_scale', 'Anxious', '', { min_value: 1, max_value: 7, min_label: 'Not at all', max_label: 'Very much' }),
      makeQ(21, 'likert_scale', 'Irritated', '', { min_value: 1, max_value: 7, min_label: 'Not at all', max_label: 'Very much' }),
      makeQ(22, 'likert_scale', 'Down', '', { min_value: 1, max_value: 7, min_label: 'Not at all', max_label: 'Very much' }),
      makeQ(23, 'likert_scale', 'Desperate', '', { min_value: 1, max_value: 7, min_label: 'Not at all', max_label: 'Very much' }),
      makeQ(24, 'likert_scale', 'Tense', '', { min_value: 1, max_value: 7, min_label: 'Not at all', max_label: 'Very much' }),

      // Section 4: People
      makeQ(25, 'section_header', 'People', 'Who was involved in this caregiving event?', { section_icon: '👥', section_color: '#3b82f6' }),
      makeQ(26, 'text_long', 'People Involved', 'Describe who was involved: family, healthcare workers, friends, neighbors. What help did they provide?', { voice_enabled: true, ai_enabled: true }),
      makeQ(27, 'text_long', 'Who Else Do You Wish Could Help?', 'Describe people you wish could be involved but are not currently helping.', { voice_enabled: true, ai_enabled: true }),
      makeQ(28, 'text_long', 'Challenges Reaching Those People', 'What challenges do you face in contacting or getting help from them?', { voice_enabled: true, ai_enabled: true }),

      // Section 5: Challenges & Resources
      makeQ(29, 'section_header', 'Challenges & Resources', 'Difficulties and tools related to this activity', { section_icon: '🔧', section_color: '#ef4444' }),
      makeQ(30, 'bipolar_scale', 'Task Difficulty', 'How much challenge did you encounter while performing this task?', { min_value: -3, max_value: 3, step: 1, min_label: 'No challenges', max_label: 'Extreme challenges', show_value_labels: true }),
      makeQ(31, 'checkbox_group', 'Challenge Types', 'Select all that apply', { layout: 'vertical' }, [
        "Don't know how to handle dementia symptoms",
        "Don't understand patient's condition",
        "Lack of recent updates on patient's condition/progression",
        'Coordination difficulties',
        'Time constraints',
        'Emotional stress',
        'Physical demands',
        'Communication barriers',
        'Safety/liability concerns',
        'Privacy concerns',
        'Other'
      ]),
      makeQ(32, 'text_long', 'Challenges Faced', 'Describe the difficulties you encountered in detail.', { voice_enabled: true, ai_enabled: true }),
      makeQ(33, 'text_long', 'Resources Currently Using & Challenges', 'Describe tools or resources you currently use and any challenges in using them.', { voice_enabled: true, ai_enabled: true }),
      makeQ(34, 'text_long', 'Resources You Wish Existed or Improved', 'Describe new tools you wish existed, or improvements to current tools.', { voice_enabled: true, ai_enabled: true }),

      // Section 6: Daily Sense of Competence (per-entry ESM items)
      makeQ(35, 'section_header', 'Daily Sense of Competence', 'Quick check-in (SSCQ ESM items)', { section_icon: '📊', section_color: '#06b6d4' }),
      makeQ(36, 'likert_scale', 'I feel stressed because of my care responsibilities', '1=Strongly Disagree to 7=Strongly Agree', { min_value: 1, max_value: 7, min_label: 'Strongly Disagree', max_label: 'Strongly Agree' }),
      makeQ(37, 'likert_scale', 'The situation with my care recipient does not allow me as much privacy as I would like', '', { min_value: 1, max_value: 7, min_label: 'Strongly Disagree', max_label: 'Strongly Agree' }),
      makeQ(38, 'likert_scale', 'I feel strained in interactions with my care recipient', '', { min_value: 1, max_value: 7, min_label: 'Strongly Disagree', max_label: 'Strongly Agree' }),
    ],
  };

  // ─── 4. HOURLY LOG — FAMILY MEMBER (simplified 12 questions, 3 sections) ───
  const hourlyFamily: QuestionnaireConfig = {
    id: crypto.randomUUID(),
    questionnaire_type: 'survey',
    title: 'Hourly Activity Log (Family Member)',
    description: 'Log your support and coordination activities throughout the day',
    estimated_duration: 4,
    frequency: 'hourly',
    time_windows: [{ start: '09:00', end: '21:00' }],
    notification_enabled: true,
    notification_minutes_before: 5,
    dnd_allowed: true,
    dnd_default_start: '22:00',
    dnd_default_end: '08:00',
    assigned_participant_types: [familyPtId],
    order_index: 3,
    questions: [
      makeQ(0, 'section_header', 'Activity', 'What support activity did you do?', { section_icon: '📋', section_color: '#3b82f6' }),
      makeQ(1, 'single_choice', 'Entry Type', 'Choose the type that best describes this entry', {}, ['Support Activity', 'Care Need Observed', 'Coordination Task'], true),
      makeQ(2, 'checkbox_group', 'Activity Category', 'Select all categories that apply', { layout: 'vertical' }, [
        'Emotional support / companionship',
        'Care coordination / scheduling',
        'Transportation',
        'Financial / administrative support',
        'Shopping / errands',
        'Medical accompaniment',
        'Respite for primary caregiver',
        'Other'
      ]),
      makeQ(3, 'text_long', 'Description', 'Describe what you did and how it went.', { max_length: 2000, voice_enabled: true, ai_enabled: true }),
      makeQ(4, 'number', 'Time Spent (minutes)', 'Estimate time spent', { min_value: 0, max_value: 480 }),
      makeQ(5, 'bipolar_scale', 'How did this feel?', 'Rate your experience', { min_value: -3, max_value: 3, step: 1, min_label: 'Very Stressful', max_label: 'Very Positive', show_value_labels: true }),

      makeQ(6, 'section_header', 'People & Coordination', 'Who was involved?', { section_icon: '👥', section_color: '#8b5cf6' }),
      makeQ(7, 'text_long', 'People Involved', 'Who else was involved in this activity?', { voice_enabled: true }),
      makeQ(8, 'text_long', 'Coordination Challenges', 'Any difficulties coordinating with the primary caregiver or others?', { voice_enabled: true }),

      makeQ(9, 'section_header', 'Challenges', 'What challenges did you face?', { section_icon: '🔧', section_color: '#ef4444' }),
      makeQ(10, 'checkbox_group', 'Challenge Types', 'Select all that apply', { layout: 'vertical' }, [
        'Difficulty coordinating with primary caregiver',
        'Lack of information about patient condition',
        'Time/schedule constraints',
        'Emotional burden',
        'Distance / travel',
        'Communication barriers',
        'Other'
      ]),
      makeQ(11, 'text_long', 'Additional Notes', 'Any other challenges, observations, or suggestions?', { voice_enabled: true, ai_enabled: true }),
    ],
  };

  // ─── 5. DAILY REFLECTION — PRIMARY CAREGIVER (9 questions, 3 sections) ───
  const dailyPrimary: QuestionnaireConfig = {
    id: crypto.randomUUID(),
    questionnaire_type: 'survey',
    title: 'Daily Reflection (Primary Caregiver)',
    description: 'End-of-day reflection: sense of competence, daily burden rating, and supplemental notes',
    estimated_duration: 5,
    frequency: 'daily',
    time_windows: [{ start: '20:00', end: '23:00' }],
    notification_enabled: true,
    notification_minutes_before: 15,
    dnd_allowed: true,
    dnd_default_start: '23:00',
    dnd_default_end: '08:00',
    assigned_participant_types: [primaryPtId],
    order_index: 4,
    questions: [
      makeQ(0, 'section_header', 'Daily Sense of Competence', "Reflect on today's caregiving", { section_icon: '🌙', section_color: '#8b5cf6' }),
      makeQ(1, 'instruction', 'Based on today\'s caregiving experience, please answer the following (1=Strongly Disagree to 7=Strongly Agree)', ''),
      makeQ(2, 'likert_scale', 'Today I felt stressed due to my care responsibilities', '', { min_value: 1, max_value: 7, min_label: 'Strongly Disagree', max_label: 'Strongly Agree' }, [], true),
      makeQ(3, 'likert_scale', 'Today I felt that the situation did not allow me as much privacy as I would have liked', '', { min_value: 1, max_value: 7, min_label: 'Strongly Disagree', max_label: 'Strongly Agree' }, [], true),
      makeQ(4, 'likert_scale', 'Today I felt strained in interactions with my care recipient', '', { min_value: 1, max_value: 7, min_label: 'Strongly Disagree', max_label: 'Strongly Agree' }, [], true),

      makeQ(5, 'section_header', 'Daily Burden Rating', 'Overall how did today feel?', { section_icon: '⚖️', section_color: '#f59e0b' }),
      makeQ(6, 'bipolar_scale', 'Overall, how did caregiving feel for you today?', '', { min_value: -3, max_value: 3, step: 1, min_label: 'Very burdensome', max_label: 'Very manageable', show_value_labels: true }, [], true),

      makeQ(7, 'section_header', 'Supplement Missed Logs', "Anything you didn't capture today?", { section_icon: '📝', section_color: '#06b6d4' }),
      makeQ(8, 'text_long', 'Supplemental Notes', 'If there are caregiving activities today that were not recorded during hourly reminders, add notes here.', { voice_enabled: true, ai_enabled: true }),
    ],
  };

  // ─── 6. DAILY REFLECTION — FAMILY MEMBER (5 questions, 1 section) ───
  const dailyFamily: QuestionnaireConfig = {
    id: crypto.randomUUID(),
    questionnaire_type: 'survey',
    title: 'Daily Reflection (Family Member)',
    description: 'End-of-day reflection on your coordination and support role',
    estimated_duration: 3,
    frequency: 'daily',
    time_windows: [{ start: '20:00', end: '23:00' }],
    notification_enabled: true,
    notification_minutes_before: 15,
    dnd_allowed: true,
    dnd_default_start: '23:00',
    dnd_default_end: '08:00',
    assigned_participant_types: [familyPtId],
    order_index: 5,
    questions: [
      makeQ(0, 'section_header', 'Daily Reflection', 'How was your day as a family member?', { section_icon: '🌙', section_color: '#3b82f6' }),
      makeQ(1, 'bipolar_scale', 'Overall, how did your support role feel today?', '', { min_value: -3, max_value: 3, step: 1, min_label: 'Very burdensome', max_label: 'Very manageable', show_value_labels: true }, [], true),
      makeQ(2, 'likert_scale', 'Today I felt I was able to contribute meaningfully', '', { min_value: 1, max_value: 7, min_label: 'Strongly Disagree', max_label: 'Strongly Agree' }),
      makeQ(3, 'likert_scale', 'Today I felt well-coordinated with the primary caregiver', '', { min_value: 1, max_value: 7, min_label: 'Strongly Disagree', max_label: 'Strongly Agree' }),
      makeQ(4, 'text_long', 'Supplemental Notes', 'Anything else to add about today?', { voice_enabled: true }),
    ],
  };

  return [screening, consent, hourlyPrimary, hourlyFamily, dailyPrimary, dailyFamily];
}
