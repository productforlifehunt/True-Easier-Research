import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, HelpCircle, Wrench, ChevronDown,
  LayoutGrid, GitBranch, Filter, MessageSquare, Users, Heart, AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

// ONLY the fields that users actually enter in the survey form
interface SurveyEntry {
  id: number;
  user_id: string;
  entry_type?: string;
  // Tab 1: Activity
  description: string;
  time_spent?: number;
  emotional_impact?: string;
  urgency_level?: string;
  // Tab 2: People
  people_with?: string;
  people_want_with?: string;
  help_reaching_challenges?: string;
  // Tab 3: Challenges
  communication_challenges?: string;
  collaboration_challenges?: string;
  knowledge_gaps?: string;
  liability_concerns?: string;
  // Tab 4: Resources
  tools_using?: string;
  tools_wanted?: string;
  support_needed?: string;
  // Timestamps
  created_at?: string;
  entry_timestamp?: string;
}

interface Props {
  language: string;
}

type ViewMode = 'list' | 'timeline';

export default function MyCaringWeek({ language }: Props) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<SurveyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const zh = language === 'zh';

  useEffect(() => {
    if (user?.id) {
      fetchEntries();
    }
  }, [user?.id]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      // Query from care_connector schema
      const { data, error } = await supabase
        .from('care_connector.survey_entries')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback to public schema if care_connector fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('survey_entries')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });
        
        if (fallbackError) throw fallbackError;
        setEntries(fallbackData || []);
      } else {
        setEntries(data || []);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasContent = (val?: string) => val && val.trim().length > 0;

  // Get date for display
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(zh ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' });
  };

  // Emotional impact display
  const getEmotionalLabel = (value?: string) => {
    const labels: Record<string, { en: string; zh: string }> = {
      'very_positive': { en: 'Very Positive', zh: '非常积极' },
      'positive': { en: 'Positive', zh: '积极' },
      'neutral': { en: 'Neutral', zh: '中性' },
      'challenging': { en: 'Challenging', zh: '有挑战' },
      'very_challenging': { en: 'Very Challenging', zh: '非常困难' }
    };
    return value ? (zh ? labels[value]?.zh : labels[value]?.en) || value : null;
  };

  // Urgency level display
  const getUrgencyLabel = (value?: string) => {
    const labels: Record<string, { en: string; zh: string; color: string }> = {
      'low': { en: 'Low', zh: '低', color: '#10B981' },
      'medium': { en: 'Medium', zh: '中', color: '#F59E0B' },
      'high': { en: 'High', zh: '高', color: '#EF4444' },
      'urgent': { en: 'Urgent', zh: '紧急', color: '#DC2626' }
    };
    return value ? labels[value] : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent" />
      </div>
    );
  }

  // Entry Card Component - shows ONLY what user actually entered
  const EntryCard = ({ entry }: { entry: SurveyEntry }) => {
    const isExpanded = expandedId === entry.id;
    const urgency = getUrgencyLabel(entry.urgency_level);
    const emotional = getEmotionalLabel(entry.emotional_impact);

    // Count how many fields have content
    const filledFields = [
      entry.people_with,
      entry.people_want_with,
      entry.help_reaching_challenges,
      entry.communication_challenges,
      entry.collaboration_challenges,
      entry.knowledge_gaps,
      entry.liability_concerns,
      entry.tools_using,
      entry.tools_wanted,
      entry.support_needed
    ].filter(f => hasContent(f)).length;

    return (
      <div 
        className="rounded-lg border-2 transition-all overflow-hidden"
        style={{ 
          borderColor: isExpanded ? 'var(--color-green)' : 'var(--border-light)',
          background: 'white'
        }}
      >
        {/* Header - Click to expand */}
        <div 
          className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setExpandedId(isExpanded ? null : entry.id)}
        >
          <div className="flex items-start gap-3">
            {/* Urgency indicator */}
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
              style={{ background: urgency?.color || '#10B981' }}
            >
              {urgency ? (zh ? urgency.zh[0] : urgency.en[0]) : '•'}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                {entry.description || (zh ? '无描述' : 'No description')}
              </p>
              
              {/* Meta info */}
              <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
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
                {emotional && (
                  <span className="flex items-center gap-1">
                    <Heart size={10} />
                    {emotional}
                  </span>
                )}
                {filledFields > 0 && (
                  <span className="text-green-600">
                    +{filledFields} {zh ? '个字段' : 'fields'}
                  </span>
                )}
              </div>
            </div>
            
            <ChevronDown 
              size={16} 
              className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              style={{ color: 'var(--text-secondary)' }}
            />
          </div>
        </div>

        {/* Expanded content - ONLY shows fields that have actual content */}
        {isExpanded && (
          <div className="px-3 pb-3 pt-2 border-t space-y-2" style={{ borderColor: 'var(--border-light)', background: '#fafafa' }}>
            
            {/* PEOPLE TAB FIELDS */}
            {hasContent(entry.people_with) && (
              <div className="text-xs p-2 rounded" style={{ background: 'rgba(6,182,212,0.08)' }}>
                <span className="font-semibold" style={{ color: '#06B6D4' }}>
                  {zh ? '一起的人: ' : 'People With: '}
                </span>
                <span style={{ color: 'var(--text-primary)' }}>{entry.people_with}</span>
              </div>
            )}
            {hasContent(entry.people_want_with) && (
              <div className="text-xs p-2 rounded" style={{ background: 'rgba(6,182,212,0.08)' }}>
                <span className="font-semibold" style={{ color: '#06B6D4' }}>
                  {zh ? '想一起做的人: ' : 'Prefer to Do With: '}
                </span>
                <span style={{ color: 'var(--text-primary)' }}>{entry.people_want_with}</span>
              </div>
            )}
            {hasContent(entry.help_reaching_challenges) && (
              <div className="text-xs p-2 rounded" style={{ background: 'rgba(245,158,11,0.08)' }}>
                <span className="font-semibold" style={{ color: '#F59E0B' }}>
                  {zh ? '求助困难: ' : 'Challenges Reaching Help: '}
                </span>
                <span style={{ color: 'var(--text-primary)' }}>{entry.help_reaching_challenges}</span>
              </div>
            )}

            {/* CHALLENGES TAB FIELDS */}
            {hasContent(entry.communication_challenges) && (
              <div className="text-xs p-2 rounded" style={{ background: 'rgba(16,185,129,0.08)' }}>
                <span className="font-semibold" style={{ color: '#10B981' }}>
                  {zh ? '沟通挑战: ' : 'Communication Challenges: '}
                </span>
                <span style={{ color: 'var(--text-primary)' }}>{entry.communication_challenges}</span>
              </div>
            )}
            {hasContent(entry.collaboration_challenges) && (
              <div className="text-xs p-2 rounded" style={{ background: 'rgba(16,185,129,0.08)' }}>
                <span className="font-semibold" style={{ color: '#10B981' }}>
                  {zh ? '协作挑战: ' : 'Collaboration Challenges: '}
                </span>
                <span style={{ color: 'var(--text-primary)' }}>{entry.collaboration_challenges}</span>
              </div>
            )}
            {hasContent(entry.knowledge_gaps) && (
              <div className="text-xs p-2 rounded" style={{ background: 'rgba(59,130,246,0.08)' }}>
                <span className="font-semibold" style={{ color: '#3B82F6' }}>
                  {zh ? '知识缺口: ' : 'Knowledge Gaps: '}
                </span>
                <span style={{ color: 'var(--text-primary)' }}>{entry.knowledge_gaps}</span>
              </div>
            )}
            {hasContent(entry.liability_concerns) && (
              <div className="text-xs p-2 rounded" style={{ background: 'rgba(220,38,38,0.08)' }}>
                <span className="font-semibold" style={{ color: '#DC2626' }}>
                  {zh ? '责任顾虑: ' : 'Liability Concerns: '}
                </span>
                <span style={{ color: 'var(--text-primary)' }}>{entry.liability_concerns}</span>
              </div>
            )}

            {/* RESOURCES TAB FIELDS */}
            {hasContent(entry.tools_using) && (
              <div className="text-xs p-2 rounded" style={{ background: 'rgba(107,114,128,0.08)' }}>
                <span className="font-semibold" style={{ color: '#6B7280' }}>
                  {zh ? '使用的工具: ' : 'Tools Using: '}
                </span>
                <span style={{ color: 'var(--text-primary)' }}>{entry.tools_using}</span>
              </div>
            )}
            {hasContent(entry.tools_wanted) && (
              <div className="text-xs p-2 rounded" style={{ background: 'rgba(107,114,128,0.08)' }}>
                <span className="font-semibold" style={{ color: '#6B7280' }}>
                  {zh ? '需要的工具: ' : 'Tools Needed: '}
                </span>
                <span style={{ color: 'var(--text-primary)' }}>{entry.tools_wanted}</span>
              </div>
            )}
            {hasContent(entry.support_needed) && (
              <div className="text-xs p-2 rounded" style={{ background: 'rgba(139,92,246,0.08)' }}>
                <span className="font-semibold" style={{ color: '#8B5CF6' }}>
                  {zh ? '需要的支持: ' : 'Support Needed: '}
                </span>
                <span style={{ color: 'var(--text-primary)' }}>{entry.support_needed}</span>
              </div>
            )}

            {/* If nothing filled, show message */}
            {filledFields === 0 && (
              <p className="text-xs text-gray-400 italic text-center py-2">
                {zh ? '暂无详细信息' : 'No additional details entered'}
              </p>
            )}
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
            ? `${entries.length} 条记录 • 点击展开查看详情` 
            : `${entries.length} entries • Click to expand details`}
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode('list')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ 
            background: viewMode === 'list' ? 'var(--color-green)' : 'rgba(16,185,129,0.1)',
            color: viewMode === 'list' ? 'white' : 'var(--color-green)'
          }}
        >
          <LayoutGrid size={12} />
          {zh ? '列表' : 'List'}
        </button>
        <button
          onClick={() => setViewMode('timeline')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ 
            background: viewMode === 'timeline' ? 'var(--color-green)' : 'rgba(16,185,129,0.1)',
            color: viewMode === 'timeline' ? 'white' : 'var(--color-green)'
          }}
        >
          <GitBranch size={12} />
          {zh ? '时间线' : 'Timeline'}
        </button>
      </div>

      {/* Entries */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {zh ? '还没有记录，去添加第一条吧！' : 'No entries yet. Add your first one!'}
            </p>
          </div>
        ) : (
          entries.map(entry => <EntryCard key={entry.id} entry={entry} />)
        )}
      </div>
    </div>
  );
}
