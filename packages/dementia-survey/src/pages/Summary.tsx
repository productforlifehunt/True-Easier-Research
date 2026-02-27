import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useStateManagement';
import { BarChart3, TrendingUp, Clock, Users, Calendar, Filter, ChevronRight, ChevronDown, ChevronUp, Heart, MessageCircle, Wrench, Trash2, Edit2, Pencil, ArrowLeft, Moon, Plus } from 'lucide-react';
import { dataService } from '../lib/dataService';
import { useLanguage } from '../hooks/useLanguage';
import DesktopHeader from '../components/DesktopHeader';
import MobileHeader from '../components/MobileHeader';
import AuthModal from '../components/AuthModal';

interface EndOfDaySurveyEntry {
  id: number;
  user_id: string;
  survey_date: string;
  entry_timestamp: string;
  soc_stressed?: number;
  soc_privacy?: number;
  soc_strained?: number;
  daily_burden_rating?: number;
  supplement_notes?: string;
  created_at: string;
  updated_at: string;
}

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
  event_stress_rating?: number;
  mbp_memory?: string;
  mbp_behavior?: string;
  mbp_depression?: string;
  mbp_distress?: string;
  task_difficulty?: number;
  daily_burden_rating?: number;
  urgency_level?: string;
  support_needed?: string;
  entry_timestamp: string;
}

