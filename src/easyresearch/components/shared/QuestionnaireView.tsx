import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { normalizeLegacyQuestionType } from '../../constants/questionTypes';
import QuestionRenderer from './QuestionRenderer';
import AIQuestionWrapper from './AIQuestionWrapper';
import AIChatbotPopup from './AIChatbotPopup';
import type { QuestionnaireConfig } from '../QuestionnaireList';

// ── Answer Piping Engine / 答案管道引擎 ──
// Replaces {{Q1}}, {{Q2}} (1-based index) or {{uuid}} with the participant's prior answer.
function applyPiping(text: string | undefined | null, allQuestions: any[], responses: Record<string, any>): string {
  if (!text) return text || '';
  return text.replace(/\{\{([^}]+)\}\}/g, (match, key: string) => {
    const trimmed = key.trim();
    // Try 1-based index like Q1, Q2...
    const indexMatch = trimmed.match(/^[Qq](\d+)$/);
    if (indexMatch) {
      const idx = parseInt(indexMatch[1], 10) - 1;
      if (idx >= 0 && idx < allQuestions.length) {
        const val = responses[allQuestions[idx].id];
        return formatPipedValue(val) || match;
      }
    }
    // Try direct question ID
    if (responses[trimmed] !== undefined) {
      return formatPipedValue(responses[trimmed]) || match;
    }
    return match;
  });
}

