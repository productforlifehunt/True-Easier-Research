import React from 'react'
import { ErrorInfo, LoadingState } from '../lib/errorHandler'

interface ErrorDisplayProps {
  error: ErrorInfo
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
  showDetails?: boolean
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  className = '',
  showDetails = false
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'var(--error)'
      case 'high':
        return 'var(--warning)'
      case 'medium':
        return 'var(--info)'
      case 'low':
        return 'var(--success)'
      default:
        return 'var(--text-secondary)'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '🚨'
      case 'high':
        return '⚠️'
      case 'medium':
        return 'ℹ️'
      case 'low':
        return '💡'
      default:
        return '❓'
    }
  }

  return (
    <div 
      className={`rounded-xl p-6 border ${className}`}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: getSeverityColor(error.severity),
        borderWidth: '2px'
      }}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start space-x-4">
        <div 
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${getSeverityColor(error.severity)}20` }}
        >
          {getSeverityIcon(error.severity)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            {error.category === 'network' ? 'Connection Issue' :
             error.category === 'database' ? 'Data Loading Issue' :
             error.category === 'auth' ? 'Authentication Required' :
             error.category === 'validation' ? 'Input Error' :
             'System Error'}
          </h3>
          
          <p 
            className="text-base mb-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            {error.userMessage}
          </p>

          {showDetails && (
            <details className="mb-4">
              <summary 
                className="cursor-pointer text-sm font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                Technical Details
              </summary>
              <div 
                className="mt-2 p-3 rounded-lg text-sm font-mono"
                style={{ 
                  backgroundColor: 'var(--bg-accent)',
                  color: 'var(--text-muted)'
                }}
              >
                <div>Code: {error.code}</div>
                <div>Category: {error.category}</div>
                <div>Severity: {error.severity}</div>
                <div>Retryable: {error.retryable ? 'Yes' : 'No'}</div>
              </div>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {error.retryable && onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--bg-primary)',
                  border: 'none'
                }}
              >
                Try Again
              </button>
            )}
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-light)'
                }}
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface LoadingDisplayProps {
  loading: LoadingState
  className?: string
  size?: 'small' | 'medium' | 'large'
  showMessage?: boolean
}

export const LoadingDisplay: React.FC<LoadingDisplayProps> = ({
  loading,
  className = '',
  size = 'medium',
  showMessage = true
}) => {
  if (!loading.isLoading) return null

  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  }

  return (
    <div 
      className={`flex flex-col items-center justify-center p-6 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="relative">
        <div 
          className={`${sizeClasses[size]} border-4 rounded-full animate-spin border-t-transparent`}
          style={{ borderColor: 'var(--primary)' }}
        />
        {loading.progress !== undefined && (
          <div 
            className="absolute inset-0 flex items-center justify-center text-xs font-bold"
            style={{ color: 'var(--primary)' }}
          >
            {Math.round(loading.progress)}%
          </div>
        )}
      </div>
      
      {showMessage && loading.loadingMessage && (
        <p 
          className={`mt-4 ${textSizeClasses[size]} text-center`}
          style={{ color: 'var(--text-secondary)' }}
        >
          {loading.loadingMessage}
        </p>
      )}
    </div>
  )
}

interface EmptyStateProps {
  title: string
  description: string
  icon?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = '📭',
  action,
  className = ''
}) => {
  return (
    <div 
      className={`text-center py-12 px-6 ${className}`}
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <div 
        className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl"
        style={{ backgroundColor: 'var(--bg-accent)' }}
      >
        {icon}
      </div>
      
      <h3 
        className="text-xl font-semibold mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </h3>
      
      <p 
        className="text-base mb-6 max-w-md mx-auto"
        style={{ color: 'var(--text-secondary)' }}
      >
        {description}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--bg-primary)',
            border: 'none'
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

interface NetworkStatusProps {
  isOnline: boolean
  connectionQuality: 'good' | 'poor' | 'offline'
  className?: string
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  isOnline,
  connectionQuality,
  className = ''
}) => {
  if (connectionQuality === 'good') return null

  const getStatusColor = () => {
    switch (connectionQuality) {
      case 'offline':
        return 'var(--error)'
      case 'poor':
        return 'var(--warning)'
      default:
        return 'var(--success)'
    }
  }

  const getStatusMessage = () => {
    switch (connectionQuality) {
      case 'offline':
        return 'You are currently offline. Some features may not be available.'
      case 'poor':
        return 'Your connection is slow. Some features may take longer to load.'
      default:
        return 'Connection restored.'
    }
  }

  const getStatusIcon = () => {
    switch (connectionQuality) {
      case 'offline':
        return '📡'
      case 'poor':
        return '⚡'
      default:
        return '✅'
    }
  }

  return (
    <div 
      className={`fixed top-4 right-4 z-50 p-3 rounded-xl shadow-lg max-w-sm ${className}`}
      style={{
        backgroundColor: 'var(--bg-primary)',
        border: `2px solid ${getStatusColor()}`,
        color: 'var(--text-primary)'
      }}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center space-x-3">
        <span className="text-lg">{getStatusIcon()}</span>
        <p className="text-sm font-medium">{getStatusMessage()}</p>
      </div>
    </div>
  )
}

interface RetryButtonProps {
  onRetry: () => void
  isRetrying?: boolean
  retryCount?: number
  maxAttempts?: number
  disabled?: boolean
  className?: string
}

export const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  isRetrying = false,
  retryCount = 0,
  maxAttempts = 3,
  disabled = false,
  className = ''
}) => {
  const canRetry = retryCount < maxAttempts && !disabled

  return (
    <button
      onClick={onRetry}
      disabled={!canRetry || isRetrying}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        backgroundColor: canRetry ? 'var(--primary)' : 'var(--bg-muted)',
        color: canRetry ? 'var(--bg-primary)' : 'var(--text-muted)',
        border: 'none'
      }}
    >
      {isRetrying ? (
        <span className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Retrying...</span>
        </span>
      ) : (
        `Try Again ${retryCount > 0 ? `(${retryCount}/${maxAttempts})` : ''}`
      )}
    </button>
  )
}
