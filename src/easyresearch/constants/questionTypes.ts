// Canonical Question Types - Single Source of Truth
// This file defines the exact question types supported across the entire EasyResearch platform
// Builder, Preview, Participant, and Response handling must all use this same list

export const SUPPORTED_QUESTION_TYPES = {
  // Text Input Types
  TEXT_SHORT: 'text_short',
  TEXT_LONG: 'text_long',
  
  // Choice Types
  SINGLE_CHOICE: 'single_choice',
  MULTIPLE_CHOICE: 'multiple_choice',
  DROPDOWN: 'dropdown',
  CHECKBOX_GROUP: 'checkbox_group',
  
  // Scale Types
  SLIDER: 'slider',
  BIPOLAR_SCALE: 'bipolar_scale',
  RATING: 'rating',
  LIKERT_SCALE: 'likert_scale',
  NPS: 'nps',
  
  // Data Types
  NUMBER: 'number',
  DATE: 'date',
  TIME: 'time',
  EMAIL: 'email',

  // Advanced Types
  MATRIX: 'matrix',
  RANKING: 'ranking',
  FILE_UPLOAD: 'file_upload',
  PHONE: 'phone',
  IMAGE_CHOICE: 'image_choice',
  YES_NO: 'yes_no',
  INSTRUCTION: 'instruction',
  CONSTANT_SUM: 'constant_sum',
  SIGNATURE: 'signature',
  ADDRESS: 'address',
  SLIDER_RANGE: 'slider_range',

  // Rich Media Types
  VIDEO_BLOCK: 'video_block',
  AUDIO_BLOCK: 'audio_block',
  EMBED_BLOCK: 'embed_block',

  // UX Research Types
  CARD_SORT: 'card_sort',
  TREE_TEST: 'tree_test',
  FIRST_CLICK: 'first_click',
  FIVE_SECOND_TEST: 'five_second_test',
  PREFERENCE_TEST: 'preference_test',
  PROTOTYPE_TEST: 'prototype_test',

  // Advanced UX Research Types (Qualtrics/Conjoint-level)
  MAX_DIFF: 'max_diff',
  DESIGN_SURVEY: 'design_survey',
  HEATMAP: 'heatmap',
  CONJOINT: 'conjoint',
  KANO: 'kano',

  // Standardized UX Metrics
  SUS: 'sus',
  CSAT: 'csat',
  CES: 'ces',

  SECTION_HEADER: 'section_header',
  TEXT_BLOCK: 'text_block',
  DIVIDER: 'divider',
  IMAGE_BLOCK: 'image_block',
} as const;

export type SupportedQuestionType = typeof SUPPORTED_QUESTION_TYPES[keyof typeof SUPPORTED_QUESTION_TYPES];

// Question type metadata for builder UI
export interface QuestionTypeDefinition {
  type: SupportedQuestionType;
  label: string;
  description: string;
  icon: string;
  category: 'text' | 'choice' | 'scale' | 'data' | 'advanced' | 'layout';
  requiresOptions: boolean;
  supportsOther: boolean;
  supportsNone: boolean;
  defaultConfig: Record<string, any>;
}

