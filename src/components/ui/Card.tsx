import React from 'react'
import { BaseComponentProps } from '../../types'

export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled'
  padding?: 'none' | 'small' | 'medium' | 'large'
  radius?: 'none' | 'small' | 'medium' | 'large'
  hoverable?: boolean
  clickable?: boolean
  onClick?: () => void
  header?: React.ReactNode
  footer?: React.ReactNode
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  radius = 'medium',
  hoverable = false,
  clickable = false,
  onClick,
  header,
  footer,
  className = '',
  style,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-large)'
        }
      case 'outlined':
        return {
          backgroundColor: 'var(--bg-primary)',
          border: '2px solid var(--border-light)',
          boxShadow: 'none'
        }
      case 'filled':
        return {
          backgroundColor: 'var(--bg-secondary)',
          border: 'none',
          boxShadow: 'none'
        }
      default:
        return {
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-card)'
        }
    }
  }

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return { padding: '0' }
      case 'small':
        return { padding: '12px' }
      case 'medium':
        return { padding: '24px' }
      case 'large':
        return { padding: '32px' }
      default:
        return {}
    }
  }

  const getRadiusStyles = () => {
    switch (radius) {
      case 'none':
        return { borderRadius: '0' }
      case 'small':
        return { borderRadius: '8px' }
      case 'medium':
        return { borderRadius: '16px' }
      case 'large':
        return { borderRadius: '24px' }
      default:
        return {}
    }
  }

  const cardStyles = {
    ...getVariantStyles(),
    ...getPaddingStyles(),
    ...getRadiusStyles(),
    transition: 'all 0.2s ease',
    cursor: clickable ? 'pointer' : 'default',
    ...style
  }

  const hoverClass = hoverable || clickable ? 'hover:shadow-lg hover:-translate-y-1' : ''
  const focusClass = clickable ? 'focus:outline-none focus:ring-2 focus:ring-primary/20' : ''

  const handleClick = () => {
    if (clickable && onClick) {
      onClick()
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (clickable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      onClick?.()
    }
  }

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={clickable ? 0 : undefined}
      role={clickable ? 'button' : undefined}
      className={`${className} ${hoverClass} ${focusClass}`}
      style={cardStyles}
      {...props}
    >
      {header && (
        <div 
          className="card-header"
          style={{
            marginBottom: padding !== 'none' ? '16px' : '0',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border-light)'
          }}
        >
          {header}
        </div>
      )}
      
      <div className="card-content">
        {children}
      </div>
      
      {footer && (
        <div 
          className="card-footer"
          style={{
            marginTop: padding !== 'none' ? '16px' : '0',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-light)'
          }}
        >
          {footer}
        </div>
      )}
    </div>
  )
}

export default Card
