/**
 * Survey Flow Visualizer — Visual node-based flow diagram
 * 调查流程可视化 — 可视化节点流程图
 * 
 * Shows the survey structure as a flowchart with:
 * - Question nodes (color-coded by type)
 * - Logic rule arrows (skip, show/hide, disqualify)
 * - Section grouping
 * - Screening/branching paths
 */
import React, { useMemo } from 'react';
import { ArrowDown, ArrowRight, GitBranch, Shield, XCircle, Eye, EyeOff, ChevronRight, Layers } from 'lucide-react';
import type { QuestionnaireConfig } from './QuestionnaireList';
import type { LogicRule } from '../utils/logicEngine';

interface SurveyFlowVisualizerProps {
  questionnaires: QuestionnaireConfig[];
  logicRules: LogicRule[];
}

const TYPE_COLORS: Record<string, string> = {
  text_short: '#3b82f6', text_long: '#3b82f6',
  single_choice: '#8b5cf6', multiple_choice: '#8b5cf6', dropdown: '#8b5cf6', checkbox_group: '#8b5cf6',
  slider: '#f59e0b', rating: '#f59e0b', likert_scale: '#f59e0b', nps: '#f59e0b', bipolar_scale: '#f59e0b',
  number: '#06b6d4', date: '#06b6d4', time: '#06b6d4', email: '#06b6d4', phone: '#06b6d4',
  matrix: '#ec4899', ranking: '#ec4899', constant_sum: '#ec4899',
  section_header: '#10b981', divider: '#d4d4d4', text_block: '#a8a29e', image_block: '#a8a29e',
  yes_no: '#8b5cf6', file_upload: '#06b6d4', signature: '#ec4899', address: '#06b6d4',
  card_sort: '#ef4444', tree_test: '#ef4444', first_click: '#ef4444', five_second_test: '#ef4444',
  heatmap: '#ef4444', preference_test: '#ef4444', prototype_test: '#ef4444',
  max_diff: '#ec4899', design_survey: '#ec4899', conjoint: '#ec4899', kano: '#ec4899',
  sus: '#f59e0b', csat: '#f59e0b', ces: '#f59e0b',
  video_block: '#6366f1', audio_block: '#6366f1', embed_block: '#6366f1',
};

const ACTION_ICONS: Record<string, { icon: typeof ArrowRight; color: string; label: string }> = {
  skip: { icon: ArrowRight, color: '#3b82f6', label: 'Skip' },
  show: { icon: Eye, color: '#10b981', label: 'Show' },
  hide: { icon: EyeOff, color: '#f59e0b', label: 'Hide' },
  disqualify: { icon: XCircle, color: '#ef4444', label: 'Disqualify' },
  end_survey: { icon: Shield, color: '#ef4444', label: 'End' },
};

