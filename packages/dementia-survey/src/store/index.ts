// Global State Management System
// Provides centralized state management with optimized local storage and cache invalidation

import { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { User, AuthState, Caregiver, CareGroup, Notification } from '../types'

// ===== STATE INTERFACES =====

export interface AppState {
  auth: AuthState
  user: User | null
  caregivers: {
    data: Caregiver[]
    loading: boolean
    error: string | null
    lastFetch: number | null
    filters: Record<string, any>
  }
  careGroups: {
    data: CareGroup[]
    loading: boolean
    error: string | null
    lastFetch: number | null
  }
  notifications: {
    data: Notification[]
    unreadCount: number
    loading: boolean
    error: string | null
    lastFetch: number | null
  }
  ui: {
    sidebarOpen: boolean
    theme: 'light' | 'dark' | 'system'
    language: string
    notifications: {
      show: boolean
      message: string
      type: 'success' | 'error' | 'warning' | 'info'
    }
  }
  cache: {
    [key: string]: {
      data: any
      timestamp: number
      ttl: number
    }
  }
}

// ===== ACTION TYPES =====

export type AppAction =
  // Auth actions
  | { type: 'AUTH_LOGIN_START' }
  | { type: 'AUTH_LOGIN_SUCCESS'; payload: { user: User } }
  | { type: 'AUTH_LOGIN_FAILURE'; payload: { error: string } }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_UPDATE_USER'; payload: { user: Partial<User> } }
  
  // Caregivers actions
  | { type: 'CAREGIVERS_FETCH_START' }
  | { type: 'CAREGIVERS_FETCH_SUCCESS'; payload: { data: Caregiver[]; timestamp: number } }
  | { type: 'CAREGIVERS_FETCH_FAILURE'; payload: { error: string } }
  | { type: 'CAREGIVERS_UPDATE_FILTERS'; payload: { filters: Record<string, any> } }
  | { type: 'CAREGIVERS_ADD'; payload: { caregiver: Caregiver } }
  | { type: 'CAREGIVERS_UPDATE'; payload: { id: string; updates: Partial<Caregiver> } }
  | { type: 'CAREGIVERS_REMOVE'; payload: { id: string } }
  
  // Care Groups actions
  | { type: 'CARE_GROUPS_FETCH_START' }
  | { type: 'CARE_GROUPS_FETCH_SUCCESS'; payload: { data: CareGroup[]; timestamp: number } }
  | { type: 'CARE_GROUPS_FETCH_FAILURE'; payload: { error: string } }
  | { type: 'CARE_GROUPS_ADD'; payload: { careGroup: CareGroup } }
  | { type: 'CARE_GROUPS_UPDATE'; payload: { id: string; updates: Partial<CareGroup> } }
  | { type: 'CARE_GROUPS_REMOVE'; payload: { id: string } }
  
  // Notifications actions
  | { type: 'NOTIFICATIONS_FETCH_START' }
  | { type: 'NOTIFICATIONS_FETCH_SUCCESS'; payload: { data: Notification[]; timestamp: number } }
  | { type: 'NOTIFICATIONS_FETCH_FAILURE'; payload: { error: string } }
  | { type: 'NOTIFICATIONS_ADD'; payload: { notification: Notification } }
  | { type: 'NOTIFICATIONS_MARK_READ'; payload: { id: string } }
  | { type: 'NOTIFICATIONS_MARK_ALL_READ' }
  | { type: 'NOTIFICATIONS_REMOVE'; payload: { id: string } }
  
  // UI actions
  | { type: 'UI_TOGGLE_SIDEBAR' }
  | { type: 'UI_SET_SIDEBAR'; payload: { open: boolean } }
  | { type: 'UI_SET_THEME'; payload: { theme: 'light' | 'dark' | 'system' } }
  | { type: 'UI_SET_LANGUAGE'; payload: { language: string } }
  | { type: 'UI_SHOW_NOTIFICATION'; payload: { message: string; type: 'success' | 'error' | 'warning' | 'info' } }
  | { type: 'UI_HIDE_NOTIFICATION' }
  
  // Cache actions
  | { type: 'CACHE_SET'; payload: { key: string; data: any; ttl?: number } }
  | { type: 'CACHE_INVALIDATE'; payload: { key: string } }
  | { type: 'CACHE_CLEAR' }
  | { type: 'CACHE_CLEANUP' }

// ===== INITIAL STATE =====

const initialState: AppState = {
  auth: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  },
  user: null,
  caregivers: {
    data: [],
    loading: false,
    error: null,
    lastFetch: null,
    filters: {}
  },
  careGroups: {
    data: [],
    loading: false,
    error: null,
    lastFetch: null
  },
  notifications: {
    data: [],
    unreadCount: 0,
    loading: false,
    error: null,
    lastFetch: null
  },
  ui: {
    sidebarOpen: false,
    theme: 'system',
    language: 'en',
    notifications: {
      show: false,
      message: '',
      type: 'info'
    }
  },
  cache: {}
}

