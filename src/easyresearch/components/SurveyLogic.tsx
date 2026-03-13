import React, { useState } from 'react';
import { ArrowRight, Plus, Trash2, GitBranch, ChevronDown, Link2, Calculator, TextCursorInput, Shield, Layers } from 'lucide-react';
import CustomDropdown from './CustomDropdown';
import { type LogicRule, type LogicAction } from '../utils/logicEngine';
import type { QuestionnaireConfig } from './QuestionnaireList';
import { useI18n } from '../hooks/useI18n';

const NO_VALUE_CONDITIONS = ['is_empty', 'is_not_empty'];
const TERMINAL_ACTIONS = ['disqualify', 'end_survey', 'require_before_next', 'validate_format', 'randomize_questions', 'quota_check', 'loop_block'];
const QUESTIONNAIRE_ACTIONS = ['show_questionnaire', 'hide_questionnaire'];
const ADVANCED_ACTIONS = ['calculate', 'pipe_answer', 'validate_format', 'require_before_next', 'randomize_questions', 'show_variant', 'quota_check', 'loop_block'];

interface SurveyLogicProps {
  questionnaires: QuestionnaireConfig[];
  projectId?: string;
  logicRules: LogicRule[];
  onUpdateLogic: (rules: LogicRule[]) => void;
}

