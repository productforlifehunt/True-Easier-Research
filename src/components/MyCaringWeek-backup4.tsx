import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, ChevronDown, Filter, Users, Heart, AlertCircle,
  MessageCircle, Wrench, BarChart3
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

// Survey Entry interface
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

// Activity category labels - remove prefixes, use clean names
const ACTIVITY_LABELS: Record<string, { en: string; zh: string }> = {
  'adl_clinical': { en: 'Clinical (medication, medical)', zh: '临床 (用药、医疗)' },
  'adl_functional': { en: 'Functional (eating, bathing)', zh: '功能性 (进食、洗澡)' },
  'adl_cognitive': { en: 'Cognitive (orientation)', zh: '认知 (定向)' },
  'iadl_decision': { en: 'Decision Making', zh: '决策' },
  'iadl_housekeeping': { en: 'Housekeeping (meals, cleaning)', zh: '家务 (餐食、清洁)' },
  'iadl_info': { en: 'Info Management', zh: '信息管理' },
  'iadl_logistics': { en: 'Logistics (scheduling)', zh: '后勤 (日程)' },
  'iadl_transport': { en: 'Transportation', zh: '交通' },
  'maint_companion': { en: 'Companionship', zh: '陪伴' },
  'maint_caregiver': { en: 'Caregiver Support', zh: '照护者支持' },
  'maint_vigilance': { en: 'Vigilance (safety)', zh: '监护 (安全)' },
  'maint_pet': { en: 'Pet Care', zh: '宠物照顾' },
  'maint_skill': { en: 'Skill Development', zh: '技能发展' },
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

export default function MyCaringWeek({ language, networkMembers = [] }: Props) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<SurveyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  // Filters - ordered: Activity → People → Challenge Level → Challenge Type
  const [activityFilter, setActivityFilter] = useState<string | null>(null);
  const [peopleFilter, setPeopleFilter] = useState<string | null>(null);
  const [challengeLevel, setChallengeLevel] = useState<number>(0);
  const [challengeTypeFilter, setChallengeTypeFilter] = useState<string | null>(null);
  
  const zh = language === 'zh';

  useEffect(() => {
    if (user?.id) {
      fetchEntries();
    }
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

  // Extract UNIQUE activity categories from user's ACTUAL entries
  const getUniqueActivities = (): { value: string; count: number }[] => {
    const activityCounts: Record<string, number> = {};
    entries.forEach(e => {
      if (e.activity_categories && Array.isArray(e.activity_categories)) {
        e.activity_categories.forEach(cat => {
          activityCounts[cat] = (activityCounts[cat] || 0) + 1;
        });
      }
    });
    return Object.entries(activityCounts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Extract UNIQUE challenge types from user's ACTUAL entries
  const getUniqueChallenges = (): { value: string; count: number }[] => {
    const challengeCounts: Record<string, number> = {};
    entries.forEach(e => {
      if (e.challenge_types && Array.isArray(e.challenge_types)) {
        e.challenge_types.forEach(type => {
          challengeCounts[type] = (challengeCounts[type] || 0) + 1;
        });
      }
    });
    return Object.entries(challengeCounts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Get people from entries + network members
  const getPeopleWithCounts = (): { name: string; count: number; color?: string }[] => {
    const peopleCounts: Record<string, number> = {};
    
    // Count from entries
    entries.forEach(e => {
      if (hasContent(e.people_with)) {
        const names = e.people_with!.split(/[,，、]/g).map(p => p.trim()).filter(p => p);
        names.forEach(name => {
          peopleCounts[name] = (peopleCounts[name] || 0) + 1;
        });
      }
    });
    
    // Add network members with 0 count if not in entries
    networkMembers.forEach(m => {
      if (!peopleCounts[m.name]) {
        peopleCounts[m.name] = 0;
      }
    });
    
    return Object.entries(peopleCounts)
      .map(([name, count]) => ({
        name,
        count,
        color: networkMembers.find(m => m.name === name)?.color
      }))
      .sort((a, b) => b.count - a.count);
  };

  // Count entries without people (Just Me)
  const getJustMeCount = (): number => {
    return entries.filter(e => !hasContent(e.people_with)).length;
  };

  // Get task difficulty from entry
  const getTaskDifficulty = (entry: SurveyEntry): number => {
    if (entry.task_difficulty) return entry.task_difficulty;
    const mapping: Record<string, number> = { 'low': 1, 'medium': 2, 'high': 4, 'urgent': 5 };
    return mapping[entry.urgency_level || ''] || 3;
  };

  // Filter entries based on all active filters
  const filteredEntries = entries.filter(entry => {
    // Activity filter
    if (activityFilter) {
      const cats = entry.activity_categories || [];
      if (!cats.includes(activityFilter)) return false;
    }
    
    // People filter
    if (peopleFilter === 'just_me') {
      if (hasContent(entry.people_with)) return false;
    } else if (peopleFilter) {
      const people = (entry.people_with || '').split(/[,，、]/g).map(p => p.trim().toLowerCase());
      if (!people.some(p => p.includes(peopleFilter.toLowerCase()))) return false;
    }
    
    // Challenge level filter
    if (challengeLevel > 0 && getTaskDifficulty(entry) < challengeLevel) return false;
    
    // Challenge type filter
    if (challengeTypeFilter) {
      const types = entry.challenge_types || [];
      if (!types.includes(challengeTypeFilter)) return false;
    }
    
    return true;
  });

  const uniqueActivities = getUniqueActivities();
  const uniqueChallenges = getUniqueChallenges();
  const peopleWithCounts = getPeopleWithCounts();
  const justMeCount = getJustMeCount();

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(zh ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' });
  };

  const getDifficultyColor = (level: number) => {
    if (level >= 4) return '#DC2626';
    if (level >= 3) return '#F59E0B';
    return '#10B981';
  };

  const getDifficultyLabel = (level: number) => {
    const labels = zh 
      ? ['', '无挑战', '轻微', '一般', '困难', '极难']
      : ['', 'None', 'Minor', 'Moderate', 'Difficult', 'Extreme'];
    return labels[level] || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent" />
      </div>
    );
  }

  // Tab button component
  const TabButton = ({ 
    active, 
    onClick, 
    children, 
    count,
    color
  }: { 
    active: boolean; 
    onClick: () => void; 
    children: React.ReactNode;
    count?: number;
    color?: string;
  }) => (
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
      <div 
        className="rounded-xl border-2 transition-all overflow-hidden"
        style={{ 
          borderColor: isExpanded ? 'var(--color-green)' : 'var(--border-light)',
          background: 'white'
        }}
      >
        {/* Header */}
        <div 
          className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setExpandedId(isExpanded ? null : entry.id)}
        >
          <div className="flex items-start gap-3">
            <div 
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: getDifficultyColor(difficulty) }}
            >
              {difficulty}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm line-clamp-2 mb-1" style={{ color: 'var(--text-primary)' }}>
                {entry.description || (zh ? '无描述' : 'No description')}
              </p>
              
              <div className="flex flex-wrap items-center gap-2 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                <span className="flex items-center gap-1">
                  <Calendar size={10} />
                  {formatDate(entry.entry_timestamp || entry.created_at)}
                </span>
                {entry.time_spent && entry.time_spent > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {entry.time_spent}m
                  </span>
                )}
                {people.length > 0 && (
                  <span className="flex items-center gap-1 text-cyan-600">
                    <Users size={10} />
                    {people.length}
                  </span>
                )}
              </div>
              
              {/* Activity tags */}
              {cats.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {cats.slice(0, 2).map(cat => (
                    <span 
                      key={cat}
                      className="px-1.5 py-0.5 rounded text-[9px]"
                      style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}
                    >
                      {ACTIVITY_LABELS[cat]?.[zh ? 'zh' : 'en']?.split('(')[0].trim() || cat}
                    </span>
                  ))}
                  {cats.length > 2 && <span className="text-[9px] text-gray-400">+{cats.length - 2}</span>}
                </div>
              )}
            </div>
            
            <ChevronDown 
              size={16} 
              className={`transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
              style={{ color: 'var(--text-secondary)' }}
            />
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t" style={{ borderColor: 'var(--border-light)' }}>
            {/* Difficulty Bar */}
            <div className="px-3 py-2 flex items-center gap-2 text-xs" style={{ background: `${getDifficultyColor(difficulty)}10` }}>
              <AlertCircle size={14} style={{ color: getDifficultyColor(difficulty) }} />
              <span style={{ color: getDifficultyColor(difficulty) }}>
                {zh ? '挑战等级' : 'Challenge'}: {difficulty}/5 - {getDifficultyLabel(difficulty)}
              </span>
            </div>

            <div className="p-3 space-y-3" style={{ background: '#fafafa' }}>
              {/* Activities */}
              {cats.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-semibold uppercase mb-1" style={{ color: '#3B82F6' }}>
                    <BarChart3 size={12} />
                    {zh ? '活动类型' : 'Activities'}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {cats.map(cat => (
                      <span key={cat} className="px-2 py-1 rounded text-[10px]" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
                        {ACTIVITY_LABELS[cat]?.[zh ? 'zh' : 'en'] || cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* People */}
              {people.length > 0 && (
                <div className="bg-white rounded-lg p-2 border" style={{ borderColor: 'var(--border-light)' }}>
                  <div className="flex items-center gap-1 text-[10px] font-semibold uppercase mb-1" style={{ color: '#06B6D4' }}>
                    <Users size={12} />
                    {zh ? '参与人员' : 'People'}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {people.map(p => (
                      <span key={p} className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: 'rgba(6,182,212,0.1)', color: '#06B6D4' }}>
                        {p}
                      </span>
                    ))}
                  </div>
                  {hasContent(entry.people_want_with) && (
                    <p className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                      <span className="font-medium">{zh ? '希望帮忙: ' : 'Wish: '}</span>{entry.people_want_with}
                    </p>
                  )}
                </div>
              )}

              {/* Challenges */}
              {(challenges.length > 0 || hasContent(entry.challenges_faced)) && (
                <div className="bg-white rounded-lg p-2 border" style={{ borderColor: 'var(--border-light)' }}>
                  <div className="flex items-center gap-1 text-[10px] font-semibold uppercase mb-1" style={{ color: '#EF4444' }}>
                    <MessageCircle size={12} />
                    {zh ? '挑战' : 'Challenges'}
                  </div>
                  {challenges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1">
                      {challenges.map(c => (
                        <span key={c} className="px-2 py-0.5 rounded text-[10px]" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                          {CHALLENGE_LABELS[c]?.[zh ? 'zh' : 'en'] || c}
                        </span>
                      ))}
                    </div>
                  )}
                  {hasContent(entry.challenges_faced) && (
                    <p className="text-[10px]" style={{ color: 'var(--text-primary)' }}>{entry.challenges_faced}</p>
                  )}
                </div>
              )}

              {/* Resources */}
              {(hasContent(entry.resources_using) || hasContent(entry.resources_wanted) || hasContent(entry.tools_using) || hasContent(entry.tools_wanted)) && (
                <div className="bg-white rounded-lg p-2 border" style={{ borderColor: 'var(--border-light)' }}>
                  <div className="flex items-center gap-1 text-[10px] font-semibold uppercase mb-1" style={{ color: '#8B5CF6' }}>
                    <Wrench size={12} />
                    {zh ? '资源' : 'Resources'}
                  </div>
                  {(hasContent(entry.resources_using) || hasContent(entry.tools_using)) && (
                    <p className="text-[10px]"><span className="font-medium" style={{ color: '#6B7280' }}>{zh ? '使用: ' : 'Using: '}</span>{entry.resources_using || entry.tools_using}</p>
                  )}
                  {(hasContent(entry.resources_wanted) || hasContent(entry.tools_wanted)) && (
                    <p className="text-[10px]"><span className="font-medium" style={{ color: '#8B5CF6' }}>{zh ? '需要: ' : 'Needed: '}</span>{entry.resources_wanted || entry.tools_wanted}</p>
                  )}
                </div>
              )}

              {/* Emotional */}
              {(hasContent(entry.emotional_impact) || hasContent(entry.your_mood)) && (
                <div className="flex items-center gap-2 text-[10px] p-2 rounded-lg" style={{ background: 'rgba(236,72,153,0.08)' }}>
                  <Heart size={12} style={{ color: '#EC4899' }} />
                  <span style={{ color: '#EC4899' }}>{entry.emotional_impact || entry.your_mood}</span>
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
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ color: 'var(--color-green)' }}>
          {zh ? '我的照护周' : 'My Caring Week'}
        </h3>
        <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
          {filteredEntries.length}/{entries.length} {zh ? '条记录' : 'entries'}
        </p>
      </div>

      {/* FILTER 1: Activity Types (only show what user has entered) */}
      {uniqueActivities.length > 0 && (
        <div>
          <div className="flex items-center gap-1 mb-1">
            <BarChart3 size={12} style={{ color: '#3B82F6' }} />
            <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              {zh ? '活动类型' : 'Activity'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            <TabButton 
              active={activityFilter === null} 
              onClick={() => setActivityFilter(null)}
              count={entries.length}
            >
              {zh ? '全部' : 'All'}
            </TabButton>
            {uniqueActivities.map(({ value, count }) => (
              <TabButton
                key={value}
                active={activityFilter === value}
                onClick={() => setActivityFilter(activityFilter === value ? null : value)}
                count={count}
                color="#3B82F6"
              >
                {ACTIVITY_LABELS[value]?.[zh ? 'zh' : 'en']?.split('(')[0].trim() || value}
              </TabButton>
            ))}
          </div>
        </div>
      )}

      {/* FILTER 2: People (from network members + entries) */}
      {(networkMembers.length > 0 || peopleWithCounts.length > 0) && (
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Users size={12} style={{ color: '#06B6D4' }} />
            <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              {zh ? '参与人员' : 'People'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            <TabButton 
              active={peopleFilter === null} 
              onClick={() => setPeopleFilter(null)}
              count={entries.length}
            >
              {zh ? '全部' : 'All'}
            </TabButton>
            <TabButton 
              active={peopleFilter === 'just_me'} 
              onClick={() => setPeopleFilter(peopleFilter === 'just_me' ? null : 'just_me')}
              count={justMeCount}
              color="#6B7280"
            >
              👤 {zh ? '仅自己' : 'Just Me'}
            </TabButton>
            {peopleWithCounts.filter(p => p.count > 0).map(({ name, count, color }) => (
              <TabButton
                key={name}
                active={peopleFilter === name}
                onClick={() => setPeopleFilter(peopleFilter === name ? null : name)}
                count={count}
                color={color || '#06B6D4'}
              >
                {name}
              </TabButton>
            ))}
          </div>
        </div>
      )}

      {/* FILTER 3: Challenge Level Slider */}
      <div className="p-2 rounded-lg border" style={{ borderColor: 'var(--border-light)', background: 'white' }}>
        <div className="flex items-center gap-2 mb-1">
          <Filter size={12} style={{ color: 'var(--color-green)' }} />
          <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            {zh ? '挑战等级' : 'Challenge Level'}
          </span>
          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-green)' }}>
            {challengeLevel === 0 ? (zh ? '全部' : 'All') : `≥${challengeLevel}`}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="5"
          value={challengeLevel}
          onChange={(e) => setChallengeLevel(parseInt(e.target.value))}
          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
          style={{ 
            background: `linear-gradient(to right, var(--color-green) ${challengeLevel * 20}%, #e5e7eb ${challengeLevel * 20}%)`,
            accentColor: 'var(--color-green)'
          }}
        />
        <div className="flex justify-between text-[9px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          <span>{zh ? '全部' : 'All'}</span>
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
      </div>

      {/* FILTER 4: Challenge Types (only show what user has entered) */}
      {uniqueChallenges.length > 0 && (
        <div>
          <div className="flex items-center gap-1 mb-1">
            <MessageCircle size={12} style={{ color: '#EF4444' }} />
            <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              {zh ? '挑战类型' : 'Challenge Type'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            <TabButton 
              active={challengeTypeFilter === null} 
              onClick={() => setChallengeTypeFilter(null)}
              count={entries.length}
            >
              {zh ? '全部' : 'All'}
            </TabButton>
            {uniqueChallenges.map(({ value, count }) => (
              <TabButton
                key={value}
                active={challengeTypeFilter === value}
                onClick={() => setChallengeTypeFilter(challengeTypeFilter === value ? null : value)}
                count={count}
                color="#EF4444"
              >
                {CHALLENGE_LABELS[value]?.[zh ? 'zh' : 'en'] || value}
              </TabButton>
            ))}
          </div>
        </div>
      )}

      {/* Entries List */}
      <div className="space-y-2 max-h-[350px] overflow-y-auto">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {zh ? '没有符合筛选条件的记录' : 'No entries match your filters'}
            </p>
          </div>
        ) : (
          filteredEntries.map(entry => <EntryCard key={entry.id} entry={entry} />)
        )}
      </div>
    </div>
  );
}
