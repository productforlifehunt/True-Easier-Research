import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { errorHandler } from '../lib/errorHandler'
import { ErrorBoundaryState, AppError } from '../types'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showErrorDetails?: boolean
  enableRetry?: boolean
  enableReporting?: boolean
}

interface State extends ErrorBoundaryState {
  retryCount: number
  isRetrying: boolean
  maxRetries: number
  isResolved?: boolean
}

class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: ReturnType<typeof setTimeout> | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      retryCount: 0,
      isRetrying: false,
      maxRetries: 3
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Use our comprehensive error handler
    const errorDetails = errorHandler.handleError(error, 'React Error Boundary')

    console.group('🚨 React Error Boundary Caught Error')
    console.error('Error:', error)
    console.error('Error Info:', errorInfo)
    console.error('Component Stack:', errorInfo.componentStack)
    console.error('Error Details:', errorDetails)
    console.groupEnd()

    this.setState({
      error,
      errorInfo
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // Automatic retry mechanism
    if (this.state.retryCount < this.state.maxRetries) {
      console.log(`🔄 Auto-retry attempt ${this.state.retryCount + 1}/${this.state.maxRetries}`)
      this.retryTimeoutId = setTimeout(() => {
        this.setState({
          hasError: false,
          error: undefined,
          errorInfo: undefined,
          retryCount: this.state.retryCount + 1,
          isRetrying: false
        })
      }, 2000)
    }

    // In production, this would send to error monitoring service
    if (process.env.NODE_ENV === 'production' && this.props.enableReporting !== false) {
      // Example: Send to error monitoring service with enhanced details
      // errorReportingService.captureException(error, {
      //   extra: { ...errorInfo, errorDetails },
      //   tags: { component: 'ErrorBoundary', severity: errorDetails.severity }
      // })
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  handleRetry = () => {
    if (this.state.retryCount >= 3) {
      return // Max retries reached
    }

    this.setState({
      isRetrying: true,
      retryCount: this.state.retryCount + 1
    })

    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        isRetrying: false
      })
    }, 1000)
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleReportError = () => {
    const { error, errorInfo } = this.state
    const errorReport = {
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href
    }

    // Copy error report to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => alert('Error report copied to clipboard'))
      .catch(() => console.error('Failed to copy error report'))
  }



  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="text-center max-w-lg mx-auto px-6">
            <div className="mb-8">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--error)' }} />
              <h1 className="text-3xl font-bold mb-4 macos-title" style={{ color: 'var(--text-primary)' }}>
                Something went wrong
              </h1>
              <p className="text-lg mb-6 macos-body" style={{ color: 'var(--text-secondary)' }}>
                We're sorry, but something unexpected happened.
                {this.state.retryCount > 0 && (
                  <span className="block mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    Retry attempt {this.state.retryCount}/{this.state.maxRetries}
                  </span>
                )}
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={this.handleRetry}
                disabled={this.state.retryCount >= this.state.maxRetries || this.state.isRetrying}
                className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  this.state.retryCount >= this.state.maxRetries || this.state.isRetrying
                    ? 'opacity-50 cursor-not-allowed bg-white border'
                    : 'bg-logo-green text-white hover:bg-green-700'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${this.state.isRetrying ? 'animate-spin' : ''}`} />
                {this.state.isRetrying ? 'Retrying...' :
                 this.state.retryCount >= this.state.maxRetries ? 'Max Retries Reached' : 'Try Again'}
              </button>
              <a
                href="/dashboard"
                className={`w-full py-3 px-6 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
                  this.state.isResolved ? 'bg-white cursor-not-allowed border' : 'bg-white hover:bg-green-50 border'
                }`}
                style={{borderColor: 'var(--border-light)'}}
              >
                <Home className="w-4 h-4" />
                Go Home
              </a>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Error Details (Development Only)
                </summary>
                <div className="bg-white p-4 rounded-lg text-xs font-mono overflow-auto max-h-40 border" style={{borderColor: 'var(--border-light)'}}>
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  <div className="mb-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
