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
  '15': [ // Dementia Caregiver ESM Study — Full replication of standalone dementia survey
    // ============================
    // HOURLY ACTIVITY LOG (questionnaire_id: esm-hourly-log)
    // ============================

    // --- Tab 1: Activity ---
    { text: 'Activity', type: 'section_header', required: false, config: { section_icon: '📋', section_color: '#10b981', questionnaire_id: 'esm-hourly-log' } },

    // Q1: Activity Category (multi-select checkboxes — 13 categories + Other)
    { text: 'What caregiving activities did you do?', type: 'checkbox_group', required: true, options: [
      'Clinical: medication, medical tasks (catheter, wound care)',
      'Functional: feeding/eating, bathing, dressing, grooming, toileting, ambulation',
      'Cognitive: orientation (time, day, names, location), conversation, answering questions, current events',
      'Decision Making: medical decisions, financial decisions, non-medical decisions',
      'Housekeeping: preparing meals, cleaning house/yard, shopping, managing wardrobe',
      'Info Management: coordinating care, communicating with care team, managing finances/bills',
      'Logistics: scheduling appointments, reminding, ensuring delivery of necessities',
      'Transportation: driving, arranging rides, accompanying to appointments',
      'Companionship: social interaction, conversation, games, music, walks, outings',
      'Caregiver Support: emotional support for other caregivers, filling in/respite',
      'Vigilance: supervision, safety monitoring, accompanying on walks/errands, preventing wandering',
      'Pet Care: walking pets, feeding, vet visits, pet management',
      'Skill Development: attending classes, reading books, self-reflection, learning about dementia',
      'Other'
    ], config: { questionnaire_id: 'esm-hourly-log', layout: 'vertical' } },

    // Q2: Event Stress Rating (bipolar -3 to +3)
    { text: 'How pleasant/unpleasant was this event?', type: 'bipolar_scale', required: true, config: { min_value: -3, max_value: 3, step: 1, min_label: 'Very Unpleasant', max_label: 'Very Pleasant', show_value_labels: true, questionnaire_id: 'esm-hourly-log' } },

    // Q3: Activity Description (text_long with voice + AI)
    { text: 'Please describe what you were doing', type: 'text_long', required: false, config: { questionnaire_id: 'esm-hourly-log', placeholder: 'Describe your care activities. If you prefer not to fill each tab separately, you can describe everything here at once.' } },

    // Q4: Memory problems (yes/no)
    { text: 'During this event, did your care recipient show memory problems? (e.g., repeating things, losing things, not completing a task, not remembering events or persons, concentration difficulties)', type: 'yes_no', required: true, config: { questionnaire_id: 'esm-hourly-log' } },
    // Q5: Behavior problems (yes/no)
    { text: 'During this event, did your care recipient show behavior problems? (e.g., breaking things on purpose, verbal aggression, threats to harm others, night wandering, opposition or provocation)', type: 'yes_no', required: true, config: { questionnaire_id: 'esm-hourly-log' } },
    // Q6: Depressive symptoms (yes/no)
    { text: 'During this event, did your care recipient show depressive symptoms? (e.g., sadness, hopelessness, threats of self-harm, speaking of dying, suffering from loneliness, uselessness or worthlessness)', type: 'yes_no', required: true, config: { questionnaire_id: 'esm-hourly-log' } },

    // Q7: Distress from MBP (0-4 scale)
    { text: 'During this event, how much did their memory/behavioral problems disturb or upset you?', type: 'likert_scale', required: false, config: { scale_type: '0-4', custom_labels: ['0 = Not at all', '1 = A little', '2 = Moderate', '3 = Quite a bit', '4 = Extremely'], questionnaire_id: 'esm-hourly-log' } },

    // Q8: Unfulfilled care needs (optional)
    { text: 'Unfulfilled Care Needs', type: 'text_long', required: false, config: { questionnaire_id: 'esm-hourly-log', placeholder: 'Describe care activities you couldn\'t do due to various reasons. E.g. lack of knowledge, no one available to help, insufficient resources, safety concerns.' } },

    // Q9: Ideas or Suggestions (optional)
    { text: 'Ideas or Suggestions', type: 'text_long', required: false, config: { questionnaire_id: 'esm-hourly-log', placeholder: 'Describe resources, tools, or services you think might be helpful. Even if nothing particular happened, you can record your thoughts or ideas.' } },

    // Q10: Time Spent (minutes)
    { text: 'How long did you spend on this activity (minutes)?', type: 'number', required: false, config: { questionnaire_id: 'esm-hourly-log', placeholder: '30' } },

    // --- Tab 2: Wellbeing (Affect) ---
    { text: 'Your Wellbeing', type: 'section_header', required: false, config: { section_icon: '💛', section_color: '#eab308', questionnaire_id: 'esm-hourly-log' } },

    // Q11: Positive Affect (PANAS-based, 1-7 likert each)
    { text: 'Right now, I feel cheerful', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much', questionnaire_id: 'esm-hourly-log' } },
    { text: 'Right now, I feel relaxed', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much', questionnaire_id: 'esm-hourly-log' } },
    { text: 'Right now, I feel enthusiastic', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much', questionnaire_id: 'esm-hourly-log' } },
    { text: 'Right now, I feel satisfied', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much', questionnaire_id: 'esm-hourly-log' } },

    // Q12: Negative Affect (PANAS-based, 1-7 likert each)
    { text: 'Right now, I feel insecure', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much', questionnaire_id: 'esm-hourly-log' } },
    { text: 'Right now, I feel lonely', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much', questionnaire_id: 'esm-hourly-log' } },
    { text: 'Right now, I feel anxious', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much', questionnaire_id: 'esm-hourly-log' } },
    { text: 'Right now, I feel irritated', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much', questionnaire_id: 'esm-hourly-log' } },
    { text: 'Right now, I feel down', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much', questionnaire_id: 'esm-hourly-log' } },
    { text: 'Right now, I feel desperate', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much', questionnaire_id: 'esm-hourly-log' } },
    { text: 'Right now, I feel tensed', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Not at all', max_label: 'Very much', questionnaire_id: 'esm-hourly-log' } },

    // --- Tab 3: People ---
    { text: 'People', type: 'section_header', required: false, config: { section_icon: '👥', section_color: '#06b6d4', questionnaire_id: 'esm-hourly-log' } },

    // Q13: People Involved
    { text: 'Who was with you or helped you?', type: 'text_long', required: false, config: { questionnaire_id: 'esm-hourly-log', placeholder: 'Describe who was involved: e.g. family (spouse, children), healthcare workers (doctor, nurse, aide), friends, neighbors. What help did they provide?' } },
    // Q14: Who else
    { text: 'Who else do you wish could have helped?', type: 'text_long', required: false, config: { questionnaire_id: 'esm-hourly-log', placeholder: 'Describe people you wish could be involved but are not. E.g. other family members, neighbors, friends, professional caregivers, volunteers, social workers.' } },
    // Q15: Challenges reaching people
    { text: 'Challenges in reaching people you wish could help', type: 'text_long', required: false, config: { questionnaire_id: 'esm-hourly-log', placeholder: 'Describe challenges in contacting or getting help. E.g. felt awkward asking, scheduling conflicts, couldn\'t reach them.' } },

    // --- Tab 4: Challenges & Resources ---
    { text: 'Challenges & Resources', type: 'section_header', required: false, config: { section_icon: '⚡', section_color: '#f59e0b', questionnaire_id: 'esm-hourly-log' } },

    // Q16: Task Difficulty (bipolar -3 to +3)
    { text: 'How challenging was this activity overall?', type: 'bipolar_scale', required: true, config: { min_value: -3, max_value: 3, step: 1, min_label: 'No Challenges', max_label: 'Extreme Challenges', show_value_labels: true, questionnaire_id: 'esm-hourly-log' } },

    // Q17: Challenge Types (multi-select checkboxes — 11 types)
    { text: 'What types of challenges did you experience?', type: 'checkbox_group', required: false, options: [
      'Handle symptoms',
      'Condition understanding',
      'Condition updates',
      'Coordination difficulties',
      'Time constraints',
      'Emotional stress',
      'Physical demands',
      'Communication issues',
      'Safety concerns',
      'Privacy issues',
      'Other'
    ], config: { questionnaire_id: 'esm-hourly-log', layout: 'horizontal' } },

    // Q18: Challenges faced (text_long)
    { text: 'Describe the challenges you faced', type: 'text_long', required: false, config: { questionnaire_id: 'esm-hourly-log', placeholder: 'Describe difficulties. E.g. not knowing how to handle symptoms, not understanding condition, time constraints, emotional stress, coordination difficulties.' } },

    // Q19: Resources currently using
    { text: 'Resources currently using & challenges with them', type: 'text_long', required: false, config: { questionnaire_id: 'esm-hourly-log', placeholder: 'Describe tools/resources you use and challenges. E.g. care apps (complex interface, burden of input), reminder tools, info websites, support groups, family help.' } },

    // Q20: Resources wished for
    { text: 'Resources you wish existed or improved', type: 'text_long', required: false, config: { questionnaire_id: 'esm-hourly-log', placeholder: 'Describe tools you wish existed, or improvements to current tools. E.g. better care coordination apps, platforms to find helpers, patient info sharing tools.' } },

    // ============================
    // DAILY REFLECTION (questionnaire_id: esm-daily-log)
    // ============================
    { text: 'Daily Reflection', type: 'section_header', required: false, config: { section_icon: '🌙', section_color: '#8b5cf6', questionnaire_id: 'esm-daily-log' } },

    // Q1: SOC Stressed (1-7 likert)
    { text: 'Today I felt stressed due to my care responsibilities', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Strongly Disagree', max_label: 'Strongly Agree', questionnaire_id: 'esm-daily-log' } },
    // Q2: SOC Privacy (1-7 likert)
    { text: 'Today I felt that the situation with my care recipient did not allow me as much privacy as I would have liked', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Strongly Disagree', max_label: 'Strongly Agree', questionnaire_id: 'esm-daily-log' } },
    // Q3: SOC Strained (1-7 likert)
    { text: 'Today I felt strained in the interactions with my care recipient', type: 'likert_scale', required: true, config: { scale_type: '1-7', min_label: 'Strongly Disagree', max_label: 'Strongly Agree', questionnaire_id: 'esm-daily-log' } },
    // Q4: Daily Burden Rating (bipolar -3 to +3)
    { text: 'Overall, how burdensome or manageable was caregiving today?', type: 'bipolar_scale', required: true, config: { min_value: -3, max_value: 3, step: 1, min_label: 'Very Burdensome', max_label: 'Very Manageable', show_value_labels: true, questionnaire_id: 'esm-daily-log' } },
    // Q5: Supplement notes (text_long)
    { text: 'Supplement missed logs', type: 'text_long', required: false, config: { questionnaire_id: 'esm-daily-log', placeholder: 'If there are caregiving activities today that were not recorded during hourly reminders, you can add notes here.' } },
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
    notification_frequency: 'multiple_daily',
    notification_times_per_day: 13,
    notification_times: ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'],
    notification_send_reminders: true,
    notification_timezone: 'auto',
    sampling_type: 'fixed_schedule',
    sampling_prompts_per_day: 13,
    sampling_start_hour: 9,
    sampling_end_hour: 21,
    sampling_allow_late: true,
    sampling_late_window_minutes: 60,
    show_progress_bar: true,
    enable_timeline_view: true,
    show_progress_tracker: true,
    // Multi-questionnaire configs for the ESM template
    questionnaire_configs: [
        {
          id: 'esm-hourly-log',
          title: 'Hourly Activity Log',
          description: 'Log your caregiving activities, mood, and challenges every hour.',
          questions: [],
          estimated_duration: 3,
          frequency: 'hourly',
          time_windows: [{ start: '09:00', end: '21:00' }],
          notification_enabled: true,
          notification_minutes_before: 0,
          dnd_allowed: true,
          dnd_default_start: '22:00',
          dnd_default_end: '08:00',
          assigned_participant_types: ['pt-primary', 'pt-family'],
          order_index: 0,
        },
        {
          id: 'esm-daily-log',
          title: 'Daily Reflection',
          description: 'End-of-day summary of caregiving burden, wellbeing, and support received.',
          questions: [],
          estimated_duration: 5,
          frequency: 'daily',
          time_windows: [{ start: '20:00', end: '23:00' }],
          notification_enabled: true,
          notification_minutes_before: 10,
          dnd_allowed: true,
          dnd_default_start: '23:00',
          dnd_default_end: '08:00',
          assigned_participant_types: ['pt-primary', 'pt-family'],
          order_index: 1,
        },
      ],
      // Participant types
      participant_types: [
        {
          id: 'pt-primary',
          name: 'Primary Caregiver',
          description: 'The main person providing daily care for the person with dementia.',
          relations: ['Spouse/Partner', 'Adult Child', 'Parent', 'Sibling', 'Other Relative', 'Professional'],
          consent_forms: [
            { id: 'cf-primary', title: 'Primary Caregiver Consent', text: 'I agree to participate in this 7-day experience sampling study. I understand I will receive hourly prompts between 9am-9pm and a daily reflection prompt.', required: true },
          ],
          screening_questions: [
            { id: 'sq-p-1', question: 'Do you provide at least 4 hours of direct care per week?', type: 'yes_no' as const, required: true, disqualify_value: 'no' },
            { id: 'sq-p-2', question: 'Do you live with or regularly visit the care recipient?', type: 'yes_no' as const, required: true, disqualify_value: 'no' },
          ],
          color: '#10b981',
          order_index: 0,
        },
        {
          id: 'pt-family',
          name: 'Family Member',
          description: 'A family member involved in care coordination but not providing daily hands-on care.',
          relations: ['Spouse/Partner', 'Adult Child', 'Sibling', 'In-law', 'Other'],
          consent_forms: [
            { id: 'cf-family', title: 'Family Member Consent', text: 'I agree to participate in this study by completing the daily reflection questionnaire each evening.', required: true },
          ],
          screening_questions: [
            { id: 'sq-f-1', question: 'Are you a family member of someone with dementia?', type: 'yes_no' as const, required: true, disqualify_value: 'no' },
          ],
          color: '#3b82f6',
          order_index: 1,
        },
      ],
      // Default app layout
      app_layout: {
        tabs: [
          {
            id: 'tab-home',
            label: 'Home',
            icon: 'Home',
            elements: [
              { id: 'el-progress', type: 'progress', config: { title: 'Study Progress', visible: true }, order_index: 0 },
              { id: 'el-hourly', type: 'questionnaire', config: { questionnaire_id: 'esm-hourly-log', title: 'Hourly Activity Log', visible: true }, order_index: 1 },
              { id: 'el-daily', type: 'questionnaire', config: { questionnaire_id: 'esm-daily-log', title: 'Daily Reflection', visible: true }, order_index: 2 },
            ],
            order_index: 0,
          },
          {
            id: 'tab-timeline',
            label: 'Timeline',
            icon: 'FileText',
            elements: [
              { id: 'el-timeline', type: 'timeline', config: { title: 'Study Timeline', visible: true }, order_index: 0 },
            ],
            order_index: 1,
          },
          {
            id: 'tab-network',
            label: 'Network',
            icon: 'Layout',
            elements: [
              { id: 'el-ecogram', type: 'ecogram', config: { title: 'Care Network', visible: true }, order_index: 0 },
            ],
            order_index: 2,
          },
          {
            id: 'tab-settings',
            label: 'Settings',
            icon: 'Settings',
            elements: [
              { id: 'el-profile', type: 'profile', config: { title: 'My Profile', visible: true }, order_index: 0 },
              { id: 'el-help', type: 'help', config: { title: 'Help & FAQ', visible: true }, order_index: 1 },
            ],
            order_index: 3,
          },
        ],
        bottom_nav: [
          { icon: 'Home', label: 'Home', tab_id: 'tab-home' },
          { icon: 'FileText', label: 'Timeline', tab_id: 'tab-timeline' },
          { icon: 'Layout', label: 'Network', tab_id: 'tab-network' },
          { icon: 'Settings', label: 'Settings', tab_id: 'tab-settings' },
        ],
        show_header: true,
        header_title: '',
        theme: {
          primary_color: '#10b981',
          background_color: '#f5f5f4',
          card_style: 'elevated',
        },
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

// Get template-specific project settings (questionnaire configs, participant types, layout, etc.)
export function getTemplateSettings(templateId: string) {
  return TEMPLATE_PROJECT_SETTINGS[templateId] || null;
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

    // Create the project — all flat columns, no JSONB
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
        // Display settings — flat columns
        show_progress_bar: templateSettings?.show_progress_bar ?? true,
        consent_required: templateSettings?.consent_required || false,
        consent_form_title: 'Research Consent Form',
        consent_form_text: templateSettings?.consent_form_text || null,
        screening_enabled: templateSettings?.screening_enabled || false,
        participant_numbering: templateSettings?.participant_numbering || false,
        participant_number_prefix: templateSettings?.participant_number_prefix || 'PP',
        participant_relation_enabled: templateSettings?.participant_relation_enabled || false,
        participant_relation_options: templateSettings?.participant_relation_options || [],
        ecogram_enabled: templateSettings?.ecogram_enabled || false,
        ecogram_center_label: templateSettings?.ecogram_config?.center_label || 'Me',
        ecogram_relationship_options: (templateSettings?.ecogram_config?.relationship_options || []).map((o: any) => o.value || o),
        ecogram_support_categories: (templateSettings?.ecogram_config?.support_categories || []).map((o: any) => o.value || o),
        app_layout: templateSettings?.app_layout || {},
        // Notification — flat columns
        notification_frequency: templateSettings?.notification_frequency || null,
        notification_times_per_day: templateSettings?.notification_times_per_day || null,
        notification_times: templateSettings?.notification_times || [],
        notification_send_reminders: templateSettings?.notification_send_reminders ?? true,
        notification_timezone: templateSettings?.notification_timezone || null,
        // Sampling — flat columns
        sampling_type: templateSettings?.sampling_type || null,
        sampling_prompts_per_day: templateSettings?.sampling_prompts_per_day || null,
        sampling_start_hour: templateSettings?.sampling_start_hour ?? 8,
        sampling_end_hour: templateSettings?.sampling_end_hour ?? 21,
        sampling_allow_late: templateSettings?.sampling_allow_late ?? true,
        sampling_late_window_minutes: templateSettings?.sampling_late_window_minutes ?? 60,
      })
      .select()
      .single();

    if (projectError) {
      console.error('Project creation error:', projectError);
      return { error: projectError.message };
    }

    // ── Insert participant types into participant_type table ──
    const templateParticipantTypes = templateSettings?.participant_types || [];
    const insertedPTIdMap = new Map<string, string>(); // old template id -> new db id
    for (const pt of templateParticipantTypes) {
      const ptId = crypto.randomUUID();
      insertedPTIdMap.set(pt.id, ptId);
      await supabase.from('participant_type').insert({
        id: ptId,
        project_id: project.id,
        name: pt.name,
        description: pt.description || '',
        relations: pt.relations || [],
        color: pt.color || '#10b981',
        order_index: pt.order_index ?? 0,
      });

      // Insert consent forms as consent-type questionnaires
      if (pt.consent_forms) {
        for (const cf of pt.consent_forms) {
          const cfQId = crypto.randomUUID();
          await supabase.from('questionnaire').insert({
            id: cfQId,
            project_id: project.id,
            questionnaire_type: 'consent',
            title: cf.title || 'Consent Form',
            description: '',
            consent_text: cf.text || '',
            consent_url: cf.url || null,
            consent_required: cf.required ?? true,
            order_index: 0,
          });
          await supabase.from('questionnaire_participant_type').insert({
            questionnaire_id: cfQId,
            participant_type_id: ptId,
          });
        }
      }

      // Insert screening questions as screening-type questionnaires
      if (pt.screening_questions && pt.screening_questions.length > 0) {
        const sqQId = crypto.randomUUID();
        await supabase.from('questionnaire').insert({
          id: sqQId,
          project_id: project.id,
          questionnaire_type: 'screening',
          title: `${pt.name} Screening`,
          description: '',
          order_index: 0,
        });
        await supabase.from('questionnaire_participant_type').insert({
          questionnaire_id: sqQId,
          participant_type_id: ptId,
        });
        // Insert screening questions as survey_question rows linked to the screening questionnaire
        for (let sqIdx = 0; sqIdx < pt.screening_questions.length; sqIdx++) {
          const sq = pt.screening_questions[sqIdx];
          await supabase.from('survey_question').insert({
            project_id: project.id,
            questionnaire_id: sqQId,
            question_type: sq.type === 'yes_no' ? 'yes_no' : sq.type === 'select' ? 'single_choice' : 'text_short',
            question_text: sq.question,
            required: sq.required ?? true,
            order_index: sqIdx,
            question_config: { disqualify_value: sq.disqualify_value || null },
          });
        }
      }
    }

    // ── Insert survey-type questionnaires into questionnaire table ──
    const templateQConfigs = templateSettings?.questionnaire_configs || [];
    const insertedQIdMap = new Map<string, string>(); // old template id -> new db id
    for (const qc of templateQConfigs) {
      const qcId = crypto.randomUUID();
      insertedQIdMap.set(qc.id, qcId);
      await supabase.from('questionnaire').insert({
        id: qcId,
        project_id: project.id,
        questionnaire_type: 'survey',
        title: qc.title,
        description: qc.description || '',
        estimated_duration: qc.estimated_duration || 5,
        frequency: qc.frequency || 'once',
        time_windows: qc.time_windows || [{ start: '09:00', end: '21:00' }],
        notification_enabled: qc.notification_enabled || false,
        notification_minutes_before: qc.notification_minutes_before || 5,
        dnd_allowed: qc.dnd_allowed || false,
        dnd_default_start: qc.dnd_default_start || '22:00',
        dnd_default_end: qc.dnd_default_end || '08:00',
        order_index: qc.order_index ?? 0,
      });
      // Link to participant types
      if (qc.assigned_participant_types) {
        for (const oldPtId of qc.assigned_participant_types) {
          const newPtId = insertedPTIdMap.get(oldPtId);
          if (newPtId) {
            await supabase.from('questionnaire_participant_type').insert({
              questionnaire_id: qcId,
              participant_type_id: newPtId,
            });
          }
        }
      }
    }

    // Get template questions (do not silently create the wrong survey)
    const questions = templateQuestions[templateId];
    if (!questions) {
      return { error: 'This template is not supported yet.' };
    }

    // Insert questions with proper questionnaire_id FK
    const questionsToInsert = questions.map((q: any, index: number) => {
      // Resolve questionnaire_id: use the new DB id from the map
      const oldQId = q.config?.questionnaire_id;
      const newQId = oldQId ? insertedQIdMap.get(oldQId) : undefined;
      return {
        project_id: project.id,
        questionnaire_id: newQId || null,
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
      };
    });

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
