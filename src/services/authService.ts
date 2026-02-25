import { supabase } from '../lib/supabase'
import { securityAuditService } from './securityAuditService'
import { rateLimitService } from './rateLimitService'

export interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  user_type?: 'client' | 'provider' | 'caregiver'
  profile_image_url?: string
  role?: string
  full_name?: string
  created_at?: string
}

class AuthService {
  private currentUser: User | null = null

  setUser(user: User | null) {
    this.currentUser = user
  }

  getUser(): User | null {
    return this.currentUser
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        this.currentUser = null
        return null
      }

      // Get user profile from database
      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error) {
        this.currentUser = null
        return null
      }

      this.currentUser = {
        id: userProfile.id,
        email: userProfile.email,
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        user_type: userProfile.role || 'client',
        profile_image_url: userProfile.avatar_url,
        role: userProfile.role,
        full_name: userProfile.full_name
      }

      return this.currentUser
    } catch (error) {
      this.currentUser = null
      return null
    }
  }

  async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      // Temporarily disable rate limiting for dashboard testing
      // const rateLimitCheck = rateLimitService.checkRateLimit('login', email)
      // if (!rateLimitCheck.allowed) {
      //   await securityAuditService.logFailedLogin(email, 'Rate limit exceeded')
      //   return { user: null, error: rateLimitCheck.message || 'Too many login attempts. Please try again later.' }
      // }

      // const isLocked = await securityAuditService.isAccountLocked(email)
      // if (isLocked) {
      //   rateLimitService.recordAttempt('login', email)
      //   await securityAuditService.logFailedLogin(email, 'Account locked due to multiple failed attempts')
      //   return { user: null, error: 'Account temporarily locked due to multiple failed login attempts. Please try again later or reset your password.' }
      // }

      // Simple direct authentication without timeout complications
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        // Record failed attempt for rate limiting
        rateLimitService.recordAttempt('login', email)
        // Log failed login attempt
        await securityAuditService.logFailedLogin(email, error.message)
        return { user: null, error: error.message }
      }

      if (data.user) {
        const user = await this.getCurrentUser()
        if (user) {
          // Reset rate limiting on successful login
          rateLimitService.reset('login', email)
          // Log successful login
          await securityAuditService.logSuccessfulLogin(user.id, { email })
        }
        return { user, error: null }
      }

      // Record failed attempt for rate limiting
      rateLimitService.recordAttempt('login', email)
      // Log failed login attempt
      await securityAuditService.logFailedLogin(email, 'No user data returned')
      return { user: null, error: 'Login failed' }
    } catch (error) {
      // Record failed attempt for rate limiting
      rateLimitService.recordAttempt('login', email)
      // Log failed login attempt
      await securityAuditService.logFailedLogin(email, 'Unexpected error during login')
      return { user: null, error: 'An unexpected error occurred' }
    }
  }

  async signUp(userData: {
    email: string
    password: string
    first_name: string
    last_name: string
    user_type: 'client' | 'provider' | 'caregiver'
  }): Promise<{ user: User | null; error: string | null; requiresVerification?: boolean }> {
    try {
      // Check rate limiting for signup
      const rateLimitCheck = rateLimitService.checkRateLimit('signup', userData.email)
      if (!rateLimitCheck.allowed) {
        await securityAuditService.logSecurityEvent({
          event_type: 'suspicious_activity',
          severity: 'medium',
          details: {
            email: userData.email,
            reason: 'Signup rate limit exceeded'
          }
        })
        return { user: null, error: rateLimitCheck.message || 'Too many registration attempts. Please try again later.' }
      }

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            user_type: userData.user_type
          },
          emailRedirectTo: `${window.location.origin}/email-verified`
        }
      })

      if (error) {
        // Record failed signup attempt for rate limiting
        rateLimitService.recordAttempt('signup', userData.email)
        await securityAuditService.logSecurityEvent({
          event_type: 'failed_login',
          severity: 'medium',
          details: {
            email: userData.email,
            reason: 'Sign up failed',
            error: error.message
          }
        })
        return { user: null, error: error.message }
      }

      if (data.user) {
        // Check if email verification is required
        if (!data.user.email_confirmed_at) {
          return {
            user: null,
            error: null,
            requiresVerification: true
          }
        }

        // Create user profile in the database
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            full_name: `${userData.first_name} ${userData.last_name}`,
            role: userData.user_type,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (profileError) {
          await securityAuditService.logSecurityEvent({
            user_id: data.user.id,
            event_type: 'suspicious_activity',
            severity: 'high',
            details: {
              reason: 'Failed to create user profile',
              error: profileError.message
            }
          })
          return { user: null, error: 'Failed to create user profile' }
        }

        const user = await this.getCurrentUser()
        if (user) {
          await securityAuditService.logSuccessfulLogin(user.id, {
            email: userData.email,
            registrationFlow: true
          })
        }
        return { user, error: null }
      }

      return { user: null, error: 'Registration failed' }
    } catch (error) {
      await securityAuditService.logSecurityEvent({
        event_type: 'suspicious_activity',
        severity: 'high',
        details: {
          email: userData.email,
          reason: 'Unexpected error during registration',
          error: error instanceof Error ? error.message : String(error)
        }
      })
      return { user: null, error: 'An unexpected error occurred' }
    }
  }

  async signOut(reason: 'manual' | 'timeout' | 'forced' = 'manual'): Promise<{ error: string | null }> {
    try {
      const currentUser = this.currentUser

      const { error } = await supabase.auth.signOut()

      if (currentUser) {
        // Log logout event
        await securityAuditService.logLogout(currentUser.id, reason)
      }

      this.currentUser = null

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      // Check rate limiting for password reset
      const rateLimitCheck = rateLimitService.checkRateLimit('passwordReset', email)
      if (!rateLimitCheck.allowed) {
        await securityAuditService.logPasswordReset(email, {
          success: false,
          error: 'Rate limit exceeded'
        })
        return { error: rateLimitCheck.message || 'Too many password reset requests. Please try again later.' }
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        // Record failed password reset attempt for rate limiting
        rateLimitService.recordAttempt('passwordReset', email)
        await securityAuditService.logPasswordReset(email, { success: false, error: error.message })
        return { error: error.message }
      }

      // Log successful password reset request (don't reset rate limit until password is actually changed)
      await securityAuditService.logPasswordReset(email, { success: true })
      return { error: null }
    } catch (error) {
      // Record failed password reset attempt for rate limiting
      rateLimitService.recordAttempt('passwordReset', email)
      await securityAuditService.logPasswordReset(email, { success: false, error: 'Unexpected error' })
      return { error: 'An unexpected error occurred' }
    }
  }

  async updatePassword(password: string): Promise<{ error: string | null }> {
    try {
      const currentUser = this.currentUser

      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        if (currentUser) {
          await securityAuditService.logPasswordChange(currentUser.id, { success: false, error: error.message })
        }
        return { error: error.message }
      }

      if (currentUser) {
        // Log successful password change
        await securityAuditService.logPasswordChange(currentUser.id, { success: true })
      }

      return { error: null }
    } catch (error) {
      if (this.currentUser) {
        await securityAuditService.logPasswordChange(this.currentUser.id, { success: false, error: 'Unexpected error' })
      }
      return { error: 'An unexpected error occurred' }
    }
  }
}

export const authService = new AuthService()