function formatPipedValue(val: any): string {
  if (val === null || val === undefined) return '';
  if (Array.isArray(val)) return val.join(', ');
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

// ── Seeded shuffle for stable randomization / 种子随机洗牌 ──
function seededShuffle<T>(arr: T[], seed: string): T[] {
  const out = [...arr];
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  for (let i = out.length - 1; i > 0; i--) {
    h = (h * 16807 + 1) | 0;
    const j = Math.abs(h) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

interface QuestionnaireViewProps {
  qConfig: QuestionnaireConfig;
  activeQuestionnaireId: string | null;
  activeSectionId: string | null;
  currentPageIndex: number;
  responses: Record<string, any>;
  primaryColor?: string;
  backLabel?: string;
  compact?: boolean;
  onOpenQuestionnaire: (qId: string) => void;
  onCloseQuestionnaire: () => void;
  onSetSection: (sectionId: string | null) => void;
  onSetPage: (pageIndex: number) => void;
  onResponse: (questionId: string, value: any) => void;
  onSubmit?: (qId: string) => void;
  submitting?: boolean;
  stopPropagation?: boolean;
  showQuestionCount?: boolean;
  showEstimatedTime?: boolean;
  showFrequency?: boolean;
  cardDisplayStyle?: 'icon' | 'button' | 'both' | 'minimal';
  buttonLabel?: string;
  buttonBorderRadius?: string;
  /** Theme card style: flat, elevated, outlined */
  cardStyle?: 'flat' | 'elevated' | 'outlined';
}

const QuestionnaireView: React.FC<QuestionnaireViewProps> = ({
  qConfig, activeQuestionnaireId, activeSectionId, currentPageIndex,
  responses, primaryColor = '#10b981', backLabel = 'Home',
  compact = false, onOpenQuestionnaire, onCloseQuestionnaire,
  onSetSection, onSetPage, onResponse, onSubmit, submitting = false,
  stopPropagation = false,
  showQuestionCount = true, showEstimatedTime = true, showFrequency = true,
  cardDisplayStyle = 'icon', buttonLabel, buttonBorderRadius,
  cardStyle = 'elevated',
}) => {
  const wrap = (fn: () => void) => (e?: React.MouseEvent) => {
    if (stopPropagation) e?.stopPropagation();
    fn();
  };

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const s = compact
    ? { txt: 'text-[13px]', txtSm: 'text-[11px]', txtXs: 'text-[10px]', txtLg: 'text-[15px]', txtXl: 'text-[14px]', pad: 'p-3.5', pill: 'px-2.5 py-1 text-[10px]', pillGap: 'gap-1', barH: 'h-1.5', space: 'space-y-3', navPad: 'px-3 py-1.5 text-[12px]', navIcon: 12, backIcon: 14, cardPad: 'p-3.5', cardCircle: 'w-8 h-8', cardIcon: 14, sectionH: 'text-[15px]', descTxt: 'text-[12px]' }
    : { txt: 'text-[14px]', txtSm: 'text-[12px]', txtXs: 'text-[11px]', txtLg: 'text-[16px]', txtXl: 'text-[15px]', pad: 'p-4', pill: 'px-3 py-1.5 text-[12px]', pillGap: 'gap-1.5', barH: 'h-2', space: 'space-y-4', navPad: 'px-4 py-2 text-[13px]', navIcon: 14, backIcon: 16, cardPad: 'p-4', cardCircle: 'w-9 h-9', cardIcon: 16, sectionH: 'text-[16px]', descTxt: 'text-[13px]' };

  const rawQs = qConfig.questions || [];

  // ── Per-question timer / 每题计时器 ──
  const [questionTimings, setQuestionTimings] = useState<Record<string, number>>({});
  const timerRef = useRef<{ questionId: string | null; startedAt: number }>({ questionId: null, startedAt: 0 });
  // Track when participant first opened this questionnaire (for speeder detection)
  const sessionStartRef = useRef<number>(Date.now());
  // Quality flags state / 质量标记状态
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);
  // Completion state for custom thank-you / redirect
  const [showThankYou, setShowThankYou] = useState(false);

  // ── Randomization (stable per session) / 随机化（每次会话稳定） ──
  const qs = useMemo(() => {
    if (!qConfig.randomize_questions) return rawQs;
    const NON_SHUFFLE = ['section_header', 'divider'];
    const fixed: { idx: number; q: any }[] = [];
    const shuffleable: any[] = [];
    rawQs.forEach((q: any, i: number) => {
      const t = normalizeLegacyQuestionType(q.question_type);
      if (NON_SHUFFLE.includes(t)) fixed.push({ idx: i, q });
      else shuffleable.push(q);
    });
    if (shuffleable.length <= 1) return rawQs;
    const shuffled = seededShuffle(shuffleable, qConfig.id);
    const result: any[] = [...shuffled];
    fixed.forEach(({ idx, q }) => result.splice(Math.min(idx, result.length), 0, q));
    return result;
  }, [rawQs, qConfig.randomize_questions, qConfig.id]);

  // ── Piping-enabled response handler / 带管道的响应处理器 ──
  const handleResponse = useCallback((questionId: string, value: any) => {
    // Record timing for previous question / 记录前一题的耗时
    if (qConfig.track_time_per_question && timerRef.current.questionId && timerRef.current.questionId !== questionId) {
      const elapsed = (Date.now() - timerRef.current.startedAt) / 1000;
      setQuestionTimings(prev => ({
        ...prev,
        [timerRef.current.questionId!]: (prev[timerRef.current.questionId!] || 0) + elapsed,
      }));
    }
    // Start timer for this question
    if (qConfig.track_time_per_question && timerRef.current.questionId !== questionId) {
      timerRef.current = { questionId, startedAt: Date.now() };
    }
    onResponse(questionId, value);
  }, [onResponse, qConfig.track_time_per_question]);

  // ── Timer: flush on page change / 页面切换时刷新计时 ──
  useEffect(() => {
    if (qConfig.track_time_per_question && timerRef.current.questionId) {
      const elapsed = (Date.now() - timerRef.current.startedAt) / 1000;
      if (elapsed > 0.5) {
        setQuestionTimings(prev => ({
          ...prev,
          [timerRef.current.questionId!]: (prev[timerRef.current.questionId!] || 0) + elapsed,
        }));
      }
      timerRef.current = { questionId: null, startedAt: 0 };
    }
  }, [currentPageIndex, qConfig.track_time_per_question]);

  // ── Quality checks / 质量检查 ──
  const SCALE_TYPES = ['slider', 'bipolar_scale', 'rating', 'likert_scale', 'nps'];

  const detectStraightlining = useCallback((): boolean => {
    if (!qConfig.detect_straightlining) return false;
    const scaleQs = qs.filter((q: any) => SCALE_TYPES.includes(normalizeLegacyQuestionType(q.question_type)));
    if (scaleQs.length < 3) return false;
    const vals = scaleQs.map((q: any) => responses[q.id]).filter(v => v !== undefined && v !== null);
    if (vals.length < 3) return false;
    return vals.every(v => String(v) === String(vals[0]));
  }, [qs, responses, qConfig.detect_straightlining]);

  const detectGibberishText = useCallback((): boolean => {
    if (!qConfig.detect_gibberish) return false;
    const textQs = qs.filter((q: any) => ['text_short', 'text_long'].includes(normalizeLegacyQuestionType(q.question_type)));
    for (const q of textQs) {
      const val = responses[q.id];
      if (!val || typeof val !== 'string' || val.length < 5) continue;
      // Simple gibberish heuristics: too many consonants in a row, or repeated chars
      const repeatedChar = /(.)\1{4,}/.test(val);
      const noVowels = val.length > 10 && !/[aeiouAEIOU\u4e00-\u9fff]/.test(val);
      const allSameWord = val.split(/\s+/).length > 3 && new Set(val.toLowerCase().split(/\s+/)).size === 1;
      if (repeatedChar || noVowels || allSameWord) return true;
    }
    return false;
  }, [qs, responses, qConfig.detect_gibberish]);

  // ── Enhanced submit with timings + quality checks / 带计时和质量检查的提交 ──
  const handleSubmit = useCallback((qId: string) => {
    // Flush final timer
    if (qConfig.track_time_per_question && timerRef.current.questionId) {
      const elapsed = (Date.now() - timerRef.current.startedAt) / 1000;
      const finalTimings = {
        ...questionTimings,
        [timerRef.current.questionId]: (questionTimings[timerRef.current.questionId] || 0) + elapsed,
      };
      onResponse('__question_timings__', finalTimings);
    }

    // ── Quality flag aggregation / 质量标记聚合 ──
    const qualityFlags: string[] = [];

    // Speeder check / 抢答检查
    const sessionSeconds = (Date.now() - sessionStartRef.current) / 1000;
    if (qConfig.min_completion_time_seconds && sessionSeconds < qConfig.min_completion_time_seconds) {
      qualityFlags.push('speeder');
    }

    // Straightlining check / 直线作答检查
    if (detectStraightlining()) qualityFlags.push('straightlining');

    // Gibberish check / 乱码检查
    if (detectGibberishText()) qualityFlags.push('gibberish');

    // Store quality flags in responses / 将质量标记存储在响应中
    if (qualityFlags.length > 0) {
      onResponse('__quality_flags__', qualityFlags);
      onResponse('__completion_time_seconds__', Math.round(sessionSeconds));
    }

    // If redirect_url or custom thank-you, handle post-submit
    if (qConfig.custom_thank_you_message || qConfig.redirect_url) {
      onSubmit?.(qId);
      setShowThankYou(true);
      if (qConfig.redirect_url) {
        setTimeout(() => {
          window.location.href = qConfig.redirect_url!;
        }, 3000);
      }
      return;
    }

    onSubmit?.(qId);
  }, [onSubmit, onResponse, questionTimings, qConfig.track_time_per_question, qConfig.min_completion_time_seconds, qConfig.detect_straightlining, qConfig.detect_gibberish, qConfig.custom_thank_you_message, qConfig.redirect_url, detectStraightlining, detectGibberishText]);

  // ── Custom thank-you screen / 自定义感谢页面 ──
  if (showThankYou && activeQuestionnaireId === qConfig.id) {
    return (
      <div className={`${s.space} flex flex-col items-center justify-center py-12 text-center`}>
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <Check size={32} className="text-emerald-600" />
        </div>
        <h3 className={`${s.sectionH} font-bold text-stone-800 mb-2`}>
          {qConfig.custom_thank_you_message || 'Thank you for your response!'}
        </h3>
        {qConfig.redirect_url && (
          <p className={`${s.txtSm} text-stone-400 mt-2`}>Redirecting in 3 seconds...</p>
        )}
        {!qConfig.redirect_url && (
          <button onClick={wrap(() => onCloseQuestionnaire())}
            className={`mt-4 ${s.navPad} rounded-full font-medium text-white`}
            style={{ backgroundColor: primaryColor }}>
            Done
          </button>
        )}
      </div>
    );
  }

  // ── Expanded view / 展开视图 ──
  if (activeQuestionnaireId === qConfig.id) {
    const tabSections = qConfig.tab_sections;
    const hasTabSections = tabSections && tabSections.length > 0;

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

    let perPage: number;
    const activeSection = activeSectionId && tabSections
      ? tabSections.find(sec => sec.id === activeSectionId)
      : null;
    if (activeSection?.questions_per_page != null) {
      perPage = activeSection.questions_per_page;
    } else if (qConfig.questions_per_page != null) {
      perPage = qConfig.questions_per_page;
    } else {
      perPage = 1;
    }

    const isUnlimited = perPage >= displayQs.length;
    const effectivePerPage = isUnlimited ? displayQs.length : perPage;
    const totalPages = Math.max(1, Math.ceil(displayQs.length / effectivePerPage));
    const currentPage = Math.max(0, Math.min(Math.floor(currentPageIndex / effectivePerPage), totalPages - 1));
    const pageStart = currentPage * effectivePerPage;
    const pageQuestions = displayQs.slice(pageStart, pageStart + effectivePerPage);
    const isFirst = currentPage === 0;
    const isLast = currentPage >= totalPages - 1;
    const progress = displayQs.length > 0 ? ((pageStart + pageQuestions.length) / displayQs.length) * 100 : 0;

    const NON_INPUT_TYPES = ['section_header', 'text_block', 'instruction', 'divider', 'image_block', 'video_block', 'audio_block', 'embed_block'];
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

    // ── Piping: apply {{Q1}} replacement in question text / 管道：在问题文本中替换 {{Q1}} ──
    const enablePiping = qConfig.enable_piping;

    const renderQuestion = (q: any) => {
      const normalizedType = normalizeLegacyQuestionType(q.question_type);
      // Apply piping to text and description / 将管道应用于文本和描述
      const pipedText = enablePiping ? applyPiping(q.question_text, qs, responses) : q.question_text;
      const pipedDesc = enablePiping ? applyPiping(q.question_description, qs, responses) : q.question_description;

      if (normalizedType === 'section_header') {
        return (
          <div key={q.id} className={`${compact ? 'py-6' : 'py-10'} text-center`}>
            <h3 className={`${s.sectionH} font-bold text-stone-800`}>{pipedText}</h3>
            {pipedDesc && (
              <p className={`${s.descTxt} text-stone-400 mt-2`}>{pipedDesc}</p>
            )}
            {effectivePerPage === 1 && (
              <p className={`${s.txtXs} text-stone-300 mt-4`}>Swipe or tap Next to continue →</p>
            )}
          </div>
        );
      }

      // Clone question with piped text for renderer / 克隆带管道文本的问题给渲染器
      const pipedQuestion = enablePiping ? { ...q, question_text: pipedText, question_description: pipedDesc } : q;

      return (
        <div key={q.id} className={`${compact ? 'p-4' : 'p-5'} rounded-2xl bg-white border border-stone-100 shadow-sm ${compact ? 'space-y-3' : 'space-y-4'}`}>
          <div>
            <h3 className={`${s.txtXl} font-semibold text-stone-800 leading-snug`}>
              {pipedText}
              {q.required && <span className="text-red-400 ml-1">*</span>}
            </h3>
            {pipedDesc && (
              <p className={`${s.descTxt} text-stone-400 mt-1.5`}>{pipedDesc}</p>
            )}
          </div>
          <AIQuestionWrapper
            question={pipedQuestion}
            value={responses[q.id]}
            onResponse={handleResponse}
            aiConfig={{
              allow_ai_assist: q.question_config?.allow_ai_assist || q.allow_ai_assist,
              allow_ai_auto_answer: q.question_config?.allow_ai_auto_answer,
              allow_voice: q.question_config?.allow_voice || q.allow_voice,
            }}
            compact={compact}
          >
            <QuestionRenderer
              question={pipedQuestion}
              value={responses[q.id]}
              onResponse={handleResponse}
              primaryColor={primaryColor}
              compact={compact}
              allowVoice={q.question_config?.allow_voice || q.allow_voice}
            />
          </AIQuestionWrapper>
          {/* Per-question timer indicator / 每题计时指示器 */}
          {qConfig.track_time_per_question && questionTimings[q.id] != null && (
            <p className={`${s.txtXs} text-stone-300 text-right`}>
              {Math.round(questionTimings[q.id])}s
            </p>
          )}
        </div>
      );
    };

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
                onClick={wrap(() => handleSubmit(qConfig.id))}
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

        {/* Single-page submit */}
        {displayQs.length > 0 && totalPages <= 1 && (
          <div className={`flex justify-end ${compact ? 'pt-3 mt-3' : 'pt-4 mt-4'} border-t border-stone-100`}>
            <button type="button"
              onClick={wrap(() => handleSubmit(qConfig.id))}
              disabled={submitting}
              className={`flex items-center gap-1.5 ${compact ? 'px-4 py-1.5 text-[12px]' : 'px-5 py-2 text-[13px]'} rounded-full font-semibold text-white cursor-pointer hover:opacity-90 disabled:opacity-60 shadow-sm`}
              style={{ backgroundColor: primaryColor }}>
              {submitting ? 'Submitting...' : 'Submit'} <Check size={s.navIcon} />
            </button>
          </div>
        )}

        {/* All answered banner */}
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
              onClick={wrap(() => handleSubmit(qConfig.id))}
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
            onResponse={handleResponse}
            primaryColor={primaryColor}
            compact={compact}
          />
        )}
      </div>
    );
  }

  // ── Card view (collapsed) / 卡片视图（折叠） ──
  const subtitleParts: string[] = [];
  if (showQuestionCount && qs.length > 0) subtitleParts.push(`${qs.length} questions`);
  if (showEstimatedTime && qConfig.estimated_duration) subtitleParts.push(`${qConfig.estimated_duration} min`);
  if (showFrequency && qConfig.frequency && qConfig.frequency !== 'once') subtitleParts.push(qConfig.frequency);
  const subtitle = subtitleParts.join(' · ');

  const showIcon = cardDisplayStyle === 'icon' || cardDisplayStyle === 'both';
  const showButton = cardDisplayStyle === 'button' || cardDisplayStyle === 'both';

  // Build card classes based on card_style theme
  const cardClasses = cardStyle === 'flat'
    ? `w-full ${s.cardPad} rounded-xl bg-white transition-all text-left cursor-pointer hover:bg-stone-50`
    : cardStyle === 'outlined'
    ? `w-full ${s.cardPad} rounded-xl bg-white border-2 border-stone-200 transition-all text-left cursor-pointer hover:border-stone-300`
    : `w-full ${s.cardPad} rounded-xl bg-white border border-stone-100 shadow-sm hover:shadow-md transition-all text-left cursor-pointer`;

  return (
    <button type="button"
      onClick={wrap(() => onOpenQuestionnaire(qConfig.id))}
      className={cardClasses}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h4 className={`${s.txt} font-semibold text-stone-800`}>{qConfig.title}</h4>
          {subtitle && <p className={`${s.txtSm} text-stone-400 mt-0.5`}>{subtitle}</p>}
        </div>
        {showIcon && (
          <div className={`${s.cardCircle} rounded-full flex items-center justify-center shrink-0 ml-2`} style={{ backgroundColor: primaryColor }}>
            <ChevronRight size={s.cardIcon} className="text-white" />
          </div>
        )}
      </div>
      {showButton && (
        <div className="mt-2">
          <span className={`inline-block px-3 py-1.5 ${s.txtSm} font-medium border border-stone-200 text-stone-600`}
            style={{ borderRadius: buttonBorderRadius || '8px' }}>
            {buttonLabel || 'Open'}
          </span>
        </div>
      )}
    </button>
  );
};

export default QuestionnaireView;
