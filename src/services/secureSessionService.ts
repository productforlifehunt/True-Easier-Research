/**
 * Secure Session Management Service
 * Handles secure cookie settings, session storage, and session security
 */

interface SessionConfig {
  secure: boolean
  httpOnly: boolean
  sameSite: 'strict' | 'lax' | 'none'
  maxAge: number
  domain?: string
  path: string
}

interface SessionData {
  userId: string
  email: string
  role: string
  sessionId: string
  createdAt: number
  lastActivity: number
  ipAddress?: string
  userAgent?: string
}

class SecureSessionService {
  private static readonly SESSION_KEY = 'secure_session'
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
  private static readonly ACTIVITY_TIMEOUT = 5 * 60 * 1000 // 5 minutes for activity tracking
  
  private sessionData: SessionData | null = null
  private activityTimer: NodeJS.Timeout | null = null
  private warningTimer: NodeJS.Timeout | null = null

  /**
   * Get secure cookie configuration
   */
  private getSecureCookieConfig(): SessionConfig {
    const isProduction = window.location.protocol === 'https:'
    
    return {
      secure: isProduction, // Only send over HTTPS in production
      httpOnly: false, // Can't be true for client-side cookies, but we'll use secure storage
      sameSite: 'strict', // Prevent CSRF attacks
      maxAge: SecureSessionService.SESSION_TIMEOUT,
      path: '/',
      domain: isProduction ? window.location.hostname : undefined
    }
  }

