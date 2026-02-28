import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yekarqanirdkdckimpna.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlla2FycWFuaXJka2Rja2ltcG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzUwOTQsImV4cCI6MjA1OTg1MTA5NH0.WQlbyilIuH_Vz_Oit-M5MZ9II9oqO7tg-ThkZ5GCtfc';
const PROJECT_ID = '9d7c861b-0e3d-4d69-9a15-5fda7979bbac';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  db: { schema: 'care_connector' },
  global: { headers: { 'Accept-Profile': 'care_connector', 'Content-Profile': 'care_connector' } }
});

// Helper to create a question object
function q(order, type, text, desc, config = {}, options = [], required = false) {
  return { order, type, text, desc, config, options, required };
}

// ─── PARTICIPANT TYPES ───
const participantTypes = [
  { name: 'Primary Caregiver', description: 'Main caregiver who provides daily hands-on care to the person with dementia', color: '#10b981', relations: ['Spouse/Partner', 'Adult Child', 'Parent', 'Sibling', 'Other Relative', 'Friend/Neighbor', 'Professional Caregiver'] },
  { name: 'Family Member', description: 'Family member involved in care coordination or emotional support but not primary daily caregiver', color: '#3b82f6', relations: ['Spouse/Partner', 'Adult Child', 'Sibling', 'Other Relative', 'Friend'] },
];

// ─── SCREENING QUESTIONS ───
const screeningQuestions = [
  q(1, 'yes_no', 'Are you currently providing care or support to someone with dementia?', 'This study is specifically for dementia caregivers.', { yes_label: 'Yes', no_label: 'No', disqualify_value: 'no' }, [], true),
  q(2, 'yes_no', 'Are you 18 years of age or older?', 'Participants must be at least 18 years old.', { yes_label: 'Yes', no_label: 'No', disqualify_value: 'no' }, [], true),
  q(3, 'yes_no', 'Can you commit to logging caregiving activities for 7 consecutive days?', 'The study requires daily participation for one week.', { yes_label: 'Yes', no_label: 'No', disqualify_value: 'no' }, [], true),
  q(4, 'single_choice', 'What is your relationship to the person with dementia?', 'Select the option that best describes your role.', {}, [
    'Spouse/Partner', 'Adult Child', 'Parent', 'Sibling', 'Other Relative', 'Friend/Neighbor', 'Professional Caregiver', 'Other'
  ], true),
];

