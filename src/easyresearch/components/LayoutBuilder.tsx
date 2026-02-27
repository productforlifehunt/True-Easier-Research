import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Home, FileText, Settings, HelpCircle, BarChart3, Layout, Eye, EyeOff, X, Edit3 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import type { QuestionnaireConfig } from './QuestionnaireList';
import type { ParticipantType } from './ParticipantTypeManager';
import AppPhonePreview from './AppPhonePreview';

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
    button_label?: string;
    image_url?: string;
    show_question_count?: boolean;
    show_estimated_time?: boolean;
    consent_text?: string;
    screening_criteria?: string;
    help_sections?: { title: string; content: string }[];
    progress_style?: 'bar' | 'ring' | 'steps';
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
  { value: 'Home', label: '🏠 Home' },
  { value: 'FileText', label: '📄 Survey' },
  { value: 'BarChart3', label: '📊 Progress' },
  { value: 'HelpCircle', label: '❓ Help' },
  { value: 'Settings', label: '⚙️ Settings' },
  { value: 'Layout', label: '📐 Layout' },
];

const STATIC_CONTENT_ELEMENTS = [
  { type: 'consent', label: 'Consent Form', icon: '🛡️', desc: 'Display consent agreement' },
  { type: 'screening', label: 'Screening', icon: '📝', desc: 'Eligibility screening questions' },
  { type: 'profile', label: 'Profile', icon: '👤', desc: 'Participant profile collection' },
  { type: 'ecogram', label: 'Ecogram', icon: '🔗', desc: 'Care network diagram' },
  { type: 'progress', label: 'Progress', icon: '📊', desc: 'Study progress overview' },
  { type: 'timeline', label: 'Timeline', icon: '📅', desc: 'Study timeline view' },
  { type: 'help', label: 'Help', icon: '❓', desc: 'Help and FAQ section' },
];

const LAYOUT_ELEMENTS = [
  { type: 'text_block', label: 'Text Block', icon: '📄', desc: 'Custom text or instructions' },
  { type: 'spacer', label: 'Spacer', icon: '↕️', desc: 'Add vertical space' },
  { type: 'divider', label: 'Divider', icon: '➖', desc: 'Horizontal divider line' },
  { type: 'button', label: 'Button', icon: '🔘', desc: 'Action button' },
  { type: 'image', label: 'Image', icon: '🖼️', desc: 'Image block' },
];

