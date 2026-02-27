import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Home, FileText, Settings, HelpCircle, BarChart3, Layout, Eye, EyeOff, Smartphone } from 'lucide-react';
import type { QuestionnaireConfig } from './QuestionnaireList';
import type { ParticipantType } from './ParticipantTypeManager';

export interface LayoutTab {
  id: string;
  label: string;
  icon: string; // lucide icon name
  elements: LayoutElement[];
  order_index: number;
}

export interface LayoutElement {
  id: string;
  type: 'questionnaire' | 'consent' | 'screening' | 'profile' | 'ecogram' | 'text_block' | 'progress' | 'timeline' | 'help';
  config: {
    questionnaire_id?: string;
    title?: string;
    content?: string;
    visible?: boolean;
  };
  order_index: number;
}

export interface AppLayout {
  tabs: LayoutTab[];
  bottom_nav: { icon: string; label: string; tab_id: string }[];
  show_header: boolean;
  header_title: string;
}

interface LayoutBuilderProps {
  layout: AppLayout;
  questionnaires: QuestionnaireConfig[];
  participantTypes: ParticipantType[];
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

const ELEMENT_TYPES = [
  { type: 'questionnaire', label: '📋 Questionnaire', desc: 'A survey/questionnaire form' },
  { type: 'consent', label: '🛡️ Consent Form', desc: 'Display consent agreement' },
  { type: 'screening', label: '📝 Screening', desc: 'Eligibility screening questions' },
  { type: 'profile', label: '👤 Profile', desc: 'Participant profile collection' },
  { type: 'ecogram', label: '🔗 Ecogram', desc: 'Care network diagram' },
  { type: 'text_block', label: '📄 Text Block', desc: 'Custom text or instructions' },
  { type: 'progress', label: '📊 Progress', desc: 'Study progress overview' },
  { type: 'timeline', label: '📅 Timeline', desc: 'Study timeline view' },
  { type: 'help', label: '❓ Help', desc: 'Help and FAQ section' },
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
  };
};

