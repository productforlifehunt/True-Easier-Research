import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useStateManagement';
import { BarChart3, TrendingUp, Clock, Users, Calendar, Filter, ChevronRight, Heart, MessageCircle, Wrench, Trash2, Edit2, ArrowLeft } from 'lucide-react';
import { dataService } from '../lib/dataService';
import { useLanguage } from '../hooks/useLanguage';
import DesktopHeader from '../components/DesktopHeader';
import MobileHeader from '../components/MobileHeader';
import AuthModal from '../components/AuthModal';

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
  entry_timestamp: string;
}

const Summary: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<SurveyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'day' | 'category' | 'time'>('week');
  
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
    struggle: '困难'
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
    struggle: 'Struggle'
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
      const { data, error } = await supabase
        .from('survey_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_timestamp', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
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
        {/* Week Selector */}
        <div className="mb-4 -mx-3 px-3 overflow-x-auto">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {text.title}
          </h1>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div 
            className="p-4 rounded-xl cursor-pointer hover:shadow-sm transition-all min-h-[80px]"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}
            onClick={() => {
              setSelectedCategory('timeBased');
              setViewMode('category');
            }}
          >
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-green)' }}>
              {stats.timeBased}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {text.activities}
            </div>
          </div>
          
          <div 
            className="p-4 rounded-xl cursor-pointer hover:shadow-sm transition-all min-h-[80px]"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}
            onClick={() => {
              setSelectedCategory('general');
              setViewMode('category');
            }}
          >
            <div className="text-2xl font-bold mb-1" style={{ color: '#fb923c' }}>
              {stats.general}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {text.general}
            </div>
          </div>
        </div>

        {/* Time Distribution */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            {text.byTime}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(timeStats).map(([period, count]) => (
              <div 
                key={period}
                className="text-center p-3 rounded-lg cursor-pointer hover:shadow-sm transition-all"
                style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}
                onClick={() => {
                  setSelectedTimePeriod(period);
                  setViewMode('time');
                }}
              >
                <Clock className="mx-auto mb-2" style={{ color: 'var(--color-green)', width: 'clamp(1.25rem, 3vw, 1.5rem)', height: 'clamp(1.25rem, 3vw, 1.5rem)' }} />
                <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {count}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {text[period as keyof typeof text]}
                </div>
              </div>
            ))}
          </div>
        </div>

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
                  .map(entry => (
                    <div 
                      key={entry.id}
                      className="p-4 rounded-lg cursor-pointer hover:shadow-sm transition-all"
                      style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span
                            className="text-xs font-medium px-2 py-1 rounded"
                            style={{
                              backgroundColor: getCategoryColor(entry.entry_type),
                              color: 'white'
                            }}
                          >
                            {entry.entry_type === 'care_activity' ? text.careActivity :
                             entry.entry_type === 'care_need' ? text.careNeed : text.struggle}
                          </span>
                          <p className="text-sm mt-2" style={{ color: 'var(--text-primary)' }}>
                            {entry.description}
                          </p>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                            {new Date(entry.entry_timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
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
                .map(entry => (
                  <div 
                    key={entry.id}
                    className="p-4 rounded-lg cursor-pointer hover:shadow-sm transition-all"
                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <span
                          className="text-xs font-medium px-2 py-1 rounded"
                          style={{
                            backgroundColor: getCategoryColor(entry.entry_type),
                            color: 'white'
                          }}
                        >
                          {entry.entry_type === 'care_activity' ? text.careActivity :
                           entry.entry_type === 'care_need' ? text.careNeed : text.struggle}
                        </span>
                        <p className="text-sm mt-2" style={{ color: 'var(--text-primary)' }}>
                          {entry.description}
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                          {new Date(entry.entry_timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
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
                            slotEntries.map(entry => (
                              <div
                                key={entry.id}
                                className="p-3 rounded-lg cursor-pointer hover:shadow-sm transition-all"
                                style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <span
                                      className="text-xs font-medium px-2 py-1 rounded"
                                      style={{
                                        backgroundColor: getCategoryColor(entry.entry_type),
                                        color: 'white'
                                      }}
                                    >
                                      {entry.entry_type === 'care_activity' ? text.careActivity :
                                       entry.entry_type === 'care_need' ? text.careNeed : text.struggle}
                                    </span>
                                    <p className="text-sm mt-2" style={{ color: 'var(--text-primary)' }}>
                                      {entry.description}
                                    </p>
                                    {entry.time_spent && (
                                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                        {entry.time_spent} min
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
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
      </div>
    </div>
  );
};

export default Summary;