const getDefaultLayout = (questionnaires: QuestionnaireConfig[]): AppLayout => {
  const tabElements: LayoutElement[] = questionnaires.map((q, i) => ({
    id: crypto.randomUUID(),
    type: 'questionnaire' as const,
    config: { questionnaire_id: q.id, title: q.title, visible: true, show_question_count: true, show_estimated_time: true },
    order_index: i,
  }));

  return {
    tabs: [
      {
        id: 'tab-home', label: 'Home', icon: 'Home',
        elements: [
          { id: crypto.randomUUID(), type: 'progress', config: { title: 'Your Progress', visible: true, progress_style: 'bar' }, order_index: 0 },
          ...tabElements,
        ],
        order_index: 0,
      },
      {
        id: 'tab-timeline', label: 'Timeline', icon: 'FileText',
        elements: [
          { id: crypto.randomUUID(), type: 'timeline', config: { title: 'Study Timeline', visible: true }, order_index: 0 },
        ],
        order_index: 1,
      },
      {
        id: 'tab-settings', label: 'Settings', icon: 'Settings',
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
    theme: { primary_color: '#10b981', background_color: '#f5f5f4', card_style: 'elevated' },
  };
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

  const addElement = (type: string, config?: Partial<LayoutElement['config']>) => {
    if (!activeTab) return;
    const newElement: LayoutElement = {
      id: crypto.randomUUID(),
      type: type as LayoutElement['type'],
      config: { visible: true, title: config?.title || type.replace('_', ' '), ...config },
      order_index: activeTab.elements.length,
    };
    updateTab(activeTab.id, { elements: [...activeTab.elements, newElement] });
    setShowAddElement(false);
    setEditingElementId(newElement.id);
  };

  const addQuestionnaire = (q: QuestionnaireConfig) => {
    addElement('questionnaire', { questionnaire_id: q.id, title: q.title, show_question_count: true, show_estimated_time: true });
  };

  const removeElement = (elementId: string) => {
    if (!activeTab) return;
    updateTab(activeTab.id, { elements: activeTab.elements.filter(e => e.id !== elementId) });
    if (editingElementId === elementId) setEditingElementId(null);
  };

  const updateElement = (elementId: string, config: Partial<LayoutElement['config']>) => {
    if (!activeTab) return;
    updateTab(activeTab.id, {
      elements: activeTab.elements.map(e => e.id === elementId ? { ...e, config: { ...e.config, ...config } } : e),
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (result.type === 'TAB') {
      const newTabs = Array.from(layout.tabs);
      const [moved] = newTabs.splice(source.index, 1);
      newTabs.splice(destination.index, 0, moved);
      newTabs.forEach((t, i) => t.order_index = i);
      const newNav = newTabs.map(t => layout.bottom_nav.find(n => n.tab_id === t.id) || { icon: t.icon, label: t.label, tab_id: t.id });
      onUpdate({ ...layout, tabs: newTabs, bottom_nav: newNav });
      return;
    }

    if (result.type === 'ELEMENT') {
      const sourceTabId = source.droppableId.replace('elements-', '');
      const destTabId = destination.droppableId.replace('elements-', '');
      if (sourceTabId === destTabId) {
        const tab = layout.tabs.find(t => t.id === sourceTabId);
        if (!tab) return;
        const newElements = Array.from(tab.elements);
        const [moved] = newElements.splice(source.index, 1);
        newElements.splice(destination.index, 0, moved);
        newElements.forEach((e, i) => e.order_index = i);
        updateTab(sourceTabId, { elements: newElements });
      } else {
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
    const all = [...STATIC_CONTENT_ELEMENTS, ...LAYOUT_ELEMENTS];
    return all.find(e => e.type === type)?.icon || '📋';
  };

  const getElementLabel = (el: LayoutElement) => {
    if (el.type === 'questionnaire' && el.config.questionnaire_id) {
      return questionnaires.find(q => q.id === el.config.questionnaire_id)?.title || 'Questionnaire';
    }
    return el.config.title || el.type.replace('_', ' ');
  };

  const placedQuestionnaireIds = new Set(
    layout.tabs.flatMap(t => t.elements)
      .filter(e => e.type === 'questionnaire' && e.config.questionnaire_id)
      .map(e => e.config.questionnaire_id!)
  );

  // ── Element Config Panel ──
  const renderElementConfig = (el: LayoutElement) => {
    const q = el.type === 'questionnaire' ? questionnaires.find(qc => qc.id === el.config.questionnaire_id) : null;

    return (
      <div className="bg-stone-50 rounded-xl border border-stone-200 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-[12px] font-semibold text-stone-600">
            {getElementIcon(el.type)} Configure: {getElementLabel(el)}
          </h5>
          <button onClick={() => setEditingElementId(null)} className="p-1 hover:bg-stone-200 rounded">
            <X size={12} className="text-stone-400" />
          </button>
        </div>

        {el.type !== 'spacer' && el.type !== 'divider' && (
          <div>
            <label className="block text-[11px] font-medium text-stone-400 mb-1">Display Title</label>
            <input type="text" value={el.config.title || ''} onChange={(e) => updateElement(el.id, { title: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
        )}

        {el.type === 'questionnaire' && (
          <>
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Linked Questionnaire</label>
              <select value={el.config.questionnaire_id || ''} onChange={(e) => {
                const selected = questionnaires.find(q => q.id === e.target.value);
                updateElement(el.id, { questionnaire_id: e.target.value, title: selected?.title || 'Questionnaire' });
              }} className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 bg-white">
                <option value="">Select questionnaire...</option>
                {questionnaires.map(qc => <option key={qc.id} value={qc.id}>{qc.title}</option>)}
              </select>
            </div>
            {q && (
              <div className="text-[11px] text-stone-500 bg-white rounded-lg p-2 border border-stone-100">
                <p><strong>{q.questions?.length || 0}</strong> questions · <strong>{q.estimated_duration || 5}</strong> min</p>
                {q.frequency && <p className="mt-1">Frequency: <strong>{q.frequency}</strong></p>}
              </div>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={el.config.show_question_count !== false} onChange={(e) => updateElement(el.id, { show_question_count: e.target.checked })} className="rounded border-stone-300" />
              <span className="text-[11px] text-stone-600">Show question count</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={el.config.show_estimated_time !== false} onChange={(e) => updateElement(el.id, { show_estimated_time: e.target.checked })} className="rounded border-stone-300" />
              <span className="text-[11px] text-stone-600">Show estimated time</span>
            </label>
          </>
        )}

        {el.type === 'consent' && (
          <div>
            <label className="block text-[11px] font-medium text-stone-400 mb-1">Consent Description</label>
            <textarea value={el.config.consent_text || ''} onChange={(e) => updateElement(el.id, { consent_text: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20" rows={3} placeholder="Brief description..." />
          </div>
        )}

        {el.type === 'screening' && (
          <div>
            <label className="block text-[11px] font-medium text-stone-400 mb-1">Screening Criteria</label>
            <textarea value={el.config.screening_criteria || ''} onChange={(e) => updateElement(el.id, { screening_criteria: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20" rows={2} placeholder="Eligibility criteria..." />
          </div>
        )}

        {el.type === 'text_block' && (
          <div>
            <label className="block text-[11px] font-medium text-stone-400 mb-1">Content</label>
            <textarea value={el.config.content || ''} onChange={(e) => updateElement(el.id, { content: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20" rows={3} />
          </div>
        )}

        {el.type === 'progress' && (
          <div>
            <label className="block text-[11px] font-medium text-stone-400 mb-1">Progress Style</label>
            <select value={el.config.progress_style || 'bar'} onChange={(e) => updateElement(el.id, { progress_style: e.target.value as any })}
              className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 bg-white">
              <option value="bar">Progress Bar</option>
              <option value="ring">Ring / Circle</option>
              <option value="steps">Steps</option>
            </select>
          </div>
        )}

        {el.type === 'spacer' && (
          <div>
            <label className="block text-[11px] font-medium text-stone-400 mb-1">Height (px)</label>
            <input type="number" value={parseInt(el.config.style?.height || '16')} onChange={(e) => updateElement(el.id, { style: { ...el.config.style, height: `${e.target.value}px` } })}
              className="w-24 px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200" />
          </div>
        )}

        {el.type === 'button' && (
          <>
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Button Label</label>
              <input type="text" value={el.config.button_label || el.config.title || ''} onChange={(e) => updateElement(el.id, { button_label: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Action</label>
              <select value={el.config.button_action || ''} onChange={(e) => updateElement(el.id, { button_action: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 bg-white">
                <option value="">None</option>
                <option value="start_survey">Start Survey</option>
                <option value="view_progress">View Progress</option>
                <option value="contact_help">Contact Help</option>
              </select>
            </div>
          </>
        )}

        {el.type === 'image' && (
          <div>
            <label className="block text-[11px] font-medium text-stone-400 mb-1">Image URL</label>
            <input type="text" value={el.config.image_url || ''} onChange={(e) => updateElement(el.id, { image_url: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200" placeholder="https://..." />
          </div>
        )}

        {participantTypes.length > 0 && (
          <div>
            <label className="block text-[11px] font-medium text-stone-400 mb-1">Visible to</label>
            <div className="flex flex-wrap gap-1">
              {participantTypes.map(pt => {
                const visible = !el.config.participant_types || el.config.participant_types.includes(pt.id);
                return (
                  <button key={pt.id} onClick={() => {
                    const current = el.config.participant_types || participantTypes.map(p => p.id);
                    const next = visible ? current.filter(id => id !== pt.id) : [...current, pt.id];
                    updateElement(el.id, { participant_types: next });
                  }} className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${visible ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-200 text-stone-400'}`}>
                    {pt.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-stone-800">Layout Builder</h3>
            <p className="text-[12px] text-stone-400 font-light mt-0.5">Design how participants see your study — preview is live and identical to the actual app</p>
          </div>
          <button onClick={() => onUpdate(getDefaultLayout(questionnaires))}
            className="text-[12px] text-stone-400 hover:text-stone-600 transition-colors px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-300">
            Reset Default
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Tab & Element Editor */}
          <div className="flex-1 space-y-3">
            <Droppable droppableId="tabs" direction="horizontal" type="TAB">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}
                  className="flex items-center gap-1 bg-stone-100 rounded-xl p-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                  {layout.tabs.map((tab, index) => (
                    <Draggable key={tab.id} draggableId={`tab-${tab.id}`} index={index}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                          onClick={() => setActiveTabId(tab.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all cursor-grab active:cursor-grabbing ${
                            activeTabId === tab.id ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'
                          } ${snapshot.isDragging ? 'shadow-lg ring-2 ring-emerald-200' : ''}`}>
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

            {activeTab && (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-400 mb-1">Tab Label</label>
                      <input type="text" value={activeTab.label} onChange={(e) => updateTab(activeTab.id, { label: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-400 mb-1">Icon</label>
                      <select value={activeTab.icon} onChange={(e) => updateTab(activeTab.id, { icon: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 bg-white">
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

                <div className="flex items-center justify-between">
                  <h5 className="text-[12px] font-semibold text-stone-600 uppercase tracking-wider">Elements</h5>
                  <button onClick={() => setShowAddElement(!showAddElement)}
                    className="flex items-center gap-1 text-[11px] text-emerald-500 hover:text-emerald-600 font-medium">
                    <Plus size={12} /> Add Element
                  </button>
                </div>

                {showAddElement && (
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                    {questionnaires.length > 0 && (
                      <>
                        <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Your Questionnaires</p>
                        <div className="space-y-1">
                          {questionnaires.map(q => {
                            const alreadyPlaced = placedQuestionnaireIds.has(q.id);
                            return (
                              <button key={q.id} onClick={() => !alreadyPlaced && addQuestionnaire(q)} disabled={alreadyPlaced}
                                className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors text-[11px] border ${alreadyPlaced ? 'border-stone-100 bg-stone-50 opacity-50 cursor-not-allowed' : 'border-transparent hover:bg-white hover:border-stone-200'}`}>
                                <span className="text-lg">📋</span>
                                <div className="flex-1 min-w-0">
                                  <span className="text-stone-700 font-medium truncate block">{q.title}</span>
                                  <span className="text-[9px] text-stone-400">{q.questions?.length || 0} questions · {q.estimated_duration || 5} min{q.frequency ? ` · ${q.frequency}` : ''}</span>
                                </div>
                                {alreadyPlaced && <span className="text-[9px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">Added</span>}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                    <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Content Elements</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {STATIC_CONTENT_ELEMENTS.map(et => (
                        <button key={et.type} onClick={() => addElement(et.type, { title: et.label })}
                          className="flex items-center gap-2 p-2 rounded-lg text-left hover:bg-white transition-colors text-[11px] border border-transparent hover:border-stone-200">
                          <span>{et.icon}</span>
                          <div>
                            <span className="text-stone-600 font-medium">{et.label}</span>
                            <p className="text-[9px] text-stone-400">{et.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Layout Elements</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {LAYOUT_ELEMENTS.map(et => (
                        <button key={et.type} onClick={() => addElement(et.type, { title: et.label })}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white transition-colors text-[10px] border border-transparent hover:border-stone-200">
                          <span className="text-lg">{et.icon}</span>
                          <span className="text-stone-500 font-medium">{et.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Droppable droppableId={`elements-${activeTab.id}`} type="ELEMENT">
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}
                      className={`space-y-1 min-h-[60px] rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-emerald-50/50' : ''}`}>
                      {activeTab.elements.length === 0 ? (
                        <div className="py-8 text-center text-[12px] text-stone-400 border-2 border-dashed border-stone-200 rounded-xl">
                          Drag elements here or click "Add Element" above
                        </div>
                      ) : (
                        activeTab.elements.map((el, elIdx) => (
                          <Draggable key={el.id} draggableId={`el-${el.id}`} index={elIdx}>
                            {(provided, snapshot) => (
                              <div ref={provided.innerRef} {...provided.draggableProps}
                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border bg-white group transition-all ${
                                  snapshot.isDragging ? 'shadow-lg border-emerald-300 ring-2 ring-emerald-100' : 'border-stone-100 hover:border-stone-200'
                                } ${editingElementId === el.id ? 'border-emerald-300 bg-emerald-50/30' : ''}`}
                                onClick={() => setEditingElementId(editingElementId === el.id ? null : el.id)}>
                                <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-stone-100" onClick={(e) => e.stopPropagation()}>
                                  <GripVertical size={14} className="text-stone-300" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">{getElementIcon(el.type)}</span>
                                    <span className="text-[12px] font-medium text-stone-700 truncate">{getElementLabel(el)}</span>
                                    <span className="text-[9px] uppercase font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded shrink-0">{el.type.replace('_', ' ')}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                  <button onClick={(e) => { e.stopPropagation(); updateElement(el.id, { visible: !(el.config.visible !== false) }); }} className="p-1 hover:bg-stone-100 rounded">
                                    {el.config.visible !== false ? <Eye size={12} className="text-emerald-500" /> : <EyeOff size={12} className="text-stone-300" />}
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); setEditingElementId(el.id); }} className="p-1 hover:bg-stone-100 rounded">
                                    <Edit3 size={12} className="text-stone-400" />
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); removeElement(el.id); }} className="p-1 hover:bg-red-50 rounded">
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

                {editingElement && renderElementConfig(editingElement)}
              </div>
            )}

            {/* Theme */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
              <h5 className="text-[12px] font-semibold text-stone-600 uppercase tracking-wider">Theme</h5>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-stone-400 mb-1">Primary Color</label>
                  <input type="color" value={layout.theme?.primary_color || '#10b981'} onChange={(e) => onUpdate({ ...layout, theme: { ...layout.theme, primary_color: e.target.value } })}
                    className="w-full h-8 rounded-lg border border-stone-200 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-400 mb-1">Background</label>
                  <input type="color" value={layout.theme?.background_color || '#f5f5f4'} onChange={(e) => onUpdate({ ...layout, theme: { ...layout.theme, background_color: e.target.value } })}
                    className="w-full h-8 rounded-lg border border-stone-200 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-400 mb-1">Card Style</label>
                  <select value={layout.theme?.card_style || 'elevated'} onChange={(e) => onUpdate({ ...layout, theme: { ...layout.theme, card_style: e.target.value as any } })}
                    className="w-full px-2 py-1.5 rounded-lg text-[12px] border border-stone-200 bg-white">
                    <option value="flat">Flat</option>
                    <option value="elevated">Elevated</option>
                    <option value="outlined">Outlined</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Live Phone Preview — uses the SAME renderer as Preview tab */}
          <div className="lg:w-[380px] shrink-0">
            <div className="sticky top-24">
              <AppPhonePreview
                layout={layout}
                questionnaires={questionnaires}
                participantTypes={participantTypes}
                studyDuration={studyDuration}
                activeTabId={activeTabId}
                onActiveTabChange={setActiveTabId}
                highlightedElementId={editingElementId}
                onElementClick={setEditingElementId}
                frameHeight={620}
              />
              <p className="text-[11px] text-stone-400 text-center mt-3 font-light">Live Preview — identical to participant app</p>
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};

export { getDefaultLayout };
export default LayoutBuilder;
