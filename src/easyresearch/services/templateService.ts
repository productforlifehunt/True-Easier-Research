import { supabase } from '../../lib/supabase';
import { normalizeLegacyQuestionType } from '../constants/questionTypes';

// Template questions for each template ID
const templateQuestions: Record<string, Array<{text: string, type: string, required: boolean, options?: string[], config?: Record<string, any>}>> = {
  '1': [ // CSAT
    { text: 'Overall, how satisfied are you with our product/service?', type: 'rating', required: true },
    { text: 'How would you rate the quality of our product/service?', type: 'rating', required: true },
    { text: 'How would you rate the value for money?', type: 'rating', required: true },
    { text: 'How likely are you to purchase from us again?', type: 'likert_scale', required: true },
    { text: 'How responsive have we been to your questions or concerns?', type: 'rating', required: true },
    { text: 'What did you like most about your experience?', type: 'long_text', required: false },
    { text: 'What could we improve?', type: 'long_text', required: false },
    { text: 'How did you first hear about us?', type: 'multiple_choice', required: true, options: ['Search Engine', 'Social Media', 'Friend/Family', 'Advertisement', 'Other'] },
    { text: 'Would you recommend us to others?', type: 'single_choice', required: true, options: ['Definitely', 'Probably', 'Not sure', 'Probably not', 'Definitely not'] },
    { text: 'Any additional comments?', type: 'long_text', required: false },
  ],
  '2': [ // NPS
    { text: 'On a scale of 0-10, how likely are you to recommend us to a friend or colleague?', type: 'nps', required: true },
    { text: 'What is the primary reason for your score?', type: 'long_text', required: true },
    { text: 'What could we do to improve your experience?', type: 'long_text', required: false },
    { text: 'What do you value most about our product/service?', type: 'long_text', required: false },
  ],
  '3': [ // Employee Engagement
    { text: 'I feel valued and recognized for my contributions', type: 'likert_scale', required: true },
    { text: 'I have the tools and resources I need to do my job well', type: 'likert_scale', required: true },
    { text: 'I understand how my work contributes to company goals', type: 'likert_scale', required: true },
    { text: 'My manager provides regular feedback and support', type: 'likert_scale', required: true },
    { text: 'I see opportunities for growth and advancement here', type: 'likert_scale', required: true },
    { text: 'I would recommend this company as a great place to work', type: 'likert_scale', required: true },
    { text: 'I feel comfortable sharing ideas and opinions', type: 'likert_scale', required: true },
    { text: 'The company culture aligns with my values', type: 'likert_scale', required: true },
    { text: 'I have a good work-life balance', type: 'likert_scale', required: true },
    { text: 'What do you enjoy most about working here?', type: 'long_text', required: false },
    { text: 'What would make this a better place to work?', type: 'long_text', required: false },
  ],
  '4': [ // Website Usability
    { text: 'How easy was it to find what you were looking for?', type: 'rating', required: true },
    { text: 'How would you rate the overall design and layout?', type: 'rating', required: true },
    { text: 'How fast did the pages load?', type: 'rating', required: true },
    { text: 'Was the navigation intuitive and easy to understand?', type: 'likert_scale', required: true },
    { text: 'Did you encounter any errors or broken links?', type: 'single_choice', required: true, options: ['Yes', 'No'] },
    { text: 'If yes, please describe the issue', type: 'long_text', required: false },
    { text: 'How likely are you to return to this website?', type: 'likert_scale', required: true },
    { text: 'What device did you use?', type: 'single_choice', required: true, options: ['Desktop', 'Laptop', 'Tablet', 'Mobile Phone'] },
    { text: 'What frustrated you most about the experience?', type: 'long_text', required: false },
  ],
  '5': [ // Patient Experience
    { text: 'How would you rate your overall care experience?', type: 'rating', required: true },
    { text: 'Did staff explain things in a way you could understand?', type: 'likert_scale', required: true },
    { text: 'Were you treated with courtesy and respect?', type: 'likert_scale', required: true },
    { text: 'How long did you wait before being seen?', type: 'single_choice', required: true, options: ['Less than 15 min', '15-30 min', '30-60 min', 'More than 1 hour'] },
    { text: 'Was the facility clean and comfortable?', type: 'likert_scale', required: true },
    { text: 'Did you receive clear instructions for follow-up care?', type: 'likert_scale', required: true },
    { text: 'How easy was it to schedule your appointment?', type: 'rating', required: true },
    { text: 'Would you recommend this facility to others?', type: 'likert_scale', required: true },
    { text: 'What could we do to improve your experience?', type: 'long_text', required: false },
  ],
  '6': [ // Academic Research
    { text: 'Please confirm you have read and agree to the consent form', type: 'single_choice', required: true, options: ['I agree', 'I do not agree'] },
    { text: 'What is your age?', type: 'number', required: true },
    { text: 'What is your gender?', type: 'single_choice', required: true, options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'] },
    { text: 'What is your highest level of education?', type: 'single_choice', required: true, options: ['High School', 'Some College', 'Bachelor\'s', 'Master\'s', 'Doctorate', 'Other'] },
    { text: 'Please rate your agreement with the following statement...', type: 'likert_scale', required: true },
  ],
  '7': [ // Product Feedback
    { text: 'How often do you use our product?', type: 'single_choice', required: true, options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'First time'] },
    { text: 'Which features do you use most?', type: 'multiple_choice', required: true, options: ['Feature A', 'Feature B', 'Feature C', 'Feature D', 'Other'] },
    { text: 'How easy is it to use our product?', type: 'rating', required: true },
    { text: 'How well does our product meet your needs?', type: 'rating', required: true },
    { text: 'What features would you like to see added?', type: 'long_text', required: false },
    { text: 'How likely are you to continue using our product?', type: 'nps', required: true },
    { text: 'What is your biggest pain point with the product?', type: 'long_text', required: false },
    { text: 'How does our product compare to alternatives?', type: 'single_choice', required: true, options: ['Much better', 'Somewhat better', 'About the same', 'Somewhat worse', 'Much worse'] },
  ],
  '8': [ // Event Feedback
    { text: 'How would you rate the event overall?', type: 'rating', required: true },
    { text: 'How relevant was the content to your interests?', type: 'rating', required: true },
    { text: 'How would you rate the speakers/presenters?', type: 'rating', required: true },
    { text: 'How was the venue/location?', type: 'rating', required: true },
    { text: 'Was the event well organized?', type: 'likert_scale', required: true },
    { text: 'What did you enjoy most about the event?', type: 'long_text', required: false },
    { text: 'What could be improved for future events?', type: 'long_text', required: false },
    { text: 'Would you attend future events?', type: 'single_choice', required: true, options: ['Definitely', 'Probably', 'Maybe', 'Probably not', 'Definitely not'] },
    { text: 'How did you hear about this event?', type: 'single_choice', required: true, options: ['Email', 'Social Media', 'Website', 'Word of mouth', 'Other'] },
  ],
  '9': [ // Market Research
    { text: 'What is your age range?', type: 'single_choice', required: true, options: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'] },
    { text: 'What is your household income?', type: 'single_choice', required: false, options: ['Under $25k', '$25k-$50k', '$50k-$75k', '$75k-$100k', '$100k-$150k', '$150k+', 'Prefer not to say'] },
    { text: 'How often do you purchase products in this category?', type: 'single_choice', required: true, options: ['Weekly', 'Monthly', 'Quarterly', 'Yearly', 'Rarely'] },
    { text: 'What factors influence your purchase decision?', type: 'multiple_choice', required: true, options: ['Price', 'Quality', 'Brand', 'Reviews', 'Convenience', 'Sustainability'] },
    { text: 'Where do you typically shop for these products?', type: 'multiple_choice', required: true, options: ['Online retailers', 'Physical stores', 'Direct from brand', 'Subscription services'] },
    { text: 'How much do you typically spend per purchase?', type: 'single_choice', required: true, options: ['Under $25', '$25-$50', '$50-$100', '$100-$200', '$200+'] },
    { text: 'What would make you switch to a different brand?', type: 'long_text', required: false },
  ],
  '10': [ // Course Evaluation
    { text: 'How would you rate this course overall?', type: 'rating', required: true },
    { text: 'The course content was well-organized', type: 'likert_scale', required: true },
    { text: 'The instructor was knowledgeable and engaging', type: 'likert_scale', required: true },
    { text: 'The pace of the course was appropriate', type: 'likert_scale', required: true },
    { text: 'The course materials were helpful', type: 'likert_scale', required: true },
    { text: 'I learned valuable skills/knowledge from this course', type: 'likert_scale', required: true },
    { text: 'What was the most valuable part of this course?', type: 'long_text', required: false },
    { text: 'What could be improved?', type: 'long_text', required: false },
    { text: 'Would you recommend this course to others?', type: 'nps', required: true },
  ],
  '11': [ // Psychology Research (Big Five)
    { text: 'I see myself as someone who is talkative', type: 'likert_scale', required: true },
    { text: 'I see myself as someone who tends to find fault with others', type: 'likert_scale', required: true },
    { text: 'I see myself as someone who does a thorough job', type: 'likert_scale', required: true },
    { text: 'I see myself as someone who is depressed, blue', type: 'likert_scale', required: true },
    { text: 'I see myself as someone who is original, comes up with new ideas', type: 'likert_scale', required: true },
    { text: 'I see myself as someone who is reserved', type: 'likert_scale', required: true },
    { text: 'I see myself as someone who is helpful and unselfish with others', type: 'likert_scale', required: true },
    { text: 'I see myself as someone who can be somewhat careless', type: 'likert_scale', required: true },
    { text: 'I see myself as someone who is relaxed, handles stress well', type: 'likert_scale', required: true },
    { text: 'I see myself as someone who is curious about many different things', type: 'likert_scale', required: true },
  ],
  '12': [ // Exit Interview
    { text: 'What is your primary reason for leaving?', type: 'single_choice', required: true, options: ['Better opportunity', 'Compensation', 'Work-life balance', 'Management', 'Career growth', 'Relocation', 'Personal reasons', 'Other'] },
    { text: 'How long have you been with the company?', type: 'single_choice', required: true, options: ['Less than 1 year', '1-2 years', '2-5 years', '5-10 years', '10+ years'] },
    { text: 'How would you rate your overall experience working here?', type: 'rating', required: true },
    { text: 'Did you feel valued and appreciated?', type: 'likert_scale', required: true },
    { text: 'Did you have the tools and resources needed to do your job?', type: 'likert_scale', required: true },
    { text: 'How was your relationship with your direct manager?', type: 'rating', required: true },
    { text: 'What did you like most about working here?', type: 'long_text', required: false },
    { text: 'What could the company improve?', type: 'long_text', required: false },
    { text: 'Would you consider returning to the company in the future?', type: 'single_choice', required: true, options: ['Definitely', 'Possibly', 'Unlikely', 'Definitely not'] },
    { text: 'Would you recommend this company to others as a place to work?', type: 'nps', required: true },
  ],
  '13': [ // Caregiver Wellbeing
    { text: 'How is your mood today?', type: 'rating', required: true },
    { text: 'How stressed do you feel today?', type: 'rating', required: true },
    { text: 'How many hours did you provide care today?', type: 'number', required: true },
    { text: 'How much sleep did you get last night (hours)?', type: 'number', required: false },
    { text: 'Did you feel supported today?', type: 'likert_scale', required: true },
    { text: 'Which caregiving activities did you do today?', type: 'multiple_choice', required: false, options: ['Personal care', 'Medication', 'Meals', 'Transportation', 'Supervision', 'Household tasks', 'Other'] },
    { text: 'Did anything feel particularly challenging today?', type: 'long_text', required: false },
    { text: 'What helped you cope today?', type: 'long_text', required: false },
    { text: 'How connected did you feel to others today?', type: 'rating', required: false },
    { text: 'Did you have any time for yourself today?', type: 'single_choice', required: false, options: ['Yes', 'No'] },
    { text: 'If yes, what did you do for yourself?', type: 'long_text', required: false },
    { text: 'Any additional notes you want to share?', type: 'long_text', required: false },
  ],
  '14': [ // System Usability Scale (SUS)
    { text: 'I think that I would like to use this system frequently.', type: 'likert_scale', required: true },
    { text: 'I found the system unnecessarily complex.', type: 'likert_scale', required: true },
    { text: 'I thought the system was easy to use.', type: 'likert_scale', required: true },
    { text: 'I think that I would need the support of a technical person to be able to use this system.', type: 'likert_scale', required: true },
    { text: 'I found the various functions in this system were well integrated.', type: 'likert_scale', required: true },
    { text: 'I thought there was too much inconsistency in this system.', type: 'likert_scale', required: true },
    { text: 'I would imagine that most people would learn to use this system very quickly.', type: 'likert_scale', required: true },
    { text: 'I found the system very cumbersome to use.', type: 'likert_scale', required: true },
    { text: 'I felt very confident using the system.', type: 'likert_scale', required: true },
    { text: 'I needed to learn a lot of things before I could get going with this system.', type: 'likert_scale', required: true },
  ],
  '15': [ // Dementia Caregiver ESM Study
    // Section 1: Activity
    { text: 'Activity Details', type: 'section_header', required: false, config: { section_icon: '📋', section_color: '#10b981' } },
    { text: 'What caregiving activities did you do?', type: 'checkbox_group', required: true, options: ['ADL (bathing, dressing, eating, toileting, mobility)', 'IADL (medication, finances, shopping, cooking, housework)', 'Medical care (appointments, treatments)', 'Emotional support / companionship', 'Supervision / safety monitoring', 'Transportation', 'Communication with professionals', 'Administrative tasks', 'Other'] },
    { text: 'Please describe what you were doing', type: 'text_long', required: false },
    { text: 'How long did you spend on this activity (minutes)?', type: 'number', required: false },
    { text: 'How pleasant/unpleasant was this event?', type: 'bipolar_scale', required: true, config: { min_value: -3, max_value: 3, min_label: 'Very Unpleasant', max_label: 'Very Pleasant' } },
    { text: 'Did the care recipient show memory problems?', type: 'yes_no', required: true },
    { text: 'Did the care recipient show behavior problems?', type: 'yes_no', required: true },
    { text: 'Did the care recipient show depressive symptoms?', type: 'yes_no', required: true },
    { text: 'How much distress did these memory/behavior problems cause you?', type: 'likert_scale', required: false, config: { scale_type: '0-4', custom_labels: ['No distress', 'A little', 'Moderate', 'Quite a bit', 'Extreme distress'] } },
    // Section 2: Affect
    { text: 'Your Wellbeing', type: 'section_header', required: false, config: { section_icon: '💛', section_color: '#eab308' } },
    { text: 'Right now, I feel cheerful', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much' } },
    { text: 'Right now, I feel relaxed', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much' } },
    { text: 'Right now, I feel enthusiastic', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much' } },
    { text: 'Right now, I feel satisfied', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much' } },
    { text: 'Right now, I feel insecure', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much' } },
    { text: 'Right now, I feel lonely', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much' } },
    { text: 'Right now, I feel anxious', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much' } },
    { text: 'Right now, I feel irritated', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much' } },
    { text: 'Right now, I feel down', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much' } },
    { text: 'Right now, I feel desperate', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much' } },
    { text: 'Right now, I feel tensed', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much' } },
    // Section 3: People & Challenges
    { text: 'People & Challenges', type: 'section_header', required: false, config: { section_icon: '👥', section_color: '#3b82f6' } },
    { text: 'Who was with you or helped you?', type: 'text_long', required: false },
    { text: 'Who else do you wish could have helped?', type: 'text_long', required: false },
    { text: 'What challenges did you face reaching the people you needed?', type: 'text_long', required: false },
    { text: 'How challenging was this activity overall?', type: 'bipolar_scale', required: true, config: { min_value: -3, max_value: 3, min_label: 'No Challenges', max_label: 'Extreme Challenges' } },
    { text: 'What types of challenges did you experience?', type: 'checkbox_group', required: false, options: ['Knowledge gaps', 'Patient condition changes', 'Coordination difficulties', 'Time constraints', 'Emotional stress', 'Physical demands', 'Communication issues', 'Safety/liability concerns', 'Privacy issues', 'Other'] },
    { text: 'What resources or tools are you currently using?', type: 'text_long', required: false },
    { text: 'What resources or tools do you wish you had?', type: 'text_long', required: false },
    // Section 4: Daily Sense of Competence
    { text: 'Daily Reflection', type: 'section_header', required: false, config: { section_icon: '🧠', section_color: '#8b5cf6' } },
    { text: 'I felt stressed by the caregiving demands', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Strongly Disagree', max_label: 'Strongly Agree' } },
    { text: 'I felt that caregiving affected my privacy', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Strongly Disagree', max_label: 'Strongly Agree' } },
    { text: 'I felt strained in my relationship with the care recipient', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Strongly Disagree', max_label: 'Strongly Agree' } },
    { text: 'Overall, how burdensome or manageable was caregiving today?', type: 'bipolar_scale', required: true, config: { min_value: -3, max_value: 3, min_label: 'Very Burdensome', max_label: 'Very Manageable' } },
    { text: 'How urgent was the care need?', type: 'single_choice', required: false, options: ['Low', 'Medium', 'High', 'Urgent'] },
  ],
};

// Template-specific project settings (overrides defaults when creating from template)
const TEMPLATE_PROJECT_SETTINGS: Record<string, any> = {
  '15': {
    project_type: 'longitudinal',
    methodology_type: 'esm',
    ai_enabled: false,
    voice_enabled: true,
    notification_enabled: true,
    study_duration: 7,
    survey_frequency: 'hourly',
    allow_participant_dnd: true,
    onboarding_required: true,
    consent_required: true,
    consent_form_text: 'By participating in this 7-day study, you agree to log your caregiving activities hourly between 9am-9pm. Your data will be kept strictly confidential and used only for research purposes. You may withdraw at any time without consequence.',
    onboarding_instructions: 'Welcome to our Dementia Caregiver Experience Study! Over the next 7 days, you will receive hourly reminders (9am-9pm) to log your caregiving activities, mood, and challenges. Each entry takes only 2-3 minutes. You can set Do Not Disturb periods and use voice input for faster logging.',
    participant_numbering: true,
    participant_number_prefix: 'PP',
    participant_relation_enabled: true,
    participant_relation_options: ['Primary Caregiver', 'Secondary Caregiver', 'Family Member', 'Professional Caregiver', 'Other'],
    ecogram_enabled: true,
    ecogram_config: {
      center_label: 'Care Recipient',
      relationship_options: [
        { value: 'family', label: 'Family', color: '#10b981' },
        { value: 'friend', label: 'Friend', color: '#3b82f6' },
        { value: 'professional', label: 'Professional', color: '#8b5cf6' },
        { value: 'neighbor', label: 'Neighbor', color: '#f59e0b' },
      ],
    },
    screening_enabled: true,
    screening_questions: [
      { id: 'sq_age', question: 'Are you 18 years or older?', type: 'yes_no', required: true, disqualify_value: 'no' },
      { id: 'sq_caregiver', question: 'Are you currently a caregiver for someone with dementia?', type: 'yes_no', required: true, disqualify_value: 'no' },
      { id: 'sq_hours', question: 'Do you provide at least 4 hours of care per week?', type: 'yes_no', required: true, disqualify_value: 'no' },
      { id: 'sq_smartphone', question: 'Do you have access to a smartphone or tablet for daily logging?', type: 'yes_no', required: true, disqualify_value: 'no' },
      { id: 'sq_language', question: 'Are you comfortable reading and writing in the study language?', type: 'yes_no', required: true, disqualify_value: 'no' },
    ],
    notification_setting: {
      frequency: 'multiple_daily',
      times_per_day: 13,
      notification_times: ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'],
      send_reminders: true,
      timezone: 'auto',
    },
    sampling_strategy: {
      type: 'fixed_schedule',
      prompts_per_day: 13,
      duration_days: 7,
      start_hour: 9,
      end_hour: 21,
      allow_late_responses: true,
      late_window_minutes: 60,
    },
    setting: {
      show_progress_bar: true,
      enable_timeline_view: true,
      show_progress_tracker: true,
    },
    profile_questions: [
      { id: 'pq_demographics', question: 'Caregiver Demographics', type: 'section' as const, required: false },
      { id: 'pq_age', question: 'Your age', type: 'number' as const, required: true },
      { id: 'pq_gender', question: 'Your gender', type: 'select' as const, options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'], required: true },
      { id: 'pq_education', question: 'Highest education level', type: 'select' as const, options: ['Primary school', 'Secondary school', 'Vocational', 'Bachelor\'s', 'Master\'s', 'Doctorate'], required: false },
      { id: 'pq_employment', question: 'Employment status', type: 'select' as const, options: ['Full-time', 'Part-time', 'Self-employed', 'Unemployed', 'Retired', 'Student'], required: false },
      { id: 'pq_relationship', question: 'Relationship to care recipient', type: 'select' as const, options: ['Spouse/Partner', 'Parent', 'Child', 'Sibling', 'Other Relative', 'Friend/Neighbor', 'Professional Caregiver', 'Other'], required: true },
      { id: 'pq_caregiving_years', question: 'How long have you been caregiving?', type: 'select' as const, options: ['Less than 6 months', '6 months - 1 year', '1-2 years', '2-5 years', 'More than 5 years'], required: true },
      { id: 'pq_hours', question: 'Hours per week providing care', type: 'number' as const, required: false },
      { id: 'pq_health', question: 'Your overall health status', type: 'scale' as const, required: false, config: { min: 1, max: 5, min_label: 'Poor', max_label: 'Excellent' } },
      { id: 'pq_recipient', question: 'Care Recipient Information', type: 'section' as const, required: false },
      { id: 'pq_rec_age', question: 'Care recipient age', type: 'number' as const, required: false },
      { id: 'pq_rec_gender', question: 'Care recipient gender', type: 'select' as const, options: ['Male', 'Female'], required: false },
      { id: 'pq_dementia_type', question: 'Type of dementia', type: 'select' as const, options: ['Alzheimer\'s disease', 'Vascular dementia', 'Lewy body dementia', 'Frontotemporal dementia', 'Mixed dementia', 'Unknown/Other'], required: false },
      { id: 'pq_diagnosis_years', question: 'Years since diagnosis', type: 'number' as const, required: false },
      { id: 'pq_dementia_stage', question: 'Dementia stage', type: 'select' as const, options: ['Early/Mild', 'Middle/Moderate', 'Late/Severe'], required: false },
      { id: 'pq_adl', question: 'Functional Assessment (ADL)', type: 'section' as const, required: false },
      { id: 'pq_adl_eating', question: 'Eating ability', type: 'scale' as const, required: false, config: { min: 1, max: 3, min_label: 'Independent', max_label: 'Fully dependent' } },
      { id: 'pq_adl_bathing', question: 'Bathing ability', type: 'scale' as const, required: false, config: { min: 1, max: 3, min_label: 'Independent', max_label: 'Fully dependent' } },
      { id: 'pq_adl_dressing', question: 'Dressing ability', type: 'scale' as const, required: false, config: { min: 1, max: 3, min_label: 'Independent', max_label: 'Fully dependent' } },
      { id: 'pq_adl_toileting', question: 'Toileting ability', type: 'scale' as const, required: false, config: { min: 1, max: 3, min_label: 'Independent', max_label: 'Fully dependent' } },
      { id: 'pq_adl_mobility', question: 'Mobility', type: 'scale' as const, required: false, config: { min: 1, max: 3, min_label: 'Independent', max_label: 'Fully dependent' } },
      { id: 'pq_iadl', question: 'Instrumental ADL (IADL)', type: 'section' as const, required: false },
      { id: 'pq_iadl_medication', question: 'Medication management', type: 'scale' as const, required: false, config: { min: 1, max: 3, min_label: 'Independent', max_label: 'Fully dependent' } },
      { id: 'pq_iadl_finances', question: 'Financial management', type: 'scale' as const, required: false, config: { min: 1, max: 3, min_label: 'Independent', max_label: 'Fully dependent' } },
      { id: 'pq_iadl_shopping', question: 'Shopping', type: 'scale' as const, required: false, config: { min: 1, max: 3, min_label: 'Independent', max_label: 'Fully dependent' } },
      { id: 'pq_iadl_cooking', question: 'Cooking/meal prep', type: 'scale' as const, required: false, config: { min: 1, max: 3, min_label: 'Independent', max_label: 'Fully dependent' } },
      { id: 'pq_iadl_housework', question: 'Housework', type: 'scale' as const, required: false, config: { min: 1, max: 3, min_label: 'Independent', max_label: 'Fully dependent' } },
    ],
  },
};

// Get template questions for local/demo mode
export function getTemplateQuestions(templateId: string) {
  return templateQuestions[templateId] || [];
}

export async function createSurveyFromTemplate(
  userId: string,
  userEmail: string,
  templateId: string,
  templateName: string,
  templateDescription: string
): Promise<{ projectId: string } | { error: string }> {
  try {
    // Get or create researcher record
    let { data: researcher } = await supabase
      .from('researcher')
      .select('organization_id, id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!researcher) {
      // Get or create default organization
      let { data: org } = await supabase
        .from('organization')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (!org) {
        const { data: newOrg } = await supabase
          .from('organization')
          .insert({ name: 'My Organization', slug: `org-${Date.now()}`, plan: 'free' })
          .select()
          .single();
        org = newOrg;
      }

      if (org) {
        const { data: newResearcher } = await supabase
          .from('researcher')
          .insert({
            user_id: userId,
            organization_id: org.id,
            role: 'researcher',
            
          })
          .select()
          .single();
        researcher = newResearcher;
      }
    }

    if (!researcher) {
      return { error: 'Failed to create researcher profile' };
    }

    // Generate unique survey code
    const surveyCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Template-specific settings
    const templateSettings = TEMPLATE_PROJECT_SETTINGS[templateId];
    const isLongitudinal = templateSettings?.project_type === 'longitudinal';

    // Create the project
    const { data: project, error: projectError } = await supabase
      .from('research_project')
      .insert({
        organization_id: researcher.organization_id,
        researcher_id: researcher.id,
        title: templateName,
        description: templateDescription,
        project_type: templateSettings?.project_type || 'survey',
        methodology_type: templateSettings?.methodology_type || 'single_survey',
        ai_enabled: templateSettings?.ai_enabled || false,
        voice_enabled: templateSettings?.voice_enabled || false,
        notification_enabled: templateSettings?.notification_enabled ?? true,
        survey_code: surveyCode,
        status: 'draft',
        study_duration: templateSettings?.study_duration,
        survey_frequency: templateSettings?.survey_frequency,
        allow_participant_dnd: templateSettings?.allow_participant_dnd,
        onboarding_required: templateSettings?.onboarding_required,
        onboarding_instruction: templateSettings?.onboarding_instructions,
        profile_question: templateSettings?.profile_questions,
        setting: {
          show_progress_bar: true,
          allow_back_navigation: true,
          ...templateSettings?.setting,
          consent_required: templateSettings?.consent_required,
          consent_form_text: templateSettings?.consent_form_text,
          screening_enabled: templateSettings?.screening_enabled || false,
          screening_questions: templateSettings?.screening_questions || [],
          participant_numbering: templateSettings?.participant_numbering || false,
          participant_number_prefix: templateSettings?.participant_number_prefix || 'PP',
          participant_relation_enabled: templateSettings?.participant_relation_enabled || false,
          participant_relation_options: templateSettings?.participant_relation_options || [],
          ecogram_enabled: templateSettings?.ecogram_enabled || false,
          ecogram_config: templateSettings?.ecogram_config || null,
        },
        notification_setting: templateSettings?.notification_setting,
        consent_form: templateSettings?.consent_required ? {
          required: true,
          title: 'Research Consent Form',
          form_text: templateSettings?.consent_form_text || 'By participating in this study, you agree to provide honest responses. Your data will be kept confidential.'
        } : null,
        sampling_strategy: templateSettings?.sampling_strategy,
      })
      .select()
      .single();

    if (projectError) {
      console.error('Project creation error:', projectError);
      return { error: projectError.message };
    }

    // Get template questions (do not silently create the wrong survey)
    const questions = templateQuestions[templateId];
    if (!questions) {
      return { error: 'This template is not supported yet.' };
    }

    // Insert questions
    const questionsToInsert = questions.map((q: any, index: number) => ({
      project_id: project.id,
      question_type: normalizeLegacyQuestionType(q.type),
      question_text: q.text,
      question_description: '',
      required: q.required,
      order_index: index + 1,
      question_config: q.config || {},
      validation_rule: {},
      logic_rule: {},
      ai_config: {},
      allow_voice: isLongitudinal && ['text_long', 'long_text'].includes(q.type),
    }));

    const { data: insertedQuestions, error: questionsError } = await supabase
      .from('survey_question')
      .insert(questionsToInsert)
      .select();

    if (questionsError) {
      console.error('Questions insertion error:', questionsError);
    }

    // Insert options for questions that have them
    if (insertedQuestions) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const insertedQ = insertedQuestions[i];
        if (q.options && q.options.length > 0 && insertedQ) {
          const optionsToInsert = q.options.map((opt, idx) => ({
            question_id: insertedQ.id,
            option_text: opt,
            option_value: opt.toLowerCase().replace(/\s+/g, '_'),
            order_index: idx + 1,
            is_other: opt.toLowerCase() === 'other'
          }));

          await supabase.from('question_option').insert(optionsToInsert);
        }
      }
    }

    return { projectId: project.id };
  } catch (error: any) {
    console.error('Template creation error:', error);
    return { error: error.message || 'Unknown error occurred' };
  }
}
