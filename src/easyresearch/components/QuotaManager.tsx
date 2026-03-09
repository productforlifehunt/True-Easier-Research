/**
 * Quota Manager — Control sample sizes per segment
 * 配额管理 — 按细分控制样本量
 * 
 * Allows researchers to:
 * - Define quotas per participant segment (age, gender, location, custom)
 * - Set target counts and track progress
 * - Auto-close segments when quota is met
 * - Cross-quota rules (e.g., min 30 per age group AND balanced gender)
 */
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Target, Check, AlertTriangle, BarChart3, Users, Percent } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ParticipantType } from './ParticipantTypeManager';

interface QuotaRule {
  id: string;
  field: string;       // question_id or demographic field
  fieldLabel: string;   // human-readable label
  value: string;        // expected value
  target: number;       // target count
  current: number;      // current count (from responses)
  autoClose: boolean;   // auto-close when met
}

interface QuotaManagerProps {
  projectId: string;
  participantTypes: ParticipantType[];
  questions?: any[];
}

const QuotaManager: React.FC<QuotaManagerProps> = ({ projectId, participantTypes, questions = [] }) => {
  const [quotas, setQuotas] = useState<QuotaRule[]>([]);
  const [totalTarget, setTotalTarget] = useState(100);
  const [loading, setLoading] = useState(false);

  // Load existing quotas from project config
  useEffect(() => {
    loadQuotas();
  }, [projectId]);

  const loadQuotas = async () => {
    try {
      setLoading(true);
      // Load project quota config
      const { data: project } = await supabase
        .from('research_project')
        .select('quota_config, target_participants')
        .eq('id', projectId)
        .maybeSingle();

      if (project?.target_participants) setTotalTarget(project.target_participants);

      if (project?.quota_config) {
        try {
          const config = typeof project.quota_config === 'string'
            ? JSON.parse(project.quota_config) : project.quota_config;
          if (Array.isArray(config)) setQuotas(config);
        } catch { /* skip */ }
      }

      // Load current counts from enrollments
      const { data: enrollments } = await supabase
        .from('enrollment')
        .select('id, status, participant_type')
        .eq('project_id', projectId);

      // Update current counts based on enrollments
      if (enrollments) {
        setQuotas(prev => prev.map(q => {
          if (q.field === 'participant_type') {
            const count = enrollments.filter(e => e.participant_type === q.value && e.status !== 'disqualified').length;
            return { ...q, current: count };
          }
          return q;
        }));
      }
    } catch (e) {
      console.error('Error loading quotas:', e);
    } finally {
      setLoading(false);
    }
  };

  const saveQuotas = async () => {
    try {
      await supabase
        .from('research_project')
        .update({
          quota_config: JSON.stringify(quotas),
          target_participants: totalTarget
        })
        .eq('id', projectId);
    } catch (e) {
      console.error('Error saving quotas:', e);
    }
  };

  const addQuota = () => {
    const newQuota: QuotaRule = {
      id: crypto.randomUUID(),
      field: 'participant_type',
      fieldLabel: 'Participant Type',
      value: participantTypes[0]?.id || '',
      target: Math.round(totalTarget / (quotas.length + 1)),
      current: 0,
      autoClose: true,
    };
    setQuotas([...quotas, newQuota]);
  };

  const updateQuota = (id: string, updates: Partial<QuotaRule>) => {
    setQuotas(quotas.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuota = (id: string) => {
    setQuotas(quotas.filter(q => q.id !== id));
  };

  const totalCurrentCount = quotas.reduce((sum, q) => sum + q.current, 0);
  const totalTargetCount = quotas.reduce((sum, q) => sum + q.target, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalCurrentCount / totalTarget) * 100) : 0;

  // Available fields for quota segmentation / 可用的配额细分字段
  const availableFields = [
    { value: 'participant_type', label: 'Participant Type / 参与者类型' },
    ...(questions || [])
      .filter(q => ['single_choice', 'dropdown', 'yes_no'].includes(q.question_type))
      .map(q => ({ value: q.id, label: q.question_text?.substring(0, 40) || 'Unnamed Q' }))
  ];

  return (
    <div className="space-y-5">
      {/* Overview Stats / 概览统计 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-stone-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target size={14} className="text-emerald-500" />
            <span className="text-[11px] text-stone-400 uppercase tracking-wider">Total Target / 总目标</span>
          </div>
          <input
            type="number"
            value={totalTarget}
            onChange={e => setTotalTarget(parseInt(e.target.value) || 0)}
            onBlur={saveQuotas}
            className="text-2xl font-bold text-stone-800 bg-transparent border-none outline-none w-full"
          />
        </div>
        <div className="bg-white rounded-xl border border-stone-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} className="text-blue-500" />
            <span className="text-[11px] text-stone-400 uppercase tracking-wider">Current / 当前</span>
          </div>
          <p className="text-2xl font-bold text-stone-800">{totalCurrentCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Percent size={14} className="text-violet-500" />
            <span className="text-[11px] text-stone-400 uppercase tracking-wider">Progress / 进度</span>
          </div>
          <p className="text-2xl font-bold text-stone-800">{overallProgress}%</p>
          <div className="w-full h-2 bg-stone-100 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, overallProgress)}%`,
                backgroundColor: overallProgress >= 100 ? '#10b981' : overallProgress >= 75 ? '#06b6d4' : '#f59e0b'
              }}
            />
          </div>
        </div>
      </div>

      {/* Quota Rules / 配额规则 */}
      <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
          <h3 className="text-[13px] font-semibold text-stone-800 flex items-center gap-2">
            <BarChart3 size={14} className="text-emerald-500" />
            Quota Rules / 配额规则
          </h3>
          <button
            onClick={addQuota}
            className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            <Plus size={12} /> Add Rule / 添加规则
          </button>
        </div>

        {quotas.length === 0 ? (
          <div className="p-8 text-center text-stone-400">
            <Target size={24} className="mx-auto mb-2 opacity-30" />
            <p className="text-[12px]">No quota rules defined / 未定义配额规则</p>
            <p className="text-[11px] mt-1">Add rules to control sample composition / 添加规则以控制样本构成</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-50">
            {quotas.map(quota => {
              const progress = quota.target > 0 ? Math.round((quota.current / quota.target) * 100) : 0;
              const isMet = quota.current >= quota.target;

              return (
                <div key={quota.id} className="px-5 py-3 flex items-center gap-4">
                  {/* Status icon */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    isMet ? 'bg-emerald-100' : progress >= 75 ? 'bg-blue-100' : 'bg-stone-100'
                  }`}>
                    {isMet ? <Check size={13} className="text-emerald-600" /> : <Target size={13} className="text-stone-400" />}
                  </div>

                  {/* Field selector */}
                  <select
                    value={quota.field}
                    onChange={e => updateQuota(quota.id, { field: e.target.value, fieldLabel: availableFields.find(f => f.value === e.target.value)?.label || '' })}
                    className="text-[11px] px-2 py-1.5 rounded-lg border border-stone-200 bg-white"
                  >
                    {availableFields.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>

                  {/* Value */}
                  {quota.field === 'participant_type' ? (
                    <select
                      value={quota.value}
                      onChange={e => updateQuota(quota.id, { value: e.target.value })}
                      className="text-[11px] px-2 py-1.5 rounded-lg border border-stone-200 bg-white"
                    >
                      {participantTypes.map(pt => (
                        <option key={pt.id} value={pt.id}>{pt.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={quota.value}
                      onChange={e => updateQuota(quota.id, { value: e.target.value })}
                      placeholder="Value"
                      className="text-[11px] px-2 py-1.5 rounded-lg border border-stone-200 w-28"
                    />
                  )}

                  {/* Target input */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-stone-400">Target:</span>
                    <input
                      type="number"
                      value={quota.target}
                      onChange={e => updateQuota(quota.id, { target: parseInt(e.target.value) || 0 })}
                      onBlur={saveQuotas}
                      className="text-[12px] font-medium text-stone-700 w-14 px-1.5 py-1 rounded border border-stone-200 text-center"
                    />
                  </div>

                  {/* Progress */}
                  <div className="flex-1 min-w-[100px]">
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="text-stone-500">{quota.current}/{quota.target}</span>
                      <span className={isMet ? 'text-emerald-600 font-medium' : 'text-stone-400'}>{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, progress)}%`,
                          backgroundColor: isMet ? '#10b981' : progress >= 75 ? '#06b6d4' : '#f59e0b'
                        }}
                      />
                    </div>
                  </div>

                  {/* Auto-close toggle */}
                  <label className="flex items-center gap-1 text-[10px] text-stone-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quota.autoClose}
                      onChange={e => { updateQuota(quota.id, { autoClose: e.target.checked }); saveQuotas(); }}
                      className="w-3.5 h-3.5 rounded accent-emerald-500"
                    />
                    Auto-close
                  </label>

                  {/* Delete */}
                  <button
                    onClick={() => { removeQuota(quota.id); setTimeout(saveQuotas, 100); }}
                    className="text-stone-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Warnings / 警告 */}
      {totalTargetCount !== totalTarget && totalTargetCount > 0 && (
        <div className="flex items-center gap-2 text-[11px] text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          <AlertTriangle size={13} />
          Quota targets ({totalTargetCount}) don't sum to total target ({totalTarget}) / 配额目标({totalTargetCount})与总目标({totalTarget})不一致
        </div>
      )}
    </div>
  );
};

export default QuotaManager;
