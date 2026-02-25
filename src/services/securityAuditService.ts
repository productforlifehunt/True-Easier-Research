import { supabase } from '../lib/supabase'

export interface SecurityEvent {
  id?: string
  user_id?: string
  event_type: 'login' | 'logout' | 'failed_login' | 'password_reset' | 'password_change' | 'session_timeout' | 'suspicious_activity' | 'account_locked'
  ip_address?: string
  user_agent?: string
  details?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
  created_at?: string
}

class SecurityAuditService {
  private getUserIP = async (): Promise<string> => {
    try {
      // In production, you'd use a proper IP detection service
      // For now, we'll use a placeholder
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip || 'unknown'
    } catch (error) {
      console.warn('Could not detect IP address:', error)
      return 'unknown'
    }
  }

  private getUserAgent = (): string => {
    return navigator.userAgent || 'unknown'
  }

  async logSecurityEvent(event: Omit<SecurityEvent, 'ip_address' | 'user_agent' | 'created_at'>): Promise<void> {
    try {
      const ip_address = await this.getUserIP()
      const user_agent = this.getUserAgent()
      
      const securityEvent: SecurityEvent = {
        ...event,
        ip_address,
        user_agent,
        created_at: new Date().toISOString()
      }

      console.log('🔐 Security Event:', securityEvent.event_type, securityEvent.severity)

      // Try to log to database, but don't fail if table doesn't exist
      try {
        const { error } = await supabase
          
          .from('security_audit_log')
          .insert(securityEvent)

        if (error) {
          // Only log to console, don't throw error
          console.warn('Security audit log table not available, logging to console only:', securityEvent)
        }
      } catch (dbError) {
        // Database table doesn't exist, just log to console
        console.warn('Security audit log table not available, logging to console only:', securityEvent)
      }

      // Additional alerting for high-severity events
      if (securityEvent.severity === 'critical') {
        await this.handleCriticalSecurityEvent(securityEvent)
      }

    } catch (error) {
      console.error('Error logging security event:', error)
    }
  }

  private async handleCriticalSecurityEvent(event: SecurityEvent): Promise<void> {
    // In production, this would trigger alerts, notifications, etc.
    console.error('🚨 CRITICAL SECURITY EVENT DETECTED:', event)
    
    // Could implement:
    // - Email alerts to security team
    // - Slack/Discord notifications
    // - Automatic account locking
    // - Rate limiting
    // - IP blocking
  }

  async logSuccessfulLogin(userId: string, details?: Record<string, any>): Promise<void> {
    await this.logSecurityEvent({
      user_id: userId,
      event_type: 'login',
      severity: 'low',
      details: {
        timestamp: new Date().toISOString(),
        ...details
      }
    })
  }

  async logFailedLogin(email?: string, reason?: string, details?: Record<string, any>): Promise<void> {
    await this.logSecurityEvent({
      event_type: 'failed_login',
      severity: 'medium',
      details: {
        email: email || 'unknown',
        reason: reason || 'unknown',
        timestamp: new Date().toISOString(),
        ...details
      }
    })
  }

  async logLogout(userId: string, reason: 'manual' | 'timeout' | 'forced' = 'manual'): Promise<void> {
    await this.logSecurityEvent({
      user_id: userId,
      event_type: 'logout',
      severity: 'low',
      details: {
        reason,
        timestamp: new Date().toISOString()
      }
    })
  }

  async logPasswordReset(email: string, details?: Record<string, any>): Promise<void> {
    await this.logSecurityEvent({
      event_type: 'password_reset',
      severity: 'medium',
      details: {
        email,
        timestamp: new Date().toISOString(),
        ...details
      }
    })
  }

  async logPasswordChange(userId: string, details?: Record<string, any>): Promise<void> {
    await this.logSecurityEvent({
      user_id: userId,
      event_type: 'password_change',
      severity: 'medium',
      details: {
        timestamp: new Date().toISOString(),
        ...details
      }
    })
  }

  async logSessionTimeout(userId: string, sessionDuration?: number): Promise<void> {
    await this.logSecurityEvent({
      user_id: userId,
      event_type: 'session_timeout',
      severity: 'low',
      details: {
        sessionDuration,
        timestamp: new Date().toISOString()
      }
    })
  }

  async logSuspiciousActivity(userId?: string, activityType?: string, details?: Record<string, any>): Promise<void> {
    await this.logSecurityEvent({
      user_id: userId,
      event_type: 'suspicious_activity',
      severity: 'high',
      details: {
        activityType,
        timestamp: new Date().toISOString(),
        ...details
      }
    })
  }

  async logAccountLocked(userId: string, reason: string, details?: Record<string, any>): Promise<void> {
    await this.logSecurityEvent({
      user_id: userId,
      event_type: 'account_locked',
      severity: 'critical',
      details: {
        reason,
        timestamp: new Date().toISOString(),
        ...details
      }
    })
  }

  async getSecurityEvents(userId?: string, limit: number = 50): Promise<SecurityEvent[]> {
    try {
      let query = supabase
        
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) {
        console.warn('Security audit log table not available')
        return []
      }

      return data || []
    } catch (error) {
      console.warn('Security audit log table not available')
      return []
    }
  }

  async getFailedLoginAttempts(email?: string, timeWindow: number = 3600000): Promise<SecurityEvent[]> {
    try {
      const since = new Date(Date.now() - timeWindow).toISOString()
      
      let query = supabase
        
        .from('security_audit_log')
        .select('*')
        .eq('event_type', 'failed_login')
        .gte('created_at', since)
        .order('created_at', { ascending: false })

      if (email) {
        query = query.contains('details', { email })
      }

      const { data, error } = await query

      if (error) {
        console.warn('Security audit log table not available')
        return []
      }

      return data || []
    } catch (error) {
      console.warn('Security audit log table not available')
      return []
    }
  }

  async isAccountLocked(email: string): Promise<boolean> {
    try {
      // Check for recent failed login attempts (last hour)
      const failedAttempts = await this.getFailedLoginAttempts(email, 3600000)
      
      // Lock account after 5 failed attempts in 1 hour
      if (failedAttempts.length >= 5) {
        console.warn(`🔐 Account potentially locked due to ${failedAttempts.length} failed attempts:`, email)
        return true
      }

      return false
    } catch (error) {
      console.warn('Account lock check skipped - security audit log not available')
      return false
    }
  }
}

export const securityAuditService = new SecurityAuditService()
