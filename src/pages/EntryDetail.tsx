import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dataService } from '../lib/dataService';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Edit2, Trash2, Clock, BarChart3, Users, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../hooks/useLanguage';
import DesktopHeader from '../components/DesktopHeader';
import MobileHeader from '../components/MobileHeader';
import BottomNav from '../components/BottomNav';

const EntryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchEntry = async () => {
      if (!id || !user) return;
      try {
        const entries = await dataService.getSurveyEntries(user.id);
        const data = entries.find(entry => entry.id === parseInt(id));

        if (!data) {
          toast.error(language === 'zh' ? '记录未找到' : 'Entry not found');
          navigate('/timeline');
          return;
        }
        setEntry(data);
      } catch (error: any) {
        console.error('Error fetching entry:', error);
        toast.error(language === 'zh' ? '加载失败' : 'Failed to load entry');
        navigate('/timeline');
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [id, user]);

  const handleDelete = async () => {
    if (!id || !user) return;
    setDeleting(true);
    try {
      await dataService.deleteSurveyEntry(parseInt(id));
      toast.success(language === 'zh' ? '记录已删除' : 'Entry deleted');
      navigate('/timeline');
    } catch (error: any) {
      console.error('Error deleting entry:', error);
      toast.error(language === 'zh' ? '删除失败' : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => navigate(`/edit-entry/${id}`);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getEntryTypeLabel = (type: string) => {
    const labels: Record<string, string> = language === 'zh' 
      ? { care_activity: '护理活动', care_need: '护理需求', struggle: '困难' }
      : { care_activity: 'Care Activity', care_need: 'Care Need', struggle: 'Struggle' };
    return labels[type] || type;
  };

  const getEntryTypeColor = (type: string) => {
    switch (type) {
      case 'care_activity': return 'var(--color-green)';
      case 'care_need': return '#fb923c';
      case 'struggle': return '#ef4444';
      default: return 'var(--text-secondary)';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent" style={{ borderColor: 'var(--color-green)', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  if (!entry) return null;

  const categories = entry.activity_categories || [];
  const fields = [
    { label: language === 'zh' ? '描述' : 'Description', value: entry.description, icon: BarChart3 },
    { label: language === 'zh' ? '活动类别' : 'Activity Categories', value: categories.length > 0 ? categories.join(', ') : null, icon: BarChart3 },
    { label: language === 'zh' ? '心情' : 'Mood', value: entry.your_mood, icon: MessageCircle },
    { label: language === 'zh' ? '情感影响' : 'Emotional Impact', value: entry.emotional_impact, icon: MessageCircle },
    { label: language === 'zh' ? '紧急程度' : 'Urgency Level', value: entry.urgency_level, icon: Clock },
    { label: language === 'zh' ? '花费时间' : 'Time Spent', value: entry.time_spent ? `${entry.time_spent} min` : null, icon: Clock },
    { label: language === 'zh' ? '同行人员' : 'People With', value: entry.people_with, icon: Users },
    { label: language === 'zh' ? '想要同行的人' : 'People Want With', value: entry.people_want_with, icon: Users },
    { label: language === 'zh' ? '面临的挑战' : 'Challenges Faced', value: entry.challenges_faced, icon: MessageCircle },
    { label: language === 'zh' ? '任务难度' : 'Task Difficulty', value: entry.task_difficulty ? `${entry.task_difficulty}/5` : null, icon: BarChart3 },
    { label: language === 'zh' ? '正在使用的资源' : 'Resources Using', value: entry.resources_using, icon: BarChart3 },
    { label: language === 'zh' ? '想要的资源' : 'Resources Wanted', value: entry.resources_wanted, icon: BarChart3 },
    { label: language === 'zh' ? '沟通挑战' : 'Communication Challenges', value: entry.communication_challenges, icon: MessageCircle },
    { label: language === 'zh' ? '协作挑战' : 'Collaboration Challenges', value: entry.collaboration_challenges, icon: MessageCircle },
    { label: language === 'zh' ? '知识差距' : 'Knowledge Gaps', value: entry.knowledge_gaps, icon: MessageCircle },
    { label: language === 'zh' ? '所需支持' : 'Support Needed', value: entry.support_needed, icon: Users },
    { label: language === 'zh' ? '压力感' : 'Stressed', value: entry.daily_soc_stressed, icon: MessageCircle },
    { label: language === 'zh' ? '隐私感' : 'Privacy', value: entry.daily_soc_privacy, icon: MessageCircle },
    { label: language === 'zh' ? '紧张感' : 'Strained', value: entry.daily_soc_strained, icon: MessageCircle },
  ].filter(f => f.value);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <DesktopHeader />
      <MobileHeader />
      <div className="max-w-2xl mx-auto px-5 py-5 pb-24 md:pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => navigate('/timeline')}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <ArrowLeft className="w-[18px] h-[18px]" style={{ color: 'var(--text-primary)' }} />
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
              style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            >
              <Edit2 className="w-4 h-4" style={{ color: 'var(--color-green)' }} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
              style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            >
              <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
            </button>
          </div>
        </div>

        {/* Entry Type Badge + Timestamp */}
        <div className="mb-5">
          <span
            className="inline-block px-3 py-1 rounded-full text-white text-[11px] font-semibold tracking-wide uppercase mb-2"
            style={{ backgroundColor: getEntryTypeColor(entry.entry_type) }}
          >
            {getEntryTypeLabel(entry.entry_type)}
          </span>
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)', letterSpacing: '-0.01em' }}>
            {formatDate(entry.entry_timestamp || entry.created_at)}
          </p>
        </div>

        {/* Fields */}
        <div className="space-y-2.5">
          {fields.map((field, i) => (
            <div 
              key={i} 
              className="p-4 rounded-2xl"
              style={{ 
                backgroundColor: 'white',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <field.icon className="w-3.5 h-3.5" style={{ color: 'var(--color-green)', opacity: 0.7 }} />
                <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{field.label}</span>
              </div>
              <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{field.value}</p>
            </div>
          ))}
          {fields.length === 0 && (
            <div className="text-center py-12 rounded-2xl" style={{ backgroundColor: 'white' }}>
              <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
                {language === 'zh' ? '此记录没有详细信息' : 'No details recorded for this entry'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
          <div 
            className="w-full sm:max-w-sm mx-4 sm:mx-auto rounded-2xl overflow-hidden"
            style={{ 
              backgroundColor: 'white',
              boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
              marginBottom: 'env(safe-area-inset-bottom, 16px)'
            }}
          >
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#fef2f2' }}>
                <Trash2 className="w-5 h-5" style={{ color: '#ef4444' }} />
              </div>
              <h3 className="text-[17px] font-semibold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {language === 'zh' ? '确认删除' : 'Delete Entry'}
              </h3>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {language === 'zh' ? '此操作无法撤销。' : 'This action cannot be undone.'}
              </p>
            </div>
            <div style={{ borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full py-3.5 text-[15px] font-semibold transition-colors disabled:opacity-50"
                style={{ color: '#ef4444' }}
              >
                {deleting ? (language === 'zh' ? '删除中...' : 'Deleting...') : (language === 'zh' ? '删除' : 'Delete')}
              </button>
            </div>
            <div style={{ borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-3.5 text-[15px] font-medium transition-colors"
                style={{ color: 'var(--color-green)' }}
              >
                {language === 'zh' ? '取消' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default EntryDetail;
