import { useState, useCallback, useRef, useEffect } from 'react'
import { ApiResponse } from '../types'

export interface UseApiOptions {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
  retryAttempts?: number
  retryDelay?: number
}

export interface UseApiReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  execute: (...args: any[]) => Promise<T | null>
  retry: () => Promise<T | null>
  reset: () => void
}

export const useApi = <T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {}
): UseApiReturn<T> => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const lastArgsRef = useRef<any[]>([])
  const retryCountRef = useRef(0)
  const mountedRef = useRef(true)

  const {
    onSuccess,
    onError,
    retryAttempts = 0,
    retryDelay = 1000
  } = options

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    if (!mountedRef.current) return null

    lastArgsRef.current = args
    setLoading(true)
    setError(null)

    try {
      const result = await apiFunction(...args)
      
      if (!mountedRef.current) return null

      setData(result)
      retryCountRef.current = 0
      onSuccess?.(result)
      return result
    } catch (err: any) {
      if (!mountedRef.current) return null

      const errorMessage = err?.message || err?.error || 'An unexpected error occurred'
      setError(errorMessage)
      onError?.(errorMessage)
      
      // Auto-retry if configured
      if (retryCountRef.current < retryAttempts) {
        retryCountRef.current++
        setTimeout(() => {
          if (mountedRef.current) {
            execute(...args)
          }
        }, retryDelay)
      }
      
      return null
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [apiFunction, onSuccess, onError, retryAttempts, retryDelay])

  const retry = useCallback(async (): Promise<T | null> => {
    return execute(...lastArgsRef.current)
  }, [execute])

  const reset = useCallback(() => {
    setData(null)
    setLoading(false)
    setError(null)
    retryCountRef.current = 0
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    retry,
    reset
  }
}

// Hook for paginated API calls
export interface UsePaginatedApiOptions extends UseApiOptions {
  initialPage?: number
  pageSize?: number
}

export interface UsePaginatedApiReturn<T> extends UseApiReturn<T[]> {
  page: number
  pageSize: number
  totalPages: number
  totalItems: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  nextPage: () => Promise<void>
  previousPage: () => Promise<void>
  goToPage: (page: number) => Promise<void>
  refresh: () => Promise<void>
}

export const usePaginatedApi = <T = any>(
  apiFunction: (page: number, pageSize: number, ...args: any[]) => Promise<{
    data: T[]
    pagination: {
      page: number
      per_page: number
      total: number
      total_pages: number
    }
  }>,
  options: UsePaginatedApiOptions = {}
): UsePaginatedApiReturn<T> => {
  const [page, setPage] = useState(options.initialPage || 1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [pageSize] = useState(options.pageSize || 10)
  
  const additionalArgsRef = useRef<any[]>([])

  const {
    data,
    loading,
    error,
    execute: baseExecute,
    retry,
    reset: baseReset
  } = useApi(apiFunction, {
    ...options,
    onSuccess: (result) => {
      setTotalPages(result.pagination.total_pages)
      setTotalItems(result.pagination.total)
      options.onSuccess?.(result.data)
    }
  })

  const execute = useCallback(async (...args: any[]): Promise<T[] | null> => {
    additionalArgsRef.current = args
    const result = await baseExecute(page, pageSize, ...args)
    return result?.data || null
  }, [baseExecute, page, pageSize])

  const nextPage = useCallback(async () => {
    if (page < totalPages) {
      setPage(prev => prev + 1)
    }
  }, [page, totalPages])

  const previousPage = useCallback(async () => {
    if (page > 1) {
      setPage(prev => prev - 1)
    }
  }, [page])

  const goToPage = useCallback(async (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }, [totalPages])

  const refresh = useCallback(async () => {
    await execute(...additionalArgsRef.current)
  }, [execute])
  
  // Wrap retry to return just the data array
  const retryWrapper = useCallback(async (): Promise<T[] | null> => {
    const result = await retry()
    return result?.data || null
  }, [retry])

  const reset = useCallback(() => {
    baseReset()
    setPage(options.initialPage || 1)
    setTotalPages(0)
    setTotalItems(0)
  }, [baseReset, options.initialPage])

  // Auto-execute when page changes
  useEffect(() => {
    if (additionalArgsRef.current.length > 0) {
      execute(...additionalArgsRef.current)
    }
  }, [page, execute])

  return {
    data: data?.data || [],
    loading,
    error,
    execute,
    retry: retryWrapper,
    reset,
    page,
    totalPages,
    totalItems,
    pageSize,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    nextPage,
    previousPage,
    goToPage,
    refresh
  }
}

// Hook for optimistic updates
export interface UseOptimisticApiOptions<T> extends UseApiOptions {
  optimisticUpdate?: (currentData: T | null, ...args: any[]) => T | null
  rollbackOnError?: boolean
}

export const useOptimisticApi = <T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseOptimisticApiOptions<T> = {}
): UseApiReturn<T> => {
  const [optimisticData, setOptimisticData] = useState<T | null>(null)
  
  const {
    optimisticUpdate,
    rollbackOnError = true,
    ...baseOptions
  } = options

  const {
    data: actualData,
    loading,
    error,
    execute: baseExecute,
    retry,
    reset: baseReset
  } = useApi(apiFunction, baseOptions)

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    // Apply optimistic update
    if (optimisticUpdate) {
      const optimistic = optimisticUpdate(actualData, ...args)
      setOptimisticData(optimistic)
    }

    try {
      const result = await baseExecute(...args)
      setOptimisticData(null) // Clear optimistic data on success
      return result
    } catch (err) {
      // Rollback optimistic update on error
      if (rollbackOnError) {
        setOptimisticData(null)
      }
      throw err
    }
  }, [actualData, optimisticUpdate, rollbackOnError, baseExecute])

  const reset = useCallback(() => {
    baseReset()
    setOptimisticData(null)
  }, [baseReset])

  return {
    data: optimisticData || actualData,
    loading,
    error,
    execute,
    retry,
    reset
  }
}

export default useApi
