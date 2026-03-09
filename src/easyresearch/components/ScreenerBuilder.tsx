import React, { useState } from 'react';
import { ShieldCheck, Plus, Trash2, ArrowRight, GitBranch, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface ScreenerCriteria {
  id: string;
  questionText: string;
  questionTextZh: string;
  type: 'single_choice' | 'multi_choice' | 'age_range' | 'location' | 'custom';
  options: { id: string; text: string; qualifies: boolean }[];
  isRequired: boolean;
  disqualifyMessage: string;
  logic: 'and' | 'or';
}

interface Props {
  projectId: string;
}

// Visual screener builder with branching qualification logic
// 带分支资格逻辑的可视化筛选器构建器
const ScreenerBuilder: React.FC<Props> = ({ projectId }) => {
  const [criteria, setCriteria] = useState<ScreenerCriteria[]>([
    {
      id: 'sc_1', questionText: 'What is your age range?', questionTextZh: '您的年龄范围是？',
      type: 'single_choice', isRequired: true, disqualifyMessage: 'Sorry, you do not qualify for this study.',
      logic: 'and',
      options: [
        { id: 'o1', text: '18-24', qualifies: true },
        { id: 'o2', text: '25-34', qualifies: true },
        { id: 'o3', text: '35-44', qualifies: true },
        { id: 'o4', text: '45-54', qualifies: false },
        { id: 'o5', text: '55+', qualifies: false },
        { id: 'o6', text: 'Under 18', qualifies: false },
      ],
    },
  ]);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewStep, setPreviewStep] = useState(0);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, string>>({});

  const addCriteria = () => {
    const newC: ScreenerCriteria = {
      id: `sc_${Date.now()}`, questionText: '', questionTextZh: '', type: 'single_choice',
      isRequired: true, disqualifyMessage: 'You do not qualify for this study.', logic: 'and',
      options: [
        { id: `o_${Date.now()}_1`, text: 'Option 1', qualifies: true },
        { id: `o_${Date.now()}_2`, text: 'Option 2', qualifies: false },
      ],
    };
    setCriteria(prev => [...prev, newC]);
  };

  const updateCriteria = (id: string, updates: Partial<ScreenerCriteria>) => {
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeCriteria = (id: string) => setCriteria(prev => prev.filter(c => c.id !== id));

  const addOption = (criteriaId: string) => {
    setCriteria(prev => prev.map(c => c.id === criteriaId ? {
      ...c, options: [...c.options, { id: `o_${Date.now()}`, text: '', qualifies: true }]
    } : c));
  };

  const updateOption = (criteriaId: string, optionId: string, updates: Partial<{ text: string; qualifies: boolean }>) => {
    setCriteria(prev => prev.map(c => c.id === criteriaId ? {
      ...c, options: c.options.map(o => o.id === optionId ? { ...o, ...updates } : o)
    } : c));
  };

  const removeOption = (criteriaId: string, optionId: string) => {
    setCriteria(prev => prev.map(c => c.id === criteriaId ? {
      ...c, options: c.options.filter(o => o.id !== optionId)
    } : c));
  };

  const qualifyRate = useMemo(() => {
    if (criteria.length === 0) return 100;
    const avgRate = criteria.reduce((acc, c) => {
      const total = c.options.length;
      const qualifying = c.options.filter(o => o.qualifies).length;
      return acc * (total > 0 ? qualifying / total : 1);
    }, 1);
    return Math.round(avgRate * 100);
  }, [criteria]);

  // Preview simulation / 预览模拟
  const handlePreviewAnswer = (criteriaId: string, optionId: string) => {
    setPreviewAnswers(prev => ({ ...prev, [criteriaId]: optionId }));
    const c = criteria.find(cr => cr.id === criteriaId);
    const opt = c?.options.find(o => o.id === optionId);
    if (opt && !opt.qualifies) {
      // Disqualified — stay on this step / 不合格 — 停留在当前步骤
    } else if (previewStep < criteria.length - 1) {
      setPreviewStep(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck size={22} className="text-emerald-600" />
          <div>
            <h2 className="text-lg font-bold text-stone-800">Screener Builder / 筛选器构建器</h2>
            <p className="text-xs text-stone-500">Define qualification criteria for participant screening / 定义参与者筛选的资格标准</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-emerald-50 rounded-lg">
            <span className="text-xs font-semibold text-emerald-700">Est. qualify rate: {qualifyRate}% / 预计合格率</span>
          </div>
          <button onClick={() => { setPreviewMode(!previewMode); setPreviewStep(0); setPreviewAnswers({}); }}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${previewMode ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
            {previewMode ? 'Exit Preview / 退出预览' : 'Preview / 预览'}
          </button>
        </div>
      </div>

      {!previewMode ? (
        <>
          {/* Criteria list / 标准列表 */}
          <div className="space-y-4">
            {criteria.map((c, idx) => (
              <div key={c.id} className="bg-white rounded-xl border border-stone-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                    <select value={c.type} onChange={e => updateCriteria(c.id, { type: e.target.value as any })}
                      className="text-xs px-2 py-1 border border-stone-200 rounded bg-white">
                      <option value="single_choice">Single Choice / 单选</option>
                      <option value="multi_choice">Multi Choice / 多选</option>
                      <option value="age_range">Age Range / 年龄范围</option>
                      <option value="location">Location / 位置</option>
                      <option value="custom">Custom / 自定义</option>
                    </select>
                    {idx > 0 && (
                      <select value={c.logic} onChange={e => updateCriteria(c.id, { logic: e.target.value as 'and' | 'or' })}
                        className="text-xs px-2 py-1 border border-stone-200 rounded bg-white font-semibold text-emerald-700">
                        <option value="and">AND / 且</option>
                        <option value="or">OR / 或</option>
                      </select>
                    )}
                  </div>
                  <button onClick={() => removeCriteria(c.id)} className="p-1 text-stone-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>

                <input value={c.questionText} onChange={e => updateCriteria(c.id, { questionText: e.target.value })}
                  placeholder="Screening question (EN)..." className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg mb-2" />
                <input value={c.questionTextZh} onChange={e => updateCriteria(c.id, { questionTextZh: e.target.value })}
                  placeholder="筛选问题（中文）..." className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg mb-3" />

                <div className="space-y-2">
                  {c.options.map(opt => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <button onClick={() => updateOption(c.id, opt.id, { qualifies: !opt.qualifies })}
                        className={`shrink-0 ${opt.qualifies ? 'text-emerald-500' : 'text-red-400'}`}>
                        {opt.qualifies ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      </button>
                      <input value={opt.text} onChange={e => updateOption(c.id, opt.id, { text: e.target.value })}
                        placeholder="Option text..." className="flex-1 px-2 py-1.5 text-sm border border-stone-200 rounded-lg" />
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${opt.qualifies ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                        {opt.qualifies ? 'QUALIFY' : 'DQ'}
                      </span>
                      <button onClick={() => removeOption(c.id, opt.id)} className="text-stone-400 hover:text-red-500"><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
                <button onClick={() => addOption(c.id)} className="mt-2 text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                  <Plus size={12} /> Add Option / 添加选项
                </button>
              </div>
            ))}
          </div>

          <button onClick={addCriteria}
            className="w-full py-3 border-2 border-dashed border-stone-200 rounded-xl text-sm text-stone-500 hover:border-emerald-400 hover:text-emerald-600 flex items-center justify-center gap-2 transition-colors">
            <Plus size={16} /> Add Screening Criteria / 添加筛选标准
          </button>

          {/* Flow visualization / 流程可视化 */}
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <h4 className="text-xs font-semibold text-stone-500 uppercase mb-3">Screening Flow / 筛选流程</h4>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <div className="px-3 py-2 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg shrink-0">Start / 开始</div>
              {criteria.map((c, i) => (
                <React.Fragment key={c.id}>
                  <ArrowRight size={14} className="text-stone-300 shrink-0" />
                  <div className="px-3 py-2 bg-stone-50 text-stone-600 text-xs rounded-lg shrink-0 border border-stone-200 max-w-[150px] truncate">
                    {c.questionText || `Q${i + 1}`}
                  </div>
                </React.Fragment>
              ))}
              <ArrowRight size={14} className="text-stone-300 shrink-0" />
              <div className="px-3 py-2 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg shrink-0">Qualified / 合格 ✓</div>
            </div>
          </div>
        </>
      ) : (
        /* Preview mode / 预览模式 */
        <div className="max-w-md mx-auto">
          {criteria[previewStep] && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <div className="text-xs text-stone-400 mb-4">Question {previewStep + 1} of {criteria.length} / 第{previewStep + 1}题 共{criteria.length}题</div>
              <h3 className="text-lg font-semibold text-stone-800 mb-1">{criteria[previewStep].questionText}</h3>
              <p className="text-sm text-stone-500 mb-4">{criteria[previewStep].questionTextZh}</p>
              <div className="space-y-2">
                {criteria[previewStep].options.map(opt => {
                  const selected = previewAnswers[criteria[previewStep].id] === opt.id;
                  const disqualified = selected && !opt.qualifies;
                  return (
                    <button key={opt.id} onClick={() => handlePreviewAnswer(criteria[previewStep].id, opt.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${selected ? (disqualified ? 'bg-red-50 border-red-300 text-red-700' : 'bg-emerald-50 border-emerald-300 text-emerald-700') : 'border-stone-200 text-stone-600 hover:bg-stone-50'}`}>
                      {opt.text}
                      {disqualified && <span className="ml-2 text-xs text-red-500">✗ Disqualified</span>}
                    </button>
                  );
                })}
              </div>
              {previewAnswers[criteria[previewStep].id] && !criteria[previewStep].options.find(o => o.id === previewAnswers[criteria[previewStep].id])?.qualifies && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg flex items-center gap-2 text-sm text-red-600">
                  <AlertTriangle size={16} /> {criteria[previewStep].disqualifyMessage}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScreenerBuilder;
