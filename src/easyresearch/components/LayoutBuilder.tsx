import React, { useState, useCallback, useEffect } from 'react';
import { bToast, toast } from '../utils/bilingualToast';
import { Plus, Trash2, GripVertical, Home, FileText, Settings, HelpCircle, BarChart3, Layout, Eye, EyeOff, X, Edit3, Link2, Calendar, CheckSquare, Maximize2, Minus, MousePointer, Image, Shield, ClipboardCheck, User, Layers, icons, Lock, Mail } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import type { QuestionnaireConfig } from './QuestionnaireList';
import type { ParticipantType } from './ParticipantTypeManager';
import AppPhonePreview from './AppPhonePreview';
import { DEVICE_PRESETS, DEFAULT_DEVICE, type DevicePreset } from '../constants/devicePresets';
import BrandIcon from './BrandIcon';
import { useI18n } from '../hooks/useI18n';
import { supabase } from '../../lib/supabase';

// Private custom element from DB / 数据库中的定制功能部件
interface CustomFunctionElement {
  id: string;
  user_id: string;
  name_en: string;
  name_zh: string;
  description_en: string | null;
  description_zh: string | null;
  icon: string;
  element_config: any;
  is_public: boolean;
}

export interface LayoutTab {
  id: string;
  label: string;
  icon: string;
  elements: LayoutElement[];
  order_index: number;
}

export interface LayoutElement {
  id: string;
  type: 'questionnaire' | 'consent' | 'screening' | 'profile' | 'ecogram' | 'text_block' | 'progress' | 'timeline' | 'help' | 'custom' | 'spacer' | 'divider' | 'image' | 'button' | 'todo_list' | 'ai_assistant' | 'direct_message' | 'start_date_picker' | 'back_button' | 'onboarding' | 'custom_function';
  config: {
    questionnaire_id?: string;
    questionnaire_ids?: string[];
    title?: string;
    content?: string;
    visible?: boolean;
    participant_types?: string[];
    width?: string; // '25%' | '33%' | '50%' | '75%' | '100%'
    style?: {
      padding?: string;
      background?: string;
      border_radius?: string;
      height?: string;
      // Advanced styling
      margin?: string;
      opacity?: number;
      border?: string;
      border_color?: string;
      shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
      text_align?: 'left' | 'center' | 'right';
      content_align?: 'top' | 'center' | 'bottom';
      font_size?: string;
      font_weight?: string;
      text_color?: string;
      bg_color?: string;
      overflow?: 'hidden' | 'scroll' | 'visible';
    };
    button_action?: string;
    button_label?: string;
    button_border_radius?: string;
    icon?: string; // Custom Lucide icon name
    image_url?: string;
    show_question_count?: boolean;
    show_estimated_time?: boolean;
    show_frequency?: boolean;
    card_display_style?: 'icon' | 'button' | 'both' | 'minimal';
    screening_criteria?: string;
    help_sections?: { title: string; content: string }[];
    progress_style?: 'bar' | 'ring' | 'steps';
    // Timeline config
    timeline_start_hour?: number;
    timeline_end_hour?: number;
    timeline_days?: number;
    // To-Do List config
    todo_cards?: Array<{
      id: string;
      type: 'questionnaire' | 'custom';
      questionnaire_id?: string;
      title?: string;
      description?: string;
      completion_trigger?: 'manual' | 'time' | 'questionnaire_complete';
    }>;
    todo_layout?: 'horizontal' | 'vertical';
    todo_auto_scroll?: boolean;
    // Questionnaire tab sections
    tab_sections?: Array<{
      id: string;
      label: string;
      question_ids: string[];
    }>;
    // AI Assistant config / AI 助手配置
    ai_display_mode?: 'popup' | 'card'; // popup = floating button, card = inline card
    ai_position?: 'bottom-right' | 'bottom-left' | 'center'; // position for popup mode
  };
  order_index: number;
}

export interface AppLayout {
  tabs: LayoutTab[];
  bottom_nav: { icon: string; label: string; tab_id: string }[];
  show_header: boolean;
  header_title: string;
  header_description?: string;
  theme: {
    primary_color: string;
    background_color: string;
    card_style: 'flat' | 'elevated' | 'outlined';
  };
  // Project-level AI Assistant / 项目级 AI 助手
  ai_assistant_enabled?: boolean;
  ai_assistant_config?: {
    display_mode: 'popup' | 'card';
    position: 'bottom-right' | 'bottom-left' | 'center';
    icon?: string;
    title?: string;
    description?: string;
  };
}

interface LayoutBuilderProps {
  layout: AppLayout;
  questionnaires: QuestionnaireConfig[];
  participantTypes: ParticipantType[];
  studyDuration?: number;
  projectTitle?: string;
  projectDescription?: string;
  onUpdate: (layout: AppLayout) => void;
  onUpdateQuestionnaire?: (id: string, updates: Partial<QuestionnaireConfig>) => void;
}

const ICON_OPTIONS = [
  { value: '', label: 'None', icon: '' },
  { value: 'Home', label: 'Home', icon: 'Home' },
  { value: 'FileText', label: 'Survey', icon: 'FileText' },
  { value: 'BarChart3', label: 'Progress', icon: 'BarChart3' },
  { value: 'HelpCircle', label: 'Help', icon: 'HelpCircle' },
  { value: 'Settings', label: 'Settings', icon: 'Settings' },
  { value: 'Layout', label: 'Layout', icon: 'Layout' },
  { value: 'Calendar', label: 'Calendar', icon: 'Calendar' },
  { value: 'User', label: 'User', icon: 'User' },
  { value: 'Users', label: 'Users', icon: 'Users' },
  { value: 'MessageCircle', label: 'Message', icon: 'MessageCircle' },
  { value: 'Bell', label: 'Bell', icon: 'Bell' },
  { value: 'Heart', label: 'Heart', icon: 'Heart' },
  { value: 'Star', label: 'Star', icon: 'Star' },
  { value: 'Shield', label: 'Shield', icon: 'Shield' },
  { value: 'ClipboardCheck', label: 'Clipboard', icon: 'ClipboardCheck' },
  { value: 'Sparkles', label: 'AI/Sparkles', icon: 'Sparkles' },
  { value: 'BookOpen', label: 'Book', icon: 'BookOpen' },
  { value: 'Globe', label: 'Globe', icon: 'Globe' },
  { value: 'Camera', label: 'Camera', icon: 'Camera' },
  { value: 'Mic', label: 'Mic', icon: 'Mic' },
  { value: 'Phone', label: 'Phone', icon: 'Phone' },
  { value: 'Mail', label: 'Mail', icon: 'Mail' },
  { value: 'Map', label: 'Map', icon: 'Map' },
  { value: 'Clock', label: 'Clock', icon: 'Clock' },
  { value: 'CheckSquare', label: 'Tasks', icon: 'CheckSquare' },
  { value: 'ListChecks', label: 'Checklist', icon: 'ListChecks' },
  { value: 'Activity', label: 'Activity', icon: 'Activity' },
  { value: 'Award', label: 'Award', icon: 'Award' },
  { value: 'Briefcase', label: 'Briefcase', icon: 'Briefcase' },
];

const FUNCTION_ELEMENTS = [
  { type: 'ecogram', label: 'Ecogram', label_en: 'Ecogram', label_zh: '生态图', lucideIcon: 'Link2', desc: 'Care network diagram' },
  { type: 'progress', label: 'Progress', label_en: 'Progress', label_zh: '进度', lucideIcon: 'BarChart3', desc: 'Study progress overview' },
  { type: 'timeline', label: 'Timeline', label_en: 'Timeline', label_zh: '时间线', lucideIcon: 'Calendar', desc: 'Study timeline view' },
  { type: 'start_date_picker', label: 'Set Start Date', label_en: 'Set Start Date', label_zh: '设置开始日期', lucideIcon: 'Calendar', desc: 'Custom study start date picker' },
  { type: 'direct_message', label: 'Message Researcher', label_en: 'Message Researcher', label_zh: '联系研究者', lucideIcon: 'MessageCircle', desc: 'Direct message with researcher' },
  { type: 'ai_assistant', label: 'AI Assistant', label_en: 'AI Assistant', label_zh: 'AI 助手', lucideIcon: 'MessageCircle', desc: 'Project-level AI chatbot (popup or card)' },
];

