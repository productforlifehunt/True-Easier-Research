import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useStateManagement';
import { Moon, Save, Plus, ArrowLeft, CheckCircle, Trash2 } from 'lucide-react';
import IOSDropdown from '../components/ui/IOSDropdown';
import { useLanguage } from '../hooks/useLanguage';
import DesktopHeader from '../components/DesktopHeader';
import MobileHeader from '../components/MobileHeader';

const EndOfDaySurvey: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [existingSurvey, setExistingSurvey] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    soc_stressed: '',
    soc_privacy: '',
    soc_strained: '',
    daily_burden_rating: 0,
    supplement_notes: ''
  });

  const text = language === 'zh' ? {
    title: '每日结束问卷',
    subtitle: '回顾今天的照护经历',
    sectionSoc: '今日照护能力感',
    socHelper: '请根据今天的照护经历回答以下问题（1=完全不同意 到 7=完全同意）',
    q1: '今天我因照护责任感到压力',
    q2: '今天我觉得与被照护者的相处没有给我足够的隐私空间',
    q3: '今天我在与被照护者的互动中感到紧张',
    sectionBurden: '今日照护负担评分',
    burdenHelper: '总体而言，今天的照护对您来说感觉如何？',
    burdenLight: '-3 非常沉重',
    burdenHeavy: '+3 非常轻松',
    sectionSupplement: '补充记录',
    supplementHelper: '如果今天有未记录的照护活动，可以在此补充说明，或点击下方按钮添加详细的活动记录。',
    supplementPlaceholder: '今天还有什么想补充的...',
    addHourlyEntry: '添加补充活动记录',
    save: '保存',
    saving: '保存中...',
    savedMessage: '已保存！',
    back: '返回',
    select: '请选择',
    updating: '更新已有记录...',
    deleteEntry: '删除此记录',
    deleting: '删除中...'
  } : {
    title: 'End-of-Day Survey',
    subtitle: 'Reflect on today\'s caregiving experience',
    sectionSoc: 'Daily Sense of Competence',
    socHelper: 'Based on today\'s caregiving experience, please answer the following (1=Strongly Disagree to 7=Strongly Agree)',
    q1: 'Today I felt stressed due to my care responsibilities',
    q2: 'Today I felt that the situation with my care recipient did not allow me as much privacy as I would have liked',
    q3: 'Today I felt strained in the interactions with my care recipient',
    sectionBurden: 'Daily Burden Rating',
    burdenHelper: 'Overall, how did caregiving feel for you today?',
    burdenLight: '-3 Very burdensome',
    burdenHeavy: '+3 Very manageable',
    sectionSupplement: 'Supplement Missed Logs',
    supplementHelper: 'If there are caregiving activities today that were not recorded during hourly reminders, you can add notes here or tap the button below to add a detailed entry.',
    supplementPlaceholder: 'Anything else to add about today...',
    addHourlyEntry: 'Add Supplemental Activity Entry',
    save: 'Save',
    saving: 'Saving...',
    savedMessage: 'Saved!',
    back: 'Back',
    select: 'Select',
    updating: 'Updating existing record...',
    deleteEntry: 'Delete This Entry',
    deleting: 'Deleting...'
  };

  const scaleOptions = [
    { value: '1', label: language === 'zh' ? '1 - 完全不同意' : '1 - Strongly Disagree' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: language === 'zh' ? '4 - 中立' : '4 - Neutral' },
    { value: '5', label: '5' },
    { value: '6', label: '6' },
    { value: '7', label: language === 'zh' ? '7 - 完全同意' : '7 - Strongly Agree' }
  ];

  // Load existing survey for today if it exists
  useEffect(() => {
    const loadExisting = async () => {
      if (!user?.id) return;
      try {
        const { data } = await supabase
          .from('end_of_day_surveys')
          .select('*')
          .eq('user_id', user.id)
          .eq('survey_date', today)
          .single();

        if (data) {
          setExistingSurvey(data);
          setFormData({
            soc_stressed: data.soc_stressed?.toString() || '',
            soc_privacy: data.soc_privacy?.toString() || '',
            soc_strained: data.soc_strained?.toString() || '',
            daily_burden_rating: data.daily_burden_rating || 0,
            supplement_notes: data.supplement_notes || ''
          });
        }
      } catch {
        // No existing survey for today - that's fine
      }
    };
    loadExisting();
  }, [user?.id, today]);

  const handleSubmit = async () => {
    if (!user?.id) return;
    setIsSubmitting(true);
    try {
      const payload = {
        user_id: user.id,
        survey_date: today,
        entry_timestamp: new Date().toISOString(),
        soc_stressed: formData.soc_stressed ? parseInt(formData.soc_stressed) : null,
        soc_privacy: formData.soc_privacy ? parseInt(formData.soc_privacy) : null,
        soc_strained: formData.soc_strained ? parseInt(formData.soc_strained) : null,
        daily_burden_rating: formData.daily_burden_rating,
        supplement_notes: formData.supplement_notes || null,
        updated_at: new Date().toISOString()
      };

      if (existingSurvey) {
        // Update existing
        const { error } = await supabase
          .from('end_of_day_surveys')
          .update(payload)
          .eq('id', existingSurvey.id);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('end_of_day_surveys')
          .insert([payload]);
        if (error) throw error;
      }

      setSaved(true);
      setTimeout(() => {
        navigate('/summary');
      }, 1500);
    } catch (error) {
      console.error('Error saving end-of-day survey:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingSurvey) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('end_of_day_surveys')
        .delete()
        .eq('id', existingSurvey.id);
      if (error) throw error;
      navigate('/summary');
    } catch (error) {
      console.error('Error deleting daily survey:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (saved) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-green)' }} />
          <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{text.savedMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <DesktopHeader />
      <MobileHeader />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:opacity-80"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <ArrowLeft className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5" style={{ color: 'var(--color-green)' }} />
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{text.title}</h1>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{text.subtitle}</p>
          </div>
        </div>

        {existingSurvey && (
          <div className="mb-4 px-3 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
            {text.updating}
          </div>
        )}

        {/* Section 4.2: Sense of Competence */}
        <div className="mb-4 p-4 rounded-xl border" style={{ backgroundColor: 'white', borderColor: 'var(--border-light)', overflow: 'visible' }}>
          <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-green)' }}>
            {text.sectionSoc}
          </h2>
          <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
            {text.socHelper}
          </p>

          <div className="space-y-3">
            {/* Q1: Stressed */}
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-primary)' }}>
                1. {text.q1}
              </p>
              <IOSDropdown
                value={formData.soc_stressed}
                onChange={(value) => setFormData({ ...formData, soc_stressed: value })}
                placeholder={text.select}
                options={scaleOptions}
              />
            </div>

            {/* Q2: Privacy */}
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-primary)' }}>
                2. {text.q2}
              </p>
              <IOSDropdown
                value={formData.soc_privacy}
                onChange={(value) => setFormData({ ...formData, soc_privacy: value })}
                placeholder={text.select}
                options={scaleOptions}
              />
            </div>

            {/* Q3: Strained */}
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-primary)' }}>
                3. {text.q3}
              </p>
              <IOSDropdown
                value={formData.soc_strained}
                onChange={(value) => setFormData({ ...formData, soc_strained: value })}
                placeholder={text.select}
                options={scaleOptions}
              />
            </div>
          </div>
        </div>

        {/* Section 4.3: Daily Burden Rating */}
        <div className="mb-4 p-4 rounded-xl border" style={{ backgroundColor: 'white', borderColor: 'var(--border-light)' }}>
          <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-green)' }}>
            {text.sectionBurden}
          </h2>
          <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
            {text.burdenHelper}
          </p>
          <div className="px-1">
            <input
              type="range"
              min="-3"
              max="3"
              value={formData.daily_burden_rating}
              onChange={(e) => setFormData({ ...formData, daily_burden_rating: parseInt(e.target.value) })}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #ef4444 0%, #fbbf24 50%, #10b981 100%)`
              }}
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              <span>{text.burdenLight}</span>
              <span className="font-semibold" style={{ color: 'var(--color-green)' }}>{formData.daily_burden_rating}</span>
              <span>{text.burdenHeavy}</span>
            </div>
          </div>
        </div>

        {/* Section 4.1: Supplement Missed Logs */}
        <div className="mb-4 p-4 rounded-xl border" style={{ backgroundColor: 'white', borderColor: 'var(--border-light)' }}>
          <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-green)' }}>
            {text.sectionSupplement}
          </h2>
          <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
            {text.supplementHelper}
          </p>
          <textarea
            value={formData.supplement_notes}
            onChange={(e) => setFormData({ ...formData, supplement_notes: e.target.value })}
            placeholder={text.supplementPlaceholder}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border text-sm resize-none"
            style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
          />
          <button
            onClick={() => navigate('/add-entry')}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all hover:shadow-sm"
            style={{ borderColor: 'var(--color-green)', color: 'var(--color-green)', backgroundColor: 'white' }}
          >
            <Plus className="w-4 h-4" />
            {text.addHourlyEntry}
          </button>
        </div>

        {/* Helper text - show when no fields filled */}
        {!formData.soc_stressed && 
         !formData.soc_privacy && 
         !formData.soc_strained && 
         formData.daily_burden_rating === 0 && 
         !formData.supplement_notes && (
          <div className="w-full p-3 rounded-lg mb-3" style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <p className="text-xs text-center" style={{ color: 'var(--color-green)' }}>
              {language === 'zh' 
                ? '💡 提示：至少填写一个字段即可保存记录' 
                : '💡 Tip: Fill in at least one field to save your entry'}
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || (
            !formData.soc_stressed && 
            !formData.soc_privacy && 
            !formData.soc_strained && 
            formData.daily_burden_rating === 0 && 
            !formData.supplement_notes
          )}
          className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ backgroundColor: 'var(--color-green)' }}
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? text.saving : text.save}
        </button>

        {/* Delete button - only show when editing existing entry */}
        {existingSurvey && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full mt-3 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#ef4444' }}
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? text.deleting : text.deleteEntry}
          </button>
        )}
      </div>
    </div>
  );
};

export default EndOfDaySurvey;
