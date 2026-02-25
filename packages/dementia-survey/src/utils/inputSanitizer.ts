/**
 * Input sanitization utilities to prevent XSS attacks and ensure data integrity
 */

// HTML entities to escape
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
}

// SQL injection patterns to detect
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
  /(--|\/\*|\*\/|;|'|"|`)/g,
  /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi,
  /(\bOR\b|\bAND\b)\s+['"].*['"].*=/gi
]

// XSS patterns to detect
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<img[^>]+src[^>]*>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /<link[^>]*>/gi,
  /<meta[^>]*>/gi
]

// Path traversal patterns
const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//g,
  /\.\.\\/g,
  /%2e%2e%2f/gi,
  /%2e%2e%5c/gi,
  /\.\.%2f/gi,
  /\.\.%5c/gi
]

export class InputSanitizer {
  /**
   * Escape HTML entities to prevent XSS
   */
  static escapeHtml(input: string): string {
    if (typeof input !== 'string') {
      return String(input)
    }
    
    return input.replace(/[&<>"'`=\/]/g, (match) => HTML_ENTITIES[match] || match)
  }

  /**
   * Remove HTML tags completely
   */
  static stripHtml(input: string): string {
    if (typeof input !== 'string') {
      return String(input)
    }
    
    return input.replace(/<[^>]*>/g, '')
  }

  /**
   * Sanitize email input
   */
  static sanitizeEmail(email: string): string {
    if (typeof email !== 'string') {
      return ''
    }
    
    // Remove whitespace and convert to lowercase
    let sanitized = email.trim().toLowerCase()
    
    // Remove any HTML
    sanitized = this.stripHtml(sanitized)
    
    // Basic email validation pattern
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    
    if (!emailPattern.test(sanitized)) {
      throw new Error('Invalid email format')
    }
    
    return sanitized
  }

  /**
   * Sanitize name input (first name, last name)
   */
  static sanitizeName(name: string): string {
    if (typeof name !== 'string') {
      return ''
    }
    
    // Remove HTML and trim
    let sanitized = this.stripHtml(name.trim())
    
    // Allow only letters, spaces, hyphens, and apostrophes
    sanitized = sanitized.replace(/[^a-zA-Z\s\-']/g, '')
    
    // Limit length
    if (sanitized.length > 50) {
      sanitized = sanitized.substring(0, 50)
    }
    
    // Ensure it's not empty after sanitization
    if (sanitized.length === 0) {
      throw new Error('Name cannot be empty')
    }
    
    return sanitized
  }

  /**
   * Sanitize general text input
   */
  static sanitizeText(text: string, maxLength: number = 1000): string {
    if (typeof text !== 'string') {
      return ''
    }
    
    // Remove HTML and trim
    let sanitized = this.stripHtml(text.trim())
    
    // Limit length
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength)
    }
    
    return sanitized
  }

  /**
   * Detect potential SQL injection attempts
   */
  static detectSqlInjection(input: string): boolean {
    if (typeof input !== 'string') {
      return false
    }
    
    return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input))
  }

  /**
   * Detect potential XSS attempts
   */
  static detectXss(input: string): boolean {
    if (typeof input !== 'string') {
      return false
    }
    
    return XSS_PATTERNS.some(pattern => pattern.test(input))
  }

  /**
   * Detect path traversal attempts
   */
  static detectPathTraversal(input: string): boolean {
    if (typeof input !== 'string') {
      return false
    }
    
    return PATH_TRAVERSAL_PATTERNS.some(pattern => pattern.test(input))
  }

  /**
   * Comprehensive security check for malicious input
   */
  static detectMaliciousInput(input: string): {
    isMalicious: boolean
    threats: string[]
  } {
    const threats: string[] = []
    
    if (this.detectSqlInjection(input)) {
      threats.push('SQL Injection')
    }
    
    if (this.detectXss(input)) {
      threats.push('XSS')
    }
    
    if (this.detectPathTraversal(input)) {
      threats.push('Path Traversal')
    }
    
    return {
      isMalicious: threats.length > 0,
      threats
    }
  }

  /**
   * Sanitize form data object
   */
  static sanitizeFormData(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        // Check for malicious input
        const securityCheck = this.detectMaliciousInput(value)
        if (securityCheck.isMalicious) {
          throw new Error(`Potentially malicious input detected: ${securityCheck.threats.join(', ')}`)
        }
        
        // Sanitize based on field type
        if (key.toLowerCase().includes('email')) {
          sanitized[key] = this.sanitizeEmail(value)
        } else if (key.toLowerCase().includes('name')) {
          sanitized[key] = this.sanitizeName(value)
        } else {
          sanitized[key] = this.sanitizeText(value)
        }
      } else {
        sanitized[key] = value
      }
    }
    
    return sanitized
  }

  /**
   * Validate password strength and sanitize
   */
  static validatePassword(password: string): {
    isValid: boolean
    errors: string[]
    sanitized: string
  } {
    const errors: string[] = []
    
    if (typeof password !== 'string') {
      return {
        isValid: false,
        errors: ['Password must be a string'],
        sanitized: ''
      }
    }
    
    // Don't strip HTML from passwords as they might be intentional special characters
    // But check for obvious malicious patterns
    const securityCheck = this.detectMaliciousInput(password)
    if (securityCheck.isMalicious) {
      errors.push(`Password contains potentially malicious content: ${securityCheck.threats.join(', ')}`)
    }
    
    // Length check
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    
    if (password.length > 128) {
      errors.push('Password must be less than 128 characters long')
    }
    
    // Complexity checks
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: password // Don't modify passwords
    }
  }
}
