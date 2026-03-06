import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { normalizeLegacyQuestionType } from '../../constants/questionTypes';
import QuestionRenderer from './QuestionRenderer';
import AIQuestionWrapper from './AIQuestionWrapper';
import AIChatbotPopup from './AIChatbotPopup';
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
  /** Card display options — configurable from layout builder */
  showQuestionCount?: boolean;
  showEstimatedTime?: boolean;
  showFrequency?: boolean;
  cardDisplayStyle?: 'icon' | 'button' | 'both' | 'minimal';
  buttonLabel?: string;
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

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Compact vs full sizes
  const s = compact
    ? { txt: 'text-[13px]', txtSm: 'text-[11px]', txtXs: 'text-[10px]', txtLg: 'text-[15px]', txtXl: 'text-[14px]', pad: 'p-3.5', pill: 'px-2.5 py-1 text-[10px]', pillGap: 'gap-1', barH: 'h-1.5', space: 'space-y-3', navPad: 'px-3 py-1.5 text-[12px]', navIcon: 12, backIcon: 14, cardPad: 'p-3.5', cardCircle: 'w-8 h-8', cardIcon: 14, sectionH: 'text-[15px]', descTxt: 'text-[12px]' }
    : { txt: 'text-[14px]', txtSm: 'text-[12px]', txtXs: 'text-[11px]', txtLg: 'text-[16px]', txtXl: 'text-[15px]', pad: 'p-4', pill: 'px-3 py-1.5 text-[12px]', pillGap: 'gap-1.5', barH: 'h-2', space: 'space-y-4', navPad: 'px-4 py-2 text-[13px]', navIcon: 14, backIcon: 16, cardPad: 'p-4', cardCircle: 'w-9 h-9', cardIcon: 16, sectionH: 'text-[16px]', descTxt: 'text-[13px]' };

  const qs = qConfig.questions || [];

  // If this questionnaire is active/expanded
  if (activeQuestionnaireId === qConfig.id) {
    const tabSections = qConfig.tab_sections;
    const hasTabSections = tabSections && tabSections.length > 0;

    // Filter by tab section
    const matchesSection = (q: any, sectionId: string) => {
      const sec = tabSections!.find(s => s.id === sectionId);
      if (!sec) return false;
      if (sec.question_ids?.length > 0) return sec.question_ids.includes(q.id);
      return q.section_name === sectionId;
    };
    const isAssignedToAnySection = (q: any) => {
      return tabSections!.some(sec => {
        if (sec.question_ids?.length > 0) return sec.question_ids.includes(q.id);
        return q.section_name && tabSections!.some(s => s.id === q.section_name);
      });
    };
    const filteredQs = hasTabSections && activeSectionId
      ? qs.filter((q: any) => matchesSection(q, activeSectionId))
      : hasTabSections
        ? qs.filter((q: any) => !isAssignedToAnySection(q))
        : qs;

    const displayQs = filteredQs.length > 0 ? filteredQs : qs;

    // ── Determine questions_per_page ──
    // Priority: active tab_section override → questionnaire default → 1 (legacy one-at-a-time)
    // 优先级：活动标签区段覆盖 → 问卷默认值 → 1（遗留逐题模式）
    let perPage: number;
    const activeSection = activeSectionId && tabSections
      ? tabSections.find(sec => sec.id === activeSectionId)
      : null;
    if (activeSection?.questions_per_page != null) {
      perPage = activeSection.questions_per_page;
    } else if (qConfig.questions_per_page != null) {
      perPage = qConfig.questions_per_page;
    } else {
      perPage = 1; // default: one question at a time
    }

    // perPage <= 0 or very large means show all / perPage <= 0 或非常大则显示全部
    const isUnlimited = perPage >= displayQs.length;
    const effectivePerPage = isUnlimited ? displayQs.length : perPage;

    const totalPages = Math.max(1, Math.ceil(displayQs.length / effectivePerPage));
    const currentPage = Math.max(0, Math.min(Math.floor(currentPageIndex / effectivePerPage), totalPages - 1));
    const pageStart = currentPage * effectivePerPage;
    const pageQuestions = displayQs.slice(pageStart, pageStart + effectivePerPage);
    const isFirst = currentPage === 0;
    const isLast = currentPage >= totalPages - 1;
    const progress = displayQs.length > 0 ? ((pageStart + pageQuestions.length) / displayQs.length) * 100 : 0;

    // Track answered (non-display-only) questions
    const NON_INPUT_TYPES = ['section_header', 'text_block', 'instruction', 'divider', 'image_block'];
    const answerableQs = displayQs.filter((q: any) =>
      !NON_INPUT_TYPES.includes(normalizeLegacyQuestionType(q.question_type))
    );
    const answeredCount = answerableQs.filter((q: any) => {
      const v = responses[q.id];
      return v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0);
    }).length;
    const allAnswered = answerableQs.length > 0 && answeredCount === answerableQs.length;

    const handleTouchStart = (e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;
      const dx = touchStartX.current - e.changedTouches[0].clientX;
      const dy = touchStartY.current - e.changedTouches[0].clientY;
      touchStartX.current = null;
      touchStartY.current = null;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48) {
        if (dx > 0 && !isLast) onSetPage((currentPage + 1) * effectivePerPage);
        else if (dx < 0 && !isFirst) onSetPage((currentPage - 1) * effectivePerPage);
      }
    };

    const touchHandlers = {
      onTouchStart: stopPropagation
        ? (e: React.TouchEvent) => { e.stopPropagation(); handleTouchStart(e); }
        : handleTouchStart,
      onTouchEnd: stopPropagation
        ? (e: React.TouchEvent) => { e.stopPropagation(); handleTouchEnd(e); }
        : handleTouchEnd,
    };

    // ── Render question(s) ──
    const renderQuestion = (q: any) => {
      const normalizedType = normalizeLegacyQuestionType(q.question_type);
      if (normalizedType === 'section_header') {
        return (
          <div key={q.id} className={`${compact ? 'py-6' : 'py-10'} text-center`}>
            <h3 className={`${s.sectionH} font-bold text-stone-800`}>{q.question_text}</h3>
            {q.question_description && (
              <p className={`${s.descTxt} text-stone-400 mt-2`}>{q.question_description}</p>
            )}
            {effectivePerPage === 1 && (
              <p className={`${s.txtXs} text-stone-300 mt-4`}>Swipe or tap Next to continue →</p>
            )}
          </div>
        );
      }
      return (
        <div key={q.id} className={`${compact ? 'p-4' : 'p-5'} rounded-2xl bg-white border border-stone-100 shadow-sm ${compact ? 'space-y-3' : 'space-y-4'}`}>
          <div>
            <h3 className={`${s.txtXl} font-semibold text-stone-800 leading-snug`}>
              {q.question_text}
              {q.required && <span className="text-red-400 ml-1">*</span>}
            </h3>
            {q.question_description && (
              <p className={`${s.descTxt} text-stone-400 mt-1.5`}>{q.question_description}</p>
            )}
          </div>
          <AIQuestionWrapper
            question={q}
            value={responses[q.id]}
            onResponse={onResponse}
            aiConfig={{
              allow_ai_assist: q.question_config?.allow_ai_assist || q.allow_ai_assist,
              allow_ai_auto_answer: q.question_config?.allow_ai_auto_answer,
              allow_voice: q.question_config?.allow_voice || q.allow_voice,
            }}
            compact={compact}
          >
            <QuestionRenderer
              question={q}
              value={responses[q.id]}
              onResponse={onResponse}
              primaryColor={primaryColor}
              compact={compact}
            />
          </AIQuestionWrapper>
        </div>
      );
    };

    // Single-question carousel mode (perPage === 1) vs multi-question list mode
    const isSingleMode = effectivePerPage === 1;

    return (
      <div className="pb-2">
        {/* Back button */}
        <button type="button" onClick={wrap(onCloseQuestionnaire)}
          className={`flex items-center gap-1 ${s.txtSm} text-stone-500 hover:text-stone-700 cursor-pointer mb-4`}>
          <ChevronLeft size={s.backIcon} /> Back to {backLabel}
        </button>

        {/* Tab section pills */}
        {hasTabSections && (
          <div className={`flex ${s.pillGap} overflow-x-auto mb-4`} style={{ scrollbarWidth: 'none' }}>
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

        {/* Progress */}
        <div className={compact ? 'mb-3' : 'mb-5'}>
          <div className={`flex justify-between ${s.txtSm} mb-1.5`}>
            <span className="font-medium text-stone-600 truncate pr-2">{qConfig.title}</span>
            <span className="text-stone-400 shrink-0">{answeredCount}/{answerableQs.length} answered</span>
          </div>
          <div className={`${s.barH} bg-stone-100 rounded-full overflow-hidden`}>
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: primaryColor }} />
          </div>
          {/* Step indicators — only for single-question mode with few questions */}
          {isSingleMode && displayQs.length <= 14 ? (
            <div className="flex justify-center gap-1.5 mt-2.5">
              {displayQs.map((_: any, i: number) => (
                <button
                  key={i}
                  type="button"
                  onClick={wrap(() => onSetPage(i))}
                  className="rounded-full transition-all duration-200 cursor-pointer"
                  style={{
                    width: i === currentPage ? (compact ? '14px' : '18px') : (compact ? '5px' : '6px'),
                    height: compact ? '5px' : '6px',
                    backgroundColor: i < currentPage ? primaryColor : i === currentPage ? primaryColor : '#e7e5e4',
                    opacity: i < currentPage ? 0.45 : 1,
                  }}
                />
              ))}
            </div>
          ) : totalPages > 1 ? (
            <p className={`text-center ${s.txtXs} text-stone-400 mt-1.5`}>
              Page {currentPage + 1} / {totalPages}
            </p>
          ) : null}
        </div>

        {/* Questions */}
        {displayQs.length === 0 ? (
          <p className={`${s.txtSm} text-stone-400 italic py-8 text-center`}>No questions added yet.</p>
        ) : isSingleMode ? (
          /* Single-question carousel mode */
          <div className="overflow-hidden" {...touchHandlers}>
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentPage * 100}%)` }}
            >
              {displayQs.map((q: any) => (
                <div key={q.id} className="min-w-full">
                  {renderQuestion(q)}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Multi-question list mode — show all questions for current page */
          <div className={s.space} {...touchHandlers}>
            {pageQuestions.map((q: any) => renderQuestion(q))}
          </div>
        )}

        {/* Navigation */}
        {displayQs.length > 0 && totalPages > 1 && (
          <div className={`flex justify-between ${compact ? 'pt-3 mt-3' : 'pt-4 mt-4'} border-t border-stone-100`}>
            <button type="button"
              onClick={wrap(() => onSetPage(Math.max(0, (currentPage - 1) * effectivePerPage)))}
              disabled={isFirst}
              className={`flex items-center gap-1 ${s.navPad} rounded-full font-medium border border-stone-200 text-stone-500 disabled:opacity-30 hover:bg-stone-50 cursor-pointer`}>
              <ChevronLeft size={s.navIcon} /> Back
            </button>
            {isLast ? (
              <button type="button"
                onClick={wrap(() => onSubmit ? onSubmit(qConfig.id) : onCloseQuestionnaire())}
                disabled={submitting}
                className={`flex items-center gap-1.5 ${compact ? 'px-4 py-1.5 text-[12px]' : 'px-5 py-2 text-[13px]'} rounded-full font-semibold text-white cursor-pointer hover:opacity-90 disabled:opacity-60 shadow-sm`}
                style={{ backgroundColor: primaryColor }}>
                {submitting ? 'Submitting...' : 'Submit'} <Check size={s.navIcon} />
              </button>
            ) : (
              <button type="button"
                onClick={wrap(() => onSetPage((currentPage + 1) * effectivePerPage))}
                className={`flex items-center gap-1.5 ${compact ? 'px-4 py-1.5 text-[12px]' : 'px-5 py-2 text-[13px]'} rounded-full font-semibold text-white cursor-pointer hover:opacity-90 shadow-sm`}
                style={{ backgroundColor: primaryColor }}>
                Next <ChevronRight size={s.navIcon} />
              </button>
            )}
          </div>
        )}

        {/* Single-page submit button (when all questions fit on one page) */}
        {displayQs.length > 0 && totalPages <= 1 && (
          <div className={`flex justify-end ${compact ? 'pt-3 mt-3' : 'pt-4 mt-4'} border-t border-stone-100`}>
            <button type="button"
              onClick={wrap(() => onSubmit ? onSubmit(qConfig.id) : onCloseQuestionnaire())}
              disabled={submitting}
              className={`flex items-center gap-1.5 ${compact ? 'px-4 py-1.5 text-[12px]' : 'px-5 py-2 text-[13px]'} rounded-full font-semibold text-white cursor-pointer hover:opacity-90 disabled:opacity-60 shadow-sm`}
              style={{ backgroundColor: primaryColor }}>
              {submitting ? 'Submitting...' : 'Submit'} <Check size={s.navIcon} />
            </button>
          </div>
        )}

        {/* "All answered" quick-submit banner */}
        {allAnswered && !isLast && totalPages > 1 && (
          <div className={`${compact ? 'mt-2.5 p-2.5' : 'mt-3 p-3'} rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between gap-2`}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: primaryColor }}>
                <Check size={11} className="text-white" />
              </div>
              <span className={`${s.txtXs} font-medium text-emerald-700 truncate`}>All questions answered!</span>
            </div>
            <button
              type="button"
              onClick={wrap(() => onSubmit ? onSubmit(qConfig.id) : onCloseQuestionnaire())}
              disabled={submitting}
              className={`${s.txtXs} font-semibold text-white px-3 py-1 rounded-full shrink-0 disabled:opacity-60 cursor-pointer hover:opacity-90`}
              style={{ backgroundColor: primaryColor }}>
              {submitting ? '...' : 'Submit now'}
            </button>
          </div>
        )}

        {/* AI Chatbot Popup */}
        {qConfig.ai_chatbot_enabled && (
          <AIChatbotPopup
            questionnaireTitle={qConfig.title}
            questions={qs}
            responses={responses}
            onResponse={onResponse}
            primaryColor={primaryColor}
            compact={compact}
          />
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
