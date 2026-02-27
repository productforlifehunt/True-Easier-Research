import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Home, FileText, Settings, HelpCircle, BarChart3, Layout, Eye, EyeOff, Smartphone, X, ChevronDown, ChevronUp } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import type { QuestionnaireConfig } from './QuestionnaireList';
import type { ParticipantType } from './ParticipantTypeManager';

export interface LayoutTab {
  id: string;
  label: string;
  icon: string;
  elements: LayoutElement[];
  order_index: number;
}

export interface LayoutElement {
  id: string;
  type: 'questionnaire' | 'consent' | 'screening' | 'profile' | 'ecogram' | 'text_block' | 'progress' | 'timeline' | 'help' | 'spacer' | 'divider' | 'image' | 'button';
  config: {
    questionnaire_id?: string;
    title?: string;
    content?: string;
    visible?: boolean;
    participant_types?: string[];
    style?: {
      padding?: string;
      background?: string;
      border_radius?: string;
      height?: string;
    };
    button_action?: string;
    image_url?: string;
  };
  order_index: number;
}

export interface AppLayout {
  tabs: LayoutTab[];
  bottom_nav: { icon: string; label: string; tab_id: string }[];
  show_header: boolean;
  header_title: string;
  theme: {
    primary_color: string;
    background_color: string;
    card_style: 'flat' | 'elevated' | 'outlined';
  };
}

interface LayoutBuilderProps {
  layout: AppLayout;
  questionnaires: QuestionnaireConfig[];
  participantTypes: ParticipantType[];
  studyDuration?: number;
  onUpdate: (layout: AppLayout) => void;
}

const ICON_OPTIONS = [
  { value: 'Home', label: '🏠 Home', icon: Home },
  { value: 'FileText', label: '📄 Survey', icon: FileText },
  { value: 'BarChart3', label: '📊 Progress', icon: BarChart3 },
  { value: 'HelpCircle', label: '❓ Help', icon: HelpCircle },
  { value: 'Settings', label: '⚙️ Settings', icon: Settings },
  { value: 'Layout', label: '📐 Layout', icon: Layout },
];

const ELEMENT_TYPES = [
  { type: 'questionnaire', label: '📋 Questionnaire', desc: 'A survey/questionnaire form', category: 'content' },
  { type: 'consent', label: '🛡️ Consent Form', desc: 'Display consent agreement', category: 'content' },
  { type: 'screening', label: '📝 Screening', desc: 'Eligibility screening questions', category: 'content' },
  { type: 'profile', label: '👤 Profile', desc: 'Participant profile collection', category: 'content' },
  { type: 'ecogram', label: '🔗 Ecogram', desc: 'Care network diagram', category: 'content' },
  { type: 'progress', label: '📊 Progress', desc: 'Study progress overview', category: 'content' },
  { type: 'timeline', label: '📅 Timeline', desc: 'Study timeline view', category: 'content' },
  { type: 'help', label: '❓ Help', desc: 'Help and FAQ section', category: 'content' },
  { type: 'text_block', label: '📄 Text Block', desc: 'Custom text or instructions', category: 'layout' },
  { type: 'spacer', label: '↕️ Spacer', desc: 'Add vertical space', category: 'layout' },
  { type: 'divider', label: '➖ Divider', desc: 'Horizontal divider line', category: 'layout' },
  { type: 'button', label: '🔘 Button', desc: 'Action button', category: 'layout' },
  { type: 'image', label: '🖼️ Image', desc: 'Image block', category: 'layout' },
];

