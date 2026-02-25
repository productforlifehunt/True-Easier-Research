// Survey Validation Service
// Provides comprehensive validation rules for survey questions and responses

import { useState } from 'react';

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'range' | 'email' | 'url' | 'custom';
  value?: any;
  message: string;
}

export interface QuestionValidation {
  rules: ValidationRule[];
  required: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Built-in validation patterns
const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  url: /^https?:\/\/.+\..+/,
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
  numeric: /^\d+(\.\d+)?$/
};

// Validate a single response against question validation rules
export function validateResponse(
  questionType: string,
  response: any,
  validation: QuestionValidation
): ValidationResult {
  const errors: string[] = [];

  // Check required field
  if (validation.required && isEmpty(response)) {
    errors.push('This field is required');
    return { isValid: false, errors };
  }

  // Skip further validation if field is empty and not required
  if (isEmpty(response)) {
    return { isValid: true, errors: [] };
  }

  // Apply validation rules
  for (const rule of validation.rules) {
    const result = applyValidationRule(questionType, response, rule);
    if (!result.isValid) {
      errors.push(result.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Apply a single validation rule
function applyValidationRule(
  questionType: string,
  response: any,
  rule: ValidationRule
): { isValid: boolean; message: string } {
  switch (rule.type) {
    case 'required':
      return {
        isValid: !isEmpty(response),
        message: rule.message || 'This field is required'
      };

    case 'minLength':
      const minLength = Number(rule.value);
      const responseLength = getResponseLength(response);
      return {
        isValid: responseLength >= minLength,
        message: rule.message || `Minimum ${minLength} characters required`
      };

    case 'maxLength':
      const maxLength = Number(rule.value);
      const responseMaxLength = getResponseLength(response);
      return {
        isValid: responseMaxLength <= maxLength,
        message: rule.message || `Maximum ${maxLength} characters allowed`
      };

    case 'pattern':
      const pattern = new RegExp(rule.value);
      return {
        isValid: pattern.test(String(response)),
        message: rule.message || 'Invalid format'
      };

    case 'range':
      const [min, max] = rule.value;
      const numValue = Number(response);
      return {
        isValid: !isNaN(numValue) && numValue >= min && numValue <= max,
        message: rule.message || `Value must be between ${min} and ${max}`
      };

    case 'email':
      return {
        isValid: VALIDATION_PATTERNS.email.test(String(response)),
        message: rule.message || 'Please enter a valid email address'
      };

    case 'url':
      return {
        isValid: VALIDATION_PATTERNS.url.test(String(response)),
        message: rule.message || 'Please enter a valid URL'
      };

    case 'custom':
      // Custom validation function
      if (typeof rule.value === 'function') {
        return rule.value(response) ? 
          { isValid: true, message: '' } :
          { isValid: false, message: rule.message };
      }
      return { isValid: true, message: '' };

    default:
      return { isValid: true, message: '' };
  }
}

// Helper functions
function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

function getResponseLength(response: any): number {
  if (typeof response === 'string') return response.length;
  if (Array.isArray(response)) return response.length;
  return String(response).length;
}

// Question type specific validation
export function getDefaultValidationRules(questionType: string): QuestionValidation {
  const baseValidation: QuestionValidation = {
    rules: [],
    required: false
  };

  switch (questionType) {
    case 'email':
      return {
        ...baseValidation,
        rules: [
          {
            type: 'email',
            message: 'Please enter a valid email address'
          }
        ]
      };

    case 'number':
      return {
        ...baseValidation,
        rules: [
          {
            type: 'pattern',
            value: VALIDATION_PATTERNS.numeric,
            message: 'Please enter a valid number'
          }
        ]
      };

    case 'text_short':
      return {
        ...baseValidation,
        rules: [
          {
            type: 'maxLength',
            value: 100,
            message: 'Maximum 100 characters allowed'
          }
        ]
      };

    case 'text_long':
      return {
        ...baseValidation,
        rules: [
          {
            type: 'maxLength',
            value: 2000,
            message: 'Maximum 2000 characters allowed'
          }
        ]
      };

    case 'single_choice':
    case 'multiple_choice':
      return {
        ...baseValidation,
        rules: [
          {
            type: 'custom',
            value: (response: any) => {
              if (Array.isArray(response)) {
                return response.length > 0;
              }
              return response !== null && response !== undefined && response !== '';
            },
            message: 'Please select at least one option'
          }
        ]
      };

    case 'rating':
    case 'slider':
      return {
        ...baseValidation,
        rules: [
          {
            type: 'custom',
            value: (response: any) => {
              const num = Number(response);
              return !isNaN(num) && num >= 0;
            },
            message: 'Please provide a rating'
          }
        ]
      };

    case 'date':
      return {
        ...baseValidation,
        rules: [
          {
            type: 'custom',
            value: (response: any) => {
              const date = new Date(response);
              return !isNaN(date.getTime());
            },
            message: 'Please enter a valid date'
          }
        ]
      };

    default:
      return baseValidation;
  }
}

// Validate entire survey response
export function validateSurveyResponse(
  questions: any[],
  responses: Record<string, any>
): { isValid: boolean; errors: Record<string, string[]>; summary: string } {
  const errors: Record<string, string[]> = {};
  let totalErrors = 0;

  for (const question of questions) {
    const response = responses[question.id];
    const validation = getQuestionValidation(question);
    const result = validateResponse(question.question_type, response, validation);

    if (!result.isValid) {
      errors[question.id] = result.errors;
      totalErrors += result.errors.length;
    }
  }

  const isValid = totalErrors === 0;
  const summary = isValid ? 
    'All responses are valid' : 
    `${totalErrors} validation error${totalErrors === 1 ? '' : 's'} found`;

  return {
    isValid,
    errors,
    summary
  };
}

// Get validation rules for a question (from DB or defaults)
function getQuestionValidation(question: any): QuestionValidation {
  // Check if question has custom validation rules
  if (question.validation_rule && Object.keys(question.validation_rule).length > 0) {
    return parseValidationRules(question.validation_rule, question.required || false);
  }

  // Use default validation for question type
  const defaultValidation = getDefaultValidationRules(question.question_type);
  defaultValidation.required = question.required || false;
  
  return defaultValidation;
}

// Parse validation rules from database format
function parseValidationRules(validationRule: any, required: boolean): QuestionValidation {
  const rules: ValidationRule[] = [];

  if (validationRule.minLength) {
    rules.push({
      type: 'minLength',
      value: validationRule.minLength,
      message: validationRule.minLengthMessage || `Minimum ${validationRule.minLength} characters required`
    });
  }

  if (validationRule.maxLength) {
    rules.push({
      type: 'maxLength',
      value: validationRule.maxLength,
      message: validationRule.maxLengthMessage || `Maximum ${validationRule.maxLength} characters allowed`
    });
  }

  if (validationRule.pattern) {
    rules.push({
      type: 'pattern',
      value: validationRule.pattern,
      message: validationRule.patternMessage || 'Invalid format'
    });
  }

  if (validationRule.min !== undefined && validationRule.max !== undefined) {
    rules.push({
      type: 'range',
      value: [validationRule.min, validationRule.max],
      message: validationRule.rangeMessage || `Value must be between ${validationRule.min} and ${validationRule.max}`
    });
  }

  return {
    rules,
    required
  };
}

// Real-time validation hook for forms
export function useFormValidation(questions: any[]) {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  
  const validateField = (questionId: string, value: any) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const validation = getQuestionValidation(question);
    const result = validateResponse(question.question_type, value, validation);

    setErrors(prev => ({
      ...prev,
      [questionId]: result.isValid ? [] : result.errors
    }));

    return result;
  };

  const validateAll = (responses: Record<string, any>) => {
    const result = validateSurveyResponse(questions, responses);
    setErrors(result.errors);
    return result;
  };

  const clearErrors = (questionId?: string) => {
    if (questionId) {
      setErrors(prev => ({ ...prev, [questionId]: [] }));
    } else {
      setErrors({});
    }
  };

  return {
    errors,
    validateField,
    validateAll,
    clearErrors,
    hasErrors: Object.values(errors).some(errs => errs.length > 0)
  };
}