const SurveyFlowVisualizer: React.FC<SurveyFlowVisualizerProps> = ({ questionnaires, logicRules }) => {
  // Build flat question list with questionnaire context
  const allQuestions = useMemo(() => {
    return questionnaires.flatMap(qc =>
      (qc.questions || []).map(q => ({ ...q, questionnaireName: qc.title, questionnaireId: qc.id }))
    );
  }, [questionnaires]);

  // Build logic map: source question → rules
  const logicBySource = useMemo(() => {
    const map = new Map<string, LogicRule[]>();
    logicRules.forEach(rule => {
      if (!rule.enabled) return;
      const existing = map.get(rule.sourceQuestionId) || [];
      existing.push(rule);
      map.set(rule.sourceQuestionId, existing);
    });
    return map;
  }, [logicRules]);

  // Group questions by questionnaire
  const groupedQuestions = useMemo(() => {
    return questionnaires.map(qc => ({
      id: qc.id,
      title: qc.title,
      type: qc.questionnaire_type,
      questions: (qc.questions || []).filter(q => q.question_type !== 'section_header'),
      sections: (qc.questions || []).filter(q => q.question_type === 'section_header'),
    }));
  }, [questionnaires]);

  const getQuestionLabel = (id: string) => {
    const q = allQuestions.find(q => q.id === id);
    return q ? (q.question_text || 'Untitled').substring(0, 40) : id.substring(0, 8);
  };

  if (questionnaires.length === 0) {
    return (
      <div className="text-center py-16 text-stone-400">
        <GitBranch size={32} className="mx-auto mb-3 opacity-40" />
        <p className="text-sm">No questionnaires to visualize / 无问卷可视化</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Legend / 图例 */}
      <div className="flex flex-wrap gap-3 text-[10px]">
        {[
          { label: 'Text / 文本', color: '#3b82f6' },
          { label: 'Choice / 选择', color: '#8b5cf6' },
          { label: 'Scale / 量表', color: '#f59e0b' },
          { label: 'Data / 数据', color: '#06b6d4' },
          { label: 'Advanced / 高级', color: '#ec4899' },
          { label: 'UX Research', color: '#ef4444' },
          { label: 'Media / 媒体', color: '#6366f1' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="text-stone-500">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Flow diagram / 流程图 */}
      <div className="relative">
        {groupedQuestions.map((group, gi) => (
          <div key={group.id} className="mb-8">
            {/* Questionnaire header */}
            <div className="flex items-center gap-2 mb-3">
              <Layers size={14} className="text-emerald-500" />
              <span className="text-xs font-semibold text-stone-700">{group.title}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-400">{group.type}</span>
              <span className="text-[10px] text-stone-300">{group.questions.length} questions</span>
            </div>

            {/* Questions flow */}
            <div className="ml-4 border-l-2 border-stone-200 pl-6 space-y-1">
              {group.questions.map((q, qi) => {
                const rules = logicBySource.get(q.id) || [];
                const color = TYPE_COLORS[q.question_type] || '#a8a29e';
                const isLayout = ['text_block', 'divider', 'image_block', 'instruction'].includes(q.question_type);

                return (
                  <div key={q.id} className="relative">
                    {/* Connector dot */}
                    <div className="absolute -left-[31px] top-3 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: color }} />

                    {/* Question node */}
                    <div className={`group flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-stone-50/80 transition-colors ${isLayout ? 'opacity-50' : ''}`}>
                      <div className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: color }}>
                        {qi + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-stone-700 truncate">
                          {q.question_text || <span className="italic text-stone-300">Untitled</span>}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-stone-400">{q.question_type}</span>
                          {q.required && <span className="text-[9px] px-1 rounded bg-red-50 text-red-400 font-medium">REQ</span>}
                          {rules.length > 0 && (
                            <span className="text-[9px] px-1 rounded bg-blue-50 text-blue-500 font-medium flex items-center gap-0.5">
                              <GitBranch size={8} /> {rules.length} rule{rules.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Logic rule branches / 逻辑分支 */}
                    {rules.map(rule => {
                      const actionInfo = ACTION_ICONS[rule.action] || ACTION_ICONS.skip;
                      const ActionIcon = actionInfo.icon;
                      return (
                        <div key={rule.id} className="ml-9 flex items-center gap-2 py-1 text-[10px]">
                          <div className="w-8 border-t border-dashed" style={{ borderColor: actionInfo.color }} />
                          <ActionIcon size={10} style={{ color: actionInfo.color }} />
                          <span style={{ color: actionInfo.color }} className="font-medium">{actionInfo.label}</span>
                          <span className="text-stone-400">
                            if {rule.condition} "{String(rule.value).substring(0, 20)}"
                          </span>
                          {rule.targetQuestionId && (
                            <>
                              <ChevronRight size={10} className="text-stone-300" />
                              <span className="text-stone-500 font-medium truncate max-w-[200px]">
                                {getQuestionLabel(rule.targetQuestionId)}
                              </span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Arrow to next questionnaire */}
            {gi < groupedQuestions.length - 1 && (
              <div className="flex justify-center py-2">
                <ArrowDown size={16} className="text-stone-300" />
              </div>
            )}
          </div>
        ))}

        {/* End node */}
        <div className="flex items-center gap-2 ml-4">
          <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center">
            <Shield size={14} className="text-white" />
          </div>
          <span className="text-xs font-medium text-stone-500">Survey Complete / 调查完成</span>
        </div>
      </div>
    </div>
  );
};

export default SurveyFlowVisualizer;