const getDefaultLayout = (questionnaires: QuestionnaireConfig[]): AppLayout => {
  const tabElements: LayoutElement[] = questionnaires.map((q, i) => ({
    id: crypto.randomUUID(),
    type: 'questionnaire' as const,
    config: { questionnaire_id: q.id, title: q.title, visible: true },
    order_index: i,
  }));

  return {
    tabs: [
      {
        id: 'tab-home',
        label: 'Home',
        icon: 'Home',
        elements: [
          { id: crypto.randomUUID(), type: 'progress', config: { title: 'Your Progress', visible: true }, order_index: 0 },
          ...tabElements,
        ],
        order_index: 0,
      },
      {
        id: 'tab-timeline',
        label: 'Timeline',
        icon: 'FileText',
        elements: [
          { id: crypto.randomUUID(), type: 'timeline', config: { title: 'Study Timeline', visible: true }, order_index: 0 },
        ],
        order_index: 1,
      },
      {
        id: 'tab-settings',
        label: 'Settings',
        icon: 'Settings',
        elements: [
          { id: crypto.randomUUID(), type: 'profile', config: { title: 'Profile', visible: true }, order_index: 0 },
          { id: crypto.randomUUID(), type: 'help', config: { title: 'Help & FAQ', visible: true }, order_index: 1 },
        ],
        order_index: 2,
      },
    ],
    bottom_nav: [
      { icon: 'Home', label: 'Home', tab_id: 'tab-home' },
      { icon: 'FileText', label: 'Survey', tab_id: 'tab-timeline' },
      { icon: 'Settings', label: 'Settings', tab_id: 'tab-settings' },
    ],
    show_header: true,
    header_title: '',
    theme: {
      primary_color: '#10b981',
      background_color: '#f5f5f4',
      card_style: 'elevated',
    },
  };
};

const ICON_MAP: Record<string, React.FC<any>> = {
  Home, FileText, BarChart3, HelpCircle, Settings, Layout,
};

