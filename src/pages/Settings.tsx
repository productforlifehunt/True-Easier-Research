import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { dataService } from '../lib/dataService';
import { supabase } from '../lib/supabase';
import { Settings, Info, Bell, User, Users, Edit2, Save, Mic, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import IOSToggle from '../components/ui/IOSToggle';
import IOSDropdown from '../components/ui/IOSDropdown';
import { useLanguage } from '../hooks/useLanguage';
import BottomNav from '../components/BottomNav';
import { notificationScheduler } from '../utils/notificationScheduler';
import DesktopHeader from '../components/DesktopHeader';
import MobileHeader from '../components/MobileHeader';
import AuthModal from '../components/AuthModal';
import Ecogram from '../components/Ecogram';
import MyCaringWeek from '../components/MyCaringWeek';

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { language, changeLanguage } = useLanguage();
  const [currentTab, setCurrentTab] = useState<'home' | 'survey' | 'about' | 'settings'>('settings');
  const [notifications, setNotifications] = useState({
    dailyReminders: true,
    researchUpdates: true,
    pushNotifications: true
  });
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);
  const [dailyReminderTime, setDailyReminderTime] = useState('22:00');
  
  // Hourly notification settings
  const [hourlyReminders, setHourlyReminders] = useState(false);
  const [dndPeriods, setDndPeriods] = useState<Array<{
    id?: number;
    start_time: string;
    end_time: string;
    label?: string;
    is_active: boolean;
  }>>([]);
  const [newDndPeriod, setNewDndPeriod] = useState({
    start_time: '22:00',
    end_time: '08:00',
    label: '',
    is_active: true
  });
  const [testingNotification, setTestingNotification] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    introduction: '',
    relationship_to_patient: '',
    is_primary_caregiver: false,
    participant_number: '',
    linked_primary_caregiver_id: '' as string | null,
    linked_primary_caregiver_code: '' as string | null, // PP code of linked primary caregiver
    caregiver_age: '',
    caregiver_gender: '',
    caregiver_education: '',
    // New comprehensive fields
    employment_status: '',
    marital_status: '',
    health_status: '',
    caregiving_years: '',
    caregiving_hours_per_week: '',
    living_with_recipient: '',
    recipient_age: '',
    recipient_gender: '',
    recipient_education: '',
    dementia_type: '',
    years_since_diagnosis: '',
    dementia_stage: '',
    // Functional Status
    recipient_adl_eating: '',
    recipient_adl_bathing: '',
    recipient_adl_dressing: '',
    recipient_adl_toileting: '',
    recipient_adl_mobility: '',
    // Instrumental ADLs
    recipient_iadl_medication: '',
    recipient_iadl_finances: '',
    recipient_iadl_shopping: '',
    recipient_iadl_cooking: '',
    recipient_iadl_housework: '',
    // BPSD - Behavioral symptoms
    recipient_bpsd_agitation: '',
    recipient_bpsd_wandering: '',
    recipient_bpsd_sleep: '',
    recipient_bpsd_aggression: '',
    recipient_bpsd_depression: '',
    recipient_bpsd_anxiety: '',
    recipient_bpsd_hallucinations: '',
    // Communication & Other
    recipient_communication: '',
    // Short Sense of Competence Questionnaire (SSCQ) - 7 items
    sscq_strained_interactions: '',
    sscq_privacy: '',
    sscq_useful: '',
    sscq_social_life: '',
    sscq_manipulation: '',
    sscq_solutions: '',
    sscq_health: '',
    // Perseverance Time
    perseverance_time: '',
    recipient_comorbidities: '',
    relationship_to_primary: '',
    distance_from_recipient: '',
    contact_frequency: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // Survey progress tracking
  const [surveyProgress, setSurveyProgress] = useState<{
    currentDay: number;
    totalDays: number;
    daysRemaining: number;
    startDate: string;
    endDate: string;
  } | null>(null);
  
  // Research start date
  const [studyStartDate, setStudyStartDate] = useState<string | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isUpdatingStartDate, setIsUpdatingStartDate] = useState(false);
  const [interviewAgreement, setInterviewAgreement] = useState(false);
  
  // Interview scheduling states
  const [interviewData, setInterviewData] = useState<{
    interview_url: string | null;
    interview_datetime_start: string | null;
    interview_datetime_end: string | null;
    interview_accepted: boolean;
    interview_accepted_at: string | null;
  }>({
    interview_url: null,
    interview_datetime_start: null,
    interview_datetime_end: null,
    interview_accepted: false,
    interview_accepted_at: null
  });
  const [interviewTab, setInterviewTab] = useState<'questions' | 'graphs' | 'resources'>('questions');
  const [graphView, setGraphView] = useState<'network' | 'context'>('network');
  const [showDemographics, setShowDemographics] = useState(false);
  const [showPatientCondition, setShowPatientCondition] = useState(false);
  const [showNetworkConfig, setShowNetworkConfig] = useState(false);
  const [showDementiaKnowledge, setShowDementiaKnowledge] = useState(false);
  
  // AI feature states
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    try {
      const profileData = await dataService.getUserProfile(user.id);
      setProfile(profileData);
      setProfileForm({
        full_name: profileData.full_name || '',
        introduction: profileData.introduction || '',
        relationship_to_patient: profileData.relationship_to_patient || '',
        is_primary_caregiver: profileData.is_primary_caregiver || false,
        participant_number: profileData.participant_number || '',
        caregiver_age: profileData.caregiver_age || '',
        caregiver_gender: profileData.caregiver_gender || '',
        caregiver_education: profileData.caregiver_education || '',
        employment_status: profileData.employment_status || '',
        marital_status: profileData.marital_status || '',
        health_status: profileData.health_status || '',
        caregiving_years: profileData.caregiving_years || '',
        caregiving_hours_per_week: profileData.caregiving_hours_per_week || '',
        living_with_recipient: profileData.living_with_recipient || '',
        recipient_age: profileData.recipient_age || '',
        recipient_gender: profileData.recipient_gender || '',
        recipient_education: profileData.recipient_education || '',
        dementia_type: profileData.dementia_type || '',
        years_since_diagnosis: profileData.years_since_diagnosis || '',
        dementia_stage: profileData.dementia_stage || '',
        // Functional Status - ADLs
        recipient_adl_eating: profileData.recipient_adl_eating || '',
        recipient_adl_bathing: profileData.recipient_adl_bathing || '',
        recipient_adl_dressing: profileData.recipient_adl_dressing || '',
        recipient_adl_toileting: profileData.recipient_adl_toileting || '',
        recipient_adl_mobility: profileData.recipient_adl_mobility || '',
        // Instrumental ADLs
        recipient_iadl_medication: profileData.recipient_iadl_medication || '',
        recipient_iadl_finances: profileData.recipient_iadl_finances || '',
        recipient_iadl_shopping: profileData.recipient_iadl_shopping || '',
        recipient_iadl_cooking: profileData.recipient_iadl_cooking || '',
        recipient_iadl_housework: profileData.recipient_iadl_housework || '',
        // BPSD
        recipient_bpsd_agitation: profileData.recipient_bpsd_agitation || '',
        recipient_bpsd_wandering: profileData.recipient_bpsd_wandering || '',
        recipient_bpsd_sleep: profileData.recipient_bpsd_sleep || '',
        recipient_bpsd_aggression: profileData.recipient_bpsd_aggression || '',
        recipient_bpsd_depression: profileData.recipient_bpsd_depression || '',
        recipient_bpsd_anxiety: profileData.recipient_bpsd_anxiety || '',
        recipient_bpsd_hallucinations: profileData.recipient_bpsd_hallucinations || '',
        // Other
        recipient_communication: profileData.recipient_communication || '',
        // SSCQ
        sscq_strained_interactions: profileData.sscq_strained_interactions || '',
        sscq_privacy: profileData.sscq_privacy || '',
        sscq_useful: profileData.sscq_useful || '',
        sscq_social_life: profileData.sscq_social_life || '',
        sscq_manipulation: profileData.sscq_manipulation || '',
        sscq_solutions: profileData.sscq_solutions || '',
        sscq_health: profileData.sscq_health || '',
        perseverance_time: profileData.perseverance_time || '',
        recipient_comorbidities: profileData.recipient_comorbidities || '',
        relationship_to_primary: profileData.relationship_to_primary || '',
        distance_from_recipient: profileData.distance_from_recipient || '',
        contact_frequency: profileData.contact_frequency || '',
        linked_primary_caregiver_id: profileData.linked_primary_caregiver_id || null,
        linked_primary_caregiver_code: profileData.linked_primary_caregiver_code || null
      });
      // Load interview scheduling data
      setInterviewData({
        interview_url: profileData.interview_url || null,
        interview_datetime_start: profileData.interview_datetime_start || null,
        interview_datetime_end: profileData.interview_datetime_end || null,
        interview_accepted: profileData.interview_accepted || false,
        interview_accepted_at: profileData.interview_accepted_at || null
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }, [user]);

  // Load user profile
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user, loadProfile]);

  // Load survey progress and start date
  useEffect(() => {
    const loadSurveyProgress = async () => {
      if (!user) return;
      try {
        // Get study start date and interview agreement from enrollments
        const { data: enrollmentData } = await supabase
          .from('enrollment')
          .select('study_start_date, interview_agreement')
          .eq('participant_id', user.id)
          .limit(1);
        
        if (enrollmentData?.[0]) {
          if (enrollmentData[0].study_start_date) {
            setStudyStartDate(enrollmentData[0].study_start_date);
            setSelectedStartDate(enrollmentData[0].study_start_date);
            
            // Get current day
            const currentDay = await dataService.getCurrentSurveyDay(user.id);
            const totalDays = 7;
            const daysRemaining = Math.max(0, totalDays - currentDay);
            
            setSurveyProgress({
              currentDay,
              totalDays,
              daysRemaining,
              startDate: enrollmentData[0].study_start_date,
              endDate: new Date(new Date(enrollmentData[0].study_start_date).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
          } else {
            setStudyStartDate(null);
          }
          
          setInterviewAgreement(enrollmentData[0].interview_agreement || false);
        }
      } catch (error) {
        console.error('Error loading survey progress:', error);
      }
    };
    
    loadSurveyProgress();
  }, [user]);

  // Load notification preferences
  useEffect(() => {
    const loadNotificationPreferences = async () => {
      if (!user) return;
      try {
        const prefs = await dataService.getNotificationPreferences(user.id);
        if (prefs) {
          setHourlyReminders(prefs.hourly_reminders_enabled || false);
          setDndPeriods(prefs.dnd_periods || []);
          
          // Load the three notification toggles from DB
          setNotifications({
            dailyReminders: prefs.daily_reminders_enabled ?? true,
            researchUpdates: prefs.research_updates_enabled ?? true,
            pushNotifications: prefs.push_notifications_enabled ?? true
          });
          setNotificationsLoaded(true);
          
          // Load daily reminder time (DB stores as HH:MM:SS, UI uses HH:MM)
          if (prefs.daily_reminder_time) {
            setDailyReminderTime(prefs.daily_reminder_time.substring(0, 5));
          }
          
          // Start scheduler with full preferences
          notificationScheduler.start({
            hourly_reminders_enabled: prefs.hourly_reminders_enabled || false,
            daily_reminders_enabled: prefs.daily_reminders_enabled ?? true,
            daily_reminder_time: prefs.daily_reminder_time || '22:00:00',
            push_notifications_enabled: prefs.push_notifications_enabled ?? true,
            dnd_periods: prefs.dnd_periods || [],
            notification_permission_status: prefs.notification_permission_status || 'default'
          }, language);
        }
      } catch (error) {
        console.error('Error loading notification preferences:', error);
      }
    };
    
    loadNotificationPreferences();
  }, [user, language]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await dataService.updateUserProfile(user.id, {
        ...profileForm,
        profile_completed: true
      });
      await loadProfile();
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Initialize Web Speech API
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

  // Voice Input
  const handleVoiceInput = (field: 'introduction') => {
    if (!recognition) {
      toast.error('Speech recognition is not supported in your browser. Please use Chrome or Safari.');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
      return;
    }

    const targetField = field;
    setIsRecording(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setProfileForm({ ...profileForm, [targetField]: profileForm[targetField] + ' ' + transcript });
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  // AI Enhance
  const handleEnhance = async (field: 'introduction') => {
    if (!profileForm[field] || !user) return;
    
    try {
      setAiLoading(`enhance_${field}`);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('No session found');
        return;
      }

      const { data, error } = await supabase.functions.invoke('process-voice-survey', {
        body: {
          text: profileForm[field],
          language: language,
          user_id: user.id,
          action: 'enhance_text'
        }
      });

      if (error) throw error;

      if (data?.success && data?.enhanced_text) {
        setProfileForm({ ...profileForm, [field]: data.enhanced_text });
      }
    } catch (error) {
      console.error('Error enhancing text:', error);
    } finally {
      setAiLoading(null);
    }
  };


  const translations = {
    en: {
      title: 'A Week in the Life of Dementia Caregivers',
      nav: {
        home: 'Home',
        survey: 'Survey',
        about: 'About',
        settings: 'Settings'
      },
      settings: {
        title: 'Settings',
        subtitle: 'Manage your notification preferences and account settings',
        surveyProgress: 'Survey Progress',
        surveyProgressSubtitle: 'Track your 7-day survey participation',
        day: 'Day',
        of: 'of',
        daysRemaining: 'days remaining',
        surveyComplete: 'Survey complete!',
        notEnrolled: 'Not enrolled in survey',
        startSurvey: 'Start Survey',
        profileSection: 'Personal Information',
        profileSubtitle: 'Tell us about yourself and your caregiving role',
        fullName: 'Full Name',
        introduction: 'Introduction',
        introductionPlaceholder: 'Tell us about yourself...',
        relationshipToPatient: 'Relationship to Patient',
        relationshipPlaceholder: 'e.g., Spouse, Child, Friend, Professional Caregiver',
        participantNumber: 'Participant Number',
        participantNumberPlaceholder: 'e.g., P001, P002',
        isPrimaryCaregiver: 'I am the primary caregiver',
        editProfile: 'Edit Profile',
        saveProfile: 'Save Profile',
        cancel: 'Cancel',
        notificationSettings: 'Notification Settings',
        hourlyReminders: 'Hourly Survey Reminders',
        hourlyRemindersDesc: 'Get notified every hour to log your caregiving activities',
        dndPeriod: 'Do Not Disturb Period',
        dndPeriodDesc: 'Set quiet hours when you don\'t want to receive notifications',
        dndStart: 'DND Start Time',
        dndEnd: 'DND End Time',
        testNotification: 'Send Test Notification',
        testingNotification: 'Sending...',
        dailyReminders: 'Daily Reminders',
        dailyRemindersDesc: 'Receive reminders to complete your daily survey',
        dailyReminderTime: 'Reminder Time',
        dailyReminderTimeDesc: 'Choose when you want to receive your daily reminder',
        researchUpdates: 'Research Notifications',
        researchUpdatesDesc: 'Receive all research-related notifications (e.g., interview schedules, study updates, research milestones)',
        pushNotifications: 'Push Notifications',
        pushNotificationsDesc: 'Receive push notifications on your mobile device',
        accountSettings: 'Account Settings',
        emailAddress: 'Email Address',
        dataExport: 'Data Export',
        dataExportDesc: 'Download a copy of your survey data',
        change: 'Change',
        export: 'Export',
        backToSurvey: 'Back to Survey',
        enableNotifications: 'Enable Notifications',
        requestPermission: 'Request Permission',
        notificationPermission: 'Notification Permission',
        browserNotifications: 'Browser notifications are currently',
        granted: 'granted',
        denied: 'denied',
        default: 'not requested'
      },
      signOut: 'Sign Out',
      languageLabels: {
        english: 'English',
        chinese: '中文'
      }
    },
    zh: {
      title: '痴呆症照护者的一周生活',
      nav: {
        home: '首页',
        survey: '调查',
        about: '关于',
        settings: '设置'
      },
      settings: {
        title: '设置',
        subtitle: '管理您的通知偏好和账户设置',
        surveyProgress: '调查进度',
        surveyProgressSubtitle: '追踪您的7天调查参与情况',
        day: '第',
        of: '天，共',
        daysRemaining: '天剩余',
        surveyComplete: '调查已完成！',
        notEnrolled: '尚未注册调查',
        startSurvey: '开始调查',
        profileSection: '个人信息',
        profileSubtitle: '告诉我们关于您和您的护理角色',
        fullName: '姓名',
        introduction: '个人介绍',
        introductionPlaceholder: '介绍一下您自己...',
        relationshipToPatient: '与患者的关系',
        relationshipPlaceholder: '例如：配偶、子女、朋友、专业护理员',
        participantNumber: '参与者编号',
        participantNumberPlaceholder: '例如：P001, P002',
        isPrimaryCaregiver: '我是主要护理者',
        editProfile: '编辑资料',
        saveProfile: '保存资料',
        cancel: '取消',
        notificationSettings: '通知设置',
        hourlyReminders: '每小时调查提醒',
        hourlyRemindersDesc: '每小时收到通知以记录您的照护活动',
        dndPeriod: '勿扰时段',
        dndPeriodDesc: '设置您不希望收到通知的安静时段',
        dndStart: '勿扰开始时间',
        dndEnd: '勿扰结束时间',
        testNotification: '发送测试通知',
        testingNotification: '发送中...',
        dailyReminders: '每日提醒',
        dailyRemindersDesc: '接收完成每日调查的提醒',
        dailyReminderTime: '提醒时间',
        dailyReminderTimeDesc: '选择您希望收到每日提醒的时间',
        researchUpdates: '研究通知',
        researchUpdatesDesc: '接收所有研究相关通知（如访谈时间安排、研究进展、里程碑更新）',
        pushNotifications: '推送通知',
        pushNotificationsDesc: '在移动设备上接收推送通知',
        accountSettings: '账户设置',
        emailAddress: '电子邮件地址',
        dataExport: '数据导出',
        dataExportDesc: '下载您的调查数据副本',
        change: '更改',
        export: '导出',
        backToSurvey: '返回调查',
        enableNotifications: '启用通知',
        requestPermission: '请求权限',
        notificationPermission: '通知权限',
        browserNotifications: '浏览器通知目前是',
        granted: '已授权',
        denied: '已拒绝',
        default: '未请求'
      },
      signOut: '退出登录',
      languageLabels: {
        english: 'English',
        chinese: '中文'
      }
    }
  };

  const settingsT = translations[language];

  // Update current tab based on location
  useEffect(() => {
    const path = location.pathname;
    if (path === '/survey') {
      setCurrentTab('survey');
    } else if (path === '/about') {
      setCurrentTab('about');
    } else if (path === '/settings') {
      setCurrentTab('settings');
    } else {
      setCurrentTab('home');
    }
  }, [location.pathname]);

  // Auth protection - return early if not logged in (AFTER all hooks)
  if (!user) {
    return (
      <>
        <DesktopHeader />
        <MobileHeader />
        <AuthModal isOpen={true} onClose={() => {}} />
      </>
    );
  }

  const handleTabClick = (tab: 'home' | 'survey' | 'about' | 'settings') => {
    setCurrentTab(tab);
    if (tab === 'home') {
      navigate('/');
    } else if (tab === 'survey') {
      navigate('/survey');
    } else if (tab === 'about') {
      navigate('/survey?tab=about');
    } else if (tab === 'settings') {
      navigate('/settings');
    }
  };

  const handleNotificationToggle = async (type: keyof typeof notifications) => {
    if (!user) return;
    const newValue = !notifications[type];
    const previous = notifications[type];
    
    // Optimistic update
    setNotifications(prev => ({ ...prev, [type]: newValue }));
    
    // Map frontend keys to DB column names
    const dbColumnMap: Record<string, string> = {
      dailyReminders: 'daily_reminders_enabled',
      researchUpdates: 'research_updates_enabled',
      pushNotifications: 'push_notifications_enabled'
    };
    
    try {
      await dataService.updateNotificationPreferences(user.id, {
        [dbColumnMap[type]]: newValue
      });
      
      // Update scheduler when daily reminders or push notifications change
      if (type === 'dailyReminders' || type === 'pushNotifications') {
        const updatedNotifs = { ...notifications, [type]: newValue };
        notificationScheduler.updatePreferences({
          hourly_reminders_enabled: hourlyReminders,
          daily_reminders_enabled: updatedNotifs.dailyReminders,
          daily_reminder_time: dailyReminderTime + ':00',
          push_notifications_enabled: updatedNotifs.pushNotifications,
          dnd_periods: dndPeriods,
          notification_permission_status: 'granted'
        }, language);
      }
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
      setNotifications(prev => ({ ...prev, [type]: previous }));
      toast.error(language === 'zh' ? '更新失败，请重试' : 'Failed to update, please try again');
    }
  };

  const handleDailyReminderTimeChange = async (newTime: string) => {
    if (!user) return;
    const previousTime = dailyReminderTime;
    setDailyReminderTime(newTime);
    
    try {
      await dataService.updateNotificationPreferences(user.id, {
        daily_reminder_time: newTime + ':00'
      });
      
      // Update scheduler with new time
      notificationScheduler.updatePreferences({
        hourly_reminders_enabled: hourlyReminders,
        daily_reminders_enabled: notifications.dailyReminders,
        daily_reminder_time: newTime + ':00',
        push_notifications_enabled: notifications.pushNotifications,
        dnd_periods: dndPeriods,
        notification_permission_status: 'granted'
      }, language);
    } catch (error) {
      console.error('Error updating daily reminder time:', error);
      setDailyReminderTime(previousTime);
      toast.error(language === 'zh' ? '更新失败，请重试' : 'Failed to update, please try again');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted' && user) {
        // Update permission status in database
        await dataService.updateNotificationPreferences(user.id, {
          notification_permission_status: 'granted'
        });
        
        // Show a test notification
        new Notification(language === 'zh' ? '通知已启用！' : 'Notifications enabled!', {
          body: language === 'zh' ? '您将收到每小时调查提醒。' : 'You will receive hourly survey reminders.',
          icon: '/favicon.ico'
        });
      }
    }
  };

  const handleHourlyRemindersToggle = async () => {
    if (!user) return;
    
    const newValue = !hourlyReminders;
    setHourlyReminders(newValue);
    
    try {
      const updated = await dataService.updateNotificationPreferences(user.id, {
        hourly_reminders_enabled: newValue
      });
      
      if (updated) {
        // Update scheduler
        notificationScheduler.updatePreferences({
          hourly_reminders_enabled: newValue,
          daily_reminders_enabled: notifications.dailyReminders,
          daily_reminder_time: dailyReminderTime + ':00',
          push_notifications_enabled: notifications.pushNotifications,
          dnd_periods: dndPeriods,
          notification_permission_status: updated.notification_permission_status || 'default'
        }, language);
      }
    } catch (error) {
      console.error('Error updating hourly reminders:', error);
      setHourlyReminders(!newValue);
    }
  };

  const handleAddDNDPeriod = async () => {
    if (!user) return;
    
    try {
      const added = await dataService.addDNDPeriod(user.id, {
        start_time: newDndPeriod.start_time + ':00',
        end_time: newDndPeriod.end_time + ':00',
        label: newDndPeriod.label || undefined,
        is_active: newDndPeriod.is_active
      });
      
      if (added) {
        const updatedPeriods = [...dndPeriods, added];
        setDndPeriods(updatedPeriods);
        setNewDndPeriod({ start_time: '22:00', end_time: '08:00', label: '', is_active: true });
        
        // Update scheduler
        notificationScheduler.updatePreferences({
          hourly_reminders_enabled: hourlyReminders,
          daily_reminders_enabled: notifications.dailyReminders,
          daily_reminder_time: dailyReminderTime + ':00',
          push_notifications_enabled: notifications.pushNotifications,
          dnd_periods: updatedPeriods,
          notification_permission_status: 'granted'
        }, language);
      }
    } catch (error) {
      console.error('Error adding DND period:', error);
    }
  };

  const handleDeleteDNDPeriod = async (periodId: number) => {
    if (!user) return;
    
    try {
      await dataService.deleteDNDPeriod(periodId);
      const updatedPeriods = dndPeriods.filter(p => p.id !== periodId);
      setDndPeriods(updatedPeriods);
      
      // Update scheduler
      notificationScheduler.updatePreferences({
        hourly_reminders_enabled: hourlyReminders,
        daily_reminders_enabled: notifications.dailyReminders,
        daily_reminder_time: dailyReminderTime + ':00',
        push_notifications_enabled: notifications.pushNotifications,
        dnd_periods: updatedPeriods,
        notification_permission_status: 'granted'
      }, language);
    } catch (error) {
      console.error('Error deleting DND period:', error);
    }
  };

  const handleToggleDNDPeriod = async (periodId: number, currentState: boolean) => {
    if (!user) return;
    
    try {
      await dataService.updateDNDPeriod(periodId, { is_active: !currentState });
      const updatedPeriods = dndPeriods.map(p => 
        p.id === periodId ? { ...p, is_active: !currentState } : p
      );
      setDndPeriods(updatedPeriods);
      
      // Update scheduler
      notificationScheduler.updatePreferences({
        hourly_reminders_enabled: hourlyReminders,
        daily_reminders_enabled: notifications.dailyReminders,
        daily_reminder_time: dailyReminderTime + ':00',
        push_notifications_enabled: notifications.pushNotifications,
        dnd_periods: updatedPeriods,
        notification_permission_status: 'granted'
      }, language);
    } catch (error) {
      console.error('Error toggling DND period:', error);
    }
  };

  const handleTestNotification = async () => {
    if (!user) return;
    
    if (Notification.permission !== 'granted') {
      await requestNotificationPermission();
      return;
    }
    
    setTestingNotification(true);
    try {
      await notificationScheduler.sendTestNotification(language);
    } catch (error: any) {
      console.error('Error sending test notification:', error);
      toast.error(error.message || 'Failed to send test notification');
    } finally {
      setTimeout(() => setTestingNotification(false), 2000);
    }
  };

  const exportData = async () => {
    if (!user) return;
    try {
      const careLogEntries = await dataService.getSurveyEntries(user.id);

      const exportData = {
        user: user?.email,
        exportDate: new Date().toISOString(),
        surveyData: {
          totalEntries: careLogEntries?.length || 0,
          entries: careLogEntries || [],
          dateRange: careLogEntries && careLogEntries.length > 0 
            ? `${careLogEntries[careLogEntries.length - 1].timestamp} to ${careLogEntries[0].timestamp}`
            : 'No entries yet'
        }
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `survey-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  // Allow page to render without authentication
  // Users can view settings even when not logged in

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <DesktopHeader />
      <MobileHeader />
      <main className="flex-1" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="px-4 py-6">
            <div className="text-center mb-12">
              <Settings className="mx-auto mb-6" style={{ color: 'var(--color-green)', width: 'clamp(3rem, 8vw, 4rem)', height: 'clamp(3rem, 8vw, 4rem)' }} />
              <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                {settingsT.settings.title}
              </h2>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                {settingsT.settings.subtitle}
              </p>
            </div>

            <div className="space-y-8">
              {/* Survey Progress Section */}
              {studyStartDate && surveyProgress && (
                <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
                  <div className="mb-6">
                    <h1 className="text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                      {settingsT.settings.surveyProgress}
                    </h1>
                    <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                      {settingsT.settings.surveyProgressSubtitle}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Progress Circle */}
                    <div className="relative flex items-center justify-center" style={{ width: 'clamp(6rem, 20vw, 8rem)', height: 'clamp(6rem, 20vw, 8rem)' }}>
                      <svg className="transform -rotate-90" style={{ width: '100%', height: '100%' }}>
                        <circle
                          cx="50%"
                          cy="50%"
                          r="40%"
                          stroke="var(--border-light)"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="50%"
                          cy="50%"
                          r="40%"
                          stroke="var(--color-green)"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${(surveyProgress.currentDay / surveyProgress.totalDays) * 251.2} 251.2`}
                          style={{ transition: 'stroke-dasharray 0.5s ease' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--color-green)' }}>
                          {language === 'zh' ? settingsT.settings.day : 'Day'} {surveyProgress.currentDay}
                        </span>
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {language === 'zh' ? `${settingsT.settings.of} ${surveyProgress.totalDays}` : `of ${surveyProgress.totalDays}`}
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress Details */}
                    <div className="flex-1 w-full">
                      <div className="space-y-3">
                        {/* Start Date */}
                        <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                            {language === 'zh' ? '开始日期' : 'Start Date'}
                          </span>
                          <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                            {new Date(studyStartDate).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                            {language === 'zh' ? '当前天数' : 'Current Day'}
                          </span>
                          <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                            {surveyProgress.currentDay} / {surveyProgress.totalDays}
                          </span>
                        </div>
                        
                        {surveyProgress.daysRemaining > 0 ? (
                          <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                              {language === 'zh' ? '剩余天数' : 'Days Remaining'}
                            </span>
                            <span className="text-lg font-bold" style={{ color: 'var(--color-green)' }}>
                              {surveyProgress.daysRemaining} {settingsT.settings.daysRemaining}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center p-4 rounded-xl" style={{ backgroundColor: 'var(--color-green)' }}>
                            <span className="text-base font-bold text-white">
                              🎉 {settingsT.settings.surveyComplete}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Start Date Selector - Before Research Starts */}
              {!studyStartDate && (
                <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
                  <div className="mb-6">
                    <h1 className="text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                      {language === 'zh' ? '研究开始日期' : 'Research Start Date'}
                    </h1>
                    <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                      {language === 'zh' ? '选择您的研究开始日期' : 'Choose your research start date'}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <input
                      type="date"
                      value={selectedStartDate}
                      onChange={(e) => setSelectedStartDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none"
                      style={{ 
                        borderColor: 'var(--border-light)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <button
                      onClick={async () => {
                        if (!user || !selectedStartDate) return;
                        setIsUpdatingStartDate(true);
                        try {
                          await supabase
                            .from('enrollment')
                            .update({ study_start_date: selectedStartDate })
                            .eq('participant_id', user.id);
                          
                          setStudyStartDate(selectedStartDate);
                          window.location.reload();
                        } catch (error) {
                          console.error('Error updating start date:', error);
                        } finally {
                          setIsUpdatingStartDate(false);
                        }
                      }}
                      disabled={isUpdatingStartDate}
                      className="w-full px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: 'var(--color-green)' }}
                    >
                      {isUpdatingStartDate ? (language === 'zh' ? '设置中...' : 'Setting...') : (language === 'zh' ? '设置开始日期' : 'Set Start Date')}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Profile Information Section */}
              <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                      {settingsT.settings.profileSection}
                    </h1>
                    <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                      {settingsT.settings.profileSubtitle}
                    </p>
                  </div>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all hover:opacity-90 w-full md:w-auto justify-center"
                    style={{ backgroundColor: 'var(--color-green)' }}
                  >
                    <Edit2 style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                    {settingsT.settings.editProfile}
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {settingsT.settings.fullName}
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none"
                      style={{ 
                        borderColor: 'var(--border-light)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  ) : (
                    <p className="text-lg px-4 py-3 rounded-xl" style={{ 
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)'
                    }}>
                      {profile?.full_name || user?.email?.split('@')[0] || 'Not set'}
                    </p>
                  )}
                </div>

                {/* Introduction */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {settingsT.settings.introduction}
                  </label>
                  {isEditingProfile ? (
                    <div className="relative">
                      <textarea
                        value={profileForm.introduction}
                        onChange={(e) => setProfileForm({ ...profileForm, introduction: e.target.value })}
                        placeholder={settingsT.settings.introductionPlaceholder}
                        rows={4}
                        className="w-full px-4 py-3 pr-24 rounded-xl border-2 transition-all focus:outline-none resize-none"
                        style={{ 
                          borderColor: 'var(--border-light)',
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <div className="absolute right-2 top-2 flex gap-1">
                        <button
                          onClick={() => handleVoiceInput('introduction')}
                          className="p-2 rounded-lg transition-all"
                          style={{
                            backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-primary)',
                            color: isRecording ? 'white' : 'var(--text-secondary)'
                          }}
                          disabled={aiLoading !== null}
                        >
                          <Mic style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                        </button>
                        <button
                          onClick={() => handleEnhance('introduction')}
                          className="p-2 rounded-lg transition-all"
                          style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}
                          disabled={!profileForm.introduction || aiLoading !== null}
                        >
                          {aiLoading === 'enhance_introduction' ? (
                            <Loader2 className="animate-spin" style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                          ) : (
                            <Sparkles style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-lg px-4 py-3 rounded-xl whitespace-pre-wrap" style={{ 
                      backgroundColor: 'var(--bg-secondary)',
                      color: profile?.introduction ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}>
                      {profile?.introduction || 'Not set'}
                    </p>
                  )}
                </div>

                {/* Relationship to Patient */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {settingsT.settings.relationshipToPatient}
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileForm.relationship_to_patient}
                      onChange={(e) => setProfileForm({ ...profileForm, relationship_to_patient: e.target.value })}
                      placeholder={settingsT.settings.relationshipPlaceholder}
                      className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none"
                      style={{ 
                        borderColor: 'var(--border-light)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  ) : (
                    <p className="text-lg px-4 py-3 rounded-xl" style={{ 
                      backgroundColor: 'var(--bg-secondary)',
                      color: profile?.relationship_to_patient ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}>
                      {profile?.relationship_to_patient || 'Not set'}
                    </p>
                  )}
                </div>

                {/* Participant Number - PP/PO System */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {language === 'zh' ? '参与者编号' : 'Participant Code'}
                  </label>
                  <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    {/* Show PP code for primary caregivers, PO code for others */}
                    <p className="text-lg font-bold" style={{ color: 'var(--color-green)' }}>
                      {profile?.participant_number || (language === 'zh' ? '未设置' : 'Not assigned')}
                    </p>
                    {/* For non-primary caregivers, show linked primary caregiver */}
                    {!profileForm.is_primary_caregiver && profile?.linked_primary_caregiver_code && (
                      <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                        {language === 'zh' 
                          ? `我是主要照护者 ${profile.linked_primary_caregiver_code} 的照护网络成员`
                          : `I am a member of the care network of caregiver ${profile.linked_primary_caregiver_code}`}
                      </p>
                    )}
                    {/* Explanation of the code system */}
                    <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
                      {profileForm.is_primary_caregiver 
                        ? (language === 'zh' ? 'PP = 主要照护者参与者' : 'PP = Primary Caregiver Participant')
                        : (language === 'zh' ? 'PO = 其他照护者参与者' : 'PO = Other Caregiver Participant')}
                    </p>
                  </div>
                </div>

                {/* Primary Caregiver Toggle - Always enabled, saves directly */}
                <div className="flex items-center justify-between p-6 rounded-xl border-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
                  <div className="flex items-center gap-3">
                    <User style={{ color: 'var(--color-green)', width: 'clamp(1.25rem, 3vw, 1.5rem)', height: 'clamp(1.25rem, 3vw, 1.5rem)' }} />
                    <span className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                      {settingsT.settings.isPrimaryCaregiver}
                    </span>
                  </div>
                  <IOSToggle
                    checked={profileForm.is_primary_caregiver}
                    onChange={async (checked) => {
                      try {
                        await supabase
                          .from('profiles')
                          .update({ is_primary_caregiver: checked })
                          .eq('id', user?.id);
                        setProfileForm({ ...profileForm, is_primary_caregiver: checked });
                      } catch (error) {
                        console.error('Error updating primary caregiver status:', error);
                      }
                    }}
                  />
                </div>

                {/* Collapsible Demographics Section */}
                <div className="rounded-xl border-2 overflow-hidden" style={{ borderColor: 'var(--border-light)' }}>
                  <button
                    onClick={() => setShowDemographics(!showDemographics)}
                    className="w-full flex items-center justify-between p-4"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                  >
                    <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                      {profileForm.is_primary_caregiver 
                        ? (language === 'zh' ? '主要照护者信息' : 'Primary Caregiver Information')
                        : (language === 'zh' ? '网络成员信息' : 'Network Member Information')}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>{showDemographics ? '▲' : '▼'}</span>
                  </button>
                  
                  {showDemographics && (
                    <div className="p-6 space-y-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
                      
                      {/* Section A: Your Information */}
                      <div className="space-y-4">
                        <h5 className="text-sm font-semibold pb-2 border-b" style={{ color: 'var(--color-green)', borderColor: 'var(--border-light)' }}>
                          {language === 'zh' ? 'A. 您的基本信息' : 'A. Your Basic Information'}
                        </h5>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {/* Age */}
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                              {language === 'zh' ? '年龄' : 'Age'}
                            </label>
                            <input
                              type="number"
                              value={profileForm.caregiver_age || ''}
                              onChange={(e) => setProfileForm({ ...profileForm, caregiver_age: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border text-sm"
                              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
                              placeholder="--"
                            />
                          </div>
                          
                          {/* Gender */}
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                              {language === 'zh' ? '性别' : 'Gender'}
                            </label>
                            <IOSDropdown
                              value={profileForm.caregiver_gender || ''}
                              onChange={(value) => setProfileForm({ ...profileForm, caregiver_gender: value })}
                              placeholder={language === 'zh' ? '请选择' : 'Select'}
                              options={[
                                { value: 'male', label: language === 'zh' ? '男' : 'Male' },
                                { value: 'female', label: language === 'zh' ? '女' : 'Female' },
                                { value: 'other', label: language === 'zh' ? '其他' : 'Other' }
                              ]}
                            />
                          </div>
                        </div>
                        
                        {/* Education */}
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                            {language === 'zh' ? '教育程度' : 'Education Level'}
                          </label>
                          <IOSDropdown
                            value={profileForm.caregiver_education || ''}
                            onChange={(value) => setProfileForm({ ...profileForm, caregiver_education: value })}
                            placeholder={language === 'zh' ? '请选择' : 'Select'}
                            options={[
                              { value: 'elementary', label: language === 'zh' ? '小学' : 'Elementary' },
                              { value: 'middle', label: language === 'zh' ? '初中' : 'Middle School' },
                              { value: 'high', label: language === 'zh' ? '高中' : 'High School' },
                              { value: 'associate', label: language === 'zh' ? '专科' : 'Associate' },
                              { value: 'bachelor', label: language === 'zh' ? '本科' : 'Bachelor' },
                              { value: 'master', label: language === 'zh' ? '硕士' : 'Master' },
                              { value: 'doctorate', label: language === 'zh' ? '博士' : 'Doctorate' }
                            ]}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {/* Employment Status */}
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                              {language === 'zh' ? '就业状态' : 'Employment'}
                            </label>
                            <IOSDropdown
                              value={profileForm.employment_status || ''}
                              onChange={(value) => setProfileForm({ ...profileForm, employment_status: value })}
                              placeholder={language === 'zh' ? '请选择' : 'Select'}
                              options={[
                                { value: 'full_time', label: language === 'zh' ? '全职' : 'Full-time' },
                                { value: 'part_time', label: language === 'zh' ? '兼职' : 'Part-time' },
                                { value: 'retired', label: language === 'zh' ? '退休' : 'Retired' },
                                { value: 'unemployed', label: language === 'zh' ? '待业' : 'Unemployed' },
                                { value: 'homemaker', label: language === 'zh' ? '全职照护' : 'Full-time Caregiver' }
                              ]}
                            />
                          </div>
                          
                          {/* Marital Status */}
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                              {language === 'zh' ? '婚姻状态' : 'Marital Status'}
                            </label>
                            <IOSDropdown
                              value={profileForm.marital_status || ''}
                              onChange={(value) => setProfileForm({ ...profileForm, marital_status: value })}
                              placeholder={language === 'zh' ? '请选择' : 'Select'}
                              options={[
                                { value: 'married', label: language === 'zh' ? '已婚' : 'Married' },
                                { value: 'single', label: language === 'zh' ? '单身' : 'Single' },
                                { value: 'divorced', label: language === 'zh' ? '离异' : 'Divorced' },
                                { value: 'widowed', label: language === 'zh' ? '丧偶' : 'Widowed' },
                                { value: 'partnered', label: language === 'zh' ? '同居' : 'Partnered' }
                              ]}
                            />
                          </div>
                        </div>
                        
                        {/* Self-rated Health */}
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                            {language === 'zh' ? '自评健康状况' : 'Self-rated Health'}
                          </label>
                          <IOSDropdown
                            value={profileForm.health_status || ''}
                            onChange={(value) => setProfileForm({ ...profileForm, health_status: value })}
                            placeholder={language === 'zh' ? '请选择' : 'Select'}
                            options={[
                              { value: 'excellent', label: language === 'zh' ? '非常好' : 'Excellent' },
                              { value: 'good', label: language === 'zh' ? '良好' : 'Good' },
                              { value: 'fair', label: language === 'zh' ? '一般' : 'Fair' },
                              { value: 'poor', label: language === 'zh' ? '较差' : 'Poor' }
                            ]}
                          />
                        </div>
                      </div>
                      
                      {/* Section B: Primary Caregiver Specific */}
                      {profileForm.is_primary_caregiver && (
                        <div className="space-y-4">
                          <h5 className="text-sm font-semibold pb-2 border-b" style={{ color: 'var(--color-green)', borderColor: 'var(--border-light)' }}>
                            {language === 'zh' ? 'B. 照护情况' : 'B. Caregiving Details'}
                          </h5>
                          
                          <div className="grid grid-cols-2 gap-4">
                            {/* Caregiving Duration */}
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                {language === 'zh' ? '照护时长 (年)' : 'Caregiving Duration (years)'}
                              </label>
                              <input
                                type="number"
                                value={profileForm.caregiving_years || ''}
                                onChange={(e) => setProfileForm({ ...profileForm, caregiving_years: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border text-sm"
                                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
                                placeholder="--"
                              />
                            </div>
                            
                            {/* Hours per Week */}
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                {language === 'zh' ? '每周照护小时' : 'Hours per Week'}
                              </label>
                              <input
                                type="number"
                                value={profileForm.caregiving_hours_per_week || ''}
                                onChange={(e) => setProfileForm({ ...profileForm, caregiving_hours_per_week: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border text-sm"
                                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
                                placeholder="--"
                              />
                            </div>
                          </div>
                          
                          {/* Distance from Care Recipient */}
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                              {language === 'zh' ? '与被照护者的距离' : 'Distance from Care Recipient'}
                            </label>
                            <IOSDropdown
                              value={profileForm.living_with_recipient || ''}
                              onChange={(value) => setProfileForm({ ...profileForm, living_with_recipient: value })}
                              placeholder={language === 'zh' ? '请选择' : 'Select'}
                              options={[
                                { value: 'same_home', label: language === 'zh' ? '同住' : 'Same Home' },
                                { value: 'same_community', label: language === 'zh' ? '同社区' : 'Same Community' },
                                { value: 'same_district', label: language === 'zh' ? '同区' : 'Same District' },
                                { value: 'same_city', label: language === 'zh' ? '同城' : 'Same City' },
                                { value: 'diff_city', label: language === 'zh' ? '异地' : 'Different City' },
                                { value: 'abroad', label: language === 'zh' ? '国外' : 'Abroad' }
                              ]}
                            />
                          </div>
                        </div>
                      )}
                      
                    </div>
                  )}
                </div>

                {/* Separate Collapsible Patient Condition Section - Only for Primary Caregivers */}
                {profileForm.is_primary_caregiver && (
                  <div className="rounded-xl border-2 overflow-hidden" style={{ borderColor: 'var(--border-light)' }}>
                    <button
                      onClick={() => setShowPatientCondition(!showPatientCondition)}
                      className="w-full flex items-center justify-between p-4"
                      style={{ backgroundColor: 'var(--bg-secondary)' }}
                    >
                      <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                        {language === 'zh' ? '被照护者信息' : 'Care Recipient Information'}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{showPatientCondition ? '▲' : '▼'}</span>
                    </button>
                    
                    {showPatientCondition && (
                      <div className="p-6 space-y-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
                        <div className="space-y-4">
                          
                          <div className="grid grid-cols-2 gap-4">
                            {/* Care Recipient Age */}
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                {language === 'zh' ? '被照护者年龄' : 'Care Recipient Age'}
                              </label>
                              <input
                                type="number"
                                value={profileForm.recipient_age || ''}
                                onChange={(e) => setProfileForm({ ...profileForm, recipient_age: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border text-sm"
                                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
                                placeholder="--"
                              />
                            </div>
                            
                            {/* Care Recipient Gender */}
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                {language === 'zh' ? '被照护者性别' : 'Care Recipient Gender'}
                              </label>
                              <IOSDropdown
                                value={profileForm.recipient_gender || ''}
                                onChange={(value) => setProfileForm({ ...profileForm, recipient_gender: value })}
                                placeholder={language === 'zh' ? '请选择' : 'Select'}
                                options={[
                                  { value: 'male', label: language === 'zh' ? '男' : 'Male' },
                                  { value: 'female', label: language === 'zh' ? '女' : 'Female' }
                                ]}
                              />
                            </div>
                          </div>
                          
                          {/* Dementia Type */}
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                              {language === 'zh' ? '失智症类型' : 'Dementia Type'}
                            </label>
                            <IOSDropdown
                              value={profileForm.dementia_type || ''}
                              onChange={(value) => setProfileForm({ ...profileForm, dementia_type: value })}
                              placeholder={language === 'zh' ? '请选择' : 'Select'}
                              options={[
                                { value: 'alzheimer', label: language === 'zh' ? '阿尔茨海默病' : "Alzheimer's Disease" },
                                { value: 'vascular', label: language === 'zh' ? '血管性失智' : 'Vascular Dementia' },
                                { value: 'lewy_body', label: language === 'zh' ? '路易体失智' : 'Lewy Body Dementia' },
                                { value: 'frontotemporal', label: language === 'zh' ? '额颞叶失智' : 'Frontotemporal' },
                                { value: 'mixed', label: language === 'zh' ? '混合型' : 'Mixed' },
                                { value: 'unknown', label: language === 'zh' ? '不确定' : 'Unknown' }
                              ]}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            {/* Years Since Diagnosis */}
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                {language === 'zh' ? '确诊年数' : 'Years Since Diagnosis'}
                              </label>
                              <input
                                type="number"
                                value={profileForm.years_since_diagnosis || ''}
                                onChange={(e) => setProfileForm({ ...profileForm, years_since_diagnosis: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border text-sm"
                                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
                                placeholder="--"
                              />
                            </div>
                            
                            {/* Dementia Stage */}
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                {language === 'zh' ? '失智症阶段' : 'Dementia Stage'}
                              </label>
                              <IOSDropdown
                                value={profileForm.dementia_stage || ''}
                                onChange={(value) => setProfileForm({ ...profileForm, dementia_stage: value })}
                                placeholder={language === 'zh' ? '请选择' : 'Select'}
                                options={[
                                  { value: 'cdr_0', label: language === 'zh' ? 'CDR 0 - 正常' : 'CDR 0 - Normal' },
                                  { value: 'cdr_0.5', label: language === 'zh' ? 'CDR 0.5 - 极轻度失智' : 'CDR 0.5 - Very Mild Dementia' },
                                  { value: 'cdr_1', label: language === 'zh' ? 'CDR 1 - 轻度失智' : 'CDR 1 - Mild Dementia' },
                                  { value: 'cdr_2', label: language === 'zh' ? 'CDR 2 - 中度失智' : 'CDR 2 - Moderate Dementia' },
                                  { value: 'cdr_3', label: language === 'zh' ? 'CDR 3 - 重度失智' : 'CDR 3 - Severe Dementia' }
                                ]}
                              />
                            </div>
                          </div>
                          
                          {/* Care Recipient Education */}
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                              {language === 'zh' ? '被照护者教育程度' : 'Care Recipient Education'}
                            </label>
                            <IOSDropdown
                              value={profileForm.recipient_education || ''}
                              onChange={(value) => setProfileForm({ ...profileForm, recipient_education: value })}
                              placeholder={language === 'zh' ? '请选择' : 'Select'}
                              options={[
                                { value: 'none', label: language === 'zh' ? '无正规教育' : 'No formal education' },
                                { value: 'elementary', label: language === 'zh' ? '小学' : 'Elementary' },
                                { value: 'middle', label: language === 'zh' ? '初中' : 'Middle School' },
                                { value: 'high', label: language === 'zh' ? '高中' : 'High School' },
                                { value: 'associate', label: language === 'zh' ? '专科' : 'Associate' },
                                { value: 'bachelor', label: language === 'zh' ? '本科' : 'Bachelor' },
                                { value: 'master_above', label: language === 'zh' ? '硕士及以上' : 'Master or above' }
                              ]}
                            />
                          </div>
                          
                          {/* ADL Section - Activities of Daily Living */}
                          <div className="pt-3 border-t" style={{ borderColor: 'var(--border-light)' }}>
                            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                              {language === 'zh' ? '日常生活活动能力 (ADL)' : 'Activities of Daily Living (ADL)'}
                            </label>
                            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)', opacity: 0.8 }}>
                              {language === 'zh' ? '被照护者在以下活动中需要多少帮助？' : 'How much help does the care recipient need with these activities?'}
                            </p>
                            <div className="space-y-2">
                              {[
                                { key: 'recipient_adl_eating', en: 'Eating', zh: '进食' },
                                { key: 'recipient_adl_bathing', en: 'Bathing', zh: '洗澡' },
                                { key: 'recipient_adl_dressing', en: 'Dressing', zh: '穿衣' },
                                { key: 'recipient_adl_toileting', en: 'Toileting', zh: '如厕' },
                                { key: 'recipient_adl_mobility', en: 'Moving around', zh: '行动' }
                              ].map(item => (
                                <div key={item.key} className="flex items-center justify-between">
                                  <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{language === 'zh' ? item.zh : item.en}</span>
                                  <div style={{ width: '140px' }}>
                                    <IOSDropdown
                                      value={(profileForm as unknown as Record<string, string>)[item.key] || ''}
                                      onChange={(value) => setProfileForm({ ...profileForm, [item.key]: value })}
                                      placeholder={language === 'zh' ? '请选择' : 'Select'}
                                      options={[
                                        { value: 'independent', label: language === 'zh' ? '独立完成' : 'Independent' },
                                        { value: 'some_help', label: language === 'zh' ? '需要帮助' : 'Needs help' },
                                        { value: 'dependent', label: language === 'zh' ? '完全依赖' : 'Fully dependent' }
                                      ]}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* IADL Section - Instrumental ADLs */}
                          <div className="pt-3 border-t" style={{ borderColor: 'var(--border-light)' }}>
                            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                              {language === 'zh' ? '工具性日常活动能力 (IADL)' : 'Instrumental Activities of Daily Living (IADL)'}
                            </label>
                            <div className="space-y-2">
                              {[
                                { key: 'recipient_iadl_medication', en: 'Managing medications', zh: '管理药物' },
                                { key: 'recipient_iadl_finances', en: 'Handling finances', zh: '处理财务' },
                                { key: 'recipient_iadl_shopping', en: 'Shopping', zh: '购物' },
                                { key: 'recipient_iadl_cooking', en: 'Preparing meals', zh: '准备餐食' },
                                { key: 'recipient_iadl_housework', en: 'Housework', zh: '家务' }
                              ].map(item => (
                                <div key={item.key} className="flex items-center justify-between">
                                  <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{language === 'zh' ? item.zh : item.en}</span>
                                  <div style={{ width: '140px' }}>
                                    <IOSDropdown
                                      value={(profileForm as unknown as Record<string, string>)[item.key] || ''}
                                      onChange={(value) => setProfileForm({ ...profileForm, [item.key]: value })}
                                      placeholder={language === 'zh' ? '请选择' : 'Select'}
                                      options={[
                                        { value: 'independent', label: language === 'zh' ? '独立完成' : 'Independent' },
                                        { value: 'some_help', label: language === 'zh' ? '需要帮助' : 'Needs help' },
                                        { value: 'dependent', label: language === 'zh' ? '无法完成' : 'Unable' }
                                      ]}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* BPSD Section - Behavioral Symptoms */}
                          <div className="pt-3 border-t" style={{ borderColor: 'var(--border-light)' }}>
                            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                              {language === 'zh' ? '行为与心理症状 (BPSD)' : 'Behavioral & Psychological Symptoms (BPSD)'}
                            </label>
                            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)', opacity: 0.8 }}>
                              {language === 'zh' ? '被照护者是否出现以下症状？' : 'Does the care recipient show any of these symptoms?'}
                            </p>
                            <div className="space-y-2">
                              {[
                                { key: 'recipient_bpsd_agitation', en: 'Agitation/Restlessness', zh: '躁动/不安' },
                                { key: 'recipient_bpsd_wandering', en: 'Wandering', zh: '游走' },
                                { key: 'recipient_bpsd_sleep', en: 'Sleep disturbances', zh: '睡眠障碍' },
                                { key: 'recipient_bpsd_aggression', en: 'Aggression', zh: '攻击性行为' },
                                { key: 'recipient_bpsd_depression', en: 'Depression', zh: '抑郁' },
                                { key: 'recipient_bpsd_anxiety', en: 'Anxiety', zh: '焦虑' },
                                { key: 'recipient_bpsd_hallucinations', en: 'Hallucinations/Delusions', zh: '幻觉/妄想' }
                              ].map(item => (
                                <div key={item.key} className="flex items-center justify-between">
                                  <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{language === 'zh' ? item.zh : item.en}</span>
                                  <div style={{ width: '140px' }}>
                                    <IOSDropdown
                                      value={(profileForm as unknown as Record<string, string>)[item.key] || ''}
                                      onChange={(value) => setProfileForm({ ...profileForm, [item.key]: value })}
                                      placeholder={language === 'zh' ? '请选择' : 'Select'}
                                      options={[
                                        { value: 'never', label: language === 'zh' ? '从不' : 'Never' },
                                        { value: 'sometimes', label: language === 'zh' ? '有时' : 'Sometimes' },
                                        { value: 'often', label: language === 'zh' ? '经常' : 'Often' },
                                        { value: 'always', label: language === 'zh' ? '总是' : 'Always' }
                                      ]}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Communication Ability */}
                          <div className="pt-3 border-t" style={{ borderColor: 'var(--border-light)' }}>
                            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                              {language === 'zh' ? '沟通能力' : 'Communication Ability'}
                            </label>
                            <IOSDropdown
                              value={profileForm.recipient_communication || ''}
                              onChange={(value) => setProfileForm({ ...profileForm, recipient_communication: value })}
                              placeholder={language === 'zh' ? '请选择' : 'Select'}
                              options={[
                                { value: 'normal', label: language === 'zh' ? '正常交流' : 'Normal communication' },
                                { value: 'mild_difficulty', label: language === 'zh' ? '轻度困难（偶尔找词困难）' : 'Mild difficulty' },
                                { value: 'moderate_difficulty', label: language === 'zh' ? '中度困难（需要简化语言）' : 'Moderate difficulty' },
                                { value: 'severe_difficulty', label: language === 'zh' ? '重度困难（仅能简单交流）' : 'Severe difficulty' },
                                { value: 'minimal', label: language === 'zh' ? '几乎无法交流' : 'Minimal/no communication' }
                              ]}
                            />
                          </div>
                          
                          {/* Comorbidities */}
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                              {language === 'zh' ? '其他健康状况（可多选）' : 'Other Health Conditions'}
                            </label>
                            <textarea
                              value={profileForm.recipient_comorbidities || ''}
                              onChange={(e) => setProfileForm({ ...profileForm, recipient_comorbidities: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border text-sm"
                              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
                              placeholder={language === 'zh' ? '如：糖尿病、高血压、心脏病、中风史等' : 'e.g., Diabetes, Hypertension, Heart disease, Stroke history'}
                              rows={2}
                            />
                          </div>
                          
                          {/* Short Sense of Competence Questionnaire (SSCQ) - 7 items */}
                          <div className="pt-3 border-t" style={{ borderColor: 'var(--border-light)' }}>
                            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-green)' }}>
                              {language === 'zh' ? '照护能力感量表 (SSCQ)' : 'Short Sense of Competence Questionnaire (SSCQ)'}
                            </label>
                            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                              {language === 'zh' 
                                ? '请根据您目前的照护经历，选择最符合您感受的选项（1=非常同意 到 5=非常不同意）' 
                                : 'Based on your current caregiving experience, select the option that best describes your feelings (1=Strongly Agree to 5=Strongly Disagree)'}
                            </p>
                            <div className="space-y-3">
                              {[
                                { key: 'sscq_strained_interactions', en: 'I feel strained in my interactions with my care recipient', zh: '我在与被照护者的互动中感到紧张' },
                                { key: 'sscq_privacy', en: 'I feel that the present situation doesn\'t allow me as much privacy as I\'d like', zh: '我觉得目前的情况没有给我足够的隐私空间' },
                                { key: 'sscq_useful', en: 'I feel useful in my interactions with my care recipient', zh: '我觉得自己在与被照护者的互动中是有用的' },
                                { key: 'sscq_social_life', en: 'I feel that my social life has suffered', zh: '我觉得我的社交生活受到了影响' },
                                { key: 'sscq_manipulation', en: 'I feel that my care recipient tries to manipulate me', zh: '我觉得被照护者试图操控我' },
                                { key: 'sscq_solutions', en: 'I feel that it is possible to find solutions to problems', zh: '我觉得问题是可以找到解决办法的' },
                                { key: 'sscq_health', en: 'I feel that my health has suffered', zh: '我觉得我的健康状况受到了影响' }
                              ].map((item, idx) => (
                                <div key={item.key} className="space-y-1">
                                  <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
                                    {idx + 1}. {language === 'zh' ? item.zh : item.en}
                                  </p>
                                  <IOSDropdown
                                    value={(profileForm as unknown as Record<string, string>)[item.key] || ''}
                                    onChange={(value) => setProfileForm({ ...profileForm, [item.key]: value })}
                                    placeholder={language === 'zh' ? '请选择' : 'Select'}
                                    options={[
                                      { value: '1', label: language === 'zh' ? '1 - 非常同意' : '1 - Strongly Agree' },
                                      { value: '2', label: language === 'zh' ? '2 - 同意' : '2 - Agree' },
                                      { value: '3', label: language === 'zh' ? '3 - 中立' : '3 - Neutral' },
                                      { value: '4', label: language === 'zh' ? '4 - 不同意' : '4 - Disagree' },
                                      { value: '5', label: language === 'zh' ? '5 - 非常不同意' : '5 - Strongly Disagree' }
                                    ]}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Perseverance Time - Forward-looking measure */}
                          <div className="pt-3 border-t" style={{ borderColor: 'var(--border-light)' }}>
                            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-green)' }}>
                              {language === 'zh' ? '当前持续照护意愿' : 'Current Perseverance Time'}
                            </label>
                            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                              {language === 'zh' 
                                ? '如果照护情况保持现状，您认为您还能继续提供照护多长时间？' 
                                : 'If the caregiving situation remains as it is now, how long do you think you can continue providing care?'}
                            </p>
                            <IOSDropdown
                              value={profileForm.perseverance_time || ''}
                              onChange={(value) => setProfileForm({ ...profileForm, perseverance_time: value })}
                              placeholder={language === 'zh' ? '请选择' : 'Select'}
                              options={[
                                { value: 'less_than_week', label: language === 'zh' ? '少于一周' : 'Less than a week' },
                                { value: 'week_to_month', label: language === 'zh' ? '一周到一个月' : 'More than a week but less than a month' },
                                { value: 'month_to_six_months', label: language === 'zh' ? '一个月到六个月' : 'More than a month but less than six months' },
                                { value: 'six_months_to_year', label: language === 'zh' ? '六个月到一年' : 'More than six months but less than a year' },
                                { value: 'year_to_two_years', label: language === 'zh' ? '一年到两年' : 'More than a year but less than two years' },
                                { value: 'more_than_two_years', label: language === 'zh' ? '超过两年（请注明具体年数）' : 'More than two years (please specify duration)' }
                              ]}
                            />
                            {profileForm.perseverance_time === 'more_than_two_years' && (
                              <input
                                type="number"
                                min="2"
                                max="10"
                                placeholder={language === 'zh' ? '请输入年数（2-10年）' : 'Enter years (2-10)'}
                                className="w-full mt-2 px-3 py-2 rounded-lg border text-sm"
                                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* My Care Network Section - For Primary Caregivers */}
                {profileForm.is_primary_caregiver && (
                  <div className="rounded-xl border-2 overflow-hidden" style={{ borderColor: 'var(--border-light)' }}>
                    <button
                      onClick={() => setShowNetworkConfig(!showNetworkConfig)}
                      className="w-full flex items-center justify-between p-4"
                      style={{ backgroundColor: 'var(--bg-secondary)' }}
                    >
                      <span className="text-base font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Users style={{ color: 'var(--color-green)', width: 18, height: 18 }} />
                        {language === 'zh' ? '我的照护网络' : 'My Care Network'}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{showNetworkConfig ? '▲' : '▼'}</span>
                    </button>
                    
                    {showNetworkConfig && (
                      <div style={{ backgroundColor: 'var(--bg-primary)' }}>
                        <Ecogram
                          userId={user?.id || ''}
                          language={language}
                          initialData={profile?.ecogram_data}
                          primaryCaregiverCode={profile?.primary_caregiver_code}
                          isPrimaryCaregiver={profileForm.is_primary_caregiver}
                        />
                      </div>
                    )}
                  </div>
                )}
                      
                {/* Section: Network Member Relationship (Non-Primary Only) */}
                {!profileForm.is_primary_caregiver && (
                  <div className="rounded-xl border-2 overflow-hidden" style={{ borderColor: 'var(--border-light)' }}>
                    <div className="p-6 space-y-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
                        <div className="space-y-4">
                          <h5 className="text-sm font-semibold pb-2 border-b" style={{ color: 'var(--color-green)', borderColor: 'var(--border-light)' }}>
                            {language === 'zh' ? 'B. 您与主要照护者/被照护者的关系' : 'B. Your Relationship to the Caregiver'}
                          </h5>
                          
                          {/* Relationship to Primary Caregiver */}
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                              {language === 'zh' ? '您与主要照护者的关系' : 'Relationship to Primary Caregiver'}
                            </label>
                            <IOSDropdown
                              value={profileForm.relationship_to_primary || ''}
                              onChange={(value) => setProfileForm({ ...profileForm, relationship_to_primary: value })}
                              placeholder={language === 'zh' ? '请选择' : 'Select'}
                              options={[
                                { value: 'spouse', label: language === 'zh' ? '配偶' : 'Spouse' },
                                { value: 'child', label: language === 'zh' ? '子女' : 'Child' },
                                { value: 'sibling', label: language === 'zh' ? '兄弟姐妹' : 'Sibling' },
                                { value: 'parent', label: language === 'zh' ? '父母' : 'Parent' },
                                { value: 'friend', label: language === 'zh' ? '朋友' : 'Friend' },
                                { value: 'neighbor', label: language === 'zh' ? '邻居' : 'Neighbor' },
                                { value: 'professional', label: language === 'zh' ? '专业人员' : 'Professional' },
                                { value: 'other', label: language === 'zh' ? '其他' : 'Other' }
                              ]}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            {/* Distance from Care Recipient */}
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                {language === 'zh' ? '与被照护者的距离' : 'Distance from Care Recipient'}
                              </label>
                              <IOSDropdown
                                value={profileForm.distance_from_recipient || ''}
                                onChange={(value) => setProfileForm({ ...profileForm, distance_from_recipient: value })}
                                placeholder={language === 'zh' ? '请选择' : 'Select'}
                                options={[
                                  { value: 'same_home', label: language === 'zh' ? '同住' : 'Same Home' },
                                  { value: 'same_community', label: language === 'zh' ? '同社区' : 'Same Community' },
                                  { value: 'same_district', label: language === 'zh' ? '同区' : 'Same District' },
                                  { value: 'same_city', label: language === 'zh' ? '同城' : 'Same City' },
                                  { value: 'diff_city', label: language === 'zh' ? '异地' : 'Different City' },
                                  { value: 'abroad', label: language === 'zh' ? '国外' : 'Abroad' }
                                ]}
                              />
                            </div>
                            
                            {/* Frequency of Contact */}
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                {language === 'zh' ? '联系频率' : 'Contact Frequency'}
                              </label>
                              <IOSDropdown
                                value={profileForm.contact_frequency || ''}
                                onChange={(value) => setProfileForm({ ...profileForm, contact_frequency: value })}
                                placeholder={language === 'zh' ? '请选择' : 'Select'}
                                options={[
                                  { value: 'daily', label: language === 'zh' ? '每天' : 'Daily' },
                                  { value: 'weekly', label: language === 'zh' ? '每周' : 'Weekly' },
                                  { value: 'monthly', label: language === 'zh' ? '每月' : 'Monthly' },
                                  { value: 'rarely', label: language === 'zh' ? '偶尔' : 'Rarely' }
                                ]}
                              />
                            </div>
                          </div>
                        </div>
                    </div>
                  </div>
                )}

                {/* Understanding Dementia Section - Collapsible */}
                <div className="rounded-xl border-2 overflow-hidden" style={{ borderColor: 'var(--border-light)' }}>
                  <button
                    onClick={() => setShowDementiaKnowledge(!showDementiaKnowledge)}
                    className="w-full flex items-center justify-between p-4"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                  >
                    <div>
                      <span className="text-base font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        {language === 'zh' ? '关于失智症的了解' : 'Your Understanding of Dementia'}
                      </span>
                      <p className="text-xs mt-1 text-left" style={{ color: 'var(--text-secondary)' }}>
                        {language === 'zh' ? '点击展开填写50道问题' : 'Click to expand and fill 50 questions'}
                      </p>
                    </div>
                    <span style={{ color: 'var(--text-secondary)' }}>{showDementiaKnowledge ? '▲' : '▼'}</span>
                  </button>
                  
                  {showDementiaKnowledge && (
                  <div className="p-6 space-y-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
                  
                  {/* Part 1: True/False Questions (1-30) */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {language === 'zh' ? '请判断以下陈述是"对"还是"错"：' : 'Please indicate whether each statement is True or False:'}
                    </p>
                    
                    {[
                      { en: "People with Alzheimer's disease are particularly prone to depression.", zh: "阿尔茨海默病患者特别容易出现抑郁症状。" },
                      { en: "Most people with Alzheimer's disease live in nursing homes.", zh: "大多数阿尔茨海默病患者住在养老院。" },
                      { en: "It is safe for people with Alzheimer's disease to drive, as long as they have a companion in the car at all times.", zh: "只要有人陪同，阿尔茨海默病患者开车是安全的。" },
                      { en: "It has been scientifically proven that mental exercise can prevent a person from getting Alzheimer's disease.", zh: "已经科学证明，脑力锻炼可以预防阿尔茨海默病。" },
                      { en: "People in their 30s can have Alzheimer's disease.", zh: "30多岁的人也可能患阿尔茨海默病。" },
                      { en: "Having high cholesterol may increase a person's risk of developing Alzheimer's disease.", zh: "高胆固醇可能增加患阿尔茨海默病的风险。" },
                      { en: "Prescription drugs that prevent Alzheimer's disease are available.", zh: "目前有可以预防阿尔茨海默病的处方药。" },
                      { en: "Having high blood pressure may increase a person's risk of developing Alzheimer's disease.", zh: "高血压可能增加患阿尔茨海默病的风险。" },
                      { en: "Genes can only partially account for the development of Alzheimer's disease.", zh: "基因只能部分解释阿尔茨海默病的发生。" },
                      { en: "After symptoms of Alzheimer's disease appear, the average life expectancy is 6 to 12 years.", zh: "阿尔茨海默病症状出现后，平均预期寿命为6至12年。" },
                      { en: "In rare cases, people have recovered from Alzheimer's disease.", zh: "在极少数情况下，有人从阿尔茨海默病中康复。" },
                      { en: "A person with Alzheimer's disease becomes increasingly likely to fall down as the disease gets worse.", zh: "随着病情恶化，阿尔茨海默病患者越来越容易跌倒。" },
                      { en: "Eventually, a person with Alzheimer's disease will need 24-hour supervision.", zh: "最终，阿尔茨海默病患者将需要24小时监护。" },
                      { en: "When a person with Alzheimer's disease becomes agitated, a medical examination might reveal other health problems that caused the agitation.", zh: "当阿尔茨海默病患者变得躁动时，医学检查可能会发现导致躁动的其他健康问题。" },
                      { en: "If trouble with memory and confused thinking appears suddenly, it is likely due to Alzheimer's disease.", zh: "如果记忆问题和思维混乱突然出现，很可能是阿尔茨海默病引起的。" },
                      { en: "Symptoms of severe depression can be mistaken for symptoms of Alzheimer's disease.", zh: "严重抑郁症的症状可能被误认为是阿尔茨海默病的症状。" },
                      { en: "Alzheimer's disease is one type of dementia.", zh: "阿尔茨海默病是失智症的一种类型。" },
                      { en: "People with Alzheimer's disease do best with simple instructions given one step at a time.", zh: "阿尔茨海默病患者最适合接受一次一步的简单指示。" },
                      { en: "When people with Alzheimer's disease begin to have difficulty taking care of themselves, caregivers should take over right away.", zh: "当阿尔茨海默病患者开始难以照顾自己时，照护者应该立即接手。" },
                      { en: "If a person with Alzheimer's disease becomes alert and agitated at night, a good strategy is to try to make sure that the person gets plenty of physical activity during the day.", zh: "如果阿尔茨海默病患者夜间变得清醒和躁动，一个好策略是确保患者白天有足够的体力活动。" },
                      { en: "When people with Alzheimer's disease repeat the same question or story several times, it is helpful to remind them that they are repeating themselves.", zh: "当阿尔茨海默病患者多次重复同一个问题或故事时，提醒他们正在重复是有帮助的。" },
                      { en: "Once people have Alzheimer's disease, they are no longer capable of making informed decisions about their own care.", zh: "一旦患有阿尔茨海默病，患者就不再能够对自己的护理做出知情决定。" },
                      { en: "People whose Alzheimer's disease is not yet severe can benefit from psychotherapy for depression and anxiety.", zh: "阿尔茨海默病尚不严重的患者可以从针对抑郁和焦虑的心理治疗中受益。" },
                      { en: "Poor nutrition can make the symptoms of Alzheimer's disease worse.", zh: "营养不良会使阿尔茨海默病的症状恶化。" },
                      { en: "When a person has Alzheimer's disease, using reminder notes is a crutch that can contribute to decline.", zh: "当一个人患有阿尔茨海默病时，使用提醒便条是一种可能导致衰退的依赖。" },
                      { en: "Alzheimer's disease cannot be cured.", zh: "阿尔茨海默病无法治愈。" },
                      { en: "Tremor or shaking of the hands or arms is a common symptom in people with Alzheimer's disease.", zh: "手或手臂的震颤或抖动是阿尔茨海默病患者的常见症状。" },
                      { en: "Trouble handling money or paying bills is a common early symptom of Alzheimer's disease.", zh: "处理金钱或支付账单困难是阿尔茨海默病的常见早期症状。" },
                      { en: "One symptom that can occur with Alzheimer's disease is believing that other people are stealing one's things.", zh: "阿尔茨海默病可能出现的一个症状是认为别人在偷自己的东西。" },
                      { en: "Most people with Alzheimer's disease remember recent events better than things that happened in the past.", zh: "大多数阿尔茨海默病患者对近期事件的记忆比过去发生的事情更好。" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
                        <span className="text-xs font-medium shrink-0 mt-0.5 w-6" style={{ color: 'var(--text-muted)' }}>{idx + 1}.</span>
                        <p className="flex-1 text-sm" style={{ color: 'var(--text-primary)' }}>{language === 'zh' ? item.zh : item.en}</p>
                        <div className="flex gap-3 shrink-0">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name={`q_${idx}`} value="true" className="w-4 h-4" style={{ accentColor: 'var(--color-green)' }} />
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{language === 'zh' ? '对' : 'True'}</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name={`q_${idx}`} value="false" className="w-4 h-4" style={{ accentColor: 'var(--color-green)' }} />
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{language === 'zh' ? '错' : 'False'}</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Part 2: Agreement Scale Questions (31-50) */}
                  <div className="space-y-2 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {language === 'zh' ? '请选择您对以下陈述的同意程度：' : 'Please rate how much you agree with each statement:'}
                    </p>
                    
                    {[
                      { en: "It is rewarding to work with people who have dementia.", zh: "与失智症患者一起工作是有意义的。" },
                      { en: "I am afraid of people with dementia.", zh: "我害怕失智症患者。" },
                      { en: "People with dementia can be creative.", zh: "失智症患者可以有创造力。" },
                      { en: "I feel confident around people with dementia.", zh: "我在失智症患者身边感到自信。" },
                      { en: "I am comfortable touching people with dementia.", zh: "我对触碰失智症患者感到自在。" },
                      { en: "I feel uncomfortable being around people with dementia.", zh: "我在失智症患者身边感到不自在。" },
                      { en: "Every person with dementia has different needs.", zh: "每个失智症患者都有不同的需求。" },
                      { en: "I am not very familiar with dementia.", zh: "我对失智症不太熟悉。" },
                      { en: "I would avoid an agitated person with dementia.", zh: "我会避开躁动的失智症患者。" },
                      { en: "People with dementia like having familiar things nearby.", zh: "失智症患者喜欢身边有熟悉的东西。" },
                      { en: "It is important to know the past history of people with dementia.", zh: "了解失智症患者的过往历史很重要。" },
                      { en: "It is possible to enjoy interacting with people with dementia.", zh: "与失智症患者互动是可以令人愉快的。" },
                      { en: "I feel relaxed around people with dementia.", zh: "我在失智症患者身边感到放松。" },
                      { en: "People with dementia can enjoy life.", zh: "失智症患者可以享受生活。" },
                      { en: "People with dementia can feel when others are kind to them.", zh: "失智症患者能感受到别人对他们的善意。" },
                      { en: "I feel frustrated because I do not know how to help people with dementia.", zh: "我感到沮丧，因为我不知道如何帮助失智症患者。" },
                      { en: "I cannot imagine taking care of someone with dementia.", zh: "我无法想象照顾失智症患者。" },
                      { en: "I admire the coping skills of people with dementia.", zh: "我钦佩失智症患者的应对能力。" },
                      { en: "We can do a lot now to improve the lives of people with dementia.", zh: "我们现在可以做很多事情来改善失智症患者的生活。" },
                      { en: "Difficult behaviours may be a form of communication for people with dementia.", zh: "困难行为可能是失智症患者的一种沟通方式。" },
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
                        <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                          <span className="font-medium" style={{ color: 'var(--text-muted)' }}>{idx + 31}. </span>
                          {language === 'zh' ? item.zh : item.en}
                        </p>
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-xs mr-2 w-16 text-right" style={{ color: 'var(--text-muted)' }}>{language === 'zh' ? '不同意' : 'Disagree'}</span>
                          {[1, 2, 3, 4, 5, 6, 7].map(n => (
                            <label key={n} className="cursor-pointer">
                              <input type="radio" name={`q_${idx + 30}`} value={n} className="sr-only peer" />
                              <span className="w-8 h-8 flex items-center justify-center rounded-full text-sm border-2 transition-all peer-checked:bg-green-500 peer-checked:text-white peer-checked:border-green-500 hover:border-green-300" style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}>
                                {n}
                              </span>
                            </label>
                          ))}
                          <span className="text-xs ml-2 w-16" style={{ color: 'var(--text-muted)' }}>{language === 'zh' ? '同意' : 'Agree'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                  )}
                </div>

                {/* Interview Agreement Toggle */}
                <div className="flex items-center justify-between p-6 rounded-xl border-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-3 mb-1">
                      <Info style={{ color: 'var(--color-green)', width: 'clamp(1.25rem, 3vw, 1.5rem)', height: 'clamp(1.25rem, 3vw, 1.5rem)' }} />
                      <span className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                        {language === 'zh' ? '同意参加访谈' : 'Agree to Interview'}
                      </span>
                    </div>
                    <p className="text-sm ml-9" style={{ color: 'var(--text-secondary)' }}>
                      {language === 'zh' ? '我愿意在研究结束后参加深度访谈' : 'I agree to participate in a follow-up interview after the study'}
                    </p>
                  </div>
                  <IOSToggle
                    checked={interviewAgreement}
                    onChange={async (checked) => {
                      const previous = interviewAgreement;
                      setInterviewAgreement(checked);
                      try {
                        const { error } = await supabase
                          .from('enrollment')
                          .update({ interview_agreement: checked })
                          .eq('participant_id', user.id);
                        if (error) {
                          console.error('Error updating interview agreement:', error);
                          setInterviewAgreement(previous);
                          toast.error(language === 'zh' ? '更新失败，请重试' : 'Failed to update, please try again');
                        }
                      } catch (error) {
                        console.error('Error updating interview agreement:', error);
                        setInterviewAgreement(previous);
                        toast.error(language === 'zh' ? '更新失败，请重试' : 'Failed to update, please try again');
                      }
                    }}
                  />
                </div>

                {/* Interview Scheduling Section - Only shows if interview agreement is ON */}
                {interviewAgreement && (
                  <div className="p-6 rounded-xl border-2 space-y-6" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--color-green)' }}>
                    <h4 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {language === 'zh' ? '访谈安排' : 'Interview Schedule'}
                    </h4>
                    
                    {/* Interview URL */}
                    {interviewData.interview_url && (
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                          {language === 'zh' ? '访谈链接' : 'Interview URL'}
                        </label>
                        <a 
                          href={interviewData.interview_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-base underline"
                          style={{ color: 'var(--color-green)' }}
                        >
                          {interviewData.interview_url}
                        </a>
                      </div>
                    )}
                    
                    {/* Interview Date/Time */}
                    {interviewData.interview_datetime_start && (
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                          {language === 'zh' ? '访谈时间' : 'Interview Date & Time'}
                        </label>
                        <p className="text-base" style={{ color: 'var(--text-primary)' }}>
                          {new Date(interviewData.interview_datetime_start).toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {interviewData.interview_datetime_end && (
                            <> - {new Date(interviewData.interview_datetime_end).toLocaleTimeString(language === 'zh' ? 'zh-CN' : 'en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</>
                          )}
                        </p>
                      </div>
                    )}
                    
                    {/* Accept/Not Accept Buttons or Status */}
                    {interviewData.interview_datetime_start && !interviewData.interview_accepted && (
                      <div className="flex gap-4">
                        <button
                          onClick={async () => {
                            try {
                              await supabase
                                .from('profiles')
                                .update({ 
                                  interview_accepted: true,
                                  interview_accepted_at: new Date().toISOString()
                                })
                                .eq('id', user?.id);
                              setInterviewData({
                                ...interviewData,
                                interview_accepted: true,
                                interview_accepted_at: new Date().toISOString()
                              });
                            } catch (error) {
                              console.error('Error accepting interview:', error);
                            }
                          }}
                          className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
                          style={{ backgroundColor: 'var(--color-green)' }}
                        >
                          {language === 'zh' ? '接受' : 'Accept'}
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await supabase
                                .from('profiles')
                                .update({ interview_accepted: false })
                                .eq('id', user?.id);
                              setInterviewData({
                                ...interviewData,
                                interview_accepted: false,
                                interview_accepted_at: null
                              });
                            } catch (error) {
                              console.error('Error declining interview:', error);
                            }
                          }}
                          className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-90"
                          style={{ 
                            border: '2px solid var(--border-light)',
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          {language === 'zh' ? '不接受' : 'Not Accept'}
                        </button>
                      </div>
                    )}
                    
                    {/* Accepted Status */}
                    {interviewData.interview_accepted && (
                      <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                        <p className="text-base font-medium" style={{ color: 'var(--color-green)' }}>
                          ✓ {language === 'zh' ? '已接受' : 'Accepted'}
                          {interviewData.interview_accepted_at && (
                            <span className="text-sm ml-2" style={{ color: 'var(--text-secondary)' }}>
                              ({new Date(interviewData.interview_accepted_at).toLocaleDateString()})
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                    
                    {/* No interview scheduled yet */}
                    {!interviewData.interview_datetime_start && (
                      <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>
                        {language === 'zh' ? '访谈时间尚未安排，研究人员会尽快联系您。' : 'Interview time not yet scheduled. The researcher will contact you soon.'}
                      </p>
                    )}
                  </div>
                )}

                {/* Interview Questions Section - 3 Tabs (only shows if agreement is on) */}
                {interviewAgreement && (
                  <div className="p-6 rounded-xl border-2 space-y-6" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
                    <h4 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {language === 'zh' ? '访谈内容' : 'Interview Content'}
                    </h4>
                    
                    {/* Tab Navigation */}
                    <div className="flex border-b" style={{ borderColor: 'var(--border-light)' }}>
                      <button
                        onClick={() => setInterviewTab('questions')}
                        className="flex-1 py-3 text-sm font-medium transition-colors"
                        style={{ 
                          color: interviewTab === 'questions' ? 'var(--color-green)' : 'var(--text-secondary)',
                          borderBottom: interviewTab === 'questions' ? '2px solid var(--color-green)' : '2px solid transparent',
                          marginBottom: '-1px',
                          background: 'transparent',
                          outline: 'none'
                        }}
                      >
                        {language === 'zh' ? '问题' : 'Questions'}
                      </button>
                      <button
                        onClick={() => setInterviewTab('graphs')}
                        className="flex-1 py-3 text-sm font-medium transition-colors"
                        style={{ 
                          color: interviewTab === 'graphs' ? 'var(--color-green)' : 'var(--text-secondary)',
                          borderBottom: interviewTab === 'graphs' ? '2px solid var(--color-green)' : '2px solid transparent',
                          marginBottom: '-1px',
                          background: 'transparent',
                          outline: 'none'
                        }}
                      >
                        {language === 'zh' ? '我的照护网络 & 照护周' : 'My Care Network & My Caring Week'}
                      </button>
                    </div>
                    
                    {/* Tab Content */}
                    <div className="pt-4">
                      {/* Questions Tab */}
                      {interviewTab === 'questions' && (
                        <div className="space-y-8">
                          {/* Primary Caregiver Questions */}
                          {profileForm.is_primary_caregiver && (
                            <div className="space-y-4">
                              <h5 className="text-base font-semibold" style={{ color: 'var(--color-green)' }}>
                                {language === 'zh' ? '主要照护者访谈问题 (共22题)' : 'Primary Caregiver Interview Questions (22 total)'}
                              </h5>
                              <ol className="list-decimal list-inside space-y-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                                <li>{language === 'zh' ? '您与患者是什么关系？您提供照护多长时间了？' : 'What is your relationship to the patient, and how long have you been providing care?'}</li>
                                <li>{language === 'zh' ? '患者目前的状况和主要照护需求是什么？' : 'What is the patient\'s current condition and main care needs?'}</li>
                                <li>
                                  {language === 'zh' ? '您典型的一天照护是什么样的？' : 'What does a typical day of caregiving look like for you?'}
                                  <span className="block mt-1 text-xs px-2 py-1 rounded italic" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-green)' }}>
                                    {language === 'zh' ? '"让我们一起看看您在「我的照护周」中记录的活动..."' : '"Let\'s look at your recorded activities in My Caring Week together..."'}
                                  </span>
                                </li>
                                <li>
                                  {language === 'zh' ? '您在日常照护中遇到什么困难？' : 'What difficulties do you face in your daily caregiving?'}
                                  <span className="block mt-1 text-xs px-2 py-1 rounded italic" style={{ background: 'rgba(239,68,68,0.1)', color: '#DC2626' }}>
                                    {language === 'zh' ? '"您记录了一些挑战。能具体说说吗？"' : '"You\'ve noted some challenges. Could you tell me more?"'}
                                  </span>
                                </li>
                                <li>{language === 'zh' ? '您需要他人提供什么支持来帮助照护患者？' : 'What support do you need from others to help care for the patient?'}</li>
                                <li>
                                  {language === 'zh' ? '还有谁帮助照护患者？您与这些人的关系有多亲近？每个人做什么？' : 'Who else helps care for the patient? How close are you to these people, and what does each person do?'}
                                  <span className="block mt-1 text-xs px-2 py-1 rounded italic" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-green)' }}>
                                    {language === 'zh' ? '"让我们看看您绘制的照护网络图。您能介绍一下这些人吗？"' : '"Let\'s look at the care network you\'ve mapped out. Could you walk me through who these people are?"'}
                                  </span>
                                </li>
                                <li>{language === 'zh' ? '在什么情况下您会向他人寻求支持？' : 'Under what circumstances do you ask others for support?'}</li>
                                <li>{language === 'zh' ? '您在寻求支持时遇到困难吗？有什么困难？' : 'Do you experience difficulties asking for support? What are the difficulties?'}</li>
                                <li>{language === 'zh' ? '有没有您可以请求帮助但还没有请求的人？是什么阻止了您？' : 'Is there anyone you could ask for help but haven\'t? What\'s stopping you?'}</li>
                                <li>{language === 'zh' ? '您的照护网络随时间有变化吗？' : 'Has your care network changed over time?'}</li>
                                <li>{language === 'zh' ? '您理想的照护网络会是什么样的？' : 'What would your ideal care network look like?'}</li>
                                <li>{language === 'zh' ? '看看您的网络，您对整体的满意度是多少（0-100分）？' : 'Looking at your network, how satisfied are you overall, from 0 to 100?'}</li>
                                <li>{language === 'zh' ? '当其他人帮助照护患者时，他们会问什么信息？您认为他们需要知道什么？' : 'When someone else helps care for the patient, what information do they ask for? What do you think they need to know?'}</li>
                                <li>
                                  {language === 'zh' ? '您如何与其他照护者沟通？使用什么方法或技术？' : 'How do you communicate with other caregivers? What methods or technology do you use?'}
                                  <span className="block mt-1 text-xs px-2 py-1 rounded italic" style={{ background: 'rgba(107,114,128,0.1)', color: '#4B5563' }}>
                                    {language === 'zh' ? '"您提到使用了一些工具。这些沟通方式效果如何？"' : '"You mentioned using certain tools. How well do these communication methods work for you?"'}
                                  </span>
                                </li>
                                <li>{language === 'zh' ? '您在与他人分享患者信息时是否遇到障碍？' : 'Are there barriers you face when sharing information about the patient with others?'}</li>
                                <li>{language === 'zh' ? '当患者状况变化时，您如何让其他人知道？是否有障碍？' : 'When the patient\'s condition changes, how do you keep others informed? Are there barriers?'}</li>
                                <li>{language === 'zh' ? '患者是否曾经走失、难以找到或拒绝回家？发生这种情况时您会向其他照护者求助吗？您如何协调，遇到什么障碍？' : 'Has the patient ever wandered, been difficult to find, or refused to return home? Do you ask other caregivers for help when this happens? How do you coordinate, and what barriers do you face?'}</li>
                                <li>{language === 'zh' ? '您对使用智能手机或电脑的熟悉程度如何？' : 'How familiar are you with using a smartphone or computer?'}</li>
                                <li>{language === 'zh' ? '您目前使用什么工具来了解更多关于失智症和照护的知识？当您面临不确定的情况时，您从哪里寻求信息或支持？您对目前使用的工具有什么障碍或顾虑？您希望有什么工具能更好地帮助您了解失智症和照护知识？什么功能会有帮助？' : 'What current tools do you use to learn more about dementia and caregiving? When you face uncertain situations, where do you seek information or support? What barriers or concerns do you have with the current tools you use? What tools do you wish existed to better help with learning about dementia and caregiving? What features would be helpful?'}</li>
                                <li>{language === 'zh' ? '您目前使用什么工具与其他照护者沟通或协调？什么有效，什么无效？您对目前使用的工具有什么障碍或顾虑？您希望有什么工具来帮助协调？什么功能会有帮助？' : 'What current tools do you use to communicate or coordinate with other caregivers? What has worked well, what has not? What barriers or concerns do you have with the current tools you use? What tools do you wish existed to help coordinate? What features would be helpful?'}</li>
                                <li>{language === 'zh' ? '如果您可以设计一个理想的数字服务来帮助照护工作，您希望它具备哪些功能？您会觉得哪些功能有用？您对使用数字工具有什么顾虑？' : 'If you could design an ideal digital service to help with caregiving, what features would you want it to have? What features would you find useful? What concerns do you have about using digital tools?'}</li>
                                <li>{language === 'zh' ? '关于您的经历，还有什么想分享的吗？' : 'Is there anything else you\'d like to share about your experience?'}</li>
                              </ol>
                            </div>
                          )}
                          
                          {/* Other Caregiver/Network Member Questions */}
                          {!profileForm.is_primary_caregiver && (
                            <div className="space-y-4">
                              <h5 className="text-base font-semibold" style={{ color: 'var(--color-green)' }}>
                                {language === 'zh' ? '网络成员访谈问题 (共16题)' : 'Network Member Interview Questions (16 total)'}
                              </h5>
                              <ol className="list-decimal list-inside space-y-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                                <li>{language === 'zh' ? '您与患者和主要照护者是什么关系？' : 'What is your relationship to the patient and the primary caregiver?'}</li>
                                <li>{language === 'zh' ? '您是如何开始参与照护的？' : 'How did you become involved in providing care?'}</li>
                                <li>
                                  {language === 'zh' ? '您提供什么样的支持？多久一次？' : 'What kind of support do you provide? How often?'}
                                  <span className="block mt-1 text-xs px-2 py-1 rounded italic" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-green)' }}>
                                    {language === 'zh' ? '"让我们看看您记录的活动..."' : '"Let\'s look at the activities you\'ve logged..."'}
                                  </span>
                                </li>
                                <li>{language === 'zh' ? '您提供的支持是否被接受、被需要、被感激？' : 'Is the support you provide accepted, needed, and appreciated?'}</li>
                                <li>{language === 'zh' ? '在您能够帮助之前，您需要了解患者的哪些信息？这些信息是如何传达给您的？当前的沟通方式是否存在障碍？' : 'What information do you need to know about the patient before you can help? How is this information communicated to you? Are there any barriers in how you currently receive this information?'}</li>
                                <li>
                                  {language === 'zh' ? '您在提供支持时遇到困难吗？是什么让它变得困难？' : 'Do you experience difficulties when providing support? What makes it difficult?'}
                                  <span className="block mt-1 text-xs px-2 py-1 rounded italic" style={{ background: 'rgba(239,68,68,0.1)', color: '#DC2626' }}>
                                    {language === 'zh' ? '"您记录了一些挑战。能具体说说吗？"' : '"You\'ve noted some challenges. Could you tell me more?"'}
                                  </span>
                                </li>
                                <li>{language === 'zh' ? '有没有您想帮忙但无法帮忙的时候？如果有，是什么阻止了您？' : 'Are there times you wanted to help but couldn\'t? If so, what stopped you?'}</li>
                                <li>{language === 'zh' ? '在照护患者期间，您如何与主要照护者和其他照护者沟通？当患者状况变化时，您是如何得知的？是否存在障碍？' : 'How do you communicate with the primary caregiver and other caregivers during caring for the patient? When the patient\'s condition changes, how do you find out? Are there barriers?'}</li>
                                <li>{language === 'zh' ? '您想提供更多还是更少的支持？如果您想提供更多，是什么阻止了您？' : 'Would you like to provide more or less support? If you would like to provide more, what is preventing you from doing so?'}</li>
                                <li>{language === 'zh' ? '患者是否曾经走失、难以找到或拒绝回家？您是否曾在这种情况下帮忙？您是如何帮助的？是否遇到了障碍？' : 'Has the patient ever wandered, been difficult to find, or refused to return home? Have you ever helped in such a situation? How did you help? Were there any barriers?'}</li>
                                <li>{language === 'zh' ? '什么能帮助您为患者和主要照护者提供更好的支持？' : 'What would help you provide better support to the patient and the primary caregiver?'}</li>
                                <li>{language === 'zh' ? '您对使用智能手机或电脑的熟悉程度如何？' : 'How familiar are you with using a smartphone or computer?'}</li>
                                <li>{language === 'zh' ? '您目前使用什么工具来了解更多关于失智症和照护的知识？当您面临不确定的情况时，您从哪里寻求信息或支持？您对目前使用的工具有什么障碍或顾虑？您希望有什么工具能更好地帮助您了解失智症和照护知识？什么功能会有帮助？' : 'What current tools do you use to learn more about dementia and caregiving? When you face uncertain situations, where do you seek information or support? What barriers or concerns do you have with the current tools you use? What tools do you wish existed to better help with learning about dementia and caregiving? What features would be helpful?'}</li>
                                <li>{language === 'zh' ? '您目前使用什么工具与其他照护者沟通或协调？什么有效，什么无效？您对目前使用的工具有什么障碍或顾虑？您希望有什么工具来帮助协调？什么功能会有帮助？' : 'What current tools do you use to communicate or coordinate with other caregivers? What has worked well, what has not? What barriers or concerns do you have with the current tools you use? What tools do you wish existed to help coordinate? What features would be helpful?'}</li>
                                <li>{language === 'zh' ? '如果您可以设计一个理想的数字服务来帮助照护工作，您希望它具备哪些功能？您会觉得哪些功能有用？您对使用数字工具有什么顾虑？' : 'If you could design an ideal digital service to help with caregiving, what features would you want it to have? What features would you find useful? What concerns do you have about using digital tools?'}</li>
                                <li>{language === 'zh' ? '关于您的经历，还有什么想分享的吗？' : 'Is there anything else you\'d like to share about your experience?'}</li>
                              </ol>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* My Care Network & My Caring Week Tab - 2 Column Layout */}
                      {interviewTab === 'graphs' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Left: My Care Network - Ecogram */}
                          <div className="border rounded-xl p-3" style={{ borderColor: 'var(--border-light)', background: 'white' }}>
                            <Ecogram 
                              userId={user?.id} 
                              language={language}
                              initialData={profile?.ecogram_data}
                              primaryCaregiverCode={
                                profileForm.is_primary_caregiver 
                                  ? profile?.participant_number 
                                  : profile?.linked_primary_caregiver_code
                              }
                              isPrimaryCaregiver={profileForm.is_primary_caregiver}
                            />
                          </div>
                          
                          {/* Right: My Caring Week */}
                          <div className="border rounded-xl p-3" style={{ borderColor: 'var(--border-light)', background: 'white' }}>
                            <MyCaringWeek 
                              language={language}
                              networkMembers={profile?.ecogram_data?.members?.map((m: any) => ({ id: m.id, name: m.name })) || []}
                            />
                          </div>
                        </div>
                      )}
                      
                    </div>
                  </div>
                )}


                {/* Save/Cancel Buttons */}
                {isEditingProfile && (
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 min-h-[48px]"
                      style={{ backgroundColor: 'var(--color-green)' }}
                    >
                      <Save style={{ width: 'clamp(1.25rem, 3vw, 1.5rem)', height: 'clamp(1.25rem, 3vw, 1.5rem)' }} />
                      {isSaving ? 'Saving...' : settingsT.settings.saveProfile}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingProfile(false);
                        setProfileForm({
                          full_name: profile?.full_name || '',
                          introduction: profile?.introduction || '',
                          relationship_to_patient: profile?.relationship_to_patient || '',
                          is_primary_caregiver: profile?.is_primary_caregiver || false,
                          participant_number: profile?.participant_number || '',
                          caregiver_age: profile?.caregiver_age || '',
                          caregiver_gender: profile?.caregiver_gender || '',
                          caregiver_education: profile?.caregiver_education || '',
                          employment_status: profile?.employment_status || '',
                          marital_status: profile?.marital_status || '',
                          health_status: profile?.health_status || '',
                          caregiving_years: profile?.caregiving_years || '',
                          caregiving_hours_per_week: profile?.caregiving_hours_per_week || '',
                          living_with_recipient: profile?.living_with_recipient || '',
                          recipient_age: profile?.recipient_age || '',
                          recipient_gender: profile?.recipient_gender || '',
                          dementia_type: profile?.dementia_type || '',
                          years_since_diagnosis: profile?.years_since_diagnosis || '',
                          dementia_stage: profile?.dementia_stage || '',
                          recipient_education: profile?.recipient_education || '',
                          recipient_adl_eating: profile?.recipient_adl_eating || '',
                          recipient_adl_bathing: profile?.recipient_adl_bathing || '',
                          recipient_adl_dressing: profile?.recipient_adl_dressing || '',
                          recipient_adl_toileting: profile?.recipient_adl_toileting || '',
                          recipient_adl_mobility: profile?.recipient_adl_mobility || '',
                          recipient_iadl_medication: profile?.recipient_iadl_medication || '',
                          recipient_iadl_finances: profile?.recipient_iadl_finances || '',
                          recipient_iadl_shopping: profile?.recipient_iadl_shopping || '',
                          recipient_iadl_cooking: profile?.recipient_iadl_cooking || '',
                          recipient_iadl_housework: profile?.recipient_iadl_housework || '',
                          recipient_bpsd_agitation: profile?.recipient_bpsd_agitation || '',
                          recipient_bpsd_wandering: profile?.recipient_bpsd_wandering || '',
                          recipient_bpsd_sleep: profile?.recipient_bpsd_sleep || '',
                          recipient_bpsd_aggression: profile?.recipient_bpsd_aggression || '',
                          recipient_bpsd_depression: profile?.recipient_bpsd_depression || '',
                          recipient_bpsd_anxiety: profile?.recipient_bpsd_anxiety || '',
                          recipient_bpsd_hallucinations: profile?.recipient_bpsd_hallucinations || '',
                          recipient_communication: profile?.recipient_communication || '',
                          perseverance_time: profile?.perseverance_time || '',
                          recipient_comorbidities: profile?.recipient_comorbidities || '',
                          relationship_to_primary: profile?.relationship_to_primary || '',
                          distance_from_recipient: profile?.distance_from_recipient || '',
                          contact_frequency: profile?.contact_frequency || '',
                          linked_primary_caregiver_id: profile?.linked_primary_caregiver_id || null,
                          linked_primary_caregiver_code: profile?.linked_primary_caregiver_code || null,
                          sscq_strained_interactions: profile?.sscq_strained_interactions || '',
                          sscq_privacy: profile?.sscq_privacy || '',
                          sscq_useful: profile?.sscq_useful || '',
                          sscq_social_life: profile?.sscq_social_life || '',
                          sscq_manipulation: profile?.sscq_manipulation || '',
                          sscq_solutions: profile?.sscq_solutions || '',
                          sscq_health: profile?.sscq_health || ''
                        });
                      }}
                      disabled={isSaving}
                      className="px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-90 disabled:opacity-50 min-h-[48px]"
                      style={{ 
                        border: '2px solid var(--border-light)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {settingsT.settings.cancel}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm mt-8" style={{ border: '1px solid var(--border-light)' }}>
              <h3 className="text-2xl md:text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
                {settingsT.settings.notificationSettings}
              </h3>
              
              {/* Browser Notification Permission Status */}
              {typeof window !== 'undefined' && 'Notification' in window && (
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Bell style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
                        {settingsT.settings.notificationPermission}
                      </h4>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {settingsT.settings.browserNotifications} {
                          Notification.permission === 'granted' ? settingsT.settings.granted :
                          Notification.permission === 'denied' ? settingsT.settings.denied : settingsT.settings.default
                        }
                      </p>
                    </div>
                    {Notification.permission !== 'granted' && (
                      <button
                        onClick={requestNotificationPermission}
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all hover:opacity-90"
                        style={{ backgroundColor: 'var(--color-green)' }}
                      >
                        {settingsT.settings.requestPermission}
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Hourly Reminders Section */}
                <div className="border-2 rounded-2xl p-6" style={{ borderColor: 'var(--color-green)', backgroundColor: 'var(--bg-primary)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg md:text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                        {settingsT.settings.hourlyReminders}
                      </h4>
                      <p className="text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
                        {settingsT.settings.hourlyRemindersDesc}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <IOSToggle
                        checked={hourlyReminders}
                        onChange={handleHourlyRemindersToggle}
                      />
                    </div>
                  </div>

                  {/* Do Not Disturb Periods */}
                  {hourlyReminders && (
                    <div className="mt-6 pt-6 border-t-2" style={{ borderColor: 'var(--border-light)' }}>
                      <div className="mb-6">
                        <h5 className="text-base md:text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                          {settingsT.settings.dndPeriod}
                        </h5>
                        <p className="text-sm md:text-base mb-4" style={{ color: 'var(--text-secondary)' }}>
                          {settingsT.settings.dndPeriodDesc}
                        </p>

                        {/* Existing DND Periods List */}
                        {dndPeriods.length > 0 && (
                          <div className="space-y-3 mb-6">
                            {dndPeriods.map((period) => (
                              <div key={period.id} className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                <IOSToggle
                                  checked={period.is_active}
                                  onChange={() => handleToggleDNDPeriod(period.id!, period.is_active)}
                                />
                                <div className="flex-1">
                                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                    {period.label || `${language === 'zh' ? '勿扰时段' : 'DND Period'}`}
                                  </div>
                                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    {period.start_time.substring(0, 5)} - {period.end_time.substring(0, 5)}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteDNDPeriod(period.id!)}
                                  className="px-3 py-2 text-sm rounded-lg hover:opacity-70 transition-all"
                                  style={{ color: 'var(--color-red)', backgroundColor: 'var(--bg-primary)' }}
                                >
                                  {language === 'zh' ? '删除' : 'Delete'}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add New DND Period Form */}
                        <div className="p-5 rounded-xl border-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
                          <h6 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                            {language === 'zh' ? '添加新的勿扰时段' : 'Add New DND Period'}
                          </h6>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                {language === 'zh' ? '标签（可选）' : 'Label (Optional)'}
                              </label>
                              <input
                                type="text"
                                value={newDndPeriod.label}
                                onChange={(e) => setNewDndPeriod({ ...newDndPeriod, label: e.target.value })}
                                placeholder={language === 'zh' ? '例如：睡眠、工作、会议' : 'e.g., Sleep, Work, Meeting'}
                                className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none"
                                style={{
                                  borderColor: 'var(--border-light)',
                                  backgroundColor: 'var(--bg-primary)',
                                  color: 'var(--text-primary)'
                                }}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                  {settingsT.settings.dndStart}
                                </label>
                                <input
                                  type="time"
                                  value={newDndPeriod.start_time}
                                  onChange={(e) => setNewDndPeriod({ ...newDndPeriod, start_time: e.target.value })}
                                  className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none"
                                  style={{
                                    borderColor: 'var(--border-light)',
                                    backgroundColor: 'var(--bg-primary)',
                                    color: 'var(--text-primary)'
                                  }}
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                                  {settingsT.settings.dndEnd}
                                </label>
                                <input
                                  type="time"
                                  value={newDndPeriod.end_time}
                                  onChange={(e) => setNewDndPeriod({ ...newDndPeriod, end_time: e.target.value })}
                                  className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none"
                                  style={{
                                    borderColor: 'var(--border-light)',
                                    backgroundColor: 'var(--bg-primary)',
                                    color: 'var(--text-primary)'
                                  }}
                                />
                              </div>
                            </div>

                            <button
                              onClick={handleAddDNDPeriod}
                              className="w-full px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 min-h-[48px]"
                              style={{ backgroundColor: 'var(--color-green)' }}
                            >
                              {language === 'zh' ? '添加时段' : 'Add Period'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Test Notification Button */}
                      <button
                        onClick={handleTestNotification}
                        disabled={testingNotification || Notification.permission !== 'granted'}
                        className="w-full px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 min-h-[48px]"
                        style={{ backgroundColor: 'var(--color-green)' }}
                      >
                        {testingNotification ? settingsT.settings.testingNotification : settingsT.settings.testNotification}
                      </button>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px my-4" style={{ backgroundColor: 'var(--border-light)' }}></div>

                <div className="p-6 rounded-xl border-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg md:text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                        {settingsT.settings.dailyReminders}
                      </h4>
                      <p className="text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
                        {settingsT.settings.dailyRemindersDesc}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <IOSToggle
                        checked={notifications.dailyReminders}
                        onChange={() => handleNotificationToggle('dailyReminders')}
                      />
                    </div>
                  </div>
                  {notifications.dailyReminders && (
                    <div className="mt-5 pt-5 border-t" style={{ borderColor: 'var(--border-light)' }}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base md:text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                            {settingsT.settings.dailyReminderTime}
                          </h4>
                          <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
                            {settingsT.settings.dailyReminderTimeDesc}
                          </p>
                        </div>
                        <input
                          type="time"
                          value={dailyReminderTime}
                          onChange={(e) => handleDailyReminderTimeChange(e.target.value)}
                          className="px-4 py-3 rounded-xl border-2 transition-all focus:outline-none min-w-[130px] text-center font-semibold text-lg"
                          style={{
                            borderColor: 'var(--color-green)',
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between p-6 rounded-xl gap-4 border-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg md:text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                      {settingsT.settings.researchUpdates}
                    </h4>
                    <p className="text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
                      {settingsT.settings.researchUpdatesDesc}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <IOSToggle
                      checked={notifications.researchUpdates}
                      onChange={() => handleNotificationToggle('researchUpdates')}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-6 rounded-xl gap-4 border-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg md:text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                      {settingsT.settings.pushNotifications}
                    </h4>
                    <p className="text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
                      {settingsT.settings.pushNotificationsDesc}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <IOSToggle
                      checked={notifications.pushNotifications}
                      onChange={() => handleNotificationToggle('pushNotifications')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-2xl p-4 md:p-6 border mt-8" style={{ borderColor: 'var(--border-light)' }}>
              <h3 className="text-2xl md:text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
                {settingsT.settings.accountSettings}
              </h3>
              <div className="space-y-6">
                <div className="p-6 rounded-xl border-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
                  <div className="flex items-center gap-4">
                    <User style={{ color: 'var(--color-green)', width: 'clamp(2rem, 5vw, 2.5rem)', height: 'clamp(2rem, 5vw, 2.5rem)' }} />
                    <div>
                      <h4 className="text-lg md:text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                        {settingsT.settings.emailAddress}
                      </h4>
                      <p className="text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
                        {user?.email || 'Not logged in'}
                      </p>
                    </div>
                  </div>
                  <button
                    className="px-6 py-3 text-base md:text-lg font-bold rounded-xl transition-all duration-200 min-h-[48px] ml-4"
                    style={{ 
                      border: '2px solid var(--border-light)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {settingsT.settings.change}
                  </button>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default SettingsPage;
