/**
 * Comprehensive form validation utilities
 */

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
  email?: boolean
  phone?: boolean
  url?: boolean
  numeric?: boolean
  min?: number
  max?: number
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  // Allow various phone formats
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
  return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return url.startsWith('http://') || url.startsWith('https://')
  } catch {
    return false
  }
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long')
  } else {
    score += 1
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter')
  } else {
    score += 1
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter')
  } else {
    score += 1
  }

  if (!/\d/.test(password)) {
    feedback.push('Password must contain at least one number')
  } else {
    score += 1
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Password must contain at least one special character')
  } else {
    score += 1
  }

  return {
    isValid: score >= 4,
    score,
    feedback
  }
}

/**
 * Validate a single field
 */
export function validateField(value: any, rules: ValidationRule): string | null {
  // Required validation
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return 'This field is required'
  }

  // Skip other validations if field is empty and not required
  if (!value || (typeof value === 'string' && !value.trim())) {
    return null
  }

  const stringValue = String(value).trim()

  // Length validations
  if (rules.minLength && stringValue.length < rules.minLength) {
    return `Must be at least ${rules.minLength} characters long`
  }

  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return `Must be no more than ${rules.maxLength} characters long`
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return 'Invalid format'
  }

  // Email validation
  if (rules.email && !isValidEmail(stringValue)) {
    return 'Please enter a valid email address'
  }

  // Phone validation
  if (rules.phone && !isValidPhone(stringValue)) {
    return 'Please enter a valid phone number'
  }

  // URL validation
  if (rules.url && !isValidUrl(stringValue)) {
    return 'Please enter a valid URL'
  }

  // Numeric validation
  if (rules.numeric) {
    const numValue = Number(value)
    if (isNaN(numValue)) {
      return 'Must be a valid number'
    }

    if (rules.min !== undefined && numValue < rules.min) {
      return `Must be at least ${rules.min}`
    }

    if (rules.max !== undefined && numValue > rules.max) {
      return `Must be no more than ${rules.max}`
    }
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value)
  }

  return null
}

/**
 * Validate an entire form
 */
export function validateForm<T extends Record<string, any>>(
  data: T,
  rules: Partial<Record<keyof T, ValidationRule>>
): ValidationResult {
  const errors: Record<string, string> = {}

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field as keyof T]
    const error = validateField(value, fieldRules as ValidationRule)
    
    if (error) {
      errors[field] = error
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Common validation rule sets
 */
export const commonRules = {
  email: {
    required: true,
    email: true,
    maxLength: 254
  },
  password: {
    required: true,
    minLength: 8,
    maxLength: 128,
    custom: (value: string) => {
      const result = validatePasswordStrength(value)
      return result.isValid ? null : result.feedback[0]
    }
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s\-']+$/
  },
  phone: {
    required: true,
    phone: true
  },
  url: {
    url: true,
    maxLength: 2048
  },
  message: {
    required: true,
    minLength: 10,
    maxLength: 1000
  },
  search: {
    minLength: 2,
    maxLength: 100
  },
  age: {
    numeric: true,
    min: 0,
    max: 150
  },
  hourlyRate: {
    numeric: true,
    min: 0,
    max: 1000
  }
}

/**
 * Real-time validation hook for React components
 */
export function useFormValidation<T extends Record<string, any>>(
  initialData: T,
  rules: Partial<Record<keyof T, ValidationRule>>
) {
  const [data, setData] = React.useState<T>(initialData)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [touched, setTouched] = React.useState<Record<string, boolean>>({})

  const validateSingleField = React.useCallback((field: keyof T, value: any) => {
    const rule = rules[field]
    if (!rule) return null

    return validateField(value, rule)
  }, [rules])

  const handleChange = React.useCallback((field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))

    // Validate field if it has been touched
    if (touched[field as string]) {
      const error = validateSingleField(field, value)
      setErrors(prev => ({
        ...prev,
        [field]: error || ''
      }))
    }
  }, [touched, validateSingleField])

  const handleBlur = React.useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    
    const error = validateSingleField(field, data[field])
    setErrors(prev => ({
      ...prev,
      [field]: error || ''
    }))
  }, [data, validateSingleField])

  const validateAll = React.useCallback(() => {
    const result = validateForm(data, rules)
    setErrors(result.errors)
    
    // Mark all fields as touched
    const allTouched = Object.keys(rules).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {} as Record<string, boolean>)
    setTouched(allTouched)

    return result
  }, [data, rules])

  const reset = React.useCallback(() => {
    setData(initialData)
    setErrors({})
    setTouched({})
  }, [initialData])

  return {
    data,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0
  }
}

// Import React for the hook
import React from 'react'
