interface RateLimitEntry {
  count: number
  firstAttempt: number
  lastAttempt: number
}

interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  blockDurationMs: number
}

class RateLimitService {
  private attempts: Map<string, RateLimitEntry> = new Map()
  
  // Default configurations for different actions
  private configs: Record<string, RateLimitConfig> = {
    login: {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      blockDurationMs: 30 * 60 * 1000 // 30 minutes
    },
    signup: {
      maxAttempts: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
      blockDurationMs: 60 * 60 * 1000 // 1 hour
    },
    passwordReset: {
      maxAttempts: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
      blockDurationMs: 60 * 60 * 1000 // 1 hour
    },
    general: {
      maxAttempts: 10,
      windowMs: 60 * 1000, // 1 minute
      blockDurationMs: 5 * 60 * 1000 // 5 minutes
    }
  }

  private getClientIdentifier(): string {
    // In production, you'd use IP address + user agent fingerprinting
    // For now, we'll use a combination of available browser data
    const userAgent = navigator.userAgent
    const language = navigator.language
    const platform = navigator.platform
    const screenResolution = `${screen.width}x${screen.height}`
    
    // Create a simple fingerprint
    const fingerprint = btoa(`${userAgent}-${language}-${platform}-${screenResolution}`)
    return fingerprint.substring(0, 32) // Limit length
  }

  private cleanupOldEntries(): void {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours
    
    for (const [key, entry] of this.attempts.entries()) {
      if (now - entry.lastAttempt > maxAge) {
        this.attempts.delete(key)
      }
    }
  }

  private getKey(action: string, identifier?: string): string {
    const clientId = identifier || this.getClientIdentifier()
    return `${action}:${clientId}`
  }

  isBlocked(action: string, identifier?: string): boolean {
    this.cleanupOldEntries()
    
    const config = this.configs[action] || this.configs.general
    const key = this.getKey(action, identifier)
    const entry = this.attempts.get(key)
    
    if (!entry) {
      return false
    }
    
    const now = Date.now()
    
    // Check if still within block duration
    if (entry.count >= config.maxAttempts) {
      const timeSinceLastAttempt = now - entry.lastAttempt
      if (timeSinceLastAttempt < config.blockDurationMs) {
        return true
      } else {
        // Block period expired, reset
        this.attempts.delete(key)
        return false
      }
    }
    
    // Check if window has expired
    const windowExpired = now - entry.firstAttempt > config.windowMs
    if (windowExpired) {
      this.attempts.delete(key)
      return false
    }
    
    return false
  }

  recordAttempt(action: string, identifier?: string): void {
    this.cleanupOldEntries()
    
    const key = this.getKey(action, identifier)
    const now = Date.now()
    const entry = this.attempts.get(key)
    
    if (entry) {
      const config = this.configs[action] || this.configs.general
      const windowExpired = now - entry.firstAttempt > config.windowMs
      
      if (windowExpired) {
        // Start new window
        this.attempts.set(key, {
          count: 1,
          firstAttempt: now,
          lastAttempt: now
        })
      } else {
        // Increment within current window
        entry.count++
        entry.lastAttempt = now
        this.attempts.set(key, entry)
      }
    } else {
      // First attempt
      this.attempts.set(key, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now
      })
    }
  }

  getAttemptCount(action: string, identifier?: string): number {
    const key = this.getKey(action, identifier)
    const entry = this.attempts.get(key)
    
    if (!entry) {
      return 0
    }
    
    const now = Date.now()
    const config = this.configs[action] || this.configs.general
    const windowExpired = now - entry.firstAttempt > config.windowMs
    
    if (windowExpired) {
      this.attempts.delete(key)
      return 0
    }
    
    return entry.count
  }

  getRemainingAttempts(action: string, identifier?: string): number {
    const config = this.configs[action] || this.configs.general
    const currentCount = this.getAttemptCount(action, identifier)
    return Math.max(0, config.maxAttempts - currentCount)
  }

  getTimeUntilReset(action: string, identifier?: string): number {
    const key = this.getKey(action, identifier)
    const entry = this.attempts.get(key)
    
    if (!entry) {
      return 0
    }
    
    const now = Date.now()
    const config = this.configs[action] || this.configs.general
    
    if (entry.count >= config.maxAttempts) {
      // Currently blocked
      const timeUntilUnblock = config.blockDurationMs - (now - entry.lastAttempt)
      return Math.max(0, timeUntilUnblock)
    } else {
      // Not blocked, return time until window resets
      const timeUntilWindowReset = config.windowMs - (now - entry.firstAttempt)
      return Math.max(0, timeUntilWindowReset)
    }
  }

  reset(action: string, identifier?: string): void {
    const key = this.getKey(action, identifier)
    this.attempts.delete(key)
  }

  resetAll(): void {
    this.attempts.clear()
  }

  getBlockMessage(action: string, identifier?: string): string {
    const timeUntilReset = this.getTimeUntilReset(action, identifier)
    const minutes = Math.ceil(timeUntilReset / (60 * 1000))
    
    const actionMessages = {
      login: `Too many failed login attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`,
      signup: `Too many registration attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`,
      passwordReset: `Too many password reset requests. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`,
      general: `Too many attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`
    }
    
    return actionMessages[action] || actionMessages.general
  }

  // Method to check if an action should be rate limited
  checkRateLimit(action: string, identifier?: string): { 
    allowed: boolean
    message?: string
    remainingAttempts?: number
    timeUntilReset?: number
  } {
    if (this.isBlocked(action, identifier)) {
      return {
        allowed: false,
        message: this.getBlockMessage(action, identifier),
        remainingAttempts: 0,
        timeUntilReset: this.getTimeUntilReset(action, identifier)
      }
    }
    
    return {
      allowed: true,
      remainingAttempts: this.getRemainingAttempts(action, identifier),
      timeUntilReset: this.getTimeUntilReset(action, identifier)
    }
  }

  // Update configuration for specific actions
  updateConfig(action: string, config: Partial<RateLimitConfig>): void {
    this.configs[action] = {
      ...this.configs[action],
      ...config
    }
  }
}

export const rateLimitService = new RateLimitService()
