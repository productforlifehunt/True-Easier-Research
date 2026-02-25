import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, ChevronDown, Filter, Users, Heart, AlertCircle,
  MessageCircle, Wrench, HelpCircle, Shield, User
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

// Survey Entry interface matching the AddEntry form fields
interface SurveyEntry {
  id: number;
  user_id: string;
  entry_type?: string;
  entry_timestamp?: string;
  created_at?: string;
  // Activity tab
  description: string;
  activity_categories?: string[];
  time_spent?: number;
  emotional_impact?: string;
  your_mood?: string;
  urgency_level?: string;
  // People tab
  people_with?: string;
  people_want_with?: string;
  people_challenges?: string;
  // Challenges tab
  task_difficulty?: number; // 1-5 slider
  challenge_types?: string[]; // Array of challenge type codes
  challenges_faced?: string;
  // Resources tab
  resources_using?: string;
  resources_wanted?: string;
  // Legacy fields (from old schema)
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

interface Props {
  language: string;
  networkMembers?: { id: string; name: string }[];
}

// Challenge types from AddEntry form
const CHALLENGE_TYPES = [
  { value: 'knowledge_symptoms', en: "Dementia symptoms", zh: '痴呆症状' },
  { value: 'patient_condition', en: "Patient condition", zh: '患者病情' },
  { value: 'condition_updates', en: "Condition updates", zh: '病情更新' },
  { value: 'coordination', en: "Coordination", zh: '协调' },
  { value: 'time_constraints', en: "Time", zh: '时间' },
  { value: 'emotional_stress', en: "Emotional", zh: '情绪' },
  { value: 'physical_demands', en: "Physical", zh: '体力' },
  { value: 'communication', en: "Communication", zh: '沟通' },
  { value: 'liability_safety', en: "Safety", zh: '安全' },
  { value: 'privacy', en: "Privacy", zh: '隐私' },
  { value: 'other', en: "Other", zh: '其他' }
];

export default function MyCaringWeek({ language, networkMembers = [] }: Props) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<SurveyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  // Filters
  const [challengeLevel, setChallengeLevel] = useState<number>(0); // 0 = all, 1-5 = filter
  const [challengeTypeFilter, setChallengeTypeFilter] = useState<string | null>(null);
  const [peopleFilter, setPeopleFilter] = useState<string>('all'); // 'all', 'just_me', or person name
  
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

  // Get challenge level (1-5) from entry
  const getTaskDifficulty = (entry: SurveyEntry): number => {
    if (entry.task_difficulty) return entry.task_difficulty;
    // Fallback to urgency_level mapping
    const mapping: Record<string, number> = { 'low': 1, 'medium': 2, 'high': 4, 'urgent': 5 };
    return mapping[entry.urgency_level || ''] || 3;
  };

  // Get challenge types from entry
  const getEntryChallengeTypes = (entry: SurveyEntry): string[] => {
    if (entry.challenge_types && entry.challenge_types.length > 0) {
      return entry.challenge_types;
    }
    // Infer from legacy fields
    const types: string[] = [];
    if (hasContent(entry.communication_challenges)) types.push('communication');
    if (hasContent(entry.collaboration_challenges)) types.push('coordination');
    if (hasContent(entry.knowledge_gaps)) types.push('knowledge_symptoms');
    if (hasContent(entry.liability_concerns)) types.push('liability_safety');
    return types;
  };

  // Get people involved
  const getPeopleInvolved = (entry: SurveyEntry): string[] => {
    const people: string[] = [];
    if (hasContent(entry.people_with)) {
      // Try to extract names
      const text = entry.people_with!;
      people.push(...text.split(/[,，、]/g).map(p => p.trim()).filter(p => p));
    }
    return people;
  };

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    // Challenge level filter
    if (challengeLevel > 0 && getTaskDifficulty(entry) < challengeLevel) return false;
    
    // Challenge type filter
    if (challengeTypeFilter) {
      const types = getEntryChallengeTypes(entry);
      if (!types.includes(challengeTypeFilter)) return false;
    }
    
    // People filter
    if (peopleFilter === 'just_me') {
      // Show only entries with no people involved
      if (hasContent(entry.people_with)) return false;
    } else if (peopleFilter !== 'all') {
      // Filter by specific person
      const people = getPeopleInvolved(entry);
      if (!people.some(p => p.toLowerCase().includes(peopleFilter.toLowerCase()))) return false;
    }
    
