import React, { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Check, Home, FileText, Settings, BarChart3, HelpCircle, Layout, GripVertical, Trash2, Edit3, Move, Calendar, User, Users, MessageCircle, Bell, Heart, Star, Shield, ClipboardCheck, Sparkles, BookOpen, Globe, Camera, Mic, Phone, Mail, Map, Clock, CheckSquare, ListChecks, Activity, Award, Briefcase, icons as allIcons } from 'lucide-react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { normalizeLegacyQuestionType } from '../constants/questionTypes';
import QuestionRenderer from './shared/QuestionRenderer';
import QuestionnaireView from './shared/QuestionnaireView';
import ElementRenderer from './shared/ElementRenderer';
import type { AppLayout, LayoutElement } from './LayoutBuilder';
import type { QuestionnaireConfig } from './QuestionnaireList';
import type { ParticipantType } from './ParticipantTypeManager';

interface AppPhonePreviewProps {
  layout: AppLayout;
  questionnaires: QuestionnaireConfig[];
  participantTypes?: ParticipantType[];
  studyDuration?: number;
  activeTabId?: string;
  onActiveTabChange?: (tabId: string) => void;
  highlightedElementId?: string | null;
  onElementClick?: (elementId: string) => void;
  /** If true, shows drag handles and edit/delete on phone elements (Layout builder mode) */
  editable?: boolean;
  onRemoveElement?: (elementId: string) => void;
  onUpdateElement?: (elementId: string, config: Partial<LayoutElement['config']>) => void;
  scale?: number;
  frameWidth?: number;
  frameHeight?: number;
  /** Filter elements by participant type ID */
  filterParticipantTypeId?: string | null;
  /** Open project-level AI Assistant dialog */
  onOpenAiAssistant?: () => void;
  /** Project title fallback for header */
  projectTitle?: string;
}

const ICON_MAP: Record<string, React.FC<any>> = {
  Home, FileText, BarChart3, HelpCircle, Settings, Layout,
  Calendar, User, Users, MessageCircle, Bell, Heart, Star,
  Shield, ClipboardCheck, Sparkles, BookOpen, Globe, Camera,
  Mic, Phone, Mail, Map, Clock, CheckSquare, ListChecks,
  Activity, Award, Briefcase,
};

