// Comprehensive TypeScript types for Care Connector App
// Provides type safety and better development experience

// ===== USER & AUTHENTICATION TYPES =====

export interface User {
  id: string
  email: string
  full_name?: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  phone?: string
  role: UserRole
  is_verified: boolean
  created_at: string
  updated_at: string
}

export type UserRole = 'caregiver' | 'care_seeker' | 'companion' | 'professional' | 'care_checker' | 'admin'

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData extends LoginCredentials {
  full_name: string
  role: UserRole
  phone?: string
}

// ===== CAREGIVER & PROVIDER TYPES =====

export interface Caregiver {
  id: string
  user_id: string
  full_name: string
  email: string
  phone?: string
  bio?: string
  location: string
  avatar_url?: string
  profile_image?: string
  role: UserRole
  specialties: string[]
  certifications: string[]
  languages: string[]
  years_experience?: number
  hourly_rate?: number
  availability: string[]
  availability_status: 'available' | 'busy' | 'offline'
  average_rating?: number
  reviews_count?: number
  is_verified: boolean
  is_background_checked: boolean
  created_at: string
  updated_at: string
}

export interface CaregiverFilters {
  searchTerm: string
  location: string
  availability: string
  maxRate: string
  minExperience: string
  specialties: string[]
  languages: string[]
  careType: string
  distance: string
  sortBy: 'name' | 'rating' | 'experience' | 'price' | 'distance'
  filterBy: string
}

// ===== CARE GROUP TYPES =====

export interface CareGroup {
  id: string
  name: string
  description?: string
  created_by: string
  members: CareGroupMember[]
  privacy_level: 'public' | 'private' | 'invite_only'
  group_type: 'family' | 'professional' | 'community'
  created_at: string
  updated_at: string
}

export interface CareGroupMember {
  id: string
  group_id: string
  user_id: string
  role: 'admin' | 'moderator' | 'member'
  joined_at: string
  user?: User
}

// ===== BOOKING & APPOINTMENT TYPES =====

export interface Booking {
  id: string
  client_id: string
  provider_id: string
  service_type: string
  start_time: string
  end_time: string
  status: BookingStatus
  location?: string
  notes?: string
  total_cost?: number
  created_at: string
  updated_at: string
  client?: User
  provider?: Caregiver
}

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'

export interface BookingRequest {
  provider_id: string
  service_type: string
  start_time: string
  end_time: string
  location?: string
  notes?: string
}

// ===== MESSAGING TYPES =====

export interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  message_type: 'text' | 'image' | 'file' | 'system'
  is_read: boolean
  created_at: string
  sender?: User
  recipient?: User
}

export interface Conversation {
  id: string
  participants: string[]
  last_message?: Message
  unread_count: number
  created_at: string
  updated_at: string
}

// ===== REVIEW & RATING TYPES =====

export interface Review {
  id: string
  reviewer_id: string
  reviewee_id: string
  booking_id?: string
  rating: number
  comment?: string
  is_verified: boolean
  created_at: string
  reviewer?: User
  reviewee?: User
}

export interface Rating {
  average_rating: number
  total_reviews: number
  rating_breakdown: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

// ===== SEARCH & FILTER TYPES =====

export interface SearchFilters {
  query?: string
  location?: string
  radius?: number
  service_types?: string[]
  availability?: string[]
  price_range?: {
    min: number
    max: number
  }
  rating_min?: number
  languages?: string[]
  certifications?: string[]
}

export interface SearchResults<T> {
  items: T[]
  total_count: number
  page: number
  per_page: number
  total_pages: number
}

// ===== API RESPONSE TYPES =====

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

// ===== FORM & VALIDATION TYPES =====

export interface FormField {
  value: string
  error?: string
  isValid: boolean
  isTouched: boolean
}

export interface FormState {
  [key: string]: FormField
}

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: string) => boolean | string
}

export interface ValidationRules {
  [key: string]: ValidationRule
}

// ===== UI COMPONENT TYPES =====

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface TableColumn<T = any> {
  key: keyof T
  title: string
  sortable?: boolean
  render?: (value: any, record: T) => React.ReactNode
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'small' | 'medium' | 'large'
}

// ===== NOTIFICATION TYPES =====

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  is_read: boolean
  action_url?: string
  created_at: string
}

export type NotificationType = 
  | 'booking_request' 
  | 'booking_confirmed' 
  | 'booking_cancelled' 
  | 'message_received' 
  | 'review_received' 
  | 'system_update'

// ===== DASHBOARD TYPES =====

export interface DashboardStats {
  upcomingAppointments: number
  unreadMessages: number
  careGroupsCount: number
  savedProviders: number
  completedAppointments: number
  activeConversations: number
  healthGoalsProgress: number
  medicationReminders: number
}

export interface DashboardWidget {
  id: string
  title: string
  type: 'stat' | 'chart' | 'list' | 'calendar'
  data: any
  size: 'small' | 'medium' | 'large'
}

// ===== SETTINGS TYPES =====

export interface UserSettings {
  notifications: {
    email_notifications: boolean
    sms_notifications: boolean
    push_notifications: boolean
    booking_reminders: boolean
    message_notifications: boolean
  }
  privacy: {
    profile_visibility: 'public' | 'private' | 'members_only'
    show_phone: boolean
    show_email: boolean
    show_location: boolean
  }
  preferences: {
    language: string
    timezone: string
    currency: string
    distance_unit: 'miles' | 'kilometers'
  }
}

// ===== ERROR HANDLING TYPES =====

export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: string
}

export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

// ===== ROUTE TYPES =====

export interface RouteConfig {
  path: string
  component: React.ComponentType
  exact?: boolean
  protected?: boolean
  roles?: UserRole[]
  title?: string
}

// ===== UTILITY TYPES =====

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// ===== COMPONENT PROP TYPES =====

export interface BaseComponentProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export interface LoadingProps extends BaseComponentProps {
  isLoading: boolean
  message?: string
  size?: 'small' | 'medium' | 'large'
}

export interface ErrorDisplayProps extends BaseComponentProps {
  error: string | AppError
  onRetry?: () => void
  showDetails?: boolean
}