const SurveyLogic: React.FC<SurveyLogicProps> = ({ questionnaires, projectId, logicRules, onUpdateLogic }) => {
  const { t } = useI18n();
  const [selectedQId, setSelectedQId] = useState<string>('__all__');
  const selectedQ = selectedQId === '__all__' ? null : questionnaires.find(q => q.id === selectedQId);
  const questions = selectedQId === '__all__'
    ? questionnaires.flatMap(q => q.questions || [])
    : (selectedQ?.questions || []);
  const qRules = selectedQId === '__all__'
    ? logicRules
    : logicRules.filter(r => r.questionnaireId === selectedQId);

  // Localized conditions / 本地化条件
  const CONDITIONS = [
    { value: 'equals', label: t('sl.equals') },
    { value: 'not_equals', label: t('sl.notEquals') },
    { value: 'contains', label: t('sl.contains') },
    { value: 'greater_than', label: t('sl.greaterThan') },
    { value: 'less_than', label: t('sl.lessThan') },
    { value: 'is_empty', label: t('sl.isEmpty') },
    { value: 'is_not_empty', label: t('sl.isNotEmpty') },
    { value: 'any_selected', label: t('sl.anySelected') },
    { value: 'none_selected', label: t('sl.noneSelected') },
    { value: 'date_before', label: t('sl.dateBefore') },
    { value: 'date_after', label: t('sl.dateAfter') },
    { value: 'date_between', label: t('sl.dateBetween') },
    { value: 'matches_regex', label: t('sl.matchesRegex') },
    { value: 'length_greater', label: t('sl.lengthGreater') },
    { value: 'length_less', label: t('sl.lengthLess') },
    { value: 'in_list', label: t('sl.inList') },
    { value: 'not_in_list', label: t('sl.notInList') },
    { value: 'url_param_equals', label: t('sl.urlParamEquals') },
    { value: 'url_param_contains', label: t('sl.urlParamContains') },
  ];

  // Localized actions / 本地化操作
  const ACTIONS = [
    { value: 'skip', label: t('sl.skip') },
    { value: 'show', label: t('sl.show') },
    { value: 'hide', label: t('sl.hide') },
    { value: 'disqualify', label: t('sl.disqualify') },
    { value: 'end_survey', label: t('sl.endSurvey') },
    { value: 'require_before_next', label: t('sl.require') },
    { value: 'validate_format', label: t('sl.validateFormat') },
    { value: 'calculate', label: t('sl.calculate') },
    { value: 'pipe_answer', label: t('sl.pipeAnswer') },
    { value: 'show_questionnaire', label: t('sl.showQuestionnaire') },
    { value: 'hide_questionnaire', label: t('sl.hideQuestionnaire') },
    { value: 'randomize_questions', label: t('sl.randomize') },
    { value: 'show_variant', label: t('sl.abVariant') },
    { value: 'quota_check', label: t('sl.quotaCheck') },
    { value: 'loop_block', label: t('sl.loopBlock') },
  ];

  const addRule = () => {
    const effectiveQId = selectedQId === '__all__' ? (questionnaires[0]?.id || '') : selectedQId;
    if (!effectiveQId || !projectId) return;
    const newRule: LogicRule = {
      id: crypto.randomUUID(),
      projectId: projectId,
      questionnaireId: effectiveQId,
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
      if (field === 'action') {
        if (!['skip', 'show', 'hide', 'calculate', 'pipe_answer'].includes(value)) {
          updated.targetQuestionId = null;
        }
        if (!['show_questionnaire', 'hide_questionnaire'].includes(value)) {
          updated.targetQuestionnaireId = null;
        }
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

  const needsQuestionTarget = (action: string) => ['skip', 'show', 'hide', 'calculate', 'pipe_answer'].includes(action);
  const needsQuestionnaireTarget = (action: string) => QUESTIONNAIRE_ACTIONS.includes(action);
  const needsValue = (condition: string) => !NO_VALUE_CONDITIONS.includes(condition);

  const existingGroups = Array.from(new Set(qRules.filter(r => r.conditionGroup).map(r => r.conditionGroup!)));

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[17px] font-semibold tracking-tight text-stone-800">{t('sl.logic')}</h2>
          <p className="text-[13px] text-stone-400 mt-0.5 font-light">{t('sl.description')}</p>
        </div>
        <button onClick={addRule} disabled={!selectedQId || questions.length < 1}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm shadow-emerald-200 disabled:opacity-40">
          <Plus size={14} /> {t('sl.addRule')}
        </button>
      </div>

      {/* Questionnaire selector / 问卷选择器 */}
      <div className="flex items-center gap-2">
        <label className="text-[12px] font-medium text-stone-400">{t('sl.questionnaire')}</label>
        <select value={selectedQId} onChange={(e) => setSelectedQId(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-[13px] border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
          <option value="__all__">{t('sl.allQuestionnaires')}</option>
          {questionnaires.map(q => (
            <option key={q.id} value={q.id}>{q.title || q.questionnaire_type}</option>
          ))}
        </select>
        <span className="text-[11px] text-stone-300">{qRules.length} {qRules.length !== 1 ? t('sl.rules') : t('sl.rule')}</span>
      </div>

      {qRules.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-16 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
            <GitBranch className="text-emerald-500" size={24} />
          </div>
          <h3 className="text-[15px] font-semibold text-stone-800 mb-1.5">{t('sl.noRules')}</h3>
          <p className="text-[13px] text-stone-400 mb-5 max-w-sm mx-auto font-light">
            {questions.length < 1 ? t('sl.addQuestionsFirst') : t('sl.createLogicDesc')}
          </p>
          {questions.length >= 1 && (
            <button onClick={addRule} className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-[13px] font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm shadow-emerald-200">
              {t('sl.createFirstRule')}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {qRules.map((rule) => (
            <div key={rule.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${rule.enabled ? 'border-stone-100' : 'border-stone-200 opacity-50'} ${rule.conditionGroup ? 'border-l-4 border-l-blue-400' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Source question */}
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1.5">{t('sl.ifQuestion')}</label>
                    <CustomDropdown
                      options={questions.map((q, i) => ({ value: q.id, label: `Q${i + 1}: ${q.question_text?.substring(0, 25)}...` }))}
                      value={rule.sourceQuestionId}
                      onChange={(v) => updateRule(rule.id, 'sourceQuestionId', v)}
                      placeholder={t('sl.selectQuestion')}
                    />
                  </div>
                  {/* Condition */}
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1.5">{t('sl.condition')}</label>
                    <CustomDropdown options={CONDITIONS} value={rule.condition} onChange={(v) => updateRule(rule.id, 'condition', v)} placeholder={t('sl.condition')} />
                  </div>
                  {/* Value */}
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1.5">{t('sl.value')}</label>
                    {needsValue(rule.condition) ? (
                      <input type="text" value={rule.value} onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                        placeholder={rule.condition === 'date_between' ? '2020-01-01,2025-12-31' : rule.condition === 'in_list' ? 'val1,val2,val3' : `${t('sl.value')}...`} />
                    ) : (
                      <div className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-100 bg-stone-50 text-stone-400">N/A</div>
                    )}
                  </div>
                  {/* Action */}
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1.5">{t('sl.then')}</label>
                    <CustomDropdown options={ACTIONS} value={rule.action} onChange={(v) => updateRule(rule.id, 'action', v as any)} placeholder={t('sl.then')} />
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

              {/* Target question */}
              {needsQuestionTarget(rule.action) && (
                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2">
                  <ArrowRight size={14} className="text-emerald-500 shrink-0" />
                  <CustomDropdown
                    options={[{ value: '', label: t('sl.selectTarget') }, ...questions.filter(q => q.id !== rule.sourceQuestionId).map((q) => ({ value: q.id, label: `Q${questions.indexOf(q) + 1}: ${q.question_text?.substring(0, 40)}...` }))]}
                    value={rule.targetQuestionId || ''}
                    onChange={(v) => updateRule(rule.id, 'targetQuestionId', v)}
                    placeholder={t('sl.selectTarget')}
                    className="flex-1"
                  />
                </div>
              )}

              {/* Target questionnaire */}
              {needsQuestionnaireTarget(rule.action) && (
                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2">
                  <Layers size={14} className="text-violet-500 shrink-0" />
                  <select value={rule.targetQuestionnaireId || ''} onChange={(e) => updateRule(rule.id, 'targetQuestionnaireId', e.target.value || null)}
                    className="flex-1 px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20">
                    <option value="">{t('sl.selectQuestionnaire')}</option>
                    {questionnaires.filter(q => q.id !== selectedQId).map(q => (
                      <option key={q.id} value={q.id}>{q.title}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Advanced fields row */}
              <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Condition Group */}
                <div>
                  <label className="block text-[11px] font-medium text-stone-400 mb-1.5">
                    <Link2 size={10} className="inline mr-1" />{t('sl.conditionGroup')}
                  </label>
                  <div className="flex gap-1.5">
                    <input type="text" value={rule.conditionGroup || ''} onChange={(e) => updateRule(rule.id, 'conditionGroup', e.target.value || null)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="group1" list={`groups-${rule.id}`} />
                    <datalist id={`groups-${rule.id}`}>
                      {existingGroups.map(g => <option key={g} value={g} />)}
                    </datalist>
                    {rule.conditionGroup && (
                      <select value={rule.groupOperator || 'and'} onChange={(e) => updateRule(rule.id, 'groupOperator', e.target.value)}
                        className="px-2 py-1.5 rounded-lg text-[12px] font-semibold border border-blue-200 bg-blue-50 text-blue-700">
                        <option value="and">AND</option>
                        <option value="or">OR</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Error message */}
                {(rule.action === 'require_before_next' || rule.action === 'validate_format') && (
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1.5">
                      <Shield size={10} className="inline mr-1" />{t('sl.errorMessage')}
                    </label>
                    <input type="text" value={rule.errorMessage || ''} onChange={(e) => updateRule(rule.id, 'errorMessage', e.target.value || null)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      placeholder="请填写此题 / Please fill in this question" />
                  </div>
                )}

                {/* Validation regex */}
                {rule.action === 'validate_format' && (
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1.5">
                      <TextCursorInput size={10} className="inline mr-1" />{t('sl.regexPattern')}
                    </label>
                    <input type="text" value={rule.validationRegex || ''} onChange={(e) => updateRule(rule.id, 'validationRegex', e.target.value || null)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      placeholder="^[a-zA-Z0-9._%+-]+@..." />
                  </div>
                )}

                {/* Calculation formula */}
                {rule.action === 'calculate' && (
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-medium text-stone-400 mb-1.5">
                      <Calculator size={10} className="inline mr-1" />{t('sl.formula')}
                    </label>
                    <input type="text" value={rule.calculationFormula || ''} onChange={(e) => updateRule(rule.id, 'calculationFormula', e.target.value || null)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      placeholder={'{{q-weight}} / (({{q-height}} / 100) * ({{q-height}} / 100))'} />
                  </div>
                )}

                {/* Piping template */}
                {rule.action === 'pipe_answer' && (
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-medium text-stone-400 mb-1.5">
                      <TextCursorInput size={10} className="inline mr-1" />{t('sl.pipingTemplate')}
                    </label>
                    <input type="text" value={rule.pipingTemplate || ''} onChange={(e) => updateRule(rule.id, 'pipingTemplate', e.target.value || null)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      placeholder={'您之前说您的孩子叫{{q3}}，{{q3}}今年几岁？'} />
                  </div>
                )}

                {/* Randomize count */}
                {rule.action === 'randomize_questions' && (
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1.5">{t('sl.showNRandom')}</label>
                    <input type="number" min={1} value={rule.randomizeCount || ''} onChange={(e) => updateRule(rule.id, 'randomizeCount', e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      placeholder="5" />
                    <p className="text-[10px] text-stone-300 mt-1">{t('sl.randomHint')}</p>
                  </div>
                )}

                {/* A/B Variant group */}
                {rule.action === 'show_variant' && (
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1.5">{t('sl.variantGroup')}</label>
                    <input type="text" value={rule.variantGroup || ''} onChange={(e) => updateRule(rule.id, 'variantGroup', e.target.value || null)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                      placeholder="ab-group-1" />
                    <p className="text-[10px] text-stone-300 mt-1">{t('sl.variantHint')}</p>
                  </div>
                )}

                {/* Quota control */}
                {rule.action === 'quota_check' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-400 mb-1.5">{t('sl.quotaLimit')}</label>
                      <input type="number" min={1} value={rule.quotaLimit || ''} onChange={(e) => updateRule(rule.id, 'quotaLimit', e.target.value ? Number(e.target.value) : null)}
                        className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        placeholder="100" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-400 mb-1.5">{t('sl.quotaField')}</label>
                      <input type="text" value={rule.quotaField || ''} onChange={(e) => updateRule(rule.id, 'quotaField', e.target.value || null)}
                        className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        placeholder="gender=male" />
                      <p className="text-[10px] text-stone-300 mt-1">{t('sl.quotaHint')}</p>
                    </div>
                  </>
                )}

                {/* Loop block */}
                {rule.action === 'loop_block' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-400 mb-1.5">{t('sl.loopCount')}</label>
                      <input type="number" min={1} value={rule.loopCount || ''} onChange={(e) => updateRule(rule.id, 'loopCount', e.target.value ? Number(e.target.value) : null)}
                        className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                        placeholder="3" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-400 mb-1.5">{t('sl.loopSource')}</label>
                      <select value={rule.loopSourceQuestionId || ''} onChange={(e) => updateRule(rule.id, 'loopSourceQuestionId', e.target.value || null)}
                        className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20">
                        <option value="">{t('sl.fixedCount')}</option>
                        {questions.map((q, i) => (
                          <option key={q.id} value={q.id}>Q{i + 1}: {q.question_text?.substring(0, 30)}...</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-stone-300 mt-1">{t('sl.loopHint')}</p>
                    </div>
                  </>
                )}

                {/* Description */}
                {!ADVANCED_ACTIONS.includes(rule.action) && (
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-medium text-stone-400 mb-1.5">{t('sl.ruleDescription')}</label>
                    <input type="text" value={rule.description || ''} onChange={(e) => updateRule(rule.id, 'description', e.target.value || null)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-500/10"
                      placeholder={t('sl.ruleDescriptionPlaceholder')} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Flow Summary */}
      {qRules.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <h3 className="text-[14px] font-semibold text-stone-800 mb-3">{t('sl.flowSummary')}</h3>
          <div className="space-y-1.5">
            {qRules.filter(r => r.enabled).map((rule, index) => {
              const sourceQ = questions.find(q => q.id === rule.sourceQuestionId);
              const targetQ = rule.targetQuestionId ? questions.find(q => q.id === rule.targetQuestionId) : null;
              const targetQn = rule.targetQuestionnaireId ? questionnaires.find(q => q.id === rule.targetQuestionnaireId) : null;
              const groupLabel = rule.conditionGroup ? ` [${rule.groupOperator?.toUpperCase() || 'AND'} group: ${rule.conditionGroup}]` : '';
              return (
                <div key={rule.id} className="flex items-center gap-2 text-[12px] text-stone-500 flex-wrap">
                  <span className="font-medium text-emerald-600">{t('sl.ruleN')} {index + 1}:</span>
                  <span>IF "{sourceQ?.question_text?.substring(0, 25)}..." {rule.condition} "{rule.value}"{groupLabel}</span>
                  <ArrowRight size={12} className="text-stone-300" />
                  <span className="font-medium">
                    {rule.action.toUpperCase()}
                    {needsQuestionTarget(rule.action) && targetQ ? ` → "${targetQ.question_text?.substring(0, 25)}..."` : ''}
                    {needsQuestionnaireTarget(rule.action) && targetQn ? ` → "${targetQn.title}"` : ''}
                    {rule.action === 'calculate' && rule.calculationFormula ? ` = ${rule.calculationFormula.substring(0, 30)}...` : ''}
                    {rule.action === 'pipe_answer' && rule.pipingTemplate ? ` "${rule.pipingTemplate.substring(0, 30)}..."` : ''}
                    {rule.action === 'randomize_questions' && rule.randomizeCount ? ` (show ${rule.randomizeCount} random)` : ''}
                    {rule.action === 'show_variant' && rule.variantGroup ? ` [group: ${rule.variantGroup}]` : ''}
                    {rule.action === 'quota_check' && rule.quotaLimit ? ` (limit: ${rule.quotaLimit}${rule.quotaField ? `, ${rule.quotaField}` : ''})` : ''}
                    {rule.action === 'loop_block' ? ` (${rule.loopCount ? `${rule.loopCount}×` : 'dynamic'})` : ''}
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