// ─── HOURLY LOG — PRIMARY CAREGIVER (full version) ───
const hourlyPrimaryQuestions = [
  // Section 1: Activity
  q(1, 'section_header', 'Activity', 'What caregiving activity did you do?', { section_icon: '📋', section_color: '#10b981' }),
  q(2, 'single_choice', 'Entry Type', 'Choose the type that best describes this entry', {}, ['Care Activity', 'Care Need', 'Struggle'], true),
  q(3, 'checkbox_group', 'Activity Category', 'Select all categories that apply to this activity', { layout: 'vertical' }, [
    'ADL (eating, bathing, dressing, toileting, mobility)',
    'IADL (medication, finances, shopping, cooking, housework)',
    'Medical care (doctor visits, treatments, monitoring)',
    'Emotional support (companionship, reassurance, comfort)',
    'Supervision/Safety (wandering prevention, fall prevention)',
    'Transportation',
    'Care coordination',
    'Other'
  ], false),
  q(4, 'text_long', 'Description', 'Describe in detail the care activity you performed. Include people involved, challenges encountered, and resources used.', { max_length: 2000, voice_enabled: true, ai_enabled: true }),
  q(5, 'number', 'Time Spent (minutes)', 'Estimate how much time you spent on this activity', { min_value: 0, max_value: 480 }),
  q(6, 'bipolar_scale', 'Event Stress Rating', 'How did this event make you feel?', { min_value: -3, max_value: 3, step: 1, min_label: 'Very Unpleasant', max_label: 'Very Pleasant', show_value_labels: true }),
  q(7, 'single_choice', 'Urgency Level', 'How urgent was this situation?', {}, ['Low', 'Medium', 'High', 'Urgent']),

  // Section 2: Patient Memory/Behavioral Problems (MBP)
  q(8, 'section_header', 'Patient Behavior', 'Memory and behavioral problems during this activity', { section_icon: '🧠', section_color: '#8b5cf6' }),
  q(9, 'yes_no', 'Did the patient show memory problems during this event?', 'e.g., forgetting names, getting lost, repeating questions', { yes_label: 'Yes', no_label: 'No' }),
  q(10, 'yes_no', 'Did the patient show behavioral problems during this event?', 'e.g., agitation, aggression, wandering, sundowning', { yes_label: 'Yes', no_label: 'No' }),
  q(11, 'yes_no', 'Did the patient show depressive symptoms during this event?', 'e.g., sadness, withdrawal, crying, loss of interest', { yes_label: 'Yes', no_label: 'No' }),
  q(12, 'likert_scale', 'MBP-Related Distress', 'How distressed were you by these memory/behavioral problems? (0=Not at all, 4=Extremely)', { min_value: 0, max_value: 4, labels: ['Not at all', 'A little', 'Moderately', 'Quite a bit', 'Extremely'] }),

  // Section 3: Affect
  q(13, 'section_header', 'How You Feel', 'Rate your current feelings', { section_icon: '💚', section_color: '#f59e0b' }),
  q(14, 'instruction', 'Rate each feeling from 1 (Not at all) to 7 (Very much). How do you feel RIGHT NOW?', ''),
  q(15, 'likert_scale', 'Cheerful', '', { min_value: 1, max_value: 7, min_label: 'Not at all', max_label: 'Very much' }),
  q(16, 'likert_scale', 'Relaxed', '', { min_value: 1, max_value: 7, min_label: 'Not at all', max_label: 'Very much' }),
  q(17, 'likert_scale', 'Enthusiastic', '', { min_value: 1, max_value: 7, min_label: 'Not at all', max_label: 'Very much' }),
  q(18, 'likert_scale', 'Satisfied', '', { min_value: 1, max_value: 7, min_label: 'Not at all', max_label: 'Very much' }),
  q(19, 'likert_scale', 'Insecure', '', { min_value: 1, max_value: 7, min_label: 'Not at all', max_label: 'Very much' }),
  q(20, 'likert_scale', 'Lonely', '', { min_value: 1, max_value: 7, min_label: 'Not at all', max_label: 'Very much' }),
  q(21, 'likert_scale', 'Anxious', '', { min_value: 1, max_value: 7, min_label: 'Not at all', max_label: 'Very much' }),
  q(22, 'likert_scale', 'Irritated', '', { min_value: 1, max_value: 7, min_label: 'Not at all', max_label: 'Very much' }),
  q(23, 'likert_scale', 'Down', '', { min_value: 1, max_value: 7, min_label: 'Not at all', max_label: 'Very much' }),
  q(24, 'likert_scale', 'Desperate', '', { min_value: 1, max_value: 7, min_label: 'Not at all', max_label: 'Very much' }),
  q(25, 'likert_scale', 'Tense', '', { min_value: 1, max_value: 7, min_label: 'Not at all', max_label: 'Very much' }),

  // Section 4: People
  q(26, 'section_header', 'People', 'Who was involved in this caregiving event?', { section_icon: '👥', section_color: '#3b82f6' }),
  q(27, 'text_long', 'People Involved', 'Describe who was involved: family, healthcare workers, friends, neighbors. What help did they provide?', { voice_enabled: true, ai_enabled: true }),
  q(28, 'text_long', 'Who Else Do You Wish Could Help?', 'Describe people you wish could be involved but are not currently helping.', { voice_enabled: true, ai_enabled: true }),
  q(29, 'text_long', 'Challenges Reaching Those People', 'What challenges do you face in contacting or getting help from them?', { voice_enabled: true, ai_enabled: true }),

  // Section 5: Challenges & Resources
  q(30, 'section_header', 'Challenges & Resources', 'Difficulties and tools related to this activity', { section_icon: '🔧', section_color: '#ef4444' }),
  q(31, 'bipolar_scale', 'Task Difficulty', 'How much challenge did you encounter while performing this task?', { min_value: -3, max_value: 3, step: 1, min_label: 'No challenges', max_label: 'Extreme challenges', show_value_labels: true }),
  q(32, 'checkbox_group', 'Challenge Types', 'Select all that apply', { layout: 'vertical' }, [
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
  q(33, 'text_long', 'Challenges Faced', 'Describe the difficulties you encountered in detail.', { voice_enabled: true, ai_enabled: true }),
  q(34, 'text_long', 'Resources Currently Using & Challenges', 'Describe tools or resources you currently use and any challenges in using them.', { voice_enabled: true, ai_enabled: true }),
  q(35, 'text_long', 'Resources You Wish Existed or Improved', 'Describe new tools you wish existed, or improvements to current tools.', { voice_enabled: true, ai_enabled: true }),

  // Section 6: Daily SoC (per-entry)
  q(36, 'section_header', 'Daily Sense of Competence', 'Quick daily check-in questions', { section_icon: '📊', section_color: '#06b6d4' }),
  q(37, 'likert_scale', 'I feel stressed because of my care responsibilities', '1=Strongly Disagree to 7=Strongly Agree', { min_value: 1, max_value: 7, min_label: 'Strongly Disagree', max_label: 'Strongly Agree' }),
  q(38, 'likert_scale', 'The situation with my care recipient does not allow me as much privacy as I would like', '', { min_value: 1, max_value: 7, min_label: 'Strongly Disagree', max_label: 'Strongly Agree' }),
  q(39, 'likert_scale', 'I feel strained in interactions with my care recipient', '', { min_value: 1, max_value: 7, min_label: 'Strongly Disagree', max_label: 'Strongly Agree' }),
];

// ─── HOURLY LOG — FAMILY MEMBER (simplified) ───
const hourlyFamilyQuestions = [
  q(1, 'section_header', 'Activity', 'What support activity did you do?', { section_icon: '📋', section_color: '#3b82f6' }),
  q(2, 'single_choice', 'Entry Type', 'Choose the type that best describes this entry', {}, ['Support Activity', 'Care Need Observed', 'Coordination Task'], true),
  q(3, 'checkbox_group', 'Activity Category', 'Select all categories that apply', { layout: 'vertical' }, [
    'Emotional support / companionship',
    'Care coordination / scheduling',
    'Transportation',
    'Financial / administrative support',
    'Shopping / errands',
    'Medical accompaniment',
    'Respite for primary caregiver',
    'Other'
  ], false),
  q(4, 'text_long', 'Description', 'Describe what you did and how it went.', { max_length: 2000, voice_enabled: true, ai_enabled: true }),
  q(5, 'number', 'Time Spent (minutes)', 'Estimate time spent', { min_value: 0, max_value: 480 }),
  q(6, 'bipolar_scale', 'How did this feel?', 'Rate your experience', { min_value: -3, max_value: 3, step: 1, min_label: 'Very Stressful', max_label: 'Very Positive', show_value_labels: true }),

  q(7, 'section_header', 'People & Coordination', 'Who was involved?', { section_icon: '👥', section_color: '#8b5cf6' }),
  q(8, 'text_long', 'People Involved', 'Who else was involved in this activity?', { voice_enabled: true }),
  q(9, 'text_long', 'Coordination Challenges', 'Any difficulties coordinating with the primary caregiver or others?', { voice_enabled: true }),

  q(10, 'section_header', 'Challenges', 'What challenges did you face?', { section_icon: '🔧', section_color: '#ef4444' }),
  q(11, 'checkbox_group', 'Challenge Types', 'Select all that apply', { layout: 'vertical' }, [
    'Difficulty coordinating with primary caregiver',
    'Lack of information about patient condition',
    'Time/schedule constraints',
    'Emotional burden',
    'Distance / travel',
    'Communication barriers',
    'Other'
  ]),
  q(12, 'text_long', 'Additional Notes', 'Any other challenges, observations, or suggestions?', { voice_enabled: true, ai_enabled: true }),
];

// ─── DAILY REFLECTION — PRIMARY CAREGIVER (full SoC + burden + supplement) ───
const dailyPrimaryQuestions = [
  q(1, 'section_header', 'Daily Sense of Competence', 'Reflect on today\'s caregiving', { section_icon: '🌙', section_color: '#8b5cf6' }),
  q(2, 'instruction', 'Based on today\'s caregiving experience, please answer the following (1=Strongly Disagree to 7=Strongly Agree)', ''),
  q(3, 'likert_scale', 'Today I felt stressed due to my care responsibilities', '', { min_value: 1, max_value: 7, min_label: 'Strongly Disagree', max_label: 'Strongly Agree' }, [], true),
  q(4, 'likert_scale', 'Today I felt that the situation did not allow me as much privacy as I would have liked', '', { min_value: 1, max_value: 7, min_label: 'Strongly Disagree', max_label: 'Strongly Agree' }, [], true),
  q(5, 'likert_scale', 'Today I felt strained in interactions with my care recipient', '', { min_value: 1, max_value: 7, min_label: 'Strongly Disagree', max_label: 'Strongly Agree' }, [], true),

  q(6, 'section_header', 'Daily Burden Rating', 'Overall how did today feel?', { section_icon: '⚖️', section_color: '#f59e0b' }),
  q(7, 'bipolar_scale', 'Overall, how did caregiving feel for you today?', '', { min_value: -3, max_value: 3, step: 1, min_label: 'Very burdensome', max_label: 'Very manageable', show_value_labels: true }, [], true),

  q(8, 'section_header', 'Supplement Missed Logs', 'Anything you didn\'t capture today?', { section_icon: '📝', section_color: '#06b6d4' }),
  q(9, 'text_long', 'Supplemental Notes', 'If there are caregiving activities today that were not recorded during hourly reminders, add notes here.', { voice_enabled: true, ai_enabled: true }),
];

// ─── DAILY REFLECTION — FAMILY MEMBER (simplified) ───
const dailyFamilyQuestions = [
  q(1, 'section_header', 'Daily Reflection', 'How was your day as a family member?', { section_icon: '🌙', section_color: '#3b82f6' }),
  q(2, 'bipolar_scale', 'Overall, how did your support role feel today?', '', { min_value: -3, max_value: 3, step: 1, min_label: 'Very burdensome', max_label: 'Very manageable', show_value_labels: true }, [], true),
  q(3, 'likert_scale', 'Today I felt I was able to contribute meaningfully', '', { min_value: 1, max_value: 7, min_label: 'Strongly Disagree', max_label: 'Strongly Agree' }),
  q(4, 'likert_scale', 'Today I felt well-coordinated with the primary caregiver', '', { min_value: 1, max_value: 7, min_label: 'Strongly Disagree', max_label: 'Strongly Agree' }),
  q(5, 'text_long', 'Supplemental Notes', 'Anything else to add about today?', { voice_enabled: true }),
];

// ─── MAIN ───
async function main() {
  console.log('🚀 Setting up Dementia Caregiver ESM project...\n');

  // Step 0: Authenticate
  console.log('🔐 Signing in...');
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'guowei.jiang.work@gmail.com',
    password: 'J4913836j@@@@@',
  });
  if (authErr) { console.error('❌ Auth error:', authErr); return; }
  console.log(`   ✅ Signed in as ${authData.user.email}`);

  // Step 1: Clean existing data for this project
  console.log('🧹 Cleaning existing questionnaires, participant types...');
  // Delete questions first (FK), then questionnaires, then participant types
  const { data: existingQ } = await supabase.from('questionnaire').select('id').eq('project_id', PROJECT_ID);
  if (existingQ?.length) {
    const qIds = existingQ.map(q => q.id);
    await supabase.from('survey_question').delete().in('questionnaire_id', qIds);
    await supabase.from('question_option').delete().in('question_id',
      (await supabase.from('survey_question').select('id').eq('project_id', PROJECT_ID)).data?.map(q => q.id) || []
    );
    await supabase.from('questionnaire_participant_type').delete().in('questionnaire_id', qIds);
    await supabase.from('questionnaire').delete().eq('project_id', PROJECT_ID);
  }
  await supabase.from('participant_type').delete().eq('project_id', PROJECT_ID);
  // Also clean orphan questions
  await supabase.from('survey_question').delete().eq('project_id', PROJECT_ID);

  // Step 2: Create Participant Types
  console.log('👥 Creating participant types...');
  const ptInserts = participantTypes.map((pt, i) => ({
    project_id: PROJECT_ID,
    name: pt.name,
    description: pt.description,
    color: pt.color,
    relations: pt.relations,
    order_index: i,
  }));
  const { data: ptRows, error: ptErr } = await supabase.from('participant_type').insert(ptInserts).select();
  if (ptErr) { console.error('❌ participant_type insert error:', ptErr); return; }
  console.log(`   ✅ Created ${ptRows.length} participant types`);
  const primaryPtId = ptRows[0].id;
  const familyPtId = ptRows[1].id;
  const allPtIds = [primaryPtId, familyPtId];

  // Step 3: Create Questionnaires
  console.log('📋 Creating questionnaires...');

  const questionnaireDefs = [
    { type: 'screening', title: 'Eligibility Screening', desc: 'Check if participant qualifies for the study', freq: 'once', ptIds: allPtIds, questions: screeningQuestions, order: 0 },
    { type: 'consent', title: 'Research Consent Form', desc: '', freq: 'once', ptIds: allPtIds, questions: [], order: 1,
      consent_text: 'By participating in this study, you consent to:\n\n1. Log your daily caregiving activities for 7 consecutive days\n2. Complete screening and baseline assessments\n3. Allow researchers to analyze your anonymized data\n4. Optionally participate in a follow-up interview\n\nYour data will be kept strictly confidential and used only for research purposes. You may withdraw at any time without penalty.',
      consent_required: true },
    { type: 'survey', title: 'Hourly Activity Log (Primary Caregiver)', desc: 'Log each caregiving activity as it happens — includes MBP assessment, affect ratings, people involved, and challenges', freq: 'hourly', ptIds: [primaryPtId], questions: hourlyPrimaryQuestions, order: 2 },
    { type: 'survey', title: 'Hourly Activity Log (Family Member)', desc: 'Log your support and coordination activities throughout the day', freq: 'hourly', ptIds: [familyPtId], questions: hourlyFamilyQuestions, order: 3 },
    { type: 'survey', title: 'Daily Reflection (Primary Caregiver)', desc: 'End-of-day reflection: sense of competence, daily burden, and supplemental notes', freq: 'daily', ptIds: [primaryPtId], questions: dailyPrimaryQuestions, order: 4 },
    { type: 'survey', title: 'Daily Reflection (Family Member)', desc: 'End-of-day reflection on your coordination and support role', freq: 'daily', ptIds: [familyPtId], questions: dailyFamilyQuestions, order: 5 },
  ];

  for (const qDef of questionnaireDefs) {
    // Insert questionnaire
    const qRow = {
      project_id: PROJECT_ID,
      questionnaire_type: qDef.type,
      title: qDef.title,
      description: qDef.desc,
      frequency: qDef.freq,
      estimated_duration: qDef.type === 'screening' ? 2 : qDef.type === 'consent' ? 1 : qDef.freq === 'hourly' ? 5 : 3,
      notification_enabled: qDef.freq === 'hourly' || qDef.freq === 'daily',
      notification_minutes_before: 5,
      time_windows: JSON.stringify(qDef.freq === 'hourly' ? [{ start: '09:00', end: '21:00' }] : [{ start: '20:00', end: '22:00' }]),
      dnd_allowed: true,
      dnd_default_start: '22:00',
      dnd_default_end: '08:00',
      order_index: qDef.order,
      consent_text: qDef.consent_text || null,
      consent_required: qDef.consent_required || false,
    };
    const { data: qInserted, error: qErr } = await supabase.from('questionnaire').insert(qRow).select();
    if (qErr) { console.error(`❌ questionnaire insert error (${qDef.title}):`, qErr); continue; }
    const qId = qInserted[0].id;
    console.log(`   ✅ ${qDef.title} (${qDef.type}, ${qDef.freq})`);

    // Insert junction table assignments
    const junctionRows = qDef.ptIds.map(ptId => ({ questionnaire_id: qId, participant_type_id: ptId }));
    await supabase.from('questionnaire_participant_type').insert(junctionRows);

    // Insert questions
    if (qDef.questions.length > 0) {
      for (const qn of qDef.questions) {
        const sqRow = {
          project_id: PROJECT_ID,
          questionnaire_id: qId,
          question_type: qn.type,
          question_text: qn.text,
          question_description: qn.desc || null,
          question_config: qn.config || {},
          required: qn.required,
          order_index: qn.order,
          voice_enabled: qn.config?.voice_enabled || false,
          ai_enabled: qn.config?.ai_enabled || false,
        };
        const { data: sqInserted, error: sqErr } = await supabase.from('survey_question').insert(sqRow).select();
        if (sqErr) { console.error(`   ❌ question insert error (${qn.text}):`, sqErr); continue; }

        // Insert options if any
        if (qn.options.length > 0) {
          const optRows = qn.options.map((opt, i) => ({
            question_id: sqInserted[0].id,
            option_text: opt,
            option_value: opt.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 50),
            order_index: i,
          }));
          const { error: optErr } = await supabase.from('question_option').insert(optRows);
          if (optErr) console.error(`   ❌ option insert error:`, optErr);
        }
      }
      console.log(`      → ${qDef.questions.length} questions inserted`);
    }
  }

  // Step 4: Update project settings
  console.log('\n⚙️ Updating project settings...');
  await supabase.from('research_project').update({
    consent_required: true,
    screening_enabled: true,
    project_type: 'esm',
    study_duration: 7,
    survey_frequency: 'hourly',
    notification_enabled: true,
    notification_frequency: 'multiple_daily',
    notification_times_per_day: 13,
    voice_enabled: true,
    ecogram_enabled: true,
    ecogram_center_label: 'Care Recipient',
    show_progress_bar: true,
    allow_participant_dnd: true,
    onboarding_required: true,
    onboarding_instruction: 'Welcome to the Dementia Caregiver ESM Study!\n\n1. Complete your profile\n2. Set your study start date\n3. Fill in patient condition info\n4. Draw your care network (ecogram)\n5. Begin 7-day logging',
    sampling_type: 'fixed_schedule',
    sampling_prompts_per_day: 13,
    sampling_duration_days: 7,
    sampling_start_hour: 9,
    sampling_end_hour: 21,
    sampling_allow_late: true,
    sampling_late_window_minutes: 60,
  }).eq('id', PROJECT_ID);

  console.log('\n🎉 Setup complete!');
  console.log(`   Project: ${PROJECT_ID}`);
  console.log(`   Participant Types: Primary Caregiver (${primaryPtId}), Family Member (${familyPtId})`);
  console.log('   Questionnaires: Screening, Consent, 2x Hourly Logs, 2x Daily Reflections');
}

main().catch(console.error);
