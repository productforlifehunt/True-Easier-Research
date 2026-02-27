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

  // Layout Types
  SECTION_HEADER: 'section_header',
} as const;

export type SupportedQuestionType = typeof SUPPORTED_QUESTION_TYPES[keyof typeof SUPPORTED_QUESTION_TYPES];

// Question type metadata for builder UI
export interface QuestionTypeDefinition {
  type: SupportedQuestionType;
  label: string;
  description: string;
  icon: string;
  category: 'text' | 'choice' | 'scale' | 'data' | 'layout';
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
    icon: '¶',
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
    icon: '◉',
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
    icon: '☐',
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
    icon: '▼',
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
    icon: '☑',
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
    icon: '○━',
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
    icon: '⊖⊕',
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
    icon: '★',
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
    icon: '━',
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
    icon: '📊',
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
    icon: '📅',
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
    icon: '🕐',
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
    icon: '📧',
    category: 'data',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: {}
  },

  // Layout Types
  {
    type: SUPPORTED_QUESTION_TYPES.SECTION_HEADER,
    label: 'Section / Tab',
    description: 'Group questions into tabs or sections. All questions until the next section header belong to this section.',
    icon: '§',
    category: 'layout',
    requiresOptions: false,
    supportsOther: false,
    supportsNone: false,
    defaultConfig: { section_icon: '', section_color: '#10b981' }
  },
];

// Helper functions
export const getQuestionTypeDefinition = (type: SupportedQuestionType): QuestionTypeDefinition | undefined => {
  return QUESTION_TYPE_DEFINITIONS.find(def => def.type === type);
};

export const isValidQuestionType = (type: string): type is SupportedQuestionType => {
  return Object.values(SUPPORTED_QUESTION_TYPES).includes(type as SupportedQuestionType);
};

export const getQuestionTypesByCategory = (category: 'text' | 'choice' | 'scale' | 'data' | 'layout') => {
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
  'phone': SUPPORTED_QUESTION_TYPES.TEXT_SHORT,
  'bipolar': SUPPORTED_QUESTION_TYPES.BIPOLAR_SCALE,
  'checkbox_group': SUPPORTED_QUESTION_TYPES.CHECKBOX_GROUP,
  'section': SUPPORTED_QUESTION_TYPES.SECTION_HEADER,
  'section_header': SUPPORTED_QUESTION_TYPES.SECTION_HEADER,
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
