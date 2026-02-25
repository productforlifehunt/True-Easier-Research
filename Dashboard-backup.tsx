import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

import { authService } from '../services/authService'
import { User, Calendar, MessageSquare, Heart, Bell, Settings, Menu, X, Home, Users, Shield, Pill, Activity, ChevronLeft, Clock, MapPin, FileText } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  full_name?: string
  avatar_url?: string
  role?: string
  created_at?: string
}

interface ActivityItem {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
  date: string
  icon?: any
  user_id: string
  created_at: string
}

interface DashboardStats {
  upcomingAppointments: number
  unreadMessages: number
  careGroupsCount: number
  savedProviders: number
  completedAppointments: number
  activeConversations: number
  healthGoalsProgress: number
  medicationReminders: number
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [activityFilter, setActivityFilter] = useState('all')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Navigation items for keyboard navigation
  const navigationItems = useMemo(() => [
    'overview', 'appointments', 'messages', 'care-groups', 'notifications', 'providers', 'safety-location', 'medication-management', 'settings'
  ], [])

  // Handle tab change with URL persistence
  const handleTabChange = useCallback((tab: string) => {
    try {
      if (navigationItems.includes(tab)) {
        setActiveTab(tab)
        setSearchParams({ tab })
          } else {
      // Invalid tab requested
      }
    } catch (error) {
      console.error('Failed to change dashboard tab:', error)
      // Fallback to overview tab on error
      setActiveTab('overview')
      setSearchParams({ tab: 'overview' })
    }
  }, [setSearchParams, navigationItems])

