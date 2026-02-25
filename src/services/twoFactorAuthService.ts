/**
 * Two-Factor Authentication Service
 * Provides TOTP (Time-based One-Time Password) functionality
 */

interface TwoFactorSetup {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

interface TwoFactorVerification {
  isValid: boolean
  error?: string
}

class TwoFactorAuthService {
  private static readonly BACKUP_CODES_COUNT = 10
  private static readonly CODE_LENGTH = 6
  private static readonly TIME_WINDOW = 30 // seconds
  private static readonly TOLERANCE = 1 // allow 1 time window before/after

  /**
   * Generate a random secret for TOTP
   */
  private generateSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let secret = ''
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    
    for (let i = 0; i < 32; i++) {
      secret += chars[array[i] % chars.length]
    }
    
    return secret
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = []
    
    for (let i = 0; i < TwoFactorAuthService.BACKUP_CODES_COUNT; i++) {
      const array = new Uint8Array(4)
      crypto.getRandomValues(array)
      const code = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
      codes.push(code.toUpperCase())
    }
    
    return codes
  }

  /**
   * Generate TOTP code from secret and time
   */
  private generateTOTP(secret: string, time?: number): string {
    // This is a simplified TOTP implementation
    // In production, use a proper TOTP library like 'otplib'
    
    const timeStep = Math.floor((time || Date.now()) / 1000 / TwoFactorAuthService.TIME_WINDOW)
    
    // Simple hash function (in production, use HMAC-SHA1)
    let hash = 0
    const input = secret + timeStep.toString()
    
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    // Extract 6-digit code
    const code = Math.abs(hash) % Math.pow(10, TwoFactorAuthService.CODE_LENGTH)
    return code.toString().padStart(TwoFactorAuthService.CODE_LENGTH, '0')
  }

