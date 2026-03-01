import React from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { normalizeLegacyQuestionType } from '../../constants/questionTypes';
import QuestionRenderer from './QuestionRenderer';
import AIQuestionWrapper from './AIQuestionWrapper';
import type { QuestionnaireConfig } from '../QuestionnaireList';

interface QuestionnaireViewProps {
  /** The questionnaire config to render */
  qConfig: QuestionnaireConfig;
  /** Currently active questionnaire ID (to show expanded vs card) */
  activeQuestionnaireId: string | null;
  /** Currently active section ID for tab sections */
  activeSectionId: string | null;
  /** Current page index for pagination */
  currentPageIndex: number;
  /** Responses map */
  responses: Record<string, any>;
  /** Primary theme color */
  primaryColor?: string;
  /** Label for the back button destination */
  backLabel?: string;
  /** When true, uses compact sizes for phone preview */
  compact?: boolean;
  /** Callbacks */
  onOpenQuestionnaire: (qId: string) => void;
  onCloseQuestionnaire: () => void;
  onSetSection: (sectionId: string | null) => void;
  onSetPage: (pageIndex: number) => void;
  onResponse: (questionId: string, value: any) => void;
  /** Called when submit button is pressed (participant view). If not provided, just closes. */
  onSubmit?: (qId: string) => void;
  /** Whether submission is in progress */
  submitting?: boolean;
  /** Whether to stop event propagation on clicks (needed in phone preview) */
  stopPropagation?: boolean;
}