  // Memoized navigation items to prevent unnecessary re-renders
  const memoizedNavigationItems = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: Home, panel: 'overview-panel' },
    { id: 'appointments', label: 'Appointments', icon: Calendar, panel: 'appointments-panel' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, panel: 'messages-panel' },
    { id: 'care-groups', label: 'Care Groups', icon: Users, panel: 'care-groups-panel' },
    { id: 'notifications', label: 'Notifications', icon: Bell, panel: 'notifications-panel' },
    { id: 'providers', label: 'Providers', icon: User, panel: 'providers-panel' },
    { id: 'safety-location', label: 'Safety & Location', icon: Shield, panel: 'safety-location-panel' },
    { id: 'medication-management', label: 'Medication Management', icon: Pill, panel: 'medication-management-panel' },
    { id: 'settings', label: 'Settings', icon: Settings, panel: 'settings-panel' }
  ], [])

  // Keyboard navigation functionality integrated into event handlers

  // Add keyboard event listener
  useEffect(() => {
    const handleDocumentKeydown = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).closest('[role="tablist"]')) {
        const currentIndex = navigationItems.indexOf(activeTab)
        let newIndex = currentIndex

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault()
            newIndex = (currentIndex + 1) % navigationItems.length
            break
          case 'ArrowUp':
            e.preventDefault()
            newIndex = currentIndex === 0 ? navigationItems.length - 1 : currentIndex - 1
            break
          case 'Home':
            e.preventDefault()
            newIndex = 0
            break
          case 'End':
            e.preventDefault()
            newIndex = navigationItems.length - 1
            break
          default:
            return
        }

        handleTabChange(navigationItems[newIndex])
        // Focus the new tab
        const newTabElement = document.getElementById(`${navigationItems[newIndex]}-tab`)
        if (newTabElement) {
          newTabElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleDocumentKeydown)
    return () => {
      document.removeEventListener('keydown', handleDocumentKeydown)
    }
  }, [activeTab, navigationItems, handleTabChange])

  // Sync URL parameters with active tab on mount and URL changes
  useEffect(() => {
    const urlTab = searchParams.get('tab')
    if (urlTab && navigationItems.includes(urlTab) && urlTab !== activeTab) {
      setActiveTab(urlTab)
    }
  }, [searchParams, navigationItems, activeTab])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    upcomingAppointments: 0,
    unreadMessages: 0,
    careGroupsCount: 0,
    savedProviders: 0,
    completedAppointments: 0,
    activeConversations: 0,
    healthGoalsProgress: 0,
    medicationReminders: 0
  })

  // Tab-specific data states
  const [appointments, setAppointments] = useState([])
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null)
  const [messages, setMessages] = useState([])
  const [careGroups, setCareGroups] = useState([])
  const [notifications, setNotifications] = useState([])
  const [tabDataLoading, setTabDataLoading] = useState(false)
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [activityLoading, setActivityLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)

  // Memoized dashboard stats for performance optimization
  const memoizedStats = useMemo(() => ({
    appointmentProgress: Math.min((dashboardStats.upcomingAppointments / 10) * 100, 100),
    messageProgress: Math.min((dashboardStats.unreadMessages / 20) * 100, 100),
    messagePriority: dashboardStats.unreadMessages > 5 ? 'high' : 'normal',
    careGroupProgress: Math.min((dashboardStats.careGroupsCount / 50) * 100, 100),
    healthProgress: Math.min((dashboardStats.healthGoalsProgress / 100) * 100, 100)
  }), [dashboardStats])

  // Refresh dashboard stats
  const refreshDashboardStats = useCallback(async () => {
    if (user?.id) {
      await loadDashboardStats(user.id)
    }
  }, [user?.id])

  // Settings navigation with error handling
  const handleSettingsNavigation = useCallback((path: string, section?: string) => {
    try {
      const url = section ? `${path}?section=${section}` : path
      navigate(url)
    } catch (error) {
      setError('Failed to navigate to settings. Please try again.')
    }
  }, [navigate])

  // Memoized appointment filtering for performance
  const [appointmentFilter, setAppointmentFilter] = useState('all')
  const filteredAppointments = useMemo(() => {
    if (appointmentFilter === 'all') return appointments
    if (appointmentFilter === 'upcoming') {
      return appointments.filter(apt => new Date(apt.appointment_date) >= new Date())
    }
    if (appointmentFilter === 'past') {
      return appointments.filter(apt => new Date(apt.appointment_date) < new Date())
    }
    if (appointmentFilter === 'pending') {
      return appointments.filter(apt => apt.status === 'pending')
    }
    return appointments
  }, [appointments, appointmentFilter])





  // Optimized search handler
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  // Optimized filter handler
  const handleFilterChange = useCallback((filter: string) => {
    setActivityFilter(filter)
  }, [])

  // Filtered activities based on search query and filter
  const filteredActivities = useMemo(() => {
    let filtered = recentActivity

    // Apply search query filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(activity => 
        activity.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply activity filter (for future filter options)
    if (activityFilter !== 'all' && activityFilter !== 'All Activity') {
      filtered = filtered.filter(activity => activity.type === activityFilter)
    }

    return filtered
  }, [recentActivity, searchQuery, activityFilter])

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      // Dashboard: Checking user authentication

      // First, check if user was just authenticated (from authService)
      const authenticatedUser = authService.getUser()
      if (authenticatedUser) {
        // Dashboard: Found authenticated user from authService
        setUser(authenticatedUser)
        // Load dashboard stats for the authenticated user
        await Promise.all([
          loadDashboardStats(authenticatedUser.id),
          loadRecentActivity(authenticatedUser.id)
        ])
        setLoading(false)
        return
      }

      // If no authenticated user in memory, check Supabase session
      // Dashboard: No user in authService, checking Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        // Dashboard: Session error
        throw sessionError
      }

      if (session?.user) {
        // Dashboard: Found Supabase session for user

        // Try to get user profile with better error handling
        const currentUser = await authService.getCurrentUser()
        if (currentUser) {
          // Dashboard: Successfully loaded user profile
          setUser(currentUser)
          // Load dashboard stats for the authenticated user
          await Promise.all([
            loadDashboardStats(currentUser.id),
            loadRecentActivity(currentUser.id)
          ])
        } else {
          // Dashboard: Session exists but could not load user profile
          // Don't redirect immediately - this might be a temporary issue
          setError('Loading user profile...')
          // Give a brief delay and try once more
          setTimeout(async () => {
            const retryUser = await authService.getCurrentUser()
            if (retryUser) {
              setUser(retryUser)
              setError('')
              await Promise.all([
                loadDashboardStats(retryUser.id),
                loadRecentActivity(retryUser.id)
              ])
            } else {
              // Dashboard: Profile load retry failed, redirecting to sign-in
              setError('Please sign in to access your dashboard')
              navigate('/sign-in')
            }
            setLoading(false)
          }, 2000)
          return
        }
      } else {
        // Dashboard: No Supabase session found, redirecting to sign-in
        setError('Please sign in to access your dashboard')
        navigate('/sign-in')
        return
      }
    } catch (error) {
      // Dashboard: Error during authentication check
      setError('Failed to load user data. Please try signing in again.')
      // Add a delay before redirecting to avoid immediate redirect loops
      setTimeout(() => {
        navigate('/sign-in')
      }, 1000)
    } finally {
      setLoading(false)
    }
  }

  const loadRecentActivity = useCallback(async (userId: string) => {
    try {
      setActivityLoading(true)
      // Loading recent activity from database

      // Query recent activity from database - HOLY RULE #1 compliant
      const { data, error } = await supabase
        .schema('care_connector')
        .from('user_activity')
        .select(`
          id,
          activity_type,
          description,
          created_at,
          metadata
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        // Database error loading recent activity
        setRecentActivity([])
      } else {
        // Transform data to match ActivityItem interface
        const transformedActivity = (data || []).map((item: any) => ({
          id: item.id,
          type: item.activity_type || 'general',
          title: item.description || 'Activity',
          description: item.description || '',
          timestamp: item.created_at,
          date: item.created_at,
          created_at: item.created_at,
          user_id: item.user_id || '',
          metadata: item.metadata
        }))
        setRecentActivity(transformedActivity)
        // Recent activity loaded successfully
      }
    } catch (error) {
      // Error loading recent activity
      setRecentActivity([])
    } finally {
      setActivityLoading(false)
    }
  }, [])

  const loadDashboardStats = useCallback(async (userId: string) => {
    try {
      setStatsLoading(true)
      // Loading dashboard stats from database

      // Query dashboard stats from database - HOLY RULE #1 compliant
      const [appointmentsResult, messagesResult, careGroupsResult, healthResult, savedProvidersResult] = await Promise.all([
        supabase.schema('care_connector').from('bookings').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.schema('care_connector').from('group_messages').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('read', false),
        supabase.schema('care_connector').from('care_group_members').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.schema('care_connector').from('health_goals').select('progress', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.schema('care_connector').from('saved_providers').select('id', { count: 'exact', head: true }).eq('user_id', userId)
      ])

      const stats = {
        upcomingAppointments: appointmentsResult.count || 0,
        unreadMessages: messagesResult.count || 0,
        careGroupsCount: careGroupsResult.count || 0,
        healthGoalsProgress: healthResult.count || 0,
        savedProviders: savedProvidersResult.count || 0, // Fixed: now loads dynamically from database
        completedAppointments: 0,
        activeConversations: 0,
        medicationReminders: 0
      }

      setDashboardStats(stats)
      // Dashboard stats loaded successfully
    } catch (error) {
      // Error loading dashboard stats - using local logging instead of global error state
      console.error('Failed to load dashboard statistics:', error)
      // Set empty stats on error without blocking entire dashboard
      setDashboardStats({
        upcomingAppointments: 0,
        unreadMessages: 0,
        careGroupsCount: 0,
        healthGoalsProgress: 0,
        savedProviders: 0, // Acceptable for error fallback state
        completedAppointments: 0,
        activeConversations: 0,
        medicationReminders: 0
      })

  // Load appointments data for appointments tab
  const loadAppointments = useCallback(async (userId: string) => {
    try {
      setTabDataLoading(true)
      const { data, error } = await supabase
        .schema('care_connector')
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
      if (error) throw error
      setAppointments(data || [])
    } catch (error) {
      // Enhanced error logging for detailed Supabase error analysis
      console.error('🚨 DETAILED APPOINTMENTS ERROR ANALYSIS:')
      console.error('Error object:', error)
      console.error('Error message:', error?.message)
      console.error('Error code:', error?.code)
      console.error('Error details:', error?.details)
      console.error('Error hint:', error?.hint)
      console.error('User ID used:', userId)
      console.error('Supabase query details: schema=care_connector, table=bookings, filter=user_id')
      setAppointmentsError('Failed to load appointments. Please refresh and try again.')
      setAppointments([])
    } finally {
      setTabDataLoading(false)
    }
  }, [])

  // Load messages data for messages tab
  const loadMessages = useCallback(async (userId: string) => {
    try {
      setTabDataLoading(true)
      const { data, error } = await supabase
        .schema('care_connector')
        .from('group_messages')
        .select(`
          id,
          message,
          created_at,
          user_id,
          profiles!group_messages_user_id_fkey (
            first_name,
            last_name,
            full_name
          )
        `)
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      // Error loading messages
      setMessages([]) // Set empty array on error, no fake data
    } finally {
      setTabDataLoading(false)
    }
  }, [])

  // Load care groups data for care groups tab
  const loadCareGroups = useCallback(async (userId: string) => {
    try {
      setTabDataLoading(true)
      const { data, error } = await supabase
        .schema('care_connector')
        .from('care_group_members')
        .select(`
          id,
          joined_at,
          care_groups (
            id,
            name,
            description,
            member_count,
            privacy_setting
          )
        `)
        .eq('user_id', userId)
        .order('joined_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setCareGroups(data || [])
    } catch (error) {
      console.error('Failed to load care groups:', error)
      setError('Failed to load care groups. Please refresh and try again.')
      setCareGroups([])
    } finally {
      setTabDataLoading(false)
    }
  }, [])

  // Load notifications data for notifications tab with infinite loop protection
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const loadNotifications = useCallback(async (userId: string) => {
    // Prevent infinite loop - only allow one call at a time
    if (notificationsLoading) {
      // Notifications already loading, preventing duplicate call
      return
    }
    
    try {
      setNotificationsLoading(true)
      setTabDataLoading(true)
      // Loading notifications for user
      // Fetch real notifications from database - HOLY RULE #1 compliant
      const { data: notificationsData, error } = await supabase
        .schema('care_connector')
        .from('notifications')
        .select(`
          id,
          title,
          message,
          type,
          read,
          created_at,
          metadata
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        // Database error loading notifications
        setNotifications([])
      } else {
        setNotifications(notificationsData || [])
      }
      // Notifications loaded successfully
    } catch (error) {
      // Error loading notifications
      setNotifications([]) // Set empty array on error, no hardcoded data
    } finally {
      setNotificationsLoading(false)
      setTabDataLoading(false)
    }
  }, [notificationsLoading])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      navigate('/')
    } catch (error) {
      console.error('Failed to sign out:', error)
      setError('Failed to sign out. Please try again or close your browser.')
      // Still navigate to home as fallback
      navigate('/')
    }
  }

  // Load tab-specific data when activeTab changes
  useEffect(() => {
    if (activeTab !== 'overview') {
      if (!user?.id) {
        // User context not available - set appropriate error state
        if (activeTab === 'appointments') {
          setAppointmentsError('User authentication required. Please refresh the page.')
        }
        return
      }
      
      switch (activeTab) {
        case 'appointments':
          // Clear any previous error and load appointments
          setAppointmentsError(null)
          loadAppointments(user.id)
          break
        case 'messages':
          loadMessages(user.id)
          break
        case 'care-groups':
          loadCareGroups(user.id)
          break
        case 'notifications':
          loadNotifications(user.id)
          break
        default:
          break
      }
    }
  }, [activeTab, user?.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{backgroundColor: 'var(--bg-primary)'}}>
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-32 h-32 rounded-full animate-pulse-subtle" style={{backgroundColor: 'var(--bg-accent)'}}></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 rounded-full animate-pulse-subtle" style={{backgroundColor: 'var(--bg-accent)', animationDelay: '1s'}}></div>
        </div>

        <div className="text-center max-w-md mx-auto p-8 relative z-10 animate-fadeInUp">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg" style={{backgroundColor: 'var(--bg-accent)'}}>
            <div className="w-8 h-8 border-4 rounded-full animate-spin border-t-transparent" style={{borderColor: 'var(--primary)'}}></div>
          </div>
          <h2 className="text-2xl font-light mb-2" style={{color: 'var(--text-primary)'}}>Loading Dashboard</h2>
          <p style={{color: 'var(--text-secondary)'}}>Preparing your personalized care experience...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--bg-primary)'}}>
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--bg-error)'}}>
            <div className="w-8 h-8 rounded-full" style={{backgroundColor: 'var(--text-error)'}}></div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight leading-tight mb-3" style={{color: 'var(--text-primary)'}}>Connection Error</h2>
          <p className="text-base font-medium leading-relaxed mb-6" style={{color: 'var(--text-secondary)'}}>{error}</p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200"
              style={{backgroundColor: 'var(--primary)', color: 'var(--bg-primary)'}}>
              Try Again
            </button>
            <button
              onClick={handleSignOut}
              className="px-6 py-3 rounded-xl font-bold text-sm border transition-all duration-200"
              style={{borderColor: 'var(--border-medium)', color: 'var(--text-primary)'}}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{backgroundColor: 'var(--bg-primary)'}}>
      {/* Skip Link for Main Content */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Enhanced Mobile Header - Elegant & Clean */}
      <div
        className="md:hidden flex items-center justify-between p-6 border-b shadow-sm"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-light)'
        }}
      >
        <div className="flex items-center space-x-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: 'var(--bg-accent)' }}
          >
            <Heart className="w-5 h-5" style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h1 className="text-xl font-light" style={{ color: 'var(--text-primary)' }}>CareConnect</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Dashboard</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`p-2 rounded-lg transition-colors ${mobileMenuOpen ? 'button-primary' : ''}`}
          style={{
            backgroundColor: mobileMenuOpen ? undefined : 'transparent'
          }}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation-menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" style={{ color: 'var(--bg-primary)' }} />
          ) : (
            <Menu className="w-6 h-6" style={{ color: 'var(--primary)' }} />
          )}
        </button>
      </div>
      {/* Enhanced Apple Mac Desktop Style Sidebar */}
      {/* Mobile Sidebar Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        role="navigation"
        aria-label="Dashboard navigation"
        className={`
          ${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0 border-r transition-all duration-300 ease-in-out
          md:relative md:translate-x-0
          ${mobileMenuOpen ? 'fixed inset-y-0 left-0 z-50 translate-x-0' : 'fixed inset-y-0 left-0 z-50 -translate-x-full md:translate-x-0'}
        `}
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-light)'
        }}
      >
        {/* Enhanced Sidebar Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-light)' }}>
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--bg-accent)' }}
              >
                <Heart className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              </div>
              <div>
                <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Dashboard</h2>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg transition-all duration-200 hover:shadow-sm"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!sidebarCollapsed}
            aria-controls="dashboard-navigation-menu"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`} style={{ color: 'var(--text-primary)' }} />
          </button>
        </div>

        {/* Enhanced Apple-Style Navigation Menu */}
        <nav
          id="dashboard-navigation-menu"
          className={`${sidebarCollapsed ? 'px-2' : 'px-6'} py-6 transition-all duration-300`}
          role="navigation"
          aria-label="Dashboard navigation menu"
          aria-describedby="sidebar-description"
          onKeyDown={(e) => {
            const currentIndex = navigationItems.indexOf(activeTab)
            let newIndex = currentIndex

            switch (e.key) {
              case 'ArrowDown':
                e.preventDefault()
                newIndex = (currentIndex + 1) % navigationItems.length
                break
              case 'ArrowUp':
                e.preventDefault()
                newIndex = currentIndex === 0 ? navigationItems.length - 1 : currentIndex - 1
                break
              case 'Home':
                e.preventDefault()
                newIndex = 0
                break
              case 'End':
                e.preventDefault()
                newIndex = navigationItems.length - 1
                break
              default:
                return
            }

            handleTabChange(navigationItems[newIndex])
          }}
        >
          <div id="sidebar-description" className="sr-only">
            Main dashboard navigation with {memoizedNavigationItems.length} sections. Use arrow keys to navigate.
          </div>
          <div className="space-y-2" role="tablist" aria-orientation="vertical">
            {/* Navigation Menu Items */}
            <button
              onClick={() => handleTabChange('overview')}
              role="tab"
              aria-selected={activeTab === 'overview'}
              aria-controls="overview-panel"
              id="overview-tab"
              tabIndex={activeTab === 'overview' ? 0 : -1}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'gap-4 px-4 py-3'} rounded-xl text-left transition-all duration-200 macos-sidebar-item ${
                activeTab === 'overview' ? 'active' : ''
              }`}
              title={sidebarCollapsed ? 'Overview' : undefined}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTabChange('overview');
                }
              }}
            >
              <Home className="w-5 h-5" aria-hidden="true" />
              {!sidebarCollapsed && <span className="font-medium">Overview</span>}
            </button>

            <button
              onClick={() => handleTabChange('appointments')}
              role="tab"
              aria-selected={activeTab === 'appointments'}
              aria-controls="appointments-panel"
              id="appointments-tab"
              tabIndex={activeTab === 'appointments' ? 0 : -1}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'gap-4 px-4 py-3'} rounded-xl text-left transition-all duration-200 macos-sidebar-item ${
                activeTab === 'appointments' ? 'active' : ''
              }`}
              title={sidebarCollapsed ? 'Appointments' : undefined}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTabChange('appointments');
                }
              }}
            >
              <Calendar className="w-5 h-5" aria-hidden="true" />
              {!sidebarCollapsed && <span className="font-medium">Appointments</span>}
            </button>

            <button
              onClick={() => handleTabChange('messages')}
              role="tab"
              aria-selected={activeTab === 'messages'}
              aria-controls="messages-panel"
              id="messages-tab"
              tabIndex={activeTab === 'messages' ? 0 : -1}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'gap-4 px-4 py-3'} rounded-xl text-left transition-all duration-200 macos-sidebar-item ${
                activeTab === 'messages' ? 'active' : ''
              }`}
              title={sidebarCollapsed ? 'Messages' : undefined}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTabChange('messages');
                }
              }}
            >
              <MessageSquare className="w-5 h-5" aria-hidden="true" />
              {!sidebarCollapsed && <span className="font-medium">Messages</span>}
            </button>

            <button
              onClick={() => handleTabChange('care-groups')}
              role="tab"
              aria-selected={activeTab === 'care-groups'}
              aria-controls="care-groups-panel"
              id="care-groups-tab"
              tabIndex={activeTab === 'care-groups' ? 0 : -1}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'gap-4 px-4 py-3'} rounded-xl text-left transition-all duration-200 macos-sidebar-item ${
                activeTab === 'care-groups' ? 'active' : ''
              }`}
              title={sidebarCollapsed ? 'Care Groups' : undefined}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTabChange('care-groups');
                }
              }}
            >
              <Users className="w-5 h-5" aria-hidden="true" />
              {!sidebarCollapsed && <span className="font-medium">Care Groups</span>}
            </button>

            <button
              onClick={() => handleTabChange('notifications')}
              role="tab"
              aria-selected={activeTab === 'notifications'}
              aria-controls="notifications-panel"
              id="notifications-tab"
              tabIndex={activeTab === 'notifications' ? 0 : -1}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'gap-4 px-4 py-3'} rounded-xl text-left transition-all duration-200 macos-sidebar-item ${
                activeTab === 'notifications' ? 'active' : ''
              }`}
              title={sidebarCollapsed ? 'Notifications' : undefined}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleTabChange('notifications')
                }
              }}
            >
              <Bell className="w-5 h-5" aria-hidden="true" />
              {!sidebarCollapsed && <span className="font-medium">Notifications</span>}
            </button>

            <button
              onClick={() => handleTabChange('providers')}
              role="tab"
              aria-selected={activeTab === 'providers'}
              aria-controls="providers-panel"
              id="providers-tab"
              tabIndex={activeTab === 'providers' ? 0 : -1}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'gap-4 px-4 py-3'} rounded-xl text-left transition-all duration-200 macos-sidebar-item ${
                activeTab === 'providers' ? 'active' : ''
              }`}
              title={sidebarCollapsed ? 'Providers' : undefined}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTabChange('providers');
                }
              }}
            >
              <User className="w-5 h-5" aria-hidden="true" />
              {!sidebarCollapsed && <span className="font-medium">Providers</span>}
            </button>

            <button
              onClick={() => handleTabChange('safety-location')}
              role="tab"
              aria-selected={activeTab === 'safety-location'}
              aria-controls="safety-location-panel"
              id="safety-location-tab"
              tabIndex={activeTab === 'safety-location' ? 0 : -1}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'gap-4 px-4 py-3'} rounded-xl text-left transition-all duration-200 macos-sidebar-item ${
                activeTab === 'safety-location' ? 'active' : ''
              }`}
              title={sidebarCollapsed ? 'Safety & Location' : undefined}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleTabChange('safety-location')
                }
              }}
            >
              <Shield className="w-5 h-5" aria-hidden="true" />
              {!sidebarCollapsed && <span className="font-medium">Safety & Location</span>}
            </button>

            <button
              onClick={() => handleTabChange('medication-management')}
              role="tab"
              aria-selected={activeTab === 'medication-management'}
              aria-controls="medication-management-panel"
              id="medication-management-tab"
              tabIndex={activeTab === 'medication-management' ? 0 : -1}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'gap-4 px-4 py-3'} rounded-xl text-left transition-all duration-200 macos-sidebar-item ${
                activeTab === 'medication-management' ? 'active' : ''
              }`}
              title={sidebarCollapsed ? 'Medication Management' : undefined}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleTabChange('medication-management')
                }
              }}
            >
              <Pill className="w-5 h-5" aria-hidden="true" />
              {!sidebarCollapsed && <span className="font-medium">Medication Management</span>}
            </button>

            <button
              onClick={() => handleTabChange('settings')}
              role="tab"
              aria-selected={activeTab === 'settings'}
              aria-controls="settings-panel"
              id="settings-tab"
              tabIndex={activeTab === 'settings' ? 0 : -1}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'gap-4 px-4 py-3'} rounded-xl text-left transition-all duration-200 macos-sidebar-item ${
                activeTab === 'settings' ? 'active' : ''
              }`}
              title={sidebarCollapsed ? 'Settings' : undefined}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleTabChange('settings')
                }
              }}
            >
              <Settings className="w-5 h-5" aria-hidden="true" />
              {!sidebarCollapsed && <span className="font-medium">Settings</span>}
            </button>

          </div>
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold" style={{backgroundColor: 'var(--primary)', color: 'var(--bg-primary)'}}>
              {((user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')).toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{color: 'var(--text-primary)'}}>
                {user?.first_name || user?.email}
              </p>
              <button
                onClick={handleSignOut}
                className="text-xs font-medium transition-colors"
                style={{color: 'var(--text-secondary)'}}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-overlay"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <main
        id="main-content"
        role="main"
        aria-label="Dashboard main content"
        className="flex-1 overflow-hidden md:ml-0"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div className="h-full overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="p-4 sm:p-6 lg:p-8 xl:p-10">
              {/* Header - Elegant & Clean */}
              <div className="mb-8 sm:mb-12 lg:mb-16">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight leading-tight mb-2" style={{
                  color: 'var(--text-primary)',
                  lineHeight: '1.2'
                }}>
                  Welcome back{user?.first_name ? `, ${user.first_name}` : ' to your care dashboard'}
                </h1>
                <p className="text-base sm:text-lg lg:text-xl font-normal leading-relaxed tracking-wide max-w-2xl" style={{
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5'
                }}>
                  Here's what's happening with your care today.
                </p>
              </div>

              {/* Dashboard Overview Section - Clean */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold tracking-tight leading-tight" style={{color: 'var(--text-primary)'}}>
                  Overview
                </h2>
                <button
                  onClick={refreshDashboardStats}
                  disabled={statsLoading}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-light)',
                    opacity: statsLoading ? 0.6 : 1
                  }}
                  aria-label="Refresh dashboard statistics"
                >
                  {statsLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {/* Dashboard Stats Grid - 2025 Mac/iOS Style */}
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 lg:mb-12"
                role="region"
                aria-label="Dashboard statistics overview"
              >
                {/* Apple Mac Desktop Appointments Card */}
                <div
                  className="p-8 rounded-3xl transition-all duration-500 cursor-pointer group"
                  role="article"
                  aria-labelledby="appointments-title"
                  aria-describedby="appointments-description"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleTabChange('appointments');
                    }
                  }}
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-large)',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-hover)'
                    e.currentTarget.style.transform = 'translateY(-4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-light)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-large)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{
                      backgroundColor: 'var(--primary)',
                      boxShadow: 'var(--shadow-medium)'
                    }}>
                      <Calendar className="w-8 h-8" style={{color: 'var(--bg-primary)'}} />
                    </div>
                    <span
                      className="text-3xl font-light macos-title"
                      style={{
                        color: 'var(--text-primary)',
                        fontWeight: '300',
                        letterSpacing: '-0.02em'
                      }}
                      aria-label={`${dashboardStats.upcomingAppointments} upcoming appointments`}
                      aria-live="polite"
                    >
                      {statsLoading ? (
                        <span className="animate-pulse" style={{ color: 'var(--text-secondary)' }}>
                          —
                        </span>
                      ) : (
                        dashboardStats.upcomingAppointments
                      )}
                    </span>
                  </div>
                  <h3
                    id="appointments-title"
                    className="text-xl font-semibold mb-4 macos-title"
                    style={{
                      color: 'var(--text-primary)',
                      fontWeight: '600',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Upcoming Appointments
                  </h3>
                  <div
                    className="w-full rounded-full h-3 mb-2"
                    style={{
                      backgroundColor: 'var(--border-light)',
                      boxShadow: 'var(--shadow-inset)'
                    }}
                    role="progressbar"
                    aria-valuenow={memoizedStats.appointmentProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Appointment progress indicator"
                    id="appointments-description"
                  >
                    <div
                      className="h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${memoizedStats.appointmentProgress}%`,
                        backgroundColor: 'var(--primary)',
                        boxShadow: 'var(--shadow-light)'
                      }}
                    ></div>
                  </div>
                  <button
                    onClick={() => handleTabChange('appointments')}
                    className="w-full px-6 py-4 text-base font-medium rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg macos-body"
                    style={{
                      color: 'var(--bg-primary)',
                      backgroundColor: 'var(--primary)',
                      boxShadow: 'var(--shadow-large)',
                      fontWeight: '500',
                      letterSpacing: '-0.005em'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow = 'var(--focus-shadow)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = 'var(--shadow-large)'
                    }}>
                    {dashboardStats.upcomingAppointments === 0 ? 'Schedule Appointment' : 'Manage Appointments'}
                  </button>
                </div>

                {/* Apple Mac Desktop Messages Card */}
                <dl
                  className="p-8 rounded-3xl transition-all duration-500 cursor-pointer group"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-large)',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-hover)'
                    e.currentTarget.style.transform = 'translateY(-4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-light)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-large)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                  role="article"
                  aria-labelledby="messages-title"
                  aria-describedby="messages-description"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleTabChange('messages');
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{
                      backgroundColor: 'var(--primary)',
                      boxShadow: 'var(--shadow-medium)'
                    }}>
                      <MessageSquare className="w-8 h-8" style={{color: 'var(--bg-primary)'}} />
                    </div>
                    <dd
                      className="text-3xl font-light macos-title"
                      style={{
                        color: 'var(--text-primary)',
                        fontWeight: '300',
                        letterSpacing: '-0.02em'
                      }}
                      aria-label={`${dashboardStats.unreadMessages} unread messages`}
                      aria-live="polite"
                    >
                      {statsLoading ? '...' : dashboardStats.unreadMessages}
                    </dd>
                  </div>
                  <dt
                    id="messages-title"
                    className="text-xl font-semibold mb-4 macos-title"
                    style={{
                      color: 'var(--text-primary)',
                      fontWeight: '600',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Unread Messages
                  </dt>
                  <div className="w-full rounded-full h-3 mb-2" style={{
                    backgroundColor: 'var(--border-light)',
                    boxShadow: 'var(--shadow-inset)'
                  }}>
                    <div
                      className="h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${memoizedStats.messageProgress}%`,
                        backgroundColor: 'var(--primary)',
                        boxShadow: 'var(--shadow-light)'
                      }}
                    ></div>
                  </div>
                  <button
                    onClick={() => handleTabChange('messages')}
                    className="px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md"
                    style={{
                      color: 'var(--bg-primary)',
                      backgroundColor: 'var(--primary)',
                      boxShadow: 'var(--shadow-card)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow = 'var(--focus-shadow)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = 'var(--shadow-card)'
                    }}>
                    {dashboardStats.unreadMessages === 0 ? 'Start Conversation' : 'Manage Messages'}
                  </button>
                </dl>

                {/* Care Groups Card - Enhanced Apple Style */}
                <div
                  className="p-6 rounded-2xl transition-all duration-200 cursor-pointer border hover:shadow-lg"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-light)',
                    boxShadow: 'var(--shadow-light)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-primary)'
                    e.currentTarget.style.borderColor = 'var(--border-light)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-light)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Heart className="w-6 h-6" style={{color: 'var(--primary)'}} />
                    <span className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>
                      {dashboardStats.careGroupsCount}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{color: 'var(--text-primary)'}}>
                    Care Groups
                  </h3>
                  <div className="w-full rounded-full h-3 mb-2" style={{ backgroundColor: 'var(--border-light)', boxShadow: 'var(--shadow-inset)' }}>
                    <div
                      className="h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${memoizedStats.careGroupProgress}%`,
                        backgroundColor: 'var(--primary)',
                        boxShadow: 'var(--shadow-light)'
                      }}
                    ></div>
                  </div>
                  <button
                    onClick={() => handleTabChange('care-groups')}
                    className="px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md"
                    style={{
                      color: 'var(--bg-primary)',
                      backgroundColor: 'var(--primary)',
                      boxShadow: 'var(--shadow-light)'
                    }}>
                    {dashboardStats.careGroupsCount === 0 ? 'Browse Groups' : 'Manage Groups'}
                  </button>
                </div>

                {/* Providers Card - Enhanced Apple Style */}
                <div
                  className="p-6 rounded-2xl transition-all duration-200 cursor-pointer border hover:shadow-lg"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border-light)',
                    boxShadow: 'var(--shadow-light)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-primary)'
                    e.currentTarget.style.borderColor = 'var(--border-light)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-light)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <User className="w-6 h-6" style={{color: 'var(--primary)'}} />
                    <span className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>
                      {dashboardStats.savedProviders}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{color: 'var(--text-primary)'}}>
                    Saved Providers
                  </h3>
                  <div className="w-full rounded-full h-2 mb-2" style={{ backgroundColor: 'var(--border-light)' }}>
                    <div
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${Math.min((dashboardStats.savedProviders / 10) * 100, 100)}%`,
                        backgroundColor: 'var(--primary)'
                      }}
                    ></div>
                  </div>
                  <button
                    onClick={() => handleTabChange('providers')}
                    className="px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md"
                    style={{
                      color: 'var(--bg-primary)',
                      backgroundColor: 'var(--primary)',
                      boxShadow: 'var(--shadow-light)'
                    }}>
                    {dashboardStats.savedProviders === 0 ? 'Find Providers' : 'Manage Providers'}
                  </button>
                </div>
              </div>

              {/* Recent Activity Section */}
              <div className="mt-8 sm:mt-10 lg:mt-12">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-10 space-y-4 sm:space-y-0">
                  <h2 className="text-xl sm:text-2xl font-semibold tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
                    Recent Activity
                  </h2>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search activity..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full sm:w-72 pl-10 pr-4 py-3 rounded-xl text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:shadow-lg hover:shadow-md hover:scale-[1.02]"
                        style={{
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--border-light)',
                          color: 'var(--text-primary)',
                          boxShadow: 'var(--shadow-light)',
                          '--tw-ring-color': 'var(--primary)'
                        } as React.CSSProperties}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    <select
                      value={activityFilter}
                      onChange={(e) => handleFilterChange(e.target.value)}
                      className="px-4 py-3 rounded-xl text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:shadow-lg hover:shadow-md hover:scale-[1.02]"
                      style={{
                        border: '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        boxShadow: 'var(--shadow-light)',
                        '--tw-ring-color': 'var(--primary)'
                      } as React.CSSProperties}
                    >
                      <option value="all">All Activity</option>
                      <option value="appointments">Appointments</option>
                      <option value="messages">Messages</option>
                      <option value="care-groups">Care Groups</option>
                    </select>
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="space-y-4">
                  {activityLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: 'var(--primary)' }}></div>
                      <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading recent activity...</p>
                    </div>
                  ) : filteredActivities.length > 0 ? (
                    filteredActivities.map((activity) => {
                      const IconComponent = activity.icon; // Assuming icon is passed as a component
                      return (
                        <div key={activity.id} className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
                          <div className="flex items-start space-x-3">
                            <IconComponent className="w-5 h-5 mt-1" style={{ color: 'var(--primary)' }} />
                            <div className="flex-1">
                              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {activity.title}
                              </h3>
                              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                                {activity.description}
                              </p>
                              <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                                {(() => {
                                  try {
                                    return new Date(activity.date).toLocaleDateString();
                                  } catch (error) {
                                    console.warn('Error formatting activity date:', activity.date, error);
                                    return activity.date || 'Unknown date';
                                  }
                                })()}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-16">
                      <Activity className="w-12 h-12 mx-auto mb-6" style={{ color: 'var(--text-muted)' }} />
                      <h3 className="text-xl sm:text-2xl font-semibold tracking-tight leading-tight mb-4" style={{ color: 'var(--text-primary)' }}>
                        Your Activity Story Starts Here
                      </h3>
                      <p className="text-sm font-normal leading-relaxed max-w-md mx-auto mb-6" style={{ color: 'var(--text-secondary)' }}>
                        Schedule appointments, send messages, or join care groups to see your activity timeline come to life.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                        <button
                          onClick={() => handleTabChange('appointments')}
                          className="px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md"
                          style={{
                            color: 'var(--bg-primary)',
                            backgroundColor: 'var(--primary)',
                            boxShadow: 'var(--shadow-light)'
                          }}>
                          Schedule Appointment
                        </button>
                        <button
                          onClick={() => handleTabChange('messages')}
                          className="px-4 py-2.5 text-sm font-semibold rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-md"
                          style={{
                            color: 'var(--text-primary)',
                            backgroundColor: 'transparent',
                            borderColor: 'var(--border-light)',
                            boxShadow: 'var(--shadow-light)'
                          }}>
                          Start Conversation
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <section
              className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12"
              role="tabpanel"
              aria-labelledby="appointments-tab"
              id="appointments-panel"
            >
              <header className="mb-8">
                <h2
                  id="appointments-heading"
                  className="text-2xl font-light tracking-tight leading-tight mb-2"
                  style={{color: 'var(--text-primary)', fontWeight: '300', letterSpacing: '-0.01em'}}
                >
                  Appointments
                </h2>
                <p
                  className="text-lg font-normal leading-relaxed"
                  style={{color: 'var(--text-secondary)', fontWeight: '400'}}
                  aria-describedby="appointments-heading"
                >
                  Manage your upcoming and past appointments
                </p>
              </header>

              {tabDataLoading ? (
                <div className="text-center py-12" role="status" aria-live="polite">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{borderColor: 'var(--primary)'}}></div>
                  <p className="mt-4 text-sm" style={{color: 'var(--text-secondary)'}}>Loading appointments...</p>
                </div>
              ) : appointmentsError ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{backgroundColor: 'var(--bg-error)'}}>
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <h3 className="text-lg font-medium mb-2" style={{color: 'var(--text-primary)'}}>Failed to Load Appointments</h3>
                  <p className="mb-4" style={{color: 'var(--text-secondary)'}}>{appointmentsError}</p>
                  <button
                    onClick={() => {
                      setAppointmentsError(null);
                      setTabDataLoading(true);
                      // Retry loading appointments logic would go here
                      setTimeout(() => setTabDataLoading(false), 1000);
                    }}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'var(--bg-primary)',
                      boxShadow: 'var(--shadow-light)'
                    }}
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Appointment Management Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => navigate('/find-care')}
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                        style={{
                          backgroundColor: 'var(--primary)',
                          color: 'var(--bg-primary)',
                          boxShadow: 'var(--shadow-light)'
                        }}
                      >
                        Schedule New
                      </button>
                      <select
                        value={appointmentFilter}
                        onChange={(e) => setAppointmentFilter(e.target.value)}
                        className="px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:shadow-md focus:ring-primary"
                        style={{
                          border: '1px solid var(--border-light)',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          boxShadow: 'var(--shadow-light)'
                        }}
                        aria-label="Filter appointments by status"
                      >
                        <option value="all">All Appointments</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="past">Past</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
                      {appointmentFilter !== 'all' && (
                        <span className="ml-1">({appointmentFilter})</span>
                      )}
                    </div>
                  </div>

                  {/* Appointments List */}
                  <div
                    className="space-y-4"
                    role="list"
                    aria-label="Appointments list"
                  >
                    {filteredAppointments.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="w-12 h-12 mx-auto mb-6" style={{ color: 'var(--text-secondary)' }} />
                        <h3 className="text-lg font-semibold mb-3 macos-title" style={{color: 'var(--text-primary)'}}>No Appointments Yet</h3>
                        <p className="mb-6 text-base macos-body" style={{color: 'var(--text-secondary)'}}>Ready to book your first care appointment? Browse our verified providers to find the perfect match for your needs.</p>
                        <button
                          onClick={() => {
                            console.log('🔍 Find Caregivers button clicked - using React Router navigate')
                            navigate('/caregivers')
                          }}
                          className="px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                          style={{
                            color: 'var(--bg-primary)',
                            backgroundColor: 'var(--primary)',
                            boxShadow: 'var(--shadow-light)'
                          }}
                        >
                          Find Caregivers
                        </button>
                      </div>
                    ) : filteredAppointments.map((appointment) => (
                      <article
                        key={appointment.id}
                        className="p-4 rounded-lg border transition-colors duration-150"
                        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--primary)'
                          e.currentTarget.style.boxShadow = 'var(--shadow-hover)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-light)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--primary)'
                          e.currentTarget.style.boxShadow = 'var(--shadow-hover)'
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-light)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                        role="listitem"
                        aria-labelledby={`appointment-${appointment.id}-title`}
                        aria-describedby={`appointment-${appointment.id}-details`}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            // Focus on the first action button
                            const rescheduleBtn = e.currentTarget.querySelector('button[aria-label*="Reschedule"]') as HTMLButtonElement;
                            rescheduleBtn?.focus();
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3
                                id={`appointment-${appointment.id}-title`}
                                className="font-medium"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {appointment.profiles?.first_name} {appointment.profiles?.last_name}
                              </h3>
                              <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                                {appointment.type}
                              </span>
                            </div>
                            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                              {appointment.profiles?.role}
                            </p>
                            <div
                              id={`appointment-${appointment.id}-details`}
                              className="flex items-center space-x-4 text-sm"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              <span className="flex items-center space-x-1" aria-label={`Date: ${(() => {
                                try {
                                  return new Date(appointment.appointment_date).toLocaleDateString();
                                } catch (error) {
                                  console.warn('Error formatting appointment date:', appointment.appointment_date, error);
                                  return appointment.appointment_date || 'Unknown date';
                                }
                              })()}`}>
                                <Calendar className="w-4 h-4" aria-hidden="true" />
                                <span>{(() => {
                                  try {
                                    return new Date(appointment.appointment_date).toLocaleDateString();
                                  } catch (error) {
                                    console.warn('Error formatting appointment date:', appointment.appointment_date, error);
                                    return appointment.appointment_date || 'Unknown date';
                                  }
                                })()}</span>
                              </span>
                              <span className="flex items-center space-x-1" aria-label={`Time: ${appointment.appointment_time}`}>
                                <Clock className="w-4 h-4" aria-hidden="true" />
                                <span>{appointment.appointment_time}</span>
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: appointment.status === 'confirmed' ? 'var(--bg-success)' :
                                                appointment.status === 'pending' ? 'var(--status-warning-bg)' :
                                                'var(--status-neutral-bg)',
                                color: appointment.status === 'confirmed' ? 'var(--text-success)' :
                                       appointment.status === 'pending' ? 'var(--status-warning-text)' :
                                       'var(--status-neutral-text)'
                              }}
                              aria-label={`Appointment status: ${appointment.status}`}
                            >
                              {appointment.status}
                            </span>
                            <div className="flex items-center space-x-2">
                              <button
                                className="px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-105"
                                style={{
                                  backgroundColor: 'var(--bg-secondary)',
                                  color: 'var(--text-primary)',
                                  border: '1px solid var(--border-light)',
                                  boxShadow: 'var(--shadow-light)'
                                }}
                                aria-label={`Reschedule appointment with ${appointment.profiles?.first_name} ${appointment.profiles?.last_name}`}
                              >
                                Reschedule
                              </button>
                              <button
                                className="px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-105"
                                style={{
                                  backgroundColor: 'var(--bg-error)',
                                  color: 'var(--bg-primary)',
                                  border: '1px solid var(--error)',
                                  boxShadow: 'var(--shadow-light)'
                                }}
                                aria-label={`Cancel appointment with ${appointment.profiles?.first_name} ${appointment.profiles?.last_name}`}
                                onClick={() => {
                                  const confirmed = window.confirm(
                                    `Are you sure you want to cancel your appointment with ${appointment.profiles?.first_name} ${appointment.profiles?.last_name} on ${new Date(appointment.appointment_date).toLocaleDateString()} at ${appointment.appointment_time}?`
                                  );
                                  if (confirmed) {
                                    console.log('Cancelling appointment:', appointment.id);
                                    // Cancel appointment logic would go here
                                  }
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === 'messages' && (
            <section
              className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12"
              role="tabpanel"
              aria-labelledby="messages-tab"
              id="messages-panel"
            >
              <header className="mb-6">
                <h2
                  id="messages-heading"
                  className="text-xl sm:text-2xl font-semibold tracking-tight leading-tight"
                  style={{color: 'var(--text-primary)'}}
                >
                  Messages
                </h2>
                <p
                  className="text-sm leading-relaxed"
                  style={{color: 'var(--text-secondary)'}}
                  aria-describedby="messages-heading"
                >
                  Communicate with your care team and providers
                </p>
              </header>

              {tabDataLoading ? (
                <div className="text-center py-12" role="status" aria-live="polite">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{borderColor: 'var(--primary)'}}></div>
                  <p className="mt-4 text-sm" style={{color: 'var(--text-secondary)'}}>Loading messages...</p>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row h-[calc(100vh-250px)]">
                  {/* Message List */}
                  <div className="w-full md:w-1/3 lg:w-2/5 xl:w-1/3 border-r border-light overflow-y-auto">
                    <div className="p-4">
                      <input
                        type="text"
                        placeholder="Search messages..."
                        className="w-full px-4 py-3 rounded-xl border text-sm min-w-0 transition-all duration-300 focus:ring-2 focus:ring-opacity-50 placeholder-styled"
                        style={{
                          minWidth: '200px',
                          borderColor: 'var(--border-light)',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          boxShadow: 'var(--shadow-light)'
                        }}
                      />
                    </div>
                    <div className="divide-y divide-light">
                      {messages.length === 0 ? (
                        <div className="text-center py-12">
                          <MessageSquare className="w-12 h-12 mx-auto mb-6" style={{ color: 'var(--text-secondary)' }} />
                          <h3 className="text-lg font-semibold mb-3 macos-title">No Messages Yet</h3>
                          <p className="mb-6 text-base macos-body" style={{color: 'var(--text-secondary)'}}>Connect with your care team and join conversations to stay informed.</p>
                          <button 
                            onClick={() => navigate('/messages')}
                            className="px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                            style={{
                              backgroundColor: 'var(--primary)',
                              color: 'var(--bg-primary)',
                              boxShadow: 'var(--shadow-card)'
                            }}
                          >
                            Start Conversation
                          </button>
                        </div>
                      ) : messages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-4 cursor-pointer hover:bg-content ${
                            !message.read ? 'bg-secondary' : 'bg-primary'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-sm" style={{color: !message.read ? 'var(--primary)' : 'var(--text-secondary)'}}>
                              {message.sender}
                            </h4>
                            <p className="text-sm leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                              {new Date(message.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-sm truncate" style={{color: !message.read ? 'var(--primary)' : 'var(--text-secondary)'}}>
                            {message.subject}
                          </p>
                          <p className="text-xs truncate" style={{color: 'var(--text-secondary)'}}>
                            {message.preview}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Message Detail */}
                  <div className="w-full md:w-2/3 lg:w-3/5 xl:w-2/3 p-4 sm:p-6 md:p-6 lg:p-8 overflow-y-auto">
                    {messages.length === 0 ? (
                      <div className="text-center py-20">
                        <MessageSquare className="w-12 h-12 mx-auto mb-6" style={{ color: 'var(--text-muted)' }} />
                        <h3 className="text-xl sm:text-2xl font-semibold tracking-tight leading-tight mb-3" style={{color: 'var(--primary)'}}>Select a Message</h3>
                        <p className="leading-relaxed" style={{color: 'var(--text-secondary)'}}>Choose a message from the left to view its contents here.</p>
                      </div>
                    ) : (
                      <div className="text-center py-20">
                        <MessageSquare className="w-12 h-12 mx-auto mb-6" style={{ color: 'var(--text-muted)' }} />
                        <h3 className="text-xl font-semibold mb-3" style={{color: 'var(--primary)'}}>Message System</h3>
                        <p className="leading-relaxed mb-6" style={{color: 'var(--text-secondary)'}}>The messaging system is ready for your conversations.</p>
                        <button 
                          onClick={() => navigate('/messages')}
                          className="button-primary px-6 py-3 rounded-lg font-medium"
                        >
                          Open Full Messaging
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === 'care-groups' && (
            <section
              className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12"
              role="tabpanel"
              aria-labelledby="care-groups-tab"
              id="care-groups-panel"
            >
              <header className="mb-6">
                <h2
                  id="care-groups-heading"
                  className="text-lg font-medium"
                  style={{color: 'var(--text-primary)'}}
                >
                  Care Groups
                </h2>
                <p
                  className="text-sm"
                  style={{color: 'var(--text-secondary)'}}
                  aria-describedby="care-groups-heading"
                >
                  Connect with others who share your health journey
                </p>
              </header>

              {tabDataLoading ? (
                <div className="text-center py-12" role="status" aria-live="polite">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{borderColor: 'var(--primary)'}}></div>
                  <p className="mt-4 text-sm" style={{color: 'var(--text-secondary)'}}>Loading care groups...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => navigate('/care-groups/create')}
                      className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'var(--bg-primary)',
                        boxShadow: 'var(--shadow-card)'
                      }}
                      aria-label="Create a new care group"
                    >
                      Create New Group
                    </button>
                    <input
                      type="text"
                      placeholder="Search groups..."
                      className="w-72 px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-light)',
                        color: 'var(--text-primary)',
                        boxShadow: 'var(--shadow-light)'
                      } as React.CSSProperties}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)'
                        e.currentTarget.style.boxShadow = 'var(--focus-shadow)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-light)'
                        e.currentTarget.style.boxShadow = 'var(--shadow-light)'
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {careGroups.length === 0 ? (
                      <div className="col-span-full text-center py-12">
                        <Heart className="w-12 h-12 mx-auto mb-6" style={{color: 'var(--text-secondary)'}} />
                        <h3 className="text-lg font-semibold mb-3 macos-title">No Care Groups Yet</h3>
                        <p className="mb-6 text-base macos-body" style={{color: 'var(--text-secondary)'}}>Join supportive communities to connect with others on similar health journeys.</p>
                        <button 
                          onClick={() => navigate('/care-groups')}
                          className="px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                          style={{
                            backgroundColor: 'var(--primary)',
                            color: 'var(--bg-primary)',
                            boxShadow: 'var(--shadow-card)'
                          }}
                        >
                          Browse Care Groups
                        </button>
                      </div>
                    ) : careGroups.map((membershipData, index) => {
                      const group = membershipData.care_groups
                      return (
                      <div key={index} className="p-5 rounded-lg border transition-colors duration-150" style={{backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)'}}>
                        <h3 className="font-medium text-base mb-2" style={{color: 'var(--text-primary)'}}>{group.name}</h3>
                        <p className="text-sm mb-4" style={{color: 'var(--text-secondary)'}}>{group.description}</p>
                        <div className="flex items-center justify-between text-xs" style={{color: 'var(--text-secondary)'}}>
                          <span>{group.member_count} members</span>
                          <span>{group.privacy_setting}</span>
                        </div>
                        <button 
                          className="mt-4 w-full px-4 py-2 rounded-lg font-medium transition-all duration-200"
                          style={{
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-light)'
                          }}
                        >
                          View Group
                        </button>
                      </div>
                    )
                    })}
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === 'notifications' && (
            <section
              className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12"
              role="tabpanel"
              aria-labelledby="notifications-tab"
              id="notifications-panel"
            >
              <header className="mb-6">
                <h2
                  id="notifications-heading"
                  className="text-2xl font-bold tracking-tight"
                  style={{color: 'var(--primary)'}}
                >
                  Notifications
                </h2>
                <p
                  className="text-sm"
                  style={{color: 'var(--text-secondary)'}}
                  aria-describedby="notifications-heading"
                >
                  Stay updated on your health activities
                </p>
              </header>

              {tabDataLoading ? (
                <div className="text-center py-12" role="status" aria-live="polite">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{borderColor: 'var(--primary)'}}></div>
                  <p className="mt-4 text-sm" style={{color: 'var(--text-secondary)'}}>Loading notifications...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div key={notification.id} className="p-4 rounded-lg border" style={{backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)'}}>
                        <p className="text-sm" style={{color: 'var(--primary)'}}>{notification.title}</p>
                        <p className="text-xs mt-1" style={{color: 'var(--text-secondary)'}}>{notification.message}</p>
                        <p className="text-xs mt-1" style={{color: 'var(--text-secondary)'}}>
                          {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Bell className="w-16 h-16 mx-auto mb-4" style={{color: 'var(--text-secondary)'}} />
                      <h3 className="text-2xl font-bold tracking-tight" style={{color: 'var(--primary)'}}>
                        No New Notifications
                      </h3>
                      <p className="text-base font-medium leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                        You're all caught up! Notifications will appear here
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {activeTab === 'settings' && (
            <section
              className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12"
              role="tabpanel"
              aria-labelledby="settings-tab"
              id="settings-panel"
            >
              <header className="mb-6">
                <h2
                  id="settings-heading"
                  className="text-2xl font-bold tracking-tight"
                  style={{color: 'var(--primary)'}}
                >
                  Settings
                </h2>
                <p
                  className="text-sm"
                  style={{color: 'var(--text-secondary)'}}
                  aria-describedby="settings-heading"
                >
                  Manage your account preferences and privacy settings
                </p>
              </header>

              {tabDataLoading ? (
                <div className="text-center py-12" role="status" aria-live="polite">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{borderColor: 'var(--primary)'}}></div>
                  <p className="mt-4 text-sm" style={{color: 'var(--text-secondary)'}}>Loading settings...</p>
                </div>
              ) : (
              <section
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                role="grid"
                aria-label="Settings categories"
                aria-describedby="settings-description"
              >
                <div id="settings-description" className="sr-only">
                  Grid of settings categories including profile, notifications, privacy, care preferences, account, and help options
                </div>
                {/* Profile Settings - Enhanced Apple Style */}
                <button
                  className="p-6 rounded-2xl transition-all duration-200 cursor-pointer border hover:shadow-lg text-left w-full"
                  style={{backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)', boxShadow: 'var(--shadow-light)'}}
                  onClick={() => handleSettingsNavigation('/profile-edit')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-hover)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-light)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-light)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                  aria-label="Edit profile information"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--primary)'}}>
                      <User className="w-6 h-6" style={{color: 'var(--bg-primary)'}} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{color: 'var(--text-primary)'}}>Profile</h3>
                      <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Personal information</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                    Update your name, email, and profile picture
                  </p>
                </button>

                {/* Notification Settings */}
                <button
                  className="p-6 rounded-2xl transition-all duration-200 cursor-pointer border hover:shadow-lg text-left w-full"
                  style={{backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)', boxShadow: 'var(--shadow-light)'}}
                  onClick={() => handleSettingsNavigation('/settings')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-hover)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-light)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-light)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate('/settings')
                    }
                  }}
                  aria-label="Manage notification preferences and alert settings"
                  tabIndex={0}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--primary)'}}>
                      <Bell className="w-6 h-6" style={{color: 'var(--bg-primary)'}} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{color: 'var(--text-primary)'}}>Notifications</h3>
                      <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Alert preferences</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                    Manage email, push, and in-app notifications
                  </p>
                </button>

                {/* Privacy Settings */}
                <button
                  className="p-6 rounded-2xl transition-all duration-200 cursor-pointer border hover:shadow-lg text-left w-full"
                  style={{backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)', boxShadow: 'var(--shadow-light)'}}
                  onClick={() => navigate('/settings?section=privacy')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-hover)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-light)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-light)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate('/settings?section=privacy')
                    }
                  }}
                  aria-label="Manage privacy settings and data security preferences"
                  tabIndex={0}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--primary)'}}>
                      <Settings className="w-6 h-6" style={{color: 'var(--bg-primary)'}} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{color: 'var(--text-primary)'}}>Privacy</h3>
                      <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Data & security</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                    Control who can see your information
                  </p>
                </button>

                {/* Care Preferences */}
                <button
                  className="p-6 rounded-2xl transition-all duration-200 cursor-pointer border hover:shadow-lg text-left w-full"
                  style={{backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)', boxShadow: 'var(--shadow-light)'}}
                  onClick={() => handleSettingsNavigation('/settings', 'care-preferences')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-hover)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-light)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-light)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSettingsNavigation('/settings', 'care-preferences')
                    }
                  }}
                  aria-label="Manage care preferences and care settings"
                  tabIndex={0}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--primary)'}}>
                      <Heart className="w-6 h-6" style={{color: 'var(--bg-primary)'}} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{color: 'var(--text-primary)'}}>Care Preferences</h3>
                      <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Care settings</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                    Set your care needs and preferences
                  </p>
                </button>

                {/* Account Settings */}
                <button
                  className="p-6 rounded-2xl transition-all duration-200 cursor-pointer border hover:shadow-lg text-left w-full"
                  style={{backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)', boxShadow: 'var(--shadow-light)'}}
                  onClick={() => handleSettingsNavigation('/settings', 'account')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-hover)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-light)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-light)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSettingsNavigation('/settings', 'account')
                    }
                  }}
                  aria-label="Manage account settings including security and billing"
                  tabIndex={0}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--primary)'}}>
                      <User className="w-6 h-6" style={{color: 'var(--bg-primary)'}} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{color: 'var(--text-primary)'}}>Account</h3>
                      <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Security & billing</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                    Password, billing, and account management
                  </p>
                </button>

                {/* Help & Support */}
                <button
                  className="p-6 rounded-2xl transition-all duration-200 cursor-pointer border hover:shadow-lg text-left w-full"
                  style={{backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)', boxShadow: 'var(--shadow-light)'}}
                  onClick={() => handleSettingsNavigation('/help')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-hover)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-light)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-light)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSettingsNavigation('/help')
                    }
                  }}
                  aria-label="Access help and support resources"
                  tabIndex={0}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--primary)'}}>
                      <MessageSquare className="w-6 h-6" style={{color: 'var(--bg-primary)'}} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{color: 'var(--text-primary)'}}>Help & Support</h3>
                      <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Get assistance</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                    Contact support and view help resources
                  </p>
                </button>
              </section>
              )}
            </section>
          )}

          {activeTab === 'safety-location' && (
            <section
              className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12"
              role="tabpanel"
              aria-labelledby="safety-location-tab"
              id="safety-location-panel"
            >
              <header className="mb-6">
                <h2
                  id="safety-location-heading"
                  className="text-2xl font-bold tracking-tight"
                  style={{color: 'var(--primary)'}}
                >
                  Safety & Location
                </h2>
                <p
                  className="text-sm"
                  style={{color: 'var(--text-secondary)'}}
                  aria-describedby="safety-location-heading"
                >
                  Manage location sharing and safety check-ins for peace of mind
                </p>
              </header>

              {tabDataLoading ? (
                <div className="text-center py-12" role="status" aria-live="polite">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{borderColor: 'var(--primary)'}}></div>
                  <p className="mt-4 text-sm" style={{color: 'var(--text-secondary)'}}>Loading safety settings...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl border" style={{backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)', boxShadow: 'var(--shadow-light)'}}>
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--primary)'}}>
                          <Shield className="w-6 h-6" style={{color: 'var(--bg-primary)'}} />
                        </div>
                        <div>
                          <h3 className="font-semibold" style={{color: 'var(--text-primary)'}}>Safety Check-ins</h3>
                          <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Automated safety monitoring</p>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed mb-4" style={{color: 'var(--text-secondary)'}}>
                        Set up automatic check-ins during care sessions for added security and peace of mind.
                      </p>
                      <button 
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                        style={{
                          backgroundColor: 'var(--color-primary)',
                          color: 'var(--bg-primary)',
                          border: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)'
                          e.currentTarget.style.boxShadow = 'var(--shadow-button-hover)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        Configure Check-ins
                      </button>
                    </div>

                    <div className="p-6 rounded-2xl border" style={{backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)', boxShadow: 'var(--shadow-light)'}}>
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--primary)'}}>
                          <MapPin className="w-6 h-6" style={{color: 'var(--bg-primary)'}} />
                        </div>
                        <div>
                          <h3 className="font-semibold" style={{color: 'var(--text-primary)'}}>Location Sharing</h3>
                          <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Share location with trusted contacts</p>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed mb-4" style={{color: 'var(--text-secondary)'}}>
                        Allow trusted family members to track your location during care appointments.
                      </p>
                      <button 
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-light)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)'
                          e.currentTarget.style.boxShadow = 'var(--shadow-button-hover)'
                          e.currentTarget.style.borderColor = 'var(--primary)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                          e.currentTarget.style.borderColor = 'var(--border-light)'
                        }}
                      >
                        Manage Contacts
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === 'medication-management' && (
            <section
              className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12"
              role="tabpanel"
              aria-labelledby="medication-management-tab"
              id="medication-management-panel"
            >
              <header className="mb-6">
                <h2
                  id="medication-management-heading"
                  className="text-2xl font-bold tracking-tight"
                  style={{color: 'var(--primary)'}}
                >
                  Medication Management
                </h2>
                <p
                  className="text-sm"
                  style={{color: 'var(--text-secondary)'}}
                  aria-describedby="medication-management-heading"
                >
                  Track medications, set reminders, and manage prescriptions
                </p>
              </header>

              {tabDataLoading ? (
                <div className="text-center py-12" role="status" aria-live="polite">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{borderColor: 'var(--primary)'}}></div>
                  <p className="mt-4 text-sm" style={{color: 'var(--text-secondary)'}}>Loading medications...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl border" style={{backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)', boxShadow: 'var(--shadow-light)'}}>
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--primary)'}}>
                          <Pill className="w-6 h-6" style={{color: 'var(--bg-primary)'}} />
                        </div>
                        <div>
                          <h3 className="font-semibold" style={{color: 'var(--text-primary)'}}>My Medications</h3>
                          <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Current prescriptions</p>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed mb-4" style={{color: 'var(--text-secondary)'}}>
                        View and manage your current medication list and dosage schedules.
                      </p>
                      <button 
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                        style={{
                          backgroundColor: 'var(--color-primary)',
                          color: 'var(--bg-primary)',
                          border: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)'
                          e.currentTarget.style.boxShadow = 'var(--shadow-button-hover)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        View Medications
                      </button>
                    </div>

                    <div className="p-6 rounded-2xl border" style={{backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)', boxShadow: 'var(--shadow-light)'}}>
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--primary)'}}>
                          <Bell className="w-6 h-6" style={{color: 'var(--bg-primary)'}} />
                        </div>
                        <div>
                          <h3 className="font-semibold" style={{color: 'var(--text-primary)'}}>Reminders</h3>
                          <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Medication alerts</p>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed mb-4" style={{color: 'var(--text-secondary)'}}>
                        Set up automatic reminders to never miss a dose.
                      </p>
                      <button 
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-light)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)'
                          e.currentTarget.style.boxShadow = 'var(--shadow-button-hover)'
                          e.currentTarget.style.borderColor = 'var(--primary)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                          e.currentTarget.style.borderColor = 'var(--border-light)'
                        }}
                      >
                        Set Reminders
                      </button>
                    </div>

                    <div className="p-6 rounded-2xl border" style={{backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)', boxShadow: 'var(--shadow-light)'}}>
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--primary)'}}>
                          <FileText className="w-6 h-6" style={{color: 'var(--bg-primary)'}} />
                        </div>
                        <div>
                          <h3 className="font-semibold" style={{color: 'var(--text-primary)'}}>Prescriptions</h3>
                          <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Refill management</p>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed mb-4" style={{color: 'var(--text-secondary)'}}>
                        Track prescription refills and communicate with your pharmacy.
                      </p>
                      <button 
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-light)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)'
                          e.currentTarget.style.boxShadow = 'var(--shadow-button-hover)'
                          e.currentTarget.style.borderColor = 'var(--primary)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                          e.currentTarget.style.borderColor = 'var(--border-light)'
                        }}
                      >
                        Manage Refills
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === 'providers' && (
            <section
              className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12"
              role="tabpanel"
              aria-labelledby="providers-tab"
              id="providers-panel"
            >
              <header className="mb-6">
                <h2
                  id="providers-heading"
                  className="text-2xl font-bold tracking-tight"
                  style={{color: 'var(--primary)'}}
                >
                  Providers
                </h2>
                <p
                  className="text-sm"
                  style={{color: 'var(--text-secondary)'}}
                  aria-describedby="providers-heading"
                >
                  Manage your saved caregivers and find new ones
                </p>
              </header>

              {tabDataLoading ? (
                <div className="text-center py-12" role="status" aria-live="polite">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{borderColor: 'var(--primary)'}}></div>
                  <p className="mt-4 text-sm" style={{color: 'var(--text-secondary)'}}>Loading providers...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        navigate('/find-care')
                      }}
                      className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'var(--bg-primary)',
                        boxShadow: 'var(--shadow-card)'
                      }}>
                      Find New Providers
                    </button>
                    <input
                      type="text"
                      placeholder="Search providers..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-72 px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-light)',
                        color: 'var(--text-primary)',
                        boxShadow: 'var(--shadow-light)'
                      } as React.CSSProperties}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)'
                        e.currentTarget.style.boxShadow = 'var(--focus-shadow)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-light)'
                        e.currentTarget.style.boxShadow = 'var(--shadow-light)'
                      }}
                    />
                  </div>

                  <div className="border rounded-lg p-6 text-center" style={{backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)'}}>
                    <User className="w-12 h-12 mx-auto mb-6" style={{color: 'var(--text-secondary)'}} />
                    <h3 className="text-lg font-semibold mb-3 macos-title">No Saved Providers Yet</h3>
                    <p className="mb-6 text-base macos-body" style={{color: 'var(--text-secondary)'}}>
                      Discover and save your favorite caregivers for easy appointment booking.
                    </p>
                    <button
                      onClick={() => {
                        navigate('/find-care')
                      }}
                      className="px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'var(--bg-primary)',
                        boxShadow: 'var(--shadow-card)'
                      }}>
                      Browse Providers
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  )
}