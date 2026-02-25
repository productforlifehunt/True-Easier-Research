import React, { useState, useEffect } from 'react';
import { dataService } from '../lib/dataService';
import { useAuth } from '../hooks/useStateManagement';
import { supabase } from '../lib/supabase';
import { Trash2, Edit2, Save, X, Plus, Sparkles, Mic, Loader2, BarChart3, Filter, Settings, Calendar, Users, Wrench, MessageCircle, Heart, Clock, AlertCircle, ChevronRight, Package } from 'lucide-react';
import Toast from '../components/Toast';
import SurveyEnrollmentModal from '../components/SurveyEnrollmentModal';
import { AISurveyAssistant } from '../components/AISurveyAssistant';
import AuthModal from '../components/AuthModal';
import DesktopHeader from '../components/DesktopHeader';
import MobileHeader from '../components/MobileHeader';

interface SurveyEntry {
  id: number;
  user_id: string;
  entry_type: 'care_activity' | 'care_need' | 'struggle';
  caregiver_role?: 'primary' | 'other';
  description: string;
  difficulties_challenges?: string;
  person_want_to_do_with?: string;
  struggles_encountered?: string;
  tools_using?: string;
  tools_wanted?: string;
  people_with?: string;
  people_want_with?: string;
  communication_challenges?: string;
  collaboration_challenges?: string;
  cooperation_challenges?: string;
  help_reaching_challenges?: string;
  knowledge_gaps?: string;
  liability_concerns?: string;
  time_spent?: number;
  emotional_impact?: string;
  urgency_level?: string;
  support_needed?: string;
  entry_timestamp?: string;
  created_at?: string;
  updated_at?: string;
}

interface DementiaCaregiverSurveyProps {
  language?: 'en' | 'zh';
}

