import { supabase, authClient } from './supabase'

// Survey platform data service
export const dataService = {
  // Auth methods - following tutorial pattern
  async signIn(email: string, password: string) {
    try {
      // Use supabase client for signInWithPassword (tutorial rule)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      return { user: data.user, session: data.session }
    } catch (error) {
      console.error('Error in signIn:', error)
      throw error
    }
  },

  async signOut() {
    try {
      const { error } = await authClient.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error in signOut:', error)
      throw error
    }
  },

  async getCurrentUser() {
    try {
      // Use supabase client for getUser (tutorial rule)
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  },

  // Survey entries CRUD operations using new table
  async getSurveyEntries(userId: string) {
    try {
      const { data, error } = await supabase
        .from('survey_entries')
        .select('*')
        .eq('user_id', userId)
        .order('entry_timestamp', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching survey entries:', error)
      return []
    }
  },
  
  // Legacy method redirect
  async getCareLogEntries(userId: string) {
    return this.getSurveyEntries(userId)
  },

  async createSurveyEntry(entry: any) {
    try {
      // Map fields to new table structure with ALL comprehensive fields
      const mappedEntry = {
        user_id: entry.user_id,
        entry_type: entry.type || entry.entry_type,
        caregiver_role: entry.caregiver_role,
        description: entry.description,
        difficulties_challenges: entry.difficulties_challenges,
        person_want_to_do_with: entry.person_want_to_do_with,
        struggles_encountered: entry.struggles_encountered,
        tools_using: entry.tools_using,
        tools_wanted: entry.tools_wanted,
        people_with: entry.people_with,
        people_want_with: entry.people_want_with,
        communication_challenges: entry.communication_challenges,
        collaboration_challenges: entry.collaboration_challenges,
        cooperation_challenges: entry.cooperation_challenges,
        help_reaching_challenges: entry.help_reaching_challenges,
        knowledge_gaps: entry.knowledge_gaps,
        liability_concerns: entry.liability_concerns,
        time_spent: entry.time_spent,
        emotional_impact: entry.emotional_impact,
        urgency_level: entry.urgency_level,
        support_needed: entry.support_needed,
        entry_timestamp: entry.timestamp || new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('survey_entries')
        .insert([mappedEntry])
        .select()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating survey entry:', error)
      throw error
    }
  },
  
  async createCareLogEntry(entry: any) {
    return this.createSurveyEntry(entry)
  },

  async updateSurveyEntry(id: number, updates: any) {
    try {
      // Map all comprehensive fields
      const mappedUpdates = {
        entry_type: updates.type || updates.entry_type,
        caregiver_role: updates.caregiver_role,
        description: updates.description,
        difficulties_challenges: updates.difficulties_challenges,
        person_want_to_do_with: updates.person_want_to_do_with,
        struggles_encountered: updates.struggles_encountered,
        tools_using: updates.tools_using,
        tools_wanted: updates.tools_wanted,
        people_with: updates.people_with,
        people_want_with: updates.people_want_with,
        communication_challenges: updates.communication_challenges,
        collaboration_challenges: updates.collaboration_challenges,
        cooperation_challenges: updates.cooperation_challenges,
        help_reaching_challenges: updates.help_reaching_challenges,
        knowledge_gaps: updates.knowledge_gaps,
        liability_concerns: updates.liability_concerns,
        time_spent: updates.time_spent,
        emotional_impact: updates.emotional_impact,
        urgency_level: updates.urgency_level,
        support_needed: updates.support_needed,
        entry_timestamp: updates.timestamp || updates.entry_timestamp,
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('survey_entries')
        .update(mappedUpdates)
        .eq('id', id)
        .select()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating survey entry:', error)
      throw error
    }
  },
  
  async updateCareLogEntry(id: number, updates: any) {
    return this.updateSurveyEntry(id, updates)
  },

  async deleteSurveyEntry(id: number) {
    try {
      const { error } = await supabase
        .from('survey_entries')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting survey entry:', error)
      throw error
    }
  },
  
  async deleteCareLogEntry(id: number) {
    return this.deleteSurveyEntry(id)
  },

  // Profile methods
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting user profile:', error)
      throw error
    }
  },

  async updateUserProfile(userId: string, profileData: any) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  },

  // Survey enrollment methods
  async getSurveyEnrollment(userId: string) {
    try {
      const { data, error } = await supabase
        .from('survey_enrollments')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.error('Error fetching enrollment:', error)
      return null
    }
  },

  async createSurveyEnrollment(userId: string, startDate: Date) {
    try {
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 6)

      const { data, error } = await supabase
        .from('survey_enrollments')
        .insert([{
          user_id: userId,
          enrollment_date: new Date().toISOString().split('T')[0],
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          status: 'active'
        }])
        .select()

      if (error) throw error
      return data ? data[0] : null
    } catch (error) {
      console.error('Error creating enrollment:', error)
      throw error
    }
  },

  async getCurrentSurveyDay(userId: string) {
    try {
      const { data, error } = await supabase
        .from('enrollment')
        .select('study_start_date')
        .eq('participant_id', userId)
        .limit(1)

      if (error || !data || !data[0]?.study_start_date) return 0

      const startDate = new Date(data[0].study_start_date)
      const today = new Date()
      const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const currentDay = daysDiff + 1

      if (currentDay < 1) return 1
      if (currentDay > 7) return 7
      return currentDay
    } catch (error) {
      console.error('Error getting survey day:', error)
      return 0
    }
  },

  async updateSurveyEnrollmentStatus(userId: string, status: 'active' | 'completed' | 'paused') {
    try {
      const { data, error } = await supabase
        .from('survey_enrollments')
        .update({ status })
        .eq('user_id', userId)
        .select()

      if (error) throw error
      return data ? data[0] : null
    } catch (error) {
      console.error('Error updating enrollment status:', error)
      throw error
    }
  },

  // Notification preferences methods
  async getNotificationPreferences(userId: string) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('hourly_reminders_enabled, notification_permission_status')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError

      const { data: dndPeriods, error: dndError } = await supabase
        .from('dnd_periods')
        .select('*')
        .eq('user_id', userId)
        .order('start_time')

      if (dndError) throw dndError

      return {
        ...profile,
        dnd_periods: dndPeriods || []
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error)
      return null
    }
  },

  async updateNotificationPreferences(userId: string, preferences: {
    hourly_reminders_enabled?: boolean;
    notification_permission_status?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(preferences)
        .eq('id', userId)
        .select('hourly_reminders_enabled, notification_permission_status')
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      throw error
    }
  },

  // DND Periods CRUD
  async getDNDPeriods(userId: string) {
    try {
      const { data, error } = await supabase
        .from('dnd_periods')
        .select('*')
        .eq('user_id', userId)
        .order('start_time')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching DND periods:', error)
      return []
    }
  },

  async addDNDPeriod(userId: string, period: {
    start_time: string;
    end_time: string;
    label?: string;
    is_active?: boolean;
  }) {
    try {
      const { data, error } = await supabase
        .from('dnd_periods')
        .insert([{
          user_id: userId,
          ...period,
          is_active: period.is_active ?? true
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding DND period:', error)
      throw error
    }
  },

  async updateDNDPeriod(periodId: number, updates: {
    start_time?: string;
    end_time?: string;
    label?: string;
    is_active?: boolean;
  }) {
    try {
      const { data, error } = await supabase
        .from('dnd_periods')
        .update(updates)
        .eq('id', periodId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating DND period:', error)
      throw error
    }
  },

  async deleteDNDPeriod(periodId: number) {
    try {
      const { error } = await supabase
        .from('dnd_periods')
        .delete()
        .eq('id', periodId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting DND period:', error)
      throw error
    }
  },

  // Add getCaregivers for compatibility
  async getCaregivers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'caregiver')
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting caregivers:', error)
      return []
    }
  }
}
