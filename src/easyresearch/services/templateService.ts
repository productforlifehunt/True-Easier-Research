import { supabase } from '../../lib/supabase';
import { normalizeLegacyQuestionType } from '../constants/questionTypes';

// Template questions for each template ID
const templateQuestions: Record<string, Array<{text: string, type: string, required: boolean, options?: string[]}>> = {
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

    // Create the project
    const { data: project, error: projectError } = await supabase
      .from('research_project')
      .insert({
        organization_id: researcher.organization_id,
        researcher_id: researcher.id,
        title: templateName,
        description: templateDescription,
        project_type: 'survey',
        methodology_type: 'single_survey',
        ai_enabled: false,
        voice_enabled: false,
        notification_enabled: true,
        survey_code: surveyCode,
        status: 'draft',
        setting: { show_progress_bar: true, allow_back_navigation: true }
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
    const questionsToInsert = questions.map((q, index) => ({
      project_id: project.id,
      question_type: normalizeLegacyQuestionType(q.type),
      question_text: q.text,
      question_description: '',
      required: q.required,
      order_index: index + 1,
      question_config: {},
      validation_rule: {},
      logic_rule: {},
      ai_config: {}
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
