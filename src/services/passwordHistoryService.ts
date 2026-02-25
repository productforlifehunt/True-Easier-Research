/**
 * Password History Service
 * Prevents password reuse by maintaining a history of password hashes
 */

interface PasswordHistoryEntry {
  hash: string
  timestamp: number
  userId: string
}

class PasswordHistoryService {
  private static readonly MAX_HISTORY_COUNT = 12 // Remember last 12 passwords
  private static readonly MIN_PASSWORD_AGE = 24 * 60 * 60 * 1000 // 24 hours minimum age
  
  /**
   * Simple hash function for passwords (in production, use bcrypt or similar)
   */
  private async hashPassword(password: string, salt?: string): Promise<string> {
    // Create a salt if not provided
    if (!salt) {
      const array = new Uint8Array(16)
      crypto.getRandomValues(array)
      salt = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
    }
    
    // Simple hash using Web Crypto API
    const encoder = new TextEncoder()
    const data = encoder.encode(password + salt)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    return `${salt}:${hashHex}`
  }

  /**
   * Verify password against hash
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const [salt, storedHash] = hash.split(':')
      const computedHash = await this.hashPassword(password, salt)
      return computedHash === hash
    } catch {
      return false
    }
  }

  /**
   * Get password history for a user
   */
  private getPasswordHistory(userId: string): PasswordHistoryEntry[] {
    try {
      const historyKey = `password_history_${userId}`
      const historyData = localStorage.getItem(historyKey)
      
      if (!historyData) {
        return []
      }
      
      const history = JSON.parse(historyData) as PasswordHistoryEntry[]
      
      // Clean up old entries (keep only MAX_HISTORY_COUNT)
      const sortedHistory = history
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, PasswordHistoryService.MAX_HISTORY_COUNT)
      
      return sortedHistory
    } catch {
      return []
    }
  }

  /**
   * Save password history for a user
   */
  private savePasswordHistory(userId: string, history: PasswordHistoryEntry[]): void {
    try {
      const historyKey = `password_history_${userId}`
      const sortedHistory = history
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, PasswordHistoryService.MAX_HISTORY_COUNT)
      
      localStorage.setItem(historyKey, JSON.stringify(sortedHistory))
    } catch (error) {
      console.error('Failed to save password history:', error)
    }
  }

  /**
   * Check if password was used recently
   */
  async isPasswordReused(userId: string, newPassword: string): Promise<{
    isReused: boolean
    message?: string
    lastUsed?: Date
  }> {
    try {
      const history = this.getPasswordHistory(userId)
      
      if (history.length === 0) {
        return { isReused: false }
      }
      
      // Check against each password in history
      for (const entry of history) {
        const isMatch = await this.verifyPassword(newPassword, entry.hash)
        if (isMatch) {
          const lastUsed = new Date(entry.timestamp)
          const daysSince = Math.floor((Date.now() - entry.timestamp) / (24 * 60 * 60 * 1000))
          
          return {
            isReused: true,
            message: `This password was used ${daysSince} day${daysSince !== 1 ? 's' : ''} ago. Please choose a different password.`,
            lastUsed
          }
        }
      }
      
      return { isReused: false }
    } catch (error) {
      console.error('Error checking password reuse:', error)
      return { isReused: false }
    }
  }

  /**
   * Add password to history
   */
  async addPasswordToHistory(userId: string, password: string): Promise<void> {
    try {
      const hash = await this.hashPassword(password)
      const history = this.getPasswordHistory(userId)
      
      const newEntry: PasswordHistoryEntry = {
        hash,
        timestamp: Date.now(),
        userId
      }
      
      // Add new entry to history
      history.unshift(newEntry)
      
      // Save updated history
      this.savePasswordHistory(userId, history)
      
      console.log(`📝 Password added to history for user ${userId}`)
    } catch (error) {
      console.error('Failed to add password to history:', error)
    }
  }

  /**
   * Check if user can change password (minimum age requirement)
   */
  canChangePassword(userId: string): {
    canChange: boolean
    message?: string
    nextChangeAllowed?: Date
  } {
    try {
      const history = this.getPasswordHistory(userId)
      
      if (history.length === 0) {
        return { canChange: true }
      }
      
      const lastPasswordChange = history[0].timestamp
      const timeSinceLastChange = Date.now() - lastPasswordChange
      
      if (timeSinceLastChange < PasswordHistoryService.MIN_PASSWORD_AGE) {
        const nextChangeAllowed = new Date(lastPasswordChange + PasswordHistoryService.MIN_PASSWORD_AGE)
        const hoursRemaining = Math.ceil((PasswordHistoryService.MIN_PASSWORD_AGE - timeSinceLastChange) / (60 * 60 * 1000))
        
        return {
          canChange: false,
          message: `Password can only be changed once every 24 hours. You can change it again in ${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}.`,
          nextChangeAllowed
        }
      }
      
      return { canChange: true }
    } catch {
      return { canChange: true }
    }
  }

  /**
   * Get password history summary
   */
  getPasswordHistorySummary(userId: string): {
    totalPasswords: number
    oldestPassword?: Date
    newestPassword?: Date
    canChangePassword: boolean
  } {
    const history = this.getPasswordHistory(userId)
    const changeCheck = this.canChangePassword(userId)
    
    if (history.length === 0) {
      return {
        totalPasswords: 0,
        canChangePassword: changeCheck.canChange
      }
    }
    
    const timestamps = history.map(entry => entry.timestamp).sort((a, b) => a - b)
    
    return {
      totalPasswords: history.length,
      oldestPassword: new Date(timestamps[0]),
      newestPassword: new Date(timestamps[timestamps.length - 1]),
      canChangePassword: changeCheck.canChange
    }
  }

  /**
   * Clear password history for a user (admin function)
   */
  clearPasswordHistory(userId: string): void {
    try {
      const historyKey = `password_history_${userId}`
      localStorage.removeItem(historyKey)
      console.log(`🗑️ Password history cleared for user ${userId}`)
    } catch (error) {
      console.error('Failed to clear password history:', error)
    }
  }

  /**
   * Validate new password against policy and history
   */
  async validateNewPassword(userId: string, newPassword: string, currentPassword?: string): Promise<{
    isValid: boolean
    errors: string[]
    warnings: string[]
  }> {
    const errors: string[] = []
    const warnings: string[] = []
    
    try {
      // Check if user can change password
      const changeCheck = this.canChangePassword(userId)
      if (!changeCheck.canChange) {
        errors.push(changeCheck.message || 'Cannot change password at this time')
      }
      
      // Check password strength (basic validation)
      if (newPassword.length < 8) {
        errors.push('Password must be at least 8 characters long')
      }
      
      if (!/(?=.*[a-z])/.test(newPassword)) {
        errors.push('Password must contain at least one lowercase letter')
      }
      
      if (!/(?=.*[A-Z])/.test(newPassword)) {
        errors.push('Password must contain at least one uppercase letter')
      }
      
      if (!/(?=.*\d)/.test(newPassword)) {
        errors.push('Password must contain at least one number')
      }
      
      if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(newPassword)) {
        errors.push('Password must contain at least one special character')
      }
      
      // Check if password is the same as current password
      if (currentPassword && newPassword === currentPassword) {
        errors.push('New password must be different from current password')
      }
      
      // Check password reuse
      const reuseCheck = await this.isPasswordReused(userId, newPassword)
      if (reuseCheck.isReused) {
        errors.push(reuseCheck.message || 'This password has been used recently')
      }
      
      // Check for common weak patterns
      const commonPatterns = [
        /(.)\1{3,}/, // Repeated characters
        /123456|654321|abcdef|qwerty/i, // Common sequences
        /password|admin|user|login/i // Common words
      ]
      
      for (const pattern of commonPatterns) {
        if (pattern.test(newPassword)) {
          warnings.push('Password contains common patterns that may be easily guessed')
          break
        }
      }
      
      // Check password entropy (simple check)
      const uniqueChars = new Set(newPassword.toLowerCase()).size
      if (uniqueChars < 6) {
        warnings.push('Password has low character diversity')
      }
      
    } catch (error) {
      errors.push('Password validation failed')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Create password change handler with history tracking
   */
  createPasswordChangeHandler(
    changePasswordFunction: (userId: string, newPassword: string) => Promise<any>
  ): (userId: string, newPassword: string, currentPassword?: string) => Promise<any> {
    return async (userId: string, newPassword: string, currentPassword?: string) => {
      // Validate new password
      const validation = await this.validateNewPassword(userId, newPassword, currentPassword)
      
      if (!validation.isValid) {
        throw new Error(validation.errors[0])
      }
      
      // Change password
      const result = await changePasswordFunction(userId, newPassword)
      
      // If successful, add to history
      if (result && !result.error) {
        await this.addPasswordToHistory(userId, newPassword)
      }
      
      return result
    }
  }
}

export const passwordHistoryService = new PasswordHistoryService()
