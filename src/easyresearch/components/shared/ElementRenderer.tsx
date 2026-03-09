import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { LayoutElement } from '../LayoutBuilder';
import type { QuestionnaireConfig } from '../QuestionnaireList';
import TodoListElement from './TodoListElement';

interface ElementRendererProps {
  el: LayoutElement;
  questionnaires: QuestionnaireConfig[];
  primaryColor: string;
  studyDuration: number;
  selectedTimelineDay: number;
  activeQuestionnaireId: string | null;
  /** When true, uses compact sizes for phone mockup preview */
  compact?: boolean;
  /** Callbacks */
  onOpenQuestionnaire: (qId: string) => void;
  onSelectTimelineDay: (day: number) => void;
  /** Render a questionnaire card/expanded view — delegated to parent since it involves complex state */
  renderQuestionnaireCard: (qId: string, title: string, cardOptions?: {
    showQuestionCount?: boolean; showEstimatedTime?: boolean; showFrequency?: boolean;
    cardDisplayStyle?: 'icon' | 'button' | 'both' | 'minimal'; buttonLabel?: string;
    buttonBorderRadius?: string;
  }) => React.ReactNode;
  /** Whether to stop event propagation */
  stopPropagation?: boolean;
  /** Set of completed todo card IDs */
  completedTodoIds?: Set<string>;
  /** Toggle a todo card's completion */
  onToggleTodo?: (cardId: string) => void;
}

/**
 * Shared layout element renderer for progress, consent, timeline, todo, etc.
 * Used by both AppPhonePreview and ParticipantAppView.
 */
