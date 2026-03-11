import React, { useState, useCallback } from 'react';
import { Layout, Layers, Bell, Globe, MessageCircle, icons as allIcons } from 'lucide-react';
import LayoutBuilder, { type AppLayout, type LayoutTab, type LayoutElement } from './LayoutBuilder';
import PopupBuilder from './PopupBuilder';
import NotificationEditor from './NotificationEditor';
import PublicPageBuilder from './PublicPageBuilder';
import type { QuestionnaireConfig } from './QuestionnaireList';
import type { ParticipantType } from './ParticipantTypeManager';
import { useI18n } from '../hooks/useI18n';

type SubTab = 'layout' | 'popups' | 'notifications' | 'public_pages';
interface LayoutTabWrapperProps {
  projectId: string;
  layout: AppLayout;
  questionnaires: QuestionnaireConfig[];
  participantTypes: ParticipantType[];
  studyDuration: number;
  projectTitle?: string;
  projectDescription?: string;
  onUpdate: (layout: AppLayout) => void;
  onUpdateQuestionnaire?: (id: string, updates: Partial<QuestionnaireConfig>) => void;
}

const LayoutTabWrapper: React.FC<LayoutTabWrapperProps> = ({
  projectId,
  layout,
  questionnaires,
  participantTypes,
  studyDuration,
  projectTitle,
  projectDescription,
  onUpdate,
  onUpdateQuestionnaire,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('layout');
  const { t, lang } = useI18n();

  const SUB_TABS: { id: SubTab; label: string; icon: React.ReactNode }[] = [
    { id: 'layout', label: t('layout.researchDesign'), icon: <Layout size={14} /> },
    { id: 'popups', label: t('layout.popups'), icon: <Layers size={14} /> },
    { id: 'notifications', label: t('project.notifications'), icon: <Bell size={14} /> },
    { id: 'public_pages', label: t('layout.publicPages'), icon: <Globe size={14} /> },
  ];

  const aiEnabled = layout.ai_assistant_enabled ?? false;
  const aiConfig = layout.ai_assistant_config || { display_mode: 'popup' as const, position: 'bottom-right' as const };

  // Toggle project AI assistant on/off — syncs ai_assistant elements in all tabs
  const toggleProjectAi = useCallback(() => {
    const newEnabled = !aiEnabled;
    let updatedTabs = layout.tabs;

    if (newEnabled) {
      // Add ai_assistant element to each tab that doesn't already have one
      updatedTabs = layout.tabs.map(tab => {
        const hasAi = tab.elements.some(e => e.type === 'ai_assistant');
        if (hasAi) return tab;
        const aiElement: LayoutElement = {
          id: crypto.randomUUID(),
          type: 'ai_assistant',
          config: {
            visible: true,
            title: aiConfig.title || (lang === 'zh' ? 'AI 助手' : 'AI Assistant'),
            content: aiConfig.description || '',
            icon: aiConfig.icon || 'MessageCircle',
            ai_display_mode: aiConfig.display_mode,
            ai_position: aiConfig.position,
          },
          order_index: tab.elements.length,
        };
        return { ...tab, elements: [...tab.elements, aiElement] };
      });
    } else {
      // Remove ai_assistant elements from all tabs
      updatedTabs = layout.tabs.map(tab => ({
        ...tab,
        elements: tab.elements.filter(e => e.type !== 'ai_assistant'),
      }));
    }

    onUpdate({
      ...layout,
      tabs: updatedTabs,
      ai_assistant_enabled: newEnabled,
      ai_assistant_config: aiConfig,
    });
  }, [aiEnabled, layout, aiConfig, onUpdate, lang]);

  // Update AI config at project level
  const updateAiConfig = useCallback((updates: Partial<typeof aiConfig>) => {
    const newConfig = { ...aiConfig, ...updates };
    // Also update config on all existing ai_assistant elements
    const updatedTabs = layout.tabs.map(tab => ({
      ...tab,
      elements: tab.elements.map(e => {
        if (e.type !== 'ai_assistant') return e;
        return {
          ...e,
          config: {
            ...e.config,
            ai_display_mode: newConfig.display_mode,
            ai_position: newConfig.position,
            ...(updates.title !== undefined ? { title: updates.title } : {}),
            ...(updates.description !== undefined ? { content: updates.description } : {}),
            ...(updates.icon !== undefined ? { icon: updates.icon } : {}),
          },
        };
      }),
    }));
    onUpdate({
      ...layout,
      tabs: updatedTabs,
      ai_assistant_config: newConfig,
    });
  }, [aiConfig, layout, onUpdate]);

  const AiIconComp = (allIcons as any)[aiConfig.icon || 'MessageCircle'] || MessageCircle;

  return (
    <div>
      {/* Project-level AI Assistant Toggle / 项目级 AI 助手开关 */}
      <div className="mb-3 p-3 rounded-xl border border-stone-200 bg-stone-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${aiEnabled ? 'bg-emerald-500' : 'bg-stone-300'}`}>
              <AiIconComp size={14} className="text-white" />
            </div>
            <div>
              <span className="text-[12px] font-medium text-stone-700">
                {lang === 'zh' ? '项目 AI 助手' : 'Project AI Assistant'}
              </span>
              <p className="text-[10px] text-stone-400">
                {lang === 'zh' ? '启用后自动添加到所有页面' : 'Auto-added to all tabs when enabled'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleProjectAi}
            className={`relative w-10 h-5.5 rounded-full transition-colors ${aiEnabled ? 'bg-emerald-500' : 'bg-stone-300'}`}
          >
            <span className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${aiEnabled ? 'left-5' : 'left-0.5'}`} />
          </button>
        </div>

        {/* Compact config when enabled */}
        {aiEnabled && (
          <div className="mt-3 pt-3 border-t border-stone-200 space-y-2">
            <div className="flex gap-1.5">
              {(['popup', 'card'] as const).map(mode => (
                <button key={mode} type="button"
                  onClick={() => updateAiConfig({ display_mode: mode })}
                  className={`flex-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium border transition-colors ${
                    aiConfig.display_mode === mode
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                      : 'border-stone-200 text-stone-400 hover:border-stone-300'
                  }`}>
                  {mode === 'popup'
                    ? (lang === 'zh' ? '浮动弹窗' : 'Floating')
                    : (lang === 'zh' ? '内嵌卡片' : 'Card')}
                </button>
              ))}
            </div>
            {aiConfig.display_mode === 'popup' && (
              <div className="flex gap-1.5">
                {(['bottom-right', 'bottom-left', 'center'] as const).map(pos => (
                  <button key={pos} type="button"
                    onClick={() => updateAiConfig({ position: pos })}
                    className={`flex-1 px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
                      aiConfig.position === pos
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                        : 'border-stone-200 text-stone-400 hover:border-stone-300'
                    }`}>
                    {pos === 'bottom-right' ? '↘' : pos === 'bottom-left' ? '↙' : '↓'}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sub-tab navigation / 子标签导航 */}
      <div className="grid grid-cols-4 gap-1 mb-5 bg-stone-100/80 rounded-xl p-1 w-full">
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeSubTab === tab.id
                ? 'bg-white text-stone-800 shadow-sm'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content / 内容 */}
      {activeSubTab === 'layout' && (
        <LayoutBuilder
          layout={layout}
          questionnaires={questionnaires}
          participantTypes={participantTypes}
          studyDuration={studyDuration}
          projectTitle={projectTitle}
          projectDescription={projectDescription}
          onUpdate={onUpdate}
          onUpdateQuestionnaire={onUpdateQuestionnaire}
        />
      )}

      {activeSubTab === 'popups' && (
        <PopupBuilder
          projectId={projectId}
          questionnaires={questionnaires}
        />
      )}

      {activeSubTab === 'notifications' && (
        <NotificationEditor
          projectId={projectId}
          questionnaires={questionnaires}
          participantTypes={participantTypes}
        />
      )}

      {activeSubTab === 'public_pages' && (
        <PublicPageBuilder projectId={projectId} questionnaires={questionnaires} />
      )}
    </div>
  );
};

export default LayoutTabWrapper;