export const QUESTION_TYPE_DEFINITIONS: QuestionTypeDefinition[] = [
  // Text Input Types
  {
    type: SUPPORTED_QUESTION_TYPES.TEXT_SHORT,
    label: 'Short Text',
    description: 'Single line text input for brief responses',
    icon: 'Aa',
    category: 'text',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { max_length: 100 }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.TEXT_LONG,
    label: 'Long Text',
    description: 'Multi-line text area for detailed responses',
    icon: 'P',
    category: 'text',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { max_length: 2000 }
  },
  
  // Choice Types
  {
    type: SUPPORTED_QUESTION_TYPES.SINGLE_CHOICE,
    label: 'Single Choice',
    description: 'Radio buttons - select one option',
    icon: 'O',
    category: 'choice',
    requiresOptions: true,
    supportsOther: true,
    supportsNone: true,
    defaultConfig: {}
  },
  {
    type: SUPPORTED_QUESTION_TYPES.MULTIPLE_CHOICE,
    label: 'Multiple Choice',
    description: 'Checkboxes - select multiple options',
    icon: 'Chk',
    category: 'choice',
    requiresOptions: true,
    supportsOther: true,
    supportsNone: true,
    defaultConfig: {}
  },
  {
    type: SUPPORTED_QUESTION_TYPES.DROPDOWN,
    label: 'Dropdown',
    description: 'Dropdown menu for space-efficient choice selection',
    icon: 'V',
    category: 'choice',
    requiresOptions: true,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: {}
  },
  {
    type: SUPPORTED_QUESTION_TYPES.CHECKBOX_GROUP,
    label: 'Checkbox Group',
    description: 'Categorized multi-select checkboxes (e.g., activity types, challenge types)',
    icon: 'Chk',
    category: 'choice',
    requiresOptions: true,
    supportsOther: true,
    supportsNone: false,
    defaultConfig: { layout: 'vertical', columns: 1 }
  },
  
  // Scale Types
  {
    type: SUPPORTED_QUESTION_TYPES.SLIDER,
    label: 'Slider',
    description: 'Continuous range slider for numeric input',
    icon: 'SL',
    category: 'scale',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { min_value: 0, max_value: 10, step: 1 }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.BIPOLAR_SCALE,
    label: 'Bipolar Scale',
    description: 'Negative-to-positive scale (e.g., -3 to +3) with labeled endpoints',
    icon: '+-',
    category: 'scale',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { min_value: -3, max_value: 3, step: 1, min_label: 'Very Negative', max_label: 'Very Positive', show_value_labels: true }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.RATING,
    label: 'Rating Scale',
    description: 'Star or number rating (1-5, 1-10, etc.)',
    icon: '*',
    category: 'scale',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { max_value: 5 }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.LIKERT_SCALE,
    label: 'Likert Scale',
    description: 'Agreement scale (Strongly Disagree to Strongly Agree)',
    icon: 'LK',
    category: 'scale',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: {}
  },
  {
    type: SUPPORTED_QUESTION_TYPES.NPS,
    label: 'NPS Score',
    description: 'Net Promoter Score (0-10 likelihood to recommend)',
    icon: 'NPS',
    category: 'scale',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: {}
  },
  
  // Data Types
  {
    type: SUPPORTED_QUESTION_TYPES.NUMBER,
    label: 'Number',
    description: 'Numeric input field',
    icon: '#',
    category: 'data',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: {}
  },
  {
    type: SUPPORTED_QUESTION_TYPES.DATE,
    label: 'Date',
    description: 'Date picker input',
    icon: 'Cal',
    category: 'data',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: {}
  },
  {
    type: SUPPORTED_QUESTION_TYPES.TIME,
    label: 'Time',
    description: 'Time picker input',
    icon: 'Clk',
    category: 'data',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: {}
  },
  {
    type: SUPPORTED_QUESTION_TYPES.EMAIL,
    label: 'Email',
    description: 'Email address input with validation',
    icon: '@',
    category: 'data',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: {}
  },

  // Advanced Types
  {
    type: SUPPORTED_QUESTION_TYPES.MATRIX,
    label: 'Matrix / Grid',
    description: 'Grid of rows x columns for multi-item scales (e.g., satisfaction across categories)',
    icon: 'Mx',
    category: 'choice',
    requiresOptions: true,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { columns: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.RANKING,
    label: 'Ranking',
    description: 'Drag-to-rank items in order of preference',
    icon: 'Rk',
    category: 'choice',
    requiresOptions: true,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: {}
  },
  {
    type: SUPPORTED_QUESTION_TYPES.FILE_UPLOAD,
    label: 'File Upload',
    description: 'Allow participants to upload images, documents, or other files',
    icon: 'Up',
    category: 'data',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { max_files: 1, max_size_mb: 10, accepted_types: 'image/*,.pdf,.doc,.docx' }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.PHONE,
    label: 'Phone Number',
    description: 'Phone number input with formatting',
    icon: 'Ph',
    category: 'data',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: {}
  },
  {
    type: SUPPORTED_QUESTION_TYPES.IMAGE_CHOICE,
    label: 'Image Choice',
    description: 'Select from image-based options (e.g., emoji mood, visual stimuli)',
    icon: 'Img',
    category: 'choice',
    requiresOptions: true,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { allow_multiple: false }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.YES_NO,
    label: 'Yes / No',
    description: 'Simple binary yes/no toggle',
    icon: 'YN',
    category: 'choice',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { yes_label: 'Yes', no_label: 'No' }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.INSTRUCTION,
    label: 'Instruction Block',
    description: 'Display instructions, information, or media to participants (no response collected)',
    icon: 'i',
    category: 'layout',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { content_type: 'text' }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.CONSTANT_SUM,
    label: 'Constant Sum',
    description: 'Distribute a fixed total (e.g. 100 points) across multiple options',
    icon: 'Sum',
    category: 'advanced',
    requiresOptions: true,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { total: 100 }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.SIGNATURE,
    label: 'Signature',
    description: 'Draw a signature on a touch/mouse canvas for consent or verification',
    icon: 'Sig',
    category: 'advanced',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: {}
  },
  {
    type: SUPPORTED_QUESTION_TYPES.ADDRESS,
    label: 'Address',
    description: 'Structured address input with street, city, state/province, postal code, and country fields',
    icon: 'Loc',
    category: 'data',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { show_country: true }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.SLIDER_RANGE,
    label: 'Range Slider',
    description: 'Dual-handle slider for selecting a numeric range (min-max)',
    icon: 'Rng',
    category: 'scale',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { min_value: 0, max_value: 100, step: 1, min_label: '', max_label: '' }
  },

  // Layout Types
  {
    type: SUPPORTED_QUESTION_TYPES.SECTION_HEADER,
    label: 'Section / Tab',
    description: 'Group questions into tabs or sections. All questions until the next section header belong to this section.',
    icon: 'S',
    category: 'layout',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { section_icon: '', section_color: '#10b981' }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.TEXT_BLOCK,
    label: 'Text Block',
    description: 'Rich text content block for descriptions, notes, or formatted information',
    icon: 'Txt',
    category: 'layout',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { content: '', font_size: 14 }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.DIVIDER,
    label: 'Divider Line',
    description: 'Visual separator line between sections or questions',
    icon: '--',
    category: 'layout',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { style: 'solid', color: '#e5e7eb', thickness: 1 }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.IMAGE_BLOCK,
    label: 'Image',
    description: 'Display an image with optional caption (no response collected)',
    icon: 'Img',
    category: 'layout',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { image_url: '', caption: '', alt_text: '', max_width: '100%' }
  },
  // Rich Media Types
  {
    type: SUPPORTED_QUESTION_TYPES.VIDEO_BLOCK,
    label: 'Video',
    description: 'Embed or upload video (YouTube, Vimeo, MP4, or direct URL)',
    icon: 'Vid',
    category: 'layout',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { video_url: '', autoplay: false, loop: false, muted: true }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.AUDIO_BLOCK,
    label: 'Audio',
    description: 'Embed audio clips (MP3, WAV, or streaming URL)',
    icon: 'Aud',
    category: 'layout',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { audio_url: '', autoplay: false, loop: false }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.EMBED_BLOCK,
    label: 'Embed / Webpage',
    description: 'Embed any webpage, iframe, Figma, Google Docs, Miro, Loom, or custom HTML',
    icon: 'Web',
    category: 'layout',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { embed_url: '', embed_type: 'iframe', embed_height: '400px', allow_fullscreen: true }
  },

  // UX Research Types
  {
    type: SUPPORTED_QUESTION_TYPES.CARD_SORT,
    label: 'Card Sort',
    description: 'Participants organize cards into categories (open or closed sort)',
    icon: 'CS',
    category: 'advanced',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { cards: ['Card 1', 'Card 2', 'Card 3'], categories: ['Category A', 'Category B'], sort_type: 'open' }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.TREE_TEST,
    label: 'Tree Test',
    description: 'Test information architecture - participants navigate a tree to find items',
    icon: 'TT',
    category: 'advanced',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { tree_data: [{ label: 'Home', children: [{ label: 'Products', children: [] }, { label: 'About', children: [] }] }], task_description: 'Find the product page', correct_answer: 'Products' }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.FIRST_CLICK,
    label: 'First Click Test',
    description: 'Record where participants click first on an image/design',
    icon: 'FC',
    category: 'advanced',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { test_image_url: '', task_description: 'Where would you click to...?', followup_question: 'Why did you click there?' }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.FIVE_SECOND_TEST,
    label: '5-Second Test',
    description: 'Show a design for 5 seconds, then ask recall questions',
    icon: '5s',
    category: 'advanced',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { test_image_url: '', test_duration: 5, followup_question: 'What do you remember about this page?' }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.PREFERENCE_TEST,
    label: 'Preference Test',
    description: 'A/B comparison - participants choose between two design variants',
    icon: 'AB',
    category: 'advanced',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { variant_a_url: '', variant_a_label: 'Design A', variant_b_url: '', variant_b_label: 'Design B', followup_question: 'Why do you prefer this design?' }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.PROTOTYPE_TEST,
    label: 'Prototype Test',
    description: 'Embed a Figma/InVision prototype and track usability tasks',
    icon: 'PT',
    category: 'advanced',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { prototype_url: '', prototype_platform: 'figma', task_list: [{ task: 'Complete the checkout flow', success_url: '' }], embed_height: '600px' }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.MAX_DIFF,
    label: 'MaxDiff (Best-Worst)',
    description: 'Best-worst scaling - participants pick most/least preferred from sets of items',
    icon: 'MD',
    category: 'advanced',
    requiresOptions: true,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { items_per_set: 4, best_label: 'Most Important', worst_label: 'Least Important' }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.DESIGN_SURVEY,
    label: 'Design Survey (Multi)',
    description: 'Compare 3+ design variants - participants rank or rate multiple options',
    icon: 'DS',
    category: 'advanced',
    requiresOptions: true,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { show_labels: true, randomize_variants: false, followup_question: 'Which design best meets your needs and why?' }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.HEATMAP,
    label: 'Heatmap (Multi-Click)',
    description: 'Participants click multiple areas on an image to indicate attention, interest, or confusion',
    icon: 'HM',
    category: 'advanced',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { test_image_url: '', task_description: 'Click all areas that grab your attention', allow_multiple_clicks: true, max_clicks: 10, followup_question: '' }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.CONJOINT,
    label: 'Conjoint Analysis',
    description: 'Choice-based conjoint - participants choose preferred product profiles from attribute combinations',
    icon: 'CJ',
    category: 'advanced',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: {
      conjoint_attributes: [
        { name: 'Price', levels: ['$10', '$20', '$30'] },
        { name: 'Color', levels: ['Red', 'Blue', 'Green'] },
        { name: 'Size', levels: ['Small', 'Medium', 'Large'] }
      ],
      profiles_per_task: 3,
      num_choice_tasks: 6,
      include_none_option: true
    }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.KANO,
    label: 'Kano Model',
    description: 'Kano analysis - paired functional/dysfunctional questions to classify feature importance',
    icon: 'KN',
    category: 'advanced',
    requiresOptions: true,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: {
      kano_functional: 'How would you feel if this feature were present?',
      kano_dysfunctional: 'How would you feel if this feature were absent?',
      kano_categories: ['I like it', 'I expect it', 'I am neutral', 'I can tolerate it', 'I dislike it']
    }
  },
  // Standardized UX Metrics
  {
    type: SUPPORTED_QUESTION_TYPES.SUS,
    label: 'SUS (System Usability)',
    description: 'System Usability Scale - 10-item standardized questionnaire yielding a 0-100 score',
    icon: 'SUS',
    category: 'scale',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { scale_type: 'sus' }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.CSAT,
    label: 'CSAT (Satisfaction)',
    description: 'Customer Satisfaction Score - "How satisfied are you?" on a 1-5 scale',
    icon: 'SAT',
    category: 'scale',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { scale_type: 'csat', min_value: 1, max_value: 5, min_label: 'Very Unsatisfied', max_label: 'Very Satisfied' }
  },
  {
    type: SUPPORTED_QUESTION_TYPES.CES,
    label: 'CES (Effort Score)',
    description: 'Customer Effort Score - "How easy was it to...?" on a 1-7 scale',
    icon: 'CES',
    category: 'scale',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { scale_type: 'ces', min_value: 1, max_value: 7, min_label: 'Very Difficult', max_label: 'Very Easy' }
  },
];

// Helper functions
export const getQuestionTypeDefinition = (type: SupportedQuestionType): QuestionTypeDefinition | undefined => {
  return QUESTION_TYPE_DEFINITIONS.find(def => def.type === type);
};

export const isValidQuestionType = (type: string): type is SupportedQuestionType => {
  return Object.values(SUPPORTED_QUESTION_TYPES).includes(type as SupportedQuestionType);
};

export const getQuestionTypesByCategory = (category: 'text' | 'choice' | 'scale' | 'data' | 'advanced' | 'layout') => {
  return QUESTION_TYPE_DEFINITIONS.filter(def => def.category === category);
};

// Legacy type mapping for backwards compatibility
export const LEGACY_TYPE_MAPPING: Record<string, SupportedQuestionType> = {
  'text': SUPPORTED_QUESTION_TYPES.TEXT_SHORT,
  'short_text': SUPPORTED_QUESTION_TYPES.TEXT_SHORT,
  'long_text': SUPPORTED_QUESTION_TYPES.TEXT_LONG,
  'text_long': SUPPORTED_QUESTION_TYPES.TEXT_LONG,
  'scale': SUPPORTED_QUESTION_TYPES.SLIDER,
  'likert': SUPPORTED_QUESTION_TYPES.LIKERT_SCALE,
  'likert_scale': SUPPORTED_QUESTION_TYPES.LIKERT_SCALE,
  'phone': SUPPORTED_QUESTION_TYPES.PHONE,
  'bipolar': SUPPORTED_QUESTION_TYPES.BIPOLAR_SCALE,
  'checkbox_group': SUPPORTED_QUESTION_TYPES.CHECKBOX_GROUP,
  'section': SUPPORTED_QUESTION_TYPES.SECTION_HEADER,
  'section_header': SUPPORTED_QUESTION_TYPES.SECTION_HEADER,
  'text_block': SUPPORTED_QUESTION_TYPES.TEXT_BLOCK,
  'divider': SUPPORTED_QUESTION_TYPES.DIVIDER,
  'image_block': SUPPORTED_QUESTION_TYPES.IMAGE_BLOCK,
  'matrix': SUPPORTED_QUESTION_TYPES.MATRIX,
  'ranking': SUPPORTED_QUESTION_TYPES.RANKING,
  'file_upload': SUPPORTED_QUESTION_TYPES.FILE_UPLOAD,
  'image_choice': SUPPORTED_QUESTION_TYPES.IMAGE_CHOICE,
  'yes_no': SUPPORTED_QUESTION_TYPES.YES_NO,
  'instruction': SUPPORTED_QUESTION_TYPES.INSTRUCTION,
  'instruction_block': SUPPORTED_QUESTION_TYPES.INSTRUCTION,
  'constant_sum': SUPPORTED_QUESTION_TYPES.CONSTANT_SUM,
  'signature': SUPPORTED_QUESTION_TYPES.SIGNATURE,
  'address': SUPPORTED_QUESTION_TYPES.ADDRESS,
  'slider_range': SUPPORTED_QUESTION_TYPES.SLIDER_RANGE,
  'range_slider': SUPPORTED_QUESTION_TYPES.SLIDER_RANGE,
  'video_block': SUPPORTED_QUESTION_TYPES.VIDEO_BLOCK,
  'audio_block': SUPPORTED_QUESTION_TYPES.AUDIO_BLOCK,
  'embed_block': SUPPORTED_QUESTION_TYPES.EMBED_BLOCK,
  'card_sort': SUPPORTED_QUESTION_TYPES.CARD_SORT,
  'tree_test': SUPPORTED_QUESTION_TYPES.TREE_TEST,
  'first_click': SUPPORTED_QUESTION_TYPES.FIRST_CLICK,
  'five_second_test': SUPPORTED_QUESTION_TYPES.FIVE_SECOND_TEST,
  'preference_test': SUPPORTED_QUESTION_TYPES.PREFERENCE_TEST,
  'prototype_test': SUPPORTED_QUESTION_TYPES.PROTOTYPE_TEST,
  'max_diff': SUPPORTED_QUESTION_TYPES.MAX_DIFF,
  'maxdiff': SUPPORTED_QUESTION_TYPES.MAX_DIFF,
  'best_worst': SUPPORTED_QUESTION_TYPES.MAX_DIFF,
  'design_survey': SUPPORTED_QUESTION_TYPES.DESIGN_SURVEY,
  'multi_variant': SUPPORTED_QUESTION_TYPES.DESIGN_SURVEY,
  'heatmap': SUPPORTED_QUESTION_TYPES.HEATMAP,
  'conjoint': SUPPORTED_QUESTION_TYPES.CONJOINT,
  'conjoint_analysis': SUPPORTED_QUESTION_TYPES.CONJOINT,
  'choice_based_conjoint': SUPPORTED_QUESTION_TYPES.CONJOINT,
  'kano': SUPPORTED_QUESTION_TYPES.KANO,
  'kano_model': SUPPORTED_QUESTION_TYPES.KANO,
  'sus': SUPPORTED_QUESTION_TYPES.SUS,
  'system_usability_scale': SUPPORTED_QUESTION_TYPES.SUS,
  'csat': SUPPORTED_QUESTION_TYPES.CSAT,
  'customer_satisfaction': SUPPORTED_QUESTION_TYPES.CSAT,
  'ces': SUPPORTED_QUESTION_TYPES.CES,
  'customer_effort': SUPPORTED_QUESTION_TYPES.CES,
};

export const normalizeLegacyQuestionType = (type: string): SupportedQuestionType => {
  if (isValidQuestionType(type)) {
    return type;
  }
  return LEGACY_TYPE_MAPPING[type] || SUPPORTED_QUESTION_TYPES.TEXT_SHORT;
};

// Utility: group questions by sections
export interface QuestionSection {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  questions: any[];
}

export const groupQuestionsBySections = (questions: any[]): QuestionSection[] => {
  const sections: QuestionSection[] = [];
  let currentSection: QuestionSection = {
    id: 'default',
    title: 'Questions',
    questions: [],
  };

  for (const q of questions) {
    const normalizedType = normalizeLegacyQuestionType(q.question_type);
    if (normalizedType === 'section_header') {
      // Save previous section if it has questions
      if (currentSection.questions.length > 0 || sections.length === 0) {
        if (currentSection.questions.length > 0) {
          sections.push(currentSection);
        }
      }
      // Start new section
      currentSection = {
        id: q.id,
        title: q.question_text || 'Section',
        description: q.question_description,
        icon: q.question_config?.section_icon,
        color: q.question_config?.section_color,
        questions: [],
      };
    } else {
      currentSection.questions.push(q);
    }
  }

  // Push last section
  if (currentSection.questions.length > 0) {
    sections.push(currentSection);
  }

  // If no sections were created, return all questions in a default section
  if (sections.length === 0 && questions.length > 0) {
    return [{ id: 'default', title: 'Questions', questions }];
  }

  return sections;
};
