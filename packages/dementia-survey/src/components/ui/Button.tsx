import React from 'react'
import { BaseComponentProps } from '../../types'

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  type?: 'button' | 'submit' | 'reset'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  icon,
  iconPosition = 'left',
  className = '',
  style,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--primary)',
          color: 'var(--bg-primary)',
          border: 'none'
        }
      case 'secondary':
        return {
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-light)'
        }
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--primary)',
          border: '1px solid var(--primary)'
        }
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          border: 'none'
        }
      case 'danger':
        return {
          backgroundColor: 'var(--error)',
          color: 'white',
          border: 'none'
        }
      default:
        return {}
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: '8px 16px',
          fontSize: '14px',
          borderRadius: '8px'
        }
      case 'medium':
        return {
          padding: '12px 24px',
          fontSize: '16px',
          borderRadius: '12px'
        }
      case 'large':
        return {
          padding: '16px 32px',
          fontSize: '18px',
          borderRadius: '16px'
        }
      default:
        return {}
    }
  }

  const buttonStyles = {
    ...getVariantStyles(),
    ...getSizeStyles(),
    fontWeight: '500',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: fullWidth ? '100%' : 'auto',
    outline: 'none',
    ...style
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return
    onClick?.(event)
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`${className} hover:opacity-90 focus:ring-2 focus:ring-primary/20`}
      style={buttonStyles}
      {...props}
    >
      {loading && (
        <div 
          className="border-2 border-current border-t-transparent rounded-full animate-spin"
          style={{ 
            width: 'clamp(1rem, 2.5vw, 1.25rem)',
            height: 'clamp(1rem, 2.5vw, 1.25rem)',
            marginRight: children ? '8px' : '0' 
          }}
        />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="flex items-center">{icon}</span>
      )}
      
      {children && <span>{children}</span>}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="flex items-center">{icon}</span>
      )}
    </button>
  )
}

export default Button