const DementiaCaregiverSurvey: React.FC<DementiaCaregiverSurveyProps> = ({ language = 'en' }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<SurveyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'activity' | 'people' | 'challenges' | 'resources'>('activity');
  
  // Survey enrollment states
  const [currentDay, setCurrentDay] = useState<number>(0);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  
  // Auth protection
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // AI feature states
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiFieldContext, setAiFieldContext] = useState<{ field: string; question: string; answer: string }>({ field: '', question: '', answer: '' });
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter and view states
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [caregiverRoleFilter, setCaregiverRoleFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Form state
  const [formData, setFormData] = useState<{
    entry_type: 'care_activity' | 'care_need' | 'struggle';
    description: string;
    difficulties_challenges: string;
    person_want_to_do_with: string;
    struggles_encountered: string;
    tools_using: string;
    tools_wanted: string;
    people_with: string;
    people_want_with: string;
    communication_challenges: string;
    collaboration_challenges: string;
    cooperation_challenges: string;
    help_reaching_challenges: string;
    knowledge_gaps: string;
    liability_concerns: string;
    time_spent: number;
    emotional_impact: string;
    urgency_level: string;
    support_needed: string;
  }>({
    entry_type: 'care_activity',
    description: '',
    difficulties_challenges: '',
    person_want_to_do_with: '',
    struggles_encountered: '',
    tools_using: '',
    tools_wanted: '',
    people_with: '',
    people_want_with: '',
    communication_challenges: '',
    collaboration_challenges: '',
    cooperation_challenges: '',
    help_reaching_challenges: '',
    knowledge_gaps: '',
    liability_concerns: '',
    time_spent: 0,
    emotional_impact: '',
    urgency_level: 'medium',
    support_needed: ''
  });

  const t = {
    en: {
      title: 'Daily Survey',
      subtitle: 'Track your caregiving journey',
      loadingEntries: 'Loading entries...',
      statistics: 'Statistics',
      totalEntries: 'Total Entries',
      thisWeek: 'This Week',
      thisMonth: 'This Month',
      filterByType: 'Filter by Type',
      filterByDate: 'Filter by Date',
      allTypes: 'All Types',
      today: 'Today',
      last7Days: 'Last 7 Days',
      last30Days: 'Last 30 Days',
      allTime: 'All Time',
      filterByRole: 'Filter by Caregiver Role',
      allRoles: 'All Caregivers',
      primaryCaregiver: 'Primary Caregiver',
      otherCaregiver: 'Other Caregiver',
      sortBy: 'Sort by',
      newest: 'Newest First',
      oldest: 'Oldest First',
      settingsTitle: 'Settings',
      closeSettings: 'Close Settings',
      noEntries: 'No entries yet. Add your first entry below.',
      addEntry: 'Add New Entry',
      entryType: 'Entry Type',
      careActivity: 'Care Activity',
      careNeed: 'Care Need',
      struggle: 'Struggle',
      description: 'Description',
      difficulties: 'Difficulties/Challenges',
      personWantToDo: 'Person I want to do this with',
      struggles: 'Struggles Encountered',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      create: 'Create Entry',
      update: 'Update Entry'
    },
    zh: {
      title: '每日问卷',
      subtitle: '记录您的照护历程',
      loadingEntries: '加载中...',
      statistics: '统计信息',
      totalEntries: '总条目',
      thisWeek: '本周',
      thisMonth: '本月',
      filterByType: '按类型筛选',
      filterByDate: '按日期筛选',
      allTypes: '所有类型',
      today: '今天',
      last7Days: '最近7天',
      last30Days: '最近30天',
      allTime: '全部时间',
      filterByRole: '按照护角色筛选',
      allRoles: '所有照护者',
      primaryCaregiver: '主要照护者',
      otherCaregiver: '其他照护者',
      sortBy: '排序方式',
      newest: '最新优先',
      oldest: '最旧优先',
      settingsTitle: '设置',
      closeSettings: '关闭设置',
      noEntries: '还没有条目。在下面添加您的第一个条目。',
      addEntry: '添加新条目',
      entryType: '条目类型',
      careActivity: '护理活动',
      careNeed: '护理需求',
      struggle: '挣扎',
      description: '描述',
      difficulties: '困难/挑战',
      personWantToDo: '我想与之一起做的人',
      struggles: '遇到的挣扎',
      save: '保存',
      cancel: '取消',
      edit: '编辑',
      delete: '删除',
      create: '创建条目',
      update: '更新条目'
    }
  };

  const text = t[language];

  // Calculate statistics
  const getFilteredEntries = () => {
    let filtered = [...entries];
    
    // Filter by type
    if (filterType !== 'all' && filterType !== 'All Types') {
      filtered = filtered.filter(e => e.entry_type === filterType);
    }
    
    // Filter by caregiver role
    if (caregiverRoleFilter !== 'all') {
      filtered = filtered.filter(e => e.caregiver_role === caregiverRoleFilter);
    }
    
    // Filter by date - including study day filter
    const now = new Date();
    if (dateFilter === 'today') {
      // Filter by current study day based on enrollment
      if (enrollment && currentDay > 0) {
        // Calculate the calendar date for the current study day
        const startDate = new Date(enrollment.start_date);
        const targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + (currentDay - 1));
        
        filtered = filtered.filter(e => {
          const entryDate = new Date(e.entry_timestamp);
          return entryDate.toDateString() === targetDate.toDateString();
        });
      } else {
        // Fallback to today's calendar date if no enrollment
        filtered = filtered.filter(e => {
          const entryDate = new Date(e.entry_timestamp);
          return entryDate.toDateString() === now.toDateString();
        });
      }
    } else if (dateFilter === 'last7Days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(e => new Date(e.entry_timestamp) >= sevenDaysAgo);
    } else if (dateFilter === 'last30Days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(e => new Date(e.entry_timestamp) >= thirtyDaysAgo);
    }
    
    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.entry_timestamp).getTime();
      const dateB = new Date(b.entry_timestamp).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    return filtered;
  };
  
  const filteredEntries = getFilteredEntries();
  
  const stats = {
    total: entries.length,
    thisWeek: entries.filter(e => {
      const entryDate = new Date(e.entry_timestamp);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return entryDate >= weekAgo;
    }).length,
    thisMonth: entries.filter(e => {
      const entryDate = new Date(e.entry_timestamp);
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return entryDate >= monthAgo;
    }).length,
    careActivities: entries.filter(e => e.entry_type === 'care_activity').length,
    careNeeds: entries.filter(e => e.entry_type === 'care_need').length,
    struggles: entries.filter(e => e.entry_type === 'struggle').length
  };

  // Auth is handled on-demand when users try to perform protected actions

  // Load enrollment status and entries
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        if (!user) {
          // For non-authenticated users, just show empty state
          setEntries([]);
          setLoading(false);
          return;
        }
        
        // Check enrollment status
        const enrollmentData = await dataService.getSurveyEnrollment(user.id);
        
        if (!enrollmentData) {
          // Show enrollment modal if not enrolled
          setShowEnrollmentModal(true);
          setCurrentDay(0);
        } else {
          // Set enrollment first
          setEnrollment(enrollmentData);
          
          // Get current survey day - ensure it's calculated and displayed
          const day = await dataService.getCurrentSurveyDay(user.id);
          
          // Ensure day is set to at least 1 if enrollment exists
          const displayDay = day > 0 ? day : 1;
          setCurrentDay(displayDay);
        }
        
        // Load entries
        const data = await dataService.getSurveyEntries(user.id);
        setEntries(data);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Handle enrollment
  const handleEnroll = async (startDate: Date) => {
    if (!user) return;
    
    try {
      const enrollmentData = await dataService.createSurveyEnrollment(user.id, startDate);
      setEnrollment(enrollmentData);
      setShowEnrollmentModal(false);
      
      // Get current day
      const day = await dataService.getCurrentSurveyDay(user.id);
      setCurrentDay(day);
      
      setToast({ message: language === 'zh' ? '注册成功！' : 'Enrollment successful!', type: 'success' });
    } catch (error) {
      console.error('Error enrolling:', error);
      setToast({ message: language === 'zh' ? '注册失败' : 'Enrollment failed', type: 'error' });
    }
  };

  // CREATE
  const handleCreate = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      setIsLoading(true);
      const created = await dataService.createSurveyEntry({
        ...formData,
        user_id: user.id,
        entry_timestamp: new Date().toISOString()
      });
      
      if (created && created[0]) {
        setEntries([created[0], ...entries]);
        setShowCreateForm(false);
        setFormData({
          entry_type: 'care_activity',
          description: '',
          difficulties_challenges: '',
          person_want_to_do_with: '',
          struggles_encountered: '',
          tools_using: '',
          tools_wanted: '',
          people_with: '',
          people_want_with: '',
          communication_challenges: '',
          collaboration_challenges: '',
          cooperation_challenges: '',
          help_reaching_challenges: '',
          knowledge_gaps: '',
          liability_concerns: '',
          time_spent: 0,
          emotional_impact: '',
          urgency_level: 'medium',
          support_needed: ''
        });
        setToast({ message: 'Entry created successfully!', type: 'success' });
      }
    } catch (error) {
      console.error('Error creating entry:', error);
      setToast({ message: 'Failed to create entry. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // UPDATE
  const handleUpdate = async (id: number) => {
    try {
      setIsLoading(true);
      const updated = await dataService.updateSurveyEntry(id, formData);
      if (updated && updated[0]) {
        setEntries(entries.map(e => e.id === id ? updated[0] : e));
        setEditingId(null);
        setFormData({
          entry_type: 'care_activity',
          description: '',
          difficulties_challenges: '',
          person_want_to_do_with: '',
          struggles_encountered: '',
          tools_using: '',
          tools_wanted: '',
          people_with: '',
          people_want_with: '',
          communication_challenges: '',
          collaboration_challenges: '',
          cooperation_challenges: '',
          help_reaching_challenges: '',
          knowledge_gaps: '',
          liability_concerns: '',
          time_spent: 0,
          emotional_impact: '',
          urgency_level: 'medium',
          support_needed: ''
        });
        setToast({ message: 'Entry updated successfully!', type: 'success' });
      }
    } catch (error) {
      console.error('Error updating entry:', error);
      setToast({ message: 'Failed to update entry. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // DELETE
  const handleDelete = async (id: number) => {
    try {
      setIsLoading(true);
      await dataService.deleteSurveyEntry(id);
      setEntries(entries.filter(e => e.id !== id));
      setDeleteConfirmId(null);
      setToast({ message: 'Entry deleted successfully!', type: 'success' });
    } catch (error) {
      console.error('Error deleting entry:', error);
      setToast({ message: 'Failed to delete entry. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (entry: SurveyEntry) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setEditingId(entry.id);
    setActiveTab('activity');
    setShowCreateForm(false);
    setFormData({
      entry_type: entry.entry_type,
      description: entry.description,
      difficulties_challenges: entry.difficulties_challenges || '',
      person_want_to_do_with: entry.person_want_to_do_with || '',
      struggles_encountered: entry.struggles_encountered || '',
      tools_using: entry.tools_using || '',
      tools_wanted: entry.tools_wanted || '',
      people_with: entry.people_with || '',
      people_want_with: entry.people_want_with || '',
      communication_challenges: entry.communication_challenges || '',
      collaboration_challenges: entry.collaboration_challenges || '',
      cooperation_challenges: entry.cooperation_challenges || '',
      help_reaching_challenges: entry.help_reaching_challenges || '',
      knowledge_gaps: entry.knowledge_gaps || '',
      liability_concerns: entry.liability_concerns || '',
      time_spent: entry.time_spent || 0,
      emotional_impact: entry.emotional_impact || '',
      urgency_level: entry.urgency_level || 'medium',
      support_needed: entry.support_needed || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowCreateForm(false);
    setFormData({
      entry_type: 'care_activity',
      description: '',
      difficulties_challenges: '',
      person_want_to_do_with: '',
      struggles_encountered: '',
      tools_using: '',
      tools_wanted: '',
      people_with: '',
      people_want_with: '',
      communication_challenges: '',
      collaboration_challenges: '',
      cooperation_challenges: '',
      help_reaching_challenges: '',
      knowledge_gaps: '',
      liability_concerns: '',
      time_spent: 0,
      emotional_impact: '',
      urgency_level: 'medium',
      support_needed: ''
    });
  };

  // Initialize Web Speech API (browser-native, free, works in Chrome & Safari)
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = language === 'zh' ? 'zh-CN' : 'en-US';
      setRecognition(recognitionInstance);
    }
  }, [language]);

  // Handle AI copy answer to form field
  const handleCopyAnswer = (answer: string) => {
    if (aiFieldContext.field) {
      setFormData({ ...formData, [aiFieldContext.field]: answer });
    }
  };

  // Voice Input using Web Speech API (100% free, browser-native, works in Chrome & Safari)
  const handleVoiceInput = (field: 'description' | 'difficulties_challenges' | 'help_reaching_challenges' | 'communication_challenges' | 'collaboration_challenges' | 'knowledge_gaps' | 'liability_concerns' | 'tools_using' | 'tools_wanted' | 'support_needed') => {
    if (!recognition) {
      setToast({ message: 'Speech recognition is not supported in your browser. Please use Chrome or Safari.', type: 'error' });
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
      return;
    }

    // Capture current field in closure
    const targetField = field;
    const currentFormData = formData;

    setIsRecording(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      
      setFormData((prev) => ({
        ...prev,
        [targetField]: prev[targetField] ? prev[targetField] + ' ' + transcript : transcript
      }));
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setToast({ message: 'Speech recognition error: ' + event.error, type: 'error' });
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setToast({ message: 'Failed to start voice recording', type: 'error' });
      setIsRecording(false);
    }
  };



  if (loading) {
    return (
      <div 
        className="container mx-auto px-4 py-6 max-w-4xl">
        <p className="text-center" style={{ color: 'var(--text-secondary)' }}>{text.loadingEntries}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <DesktopHeader />
      <MobileHeader />
      
      {/* Main Container */}
      <div className="container mx-auto px-3 py-4 max-w-4xl pb-20">
        {/* Header - Compact with Survey Day */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {text.title}
              </h1>
              {enrollment && currentDay >= 1 && (
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {language === 'zh' ? `第 ${currentDay} 天 / 共 7 天` : `Day ${currentDay} of 7`}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowStats(!showStats)}
                className="p-2 rounded-lg transition-all min-w-[40px] min-h-[40px]"
                style={{ 
                  backgroundColor: showStats ? 'var(--color-green)' : 'var(--bg-card)',
                  color: showStats ? 'white' : 'var(--text-secondary)'
                }}
                aria-label="Toggle statistics"
              >
                <BarChart3 style={{ width: 'clamp(1.25rem, 3vw, 1.5rem)', height: 'clamp(1.25rem, 3vw, 1.5rem)' }} />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg transition-all min-w-[40px] min-h-[40px]"
                style={{ 
                  backgroundColor: showSettings ? 'var(--color-green)' : 'var(--bg-card)',
                  color: showSettings ? 'white' : 'var(--text-secondary)'
                }}
                aria-label="Toggle settings"
              >
                <Settings style={{ width: 'clamp(1.25rem, 3vw, 1.5rem)', height: 'clamp(1.25rem, 3vw, 1.5rem)' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Panel */}
        {showStats && (
          <div className="bg-white rounded-2xl p-4 mb-3 border" style={{ borderColor: 'var(--border-light)' }}>
            <h2 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
              <BarChart3 className="mr-2" style={{ width: 'clamp(1.25rem, 3vw, 1.5rem)', height: 'clamp(1.25rem, 3vw, 1.5rem)' }} />
              {text.statistics}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="text-center p-5 rounded-xl transition-all hover:shadow-sm" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
                <div className="text-xs uppercase tracking-wider mb-3 font-medium" style={{ color: 'var(--text-muted)' }}>
                  {language === 'zh' ? '总条目' : 'Total'}
                </div>
                <div className="text-3xl font-bold" style={{ color: 'var(--color-green)' }}>
                  {stats.total || 0}
                </div>
              </div>
              <div className="text-center p-5 rounded-xl transition-all hover:shadow-sm" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
                <div className="text-xs uppercase tracking-wider mb-3 font-medium" style={{ color: 'var(--text-muted)' }}>
                  {language === 'zh' ? '本周' : 'Week'}
                </div>
                <div className="text-3xl font-bold" style={{ color: 'var(--color-green)' }}>
                  {stats.thisWeek || 0}
                </div>
              </div>
              <div className="text-center p-5 rounded-xl transition-all hover:shadow-sm" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
                <div className="text-xs uppercase tracking-wider mb-3 font-medium" style={{ color: 'var(--text-muted)' }}>
                  {language === 'zh' ? '活动' : 'Activities'}
                </div>
                <div className="text-3xl font-bold" style={{ color: 'var(--color-green)' }}>
                  {stats.careActivities || 0}
                </div>
              </div>
              <div className="text-center p-5 rounded-xl transition-all hover:shadow-sm" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
                <div className="text-xs uppercase tracking-wider mb-3 font-medium" style={{ color: 'var(--text-muted)' }}>
                  {language === 'zh' ? '本月' : 'Month'}
                </div>
                <div className="text-3xl font-bold" style={{ color: 'var(--color-green)' }}>
                  {stats.thisMonth || 0}
                </div>
              </div>
              <div className="text-center p-5 rounded-xl transition-all hover:shadow-sm" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
                <div className="text-xs uppercase tracking-wider mb-3 font-medium" style={{ color: 'var(--text-muted)' }}>
                  {language === 'zh' ? '需求' : 'Needs'}
                </div>
                <div className="text-3xl font-bold" style={{ color: 'var(--color-green)' }}>
                  {stats.careNeeds || 0}
                </div>
              </div>
              <div className="text-center p-5 rounded-xl transition-all hover:shadow-sm" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
                <div className="text-xs uppercase tracking-wider mb-3 font-medium" style={{ color: 'var(--text-muted)' }}>
                  {language === 'zh' ? '挣扎' : 'Struggles'}
                </div>
                <div className="text-3xl font-bold" style={{ color: 'var(--color-green)' }}>
                  {stats.struggles || 0}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white rounded-2xl p-4 mb-3 border" style={{ borderColor: 'var(--border-light)' }}>
            <h2 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
              <Filter className="mr-2" style={{ width: 'clamp(1.25rem, 3vw, 1.5rem)', height: 'clamp(1.25rem, 3vw, 1.5rem)' }} />
              {text.settingsTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <Calendar className="inline w-4 h-4 mr-1" />
                  {text.filterByDate}
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="ios-text-field w-full"
                >
                  <option value="today">{text.today}</option>
                  <option value="last7Days">{text.last7Days}</option>
                  <option value="last30Days">{text.last30Days}</option>
                  <option value="all">{text.allTime}</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {text.filterByType}
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="ios-text-field w-full"
                >
                  <option value="all">{text.allTypes}</option>
                  <option value="care_activity">{text.careActivity}</option>
                  <option value="care_need">{text.careNeed}</option>
                  <option value="struggle">{text.struggle}</option>
                </select>
              </div>

              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {text.filterByRole}
                </label>
                <select
                  value={caregiverRoleFilter}
                  onChange={(e) => setCaregiverRoleFilter(e.target.value)}
                  className="ios-text-field w-full"
                >
                  <option value="all">{text.allRoles}</option>
                  <option value="primary">{text.primaryCaregiver}</option>
                  <option value="other">{text.otherCaregiver}</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {text.sortBy}
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                  className="ios-text-field w-full"
                >
                  <option value="newest">{text.newest}</option>
                  <option value="oldest">{text.oldest}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Create Form - Modern Apple Style Multi-Tab */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl p-4 mb-3 border" style={{ borderColor: 'var(--border-light)' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {text.create}
            </h3>
            
            {/* Tab Navigation - Responsive */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 p-1.5 mb-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'activity' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                }`}
                style={{ color: activeTab === 'activity' ? 'var(--color-green)' : 'var(--text-secondary)' }}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Activity
              </button>
              <button
                onClick={() => setActiveTab('people')}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'people' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                }`}
                style={{ color: activeTab === 'people' ? 'var(--color-green)' : 'var(--text-secondary)' }}
              >
                <Users className="w-4 h-4 inline mr-2" />
                People
              </button>
              <button
                onClick={() => setActiveTab('challenges')}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'challenges' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                }`}
                style={{ color: activeTab === 'challenges' ? 'var(--color-green)' : 'var(--text-secondary)' }}
              >
                <MessageCircle className="w-4 h-4 inline mr-2" />
                Challenges
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'resources' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                }`}
                style={{ color: activeTab === 'resources' ? 'var(--color-green)' : 'var(--text-secondary)' }}
              >
                <Wrench className="inline mr-2" style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                Resources
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
              {activeTab === 'activity' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="sm:flex-1 sm:min-w-[150px]">
                      <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                        Activity Type
                      </label>
                      <select
                        value={formData.entry_type}
                        onChange={(e) => setFormData({ ...formData, entry_type: e.target.value as 'care_activity' | 'care_need' | 'struggle' })}
                        className="ios-text-field w-full"
                      >
                        <option value="care_activity">Care Activity</option>
                        <option value="care_need">Care Need</option>
                        <option value="struggle">Struggle</option>
                      </select>
                    </div>
                    
                    <div className="sm:flex-1 sm:min-w-[150px]">
                      <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                        <Clock className="inline mr-1" style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                        Time Spent (minutes)
                      </label>
                      <input
                        type="number"
                        value={formData.time_spent}
                        onChange={(e) => setFormData({ ...formData, time_spent: parseInt(e.target.value) || 0 })}
                        className="ios-text-field w-full"
                        min="0"
                        placeholder="30"
                      />
                    </div>
                  </div>

                  <div className="sm:flex-1 sm:min-w-[150px]">
                    <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                      Description
                    </label>
                    <div className="relative">
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="What happened? Be specific about the care activity..."
                        rows={4}
                        className="ios-text-field w-full pr-24"
                      />
                      <div className="absolute right-2 top-2 flex gap-1">
                        <button
                          onClick={() => handleVoiceInput('description')}
                          className="p-2 rounded-lg transition-all"
                          style={{
                            backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)',
                            color: isRecording ? 'white' : 'var(--text-primary)'
                          }}
                        >
                          <Mic style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                        </button>
                        <button
                          onClick={() => {
                            setAiFieldContext({
                              field: 'description',
                              question: 'Description',
                              answer: formData.description
                            });
                            setAiModalOpen(true);
                          }}
                          className="p-2 rounded-lg"
                          style={{
                            backgroundColor: 'var(--color-green)',
                            color: 'white'
                          }}
                        >
                          <Sparkles style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="sm:flex-1 sm:min-w-[150px]">
                      <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                        <Heart className="inline mr-1" style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                        Emotional Impact
                      </label>
                      <select
                        value={formData.emotional_impact}
                        onChange={(e) => setFormData({ ...formData, emotional_impact: e.target.value })}
                        className="ios-text-field w-full"
                      >
                        <option value="">Select impact...</option>
                        <option value="very_positive">Very Positive</option>
                        <option value="positive">Positive</option>
                        <option value="neutral">Neutral</option>
                        <option value="challenging">Challenging</option>
                        <option value="very_challenging">Very Challenging</option>
                      </select>
                    </div>

                    <div className="sm:flex-1 sm:min-w-[150px]">
                      <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                        <AlertCircle className="inline mr-1" style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                        Urgency Level
                      </label>
                      <select
                        value={formData.urgency_level}
                        onChange={(e) => setFormData({ ...formData, urgency_level: e.target.value })}
                        className="ios-text-field w-full"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'people' && (
                <>
                  <div className="sm:flex-1 sm:min-w-[150px]">
                    <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                      Who are you doing this activity with?
                    </label>
                    <input
                      value={formData.people_with}
                      onChange={(e) => setFormData({ ...formData, people_with: e.target.value })}
                      className="ios-text-field w-full"
                      placeholder="Family member, professional caregiver, friend..."
                    />
                  </div>

                  <div className="sm:flex-1 sm:min-w-[150px]">
                    <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                      Who would you prefer to do this with?
                    </label>
                    <input
                      value={formData.people_want_with}
                      onChange={(e) => setFormData({ ...formData, people_want_with: e.target.value })}
                      className="ios-text-field w-full"
                      placeholder="Trained nurse, family member, specialist..."
                    />
                  </div>

                  <div className="sm:flex-1 sm:min-w-[150px]">
                    <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                      Challenges in reaching help
                    </label>
                    <div className="relative">
                      <textarea
                        value={formData.help_reaching_challenges}
                        onChange={(e) => setFormData({ ...formData, help_reaching_challenges: e.target.value })}
                        className="ios-text-field w-full pr-24"
                        rows={3}
                        placeholder="Distance, availability, cost, communication barriers..."
                      />
                      <div className="absolute right-2 top-2 flex gap-1">
                        <button
                          onClick={() => handleVoiceInput('help_reaching_challenges')}
                          className="p-2 rounded-lg transition-all"
                          style={{
                            backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)',
                            color: isRecording ? 'white' : 'var(--text-primary)'
                          }}
                        >
                          <Mic style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                        </button>
                        <button
                          onClick={() => {
                            setAiFieldContext({
                              field: 'help_reaching_challenges',
                              question: 'Challenges in reaching help',
                              answer: formData.help_reaching_challenges
                            });
                            setAiModalOpen(true);
                          }}
                          className="p-2 rounded-lg"
                          style={{
                            backgroundColor: 'var(--color-green)',
                            color: 'white'
                          }}
                        >
                          <Sparkles style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'challenges' && (
                <>
                  <div className="sm:flex-1 sm:min-w-[150px]">
                    <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                      Communication Challenges
                    </label>
                    <div className="relative">
                      <textarea
                        value={formData.communication_challenges}
                        onChange={(e) => setFormData({ ...formData, communication_challenges: e.target.value })}
                        className="ios-text-field w-full pr-24"
                        rows={3}
                        placeholder="Language barriers, cognitive issues, technical difficulties..."
                      />
                      <div className="absolute right-2 top-2 flex gap-1">
                        <button
                          onClick={() => handleVoiceInput('communication_challenges')}
                          className="p-2 rounded-lg transition-all"
                          style={{
                            backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)',
                            color: isRecording ? 'white' : 'var(--text-primary)'
                          }}
                        >
                          <Mic style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                        </button>
                        <button
                          onClick={() => {
                            setAiFieldContext({
                              field: 'communication_challenges',
                              question: 'Communication Challenges',
                              answer: formData.communication_challenges
                            });
                            setAiModalOpen(true);
                          }}
                          className="p-2 rounded-lg"
                          style={{
                            backgroundColor: 'var(--color-green)',
                            color: 'white'
                          }}
                        >
                          <Sparkles style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="sm:flex-1 sm:min-w-[150px]">
                    <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                      Collaboration Challenges
                    </label>
                    <div className="relative">
                      <textarea
                        value={formData.collaboration_challenges}
                        onChange={(e) => setFormData({ ...formData, collaboration_challenges: e.target.value })}
                        className="ios-text-field w-full pr-24"
                        rows={3}
                        placeholder="Scheduling conflicts, different approaches, coordination issues..."
                      />
                      <div className="absolute right-2 top-2 flex gap-1">
                        <button
                          onClick={() => handleVoiceInput('collaboration_challenges')}
                          className="p-2 rounded-lg transition-all"
                          style={{
                            backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)',
                            color: isRecording ? 'white' : 'var(--text-primary)'
                          }}
                        >
                          <Mic style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                        </button>
                        <button
                          onClick={() => {
                            setAiFieldContext({
                              field: 'collaboration_challenges',
                              question: 'Collaboration Challenges',
                              answer: formData.collaboration_challenges
                            });
                            setAiModalOpen(true);
                          }}
                          className="p-2 rounded-lg"
                          style={{
                            backgroundColor: 'var(--color-green)',
                            color: 'white'
                          }}
                        >
                          <Sparkles style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="sm:flex-1 sm:min-w-[150px]">
                    <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                      Knowledge Gaps
                    </label>
                    <div className="relative">
                      <textarea
                        value={formData.knowledge_gaps}
                        onChange={(e) => setFormData({ ...formData, knowledge_gaps: e.target.value })}
                        className="ios-text-field w-full pr-24"
                        rows={3}
                        placeholder="What information or training do you need?"
                      />
                      <div className="absolute right-2 top-2 flex gap-1">
                        <button
                          onClick={() => handleVoiceInput('knowledge_gaps')}
                          className="p-2 rounded-lg transition-all"
                          style={{
                            backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)',
                            color: isRecording ? 'white' : 'var(--text-primary)'
                          }}
                        >
                          <Mic style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                        </button>
                        <button
                          onClick={() => {
                            setAiFieldContext({
                              field: 'knowledge_gaps',
                              question: 'Knowledge Gaps',
                              answer: formData.knowledge_gaps
                            });
                            setAiModalOpen(true);
                          }}
                          className="p-2 rounded-lg"
                          style={{
                            backgroundColor: 'var(--color-green)',
                            color: 'white'
                          }}
                        >
                          <Sparkles style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="sm:flex-1 sm:min-w-[150px]">
                    <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                      Liability Concerns
                    </label>
                    <div className="relative">
                      <textarea
                        value={formData.liability_concerns}
                        onChange={(e) => setFormData({ ...formData, liability_concerns: e.target.value })}
                        className="ios-text-field w-full pr-24"
                        rows={3}
                        placeholder="Legal, financial, or safety concerns..."
                      />
                      <div className="absolute right-2 top-2 flex gap-1">
                        <button
                          onClick={() => handleVoiceInput('liability_concerns')}
                          className="p-2 rounded-lg transition-all"
                          style={{
                            backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)',
                            color: isRecording ? 'white' : 'var(--text-primary)'
                          }}
                        >
                          <Mic style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                        </button>
                        <button
                          onClick={() => {
                            setAiFieldContext({
                              field: 'liability_concerns',
                              question: 'Liability Concerns',
                              answer: formData.liability_concerns
                            });
                            setAiModalOpen(true);
                          }}
                          className="p-2 rounded-lg"
                          style={{
                            backgroundColor: 'var(--color-green)',
                            color: 'white'
                          }}
                        >
                          <Sparkles style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'resources' && (
                <>
                  <div className="sm:flex-1 sm:min-w-[150px]">
                    <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                      <Wrench className="w-4 h-4 inline mr-1" />
                      Tools Currently Using
                    </label>
                    <div className="relative">
                      <textarea
                        value={formData.tools_using}
                        onChange={(e) => setFormData({ ...formData, tools_using: e.target.value })}
                        className="ios-text-field w-full pr-24"
                        rows={3}
                        placeholder="Medical equipment, apps, devices, services..."
                      />
                      <div className="absolute right-2 top-2 flex gap-1">
                        <button
                          onClick={() => handleVoiceInput('tools_using')}
                          className="p-2 rounded-lg transition-all"
                          style={{
                            backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)',
                            color: isRecording ? 'white' : 'var(--text-primary)'
                          }}
                        >
                          <Mic style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                        </button>
                        <button
                          onClick={() => {
                            setAiFieldContext({
                              field: 'tools_using',
                              question: 'Tools Currently Using',
                              answer: formData.tools_using
                            });
                            setAiModalOpen(true);
                          }}
                          className="p-2 rounded-lg"
                          style={{
                            backgroundColor: 'var(--color-green)',
                            color: 'white'
                          }}
                        >
                          <Sparkles style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="sm:flex-1 sm:min-w-[150px]">
                    <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                      Tools You Need
                    </label>
                    <div className="relative">
                      <textarea
                        value={formData.tools_wanted}
                        onChange={(e) => setFormData({ ...formData, tools_wanted: e.target.value })}
                        className="ios-text-field w-full pr-24"
                        rows={3}
                        placeholder="What tools would make this easier?"
                      />
                      <div className="absolute right-2 top-2 flex gap-1">
                        <button
                          onClick={() => handleVoiceInput('tools_wanted')}
                          className="p-2 rounded-lg transition-all"
                          style={{
                            backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)',
                            color: isRecording ? 'white' : 'var(--text-primary)'
                          }}
                        >
                          <Mic style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                        </button>
                        <button
                          onClick={() => {
                            setAiFieldContext({
                              field: 'tools_wanted',
                              question: 'Tools You Need',
                              answer: formData.tools_wanted
                            });
                            setAiModalOpen(true);
                          }}
                          className="p-2 rounded-lg"
                          style={{
                            backgroundColor: 'var(--color-green)',
                            color: 'white'
                          }}
                        >
                          <Sparkles style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="sm:flex-1 sm:min-w-[150px]">
                    <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                      Support Needed
                    </label>
                    <div className="relative">
                      <textarea
                        value={formData.support_needed}
                        onChange={(e) => setFormData({ ...formData, support_needed: e.target.value })}
                        className="ios-text-field w-full pr-24"
                        rows={3}
                        placeholder="Training, respite care, emotional support, financial assistance..."
                      />
                      <div className="absolute right-2 top-2 flex gap-1">
                        <button
                          onClick={() => handleVoiceInput('support_needed')}
                          className="p-2 rounded-lg transition-all"
                          style={{
                            backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)',
                            color: isRecording ? 'white' : 'var(--text-primary)'
                          }}
                        >
                          <Mic style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                        </button>
                        <button
                          onClick={() => {
                            setAiFieldContext({
                              field: 'support_needed',
                              question: 'Support Needed',
                              answer: formData.support_needed
                            });
                            setAiModalOpen(true);
                          }}
                          className="p-2 rounded-lg"
                          style={{
                            backgroundColor: 'var(--color-green)',
                            color: 'white'
                          }}
                        >
                          <Sparkles style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-8 mt-8" style={{ borderTop: '1px solid var(--border-light)' }}>
              <button
                onClick={handleCreate}
                className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg"
                style={{ 
                  backgroundColor: 'var(--color-green)',
                  minWidth: '120px'
                }}
                disabled={!formData.description}
              >
                <Save className="w-4 h-4 inline mr-2" />
                Save Entry
              </button>
              <button
                onClick={() => { setShowCreateForm(false); cancelEdit(); }}
                className="px-6 py-3 rounded-xl font-semibold transition-all"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  minWidth: '120px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Entries List - Responsive Grid */}
        {filteredEntries.length === 0 ? (
          <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
            {entries.length === 0 ? text.noEntries : 'No entries match the current filters.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="ios-card"
              >
                {editingId === entry.id ? (
                  // Edit Mode - Multi-Tab Comprehensive Form
                  <div className="sm:flex-1 sm:min-w-[150px]">
                    <h3 className="sf-headline mb-6" style={{ color: 'var(--text-primary)' }}>
                      Edit Entry
                    </h3>
                    
                    {/* Tab Navigation */}
                    <div className="flex gap-1 p-1 mb-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <button
                        onClick={() => setActiveTab('activity')}
                        className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                          activeTab === 'activity' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                        }`}
                        style={{ color: activeTab === 'activity' ? 'var(--color-green)' : 'var(--text-secondary)' }}
                      >
                        <BarChart3 className="w-4 h-4 inline mr-2" />
                        Activity
                      </button>
                      <button
                        onClick={() => setActiveTab('people')}
                        className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                          activeTab === 'people' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                        }`}
                        style={{ color: activeTab === 'people' ? 'var(--color-green)' : 'var(--text-secondary)' }}
                      >
                        <Users className="w-4 h-4 inline mr-2" />
                        People
                      </button>
                      <button
                        onClick={() => setActiveTab('challenges')}
                        className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                          activeTab === 'challenges' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                        }`}
                        style={{ color: activeTab === 'challenges' ? 'var(--color-green)' : 'var(--text-secondary)' }}
                      >
                        <MessageCircle className="w-4 h-4 inline mr-2" />
                        Challenges
                      </button>
                      <button
                        onClick={() => setActiveTab('resources')}
                        className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                          activeTab === 'resources' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                        }`}
                        style={{ color: activeTab === 'resources' ? 'var(--color-green)' : 'var(--text-secondary)' }}
                      >
                        <Package className="w-4 h-4 inline mr-2" />
                        Resources
                      </button>
                    </div>

                    {/* Tab Content - Same as create form */}
                    <div className="space-y-4">
                      {activeTab === 'activity' && (
                        <>
                          <div className="sm:flex-1 sm:min-w-[150px]">
                            <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                              Entry Type
                            </label>
                            <select
                              value={formData.entry_type}
                              onChange={(e) => setFormData({ ...formData, entry_type: e.target.value as 'care_activity' | 'care_need' | 'struggle' })}
                              className="ios-text-field"
                            >
                              <option value="care_activity">{text.careActivity}</option>
                              <option value="care_need">{text.careNeed}</option>
                              <option value="struggle">{text.struggle}</option>
                            </select>
                          </div>
                          <div className="sm:flex-1 sm:min-w-[150px]">
                            <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                              Description
                            </label>
                            <div className="relative">
                              <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="ios-text-field w-full pr-24"
                                rows={4}
                                placeholder="Describe the activity, need, or struggle..."
                              />
                              <div className="absolute right-2 top-2 flex gap-1">
                                <button
                                  onClick={() => handleVoiceInput('description')}
                                  className="p-2 rounded-lg transition-all"
                                  style={{
                                    backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)',
                                    color: isRecording ? 'white' : 'var(--text-primary)'
                                  }}
                                >
                                  <Mic style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                                </button>
                                <button
                                  onClick={() => {
                                    setAiFieldContext({
                                      field: 'description',
                                      question: 'Description',
                                      answer: formData.description
                                    });
                                    setAiModalOpen(true);
                                  }}
                                  className="p-2 rounded-lg"
                                  style={{
                                    backgroundColor: 'var(--color-green)',
                                    color: 'white'
                                  }}
                                >
                                  <Sparkles style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="sm:flex-1 sm:min-w-[150px]">
                            <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                              Time Spent (minutes)
                            </label>
                            <input
                              type="number"
                              value={formData.time_spent || ''}
                              onChange={(e) => setFormData({ ...formData, time_spent: parseInt(e.target.value) || 0 })}
                              className="ios-text-field w-full"
                              placeholder="30"
                            />
                          </div>
                          <div className="sm:flex-1 sm:min-w-[150px]">
                            <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                              Emotional Impact
                            </label>
                            <select
                              value={formData.emotional_impact}
                              onChange={(e) => setFormData({ ...formData, emotional_impact: e.target.value })}
                              className="ios-text-field"
                            >
                              <option value="">Select...</option>
                              <option value="positive">Positive</option>
                              <option value="neutral">Neutral</option>
                              <option value="challenging">Challenging</option>
                              <option value="overwhelming">Overwhelming</option>
                            </select>
                          </div>
                          <div className="sm:flex-1 sm:min-w-[150px]">
                            <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                              Urgency Level
                            </label>
                            <select
                              value={formData.urgency_level}
                              onChange={(e) => setFormData({ ...formData, urgency_level: e.target.value })}
                              className="ios-text-field"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          </div>
                        </>
                      )}

                      {activeTab === 'people' && (
                        <>
                          <div className="sm:flex-1 sm:min-w-[150px]">
                            <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                              People With You
                            </label>
                            <input
                              type="text"
                              value={formData.people_with}
                              onChange={(e) => setFormData({ ...formData, people_with: e.target.value })}
                              className="ios-text-field w-full"
                              placeholder="Family member, professional caregiver, nurse..."
                            />
                          </div>
                          <div className="sm:flex-1 sm:min-w-[150px]">
                            <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                              People You Want
                            </label>
                            <input
                              type="text"
                              value={formData.people_want_with}
                              onChange={(e) => setFormData({ ...formData, people_want_with: e.target.value })}
                              className="ios-text-field w-full"
                              placeholder="Trained nurse, therapist, support group..."
                            />
                          </div>
                          <div className="sm:flex-1 sm:min-w-[150px]">
                            <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                              Challenges Reaching People
                            </label>
                            <div className="relative">
                              <textarea
                                value={formData.help_reaching_challenges}
                                onChange={(e) => setFormData({ ...formData, help_reaching_challenges: e.target.value })}
                                className="ios-text-field w-full pr-24"
                                rows={3}
                                placeholder="Distance, cost, availability, scheduling..."
                              />
                              <div className="absolute right-2 top-2 flex gap-1">
                                <button
                                  onClick={() => handleVoiceInput('help_reaching_challenges')}
                                  className="p-2 rounded-lg transition-all"
                                  style={{
                                    backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)',
                                    color: isRecording ? 'white' : 'var(--text-primary)'
                                  }}
                                >
                                  <Mic style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                                </button>
                                <button
                                  onClick={() => {
                                    setAiFieldContext({
                                      field: 'help_reaching_challenges',
                                      question: 'Challenges Reaching People',
                                      answer: formData.help_reaching_challenges
                                    });
                                    setAiModalOpen(true);
                                  }}
                                  className="p-2 rounded-lg"
                                  style={{
                                    backgroundColor: 'var(--color-green)',
                                    color: 'white'
                                  }}
                                >
                                  <Sparkles style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {activeTab === 'challenges' && (
                        <>
                          <div className="sm:flex-1 sm:min-w-[150px]">
                            <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                              Communication Challenges
                            </label>
                            <div className="relative">
                              <textarea
                                value={formData.communication_challenges}
                                onChange={(e) => setFormData({ ...formData, communication_challenges: e.target.value })}
                                className="ios-text-field w-full pr-24"
                                rows={3}
                                placeholder="Language barriers, technical difficulties..."
                              />
                              <div className="absolute right-2 top-2 flex gap-1">
                                <button
                                  onClick={() => handleVoiceInput('communication_challenges')}
                                  className="p-2 rounded-lg transition-all"
                                  style={{
                                    backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)',
                                    color: isRecording ? 'white' : 'var(--text-primary)'
                                  }}
                                >
                                  <Mic style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                                </button>
                                <button
                                  onClick={() => {
                                    setAiFieldContext({
                                      field: 'communication_challenges',
                                      question: 'Communication Challenges',
                                      answer: formData.communication_challenges
                                    });
                                    setAiModalOpen(true);
                                  }}
                                  className="p-2 rounded-lg"
                                  style={{
                                    backgroundColor: 'var(--color-green)',
                                    color: 'white'
                                  }}
                                >
                                  <Sparkles style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="sm:flex-1 sm:min-w-[150px]">
                            <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                              Collaboration Challenges
                            </label>
                            <div className="relative">
                              <textarea
                                value={formData.collaboration_challenges}
                                onChange={(e) => setFormData({ ...formData, collaboration_challenges: e.target.value })}
                                className="ios-text-field w-full pr-24"
                                rows={3}
                                placeholder="Scheduling conflicts, coordination issues..."
                              />
                              <div className="absolute right-2 top-2 flex gap-1">
                                <button
                                  onClick={() => handleVoiceInput('collaboration_challenges')}
                                  className="p-2 rounded-lg transition-all"
                                  style={{
                                    backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)',
                                    color: isRecording ? 'white' : 'var(--text-primary)'
                                  }}
                                >
                                  <Mic style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                                </button>
                                <button
                                  onClick={() => {
                                    setAiFieldContext({
                                      field: 'collaboration_challenges',
                                      question: 'Collaboration Challenges',
                                      answer: formData.collaboration_challenges
                                    });
                                    setAiModalOpen(true);
                                  }}
                                  className="p-2 rounded-lg"
                                  style={{
                                    backgroundColor: 'var(--color-green)',
                                    color: 'white'
                                  }}
                                >
                                  <Sparkles style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="sm:flex-1 sm:min-w-[150px]">
                            <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                              Knowledge Gaps
                            </label>
                            <div className="relative">
                              <textarea
                                value={formData.knowledge_gaps}
                                onChange={(e) => setFormData({ ...formData, knowledge_gaps: e.target.value })}
                                className="ios-text-field w-full pr-24"
                                rows={3}
                                placeholder="Missing information or training needs..."
                              />
                              <div className="absolute right-2 top-2 flex gap-1">
                                <button
                                  onClick={() => handleVoiceInput('knowledge_gaps')}
                                  className="p-2 rounded-lg transition-all"
                                  style={{
                                    backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)',
                                    color: isRecording ? 'white' : 'var(--text-primary)'
                                  }}
                                >
                                  <Mic style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                                </button>
                                <button
                                  onClick={() => {
                                    setAiFieldContext({
                                      field: 'knowledge_gaps',
                                      question: 'Knowledge Gaps',
                                      answer: formData.knowledge_gaps
                                    });
                                    setAiModalOpen(true);
                                  }}
                                  className="p-2 rounded-lg"
                                  style={{
                                    backgroundColor: 'var(--color-green)',
                                    color: 'white'
                                  }}
                                >
                                  <Sparkles style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="sm:flex-1 sm:min-w-[150px]">
                            <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                              Liability Concerns
                            </label>
                            <div className="relative">
                              <textarea
                                value={formData.liability_concerns}
                                onChange={(e) => setFormData({ ...formData, liability_concerns: e.target.value })}
                                className="ios-text-field w-full pr-24"
                                rows={3}
                                placeholder="Legal, financial, or safety concerns..."
                              />
                              <div className="absolute right-2 top-2 flex gap-1">
                                <button
                                  onClick={() => handleVoiceInput('liability_concerns')}
                                  className="p-2 rounded-lg transition-all"
                                  style={{
                                    backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)',
                                    color: isRecording ? 'white' : 'var(--text-primary)'
                                  }}
                                >
                                  <Mic style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                                </button>
                                <button
                                  onClick={() => {
                                    setAiFieldContext({
                                      field: 'liability_concerns',
                                      question: 'Liability Concerns',
                                      answer: formData.liability_concerns
                                    });
                                    setAiModalOpen(true);
                                  }}
                                  className="p-2 rounded-lg"
                                  style={{
                                    backgroundColor: 'var(--color-green)',
                                    color: 'white'
                                  }}
                                >
                                  <Sparkles style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {activeTab === 'resources' && (
                        <>
                          <div className="sm:flex-1 sm:min-w-[150px]">
                            <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                              Tools Currently Using
                            </label>
                            <div className="relative">
                              <textarea
                                value={formData.tools_using}
                                onChange={(e) => setFormData({ ...formData, tools_using: e.target.value })}
                                className="ios-text-field w-full pr-24"
                                rows={3}
                                placeholder="Medical equipment, apps, devices, services..."
                              />
                              <div className="absolute right-2 top-2 flex gap-1">
                                <button
                                  onClick={() => handleVoiceInput('tools_using')}
                                  className="p-2 rounded-lg transition-all"
                                  style={{
                                    backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)',
                                    color: isRecording ? 'white' : 'var(--text-primary)'
                                  }}
                                >
                                  <Mic style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                                </button>
                                <button
                                  onClick={() => {
                                    setAiFieldContext({
                                      field: 'tools_using',
                                      question: 'Tools Currently Using',
                                      answer: formData.tools_using
                                    });
                                    setAiModalOpen(true);
                                  }}
                                  className="p-2 rounded-lg"
                                  style={{
                                    backgroundColor: 'var(--color-green)',
                                    color: 'white'
                                  }}
                                >
                                  <Sparkles style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="sm:flex-1 sm:min-w-[150px]">
                            <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                              Tools You Need
                            </label>
                            <div className="relative">
                              <textarea
                                value={formData.tools_wanted}
                                onChange={(e) => setFormData({ ...formData, tools_wanted: e.target.value })}
                                className="ios-text-field w-full pr-24"
                                rows={3}
                                placeholder="What tools would make this easier?"
                              />
                              <div className="absolute right-2 top-2 flex gap-1">
                                <button
                                  onClick={() => handleVoiceInput('tools_wanted')}
                                  className="p-2 rounded-lg transition-all"
                                  style={{
                                    backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)',
                                    color: isRecording ? 'white' : 'var(--text-primary)'
                                  }}
                                >
                                  <Mic style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                                </button>
                                <button
                                  onClick={() => {
                                    setAiFieldContext({
                                      field: 'tools_wanted',
                                      question: 'Tools You Need',
                                      answer: formData.tools_wanted
                                    });
                                    setAiModalOpen(true);
                                  }}
                                  className="p-2 rounded-lg"
                                  style={{
                                    backgroundColor: 'var(--color-green)',
                                    color: 'white'
                                  }}
                                >
                                  <Sparkles style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="sm:flex-1 sm:min-w-[150px]">
                            <label className="sf-callout font-medium mb-2 block" style={{ color: 'var(--text-primary)' }}>
                              Support Needed
                            </label>
                            <div className="relative">
                              <textarea
                                value={formData.support_needed}
                                onChange={(e) => setFormData({ ...formData, support_needed: e.target.value })}
                                className="ios-text-field w-full pr-24"
                                rows={3}
                                placeholder="Training, respite care, emotional support, financial assistance..."
                              />
                              <div className="absolute right-2 top-2 flex gap-1">
                                <button
                                  onClick={() => handleVoiceInput('support_needed')}
                                  className="p-2 rounded-lg transition-all"
                                  style={{
                                    backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)',
                                    color: isRecording ? 'white' : 'var(--text-primary)'
                                  }}
                                >
                                  <Mic style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                                </button>
                                <button
                                  onClick={() => {
                                    setAiFieldContext({
                                      field: 'support_needed',
                                      question: 'Support Needed',
                                      answer: formData.support_needed
                                    });
                                    setAiModalOpen(true);
                                  }}
                                  className="p-2 rounded-lg"
                                  style={{
                                    backgroundColor: 'var(--color-green)',
                                    color: 'white'
                                  }}
                                >
                                  <Sparkles style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-6 mt-6" style={{ borderTop: '1px solid var(--border-light)' }}>
                      <button
                        onClick={() => handleUpdate(entry.id)}
                        disabled={isLoading}
                        className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                        style={{ backgroundColor: 'var(--color-green)', minWidth: '120px' }}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 inline mr-2" />
                        )}
                        {isLoading ? 'Updating...' : 'Update Entry'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-6 py-3 rounded-xl font-semibold transition-all min-h-[48px]"
                        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', minWidth: '120px' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode - Comprehensive Display
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white mb-2" 
                          style={{ backgroundColor: entry.entry_type === 'care_activity' ? 'var(--color-green)' : 
                                   entry.entry_type === 'care_need' ? '#fb923c' : '#ef4444' }}>
                          {entry.entry_type === 'care_activity' ? text.careActivity : 
                           entry.entry_type === 'care_need' ? text.careNeed : text.struggle}
                        </span>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {new Date(entry.entry_timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(entry)}
                          className="p-3 rounded-lg hover:bg-green-50 transition-colors min-w-[44px] min-h-[44px]"
                          style={{ backgroundColor: 'var(--bg-secondary)' }}
                          aria-label="Edit entry"
                        >
                          <Edit2 className="w-5 h-5" style={{ color: 'var(--color-green)' }} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(entry.id)}
                          className="p-3 rounded-lg hover:bg-red-50 transition-colors min-w-[44px] min-h-[44px]"
                          style={{ backgroundColor: 'var(--bg-secondary)' }}
                          aria-label="Delete entry"
                        >
                          <Trash2 className="w-5 h-5" style={{ color: '#ef4444' }} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Main Description */}
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {entry.description}
                        </p>
                      </div>

                      {/* Activity Details */}
                      {(entry.time_spent || entry.emotional_impact || entry.urgency_level) && (
                        <div className="flex flex-wrap gap-3">
                          {entry.time_spent && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                              <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                {entry.time_spent} min
                              </span>
                            </div>
                          )}
                          {entry.emotional_impact && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                              <Heart className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                {entry.emotional_impact}
                              </span>
                            </div>
                          )}
                          {entry.urgency_level && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ 
                              backgroundColor: entry.urgency_level === 'urgent' ? 'var(--urgency-urgent-bg)' : 
                                              entry.urgency_level === 'high' ? 'var(--urgency-high-bg)' : 'var(--bg-secondary)'
                            }}>
                              <AlertCircle className="w-3.5 h-3.5" style={{ 
                                color: entry.urgency_level === 'urgent' ? 'var(--urgency-urgent)' : 
                                       entry.urgency_level === 'high' ? 'var(--urgency-high)' : 'var(--text-secondary)' 
                              }} />
                              <span className="text-xs" style={{ 
                                color: entry.urgency_level === 'urgent' ? 'var(--urgency-urgent)' : 
                                       entry.urgency_level === 'high' ? 'var(--urgency-high)' : 'var(--text-secondary)' 
                              }}>
                                {entry.urgency_level}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* People Section */}
                      {(entry.people_with || entry.people_want_with || entry.help_reaching_challenges) && (
                        <div className="p-3 rounded-lg space-y-2" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          {entry.people_with && (
                            <div className="sm:flex-1 sm:min-w-[150px]">
                              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                                <Users className="w-3 h-3 inline mr-1" />
                                People With You
                              </p>
                              <p className="text-sm line-clamp-2" style={{ color: 'var(--text-primary)' }}>{entry.people_with}</p>
                            </div>
                          )}
                          {entry.people_want_with && (
                            <div className="sm:flex-1 sm:min-w-[150px]">
                              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                People You Want
                              </p>
                              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{entry.people_want_with}</p>
                            </div>
                          )}
                          {entry.help_reaching_challenges && (
                            <div className="sm:flex-1 sm:min-w-[150px]">
                              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                Challenges Reaching People
                              </p>
                              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{entry.help_reaching_challenges}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Challenges Section */}
                      {(entry.communication_challenges || entry.collaboration_challenges || entry.knowledge_gaps || entry.liability_concerns) && (
                        <div className="p-3 rounded-lg space-y-2" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          {entry.communication_challenges && (
                            <div className="sm:flex-1 sm:min-w-[150px]">
                              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                                <MessageCircle className="w-3 h-3 inline mr-1" />
                                Communication Challenges
                              </p>
                              <p className="text-sm line-clamp-2" style={{ color: 'var(--text-primary)' }}>{entry.communication_challenges}</p>
                            </div>
                          )}
                          {entry.collaboration_challenges && (
                            <div className="sm:flex-1 sm:min-w-[150px]">
                              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                Collaboration Challenges
                              </p>
                              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{entry.collaboration_challenges}</p>
                            </div>
                          )}
                          {entry.knowledge_gaps && (
                            <div className="sm:flex-1 sm:min-w-[150px]">
                              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                Knowledge Gaps
                              </p>
                              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{entry.knowledge_gaps}</p>
                            </div>
                          )}
                          {entry.liability_concerns && (
                            <div className="sm:flex-1 sm:min-w-[150px]">
                              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                Liability Concerns
                              </p>
                              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{entry.liability_concerns}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Resources Section */}
                      {(entry.tools_using || entry.tools_wanted || entry.support_needed) && (
                        <div className="p-3 rounded-lg space-y-2" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          {entry.tools_using && (
                            <div className="sm:flex-1 sm:min-w-[150px]">
                              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                                <Wrench className="w-3 h-3 inline mr-1" />
                                Tools Using
                              </p>
                              <p className="text-sm line-clamp-2" style={{ color: 'var(--text-primary)' }}>{entry.tools_using}</p>
                            </div>
                          )}
                          {entry.tools_wanted && (
                            <div className="sm:flex-1 sm:min-w-[150px]">
                              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                Tools You Need
                              </p>
                              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{entry.tools_wanted}</p>
                            </div>
                          )}
                          {entry.support_needed && (
                            <div className="sm:flex-1 sm:min-w-[150px]">
                              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                <Package className="w-3 h-3 inline mr-1" />
                                Support Needed
                              </p>
                              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{entry.support_needed}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enrollment Modal */}
      {showEnrollmentModal && (
        <SurveyEnrollmentModal
          language={language}
          onEnroll={handleEnroll}
          onClose={() => setShowEnrollmentModal(false)}
        />
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* AI Survey Assistant Modal */}
      {aiModalOpen && (
        <AISurveyAssistant
          isOpen={aiModalOpen}
          onClose={() => setAiModalOpen(false)}
          question={aiFieldContext.question}
          currentAnswer={aiFieldContext.answer}
          onCopyAnswer={handleCopyAnswer}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      )}

    </div>
  );
};

export default DementiaCaregiverSurvey;