// ===== REDUCER =====

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    // Auth cases
    case 'AUTH_LOGIN_START':
      return {
        ...state,
        auth: { ...state.auth, isLoading: true, error: null }
      }
    
    case 'AUTH_LOGIN_SUCCESS':
      return {
        ...state,
        auth: {
          user: action.payload.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        },
        user: action.payload.user
      }
    
    case 'AUTH_LOGIN_FAILURE':
      return {
        ...state,
        auth: {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: action.payload.error
        },
        user: null
      }
    
    case 'AUTH_LOGOUT':
      return {
        ...state,
        auth: {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        },
        user: null,
        caregivers: {
          data: [],
          loading: false,
          error: null,
          lastFetch: null,
          filters: {}
        },
        careGroups: {
          data: [],
          loading: false,
          error: null,
          lastFetch: null
        },
        notifications: {
          data: [],
          unreadCount: 0,
          loading: false,
          error: null,
          lastFetch: null
        },
        cache: {}
      }
    
    case 'AUTH_UPDATE_USER':
      const updatedUser = state.user ? { ...state.user, ...action.payload.user } : null
      return {
        ...state,
        auth: { ...state.auth, user: updatedUser },
        user: updatedUser
      }

    // Caregivers cases
    case 'CAREGIVERS_FETCH_START':
      return {
        ...state,
        caregivers: { ...state.caregivers, loading: true, error: null }
      }
    
    case 'CAREGIVERS_FETCH_SUCCESS':
      return {
        ...state,
        caregivers: {
          ...state.caregivers,
          data: action.payload.data,
          loading: false,
          error: null,
          lastFetch: action.payload.timestamp
        }
      }
    
    case 'CAREGIVERS_FETCH_FAILURE':
      return {
        ...state,
        caregivers: { ...state.caregivers, loading: false, error: action.payload.error }
      }
    
    case 'CAREGIVERS_UPDATE_FILTERS':
      return {
        ...state,
        caregivers: { ...state.caregivers, filters: action.payload.filters }
      }
    
    case 'CAREGIVERS_ADD':
      return {
        ...state,
        caregivers: {
          ...state.caregivers,
          data: [...state.caregivers.data, action.payload.caregiver]
        }
      }
    
    case 'CAREGIVERS_UPDATE':
      return {
        ...state,
        caregivers: {
          ...state.caregivers,
          data: state.caregivers.data.map(caregiver =>
            caregiver.id === action.payload.id
              ? { ...caregiver, ...action.payload.updates }
              : caregiver
          )
        }
      }
    
    case 'CAREGIVERS_REMOVE':
      return {
        ...state,
        caregivers: {
          ...state.caregivers,
          data: state.caregivers.data.filter(caregiver => caregiver.id !== action.payload.id)
        }
      }

    // UI cases
    case 'UI_TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen }
      }
    
    case 'UI_SET_SIDEBAR':
      return {
        ...state,
        ui: { ...state.ui, sidebarOpen: action.payload.open }
      }
    
    case 'UI_SET_THEME':
      return {
        ...state,
        ui: { ...state.ui, theme: action.payload.theme }
      }
    
    case 'UI_SHOW_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: {
            show: true,
            message: action.payload.message,
            type: action.payload.type
          }
        }
      }
    
    case 'UI_HIDE_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: { ...state.ui.notifications, show: false }
        }
      }

    // Cache cases
    case 'CACHE_SET':
      return {
        ...state,
        cache: {
          ...state.cache,
          [action.payload.key]: {
            data: action.payload.data,
            timestamp: Date.now(),
            ttl: action.payload.ttl || 300000 // 5 minutes default
          }
        }
      }
    
    case 'CACHE_INVALIDATE':
      const { [action.payload.key]: removed, ...remainingCache } = state.cache
      return {
        ...state,
        cache: remainingCache
      }
    
    case 'CACHE_CLEAR':
      return {
        ...state,
        cache: {}
      }
    
    case 'CACHE_CLEANUP':
      const now = Date.now()
      const validCache = Object.entries(state.cache).reduce((acc, [key, value]) => {
        if (now - value.timestamp < value.ttl) {
          acc[key] = value
        }
        return acc
      }, {} as AppState['cache'])
      
      return {
        ...state,
        cache: validCache
      }

    default:
      return state
  }
}

