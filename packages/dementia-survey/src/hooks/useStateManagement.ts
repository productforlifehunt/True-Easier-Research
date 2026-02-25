// Custom hooks for optimized state management
// Provides specialized hooks for different state management needs

import { useCallback, useMemo } from 'react'
import { useAppState, OptimizedStorage } from '../store'
import { Caregiver, CareGroup, Notification, User } from '../types'
import { dataService } from '../lib/dataService'

// ===== AUTH STATE MANAGEMENT =====

export const useAuth = () => {
  const { state, dispatch } = useAppState()

  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'AUTH_LOGIN_START' })
    
    try {
      const result = await dataService.signIn(email, password)
      
      if (result.user && result.session) {
        const mappedUser = {
          id: result.user.id,
          email: result.user.email || '',
          full_name: result.user.user_metadata?.full_name || result.user.email?.split('@')[0] || '',
          first_name: result.user.user_metadata?.first_name || '',
          last_name: result.user.user_metadata?.last_name || '',
          avatar_url: result.user.user_metadata?.avatar_url || '',
          phone: result.user.user_metadata?.phone || '',
          role: result.user.user_metadata?.role || 'caregiver',
          is_verified: result.user.user_metadata?.is_verified || false,
          created_at: result.user.created_at || new Date().toISOString(),
          updated_at: result.user.updated_at || new Date().toISOString()
        } as User
        
        dispatch({ 
          type: 'AUTH_LOGIN_SUCCESS', 
          payload: { user: mappedUser } 
        })
        return { success: true, user: mappedUser }
      } else {
        throw new Error('Authentication failed')
      }
    } catch (error: any) {
      dispatch({ 
        type: 'AUTH_LOGIN_FAILURE', 
        payload: { error: error.message } 
      })
      return { success: false, error: error.message }
    }
  }, [dispatch])

  const logout = useCallback(async () => {
    try {
      await dataService.signOut()
      dispatch({ type: 'AUTH_LOGOUT' })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }, [dispatch])

  const updateUser = useCallback(async (updates: Partial<User>) => {
    try {
      const userId = state.auth.user?.id
      if (!userId) {
        throw new Error('No user logged in')
      }
      const result = await dataService.updateUserProfile(userId, updates)
      
      if (result.success && result.data) {
        // Map the returned data to User type
        const updatedUser = {
          ...state.auth.user,
          ...result.data
        } as User
        
        dispatch({ 
          type: 'AUTH_UPDATE_USER', 
          payload: { user: updatedUser } 
        })
        return { success: true, user: updatedUser }
      }
      throw new Error('Failed to update user profile')
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }, [dispatch])

  return {
    ...state.auth,
    user: state.auth.user,
    login,
    logout,
    updateUser
  }
}

// ===== CAREGIVERS STATE MANAGEMENT =====

export const useCaregivers = () => {
  const { state, dispatch } = useAppState()
  const caregivers = state.caregivers

  const fetchCaregivers = useCallback(async (forceRefresh = false) => {
    // Check cache first
    const cacheKey = 'caregivers_list'
    const cached = state.cache[cacheKey]
    const now = Date.now()
    
    if (!forceRefresh && cached && (now - cached.timestamp) < cached.ttl) {
      return { success: true, data: cached.data, fromCache: true }
    }

    dispatch({ type: 'CAREGIVERS_FETCH_START' })
    
    try {
      const data = await dataService.getCaregivers()
      
      dispatch({ 
        type: 'CAREGIVERS_FETCH_SUCCESS', 
        payload: { data, timestamp: now } 
      })
      
      // Cache the result
      dispatch({
        type: 'CACHE_SET',
        payload: { 
          key: cacheKey, 
          data, 
          ttl: 5 * 60 * 1000 // 5 minutes
        }
      })
      
      return { success: true, data, fromCache: false }
    } catch (error: any) {
      dispatch({ 
        type: 'CAREGIVERS_FETCH_FAILURE', 
        payload: { error: error.message } 
      })
      return { success: false, error: error.message }
    }
  }, [state.cache, dispatch])

  const updateFilters = useCallback((filters: Record<string, any>) => {
    dispatch({ 
      type: 'CAREGIVERS_UPDATE_FILTERS', 
      payload: { filters } 
    })
  }, [dispatch])

  const addCaregiver = useCallback((caregiver: Caregiver) => {
    dispatch({ 
      type: 'CAREGIVERS_ADD', 
      payload: { caregiver } 
    })
    
    // Invalidate cache
    dispatch({ type: 'CACHE_INVALIDATE', payload: { key: 'caregivers_list' } })
  }, [dispatch])

  const updateCaregiver = useCallback((id: string, updates: Partial<Caregiver>) => {
    dispatch({ 
      type: 'CAREGIVERS_UPDATE', 
      payload: { id, updates } 
    })
    
    // Invalidate cache
    dispatch({ type: 'CACHE_INVALIDATE', payload: { key: 'caregivers_list' } })
  }, [dispatch])

  const removeCaregiver = useCallback((id: string) => {
    dispatch({ 
      type: 'CAREGIVERS_REMOVE', 
      payload: { id } 
    })
    
    // Invalidate cache
    dispatch({ type: 'CACHE_INVALIDATE', payload: { key: 'caregivers_list' } })
  }, [dispatch])

  // Filtered caregivers based on current filters
  const filteredCaregivers = useMemo(() => {
    let filtered = caregivers.data

    if (caregivers.filters.searchTerm) {
      const query = caregivers.filters.searchTerm.toLowerCase()
      filtered = filtered.filter(caregiver =>
        caregiver.full_name?.toLowerCase().includes(query) ||
        caregiver.bio?.toLowerCase().includes(query) ||
        caregiver.specialties?.some(specialty => 
          specialty.toLowerCase().includes(query)
        )
      )
    }

    if (caregivers.filters.location) {
      const location = caregivers.filters.location.toLowerCase()
      filtered = filtered.filter(caregiver =>
        caregiver.location?.toLowerCase().includes(location)
      )
    }

    if (caregivers.filters.specialties?.length > 0) {
      filtered = filtered.filter(caregiver =>
        caregivers.filters.specialties.some((specialty: string) =>
          caregiver.specialties?.includes(specialty)
        )
      )
    }

    if (caregivers.filters.maxRate) {
      const maxRate = parseFloat(caregivers.filters.maxRate)
      filtered = filtered.filter(caregiver =>
        (caregiver.hourly_rate || 0) <= maxRate
      )
    }

    if (caregivers.filters.minExperience) {
      const minExp = parseInt(caregivers.filters.minExperience)
      filtered = filtered.filter(caregiver =>
        (caregiver.years_experience || 0) >= minExp
      )
    }

    return filtered
  }, [caregivers.data, caregivers.filters])

  return {
    ...caregivers,
    filteredCaregivers,
    fetchCaregivers,
    updateFilters,
    addCaregiver,
    updateCaregiver,
    removeCaregiver
  }
}

// ===== UI STATE MANAGEMENT =====

export const useUI = () => {
  const { state, dispatch } = useAppState()

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'UI_TOGGLE_SIDEBAR' })
  }, [dispatch])

  const setSidebar = useCallback((open: boolean) => {
    dispatch({ type: 'UI_SET_SIDEBAR', payload: { open } })
  }, [dispatch])

  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    dispatch({ type: 'UI_SET_THEME', payload: { theme } })
  }, [dispatch])

  const setLanguage = useCallback((language: string) => {
    dispatch({ type: 'UI_SET_LANGUAGE', payload: { language } })
  }, [dispatch])

  const showNotification = useCallback((
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    dispatch({ 
      type: 'UI_SHOW_NOTIFICATION', 
      payload: { message, type } 
    })
  }, [dispatch])

  const hideNotification = useCallback(() => {
    dispatch({ type: 'UI_HIDE_NOTIFICATION' })
  }, [dispatch])

  return {
    ...state.ui,
    toggleSidebar,
    setSidebar,
    setTheme,
    setLanguage,
    showNotification,
    hideNotification
  }
}

