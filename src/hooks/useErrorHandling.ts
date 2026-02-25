import { useState, useCallback, useEffect } from 'react'
import { errorHandler, ErrorInfo, LoadingState, RetryConfig } from '../lib/errorHandler'

// Hook for managing async operations with consistent error handling
export const useAsyncOperation = <T>() => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false })
  const [error, setError] = useState<ErrorInfo | null>(null)

  const execute = useCallback(async (
    operation: () => Promise<T>,
    context?: string,
    retryConfig?: Partial<RetryConfig>
  ) => {
    setLoading({ isLoading: true, loadingMessage: `Loading ${context || 'data'}...` })
    setError(null)

    try {
      const result = await errorHandler.withRetry(operation, retryConfig)
      setData(result)
      setLoading({ isLoading: false })
      return result
    } catch (err) {
      const errorInfo = errorHandler.handleError(err, context)
      setError(errorInfo)
      setLoading({ isLoading: false })
      throw err
    }
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading({ isLoading: false })
  }, [])

  const retry = useCallback(async (
    operation: () => Promise<T>,
    context?: string,
    retryConfig?: Partial<RetryConfig>
  ) => {
    if (error?.retryable) {
      return execute(operation, context, retryConfig)
    }
  }, [error, execute])

  return {
    data,
    loading,
    error,
    execute,
    reset,
    retry,
    isLoading: loading.isLoading,
    hasError: !!error,
    isRetryable: error?.retryable || false
  }
}

// Hook for managing multiple async operations
export const useMultipleAsyncOperations = () => {
  const [operations, setOperations] = useState<Map<string, {
    data: any
    loading: LoadingState
    error: ErrorInfo | null
  }>>(new Map())

  const executeOperation = useCallback(async <T>(
    key: string,
    operation: () => Promise<T>,
    context?: string,
    retryConfig?: Partial<RetryConfig>
  ) => {
    setOperations(prev => new Map(prev.set(key, {
      data: prev.get(key)?.data || null,
      loading: { isLoading: true, loadingMessage: `Loading ${context || key}...` },
      error: null
    })))

    try {
      const result = await errorHandler.withRetry(operation, retryConfig)
      setOperations(prev => new Map(prev.set(key, {
        data: result,
        loading: { isLoading: false },
        error: null
      })))
      return result
    } catch (err) {
      const errorInfo = errorHandler.handleError(err, context)
      setOperations(prev => new Map(prev.set(key, {
        data: prev.get(key)?.data || null,
        loading: { isLoading: false },
        error: errorInfo
      })))
      throw err
    }
  }, [])

  const getOperationState = useCallback((key: string) => {
    return operations.get(key) || {
      data: null,
      loading: { isLoading: false },
      error: null
    }
  }, [operations])

  const resetOperation = useCallback((key: string) => {
    setOperations(prev => {
      const newMap = new Map(prev)
      newMap.delete(key)
      return newMap
    })
  }, [])

  const resetAll = useCallback(() => {
    setOperations(new Map())
  }, [])

  return {
    executeOperation,
    getOperationState,
    resetOperation,
    resetAll,
    hasAnyLoading: Array.from(operations.values()).some(op => op.loading.isLoading),
    hasAnyError: Array.from(operations.values()).some(op => !!op.error)
  }
}

// Hook for form error handling
export const useFormErrorHandling = () => {
  const [fieldErrors, setFieldErrors] = useState<Map<string, string>>(new Map())
  const [generalError, setGeneralError] = useState<ErrorInfo | null>(null)

  const setFieldError = useCallback((field: string, message: string) => {
    setFieldErrors(prev => new Map(prev.set(field, message)))
  }, [])

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const newMap = new Map(prev)
      newMap.delete(field)
      return newMap
    })
  }, [])

  const setFormError = useCallback((error: any, context?: string) => {
    const errorInfo = errorHandler.handleError(error, context)
    setGeneralError(errorInfo)
  }, [])

  const clearAllErrors = useCallback(() => {
    setFieldErrors(new Map())
    setGeneralError(null)
  }, [])

  const getFieldError = useCallback((field: string) => {
    return fieldErrors.get(field) || null
  }, [fieldErrors])

  const hasFieldError = useCallback((field: string) => {
    return fieldErrors.has(field)
  }, [fieldErrors])

  return {
    fieldErrors: Object.fromEntries(fieldErrors),
    generalError,
    setFieldError,
    clearFieldError,
    setFormError,
    clearAllErrors,
    getFieldError,
    hasFieldError,
    hasAnyError: fieldErrors.size > 0 || !!generalError
  }
}

// Hook for network status monitoring
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'poor' | 'offline'>('good')

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setConnectionQuality('good')
    }

    const handleOffline = () => {
      setIsOnline(false)
      setConnectionQuality('offline')
    }

    // Monitor connection quality
    const checkConnectionQuality = async () => {
      if (!navigator.onLine) {
        setConnectionQuality('offline')
        return
      }

      try {
        const start = Date.now()
        await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-cache' })
        const duration = Date.now() - start
        
        setConnectionQuality(duration > 2000 ? 'poor' : 'good')
      } catch {
        setConnectionQuality('poor')
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check connection quality every 30 seconds
    const interval = setInterval(checkConnectionQuality, 30000)
    checkConnectionQuality() // Initial check

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  return {
    isOnline,
    connectionQuality,
    isGoodConnection: connectionQuality === 'good',
    isPoorConnection: connectionQuality === 'poor',
    isOffline: connectionQuality === 'offline'
  }
}

// Hook for automatic retry with exponential backoff
export const useAutoRetry = (
  operation: () => Promise<any>,
  dependencies: any[],
  options: {
    enabled?: boolean
    maxAttempts?: number
    baseDelay?: number
    context?: string
  } = {}
) => {
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const { execute, loading, error, data } = useAsyncOperation()

  const {
    enabled = true,
    maxAttempts = 3,
    baseDelay = 1000,
    context = 'Auto Retry Operation'
  } = options

  useEffect(() => {
    if (!enabled) return

    const performOperation = async () => {
      try {
        setIsRetrying(false)
        await execute(operation, context, { maxAttempts, baseDelay })
        setRetryCount(0)
      } catch (err) {
        const errorInfo = errorHandler.handleError(err, context)
        if (errorInfo.retryable && retryCount < maxAttempts - 1) {
          setRetryCount(prev => prev + 1)
          setIsRetrying(true)
          
          const delay = baseDelay * Math.pow(2, retryCount)
          setTimeout(() => {
            performOperation()
          }, delay)
        }
      }
    }

    performOperation()
  }, [...dependencies, enabled, retryCount])

  return {
    data,
    loading,
    error,
    retryCount,
    isRetrying,
    maxAttempts
  }
}