const ElementRenderer: React.FC<ElementRendererProps> = ({
  el, questionnaires, primaryColor, studyDuration, selectedTimelineDay,
  activeQuestionnaireId, compact = false,
  onOpenQuestionnaire, onSelectTimelineDay, renderQuestionnaireCard,
  stopPropagation = false,
  completedTodoIds = new Set(), onToggleTodo,
}) => {
  if (el.config.visible === false) return null;

  const wrap = (fn: () => void) => (e?: React.MouseEvent) => {
    if (stopPropagation) e?.stopPropagation();
    fn();
  };

  // Sizes: compact (phone preview) vs full (participant)
  const txt = compact ? 'text-[13px]' : 'text-[14px]';
  const txtSm = compact ? 'text-[11px]' : 'text-[12px]';
  const txtXs = compact ? 'text-[10px]' : 'text-[11px]';
  const txtXx = compact ? 'text-[9px]' : 'text-[10px]';
  const pad = compact ? 'p-4' : 'p-5';
  const ringSize = compact ? { w: 72, h: 72, r: 28, txtPct: 'text-[12px]' } : { w: 80, h: 80, r: 32, txtPct: 'text-[14px]' };
  const stepH = compact ? 'h-2' : 'h-2.5';
  const barH = compact ? 'h-2' : 'h-2.5';

  switch (el.type) {
    case 'questionnaire':
      if (el.config.questionnaire_id) {
        const q = questionnaires?.find(qc => qc.id === el.config.questionnaire_id);
        return <>{renderQuestionnaireCard(el.config.questionnaire_id, q?.title || el.config.title || 'Questionnaire', {
          showQuestionCount: el.config.show_question_count !== false,
          showEstimatedTime: el.config.show_estimated_time !== false,
          showFrequency: el.config.show_frequency !== false,
          cardDisplayStyle: el.config.card_display_style || 'icon',
          buttonLabel: el.config.button_label,
          buttonBorderRadius: el.config.button_border_radius,
        })}</>;
      }
      return null;

    case 'progress': {
      const progressStyle = el.config.progress_style || 'bar';
      const totalQ = questionnaires?.filter(q => q.questionnaire_type === 'survey').length || 1;
      const totalSlots = totalQ * studyDuration;
      const dayNum = Math.min(Math.ceil(studyDuration * 0.4), studyDuration);
      const completed = Math.floor(dayNum * totalQ * 0.7);
      const pct = totalSlots > 0 ? Math.round((completed / totalSlots) * 100) : 0;
      const todayEntries = Math.min(totalQ, Math.ceil(totalQ * 0.6));

      if (progressStyle === 'ring') {
        const { w, h, r, txtPct } = ringSize;
        const c = 2 * Math.PI * r;
        const d = c * (1 - pct / 100);
        return (
          <div className={`${pad} rounded-xl`} style={{ backgroundColor: primaryColor + '12' }}>
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
                  <circle cx={w/2} cy={h/2} r={r} fill="none" stroke="#e7e5e4" strokeWidth="5" />
                  <circle cx={w/2} cy={h/2} r={r} fill="none" stroke={primaryColor} strokeWidth="5"
                    strokeLinecap="round" strokeDasharray={c} strokeDashoffset={d}
                    transform={`rotate(-90 ${w/2} ${h/2})`} />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center ${txtPct} font-bold`} style={{ color: primaryColor }}>
                  {pct}%
                </span>
              </div>
              <div className="flex-1">
                <span className={`${compact ? 'text-[12px]' : 'text-[13px]'} font-semibold`} style={{ color: primaryColor }}>{el.config.title || 'Study Progress'}</span>
                <p className={`${txtXs} text-stone-400 mt-0.5`}>Day {dayNum} of {studyDuration}</p>
                <p className={`${txtXs} text-stone-400`}>{todayEntries} entries today · {completed} total</p>
              </div>
            </div>
          </div>
        );
      }

      if (progressStyle === 'steps') {
        return (
          <div className={`${pad} rounded-xl`} style={{ backgroundColor: primaryColor + '12' }}>
            <div className="flex items-center justify-between mb-2">
              <span className={`${compact ? 'text-[12px]' : 'text-[13px]'} font-semibold`} style={{ color: primaryColor }}>{el.config.title || 'Study Progress'}</span>
              <span className={`${txtXs} text-stone-400`}>Day {dayNum} of {studyDuration}</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: studyDuration }, (_, i) => (
                <div key={i} className={`flex-1 ${stepH} rounded-full transition-all`}
                  style={{ backgroundColor: i < dayNum ? primaryColor : '#e7e5e4' }} />
              ))}
            </div>
            {compact && (
              <div className={`flex justify-between mt-2 ${txtXx} text-stone-400`}>
                <span>{todayEntries} entries today</span><span>{completed} total</span>
              </div>
            )}
          </div>
        );
      }

      // Default: bar
      return (
        <div className={`${pad} rounded-xl`} style={{ backgroundColor: primaryColor + '12' }}>
          <div className="flex items-center justify-between mb-2">
            <span className={`${compact ? 'text-[12px]' : 'text-[13px]'} font-semibold`} style={{ color: primaryColor }}>{el.config.title || 'Study Progress'}</span>
            <span className={`${txtXs} text-stone-400`}>Day {dayNum} of {studyDuration}</span>
          </div>
          <div className={`${barH} bg-white/60 rounded-full overflow-hidden`}>
            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: primaryColor }} />
          </div>
          {compact && (
            <div className={`flex justify-between mt-2 ${txtXx} text-stone-400`}>
              <span>{todayEntries} entries today</span><span>{completed} total</span>
            </div>
          )}
        </div>
      );
    }

    case 'consent': {
      const linkedQ = el.config.questionnaire_id ? questionnaires?.find(q => q.id === el.config.questionnaire_id) : null;
      const cardOpts = {
        showQuestionCount: el.config.show_question_count !== false,
        showEstimatedTime: el.config.show_estimated_time !== false,
        showFrequency: false,
        cardDisplayStyle: el.config.card_display_style || 'button' as const,
        buttonLabel: el.config.button_label || 'Review & Sign',
        buttonBorderRadius: el.config.button_border_radius,
      };
      if (linkedQ && activeQuestionnaireId === linkedQ.id) {
        return <>{renderQuestionnaireCard(linkedQ.id, linkedQ.title, cardOpts)}</>;
      }
      return (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🛡️</span>
            <h4 className={`${txt} font-semibold text-amber-800`}>{el.config.title || 'Consent Form'}</h4>
          </div>
          {linkedQ ? (
            <>
              {cardOpts.showQuestionCount && <p className={`${txtSm} text-amber-600`}>{linkedQ.questions?.length || 0} fields to complete</p>}
              {cardOpts.showEstimatedTime && <p className={`${txtXs} text-amber-500`}>~{linkedQ.estimated_duration || 5} min</p>}
              {(cardOpts.cardDisplayStyle === 'button' || cardOpts.cardDisplayStyle === 'both') && (
                <button onClick={wrap(() => onOpenQuestionnaire(linkedQ.id))}
                  className={`mt-2 px-3 py-1.5 bg-amber-500 text-white ${txtSm} font-medium hover:bg-amber-600 transition-colors`}
                  style={{ borderRadius: cardOpts.buttonBorderRadius || '8px' }}>
                  {cardOpts.buttonLabel}
                </button>
              )}
              {(cardOpts.cardDisplayStyle === 'icon' || cardOpts.cardDisplayStyle === 'both') && (
                <div className="flex justify-end mt-1 cursor-pointer" onClick={wrap(() => onOpenQuestionnaire(linkedQ.id))}>
                  <ChevronRight size={16} className="text-amber-400" />
                </div>
              )}
              {cardOpts.cardDisplayStyle === 'minimal' && (
                <div className="cursor-pointer" onClick={wrap(() => onOpenQuestionnaire(linkedQ.id))} />
              )}
            </>
          ) : (
            <p className={`${txtSm} text-amber-600 italic`}>No consent form linked</p>
          )}
        </div>
      );
    }

    case 'screening': {
      const linkedQ = el.config.questionnaire_id ? questionnaires?.find(q => q.id === el.config.questionnaire_id) : null;
      if (linkedQ && activeQuestionnaireId === linkedQ.id) {
        return <>{renderQuestionnaireCard(linkedQ.id, linkedQ.title)}</>;
      }
      return (
        <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
          <h4 className={`${txt} font-semibold text-orange-800`}>📝 {el.config.title || 'Screening'}</h4>
          {linkedQ ? (
            <>
              <p className={`${txtSm} text-orange-600 mt-1`}>{linkedQ.questions?.length || 0} screening questions</p>
              <button onClick={wrap(() => onOpenQuestionnaire(linkedQ.id))}
                className={`mt-2 px-3 py-1.5 bg-orange-500 text-white ${txtSm} font-medium hover:bg-orange-600 transition-colors`}
                style={{ borderRadius: el.config.button_border_radius || '8px' }}>
                {el.config.button_label || 'Start Screening'}
              </button>
            </>
          ) : (
            <p className={`${txtSm} text-orange-600 mt-1 italic`}>No screening linked</p>
          )}
        </div>
      );
    }

    case 'profile': {
      const linkedQ = el.config.questionnaire_id ? questionnaires?.find(q => q.id === el.config.questionnaire_id) : null;
      if (linkedQ && activeQuestionnaireId === linkedQ.id) {
        return <>{renderQuestionnaireCard(linkedQ.id, linkedQ.title)}</>;
      }
      return (
        <div className="p-4 rounded-xl bg-white border border-stone-100 shadow-sm">
          <h4 className={`${txt} font-semibold text-stone-800`}>👤 {el.config.title || 'Profile'}</h4>
          {linkedQ ? (
            <>
              <p className={`${txtSm} text-stone-400 mt-1`}>{linkedQ.questions?.length || 0} profile fields</p>
              <button onClick={wrap(() => onOpenQuestionnaire(linkedQ.id))}
                className={`mt-2 px-3 py-1.5 ${txtSm} font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors`}
                style={{ borderRadius: el.config.button_border_radius || '8px' }}>
                {el.config.button_label || 'Edit Profile'}
              </button>
            </>
          ) : compact ? (
            <div className="mt-2 space-y-2">
              <div className="h-2.5 bg-stone-100 rounded-full w-3/4" />
              <div className="h-2.5 bg-stone-100 rounded-full w-1/2" />
              <p className={`${txtXx} text-stone-400 italic`}>No profile linked</p>
            </div>
          ) : (
            <p className={`${txtSm} text-stone-400 mt-1 italic`}>No profile linked</p>
          )}
        </div>
      );
    }

    case 'ecogram':
      return (
        <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
          <h4 className={`${txt} font-semibold text-violet-800`}>🔗 {el.config.title || 'Ecogram'}</h4>
          <p className={`${txtXx} text-violet-500 mt-1`}>Interactive care network diagram</p>
          {compact && (
            <div className="flex justify-center mt-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-violet-300 border-3 border-violet-400 flex items-center justify-center text-[10px] text-white font-bold">You</div>
                {[45, 135, 225, 315].map((angle, i) => (
                  <div key={i} className="absolute w-6 h-6 rounded-full bg-violet-200 border border-violet-300"
                    style={{ top: `${24 - 28 * Math.cos(angle * Math.PI / 180)}px`, left: `${24 + 28 * Math.sin(angle * Math.PI / 180)}px` }} />
                ))}
              </div>
            </div>
          )}
          {compact && <p className="text-[9px] text-center text-violet-400 mt-2">Tap to edit your network</p>}
        </div>
      );

    case 'timeline': {
      const days = el.config.timeline_days || studyDuration || 7;
      const startH = el.config.timeline_start_hour ?? 0;
      const endH = el.config.timeline_end_hour ?? 23;
      const allHours: number[] = [];
      for (let h = startH; h <= endH; h++) allHours.push(h);

      // Support multiple questionnaires via questionnaire_ids (backward compat with single questionnaire_id)
      const linkedIds: string[] = (el.config as any).questionnaire_ids?.length
        ? (el.config as any).questionnaire_ids
        : el.config.questionnaire_id
          ? [el.config.questionnaire_id]
          : [];
      const linkedQs = linkedIds
        .map(id => questionnaires?.find(q => q.id === id))
        .filter(Boolean) as QuestionnaireConfig[];

      // If no explicit links, fall back to first survey questionnaire
      const effectiveQs = linkedQs.length > 0
        ? linkedQs
        : (questionnaires?.filter(q => q.questionnaire_type === 'survey').slice(0, 1) || []);

      // Build a map: hour → list of questionnaire entries scheduled at that hour
      // Each questionnaire contributes its own scheduled hours based on frequency & time_windows
      const hourEntries = new Map<number, { q: QuestionnaireConfig; isCompleted: boolean }[]>();

      for (const q of effectiveQs) {
        const tw = q.time_windows;
        const windowStart = tw?.[0]?.start ? parseInt(tw[0].start.split(':')[0], 10) : 9;
        const windowEnd = tw?.[0]?.end ? parseInt(tw[0].end.split(':')[0], 10) : 21;
        const freq = q.frequency || 'daily';
        let intervalH = 24;
        switch (freq) {
          case 'hourly': intervalH = 1; break;
          case '2hours': intervalH = 2; break;
          case '3hours': intervalH = 3; break;
          case '4hours': intervalH = 4; break;
          case '6hours': intervalH = 6; break;
          case 'twice_daily': intervalH = Math.max(1, Math.floor((windowEnd - windowStart) / 2)); break;
          case 'three_daily': intervalH = Math.max(1, Math.floor((windowEnd - windowStart) / 3)); break;
          case 'daily': case 'once': intervalH = 24; break;
          default: intervalH = 24;
        }
        const scheduledHours: number[] = [];
        if (intervalH >= 24) {
          scheduledHours.push(windowStart);
        } else {
          for (let h = windowStart; h <= windowEnd; h += intervalH) scheduledHours.push(h);
        }
        for (const h of scheduledHours) {
          if (h < startH || h > endH) continue;
          if (!hourEntries.has(h)) hourEntries.set(h, []);
          // Preview simulation: past days = completed
          const isCompleted = selectedTimelineDay < Math.ceil(days / 2);
          hourEntries.get(h)!.push({ q, isCompleted });
        }
      }

      // Color palette for multiple questionnaires
      const qColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

      return (
        <div className="p-4 rounded-xl bg-white border border-stone-100 shadow-sm space-y-3">
          <h4 className={`${txt} font-semibold text-stone-800`}>📅 {el.config.title || 'Study Timeline'}</h4>
          {effectiveQs.length === 0 && (
            <p className={`${txtSm} text-stone-400 italic`}>No questionnaire linked. Configure in Layout settings.</p>
          )}
          {/* Legend for multiple questionnaires */}
          {effectiveQs.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {effectiveQs.map((q, i) => (
                <span key={q.id} className="flex items-center gap-1 text-[10px] text-stone-500">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: qColors[i % qColors.length] }} />
                  {q.title}
                </span>
              ))}
            </div>
          )}
          <div className={`flex ${compact ? 'gap-1' : 'gap-1.5'} overflow-x-auto`} style={{ scrollbarWidth: 'none' }}>
            {Array.from({ length: Math.min(days, 30) }, (_, i) => i + 1).map(d => (
              <button key={d} onClick={wrap(() => onSelectTimelineDay(d))}
                className={`px-2${compact ? '' : '.5'} py-1 rounded-lg ${txtXs} font-medium transition-all shrink-0`}
                style={{ backgroundColor: d === selectedTimelineDay ? primaryColor : 'transparent', color: d === selectedTimelineDay ? 'white' : '#a8a29e' }}>
                D{d}
              </button>
            ))}
            {compact && days > 30 && <span className="text-[9px] text-stone-400 self-center ml-1">+{days - 30}</span>}
          </div>
          <div className={`space-y-0.5 ${compact ? 'max-h-48' : 'max-h-60'} overflow-y-auto`} style={{ scrollbarWidth: 'thin' }}>
            {allHours.map(h => {
              const entries = hourEntries.get(h) || [];
              const hasEntries = entries.length > 0;
              return (
                <div key={h} className="flex items-start gap-2">
                  <span className={`${txtXx} text-stone-300 ${compact ? 'w-7' : 'w-8'} text-right shrink-0 font-mono pt-1`}>{String(h).padStart(2, '0')}:00</span>
                  {hasEntries ? (
                    <div className="flex-1 space-y-0.5">
                      {entries.map((entry, ei) => {
                        const color = qColors[effectiveQs.indexOf(entry.q) % qColors.length];
                        return (
                          <div key={`${h}-${ei}`}
                            className={`rounded-md cursor-pointer hover:opacity-80 ${compact ? 'py-1 px-2' : 'py-1.5 px-2.5'}`}
                            onClick={wrap(() => onOpenQuestionnaire(entry.q.id))}
                            style={{ backgroundColor: entry.isCompleted ? '#dcfce7' : `${color}10`, borderLeft: `3px solid ${entry.isCompleted ? '#16a34a' : color}` }}>
                            <div className="flex items-center justify-between">
                              <span className={`${txtXs} font-medium`} style={{ color: entry.isCompleted ? '#16a34a' : color }}>
                                {entry.q.title || 'Survey'}
                              </span>
                              <span className={`${txtXx}`} style={{ color: entry.isCompleted ? '#16a34a' : '#a8a29e' }}>
                                {entry.isCompleted ? '✓' : '○'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex-1 h-px bg-stone-50 mt-2" />
                  )}
                </div>
              );
            })}
          </div>
          {compact && (
            <div className="flex gap-3">
              <span className="flex items-center gap-1 text-[10px] text-stone-400"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Done</span>
              <span className="flex items-center gap-1 text-[10px] text-stone-400"><span className="w-2 h-2 rounded-full bg-stone-200 inline-block" /> Scheduled</span>
            </div>
          )}
        </div>
      );
    }

    case 'help': {
      const linkedQ = el.config.questionnaire_id ? questionnaires?.find(q => q.id === el.config.questionnaire_id) : null;
      if (linkedQ && activeQuestionnaireId === linkedQ.id) {
        return <>{renderQuestionnaireCard(linkedQ.id, linkedQ.title)}</>;
      }
      return (
        <div className="p-4 rounded-xl bg-white border border-stone-100 shadow-sm">
          <h4 className={`${txt} font-semibold text-stone-800`}>❓ {el.config.title || 'Help & FAQ'}</h4>
          {linkedQ ? (
            <>
              <p className={`${txtSm} text-stone-400 mt-1`}>{linkedQ.questions?.length || 0} help items</p>
              <button onClick={wrap(() => onOpenQuestionnaire(linkedQ.id))}
                className={`mt-2 px-3 py-1.5 ${txtSm} font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors`}
                style={{ borderRadius: el.config.button_border_radius || '8px' }}>
                {el.config.button_label || 'View Help'}
              </button>
            </>
          ) : (
            <p className={`${txtSm} text-stone-400 mt-1`}>Common questions and support{compact ? ' contact' : ''}</p>
          )}
        </div>
      );
    }

    case 'custom': {
      const linkedQ = el.config.questionnaire_id ? questionnaires?.find(q => q.id === el.config.questionnaire_id) : null;
      if (linkedQ && activeQuestionnaireId === linkedQ.id) {
        return <>{renderQuestionnaireCard(linkedQ.id, linkedQ.title)}</>;
      }
      return (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
          <h4 className={`${txt} font-semibold text-emerald-800`}>🧩 {el.config.title || 'Custom Component'}</h4>
          {linkedQ ? (
            <>
              <p className={`${txtSm} text-emerald-600 mt-1`}>{linkedQ.questions?.length || 0} fields</p>
              <button onClick={wrap(() => onOpenQuestionnaire(linkedQ.id))}
                className={`mt-2 px-3 py-1.5 ${txtSm} font-medium border border-emerald-300 text-emerald-700 hover:bg-emerald-100 transition-colors`}
                style={{ borderRadius: el.config.button_border_radius || '8px' }}>
                {el.config.button_label || 'Open'}
              </button>
            </>
          ) : (
            <p className={`${txtSm} text-emerald-600 mt-1 italic`}>No component linked</p>
          )}
        </div>
      );
    }

    case 'todo_list':
      return (
        <TodoListElement
          el={el}
          questionnaires={questionnaires}
          compact={compact}
          completedTodoIds={completedTodoIds}
          onToggleTodo={onToggleTodo}
          onOpenQuestionnaire={onOpenQuestionnaire}
          stopPropagation={stopPropagation}
        />
      );

    case 'text_block':
      return (
        <div className={`${compact ? 'p-3' : 'p-4'} rounded-xl bg-stone-50`}>
          <p className={`${compact ? 'text-[12px]' : 'text-[13px]'} text-stone-600`}>{el.config.content || el.config.title || 'Text content...'}</p>
        </div>
      );

    case 'spacer':
      return <div style={{ height: el.config.style?.height || '16px' }} />;

    case 'divider':
      return <div className="border-t border-stone-200 my-2" />;

    case 'button':
      return (
        <button className={`w-full ${compact ? 'py-3 text-[13px]' : 'py-3.5 text-[14px]'} font-semibold text-white`}
          style={{ backgroundColor: primaryColor, borderRadius: el.config.button_border_radius || '12px' }}>
          {el.config.button_label || el.config.title || 'Button'}
        </button>
      );

    case 'image':
      return el.config.image_url ? (
        <img src={el.config.image_url} alt="" className="w-full rounded-xl" />
      ) : compact ? (
        <div className="rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center h-24">
          <span className="text-[11px] text-stone-400">🖼️ No image set</span>
        </div>
      ) : null;

    default:
      return (
        <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
          <span className={`${txtSm} text-stone-400`}>{el.type}</span>
        </div>
      );
  }
};

export default ElementRenderer;
