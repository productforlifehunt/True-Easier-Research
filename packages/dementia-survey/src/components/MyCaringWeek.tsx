import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, ChevronDown, Filter, Users, Heart, AlertCircle,
  MessageCircle, Wrench, BarChart3, Sun, Moon, Sunrise, Sunset, Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import AddEntry from '../pages/AddEntry';

interface SurveyEntry {
  id: number;
  user_id: string;
  entry_type?: string;
  entry_timestamp?: string;
  created_at?: string;
  description: string;
  activity_categories?: string[];
  time_spent?: number;
  emotional_impact?: string;
  your_mood?: string;
  event_stress_rating?: number;
  daily_burden_rating?: number;
  urgency_level?: string;
  people_with?: string;
  people_want_with?: string;
  people_challenges?: string;
  task_difficulty?: number;
  challenge_types?: string[];
  challenges_faced?: string;
  resources_using?: string;
  resources_wanted?: string;
  difficulties_challenges?: string;
  tools_using?: string;
  tools_wanted?: string;
  communication_challenges?: string;
  collaboration_challenges?: string;
  knowledge_gaps?: string;
  liability_concerns?: string;
  support_needed?: string;
  help_reaching_challenges?: string;
}

interface NetworkMember {
  id: string;
  name: string;
  relationship?: string;
  color?: string;
}

interface Props {
  language: string;
  networkMembers?: NetworkMember[];
}

// Activity labels with full examples from PMC7098392 Table 3
const ACTIVITY_LABELS: Record<string, { en: string; zh: string }> = {
  'adl_clinical': { en: 'Clinical (medication, catheter, wound care)', zh: '临床 (给药、导尿管、伤口护理)' },
  'adl_functional': { en: 'Functional (feeding, bathing, dressing, grooming, toileting, walking)', zh: '功能性 (进食、洗澡、穿衣、梳洗、如厕、行走)' },
  'adl_cognitive': { en: 'Cognitive (orientation, conversation, answering questions)', zh: '认知 (定向、对话、回答问题)' },
  'iadl_decision': { en: 'Decision Making (medical, financial, non-medical)', zh: '决策 (医疗、财务、非医疗)' },
  'iadl_housekeeping': { en: 'Housekeeping (meals, cleaning, yard, shopping, wardrobe)', zh: '家务 (备餐、清洁、庭院、购物、衣物)' },
  'iadl_info': { en: 'Info Management (coordinating, care team, finances)', zh: '信息管理 (协调、医护团队、财务)' },
  'iadl_logistics': { en: 'Logistics (scheduling, reminding, deliveries)', zh: '后勤 (预约、提醒、送达)' },
  'iadl_transport': { en: 'Transportation (driving, rides, appointments)', zh: '交通 (驾车、接送、陪诊)' },
  'maint_companion': { en: 'Companionship (social, games, music, walks, outings)', zh: '陪伴 (社交、游戏、音乐、散步、外出)' },
  'maint_caregiver': { en: 'Caregiver Support (emotional, filling in/respite)', zh: '照护者支持 (情感、替班/喘息)' },
  'maint_vigilance': { en: 'Vigilance (supervision, safety, preventing wandering)', zh: '监护 (监督、安全、防走失)' },
  'maint_pet': { en: 'Pet Care (walking, feeding, vet visits)', zh: '宠物照顾 (遛宠物、喂食、看兽医)' },
  'maint_skill': { en: 'Skill Development (classes, reading, learning)', zh: '技能发展 (课程、阅读、学习)' },
};

