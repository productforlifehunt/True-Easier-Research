/**
 * Input sanitization utilities for security and data integrity
 */

// HTML entity encoding map
const HTML_ENTITIES: { [key: string]: string } = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
}

/**
 * Sanitize HTML content by escaping dangerous characters
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input.replace(/[&<>"'/]/g, (char) => HTML_ENTITIES[char] || char)
}

/**
 * Sanitize text input by removing/escaping dangerous characters
 */
export function sanitizeText(input: string, options: {
  maxLength?: number
  allowNewlines?: boolean
  allowSpecialChars?: boolean
} = {}): string {
  if (typeof input !== 'string') return ''
  
  let sanitized = input.trim()
  
  // Remove null bytes and control characters
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  
  // Handle newlines
  if (!options.allowNewlines) {
    sanitized = sanitized.replace(/[\r\n]/g, ' ')
  }
  
  // Handle special characters
  if (!options.allowSpecialChars) {
    // Allow basic punctuation but remove potentially dangerous chars
    sanitized = sanitized.replace(/[^\w\s\-.,!?@#$%^&*()+=[\]{}|;:'"<>]/g, '')
  }
  
  // Limit length
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength)
  }
  
  return sanitized
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(input: string): string {
  if (typeof input !== 'string') return ''
  
  // Basic email sanitization
  const sanitized = input.trim().toLowerCase()
  
  // Remove dangerous characters but keep email-valid ones
  return sanitized.replace(/[^\w@.-]/g, '')
}

/**
 * Sanitize URL input
 */
export function sanitizeUrl(input: string): string {
  if (typeof input !== 'string') return ''
  
  const sanitized = input.trim()
  
  // Only allow http/https URLs
  if (!sanitized.match(/^https?:\/\//)) {
    return ''
  }
  
  // Remove dangerous characters
  return sanitized.replace(/[<>"']/g, '')
}

/**
 * Sanitize phone number input
 */
export function sanitizePhone(input: string): string {
  if (typeof input !== 'string') return ''
  
  // Keep only digits, spaces, hyphens, parentheses, and plus sign
  return input.replace(/[^\d\s\-()+ ]/g, '').trim()
}

/**
 * Sanitize search query input
 */
export function sanitizeSearchQuery(input: string): string {
  if (typeof input !== 'string') return ''
  
  return sanitizeText(input, {
    maxLength: 100,
    allowNewlines: false,
    allowSpecialChars: false
  })
}

/**
 * Sanitize form data object
 */
export function sanitizeFormData<T extends Record<string, any>>(
  data: T,
  fieldRules: Partial<Record<keyof T, {
    type: 'text' | 'email' | 'url' | 'phone' | 'html' | 'search'
    maxLength?: number
    allowNewlines?: boolean
    allowSpecialChars?: boolean
  }>>
): T {
  const sanitized = { ...data }
  
  for (const [field, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      const rule = fieldRules[field as keyof T]
      
      if (rule) {
        switch (rule.type) {
          case 'text':
            sanitized[field as keyof T] = sanitizeText(value, {
              maxLength: rule.maxLength,
              allowNewlines: rule.allowNewlines,
              allowSpecialChars: rule.allowSpecialChars
            }) as T[keyof T]
            break
          case 'email':
            sanitized[field as keyof T] = sanitizeEmail(value) as T[keyof T]
            break
          case 'url':
            sanitized[field as keyof T] = sanitizeUrl(value) as T[keyof T]
            break
          case 'phone':
            sanitized[field as keyof T] = sanitizePhone(value) as T[keyof T]
            break
          case 'html':
            sanitized[field as keyof T] = sanitizeHtml(value) as T[keyof T]
            break
          case 'search':
            sanitized[field as keyof T] = sanitizeSearchQuery(value) as T[keyof T]
            break
          default:
            sanitized[field as keyof T] = sanitizeText(value) as T[keyof T]
        }
      } else {
        // Default to text sanitization
        sanitized[field as keyof T] = sanitizeText(value) as T[keyof T]
      }
    }
  }
  
  return sanitized
}

/**
 * Validate and sanitize file upload
 */
export function sanitizeFileName(input: string): string {
  if (typeof input !== 'string') return ''
  
  // Remove path traversal attempts
  let sanitized = input.replace(/[\/\\:*?"<>|]/g, '')
  
  // Remove leading dots and spaces
  sanitized = sanitized.replace(/^[.\s]+/, '')
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop()
    const name = sanitized.substring(0, 255 - (ext ? ext.length + 1 : 0))
    sanitized = ext ? `${name}.${ext}` : name
  }
  
  return sanitized
}

/**
 * SQL injection prevention for dynamic queries (use with caution)
 */
export function escapeSqlString(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input.replace(/'/g, "''").replace(/\\/g, '\\\\')
}

/**
 * XSS prevention for dynamic content
 */
export function preventXss(input: string): string {
  if (typeof input !== 'string') return ''
  
  // Remove script tags and event handlers
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/javascript:/gi, '')
  
  return sanitizeHtml(sanitized)
}