const QuestionnaireView: React.FC<QuestionnaireViewProps> = ({
  qConfig, activeQuestionnaireId, activeSectionId, currentPageIndex,
  responses, primaryColor = '#10b981', backLabel = 'Home',
  compact = false, onOpenQuestionnaire, onCloseQuestionnaire,
  onSetSection, onSetPage, onResponse, onSubmit, submitting = false,
  stopPropagation = false,
}) => {
  const wrap = (fn: () => void) => (e?: React.MouseEvent) => {
    if (stopPropagation) e?.stopPropagation();
    fn();
  };

  // Compact vs full sizes
  const s = compact
    ? { txt: 'text-[13px]', txtSm: 'text-[11px]', txtXs: 'text-[10px]', txtLg: 'text-[15px]', txtXl: 'text-[14px]', pad: 'p-3.5', pill: 'px-2.5 py-1 text-[10px]', pillGap: 'gap-1', barH: 'h-1.5', space: 'space-y-3', navPad: 'px-3 py-1.5 text-[12px]', navIcon: 12, backIcon: 14, cardPad: 'p-3.5', cardCircle: 'w-8 h-8', cardIcon: 14, sectionH: 'text-[15px]', descTxt: 'text-[12px]' }
    : { txt: 'text-[14px]', txtSm: 'text-[12px]', txtXs: 'text-[11px]', txtLg: 'text-[16px]', txtXl: 'text-[15px]', pad: 'p-4', pill: 'px-3 py-1.5 text-[12px]', pillGap: 'gap-1.5', barH: 'h-2', space: 'space-y-4', navPad: 'px-4 py-2 text-[13px]', navIcon: 14, backIcon: 16, cardPad: 'p-4', cardCircle: 'w-9 h-9', cardIcon: 16, sectionH: 'text-[16px]', descTxt: 'text-[13px]' };

  const qs = qConfig.questions || [];

  // If this questionnaire is active/expanded
  if (activeQuestionnaireId === qConfig.id) {
    const tabSections = qConfig.tab_sections;
    const hasTabSections = tabSections && tabSections.length > 0;

    const filteredQs = hasTabSections && activeSectionId
      ? qs.filter((q: any) => tabSections.find(sec => sec.id === activeSectionId)?.question_ids?.includes(q.id))
      : hasTabSections
        ? qs.filter((q: any) => !tabSections.some(sec => sec.question_ids?.includes(q.id)))
        : qs;

    const displayQs = filteredQs.length > 0 ? filteredQs : qs;

    const activeSection = activeSectionId ? tabSections?.find(sec => sec.id === activeSectionId) : null;
    const perPage = (activeSection as any)?.questions_per_page ?? qConfig.questions_per_page ?? null;
    const isUnlimited = perPage === null;
    const totalPages = isUnlimited ? 1 : Math.ceil(displayQs.length / perPage);
    const pageIndex = isUnlimited ? 0 : Math.min(currentPageIndex, totalPages - 1);
    const pageQs = isUnlimited ? displayQs : displayQs.slice(pageIndex * perPage, (pageIndex + 1) * perPage);
    const progress = displayQs.length > 0
      ? (isUnlimited ? 100 : (((pageIndex + 1) * perPage >= displayQs.length ? displayQs.length : (pageIndex + 1) * perPage) / displayQs.length) * 100)
      : 0;
    const progressLabel = isUnlimited
      ? `${displayQs.length} questions`
      : `Page ${pageIndex + 1}/${totalPages} · Q${pageIndex * perPage + 1}-${Math.min((pageIndex + 1) * perPage, displayQs.length)}/${displayQs.length}`;

    return (
      <div className={`${s.space} pb-2`}>
        {/* Back button */}
        <button type="button" onClick={wrap(onCloseQuestionnaire)}
          className={`flex items-center gap-1 ${s.txtSm} text-stone-500 hover:text-stone-700 cursor-pointer`}>
          <ChevronLeft size={s.backIcon} /> Back to {backLabel}
        </button>

        {/* Tab section pills */}
        {hasTabSections && (
          <div className={`flex ${s.pillGap} overflow-x-auto`} style={{ scrollbarWidth: 'none' }}>
            <button onClick={wrap(() => { onSetSection(null); onSetPage(0); })}
              className={`${s.pill} rounded-full font-medium transition-all shrink-0`}
              style={{ backgroundColor: !activeSectionId ? primaryColor : '#f5f5f4', color: !activeSectionId ? 'white' : '#a8a29e' }}>
              General
            </button>
            {tabSections!.map(sec => (
              <button key={sec.id} onClick={wrap(() => { onSetSection(sec.id); onSetPage(0); })}
                className={`${s.pill} rounded-full font-medium transition-all shrink-0`}
                style={{ backgroundColor: activeSectionId === sec.id ? primaryColor : '#f5f5f4', color: activeSectionId === sec.id ? 'white' : '#a8a29e' }}>
                {sec.label}
              </button>
            ))}
          </div>
        )}

        {/* Progress bar */}
        <div>
          <div className={`flex justify-between ${s.txtSm} text-stone-400 mb-1`}>
            <span>{qConfig.title} — {progressLabel}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className={`${s.barH} bg-stone-100 rounded-full overflow-hidden`}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: primaryColor }} />
          </div>
        </div>

        {/* Questions */}
        <div className={`${compact ? 'space-y-4' : 'space-y-5'} ${isUnlimited ? (compact ? 'max-h-[50vh] overflow-y-auto pr-1' : 'overflow-y-auto') : ''}`}
          style={isUnlimited ? { scrollbarWidth: 'thin' } : undefined}>
          {pageQs.map((currentQ: any) => (
            <div key={currentQ.id} className="space-y-2">
              {normalizeLegacyQuestionType(currentQ.question_type) === 'section_header' ? (
                <div className="py-2 border-b border-stone-200 mb-2">
                  <h3 className={`${s.sectionH} font-bold text-stone-800`}>{currentQ.question_text}</h3>
                  {currentQ.question_description && <p className={`${s.descTxt} text-stone-400 mt-1`}>{currentQ.question_description}</p>}
                </div>
              ) : (
                <>
                  <h3 className={`${s.txtXl} font-semibold text-stone-800`}>
                    {currentQ.question_text}{currentQ.required && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                  {currentQ.question_description && <p className={`${s.descTxt} text-stone-400`}>{currentQ.question_description}</p>}
                  <AIQuestionWrapper
                    question={currentQ}
                    value={responses[currentQ.id]}
                    onResponse={onResponse}
                    aiConfig={{
                      allow_ai_assist: currentQ.question_config?.allow_ai_assist || currentQ.allow_ai_assist,
                      allow_ai_auto_answer: currentQ.question_config?.allow_ai_auto_answer,
                      allow_voice: currentQ.question_config?.allow_voice || currentQ.allow_voice,
                    }}
                    compact={compact}
                  >
                    <QuestionRenderer
                      question={currentQ}
                      value={responses[currentQ.id]}
                      onResponse={onResponse}
                      primaryColor={primaryColor}
                      compact={compact}
                    />
                  </AIQuestionWrapper>
                </>
              )}
            </div>
          ))}
        </div>

        {displayQs.length === 0 && (
          <p className={`${s.txtSm} text-stone-400 italic py-4 text-center`}>No questions added yet.</p>
        )}

        {/* Navigation */}
        {displayQs.length > 0 && (
          <div className="flex justify-between pt-3 border-t border-stone-100">
            <button type="button"
              onClick={wrap(() => onSetPage(Math.max(0, pageIndex - 1)))}
              disabled={pageIndex === 0}
              className={`flex items-center gap-1 ${s.navPad} rounded-full font-medium border border-stone-200 text-stone-500 disabled:opacity-40 hover:bg-stone-50 cursor-pointer`}>
              <ChevronLeft size={s.navIcon} /> Back
            </button>
            {pageIndex >= totalPages - 1 ? (
              <button type="button"
                onClick={wrap(() => onSubmit ? onSubmit(qConfig.id) : onCloseQuestionnaire())}
                disabled={submitting}
                className={`flex items-center gap-1 ${compact ? 'px-4 py-1.5 text-[12px]' : 'px-5 py-2 text-[13px]'} rounded-full font-medium text-white cursor-pointer hover:opacity-90 disabled:opacity-60`}
                style={{ backgroundColor: primaryColor }}>
                {submitting ? 'Submitting...' : 'Submit'} <Check size={s.navIcon} />
              </button>
            ) : (
              <button type="button"
                onClick={wrap(() => onSetPage(pageIndex + 1))}
                className={`flex items-center gap-1 ${compact ? 'px-4 py-1.5 text-[12px]' : 'px-5 py-2 text-[13px]'} rounded-full font-medium text-white cursor-pointer hover:opacity-90`}
                style={{ backgroundColor: primaryColor }}>
                Next <ChevronRight size={s.navIcon} />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Card view (collapsed)
  return (
    <button type="button"
      onClick={wrap(() => onOpenQuestionnaire(qConfig.id))}
      className={`w-full ${s.cardPad} rounded-xl bg-white border border-stone-100 shadow-sm hover:shadow-md transition-all text-left cursor-pointer`}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className={`${s.txt} font-semibold text-stone-800`}>{qConfig.title}</h4>
          <p className={`${s.txtSm} text-stone-400 mt-0.5`}>
            {qs.length} questions · {qConfig.estimated_duration || 5} min{qConfig.frequency && !compact ? '' : qConfig.frequency ? ` · ${qConfig.frequency}` : ''}
          </p>
        </div>
        <div className={`${s.cardCircle} rounded-full flex items-center justify-center`} style={{ backgroundColor: primaryColor }}>
          <ChevronRight size={s.cardIcon} className="text-white" />
        </div>
      </div>
    </button>
  );
};

export default QuestionnaireView;