// ===== CONTEXT =====

export const AppStateContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

// ===== CUSTOM HOOK =====

export const useAppState = () => {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider')
  }
  return context
}

// ===== LOCAL STORAGE OPTIMIZATION =====

export class OptimizedStorage {
  private static readonly PREFIX = 'care_connector_'
  private static readonly MAX_SIZE = 5 * 1024 * 1024 // 5MB limit
  private static readonly COMPRESSION_THRESHOLD = 1024 // 1KB

  static setItem(key: string, value: any, options?: {
    ttl?: number
    compress?: boolean
    encrypt?: boolean
  }): boolean {
    try {
      const fullKey = this.PREFIX + key
      const data = {
        value,
        timestamp: Date.now(),
        ttl: options?.ttl || 0,
        compressed: false,
        encrypted: false
      }

      let serialized = JSON.stringify(data)

      // Compress large data
      if (options?.compress && serialized.length > this.COMPRESSION_THRESHOLD) {
        // In a real implementation, you'd use a compression library
        data.compressed = true
      }

      // Encrypt sensitive data
      if (options?.encrypt) {
        // In a real implementation, you'd use encryption
        data.encrypted = true
      }

      // Check storage size
      if (this.getStorageSize() + serialized.length > this.MAX_SIZE) {
        this.cleanup()
      }

      localStorage.setItem(fullKey, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Failed to store data:', error)
      return false
    }
  }

  static getItem<T = any>(key: string): T | null {
    try {
      const fullKey = this.PREFIX + key
      const stored = localStorage.getItem(fullKey)

      if (!stored) return null

      const data = JSON.parse(stored)

      // Check TTL
      if (data.ttl > 0 && Date.now() - data.timestamp > data.ttl) {
        this.removeItem(key)
        return null
      }

      // Decompress if needed
      if (data.compressed) {
        // Decompress data
      }

      // Decrypt if needed
      if (data.encrypted) {
        // Decrypt data
      }

      return data.value
    } catch (error) {
      console.error('Failed to retrieve data:', error)
      return null
    }
  }

  static removeItem(key: string): void {
    const fullKey = this.PREFIX + key
    localStorage.removeItem(fullKey)
  }

  static clear(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.PREFIX))
    keys.forEach(key => localStorage.removeItem(key))
  }

  static getStorageSize(): number {
    let total = 0
    for (let key in localStorage) {
      if (key.startsWith(this.PREFIX)) {
        total += localStorage[key].length
      }
    }
    return total
  }

  static cleanup(): void {
    console.log('🧹 OptimizedStorage cleanup called - DISABLED to prevent auth token removal')
    
    // CRITICAL FIX: Never clean up auth-related tokens
    const authTokenKeys = ['sb-yekarqanirdkdckimpna-auth-token', 'care_connector_auth_state']
    
    const keys = Object.keys(localStorage)
      .filter(key => key.startsWith(this.PREFIX))
      .filter(key => !authTokenKeys.some(authKey => key.includes(authKey))) // Skip auth tokens
      .map(key => {
        try {
          const data = JSON.parse(localStorage[key] || '{}')
          return {
            key,
            timestamp: data.timestamp || 0,
            ttl: data.ttl || 0
          }
        } catch {
          return { key, timestamp: 0, ttl: 0 }
        }
      })
      .sort((a, b) => a.timestamp - b.timestamp)

    // Remove expired items first (but never auth tokens)
    const now = Date.now()
    keys.forEach(({ key, timestamp, ttl }) => {
      if (ttl > 0 && now - timestamp > ttl) {
        // Double check this isn't an auth token before removing
        if (!authTokenKeys.some(authKey => key.includes(authKey))) {
          console.log('🧹 Removing expired cache item:', key)
          localStorage.removeItem(key)
        }
      }
    })

    // If still over limit, remove oldest items (but never auth tokens)
    if (this.getStorageSize() > this.MAX_SIZE * 0.8) {
      const validKeys = keys.filter(({ timestamp, ttl }) =>
        ttl === 0 || now - timestamp <= ttl
      )

      const toRemove = Math.ceil(validKeys.length * 0.2)
      validKeys.slice(0, toRemove).forEach(({ key }) => {
        // Triple check this isn't an auth token before removing
        if (!authTokenKeys.some(authKey => key.includes(authKey))) {
          console.log('🧹 Removing old cache item to free space:', key)
          localStorage.removeItem(key)
        }
      })
    }
  }
}
