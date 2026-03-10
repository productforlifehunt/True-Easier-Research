import React, { useState } from 'react';
import { ArrowRight, Plus, Trash2, GitBranch, ChevronDown, Link2, Calculator, TextCursorInput, Shield, Layers } from 'lucide-react';
import CustomDropdown from './CustomDropdown';
import { type LogicRule, type LogicAction } from '../utils/logicEngine';
import type { QuestionnaireConfig } from './QuestionnaireList';

const CONDITIONS = [
  { value: 'equals', label: 'Equals / 等于' },
  { value: 'not_equals', label: 'Not Equals / 不等于' },
  { value: 'contains', label: 'Contains / 包含' },
  { value: 'greater_than', label: 'Greater Than / 大于' },
  { value: 'less_than', label: 'Less Than / 小于' },
  { value: 'is_empty', label: 'Is Empty / 为空' },
  { value: 'is_not_empty', label: 'Is Not Empty / 不为空' },
  { value: 'any_selected', label: 'Any Selected / 多选包含' },
  { value: 'none_selected', label: 'None Selected / 多选不包含' },
  { value: 'date_before', label: 'Date Before / 日期早于' },
  { value: 'date_after', label: 'Date After / 日期晚于' },
  { value: 'date_between', label: 'Date Between / 日期在范围内' },
  { value: 'matches_regex', label: 'Matches Regex / 正则匹配' },
  { value: 'length_greater', label: 'Length Greater / 长度大于' },
  { value: 'length_less', label: 'Length Less / 长度小于' },
  { value: 'in_list', label: 'In List / 在列表中' },
  { value: 'not_in_list', label: 'Not In List / 不在列表中' },
  { value: 'url_param_equals', label: 'URL Param Equals / URL参数等于' },
  { value: 'url_param_contains', label: 'URL Param Contains / URL参数包含' },
];

