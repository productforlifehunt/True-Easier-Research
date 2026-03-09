import React, { useState } from 'react';
import { Layout, Layers, Bell, Globe } from 'lucide-react';
import LayoutBuilder, { type AppLayout, type LayoutTab, type LayoutElement } from './LayoutBuilder';
import PopupBuilder from './PopupBuilder';
import NotificationEditor from './NotificationEditor';
import PublicPageBuilder from './PublicPageBuilder';
import type { QuestionnaireConfig } from './QuestionnaireList';
import type { ParticipantType } from './ParticipantTypeManager';

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

const SUB_TABS: { id: SubTab; label: string; labelCn: string; icon: React.ReactNode }[] = [
  { id: 'layout', label: 'Layout', labelCn: '布局', icon: <Layout size={14} /> },
  { id: 'popups', label: 'Popups', labelCn: '弹窗', icon: <Layers size={14} /> },
  { id: 'notifications', label: 'Notifications', labelCn: '通知', icon: <Bell size={14} /> },
  { id: 'public_pages', label: 'Public Pages', labelCn: '公开页面', icon: <Globe size={14} /> },
];

const LayoutTabWrapper: React.FC<LayoutTabWrapperProps> = ({
  projectId,
  layout,
  questionnaires,
  participantTypes,
  studyDuration,
  onUpdate,
  onUpdateQuestionnaire,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('layout');

  return (
    <div>
      {/* Sub-tab navigation / 子标签导航 */}
      <div className="grid grid-cols-4 gap-1 mb-5 bg-stone-100/80 rounded-xl p-1 w-full">
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeSubTab === tab.id
                ? 'bg-white text-stone-800 shadow-sm'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            {tab.icon}
            {tab.label} / {tab.labelCn}
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
        <PublicPageBuilder projectId={projectId} />
      )}
    </div>
  );
};

export default LayoutTabWrapper;