const LAYOUT_ELEMENTS = [
  { type: 'text_block', label: 'Text Block', label_en: 'Text Block', label_zh: '文本块', lucideIcon: 'FileText', desc: 'Custom text or instructions' },
  { type: 'todo_list', label: 'To-Do List', label_en: 'To-Do List', label_zh: '待办列表', lucideIcon: 'CheckSquare', desc: 'Task cards slider' },
  { type: 'spacer', label: 'Spacer', label_en: 'Spacer', label_zh: '间距', lucideIcon: 'Maximize2', desc: 'Add vertical space' },
  { type: 'divider', label: 'Divider', label_en: 'Divider', label_zh: '分割线', lucideIcon: 'Minus', desc: 'Horizontal divider line' },
  { type: 'button', label: 'Button', label_en: 'Button', label_zh: '按钮', lucideIcon: 'MousePointer', desc: 'Action button' },
  { type: 'image', label: 'Image', label_en: 'Image', label_zh: '图片', lucideIcon: 'Image', desc: 'Image block' },
  { type: 'back_button', label: 'Back Button', label_en: 'Back Button', label_zh: '返回按钮', lucideIcon: 'ArrowLeft', desc: 'Navigate to previous screen' },
];

const WIDTH_PRESETS = [
  { value: '100%', label: 'Full Width' },
  { value: '75%', label: '75%' },
  { value: '50%', label: 'Half' },
  { value: '33%', label: '1/3' },
  { value: '25%', label: '1/4' },
];

const getDefaultLayout = (questionnaires: QuestionnaireConfig[]): AppLayout => {
  const tabElements: LayoutElement[] = questionnaires.map((q, i) => ({
    id: crypto.randomUUID(),
    type: 'questionnaire' as const,
    config: { questionnaire_id: q.id, title: q.title, visible: true, show_question_count: true, show_estimated_time: true },
    order_index: i,
  }));

  const homeId = crypto.randomUUID();
  const timelineId = crypto.randomUUID();
  const settingsId = crypto.randomUUID();

  return {
    tabs: [
      {
        id: homeId, label: 'Home', icon: 'Home',
        elements: [
          { id: crypto.randomUUID(), type: 'progress', config: { title: 'Your Progress', visible: true, progress_style: 'bar' }, order_index: 0 },
          ...tabElements,
        ],
        order_index: 0,
      },
      {
        id: timelineId, label: 'Timeline', icon: 'FileText',
        elements: [
          { id: crypto.randomUUID(), type: 'timeline', config: { title: 'Study Timeline', visible: true }, order_index: 0 },
        ],
        order_index: 1,
      },
      {
        id: settingsId, label: 'Settings', icon: 'Settings',
        elements: [
          { id: crypto.randomUUID(), type: 'profile', config: { title: 'Profile', visible: true }, order_index: 0 },
          { id: crypto.randomUUID(), type: 'help', config: { title: 'Help & FAQ', visible: true }, order_index: 1 },
        ],
        order_index: 2,
      },
    ],
    bottom_nav: [
      { icon: 'Home', label: 'Home', tab_id: homeId },
      { icon: 'FileText', label: 'Survey', tab_id: timelineId },
      { icon: 'Settings', label: 'Settings', tab_id: settingsId },
    ],
    show_header: true,
    header_title: '',
    theme: { primary_color: '#10b981', background_color: '#f5f5f4', card_style: 'elevated' },
  };
};

