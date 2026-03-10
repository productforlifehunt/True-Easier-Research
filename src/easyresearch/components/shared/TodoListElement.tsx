import React, { useRef, useEffect } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import type { LayoutElement } from '../LayoutBuilder';
import type { QuestionnaireConfig } from '../QuestionnaireList';

interface TodoListElementProps {
  el: LayoutElement;
  questionnaires: QuestionnaireConfig[];
  compact?: boolean;
  completedTodoIds: Set<string>;
  onToggleTodo?: (cardId: string) => void;
  onOpenQuestionnaire: (qId: string) => void;
  stopPropagation?: boolean;
}

const TodoListElement: React.FC<TodoListElementProps> = ({
  el, questionnaires, compact = false,
  completedTodoIds, onToggleTodo,
  onOpenQuestionnaire, stopPropagation = false,
}) => {
  const cards = el.config.todo_cards || [];
  const isVertical = el.config.todo_layout === 'vertical';
  const autoScroll = el.config.todo_auto_scroll ?? false;
  const scrollRef = useRef<HTMLDivElement>(null);

  const txt = compact ? 'text-[13px]' : 'text-[14px]';
  const txtSm = compact ? 'text-[11px]' : 'text-[12px]';
  const txtXs = compact ? 'text-[10px]' : 'text-[11px]';
  const txtXx = compact ? 'text-[9px]' : 'text-[10px]';

  const wrap = (fn: () => void) => (e?: React.MouseEvent) => {
    if (stopPropagation) e?.stopPropagation();
    fn();
  };

  useEffect(() => {
    if (!autoScroll || !scrollRef.current) return;
    const firstUncheckedIdx = cards.findIndex(c => !completedTodoIds.has(c.id));
    if (firstUncheckedIdx < 0) return;
    const container = scrollRef.current;
    const target = container.children[firstUncheckedIdx] as HTMLElement;
    if (!target) return;
    if (isVertical) {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      container.scrollTo({ left: target.offsetLeft - 12, behavior: 'smooth' });
    }
  }, [completedTodoIds, autoScroll, cards.length, isVertical]);

  if (cards.length === 0) {
    return (
      <div className="space-y-2">
        <h4 className={`${txt} font-semibold text-stone-800`}>{el.config.title || 'To-Do'}</h4>
        <p className={`${txtSm} text-stone-400 italic`}>No tasks{compact ? ' configured' : ''}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className={`${txt} font-semibold text-stone-800`}>{el.config.title || 'To-Do'}</h4>
      <div
        ref={scrollRef}
        className={isVertical ? 'flex flex-col gap-2' : 'flex gap-2 overflow-x-auto pb-2'}
        style={isVertical ? {} : { scrollbarWidth: 'none', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {cards.map((card, ci) => {
          const isDone = completedTodoIds.has(card.id);
          const isAutoComplete = card.completion_trigger === 'questionnaire_complete';
          const qTitle = card.type === 'questionnaire'
            ? (questionnaires?.find(q => q.id === card.questionnaire_id)?.title || 'Survey')
            : card.title;

          return (
            <div key={card.id}
              className={`${isVertical ? '' : 'shrink-0 w-[85%]'} ${compact ? 'p-3.5' : 'p-4'} rounded-xl border shadow-sm transition-all ${isDone ? 'opacity-60' : ''}`}
              style={{
                scrollSnapAlign: isVertical ? undefined : 'start',
                backgroundColor: isDone ? '#f5f5f4' : ci === 0 && !isDone ? '#f0fdf4' : 'white',
                borderColor: isDone ? '#d6d3d1' : ci === 0 && !isDone ? '#86efac' : '#e7e5e4',
              }}>
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                  onClick={wrap(() => {
                    if (!isAutoComplete && onToggleTodo) onToggleTodo(card.id);
                  })}
                  className={`shrink-0 mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isDone ? 'border-emerald-500 bg-emerald-500' : 'border-stone-300 hover:border-emerald-400'} ${isAutoComplete ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  {isDone && <Check size={12} className="text-white" strokeWidth={3} />}
                </button>
                <div className="flex-1 min-w-0 cursor-pointer"
                  onClick={card.type === 'questionnaire' && card.questionnaire_id ? wrap(() => onOpenQuestionnaire(card.questionnaire_id!)) : undefined}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`${compact ? 'text-[12px]' : 'text-[13px]'} font-semibold text-stone-800 ${isDone ? 'line-through' : ''}`}>
                      {qTitle || 'Task'}
                    </span>
                    <span className={`${txtXx} ${compact ? 'px-1.5' : 'px-2'} py-0.5 rounded-full`}
                      style={{
                        backgroundColor: isDone ? '#dcfce7' : isAutoComplete ? '#eff6ff' : '#f5f5f4',
                        color: isDone ? '#16a34a' : isAutoComplete ? '#3b82f6' : '#a8a29e',
                      }}>
                      {isDone ? 'Done' : isAutoComplete ? 'Auto' : ci === 0 ? 'Current' : 'Upcoming'}
                    </span>
                  </div>
                  {card.description && <p className={`${txtXs} text-stone-400`}>{card.description}</p>}
                  {isAutoComplete && !isDone && (
                    <p className={`${txtXx} text-blue-400 mt-0.5`}>Completes when survey is submitted</p>
                  )}
                  {compact && card.type === 'questionnaire' && !isDone && (
                    <div className="mt-2 flex items-center gap-1">
                      <ChevronRight size={10} className="text-emerald-500" />
                      <span className="text-[10px] text-emerald-600 font-medium">Start</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TodoListElement;
