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
  
  // Scale Types
  SLIDER: 'slider',
  RATING: 'rating',
  LIKERT_SCALE: 'likert_scale',
  NPS: 'nps',
  
  // Data Types
  NUMBER: 'number',
  DATE: 'date',
  TIME: 'time',
  EMAIL: 'email',
} as const;

export type SupportedQuestionType = typeof SUPPORTED_QUESTION_TYPES[keyof typeof SUPPORTED_QUESTION_TYPES];

// Question type metadata for builder UI
export interface QuestionTypeDefinition {
  type: SupportedQuestionType;
  label: string;
  description: string;
  icon: string;
  category: 'text' | 'choice' | 'scale' | 'data';
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
  }
];

// Helper functions
export const getQuestionTypeDefinition = (type: SupportedQuestionType): QuestionTypeDefinition | undefined => {
  return QUESTION_TYPE_DEFINITIONS.find(def => def.type === type);
};

export const isValidQuestionType = (type: string): type is SupportedQuestionType => {
  return Object.values(SUPPORTED_QUESTION_TYPES).includes(type as SupportedQuestionType);
};

export const getQuestionTypesByCategory = (category: 'text' | 'choice' | 'scale' | 'data') => {
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
  // Add more mappings as needed for existing data
};

export const normalizeLegacyQuestionType = (type: string): SupportedQuestionType => {
  if (isValidQuestionType(type)) {
    return type;
  }
  return LEGACY_TYPE_MAPPING[type] || SUPPORTED_QUESTION_TYPES.TEXT_SHORT;
};
