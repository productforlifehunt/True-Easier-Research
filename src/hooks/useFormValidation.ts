import { useState, useCallback, useMemo } from 'react'
import { FormState, FormField, ValidationRules, ValidationRule } from '../types'

export interface UseFormValidationOptions {
  initialValues: Record<string, string>
  validationRules: ValidationRules
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

export interface UseFormValidationReturn {
  values: Record<string, string>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isValid: boolean
  isSubmitting: boolean
  formState: FormState
  setValue: (field: string, value: string) => void
  setError: (field: string, error: string) => void
  setTouched: (field: string, touched: boolean) => void
  validateField: (field: string) => boolean
  validateForm: () => boolean
  handleChange: (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  handleBlur: (field: string) => (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  handleSubmit: (onSubmit: (values: Record<string, string>) => Promise<void> | void) => (event: React.FormEvent) => Promise<void>
  reset: () => void
  setSubmitting: (submitting: boolean) => void
}

export const useFormValidation = ({
  initialValues,
  validationRules,
  validateOnChange = false,
  validateOnBlur = true
}: UseFormValidationOptions): UseFormValidationReturn => {
  const [values, setValues] = useState<Record<string, string>>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouchedState] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validate a single field
  const validateField = useCallback((field: string): boolean => {
    const value = values[field]
    const rules = validationRules[field]
    
    if (!rules) return true

    // Required validation
    if (rules.required && (!value || value.trim() === '')) {
      setErrors(prev => ({ ...prev, [field]: `${field} is required` }))
      return false
    }

    // Skip other validations if field is empty and not required
    if (!value || value.trim() === '') {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
      return true
    }

    // Min length validation
    if (rules.minLength && value.length < rules.minLength) {
      setErrors(prev => ({ 
        ...prev, 
        [field]: `${field} must be at least ${rules.minLength} characters` 
      }))
      return false
    }

    // Max length validation
    if (rules.maxLength && value.length > rules.maxLength) {
      setErrors(prev => ({ 
        ...prev, 
        [field]: `${field} must be no more than ${rules.maxLength} characters` 
      }))
      return false
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      setErrors(prev => ({ 
        ...prev, 
        [field]: `${field} format is invalid` 
      }))
      return false
    }

    // Custom validation
    if (rules.custom) {
      const customResult = rules.custom(value)
      if (typeof customResult === 'string') {
        setErrors(prev => ({ ...prev, [field]: customResult }))
        return false
      }
      if (customResult === false) {
        setErrors(prev => ({ ...prev, [field]: `${field} is invalid` }))
        return false
      }
    }

    // Clear error if validation passes
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
    return true
  }, [values, validationRules])

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const fieldNames = Object.keys(validationRules)
    let isFormValid = true

    fieldNames.forEach(field => {
      const isFieldValid = validateField(field)
      if (!isFieldValid) {
        isFormValid = false
      }
    })

    return isFormValid
  }, [validateField, validationRules])

  // Set field value
  const setValue = useCallback((field: string, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }))
    
    if (validateOnChange) {
      // Delay validation slightly to allow state to update
      setTimeout(() => validateField(field), 0)
    }
  }, [validateOnChange, validateField])

  // Set field error
  const setError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }))
  }, [])

  // Set field touched state
  const setTouched = useCallback((field: string, touched: boolean) => {
    setTouchedState(prev => ({ ...prev, [field]: touched }))
  }, [])

  // Handle input change
  const handleChange = useCallback((field: string) => {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValue(field, event.target.value)
    }
  }, [setValue])

  // Handle input blur
  const handleBlur = useCallback((field: string) => {
    return (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setTouched(field, true)
      
      if (validateOnBlur) {
        validateField(field)
      }
    }
  }, [validateOnBlur, validateField, setTouched])

  // Handle form submission
  const handleSubmit = useCallback((onSubmit: (values: Record<string, string>) => Promise<void> | void) => {
    return async (event: React.FormEvent) => {
      event.preventDefault()
      
      setIsSubmitting(true)
      
      // Mark all fields as touched
      const fieldNames = Object.keys(validationRules)
      const touchedState: Record<string, boolean> = {}
      fieldNames.forEach(field => {
        touchedState[field] = true
      })
      setTouchedState(touchedState)

      // Validate form
      const isFormValid = validateForm()
      
      if (isFormValid) {
        try {
          await onSubmit(values)
        } catch (error) {
          console.error('Form submission error:', error)
        }
      }
      
      setIsSubmitting(false)
    }
  }, [values, validationRules, validateForm])

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouchedState({})
    setIsSubmitting(false)
  }, [initialValues])

  // Set submitting state
  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting)
  }, [])

  // Compute form state
  const formState = useMemo((): FormState => {
    const state: FormState = {}
    
    Object.keys(values).forEach(field => {
      state[field] = {
        value: values[field] || '',
        error: errors[field],
        isValid: !errors[field],
        isTouched: touched[field] || false
      }
    })
    
    return state
  }, [values, errors, touched])

  // Compute overall form validity
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0 && Object.keys(validationRules).length > 0
  }, [errors, validationRules])

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    formState,
    setValue,
    setError,
    setTouched,
    validateField,
    validateForm,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setSubmitting
  }
}

export default useFormValidation