const AppPhonePreview: React.FC<AppPhonePreviewProps> = ({
  layout, questionnaires, participantTypes, studyDuration = 7,
  activeTabId: controlledTabId, onActiveTabChange,
  highlightedElementId, onElementClick, projectTitle,
  editable = false, onRemoveElement, onUpdateElement,
  scale = 1, frameWidth = 375, frameHeight = 680,
  filterParticipantTypeId,
  onOpenAiAssistant,
}) => {
  const [internalTabId, setInternalTabId] = useState(layout.tabs[0]?.id || '');
  const [activeQuestionnaireId, setActiveQuestionnaireId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [selectedTimelineDay, setSelectedTimelineDay] = useState(2);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const currentTabId = controlledTabId ?? internalTabId;
  const setCurrentTabId = (id: string) => {
    if (onActiveTabChange) onActiveTabChange(id);
    else setInternalTabId(id);
  };

  const activeTab = layout.tabs.find(t => t.id === currentTabId);
  const primaryColor = layout.theme?.primary_color || '#10b981';
  const bgColor = layout.theme?.background_color || '#f5f5f4';
  const cardStyle = layout.theme?.card_style || 'elevated';

  const handleResponse = (questionId: string, value: any) => setResponses({ ...responses, [questionId]: value });

  const getQuestionsForQuestionnaire = (qId: string): any[] => {
    return questionnaires?.find(q => q.id === qId)?.questions || [];
  };

  // ── Question input renderer (shared) ──
  const renderQuestionInput = (question: any) => (
    <QuestionRenderer
      question={question}
      value={responses[question.id]}
      onResponse={handleResponse}
      primaryColor={primaryColor}
      compact={true}
    />
  );

  // ── Questionnaire card/expanded view (shared) ──
  const renderQuestionnaireCard = (qId: string, qTitle: string, cardOptions?: {
    showQuestionCount?: boolean; showEstimatedTime?: boolean; showFrequency?: boolean;
    cardDisplayStyle?: 'icon' | 'button' | 'both' | 'minimal'; buttonLabel?: string;
    buttonBorderRadius?: string;
  }) => {
    const qConfig = questionnaires?.find(q => q.id === qId);
    if (!qConfig) return null;
    return (
      <QuestionnaireView
        qConfig={qConfig}
        activeQuestionnaireId={activeQuestionnaireId}
        activeSectionId={activeSectionId}
        currentPageIndex={currentQuestionIndex}
        responses={responses}
        primaryColor={primaryColor}
        backLabel={activeTab?.label || 'Home'}
        compact={true}
        stopPropagation={true}
        onOpenQuestionnaire={(id) => { setActiveQuestionnaireId(id); setCurrentQuestionIndex(0); }}
        onCloseQuestionnaire={() => { setActiveQuestionnaireId(null); setCurrentQuestionIndex(0); }}
        onSetSection={(sId) => { setActiveSectionId(sId); }}
        onSetPage={setCurrentQuestionIndex}
        onResponse={handleResponse}
        showQuestionCount={cardOptions?.showQuestionCount}
        showEstimatedTime={cardOptions?.showEstimatedTime}
        showFrequency={cardOptions?.showFrequency}
        cardDisplayStyle={cardOptions?.cardDisplayStyle}
        buttonLabel={cardOptions?.buttonLabel}
        buttonBorderRadius={cardOptions?.buttonBorderRadius}
        cardStyle={cardStyle}
      />
    );
  };

  // ── Render any layout element (shared) ──
  const renderElement = (el: LayoutElement) => {
    if (el.config.visible === false) return null;
    // Filter by participant type if a filter is active
    if (filterParticipantTypeId && el.config.participant_types && el.config.participant_types.length > 0) {
      if (!el.config.participant_types.includes(filterParticipantTypeId)) return null;
    }
    return (
      <ElementRenderer
        el={el}
        questionnaires={questionnaires}
        primaryColor={primaryColor}
        studyDuration={studyDuration}
        selectedTimelineDay={selectedTimelineDay}
        activeQuestionnaireId={activeQuestionnaireId}
        compact={true}
        stopPropagation={true}
        onOpenQuestionnaire={(id) => { setActiveQuestionnaireId(id); setCurrentQuestionIndex(0); }}
        onSelectTimelineDay={setSelectedTimelineDay}
        renderQuestionnaireCard={renderQuestionnaireCard}
        onOpenAiAssistant={onOpenAiAssistant}
      />
    );
  };

  // ── Resize logic ──
  const resizeRef = useRef<{ elementId: string; dir: 'height' | 'width'; startY: number; startX: number; startVal: number } | null>(null);
  const deltaRef = useRef<{ dw: number; dh: number }>({ dw: 0, dh: 0 });
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [resizeDelta, setResizeDelta] = useState<{ dw: number; dh: number }>({ dw: 0, dh: 0 });
  const [selectedElId, setSelectedElId] = useState<string | null>(null);

  const startResize = useCallback((e: React.MouseEvent | React.TouchEvent, elementId: string, dir: 'height' | 'width', currentVal: number) => {
    e.stopPropagation();
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    resizeRef.current = { elementId, dir, startY: clientY, startX: clientX, startVal: currentVal };
    deltaRef.current = { dw: 0, dh: 0 };
    setResizingId(elementId);
    setResizeDelta({ dw: 0, dh: 0 });

    const onMove = (ev: MouseEvent | TouchEvent) => {
      if (!resizeRef.current) return;
      const cx = 'touches' in ev ? ev.touches[0].clientX : ev.clientX;
      const cy = 'touches' in ev ? ev.touches[0].clientY : ev.clientY;
      const dx = cx - resizeRef.current.startX;
      const dy = cy - resizeRef.current.startY;
      deltaRef.current = { dw: dx, dh: dy };
      setResizeDelta({ dw: dx, dh: dy });
    };

    const onEnd = () => {
      if (resizeRef.current && onUpdateElement) {
        const { elementId: eid, dir: d, startVal: sv } = resizeRef.current;
        const el = activeTab?.elements.find(e => e.id === eid);
        if (d === 'height') {
          const newH = Math.max(40, sv + deltaRef.current.dh);
          onUpdateElement(eid, { style: { ...el?.config.style, height: `${Math.round(newH)}px` } });
        } else {
          const containerW = frameWidth - 32;
          const currentPct = parseInt(el?.config.width || '100') || 100;
          const currentPx = (currentPct / 100) * containerW;
          const newPx = currentPx + deltaRef.current.dw;
          const pct = Math.round((newPx / containerW) * 100);
          const snapped = pct >= 90 ? '100%' : pct >= 62 ? '75%' : pct >= 40 ? '50%' : pct >= 28 ? '33%' : '25%';
          onUpdateElement(eid, { width: snapped });
        }
      }
      resizeRef.current = null;
      deltaRef.current = { dw: 0, dh: 0 };
      setResizingId(null);
      setResizeDelta({ dw: 0, dh: 0 });
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }, [onUpdateElement, activeTab, frameWidth]);

  // Measure actual rendered height for resize start value
  const elRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ── Wrap element with editable controls ──
  const renderElementWrapper = (el: LayoutElement, index: number) => {
    const isHighlighted = highlightedElementId === el.id;
    const isSelected = selectedElId === el.id;
    const isResizing = resizingId === el.id;
    const showControls = isHighlighted || isSelected || isResizing;
    const content = renderElement(el);
    if (content === null) return null;

    if (editable) {
      const explicitHeight = el.config.style?.height ? parseInt(el.config.style.height) : 0;
      const savedHeight = el.config.style?.height || '';

      const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedElId(isSelected ? null : el.id);
        onElementClick?.(el.id);
      };

      const getResizeStartHeight = () => {
        if (explicitHeight > 0) return explicitHeight;
        const domEl = elRefs.current[el.id];
        return domEl ? domEl.getBoundingClientRect().height : 100;
      };

      // Compute live height during resize
      const liveHeight = isResizing && resizeRef.current?.dir === 'height'
        ? Math.max(40, (explicitHeight || (elRefs.current[el.id]?.getBoundingClientRect().height ?? 100)) + resizeDelta.dh)
        : explicitHeight;

      // Build custom styles from element config
      const customStyle = el.config.style || {};
      const activeHeight = isResizing && resizeRef.current?.dir === 'height'
        ? `${liveHeight}px`
        : savedHeight;
      const hasFixedHeight = !!activeHeight;

      return (
        <Draggable key={el.id} draggableId={`phone-el-${el.id}`} index={index}>
          {(provided, snapshot) => (
            <div
              ref={(node) => { provided.innerRef(node); elRefs.current[el.id] = node; }}
              {...provided.draggableProps}
              data-resize-id={el.id}
              className={`relative group/el transition-all cursor-pointer rounded-xl ${showControls ? 'ring-2 ring-emerald-400 shadow-emerald-100 shadow-md' : 'hover:ring-1 hover:ring-stone-300'} ${snapshot.isDragging ? 'ring-2 ring-blue-400 shadow-lg z-50' : ''} ${isResizing ? 'ring-2 ring-blue-400' : ''}`}
              style={{
                ...(provided.draggableProps.style || {}),
                opacity: customStyle.opacity ?? 1,
                ...(customStyle.bg_color ? { backgroundColor: customStyle.bg_color } : {}),
                ...(customStyle.text_color && customStyle.text_color !== 'inherit' ? { color: customStyle.text_color } : {}),
                ...(customStyle.padding ? { padding: customStyle.padding } : {}),
                ...(customStyle.margin ? { margin: customStyle.margin } : {}),
                ...(customStyle.border_radius ? { borderRadius: customStyle.border_radius } : {}),
                ...(customStyle.border ? { border: customStyle.border } : {}),
                ...(customStyle.shadow && customStyle.shadow !== 'none' ? { boxShadow: { sm: '0 1px 2px rgba(0,0,0,0.05)', md: '0 4px 6px rgba(0,0,0,0.1)', lg: '0 10px 15px rgba(0,0,0,0.1)', xl: '0 20px 25px rgba(0,0,0,0.1)' }[customStyle.shadow] } : {}),
                ...(customStyle.text_align ? { textAlign: customStyle.text_align as any } : {}),
                ...(customStyle.font_size ? { fontSize: customStyle.font_size } : {}),
                ...(customStyle.font_weight ? { fontWeight: customStyle.font_weight } : {}),
                // Height MUST come after DnD styles to avoid being overridden
                ...(hasFixedHeight ? {
                  height: activeHeight,
                  overflow: 'hidden',
                } : {}),
              }}
              onClick={handleClick}
            >
              {/* Floating toolbar — visible on click/select */}
              <div className={`absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-0.5 bg-white rounded-full shadow-lg border border-stone-200 px-1.5 py-0.5 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0 group-hover/el:opacity-100'}`}>
                <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-1 hover:bg-stone-100 rounded-full" title="Drag to reorder">
                  <Move size={11} className="text-stone-500" />
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); onElementClick?.(el.id); }}
                  className="p-1 hover:bg-emerald-50 rounded-full" title="Edit settings">
                  <Edit3 size={11} className="text-emerald-500" />
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); onRemoveElement?.(el.id); }}
                  className="p-1 hover:bg-red-50 rounded-full" title="Delete">
                  <Trash2 size={11} className="text-red-400" />
                </button>
              </div>

              {/* Dimension badge */}
              {showControls && (
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-20 bg-stone-800 text-white text-[9px] font-mono px-2 py-0.5 rounded-full whitespace-nowrap">
                  {el.config.width || '100%'} × {isResizing && resizeRef.current?.dir === 'height' 
                    ? `${liveHeight}px` 
                    : (savedHeight || 'auto')}
                </div>
              )}

              {/* Content wrapper — stretches inner card to fill fixed height + vertical alignment */}
              <div
                className="element-content-wrap"
                data-valign={hasFixedHeight ? (customStyle.content_align || 'top') : undefined}
                style={hasFixedHeight ? {
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: customStyle.content_align === 'center' ? 'center'
                    : customStyle.content_align === 'bottom' ? 'flex-end'
                    : 'flex-start',
                } : {}}
              >
                {content}
              </div>

              {/* Bottom resize handle (height) — shows on click */}
              {showControls && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-3 cursor-row-resize z-10 flex items-center justify-center group/resize"
                  onMouseDown={(e) => startResize(e, el.id, 'height', getResizeStartHeight())}
                  onTouchStart={(e) => startResize(e, el.id, 'height', getResizeStartHeight())}
                >
                  <div className="w-12 h-1.5 bg-emerald-400 rounded-full opacity-70 group-hover/resize:opacity-100 transition-opacity" />
                </div>
              )}

              {/* Right resize handle (width) — shows on click */}
              {showControls && (
                <div
                  className="absolute top-0 right-0 bottom-0 w-3 cursor-col-resize z-10 flex items-center justify-center group/resize"
                  onMouseDown={(e) => startResize(e, el.id, 'width', 0)}
                  onTouchStart={(e) => startResize(e, el.id, 'width', 0)}
                >
                  <div className="h-12 w-1.5 bg-emerald-400 rounded-full opacity-70 group-hover/resize:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
          )}
        </Draggable>
      );
    }

    // Non-editable (Preview tab) — still apply style overrides
    const previewCustomStyle = el.config.style || {};
    const previewStyle: React.CSSProperties = {
      ...(previewCustomStyle.opacity != null && previewCustomStyle.opacity !== 1 ? { opacity: previewCustomStyle.opacity } : {}),
      ...(previewCustomStyle.bg_color ? { backgroundColor: previewCustomStyle.bg_color } : {}),
      ...(previewCustomStyle.text_color && previewCustomStyle.text_color !== 'inherit' ? { color: previewCustomStyle.text_color } : {}),
      ...(previewCustomStyle.padding ? { padding: previewCustomStyle.padding } : {}),
      ...(previewCustomStyle.margin ? { margin: previewCustomStyle.margin } : {}),
      ...(previewCustomStyle.border_radius ? { borderRadius: previewCustomStyle.border_radius } : {}),
      ...(previewCustomStyle.border ? { border: previewCustomStyle.border } : {}),
      ...(previewCustomStyle.shadow && previewCustomStyle.shadow !== 'none' ? { boxShadow: { sm: '0 1px 2px rgba(0,0,0,0.05)', md: '0 4px 6px rgba(0,0,0,0.1)', lg: '0 10px 15px rgba(0,0,0,0.1)', xl: '0 20px 25px rgba(0,0,0,0.1)' }[previewCustomStyle.shadow] } : {}),
      ...(previewCustomStyle.text_align ? { textAlign: previewCustomStyle.text_align as any } : {}),
      ...(previewCustomStyle.font_size ? { fontSize: previewCustomStyle.font_size } : {}),
      ...(previewCustomStyle.font_weight ? { fontWeight: previewCustomStyle.font_weight } : {}),
    };
    return (
      <div
        key={el.id}
        className={`transition-all ${onElementClick ? 'cursor-pointer' : ''} ${isHighlighted ? 'ring-2 ring-emerald-400 rounded-xl' : ''}`}
        style={previewStyle}
        onClick={() => onElementClick?.(el.id)}
      >
        {content}
      </div>
    );
  };

  // ── Separate popup-mode AI elements from normal elements ──
  const normalElements = activeTab?.elements.filter(e => {
    if (e.type === 'ai_assistant' && (e.config.ai_display_mode || 'popup') === 'popup') return false;
    return true;
  }) || [];

  const popupAiElement = activeTab?.elements.find(
    e => e.type === 'ai_assistant' && (e.config.ai_display_mode || 'popup') === 'popup' && e.config.visible !== false
  );

  // ── Elements list (with or without DnD) ──
  const renderElements = () => {
    // For the element list, use ALL elements in editable mode (so user can see/drag the ai_assistant),
    // but in preview mode, exclude popup-mode ai_assistant (rendered as floating)
    const elementsToRender = editable ? (activeTab?.elements || []) : normalElements;

    if (!activeTab || elementsToRender.length === 0) {
      return (
        <div className="py-16 text-center">
          <p className="text-[12px] text-stone-400">No elements on this tab</p>
          <p className="text-[11px] text-stone-300 mt-1">Add elements in the editor</p>
        </div>
      );
    }

    const hasWidths = elementsToRender.some(e => e.config.width && e.config.width !== '100%');
    const containerClass = hasWidths ? 'flex flex-wrap gap-3 py-4' : 'space-y-3 py-4';

    if (editable) {
      return (
        <Droppable droppableId={`phone-elements-${activeTab.id}`} type="ELEMENT">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`${containerClass} min-h-[100px] transition-colors ${snapshot.isDraggingOver ? 'bg-emerald-50/30 rounded-xl' : ''}`}
            >
              {activeTab.elements.map((el, idx) => {
                const w = el.config.width || '100%';
                const wrapped = renderElementWrapper(el, idx);
                if (!wrapped) return null;
                return (
                  <div key={el.id} style={{ width: w === '100%' ? '100%' : `calc(${w} - 8px)` }}>
                    {wrapped}
                  </div>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      );
    }

    return (
      <div className={containerClass}>
        {elementsToRender.map((el, idx) => {
          const w = el.config.width || '100%';
          const wrapped = renderElementWrapper(el, idx);
          if (!wrapped) return null;
          return (
            <div key={el.id} style={{ width: w === '100%' ? '100%' : `calc(${w} - 8px)` }}>
              {wrapped}
            </div>
          );
        })}
      </div>
    );
  };

  // ── The phone frame ──
  // Match ParticipantAppView: top horizontal tabs, no bottom nav
  const tabBarHeight = layout.bottom_nav.length > 1 ? 36 : 0;
  const headerHeight = layout.show_header ? 44 : 0;
  const notchHeight = 28;

  const phoneContent = (
    <div className="rounded-[2rem] overflow-hidden flex flex-col relative" style={{ backgroundColor: bgColor, height: `${frameHeight}px` }}>
      {/* Notch */}
      <div className="flex-shrink-0 flex items-center justify-center relative" style={{ height: `${notchHeight}px` }}>
        <div className="w-20 h-4 bg-stone-900 rounded-b-2xl absolute top-0" />
      </div>
      {/* Header */}
      {layout.show_header && (
        <div className="flex-shrink-0 px-5 py-2.5" style={{ backgroundColor: primaryColor }}>
          <h1 className="text-[15px] font-bold text-white">
            {layout.header_title || projectTitle || activeTab?.label || 'Home'}
          </h1>
          {layout.header_description && (
            <p className="text-[11px] text-white/70 mt-0.5 line-clamp-1">{layout.header_description}</p>
          )}
        </div>
      )}
      {/* Top horizontal tab bar — matches ParticipantAppView */}
      {layout.bottom_nav.length > 1 && (
        <div className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-b border-stone-100">
          <div className="flex gap-0.5 px-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {layout.bottom_nav.map(nav => {
              const IconComp = nav.icon ? (ICON_MAP[nav.icon] || (allIcons as any)[nav.icon] || Home) : null;
              const isActive = currentTabId === nav.tab_id;
              return (
                <button key={nav.tab_id} type="button"
                  onClick={() => { setCurrentTabId(nav.tab_id); setActiveQuestionnaireId(null); setCurrentQuestionIndex(0); }}
                  className="flex items-center gap-1 px-2.5 py-2 text-[11px] font-medium transition-all shrink-0 border-b-2"
                  style={{
                    borderColor: isActive ? primaryColor : 'transparent',
                    color: isActive ? primaryColor : '#a8a29e',
                  }}>
                  {IconComp && <IconComp size={13} />}
                  {nav.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {/* Content */}
      <div className="flex-1 px-4 overflow-y-auto" style={{ minHeight: 0 }}>
        {activeQuestionnaireId ? (
          <div className="py-4">
            {renderQuestionnaireCard(activeQuestionnaireId, questionnaires?.find(q => q.id === activeQuestionnaireId)?.title || '')}
          </div>
        ) : (
          renderElements()
        )}
      </div>

      {/* Floating AI Assistant button (popup mode) — shown in both editable and preview modes */}
      {popupAiElement && !activeQuestionnaireId && (() => {
        const pos = popupAiElement.config.ai_position || 'bottom-right';
        const iconName = popupAiElement.config.icon || 'MessageCircle';
        const FloatIcon = (allIcons as any)[iconName] || MessageCircle;
        const title = popupAiElement.config.title || popupAiElement.config.button_label || 'AI';
        const posClass = pos === 'bottom-left' ? 'left-4' : pos === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-4';
        return (
          <button
            type="button"
            onClick={() => onOpenAiAssistant?.()}
            className={`absolute bottom-4 ${posClass} z-20 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 transition-colors text-[11px] font-medium`}
          >
            <FloatIcon size={14} />
            {title}
          </button>
        );
      })()}
    </div>
  );

  if (scale !== 1) {
    return (
      <div style={{ width: `${frameWidth * scale}px`, height: `${frameHeight * scale}px`, overflow: 'hidden' }}>
        <div style={{ width: `${frameWidth}px`, height: `${frameHeight}px`, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <div className="bg-stone-900 rounded-[2.5rem] p-2.5 shadow-2xl" style={{ width: `${frameWidth}px` }}>
            {phoneContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-900 rounded-[2.5rem] p-2.5 shadow-2xl" style={{ maxWidth: `${frameWidth}px`, margin: '0 auto' }}>
      {phoneContent}
    </div>
  );
};

export default React.memo(AppPhonePreview);
