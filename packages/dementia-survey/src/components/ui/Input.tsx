import React, { forwardRef } from 'react'
import { BaseComponentProps } from '../../types'

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  placeholder?: string
  value?: string
  defaultValue?: string
  disabled?: boolean
  required?: boolean
  readOnly?: boolean
  autoFocus?: boolean
  autoComplete?: string
  size?: 'small' | 'medium' | 'large'
  variant?: 'default' | 'filled' | 'outline'
  error?: string
  helperText?: string
  label?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = 'text',
  placeholder,
  value,
  defaultValue,
  disabled = false,
  required = false,
  readOnly = false,
  autoFocus = false,
  autoComplete,
  size = 'medium',
  variant = 'default',
  error,
  helperText,
  label,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  className = '',
  style,
  ...props
}, ref) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: icon ? (iconPosition === 'left' ? '8px 12px 8px 36px' : '8px 36px 8px 12px') : '8px 12px',
          fontSize: '14px',
          borderRadius: '8px',
          minHeight: '36px'
        }
      case 'medium':
        return {
          padding: icon ? (iconPosition === 'left' ? '12px 16px 12px 44px' : '12px 44px 12px 16px') : '12px 16px',
          fontSize: '16px',
          borderRadius: '12px',
          minHeight: '48px'
        }
      case 'large':
        return {
          padding: icon ? (iconPosition === 'left' ? '16px 20px 16px 52px' : '16px 52px 16px 20px') : '16px 20px',
          fontSize: '18px',
          borderRadius: '16px',
          minHeight: '56px'
        }
      default:
        return {}
    }
  }

  const getVariantStyles = () => {
    const baseStyles = {
      border: '1px solid var(--border-light)',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)'
    }

    if (error) {
      return {
        ...baseStyles,
        borderColor: 'var(--error)',
        boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)'
      }
    }

    switch (variant) {
      case 'filled':
        return {
          ...baseStyles,
          backgroundColor: 'var(--bg-secondary)'
        }
      case 'outline':
        return {
          ...baseStyles,
          backgroundColor: 'transparent'
        }
      default:
        return baseStyles
    }
  }

  const inputStyles = {
    ...getSizeStyles(),
    ...getVariantStyles(),
    width: fullWidth ? '100%' : 'auto',
    fontWeight: '400',
    outline: 'none',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
    ...style
  }

  const containerStyles = {
    position: 'relative' as const,
    display: 'inline-block',
    width: fullWidth ? '100%' : 'auto'
  }

  const iconStyles = {
    position: 'absolute' as const,
    top: '50%',
    transform: 'translateY(-50%)',
    [iconPosition === 'left' ? 'left' : 'right']: size === 'small' ? '12px' : size === 'medium' ? '16px' : '20px',
    color: 'var(--text-muted)',
    pointerEvents: 'none' as const,
    zIndex: 1
  }

  return (
    <div className={className}>
      {label && (
        <label 
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          {label}
          {required && <span style={{ color: 'var(--error)' }}> *</span>}
        </label>
      )}
      
      <div style={containerStyles}>
        {icon && (
          <div style={iconStyles}>
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          style={inputStyles}
          className="focus:border-primary focus:ring-2 focus:ring-primary/20"
          {...props}
        />
      </div>
      
      {(error || helperText) && (
        <div className="mt-1">
          {error && (
            <p 
              className="text-xs flex items-center gap-1"
              style={{ color: 'var(--error)' }}
            >
              <svg className="flex-shrink-0" style={{ width: 'clamp(0.75rem, 2vw, 1rem)', height: 'clamp(0.75rem, 2vw, 1rem)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {error}
            </p>
          )}
          {!error && helperText && (
            <p 
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