    return true;
  });

  // Count entries by challenge level
  const levelCounts = {
    all: entries.length,
    1: entries.filter(e => getTaskDifficulty(e) === 1).length,
    2: entries.filter(e => getTaskDifficulty(e) === 2).length,
    3: entries.filter(e => getTaskDifficulty(e) === 3).length,
    4: entries.filter(e => getTaskDifficulty(e) === 4).length,
    5: entries.filter(e => getTaskDifficulty(e) === 5).length,
  };

  // Count entries by challenge type
  const typeCounts: Record<string, number> = {};
  CHALLENGE_TYPES.forEach(t => {
    typeCounts[t.value] = entries.filter(e => getEntryChallengeTypes(e).includes(t.value)).length;
  });

  // Get unique people from all entries
  const allPeople = new Set<string>();
  entries.forEach(e => getPeopleInvolved(e).forEach(p => allPeople.add(p)));
  const uniquePeople = Array.from(allPeople);

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
      : ['', 'No challenge', 'Minor', 'Moderate', 'Difficult', 'Extreme'];
    return labels[level] || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent" />
      </div>
    );
  }

  // Entry Card Component
  const EntryCard = ({ entry }: { entry: SurveyEntry }) => {
    const isExpanded = expandedId === entry.id;
    const difficulty = getTaskDifficulty(entry);
    const challengeTypes = getEntryChallengeTypes(entry);
    const people = getPeopleInvolved(entry);

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
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setExpandedId(isExpanded ? null : entry.id)}
        >
          <div className="flex items-start gap-3">
            {/* Difficulty Circle */}
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: getDifficultyColor(difficulty) }}
            >
              {difficulty}
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Description */}
              <p className="font-medium text-sm line-clamp-2 mb-2" style={{ color: 'var(--text-primary)' }}>
                {entry.description || (zh ? '无描述' : 'No description')}
              </p>
              
              {/* Meta Row */}
              <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {formatDate(entry.entry_timestamp || entry.created_at)}
                </span>
                {entry.time_spent && entry.time_spent > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {entry.time_spent}m
                  </span>
                )}
                {people.length > 0 && (
                  <span className="flex items-center gap-1 text-cyan-600">
                    <Users size={12} />
                    {people.length} {zh ? '人' : 'people'}
                  </span>
                )}
              </div>
              
              {/* Challenge Type Tags */}
              {challengeTypes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {challengeTypes.slice(0, 3).map(type => {
                    const typeInfo = CHALLENGE_TYPES.find(t => t.value === type);
                    return (
                      <span 
                        key={type}
                        className="px-2 py-0.5 rounded text-[10px] font-medium"
                        style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-green)' }}
                      >
                        {typeInfo ? (zh ? typeInfo.zh : typeInfo.en) : type}
                      </span>
                    );
                  })}
                  {challengeTypes.length > 3 && (
                    <span className="text-[10px] text-gray-400">+{challengeTypes.length - 3}</span>
                  )}
                </div>
              )}
            </div>
            
            <ChevronDown 
              size={18} 
              className={`transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
              style={{ color: 'var(--text-secondary)' }}
            />
          </div>
        </div>

        {/* Expanded Content - Beautiful Card Display */}
        {isExpanded && (
          <div className="border-t" style={{ borderColor: 'var(--border-light)' }}>
            {/* Difficulty Summary Bar */}
            <div className="px-4 py-3 flex items-center gap-3" style={{ background: `${getDifficultyColor(difficulty)}10` }}>
              <AlertCircle size={16} style={{ color: getDifficultyColor(difficulty) }} />
              <span className="text-sm font-medium" style={{ color: getDifficultyColor(difficulty) }}>
                {zh ? '挑战等级' : 'Challenge Level'}: {difficulty}/5 - {getDifficultyLabel(difficulty)}
              </span>
            </div>

            <div className="p-4 space-y-4" style={{ background: '#fafafa' }}>
              {/* People Section */}
              {(hasContent(entry.people_with) || hasContent(entry.people_want_with) || hasContent(entry.people_challenges)) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color: '#06B6D4' }}>
                    <Users size={14} />
                    {zh ? '人员' : 'People'}
                  </div>
                  <div className="bg-white rounded-lg p-3 space-y-2 border" style={{ borderColor: 'var(--border-light)' }}>
                    {hasContent(entry.people_with) && (
                      <div className="text-xs">
                        <span className="font-medium text-cyan-600">{zh ? '参与人员: ' : 'Involved: '}</span>
                        <span style={{ color: 'var(--text-primary)' }}>{entry.people_with}</span>
                      </div>
                    )}
                    {hasContent(entry.people_want_with) && (
                      <div className="text-xs">
                        <span className="font-medium text-cyan-600">{zh ? '希望帮忙: ' : 'Wish could help: '}</span>
                        <span style={{ color: 'var(--text-primary)' }}>{entry.people_want_with}</span>
                      </div>
                    )}
                    {hasContent(entry.people_challenges) && (
                      <div className="text-xs">
                        <span className="font-medium text-orange-500">{zh ? '求助困难: ' : 'Reaching challenges: '}</span>
                        <span style={{ color: 'var(--text-primary)' }}>{entry.people_challenges || entry.help_reaching_challenges}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Challenges Section */}
              {(challengeTypes.length > 0 || hasContent(entry.challenges_faced) || hasContent(entry.difficulties_challenges)) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color: '#EF4444' }}>
                    <MessageCircle size={14} />
                    {zh ? '挑战' : 'Challenges'}
                  </div>
                  <div className="bg-white rounded-lg p-3 space-y-2 border" style={{ borderColor: 'var(--border-light)' }}>
                    {/* Challenge Type Tags */}
                    {challengeTypes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {challengeTypes.map(type => {
                          const typeInfo = CHALLENGE_TYPES.find(t => t.value === type);
                          return (
                            <span 
                              key={type}
                              className="px-2 py-1 rounded text-xs font-medium"
                              style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
                            >
                              {typeInfo ? (zh ? typeInfo.zh : typeInfo.en) : type}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    {/* Challenge Description */}
                    {(hasContent(entry.challenges_faced) || hasContent(entry.difficulties_challenges)) && (
                      <div className="text-xs pt-2 border-t" style={{ borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}>
                        {entry.challenges_faced || entry.difficulties_challenges}
                      </div>
                    )}
                    {/* Legacy challenge fields */}
                    {hasContent(entry.communication_challenges) && (
                      <div className="text-xs">
                        <span className="font-medium" style={{ color: '#F59E0B' }}>{zh ? '沟通: ' : 'Communication: '}</span>
                        {entry.communication_challenges}
                      </div>
                    )}
                    {hasContent(entry.collaboration_challenges) && (
                      <div className="text-xs">
                        <span className="font-medium" style={{ color: '#F59E0B' }}>{zh ? '协作: ' : 'Collaboration: '}</span>
                        {entry.collaboration_challenges}
                      </div>
                    )}
                    {hasContent(entry.knowledge_gaps) && (
                      <div className="text-xs">
                        <span className="font-medium" style={{ color: '#3B82F6' }}>{zh ? '知识: ' : 'Knowledge: '}</span>
                        {entry.knowledge_gaps}
                      </div>
                    )}
                    {hasContent(entry.liability_concerns) && (
                      <div className="text-xs">
                        <span className="font-medium" style={{ color: '#DC2626' }}>{zh ? '安全: ' : 'Safety: '}</span>
                        {entry.liability_concerns}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Resources Section */}
              {(hasContent(entry.resources_using) || hasContent(entry.resources_wanted) || hasContent(entry.tools_using) || hasContent(entry.tools_wanted) || hasContent(entry.support_needed)) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color: '#8B5CF6' }}>
                    <Wrench size={14} />
                    {zh ? '资源' : 'Resources'}
                  </div>
                  <div className="bg-white rounded-lg p-3 space-y-2 border" style={{ borderColor: 'var(--border-light)' }}>
                    {(hasContent(entry.resources_using) || hasContent(entry.tools_using)) && (
                      <div className="text-xs">
                        <span className="font-medium" style={{ color: '#6B7280' }}>{zh ? '使用中: ' : 'Using: '}</span>
                        <span style={{ color: 'var(--text-primary)' }}>{entry.resources_using || entry.tools_using}</span>
                      </div>
                    )}
                    {(hasContent(entry.resources_wanted) || hasContent(entry.tools_wanted)) && (
                      <div className="text-xs">
                        <span className="font-medium" style={{ color: '#8B5CF6' }}>{zh ? '需要: ' : 'Needed: '}</span>
                        <span style={{ color: 'var(--text-primary)' }}>{entry.resources_wanted || entry.tools_wanted}</span>
                      </div>
                    )}
                    {hasContent(entry.support_needed) && (
                      <div className="text-xs">
                        <span className="font-medium" style={{ color: '#8B5CF6' }}>{zh ? '支持: ' : 'Support: '}</span>
                        <span style={{ color: 'var(--text-primary)' }}>{entry.support_needed}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Emotional Impact */}
              {(hasContent(entry.emotional_impact) || hasContent(entry.your_mood)) && (
                <div className="flex items-center gap-2 text-xs p-2 rounded-lg" style={{ background: 'rgba(236,72,153,0.08)' }}>
                  <Heart size={14} style={{ color: '#EC4899' }} />
                  <span className="font-medium" style={{ color: '#EC4899' }}>{zh ? '情绪: ' : 'Feeling: '}</span>
                  <span style={{ color: 'var(--text-primary)' }}>{entry.emotional_impact || entry.your_mood}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-bold" style={{ color: 'var(--color-green)' }}>
          {zh ? '我的照护周' : 'My Caring Week'}
        </h3>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {zh 
            ? `${filteredEntries.length}/${entries.length} 条记录` 
            : `${filteredEntries.length}/${entries.length} entries`}
        </p>
      </div>

      {/* Challenge Level Slider Filter */}
      <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--border-light)', background: 'white' }}>
        <div className="flex items-center gap-2 mb-2">
          <Filter size={14} style={{ color: 'var(--color-green)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
            {zh ? '挑战等级' : 'Challenge Level'}
          </span>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-green)' }}>
            {challengeLevel === 0 ? (zh ? '全部' : 'All') : `≥${challengeLevel}`}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="5"
          value={challengeLevel}
          onChange={(e) => setChallengeLevel(parseInt(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style={{ 
            background: `linear-gradient(to right, var(--color-green) ${challengeLevel * 20}%, #e5e7eb ${challengeLevel * 20}%)`,
            accentColor: 'var(--color-green)'
          }}
        />
        <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>
          <span>{zh ? '全部' : 'All'}</span>
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
        {/* Level counts */}
        <div className="flex justify-end gap-2 mt-2 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
          <span style={{ color: '#10B981' }}>Low(1-2): {levelCounts[1] + levelCounts[2]}</span>
          <span style={{ color: '#F59E0B' }}>Med(3): {levelCounts[3]}</span>
          <span style={{ color: '#DC2626' }}>High(4-5): {levelCounts[4] + levelCounts[5]}</span>
        </div>
      </div>

      {/* Challenge Type Tabs */}
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-1 min-w-max">
          <button
            onClick={() => setChallengeTypeFilter(null)}
            className="px-2 py-1 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap"
            style={{ 
              background: challengeTypeFilter === null ? 'var(--color-green)' : 'rgba(16,185,129,0.1)',
              color: challengeTypeFilter === null ? 'white' : 'var(--color-green)'
            }}
          >
            {zh ? '全部' : 'All'} ({entries.length})
          </button>
          {CHALLENGE_TYPES.filter(t => typeCounts[t.value] > 0).map(type => (
            <button
              key={type.value}
              onClick={() => setChallengeTypeFilter(challengeTypeFilter === type.value ? null : type.value)}
              className="px-2 py-1 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap"
              style={{ 
                background: challengeTypeFilter === type.value ? 'var(--color-green)' : 'rgba(16,185,129,0.1)',
                color: challengeTypeFilter === type.value ? 'white' : 'var(--color-green)'
              }}
            >
              {zh ? type.zh : type.en} ({typeCounts[type.value]})
            </button>
          ))}
        </div>
      </div>

      {/* People Filter */}
      <div className="flex items-center gap-2">
        <Users size={14} style={{ color: 'var(--text-secondary)' }} />
        <select
          value={peopleFilter}
          onChange={(e) => setPeopleFilter(e.target.value)}
          className="text-xs px-2 py-1 rounded-lg border bg-white flex-1"
          style={{ borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
        >
          <option value="all">{zh ? '所有人员' : 'All People'}</option>
          <option value="just_me">{zh ? '仅自己' : 'Just Me'}</option>
          {uniquePeople.map(person => (
            <option key={person} value={person}>{person}</option>
          ))}
        </select>
      </div>

      {/* Entries List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
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