const Summary: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<SurveyEntry[]>([]);
  const [dailySurveys, setDailySurveys] = useState<EndOfDaySurveyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [surveyTypeTab, setSurveyTypeTab] = useState<'all' | 'hourly' | 'daily'>('all');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'day' | 'category' | 'time'>('week');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingDailyId, setDeletingDailyId] = useState<number | null>(null);
  
  const { language, t } = useLanguage();
  const text = language === 'zh' ? {
    title: '数据汇总',
    week: '周',
    day: '第',
    dayUnit: '天',
    total: '总计',
    activities: '时间相关条目',
    general: '一般条目',
    byWeek: '按周查看',
    byDay: '按天查看',
    byCategory: '按类别',
    byTime: '按时间',
    morning: '早晨',
    afternoon: '下午',
    evening: '晚上',
    night: '深夜',
    viewDetails: '查看详情',
    noData: '暂无数据',
    trends: '趋势分析',
    patterns: '模式识别',
    careActivity: '护理活动',
    careNeed: '护理需求',
    struggle: '困难',
    tabAll: '全部',
    tabHourly: '活动记录',
    tabDaily: '每日问卷',
    dailySurveyDate: '日期',
    burden: '负担评分',
    stressed: '压力',
    privacy: '隐私',
    strained: '互动紧张',
    supplement: '补充说明',
    editDaily: '编辑',
    deleteDaily: '删除',
    confirmDelete: '确定删除？',
    confirmDeleteCancel: '取消',
    addEndOfDay: '填写今日问卷',
    noDailyData: '暂无每日问卷数据'
  } : {
    title: 'Summary',
    week: 'Week',
    day: 'Day',
    dayUnit: '',
    total: 'Total',
    activities: 'Time-based Entries',
    general: 'General Entries',
    byWeek: 'By Week',
    byDay: 'By Day',
    byCategory: 'By Category',
    byTime: 'By Time',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    night: 'Night',
    viewDetails: 'View Details',
    noData: 'No data',
    trends: 'Trend Analysis',
    patterns: 'Pattern Recognition',
    careActivity: 'Care Activity',
    careNeed: 'Care Need',
    struggle: 'Struggle',
    tabAll: 'All',
    tabHourly: 'Hourly Logs',
    tabDaily: 'Daily Surveys',
    dailySurveyDate: 'Date',
    burden: 'Burden',
    stressed: 'Stressed',
    privacy: 'Privacy',
    strained: 'Strained',
    supplement: 'Notes',
    editDaily: 'Edit',
    deleteDaily: 'Delete',
    confirmDelete: 'Delete this?',
    confirmDeleteCancel: 'Cancel',
    addEndOfDay: 'Complete Today\'s Survey',
    noDailyData: 'No daily surveys yet'
  };

  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [user]);

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

  const loadEntries = async () => {
    if (!user) return;
    
    try {
      // Load hourly survey entries
      const { data: hourlyData, error: hourlyError } = await supabase
        .from('survey_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_timestamp', { ascending: false });

      if (hourlyError) throw hourlyError;
      setEntries(hourlyData || []);

      // Load end-of-day surveys
      try {
        const { data: dailyData, error: dailyError } = await supabase
          .from('end_of_day_surveys')
          .select('*')
          .eq('user_id', user.id)
          .order('survey_date', { ascending: false });

        if (!dailyError) {
          setDailySurveys(dailyData || []);
        }
      } catch {
        // Table may not exist yet - that's ok
        console.log('end_of_day_surveys table not available yet');
      }
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatsByCategory = () => {
    const timeBased = entries.filter(e => e.entry_timestamp !== null).length;
    const general = entries.filter(e => e.entry_timestamp === null).length;
    
    return {
      timeBased,
      general
    };
  };

  const getDayStats = (day: number) => {
    const dayEntries = entries.filter(entry => {
      if (!entry.entry_timestamp) return false;
      const entryDate = new Date(entry.entry_timestamp);
      return entryDate.getDay() === day;
    });
    
    return {
      total: dayEntries.length
    };
  };

  const getStatsByTimeOfDay = () => {
    const timeStats = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0
    };

    entries.forEach(entry => {
      if (!entry.entry_timestamp) return; // Skip entries not tied to time
      const hour = new Date(entry.entry_timestamp).getHours();
      if (hour >= 6 && hour < 12) timeStats.morning++;
      else if (hour >= 12 && hour < 17) timeStats.afternoon++;
      else if (hour >= 17 && hour < 21) timeStats.evening++;
      else timeStats.night++;
    });

    return timeStats;
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'care_activity': return 'var(--color-green)';
      case 'care_need': return '#fb923c';
      case 'struggle': return '#ef4444';
      default: return 'var(--text-secondary)';
    }
  };

  const getEntrySummary = (entry: SurveyEntry): string => {
    const parts: string[] = [];
    if ((entry as any).activity_categories?.length > 0) {
      const categoryLabels: Record<string, string> = {
        adl_clinical: language === 'zh' ? '临床护理' : 'Clinical Care',
        adl_functional: language === 'zh' ? '功能护理' : 'Functional Care',
        iadl_logistics: language === 'zh' ? '后勤支持' : 'Logistics',
        iadl_household: language === 'zh' ? '家务' : 'Household',
        emotional_support: language === 'zh' ? '情感支持' : 'Emotional Support',
        supervision: language === 'zh' ? '监督' : 'Supervision',
        social_activities: language === 'zh' ? '社交活动' : 'Social Activities',
      };
      const labels = (entry as any).activity_categories.map((c: string) => categoryLabels[c] || c).join(', ');
      parts.push(labels);
    }
    if (entry.description) parts.push(entry.description);
    const affects = [
      (entry as any).affect_cheerful, (entry as any).affect_relaxed, (entry as any).affect_enthusiastic, (entry as any).affect_satisfied,
      (entry as any).affect_insecure, (entry as any).affect_lonely, (entry as any).affect_anxious, (entry as any).affect_irritated,
      (entry as any).affect_down, (entry as any).affect_desperate, (entry as any).affect_tensed
    ].filter(a => a && a !== '');
    if (affects.length > 0) parts.push(language === 'zh' ? `${affects.length}项情绪` : `${affects.length} affects`);
    if (entry.mbp_memory || entry.mbp_behavior || entry.mbp_depression) parts.push(language === 'zh' ? 'MBP' : 'MBP');
    if (entry.event_stress_rating && entry.event_stress_rating !== 0) parts.push(language === 'zh' ? `压力:${entry.event_stress_rating}` : `Stress:${entry.event_stress_rating}`);
    if (parts.length === 0) return language === 'zh' ? '(已记录)' : '(recorded)';
    return parts.join(' · ');
  };

  const handleDeleteEntry = async (entryId: number) => {
    try {
      const { error } = await supabase.from('survey_entries').delete().eq('id', entryId);
      if (error) throw error;
      setEntries(prev => prev.filter(e => e.id !== entryId));
      setDeletingId(null);
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handleDeleteDaily = async (dailyId: number) => {
    try {
      const { error } = await supabase.from('end_of_day_surveys').delete().eq('id', dailyId);
      if (error) throw error;
      setDailySurveys(prev => prev.filter(d => d.id !== dailyId));
      setDeletingDailyId(null);
    } catch (error) {
      console.error('Error deleting daily survey:', error);
    }
  };

  const renderEntryCard = (entry: SurveyEntry) => (
    <div
      key={entry.id}
      className="p-3 rounded-lg transition-all"
      style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}
    >
      {deletingId === entry.id ? (
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{text.confirmDelete}</p>
          <div className="flex gap-2">
            <button onClick={() => handleDeleteEntry(entry.id)} className="px-3 py-1 rounded text-xs font-medium text-white" style={{ backgroundColor: '#ef4444' }}>
              {text.deleteDaily}
            </button>
            <button onClick={() => setDeletingId(null)} className="px-3 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
              {text.confirmDeleteCancel}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 cursor-pointer" onClick={() => navigate(`/edit-entry/${entry.id}`)}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: getCategoryColor(entry.entry_type), color: 'white' }}>
                {entry.entry_type === 'care_activity' ? text.careActivity : entry.entry_type === 'care_need' ? text.careNeed : text.struggle}
              </span>
              {entry.time_spent && entry.time_spent > 0 && (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{entry.time_spent} min</span>
              )}
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {new Date(entry.entry_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-sm mt-1.5 line-clamp-2" style={{ color: 'var(--text-primary)' }}>{getEntrySummary(entry)}</p>
          </div>
          <div className="flex gap-1 flex-shrink-0 pt-0.5">
            <button onClick={(e) => { e.stopPropagation(); navigate(`/edit-entry/${entry.id}`); }} className="p-1.5 rounded-md hover:opacity-80" style={{ color: 'var(--text-muted)' }} title={text.editDaily}>
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setDeletingId(entry.id); }} className="p-1.5 rounded-md hover:opacity-80" style={{ color: '#ef4444' }} title={text.deleteDaily}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const getTimeSlotEntries = (day: number, hour: number) => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.entry_timestamp);
      const entryDay = entryDate.getDay();
      const entryHour = entryDate.getHours();
      return entryDay === day && entryHour === hour;
    });
  };

  const getTimeSlotLabel = (hour: number) => {
    if (hour >= 6 && hour < 12) return text.morning;
    if (hour >= 12 && hour < 17) return text.afternoon;
    if (hour >= 17 && hour < 21) return text.evening;
    return text.night;
  };

  const stats = getStatsByCategory();
  const timeStats = getStatsByTimeOfDay();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <DesktopHeader />
      <MobileHeader />
      <div className="max-w-6xl mx-auto p-3 pb-20 md:pb-4">
        {/* Header Card - matching Interview page style */}
        <div className="rounded-2xl p-5 mb-4" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: 'white' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 size={28} />
              <div>
                <h1 className="text-lg font-bold">{text.title}</h1>
                <p className="text-sm opacity-90">
                  {entries.length + dailySurveys.length} {language === 'zh' ? '条记录' : 'total entries'}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/end-of-day')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <Moon className="w-3.5 h-3.5" />
              {text.addEndOfDay}
            </button>
          </div>
        </div>

        {/* Survey Type Tabs */}
        <div className="flex gap-1 p-1 rounded-lg mb-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          {(['all', 'hourly', 'daily'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSurveyTypeTab(tab)}
              className="flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all"
              style={{
                backgroundColor: surveyTypeTab === tab ? 'white' : 'transparent',
                color: surveyTypeTab === tab ? 'var(--color-green)' : 'var(--text-secondary)',
                boxShadow: surveyTypeTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              {tab === 'all' ? `${text.tabAll} (${entries.length + dailySurveys.length})` :
               tab === 'hourly' ? `${text.tabHourly} (${entries.length})` :
               `${text.tabDaily} (${dailySurveys.length})`}
            </button>
          ))}
        </div>

        {/* Quick Stats - Clickable cards to switch tabs (always visible) */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div 
            className="p-4 rounded-xl cursor-pointer hover:shadow-sm transition-all"
            style={{ 
              backgroundColor: surveyTypeTab === 'hourly' ? 'rgba(16,185,129,0.1)' : 'var(--bg-secondary)', 
              border: surveyTypeTab === 'hourly' ? '2px solid var(--color-green)' : '1px solid var(--border-light)' 
            }}
            onClick={() => setSurveyTypeTab('hourly')}
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} style={{ color: 'var(--color-green)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {text.tabHourly}
              </span>
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-green)' }}>
              {entries.length}
            </div>
          </div>
          
          <div 
            className="p-4 rounded-xl cursor-pointer hover:shadow-sm transition-all"
            style={{ 
              backgroundColor: surveyTypeTab === 'daily' ? 'rgba(139,92,246,0.1)' : 'var(--bg-secondary)', 
              border: surveyTypeTab === 'daily' ? '2px solid #8b5cf6' : '1px solid var(--border-light)' 
            }}
            onClick={() => setSurveyTypeTab('daily')}
          >
            <div className="flex items-center gap-2 mb-2">
              <Moon size={18} style={{ color: '#8b5cf6' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {text.tabDaily}
              </span>
            </div>
            <div className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>
              {dailySurveys.length}
            </div>
          </div>
        </div>

        {/* Hourly entries section - hidden when daily tab is selected */}
        {surveyTypeTab !== 'daily' && (
          <>
        {/* View Mode Content */}
        {viewMode === 'week' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              {text.week} {selectedWeek}
            </h2>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 7].map(day => {
                const dayStats = getDayStats(day);
                return (
                  <div 
                    key={day}
                    onClick={() => {
                      setSelectedDay(day);
                      setViewMode('day');
                    }}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg cursor-pointer hover:shadow-sm transition-all gap-2 sm:gap-0"
                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}
                  >
                    <div>
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {text.day} {day}{text.dayUnit}
                      </div>
                      <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                        {dayStats.total} {t('entries')}
                      </div>
                    </div>
                    <div className="flex gap-4 items-center w-full sm:w-auto justify-between sm:justify-start">
                      <div className="text-sm" style={{ color: 'var(--color-green)' }}>
                        {dayStats.total} {t('entries')}
                      </div>
                      <ChevronRight style={{ color: 'var(--text-secondary)', width: 'clamp(1.25rem, 3vw, 1.5rem)', height: 'clamp(1.25rem, 3vw, 1.5rem)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'category' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => {
                  setViewMode('week');
                  setSelectedCategory('all');
                }}
                className="p-2 rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
              </button>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {text.byCategory}
              </h2>
            </div>
            <div className="space-y-4">
              {selectedCategory !== 'all' ? (
                entries
                  .filter(e => e.entry_type === selectedCategory)
                  .slice(0, 10)
                  .map(entry => renderEntryCard(entry))
              ) : (
                <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                  {t('selectCategoryToView')}
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'time' && selectedTimePeriod && (
          <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => {
                  setViewMode('week');
                  setSelectedTimePeriod(null);
                }}
                className="p-2 rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
              </button>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {text[selectedTimePeriod as keyof typeof text]}
              </h2>
            </div>
            <div className="space-y-4">
              {entries
                .filter(e => {
                  const hour = new Date(e.entry_timestamp).getHours();
                  if (selectedTimePeriod === 'morning') return hour >= 6 && hour < 12;
                  if (selectedTimePeriod === 'afternoon') return hour >= 12 && hour < 17;
                  if (selectedTimePeriod === 'evening') return hour >= 17 && hour < 21;
                  if (selectedTimePeriod === 'night') return hour >= 21 || hour < 6;
                  return false;
                })
                .map(entry => renderEntryCard(entry))}
            </div>
          </div>
        )}

        {viewMode === 'day' && selectedDay !== null && (
          <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setViewMode('week')}
                className="p-2 rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
              </button>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {text.day} {selectedDay}{text.dayUnit}
              </h2>
            </div>
            <div className="space-y-2">
              {Array.from({ length: 24 }, (_, i) => i).map(hour => {
                const slotEntries = getTimeSlotEntries(selectedDay, hour);
                const timeLabel = `${hour.toString().padStart(2, '0')}:00`;
                const periodLabel = hour % 6 === 0 ? getTimeSlotLabel(hour) : null;

                return (
                  <div key={hour} className="relative">
                    {periodLabel && (
                      <div className="text-sm font-semibold mb-2 mt-4" style={{ color: 'var(--text-secondary)' }}>
                        {periodLabel}
                      </div>
                    )}
                    
                    <div className="flex items-start gap-4">
                      {/* Time Label */}
                      <div className="text-sm font-medium pt-2" style={{ color: 'var(--text-muted)', minWidth: 'clamp(3rem, 8vw, 4rem)' }}>
                        {timeLabel}
                      </div>

                      {/* Timeline Line and Content */}
                      <div className="flex-1 relative">
                        {/* Vertical Line */}
                        <div
                          className="absolute left-3 top-0 bottom-0 w-0.5"
                          style={{ backgroundColor: 'var(--border-light)' }}
                        />

                        {/* Hour Dot */}
                        <div
                          className={`absolute left-1.5 top-2 rounded-full border-2 ${
                            slotEntries.length > 0 ? '' : 'bg-white'
                          }`}
                          style={{
                            width: 'clamp(0.875rem, 2vw, 1rem)',
                            height: 'clamp(0.875rem, 2vw, 1rem)',
                            borderColor: slotEntries.length > 0 ? getCategoryColor(slotEntries[0].entry_type) : 'var(--border-light)',
                            backgroundColor: slotEntries.length > 0 ? getCategoryColor(slotEntries[0].entry_type) : 'white'
                          }}
                        />

                        {/* Entries */}
                        <div className="ml-10 space-y-2 min-h-[40px]">
                          {slotEntries.length > 0 ? (
                            slotEntries.map(entry => renderEntryCard(entry))
                          ) : (
                            <div className="py-2">
                              {/* Empty slot */}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};

export default Summary;
