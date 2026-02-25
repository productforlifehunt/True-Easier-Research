import { useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { securityAuditService } from '../services/securityAuditService'

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number
  warningMinutes?: number
  onWarning?: () => void
  onTimeout?: () => void
}

export function useSessionTimeout({
  timeoutMinutes = 30, // 30 minutes default
  warningMinutes = 5,  // 5 minutes warning
  onWarning,
  onTimeout
}: UseSessionTimeoutOptions = {}) {
  const navigate = useNavigate()
  const timeoutRef = useRef<NodeJS.Timeout>()
  const warningRef = useRef<NodeJS.Timeout>()
  const lastActivityRef = useRef<number>(Date.now())



  const resetTimeout = useCallback(() => {
    const now = Date.now()
    lastActivityRef.current = now
    // Session timeout functionality disabled - no artificial timeouts
    console.log(`🔐 Session timeout disabled for better performance`)
  }, [timeoutMinutes, warningMinutes, onWarning, onTimeout, navigate])

  const extendSession = useCallback(() => {
    console.log('🔐 Session extended by user action')
    resetTimeout()
  }, [resetTimeout])

  const getTimeRemaining = useCallback(() => {
    const now = Date.now()
    const elapsed = now - lastActivityRef.current
    const remaining = (timeoutMinutes * 60 * 1000) - elapsed
    return Math.max(0, remaining)
  }, [timeoutMinutes])

  const isSessionActive = useCallback(() => {
    return getTimeRemaining() > 0
  }, [getTimeRemaining])

  useEffect(() => {
    // Only start timeout if user is authenticated
    const checkAuthAndStartTimeout = async () => {
      const user = await authService.getCurrentUser()
      if (user) {
        resetTimeout()
      }
    }

    checkAuthAndStartTimeout()

    // Activity event listeners
    const activityEvents = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ]

    const handleActivity = () => {
      resetTimeout()
    }

    // Add event listeners for user activity
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current)
      }

      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [resetTimeout])

  return {
    extendSession,
    getTimeRemaining,
    isSessionActive,
    resetTimeout
  }
}