const ACTIONS = [
  { value: 'skip', label: 'Skip to / 跳转到' },
  { value: 'show', label: 'Show / 显示' },
  { value: 'hide', label: 'Hide / 隐藏' },
  { value: 'disqualify', label: 'Disqualify / 取消资格' },
  { value: 'end_survey', label: 'End Survey / 结束调查' },
  { value: 'require_before_next', label: 'Require / 必填验证' },
  { value: 'validate_format', label: 'Validate Format / 格式验证' },
  { value: 'calculate', label: 'Calculate / 计算字段' },
  { value: 'pipe_answer', label: 'Pipe Answer / 答案回填' },
  { value: 'show_questionnaire', label: 'Show Questionnaire / 显示问卷' },
  { value: 'hide_questionnaire', label: 'Hide Questionnaire / 隐藏问卷' },
  { value: 'randomize_questions', label: 'Randomize / 随机题库' },
  { value: 'show_variant', label: 'A/B Variant / A/B变体' },
  { value: 'quota_check', label: 'Quota Check / 配额控制' },
  { value: 'loop_block', label: 'Loop Block / 循环重复' },
];

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
  const [selectedQId, setSelectedQId] = useState<string>('__all__');
  const selectedQ = selectedQId === '__all__' ? null : questionnaires.find(q => q.id === selectedQId);
  const questions = selectedQId === '__all__'
    ? questionnaires.flatMap(q => q.questions || [])
    : (selectedQ?.questions || []);
  const qRules = selectedQId === '__all__'
    ? logicRules
    : logicRules.filter(r => r.questionnaireId === selectedQId);

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
      // Clear targets when switching actions
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

  // Get unique condition groups
  const existingGroups = Array.from(new Set(qRules.filter(r => r.conditionGroup).map(r => r.conditionGroup!)));

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[17px] font-semibold tracking-tight text-stone-800">Logic</h2>
          <p className="text-[13px] text-stone-400 mt-0.5 font-light">
            Skip, show, hide, calculate, validate, pipe, randomize, A/B test, quota, loop — AND/OR compound + URL params
          </p>
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
          <h3 className="text-[15px] font-semibold text-stone-800 mb-1.5">No logic rules / 暂无逻辑规则</h3>
          <p className="text-[13px] text-stone-400 mb-5 max-w-sm mx-auto font-light">
            {questions.length < 1
              ? 'Add questions to this questionnaire first. / 先添加问题到此问卷。'
              : 'Create conditional logic to personalize the survey flow. / 创建条件逻辑来个性化调查流程。'}
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
            <div key={rule.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${rule.enabled ? 'border-stone-100' : 'border-stone-200 opacity-50'} ${rule.conditionGroup ? 'border-l-4 border-l-blue-400' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Source question */}
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1.5">IF Question / 如果问题</label>
                    <CustomDropdown
                      options={questions.map((q, i) => ({ value: q.id, label: `Q${i + 1}: ${q.question_text?.substring(0, 25)}...` }))}
                      value={rule.sourceQuestionId}
                      onChange={(v) => updateRule(rule.id, 'sourceQuestionId', v)}
                      placeholder="Select question"
                    />
                  </div>
                  {/* Condition */}
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1.5">Condition / 条件</label>
                    <CustomDropdown options={CONDITIONS} value={rule.condition} onChange={(v) => updateRule(rule.id, 'condition', v)} placeholder="Condition" />
                  </div>
                  {/* Value */}
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1.5">Value / 值</label>
                    {needsValue(rule.condition) ? (
                      <input type="text" value={rule.value} onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                        placeholder={rule.condition === 'date_between' ? '2020-01-01,2025-12-31' : rule.condition === 'in_list' ? 'val1,val2,val3' : 'Value...'} />
                    ) : (
                      <div className="w-full px-3 py-2 rounded-xl text-[13px] border border-stone-100 bg-stone-50 text-stone-400">N/A</div>
                    )}
                  </div>
                  {/* Action */}
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1.5">THEN / 那么</label>
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

              {/* Target question (for skip/show/hide/calculate/pipe_answer) */}
              {needsQuestionTarget(rule.action) && (
                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2">
                  <ArrowRight size={14} className="text-emerald-500 shrink-0" />
                  <CustomDropdown
                    options={[{ value: '', label: 'Select target / 选择目标' }, ...questions.filter(q => q.id !== rule.sourceQuestionId).map((q) => ({ value: q.id, label: `Q${questions.indexOf(q) + 1}: ${q.question_text?.substring(0, 40)}...` }))]}
                    value={rule.targetQuestionId || ''}
                    onChange={(v) => updateRule(rule.id, 'targetQuestionId', v)}
                    placeholder="Target question"
                    className="flex-1"
                  />
                </div>
              )}

              {/* Target questionnaire (for show_questionnaire/hide_questionnaire) */}
              {needsQuestionnaireTarget(rule.action) && (
                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2">
                  <Layers size={14} className="text-violet-500 shrink-0" />
                  <select value={rule.targetQuestionnaireId || ''} onChange={(e) => updateRule(rule.id, 'targetQuestionnaireId', e.target.value || null)}
                    className="flex-1 px-3 py-2 rounded-xl text-[13px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20">
                    <option value="">Select questionnaire / 选择问卷</option>
                    {questionnaires.filter(q => q.id !== selectedQId).map(q => (
                      <option key={q.id} value={q.id}>{q.title}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Advanced fields row */}
              <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Condition Group (compound AND/OR) */}
                <div>
                  <label className="block text-[11px] font-medium text-stone-400 mb-1.5">
                    <Link2 size={10} className="inline mr-1" />Condition Group / 条件组
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

                {/* Error message (for require/validate) */}
                {(rule.action === 'require_before_next' || rule.action === 'validate_format') && (
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1.5">
                      <Shield size={10} className="inline mr-1" />Error Message / 错误提示
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
                      <TextCursorInput size={10} className="inline mr-1" />Regex Pattern / 正则表达式
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
                      <Calculator size={10} className="inline mr-1" />Formula / 计算公式
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
                      <TextCursorInput size={10} className="inline mr-1" />Piping Template / 回填模板
                    </label>
                    <input type="text" value={rule.pipingTemplate || ''} onChange={(e) => updateRule(rule.id, 'pipingTemplate', e.target.value || null)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      placeholder={'您之前说您的孩子叫{{q3}}，{{q3}}今年几岁？'} />
                  </div>
                )}

                {/* Randomize count */}
                {rule.action === 'randomize_questions' && (
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1.5">Show N Random / 随机显示N题</label>
                    <input type="number" min={1} value={rule.randomizeCount || ''} onChange={(e) => updateRule(rule.id, 'randomizeCount', e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      placeholder="5" />
                    <p className="text-[10px] text-stone-300 mt-1">Each participant sees a random subset. Stable per session. / 每个参与者看到随机子集，同一会话内稳定。</p>
                  </div>
                )}

                {/* A/B Variant group */}
                {rule.action === 'show_variant' && (
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1.5">Variant Group / 变体组名</label>
                    <input type="text" value={rule.variantGroup || ''} onChange={(e) => updateRule(rule.id, 'variantGroup', e.target.value || null)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                      placeholder="ab-group-1" />
                    <p className="text-[10px] text-stone-300 mt-1">Create multiple rules with the same group name, each targeting a different question. Only one variant shown per participant. / 创建多条同组名规则，各指向不同问题。每个参与者只看到一个变体。</p>
                  </div>
                )}

                {/* Quota control */}
                {rule.action === 'quota_check' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-400 mb-1.5">Quota Limit / 配额上限</label>
                      <input type="number" min={1} value={rule.quotaLimit || ''} onChange={(e) => updateRule(rule.id, 'quotaLimit', e.target.value ? Number(e.target.value) : null)}
                        className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        placeholder="100" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-400 mb-1.5">Quota Field / 配额字段</label>
                      <input type="text" value={rule.quotaField || ''} onChange={(e) => updateRule(rule.id, 'quotaField', e.target.value || null)}
                        className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        placeholder="gender=male" />
                      <p className="text-[10px] text-stone-300 mt-1">When condition matches and quota is full, blocks the survey. / 条件匹配且配额已满时，阻止调查继续。</p>
                    </div>
                  </>
                )}

                {/* Loop block */}
                {rule.action === 'loop_block' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-400 mb-1.5">Loop Count / 循环次数</label>
                      <input type="number" min={1} value={rule.loopCount || ''} onChange={(e) => updateRule(rule.id, 'loopCount', e.target.value ? Number(e.target.value) : null)}
                        className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                        placeholder="3" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-400 mb-1.5">Loop Source / 循环源问题 (可选)</label>
                      <select value={rule.loopSourceQuestionId || ''} onChange={(e) => updateRule(rule.id, 'loopSourceQuestionId', e.target.value || null)}
                        className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20">
                        <option value="">Fixed count / 固定次数</option>
                        {questions.map((q, i) => (
                          <option key={q.id} value={q.id}>Q{i + 1}: {q.question_text?.substring(0, 30)}...</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-stone-300 mt-1">Repeat this question N times, or once per answer from a multi-select source. / 重复此问题N次，或按多选源问题的每个答案重复一次。</p>
                    </div>
                  </>
                )}

                {/* Description (always available) */}
                {!ADVANCED_ACTIONS.includes(rule.action) && (
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-medium text-stone-400 mb-1.5">Description / 规则说明</label>
                    <input type="text" value={rule.description || ''} onChange={(e) => updateRule(rule.id, 'description', e.target.value || null)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-500/10"
                      placeholder="Optional note about this rule / 可选的规则说明" />
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
          <h3 className="text-[14px] font-semibold text-stone-800 mb-3">Flow Summary / 流程概览</h3>
          <div className="space-y-1.5">
            {qRules.filter(r => r.enabled).map((rule, index) => {
              const sourceQ = questions.find(q => q.id === rule.sourceQuestionId);
              const targetQ = rule.targetQuestionId ? questions.find(q => q.id === rule.targetQuestionId) : null;
              const targetQn = rule.targetQuestionnaireId ? questionnaires.find(q => q.id === rule.targetQuestionnaireId) : null;
              const groupLabel = rule.conditionGroup ? ` [${rule.groupOperator?.toUpperCase() || 'AND'} group: ${rule.conditionGroup}]` : '';
              return (
                <div key={rule.id} className="flex items-center gap-2 text-[12px] text-stone-500 flex-wrap">
                  <span className="font-medium text-emerald-600">Rule {index + 1}:</span>
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
