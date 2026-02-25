import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useStateManagement';
import { Save, X, BarChart3, Users, MessageCircle, Package, Mic, Sparkles, Loader2, Copy, CheckCircle, Clock, Plus, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import IOSDropdown from '../components/ui/IOSDropdown';
import { AISurveyAssistant } from '../components/AISurveyAssistant';
import { useLanguage } from '../hooks/useLanguage';

interface NetworkMember {
  id: string;
  name: string;
  relationship: string;
  color: string;
}

const AddEntry: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'activity' | 'people' | 'challengesResources'>('activity');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Network members from ecogram
  const [networkMembers, setNetworkMembers] = useState<NetworkMember[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  
  // AI feature states
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiFieldContext, setAiFieldContext] = useState<{ field: string; question: string; answer: string }>({ field: '', question: '', answer: '' });
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [lastAiResponse, setLastAiResponse] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  
  // Time selector states
  const [timeOption, setTimeOption] = useState<'now' | 'other' | 'ideas'>('now');
  const [customTime, setCustomTime] = useState('');
  const [customDate, setCustomDate] = useState('');
  
  // Fetch network members from user's ecogram
  useEffect(() => {
    const fetchNetworkMembers = async () => {
      if (!user?.id) return;
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('ecogram_data')
          .eq('user_id', user.id)
          .single();
        
        if (data?.ecogram_data?.members) {
          setNetworkMembers(data.ecogram_data.members.map((m: any) => ({
            id: m.id,
            name: m.name,
            relationship: m.relationship,
            color: m.color || '#10B981'
          })));
        }
      } catch (error) {
        console.error('Error fetching network members:', error);
      }
    };
    fetchNetworkMembers();
  }, [user?.id]);
  
  // Add/remove person from selection
  const togglePerson = (name: string) => {
    setSelectedPeople(prev => {
      const newSelection = prev.includes(name) 
        ? prev.filter(p => p !== name)
        : [...prev, name];
      // Update the people_with field with selected names
      setFormData(f => ({ ...f, people_with: newSelection.join(', ') }));
      return newSelection;
    });
  };
  
  const [formData, setFormData] = useState({
    entry_type: 'care_activity' as 'care_activity' | 'care_need' | 'struggle',
    activity_categories: [] as string[],
    activity_other: '',
    description: '',
    time_spent: 0,
    emotional_impact: '',
    your_mood: '',
    urgency_level: '',
    people_with: '',
    people_want_with: '',
    people_challenges: '',
    challenges_faced: '',
    challenge_types: [] as string[],
    task_difficulty: 3,
    resources_using: '',
    resources_wanted: '',
    // Daily Sense of Competence (3 ESM items from SSCQ)
    daily_soc_stressed: '',
    daily_soc_privacy: '',
    daily_soc_strained: ''
  });
  
  // Dynamic helper text based on entry type
  const getDescriptionHelper = () => {
    const helpers = language === 'zh' ? {
      care_activity: '详细描述您在这段时间内进行的护理活动。例如：协助洗澡、准备餐食、陪伴散步、管理药物等。您可以描述涉及的人员、遇到的挑战、使用的资源或工具。',
      care_need: '描述您识别到的护理需求。这可能是患者需要但尚未满足的需求，或者您觉得需要额外支持的方面。请说明需求的性质和紧迫程度。',
      struggle: '分享您在护理过程中遇到的困难或挑战。这可能包括情感压力、身体疲劳、时间管理问题、与他人的冲突，或任何让您感到困难的情况。'
    } : {
      care_activity: 'Describe in detail the care activity you performed during this time. For example: assisting with bathing, preparing meals, accompanying on walks, managing medications, etc. You can describe the people involved, challenges encountered, and resources or tools used.',
      care_need: 'Describe a care need you have identified. This could be a need of the patient that is not yet met, or an aspect where you feel you need additional support. Please specify the nature and urgency of the need.',
      struggle: 'Share a difficulty or challenge you encountered in caregiving. This might include emotional stress, physical fatigue, time management issues, conflicts with others, or any situation that you found challenging.'
    };
    return helpers[formData.entry_type] || helpers.care_activity;
  };
  
  const text = language === 'zh' ? {
    title: '添加新记录',
    activity: '活动',
    people: '人员',
    challengesResources: '挑战与资源',
    entryType: '记录类型',
    entryTypeHelper: '选择最能描述此记录的类型',
    careActivity: '护理活动',
    careNeed: '护理需求',
    struggle: '困难',
    activityCategory: '活动类型',
    activityCategoryHelper: '选择最能描述此活动的类型',
    description: '描述',
    timeSpent: '花费时间（分钟）',
    timeSpentHelper: '估算您在这项活动上花费的时间（以分钟为单位）',
    emotionalImpact: '情绪影响',
    emotionalImpactHelper: '这次经历对您的情绪有何影响？选择最贴近您感受的选项',
    yourMood: '您的心情',
    yourMoodHelper: '目前您的整体心情如何？',
    urgencyLevel: '紧急程度',
    urgencyLevelHelper: '这个情况有多紧急？是否需要立即关注？',
    peopleWith: '参与人员',
    peopleWithHelper: '描述此活动中涉及的人员：例如家人（配偶、子女）、医护人员（医生、护士、护工）、朋友、邻居等。他们提供了什么帮助？',
    peopleWithTip: '如果您不想单独填写每个问题，可以在此处描述所有与人员相关的内容。',
    peopleWant: '还希望谁能帮忙',
    peopleWantHelper: '描述您希望能参与帮助但还没有参与的人。例如：其他家人、邻居、朋友、专业护理人员、志愿者、社工等。',
    peopleChallenges: '联系您希望帮忙的人时遇到的挑战',
    peopleChallengesHelper: '描述您在联系或寻求上述人帮助时遇到的困难。例如：不好意思开口、不知道如何解释护理需求、担心他们不懂如何照顾患者、时间安排困难、联系不上他们等。',
    challenges: '遇到的挑战',
    challengesHelper: '描述您遇到的困难。例如：不知如何应对症状、不了解患者的具体病情、不清楚患者近期的病情变化或进展、时间不够、情感压力、协调问题等。',
    taskDifficulty: '执行此任务时遇到的挑战',
    taskDifficultyHelper: '您在执行此任务时遇到了多少挑战？',
    challengesTip: '如果您不想单独填写每个标签页，可以在此处描述所有挑战和资源需求。',
    challengeTypes: [
      { value: 'knowledge_symptoms', label: '不知如何应对痴呆症状' },
      { value: 'patient_condition', label: '不了解患者具体病情' },
      { value: 'condition_updates', label: '缺乏患者病情或疾病进展的近期更新' },
      { value: 'coordination', label: '协调困难' },
      { value: 'time_constraints', label: '时间不足' },
      { value: 'emotional_stress', label: '情绪压力' },
      { value: 'physical_demands', label: '体力要求高' },
      { value: 'communication', label: '沟通困难' },
      { value: 'liability_safety', label: '安全/责任顾虑' },
      { value: 'privacy', label: '隐私顾虑' },
      { value: 'other', label: '其他' }
    ],
    resourcesUsing: '正在使用的资源及使用中的挑战',
    resourcesUsingHelper: '描述您目前使用的工具或资源，以及使用过程中遇到的挑战。例如：护理APP（界面复杂、数据输入繁琐）、提醒工具、信息网站、支持群组、家人帮助等。',
    resourcesWanted: '希望拥有或改进的资源（用于此护理活动）',
    resourcesWantedHelper: '描述您希望存在的新工具，或现有工具的改进版本。例如：更好的护理协调APP、寻找帮手的平台、患者信息共享工具、获取专业建议的渠道等。',
    save: '保存',
    cancel: '取消',
    whenDidItHappen: '发生时间',
    now: '现在',
    otherTime: '其他时间',
    ideasTime: '不限具体时间',
    otherTimeHelper: '您可以回顾研究期间发生的活动。',
    ideasTimeHelper: '记录不限具体时间或不针对特定时间的挑战/需求，或对工具/资源/服务的想法。',
    selectDate: '选择日期',
    selectTime: '选择时间',
    voiceInput: '语音输入',
    aiAssist: 'AI支持'
  } : {
    title: 'Add New Entry',
    activity: 'Activity',
    people: 'People',
    challengesResources: 'Challenges & Resources',
    entryType: 'Entry Type',
    entryTypeHelper: 'Choose the type that best describes this entry',
    careActivity: 'Care Activity',
    careNeed: 'Care Need',
    struggle: 'Struggle',
    activityCategory: 'Activity Category',
    activityCategoryHelper: 'Select the category that best describes this activity',
    description: 'Description',
    timeSpent: 'Time Spent (minutes)',
    timeSpentHelper: 'Estimate how much time you spent on this activity (in minutes)',
    emotionalImpact: 'Emotional Impact',
    emotionalImpactHelper: 'How did this experience affect you emotionally? Choose the option that best matches your feelings',
    yourMood: 'Your Mood',
    yourMoodHelper: 'How are you feeling overall right now?',
    urgencyLevel: 'Urgency Level',
    urgencyLevelHelper: 'How urgent is this situation? Does it need immediate attention?',
    peopleWith: 'People Involved',
    peopleWithHelper: 'Describe who was involved in this activity: e.g. family (spouse, children), healthcare workers (doctor, nurse, aide), friends, neighbors. What help did they provide?',
    peopleWithTip: 'If you prefer not to fill each question separately, you can describe all people-related content here.',
    peopleWant: 'Who Else Do You Wish Could Help',
    peopleWantHelper: 'Describe people you wish could be involved but are not currently helping. E.g. other family members, neighbors, friends, professional caregivers, volunteers, social workers.',
    peopleChallenges: 'Challenges in Reaching People You Wish Could Help',
    peopleChallengesHelper: 'Describe the challenges you faced in contacting or getting help from the people above. E.g. felt awkward asking, didn\'t know how to explain care needs, worried they wouldn\'t know how to care for the patient, scheduling conflicts, couldn\'t reach them.',
    challenges: 'Challenges Faced',
    challengesHelper: 'Describe the difficulties you encountered. E.g. not knowing how to handle symptoms, not understanding the patient\'s specific condition, not being updated on the patient\'s recent progression or changes, time constraints, emotional stress, coordination problems.',
    taskDifficulty: 'Challenges in Undertaking This Task',
    taskDifficultyHelper: 'How much challenge did you encounter while performing this task?',
    challengesTip: 'If you prefer not to fill each tab separately, you can describe all challenges and resource needs here.',
    challengeTypes: [
      { value: 'knowledge_symptoms', label: 'Don\'t know how to handle dementia symptoms' },
      { value: 'patient_condition', label: 'Don\'t understand patient\'s condition' },
      { value: 'condition_updates', label: 'Lack of recent updates on patient\'s condition/progression' },
      { value: 'coordination', label: 'Coordination difficulties' },
      { value: 'time_constraints', label: 'Time constraints' },
      { value: 'emotional_stress', label: 'Emotional stress' },
      { value: 'physical_demands', label: 'Physical demands' },
      { value: 'communication', label: 'Communication barriers' },
      { value: 'liability_safety', label: 'Safety/liability concerns' },
      { value: 'privacy', label: 'Privacy concerns' },
      { value: 'other', label: 'Other' }
    ],
    resourcesUsing: 'Resources Currently Using & Challenges in Using Them',
    resourcesUsingHelper: 'Describe tools or resources you currently use and any challenges in using them. E.g. care apps (complex interface, burden of data input), reminder tools, information websites, support groups, family help.',
    resourcesWanted: 'Resources You Wish Existed or Improved to Help With This Task',
    resourcesWantedHelper: 'Describe new tools you wish existed, or improvements to current tools that could better help with this task. E.g. better care coordination apps, platforms to find helpers, patient info sharing tools, channels for professional advice.',
    save: 'Save',
    cancel: 'Cancel',
    whenDidItHappen: 'When did it happen?',
    now: 'Now',
    otherTime: 'Other Time',
    ideasTime: 'Not Tied to Specific Time',
    otherTimeHelper: 'You can recall an activity that happened during the study.',
    ideasTimeHelper: 'Record a challenge/need that is not tied to a specific time or not unique to a specific time, or an idea for a tool/resource/service.',
    selectDate: 'Select Date',
    selectTime: 'Select Time',
    voiceInput: 'Voice Input',
    aiAssist: 'AI Support'
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
  const handleVoiceInput = (field: 'description' | 'people_with' | 'people_want_with' | 'people_challenges' | 'challenges_faced' | 'resources_using' | 'resources_wanted') => {
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
      setFormData({ ...formData, [targetField]: formData[targetField as keyof typeof formData] + ' ' + transcript });
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

  // Handle AI copy answer to form field
  const handleCopyAnswer = (answer: string) => {
    if (aiFieldContext.field) {
      setFormData({ ...formData, [aiFieldContext.field]: answer });
    }
  };

  // Handle AI response tracking
  const handleAiResponse = (response: string) => {
    setLastAiResponse(response);
  };

  // Copy improved answer to clipboard
  const handleCopyImprovedAnswer = async () => {
    if (lastAiResponse) {
      try {
        await navigator.clipboard.writeText(lastAiResponse);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const handleSubmit = async () => {
    if (!user || !formData.description) return;
    
    setIsSubmitting(true);
    try {
      // Determine timestamp based on user selection
      let timestamp: string | null;
      if (timeOption === 'now') {
        timestamp = new Date().toISOString();
      } else if (timeOption === 'other') {
        // Combine custom date and time
        if (customDate && customTime) {
          timestamp = new Date(`${customDate}T${customTime}`).toISOString();
        } else {
          timestamp = new Date().toISOString();
        }
      } else {
        // Ideas - not tied to specific time, use null or current as marker
        timestamp = null;
      }
      
      const { error } = await supabase
        .from('survey_entries')
        .insert([{
          user_id: user.id,
          entry_timestamp: timestamp,
          ...formData
        }]);

      if (error) throw error;
      navigate('/timeline');
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto px-6 py-4 pb-20 md:pb-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {text.title}
          </h1>
          <button
            onClick={() => navigate('/timeline')}
            className="p-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X style={{ color: 'var(--text-secondary)', width: 'clamp(1.5rem, 4vw, 2rem)', height: 'clamp(1.5rem, 4vw, 2rem)' }} />
          </button>
        </div>

        {/* Subtle Divider */}
        <div className="h-px mb-4" style={{ backgroundColor: 'var(--border-light)' }}></div>

        {/* Time Selector */}
        <div className="mb-4 p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5" style={{ color: 'var(--color-green)' }} />
            <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {text.whenDidItHappen}
            </label>
          </div>
          
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setTimeOption('now')}
              className="flex-1 px-3 py-2.5 rounded-lg font-medium text-xs transition-all"
              style={{
                backgroundColor: timeOption === 'now' ? 'var(--color-green)' : 'white',
                color: timeOption === 'now' ? 'white' : 'var(--text-secondary)',
                border: `1px solid ${timeOption === 'now' ? 'var(--color-green)' : 'var(--border-light)'}`
              }}
            >
              {text.now}
            </button>
            <button
              onClick={() => setTimeOption('other')}
              className="flex-1 px-3 py-2.5 rounded-lg font-medium text-xs transition-all"
              style={{
                backgroundColor: timeOption === 'other' ? 'var(--color-green)' : 'white',
                color: timeOption === 'other' ? 'white' : 'var(--text-secondary)',
                border: `1px solid ${timeOption === 'other' ? 'var(--color-green)' : 'var(--border-light)'}`
              }}
            >
              {text.otherTime}
            </button>
            <button
              onClick={() => setTimeOption('ideas')}
              className="flex-1 px-3 py-2.5 rounded-lg font-medium text-xs transition-all"
              style={{
                backgroundColor: timeOption === 'ideas' ? 'var(--color-green)' : 'white',
                color: timeOption === 'ideas' ? 'white' : 'var(--text-secondary)',
                border: `1px solid ${timeOption === 'ideas' ? 'var(--color-green)' : 'var(--border-light)'}`
              }}
            >
              {text.ideasTime}
            </button>
          </div>
          
          {/* Helper text for selected time option */}
          {timeOption === 'other' && (
            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
              {text.otherTimeHelper}
            </p>
          )}
          {timeOption === 'ideas' && (
            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
              {text.ideasTimeHelper}
            </p>
          )}
          
          {timeOption === 'other' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {text.selectDate}
                </label>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{
                    borderColor: 'var(--border-light)',
                    backgroundColor: 'white'
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {text.selectTime}
                </label>
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{
                    borderColor: 'var(--border-light)',
                    backgroundColor: 'white'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('activity')}
              className="flex-1 px-4 py-3 font-medium text-sm transition-all relative"
              style={{ 
                color: activeTab === 'activity' ? 'var(--color-green)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'activity' ? '2px solid var(--color-green)' : '2px solid transparent'
              }}
            >
              <BarChart3 className="inline mr-2" style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
              {text.activity}
            </button>
            <button
              onClick={() => setActiveTab('people')}
              className="flex-1 px-4 py-3 font-medium text-sm transition-all relative"
              style={{ 
                color: activeTab === 'people' ? 'var(--color-green)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'people' ? '2px solid var(--color-green)' : '2px solid transparent'
              }}
            >
              <Users className="inline mr-2" style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
              {text.people}
            </button>
            <button
              onClick={() => setActiveTab('challengesResources')}
              className="flex-1 px-4 py-3 font-medium text-sm transition-all relative"
              style={{ 
                color: activeTab === 'challengesResources' ? 'var(--color-green)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'challengesResources' ? '2px solid var(--color-green)' : '2px solid transparent'
              }}
            >
              <Package className="inline mr-2" style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} />
              {text.challengesResources}
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl p-4 md:p-6 border" style={{ borderColor: 'var(--border-light)' }}>
          {activeTab === 'activity' && (
            <div className="space-y-4">
              {/* Activity Categories - Multi-select */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  {text.activityCategory}
                </label>
                <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {language === 'zh' ? '选择此时段涉及的活动类型（可多选）' : 'Select activity types involved in this time period (multiple allowed)'}
                </p>
                
                {/* Selected Categories Display */}
                {formData.activity_categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.activity_categories.map((cat) => {
                      const categoryLabels: Record<string, string> = {
                        adl_clinical: language === 'zh' ? 'ADL-临床 (给药、医疗)' : 'ADL-Clinical (medication)',
                        adl_functional: language === 'zh' ? 'ADL-功能性 (进食、洗澡)' : 'ADL-Functional (feeding, bathing)',
                        adl_cognitive: language === 'zh' ? 'ADL-认知 (定向、对话)' : 'ADL-Cognitive (orientation)',
                        iadl_decision: language === 'zh' ? 'IADL-决策 (医疗、财务)' : 'IADL-Decision (medical, financial)',
                        iadl_housekeeping: language === 'zh' ? 'IADL-家务 (备餐、清洁)' : 'IADL-Housekeeping (meals, cleaning)',
                        iadl_info: language === 'zh' ? 'IADL-信息管理 (协调)' : 'IADL-Info Mgmt (coordinating)',
                        iadl_logistics: language === 'zh' ? 'IADL-后勤 (预约、提醒)' : 'IADL-Logistics (scheduling)',
                        iadl_transport: language === 'zh' ? 'IADL-交通 (驾车、接送)' : 'IADL-Transport (driving, rides)',
                        maint_companion: language === 'zh' ? '陪伴 (社交、游戏)' : 'Companionship (social, games)',
                        maint_caregiver: language === 'zh' ? '照护者支持 (情感、替班)' : 'Caregiver Support (emotional)',
                        maint_vigilance: language === 'zh' ? '监护 (监督、安全)' : 'Vigilance (supervision, safety)',
                        maint_pet: language === 'zh' ? '宠物照顾 (遛宠物、喂食)' : 'Pet Care (walking, feeding)',
                        maint_skill: language === 'zh' ? '技能发展 (课程、阅读)' : 'Skill Dev (classes, reading)'
                      };
                      return (
                        <span 
                          key={cat}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                          style={{ backgroundColor: 'var(--color-green)', color: 'white' }}
                        >
                          {categoryLabels[cat] || cat}
                          <button 
                            onClick={() => setFormData({
                              ...formData, 
                              activity_categories: formData.activity_categories.filter(c => c !== cat)
                            })}
                            className="ml-1 hover:opacity-70"
                          >×</button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Category Checkboxes - Full examples from PMC7098392 Table 3 */}
                <div className="space-y-3 p-3 rounded-lg border" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
                  {[
                    { value: 'adl_clinical', label: language === 'zh' ? 'ADL-临床: 给药、医疗任务（导尿管、伤口护理）' : 'ADL-Clinical: medication, medical tasks (catheter, wound care)' },
                    { value: 'adl_functional', label: language === 'zh' ? 'ADL-功能性: 进食、洗澡、穿衣、梳洗、如厕、行走辅助' : 'ADL-Functional: feeding/eating, bathing, dressing, grooming, toileting, ambulation' },
                    { value: 'adl_cognitive', label: language === 'zh' ? 'ADL-认知: 定向（时间、日期、人名、位置）、对话、回答问题、时事新闻' : 'ADL-Cognitive: orientation (time, day, names, location), conversation, answering questions, current events' },
                    { value: 'iadl_decision', label: language === 'zh' ? 'IADL-决策: 医疗决策、财务决策、非医疗决策' : 'IADL-Decision: medical decisions, financial decisions, non-medical decisions' },
                    { value: 'iadl_housekeeping', label: language === 'zh' ? 'IADL-家务: 备餐、打扫房屋/庭院、购物、管理衣物' : 'IADL-Housekeeping: preparing meals, cleaning house/yard, shopping, managing wardrobe' },
                    { value: 'iadl_info', label: language === 'zh' ? 'IADL-信息管理: 协调照护、与医护团队沟通、管理财务/账单' : 'IADL-Info Mgmt: coordinating care, communicating with care team, managing finances/bills' },
                    { value: 'iadl_logistics', label: language === 'zh' ? 'IADL-后勤: 预约安排、提醒、确保必需品送达（食物、用品）' : 'IADL-Logistics: scheduling appointments, reminding, ensuring delivery of necessities' },
                    { value: 'iadl_transport', label: language === 'zh' ? 'IADL-交通: 驾车、安排接送、陪同就医' : 'IADL-Transport: driving, arranging rides, accompanying to appointments' },
                    { value: 'maint_companion', label: language === 'zh' ? '陪伴: 社交互动、聊天、游戏、音乐、散步、外出' : 'Companionship: social interaction, conversation, games, music, walks, outings' },
                    { value: 'maint_caregiver', label: language === 'zh' ? '照护者支持: 给其他照护者情感支持、替班/喘息服务' : 'Caregiver Support: emotional support for other caregivers, filling in/respite' },
                    { value: 'maint_vigilance', label: language === 'zh' ? '监护: 监督、安全监控、陪同散步/外出办事、防止走失' : 'Vigilance: supervision, safety monitoring, accompanying on walks/errands, preventing wandering' },
                    { value: 'maint_pet', label: language === 'zh' ? '宠物照顾: 遛宠物、喂食、看兽医、宠物管理' : 'Pet Care: walking pets, feeding, vet visits, pet management' },
                    { value: 'maint_skill', label: language === 'zh' ? '技能发展: 参加课程、阅读书籍、自我反思、学习失智症知识' : 'Skill Development: attending classes, reading books, self-reflection, learning about dementia' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-start gap-2 cursor-pointer text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                      <input
                        type="checkbox"
                        checked={formData.activity_categories.includes(option.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, activity_categories: [...formData.activity_categories, option.value] });
                          } else {
                            setFormData({ ...formData, activity_categories: formData.activity_categories.filter(c => c !== option.value) });
                          }
                        }}
                        className="rounded mt-0.5 shrink-0"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                
                {/* Other/Custom Input */}
                <div className="mt-3">
                  <input
                    type="text"
                    value={formData.activity_other}
                    onChange={(e) => setFormData({ ...formData, activity_other: e.target.value })}
                    placeholder={language === 'zh' ? '其他活动（请描述）...' : 'Other activity (please describe)...'}
                    className="w-full p-2 rounded-lg border text-sm"
                    style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
                  />
                </div>
              </div>
              
              {/* Section 1: Activity Description */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  {language === 'zh' ? '活动描述' : 'Activity Description'}
                </label>
                <p className="text-xs mb-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {language === 'zh' 
                    ? '描述您在这段时间内进行的护理活动。例如：协助洗澡、准备餐食、陪伴散步、管理药物等。'
                    : 'Describe care activities you performed during this time. E.g. assisting with bathing, preparing meals, accompanying on walks, managing medications.'}
                </p>
                <p className="text-xs mb-2 leading-relaxed" style={{ color: '#EF4444' }}>
                  {language === 'zh' 
                    ? '如果您不想分别填写每个标签页，可以在此一次性描述所有内容：活动详情、参与人员（谁在帮助您、您希望谁能帮忙）、寻求帮助时遇到的挑战（沟通困难、协调问题）、您面临的困难（知识不足、时间压力）、以及您正在使用或希望拥有的资源和工具。'
                    : 'If you prefer not to fill each tab separately, you can describe everything here at once: activity details, people involved (who helped, who you wish could help), challenges in reaching help (communication barriers, coordination issues), difficulties you face (lack of knowledge, time pressure, emotional stress), and resources you use or wish existed (apps, tools, support services).'}
                </p>
                <div className="relative">
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 pr-24 rounded-lg border"
                    style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
                    rows={3}
                    placeholder={language === 'zh' ? '描述您的护理活动...' : 'Describe your care activities...'}
                  />
                  <div className="absolute right-2 top-2 flex gap-1">
                    <button onClick={() => handleVoiceInput('description')} className="px-2 py-1.5 rounded-lg transition-all flex items-center gap-1" style={{ backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)', color: isRecording ? 'white' : 'var(--text-secondary)' }}>
                      <Mic style={{ width: 'clamp(0.875rem, 2vw, 1rem)', height: 'clamp(0.875rem, 2vw, 1rem)' }} />
                      <span className="text-xs font-medium">{text.voiceInput}</span>
                    </button>
                    <button onClick={() => { setAiFieldContext({ field: 'description', question: language === 'zh' ? '活动描述' : 'Activity Description', answer: formData.description }); setAiModalOpen(true); }} className="px-2 py-1.5 rounded-lg transition-all flex items-center gap-1" style={{ backgroundColor: 'var(--color-green)', color: 'white' }}>
                      <Sparkles style={{ width: 'clamp(0.875rem, 2vw, 1rem)', height: 'clamp(0.875rem, 2vw, 1rem)' }} />
                      <span className="text-xs font-medium">{text.aiAssist}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 2: Unfulfilled Care Needs */}
              <div className="pt-2 border-t" style={{ borderColor: 'var(--border-light)' }}>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  {language === 'zh' ? '未能满足的护理需求（可选）' : 'Unfulfilled Care Needs (Optional)'}
                </label>
                <p className="text-xs mb-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {language === 'zh' 
                    ? '描述由于各种原因未能进行的护理活动。例如：缺乏相关知识、没有人可以帮忙、资源不足、安全顾虑等。比如：患者想外出散步，但您独自一人无法同时看护，或担心他/她可能走失。'
                    : 'Describe care activities you couldn\'t do due to various reasons. E.g. lack of knowledge, no one available to help, insufficient resources, safety concerns, etc. For example: patient wanted to go for a walk, but you were alone and couldn\'t supervise, or feared they might get lost.'}
                </p>
                <div className="relative">
                  <textarea
                    value={formData.challenges_faced}
                    onChange={(e) => setFormData({ ...formData, challenges_faced: e.target.value })}
                    className="w-full p-3 pr-24 rounded-lg border"
                    style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
                    rows={2}
                    placeholder={language === 'zh' ? '描述未能满足的护理需求...' : 'Describe unfulfilled care needs...'}
                  />
                  <div className="absolute right-2 top-2 flex gap-1">
                    <button onClick={() => handleVoiceInput('challenges_faced')} className="px-2 py-1.5 rounded-lg transition-all flex items-center gap-1" style={{ backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)', color: isRecording ? 'white' : 'var(--text-secondary)' }}>
                      <Mic style={{ width: 'clamp(0.875rem, 2vw, 1rem)', height: 'clamp(0.875rem, 2vw, 1rem)' }} />
                      <span className="text-xs font-medium">{text.voiceInput}</span>
                    </button>
                    <button onClick={() => { setAiFieldContext({ field: 'challenges_faced', question: language === 'zh' ? '未能满足的护理需求' : 'Unfulfilled Care Needs', answer: formData.challenges_faced }); setAiModalOpen(true); }} className="px-2 py-1.5 rounded-lg transition-all flex items-center gap-1" style={{ backgroundColor: 'var(--color-green)', color: 'white' }}>
                      <Sparkles style={{ width: 'clamp(0.875rem, 2vw, 1rem)', height: 'clamp(0.875rem, 2vw, 1rem)' }} />
                      <span className="text-xs font-medium">{text.aiAssist}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 3: Resource Ideas */}
              <div className="pt-2 border-t" style={{ borderColor: 'var(--border-light)' }}>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  {language === 'zh' ? '想法或建议（可选）' : 'Ideas or Suggestions (Optional)'}
                </label>
                <p className="text-xs mb-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {language === 'zh' 
                    ? '描述您认为可能有帮助的资源、工具或服务。即使这段时间没有发生特别的事情，您也可以记录您的想法或点子。'
                    : 'Describe resources, tools, or services you think might be helpful. Even if nothing particular happened during this time, you can record your thoughts or ideas.'}
                </p>
                <div className="relative">
                  <textarea
                    value={formData.resources_wanted}
                    onChange={(e) => setFormData({ ...formData, resources_wanted: e.target.value })}
                    className="w-full p-3 pr-24 rounded-lg border"
                    style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
                    rows={2}
                    placeholder={language === 'zh' ? '描述您的资源想法...' : 'Describe your resource ideas...'}
                  />
                  <div className="absolute right-2 top-2 flex gap-1">
                    <button onClick={() => handleVoiceInput('resources_wanted')} className="px-2 py-1.5 rounded-lg transition-all flex items-center gap-1" style={{ backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)', color: isRecording ? 'white' : 'var(--text-secondary)' }}>
                      <Mic style={{ width: 'clamp(0.875rem, 2vw, 1rem)', height: 'clamp(0.875rem, 2vw, 1rem)' }} />
                      <span className="text-xs font-medium">{text.voiceInput}</span>
                    </button>
                    <button onClick={() => { setAiFieldContext({ field: 'resources_wanted', question: language === 'zh' ? '想法或建议' : 'Ideas or Suggestions', answer: formData.resources_wanted }); setAiModalOpen(true); }} className="px-2 py-1.5 rounded-lg transition-all flex items-center gap-1" style={{ backgroundColor: 'var(--color-green)', color: 'white' }}>
                      <Sparkles style={{ width: 'clamp(0.875rem, 2vw, 1rem)', height: 'clamp(0.875rem, 2vw, 1rem)' }} />
                      <span className="text-xs font-medium">{text.aiAssist}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  {text.timeSpent}
                </label>
                <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {text.timeSpentHelper}
                </p>
                <input
                  type="number"
                  value={formData.time_spent || ''}
                  onChange={(e) => setFormData({ ...formData, time_spent: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 rounded-lg border"
                  style={{ 
                    borderColor: 'var(--border-light)',
                    backgroundColor: 'var(--bg-secondary)'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  {text.urgencyLevel}
                </label>
                <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {text.urgencyLevelHelper}
                </p>
                <IOSDropdown
                  value={formData.urgency_level}
                  options={[
                    { value: '', label: 'Select...' },
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'urgent', label: 'Urgent' }
                  ]}
                  onChange={(value) => setFormData({ ...formData, urgency_level: value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  {text.emotionalImpact}
                </label>
                <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {text.emotionalImpactHelper}
                </p>
                <IOSDropdown
                  value={formData.emotional_impact}
                  options={[
                    { value: '', label: language === 'zh' ? '选择...' : 'Select...' },
                    { value: 'positive', label: language === 'zh' ? '积极' : 'Positive' },
                    { value: 'neutral', label: language === 'zh' ? '中性' : 'Neutral' },
                    { value: 'challenging', label: language === 'zh' ? '有挑战' : 'Challenging' },
                    { value: 'stressful', label: language === 'zh' ? '压力大' : 'Stressful' }
                  ]}
                  onChange={(value) => setFormData({ ...formData, emotional_impact: value })}
                />
              </div>

              {/* Your Mood */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  {text.yourMood}
                </label>
                <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {text.yourMoodHelper}
                </p>
                <IOSDropdown
                  value={formData.your_mood}
                  options={[
                    { value: '', label: language === 'zh' ? '选择...' : 'Select...' },
                    { value: 'great', label: language === 'zh' ? '很好' : 'Great' },
                    { value: 'good', label: language === 'zh' ? '好' : 'Good' },
                    { value: 'okay', label: language === 'zh' ? '一般' : 'Okay' },
                    { value: 'tired', label: language === 'zh' ? '疲惫' : 'Tired' },
                    { value: 'stressed', label: language === 'zh' ? '压力大' : 'Stressed' },
                    { value: 'anxious', label: language === 'zh' ? '焦虑' : 'Anxious' },
                    { value: 'sad', label: language === 'zh' ? '难过' : 'Sad' }
                  ]}
                  onChange={(value) => setFormData({ ...formData, your_mood: value })}
                />
              </div>
            </div>
          )}

          {activeTab === 'people' && (
            <div className="space-y-4">
              {/* Network Members Quick Select */}
              {networkMembers.length > 0 && (
                <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--border-light)', background: 'rgba(16,185,129,0.05)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={16} style={{ color: 'var(--color-green)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                      {language === 'zh' ? '从照护网络中选择' : 'Select from Care Network'}
                    </span>
                    <button
                      onClick={() => navigate('/settings')}
                      className="ml-auto text-xs flex items-center gap-1 px-2 py-1 rounded-lg"
                      style={{ background: 'var(--color-green)', color: 'white' }}
                    >
                      <UserPlus size={12} />
                      {language === 'zh' ? '添加更多' : 'Add More'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {/* Just Me option */}
                    <button
                      onClick={() => togglePerson(language === 'zh' ? '仅自己' : 'Just Me')}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1"
                      style={{
                        background: selectedPeople.includes(language === 'zh' ? '仅自己' : 'Just Me') ? 'var(--color-green)' : 'white',
                        color: selectedPeople.includes(language === 'zh' ? '仅自己' : 'Just Me') ? 'white' : 'var(--text-primary)',
                        border: '1px solid var(--border-light)'
                      }}
                    >
                      <span>👤</span>
                      {language === 'zh' ? '仅自己' : 'Just Me'}
                    </button>
                    {/* Network members */}
                    {networkMembers.map(member => (
                      <button
                        key={member.id}
                        onClick={() => togglePerson(member.name)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                        style={{
                          background: selectedPeople.includes(member.name) ? member.color : 'white',
                          color: selectedPeople.includes(member.name) ? 'white' : 'var(--text-primary)',
                          border: `1px solid ${selectedPeople.includes(member.name) ? member.color : 'var(--border-light)'}`
                        }}
                      >
                        {member.name} <span className="opacity-60">({member.relationship})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* People Involved */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  {text.peopleWith}
                </label>
                <p className="text-xs mb-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {text.peopleWithHelper}
                </p>
                <p className="text-xs mb-2 leading-relaxed" style={{ color: '#EF4444' }}>
                  {text.peopleWithTip}
                </p>
                <div className="relative">
                  <textarea
                    value={formData.people_with}
                    onChange={(e) => setFormData({ ...formData, people_with: e.target.value })}
                    className="w-full p-3 pr-24 rounded-lg border"
                    style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
                    rows={3}
                  />
                  <div className="absolute right-2 top-2 flex gap-1">
                    <button onClick={() => handleVoiceInput('people_with')} className="px-2 py-1.5 rounded-lg transition-all flex items-center gap-1" style={{ backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)', color: isRecording ? 'white' : 'var(--text-secondary)' }}>
                      <Mic style={{ width: 'clamp(0.875rem, 2vw, 1rem)', height: 'clamp(0.875rem, 2vw, 1rem)' }} />
                      <span className="text-xs font-medium">{text.voiceInput}</span>
                    </button>
                    <button onClick={() => { setAiFieldContext({ field: 'people_with', question: text.peopleWith, answer: formData.people_with }); setAiModalOpen(true); }} className="px-2 py-1.5 rounded-lg transition-all flex items-center gap-1" style={{ backgroundColor: 'var(--color-green)', color: 'white' }}>
                      <Sparkles style={{ width: 'clamp(0.875rem, 2vw, 1rem)', height: 'clamp(0.875rem, 2vw, 1rem)' }} />
                      <span className="text-xs font-medium">{text.aiAssist}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* People You Wish to Involve */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  {text.peopleWant}
                </label>
                <p className="text-xs mb-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {text.peopleWantHelper}
                </p>
                <div className="relative">
                  <textarea
                    value={formData.people_want_with}
                    onChange={(e) => setFormData({ ...formData, people_want_with: e.target.value })}
                    className="w-full p-3 pr-24 rounded-lg border"
                    style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
                    rows={3}
                  />
                  <div className="absolute right-2 top-2 flex gap-1">
                    <button onClick={() => handleVoiceInput('people_want_with')} className="px-2 py-1.5 rounded-lg transition-all flex items-center gap-1" style={{ backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)', color: isRecording ? 'white' : 'var(--text-secondary)' }}>
                      <Mic style={{ width: 'clamp(0.875rem, 2vw, 1rem)', height: 'clamp(0.875rem, 2vw, 1rem)' }} />
                      <span className="text-xs font-medium">{text.voiceInput}</span>
                    </button>
                    <button onClick={() => { setAiFieldContext({ field: 'people_want_with', question: text.peopleWant, answer: formData.people_want_with }); setAiModalOpen(true); }} className="px-2 py-1.5 rounded-lg transition-all flex items-center gap-1" style={{ backgroundColor: 'var(--color-green)', color: 'white' }}>
                      <Sparkles style={{ width: 'clamp(0.875rem, 2vw, 1rem)', height: 'clamp(0.875rem, 2vw, 1rem)' }} />
                      <span className="text-xs font-medium">{text.aiAssist}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Challenges in Reaching Help */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  {text.peopleChallenges}
                </label>
                <p className="text-xs mb-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {text.peopleChallengesHelper}
                </p>
                <div className="relative">
                  <textarea
                    value={formData.people_challenges}
                    onChange={(e) => setFormData({ ...formData, people_challenges: e.target.value })}
                    className="w-full p-3 pr-24 rounded-lg border"
                    style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
                    rows={3}
                  />
                  <div className="absolute right-2 top-2 flex gap-1">
                    <button onClick={() => handleVoiceInput('people_challenges')} className="px-2 py-1.5 rounded-lg transition-all flex items-center gap-1" style={{ backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)', color: isRecording ? 'white' : 'var(--text-secondary)' }}>
                      <Mic style={{ width: 'clamp(0.875rem, 2vw, 1rem)', height: 'clamp(0.875rem, 2vw, 1rem)' }} />
                      <span className="text-xs font-medium">{text.voiceInput}</span>
                    </button>
                    <button onClick={() => { setAiFieldContext({ field: 'people_challenges', question: text.peopleChallenges, answer: formData.people_challenges }); setAiModalOpen(true); }} className="px-2 py-1.5 rounded-lg transition-all flex items-center gap-1" style={{ backgroundColor: 'var(--color-green)', color: 'white' }}>
                      <Sparkles style={{ width: 'clamp(0.875rem, 2vw, 1rem)', height: 'clamp(0.875rem, 2vw, 1rem)' }} />
                      <span className="text-xs font-medium">{text.aiAssist}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'challengesResources' && (
            <div className="space-y-4">
              {/* Task Difficulty Slider */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  {text.taskDifficulty}
                </label>
                <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {text.taskDifficultyHelper}
                </p>
                <div className="px-2">
                  <style>{`
                    input[type="range"]::-webkit-slider-thumb {
                      -webkit-appearance: none;
                      appearance: none;
                      width: 18px;
                      height: 18px;
                      border-radius: 50%;
                      background: var(--color-green);
                      cursor: pointer;
                      border: 2px solid white;
                      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    }
                    input[type="range"]::-moz-range-thumb {
                      width: 18px;
                      height: 18px;
                      border-radius: 50%;
                      background: var(--color-green);
                      cursor: pointer;
                      border: 2px solid white;
                      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    }
                  `}</style>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.task_difficulty}
                    onChange={(e) => setFormData({ ...formData, task_difficulty: parseInt(e.target.value) })}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--color-green) 0%, var(--color-green) ${(formData.task_difficulty - 1) * 25}%, #e5e7eb ${(formData.task_difficulty - 1) * 25}%, #e5e7eb 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className="text-center" style={{ width: '18%', fontWeight: formData.task_difficulty === n ? 600 : 400, color: formData.task_difficulty === n ? 'var(--color-green)' : 'var(--text-secondary)' }}>
                        {n}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    <span>{language === 'zh' ? '无挑战' : 'No challenges'}</span>
                    <span>{language === 'zh' ? '极大挑战' : 'Extreme'}</span>
                  </div>
                  <div className="text-center mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {formData.task_difficulty === 1 && (language === 'zh' ? '顺利完成，没有遇到困难' : 'Completed smoothly, no difficulties')}
                    {formData.task_difficulty === 2 && (language === 'zh' ? '有些小困难，但能应对' : 'Minor difficulties, manageable')}
                    {formData.task_difficulty === 3 && (language === 'zh' ? '遇到一些挑战' : 'Encountered some challenges')}
                    {formData.task_difficulty === 4 && (language === 'zh' ? '遇到较大挑战' : 'Significant challenges faced')}
                    {formData.task_difficulty === 5 && (language === 'zh' ? '极其困难，几乎无法完成' : 'Extremely difficult, barely manageable')}
                  </div>
                </div>
              </div>

              {/* Challenges Faced */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  {text.challenges}
                </label>
                <p className="text-xs mb-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {text.challengesHelper}
                </p>
                
                {/* Selected challenge types as chips */}
                {formData.challenge_types.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    {formData.challenge_types.map((type) => {
                      const typeLabel = text.challengeTypes.find((t: {value: string, label: string}) => t.value === type)?.label || type;
                      return (
                        <span
                          key={type}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: 'var(--color-green)', color: 'white' }}
                        >
                          {typeLabel}
                          <button
                            onClick={() => setFormData({ ...formData, challenge_types: formData.challenge_types.filter(t => t !== type) })}
                            className="ml-1 hover:opacity-70"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
                
                {/* Challenge type options */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {text.challengeTypes.map((type: {value: string, label: string}) => (
                    <button
                      key={type.value}
                      onClick={() => {
                        if (formData.challenge_types.includes(type.value)) {
                          setFormData({ ...formData, challenge_types: formData.challenge_types.filter(t => t !== type.value) });
                        } else {
                          setFormData({ ...formData, challenge_types: [...formData.challenge_types, type.value] });
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-full text-xs font-medium transition-all"
                      style={{
                        backgroundColor: formData.challenge_types.includes(type.value) ? 'var(--color-green)' : 'white',
                        color: formData.challenge_types.includes(type.value) ? 'white' : 'var(--text-secondary)',
                        border: `1px solid ${formData.challenge_types.includes(type.value) ? 'var(--color-green)' : 'var(--border-light)'}`
                      }}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
                
                <p className="text-xs mb-2 leading-relaxed" style={{ color: '#EF4444' }}>
                  {text.challengesTip}
                </p>
                
                <div className="relative">
                  <textarea
                    value={formData.challenges_faced}
                    onChange={(e) => setFormData({ ...formData, challenges_faced: e.target.value })}
                    placeholder={language === 'zh' ? '详细描述您遇到的挑战...' : 'Describe your challenges in detail...'}
                    className="w-full p-3 pr-24 rounded-lg border"
                    style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
                    rows={3}
                  />
                  <div className="absolute right-2 top-2 flex gap-1">
                    <button onClick={() => handleVoiceInput('challenges_faced')} className="px-2 py-1.5 rounded-lg transition-all flex items-center gap-1" style={{ backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)', color: isRecording ? 'white' : 'var(--text-secondary)' }}>
                      <Mic style={{ width: 'clamp(0.875rem, 2vw, 1rem)', height: 'clamp(0.875rem, 2vw, 1rem)' }} />
                      <span className="text-xs font-medium">{text.voiceInput}</span>
                    </button>
                    <button onClick={() => { setAiFieldContext({ field: 'challenges_faced', question: text.challenges, answer: formData.challenges_faced }); setAiModalOpen(true); }} className="px-2 py-1.5 rounded-lg transition-all flex items-center gap-1" style={{ backgroundColor: 'var(--color-green)', color: 'white' }}>
                      <Sparkles style={{ width: 'clamp(0.875rem, 2vw, 1rem)', height: 'clamp(0.875rem, 2vw, 1rem)' }} />
                      <span className="text-xs font-medium">{text.aiAssist}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Resources Currently Using */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  {text.resourcesUsing}
                </label>
                <p className="text-xs mb-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {text.resourcesUsingHelper}
                </p>
                <div className="relative">
                  <textarea
                    value={formData.resources_using}
                    onChange={(e) => setFormData({ ...formData, resources_using: e.target.value })}
                    className="w-full p-3 pr-24 rounded-lg border"
                    style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
                    rows={3}
                  />
                  <div className="absolute right-2 top-2 flex gap-1">
                    <button onClick={() => handleVoiceInput('resources_using')} className="px-2 py-1.5 rounded-lg transition-all flex items-center gap-1" style={{ backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)', color: isRecording ? 'white' : 'var(--text-secondary)' }}>
                      <Mic style={{ width: 'clamp(0.875rem, 2vw, 1rem)', height: 'clamp(0.875rem, 2vw, 1rem)' }} />
                      <span className="text-xs font-medium">{text.voiceInput}</span>
                    </button>
                    <button onClick={() => { setAiFieldContext({ field: 'resources_using', question: text.resourcesUsing, answer: formData.resources_using }); setAiModalOpen(true); }} className="px-2 py-1.5 rounded-lg transition-all flex items-center gap-1" style={{ backgroundColor: 'var(--color-green)', color: 'white' }}>
                      <Sparkles style={{ width: 'clamp(0.875rem, 2vw, 1rem)', height: 'clamp(0.875rem, 2vw, 1rem)' }} />
                      <span className="text-xs font-medium">{text.aiAssist}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Resources You Wish Existed */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  {text.resourcesWanted}
                </label>
                <p className="text-xs mb-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {text.resourcesWantedHelper}
                </p>
                <div className="relative">
                  <textarea
                    value={formData.resources_wanted}
                    onChange={(e) => setFormData({ ...formData, resources_wanted: e.target.value })}
                    className="w-full p-3 pr-24 rounded-lg border"
                    style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
                    rows={3}
                  />
                  <div className="absolute right-2 top-2 flex gap-1">
                    <button onClick={() => handleVoiceInput('resources_wanted')} className="px-2 py-1.5 rounded-lg transition-all flex items-center gap-1" style={{ backgroundColor: isRecording ? 'var(--color-red)' : 'var(--bg-secondary)', color: isRecording ? 'white' : 'var(--text-secondary)' }}>
                      <Mic style={{ width: 'clamp(0.875rem, 2vw, 1rem)', height: 'clamp(0.875rem, 2vw, 1rem)' }} />
                      <span className="text-xs font-medium">{text.voiceInput}</span>
                    </button>
                    <button onClick={() => { setAiFieldContext({ field: 'resources_wanted', question: text.resourcesWanted, answer: formData.resources_wanted }); setAiModalOpen(true); }} className="px-2 py-1.5 rounded-lg transition-all flex items-center gap-1" style={{ backgroundColor: 'var(--color-green)', color: 'white' }}>
                      <Sparkles style={{ width: 'clamp(0.875rem, 2vw, 1rem)', height: 'clamp(0.875rem, 2vw, 1rem)' }} />
                      <span className="text-xs font-medium">{text.aiAssist}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Daily Sense of Competence - ESM items from SSCQ (always shown) */}
          <div className="space-y-4 pt-4 mt-4" style={{ borderTop: '1px solid var(--border-light)' }}>
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-green)' }}>
                {language === 'zh' ? '今日照护能力感' : 'Daily Sense of Competence'}
              </label>
              <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                {language === 'zh' 
                  ? '请根据今天的照护经历回答以下问题（1=完全不同意 到 7=完全同意）' 
                  : 'Based on today\'s caregiving experience, please answer the following (1=Strongly Disagree to 7=Strongly Agree)'}
              </p>
              <div className="space-y-3">
                {/* Item 1: Stressed due to care responsibilities */}
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-primary)' }}>
                    1. {language === 'zh' 
                      ? '今天我因照护责任感到压力' 
                      : 'Today I felt stressed due to my care responsibilities'}
                  </p>
                  <IOSDropdown
                    value={formData.daily_soc_stressed}
                    onChange={(value) => setFormData({ ...formData, daily_soc_stressed: value })}
                    placeholder={language === 'zh' ? '请选择' : 'Select'}
                    options={[
                      { value: '1', label: language === 'zh' ? '1 - 完全不同意' : '1 - Strongly Disagree' },
                      { value: '2', label: '2' },
                      { value: '3', label: '3' },
                      { value: '4', label: language === 'zh' ? '4 - 中立' : '4 - Neutral' },
                      { value: '5', label: '5' },
                      { value: '6', label: '6' },
                      { value: '7', label: language === 'zh' ? '7 - 完全同意' : '7 - Strongly Agree' }
                    ]}
                  />
                </div>
                
                {/* Item 2: Privacy */}
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-primary)' }}>
                    2. {language === 'zh' 
                      ? '今天我觉得与被照护者的相处没有给我足够的隐私空间' 
                      : 'Today I felt that the situation with my care recipient did not allow me as much privacy as I would have liked'}
                  </p>
                  <IOSDropdown
                    value={formData.daily_soc_privacy}
                    onChange={(value) => setFormData({ ...formData, daily_soc_privacy: value })}
                    placeholder={language === 'zh' ? '请选择' : 'Select'}
                    options={[
                      { value: '1', label: language === 'zh' ? '1 - 完全不同意' : '1 - Strongly Disagree' },
                      { value: '2', label: '2' },
                      { value: '3', label: '3' },
                      { value: '4', label: language === 'zh' ? '4 - 中立' : '4 - Neutral' },
                      { value: '5', label: '5' },
                      { value: '6', label: '6' },
                      { value: '7', label: language === 'zh' ? '7 - 完全同意' : '7 - Strongly Agree' }
                    ]}
                  />
                </div>
                
                {/* Item 3: Strained interactions */}
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-primary)' }}>
                    3. {language === 'zh' 
                      ? '今天我在与被照护者的互动中感到紧张' 
                      : 'Today I felt strained in the interactions with my care recipient'}
                  </p>
                  <IOSDropdown
                    value={formData.daily_soc_strained}
                    onChange={(value) => setFormData({ ...formData, daily_soc_strained: value })}
                    placeholder={language === 'zh' ? '请选择' : 'Select'}
                    options={[
                      { value: '1', label: language === 'zh' ? '1 - 完全不同意' : '1 - Strongly Disagree' },
                      { value: '2', label: '2' },
                      { value: '3', label: '3' },
                      { value: '4', label: language === 'zh' ? '4 - 中立' : '4 - Neutral' },
                      { value: '5', label: '5' },
                      { value: '6', label: '6' },
                      { value: '7', label: language === 'zh' ? '7 - 完全同意' : '7 - Strongly Agree' }
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6" style={{ borderTop: '1px solid var(--border-light)' }}>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.description}
              className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 min-h-[48px]"
              style={{ backgroundColor: 'var(--color-green)' }}
            >
              <Save className="w-4 h-4 inline mr-2" />
              {text.save}
            </button>
            <button
              onClick={() => navigate('/timeline')}
              className="px-6 py-3 rounded-xl font-semibold transition-all min-h-[48px]"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
            >
              {text.cancel}
            </button>
          </div>
        </div>
      </div>

      <AISurveyAssistant
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        question={aiFieldContext.question}
        currentAnswer={aiFieldContext.answer}
        onCopyAnswer={handleCopyAnswer}
        onAiResponse={handleAiResponse}
      />
    </div>
  );
};

export default AddEntry;