// ===== CACHE MANAGEMENT =====

export const useCache = () => {
  const { state, dispatch } = useAppState()

  const setCache = useCallback((key: string, data: any, ttl?: number) => {
    dispatch({ 
      type: 'CACHE_SET', 
      payload: { key, data, ttl } 
    })
  }, [dispatch])

  const getCache = useCallback((key: string) => {
    const cached = state.cache[key]
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > cached.ttl) {
      dispatch({ type: 'CACHE_INVALIDATE', payload: { key } })
      return null
    }

    return cached.data
  }, [state.cache, dispatch])

  const invalidateCache = useCallback((key: string) => {
    dispatch({ type: 'CACHE_INVALIDATE', payload: { key } })
  }, [dispatch])

  const clearCache = useCallback(() => {
    dispatch({ type: 'CACHE_CLEAR' })
  }, [dispatch])

  return {
    cache: state.cache,
    setCache,
    getCache,
    invalidateCache,
    clearCache
  }
}

// ===== OPTIMIZED LOCAL STORAGE HOOK =====

export const useOptimizedStorage = () => {
  const setItem = useCallback((
    key: string, 
    value: any, 
    options?: { ttl?: number; compress?: boolean; encrypt?: boolean }
  ) => {
    return OptimizedStorage.setItem(key, value, options)
  }, [])

  const getItem = useCallback(<T = any>(key: string): T | null => {
    return OptimizedStorage.getItem<T>(key)
  }, [])

  const removeItem = useCallback((key: string) => {
    OptimizedStorage.removeItem(key)
  }, [])

  const clear = useCallback(() => {
    OptimizedStorage.clear()
  }, [])

  const getStorageSize = useCallback(() => {
    return OptimizedStorage.getStorageSize()
  }, [])

  const cleanup = useCallback(() => {
    OptimizedStorage.cleanup()
  }, [])

  return {
    setItem,
    getItem,
    removeItem,
    clear,
    getStorageSize,
    cleanup
  }
}
