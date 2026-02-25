import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Calendar, Clock, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface Props {
  language: string;
  compact?: boolean;
}

interface SurveyEntry {
  id: number;
  user_id: string;
  entry_type?: string;
  caregiver_role?: string;
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
}

export default function SurveyResultsSummary({ language, compact }: Props) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<SurveyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<number>(0); // 0 = show all

  const zh = language === 'zh';

  useEffect(() => {
    if (user?.id) {
      fetchEntries();
    }
  }, [user?.id]);

  const fetchEntries = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('survey_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      console.error('Error fetching entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(zh ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' });
  };

  const hasContent = (val?: string) => val && val.trim().length > 0;

  // Get urgency level as number (0-5)
  const getUrgencyNum = (e: SurveyEntry) => {
    if (!e.urgency_level) return 0;
    const num = parseInt(e.urgency_level);
    return isNaN(num) ? 0 : num;
  };

  // Filter entries by difficulty level
  const filteredEntries = difficultyFilter === 0 
    ? entries 
    : entries.filter(e => getUrgencyNum(e) >= difficultyFilter);

  // Count entries with challenge-related content
  const entriesWithChallenges = entries.filter(e => 
    hasContent(e.difficulties_challenges) || 
    hasContent(e.struggles_encountered) || 
    hasContent(e.support_needed) ||
    hasContent(e.communication_challenges) ||
    hasContent(e.collaboration_challenges)
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-sm font-bold" style={{ color: 'var(--color-green)' }}>
          {zh ? '我的照护周' : 'My Caring Week'}
        </h3>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {zh ? `共 ${entries.length} 条记录，${entriesWithChallenges} 条包含挑战` : `${entries.length} entries, ${entriesWithChallenges} with challenges`}
        </p>
      </div>

      {/* Difficulty Filter Slider */}
      <div className="p-3 rounded-lg border" style={{ borderColor: 'var(--border-light)', background: 'var(--bg-secondary)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Filter size={14} style={{ color: 'var(--color-green)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
            {zh ? '按困难程度筛选' : 'Filter by Difficulty Level'}
          </span>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-green)', color: 'white' }}>
            {difficultyFilter === 0 ? (zh ? '全部' : 'All') : `≥ ${difficultyFilter}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>0</span>
          <input
            type="range"
            min="0"
            max="5"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(parseInt(e.target.value))}
            className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
            style={{ 
              background: `linear-gradient(to right, #10B981 ${difficultyFilter * 20}%, #e2e8f0 ${difficultyFilter * 20}%)`,
              accentColor: '#10B981'
            }}
          />
          <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>5</span>
        </div>
        {difficultyFilter > 0 && (
          <p className="text-[10px] mt-1 text-center" style={{ color: 'var(--text-secondary)' }}>
            {zh 
              ? `显示困难程度 ≥ ${difficultyFilter} 的记录 (${filteredEntries.length}/${entries.length})` 
              : `Showing entries with difficulty ≥ ${difficultyFilter} (${filteredEntries.length}/${entries.length})`}
          </p>
        )}
      </div>

      {/* Entries List */}
      <div 
        className="space-y-2 overflow-y-auto" 
        style={{ maxHeight: compact ? '280px' : '360px' }}
      >
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {zh ? '暂无调研记录' : 'No survey entries yet'}
          </div>
        ) : (
          filteredEntries.map((entry, idx) => {
            const isExpanded = expandedId === entry.id;
            
            return (
              <div 
                key={entry.id}
                className="rounded-lg border overflow-hidden"
                style={{ borderColor: 'var(--border-light)', background: 'white' }}
              >
                {/* Entry Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  className="w-full p-3 flex items-start gap-2 text-left hover:bg-gray-50 transition-colors"
                >
                  {/* Index */}
                  <span 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: 'var(--color-green)' }}
                  >
                    {idx + 1}
                  </span>
                  
                  {/* Description */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {entry.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {formatDate(entry.created_at)}
                      </span>
                      {entry.time_spent && (
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {entry.time_spent} {zh ? '分钟' : 'min'}
                        </span>
                      )}
                      {entry.urgency_level && parseInt(entry.urgency_level) > 0 && (
                        <span 
                          className="px-1.5 py-0.5 rounded font-medium"
                          style={{ 
                            background: parseInt(entry.urgency_level) >= 4 ? 'rgba(239,68,68,0.15)' : parseInt(entry.urgency_level) >= 2 ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                            color: parseInt(entry.urgency_level) >= 4 ? '#DC2626' : parseInt(entry.urgency_level) >= 2 ? '#D97706' : '#059669'
                          }}
                        >
                          {zh ? '难度' : 'Diff'}: {entry.urgency_level}/5
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expand Icon */}
                  <div className="shrink-0" style={{ color: 'var(--text-secondary)' }}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {/* Expanded Content - Show ALL fields */}
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-2 border-t text-xs" style={{ borderColor: 'var(--border-light)' }}>
                    
                    {/* Challenges & Difficulties */}
                    {hasContent(entry.difficulties_challenges) && (
                      <div className="mt-2 p-2 rounded" style={{ background: 'rgba(239,68,68,0.06)' }}>
                        <div className="font-semibold mb-1" style={{ color: '#DC2626' }}>
                          {zh ? '困难与挑战' : 'Difficulties & Challenges'}
                        </div>
                        <p style={{ color: 'var(--text-primary)' }}>{entry.difficulties_challenges}</p>
                      </div>
                    )}

                    {hasContent(entry.struggles_encountered) && (
                      <div className="p-2 rounded" style={{ background: 'rgba(245,158,11,0.06)' }}>
                        <div className="font-semibold mb-1" style={{ color: '#D97706' }}>
                          {zh ? '遇到的挣扎' : 'Struggles Encountered'}
                        </div>
                        <p style={{ color: 'var(--text-primary)' }}>{entry.struggles_encountered}</p>
                      </div>
                    )}

                    {hasContent(entry.support_needed) && (
                      <div className="p-2 rounded" style={{ background: 'rgba(59,130,246,0.06)' }}>
                        <div className="font-semibold mb-1" style={{ color: '#2563EB' }}>
                          {zh ? '需要的支持' : 'Support Needed'}
                        </div>
                        <p style={{ color: 'var(--text-primary)' }}>{entry.support_needed}</p>
                      </div>
                    )}

                    {hasContent(entry.emotional_impact) && (
                      <div className="p-2 rounded" style={{ background: 'rgba(139,92,246,0.06)' }}>
                        <div className="font-semibold mb-1" style={{ color: '#7C3AED' }}>
                          {zh ? '情感影响' : 'Emotional Impact'}
                        </div>
                        <p style={{ color: 'var(--text-primary)' }}>{entry.emotional_impact}</p>
                      </div>
                    )}

                    {/* People */}
                    {hasContent(entry.people_with) && (
                      <div className="p-2 rounded" style={{ background: 'rgba(16,185,129,0.06)' }}>
                        <div className="font-semibold mb-1" style={{ color: '#059669' }}>
                          {zh ? '一起的人' : 'People With'}
                        </div>
                        <p style={{ color: 'var(--text-primary)' }}>{entry.people_with}</p>
                      </div>
                    )}

                    {hasContent(entry.people_want_with) && (
                      <div className="p-2 rounded" style={{ background: 'rgba(16,185,129,0.06)' }}>
                        <div className="font-semibold mb-1" style={{ color: '#059669' }}>
                          {zh ? '希望一起的人' : 'People Wanted With'}
                        </div>
                        <p style={{ color: 'var(--text-primary)' }}>{entry.people_want_with}</p>
                      </div>
                    )}

                    {/* Tools */}
                    {hasContent(entry.tools_using) && (
                      <div className="p-2 rounded" style={{ background: 'rgba(107,114,128,0.06)' }}>
                        <div className="font-semibold mb-1" style={{ color: '#4B5563' }}>
                          {zh ? '使用的工具' : 'Tools Using'}
                        </div>
                        <p style={{ color: 'var(--text-primary)' }}>{entry.tools_using}</p>
                      </div>
                    )}

                    {hasContent(entry.tools_wanted) && (
                      <div className="p-2 rounded" style={{ background: 'rgba(107,114,128,0.06)' }}>
                        <div className="font-semibold mb-1" style={{ color: '#4B5563' }}>
                          {zh ? '希望的工具' : 'Tools Wanted'}
                        </div>
                        <p style={{ color: 'var(--text-primary)' }}>{entry.tools_wanted}</p>
                      </div>
                    )}

                    {/* Communication & Collaboration */}
                    {hasContent(entry.communication_challenges) && (
                      <div className="p-2 rounded" style={{ background: 'rgba(236,72,153,0.06)' }}>
                        <div className="font-semibold mb-1" style={{ color: '#DB2777' }}>
                          {zh ? '沟通挑战' : 'Communication Challenges'}
                        </div>
                        <p style={{ color: 'var(--text-primary)' }}>{entry.communication_challenges}</p>
                      </div>
                    )}

                    {hasContent(entry.collaboration_challenges) && (
                      <div className="p-2 rounded" style={{ background: 'rgba(236,72,153,0.06)' }}>
                        <div className="font-semibold mb-1" style={{ color: '#DB2777' }}>
                          {zh ? '协作挑战' : 'Collaboration Challenges'}
                        </div>
                        <p style={{ color: 'var(--text-primary)' }}>{entry.collaboration_challenges}</p>
                      </div>
                    )}

                    {hasContent(entry.cooperation_challenges) && (
                      <div className="p-2 rounded" style={{ background: 'rgba(236,72,153,0.06)' }}>
                        <div className="font-semibold mb-1" style={{ color: '#DB2777' }}>
                          {zh ? '合作挑战' : 'Cooperation Challenges'}
                        </div>
                        <p style={{ color: 'var(--text-primary)' }}>{entry.cooperation_challenges}</p>
                      </div>
                    )}

                    {hasContent(entry.help_reaching_challenges) && (
                      <div className="p-2 rounded" style={{ background: 'rgba(251,146,60,0.06)' }}>
                        <div className="font-semibold mb-1" style={{ color: '#EA580C' }}>
                          {zh ? '寻求帮助的挑战' : 'Help Reaching Challenges'}
                        </div>
                        <p style={{ color: 'var(--text-primary)' }}>{entry.help_reaching_challenges}</p>
                      </div>
                    )}

                    {hasContent(entry.person_want_to_do_with) && (
                      <div className="p-2 rounded" style={{ background: 'rgba(16,185,129,0.06)' }}>
                        <div className="font-semibold mb-1" style={{ color: '#059669' }}>
                          {zh ? '想一起做的人' : 'Person Want To Do With'}
                        </div>
                        <p style={{ color: 'var(--text-primary)' }}>{entry.person_want_to_do_with}</p>
                      </div>
                    )}

                    {hasContent(entry.knowledge_gaps) && (
                      <div className="p-2 rounded" style={{ background: 'rgba(99,102,241,0.06)' }}>
                        <div className="font-semibold mb-1" style={{ color: '#4F46E5' }}>
                          {zh ? '知识缺口' : 'Knowledge Gaps'}
                        </div>
                        <p style={{ color: 'var(--text-primary)' }}>{entry.knowledge_gaps}</p>
                      </div>
                    )}

                    {hasContent(entry.liability_concerns) && (
                      <div className="p-2 rounded" style={{ background: 'rgba(239,68,68,0.06)' }}>
                        <div className="font-semibold mb-1" style={{ color: '#DC2626' }}>
                          {zh ? '责任顾虑' : 'Liability Concerns'}
                        </div>
                        <p style={{ color: 'var(--text-primary)' }}>{entry.liability_concerns}</p>
                      </div>
                    )}

                    {/* Urgency/Difficulty Level */}
                    {entry.urgency_level && (
                      <div className="p-2 rounded" style={{ background: 'rgba(239,68,68,0.06)' }}>
                        <div className="font-semibold mb-1" style={{ color: '#DC2626' }}>
                          {zh ? '紧急/困难程度' : 'Urgency/Difficulty Level'}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-gray-200">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${(parseInt(entry.urgency_level) || 0) * 20}%`,
                                background: parseInt(entry.urgency_level) >= 4 ? '#DC2626' : parseInt(entry.urgency_level) >= 2 ? '#F59E0B' : '#10B981'
                              }}
                            />
                          </div>
                          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{entry.urgency_level}/5</span>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
