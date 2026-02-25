import React, { useReducer, useEffect, useCallback, ReactNode } from 'react'
import { AppStateContext, AppAction, appReducer, OptimizedStorage } from './index'
import { supabase } from '../lib/supabase'
import { User } from '../types'

const initialState = {
  auth: {
    isAuthenticated: false,
    isLoading: false,
    error: null,
    user: null
  },
  user: null,
  ui: {
    sidebarOpen: true,
    theme: 'light' as const,
    language: 'en',
    notifications: {
      show: false,
      message: '',
      type: 'info' as const
    }
  },
  caregivers: {
    data: [],
    loading: false,
    error: '',
    lastFetch: 0,
    filters: {}
  },
  careGroups: {
    data: [],
    loading: false,
    error: '',
    lastFetch: 0
  },
  notifications: {
    data: [],
    unreadCount: 0,
    loading: false,
    error: '',
    lastFetch: 0
  },
  cache: {}
}

interface AppStateProviderProps {
  children: ReactNode
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState, (initial) => {
    // Load only UI preferences, NOT auth state - users must login manually
    const persistedUI = OptimizedStorage.getItem('ui_state')
    const persistedFilters = OptimizedStorage.getItem('caregiver_filters')

    return {
      ...initial,
      auth: initial.auth, // Always start logged out
      user: null, // No auto-login
      ui: { ...initial.ui, ...persistedUI },
      caregivers: {
        ...initial.caregivers,
        filters: persistedFilters || {}
      }
    }
  })

  // DO NOT persist auth state - users must login manually each session
  // useEffect removed to prevent auto-login

  useEffect(() => {
    OptimizedStorage.setItem('ui_state', state.ui, { 
      ttl: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
  }, [state.ui])

  useEffect(() => {
    OptimizedStorage.setItem('caregiver_filters', state.caregivers.filters, {
      ttl: 60 * 60 * 1000 // 1 hour
    })
  }, [state.caregivers.filters])

  // Initialize auth state from Supabase
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('[AppStateProvider] Starting auth check')
        
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // Use auth user data directly - survey app doesn't need profiles table
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
            first_name: session.user.user_metadata?.first_name || '',
            last_name: session.user.user_metadata?.last_name || '',
            avatar_url: session.user.user_metadata?.avatar_url || '',
            phone: session.user.user_metadata?.phone || '',
            role: session.user.user_metadata?.role || 'caregiver',
            is_verified: session.user.user_metadata?.is_verified || false,
            created_at: session.user.created_at || new Date().toISOString(),
            updated_at: session.user.updated_at || new Date().toISOString()
          }

          dispatch({ type: 'AUTH_LOGIN_SUCCESS', payload: { user } })
        } else {
          console.log('[AppStateProvider] No session found - user is not logged in')
          dispatch({ type: 'AUTH_LOGOUT' })
        }
      } catch (error: any) {
        console.log('[AppStateProvider] Auth check error:', error.message)
        dispatch({ type: 'AUTH_LOGOUT' })
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Use auth user data directly - survey app doesn't need profiles table
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
            first_name: session.user.user_metadata?.first_name || '',
            last_name: session.user.user_metadata?.last_name || '',
            avatar_url: session.user.user_metadata?.avatar_url || '',
            phone: session.user.user_metadata?.phone || '',
            role: session.user.user_metadata?.role || 'caregiver',
            is_verified: session.user.user_metadata?.is_verified || false,
            created_at: session.user.created_at || new Date().toISOString(),
            updated_at: session.user.updated_at || new Date().toISOString()
          }

          dispatch({ type: 'AUTH_LOGIN_SUCCESS', payload: { user } })
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'AUTH_LOGOUT' })
          OptimizedStorage.clear()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Cache cleanup interval - DISABLED to prevent session loss
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      dispatch({ type: 'CACHE_CLEANUP' })
      // OptimizedStorage.cleanup() // DISABLED - was clearing auth tokens
    }, 30 * 60 * 1000) // Reduced frequency to 30 minutes and disabled cleanup

    return () => clearInterval(cleanupInterval)
  }, [])

  // Real-time data synchronization
  useEffect(() => {
    if (!state.auth.isAuthenticated || !state.user) return

    // Subscribe to real-time updates for user's data
    const caregiverSubscription = supabase
      .channel('caregivers_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'care_connector', table: 'caregivers' },
        (payload) => {
          console.log('Caregiver change received:', payload)
          
          switch (payload.eventType) {
            case 'INSERT':
              dispatch({ 
                type: 'CAREGIVERS_ADD', 
                payload: { caregiver: payload.new as any } 
              })
              break
            case 'UPDATE':
              dispatch({ 
                type: 'CAREGIVERS_UPDATE', 
                payload: { 
                  id: payload.new.id, 
                  updates: payload.new 
                } 
              })
              break
            case 'DELETE':
              dispatch({ 
                type: 'CAREGIVERS_REMOVE', 
                payload: { id: payload.old.id } 
              })
              break
          }
        }
      )
      .subscribe()

    // Subscribe to notifications
    const notificationSubscription = supabase
      .channel('notifications_changes')
      .on('postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'care_connector', 
          table: 'notifications',
          filter: `user_id=eq.${state.user.id}`
        },
        (payload) => {
          console.log('New notification received:', payload)
          dispatch({ 
            type: 'NOTIFICATIONS_ADD', 
            payload: { notification: payload.new as any } 
          })
          
          // Show UI notification
          dispatch({
            type: 'UI_SHOW_NOTIFICATION',
            payload: {
              message: payload.new.title || 'New notification',
              type: 'info'
            }
          })
        }
      )
      .subscribe()

    return () => {
      caregiverSubscription.unsubscribe()
      notificationSubscription.unsubscribe()
    }
  }, [state.auth.isAuthenticated, state.user])

  // Enhanced dispatch with middleware
  const enhancedDispatch = useCallback((action: AppAction) => {
    dispatch(action)
  }, [])

  // Handle side effects
  useEffect(() => {
    if (!state.auth.isAuthenticated && !state.auth.isLoading) {
      // Clear all cached data on logout
      OptimizedStorage.clear()
    }
  }, [state.auth.isAuthenticated, state.auth.isLoading])

  return (
    <AppStateContext.Provider value={{ state, dispatch: enhancedDispatch }}>
      {children}
    </AppStateContext.Provider>
  )
}

export default AppStateProvider