const LayoutBuilder: React.FC<LayoutBuilderProps> = ({ layout, questionnaires, participantTypes, studyDuration = 7, projectTitle, projectDescription, onUpdate, onUpdateQuestionnaire }) => {
  const { t, lang } = useI18n();
  const [activeTabId, setActiveTabId] = useState(layout.tabs[0]?.id || '');
  const [showAddElement, setShowAddElement] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(DEFAULT_DEVICE);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [filterParticipantTypeId, setFilterParticipantTypeId] = useState<string | null>(null);
  const [customElements, setCustomElements] = useState<CustomFunctionElement[]>([]);
  const [userFuncElements, setUserFuncElements] = useState<any[]>([]);

  // Fetch private/custom elements + user-customized function elements from DB
  useEffect(() => {
    const fetchCustomElements = async () => {
      try {
        const [customRes, userRes] = await Promise.all([
          (supabase as any).from('custom_function_element').select('*'),
          (supabase as any).from('user_function_element').select('*'),
        ]);
        if (!customRes.error && customRes.data) setCustomElements(customRes.data);
        if (!userRes.error && userRes.data) setUserFuncElements(userRes.data);
      } catch (e) {
        // Silent fail — tables may not exist yet / 静默失败
      }
    };
    fetchCustomElements();
  }, []);

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

    // Check if this is an AI assistant element with structural changes that need cross-tab sync
    // 检查是否是 AI 助手元素的结构性更改，需要跨 Tab 同步
    const targetEl = activeTab.elements.find(e => e.id === elementId);
    const isAiStructuralChange = targetEl?.type === 'ai_assistant' &&
      ('ai_display_mode' in config || 'ai_position' in config);

    if (isAiStructuralChange) {
      // Sync structural props (mode, position) to ALL tabs' AI elements
      const structuralUpdates: Partial<LayoutElement['config']> = {};
      if ('ai_display_mode' in config) structuralUpdates.ai_display_mode = config.ai_display_mode;
      if ('ai_position' in config) structuralUpdates.ai_position = config.ai_position;

      const newTabs = layout.tabs.map(tab => ({
        ...tab,
        elements: tab.elements.map(e => {
          if (e.id === elementId) {
            // The edited element gets ALL config changes
            return { ...e, config: { ...e.config, ...config } };
          }
          if (e.type === 'ai_assistant') {
            // Other AI elements get only structural changes
            return { ...e, config: { ...e.config, ...structuralUpdates } };
          }
          return e;
        }),
      }));
      // Also sync to project-level ai_assistant_config
      const newAiConfig = {
        ...layout.ai_assistant_config,
        display_mode: config.ai_display_mode ?? layout.ai_assistant_config?.display_mode ?? 'popup',
        position: config.ai_position ?? layout.ai_assistant_config?.position ?? 'bottom-right',
      };
      onUpdate({ ...layout, tabs: newTabs, ai_assistant_config: newAiConfig });
    } else {
      updateTab(activeTab.id, {
        elements: activeTab.elements.map(e => e.id === elementId ? { ...e, config: { ...e.config, ...config } } : e),
      });
    }
  };

  const resolveTabId = (droppableId: string) => {
    return droppableId.replace('elements-', '').replace('phone-elements-', '');
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
      const sourceTabId = resolveTabId(source.droppableId);
      const destTabId = resolveTabId(destination.droppableId);
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

  const getLucideIcon = (iconName: string, size = 14, className = 'text-stone-500') => {
    if (!iconName) return null;
    const Icon = icons[iconName as keyof typeof icons];
    return Icon ? <Icon size={size} className={className} /> : <FileText size={size} className={className} />;
  };

  const getElementIcon = (type: string) => {
    const all = [...FUNCTION_ELEMENTS, ...LAYOUT_ELEMENTS];
    const found = all.find(e => e.type === type);
    return found?.lucideIcon || 'FileText';
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
          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Display Title</label>
              <input type="text" value={el.config.title || ''} onChange={(e) => updateElement(el.id, { title: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            {el.type !== 'text_block' && (
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Description</label>
                <input type="text" value={el.config.content || ''} onChange={(e) => updateElement(el.id, { content: e.target.value })}
                  placeholder="Optional description shown below the title"
                  className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
            )}
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Icon</label>
              <div className="flex flex-wrap gap-1">
                <button onClick={() => updateElement(el.id, { icon: '' })}
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center text-[9px] transition-colors ${
                    !el.config.icon ? 'border-emerald-400 bg-emerald-50 text-emerald-600' : 'border-stone-200 text-stone-400 hover:border-stone-300'
                  }`} title="No icon">✕</button>
                {ICON_OPTIONS.filter(o => o.value).map(o => (
                  <button key={o.value} onClick={() => updateElement(el.id, { icon: o.value })}
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${
                      el.config.icon === o.value ? 'border-emerald-400 bg-emerald-50 text-emerald-600' : 'border-stone-200 text-stone-400 hover:border-stone-300'
                    }`} title={o.label}>
                    {getLucideIcon(o.value, 14, el.config.icon === o.value ? 'text-emerald-600' : 'text-stone-400')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Visible to — participant type toggles (shown near top for discoverability) */}
        {participantTypes.length > 0 && (
          <div>
            <label className="block text-[11px] font-medium text-stone-400 mb-1">Visible to</label>
            <div className="flex flex-wrap gap-1">
              {participantTypes.map(pt => {
                // Inherit defaults from linked questionnaire if element has no explicit participant_types
                const linkedQ = el.config.questionnaire_id ? questionnaires.find(qc => qc.id === el.config.questionnaire_id) : null;
                const effectiveTypes = el.config.participant_types
                  ?? (linkedQ?.assigned_participant_types && linkedQ.assigned_participant_types.length > 0
                    ? linkedQ.assigned_participant_types
                    : null);
                const visible = !effectiveTypes || effectiveTypes.includes(pt.id);
                return (
                  <button key={pt.id} onClick={() => {
                    const current = effectiveTypes || participantTypes.map(p => p.id);
                    const next = visible ? current.filter(id => id !== pt.id) : [...current, pt.id];
                    updateElement(el.id, { participant_types: next });
                  }} className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${visible ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-stone-200 text-stone-400 bg-white'}`}>
                    {pt.name}
                  </button>
                );
              })}
            </div>
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

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={el.config.show_frequency !== false} onChange={(e) => updateElement(el.id, { show_frequency: e.target.checked })} className="rounded border-stone-300" />
              <span className="text-[11px] text-stone-600">Show frequency</span>
            </label>
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Card Style</label>
              <select value={el.config.card_display_style || 'icon'} onChange={(e) => updateElement(el.id, { card_display_style: e.target.value as any })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 bg-white">
                <option value="icon">Icon (chevron arrow)</option>
                <option value="button">Text Button</option>
                <option value="both">Icon + Button</option>
                <option value="minimal">Minimal (no icon/button)</option>
              </select>
            </div>
            {(el.config.card_display_style === 'button' || el.config.card_display_style === 'both') && (
              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-medium text-stone-400 mb-1">Button Label</label>
                  <input type="text" value={el.config.button_label || ''} placeholder="Open"
                    onChange={(e) => updateElement(el.id, { button_label: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-400 mb-1">Button Radius</label>
                  <div className="flex gap-1">
                    {['4px', '8px', '12px', '999px'].map(r => (
                      <button key={r} onClick={() => updateElement(el.id, { button_border_radius: r })}
                        className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
                          (el.config.button_border_radius || '8px') === r
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-200 text-stone-400'
                        }`}>{r === '999px' ? 'Pill' : r}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Display Density Settings */}
            {q && onUpdateQuestionnaire && (
              <div className="border-t border-stone-200 pt-3 space-y-2">
                <h6 className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Display Settings</h6>
                <div>
                  <label className="block text-[11px] font-medium text-stone-400 mb-1">Questions Per Page (default)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={q.questions_per_page ?? ''}
                      placeholder="Unlimited"
                      onChange={(e) => {
                        const val = e.target.value ? parseInt(e.target.value) : null;
                        onUpdateQuestionnaire(q.id, { questions_per_page: val });
                      }}
                      className="w-20 px-2 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <span className="text-[10px] text-stone-400">{q.questions_per_page ? `${q.questions_per_page} per page` : 'All at once'}</span>
                    {q.questions_per_page && (
                      <button onClick={() => onUpdateQuestionnaire(q.id, { questions_per_page: null })} className="text-[10px] text-stone-400 hover:text-stone-600 underline">
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Per-tab section overrides */}
                {q.tab_sections && q.tab_sections.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-medium text-stone-400">Per-Tab Overrides</label>
                    {q.tab_sections.map((section) => (
                      <div key={section.id} className="flex items-center gap-2 text-[11px]">
                        <span className="text-stone-600 flex-1 truncate">{section.label}</span>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={section.questions_per_page ?? ''}
                          placeholder={q.questions_per_page ? String(q.questions_per_page) : '∞'}
                          onChange={(e) => {
                            const val = e.target.value ? parseInt(e.target.value) : null;
                            const updatedSections = q.tab_sections!.map(s =>
                              s.id === section.id ? { ...s, questions_per_page: val } : s
                            );
                            onUpdateQuestionnaire(q.id, { tab_sections: updatedSections });
                          }}
                          className="w-16 px-2 py-1 rounded-lg text-[11px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <span className="text-[9px] text-stone-400 w-12">
                          {section.questions_per_page ?? (q.questions_per_page ?? '∞')}/pg
                        </span>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}
          </>
        )}

        {(el.type === 'consent' || el.type === 'screening' || el.type === 'help' || el.type === 'custom' || el.type === 'profile' || el.type === 'onboarding') && (() => {
          const linkedQ = el.config.questionnaire_id ? questionnaires.find(qc => qc.id === el.config.questionnaire_id) : null;
          return (
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Linked Component</label>
                <select value={el.config.questionnaire_id || ''} onChange={(e) => {
                  const selected = questionnaires.find(q => q.id === e.target.value);
                  updateElement(el.id, { questionnaire_id: e.target.value, title: selected?.title || el.config.title });
                }} className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 bg-white">
                  <option value="">— Select {el.type} component —</option>
                  {questionnaires.filter(q => q.questionnaire_type === el.type || (el.type === 'custom' && q.questionnaire_type === 'custom') || (el.type === 'onboarding' && q.questionnaire_type === 'onboarding') || (el.type === 'profile' && q.questionnaire_type === 'profile')).map(q => (
                    <option key={q.id} value={q.id}>{q.title} ({q.questions?.length || 0} fields)</option>
                  ))}
                </select>
              </div>
              {linkedQ && (
                <div className="text-[11px] text-stone-500 bg-white rounded-lg p-2 border border-stone-100">
                  <p><strong>{linkedQ.questions?.length || 0}</strong> fields · <strong>{linkedQ.estimated_duration || 5}</strong> min</p>
                </div>
              )}
              {!el.config.questionnaire_id && (
                <p className="text-[10px] text-stone-400 italic">No component linked. Create one in the Forms & Components tab first.</p>
              )}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={el.config.show_question_count !== false} onChange={(e) => updateElement(el.id, { show_question_count: e.target.checked })} className="rounded border-stone-300" />
                <span className="text-[11px] text-stone-600">Show field count</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={el.config.show_estimated_time !== false} onChange={(e) => updateElement(el.id, { show_estimated_time: e.target.checked })} className="rounded border-stone-300" />
                <span className="text-[11px] text-stone-600">Show estimated time</span>
              </label>
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Card Style</label>
                <select value={el.config.card_display_style || 'icon'} onChange={(e) => updateElement(el.id, { card_display_style: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 bg-white">
                  <option value="icon">Icon (chevron arrow)</option>
                  <option value="button">Text Button</option>
                  <option value="both">Icon + Button</option>
                  <option value="minimal">Minimal (no icon/button)</option>
                </select>
              </div>
              {(el.config.card_display_style === 'button' || el.config.card_display_style === 'both') && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1">Button Label</label>
                    <input type="text" value={el.config.button_label || ''} 
                      placeholder={el.type === 'consent' ? 'Review & Sign' : el.type === 'screening' ? 'Start Screening' : el.type === 'help' ? 'View Help' : 'Open'}
                      onChange={(e) => updateElement(el.id, { button_label: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1">Button Radius</label>
                    <div className="flex gap-1">
                      {['4px', '8px', '12px', '999px'].map(r => (
                        <button key={r} onClick={() => updateElement(el.id, { button_border_radius: r })}
                          className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
                            (el.config.button_border_radius || '8px') === r
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-200 text-stone-400'
                          }`}>{r === '999px' ? 'Pill' : r}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

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

        {el.type === 'timeline' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Questionnaires (multi-select)</label>
              <div className="space-y-1 max-h-40 overflow-y-auto border border-stone-200 rounded-lg p-2 bg-white">
                {questionnaires.filter(q => q.questionnaire_type === 'survey').map(q => {
                  const selectedIds: string[] = el.config.questionnaire_ids || (el.config.questionnaire_id ? [el.config.questionnaire_id] : []);
                  const checked = selectedIds.includes(q.id);
                  return (
                    <label key={q.id} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-stone-50 rounded px-1">
                      <input type="checkbox" checked={checked} onChange={() => {
                        const next = checked ? selectedIds.filter(id => id !== q.id) : [...selectedIds, q.id];
                        updateElement(el.id, { questionnaire_ids: next, questionnaire_id: next[0] || undefined });
                      }} className="rounded border-stone-300 text-emerald-500" />
                      <span className="text-[11px] text-stone-700 flex-1">{q.title}</span>
                      <span className="text-[9px] text-stone-400">{q.frequency || 'daily'} · {q.time_windows?.[0]?.start || '09:00'}–{q.time_windows?.[0]?.end || '21:00'}</span>
                    </label>
                  );
                })}
                {questionnaires.filter(q => q.questionnaire_type === 'survey').length === 0 && (
                  <p className="text-[10px] text-stone-400 italic py-1">No survey questionnaires created yet.</p>
                )}
              </div>
              {((el.config.questionnaire_ids?.length || 0) > 0) && (
                <div className="text-[10px] text-emerald-600 bg-emerald-50 rounded-lg px-2 py-1.5 border border-emerald-100 mt-1">
                  ✓ {el.config.questionnaire_ids!.length} questionnaire(s) linked — schedule derived from each questionnaire's frequency & time windows
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Display Days</label>
                <input type="number" min={1} max={90} value={el.config.timeline_days || studyDuration || 7}
                  onChange={(e) => updateElement(el.id, { timeline_days: parseInt(e.target.value) || 7 })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Display From</label>
                <input type="number" min={0} max={23} value={el.config.timeline_start_hour ?? 0}
                  onChange={(e) => updateElement(el.id, { timeline_start_hour: parseInt(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Display To</label>
                <input type="number" min={0} max={23} value={el.config.timeline_end_hour ?? 23}
                  onChange={(e) => updateElement(el.id, { timeline_end_hour: parseInt(e.target.value) || 23 })}
                  className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200" />
              </div>
            </div>
            <p className="text-[9px] text-stone-400">Display hours control the timeline view range only — actual answer times come from each questionnaire's settings.</p>
          </div>
        )}

        {el.type === 'todo_list' && (
          <div className="space-y-2">
            <label className="block text-[11px] font-medium text-stone-400">Task Cards</label>
            {(el.config.todo_cards || []).map((card, ci) => (
              <div key={card.id} className="flex items-center gap-1.5 p-2 bg-white rounded-lg border border-stone-200 text-[11px]">
                <select value={card.type} onChange={(e) => {
                  const cards = [...(el.config.todo_cards || [])];
                  cards[ci] = { ...cards[ci], type: e.target.value as any };
                  updateElement(el.id, { todo_cards: cards });
                }} className="px-1.5 py-1 rounded border border-stone-200 bg-white text-[10px]">
                  <option value="questionnaire">Survey</option>
                  <option value="custom">Custom</option>
                </select>
                {card.type === 'questionnaire' ? (
                  <select value={card.questionnaire_id || ''} onChange={(e) => {
                    const cards = [...(el.config.todo_cards || [])];
                    const q = questionnaires.find(qc => qc.id === e.target.value);
                    cards[ci] = { ...cards[ci], questionnaire_id: e.target.value, title: q?.title || '' };
                    updateElement(el.id, { todo_cards: cards });
                  }} className="flex-1 px-1.5 py-1 rounded border border-stone-200 bg-white text-[10px] min-w-0">
                    <option value="">Select...</option>
                    {questionnaires.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
                  </select>
                ) : (
                  <input type="text" value={card.title || ''} placeholder="Task title"
                    onChange={(e) => {
                      const cards = [...(el.config.todo_cards || [])];
                      cards[ci] = { ...cards[ci], title: e.target.value };
                      updateElement(el.id, { todo_cards: cards });
                    }}
                    className="flex-1 px-1.5 py-1 rounded border border-stone-200 text-[10px] min-w-0" />
                )}
                <select value={card.completion_trigger || 'manual'} onChange={(e) => {
                  const cards = [...(el.config.todo_cards || [])];
                  cards[ci] = { ...cards[ci], completion_trigger: e.target.value as any };
                  updateElement(el.id, { todo_cards: cards });
                }} className="px-1 py-1 rounded border border-stone-200 bg-white text-[9px]">
                  <option value="manual">Manual</option>
                  <option value="time">Timed</option>
                  <option value="questionnaire_complete">Auto</option>
                </select>
                <button onClick={() => {
                  const cards = (el.config.todo_cards || []).filter((_, i) => i !== ci);
                  updateElement(el.id, { todo_cards: cards });
                }} className="p-0.5 hover:bg-red-50 rounded shrink-0">
                  <Trash2 size={10} className="text-red-400" />
                </button>
              </div>
            ))}
            <button onClick={() => {
              const cards = [...(el.config.todo_cards || []), { id: crypto.randomUUID(), type: 'custom' as const, title: '', completion_trigger: 'manual' as const }];
              updateElement(el.id, { todo_cards: cards });
            }} className="w-full py-1.5 text-[11px] text-emerald-600 border border-dashed border-emerald-300 rounded-lg hover:bg-emerald-50">
              + Add Card
            </button>

            <label className="block text-[11px] font-medium text-stone-400 mt-3">Layout Direction</label>
            <div className="flex gap-1.5">
              {(['horizontal', 'vertical'] as const).map(dir => (
                <button key={dir} onClick={() => updateElement(el.id, { todo_layout: dir })}
                  className={`px-3 py-1 rounded-lg text-[10px] font-medium border transition-colors ${(el.config.todo_layout || 'horizontal') === dir ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-stone-200 text-stone-400 hover:bg-stone-50'}`}>
                  {dir === 'horizontal' ? 'Horizontal Scroll' : 'Vertical Stack'}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 mt-2 text-[11px] text-stone-500 cursor-pointer">
              <input type="checkbox" checked={el.config.todo_auto_scroll ?? false}
                onChange={(e) => updateElement(el.id, { todo_auto_scroll: e.target.checked })}
                className="rounded border-stone-300 text-emerald-500 focus:ring-emerald-500" />
              Auto-scroll to next unchecked
            </label>
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
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Button Radius</label>
              <div className="flex gap-1">
                {['4px', '8px', '12px', '999px'].map(r => (
                  <button key={r} onClick={() => updateElement(el.id, { button_border_radius: r })}
                    className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
                      (el.config.button_border_radius || '8px') === r
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-200 text-stone-400'
                    }`}>{r === '999px' ? 'Pill' : r}</button>
                ))}
              </div>
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
          <div className="space-y-2">
            <label className="block text-[11px] font-medium text-stone-400 mb-1">Image URL</label>
            <input type="text" value={el.config.image_url || ''} onChange={(e) => updateElement(el.id, { image_url: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200" placeholder="https://..." />
            <p className="text-[9px] text-stone-400">Paste an external URL or upload an image to your project's storage.</p>
          </div>
        )}

        {el.type === 'direct_message' && (
          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Button Label</label>
              <input type="text" value={el.config.button_label || ''} placeholder="Message Researcher"
                onChange={(e) => updateElement(el.id, { button_label: e.target.value, title: e.target.value || 'Message Researcher' })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <p className="text-[10px] text-stone-400">Opens a direct messaging panel with the research team.</p>
          </div>
        )}

        {el.type === 'ai_assistant' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Display Mode / 显示模式</label>
              <div className="flex gap-1.5">
                {(['popup', 'card'] as const).map(mode => (
                  <button key={mode} type="button"
                    onClick={() => updateElement(el.id, { ai_display_mode: mode })}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                      (el.config.ai_display_mode || 'popup') === mode
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                        : 'border-stone-200 text-stone-400 hover:border-stone-300'
                    }`}>
                    {mode === 'popup' ? 'Floating / 浮动弹窗' : 'Card / 内嵌卡片'}
                  </button>
                ))}
              </div>
            </div>
            {(el.config.ai_display_mode || 'popup') === 'popup' && (
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">Position / 位置</label>
                <div className="flex gap-1.5">
                  {(['bottom-right', 'bottom-left', 'center'] as const).map(pos => (
                    <button key={pos} type="button"
                      onClick={() => updateElement(el.id, { ai_position: pos })}
                      className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium border transition-colors ${
                        (el.config.ai_position || 'bottom-right') === pos
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                          : 'border-stone-200 text-stone-400 hover:border-stone-300'
                      }`}>
                      {pos === 'bottom-right' ? '↘ Right' : pos === 'bottom-left' ? '↙ Left' : '↓ Center'}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Button Label / 按钮文字</label>
              <input type="text" value={el.config.button_label || ''} placeholder="AI Assistant / AI 助手"
                onChange={(e) => updateElement(el.id, { button_label: e.target.value, title: e.target.value || 'AI Assistant' })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Description / 描述</label>
              <input type="text" value={el.config.content || ''} placeholder="AI can help answer questions about this study"
                onChange={(e) => updateElement(el.id, { content: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <p className="text-[10px] text-stone-400">
              {(el.config.ai_display_mode || 'popup') === 'popup'
                ? 'Displays as a floating button. Tap to open the AI chatbot.'
                : 'Displays as an inline card in the page. Tap to expand the AI chatbot.'}
            </p>
          </div>
        )}

        {el.type === 'start_date_picker' && (
          <div className="space-y-2">
            <p className="text-[10px] text-stone-400">Allows participants to choose their own study start date. The date picker will be shown as an interactive calendar.</p>
          </div>
        )}

        {el.type === 'back_button' && (
          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Button Label</label>
              <input type="text" value={el.config.button_label || ''} placeholder="Back"
                onChange={(e) => updateElement(el.id, { button_label: e.target.value, title: e.target.value || 'Back' })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <p className="text-[10px] text-stone-400">Navigates back to the previous screen.</p>
          </div>
        )}

        {/* Width control */}
        {el.type !== 'spacer' && el.type !== 'divider' && (
          <div>
            <label className="block text-[11px] font-medium text-stone-400 mb-1">Width</label>
            <div className="flex gap-1 mb-1.5">
              {WIDTH_PRESETS.map(w => (
                <button key={w.value} onClick={() => updateElement(el.id, { width: w.value })}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
                    (el.config.width || '100%') === w.value ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-200 text-stone-400 hover:border-stone-300'
                  }`}>
                  {w.label}
                </button>
              ))}
            </div>
            <input type="text" value={el.config.width || '100%'} placeholder="e.g. 100%, 200px"
              onChange={(e) => updateElement(el.id, { width: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
        )}

        {/* Height control */}
        <div>
          <label className="block text-[11px] font-medium text-stone-400 mb-1">Height</label>
          <div className="flex gap-1 mb-1.5">
            {['auto', '80px', '120px', '200px', '300px'].map(h => (
              <button key={h} onClick={() => updateElement(el.id, { style: { ...el.config.style, height: h === 'auto' ? undefined : h } })}
                className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
                  (el.config.style?.height || 'auto') === (h === 'auto' ? undefined : h) || (!el.config.style?.height && h === 'auto')
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-200 text-stone-400 hover:border-stone-300'
                }`}>
                {h}
              </button>
            ))}
          </div>
          <input type="text" value={el.config.style?.height || ''} placeholder="auto (e.g. 150px, 10rem)"
            onChange={(e) => updateElement(el.id, { style: { ...el.config.style, height: e.target.value || undefined } })}
            className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
        </div>

        {/* Content Alignment (vertical — for fixed-height cards) */}
        {el.config.style?.height && (
          <div>
            <label className="block text-[11px] font-medium text-stone-400 mb-1">Vertical Alignment</label>
            <div className="flex gap-1">
              {(['top', 'center', 'bottom'] as const).map(a => (
                <button key={a} onClick={() => updateElement(el.id, { style: { ...el.config.style, content_align: a } })}
                  className={`px-3 py-1 rounded-lg text-[10px] font-medium border transition-colors capitalize ${
                    (el.config.style?.content_align || 'top') === a ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-200 text-stone-400'
                  }`}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Text Alignment */}
        <div>
          <label className="block text-[11px] font-medium text-stone-400 mb-1">Text Alignment</label>
          <div className="flex gap-1">
            {(['left', 'center', 'right'] as const).map(a => (
              <button key={a} onClick={() => updateElement(el.id, { style: { ...el.config.style, text_align: a } })}
                className={`px-3 py-1 rounded-lg text-[10px] font-medium border transition-colors capitalize ${
                  (el.config.style?.text_align || 'left') === a ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-200 text-stone-400'
                }`}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Styling Section */}
        <details className="group">
          <summary className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider cursor-pointer select-none flex items-center gap-1.5 py-1">
            <span className="transition-transform group-open:rotate-90">▸</span>
            Advanced Styling
          </summary>
          <div className="mt-2 space-y-3 pl-1">
            {/* Background Color */}
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Background Color</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={el.config.style?.bg_color || '#ffffff'}
                  onChange={(e) => updateElement(el.id, { style: { ...el.config.style, bg_color: e.target.value } })}
                  className="w-8 h-8 rounded-lg border border-stone-200 cursor-pointer" />
                <input type="text" value={el.config.style?.bg_color || ''} placeholder="#ffffff or transparent"
                  onChange={(e) => updateElement(el.id, { style: { ...el.config.style, bg_color: e.target.value || undefined } })}
                  className="flex-1 px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200" />
                {el.config.style?.bg_color && (
                  <button onClick={() => updateElement(el.id, { style: { ...el.config.style, bg_color: undefined } })}
                    className="text-[10px] text-stone-400 hover:text-stone-600 underline">Reset</button>
                )}
              </div>
            </div>

            {/* Text Color */}
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Text Color</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={el.config.style?.text_color || '#1c1917'}
                  onChange={(e) => updateElement(el.id, { style: { ...el.config.style, text_color: e.target.value } })}
                  className="w-8 h-8 rounded-lg border border-stone-200 cursor-pointer" />
                <input type="text" value={el.config.style?.text_color || ''} placeholder="inherit"
                  onChange={(e) => updateElement(el.id, { style: { ...el.config.style, text_color: e.target.value || undefined } })}
                  className="flex-1 px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200" />
              </div>
            </div>

            {/* Padding */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-medium text-stone-400">
                  Padding: {parseInt(el.config.style?.padding || '0') || 0}px
                </label>
                {el.config.style?.padding && (
                  <button onClick={() => updateElement(el.id, { style: { ...el.config.style, padding: undefined } })}
                    className="text-[10px] text-stone-400 hover:text-stone-600 underline">Reset</button>
                )}
              </div>
              <div className="relative h-6 flex items-center">
                <div className="absolute inset-x-0 h-2 rounded-full bg-stone-100 border border-stone-200" />
                <div className="absolute left-0 h-2 rounded-full bg-emerald-400"
                  style={{ width: `${Math.min(100, (parseInt(el.config.style?.padding || '0') || 0) / 48 * 100)}%` }} />
                <input type="range" min={0} max={48} step={4}
                  value={parseInt(el.config.style?.padding || '0') || 0}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    updateElement(el.id, { style: { ...el.config.style, padding: v === 0 ? undefined : `${v}px` } });
                  }}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer" />
                <div className="absolute h-4 w-4 rounded-full bg-white border-2 border-emerald-500 shadow-sm pointer-events-none"
                  style={{ left: `calc(${Math.min(100, (parseInt(el.config.style?.padding || '0') || 0) / 48 * 100)}% - 8px)` }} />
              </div>
              <div className="flex justify-between text-[9px] text-stone-300 mt-1">
                <span>0</span><span>12</span><span>24</span><span>36</span><span>48</span>
              </div>
            </div>

            {/* Margin */}
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Margin</label>
              <div className="flex gap-1">
                {['0', '4px', '8px', '16px', '24px'].map(m => (
                  <button key={m} onClick={() => updateElement(el.id, { style: { ...el.config.style, margin: m === '0' ? undefined : m } })}
                    className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
                      (el.config.style?.margin || '0') === m || (!el.config.style?.margin && m === '0')
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-200 text-stone-400'
                    }`}>{m}</button>
                ))}
              </div>
            </div>

            {/* Border Radius */}
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Border Radius</label>
              <div className="flex gap-1">
                {['0', '4px', '8px', '12px', '16px', '24px'].map(r => (
                  <button key={r} onClick={() => updateElement(el.id, { style: { ...el.config.style, border_radius: r === '0' ? undefined : r } })}
                    className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
                      (el.config.style?.border_radius || '0') === r || (!el.config.style?.border_radius && r === '0')
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-200 text-stone-400'
                    }`}>{r}</button>
                ))}
              </div>
            </div>

            {/* Border */}
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Border</label>
              <div className="flex gap-1 flex-wrap">
                {[
                  { value: 'none', label: 'None' },
                  { value: '1px solid #e7e5e4', label: 'Light' },
                  { value: '2px solid #d6d3d1', label: 'Medium' },
                  { value: '2px solid #10b981', label: 'Accent' },
                ].map(b => (
                  <button key={b.value} onClick={() => updateElement(el.id, { style: { ...el.config.style, border: b.value === 'none' ? undefined : b.value } })}
                    className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
                      (el.config.style?.border || 'none') === b.value || (!el.config.style?.border && b.value === 'none')
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-200 text-stone-400'
                    }`}>{b.label}</button>
                ))}
              </div>
            </div>

            {/* Shadow */}
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Shadow</label>
              <div className="flex gap-1">
                {(['none', 'sm', 'md', 'lg', 'xl'] as const).map(s => (
                  <button key={s} onClick={() => updateElement(el.id, { style: { ...el.config.style, shadow: s === 'none' ? undefined : s } })}
                    className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors capitalize ${
                      (el.config.style?.shadow || 'none') === s || (!el.config.style?.shadow && s === 'none')
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-200 text-stone-400'
                    }`}>{s}</button>
                ))}
              </div>
            </div>

            {/* Opacity */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-medium text-stone-400">
                  Opacity: {Math.round((el.config.style?.opacity ?? 1) * 100)}%
                </label>
              </div>
              <div className="relative h-6 flex items-center">
                <div className="absolute inset-x-0 h-2 rounded-full bg-stone-100 border border-stone-200" />
                <div className="absolute left-0 h-2 rounded-full bg-emerald-400" 
                  style={{ width: `${Math.round((el.config.style?.opacity ?? 1) * 100)}%` }} />
                <input type="range" min={10} max={100} step={5}
                  value={Math.round((el.config.style?.opacity ?? 1) * 100)}
                  onChange={(e) => updateElement(el.id, { style: { ...el.config.style, opacity: parseInt(e.target.value) / 100 } })}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer" />
                <div className="absolute h-4 w-4 rounded-full bg-white border-2 border-emerald-500 shadow-sm pointer-events-none"
                  style={{ left: `calc(${Math.round((el.config.style?.opacity ?? 1) * 100)}% - 8px)` }} />
              </div>
            </div>

            {/* Font Size */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-medium text-stone-400">
                  {t('layout.fontSize')}: {el.config.style?.font_size || (lang === 'zh' ? '默认' : 'Default')}
                </label>
                {el.config.style?.font_size && (
                  <button onClick={() => updateElement(el.id, { style: { ...el.config.style, font_size: undefined } })}
                    className="text-[10px] text-stone-400 hover:text-stone-600 underline">Reset</button>
                )}
              </div>
              <div className="relative h-6 flex items-center">
                <div className="absolute inset-x-0 h-2 rounded-full bg-stone-100 border border-stone-200" />
                <div className="absolute left-0 h-2 rounded-full bg-emerald-400"
                  style={{ width: `${((parseInt(el.config.style?.font_size || '14') - 10) / 22) * 100}%` }} />
                <input type="range" min={10} max={32} step={1}
                  value={parseInt(el.config.style?.font_size || '14')}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    updateElement(el.id, { style: { ...el.config.style, font_size: v === 14 ? undefined : `${v}px` } });
                  }}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer" />
                <div className="absolute h-4 w-4 rounded-full bg-white border-2 border-emerald-500 shadow-sm pointer-events-none"
                  style={{ left: `calc(${((parseInt(el.config.style?.font_size || '14') - 10) / 22) * 100}% - 8px)` }} />
              </div>
              <div className="flex justify-between text-[9px] text-stone-300 mt-1">
                <span>10 XS</span><span>14 Default</span><span>20 LG</span><span>32 XL</span>
              </div>
            </div>

            {/* Font Weight */}
            <div>
              <label className="block text-[11px] font-medium text-stone-400 mb-1">Font Weight</label>
              <div className="flex gap-1 flex-wrap">
                {[
                  { value: undefined as string | undefined, label: 'Default' },
                  { value: '300', label: 'Light' },
                  { value: '400', label: 'Normal' },
                  { value: '600', label: 'Semi' },
                  { value: '700', label: 'Bold' },
                ].map(f => (
                  <button key={f.label} onClick={() => updateElement(el.id, { style: { ...el.config.style, font_weight: f.value } })}
                    className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
                      el.config.style?.font_weight === f.value || (!el.config.style?.font_weight && !f.value)
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-stone-200 text-stone-400'
                    }`}>{f.label}</button>
                ))}
              </div>
            </div>

          </div>
        </details>

        {/* Visible to section moved to top of config panel */}
      </div>
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-stone-800">{t('layout.title')}</h3>
            <p className="text-[12px] text-stone-400 font-light mt-0.5">{t('layout.subtitle')} — {lang === 'zh' ? '预览与实际应用完全一致' : 'preview is live and identical to the actual app'}</p>
          </div>
          <button onClick={() => onUpdate(getDefaultLayout(questionnaires))}
            className="text-[12px] text-stone-400 hover:text-stone-600 transition-colors px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-300">
            {t('layout.resetDefault')}
          </button>
        </div>

        <div className="flex flex-col xl:flex-row gap-4">
          {/* Left: Tab & Element List (compact) */}
          <div className="xl:w-[320px] shrink-0 space-y-3">
            {/* Theme & Global Settings — above tab editor */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
              <h5 className="text-[12px] font-semibold text-stone-600 uppercase tracking-wider">{t('layout.researchDesign')}</h5>
              
              {/* Header */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={layout.show_header !== false} onChange={(e) => onUpdate({ ...layout, show_header: e.target.checked })} className="rounded border-stone-300" />
                  <span className="text-[11px] text-stone-600 font-medium">{t('layout.showHeader')}</span>
                </label>
                {layout.show_header !== false && (
                  <>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-400 mb-1">{t('layout.headerTitle')}</label>
                      <input type="text"
                        value={layout.header_title || projectTitle || ''}
                        onChange={(e) => onUpdate({ ...layout, header_title: e.target.value })}
                        placeholder={t('layout.enterTitle')}
                        className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                      {projectTitle && (
                        <p className="text-[9px] text-stone-400 mt-1">{t('layout.syncedFromSettings')}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-400 mb-1">{t('layout.headerDesc')}</label>
                      <textarea
                        value={layout.header_description || projectDescription || ''}
                        onChange={(e) => onUpdate({ ...layout, header_description: e.target.value })}
                        placeholder={t('layout.enterDescription')}
                        rows={2}
                        className="w-full px-2.5 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none" />
                      {projectDescription && (
                        <p className="text-[9px] text-stone-400 mt-1">{t('layout.syncedFromSettings')}</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Colors */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-stone-400 mb-1">{t('layout.primaryColor')}</label>
                  <input type="color" value={layout.theme?.primary_color || '#10b981'} onChange={(e) => onUpdate({ ...layout, theme: { ...layout.theme, primary_color: e.target.value } })}
                    className="w-full h-8 rounded-lg border border-stone-200 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-400 mb-1">{t('layout.background')}</label>
                  <input type="color" value={layout.theme?.background_color || '#f5f5f4'} onChange={(e) => onUpdate({ ...layout, theme: { ...layout.theme, background_color: e.target.value } })}
                    className="w-full h-8 rounded-lg border border-stone-200 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-400 mb-1">{t('layout.cardStyle')}</label>
                  <select value={layout.theme?.card_style || 'elevated'} onChange={(e) => onUpdate({ ...layout, theme: { ...layout.theme, card_style: e.target.value as any } })}
                    className="w-full px-2 py-1.5 rounded-lg text-[12px] border border-stone-200 bg-white">
                    <option value="flat">{t('layout.flat')}</option>
                    <option value="elevated">{t('layout.elevated')}</option>
                    <option value="outlined">{t('layout.outlined')}</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200">
                <p className="text-[10px] text-stone-400">
                  <strong>{layout.tabs.length}</strong> {t('layout.tabs')} · <strong>{layout.bottom_nav.length}</strong> {t('layout.navItems')} · 
                  <strong> {layout.tabs.reduce((acc, t) => acc + t.elements.length, 0)}</strong> {t('layout.totalElements')}
                </p>
              </div>
            </div>

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
                          {getLucideIcon(tab.icon, 14, activeTabId === tab.id ? 'text-emerald-500' : 'text-stone-400')}
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
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-medium text-stone-400 mb-0.5">{t('layout.tabLabel')}</label>
                      <input type="text" value={activeTab.label} onChange={(e) => updateTab(activeTab.id, { label: e.target.value })}
                        className="w-full px-2 py-1.5 rounded-lg text-[12px] border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-stone-400 mb-0.5">{t('layout.icon')}</label>
                      <select value={activeTab.icon} onChange={(e) => updateTab(activeTab.id, { icon: e.target.value })}
                        className="w-full px-2 py-1.5 rounded-lg text-[12px] border border-stone-200 bg-white">
                        {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>
                  {layout.tabs.length > 1 && (
                    <button onClick={() => removeTab(activeTab.id)} className="p-1.5 rounded-lg hover:bg-red-50 mt-3">
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <h5 className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">{t('layout.elements')}</h5>
                  <button onClick={() => setShowAddElement(!showAddElement)}
                    className="flex items-center gap-1 text-[11px] text-emerald-500 hover:text-emerald-600 font-medium">
                    <Plus size={12} /> {t('layout.addElement')}
                  </button>
                </div>

                {showAddElement && (
                  <div className="p-2 bg-stone-50 rounded-xl border border-stone-200 space-y-2 max-h-[300px] overflow-y-auto">
                    <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">{lang === 'zh' ? '布局部件' : 'Layout Elements'}</p>
                    <div className="grid grid-cols-3 gap-1">
                      {LAYOUT_ELEMENTS.map(et => (
                        <button key={et.type} onClick={() => addElement(et.type, { title: lang === 'zh' ? et.label_zh : et.label_en })}
                          className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-white transition-colors text-[9px] border border-transparent hover:border-stone-200">
                          {getLucideIcon(et.lucideIcon, 14, 'text-stone-500')}
                          <span className="text-stone-500 font-medium">{lang === 'zh' ? et.label_zh : et.label_en}</span>
                        </button>
                      ))}
                    </div>

                    {questionnaires.filter(q => q.questionnaire_type === 'survey').length > 0 && (
                      <>
                        <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">{lang === 'zh' ? '问卷' : 'Questionnaires'}</p>
                        <div className="space-y-0.5">
                          {questionnaires.filter(q => q.questionnaire_type === 'survey').map(q => (
                            <button key={q.id} onClick={() => addQuestionnaire(q)}
                              className="w-full flex items-center gap-2 p-1.5 rounded-lg text-left transition-colors text-[11px] border border-transparent hover:bg-white hover:border-stone-200">
                              <FileText size={14} className="text-emerald-500 shrink-0" />
                              <span className="text-stone-700 font-medium truncate">{q.title}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {questionnaires.filter(q => ['consent', 'screening', 'profile', 'help', 'custom', 'onboarding'].includes(q.questionnaire_type)).length > 0 && (
                      <>
                        <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">{lang === 'zh' ? '表单与组件' : 'Forms & Components'}</p>
                        <div className="space-y-0.5">
                          {questionnaires.filter(q => ['consent', 'screening', 'profile', 'help', 'custom', 'onboarding'].includes(q.questionnaire_type)).map(q => {
                            const TypeIcon = q.questionnaire_type === 'consent' ? Shield : q.questionnaire_type === 'screening' ? ClipboardCheck : q.questionnaire_type === 'profile' ? User : q.questionnaire_type === 'help' ? HelpCircle : q.questionnaire_type === 'onboarding' ? Layers : Plus;
                            const iconColor = q.questionnaire_type === 'consent' ? 'text-amber-500' : q.questionnaire_type === 'screening' ? 'text-orange-500' : q.questionnaire_type === 'profile' ? 'text-blue-500' : q.questionnaire_type === 'help' ? 'text-violet-500' : 'text-emerald-500';
                            return (
                              <button key={q.id} onClick={() => addElement(q.questionnaire_type as any, { title: q.title, questionnaire_id: q.id })}
                                className="w-full flex items-center gap-2 p-1.5 rounded-lg text-left transition-colors text-[11px] border border-transparent hover:bg-white hover:border-stone-200">
                                <TypeIcon size={14} className={`${iconColor} shrink-0`} />
                                <span className="text-stone-700 font-medium truncate">{q.title}</span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}

                    <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                      {lang === 'zh' ? '功能部件' : 'Function Elements'}
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {FUNCTION_ELEMENTS.map(et => (
                        <button key={et.type} onClick={() => addElement(et.type, { title: lang === 'zh' ? et.label_zh : et.label_en })}
                          className="flex items-center gap-1.5 p-1.5 rounded-lg text-left hover:bg-white transition-colors text-[10px] border border-transparent hover:border-stone-200">
                          {getLucideIcon(et.lucideIcon, 14, 'text-stone-500')}
                          <span className="text-stone-600 font-medium">{lang === 'zh' ? et.label_zh : et.label_en}</span>
                        </button>
                      ))}
                    </div>

                    {/* User-customized Function Elements / 自定义功能部件 */}
                    {userFuncElements.length > 0 && (
                      <div className="border-t border-stone-200 pt-2 mt-1">
                        <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mb-1">
                          {lang === 'zh' ? '自定义功能部件' : 'Your Custom Elements'}
                        </p>
                        <div className="space-y-0.5">
                          {userFuncElements.map(ue => (
                            <button key={ue.id} onClick={() => addElement(ue.base_type, { title: lang === 'zh' ? ue.name_zh : ue.name_en })}
                              className="w-full flex items-center gap-2 p-1.5 rounded-lg text-left transition-colors text-[10px] border border-transparent hover:bg-blue-50 hover:border-blue-200">
                              {getLucideIcon(ue.icon || 'Sparkles', 14, 'text-blue-500')}
                              <span className="text-stone-700 font-medium truncate">{lang === 'zh' ? ue.name_zh : ue.name_en}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Private / Custom Elements — 定制部件 */}
                    <div className="border-t border-stone-200 pt-2 mt-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Lock size={10} className="text-amber-500" />
                        <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">
                          {lang === 'zh' ? '定制部件' : 'Custom Elements'}
                        </p>
                      </div>
                      {customElements.length > 0 ? (
                        <div className="space-y-0.5">
                          {customElements.map(ce => (
                            <button key={ce.id} onClick={() => addElement('custom_function', {
                              title: lang === 'zh' ? ce.name_zh : ce.name_en,
                              content: lang === 'zh' ? (ce.description_zh || '') : (ce.description_en || ''),
                              icon: ce.icon || 'Sparkles',
                            })}
                              className="w-full flex items-center gap-2 p-1.5 rounded-lg text-left transition-colors text-[10px] border border-transparent hover:bg-amber-50 hover:border-amber-200">
                              {getLucideIcon(ce.icon || 'Sparkles', 14, 'text-amber-500')}
                              <div className="flex-1 min-w-0">
                                <span className="text-stone-700 font-medium block truncate">{lang === 'zh' ? ce.name_zh : ce.name_en}</span>
                                {(lang === 'zh' ? ce.description_zh : ce.description_en) && (
                                  <span className="text-[9px] text-stone-400 block truncate">{lang === 'zh' ? ce.description_zh : ce.description_en}</span>
                                )}
                              </div>
                              {!ce.is_public && <Lock size={9} className="text-amber-400 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-amber-50/50 rounded-lg p-2.5 border border-amber-100 text-center">
                          <p className="text-[10px] text-stone-500 mb-1.5">
                            {lang === 'zh'
                              ? '如果现有部件无法满足您的需求，我们可以为您的研究定制专属部件。'
                              : 'Need something our standard elements can\'t do? We can build custom elements for your research.'}
                          </p>
                          <a href="mailto:guowei.jiang.work@gmail.com?subject=Custom Element Request&body=Hi, I'd like to request a custom element for my research project."
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-200 transition-colors">
                            <Mail size={10} />
                            {lang === 'zh' ? '联系我们定制' : 'Contact for Custom Build'}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Droppable droppableId={`elements-${activeTab.id}`} type="ELEMENT">
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}
                      className={`space-y-0.5 min-h-[60px] rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-emerald-50/50' : ''}`}>
                      {activeTab.elements.length === 0 ? (
                        <div className="py-6 text-center text-[11px] text-stone-400 border-2 border-dashed border-stone-200 rounded-xl">
                          {t('layout.clickAddAbove')}
                        </div>
                      ) : (
                        activeTab.elements.map((el, elIdx) => (
                          <Draggable key={el.id} draggableId={`el-${el.id}`} index={elIdx}>
                            {(provided, snapshot) => (
                              <div ref={provided.innerRef} {...provided.draggableProps}
                                className={`rounded-lg border bg-white transition-all ${
                                  snapshot.isDragging ? 'shadow-lg border-emerald-300 ring-2 ring-emerald-100' : 'border-stone-100 hover:border-stone-200'
                                } ${editingElementId === el.id ? 'border-emerald-300 ring-1 ring-emerald-100' : ''}`}>
                                <div
                                  className={`flex items-center gap-1.5 px-2 py-2 group cursor-pointer transition-colors ${editingElementId === el.id ? 'bg-emerald-50/30' : ''}`}
                                  onClick={() => setEditingElementId(editingElementId === el.id ? null : el.id)}>
                                  <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-stone-100" onClick={(e) => e.stopPropagation()}>
                                    <GripVertical size={12} className="text-stone-300" />
                                  </div>
                                   <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      {getLucideIcon(el.config.icon || getElementIcon(el.type), 12, 'text-stone-500')}
                                      <span className="text-[11px] font-medium text-stone-700 truncate">{getElementLabel(el)}</span>
                                    </div>
                                    {el.config.content && el.type !== 'text_block' && (
                                      <p className="text-[9px] text-stone-400 truncate mt-0.5 pl-[18px]">{el.config.content}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    <button onClick={(e) => { e.stopPropagation(); updateElement(el.id, { visible: !(el.config.visible !== false) }); }} className="p-0.5 hover:bg-stone-100 rounded">
                                      {el.config.visible !== false ? <Eye size={11} className="text-emerald-500" /> : <EyeOff size={11} className="text-stone-300" />}
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); removeElement(el.id); }} className="p-0.5 hover:bg-red-50 rounded">
                                      <Trash2 size={11} className="text-red-400" />
                                    </button>
                                  </div>
                                </div>
                                {/* Inline config panel — expands below the element row */}
                                {editingElementId === el.id && (
                                  <div className="border-t border-stone-100 bg-stone-50/50 p-2 xl:hidden">
                                    {renderElementConfig(el)}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )}
          </div>

          {/* Center: Live Phone Preview */}
          <div className="flex-1 flex justify-center">
            <div className="sticky top-24">
              {/* Device selector */}
              <div className="flex gap-1 bg-stone-100 rounded-full p-0.5 mb-3 justify-center flex-wrap">
                {DEVICE_PRESETS.map(d => (
                  <button key={d.id} onClick={() => setSelectedDevice(d)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${selectedDevice.id === d.id ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-500'}`}>
                    <BrandIcon brand={d.brand} size={10} />
                    {d.label}
                  </button>
                ))}
              </div>
              {/* Participant type filter */}
              {participantTypes.length > 0 && (
                <div className="flex gap-1 bg-stone-100 rounded-full p-0.5 mb-3 justify-center flex-wrap">
                  <button onClick={() => setFilterParticipantTypeId(null)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${!filterParticipantTypeId ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-500'}`}>
                    {t('layout.allRoles')}
                  </button>
                  {participantTypes.map(pt => (
                    <button key={pt.id} onClick={() => setFilterParticipantTypeId(pt.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${filterParticipantTypeId === pt.id ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-500'}`}>
                      {pt.name}
                    </button>
                  ))}
                </div>
              )}
              <AppPhonePreview
                layout={layout}
                questionnaires={questionnaires}
                participantTypes={participantTypes}
                studyDuration={studyDuration}
                activeTabId={activeTabId}
                onActiveTabChange={setActiveTabId}
                highlightedElementId={editingElementId}
                onElementClick={setEditingElementId}
                editable={true}
                onRemoveElement={removeElement}
                onUpdateElement={updateElement}
                frameWidth={selectedDevice.width}
                frameHeight={selectedDevice.height}
                filterParticipantTypeId={filterParticipantTypeId}
                onOpenAiAssistant={() => toast('AI Assistant will open here for participants', { icon: '🤖', duration: 4000 })}
                projectTitle={projectTitle}
              />
              <p className="text-[11px] text-stone-400 text-center mt-2 font-light">{selectedDevice.label} — {selectedDevice.width}×{selectedDevice.height}</p>
            </div>
          </div>

          {/* Right: Element Config Panel — shows when an element is selected */}
          <div className="hidden xl:block xl:w-[320px] shrink-0">
            {editingElement ? (
              <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-xl scrollbar-thin">
                {renderElementConfig(editingElement)}
              </div>
            ) : (
              <div className="sticky top-24">
                <div className="bg-stone-50 rounded-xl border border-dashed border-stone-200 p-6 text-center">
                  <Edit3 size={20} className="text-stone-300 mx-auto mb-2" />
                  <p className="text-[12px] text-stone-400 font-medium">{t('layout.selectElement')}</p>
                  <p className="text-[10px] text-stone-300 mt-1">{t('layout.selectElementDesc')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};

export { getDefaultLayout };
export default LayoutBuilder;
