export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export interface ErrorInfo {
  message: string;
  code?: string;
  context?: string;
  retryable?: boolean;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  category?: 'network' | 'database' | 'auth' | 'validation' | 'system';
  userMessage?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error?: Error | null;
  progress?: number;
  loadingMessage?: string;
}

export interface RetryConfig {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
  baseDelay?: number;
}

export const handle = (error: any, context?: string) => {
  console.error(`Error${context ? ` in ${context}` : ''}:`, error)
  return null
}

export const logError = (error: any, context?: string) => {
  console.error(`Error in ${context || 'unknown context'}:`, error)
}

export const handleError = (error: any, context?: string) => handle(error, context);

export const withRetry = async <T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> => {
  const { maxAttempts = 3, delay = 1000, backoff = true } = config;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      
      const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw new Error('Max retry attempts reached');
};

export const errorHandler = {
  handle,
  handleError,
  logError,
  withRetry
}

export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T> => {
  try {
    return await operation()
  } catch (error) {
    console.error('Operation failed:', error)
    if (fallback !== undefined) {
      return fallback
    }
    throw error
  }
}

export default errorHandler;