const LayoutBuilder: React.FC<LayoutBuilderProps> = ({ layout, questionnaires, participantTypes, studyDuration = 7, onUpdate }) => {
  const [activeTabId, setActiveTabId] = useState(layout.tabs[0]?.id || '');
  const [showAddElement, setShowAddElement] = useState(false);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);

  const activeTab = layout.tabs.find(t => t.id === activeTabId);

  const addTab = () => {
    const newTab: LayoutTab = {
      id: crypto.randomUUID(),
      label: `Tab ${layout.tabs.length + 1}`,
      icon: 'FileText',
      elements: [],
      order_index: layout.tabs.length,
    };
    const newLayout = { ...layout, tabs: [...layout.tabs, newTab] };
    newLayout.bottom_nav = [...newLayout.bottom_nav, { icon: 'FileText', label: newTab.label, tab_id: newTab.id }];
    onUpdate(newLayout);
    setActiveTabId(newTab.id);
  };

  const removeTab = (tabId: string) => {
    if (layout.tabs.length <= 1) return;
    const newTabs = layout.tabs.filter(t => t.id !== tabId);
    const newNav = layout.bottom_nav.filter(n => n.tab_id !== tabId);
    onUpdate({ ...layout, tabs: newTabs, bottom_nav: newNav });
    if (activeTabId === tabId) setActiveTabId(newTabs[0]?.id || '');
  };

  const updateTab = (tabId: string, updates: Partial<LayoutTab>) => {
    const newTabs = layout.tabs.map(t => t.id === tabId ? { ...t, ...updates } : t);
    const newNav = layout.bottom_nav.map(n => {
      if (n.tab_id === tabId && updates.label) return { ...n, label: updates.label };
      if (n.tab_id === tabId && updates.icon) return { ...n, icon: updates.icon };
      return n;
    });
    onUpdate({ ...layout, tabs: newTabs, bottom_nav: newNav });
  };

  const addElement = (type: string) => {
    if (!activeTab) return;
    const newElement: LayoutElement = {
      id: crypto.randomUUID(),
      type: type as LayoutElement['type'],
      config: {
        visible: true,
        title: ELEMENT_TYPES.find(e => e.type === type)?.label.split(' ').slice(1).join(' ') || type,
      },
      order_index: activeTab.elements.length,
    };
    updateTab(activeTab.id, { elements: [...activeTab.elements, newElement] });
    setShowAddElement(false);
    setEditingElementId(newElement.id);
  };

  const removeElement = (elementId: string) => {
    if (!activeTab) return;
    updateTab(activeTab.id, { elements: activeTab.elements.filter(e => e.id !== elementId) });
    if (editingElementId === elementId) setEditingElementId(null);
  };

  const updateElement = (elementId: string, config: Partial<LayoutElement['config']>) => {
    if (!activeTab) return;
    updateTab(activeTab.id, {
      elements: activeTab.elements.map(e =>
        e.id === elementId ? { ...e, config: { ...e.config, ...config } } : e
      ),
    });
  };

  // DnD handler for elements within and across tabs
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Tab reordering
    if (result.type === 'TAB') {
      const newTabs = Array.from(layout.tabs);
      const [moved] = newTabs.splice(source.index, 1);
      newTabs.splice(destination.index, 0, moved);
      newTabs.forEach((t, i) => t.order_index = i);
      const newNav = newTabs.map(t => layout.bottom_nav.find(n => n.tab_id === t.id) || { icon: t.icon, label: t.label, tab_id: t.id });
      onUpdate({ ...layout, tabs: newTabs, bottom_nav: newNav });
      return;
    }

    // Element reordering — supports cross-tab dragging
    if (result.type === 'ELEMENT') {
      const sourceTabId = source.droppableId.replace('elements-', '');
      const destTabId = destination.droppableId.replace('elements-', '');

      if (sourceTabId === destTabId) {
        // Same tab reorder
        const tab = layout.tabs.find(t => t.id === sourceTabId);
        if (!tab) return;
        const newElements = Array.from(tab.elements);
        const [moved] = newElements.splice(source.index, 1);
        newElements.splice(destination.index, 0, moved);
        newElements.forEach((e, i) => e.order_index = i);
        updateTab(sourceTabId, { elements: newElements });
      } else {
        // Cross-tab move
        const srcTab = layout.tabs.find(t => t.id === sourceTabId);
        const dstTab = layout.tabs.find(t => t.id === destTabId);
        if (!srcTab || !dstTab) return;
        const srcElements = Array.from(srcTab.elements);
        const dstElements = Array.from(dstTab.elements);
        const [moved] = srcElements.splice(source.index, 1);
        dstElements.splice(destination.index, 0, moved);
        srcElements.forEach((e, i) => e.order_index = i);
        dstElements.forEach((e, i) => e.order_index = i);
        const newTabs = layout.tabs.map(t => {
          if (t.id === sourceTabId) return { ...t, elements: srcElements };
          if (t.id === destTabId) return { ...t, elements: dstElements };
          return t;
        });
        onUpdate({ ...layout, tabs: newTabs });
      }
    }
  };

  const editingElement = activeTab?.elements.find(e => e.id === editingElementId);

  const getElementIcon = (type: string) => {
    return ELEMENT_TYPES.find(e => e.type === type)?.label.split(' ')[0] || '📦';
  };

  const getElementLabel = (el: LayoutElement) => {
    if (el.type === 'questionnaire' && el.config.questionnaire_id) {
      return questionnaires.find(q => q.id === el.config.questionnaire_id)?.title || 'Questionnaire';
    }
    return el.config.title || el.type.replace('_', ' ');
  };

  // Phone preview renderer
  const renderPhoneElement = (el: LayoutElement) => {
    if (el.config.visible === false) return null;
    switch (el.type) {
      case 'progress':
        return (
          <div className="p-2.5 rounded-xl" style={{ backgroundColor: layout.theme?.primary_color + '15' || '#10b98115' }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-semibold" style={{ color: layout.theme?.primary_color || '#10b981' }}>Study Progress</span>
              <span className="text-[8px] text-stone-400">Day 3/7</span>
            </div>
            <div className="h-1.5 bg-white/50 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: '43%', backgroundColor: layout.theme?.primary_color || '#10b981' }} />
            </div>
          </div>
        );
      case 'questionnaire':
        const q = questionnaires.find(qc => qc.id === el.config.questionnaire_id);
        return (
          <div className="p-2.5 rounded-xl bg-white border border-stone-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-stone-700">{q?.title || 'Questionnaire'}</span>
                <p className="text-[8px] text-stone-400 mt-0.5">{q?.questions?.length || 0} questions · {q?.estimated_duration || 5} min</p>
              </div>
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: layout.theme?.primary_color || '#10b981' }}>
                <span className="text-white text-[8px]">▶</span>
              </div>
            </div>
          </div>
        );
      case 'consent':
        return (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
            <span className="text-[9px] font-semibold text-amber-700">🛡️ {el.config.title || 'Consent Form'}</span>
            <p className="text-[7px] text-amber-500 mt-0.5">Tap to review and sign</p>
          </div>
        );
      case 'profile':
        return (
          <div className="p-2.5 rounded-xl bg-white border border-stone-100">
            <span className="text-[9px] font-semibold text-stone-600">👤 {el.config.title || 'Profile'}</span>
          </div>
        );
      case 'ecogram':
        return (
          <div className="p-2.5 rounded-xl bg-violet-50 border border-violet-100">
            <span className="text-[9px] font-semibold text-violet-700">🔗 Ecogram</span>
            <div className="flex justify-center mt-1.5">
              <div className="w-5 h-5 rounded-full bg-violet-200 border-2 border-violet-300" />
            </div>
          </div>
        );
      case 'timeline': {
        const days = Math.min(studyDuration, 7);
        const sampleHours = [8, 10, 12, 14, 16, 18, 20];
        const previewActiveDay = 2;
        return (
          <div className="p-2.5 rounded-xl bg-white border border-stone-100 space-y-2">
            <span className="text-[9px] font-semibold text-stone-600">📅 Study Timeline</span>
            {/* Day tabs */}
            <div className="flex gap-0.5 overflow-hidden">
              {Array.from({ length: days }, (_, i) => i + 1).map(d => (
                <div
                  key={d}
                  className="flex-1 text-center py-0.5 rounded text-[7px] font-medium"
                  style={{
                    backgroundColor: d === previewActiveDay ? (layout.theme?.primary_color || '#10b981') : 'transparent',
                    color: d === previewActiveDay ? 'white' : '#a8a29e',
                    minWidth: 0,
                  }}
                >
                  D{d}
                </div>
              ))}
            </div>
            {/* Hourly slots */}
            <div className="space-y-0.5">
              {sampleHours.map(h => {
                const hasQ = h === 10 || h === 14 || h === 20;
                const isCompleted = h === 10;
                const isMissed = h === 20;
                return (
                  <div key={h} className="flex items-center gap-1">
                    <span className="text-[6px] text-stone-300 w-4 text-right">{h}:00</span>
                    <div className="flex-1 h-3 rounded" style={{ backgroundColor: hasQ
                      ? isCompleted ? '#dcfce7' : isMissed ? '#fee2e2' : '#f0fdf4'
                      : 'transparent'
                    }}>
                      {hasQ && (
                        <div className="flex items-center h-full px-1">
                          <span className="text-[5px] font-semibold truncate" style={{
                            color: isCompleted ? '#16a34a' : isMissed ? '#dc2626' : '#a8a29e'
                          }}>
                            {questionnaires[0]?.title?.substring(0, 12) || 'Survey'} {isCompleted ? '✓' : isMissed ? '✗' : '○'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                <span className="flex items-center gap-0.5 text-[5px] text-stone-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block" /> Completed</span>
                <span className="flex items-center gap-0.5 text-[5px] text-stone-400"><span className="w-1.5 h-1.5 rounded-full bg-stone-200 inline-block" /> Scheduled</span>
                <span className="flex items-center gap-0.5 text-[5px] text-stone-400"><span className="w-1.5 h-1.5 rounded-full bg-red-200 inline-block" /> Missed</span>
              </div>
            </div>
          </div>
        );
      }
      case 'text_block':
        return (
          <div className="p-2 rounded-xl bg-stone-50">
            <p className="text-[8px] text-stone-500">{el.config.content || el.config.title || 'Text content...'}</p>
          </div>
        );
      case 'spacer':
        return <div style={{ height: el.config.style?.height || '16px' }} />;
      case 'divider':
        return <div className="border-t border-stone-200 my-1" />;
      case 'help':
        return (
          <div className="p-2.5 rounded-xl bg-white border border-stone-100">
            <span className="text-[9px] font-semibold text-stone-600">❓ Help & FAQ</span>
          </div>
        );
      case 'button':
        return (
          <button className="w-full py-2 rounded-xl text-[9px] font-semibold text-white" style={{ backgroundColor: layout.theme?.primary_color || '#10b981' }}>
            {el.config.title || 'Button'}
          </button>
        );
      case 'screening':
        return (
          <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-100">
            <span className="text-[9px] font-semibold text-orange-700">📝 Screening</span>
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-xl bg-stone-50 border border-stone-100">
            <span className="text-[8px] text-stone-400">{el.type}</span>
          </div>
        );
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-stone-800">Layout Builder</h3>
            <p className="text-[12px] text-stone-400 font-light mt-0.5">
              Drag and drop to design how participants see your study
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdate(getDefaultLayout(questionnaires))}
              className="text-[12px] text-stone-400 hover:text-stone-600 transition-colors px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-300"
            >
              Reset Default
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Tab & Element Editor */}
          <div className="flex-1 space-y-3">
            {/* Draggable Tab Bar */}
            <Droppable droppableId="tabs" direction="horizontal" type="TAB">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex items-center gap-1 bg-stone-100 rounded-xl p-1 overflow-x-auto"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {layout.tabs.map((tab, index) => (
                    <Draggable key={tab.id} draggableId={`tab-${tab.id}`} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => setActiveTabId(tab.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all cursor-grab active:cursor-grabbing ${
                            activeTabId === tab.id ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'
                          } ${snapshot.isDragging ? 'shadow-lg ring-2 ring-emerald-200' : ''}`}
                        >
                          <GripVertical size={10} className="text-stone-300" />
                          {tab.label}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  <button onClick={addTab} className="p-1.5 rounded-lg hover:bg-white/80 transition-colors shrink-0">
                    <Plus size={14} className="text-stone-400" />
                  </button>
                </div>
              )}
            </Droppable>

            {/* Active Tab Config */}
            {activeTab && (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-400 mb-1">Tab Label</label>
                      <input
                        type="text"
                        value={activeTab.label}
                        onChange={(e) => updateTab(activeTab.id, { label: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-400 mb-1">Icon</label>
                      <select
                        value={activeTab.icon}
                        onChange={(e) => updateTab(activeTab.id, { icon: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 bg-white"
                      >
                        {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>
                  {layout.tabs.length > 1 && (
                    <button onClick={() => removeTab(activeTab.id)} className="p-1.5 rounded-lg hover:bg-red-50 mt-4">
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  )}
                </div>

                {/* Add Element Button */}
                <div className="flex items-center justify-between">
                  <h5 className="text-[12px] font-semibold text-stone-600 uppercase tracking-wider">Elements</h5>
                  <button
                    onClick={() => setShowAddElement(!showAddElement)}
                    className="flex items-center gap-1 text-[11px] text-emerald-500 hover:text-emerald-600 font-medium"
                  >
                    <Plus size={12} /> Add Element
                  </button>
                </div>

                {showAddElement && (
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Content</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {ELEMENT_TYPES.filter(e => e.category === 'content').map(et => (
                        <button
                          key={et.type}
                          onClick={() => addElement(et.type)}
                          className="flex items-center gap-2 p-2 rounded-lg text-left hover:bg-white transition-colors text-[11px] border border-transparent hover:border-stone-200"
                        >
                          <span>{et.label.split(' ')[0]}</span>
                          <div>
                            <span className="text-stone-600 font-medium">{et.label.split(' ').slice(1).join(' ')}</span>
                            <p className="text-[9px] text-stone-400">{et.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mt-2">Layout</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {ELEMENT_TYPES.filter(e => e.category === 'layout').map(et => (
                        <button
                          key={et.type}
                          onClick={() => addElement(et.type)}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white transition-colors text-[10px] border border-transparent hover:border-stone-200"
                        >
                          <span className="text-lg">{et.label.split(' ')[0]}</span>
                          <span className="text-stone-500 font-medium">{et.label.split(' ').slice(1).join(' ')}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Draggable Elements — drop zone for current tab (also accepts cross-tab drops) */}
                <Droppable droppableId={`elements-${activeTab.id}`} type="ELEMENT">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-1 min-h-[60px] rounded-xl transition-colors ${
                        snapshot.isDraggingOver ? 'bg-emerald-50/50' : ''
                      }`}
                    >
                      {activeTab.elements.length === 0 ? (
                        <div className="py-8 text-center text-[12px] text-stone-400 border-2 border-dashed border-stone-200 rounded-xl">
                          Drag elements here or click "Add Element" above
                        </div>
                      ) : (
                        activeTab.elements.map((el, elIdx) => (
                          <Draggable key={el.id} draggableId={`el-${el.id}`} index={elIdx}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border bg-white group transition-all ${
                                  snapshot.isDragging ? 'shadow-lg border-emerald-300 ring-2 ring-emerald-100' : 'border-stone-100 hover:border-stone-200'
                                } ${editingElementId === el.id ? 'border-emerald-300 bg-emerald-50/30' : ''}`}
                                onClick={() => setEditingElementId(editingElementId === el.id ? null : el.id)}
                              >
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-stone-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <GripVertical size={14} className="text-stone-300" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">{getElementIcon(el.type)}</span>
                                    <span className="text-[12px] font-medium text-stone-700 truncate">
                                      {getElementLabel(el)}
                                    </span>
                                    <span className="text-[9px] uppercase font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                                      {el.type.replace('_', ' ')}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); updateElement(el.id, { visible: !(el.config.visible !== false) }); }}
                                    className="p-1 hover:bg-stone-100 rounded"
                                  >
                                    {el.config.visible !== false ? <Eye size={12} className="text-emerald-500" /> : <EyeOff size={12} className="text-stone-300" />}
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); removeElement(el.id); }}
                                    className="p-1 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 size={12} className="text-red-400" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* Element Config Panel */}
                {editingElement && (
                  <div className="bg-stone-50 rounded-xl border border-stone-200 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[12px] font-semibold text-stone-600">
                        {getElementIcon(editingElement.type)} Configure {editingElement.type.replace('_', ' ')}
                      </h5>
                      <button onClick={() => setEditingElementId(null)} className="p-1 hover:bg-stone-200 rounded">
                        <X size={12} className="text-stone-400" />
                      </button>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-[11px] font-medium text-stone-400 mb-1">Title</label>
                      <input
                        type="text"
                        value={editingElement.config.title || ''}
                        onChange={(e) => updateElement(editingElement.id, { title: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    {/* Questionnaire selector */}
                    {editingElement.type === 'questionnaire' && (
                      <div>
                        <label className="block text-[11px] font-medium text-stone-400 mb-1">Linked Questionnaire</label>
                        <select
                          value={editingElement.config.questionnaire_id || ''}
                          onChange={(e) => {
                            const q = questionnaires.find(q => q.id === e.target.value);
                            updateElement(editingElement.id, {
                              questionnaire_id: e.target.value,
                              title: q?.title || 'Questionnaire',
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 bg-white"
                        >
                          <option value="">Select questionnaire...</option>
                          {questionnaires.map(q => (
                            <option key={q.id} value={q.id}>{q.title}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Text block content */}
                    {editingElement.type === 'text_block' && (
                      <div>
                        <label className="block text-[11px] font-medium text-stone-400 mb-1">Content</label>
                        <textarea
                          value={editingElement.config.content || ''}
                          onChange={(e) => updateElement(editingElement.id, { content: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          rows={3}
                        />
                      </div>
                    )}

                    {/* Spacer height */}
                    {editingElement.type === 'spacer' && (
                      <div>
                        <label className="block text-[11px] font-medium text-stone-400 mb-1">Height (px)</label>
                        <input
                          type="number"
                          value={parseInt(editingElement.config.style?.height || '16')}
                          onChange={(e) => updateElement(editingElement.id, {
                            style: { ...editingElement.config.style, height: `${e.target.value}px` },
                          })}
                          className="w-24 px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200"
                        />
                      </div>
                    )}

                    {/* Button action */}
                    {editingElement.type === 'button' && (
                      <div>
                        <label className="block text-[11px] font-medium text-stone-400 mb-1">Button Action</label>
                        <select
                          value={editingElement.config.button_action || ''}
                          onChange={(e) => updateElement(editingElement.id, { button_action: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 bg-white"
                        >
                          <option value="">None</option>
                          <option value="start_survey">Start Survey</option>
                          <option value="view_progress">View Progress</option>
                          <option value="contact_help">Contact Help</option>
                        </select>
                      </div>
                    )}

                    {/* Participant type visibility */}
                    {participantTypes.length > 0 && (
                      <div>
                        <label className="block text-[11px] font-medium text-stone-400 mb-1">Visible to</label>
                        <div className="flex flex-wrap gap-1">
                          {participantTypes.map(pt => {
                            const visible = !editingElement.config.participant_types || editingElement.config.participant_types.includes(pt.id);
                            return (
                              <button
                                key={pt.id}
                                onClick={() => {
                                  const current = editingElement.config.participant_types || participantTypes.map(p => p.id);
                                  const next = visible ? current.filter(id => id !== pt.id) : [...current, pt.id];
                                  updateElement(editingElement.id, { participant_types: next });
                                }}
                                className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
                                  visible ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-200 text-stone-400'
                                }`}
                              >
                                {pt.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Theme Settings */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
              <h5 className="text-[12px] font-semibold text-stone-600 uppercase tracking-wider">Theme</h5>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-stone-400 mb-1">Primary Color</label>
                  <input
                    type="color"
                    value={layout.theme?.primary_color || '#10b981'}
                    onChange={(e) => onUpdate({ ...layout, theme: { ...layout.theme, primary_color: e.target.value } })}
                    className="w-full h-8 rounded-lg border border-stone-200 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-400 mb-1">Background</label>
                  <input
                    type="color"
                    value={layout.theme?.background_color || '#f5f5f4'}
                    onChange={(e) => onUpdate({ ...layout, theme: { ...layout.theme, background_color: e.target.value } })}
                    className="w-full h-8 rounded-lg border border-stone-200 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-400 mb-1">Card Style</label>
                  <select
                    value={layout.theme?.card_style || 'elevated'}
                    onChange={(e) => onUpdate({ ...layout, theme: { ...layout.theme, card_style: e.target.value as any } })}
                    className="w-full px-2 py-1.5 rounded-lg text-[12px] border border-stone-200 bg-white"
                  >
                    <option value="flat">Flat</option>
                    <option value="elevated">Elevated</option>
                    <option value="outlined">Outlined</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Phone Preview */}
          <div className="lg:w-[300px] shrink-0">
            <div className="sticky top-24">
              <div className="bg-stone-900 rounded-[2.5rem] p-2.5 shadow-2xl">
                <div className="rounded-[2rem] overflow-hidden" style={{ backgroundColor: layout.theme?.background_color || '#f5f5f4', height: '560px' }}>
                  {/* Notch */}
                  <div className="h-7 flex items-center justify-center relative">
                    <div className="w-20 h-4 bg-stone-900 rounded-b-2xl absolute top-0" />
                  </div>
                  {/* Header */}
                  {layout.show_header && (
                    <div className="px-4 py-2">
                      <h4 className="text-[12px] font-bold text-stone-800">
                        {layout.header_title || activeTab?.label || 'Home'}
                      </h4>
                    </div>
                  )}
                  {/* Content */}
                  <div className="px-3 overflow-y-auto" style={{ height: layout.show_header ? '440px' : '470px' }}>
                    <div className="space-y-2 pb-4">
                      {activeTab?.elements.filter(e => e.config.visible !== false).map(el => (
                        <div
                          key={el.id}
                          className={`transition-all cursor-pointer ${editingElementId === el.id ? 'ring-2 ring-emerald-400 rounded-xl' : ''}`}
                          onClick={() => setEditingElementId(el.id)}
                        >
                          {renderPhoneElement(el)}
                        </div>
                      ))}
                      {(!activeTab || activeTab.elements.filter(e => e.config.visible !== false).length === 0) && (
                        <div className="py-12 text-center">
                          <p className="text-[10px] text-stone-400">No elements</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Bottom Nav */}
                  <div className="h-16 border-t border-stone-200/50 flex items-center justify-around px-3" style={{ backgroundColor: 'white' }}>
                    {layout.bottom_nav.map(nav => {
                      const IconComp = ICON_MAP[nav.icon] || Home;
                      const isActive = activeTabId === nav.tab_id;
                      return (
                        <button
                          key={nav.tab_id}
                          onClick={() => setActiveTabId(nav.tab_id)}
                          className="flex flex-col items-center gap-0.5"
                        >
                          <IconComp size={16} style={{ color: isActive ? (layout.theme?.primary_color || '#10b981') : '#a8a29e' }} />
                          <span className="text-[8px] font-medium" style={{ color: isActive ? (layout.theme?.primary_color || '#10b981') : '#a8a29e' }}>
                            {nav.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-stone-400 text-center mt-3 font-light">Live Preview — Click elements to edit</p>
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};

export { getDefaultLayout };
export default LayoutBuilder;
