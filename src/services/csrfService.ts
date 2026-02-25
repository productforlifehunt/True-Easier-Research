/**
 * CSRF (Cross-Site Request Forgery) Protection Service
 * Generates and validates CSRF tokens for form submissions
 */

interface CSRFToken {
  token: string
  timestamp: number
  sessionId: string
}

class CSRFService {
  private static readonly TOKEN_EXPIRY = 60 * 60 * 1000 // 1 hour
  private static readonly TOKEN_LENGTH = 32
  private tokens: Map<string, CSRFToken> = new Map()

  /**
   * Generate a cryptographically secure random string
   */
  private generateSecureToken(): string {
    const array = new Uint8Array(CSRFService.TOKEN_LENGTH)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Get current session identifier
   */
  private getSessionId(): string {
    // In a real application, this would be tied to the user's session
    // For now, we'll use a combination of user agent and timestamp
    const userAgent = navigator.userAgent
    const sessionStart = sessionStorage.getItem('csrf_session_start') || Date.now().toString()
    
    if (!sessionStorage.getItem('csrf_session_start')) {
      sessionStorage.setItem('csrf_session_start', sessionStart)
    }
    
    return btoa(`${userAgent}-${sessionStart}`).substring(0, 16)
  }

  /**
   * Clean up expired tokens
   */
  private cleanupExpiredTokens(): void {
    const now = Date.now()
    for (const [tokenId, tokenData] of this.tokens.entries()) {
      if (now - tokenData.timestamp > CSRFService.TOKEN_EXPIRY) {
        this.tokens.delete(tokenId)
      }
    }
  }

  /**
   * Generate a new CSRF token
   */
  generateToken(): string {
    this.cleanupExpiredTokens()
    
    const token = this.generateSecureToken()
    const sessionId = this.getSessionId()
    const timestamp = Date.now()
    
    const csrfToken: CSRFToken = {
      token,
      timestamp,
      sessionId
    }
    
    this.tokens.set(token, csrfToken)
    
    // Store in sessionStorage as backup
    sessionStorage.setItem(`csrf_token_${token}`, JSON.stringify(csrfToken))
    
    return token
  }

  /**
   * Validate a CSRF token
   */
  validateToken(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false
    }
    
    this.cleanupExpiredTokens()
    
    // Check in memory first
    let tokenData = this.tokens.get(token)
    
    // If not in memory, check sessionStorage
    if (!tokenData) {
      const storedToken = sessionStorage.getItem(`csrf_token_${token}`)
      if (storedToken) {
        try {
          tokenData = JSON.parse(storedToken)
        } catch {
          return false
        }
      }
    }
    
    if (!tokenData) {
      return false
    }
    
    const now = Date.now()
    const currentSessionId = this.getSessionId()
    
    // Check if token is expired
    if (now - tokenData.timestamp > CSRFService.TOKEN_EXPIRY) {
      this.tokens.delete(token)
      sessionStorage.removeItem(`csrf_token_${token}`)
      return false
    }
    
    // Check if session matches
    if (tokenData.sessionId !== currentSessionId) {
      this.tokens.delete(token)
      sessionStorage.removeItem(`csrf_token_${token}`)
      return false
    }
    
    return true
  }

  /**
   * Consume a CSRF token (one-time use)
   */
  consumeToken(token: string): boolean {
    const isValid = this.validateToken(token)
    
    if (isValid) {
      // Remove token after use
      this.tokens.delete(token)
      sessionStorage.removeItem(`csrf_token_${token}`)
    }
    
    return isValid
  }

  /**
   * Get CSRF token for forms (creates new token if none exists)
   */
  getTokenForForm(): string {
    // Check if we have a valid token in sessionStorage
    const sessionKeys = Object.keys(sessionStorage)
    const csrfKeys = sessionKeys.filter(key => key.startsWith('csrf_token_'))
    
    for (const key of csrfKeys) {
      const token = key.replace('csrf_token_', '')
      if (this.validateToken(token)) {
        return token
      }
    }
    
    // No valid token found, generate new one
    return this.generateToken()
  }

  /**
   * Add CSRF token to form data
   */
  addTokenToFormData(formData: FormData): FormData {
    const token = this.getTokenForForm()
    formData.append('csrf_token', token)
    return formData
  }

  /**
   * Add CSRF token to JSON data
   */
  addTokenToJsonData(data: Record<string, any>): Record<string, any> {
    const token = this.getTokenForForm()
    return {
      ...data,
      csrf_token: token
    }
  }

  /**
   * Validate CSRF token from request data
   */
  validateRequestToken(data: Record<string, any> | FormData): boolean {
    let token: string | null = null
    
    if (data instanceof FormData) {
      token = data.get('csrf_token') as string
    } else if (data && typeof data === 'object') {
      token = data.csrf_token as string
    }
    
    if (!token) {
      console.warn('🔒 CSRF token missing from request')
      return false
    }
    
    const isValid = this.consumeToken(token)
    
    if (!isValid) {
      console.warn('🔒 Invalid or expired CSRF token')
    }
    
    return isValid
  }

  /**
   * Create CSRF-protected form submission handler
   */
  createProtectedSubmitHandler<T>(
    handler: (data: T) => Promise<any>
  ): (data: T) => Promise<any> {
    return async (data: T) => {
      // Validate CSRF token
      if (!this.validateRequestToken(data as any)) {
        throw new Error('CSRF token validation failed. Please refresh the page and try again.')
      }
      
      // Remove CSRF token from data before processing
      if (data && typeof data === 'object') {
        const cleanData = { ...data }
        delete (cleanData as any).csrf_token
        return handler(cleanData as T)
      }
      
      return handler(data)
    }
  }

  /**
   * Get CSRF meta tag for HTML head
   */
  getMetaTag(): string {
    const token = this.getTokenForForm()
    return `<meta name="csrf-token" content="${token}">`
  }

  /**
   * Get CSRF token from meta tag
   */
  getTokenFromMeta(): string | null {
    const metaTag = document.querySelector('meta[name="csrf-token"]')
    return metaTag ? metaTag.getAttribute('content') : null
  }

  /**
   * Initialize CSRF protection for the application
   */
  initialize(): void {
    // Clean up any expired tokens on initialization
    this.cleanupExpiredTokens()
    
    // Set up periodic cleanup
    setInterval(() => {
      this.cleanupExpiredTokens()
    }, 5 * 60 * 1000) // Clean up every 5 minutes
    
    console.log('🔒 CSRF protection initialized')
  }

  /**
   * Reset all tokens (useful for logout)
   */
  resetTokens(): void {
    this.tokens.clear()
    
    // Clear from sessionStorage
    const sessionKeys = Object.keys(sessionStorage)
    const csrfKeys = sessionKeys.filter(key => key.startsWith('csrf_token_'))
    
    for (const key of csrfKeys) {
      sessionStorage.removeItem(key)
    }
    
    // Reset session
    sessionStorage.removeItem('csrf_session_start')
    
    console.log('🔒 CSRF tokens reset')
  }
}

export const csrfService = new CSRFService()
