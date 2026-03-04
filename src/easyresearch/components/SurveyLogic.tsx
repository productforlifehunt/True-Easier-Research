import React, { useState } from 'react';
import { ArrowRight, Plus, Trash2, GitBranch, ChevronDown } from 'lucide-react';
import CustomDropdown from './CustomDropdown';
import { type LogicRule } from '../utils/logicEngine';
import type { QuestionnaireConfig } from './QuestionnaireList';

const CONDITIONS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'is_empty', label: 'Is Empty' },
  { value: 'is_not_empty', label: 'Is Not Empty' },
  { value: 'any_selected', label: 'Any Selected' },
  { value: 'none_selected', label: 'None Selected' },
];

const ACTIONS = [
  { value: 'skip', label: 'Skip to' },
  { value: 'show', label: 'Show' },
  { value: 'hide', label: 'Hide' },
  { value: 'disqualify', label: 'Disqualify' },
  { value: 'end_survey', label: 'End Survey' },
];

interface SurveyLogicProps {
  questionnaires: QuestionnaireConfig[];
  projectId?: string;
  logicRules: LogicRule[];
  onUpdateLogic: (rules: LogicRule[]) => void;
}

const SurveyLogic: React.FC<SurveyLogicProps> = ({ questionnaires, projectId, logicRules, onUpdateLogic }) => {
  const [selectedQId, setSelectedQId] = useState<string>(questionnaires[0]?.id || '');
  const selectedQ = questionnaires.find(q => q.id === selectedQId);
  const questions = selectedQ?.questions || [];
  const qRules = logicRules.filter(r => r.questionnaireId === selectedQId);

  const addRule = () => {
    if (!selectedQId || !projectId) return;
    const newRule: LogicRule = {
      id: crypto.randomUUID(),
      projectId: projectId,
      questionnaireId: selectedQId,
      sourceQuestionId: questions[0]?.id || '',
      condition: 'equals',
      value: '',
      action: 'skip',
      targetQuestionId: questions[1]?.id || '',
      orderIndex: qRules.length,
      enabled: true,
    };
    onUpdateLogic([...logicRules, newRule]);
  };

  const updateRule = (ruleId: string, field: string, value: any) => {
    onUpdateLogic(logicRules.map(r => {
      if (r.id !== ruleId) return r;
      const updated = { ...r, [field]: value };
      // Clear target when switching to terminal actions
      if (field === 'action' && !needsTarget(value as string)) {
        updated.targetQuestionId = null;
      }
      return updated;
    }));
  };

  const deleteRule = (ruleId: string) => {
    onUpdateLogic(logicRules.filter(r => r.id !== ruleId));
  };

  const toggleRule = (ruleId: string) => {
    onUpdateLogic(logicRules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
  };

  const needsTarget = (action: string) => !['disqualify', 'end_survey'].includes(action);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[17px] font-semibold tracking-tight text-stone-800">Logic</h2>
          <p className="text-[13px] text-stone-400 mt-0.5 font-light">Skip, show, hide, or disqualify based on responses — per questionnaire</p>
        </div>
        <button onClick={addRule} disabled={!selectedQId || questions.length < 1}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm shadow-emerald-200 disabled:opacity-40">
          <Plus size={14} /> Add Rule
        </button>
      </div>

      {/* Questionnaire selector */}
      {questionnaires.length > 1 && (
        <div className="flex items-center gap-2">
          <label className="text-[12px] font-medium text-stone-400">Questionnaire:</label>
          <select value={selectedQId} onChange={(e) => setSelectedQId(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-[13px] border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
            {questionnaires.map(q => (
              <option key={q.id} value={q.id}>{q.title || q.questionnaire_type}</option>
            ))}
          </select>
          <span className="text-[11px] text-stone-300">{qRules.length} rule{qRules.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {qRules.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-16 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
            <GitBranch className="text-emerald-500" size={24} />
          </div>
          <h3 className="text-[15px] font-semibold text-stone-800 mb-1.5">No logic rules</h3>
          <p className="text-[13px] text-stone-400 mb-5 max-w-sm mx-auto font-light">
            {questions.length < 1
              ? 'Add questions to this questionnaire first.'
              : 'Create conditional logic to personalize the survey flow.'}
          </p>
          {questions.length >= 1 && (
            <button onClick={addRule} className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm shadow-emerald-200">
              Create First Rule
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {qRules.map((rule) => (
            <div key={rule.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${rule.enabled ? 'border-stone-100' : 'border-stone-200 opacity-50'}`}>
              <div className="flex items-start gap-3">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1.5">IF Question</label>
                    <CustomDropdown
                      options={questions.map((q, i) => ({ value: q.id, label: `Q${i + 1}: ${q.question_text?.substring(0, 25)}...` }))}
                      value={rule.sourceQuestionId}
                      onChange={(v) => updateRule(rule.id, 'sourceQuestionId', v)}
                      placeholder="Select question"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1.5">Condition</label>
                    <CustomDropdown options={CONDITIONS} value={rule.condition} onChange={(v) => updateRule(rule.id, 'condition', v)} placeholder="Condition" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1.5">Value</label>
                    <input type="text" value={rule.value} onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" placeholder="Value..." />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1.5">THEN</label>
                    <CustomDropdown options={ACTIONS} value={rule.action} onChange={(v) => updateRule(rule.id, 'action', v as any)} placeholder="Action" />
                  </div>
                </div>
                <div className="flex flex-col gap-1 mt-5">
                  <button onClick={() => toggleRule(rule.id)} className="p-1.5 rounded-lg hover:bg-stone-50 transition-colors" title={rule.enabled ? 'Disable' : 'Enable'}>
                    <ChevronDown size={14} className={`text-stone-400 transition-transform ${rule.enabled ? '' : 'rotate-90'}`} />
                  </button>
                  <button onClick={() => deleteRule(rule.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
              {needsTarget(rule.action) && (
                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2">
                  <ArrowRight size={14} className="text-emerald-500 shrink-0" />
                  <CustomDropdown
                    options={[{ value: '', label: 'Select target' }, ...questions.filter(q => q.id !== rule.sourceQuestionId).map((q, i) => ({ value: q.id, label: `Q${questions.indexOf(q) + 1}: ${q.question_text?.substring(0, 40)}...` }))]}
                    value={rule.targetQuestionId || ''}
                    onChange={(v) => updateRule(rule.id, 'targetQuestionId', v)}
                    placeholder="Target question"
                    className="flex-1"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {qRules.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <h3 className="text-[14px] font-semibold text-stone-800 mb-3">Flow Summary</h3>
          <div className="space-y-1.5">
            {qRules.filter(r => r.enabled).map((rule, index) => {
              const sourceQ = questions.find(q => q.id === rule.sourceQuestionId);
              const targetQ = rule.targetQuestionId ? questions.find(q => q.id === rule.targetQuestionId) : null;
              return (
                <div key={rule.id} className="flex items-center gap-2 text-[12px] text-stone-500">
                  <span className="font-medium text-emerald-600">Rule {index + 1}:</span>
                  <span>IF "{sourceQ?.question_text?.substring(0, 25)}..." {rule.condition} "{rule.value}"</span>
                  <ArrowRight size={12} className="text-stone-300" />
                  <span>
                    {rule.action.toUpperCase()}
                    {needsTarget(rule.action) && targetQ ? ` "${targetQ.question_text?.substring(0, 25)}..."` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyLogic;