  /**
   * Generate a secure session ID
   */
  private generateSessionId(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Get client fingerprint for additional security
   */
  private getClientFingerprint(): string {
    const userAgent = navigator.userAgent
    const language = navigator.language
    const platform = navigator.platform
    const screenResolution = `${screen.width}x${screen.height}`
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    
    return btoa(`${userAgent}-${language}-${platform}-${screenResolution}-${timezone}`).substring(0, 32)
  }

  /**
   * Encrypt session data (simple XOR encryption for demo - use proper encryption in production)
   */
  private encryptSessionData(data: string): string {
    const key = this.getClientFingerprint()
    let encrypted = ''
    
    for (let i = 0; i < data.length; i++) {
      const keyChar = key.charCodeAt(i % key.length)
      const dataChar = data.charCodeAt(i)
      encrypted += String.fromCharCode(dataChar ^ keyChar)
    }
    
    return btoa(encrypted)
  }

  /**
   * Decrypt session data
   */
  private decryptSessionData(encryptedData: string): string {
    try {
      const key = this.getClientFingerprint()
      const encrypted = atob(encryptedData)
      let decrypted = ''
      
      for (let i = 0; i < encrypted.length; i++) {
        const keyChar = key.charCodeAt(i % key.length)
        const encryptedChar = encrypted.charCodeAt(i)
        decrypted += String.fromCharCode(encryptedChar ^ keyChar)
      }
      
      return decrypted
    } catch {
      return ''
    }
  }

  /**
   * Store session data securely
   */
  private storeSessionData(data: SessionData): void {
    try {
      const jsonData = JSON.stringify(data)
      const encryptedData = this.encryptSessionData(jsonData)
      
      // Store in sessionStorage (more secure than localStorage for sessions)
      sessionStorage.setItem(SecureSessionService.SESSION_KEY, encryptedData)
      
      // Also store session ID in a secure way
      sessionStorage.setItem('session_id', data.sessionId)
      
      this.sessionData = data
    } catch (error) {
      console.error('Failed to store session data:', error)
    }
  }

  /**
   * Retrieve session data securely
   */
  private retrieveSessionData(): SessionData | null {
    try {
      const encryptedData = sessionStorage.getItem(SecureSessionService.SESSION_KEY)
      if (!encryptedData) {
        return null
      }
      
      const jsonData = this.decryptSessionData(encryptedData)
      if (!jsonData) {
        return null
      }
      
      const data = JSON.parse(jsonData) as SessionData
      
      // Validate session data structure
      if (!data.userId || !data.sessionId || !data.createdAt) {
        return null
      }
      
      // Check if session has expired
      const now = Date.now()
      if (now - data.lastActivity > SecureSessionService.SESSION_TIMEOUT) {
        this.clearSession()
        return null
      }
      
      return data
    } catch (error) {
      console.error('Failed to retrieve session data:', error)
      this.clearSession()
      return null
    }
  }

  /**
   * Create a new secure session
   */
  createSession(userId: string, email: string, role: string): void {
    const now = Date.now()
    const sessionId = this.generateSessionId()
    
    const sessionData: SessionData = {
      userId,
      email,
      role,
      sessionId,
      createdAt: now,
      lastActivity: now,
      userAgent: navigator.userAgent,
      ipAddress: 'client-side' // Would be set by server in real implementation
    }
    
    this.storeSessionData(sessionData)
    this.startActivityTracking()
    
    console.log('🔐 Secure session created:', sessionId)
  }

  /**
   * Update session activity
   */
  updateActivity(): void {
    const session = this.getSession()
    if (session) {
      session.lastActivity = Date.now()
      this.storeSessionData(session)
    }
  }

  /**
   * Get current session
   */
  getSession(): SessionData | null {
    if (!this.sessionData) {
      this.sessionData = this.retrieveSessionData()
    }
    return this.sessionData
  }

  /**
   * Check if session is valid
   */
  isSessionValid(): boolean {
    const session = this.getSession()
    if (!session) {
      return false
    }
    
    const now = Date.now()
    return (now - session.lastActivity) < SecureSessionService.SESSION_TIMEOUT
  }

  /**
   * Clear session data
   */
  clearSession(): void {
    sessionStorage.removeItem(SecureSessionService.SESSION_KEY)
    sessionStorage.removeItem('session_id')
    this.sessionData = null
    
    if (this.activityTimer) {
      clearInterval(this.activityTimer)
      this.activityTimer = null
    }
    
    if (this.warningTimer) {
      clearTimeout(this.warningTimer)
      this.warningTimer = null
    }
    
    console.log('🔐 Secure session cleared')
  }

  /**
   * Start activity tracking - DISABLED AGGRESSIVE SESSION CLEARING
   */
  private startActivityTracking(): void {
    // Clear existing timers
    if (this.activityTimer) {
      clearInterval(this.activityTimer)
    }
    
    // Track user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    const updateActivity = () => {
      this.updateActivity()
    }
    
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true })
    })
    
    // DISABLED: Aggressive session clearing that was causing data loss
    // This was clearing user data every 5 minutes, causing dashboard data to disappear
    console.log('🔐 Session activity tracking enabled (aggressive clearing disabled)')
  }

  /**
   * Get session info for display
   */
  getSessionInfo(): {
    isActive: boolean
    timeRemaining: number
    sessionId: string | null
    lastActivity: Date | null
  } {
    const session = this.getSession()
    
    if (!session) {
      return {
        isActive: false,
        timeRemaining: 0,
        sessionId: null,
        lastActivity: null
      }
    }
    
    const now = Date.now()
    const timeRemaining = Math.max(0, SecureSessionService.SESSION_TIMEOUT - (now - session.lastActivity))
    
    return {
      isActive: this.isSessionValid(),
      timeRemaining,
      sessionId: session.sessionId,
      lastActivity: new Date(session.lastActivity)
    }
  }

  /**
   * Extend session (reset activity timer)
   */
  extendSession(): boolean {
    const session = this.getSession()
    if (session && this.isSessionValid()) {
      this.updateActivity()
      return true
    }
    return false
  }

  /**
   * Get secure headers for API requests
   */
  getSecureHeaders(): Record<string, string> {
    const session = this.getSession()
    const headers: Record<string, string> = {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Client-Fingerprint': this.getClientFingerprint()
    }
    
    if (session) {
      headers['X-Session-ID'] = session.sessionId
    }
    
    return headers
  }

  /**
   * Initialize secure session service
   */
  initialize(): void {
    // Check for existing session
    const existingSession = this.retrieveSessionData()
    if (existingSession && this.isSessionValid()) {
      this.sessionData = existingSession
      this.startActivityTracking()
      console.log('🔐 Existing secure session restored')
    }
    
    // Listen for storage events (session cleared in another tab)
    window.addEventListener('storage', (e) => {
      if (e.key === SecureSessionService.SESSION_KEY && !e.newValue) {
        this.clearSession()
        window.dispatchEvent(new CustomEvent('sessionTimeout'))
      }
    })
    
    console.log('🔐 Secure session service initialized')
  }
}

export const secureSessionService = new SecureSessionService()