  /**
   * Generate QR code URL for authenticator apps
   */
  private generateQRCodeUrl(secret: string, email: string, issuer: string = '2CareConnector'): string {
    const label = encodeURIComponent(`${issuer}:${email}`)
    const params = new URLSearchParams({
      secret,
      issuer,
      algorithm: 'SHA1',
      digits: TwoFactorAuthService.CODE_LENGTH.toString(),
      period: TwoFactorAuthService.TIME_WINDOW.toString()
    })
    
    const otpUrl = `otpauth://totp/${label}?${params.toString()}`
    
    // Generate QR code URL using a QR code service
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpUrl)}`
  }

  /**
   * Setup two-factor authentication for a user
   */
  async setupTwoFactor(email: string): Promise<TwoFactorSetup> {
    try {
      const secret = this.generateSecret()
      const qrCodeUrl = this.generateQRCodeUrl(secret, email)
      const backupCodes = this.generateBackupCodes()
      
      // Store setup data temporarily (in production, store in secure database)
      const setupData = {
        secret,
        backupCodes,
        email,
        timestamp: Date.now()
      }
      
      sessionStorage.setItem('2fa_setup', JSON.stringify(setupData))
      
      return {
        secret,
        qrCodeUrl,
        backupCodes
      }
    } catch (error) {
      throw new Error('Failed to setup two-factor authentication')
    }
  }

  /**
   * Verify TOTP code during setup
   */
  async verifySetupCode(code: string): Promise<TwoFactorVerification> {
    try {
      const setupData = sessionStorage.getItem('2fa_setup')
      if (!setupData) {
        return { isValid: false, error: 'No setup data found. Please restart the setup process.' }
      }
      
      const { secret, timestamp } = JSON.parse(setupData)
      
      // Check if setup data is not too old (5 minutes)
      if (Date.now() - timestamp > 5 * 60 * 1000) {
        sessionStorage.removeItem('2fa_setup')
        return { isValid: false, error: 'Setup session expired. Please restart the setup process.' }
      }
      
      const isValid = this.verifyTOTPCode(code, secret)
      
      if (isValid) {
        // In production, save the secret and backup codes to user's profile in database
        console.log('✅ 2FA setup verified successfully')
        
        // Store 2FA enabled status
        localStorage.setItem('2fa_enabled', 'true')
        localStorage.setItem('2fa_secret', secret)
        
        // Clear setup data
        sessionStorage.removeItem('2fa_setup')
      }
      
      return { isValid }
    } catch (error) {
      return { isValid: false, error: 'Verification failed. Please try again.' }
    }
  }

  /**
   * Verify TOTP code
   */
  private verifyTOTPCode(code: string, secret: string): boolean {
    const currentTime = Date.now()
    
    // Check current time window and adjacent windows for clock drift tolerance
    for (let i = -TwoFactorAuthService.TOLERANCE; i <= TwoFactorAuthService.TOLERANCE; i++) {
      const timeOffset = i * TwoFactorAuthService.TIME_WINDOW * 1000
      const expectedCode = this.generateTOTP(secret, currentTime + timeOffset)
      
      if (code === expectedCode) {
        return true
      }
    }
    
    return false
  }

  /**
   * Verify backup code
   */
  private verifyBackupCode(code: string): boolean {
    // In production, check against stored backup codes in database
    // and mark the code as used
    const setupData = sessionStorage.getItem('2fa_setup')
    if (setupData) {
      const { backupCodes } = JSON.parse(setupData)
      return backupCodes.includes(code.toUpperCase())
    }
    
    return false
  }

  /**
   * Verify 2FA code (TOTP or backup code)
   */
  async verifyCode(code: string): Promise<TwoFactorVerification> {
    try {
      if (!code || code.length < 6) {
        return { isValid: false, error: 'Please enter a valid code' }
      }
      
      const secret = localStorage.getItem('2fa_secret')
      if (!secret) {
        return { isValid: false, error: '2FA not set up for this account' }
      }
      
      // Try TOTP verification first
      if (code.length === TwoFactorAuthService.CODE_LENGTH) {
        const isValidTOTP = this.verifyTOTPCode(code, secret)
        if (isValidTOTP) {
          return { isValid: true }
        }
      }
      
      // Try backup code verification
      if (code.length === 8) {
        const isValidBackup = this.verifyBackupCode(code)
        if (isValidBackup) {
          return { isValid: true }
        }
      }
      
      return { isValid: false, error: 'Invalid code. Please try again.' }
    } catch (error) {
      return { isValid: false, error: 'Verification failed. Please try again.' }
    }
  }

  /**
   * Check if 2FA is enabled for current user
   */
  isTwoFactorEnabled(): boolean {
    return localStorage.getItem('2fa_enabled') === 'true'
  }

  /**
   * Disable 2FA
   */
  async disableTwoFactor(): Promise<boolean> {
    try {
      localStorage.removeItem('2fa_enabled')
      localStorage.removeItem('2fa_secret')
      sessionStorage.removeItem('2fa_setup')
      
      console.log('🔒 2FA disabled')
      return true
    } catch (error) {
      console.error('Failed to disable 2FA:', error)
      return false
    }
  }

  /**
   * Generate new backup codes
   */
  async generateNewBackupCodes(): Promise<string[]> {
    try {
      const newCodes = this.generateBackupCodes()
      
      // In production, store these in the database and invalidate old codes
      console.log('🔑 New backup codes generated')
      
      return newCodes
    } catch (error) {
      throw new Error('Failed to generate new backup codes')
    }
  }

  /**
   * Get 2FA status and info
   */
  getTwoFactorStatus(): {
    enabled: boolean
    setupInProgress: boolean
    backupCodesAvailable: boolean
  } {
    const enabled = this.isTwoFactorEnabled()
    const setupInProgress = !!sessionStorage.getItem('2fa_setup')
    
    return {
      enabled,
      setupInProgress,
      backupCodesAvailable: enabled // In production, check actual backup codes count
    }
  }

  /**
   * Create 2FA-protected authentication wrapper
   */
  createTwoFactorProtectedAuth<T extends any[]>(
    authFunction: (...args: T) => Promise<any>
  ): (...args: T) => Promise<any> {
    return async (...args: T) => {
      // First, perform regular authentication
      const authResult = await authFunction(...args)
      
      if (authResult.user && this.isTwoFactorEnabled()) {
        // If 2FA is enabled, require 2FA verification
        return {
          ...authResult,
          requiresTwoFactor: true,
          message: 'Please enter your two-factor authentication code'
        }
      }
      
      return authResult
    }
  }

  /**
   * Complete 2FA verification after initial authentication
   */
  async completeTwoFactorAuth(code: string, pendingAuthResult: any): Promise<any> {
    const verification = await this.verifyCode(code)
    
    if (verification.isValid) {
      return {
        ...pendingAuthResult,
        requiresTwoFactor: false,
        twoFactorVerified: true
      }
    } else {
      return {
        user: null,
        error: verification.error || 'Invalid two-factor authentication code'
      }
    }
  }
}

export const twoFactorAuthService = new TwoFactorAuthService()