// Challenge type labels
const CHALLENGE_LABELS: Record<string, { en: string; zh: string }> = {
  'knowledge_symptoms': { en: 'Dementia symptoms', zh: '痴呆症状' },
  'patient_condition': { en: 'Patient condition', zh: '患者病情' },
  'condition_updates': { en: 'Condition updates', zh: '病情更新' },
  'coordination': { en: 'Coordination', zh: '协调' },
  'time_constraints': { en: 'Time', zh: '时间' },
  'emotional_stress': { en: 'Emotional', zh: '情绪' },
  'physical_demands': { en: 'Physical', zh: '体力' },
  'communication': { en: 'Communication', zh: '沟通' },
  'liability_safety': { en: 'Safety', zh: '安全' },
  'privacy': { en: 'Privacy', zh: '隐私' },
  'other': { en: 'Other', zh: '其他' },
};

// Time of day periods
const TIME_PERIODS = [
  { value: 'morning', en: 'Morning', zh: '早上', icon: Sunrise, hours: [6, 12] },
  { value: 'afternoon', en: 'Afternoon', zh: '下午', icon: Sun, hours: [12, 18] },
  { value: 'evening', en: 'Evening', zh: '傍晚', icon: Sunset, hours: [18, 21] },
  { value: 'night', en: 'Night', zh: '夜间', icon: Moon, hours: [21, 6] },
];