const LayoutBuilder: React.FC<LayoutBuilderProps> = ({ layout, questionnaires, participantTypes, onUpdate }) => {
  const [activeTabId, setActiveTabId] = useState(layout.tabs[0]?.id || '');
  const [showAddElement, setShowAddElement] = useState(false);

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
    // Sync bottom_nav label
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
      config: { visible: true, title: ELEMENT_TYPES.find(e => e.type === type)?.label || type },
      order_index: activeTab.elements.length,
    };
    updateTab(activeTab.id, { elements: [...activeTab.elements, newElement] });
    setShowAddElement(false);
  };

  const removeElement = (elementId: string) => {
    if (!activeTab) return;
    updateTab(activeTab.id, { elements: activeTab.elements.filter(e => e.id !== elementId) });
  };

  const updateElement = (elementId: string, updates: Partial<LayoutElement>) => {
    if (!activeTab) return;
    updateTab(activeTab.id, {
      elements: activeTab.elements.map(e => e.id === elementId ? { ...e, ...updates } : e),
    });
  };

  const moveElement = (elementId: string, dir: 'up' | 'down') => {
    if (!activeTab) return;
    const idx = activeTab.elements.findIndex(e => e.id === elementId);
    if ((dir === 'up' && idx === 0) || (dir === 'down' && idx === activeTab.elements.length - 1)) return;
    const newElements = [...activeTab.elements];
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    [newElements[idx], newElements[swapIdx]] = [newElements[swapIdx], newElements[idx]];
    newElements.forEach((e, i) => e.order_index = i);
    updateTab(activeTab.id, { elements: newElements });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-semibold text-stone-800">Layout Builder</h3>
          <p className="text-[12px] text-stone-400 font-light mt-0.5">
            Design how participants see your study — tabs, elements, and navigation
          </p>
        </div>
        <button
          onClick={() => onUpdate(getDefaultLayout(questionnaires))}
          className="text-[12px] text-stone-400 hover:text-stone-600 transition-colors"
        >
          Reset to Default
        </button>
      </div>

      {/* Phone Preview Frame */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab Editor */}
        <div className="flex-1 space-y-3">
          {/* Tab Bar */}
          <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1 overflow-x-auto">
            {layout.tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all ${
                  activeTabId === tab.id ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <button onClick={addTab} className="p-1.5 rounded-lg hover:bg-white/80 transition-colors">
              <Plus size={14} className="text-stone-400" />
            </button>
          </div>

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

              {/* Elements */}
              <div className="space-y-1.5">
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
                  <div className="grid grid-cols-2 gap-1.5 p-2 bg-stone-50 rounded-xl border border-stone-200">
                    {ELEMENT_TYPES.map(et => (
                      <button
                        key={et.type}
                        onClick={() => addElement(et.type)}
                        className="flex items-center gap-2 p-2 rounded-lg text-left hover:bg-white transition-colors text-[11px]"
                      >
                        <span>{et.label.split(' ')[0]}</span>
                        <span className="text-stone-600 font-medium">{et.label.split(' ').slice(1).join(' ')}</span>
                      </button>
                    ))}
                  </div>
                )}

                {activeTab.elements.length === 0 ? (
                  <div className="py-6 text-center text-[12px] text-stone-400 border-2 border-dashed border-stone-200 rounded-xl">
                    No elements. Add questionnaires, consent forms, etc.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {activeTab.elements.map((el, elIdx) => (
                      <div
                        key={el.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-stone-100 bg-white group hover:border-stone-200 transition-colors"
                      >
                        <GripVertical size={12} className="text-stone-300 shrink-0 cursor-grab" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                              {el.type.replace('_', ' ')}
                            </span>
                            {el.type === 'questionnaire' && el.config.questionnaire_id && (
                              <select
                                value={el.config.questionnaire_id}
                                onChange={(e) => updateElement(el.id, {
                                  config: { ...el.config, questionnaire_id: e.target.value, title: questionnaires.find(q => q.id === e.target.value)?.title }
                                })}
                                className="text-[11px] px-1.5 py-0.5 border border-stone-200 rounded bg-white"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {questionnaires.map(q => (
                                  <option key={q.id} value={q.id}>{q.title}</option>
                                ))}
                              </select>
                            )}
                            {el.type === 'questionnaire' && !el.config.questionnaire_id && questionnaires.length > 0 && (
                              <select
                                value=""
                                onChange={(e) => updateElement(el.id, {
                                  config: { ...el.config, questionnaire_id: e.target.value, title: questionnaires.find(q => q.id === e.target.value)?.title }
                                })}
                                className="text-[11px] px-1.5 py-0.5 border border-stone-200 rounded bg-white"
                              >
                                <option value="">Select questionnaire...</option>
                                {questionnaires.map(q => (
                                  <option key={q.id} value={q.id}>{q.title}</option>
                                ))}
                              </select>
                            )}
                            <span className="text-[12px] text-stone-600 truncate">{el.config.title || ''}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={() => moveElement(el.id, 'up')} disabled={elIdx === 0} className="p-1 hover:bg-stone-100 rounded disabled:opacity-30">
                            <ChevronUp size={12} className="text-stone-400" />
                          </button>
                          <button onClick={() => moveElement(el.id, 'down')} disabled={elIdx === activeTab.elements.length - 1} className="p-1 hover:bg-stone-100 rounded disabled:opacity-30">
                            <ChevronDown size={12} className="text-stone-400" />
                          </button>
                          <button
                            onClick={() => updateElement(el.id, { config: { ...el.config, visible: !el.config.visible } })}
                            className="p-1 hover:bg-stone-100 rounded"
                          >
                            {el.config.visible !== false ? <Eye size={12} className="text-emerald-500" /> : <EyeOff size={12} className="text-stone-300" />}
                          </button>
                          <button onClick={() => removeElement(el.id)} className="p-1 hover:bg-red-50 rounded">
                            <Trash2 size={12} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone Preview */}
        <div className="lg:w-[280px] shrink-0">
          <div className="bg-stone-800 rounded-[2rem] p-2 shadow-xl">
            <div className="bg-white rounded-[1.5rem] overflow-hidden" style={{ height: '500px' }}>
              {/* Status bar */}
              <div className="h-8 bg-stone-50 flex items-center justify-center">
                <div className="w-16 h-1 bg-stone-200 rounded-full" />
              </div>
              {/* Content */}
              <div className="flex-1 p-3 overflow-y-auto" style={{ height: '408px' }}>
                <h4 className="text-[13px] font-bold text-stone-800 mb-3">
                  {activeTab?.label || 'Home'}
                </h4>
                {activeTab?.elements.filter(e => e.config.visible !== false).map(el => (
                  <div key={el.id} className="mb-2 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                    <span className="text-[9px] uppercase font-bold text-stone-400">{el.type.replace('_', ' ')}</span>
                    <p className="text-[11px] text-stone-600 mt-0.5">{el.config.title || el.type}</p>
                  </div>
                ))}
              </div>
              {/* Bottom nav */}
              <div className="h-14 border-t border-stone-100 flex items-center justify-around px-2">
                {layout.bottom_nav.map(nav => (
                  <button
                    key={nav.tab_id}
                    onClick={() => setActiveTabId(nav.tab_id)}
                    className="flex flex-col items-center gap-0.5"
                  >
                    <div className={`w-5 h-5 rounded-full ${activeTabId === nav.tab_id ? 'bg-emerald-500' : 'bg-stone-200'}`} />
                    <span className={`text-[8px] font-medium ${activeTabId === nav.tab_id ? 'text-emerald-600' : 'text-stone-400'}`}>
                      {nav.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-stone-400 text-center mt-2 font-light">Live Preview</p>
        </div>
      </div>
    </div>
  );
};

export { getDefaultLayout };
export default LayoutBuilder;