export default function MyCaringWeek({ language, networkMembers = [] }: Props) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<SurveyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  // All 6 filters (added day filter)
  const [dayFilter, setDayFilter] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState<string | null>(null);
  const [peopleFilter, setPeopleFilter] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<string | null>(null);
  const [challengeLevel, setChallengeLevel] = useState<number>(0);
  const [challengeTypeFilter, setChallengeTypeFilter] = useState<string | null>(null);
  const [showAddEntry, setShowAddEntry] = useState(false);
  
  const zh = language === 'zh';

  useEffect(() => {
    if (user?.id) fetchEntries();
  }, [user?.id]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('survey_entries')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasContent = (val?: string | string[]) => {
    if (Array.isArray(val)) return val.length > 0;
    return val && val.trim().length > 0;
  };

  // Get time period from entry
  const getTimePeriod = (entry: SurveyEntry): string | null => {
    const timestamp = entry.entry_timestamp || entry.created_at;
    if (!timestamp) return null;
    const hour = new Date(timestamp).getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 21) return 'evening';
    return 'night';
  };

  // Get unique activities
  const getUniqueActivities = (): { value: string; count: number }[] => {
    const counts: Record<string, number> = {};
    entries.forEach(e => {
      (e.activity_categories || []).forEach(cat => {
        counts[cat] = (counts[cat] || 0) + 1;
      });
    });
    return Object.entries(counts).map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count);
  };

  // Get unique challenges
  const getUniqueChallenges = (): { value: string; count: number }[] => {
    const counts: Record<string, number> = {};
    entries.forEach(e => {
      (e.challenge_types || []).forEach(type => {
        counts[type] = (counts[type] || 0) + 1;
      });
    });
    return Object.entries(counts).map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count);
  };

  // Get people with counts
  const getPeopleWithCounts = (): { name: string; count: number; color?: string }[] => {
    const counts: Record<string, number> = {};
    entries.forEach(e => {
      if (hasContent(e.people_with)) {
        e.people_with!.split(/[,，、]/g).map(p => p.trim()).filter(p => p).forEach(name => {
          counts[name] = (counts[name] || 0) + 1;
        });
      }
    });
    networkMembers.forEach(m => { if (!counts[m.name]) counts[m.name] = 0; });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, color: networkMembers.find(m => m.name === name)?.color }))
      .sort((a, b) => b.count - a.count);
  };

  // Count by time period
  const getTimeCounts = (): Record<string, number> => {
    const counts: Record<string, number> = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    entries.forEach(e => {
      const period = getTimePeriod(e);
      if (period) counts[period]++;
    });
    return counts;
  };

  // Get day string from entry (YYYY-MM-DD)
  const getDay = (entry: SurveyEntry): string | null => {
    const timestamp = entry.entry_timestamp || entry.created_at;
    if (!timestamp) return null;
    return new Date(timestamp).toISOString().split('T')[0];
  };

  // Get unique days with counts
  const getDayCounts = (): { day: string; label: string; count: number }[] => {
    const counts: Record<string, number> = {};
    entries.forEach(e => {
      const day = getDay(e);
      if (day) counts[day] = (counts[day] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([day, count]) => ({
        day,
        label: new Date(day).toLocaleDateString(zh ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', weekday: 'short' }),
        count
      }))
      .sort((a, b) => b.day.localeCompare(a.day)); // Most recent first
  };

  const justMeCount = entries.filter(e => !hasContent(e.people_with)).length;
  const getTaskDifficulty = (entry: SurveyEntry): number => {
    if (entry.task_difficulty) return entry.task_difficulty;
    const mapping: Record<string, number> = { 'low': 1, 'medium': 2, 'high': 4, 'urgent': 5 };
    return mapping[entry.urgency_level || ''] || 3;
  };

  // Apply all filters
  const filteredEntries = entries.filter(entry => {
    if (dayFilter && getDay(entry) !== dayFilter) return false;
    if (activityFilter && !(entry.activity_categories || []).includes(activityFilter)) return false;
    if (peopleFilter === 'just_me' && hasContent(entry.people_with)) return false;
    if (peopleFilter && peopleFilter !== 'just_me') {
      const people = (entry.people_with || '').toLowerCase();
      if (!people.includes(peopleFilter.toLowerCase())) return false;
    }
    if (timeFilter && getTimePeriod(entry) !== timeFilter) return false;
    if (challengeLevel > 0 && getTaskDifficulty(entry) < challengeLevel) return false;
    if (challengeTypeFilter && !(entry.challenge_types || []).includes(challengeTypeFilter)) return false;
    return true;
  });

  const dayCounts = getDayCounts();

  const uniqueActivities = getUniqueActivities();
  const uniqueChallenges = getUniqueChallenges();
  const peopleWithCounts = getPeopleWithCounts();
  const timeCounts = getTimeCounts();

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(zh ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' });
  };

  const getDifficultyColor = (level: number) => level >= 4 ? '#DC2626' : level >= 3 ? '#F59E0B' : '#10B981';
  const getDifficultyLabel = (level: number) => {
    const labels = zh ? ['', '无挑战', '轻微', '一般', '困难', '极难'] : ['', 'None', 'Minor', 'Moderate', 'Difficult', 'Extreme'];
    return labels[level] || '';
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent" /></div>;
  }

  // Tab button
  const TabButton = ({ active, onClick, children, count, color }: { active: boolean; onClick: () => void; children: React.ReactNode; count?: number; color?: string }) => (
    <button
      onClick={onClick}
      className="px-2 py-1 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap flex items-center gap-1"
      style={{ 
        background: active ? (color || 'var(--color-green)') : 'rgba(16,185,129,0.08)',
        color: active ? 'white' : 'var(--text-primary)',
        border: active ? 'none' : '1px solid var(--border-light)'
      }}
    >
      {children}
      {count !== undefined && <span className="opacity-70">({count})</span>}
    </button>
  );

  // Entry Card
  const EntryCard = ({ entry }: { entry: SurveyEntry }) => {
    const isExpanded = expandedId === entry.id;
    const difficulty = getTaskDifficulty(entry);
    const cats = entry.activity_categories || [];
    const challenges = entry.challenge_types || [];
    const people = (entry.people_with || '').split(/[,，、]/g).map(p => p.trim()).filter(p => p);

    return (
      <div className="rounded-xl border-2 transition-all overflow-hidden" style={{ borderColor: isExpanded ? 'var(--color-green)' : 'var(--border-light)', background: 'white' }}>
        <div className="p-3 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpandedId(isExpanded ? null : entry.id)}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: getDifficultyColor(difficulty) }}>{difficulty}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm line-clamp-2 mb-1" style={{ color: 'var(--text-primary)' }}>{entry.description || (zh ? '无描述' : 'No description')}</p>
              <div className="flex flex-wrap items-center gap-2 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                <span className="flex items-center gap-1"><Calendar size={10} />{formatDate(entry.entry_timestamp || entry.created_at)}</span>
                {entry.time_spent && entry.time_spent > 0 && <span className="flex items-center gap-1"><Clock size={10} />{entry.time_spent}m</span>}
                {people.length > 0 && <span className="flex items-center gap-1 text-cyan-600"><Users size={10} />{people.length}</span>}
              </div>
              {cats.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {cats.slice(0, 2).map(cat => <span key={cat} className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>{ACTIVITY_LABELS[cat]?.[zh ? 'zh' : 'en'] || cat}</span>)}
                  {cats.length > 2 && <span className="text-[9px] text-gray-400">+{cats.length - 2}</span>}
                </div>
              )}
            </div>
            <ChevronDown size={16} className={`transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} style={{ color: 'var(--text-secondary)' }} />
          </div>
        </div>
        {isExpanded && (
          <div className="border-t" style={{ borderColor: 'var(--border-light)' }}>
            <div className="px-3 py-2 flex items-center gap-2 text-xs" style={{ background: `${getDifficultyColor(difficulty)}10` }}>
              <AlertCircle size={14} style={{ color: getDifficultyColor(difficulty) }} />
              <span style={{ color: getDifficultyColor(difficulty) }}>{zh ? '挑战等级' : 'Challenge'}: {difficulty}/5 - {getDifficultyLabel(difficulty)}</span>
            </div>
            <div className="p-3 space-y-3" style={{ background: '#fafafa' }}>
              {cats.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-semibold uppercase mb-1" style={{ color: '#3B82F6' }}><BarChart3 size={12} />{zh ? '活动' : 'Activities'}</div>
                  <div className="flex flex-wrap gap-1">{cats.map(cat => <span key={cat} className="px-2 py-1 rounded text-[10px]" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>{ACTIVITY_LABELS[cat]?.[zh ? 'zh' : 'en'] || cat}</span>)}</div>
                </div>
              )}
              {people.length > 0 && (
                <div className="bg-white rounded-lg p-2 border" style={{ borderColor: 'var(--border-light)' }}>
                  <div className="flex items-center gap-1 text-[10px] font-semibold uppercase mb-1" style={{ color: '#06B6D4' }}><Users size={12} />{zh ? '人员' : 'People'}</div>
                  <div className="flex flex-wrap gap-1">{people.map(p => <span key={p} className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: 'rgba(6,182,212,0.1)', color: '#06B6D4' }}>{p}</span>)}</div>
                </div>
              )}
              {(challenges.length > 0 || hasContent(entry.challenges_faced)) && (
                <div className="bg-white rounded-lg p-2 border" style={{ borderColor: 'var(--border-light)' }}>
                  <div className="text-[10px] font-semibold uppercase mb-1" style={{ color: '#EF4444' }}>{zh ? '挑战' : 'Challenges'}</div>
                  {challenges.length > 0 && <div className="flex flex-wrap gap-1 mb-1">{challenges.map(c => <span key={c} className="px-2 py-0.5 rounded text-[10px]" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>{CHALLENGE_LABELS[c]?.[zh ? 'zh' : 'en'] || c}</span>)}</div>}
                  {hasContent(entry.challenges_faced) && <p className="text-[10px]" style={{ color: 'var(--text-primary)' }}>{entry.challenges_faced}</p>}
                </div>
              )}
              {(hasContent(entry.resources_using) || hasContent(entry.resources_wanted) || hasContent(entry.tools_using) || hasContent(entry.tools_wanted)) && (
                <div className="bg-white rounded-lg p-2 border" style={{ borderColor: 'var(--border-light)' }}>
                  <div className="flex items-center gap-1 text-[10px] font-semibold uppercase mb-1" style={{ color: '#8B5CF6' }}><Wrench size={12} />{zh ? '资源' : 'Resources'}</div>
                  {(hasContent(entry.resources_using) || hasContent(entry.tools_using)) && <p className="text-[10px]"><span className="font-medium" style={{ color: '#6B7280' }}>{zh ? '使用: ' : 'Using: '}</span>{entry.resources_using || entry.tools_using}</p>}
                  {(hasContent(entry.resources_wanted) || hasContent(entry.tools_wanted)) && <p className="text-[10px]"><span className="font-medium" style={{ color: '#8B5CF6' }}>{zh ? '需要: ' : 'Needed: '}</span>{entry.resources_wanted || entry.tools_wanted}</p>}
                </div>
              )}
              {(entry.event_stress_rating !== undefined || hasContent(entry.emotional_impact) || hasContent(entry.your_mood)) && (
                <div className="flex items-center gap-2 text-[10px] p-2 rounded-lg" style={{ background: 'rgba(236,72,153,0.08)' }}>
                  <Heart size={12} style={{ color: '#EC4899' }} />
                  <span style={{ color: '#EC4899' }}>
                    {entry.event_stress_rating !== undefined 
                      ? `${zh ? '压力' : 'Stress'}: ${entry.event_stress_rating > 0 ? '+' : ''}${entry.event_stress_rating}`
                      : (entry.emotional_impact || entry.your_mood)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Header with Add Entry button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-green)' }}>{zh ? '我的照护周' : 'My Caring Week'}</h3>
          <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{filteredEntries.length}/{entries.length} {zh ? '条记录' : 'entries'}</p>
        </div>
        <button
          onClick={() => setShowAddEntry(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-white flex items-center gap-1"
          style={{ backgroundColor: 'var(--color-green)' }}
        >
          + {zh ? '添加记录' : 'Add Entry'}
        </button>
      </div>

      {/* Add Entry Popup Modal */}
      {showAddEntry && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddEntry(false); }}
        >
          <div className="w-full max-w-lg mx-4 rounded-xl shadow-xl overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)', maxHeight: 'calc(100vh - 96px)', marginTop: '48px', marginBottom: '48px' }}>
            <AddEntry 
              embedded 
              onComplete={() => {
                setShowAddEntry(false);
                fetchEntries();
              }} 
            />
          </div>
        </div>
      )}

      {/* FILTER 0: Day - ALWAYS show first */}
      {dayCounts.length > 0 && (
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Calendar size={12} style={{ color: 'var(--color-green)' }} />
            <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>{zh ? '日期' : 'Day'}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            <TabButton active={dayFilter === null} onClick={() => setDayFilter(null)} count={entries.length}>{zh ? '全部' : 'All'}</TabButton>
            {dayCounts.map(({ day, label, count }) => (
              <TabButton key={day} active={dayFilter === day} onClick={() => setDayFilter(dayFilter === day ? null : day)} count={count} color="var(--color-green)">
                {label}
              </TabButton>
            ))}
          </div>
        </div>
      )}

      {/* FILTER 1: Activity - ALWAYS show */}
      <div>
        <div className="flex items-center gap-1 mb-1">
          <BarChart3 size={12} style={{ color: '#3B82F6' }} />
          <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>{zh ? '活动类型' : 'Activity'}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          <TabButton active={activityFilter === null} onClick={() => setActivityFilter(null)} count={entries.length}>{zh ? '全部' : 'All'}</TabButton>
          {uniqueActivities.map(({ value, count }) => (
            <TabButton key={value} active={activityFilter === value} onClick={() => setActivityFilter(activityFilter === value ? null : value)} count={count} color="#3B82F6">
              {ACTIVITY_LABELS[value]?.[zh ? 'zh' : 'en'] || value}
            </TabButton>
          ))}
        </div>
      </div>

      {/* FILTER 2: People - ALWAYS show */}
      <div>
        <div className="flex items-center gap-1 mb-1">
          <Users size={12} style={{ color: '#06B6D4' }} />
          <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>{zh ? '参与人员' : 'People'}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          <TabButton active={peopleFilter === null} onClick={() => setPeopleFilter(null)} count={entries.length}>{zh ? '全部' : 'All'}</TabButton>
          <TabButton active={peopleFilter === 'just_me'} onClick={() => setPeopleFilter(peopleFilter === 'just_me' ? null : 'just_me')} count={justMeCount} color="#6B7280">👤 {zh ? '仅自己' : 'Just Me'}</TabButton>
          {peopleWithCounts.filter(p => p.count > 0 || networkMembers.some(m => m.name === p.name)).map(({ name, count, color }) => (
            <TabButton key={name} active={peopleFilter === name} onClick={() => setPeopleFilter(peopleFilter === name ? null : name)} count={count} color={color || '#06B6D4'}>{name}</TabButton>
          ))}
        </div>
      </div>

      {/* FILTER 3: Time of Day - ALWAYS show */}
      <div>
        <div className="flex items-center gap-1 mb-1">
          <Clock size={12} style={{ color: '#F59E0B' }} />
          <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>{zh ? '时间段' : 'Time of Day'}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          <TabButton active={timeFilter === null} onClick={() => setTimeFilter(null)} count={entries.length}>{zh ? '全部' : 'All'}</TabButton>
          {TIME_PERIODS.map(({ value, en, zh: zhLabel, icon: Icon }) => (
            <TabButton key={value} active={timeFilter === value} onClick={() => setTimeFilter(timeFilter === value ? null : value)} count={timeCounts[value]} color="#F59E0B">
              <Icon size={10} /> {zh ? zhLabel : en}
            </TabButton>
          ))}
        </div>
      </div>

      {/* FILTER 4: Challenge Level - ALWAYS show */}
      <div className="p-2 rounded-lg border" style={{ borderColor: 'var(--border-light)', background: 'white' }}>
        <div className="flex items-center gap-2 mb-1">
          <Filter size={12} style={{ color: 'var(--color-green)' }} />
          <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>{zh ? '挑战等级' : 'Challenge Level'}</span>
          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-green)' }}>{challengeLevel === 0 ? (zh ? '全部' : 'All') : `≥${challengeLevel}`}</span>
        </div>
        <input type="range" min="0" max="5" value={challengeLevel} onChange={(e) => setChallengeLevel(parseInt(e.target.value))} className="w-full h-1.5 rounded-lg appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, var(--color-green) ${challengeLevel * 20}%, #e5e7eb ${challengeLevel * 20}%)`, accentColor: 'var(--color-green)' }} />
        <div className="flex justify-between text-[9px] mt-0.5" style={{ color: 'var(--text-secondary)' }}><span>{zh ? '全部' : 'All'}</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div>
      </div>

      {/* FILTER 5: Challenge Type - ALWAYS show */}
      <div>
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[10px] font-medium" style={{ color: '#EF4444' }}>{zh ? '挑战类型' : 'Challenge Type'}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          <TabButton active={challengeTypeFilter === null} onClick={() => setChallengeTypeFilter(null)} count={entries.length}>{zh ? '全部' : 'All'}</TabButton>
          {uniqueChallenges.map(({ value, count }) => (
            <TabButton key={value} active={challengeTypeFilter === value} onClick={() => setChallengeTypeFilter(challengeTypeFilter === value ? null : value)} count={count} color="#EF4444">
              {CHALLENGE_LABELS[value]?.[zh ? 'zh' : 'en'] || value}
            </TabButton>
          ))}
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-6"><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{zh ? '没有符合筛选条件的记录' : 'No entries match filters'}</p></div>
        ) : (
          filteredEntries.map(entry => <EntryCard key={entry.id} entry={entry} />)
        )}
      </div>
    </div>
  );
}
